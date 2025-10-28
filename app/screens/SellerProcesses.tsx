import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { useWindowDimensions, View } from "react-native";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import Colors from "../../constants/Colors";
import { TabBar, TabView } from "react-native-tab-view";
import { useAuth } from "../context/AuthContext";
import ProcessesList from "../../components/ProcessesList";
import OrderRequestsList from "../../components/OrderRequestsList";
const ProcessesRoute = ({ navigation }: { navigation: any }) => {
    return (
        <ProcessesList navigation={navigation} isSeller={true}/>
    )
}
const IncomingRequestsRoute = ({ navigation }: { navigation: any }) => {
    return (
        <OrderRequestsList isSeller={true} navigation={navigation}/>
    )
}

type SellerProcessesProps = NativeStackScreenProps<RootStackParamList, "SellerProcesses">;
export default function SellerProcesses({ navigation, route }: SellerProcessesProps) {
    const layout = useWindowDimensions()
    const [index, setIndex] = useState(0)
    const { theme } = useTheme()
    const backgroundColor = theme == "dark" ? Colors.darkBackground : Colors.lightBackground
    const selectedColor = theme == "dark" ? "white" : "black"
    const unselectedColor = theme == "dark" ? Colors.offWhite : Colors.darkGray
    const routes = [
        { key: 'Ongoing', title: 'Ongoing Processes' },
        { key: 'Incoming', title: 'Incoming Requests' },
    ];
    return (
        <View style={{ flex: 1 }}>
            <TabView
                style={{ flex: 1 }}
                navigationState={{ index, routes }}
                renderScene={({ route }) => {
                    switch (route.key) {
                        case 'Ongoing':
                            return <ProcessesRoute navigation={navigation} />;
                        case 'Incoming':
                            return <IncomingRequestsRoute navigation={navigation} />;
                        default:
                            return null;
                    }
                }}
                onIndexChange={setIndex}
                initialLayout={{ width: layout.width }}
                renderTabBar={(props) => (
                    <TabBar
                        {...props}
                        activeColor={selectedColor}
                        inactiveColor={unselectedColor}
                        scrollEnabled={false}
                        indicatorStyle={{ backgroundColor: Colors.green }}
                        style={{ backgroundColor: backgroundColor }}
                    />
                )}
            />
        </View>
    );
}