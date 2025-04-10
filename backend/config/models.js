/**
 * AI Model Configuration
 * This file maps frontend model IDs to API-specific details
 */

export const models = {
  // Gemini Models (Google AI)
  "gemini-pro": {
    name: "Gemini 2.5 Pro",
    provider: "google",
    apiModelId: "gemini-2.5-pro-exp-03-25",
    supportsImage: true,
    description: "Advanced multimodal model with comprehensive language and reasoning capabilities",
  },
  "gemini-flash": {
    name: "Gemini Flash",
    provider: "google",
    apiModelId: "gemini-2.0-flash-thinking-exp-01-21",
    supportsImage: true,
    description: "Fast, efficient model optimized for quick responses",
  },

  // DeepSeek Models (via OpenRouter)
  "deepseek-zero": {
    name: "DeepSeek R1 Zero",
    provider: "openrouter",
    apiModelId: "deepseek/deepseek-r1-zero",
    supportsImage: true,
    description: "Powerful image understanding and reasoning model",
  },
  "deepseek-chat": {
    name: "DeepSeek Chat V3",
    provider: "openrouter",
    apiModelId: "deepseek/deepseek-chat-v3-0324",
    supportsImage: false,
    description: "Advanced conversation model with excellent reasoning abilities",
  },

  // Qwen Models (Alibaba Cloud)
  "qwen-vl": {
    name: "Qwen 2.5 VL",
    provider: "alibaba",
    apiModelId: "qwen2.5-vl-32b-instruct",
    supportsImage: true,
    description: "Vision-language model with strong visual understanding",
  },
  "qwen-plus": {
    name: "Qwen Plus",
    provider: "alibaba",
    apiModelId: "qwen-plus",
    supportsImage: false,
    description: "Balanced language model with good performance on diverse tasks",
  },
  "qwen-max": {
    name: "Qwen Max",
    provider: "alibaba",
    apiModelId: "qwen-max",
    supportsImage: true,
    description: "High-performance multimodal model for complex tasks",
  },
}

// Function to get supported models for the frontend dropdown
export const getSupportedModels = () => {
  return Object.entries(models).map(([id, model]) => ({
    id,
    name: model.name,
    supportsImage: model.supportsImage,
    description: model.description,
  }))
}

// Function to get model details by ID
export const getModelById = (modelId) => {
  const model = models[modelId]
  if (!model) {
    throw new Error(`Model ID not found: ${modelId}`)
  }
  return model
}
