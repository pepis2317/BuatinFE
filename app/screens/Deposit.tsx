import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { TouchableOpacity, View, Text, Modal, StyleSheet } from "react-native";
import WebView from "react-native-webview";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import TextInputComponent from "../../components/TextInputComponent";
import ColoredButton from "../../components/ColoredButton";
import ConfirmedModal from "../../components/ConfirmedModal";
import { useAuth } from "../context/AuthContext";
import PaymentModal from "../../components/PaymentModal";
import TopBar from "../../components/TopBar";
import { useTheme } from "../context/ThemeContext";
import Colors from "../../constants/Colors";
import ErrorComponent from "../../components/ErrorComponent";

type DepositProps = NativeStackScreenProps<RootStackParamList, "Deposit">
export default function Deposit({ navigation, route }: DepositProps) {
    const { textColor } = useTheme()
    const [snapUrl, setSnapUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [amount, setAmount] = useState(0)
    const [showPayment, setShowPayment] = useState(false)
    const [showSnapFailed, setShowSnapFailed] = useState(false)
    const [showSnapPaid, setShowSnapPaid] = useState(false)
    const [errMessage, setErrMessage] = useState('')
    const { onGetUserToken } = useAuth()
    const deposit = async (amount: number) => {
        try {
            const token = await onGetUserToken!()
            const response = await axios.post(`${API_URL}/deposit-funds`, {
                amount: amount
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const handleSnapPay = async () => {
        if(amount<10000){
            setErrMessage("Amount must be greater than or equal to Rp10.000")
            return
        }
        setLoading(true)
        const result = await deposit(amount * 100)
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
        <View style={{ flex: 1 }}>
            <TopBar title={"Deposit"} showBackButton />
            <ConfirmedModal isFail={false} onPress={() => navigation.goBack()} visible={showSnapPaid} message={"Step has been paid with snap"} />
            <ConfirmedModal isFail={true} onPress={() => setShowSnapFailed(false)} visible={showSnapFailed} message={"Something went wrong with the snap payment"} />
            <View style={{ padding: 20, gap: 10 }}>
                <View>
                    <Text style={{
                        color: textColor,
                        fontWeight: 'bold',
                        marginBottom: 10
                    }}>Amount</Text>
                    <TextInputComponent placeholder="Amount" onChangeText={(text) => setAmount(Number(text))} inputMode="numeric" />
                </View>
                {errMessage ?
                    <ErrorComponent errorsString={errMessage} />
                    : <></>}
                <ColoredButton title={"Deposit"} style={{ backgroundColor: Colors.green }} onPress={() => handleSnapPay()} isLoading={loading} />
            </View>

            <PaymentModal
                showPayment={showPayment}
                snapUrl={snapUrl}
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
});