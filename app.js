import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import path from 'path';
import feedbackRoutes from './routes/feedbackRoutes.js';
import embeddingRoutes from './routes/embeddingRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import chatHistoryRoutes from './routes/chatHistoryRoutes.js';
import userQueryRoutes from './routes/userQueryRoutes.js';
import userPreferencesRoutes from './routes/userPreferencesRoutes.js';
import globalChatRoutes from './routes/globalChatRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import cors from "cors";
import fs from 'fs';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure tmp directory exists
if (!fs.existsSync('tmp')) {
  fs.mkdirSync('tmp');
}

// Database connection with retry logic
const connectDB = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Connected to MongoDB');
      return;
    } catch (err) {
      console.error(`Connection attempt ${i + 1} failed:`, err.message);
      if (i === retries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
// Routes
app.use('/api/v1', searchRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/api/v1/embedding', embeddingRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/chat-history', chatHistoryRoutes);
app.use('/api/v1/user-queries', userQueryRoutes);
app.use('/api/v1/user-preferences', userPreferencesRoutes);
app.use('/api/v1/global-chat', globalChatRoutes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;