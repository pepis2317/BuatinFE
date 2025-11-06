import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Alert,
} from "react-native";
import { RootStackParamList } from "../../constants/RootStackParams";
import TopBar from "../../components/TopBar";
import TextInputComponent from "../../components/TextInputComponent";
import ColoredButton from "../../components/ColoredButton";
import { SetStateAction, useEffect, useState } from "react";
import MessagesList from "../../components/MessagesList";
import { useSignalR } from "../context/SignalRContext";
import { MessageResponse } from "../../types/MessageResponse";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import Colors from "../../constants/Colors";
import { useTheme } from "../context/ThemeContext";
import { Save, Send, X } from "lucide-react-native";
import Popover, { Rect } from "react-native-popover-view";
import MessageAttachmentsComponent from "../../components/MessageAttachmentsComponent";

type Anchor = {
    message: MessageResponse
    x: number, y: number
}
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
type ChatProps = NativeStackScreenProps<RootStackParamList, "Chat">
export default function Chat({ navigation, route }: ChatProps) {
    const { conversationId } = route.params
    const { theme } = useTheme()
    const { onGetUserToken } = useAuth()
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [editMessage, setEditMessage] = useState<MessageResponse | null>(null)
    const [anchor, setAnchor] = useState<Anchor | null>(null);
    const [attachments, setAttachments] = useState<string[]>([]);
    const borderColor = theme == "dark" ? Colors.darkBorder : Colors.lightBorder
    const textColor = theme === "dark" ? "white" : "black"
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
    const handleSend = async () => {
        setLoading(true)
        const formData = new FormData();
        formData.append("conversationId", conversationId);
        formData.append("text", message);
        attachments.forEach((uri) => {
            const name = uri.split("/").pop() ?? "file";
            const type = getMimeType(uri);
            formData.append("files", { uri, name, type } as any);
        });
        const result = await sendMessage(formData)
        if (!result.error) {
            setMessage('')
            setAttachments([])
        }
        setLoading(false)
    }
    const handleEdit = async () => {
        if (editMessage) {
            setLoading(true)
            const result = await putEditMessage()
            if (!result.error) {
                setEditMessage(null)
            }
            setLoading(false)
        }
    }
    const handleDelete = async (messageId: string) => {
        setLoading(true)
        await putDeleteMessage(messageId)
        setLoading(false)
    }
    const onSelect = (message: MessageResponse, x: number, y: number) => {
        setAnchor({ message: message, x: x, y: y });
    }
    return (
        <KeyboardAvoidingView style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}>
            <TopBar title={"Conversations"} showBackButton />
            <Popover
                isVisible={!!anchor}
                onRequestClose={() => setAnchor(null)}
                from={anchor ? new Rect(anchor.x, anchor.y, 0, 0) : undefined}
            >
                {anchor ?
                    <View style={{ padding: 12, minWidth: 180, gap: 8 }}>
                        <Text onPress={() => {
                            setEditMessage(anchor.message)
                            setMessage(anchor.message.message)
                            setAnchor(null)
                        }}>Edit</Text>
                        <Text onPress={() => {
                            handleDelete(anchor.message.messageId)
                            setAnchor(null)
                        }}>Delete</Text>
                    </View>
                    : <></>
                }
            </Popover>
            <MessagesList conversationId={conversationId} onSelect={onSelect} />
            <View>
                {editMessage ?
                    <View>
                        <TouchableOpacity onPress={() => setEditMessage(null)}>
                            <X color={"white"} size={16} />
                        </TouchableOpacity>
                        <Text>Editing message {editMessage.message}</Text>
                    </View>
                    : <></>}
                <MessageAttachmentsComponent attachments={attachments} setAttachments={setAttachments} />
                <View style={[styles.inputContainer, { borderColor: borderColor }]}>
                    <TextInput multiline style={[styles.textInput, { color: textColor }]} returnKeyType="send" value={message} onChangeText={setMessage} />
                    {editMessage ?
                        <TouchableOpacity style={styles.sendButton} onPress={() => handleEdit()}>
                            {loading ? <ActivityIndicator size="small" style={{ height: 20 }} color={theme == "dark" ? "white" : "black"} /> : <Save color={"white"} size={20} />}
                        </TouchableOpacity>
                        :
                        <TouchableOpacity style={styles.sendButton} onPress={() => handleSend()}>
                            {loading ? <ActivityIndicator size="small" style={{ height: 20 }} color={theme == "dark" ? "white" : "black"} /> : <Send color={"white"} size={20} />}
                        </TouchableOpacity>
                    }

                </View>
            </View>
        </KeyboardAvoidingView>
    )
}
const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    sendButton: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 40,
        aspectRatio: 1,
        backgroundColor: Colors.green
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
        width: "85%",
        height: 40,
    },
    container: {
        flex: 1, position: 'relative'
    }
})