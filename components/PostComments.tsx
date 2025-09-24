import { Text, KeyboardAvoidingView, StyleSheet, TouchableOpacity, ActivityIndicator, View, RefreshControl } from "react-native";
import { CommentResponse } from "../types/CommentResponse";
import { JSX, useCallback, useEffect, useMemo, useState } from "react";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { useTheme } from "../app/context/ThemeContext";
import Colors from "../constants/Colors";
import { API_URL } from "../constants/ApiUri";
import axios from "axios";
import { useAuth } from "../app/context/AuthContext";
import BottomSheet, { BottomSheetFlatList, BottomSheetFooter, BottomSheetTextInput, BottomSheetView } from "@gorhom/bottom-sheet";
import { Send } from "lucide-react-native";
import Comment from "./Comment";
import { BottomSheetDefaultFooterProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetFooter/types";
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
export default function PostComments({ postId, bottomSheetRef }: { postId: string, bottomSheetRef: any }) {
    const { theme } = useTheme()
    const { onGetUserToken } = useAuth()
    const [comments, setComments] = useState<CommentResponse[]>([test])
    const [message, setMessage] = useState("")
    const [messageLoading, setMessageLoading] = useState(false)
    const [loading, setLoading] = useState(false)

    const borderColor = theme == "dark" ? Colors.darkBorder : Colors.lightBorder
    const handleStyle = theme === "dark" ? "white" : "black"
    const backgroundColor = theme == "dark" ? Colors.darkBackground : Colors.lightBackground
    const fetchComments = async (contentId: string) => {
        try {
            const response = await axios.get(`${API_URL}/get-comments?contentId=${contentId}`)
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
            console.log(result)
            setMessageLoading(false)
        } else {
            console.log("message empty")
        }

    }
    const handleFetch = async () => {
        setLoading(true)
        const result = await fetchComments(postId)
        if (!result.error) {
            setComments(result)
        }

        setLoading(false)
    }

    return (
        <BottomSheet
            ref={bottomSheetRef}
            enablePanDownToClose
            index={-1}
            snapPoints={['100%']}
            handleIndicatorStyle={{ backgroundColor: handleStyle }}
            backgroundStyle={{ backgroundColor: backgroundColor }}
        >
            <BottomSheetView>
                {loading ? (
                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16 }}>
                        <ActivityIndicator size="small" style={{ height: 16, borderRadius: 5 }} color={theme == "dark" ? "white" : "black"} />
                        <Text style={{ marginTop: 8, color: handleStyle }}>Loading comments…</Text>
                        <View style={{ flexDirection: 'row' }}>
                            <BottomSheetTextInput style={[styles.textInput, { color: handleStyle }]} returnKeyType="send" onChangeText={setMessage} />
                            <TouchableOpacity style={styles.sendButton} onPress={() => handlePost()}>
                                {messageLoading ? <ActivityIndicator size="small" style={{ height: 20 }} color={theme == "dark" ? "white" : "black"} /> : <Send color={"white"} size={20} />}
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : comments.length > 0 ? (
                    <View>
                        <BottomSheetFlatList
                            data={comments}
                            keyExtractor={(item: CommentResponse) => item.commentId}
                            renderItem={({ item }: { item: CommentResponse }) => <Comment comment={item} />}
                            style={{ flex: 1 }}
                            contentContainerStyle={{ paddingBottom: 8 }}
                            keyboardShouldPersistTaps="handled"
                        />
                        <KeyboardAvoidingView style={{ flexDirection: 'row' }}>
                            <BottomSheetTextInput style={[styles.textInput, { color: handleStyle }]} returnKeyType="send" onChangeText={setMessage} />
                            <TouchableOpacity style={styles.sendButton} onPress={() => handlePost()}>
                                {messageLoading ? <ActivityIndicator size="small" style={{ height: 20 }} color={theme == "dark" ? "white" : "black"} /> : <Send color={"white"} size={20} />}
                            </TouchableOpacity>
                        </KeyboardAvoidingView>
                    </View>
                ) : (
                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16, }}>
                        <Text style={{ color: handleStyle }}>No comments yet</Text>
                    </View>
                )}
            </BottomSheetView>


        </BottomSheet>

    )
}
const styles = StyleSheet.create({
    sendButton: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 40,
        aspectRatio: 1,
        backgroundColor: Colors.green
    },
    darkFooter: {
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        gap: 5,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: '#636C7C',
        backgroundColor: '#222831'
    },
    lightFooter: {
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        gap: 5,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: '#D9D9D9',
        backgroundColor: 'white'
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