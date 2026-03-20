export type QuestionType = 'mcq' | 'short-answer' | 'long-answer' | 'true-false' | 'numerical';

export interface QuestionConfig {
  type: QuestionType;
  count: number;
  marks: number;
}

export interface Assignment {
  id?: string;
  title: string;
  description?: string;
  subject: string;
  examDate: string;
  schoolName: string;
  duration: string;
  schoolLevel: 'primary' | 'secondary' | 'senior-secondary' | 'bachelors';
  difficultyLevel: 'easy' | 'medium' | 'hard' | 'mixed';
  totalQuestions: number;
  totalMarks: number;
  questionConfigs: QuestionConfig[];
  fileUpload?: any;
  additionalInstructions: string;
  context?: string;
  customPrompt?: string;
}

export interface GeneratedQuestion {
  id: string;
  text: string;
  latex?: string;
  type: QuestionType;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  section: string;
  options?: string[];
  correctAnswer?: string | string[];
  explanation?: string;
  answerKey?: string;
}

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
  sections_and_summary: string;
  metadata?: Record<string, any>;
}

export interface QuestionSection {
  title: string;
  instructions?: string;
  questions: GeneratedQuestion[];
  marks: number;
}

export interface StudentInfo {
  name: string;
  rollNumber: string;
  section: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
