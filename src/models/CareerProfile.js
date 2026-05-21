
import mongoose from "mongoose";

const careerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    desiredRole: String,
    preferredIndustries: [String],
    learningStyle: {
      type: String,
      enum: ["visual", "reading", "kinesthetic", "auditory"],
      default: "reading",
    },
    recommendations: [
      {
        careerPath: String,
        confidence: Number,
        reasoning: String,
        suggestedSkills: [String],
        resources: [
          {
            title: String,
            url: String,
            type: String,
          },
        ],
      },
    ],
    skillGapAnalysis: {
      targetRole: String,
      missingSkills: [String],
      // ✅ Allow objects or strings to prevent CastError
      recommendedCourses: [mongoose.Schema.Types.Mixed],
      lastUpdated: Date,
    },
  },
  {
    timestamps: true, // automatically manages createdAt & updatedAt
  },
);

export default mongoose.model("CareerProfile", careerProfileSchema);
