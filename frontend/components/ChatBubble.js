import { View, StyleSheet, Image } from "react-native"
import { Text, Card } from "react-native-paper"
import { theme } from "../theme"
import Highlighter from "react-native-highlight-words"

// Format timestamp to readable format
const formatTimestamp = (timestamp) => {
  if (!timestamp) return ""

  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

// Function to highlight search terms
const renderHighlightedText = (text, searchQuery) => {
  if (!searchQuery || !text) {
    return <Text style={styles.messageText}>{text}</Text>
  }

  return (
    <Highlighter
      highlightStyle={styles.highlight}
      searchWords={[searchQuery]}
      textToHighlight={text}
      style={styles.messageText}
    />
  )
}

const ChatBubble = ({ message, searchQuery = "" }) => {
  const isUser = message.role === "user"
  const timestamp = formatTimestamp(message.timestamp)

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
      {!isUser && (
        <View style={styles.modelInfoContainer}>
          <Text style={styles.modelName}>{message.modelId || "AI Assistant"}</Text>
          <Text style={styles.timestamp}>{timestamp}</Text>
        </View>
      )}

      <Card
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.aiBubble,
          message.isStreaming && styles.streamingBubble,
          message.error && styles.errorBubble,
        ]}
      >
        <Card.Content style={styles.bubbleContent}>
          {message.imageUri && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: message.imageUri }} style={styles.image} resizeMode="cover" />
            </View>
          )}

          {renderHighlightedText(message.content, searchQuery)}
        </Card.Content>
      </Card>

      {isUser && <Text style={styles.timestamp}>{timestamp}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    maxWidth: "85%",
  },
  userContainer: {
    alignSelf: "flex-end",
  },
  aiContainer: {
    alignSelf: "flex-start",
  },
  modelInfoContainer: {
    flexDirection: "row",
    marginBottom: 4,
    alignItems: "center",
  },
  modelName: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.primary,
    marginRight: 8,
  },
  bubble: {
    borderRadius: 18,
    elevation: 0,
  },
  userBubble: {
    backgroundColor: theme.colors.userBubble,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: theme.colors.aiBubble,
    borderBottomLeftRadius: 4,
  },
  streamingBubble: {
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  errorBubble: {
    backgroundColor: "#ffebee",
  },
  bubbleContent: {
    padding: 8,
  },
  messageText: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
    alignSelf: "flex-end",
  },
  highlight: {
    backgroundColor: "yellow",
  },
  imageContainer: {
    marginBottom: 8,
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
})

export default ChatBubble
