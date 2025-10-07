export interface CourseDetails {
  id: number;
  name: string;
  description: string | null;
  program_of_study: string | null;
  session: string | null;
  status: string;
}

export type ComponentType = "learning_object" | "assessment" | "exam" | "fun_activity" | "lesson";

export interface CourseViewerProps {
  course?: CourseDetails | null;
  courseId?: string;
}

export interface StudentProgressData {
  lessons: Array<{
    id: number;
    name: string;
    type: ComponentType;
    sort: number;
    progress?: number;
    weightage?: number;
    completed?: boolean;
    last_accessed?: string;
    description?: string; 
    children?: Array<{
      [x: string]: any;
      id: number;
      name: string;
      type: ComponentType | string;
      sort: number;
      progress?: number;
      score?: number;
      due_date?: string;
      scheduled_date?: string;
      question_count?: number;
      weightage?: number;
      completed?: boolean;
      description?: string; 
    }>;
  }>;
  students?: Array<{ id: string; first_name: string; last_name: string; avatar: string | null }>;
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

