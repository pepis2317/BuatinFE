import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { ScrollView, Text, View, Image, StyleSheet } from "react-native";
import TopBar from "../../components/TopBar";
import TextInputComponent from "../../components/TextInputComponent";
import { useTheme } from "../context/ThemeContext";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import ColoredButton from "../../components/ColoredButton";
import Colors from "../../constants/Colors";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import { useFocusEffect } from "@react-navigation/native";
import ConfirmationModal from "../../components/ConfirmationModal";
import ConfirmedModal from "../../components/ConfirmedModal";
import DeclineModal from "../../components/DeclineModal";

type OrderRequestDetailsProps = NativeStackScreenProps<RootStackParamList, "OrderRequestDetails">

export default function OrderRequestDetails({ navigation, route }: OrderRequestDetailsProps) {
    const { orderRequest, respondable } = route.params
    const { textColor, borderColor } = useTheme()
    const [loading, setLoading] = useState(false)
    const [answer, setAnswer] = useState(orderRequest.status)
    const [acceptConfirmation, setAcceptConfirmation] = useState(false)
    const [declineConfirmation, setDeclineConfirmation] = useState(false)
    const [showDeclineModal, setShowDeclineModal] = useState(false)
    const [declined, setShowDeclined] = useState(false)
    const [images, setImages] = useState<string[]>([])

    const respond = async (status: string, reason: string | null) => {
        try {
            const res = await axios.put(`${API_URL}/respond-order-request`, {
                requestId: orderRequest.requestId,
                status: status,
                declineReason: reason
            })
            return res.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }

    var fetchImages = async () => {
        try {
            const res = await axios.get(`${API_URL}/get-images?ContentId=${orderRequest.requestId}`)
            return res.data
        } catch (e: any) {
            return { error: true, msg: e?.response?.data?.detail || "An error occurred" };
        }
    }

    const handleDecline = async (reason: string) => {
        setLoading(true)
        const result = await respond("Declined", reason)
        if (!result.error) {
            setAnswer("Declined")
            setShowDeclineModal(false)
            setDeclineConfirmation(false)
            setShowDeclined(true)
        }
        setLoading(false)
    }

    const loadImages = async () => {
        var images = await fetchImages()
        if (!images.error) {
            setImages(images)
        }
    }

    useEffect(() => {
        loadImages()
    }, [])

    return (
        <ScrollView style={{ flex: 1 }}>

            <TopBar title="Order Request Details" showBackButton />

            <ConfirmationModal visible={acceptConfirmation} message={"Accept order request? You will need to input the process info first."} onAccept={() => {
                setAcceptConfirmation(false)
                navigation.navigate('CreateProcess', { requestId: orderRequest.requestId })
            }} onCancel={() => setAcceptConfirmation(false)} />

            <DeclineModal onDecline={handleDecline} showModal={showDeclineModal} onClose={() => setShowDeclineModal(false)} />
            {/* <ConfirmationModal visible={declineConfirmation} message={"Decline order request?"} onAccept={handleDecline} onCancel={() => setDeclineConfirmation(false)} /> */}

            <ConfirmedModal isFail={false} visible={declined} message={"Request Declined"} onPress={() => navigation.goBack()} />

            <View style={{ padding: 16 }}>
                {/* Title & Status */}
                <View style={[ styles.container, { borderColor: borderColor }]}>
                    <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 16 }}>{orderRequest.title}</Text>
                    <Text style={{ color: textColor }}>{orderRequest.status}</Text>
                </View>

                {images.map((image, index) => (
                    <Image style={{ borderRadius: 8, marginBottom: 16 }} source={{ uri: image }} key={index} width={170} height={170} />
                ))}
                {respondable == false ?
                    <></>
                    :
                    <View>
                        {answer == 'Pending' ?
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 16}}>
                                <ColoredButton title={"Decline"} style={[{ backgroundColor: Colors.red }, styles.button]} isLoading={loading} onPress={() => setShowDeclineModal(true)} />
                                <ColoredButton title={"Accept"} style={[{ backgroundColor: Colors.green }, styles.button]} isLoading={loading} onPress={() => setAcceptConfirmation(true)} />
                            </View>
                            : <></>
                        }

                    </View>
                }
                {orderRequest.declineReason ?
                    <View style={[styles.container, { borderColor: Colors.red }]}>
                        <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 16 }}>Decline Reason</Text>
                        <Text style={{ color: textColor }}>{orderRequest.declineReason}</Text>
                    </View>
                    : <></>}
            </View>


        </ScrollView>
    )
}
const styles = StyleSheet.create({
    button: {
        flex: 1,
    },
    container: {
        padding: 16,
        borderRadius: 10,
        borderWidth: 1,
        marginBottom: 16
    }
})