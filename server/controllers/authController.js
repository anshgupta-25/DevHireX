const User = require("../models/User");
const { generateToken } = require("../middleware/auth");

// @desc    Register new user
// @route   POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const { name, email, password, role, company } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "student",
      company: company || "",
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error during signup" });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const query = { email };
    if (role) query.role = role;

    const user = await User.findOne(query);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    // Emit session_expired with the email to precisely control logout on the frontend
    const io = req.app.get("io");
    if (io) {
      io.to(user._id.toString()).emit("session_expired", user.email);
    }

    res.json({
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { signup, login, getMe };
