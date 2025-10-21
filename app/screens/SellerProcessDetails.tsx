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
import { useFocusEffect } from "@react-navigation/native";
import ConfirmedModal from "../../components/ConfirmedModal";

type SellerProcessDetailsProps = NativeStackScreenProps<RootStackParamList, "SellerProcessDetails">;
export default function SellerProcessDetails({ navigation, route }: SellerProcessDetailsProps) {
    const { processId } = route.params
    const [loading, setLoading] = useState(false)
    const [refresh, setRefresh] = useState(false)
    const [showRequestCreated, setRequestCreated] = useState(false)
    const [previousStepId, setPreviousStepId] = useState<string | null>(null)
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [steps, setSteps] = useState<StepResponse[]>([])
    const { theme } = useTheme()
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
    const handleFetch = async (reset = false) => {
        if (loading) return; // prevent duplicate triggers
        setLoading(true);
        const result = await fetchSteps(reset ? 1 : page);
        if (!result.error) {
            if (reset) {
                setPreviousStepId(result.steps[result.steps.length - 1].stepId)
                setSteps(result.steps); // replace on refresh
            } else {
                setPreviousStepId(result.steps[result.steps.length - 1].stepId)
                setSteps(prev => [...prev, ...result.steps]); // append normally
            }
            setTotal(result.total);
        }
        setLoading(false);
        setRefresh(false);
    };
    const handleCreateCompleteRequest = async () => {
        setLoading(true)
        const result = await createCompleteRequest()
        if(!result.error){
            setRequestCreated(true)
        }
        setLoading(false)
    }
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
    useFocusEffect(
        useCallback(() => {
            handleFetch(true);
        }, [])
    );
    const onRefresh = useCallback(() => {
        setRefresh(true);
        setPage(1);
        handleFetch(true);
    }, []);
    console.log(previousStepId)
    return (
        <View>
            <TopBar title="Process Details" showBackButton />
            <ConfirmedModal visible={showRequestCreated} message={"Completion request has been created"} onPress={()=>setRequestCreated(false) }/>
            <ColoredButton title={"Add Step"} style={{ backgroundColor: Colors.green }} onPress={() => navigation.navigate('AddStep', { processId: processId, previousStepId: previousStepId })} />
            <ColoredButton title={"Create Process Completion Request"} style={{ backgroundColor: Colors.green }} onPress={() => handleCreateCompleteRequest()} />
            <FlatList
                style={{ marginBottom: 300 }}
                data={steps}
                keyExtractor={(item: StepResponse) => item.stepId}
                renderItem={({ item }: { item: StepResponse }) => (<StepComponent step={item} navigation={navigation} editable={true} />)}
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