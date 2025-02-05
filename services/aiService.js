import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error(
    "Error: API key is missing. Please set the GEMINI_API_KEY environment variable."
  );
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function initializeModel() {
  try {
    const model = await genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });
    return model;
  } catch (error) {
    console.error("Error fetching generative model:", error);
    throw error;
  }
}

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

export const chatSession = await initializeModel()
  .then((model) =>
    model.startChat({
      generationConfig,
    })
  )
  .catch((error) => {
    console.error("Error starting chat session:", error);
  }); 