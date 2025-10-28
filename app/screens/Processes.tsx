import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { useWindowDimensions, View, Text, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import Colors from "../../constants/Colors";
import TopBar from "../../components/TopBar";
import { TabBar, TabView } from "react-native-tab-view";
import { OrderRequestResponse } from "../../types/OrderRequestResponse";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import OrderRequestComponent from "../../components/OrderRequestComponent";
import { TicketPlus } from "lucide-react-native";
import { ProcessResponse } from "../../types/ProcesssResponse";
import ProcessComponent from "../../components/ProcessComponent";
import { useFocusEffect } from "@react-navigation/native";
import ProcessesList from "../../components/ProcessesList";
import OrderRequestsList from "../../components/OrderRequestsList";
const ProcessesRoute = ({ navigation }: { navigation: any }) => {
    return (
        <ProcessesList navigation={navigation} isSeller={false}/>
    )
}
const RequestsRoute = ({ navigation }: { navigation: any }) => {
    return (
        <OrderRequestsList isSeller={false} navigation={navigation}/>
    )
}
type ProcessesProps = NativeStackScreenProps<RootStackParamList, "Processes">;
export default function Processes({ navigation, route }: ProcessesProps) {
    const layout = useWindowDimensions()
    const [index, setIndex] = useState(0)
    const { theme } = useTheme()
    const backgroundColor = theme == "dark" ? Colors.darkBackground : Colors.lightBackground
    const selectedColor = theme == "dark" ? "white" : "black"
    const unselectedColor = theme == "dark" ? Colors.offWhite : Colors.darkGray
    const routes = [
        { key: 'Processes', title: 'Processes' },
        { key: 'Requests', title: 'Requests' },
    ];
    return (
        <View style={{ flex: 1 }}>
            <TabView
                style={{ flex: 1 }}
                navigationState={{ index, routes }}
                renderScene={({ route }) => {
                    switch (route.key) {
                        case 'Processes':
                            return <ProcessesRoute navigation={navigation} />;
                        case 'Requests':
                            return <RequestsRoute navigation={navigation} />;
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