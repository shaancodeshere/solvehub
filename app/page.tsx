'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { masterCategories } from '@/lib/categories';
import { allCalculators } from '@/lib/calculators';
import { executeCanvasScript, EvaluatedVariable } from '@/lib/canvasEngine';

interface HistoryItem {
  id: string;
  title: string;
  timestamp: string;
  content: string;
  totalDisplay: string;
  itemCount: number;
}

const DEFAULT_CANVAS_TEXT = `ticket 450`;

export default function HomePage() {
  const [activeMode, setActiveMode] = useState<'canvas' | 'library'>('canvas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  // Split bill input expansion state
  const [showSplitInput, setShowSplitInput] = useState(false);
  const [splitCount, setSplitCount] = useState<number>(3);

  // History Drawer State
  const [showHistory, setShowHistory] = useState(false);
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);

  // Clear Confirmation / Tagging Modal State
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearSheetTag, setClearSheetTag] = useState('');
  const modalInputRef = useRef<HTMLInputElement>(null);

  // Active note being edited in Section C
  // Inline tag editing in History Drawer
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);
  const [tempHistoryTag, setTempHistoryTag] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState('');

  // Canvas State initialized from LocalStorage or default
  const [canvasCode, setCanvasCode] = useState<string>(DEFAULT_CANVAS_TEXT);
  const [isHydrated, setIsHydrated] = useState(false);

  // 1. Hydrate from LocalStorage on mount
  useEffect(() => {
    try {
      const savedActive = localStorage.getItem('solvehub_active_canvas');
      if (savedActive !== null) {
        setCanvasCode(savedActive);
      }

      const savedHistory = localStorage.getItem('solvehub_canvas_history');
      if (savedHistory) {
        setHistoryList(JSON.parse(savedHistory));
      }
    } catch {
      // Ignore storage errors in restricted environments
    }
    setIsHydrated(true);
  }, []);

  // 2. Persist active canvas to LocalStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem('solvehub_active_canvas', canvasCode);
    } catch {
      // Ignore
    }
  }, [canvasCode, isHydrated]);

  // Autofocus modal input when clear modal opens
  useEffect(() => {
    if (showClearModal) {
      setTimeout(() => {
        modalInputRef.current?.focus();
      }, 50);
    }
  }, [showClearModal]);
  // Close history on physical Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showHistory) {
        setShowHistory(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showHistory]);
  const canvasReceipt = useMemo(() => {
    return executeCanvasScript(canvasCode);
  }, [canvasCode]);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return allCalculators.filter((calc) => {
      const matchesCategory =
        selectedCategoryFilter === 'all' || calc.category === selectedCategoryFilter;

      if (!matchesCategory) return false;
      if (!q) return true;

      return (
        calc.name.toLowerCase().includes(q) ||
        calc.description.toLowerCase().includes(q) ||
        calc.category.toLowerCase().includes(q) ||
        calc.naturalLanguageQueries?.some((nlq) => nlq.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, selectedCategoryFilter]);

  // Core Save to History
  const saveToHistory = (customTitle?: string) => {
    if (!canvasCode.trim() || canvasReceipt.variables.length === 0) return;

    // Derive intelligent default title if none provided
    const fallbackTitle =
      canvasReceipt.variables.find((v) => v.note)?.note ||
      canvasReceipt.variables[0]?.name ||
      'Untitled Ledger';

    const finalTitle = customTitle?.trim() || fallbackTitle;

    const newItem: HistoryItem = {
      id: `hist-${Date.now()}`,
      title: finalTitle,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        month: 'short',
        day: 'numeric',
      }),
      content: canvasCode,
      totalDisplay: canvasReceipt.lastResult?.formattedValue || '0',
      itemCount: canvasReceipt.variables.length,
    };

    const updated = [newItem, ...historyList.filter((h) => h.content !== canvasCode)].slice(0, 20);
    setHistoryList(updated);
    try {
      localStorage.setItem('solvehub_canvas_history', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  // Intercept Clear Click
  const handleClearClick = () => {
    if (!canvasCode.trim() || canvasReceipt.variables.length === 0) {
      setCanvasCode('');
      return;
    }
    // Prefill tag suggestion from first available note
    const firstNote = canvasReceipt.variables.find((v) => v.note)?.note || '';
    setClearSheetTag(firstNote);
    setShowClearModal(true);
  };

  // Confirm save and clear
  const handleConfirmSaveAndClear = () => {
    saveToHistory(clearSheetTag);
    setShowClearModal(false);
    setClearSheetTag('');
    setCanvasCode('');
  };

  // Discard without saving and clear
  const handleDiscardAndClear = () => {
    setShowClearModal(false);
    setClearSheetTag('');
    setCanvasCode('');
  };

  const restoreHistory = (item: HistoryItem) => {
    setCanvasCode(item.content);
    setShowHistory(false);
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = historyList.filter((item) => item.id !== id);
    setHistoryList(updated);
    try {
      localStorage.setItem('solvehub_canvas_history', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleSaveHistoryTag = (id: string) => {
    const updated = historyList.map((item) => {
      if (item.id === id) {
        return { ...item, title: tempHistoryTag.trim() };
      }
      return item;
    });
    setHistoryList(updated);
    try {
      localStorage.setItem('solvehub_canvas_history', JSON.stringify(updated));
    } catch {
      // Ignore
    }
    setEditingHistoryId(null);
  };

  const appendSyntax = (syntax: string) => {
    setCanvasCode((prev) => (prev ? `${prev.trimEnd()}\n${syntax}` : syntax));
  };

  const handleApplySplit = () => {
    const count = Math.max(1, splitCount || 2);
    appendSyntax(`split between ${count} people`);
    setShowSplitInput(false);
  };

  const handleSaveNote = (v: EvaluatedVariable) => {
    if (v.lineNumber < 0) return;
    const lines = canvasCode.split('\n');
    const targetLine = lines[v.lineNumber];

    if (targetLine) {
      const baseWithoutNote = targetLine.replace(/\s*\([^)]*\)\s*$/, '').trim();
      const updatedLine = tempNoteText.trim()
        ? `${baseWithoutNote} (${tempNoteText.trim()})`
        : baseWithoutNote;

      lines[v.lineNumber] = updatedLine;
      setCanvasCode(lines.join('\n'));
    }
    setEditingNoteId(null);
  };

  const handleCopyReceipt = () => {
    if (canvasReceipt.variables.length === 0) return;

    const padName = 22;
    const padVal = 14;

    const lines: string[] = [
      '┌────────────────────────────────────────┐',
      '│           SOLVEHUB RECEIPT             │',
      '├────────────────────────────────────────┤',
    ];

    canvasReceipt.variables.forEach((v) => {
      if (v.type === 'summary') {
        lines.push('├────────────────────────────────────────┤');
        lines.push(`│ TOTAL: ${v.formattedValue.padStart(30)} │`);
      } else if (v.type === 'modifier') {
        lines.push(`│ ${v.name.padEnd(padName)} ${v.formattedValue.padStart(padVal)} │`);
      } else {
        const line = `│ ${v.name.padEnd(padName)} ${v.formattedValue.padStart(padVal)} │`;
        lines.push(line);
        if (v.note) {
          lines.push(`│   ↳ ${v.note.padEnd(35)} │`);
        }
      }
    });

    lines.push('└────────────────────────────────────────┘');
    const textOutput = lines.join('\n');

    navigator.clipboard.writeText(textOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReceipt = () => {
    if (canvasReceipt.variables.length === 0) return;

    const dateStr = new Date().toLocaleString();
    const outputLines: string[] = [
      '==================================================',
      '                 SOLVEHUB RECEIPT                 ',
      '          Generated via SolveHub Canvas           ',
      `  Date: ${dateStr}`,
      '==================================================',
      '',
      'ITEMIZED BREAKDOWN:',
      '--------------------------------------------------',
    ];

    canvasReceipt.variables.forEach((v) => {
      if (v.type === 'summary') {
        outputLines.push('--------------------------------------------------');
        outputLines.push(`>>> TOTAL DUE:                  ${v.formattedValue.padStart(15)}`);
      } else if (v.type === 'modifier') {
        outputLines.push(`>>> PER PERSON SHARE:           ${v.formattedValue.padStart(15)}`);
      } else {
        const itemLine = `${v.name.padEnd(32)} ${v.formattedValue.padStart(15)}`;
        outputLines.push(itemLine);
        if (v.note) {
          outputLines.push(`    [Note: ${v.note}]`);
        }
      }
    });

    outputLines.push('==================================================');
    outputLines.push('             Thank you for calculating.           ');
    outputLines.push('==================================================');

    const blob = new Blob([outputLines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solvehub-receipt-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isHeroSplit = Boolean(canvasReceipt.splitResult);

  return (
    <main className="h-screen w-screen bg-[#0d1117] text-slate-100 flex overflow-hidden font-sans relative">
      {/* ──────────────────────────────────────────────────────────
          CLEAR / SAVE MODAL DIALOG
         ────────────────────────────────────────────────────────── */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div
            className="w-full max-w-md bg-[#131822] border border-slate-700/80 rounded-2xl p-6 shadow-2xl relative space-y-5"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleConfirmSaveAndClear();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                handleDiscardAndClear();
              }
            }}
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>SAVE SNAPSHOT</span>
              </div>
              <h3 className="text-base font-semibold text-white font-mono">
                Save sheet before clearing?
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Tag this calculation so you can easily identify and restore it later.
              </p>
            </div>

            <div>
              <input
                ref={modalInputRef}
                type="text"
                value={clearSheetTag}
                onChange={(e) => setClearSheetTag(e.target.value)}
                placeholder="e.g., Pasta and drinks, Roundtrip ticket..."
                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition"
              />
            </div>

            {/* Keyboard-styled Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {/* Exit / Skip Badge Button */}
              <button
                type="button"
                onClick={handleDiscardAndClear}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 transition text-xs font-mono"
              >
                <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-slate-800 border border-slate-600 rounded text-slate-400 group-hover:text-slate-200">
                  esc
                </kbd>
                <span>Exit</span>
              </button>

              {/* Enter / Save Badge Button */}
              <button
                type="button"
                onClick={handleConfirmSaveAndClear}
                className="group flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 hover:text-white transition text-xs font-mono font-medium shadow-sm"
              >
                <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-900/60 border border-emerald-500/50 rounded text-emerald-300 group-hover:text-emerald-100">
                  ↵
                </kbd>
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          SECTION A: Sidebar Navigation
         ────────────────────────────────────────────────────────── */}
      <aside className="w-64 border-r border-slate-800 p-6 flex flex-col justify-between shrink-0 select-none hidden md:flex">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <span className="bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded text-xs font-mono">
              S
            </span>
            <span className="font-bold tracking-wider text-sm text-white font-mono">SolveHub</span>
            <span className="text-[10px] text-slate-500 font-mono">v1.0</span>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 uppercase tracking-wider block mb-2 text-[10px]">
                Modes
              </span>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveMode('canvas')}
                  className={`w-full text-left px-3 py-2 rounded transition flex items-center justify-between ${activeMode === 'canvas'
                    ? 'bg-slate-800 text-emerald-400 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                >
                  <span>Canvas</span>
                  {activeMode === 'canvas' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMode('library')}
                  className={`w-full text-left px-3 py-2 rounded transition flex items-center justify-between ${activeMode === 'library'
                    ? 'bg-slate-800 text-emerald-400 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                >
                  <span>Library</span>
                  <span className="text-[10px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                    {allCalculators.length}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-600 font-mono flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Canonical Ledger Active</span>
        </div>
      </aside>

      {/* ──────────────────────────────────────────────────────────
          CANVAS WORKSPACE & LIVE RECEIPT
         ────────────────────────────────────────────────────────── */}
      {activeMode === 'canvas' && (
        <div className="flex-1 flex overflow-hidden relative">
          {/* Section B: Natural Editor */}
          <section className="flex-1 p-8 overflow-hidden border-r border-slate-800 flex flex-col">
            {/* Clean Header */}
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                <span>CANVAS • NATURAL LANGUAGE SOLVER</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowHistory(!showHistory)}
                  className={`text-[11px] font-mono px-2.5 py-1 rounded border transition flex items-center gap-1.5 ${showHistory
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                >
                  <span>⏱ History</span>
                  {historyList.length > 0 && (
                    <span className="text-[9px] bg-slate-900 text-emerald-400 px-1 rounded border border-emerald-500/30">
                      {historyList.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClearClick}
                  className="text-[11px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-2.5 py-1 rounded border border-slate-700 transition"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Quick Inserts Toolbar */}
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-mono shrink-0">
              <span className="text-slate-500 text-[10px] uppercase tracking-wider">Quick Inserts:</span>

              <button
                type="button"
                onClick={() => appendSyntax('total')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition"
              >
                + total
              </button>

              <button
                type="button"
                onClick={() => appendSyntax('discount 10%')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition"
              >
                + discount
              </button>

              <button
                type="button"
                onClick={() => appendSyntax('tax 18%')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 transition"
              >
                + tax
              </button>

              {/* Split Bill Trigger + Inline Stepper */}
              {!showSplitInput ? (
                <button
                  type="button"
                  onClick={() => setShowSplitInput(true)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 transition"
                >
                  + split bill
                </button>
              ) : (
                <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-0.5 rounded border border-purple-500/40">
                  <span className="text-[11px] text-purple-300">People:</span>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={splitCount}
                    onChange={(e) => setSplitCount(parseInt(e.target.value, 10) || 1)}
                    className="w-10 bg-slate-950 text-center text-xs text-white border border-slate-700 rounded px-1 py-0.5 focus:outline-none focus:border-purple-400 font-mono"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleApplySplit}
                    className="bg-purple-600 hover:bg-purple-500 text-white text-[10px] px-2 py-0.5 rounded font-semibold transition"
                  >
                    Insert
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSplitInput(false)}
                    className="text-slate-400 hover:text-white text-[10px] px-1"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Technical Dot-Grid Canvas Notepad */}
            <div className="relative flex-1 w-full rounded-2xl border border-slate-800/80 overflow-hidden bg-[#0e131b] shadow-2xl flex flex-col">
              <div
                className="absolute inset-0 pointer-events-none opacity-25"
                style={{
                  backgroundImage: 'radial-gradient(#38bdf8 0.85px, transparent 0.85px)',
                  backgroundSize: '24px 28px',
                  backgroundPosition: '24px 28px',
                }}
              />

              <textarea
                value={canvasCode}
                onChange={(e) => setCanvasCode(e.target.value)}
                placeholder="Start Calculating"
                className="relative z-10 w-full flex-1 bg-transparent border-none px-6 py-6 text-[14px] font-mono text-emerald-400 focus:outline-none placeholder-slate-600 resize-none selection:bg-emerald-500/20"
                style={{
                  lineHeight: '27px',
                }}
                spellCheck={false}
              />
            </div>

            <div className="pt-3 text-xs font-mono text-slate-500 flex justify-between items-center shrink-0">
              <span>Section B • Zero-Friction Input</span>
              <span>Lines: {canvasCode.split('\n').length}</span>
            </div>
          </section>

          {/* Transparent Backdrop to Dismiss on Canvas Click */}
          {showHistory && (
            <div
              className="absolute inset-0 z-20"
              onClick={() => setShowHistory(false)}
            />
          )}

          {/* Slide-over History Drawer */}
          {showHistory && (
            <div className="absolute inset-y-0 right-88 w-80 bg-[#121720]/95 backdrop-blur-md border-l border-slate-800 shadow-2xl z-30 p-6 flex flex-col">
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider">
                      Calculation History
                    </span>
                  </div>
                  {/* Keyboard-styled ESC Close Button */}
                  <button
                    type="button"
                    onClick={() => setShowHistory(false)}
                    className="group flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 transition text-[11px] font-mono"
                  >
                    <kbd className="px-1.5 py-0.5 text-[9px] font-semibold bg-slate-800 border border-slate-600 rounded text-slate-400 group-hover:text-slate-200">
                      esc
                    </kbd>
                    <span className="text-slate-400 group-hover:text-slate-200">Exit</span>
                  </button>
                </div>

                <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                  {historyList.length === 0 ? (
                    <div className="text-center text-slate-500 text-xs py-12 font-mono">
                      No saved sheets yet.<br />Calculations save on Clear.
                    </div>
                  ) : (
                    historyList.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => restoreHistory(item)}
                        className="p-3 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 rounded-xl cursor-pointer transition group"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-mono text-slate-500">{item.timestamp}</span>
                          <button
                            type="button"
                            onClick={(e) => deleteHistoryItem(item.id, e)}
                            className="text-[10px] text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition"
                          >
                            Delete
                          </button>
                        </div>
                        <div className="text-xs font-mono text-emerald-400 font-bold truncate">
                          {item.totalDisplay}
                        </div>
                        <div className="mt-1.5" onClick={(e) => e.stopPropagation()}>
                          {editingHistoryId === item.id ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={tempHistoryTag}
                                onChange={(e) => setTempHistoryTag(e.target.value)}
                                placeholder="add tag..."
                                className="w-full bg-slate-950 border border-emerald-500/50 rounded px-2 py-0.5 text-[11px] font-mono text-white focus:outline-none"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveHistoryTag(item.id);
                                  if (e.key === 'Escape') setEditingHistoryId(null);
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveHistoryTag(item.id)}
                                className="text-[10px] bg-emerald-700 hover:bg-emerald-600 text-white px-2 py-0.5 rounded font-mono font-semibold"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingHistoryId(item.id);
                                setTempHistoryTag(item.title || '');
                              }}
                              className="group/tag flex items-center gap-1.5 text-[11px] font-mono text-left transition"
                            >
                              <svg
                                className={`w-3 h-3 shrink-0 ${item.title ? 'text-emerald-400' : 'text-slate-500 group-hover/tag:text-slate-400'
                                  }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                                />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                              </svg>
                              <span
                                className={`truncate ${item.title
                                  ? 'text-white font-medium group-hover/tag:text-emerald-300'
                                  : 'text-slate-500 group-hover/tag:text-slate-300'
                                  }`}
                              >
                                {item.title || 'add tag'}
                              </span>
                              <span className="opacity-0 group-hover/tag:opacity-100 text-[9px] text-slate-400">✎</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Section C: Live Structured Receipt */}
          <aside className="w-88 bg-[#161b22] p-6 flex flex-col justify-between shrink-0 overflow-y-auto border-l border-slate-800">
            <div>
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-800">
                <span className="text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider">
                  Live Receipt
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 uppercase">
                  {canvasReceipt.variables.length} Items
                </span>
              </div>

              {/* Top Hero Output Display: 2 Clean Lines */}
              {canvasReceipt.lastResult && !canvasReceipt.lastResult.isError && (
                <div
                  className={`mb-6 p-4 rounded-xl border transition-colors flex flex-col justify-center gap-1.5 ${isHeroSplit
                    ? 'bg-purple-950/40 border-purple-500/40'
                    : 'bg-emerald-950/40 border-emerald-500/40'
                    }`}
                >
                  <span
                    className={`text-[10px] font-mono uppercase tracking-wider block ${isHeroSplit ? 'text-purple-300' : 'text-emerald-400'
                      }`}
                  >
                    {canvasReceipt.lastResult.name}
                  </span>
                  <div
                    className={`text-2xl font-bold font-mono tracking-tight break-all ${isHeroSplit ? 'text-purple-200' : 'text-white'
                      }`}
                  >
                    {canvasReceipt.lastResult.formattedValue}
                  </div>
                </div>
              )}

              {/* Canonical Statement Breakdown */}
              <div className="space-y-2.5 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 uppercase tracking-wider text-[10px] block">
                    Statement Breakdown
                  </span>
                  <span className="text-[10px] text-slate-600 font-mono">Auto-Reordered</span>
                </div>

                {canvasReceipt.variables.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-slate-800 rounded-lg text-slate-600 text-xs">
                    Type items in Section B (e.g. ticket 450).
                  </div>
                ) : (
                  canvasReceipt.variables.map((v) => {
                    const isDeduction = v.type === 'deduction';
                    const isTax = v.type === 'addition';
                    const isSummary = v.type === 'summary';
                    const isModifier = v.type === 'modifier';
                    const isBase = v.type === 'base';

                    return (
                      <div
                        key={v.id}
                        className={`p-2.5 rounded border transition flex flex-col gap-1 ${v.isError
                          ? 'bg-rose-950/20 border-rose-800/60 text-rose-300'
                          : isSummary
                            ? 'bg-emerald-950/40 border-emerald-500/50 font-semibold'
                            : isModifier
                              ? 'bg-purple-950/30 border-purple-500/40 text-purple-200'
                              : isDeduction
                                ? 'bg-amber-950/20 border-amber-500/30'
                                : isTax
                                  ? 'bg-sky-950/20 border-sky-500/30'
                                  : 'bg-slate-900/60 border-slate-800/80 text-slate-300'
                          }`}
                      >
                        <div className="flex justify-between items-center">
                          <span
                            className={
                              isDeduction
                                ? 'text-amber-400'
                                : isTax
                                  ? 'text-sky-400'
                                  : isSummary
                                    ? 'text-emerald-400 font-bold'
                                    : isModifier
                                      ? 'text-purple-300'
                                      : 'text-slate-300'
                            }
                          >
                            {v.name}
                          </span>
                          <span
                            className={`font-bold ${isDeduction
                              ? 'text-amber-400'
                              : isTax
                                ? 'text-sky-400'
                                : isSummary
                                  ? 'text-emerald-400 text-sm'
                                  : isModifier
                                    ? 'text-purple-300 font-semibold'
                                    : 'text-white'
                              }`}
                          >
                            {v.formattedValue}
                          </span>
                        </div>

                        {/* Editable Note: Exclusively on Base Items */}
                        {isBase && (
                          <div className="mt-1">
                            {editingNoteId === v.id ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={tempNoteText}
                                  onChange={(e) => setTempNoteText(e.target.value)}
                                  placeholder="Add or edit note..."
                                  className="w-full bg-slate-950 border border-emerald-500/50 rounded px-1.5 py-0.5 text-[11px] text-white focus:outline-none font-mono"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveNote(v);
                                    if (e.key === 'Escape') setEditingNoteId(null);
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveNote(v)}
                                  className="text-[10px] bg-emerald-700 hover:bg-emerald-600 text-white px-2 py-0.5 rounded font-semibold"
                                >
                                  Save
                                </button>
                              </div>
                            ) : v.note ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingNoteId(v.id);
                                  setTempNoteText(v.note || '');
                                }}
                                title="Click to edit note"
                                className="group/note text-[10px] text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/40 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1.5 transition"
                              >
                                <svg
                                  className="w-2.5 h-2.5 text-emerald-400 shrink-0"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                                  />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                                </svg>
                                <span>{v.note}</span>
                                <span className="opacity-0 group-hover/note:opacity-100 text-[9px] text-slate-400 ml-0.5">✎</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingNoteId(v.id);
                                  setTempNoteText('');
                                }}
                                className="text-[10px] text-slate-500 hover:text-slate-300 font-mono transition"
                              >
                                + add note
                              </button>
                            )}
                          </div>
                        )}

                        <div
                          className={`text-[10px] truncate ${isModifier ? 'text-purple-300/60' : 'text-slate-500'
                            }`}
                        >
                          {v.expression}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="pt-6 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center gap-2.5">
                {/* Copy Receipt Button with Line-Art SVG */}
                <button
                  type="button"
                  onClick={handleCopyReceipt}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white font-mono text-xs border border-slate-700 hover:border-slate-600 transition flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
                >
                  <svg
                    className="w-3.5 h-3.5 text-slate-400 group-hover:text-white shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.75"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{copied ? 'Copied!' : 'Copy Receipt'}</span>
                </button>

                {/* Download Button with Line-Art SVG */}
                <button
                  type="button"
                  onClick={handleDownloadReceipt}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white font-mono text-xs border border-slate-700 hover:border-slate-600 transition flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
                >
                  <svg
                    className="w-3.5 h-3.5 text-slate-400 group-hover:text-white shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.75"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  <span>Download</span>
                </button>
              </div>

              <div className="text-[10px] font-mono text-slate-600 text-center">
                Section C • Instant Calculation Ledger
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          LIBRARY VIEW
         ────────────────────────────────────────────────────────── */}
      {activeMode === 'library' && (
        <section className="flex-1 p-8 overflow-y-auto">
          <header className="mb-6">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              <span>LIBRARY • {allCalculators.length} CALCULATORS</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide uppercase font-mono">
              Calculator Library
            </h1>
          </header>

          <div className="mb-8 space-y-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search calculators across all categories..."
              className="w-full max-w-3xl bg-[#161b22] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {masterCategories.map((category) => {
              const count = allCalculators.filter((c) => c.category === category.slug).length;

              return (
                <Link
                  key={category.id}
                  href={`/library/${category.slug}`}
                  className="group p-6 bg-[#161b22] border border-slate-800 rounded-xl hover:border-emerald-500/50 hover:bg-[#1c2128] transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-emerald-400 group-hover:text-white group-hover:border-emerald-500/50 group-hover:bg-emerald-950/30 transition">
                        <svg
                          className="w-5 h-5 stroke-current"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.75"
                          dangerouslySetInnerHTML={{ __html: category.iconSvg }}
                        />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {category.groupCode}
                      </span>
                    </div>

                    <h2 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition">
                      {category.name}
                    </h2>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {category.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">
                      {count} {count === 1 ? 'Calculator' : 'Calculators'}
                    </span>
                    <span className="text-emerald-400 group-hover:translate-x-1 transition-transform">
                      Explore Category →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}