import { ImageService } from "../services/imageService.js";
import { chatSession } from "../services/aiService.js";
import { embedFeedbacks } from "./embeddingController.js";
import locationService from "../services/locationService.js";
import Feedback from "../models/feedbackModel.js";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const imageService = new ImageService(
  process.env.API_URL,
  process.env.HF_ACCESS_TOKEN
);

export const createFeedback = async (req, res, next) => {
  let uploadedFile = null;
  try {
    // Validate file upload
    if (!req.file) {
      throw new Error("No file uploaded");
    }
    uploadedFile = req.file;
    const imagePath = uploadedFile.path;

    // Get location data with better error handling
    let locationData;
    try {
      // Check if location exists in request body
      if (!req.body.location) {
        locationData = {
          latitude: 0,
          longitude: 0,
          timestamp: new Date().toISOString()
        };
      } else {
        locationData = JSON.parse(req.body.location);
      }
    } catch (error) {
      console.error("Location parse error:", error);
      locationData = {
        latitude: 0,
        longitude: 0,
        timestamp: new Date().toISOString()
      };
    }

    // Generate caption and detect objects
    const [caption, detectedObjects] = await Promise.all([
      imageService.generateCaption(imagePath),
      imageService.detectObjects(imagePath)
    ]);

    if (!caption) {
      throw new Error("Failed to generate caption");
    }

    // Create feedback
    const now = new Date();
    const feedback = new Feedback({
      id_date: now.toLocaleDateString("en-GB"),
      id_time: now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }),
      feedback: "",
      embedded: false,
      location: {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        timestamp: locationData.timestamp
      },
      imageLocation: imagePath,
      detectedObjects: detectedObjects || []
    });

    // Generate AI feedback
    const objectsContext = detectedObjects?.length > 0 
      ? `The image contains: ${detectedObjects.join(', ')}. `
      : '';
    
    const locationContext = `This image was captured at coordinates (${locationData.latitude}, ${locationData.longitude}). `;
    
    const feedbackPrompt = `${caption}${locationContext}This is my text you have to make it like a brief text that an AI remembering the scenario to a person like you were in this place like that, make it in long answer, with detailed content and feedback should be in "You were" pointing the users like response.these are the object deducted from the image ${objectsContext} add these object in the response, Give it in JSON format only not any additional text eg: { "feedback": "   "`;

    const result = await chatSession.sendMessage(feedbackPrompt);
    if (!result || !result.response) {
      throw new Error("Failed to generate AI feedback");
    }

    const jsonResponse = result.response.text();
    const cleanedResponse = jsonResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let jsonFeedback;
    try {
      jsonFeedback = JSON.parse(cleanedResponse);
      feedback.feedback = jsonFeedback.feedback;
    } catch (parseError) {
      throw new Error("Failed to parse AI response");
    }

    // Save to MongoDB
    await feedback.save();
    
    // Process embeddings
    const embeddingResults = await embedFeedbacks();

    res.status(201).json({
      message: "Feedback saved and embedded successfully",
      feedback: {
        id: feedback._id,
        date: feedback.id_date,
        time: feedback.id_time,
        text: feedback.feedback,
        location: feedback.location,
        imageLocation: feedback.imageLocation,
        detectedObjects: feedback.detectedObjects,
        embedding_status: embeddingResults,
      },
    });
  } catch (error) {
    console.error("Error in createFeedback:", error);
    next(error);
  } finally {
    if (uploadedFile && uploadedFile.path) {
      await imageService.cleanup(uploadedFile.path)
        .catch((err) => console.error("Error cleaning up file:", err));
    }
  }
};

export const getUserLocations = async (req, res) => {
  try {
    // Find all feedback entries with location data
    const locations = await Feedback.find({
      location: { $exists: true, $ne: null },
    })
      .select("id_date id_time feedback location imageLocation")
      .sort({ id_date: -1, id_time: -1 });

    // Format the response with complete location details
    const formattedLocations = locations.map((loc) => ({
      id_date: loc.id_date,
      id_time: loc.id_time,
      feedback: loc.feedback,
      location: {
        ip: loc.location.ip,
        city: loc.location.city,
        region: loc.location.region,
        country: loc.location.country,
        latitude: loc.location.latitude,
        longitude: loc.location.longitude,
        area: loc.location.area || "Unknown Area",

        locality: loc.location.locality || "Unknown Locality",
        zip: loc.location.zip || "Unknown Zip",
        formatted_address: loc.location.formatted_address || "",
        timestamp: loc.location.timestamp,
      },

      // Add additional metadata if needed
      metadata: {
        fullAddress: `${loc.location.area}, ${loc.location.city}, ${loc.location.region}, ${loc.location.zip}, ${loc.location.country}`,
        locationTimestamp: loc.location.timestamp,
        coordinates: {
          lat: loc.location.latitude,
          lng: loc.location.longitude,
        },
      },
    }));

    // Log the formatted locations for debugging
    // console.log("Sending locations with complete details:",
    //   formattedLocations.map(loc => ({
    //     address: loc.location.formatted_address,
    //     area: loc.location.area,

    //     locality: loc.location.locality,
    //     zip: loc.location.zip,
    //     coordinates: [loc.location.latitude, loc.location.longitude]
    //   }))
    // );

    res.json(formattedLocations);
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ error: "Failed to fetch locations" });
  }
};
