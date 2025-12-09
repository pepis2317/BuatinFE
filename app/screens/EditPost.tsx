import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { View, ScrollView, Text } from "react-native";
import { RootStackParamList } from "../../constants/RootStackParams";
import TopBar from "../../components/TopBar";
import { useEffect, useState } from "react";
import TextInputComponent from "../../components/TextInputComponent";
import ColoredButton from "../../components/ColoredButton";
import Colors from "../../constants/Colors";
import { API_URL } from "../../constants/ApiUri";
import axios from "axios";
import ConfirmedModal from "../../components/ConfirmedModal";
import { useTheme } from "../context/ThemeContext";
type EditProps = NativeStackScreenProps<RootStackParamList, "EditPost">
export default function EditPost({ navigation, route }: EditProps) {
    const { post } = route.params
    const { textColor } = useTheme()
    const [caption, setCaption] = useState('')
    const [loading, setLoading] = useState(false)
    const [showConfirmed, setShowConfirmed] = useState(false)
    const [inputHeight, setInputHeight] = useState(0)
    const [showDeleted, setShowDeleted] = useState(false)
    const editPost = async () => {
        try {
            const response = await axios.put(`${API_URL}/edit-post`, {
                postId: post.postId,
                caption: caption
            })
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const deletePost = async () => {
        try {
            const response = await axios.delete(`${API_URL}/delete-post`, {
                data: {
                    postId: post.postId
                }
            })
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }
    const handleDeletePost = async () => {
        setLoading(true)
        const result = await deletePost()
        if(!result.error){
            setShowDeleted(true)
        }
        setLoading(false)
    }
    const handleEditPost = async () => {
        setLoading(true)
        const result = await editPost()
        if (!result.error) {
            setShowConfirmed(true)
        }
        setLoading(false)
    }
    useEffect(() => {
        setCaption(post.caption)
    }, [])
    return (
        <View style={{ flex: 1 }}>
            <TopBar title={"Edit Post"} showBackButton />
            <ConfirmedModal isFail={false} visible={showConfirmed} message={"Post has been edited"} onPress={() => navigation.goBack()} />
            <ConfirmedModal isFail={false} visible={showDeleted} message={"Post has been deleted"} onPress={() => navigation.pop(2)} />
            <ScrollView style={{ padding: 20, gap: 20 }}>
                <Text style={{
                    color: textColor,
                    fontWeight: 'bold',
                    marginBottom: 10
                }}>Caption</Text>
                <TextInputComponent style={{ height: inputHeight }} value={caption} placeholder="Review" onChangeText={setCaption} multiline
                    onContentSizeChange={(e) => {
                        const newHeight = e.nativeEvent.contentSize.height;
                        setInputHeight(Math.min(newHeight, 120));
                    }}
                />
                <ColoredButton onPress={() => handleEditPost()} style={{ backgroundColor: Colors.green, width: "100%", marginTop: 20 }} title={"Edit Post"} isLoading={loading} />
                <ColoredButton onPress={() => handleDeletePost()} style={{ backgroundColor: Colors.peach, width: "100%", marginTop: 20 }} title={"Delete Post"} isLoading={loading} />
            </ScrollView>
        </View>
    )
}