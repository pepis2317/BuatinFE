import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { View, Text, FlatList, RefreshControl } from "react-native";
import TopBar from "../../components/TopBar";
import ColoredButton from "../../components/ColoredButton";
import Colors from "../../constants/Colors";
import { useCallback, useEffect, useState } from "react";
import { StepResponse } from "../../types/StepResponse";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import StepComponent from "../../components/StepComponent";
import ConfirmedModal from "../../components/ConfirmedModal";
import { ProcessResponse } from "../../types/ProcesssResponse";

type ProcessDetailsProps = NativeStackScreenProps<RootStackParamList, "ProcessDetails">;
export default function ProcessDetails({ navigation, route }: ProcessDetailsProps) {
    const { processId } = route.params
    const [loading, setLoading] = useState(false)
    const [refresh, setRefresh] = useState(false)
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [steps, setSteps] = useState<StepResponse[]>([])
    const [process, setProcess] = useState<ProcessResponse>()
    const [completeRequestId, setCompleteRequestId] = useState('')
    const [showProcessCompleted, setShowProcessCompleted] = useState(false)
    const [showProcessDeclined, setShowProcessDeclined] = useState(false)
    const { theme } = useTheme()
    const { onGetUserToken, user } = useAuth()
    const textColor = theme === "dark" ? "white" : "black"
    const fetchSteps = async (pageNumber: number) => {
        try {
            const response = await axios.get(`${API_URL}/get-steps?processId=${processId}&pageSize=3&pageNumber=${pageNumber}`)
            setRefresh(false)
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const fetchProcess = async () => {
        try {
            const response = await axios.get(`${API_URL}/get-process?processId=${processId}`)
            setRefresh(false)
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const fetchCompleteRequest = async () => {
        try {
            const response = await axios.get(`${API_URL}/get-complete-request?processId=${processId}`)
            setRefresh(false)
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const handleFetch = async (reset = false) => {
        if (loading) return; // prevent duplicate triggers
        setLoading(true);
        const process = await fetchProcess()
        if (!process.error) {
            setProcess(process)
            console.log(process)
        }
        const result = await fetchSteps(reset ? 1 : page);
        if (!result.error) {
            if (reset) {
                setSteps(result.steps); // replace on refresh
            } else {
                setSteps(prev => [...prev, ...result.steps]); // append normally
            }
            setTotal(result.total);
        }
        setLoading(false);
        setRefresh(false);
    };
    const loadMore = () => {
        if (!loading && steps.length < total) {
            setPage(prev => prev + 1)
        }
    };
    useEffect(() => {
        if (steps.length <= total) {
            handleFetch()
        }
    }, [page])
    const onRefresh = useCallback(() => {
        setRefresh(true);
        setPage(1);
        handleFetch(true);
    }, []);
    const handleGetCompleteRequest = async () => {
        const result = await fetchCompleteRequest()
        if (!result.error) {
            if (result) {
                setCompleteRequestId(result.completeProcessRequestId)
            }
        }
    }
    const acceptCompletion = async () => {
        try {
            const response = await axios.put(`${API_URL}/respond-complete-request`, {
                completeProcessRequestId: completeRequestId,
                response: "Accepted"
            })
            setRefresh(false)
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const declineCompletion = async () => {
        try {
            const response = await axios.put(`${API_URL}/respond-complete-request`, {
                completeProcessRequestId: completeRequestId,
                response: "Declined"
            })
            setRefresh(false)
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const handleAccept = async () => {
        setLoading(true)
        const response = await acceptCompletion()
        if (!response.error) {
            setShowProcessCompleted(true)
        }
        setLoading(false)
    }
    const handleDecline = async () => {
        setLoading(true)
        const response = await declineCompletion()
        if (!response.error) {
            setShowProcessDeclined(true)
        }
        setLoading(false)
    }
    useEffect(() => {
        handleGetCompleteRequest()
    }, [])
    return (
        <View>
            <TopBar title="Process Details" showBackButton />
            {process?.status == "Working" ? <ColoredButton title={"Create Refund Request"} onPress={() => navigation.navigate('CreateRefundRequest', { processId: processId })} style={{backgroundColor:Colors.green}}/> : <></>}

            <ConfirmedModal onPress={() => setShowProcessCompleted(false)} visible={showProcessCompleted} message={"Process has been completed"} />
            <ConfirmedModal onPress={() => setShowProcessDeclined(false)} visible={showProcessDeclined} message={"Process has been declined"} />
            {completeRequestId != '' ?
                <View>
                    <Text>aa {completeRequestId}</Text>
                    <ColoredButton title={"Accept completion request"} onPress={() => handleAccept()} />
                    <ColoredButton title={"Decline completion request"} onPress={() => handleDecline()} />
                </View>
                : <></>}
            <FlatList
                data={steps}
                keyExtractor={(item: StepResponse) => item.stepId}
                renderItem={({ item }: { item: StepResponse }) => <StepComponent step={item} navigation={navigation} editable={false} />}
                contentContainerStyle={{ paddingBottom: 8 }}
                keyboardShouldPersistTaps="handled"
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
                }
            />
        </View>
    )
}