const express = require("express");
const router = express.Router();
const { getProfile, updateProfile, getPublicProfile } = require("../controllers/profileController");
const { protect } = require("../middleware/auth");

// Public profile (must be before protect middleware)
router.get("/:id", protect, getPublicProfile);

router.use(protect);

router.get("/", getProfile);
router.put("/", updateProfile);

module.exports = router;
