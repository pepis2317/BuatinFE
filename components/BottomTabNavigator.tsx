import {
    BottomTabNavigationOptions,
    createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import UserHome from '../app/screens/UserHome';
import Profile from '../app/screens/Profile';
import { Anvil, House, MessageCircle, Truck, User } from 'lucide-react-native';
import { useTheme } from '../app/context/ThemeContext';
import SellerDetails from '../app/screens/SellerDetails';
import SearchPage from '../app/screens/SearchPage';
import Settings from '../app/screens/Settings';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Notifications from '../app/screens/Notifications';
import { RootStackParamList } from '../constants/RootStackParams';
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
import ReviewSeller from '../app/screens/ReviewSeller';
import ReviewUser from '../app/screens/ReviewUser';
import Shipments from '../app/screens/Shipments';
import ShipmentDetails from '../app/screens/ShipmentDetails';
import CreateShipment from '../app/screens/CreateShipment';
import SellerShipments from '../app/screens/SellerShipments';
import SellerShipmentDetails from '../app/screens/SellerShipmentDetails';
import Shippable from '../app/screens/Shippable';
import Conversations from '../app/screens/Conversations';
import Chat from '../app/screens/Chat';
import EditSeller from '../app/screens/EditSeller';
import CreatePost from '../app/screens/CreatePost';
import SellerReviews from '../app/screens/SellerReviews';
import EditReview from '../app/screens/EditReview';
import EditComment from '../app/screens/EditComment';
import EditPost from '../app/screens/EditPost';
import UserDetails from '../app/screens/UserDetails';
import UserReviews from '../app/screens/UserReviews';
import SellerOutgoingProcesses from '../app/screens/SellerOutgoingProcesses';
import SellerIncomingShipments from '../app/screens/SellerIncomingShipments';
import SelectLocation from '../app/screens/SelectLocation';
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
    const ShipmentsTabOptions: BottomTabNavigationOptions = {
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
            paddingBottom: 8,
            paddingTop: 8,
            backgroundColor: bgColor
        },
        tabBarIcon: () => (
            <Truck color={iconColor} />
        ),
    }
    const ChatTabOptions: BottomTabNavigationOptions = {
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
            paddingBottom: 8,
            paddingTop: 8,
            backgroundColor: bgColor
        },
        tabBarIcon: () => (
            <MessageCircle color={iconColor} />
        ),
    }
    return (
        <UserTab.Navigator screenOptions={{ animation: "none", tabBarButton: (props) => <Pressable {...(props as any)} android_ripple={{ color: 'transparent' }} /> }}>
            <UserTab.Screen name="HomeTab" component={HomeStackScreen} options={homeTabOptions} />
            <UserTab.Screen name="ProcessesTab" component={ProcessesStackScreen} options={processesTabOptions} />
            <UserTab.Screen name="ShipmentsTab" component={ShipmentsStackScreen} options={ShipmentsTabOptions} />
            <UserTab.Screen name="ChatTab" component={ChatStackScreen} options={ChatTabOptions} />
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
    const ShipmentsTabOptions: BottomTabNavigationOptions = {
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
            paddingBottom: 8,
            paddingTop: 8,
            backgroundColor: bgColor
        },
        tabBarIcon: () => (
            <Truck color={iconColor} />
        ),
    }
    const ChatTabOptions: BottomTabNavigationOptions = {
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
            paddingBottom: 8,
            paddingTop: 8,
            backgroundColor: bgColor
        },
        tabBarIcon: () => (
            <MessageCircle color={iconColor} />
        ),
    }
    return (
        <SellerTab.Navigator>
            <SellerTab.Screen name="HomeTab" component={HomeStackScreen} options={homeTabOptions} />
            <SellerTab.Screen name="SellerProcessesTab" component={SellerProcessesStackScreen} options={processesTabOptions} />
            <SellerTab.Screen name="SellerShipmentsTab" component={SellerShipmentsStackScreen} options={ShipmentsTabOptions} />
            <SellerTab.Screen name="ChatTab" component={ChatStackScreen} options={ChatTabOptions} />
            <SellerTab.Screen name="ProfileTab" component={ProfileStackScreen} options={profileTabOptions} />
        </SellerTab.Navigator>
    );
}
const ChatStack = createNativeStackNavigator<RootStackParamList>()
function ChatStackScreen() {
    return (
        <ChatStack.Navigator>
            <ChatStack.Screen name="Conversations" component={Conversations} options={{ headerShown: false }} />
            <ChatStack.Screen name="Chat" component={Chat} options={{ headerShown: false }} />
        </ChatStack.Navigator>
    )
}
const ShipmentsStack = createNativeStackNavigator<RootStackParamList>()
function ShipmentsStackScreen() {
    return (
        <ShipmentsStack.Navigator>
            <ShipmentsStack.Screen name="Shipments" component={Shipments} options={{ headerShown: false }} />
            <ShipmentsStack.Screen name="ShipmentDetails" component={ShipmentDetails} options={{ headerShown: false }} />
        </ShipmentsStack.Navigator>
    )
}

