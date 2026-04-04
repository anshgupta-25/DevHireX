const express = require("express");
const router = express.Router();
const { getStats, getUsers, deleteUser } = require("../controllers/adminController");
const { protect, requireRole } = require("../middleware/auth");

router.use(protect);
router.use(requireRole("admin"));

router.get("/stats", getStats);
router.get("/users", getUsers);
router.delete("/users/:id", deleteUser);

module.exports = router;
