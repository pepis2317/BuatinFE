import { ScrollView, View, Text, useWindowDimensions, FlatList, RefreshControl, ActivityIndicator, StyleSheet, Image, TouchableOpacity } from "react-native";
import TopBar from "../../components/TopBar";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { useCallback, useEffect, useState } from "react";
import { TabBar, TabView } from "react-native-tab-view";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import { PostResponse } from "../../types/PostResponse";
import { useTheme } from "../context/ThemeContext";
import PostCard from "../../components/PostCard";
import { SellerResponse } from "../../types/SellerResponse";
import Colors from "../../constants/Colors";
import ColoredButton from "../../components/ColoredButton";
import { useAuth } from "../context/AuthContext";
import SellerDetailComponent from "../../components/SellerDetailComponent";
import { SellerStats } from "../../types/Stats";
import { Star } from "lucide-react-native";
import { ReviewResponse } from "../../types/ReviewResponse";
import { ReviewComponentShort } from "../../components/ReviewComponent";

const DetailsRoute = ({ seller, navigation, editable }: { seller: SellerResponse, navigation: any, editable: boolean }) => {
    const { onGetUserToken } = useAuth()
    const { textColor, foregroundColor } = useTheme()
    const [stats, setStats] = useState<SellerStats>()
    const [refreshing, setRefreshing] = useState(false)
    const [canOrder, setCanOrder] = useState<boolean | null>(null)
    const [topreviews, setTopReviews] = useState<ReviewResponse[]>([])
    const getStats = async () => {
        try {
            const response = await axios.get(`${API_URL}/get-seller-stats`, {
                params: {
                    sellerId: seller.sellerId
                }
            });
            return response.data;
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const checkCanOrder = async () => {
        try {
            const token = await onGetUserToken!()
            var url = `${API_URL}/check-can-request`
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    sellerId: seller.sellerId
                }
            })
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const getTopReviews = async () => {
        try {
            const token = await onGetUserToken!()
            var url = `${API_URL}/get-seller-reviews?pageSize=5&pageNumber=1&sellerId=${seller.sellerId}`
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const handleGetStats = async () => {
        const result = await getStats()
        if (!result.error) {
            setStats(result)
        }
    }
    const handleCheck = async () => {
        const result = await checkCanOrder()
        if (!result.error) {
            setCanOrder(result)
        }
    }
    const handleGetReviews = async () => {
        const result = await getTopReviews()
        if (!result.error) {
            setTopReviews(result.reviews)
        }
    }
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        setStats(undefined)
        setTopReviews([])
        setCanOrder(null)
        setRefreshing(false);

        reset()
    }, []);
    const reset = () => {
        handleGetStats()
        handleGetReviews()
        handleCheck()
    }
    useEffect(() => {
        reset()
    }, [])
    return (
        <ScrollView style={{ flex: 1 }} refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
            <SellerDetailComponent seller={seller} navigation={navigation} editing={false} />
            {stats ?
                <View style={[styles.stats, { backgroundColor: foregroundColor }]}>
                    <View style={styles.leftStats}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <Text style={[{ color: textColor }, styles.rating]}>{stats.rating.toPrecision(2)}</Text>
                            <Star color="gold" fill="gold" />
                        </View>
                        <Text style={{ color: textColor, fontSize: 12 }}>Avg. Rating</Text>
                    </View>
                    <View style={[styles.rightStats, { borderLeftColor: textColor }]}>
                        <Text style={{
                            color: textColor,
                            fontWeight: 'bold'
                        }}>{stats.clients} {stats.clients == 1 ? "Client" : "Clients"}</Text>
                        <Text style={{
                            color: textColor,
                            fontWeight: 'bold'
                        }}>{stats.reviews} {stats.reviews == 1 ? "Review" : "Reviews"}</Text>
                        <Text style={{
                            color: textColor,
                            fontWeight: 'bold'
                        }}>{(stats.completionRate * 100).toFixed(1)}% Completion Rate</Text>
                    </View>
                </View>
                : <ActivityIndicator size="large" style={{ height: 64, margin: 10, borderRadius: 5 }} color={textColor} />
            }
            <View style={{ marginHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                <Text style={{ color: textColor, fontWeight: 'bold' }}>Latest Reviews</Text>
                <TouchableOpacity onPress={() => navigation.navigate('SellerReviews', { sellerId: seller.sellerId })}>
                    <Text style={{ color: textColor, fontWeight: 'bold', textDecorationLine: 'underline' }} >View All Reviews</Text>
                </TouchableOpacity>
            </View>
            {topreviews ?
                <View style={{ height: 200 }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={{ width: 20 }} />
                        {topreviews.map((review, index) => (
                            <ReviewComponentShort key={index} review={review} navigation={navigation} isEnd={index == topreviews.length} />
                        ))}
                        <View style={{ width: 20 }} />
                    </ScrollView>
                </View>

                : <ActivityIndicator size="small" style={{ height: 64, margin: 10, borderRadius: 5 }} color={textColor} />
            }
            <View style={{ padding: 20 }}>
                {editable ?
                    <View>
                        <ColoredButton title={"Edit Seller"} style={{ backgroundColor: Colors.green }} onPress={() => navigation.navigate('EditSeller')} />
                        <ColoredButton title={"Create Post"} style={{ backgroundColor: Colors.green }} onPress={() => navigation.navigate("CreatePost")} />
                    </View>

                    :
                    canOrder == null ?
                        <ActivityIndicator size="small" style={{ height: 64, margin: 10, borderRadius: 5 }} color={textColor} />
                        :
                        <View>
                            {canOrder ?
                                <ColoredButton title={"Create Order Request"} style={{ backgroundColor: Colors.green }} onPress={() => navigation.navigate('OrderRequest', { sellerId: seller.sellerId })} /> :
                                <Text style={{ textAlign: 'center', color: textColor, fontWeight: 'bold' }}>You can't make an order request to this seller now</Text>}

                        </View>
                }
            </View>

        </ScrollView>
    )
}
type Cursor = {
    lastId: string | null
    lastCreatedAt: string | null
}

const PostsRoute = ({ seller, navigation }: { seller: SellerResponse, navigation: any }) => {
    const { onGetUserToken } = useAuth()
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
            alert(result.msg)
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
            const token = await onGetUserToken!()
            let queryString = `/get-posts?AuthorId=${seller.owner.userId}&pageSize=3`;
            if (lastPostId != null && lastCreatedAt != null) {
                queryString = queryString + `&LastPostId=${lastPostId}&LastCreatedAt=${encodeURIComponent(lastCreatedAt)}`
            }
            const response = await axios.get(`${API_URL}${queryString}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
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
    const { user } = useAuth()
    const { sellerId } = route.params
    const [seller, setSeller] = useState<SellerResponse>()
    const [editable, setEditable] = useState(false)
    const [loading, setLoading] = useState(false)
    const layout = useWindowDimensions()
    const [index, setIndex] = useState(0)
    const { theme, backgroundColor, textColor } = useTheme()
    const unselectedColor = theme == "dark" ? Colors.offWhite : Colors.darkGray
    const getSellerByOwnerId = async (userId: string) => {
        try {
            const result = await axios.get(`${API_URL}/get-seller-by-owner-id`, {
                params: {
                    ownerId: userId
                }
            })
            return result.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" }
        }
    }
    const getSellerById = async () => {
        try {
            const result = await axios.get(`${API_URL}/get-seller`, {
                params: {
                    sellerId: sellerId
                }
            })
            return result.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" }
        }
    }
    const handleGetSellerBySellerId = async () => {
        setLoading(true)
        const result = await getSellerById()
        if (!result.error) {
            setSeller(result)
        }
        setLoading(false)
    }
    const handleGetSellerByUserId = async () => {
        if (user?.userId) {
            setLoading(true)
            const result = await getSellerByOwnerId(user.userId)
            if (!result.error) {
                setSeller(result)
            }
            setLoading(false)
        }
    }
    useEffect(() => {
        if (!sellerId) {
            setEditable(true)
            handleGetSellerByUserId()
        } else {
            handleGetSellerBySellerId()
        }

    }, [sellerId])

    return (
        <View style={{ flex: 1 }}>
            <TopBar title={"Seller Details"} showBackButton />
            {seller ?
                <TabView
                    style={{ flex: 1 }}
                    navigationState={{ index, routes }}
                    renderScene={({ route }) => {
                        switch (route.key) {
                            case 'Details':
                                return <DetailsRoute navigation={navigation} seller={seller} editable={editable} />;
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
                            activeColor={textColor}
                            inactiveColor={unselectedColor}
                            scrollEnabled={false}
                            indicatorStyle={{ backgroundColor: Colors.green }}
                            style={{ backgroundColor: backgroundColor }}
                        />
                    )}
                />
                : <ActivityIndicator size="large" style={{ height: 64, margin: 10, borderRadius: 5 }} color={textColor} />}

        </View>
    );
}
const styles = StyleSheet.create({
    reviewContainer: {
        padding: 10,
        borderRadius: 5,
        width: 250
    },
    stats: {
        marginHorizontal: 20,
        padding: 10,
        borderRadius: 5,
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },
    rating: {
        fontSize: 24,
        fontWeight: 'bold'
    },
    leftStats: {
        justifyContent: 'center',
        width: '20%',
    },
    rightStats: {
        width: '80%',
        padding: 10,
        borderLeftWidth: 1,
    },
    pfp: {
        width: 32,
        aspectRatio: 1,
        borderRadius: 32,
    },
})