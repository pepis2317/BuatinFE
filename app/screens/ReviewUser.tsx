import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { View } from "react-native";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import { useAuth } from "../context/AuthContext";
import ConfirmedModal from "../../components/ConfirmedModal";
import ColoredButton from "../../components/ColoredButton";
import { useState } from "react";
import TopBar from "../../components/TopBar";
import TextInputComponent from "../../components/TextInputComponent";

type ReviewUserProps = NativeStackScreenProps<RootStackParamList, "ReviewUser">
export default function ReviewUser({ navigation, route }: ReviewUserProps) {
    const { userId } = route.params
    const [rating, setRating] = useState(0)
    const [review, setReview] = useState("")
    const [loading, setLoading] = useState(false)
    const [showCompleted, setShowCompleted] = useState(false)
    const { onGetUserToken } = useAuth()
    const reviewUser = async (review: string, rating: number) => {
        try {
            const token = await onGetUserToken!()
            const res = await axios.post(`${API_URL}/review-user`, {
                review: review,
                rating: rating,
                userId: userId
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
    const handleReview = async () => {
        setLoading(true)
        const result = await reviewUser(review, rating)
        if (!result.error) {
            setShowCompleted(true)
        }
        setLoading(false)
    }
    return (
        <View>
            <TopBar title="Review User" showBackButton />
            <ConfirmedModal visible={showCompleted} message={"Review created"} onPress={() => setShowCompleted(false)} />
            <TextInputComponent placeholder="Rating" onChangeText={(input) => setRating(Number(input))} keyboardType="numeric" />
            <TextInputComponent placeholder="Review" onChangeText={setReview} />
            <ColoredButton title={"Create review"} onPress={() => handleReview()} isLoading={loading} />
        </View>
    )
}