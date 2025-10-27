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


export interface Course {
  id?: number;
  name: string;
  description?: string;
  [key: string]: any; 
}

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

  // ================ NEW SPLIT APIS ================

  async createCourse(courseData: Partial<Course>): Promise<any> {
    const response = await fetch('/api/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(courseData),
    });

    if (!response.ok) {
      throw new Error('Failed to create course');
    }

    return response.json();
  },

  /** Course Overview API - Lightweight Course Data */
  async getCourseOverview(courseId: string | number): Promise<CourseOverviewResponse> {
    const res = await api.get(`/course-viewer/${courseId}`);
    return res.data.data as CourseOverviewResponse;
  },

  /** Component Detail API - Detailed Component Data */
  async getComponentDetail(componentId: string | number): Promise<ComponentDetailResponse> {
    const res = await api.get(`/component-detail/${componentId}`);
    return res.data.data as ComponentDetailResponse;
  },

  /** Activity Detail API - Activity Specific Data */
  async getActivityDetail(activityId: string | number): Promise<ActivityDetailResponse> {
    const res = await api.get(`/activity-detail/activity/${activityId}`);
    return res.data.data as ActivityDetailResponse;
  },

  /** Topic Detail API - Topic Specific Data */
  async getTopicDetail(topicId: string | number): Promise<TopicDetailResponse> {
    const res = await api.get(`/activity-detail/topic/${topicId}`);
    return res.data.data as TopicDetailResponse;
  },

// ================ QUESTION COUNT APIS ================

/** Get Assessment Question Count */
async getAssessmentQuestionCount(assessmentId: string | number): Promise<number> {
  try {
    const res = await api.get(`/items/assessment_question?aggregate[count]=id&filter[_and][0][assessment_id]=${assessmentId}`);
    console.log('Full Assessment API Response:', res);
    
    // Different possible response structures handle karo
    if (res.data?.data?.[0]?.count?.id !== undefined) {
      return res.data.data[0].count.id;
    }
    
    // Agar direct data mein count hai
    if (res.data?.count !== undefined) {
      return res.data.count;
    }
    
    // Agar data array directly count return kar raha hai
    if (Array.isArray(res.data) && res.data[0]?.count?.id !== undefined) {
      return res.data[0].count.id;
    }
    
    console.log('Unexpected API response structure:', res.data);
    return 0;
  } catch (error) {
    console.error('Error fetching assessment question count:', error);
    return 0;
  }
},

/** Get Exam Question Count */
async getExamQuestionCount(examId: string | number): Promise<number> {
  try {
    const res = await api.get(`/items/exam_question?aggregate[count]=id&filter[_and][0][exam_id]=${examId}`);
    console.log('Full Exam API Response:', res);
    
    // Different possible response structures handle karo
    if (res.data?.data?.[0]?.count?.id !== undefined) {
      return res.data.data[0].count.id;
    }
    
    // Agar direct data mein count hai
    if (res.data?.count !== undefined) {
      return res.data.count;
    }
    
    // Agar data array directly count return kar raha hai
    if (Array.isArray(res.data) && res.data[0]?.count?.id !== undefined) {
      return res.data[0].count.id;
    }
    
    console.log('Unexpected API response structure:', res.data);
    return 0;
  } catch (error) {
    console.error('Error fetching exam question count:', error);
    return 0;
  }
},

  // ================ BACKWARD COMPATIBILITY ================
  
  /** Legacy Course Viewer - Uses new Course Overview API */
  async getCourseViewer(courseId: string | number): Promise<CourseOverviewResponse> {
    return this.getCourseOverview(courseId);
  },

  /** Legacy Component Detail - Uses new Component Detail API */
  getCourseViewerDetail(componentId: string | number): Promise<ComponentDetailResponse> {
    return this.getComponentDetail(componentId);
  },

  // ================ CONVENIENCE METHODS ================
  
  /** Get Learning Object Detail */
  getLearningObjectDetail(id: string | number) { 
    return this.getComponentDetail(id); 
  },

  /** Get Assessment Detail */
  getAssessmentDetail(id: string | number) { 
    return this.getComponentDetail(id); 
  },

  /** Get Exam Detail */
  getExamDetail(id: string | number) { 
    return this.getComponentDetail(id); 
  },

  /** Get Lesson Detail - Alias for Component Detail */
  getLessonDetail(id: string | number) { 
    return this.getComponentDetail(id); 
  },

  // ================ QUIZ/ASSESSMENT DETAIL ================
  
  /** Student Quiz/Assessment/Exam Detail */
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

// ================ NEW RESPONSE INTERFACES ================

export interface CourseOverviewResponse {
  course: {
    id: number;
    name: string;
    description?: string | null;
    program_of_study?: string | null;
    session?: string | null;
    status?: string | null;
    course_type?: string | null;
    character_voice?: string | null;
    grading_scheme: {
      total_weight: number;
      components: Array<{
        type: 'assessment' | 'exam';
        name: string;
        weightage: number;
      }>;
    };
    lessons: Array<{
      id: number;
      type: 'learning_object' | 'assessment' | 'exam';
      progress: number;
      completed: boolean;
      sequence_order: number;
      name?: string | null;
      description?: string | null;
      total_topics_count?: number;
      total_questions_count?: number;
      weightage?: number;
    }>;
  };
}

