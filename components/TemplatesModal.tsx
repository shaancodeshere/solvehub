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
        className="w-full max-w-5xl bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden font-mono flex flex-col max-h-[90vh] my-auto animate-in fade-in zoom-in-95 duration-150 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border)] text-[var(--foreground)] flex items-center justify-center">
              <svg className="w-4 h-4 text-[var(--foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] tracking-wide">
                Contextual Calculation Recipes
              </h2>
              <p className="text-xs text-[var(--muted)] font-sans mt-0.5">
                Instant multi-line templates with live variable scoping and statement totals
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-mono rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-subtle)] text-[var(--foreground)] border border-[var(--border)] transition cursor-pointer"
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
              className="bg-[var(--surface-subtle)] border border-[var(--border)] hover:border-[var(--foreground)] rounded-xl p-4 flex flex-col justify-between transition-all shadow-sm group"
            >
              <div>
                {/* Title & Badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-bold text-[var(--foreground)] transition">
                    {tpl.name}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] shrink-0">
                    {tpl.badge}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-[var(--muted)] font-sans leading-relaxed mb-3">
                  {tpl.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-3.5">
                  {tpl.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono bg-[var(--surface)] text-[var(--muted)] px-2 py-0.5 rounded border border-[var(--border)]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Formula Preview Block */}
                <div className="relative mb-4">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-semibold mb-1">
                    Formula Preview
                  </div>
                  <pre className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-3 text-[11px] font-mono text-[var(--foreground)] overflow-x-auto max-h-36 leading-relaxed">
                    <code>{tpl.content}</code>
                  </pre>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => onInsertActive(tpl)}
                  className="flex-1 py-2 px-3 rounded-lg bg-[#1c5f27] text-[#cff060] dark:bg-[#cff060] dark:text-[#1c5f27] text-xs font-semibold font-mono transition flex items-center justify-center gap-1.5 shadow-sm active:scale-98 cursor-pointer"
                  title="Insert this script into your active canvas sheet"
                >
                  <span>Insert into Active Sheet</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenNewSheet(tpl)}
                  className="flex-1 py-2 px-3 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-subtle)] text-[var(--foreground)] text-xs font-medium font-mono border border-[var(--border)] transition flex items-center justify-center gap-1.5 shadow-sm active:scale-98 cursor-pointer"
                  title="Create a new sheet tab pre-filled with this recipe"
                >
                  <span>Open in New Sheet</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-2.5 bg-[var(--surface-subtle)] border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--muted)] font-mono">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-[var(--muted)] bg-[var(--surface)] px-1.5 py-0.5 rounded border border-[var(--border)]">Tip</span>
            <span>You can also search and insert any recipe via <kbd className="px-2 py-0.5 text-xs font-mono bg-[var(--surface)] border border-[var(--border)] rounded text-[var(--foreground)] inline-flex items-center shadow-sm">/</kbd></span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[var(--foreground)] hover:bg-[var(--surface-subtle)] px-3 py-1 rounded bg-[var(--surface)] border border-[var(--border)] transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
