import axios from 'axios';
import { Assignment, GeneratedQuestion, ApiResponse } from '@/types';

interface GenerateQuestionsData {
  questions: GeneratedQuestion[];
}

const RAW_API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
const API_BASE_URL = RAW_API_BASE_URL
  ? RAW_API_BASE_URL.replace(/\/$/, '')
  : process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : '';

export async function generateQuestionsFromAssignment(assignment: Assignment): Promise<GeneratedQuestion[]> {
  if (!API_BASE_URL) {
    throw new Error('Frontend is not configured with NEXT_PUBLIC_BACKEND_URL. Set it in Vercel and redeploy.');
  }

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
