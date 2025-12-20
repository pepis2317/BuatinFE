import { View, Text, Button, Image, TextInput, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useAuth, User } from "../context/AuthContext";
import { useCallback, useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker"
import axios from "axios";
import PhoneInputComponent from "../../components/PhoneInputComponent";
import ColoredButton from "../../components/ColoredButton";
import TextInputComponent from "../../components/TextInputComponent";
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pencil, Scroll } from "lucide-react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import * as Burnt from "burnt"
import TopBar from "../../components/TopBar";
import { API_URL } from "../../constants/ApiUri";
import { RootStackParamList } from "../../constants/RootStackParams";
import { useSignalR } from "../context/SignalRContext";
import { UserResponse } from "../../types/UserResponse";
import Colors from "../../constants/Colors";
import ErrorComponent from "../../components/ErrorComponent";

type Coord = { latitude: number; longitude: number };
type AddressComponent = {
    long_name: string;
    short_name: string;
    types: string[];
};

export default function Profile() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { stop } = useSignalR();
    const { user, onGetUserData, onUserUpdate, onLogout } = useAuth()
    const [userData, setUserData] = useState<UserResponse>()
    const [email, setEmail] = useState<string | undefined>("")
    const [password, setPassword] = useState<string | undefined>("")
    const [location, setLocation] = useState<Coord | undefined>();
    const [phone, setPhone] = useState<string | undefined>("")
    const [userName, setUserName] = useState<string | undefined>("")
    const [selectedImage, setSelectedImage] = useState<string | undefined>("");
    const [errMessage, setErrMessage] = useState("")
    const [address, setAddress] = useState("")
    const [postalCode, setPostalCode] = useState("")
    const [inputHeight, setInputHeight] = useState(0)
    const [geoAddress, setGeoAddress] = useState("")
    const [loading, setLoading] = useState(false)
    const { subtleBorderColor, borderColor, textColor } = useTheme()

    useEffect(() => {
        if (user && userData) {
            setEmail(userData.email)
            setPhone(userData.phone)
            setUserName(userData.userName)
            setSelectedImage(userData.pfp)
            setPassword(user.password)
        }
    }, [user, userData])

    const reverseGeocode = async (latitude: number, longitude: number) => {
        try {
            const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyDg7Bxr3Z2iaOWilJGAPR3xrhgoFJinl9E`)
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" }
        }
    }

    const get = (comp: AddressComponent[], type: string) => comp.find(c => c.types.includes(type))?.long_name;
    
    const handleReverseGeocode = async (latitude: number, longitude: number) => {
        const result = await reverseGeocode(latitude, longitude);

        if (!result.error) {
            const comp: AddressComponent[] = result.results[0].address_components;

            const street = `${get(comp, "route") || ""} ${get(comp, "street_number") || ""}`.trim();
            const sublocality = get(comp, "sublocality");
            const district = get(comp, "administrative_area_level_3");
            const city = get(comp, "administrative_area_level_2");
            const province = get(comp, "administrative_area_level_1");
            const postal = get(comp, "postal_code");
            const country = get(comp, "country");

            // Build clean string with no undefined or empty parts
            const parts = [
                street,
                sublocality,
                district,
                city,
                province ? `${province} ${postal || ""}`.trim() : null,
                country
            ];

            const finalAddress = parts.filter(Boolean).join(", ");
            setAddress(finalAddress);
            setGeoAddress(finalAddress);
            if (postal) {
                setPostalCode(postal)
            }
        }
    };
    
    const getUserDataHandler = async () => {
        const res = await onGetUserData!()
        if (!res.error) {
            setUserData(res)
            handleReverseGeocode(res.latitude, res.longitude)
        }
    }
    useEffect(() => {
        getUserDataHandler()
    }, [])

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
        if (!userName || !email || !password || !phone || !postalCode || !address) {
            setErrMessage("All forms must be filled")
            return
        }
        setLoading(true)
        if (user?.userId) {
            let newUser: User = {
                email: email,
                password: password,
                pfp: selectedImage,
                phone: phone,
                userId: user.userId,
                userName: userName,
                role: user.role,
                address: address,
                postalCode: postalCode,
                latitude: location?.latitude,
                longitude: location?.longitude
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
                await getUserDataHandler()
            }
        }
        setLoading(false)
    }

    const handleLogOut = async () => {
        await stop()
        onLogout!()
    }

    useEffect(() => {
        if (location) {
            handleReverseGeocode(location.latitude, location.longitude)
        }
    }, [location])

    useFocusEffect(
        useCallback(() => {
            getUserDataHandler()
        }, [])
    );

    return (

        <View style={{ flex: 1}}>

            <TopBar title={"Profile"} showBackButton={false} />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={35}>
                {userData ?
                    <ScrollView style={{ flex: 1 }}>

                        <View style={styles.formContainer}>

                            <View style={{ alignItems: 'center' }}>
                                <TouchableOpacity onPress={pickImageAsync}>
                                    <Image source={{ uri: selectedImage }}
                                        style={[styles.pfp, { backgroundColor: subtleBorderColor, borderColor: borderColor }]}
                                    />
                                    <View style={styles.pencil}>
                                        <Pencil size={20} color={"white"} />
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <Text style={{ color: textColor, fontWeight: "bold", textAlign: "left", width: "100%" }}>User Name</Text>
                            <TextInputComponent autoCapitalize="none" placeholder="User Name" onChangeText={setUserName} value={userName} />
                            
                            <Text style={{ color: textColor, fontWeight: "bold", textAlign: "left", width: "100%" }}>Email</Text>
                            <TextInputComponent autoCapitalize="none" placeholder="Email" onChangeText={setEmail} value={email} />
                            
                            <Text style={{ color: textColor, fontWeight: "bold", textAlign: "left", width: "100%" }}>Password</Text>
                            <TextInputComponent autoCapitalize="none" placeholder="Password" onChangeText={setPassword} value={password} secureTextEntry={true} />
                            
                            <Text style={{ color: textColor, fontWeight: "bold", textAlign: "left", width: "100%" }}>Phone</Text>
                            <PhoneInputComponent onPhoneChange={setPhone} defaultValue={userData.phone ? userData.phone : ""} />
                            
                            <View style={{ padding: 16, backgroundColor: subtleBorderColor, borderWidth: 1, borderColor: borderColor, borderRadius: 10, marginVertical: 8 }}>

                                <ColoredButton title={"Change Location"} style={[{ backgroundColor: Colors.green }, styles.button]} onPress={() => navigation.navigate('SelectLocation', {
                                    margin: false,
                                    onSelectLocation: (coords) => {
                                        setLocation(coords)
                                    }
                                })} />

                                {geoAddress ?
                                    <View style={{ marginTop: 16, gap: 8 }}>
                                        <Text style={{ color: 'gray', fontWeight: 'bold' }}>Inferred Address:</Text>
                                        <Text style={{ color: 'gray' }}>{geoAddress}</Text>
                                        
                                        <Text style={{ color: textColor, fontWeight: "bold" }}>Postal Code</Text>
                                        <TextInputComponent autoCapitalize="none" placeholder="Postal code" keyboardType="numeric" onChangeText={setPostalCode} value={postalCode} />
                                        
                                        <Text style={{ color: textColor, fontWeight: "bold" }}>Address</Text>
                                        <TextInputComponent style={{ height: inputHeight }} placeholder="Caption" onChangeText={setAddress} value={address} multiline
                                            onContentSizeChange={(e) => {
                                                const newHeight = e.nativeEvent.contentSize.height;
                                                setInputHeight(Math.min(newHeight, 120));
                                            }}
                                        />
                                    </View>
                                    : <></>}

                            </View>
                            {errMessage ?
                                <ErrorComponent errorsString={errMessage} />
                                : <></>}

                            <View style={{ flexDirection: 'row', gap: 16, justifyContent: 'space-between' }}>
                                < ColoredButton style={[{ backgroundColor: Colors.red }, styles.button]} title={"Log Out"} onPress={() => handleLogOut()} isLoading={loading} />
                                <ColoredButton style={[{ backgroundColor: Colors.green }, styles.button]} title={"Save"} onPress={() => handleUpload()} isLoading={loading} />
                            </View>
                        </View>
                    </ScrollView>
                    : <></>}
            </KeyboardAvoidingView>

        </View>
    )
}
const styles = StyleSheet.create({
    button: {
        height: 45,
        flex: 1,
        padding: 12,
    },
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
        padding: 16,
        paddingTop: 24,
        gap: 8,
    },
    pfp: {
        borderRadius: 100,
        width: 100,
        height: 100,
        borderWidth: 1
    }
})