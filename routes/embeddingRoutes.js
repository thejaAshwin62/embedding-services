import express from 'express';
import { embedFeedbacks } from '../controllers/embeddingController.js';

const router = express.Router();

router.get('/embed-feedbacks', async (req, res) => {
  try {
    const results = await embedFeedbacks();
    res.json({
      message: "Embedding process completed",
      results: results,
    });
  } catch (error) {
    console.error("Error in embed-feedbacks:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

export default router; 