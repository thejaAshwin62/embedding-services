import mongoose from "mongoose";

const globalMessageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  content: { type: String, required: true },
  sender: { type: String, required: true },
  timestamp: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
});

const globalChatHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  messages: [globalMessageSchema],
  createdAt: { type: Date, default: Date.now },
  userName: { type: String, default: "User" },
});

globalChatHistorySchema.index({ userId: 1 });

export default mongoose.model("GlobalChatHistory", globalChatHistorySchema);
