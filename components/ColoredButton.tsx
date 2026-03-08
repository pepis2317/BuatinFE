import { TouchableOpacity, TouchableOpacityProps, Text, StyleSheet, ActivityIndicator } from "react-native";
interface ButtonProps extends TouchableOpacityProps {
    title: string;
    style?: any;
    isLoading?: boolean;
}
export default function ColoredButton({ title, style, isLoading, disabled, ...rest }: ButtonProps) {
    return (
        <TouchableOpacity style={[styles.button, style]}{...rest} disabled={isLoading || disabled}>
            {isLoading ? <ActivityIndicator size="small" color={"white"} /> : 
                <Text style={{ color: disabled?'gray':'white', fontWeight: 'bold', textAlign: 'center' }}>{title}</Text>
            }
        </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
    button:{
        padding:16,
        alignItems:'center',
        justifyContent:'center',
        borderRadius:8,
        fontSize: 16,
        fontWeight: "bold",
    }
})

