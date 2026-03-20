'use client';

import { GeneratedQuestion } from '@/types';
import { MathJax, MathJaxContext } from 'better-react-mathjax';

interface QuestionsDisplayProps {
  questions: GeneratedQuestion[];
  onRegenerate?: () => void;
  showActions?: boolean;
}

const difficultyColors = {
  easy: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  hard: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
};

export default function QuestionsDisplay({
  questions,
  onRegenerate,
  showActions = true,
}: QuestionsDisplayProps) {
  const mathJaxConfig = {
    loader: { load: ['input/tex', 'output/chtml'] },
    tex: {
      inlineMath: [['$', '$'], ['\\(', '\\)']],
      displayMath: [['$$', '$$'], ['\\[', '\\]']],
    },
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No questions generated yet</p>
      </div>
    );
  }

  // Group questions by section
  const groupedBySection = questions.reduce(
    (acc, question) => {
      const section = question.section || 'General';
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(question);
      return acc;
    },
    {} as Record<string, GeneratedQuestion[]>
  );

  return (
    <MathJaxContext config={mathJaxConfig}>
      <div className="space-y-8">
      {Object.entries(groupedBySection).map(([section, sectionQuestions]) => (
        <div key={section} className="border rounded-lg p-6 bg-white">
          {/* Section Header */}
          <div className="mb-6 pb-4 border-b-2 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">{section}</h2>
            <p className="text-sm text-gray-600 mt-2">
              {sectionQuestions.length} questions • {sectionQuestions.reduce((sum, q) => sum + q.marks, 0)} marks
            </p>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {sectionQuestions.map((question, idx) => (
              <div key={question.id || idx} className="pb-6 border-b border-gray-200 last:border-b-0">
                {/* Question Header */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">
                    <span className="text-orange-500 mr-2">{idx + 1}.</span>
                    {question.text}
                  </h3>
                  <div className="flex items-center gap-2 ml-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                        difficultyColors[question.difficulty].bg
                      } ${difficultyColors[question.difficulty].text} ${
                        difficultyColors[question.difficulty].border
                      } border`}
                    >
                      {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                      {question.marks} marks
                    </span>
                  </div>
                </div>

                {/* Question Type Tag */}
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                    {question.type.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
                {question.latex && (
                  <div className="mt-2 rounded-md border border-orange-100 bg-orange-50 px-3 py-2 text-sm text-gray-800">
                    <MathJax dynamic>{question.latex}</MathJax>
                  </div>
                )}

                {/* Options for MCQ */}
                {question.options && question.options.length > 0 && (
                  <div className="ml-4 space-y-2 mb-3">
                    {question.options.map((option, optIdx) => (
                      <div key={optIdx} className="flex items-start gap-3">
                        <span className="text-gray-600 font-semibold">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <p className="text-gray-700">{option}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Answer Key */}
                {question.correctAnswer && (
                  <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                    <p className="text-sm font-semibold text-green-900">
                      Answer: <span className="font-normal">{question.correctAnswer}</span>
                    </p>
                  </div>
                )}

                {/* Explanation */}
                {question.explanation && (
                  <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="text-sm font-semibold text-blue-900 mb-1">Explanation:</p>
                    <p className="text-sm text-blue-800">{question.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Action Buttons */}
      {showActions && (
        <div className="flex gap-4 justify-center pt-8 border-t">
          <button
            onClick={onRegenerate}
            className="px-6 py-2 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition font-semibold"
          >
            🔄 Regenerate Questions
          </button>
          <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold">
            ✓ Proceed to Preview
          </button>
        </div>
      )}
      </div>
    </MathJaxContext>
  );
}
