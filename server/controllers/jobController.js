const Job = require("../models/Job");
const User = require("../models/User");
const Notification = require("../models/Notification");

// @desc    Get all jobs (with optional search/filter)
// @route   GET /api/jobs
const getJobs = async (req, res) => {
  try {
    const { search, type, skills, recruiter, limit } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ];
    }

    if (type && type !== "All") {
      query.type = type;
    }

    if (skills) {
      const skillsArr = skills.split(",");
      query.skills = { $in: skillsArr };
    }

    if (recruiter === "me" && req.user) {
      query.createdBy = req.user._id;
    }

    let jobsQuery = Job.find(query)
      .populate("createdBy", "name email company")
      .sort({ createdAt: -1 });

    if (limit) {
      jobsQuery = jobsQuery.limit(parseInt(limit));
    }

    const jobs = await jobsQuery;

    // Map to match frontend interface
    const mapped = jobs.map((job) => ({
      id: job._id.toString(),
      title: job.title,
      company: job.company,
      companyLogo: job.companyLogo,
      location: job.location,
      type: job.type,
      salary: job.salary,
      skills: job.skills,
      description: job.description,
      postedAt: job.postedAt,
      applicants: job.applicants,
      recruiterId: job.createdBy?._id?.toString() || "",
    }));

    res.json(mapped);
  } catch (error) {
    console.error("Get jobs error:", error);
    res.status(500).json({ message: "Server error fetching jobs" });
  }
};

// @desc    Create a new job
// @route   POST /api/jobs
const createJob = async (req, res) => {
  try {
    const { title, company, location, type, salary, skills, description } = req.body;

    if (!title || !company || !location || !salary || !description) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const job = await Job.create({
      title,
      company: company || req.user.company,
      location,
      type: type || "Full-time",
      salary,
      skills: skills || [],
      description,
      createdBy: req.user._id,
    });

    // Notify all students about the new job
    const students = await User.find({ role: "student" }).select("_id");
    const notifDocs = students.map((s) => ({
      userId: s._id,
      title: "New Job Posted",
      message: `${job.title} at ${job.company} — ${job.location}`,
      type: "system",
    }));
    await Notification.insertMany(notifDocs);

    // Emit real-time notifications to all students
    const io = req.app.get("io");
    if (io) {
      students.forEach((s) => {
        io.to(s._id.toString()).emit("notification", {
          title: "New Job Posted",
          message: `${job.title} at ${job.company} — ${job.location}`,
          type: "system",
        });
      });
    }

    res.status(201).json({
      id: job._id.toString(),
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      salary: job.salary,
      skills: job.skills,
      description: job.description,
      postedAt: job.postedAt,
      applicants: job.applicants,
      recruiterId: req.user._id.toString(),
    });
  } catch (error) {
    console.error("Create job error:", error);
    res.status(500).json({ message: "Server error creating job" });
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("createdBy", "name email company");

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({
      id: job._id.toString(),
      title: job.title,
      company: job.company,
      companyLogo: job.companyLogo,
      location: job.location,
      type: job.type,
      salary: job.salary,
      skills: job.skills,
      description: job.description,
      postedAt: job.postedAt,
      applicants: job.applicants,
      recruiterId: job.createdBy?._id?.toString() || "",
    });
  } catch (error) {
    console.error("Get job error:", error);
    res.status(500).json({ message: "Server error fetching job" });
  }
};

module.exports = { getJobs, createJob, getJobById };
