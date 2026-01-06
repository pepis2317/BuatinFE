import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import TopBar from "../../components/TopBar";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import { useState } from "react";
import ColoredButton from "../../components/ColoredButton";
import TextInputComponent from "../../components/TextInputComponent";
import ConfirmedModal from "../../components/ConfirmedModal";
import { useTheme } from "../context/ThemeContext";
import Colors from "../../constants/Colors";
import ErrorComponent from "../../components/ErrorComponent";

type CreateShipmentProps = NativeStackScreenProps<RootStackParamList, "CreateShipment">

export default function CreateShipment({ navigation, route }: CreateShipmentProps) {
    const { processId } = route.params;
    const { textColor } = useTheme()
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [showCreated, setShowCreated] = useState(false)
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('')
    const [quantity, setQuantity] = useState(0)
    const [height, setHeight] = useState(0)
    const [width, setWidth] = useState(0)
    const [weight, setWeight] = useState(0)
    const [length, setLength] = useState(0)
    const [errMessage, setErrMessage] = useState('')

    const postRequest = async () => {
        try {
            const response = await axios.post(`${API_URL}/create-shipment`, {
                processId: processId,
                name: name,
                description: description,
                category: category,
                quantity: quantity,
                height: height,
                width: width,
                weight: weight,
                length: length
            })
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }

    const handlePost = async () => {
        if (!name || !description || !category || !quantity || !height || !width || !weight || !length) {
            setErrMessage("All forms must be filled")
            return
        }
        if (quantity <= 0 || height <= 0 || width <= 0 || weight <= 0 || length <= 0) {
            setErrMessage("Values cant be <= 0")
            return
        }
        setLoading(true)
        const result = await postRequest()
        if (!result.error) {
            setShowCreated(true)
        }
        setLoading(false)
    }

    return (
        <View style={{ flex: 1 }}>

            <TopBar title={"Create Shipment"} showBackButton />

            <ConfirmedModal isFail={false} visible={showCreated} message={"Shipment created"} onPress={() => navigation.goBack()} />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={35}>

                <ScrollView
                    contentContainerStyle={{ padding: 16, gap: 12 }}
                    showsVerticalScrollIndicator={false}>
                    
                    <View>
                        <Text style={{ color: textColor, fontWeight: 'bold', marginBottom: 8 }}>Name</Text>
                        <TextInputComponent placeholder="Name" onChangeText={setName} />
                    </View>

                    <View>
                        <Text style={{ color: textColor, fontWeight: 'bold', marginBottom: 8 }}>Description</Text>
                        <TextInputComponent placeholder="Description" multiline style={{height:120}} onChangeText={setDescription} />
                    </View>

                    <View>
                        <Text style={{ color: textColor, fontWeight: 'bold', marginBottom: 8 }}>Category</Text>
                        <TextInputComponent placeholder="Category" onChangeText={setCategory} />
                    </View>

                    <View>
                        <Text style={{ color: textColor, fontWeight: 'bold', marginBottom: 8 }}>Quantity</Text>
                        <TextInputComponent placeholder="Quantity" keyboardType="numeric" onChangeText={(input) => setQuantity(Number(input))} />
                    </View>
                    
                    <View style={{ flexDirection: 'row', gap: 16}}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: textColor, fontWeight: 'bold', marginBottom: 8}}>Height</Text>
                            <TextInputComponent placeholder="Height" keyboardType="numeric" onChangeText={(input) => setHeight(Number(input))} />
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={{ color: textColor, fontWeight: 'bold', marginBottom: 8}}>Width</Text>
                            <TextInputComponent placeholder="Width" keyboardType="numeric" onChangeText={(input) => setWidth(Number(input))} />
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 16, marginBottom: 4}}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: textColor, fontWeight: 'bold', marginBottom: 8 }}>Weight</Text>
                            <TextInputComponent placeholder="Weight" keyboardType="numeric" onChangeText={(input) => setWeight(Number(input))} />
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={{ color: textColor, fontWeight: 'bold', marginBottom: 8 }}>Length</Text>
                            <TextInputComponent placeholder="Length" keyboardType="numeric" onChangeText={(input) => setLength(Number(input))} />
                        </View>
                    </View>
                    
                    {errMessage ?
                        <ErrorComponent errorsString={errMessage} />
                        : <></>}
                    <ColoredButton title={"Create Order"} style={{ backgroundColor: Colors.green }} isLoading={loading} onPress={() => handlePost()} />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>


    )
}