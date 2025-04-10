"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Keyboard,
  Text,
  LayoutAnimation,
  UIManager,
} from "react-native"
import { Appbar, TextInput, IconButton, Menu, Divider, Button, Searchbar, Portal, Dialog } from "react-native-paper"
import * as ImagePicker from "expo-image-picker"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { v4 as uuidv4 } from "uuid"
import { API_URL, DEFAULT_SYSTEM_MESSAGE } from "../config"
import ChatBubble from "../components/ChatBubble"
import ModelSelector from "../components/ModelSelector"

// Enable LayoutAnimation for Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

// Add error handling and display for API connection issues

// Add this near the top of the file, after the imports
const ErrorBanner = ({ message, onDismiss }) => {
  if (!message) return null

  return (
    <View style={styles.errorBanner}>
      <Text style={styles.errorText}>{message}</Text>
      <TouchableOpacity onPress={onDismiss}>
        <Text style={styles.dismissText}>Dismiss</Text>
      </TouchableOpacity>
    </View>
  )
}

// Add this to the ChatScreen component props
const ChatScreen = ({ navigation, route }) => {
  const { availableModels, initialError } = route.params || { availableModels: [] }

  // State
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState("")
  const [selectedModelId, setSelectedModelId] = useState("gemini-pro")
  const [selectedModel, setSelectedModel] = useState(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [imageUri, setImageUri] = useState(null)
  const [imageBase64, setImageBase64] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [menuVisible, setMenuVisible] = useState(false)
  const [searchVisible, setSearchVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [modelSelectorVisible, setModelSelectorVisible] = useState(false)
  const [isImagePickerVisible, setIsImagePickerVisible] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const [inputHeight, setInputHeight] = useState(40)

  // Add this to the state declarations
  const [errorMessage, setErrorMessage] = useState(initialError)

  // Refs
  const flatListRef = useRef(null)
  const abortControllerRef = useRef(null)
  const inputRef = useRef(null)

  // Effects
  useEffect(() => {
    // Find the selected model details
    const model = availableModels.find((m) => m.id === selectedModelId)
    setSelectedModel(model || null)

    // Check if the model supports images
    if (model && !model.supportsImage && imageUri) {
      // Clear image if model doesn't support it
      setImageUri(null)
      setImageBase64(null)
    }
  }, [selectedModelId, availableModels])

  useEffect(() => {
    // Initialize with a system message and assistant greeting
    const initializeChat = async () => {
      try {
        // Generate a new session ID
        const newSessionId = `session_${uuidv4()}`
        setSessionId(newSessionId)

        const initialMessages = [
          {
            id: uuidv4(),
            role: "system",
            content: DEFAULT_SYSTEM_MESSAGE,
            timestamp: new Date().toISOString(),
          },
          {
            id: uuidv4(),
            role: "assistant",
            content: "Hello! How can I help you today?",
            modelId: selectedModelId,
            timestamp: new Date().toISOString(),
          },
        ]

        setMessages(initialMessages)

        // Save initial chat to storage
        await AsyncStorage.setItem(
          `chat_${newSessionId}`,
          JSON.stringify({
            sessionId: newSessionId,
            messages: initialMessages,
            modelId: selectedModelId,
          }),
        )
      } catch (error) {
        console.error("Error initializing chat:", error)
      }
    }

    initializeChat()
  }, [])

  // Handle input focus changes
  const handleInputFocus = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setInputFocused(true)
  }

  const handleInputBlur = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setInputFocused(false)
  }

  // Helper Functions
  const pickImage = async (sourceType) => {
    setIsImagePickerVisible(false)

    // Check if the selected model supports images
    if (selectedModel && !selectedModel.supportsImage) {
      alert(`The selected model "${selectedModel.name}" does not support images.`)
      return
    }

    let result

    if (sourceType === "camera") {
      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      if (status !== "granted") {
        alert("Sorry, we need camera permissions to take a picture!")
        return
      }

      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      })
    } else {
      // Request media library permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to select an image!")
        return
      }

      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      })
    }

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0]
      setImageUri(asset.uri)
      setImageBase64(asset.base64)
    }
  }

  const sendMessage = async () => {
    if ((!messageInput.trim() && !imageUri) || isStreaming) return

    // Blur input and collapse it
    if (inputRef.current) {
      inputRef.current.blur()
    }
    setInputFocused(false)

    const userMessage = {
      id: uuidv4(),
      role: "user",
      content: messageInput.trim(),
      imageUri: imageUri,
      timestamp: new Date().toISOString(),
    }

    // Clear input
    setMessageInput("")
    Keyboard.dismiss()

    // Add user message to state
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)

    // Start AI response
    const aiMessage = {
      id: uuidv4(),
      role: "assistant",
      content: "",
      modelId: selectedModelId,
      timestamp: new Date().toISOString(),
      isStreaming: true,
    }

    setMessages([...updatedMessages, aiMessage])

    // Scroll to bottom
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true })
      }
    }, 100)

    // Create abort controller
    abortControllerRef.current = new AbortController()

    // Stream flag
    setIsStreaming(true)

    try {
      // Format messages for API
      const apiMessages = updatedMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

      // Send request
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          selectedModelId: selectedModelId,
          imageBase64: imageBase64,
          chatHistory: apiMessages,
          sessionId: sessionId,
        }),
        signal: abortControllerRef.current.signal,
      })

      // Reset image after sending
      setImageUri(null)
      setImageBase64(null)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to get response from AI")
      }

      // Stream response
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let aiResponseText = ""

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        // Parse the chunks
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const eventData = line.slice(6)

            if (eventData === "[DONE]") {
              continue
            }

            try {
              const parsedData = JSON.parse(eventData)

              if (parsedData.text) {
                aiResponseText += parsedData.text

                // Update the AI message
                setMessages((currentMessages) => {
                  const updatedMessages = [...currentMessages]
                  const aiMessageIndex = updatedMessages.findIndex((msg) => msg.id === aiMessage.id)

                  if (aiMessageIndex !== -1) {
                    updatedMessages[aiMessageIndex] = {
                      ...updatedMessages[aiMessageIndex],
                      content: aiResponseText,
                    }
                  }

                  return updatedMessages
                })
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e)
            }
          }
        }
      }

      // Finalize the AI message
      setMessages((currentMessages) => {
        const updatedMessages = [...currentMessages]
        const aiMessageIndex = updatedMessages.findIndex((msg) => msg.id === aiMessage.id)

        if (aiMessageIndex !== -1) {
          updatedMessages[aiMessageIndex] = {
            ...updatedMessages[aiMessageIndex],
            content: aiResponseText,
            isStreaming: false,
          }
        }

        return updatedMessages
      })

      // Save chat to storage
      await AsyncStorage.setItem(
        `chat_${sessionId}`,
        JSON.stringify({
          sessionId,
          messages: [
            ...updatedMessages,
            {
              ...aiMessage,
              content: aiResponseText,
              isStreaming: false,
            },
          ],
          modelId: selectedModelId,
        }),
      )
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Request was aborted")
      } else {
        // Find this line in the catch block:
        console.error("Error sending message:", error)

        // And add this after it:
        setErrorMessage(`Error: ${error.message || "Failed to communicate with AI service"}`)

        // Update AI message with error
        setMessages((currentMessages) => {
          const updatedMessages = [...currentMessages]
          const aiMessageIndex = updatedMessages.findIndex((msg) => msg.id === aiMessage.id)

          if (aiMessageIndex !== -1) {
            updatedMessages[aiMessageIndex] = {
              ...updatedMessages[aiMessageIndex],
              content: "Sorry, something went wrong. Please try again.",
              error: true,
              isStreaming: false,
            }
          }

          return updatedMessages
        })
      }
    } finally {
      setIsStreaming(false)
      abortControllerRef.current = null
    }
  }

  const stopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }

    // Mark all streaming messages as no longer streaming
    setMessages((currentMessages) =>
      currentMessages.map((msg) => (msg.isStreaming ? { ...msg, isStreaming: false } : msg)),
    )

    setIsStreaming(false)
  }

  const startNewChat = async () => {
    // Generate a new session ID
    const newSessionId = `session_${uuidv4()}`
    setSessionId(newSessionId)

    // Reset messages
    const initialMessages = [
      {
        id: uuidv4(),
        role: "system",
        content: DEFAULT_SYSTEM_MESSAGE,
        timestamp: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        role: "assistant",
        content: "Hello! How can I help you today?",
        modelId: selectedModelId,
        timestamp: new Date().toISOString(),
      },
    ]

    setMessages(initialMessages)
    setMenuVisible(false)

    // Save initial chat to storage
    await AsyncStorage.setItem(
      `chat_${newSessionId}`,
      JSON.stringify({
        sessionId: newSessionId,
        messages: initialMessages,
        modelId: selectedModelId,
      }),
    )
  }

  // Filter messages based on search query
  const filteredMessages =
    searchVisible && searchQuery
      ? messages.filter((msg) => msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
      : messages

  // Render message function for FlatList
  const renderItem = ({ item }) => <ChatBubble message={item} searchQuery={searchVisible ? searchQuery : ""} />

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : null}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <Appbar.Header>
        <Appbar.Action icon="menu" onPress={() => navigation.navigate("ChatHistory")} />
        <Appbar.Content title="MultiMind" />

        {isStreaming ? (
          <Appbar.Action icon="stop" onPress={stopGenerating} />
        ) : searchVisible ? (
          <Appbar.Action
            icon="close"
            onPress={() => {
              setSearchVisible(false)
              setSearchQuery("")
            }}
          />
        ) : (
          <>
            <Appbar.Action icon="magnify" onPress={() => setSearchVisible(true)} />
            <Appbar.Action icon="dots-vertical" onPress={() => setMenuVisible(true)} />
          </>
        )}

        <Menu visible={menuVisible} onDismiss={() => setMenuVisible(false)} anchor={{ x: 0, y: 0 }} style={styles.menu}>
          <Menu.Item title="New Chat" leadingIcon="plus" onPress={startNewChat} />
          <Divider />
          <Menu.Item
            title="View Chat History"
            leadingIcon="history"
            onPress={() => {
              setMenuVisible(false)
              navigation.navigate("ChatHistory")
            }}
          />
        </Menu>
      </Appbar.Header>

      {errorMessage && <ErrorBanner message={errorMessage} onDismiss={() => setErrorMessage(null)} />}

      {searchVisible && (
        <Searchbar
          placeholder="Search in conversation"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      )}

      <FlatList
        ref={flatListRef}
        data={filteredMessages.filter((msg) => msg.role !== "system")}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => {
          if (flatListRef.current && !searchVisible) {
            flatListRef.current.scrollToEnd({ animated: true })
          }
        }}
      />

      {imageUri && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          <IconButton
            icon="close"
            size={20}
            onPress={() => {
              setImageUri(null)
              setImageBase64(null)
            }}
            style={styles.imageCloseButton}
          />
        </View>
      )}

      {/* Dynamic Input Container */}
      <View style={[styles.inputContainer, inputFocused && styles.inputContainerFocused]}>
        {!inputFocused && (
          <IconButton
            icon="paperclip"
            size={24}
            onPress={() => setIsImagePickerVisible(true)}
            disabled={isStreaming || (selectedModel && !selectedModel.supportsImage)}
            style={styles.attachButton}
          />
        )}

        <TextInput
          ref={inputRef}
          value={messageInput}
          onChangeText={setMessageInput}
          placeholder={inputFocused ? "" : "Type a message..."}
          mode="outlined"
          multiline
          style={[styles.input, inputFocused && styles.inputFocused]}
          disabled={isStreaming}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onContentSizeChange={(e) => {
            const height = e.nativeEvent.contentSize.height
            setInputHeight(Math.min(Math.max(40, height), 120))
          }}
        />

        {!inputFocused ? (
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={() => setModelSelectorVisible(true)} style={styles.modelSelectorButton}>
              <Text style={styles.modelName} numberOfLines={1} ellipsizeMode="tail">
                {selectedModel ? selectedModel.name : "AI Model"}
              </Text>
            </TouchableOpacity>

            <IconButton
              icon={messageInput.trim() || imageUri ? "send" : "microphone"}
              size={24}
              onPress={sendMessage}
              disabled={(!messageInput.trim() && !imageUri) || isStreaming}
              style={styles.sendButton}
            />
          </View>
        ) : (
          <View style={styles.expandedToolbar}>
            <View style={styles.expandedToolbarRow}>
              <IconButton
                icon="paperclip"
                size={24}
                onPress={() => setIsImagePickerVisible(true)}
                disabled={isStreaming || (selectedModel && !selectedModel.supportsImage)}
              />

              <IconButton
                icon="image"
                size={24}
                onPress={() => pickImage("library")}
                disabled={isStreaming || (selectedModel && !selectedModel.supportsImage)}
              />

              <IconButton
                icon="camera"
                size={24}
                onPress={() => pickImage("camera")}
                disabled={isStreaming || (selectedModel && !selectedModel.supportsImage)}
              />

              <TouchableOpacity onPress={() => setModelSelectorVisible(true)} style={styles.expandedModelButton}>
                <Text style={styles.modelName} numberOfLines={1}>
                  {selectedModel ? selectedModel.name : "AI Model"}
                </Text>
              </TouchableOpacity>

              <IconButton
                icon={messageInput.trim() || imageUri ? "send" : "microphone"}
                size={28}
                onPress={sendMessage}
                disabled={(!messageInput.trim() && !imageUri) || isStreaming}
                style={styles.expandedSendButton}
              />
            </View>
          </View>
        )}
      </View>

      {/* Model Selector Dialog */}
      <ModelSelector
        visible={modelSelectorVisible}
        onDismiss={() => setModelSelectorVisible(false)}
        models={availableModels}
        selectedModelId={selectedModelId}
        onSelect={(modelId) => {
          setSelectedModelId(modelId)
          setModelSelectorVisible(false)
        }}
      />

      {/* Image Picker Dialog */}
      <Portal>
        <Dialog
          visible={isImagePickerVisible}
          onDismiss={() => setIsImagePickerVisible(false)}
          style={styles.imagePickerDialog}
        >
          <Dialog.Title>Add Image</Dialog.Title>
          <Dialog.Content>
            <Button mode="contained" icon="camera" onPress={() => pickImage("camera")} style={styles.imagePickerButton}>
              Take Photo
            </Button>
            <Button mode="contained" icon="image" onPress={() => pickImage("library")} style={styles.imagePickerButton}>
              Choose from Gallery
            </Button>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsImagePickerVisible(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {isStreaming && (
        <View style={styles.streamingIndicator}>
          <ActivityIndicator size="small" color="#1a73e8" />
          <Text style={styles.streamingText}>Generating...</Text>
          <Button mode="text" onPress={stopGenerating} compact>
            Stop
          </Button>
        </View>
      )}
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  inputContainerFocused: {
    flexDirection: "column",
    paddingBottom: 0,
  },
  input: {
    flex: 1,
    maxHeight: 80,
    fontSize: 16,
  },
  inputFocused: {
    minHeight: 80,
    maxHeight: 120,
    fontSize: 18,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: "top",
  },
  attachButton: {
    margin: 0,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  modelSelectorButton: {
    backgroundColor: "#f1f3f4",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    maxWidth: 130,
  },
  modelName: {
    fontSize: 12,
    color: "#5f6368",
  },
  sendButton: {
    margin: 0,
  },
  menu: {
    position: "absolute",
    right: 8,
    top: 40,
  },
  searchBar: {
    margin: 8,
  },
  imagePreviewContainer: {
    margin: 8,
    position: "relative",
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 4,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 4,
  },
  imageCloseButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  streamingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    position: "absolute",
    bottom: 60,
    alignSelf: "center",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  streamingText: {
    marginLeft: 8,
    marginRight: 12,
    color: "#3c4043",
  },
  imagePickerDialog: {
    borderRadius: 20,
  },
  imagePickerButton: {
    marginBottom: 12,
  },
  expandedToolbar: {
    width: "100%",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  expandedToolbarRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  expandedModelButton: {
    backgroundColor: "#f1f3f4",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flex: 1,
    marginHorizontal: 8,
  },
  expandedSendButton: {
    backgroundColor: "#e7f0ff",
    borderRadius: 20,
  },
  // Add this to the styles at the bottom of the file
  errorBanner: {
    backgroundColor: "#ffebee",
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ef9a9a",
  },
  errorText: {
    color: "#c62828",
    flex: 1,
    fontSize: 14,
  },
  dismissText: {
    color: "#c62828",
    fontWeight: "bold",
    marginLeft: 8,
  },
})

export default ChatScreen
