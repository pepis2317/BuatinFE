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
import { useFocusEffect } from "@react-navigation/native";
import ConfirmedModal from "../../components/ConfirmedModal";
import { CompleteProcessResponse } from "../../types/CompleteProcessResponse";
import { ProcessResponse } from "../../types/ProcesssResponse";
import StepsList from "../../components/StepsList";

type SellerProcessDetailsProps = NativeStackScreenProps<RootStackParamList, "SellerProcessDetails">;
export default function SellerProcessDetails({ navigation, route }: SellerProcessDetailsProps) {
    const { processId } = route.params
    const [showRequestCreated, setRequestCreated] = useState(false)
    const [completeRequest, setCompleteRequest] = useState<CompleteProcessResponse>()
    const [process, setProcess] = useState<ProcessResponse>()
    const [latestStep, setLatestStep] = useState<StepResponse>()
    const { theme } = useTheme()
    const createCompletionRef = useRef(false)
    const textColor = theme === "dark" ? "white" : "black"
    const fetchProcess = async () => {
        try {
            const response = await axios.get(`${API_URL}/get-process?processId=${processId}`)
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const createCompleteRequest = async () => {
        try {
            const response = await axios.post(`${API_URL}/create-complete-request`, {
                processId: processId
            })
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
    const handleCreateCompleteRequest = async () => {
        createCompletionRef.current = true
        const result = await createCompleteRequest()
        if (!result.error) {
            setRequestCreated(true)
            setCompleteRequest(result)
        }
        createCompletionRef.current = false
    }
    const handleGetCompleteRequest = async () => {
        const result = await fetchCompleteRequest()
        if (!result.error) {
            if (result) {
                setCompleteRequest(result)
            }
        }
    }
    const handleFetchProcess = async () => {
        createCompletionRef.current = true
        const result = await fetchProcess()
        if (!result.error) {
            setProcess(result)
        }
        createCompletionRef.current = false
    }
    useEffect(() => {
        if (process) {
            handleGetCompleteRequest()
        }
    }, [process])
    useEffect(() => {
        handleFetchProcess()
    }, [])
    const renderHeader = () => (
        <View>
            {process ?
                <View style={styles.headerContainer}>
                    <View style={{ padding: 20, paddingVertical: 10 }}>
                        <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>{process.title}</Text>
                        <Text style={{ color: textColor, fontWeight: 'bold' }}>Description:</Text>
                        <Text style={{ color: textColor, marginBottom: 10 }}>{process.description}</Text>
                    </View>
                    {process.status != "Completed" && process.status != "Cancelled" ?
                        <View>
                            {completeRequest && completeRequest.status == "Pending" ?
                                <View style={styles.pending}>
                                    <Text style={{ color: textColor, fontWeight: 'bold', textAlign: 'center' }}>Process completion request pending</Text>
                                </View>
                                :
                                <View>
                                    {!latestStep || latestStep.status == "Completed" || latestStep.status == "Cancelled" || latestStep.status == "Declined" ? <ColoredButton title={"Add Step"} style={{ backgroundColor: Colors.green }} onPress={() => navigation.navigate('AddStep', { processId: processId, previousStepId: latestStep ? latestStep.stepId : null })} /> : <></>}
                                    {latestStep && latestStep.status == "Completed" ? <ColoredButton title={"Create Process Completion Request"} style={{ backgroundColor: Colors.green }} onPress={() => handleCreateCompleteRequest()} /> : <></>}
                                </View>
                            }
                        </View> :
                        <View style={styles.pending}>
                            {process.status == "Completed" ? <Text style={{ color: Colors.green, fontWeight: 'bold', textAlign: 'center' }}>Process has been completed</Text> : <Text style={{ color: Colors.peach, fontWeight: 'bold', textAlign: 'center' }}>Process has been cancelled</Text>}
                        </View>
                    }
                </View>
                : <ActivityIndicator size="large" style={{ height: 64, margin: 10, borderRadius: 5 }} color={theme == "dark" ? "white" : "black"} />}
            {process && process.status == 'Completed' ? <ColoredButton title={"Rate User"} style={{ backgroundColor: Colors.green }} onPress={() => navigation.navigate('ReviewUser', { userId: process?.userId })} /> : <></>}

        </View>
    )
    return (
        <View>
            <TopBar title="Process Details" showBackButton />
            <ConfirmedModal visible={showRequestCreated} message={"Completion request has been created"} onPress={() => setRequestCreated(false)} />
            <StepsList processId={processId} renderHeader={renderHeader} navigation={navigation} editable={true} />
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
    },
    pending: {
        backgroundColor: Colors.darkGray,
        padding: 20,
        paddingVertical: 10
    }
})