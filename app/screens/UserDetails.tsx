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
        <View style={{ flex: 1 }}>

            <TopBar title={"Profile"} showBackButton={true} />
            
            <ScrollView style={{ flex: 1 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }>
                {user ?
                    <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 10 }}>
                        <Image style={[styles.pfp, { backgroundColor: subtleBorderColor, borderColor: borderColor }]} src={user.pfp} />
                        <Text style={[styles.usernameText, { color: textColor }]}>{user.userName}</Text>
                    </View>
                    :
                    <></>
                }
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
                            <Text style={{ color: textColor, fontWeight: 'bold' }}>{stats.reviews} {stats.reviews == 1 ? "Review" : "Reviews"}</Text>
                        </View>
                    </View>
                    : <ActivityIndicator size="large" style={{ height: 64, margin: 10, borderRadius: 5 }} color={textColor} />
                }
                {user ?
                    <View style={{ height: 200 }}>
                        <View style={{ marginHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                            <Text style={{ color: textColor, fontWeight: 'bold' }}>Latest Reviews</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('UserReviews', { userId: user.userId })}>
                                <Text style={{ color: textColor, fontWeight: 'bold', textDecorationLine: 'underline' }} >View All Reviews</Text>
                            </TouchableOpacity>
                        </View>
                        {topreviews ?
                            topreviews.length > 0 ?
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <View style={{ width: 20 }} />
                                    {topreviews.map((review, index) => (
                                        <ReviewComponentShort key={index} review={review} navigation={navigation} isEnd={index == topreviews.length} />
                                    ))}
                                    <View style={{ width: 20 }} />
                                </ScrollView> :
                                <View style={{ backgroundColor: foregroundColor, marginHorizontal: 20, padding: 10, borderRadius: 10 }}>
                                    <Text style={{ color: textColor }}>No Reviews Yet</Text>
                                </View>
                            : <ActivityIndicator size="large" style={{ height: 64, margin: 10, borderRadius: 5 }} color={textColor} />
                        }
                    </View>

                    : <ActivityIndicator size="large" style={{ height: 64, margin: 10, borderRadius: 5 }} color={textColor} />
                }

            </ScrollView>

        </View>
    )
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
    usernameText: {
        fontSize: 21,
        fontWeight: 'bold'
    },
    pfp: {
        width: 70,
        borderRadius: 70,
        aspectRatio: 1,
        borderWidth: 1
    }
})