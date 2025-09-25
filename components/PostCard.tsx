import { View, StyleSheet, TouchableOpacity, Text, Image, Dimensions } from "react-native";
import { SellerResponse } from "../types/SellerResponse";
import { Copy, ImageIcon, Star } from "lucide-react-native";
import { useTheme } from "../app/context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../constants/RootStackParams";
import { PostResponse } from "../types/PostResponse";
import Colors from "../constants/Colors";

export default function PostCard({ post, onPress }: { post: PostResponse, onPress: () => void }) {
    const { theme } = useTheme()
    const { width } = Dimensions.get("window");
    const placeholderColor = theme == "dark" ? Colors.darkGray : Colors.offWhite
    const iconColor = theme == "dark" ? Colors.darkBorder : Colors.lightBorder
    const numColumns = 3;
    const itemSize = width / numColumns;
    return (
        <TouchableOpacity style={theme == "dark" ? [styles.post, { width: itemSize, height: itemSize }] : [styles.lightPost, { width: itemSize, height: itemSize }]} onPress={() => onPress()} >
            <View style={{ width: "100%" }}>
                {post.thumbnail ?
                    <View style={styles.thumbnail} >
                        <Image src={post.thumbnail} style={{ width: "100%", height: "100%" }} />
                        {post.isMultipleImages ? <View style={styles.multiple} ><Copy size={20} color={"white"} /></View> : <></>}

                    </View>
                    :
                    <View style={[styles.thumbnail, { backgroundColor: placeholderColor }]} >
                        <ImageIcon size={50} color={iconColor} />
                    </View>
                }
            </View>

        </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
    multiple: {
        position: "absolute",
        top: 5,
        right: 5,

        backgroundColor: "rgba(0,0,0,0.6)", // dark semi-transparent background
        borderRadius: 12, // half of height/width if square
        padding: 4,

        // iOS shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,

        // Android shadow
        elevation: 4,
    },
    post: {
        alignItems: "center",
        overflow: 'hidden',
        position: 'relative',
    },
    lightPost: {
        alignItems: "center",
        overflow: 'hidden',
        position: 'relative',
    },
    thumbnail: {
        width: "100%",
        height: "100%",
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative'
    },
    darkTitle: {
        color: 'white',
        fontWeight: 'bold',
    },
    darkText: {
        color: 'white',
        fontSize: 12
    },
    lightText: {
        color: 'black'
    },
    lightTitle: {
        color: 'black',
        fontWeight: 'bold',
    },
    info: {
        marginTop: 5,
        width: "100%",
        gap: 2
    }
});
