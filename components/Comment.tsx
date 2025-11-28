import axios from "axios";
import { API_URL } from "../constants/ApiUri";
import { CommentResponse } from "../types/CommentResponse";
import { View, Image, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useTheme } from "../app/context/ThemeContext";
import { EllipsisVertical, Heart, Pencil } from "lucide-react-native";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import Colors from "../constants/Colors";
import { useAuth } from "../app/context/AuthContext";
import Popover, { Rect } from "react-native-popover-view";
import PfpComponent from "./PfpComponent";
type Anchor = {
    x: number, y: number
}
export default function Comment({ comment, navigation }: { comment: CommentResponse, navigation: any }) {
    const { onGetUserToken, user } = useAuth()
    const [likes, setLikes] = useState(comment.likes)
    const [liked, setLiked] = useState(comment.liked)
    const { textColor } = useTheme()
    var likePost = async () => {
        try {
            const token = await onGetUserToken!()
            const res = await axios.post(`${API_URL}/like-content`, {
                contentId: comment.commentId
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
                    contentId: comment.commentId
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
    return (
        <View>
            <View style={[styles.container, { padding: 10, paddingHorizontal: 15, }]}>
                <View style={styles.left}>
                    <PfpComponent width={40} pfp={comment.authorPfp} userId={comment.authorId} navigation={navigation} />
                    <View style={styles.leftContent}>
                        <View style={styles.nameRow}>
                            <TouchableOpacity onPress={()=>navigation.navigate('UserDetails',{userId:comment.authorId})}>
                                <Text style={{ color: textColor, fontWeight: "bold" }}>
                                    {comment.authorName}
                                </Text>
                            </TouchableOpacity>

                            <Text style={{ color: "gray", fontSize: 12 }}>{comment.updatedAt ? "(Edited) " + new Date(comment.updatedAt).toDateString() : new Date(comment.createdAt).toDateString()}</Text>
                        </View>
                        <Text style={[styles.comment, { color: textColor }]}>{comment.comment}</Text>
                    </View>
                </View>

                <View style={styles.right}>
                    <View style={{ alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => likeHandler()}>
                            {liked ? <Heart color={Colors.red} fill={Colors.red} size={20} /> : <Heart color={textColor} size={20} />}
                        </TouchableOpacity>
                        <Text style={{ color: textColor }}>{likes}</Text>
                    </View>
                    {comment.authorId == user?.userId ?
                        <TouchableOpacity onPress={() => navigation.navigate("EditComment", { comment: comment })}>
                            <Pencil size={20} color={textColor} />
                        </TouchableOpacity>
                        : <></>}
                </View>
            </View>
        </View>

    )
}
const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "flex-start",
        width: "100%",
    },
    left: {
        flex: 1,
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
    },
    leftContent: {
        flex: 1,
        minWidth: 0,
    },
    nameRow: {
        flexDirection: "row",
        gap: 5,
        flexWrap: "wrap",
        alignItems: 'center'
    },
    comment: {
        flexShrink: 1,
        flexWrap: "wrap",
    },
    right: {
        flexDirection: 'row',
        marginLeft: 12,
        gap: 5
    },
    pfp: {
        width: 50,
        aspectRatio: 1,
        borderRadius: 50,
    },
});