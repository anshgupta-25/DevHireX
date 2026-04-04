const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { uploadProfileImage, uploadResume } = require("../middleware/upload");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");

// POST /api/upload/profile-image
router.post("/profile-image", protect, (req, res) => {
  uploadProfileImage.single("profileImage")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || "Upload failed" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    try {
      const fileUrl = `/uploads/profile-images/${req.file.filename}`;

      // Delete old profile image if it exists
      const user = await User.findById(req.user._id);
      if (user.avatar && user.avatar.startsWith("/uploads/")) {
        const oldPath = path.join(__dirname, "..", user.avatar);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      // Update user record
      user.avatar = fileUrl;
      await user.save();

      res.json({
        message: "Profile photo updated",
        fileUrl,
        user: user.toJSON(),
      });
    } catch (error) {
      console.error("Profile image upload error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
});

// POST /api/upload/resume
router.post("/resume", protect, (req, res) => {
  uploadResume.single("resume")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || "Upload failed" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    try {
      const fileUrl = `/uploads/resumes/${req.file.filename}`;

      // Delete old resume if it exists
      const user = await User.findById(req.user._id);
      if (user.resume && user.resume.startsWith("/uploads/")) {
        const oldPath = path.join(__dirname, "..", user.resume);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      // Update user record
      user.resume = fileUrl;
      await user.save();

      res.json({
        message: "Resume uploaded successfully",
        fileUrl,
        fileName: req.file.originalname,
        user: user.toJSON(),
      });
    } catch (error) {
      console.error("Resume upload error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
});

module.exports = router;
