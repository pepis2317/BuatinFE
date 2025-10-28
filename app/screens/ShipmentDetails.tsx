import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamList } from "../../constants/RootStackParams"
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native"
import TopBar from "../../components/TopBar"
import { useEffect, useState } from "react"
import { ShipmentResponse } from "../../types/ShipmentResponse"
import axios from "axios"
import { API_URL } from "../../constants/ApiUri"
import { BiteshipTrackResponse } from "../../types/BIteshipTrackResponse"
import ColoredButton from "../../components/ColoredButton"
import TextInputComponent from "../../components/TextInputComponent"
import { BiteshipRatesResponse } from "../../types/BiteshipRatesResponse"
import ConfirmedModal from "../../components/ConfirmedModal"
import WebView from "react-native-webview"
import PaymentModal from "../../components/PaymentModal"

type ShipmentDetailsProps = NativeStackScreenProps<RootStackParamList, "ShipmentDetails">
export default function ShipmentDetails({ navigation, route }: ShipmentDetailsProps) {
    const [loading, setLoading] = useState(false)
    const [showWalletModal, setShowWalletModal] = useState(false)
    const [showPayment, setShowPayment] = useState(false)
    const [snapUrl, setSnapUrl] = useState('')
    const [showSnapFailed, setShowSnapFailed] = useState(false)
    const [showSnapPaid, setShowSnapPaid] = useState(false)
    const [shipment, setShipment] = useState<ShipmentResponse>()
    const [rates, setRates] = useState<BiteshipRatesResponse>()
    const [tracking, setTracking] = useState<BiteshipTrackResponse>()
    const [courierCompany, setCourierCompany] = useState('')
    const [courierType, setCourierType] = useState('')
    const [orderNote, setOrderNote] = useState('')
    const [originNote, setOriginNote] = useState('')
    const [destinationNote, setDestinationNote] = useState('')
    const { shipmentId } = route.params
    const fetchShipment = async () => {
        try {
            const response = await axios.get(`${API_URL}/get-shipment?shipmentId=${shipmentId}`)
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const fetchRates = async () => {
        try {
            const response = await axios.get(`${API_URL}/get-rates?shipmentId=${shipmentId}&couriers=jne`)
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
    const walletPay = async (amount: number) => {
        try {
            const response = await axios.post(`${API_URL}/pay-shipment`, {
                shipmentId: shipmentId,
                method: "Wallet",
                amount: amount * 100,
                courierCompany: courierCompany,
                courierType: courierType,
                orderNote: orderNote,
                originNote: originNote,
                destinationNote: destinationNote
            })
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const snapPay = async (amount: number) => {
        try {
            const response = await axios.post(`${API_URL}/pay-shipment`, {
                shipmentId: shipmentId,
                method: "Snap",
                amount: amount * 100,
                courierCompany: courierCompany,
                courierType: courierType,
                orderNote: orderNote,
                originNote: originNote,
                destinationNote: destinationNote
            })
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const handleWalletPay = async () => {
        if (rates) {
            const price = rates.pricing.find(r => r.courier_service_code == courierType)
            if (price) {
                setLoading(true)
                const result = await walletPay(price.price)
                if (!result.error) {
                    setShowWalletModal(true)
                }
                setLoading(false)
            }
        }
    }
    const handleSnapPay = async () => {
        if (rates) {
            const price = rates.pricing.find(r => r.courier_service_code == courierType)
            if (price) {
                setLoading(true)
                const result = await snapPay(price.price)
                if (!result.error) {
                    setSnapUrl(result.redirectUrl)
                }
                setLoading(false)
            }
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
    const handleFetchRates = async () => {
        if (shipment) {
            setLoading(true)
            const result = await fetchRates()
            if (!result.error) {
                setRates(result)
            }
            setLoading(false)
        }
    }
    const handleCloseModal = async () => {
        handleFetch()
        setShowWalletModal(false)
        setShowSnapPaid(false)
        setShowSnapFailed(false)
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
    useEffect(() => {
        handleFetch()
    }, [])
    useEffect(() => {
        if (shipment && shipment.status == "Sent") {
            handleFetchTracking()
        } else if (shipment && shipment.status == "Pending") {
            handleFetchRates()
        }
    }, [shipment])
    useEffect(() => {
        if (snapUrl != '') {
            setShowPayment(true)
        }
    }, [snapUrl])

    return (
        <View>
            <TopBar title={"Shipment Details"} showBackButton />
            <ConfirmedModal visible={showWalletModal} message={"Paid with wallet type shi"} onPress={() => handleCloseModal()} />
            <ConfirmedModal visible={showSnapPaid} message={"Paid with snap type shi"} onPress={() => handleCloseModal()} />
            <ConfirmedModal visible={showSnapFailed} message={"Failed with snap type shi"} onPress={() => handleCloseModal()} />
            <PaymentModal showPayment={showPayment} snapUrl={snapUrl}
                closePaymentModal={() => setShowPayment(false)}
                onSuccess={() => {
                    setShowPayment(false);
                    setShowSnapPaid(true)
                }} onFailed={() => {
                    setShowPayment(false);
                    setShowSnapFailed(true)
                }} onLoadEnd={() => setLoading(false)} />
            {rates ?
                <View>
                    {rates.pricing.map((item, index) => (
                        <View key={index}>
                            <Text>{item.courier_service_name}</Text>
                            <Text>{item.shipping_fee}</Text>
                            <Text>{item.description}</Text>
                        </View>
                    ))}
                </View>
                : <></>}
            {shipment && shipment.status == "Pending" ?
                <View>
                    <TextInputComponent placeholder="CourierCompany" onChangeText={setCourierCompany} />
                    <TextInputComponent placeholder="CourierType" onChangeText={setCourierType} />
                    <TextInputComponent placeholder="OrderNote" onChangeText={setOrderNote} />
                    <TextInputComponent placeholder="OriginNote" onChangeText={setOriginNote} />
                    <TextInputComponent placeholder="DestinationNote" onChangeText={setDestinationNote} />
                    <ColoredButton title={"Pay with Snap"} onPress={() => handleSnapPay()} isLoading={loading} />
                    <ColoredButton title={"Pay with Wallet"} onPress={() => handleWalletPay()} isLoading={loading} />
                </View>
                : <></>}

            {shipment && shipment.status == "Paid" ?
                <View>
                    <Text>
                        awaiting seller to send shipment
                    </Text>
                </View> : <></>}
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
const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center" },
    payButton: {
        backgroundColor: "#007AFF",
        padding: 15,
        borderRadius: 8,
    },
    payText: { color: "white", fontWeight: "600" },

    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "white",
        borderRadius: 12,
        width: "90%",
        height: "80%",
        overflow: "hidden",
    },
    header: {
        height: 50,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 15,
    },
    closeText: { color: "#007AFF", fontSize: 16 },
    title: { fontWeight: "600", fontSize: 16 },
    loader: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(255,255,255,0.7)",
        justifyContent: "center",
        alignItems: "center",
    },
});