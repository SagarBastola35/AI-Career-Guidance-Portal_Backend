
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({
          message: "Please provide all required fields (name, email, password)",
        });
    }

    // Check password length
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      profile: {
        skills: [],
        interests: [],
        experience: "entry",
        education: "",
        location: "",
      },
    });

    // Generate token
    const token = generateToken(user._id);

    // Return user data (excluding password)
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
      profile: user.profile,
    });
  } catch (error) {
    console.error("Register error details:", error);
    // Send specific error message
    res
      .status(500)
      .json({ message: error.message || "Server error during registration" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
      profile: user.profile,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.body.skills !== undefined) user.profile.skills = req.body.skills;
    if (req.body.interests !== undefined)
      user.profile.interests = req.body.interests;
    if (req.body.experience !== undefined)
      user.profile.experience = req.body.experience;
    if (req.body.education !== undefined)
      user.profile.education = req.body.education;
    if (req.body.location !== undefined)
      user.profile.location = req.body.location;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profile: user.profile,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error updating profile" });
  }
};
