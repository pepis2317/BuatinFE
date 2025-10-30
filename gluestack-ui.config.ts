import { createConfig } from "@gluestack-ui/themed";

export const config = createConfig({
  tokens: {
    colors: {
      primary: "#1E3231",
      secondary: "#485665",
      backgroundLight: "#FFFFFF",
      backgroundDark: "#222222",
      textLight: "#31363F",
      error: "#EF4444",
    },
    radius: { sm: 6, md: 12, lg: 24 },
    spacing: { sm: 8, md: 16, lg: 24 },
  },
  components: {
    Button: {
      variants: {
        solid: {
          bg: "$primary",
          _text: { color: "$white" },
        },
      },
      baseStyle: {
        borderRadius: "$md",
      },
    },
    Input: {
      baseStyle: {
        borderRadius: "$md",
      },
    },
    Alert: {
      baseStyle: {
        borderRadius: "$sm",
      },
    },
  },
} as any);

export type Config = typeof config;
