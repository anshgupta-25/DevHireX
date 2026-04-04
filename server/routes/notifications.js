const express = require("express");
const router = express.Router();
const { getNotifications, markRead, getUnreadCount } = require("../controllers/notificationController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/:id/read", markRead);

module.exports = router;
