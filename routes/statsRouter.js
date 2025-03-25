import express from "express";
import {
  getOverallStats,
  getDailyBreakdown,
  getObjectStats,
  getFaceIndexStats,
  wifiCredentialsCheck,
  updateWifiCredentials,

} from "../controllers/statsController.js";

const router = express.Router();

router.get("/overall", getOverallStats);
router.get("/daily/:period", getDailyBreakdown);
router.get("/objects", getObjectStats);
router.get("/faces", getFaceIndexStats);
router.get("/get-wifi",wifiCredentialsCheck)
router.post("/update-wifi",updateWifiCredentials)

export default router;
