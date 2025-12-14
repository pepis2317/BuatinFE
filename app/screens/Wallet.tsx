import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import { useAuth } from "../context/AuthContext";
import { useCallback, useEffect, useState } from "react";
import TopBar from "../../components/TopBar";
import ColoredButton from "../../components/ColoredButton";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import Colors from "../../constants/Colors";

type WalletProps = NativeStackScreenProps<RootStackParamList, "Wallet">
export default function Wallet({ navigation, route }: WalletProps) {
    const { onGetUserToken } = useAuth()
    const { textColor } = useTheme()
    const [balance, setBalance] = useState(0)
    const [refreshing, setRefreshing] = useState(false)
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
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setBalance(0)
        handleGetBalance()
        setRefreshing(false)
    }, [handleGetBalance]);
    return (
        <View style={{ flex: 1 }}>
            <TopBar title={"Wallet"} showBackButton />
            <ScrollView style={{ flex: 1 }} refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
                <View style={{ padding: 20, gap: 10, alignItems: 'center' }}>
                    <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 32 }}>Rp.{Number(balance / 100).toLocaleString("id-ID")}</Text>
                    <ColoredButton title={"Deposit funds"} style={{ backgroundColor: Colors.green, width: '100%' }} onPress={() => navigation.navigate('Deposit')} />
                    <ColoredButton title={"Withdraw funds"} style={{ backgroundColor: Colors.green, width: '100%' }} onPress={() => navigation.navigate('Withdraw')} />
                </View>
            </ScrollView>

        </View>
    )
}