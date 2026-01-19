import axios from "axios";

const api = axios.create({
  // ⚠️ WAJIB pakai /api
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    "https://api.finprojek.web.id/api",

  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },

  // ❌ JANGAN pakai cookie
  // Backend kamu pakai Bearer token, bukan session
  withCredentials: false,
});

/**
 * REQUEST INTERCEPTOR
 * Otomatis kirim Bearer token jika ada
 */
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * RESPONSE INTERCEPTOR (OPSIONAL TAPI DISARANKAN)
 * Auto logout kalau token invalid / expired
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined") {
      if (error.response?.status === 401) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");

        // redirect ke login
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
