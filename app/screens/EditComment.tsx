import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { ScrollView, View, Text } from "react-native";
import TopBar from "../../components/TopBar";
import { useEffect, useState } from "react";
import TextInputComponent from "../../components/TextInputComponent";
import ColoredButton from "../../components/ColoredButton";
import Colors from "../../constants/Colors";
import ConfirmedModal from "../../components/ConfirmedModal";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import { useTheme } from "../context/ThemeContext";

type EditParams = NativeStackScreenProps<RootStackParamList, "EditComment">

export default function EditComment({ navigation, route }: EditParams) {
    const { comment } = route.params
    const { textColor } = useTheme()
    const [commentMessage, setCommentMessage] = useState("")
    const [loading, setLoading] = useState(false)
    const [showConfirmed, setShowConfirmed] = useState(false)
    const [inputHeight, setInputHeight] = useState(0)

    const editMessage = async () => {
        try {
            const res = await axios.put(`${API_URL}/edit-comment`, {
                commentId: comment.commentId,
                comment: commentMessage
            })
            return res.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }

    const handleEdit = async () => {
        setLoading(true)
        const result = await editMessage()
        if (!result.error) {
            setShowConfirmed(true)
        }
        setLoading(false)
    }

    useEffect(() => {
        setCommentMessage(comment.comment)
    }, [])

    return (
        <View>
            <ConfirmedModal isFail={false} visible={showConfirmed} message={"Comment edited"} onPress={() => navigation.goBack()} />

            <TopBar title={"Edit Comment"} showBackButton />

            <ScrollView style={{ padding: 16 }}>
                <Text style={{ color: textColor, fontWeight: 'bold', marginBottom: 8
                }}>Comment</Text>
                <TextInputComponent style={{ height: inputHeight }} value={commentMessage} placeholder="Review" onChangeText={setCommentMessage} multiline
                    onContentSizeChange={(e) => {
                        const newHeight = e.nativeEvent.contentSize.height;
                        setInputHeight(Math.min(newHeight, 120));
                    }}
                />
                <ColoredButton title={"Edit Comment"} style={{ backgroundColor: Colors.green, marginTop: 16 }} onPress={() => handleEdit()} isLoading={loading} />
            </ScrollView>
        </View>
    )
}