import axios from "axios"
import { useAuth } from "../app/context/AuthContext"
import { API_URL } from "../constants/ApiUri"
import { ActivityIndicator, FlatList, RefreshControl, View, Text } from "react-native"
import { useCallback, useEffect, useRef, useState } from "react"
import { OrderRequestResponse } from "../types/OrderRequestResponse"
import { useFocusEffect } from "@react-navigation/native"
import OrderRequestComponent from "./OrderRequestComponent"
import { useTheme } from "../app/context/ThemeContext"

export default function OrderRequestsList({ isSeller, navigation }: { isSeller: boolean, navigation: any }) {
    const { onGetUserToken } = useAuth()
    const { textColor } = useTheme()
    const [orderRequests, setOrderRequests] = useState<OrderRequestResponse[]>([])
    const [total, setTotal] = useState(0)
    const [refresh, setRefresh] = useState(false)
    const loadingRef = useRef(false)
    const pageRef = useRef(1)
    const refreshRef = useRef(false)

    const fetchRequests = async (pageNumber: number) => {
        try {
            const token = await onGetUserToken!()
            const response = await axios.get(`${API_URL}/get-order-requests?pageSize=3&pageNumber=${pageNumber}&isSeller=${isSeller}`, {
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
        const result = await fetchRequests(page);
        if (!result.error) {
            if (replace) {
                setOrderRequests(result.requests)
            } else {
                setOrderRequests(prev => [...prev, ...result.requests])
            }
            setTotal(result.total);
        }
        loadingRef.current = false;
    }
    const loadMore = async () => {
        if (!loadingRef.current && orderRequests.length < total) {
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
    if (orderRequests.length == 0 && !loadingRef.current) {
        return (
            <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: 'gray' }}>No Order Request Yet</Text>
            </View>
        )
    }
    return (
        <FlatList
            data={orderRequests}
            keyExtractor={(item: OrderRequestResponse) => item.requestId}
            renderItem={({ item }: { item: OrderRequestResponse }) => <OrderRequestComponent request={item} navigation={navigation} respondable={isSeller} isSeller={isSeller} />}
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