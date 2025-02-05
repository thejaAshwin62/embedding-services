import { MongoClient } from "mongodb";
import { Pinecone } from "@pinecone-database/pinecone";
import { HfInference } from "@huggingface/inference";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI must be defined in environment variables");
}

const mongoClient = new MongoClient(process.env.MONGODB_URI);
const dbName = "test";
const collectionName = "feedbacks";

// Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || "",
});

// Initialize Hugging Face with retry mechanism
const hf = new HfInference(process.env.HF_ACCESS_TOKEN);
const HUGGINGFACE_MODEL = "intfloat/multilingual-e5-large";

function generateTimeRange(time) {
  const [hours, minutes] = time.split(":").map(Number);
  const startMinutes = Math.floor(minutes / 15) * 15;
  const endMinutes = startMinutes + 15;

  const startTime = `${hours.toString().padStart(2, "0")}:${startMinutes
    .toString()
    .padStart(2, "0")}:00`;
  const endTime =
    endMinutes === 60
      ? `${(hours + 1).toString().padStart(2, "0")}:00:00`
      : `${hours.toString().padStart(2, "0")}:${endMinutes
          .toString()
          .padStart(2, "0")}:00`;

  return {
    start: startTime,
    end: endTime,
    range: `${startTime}-${endTime}`,
  };
}

async function generateEmbedding(text, maxRetries = 3) {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await hf.featureExtraction({
        model: HUGGINGFACE_MODEL,
        inputs: text,
        options: {
          waitForModel: true,
          useCache: false,
        },
      });
      return response;
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      lastError = error;
      // Wait before retrying (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }
  throw new Error(
    `Failed after ${maxRetries} attempts. Last error: ${lastError.message}`
  );
}

export const embedFeedbacks = async () => {
  let client;
  try {
    client = await mongoClient.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const index = pinecone.index("multi-emb");

    const feedbacks = await collection.find({ embedded: false }).toArray();
    console.log(`Found ${feedbacks.length} non-embedded feedbacks`);

    const results = [];
    for (const feedback of feedbacks) {
      try {
        if (feedback.id_date && feedback.id_time && feedback.feedback) {
          const timeRange = generateTimeRange(feedback.id_time);
          const combinedInput = `Date: ${feedback.id_date}, TimeRange: ${timeRange.range}, Time: ${feedback.id_time}, Feedback: ${feedback.feedback}`;

          console.log("Generating embedding for:", combinedInput);
          const embeddings = await generateEmbedding(combinedInput);

          if (!embeddings || !Array.isArray(embeddings)) {
            throw new Error("Invalid embedding response");
          }

          // Format location data for Pinecone metadata
          const metadata = {
            id_date: feedback.id_date,
            id_time: feedback.id_time,
            timeRange: timeRange.range,
            timeStart: timeRange.start,
            timeEnd: timeRange.end,
            feedback: feedback.feedback,
          };

          // Add location data if available, only including simple fields
          if (feedback.location) {
            metadata.location_city = feedback.location.city || '';
            metadata.location_region = feedback.location.region || '';
            metadata.location_country = feedback.location.country || '';
            metadata.location_area = feedback.location.area || '';
            metadata.location_street = feedback.location.street || '';
            metadata.location_locality = feedback.location.locality || '';
            metadata.location_zip = feedback.location.zip || '';
            metadata.location_address = feedback.location.formatted_address || '';
          }

          await index.upsert([
            {
              id: feedback._id.toString(),
              values: embeddings,
              metadata: metadata,
            },
          ]);

          await collection.updateOne(
            { _id: feedback._id },
            {
              $set: {
                embedded: true,
                timeRange: timeRange.range,
                timeStart: timeRange.start,
                timeEnd: timeRange.end,
              },
            }
          );

          results.push({
            id: feedback._id,
            status: "success",
            timeRange: timeRange.range,
          });

          console.log("Successfully embedded feedback:", feedback._id);
        }
      } catch (error) {
        console.error("Error processing feedback:", feedback._id, error);
        results.push({
          id: feedback._id,
          status: "error",
          error: error.message,
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Error in embedFeedbacks:", error);
    throw error;
  } finally {
    if (client) {
      await client.close();
    }
  }
};
