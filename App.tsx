import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Platform, useColorScheme, View } from 'react-native';
import AuthProvider, { useAuth } from './app/context/AuthContext';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import Login from './app/screens/Login';
import ThemeProvider, { useTheme } from './app/context/ThemeContext';
import { SellerTabs, UserTabs } from './components/BottomTabNavigator';
import { RootStackParamList } from './constants/RootStackParams';
import Register from './app/screens/Register';
import { useEffect } from 'react';
import * as SystemUI from 'expo-system-ui';
import * as NavigationBar from 'expo-navigation-bar';
import { SignalRProvider } from './app/context/SignalRContext';

const Stack = createNativeStackNavigator<RootStackParamList>()
function SignalRWithAuth() {
  const { onGetUserToken } = useAuth();

  return (
    <SignalRProvider
      getUserToken={onGetUserToken!}
      onReconnected={async (conn) => {
        // Example: tell server to rejoin user’s conversation groups
        // await conn.invoke("JoinAllMyConversations");
      }}
    >
      <ThemeProvider>
        <Layout />
      </ThemeProvider>
    </SignalRProvider>
  );
}
export default function App() {
  return (
    <AuthProvider>
      <SignalRWithAuth />
    </AuthProvider>
  );
}
export function Layout() {
  const { authState, user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const scheme = useColorScheme();

  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: '#222831',
      text: '#ffffff',
    },

  };
  const customLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: 'white',
    },
  }
  useEffect(() => {
    const rootBg = theme === 'dark' ? '#121212' : '#ffffff';
    if (Platform.OS === 'android') {
      const buttons = theme === 'dark' ? 'light' : 'dark';
      NavigationBar.setBackgroundColorAsync(rootBg);
      NavigationBar.setButtonStyleAsync(buttons);
    }
  }, [theme]);
  const navigationTheme = theme === "dark" ? customDarkTheme : customLightTheme;
  return (
    <View style={{backgroundColor:'red', flex:1}}>
      <NavigationContainer theme={navigationTheme}>
        <View style={{ height: 32, backgroundColor: navigationTheme.colors.background }} />
        <StatusBar style={theme == "dark" ? "light" : "dark"} />
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: navigationTheme.colors.card },
            headerTintColor: navigationTheme.colors.text,
            contentStyle: { backgroundColor: navigationTheme.colors.background },
            animation: 'none'
          }}
        >
          {authState?.authenticated && user ? (

            user.role === "User" ? (
              <Stack.Screen name="UserTabs" component={UserTabs} options={{ headerShown: false }} />
            ) : (
              <Stack.Screen name="SellerTabs" component={SellerTabs} options={{ headerShown: false }} />
            )

          ) : (
            <>
              <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
              <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
            </>

          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>

  )
}