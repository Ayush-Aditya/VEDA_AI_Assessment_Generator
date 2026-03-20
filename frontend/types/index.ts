// Question type definitions
export type QuestionType = "mcq" | "short-answer" | "long-answer" | "true-false" | "numerical";

export interface QuestionConfig {
  type: QuestionType;
  count: number;
  marks: number;
}

// Assignment interface
export interface Assignment {
  id?: string;
  title: string;
  description?: string;
  subject: string;
  examDate: string;
  schoolName: string;
  duration: string;
  schoolLevel: "primary" | "secondary" | "senior-secondary" | "bachelors";
  difficultyLevel: "easy" | "medium" | "hard" | "mixed";
  totalQuestions: number;
  totalMarks: number;
  questionConfigs: QuestionConfig[];
  fileUpload?: File | null;
  additionalInstructions: string;
  context?: string; // For curriculum/syllabus context
  customPrompt?: string; // For custom LLM prompt
}

export interface AssignmentListItem {
  id: string;
  title: string;
  assignedOn: string;
  examDate: string;
  paper?: QuestionPaper;
}

// Generated Question interface
export interface GeneratedQuestion {
  id: string;
  text: string;
  latex?: string;
  type: QuestionType;
  difficulty: "easy" | "medium" | "hard";
  marks: number;
  section: string;
  options?: string[]; // For MCQ
  correctAnswer?: string | string[];
  explanation?: string;
  answerKey?: string;
}

// Question paper with structured sections
export interface QuestionPaper {
  id?: string;
  assignmentId?: string;
  title: string;
  schoolName?: string;
  subject: string;
  standard?: string;
  section?: string;
  date?: string;
  totalMarks: number;
  duration?: string;
  sections: QuestionSection[];
  sections_and_summary: string; // For LaTeX data
  metadata?: Record<string, unknown>;
}

export interface QuestionSection {
  title: string;
  instructions?: string;
  questions: GeneratedQuestion[];
  marks: number;
}

// Student submission interface
export interface StudentInfo {
  name: string;
  rollNumber: string;
  section: string;
}

// API Response type
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
