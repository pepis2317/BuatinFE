import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import TopBar from "../../components/TopBar";
import { Modal, ScrollView, Text, View, StyleSheet, Dimensions, TouchableOpacity, Image } from "react-native";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import TextInputComponent from "../../components/TextInputComponent";
import ColoredButton from "../../components/ColoredButton";
import Colors from "../../constants/Colors";
import { useTheme } from "../context/ThemeContext";
import ConfirmedModal from "../../components/ConfirmedModal";
import { PlusSquare, X } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
type OrderRequestProps = NativeStackScreenProps<RootStackParamList, "OrderRequest">
export default function OrderRequest({ navigation, route }: OrderRequestProps) {
    const { sellerId } = route.params
    const { theme } = useTheme()
    const [title, setTitle] = useState("")
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [images, setImages] = useState<string[]>([])
    const { onGetUserToken } = useAuth()
    const textColor = theme === "dark" ? "white" : "black"
    const createOrderRequest = async (message: string, title: string) => {
        try {
            const token = await onGetUserToken!()
            const res = await axios.post(`${API_URL}/create-order-request`, {
                SellerId: sellerId,
                Message: message,
                Title: title
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
    const handleCreateRequest = async () => {
        if (!loading) {
            setLoading(true)
            const result = await createOrderRequest(message, title)
            if (!result.error) {
                for (const imageUri of images) {
                    const formData = new FormData();
                    formData.append("ContentId", result.requestId);

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
                setModalVisible(true)
            }
            setLoading(false)
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <TopBar title="Create Order Request" showBackButton />
            <ConfirmedModal visible={modalVisible} message={"Request has been created"} onPress={() => navigation.goBack()} />
            <Text style={{ color: textColor, fontWeight: 'bold', marginBottom: 10 }}>Images</Text>
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
            <ScrollView style={{ flex: 1, padding: 20 }}>
                <Text style={{ color: textColor, fontWeight: 'bold', marginBottom: 10 }}>Title</Text>
                <TextInputComponent placeholder="Title" onChangeText={setTitle} />
                <Text style={{ color: textColor, fontWeight: 'bold', marginBottom: 10, marginTop: 10 }}>Message</Text>
                <TextInputComponent placeholder="Message" onChangeText={setMessage} />
                <ColoredButton title={"Create Request"} onPress={() => handleCreateRequest()} isLoading={loading} style={{ backgroundColor: Colors.green, marginTop: 10 }} disabled={title == "" || message == ""} />
            </ScrollView>
        </View>
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
