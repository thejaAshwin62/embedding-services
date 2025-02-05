import express from 'express';
import { getGlobalMessages, saveGlobalMessage, clearGlobalMessages } from '../controllers/globalChatController.js';

const router = express.Router();

router.get('/:userId', getGlobalMessages);
router.post('/:userId', saveGlobalMessage);
router.delete('/:userId', clearGlobalMessages);

export default router; 