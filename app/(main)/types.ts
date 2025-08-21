export type StatusValue = "completed" | "in-progress" | "not-started";

export interface Lesson {
  sort: number;
  id: number;
  name: string;
  type: string;
}

export interface LessonProgress {
  lesson_id: number;
  name: string;
  type: string;
  progress: number;
}

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
  lessons_progress: LessonProgress[];
}

export interface DashboardData {
  lessons: Lesson[];
  students: Student[];
}
