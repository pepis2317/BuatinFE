import {
    BottomTabNavigationOptions,
    createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import UserHome from '../app/screens/UserHome';
import Profile from '../app/screens/Profile';
import ProducerHome from '../app/screens/ProducerHome';
import { House, User } from 'lucide-react-native';
import { useTheme } from '../app/context/ThemeContext';
import ProducerDetails from '../app/screens/ProducerDetails';
import SearchPage from '../app/screens/SearchPage';
import Settings from '../app/screens/Settings';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Notification from '../app/screens/Notifications';
import Notifications from '../app/screens/Notifications';
import { RootStackParamList } from '../constants/RootStackParams';
import CreatePost from '../app/screens/CreatePost';
import { Pressable } from 'react-native';
import PostDetails from '../app/screens/PostDetails';
import Colors from '../constants/Colors';
import Comments from '../app/screens/Comments';
const UserTab = createBottomTabNavigator()
export function UserTabs() {
    const { theme } = useTheme()
    const bgColor = theme == "dark" ? Colors.darkGray : 'white'
    const iconColor = theme != "dark" ? 'black' : 'white'
    const homeTabOptions: BottomTabNavigationOptions = {
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: false,
        tabBarStyle: {
            paddingBottom: 8,
            paddingTop: 8,
            backgroundColor: bgColor,
        },
        tabBarIcon: () => (
            <House color={iconColor} />
        ),
    };
    const profileTabOptions: BottomTabNavigationOptions = {
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
            paddingBottom: 8,
            paddingTop: 8,
            backgroundColor: bgColor
        },
        tabBarIcon: () => (
            <User color={iconColor} />
        ),
    }
    return (
        <UserTab.Navigator screenOptions={{ animation: "none", tabBarButton: (props) => <Pressable {...props} android_ripple={{ color: 'transparent' }} /> }}>
            <UserTab.Screen name="HomeTab" component={HomeStackScreen} options={homeTabOptions} />
            <UserTab.Screen name="ProfileTab" component={ProfileStackScreen} options={profileTabOptions} />
        </UserTab.Navigator>
    );
}

const ProducerTab = createBottomTabNavigator<RootStackParamList>();
export function ProducerTabs() {
    const { theme, toggleTheme } = useTheme()
    const bgColor = theme == "dark" ? Colors.darkGray : 'white'
    const iconColor = theme != "dark" ? Colors.darkGray : 'white'
    const homeTabOptions: BottomTabNavigationOptions = {
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: false,
        tabBarStyle: {
            paddingBottom: 8,
            paddingTop: 8,
            backgroundColor: bgColor
        },
        tabBarIcon: () => (
            <House color={iconColor} />
        ),
    };
    const profileTabOptions: BottomTabNavigationOptions = {
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: false,
        tabBarStyle: {
            paddingBottom: 8,
            paddingTop: 8,
            backgroundColor: bgColor
        },
        tabBarIcon: ({ color, size }) => (
            <User color={iconColor} />
        ),
    }
    return (
        <ProducerTab.Navigator>
            <ProducerTab.Screen name="ProducerHome" component={ProducerHome} options={homeTabOptions} />
            <ProducerTab.Screen name="CreatePost" component={CreatePost} options={homeTabOptions} />
            <ProducerTab.Screen name="Profile" component={Profile} options={profileTabOptions} />
        </ProducerTab.Navigator>
    );
}

const HomeStack = createNativeStackNavigator<RootStackParamList>()
function HomeStackScreen() {
    return (
        <HomeStack.Navigator>
            <HomeStack.Screen name="UserHome" component={UserHome} options={{ headerShown: false }} />
            <HomeStack.Screen name="SearchPage" component={SearchPage} options={{ headerShown: false }} />
            <HomeStack.Screen name="ProducerDetails" component={ProducerDetails} options={{ headerShown: false }} />
            <HomeStack.Screen name="Settings" component={Settings} options={{ headerShown: false }} />
            <HomeStack.Screen name="PostDetails" component={PostDetails} options={{ headerShown: false, animation: 'none' }} />
            <HomeStack.Screen name="Notifications" component={Notifications} options={{ headerShown: false }} />
            <HomeStack.Screen name="Comments" component={Comments} options={{ headerShown: false }} />
        </HomeStack.Navigator>
    )
}
const ProfileStack = createNativeStackNavigator<RootStackParamList>();
function ProfileStackScreen() {
    return (
        <ProfileStack.Navigator>
            <ProfileStack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
            {/* Add more screens if needed for profile-related pages */}
        </ProfileStack.Navigator>
    );
}
