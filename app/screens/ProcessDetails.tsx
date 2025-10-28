import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { View, Text, FlatList, RefreshControl, ActivityIndicator, StyleSheet } from "react-native";
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

type ProcessDetailsProps = NativeStackScreenProps<RootStackParamList, "ProcessDetails">;
export default function ProcessDetails({ navigation, route }: ProcessDetailsProps) {
    const { processId } = route.params
    const { theme } = useTheme()
    const [process, setProcess] = useState<ProcessResponse>()
    const [completeRequest, setCompleteRequest] = useState<CompleteProcessResponse>()
    const [showProcessCompleted, setShowProcessCompleted] = useState(false)
    const [showProcessDeclined, setShowProcessDeclined] = useState(false)
    const respondCompletionRef = useRef(false)
    const textColor = theme === "dark" ? "white" : "black"
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
    const handleGetCompleteRequest = async () => {
        const result = await fetchCompleteRequest()
        if (!result.error) {
            if (result) {
                setCompleteRequest(result)
            }
        }
    }
    const handleGetProcess = async () => {
        const result = await fetchProcess()
        if (!result.error) {
            setProcess(result)
        }
    }
    const handleAccept = async () => {
        respondCompletionRef.current = true
        const response = await respondCompletion("Accepted")
        if (!response.error) {
            setShowProcessCompleted(true)
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
    useEffect(() => {
        if (process) {
            handleGetCompleteRequest()
        }
    }, [process])
    useEffect(() => {
        handleGetProcess()
    }, [])
    const renderHeader = () => (
        <View style={styles.headerContainer}>
            {process ?
                <View style={{ padding: 20, paddingVertical: 10 }}>
                    <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>{process.title}</Text>
                    <Text style={{ color: textColor, fontWeight: 'bold' }}>Description:</Text>
                    <Text style={{ color: textColor, marginBottom: 10 }}>{process?.description}</Text>
                </View> :
                <ActivityIndicator size="large" style={{ height: 64, margin: 10, borderRadius: 5 }} color={theme == "dark" ? "white" : "black"} />
            }
            {process?.status == "Working" ? <ColoredButton title={"Create Refund Request"} onPress={() => navigation.navigate('CreateRefundRequest', { processId: processId })} style={{ backgroundColor: Colors.green }} /> : <></>}
            {completeRequest && completeRequest.status == 'Pending' ?
                <View style={styles.completeContainer}>
                    <Text style={{ color: textColor, textAlign: 'center', marginBottom: 10, fontWeight: 'bold' }}>Seller has made a request to complete this process</Text>
                    <View style={styles.buttonsContainer}>
                        <ColoredButton title={"Accept request"} style={{ backgroundColor: Colors.green, width: '50%' }} onPress={() => handleAccept()} isLoading={respondCompletionRef.current} />
                        <ColoredButton title={"Decline request"} style={{ backgroundColor: Colors.peach, width: '50%' }} onPress={() => handleDecline()} isLoading={respondCompletionRef.current} />
                    </View>
                </View>
                : <></>}
            {process && process.status == 'Completed' ? <ColoredButton title={"Rate Seller"} style={{ backgroundColor: Colors.green }} onPress={() => navigation.navigate('ReviewSeller', { sellerId: process?.sellerId })} /> : <></>}
        </View>
    );
    return (
        <View>
            <TopBar title="Process Details" showBackButton />
            <ConfirmedModal onPress={() => setShowProcessCompleted(false)} visible={showProcessCompleted} message={"Process has been completed"} />
            <ConfirmedModal onPress={() => setShowProcessDeclined(false)} visible={showProcessDeclined} message={"Process completion has been declined"} />
            <StepsList processId={processId} renderHeader={renderHeader} navigation={navigation} editable={false} />
        </View>
    )
}
const styles = StyleSheet.create({
    headerContainer: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.darkGray
    },
    completeContainer: {
        padding: 20,
        paddingVertical: 10,
        backgroundColor: Colors.darkGray
    },
    buttonsContainer: {
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'center'
    }
})