import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { ScrollView, View, Text } from "react-native";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import { useAuth } from "../context/AuthContext";
import ConfirmedModal from "../../components/ConfirmedModal";
import ColoredButton from "../../components/ColoredButton";
import { useState } from "react";
import TopBar from "../../components/TopBar";
import TextInputComponent from "../../components/TextInputComponent";
import Stars from "../../components/StarsComponent";
import { useTheme } from "../context/ThemeContext";
import Colors from "../../constants/Colors";

type ReviewUserProps = NativeStackScreenProps<RootStackParamList, "ReviewUser">
export default function ReviewUser({ navigation, route }: ReviewUserProps) {
    const { userId } = route.params
    const [rating, setRating] = useState(0)
    const [review, setReview] = useState("")
    const [loading, setLoading] = useState(false)
    const [showCompleted, setShowCompleted] = useState(false)
    const { onGetUserToken } = useAuth()
    const { textColor } = useTheme()
    const [inputHeight, setInputHeight] = useState(0)
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
            <ConfirmedModal isFail={false} visible={showCompleted} message={"Review created"} onPress={() => navigation.goBack()} />
            <View style={{ alignItems: 'center', padding: 20, gap: 20 }}>
                <Stars onChange={setRating} />
                <View style={{ width: "100%" }}>
                    <Text style={{ color: textColor, fontWeight: 'bold', marginBottom: 10 }}>Review</Text>
                    <TextInputComponent style={{ height: inputHeight, width: "100%" }} placeholder="Review" onChangeText={setReview} multiline
                        onContentSizeChange={(e) => {
                            const newHeight = e.nativeEvent.contentSize.height;
                            setInputHeight(Math.min(newHeight, 120));
                        }}
                    />
                </View>
                <ColoredButton title={"Create Review"} onPress={() => handleReview()} style={{ backgroundColor: Colors.green, width: '100%' }} isLoading={loading} />
            </View>

        </View>
    )
}