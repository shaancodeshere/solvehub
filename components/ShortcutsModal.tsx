'use client';

import React, { useEffect, useState } from 'react';
import { CanvasModeIcon, LibraryModeIcon } from '@/components/layout/AppSidebar';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  icon?: React.ReactNode;
}

interface ShortcutGroup {
  title: string;
  items: ShortcutItem[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'Modes & Navigation',
    items: [
      {
        keys: ['C'],
        description: 'Switch to Canvas Mode',
        icon: <CanvasModeIcon className="w-3.5 h-3.5" />,
      },
      {
        keys: ['L'],
        description: 'Switch to Library Mode',
        icon: <LibraryModeIcon className="w-3.5 h-3.5" />,
      },
      { keys: ['/'], description: 'Search Calculators' },
      { keys: ['⌘', 'B'], description: 'Toggle Sidebar' },
      { keys: ['H'], description: 'Toggle Calculation History' },
      { keys: ['T'], description: 'Open Templates Modal' },
    ],
  },
  {
    title: 'Canvas & Sheets',
    items: [
      { keys: ['⌘', 'U'], description: 'New Sheet' },
      { keys: ['⌘', ']'], description: 'Next Canvas Sheet' },
      { keys: ['⌘', '['], description: 'Previous Canvas Sheet' },
      { keys: ['⌘', 'K'], description: 'Clear Sheet (when active)' },
    ],
  },
  {
    title: 'Receipt & Exports',
    items: [
      { keys: ['⌘', 'C'], description: 'Copy Formatted Receipt' },
      { keys: ['⌘', 'D'], description: 'Download Receipt (.txt / .csv)' },
    ],
  },
];

export default function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      const isApple = /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent || navigator.platform || '');
      setIsMac(isApple);
    }
  }, []);
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
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
      aria-label="Keyboard Shortcuts Cheatsheet"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[var(--surface)] dark:bg-[#161b22] border border-[var(--border)] dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden font-mono flex flex-col max-h-[90vh] my-auto transition-colors animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] dark:border-slate-800 flex items-center justify-between bg-[var(--surface-subtle)] dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-950/80 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                <rect x="2" y="4" width="20" height="16" rx="2.5" />
                <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M8 16h8" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-wide">
                Keyboard Shortcuts
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                Unified 1-key and 2-key controls for maximum speed
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            aria-label="Close modal"
          >
            Esc
          </button>
        </div>

        {/* Shortcuts Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title} className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>{group.title}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {group.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-[var(--surface-subtle)] dark:bg-slate-900/60 border border-[var(--border)] dark:border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      {item.icon && (
                        <span className="text-emerald-500 dark:text-emerald-400 shrink-0">
                          {item.icon}
                        </span>
                      )}
                      <span className="text-slate-700 dark:text-slate-300 font-sans font-medium text-[12px] truncate">
                        {item.description}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 font-mono">
                      {item.keys.map((k, kIdx) => {
                        const isCmd = k === '⌘' && isMac;
                        const isCtrl = k === '⌘' && !isMac;
                        const displayKey = k === '⌘' ? (isMac ? '⌘' : 'Ctrl') : k;

                        return (
                          <kbd
                            key={kIdx}
                            className="min-w-[24px] h-6 px-1.5 rounded bg-[var(--surface)] dark:bg-slate-800 border border-[var(--border)] dark:border-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center shadow-sm"
                          >
                            {isCmd ? (
                              <span className="text-[16px] leading-none font-medium select-none -translate-y-[0.5px]">
                                ⌘
                              </span>
                            ) : isCtrl ? (
                              <span className="text-[11px] leading-none font-semibold">
                                Ctrl
                              </span>
                            ) : (
                              <span className="text-xs leading-none font-semibold">
                                {displayKey}
                              </span>
                            )}
                          </kbd>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[var(--border)] dark:border-slate-800 bg-[var(--surface-subtle)] dark:bg-slate-900/40 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
          <span>Single keys active when not typing</span>
          <span>Mac (⌘) & Win/Linux (Ctrl) compatible</span>
        </div>
      </div>
    </div>
  );
}
