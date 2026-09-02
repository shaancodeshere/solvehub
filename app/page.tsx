'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { masterCategories } from '@/lib/categories';
import { allCalculators } from '@/lib/calculators';
import { executeCanvasScript, EvaluatedVariable } from '@/lib/canvasEngine';

export default function HomePage() {
  const [activeMode, setActiveMode] = useState<'canvas' | 'library'>('canvas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  // Split bill input expansion state
  const [showSplitInput, setShowSplitInput] = useState(false);
  const [splitCount, setSplitCount] = useState<number>(3);

  // Active note being edited in Section C
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState('');

  // Default clean canvas text with no pre-filled notes
  const [canvasCode, setCanvasCode] = useState<string>(
    `ticket 450\nhotel 320\nfood 290\ndiscount 10%\ntax 18%\ntotal\nsplit between 3 people`
  );

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
    <main className="h-screen w-screen bg-[#0d1117] text-slate-100 flex overflow-hidden font-sans">
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
        <div className="flex-1 flex overflow-hidden">
          {/* Section B: Natural Editor */}
          <section className="flex-1 p-8 overflow-hidden border-r border-slate-800 flex flex-col">
            {/* Clean Header */}
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                <span>CANVAS • NATURAL LANGUAGE SOLVER</span>
              </div>
              <button
                type="button"
                onClick={() => setCanvasCode('')}
                className="text-[11px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-2.5 py-1 rounded border border-slate-700 transition"
              >
                Clear
              </button>
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
                  backgroundPosition: '24px 25px',
                }}
              />

              <textarea
                value={canvasCode}
                onChange={(e) => setCanvasCode(e.target.value)}
                placeholder="Type anything naturally, e.g.:&#10;ticket 450&#10;hotel 320&#10;food 290&#10;discount 10%&#10;tax 18%&#10;total&#10;split between 3 people"
                className="relative z-10 w-full flex-1 bg-transparent border-none px-6 py-6 text-[14px] font-mono text-emerald-400 focus:outline-none placeholder-slate-600 resize-none selection:bg-emerald-500/20"
                style={{
                  lineHeight: '28px',
                }}
                spellCheck={false}
              />
            </div>

            <div className="pt-3 text-xs font-mono text-slate-500 flex justify-between items-center shrink-0">
              <span>Section B • Zero-Friction Input</span>
              <span>Lines: {canvasCode.split('\n').length}</span>
            </div>
          </section>

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
                                className="group/note text-[10px] text-emerald-400/90 bg-emerald-950/40 hover:bg-emerald-900/40 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1 transition"
                              >
                                <span>📌</span>
                                <span>{v.note}</span>
                                <span className="opacity-0 group-hover/note:opacity-100 text-[9px] text-slate-400 ml-1">✎</span>
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyReceipt}
                  className="flex-1 py-2 px-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-mono text-xs border border-slate-700 transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                >
                  <span>📋</span>
                  <span>{copied ? 'Copied!' : 'Copy Receipt'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadReceipt}
                  className="flex-1 py-2 px-3 rounded-full bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 hover:text-emerald-300 font-mono text-xs border border-emerald-500/40 transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                >
                  <span>💾</span>
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
          LIBRARY VIEW (Restored Category Counts + Vector Icons)
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