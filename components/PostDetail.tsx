import axios from "axios";
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, Touchable, Button } from "react-native";
import { API_URL } from "../constants/ApiUri";
import React, { use, useEffect, useMemo, useRef, useState } from "react";
import { PostResponse } from "../types/PostResponse";
import PagerView from "react-native-pager-view";
import { Heart, MessageCircle } from "lucide-react-native";
import { useTheme } from "../app/context/ThemeContext";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { SellerResponse } from "../types/SellerResponse";
import { useAuth } from "../app/context/AuthContext";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
} from "react-native-reanimated";
import Colors from "../constants/Colors";

export default function PostDetail({ post, seller, onCommentPressed }: { post: PostResponse, seller: SellerResponse, onCommentPressed: () => void }) {
    const { onGetUserToken, user } = useAuth()
    const { theme } = useTheme()
    const [images, setImages] = useState<string[]>([])
    const [slideIndex, setSlideIndex] = useState(0)
    const [likes, setLikes] = useState(0)
    const [comments, setComments] = useState(0)
    const [expanded, setExpanded] = useState(false);
    const [likeId, setLikeId] = useState("")
    const textColor = theme === "dark" ? "white" : "black";
    const backgroundColor = theme == "dark" ? Colors.darkGray : Colors.offWhite;
    const heartOpacity = useSharedValue(0);
    const heartScale = useSharedValue(0.5);
    dayjs.extend(relativeTime)
    var fetchImages = async () => {
        try {
            const res = await axios.get(`${API_URL}/get-images?ContentId=${post.postId}`)
            return res.data
        } catch (e: any) {
            return { error: true, msg: e?.response?.data?.detail || "An error occurred" };
        }
    }
    var likePost = async () => {
        try {
            const token = await onGetUserToken!()
            const res = await axios.post(`${API_URL}/like-content`, {
                contentId: post.postId
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
            const res = await axios.delete(`${API_URL}/unlike-content`, {
                data: {
                    likeId: likeId
                }
            })
            return res.data
        } catch (e: any) {
            return { error: true, msg: e?.response?.data?.detail || "An error occurred" };
        }
    }
    var likeHandler = async () => {
        if (likeId == "") {
            triggerAnimation()
            var res = await likePost()
            if (!res.error) {
                setLikeId(res.likeId)
                setLikes(likes + 1)
            }
        } else {
            var res = await unlikePost()
            if (!res.error) {
                setLikeId("")
                setLikes(likes - 1)
            }else{
                console.log(res.msg)
            }
        }
    }
    var fetchLikes = async () => {
        try {
            const res = await axios.get(`${API_URL}/get-likes`, {
                params: {
                    authorId: user?.userId,
                    contentId: post.postId,
                },
            });
            return res.data
        } catch (e: any) {
            return { error: true, msg: e?.response?.data?.detail || "An error occurred" };
        }
    }
    useEffect(() => {
        const loadImages = async () => {
            var images = await fetchImages()
            if (!images.error) {
                setImages(images)
            }
        }
        const loadLikes = async () => {
            var likes = await fetchLikes()
            if (!likes.error) {
                if (likes.myLikeId) {
                    setLikeId(likes.myLikeId)
                }
                setLikes(likes.likes)
            }
        }
        loadImages()
        loadLikes()
    }, [])
    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: heartOpacity.value,
            transform: [{ scale: heartScale.value }],
        };
    });
    const triggerAnimation = () => {
        heartOpacity.value = withSequence(
            withTiming(1, { duration: 200 }),
            withTiming(0, { duration: 400 })
        );

        heartScale.value = withSequence(
            withTiming(1.3, { duration: 200 }),
            withTiming(1, { duration: 200 })
        );
    };
    return (
        <View style={styles.postContainer}>
            <TouchableOpacity style={styles.authorContainer} onPress={() => console.log("pressed")}>
                <Image style={[styles.authorImage, { backgroundColor: backgroundColor }]} src={seller.sellerPicture}></Image>
                <Text style={[styles.text, { color: textColor }]}>{seller.sellerName}</Text>
            </TouchableOpacity>
            <View style={styles.carouselContainer}>
                <PagerView style={[styles.carousel, { backgroundColor: backgroundColor }]} onPageSelected={(e) => setSlideIndex(e.nativeEvent.position)}>
                    {images.map((image, index) => (
                        <Image source={{ uri: image }} key={index} />
                    ))}
                </PagerView>
                {images.length > 1 ?
                    <View style={styles.counter}>
                        <Text style={{ color: "white" }}>{slideIndex + 1}/{images.length}</Text>
                    </View> : <></>}
                <Animated.View style={[animatedStyle, styles.heart]} pointerEvents={"none"}>
                    <Heart size={100} color="white" fill={"white"} />
                </Animated.View>
            </View>
            <View style={{ gap: 10, padding: 10 }}>
                <View style={styles.reactionContainer}>
                    <TouchableOpacity style={styles.reaction} onPress={() => likeHandler()}>
                        {likeId ? <Heart color={Colors.red} fill={Colors.red} size={26} /> : <Heart color={textColor} size={26} />}
                        <Text style={[styles.text, { color: textColor }]}>{likes}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.reaction} onPress={() => onCommentPressed()}>
                        <MessageCircle color={textColor} size={26} />
                        <Text style={[styles.text, { color: textColor }]}>{comments}</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                    <Text style={[{ fontWeight: "bold", color: textColor }]}>
                        {seller.sellerName}{" "}
                    </Text>
                    <Text
                        style={{ color: textColor, flexShrink: 1 }}
                        numberOfLines={expanded ? undefined : 2}
                    >
                        {post.caption}
                    </Text>
                    {post.caption.length > 50 && (
                        <TouchableOpacity onPress={() => setExpanded(!expanded)}>
                            <Text style={{ color: "gray" }}>
                                {expanded ? " Read less" : " Read more"}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
                <Text style={{ color: "gray" }}>{dayjs(post.createdAt).fromNow()}</Text>
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    heart: {
        position: "absolute",
        width: "100%",
        height: "100%",
        alignItems: 'center',
        justifyContent: 'center',
    },
    authorContainer: {
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    authorImage: {
        width: 32,
        height: 32,
        borderRadius: 50,
        overflow: 'hidden'
    },
    reactionContainer: {
        gap: 10,

        flexDirection: 'row',
        justifyContent: 'flex-start'
    },
    carouselContainer: {
        position: 'relative',
        backgroundColor: 'red'
    },
    counter: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "rgba(0,0,0,0.6)",
        borderRadius: 20,
        padding: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 4,
    },
    text: {
        fontWeight: 'bold',
    },
    reaction: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 5
    },
    carousel: {
        width: "100%",
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    postContainer: {
        width: '100%',
        minHeight: 600,          // 👈 fixed item height    // optional: clip anything that overflows
    },
});