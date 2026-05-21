// backend/src/routes/resumeRoutes.js
import express from "express";
import {
  uploadResume,
  getUserResumes,
  getResumeById,
  deleteResume,
} from "../controllers/resumeController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/upload", protect, upload.single("resume"), uploadResume);
router.get("/", protect, getUserResumes);
router.get("/:id", protect, getResumeById);
router.delete("/:id", protect, deleteResume);

export default router;
