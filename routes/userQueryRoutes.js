import express from 'express';
import { userQueryService } from '../services/userQueryService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { userId, query, chatId } = req.body;
    const savedQuery = await userQueryService.saveQuery(userId, query, chatId);
    res.status(201).json(savedQuery);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const queries = await userQueryService.getQueriesByUserId(req.params.userId);
    res.json(queries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 