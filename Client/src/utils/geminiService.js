import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyDYFkpm3F7VaiPo1fUc8Rt46MlTQDh4r2Q");

// Initialize chat model with configuration
const initializeChat = () => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash-8b",
    generationConfig: {
      maxOutputTokens: 2048,
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
    }
  });
  return model.startChat();
};

// Get response from Gemini in chat mode
export const getChatResponse = async (message, chatInstance = null) => {
  try {
    // If no chat instance is provided, create a new one
    const chat = chatInstance || initializeChat();
    const result = await chat.sendMessage(message);
    const response = await result.response;
    return {
      text: response.text(),
      chatInstance: chat
    };
  } catch (error) {
    console.error("Gemini Chat API Error:", error);
    throw error;
  }
};

// Get one-time response from Gemini (non-chat mode)
export const getGeminiResponse = async (prompt) => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash-8b",
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      }
    });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const createNewChat = () => {
  return initializeChat();
};
