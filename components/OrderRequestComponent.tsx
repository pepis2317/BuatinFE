import axios from "axios";
import { API_URL } from "../constants/ApiUri";
import { CommentResponse } from "../types/CommentResponse";
import { View, Image, StyleSheet, Text, TouchableOpacity, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { useTheme } from "../app/context/ThemeContext";
import { Heart } from "lucide-react-native";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import Colors from "../constants/Colors";
import { OrderRequestResponse } from "../types/OrderRequestResponse";
import PfpComponent, { SellerPic } from "./PfpComponent";
export default function OrderRequestComponent({ request, navigation, respondable, isSeller }: { request: OrderRequestResponse, navigation: any, respondable: boolean, isSeller: boolean }) {
    const { textColor, subtleBorderColor } = useTheme()
    const [statusColor, setStatusColor] = useState(Colors.darkBorder)
    useEffect(() => {
        if (request.status == "Accepted") {
            setStatusColor(Colors.green)
        } else if (request.status == "Declined") {
            setStatusColor(Colors.peach)
        }
    }, [])
    return (
        <Pressable style={[styles.container, { borderColor: subtleBorderColor }]} onPress={() => {
            navigation.navigate('OrderRequestDetails', { orderRequest: request, respondable: respondable })
        }}>
            <View style={styles.left}>
                {isSeller ?
                    <PfpComponent width={50} pfp={request.buyerPictureUrl} userId={request.buyerUserId} navigation={navigation} /> :
                    <SellerPic width={50} pfp={request.sellerPictureUrl} sellerId={request.sellerId} navigation={navigation} />
                }

                <View style={styles.leftContent}>
                    <View style={styles.nameRow}>
                        <Text style={{ color: textColor, fontWeight: "bold" }}>
                            {request.title}
                        </Text>
                    </View>
                    {isSeller ?
                        <Text style={[styles.comment, { color: 'gray', fontSize: 12 }]}>Request by {request.buyerName}</Text> :
                        <Text style={[styles.comment, { color: 'gray', fontSize: 12 }]}>Request for {request.sellerName}</Text>
                    }
                    <Text style={[styles.comment, { color: statusColor, fontSize: 12 }]}>{request.status}</Text>
                </View>
            </View>
        </Pressable>
    )
}
const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        borderBottomWidth: 1
    },
    left: {
        flex: 1,
        padding: 15,
        flexDirection: "row",
        alignItems: "center",
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
        width: 5,
        alignSelf: "stretch"
    }
});