import mongoose from "mongoose";

const userQuerySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  query: {
    type: String,
    required: true,
  },
  chatId: {
    type: String,
    default: "default", // Provide a default value
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("UserQuery", userQuerySchema);
