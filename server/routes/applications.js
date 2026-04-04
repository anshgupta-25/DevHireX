const express = require("express");
const router = express.Router();
const { applyToJob, getApplications, updateApplicationStatus } = require("../controllers/applicationController");
const { protect, requireRole } = require("../middleware/auth");

// All routes are protected
router.use(protect);

router.post("/", requireRole("student"), applyToJob);
router.get("/", getApplications);
router.put("/:id", requireRole("recruiter", "admin"), updateApplicationStatus);

module.exports = router;
