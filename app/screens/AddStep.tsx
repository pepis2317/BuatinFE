import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
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
import { useTheme } from "../context/ThemeContext";
import { Calendar, Hand } from "lucide-react-native";
import ErrorComponent from "../../components/ErrorComponent";

type AddStepProps = NativeStackScreenProps<RootStackParamList, "AddStep">;

export default function AddStep({ navigation, route }: AddStepProps) {
    const { processId, previousStepId } = route.params
    const { textColor, borderColor } = useTheme()
    const [loading, setLoading] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [minDate, setMinDate] = useState<Date | null>(null)
    const [showMinDate, setShowMinDate] = useState(false)
    const [maxDate, setMaxDate] = useState<Date | null>(null)
    const [showMaxDate, setShowMaxDate] = useState(false)
    const [amountText, setAmountText] = useState("")
    const [amount, setAmount] = useState<number>(0)
    const [errMessage, setErrMessage] = useState("")
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

    const setMinimumDate = (event: any, selectedDate: Date | undefined) => {
        if (!selectedDate) return;
        setMinDate(selectedDate);
        setShowMinDate(false);
    };

    const setMaximumDate = (event: any, selectedDate: any) => {
        if (!selectedDate) return;
        setMaxDate(selectedDate);
        setShowMaxDate(false);
    }

    const handleUpload = async () => {
        if (!title || !description || !minDate || !maxDate) {
            setErrMessage("All forms must be filled")
            return
        }
        if (amount < 10000) {
            setErrMessage("Amount must be greater than or equal to Rp 10.000,00")
            return
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const min = new Date(minDate);
        min.setHours(0, 0, 0, 0);

        const max = new Date(maxDate);
        max.setHours(0, 0, 0, 0);

        if (min > max) {
            setErrMessage("Invalid estimation date")
            return
        }

        if (min < today || max < today) {
            setErrMessage("Date must be somewhere in the future");
            return;
        }
        setLoading(true)
        const result = await addStep()
        if (!result.error) {
            setShowSuccessModal(true)
        }
        setLoading(false)
    }

    const formatPrice = (value: string) => {
        const digits = value.replace(/\D/g, "");

        return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const handleChange = (text: string) => {
        const formatted = formatPrice(text);
        setAmountText(formatted);

        const numericValue = Number(formatted.replace(/\./g, ""));
        setAmount(numericValue);
    };

    return (
        <View style={{ flex: 1 }}>

            <TopBar title="Add Step" showBackButton />

            <ConfirmedModal isFail={false} onPress={() => navigation.goBack()} visible={showSuccessModal} message={"New step has been added"} />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={35}>

                <ScrollView>
                    <View style={{ padding: 16, gap: 12 }}>

                        <View>
                            <Text style={{ color: textColor, fontWeight: 'bold', marginBottom: 8 }}>Title</Text>
                            <TextInputComponent placeholder="Title" onChangeText={setTitle} />
                        </View>

                        <View>
                            <Text style={{ color: textColor, fontWeight: 'bold', marginBottom: 8 }}>Description</Text>
                            <TextInputComponent placeholder="Description" multiline style={{ height: 120 }} onChangeText={setDescription} />
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 4}}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: textColor, fontWeight: 'bold', marginBottom: 8 }}>Min. Estimate</Text>
                                <TouchableOpacity style={[ styles.date, { borderColor: borderColor } ]} onPress={() => setShowMinDate(true)}>
                                    <Calendar color={textColor} />
                                    <Text style={{ color: textColor }}>{minDate?.toLocaleDateString()}</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={{ flex: 1 }}>
                                <Text style={{ color: textColor, fontWeight: 'bold', marginBottom: 8 }}>Max. Estimate</Text>
                                <TouchableOpacity style={[ styles.date, { borderColor: borderColor } ]} onPress={() => setShowMaxDate(true)}>
                                    <Calendar color={textColor} />
                                    <Text style={{ color: textColor}}>{maxDate?.toLocaleDateString()}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        {showMinDate == true ?
                            <DateTimePicker
                                value={minDate ? minDate : new Date()}
                                mode="date"
                                is24Hour={true}
                                onChange={setMinimumDate}
                            />
                            : <></>}
                        {showMaxDate == true ?
                            <DateTimePicker
                                value={maxDate ? maxDate : new Date()}
                                mode="date"
                                is24Hour={true}
                                onChange={setMaximumDate}
                            />
                            : <></>}
                        <TextInputComponent
                            placeholder="Price"
                            value={amountText}
                            onChangeText={handleChange}
                            keyboardType="numeric"
                        />
                        {errMessage ?
                            <ErrorComponent errorsString={errMessage} />
                            : <></>}
                        <ColoredButton style={{ backgroundColor: Colors.green, marginTop: 4}} title={"Add Step"} onPress={() => handleUpload()} isLoading={loading} />
                    </View>
                </ScrollView>

            </KeyboardAvoidingView>


        </View>
    )
}
const styles = StyleSheet.create({
    date: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderWidth: 1,
        borderRadius: 8,
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
})