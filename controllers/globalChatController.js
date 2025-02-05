import GlobalChatHistory from '../models/globalChatHistoryModel.js';

export const getGlobalMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const chatHistory = await GlobalChatHistory.findOne({ userId });
    res.json(chatHistory?.messages || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const saveGlobalMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { message } = req.body;
    
    let chatHistory = await GlobalChatHistory.findOne({ userId });
    
    if (!chatHistory) {
      chatHistory = new GlobalChatHistory({ 
        userId,
        messages: []
      });
    }
    
    chatHistory.messages.push(message);
    await chatHistory.save();
    
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const clearGlobalMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const chatHistory = await GlobalChatHistory.findOne({ userId });
    if (chatHistory) {
      chatHistory.messages = [];
      await chatHistory.save();
    }
    res.json({ message: 'Global chat cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 