import { ActivityIndicator, FlatList, View } from "react-native";
import { ProducerResponse } from "../types/ProducerResponse";
import ProducerCard from "./ProducerCard";
import { useState } from "react";
import { useTheme } from "../app/context/ThemeContext";

export default function ProducersList({ producers, isLoading, onReachEnd }: { producers: ProducerResponse[], isLoading: boolean, onReachEnd: () => void }) {
    const { theme } = useTheme()
    return (
        <FlatList
            data={producers}
            numColumns={2}
            contentContainerStyle={{ gap: 5 }}
            keyExtractor={(producer) => producer.producerId}
            renderItem={({ item }) => (
                <ProducerCard producer={item} />
            )}
            onEndReached={onReachEnd}
            onEndReachedThreshold={0.5}
            ListFooterComponent={isLoading ? <ActivityIndicator size="large" style={{ height: 64, margin: 10, borderRadius: 5 }} color={theme == "dark" ? "white" : "black"} /> : <View style={{ marginTop: 64 }} />} />
    )
}