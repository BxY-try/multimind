import { GoogleGenerativeAI } from "@google/genai"
import dotenv from "dotenv"
import { Readable } from "stream"

dotenv.config()

const API_KEY = process.env.GOOGLE_API_KEY

if (!API_KEY) {
  console.error("GOOGLE_API_KEY is not defined in environment variables")
}

const genAI = new GoogleGenerativeAI(API_KEY)

/**
 * Processes messages into the format expected by Google's Generative AI API
 */
const formatMessages = (messages) => {
  // Extract system message if present
  const systemMessage = messages.find((msg) => msg.role === "system")?.content || ""

  // Filter to only user and assistant messages
  const conversation = messages
    .filter((msg) => ["user", "assistant"].includes(msg.role))
    .map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }))

  return { systemMessage, conversation }
}

/**
 * Handles image processing for Gemini models
 */
const processImageForGemini = (imageBase64) => {
  if (!imageBase64) return null

  // Check if the string already starts with a data URI scheme
  if (!imageBase64.startsWith("data:")) {
    // Prefix with data URI if not present
    imageBase64 = `data:image/jpeg;base64,${imageBase64}`
  }

  return {
    inlineData: {
      data: imageBase64.split(",")[1],
      mimeType: imageBase64.split(";")[0].split(":")[1],
    },
  }
}

export const streamChatCompletion = async (modelId, messages, imageBase64 = null) => {
  try {
    const model = genAI.getGenerativeModel({ model: modelId })
    const { systemMessage, conversation } = formatMessages(messages)

    // Start with system instructions if provided
    const prompt = []

    if (systemMessage) {
      prompt.push({ text: systemMessage })
    }

    // Get the last user message
    const lastUserMessage = [...messages].reverse().find((msg) => msg.role === "user")

    if (!lastUserMessage) {
      throw new Error("No user message found")
    }

    // If there's an image and the model supports images
    if (imageBase64) {
      const imageData = processImageForGemini(imageBase64)
      if (imageData) {
        prompt.push(imageData)
      }
    }

    // Add the text content of the last user message
    prompt.push({ text: lastUserMessage.content })

    // Generate content with chat history
    const result = await model.generateContentStream({
      contents: conversation.length > 1 ? conversation : [{ role: "user", parts: prompt }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    })

    // Return a Node.js Readable stream
    const stream = new Readable({
      read() {},
    })

    // Process the chunks as they come in
    for await (const chunk of result.stream) {
      const text = chunk.text()
      if (text) {
        stream.push(JSON.stringify({ text }))
      }
    }

    stream.push(null) // Signal the end of the stream
    return stream
  } catch (error) {
    console.error("Google AI service error:", error.message)
    throw error
  }
}
