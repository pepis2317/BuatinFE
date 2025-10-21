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

type DepositProps = NativeStackScreenProps<RootStackParamList, "Deposit">
export default function Deposit({ navigation, route }: DepositProps) {
    const [snapUrl, setSnapUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [amount, setAmount] = useState(0)
    const [showPayment, setShowPayment] = useState(false)
    const [showSnapFailed, setShowSnapFailed] = useState(false)
    const [showSnapPaid, setShowSnapPaid] = useState(false)
    const { onGetUserToken } = useAuth()
    const deposit = async (amount: number) => {
        try {
            const token = await onGetUserToken!()
            const response = await axios.post(`${API_URL}/deposit-funds`, {
                amount:amount
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
        setLoading(true)
        const result = await deposit(amount * 100)
        if (!result.error) {
            console.log(result)
            setSnapUrl(result.redirectUrl)
        } else {
            console.log(result)
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
            <TextInputComponent placeholder="Amount" onChangeText={(text) => setAmount(Number(text))} inputMode="numeric" />
            <ConfirmedModal onPress={() => navigation.goBack()} visible={showSnapPaid} message={"Step has been paid with snap"} />
            <ConfirmedModal onPress={() => setShowSnapFailed(false)} visible={showSnapFailed} message={"Something went wrong with the snap payment"} />
            <ColoredButton title={"Deposit"} onPress={() => handleSnapPay()} />
            <Modal
                visible={showPayment}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowPayment(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => setShowPayment(false)}>
                                <Text style={styles.closeText}>✕ Close</Text>
                            </TouchableOpacity>
                            <Text style={styles.title}>Payment</Text>
                            <View style={{ width: 60 }} /> {/* spacing */}
                        </View>

                        {/* WebView */}
                        <WebView
                            source={{ uri: snapUrl }}
                            onLoadEnd={() => setLoading(false)}
                            startInLoadingState={true}
                            onNavigationStateChange={(state) => {
                                if (state.url.includes("success")) {
                                    setShowPayment(false);
                                    setShowSnapPaid(true)
                                    // handle success
                                } else if (state.url.includes("cancel")) {
                                    setShowPayment(false);
                                    setShowSnapFailed(true)
                                }
                            }}
                        />
                    </View>
                </View>
            </Modal>
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