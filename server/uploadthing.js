const { createUploadthing } = require("uploadthing/express");

const f = createUploadthing();

const uploadRouter = {
  // Define upload routes
  profileImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  }).onUploadComplete((data) => {
    console.log("Profile Image upload complete", data);
  }),

  resumeFile: f({
    pdf: { maxFileSize: "8MB", maxFileCount: 1 },
  }).onUploadComplete((data) => {
    console.log("Resume upload complete", data);
  }),
};

module.exports = { uploadRouter };
