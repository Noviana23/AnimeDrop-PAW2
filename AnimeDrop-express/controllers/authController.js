import UserModel from "../models/userModel.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = "your_jwt_secret_key_change_this_in_production";

// Register
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Cek apakah user sudah ada
    const existingUser = await UserModel.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Buat user baru
    const user = await UserModel.create({
      username,
      email,
      password,
      avatar: `https://ui-avatars.com/api/?background=random&name=${username}`,
    });

    // Generate token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message, data: null });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cek apakah user ada
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Cek password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message, data: null });
  }
};

// Get Current User
export const getMe = async (req, res) => {
  try {
    res.json({
      message: "User profile retrieved",
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        avatar: req.user.avatar,
        bio: req.user.bio,
        followers: req.user.followers.length,
        following: req.user.following.length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message, data: null });
  }
};
