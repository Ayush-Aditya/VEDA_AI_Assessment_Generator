import axios from 'axios';
import { Assignment, GeneratedQuestion, ApiResponse } from '@/types';

interface GenerateQuestionsData {
  questions: GeneratedQuestion[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function generateQuestionsFromAssignment(assignment: Assignment): Promise<GeneratedQuestion[]> {
  const payloadAssignment = {
    ...assignment,
    fileUpload: undefined,
  };

  try {
    const response = await axios.post<ApiResponse<GenerateQuestionsData>>(
      `${API_BASE_URL}/api/questions/generate`,
      {
        assignment: payloadAssignment,
        context: assignment.context,
        customPrompt: assignment.customPrompt,
      }
    );

    if (!response.data.success || !response.data.data?.questions) {
      throw new Error(response.data.error || 'Failed to generate questions');
    }

    return response.data.data.questions;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new Error(
          `Cannot reach backend at ${API_BASE_URL}. Start backend server and try again.`
        );
      }

      throw new Error(
        error.response.data?.error ||
          error.message ||
          'Failed to generate questions'
      );
    }

    throw error;
  }
}
