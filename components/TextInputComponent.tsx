import { TextInput, View, StyleSheet, TextInputProps } from "react-native";
import { useTheme } from "../app/context/ThemeContext";

export default function TextInputComponent(props: TextInputProps) {
    const { theme } = useTheme()
    return (
        <TextInput style={theme == "dark" ? styles.darkTextInput : styles.lighTextInput} placeholderTextColor={theme == "dark" ? "#636C7C" : "#C4C4C4"} {...props} />
    )
}
const styles = StyleSheet.create({
    formContainer: {
        padding: 10,
        gap: 10,
        width: "100%"
    },
    darkTextInput: {
        borderStyle: 'solid',
        borderColor: '#636C7C',
        borderWidth: 1,
        color: 'white',
        width:"100%",
        height: 50,
        padding: 10,
        borderRadius: 5
    },
    lighTextInput: {
        backgroundColor: 'white',
        color: "black",
        width:"100%",
        borderWidth: 1,
        borderColor:'#D9D9D9',
        height: 50,
        padding: 10,
        borderRadius: 5
    }
})