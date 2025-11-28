import { TouchableOpacity, View, Image, Text, StyleSheet, Pressable } from "react-native";
import { ConversationResponse } from "../types/ConversationResponse";
import { useTheme } from "../app/context/ThemeContext";
import { useState } from "react";
import Colors from "../constants/Colors";
import PfpComponent from "./PfpComponent";

export default function ConversationComponent({ navigation, conversation }: { navigation: any, conversation: ConversationResponse }) {
    const { textColor, subtleBorderColor} = useTheme()
    return (
        <Pressable style={[styles.container,{borderColor:subtleBorderColor}]} onPress={() => navigation.navigate('Chat', { conversationId: conversation.conversationId })}>
            <View style={styles.left}>
                <PfpComponent width={50} pfp={conversation.picture} userId={""} navigation={undefined}/>
                <View style={styles.leftContent}>
                    <Text style={{ color: textColor, fontWeight: "bold" }}>
                        {conversation.name} {conversation.sellerName?`(Owner of ${conversation.sellerName})`:""}
                    </Text>
                    <Text numberOfLines={1} style={{ color: 'gray' }}>
                        {conversation.latestMessage}
                    </Text>
                </View>
            </View>
        </Pressable>
    )
}
const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "flex-start",
        width: "100%",
        borderBottomWidth: 1,
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