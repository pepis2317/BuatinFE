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
import * as SecureStore from 'expo-secure-store'
import * as Crypto from 'expo-crypto'

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
    const [hasPressedDeposit, setHasPressedDeposit] = useState(false)
    const { onGetUserToken } = useAuth()

    const deposit = async (amount: number, key: string) => {
        try {
            const token = await onGetUserToken!()
            const response = await axios.post(`${API_URL}/deposit-funds`, {
                amount: amount,
                idempotencyKey: key
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
        if (amount < 10000) {
            setErrMessage("Amount must be greater than or equal to Rp 10.000,00")
            return
        }
        setLoading(true)
        setHasPressedDeposit(true)

        let idempotencyKey = await SecureStore.getItemAsync("deposit-key")

        if (!idempotencyKey) {
            idempotencyKey = Crypto.randomUUID()
            await SecureStore.setItemAsync("deposit-key", idempotencyKey)
        }

        const result = await deposit(amount * 100, idempotencyKey)

        if (!result.error) {
            if (result.paymentStatus == "Posted") {
                setShowSnapPaid(true)
                await SecureStore.deleteItemAsync("deposit-key")
            } else {
                setSnapUrl(result.redirectUrl)
            }
        }
        setLoading(false)
    }

    const handleSuccessPayment = async () => {
        await SecureStore.deleteItemAsync("deposit-key")
        setShowPayment(false);
        setShowSnapPaid(true)
    }

    const handleFailedPayment = async () => {
        await SecureStore.deleteItemAsync("deposit-key")
        setShowPayment(false);
        setShowSnapFailed(true)
    }

    useEffect(() => {
        if (snapUrl != '') {
            setShowPayment(true)
        }
    }, [snapUrl])

    return (
        <View style={{ flex: 1 }}>
            <TopBar title={"Deposit"} showBackButton />

            <ConfirmedModal 
                isFail={false} onPress={() => navigation.goBack()} visible={showSnapPaid} message={"Step has been paid with snap"}
            />

            <ConfirmedModal
                isFail={true} onPress={() => setShowSnapFailed(false)} visible={showSnapFailed} message={"Something went wrong with the snap payment"}
            />

            <View style={{ padding: 24, gap: 16 }}>
                <View style={{ gap: 8 }}>
                    <Text style={{ color: textColor, fontWeight: 'bold'}}>Amount</Text>
                    <TextInputComponent placeholder="Amount" onChangeText={(text) => setAmount(Number(text))} inputMode="numeric" />
                </View>
                {errMessage ?
                    <ErrorComponent errorsString={errMessage} />
                    : <></>}
                <ColoredButton title={hasPressedDeposit?"Check Payment Status":"Deposit"} style={{ backgroundColor: Colors.green }} onPress={() => handleSnapPay()} isLoading={loading} />
            </View>

            <PaymentModal
                showPayment={showPayment}
                snapUrl={snapUrl}
                closePaymentModal={() => setShowPayment(false)}
                onSuccess={() => handleSuccessPayment()}
                onFailed={() => handleFailedPayment()} 
                onLoadEnd={() => setLoading(false)} 
            />
        </View>
    )
}
