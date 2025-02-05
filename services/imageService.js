import fs from 'fs';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

export class ImageService {
  constructor(apiUrl, apiToken) {
    if (!apiUrl || !apiToken) {
      throw new Error('API URL and token are required');
    }
    this.apiUrl = apiUrl;
    this.apiToken = apiToken;
    this.objectDetectionUrl = "https://api-inference.huggingface.co/models/facebook/detr-resnet-50";
  }

  async generateCaption(filename) {
    try {
      if (!fs.existsSync(filename)) {
        throw new Error('File not found');
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
        throw new Error(`API error: ${response.status} ${response.statusText}\n${errorText}`);
      }

      const result = await response.json();
      const caption = result[0]?.generated_text;
      
      if (!caption) {
        throw new Error('No caption generated');
      }

      return caption;
    } catch (error) {
      console.error("Error generating caption:", error);
      throw error;
    }
  }

  async detectObjects(filename) {
    try {
      if (!fs.existsSync(filename)) {
        throw new Error('File not found');
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
        throw new Error(`Object detection API error: ${response.status}`);
      }

      const result = await response.json();
      return result.map(item => item.label);
    } catch (error) {
      console.error("Error detecting objects:", error);
      throw error;
    }
  }

  async cleanup(filepath) {
    try {
      await fs.promises.unlink(filepath);
      console.log('Successfully cleaned up file:', filepath);
    } catch (error) {
      console.error('Error cleaning up file:', error);
      throw error;
    }
  }
} 