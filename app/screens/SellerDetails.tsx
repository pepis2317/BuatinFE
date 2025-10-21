import { ScrollView, View, Text, useWindowDimensions, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import TopBar from "../../components/TopBar";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { useCallback, useEffect, useState } from "react";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import { PostResponse } from "../../types/PostResponse";
import { useTheme } from "../context/ThemeContext";
import PostCard from "../../components/PostCard";
import { SellerResponse } from "../../types/SellerResponse";
import Colors from "../../constants/Colors";
import ColoredButton from "../../components/ColoredButton";
import { useAuth } from "../context/AuthContext";
import { OrderRequestResponse } from "../../types/OrderRequestResponse";

const DetailsRoute = ({ seller, navigation }: { seller: SellerResponse, navigation: any }) => {
    return (
        <View>
            <ColoredButton title={"Create Order Request"} style={{ backgroundColor: Colors.green }} onPress={() => navigation.navigate('OrderRequest', { sellerId: seller.sellerId })} />
        </View>
    )
}
type Cursor = {
    lastId: string | null
    lastCreatedAt: string | null
}

const PostsRoute = ({ seller, navigation }: { seller: SellerResponse, navigation: any }) => {
    const [posts, setPosts] = useState<PostResponse[]>([])
    const [cursor, setCursor] = useState<Cursor>({ lastId: null, lastCreatedAt: null, });
    const [hasMore, setHasMore] = useState(false)
    const [loading, setLoading] = useState(false)
    const [refresh, setRefresh] = useState(false)
    const { theme } = useTheme()
    const handleFetch = useCallback(async (lastId: string | null, lastCreatedAt: string | null) => {
        if (loading) return;
        setLoading(true);
        const result = await fetchPosts(lastId, lastCreatedAt);
        if (result.error) {
            alert(result.error)
        } else {
            setPosts(prev => {
                if (!lastId && !lastCreatedAt) return result.posts;
                const seen = new Set(prev.map(p => p.postId));
                const merged = [...prev];
                for (const p of result.posts) if (!seen.has(p.postId)) merged.push(p);
                return merged;
            });
            setCursor({ lastId: result.lastId, lastCreatedAt: result.lastCreatedAt });
            setHasMore(result.hasMore);
        }
        setLoading(false);
        setRefresh(false);
    }, [loading]);
    useEffect(() => {
        handleFetch(null, null);
    }, []);
    const loadMore = useCallback(() => {
        if (!loading && hasMore) handleFetch(cursor.lastId, cursor.lastCreatedAt);
    }, [loading, hasMore, cursor, handleFetch]);
    const onRefresh = useCallback(() => {
        setRefresh(true);
        setPosts([]);
        handleFetch(null, null);
    }, [handleFetch]);
    const fetchPosts = async (lastPostId: string | null, lastCreatedAt: string | null) => {
        try {
            let queryString = `/get-posts?AuthorId=${seller.owner.userId}&pageSize=3`;
            if (lastPostId != null && lastCreatedAt != null) {
                queryString = queryString + `&LastPostId=${lastPostId}&LastCreatedAt=${encodeURIComponent(lastCreatedAt)}`
            }
            const response = await axios.get(`${API_URL}${queryString}`);
            return response.data;
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    };
    return (
        <View style={{ flex: 1 }}>
            {posts.length > 0 ?
                <FlatList
                    data={posts}
                    numColumns={3}
                    keyExtractor={(post) => post.postId}
                    renderItem={({ item, index }) => (
                        <PostCard post={item} onPress={() =>
                            navigation.navigate('PostDetails', {
                                posts: posts,
                                selectedPostIndex: index,
                                seller: seller,
                                hasMorePosts: hasMore
                            })} />
                    )}
                    onEndReached={loadMore}
                    onEndReachedThreshold={1}
                    refreshControl={
                        <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
                    }
                    ListFooterComponent={
                        loading ?
                            <ActivityIndicator size="large" style={{ height: 64, margin: 10, borderRadius: 5 }} color={theme == "dark" ? "white" : "black"} />
                            :
                            <View style={{ marginTop: 64 }} />
                    }
                >
                </FlatList> : <></>}
        </View>
    )
}
const routes = [
    { key: 'Details', title: 'Details' },
    { key: 'Posts', title: 'Posts' },
];
type SellerDetailProps = NativeStackScreenProps<RootStackParamList, "SellerDetails">;
export default function SellerDetails({ navigation, route }: SellerDetailProps) {
    const { seller } = route.params
    const layout = useWindowDimensions()
    const [index, setIndex] = useState(0)
    const { theme } = useTheme()
    const backgroundColor = theme == "dark" ? Colors.darkBackground : Colors.lightBackground
    const selectedColor = theme == "dark" ? "white" : "black"
    const unselectedColor = theme == "dark" ? Colors.offWhite : Colors.darkGray
    return (
        <View style={{ flex: 1 }}>
            <TopBar title={seller.sellerName} showBackButton />
            <TabView
                style={{ flex: 1 }}
                navigationState={{ index, routes }}
                renderScene={({ route }) => {
                    switch (route.key) {
                        case 'Details':
                            return <DetailsRoute navigation={navigation} seller={seller} />;
                        case 'Posts':
                            return <PostsRoute navigation={navigation} seller={seller} />;
                        default:
                            return null;
                    }
                }}
                onIndexChange={setIndex}
                initialLayout={{ width: layout.width }}
                renderTabBar={(props) => (
                    <TabBar
                        {...props}
                        activeColor={selectedColor}
                        inactiveColor={unselectedColor}
                        scrollEnabled={false}
                        indicatorStyle={{ backgroundColor: Colors.green }}
                        style={{ backgroundColor: backgroundColor }}
                    />
                )}
            />
        </View>
    );
}