import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

// MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/multimind"

export const connectDatabase = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      console.log("MongoDB connected successfully")
    }
  } catch (error) {
    console.error("MongoDB connection error:", error.message)
    process.exit(1)
  }
}

export const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect()
    console.log("MongoDB disconnected")
  } catch (error) {
    console.error("MongoDB disconnect error:", error.message)
  }
}
