'use client';

import { useAssignmentStore } from '@/store/assignmentStore';
import QuestionConfigForm from './QuestionConfigForm';
import FileUploadArea from './FileUploadArea';
import { generateQuestionsFromAssignment } from '@/lib/questionsApi';
import { saveGeneratedAssignment } from '@/lib/assignmentsApi';
import { GeneratedQuestion, QuestionPaper } from '@/types';

export default function AssignmentForm({ onNext }: { onNext?: () => void }) {
  const {
    assignment,
    setAssignment,
    createAssignmentFromDraft,
    prependAssignment,
    setGeneratedQuestions,
    setQuestionPaper,
    setIsLoading,
    isLoading,
    setError,
    error,
  } = useAssignmentStore();

  const focusField = (id: string) => {
    document.getElementById(id)?.focus();
  };

  const handleCreate = async () => {
    try {
      if (!assignment.subject.trim()) {
        setError('Please enter a subject before generating questions.');
        return;
      }

      if (!assignment.title.trim()) {
        setError('Please enter an assignment name before generating questions.');
        return;
      }

      if (!assignment.questionConfigs.length) {
        setError('Please add at least one question configuration.');
        return;
      }

      setError(null);
      setIsLoading(true);

      const questions = await generateQuestionsFromAssignment(assignment);
      setGeneratedQuestions(questions);

      const paper = buildQuestionPaperFromResult(assignment, questions);
      setQuestionPaper(paper);
      try {
        const savedItem = await saveGeneratedAssignment(assignment, paper);
        prependAssignment(savedItem);
      } catch {
        createAssignmentFromDraft(paper);
      }

      if (onNext) onNext();
    } catch (generationError: unknown) {
      const message = generationError instanceof Error
        ? generationError.message
        : 'Failed to generate questions. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Assignment Details</h2>
        <p className="text-sm text-gray-500">Basic information about your assignment</p>
      </div>

      <div className="space-y-8">
        {/* File Upload Area */}
        <div>
          <FileUploadArea onFileChange={(file) => setAssignment({ fileUpload: file })} />
          <p className="text-center text-xs text-gray-400 mt-2">Upload images of your preferred document/image</p>
        </div>

        {/* Exam Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Exam Date</label>
          <input
            type="date"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
            value={assignment.examDate}
            onChange={(e) => setAssignment({ examDate: e.target.value })}
          />
        </div>

        {/* Question Type Configuration */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <label className="block text-sm font-semibold text-gray-800">Question Type</label>
          </div>
          
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
             <QuestionConfigForm />

             <div className="mt-5 pt-4 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-700 mb-3">Paper Details</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => focusField('duration')}
                    className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-100 transition"
                  >
                    Pick Test Duration
                  </button>
                  <button
                    type="button"
                    onClick={() => focusField('subject')}
                    className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-100 transition"
                  >
                    Subject Name
                  </button>
                  <button
                    type="button"
                    onClick={() => focusField('schoolName')}
                    className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-100 transition"
                  >
                    School Name
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Assignment Name</label>
                    <input
                      id="assignmentTitle"
                      type="text"
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                      placeholder="e.g. Civics Mid-Term Practice Set"
                      value={assignment.title}
                      onChange={(e) => setAssignment({ title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Duration</label>
                    <select
                      id="duration"
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                      value={assignment.duration}
                      onChange={(e) => setAssignment({ duration: e.target.value })}
                    >
                      <option value="">Select duration</option>
                      <option value="30 Minutes">30 Minutes</option>
                      <option value="45 Minutes">45 Minutes</option>
                      <option value="1 Hour">1 Hour</option>
                      <option value="1.5 Hours">1.5 Hours</option>
                      <option value="2 Hours">2 Hours</option>
                      <option value="3 Hours">3 Hours</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Subject Name</label>
                    <input
                      id="subject"
                      type="text"
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                      placeholder="e.g. Mathematics"
                      value={assignment.subject}
                      onChange={(e) => setAssignment({ subject: e.target.value })}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">School Name</label>
                    <input
                      id="schoolName"
                      type="text"
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                      placeholder="e.g. Delhi Public School"
                      value={assignment.schoolName}
                      onChange={(e) => setAssignment({ schoolName: e.target.value })}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">School Level</label>
                    <select
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                      value={assignment.schoolLevel}
                      onChange={(e) => setAssignment({ schoolLevel: e.target.value as typeof assignment.schoolLevel })}
                    >
                      <option value="primary">Primary Level</option>
                      <option value="secondary">Secondary Level</option>
                      <option value="senior-secondary">Senior Secondary Level</option>
                      <option value="bachelors">Bachelors Level</option>
                    </select>
                  </div>
                </div>
             </div>
             
             {/* Totals Summary */}
             <div className="flex justify-end mt-4 pt-4 text-xs font-semibold text-gray-600 border-t border-gray-200">
                <div className="flex flex-col items-end gap-1">
                  <span>Total Questions : {assignment.totalQuestions || 25}</span>
                  <span>Total Marks : {assignment.totalMarks || 60}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Additional Information */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Additional Information (For better output)</label>
          <div className="relative">
             <textarea
               className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm min-h-[100px] resize-none"
               placeholder="e.g Generate a question paper for 3 hour exam duration..."
               value={assignment.additionalInstructions}
               onChange={(e) => setAssignment({ additionalInstructions: e.target.value })}
             />
             <span className="absolute right-3 bottom-3 text-gray-400">🎤</span>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="mt-10 pt-6">
      <div className="flex justify-between items-center">
        <button className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 transition flex items-center gap-2">
          <span>←</span> Previous
        </button>
        <button 
          onClick={handleCreate}
          disabled={isLoading}
          className="px-6 py-2.5 bg-[#1A1A1A] text-white rounded-full text-sm font-medium hover:bg-black transition flex items-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <span className="inline-block h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              Generate Questions <span>→</span>
            </>
          )}
        </button>
      </div>

      {isLoading && (
        <div className="mt-4">
          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-orange-500 rounded-full animate-pulse" />
          </div>
          <p className="mt-2 text-xs text-gray-500">Generating your question paper...</p>
        </div>
      )}
      </div>
    </div>
  );
}

function buildQuestionPaperFromResult(assignment: { subject: string; schoolName: string; schoolLevel: string; examDate: string; duration: string; totalMarks: number }, questions: GeneratedQuestion[]): QuestionPaper {
  const sectionMap = new Map<string, GeneratedQuestion[]>();

  for (const question of questions) {
    const section = question.section || 'A';
    if (!sectionMap.has(section)) {
      sectionMap.set(section, []);
    }
    sectionMap.get(section)?.push(question);
  }

  const sections = Array.from(sectionMap.entries()).map(([section, sectionQuestions]) => ({
    title: `Section ${section}`,
    instructions: 'Answer all questions in this section.',
    questions: sectionQuestions,
    marks: sectionQuestions.reduce((sum, item) => sum + item.marks, 0),
  }));

  return {
    title: `${assignment.subject} Question Paper`,
    schoolName: assignment.schoolName,
    subject: assignment.subject,
    standard: assignment.schoolLevel,
    date: assignment.examDate,
    duration: assignment.duration,
    totalMarks: assignment.totalMarks,
    sections,
    sections_and_summary: '',
  };
}