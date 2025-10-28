import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { View, Text } from "react-native";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import { useAuth } from "../context/AuthContext";
import { useCallback, useEffect, useState } from "react";
import TopBar from "../../components/TopBar";
import ColoredButton from "../../components/ColoredButton";
import WebView from "react-native-webview";
import { useFocusEffect } from "@react-navigation/native";

type WalletProps = NativeStackScreenProps<RootStackParamList, "Wallet">
export default function Wallet({ navigation, route }: WalletProps) {
    const { onGetUserToken } = useAuth()
    const [balance, setBalance] = useState(0)
    const [loading, setLoading] = useState(false)

    const getBalance = async () => {
        try {
            const token = await onGetUserToken!()
            const response = await axios.get(`${API_URL}/get-balance`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const handleGetBalance = async () => {
        setLoading(true)
        const result = await getBalance()
        if (!result.error) {
            setBalance(result)
        }
        setLoading(false)
    }
    useEffect(() => {
        handleGetBalance()
    }, [])
    useFocusEffect(
        useCallback(() => {
            handleGetBalance();
        }, [])
    );
    return (
        <View>
            <TopBar title={"Wallet"} showBackButton />
            <Text>{balance}</Text>
            <ColoredButton title={"Deposit funds"} onPress={() => navigation.navigate('Deposit')} />
            <ColoredButton title={"Withdraw funds"} onPress={() => navigation.navigate('Withdraw')} />

        </View>
    )
}