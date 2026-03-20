import axios from 'axios';
import { ApiResponse, Assignment, AssignmentListItem, QuestionPaper } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

interface AssignmentsListData {
  assignments: AssignmentListItem[];
}

interface AssignmentData {
  assignment: AssignmentListItem;
}

export async function fetchAssignments(): Promise<AssignmentListItem[]> {
  const response = await axios.get<ApiResponse<AssignmentsListData>>(`${API_BASE_URL}/api/assignments`);

  if (!response.data.success || !response.data.data?.assignments) {
    throw new Error(response.data.error || 'Failed to fetch assignments');
  }

  return response.data.data.assignments;
}

export async function saveGeneratedAssignment(
  assignment: Assignment,
  questionPaper: QuestionPaper
): Promise<AssignmentListItem> {
  const response = await axios.post<ApiResponse<AssignmentData>>(`${API_BASE_URL}/api/assignments`, {
    assignment: {
      ...assignment,
      fileUpload: undefined,
    },
    questionPaper,
  });

  if (!response.data.success || !response.data.data?.assignment) {
    throw new Error(response.data.error || 'Failed to save assignment');
  }

  return response.data.data.assignment;
}

export async function renameAssignmentById(id: string, title: string): Promise<AssignmentListItem> {
  const response = await axios.patch<ApiResponse<AssignmentData>>(`${API_BASE_URL}/api/assignments/${id}`, {
    title,
  });

  if (!response.data.success || !response.data.data?.assignment) {
    throw new Error(response.data.error || 'Failed to rename assignment');
  }

  return response.data.data.assignment;
}

export async function deleteAssignmentById(id: string): Promise<void> {
  const response = await axios.delete<ApiResponse>(`${API_BASE_URL}/api/assignments/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to delete assignment');
  }
}
