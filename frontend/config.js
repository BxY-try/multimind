import { Platform } from "react-native"
import Constants from "expo-constants"
import { __DEV__ } from "./environment"

const getApiUrl = () => {
  if (__DEV__) {
    // 1. Priority 1: Environment Variable (works with Expo Go and EAS)
    if (Constants.expoConfig?.extra?.apiUrl) {
      return Constants.expoConfig.extra.apiUrl
    }

    // 2. Priority 2: Codespaces or Expo Public Env
    if (process.env.EXPO_PUBLIC_API_URL) {
      return process.env.EXPO_PUBLIC_API_URL
    }

    // 3. Priority 3: Auto-detect IP via Expo
    try {
      // Handle different Expo SDK versions
      const debuggerHost =
        Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost || Constants.manifest2?.hostUri

      if (debuggerHost) {
        const localIP = debuggerHost.split(":")[0]
        if (localIP) return `http://${localIP}:5000`
      }
    } catch (e) {
      console.warn("Auto IP detection failed:", e)
    }

    // 4. Fallback based on platform
    if (Platform.OS === "web") {
      return "http://localhost:5000"
    } else if (Platform.OS === "ios") {
      return "http://localhost:5000" // For iOS simulator
    }
    return "http://10.0.2.2:5000" // For Android emulator
  }

  // Production URL - update this with your actual production API URL
  return "https://api.multimind-ai-chat.com"
}

export const API_URL = getApiUrl()

// Default system message for new chats
export const DEFAULT_SYSTEM_MESSAGE = "You are MultiMind AI, a helpful, creative, and intelligent assistant."

// Log the API URL for debugging
console.log("API URL:", API_URL)
