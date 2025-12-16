import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamList } from "../../constants/RootStackParams"
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Platform, KeyboardAvoidingView } from "react-native"
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
import Colors from "../../constants/Colors"
import { useTheme } from "../context/ThemeContext"
import ErrorComponent from "../../components/ErrorComponent"

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
    const [hasPressedSnap, setHasPressedSnap] = useState(false)
    const [courierType, setCourierType] = useState('')
    const [orderNote, setOrderNote] = useState('')
    const [errMessage, setErrMessage] = useState('')
    const { shipmentId } = route.params
    const { textColor, subtleBorderColor } = useTheme()
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
                courierCompany: "jne",
                courierType: courierType,
                orderNote: orderNote,
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
                courierCompany: "jne",
                courierType: courierType,
                orderNote: orderNote,
            })
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const handleWalletPay = async () => {
        if (!courierType) {
            setErrMessage("Courier type must be selected")
            return
        }
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
        if (!courierType) {
            setErrMessage("Courier type must be selected")
            return
        }
        if (rates) {
            const price = rates.pricing.find(r => r.courier_service_code == courierType)
            if (price) {
                setHasPressedSnap(true)
                const result = await snapPay(price.price)
                if (!result.error) {
                    if (result.paymentStatus == "Posted") {
                        setShowSnapPaid(true)
                    } else {
                        setSnapUrl(result.redirectUrl)
                    }
                }
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
        <View style={{ flex: 1 }}>
            <TopBar title={"Shipment Details"} showBackButton />
            <ConfirmedModal isFail={false} visible={showWalletModal} message={"Paid with wallet"} onPress={() => handleCloseModal()} />
            <ConfirmedModal isFail={false} visible={showSnapPaid} message={"Paid with snap"} onPress={() => handleCloseModal()} />
            <ConfirmedModal isFail={true} visible={showSnapFailed} message={"Failed with snap"} onPress={() => handleCloseModal()} />
            <PaymentModal showPayment={showPayment} snapUrl={snapUrl}
                closePaymentModal={() => setShowPayment(false)}
                onSuccess={() => {
                    setShowPayment(false);
                    setShowSnapPaid(true)
                }} onFailed={() => {
                    setShowPayment(false);
                    setShowSnapFailed(true)
                }} onLoadEnd={() => setLoading(false)} />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={50}>
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
                                {shipment.status == "Paid" ? <Text style={{ color: textColor }}>Awaiting seller to send item</Text> : <></>}
                                {shipment.status == "Sent" ? <Text style={{ color: textColor }}>Item is being sent to buyer</Text> : <></>}
                            </View>
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

                            {shipment.status == "Pending" ?
                                <View>
                                    {rates ?
                                        <View style={{ gap: 10, marginVertical: 20 }}>
                                            <Text style={{ color: textColor, fontWeight: 'bold' }}>Select Courier Service</Text>
                                            {rates.pricing.map((item, index) => (
                                                <TouchableOpacity key={index} style={[styles.service, { backgroundColor: subtleBorderColor }, courierType == item.courier_service_code ? { borderWidth: 1, borderColor: Colors.green } : {}]} onPress={() => setCourierType(item.courier_service_code)}>
                                                    <Text style={{ color: textColor, fontWeight: 'bold' }}>{item.courier_service_name}</Text>
                                                    <Text style={{ color: textColor }}>{item.description}</Text>
                                                    <Text style={{ color: textColor }}>Rp.{Number(item.shipping_fee).toLocaleString("id-ID")}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                        : <></>}
                                    <View style={{ gap: 10 }}>

                                        <View>
                                            <Text style={{ color: textColor, fontWeight: 'bold', marginBottom: 10 }}>Order Note (Optional):</Text>
                                            <TextInputComponent placeholder="Order Note" onChangeText={setOrderNote} />
                                        </View>
                                        {errMessage ?
                                            <ErrorComponent errorsString={errMessage} />
                                            : <></>}
                                        {rates ?
                                            <View>
                                                <ColoredButton title={hasPressedSnap ? "Check Payment Status" : "Pay with Snap"} onPress={() => handleSnapPay()} style={{ backgroundColor: Colors.green }} />
                                                {hasPressedSnap ? <></> : <ColoredButton title={"Pay with Wallet"} onPress={() => handleWalletPay()} style={{ backgroundColor: Colors.green }} isLoading={loading} />}
                                            </View> : <></>}
                                    </View>
                                </View>
                                : <></>}
                        </View>
                        : <ActivityIndicator size="large" style={{ height: 64, margin: 10, borderRadius: 5 }} color={textColor} />}
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    )
}
const styles = StyleSheet.create({
    service: {
        padding: 10,
        borderRadius: 10
    },
    shipmentContainer: {
        padding: 10,
        borderRadius: 10
    },
    history: {
        padding: 10,
        borderRadius: 10,
    },
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