'use client';

import { useState } from 'react';
import Image from 'next/image';
import { QuestionPaper } from '@/types';
import { generatePDF } from '@/lib/pdfGenerator';
import { MathJax, MathJaxContext } from 'better-react-mathjax';

interface QuestionPaperViewProps {
  paper: QuestionPaper;
  onDownloadPDF?: () => void;
  onRegenerate?: () => void;
}

export default function QuestionPaperView({
  paper,
  onDownloadPDF,
  onRegenerate,
}: QuestionPaperViewProps) {
  const mathJaxConfig = {
    loader: { load: ['input/tex', 'output/chtml'] },
    tex: {
      inlineMath: [['$', '$'], ['\\(', '\\)']],
      displayMath: [['$$', '$$'], ['\\[', '\\]']],
    },
  };

  const [downloadMode, setDownloadMode] = useState<'question-paper' | 'answer-key' | null>(null);

  const handleDownloadQuestionPaper = async () => {
    setDownloadMode('question-paper');
    try {
      onDownloadPDF?.();
      await generatePDF(paper, {
        studentName: '',
        studentRoll: '',
        studentSection: '',
      }, 'question-paper');
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF');
    } finally {
      setDownloadMode(null);
    }
  };

  const handleDownloadAnswerKey = async () => {
    setDownloadMode('answer-key');
    try {
      onDownloadPDF?.();
      await generatePDF(paper, {
        studentName: '',
        studentRoll: '',
        studentSection: '',
      }, 'answer-key');
    } catch (error) {
      console.error('Answer key PDF generation failed:', error);
      alert('Failed to generate answer key PDF');
    } finally {
      setDownloadMode(null);
    }
  };

  const hasAnswerKey = paper.sections.some((s) => s.questions.some((q) => q.correctAnswer));

  return (
    <MathJaxContext config={mathJaxConfig}>
      <div className="w-full max-w-4xl mx-auto">
      {/* Action Bar */}
      <div className="mb-8 p-4 bg-white rounded-lg border border-gray-200 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-orange-600 font-semibold">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2z" clipRule="evenodd" />
          </svg>
          Question Paper Ready
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRegenerate}
            className="px-4 py-2 bg-[#1A1A1A] text-white rounded-lg hover:bg-black transition inline-flex items-center gap-2"
          >
            <Image src="/generate.jpg" alt="Regenerate" width={16} height={16} />
            Regenerate
          </button>
          <button
            onClick={handleDownloadQuestionPaper}
            disabled={downloadMode !== null}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 inline-flex items-center gap-2"
          >
            <Image src="/donwload%20button%20img.png" alt="Download" width={16} height={16} />
            {downloadMode === 'question-paper' ? 'Generating...' : 'Download Question Paper'}
          </button>
          <button
            onClick={handleDownloadAnswerKey}
            disabled={downloadMode !== null || !hasAnswerKey}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 inline-flex items-center gap-2"
          >
            <Image src="/donwload%20button%20img.png" alt="Download" width={16} height={16} />
            {downloadMode === 'answer-key' ? 'Generating...' : 'Download Answer Key'}
          </button>
        </div>
      </div>

      {/* Question Paper Preview */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
        {/* Header */}
        <div className="text-center border-b-2 border-gray-400 pb-6 mb-6">
          {paper.schoolName && (
            <h1 className="text-2xl font-bold text-gray-900">{paper.schoolName}</h1>
          )}
          <p className="text-sm text-gray-600">{paper.standard && `Class: ${paper.standard}`}</p>
          
          <h2 className="text-xl font-bold text-gray-900 mt-4">{paper.title}</h2>
          <p className="text-gray-700 font-semibold">Subject: {paper.subject}</p>

          <div className="grid grid-cols-3 gap-4 mt-4 text-sm text-gray-700">
            {paper.date && <p>Date: {paper.date}</p>}
            {paper.duration && <p>Duration: {paper.duration}</p>}
            <p>Total Marks: {paper.totalMarks}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5 text-sm text-gray-800 text-left">
            <p>Name: ____________________</p>
            <p>Roll No: ____________________</p>
            <p>Section: ____________________</p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {paper.sections.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              {/* Section Title */}
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <span className="bg-gray-200 w-8 h-8 flex items-center justify-center rounded mr-3 font-bold">
                  {String.fromCharCode(65 + sectionIdx)}
                </span>
                {section.title}
              </h3>

              {/* Section Instructions */}
              {section.instructions && (
                <p className="text-sm text-gray-600 italic mb-3">
                  <strong>Instructions:</strong> {section.instructions}
                </p>
              )}

              {/* Questions */}
              <div className="space-y-4 ml-4">
                {section.questions.map((question, qIdx) => (
                  <div key={qIdx} className="mb-4">
                    <div className="flex items-start gap-3">
                      <span className="font-semibold text-gray-800 min-w-fit">
                        {qIdx + 1}.
                      </span>
                      <div className="flex-1">
                        <p className="text-gray-900">{question.text}</p>
                        {question.latex && (
                          <div className="mt-2 text-sm text-gray-800">
                            <MathJax dynamic>{question.latex}</MathJax>
                          </div>
                        )}
                        
                        {/* Options for MCQ */}
                        {question.options && question.options.length > 0 && (
                          <div className="ml-4 mt-2 space-y-1">
                            {question.options.map((option, optIdx) => (
                              <div key={optIdx} className="text-gray-700 text-sm">
                                <span className="font-semibold">
                                  ({String.fromCharCode(97 + optIdx)})
                                </span>{' '}
                                {option}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Blank space for answers */}
                        {question.type === 'short-answer' && (
                          <div className="mt-2 h-12 border-b border-gray-400"></div>
                        )}
                        {question.type === 'long-answer' && (
                          <div className="mt-2 space-y-1">
                            <div className="h-4 border-b border-gray-400"></div>
                            <div className="h-4 border-b border-gray-400"></div>
                            <div className="h-4 border-b border-gray-400"></div>
                          </div>
                        )}
                      </div>
                      <div className="min-w-fit text-right">
                        <span className="bg-yellow-100 px-2 py-1 rounded text-sm font-semibold text-gray-800">
                          [{question.marks}]
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Section Total */}
              <p className="text-right text-sm font-semibold text-gray-600 mt-4">
                Total Marks (Section {String.fromCharCode(65 + sectionIdx)}): {section.marks}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-8 border-t border-gray-400 text-center text-sm text-gray-600">
          <p>--- End of Question Paper ---</p>
        </div>
      </div>

      {/* Answer Key Section (if available) */}
      {paper.sections.some(s => s.questions.some(q => q.correctAnswer)) && (
        <div className="mt-8 p-6 bg-green-50 rounded-lg border-2 border-green-200">
          <h3 className="text-lg font-bold text-green-900 mb-4">📋 Answer Key</h3>
          <div className="space-y-2 text-sm text-green-800">
            {paper.sections.flatMap(s => s.questions).map((q, idx) => (
              q.correctAnswer && (
                <div key={idx} className="flex justify-between">
                  <span className="font-semibold">Question {idx + 1}:</span>
                  <span>{q.correctAnswer}</span>
                </div>
              )
            ))}
          </div>
        </div>
      )}
      </div>
    </MathJaxContext>
  );
}
