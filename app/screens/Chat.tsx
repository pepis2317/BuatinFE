import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { View, Text, TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Keyboard,
    ScrollView,
    FlatList,
    RefreshControl,
    Vibration,
} from "react-native";
import { RootStackParamList } from "../../constants/RootStackParams";
import TopBar from "../../components/TopBar";
import TextInputComponent from "../../components/TextInputComponent";
import ColoredButton from "../../components/ColoredButton";
import { SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { useSignalR } from "../context/SignalRContext";
import { MessageResponse } from "../../types/MessageResponse";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import Colors from "../../constants/Colors";
import { useTheme } from "../context/ThemeContext";
import { File, PlusCircle, Save, Send, X } from "lucide-react-native";
import Popover, { Rect } from "react-native-popover-view";
import * as DocumentPicker from "expo-document-picker";
import * as Crypto from 'expo-crypto';
import ChatComponent from "../../components/ChatComponent";

type Anchor = {
    message: MessageResponse
    x: number, y: number
}

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

const sortByCreatedDesc = (arr: MessageResponse[]) =>
    arr.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());


const getMimeType = (uri: string): string => {
    const ext = uri.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'png':
            return 'image/png';
        case 'gif':
            return 'image/gif';
        case 'mp4':
            return 'video/mp4';
        case 'mov':
            return 'video/quicktime';
        case 'mp3':
            return 'audio/mpeg';
        case 'pdf':
            return 'application/pdf';
        case 'zip':
            return 'application/zip';
        case 'doc':
            return 'application/msword';
        case 'docx':
            return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        case 'xlsx':
            return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        default:
            return 'application/octet-stream'; // fallback
    }
};
type Attachment = {
    uri: string;
    name: string
}
type ChatProps = NativeStackScreenProps<RootStackParamList, "Chat">
export default function Chat({ navigation, route }: ChatProps) {
    const { conversationId } = route.params
    const { subtleBorderColor, borderColor, textColor } = useTheme()
    const { onGetUserToken, user } = useAuth()
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState<MessageResponse[]>([]);
    const [loading, setLoading] = useState(false)
    const [editMessage, setEditMessage] = useState<MessageResponse | null>(null)
    const [anchor, setAnchor] = useState<Anchor | null>(null);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [inputHeight, setInputHeight] = useState(0)
    const [canSend, setCanSend] = useState(false)
    const { on, off } = useSignalR();
    const [refreshing, setRefreshing] = useState(false);
    const [loadingOlder, setLoadingOlder] = useState(false);
    const loadingRef = useRef(false);
    const nextRef = useRef<string | null>(null);
    const prevRef = useRef<string | null>(null);
    const atBottomRef = useRef(true);
    const listRef = useRef<FlatList<MessageResponse>>(null);

    const sendMessage = async (form: FormData) => {
        try {
            const token = await onGetUserToken!()
            const response = await axios.post(`${API_URL}/chat/conversations/send-messages`, form, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            })
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const putEditMessage = async () => {
        try {
            const token = await onGetUserToken!()
            const response = await axios.put(`${API_URL}/chat/edit-message`, {
                messageId: editMessage?.messageId,
                text: message
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const putDeleteMessage = async (messageId: string) => {
        try {
            const token = await onGetUserToken!()
            const response = await axios.put(`${API_URL}/chat/delete-message`, {
                messageId: messageId,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
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
        atBottomRef.current = contentOffset.y <= pad;
    }, []);
    const loadInitial = useCallback(async () => {
        if (loadingRef.current) return;
        loadingRef.current = true;

        const result = await fetchMessages({ conversationId, limit: PAGE_LIMIT });
        if (!result.error) {
            const sorted = sortByCreatedDesc(result.items);
            setMessages(sorted);
            nextRef.current = result.nextCursor ?? null;
            prevRef.current = result.prevCursor ?? null;
            requestAnimationFrame(() => listRef.current?.scrollToOffset({ offset: 0, animated: false }));
        }
        loadingRef.current = false;
    }, [conversationId]);
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

    const onScroll = useCallback(async (e: any) => {
        const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
        const threshold = 40;
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
            if(payload.senderId == user?.userId){
                alterMessage(payload)
            }
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


    const handleSend = async () => {
        if (attachments.length == 0) {
            var messageId = Crypto.randomUUID();
            const msg: MessageResponse = {
                messageId: messageId,
                message: message,
                senderId: user?.userId!,
                createdAt: new Date().toISOString(),
                attachments: null,
                updatedAt: null,
                deletedAt: null,
                sent: false
            }
            
            appendIncoming(msg)
            setMessage('')
            setAttachments([])
            setInputHeight(45);
            const formData = new FormData();
            formData.append("messageId", messageId);
            formData.append("conversationId", conversationId);
            formData.append("text", message);
            await sendMessage(formData)
            
        } else {
            setLoading(true)
            const formData = new FormData();
            formData.append("conversationId", conversationId);
            formData.append("text", message);
            attachments.forEach((attachment) => {
                const type = getMimeType(attachment.uri);
                formData.append("files", { uri: attachment.uri, name: attachment.name, type } as any);
            });
            const result = await sendMessage(formData)
            if (!result.error) {
                setMessage('')
                setAttachments([])
                setInputHeight(45);
            }
            setLoading(false)

        }
    }
    const handleEdit = async () => {
        if (editMessage) {
            setLoading(true)
            const result = await putEditMessage()
            if (!result.error) {
                setEditMessage(null)
            }
            setLoading(false)
            setMessage('')
            setInputHeight(45);
        }
    }
    const pickFromFiles = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                multiple: true,
                type: "*/*",
                copyToCacheDirectory: true,
            });

            if ((result as any).canceled) return;

            const pickedAssets =
                "assets" in result ? result.assets : (result ? [result] : []);

            if (!pickedAssets) return;

            const newAttachments: Attachment[] = pickedAssets
                .map((a: any) => {
                    const uri = a?.uri ?? a?.file?.uri;
                    const name = a?.name ?? "unknown";
                    return uri ? { uri, name } : null;
                })
                .filter(Boolean) as Attachment[];

            if (!newAttachments.length) return;

            setAttachments(prev => [...prev, ...newAttachments]);

        } catch (err: any) {
            Alert.alert("File pick error", err?.message ?? "Unknown error");
        }
    };
    const removeAttachmentAt = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };
    const handleDelete = async (messageId: string) => {
        setLoading(true)
        await putDeleteMessage(messageId)
        setLoading(false)
    }
    const onSelect = (message: MessageResponse, x: number, y: number) => {
        setAnchor({ message: message, x: x, y: y });
    }
    useEffect(() => {
        if (message == '') {
            setCanSend(false)
        } else {
            setCanSend(true)
        }
    }, [message])
    return (
        <KeyboardAvoidingView style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={35}>

            <TopBar title={"Conversations"} showBackButton />

            <Popover
                popoverStyle={{
                    backgroundColor: subtleBorderColor,
                    width: 'auto',
                    borderRadius: 10
                }}
                isVisible={!!anchor}
                onRequestClose={() => setAnchor(null)}
                from={anchor ? new Rect(anchor.x, anchor.y, 0, 0) : undefined}
            >
                {anchor ?
                    <View style={{
                        padding: 12,
                        minWidth: 180,
                        gap: 8
                    }}>
                        <TouchableOpacity onPress={() => {
                            setEditMessage(anchor.message)
                            setMessage(anchor.message.message)
                            setAnchor(null)
                        }}>
                            <Text style={{ color: textColor }}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            handleDelete(anchor.message.messageId)
                            setAnchor(null)
                        }}>
                            <Text style={{ color: textColor }}>Delete</Text>
                        </TouchableOpacity>

                    </View>
                    : <></>
                }
            </Popover>

            <FlatList
                ref={listRef}
                style={{ paddingHorizontal: 16 }}
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

            <View>
                <ScrollView horizontal style={[ styles.attachments, { borderColor: borderColor }]}>
                    {attachments.map((attachment, index) => (
                        <View key={index} >
                            <View style={{ padding: 5 }}>
                                <View style={[
                                    styles.attachment,
                                    { backgroundColor: subtleBorderColor }
                                ]}>
                                    <File color={Colors.green} size={32} />
                                    <Text style={{ color: textColor }} numberOfLines={2}>{attachment.name}</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.removeAttachmentButton} onPress={() => removeAttachmentAt(index)}>
                                <X size={20} color={"white"} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
                
                {editMessage ?
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}>
                        <TouchableOpacity style={{ padding: 10 }} onPress={() => setEditMessage(null)}>
                            <X color={textColor} size={16} />
                        </TouchableOpacity>
                        <Text style={{
                            color: textColor,
                            width: '100%'
                        }} numberOfLines={1}>Editing message {editMessage.message}</Text>
                    </View>
                    : <></>}

                <View style={[ styles.inputContainer, { borderColor: borderColor } ]}>
                    
                    {!editMessage ?
                        <TouchableOpacity style={styles.attachmentsButton} onPress={() => pickFromFiles()}>
                            <PlusCircle color={textColor} />
                        </TouchableOpacity>
                        : <></>}

                    <TextInput
                        multiline
                        style={[ styles.textInput, { color: textColor, height: inputHeight }]}
                        returnKeyType="send"
                        value={message}
                        onChangeText={setMessage}
                        onContentSizeChange={(e) => {
                            const newHeight = e.nativeEvent.contentSize.height;
                            setInputHeight(Math.max(45, Math.min(newHeight, 120)));
                        }}
                    />

                    {editMessage ?
                        <TouchableOpacity style={[styles.sendButton, { backgroundColor: canSend ? Colors.green : subtleBorderColor }]} onPress={() => handleEdit()} disabled={!canSend || loading}>
                            {loading ? <ActivityIndicator size="small" style={{ height: 20 }} color={textColor} /> : <Save color={"white"} size={20} />}
                        </TouchableOpacity>
                        :
                        <TouchableOpacity style={[styles.sendButton, { backgroundColor: canSend ? Colors.green : subtleBorderColor }]} onPress={() => handleSend()} disabled={!canSend || loading}>
                            {loading ? <ActivityIndicator size="small" style={{ height: 20 }} color={textColor} /> : <Send color={"white"} size={20} />}
                        </TouchableOpacity>
                    }

                </View>
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    attachment: {
        width: 100,
        aspectRatio: 1,
        borderRadius: 5,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10
    },
    attachments: {
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    inputContainer: {
        flexDirection: 'row',
        borderTopWidth: StyleSheet.hairlineWidth,
        // justifyContent: 'space-evenly',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 10,
        width: "100%"
    },
    removeAttachmentButton: {
        position: 'absolute',
        width: 24,
        height: 24,
        right: 5,
        top: 5,
        backgroundColor: '#31363F',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center'

    },
    attachmentsButton: {
        width: "10%",
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        aspectRatio: 1,
    },
    sendButton: {
        width: "10%",
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 100,
        aspectRatio: 1,
    },
    backgroundStyle: {
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10
    },
    input: {
        marginTop: 8,
        marginBottom: 10,
        borderRadius: 10,
        fontSize: 16,
        lineHeight: 20,
        padding: 8,
        backgroundColor: 'rgba(151, 151, 151, 0.25)',
    },
    textInput: {
        borderStyle: 'solid',
        borderColor: "transparent",
        borderWidth: 1,
        flex: 1,
        width: "80%",
    },
    container: {
        flex: 1
    }
})