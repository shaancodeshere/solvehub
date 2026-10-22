'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { allCalculators } from '@/lib/calculators';
import ThemeToggle from '@/components/ThemeToggle';
import { useSidebar } from './AppShell';

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
        className={`border-r border-[var(--border)] bg-[var(--surface)] flex-col justify-between shrink-0 select-none hidden md:flex transition-all duration-200 ease-in-out ${
          isSidebarOpen
            ? 'md:w-16 md:min-w-[64px] md:p-2.5 md:pb-4 lg:w-60 lg:min-w-[240px] lg:p-5 lg:pb-6 opacity-100'
            : 'w-0 min-w-0 p-0 overflow-hidden border-none opacity-0'
        }`}
      >
        <div className="w-full min-w-0">
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
              <span className="text-xs text-slate-500 font-mono hidden lg:inline">
                v1.0
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
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M3 9h18" />
                      <path d="M9 21V9" />
                    </svg>
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
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                      <path d="M6 6h10" />
                      <path d="M6 10h10" />
                    </svg>
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
        <div className="w-full pt-3 lg:pt-4 border-t border-[var(--border)] flex flex-col items-center lg:items-stretch gap-2.5 lg:gap-3">
          <div className="flex items-center justify-center lg:justify-between w-full">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold hidden lg:inline">
              Theme
            </span>
            <ThemeToggle />
          </div>

          {/* Shortcuts Trigger Button */}
          <button
            type="button"
            onClick={() => setIsShortcutsModalOpen(true)}
            className="w-full px-2.5 py-2 rounded-lg text-xs font-mono bg-[var(--surface-subtle)] dark:bg-slate-900/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-[var(--border)] dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 transition flex items-center justify-center lg:justify-start gap-2 group shadow-sm"
            title="View Keyboard Shortcuts"
          >
            <svg
              className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition shrink-0"
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
            <span className="hidden lg:inline">Shortcuts</span>
          </button>

          <div className="text-xs text-slate-500 font-mono flex items-center justify-center lg:justify-start gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="hidden lg:inline truncate">Canonical Ledger Active</span>
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
                  <span className="text-xs text-slate-500 font-mono">v1.0</span>
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
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="18" x="3" y="3" rx="2" />
                          <path d="M3 9h18" />
                          <path d="M9 21V9" />
                        </svg>
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
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                          <path d="M6 6h10" />
                          <path d="M6 10h10" />
                        </svg>
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
            <div className="pt-4 border-t border-[var(--border)] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                  Theme
                </span>
                <ThemeToggle />
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  setIsShortcutsModalOpen(true);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-mono bg-[var(--surface-subtle)] text-slate-700 dark:text-slate-300 border border-[var(--border)] transition flex items-center gap-2 shadow-sm"
              >
                <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v1m0 0a2 2 0 01-2 2h4a2 2 0 01-2-2m-4-6a6 6 0 118 0c0 1.5-1 2.5-1.5 3.5H9.5C9 14.5 8 13.5 8 12z" />
                </svg>
                <span>Keyboard Shortcuts</span>
              </button>

              <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Canonical Ledger Active</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
