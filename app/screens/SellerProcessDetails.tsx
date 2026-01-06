import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { View, Text, FlatList, RefreshControl, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import TopBar from "../../components/TopBar";
import ColoredButton from "../../components/ColoredButton";
import Colors from "../../constants/Colors";
import { useCallback, useEffect, useRef, useState } from "react";
import { StepResponse } from "../../types/StepResponse";
import { useTheme } from "../context/ThemeContext";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import ConfirmedModal from "../../components/ConfirmedModal";
import { CompleteProcessResponse } from "../../types/CompleteProcessResponse";
import { ProcessResponse } from "../../types/ProcesssResponse";
import StepsList from "../../components/StepsList";
import { Menu } from "lucide-react-native";
import Popover from "react-native-popover-view";
import { RefundResponse } from "../../types/RefundResponse";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useFocusEffect } from "@react-navigation/native";

type SellerProcessDetailsProps = NativeStackScreenProps<RootStackParamList, "SellerProcessDetails">;

export default function SellerProcessDetails({ navigation, route }: SellerProcessDetailsProps) {
    const { processId } = route.params
    const [showRequestCreated, setRequestCreated] = useState(false)
    const [canAdd, setCanAdd] = useState(false)
    const [canComplete, setCanComplete] = useState(false)
    const [menuPressed, setMenuPressed] = useState(false)
    const [showCompleteModal, setCompleteModal] = useState(false)
    const [completeRequest, setCompleteRequest] = useState<CompleteProcessResponse>()
    const [refund, setRefund] = useState<RefundResponse>();
    const [process, setProcess] = useState<ProcessResponse>()
    const [latestStep, setLatestStep] = useState<StepResponse>()
    const { theme, borderColor, backgroundColor, textColor, subtleBorderColor } = useTheme()

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

    const handleGetRefund = async () => {
        const result = await fetchRefund()
        if (!result.error) {
            setRefund(result)
        }
    }

    const handleCreateCompleteRequest = async () => {
        if (completeRequest) {
            return
        }
        const result = await createCompleteRequest()
        if (!result.error) {
            setRequestCreated(true)
            setCompleteModal(false)
            setCompleteRequest(result)
            setCanComplete(false)
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
        if (!latestStep || latestStep.status == "Completed" || latestStep.status == "Cancelled" || latestStep.status == "Declined") {
            setCanAdd(true)
        } else {
            setCanAdd(false)
        }
        if (!completeRequest && (latestStep && latestStep.status == "Completed" && !(refund && refund.status == "Pending"))) {
            setCanComplete(true)
        } else {
            setCanComplete(false)
        }
    }, [latestStep, completeRequest, refund])

    const renderHeader = () => (
        <View style={{ padding: 16 }}>
            {process ?
                <View style={[styles.headerContainer, { borderColor: borderColor }]}>
                    <View style={{ padding: 16}}>
                        <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>{process.title}</Text>
                        <Text style={{  color: textColor }}>{process.description}</Text>
                    </View>

                    {process.status == "Completed" || process.status == "Cancelled" ?
                        <View style={[ styles.pending, { backgroundColor: subtleBorderColor }]}>
                            {process.status == "Completed" ? 
                                <Text style={{ color: Colors.green, fontWeight: 'bold', textAlign: 'center' }}>Process has been completed</Text> : 
                                <Text style={{ color: Colors.red, fontWeight: 'bold', textAlign: 'center' }}>Process has been cancelled</Text>}
                        </View> :
                        <></>}
                    {completeRequest && completeRequest.status != 'Accepted' ?
                        <View style={[ styles.pending, { backgroundColor: subtleBorderColor }]}>
                            <Text style={{ color: 'gray', fontWeight: 'bold', textAlign: 'center' }}>Awaiting buyer to accept completion request</Text>
                        </View> : <></>}
                    {refund && refund.status == 'Pending' ?
                        <View style={[ styles.pending, { backgroundColor: subtleBorderColor } ]}>
                            <Text style={{ color: textColor, fontWeight: 'bold', textAlign: 'center' }}>This process has a pending refund request</Text>
                        </View> : <></>}
                </View>
                : <ActivityIndicator size="large" style={{ height: 64, margin: 10, borderRadius: 5 }} color={theme == "dark" ? "white" : "black"} />}
        </View>
    )
    return (
        <View style={{ flex: 1 }}>

            <TopBar title="Process Details" showBackButton />

            <ConfirmedModal isFail={false} visible={showRequestCreated} message={"Completion request has been created"} onPress={() => setRequestCreated(false)} />
            <ConfirmationModal visible={showCompleteModal} message={"Create completion request?"} onAccept={() => handleCreateCompleteRequest()} onCancel={() => setCompleteModal(false)} />

            {process?.status != "Completed" && process?.status != "Cancelled" ?
                <View style={styles.buttonContainer}>
                    {menuPressed ?
                        <View style={[styles.popupMenu, { backgroundColor: backgroundColor, borderColor: borderColor }]}>

                            <TouchableOpacity
                                style={{ borderColor: borderColor, borderBottomWidth: 1, padding: 16 }}
                                disabled={!canAdd}
                                onPress={() => navigation.navigate('AddStep', { processId: processId, previousStepId: latestStep ? latestStep.stepId : null })}
                            >
                                <Text style={{ color: textColor, fontWeight: 'bold', opacity: canAdd ? 1 : 0.2 }}>Add Step</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{ padding: 16 }}
                                disabled={!canComplete}
                                onPress={() => setCompleteModal(true)}
                            >
                                <Text style={{ color: textColor, fontWeight: 'bold', opacity: canComplete ? 1 : 0.2 }}>Create Completion Request</Text>
                            </TouchableOpacity>
                        </View>
                        : <></>}

                    <TouchableOpacity style={styles.menu} onPress={() => setMenuPressed(!menuPressed)}>
                        <Menu color={"white"} />
                    </TouchableOpacity>
                </View> : <></>}
            <StepsList processId={processId} renderHeader={renderHeader} navigation={navigation} editable={true} setLatestStep={setLatestStep} />
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
        gap: 10,
        justifyContent: 'center'
    },
    pending: {
        padding: 20,
        paddingVertical: 10
    }
})