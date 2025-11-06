import { TouchableOpacity, View, Image, Text, StyleSheet } from "react-native";
import { ConversationResponse } from "../types/ConversationResponse";
import { useTheme } from "../app/context/ThemeContext";
import { useState } from "react";
import Colors from "../constants/Colors";

export default function ConversationComponent({ navigation, conversation }: { navigation: any, conversation: ConversationResponse }) {
    const { theme } = useTheme()
    const [statusColor, setStatusColor] = useState(Colors.darkBorder)
    var textColor = theme == "dark" ? "white" : "black"
    var placeholderColor = theme == "dark" ? Colors.darkGray : Colors.offWhite
    return (
        <TouchableOpacity style={[styles.container]} onPress={() => navigation.navigate('Chat', { conversationId: conversation.conversationId })}>
            <View style={styles.left}>
                <Image style={[styles.pfp, { backgroundColor: placeholderColor }]} src={conversation.picture} />
                <View style={styles.leftContent}>
                    <Text style={{ color: textColor, fontWeight: "bold" }}>
                        {conversation.name}
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