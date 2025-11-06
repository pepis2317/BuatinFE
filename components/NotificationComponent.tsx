import { View, StyleSheet, Text } from "react-native";
import { NotificationResponse } from "../types/NotificationResponse";
import { useTheme } from "../app/context/ThemeContext";
import Colors from "../constants/Colors";

export default function NotificationComponent({ notification }: { notification: NotificationResponse }) {
    const { theme } = useTheme()
    var textColor = theme == "dark" ? "white" : "black"
    return (
        <View>
            <View style={styles.left}>
                <View style={styles.leftContent}>
                    <Text style={{ color: textColor, fontWeight: "bold" }}>
                        {notification.message}
                    </Text>
                    {notification.seenAt != null ? <Text style={styles.comment}>{notification.seenAt}</Text> : <></>}
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