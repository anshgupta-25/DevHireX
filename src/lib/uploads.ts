const API_BASE_URL = import.meta.env.VITE_API_URL || "";

/**
 * Returns a full URL for uploaded files.
 * If the path starts with /uploads/, prepend the API base URL.
 * If it's already a full URL (http/https), return as is.
 * If empty, return empty string.
 */
export function getUploadUrl(filePath: string | undefined): string {
  if (!filePath) return "";
  if (filePath.startsWith("http")) return filePath;
  if (filePath.startsWith("/uploads/")) return `${API_BASE_URL}${filePath}`;
  return filePath;
}
