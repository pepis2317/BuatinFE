import { useCallback, useRef, useState } from "react"
import { useAuth } from "../app/context/AuthContext"
import { NotificationResponse } from "../types/NotificationResponse"
import { useTheme } from "../app/context/ThemeContext"
import { API_URL } from "../constants/ApiUri"
import axios from "axios"
import { useFocusEffect } from "@react-navigation/native"
import { ActivityIndicator, FlatList, RefreshControl, View } from "react-native"
import NotificationComponent from "./NotificationComponent"

export default function NotificationsList() {
    const { onGetUserToken } = useAuth()
    const [notifications, setNotifications] = useState<NotificationResponse[]>([])
    const [total, setTotal] = useState(0)
    const { theme } = useTheme()
    const [refresh, setRefresh] = useState(false)
    const loadingRef = useRef(false)
    const pageRef = useRef(1)
    const refreshRef = useRef(false)
    const fetchNotifications = async (pageNumber: number) => {
        try {
            const token = await onGetUserToken!()
            var url = `${API_URL}/notifications?pageSize=3&pageNumber=${pageNumber}`
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
        const result = await fetchNotifications(page);
        if (!result.error) {
            if (replace) {
                setNotifications(result.notifications)
            } else {
                setNotifications(prev => [...prev, ...result.notifications])
            }
            setTotal(result.total);
        }
        loadingRef.current = false;
    }
    const loadMore = async () => {
        if (!loadingRef.current && notifications.length < total) {
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
    return (
        <FlatList
            data={notifications}
            keyExtractor={(item) => item.notificationId}
            renderItem={({ item }: { item: NotificationResponse }) => <NotificationComponent notification={item} />}
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