
import { useCallback, useRef, useState } from "react"
import { useTheme } from "../app/context/ThemeContext"
import { ActivityIndicator, FlatList, RefreshControl, View } from "react-native"
import { ReviewResponse } from "../types/ReviewResponse"
import { API_URL } from "../constants/ApiUri"
import axios from "axios"
import { useFocusEffect } from "@react-navigation/native"
import ReviewComponent from "./ReviewComponent"
import { useAuth } from "../app/context/AuthContext"

export default function SellerReviewsList({ sellerId, navigation }: { sellerId: string, navigation: any }) {
    const {onGetUserToken} = useAuth()
    const [reviews, setReviews] = useState<ReviewResponse[]>([])
    const [total, setTotal] = useState(0)
    const { theme } = useTheme()
    const [refresh, setRefresh] = useState(false)
    const loadingRef = useRef(false)
    const pageRef = useRef(1)
    const refreshRef = useRef(false)
    const fetchSellerReviews = async (pageNumber: number) => {
        try {
            const token = await onGetUserToken!()
            var url = `${API_URL}/get-seller-reviews?pageSize=3&pageNumber=${pageNumber}&sellerId=${sellerId}`
            const response = await axios.get(url,{
                headers:{
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
        const result = await fetchSellerReviews(page);
        if (!result.error) {
            if (replace) {
                setReviews(result.reviews)
            } else {
                setReviews(prev => [...prev, ...result.reviews])
            }
            setTotal(result.total);
        }
        loadingRef.current = false;
    }
    const loadMore = async () => {
        if (!loadingRef.current && reviews.length < total) {
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
            reset()
        } finally {
            setRefresh(false);
            refreshRef.current = false;
        }
    }, [handleFetch])
    const reset = async () => {
        pageRef.current = 1
        await handleFetch(1, true)
    }
    useFocusEffect(
        useCallback(() => {
            reset()
        }, [])
    );
    return (
        <FlatList
            data={reviews}
            keyExtractor={(item) => item.reviewId}
            renderItem={({ item }: { item: ReviewResponse }) => <ReviewComponent isSeller={true} review={item} navigation={navigation} />}
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