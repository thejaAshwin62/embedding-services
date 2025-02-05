import { queryFeedback } from '../services/chatService.js';

export const chat = async (req, res, next) => {
  try {
    const { query } = req.body;

    if (!query) {
      const error = new Error('Query is required');
      error.status = 400;
      throw error;
    }

    const result = await queryFeedback(query);

    if (!result.found) {
      return res.status(404).json({
        message: result.message,
        originalQuery: query
      });
    }

    return res.json({
      message: `On ${result.date} at ${result.time}, your feedback was: ${result.feedback}`,
      similarity_score: result.score,
      feedback: result.feedback,
      date: result.date,
      time: result.time,
      originalQuery: query
    });
  } catch (error) {
    next(error);
  }
}; 