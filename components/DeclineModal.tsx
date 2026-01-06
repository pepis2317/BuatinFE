import { Modal, View, StyleSheet, Text, Dimensions } from "react-native";
import TextInputComponent from "./TextInputComponent";
import ColoredButton from "./ColoredButton";
import Colors from "../constants/Colors";
import { useTheme } from "../app/context/ThemeContext";
import { useState } from "react";
import ErrorComponent from "./ErrorComponent";
import { BlurView } from "expo-blur";

export default function DeclineModal({ onDecline, showModal, onClose }: { onDecline: (reason:string) => void, showModal: boolean, onClose: () => void }) {
    const { textColor, subtleBorderColor } = useTheme()
    const [reason, setReason] = useState('')
    const [loading, setLoading] = useState(false)
    const [errMessage, setErrMessage] = useState('')

    const handleDecline = ()=>{
        if(!reason){
            setErrMessage("Please provide reason")
            return
        }
        setLoading(true)
        onDecline(reason)
    }

    return (
        <Modal
            visible={showModal}
            animationType="slide"
            transparent={true}
            statusBarTranslucent={true}
            onRequestClose={onClose}
            presentationStyle="overFullScreen"
        >
            <BlurView intensity={50} tint="dark" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

                <View style={[styles.modalStyle, { backgroundColor: subtleBorderColor }]}>

                    <Text style={{ color: textColor, marginBottom: 16, fontWeight:'bold' }}>Please provide decline reason</Text>

                    <TextInputComponent onChangeText={setReason} multiline style={{height:120}} placeholder="Reason"/>

                    {errMessage!=""?<ErrorComponent errorsString={errMessage}/>:<></>}
                    <View style={{ flexDirection: 'row', gap: 16, width: "100%", justifyContent: 'space-between', marginTop:16}}>
                        <ColoredButton title={"Cancel"} style={{ backgroundColor: Colors.green, flex: 1 }} onPress={onClose} disabled={loading} />
                        <ColoredButton title={"Decline"} style={{ backgroundColor: Colors.red, flex: 1}} onPress={()=>handleDecline()} isLoading={loading}/>
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
        padding: 24,
    }
})