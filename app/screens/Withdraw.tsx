import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { View } from "react-native";
import TopBar from "../../components/TopBar";
import TextInputComponent from "../../components/TextInputComponent";
import { useState } from "react";
import ColoredButton from "../../components/ColoredButton";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import ConfirmedModal from "../../components/ConfirmedModal";

type WithdrawProps = NativeStackScreenProps<RootStackParamList, "Withdraw">
export default function Wallet({ navigation, route }: WithdrawProps) {
    const [amount, setAmount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [bankCode, setBankCode] = useState('')
    const [account, setAccount] = useState('')
    const [showCreated, setShowCreated] = useState(false)
    const { onGetUserToken } = useAuth()
    const createWithdraw = async () => {
        try {
            const token = await onGetUserToken!()
            const response = await axios.post(`${API_URL}/withdraw-funds`, {
                amount: amount*100,
                bankCode: bankCode,
                account: account
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
    const handleWithdraw = async () => {
        setLoading(true)
        const result = await createWithdraw()
        if (!result.error) {
            setShowCreated(true)
        }
        setLoading(false)
    }
    return (
        <View>
            <TopBar title={"Withdraw Funds"} showBackButton />
            <ConfirmedModal onPress={() => navigation.goBack()} visible={showCreated} message={"Withdraw successful"} />
            <TextInputComponent placeholder="Amount" onChangeText={(text) => setAmount(Number(text))} inputMode="numeric" />
            <TextInputComponent placeholder="Bank Code" onChangeText={setBankCode} />
            <TextInputComponent placeholder="Account" onChangeText={setBankCode} inputMode="numeric" />
            <ColoredButton title={"Withdraw"} onPress={() => handleWithdraw()} />
        </View>
    )
}