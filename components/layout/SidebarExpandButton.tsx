'use client';

import React from 'react';
import { useSidebar } from './AppShell';

export default function SidebarExpandButton() {
  const { isSidebarOpen, setIsSidebarOpen, setIsMobileDrawerOpen } = useSidebar();

  return (
    <>
      {/* Mobile Menu Hamburger (<768px) */}
      <button
        type="button"
        onClick={() => setIsMobileDrawerOpen(true)}
        className="md:hidden p-1.5 mr-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent hover:bg-[#e2e8f0] dark:hover:bg-slate-800 transition flex items-center justify-center border border-[var(--border)] dark:border-slate-700 shadow-sm shrink-0"
        title="Open Navigation Menu"
        aria-label="Open Navigation Menu"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
      </button>

      {/* Desktop / Tablet Sidebar Expand Button (when collapsed) */}
      {!isSidebarOpen && (
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="hidden md:flex p-1.5 mr-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent hover:bg-[#e2e8f0] dark:hover:bg-slate-800 transition items-center justify-center border border-[var(--border)] dark:border-slate-700 shadow-sm shrink-0"
          title="Expand Sidebar (⌘B)"
          aria-label="Expand Sidebar"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M9 3v18" />
          </svg>
        </button>
      )}
    </>
  );
}
