'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { allCalculators } from '@/lib/calculators';
import ThemeToggle from '@/components/ThemeToggle';
import { useSidebar } from './AppShell';

export function CanvasModeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M 8 3.5 
               H 16 
               A 4.5 4.5 0 0 1 20.5 8 
               C 20.5 10 18.5 11.2 17.5 12 
               C 18.5 12.8 20.5 14 20.5 16 
               A 4.5 4.5 0 0 1 16 20.5 
               H 8 
               A 4.5 4.5 0 0 1 3.5 16 
               C 3.5 14 5.5 12.8 6.5 12 
               C 5.5 11.2 3.5 10 3.5 8 
               A 4.5 4.5 0 0 1 8 3.5 
               Z" />
    </svg>
  );
}

export function LibraryModeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M 12 6.3
               A 4.9 4.9 0 1 1 17.7 12
               A 4.9 4.9 0 1 1 12 17.7
               A 4.9 4.9 0 1 1 6.3 12
               A 4.9 4.9 0 1 1 12 6.3
               Z" />
    </svg>
  );
}

export function ShortcutsPaperclipIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ overflow: "visible" }}
    >
      <g transform="rotate(-23 12 12)">
        {/* Slender, realistic paperclip path */}
        <path d="M 8.5 13.5
                 L 8.5 7
                 A 3.5 3.5 0 0 1 15.5 7
                 L 15.5 17
                 A 4.5 4.5 0 0 1 6.5 17
                 L 6.5 5
                 A 5.5 5.5 0 0 1 17.5 5
                 L 17.5 14" />
      </g>
    </svg>
  );
}

export const ShortcutsBulbIcon = ShortcutsPaperclipIcon;

