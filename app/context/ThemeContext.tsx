import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { Appearance } from "react-native";

interface ThemeProps {
    theme?: string,
    toggleTheme?: () => void
}
const ThemeContext = createContext<ThemeProps>({})
export const useTheme = () => {
    return useContext(ThemeContext)
}
export default function ThemeProvider({ children }: any) {
    const [theme, setTheme] = useState("light");

    useEffect(() => {
        const loadTheme = async () => {
            const savedTheme = await AsyncStorage.getItem("theme");
            if (savedTheme) {
                setTheme(savedTheme);
            } else {
                const systemTheme = Appearance.getColorScheme();
                setTheme(systemTheme || "light");
            }
        };
        loadTheme();
    }, []);


    const toggleTheme = async () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        await AsyncStorage.setItem("theme", newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}