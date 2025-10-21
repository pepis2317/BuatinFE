import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ArrowLeft } from "lucide-react-native";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../app/context/ThemeContext";
import { RootStackParamList } from "../constants/RootStackParams";
import Colors from "../constants/Colors";

export default function TopBar({ title, showBackButton }: { title: string, showBackButton: boolean }) {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { theme } = useTheme()
    return (
        <View style={theme == "dark" ? styles.darkTopBar : styles.lightTopBar}>

            <Text style={theme == "dark" ? styles.darkTitle : styles.lightTitle}>{title}</Text>
            {showBackButton ?
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
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
        borderColor: Colors.darkGray,
        backgroundColor: Colors.darkBackground,
        padding: 10,
        gap: 10,
        height:50

    },
    lightTopBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: Colors.offWhite,
        backgroundColor: 'white',
        padding: 10,
        gap: 10,
        height:50,
        elevation:2
    },
    darkTitle: {
        color: "white",
        fontWeight: 'bold',
        width: "100%",
        textAlign: 'center'
    },
    lightTitle: {
        fontWeight: 'bold',
        width: "100%",
        textAlign: 'center'
    },
    backButton:{
        position:'absolute',
        left:20
    }
})