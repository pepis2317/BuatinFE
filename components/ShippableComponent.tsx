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
export default function ShippableComponent({ process, navigation}: { process: ProcessResponse, navigation: any }) {
    const { theme } = useTheme()
    var textColor = theme == "dark" ? "white" : "black"
    var placeholderColor = theme == "dark" ? Colors.darkGray : Colors.offWhite
    return (
        <TouchableOpacity style={[styles.container]} onPress={() => navigation.navigate('CreateShipment', { processId: process.processId })}>
            <View style={styles.left}>
                <Image style={[styles.pfp, { backgroundColor: placeholderColor }]} src={process.picture} />
                <View style={styles.leftContent}>
                    <Text style={{ color: textColor, fontWeight: "bold" }}>
                        {process.title}
                    </Text>
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