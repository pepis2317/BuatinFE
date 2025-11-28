import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, View, Text, Image, StyleSheet } from "react-native";
import { RootStackParamList } from "../../constants/RootStackParams";
import TopBar from "../../components/TopBar";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { SellerResponse } from "../../types/SellerResponse";
import SellerDetailComponent from "../../components/SellerDetailComponent";

type EditSellerProps = NativeStackScreenProps<RootStackParamList, "EditSeller">
export default function EditSeller({ navigation, route }: EditSellerProps) {
    const { user } = useAuth()
    const [seller, setSeller] = useState<SellerResponse>()
    const [loading, setLoading] = useState(false)
    const getSeller = async (userId: string) => {
        try {
            const result = await axios.get(`${API_URL}/get-seller-by-owner-id`, {
                params: {
                    ownerId: userId
                }
            })
            return result.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" }
        }
    }

    const handleGetSeller = async () => {
        if (user?.userId) {
            setLoading(true)
            const result = await getSeller(user.userId)
            if (!result.error) {
                setSeller(result)
            }
            setLoading(false)
        }
    }
    useEffect(() => {
        handleGetSeller()
    }, [])
    return (
        <View style={{ flex: 1 }}>
            <TopBar title={"Edit Seller"} showBackButton />
            {!loading && seller ?
                <View>
                    <SellerDetailComponent seller={seller} navigation={navigation} editing={true}/>
                </View>
                : <></>
            }
        </View>
    )
}