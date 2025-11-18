import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { TouchableOpacity, useWindowDimensions, View, Text, StyleSheet } from "react-native";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import Colors from "../../constants/Colors";
import { TabBar, TabView } from "react-native-tab-view";
import ProcessesList from "../../components/ProcessesList";
import OrderRequestsList from "../../components/OrderRequestsList";
import { Anvil } from "lucide-react-native";
const ProcessesRoute = ({ navigation }: { navigation: any }) => {
    return (
        <View>
            <ProcessesList navigation={navigation} isSeller={true} />
        </View>
    )
}
const IncomingRequestsRoute = ({ navigation }: { navigation: any }) => {
    return (
        <OrderRequestsList isSeller={true} navigation={navigation} />
    )
}

type SellerProcessesProps = NativeStackScreenProps<RootStackParamList, "SellerProcesses">;
export default function SellerProcesses({ navigation, route }: SellerProcessesProps) {
    const layout = useWindowDimensions()
    const [index, setIndex] = useState(0)
    const { theme } = useTheme()
    const color = theme == "dark" ? "white" : "black"
    const backgroundColor = theme == "dark" ? Colors.darkBackground : Colors.lightBackground
    const selectedColor = theme == "dark" ? "white" : "black"
    const unselectedColor = theme == "dark" ? Colors.offWhite : Colors.darkGray
    const routes = [
        { key: 'Ongoing', title: 'Ongoing Processes' },
        { key: 'Incoming', title: 'Incoming Requests' },
    ];
    return (
        <View style={{ flex: 1 }}>
            <View style={{margin:20, marginTop:10, marginBottom:0}}>
                <TouchableOpacity style={styles.button} onPress={()=>navigation.navigate('SellerOutgoingProcesses')}>
                    <Anvil color={color} />
                    <Text style={{ color: color, fontWeight:'bold' }}>View My Outgoing Processes</Text>
                </TouchableOpacity>
            </View>
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
const styles = StyleSheet.create({
    button: {
        backgroundColor: Colors.green,
        flexDirection: 'row',
        gap: 5,
        padding: 5,
        paddingHorizontal: 10,
        alignItems: 'center',
        borderRadius: 5
    }
})