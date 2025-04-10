"use client"

import { useState, useEffect } from "react"
import { StatusBar } from "expo-status-bar"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { Provider as PaperProvider } from "react-native-paper"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { View, Text, ActivityIndicator } from "react-native"
import ChatScreen from "./screens/ChatScreen"
import ChatHistoryScreen from "./screens/ChatHistoryScreen"
import { theme } from "./theme"
import { API_URL } from "./config"

const Stack = createStackNavigator()

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [availableModels, setAvailableModels] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    // Fetch available models on startup
    const fetchModels = async () => {
      try {
        console.log("Fetching models from:", API_URL)
        const response = await fetch(`${API_URL}/chat/models`)

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`)
        }

        const data = await response.json()
        if (data.models) {
          setAvailableModels(data.models)

          // Cache the models
          await AsyncStorage.setItem("availableModels", JSON.stringify(data.models))
        } else {
          throw new Error("Invalid response format: missing models array")
        }
      } catch (error) {
        console.error("Error fetching models:", error)
        setError(error.message)

        // Try to load from cache if network request fails
        try {
          const cachedModels = await AsyncStorage.getItem("availableModels")
          if (cachedModels) {
            const parsedModels = JSON.parse(cachedModels)
            setAvailableModels(parsedModels)
            console.log("Using cached models:", parsedModels.length)
          } else {
            // If no cached models, use fallback models
            const fallbackModels = [
              {
                id: "gemini-pro",
                name: "Gemini 2.5 Pro (Fallback)",
                supportsImage: true,
                description: "Advanced multimodal model (offline fallback)",
              },
              {
                id: "gemini-flash",
                name: "Gemini Flash (Fallback)",
                supportsImage: true,
                description: "Fast, efficient model (offline fallback)",
              },
            ]
            setAvailableModels(fallbackModels)
            console.log("Using fallback models")
          }
        } catch (e) {
          console.error("Error loading cached models:", e)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchModels()
  }, [])

  if (isLoading) {
    return (
      <View
        style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.background }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 20, color: theme.colors.text }}>Loading MultiMind AI...</Text>
      </View>
    )
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          initialRouteName="Chat"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Chat" component={ChatScreen} initialParams={{ availableModels, initialError: error }} />
          <Stack.Screen name="ChatHistory" component={ChatHistoryScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  )
}
