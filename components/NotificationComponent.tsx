import { View, StyleSheet, Text } from "react-native";
import { NotificationResponse } from "../types/NotificationResponse";
import { useTheme } from "../app/context/ThemeContext";
import Colors from "../constants/Colors";

export default function NotificationComponent({ notification }: { notification: NotificationResponse }) {
    const { textColor, subtleBorderColor } = useTheme()
    return (
        <View>
            <View style={[styles.left,{borderBottomColor:subtleBorderColor}]}>
                <View style={styles.leftContent}>
                    <Text style={{ color: textColor, fontWeight: "bold" }}>
                        {notification.message}
                    </Text>
                    {notification.seenAt != null ? <Text style={[styles.comment, {color:textColor}]}>{new Date(notification.createdAt).toLocaleDateString()}</Text> : <></>}
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
        borderBottomWidth: 1
    },
    left: {
        padding: 15,
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderBottomWidth:1
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