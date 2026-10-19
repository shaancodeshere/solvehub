'use client';

import React, { useEffect } from 'react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFormat: (format: 'txt' | 'csv') => void;
  activeFormat?: 'txt' | 'csv';
}

export default function DownloadModal({
  isOpen,
  onClose,
  onSelectFormat,
  activeFormat = 'txt',
}: DownloadModalProps) {
  // Close on Escape or number keys (1: txt, 2: csv)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === '1' || e.key.toLowerCase() === 't') {
        e.preventDefault();
        onSelectFormat('txt');
        onClose();
        return;
      }
      if (e.key === '2' || e.key.toLowerCase() === 'c') {
        e.preventDefault();
        onSelectFormat('csv');
        onClose();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onSelectFormat]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      const origOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = origOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Download Receipt Format"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[var(--surface)] dark:bg-[#161b22] border border-[var(--border)] dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden font-mono flex flex-col transition-colors animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--border)] dark:border-slate-800 flex items-center justify-between bg-[var(--surface-subtle)] dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-950/80 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-wide">
                Download Receipt
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                Choose format for file export
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-[var(--surface)] dark:bg-slate-800 border border-[var(--border)] dark:border-slate-700 rounded text-slate-500 dark:text-slate-400">
              ESC
            </kbd>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-md hover:bg-[var(--surface)] dark:hover:bg-slate-800 transition"
              aria-label="Close modal"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Format Options */}
        <div className="p-4 space-y-2.5">
          {/* Option 1: Text Slip (.txt) */}
          <button
            type="button"
            onClick={() => {
              onSelectFormat('txt');
              onClose();
            }}
            className={`w-full p-3.5 rounded-xl border text-left transition flex items-center justify-between group cursor-pointer ${
              activeFormat === 'txt'
                ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/40 dark:border-emerald-500/50 shadow-sm'
                : 'bg-[var(--surface-subtle)] dark:bg-slate-900/60 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 border-[var(--border)] dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--surface)] dark:bg-slate-800 border border-[var(--border)] dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:text-emerald-500 transition shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                    Text Slip (.txt)
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-[var(--border)] dark:border-slate-700">
                    Press 1
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                  Formatted retro thermal ASCII receipt
                </p>
              </div>
            </div>
            <span className="text-xs text-slate-400 group-hover:text-emerald-500 transition font-bold pr-1">
              →
            </span>
          </button>

          {/* Option 2: Spreadsheet (.csv) */}
          <button
            type="button"
            onClick={() => {
              onSelectFormat('csv');
              onClose();
            }}
            className={`w-full p-3.5 rounded-xl border text-left transition flex items-center justify-between group cursor-pointer ${
              activeFormat === 'csv'
                ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/40 dark:border-emerald-500/50 shadow-sm'
                : 'bg-[var(--surface-subtle)] dark:bg-slate-900/60 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 border-[var(--border)] dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--surface)] dark:bg-slate-800 border border-[var(--border)] dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:text-emerald-500 transition shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 4h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                    Spreadsheet (.csv)
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-[var(--border)] dark:border-slate-700">
                    Press 2
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                  Structured RFC-compliant CSV
                </p>
              </div>
            </div>
            <span className="text-xs text-slate-400 group-hover:text-emerald-500 transition font-bold pr-1">
              →
            </span>
          </button>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--border)] dark:border-slate-800/80 bg-[var(--surface-subtle)] dark:bg-slate-900/40 flex items-center justify-between text-[11px] text-slate-500">
          <span>Format picker</span>
          <span>Shortcut: ⌘D / Ctrl+D</span>
        </div>
      </div>
    </div>
  );
}
