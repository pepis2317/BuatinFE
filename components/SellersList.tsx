import { ActivityIndicator, FlatList, View } from "react-native";
import { SellerResponse } from "../types/SellerResponse";
import SellerCard from "./SellerCard";
import { useState } from "react";
import { useTheme } from "../app/context/ThemeContext";

export default function SellersList({ sellers, isLoading, onReachEnd }: { sellers: SellerResponse[], isLoading: boolean, onReachEnd: () => void }) {
    const { theme } = useTheme()
    return (
        <FlatList
            data={sellers}
            numColumns={2}
            contentContainerStyle={{ gap: 5 }}
            keyExtractor={(seller) => seller.sellerId}
            renderItem={({ item }) => (
                <SellerCard seller={item} />
            )}
            onEndReached={onReachEnd}
            onEndReachedThreshold={0.5}
            ListFooterComponent={isLoading ? <ActivityIndicator size="large" style={{ height: 64, margin: 10, borderRadius: 5 }} color={theme == "dark" ? "white" : "black"} /> : <View style={{ marginTop: 64 }} />} />
    )
}