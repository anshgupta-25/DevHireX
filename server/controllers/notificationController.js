const Notification = require("../models/Notification");

// @desc    Get notifications for current user
// @route   GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    const mapped = notifications.map((n) => ({
      id: n._id.toString(),
      userId: n.userId.toString(),
      title: n.title,
      message: n.message,
      type: n.type,
      read: n.read,
      createdAt: n.createdAt.toLocaleDateString(),
    }));

    res.json(mapped);
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: "Server error fetching notifications" });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
const markRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ id: notification._id.toString(), read: notification.read });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user._id,
      read: false,
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getNotifications, markRead, getUnreadCount };
