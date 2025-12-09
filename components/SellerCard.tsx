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
    const placeholderColor = theme == "dark" ? Colors.darkGray : Colors.offWhite
    const iconColor = theme == "dark" ? Colors.darkBorder : Colors.lightBorder

    return (
        <TouchableOpacity style={theme == "dark" ? styles.seller : styles.lightSeller} onPress={() => navigation.navigate("SellerDetails", { sellerId: seller.sellerId })}>

            <View style={{ width: "100%"}}>

                {/* Seller Image */}
                {seller.banner ?
                    <Image src={seller.sellerPicture} style={styles.thumbnail} />
                    :
                    <View style={[styles.thumbnail, { backgroundColor: subtleBorderColor }]} >
                        <ImageIcon size={50} color={borderColor} />
                    </View>
                }

                {/* Seller Info */}
                <View style={styles.info}>

                    {/* Seller Name */}
                    <Text ellipsizeMode="tail" numberOfLines={2} style={theme == "dark" ? styles.darkTitle : styles.lightTitle}>{seller.sellerName}</Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center'}}>
                        {/* Rating */}
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Star fill={"gold"} size={12} color={"gold"} />
                            <Text style={theme == "dark" ? styles.darkTitle : styles.lightTitle}> {seller.rating.toPrecision(2)}</Text>
                        </View>
                        
                        {/* Clients */}
                        <Text style={theme == "dark" ? styles.darkText : styles.lightText}> • {seller.clients} Clients</Text>
                    </View>

                </View>

            </View>

        </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
    seller: {
        alignItems: "center",
        overflow: 'hidden',
        position: 'relative',
    },

    lightSeller: {
        alignItems: "center",
        overflow: 'hidden',
        position: 'relative',
    },
    thumbnail: {
        width: "100%",
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        height: 172,
        borderRadius: 6,

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
        marginTop: 8,
        width: "100%",
        gap: 4
    }
});
