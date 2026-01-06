import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { ScrollView, View, Text } from "react-native";
import { useEffect, useState } from "react";
import Stars from "../../components/StarsComponent";
import { API_URL } from "../../constants/ApiUri";
import axios from "axios";
import TextInputComponent from "../../components/TextInputComponent";
import ColoredButton from "../../components/ColoredButton";
import Colors from "../../constants/Colors";
import ConfirmedModal from "../../components/ConfirmedModal";
import TopBar from "../../components/TopBar";
import { useTheme } from "../context/ThemeContext";

type EditProps = NativeStackScreenProps<RootStackParamList, "EditReview">

export default function EditReviewReview({ navigation, route }: EditProps) {
    const { review, isSeller } = route.params
    const [loading, setLoading] = useState(false)
    const [reviewMessage, setReviewMessage] = useState("")
    const [rating, setRating] = useState(0)
    const [inputHeight, setInputHeight] = useState(0)
    const [showSuccess, setShowSuccess] = useState(false)
    const { textColor } = useTheme()

    const editReview = async (reviewMessage: string, rating: number) => {
        try {
            var url = `${API_URL}/edit-seller-review`
            if (!isSeller) {
                url = `${API_URL}/edit-user-review`
            }
            const response = await axios.put(url, {
                reviewId: review.reviewId,
                review: reviewMessage,
                rating: rating
            })
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }

    const handleEditReview = async () => {
        setLoading(true)
        const result = await editReview(reviewMessage, rating)
        if (!result.error) {
            setShowSuccess(true)
        }
        setLoading(false)
    }

    useEffect(() => {
        setReviewMessage(review.review)
        setRating(review.rating)
    }, [])

    return (
        <View>

            <ConfirmedModal isFail={false} visible={showSuccess} message={"Review has been edited"} onPress={() => navigation.goBack()} />

            <TopBar title={"Edit Review"} showBackButton />

            <View style={{ alignItems: 'center', padding: 20, gap: 20 }}>
                <Stars onChange={setRating} value={rating} />

                <View style={{width:"100%"}}>
                    <Text style={{ color: textColor, fontWeight: 'bold', marginBottom: 10 }}>Review</Text>
                    <TextInputComponent style={{ height: 120, width:"100%" }} value={reviewMessage} placeholder="Review" onChangeText={setReviewMessage} multiline/>
                </View>
                <ColoredButton onPress={() => handleEditReview()} style={{ backgroundColor: Colors.green, width: "100%" }} title={"Edit Review"} isLoading={loading} />
            </View>

        </View>
    )
}