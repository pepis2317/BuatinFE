import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, View, Text } from "react-native";
import { ProcessResponse } from "../types/ProcesssResponse";
import ShippableComponent from "./ShippableComponent";
import { useTheme } from "../app/context/ThemeContext";
import { useAuth } from "../app/context/AuthContext";
import { API_URL } from "../constants/ApiUri";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";

export default function ShippableList({ navigation }: { navigation: any }) {
    const { onGetUserToken } = useAuth()
    const [processes, setProcesses] = useState<ProcessResponse[]>([])
    const [total, setTotal] = useState(0)
    const { textColor } = useTheme()
    const [refresh, setRefresh] = useState(false)
    const loadingRef = useRef(false)
    const pageRef = useRef(1)
    const refreshRef = useRef(false)
    const fetchProcesses = async (pageNumber: number) => {
        try {
            const token = await onGetUserToken!()
            const response = await axios.get(`${API_URL}/get-shippable?pageSize=3&pageNumber=${pageNumber}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setRefresh(false)
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const handleFetch = async (page = pageRef.current, replace: boolean) => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        const result = await fetchProcesses(page);
        if (!result.error) {
            if (replace) {
                setProcesses(result.processes)
            } else {
                setProcesses(prev => [...prev, ...result.processes])
            }
            setTotal(result.total);
        }
        loadingRef.current = false;
    }
    const loadMore = async () => {
        if (!loadingRef.current && processes.length < total) {
            loadingRef.current = true;
            pageRef.current += 1;
            await handleFetch(pageRef.current, false);
        }
    }
    const handleRefresh = useCallback(async () => {
        if (refreshRef.current) return
        refreshRef.current = true
        setRefresh(true)
        try {
            reset()
        } finally {
            setRefresh(false);
            refreshRef.current = false;
        }
    }, [handleFetch])
    const reset = async () => {
        pageRef.current = 1
        await handleFetch(1, true)
    }
    useFocusEffect(
        useCallback(() => {
            reset()
        }, [])
    );

    if (processes.length == 0 && !loadingRef.current) {
        return (
            <View style={{ padding: 24, alignItems: 'center' }}>
                <Text style={{ color: 'gray' }}>No Shippable Processes Yet</Text>
            </View>
        )
    }

    return (
        <FlatList
            data={processes}
            keyExtractor={(item) => item.processId}
            renderItem={({ item }: { item: ProcessResponse }) =>
                <ShippableComponent process={item} navigation={navigation} />
            }
            keyboardShouldPersistTaps="handled"
            onEndReached={loadMore}
            onEndReachedThreshold={0.2}
            refreshControl={
                <RefreshControl refreshing={refresh} onRefresh={handleRefresh} />
            }
            ListFooterComponent={
                loadingRef.current ?
                    <ActivityIndicator size="large" style={{ height: 64, margin: 10, borderRadius: 5 }} color={textColor} />
                    :
                    <View style={{ marginTop: 64 }} />
            }
        />
    )
}