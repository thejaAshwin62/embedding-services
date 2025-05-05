import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";
import dotenv from "dotenv";
import { generateCaptionFromText } from "./DeepSeekService.js";
import { FACE_SERVICE } from "../utils/config.js";
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Function to convert file to base64 for Gemini
async function fileToGenerativePart(imagePath, mimeType) {
  const imageData = await fs.promises.readFile(imagePath);
  return {
    inlineData: {
      data: imageData.toString('base64'),
      mimeType: mimeType || 'image/jpeg'
    },
  };
}

export class ImageService {
  constructor(apiUrl, apiToken) {
    if (!apiUrl || !apiToken) {
      throw new Error("API URL and token are required");
    }
    this.apiUrl = apiUrl;
    this.apiToken = apiToken;
    this.faceApiUrl = `${FACE_SERVICE}/upload`;
    
    // Initialize Gemini
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    
    console.log("Face Service URL configured as:", this.faceApiUrl);
  }

  async analyzeWithGeminiVision(imagePath) {
    try {
      console.log('Processing with Gemini Vision...');
      
      const model = this.genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        generationConfig: {
          temperature: 0.6,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 1536,
        },
      });
      
      const imagePart = await fileToGenerativePart(imagePath);

      const prompt = `Analyze this image and provide a detailed but clear description in this format:

SETTING: Describe when and where this takes place
MAIN FOCUS: What's the key activity or event happening
PEOPLE & ACTIONS: Who's involved and what they're doing
DETAILS: List 2-3 specific, interesting details
MOOD: Describe the overall feeling of the scene

Make each section 1-2 sentences. Be specific but clear.`;

      const result = await model.generateContent([{
        text: prompt
      }, imagePart]);

      const response = await result.response;
      let text = response.text();
      text = text.replace(/(SETTING|MAIN FOCUS|PEOPLE & ACTIONS|DETAILS|MOOD):/g, '\n$1:');
      
