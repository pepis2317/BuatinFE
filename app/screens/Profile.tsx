import { View, Text, Button, Image, TextInput, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useAuth, User } from "../context/AuthContext";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker"
import axios from "axios";
import PhoneInputComponent from "../../components/PhoneInputComponent";
import ColoredButton from "../../components/ColoredButton";
import TextInputComponent from "../../components/TextInputComponent";
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pencil, Scroll } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import * as Burnt from "burnt"
import TopBar from "../../components/TopBar";
import { API_URL } from "../../constants/ApiUri";
import { RootStackParamList } from "../../constants/RootStackParams";
import { useSignalR } from "../context/SignalRContext";

export default function Profile() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { stop } = useSignalR();
    const { user, onGetUserData, onUserUpdate, onLogout } = useAuth()
    const [email, setEmail] = useState<string | undefined>("")
    const [password, setPassword] = useState<string | undefined>("")
    const [phone, setPhone] = useState<string | undefined>("")
    const [userName, setUserName] = useState<string | undefined>("")
    const [selectedImage, setSelectedImage] = useState<string | undefined>("");
    const { theme } = useTheme()
    useEffect(() => {
        if (user) {
            setEmail(user.email)
            setPhone(user.phone)
            setUserName(user.userName)

            setSelectedImage(user.pfp)
            setPassword(user.password)

        }
    }, [user])

    const pickImageAsync = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 1,
            aspect: [1, 1]
        })
        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    }
    const updateUser = async (user: User) => {
        try {
            const filteredData = Object.fromEntries(
                Object.entries(user).filter(([_, value]) => value !== null && value !== undefined)
            );
            const response = await axios.put(`${API_URL}/edit-user`, filteredData, {
                headers: {
                    "Content-Type": "application/json",
                }
            })
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" }
        }
    }
    const uploadPfp = async (formData: FormData) => {
        try {
            const response = await axios.post(`${API_URL}/upload-pfp`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
            });

            return response.data;
        } catch (e) {
            return {
                error: true,
                msg: (e as any).response?.data?.detail || "An error occurred"
            };
        }
    }
    const handleUpload = async () => {
        if (user?.userId) {
            let newUser: User = {
                email: email,
                password: password,
                pfp: selectedImage,
                phone: phone,
                userId: user.userId,
                userName: userName,
                role: user.role

            }
            const res = await updateUser(newUser)
            if (res.error) {
                alert(res.msg)
            } else {
                await onUserUpdate!(newUser)
                if (selectedImage && user?.userId) {
                    let filename = selectedImage.split("/").pop();
                    let match = /\.(\w+)$/.exec(filename || "");
                    let type = match ? `image/${match[1]}` : `image`;
                    let formData = new FormData();
                    formData.append("UserId", user.userId);
                    formData.append("file", {
                        uri: selectedImage,
                        name: filename,
                        type: type
                    } as any);
                    await uploadPfp(formData)
                }
                Burnt.toast({
                    title: "Success",
                    preset: "done",
                    message: "Profile Successfully Updated"

                })
            }
        }
    }
    const handleLogOut = async () => {
        await stop()
        onLogout!()
    }
    return (
        <View>
            <TopBar title={"Profile"} showBackButton={false} />
            {user ?
                <ScrollView>
                    <View style={styles.formContainer}>
                        <TouchableOpacity onPress={pickImageAsync}>
                            <Image
                                source={selectedImage && selectedImage !== "" ? { uri: selectedImage } : require('../../assets/default.jpg')}
                                style={styles.pfp}
                            />
                            <View style={styles.pencil}>
                                <Pencil size={20} color={"white"} />
                            </View>
                        </TouchableOpacity>
                        <Text style={{ color: theme == "dark" ? "white" : "black", fontWeight: "bold", textAlign: "left", width: "100%" }}>User Name</Text>
                        <TextInputComponent autoCapitalize="none" placeholder="User Name" onChangeText={setUserName} value={userName} />
                        <Text style={{ color: theme == "dark" ? "white" : "black", fontWeight: "bold", textAlign: "left", width: "100%" }}>Email</Text>
                        <TextInputComponent autoCapitalize="none" placeholder="Email" onChangeText={setEmail} value={email} />
                        <Text style={{ color: theme == "dark" ? "white" : "black", fontWeight: "bold", textAlign: "left", width: "100%" }}>Password</Text>
                        <TextInputComponent autoCapitalize="none" placeholder="Password" onChangeText={setPassword} value={password} secureTextEntry={true} />
                        <Text style={{ color: theme == "dark" ? "white" : "black", fontWeight: "bold", textAlign: "left", width: "100%" }}>Phone</Text>
                        <PhoneInputComponent onPhoneChange={setPhone} defaultValue={user.phone ? user.phone : ""} />
                        <ColoredButton title={"Save Changes"} style={{ backgroundColor: "#5CCFA3", width: "100%" }} onPress={handleUpload} />
                        <ColoredButton title={"Log Out"} style={{ backgroundColor: "#F56565", width: "100%" }} onPress={() => handleLogOut() } />
                    </View>
                </ScrollView>

                : <></>}
        </View>
    )
}
const styles = StyleSheet.create({
    pencil: {
        backgroundColor: '#31363F',
        width: 35,
        height: 35,
        borderRadius: 100,
        position: 'absolute',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        right: 0,
        top: 0
    },
    formContainer: {
        padding: 10,
        paddingTop: 25,
        gap: 10,
        alignItems: 'center',
        width: "100%"
    },
    textInput: {
        width: "100%",
        backgroundColor: "white",
        height: 50,
        padding: 10,
        borderRadius: 5
    },
    pfp: {
        borderRadius: 100,
        width: 100,
        height: 100
    }
})