import express from "express"
import Chat from "../models/Chat.js"

export const router = express.Router()

// Get all chat sessions
router.get("/", async (req, res) => {
  try {
    // Return just the session metadata, not all messages
    const chats = await Chat.find(
      {},
      {
        sessionId: 1,
        title: 1,
        modelId: 1,
        createdAt: 1,
        updatedAt: 1,
        _id: 0,
      },
    ).sort({ updatedAt: -1 })

    res.status(200).json({ chats })
  } catch (error) {
    console.error("Error fetching chat history:", error)
    res.status(500).json({ error: "Failed to fetch chat history" })
  }
})

// Get a specific chat session with all messages
router.get("/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params
    const chat = await Chat.findOne({ sessionId })

    if (!chat) {
      return res.status(404).json({ error: "Chat session not found" })
    }

    res.status(200).json({ chat })
  } catch (error) {
    console.error("Error fetching chat session:", error)
    res.status(500).json({ error: "Failed to fetch chat session" })
  }
})

// Create a new chat session
router.post("/", async (req, res) => {
  try {
    const { title, modelId } = req.body

    // Generate a unique session ID
    const sessionId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`

    const chat = new Chat({
      sessionId,
      title: title || "New Chat",
      modelId: modelId || "gemini-pro", // Default model
      messages: [
        {
          role: "system",
          content: "You are MultiMind AI, a helpful, creative, and intelligent assistant.",
          timestamp: new Date(),
        },
      ],
    })

    await chat.save()

    res.status(201).json({
      sessionId: chat.sessionId,
      title: chat.title,
      modelId: chat.modelId,
      createdAt: chat.createdAt,
    })
  } catch (error) {
    console.error("Error creating chat session:", error)
    res.status(500).json({ error: "Failed to create chat session" })
  }
})

// Delete a chat session
router.delete("/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params
    const result = await Chat.deleteOne({ sessionId })

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Chat session not found" })
    }

    res.status(200).json({ message: "Chat session deleted successfully" })
  } catch (error) {
    console.error("Error deleting chat session:", error)
    res.status(500).json({ error: "Failed to delete chat session" })
  }
})

export default router
