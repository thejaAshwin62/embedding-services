import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import embeddingRoutes from "./routes/embeddingRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import chatHistoryRoutes from "./routes/chatHistoryRoutes.js";
import userQueryRoutes from "./routes/userQueryRoutes.js";
import userPreferencesRoutes from "./routes/userPreferencesRoutes.js";
import globalChatRoutes from "./routes/globalChatRoutes.js";
import statsRouter from "./routes/statsRouter.js";
import errorHandlerMiddleware from "./middleware/errorHandler.js";
import cors from "cors";
import fs from "fs";
import loggerMiddleware from "./middleware/loggerHandler.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(loggerMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// Ensure uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
};
connectDB();

// Routes
app.use("/api/v1", searchRoutes);
app.use("/api/v1/feedback", feedbackRoutes);
app.use("/api/v1/stats", statsRouter);
app.use("/api/v1/embedding", embeddingRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/chat-history", chatHistoryRoutes);
app.use("/api/v1/user-queries", userQueryRoutes);
app.use("/api/v1/user-preferences", userPreferencesRoutes);
app.use("/api/v1/global-chat", globalChatRoutes);

// app.use("/", (req, res) => {
//   res.send("Welcome to the Embedding Service API");
// });

app.use("*", (req, res) => {
  res.status(200).json({ msg: "embedding service" });
});

// Error handling
app.use(errorHandlerMiddleware);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
