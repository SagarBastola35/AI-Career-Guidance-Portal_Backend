// backend/src/controllers/careerController.js
import CareerProfile from "../models/CareerProfile.js";
import User from "../models/User.js";

export const saveCareerPreferences = async (req, res) => {
  try {
    const { desiredRole, preferredIndustries, learningStyle } = req.body;

    let careerProfile = await CareerProfile.findOne({ user: req.user._id });

    if (careerProfile) {
      if (desiredRole) careerProfile.desiredRole = desiredRole;
      if (preferredIndustries)
        careerProfile.preferredIndustries = preferredIndustries;
      if (learningStyle) careerProfile.learningStyle = learningStyle;
      await careerProfile.save();
    } else {
      careerProfile = await CareerProfile.create({
        user: req.user._id,
        desiredRole,
        preferredIndustries,
        learningStyle,
      });
    }

    res.json(careerProfile);
  } catch (error) {
    console.error("Save career preferences error:", error);
    res
      .status(500)
      .json({ message: "Failed to save preferences", error: error.message });
  }
};

export const getCareerProfile = async (req, res) => {
  try {
    const careerProfile = await CareerProfile.findOne({ user: req.user._id });
    res.json(careerProfile || { message: "No career profile found" });
  } catch (error) {
    console.error("Get career profile error:", error);
    res
      .status(500)
      .json({
        message: "Failed to fetch career profile",
        error: error.message,
      });
  }
};

export const getJobRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const careerProfile = await CareerProfile.findOne({ user: req.user._id });

    const mockJobs = [
      {
        id: 1,
        title: "Senior Full Stack Developer",
        company: "Tech Innovations Inc.",
        location: "Remote",
        salary: "$120k - $160k",
        matchScore: 92,
        skills: ["React", "Node.js", "MongoDB", "AWS"],
        description:
          "Join our growing team building scalable web applications.",
      },
      {
        id: 2,
        title: "AI/ML Engineer",
        company: "FutureAI Labs",
        location: "San Francisco, CA",
        salary: "$140k - $180k",
        matchScore: 78,
        skills: ["Python", "TensorFlow", "PyTorch", "Computer Vision"],
        description:
          "Work on cutting-edge AI solutions for enterprise clients.",
      },
      {
        id: 3,
        title: "Technical Product Manager",
        company: "CloudScale Systems",
        location: "New York, NY (Hybrid)",
        salary: "$130k - $170k",
        matchScore: 85,
        skills: ["Agile", "Product Strategy", "Data Analytics", "Leadership"],
        description: "Lead product development from concept to launch.",
      },
      {
        id: 4,
        title: "DevOps Engineer",
        company: "InfraCloud Solutions",
        location: "Remote",
        salary: "$110k - $150k",
        matchScore: 70,
        skills: ["Kubernetes", "Docker", "CI/CD", "Terraform"],
        description: "Build and maintain cloud infrastructure.",
      },
    ];

    const personalizedJobs = mockJobs
      .map((job) => ({
        ...job,
        matchScore: job.matchScore - Math.floor(Math.random() * 15),
      }))
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json(personalizedJobs);
  } catch (error) {
    console.error("Job recommendations error:", error);
    res
      .status(500)
      .json({
        message: "Failed to fetch job recommendations",
        error: error.message,
      });
  }
};
