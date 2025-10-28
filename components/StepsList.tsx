import { useCallback, useRef, useState } from "react";
import { View, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import { StepResponse } from "../types/StepResponse";
import StepComponent from "./StepComponent";
import axios from "axios";
import { API_URL } from "../constants/ApiUri";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../app/context/ThemeContext";

export default function StepsList({ processId, navigation, editable, renderHeader }: { processId: string, navigation: any, editable: boolean, renderHeader: () => any }) {
    const loadingRef = useRef(false)
    const pageRef = useRef(1)
    const refreshRef = useRef(false)
    const { theme } = useTheme()
    const [steps, setSteps] = useState<StepResponse[]>([])
    const [total, setTotal] = useState(0)
    const [refresh, setRefresh] = useState(false)
    const [refreshTick, setRefreshTick] = useState(0);
    const fetchSteps = async (pageNumber: number) => {
        try {
            const response = await axios.get(`${API_URL}/get-steps?processId=${processId}&pageSize=3&pageNumber=${pageNumber}`)
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const handleFetch = async (page = pageRef.current, replace: boolean) => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        const result = await fetchSteps(page);
        if (!result.error) {
            if (replace) {
                setSteps(result.steps)
            } else {
                setSteps(prev => [...prev, ...result.steps])
            }
            setTotal(result.total);
        }
        loadingRef.current = false;
    };
    const handleRefresh = useCallback(async () => {
        if (refreshRef.current) return
        refreshRef.current = true
        setRefresh(true)
        try {
            pageRef.current = 1
            await handleFetch(1, true)
        } finally {
            setRefresh(false);
            refreshRef.current = false;
            setRefreshTick(t => t + 1);
        }
    }, [handleFetch])
    const loadMore = async () => {
        if (!loadingRef.current && steps.length < total) {
            loadingRef.current = true;
            pageRef.current += 1;
            await handleFetch(pageRef.current, false);
        }
    };
    useFocusEffect(
        useCallback(() => {
            handleRefresh()
        }, [])
    );
    return (
        <FlatList
            ListHeaderComponent={renderHeader}
            data={steps}
            keyExtractor={(item) => `${item.stepId}:${refreshTick}`}
            renderItem={({ item }: { item: StepResponse }) => <StepComponent step={item} navigation={navigation} editable={editable} />}
            keyboardShouldPersistTaps="handled"
            onEndReached={loadMore}
            onEndReachedThreshold={0.2}
            refreshControl={
                <RefreshControl refreshing={refresh} onRefresh={handleRefresh} />
            }
            ListFooterComponent={
                loadingRef.current ?
                    <ActivityIndicator size="large" style={{ height: 64, margin: 10, borderRadius: 5 }} color={theme == "dark" ? "white" : "black"} />
                    :
                    <View style={{ marginTop: 64 }} />
            }
        />
    )
}