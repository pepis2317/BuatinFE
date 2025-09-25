import { useState } from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import PhoneInputComponent from "../../components/PhoneInputComponent";
import { useAuth } from "../context/AuthContext";
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import TextInputComponent from "../../components/TextInputComponent";
import { Picker } from "@react-native-picker/picker";
import { useTheme } from "../context/ThemeContext";
import ColoredButton from "../../components/ColoredButton";
import { useNavigation } from "@react-navigation/native";
import ErrorComponent from "../../components/ErrorComponent";
import { RootStackParamList } from "../../constants/RootStackParams";
import TopBar from "../../components/TopBar";

export default function Register() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [userName, setUserName] = useState("")
    const [phone, setPhone] = useState("")
    const [role, setRole] = useState("")
    const [loading, setLoading] = useState(false)
    const [errMessage, setErrMessage] = useState("")
    const { onRegister } = useAuth()
    const { theme } = useTheme()
    const register = async () => {
        if (!email || !password || !userName || !phone || !role) {
            setErrMessage("All forms must be filled")
            return
        }
        setLoading(true)
        const result = await onRegister!(userName, email, password, phone, role)

        if (result.error) {
            setErrMessage(result.msg)
            setLoading(false)
        } else {
            navigation.goBack()
        }
    }
    return (
        <View>
            <TopBar title={"Register"} showBackButton={true}/>
            <ScrollView>
                <View style={styles.formContainer}>
                    <Text style={{ color: theme == "dark" ? "white" : "black", fontWeight: "bold" }}>User Name</Text>
                    <TextInputComponent autoCapitalize="none" placeholder="User Name" onChangeText={setUserName} />
                    <Text style={{ color: theme == "dark" ? "white" : "black", fontWeight: "bold" }}>Email</Text>
                    <TextInputComponent autoCapitalize="none" placeholder="Email" onChangeText={setEmail} />
                    <Text style={{ color: theme == "dark" ? "white" : "black", fontWeight: "bold" }}>Phone</Text>
                    <PhoneInputComponent defaultValue="" onPhoneChange={setPhone} />
                    <Text style={{ color: theme == "dark" ? "white" : "black", fontWeight: "bold" }}>Password</Text>
                    <TextInputComponent autoCapitalize="none" secureTextEntry={true} placeholder="Password" onChangeText={setPassword} />
                    <Text style={{ color: theme == "dark" ? "white" : "black", fontWeight: "bold" }}>Role</Text>
                    <View style={theme == "dark" ? styles.DarkPickerContainer : styles.LightPickerContainer}>
                        <Picker style={theme == "dark" ? { color: "white" } : { color: "black" }} dropdownIconColor={theme == "dark" ? "#636C7C" : ""} selectedValue={role} onValueChange={(val) => val == "none" ? setRole("User") : setRole(val)} >
                            <Picker.Item label="Select Role" value="none" />
                            <Picker.Item label="User" value="User" />
                            <Picker.Item label="Seller" value="Seller" />
                        </Picker>
                    </View>
                    {errMessage ? <ErrorComponent errorsString={errMessage} /> : <></>}
                    <ColoredButton title={"Register"} style={{ backgroundColor: "#5CCFA3" }} onPress={register} isLoading={loading} />
                </View>
            </ScrollView>

        </View>
    )
}
const styles = StyleSheet.create({
    formContainer: {
        padding: 15,
        gap: 5
    },
    DarkPickerContainer: {
        borderStyle: 'solid',
        borderColor: '#636C7C',
        borderWidth: 1,
        borderRadius: 5,
        width: '100%'
    },
    LightPickerContainer: {
        backgroundColor: 'white',
        color: "black",
        height: 50,
        borderRadius: 5
    },
    textInput: {
        backgroundColor: "white",
        height: 50,
        padding: 10,
        borderRadius: 5
    },
})