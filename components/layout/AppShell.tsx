'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';
import AppSidebar from './AppSidebar';
import CommandPalette from '@/components/CommandPalette';
import ShortcutsModal from '@/components/ShortcutsModal';

interface SidebarContextType {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isShortcutsModalOpen: boolean;
  setIsShortcutsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = createContext<SidebarContextType>({
  isSidebarOpen: true,
  setIsSidebarOpen: () => {},
  toggleSidebar: () => {},
  isCommandPaletteOpen: false,
  setIsCommandPaletteOpen: () => {},
  isShortcutsModalOpen: false,
  setIsShortcutsModalOpen: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // 1. Hydrate sidebar state from localStorage ('solvehub_sidebar_open')
  useEffect(() => {
    try {
      const saved = localStorage.getItem('solvehub_sidebar_open');
      if (saved !== null) {
        setIsSidebarOpen(saved === 'true');
      }
    } catch {
      // Ignore
    }
    setIsHydrated(true);
  }, []);

  // 2. Persist sidebar state
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem('solvehub_sidebar_open', String(isSidebarOpen));
    } catch {
      // Ignore
    }
  }, [isSidebarOpen, isHydrated]);

  // 3. Global keyboard shortcuts: Cmd + B / Ctrl + B (sidebar) & '/' (command palette)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd + B / Ctrl + B: Toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
        return;
      }

      // Cmd + K / Ctrl + K on non-root pages: Toggle command palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k' && pathname !== '/') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // '/': Open command palette when not typing in an input/textarea
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement | null;
        const isEditingText =
          target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable);

        if (!isEditingText) {
          e.preventDefault();
          setIsCommandPaletteOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pathname]);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // When on routes other than '/', render CommandPalette globally
  const isRoot = pathname === '/';

  return (
    <SidebarContext.Provider
      value={{
        isSidebarOpen,
        setIsSidebarOpen,
        toggleSidebar,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isShortcutsModalOpen,
        setIsShortcutsModalOpen,
      }}
    >
      <div className="flex h-screen w-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
        <AppSidebar />
        <div className="flex-1 min-w-0 h-full overflow-hidden flex flex-col relative">
          {children}
        </div>
      </div>

      {!isRoot && (
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
        />
      )}

      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />
    </SidebarContext.Provider>
  );
}