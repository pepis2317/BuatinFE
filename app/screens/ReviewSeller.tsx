import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { View, Text, ScrollView } from "react-native";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import TextInputComponent from "../../components/TextInputComponent";
import ColoredButton from "../../components/ColoredButton";
import ConfirmedModal from "../../components/ConfirmedModal";
import TopBar from "../../components/TopBar";
import Stars from "../../components/StarsComponent";
import Colors from "../../constants/Colors";
import { useTheme } from "../context/ThemeContext";

type ReviewSellerProps = NativeStackScreenProps<RootStackParamList, "ReviewSeller">
export default function ReviewSeller({ navigation, route }: ReviewSellerProps) {
    const { sellerId } = route.params
    const { onGetUserToken } = useAuth()
    const [rating, setRating] = useState(0)
    const [review, setReview] = useState("")
    const [loading, setLoading] = useState(false)
    const [inputHeight, setInputHeight] = useState(0)
    const [showCompleted, setShowCompleted] = useState(false)
    const { theme } = useTheme()
    const textColor = theme == "dark" ? "white" : "black"
    const reviewUser = async (review: string, rating: number) => {
        try {
            const token = await onGetUserToken!()
            const res = await axios.post(`${API_URL}/review-seller`, {
                review: review,
                rating: rating,
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
            <TopBar title="Review Seller" showBackButton />
            <ConfirmedModal visible={showCompleted} message={"Review created"} onPress={() => navigation.goBack()} />
            <View style={{ alignItems: 'center', padding: 20, gap: 20 }}>
                <Stars onChange={setRating} />
                <View style={{width:"100%"}}>
                    <Text style={{ color: textColor, fontWeight: 'bold', marginBottom: 10 }}>Review</Text>
                    <TextInputComponent style={{ height: inputHeight, width:"100%" }} placeholder="Review" onChangeText={setReview} multiline
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