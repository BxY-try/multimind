import OpenAI from "openai"
import dotenv from "dotenv"
import { Readable } from "stream"

dotenv.config()

const API_KEY = process.env.OPENROUTER_API_KEY

if (!API_KEY) {
  console.error("OPENROUTER_API_KEY is not defined in environment variables")
}

const openai = new OpenAI({
  apiKey: API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://multimind-ai-chat.app",
    "X-Title": "MultiMind AI Chat App",
  },
})

/**
 * Format messages for OpenRouter API (OpenAI format)
 */
const formatMessages = (messages) => {
  // OpenRouter uses standard OpenAI format, so we can pass messages directly
  return messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }))
}

/**
 * Process image for OpenRouter API
 */
const processImageForOpenRouter = (imageBase64, messages) => {
  if (!imageBase64) return messages

  // Ensure we have a standard base64 format without data URI prefix
  const base64Data = imageBase64.includes("base64,") ? imageBase64.split("base64,")[1] : imageBase64

  // Find the last user message to attach the image to
  const lastUserMessageIndex = messages.findLastIndex((msg) => msg.role === "user")

  if (lastUserMessageIndex === -1) return messages

  const updatedMessages = [...messages]
  updatedMessages[lastUserMessageIndex] = {
    ...updatedMessages[lastUserMessageIndex],
    content: [
      {
        type: "text",
        text: updatedMessages[lastUserMessageIndex].content,
      },
      {
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${base64Data}`,
        },
      },
    ],
  }

  return updatedMessages
}

export const streamChatCompletion = async (modelId, messages, imageBase64 = null) => {
  try {
    let formattedMessages = formatMessages(messages)

    // Add image to message if provided
    if (imageBase64) {
      formattedMessages = processImageForOpenRouter(imageBase64, formattedMessages)
    }

    const response = await openai.chat.completions.create({
      model: modelId,
      messages: formattedMessages,
      stream: true,
      temperature: 0.7,
      max_tokens: 2048,
    })

    // Create a Node.js Readable stream
    const stream = new Readable({
      read() {},
    })

    // Process the streaming response
    for await (const chunk of response) {
      if (chunk.choices[0]?.delta?.content) {
        stream.push(JSON.stringify({ text: chunk.choices[0].delta.content }))
      }
    }

    stream.push(null)
    return stream
  } catch (error) {
    console.error("OpenRouter service error:", error.message)
    throw error
  }
}
