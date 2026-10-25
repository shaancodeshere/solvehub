'use client';

import React, { useEffect } from 'react';
import { CANVAS_TEMPLATES, CanvasTemplate } from '@/lib/canvasTemplates';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertActive: (template: CanvasTemplate) => void;
  onOpenNewSheet: (template: CanvasTemplate) => void;
}

export default function TemplatesModal({
  isOpen,
  onClose,
  onInsertActive,
  onOpenNewSheet,
}: TemplatesModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
      aria-label="Calculation Templates"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl bg-[var(--surface)] dark:bg-[#161b22] border border-[var(--border)] dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden font-mono flex flex-col max-h-[90vh] my-auto animate-in fade-in zoom-in-95 duration-150 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] dark:border-slate-800 flex items-center justify-between bg-[var(--surface-subtle)] dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-950/80 border border-emerald-500/30 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-wide">
                Contextual Calculation Recipes
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                Instant multi-line templates with live variable scoping and statement totals
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            aria-label="Close templates modal"
          >
            Esc
          </button>
        </div>

        {/* Card Grid */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {CANVAS_TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-[var(--surface-subtle)] dark:bg-slate-900/60 border border-[var(--border)] dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700/90 rounded-xl p-4 flex flex-col justify-between transition-all shadow-sm group"
            >
              <div>
                {/* Title & Badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                    {tpl.name}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface)] dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                    {tpl.badge}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-slate-400 font-sans leading-relaxed mb-3">
                  {tpl.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-3.5">
                  {tpl.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono bg-[var(--surface)] dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded border border-[var(--border)] dark:border-slate-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Formula Preview Block */}
                <div className="relative mb-4">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
                    Formula Preview
                  </div>
                  <pre className="bg-[var(--surface)] dark:bg-slate-950/90 border border-[var(--border)] dark:border-slate-800/90 rounded-lg p-3 text-[11px] font-mono text-emerald-600 dark:text-emerald-400/95 overflow-x-auto max-h-36 leading-relaxed selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-white">
                    <code>{tpl.content}</code>
                  </pre>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)] dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => onInsertActive(tpl)}
                  className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold font-mono transition flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
                  title="Insert this script into your active canvas sheet"
                >
                  <span>Insert into Active Sheet</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenNewSheet(tpl)}
                  className="flex-1 py-2 px-3 rounded-lg bg-[var(--surface)] hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-xs font-medium font-mono border border-[var(--border)] dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 transition flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
                  title="Create a new sheet tab pre-filled with this recipe"
                >
                  <span>Open in New Sheet</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-2.5 bg-[var(--surface-subtle)] dark:bg-slate-900/80 border-t border-[var(--border)] dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 bg-[var(--surface)] dark:bg-slate-800 px-1.5 py-0.5 rounded border border-[var(--border)] dark:border-slate-700">Tip</span>
            <span>You can also search and insert any recipe via <kbd className="px-2 py-0.5 text-xs font-mono bg-[var(--surface)] dark:bg-slate-950 border border-[var(--border)] dark:border-slate-700/80 rounded text-slate-600 dark:text-slate-400 inline-flex items-center shadow-sm">/</kbd></span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-1 rounded bg-[var(--surface)] dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-[var(--border)] dark:border-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
