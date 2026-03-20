'use client';

interface AssignmentsEmptyStateProps {
  onCreateClick: () => void;
}

export default function AssignmentsEmptyState({ onCreateClick }: AssignmentsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full py-20 px-4 text-center">
      {/* Custom SVG Illustration mapping to the Figma design */}
      <div className="relative w-64 h-64 mb-6 flex items-center justify-center">
        <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Background gray circle */}
          <circle cx="120" cy="120" r="90" fill="#F3F6F8" />
          
          {/* Decorative left squiggle */}
          <path d="M45 90 C 30 90, 30 110, 50 115 C 65 118, 65 95, 80 95" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          
          {/* Decorative sparkles/dots */}
          <path d="M70 145 L75 155 L85 160 L75 165 L70 175 L65 165 L55 160 L65 155 Z" fill="#4B83C4" />
          <circle cx="190" cy="125" r="4" fill="#4B83C4" />
          <rect x="175" y="85" width="16" height="10" rx="3" fill="#D1D5DB" />
          <rect x="195" y="85" width="10" height="10" rx="3" fill="#D1D5DB" />

          {/* Document Paper */}
          <rect x="85" y="70" width="70" height="95" rx="6" fill="white" />
          <rect x="85" y="70" width="70" height="95" rx="6" fill="none" stroke="#E5E7EB" strokeWidth="2" />
          
          {/* Document Lines */}
          <line x1="100" y1="90" x2="140" y2="90" stroke="#1F2937" strokeWidth="4" strokeLinecap="round" />
          <line x1="100" y1="110" x2="140" y2="110" stroke="#E5E7EB" strokeWidth="4" strokeLinecap="round" />
          <line x1="100" y1="130" x2="125" y2="130" stroke="#E5E7EB" strokeWidth="4" strokeLinecap="round" />
          <line x1="100" y1="150" x2="120" y2="150" stroke="#E5E7EB" strokeWidth="4" strokeLinecap="round" />

          {/* Magnifying Glass Handle */}
          <line x1="155" y1="155" x2="185" y2="185" stroke="#D3D0E5" strokeWidth="14" strokeLinecap="round" />
          
          {/* Magnifying Glass Lens */}
          <circle cx="140" cy="140" r="32" fill="#F8FAFC" stroke="#E5E7EB" strokeWidth="8" />
          <circle cx="140" cy="140" r="28" fill="white" />

          {/* Red X inside Magnifying Glass */}
          <path d="M128 128 L152 152 M152 128 L128 152" stroke="#EF4444" strokeWidth="6" strokeLinecap="round" />
        </svg>
      </div>

      {/* Typography */}
      <h2 className="text-xl font-bold text-gray-900 mb-3">
        No assignments yet
      </h2>
      <p className="text-sm text-gray-500 max-w-[460px] leading-relaxed mb-8">
        Create your first assignment to start collecting and grading student
        submissions. You can set up rubrics, define marking criteria, and let AI
        assist with grading.
      </p>

      {/* Action Button */}
      <button 
        onClick={onCreateClick}
        className="flex items-center gap-2 bg-[#1A1A1A] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-black transition-colors"
      >
        <span>+</span> Create Your First Assignment
      </button>
    </div>
  );
}
