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

  // Extract sections from the combined analysis if present
  let setting = "", mainFocus = "", peopleActions = "", details = "", mood = "";
  
  if (caption.includes("SETTING:")) {
    const sections = caption.split(/\n(?=[A-Z]+:)/);
    sections.forEach(section => {
      if (section.includes("SETTING:")) setting = section.replace("SETTING:", "").trim();
      if (section.includes("MAIN FOCUS:")) mainFocus = section.replace("MAIN FOCUS:", "").trim();
      if (section.includes("PEOPLE & ACTIONS:")) peopleActions = section.replace("PEOPLE & ACTIONS:", "").trim();
      if (section.includes("DETAILS:")) details = section.replace("DETAILS:", "").trim();
      if (section.includes("MOOD:")) mood = section.replace("MOOD:", "").trim();
    });
  }

  // Start with a fresh context for each prompt
  const freshContext = `Starting a new scene description, disregarding any previous contexts or descriptions.

Current scene analysis:`;

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

    peopleActions = peopleActions.replace(new RegExp(genericWords.join("|"), "gi"), name);
  }

  const structuredPrompt = `${freshContext}

Scene Setting: ${setting || "The scene takes place in the following context:"} ${name.toLowerCase() === "unknown person" ? "A person" : name} is present in this scene.

Main Elements:
${mainFocus ? `- Focus: ${mainFocus}` : `- Focus: ${personalizedCaption}`}
${peopleActions ? `- Actions: ${peopleActions}` : ""}
${details ? `- Key Details: ${details}` : ""}
${mood ? `- Atmosphere: ${mood}` : ""}

Additional Context:
- Objects Detected: ${objectsContext}

Instructions:
1. Focus on creating an immersive first-person perspective
2. Incorporate all the analyzed elements naturally
3. Make the scene feel present and immediate
4. Keep the description vivid but concise (4-6 sentences)
5. Emphasize the human element and emotional context
6. Blend the technical details seamlessly into the narrative

Return your response in this exact JSON format:
{
  "feedback": "your detailed scenario here"
}

Remember: Create a fresh, engaging description that makes the reader feel present in the moment.`;

  return structuredPrompt;
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

    // Convert to Asia/Kolkata timezone (adjust this to your desired timezone)
    const options = {
      timeZone: 'Asia/Kolkata',
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    };

    const dateOptions = {
      timeZone: 'Asia/Kolkata',
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    };

    const feedback = new Feedback({
      id_date: now.toLocaleDateString("en-GB", dateOptions),
      id_time: now.toLocaleTimeString("en-GB", options),
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
