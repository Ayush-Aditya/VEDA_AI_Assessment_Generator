'use client';

import { create } from 'zustand';
import { Assignment, AssignmentListItem, QuestionConfig, GeneratedQuestion, QuestionPaper, StudentInfo } from '@/types';

interface AssignmentStore {
  // Assignment form data
  assignment: Assignment;
  setAssignment: (data: Partial<Assignment>) => void;
  resetAssignment: () => void;

  // Question configuration
  addQuestionConfig: (config: QuestionConfig) => void;
  removeQuestionConfig: (index: number) => void;
  updateQuestionConfig: (index: number, config: QuestionConfig) => void;

  // Generated questions
  generatedQuestions: GeneratedQuestion[];
  setGeneratedQuestions: (questions: GeneratedQuestion[]) => void;
  addGeneratedQuestion: (question: GeneratedQuestion) => void;

  // Question paper
  questionPaper: QuestionPaper | null;
  setQuestionPaper: (paper: QuestionPaper) => void;

  // Student info
  studentInfo: StudentInfo;
  setStudentInfo: (info: StudentInfo) => void;

  // Loading and status
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;

  // Current step
  currentStep: number;
  setCurrentStep: (step: number) => void;

  // Assignment list
  assignmentsList: AssignmentListItem[];
  setAssignmentsList: (items: AssignmentListItem[]) => void;
  prependAssignment: (item: AssignmentListItem) => void;
  createAssignmentFromDraft: (paper?: QuestionPaper) => AssignmentListItem;
  deleteAssignment: (id: string) => void;
  renameAssignment: (id: string, title: string) => void;
}

const initialAssignment: Assignment = {
  title: '',
  description: '',
  subject: '',
  examDate: '',
  schoolName: '',
  duration: '',
  schoolLevel: 'secondary',
  difficultyLevel: 'medium',
  totalQuestions: 0,
  totalMarks: 0,
  questionConfigs: [],
  additionalInstructions: '',
  context: '',
  customPrompt: '',
};

const initialStudentInfo: StudentInfo = {
  name: '',
  rollNumber: '',
  section: '',
};

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  assignment: initialAssignment,
  setAssignment: (data) =>
    set((state) => ({
      assignment: { ...state.assignment, ...data },
    })),
  resetAssignment: () => set({ assignment: initialAssignment }),

  addQuestionConfig: (config) =>
    set((state) => ({
      assignment: {
        ...state.assignment,
        questionConfigs: [...state.assignment.questionConfigs, config],
        totalQuestions: state.assignment.totalQuestions + config.count,
        totalMarks: state.assignment.totalMarks + config.marks * config.count,
      },
    })),

  removeQuestionConfig: (index) =>
    set((state) => {
      const config = state.assignment.questionConfigs[index];
      return {
        assignment: {
          ...state.assignment,
          questionConfigs: state.assignment.questionConfigs.filter((_, i) => i !== index),
          totalQuestions: state.assignment.totalQuestions - config.count,
          totalMarks: state.assignment.totalMarks - config.marks * config.count,
        },
      };
    }),

  updateQuestionConfig: (index, config) =>
    set((state) => {
      const oldConfig = state.assignment.questionConfigs[index];
      const newConfigs = [...state.assignment.questionConfigs];
      newConfigs[index] = config;

      const questionDiff = config.count - oldConfig.count;
      const marksDiff = config.marks * config.count - oldConfig.marks * oldConfig.count;

      return {
        assignment: {
          ...state.assignment,
          questionConfigs: newConfigs,
          totalQuestions: state.assignment.totalQuestions + questionDiff,
          totalMarks: state.assignment.totalMarks + marksDiff,
        },
      };
    }),

  generatedQuestions: [],
  setGeneratedQuestions: (questions) => set({ generatedQuestions: questions }),
  addGeneratedQuestion: (question) =>
    set((state) => ({
      generatedQuestions: [...state.generatedQuestions, question],
    })),

  questionPaper: null,
  setQuestionPaper: (paper) => set({ questionPaper: paper }),

  studentInfo: initialStudentInfo,
  setStudentInfo: (info) => set({ studentInfo: info }),

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  error: null,
  setError: (error) => set({ error }),

  currentStep: 1,
  setCurrentStep: (step) => set({ currentStep: step }),

  assignmentsList: [],
  setAssignmentsList: (items) => set({ assignmentsList: items }),
  prependAssignment: (item) =>
    set((state) => ({
      assignmentsList: [item, ...state.assignmentsList.filter((it) => it.id !== item.id)],
    })),
  createAssignmentFromDraft: (paper) => {
    let createdAssignment: AssignmentListItem = {
      id: '',
      title: '',
      assignedOn: '',
      examDate: '',
    };

    set((state) => {
      const createdAt = new Date();
      const assignedOn = createdAt.toLocaleDateString('en-GB').replace(/\//g, '-');
      const examDate = state.assignment.examDate?.trim() || '--';
      const title = state.assignment.title?.trim() || `Assignment ${state.assignmentsList.length + 1}`;

      createdAssignment = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title,
        assignedOn,
        examDate,
        paper,
      };

      return {
        assignmentsList: [createdAssignment, ...state.assignmentsList],
      };
    });

    return createdAssignment;
  },

  deleteAssignment: (id) =>
    set((state) => ({
      assignmentsList: state.assignmentsList.filter((item) => item.id !== id),
    })),

  renameAssignment: (id, title) =>
    set((state) => ({
      assignmentsList: state.assignmentsList.map((item) =>
        item.id === id ? { ...item, title: title.trim() } : item
      ),
    })),
}));
