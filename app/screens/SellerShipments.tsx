import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamList } from "../../constants/RootStackParams"
import { ActivityIndicator, FlatList, RefreshControl, TouchableOpacity, View, Text, StyleSheet, useWindowDimensions } from "react-native"
import { useTheme } from "../context/ThemeContext"
import ColoredButton from "../../components/ColoredButton"
import ShipmentsList from "../../components/ShipmentsList"
import Colors from "../../constants/Colors"
import { Box, Truck } from "lucide-react-native"
import { TabBar, TabView } from "react-native-tab-view"
import { useState } from "react"
import ShippableList from "../../components/ShippableList"
const ShipmentsRoute = ({ navigation }: { navigation: any }) => {
    return (
        <View>
            <ShipmentsList navigation={navigation} isSeller={true} />
        </View>
    )
}
const ShippableRoute = ({ navigation }: { navigation: any }) => {
    return (
        <View>
            <ShippableList navigation={navigation}/>
        </View>
        // <OrderRequestsList isSeller={true} navigation={navigation} />
    )
}
type SellerShipmentsProps = NativeStackScreenProps<RootStackParamList, "SellerShipments">
export default function SellerShipments({ navigation, route }: SellerShipmentsProps) {
    const layout = useWindowDimensions()
    const [index, setIndex] = useState(0)
    const { theme } = useTheme()
    const color = theme == "dark" ? "white" : "black"
    const backgroundColor = theme == "dark" ? Colors.darkBackground : Colors.lightBackground
    const selectedColor = theme == "dark" ? "white" : "black"
    const unselectedColor = theme == "dark" ? Colors.offWhite : Colors.darkGray
    const routes = [
        { key: 'Shipments', title: 'Shipments' },
        { key: 'Shippable', title: 'Shippable Processes' },
    ];
    return (
        <View style={{ flex: 1 }}>
            <View style={{ margin: 20, marginTop: 10, marginBottom: 0 }}>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SellerIncomingShipments')}>
                    <Truck color={color} />
                    <Text style={{ color: color, fontWeight: 'bold' }}>View My Incoming Shipments</Text>
                </TouchableOpacity>
            </View>
            <TabView
                style={{ flex: 1 }}
                navigationState={{ index, routes }}
                renderScene={({ route }) => {
                    switch (route.key) {
                        case 'Shipments':
                            return <ShipmentsRoute navigation={navigation} />;
                        case 'Shippable':
                            return <ShippableRoute navigation={navigation} />;
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