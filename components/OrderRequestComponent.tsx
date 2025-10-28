import axios from "axios";
import { API_URL } from "../constants/ApiUri";
import { CommentResponse } from "../types/CommentResponse";
import { View, Image, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { useTheme } from "../app/context/ThemeContext";
import { Heart } from "lucide-react-native";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import Colors from "../constants/Colors";
import { OrderRequestResponse } from "../types/OrderRequestResponse";
export default function OrderRequestComponent({ request, navigation, respondable }: { request: OrderRequestResponse, navigation: any, respondable: boolean }) {
    const { theme } = useTheme()
    const [statusColor, setStatusColor] = useState(Colors.darkBorder)
    var textColor = theme == "dark" ? "white" : "black"
    var placeholderColor = theme == "dark" ? Colors.darkGray : Colors.offWhite
    dayjs.extend(relativeTime)
    useEffect(() => {
        if (request.status== "Accepted") {
            setStatusColor(Colors.green)
        } else if (request.status == "Declined") {
            setStatusColor(Colors.peach)
        }
    }, [])
    return (
        <TouchableOpacity style={[styles.container]} onPress={() => navigation.navigate('OrderRequestDetails', { orderRequest: request, respondable: respondable })}>
            <View style={styles.left}>
                <Image style={[styles.pfp, { backgroundColor: placeholderColor }]} src={request.pictureUrl} />
                <View style={styles.leftContent}>
                    <View style={styles.nameRow}>
                        <Text style={{ color: textColor, fontWeight: "bold" }}>
                            {request.name}{" "}
                        </Text>
                    </View>
                    <Text style={[styles.comment, { color: textColor }]}>{request.title}</Text>
                    <Text style={[styles.comment, { color: textColor }]}>{request.status}</Text>
                </View>
            </View>
            <View style={[styles.right,{backgroundColor:statusColor}]} />
        </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        borderBottomWidth: 1,
        borderBottomColor: Colors.darkGray
    },
    left: {
        flex: 1,
        padding: 20,
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
    },
    pfp: {
        width: 50,
        aspectRatio: 1,
        borderRadius: 50,
    },
});