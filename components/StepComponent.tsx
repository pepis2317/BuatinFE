import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { StepResponse } from "../types/StepResponse";
import ColoredButton from "./ColoredButton";
import axios from "axios";
import { API_URL } from "../constants/ApiUri";
import { useCallback, useEffect, useState } from "react";
import ConfirmedModal from "./ConfirmedModal";
import Colors from "../constants/Colors";
import { useTheme } from "../app/context/ThemeContext";
import { Pencil } from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";

export default function StepComponent({ step, navigation, editable }: { step: StepResponse, navigation: any, editable: boolean }) {
    const [loading, setLoading] = useState(false)
    const [statusColor, setStatusColor] = useState(Colors.darkBorder)
    const [showDeclined, setShowDeclined] = useState(false)
    const [images, setImages] = useState<string[]>([])
    const { theme } = useTheme()
    var textColor = theme == "dark" ? "white" : "black"
    const decline = async () => {
        try {
            const response = await axios.put(`${API_URL}/decline-step`, {
                stepId: step.stepId,
            })
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    var fetchImages = async () => {
        try {
            const res = await axios.get(`${API_URL}/get-images?ContentId=${step.stepId}`)
            return res.data
        } catch (e: any) {
            return { error: true, msg: e?.response?.data?.detail || "An error occurred" };
        }
    }
    const handleDecline = async () => {
        setLoading(true)
        const result = await decline();
        if (!result.error) {
            step.status = "Declined"
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
    const loadData = ()=>{
        if (step.status == "Completed") {
            setStatusColor(Colors.green)
            loadImages()
        } else if (step.status == "Cancelled") {
            setStatusColor(Colors.peach)
        }
    }
    useEffect(() => {
        loadData()
    }, [step])
    return (
        <View style={styles.container}>
            <ConfirmedModal visible={showDeclined} message={"Step has been declined"} onPress={() => setShowDeclined(false)} />
            <View style={{ flexDirection: 'row' }}>
                <View style={styles.left}>
                    <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>{step.title}</Text>
                    <Text style={{ color: textColor, fontWeight: 'bold' }}>Description:</Text>
                    <Text style={{ color: textColor, marginBottom: 10 }}>{step.description}</Text>
                    <Text style={{ color: textColor, fontWeight: 'bold' }}>Estimated Completion</Text>
                    <Text style={{ color: textColor, marginBottom: 10 }}>{step.minCompleteEstimate} - {step.maxCompleteEstimate}</Text>
                    <Text style={{ color: textColor, fontWeight: 'bold' }}>Status:</Text>
                    <Text style={{ color: statusColor }}>{step.status}</Text>
                    {editable == true ?
                        <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditStep', { stepId: step.stepId })}>
                            <Pencil color={textColor} size={20} />
                        </TouchableOpacity>
                        : <></>}

                </View>
                <View style={[styles.right, { backgroundColor: statusColor }]} />
            </View>
            {editable == false && step.status == "Submitted" ?
                <View style={styles.paymentInfo}>
                    <Text style={{ color: textColor, fontWeight: 'bold' }}>Price:</Text>
                    <Text style={{ color: textColor, marginBottom: 10 }}>Rp.{step.price / 100}</Text>
                    <View style={styles.buttonContainer}>
                        <ColoredButton title={"Accept & Pay step"} style={{ backgroundColor: Colors.green, width: '50%' }} onPress={() => navigation.navigate('AcceptAndPay', { stepId: step.stepId })} />
                        <ColoredButton title={"Decline step"} style={{ backgroundColor: Colors.peach, width: '50%' }} onPress={() => handleDecline()} isLoading={loading} />
                    </View>
                </View>
                : <></>}
            {step.status == "Completed" ?
                <View style={styles.images}>
                    <ScrollView horizontal>
                        {images.map((uri, index) => (
                            <View key={index} >
                                <Image
                                    source={{ uri }}
                                    style={{ width: 150, height: 150 }}
                                />
                            </View>
                        ))}
                    </ScrollView>
                </View>
                : <></>}
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.darkGray
    },
    paymentInfo: {
        padding: 20,
        paddingVertical: 10,
        backgroundColor: Colors.darkGray,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'center'
    },
    left: {
        flex: 1,
        padding: 20
    },
    right: {
        width: 5,
        alignSelf: "stretch", // make it full height
    },
    editButton: {
        position: 'absolute',
        right: 20,
        top: 20
    },
    images: {
        height: 150,
        flexDirection: 'row',
        borderStyle: 'solid',
        borderColor: Colors.darkGray,
        borderBottomWidth: 1,
        backgroundColor: Colors.darkGray
    }
})