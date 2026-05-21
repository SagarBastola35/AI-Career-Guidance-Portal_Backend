
import { analyzeResumeWithAI } from "../services/aiService.js";
import Resume from "../models/Resume.js";
import fs from "fs";

// Ensure uploads directory exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Helper to extract text from PDF safely
async function extractPdfText(filePath) {
  let pdfParse = null;
  try {
    // Dynamic import – works even if static import fails
    const pdfModule = await import("pdf-parse");
    pdfParse = pdfModule.default || pdfModule;
  } catch (importErr) {
    console.error("PDF parse import failed:", importErr.message);
    return "[PDF parsing library not available – using mock text]";
  }

  if (!pdfParse) {
    return "[PDF parser not initialized]";
  }

  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    return pdfData.text || "";
  } catch (pdfErr) {
    console.error("PDF parsing error:", pdfErr.message);
    return "[Could not extract text from PDF]";
  }
}

export const uploadResume = async (req, res) => {
  let filePath = null;
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    filePath = req.file.path;
    let extractedText = "";

    if (req.file.mimetype === "application/pdf") {
      extractedText = await extractPdfText(filePath);
    } else if (req.file.mimetype === "text/plain") {
      extractedText = fs.readFileSync(filePath, "utf8");
    } else {
      extractedText = "Text extraction not fully supported for this file type.";
    }

    // AI analysis (mock or real)
    const analysis = await analyzeResumeWithAI(extractedText);

    // Save resume record
    const resume = await Resume.create({
      user: req.user._id,
      fileName: req.file.originalname,
      fileUrl: filePath,
      extractedText: extractedText.substring(0, 1000),
      analysis: {
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        atsScore: analysis.atsScore || 0,
        suggestions: analysis.suggestions || [],
        keywords: analysis.keywords || [],
        overallRating: analysis.overallRating || 0,
      },
    });

    // Clean up uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(201).json({
      message: "Resume uploaded and analyzed successfully",
      resume: {
        id: resume._id,
        fileName: resume.fileName,
        uploadedAt: resume.uploadedAt,
        analysis: resume.analysis,
      },
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res
      .status(500)
      .json({ message: "Failed to process resume", error: error.message });
  }
};

export const getUserResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort({
      uploadedAt: -1,
    });
    res.json(resumes);
  } catch (error) {
    console.error("Get resumes error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch resumes", error: error.message });
  }
};

export const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    res.json(resume);
  } catch (error) {
    console.error("Get resume error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch resume", error: error.message });
  }
};

export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    res.json({ message: "Resume deleted successfully" });
  } catch (error) {
    console.error("Delete resume error:", error);
    res
      .status(500)
      .json({ message: "Failed to delete resume", error: error.message });
  }
};
