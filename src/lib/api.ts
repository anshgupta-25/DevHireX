import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach JWT token from sessionStorage (per-tab)
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("hireflow_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: pass errors through without forced redirects
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default api;
