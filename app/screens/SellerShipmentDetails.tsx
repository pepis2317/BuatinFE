import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { ShipmentResponse } from "../../types/ShipmentResponse";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import ColoredButton from "../../components/ColoredButton";
import ConfirmedModal from "../../components/ConfirmedModal";
import { BiteshipTrackResponse } from "../../types/BIteshipTrackResponse";
import TopBar from "../../components/TopBar";
import { useTheme } from "../context/ThemeContext";
import Colors from "../../constants/Colors";

type SellerShipmentProps = NativeStackScreenProps<RootStackParamList, "SellerShipmentDetails">
export default function SellerShipmentDetails({ navigation, route }: SellerShipmentProps) {
    const { shipmentId } = route.params
    const [shipment, setShipment] = useState<ShipmentResponse>()
    const [tracking, setTracking] = useState<BiteshipTrackResponse>()
    const [loading, setLoading] = useState(false)
    const [showSent, setShowSent] = useState(false)
    const { textColor, subtleBorderColor } = useTheme()
    const fetchShipment = async () => {
        try {
            const response = await axios.get(`${API_URL}/get-shipment?shipmentId=${shipmentId}`)
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const sendShipment = async () => {
        try {
            const response = await axios.put(`${API_URL}/send-shipment`, {
                shipmentId: shipmentId
            })
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const fetchTracking = async (orderId: string) => {
        try {
            const response = await axios.get(`${API_URL}/track-order?orderId=${orderId}`)
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const handleFetch = async () => {
        setLoading(true)
        const result = await fetchShipment()
        if (!result.error) {
            setShipment(result)
        }
        setLoading(false)
    }
    const handleSend = async () => {
        setLoading(true)
        const result = await sendShipment()
        if (!result.error) {
            setShowSent(true)
        }
        setLoading(false)
    }
    const handleFetchTracking = async () => {
        if (shipment) {
            setLoading(true)
            const result = await fetchTracking(shipment.orderId)
            if (!result.error) {
                setTracking(result)
            }
            setLoading(false)
        }
    }
    const handleClose = async () => {
        setShowSent(false)
        setShipment(undefined)
        handleFetch()
    }
    useEffect(() => {
        handleFetch()
    }, [])
    useEffect(() => {
        if (shipment && shipment.status == "Sent") {
            handleFetchTracking()
        }
    }, [shipment])
    return (
        <View style={{ flex: 1 }}>
            <TopBar title={"Shipment Details"} showBackButton />
            <ConfirmedModal isFail={false} visible={showSent} message={"Sent"} onPress={() => handleClose()} />
            <ScrollView>
                {shipment ?
                    <View style={{ padding: 20 }}>
                        <View style={[styles.shipmentContainer, { backgroundColor: subtleBorderColor }]}>
                            <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>{shipment.name}</Text>
                            <View style={{ marginBottom: 10 }}>
                                <Text style={{ color: textColor, fontWeight: 'bold' }}>Description:</Text>
                                <Text style={{ color: textColor }}>{shipment.description}</Text>
                            </View>
                            <View style={{ marginBottom: 10 }}>
                                <Text style={{ color: textColor, fontWeight: 'bold' }}>Category:</Text>
                                <Text style={{ color: textColor }}>{shipment.category}</Text>
                            </View>
                            <View style={{ marginBottom: 10 }}>
                                <Text style={{ color: textColor, fontWeight: 'bold' }}>Quantity:</Text>
                                <Text style={{ color: textColor }}>{shipment.quantity}</Text>
                            </View>
                            <View style={{ marginBottom: 10 }}>
                                <Text style={{ color: textColor, fontWeight: 'bold' }}>Dimensions (Height x Width x Length):</Text>
                                <Text style={{ color: textColor }}>{shipment.height} x {shipment.width} x {shipment.length}</Text>
                            </View>
                            <View style={{ marginBottom: 10 }}>
                                <Text style={{ color: textColor, fontWeight: 'bold' }}>Weight:</Text>
                                <Text style={{ color: textColor }}>{shipment.weight}</Text>
                            </View>

                            {shipment.status == "Pending" ? <Text style={{ color: textColor }}>Awaiting buyer to pay for shipping fee</Text> : <></>}
                            {shipment.status == "Paid" ? <Text style={{ color: textColor }}>Buyer has paid the shipping fee</Text> : <></>}
                            {shipment.status == "Sent" ? <Text style={{ color: textColor }}>Item is being sent to buyer</Text> : <></>}
                        </View>
                        {shipment.status == "Paid" ? <ColoredButton title={"Send Shipment to Buyer"} style={{ backgroundColor: Colors.green }} onPress={() => handleSend()} isLoading={loading} /> : <></>}
                        {tracking ?
                            <View style={{ marginTop: 20 }}>
                                <Text style={{ color: textColor, fontWeight: 'bold', marginBottom: 5 }}>Tracking History</Text>
                                {tracking.courier.history.map((item, index) => (
                                    <View key={index} style={[styles.history, { backgroundColor: subtleBorderColor }]}>
                                        <View style={{ marginBottom: 5, flexDirection: 'row' }}>
                                            <Text style={{ color: textColor, fontWeight: 'bold' }}>Status:</Text>
                                            <Text style={{ color: textColor }}> {item.status}</Text>
                                        </View>
                                        <Text style={{ color: textColor }}>{item.note}</Text>
                                    </View>
                                ))}
                            </View>
                            : <></>}
                    </View>
                    : <ActivityIndicator size="large" style={{ height: 64, margin: 10, borderRadius: 5 }} color={textColor} />}
            </ScrollView>
        </View>
    )
}
const styles = StyleSheet.create({
    shipmentContainer: {
        padding: 10,
        borderRadius: 10
    },
    history: {
        padding: 10,
        borderRadius: 10,
    }
})