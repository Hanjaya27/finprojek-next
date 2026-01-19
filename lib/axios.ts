import axios from "axios";

const api = axios.create({
  baseURL: "https://api.finprojek.web.id/api", // ⬅️ WAJIB ADA /api
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// interceptor token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
