import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from "react-native";
import TopBar from "../../components/TopBar";
import { useEffect, useState } from "react";
import { StepResponse } from "../../types/StepResponse";
import { API_URL } from "../../constants/ApiUri";
import axios from "axios";
import TextInputComponent from "../../components/TextInputComponent";
import ColoredButton from "../../components/ColoredButton";
import Colors from "../../constants/Colors";
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from "dayjs";
import ConfirmedModal from "../../components/ConfirmedModal";
import * as ImagePicker from "expo-image-picker";
import { PlusSquare, X } from "lucide-react-native";

type EditStepProps = NativeStackScreenProps<RootStackParamList, "EditStep">;
export default function EditStep({ navigation, route }: EditStepProps) {
    const { stepId } = route.params
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<StepResponse | null>()
    const [minimumDate, setMinimumDate] = useState<Date>()
    const [maximumDate, setMaximumDate] = useState<Date>()
    const [showUpdatedModal, setShowUpdatedModal] = useState(false)
    const [showCompletedModal, setShowCompletedModal] = useState(false)
    const [showCancelledModal, setShowCancelledModal] = useState(false)
    const [showMinDate, setShowMinDate] = useState(false)
    const [showMaxDate, setShowMaxDate] = useState(false)
    const [images, setImages] = useState<string[]>([])
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            alert("Permission required");
            return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 1,
            aspect: [1, 1]
        })

        if (!result.canceled) {
            setImages((prevImages) => [...prevImages, result.assets[0].uri]);
        }
    }
    const removeImage = (index: number) => {
        setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    }
    const fetchStep = async () => {
        try {
            const response = await axios.get(`${API_URL}/get-step?stepId=${stepId}`)
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const handleUploadImage = async (formData: FormData) => {
        try {
            const result = await axios.post(`${API_URL}/upload-image`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return { data: result.data };
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" }
        }
    }
    const saveChanges = async (title: string, description: string, minCompleteDate: Date, maxCompleteDate: Date) => {
        try {
            const response = await axios.put(`${API_URL}/edit-step`, {
                stepId: stepId,
                title: title,
                description: description,
                minCompleteEstimate: minCompleteDate,
                maxCompleteEstimate: maxCompleteDate
            })
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const cancelStep = async () => {
        try {
            const response = await axios.put(`${API_URL}/edit-step`, {
                stepId: stepId,
                status: "Cancelled"
            })
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const completeStep = async () => {
        try {
            const response = await axios.put(`${API_URL}/edit-step`, {
                stepId: stepId,
                status: "Completed"
            })
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const parseDate = (date: string) => {
        const [day, month, year] = date.split('/').map(Number);
        return new Date(year, month - 1, day);
    }
    const setMinDate = (event: any, selectedDate: any) => {
        const utcDate = new Date(selectedDate)
        const localDate = new Date(
            utcDate.getTime() - utcDate.getTimezoneOffset() * 60000
        )
        setMinimumDate(localDate)
        setShowMinDate(false)
    }
    const setMaxDate = (event: any, selectedDate: any) => {
        const utcDate = new Date(selectedDate)
        const localDate = new Date(
            utcDate.getTime() - utcDate.getTimezoneOffset() * 60000
        )
        setMaximumDate(localDate)
        setShowMaxDate(false)
    }
    const handleUpdate = async () => {
        setLoading(true)
        if (step != null && minimumDate && maximumDate) {
            var result = await saveChanges(step.title, step.description, minimumDate, maximumDate)
            if (!result.error) {
                setShowUpdatedModal(true)
            }
        }
        setLoading(false)
    }
    const handleComplete = async () => {
        setLoading(true)
        if (step != null) {
            var result = await completeStep()
            if (!result.error) {
                for (const imageUri of images) {
                    const formData = new FormData();
                    formData.append("ContentId", step.stepId);

                    const fileName = imageUri.split("/").pop() || "image.jpg";
                    const match = /\.(\w+)$/.exec(fileName);
                    const fileType = match ? `image/${match[1]}` : "image";

                    formData.append("File", {
                        uri: imageUri,
                        name: fileName,
                        type: fileType,
                    } as any);

                    const res = await handleUploadImage(formData);
                    console.log("upload result:", res);
                }
                setShowCompletedModal(true)
            }
        }
        setLoading(false)
    }
    const handleCancel = async () => {
        setLoading(true)
        if (step != null) {
            var result = await cancelStep()
            if (!result.error) {
                setShowCancelledModal(true)
            }
        }
        setLoading(false)
    }
    useEffect(() => {
        const handlefetch = async () => {
            const result = await fetchStep()
            if (!result.error) {
                setStep(result)
                setMinimumDate(parseDate(result.minCompleteEstimate))
                setMaximumDate(parseDate(result.maxCompleteEstimate))
            }
        }
        handlefetch()
    }, [])
    const handleChange = (key: keyof StepResponse, value: any) => {
        setStep((prev) => prev ? { ...prev, [key]: value } : prev)
    }
    return (
        <View>
            <TopBar title="Edit Step" showBackButton />
            <ConfirmedModal visible={showUpdatedModal} message={"Step data has been updated"} onPress={() => setShowUpdatedModal(false)} />
            <ConfirmedModal visible={showCancelledModal} message={"Step has been cancelled"} onPress={() => setShowCancelledModal(false)} />
            <ConfirmedModal visible={showCompletedModal} message={"Step data has been completed"} onPress={() => setShowCompletedModal(false)} />
            {step != null ?
                <View>
                    <TextInputComponent value={step?.title} onChangeText={(text) => handleChange("title", text)} />
                    <TextInputComponent value={step?.description} onChangeText={(text) => handleChange("description", text)} />
                    <ColoredButton style={{ backgroundColor: Colors.green }} title={"Select min date"} onPress={() => setShowMinDate(true)} />
                    {showMinDate == true && minimumDate ?
                        <DateTimePicker
                            value={minimumDate}
                            mode="date"
                            is24Hour={true}
                            onChange={setMinDate}
                        />
                        : <></>}
                    <ColoredButton style={{ backgroundColor: Colors.green }} title={"Select max date"} onPress={() => setShowMaxDate(true)} />
                    {showMaxDate == true && maximumDate ?
                        <DateTimePicker
                            value={maximumDate}
                            mode="date"
                            is24Hour={true}
                            onChange={setMaxDate}
                        />
                        : <></>}
                    <ColoredButton style={{ backgroundColor: Colors.green }} title={"Save Changes"} onPress={() => handleUpdate()} isLoading={loading} />
                    {step.status == "Working" ?
                        <View>
                            <View style={styles.imagesContainer}>
                                <TouchableOpacity style={styles.addImageButton} onPress={() => pickImage()}>
                                    <View style={styles.addBorder}>
                                        <PlusSquare color={"#5CCFA3"} size={32} />
                                    </View>
                                </TouchableOpacity>
                                <ScrollView horizontal>
                                    {images.map((uri, index) => (
                                        <View key={index} >
                                            <Image
                                                source={{ uri }}
                                                style={{ width: 150, height: 150 }}
                                            />
                                            <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(index)}>
                                                <X size={20} color={"white"} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>
                            {images.length > 0 ?
                                <ColoredButton style={{ backgroundColor: Colors.green }} title={"Complete Step"} onPress={() => handleComplete()} isLoading={loading} disabled={false} />
                                :
                                <ColoredButton style={{ backgroundColor: Colors.darkGray }} title={"Complete Step"} onPress={() => handleComplete()} isLoading={loading} disabled={true} />
                            }

                        </View>
                        : <></>}

                    <ColoredButton style={{ backgroundColor: Colors.red }} title={"Cancel Step"} onPress={() => handleCancel()} isLoading={loading} />
                </View>
                : <></>}

        </View>
    )
}

const styles = StyleSheet.create({
    imagesContainer: {
        height: 150,
        flexDirection: 'row',
        borderStyle: 'solid',
        borderColor: '#31363F',
        borderBottomWidth: 1
    },
    addBorder: {
        width: "100%",
        height: "100%",
        justifyContent: 'center',
        borderStyle: 'dashed',
        borderColor: '#5CCFA3',
        borderRadius: 5,
        borderWidth: 1,
        alignItems: 'center',

    },
    addImageButton: {
        padding: 15,
        height: 150,
        width: 100,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        borderStyle: 'solid',
        borderColor: '#31363F',
        borderRightWidth: 1
    },

    removeImageButton: {
        position: 'absolute',
        width: 24,
        height: 24,
        right: 5,
        top: 5,
        backgroundColor: '#31363F',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center'

    }
})
