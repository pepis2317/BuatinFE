import { Image, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../app/context/ThemeContext";
import Colors from "../constants/Colors";

export default function PfpComponent({ width, pfp, userId, navigation }: { width: number, pfp: string | null, userId: string, navigation: any }) {
    const { theme } = useTheme()
    const bg = theme == "dark" ? Colors.darkGray : Colors.offWhite
    const border = theme == "dark" ? Colors.darkBorder : Colors.lightBorder
    const handleNavigate = () => {
        if (userId != "") {
            navigation.navigate("UserDetails", { userId: userId })
        }
    }
    return (
        <TouchableOpacity disabled={userId == ""} onPress={() => handleNavigate()}>
            <Image style={{ backgroundColor: bg, width: width, borderRadius: width, aspectRatio: 1, borderWidth:1, borderColor:border }} src={pfp ? pfp : ""} />
        </TouchableOpacity>
    )
}