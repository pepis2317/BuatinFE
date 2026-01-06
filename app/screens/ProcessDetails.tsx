import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { View, Text, FlatList, RefreshControl, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import TopBar from "../../components/TopBar";
import ColoredButton from "../../components/ColoredButton";
import Colors from "../../constants/Colors";
import { useCallback, useEffect, useRef, useState } from "react";
import { StepResponse } from "../../types/StepResponse";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import StepComponent from "../../components/StepComponent";
import ConfirmedModal from "../../components/ConfirmedModal";
import { ProcessResponse } from "../../types/ProcesssResponse";
import { useFocusEffect } from "@react-navigation/native";
import { CompleteProcessResponse } from "../../types/CompleteProcessResponse";
import StepsList from "../../components/StepsList";
import { Menu } from "lucide-react-native";
import { RefundResponse } from "../../types/RefundResponse";

type ProcessDetailsProps = NativeStackScreenProps<RootStackParamList, "ProcessDetails">;

export default function ProcessDetails({ navigation, route }: ProcessDetailsProps) {
    const { processId } = route.params
    const { textColor, borderColor, foregroundColor, subtleBorderColor} = useTheme()
    const [process, setProcess] = useState<ProcessResponse>()
    const [latestStep, setLatestStep] = useState<StepResponse>()
    const [canRefund, setCanRefund] = useState(false)
    const [refund, setRefund] = useState<RefundResponse>();
    const [completeRequest, setCompleteRequest] = useState<CompleteProcessResponse>()
    const [showProcessCompleted, setShowProcessCompleted] = useState(false)
    const [showProcessDeclined, setShowProcessDeclined] = useState(false)
    const [menuPressed, setMenuPressed] = useState(false)
    const respondCompletionRef = useRef(false)

    const fetchRefund = async () => {
        try {
            const response = await axios.get(`${API_URL}/get-refund-by-process-id?processId=${processId}`)
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }

    const fetchProcess = async () => {
        try {
            const response = await axios.get(`${API_URL}/get-process?processId=${processId}`)
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }

    const fetchCompleteRequest = async () => {
        try {
            const response = await axios.get(`${API_URL}/get-complete-request?processId=${processId}`)
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }

    const respondCompletion = async (completionResponse: string) => {
        try {
            const response = await axios.put(`${API_URL}/respond-complete-request`, {
                completeProcessRequestId: completeRequest?.completeProcessRequestId,
                response: completionResponse
            })
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }

    const handleGetRefund = async () => {
        const result = await fetchRefund()
        if (!result.error) {
            setRefund(result)
        }
    }

    const handleFetchProcess = async () => {
        const result = await fetchProcess()
        if (!result.error) {
            setProcess(result)
            const completeRequest = await fetchCompleteRequest()
            if (!completeRequest.error) {
                setCompleteRequest(completeRequest)
            }
        }
    }

    const handleAccept = async () => {
        respondCompletionRef.current = true
        const response = await respondCompletion("Accepted")
        if (!response.error) {
            setShowProcessCompleted(true)
            setCanRefund(false)
            setCompleteRequest(response)
        }
        respondCompletionRef.current = false
    }

    const handleDecline = async () => {
        respondCompletionRef.current = true
        const response = await respondCompletion("Declined")
        if (!response.error) {
            setShowProcessDeclined(true)
            setCompleteRequest(response)
        }
        respondCompletionRef.current = false
    }

    const reset = async () =>{
        handleFetchProcess()
        handleGetRefund()
    }

    useFocusEffect(
        useCallback(() => {
            reset()
        }, [])
    );

    useEffect(() => {
        if (process && process.status == "In Progress" && !(refund && refund.status == "Pending")) {
            setCanRefund(true)
        } else {
            setCanRefund(false)
        }
    }, [process, refund])

    const renderHeader = () => (
        <View style={{ padding: 16 }}>
            {process ?
                <View style={[styles.headerContainer, { borderColor: borderColor }]}>
                    <View style={{ padding: 16 }}>
                        <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>{process.title}</Text>
                        <Text style={{ color: textColor }}>{process.description}</Text>
                    </View>

                    {process.status == "Completed" || process.status == "Cancelled" ?
                        <View style={[styles.pending, { backgroundColor: subtleBorderColor }]}>
                            {process.status == "Completed" ?
                                <Text style={{ color: Colors.green, fontWeight: 'bold', textAlign: 'center' }}>Process has been completed</Text> :
                                <Text style={{ color: Colors.red, fontWeight: 'bold', textAlign: 'center' }}>Process has been cancelled</Text>}
                        </View>
                        :
                        <View>
                            {completeRequest && completeRequest.status == 'Pending' ?
                                <View style={[ styles.pending, { backgroundColor: subtleBorderColor }]}>
                                    <Text style={{ color: textColor, textAlign: 'center', marginBottom: 10, fontWeight: 'bold' }}>Seller has made a request to complete this process</Text>
                                    <View style={styles.buttonsContainer}>
                                        <ColoredButton title={"Decline"} style={{ backgroundColor: Colors.red, flex: 1}} onPress={() => handleDecline()} isLoading={respondCompletionRef.current} />
                                        <ColoredButton title={"Accept"} style={{ backgroundColor: Colors.green, flex: 1}} onPress={() => handleAccept()} isLoading={respondCompletionRef.current} />
                                    </View>
                                </View>
                                : <></>}
                        </View>
                    }
                    {refund && refund.status == 'Pending' ?
                        <View style={[styles.pending, { backgroundColor: subtleBorderColor }]}>
                            <Text style={{ color: textColor, fontWeight: 'bold', textAlign: 'center' }}>This process has a pending refund request</Text>
                        </View> : <></>}

                </View>
                : <ActivityIndicator size="large" style={{ height: 64, margin: 10, borderRadius: 5 }} color={textColor} />}
        </View>
    )
    return (
        <View style={{ flex: 1 }}>

            <TopBar title="Process Details" showBackButton />

            <ConfirmedModal isFail={false} onPress={() => setShowProcessCompleted(false)} visible={showProcessCompleted} message={"Process has been completed"} />
            <ConfirmedModal isFail={false} onPress={() => setShowProcessDeclined(false)} visible={showProcessDeclined} message={"Process completion has been declined"} />

            {process?.status != "Completed" && process?.status != "Cancelled" ?
                <View style={styles.buttonContainer}>
                    {menuPressed ?
                        <View style={[styles.popupMenu, { backgroundColor: foregroundColor, borderColor: borderColor }]}>
                            <TouchableOpacity
                                style={{ padding: 16 }}
                                disabled={!canRefund}
                                onPress={() => navigation.navigate('CreateRefundRequest', { processId: processId })}
                            >
                                <Text style={{ color: textColor, fontWeight: 'bold', opacity: canRefund ? 1 : 0.2 }}>Create Refund Request</Text>
                            </TouchableOpacity>
                        </View>
                        : <></>}
                    <TouchableOpacity style={styles.menu} onPress={() => setMenuPressed(!menuPressed)}>
                        <Menu color={"white"} />
                    </TouchableOpacity>
                </View> : <></>}
            <StepsList processId={processId} renderHeader={renderHeader} navigation={navigation} editable={false} setLatestStep={setLatestStep} />
        </View>
    )
}
const styles = StyleSheet.create({
    popupMenu: {
        borderRadius: 10,
        borderWidth: 1,
        overflow: 'hidden'
    },
    menu: {
        backgroundColor: Colors.green,
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
        aspectRatio: 1,
        gap: 5,
        padding: 5,
        paddingHorizontal: 10,
        borderRadius: 50,
    },
    headerContainer: {
        borderWidth: 1,
        borderRadius: 10,
        overflow: 'hidden'
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 15,
        right: 15,
        zIndex: 10,
        alignItems: 'flex-end',
        gap: 5
    },
    buttonsContainer: {
        flexDirection: 'row',
        gap: 16,
        justifyContent: 'center'
    },
    pending: {
        padding: 16,
    }
})