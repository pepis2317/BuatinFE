import { useCallback, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';
import { SEC_KEYS } from '../constants/SecureKeys';
import { registerPushTokenOnServer } from './registerPushTokenOnServer';

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export function useNotificationsToggle(authToken: string | null) {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [busy, setBusy] = useState(false);

  // Read local toggle on mount
  const readInitial = useCallback(async () => {
    const val = await SecureStore.getItemAsync(SEC_KEYS.NOTIF_ENABLED);
    setEnabled(val === '1');
  }, []);

  useEffect(() => {
    readInitial();
  }, [readInitial]);

  const enable = useCallback(async (): Promise<boolean> => {
    if (!authToken) {
      Alert.alert('You must be logged in to enable notifications.');
      return false;
    }

    try {
      setBusy(true);

      if (!Device.isDevice) {
        Alert.alert('Notifications only work on a physical device.');
        return false;
      }

      // 1) Request permission
      let { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const req = await Notifications.requestPermissionsAsync();
        status = req.status;
      }
      if (status !== 'granted') {
        Alert.alert('Permission was not granted');
        return false;
      }

      // 2) Android channel
      await ensureAndroidChannel();

      // 3) Get Expo push token (needs EAS project id)
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ||
        Constants.easConfig?.projectId ||
        process.env.EXPO_PUBLIC_EAS_PROJECT_ID;

      if (!projectId) {
        Alert.alert('Missing EAS projectId for push notifications.');
        return false;
      }

      const tokenResp = await Notifications.getExpoPushTokenAsync({ projectId });
      const token = tokenResp.data;

      // 4) Save locally
      await SecureStore.setItemAsync(SEC_KEYS.NOTIF_ENABLED, '1');
      await SecureStore.setItemAsync(SEC_KEYS.EXPO_PUSH_TOKEN, token);

      // 5) Register with backend (using authToken)
      await registerPushTokenOnServer(token, authToken);

      setEnabled(true);
      return true;
    } catch (e: any) {
      console.warn('Enable notifications failed:', e?.message || e);
      Alert.alert('Failed to enable notifications');
      return false;
    } finally {
      setBusy(false);
    }
  }, [authToken]);

  const disable = useCallback(async (): Promise<boolean> => {
    if (!authToken) {
      Alert.alert('You must be logged in to disable notifications.');
      return false;
    }

    try {
      setBusy(true);

      // Unregister on backend (set null)
      await registerPushTokenOnServer(null, authToken);

      // Clear local state
      await SecureStore.setItemAsync(SEC_KEYS.NOTIF_ENABLED, '0');
      await SecureStore.deleteItemAsync(SEC_KEYS.EXPO_PUSH_TOKEN);

      setEnabled(false);
      return true;
    } catch (e: any) {
      console.warn('Disable notifications failed:', e?.message || e);
      Alert.alert('Failed to disable notifications');
      return false;
    } finally {
      setBusy(false);
    }
  }, [authToken]);

  const toggle = useCallback(async () => {
    if (busy) return;
    if (enabled) {
      const ok = await disable();
      if (!ok) setEnabled(true);
    } else {
      const ok = await enable();
      if (!ok) setEnabled(false);
    }
  }, [busy, enabled, enable, disable]);

  return { enabled, toggle, busy };
}
