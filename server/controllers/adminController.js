const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");

// @desc    Get platform stats
// @route   GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();
    const activeRecruiters = await User.countDocuments({ role: "recruiter" });
    const activeStudents = await User.countDocuments({ role: "student" });
    const totalHires = await Application.countDocuments({ status: "Offered" });

    res.json({
      totalUsers,
      totalJobs,
      totalApplications,
      totalHires,
      activeRecruiters,
      activeStudents,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    const mapped = users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      role: u.role,
      avatar: u.avatar || "",
      email: u.email,
      status: "active",
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create a new user (admin only)
// @route   POST /api/admin/users
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, company } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role,
      company: company || "",
    });

    res.status(201).json({
      message: "User created successfully",
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getStats, getUsers, deleteUser, createUser };
