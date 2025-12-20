import { useEffect, useState, useCallback } from "react";
import { ScrollView, Text, Switch, View, StyleSheet, Platform, Alert, } from "react-native";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { useTheme } from "../context/ThemeContext";
import TopBar from "../../components/TopBar";
import { useAuth } from "../context/AuthContext";
import { registerPushTokenOnServer } from "../../hooks/registerPushTokenOnServer"; // (token|null, authToken)
import { SEC_KEYS } from "../../constants/SecureKeys";
import colors from "../../constants/Colors";

export const USER_LOCATION_KEY = "user_location";

async function ensureAndroidChannel() {
	if (Platform.OS !== "android") return;
	await Notifications.setNotificationChannelAsync("default", {
		name: "Default",
    	importance: Notifications.AndroidImportance.DEFAULT,
  	});
}

export default function Settings() {
	const { theme, toggleTheme } = useTheme();
	const [isSaved, setSaved] = useState(false);

	// Notifications state moved here:
	const [notifEnabled, setNotifEnabled] = useState<boolean>(false);
	const [notifBusy, setNotifBusy] = useState<boolean>(false);

	const { onGetUserToken } = useAuth();

	// Location toggle
	const getCurrentLocation = async () => {
    	let { status } = await Location.requestForegroundPermissionsAsync();
    	if (status !== "granted") {
      		console.log("Permission to access location was denied");
      	return;
    }
    const location = await Location.getCurrentPositionAsync({});
    await SecureStore.setItemAsync(USER_LOCATION_KEY, JSON.stringify(location));
};

const getSavedLocation = useCallback(async () => {
	const location = await SecureStore.getItemAsync(USER_LOCATION_KEY);
    setSaved(!!location);
}, []);

const handleLocationToggle = async () => {
	if (!isSaved) {
		await getCurrentLocation();
		setSaved(true);
    } else {
		await SecureStore.deleteItemAsync(USER_LOCATION_KEY);
		setSaved(false);
    }
};

// Notifications helpers
const readNotifInitial = useCallback(async () => {
    const val = await SecureStore.getItemAsync(SEC_KEYS.NOTIF_ENABLED);
    setNotifEnabled(val === "1");
}, []);

const enableNotifications = useCallback(async (): Promise<boolean> => {
	try {
		setNotifBusy(true);

    	const authToken = await onGetUserToken!();
    	if (!Device.isDevice) {
        	Alert.alert("Notifications only work on a physical device.");
        	return false;
      	}

      	// 1) Permission
      	let { status } = await Notifications.getPermissionsAsync();
      	if (status !== "granted") {
        	const req = await Notifications.requestPermissionsAsync();
        	status = req.status;
      	}
      	if (status !== "granted") {
        	Alert.alert("Permission was not granted");
        	return false;
      	}

      	// 2) Android channel
      	await ensureAndroidChannel();

      	// 3) Get Expo push token (needs projectId)
      	const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId || process.env.EXPO_PUBLIC_EAS_PROJECT_ID;

      	if (!projectId) {
	        Alert.alert("Missing EAS projectId for push notifications.");
        	return false;
      	}

      	const tokenResp = await Notifications.getExpoPushTokenAsync({ projectId, });
      	const token = tokenResp.data;

      	// 4) Persist locally
      	await SecureStore.setItemAsync(SEC_KEYS.NOTIF_ENABLED, "1");
      	await SecureStore.setItemAsync(SEC_KEYS.EXPO_PUSH_TOKEN, token);

      	// 5) Register on server
      	await registerPushTokenOnServer(token, authToken);

      	setNotifEnabled(true);
      	return true;
    } catch (e: any) {
    	console.warn("Enable notifications failed:", e?.message || e);
    	Alert.alert("Failed to enable notifications");
    	return false;
    } finally {
    	setNotifBusy(false);
    }
}, [onGetUserToken]);

const disableNotifications = useCallback(async (): Promise<boolean> => {
    try {
    	setNotifBusy(true);

      	const authToken = await onGetUserToken?.();
      	if (!authToken) {
        	Alert.alert("You must be logged in to disable notifications.");
        	return false;
      	}

      	// Unregister on server
      	await registerPushTokenOnServer(null, authToken);

      	// Clear local state
      	await SecureStore.setItemAsync(SEC_KEYS.NOTIF_ENABLED, "0");
      	await SecureStore.deleteItemAsync(SEC_KEYS.EXPO_PUSH_TOKEN);

      	setNotifEnabled(false);
      	return true;
    } catch (e: any) {
      	console.warn("Disable notifications failed:", e?.message || e);
      	Alert.alert("Failed to disable notifications");
      	return false;
    } finally {
      	setNotifBusy(false);
    }
  }, [onGetUserToken]);

const toggleNotif = useCallback(async () => {
    if (notifBusy) return;
    if (notifEnabled) {
    	const ok = await disableNotifications();
		if (!ok) setNotifEnabled(true); // rollback
    } else {
		const ok = await enableNotifications();
		if (!ok) setNotifEnabled(false); // rollback
    }
}, [notifBusy, notifEnabled, enableNotifications, disableNotifications]);

useEffect(() => { getSavedLocation(); }, [getSavedLocation]);
useEffect(() => { readNotifInitial(); }, [readNotifInitial]);

return (
	<View>
		
		<TopBar title={"Settings"} showBackButton={true} />
      	
        <View style={theme == "dark" ? styles.darkOption : styles.lightOption}>
          	<Text style={theme == "dark" ? { color: "white" } : {}}>Change Theme</Text>
			<Switch
            	trackColor={{ false: "#767577", true: colors.green }}
            	thumbColor={"white"}
            	onValueChange={toggleTheme}
            	value={theme == "dark"}
          	/>
        </View>

        <View style={theme == "dark" ? styles.darkOption : styles.lightOption}>
        	<Text style={theme == "dark" ? { color: "white" } : {}}>Location Sharing</Text>
          	<Switch
            	trackColor={{ false: "#767577", true: colors.green }}
            	thumbColor={"white"}
            	onValueChange={handleLocationToggle}
            	value={isSaved}
          	/>
        </View>

        <View style={theme == "dark" ? styles.darkOption : styles.lightOption}>
          	<Text style={theme == "dark" ? { color: "white" } : {}}>Enable Notifications</Text>
          	<Switch
				trackColor={{ false: "#767577", true: colors.green }}
				thumbColor={"white"}
				onValueChange={toggleNotif}
				value={notifEnabled}
				disabled={notifBusy}
          	/>
        </View>

    </View>
  );
}

const styles = StyleSheet.create({
	darkOption: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: 24,
		paddingVertical: 12,
		alignItems: "center",
		borderBottomWidth: 1,
		borderColor: colors.darkGray,
  	},
  	lightOption: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: 24,
		paddingVertical: 12,
		alignItems: "center",
		borderBottomWidth: 1,
		borderColor: colors.offWhite,
  	},	
});
