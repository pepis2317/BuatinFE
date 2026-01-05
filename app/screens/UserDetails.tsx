import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { View, Image, StyleSheet, Text, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { UserResponse } from "../../types/UserResponse";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import UserReviewsList from "../../components/UserReviewsList";
import { useTheme } from "../context/ThemeContext";
import TopBar from "../../components/TopBar";
import { UserStats } from "../../types/Stats";
import { Star } from "lucide-react-native";
import Colors from "../../constants/Colors";
import { ReviewResponse } from "../../types/ReviewResponse";
import { ReviewComponentShort } from "../../components/ReviewComponent";
import { useAuth } from "../context/AuthContext";

type UserDetailsProps = NativeStackScreenProps<RootStackParamList, "UserDetails">

export default function UserDetails({ navigation, route }: UserDetailsProps) {
    const { userId } = route.params
    const { onGetUserToken } = useAuth()
    const { textColor, foregroundColor, subtleBorderColor, borderColor } = useTheme()
    const [refreshing, setRefreshing] = useState(false);
    const [user, setUser] = useState<UserResponse>()
    const [stats, setStats] = useState<UserStats>()
    const [topreviews, setTopReviews] = useState<ReviewResponse[]>([])
    const [loading, setLoading] = useState(false)

    const fetchUser = async () => {
        try {
            const result = await axios.get(`${API_URL}/get-user/${userId}`)
            return result.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" }
        }
    }

    const getStats = async (userId: string) => {
        try {
            const response = await axios.get(`${API_URL}/get-user-stats`, {
                params: {
                    userId: userId
                }
            });
            return response.data;
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }

    const getTopReviews = async () => {
        try {
            const token = await onGetUserToken!()
            var url = `${API_URL}/get-user-reviews?pageSize=5&pageNumber=1&userId=${userId}`
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

    const handleGetReviews = async () => {
        const result = await getTopReviews()
        if (!result.error) {
            setTopReviews(result.reviews)
        }
    }

    const handleFetch = async () => {
        setLoading(true)
        const result = await fetchUser()
        if (!result.error) {
            setUser(result)
            const stats = await getStats(result.userId)
            if (!result.error) {
                setStats(stats)
            }
        }
        setLoading(false)
    }

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        setUser(undefined)
        setStats(undefined)
        setTopReviews([])
        reset()
        setRefreshing(false);
    }, []);

    const reset = () => {
        handleFetch()
        handleGetReviews()
    }

    useEffect(() => {
        reset()
    }, [])

    return (
        <View style={{ flex: 1}}>

            <TopBar title={"Profile"} showBackButton={true} />
            
            <ScrollView style={{ flex: 1, padding: 16 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }>

                {user ?
                    <View style={{ alignItems: 'center', marginBottom: 16, gap: 8 }}>
                        <Image style={[styles.pfp, { backgroundColor: subtleBorderColor, borderColor: borderColor }]} src={user.pfp} />
                        <Text style={[styles.usernameText, { color: textColor }]}>{user.userName}</Text>
                    </View>
                    :
                    <></>
                }

                {/* Left & Right Stats */}
                {stats ?
                    <View style={[styles.stats, { backgroundColor: foregroundColor }]}>

                        {/* Rating */}
                        <View style={styles.leftStats}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Text style={[{ color: textColor }, styles.rating]}>{stats.rating.toPrecision(2)}</Text>
                                <Star color="gold" fill="gold" />
                            </View>
                            <Text style={{ color: textColor, fontSize: 12 }}>Avg. Rating</Text>
                        </View>

                        {/* Reviews */}
                        <View style={[styles.rightStats, { borderLeftColor: textColor }]}>
                            <Text style={{ color: textColor, fontStyle: 'italic', fontSize: 12 }}>{stats.reviews} {stats.reviews == 1 ? "Review" : "Reviews"}</Text>
                        </View>
                    </View>
                    : <ActivityIndicator size="large" style={{ height: 64, margin: 10, borderRadius: 8 }} color={textColor} />
                }

                {user ?
                    <View style={{ gap: 12 }}>

                        {/* Review */}
                        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                            <Text style={{ color: textColor, fontWeight: 'bold' }}>Latest Reviews</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('UserReviews', { userId: user.userId })}>
                                <Text style={{ color: textColor, fontWeight: 'bold', textDecorationLine: 'underline' }} >View All</Text>
                            </TouchableOpacity>
                        </View>

                        {topreviews ?
                            topreviews.length > 0 ?
                                <View style={{ height: 180 }}>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        {topreviews.map((review, index) => (
                                            <ReviewComponentShort key={index} review={review} navigation={navigation} isEnd={index == topreviews.length} />
                                        ))}
                                    </ScrollView>
                                </View>
                                :
                                <View style={{ backgroundColor: foregroundColor, padding: 16, borderRadius: 10 }}>
                                    <Text style={{ color: textColor }}>No Reviews Yet</Text>
                                </View>
                            : <ActivityIndicator size="large" style={{ height: 64, margin: 10, borderRadius: 10 }} color={textColor} />
                        }
                    </View>

                    : <ActivityIndicator size="large" style={{ height: 64, margin: 10, borderRadius: 5 }} color={textColor} />
                }

            </ScrollView>

        </View>
    )
}
const styles = StyleSheet.create({
    stats: {
        padding: 16,
        borderRadius: 10,
        flexDirection: 'row',
        marginBottom: 10,
    },
    rating: {
        fontSize: 24,
        fontWeight: 'bold'
    },
    leftStats: {
        justifyContent: 'center',
        width: '30%',
        paddingRight: 16
    },
    rightStats: {
        width: '70%',
        paddingLeft: 16,
        justifyContent: 'center',
        borderLeftWidth: 1,
    },
    usernameText: {
        fontSize: 24,
        fontWeight: 'bold'
    },
    pfp: {
        width: 70,
        borderRadius: 70,
        aspectRatio: 1,
        borderWidth: 1
    }
})