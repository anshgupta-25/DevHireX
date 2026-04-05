const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");
const Notification = require("../models/Notification");
const Message = require("../models/Message");
const fs = require("fs");
const path = require("path");

const deleteFile = (filePath) => {
  if (!filePath) return;
  const fullPath = path.join(__dirname, "..", filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlink(fullPath, (err) => {
      if (err) console.error(`Error deleting file ${fullPath}:`, err);
    });
  }
};

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
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 1. Delete all applications made by this user
    await Application.deleteMany({ userId: user._id });

    // 2. Delete all messages sent or received by this user
    await Message.deleteMany({
      $or: [{ senderId: user._id }, { receiverId: user._id }],
    });

    // 3. Delete all notifications for this user
    await Notification.deleteMany({ userId: user._id });

    // 4. If the user is a recruiter, delete all their jobs and the applications for those jobs
    if (user.role === "recruiter") {
      const jobs = await Job.find({ createdBy: user._id });
      const jobIds = jobs.map((j) => j._id);
      
      // Delete applications for these jobs
      await Application.deleteMany({ jobId: { $in: jobIds } });
      
      // Delete the jobs themselves
      await Job.deleteMany({ createdBy: user._id });
    }

    // 5. Delete physical files (Avatar & Resume)
    if (user.avatar) deleteFile(`uploads/profile-images/${user.avatar}`);
    if (user.resume) deleteFile(`uploads/resumes/${user.resume}`);

    // 6. Finally, delete the user
    await user.deleteOne();

    res.json({ message: "User and all related data deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error during user deletion" });
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
