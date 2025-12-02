import { useCallback, useEffect, useRef, useState } from "react"
import { MessageResponse } from "../types/MessageResponse"
import axios from "axios"
import { API_URL } from "../constants/ApiUri";
import { ActivityIndicator, FlatList, RefreshControl, View, Vibration } from "react-native";
import { useAuth } from "../app/context/AuthContext";
import { useSignalR } from "../app/context/SignalRContext";
import ChatComponent from "./ChatComponent";
import { useTheme } from "../app/context/ThemeContext";

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
// keep newest -> oldest (descending)
const sortByCreatedDesc = (arr: MessageResponse[]) =>
    arr.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

export default function MessagesList({ conversationId, onSelect, messages, setMessages }: { conversationId: string, onSelect: (message: MessageResponse, x: number, y: number) => void, messages: MessageResponse[], setMessages: React.Dispatch<React.SetStateAction<MessageResponse[]>> }) {
    const { on, off } = useSignalR();
    const { onGetUserToken } = useAuth()
    const { textColor } = useTheme()
    const [refreshing, setRefreshing] = useState(false);
    const [loadingOlder, setLoadingOlder] = useState(false);
    const loadingRef = useRef(false);
    // IMPORTANT: with inverted list we treat nextCursor as "newer" pages (messages after)
    // and prevCursor as "older" pages (messages before) — keep this consistent with API.
    const nextRef = useRef<string | null>(null); // newer cursor
    const prevRef = useRef<string | null>(null); // older cursor
    // For inverted lists, offset 0 corresponds to the bottom (latest). So atBottom when offset <= pad
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

    // ---- scroll capturing for inverted list ----
    const onScrollCapture = useCallback((e: any) => {
        const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
        const pad = 32; // slack
        // offset 0 is bottom (latest). So at bottom when offset is small.
        atBottomRef.current = contentOffset.y <= pad;
    }, []);

    /** Initial load (no cursors) */
    const loadInitial = useCallback(async () => {
        if (loadingRef.current) return;
        loadingRef.current = true;

        const result = await fetchMessages({ conversationId, limit: PAGE_LIMIT });
        if (!result.error) {
            // Keep newest -> oldest (descending) for inverted list
            const sorted = sortByCreatedDesc(result.items);
            setMessages(sorted);

            // API cursors: nextCursor = newer pages, prevCursor = older pages (depending on your API)
            nextRef.current = result.nextCursor ?? null;
            prevRef.current = result.prevCursor ?? null;

            // For inverted list the visible "bottom" is offset 0, so scroll there.
            requestAnimationFrame(() => listRef.current?.scrollToOffset({ offset: 0, animated: false }));
        }
        loadingRef.current = false;
    }, [conversationId]);

    /** Get older messages (user scrolled *up* toward the top of the screen in an inverted list)
     * For our data shape (newest first), older messages belong at the end of the array, so we append them.
     * Use `before=prevCursor` (older) as your API expects.
     */
    const loadOlder = useCallback(async () => {
        if (loadingRef.current || !prevRef.current) return;
        loadingRef.current = true;
        setLoadingOlder(true);
        const result = await fetchMessages({
            conversationId,
            limit: PAGE_LIMIT,
            before: prevRef.current, // older
        });
        if (!result.error) {
            // append older messages to the end of the current array (base is current newest-first array)
            setMessages(prev => {
                const merged = mergeUnique(prev, result.items); // prev + older
                return sortByCreatedDesc(merged);
            });
            prevRef.current = result.prevCursor ?? null;
        }
        setLoadingOlder(false);
        loadingRef.current = false;
    }, [conversationId]);

    /** Get newer messages (pull-to-refresh or catch-up) -> use after=nextCursor
     * Newer messages should be merged _in front_ (they're the newest), so we prepend them.
     */
    const loadNewer = useCallback(async () => {
        if (loadingRef.current || !nextRef.current) {
            setRefreshing(false);
            return;
        }
        loadingRef.current = true;
        const result = await fetchMessages({
            conversationId,
            limit: PAGE_LIMIT,
            after: nextRef.current, // newer
        });
        if (!result.error) {
            setMessages(prev => {
                // result.items are newer -> put them before existing items
                const merged = mergeUnique(result.items, prev); // new + prev
                return sortByCreatedDesc(merged);
            });
            nextRef.current = result.nextCursor ?? null;
        }
        loadingRef.current = false;
        setRefreshing(false);
    }, [conversationId]);

    useEffect(() => {
        loadInitial();
    }, [loadInitial]);

    // detect near-top to load older (inverted list -> large offset means near top visually)
    const onScroll = useCallback(async (e: any) => {
        const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
        const threshold = 40;
        // For inverted: offset 0 is bottom. When the offset becomes near the max (contentSize - layoutH),
        // the user scrolled up to the visual top — load older (earlier) messages.
        const distanceFromTop = contentSize.height - layoutMeasurement.height - contentOffset.y;
        if (distanceFromTop <= threshold) {
            await loadOlder();
        }
    }, [loadOlder]);

    const appendIncoming = useCallback((msg: MessageResponse) => {
        setMessages((prev) => {
            if (prev.some(m => m.messageId === msg.messageId)) return prev; // de-dupe
            // incoming is newer => put in front (newest-first array)
            const next = [msg, ...prev];
            return sortByCreatedDesc(next);
        });
        // if user is at the bottom (offset ~0), scroll to reveal the new message (offset 0)
        requestAnimationFrame(() => {
            if (atBottomRef.current && listRef.current) {
                listRef.current.scrollToOffset({ offset: 0, animated: true });
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

    return (
        <FlatList
            ref={listRef}
            style={{ paddingHorizontal: 20 }}
            onScroll={e => { onScroll(e); onScrollCapture(e); }}
            scrollEventThrottle={16}
            data={messages}
            keyExtractor={(m) => m.messageId}
            renderItem={(item) => <ChatComponent item={item.item} handleLongPress={handleLongPress} />}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListFooterComponent={
                loadingOlder ? (
                    <View style={{ paddingVertical: 12 }}>
                        <ActivityIndicator size="large" style={{ height: 64, margin: 10, borderRadius: 5 }} color={textColor} />
                    </View>
                ) : null
            }
            initialNumToRender={20}
            inverted
            windowSize={10}
            removeClippedSubviews={true}
        />
    );
}
