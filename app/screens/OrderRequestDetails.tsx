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

type OrderRequestDetailsProps = NativeStackScreenProps<RootStackParamList, "OrderRequestDetails">
export default function OrderRequestDetails({ navigation, route }: OrderRequestDetailsProps) {
    const { orderRequest, respondable } = route.params
    const { textColor, borderColor } = useTheme()
    const [loading, setLoading] = useState(false)
    const [answer, setAnswer] = useState(orderRequest.status)
    const [acceptConfirmation, setAcceptConfirmation] = useState(false)
    const [declineConfirmation, setDeclineConfirmation] = useState(false)
    const [declined, setShowDeclined] = useState(false)
    const [images, setImages] = useState<string[]>([])
    const respond = async (status: string) => {
        try {
            const res = await axios.put(`${API_URL}/respond-order-request`, {
                requestId: orderRequest.requestId,
                status: status
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
    const handleDecline = async () => {
        setLoading(true)
        const result = await respond("Declined")
        if (!result.error) {
            setAnswer("Declined")
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
            <ConfirmationModal visible={declineConfirmation} message={"Decline order request?"} onAccept={() => handleDecline()} onCancel={() => setDeclineConfirmation(false)} />
            <ConfirmedModal isFail={false} visible={declined} message={"Request Declined"} onPress={() => navigation.goBack()} />
            <View style={{ padding: 20 }}>
                <View style={[
                    styles.container,
                    { borderColor: borderColor }
                ]}>
                    <Text style={{
                        color: textColor,
                        fontWeight: 'bold',
                        fontSize: 16
                    }}>{orderRequest.title}</Text>
                    <Text style={{ color: textColor }}>{orderRequest.status}</Text>
                </View>

                {images.map((image, index) => (
                    <Image style={{ borderRadius: 10, marginBottom: 10 }} source={{ uri: image }} key={index} width={150} height={150} />
                ))}
                {respondable == false ?
                    <></>
                    :
                    <View>
                        {answer == 'Pending' ?
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <ColoredButton title={"Accept"} style={[{ backgroundColor: Colors.green }, styles.button]} isLoading={loading} onPress={() => setAcceptConfirmation(true)} />
                                <ColoredButton title={"Decline"} style={[{ backgroundColor: Colors.peach }, styles.button]} isLoading={loading} onPress={() => setDeclineConfirmation(true)} />
                            </View>
                            : <></>
                        }

                    </View>
                }
            </View>


        </ScrollView>
    )
}
const styles = StyleSheet.create({
    button: {
        width: "48%",
        height: 40,
        padding: 10,
    },
    container: {
        padding: 20,
        borderRadius: 10,
        borderWidth: 1,
        marginBottom: 10
    }
})