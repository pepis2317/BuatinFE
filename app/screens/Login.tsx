import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { View, StyleSheet, Text } from "react-native";
import ColoredButton from "../../components/ColoredButton";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import ErrorComponent from "../../components/ErrorComponent";
import { RootStackParamList } from "../../constants/RootStackParams";
import TextInputComponent from "../../components/TextInputComponent";


export default function Login() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Login'>>();
    const { theme } = useTheme()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [errMessage, setErrMessage] = useState("")
    const { onLogin } = useAuth()
    const login = async () => {
        if(!email||!password){
            setErrMessage("All forms must be filled")
            return
        }
        setLoading(true)
        const result = await onLogin!(email, password)
        if (result.error) {
            setErrMessage(result.msg)
            setLoading(false)
        }
    }
    return (
        <View>
            <View style={styles.formContainer}>
                <TextInputComponent autoCapitalize="none" placeholder="Email" onChangeText={setEmail} />
                <TextInputComponent autoCapitalize="none" secureTextEntry={true} placeholder="Password" onChangeText={setPassword} />
                {errMessage ?
                    <ErrorComponent errorsString={errMessage} />
                    : <></>}
                <ColoredButton title={"Log In"} style={{ backgroundColor: "#5CCFA3", width: "100%" }} onPress={!loading ? login : () => { }} isLoading={loading} />
                <Text style={theme != "dark" ? { color: '#31363F', textDecorationLine: 'underline' } : { color: 'white', textDecorationLine: 'underline' }} onPress={() => navigation.navigate("Register")}>New to our app? Register here</Text>
            </View>

        </View>
    )
}
const styles = StyleSheet.create({
    formContainer: {
        padding: 10,
        gap: 10,
        alignItems: 'center'
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