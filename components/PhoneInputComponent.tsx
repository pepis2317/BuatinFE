import React, { useRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import PhoneInput, { ICountry, isValidPhoneNumber } from "react-native-international-phone-number";
import { useTheme } from "../app/context/ThemeContext";

export default function PhoneInputComponent({ defaultValue, onPhoneChange }: { defaultValue: string, onPhoneChange: (text: string) => void }) {
    const [selectedCountry, setSelectedCountry] = useState<null | ICountry>(null);
    const [inputValue, setInputValue] = useState('');
    const { theme } = useTheme()

    function handleInputValue(phoneNumber: string) {
        const callingCode = selectedCountry?.idd?.root ?? '';
        const phoneString = (callingCode + phoneNumber).replace(/\s/g, '').trim();

        onPhoneChange(phoneString);
        setInputValue(phoneNumber);
    }
    
    function handleSelectedCountry(country: ICountry) {
        setSelectedCountry(country);
    }

    return (
        <View>
            <PhoneInput
                theme={theme == "dark" ? "dark" : "light"}
                phoneInputStyles={{
                    container: {
                        backgroundColor: theme === "dark" ? undefined : 'white',
                        borderWidth: 1,
                        borderColor: theme === "dark" ? "#636C7C" : "#D9D9D9",
                        borderRadius: 8,
                        overflow: 'hidden',
                    },
                    flagContainer: {
                        backgroundColor: theme == "dark" ? '#3D4149' : '#E9E9E9',
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0,
                        justifyContent: 'center',
                    },
                    input: {
                        color: theme == "dark" ? 'white' : 'black'
                    }
                }}
                modalStyles={{
                    container: {
                        backgroundColor: theme === "dark" ? "#31363F" : "#F1F1F1",
                        borderWidth: 0,
                    },
                    searchInput: {
                        backgroundColor: theme === "dark" ? "#222831" : "white",
                        borderWidth: 0,
                    },
                    countryItem: {
                        backgroundColor: theme === "dark" ? "#3D4149" : "white",
                        borderWidth: 0,
                    },
                }}
                value={inputValue}
                onChangePhoneNumber={handleInputValue}
                selectedCountry={selectedCountry}
                defaultValue={defaultValue}
                defaultCountry="ID"
                onChangeSelectedCountry={handleSelectedCountry}
                keyboardType="number-pad"
                placeholder="Phone Number"
                placeholderTextColor={theme == "dark" ? "#636C7C" : "#C4C4C4"}
            />
            {/* {selectedCountry != null && isValidPhoneNumber(inputValue, selectedCountry) ? <></> : <Text style={theme == "dark" ? styles.darkText : styles.lightText}>Please input valid phone number.</Text>} */}
             {/* Reminder: replace with text appearance after input validation  */}

        </View>
    );
}
const styles = StyleSheet.create({
    darkText: {
        color: 'white',
        marginTop: 6
    },
    lightText: {
        color: 'black',
        marginTop: 6
    },

})