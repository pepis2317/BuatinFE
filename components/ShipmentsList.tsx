import { ActivityIndicator, FlatList, RefreshControl, View } from "react-native";
import { useAuth } from "../app/context/AuthContext";
import { useCallback, useRef, useState } from "react";
import { useTheme } from "../app/context/ThemeContext";
import { ShipmentResponse } from "../types/ShipmentResponse";
import ShipmentComponent from "./ShipmentComponent";
import { API_URL } from "../constants/ApiUri";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";

export default function ShipmentsList({ navigation, isSeller }: { navigation: any, isSeller: boolean }) {
    const { onGetUserToken } = useAuth()
    const [shipments, setShipments] = useState<ShipmentResponse[]>([])
    const [total, setTotal] = useState(0)
    const { theme } = useTheme()
    const [refresh, setRefresh] = useState(false)
    const loadingRef = useRef(false)
    const pageRef = useRef(1)
    const refreshRef = useRef(false)

    const fetchShipments = async (pageNumber: number) => {
        try {
            const token = await onGetUserToken!()
            var url = `${API_URL}/get-shipments?pageSize=3&pageNumber=${pageNumber}`
            if (isSeller) {
                url = `${API_URL}/get-seller-shipments?pageSize=3&pageNumber=${pageNumber}`
            }
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const handleFetch = async (page = pageRef.current, replace: boolean) => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        const result = await fetchShipments(page);
        if (!result.error) {
            if (replace) {
                setShipments(result.shipments)
            } else {
                setShipments(prev => [...prev, ...result.shipments])
            }
            setTotal(result.total);
        }
        loadingRef.current = false;
    }
    const loadMore = async () => {
        if (!loadingRef.current && shipments.length < total) {
            loadingRef.current = true;
            pageRef.current += 1;
            await handleFetch(pageRef.current, false);
        }
    }
    const handleRefresh = useCallback(async () => {
        if (refreshRef.current) return
        refreshRef.current = true
        setRefresh(true)
        try {
            pageRef.current = 1
            await handleFetch(1, true)
        } finally {
            setRefresh(false);
            refreshRef.current = false;
        }
    }, [handleFetch])
    useFocusEffect(
        useCallback(() => {
            handleRefresh()
        }, [])
    );
    return (
        <FlatList
            data={shipments}
            keyExtractor={(item) => item.shipmentId}
            renderItem={({ item }: { item: ShipmentResponse }) => <ShipmentComponent shipment={item} navigation={navigation} />}
            keyboardShouldPersistTaps="handled"
            onEndReached={loadMore}
            onEndReachedThreshold={0.2}
            refreshControl={
                <RefreshControl refreshing={refresh} onRefresh={handleRefresh} />
            }
            ListFooterComponent={
                loadingRef.current ?
                    <ActivityIndicator size="large" style={{ height: 64, margin: 10, borderRadius: 5 }} color={theme == "dark" ? "white" : "black"} />
                    :
                    <View style={{ marginTop: 64 }} />
            }
        />
    )
}