import mongoose from 'mongoose';

const userQuerySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  query: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  chatId: { type: String, required: true }
});

export default mongoose.model('UserQuery', userQuerySchema); 