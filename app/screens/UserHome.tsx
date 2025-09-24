import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native"
import { useNavigation } from "@react-navigation/native"
import * as SecureStore from 'expo-secure-store'
import { useCallback, useEffect, useState } from "react"
import axios from "axios"
import { ProducerResponse } from "../../types/ProducerResponse"
import { useTheme } from "../context/ThemeContext"
import ProducerCard from "../../components/ProducerCard"
import { Bell, Search, Settings } from "lucide-react-native"
import { API_URL } from "../../constants/ApiUri"
import { RootStackParamList } from "../../constants/RootStackParams"
import { USER_LOCATION_KEY } from "./Settings"

export default function UserHome() {
    const { theme } = useTheme()
    const [producers, setProducers] = useState<ProducerResponse[]>([])
    const [refresh, setRefresh] = useState(false)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [total, setTotal] = useState(0)
    const fetchProducers = async () => {
        try {
            let queryString = `/producers-query?pageSize=2&pageNumber=${page}`
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
        const result = await fetchProducers()
        if (result.error) {
            alert(result.msg)
        } else {
            setProducers(prev => [...prev, ...result.producers])
            setTotal(result.total)
        }
        setLoading(false)
    }
    const loadMore = () => {
        if (!loading && producers.length < total) {
            setPage(prev => prev + 1)
        }
    };

    useEffect(() => {
        if (producers.length <= total) {
            handleFetch();
        }
    }, [page]);
    const onRefresh = useCallback(() => {
        setLoading(true)
        setRefresh(true)
        setPage(1)
        setProducers([])
    }, [])

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'UserHome'>>();
    return (
        <View>
            <View style={{
                flexDirection: "row",
                padding: 10,
                paddingLeft: 15,
                paddingRight: 15,
                justifyContent: 'space-between',
                backgroundColor: theme == "dark" ? "#222831" : "white",
                elevation:2
            }}>
                <Text style={{ color: theme == "dark" ? 'white' : 'black', fontWeight: "bold", fontSize: 20 }}>
                    Buatin
                </Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
                        <Settings color={theme == "dark" ? "white" : "black"} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>navigation.navigate("Notifications")}>
                        <Bell color={theme == "dark" ? "white" : "black"}  />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate("SearchPage")}>
                        <Search color={theme == "dark" ? "white" : "black"} />
                    </TouchableOpacity>
                </View>

            </View>
            {producers.length > 0 ?
                <FlatList
                    data={producers}
                    numColumns={2}
                    contentContainerStyle={{ gap: 5 }}
                    keyExtractor={(producer) => producer.producerId}
                    renderItem={({ item }) => (
                        <ProducerCard producer={item} />
                    )}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    refreshControl={
                        <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
                    }
                    ListFooterComponent={
                        loading ?
                            <ActivityIndicator size="large" style={{ height: 64, margin: 10, borderRadius: 5 }} color={theme == "dark" ? "white" : "black"} />
                            :
                            <View style={{ marginTop: 64 }} />
                    } /> : <></>
            }

        </View>
    )
}