const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directories exist
const profileDir = path.join(__dirname, "../uploads/profile-images");
const resumeDir = path.join(__dirname, "../uploads/resumes");
if (!fs.existsSync(profileDir)) fs.mkdirSync(profileDir, { recursive: true });
if (!fs.existsSync(resumeDir)) fs.mkdirSync(resumeDir, { recursive: true });

// ── Profile Image Storage ──
const profileImageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, profileDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${req.user._id}${ext}`;
    cb(null, name);
  },
});

const profileImageFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype.split("/")[1]);
  if (ext && mime) return cb(null, true);
  cb(new Error("Only .jpg, .png, .webp images are allowed"));
};

// ── Resume Storage ──
const resumeStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, resumeDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${req.user._id}${ext}`;
    cb(null, name);
  },
});

const resumeFilter = (_req, file, cb) => {
  if (file.mimetype === "application/pdf") return cb(null, true);
  cb(new Error("Only PDF files are allowed"));
};

// Export configured uploaders
const uploadProfileImage = multer({
  storage: profileImageStorage,
  fileFilter: profileImageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadResume = multer({
  storage: resumeStorage,
  fileFilter: resumeFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

module.exports = { uploadProfileImage, uploadResume };
