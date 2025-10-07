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

  async getCourseById(courseId: string | number) {
    const res = await api.get(`/items/course/${courseId}`);
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

  /** Course Viewer */
  async getCourseViewer(courseId: string | number): Promise<CourseViewerResponse> {
    const res = await api.get(`/course-viewer/${courseId}`);
    return res.data.data as CourseViewerResponse; 
  },

  /**  Student Quiz/Assessment/Exam Detail */
  async getQuizDetail(
    studentId: string | number,
    quizId: string | number,
    type: "practice" | "assessment" | "exam"
  ) {
    const res = await api.get(`/quiz-detail/${studentId}/${quizId}/${type}`);
    return res.data?.data; 
  },

  // ==================== COURSE EDIT APIs ====================
  
  /** Update Learning Object */
  updateLearningObject(id: string | number, data: {
    name?: string;
    description?: string;
    grade?: string;
    subject?: string;
    character_voice?: string;
    learning_object_tags?: string;
  }) {
    return api.put(`/course-edit/learning-object/${id}`, data).then(res => res.data);
  },

  /** Update Topic */
  updateTopic(id: string | number, data: {
    name?: string;
    description?: string;
    character_voice?: string;
    message?: string;
  }) {
    return api.put(`/course-edit/topic/${id}`, data).then(res => res.data);
  },

  /** Update Activity */
  updateActivity(id: string | number, data: {
    name?: string;
    description?: string;
    character_voice?: string;
    message?: string;
    file?: string;
    url?: string;
  }) {
    return api.put(`/course-edit/activity/${id}`, data).then(res => res.data);
  },

  /** Update Assessment */
  updateAssessment(id: string | number, data: {
    name?: string;
    description?: string;
    weight?: number;
    time_limit?: number;
    passing_score?: number;
  }) {
    return api.put(`/course-edit/assessment/${id}`, data).then(res => res.data);
  },

  /** Update Exam */
  updateExam(id: string | number, data: {
    name?: string;
    description?: string;
    weight?: number;
    time_limit?: number;
    passing_score?: number;
  }) {
    return api.put(`/course-edit/exam/${id}`, data).then(res => res.data);
  },

  /** Update Assessment Question */
  updateAssessmentQuestion(id: string | number, data: {
    statement?: string;
  }) {
    return api.put(`/course-edit/assessment-question/${id}`, data).then(res => res.data);
  },

  /** Update Exam Question */
  updateExamQuestion(id: string | number, data: {
    statement?: string;
  }) {
    return api.put(`/course-edit/exam-question/${id}`, data).then(res => res.data);
  },

  /** Update Practice Question */
  updatePracticeQuestion(id: string | number, data: {
    statement?: string;
  }) {
    return api.put(`/course-edit/practice-question/${id}`, data).then(res => res.data);
  },

  /** Add New Questions */
  addQuestions(type: 'assessment' | 'exam' | 'practice', parentId: string | number, questions: Array<{
    statement: string;
  }>) {
    return api.post(`/course-edit/${type}/${parentId}/questions`, { questions }).then(res => res.data);
  },

  /** Delete Question */
  deleteQuestion(type: 'assessment' | 'exam' | 'practice', id: string | number) {
    return api.delete(`/course-edit/${type}/question/${id}`).then(res => res.data);
  },
};

export default api;

// Types for Course Viewer API
export interface CourseViewerResponse {
  course: {
    id: number;
    name: string;
    description?: string | null;
    program_of_study?: string | null;
    session?: string | null;
    status?: string | null;
  };
  studentProgressData: {
    lessons: Array<{
      id: number;
      name: string;
      type: string;
      sort?: number;
      progress?: number;
      completed?: boolean;
      score?: number;
      children?: Array<{
        id: number;
        name: string;
        type: string;
        sort?: number;
        progress?: number;
        score?: number;
        question_count?: number;
        weightage?: number;
      }>;
    }>;
  };
  courseComponents: {
    learning_objects: Array<{
      description: any;
      grade: any;
      subject: any;
      character_voice: any;
      learning_object_tags: any;
      id: number;
      name?: string;
      topics?: Array<{
        topics: any;
        id: number;
        name: string;
        activities?: Array<{
          id: number;
          name: string;
          type: string;
        }>;
      }>;
    }>;
    assessments: Array<any>;
    exams: Array<any>;
    activities: Array<any>;
  };
  courseMetadata?: {
    created_date?: string;
    last_modified?: string;
    total_students?: number;
    completion_rate?: number;
    average_score?: number;
  };
  gradingScheme?: {
    assessment_weight?: number;
    mid_term_weight?: number;
    final_exam_weight?: number;
    grading_scale?: Record<string, number>;
  };
  schedule?: {
    start_date?: string;
    end_date?: string;
    total_weeks?: number;
    weekly_commitment?: string;
  };
  future_types?: Array<string>;
}