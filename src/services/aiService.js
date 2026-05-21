
// backend/src/services/aiService.js
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

// Initialize Groq only if API key exists and looks valid (starts with gsk_)
let groq = null;
const groqApiKey = process.env.GROQ_API_KEY;
if (groqApiKey && groqApiKey.startsWith("gsk_")) {
  try {
    groq = new Groq({ apiKey: groqApiKey });
    console.log("✅ Groq AI initialized with free API key");
  } catch (err) {
    console.warn("⚠️ Groq init failed:", err.message);
  }
} else {
  console.log(
    "⚠️ No valid Groq API key – using MOCK responses for all AI features",
  );
}

// ---------- MOCK DATA (used when no API key or API fails) ----------
const getMockCareerRecommendations = () => ({
  careerPaths: [
    {
      title: "Full Stack Developer",
      confidence: 92,
      reasoning:
        "Your skills in JavaScript and React align perfectly with this role.",
      skills: ["Node.js", "Database Design", "Cloud Services"],
    },
    {
      title: "AI/ML Engineer",
      confidence: 78,
      reasoning:
        "Strong analytical skills and interest in AI make this a great fit.",
      skills: ["Python", "TensorFlow", "Data Science"],
    },
    {
      title: "Technical Product Manager",
      confidence: 85,
      reasoning:
        "Your blend of technical knowledge and leadership potential is ideal.",
      skills: [
        "Agile Methodologies",
        "Market Research",
        "Stakeholder Management",
      ],
    },
  ],
});

const getMockChatResponse = (userMessage) => ({
  reply: `🤖 **Mock Career Assistant:** Thanks for asking: "${userMessage}"\n\nBased on your profile, I recommend focusing on building practical projects, updating your LinkedIn, and networking with professionals. What specific role are you interested in?`,
});

const getMockResumeAnalysis = () => ({
  strengths: ["Clear work experience", "Good technical skills section"],
  weaknesses: [
    "Missing quantifiable achievements",
    "Could use more action verbs",
  ],
  atsScore: 72,
  suggestions: [
    "Add metrics to your accomplishments",
    "Include relevant keywords from job descriptions",
  ],
  keywords: ["JavaScript", "React", "Node.js", "MongoDB"],
  overallRating: 3.5,
});

const getMockSkillGap = () => ({
  missingSkills: ["Cloud Computing", "System Design", "CI/CD Pipelines"],
  recommendedCourses: [
    "AWS Certified Solutions Architect",
    "System Design Interview Prep",
    "DevOps Fundamentals",
  ],
});

// ---------- Helper: Safe JSON parsing with repair ----------
function safeJSONParse(content, fallback) {
  try {
    // Clean the content: remove markdown code blocks
    let cleaned = content.trim();
    cleaned = cleaned.replace(/```json\s*/g, "").replace(/```\s*/g, "");
    // Find the first { and last }
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    // Fix common JSON issues:
    // 1. Add missing commas between array elements: }{ -> },{
    cleaned = cleaned.replace(/\}\s*\{/g, "},{");
    // 2. Remove trailing commas before closing brackets
    cleaned = cleaned.replace(/,(\s*[}\]])/g, "$1");
    // 3. Ensure property names are quoted (simple fix for unquoted keys)
    // This is a basic regex; works for simple cases
    cleaned = cleaned.replace(
      /([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g,
      '$1"$2":',
    );
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("JSON parse error:", err.message);
    console.error("Raw content:", content.substring(0, 500));
    return fallback;
  }
}

// ---------- Helper for real Groq calls (JSON mode) ----------
async function callGroq(systemPrompt, userPrompt, jsonMode = false) {
  if (!groq) throw new Error("Groq not available");
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];
  if (jsonMode) {
    messages.push({ role: "assistant", content: "```json\n" });
  }
  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages,
    temperature: 0.7,
    max_tokens: 800,
  });
  let content = response.choices[0]?.message?.content || "";
  if (jsonMode) {
    // Basic JSON extraction if needed
    const match = content.match(/\{[\s\S]*\}/);
    if (match) content = match[0];
  }
  return content;
}

// ---------- EXPORTED FUNCTIONS (all with fallback to mock and safe JSON parse) ----------
export const generateCareerRecommendations = async (userProfile) => {
  try {
    if (!groq) {
      console.log("Using mock career recommendations");
      return getMockCareerRecommendations();
    }
    const prompt = `As an expert career advisor, analyze this user profile and provide 3 career path recommendations with confidence scores, reasoning, and required skills. Output ONLY valid JSON (no extra text).

User Profile:
- Skills: ${userProfile.skills?.join(", ") || "Not specified"}
- Interests: ${userProfile.interests?.join(", ") || "Not specified"}
- Experience Level: ${userProfile.experience || "Not specified"}
- Education: ${userProfile.education || "Not specified"}

Required JSON format: { "careerPaths": [ { "title": string, "confidence": number, "reasoning": string, "skills": [string] } ] }`;
    const content = await callGroq(
      "You are a career guidance AI expert. Respond only with valid JSON.",
      prompt,
      true,
    );
    return safeJSONParse(content, getMockCareerRecommendations());
  } catch (error) {
    console.error("Groq Career Recommendation Error:", error);
    return getMockCareerRecommendations();
  }
};

export const chatWithCareerAssistant = async (message, userContext) => {
  try {
    if (!groq) {
      console.log("Using mock chat response");
      return getMockChatResponse(message);
    }
    console.log("🤖 Sending request to Groq API for chat...");
    const systemPrompt = `You are a professional career guidance assistant. User context: Skills: ${userContext.skills?.join(", ") || "Unknown"}, Experience: ${userContext.experience || "Unknown"}. Provide helpful, actionable career advice. Be concise but informative.`;
    const reply = await callGroq(systemPrompt, message, false);
    return { reply };
  } catch (error) {
    console.error("Groq Chat Error:", error);
    return getMockChatResponse(message);
  }
};

export const analyzeResumeWithAI = async (resumeText) => {
  try {
    if (!groq) {
      console.log("Using mock resume analysis");
      return getMockResumeAnalysis();
    }
    const prompt = `Analyze this resume and provide: strengths (array), weaknesses (array), ATS score (0-100), suggestions for improvement (array), keywords found (array), overall rating (1-5). Output ONLY valid JSON.

Resume text (first 3000 chars): ${resumeText.substring(0, 3000)}

Required JSON format: { "strengths": [string], "weaknesses": [string], "atsScore": number, "suggestions": [string], "keywords": [string], "overallRating": number }`;
    const content = await callGroq(
      "You are an expert resume reviewer specializing in ATS optimization. Respond only with valid JSON.",
      prompt,
      true,
    );
    return safeJSONParse(content, getMockResumeAnalysis());
  } catch (error) {
    console.error("Groq Resume Analysis Error:", error);
    return getMockResumeAnalysis();
  }
};

export const analyzeSkillGap = async (currentSkills, targetRole) => {
  try {
    if (!groq) {
      console.log("Using mock skill gap analysis");
      return getMockSkillGap();
    }
    const prompt = `For a professional targeting the role of "${targetRole}", analyze the skill gap. Current skills: ${currentSkills.join(", ")}. Provide missing skills (array) and recommended courses (array) to bridge the gap. Output ONLY valid JSON.

Required JSON format: { "missingSkills": [string], "recommendedCourses": [string] }`;
    const content = await callGroq(
      "You are a career skills analyst. Respond only with valid JSON.",
      prompt,
      true,
    );
    return safeJSONParse(content, getMockSkillGap());
  } catch (error) {
    console.error("Groq Skill Gap Error:", error);
    return getMockSkillGap();
  }
};
