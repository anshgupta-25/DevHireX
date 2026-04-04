require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./server/models/User");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    const existing = await User.findOne({ email: "ansh25" });
    if (!existing) {
      const admin = await User.create({
        name: "Admin",
        email: "ansh25",
        password: "ansh2501",
        role: "admin",
      });
      console.log("Admin created:", admin);
    } else {
      // update password if needed
      existing.password = "ansh2501";
      await existing.save();
      console.log("Admin updated:", existing);
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
});
