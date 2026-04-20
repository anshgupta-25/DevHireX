const User = require("./models/User");

const setupSocket = (io) => {
  // Track online users: userId -> socketId
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // User joins with their userId
    socket.on("join", async (userId) => {
      if (!userId) return;

      // Disconnect any previous socket for this user (prevents stale connections)
      const existingSocketId = onlineUsers.get(userId);
      if (existingSocketId && existingSocketId !== socket.id) {
        const existingSocket = io.sockets.sockets.get(existingSocketId);
        if (existingSocket) {
          console.log(`🔄 Disconnecting old socket ${existingSocketId} for user ${userId}`);
          existingSocket.disconnect(true);
        }
      }

      socket.join(userId);
      onlineUsers.set(userId, socket.id);

      // Mark user online
      try {
        await User.findByIdAndUpdate(userId, { online: true });
      } catch (err) {
        console.error("Error updating online status:", err);
      }

      console.log(`👤 User ${userId} joined room`);
    });

    // Real-time message
    socket.on("sendMessage", (data) => {
      const { receiverId } = data;
      if (receiverId) {
        io.to(receiverId).emit("newMessage", data);
      }
    });

    // Real-time notification
    socket.on("sendNotification", (data) => {
      const { userId } = data;
      if (userId) {
        io.to(userId).emit("notification", data);
      }
    });

    // Disconnect
    socket.on("disconnect", async () => {
      // Find and remove user from online map
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          try {
            await User.findByIdAndUpdate(userId, { online: false });
          } catch (err) {
            console.error("Error updating offline status:", err);
          }
          break;
        }
      }
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupSocket;
