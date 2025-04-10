import { getModelById } from "../config/models.js"
import * as googleAIService from "./googleAIService.js"
import * as openRouterService from "./openRouterService.js"
import * as alibabaService from "./alibabaService.js"

/**
 * Routes to the appropriate service based on the model provider
 */
export const streamChatCompletion = async (selectedModelId, messages, imageBase64 = null) => {
  try {
    // Get model details
    const modelConfig = getModelById(selectedModelId)

    // Check if model supports images
    if (imageBase64 && !modelConfig.supportsImage) {
      throw new Error(`Model ${modelConfig.name} does not support images`)
    }

    // Route to correct service based on provider
    switch (modelConfig.provider) {
      case "google":
        return await googleAIService.streamChatCompletion(modelConfig.apiModelId, messages, imageBase64)

      case "openrouter":
        return await openRouterService.streamChatCompletion(modelConfig.apiModelId, messages, imageBase64)

      case "alibaba":
        return await alibabaService.streamChatCompletion(modelConfig.apiModelId, messages, imageBase64)

      default:
        throw new Error(`Unknown provider: ${modelConfig.provider}`)
    }
  } catch (error) {
    console.error("AI Service error:", error.message)
    throw error
  }
}