const SellerShipmentsStack = createNativeStackNavigator<RootStackParamList>()
function SellerShipmentsStackScreen() {
    return (
        <SellerShipmentsStack.Navigator>
            <SellerShipmentsStack.Screen name="SellerShipments" component={SellerShipments} options={{ headerShown: false }} />
            <SellerShipmentsStack.Screen name="SellerIncomingShipments" component={SellerIncomingShipments} options={{ headerShown: false }} />
            <SellerShipmentsStack.Screen name="Shippable" component={Shippable} options={{ headerShown: false }} />
            <SellerShipmentsStack.Screen name="UserReviews" component={UserReviews} options={{ headerShown: false }} />
            <SellerShipmentsStack.Screen name="EditReview" component={EditReview} options={{ headerShown: false }} />
            <SellerShipmentsStack.Screen name="Comments" component={Comments} options={{ headerShown: false }} />
            <SellerShipmentsStack.Screen name="ReviewUser" component={ReviewUser} options={{ headerShown: false }} />
            <SellerShipmentsStack.Screen name="CreateShipment" component={CreateShipment} options={{ headerShown: false }} />
            <SellerShipmentsStack.Screen name="SellerShipmentDetails" component={SellerShipmentDetails} options={{ headerShown: false }} />
            <SellerShipmentsStack.Screen name="ShipmentDetails" component={ShipmentDetails} options={{ headerShown: false }} />
        </SellerShipmentsStack.Navigator>
    )
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
            <HomeStack.Screen name="OrderRequest" component={OrderRequest} options={{ headerShown: false }} />
            <HomeStack.Screen name="Wallet" component={Wallet} options={{ headerShown: false }} />
            <HomeStack.Screen name="Deposit" component={Deposit} options={{ headerShown: false }} />
            <HomeStack.Screen name="Withdraw" component={Withdraw} options={{ headerShown: false }} />
            <HomeStack.Screen name="EditSeller" component={EditSeller} options={{ headerShown: false }} />
            <HomeStack.Screen name="CreatePost" component={CreatePost} options={{ headerShown: false }} />
            <HomeStack.Screen name="SellerReviews" component={SellerReviews} options={{ headerShown: false }} />
            <HomeStack.Screen name="EditReview" component={EditReview} options={{ headerShown: false }} />
            <HomeStack.Screen name="ReviewSeller" component={ReviewSeller} options={{ headerShown: false }} />
            <HomeStack.Screen name="EditComment" component={EditComment} options={{ headerShown: false }} />
            <HomeStack.Screen name="EditPost" component={EditPost} options={{ headerShown: false }} />
            <HomeStack.Screen name="UserDetails" component={UserDetails} options={{ headerShown: false }} />
            <HomeStack.Screen name="UserReviews" component={UserReviews} options={{ headerShown: false }} />
            <HomeStack.Screen name="ReviewUser" component={ReviewUser} options={{ headerShown: false }} />
        </HomeStack.Navigator>
    )
}
const ProcessesStack = createNativeStackNavigator<RootStackParamList>()
function ProcessesStackScreen() {
    return (
        <ProcessesStack.Navigator>
            <ProcessesStack.Screen name="Processes" component={Processes} options={{ headerShown: false }} />
            <ProcessesStack.Screen name="OrderRequestDetails" component={OrderRequestDetails} options={{ headerShown: false }} />
            <ProcessesStack.Screen name="ProcessDetails" component={ProcessDetails} options={{ headerShown: false }} />
            <ProcessesStack.Screen name="AcceptAndPay" component={AcceptAndPay} options={{ headerShown: false }} />
            <ProcessesStack.Screen name="UserDetails" component={UserDetails} options={{ headerShown: false }} />
            <ProcessesStack.Screen name="UserReviews" component={UserReviews} options={{ headerShown: false }} />
            <ProcessesStack.Screen name="SellerDetails" component={SellerDetails} options={{ headerShown: false }} />
            <ProcessesStack.Screen name="SellerReviews" component={SellerReviews} options={{ headerShown: false }} />
            <ProcessesStack.Screen name="Comments" component={Comments} options={{ headerShown: false }} />
            <ProcessesStack.Screen name="CreateRefundRequest" component={CreateRefundRequest} options={{ headerShown: false }} />
            <ProcessesStack.Screen name="ReviewSeller" component={ReviewSeller} options={{ headerShown: false }} />
            <ProcessesStack.Screen name="PostDetails" component={PostDetails} options={{ headerShown: false }} />
            <ProcessesStack.Screen name="ReviewUser" component={ReviewUser} options={{ headerShown: false }} />
            <ProcessesStack.Screen name="EditReview" component={EditReview} options={{ headerShown: false }} />
        </ProcessesStack.Navigator>
    )
}
const SellerProcessesStack = createNativeStackNavigator<RootStackParamList>()
function SellerProcessesStackScreen() {
    return (
        <SellerProcessesStack.Navigator>
            <SellerProcessesStack.Screen name="SellerProcesses" component={SellerProcesses} options={{ headerShown: false }} />
            <SellerProcessesStack.Screen name="SellerOutgoingProcesses" component={SellerOutgoingProcesses} options={{ headerShown: false }} />
            <SellerProcessesStack.Screen name="ProcessDetails" component={ProcessDetails} options={{ headerShown: false }} />
            <SellerProcessesStack.Screen name="OrderRequestDetails" component={OrderRequestDetails} options={{ headerShown: false }} />
            <SellerProcessesStack.Screen name="AcceptAndPay" component={AcceptAndPay} options={{ headerShown: false }} />
            <SellerProcessesStack.Screen name="CreateProcess" component={CreateProcess} options={{ headerShown: false }} />
            <SellerProcessesStack.Screen name="CreateRefundRequest" component={CreateRefundRequest} options={{ headerShown: false }} />
            <SellerProcessesStack.Screen name="SellerProcessDetails" component={SellerProcessDetails} options={{ headerShown: false }} />
            <SellerProcessesStack.Screen name="ReviewSeller" component={ReviewSeller} options={{ headerShown: false }} />
            <SellerProcessesStack.Screen name="EditStep" component={EditStep} options={{ headerShown: false }} />
            <SellerProcessesStack.Screen name="AddStep" component={AddStep} options={{ headerShown: false }} />
            <SellerProcessesStack.Screen name="ReviewUser" component={ReviewUser} options={{ headerShown: false }} />
            <SellerProcessesStack.Screen name="UserDetails" component={UserDetails} options={{ headerShown: false }} />
            <SellerProcessesStack.Screen name="EditReview" component={EditReview} options={{ headerShown: false }} />
            <SellerProcessesStack.Screen name="UserReviews" component={UserReviews} options={{ headerShown: false }} />
            <SellerProcessesStack.Screen name="PostDetails" component={PostDetails} options={{ headerShown: false }} />
            <SellerProcessesStack.Screen name="SellerDetails" component={SellerDetails} options={{ headerShown: false }} />
            <SellerProcessesStack.Screen name="SellerReviews" component={SellerReviews} options={{ headerShown: false }} />
            <SellerProcessesStack.Screen name="Comments" component={Comments} options={{ headerShown: false }} />
        </SellerProcessesStack.Navigator>
    )
}
const ProfileStack = createNativeStackNavigator<RootStackParamList>();
function ProfileStackScreen() {
    return (
        <ProfileStack.Navigator>
            <ProfileStack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
            <ProfileStack.Screen name="SelectLocation" component={SelectLocation} options={{ headerShown: false }} />
        </ProfileStack.Navigator>
    );
}
