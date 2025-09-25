import { View, StyleSheet, TouchableOpacity, Text, Image } from "react-native";
import { SellerResponse } from "../types/SellerResponse";
import { ImageIcon, Star } from "lucide-react-native";
import { useTheme } from "../app/context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../constants/RootStackParams";
import Colors from "../constants/Colors";

export default function SellerCard({ seller }: { seller: SellerResponse }) {
    const { theme } = useTheme()
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const placeholderColor = theme == "dark" ? Colors.darkGray : Colors.offWhite
    const iconColor = theme == "dark" ?Colors.darkBorder:Colors.lightBorder
    return (
        <TouchableOpacity style={theme == "dark" ? styles.seller : styles.lightSeller} onPress={() => navigation.navigate("SellerDetails", { seller: seller })}>
            <View style={{ width: "100%", padding: 5 }}>
                {seller.banner ?
                    <Image src={seller.banner} style={styles.thumbnail} />
                    :
                    <View style={[styles.thumbnail, { backgroundColor: placeholderColor }]} >
                        <ImageIcon size={50} color={iconColor} />
                    </View>
                }
                <View style={styles.info}>
                    <Text style={theme == "dark" ? styles.darkTitle : styles.lightTitle}>{seller.sellerName}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Star fill={"gold"} size={16} />
                        <Text style={theme == "dark" ? styles.darkTitle : styles.lightTitle}>{seller.rating}</Text>
                    </View>
                    <Text style={theme == "dark" ? styles.darkText : styles.lightText}>{seller.clients} Clients</Text>
                    <Text style={theme == "dark" ? styles.darkText : styles.lightText}>address here</Text>
                </View>

            </View>


        </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
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
