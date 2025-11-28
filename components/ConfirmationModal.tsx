import { useTheme } from "../app/context/ThemeContext"
import { Modal, View, Text, StyleSheet, Dimensions } from "react-native";
import ColoredButton from "./ColoredButton";
import Colors from "../constants/Colors";
import { CircleQuestionMark, LucideIcon } from "lucide-react-native";

export default function ConfirmationModal({visible, message, onAccept, onCancel }: { visible: boolean, message: string, onAccept: () => void, onCancel: () => void }) {
    const { textColor, subtleBorderColor } = useTheme()
    return (
        <Modal
            animationType="slide"
            statusBarTranslucent={false}
            transparent={true}
            visible={visible}
            presentationStyle="overFullScreen">
            <View style={[styles.modalStyle,{backgroundColor:subtleBorderColor}]}>
                <CircleQuestionMark color={Colors.green} size={100}/>
                <Text style={{ color: textColor, marginBottom: 20, textAlign:'center', marginTop:20 }}>{message}</Text>
                <View style={{flexDirection:'row', gap:0, width:"100%", justifyContent:'space-between'}}>
                    <ColoredButton title={"Cancel"} style={{ backgroundColor: Colors.green, width: '48%' }} onPress={onCancel} />
                    <ColoredButton title={"Ok"} style={{ backgroundColor: Colors.green, width: '48%' }} onPress={onAccept} />
                </View>
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
        padding:20,
        transform: [
            { translateX: -0.4 * Dimensions.get('window').width },   // half of 80%
            { translateY: -0.25 * Dimensions.get('window').height }  // half of 50%
        ]
    }
})