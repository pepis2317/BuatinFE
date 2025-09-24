import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, TouchableOpacity, View, Image, StyleSheet } from "react-native";
import { RootStackParamList } from "../../constants/RootStackParams";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { PlusSquare, X } from "lucide-react-native";
import ColoredButton from "../../components/ColoredButton";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import TextInputComponent from "../../components/TextInputComponent";

type CreatePostProps = NativeStackScreenProps<RootStackParamList, "CreatePost">
export default function CreatePost({ navigation, route }: CreatePostProps) {
    const { producer } = route.params
    const [images, setImages] = useState<string[]>([])
    const [caption, setCaption] = useState("")
    const [loading, setLoading] = useState("")
    const handleUploadImage = async (formData: FormData) => {
        try {
            const result = await axios.post(`${API_URL}/upload-image`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return { data: result.data };
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" }
        }
    }

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
    const handleCreatePostMetadata = async () => {
        try {
            const result = await axios.post(`${API_URL}/create-post-metadata`, {
                authorId: producer.owner.userId,
                caption: caption
            })
            return { data: result.data };
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" }
        }
    }
    const handleUpload = async () => {
        const postMetadata = await handleCreatePostMetadata();
        if (!postMetadata.error) {
            for (const imageUri of images) {
                const formData = new FormData();
                formData.append("ContentId", postMetadata.data);

                const fileName = imageUri.split("/").pop() || "image.jpg";
                const match = /\.(\w+)$/.exec(fileName);
                const fileType = match ? `image/${match[1]}` : "image";

                formData.append("File", {
                    uri: imageUri,
                    name: fileName,
                    type: fileType,
                } as any);

                const res = await handleUploadImage(formData);
                console.log("upload result:", res);
            }
        } else {
            alert(postMetadata.msg);
        }
    }
    return (
        <ScrollView>
            <View style={styles.imagesContainer}>
                <TouchableOpacity style={styles.addImageButton} onPress={() => pickImage()}>
                    <View style={styles.addBorder}>
                        <PlusSquare color={"#5CCFA3"} size={32} />
                    </View>
                </TouchableOpacity>
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
            <TextInputComponent placeholder="Caption" onChangeText={setCaption} />
            <ColoredButton title={"Test"} style={{ backgroundColor: "#5CCFA3", width: "100%" }} onPress={handleUpload} />
        </ScrollView>
    )
}
const styles = StyleSheet.create({
    imagesContainer: {
        height: 150,
        flexDirection: 'row',
        borderStyle: 'solid',
        borderColor: '#31363F',
        borderBottomWidth: 1
    },
    addBorder: {
        width: "100%",
        height: "100%",
        justifyContent: 'center',
        borderStyle: 'dashed',
        borderColor: '#5CCFA3',
        borderRadius: 5,
        borderWidth: 1,
        alignItems: 'center',

    },
    addImageButton: {
        padding: 15,
        height: 150,
        width: 100,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        borderStyle: 'solid',
        borderColor: '#31363F',
        borderRightWidth: 1
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