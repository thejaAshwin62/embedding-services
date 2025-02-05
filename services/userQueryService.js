import UserQuery from '../models/userQueryModel.js';

export const userQueryService = {
  async saveQuery(userId, query, chatId) {
    try {
      const newQuery = new UserQuery({
        userId,
        query,
        chatId
      });
      await newQuery.save();
      return newQuery;
    } catch (error) {
      console.error('Error saving user query:', error);
      throw error;
    }
  },

  async getQueriesByUserId(userId) {
    try {
      return await UserQuery.find({ userId }).sort({ timestamp: -1 });
    } catch (error) {
      console.error('Error getting user queries:', error);
      throw error;
    }
  }
}; 