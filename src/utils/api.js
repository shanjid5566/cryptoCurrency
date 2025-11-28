import axios from "axios";

// Base URL for the API (hardcoded per user request)
const API_BASE = "https://heera1backend.mtscorporate.com";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  }, 
});

// Attach Authorization header when accessToken exists in localStorage
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
