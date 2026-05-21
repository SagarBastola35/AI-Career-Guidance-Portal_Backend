// backend/src/routes/aiRoutes.js
import express from "express";
import {
  getCareerRecommendations,
  chatWithAI,
  getSkillGapAnalysis,
  getCareerInsights,
} from "../controllers/aiController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/recommendations", protect, getCareerRecommendations);
router.post("/chat", protect, chatWithAI);
router.post("/skill-gap", protect, getSkillGapAnalysis);
router.get("/insights", protect, getCareerInsights);

export default router;
