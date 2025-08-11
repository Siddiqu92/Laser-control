// service/api.js
import axios from "axios";

const api = axios.create({

  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token in header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
