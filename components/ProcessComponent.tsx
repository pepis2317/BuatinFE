import { View, Image, StyleSheet, Text, TouchableOpacity, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { useTheme } from "../app/context/ThemeContext";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import Colors from "../constants/Colors";
import { ProcessResponse } from "../types/ProcesssResponse";
import PfpComponent, { SellerPic } from "./PfpComponent";
export default function ProcessComponent({ process, navigation, isSeller}: { process: ProcessResponse, navigation: any, isSeller: boolean}) {
    const { textColor, subtleBorderColor } = useTheme()
    const [statusColor, setStatusColor] = useState(Colors.darkBorder)

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
        <Pressable style={[styles.container, { borderColor: subtleBorderColor }]} onPress={() => handlenNavigate()}>
            <View style={styles.left}>
                {isSeller ?
                    <PfpComponent width={50} pfp={process.user.pfp} userId={process.user.userId} navigation={navigation} /> :
                    <SellerPic width={50} pfp={process.seller.sellerPicture} sellerId={process.seller.sellerId} navigation={navigation} />
                }
                <View style={styles.leftContent}>
                    <Text style={{ color: textColor, fontWeight: "bold" }}>
                        {process.title}
                    </Text>
                    <Text style={{ color: 'gray', fontSize: 12 }}>
                        {isSeller ? `Process for ${process.user.userName}` : `Process by ${process.seller.sellerName}`}
                    </Text>
                    <Text style={[styles.comment, { color: statusColor }]}>{process.status}</Text>
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
        fontSize: 12,
        flexWrap: "wrap",
    }
});