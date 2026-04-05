import { generateUploadButton, generateUploadDropzone } from "@uploadthing/react";
import "@uploadthing/react/styles.css";

const serverUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const UploadButton = generateUploadButton({
  url: `${serverUrl}/api/uploadthing`,
});

export const UploadDropzone = generateUploadDropzone({
  url: `${serverUrl}/api/uploadthing`,
});
