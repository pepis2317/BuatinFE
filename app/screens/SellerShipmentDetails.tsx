import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { View, Text } from "react-native";
import { useEffect, useState } from "react";
import { ShipmentResponse } from "../../types/ShipmentResponse";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import ColoredButton from "../../components/ColoredButton";
import ConfirmedModal from "../../components/ConfirmedModal";
import { BiteshipTrackResponse } from "../../types/BIteshipTrackResponse";
import TopBar from "../../components/TopBar";

type SellerShipmentProps = NativeStackScreenProps<RootStackParamList, "SellerShipmentDetails">
export default function SellerShipmentDetails({ navigation, route }: SellerShipmentProps) {
    const { shipmentId } = route.params
    const [shipment, setShipment] = useState<ShipmentResponse>()
    const [tracking, setTracking] = useState<BiteshipTrackResponse>()
    const [loading, setLoading] = useState(false)
    const [showSent, setShowSent] = useState(false)
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
        <View>
            <TopBar title={"Shipment Details"} showBackButton />
            <ConfirmedModal visible={showSent} message={"Sent"} onPress={() => handleClose()} />
            <Text>
                {shipment?.name}
                {shipment?.status}
            </Text>
            {shipment && shipment.status == "Paid" ? <ColoredButton title={"Send shipment"} onPress={() => handleSend()} isLoading={loading}/> : <></>}
            {tracking ?
                <View>
                    {tracking.items.map((item, index) => (
                        <View key={index}>
                            <Text>{item.name}</Text>
                            <Text>{item.category}</Text>
                            <Text>{item.description}</Text>
                        </View>
                    ))}
                    {tracking.courier.history.map((item, index) => (
                        <View key={index}>
                            <Text>{item.status}</Text>
                            <Text>{item.note}</Text>
                        </View>
                    ))}
                </View>
                : <></>}
        </View>
    )
}