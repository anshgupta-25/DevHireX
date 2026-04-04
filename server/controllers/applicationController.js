const Application = require("../models/Application");
const Job = require("../models/Job");
const Notification = require("../models/Notification");

// @desc    Apply to a job
// @route   POST /api/applications
const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: "Job ID is required" });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check if already applied
    const existing = await Application.findOne({ userId: req.user._id, jobId });
    if (existing) {
      return res.status(400).json({ message: "You have already applied to this job" });
    }

    const application = await Application.create({
      userId: req.user._id,
      jobId,
      status: "Applied",
    });

    // Increment applicant count on job
    await Job.findByIdAndUpdate(jobId, { $inc: { applicants: 1 } });

    // Create notification for recruiter
    await Notification.create({
      userId: job.createdBy,
      title: "New Application",
      message: `${req.user.name} applied for ${job.title}`,
      type: "application",
    });

    // Emit socket notification if io is available
    const io = req.app.get("io");
    if (io) {
      io.to(job.createdBy.toString()).emit("notification", {
        title: "New Application",
        message: `${req.user.name} applied for ${job.title}`,
        type: "application",
      });
    }

    const populated = await Application.findById(application._id)
      .populate("jobId", "title company")
      .populate("userId", "name skills avatar");

    res.status(201).json({
      id: populated._id.toString(),
      jobId: populated.jobId._id.toString(),
      jobTitle: populated.jobId.title,
      company: populated.jobId.company,
      studentId: populated.userId._id.toString(),
      studentName: populated.userId.name,
      studentAvatar: populated.userId.avatar || "",
      status: populated.status,
      appliedAt: populated.createdAt.toISOString().split("T")[0],
      skills: populated.userId.skills || [],
    });
  } catch (error) {
    console.error("Apply error:", error);
    res.status(500).json({ message: "Server error applying to job" });
  }
};

// @desc    Get applications (student sees own, recruiter sees for their jobs)
// @route   GET /api/applications
const getApplications = async (req, res) => {
  try {
    let applications;

    if (req.user.role === "student") {
      applications = await Application.find({ userId: req.user._id })
        .populate("jobId", "title company skills createdBy")
        .populate("userId", "name skills avatar")
        .sort({ createdAt: -1 });
    } else if (req.user.role === "recruiter") {
      // Get recruiter's jobs first
      const recruiterJobs = await Job.find({ createdBy: req.user._id }).select("_id");
      const jobIds = recruiterJobs.map((j) => j._id);

      applications = await Application.find({ jobId: { $in: jobIds } })
        .populate("jobId", "title company skills")
        .populate("userId", "name skills avatar")
        .sort({ createdAt: -1 });
    } else {
      // Admin sees all
      applications = await Application.find()
        .populate("jobId", "title company skills")
        .populate("userId", "name skills avatar")
        .sort({ createdAt: -1 });
    }

    const mapped = applications.map((app) => ({
      id: app._id.toString(),
      jobId: app.jobId?._id?.toString() || "",
      jobTitle: app.jobId?.title || "",
      company: app.jobId?.company || "",
      recruiterId: app.jobId?.createdBy?.toString() || "",
      studentId: app.userId?._id?.toString() || "",
      studentName: app.userId?.name || "",
      studentAvatar: app.userId?.avatar || "",
      status: app.status,
      appliedAt: app.createdAt.toISOString().split("T")[0],
      skills: app.userId?.skills || [],
    }));

    res.json(mapped);
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({ message: "Server error fetching applications" });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const application = await Application.findById(req.params.id)
      .populate("jobId", "title company")
      .populate("userId", "name avatar");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = status;
    await application.save();

    // Notify the student
    await Notification.create({
      userId: application.userId._id,
      title: "Application Update",
      message: `Your application for ${application.jobId.title} at ${application.jobId.company} has been ${status.toLowerCase()}!`,
      type: "application",
    });

    // Emit socket notification
    const io = req.app.get("io");
    if (io) {
      io.to(application.userId._id.toString()).emit("notification", {
        title: "Application Update",
        message: `Your application for ${application.jobId.title} has been ${status.toLowerCase()}!`,
        type: "application",
      });
    }

    res.json({ id: application._id.toString(), status: application.status });
  } catch (error) {
    console.error("Update application error:", error);
    res.status(500).json({ message: "Server error updating application" });
  }
};

module.exports = { applyToJob, getApplications, updateApplicationStatus };
