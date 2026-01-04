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
import { useFocusEffect } from "@react-navigation/native";

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
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
            
            {/* Banner & Picture */}
            <SellerDetailComponent seller={seller} navigation={navigation} editing={false} />

            <View style={{ paddingHorizontal: 16, gap: 12}}>

                {/* Left & Right Stats */}
                {stats ?
                    <View style={[styles.stats, { backgroundColor: foregroundColor, borderRadius: 10 }]}>

                        {/* Rating */}
                        <View style={styles.leftStats}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Text style={[{ color: textColor }, styles.rating]}>{stats.rating.toPrecision(2)}</Text>
                                <Star color="gold" fill="gold" />
                            </View>
                            <Text style={{ color: textColor, fontSize: 12 }}>Avg. Rating</Text>
                        </View>

                        {/* Clients, Reviews, Completion Rate */}
                        <View style={[styles.rightStats, { borderLeftColor: Colors.darkerOffWhite }]}>
                            <Text style={{
                                color: textColor, fontStyle: 'italic', fontSize: 12
                            }}>{stats.clients} {stats.clients == 1 ? "Client" : "Clients"}</Text>
                            <Text style={{
                                color: textColor, fontStyle: 'italic', fontSize: 12
                            }}>{stats.reviews} {stats.reviews == 1 ? "Review" : "Reviews"}</Text>
                            <Text style={{
                                color: textColor, fontStyle: 'italic', fontSize: 12
                            }}>{(stats.completionRate * 100).toFixed(1)}% Completion Rate</Text>
                        </View>
                        
                    </View>
                    : <ActivityIndicator size="large" style={{ height: 64, margin: 10, borderRadius: 10 }} color={textColor} />
                }

                {/* Review */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Text style={{ color: textColor, fontWeight: 'bold' }}>Latest Reviews</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SellerReviews', { sellerId: seller.sellerId })}>
                        <Text style={{ color: textColor, textDecorationLine: 'underline' }} >View All</Text>
                    </TouchableOpacity>
                </View>

                {topreviews ?
                    topreviews.length > 0?
                    <View style={{ height: 180 }}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {topreviews.map((review, index) => (
                                <ReviewComponentShort key={index} review={review} navigation={navigation} isEnd={index == topreviews.length} />
                            ))}
                        </ScrollView>
                    </View>

                    :<View style={{backgroundColor: foregroundColor, padding:16, borderRadius: 10 }}>
                        <Text style={{color:textColor}}>No Reviews Yet</Text>
                    </View>
                    : <ActivityIndicator size="small" style={{ height: 64, margin: 10, borderRadius: 8 }} color={textColor} />
                }
            </View>

            <View style={{ padding: 16}}>
                {editable ?
                    <View style={{gap:10}}>
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
                                <Text style={{ textAlign: 'center', color: textColor, fontWeight: 'bold' }}>Currently unable to make order request</Text>}

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
        reset()
    }, [handleFetch]);

    const reset = async ()=>{
        setRefresh(true);
        setPosts([]);
        await handleFetch(null, null);
    }

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

    useFocusEffect(
        useCallback(() => {
            reset()
        }, [])
    );

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

    const refreshSeller = useCallback(() => {
        if (!sellerId) {
            handleGetSellerByUserId()
        } else {
            handleGetSellerBySellerId()
        }
    }, [sellerId, user?.userId])

    useEffect(() => {
        if (!sellerId) {
            setEditable(true)
        }
        refreshSeller()
    }, [sellerId])

    useFocusEffect(
        useCallback(() => {
            refreshSeller()
        }, [refreshSeller])
    )

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
                            indicatorStyle={{ backgroundColor: Colors.primary }}
                            style={{ backgroundColor: backgroundColor }}
                        />
                    )}
                />
                : <ActivityIndicator size="large" style={{ height: 64, margin: 10, borderRadius: 6 }} color={textColor} />}
        </View>
    );
}

const styles = StyleSheet.create({
    stats: {
        padding: 16,
        flexDirection: 'row',

    },
    rating: {
        fontSize: 24,
        fontWeight: 'bold'
    },
    leftStats: {
        justifyContent: 'center',
        width: '30%',
        paddingRight: 16,
    },
    rightStats: {
        width: '70%',
        paddingHorizontal: 16,
        borderLeftWidth: 1,
    },

    pfp: {
        width: 32,
        aspectRatio: 1,
        borderRadius: 32,
    },
})