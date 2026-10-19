'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { allCalculators } from '@/lib/calculators';
import ThemeToggle from '@/components/ThemeToggle';
import { useSidebar } from './AppShell';

export default function AppSidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, setIsSidebarOpen, setIsCommandPaletteOpen, setIsShortcutsModalOpen } = useSidebar();

  const isCanvas = pathname === '/';
  const isLibrary =
    pathname.startsWith('/library') ||
    (pathname !== '/' && pathname.split('/').filter(Boolean).length === 2);

  return (
    <aside
      className={`border-r border-[var(--border)] bg-[var(--surface)] flex flex-col justify-between shrink-0 select-none hidden md:flex transition-all duration-200 ease-in-out ${
        isSidebarOpen
          ? 'w-60 min-w-[240px] p-5 pb-6 opacity-100'
          : 'w-0 min-w-0 p-0 overflow-hidden border-none opacity-0'
      }`}
    >
      <div className="w-[200px] min-w-[200px]">
        {/* Brand Header */}
        <div className="flex items-center justify-between gap-2 mb-6">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded text-sm font-mono group-hover:bg-emerald-400 transition">
              S
            </span>
            <span className="font-bold tracking-wider text-xl text-slate-900 dark:text-white font-mono">SolveHub</span>
            <span className="text-xs text-slate-500 font-mono">v1.0</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent hover:bg-[#e2e8f0] dark:hover:bg-slate-800 transition flex items-center justify-center"
            title="Toggle Sidebar (⌘B)"
            aria-label="Toggle Sidebar"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M9 3v18" />
            </svg>
          </button>
        </div>

        {/* Navigation Modes */}
        <div className="space-y-4">
          <div>
            <span className="text-slate-500 uppercase tracking-wider block mb-2.5 text-xs font-semibold font-mono">
              Modes
            </span>
            <div className="space-y-1">
              <Link
                href="/"
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium font-mono transition flex items-center justify-between ${
                  isCanvas
                    ? 'bg-emerald-500/10 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold shadow-sm border border-emerald-500/20 dark:border-transparent'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-[var(--surface-subtle)] dark:hover:bg-slate-800/50'
                }`}
              >
                <span>Canvas</span>
                {isCanvas && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>
                )}
              </Link>

              <Link
                href="/library"
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium font-mono transition flex items-center justify-between ${
                  isLibrary
                    ? 'bg-emerald-500/10 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold shadow-sm border border-emerald-500/20 dark:border-transparent'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-[var(--surface-subtle)] dark:hover:bg-slate-800/50'
                }`}
              >
                <span>Library</span>
                <span className="text-xs bg-[var(--surface-subtle)] dark:bg-slate-900 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md border border-[var(--border)] dark:border-slate-700 font-mono">
                  {allCalculators.length}
                </span>
              </Link>
            </div>
          </div>

          {/* Global Command Palette Trigger */}
          <div>
            <span className="text-slate-500 uppercase tracking-wider block mb-2 text-xs font-semibold font-mono">
              Command Palette
            </span>
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-mono bg-[var(--surface-subtle)] dark:bg-slate-900/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-[var(--border)] dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 transition flex items-center justify-between group shadow-sm"
              title="Search calculators (/)"
            >
              <span className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Meta */}
      <div className="w-[200px] min-w-[200px] pt-4 border-t border-[var(--border)] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
            Theme
          </span>
          <ThemeToggle />
        </div>

        {/* Shortcuts Trigger Button */}
        <button
          type="button"
          onClick={() => setIsShortcutsModalOpen(true)}
          className="w-full text-left px-3 py-2 rounded-lg text-xs font-mono bg-[var(--surface-subtle)] dark:bg-slate-900/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-[var(--border)] dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 transition flex items-center gap-2 group shadow-sm"
          title="View Keyboard Shortcuts"
        >
          <svg
            className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18v1m0 0a2 2 0 01-2 2h4a2 2 0 01-2-2m-4-6a6 6 0 118 0c0 1.5-1 2.5-1.5 3.5H9.5C9 14.5 8 13.5 8 12z"
            />
          </svg>
          <span>Shortcuts</span>
        </button>

        <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Canonical Ledger Active</span>
        </div>
      </div>
    </aside>
  );
}
