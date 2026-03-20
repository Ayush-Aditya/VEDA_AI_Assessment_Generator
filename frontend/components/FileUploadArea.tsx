'use client';

import { useState, useRef } from 'react';

interface FileUploadAreaProps {
  onFileChange: (file: File | null) => void;
}

export default function FileUploadArea({ onFileChange }: FileUploadAreaProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Note: Adjusted allowed types for typical assignment workflows (PDF, images, text)
    setUploadedFile(file);
    onFileChange(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl py-10 px-6 text-center transition-all bg-white flex flex-col items-center justify-center gap-3 ${
          dragActive
            ? 'border-[#FF6B35] bg-orange-50/50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,.jpg,.jpeg,.png"
          onChange={handleChange}
          className="hidden"
          id="file-upload"
        />

        {!uploadedFile ? (
          <>
            {/* Cloud Upload Icon */}
            <div className="mb-1 text-gray-800">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            
            <h3 className="text-base font-semibold text-gray-900">
              Choose a file or drag & drop it here
            </h3>
            <p className="text-xs text-gray-400 font-medium mb-2">
              JPEG, PNG, upto 10MB
            </p>
            
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-2 px-6 py-2 bg-white border border-gray-200 shadow-sm rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Browse Files
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center w-full">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="font-semibold text-gray-900 truncate max-w-[200px]">{uploadedFile.name}</p>
            <p className="text-xs text-gray-500 mt-1">
              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <button
              onClick={() => {
                setUploadedFile(null);
                onFileChange(null);
              }}
              className="mt-4 px-4 py-1.5 text-red-500 hover:bg-red-50 rounded-full text-sm font-medium transition"
            >
              Remove File
            </button>
          </div>
        )}
      </div>
    </div>
  );
}