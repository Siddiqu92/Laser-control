export interface CourseDetailsSidebarProps {
  visible: boolean;
  onHide: () => void;
  selectedDetails: any;
  detailsLoading: boolean;
  courseComponents: any;
  getItemIcon: (type: string) => string;
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
  getItemIcon: (type: string) => string;
  courseComponents?: any;
  onOpenDetails?: (payload: any) => void;
}

export interface QuestionManagementProps {
  editMode: boolean;
  questions: any[];
  onUpdateQuestion: (questionId: number, statement: string, questionType: 'assessment' | 'exam' | 'practice') => void;
  onDeleteQuestion: (questionId: string, questionType: 'assessment' | 'exam' | 'practice') => void;
}


export interface Activity {
  id: number;
  name: string;
  type: string;
  description?: string;
  metadata?: any;
}

export interface Topic {
  id: number;
  name: string;
  type: string;
  description?: string;
  metadata?: any;
  activities?: Activity[];
  children?: Topic[];
}

export interface LessonData {
  id: number;
  name: string;
  type: string;
  description?: string;
  metadata?: any;
  children?: Topic[];
}

export interface LessonDetailProps {
  lesson: LessonData;
  onViewDetail?: (item: any) => void;
}