import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";
import dotenv from "dotenv";
import { generateCaptionFromText } from "./DeepSeekService.js";
import { FACE_SERVICE } from "../utils/config.js";

dotenv.config();

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class ImageService {
  constructor(apiUrl, apiToken) {
    if (!apiUrl || !apiToken) {
      throw new Error("API URL and token are required");
    }
    this.apiUrl = apiUrl;
    this.apiToken = apiToken;
    this.objectDetectionUrl =
      "https://router.huggingface.co/hf-inference/models/facebook/detr-resnet-50";
    // Add fallback object detection APIs
    this.fallbackDetectionApis = [
      "https://router.huggingface.co/hf-inference/models/facebook/detr-resnet-101",
      "https://router.huggingface.co/hf-inference/models/microsoft/resnet-50",
    ];
    // Ensure we're using the correct URL with /upload endpoint
    this.faceApiUrl = `${FACE_SERVICE}/upload`;
    
    console.log("Face Service URL configured as:", this.faceApiUrl);
  }

  async generateCaption(filename) {
    try {
      if (!fs.existsSync(filename)) {
        throw new Error("File not found");
      }

      const data = fs.readFileSync(filename);
      
      // Use retryFetch with increased timeout and retries
      const response = await this.retryFetch(
        this.apiUrl,
        {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            "Content-Type": "application/octet-stream",
          },
          method: "POST",
          body: data,
        },
        3, // 3 retries
        2000, // 2s initial delay
        20000 // 20s timeout
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.warn("Image caption API error:", errorText);
        // Continue with a default caption
        return "A scene captured in the image.";
      }

      const result = await response.json();
      const imageDetails = result[0]?.generated_text;

      console.log("Image details from salesforce api:", imageDetails);
      if (!imageDetails) {
        console.warn("No details generated from image");
        return "A scene captured in the image.";
      }

      // Create a fresh prompt that emphasizes new generation
      const freshPrompt = `Generate a completely new description for this image, focusing on key observations.
Base your description ONLY on these current details: ${imageDetails}

Requirements:
- Keep it short and sweet (max 4-6 sentences)
- Focus on key observations
- Be direct and concise
- Make it natural and observational
- Do not reference any previous descriptions`;

      // Get fresh caption using DeepSeekService
      const caption = await generateCaptionFromText(freshPrompt);

      if (!caption) {
        console.warn("No caption generated from DeepSeek");
        return "A scene captured in the image.";
      }

      console.log("Generated fresh caption:", caption);

      return caption;
    } catch (error) {
      console.error("Error generating caption:", error);
      // Return a default caption instead of throwing
      return "A scene captured in the image.";
    }
  }

  async detectObjects(filename, currentApiIndex = 0) {
    try {
      if (!fs.existsSync(filename)) {
        throw new Error("File not found");
      }

      // Determine which API to use
      let currentApi = this.objectDetectionUrl;
      if (currentApiIndex > 0) {
        if (currentApiIndex - 1 < this.fallbackDetectionApis.length) {
          currentApi = this.fallbackDetectionApis[currentApiIndex - 1];
          console.log(
            `Trying fallback object detection API #${currentApiIndex}: ${currentApi}`
          );
        } else {
          throw new Error("All object detection APIs failed");
        }
      }

      const imageData = fs.readFileSync(filename);

      try {
        console.log(`Starting object detection request to ${currentApi}`);
        // Use the enhanced retryFetch method with more retries and longer timeouts
        const response = await this.retryFetch(
          currentApi,
          {
            headers: {
              Authorization: `Bearer ${this.apiToken}`,
              "Content-Type": "application/octet-stream",
            },
            method: "POST",
            body: imageData,
          },
          4,
          2000,
          60000
        ); // 4 retries, starting with 2s delay, 60s timeout

        console.log("Parsing object detection response...");
        const result = await response.json();
        console.log(`Successfully detected ${result.length} objects`);
        return result.map((item) => item.label);
      } catch (error) {
        console.warn(
          `Object detection API failed (${currentApi}): ${error.message}`
        );

        // If this API failed, try the next one
        if (currentApiIndex < this.fallbackDetectionApis.length + 1) {
          console.log("Falling back to alternative object detection API...");
          // Wait a bit before trying the next API to avoid overwhelming the system
          await wait(3000);
          return this.detectObjects(filename, currentApiIndex + 1);
        }

        // If all APIs failed, throw error
        throw new Error(
          `All object detection APIs failed. Last error: ${error.message}`
        );
      }
    } catch (error) {
      console.error("Error detecting objects:", error);
      throw error;
    }
  }

  async retryFetch(
    url,
    options,
    retries = 5,
    initialDelay = 1000,
    timeout = 30000
  ) {
    let lastError;
    for (let i = 0; i < retries; i++) {
      try {
        // Add timeout to fetch using AbortController
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const fetchOptions = {
          ...options,
          signal: controller.signal,
        };

        console.log(`Attempt ${i + 1}/${retries} for ${url}`);
        const response = await fetch(url, fetchOptions);
        clearTimeout(timeoutId);

        if (response.ok) {
          console.log(`Successful response from ${url} on attempt ${i + 1}`);
          return response;
        }

        // Handle non-ok responses
        const errorText = await response.text();
        lastError = new Error(
          `Status ${response.status}: ${errorText.substring(0, 100)}...`
        );

        // Calculate exponential backoff with jitter
        const delay = initialDelay * Math.pow(2, i) + Math.random() * 1000;
        console.log(
          `Attempt ${i + 1} failed with status ${
            response.status
          }, retrying in ${Math.round(delay)}ms...`
        );
        await wait(delay);
      } catch (error) {
        lastError = error;
        if (error.name === "AbortError") {
          console.warn(`Request to ${url} timed out after ${timeout}ms`);
        } else {
          console.warn(`Fetch error on attempt ${i + 1}: ${error.message}`);
        }

        if (i === retries - 1) throw error;

        // Calculate exponential backoff with jitter for errors
        const delay = initialDelay * Math.pow(2, i) + Math.random() * 1000;
        console.log(`Will retry in ${Math.round(delay)}ms...`);
        await wait(delay);
      }
    }
    throw lastError || new Error(`Failed after ${retries} attempts`);
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
