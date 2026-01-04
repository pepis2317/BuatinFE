import { Modal, View, Text, StyleSheet, Dimensions } from "react-native";
import ColoredButton from "./ColoredButton";
import Colors from "../constants/Colors";
import { useTheme } from "../app/context/ThemeContext";
import { StatusBar } from "expo-status-bar";
import { CircleCheck, CircleX } from "lucide-react-native";
import { BlurView } from 'expo-blur';

export default function ConfirmedModal({ isFail, visible, message, onPress }: { isFail: boolean, visible: boolean, message: string, onPress: () => void }) {
    
    const { textColor, subtleBorderColor } = useTheme()

    return (
        <Modal
            animationType="slide"
            statusBarTranslucent={false}
            transparent={true}
            visible={visible}
            presentationStyle="overFullScreen">

            <BlurView intensity={50} tint="dark" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

                <View style={[styles.modalStyle, { backgroundColor: subtleBorderColor }]}>
                    {
                        !isFail ? <CircleCheck color={Colors.green} size={100} /> : <CircleX color={Colors.green} size={100} />
                    }

                    <Text style={{ color: textColor, marginBottom: 20, textAlign: 'center', marginTop: 20 }}>{message}</Text>
                    
                    <ColoredButton title={"Ok"} style={{ backgroundColor: Colors.green, width: '100%'}} onPress={onPress} />
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
        padding: 24,
    }
})