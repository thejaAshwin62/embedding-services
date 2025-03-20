import { Pinecone } from "@pinecone-database/pinecone";
import { generateEmbedding } from '../utils/embeddingUtil.js';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

export async function queryFeedback(query) {
  try {
    const index = pinecone.index("multi-emb");
    
    const queryEmbedding = await generateEmbedding(query);

    const searchResults = await index.query({
      vector: queryEmbedding,
      topK: 1,
      includeMetadata: true,
    });

    if (searchResults.matches.length === 0 || searchResults.matches[0].score < 0.7) {
      return {
        found: false,
        message: "No relevant memory found for this query.",
        originalQuery: query
      };
    }

    const match = searchResults.matches[0];
    return {
      found: true,
      feedback: match.metadata.feedback,
      date: match.metadata.id_date,
      time: match.metadata.id_time,
      score: match.score,
      originalQuery: query
    };
  } catch (error) {
    console.error("Error in chat feedback query:", error);
    throw error;
  }
}
