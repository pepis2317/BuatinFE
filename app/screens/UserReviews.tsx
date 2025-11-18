import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamList } from "../../constants/RootStackParams"
import { ActivityIndicator, View } from "react-native"
import { useTheme } from "../context/ThemeContext"
import { useAuth } from "../context/AuthContext"
import { useEffect, useState } from "react"
import axios from "axios"
import { API_URL } from "../../constants/ApiUri"
import TopBar from "../../components/TopBar"
import ColoredButton from "../../components/ColoredButton"
import Colors from "../../constants/Colors"
import UserReviewsList from "../../components/UserReviewsList"

type UserReviewsProps = NativeStackScreenProps<RootStackParamList, "UserReviews">
export default function UserReviews({ navigation, route }: UserReviewsProps) {
    const { userId } = route.params
    const { theme } = useTheme()
    const { onGetUserToken } = useAuth()
    const [canReview, setCanReview] = useState(false)
    const [loading, setLoading] = useState(false)
    const checkReviewable = async () => {
        try {
            const token = await onGetUserToken!()
            const response = await axios.get(`${API_URL}/check-review-user`, {
                params: {
                    userId: userId
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const handleCheck = async () => {
        setLoading(true)
        const result = await checkReviewable()
        if (!result.error) {
            setCanReview(result)
        }
        setLoading(false)
    }
    useEffect(() => {
        handleCheck()
    }, [])
    return (
        <View style={{ flex: 1 }}>
            <TopBar title={"User Reviews"} showBackButton />
            {loading ? <ActivityIndicator size="large" style={{ height: 64, margin: 10, borderRadius: 5 }} color={theme == "dark" ? "white" : "black"} /> :
                <View style={{ padding: 20 }}>
                    {canReview ?
                        <ColoredButton title={"Create Seller Review"} onPress={() => navigation.navigate('ReviewUser', { userId: userId })} style={{ backgroundColor: Colors.green }} />
                        : <></>}
                </View>
            }
            <UserReviewsList userId={userId} navigation={navigation} />
        </View>
    )
}