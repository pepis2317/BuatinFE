
import { ArrowLeft } from "lucide-react-native";
import { View, StyleSheet, TouchableOpacity, TextInput, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useState } from "react";
import { ProducerResponse } from "../../types/ProducerResponse";
import axios from "axios";
import * as SecureStore from 'expo-secure-store'
import { USER_LOCATION_KEY } from "./Settings";
import ProducerCard from "../../components/ProducerCard";
import { API_URL } from "../../constants/ApiUri";
import { RootStackParamList } from "../../constants/RootStackParams";

export default function SearchPage() {
    const { theme } = useTheme()
    const [searchTerm, setSearchTerm] = useState("")
    const [producers, setProducers] = useState<ProducerResponse[]>([])
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [refresh, setRefresh] = useState(false)

    const fetchProducers = async () => {
        try {
            let queryString = `/producers-query?searchTerm=${searchTerm}&pageSize=2&pageNumber=${page}`
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
    const handleSearch = () => {
        if (searchTerm != "") {
            setProducers([])
            setPage(1)
            handleFetch()
        }

    }
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


    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    return (
        <View>
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ArrowLeft color={theme == "dark" ? "white" : "black"} />
                </TouchableOpacity>

                <TextInput
                    style={theme == "dark" ? styles.darkTextInput : styles.lightTextInput}
                    placeholderTextColor={theme == "dark" ? "#C4C4C4" : ""}
                    placeholder="Search"
                    autoFocus
                    onChangeText={setSearchTerm}
                    onEndEditing={handleSearch}
                />
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
const styles = StyleSheet.create({
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        gap: 10
    },
    darkTextInput: {
        borderStyle: 'solid',
        borderColor: '#636C7C',
        width: "90%",
        borderWidth: 1,
        color: 'white',
        height: 40,
        padding: 10,
        borderRadius: 100
    },
    lightTextInput: {
        borderStyle: 'solid',
        width: "90%",
        height: 40,
        padding: 10,
        borderRadius: 100,
        backgroundColor: 'white',
        color: "black",
        borderWidth: 1,
        borderColor: '#D9D9D9'
    }
})