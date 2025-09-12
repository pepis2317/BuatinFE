import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, useWindowDimensions, View, Text, Dimensions, ListRenderItemInfo, FlatListProps, Button, ActivityIndicator } from "react-native";
import TopBar from "../../components/TopBar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PostDetail from "../../components/PostDetail";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import { useTheme } from "../context/ThemeContext";
import { PostResponse } from "../../types/PostResponse";

type PostDetailProps = NativeStackScreenProps<RootStackParamList, "PostDetails">;
export default function PostDetails({ navigation, route }: PostDetailProps) {
    const { theme } = useTheme()
    const { initialPostId, authorId } = route.params;
    const [posts, setPosts] = useState<PostResponse[]>([]);
    const [topId, setTopId] = useState(initialPostId)
    const [bottomId, setBottomId] = useState(initialPostId)
    const [loadingNewer, setLoadingNewer] = useState(false);
    const [loadingOlder, setLoadingOlder] = useState(false);
    const [stopLoadingNewer, setStopLoadingNewer] = useState(false)
    const [stopLoadingOlder, setStopLoadingOlder] = useState(false)
    const loadingRef = useRef({ newer: false, older: false });
    const seenIdsRef = useRef<Set<string>>(new Set());
    const initialFetch = async () => {
        try {
            const res = await axios.get(`${API_URL}/get-post?PostId=${initialPostId}`)
            return res.data
        } catch (e: any) {
            return { error: true, msg: e?.response?.data?.detail || "An error occurred" };
        }
    }
    useEffect(() => {
        (async () => {
            const res = await initialFetch();
            if (!res?.error && res?.postId) {
                if (!seenIdsRef.current.has(res.postId)) {
                    seenIdsRef.current.add(res.postId);
                    setPosts([res]);
                    setTopId(res.postId);
                    setBottomId(res.postId);
                }
            }
        })();
    }, []);
    const fetchNewerPosts = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API_URL}/get-cursor-posts`, {
                params: { AuthorId: authorId, GetNextPostId: topId },
            });
            return data;
        } catch (e: any) {
            return { error: true, msg: e?.response?.data?.detail || "An error occurred" };
        }
    }, [authorId, topId]);

    const fetchOlderPosts = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API_URL}/get-cursor-posts`, {
                params: { AuthorId: authorId, GetPrevPostId: bottomId },
            });
            return data;
        } catch (e: any) {
            return { error: true, msg: e?.response?.data?.detail || "An error occurred" };
        }
    }, [authorId, bottomId]);
    const addIfNewPrepend = (post: any) => {
        const id = post?.postId;
        if (!id || seenIdsRef.current.has(id)) return false;
        seenIdsRef.current.add(id);
        setPosts(prev => [post, ...prev]);
        return true;
    };
    const addIfNewAppend = (post: any) => {
        const id = post?.postId;
        if (!id || seenIdsRef.current.has(id)) return false;
        seenIdsRef.current.add(id);
        setPosts(prev => [...prev, post]);
        return true;
    };

    const prepend = async () => {
        if (stopLoadingNewer || loadingRef.current.newer) return;
        loadingRef.current.newer = true;
        setLoadingNewer(true);

        const res = await fetchNewerPosts();

        if (res?.error || !res?.postId) {
            setStopLoadingNewer(true);
        } else {
            const added = addIfNewPrepend(res);
            if (added) setTopId(res.postId);
            else setStopLoadingNewer(true);
        }

        setLoadingNewer(false);
        loadingRef.current.newer = false;
    };

    const append = async () => {
        if (stopLoadingOlder || loadingRef.current.older) return;
        loadingRef.current.older = true;
        setLoadingOlder(true);

        const res = await fetchOlderPosts();

        if (res?.error || !res?.postId) {
            setStopLoadingOlder(true);
        } else {
            const added = addIfNewAppend(res);
            if (added) setBottomId(res.postId);
            else setStopLoadingOlder(true);
        }

        setLoadingOlder(false);
        loadingRef.current.older = false;
    };
    return (
        <View style={{ flex: 1 }}>
            <TopBar title="Posts" showBackButton />
            <FlatList
                showsVerticalScrollIndicator={false}
                data={posts}
                keyExtractor={(post) => post.postId}
                renderItem={({ item }) => <PostDetail post={item} authorId={authorId}/>}
                onEndReached={() => {
                    if (!loadingOlder) {
                        append()
                    }
                }}
                onStartReached={() => {
                    if (!loadingNewer) {
                        prepend()
                    }
                }}
                onStartReachedThreshold={0.2}
                onEndReachedThreshold={0.2}
                maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
                ListFooterComponent={
                    loadingOlder && !stopLoadingOlder
                        ? <ActivityIndicator size="large" style={{ height: 100, margin: 10, borderRadius: 5 }} color={theme === "dark" ? "white" : "black"} />
                        : <></>
                }
                ListHeaderComponent={
                    loadingNewer && !stopLoadingNewer
                        ? <ActivityIndicator size="large" style={{ height: 100, margin: 10, borderRadius: 5 }} color={theme === "dark" ? "white" : "black"} />
                        : <></>
                }
            />
        </View>
    );
}