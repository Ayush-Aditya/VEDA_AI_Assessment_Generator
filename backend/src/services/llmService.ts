import axios from 'axios';

interface LLMConfig {
  model: string;
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
}

interface GenerationParams {
  prompt: string;
}

interface GeneratedQuestionsResponse {
  success: boolean;
  questions?: any[]; // Will be structured later
  error?: string;
}

interface LatexGenerationResponse {
  success: boolean;
  latexQuestions?: Array<{ id: string; latex: string }>;
  error?: string;
}

interface CombinedGenerationResponse {
  success: boolean;
  questions?: any[];
  latexQuestions?: Array<{ id: string; latex: string }>;
  error?: string;
}

class LLMService {
  private config: LLMConfig;
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(model: string = process.env.GEMINI_MODEL || process.env.LLM_MODEL || 'gemini-2.0-flash') {
    this.config = {
      model,
      apiKey: process.env.GEMINI_API_KEY || process.env.LLM_API_KEY || '',
      temperature: 0.7,
      maxTokens: 4000,
    };
  }

  /**
   * Generate questions using LLM
   */
  async generateQuestions(params: GenerationParams): Promise<GeneratedQuestionsResponse> {
    try {
      const content = await this.runPrompt(params.prompt, this.config.temperature ?? 0.7, 4000);
      if (!content) {
        throw new Error('Empty response from LLM');
      }

      // Parse the response as JSON
      const questions = this.parseQuestionsFromResponse(content);

      if (questions.length === 0) {
        throw new Error('LLM response did not contain parseable questions JSON');
      }

      return {
        success: true,
        questions,
      };
    } catch (error: any) {
      console.error('LLM Generation Error:', error.message);
      return {
        success: false,
        error: error.message || 'Failed to generate questions',
      };
    }
  }

  /**
   * Parse LLM response into structured questions
   * This will be implemented based on LLM output format
   */
  private parseQuestionsFromResponse(content: string): any[] {
    try {
      const parsed = JSON.parse(this.extractJsonPayload(content));

      if (Array.isArray(parsed)) {
        return parsed;
      }

      if (Array.isArray(parsed?.questions)) {
        return parsed.questions;
      }

      return [];
    } catch (error) {
      console.error('JSON Parse Error:', error);
      return [];
    }
  }

  /**
   * Generate LaTeX code for question paper
   */
  async generateQuestionLatex(prompt: string): Promise<LatexGenerationResponse> {
    try {
      const content = await this.runPrompt(prompt, 0.2, 4000);
      const parsed = JSON.parse(this.extractJsonPayload(content));
      const latexQuestions = Array.isArray(parsed?.latexQuestions) ? parsed.latexQuestions : [];

      return {
        success: true,
        latexQuestions,
      };
    } catch (error: any) {
      console.error('LaTeX Generation Error:', error.message);
      return {
        success: false,
        error: error.message || 'Failed to generate LaTeX',
      };
    }
  }

  /**
   * Generate questions with LaTeX in a single API call (optimized)
   */
  async generateQuestionsWithLatex(
    generationPrompt: string,
    assignment: any
  ): Promise<CombinedGenerationResponse> {
    try {
      console.log('Starting generateQuestionsWithLatex...');
      const content = await this.runPrompt(generationPrompt, this.config.temperature ?? 0.7, 8000);
      if (!content) {
        throw new Error('Empty response from LLM');
      }

      // Parse the response as JSON
      const parsed = JSON.parse(this.extractJsonPayload(content));
      const questions = Array.isArray(parsed) ? parsed : parsed?.questions || [];

      if (questions.length === 0) {
        throw new Error('LLM response did not contain parseable questions');
      }

      // Attach LaTeX if already included in response, otherwise return questions as-is
      const latexQuestions = questions.map((q: any) => ({
        id: q.id,
        latex: q.latex || '', // Will be populated if LLM provided it
      }));

      return {
        success: true,
        questions,
        latexQuestions,
      };
    } catch (error: any) {
      console.error('Combined Generation Error:', {
        message: error.message,
        stack: error.stack,
      });
      return {
        success: false,
        error: error.message || 'Failed to generate questions with LaTeX',
      };
    }
  }

  /**
   * Check rate limit status
   */
  async checkRateLimit(): Promise<boolean> {
    // Implement rate limit checking logic
    return true;
  }

  private async runPrompt(prompt: string, temperature: number, maxOutputTokens: number): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('Missing GEMINI_API_KEY (or LLM_API_KEY) in environment');
    }

    try {
      const url = `${this.baseUrl}/models/${this.config.model}:generateContent?key=${this.config.apiKey}`;
      console.log(`[LLM] Making request to ${this.config.model}...`);

      const response = await axios.post(
        url,
        {
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature,
            maxOutputTokens,
            responseMimeType: 'application/json',
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const content =
        response.data?.candidates?.[0]?.content?.parts?.map((part: any) => part.text || '').join('') || '';

      if (!content || !content.trim()) {
        throw new Error('Empty response from Gemini API');
      }

      console.log('[LLM] Response received successfully');
      return content;
    } catch (error: any) {
      const status = error?.response?.status;
      const statusText = error?.response?.statusText || 'Gemini request failed';
      const apiMessage = error?.response?.data?.error?.message;
      const message = apiMessage || error.message || statusText;

      console.error('[LLM] Error Details:', {
        message,
        status,
        statusText,
        data: error.response?.data,
      });

      if (status) {
        throw new Error(`[${status}] ${message}`);
      }

      throw new Error(message);
    }
  }

  private extractJsonPayload(content: string): string {
    const trimmed = content.trim();

    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      return trimmed;
    }

    const fenced = trimmed.match(/```json\s*([\s\S]*?)```/i);
    if (fenced?.[1]) {
      return fenced[1].trim();
    }

    const objectMatch = trimmed.match(/\{[\s\S]*\}/);
    if (objectMatch?.[0]) {
      return objectMatch[0];
    }

    const arrayMatch = trimmed.match(/\[[\s\S]*\]/);
    if (arrayMatch?.[0]) {
      return arrayMatch[0];
    }

    throw new Error('No JSON payload found in model response');
  }
}

export default LLMService;
