import { useEffect, useState } from "react";
import { View, StyleSheet, Text, KeyboardAvoidingView, ScrollView, Platform, } from "react-native";
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
import Colors from "../../constants/Colors";
import * as Location from "expo-location";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
	
export default function Register() {
	const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [userName, setUserName] = useState("");
	const [postalCode, setPostalCode] = useState("");
	const [address, setAddress] = useState("");
	const [phone, setPhone] = useState("");
	const [role, setRole] = useState("");
	const [sellerName, setSellerName] = useState("");
	const [location, setLocation] = useState<Location.LocationObject | undefined>();
	const [loading, setLoading] = useState(false);
	const [errMessage, setErrMessage] = useState("");
	const { onRegister } = useAuth();
	const { theme } = useTheme();
	
	const register = async () => {
		if (role == "User") {
			if (!email || !password || !userName || !phone || !role || !postalCode || !address ) {
				setErrMessage("All forms must be filled");
				return;
			}
			setLoading(true);
			const result = await onRegister!(userName, email, password, phone, Number(postalCode), address, role);
			if (result.error) {
				setErrMessage(result.msg);
				setLoading(false);
			} else {
				navigation.goBack();
			}
		}
		if (role == "Seller") {
		if (!email || !password || !userName || !phone || !role || !postalCode || !address || !sellerName || !location) {
			setErrMessage("All forms must be filled");
			return;
		}
		setLoading(true);
			const result = await createSeller(userName, password, email, phone, role, Number(postalCode),address, sellerName, location.coords.latitude, location.coords.longitude);
			if (result.error) {
				setErrMessage(result.msg);
				setLoading(false);
			} else {
				navigation.goBack();
			}
		}
	};

	const handleGetLocation = async () => {
		let { status } = await Location.requestForegroundPermissionsAsync();
		if (status !== "granted") {
			setErrMessage("Permission to access location was denied");
			return;
		}
		const location = await Location.getCurrentPositionAsync({});
		setLocation(location);
	};

	const createSeller = async (
		userName: string,
		password: string,
		email: string,
		phone: string,
		role: string,
		postalCode: number,
		address: string,
		sellerName: string,
		lat: number,
		long: number
	) => {
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
			longitude: long,
		});
		return response.data;
		} catch (e) {
		return {
			error: true,
			msg: (e as any).response?.data?.detail || "An error occurred",
		};
		}
	};

	return (
		<View style={{ flex: 1 }}>
		
			<TopBar title={"Register"} showBackButton={true} />
			
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === "ios" ? "padding" : "height"} // important
				keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
			>
			
			<ScrollView>

				<View style={styles.formContainer}>
					
					<Text style={{ color: theme == "dark" ? "white" : "black", fontWeight: "bold",}}>User Name</Text>
					<TextInputComponent autoCapitalize="none" placeholder="User Name" onChangeText={setUserName}/>
					
					<Text style={{ color: theme == "dark" ? "white" : "black", fontWeight: "bold", }}>Email</Text>
					<TextInputComponent autoCapitalize="none" placeholder="Email" onChangeText={setEmail}/>

					<Text style={{ color: theme == "dark" ? "white" : "black", fontWeight: "bold", }}>Phone</Text>
					<PhoneInputComponent defaultValue="" onPhoneChange={setPhone} />
				
					<Text style={{ color: theme == "dark" ? "white" : "black", fontWeight: "bold", }}>Password</Text>
					<TextInputComponent autoCapitalize="none" secureTextEntry={true} placeholder="Password" onChangeText={setPassword}/>

					<Text style={{ color: theme == "dark" ? "white" : "black", fontWeight: "bold", }}>Zip Code</Text>
					<TextInputComponent autoCapitalize="none" placeholder="Zip code" keyboardType="numeric" onChangeText={setPostalCode}/>

					<Text style={{ color: theme == "dark" ? "white" : "black", fontWeight: "bold", }}>Address</Text>
					<TextInputComponent autoCapitalize="none" placeholder="Address" onChangeText={setAddress}/>
				
					<Text style={{ color: theme == "dark" ? "white" : "black", fontWeight: "bold", }}>Role</Text>
					<View style={ theme == "dark" ? styles.DarkPickerContainer : styles.LightPickerContainer}>
						<Picker
							style={ theme == "dark" ? { color: "white" } : { color: "black" }}
							dropdownIconColor={theme == "dark" ? "#636C7C" : ""}
							selectedValue={role}
							onValueChange={(val) => val == "none" ? setRole("User") : setRole(val)}
						>
							<Picker.Item label="Select Role" value="none" />
							<Picker.Item label="User" value="User" />
							<Picker.Item label="Seller" value="Seller" />

						</Picker>
					</View>

					{role == "Seller" ? (
						<View>

							<Text style={{color: theme == "dark" ? "white" : "black", fontWeight: "bold", }}>Seller Name</Text>
							<TextInputComponent autoCapitalize="none" placeholder="Seller Name" onChangeText={setSellerName}/>

							<Text style={{color: theme == "dark" ? "white" : "black", fontWeight: "bold", }}>Seller Location</Text>
							
							<ColoredButton
								title={"Set current position as seller location"}
								style={{ backgroundColor: Colors.primary }}
								onPress={() => handleGetLocation()}
							/>
							{location ? (
							<Text style={{ color: theme == "dark" ? "white" : "black" }}>
								Seller location set: {location.coords.latitude},{" "}
								{location.coords.longitude}
							</Text>
							) : (
							<></>
							)}

						</View>
					) : (
					<></>
					)}

					{errMessage ? <ErrorComponent errorsString={errMessage} /> : <></>}
					<ColoredButton title={"Register"} style={{ backgroundColor: Colors.primary }} onPress={register} isLoading={loading}/> 

				</View>

			</ScrollView>
		
		</KeyboardAvoidingView>
	
	</View>
	);
}

const styles = StyleSheet.create({
	formContainer: {
		padding: 16,
		gap: 5,
		paddingBottom: 100,
	},
	DarkPickerContainer: {
		borderStyle: "solid",
		borderColor: "#636C7C",
		borderWidth: 1,
		borderRadius: 5,
		width: "100%",
	},
	LightPickerContainer: {
		backgroundColor: "white",
		color: "black",
		height: 50,
		borderRadius: 5,
	},
	textInput: {
		backgroundColor: "white",
		height: 50,
		padding: 10,
		borderRadius: 5,
	},
});
