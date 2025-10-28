import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ActivityIndicator, Modal, TouchableOpacity, View, StyleSheet, Text } from "react-native";
import { RootStackParamList } from "../../constants/RootStackParams";
import ColoredButton from "../../components/ColoredButton";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import { useEffect, useState } from "react";
import TopBar from "../../components/TopBar";
import ConfirmedModal from "../../components/ConfirmedModal";
import WebView from "react-native-webview";
import PaymentModal from "../../components/PaymentModal";
type AcceptAndPayProps = NativeStackScreenProps<RootStackParamList, "AcceptAndPay">;
export default function AcceptAndPay({ navigation, route }: AcceptAndPayProps) {
    const { stepId } = route.params
    const [loading, setLoading] = useState(false)
    const [showPaid, setShowPaid] = useState(false)
    const [showSnapPaid, setShowSnapPaid] = useState(false)
    const [showSnapFailed, setShowSnapFailed] = useState(false)
    const [showPayment, setShowPayment] = useState(false)
    const [snapUrl, setSnapUrl] = useState('')
    const walletPay = async () => {
        try {
            const response = await axios.post(`${API_URL}/approve-and-pay-step`, {
                stepId: stepId,
                method: "Wallet"
            })
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const snapPay = async () => {
        try {
            const response = await axios.post(`${API_URL}/approve-and-pay-step`, {
                stepId: stepId,
                method: "Snap"
            })
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const handleWalletPay = async () => {
        setLoading(true)
        const result = await walletPay()
        if (!result.error) {
            setShowPaid(true)
        }
        setLoading(false)
    }
    const handleSnapPay = async () => {
        setLoading(true)
        const result = await snapPay()
        if (!result.error) {
            setSnapUrl(result.redirectUrl)
        }
        setLoading(false)
    }
    useEffect(() => {
        if (snapUrl != '') {
            setShowPayment(true)
        }
    }, [snapUrl])
    return (
        <View>
            <ConfirmedModal onPress={() => navigation.goBack()} visible={showPaid} message={"Step has been paid"} />
            <ConfirmedModal onPress={() => navigation.goBack()} visible={showSnapPaid} message={"Step has been paid with snap"} />
            <ConfirmedModal onPress={() => setShowSnapFailed(false)} visible={showSnapFailed} message={"Something went wrong with the snap payment"} />
            <TopBar title={"Accept & Pay Step"} showBackButton />
            <ColoredButton title={"Pay using wallet"} onPress={() => handleWalletPay()} />
            <ColoredButton title={"Pay using Midtrans"} onPress={() => handleSnapPay()} />
            <PaymentModal showPayment={showPayment} snapUrl={snapUrl}
                closePaymentModal={() => setShowPayment(false)}
                onSuccess={() => {
                    setShowPayment(false);
                    setShowSnapPaid(true)
                }} onFailed={() => {
                    setShowPayment(false);
                    setShowSnapFailed(true)
                }} onLoadEnd={() => setLoading(false)} />
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