export interface CourseDetails {
  id: number;
  name: string;
  description: string | null;
  program_of_study: string | null;
  session: string | null;
  status: string;
   character_voice?: string; 
   course_type?: string; 
}
export type ComponentType = "learning_object" | "assessment" | "exam" | "fun_activity" | "lesson";
export interface CourseViewerProps {
  course?: CourseDetails | null;
  courseId?: string;
}
export interface LessonData {
  id: number;
  name: string;
  type: string;
  progress?: number;
  completed?: boolean;
  description?: string;
  children?: Array<{
    weightage: boolean;
    id: number;
    name: string;
    type: string;
    progress?: number;
    completed?: boolean;
    description?: string;
    metadata?: {
      id: number;
      name: string;
      description?: string;
      grade?: string;
      subject?: string;
      character_voice?: string;
      learning_object_tags?: string;
    };
    children?: Array<{
      id: number;
      name: string;
      type: string;
      progress?: number;
      completed?: boolean;
      description?: string;
      metadata?: {
        id: number;
        name: string;
        description?: string;
        grade?: string;
        subject?: string;
        character_voice?: string;
        learning_object_tags?: string;
      };
    }>;
  }>;
  question_count?: number;
  weightage?: number;
}
export interface LessonItem {
  title: string;
  description?: string;
  icon: string;
  count: string;
  type: string;
  id: number;
  completed?: boolean;
  children?: LessonItem[];
  grade?: string;
  subject?: string;
  character_voice?: string;
  learning_object_tags?: string;
}
export interface FileDetails {
  id: string;
  url: string;
  filename_download: string;
  type: string;
  filesize: number;
  duration?: number;
  width?: number;
  height?: number;
  storage: string;
  title?: string;
}
export interface Question {
  id: number;
  statement: string;
  question_type: string;
  max_points: number;
  image?: FileDetails;
  options?: Option[];
  correct_answer?: string;
  explanation?: string;
}
export interface Option {
  id: number;
  text: string;
  is_correct: boolean;
  image?: FileDetails;
}
export interface Activity {
  id: number;
  name: string;
  type: string;
  description?: string;
  file?: FileDetails;
  character_voice?: string;
  questions?: Question[];
  metadata?: any;
}
export interface Topic {
  id: number;
  name: string;
  type: string;
  description?: string;
  learning_object_id?: number;
  character_voice?: string;
  activities?: Activity[];
  children?: Topic[];
  metadata?: any;
}
export interface TopicGroup {
  id: number;
  name: string;
  description?: string;
  topics: Topic[];
}
export interface LearningObject {
  id: number;
  name: string;
  description?: string;
  topics: TopicGroup[];
}
export interface Assessment {
  id: number;
  name: string;
  description?: string;
  total_questions: number;
  weight?: number;
  questions: Question[];
}
export interface Exam {
  id: number;
  name: string;
  description?: string;
  total_questions: number;
  weight?: number;
  questions: Question[];
}
export interface CourseComponents {
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
}
export interface LessonDetailProps {
  lesson: LessonData;
  onViewDetail?: (item: any) => void;
}
export interface CourseDetailsSidebarProps {
  visible: boolean;
  onHide: () => void;
  selectedDetails: any;
  detailsLoading: boolean;
  courseComponents?: any;
  getItemIcon: (type: string) => string | JSX.Element; 
  parseJsonArrayToString: (jsonString: string, type: "grade" | "subject" | "character_voice" | "learning_object_tags") => string;
  onUpdate?: () => void;
  onOpenDetails?: (payload: any) => void;
}
export interface BaseDetailProps {
  selectedDetails: any;
  editMode: boolean;
  editData: any;
  setEditData: (data: any) => void;
  renderEditableField: (label: string, value: string, field: string, type?: 'text' | 'textarea') => React.ReactNode;
  renderDropdownField: (label: string, value: string, field: string, options: any[]) => React.ReactNode;
  renderNumberField: (label: string, value: number, field: string) => React.ReactNode;
  getItemIcon: (type: string) => string | JSX.Element; 
  courseComponents?: CourseComponents | null; 
  onOpenDetails?: (payload: any) => void;
}
export interface QuestionManagementProps {
  editMode: boolean;
  questions: Question[];
  onUpdateQuestion: (questionId: number, statement: string, questionType: 'assessment' | 'exam' | 'practice') => void;
  onDeleteQuestion: (questionId: string, questionType: 'assessment' | 'exam' | 'practice') => void;
}