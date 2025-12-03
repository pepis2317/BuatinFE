import { Pressable, Text, StyleSheet, View, TouchableOpacity } from "react-native";
import { MessageResponse } from "../types/MessageResponse";
import { useState } from "react";
import { useAuth } from "../app/context/AuthContext";
import { useTheme } from "../app/context/ThemeContext";
import { useAttachmentDownload } from "../hooks/useAttachmentDownload";
import Colors from "../constants/Colors";
import { Check, File } from "lucide-react-native";

export default function ChatComponent({ item, handleLongPress }: { item: MessageResponse, handleLongPress: (item: MessageResponse, e: any) => void; }) {
    const [sending, setSending] = useState(false)
    const { downloadingId, downloadAttachment } = useAttachmentDownload();
    const { user } = useAuth()
    const { textColor, borderColor, subtleBorderColor } = useTheme()
    return (
        <View style={[styles.container, item.senderId == user?.userId ? { alignItems: 'flex-end' } : {}, item.message != "" ? { marginVertical: 5 } : {}]}>
            {item.message != "" ?
                <Pressable
                    disabled={item.senderId != user?.userId && !item.sent}
                    style={[styles.message, item.senderId == user?.userId ? { backgroundColor: Colors.green } : { backgroundColor: subtleBorderColor }]}
                    onLongPress={(e) => handleLongPress(item, e)}
                    delayLongPress={300}
                >
                    <Text style={[{ color: item.deletedAt ? 'gray' : textColor }, item.senderId == user?.userId ? { textAlign: 'right', color: item.deletedAt ? Colors.darkGreen : textColor } : {}]}>{item.message}</Text>
                </Pressable>
                : <></>}

            {item.attachments ?
                item.attachments.map((attachment) =>
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
                    </TouchableOpacity>)
                : <></>}

            {item.message != "" ?
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: 'gray', fontSize: 10, marginHorizontal: 5, marginTop: 1 }}>
                        {item.deletedAt != null ? "(Deleted) " + new Date(item.deletedAt).toLocaleTimeString() :
                            item.updatedAt != null ? "(Edited) " + new Date(item.updatedAt).toLocaleTimeString() :
                                new Date(item.createdAt).toLocaleTimeString()}
                    </Text>
                    {item.sent ? <Check color={'gray'} size={12} /> : <></>}
                </View>
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
