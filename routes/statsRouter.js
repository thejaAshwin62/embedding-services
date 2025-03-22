import express from 'express';
import {getOverallStats, getDailyBreakdown, getObjectStats, getFaceIndexStats } from "../controllers/statsController.js";

const router = express.Router();

router.get("/overall", getOverallStats);
router.get("/daily/:period", getDailyBreakdown);
router.get("/objects", getObjectStats);
router.get("/faces", getFaceIndexStats);

export default router;