import axios from "axios";
import { API_URL } from "../constants/ApiUri";
import { CommentResponse } from "../types/CommentResponse";
import { View, Image, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useTheme } from "../app/context/ThemeContext";
import { Heart } from "lucide-react-native";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import Colors from "../constants/Colors";
function Reply({ comment }: { comment: CommentResponse }) {
    const [likes, setLikes] = useState(0)
    const { theme } = useTheme()
    var textColor = theme == "dark" ? "white" : "black"
    var placeholderColor = theme == "dark" ? Colors.darkGray : Colors.offWhite
    return (
        <View style={[styles.container, { paddingTop: 10, paddingRight: 15, }]}>
            <View style={styles.left}>
                <Image style={[styles.pfp, { backgroundColor: placeholderColor }]} />
                <View style={styles.leftContent}>
                    <View style={styles.nameRow}>
                        <Text style={{ color: textColor, fontWeight: "bold" }}>
                            {comment.authorName}{" "}
                        </Text>
                        <Text style={{ color: "gray" }}>1 day ago</Text>
                    </View>

                    <Text style={[styles.comment, { color: textColor }]}>{comment.comment}</Text>
                </View>
            </View>

            <View style={styles.right}>
                <TouchableOpacity>
                    <Heart size={20} color={textColor} />
                </TouchableOpacity>
                <Text style={{ color: textColor }}>{likes}</Text>
            </View>
        </View>
    )
}
export default function Comment({ comment }: { comment: CommentResponse }) {
    const [replies, setReplies] = useState<CommentResponse[]>([])
    const [showReply, setShowReply] = useState(false)
    const [likes, setLikes] = useState(0)
    const { theme } = useTheme()
    var textColor = theme == "dark" ? "white" : "black"
    var placeholderColor = theme == "dark" ? Colors.darkGray : Colors.offWhite
    dayjs.extend(relativeTime)
    var fetchLikes = async () => {
        try {
            const res = await axios.get(`${API_URL}/get-likes`, {
                params: {
                    authorId: comment.authorId,
                    contentId: comment.commentId,
                },
            });
            return res.data
        } catch (e: any) {
            return { error: true, msg: e?.response?.data?.detail || "An error occurred" };
        }
    }
    var fetchReplies = async () => {
        try {
            const res = await axios.get(`${API_URL}/get-likes`, {
                params: {
                    authorId: comment.authorId,
                    contentId: comment.commentId,
                },
            });
            return res.data
        } catch (e: any) {
            return { error: true, msg: e?.response?.data?.detail || "An error occurred" };
        }
    }
    const handleViewReplies = async () => {

    }

    return (
        <View>
            <View style={[styles.container, { padding: 10, paddingHorizontal: 15, }]}>
                <View style={styles.left}>
                    <Image style={[styles.pfp, { backgroundColor: placeholderColor }]} />
                    <View style={styles.leftContent}>
                        <View style={styles.nameRow}>
                            <Text style={{ color: textColor, fontWeight: "bold" }}>
                                {comment.authorName}{" "}
                            </Text>
                            <Text style={{ color: "gray" }}>1 day ago</Text>
                        </View>

                        <Text style={[styles.comment, { color: textColor }]}>{comment.comment}</Text>

                        <TouchableOpacity>
                            <Text style={{ color: "gray" }}>Reply</Text>
                        </TouchableOpacity>

                    </View>

                </View>

                <View style={styles.right}>
                    <TouchableOpacity>
                        <Heart size={20} color={textColor} />
                    </TouchableOpacity>
                    <Text style={{ color: textColor }}>{likes}</Text>
                </View>
            </View>
            <View style={{ marginLeft: 75 }}>
                {comment.replies > 0 ?
                    <TouchableOpacity onPress={() => setShowReply(!showReply)}>
                        <Text style={{ color: "gray" }}>{!showReply ? "View" : "Hide"} {comment.replies} Replies</Text>
                    </TouchableOpacity>
                    : <></>}
                {showReply ?
                    <Reply comment={comment} />
                    : <></>}
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
    },
    comment: {
        flexShrink: 1,
        flexWrap: "wrap",
    },
    right: {
        alignItems: "center",
        alignSelf: "flex-start",
        marginLeft: 12,
    },
    pfp: {
        width: 50,
        aspectRatio: 1,
        borderRadius: 50,
    },
});