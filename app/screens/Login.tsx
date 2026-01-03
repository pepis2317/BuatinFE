import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { View, StyleSheet, Text, Image, TouchableOpacity } from "react-native";
import ColoredButton from "../../components/ColoredButton";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import ErrorComponent from "../../components/ErrorComponent";
import { RootStackParamList } from "../../constants/RootStackParams";
import TextInputComponent from "../../components/TextInputComponent";
import { useSignalR } from "../context/SignalRContext";
import colors from "../../constants/Colors";
import Icon from '../../assets/icon.svg';

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
        <View>

	  		<View style={styles.formContainer}>

                <Icon svg width={128} height={128} />

				{/* Header Section */}
				<View style={styles.headingContainer}>
					<Text style={[styles.headingText, {color:textColor}]}>Getting Started</Text>
					<Text style={ styles.headingText2}>Create an account or log in to explore</Text>
				</View>

				{/* Input Fields */}
				<TextInputComponent autoCapitalize="none" placeholder="Email" onChangeText={setEmail}/>
				<TextInputComponent autoCapitalize="none" secureTextEntry={true} placeholder="Password" onChangeText={setPassword}/>
				{errMessage ? <ErrorComponent errorsString={errMessage} /> : <></>}
				
				{/* Login Button */}
				<ColoredButton
					title={"Log In"}
					style={{ backgroundColor: colors.green, width: "100%", fontsize: 16, fontWeight: "bold", height: 45}}
					onPress={!loading ? login : () => {}}
					isLoading={loading}
				/>

				{/* Divider */}
				<View style={styles.dividerRow}>
					<View style={styles.divider} />
					<Text style={styles.dividerText}>Or</Text>
					<View style={styles.divider} />
				</View>

				{/* Sign Up Button */}
				<TouchableOpacity style={styles.signupButton} onPress={() => navigation.navigate("Register")}>
					<Text style={[styles.signupButtonText, {color:textColor}]}>Sign Up</Text>
				</TouchableOpacity>

	  		</View>

		</View>
    )
}

const styles = StyleSheet.create({
    formContainer: {
        padding: 16,
		gap: 16,
		alignItems: "center",
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
    },

    headingContainer: {
		marginBottom: 8,
		alignItems: "center",
		gap: 8
	},
	headingText: {
		fontSize: 24,
		fontWeight: "bold",
	},
	headingText2: {
		fontSize: 16,
		color: colors.darkBorder
	},

    dividerRow: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 8,
		width: "100%",
	},
	divider: {
		flex: 1,
		height: 1,
		backgroundColor: colors.darkBorder
	},
	dividerText: {
		marginHorizontal: 8,
		color: colors.darkBorder,
	},

    signupButton: {
		width: "100%",
		height: 48,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#ccc",
		alignItems: "center",
		justifyContent: "center",
	},
	signupButtonText: {
		color: "#31363F",
		fontWeight: "bold",
		fontSize: 14,
	},

	sellerLink: {
		color: "#31363F",
		textAlign: "center",
		textDecorationLine: "underline"
	},
})