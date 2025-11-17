import { useCallback, useRef, useState } from "react";
import { useAuth } from "../app/context/AuthContext";
import { CommentResponse } from "../types/CommentResponse";
import { ActivityIndicator, FlatList, RefreshControl, View } from "react-native";
import Comment from "./Comment"
import { API_URL } from "../constants/ApiUri";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../app/context/ThemeContext";
type Props = {
  contentId: string;
  comments: CommentResponse[];
  setComments: React.Dispatch<React.SetStateAction<CommentResponse[]>>;
  navigation:any
};
export default function CommentsList({
  contentId,
  comments,
  setComments,
  navigation
}: Props) {
    const { onGetUserToken } = useAuth()
    const { theme } = useTheme()
    const [total, setTotal] = useState(0)
    const [refresh, setRefresh] = useState(false)
    const loadingRef = useRef(false)
    const pageRef = useRef(1)
    const refreshRef = useRef(false)
    const fetchComments = async (pageNumber: number) => {
        try {
            const token = await onGetUserToken!()
            var url = `${API_URL}/get-comments?pageSize=3&pageNumber=${pageNumber}`
            const response = await axios.get(url, {
                params: {
                    contentId: contentId
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const handleFetch = async (page = pageRef.current, replace: boolean) => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        const result = await fetchComments(page);
        if (!result.error) {
            if (replace) {
                setComments(result.comments)
            } else {
                setComments(prev => [...prev, ...result.comments])
            }
            setTotal(result.total);
        }
        loadingRef.current = false;
    }
    const loadMore = async () => {
        if (!loadingRef.current && comments.length < total) {
            loadingRef.current = true;
            pageRef.current += 1;
            await handleFetch(pageRef.current, false);
        }
    }
    const handleRefresh = useCallback(async () => {
        if (refreshRef.current) return
        refreshRef.current = true
        setRefresh(true)
        try {
            reset()
        } finally {
            setRefresh(false);
            refreshRef.current = false;
        }
    }, [handleFetch])
    const reset = async () => {
        pageRef.current = 1
        await handleFetch(1, true)
    }
    useFocusEffect(
        useCallback(() => {
            reset()
        }, [])
    );
    return (
        <FlatList
            data={comments}
            keyExtractor={(item) => item.commentId}
            renderItem={({ item }: { item: CommentResponse }) => <Comment comment={item} navigation={navigation}/>}
            keyboardShouldPersistTaps="handled"
            onEndReached={loadMore}
            onEndReachedThreshold={0.2}
            refreshControl={
                <RefreshControl refreshing={refresh} onRefresh={handleRefresh} />
            }
            ListFooterComponent={
                loadingRef.current ?
                    <ActivityIndicator size="large" style={{ height: 64, margin: 10, borderRadius: 5 }} color={theme == "dark" ? "white" : "black"} />
                    :
                    <View style={{ marginTop: 64 }} />
            }
        />
    )
}