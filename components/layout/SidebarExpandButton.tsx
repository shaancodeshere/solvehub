'use client';

import React from 'react';
import { useSidebar } from './AppShell';
import { SidebarToggleIcon } from './AppSidebar';

export default function SidebarExpandButton() {
  const { isSidebarOpen, setIsSidebarOpen, setIsMobileDrawerOpen } = useSidebar();

  return (
    <>
      {/* Mobile Menu Sidebar Toggle (<768px) */}
      <button
        type="button"
        onClick={() => setIsMobileDrawerOpen(true)}
        className="md:hidden p-1.5 mr-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] bg-[var(--surface)] hover:bg-[var(--surface-subtle)] transition flex items-center justify-center border border-[var(--border)] shadow-sm shrink-0"
        title="Open Navigation Menu"
        aria-label="Open Navigation Menu"
      >
        <SidebarToggleIcon className="w-4 h-4" />
      </button>

      {/* Desktop / Tablet Sidebar Expand Button (when collapsed) */}
      {!isSidebarOpen && (
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="hidden md:flex p-1.5 mr-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] bg-[var(--surface)] hover:bg-[var(--surface-subtle)] transition items-center justify-center border border-[var(--border)] shadow-sm shrink-0"
          title="Expand Sidebar (⌘B)"
          aria-label="Expand Sidebar"
        >
          <SidebarToggleIcon className="w-3.5 h-3.5" />
        </button>
      )}
    </>
  );
}
