import express from "express";
import { createFeedback } from "../controllers/feedbackController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/upload", upload.single("image"), createFeedback);
// router.get("/locations", getUserLocations);

export default router;
