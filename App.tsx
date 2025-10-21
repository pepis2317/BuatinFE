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
import * as NavigationBar from 'expo-navigation-bar';

const Stack = createNativeStackNavigator<RootStackParamList>()
export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Layout />
      </ThemeProvider>
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
    if (Platform.OS !== 'android') return;

    const bg = theme === 'dark' ? '#121212' : '#ffffff';
    const buttons = theme === 'dark' ? 'light' : 'dark';

    // Set nav bar color + icon style
    NavigationBar.setBackgroundColorAsync(bg);
    NavigationBar.setButtonStyleAsync(buttons);

    // Optional: prevent Android from auto-inverting for contrast
    // NavigationBar.setVisibilityAsync('visible');
    // NavigationBar.setBehaviorAsync('inset-swipe');
  }, [theme]);
  const navigationTheme = theme === "dark" ? customDarkTheme : customLightTheme;
  return (
    <NavigationContainer theme={navigationTheme}>
      <View style={theme == "dark" ? { height: 32 } : { height: 32, backgroundColor: 'white' }} />
      <StatusBar style={theme == "dark" ? "light" : "dark"} />
      <Stack.Navigator screenOptions={{
        headerStyle: {
          backgroundColor: '#222831'
        },
        animation: 'none'
      }}>
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
  )
}