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
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
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

    const query = { email: email.toLowerCase().trim() };
    if (role) query.role = role;

    console.log(`Login attempt for: email=${query.email}, role=${query.role}`);
    
    const user = await User.findOne(query);
    if (!user) {
      console.log(`User not found for query:`, query);
      return res.status(401).json({ message: "Invalid credentials (User not found)" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`Password mismatch for user: ${user.email}`);
      return res.status(401).json({ message: "Invalid credentials (Password mismatch)" });
    }

    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    const token = generateToken(user._id, user.tokenVersion);

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

// @desc    Google OAuth sign-in / sign-up
// @route   POST /api/auth/google
const googleAuth = async (req, res) => {
  try {
    const { name, email, profileImage, role } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    let user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      // New user — create with Google auth provider
      user = await User.create({
        name: name || "Google User",
        email: email.toLowerCase().trim(),
        password: null,
        authProvider: "google",
        avatar: profileImage || "",
        role: role || "student",
      });
    } else {
      // Existing user — update avatar if they have a Google photo and no local one
      if (profileImage && !user.avatar) {
        user.avatar = profileImage;
        await user.save();
      }
    }

    // Generate JWT (no tokenVersion bump needed for Google users)
    const token = generateToken(user._id, user.tokenVersion || 0);

    res.json({
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ message: "Server error during Google authentication" });
  }
};

module.exports = { signup, login, getMe, googleAuth };
