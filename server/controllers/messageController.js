const Message = require("../models/Message");
const User = require("../models/User");

// @desc    Get messages between current user and a contact
// @route   GET /api/messages/:contactId
const getMessages = async (req, res) => {
  try {
    const { contactId } = req.params;
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: contactId },
        { senderId: contactId, receiverId: userId },
      ],
    })
      .populate("senderId", "name")
      .sort({ createdAt: 1 });

    // Mark received messages as read
    await Message.updateMany(
      { senderId: contactId, receiverId: userId, read: false },
      { read: true }
    );

    const mapped = messages.map((msg) => ({
      id: msg._id.toString(),
      senderId: msg.senderId._id.toString(),
      senderName: msg.senderId.name,
      receiverId: msg.receiverId.toString(),
      content: msg.text,
      timestamp: msg.createdAt.toISOString(),
      read: msg.read,
    }));

    res.json(mapped);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Server error fetching messages" });
  }
};

// @desc    Send a message
// @route   POST /api/messages
const sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;

    if (!receiverId || !text) {
      return res.status(400).json({ message: "Receiver ID and text are required" });
    }

    const message = await Message.create({
      senderId: req.user._id,
      receiverId,
      text,
    });

    const populated = await Message.findById(message._id).populate("senderId", "name");

    const response = {
      id: populated._id.toString(),
      senderId: populated.senderId._id.toString(),
      senderName: populated.senderId.name,
      receiverId: populated.receiverId.toString(),
      content: populated.text,
      timestamp: populated.createdAt.toISOString(),
      read: populated.read,
    };

    // Emit via socket
    const io = req.app.get("io");
    if (io) {
      io.to(receiverId).emit("newMessage", response);
    }

    res.status(201).json(response);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Server error sending message" });
  }
};

// @desc    Get contacts with last message
// @route   GET /api/messages/contacts
const getContacts = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all unique users that the current user has messaged with
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    }).sort({ createdAt: -1 });

    const contactMap = new Map();

    for (const msg of messages) {
      const contactId =
        msg.senderId.toString() === userId.toString()
          ? msg.receiverId.toString()
          : msg.senderId.toString();

      if (!contactMap.has(contactId)) {
        contactMap.set(contactId, {
          lastMsg: msg.text,
          unread:
            msg.receiverId.toString() === userId.toString() && !msg.read ? 1 : 0,
        });
      } else if (
        msg.receiverId.toString() === userId.toString() &&
        !msg.read
      ) {
        const existing = contactMap.get(contactId);
        existing.unread += 1;
      }
    }

    const contactIds = Array.from(contactMap.keys());
    const users = await User.find({ _id: { $in: contactIds } }).select(
      "name company online"
    );

    const contacts = users.map((u) => {
      const data = contactMap.get(u._id.toString());
      return {
        id: u._id.toString(),
        name: u.name,
        company: u.company || "",
        online: u.online,
        lastMsg: data?.lastMsg || "",
        unread: data?.unread || 0,
      };
    });

    res.json(contacts);
  } catch (error) {
    console.error("Get contacts error:", error);
    res.status(500).json({ message: "Server error fetching contacts" });
  }
};

module.exports = { getMessages, sendMessage, getContacts };
