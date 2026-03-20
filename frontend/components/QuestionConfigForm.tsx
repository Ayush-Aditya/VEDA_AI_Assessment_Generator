'use client';

import { QuestionType } from '@/types';
import { useAssignmentStore } from '@/store/assignmentStore';

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'mcq', label: 'Multiple Choice Questions' },
  { value: 'short-answer', label: 'Short Questions' },
  { value: 'long-answer', label: 'Long Answer Questions' },
  { value: 'true-false', label: 'True/False Questions' },
  { value: 'numerical', label: 'Numerical Problems' },
  // Adding Diagram based on Figma screenshot
  { value: 'mcq', label: 'Diagram/Graph-Based Questions' }, 
];

// We bypass the props slightly to directly hook into the store's full capabilities
export default function QuestionConfigForm() {
  const { assignment, addQuestionConfig, updateQuestionConfig, removeQuestionConfig } = useAssignmentStore();
  const configs = assignment.questionConfigs;

  const handleAddNewRow = () => {
    addQuestionConfig({
      type: 'mcq',
      count: 1,
      marks: 1,
    });
  };

  const handleIncrement = (index: number, field: 'count' | 'marks') => {
    const config = configs[index];
    updateQuestionConfig(index, {
      ...config,
      [field]: config[field] + 1,
    });
  };

  const handleDecrement = (index: number, field: 'count' | 'marks') => {
    const config = configs[index];
    if (config[field] > 1) {
      updateQuestionConfig(index, {
        ...config,
        [field]: config[field] - 1,
      });
    }
  };

  const handleTypeChange = (index: number, newType: QuestionType) => {
    const config = configs[index];
    updateQuestionConfig(index, {
      ...config,
      type: newType,
    });
  };

  return (
    <div className="w-full space-y-3">
      {configs.map((config, index) => (
        <div key={index} className="flex items-center gap-4">
          
          {/* Question Type Dropdown */}
          <div className="flex-1 flex items-center bg-white rounded-full px-4 py-2 border border-gray-200 shadow-sm relative">
            <select
              value={config.type}
              onChange={(e) => handleTypeChange(index, e.target.value as QuestionType)}
              className="w-full appearance-none bg-transparent outline-none text-sm text-gray-700 font-medium pr-8 cursor-pointer"
            >
              {QUESTION_TYPES.map((type, i) => (
                <option key={i} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <span className="absolute right-4 pointer-events-none text-gray-400 text-xs">▼</span>
          </div>

          {/* Delete Row Cross */}
          <button 
            onClick={() => removeQuestionConfig(index)}
            className="text-gray-400 hover:text-red-500 transition px-1"
          >
            ✕
          </button>

          {/* No. of Questions Stepper */}
          <div className="w-28 flex flex-col items-center">
            <span className="mb-1 text-[11px] font-medium text-gray-500">No. of Questions</span>
            <div className="w-full flex items-center justify-between bg-white rounded-full px-3 py-2 border border-gray-200 shadow-sm">
              <button 
                onClick={() => handleDecrement(index, 'count')}
                className="text-gray-400 hover:text-black w-6 text-center font-medium"
              >−</button>
              <span className="text-sm font-bold text-gray-800 w-6 text-center">
                {config.count}
              </span>
              <button 
                onClick={() => handleIncrement(index, 'count')}
                className="text-gray-400 hover:text-black w-6 text-center font-medium"
              >+</button>
            </div>
          </div>

          {/* Marks Stepper */}
          <div className="w-28 flex flex-col items-center">
            <span className="mb-1 text-[11px] font-medium text-gray-500">Marks</span>
            <div className="w-full flex items-center justify-between bg-white rounded-full px-3 py-2 border border-gray-200 shadow-sm">
              <button 
                onClick={() => handleDecrement(index, 'marks')}
                className="text-gray-400 hover:text-black w-6 text-center font-medium"
              >−</button>
              <span className="text-sm font-bold text-gray-800 w-6 text-center">
                {config.marks}
              </span>
              <button 
                onClick={() => handleIncrement(index, 'marks')}
                className="text-gray-400 hover:text-black w-6 text-center font-medium"
              >+</button>
            </div>
          </div>

        </div>
      ))}

      {/* Add New Type Button */}
      <button 
        onClick={handleAddNewRow}
        className="mt-4 flex items-center gap-2 text-sm font-semibold text-gray-800 hover:opacity-75 transition"
      >
        <div className="w-6 h-6 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-lg leading-none">
          +
        </div>
        Add Question Type
      </button>
    </div>
  );
}