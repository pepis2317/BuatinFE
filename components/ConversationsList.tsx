import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, View } from "react-native";
import { ConversationResponse } from "../types/ConversationResponse";
import { useTheme } from "../app/context/ThemeContext";
import axios from "axios";
import { API_URL } from "../constants/ApiUri";
import { useAuth } from "../app/context/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import ConversationComponent from "./ConversationComponent";
import { useSignalR } from "../app/context/SignalRContext";
type ConversationNotif = {
    conversationId: string
    senderId: string
    message: string
}
export default function ConversationsList({ navigation }: { navigation: any }) {
    const loadingRef = useRef(false)
    const pageRef = useRef(1)
    const refreshRef = useRef(false)
    const { on, off } = useSignalR()
    const { user } = useAuth()
    const { textColor } = useTheme()
    const { onGetUserToken } = useAuth()
    const [conversations, setConversations] = useState<ConversationResponse[]>([])
    const [total, setTotal] = useState(0)
    const [refresh, setRefresh] = useState(false)
    const fetchConvos = async (pageNumber: number) => {
        try {
            const token = await onGetUserToken!()
            const response = await axios.get(`${API_URL}/chat/get-conversations?pageSize=3&pageNumber=${pageNumber}`, {
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
        const result = await fetchConvos(page);
        if (!result.error) {
            if (replace) {
                setConversations(result.conversations)
            } else {
                setConversations(prev => [...prev, ...result.conversations])
            }
            setTotal(result.total);
        }
        loadingRef.current = false;
    }
    const loadMore = async () => {
        if (!loadingRef.current && conversations.length < total) {
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
    useEffect(() => {
        const handler = (payload: ConversationNotif) => {
            setConversations(prev => {
                const updated = prev.map(conv =>
                    conv.conversationId === payload.conversationId ?
                        {
                            ...conv,
                            latestMessage: payload.senderId == user?.userId ? `(You) ${payload.message}` : payload.message
                        }
                        : conv
                );
                const index = updated.findIndex(c => c.conversationId === payload.conversationId);
                if (index > -1) {
                    const [item] = updated.splice(index, 1);
                    updated.unshift(item);
                }
                return updated;
            });
        }
        on("NewMessage", handler)
        return () => {
            off("NewMessage", handler)
        }
    }, [on, off])
    return (
        <FlatList
            data={conversations}
            keyExtractor={(item) => item.conversationId}
            renderItem={({ item }: { item: ConversationResponse }) => <ConversationComponent conversation={item} navigation={navigation} />}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 8 }}
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