import { generateReactHelpers } from "@uploadthing/react";

// You don't need to pass generic type here as the actual endpoints are defined on the backend.
// UploadThing internally wires these if it knows the API endpoint.
export const { useUploadThing, uploadFiles } = generateReactHelpers({
  url: import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL}/api/uploadthing` 
    : "/api/uploadthing",
});