export default function AppSidebar() {
  const pathname = usePathname();
  const {
    isSidebarOpen,
    setIsSidebarOpen,
    isMobileDrawerOpen,
    setIsMobileDrawerOpen,
    setIsCommandPaletteOpen,
    setIsShortcutsModalOpen,
  } = useSidebar();

  const isCanvas = pathname === '/';
  const isLibrary =
    pathname.startsWith('/library') ||
    (pathname !== '/' && pathname.split('/').filter(Boolean).length === 2);

  return (
    <>
      {/* ──────────────────────────────────────────────────────────
          1. DESKTOP & TABLET SIDEBAR (hidden on mobile <768px)
          - Tablet (768px - 1024px): Compact icon-rail (w-16)
          - Desktop (>1024px): Full calibrated 240px sidebar (w-60)
         ────────────────────────────────────────────────────────── */}
      <aside
        className={`border-r border-[var(--border)] bg-[var(--surface)] flex flex-col justify-between shrink-0 select-none hidden md:flex transition-all duration-200 ease-in-out ${
          isSidebarOpen
            ? 'md:w-16 md:min-w-[64px] lg:w-60 lg:min-w-[240px] opacity-100'
            : 'w-0 min-w-0 p-0 overflow-hidden border-none opacity-0'
        }`}
      >
        <div className="w-full min-w-0 p-2.5 pb-2 lg:p-5 lg:pb-3 flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className="flex items-center justify-between gap-2 mb-6 md:mb-5 lg:mb-6">
            <Link
              href="/"
              className="flex items-center gap-2 group mx-auto lg:mx-0"
              title="SolveHub Home"
            >
              <span className="bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded text-sm font-mono group-hover:bg-emerald-400 transition shrink-0">
                S
              </span>
              <span className="font-bold tracking-wider text-xl text-slate-900 dark:text-white font-mono hidden lg:inline">
                SolveHub
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent hover:bg-[#e2e8f0] dark:hover:bg-slate-800 transition hidden lg:flex items-center justify-center shrink-0"
              title="Collapse Sidebar (⌘B)"
              aria-label="Collapse Sidebar"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M9 3v18" />
              </svg>
            </button>
          </div>

          {/* Navigation Modes */}
          <div className="space-y-4 md:space-y-3 lg:space-y-4">
            <div>
              <span className="text-slate-500 uppercase tracking-wider mb-2.5 text-xs font-semibold font-mono hidden lg:block">
                Modes
              </span>
              <div className="space-y-1">
                {/* Canvas Link */}
                <Link
                  href="/"
                  title="Canvas Calculator"
                  className={`w-full px-2.5 py-2 rounded-lg text-sm font-medium font-mono transition flex items-center justify-center lg:justify-between ${
                    isCanvas
                      ? 'bg-emerald-500/10 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold shadow-sm border border-emerald-500/20 dark:border-transparent'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-[var(--surface-subtle)] dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CanvasModeIcon className="w-4 h-4 shrink-0" />
                    <span className="hidden lg:inline truncate">Canvas</span>
                  </div>
                  {isCanvas && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 hidden lg:inline-block shrink-0"></span>
                  )}
                </Link>

                {/* Library Link */}
                <Link
                  href="/library"
                  title={`Library (${allCalculators.length} Calculators)`}
                  className={`w-full px-2.5 py-2 rounded-lg text-sm font-medium font-mono transition flex items-center justify-center lg:justify-between ${
                    isLibrary
                      ? 'bg-emerald-500/10 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold shadow-sm border border-emerald-500/20 dark:border-transparent'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-[var(--surface-subtle)] dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <LibraryModeIcon className="w-4 h-4 shrink-0" />
                    <span className="hidden lg:inline truncate">Library</span>
                  </div>
                  <span className="text-[11px] bg-[var(--surface-subtle)] dark:bg-slate-900 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded-md border border-[var(--border)] dark:border-slate-700 font-mono hidden lg:inline-block shrink-0">
                    {allCalculators.length}
                  </span>
                </Link>
              </div>
            </div>

            {/* Global Command Palette Trigger */}
            <div>
              <span className="text-slate-500 uppercase tracking-wider mb-2 text-xs font-semibold font-mono hidden lg:block">
                Command Palette
              </span>
              <button
                type="button"
                onClick={() => setIsCommandPaletteOpen(true)}
                className="w-full px-2.5 py-2 rounded-lg text-xs font-mono bg-[var(--surface-subtle)] dark:bg-slate-900/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-[var(--border)] dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 transition flex items-center justify-center lg:justify-between group shadow-sm"
                title="Search calculators (/)"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="hidden lg:inline">Search</span>
                </span>
                <kbd className="hidden lg:inline-block text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700">
                  /
                </kbd>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="w-full shrink-0 pb-3 px-2 lg:px-4 flex flex-col">
          {/* Inset Divider Line */}
          <div className="w-full h-px bg-slate-300 dark:bg-slate-800 mb-3" />

          {/* Desktop (>1024px): Combined Single Horizontal Row */}
          <div className="hidden lg:flex items-center gap-2 h-9 mb-2.5 w-full">
            <button
              type="button"
              onClick={() => setIsShortcutsModalOpen(true)}
              className="flex-1 h-9 px-3.5 flex items-center justify-center gap-2 rounded-xl bg-[#E4EAF1] hover:bg-[#D7E0EB] border border-[#CBD5E1] text-[#334155] dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:border-slate-700/80 dark:text-slate-300 font-mono text-[11px] font-medium tracking-tight whitespace-nowrap shadow-sm active:scale-[0.98] transition-all cursor-pointer"
              title="Keyboard Shortcuts"
            >
              <ShortcutsPaperclipIcon className="w-4 h-4 text-[#334155] dark:text-slate-300 shrink-0" />
              <span>Shortcuts</span>
            </button>
            <div className="w-px h-5 bg-slate-300 dark:bg-slate-800 select-none shrink-0" />
            <ThemeToggle className="shrink-0 h-9 w-9 rounded-xl flex items-center justify-center bg-[#E4EAF1] hover:bg-[#D7E0EB] border border-[#CBD5E1] text-[#334155] dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:border-slate-700/80 dark:text-slate-300 shadow-sm transition-all active:scale-95 cursor-pointer" />
          </div>

          {/* Collapsed Tablet Rail (768px - 1024px): Stacked Icon Column */}
          <div className="flex lg:hidden flex-col items-center gap-2 mb-2.5 w-full">
            <button
              type="button"
              onClick={() => setIsShortcutsModalOpen(true)}
              className="h-9 w-9 rounded-xl flex items-center justify-center bg-[#E4EAF1] hover:bg-[#D7E0EB] border border-[#CBD5E1] text-[#334155] dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:border-slate-700/80 dark:text-slate-300 shadow-sm transition-all active:scale-95 cursor-pointer"
              title="Keyboard Shortcuts"
              aria-label="Keyboard Shortcuts"
            >
              <ShortcutsPaperclipIcon className="w-4 h-4 text-[#334155] dark:text-slate-300 shrink-0" />
            </button>
            <ThemeToggle className="h-9 w-9 rounded-xl flex items-center justify-center bg-[#E4EAF1] hover:bg-[#D7E0EB] border border-[#CBD5E1] text-[#334155] dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:border-slate-700/80 dark:text-slate-300 shadow-sm transition-all active:scale-95 cursor-pointer" />
          </div>

          <div className="h-4 flex items-center justify-center lg:justify-start gap-2 text-[11px] font-mono text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="hidden lg:inline truncate leading-none">Canonical Ledger Active</span>
          </div>
        </div>
      </aside>

      {/* ──────────────────────────────────────────────────────────
          2. MOBILE OFF-CANVAS DRAWER (<768px)
          - Slides out when isMobileDrawerOpen === true
          - Backdrop blur, auto-closes on selection or touch outside
         ────────────────────────────────────────────────────────── */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="relative w-72 max-w-[85vw] h-full bg-[var(--surface)] border-r border-[var(--border)] p-5 pb-6 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div>
              {/* Brand Header & Close */}
              <div className="flex items-center justify-between gap-2 mb-6 pb-3 border-b border-[var(--border)]">
                <Link
                  href="/"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="flex items-center gap-2 group"
                >
                  <span className="bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded text-sm font-mono group-hover:bg-emerald-400 transition">
                    S
                  </span>
                  <span className="font-bold tracking-wider text-xl text-slate-900 dark:text-white font-mono">
                    SolveHub
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-[var(--surface-subtle)] transition"
                  aria-label="Close navigation menu"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Modes */}
              <div className="space-y-4">
                <div>
                  <span className="text-slate-500 uppercase tracking-wider block mb-2.5 text-xs font-semibold font-mono">
                    Modes
                  </span>
                  <div className="space-y-1.5">
                    <Link
                      href="/"
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium font-mono transition flex items-center justify-between ${
                        isCanvas
                          ? 'bg-emerald-500/10 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold shadow-sm border border-emerald-500/20'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-[var(--surface-subtle)]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <CanvasModeIcon className="w-4 h-4 shrink-0" />
                        <span>Canvas</span>
                      </div>
                      {isCanvas && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      )}
                    </Link>

                    <Link
                      href="/library"
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium font-mono transition flex items-center justify-between ${
                        isLibrary
                          ? 'bg-emerald-500/10 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold shadow-sm border border-emerald-500/20'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-[var(--surface-subtle)]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <LibraryModeIcon className="w-4 h-4 shrink-0" />
                        <span>Library</span>
                      </div>
                      <span className="text-xs bg-[var(--surface-subtle)] text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md border border-[var(--border)] font-mono">
                        {allCalculators.length}
                      </span>
                    </Link>
                  </div>
                </div>

                {/* Command Palette Trigger */}
                <div>
                  <span className="text-slate-500 uppercase tracking-wider block mb-2 text-xs font-semibold font-mono">
                    Command Palette
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      setIsCommandPaletteOpen(true);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-mono bg-[var(--surface-subtle)] text-slate-700 dark:text-slate-300 border border-[var(--border)] transition flex items-center justify-between shadow-sm active:scale-95"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span>Search calculators</span>
                    </span>
                    <kbd className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700">
                      /
                    </kbd>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 pb-3 px-4 flex flex-col">
              {/* Inset Divider Line */}
              <div className="w-full h-px bg-slate-300 dark:bg-slate-800 mb-3" />

              <div className="flex items-center gap-2 h-9 mb-2.5 w-full">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    setIsShortcutsModalOpen(true);
                  }}
                  className="flex-1 h-9 px-3.5 flex items-center justify-center gap-2 rounded-xl bg-[#E4EAF1] hover:bg-[#D7E0EB] border border-[#CBD5E1] text-[#334155] dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:border-slate-700/80 dark:text-slate-300 font-mono text-[11px] font-medium tracking-tight whitespace-nowrap shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                  title="Keyboard Shortcuts"
                >
                  <ShortcutsPaperclipIcon className="w-4 h-4 text-[#334155] dark:text-slate-300 shrink-0" />
                  <span>Shortcuts</span>
                </button>
                <div className="w-px h-5 bg-slate-300 dark:bg-slate-800 select-none shrink-0" />
                <ThemeToggle className="shrink-0 h-9 w-9 rounded-xl flex items-center justify-center bg-[#E4EAF1] hover:bg-[#D7E0EB] border border-[#CBD5E1] text-[#334155] dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:border-slate-700/80 dark:text-slate-300 shadow-sm transition-all active:scale-95 cursor-pointer" />
              </div>

              <div className="h-4 flex items-center gap-2 text-[11px] font-mono text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="leading-none">Canonical Ledger Active</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
