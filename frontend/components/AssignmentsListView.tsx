'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useAssignmentStore } from '@/store/assignmentStore';
import AssignmentsEmptyState from './AssignmentsEmptyState';
import { generatePDF } from '@/lib/pdfGenerator';
import {
  deleteAssignmentById,
  fetchAssignments,
  renameAssignmentById,
} from '@/lib/assignmentsApi';

interface AssignmentsListViewProps {
  onCreateAssignment: () => void;
}

export default function AssignmentsListView({ onCreateAssignment }: AssignmentsListViewProps) {
  const {
    assignmentsList,
    setAssignmentsList,
    deleteAssignment,
    renameAssignment,
  } = useAssignmentStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingAssignmentId, setDeletingAssignmentId] = useState<string | null>(null);
  const [pendingRenameId, setPendingRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renamingAssignmentId, setRenamingAssignmentId] = useState<string | null>(null);

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const items = await fetchAssignments();
        setAssignmentsList(items);
      } catch {
        // Keep current local list if backend fetch fails.
      }
    };

    loadAssignments();
  }, [setAssignmentsList]);

  const handleDeleteAssignment = async (assignmentId: string) => {
    setDeletingAssignmentId(assignmentId);

    try {
      await deleteAssignmentById(assignmentId);
      deleteAssignment(assignmentId);

      // Re-sync from backend so list state always reflects persisted data.
      const items = await fetchAssignments();
      setAssignmentsList(items);

      setPendingDeleteId(null);
      setOpenMenuId(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete assignment';
      alert(message);
    } finally {
      setDeletingAssignmentId(null);
    }
  };

  const startRenameAssignment = (assignmentId: string, currentTitle: string) => {
    setPendingRenameId(assignmentId);
    setRenameValue(currentTitle);
    setPendingDeleteId(null);
  };

  const handleRenameAssignment = async (assignmentId: string) => {
    const trimmed = renameValue.trim();
    if (!trimmed) {
      alert('Assignment title cannot be empty.');
      return;
    }

    setRenamingAssignmentId(assignmentId);

    try {
      const updated = await renameAssignmentById(assignmentId, trimmed);
      renameAssignment(assignmentId, updated.title);
      setPendingRenameId(null);
      setRenameValue('');
      setOpenMenuId(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to rename assignment';
      alert(message);
    } finally {
      setRenamingAssignmentId(null);
    }
  };

  const handleDownloadQuestionPaper = async (assignmentId: string) => {
    const selected = assignmentsList.find((item) => item.id === assignmentId);
    if (!selected?.paper) {
      alert('Question paper is not available for this assignment.');
      return;
    }

    await generatePDF(
      selected.paper,
      { studentName: '', studentRoll: '', studentSection: '' },
      'question-paper'
    );
  };

  const handleDownloadAnswerKey = async (assignmentId: string) => {
    const selected = assignmentsList.find((item) => item.id === assignmentId);
    if (!selected?.paper) {
      alert('Answer key is not available for this assignment.');
      return;
    }

    await generatePDF(
      selected.paper,
      { studentName: '', studentRoll: '', studentSection: '' },
      'answer-key'
    );
  };

  const filteredAssignments = useMemo(() => {
    if (!searchTerm.trim()) {
      return assignmentsList;
    }

    return assignmentsList.filter((assignment) =>
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [assignmentsList, searchTerm]);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
        </div>
        <p className="text-sm text-gray-500">Manage and create assignments for your classes.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-3 mb-4 flex flex-col md:flex-row gap-3">
        <button className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 w-fit">
          <span>⌄</span>
          <span>Filter By</span>
        </button>

        <div className="relative flex-1 md:max-w-[320px] md:ml-auto">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">⌕</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Assignment"
            className="w-full h-10 pl-9 pr-3 text-sm border border-gray-200 rounded-full bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
        </div>
      </div>

      {filteredAssignments.length === 0 ? (
        <AssignmentsEmptyState onCreateClick={onCreateAssignment} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-24">
          {filteredAssignments.map((assignment) => (
            <article key={assignment.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 relative">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-3xl font-semibold text-gray-900 leading-tight underline decoration-2 underline-offset-4">
                  {assignment.title}
                </h2>
                <div className="relative">
                  <button
                    onClick={() => {
                      const nextOpenId = openMenuId === assignment.id ? null : assignment.id;
                      setOpenMenuId(nextOpenId);
                      if (nextOpenId !== assignment.id) {
                        setPendingDeleteId(null);
                        setPendingRenameId(null);
                        setRenameValue('');
                      }
                    }}
                    className="h-8 w-8 rounded-full hover:bg-gray-100 text-gray-500"
                    aria-label="Open assignment actions"
                  >
                    ⋮
                  </button>
                  {openMenuId === assignment.id && (
                    <div className="absolute right-0 top-9 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-10">
                      {pendingRenameId === assignment.id ? (
                        <div className="px-3 py-2 border-b border-gray-100">
                          <p className="text-xs text-gray-600">Rename this assignment</p>
                          <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            className="mt-2 h-8 w-full rounded-md border border-gray-200 px-2 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
                            placeholder="Assignment title"
                            autoFocus
                          />
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              onClick={() => {
                                setPendingRenameId(null);
                                setRenameValue('');
                              }}
                              className="px-2.5 py-1 text-xs rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
                              disabled={renamingAssignmentId === assignment.id}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleRenameAssignment(assignment.id)}
                              className="px-2.5 py-1 text-xs rounded-md bg-gray-900 text-white hover:bg-black disabled:opacity-60"
                              disabled={renamingAssignmentId === assignment.id}
                            >
                              {renamingAssignmentId === assignment.id ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => startRenameAssignment(assignment.id, assignment.title)}
                          className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Rename
                        </button>
                      )}
                      {pendingDeleteId === assignment.id ? (
                        <div className="px-3 py-2 border-t border-gray-100">
                          <p className="text-xs text-gray-600">Delete this assignment permanently?</p>
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              onClick={() => setPendingDeleteId(null)}
                              className="px-2.5 py-1 text-xs rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
                              disabled={deletingAssignmentId === assignment.id}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleDeleteAssignment(assignment.id)}
                              className="px-2.5 py-1 text-xs rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                              disabled={deletingAssignmentId === assignment.id}
                            >
                              {deletingAssignmentId === assignment.id ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setPendingDeleteId(assignment.id);
                            setPendingRenameId(null);
                            setRenameValue('');
                          }}
                          className="w-full text-left px-3 py-1.5 text-sm text-red-500 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-12 flex items-center justify-between text-sm">
                <p className="text-gray-700 font-semibold">
                  Assigned on : <span className="font-normal text-gray-500">{assignment.assignedOn}</span>
                </p>
                <p className="text-gray-700 font-semibold">
                  Exam Date : <span className="font-normal text-gray-500">{assignment.examDate}</span>
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => handleDownloadQuestionPaper(assignment.id)}
                  disabled={!assignment.paper}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
                >
                  <Image src="/donwload%20button%20img.png" alt="Download" width={14} height={14} />
                  Download Question Paper
                </button>
                <button
                  onClick={() => handleDownloadAnswerKey(assignment.id)}
                  disabled={!assignment.paper}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
                >
                  <Image src="/donwload%20button%20img.png" alt="Download" width={14} height={14} />
                  Download Answer Key
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

    </div>
  );
}
