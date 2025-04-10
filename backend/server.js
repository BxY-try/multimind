import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { router as chatRouter } from "./routes/chat.js"
import { router as historyRouter } from "./routes/history.js"
import { connectDatabase } from "./database/db.js"

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json({ limit: "50mb" })) // Increase limit for image uploads

// Add request logging middleware
app.use((req, res, next) => {
  const start = Date.now()
  res.on("finish", () => {
    const duration = Date.now() - start
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`)
  })
  next()
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err)
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  })
})

// Connect to database
try {
  await connectDatabase()
} catch (error) {
  console.error("Failed to connect to database:", error)
  // Continue running the server even if database connection fails
}

// Routes
app.use("/chat", chatRouter)
app.use("/history", historyRouter)

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "MultiMind AI Chat API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
