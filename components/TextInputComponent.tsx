import { TextInput, View, StyleSheet, TextInputProps, StyleProp, TextStyle } from "react-native";
import { useTheme } from "../app/context/ThemeContext";

type Props = TextInputProps & {
  style?: StyleProp<TextStyle>;
};

export default function TextInputComponent({ style, ...props }:Props) {
    const { theme } = useTheme()
    const base = theme == "dark" ? styles.darkTextInput : styles.lighTextInput
    return (
        <TextInput style={[base, style, { fontSize: 16, paddingHorizontal: 16 }]} placeholderTextColor={theme == "dark" ? "#636C7C" : "#C4C4C4"} {...props} />
    )
}

const styles = StyleSheet.create({
    formContainer: {
        padding: 16,
        gap: 12,
        width: "100%"
    },
    darkTextInput: {
        borderStyle: 'solid',
        borderColor: '#636C7C',
        borderWidth: 1,
        color: 'white',
        width:"100%",
        height: 45,
        paddingHorizontal: 16,
        borderRadius: 6
    },
    lighTextInput: {
        backgroundColor: 'white',
        color: "black",
        width:"100%",
        borderWidth: 1,
        borderColor:'#D9D9D9',
        height: 45,
        paddingHorizontal: 16,
        borderRadius: 6
    }
})