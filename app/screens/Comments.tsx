import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { View, Text, FlatList, KeyboardAvoidingView, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Platform, RefreshControl } from "react-native";
import TopBar from "../../components/TopBar";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { SetStateAction, useCallback, useEffect, useState } from "react";
import { CommentResponse } from "../../types/CommentResponse";
import Colors from "../../constants/Colors";
import { API_URL } from "../../constants/ApiUri";
import axios from "axios";
import { Send } from "lucide-react-native";
import Comment from "../../components/Comment";
import CommentsList from "../../components/CommentsList";
type CommentsDetailProps = NativeStackScreenProps<RootStackParamList, "Comments">;
export default function Comments({ navigation, route }: CommentsDetailProps) {
    const { postId } = route.params
    const { theme, borderColor, textColor } = useTheme()
    const { onGetUserToken } = useAuth()
    const [comments, setComments] = useState<CommentResponse[]>([])
    const [message, setMessage] = useState("")
    const [messageLoading, setMessageLoading] = useState(false)
    const postMessage = async (message: string, contentId: string) => {
        try {
            const token = await onGetUserToken!()
            const res = await axios.post(`${API_URL}/create-comment`, {
                TargetContentId: contentId,
                Comment: message
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            return res.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const handlePost = async () => {
        if (message != "") {
            setMessageLoading(true)
            const result = await postMessage(message, postId)
            if (!result.error) {
                setComments(prev => [result, ...prev]);
            }
            setMessage("")
            setMessageLoading(false)
        }

    }
    return (
        <KeyboardAvoidingView style={{ flex: 1, position: 'relative' }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={50}>
            <TopBar title="Comments" showBackButton />
            <View style={{ flex: 1 }}>
                <CommentsList
                    contentId={postId}
                    comments={comments}
                    setComments={setComments}
                    navigation={navigation} />
                <View
                    style={[
                        styles.inputContainer,
                        { borderColor: borderColor }
                    ]}>
                    <TextInput
                        style={[
                            styles.textInput,
                            { color: textColor }
                        ]}
                        returnKeyType="send"
                        onChangeText={setMessage}
                        value={message}
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={() => handlePost()}>
                        {messageLoading ? <ActivityIndicator size="small" style={{ height: 20 }} color={theme == "dark" ? "white" : "black"} /> : <Send color={"white"} size={20} />}
                    </TouchableOpacity>
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
})