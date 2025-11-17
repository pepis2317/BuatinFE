import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamList } from "../../constants/RootStackParams"
import { ActivityIndicator, FlatList, RefreshControl, View } from "react-native"
import { useCallback, useEffect, useState } from "react"
import { ProcessResponse } from "../../types/ProcesssResponse"
import { useFocusEffect } from "@react-navigation/native"
import axios from "axios"
import { API_URL } from "../../constants/ApiUri"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import ProcessComponent from "../../components/ProcessComponent"
import ShippableComponent from "../../components/ShippableComponent"
import TopBar from "../../components/TopBar"

type ShippableProps = NativeStackScreenProps<RootStackParamList, "Shippable">
export default function Shippable({ navigation, route }: ShippableProps) {
    const [loading, setLoading] = useState(false)
    const [refresh, setRefresh] = useState(false)
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [processes, setProcesses] = useState<ProcessResponse[]>([])
    const { theme } = useTheme()
    const { onGetUserToken, user } = useAuth()
    const textColor = theme === "dark" ? "white" : "black"
    const fetchProcesses = async (pageNumber: number) => {
        try {
            const token = await onGetUserToken!()
            const response = await axios.get(`${API_URL}/get-shippable?pageSize=3&pageNumber=${pageNumber}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setRefresh(false)
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const handleFetch = async (reset = false) => {
        if (loading) return; // prevent duplicate triggers
        setLoading(true);

        const result = await fetchProcesses(reset ? 1 : page);
        if (!result.error) {
            if (reset) {
                setProcesses(result.processes); // replace on refresh
            } else {
                setProcesses(prev => [...prev, ...result.processes]); // append normally
            }
            setTotal(result.total);
        }

        setLoading(false);
        setRefresh(false);
    };
    const loadMore = () => {
        if (!loading && processes.length < total) {
            setPage(prev => prev + 1)
        }
    };
    useEffect(() => {
        if (processes.length <= total) {
            handleFetch()
        }
    }, [page])
    const onRefresh = useCallback(() => {
        setRefresh(true);
        setPage(1);
        handleFetch(true);
    }, []);
    useFocusEffect(
        useCallback(() => {
            handleFetch(true);
        }, [])
    );
    return (
        <>
        <TopBar title={"Shippable Processes"} showBackButton/>
            <FlatList
                data={processes}
                keyExtractor={(item: ProcessResponse) => item.processId}
                renderItem={({ item }: { item: ProcessResponse }) => <ShippableComponent process={item} navigation={navigation} />}
                contentContainerStyle={{ paddingBottom: 8 }}
                keyboardShouldPersistTaps="handled"
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
                }
            />
        </>

    )
}