'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? (resolvedTheme || theme) : 'dark';
  const isDark = currentTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const defaultClasses =
    'w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-white transition-all active:scale-95 cursor-pointer';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={className || defaultClasses}
    >
      <svg
        className={`w-4 h-4 transition-transform duration-500 ease-in-out ${isDark ? 'rotate-180' : 'rotate-0'}`}
        viewBox="0 0 24 24"
        fill="none"
      >
        {/* Outer circle stroke */}
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
        {/* Solid filled right half */}
        <path d="M 12 3 A 9 9 0 0 1 12 21 Z" fill="currentColor" />
      </svg>
    </button>
  );
}
