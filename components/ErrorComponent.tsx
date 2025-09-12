import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../app/context/ThemeContext";


export default function ErrorComponent({ errorsString }: { errorsString: string }) {
    const { theme } = useTheme()
    return (
        <View style={theme == "dark" ? styles.errorContainer : styles.lightErrorContainer}>
            <Text style={theme == "dark" ? { color: 'white', fontWeight: 'bold' } : { fontWeight: 'bold' }}>Error: </Text>
            {errorsString.split("; ").map((error, index) => (
                <Text key={index} style={theme == "dark" ? { color: 'white' } : {}}>{error}</Text>
            ))}
        </View>
    )
}
const styles = StyleSheet.create({
    errorContainer: {
        padding: 10,
        backgroundColor: '#31363F',
        borderWidth: 1,
        borderColor: '#f56565',
        borderRadius: 5,
        width: "100%"

    },
    lightErrorContainer: {
        padding: 10,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#f56565',
        borderRadius: 5,
        width: "100%"
    }
})