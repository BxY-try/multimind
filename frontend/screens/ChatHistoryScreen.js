"use client"

import { useState, useEffect } from "react"
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native"
import { Appbar, List, Divider, Text, Portal, Dialog, Button, ActivityIndicator } from "react-native-paper"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { API_URL } from "../config"

const ChatHistoryScreen = ({ navigation }) => {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false)
  const [selectedChat, setSelectedChat] = useState(null)

  useEffect(() => {
    loadChatHistory()
  }, [])

  const loadChatHistory = async () => {
    setLoading(true)

    try {
      // Try to fetch from API first
      const response = await fetch(`${API_URL}/history`)

      if (response.ok) {
        const data = await response.json()
        if (data.chats) {
          setChats(data.chats)
          setLoading(false)
          return
        }
      }

      // Fall back to local storage if API fails
      const keys = await AsyncStorage.getAllKeys()
      const chatKeys = keys.filter((key) => key.startsWith("chat_"))

      const chatData = []

      for (const key of chatKeys) {
        const chatString = await AsyncStorage.getItem(key)

        if (chatString) {
          const chat = JSON.parse(chatString)

          if (chat && chat.messages && chat.messages.length > 0) {
            // Find first non-system message for the title
            const firstMessage = chat.messages.find((msg) => msg.role !== "system") || {}
            const title = firstMessage.content || "New Chat"

            chatData.push({
              sessionId: chat.sessionId,
              title: title.substring(0, 50) + (title.length > 50 ? "..." : ""),
              modelId: chat.modelId || "unknown",
              updatedAt: Date.now(),
            })
          }
        }
      }

      setChats(chatData)
    } catch (error) {
      console.error("Error loading chat history:", error)
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = (chat) => {
    setSelectedChat(chat)
    setDeleteDialogVisible(true)
  }

  const deleteChat = async () => {
    if (!selectedChat) return

    try {
      // Try to delete from API
      const response = await fetch(`${API_URL}/history/${selectedChat.sessionId}`, {
        method: "DELETE",
      })

      // Also delete from local storage
      await AsyncStorage.removeItem(`chat_${selectedChat.sessionId}`)

      // Update state
      setChats(chats.filter((chat) => chat.sessionId !== selectedChat.sessionId))
    } catch (error) {
      console.error("Error deleting chat:", error)
    } finally {
      setDeleteDialogVisible(false)
      setSelectedChat(null)
    }
  }

  const loadChat = async (chat) => {
    try {
      let chatData

      // Try to get chat from API
      try {
        const response = await fetch(`${API_URL}/history/${chat.sessionId}`)

        if (response.ok) {
          const data = await response.json()
          if (data.chat) {
            chatData = data.chat
          }
        }
      } catch (apiError) {
        console.error("API error getting chat history:", apiError)
      }

      // Fall back to local storage
      if (!chatData) {
        const chatString = await AsyncStorage.getItem(`chat_${chat.sessionId}`)

        if (chatString) {
          chatData = JSON.parse(chatString)
        }
      }

      if (chatData && chatData.messages) {
        navigation.navigate("Chat", {
          sessionId: chat.sessionId,
          messages: chatData.messages,
          modelId: chatData.modelId,
        })
      }
    } catch (error) {
      console.error("Error loading chat:", error)
    }
  }

  const renderChatItem = ({ item }) => (
    <View>
      <List.Item
        title={item.title}
        description={`Model: ${item.modelId}`}
        left={(props) => <List.Icon {...props} icon="chat" />}
        right={(props) => (
          <TouchableOpacity onPress={() => confirmDelete(item)} style={styles.deleteButton}>
            <List.Icon {...props} icon="delete" />
          </TouchableOpacity>
        )}
        onPress={() => loadChat(item)}
        style={styles.listItem}
        titleNumberOfLines={1}
        descriptionNumberOfLines={1}
      />
      <Divider />
    </View>
  )

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Chat History" />
        <Appbar.Action icon="refresh" onPress={loadChatHistory} />
      </Appbar.Header>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading chats...</Text>
        </View>
      ) : chats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No chat history found</Text>
          <Button mode="contained" onPress={() => navigation.navigate("Chat")} style={styles.newChatButton}>
            Start New Chat
          </Button>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.sessionId}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Chat</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete this chat?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={deleteChat}>Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  listContainer: {
    flexGrow: 1,
  },
  listItem: {
    backgroundColor: "#ffffff",
  },
  deleteButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#5f6368",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    color: "#5f6368",
    marginBottom: 24,
  },
  newChatButton: {
    marginTop: 16,
  },
})

export default ChatHistoryScreen
