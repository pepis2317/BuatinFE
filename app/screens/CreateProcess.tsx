import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { View } from "react-native";
import TopBar from "../../components/TopBar";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import { useState } from "react";
import TextInputComponent from "../../components/TextInputComponent";
import ColoredButton from "../../components/ColoredButton";
import ConfirmedModal from "../../components/ConfirmedModal";

type CreateProcessProps = NativeStackScreenProps<RootStackParamList, "CreateProcess">
export default function CreateProcess({ navigation, route }: CreateProcessProps) {
    const { requestId } = route.params
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [title, setTitle] = useState('')
    const respond = async () => {
        try {
            const res = await axios.put(`${API_URL}/respond-order-request`, {
                requestId: requestId,
                status: 'Accepted'
            })
            return res.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const createProcess = async () => {
        try {
            const res = await axios.post(`${API_URL}/create-process`, {
                requestId: requestId,
                description: description,
                title: title
            })
            return res.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const handleCreate = async () => {
        setLoading(true)
        const result = await respond()
        if (!result.error) {
            const uploadProcess = await createProcess()
            if (!uploadProcess.error) {
                setShowSuccessModal(true)
            }
        }
        setLoading(false)
    }
    return (
        <View>
            <ConfirmedModal visible={showSuccessModal} message={"Process has been created for this request"} onPress={()=>navigation.pop(2)}/>
            <TopBar title="Create Process" showBackButton />
            <TextInputComponent placeholder="Title" onChangeText={setTitle} />
            <TextInputComponent placeholder="Description" onChangeText={setDescription} />
            <ColoredButton title={"Accept Request & Create Process"} onPress={()=>handleCreate()} isLoading={loading}/>
        </View>
    )
}