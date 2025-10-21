import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { useWindowDimensions, View, Text, FlatList, RefreshControl } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import Colors from "../../constants/Colors";
import TopBar from "../../components/TopBar";
import { TabBar, TabView } from "react-native-tab-view";
import { OrderRequestResponse } from "../../types/OrderRequestResponse";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import OrderRequestComponent from "../../components/OrderRequestComponent";
import { TicketPlus } from "lucide-react-native";
import { ProcessResponse } from "../../types/ProcesssResponse";
import ProcessComponent from "../../components/ProcessComponent";
const ProcessesRoute = ({ navigation }: { navigation: any }) => {
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
            const response = await axios.get(`${API_URL}/get-seller-processes?pageSize=3&pageNumber=${pageNumber}`, {
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
    return (
        <View>
            <FlatList
                data={processes}
                keyExtractor={(item: ProcessResponse) => item.processId}
                renderItem={({ item }: { item: ProcessResponse }) => <ProcessComponent process={item} navigation={navigation} isSeller={true} />}
                contentContainerStyle={{ paddingBottom: 8 }}
                keyboardShouldPersistTaps="handled"
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
                }
            />
        </View>
    )
}
const IncomingRequestsRoute = ({ navigation }: { navigation: any }) => {
    const [loading, setLoading] = useState(false)
    const [refresh, setRefresh] = useState(false)
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [orderRequests, setOrderRequests] = useState<OrderRequestResponse[]>([])
    const { theme } = useTheme()
    const { onGetUserToken, user } = useAuth()
    const textColor = theme === "dark" ? "white" : "black"
    const fetchRequestsSeller = async (pageNumber: number) => {
        try {
            const token = await onGetUserToken!()
            const response = await axios.get(`${API_URL}/get-seller-order-requests?pageSize=3&pageNumber=${pageNumber}`, {
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

        const result = await fetchRequestsSeller(reset ? 1 : page);
        if (!result.error) {
            if (reset) {
                setOrderRequests(result.requests); // replace on refresh
            } else {
                setOrderRequests(prev => [...prev, ...result.requests]); // append normally
            }
            setTotal(result.total);
        }

        setLoading(false);
        setRefresh(false);
    };
    const loadMore = () => {
        if (!loading && orderRequests.length < total) {
            setPage(prev => prev + 1)
        }
    };
    useEffect(() => {
        if (orderRequests.length <= total) {
            handleFetch()
        }
    }, [page])
    const onRefresh = useCallback(() => {
        setRefresh(true);
        setPage(1);
        handleFetch(true);
    }, []);
    return (
        <View>
            <FlatList
                data={orderRequests}
                keyExtractor={(item: OrderRequestResponse) => item.requestId}
                renderItem={({ item }: { item: OrderRequestResponse }) => <OrderRequestComponent request={item} navigation={navigation} respondable={true} />}
                contentContainerStyle={{ paddingBottom: 8 }}
                keyboardShouldPersistTaps="handled"
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
                }
            />
        </View>
    )
}

type SellerProcessesProps = NativeStackScreenProps<RootStackParamList, "SellerProcesses">;
export default function SellerProcesses({ navigation, route }: SellerProcessesProps) {
    const { user } = useAuth()
    const layout = useWindowDimensions()
    const [index, setIndex] = useState(0)
    const { theme } = useTheme()
    const backgroundColor = theme == "dark" ? Colors.darkBackground : Colors.lightBackground
    const selectedColor = theme == "dark" ? "white" : "black"
    const unselectedColor = theme == "dark" ? Colors.offWhite : Colors.darkGray
    const routes = [
        { key: 'Ongoing', title: 'Ongoing Processes' },
        { key: 'Incoming', title: 'Incoming Requests' },
    ];
    return (
        <View style={{ flex: 1 }}>
            <TabView
                style={{ flex: 1 }}
                navigationState={{ index, routes }}
                renderScene={({ route }) => {
                    switch (route.key) {
                        case 'Ongoing':
                            return <ProcessesRoute navigation={navigation} />;
                        case 'Incoming':
                            return <IncomingRequestsRoute navigation={navigation} />;
                        default:
                            return null;
                    }
                }}
                onIndexChange={setIndex}
                initialLayout={{ width: layout.width }}
                renderTabBar={(props) => (
                    <TabBar
                        {...props}
                        activeColor={selectedColor}
                        inactiveColor={unselectedColor}
                        scrollEnabled={false}
                        indicatorStyle={{ backgroundColor: Colors.green }}
                        style={{ backgroundColor: backgroundColor }}
                    />
                )}
            />
        </View>
    );
}