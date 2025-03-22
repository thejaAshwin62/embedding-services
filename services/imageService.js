import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";
import dotenv from "dotenv";
import { generateCaptionFromText } from "./DeepSeekService.js";
import { FACE_SERVICE } from "../utils/config.js";

dotenv.config();

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
    this.faceApiUrl = `${FACE_SERVICE}/upload`;
  }
  

  async generateCaption(filename) {
    try {
      if (!fs.existsSync(filename)) {
        throw new Error("File not found");
      }

      const data = fs.readFileSync(filename);
      const response = await fetch(this.apiUrl, {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          "Content-Type": "application/octet-stream",
        },
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `API error: ${response.status} ${response.statusText}\n${errorText}`
        );
      }

      const result = await response.json();
      const imageDetails = result[0]?.generated_text;

      if (!imageDetails) {
        throw new Error("No details generated from image");
      }

      // Create a fresh prompt that emphasizes new generation
      const freshPrompt = `Generate a completely new description for this image forgot the previous querry , make the response new from the fresh. 
Base your description ONLY on these current details: ${imageDetails}

Enhance the details and explain the scenario clearly, but do not reference or incorporate any previous descriptions.`;

      // Get fresh caption
      const caption = await generateCaptionFromText(freshPrompt);

      if (!caption) {
        throw new Error("No caption generated");
      }

      console.log("Generated fresh caption from DeepSeek:", caption);

      return caption;
    } catch (error) {
      console.error("Error generating caption:", error);
      throw error;
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
          console.log(`Trying fallback object detection API #${currentApiIndex}: ${currentApi}`);
        } else {
          throw new Error("All object detection APIs failed");
        }
      }

      const imageData = fs.readFileSync(filename);
      
      try {
        console.log(`Starting object detection request to ${currentApi}`);
        // Use the enhanced retryFetch method with more retries and longer timeouts
        const response = await this.retryFetch(currentApi, {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            "Content-Type": "application/octet-stream",
          },
          method: "POST",
          body: imageData,
        }, 4, 2000, 60000); // 4 retries, starting with 2s delay, 60s timeout

        console.log("Parsing object detection response...");
        const result = await response.json();
        console.log(`Successfully detected ${result.length} objects`);
        return result.map((item) => item.label);
      } catch (error) {
        console.warn(`Object detection API failed (${currentApi}): ${error.message}`);
        
        // If this API failed, try the next one
        if (currentApiIndex < this.fallbackDetectionApis.length + 1) {
          console.log("Falling back to alternative object detection API...");
          // Wait a bit before trying the next API to avoid overwhelming the system
          await wait(3000);
          return this.detectObjects(filename, currentApiIndex + 1);
        }
        
        // If all APIs failed, throw error
        throw new Error(`All object detection APIs failed. Last error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error detecting objects:", error);
      throw error;
    }
  }

  async retryFetch(url, options, retries = 5, initialDelay = 1000, timeout = 30000) {
    let lastError;
    for (let i = 0; i < retries; i++) {
      try {
        // Add timeout to fetch using AbortController
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const fetchOptions = {
          ...options,
          signal: controller.signal
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
        lastError = new Error(`Status ${response.status}: ${errorText.substring(0, 100)}...`);
        
        // Calculate exponential backoff with jitter
        const delay = initialDelay * Math.pow(2, i) + Math.random() * 1000;
        console.log(`Attempt ${i + 1} failed with status ${response.status}, retrying in ${Math.round(delay)}ms...`);
        await wait(delay);
      } catch (error) {
        lastError = error;
        if (error.name === 'AbortError') {
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

  async getFaceEmbedding(filename) {
    try {
      if (!fs.existsSync(filename)) {
        throw new Error("File not found");
      }

      const formData = new FormData();
      formData.append("image", fs.createReadStream(filename));

      // First API call with retry mechanism
      const response = await this.retryFetch(this.faceApiUrl, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("Face Embedding:", result);

      if (result.message === "No face detected") {
        return { embedding: null, match: "unknownPerson" };
      }

      // Second API call with retry mechanism
      const matchResponse = await this.retryFetch(`${FACE_SERVICE}/match-face`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });

      let nameDetail = await matchResponse.json();
      console.log("Face Name Match Result:", nameDetail);

      if (!nameDetail.match || nameDetail.score < 0.85 || nameDetail.message === "No match found") {
        nameDetail = { match: "unknownPerson" };
      }

      return { embedding: result, match: nameDetail };
    } catch (error) {
      console.error("Error getting face embedding:", error);
      throw error;
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
