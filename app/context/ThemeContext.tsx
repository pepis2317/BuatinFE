import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { Appearance } from "react-native";
import Colors from "../../constants/Colors";
export const themeConfig = {
    light: {
        text: "black",
        background: Colors.lightBackground,
        foreground: Colors.offWhite,
        subtleBorder: Colors.darkerOffWhite,
        border: Colors.lightBackground,
    },
    dark: {
        text: "white",
        background: Colors.darkBackground,
        foreground: Colors.darkishBackground,
        subtleBorder: Colors.darkGray,
        border: Colors.darkBorder,
    },
};

interface ThemeProps {
    theme?: string,
    textColor?: string,
    backgroundColor?: string,
    foregroundColor?: string,
    subtleBorderColor?: string,
    borderColor?: string,
    toggleTheme?: () => void
}
const ThemeContext = createContext<ThemeProps>({})
export const useTheme = () => {
    return useContext(ThemeContext)
}
export default function ThemeProvider({ children }: any) {
    const [theme, setTheme] = useState("light");
    const [textColor, setTextColor] = useState("black");
    const [backgroundColor, setBackgroundColor] = useState(Colors.lightBackground);
    const [foregroundColor, setForegroundColor] = useState(Colors.offWhite);
    const [subtleBorderColor, setSubtleBorderColor] = useState(Colors.darkerOffWhite);
    const [borderColor, setBorderColor] = useState(Colors.lightBorder);
    const applyTheme = (mode: "light" | "dark") => {
        const t = themeConfig[mode];
        setTheme(mode);
        setTextColor(t.text);
        setBackgroundColor(t.background);
        setForegroundColor(t.foreground);
        setSubtleBorderColor(t.subtleBorder);
        setBorderColor(t.border);
    };

    useEffect(() => {
        const loadTheme = async () => {
            const saved = await AsyncStorage.getItem("theme");
            const systemTheme = Appearance.getColorScheme() || "light";
            const finalTheme = (saved as "light" | "dark") || systemTheme;

            applyTheme(finalTheme);
        };
        loadTheme();
    }, []);

    const toggleTheme = async () => {
        const newTheme = theme === "light" ? "dark" : "light";
        applyTheme(newTheme);
        await AsyncStorage.setItem("theme", newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, textColor, backgroundColor, foregroundColor, subtleBorderColor, borderColor, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}