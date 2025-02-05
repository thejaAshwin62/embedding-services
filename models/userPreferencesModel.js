import mongoose from 'mongoose';



const userPreferencesSchema = new mongoose.Schema({

  userId: { type: String, required: true, unique: true },

  aiName: { type: String, default: "AI Assistant" },

  userName: { type: String, default: "User" }

});



export default mongoose.model('UserPreferences', userPreferencesSchema); 
