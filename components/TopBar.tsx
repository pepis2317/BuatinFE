import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ArrowLeft } from "lucide-react-native";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import { useTheme } from "../app/context/ThemeContext";
import { RootStackParamList } from "../constants/RootStackParams";

export default function TopBar({ title, showBackButton }: { title: string, showBackButton: boolean }) {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { theme } = useTheme()
    return (
        <View style={theme == "dark" ? styles.darkTopBar : styles.lightTopBar}>

            <Text style={theme == "dark" ? styles.darkTitle : styles.lightTitle}>{title}</Text>
            {showBackButton ?
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ArrowLeft color={theme == "dark" ? "white" : "black"} />
                </TouchableOpacity> : <></>
            }

        </View>
    )
}
const styles = StyleSheet.create({
    darkTopBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#31363F',
        backgroundColor: '#222831',
        padding: 10,
        gap: 10,
        height:50

    },
    lightTopBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 10,
        gap: 10,
        height:50,
        elevation:2
    },
    darkTitle: {
        color: "white",
        position: 'absolute',
        fontWeight: 'bold',
        width: "100%",
        textAlign: 'center'
    },
    lightTitle: {
        position: 'absolute',
        fontWeight: 'bold',
        width: "100%",
        textAlign: 'center'
    },
})