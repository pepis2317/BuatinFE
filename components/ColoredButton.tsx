import { TouchableOpacity, TouchableOpacityProps, Text, StyleSheet, ActivityIndicator } from "react-native";
interface ButtonProps extends TouchableOpacityProps {
    title: string;
    style?: any;
    isLoading?: boolean;
}
export default function ColoredButton({ title, style, isLoading, ...rest }: ButtonProps) {
    return (
        <TouchableOpacity style={[styles.button, style]}{...rest} disabled={isLoading}>
            {isLoading ? <ActivityIndicator size="small" color={"white"} /> : <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>{title}</Text>}

        </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
    button: {
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5
    }
})

