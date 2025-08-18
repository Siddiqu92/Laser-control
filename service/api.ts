import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
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

  async refreshToken() {
    const refresh_token = localStorage.getItem("refresh_token");
    if (!refresh_token) throw new Error("No refresh token available");

    const response = await api.post("/auth/refresh", { refresh_token });
    const newAccessToken =
      response.data?.data?.access_token || response.data?.access_token;

    if (!newAccessToken) throw new Error("No access token returned");

    localStorage.setItem("token", newAccessToken);
    return newAccessToken;
  },

  async getPrograms() {
    const res = await api.get("/items/program_of_study");
    return res.data.data;
  },

  async getCourses() {
    const res = await api.get("/items/course");
    return res.data.data;
  },

  async getProgramOfStudyDetailed() {
    const fields =
      "id,name,school_id.id,school_id.name," +
      "courses.course_id.id,courses.course_id.name," +
      "courses.course_id.student_course_progress.id," +
      "courses.course_id.student_course_progress.status," +
      "courses.course_id.student_course_progress.student_id.id," +
      "courses.course_id.student_course_progress.student_id.name";

    const res = await api.get(`/items/program_of_study?fields=${fields}`);
    return res.data.data;
  },
};

export default api;
