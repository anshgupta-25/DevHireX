const express = require("express");
const router = express.Router();
const { getJobs, createJob, getJobById } = require("../controllers/jobController");
const { protect, requireRole } = require("../middleware/auth");
const { optionalAuth } = require("../middleware/optionalAuth");

// Public: list jobs (optionalAuth so recruiter=me works when logged in)
router.get("/", optionalAuth, getJobs);
router.get("/:id", getJobById);

// Protected: create job (recruiter only)
router.post("/", protect, requireRole("recruiter"), createJob);

module.exports = router;
