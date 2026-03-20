'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAssignmentStore } from '@/store/assignmentStore';
import AssignmentForm from '@/components/AssignmentForm';
import AssignmentsListView from '@/components/AssignmentsListView';
import QuestionsDisplay from '@/components/QuestionsDisplay';
import QuestionPaperView from '@/components/QuestionPaperView';

export default function AssignmentPage() {
  const router = useRouter();
  const { currentStep, setCurrentStep, generatedQuestions, questionPaper } = useAssignmentStore();
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [activeView, setActiveView] = useState<'create' | 'list'>('list');

  // Flow handlers
  const handleCreateAssignment = () => {
    setActiveView('create');
    setCurrentStep(1);
  };

  const handleOpenAssignments = () => {
    setActiveView('list');
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] font-sans text-[#111827]">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-[260px] bg-white border-r border-gray-200 z-50">
        <div className="p-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-md overflow-hidden bg-white border border-gray-200 flex items-center justify-center">
            <Image src="/veda logo.avif" alt="VedaAI Logo" width={28} height={28} className="object-cover" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">VedaAI</h2>
        </div>

        <div className="px-4 pt-4 pb-2">
          <button
            onClick={handleCreateAssignment}
            className={`w-full bg-[#1A1A1A] text-white flex items-center justify-center gap-2 py-2.5 rounded-full hover:bg-black transition ${
              activeView === 'create'
                ? 'border-2 border-orange-400/70 shadow-[0_0_0_2px_rgba(255,107,53,0.45),0_0_22px_rgba(255,107,53,0.65)]'
                : 'border border-transparent'
            }`}
          >
            <span>✨</span> Create Assignment
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <SidebarItem icon="grid" label="Home" />
          <SidebarItem icon="users" label="My Groups" />
          <SidebarItem icon="file-text" label="Assignments" active={activeView === 'list'} onClick={handleOpenAssignments} />
          <SidebarItem icon="smartphone" label="AI Teacher's Toolkit" />
          <SidebarItem icon="clock" label="My Library" />
        </nav>

        <div className="p-4 border-t border-gray-100">
          <SidebarItem icon="settings" label="Settings" />
          <div className="mt-4 p-3 bg-gray-50 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
              <svg className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c1.8-3.6 5-5.5 8-5.5s6.2 1.9 8 5.5" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-gray-900">Delhi Public School</p>
              <p className="text-xs text-gray-500 truncate">Bokaro Steel City</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* TOP HEADER */}
        <header className="bg-white border-b border-gray-200 z-40 px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="text-gray-500 hover:text-black transition flex items-center gap-2">
              <span className="text-xl">←</span>
              <span className="hidden md:inline font-medium text-gray-600">{activeView === 'list' ? 'Assignments' : 'Assignment'}</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative text-gray-500 hover:text-black transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#FF6B35] border-2 border-white rounded-full"></span>
            </button>

            <div className="relative">
              <button onClick={() => setShowAccountMenu(!showAccountMenu)} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c1.8-3.6 5-5.5 8-5.5s6.2 1.9 8 5.5" />
                  </svg>
                </div>
                <span className="hidden md:block text-sm font-medium">John Doe</span>
                <span className="hidden md:block text-xs text-gray-500">▼</span>
              </button>
            </div>
          </div>
        </header>

        {/* SCROLLABLE WORKSPACE */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {activeView === 'list' ? (
            <AssignmentsListView onCreateAssignment={handleCreateAssignment} />
          ) : (
            <div className="max-w-4xl mx-auto">

              {/* Title & Progress Bar (Visible in step 1 & 2) */}
              {currentStep < 3 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                    <h1 className="text-xl font-bold">Create Assignment</h1>
                  </div>
                  <p className="text-sm text-gray-500 ml-4 mb-4">Set up a new assignment for your students</p>
                  <div className="flex gap-2 ml-4">
                    <div className={`h-1 flex-1 rounded-full ${currentStep >= 1 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div className={`h-1 flex-1 rounded-full ${currentStep >= 2 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>

                  <div className="ml-4 mt-3 flex flex-wrap gap-2">
                    {currentStep === 2 && (
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        ← Back to Create
                      </button>
                    )}
                    {currentStep === 1 && generatedQuestions.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="px-3 py-1.5 text-xs font-medium rounded-full bg-green-600 text-white hover:bg-green-700"
                      >
                        Go to Generated →
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Dynamic Step Rendering */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                {currentStep === 1 && <AssignmentForm onNext={() => setCurrentStep(2)} />}

                {currentStep === 2 && (
                  <div className="space-y-8">
                    <QuestionsDisplay questions={generatedQuestions} showActions={false} />
                    {questionPaper && (
                      <QuestionPaperView
                        paper={questionPaper}
                        onRegenerate={() => setCurrentStep(1)}
                      />
                    )}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1A1A1A] text-gray-400 flex justify-around p-3 pb-safe z-50 rounded-t-2xl">
        <MobileNavItem icon="grid" label="Home" />
        <MobileNavItem icon="users" label="My Groups" active />
        <MobileNavItem icon="book" label="Library" />
        <MobileNavItem icon="sparkles" label="AI Toolkit" />
      </nav>
    </div>
  );
}

type NavIconName = 'grid' | 'users' | 'file-text' | 'smartphone' | 'clock' | 'settings' | 'book' | 'sparkles';

function NavIcon({ name, className = 'w-5 h-5' }: { name: NavIconName; className?: string }) {
  const shared = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  switch (name) {
    case 'grid':
      return (
        <svg className={className} viewBox="0 0 24 24" {...shared}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case 'users':
      return (
        <svg className={className} viewBox="0 0 24 24" {...shared}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 19c.8-2.9 3-4.5 5.5-4.5s4.7 1.6 5.5 4.5" />
          <circle cx="17.5" cy="9" r="2.5" />
          <path d="M15.5 19c.5-1.8 1.9-3.1 3.9-3.5" />
        </svg>
      );
    case 'file-text':
      return (
        <svg className={className} viewBox="0 0 24 24" {...shared}>
          <path d="M14 3H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9z" />
          <path d="M14 3v6h6" />
          <path d="M9 13h6" />
          <path d="M9 17h6" />
        </svg>
      );
    case 'smartphone':
      return (
        <svg className={className} viewBox="0 0 24 24" {...shared}>
          <rect x="7" y="2.5" width="10" height="19" rx="2" />
          <path d="M10.5 5.5h3" />
          <path d="M10 18h4" />
        </svg>
      );
    case 'clock':
      return (
        <svg className={className} viewBox="0 0 24 24" {...shared}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v6l4 2" />
        </svg>
      );
    case 'settings':
      return (
        <svg className={className} viewBox="0 0 24 24" {...shared}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.03.03a2 2 0 0 1-2.83 2.83l-.03-.03a1.8 1.8 0 0 0-1.98-.36 1.8 1.8 0 0 0-1.09 1.65V22a2 2 0 0 1-4 0v-.05a1.8 1.8 0 0 0-1.1-1.65 1.8 1.8 0 0 0-1.97.36l-.03.03a2 2 0 0 1-2.83-2.83l.03-.03a1.8 1.8 0 0 0 .36-1.98 1.8 1.8 0 0 0-1.65-1.09H2a2 2 0 1 1 0-4h.05a1.8 1.8 0 0 0 1.65-1.1 1.8 1.8 0 0 0-.36-1.97l-.03-.03a2 2 0 0 1 2.83-2.83l.03.03a1.8 1.8 0 0 0 1.98.36h.01a1.8 1.8 0 0 0 1.09-1.65V2a2 2 0 0 1 4 0v.05a1.8 1.8 0 0 0 1.1 1.65 1.8 1.8 0 0 0 1.97-.36l.03-.03a2 2 0 0 1 2.83 2.83l-.03.03a1.8 1.8 0 0 0-.36 1.98v.01a1.8 1.8 0 0 0 1.65 1.09H22a2 2 0 1 1 0 4h-.05a1.8 1.8 0 0 0-1.65 1.1z" />
        </svg>
      );
    case 'book':
      return (
        <svg className={className} viewBox="0 0 24 24" {...shared}>
          <path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H19v18H7.5A2.5 2.5 0 0 0 5 22z" />
          <path d="M5 4.5V22" />
        </svg>
      );
    case 'sparkles':
      return (
        <svg className={className} viewBox="0 0 24 24" {...shared}>
          <path d="m12 3 1.6 3.9L17.5 8l-3.9 1.1L12 13l-1.6-3.9L6.5 8l3.9-1.1z" />
          <path d="m18.5 13 1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" />
          <path d="m6 13 .8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" />
        </svg>
      );
    default:
      return null;
  }
}

// Minimal Helper Components
function SidebarItem({ icon, label, active = false, onClick }: { icon: NavIconName; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${active ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
    >
      <NavIcon name={icon} className="w-5 h-5" />
      <span className="text-sm">{label}</span>
    </button>
  );
}

function MobileNavItem({ icon, label, active = false }: { icon: NavIconName; label: string; active?: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-1 ${active ? 'text-white' : ''}`}>
      <NavIcon name={icon} className="w-6 h-6" />
      <span className="text-[10px]">{label}</span>
    </div>
  );
}