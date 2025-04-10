import express from "express"
import { streamChatCompletion } from "../services/aiService.js"
import Chat from "../models/Chat.js"
import { getSupportedModels, getModelById } from "../config/models.js"

export const router = express.Router()

// Get available models
router.get("/models", (req, res) => {
  try {
    const models = getSupportedModels()
    res.status(200).json({ models })
  } catch (error) {
    console.error("Error fetching models:", error)
    res.status(500).json({ error: "Failed to fetch models" })
  }
})

// Update the stream chat completion route to handle errors better
router.post("/", async (req, res) => {
  try {
    const { message, selectedModelId, imageBase64, chatHistory = [], sessionId } = req.body

    if (!message || !selectedModelId) {
      return res.status(400).json({ error: "Message and model ID are required" })
    }

    // Validate model ID
    try {
      getModelById(selectedModelId)
    } catch (error) {
      return res.status(400).json({ error: error.message })
    }

    // Format messages for AI service
    const messages = [...chatHistory]

    // Add user message to history
    messages.push({
      role: "user",
      content: message,
      timestamp: new Date(),
    })

    // Get completion stream
    let stream
    try {
      stream = await streamChatCompletion(selectedModelId, messages, imageBase64)
    } catch (error) {
      console.error("AI service error:", error)
      return res.status(500).json({
        error: "AI service error",
        message: error.message || "Failed to get response from AI service",
      })
    }

    // Set up response headers for streaming
    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")

    let assistantResponse = ""

    // Stream the response to the client
    stream.on("data", (chunk) => {
      try {
        const data = JSON.parse(chunk.toString())
        assistantResponse += data.text || ""
        res.write(`data: ${JSON.stringify(data)}\n\n`)
      } catch (e) {
        console.error("Error parsing stream chunk:", e)
        res.write(`data: ${JSON.stringify({ error: "Error parsing response" })}\n\n`)
      }
    })

    // Handle end of stream
    stream.on("end", async () => {
      // Add assistant response to history
      messages.push({
        role: "assistant",
        content: assistantResponse,
        timestamp: new Date(),
      })

      // Save chat history if sessionId is provided
      if (sessionId) {
        try {
          let chat = await Chat.findOne({ sessionId })

          if (chat) {
            // Update existing chat
            chat.messages = messages
            chat.modelId = selectedModelId
            await chat.save()
          } else {
            // Create new chat
            chat = new Chat({
              sessionId,
              modelId: selectedModelId,
              title: message.substring(0, 50), // Use start of first message as title
              messages,
            })
            await chat.save()
          }
        } catch (dbError) {
          console.error("Database error:", dbError)
          // Continue even if database save fails
        }
      }

      res.write("data: [DONE]\n\n")
      res.end()
    })

    // Handle errors
    stream.on("error", (error) => {
      console.error("Stream error:", error)
      res.write(`data: ${JSON.stringify({ error: error.message || "Stream error" })}\n\n`)
      res.end()
    })

    // Handle client disconnect
    req.on("close", () => {
      if (stream && !stream.destroyed) {
        stream.destroy()
      }
    })
  } catch (error) {
    console.error("Chat error:", error)
    res.status(500).json({ error: error.message || "Internal server error" })
  }
})

export default router
