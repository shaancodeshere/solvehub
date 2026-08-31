'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { masterCategories } from '@/lib/categories';
import { allCalculators } from '@/lib/calculators';

export default function HomePage() {
  // Toggle between 'library' and 'canvas'
  const [activeMode, setActiveMode] = useState<'library' | 'canvas'>('library');

  return (
    <main className="h-screen w-screen bg-[#0d1117] text-slate-100 flex overflow-hidden">
      {/* ──────────────────────────────────────────────────────────
          SECTION A: Persistent Left Sidebar Navigation
         ────────────────────────────────────────────────────────── */}
      <aside className="w-64 border-r border-slate-800 p-6 flex flex-col justify-between shrink-0 select-none">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <span className="bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded text-xs font-mono">
              S
            </span>
            <span className="font-bold tracking-wider text-sm text-white">SolveHub</span>
            <span className="text-[10px] text-slate-500 font-mono">v1.0</span>
          </div>

          {/* Interactive Mode Switches */}
          <div className="space-y-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 uppercase tracking-wider block mb-2">Modes</span>
              <div className="space-y-1">
                {/* Canvas Button */}
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

                {/* Library Button */}
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
                    12
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="text-[11px] text-slate-600 font-mono flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Client Engine Active</span>
        </div>
      </aside>

      {/* ──────────────────────────────────────────────────────────
          VIEW 1: LIBRARY MODE (12 Category Tiles)
         ────────────────────────────────────────────────────────── */}
      {activeMode === 'library' && (
        <section className="flex-1 p-8 overflow-y-auto">
          <header className="mb-8">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              <span>LIBRARY • 12 CATEGORIES</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide uppercase font-mono">
              Calculator Library
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Select a domain category to browse verified models and parameter tools.
            </p>
          </header>

          {/* 12 Category Tiles Grid */}
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
                      <span className="text-2xl p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
                        {category.icon}
                      </span>
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

      {/* ──────────────────────────────────────────────────────────
          VIEW 2: CANVAS MODE (Section B Workspace + Section C Receipt)
         ────────────────────────────────────────────────────────── */}
      {activeMode === 'canvas' && (
        <div className="flex-1 flex overflow-hidden">
          {/* Section B: The Canvas Execution Workspace */}
          <section className="flex-1 p-8 overflow-y-auto border-r border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                <span>MODE: CANVAS WORKSPACE</span>
              </div>
              <h1 className="text-xl font-bold text-white tracking-wide uppercase font-mono mb-4">
                Interactive Solver Canvas
              </h1>

              {/* Natural language / calculation prompt editor */}
              <div className="p-4 bg-[#161b22] border border-slate-800 rounded-xl space-y-4">
                <p className="text-xs font-mono text-slate-400">
                  Write calculations, expressions, or natural language prompts. Variables are auto-evaluated into Section C.
                </p>
                <textarea
                  defaultValue={`revenue = 120000\noperating_expenses = 45000\nnet_profit = revenue - operating_expenses\nmargin = (net_profit / revenue) * 100`}
                  className="w-full h-44 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm font-mono text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="pt-4 text-xs font-mono text-slate-500">
              UTF-8 • Client Execution Engine
            </div>
          </section>

          {/* Section C: Live Variable Receipt Panel */}
          <aside className="w-80 bg-[#161b22] p-6 flex flex-col justify-between shrink-0">
            <div>
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-800">
                <span className="text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider">
                  Live Receipt
                </span>
                <span className="text-[10px] font-mono text-slate-500 uppercase">
                  Auto-eval
                </span>
              </div>

              {/* Registered Variables */}
              <div className="space-y-3 font-mono text-xs">
                <span className="text-slate-500 uppercase tracking-wider text-[10px] block">
                  Registered Variables
                </span>

                <div className="flex justify-between items-center p-2 bg-slate-900/60 rounded border border-slate-800/80">
                  <span className="text-slate-400">revenue</span>
                  <span className="text-white font-semibold">$120,000</span>
                </div>

                <div className="flex justify-between items-center p-2 bg-slate-900/60 rounded border border-slate-800/80">
                  <span className="text-slate-400">operating_expenses</span>
                  <span className="text-white font-semibold">$45,000</span>
                </div>

                {/* Primary Computed Output Badge */}
                <div className="mt-6 p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-lg">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
                    net_profit
                  </span>
                  <div className="text-2xl font-bold text-white font-mono mt-1">
                    $75,000
                  </div>
                  <div className="text-xs font-mono text-emerald-300/80 mt-1">
                    Margin: 62.5%
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[10px] font-mono text-slate-600 text-center">
              Section C • Live Receipt
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}