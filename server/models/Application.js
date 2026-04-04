const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    status: {
      type: String,
      enum: ["Applied", "Shortlisted", "Interview", "Offered", "Rejected"],
      default: "Applied",
    },
  },
  { timestamps: true }
);

// Prevent duplicate applications
applicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
