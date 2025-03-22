import express from 'express';
import {getOverallStats, getDailyBreakdown, getObjectStats } from "../controllers/statsController.js";

const router = express.Router();

router.get("/overall", getOverallStats);
router.get("/daily/:period", getDailyBreakdown);
router.get("/objects", getObjectStats);

export default router;