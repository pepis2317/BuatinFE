import { Image, Pressable, View } from "react-native";
import { useTheme } from "../app/context/ThemeContext";
import { Store } from "lucide-react-native";
import Colors from "../constants/Colors";

export default function PfpComponent({ width, pfp, userId, navigation }: { width: number, pfp: string | null, userId: string, navigation: any }) {
    const { subtleBorderColor, borderColor } = useTheme()
    const handleNavigate = () => {
        if (userId != "") {
            navigation.navigate("UserDetails", { userId: userId })
        }
    }
    return (
        <Pressable disabled={userId == ""} onPress={() => handleNavigate()}>
            <Image style={{ backgroundColor: subtleBorderColor, width: width, borderRadius: width, aspectRatio: 1, borderWidth: 1, borderColor: borderColor }} src={pfp ? pfp : ""} />
        </Pressable>
    )
}
export function SellerPic({ width, pfp, sellerId, navigation }: { width: number, pfp: string | null, sellerId: string, navigation: any }) {
    const { subtleBorderColor, borderColor, foregroundColor} = useTheme()
    const handleNavigate = () => {
        if (sellerId != "") {
            navigation.navigate("SellerDetails", { sellerId: sellerId })
        }
    }
    return (
        <Pressable disabled={sellerId == ""} style={{ position: 'relative' }} onPress={() => handleNavigate()}>
            <View style={{pointerEvents:'none',padding:5,backgroundColor:foregroundColor, width:20, aspectRatio:1, borderRadius:20, alignItems:'center', justifyContent:'center', position:'absolute',zIndex:10, top:0, left:0}}>
                <Store color={Colors.green} size={16} />
            </View>
            <Image style={{ backgroundColor: subtleBorderColor, width: width, borderRadius: width, aspectRatio: 1, borderWidth: 1, borderColor: borderColor }} src={pfp ? pfp : ""} />
        </Pressable>
    )
}