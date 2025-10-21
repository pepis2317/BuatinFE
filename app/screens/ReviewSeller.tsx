import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { View } from "react-native";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import { useAuth } from "../context/AuthContext";

type ReviewSellerProps = NativeStackScreenProps<RootStackParamList, "ReviewSeller">
export default function ReviewUser({ navigation, route }: ReviewSellerProps) {
    const { sellerId } = route.params
    const { onGetUserToken } = useAuth()
    const reviewUser = async (review: string, rating:number) => {
        try {
            const token = await onGetUserToken!()
            const res = await axios.post(`${API_URL}/review-seller`, {
                review:review,
                rating:rating,
                sellerId: sellerId
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            return res.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    return (
        <View>

        </View>
    )
}