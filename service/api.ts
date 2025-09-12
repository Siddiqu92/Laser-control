import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor for token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for 401
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
  /**  Auth */
  async login(email: string, password: string) {
    const response = await api.post("/auth/login", { email, password });
    const data = response.data?.data || response.data;

    if (!data?.access_token) throw new Error("No access token received");

    localStorage.setItem("token", data.access_token);
    if (data.refresh_token) localStorage.setItem("refresh_token", data.refresh_token);

    return data;
  },

  /**  Schools */
  async getSchools() {
    const res = await api.get(`/items/school`);
    return res.data.data;
  },

  /** Teachers */
  async getTeachers() {
    const res = await api.get(
      `/users?fields[]=id&fields[]=first_name&fields[]=last_name&filter[_and][0][role][name][_contains]=teacher`
    );
    return res.data.data;
  },

  /**  Students */
  async getStudents() {
    const res = await api.get(
      `/users?fields[]=id&fields[]=first_name&fields[]=last_name&filter[_and][0][role][name][_contains]=student`
    );
    return res.data.data;
  },

  /**  Programs of Study */
  async getProgramsOfStudy() {
    const res = await api.get(`/items/program_of_study`);
    return res.data.data;
  },

  async getProgramOfStudyDetailed() {
    const fields =
      "id,name,school_id.id,school_id.name," +
      "courses.course_id.id,courses.course_id.name";

    const res = await api.get(`/items/program_of_study?fields=${fields}`);
    return res.data.data;
  },

  /**  Courses */
  async getCourses() {
    const res = await api.get(`/items/course`);
    return res.data.data;
  },

  /**  Devices */
  async getDevices() {
    const res = await api.get(`/items/device`);
    return res.data.data;
  },

  /**  Student Dashboard */
  async getStudentDashboard(courseId: string | number) {
    const res = await api.get(`/student-dashboard/${courseId}`);
    return res.data.data;
  },

  /**  Student Progress */
  async getStudentProgress(studentId: string | number, courseId: string | number) {
    const res = await api.get(`/student-progress/${studentId}/${courseId}`);
    return res.data.data;
  },




  /**  Student Quiz/Assessment/Exam Detail */
  async getQuizDetail(
    studentId: string | number,
    quizId: string | number,
    type: "practice" | "assessment" | "exam"
  ) {
    const res = await api.get(`/quiz-detail/${studentId}/${quizId}/${type}`);
    return res.data?.data; // returns { questions, summary }
  },
};

export default api;
