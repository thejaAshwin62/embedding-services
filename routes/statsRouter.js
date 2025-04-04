import express from "express";
import {
  getOverallStats,
  getDailyBreakdown,
  getObjectStats,
  getFaceIndexStats,
  wifiCredentialsCheck,
  updateWifiCredentials,
  getCaptureInterval,
  updateCaptureInterval,
  getTriggerEsp32Start,
  UpdatetriggerEsp32Start,
} from "../controllers/statsController.js";

const router = express.Router();

router.get("/overall", getOverallStats);
router.get("/daily/:period", getDailyBreakdown);
router.get("/objects", getObjectStats);
router.get("/faces", getFaceIndexStats);
router.get("/get-wifi", wifiCredentialsCheck);
router.post("/update-wifi", updateWifiCredentials);
router.get("/get-capture-interval", getCaptureInterval);
router.post("/update-capture-interval", updateCaptureInterval);
router.get("/get-trigger-esp", getTriggerEsp32Start);
router.post("/update-trigger-esp", UpdatetriggerEsp32Start);

export default router;
