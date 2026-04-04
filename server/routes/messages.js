const express = require("express");
const router = express.Router();
const { getMessages, sendMessage, getContacts, getUnreadCount } = require("../controllers/messageController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/unread-count", getUnreadCount);
// Contacts must be before /:contactId to avoid matching "contacts" as an ID
router.get("/contacts", getContacts);
router.get("/:contactId", getMessages);
router.post("/", sendMessage);

module.exports = router;
