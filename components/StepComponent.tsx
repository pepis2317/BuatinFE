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

export default function StepComponent({ step, navigation, editable, index }: { step: StepResponse, navigation: any, editable: boolean, index: number }) {
    const [loading, setLoading] = useState(false)
    const [statusColor, setStatusColor] = useState(Colors.darkBorder)
    const [showDeclined, setShowDeclined] = useState(false)
    const [images, setImages] = useState<string[]>([])
    const [overdue, setOverdue] = useState(false)
    const { textColor, borderColor, subtleBorderColor } = useTheme()
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
    const loadData = () => {
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
    useEffect(() => {
        const [day, month, year] = step.maxCompleteEstimate.split("/");
        const date = new Date(Number(year), Number(month) - 1, Number(day));
        setOverdue(date < new Date())
    }, [])
    return (
        <View style={styles.container}>
            <ConfirmedModal isFail={false} visible={showDeclined} message={"Step has been declined"} onPress={() => setShowDeclined(false)} />
            <View style={styles.containerLeft}>
                <View style={[styles.indicator, { borderColor: statusColor }]}>
                    <Text style={{ color: textColor, fontWeight: 'bold' }}>{index}</Text>
                </View>
                <View style={[styles.lineIndicator, { backgroundColor: statusColor }]} />
            </View>

            <View style={styles.containerRight}>
                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                    <View style={[styles.info, { borderColor: borderColor }]}>
                        <View style={{ padding: 15, paddingVertical: 10 }}>
                            <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}>{step.title}</Text>
                            <Text style={{ color: textColor, fontSize: 12 }}>{step.description}</Text>
                        </View>
                        {overdue && step.status == "Working" ?
                            <View style={{ backgroundColor: subtleBorderColor, paddingVertical: 10, paddingHorizontal: 20 }}>
                                <Text style={{ color: textColor, fontWeight: 'bold', textAlign: 'center' }}>This Step is Overdue</Text>
                            </View>
                            : <></>
                        }
                        <View style={[styles.estimation, { borderColor: borderColor }]}>
                            <View style={styles.date}>
                                <Text style={{ color: textColor, fontWeight: 'bold' }}>{step.minCompleteEstimate}</Text>
                                <Text style={{ color: textColor }}>-</Text>
                                <Text style={{ color: textColor, fontWeight: 'bold' }}>{step.maxCompleteEstimate}</Text>
                            </View>
                        </View>

                        <View style={[styles.status, { backgroundColor: subtleBorderColor}]}>
                            <Text style={{ color: statusColor, fontWeight: 'bold' }}>
                                {step.status}
                            </Text>
                        </View>

                        {editable == true && step.status != "Completed" && step.status != "Cancelled" && step.status != "Declined" ?
                            <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditStep', { stepId: step.stepId })}>
                                <Pencil color={textColor} size={16} />
                            </TouchableOpacity>
                            : <></>
                        }

                        {editable == false && step.status == "Submitted" ?
                            <View style={[styles.paymentInfo, { backgroundColor: subtleBorderColor}]}>
                                <Text style={{ color: textColor, fontWeight: 'bold' }}>Price:</Text>
                                <Text style={{ color: textColor, marginBottom: 10 }}>Rp.{step.price / 100}</Text>
                                <View style={styles.buttonContainer}>
                                    <ColoredButton title={"Accept & Pay step"} style={{ backgroundColor: Colors.green, width: '48%'}} onPress={() => navigation.navigate('AcceptAndPay', { stepId: step.stepId })} />
                                    <ColoredButton title={"Decline step"} style={{ backgroundColor: Colors.peach, width: '48%' }} onPress={() => handleDecline()} isLoading={loading} />
                                </View>
                            </View>
                            : <></>}
                    </View>


                </View>

                {step.status == "Completed" ?
                    <View style={{ gap: 10, marginBottom: 10 }}>
                        {images.map((uri, index) => (
                            <View key={index} >
                                <Image
                                    source={{ uri }}
                                    style={{ width: 150, height: 150, borderRadius: 10 }}
                                />
                            </View>
                        ))}
                    </View>
                    : <></>}
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    date: {
        flexDirection: 'row',
        alignContent: 'center',
        justifyContent: 'space-around'
    },
    estimation: {
        padding: 15,
        paddingVertical: 10,
        borderTopWidth: 1
    },
    status: {
        padding: 10,
        alignItems: 'center'
    },
    containerLeft: {
        width: '20%',
        alignItems: 'center'
    },
    containerRight: {
        width: '80%'
    },
    indicator: {
        width: 50,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50,
        borderWidth: 1
    },
    lineIndicator: {
        height: "100%",
        width: 1
    },
    container: {
        flexDirection: 'row',
        flex: 1,
        overflow: 'hidden'
    },
    paymentInfo: {
        padding: 20,
        paddingVertical: 10,
        paddingTop:0
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    info: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 10,
        marginRight: 20,
        overflow: 'hidden'
    },
    editButton: {
        position: 'absolute',
        right: 20,
        top: 20
    },
})