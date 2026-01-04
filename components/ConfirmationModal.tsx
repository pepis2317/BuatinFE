import { useTheme } from "../app/context/ThemeContext"
import { Modal, View, Text, StyleSheet, Dimensions } from "react-native";
import ColoredButton from "./ColoredButton";
import Colors from "../constants/Colors";
import { CircleQuestionMark, LucideIcon } from "lucide-react-native";
import { BlurView } from "expo-blur";

export default function ConfirmationModal({visible, message, onAccept, onCancel }: { visible: boolean, message: string, onAccept: () => void, onCancel: () => void }) {

    const { textColor, subtleBorderColor } = useTheme()

    return (
        <Modal
            animationType="slide"
            statusBarTranslucent={false}
            transparent={true}
            visible={visible}
            presentationStyle="overFullScreen">
            
            <BlurView intensity={50} tint="dark" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

                <View style={[styles.modalStyle,{backgroundColor:subtleBorderColor}]}>

                    <CircleQuestionMark color={Colors.green} size={100}/>

                    <Text style={{ color: textColor, marginBottom: 20, textAlign:'center', marginTop:20 }}>{message}</Text>

                    <View style={{flexDirection:'row', gap: 16, width:"100%", justifyContent:'space-between'}}>
                        <ColoredButton title={"Cancel"} style={{ backgroundColor: Colors.red, flex: 1 }} onPress={onCancel} />
                        <ColoredButton title={"Ok"} style={{ backgroundColor: Colors.green, flex: 1}} onPress={onAccept} />
                    </View>

                </View>

            </BlurView>

        </Modal>
    )
}

const styles = StyleSheet.create({
    modalStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        width: '80%',
        padding:24,
    }
})