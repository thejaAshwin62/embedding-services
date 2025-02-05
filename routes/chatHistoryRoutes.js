import express from 'express';
import { chatHistoryService } from '../services/chatHistoryService.js';

const router = express.Router();

// Get user's chat history
router.get('/:userId', async (req, res) => {
  try {
    const chats = await chatHistoryService.getUserChats(req.params.userId);
    res.json({ chats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save new chat
router.post('/:userId', async (req, res) => {
  try {
    await chatHistoryService.saveChat(req.params.userId, req.body.chat);
    res.status(201).json({ message: 'Chat saved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update existing chat
router.put('/:userId/:chatId', async (req, res) => {
  try {
    await chatHistoryService.saveChat(req.params.userId, req.body.chat);
    res.json({ message: 'Chat updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete chat
router.delete('/:userId/:chatId', async (req, res) => {
  try {
    await chatHistoryService.deleteChat(req.params.userId, req.params.chatId);
    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear all chats
router.delete('/:userId', async (req, res) => {
  try {
    await chatHistoryService.clearAllChats(req.params.userId);
    res.json({ message: 'All chats cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 