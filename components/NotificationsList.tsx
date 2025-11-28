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
    const { textColor} = useTheme()
    const [refresh, setRefresh] = useState(false)
    const loadingRef = useRef(false)
    const pageRef = useRef(1)
    const refreshRef = useRef(false)

    const fetchNotifications = async (pageNumber: number) => {
        try {
            const token = await onGetUserToken!()
            // adjust pageSize or remove it if you want default server page size
            const url = `${API_URL}/notifications?pageSize=3&pageNumber=${pageNumber}`
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

    // default replace = false
    const handleFetch = async (page = pageRef.current, replace = false) => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        try {
            const result = await fetchNotifications(page);
            if (!result.error) {
                if (replace) {
                    setNotifications(result.notifications)
                } else {
                    setNotifications(prev => [...prev, ...result.notifications])
                }
                setTotal(result.total ?? 0);
            } else {
                // optionally handle error (toast/log)
            }
        } finally {
            loadingRef.current = false;
        }
    }

    const loadMore = async () => {
        // guard: not already loading and there's more to load
        if (loadingRef.current) return;
        if (notifications.length >= total) return;

        pageRef.current += 1;
        await handleFetch(pageRef.current, false);
    }

    const handleRefresh = useCallback(async () => {
        if (refreshRef.current) return
        refreshRef.current = true
        setRefresh(true)
        try {
            await reset()
        } finally {
            setRefresh(false);
            refreshRef.current = false;
        }
    }, []) // no handleFetch dependency needed now

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
            onEndReachedThreshold={0.5}
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
