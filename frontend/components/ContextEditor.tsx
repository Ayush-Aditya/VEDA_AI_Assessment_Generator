'use client';

import { Assignment } from '@/types';

interface ContextEditorProps {
  assignment: Assignment;
  setAssignment: (data: Partial<Assignment>) => void;
}

export default function ContextEditor({ assignment, setAssignment }: ContextEditorProps) {
  return (
    <div className="space-y-6">
      {/* Curriculum Context */}
      <div>
        <label htmlFor="context" className="block text-sm font-medium mb-2" style={{ color: '#666666' }}>
          Curriculum/Syllabus Context (Optional)
        </label>
        <p className="text-sm mb-3" style={{ color: '#666666' }}>
          Paste your curriculum content, topic details, or learning objectives. This helps the AI generate more relevant questions.
        </p>
        <textarea
          id="context"
          value={assignment.context || ''}
          onChange={(e) => setAssignment({ context: e.target.value })}
          placeholder="Paste curriculum content, topic syllabus, or learning objectives here..."
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
          style={{ color: '#666666' }}
        />
        <p className="text-xs mt-2" style={{ color: '#999999' }}>
          {assignment.context?.length || 0} characters
        </p>
      </div>

      {/* Custom Prompt */}
      <div>
        <label htmlFor="customPrompt" className="block text-sm font-medium mb-2" style={{ color: '#666666' }}>
          Custom Prompt Engineering (Optional)
        </label>
        <p className="text-sm mb-3" style={{ color: '#666666' }}>
          Refine the AI prompt with specific instructions. Example: &quot;Focus on conceptual understanding, avoid calculations&quot;, &quot;Include real-world examples&quot;
        </p>
        <textarea
          id="customPrompt"
          value={assignment.customPrompt || ''}
          onChange={(e) => setAssignment({ customPrompt: e.target.value })}
          placeholder="Add custom instructions for the AI to follow when generating questions..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
          style={{ color: '#666666' }}
        />
        <p className="text-xs mt-2" style={{ color: '#999999' }}>
          {assignment.customPrompt?.length || 0} characters
        </p>
      </div>

      {/* Preview of Combined Prompt */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">
          📋 Combined Prompt Preview (what will be sent to AI)
        </h3>
        <p className="text-sm text-blue-800 whitespace-pre-wrap font-mono">
          {buildPreviewPrompt(assignment)}
        </p>
      </div>
    </div>
  );
}

function buildPreviewPrompt(assignment: Assignment): string {
  let prompt = `Create a ${assignment.schoolLevel || 'secondary'} level ${assignment.subject || 'subject'} assignment.

Exam Date: ${assignment.examDate || 'Not specified'}
Duration: ${assignment.duration || 'Not specified'}
School Name: ${assignment.schoolName || 'Not specified'}

Difficulty: ${assignment.difficultyLevel}

Question Configuration:
${
  assignment.questionConfigs.length > 0
    ? assignment.questionConfigs
        .map((q) => `- ${q.type}: ${q.count} questions × ${q.marks} marks each`)
        .join('\n')
    : '- No questions configured yet'
}`;

  if (assignment.context) {
    prompt += `\n\nCurriculum Context:\n${assignment.context}`;
  }

  if (assignment.customPrompt) {
    prompt += `\n\nCustom Instructions:\n${assignment.customPrompt}`;
  }

  prompt += '\n\nEnsure questions test different difficulty levels and cover various topics from the curriculum.';

  return prompt;
}
