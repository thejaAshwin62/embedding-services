import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  id: { type: String, required: true },

  content: { type: String, required: true },

  sender: { type: String, required: true },

  timestamp: { type: String, required: true },

  userQuery: { type: String },

  originalQuery: { type: String },
});

const chatSchema = new mongoose.Schema({
  id: { type: String, required: true },

  title: { type: String, required: true },

  messages: [messageSchema],

  createdAt: { type: Date, required: true },
});

const chatHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },

  chats: [chatSchema],
});

export default mongoose.model("ChatHistory", chatHistorySchema);
