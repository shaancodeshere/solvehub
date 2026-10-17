'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { allCalculators } from '@/lib/calculators';
import { masterCategories } from '@/lib/categories';
import { CANVAS_TEMPLATES, CanvasTemplate } from '@/lib/canvasTemplates';

export interface CanvasTabItem {
  id: string;
  title: string;
  content: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  tabs?: CanvasTabItem[];
  activeTabId?: string;
  onSelectTab?: (tabId: string) => void;
  onSelectTemplate?: (template: CanvasTemplate) => void;
}

export type PaletteItem =
  | {
      type: 'tab';
      id: string;
      title: string;
      subtitle: string;
      isActive: boolean;
    }
  | {
      type: 'template';
      id: string;
      title: string;
      subtitle: string;
      badge: string;
      template: CanvasTemplate;
    }
  | {
      type: 'calculator';
      id: string;
      title: string;
      categorySlug: string;
      categoryName: string;
      group: string;
      description: string;
      url: string;
    };

export default function CommandPalette({
  isOpen,
  onClose,
  tabs = [],
  activeTabId,
  onSelectTab,
  onSelectTemplate,
}: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Focus input automatically on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const origOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = origOverflow;
      };
    }
  }, [isOpen]);

  // Map category slug to friendly display name
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    masterCategories.forEach((cat) => {
      map.set(cat.slug, cat.name);
      map.set(cat.id, cat.name);
    });
    return map;
  }, []);

  // Filter items matching query
  const filteredItems = useMemo<PaletteItem[]>(() => {
    const q = query.trim().toLowerCase();
    const items: PaletteItem[] = [];

    // 1. Canvas Sheets / Tabs
    if (tabs.length > 0) {
      const matchingTabs = tabs.filter((tab) => {
        if (!q) return true;
        return (
          tab.title.toLowerCase().includes(q) ||
          tab.content.toLowerCase().includes(q) ||
          q.includes('sheet') ||
          q.includes('tab')
        );
      });

      matchingTabs.forEach((tab) => {
        items.push({
          type: 'tab',
          id: tab.id,
          title: tab.title,
          subtitle: tab.content.trim()
            ? tab.content.trim().split('\n')[0].slice(0, 60)
            : 'Empty canvas sheet',
          isActive: tab.id === activeTabId,
        });
      });
    }

    // 2. Starter Templates
    const matchingTemplates = CANVAS_TEMPLATES.filter((tpl) => {
      if (!q) return true; // Show starter templates by default
      return (
        tpl.name.toLowerCase().includes(q) ||
        tpl.description.toLowerCase().includes(q) ||
        tpl.badge.toLowerCase().includes(q) ||
        tpl.tags.some((t) => t.toLowerCase().includes(q)) ||
        q.includes('template') ||
        q.includes('recipe')
      );
    });

    matchingTemplates.forEach((tpl) => {
      items.push({
        type: 'template',
        id: tpl.id,
        title: tpl.name,
        subtitle: tpl.description,
        badge: tpl.badge,
        template: tpl,
      });
    });

    // 3. Calculators Search
    const searchTerms = q.split(/\s+/).filter(Boolean);
    let matchedCalcs = allCalculators;

    if (searchTerms.length > 0) {
      matchedCalcs = allCalculators.filter((calc) => {
        const textToSearch = `${calc.name} ${calc.category} ${calc.group || ''} ${calc.description} ${calc.naturalLanguageQueries?.join(' ') || ''}`.toLowerCase();
        return searchTerms.every((term) => textToSearch.includes(term));
      });
    }

    // Limit to top 40 calculators for high-performance rendering
    const cappedCalcs = matchedCalcs.slice(0, 40);

    cappedCalcs.forEach((calc) => {
      items.push({
        type: 'calculator',
        id: calc.id,
        title: calc.name,
        categorySlug: calc.category,
        categoryName: categoryMap.get(calc.category) || calc.category,
        group: calc.group || '',
        description: calc.description,
        url: `/${calc.category}/${calc.id}`,
      });
    });

    return items;
  }, [query, tabs, activeTabId, categoryMap]);

  // Reset selected index within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems.length, query]);

  // Scroll active item into view
  useEffect(() => {
    if (filteredItems.length > 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [selectedIndex, filteredItems.length]);

  const handleSelectItem = (item: PaletteItem) => {
    if (item.type === 'tab') {
      if (onSelectTab) onSelectTab(item.id);
      onClose();
    } else if (item.type === 'template') {
      if (onSelectTemplate) onSelectTemplate(item.template);
      onClose();
    } else if (item.type === 'calculator') {
      onClose();
      router.push(item.url);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }

    if (filteredItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = filteredItems[selectedIndex];
      if (current) {
        handleSelectItem(current);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-4 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#161b22] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden font-mono flex flex-col max-h-[75vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 border-b border-slate-800 gap-3 bg-slate-900/60">
          <svg
            className="w-4 h-4 text-emerald-400 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 487 calculators or switch sheets..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 py-3.5 focus:outline-none font-mono tracking-tight"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-900 border border-slate-700/80 rounded text-slate-400 shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 space-y-1 focus:outline-none"
        >
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs font-mono">
              No calculators or sheets found matching &quot;{query}&quot;.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const prevItem = filteredItems[idx - 1];
              const showSectionHeader = !prevItem || prevItem.type !== item.type;

              return (
                <React.Fragment key={`${item.type}-${item.id}`}>
                  {showSectionHeader && (
                    <div className="px-3 pt-2.5 pb-1 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1.5">
                      {item.type === 'tab' && (
                        <>
                          <svg className="w-3.5 h-3.5 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>Canvas Sheets</span>
                        </>
                      )}
                      {item.type === 'template' && (
                        <>
                          <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
                          </svg>
                          <span>Starter Templates</span>
                        </>
                      )}
                      {item.type === 'calculator' && (
                        <>
                          <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span>Calculators ({allCalculators.length})</span>
                        </>
                      )}
                    </div>
                  )}

                  <div
                    ref={(el) => {
                      itemRefs.current[idx] = el;
                    }}
                    onClick={() => handleSelectItem(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`px-3.5 py-2.5 rounded-xl cursor-pointer transition flex items-center justify-between gap-3 text-xs ${
                      isSelected
                        ? 'bg-emerald-950/50 border border-emerald-500/50 text-white shadow-sm'
                        : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Icon */}
                      {item.type === 'tab' ? (
                        <span className="w-6 h-6 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-300 flex items-center justify-center shrink-0">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </span>
                      ) : item.type === 'template' ? (
                        <span className="w-6 h-6 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300 flex items-center justify-center shrink-0">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
                          </svg>
                        </span>
                      ) : (
                        <span className="w-6 h-6 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </span>
                      )}

                      <div className="min-w-0 flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold truncate text-slate-100">
                            {item.title}
                          </span>
                          {item.type === 'tab' && item.isActive && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-900/50 text-purple-300 border border-purple-500/40 font-mono">
                              Active
                            </span>
                          )}
                          {item.type === 'template' && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30 font-mono">
                              {item.badge}
                            </span>
                          )}
                          {item.type === 'calculator' && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700/80 shrink-0 font-mono">
                              {item.categoryName}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 truncate mt-0.5 font-sans">
                          {item.type === 'calculator'
                            ? item.description
                            : item.subtitle}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {isSelected && (
                        <span className="text-[11px] text-emerald-400 font-mono font-medium hidden sm:inline">
                          {item.type === 'tab'
                            ? 'Switch ↵'
                            : item.type === 'template'
                              ? 'Insert ↵'
                              : 'Open ↵'}
                        </span>
                      )}
                      <span className="text-slate-600">→</span>
                    </div>
                  </div>
                </React.Fragment>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-4 py-2 bg-slate-900/80 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="text-slate-400">↑↓</kbd> Navigate
            </span>
            <span>
              <kbd className="text-slate-400">↵</kbd> Select
            </span>
            <span>
              <kbd className="text-slate-400">ESC</kbd> Close
            </span>
          </div>
          <span className="text-emerald-400/80 font-medium">
            SolveHub Ecosystem
          </span>
        </div>
      </div>
    </div>
  );
}
