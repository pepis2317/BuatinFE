import { useCallback, useRef, useState } from "react";
import { View, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import { StepResponse } from "../types/StepResponse";
import StepComponent from "./StepComponent";
import axios from "axios";
import { API_URL } from "../constants/ApiUri";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../app/context/ThemeContext";

export default function StepsList({ processId, navigation, editable, renderHeader, setLatestStep }: { processId: string, navigation: any, editable: boolean, renderHeader: () => any, setLatestStep: (step: StepResponse) => void }) {
    const loadingRef = useRef(false)
    const pageRef = useRef(1)
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
            const newSteps = result.steps;
            const lastStep = newSteps[newSteps.length - 1];

            if (replace) {
                setSteps(newSteps);
            } else {
                setSteps(prev => [...prev, ...newSteps]);
            }

            setLatestStep(lastStep);

            setTotal(result.total);
        }
        loadingRef.current = false;
    };
    const handleRefresh = useCallback(async () => {
        reset()
    }, [handleFetch])
    
    const loadMore = async () => {
        if (!loadingRef.current && steps.length < total) {
            loadingRef.current = true;
            pageRef.current += 1;
            await handleFetch(pageRef.current, false);
        }
    };
    const reset = async () => {
        pageRef.current = 1
        setRefreshTick(0)
        await handleFetch(1, true)
    }
    useFocusEffect(
        useCallback(() => {
            reset()
        }, [])
    );
    return (
        <FlatList
            ListHeaderComponent={renderHeader}
            data={steps}
            keyExtractor={(item) => `${item.stepId}:${refreshTick}`}
            renderItem={({ item, index }: { item: StepResponse, index:number }) => <StepComponent step={item} navigation={navigation} editable={editable} index={ index+1 } />}
            keyboardShouldPersistTaps="handled"
            onEndReached={loadMore}
            onEndReachedThreshold={0.2}
            refreshControl={
                <RefreshControl refreshing={refresh} onRefresh={handleRefresh} />
            }
            ListFooterComponent={
                <View style={{ marginTop: 64 }} />
            }
        />
    )
}