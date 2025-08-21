// api.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

export const ApiService = {
  async login(email: string, password: string) {
    const response = await api.post("/auth/login", { email, password });
    const data = response.data?.data || response.data;

    if (!data?.access_token) throw new Error("No access token received");

    localStorage.setItem("token", data.access_token);
    if (data.refresh_token) {
      localStorage.setItem("refresh_token", data.refresh_token);
    }

    return data;
  },

  async getProgramOfStudyDetailed() {
    const fields =
      "id,name,school_id.id,school_id.name," +
      "courses.course_id.id,courses.course_id.name";

    const res = await api.get(`/items/program_of_study?fields=${fields}`);
    return res.data.data;
  },

  async getStudentDashboard(courseId: string) {
    const res = await api.get(`/student-dashboard/${courseId}`);
    return res.data.data;
  },

  async getStudentProgress(studentId: string | number, courseId: string | number) {
    const res = await api.get(`/student-progress/${studentId}/${courseId}`);
    return res.data.data;
  },
};

export default api;
