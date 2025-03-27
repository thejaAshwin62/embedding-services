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

} from "../controllers/statsController.js";

const router = express.Router();

router.get("/overall", getOverallStats);
router.get("/daily/:period", getDailyBreakdown);
router.get("/objects", getObjectStats);
router.get("/faces", getFaceIndexStats);
router.get("/get-wifi",wifiCredentialsCheck)
router.post("/update-wifi",updateWifiCredentials)
router.get("/get-capture-interval",getCaptureInterval)
router.post("/update-capture-interval",updateCaptureInterval)

export default router;
