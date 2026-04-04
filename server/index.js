require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const setupSocket = require("./socket");

// Route imports
const authRoutes = require("./routes/auth");
const jobRoutes = require("./routes/jobs");
const applicationRoutes = require("./routes/applications");
const profileRoutes = require("./routes/profile");
const messageRoutes = require("./routes/messages");
const notificationRoutes = require("./routes/notifications");
const adminRoutes = require("./routes/admin");
const uploadRoutes = require("./routes/upload");
const path = require("path");


const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
    credentials: true
  },
});

// Make io accessible in routes
app.set("io", io);

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);

// Serve uploaded files as static
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Setup Socket.IO handlers
setupSocket(io);

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

const User = require("./models/User");

connectDB().then(async () => {
  console.log("✅ MongoDB Connected successfully");

  try {
    // Seed admin user
    const existingAdmin = await User.findOne({ email: "ansh25" });
    if (!existingAdmin) {
      await User.create({
        name: "Admin",
        email: "ansh25",
        password: "ansh2501",
        role: "admin",
      });
      console.log("👑 Admin user created (ansh25)");
    } else {
      // Ensure password is correct if user already exists
      existingAdmin.password = "ansh2501";
      await existingAdmin.save();
    }
  } catch (error) {
    console.error("Failed to seed admin:", error);
  }

}).catch((err) => {
  console.error("❌ MongoDB Connection failed! Your API will crash on data requests.");
  console.error("👉 NOTE: If using Atlas, ensure your IP address is whitelisted in Network Access.");
  console.error(err.message);
});

// Always start the server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO ready`);
});
