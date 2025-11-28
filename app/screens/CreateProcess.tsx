import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { ScrollView, View, Text } from "react-native";
import TopBar from "../../components/TopBar";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import { useState } from "react";
import TextInputComponent from "../../components/TextInputComponent";
import ColoredButton from "../../components/ColoredButton";
import ConfirmedModal from "../../components/ConfirmedModal";
import { useTheme } from "../context/ThemeContext";
import Colors from "../../constants/Colors";
import ErrorComponent from "../../components/ErrorComponent";

type CreateProcessProps = NativeStackScreenProps<RootStackParamList, "CreateProcess">
export default function CreateProcess({ navigation, route }: CreateProcessProps) {
    const { requestId } = route.params
    const { textColor } = useTheme()
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [errMessage, setErrMessage] = useState("")
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
        if(!title || !description){
            setErrMessage("All forms must be filled")
            return
        }
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
        <View style={{ flex: 1 }}>
            <ConfirmedModal isFail={false} visible={showSuccessModal} message={"Process has been created for this request"} onPress={() => navigation.pop(2)} />
            <TopBar title="Create Process" showBackButton />
            <ScrollView style={{ flex: 1 }}>
                <View style={{ padding: 20, gap: 10 }}>
                    <View>
                        <Text style={{
                            color: textColor,
                            fontWeight: 'bold',
                            marginBottom: 10
                        }}>Title</Text>
                        <TextInputComponent placeholder="Title" onChangeText={setTitle} />
                    </View>
                    <View>
                        <Text style={{
                            color: textColor,
                            fontWeight: 'bold',
                            marginBottom: 10
                        }}>Description</Text>
                        <TextInputComponent placeholder="Description" onChangeText={setDescription} />
                    </View>
                    {errMessage ?
                        <ErrorComponent errorsString={errMessage} />
                        : <></>}
                    <ColoredButton title={"Accept Request & Create Process"} style={{ backgroundColor: Colors.green }} onPress={() => handleCreate()} isLoading={loading} />
                </View>
            </ScrollView>

        </View>
    )
}