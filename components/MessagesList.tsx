import { useCallback, useEffect, useRef, useState } from "react"
import { MessageResponse } from "../types/MessageResponse"
import axios from "axios"
import { API_URL } from "../constants/ApiUri";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, FlatList, RefreshControl, View, Text, TouchableOpacity, Pressable, Vibration } from "react-native";
import { useAuth } from "../app/context/AuthContext";
import { useTheme } from "../app/context/ThemeContext";
import { useSignalR } from "../app/context/SignalRContext";
import ChatComponent from "./ChatComponent";
type CursorPage<T> = {
    items: T[];
    nextCursor?: string | null;
    prevCursor?: string | null;
    hasNext: boolean;
    hasPrev: boolean;
};
type FetchResult = CursorPage<MessageResponse> & { error?: boolean; msg?: string };
const PAGE_LIMIT = 20;
const mergeUnique = (base: MessageResponse[], add: MessageResponse[]) => {
    const seen = new Set(base.map(m => m.messageId));
    return [...base, ...add.filter(m => !seen.has(m.messageId))];
};
const sortByCreatedAsc = (arr: MessageResponse[]) =>
    arr.slice().sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
export default function MessagesList({ conversationId, onSelect }: { conversationId: string, onSelect: (message: MessageResponse, x: number, y: number) => void }) {
    const { on, off } = useSignalR();
    const { onGetUserToken } = useAuth()
    const [messages, setMessages] = useState<MessageResponse[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingOlder, setLoadingOlder] = useState(false);
    const loadingRef = useRef(false);
    const nextRef = useRef<string | null>(null);
    const prevRef = useRef<string | null>(null);
    const atBottomRef = useRef(true);
    const listRef = useRef<FlatList<MessageResponse>>(null);

    const fetchMessages = async ({
        conversationId,
        limit,
        before,
        after,
    }: {
        conversationId: string;
        limit: number;
        before?: string | null;
        after?: string | null;
    }): Promise<FetchResult> => {
        try {
            const token = await onGetUserToken!()
            const res = await axios.get(`${API_URL}/chat/get-messages`, {
                params: {
                    conversationId,
                    limit,
                    before: before ?? undefined,
                    after: after ?? undefined,
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return res.data;
        } catch (e: any) {
            const msg = e?.response?.data?.detail || e?.message || "An error occurred";
            return {
                error: true,
                msg,
                items: [],
                nextCursor: null,
                prevCursor: null,
                hasNext: false,
                hasPrev: false,
            };
        }
    };

    const onScrollCapture = useCallback((e: any) => {
        const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
        const pad = 32; // slack
        atBottomRef.current =
            contentOffset.y + layoutMeasurement.height >= contentSize.height - pad;
    }, []);

    /** Initial load (no cursors) */
    const loadInitial = useCallback(async () => {
        if (loadingRef.current) return;
        loadingRef.current = true;

        const result = await fetchMessages({ conversationId, limit: PAGE_LIMIT });
        if (!result.error) {
            const sorted = sortByCreatedAsc(result.items);
            setMessages(sorted);

            // New API: newest page at tail
            nextRef.current = result.nextCursor ?? null; // likely null on first page
            prevRef.current = result.prevCursor ?? null; // older pages available

            // show the latest messages right away
            requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: false }));
        }
        loadingRef.current = false;
    }, [conversationId]);

    /** Get older messages (scroll up) -> use before=prevCursor */
    const loadOlder = useCallback(async () => {
        if (loadingRef.current || !prevRef.current) return;
        loadingRef.current = true;
        setLoadingOlder(true);
        const result = await fetchMessages({
            conversationId,
            limit: PAGE_LIMIT,
            before: prevRef.current,
        });
        if (!result.error) {
            setMessages(prev => sortByCreatedAsc(mergeUnique(result.items, prev)));
            prevRef.current = result.prevCursor ?? null; // becomes null when no more older pages
        }
        setLoadingOlder(false);
        loadingRef.current = false;
    }, [conversationId]);

    /** Get newer messages (pull-to-refresh or live update catch-up) -> use after=nextCursor */
    // get newer messages (append)
    const loadNewer = useCallback(async () => {
        if (loadingRef.current || !nextRef.current) {
            // still show a quick refresh spinner to indicate "checked"
            setRefreshing(false);
            return;
        }
        loadingRef.current = true;
        const result = await fetchMessages({
            conversationId,
            limit: PAGE_LIMIT,
            after: nextRef.current,
        });
        if (!result.error) {
            setMessages(prev => sortByCreatedAsc(mergeUnique(prev, result.items)));
            nextRef.current = result.nextCursor ?? null;
        }
        loadingRef.current = false;
        setRefreshing(false);
    }, [conversationId]);

    useEffect(() => {
        loadInitial();
    }, [loadInitial]);

    // detect near-top to load older (no inverted list)
    const onScroll = useCallback(async (e: any) => {
        const y = e.nativeEvent.contentOffset.y;
        if (y <= 40) {
            // small threshold so we don’t spam
            await loadOlder();
        }
    }, [loadOlder]);

    const appendIncoming = useCallback((msg: MessageResponse) => {
        setMessages((prev) => {
            if (prev.some(m => m.messageId === msg.messageId)) return prev; // de-dupe
            const next = [...prev, msg].sort(
                (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            return next;
        });
        // if user is at the bottom, scroll down to reveal the new message
        requestAnimationFrame(() => {
            if (atBottomRef.current && listRef.current) {
                listRef.current.scrollToEnd({ animated: true });
            }
        });
    }, []);

    const alterMessage = useCallback((updated: MessageResponse) => {
        setMessages(prev => {
            return prev.map(msg =>
                msg.messageId === updated.messageId ? { ...msg, ...updated } : msg
            );
        });
    }, []);

    // pull-to-refresh to fetch NEWER page (catch up)
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadNewer();
    }, [loadNewer]);
    useEffect(() => {
        const handler = (payload: MessageResponse) => {
            appendIncoming(payload);
        };
        const editHandler = (payload: MessageResponse) => {
            alterMessage(payload)
        }
        const deleteHandler = (payload: MessageResponse) => {
            alterMessage(payload)
        }

        on("MessageCreated", handler);
        on("MessageEdited", editHandler);
        on("MessageDeleted", deleteHandler)
        return () => {
            off("MessageCreated", handler);
            off("MessageEdited", editHandler)
            off("MessageDeleted", deleteHandler)
        };
    }, [conversationId, on, off, appendIncoming]);
    const handleLongPress = (item: MessageResponse, e: any) => {
        const { pageX, pageY } = e.nativeEvent;
        Vibration.vibrate(30)
        onSelect(item, pageX, pageY);
    };
    const renderItem = ({ item }: { item: MessageResponse }) => (
        <Pressable
            onLongPress={(e) => handleLongPress(item, e)}
            delayLongPress={300}
        >
            <Text style={{ fontWeight: "600" }}>{item.senderId}</Text>
            <Text>{item.message}</Text>
            <Text style={{ opacity: 0.6, fontSize: 12 }}>{new Date(item.createdAt).toLocaleString()}</Text>
        </Pressable>
    );
    return (
        <FlatList
            ref={listRef}
            onScroll={e => { onScroll(e); onScrollCapture(e); }} // keep your existing onScroll if any
            scrollEventThrottle={16}
            data={messages}
            keyExtractor={(m) => m.messageId}
            renderItem={(item) => <ChatComponent item={item.item} handleLongPress={handleLongPress} />}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListHeaderComponent={
                loadingOlder ? (
                    <View style={{ paddingVertical: 12 }}>
                        <ActivityIndicator />
                    </View>
                ) : null
            }
            // Optional: keep scroll performance nice
            initialNumToRender={20}
            windowSize={10}
            removeClippedSubviews={true}
        />
    );
}