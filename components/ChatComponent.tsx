import { Pressable, Text, StyleSheet, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { MessageResponse } from "../types/MessageResponse";
import { useCallback, useEffect, useState } from "react";
import { AttachmentDto } from "../types/AttachmentDTO";
import { useAuth } from "../app/context/AuthContext";
import { useTheme } from "../app/context/ThemeContext";
import axios from "axios";
import { API_URL } from "../constants/ApiUri";
import { useAttachmentDownload } from "../hooks/useAttachmentDownload";
import Colors from "../constants/Colors";
import { File } from "lucide-react-native";

export default function ChatComponent({ item, handleLongPress }: { item: MessageResponse, handleLongPress: (item: MessageResponse, e: any) => void; }) {
    const [attachments, setAttachments] = useState<AttachmentDto[]>([]);
    const [loading, setLoading] = useState(false)
    const { downloadingId, downloadAttachment } = useAttachmentDownload();
    const { onGetUserToken, user } = useAuth()
    const { textColor, borderColor, subtleBorderColor } = useTheme()
    const fetchAttachments = async () => {
        try {
            const token = await onGetUserToken!()
            const response = await axios.get(`${API_URL}/chat/get-attachments?messageId=${item.messageId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const handleFetchAttachments = async () => {
        setLoading(true)
        const result = await fetchAttachments()
        if (!result.error) {
            setAttachments(result)
        }
        setLoading(false)
    }
    useEffect(() => {
        if (item.hasAttachments) {
            handleFetchAttachments()
        }
    }, [item.hasAttachments])
    return (
        <View style={[styles.container, item.senderId == user?.userId ? { alignItems: 'flex-end' } : {}, item.message != "" ? { marginVertical: 5 } : {}]}>
            {item.message != "" ?
                <Pressable
                    disabled={item.senderId != user?.userId}
                    style={[styles.message, item.senderId == user?.userId ? { backgroundColor: Colors.green } : { backgroundColor: subtleBorderColor }]}
                    onLongPress={(e) => handleLongPress(item, e)}
                    delayLongPress={300}
                >
                    <Text style={[{ color: item.deletedAt ? 'gray' : textColor }, item.senderId == user?.userId ? { textAlign: 'right', color: item.deletedAt ? 'gray' : textColor  } : {}]}>{item.message}</Text>
                </Pressable>
                : <></>}
            {item.hasAttachments ?
                !loading ?
                    attachments.map((attachment) => (
                        <TouchableOpacity
                            key={attachment.attachmentId}
                            // onLongPress={(e) => handleLongPress(item, e)}
                            onPress={() => downloadAttachment(attachment)}
                            disabled={downloadingId === attachment.attachmentId}
                            style={[styles.attachment, { backgroundColor: subtleBorderColor, borderColor: borderColor }]}
                        >
                            <File color={Colors.green} size={30} />
                            <Text style={{ color: textColor, marginTop: 10 }}>
                                {decodeURIComponent(attachment.fileName)}
                            </Text>
                            {downloadingId === attachment.attachmentId ?
                                <Text style={{ color: textColor }}>
                                    Downloading...
                                </Text>
                                : <></>}
                        </TouchableOpacity>
                    ))
                    : <ActivityIndicator size="small" style={{ height: 64, margin: 10, borderRadius: 5 }} color={textColor} />
                : <></>}

            {item.message != "" ?
                <Text style={{ color: 'gray', fontSize: 10, marginHorizontal: 5, marginTop: 1 }}>
                    {item.deletedAt != null ? "(Deleted) " + new Date(item.deletedAt).toLocaleTimeString() :
                        item.updatedAt != null ? "(Edited) " + new Date(item.updatedAt).toLocaleTimeString() :
                            new Date(item.createdAt).toLocaleTimeString()}
                </Text>
                : <></>}

        </View>

    )
}
const styles = StyleSheet.create({
    attachment: {
        padding: 10,
        maxWidth: '50%',
        borderRadius: 10,
        borderWidth: 1,
        marginVertical: 5
    },
    message: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20
    },
    container: {
        alignItems: 'flex-start'
    }
})
