# MultiMind AI Chat

A production-ready mobile application built with Expo (React Native) and Node.js that integrates with multiple AI models including Google's Gemini, DeepSeek, and Alibaba's Qwen.

![MultiMind AI Chat](https://placeholder.svg?height=300&width=600&text=MultiMind+AI+Chat)

## Features

- 🤖 **Multiple AI Model Support**: Seamlessly switch between models from Google (Gemini), DeepSeek, and Alibaba (Qwen)
- 💬 **Real-time Streaming Responses**: Watch AI responses appear in real-time
- 📷 **Image Analysis**: Upload images for AI analysis (for supported models)
- 📱 **Polished UI/UX**: Beautiful interface built with React Native Paper
- 🔍 **In-chat Search**: Quickly find previous messages
- 💾 **Persistent Chat History**: Conversations stored in MongoDB with local fallback
- 🌐 **Offline Support**: Continue using the app even without internet connection
- 🔄 **Dynamic Input**: Expandable message input area with adaptive UI
- 🚀 **EAS Build Support**: Ready for production deployment with Expo Application Services

## Project Structure
\`\`\```
multimind-ai-chat/
├── README.md                      # Project documentation
├── .devcontainer/                 # GitHub Codespaces configuration
│   └── devcontainer.json          # Dev container configuration
├── .gitignore                     # Git ignore file
│
├── backend/                       # Node.js Express backend
│   ├── config/                    # Configuration files
│   │   └── models.js              # AI model configuration and mapping
│   │
│   ├── database/                  # Database connection and utilities
│   │   └── db.js                  # MongoDB connection setup
│   │
│   ├── models/                    # MongoDB schemas
│   │   └── Chat.js                # Chat and message schema
│   │
│   ├── routes/                    # API routes
│   │   ├── chat.js                # Chat API endpoints
│   │   └── history.js             # Chat history endpoints
│   │
│   ├── services/                  # AI provider integrations
│   │   ├── aiService.js           # Unified service for all AI models
│   │   ├── alibabaService.js      # Integration with Alibaba Qwen models
│   │   ├── googleAIService.js     # Integration with Google Gemini models
│   │   └── openRouterService.js   # Integration with DeepSeek via OpenRouter
│   │
│   ├── .env.example               # Environment variable template
│   ├── package.json               # Backend dependencies
│   └── server.js                  # Express server entry point
│
└── frontend/                      # Expo React Native app
    ├── assets/                    # Images, fonts, and other static assets
    │   ├── icon.png               # App icon
    │   └── splash.png             # Splash screen
    │
    ├── components/                # Reusable UI components
    │   ├── ChatBubble.js          # Message bubble component
    │   └── ModelSelector.js       # AI model selection dialog
    │
    ├── screens/                   # Main app screens
    │   ├── ChatScreen.js          # Primary chat interface
    │   └── ChatHistoryScreen.js   # Chat history listing
    │
    ├── app.json                   # Expo configuration
    ├── App.js                     # Main application component
    ├── config.js                  # Frontend configuration (API URL, etc.)
    ├── environment.js             # Environment detection helper
    ├── package.json               # Frontend dependencies
    └── theme.js                   # UI theme configuration
\`\`\```

## Key Components

### Backend Components

- **server.js**: Main entry point that initializes Express, connects to MongoDB, and sets up routes
- **models.js**: Maps frontend model IDs to API-specific details and provides helper functions
- **Chat.js**: MongoDB schema for storing chat history with message content and metadata
- **chat.js**: API endpoints for sending messages to AI models and streaming responses
- **history.js**: API endpoints for managing chat history (create, read, delete)
- **aiService.js**: Routes requests to the appropriate AI provider based on the selected model
- **googleAIService.js**: Handles requests to Google's Gemini API with proper formatting
- **openRouterService.js**: Handles requests to DeepSeek models via OpenRouter API
- **alibabaService.js**: Handles requests to Alibaba's Qwen API

### Frontend Components

- **App.js**: Main component that sets up navigation and theme
- **ChatScreen.js**: Primary interface for chatting with AI models, featuring:
  - Dynamic expandable input field
  - Real-time streaming responses
  - Image attachment functionality
  - Model selection
  - Search functionality
- **ChatHistoryScreen.js**: Interface for viewing, selecting, and deleting past conversations
- **ChatBubble.js**: Component for rendering chat messages with proper styling
- **ModelSelector.js**: Dialog for selecting AI models with descriptions
- **environment.js**: Helper for environment detection (development vs production)
- **config.js**: Dynamic configuration for API URLs based on environment

## Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- API keys for:
  - Google AI (Gemini)
  - OpenRouter (DeepSeek)
  - Alibaba Cloud (Qwen)

## Setup Instructions

### Package Manager

This project uses npm as the package manager. Please use npm consistently to avoid dependency issues with multiple lock files.

### Backend Setup

1. Navigate to the backend directory:
   \`\`\```bash
   cd backend
   \`\`\```

2. Install dependencies:
   \`\`\```bash
   npm install
   \`\`\```

3. Configure environment variables:
   \`\`\```bash
   cp .env.example .env
   \`\`\```

4. Edit the `.env` file with your API keys and database connection:
   \`\`\```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/multimind
   GOOGLE_API_KEY=your_google_api_key
   OPENROUTER_API_KEY=your_openrouter_api_key
   ALIBABA_API_KEY=your_alibaba_api_key
   \`\`\```

5. Start the development server:
   \`\`\```bash
   npm run dev
   \`\`\```

### Frontend Setup

1. Navigate to the frontend directory:
   \`\`\```bash
   cd frontend
   \`\`\```

2. Install dependencies:
   \`\`\```bash
   npm install
   \`\`\```

3. The API URL in `config.js` is now dynamically determined:
   - For local web/simulator: `http://localhost:5000`
   - For physical devices: Auto-detected from Expo environment
   - For Codespaces: Uses the forwarded URL automatically via `EXPO_PUBLIC_API_URL`

4. Start the Expo development server with tunnel for testing:
   \`\`\```bash
   npm run tunnel
   \`\`\```

5. For debugging with detailed error information:
   \`\`\```bash
   npm run debug
   \`\`\```

6. Use the Expo Go app on your phone or an emulator to view the application by scanning the QR code.

## EAS Build and Deployment

This project is configured for EAS (Expo Application Services) for production builds and updates.

### Setting Up EAS

1. Login to your Expo account:
   \`\`\```bash
   eas login
   \`\`\```

2. Configure your project:
   \`\`\```bash
   eas build:configure
   \`\`\```

3. Update the `app.json` file with your project ID and owner information.

### Building for Testing

To create a development build with debugging capabilities:

\`\`\```bash
npm run build:preview
\`\`\```

### Building for Production

To create a production-ready build:

\`\`\```bash
npm run build:production
\`\`\```

### Submitting to App Stores

\`\`\```bash
npm run submit
\`\`\```

### Deploying Updates

After making changes to your app, you can push updates without rebuilding:

\`\`\```bash
npm run update
\`\`\```

## API Endpoints

### Chat API

- `GET /chat/models`: Retrieves available AI models
  \`\`\```javascript
  // Response format
  {
    "models": [
      {
        "id": "gemini-pro",
        "name": "Gemini Pro",
        "supportsImage": true,
        "description": "..."
      },
      // Other models...
    ]
  }
  \`\`\```

- `POST /chat`: Sends a message to an AI model and streams the response
  \`\`\```javascript
  // Request body
  {
    "message": "Hello, AI!",
    "selectedModelId": "gemini-pro",
    "imageBase64": "base64_encoded_image", // Optional
    "chatHistory": [], // Optional
    "sessionId": "unique_session_id" // Optional
  }
  \`\`\```

### History API

- `GET /history`: Retrieves all chat session metadata
- `GET /history/:sessionId`: Gets a specific chat session with all messages
- `POST /history`: Creates a new chat session
- `DELETE /history/:sessionId`: Deletes a chat session

## Key Features Implementation

### Dynamic Input Field

The chat input field expands when focused and collapses when blurred, providing a better user experience:

- When collapsed: Shows a simple input with attachment icon on the left and model selector on the right
- When expanded: Shows a larger input with a toolbar below containing attachment options and model selector

This behavior is implemented in `ChatScreen.js` using the `inputFocused` state and React Native's `LayoutAnimation`.

### Real-time Streaming

AI responses are streamed in real-time using Server-Sent Events (SSE):

1. The frontend sends a request to `/chat`
2. The backend routes to the appropriate AI service
3. The AI service returns a readable stream
4. The Express server pipes this stream to the client
5. The frontend parses the incoming chunks and updates the UI incrementally

### Image Support

The app checks if the selected model supports images and provides appropriate UI:

- Image picker accessible from the attachment icon
- Image preview before sending
- Proper encoding and transmission to the AI model
- Model-specific image preprocessing

## GitHub Codespaces Setup

This project is configured for GitHub Codespaces with the included `.devcontainer/devcontainer.json` file.

### Using Codespaces

1. Click the "Code" button on the GitHub repository
2. Select the "Codespaces" tab
3. Click "Create codespace on main"

The devcontainer will automatically:
- Set up a Node.js 18 environment
- Install necessary tools like Expo CLI
- Install all project dependencies
- Forward necessary ports
- Set up environment variables for Expo to connect to the backend

### Running in Codespaces

1. Start the backend server:
   \`\`\```bash
   cd backend
   npm run dev
   \`\`\```

2. In another terminal, start the frontend with tunnel for testing:
   \`\`\```bash
   cd frontend
   npm run tunnel
   \`\`\```

3. For the best experience in Codespaces:
   \`\`\```bash
   cd frontend
   npm run web
   \`\`\```
   This will launch the web version of the app which is accessible through the forwarded port.

### Environment Variables in Codespaces

For sensitive values like API keys, use GitHub Codespaces Secrets:

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Codespaces
3. Add the following secrets:
   - `MONGODB_URI`
   - `GOOGLE_API_KEY`
   - `OPENROUTER_API_KEY`
   - `ALIBABA_API_KEY`

## Troubleshooting

### Common Issues

1. **Connection to backend fails**:
   - Verify that the backend server is running
   - Check the console logs for the detected API URL
   - For physical devices, ensure you're using the tunnel option (`npm run tunnel`)
   - In Codespaces, ensure the ports are properly forwarded

2. **Images not working with AI models**:
   - Verify that the selected model supports images
   - Check that the image is properly encoded in Base64
   - Ensure the image size is not too large (< 10MB recommended)

3. **MongoDB connection issues**:
   - Check that MongoDB is running
   - Verify the connection string in the .env file
   - Ensure network connectivity to the database server

4. **EAS build failures**:
   - Ensure you have the latest EAS CLI installed
   - Verify your Expo account has proper permissions
   - Check that your app.json is properly configured

5. **Debugging errors**:
   - Use `npm run debug` to start the app with enhanced debugging
   - Check the console logs for detailed error messages
   - For backend issues, check the server logs

## License

MIT
