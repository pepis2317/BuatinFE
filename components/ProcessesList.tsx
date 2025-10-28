import { useCallback, useRef, useState } from "react";
import { View, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import { ProcessResponse } from "../types/ProcesssResponse";
import ProcessComponent from "./ProcessComponent";
import { useAuth } from "../app/context/AuthContext";
import { API_URL } from "../constants/ApiUri";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../app/context/ThemeContext";
export default function ProcessesList({ navigation, isSeller }: { navigation: any, isSeller: boolean }) {
    const { onGetUserToken } = useAuth()
    const [processes, setProcesses] = useState<ProcessResponse[]>([])
    const [total, setTotal] = useState(0)
    const { theme } = useTheme()
    const [refresh, setRefresh] = useState(false)
    const loadingRef = useRef(false)
    const pageRef = useRef(1)
    const refreshRef = useRef(false)
    const fetchProcesses = async (pageNumber: number) => {
        try {
            const token = await onGetUserToken!()
            var url = `${API_URL}/get-processes?pageSize=3&pageNumber=${pageNumber}`
            if (isSeller) {
                url = `${API_URL}/get-seller-processes?pageSize=3&pageNumber=${pageNumber}`
            }
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
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
            pageRef.current = 1
            await handleFetch(1, true)
        } finally {
            setRefresh(false);
            refreshRef.current = false;
        }
    }, [handleFetch])
    useFocusEffect(
        useCallback(() => {
            handleRefresh()
        }, [])
    );
    return (
        <FlatList
            data={processes}
            keyExtractor={(item) => item.processId}
            renderItem={({ item }: { item: ProcessResponse }) => <ProcessComponent process={item} navigation={navigation} isSeller={isSeller} />}
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