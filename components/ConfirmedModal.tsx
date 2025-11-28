import { Modal, View, Text, StyleSheet, Dimensions } from "react-native";
import ColoredButton from "./ColoredButton";
import Colors from "../constants/Colors";
import { useTheme } from "../app/context/ThemeContext";
import { StatusBar } from "expo-status-bar";
import { CircleCheck, CircleX } from "lucide-react-native";

export default function ConfirmedModal({ isFail, visible, message, onPress }: { isFail: boolean, visible: boolean, message: string, onPress: () => void }) {
    const { textColor, subtleBorderColor } = useTheme()
    return (
        <Modal
            animationType="slide"
            statusBarTranslucent={false}
            transparent={true}
            visible={visible}
            presentationStyle="overFullScreen">
            <View style={[styles.modalStyle, { backgroundColor: subtleBorderColor }]}>
                {
                    !isFail ? <CircleCheck color={Colors.green} size={100} /> : <CircleX color={Colors.green} size={100} />
                }
                <Text style={{ color: textColor, marginBottom: 20, textAlign: 'center', marginTop: 20 }}>{message}</Text>
                <ColoredButton title={"Ok"} style={{ backgroundColor: Colors.green, width: '80%' }} onPress={onPress} />
            </View>
        </Modal>
    )
}
const styles = StyleSheet.create({
    modalStyle: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        height: '50%',
        width: '80%',
        left: '50%',
        top: '50%',
        padding: 20,
        transform: [
            { translateX: -0.4 * Dimensions.get('window').width },   // half of 80%
            { translateY: -0.25 * Dimensions.get('window').height }  // half of 50%
        ]
    }
})