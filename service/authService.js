// service/authService.js
import api from "./api";

export const login = async (email, password) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    return response.data; // expecting { token: "...", user: {...} }
  } catch (error) {
    throw error.response?.data || { message: "Login failed" };
  }
};
