'use client';

import React from 'react';
import { useSidebar } from './AppShell';

export default function SidebarExpandButton() {
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();

  if (isSidebarOpen) return null;

  return (
    <button
      type="button"
      onClick={() => setIsSidebarOpen(true)}
      className="p-1.5 mr-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent hover:bg-[#e2e8f0] dark:hover:bg-slate-800 transition flex items-center justify-center border border-[var(--border)] dark:border-slate-700 shadow-sm shrink-0"
      title="Toggle Sidebar (⌘B)"
      aria-label="Expand Sidebar"
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M9 3v18" />
      </svg>
    </button>
  );
}
