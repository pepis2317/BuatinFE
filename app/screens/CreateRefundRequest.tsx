import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { View } from "react-native";
import TextInputComponent from "../../components/TextInputComponent";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import { useState } from "react";
import ConfirmedModal from "../../components/ConfirmedModal";
import ColoredButton from "../../components/ColoredButton";
import { useAuth } from "../context/AuthContext";

type CreateRefundProps = NativeStackScreenProps<RootStackParamList, "CreateRefundRequest">
export default function CreateRefundRequest({ navigation, route }: CreateRefundProps) {
    const { processId } = route.params
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [showCreated, setShowCreated] = useState(false)
    const {onGetUserToken} = useAuth()
    const postRequest = async () => {
        try {
            const token = await onGetUserToken!()
            const response = await axios.post(`${API_URL}/create-refund-request`, {
                processId: processId,
                message: message
            },{
                headers:{
                    Authorization:`Bearer ${token}`
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
        <View>
            <ConfirmedModal onPress={() => navigation.goBack()} visible={showCreated} message={"Refund request has been created"} />
            <TextInputComponent placeholder="Message" onChangeText={setMessage} />
            <ColoredButton title={"Create refund request"} onPress={() => handlePost()} isLoading={loading}/>
        </View>
    )
}