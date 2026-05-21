// backend/src/routes/careerRoutes.js
import express from "express";
import {
  saveCareerPreferences,
  getCareerProfile,
  getJobRecommendations,
} from "../controllers/careerController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/preferences", protect, saveCareerPreferences);
router.get("/profile", protect, getCareerProfile);
router.get("/jobs", protect, getJobRecommendations);

export default router;
