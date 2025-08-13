
import axios from "axios";
import api from "../config/api";

export const ApiService = {
  // LOGIN
  async login(email: string, password: string) {
    const response = await api.post("/auth/login", { email, password });
    const { access_token, user } = response.data.data || {};
    if (!access_token) throw new Error("No access token returned");

    localStorage.setItem("token", access_token);
    return { token: access_token, user };
  },

  // GET STUDENT INFO & COURSES
  async getStudentInfoAndCourses() {
    const res = await api.get("/get-student-info-and-courses");
    return res.data;
  },

  // PROGRAM OF STUDY
  async getPrograms() {
    const res = await api.get("/items/program_of_study");
    return res.data;
  },

  // COURSES
  async getCourses() {
    const res = await api.get("/items/course");
    return res.data;
  },

  // GET USERS (Students Only)
  async getStudents(limit = 25, page = 1) {
    const query =
      `/users?limit=${limit}` +
      `&fields[]=id&fields[]=avatar.modified_on&fields[]=avatar.type` +
      `&fields[]=avatar.filename_disk&fields[]=avatar.storage&fields[]=avatar.id` +
      `&fields[]=first_name&fields[]=last_name&fields[]=email` +
      `&page=${page}&filter[_and][0][role][name][_contains]=student`;

    const res = await api.get(query);
    return res.data;
  },

  // GET SINGLE COURSE BY ID
  async getCourseById(courseId: string) {
    const res = await api.get(`/courses/61/${courseId}`);
    return res.data;
  },

  // STUDENT COURSE PROGRESS
  async getStudentCourseProgress() {
    const res = await api.get("/items/student_course_progress");
    return res.data;
  },
};






const API_BASE_URL = "http://stg.naraschools.net:8055";

export const getProgramOfStudy = async (token: string) => {
  const fields =
    "id,name,school_id.id,school_id.name," +
    "courses.course_id.id,courses.course_id.name," +
    "courses.course_id.student_course_progress.id," +
    "courses.course_id.student_course_progress.status," +
    "courses.course_id.student_course_progress.student_id.id," +
    "courses.course_id.student_course_progress.student_id.name";

  const res = await axios.get(
    `${API_BASE_URL}/items/program_of_study?fields=${fields}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.data;
};
