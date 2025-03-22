import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";
import dotenv from "dotenv";
import { generateCaptionFromText } from "./DeepSeekService.js";
import { FACE_SERVICE } from "../utils/config.js";

dotenv.config();

export class ImageService {
  constructor(apiUrl, apiToken) {
    if (!apiUrl || !apiToken) {
      throw new Error("API URL and token are required");
    }
    this.apiUrl = apiUrl;
    this.apiToken = apiToken;
    this.objectDetectionUrl =
    "https://router.huggingface.co/hf-inference/models/facebook/detr-resnet-50";
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

  async detectObjects(filename, retries = 3) {
    try {
      if (!fs.existsSync(filename)) {
        throw new Error("File not found");
      }

      const imageData = fs.readFileSync(filename);
      const response = await fetch(this.objectDetectionUrl, {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          "Content-Type": "application/octet-stream",
        },
        method: "POST",
        body: imageData,
      });

      if (!response.ok) {
        if (response.status === 503 && retries > 0) {
          console.warn(
            `Object detection API error: ${response.status}. Retrying...`
          );
          return this.detectObjects(filename, retries - 1);
        }
        throw new Error(`Object detection API error: ${response.status}`);
      }

      const result = await response.json();
      return result.map((item) => item.label);
    } catch (error) {
      console.error("Error detecting objects:", error);
      throw error;
    }
  }

  async getFaceEmbedding(filename) {
    try {
      if (!fs.existsSync(filename)) {
        throw new Error("File not found");
      }

      const formData = new FormData();
      formData.append("image", fs.createReadStream(filename));

      const response = await fetch(this.faceApiUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Face API error: ${response.status} ${response.statusText}\n${errorText}`
        );
      }

      const result = await response.json();
      console.log("Face Embedding:", result);

      // Check if the response indicates no face detected
      if (result.message === "No face detected") {
        return { embedding: null, match: "unknownPerson" };
      }

      // Send the embedding to the face matching API
      const matchResponse = await fetch(`${FACE_SERVICE}/match-face`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });

      if (!matchResponse.ok) {
        const errorText = await matchResponse.text();
        throw new Error(
          `Face match API error: ${matchResponse.status} ${matchResponse.statusText}\n${errorText}`
        );
      }

      let nameDetail = await matchResponse.json();
      console.log("Face Name Match Result:", nameDetail);

      // Set nameDetails to "unknownPerson" if it doesn't match, score is below 0.9, or no match found
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
