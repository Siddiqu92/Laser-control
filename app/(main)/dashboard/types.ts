import { ReactNode } from "react";

export type StatusValue = "completed" | "in-progress" | "not-started";


export interface Lesson {
  id: number;
  name: string;
  type: string;
  sort: number; 
}

export interface Student {
  first_name: ReactNode;
  last_name: ReactNode;
  id: string;
  name: string;
  grade: string;
  avatar?: string;
  lessons_progress: any[]; 
}

export interface DashboardData {
  lessons: Lesson[];
  students: Student[];
}

export interface ProgressMeta {
  studentId: string;
  studentName: string;
  lessonId: number;
  lessonName: string;
  lessonType: string;
  obtained?: number | null;
}



