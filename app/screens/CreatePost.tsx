import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, TouchableOpacity, View, Image, StyleSheet, Text, Platform, KeyboardAvoidingView } from "react-native";
import { RootStackParamList } from "../../constants/RootStackParams";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { PlusSquare, X } from "lucide-react-native";
import ColoredButton from "../../components/ColoredButton";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import TextInputComponent from "../../components/TextInputComponent";
import TopBar from "../../components/TopBar";
import ConfirmedModal from "../../components/ConfirmedModal";
import { SellerResponse } from "../../types/SellerResponse";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import colors from "../../constants/Colors";

type CreatePostProps = NativeStackScreenProps<RootStackParamList, "CreatePost">

export default function CreatePost({ navigation, route }: CreatePostProps) {
    const { user } = useAuth()
    const { textColor } = useTheme()
    const [images, setImages] = useState<string[]>([])
    const [caption, setCaption] = useState("")
    const [loading, setLoading] = useState(false)
    const [inputHeight, setInputHeight] = useState(0)
    const [showConfirmed, setShowConfirmed] = useState(false)

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            alert("Permission required");
            return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 1,
            aspect: [1, 1]
        })

        if (!result.canceled) {
            setImages((prevImages) => [...prevImages, result.assets[0].uri]);
        }
    }

    const removeImage = (index: number) => {
        setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    }

    const handleCreatePost = async (form: FormData) => {
        try {
            const result = await axios.post(`${API_URL}/create-post`, form, { headers: { "Content-Type": "multipart/form-data" } })
            return { data: result.data };
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" }
        }
    }

    const handleUpload = async () => {
        if (user?.userId && caption && images.length > 0) {
            setLoading(true)
            const formData = new FormData();
            formData.append("authorId", user.userId)
            formData.append("caption", caption)

            for (const imageUri of images) {
                const fileName = imageUri.split("/").pop() || "image.jpg";
                const match = /\.(\w+)$/.exec(fileName);
                const fileType = match ? `image/${match[1]}` : "image";

                formData.append("files", {
                    uri: imageUri,
                    name: fileName,
                    type: fileType,
                } as any);
            }

            const result = await handleCreatePost(formData)
            if (!result.error) {
                setShowConfirmed(true)
            }
            setLoading(false)
        }
    }

    return (
        <View style={{ flex: 1 }}>

            <TopBar title={"Create Post"} showBackButton />

            <ConfirmedModal isFail={false} visible={showConfirmed} message={"Post Created"} onPress={() => navigation.goBack()} />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={35}>

                <ScrollView>
                    <View style={{ padding: 16, gap: 10, paddingVertical: 16}}>
                        
                            <Text style={{ color: textColor, fontWeight: 'bold'}}>Images </Text>

                            <View style={styles.imagesContainer}>
                                {/* Add Image Button */}
                                <TouchableOpacity style={styles.addImageButton} onPress={() => pickImage()}>
                                    <View style={styles.addBorder}>
                                        <PlusSquare color={colors.primary} size={32} />
                                    </View>
                                </TouchableOpacity>

                                {/* Image Preview */}
                                <ScrollView horizontal>
                                    {images.map((uri, index) => (
                                        <View key={index} >
                                            <Image
                                                source={{ uri }}
                                                style={{ width: 150, height: 150 }}
                                            />
                                            <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(index)}>
                                                <X size={20} color={"white"} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>
                    </View>

                    <View style={{ paddingHorizontal: 16, gap: 8 }}>
                        <View style={{marginBottom: 8}}>
                            <Text style={{ color: textColor, fontWeight: 'bold', marginBottom: 10 }}>Caption</Text>
                            <TextInputComponent onChangeText={setCaption} multiline placeholder="Caption"/>
                        </View>

                        <ColoredButton title={"Create Post"} style={{ backgroundColor: colors.green, width: "100%" }} onPress={() => handleUpload()} isLoading={loading} />
                    </View>

                </ScrollView>

            </KeyboardAvoidingView>
            
        </View>
    )
}

const styles = StyleSheet.create({
    imagesContainer: {
        flexDirection: 'row',
        borderStyle: 'solid',
        borderColor: colors.darkBorder,
        borderBottomWidth: 1
    },

    addBorder: {
        width: "100%",
        height: "100%",
        justifyContent: 'center',
        borderStyle: 'dashed',
        borderColor: colors.darkBorder,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: 'center',
    },

    addImageButton: {
        padding: 16,
        height: 160,
        width: 120,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        borderStyle: 'solid',
        borderColor: '#31363F',
    },

    removeImageButton: {
        position: 'absolute',
        width: 24,
        height: 24,
        right: 5,
        top: 5,
        backgroundColor: '#31363F',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center'

    }
})