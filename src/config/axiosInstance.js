import axios from "axios";
import Cookies from "js-cookie";

// Use the user's provided backend URL (not from .env)
const baseURL = "https://heera1backend.mtscorporate.com";

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  // withCredentials can be toggled if you need cookies sent to the API
  // withCredentials: true,
});

// Attach Authorization header from cookie if present
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get("accessToken") || Cookies.get("authToken") || Cookies.get("adminToken") || null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Simple response interceptor (can be extended for refresh token logic)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Example: automatic logout on 401 could be implemented here
    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    Cookies.set("accessToken", token, { expires: 7, secure: true, sameSite: 'strict' });
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
    Cookies.remove("accessToken");
  }
};

export default axiosInstance;
