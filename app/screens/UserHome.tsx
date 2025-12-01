import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"
import * as SecureStore from 'expo-secure-store'
import { useCallback, useEffect, useState } from "react"
import axios from "axios"
import { SellerResponse } from "../../types/SellerResponse"
import { useTheme } from "../context/ThemeContext"
import SellerCard from "../../components/SellerCard"
import { Bell, Search, Settings, Store, Wallet } from "lucide-react-native"
import { API_URL } from "../../constants/ApiUri"
import { RootStackParamList } from "../../constants/RootStackParams"
import { USER_LOCATION_KEY } from "./Settings"
import { useAuth } from "../context/AuthContext"
import Colors from "../../constants/Colors"
import { Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"

const COLUMN_GAP = 16;
const SCREEN_WIDTH = Dimensions.get("window").width;
const HORIZONTAL_PADDING = 16;

const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - COLUMN_GAP) / 2;

export default function UserHome() {
    const { user } = useAuth()
    const { theme } = useTheme()
    const [sellers, setSellers] = useState<SellerResponse[]>([])
    const [refresh, setRefresh] = useState(false)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [total, setTotal] = useState(0)
    const color = theme == "dark" ? "white" : "black"

    const fetchSellers = async () => {
        try {
            let queryString = `/sellers-query?pageSize=2&pageNumber=${page}`
            const savedLocation = await SecureStore.getItemAsync(USER_LOCATION_KEY)
            if (savedLocation) {
                const location = JSON.parse(savedLocation)
                queryString = queryString + `&latitude=${location.coords.latitude}&longitude=${location.coords.longitude}`
            }
            const response = await axios.get(`${API_URL}${queryString}`)
            setRefresh(false)
            return response.data
        }
        catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" }
        }
    }

    const handleFetch = async () => {
        setLoading(true)
        const result = await fetchSellers()
        if (result.error) {
            alert(result.msg)
        } else {
            setSellers(prev => [...prev, ...result.sellers])
            setTotal(result.total)
        }
        setLoading(false)
    }

    const loadMore = () => {
        if (!loading && sellers.length < total) {
            setPage(prev => prev + 1)
        }
    };

    useEffect(() => {
        if (sellers.length <= total) {
            handleFetch();
        }
    }, [page]);

    const onRefresh = useCallback(() => {
        setLoading(true)
        setRefresh(true)
        setPage(1)
        setSellers([])
    }, [])

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'UserHome'>>();
    
    return (
        <View style={{ paddingHorizontal: 16, flex: 1}}>

            {/* Top Bar */}
            <View style={{ marginTop: 32, elevation:2}}>

                <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme == "dark" ? "#222831" : "white"
                }}>

                    <Text style={{ color: color, fontWeight: "bold", fontSize: 24 }}>Buatin</Text>
                    
                    <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>

                        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
                            <Settings color={color} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate("Notifications")}>
                            <Bell color={color} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate("Wallet")}>
                            <Wallet color={color} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate("SearchPage")}>
                            <Search color={color} />
                        </TouchableOpacity>

                    </View>

                </View>

                <View style={{ gap: 8, marginTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    {user?.role == "Seller" ?
                        <TouchableOpacity style={styles.sellerHome} onPress={() => navigation.navigate("SellerDetails", { sellerId: null })}>
                            <Store color={'white'} />
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>My Seller Details</Text>
                        </TouchableOpacity>
                        : <></>}
                </View>

            </View>

            <View style={styles.FlatListContainer}>
                {sellers.length > 0 ?
                    <FlatList
                        data={sellers}
                        numColumns={2}
                        columnWrapperStyle={{ marginBottom: 16, columnGap: COLUMN_GAP }}
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(seller) => seller.sellerId}
                        renderItem={({ item }) => (
                            <View style={styles.cardWrapper}>
                                <SellerCard seller={item} /> 
                            </View>
                        )}
                        onEndReached={loadMore}
                        onEndReachedThreshold={0.5}
                        refreshControl={ <RefreshControl refreshing={refresh} onRefresh={onRefresh} /> }
                        ListFooterComponent={
                            loading ?
                            <ActivityIndicator size="large" style={{ height: 64, margin: 16, borderRadius: 5 }} color={theme == "dark" ? "white" : "black"} />
                            :
                            <View style={{ marginTop: 120 }} />
                        } />
                : <></>}
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    sellerHome: {
        backgroundColor: Colors.green,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        padding: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        width: 'auto'
    },
    FlatListContainer: {
        flex: 1,
    },
    cardWrapper: {
        width: CARD_WIDTH,
    },
})