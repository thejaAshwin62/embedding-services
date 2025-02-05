import UserPreferences from "../models/userPreferencesModel.js";

export const userPreferencesService = {
  async getUserPreferences(userId) {
    try {
      let preferences = await UserPreferences.findOne({ userId });

      if (!preferences) {
        preferences = await UserPreferences.create({
          userId,

          aiName: "AI Assistant",

          userName: "User",
        });
      }

      return preferences;
    } catch (error) {
      console.error("Error getting user preferences:", error);

      throw error;
    }
  },

  async updatePreferences(userId, updates) {
    try {
      const preferences = await UserPreferences.findOneAndUpdate(
        { userId },

        { $set: updates },

        { new: true, upsert: true }
      );

      return preferences;
    } catch (error) {
      console.error("Error updating user preferences:", error);

      throw error;
    }
  },
};
