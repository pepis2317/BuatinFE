import { View, Text, StyleSheet, Image, TouchableOpacity, Touchable } from "react-native";
import { ReviewResponse } from "../types/ReviewResponse";
import { useTheme } from "../app/context/ThemeContext";
import Colors from "../constants/Colors";
import { EllipsisVertical, Heart, MessageCircle, Pencil, PencilIcon, PencilLine, Star } from "lucide-react-native";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../constants/ApiUri";
import { useAuth } from "../app/context/AuthContext";
import PfpComponent from "./PfpComponent";
import colors from "../constants/Colors";

const formatEditedDate = (date: string | number | Date) => {
    const d = new Date(date);

    const weekday = new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
    }).format(d);

    const day = new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
    }).format(d);

    const month = new Intl.DateTimeFormat("en-GB", {
        month: "short",
    }).format(d);

    const year = new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
    }).format(d);

    return `${weekday}, ${day} ${month} ${year}`;
};

export default function ReviewComponent({ review, navigation, isSeller }: { review: ReviewResponse, navigation: any, isSeller: boolean }) {
    const { foregroundColor , textColor } = useTheme()
    const { onGetUserToken, user } = useAuth()
    const [likes, setLikes] = useState(review.likes)
    const [liked, setLiked] = useState(review.liked)

    var likePost = async () => {
        try {
            const token = await onGetUserToken!()
            const res = await axios.post(`${API_URL}/like-content`, {
                contentId: review.reviewId
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            return res.data
        } catch (e: any) {
            return { error: true, msg: e?.response?.data?.detail || "An error occurred" };
        }
    }

    var unlikePost = async () => {
        try {
            const token = await onGetUserToken!()
            const res = await axios.delete(`${API_URL}/unlike-content`, {
                data: {
                    contentId: review.reviewId
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            return res.data
        } catch (e: any) {
            return { error: true, msg: e?.response?.data?.detail || "An error occurred" };
        }
    }

    var likeHandler = async () => {
        if (!liked) {
            var res = await likePost()
            if (!res.error) {
                setLiked(true)
                setLikes(likes + 1)
            }
        } else {
            var res = await unlikePost()
            if (!res.error) {
                setLiked(false)
                setLikes(likes - 1)
            }
        }
    }

    const handleNavigate = () => {
        if (isSeller) {
            navigation.navigate('EditReview', { review: review, isSeller: true })
        } else {
            navigation.navigate('EditReview', { review: review, isSeller: false })
        }
    }
    
    return (
        <View style={[styles.container, { backgroundColor: foregroundColor, marginBottom: 16 }]}>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                {/* Profile & Name */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <PfpComponent width={32} pfp={review.authorPfp} userId={review.authorId} navigation={navigation} />
                    <View>
                        <TouchableOpacity onPress={()=> navigation.navigate('UserDetails', {userId:review.authorId})}>
                            <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 16 }}>{review.authorName}</Text>
                        </TouchableOpacity>
                        <Text style={{ color: colors.darkBorder, fontSize: 12 }}>
                        {review.updatedAt
                            ? `Edited ${formatEditedDate(review.updatedAt)}`
                            : formatEditedDate(review.createdAt)}
                        </Text>
                    </View>
                </View>
                {review.authorId == user?.userId ?
                    <TouchableOpacity onPress={() => handleNavigate()}>
                        <Pencil size={20} color={textColor} />
                    </TouchableOpacity> : <></>}
            </View>

            {/* Rating */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4}}>
                <Text style={{ color: textColor, fontWeight: 'bold' }}>{review.rating}</Text>
                <Star fill={'gold'} color={'gold'} size={16} />
            </View>
            
            {/* Review */}
            <Text style={{ color: textColor }}>{review.review}</Text>

            {/* Like & Comment */}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                {liked ?
                    <TouchableOpacity style={styles.reaction} onPress={() => likeHandler()}>
                        <Heart color={Colors.red} fill={Colors.red} />
                        <Text style={{ color: textColor }}>{likes}</Text>
                    </TouchableOpacity>
                    :
                    <TouchableOpacity style={styles.reaction} onPress={() => likeHandler()}>
                        <Heart color={textColor} />
                        <Text style={{ color: textColor }}>{likes}</Text>
                    </TouchableOpacity>
                }
                <TouchableOpacity style={styles.reaction} onPress={() => navigation.navigate('Comments', { postId: review.reviewId })}>
                    <MessageCircle color={textColor} />
                    <Text style={{ color: textColor }}>{review.comments}</Text>
                </TouchableOpacity>

            </View>
        </View>
    )
}

export function ReviewComponentShort({ review, navigation, isEnd }: { review: ReviewResponse, navigation: any, isEnd: boolean }) {
    const { foregroundColor, textColor} = useTheme()

    return (
        <View style={[styles.container, {maxWidth: 240, marginRight: isEnd ? 0 : 16, backgroundColor: foregroundColor, borderRadius: 10}]}>
            
            {/* Profile, Name, Last Edited */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <PfpComponent width={32} pfp={review.authorPfp} userId={""} navigation={navigation} />
                <View>
                    <TouchableOpacity onPress={() => navigation.navigate('UserDetails', { userId: review.authorId })}>
                        <Text style={{ color: textColor, fontWeight: 'bold' }}>{review.authorName}</Text>
                    </TouchableOpacity>
                    <Text style={{ color: colors.darkBorder, fontSize: 12 }}>
                        {review.updatedAt
                            ? `Edited ${formatEditedDate(review.updatedAt)}`
                            : formatEditedDate(review.createdAt)}
                        </Text>
                </View>
            </View>

            {/* Rating */}
            <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                <Text style={{ color: textColor, fontWeight: 'bold', marginRight: 4}}>{review.rating}</Text>
                <Star fill={'gold'} color={'gold'} size={16} />
            </View>

            {/* Review */}
            <View style={{ flex: 1, justifyContent: 'space-between'}}>
                <Text numberOfLines={3}
                    ellipsizeMode="tail"
                    style={{ color: textColor, }}>{review.review}</Text>
                <Text style={{ color: Colors.darkGray, fontSize: 12 }}>{review.likes} {review.likes != 1 ? "likes" : "like"}    {review.comments} {review.comments != 1 ? "Comments" : "Comment"}</Text>
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    reaction: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center'
    },

    container: {
        padding: 16,
        borderRadius: 10,
    },

    pfp: {
        width: 32,
        aspectRatio: 1,
        borderRadius: 32,
    },
})