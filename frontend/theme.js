import { DefaultTheme } from "react-native-paper"

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#1a73e8", // Google blue
    accent: "#4285F4",
    background: "#FFFFFF",
    surface: "#FFFFFF",
    text: "#3c4043",
    placeholder: "#5f6368",
    backdrop: "rgba(0, 0, 0, 0.5)",
    userBubble: "#e7f0ff",
    userBubbleText: "#1f1f1f",
    aiBubble: "#f8f9fa",
    aiBubbleText: "#3c4043",
    error: "#d93025",
  },
  roundness: 8,
  animation: {
    scale: 1.0,
  },
}
