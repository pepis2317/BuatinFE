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
import { ProcessResponse } from "../types/ProcesssResponse";
export default function ProcessComponent({ process, navigation, isSeller }: { process: ProcessResponse, navigation: any, isSeller: boolean }) {
    const { theme } = useTheme()
    const [statusColor, setStatusColor] = useState(Colors.darkGray)
    var textColor = theme == "dark" ? "white" : "black"
    var placeholderColor = theme == "dark" ? Colors.darkGray : Colors.offWhite
    dayjs.extend(relativeTime)
    const handlenNavigate = () => {
        if (isSeller == true) {
            navigation.navigate('SellerProcessDetails', { processId: process.processId })
        } else {
            navigation.navigate('ProcessDetails', { processId: process.processId })
        }
    }
    useEffect(() => {
        if (process.status == "Completed") {
            setStatusColor(Colors.green)
        } else if (process.status == "Cancelled") {
            setStatusColor(Colors.peach)
        }
    }, [])
    return (
        <TouchableOpacity style={[styles.container]} onPress={() => handlenNavigate()}>
            <View style={styles.left}>
                <Image style={[styles.pfp, { backgroundColor: placeholderColor }]} src={process.sellerImage} />
                <View style={styles.leftContent}>
                    <Text style={{ color: textColor, fontWeight: "bold" }}>
                        {process.title}
                    </Text>
                    <Text style={[styles.comment, { color: statusColor }]}>{process.status}</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "flex-start",
        width: "100%",
        borderBottomWidth: 1,
        borderBottomColor: Colors.darkGray,
    },
    left: {
        padding: 15,
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 10
    },
    leftContent: {
        flex: 1,
        minWidth: 0
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
    
    pfp: {
        width: 55,
        aspectRatio: 1,
        borderRadius: 50,
    },
});