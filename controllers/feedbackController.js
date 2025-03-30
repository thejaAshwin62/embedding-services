import { ImageService } from "../services/imageService.js";
import { embedFeedbacks } from "./embeddingController.js";
import Feedback from "../models/feedbackModel.js";
import { generateCaptionFromText } from "../services/DeepSeekService.js";
import dotenv from "dotenv";

dotenv.config();

const imageService = new ImageService(
  process.env.API_URL,
  process.env.HF_ACCESS_TOKEN
);

function generatePersonalizedPrompt(
  caption,
  nameDetails,
  locationContext,
  objectsContext
) {
  if (!caption) {
    throw new Error("Caption is missing");
  }

  // Clear any previous context
  let personalizedCaption = caption;
  const name =
    typeof nameDetails === "string"
      ? nameDetails
      : nameDetails?.match || "unknown person";

  // Start with a fresh context for each prompt
  const freshContext = `Starting a new scene description, disregarding any previous contexts or descriptions.

Current scene details:`;

  if (name.toLowerCase() !== "unknown person") {
    const genericWords = [
      "a man",
      "a woman",
      "a person",
      "someone",
      "the individual",
    ];
    genericWords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      personalizedCaption = personalizedCaption.replace(regex, name);
    });

    personalizedCaption = `You recognize ${name} in the image. ${name} is depicted in the following scene: ${personalizedCaption}`;
  }

  return `${freshContext}

Forget any previous descriptions or scenarios. This is a completely new observation:

You were standing near ${
    name.toLowerCase() === "unknown person" ? "this person" : name
  }, observing the scene firsthand. ${personalizedCaption}  

Objects in view:
These are the objects detected from the image: ${objectsContext}.  

Instructions:
1. Focus only on the details provided above
2. Disregard any previous descriptions or contexts
3. Create a completely fresh scenario
4. Convert this into a detailed AI-generated scenario where the user is being described the scene as if they were present
5. Use "You were..." to make it immersive
6. Ensure description is based solely on the current scene details
7. Keep the response concise and focused (max 4-6 sentences)
8. Make it natural and observational

Return your response in this exact JSON format:
{
  "feedback": "your detailed scenario here"
}

Remember: Generate a completely new description without referencing any previous contexts or descriptions.`;
}

function ensureValidJson(aiResponse) {
  try {
    // First try direct JSON parse
    return JSON.parse(aiResponse);
  } catch (e) {
    // Remove any markdown code block syntax
    let cleanResponse = aiResponse
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    try {
      // Try parsing the cleaned response
      return JSON.parse(cleanResponse);
    } catch (e2) {
      // If still not valid JSON, create a valid JSON structure
      return {
        feedback: cleanResponse,
      };
    }
  }
}

export const createFeedback = async (req, res, next) => {
  let uploadedFile = null;
  try {
    if (!req.file) {
      throw new Error("No file uploaded");
    }
    uploadedFile = req.file;
    const imagePath = uploadedFile.path;

    let locationData;
    try {
      locationData = req.body.location
        ? JSON.parse(req.body.location)
        : {
            latitude: 0,
            longitude: 0,
            timestamp: new Date().toISOString(),
          };
    } catch (error) {
      console.error("Location parse error:", error);
      locationData = {
        latitude: 0,
        longitude: 0,
        timestamp: new Date().toISOString(),
      };
    }

    // Process image in parallel
    const [caption, detectedObjects, faceData] = await Promise.all([
      imageService.generateCaption(imagePath),
      imageService.detectObjects(imagePath),
      imageService.getFaceEmbedding(imagePath),
    ]);

    if (!caption) {
      throw new Error("Failed to generate caption");
    }

    console.log("Face Detection Result:", faceData);
    const nameDetails = faceData.match || "unknown person";

    const objectsContext = detectedObjects?.length
      ? `The image contains: ${detectedObjects.join(", ")}. `
      : "";

    const locationContext = `This image was captured at coordinates (${locationData.latitude}, ${locationData.longitude}). `;

    const feedbackPrompt = generatePersonalizedPrompt(
      caption,
      nameDetails,
      locationContext,
      objectsContext
    );

    const aiResponse = await generateCaptionFromText(feedbackPrompt);

    if (!aiResponse) {
      throw new Error("Failed to generate AI feedback");
    }

    console.log("AI response:", aiResponse);

    const jsonFeedback = ensureValidJson(aiResponse);

    if (!jsonFeedback.feedback) {
      throw new Error("Missing feedback field in AI response");
    }

    const now = new Date();
    const feedback = new Feedback({
      id_date: now.toLocaleDateString("en-GB"),
      id_time: now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }),
      feedback: jsonFeedback.feedback,
      embedded: false,
     
      detectedObjects: detectedObjects || [],
      faceData: faceData.embedding || null,
      faceMatch: faceData.match || null,
      faceScore: faceData.score || null,
      faceTimestamp: faceData.timestamp || null,
    });

    await feedback.save();

    const embeddingResults = await embedFeedbacks();

    res.status(201).json({
      success: true,
      message: "Feedback saved and embedded successfully",
      feedback: {
        id: feedback._id,
        date: feedback.id_date,
        time: feedback.id_time,
        text: feedback.feedback,
        imageLocation: feedback.imageLocation,
        detectedObjects: feedback.detectedObjects,
        faceData: {
          match: faceData.match,
          score: faceData.score,
          timestamp: faceData.timestamp
        },
        embedding_status: embeddingResults,
      },
    });
  } catch (error) {
    console.error("Error in createFeedback:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error processing feedback",
    });
  } finally {
    if (uploadedFile && uploadedFile.path) {
      await imageService
        .cleanup(uploadedFile.path)
        .catch((err) => console.error("Error cleaning up file:", err));
    }
  }
};

export const getUserLocations = async (req, res) => {
  try {
    const locations = await Feedback.find({
      location: { $exists: true, $ne: null },
    })
      .select("id_date id_time feedback location imageLocation")
      .sort({ id_date: -1, id_time: -1 });

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
      metadata: {
        fullAddress: `${loc.location.area}, ${loc.location.city}, ${loc.location.region}, ${loc.location.zip}, ${loc.location.country}`,
        locationTimestamp: loc.location.timestamp,
        coordinates: {
          lat: loc.location.latitude,
          lng: loc.location.longitude,
        },
      },
    }));

    res.json(formattedLocations);
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ error: "Failed to fetch locations" });
  }
};
