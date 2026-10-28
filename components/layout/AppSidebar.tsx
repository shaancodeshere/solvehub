'use client';

import React from 'react';
import Image from 'next/image';
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

export function ShortcutsKeypadIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* 2x2 Grid of Open Rings */}
      <circle cx="7.5" cy="7.5" r="3.25" />
      <circle cx="16.5" cy="7.5" r="3.25" />
      <circle cx="7.5" cy="16.5" r="3.25" />
      <circle cx="16.5" cy="16.5" r="3.25" />
    </svg>
  );
}

export const ShortcutsRingsIcon = ShortcutsKeypadIcon;
export const ShortcutsPaperclipIcon = ShortcutsKeypadIcon;
export const ShortcutsBulbIcon = ShortcutsKeypadIcon;

export function SidebarToggleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 3v18" />
    </svg>
  );
}

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
  const isCollapsed = !isSidebarOpen;

  return (
    <>
      {/* ──────────────────────────────────────────────────────────
          1. DESKTOP & TABLET SIDEBAR (hidden on mobile <768px)
          - Collapsed (Option 1): Sleek 56px icon-rail (w-14)
          - Expanded: Snug calibrated 208px sidebar (w-52)
         ────────────────────────────────────────────────────────── */}
      <aside
        className={`border-r border-[var(--border)] bg-[var(--surface)] flex flex-col justify-between shrink-0 select-none hidden md:flex transition-all duration-250 ease-out ${
          isCollapsed
            ? 'w-14 min-w-[56px] max-w-[56px]'
            : 'w-52 min-w-[208px] max-w-[208px]'
        }`}
      >
        <div
          className={`w-full min-w-0 flex-1 overflow-y-auto overflow-x-hidden ${
            isCollapsed ? 'px-2 pt-5 pb-2' : 'px-4 pt-5 pb-3'
          }`}
        >
          {/* Brand Header */}
          <div
            className={`flex items-center min-h-[28px] mb-6 ${
              isCollapsed ? 'justify-center' : 'justify-between gap-3'
            }`}
          >
            {isCollapsed ? (
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[#e2e8f0] dark:hover:bg-slate-800 transition-all duration-250 group cursor-pointer"
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <Image
                  src="/logo-mark.svg"
                  alt="SolveHub Logo Mark"
                  width={28}
                  height={28}
                  priority
                  className="w-7 h-7 shrink-0 transition-transform duration-250 ease-out group-hover:scale-110"
                />
              </button>
            ) : (
              <>
                <Link
                  href="/"
                  className="flex items-center group transition-all duration-250 ease-out"
                  title="SolveHub Home"
                >
                  <Image
                    src="/logo-mark.svg"
                    alt="SolveHub Logo Mark"
                    width={28}
                    height={28}
                    priority
                    className="w-7 h-7 shrink-0 transition-transform duration-250 ease-out group-hover:scale-105"
                  />
                  <div className="flex items-center ml-3">
                    <Image
                      src="/logo-text.svg"
                      alt="SolveHub"
                      width={96}
                      height={24}
                      priority
                      style={{ width: 'auto' }}
                      className="h-6 w-auto shrink-0 dark:brightness-0 dark:invert select-none"
                    />
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  className="w-7 h-7 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent hover:bg-[#e2e8f0] dark:hover:bg-slate-800 transition flex items-center justify-center shrink-0 cursor-pointer"
                  title="Collapse Sidebar (⌘B)"
                  aria-label="Collapse Sidebar"
                >
                  <SidebarToggleIcon className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Navigation Modes */}
          <div className="space-y-4">
            <div>
              {!isCollapsed && (
                <span className="text-slate-500 uppercase tracking-wider mb-2.5 text-xs font-semibold font-mono block">
                  Modes
                </span>
              )}
              <div className="space-y-1.5">
                {/* Canvas Link */}
                <Link
                  href="/"
                  title="Canvas"
                  className={
                    isCollapsed
                      ? `w-9 h-9 mx-auto rounded-xl flex items-center justify-center relative transition-all duration-200 ${
                          isCanvas
                            ? 'bg-emerald-500/10 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold shadow-sm border border-emerald-500/20 dark:border-transparent'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-[var(--surface-subtle)] dark:hover:bg-slate-800/50 border border-transparent'
                        }`
                      : `w-full px-2.5 py-2 rounded-lg text-sm font-medium font-mono transition flex items-center justify-between ${
                          isCanvas
                            ? 'bg-emerald-500/10 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold shadow-sm border border-emerald-500/20 dark:border-transparent'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-[var(--surface-subtle)] dark:hover:bg-slate-800/50'
                        }`
                  }
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CanvasModeIcon className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">Canvas</span>}
                  </div>
                  {isCanvas && (
                    <span
                      className={
                        isCollapsed
                          ? 'absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-in fade-in duration-200'
                          : 'w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0 animate-in fade-in duration-200'
                      }
                    />
                  )}
                </Link>

                {/* Library Link */}
                <Link
                  href="/library"
                  title="Library"
                  className={
                    isCollapsed
                      ? `w-9 h-9 mx-auto rounded-xl flex items-center justify-center relative transition-all duration-200 ${
                          isLibrary
                            ? 'bg-emerald-500/10 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold shadow-sm border border-emerald-500/20 dark:border-transparent'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-[var(--surface-subtle)] dark:hover:bg-slate-800/50 border border-transparent'
                        }`
                      : `w-full px-2.5 py-2 rounded-lg text-sm font-medium font-mono transition flex items-center justify-between ${
                          isLibrary
                            ? 'bg-emerald-500/10 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-semibold shadow-sm border border-emerald-500/20 dark:border-transparent'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-[var(--surface-subtle)] dark:hover:bg-slate-800/50'
                        }`
                  }
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <LibraryModeIcon className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">Library</span>}
                  </div>
                  {isLibrary && (
                    <span
                      className={
                        isCollapsed
                          ? 'absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-in fade-in duration-200'
                          : 'w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0 animate-in fade-in duration-200'
                      }
                    />
                  )}
                </Link>
              </div>
            </div>

            {/* Global Command Palette Trigger */}
            <div>
              {!isCollapsed && (
                <span className="text-slate-500 uppercase tracking-wider mb-2 text-xs font-semibold font-mono block">
                  Command Palette
                </span>
              )}
              <button
                type="button"
                onClick={() => setIsCommandPaletteOpen(true)}
                className={
                  isCollapsed
                    ? 'w-9 h-9 mx-auto rounded-xl flex items-center justify-center bg-[var(--surface-subtle)] dark:bg-slate-900/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-[var(--border)] dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 transition shadow-sm group cursor-pointer'
                    : 'w-full px-2.5 py-2 rounded-lg text-xs font-mono bg-[var(--surface-subtle)] dark:bg-slate-900/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-[var(--border)] dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 transition flex items-center justify-between group shadow-sm cursor-pointer'
                }
                title="Search"
                aria-label="Search calculators"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {!isCollapsed && <span>Search</span>}
                </span>
                {!isCollapsed && (
                  <kbd className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700">
                    /
                  </kbd>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div
          className={`w-full shrink-0 pb-3 flex flex-col ${
            isCollapsed ? 'px-2 items-center' : 'px-4'
          }`}
        >
          {/* Inset Divider Line */}
          <div className="w-full h-px bg-slate-300 dark:bg-slate-800 mb-3" />

          {isCollapsed ? (
            /* Collapsed Rail (w-14): Vertically stacked centered icons */
            <div className="flex flex-col items-center gap-2 mb-2 w-full">
              <button
                type="button"
                onClick={() => setIsShortcutsModalOpen(true)}
                className="h-9 w-9 rounded-xl flex items-center justify-center bg-[#E4EAF1] hover:bg-[#D7E0EB] border border-[#CBD5E1] text-[#334155] dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:border-slate-700/80 dark:text-slate-300 shadow-sm transition-all active:scale-95 cursor-pointer"
                title="Keyboard Shortcuts"
                aria-label="Keyboard Shortcuts"
              >
                <ShortcutsKeypadIcon className="w-4 h-4 text-[#334155] dark:text-slate-300 shrink-0" />
              </button>
              <ThemeToggle className="h-9 w-9 rounded-xl flex items-center justify-center bg-[#E4EAF1] hover:bg-[#D7E0EB] border border-[#CBD5E1] text-[#334155] dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:border-slate-700/80 dark:text-slate-300 shadow-sm transition-all active:scale-95 cursor-pointer" />
            </div>
          ) : (
            /* Expanded Sidebar (w-52): Full Horizontal Controls & Meta */
            <>
              <div className="flex items-center gap-2 h-9 mb-2.5 w-full">
                <button
                  type="button"
                  onClick={() => setIsShortcutsModalOpen(true)}
                  className="flex-1 h-9 px-3 flex items-center justify-center gap-1.5 rounded-xl bg-[#E4EAF1] hover:bg-[#D7E0EB] border border-[#CBD5E1] text-[#334155] dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:border-slate-700/80 dark:text-slate-300 font-mono text-[11px] font-medium tracking-tight whitespace-nowrap shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                  title="Keyboard Shortcuts"
                >
                  <ShortcutsKeypadIcon className="w-4 h-4 text-[#334155] dark:text-slate-300 shrink-0" />
                  <span>Shortcuts</span>
                </button>
                <div className="w-px h-5 bg-slate-300 dark:bg-slate-800 select-none shrink-0" />
                <ThemeToggle className="shrink-0 h-9 w-9 rounded-xl flex items-center justify-center bg-[#E4EAF1] hover:bg-[#D7E0EB] border border-[#CBD5E1] text-[#334155] dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:border-slate-700/80 dark:text-slate-300 shadow-sm transition-all active:scale-95 cursor-pointer" />
              </div>

              <div className="h-4 flex items-center gap-2 text-[11px] font-mono text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="truncate leading-none">Canonical Ledger Active</span>
              </div>
            </>
          )}
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
              <div className="flex items-center justify-between gap-3 mb-6 pb-3 border-b border-[var(--border)]">
                <Link
                  href="/"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="flex items-center gap-3 group"
                  title="SolveHub Home"
                >
                  <Image
                    src="/logo-mark.svg"
                    alt="SolveHub Logo Mark"
                    width={28}
                    height={28}
                    className="w-7 h-7 shrink-0 transition-transform duration-250 group-hover:scale-105"
                  />
                  <Image
                    src="/logo-text.svg"
                    alt="SolveHub"
                    width={96}
                    height={24}
                    style={{ width: 'auto' }}
                    className="h-6 w-auto shrink-0 dark:brightness-0 dark:invert select-none"
                  />
                </Link>

                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-[var(--surface-subtle)] transition flex items-center justify-center shrink-0"
                  aria-label="Close navigation menu"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                        <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0"></span>
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
                      {isLibrary && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0"></span>
                      )}
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
                  <ShortcutsKeypadIcon className="w-4 h-4 text-[#334155] dark:text-slate-300 shrink-0" />
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
