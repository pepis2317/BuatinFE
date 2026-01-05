import { NativeStackNavigationEventMap, NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import SellerReviewsList from "../../components/SellerReviewsList";
import { ActivityIndicator, View } from "react-native";
import TopBar from "../../components/TopBar";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import { useAuth } from "../context/AuthContext";
import ColoredButton from "../../components/ColoredButton";
import { useTheme } from "../context/ThemeContext";
import Colors from "../../constants/Colors";

type SellerReviewsProps = NativeStackScreenProps<RootStackParamList, "SellerReviews">

export default function SellerReviews({ navigation, route }: SellerReviewsProps) {
    const { sellerId } = route.params
    const { textColor } = useTheme()
    const { onGetUserToken } = useAuth()
    const [canReview, setCanReview] = useState(false)
    const [loading, setLoading] = useState(false)

    const checkReviewable = async () => {
        try {
            const token = await onGetUserToken!()
            const response = await axios.get(`${API_URL}/check-review-seller`, {
                params: {
                    sellerId: sellerId
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
        <View style={{ flex: 1}}>

            <TopBar title={"All Reviews"} showBackButton />

            <View style={{ padding: 16}}>
                <SellerReviewsList sellerId={sellerId} navigation={navigation} />
            </View>

            {loading ? <ActivityIndicator size="large" style={{ height: 64, margin: 10, borderRadius: 5 }} color={textColor} /> :
                <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
                    {canReview ?
                        <ColoredButton title={"Create Seller Review"} onPress={() => navigation.navigate('ReviewSeller', { sellerId: sellerId })} style={{backgroundColor: Colors.green}} />
                        : <></>}
                </View>
            }
        </View>
    )
}