import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { ScrollView, Text, View, Image } from "react-native";
import TopBar from "../../components/TopBar";
import TextInputComponent from "../../components/TextInputComponent";
import { useTheme } from "../context/ThemeContext";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import ColoredButton from "../../components/ColoredButton";
import Colors from "../../constants/Colors";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";

type OrderRequestDetailsProps = NativeStackScreenProps<RootStackParamList, "OrderRequestDetails">
export default function OrderRequestDetails({ navigation, route }: OrderRequestDetailsProps) {
    const { orderRequest, respondable } = route.params
    const { theme } = useTheme()
    const [title, setTitle] = useState("")
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)
    const [answer, setAnswer] = useState(orderRequest.status)
    const [images, setImages] = useState<string[]>([])
    const { user } = useAuth()
    const textColor = theme === "dark" ? "white" : "black"
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
        <ScrollView>
            <TopBar title="Order Request Details" showBackButton />
            <Text style={{ color: textColor }}>{orderRequest.requestId}</Text>
            <Text style={{ color: textColor }}>{orderRequest.title}</Text>
            <Text style={{ color: textColor }}>{orderRequest.status}</Text>
            {images.map((image, index) => (
                <Image source={{ uri: image }} key={index} width={100} height={100} />
            ))}
            {respondable == false ?
                <></>
                :
                <View>
                    {answer == 'Pending' ?
                        <View>
                            <ColoredButton title={"Accept"} style={{ backgroundColor: Colors.green }} isLoading={loading} onPress={() => navigation.navigate('CreateProcess', { requestId: orderRequest.requestId })} />
                            <ColoredButton title={"Decline"} style={{ backgroundColor: Colors.peach }} isLoading={loading} onPress={() => handleDecline()} />
                        </View>
                        :
                        <View>
                            <Text>Ts {answer} cro</Text>
                        </View>
                    }

                </View>
            }

        </ScrollView>
    )
}