      return text;
    } catch (error) {
      console.error("Error in Gemini Vision analysis:", error);
      return "A scene captured in the image.";
    }
  }

  async generateCaption(filename) {
    try {
      if (!fs.existsSync(filename)) {
        throw new Error("File not found");
      }

      // Get face recognition data first
      console.log("\n=== Starting Face Recognition ===");
      const faceData = await this.getFaceEmbedding(filename);
      console.log("Face Recognition Result:", faceData);
      console.log("=== End of Face Recognition ===\n");

      // Get Gemini Vision analysis
      console.log("\n=== Starting Gemini Vision Analysis ===");
      const geminiAnalysis = await this.analyzeWithGeminiVision(filename);
      console.log("Gemini Vision Analysis Output:");
      console.log(geminiAnalysis);
      console.log("=== End of Gemini Vision Analysis ===\n");

      // Create a fresh prompt for final caption
      const freshPrompt = `Generate a comprehensive description based on this analysis:

${geminiAnalysis}

${faceData.match && faceData.match !== "unknown person" ? `Note: The person in this image is identified as ${faceData.match}.` : ""}

Requirements:
- Keep it concise but detailed (4-6 sentences)
- Focus on key observations
- Be direct and natural
- Make it engaging and clear
${faceData.match && faceData.match !== "unknown person" ? `- Use the person's name (${faceData.match}) in the description` : ""}`;

      // Get fresh caption using DeepSeekService
      console.log("\n=== Starting DeepSeek Caption Generation ===");
      console.log("Sending prompt to DeepSeek:");
      console.log(freshPrompt);
      const finalCaption = await generateCaptionFromText(freshPrompt);
      console.log("\nDeepSeek Generated Caption:");
      console.log(finalCaption);
      console.log("=== End of DeepSeek Caption Generation ===\n");

      if (!finalCaption) {
        console.warn("No caption generated from DeepSeek");
        return {
          caption: "A scene captured in the image.",
          faceData: { match: "unknown person" }
        };
      }

      return {
        caption: finalCaption,
        faceData: faceData
      };
    } catch (error) {
      console.error("Error generating caption:", error);
      return {
        caption: "A scene captured in the image.",
        faceData: { match: "unknown person" }
      };
    }
  }

  async getFaceEmbedding(filename) {
    try {
      if (!fs.existsSync(filename)) {
        throw new Error("File not found");
      }

      const formData = new FormData();
      formData.append("image", fs.createReadStream(filename));

      // First API call to get face embedding
      console.log("\n=== Starting /upload Request ===");
      console.log("Request URL:", this.faceApiUrl);
      console.log("Request Method: POST");
      console.log("Request Headers:", { "Content-Type": "multipart/form-data" });
      
      const response = await this.retryFaceApiCall(this.faceApiUrl, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("\n=== /upload Response ===");
      console.log("Status:", response.status);
      console.log("Response Body:", JSON.stringify(result, null, 2));

      if (!result.success || !result.embedding) {
        console.log("\n=== No Face Detected ===");
        return { 
          success: false,
          embedding: null, 
          match: "unknown person",
          message: "No face detected in image"
        };
      }

      // Second API call to match face with the embedding
      const matchUrl = `${FACE_SERVICE}/match-face`;
      const matchRequestBody = {
        embedding: result.embedding
      };

      console.log("\n=== Starting /match-face Request ===");
      console.log("Request URL:", matchUrl);
      console.log("Request Method: POST");
      console.log("Request Headers:", { "Content-Type": "application/json" });
      console.log("Request Body:", JSON.stringify(matchRequestBody, null, 2));

      const matchResponse = await this.retryFaceApiCall(
        matchUrl,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json"
          },
          body: JSON.stringify(matchRequestBody)
        }
      );

      const matchResult = await matchResponse.json();
      console.log("\n=== /match-face Response ===");
      console.log("Status:", matchResponse.status);
      console.log("Response Body:", JSON.stringify(matchResult, null, 2));

      // Check if we have a valid match with score >= 0.90
      if (matchResult.match && matchResult.score >= 0.90) {
        console.log("\n=== Face Match Found ===");
        return {
          success: true,
          embedding: result.embedding,
          match: matchResult.match,
          score: matchResult.score,
          timestamp: matchResult.timestamp || new Date().toISOString()
        };
      }

      console.log("\n=== No Match Found ===");
      return { 
        success: false,
        embedding: result.embedding, 
        match: "unknown person",
        message: "No match found"
      };
    } catch (error) {
      console.error("\n=== Error in Face Recognition ===");
      console.error("Error Details:", error.message);
      return {
        success: false,
        embedding: null,
        match: "unknown person",
        message: error.message
      };
    }
  }

  async retryFaceApiCall(url, options, maxRetries = 3) {
    let attempt = 0;
    let lastError;
    
    while (attempt < maxRetries) {
      try {
        console.log(`\nFace API call attempt ${attempt + 1}/${maxRetries} to ${url}`);
        console.log("Request options:", {
          method: options.method,
          headers: options.headers,
          bodySize: options.body ? (options.body instanceof FormData ? 'FormData' : JSON.stringify(options.body).length) : 0
        });

        const response = await fetch(url, options);
        
        if (response.ok) {
          console.log(`✅ Successful face API response from ${url} on attempt ${attempt + 1}`);
          return response;
        }
        
        const errorText = await response.text();
        lastError = new Error(`Status ${response.status}: ${errorText.substring(0, 100)}...`);
        console.warn(`❌ Face API call failed with status ${response.status}:`, errorText);
      } catch (error) {
        lastError = error;
        console.warn(`❌ Face API call error on attempt ${attempt + 1}:`, error.message);
      }
      
      attempt++;
      if (attempt < maxRetries) {
        const delay = 15000; // 15 seconds
        console.log(`⏳ Waiting ${delay/1000} seconds before retry ${attempt + 1}...`);
        await wait(delay);
      }
    }
    
    throw lastError || new Error(`Face API call failed after ${maxRetries} attempts`);
  }

  async cleanup(filepath) {
    try {
      if (fs.existsSync(filepath)) {
        await fs.promises.unlink(filepath);
        console.log("Successfully cleaned up file:", filepath);
      } else {
        console.warn("File not found during cleanup:", filepath);
      }
    } catch (error) {
      console.error("Error cleaning up file:", error);
      throw error;
    }
  }
}
