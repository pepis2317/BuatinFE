import { TouchableOpacity, View, StyleSheet, Text, Pressable } from "react-native";
import { ShipmentResponse } from "../types/ShipmentResponse";
import { useTheme } from "../app/context/ThemeContext";
import Colors from "../constants/Colors";
import { useAuth } from "../app/context/AuthContext";
import { Box, Truck } from "lucide-react-native";

export default function ShipmentComponent({ shipment, navigation, isSeller}: { shipment: ShipmentResponse, navigation: any, isSeller: boolean}) {
    const { textColor, subtleBorderColor, borderColor } = useTheme()

    const handleNavigation = () => {
        if (!isSeller) {
            navigation.navigate('ShipmentDetails', { shipmentId: shipment.shipmentId })
        } else {
            navigation.navigate('SellerShipmentDetails', { shipmentId: shipment.shipmentId })
        }
    }
    return (
        <Pressable style={[styles.container, { borderColor: subtleBorderColor }]} onPress={() => handleNavigation()}>
            <View style={styles.left}>
                <View style={{ backgroundColor: subtleBorderColor, aspectRatio: 1, padding: 10, borderRadius: 100, borderWidth: 1, borderColor: borderColor }}>
                    <Box color={textColor} />
                </View>
                <View style={styles.leftContent}>
                    <View style={styles.nameRow}>
                        <Text style={{ color: textColor, fontWeight: "bold" }}>
                            {shipment.name}
                        </Text>
                    </View>
                    <Text style={[styles.comment, { color: textColor, fontSize: 12 }]}>{shipment.status}</Text>
                </View>
            </View>
        </Pressable>
    )
}
const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        borderBottomWidth: 1
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