import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { View } from "react-native";
import TopBar from "../../components/TopBar";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import ConfirmedModal from "../../components/ConfirmedModal";
import TextInputComponent from "../../components/TextInputComponent";
import ColoredButton from "../../components/ColoredButton";
import Colors from "../../constants/Colors";
import DateTimePicker from '@react-native-community/datetimepicker';

type AddStepProps = NativeStackScreenProps<RootStackParamList, "AddStep">;
export default function AddStep({ navigation, route }: AddStepProps) {
    const { processId, previousStepId } = route.params
    const [loading, setLoading] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [minDate, setMinDate] = useState<Date | null>(new Date())
    const [showMinDate, setShowMinDate] = useState(false)
    const [maxDate, setMaxDate] = useState<Date | null>(new Date())
    const [showMaxDate, setShowMaxDate] = useState(false)
    const [amount, setAmount] = useState<number>(0)
    const { user } = useAuth()
    const addStep = async () => {
        try {
            const response = await axios.post(`${API_URL}/create-step`, {
                authorId: user?.userId,
                processId: processId,
                title: title,
                description: description,
                minCompleteEstimate: minDate,
                maxCompleteEstimate: maxDate,
                amount: amount * 100,
                previousStepId: previousStepId
            })
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const setMinimumDate = (event: any, selectedDate: any) => {
        const utcDate = new Date(selectedDate)
        const localDate = new Date(
            utcDate.getTime() - utcDate.getTimezoneOffset() * 60000
        )
        setMinDate(localDate)
        setShowMinDate(false)
    }
    const setMaximumDate = (event: any, selectedDate: any) => {
        const utcDate = new Date(selectedDate)
        const localDate = new Date(
            utcDate.getTime() - utcDate.getTimezoneOffset() * 60000
        )
        setMaxDate(localDate)
        setShowMaxDate(false)
    }
    const handleUpload = async () => {
        if (title != '' && description != '' && amount > 0 && minDate != null && maxDate != null) {
            setLoading(true)
            const result = await addStep()
            if (!result.error) {
                setShowSuccessModal(true)
            }
            setLoading(false)
        }
    }
    return (
        <View>
            <TopBar title="Add Step" showBackButton />
            <ConfirmedModal onPress={() => navigation.goBack()} visible={showSuccessModal} message={"New step has been added"} />
            <TextInputComponent placeholder="Title" onChangeText={setTitle} />
            <TextInputComponent placeholder="Description" onChangeText={setDescription} />
            <ColoredButton style={{ backgroundColor: Colors.green }} title={"Select min date"} onPress={() => setShowMinDate(true)} />
            {showMinDate == true && minDate ?
                <DateTimePicker
                    value={minDate}
                    mode="date"
                    is24Hour={true}
                    onChange={setMinimumDate}
                />
                : <></>}
            <ColoredButton style={{ backgroundColor: Colors.green }} title={"Select max date"} onPress={() => setShowMaxDate(true)} />
            {showMaxDate == true && maxDate ?
                <DateTimePicker
                    value={maxDate}
                    mode="date"
                    is24Hour={true}
                    onChange={setMaximumDate}
                />
                : <></>}
            <TextInputComponent placeholder="Amount" onChangeText={(text) => setAmount(Number(text))} inputMode="numeric" />
            <ColoredButton style={{ backgroundColor: Colors.green }} title={"Add step"} onPress={() => handleUpload()} isLoading={loading} />
        </View>
    )
}