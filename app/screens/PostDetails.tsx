import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { FlatList, View, ActivityIndicator, StyleSheet, Text } from "react-native";
import TopBar from "../../components/TopBar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PostDetail from "../../components/PostDetail";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import { useTheme } from "../context/ThemeContext";
import { PostResponse } from "../../types/PostResponse";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import PostComments from "../../components/PostComments";
import Colors from "../../constants/Colors";

type PostDetailProps = NativeStackScreenProps<RootStackParamList, "PostDetails">;
export default function PostDetails({ navigation, route }: PostDetailProps) {
    const { theme } = useTheme()
    const { posts, selectedPostIndex, seller, hasMorePosts } = route.params;
    const [loadedPosts, setLoadedPosts] = useState<PostResponse[]>(posts)
    const [commentPostId, setCommentPostId] = useState("")
    const [hasMore, setHasMore] = useState(hasMorePosts)
    const [loadingOlder, setLoadingOlder] = useState(false);
    const [cursor, setCursor] = useState<{ lastId: string; lastCreatedAt: string }>({
        lastId: posts[posts.length - 1].postId,
        lastCreatedAt: posts[posts.length - 1].createdAt,
    });
    const bottomSheetRef = useRef<BottomSheet>(null);
    const handleSheetChanges = useCallback((index: number) => {
        console.log('handleSheetChanges', index);
    }, []);
    const listRef = useRef<FlatList<PostResponse>>(null);
    const ITEM_HEIGHT = 600;
    const handleStyle = theme === "dark" ? "white" : "black"
    const backgroundColor = theme == "dark" ? Colors.darkBackground : Colors.lightBackground
    const fetchPosts = async (lastPostId: string, lastCreatedAt: string) => {
        try {
            let queryString = `/get-posts?AuthorId=${seller.owner.userId}&pageSize=3&LastPostId=${lastPostId}&LastCreatedAt=${encodeURIComponent(lastCreatedAt)}`;
            const response = await axios.get(`${API_URL}${queryString}`);
            return response.data;
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    };

    const handleFetch = useCallback(async (lastId: string, lastCreatedAt: string) => {
        if (loadingOlder) return;
        setLoadingOlder(true)
        const result = await fetchPosts(lastId, lastCreatedAt)
        if (result.error) {
            alert(result.msg)
        } else {
            setLoadedPosts(prev => {
                if (!lastId && !lastCreatedAt) return result.posts;
                const seen = new Set(prev.map(p => p.postId));
                const merged = [...prev];
                for (const p of result.posts) if (!seen.has(p.postId)) merged.push(p);
                return merged;
            });
            setCursor({ lastId: result.lastId, lastCreatedAt: result.lastCreatedAt });
            setHasMore(result.hasMore);
        }
        setLoadingOlder(false);
    }, [loadingOlder])

    const loadMore = useCallback(() => {
        if (!loadingOlder && hasMore) {
            handleFetch(cursor.lastId, cursor.lastCreatedAt);
        }
    }, [loadingOlder, hasMore, cursor, handleFetch]);
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <TopBar title="Posts" showBackButton />
            <FlatList
                ref={listRef}
                data={loadedPosts}
                showsVerticalScrollIndicator={false}
                keyExtractor={(p) => p.postId}
                renderItem={({ item }) => <PostDetail post={item} seller={seller} onCommentPressed={() => {
                    navigation.navigate("Comments",{postId:item.postId})
                }} />}
                initialScrollIndex={selectedPostIndex}
                getItemLayout={(d, i) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * i, index: i })}
                onScrollToIndexFailed={(info) => {
                    listRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: false });
                    setTimeout(() => listRef.current?.scrollToIndex({ index: info.index, animated: false }), 50);
                }}
                onEndReachedThreshold={1}
                onEndReached={loadMore}
                maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
                ListFooterComponent={
                    loadingOlder ?
                        <ActivityIndicator size="large" style={{ height: 64, margin: 10, borderRadius: 5 }} color={theme == "dark" ? "white" : "black"} />
                        :
                        <View style={{ marginTop: 64 }} />
                }
            />
        </GestureHandlerRootView>
    );
}
const styles = StyleSheet.create({
    backgroundStyle: {
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10
    },
    contentContainer: {
        flex: 1,
        padding: 36,
        alignItems: 'center',
    },
})