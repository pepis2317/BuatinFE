import { useEffect, useState } from "react";
import { View, StyleSheet, Text, KeyboardAvoidingView, ScrollView, Platform, TouchableOpacity } from "react-native";
import PhoneInputComponent from "../../components/PhoneInputComponent";
import { useAuth } from "../context/AuthContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import TextInputComponent from "../../components/TextInputComponent";
import { Picker } from "@react-native-picker/picker";
import { useTheme } from "../context/ThemeContext";
import ColoredButton from "../../components/ColoredButton";
import { useNavigation } from "@react-navigation/native";
import ErrorComponent from "../../components/ErrorComponent";
import { RootStackParamList } from "../../constants/RootStackParams";
import TopBar from "../../components/TopBar";
import colors from "../../constants/Colors";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";

type Coord = { latitude: number; longitude: number };

type AddressComponent = {
    long_name: string;
    short_name: string;
    types: string[];
};

export default function Register() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [userName, setUserName] = useState("")
    const [postalCode, setPostalCode] = useState("")
    const [address, setAddress] = useState("")
    const [geoAddress, setGeoAddress] = useState("")
    const [phone, setPhone] = useState("")
    const [role, setRole] = useState("")
    const [sellerName, setSellerName] = useState("")
    const [location, setLocation] = useState<Coord | undefined>();
    const [loading, setLoading] = useState(false)
    const [errMessage, setErrMessage] = useState("")
    const [inputHeight, setInputHeight] = useState(0)
    const [canSubmit, setCanSubmit] = useState(false)
    const { onRegister } = useAuth()
    const { textColor, subtleBorderColor, theme, borderColor } = useTheme()

    const reverseGeocode = async () => {
        if (location) {
            try {
                const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.latitude},${location.longitude}&key=AIzaSyDg7Bxr3Z2iaOWilJGAPR3xrhgoFJinl9E`)
                return response.data
            } catch (e) {
                return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" }
            }
        }
    }
    
    const get = (comp: AddressComponent[], type: string) => comp.find(c => c.types.includes(type))?.long_name;
    
    const handleReverseGeocode = async () => {
        const result = await reverseGeocode();

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

    const register = async () => {
        if (role == "User") {
            if (!email || !password || !userName || !phone || !role || !postalCode || !address || !location) {
                setErrMessage("All forms must be filled")
                return
            }
            setLoading(true)
            const result = await onRegister!(userName, email, password, phone, Number(postalCode), address, role, location.latitude, location.longitude)

            if (result.error) {
                setErrMessage(result.msg)
                setLoading(false)
            } else {
                navigation.goBack()
            }
        }
        if (role == "Seller") {
            if (!email || !password || !userName || !phone || !role || !postalCode || !address || !sellerName || !location) {
                setErrMessage("All forms must be filled")
                return
            }
            setLoading(true)
            const result = await createSeller(userName, password, email, phone, role, Number(postalCode), address, sellerName, location.latitude, location.longitude)
            if (result.error) {
                setErrMessage(result.msg)
                setLoading(false)
            } else {
                navigation.goBack()
            }
        }
    }

    const createSeller = async (userName: string, password: string, email: string, phone: string, role: string, postalCode: number, address: string, sellerName: string, lat: number, long: number) => {
        try {
            const response = await axios.post(`${API_URL}/create-seller`, {
                userName: userName,
                password: password,
                email: email,
                phone: phone,
                role: role,
                postalCode: postalCode,
                address: address,
                sellerName: sellerName,
                latitude: lat,
                longitude: long
            })
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" }
        }
    }

    useEffect(() => {
        handleReverseGeocode()
    }, [location])

    useEffect(() => {
        if ((role == "User" && email && password && userName && phone && postalCode && address && location)
            || (role == "Seller" && email && password && userName && phone && postalCode && address && sellerName && location)) {
            setCanSubmit(true)
        } else {
            setCanSubmit(false)
        }
    }, [role, email, password, userName, phone, postalCode, address, sellerName, location])
    useEffect(()=>{console.log(sellerName)},[sellerName])
    return (

        <View style={{ flex: 1 }}>

            {/* Top Bar */}
            <TopBar title={"Register"} showBackButton={true} />

            <KeyboardAvoidingView style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"} // important
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
            >

                <ScrollView >

                    <View style={styles.formContainer}>

                        {/* Input Fields */}
                        <Text style={{color: theme == "dark" ? "white" : "black", fontWeight: "bold" }}>Username</Text>
					    <TextInputComponent autoCapitalize="none" placeholder="Username" onChangeText={setUserName}/>
					
                        <Text style={{color: theme == "dark" ? "white" : "black", fontWeight: "bold" }}>Email</Text>
                        <TextInputComponent autoCapitalize="none" placeholder="Email" onChangeText={setEmail}/>

                        <Text style={{color: theme == "dark" ? "white" : "black", fontWeight: "bold" }}>Phone</Text>
                        <PhoneInputComponent defaultValue="" onPhoneChange={setPhone} />
                    
                        <Text style={{color: theme == "dark" ? "white" : "black", fontWeight: "bold" }}>Password</Text>
                        <TextInputComponent autoCapitalize="none" secureTextEntry={true} placeholder="Password" onChangeText={setPassword}/> 

                        <Text style={{color: theme == "dark" ? "white" : "black", fontWeight: "bold" }}>Role</Text>
                        <View style={theme == "dark" ? styles.DarkPickerContainer : styles.LightPickerContainer}>
                            <Picker 
                                mode="dropdown"
                                style={theme == "dark" ? { color: "white" } : { color: "black" }} 
                                dropdownIconColor={theme == "dark" ? colors.darkerOffWhite : ""} 
                                selectedValue={role} 
                                onValueChange={(val) => val == "none" ? setRole("User") : setRole(val)}
                            >
                                {role === "" && (
                                    <Picker.Item
                                        label="Select..."
                                        value="none"
                                    />
							    )}
                                <Picker.Item label="User" value="User" />
                                <Picker.Item label="Seller" value="Seller" />
                            </Picker>
                        </View>
                        
                        {/* Set Location Button */}
                        <TouchableOpacity 
                            style={styles.locationButton}
                            onPress={() => navigation.navigate('SelectLocation', {
                                margin: true,
                                onSelectLocation: (coords) => { setLocation(coords) }
                            }
                        )}>
                            <Text style={{ fontSize: 14, fontWeight: "bold" }}>Set Location on Map</Text>
                        </TouchableOpacity>


                        {geoAddress ?
                            <View style={{ gap: 8 }}>

                                <Text style={{ color: 'gray', fontWeight: 'bold' }}>Inferred Address:</Text>
                                <Text style={{ color: 'gray' }}>{geoAddress}</Text>

                                <Text style={{ color: textColor, fontWeight: "bold" }}>Postal Code</Text>
                                <TextInputComponent
                                    autoCapitalize="none"
                                    placeholder="Postal Code"
                                    keyboardType="numeric"
                                    onChangeText={setPostalCode}
                                    value={postalCode}
                                />

                                <Text style={{color: textColor, fontWeight: "bold" }}>Address</Text>
                                <TextInputComponent
                                    style={{ height: inputHeight }}
                                    placeholder="Address"
                                    onChangeText={setAddress}
                                    value={address}
                                    multiline
                                    onContentSizeChange={(e) => {
                                        const newHeight = e.nativeEvent.contentSize.height;
                                        setInputHeight(Math.min(newHeight, 120));
                                    }}
                                />
                                
                            </View>
                            : <></>
                        }

                        {/* Ask Seller Name */}
                        {role == "Seller" ?
                            <View style={{ gap: 8}}>
                                <Text style={{ color: theme == "dark" ? "white" : "black", fontWeight: "bold" }}>Seller Name</Text>
                                <TextInputComponent autoCapitalize="none" placeholder="Seller Name" onChangeText={setSellerName} value={sellerName} />
                            </View>
                            : <></>
                        }

                        {errMessage ? <View style={{ marginVertical: 12}}><ErrorComponent errorsString={errMessage} /></View> : <></>}

                        {/* Register Button */}
                        {canSubmit ?
                            <ColoredButton 
                                title={"Register"}
                                style={{ backgroundColor: colors.green, marginTop: 8 }}
                                onPress={register}
                                isLoading={loading}
                            />
                            :
                            <ColoredButton 
                                title={"Register"}
                                style={{ backgroundColor: colors.darkGray, marginTop: 8}}
                                onPress={register}
                                isLoading={loading}
                                disabled={true}
                            />
                        }

                    </View>

                </ScrollView>

            </KeyboardAvoidingView>

        </View>
    )
}
const styles = StyleSheet.create({
    formContainer: {
        padding: 16,
        gap: 8,
    },

    DarkPickerContainer: {
        backgroundColor: "#222831",
		borderRadius: 8,
		paddingHorizontal: 8,
		height: 45,
		justifyContent: "center",
		borderColor: "#636C7C",
		borderWidth: 1,
    },
    LightPickerContainer: {
        backgroundColor: "Colors.white",
		borderRadius: 8,
		paddingHorizontal: 8,
		height: 45,
		justifyContent: "center",
		borderColor: "#D9D9D9",
		borderWidth: 1,
    },

    locationButton: {
        width: "100%",
		height: 45,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#ccc",
		alignItems: "center",
		justifyContent: "center",
        backgroundColor:"#fff",
        marginTop: 8
    },

})