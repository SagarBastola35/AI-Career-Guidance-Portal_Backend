// backend/src/models/Resume.js
import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fileName: String,
  fileUrl: String,
  extractedText: String,
  analysis: {
    strengths: [String],
    weaknesses: [String],
    atsScore: Number,
    suggestions: [String],
    keywords: [String],
    overallRating: Number,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Resume", resumeSchema);
