import {
    BottomTabNavigationOptions,
    createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import UserHome from '../app/screens/UserHome';
import Profile from '../app/screens/Profile';
import SellerHome from '../app/screens/SellerHome';
import { Anvil, Edit, House, User } from 'lucide-react-native';
import { useTheme } from '../app/context/ThemeContext';
import SellerDetails from '../app/screens/SellerDetails';
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
import OrderRequest from '../app/screens/OrderRequest';
import Processes from '../app/screens/Processes';
import OrderRequestDetails from '../app/screens/OrderRequestDetails';
import SellerProcesses from '../app/screens/SellerProcesses';
import AddStep from '../app/screens/AddStep';
import EditStep from '../app/screens/EditStep';
import SellerProcessDetails from '../app/screens/SellerProcessDetails';
import ProcessDetails from '../app/screens/ProcessDetails';
import CreateProcess from '../app/screens/CreateProcess';
import AcceptAndPay from '../app/screens/AcceptAndPay';
import CreateRefundRequest from '../app/screens/CreateRefundRequest';
import Wallet from '../app/screens/Wallet';
import Deposit from '../app/screens/Deposit';
import Withdraw from '../app/screens/Withdraw';
const UserTab = createBottomTabNavigator<RootStackParamList>()
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
    const processesTabOptions: BottomTabNavigationOptions = {
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: false,
        tabBarStyle: {
            paddingBottom: 8,
            paddingTop: 8,
            backgroundColor: bgColor,
        },
        tabBarIcon: () => (
            <Anvil color={iconColor} />
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
        <UserTab.Navigator screenOptions={{ animation: "none", tabBarButton: (props) => <Pressable {...(props as any)} android_ripple={{ color: 'transparent' }} /> }}>
            <UserTab.Screen name="HomeTab" component={HomeStackScreen} options={homeTabOptions} />
            <UserTab.Screen name="ProcessesTab" component={ProcessesStackScreen} options={processesTabOptions}/>
            <UserTab.Screen name="ProfileTab" component={ProfileStackScreen} options={profileTabOptions} />
        </UserTab.Navigator>
    );
}

const SellerTab = createBottomTabNavigator<RootStackParamList>();
export function SellerTabs() {
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
     const processesTabOptions: BottomTabNavigationOptions = {
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: false,
        tabBarStyle: {
            paddingBottom: 8,
            paddingTop: 8,
            backgroundColor: bgColor,
        },
        tabBarIcon: () => (
            <Anvil color={iconColor} />
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
        <SellerTab.Navigator>
            <SellerTab.Screen name="SellerHome" component={SellerHome} options={homeTabOptions} />
            <SellerTab.Screen name="Processes" component={ProcessesStackScreen} options={processesTabOptions}/>
            <SellerTab.Screen name="SellerProcessesTab" component={SellerProcessesStackScreen} options={processesTabOptions}/>
            <SellerTab.Screen name="Profile" component={Profile} options={profileTabOptions} />
        </SellerTab.Navigator>
    );
}

const HomeStack = createNativeStackNavigator<RootStackParamList>()
function HomeStackScreen() {
    return (
        <HomeStack.Navigator>
            <HomeStack.Screen name="UserHome" component={UserHome} options={{ headerShown: false }} />
            <HomeStack.Screen name="SearchPage" component={SearchPage} options={{ headerShown: false }} />
            <HomeStack.Screen name="SellerDetails" component={SellerDetails} options={{ headerShown: false }} />
            <HomeStack.Screen name="Settings" component={Settings} options={{ headerShown: false }} />
            <HomeStack.Screen name="PostDetails" component={PostDetails} options={{ headerShown: false, animation: 'none' }} />
            <HomeStack.Screen name="Notifications" component={Notifications} options={{ headerShown: false }} />
            <HomeStack.Screen name="Comments" component={Comments} options={{ headerShown: false }} />
            <HomeStack.Screen name="OrderRequest" component={OrderRequest} options={{ headerShown: false }}/>
            <HomeStack.Screen name="Wallet" component={Wallet} options={{ headerShown: false }}/>
            <HomeStack.Screen name="Deposit" component={Deposit} options={{ headerShown: false }}/>
            <HomeStack.Screen name="Withdraw" component={Withdraw} options={{ headerShown: false }}/>
        </HomeStack.Navigator>
    )
}
const ProcessesStack = createNativeStackNavigator<RootStackParamList>()
function ProcessesStackScreen(){
    return(
        <ProcessesStack.Navigator>
            <ProcessesStack.Screen name="Processes" component={Processes} options={{ headerShown: false }}/>
            <ProcessesStack.Screen name="OrderRequestDetails" component={OrderRequestDetails} options={{ headerShown: false }}/>
            <ProcessesStack.Screen name="ProcessDetails" component={ProcessDetails} options={{ headerShown: false }}/>
            <ProcessesStack.Screen name="AcceptAndPay" component={AcceptAndPay} options={{ headerShown: false }}/>
            <ProcessesStack.Screen name="CreateRefundRequest" component={CreateRefundRequest} options ={{headerShown: false}}/>
        </ProcessesStack.Navigator>
    )
}
const SellerProcessesStack = createNativeStackNavigator<RootStackParamList>()
function SellerProcessesStackScreen(){
    return(
        <SellerProcessesStack.Navigator>
            <SellerProcessesStack.Screen name="SellerProcesses" component={SellerProcesses} options={{headerShown:false}}/>
            <SellerProcessesStack.Screen name="OrderRequestDetails" component={OrderRequestDetails} options={{ headerShown: false }}/>
            <SellerProcessesStack.Screen name="CreateProcess" component={CreateProcess} options={{headerShown:false}}/>
            <SellerProcessesStack.Screen name="SellerProcessDetails" component={SellerProcessDetails} options={{ headerShown: false }}/>
            <SellerProcessesStack.Screen name="EditStep" component={EditStep}options={{ headerShown: false }}/>
            <SellerProcessesStack.Screen name="AddStep" component={AddStep}options={{ headerShown: false }}/>
        </SellerProcessesStack.Navigator>
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
