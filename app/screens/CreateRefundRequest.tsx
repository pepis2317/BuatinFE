import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { View, Text } from "react-native";
import TextInputComponent from "../../components/TextInputComponent";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import { useState } from "react";
import ConfirmedModal from "../../components/ConfirmedModal";
import ColoredButton from "../../components/ColoredButton";
import { useAuth } from "../context/AuthContext";
import TopBar from "../../components/TopBar";
import { useTheme } from "../context/ThemeContext";
import Colors from "../../constants/Colors";

type CreateRefundProps = NativeStackScreenProps<RootStackParamList, "CreateRefundRequest">

export default function CreateRefundRequest({ navigation, route }: CreateRefundProps) {
    const { processId } = route.params
    const { textColor } = useTheme()
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [showCreated, setShowCreated] = useState(false)
    const { onGetUserToken } = useAuth()

    const postRequest = async () => {
        try {
            const token = await onGetUserToken!()
            const response = await axios.post(`${API_URL}/create-refund-request`, {
                processId: processId,
                message: message
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

    const handlePost = async () => {
        setLoading(true)
        const result = await postRequest()
        if (!result.error) {
            setShowCreated(true)
        }
        setLoading(false)
    }

    return (
        <View style={{ flex: 1 }}>

            <ConfirmedModal isFail={false} onPress={() => navigation.goBack()} visible={showCreated} message={"Refund request has been created"} />

            <TopBar title={"Create Refund Request"} showBackButton />

            <View style={{ flex: 1, padding: 16, gap: 12 }}>
                <View style={{ marginBottom: 4 }}>
                    <Text style={{ color: textColor, fontWeight: 'bold', marginBottom: 8 }}>Message</Text>
                    <TextInputComponent placeholder="Refund Reason" multiline style={{height:120}} onChangeText={setMessage} />
                </View>

                <ColoredButton title={"Create Refund Request"} style={{ backgroundColor: Colors.green }} onPress={() => handlePost()} isLoading={loading} />
            </View>

        </View>
    )
}