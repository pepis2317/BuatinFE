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
type AcceptAndPayProps = NativeStackScreenProps<RootStackParamList, "AcceptAndPay">;
export default function AcceptAndPay({ navigation, route }: AcceptAndPayProps) {
    const { stepId } = route.params
    const { textColor } = useTheme()
    const [loading, setLoading] = useState(false)
    const [showPaid, setShowPaid] = useState(false)
    const [showSnapPaid, setShowSnapPaid] = useState(false)
    const [showSnapFailed, setShowSnapFailed] = useState(false)
    const [showPayment, setShowPayment] = useState(false)
    const [showPaymentFailed, setShowPaymentFailed] = useState(false)
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
            <ConfirmedModal isFail={false} onPress={() => navigation.goBack()} visible={showPaid} message={"Step has been paid"} />
            <ConfirmedModal isFail={false} onPress={() => navigation.goBack()} visible={showSnapPaid} message={"Step has been paid with snap"} />
            <ConfirmedModal isFail={true} onPress={() => setShowSnapFailed(false)} visible={showSnapFailed} message={"Something went wrong with the snap payment"} />
            <ConfirmedModal isFail={true} onPress={() => setShowPaymentFailed(false)} visible={showPaymentFailed} message={"Something went wrong, please check your balance"} />
            <TopBar title={"Accept & Pay Step"} showBackButton />
            <View style={{ padding: 20, gap: 10 }}>
                <View style={{ alignItems: 'center' }}>
                    <DollarSign color={Colors.green} size={100} />
                    <Text style={{
                        color: textColor,
                        fontWeight: 'bold',
                        marginTop: 10
                    }}>
                        Select Payment Method
                    </Text>
                </View>

                <ColoredButton title={"Pay using wallet"} style={{ backgroundColor: Colors.green }} onPress={() => handleWalletPay()} />
                <ColoredButton title={"Pay using Midtrans"} style={{ backgroundColor: Colors.green }} onPress={() => handleSnapPay()} />
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