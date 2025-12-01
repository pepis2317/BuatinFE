import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Keyboard,
    ScrollView,
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
import { File, PlusCircle, Save, Send, X } from "lucide-react-native";
import Popover, { Rect } from "react-native-popover-view";
import * as DocumentPicker from "expo-document-picker";
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
type Attachment = {
    uri: string;
    name: string
}
type ChatProps = NativeStackScreenProps<RootStackParamList, "Chat">
export default function Chat({ navigation, route }: ChatProps) {
    const { conversationId } = route.params
    const { subtleBorderColor, borderColor, textColor } = useTheme()
    const { onGetUserToken } = useAuth()
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [editMessage, setEditMessage] = useState<MessageResponse | null>(null)
    const [anchor, setAnchor] = useState<Anchor | null>(null);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [inputHeight, setInputHeight] = useState(0)
    const [canSend, setCanSend] = useState(false)
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
        if (attachments.length > 0) {
            formData.append("hasAttachments", "true");
        }
        attachments.forEach((attachment) => {
            const type = getMimeType(attachment.uri);
            formData.append("files", { uri: attachment.uri, name: attachment.name, type } as any);
        });
        const result = await sendMessage(formData)
        if (!result.error) {
            setMessage('')
            setAttachments([])
            setInputHeight(40);
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
            setMessage('')
            setInputHeight(40);
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
            keyboardVerticalOffset={50}>
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
            <MessagesList conversationId={conversationId} onSelect={onSelect} />
            <View>
                <ScrollView
                    horizontal
                    style={[
                        styles.attachments,
                        { borderColor: borderColor }
                    ]}>
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
                <View style={[
                    styles.inputContainer,
                    { borderColor: borderColor }
                ]}>
                    {!editMessage ?
                        <TouchableOpacity style={styles.attachmentsButton} onPress={() => pickFromFiles()}>
                            <PlusCircle color={textColor} />
                        </TouchableOpacity>
                        : <></>}


                    <TextInput
                        multiline
                        style={[
                            styles.textInput,
                            { color: textColor, height: inputHeight }
                        ]}
                        returnKeyType="send"
                        value={message}
                        onChangeText={setMessage}
                        onContentSizeChange={(e) => {
                            const newHeight = e.nativeEvent.contentSize.height;
                            // clamp height between min and max (40 -> 120)
                            setInputHeight(Math.max(40, Math.min(newHeight, 120)));
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
        justifyContent: 'space-evenly',
        alignItems: 'flex-end',
        padding: 10,
        paddingVertical: 5,
        gap: 10
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
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        aspectRatio: 1,
        backgroundColor: Colors.green
    },
    sendButton: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 40,
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
        height: 40,
    },
    container: {
        flex: 1
    }
})