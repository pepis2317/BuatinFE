import { View, StyleSheet, TouchableOpacity, Text, Image } from "react-native";
import { SellerResponse } from "../types/SellerResponse";
import { ImageIcon, Star } from "lucide-react-native";
import { useTheme } from "../app/context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../constants/RootStackParams";
import Colors from "../constants/Colors";

export default function SellerCard({ seller }: { seller: SellerResponse }) {
    const { subtleBorderColor, theme, borderColor } = useTheme()
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    return (
        <TouchableOpacity style={theme == "dark" ? styles.seller : styles.lightSeller} onPress={() => navigation.navigate("SellerDetails", { sellerId: seller.sellerId })}>
            <View style={{ width: "100%", padding: 5 }}>
                {seller.banner ?
                    <Image src={seller.sellerPicture} style={styles.thumbnail} />
                    :
                    <View style={[styles.thumbnail, { backgroundColor: subtleBorderColor }]} >
                        <ImageIcon size={50} color={borderColor} />
                    </View>
                }
                <View style={styles.info}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 5 }}>

                        <View style={{ marginTop: -2 }}>
                            <Text ellipsizeMode="tail" numberOfLines={2} style={theme == "dark" ? styles.darkTitle : styles.lightTitle}>{seller.sellerName}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Star fill={"gold"} size={16} color={"gold"} />
                                <Text style={theme == "dark" ? styles.darkTitle : styles.lightTitle}>{seller.rating.toPrecision(2)}</Text>
                            </View>
                        </View>
                    </View>


                    <Text style={theme == "dark" ? styles.darkText : styles.lightText}>{seller.clients} Clients</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
    sellerPic: {
        width: 90,
        height: 90,
        borderRadius: 5,
        borderWidth: 1
    },
    seller: {
        alignItems: "center",
        width: "50%",
        overflow: 'hidden',
        position: 'relative',
    },
    lightSeller: {
        alignItems: "center",
        width: "50%",
        overflow: 'hidden',
        position: 'relative',
    },
    thumbnail: {
        width: "100%",
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        height: 200,
        borderRadius: 5,

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
