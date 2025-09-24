import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { View, Text, FlatList, KeyboardAvoidingView, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Platform, RefreshControl } from "react-native";
import TopBar from "../../components/TopBar";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useCallback, useEffect, useState } from "react";
import { CommentResponse } from "../../types/CommentResponse";
import Colors from "../../constants/Colors";
import { API_URL } from "../../constants/ApiUri";
import axios from "axios";
import { Send } from "lucide-react-native";
import Comment from "../../components/Comment";
const test: CommentResponse = {
    authorId: "as",
    authorName: "bs",
    authorPfp: "cs",
    comment: "ds Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum doloremque alias earum voluptatibus facere perferendis aperiam iste. Aliquid pariatur assumenda nostrum, repellendus odit explicabo minus, dolore voluptatibus ex veniam officia possimus dolores iste beatae. Aperiam nisi quisquam iste nulla deleniti fugit alias, quibusdam ratione incidunt illum necessitatibus. Recusandae, a facilis?",
    createdAt: "asd",
    updatedAt: "asd",
    replies: 5,
    commentId: "asd"
}
type CommentsDetailProps = NativeStackScreenProps<RootStackParamList, "Comments">;
export default function Comments({ navigation, route }: CommentsDetailProps) {
    const { postId } = route.params
    const { theme } = useTheme()
    const { onGetUserToken } = useAuth()
    const [comments, setComments] = useState<CommentResponse[]>([])
    const [message, setMessage] = useState("")
    const [messageLoading, setMessageLoading] = useState(false)
    const [loading, setLoading] = useState(false)
    const [refresh, setRefresh] = useState(false)
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const borderColor = theme == "dark" ? Colors.darkBorder : Colors.lightBorder
    const textColor = theme === "dark" ? "white" : "black"
    const fetchComments = async (contentId: string, pageNumber: number) => {
        try {
            const response = await axios.get(`${API_URL}/get-comments?contentId=${contentId}&pageSize=3&pageNumber=${pageNumber}`)
            setRefresh(false)
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
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
    const handleFetch = async () => {
        setLoading(true)
        const result = await fetchComments(postId, page)
        if (!result.error) {
            setComments(prev => [...prev, ...result.comments])
            setTotal(result.total)
        }
        setLoading(false)
    }
    const loadMore = () => {
        if (!loading && comments.length < total) {
            setPage(prev => prev + 1)
        }
    };
    useEffect(() => {
        if (comments.length <= total) {
            handleFetch()
        }
    }, [page])
    const onRefresh = useCallback(() => {
        setLoading(true)
        setRefresh(true)
        setPage(1)
        setComments([])
    }, [])
    return (
        <KeyboardAvoidingView style={{ flex: 1, position: 'relative' }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}>
            <TopBar title="Comments" showBackButton />
            <View style={{ flex: 1 }}>
                {loading ? (
                    <ActivityIndicator size="small" style={{ height: 16, borderRadius: 5, margin: 10 }} color={theme == "dark" ? "white" : "black"} />
                ) : comments.length > 0 ? (
                    <FlatList
                        data={comments}
                        keyExtractor={(item: CommentResponse) => item.commentId}
                        renderItem={({ item }: { item: CommentResponse }) => <Comment comment={item} />}
                        contentContainerStyle={{ paddingBottom: 8 }}
                        keyboardShouldPersistTaps="handled"
                        onEndReached={loadMore}
                        onEndReachedThreshold={0.5}
                        refreshControl={
                            <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
                        }
                    />
                ) : (
                    <View style={{ alignItems: "center", justifyContent: "center", padding: 16, }}>
                        <Text style={{ color: textColor }}>No comments yet</Text>
                    </View>
                )}
            </View>
            <View style={[styles.inputContainer, { borderColor: borderColor }]}>
                <TextInput style={[styles.textInput, { color: textColor }]} returnKeyType="send" onChangeText={setMessage} />
                <TouchableOpacity style={styles.sendButton} onPress={() => handlePost()}>
                    {messageLoading ? <ActivityIndicator size="small" style={{ height: 20 }} color={theme == "dark" ? "white" : "black"} /> : <Send color={"white"} size={20} />}
                </TouchableOpacity>
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