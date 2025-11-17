import { Pressable, Text, StyleSheet, View, TouchableOpacity } from "react-native";
import { MessageResponse } from "../types/MessageResponse";
import { useCallback, useEffect, useState } from "react";
import { AttachmentDto } from "../types/AttachmentDTO";
import { useAuth } from "../app/context/AuthContext";
import { useTheme } from "../app/context/ThemeContext";
import axios from "axios";
import { API_URL } from "../constants/ApiUri";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useAttachmentDownload } from "../hooks/useAttachmentDownload";

export default function ChatComponent({ item, handleLongPress }: { item: MessageResponse, handleLongPress: (item: MessageResponse, e: any) => void; }) {
    const [items, setItems] = useState<AttachmentDto[]>([]);
    const [loading, setLoading] = useState(false)
    const { downloadingId, downloadAttachment } = useAttachmentDownload();
    const { onGetUserToken } = useAuth()
    const { theme } = useTheme()
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
            setItems(result)
        }
        setLoading(false)
    }
    useEffect(()=>{
        if(item.hasAttachments){
            handleFetchAttachments()
        }
    },[])
    return (
        <View>
            <Pressable
                onLongPress={(e) => handleLongPress(item, e)}
                delayLongPress={300}
            >
                <Text style={{ fontWeight: "600" }}>{item.senderId}</Text>
                <Text>{item.message}</Text>
                <Text style={{ opacity: 0.6, fontSize: 12 }}>{new Date(item.createdAt).toLocaleString()}</Text>
            </Pressable>
            {items.map((item) => (
                <TouchableOpacity
                    key={item.attachmentId}
                    onPress={() => downloadAttachment(item)}
                    disabled={downloadingId === item.attachmentId}
                    style={{ opacity: downloadingId === item.attachmentId ? 0.5 : 1 }}
                >
                    <Text>
                        {item.fileName}
                        {downloadingId === item.attachmentId ? "  • downloading..." : ""}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>

    )
}
