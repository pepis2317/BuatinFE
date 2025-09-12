import { useEffect, useState } from "react";
import { ScrollView, Text, Switch, View, StyleSheet } from "react-native";
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store'
import { useTheme } from "../context/ThemeContext";
import TopBar from "../../components/TopBar";
export const USER_LOCATION_KEY = "user_location"
export default function Settings() {
    
    const { theme, toggleTheme } = useTheme()
    const [isSaved, setSaved] = useState(false)
    const getCurrentLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status != 'granted') {
            console.log('Permission to access location was denied');
            return;
        }
        let location = await Location.getCurrentPositionAsync({});
        await SecureStore.setItemAsync(USER_LOCATION_KEY, JSON.stringify(location))
    }
    const getSavedLocation = async () => {
        const location = await SecureStore.getItemAsync(USER_LOCATION_KEY)
        if (location) {
            setSaved(true)
        } else {
            setSaved(false)
        }
    }
    const handleLocationToggle = async () => {
        if (!isSaved) {
            getCurrentLocation()
            setSaved(true)
        } else {
            await SecureStore.deleteItemAsync(USER_LOCATION_KEY)
            setSaved(false)
        }
    }

    useEffect(() => {
        getSavedLocation()
    }, [])
    return (
        <View>
            <TopBar title={"Settings"} showBackButton={true}/>
            <ScrollView>
                <View style={theme == "dark" ? styles.darkOption : styles.lightOption}>
                    <Text style={theme == "dark" ? { color: "white" } : {}}>Change Theme</Text>
                    <Switch
                        trackColor={{ false: '#767577', true: '#5CCFA3' }}
                        thumbColor={'white'}
                        onValueChange={toggleTheme}
                        value={theme == "dark"}
                    />
                </View>
                <View style={theme == "dark" ? styles.darkOption : styles.lightOption}>
                    <Text style={theme == "dark" ? { color: "white" } : {}}>Toggle Location Sharing</Text>
                    <Switch
                        trackColor={{ false: '#767577', true: '#5CCFA3' }}
                        thumbColor={'white'}
                        onValueChange={handleLocationToggle}
                        value={isSaved}
                    />
                </View>
            </ScrollView>
        </View>

    )
}
const styles = StyleSheet.create({
    darkOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        paddingLeft: 15,
        paddingRight: 15,

        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#31363F'
    },
    lightOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        paddingLeft: 15,
        paddingRight: 15,

        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#D9D9D9'
    }
})