export interface ComponentDetailResponse {
  learning_objects: never[];
  assessments: never[];
  exams: never[];
  component: {
    id: number;
    type: 'learning_object' | 'assessment' | 'exam';
    name: string;
    description?: string | null;
    learning_objects?: Array<{
      id: number;
      character_voice?: string | null;
      name?: string | null;
      description?: string | null;
      grade?: string | null;
      subject?: string | null;
      learning_object_tags?: string | null;
      topics: Array<{
        id: number;
        name: string;
        description?: string | null;
        learning_object_id?: number;
        Character_Voice?: string | null;
        activities: Array<{
          id: number;
          name: string;
          type: string;
          description?: string | null;
          file?: FileDetails | null;
          character_voice?: string | null;
        }>;
      }>;
    }>;
    assessment?: {
      id: number;
      name: string;
      description?: string | null;
      weight?: number;
      questions: Array<QuestionDetails>;
    };
    exam?: {
      id: number;
      name: string;
      description?: string | null;
      weight?: number;
      questions: Array<QuestionDetails>;
    };
  };
}

export interface ActivityDetailResponse {
  activity: {
    id: number;
    name: string;
    type: string;
    description?: string | null;
    file?: FileDetails | null;
    character_voice?: string | null;
    questions: Array<QuestionDetails>;
  };
}

export interface TopicDetailResponse {
  topic: {
    id: number;
    name: string;
    description?: string | null;
    character_voice?: string | null;
    activities: Array<{
      id: number;
      name: string;
      type: string;
      description?: string | null;
    }>;
  };
}

// ================ SHARED INTERFACES ================

export interface FileDetails {
  id: string;
  filename_download: string;
  title?: string | null;
  type: string;
  filesize: number;
  duration?: number | null;
  width?: number | null;
  height?: number | null;
  storage: string;
  metadata: {
    created_on: string;
    modified_on: string;
  };
}

export interface QuestionDetails {
  id: number;
  statement: string;
  question_type: string;
  max_points: number;
  image?: FileDetails | null;
  options: Array<{
    id: number;
    text: string;
    is_correct: boolean;
    image?: FileDetails | null;
  }>;
  correct_answer: any;
  explanation?: string | null;
}

// ================ LEGACY INTERFACES (FOR BACKWARD COMPATIBILITY) ================

export interface CourseViewerResponse extends CourseOverviewResponse {}
export interface CourseViewerDetailResponse extends ComponentDetailResponse {}

// ================ DEPRECATED INTERFACES (TO BE REMOVED EVENTUALLY) ================

/**
 * @deprecated 
 */
export interface OldCourseViewerResponse {
  course: {
    id: number;
    name: string;
    description?: string | null;
    program_of_study?: string | null;
    session?: string | null;
    status?: string | null;
    grading_scheme?: {
      total_weight: number;
      components: Array<{
        type: 'assessment' | 'exam';
        name: string;
        weight: number;
      }>;
    };
    lessons: Array<{
      id: number;
      name: string;
      type: 'learning_object' | 'assessment' | 'exam' | string;
      description?: string | null;
      progress?: number;
      completed?: boolean;
      sequence_order?: number;
      question_count?: number;
      weightage?: number;
      topics?: Array<{
        id: number;
        name: string;
        description?: string | null;
        learning_object_id?: number;
        character_voice?: string | null;
        type: 'topic';
        activities: Array<{
          id: number;
          name: string;
          type: string;
          description?: string | null;
        }>;
      }>;
    }>;
  };
  courseComponents?: {
    learning_objects: Array<{
      id: number;
      name?: string | null;
      description?: string | null;
      topics?: Array<{
        id: number;
        name: string;
        description?: string | null;
        learning_object_id?: number;
        character_voice?: string | null;
        activities: Array<{
          id: number;
          name: string;
          type: string;
          description?: string | null;
          file?: {
            id: string;
            url: string;
            filename_download: string;
            title?: string | null;
            type: string;
            filesize: number;
            duration?: number;
            width?: number;
            height?: number;
            storage: string;
            metadata: {
              created_on: string;
              modified_on: string;
            };
          } | null;
          character_voice?: string | null;
          questions?: Array<{
            id: number;
            statement: string;
            question_type: string;
            max_points: number;
            image?: any;
            options: Array<{
              id: number;
              text: string;
              is_correct: boolean;
              image?: any;
            }>;
            correct_answer: any;
            explanation?: string | null;
          }>;
        }>;
      }>;
    }>;
    assessments: Array<{
      id: number;
      name: string;
      description?: string | null;
      total_questions: number;
      weight?: number | null;
      questions: Array<{
        id: number;
        statement: string;
        question_type: string;
        max_points: number;
        image?: any;
        options: Array<{
          id: number;
          text: string;
          is_correct: boolean;
          image?: any;
        }>;
        correct_answer: any;
        explanation?: string | null;
      }>;
    }>;
    exams: Array<{
      id: number;
      name: string;
      description?: string | null;
      total_questions: number;
      weight?: number | null;
      questions: Array<{
        id: number;
        statement: string;
        question_type: string;
        max_points: number;
        image?: any;
        options: Array<{
          id: number;
          text: string;
          is_correct: boolean;
          image?: any;
        }>;
        correct_answer: any;
        explanation?: string | null;
      }>;
    }>;
  };
  mediaUrls: {
    baseUrl: string;
    filesBaseUrl: string;
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