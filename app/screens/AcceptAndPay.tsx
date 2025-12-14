import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ActivityIndicator, Modal, TouchableOpacity, View, StyleSheet, Text } from "react-native";
import { RootStackParamList } from "../../constants/RootStackParams";
import ColoredButton from "../../components/ColoredButton";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import { useEffect, useState } from "react";
import TopBar from "../../components/TopBar";
import ConfirmedModal from "../../components/ConfirmedModal";
import PaymentModal from "../../components/PaymentModal";
import Colors from "../../constants/Colors";
import { DollarSign } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { StepResponse } from "../../types/StepResponse";
type AcceptAndPayProps = NativeStackScreenProps<RootStackParamList, "AcceptAndPay">;
export default function AcceptAndPay({ navigation, route }: AcceptAndPayProps) {
    const { stepId } = route.params
    const { textColor, foregroundColor } = useTheme()
    const [loading, setLoading] = useState(false)
    const [stepLoading, setStepLoading] = useState(false)
    const [showPaid, setShowPaid] = useState(false)
    const [step, setStep] = useState<StepResponse>()
    const [showSnapPaid, setShowSnapPaid] = useState(false)
    const [showSnapFailed, setShowSnapFailed] = useState(false)
    const [showPayment, setShowPayment] = useState(false)
    const [showPaymentFailed, setShowPaymentFailed] = useState(false)
    const [hasPressedSnap, setHasPressedSnap] = useState(false)
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
        } else {
            setShowPaymentFailed(true)
        }
        setLoading(false)
    }
    const handleSnapPay = async () => {
        setHasPressedSnap(true)
        const result = await snapPay()
        if (!result.error) {
            if (result.paymentStatus == "Posted") {
                setShowSnapPaid(true)
            } else {
                setSnapUrl(result.redirectUrl)
            }
        }
    }
    useEffect(() => {
        if (snapUrl != '') {
            setShowPayment(true)
        }
    }, [snapUrl])
    const fetchStep = async () => {
        try {
            const response = await axios.get(`${API_URL}/get-step?stepId=${stepId}`)
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const handleFetchStep = async () => {
        setStepLoading(true)
        const result = await fetchStep()
        if (!result.error) {
            setStep(result)
        }
        setStepLoading(false)
    }
    useEffect(() => {
        handleFetchStep();
    }, [])
    return (
        <View>
            <ConfirmedModal isFail={false} onPress={() => navigation.goBack()} visible={showPaid} message={"Step has been paid"} />
            <ConfirmedModal isFail={false} onPress={() => navigation.goBack()} visible={showSnapPaid} message={"Step has been paid with snap"} />
            <ConfirmedModal isFail={true} onPress={() => setShowSnapFailed(false)} visible={showSnapFailed} message={"Something went wrong with the snap payment"} />
            <ConfirmedModal isFail={true} onPress={() => setShowPaymentFailed(false)} visible={showPaymentFailed} message={"Something went wrong, please check your balance"} />
            <TopBar title={"Accept & Pay Step"} showBackButton />
            <View style={{ padding: 20, gap: 10 }}>
                {stepLoading || !step ?
                    <ActivityIndicator size="large" style={{ height: 64, margin: 10, borderRadius: 5 }} color={textColor} />
                    :
                    <View style={{ backgroundColor: foregroundColor, padding: 10, borderRadius: 5 }}>
                        <Text style={{ color: textColor, fontWeight: 'bold', marginBottom:5 }}>{step.title}</Text>
                        <Text style={{ color: textColor, marginBottom:5}}>{step.description}</Text>
                        <Text style={{ color: textColor, marginBottom:5}}>{step.minCompleteEstimate} - {step.maxCompleteEstimate}</Text>
                        <Text style={{ color: textColor, fontWeight: 'bold' }}>Rp.{Number(step.price/100).toLocaleString("id-ID")}</Text>
                    </View>
                }
                {hasPressedSnap ? <></> : <ColoredButton title={"Pay using wallet"} style={{ backgroundColor: Colors.green }} onPress={() => handleWalletPay()} isLoading={loading} />}
                <ColoredButton title={hasPressedSnap ? "Check Payment Status" : "Pay using Midtrans"} style={{ backgroundColor: Colors.green }} onPress={() => handleSnapPay()} />
            </View>

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