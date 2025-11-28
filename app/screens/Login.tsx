import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { View, StyleSheet, Text, Image } from "react-native";
import ColoredButton from "../../components/ColoredButton";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import ErrorComponent from "../../components/ErrorComponent";
import { RootStackParamList } from "../../constants/RootStackParams";
import TextInputComponent from "../../components/TextInputComponent";
import { useSignalR } from "../context/SignalRContext";
import Colors from "../../constants/Colors";
import Icon from "../../assets/icon.svg";

export default function Login() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Login'>>();
    const { textColor } = useTheme()
    const [email, setEmail] = useState("")
    const { isConnected, start } = useSignalR()
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [errMessage, setErrMessage] = useState("")
    const { onLogin } = useAuth()
    const login = async () => {
        if (!email || !password) {
            setErrMessage("All forms must be filled")
            return
        }
        setLoading(true)
        const result = await onLogin!(email, password)
        if (result.error) {
            setErrMessage(result.msg)
            setLoading(false)
        }
        if (!isConnected) {
            await start()
        }
    }
    return (
        <View style={styles.formContainer}>
            <Icon width={100} />
            <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 32 }}>Buatin</Text>
            <TextInputComponent autoCapitalize="none" placeholder="Email" onChangeText={setEmail} />
            <TextInputComponent autoCapitalize="none" secureTextEntry={true} placeholder="Password" onChangeText={setPassword} />
            {errMessage ?
                <ErrorComponent errorsString={errMessage} />
                : <></>}
            <ColoredButton title={"Log In"} style={{ backgroundColor: Colors.green, width: "100%" }} onPress={!loading ? login : () => { }} isLoading={loading} />
            <Text style={{ color: textColor, textDecorationLine: 'underline' }} onPress={() => navigation.navigate("Register")}>New to our app? Register here</Text>

        </View>
    )
}
const styles = StyleSheet.create({
    formContainer: {
        padding: 20,
        gap: 10,
        alignItems: 'center',
        flex: 1,
    },
    errorContainer: {
        padding: 15,
        backgroundColor: '#31363F',
        borderRadius: 5

    },
    textInput: {
        backgroundColor: "white",
        height: 50,
        padding: 10,
        borderRadius: 5
    }
})