import { createConfig } from "@gluestack-ui/themed";

export const config = createConfig({
  tokens: {
    colors: {
      primary: "#348AFA",
      secondary: "#5CCFA3",
      backgroundLight: "#FFFFFF",
      backgroundDark: "#222831",
      textLight: "#31363F",
      error: "#EF4444",
    },
    radius: { sm: 6, md: 12, lg: 20 },
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
