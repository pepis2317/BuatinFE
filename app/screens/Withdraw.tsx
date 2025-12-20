import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { View, Text } from "react-native";
import TopBar from "../../components/TopBar";
import TextInputComponent from "../../components/TextInputComponent";
import { useState } from "react";
import ColoredButton from "../../components/ColoredButton";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import ConfirmedModal from "../../components/ConfirmedModal";
import { useTheme } from "../context/ThemeContext";
import Colors from "../../constants/Colors";
import ErrorComponent from "../../components/ErrorComponent";

type WithdrawProps = NativeStackScreenProps<RootStackParamList, "Withdraw">

export default function Wallet({ navigation, route }: WithdrawProps) {
    const [amount, setAmount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [bankCode, setBankCode] = useState('')
    const [account, setAccount] = useState('')
    const [showCreated, setShowCreated] = useState(false)
    const [errMessage, setErrMessage] = useState('')
    const { textColor } = useTheme()
    const { onGetUserToken } = useAuth()

    const createWithdraw = async () => {
        try {
            const token = await onGetUserToken!()
            const response = await axios.post(`${API_URL}/withdraw-funds`, {
                amount: amount * 100,
                bankCode: bankCode.toLowerCase(),
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
        if (!amount || !bankCode || !account) {
            setErrMessage("All forms must be filled")
            return
        }
        setLoading(true)
        const result = await createWithdraw()
        if (!result.error) {
            setShowCreated(true)
        }
        setLoading(false)
    }

    return (
        <View style={{ flex: 1 }}>

            <TopBar title={"Withdraw Funds"} showBackButton />

            <ConfirmedModal isFail={false} onPress={() => navigation.goBack()} visible={showCreated} message={"Withdraw successful"} />

            <View style={{ paddingHorizontal: 24, paddingVertical: 16, gap: 16 }}>

                <View>
                    <Text style={{ color: textColor, fontWeight: 'bold', marginBottom: 12 }}>Amount</Text>
                    <TextInputComponent placeholder="Amount" onChangeText={(text) => setAmount(Number(text))} inputMode="numeric" />
                </View>

                <View>
                    <Text style={{ color: textColor, fontWeight: 'bold', marginBottom: 12 }}>Bank Code</Text>
                    <TextInputComponent placeholder="Bank Code" onChangeText={setBankCode} />
                </View>

                <View>
                    <Text style={{ color: textColor, fontWeight: 'bold', marginBottom: 12 }}>Account</Text>
                    <TextInputComponent placeholder="Account" onChangeText={setAccount} inputMode="numeric" />
                </View>
                
                {errMessage ?
                    <ErrorComponent errorsString={errMessage} />
                    : <></>}
                <ColoredButton title={"Withdraw"} style={{ backgroundColor: Colors.green }} onPress={() => handleWithdraw()} />
            </View>



        </View>
    )
}