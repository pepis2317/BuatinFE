import { TouchableOpacity, View, StyleSheet, Text } from "react-native";
import { ShipmentResponse } from "../types/ShipmentResponse";
import { useTheme } from "../app/context/ThemeContext";
import Colors from "../constants/Colors";
import { useAuth } from "../app/context/AuthContext";

export default function ShipmentComponent({ shipment, navigation }: { shipment: ShipmentResponse, navigation: any }) {
    const { theme } = useTheme()
    var textColor = theme == "dark" ? "white" : "black"
    const {user} = useAuth()
    const handleNavigation = () => {
        if(user?.role == "User"){
            navigation.navigate('ShipmentDetails', { shipmentId: shipment.shipmentId })
        }else{
            navigation.navigate('SellerShipmentDetails', { shipmentId: shipment.shipmentId })
        }
    }
    return (
        <TouchableOpacity style={[styles.container]} onPress={() => handleNavigation()}>
            <View style={styles.left}>
                <View style={styles.leftContent}>
                    <View style={styles.nameRow}>
                        <Text style={{ color: textColor, fontWeight: "bold" }}>
                            {shipment.name}
                        </Text>
                    </View>
                    <Text style={[styles.comment, { color: textColor }]}>{shipment.status}</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        borderBottomWidth: 1,
        borderBottomColor: Colors.darkGray
    },
    left: {
        flex: 1,
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    leftContent: {
        flex: 1,
        minWidth: 0,
    },
    nameRow: {
        flexDirection: "row",
        gap: 5,
        flexWrap: "wrap",
    },
    comment: {
        flexShrink: 1,
        flexWrap: "wrap",
    },
    right: {
        width: 5,
        alignSelf: "stretch"
    },
    pfp: {
        width: 50,
        aspectRatio: 1,
        borderRadius: 50,
    },
});