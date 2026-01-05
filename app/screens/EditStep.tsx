import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, KeyboardAvoidingView, Platform } from "react-native";
import TopBar from "../../components/TopBar";
import React, { useEffect, useState } from "react";
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
import { Calendar, PanelTopDashedIcon, PlusSquare, X } from "lucide-react-native";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useTheme } from "../context/ThemeContext";
import { processFontWeight } from "react-native-reanimated/lib/typescript/css/native";
import ErrorComponent from "../../components/ErrorComponent";
import colors from "../../constants/Colors";

type EditStepProps = NativeStackScreenProps<RootStackParamList, "EditStep">;

export default function EditStep({ navigation, route }: EditStepProps) {
    const { stepId } = route.params
    const { textColor, borderColor } = useTheme()
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<StepResponse | null>()
    const [minimumDate, setMinimumDate] = useState<Date>()
    const [maximumDate, setMaximumDate] = useState<Date>()
    const [showUpdatedModal, setShowUpdatedModal] = useState(false)
    const [showCompletedModal, setShowCompletedModal] = useState(false)
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [showCancelledModal, setShowCancelledModal] = useState(false)
    const [showMinDate, setShowMinDate] = useState(false)
    const [showMaxDate, setShowMaxDate] = useState(false)
    const [errMessage, setErrMessage] = useState("")
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

    const saveChanges = async (formData: FormData) => {
        try {
            const response = await axios.put(`${API_URL}/edit-step`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
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
        if (!selectedDate) return;
        setMinimumDate(selectedDate);
        setShowMinDate(false)
    }

    const setMaxDate = (event: any, selectedDate: any) => {
        if (!selectedDate) return;
        setMaximumDate(selectedDate);
        setShowMaxDate(false)
    }

    const handleUpdate = async () => {
        if (!step) return
        if (!step.title || !step.description || !minimumDate || !maximumDate) {
            setErrMessage("All forms must be filled")
            return
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const min = new Date(minimumDate);
        min.setHours(0, 0, 0, 0);

        const max = new Date(maximumDate);
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
        if (step != null && minimumDate && maximumDate) {
            const formData = new FormData()
            formData.append("stepId", stepId)
            formData.append("title", step.title)
            formData.append("description", step.description)
            formData.append("minCompleteEstimate", minimumDate.toISOString());
            formData.append("maxCompleteEstimate", maximumDate.toISOString());
            var result = await saveChanges(formData)
            if (!result.error) {
                setShowUpdatedModal(true)
            }
        }
        setLoading(false)
    }

    const handleComplete = async () => {
        setLoading(true)
        if (step != null) {
            const formData = new FormData()
            formData.append("stepId", stepId)
            formData.append("status", "Completed")
            for (const imageUri of images) {

                const fileName = imageUri.split("/").pop() || "image.jpg";
                const match = /\.(\w+)$/.exec(fileName);
                const fileType = match ? `image/${match[1]}` : "image";

                formData.append("images", {
                    uri: imageUri,
                    name: fileName,
                    type: fileType,
                } as any);
            }
            var result = await saveChanges(formData)
            if (!result.error) {

                setShowCompletedModal(true)
            }
        }
        setLoading(false)
    }

    const handleCancel = async () => {
        setLoading(true)
        if (step != null) {
            const formData = new FormData()
            formData.append("stepId", stepId)
            formData.append("status", "Cancelled")
            var result = await saveChanges(formData)
            if (!result.error) {
                setShowCancelModal(false)
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
        <View style={{ flex: 1 }}>

            <TopBar title="Edit Step" showBackButton />
            
            <ConfirmedModal isFail={false} visible={showUpdatedModal} message={"Step has been updated"} onPress={() => navigation.goBack()} />
            <ConfirmedModal isFail={false} visible={showCancelledModal} message={"Step has been cancelled"} onPress={() => navigation.goBack()} />
            <ConfirmedModal isFail={false} visible={showCompletedModal} message={"Step has been completed"} onPress={() => navigation.goBack()} />
            <ConfirmationModal visible={showCancelModal} message={"Cancel step? Funds will be refunded to user"} onAccept={() => handleCancel()} onCancel={() => setShowCancelModal(false)} />
            {step != null ?

                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={35}>

                    <ScrollView>
                        <View style={{ padding: 16, gap: 12 }}>
                            <View>
                                <Text style={{ color: textColor, fontWeight: 'bold', marginBottom: 8 }}>Title</Text>
                                <TextInputComponent value={step?.title} onChangeText={(text) => handleChange("title", text)} />
                            </View>
                            <View>
                                <Text style={{ color: textColor, fontWeight: 'bold', marginBottom: 8 }}>Description</Text>
                                <TextInputComponent value={step?.description} style={{height:120}}multiline onChangeText={(text) => handleChange("description", text)} />
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16}}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: textColor, fontWeight: 'bold', marginBottom: 8}}>Min. Estimate</Text>
                                    <TouchableOpacity style={[styles.date, { borderColor: borderColor }]} onPress={() => setShowMinDate(true)}>
                                        <Calendar color={textColor} />
                                        <Text style={{ color: textColor }}>{minimumDate?.toLocaleDateString()}</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: textColor, fontWeight: 'bold', marginBottom: 8 }}>Max. Estimate</Text>
                                    <TouchableOpacity style={[styles.date, { borderColor: borderColor }]} onPress={() => setShowMaxDate(true)}>
                                        <Calendar color={textColor} />
                                        <Text style={{ color: textColor}}>{maximumDate?.toLocaleDateString()}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            {showMinDate == true && minimumDate ?
                                <DateTimePicker
                                    value={minimumDate}
                                    mode="date"
                                    is24Hour={true}
                                    onChange={setMinDate}
                                />
                                : <></>}
                            {showMaxDate == true && maximumDate ?
                                <DateTimePicker
                                    value={maximumDate}
                                    mode="date"
                                    is24Hour={true}
                                    onChange={setMaxDate}
                                />
                                : <></>}
                            {errMessage ?
                                <ErrorComponent errorsString={errMessage} />
                                : <></>}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 16, marginTop: 4}}>
                                {step.status != "Submitted" ? < ColoredButton style={[{ backgroundColor: Colors.red }, styles.button]} title={"Cancel Step"} onPress={() => setShowCancelModal(true)} isLoading={loading} /> : <></>}
                                <ColoredButton style={[{ backgroundColor: Colors.green }, styles.button]} title={"Save Changes"} onPress={() => handleUpdate()} isLoading={loading} />
                            </View>
                            {step.status == "Working" ?
                                <View>
                                    <Text style={{ color: textColor, fontWeight: 'bold', marginBottom: 8}}>Step Completion Proof</Text>

                                    <View style={styles.imagesContainer}>
                                        {/* Add Image Button */}
                                        <TouchableOpacity style={styles.addImageButton} onPress={() => pickImage()}>
                                            <View style={styles.addBorder}>
                                                <PlusSquare color={colors.primary} size={32} />
                                            </View>
                                        </TouchableOpacity>

                                        {/* Image Preview */}
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

                                    <View style={{ marginTop: 16 }}>
                                        {images.length > 0 ?
                                            <ColoredButton style={{ backgroundColor: Colors.green }} title={"Complete Step"} onPress={() => handleComplete()} isLoading={loading} disabled={false} />
                                            :
                                            <ColoredButton style={{ backgroundColor: Colors.darkGray }} title={"Complete Step"} isLoading={loading} disabled={true} />
                                        }
                                    </View>
                                </View>
                                : <></>}
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>




                : <></>}

        </View>
    )
}

const styles = StyleSheet.create({
    button: {
        flex: 1,
    },
    date: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderWidth: 1,
        borderRadius: 8,
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    imagesContainer: {
        flexDirection: 'row',
        borderStyle: 'solid',
        borderColor: colors.darkBorder,
        borderBottomWidth: 1
    },
    addBorder: {
        width: "100%",
        height: "100%",
        justifyContent: 'center',
        borderStyle: 'dashed',
        borderColor: colors.darkBorder,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: 'center',
    },
    addImageButton: {
        padding: 16,
        height: 150,
        width: 120,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        borderStyle: 'solid',
        borderColor: '#31363F',
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
