import { Assignment, QuestionConfig } from '../types';

interface PromptBuildingParams {
  assignment: Assignment;
  context?: string;
  customPrompt?: string;
}

class PromptBuilder {
  /**
   * Build a comprehensive prompt from assignment details
   */
  static buildGenerationPrompt(params: PromptBuildingParams): string {
    const { assignment, context, customPrompt } = params;

    let prompt = `You are an expert teacher creating an exam question paper. Generate questions for the following assignment:

ASSIGNMENT DETAILS:
- Subject: ${assignment.subject}
- School Name: ${assignment.schoolName || 'Not specified'}
- School Level: ${assignment.schoolLevel}
- Exam Date: ${assignment.examDate || 'Not specified'}
- Duration: ${assignment.duration || 'Not specified'}
- Difficulty: ${assignment.difficultyLevel}
- Total Marks: ${assignment.totalMarks}

QUESTION BREAKDOWN:`;

    // Add question configuration details
    assignment.questionConfigs.forEach((config: QuestionConfig) => {
      const displayType = PromptBuilder.getQuestionTypeDescription(config.type);
      const totalMarks = config.count * config.marks;
      prompt += `\n- ${displayType}: ${config.count} questions × ${config.marks} marks each = ${totalMarks} marks`;
    });

    prompt += '\n\nREQUIREMENTS:';
    prompt += '\n- Generate pedagogically strong, exam-ready questions.';
    prompt += '\n- Match the requested school level, difficulty, and marks distribution exactly.';
    prompt += '\n- Avoid ambiguous wording and avoid duplicate questions.';
    prompt += '\n- Cover multiple cognitive levels (recall, understanding, application, analysis).';
    prompt += '\n- Provide correct answers and concise explanations for every question.';

    if (assignment.additionalInstructions) {
      prompt += `\n- Additional Instructions: ${assignment.additionalInstructions}`;
    }

    if (context) {
      prompt += `\n\nCURRICULUM CONTEXT:\n${context}`;
    }

    if (customPrompt) {
      prompt += `\n\nCUSTOM INSTRUCTIONS:\n${customPrompt}`;
    }

    prompt += `\n\nSTRICT OUTPUT CONTRACT:
Return ONLY valid JSON. No markdown. No prose.

Use this exact top-level shape:
{
  "questions": [
    {
      "id": "q1",
      "text": "Question text here",
      "type": "${assignment.questionConfigs[0]?.type || 'mcq'}",
      "difficulty": "easy|medium|hard",
      "marks": ${assignment.questionConfigs[0]?.marks || 1},
      "section": "A",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": "Option 1",
      "explanation": "Brief explanation of the answer"
    }
  ]
}

Rules:
1) Include exactly ${assignment.totalQuestions} questions.
2) Total marks must sum to ${assignment.totalMarks}.
3) For non-MCQ questions, omit the options field.
4) For true-false, set options to ["True", "False"].
5) Ensure id values are unique and sequential (q1, q2, ...).
6) Keep section labels compact (A, B, C...).`;

    return prompt;
  }

  /**
   * Get human-readable description of question type
   */
  private static getQuestionTypeDescription(type: string): string {
    const descriptions: Record<string, string> = {
      mcq: 'Multiple Choice Questions (MCQ)',
      'short-answer': 'Short Answer Questions',
      'long-answer': 'Long Answer Questions',
      'true-false': 'True/False Questions',
      numerical: 'Numerical Problems',
    };
    return descriptions[type] || type;
  }

  /**
   * Build prompt for LaTeX conversion
   */
  static buildLaTeXPrompt(
    questions: any[],
    metadata: {
      schoolName?: string;
      subject: string;
      standard?: string;
      date?: string;
      duration?: string;
      totalMarks: number;
    }
  ): string {
    let prompt = `Convert the following exam questions into a professional LaTeX exam paper format.

EXAM METADATA:
- School: ${metadata.schoolName || 'School Name'}
- Subject: ${metadata.subject}
- Class/Standard: ${metadata.standard || 'Class'}
- Date: ${metadata.date || '\\today'}
- Duration: ${metadata.duration || 'N/A'}
- Total Marks: ${metadata.totalMarks}

QUESTIONS TO CONVERT:
${JSON.stringify(questions, null, 2)}

REQUIREMENTS:
1. Create a complete, compilable LaTeX document
2. Use proper exam document structure
3. Organize questions into sections (A, B, C, etc.)
4. Include proper spacing and formatting
5. Add marks indicators in brackets [marks]
6. Group MCQs with their options clearly formatted
7. Provide adequate space for answers

OUTPUT:
Return ONLY the complete LaTeX code using the exam or letter document class. Here is an example structure to follow:

\\documentclass{exam}
\\usepackage[utf-8]{inputenc}
\\usepackage{amsmath}

\\begin{document}

\\begin{center}
  \\Large\\textbf{${metadata.schoolName || 'School Name'}}\\\\
  \\textbf{${metadata.subject}} Exam
\\end{center}

% ... questions here ...

\\end{document}`;

    return prompt;
  }

  /**
   * Build prompt to convert each generated question into renderable LaTeX snippets.
   */
  static buildQuestionLatexPrompt(questions: any[]): string {
    return `Convert each question below into LaTeX that is directly renderable in a web UI.

QUESTIONS:
${JSON.stringify(questions, null, 2)}

STRICT OUTPUT CONTRACT:
Return ONLY valid JSON with this exact shape:
{
  "latexQuestions": [
    {
      "id": "q1",
      "latex": "Question text with inline math like $x^2 + y^2$ and display math in $$...$$ when needed."
    }
  ]
}

Rules:
1) Keep one entry per input question id.
2) Preserve question meaning exactly.
3) Escape LaTeX correctly.
4) Keep it concise and exam-ready.
5) Do not include markdown code fences.`;
  }

  /**
   * Preview the final prompt that will be sent to LLM
   */
  static buildPromptPreview(params: PromptBuildingParams): string {
    return this.buildGenerationPrompt(params);
  }
}

export default PromptBuilder;
