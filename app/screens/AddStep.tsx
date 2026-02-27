import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../constants/RootStackParams";
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import TopBar from "../../components/TopBar";
import axios from "axios";
import { API_URL } from "../../constants/ApiUri";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import ConfirmedModal from "../../components/ConfirmedModal";
import TextInputComponent from "../../components/TextInputComponent";
import ColoredButton from "../../components/ColoredButton";
import Colors from "../../constants/Colors";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from "../context/ThemeContext";
import { Calendar } from "lucide-react-native";
import ErrorComponent from "../../components/ErrorComponent";

interface MaterialModel {
    name: string,
    cost: number,
    quantity: number,
    unitOfMeasurement: string,
    supplier: string
}
type AddStepProps = NativeStackScreenProps<RootStackParamList, "AddStep">;
export default function AddStep({ navigation, route }: AddStepProps) {
    const { processId, previousStepId } = route.params
    const { textColor, borderColor } = useTheme()
    const [loading, setLoading] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [minDate, setMinDate] = useState<Date | null>(null)
    const [showMinDate, setShowMinDate] = useState(false)
    const [maxDate, setMaxDate] = useState<Date | null>(null)
    const [showMaxDate, setShowMaxDate] = useState(false)
    const [amount, setAmount] = useState<number>(0)
    const [materials, setMaterials] = useState<MaterialModel[]>([
        {
            name: "",
            quantity: 1,
            unitOfMeasurement: "",
            supplier: "",
            cost: 0
        }
    ])
    const [errMessage, setErrMessage] = useState("")
    const { user } = useAuth()
    const addStep = async () => {
        try {
            const response = await axios.post(`${API_URL}/create-step`, {
                authorId: user?.userId,
                processId: processId,
                title: title,
                description: description,
                minCompleteEstimate: minDate,
                maxCompleteEstimate: maxDate,
                amount: amount * 100,
                previousStepId: previousStepId,
                materials: materials.map(m => ({
                    name: m.name,
                    quantity: m.quantity,
                    unitOfMeasurement: m.unitOfMeasurement,
                    supplier: m.supplier,
                    cost: m.cost * 100
                }))
            })
            return response.data
        } catch (e) {
            return { error: true, msg: (e as any).response?.data?.detail || "An error occurred" };
        }
    }

    const addMaterial = () => {
        setMaterials(prev => [
            ...prev,
            {
                name: "",
                quantity: 1,
                unitOfMeasurement: "",
                supplier: "",
                cost: 0
            }
        ])
    }
    const removeMaterial = (index: number) => {
        if (materials.length === 1) return;

        setMaterials(prev => prev.filter((_, i) => i !== index));
    };

    const updateMaterial = (
        index: number,
        field: keyof MaterialModel,
        value: string | number
    ) => {
        const updated = [...materials];
        updated[index] = {
            ...updated[index],
            [field]: value
        };
        setMaterials(updated);
    };

    const setMinimumDate = (event: any, selectedDate: Date | undefined) => {
        if (!selectedDate) return;
        setMinDate(selectedDate);
        setShowMinDate(false);
    };

    const setMaximumDate = (event: any, selectedDate: any) => {
        if (!selectedDate) return;
        setMaxDate(selectedDate);
        setShowMaxDate(false);
    }

    const totalMaterialCost = materials.reduce((sum, m) => sum + m.cost, 0)

    const handleUpload = async () => {
        if (!title || !description || !minDate || !maxDate) {
            setErrMessage("All forms must be filled")
            return
        }
        if (amount < 10000) {
            setErrMessage("Amount must be greater than or equal to Rp.10.000")
            return
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const min = new Date(minDate);
        min.setHours(0, 0, 0, 0);

        const max = new Date(maxDate);
        max.setHours(0, 0, 0, 0);

        if (min > max) {
            setErrMessage("Invalid estimation date")
            return
        }

        if (min < today || max < today) {
            setErrMessage("Date must be somewhere in the future");
            return;
        }

        const hasEmptyMaterial = materials.some(m =>
            !m.name ||
            !m.unitOfMeasurement ||
            !m.supplier ||
            m.quantity <= 0
        );

        if (hasEmptyMaterial) {
            setErrMessage("Please complete all material fields");
            return;
        }

        if (totalMaterialCost > amount) {
            setErrMessage("Total material cost cannot exceed step amount");
        }

        setLoading(true)
        const result = await addStep()
        if (!result.error) {
            setShowSuccessModal(true)
        }
        setLoading(false)
    }
    return (
        <View style={{ flex: 1 }}>
            <TopBar title="Add Step" showBackButton />
            <ConfirmedModal isFail={false} onPress={() => navigation.goBack()} visible={showSuccessModal} message={"New step has been added"} />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={35}>
                <ScrollView>
                    <View style={{ padding: 20, gap: 10 }}>
                        <View>
                            <Text style={{
                                color: textColor,
                                fontWeight: 'bold',
                                marginBottom: 10
                            }}>Title</Text>
                            <TextInputComponent placeholder="Title" onChangeText={setTitle} />
                        </View>
                        <View>
                            <Text style={{
                                color: textColor,
                                fontWeight: 'bold',
                                marginBottom: 10
                            }}>Description</Text>
                            <TextInputComponent placeholder="Description" multiline style={{ height: 120 }} onChangeText={setDescription} />
                        </View>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <View style={{ width: '45%' }}>
                                <Text style={{ color: textColor, fontWeight: 'bold', marginBottom: 10 }}>Min Estimate</Text>
                                <TouchableOpacity style={[
                                    styles.date,
                                    { borderColor: borderColor }
                                ]} onPress={() => setShowMinDate(true)}>
                                    <Calendar color={textColor} />
                                    <Text style={{
                                        color: textColor,
                                        fontWeight: 'bold'
                                    }}>{minDate?.toLocaleDateString()}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ width: '45%' }}>
                                <Text style={{
                                    color: textColor,
                                    fontWeight: 'bold',
                                    marginBottom: 10
                                }}>Max Estimate</Text>
                                <TouchableOpacity style={[
                                    styles.date,
                                    { borderColor: borderColor }
                                ]} onPress={() => setShowMaxDate(true)}>
                                    <Calendar color={textColor} />
                                    <Text style={{
                                        color: textColor,
                                        fontWeight: 'bold'
                                    }}>{maxDate?.toLocaleDateString()}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        {showMinDate == true ?
                            <DateTimePicker
                                value={minDate ? minDate : new Date()}
                                mode="date"
                                is24Hour={true}
                                onChange={setMinimumDate}
                            />
                            : <></>}
                        {showMaxDate == true ?
                            <DateTimePicker
                                value={maxDate ? maxDate : new Date()}
                                mode="date"
                                is24Hour={true}
                                onChange={setMaximumDate}
                            />
                            : <></>}
                        {materials.map((material, index) => (
                            <View key={index} style={[styles.material, { borderColor: borderColor }]}>
                                <View>
                                    <Text style={{
                                        color: textColor,
                                        fontWeight: 'bold',
                                        marginBottom: 10
                                    }}>Material Name</Text>
                                    <TextInputComponent
                                        placeholder="Material Name"
                                        onChangeText={(text) => updateMaterial(index, "name", text)}
                                        value={material.name}
                                    />
                                </View>

                                <View>
                                    <Text style={{
                                        color: textColor,
                                        fontWeight: 'bold',
                                        marginBottom: 10
                                    }}>Quantity</Text>
                                    <TextInputComponent
                                        placeholder="Quantity"
                                        keyboardType="numeric"
                                        onChangeText={(text) => updateMaterial(index, "quantity", Number(text))}
                                        value={material.quantity.toString()}
                                    />
                                </View>

                                <View>
                                    <Text style={{
                                        color: textColor,
                                        fontWeight: 'bold',
                                        marginBottom: 10
                                    }}>Unit</Text>
                                    <TextInputComponent
                                        placeholder="Unit"
                                        onChangeText={(text) => updateMaterial(index, "unitOfMeasurement", text)}
                                        value={material.unitOfMeasurement}
                                    />
                                </View>

                                <View>
                                    <Text style={{
                                        color: textColor,
                                        fontWeight: 'bold',
                                        marginBottom: 10
                                    }}>Supplier</Text>
                                    <TextInputComponent
                                        placeholder="Supplier"
                                        onChangeText={(text) => updateMaterial(index, "supplier", text)}
                                        value={material.supplier}
                                    />
                                </View>

                                <View>
                                    <Text style={{
                                        color: textColor,
                                        fontWeight: 'bold',
                                        marginBottom: 10
                                    }}>Total Cost</Text>
                                    <TextInputComponent
                                        placeholder="Total Cost"
                                        keyboardType="numeric"
                                        onChangeText={(text) => updateMaterial(index, "cost", Number(text))}
                                        value={material.cost.toString()}
                                    />
                                </View>
                                {materials.length > 1 && (
                                    <ColoredButton style={[{ backgroundColor: Colors.peach }, styles.button]} title={"Remove Material"} onPress={() => removeMaterial(index)} />
                                )}
                            </View>

                        ))}

                        <ColoredButton
                            style={[{ backgroundColor: Colors.green }, styles.button]}
                            title={"Add Material"} onPress={() => addMaterial()} />

                        <View>
                            <Text style={{
                                color: textColor,
                                fontWeight: 'bold',
                            }}>Total Material Cost</Text>
                            <Text style={{
                                color: textColor,
                            }}>Rp.{Number(totalMaterialCost).toLocaleString("id-ID")}</Text>
                        </View>

                        <View>
                            <Text style={{
                                color: textColor,
                                fontWeight: 'bold',
                            }}>Estimated Labor Cost</Text>
                            <Text style={{
                                color: textColor,
                            }}>Rp.{Number(amount - totalMaterialCost).toLocaleString("id-ID")}</Text>
                        </View>

                        {totalMaterialCost > amount && (
                            <Text style={{ color: Colors.peach }}>
                                Material cost exceeds step amount!
                            </Text>
                        )}
                        <View>
                            <Text style={{
                                color: textColor,
                                fontWeight: 'bold',
                                marginBottom: 10
                            }}>Amount</Text>
                            <TextInputComponent placeholder="Amount" onChangeText={(text) => setAmount(Number(text))} inputMode="numeric" />
                        </View>
                        {errMessage ?
                            <ErrorComponent errorsString={errMessage} />
                            : <></>}
                        <ColoredButton style={[{ backgroundColor: Colors.green }, styles.button]} title={"Add step"} onPress={() => handleUpload()} isLoading={loading} />
                        <Text style={{ color: textColor, textAlign: 'center' }}>
                            Step price and material information can't be altered after creation.
                        </Text>
                    </View>
                </ScrollView>

            </KeyboardAvoidingView>


        </View>
    )
}
const styles = StyleSheet.create({
    button: {
        height: 40,
        padding: 10,
    },
    date: {
        padding: 15,
        borderWidth: 1,
        borderRadius: 10,
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
    },
    material: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        gap: 10
    }
})
