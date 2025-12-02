import { Modal, View, StyleSheet, Text, Dimensions } from "react-native";
import TextInputComponent from "./TextInputComponent";
import ColoredButton from "./ColoredButton";
import Colors from "../constants/Colors";
import { useTheme } from "../app/context/ThemeContext";
import { useState } from "react";
import ErrorComponent from "./ErrorComponent";

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
        >
            <View style={[styles.modalStyle, { backgroundColor: subtleBorderColor }]}>
                <Text style={{ color: textColor, marginBottom: 10, marginTop: 20, fontWeight:'bold' }}>Please provide decline reason</Text>
                <TextInputComponent onChangeText={setReason} placeholder="Reason"/>
                {errMessage!=""?<ErrorComponent errorsString={errMessage}/>:<></>}
                <View style={{ flexDirection: 'row', gap: 0, width: "100%", justifyContent: 'space-between', marginTop:10}}>
                    <ColoredButton title={"Cancel"} style={{ backgroundColor: Colors.green, width: '48%' }} onPress={onClose} disabled={loading} />
                    <ColoredButton title={"Decline"} style={{ backgroundColor: Colors.peach, width: '48%' }} onPress={()=>handleDecline()} isLoading={loading}/>
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