import { View, StyleSheet, Text, Pressable } from "react-native";
import { useTheme } from "../app/context/ThemeContext";
import { ProcessResponse } from "../types/ProcesssResponse";
import PfpComponent from "./PfpComponent";
export default function ShippableComponent({ process, navigation}: { process: ProcessResponse, navigation: any}) {
    const { textColor, subtleBorderColor } = useTheme()
    return (
        <Pressable style={[styles.container, { borderColor: subtleBorderColor }]} onPress={() => {
            navigation.navigate('CreateShipment', { processId: process.processId })
        }}>
            <View style={styles.left}>
                <PfpComponent width={50} pfp={process.user.pfp} userId={""} navigation={navigation} />
                <View style={styles.leftContent}>
                    <Text style={{ color: textColor, fontWeight: "bold" }}>
                        {process.title}
                    </Text>
                    <Text style={{ color: 'gray', fontSize: 12 }}>
                        {`Create Shipping Order for ${process.user.userName}'s Product`}
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
        borderBottomWidth: 1
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