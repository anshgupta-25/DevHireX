const express = require("express");
const router = express.Router();
const { getMessages, sendMessage, getContacts } = require("../controllers/messageController");
const { protect } = require("../middleware/auth");

router.use(protect);

// Contacts must be before /:contactId to avoid matching "contacts" as an ID
router.get("/contacts", getContacts);
router.get("/:contactId", getMessages);
router.post("/", sendMessage);

module.exports = router;
