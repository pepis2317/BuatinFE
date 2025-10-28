import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { View, Text } from "react-native";
import TopBar from "../../components/TopBar";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import { useState } from "react";
import ColoredButton from "../../components/ColoredButton";
import TextInputComponent from "../../components/TextInputComponent";
import ConfirmedModal from "../../components/ConfirmedModal";

type CreateShipmentProps = NativeStackScreenProps<RootStackParamList, "CreateShipment">
export default function CreateShipment({ navigation, route }: CreateShipmentProps) {
    const { processId } = route.params;
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
        setLoading(true)
        const result = await postRequest()
        if (!result.error) {
            setShowCreated(true)
        }
        setLoading(false)
    }
    return (
        <View>
            <TopBar title={"Create Shipment"} showBackButton />
            <ConfirmedModal visible={showCreated} message={"Shipment created"} onPress={() => navigation.goBack()} />
            <TextInputComponent placeholder="Name" onChangeText={setName} />
            <TextInputComponent placeholder="Description" onChangeText={setDescription} />
            <TextInputComponent placeholder="Category" onChangeText={setCategory} />
            <TextInputComponent placeholder="Quantity" keyboardType="numeric" onChangeText={(input) => setQuantity(Number(input))} />
            <TextInputComponent placeholder="Height" keyboardType="numeric" onChangeText={(input) => setHeight(Number(input))} />
            <TextInputComponent placeholder="Width" keyboardType="numeric" onChangeText={(input) => setWidth(Number(input))} />
            <TextInputComponent placeholder="Weight" keyboardType="numeric" onChangeText={(input) => setWeight(Number(input))} />
            <TextInputComponent placeholder="Length" keyboardType="numeric" onChangeText={(input) => setLength(Number(input))} />
            <ColoredButton title={"Create Order"} isLoading={loading} onPress={() => handlePost()} />
        </View>
    )
}