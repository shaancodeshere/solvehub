'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? (resolvedTheme || theme) : 'dark';
  const isDark = currentTheme === 'dark';

  return (
    <div
      role="group"
      aria-label="Theme preference toggle"
      className="inline-flex items-center p-0.5 rounded-lg bg-[var(--surface-subtle)] dark:bg-slate-900 border border-[var(--border)] dark:border-slate-800 transition-colors shadow-inner select-none"
    >
      {/* Light Mode Button */}
      <button
        type="button"
        onClick={() => setTheme('light')}
        aria-label="Switch to light mode"
        aria-pressed={mounted && !isDark}
        title="Light mode"
        className={`px-2 py-1 rounded-md text-xs font-mono font-medium flex items-center gap-1.5 transition-all duration-150 cursor-pointer ${
          mounted && !isDark
            ? 'bg-[var(--surface)] text-amber-600 shadow-sm border border-[var(--border)] font-semibold'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
      >
        <svg
          className="w-3.5 h-3.5 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
          />
        </svg>
        <span className="text-[11px] leading-none">Light</span>
      </button>

      {/* Dark Mode Button */}
      <button
        type="button"
        onClick={() => setTheme('dark')}
        aria-label="Switch to dark mode"
        aria-pressed={mounted && isDark}
        title="Dark mode"
        className={`px-2 py-1 rounded-md text-xs font-mono font-medium flex items-center gap-1.5 transition-all duration-150 cursor-pointer ${
          mounted && isDark
            ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/80 font-semibold'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
      >
        <svg
          className="w-3.5 h-3.5 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
          />
        </svg>
        <span className="text-[11px] leading-none">Dark</span>
      </button>
    </div>
  );
}
