require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Job = require("./models/Job");
const Application = require("./models/Application");
const Message = require("./models/Message");
const Notification = require("./models/Notification");

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { tlsInsecure: true });
    console.log("✅ Connected to MongoDB for seeding");

    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    await Message.deleteMany({});
    await Notification.deleteMany({});
    console.log("🗑️  Cleared all existing data");

    // Create user accounts only — no dummy content
    const student = await User.create({
      name: "Alex Chen",
      email: "alex@example.com",
      password: "password123",
      role: "student",
      skills: ["React", "TypeScript", "Node.js", "Python"],
      bio: "Full-stack developer passionate about building great products.",
      location: "San Francisco, CA",
      experience: "2 years",
      online: false,
    });

    const student2 = await User.create({
      name: "Sarah Kim",
      email: "sarah@example.com",
      password: "password123",
      role: "student",
      skills: ["Figma", "UI/UX", "React"],
      bio: "Designer turned developer with a passion for pixel-perfect UIs.",
      location: "New York, NY",
      experience: "1 year",
      online: false,
    });

    const recruiter = await User.create({
      name: "Emily Johnson",
      email: "emily@novatech.com",
      password: "password123",
      role: "recruiter",
      company: "NovaTech",
      bio: "Head of Talent at NovaTech. Looking for exceptional engineers.",
      location: "San Francisco, CA",
      online: false,
    });

    const recruiter2 = await User.create({
      name: "James Park",
      email: "james@cloudpeak.com",
      password: "password123",
      role: "recruiter",
      company: "CloudPeak",
      bio: "Engineering Manager at CloudPeak. Building the future of cloud.",
      location: "Remote",
      online: false,
    });

    const admin = await User.create({
      name: "Admin User",
      email: "admin@hireflow.com",
      password: "password123",
      role: "admin",
      bio: "Platform administrator",
      online: false,
    });

    console.log("👥 Created user accounts");
    console.log("\n✅ Database seeded successfully! (Users only — no dummy content)");
    console.log("\n📧 Login credentials:");
    console.log("   Student:   alex@example.com / password123");
    console.log("   Student2:  sarah@example.com / password123");
    console.log("   Recruiter: emily@novatech.com / password123");
    console.log("   Recruiter2: james@cloudpeak.com / password123");
    console.log("   Admin:     admin@hireflow.com / password123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

seedDB();
