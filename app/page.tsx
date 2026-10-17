'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { masterCategories } from '@/lib/categories';
import { allCalculators } from '@/lib/calculators';
import { executeCanvasScript, EvaluatedVariable, formatAmount } from '@/lib/canvasEngine';
import CommandPalette from '@/components/CommandPalette';
import TemplatesModal from '@/components/TemplatesModal';
import ThemeToggle from '@/components/ThemeToggle';
import { CANVAS_TEMPLATES, CanvasTemplate } from '@/lib/canvasTemplates';
import { useSidebar } from '@/components/layout/AppShell';

export interface CanvasTab {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}

interface HistoryItem {
  id: string;
  title: string;
  timestamp: string;
  content: string;
  totalDisplay: string;
  itemCount: number;
  calculatorOutput?: any;
}
const DEFAULT_CANVAS_TEXT = `ticket 450`;

const BENCHMARK_RATES: Record<string, { rateFromUSD: number; symbol: string; label: string }> = {
  USD: { rateFromUSD: 1.0, symbol: '$', label: 'USD' },
  EUR: { rateFromUSD: 0.92, symbol: '€', label: 'EUR' },
  GBP: { rateFromUSD: 0.79, symbol: '£', label: 'GBP' },
  INR: { rateFromUSD: 83.50, symbol: '₹', label: 'INR' },
  CAD: { rateFromUSD: 1.36, symbol: 'C$', label: 'CAD' },
  AED: { rateFromUSD: 3.67, symbol: 'AED', label: 'AED' },
  JPY: { rateFromUSD: 155.0, symbol: '¥', label: 'JPY' },
};

function getCurrencyCodeFromSymbol(symbol: string): string {
  if (!symbol) return 'USD';
  const s = symbol.trim().toUpperCase();
  if (s === '₹' || s === 'INR') return 'INR';
  if (s === '€' || s === 'EUR') return 'EUR';
  if (s === '£' || s === 'GBP') return 'GBP';
  if (s === 'C$' || s === 'CAD') return 'CAD';
  if (s === 'AED') return 'AED';
  if (s === '¥' || s === 'JPY') return 'JPY';
  return 'USD';
}

function convertAmount(val: number, sourceSymbol: string, targetCode: string): number {
  const sourceCode = getCurrencyCodeFromSymbol(sourceSymbol);
  const sourceRate = BENCHMARK_RATES[sourceCode]?.rateFromUSD || 1.0;
  const targetRate = BENCHMARK_RATES[targetCode]?.rateFromUSD || 1.0;
  return (val / sourceRate) * targetRate;
}

function formatConvertedAmount(amount: number, targetCode: string): string {
  const targetInfo = BENCHMARK_RATES[targetCode] || BENCHMARK_RATES.USD;
  const absVal = Math.abs(amount);
  const formatted =
    absVal >= 1000
      ? Number.isInteger(absVal)
        ? absVal.toLocaleString('en-US')
        : absVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : Number.isInteger(absVal)
        ? absVal.toString()
        : absVal.toFixed(2);
  const prefix = ['$', '€', '£', '₹', '¥', 'C$'].includes(targetInfo.symbol)
    ? targetInfo.symbol
    : `${targetInfo.symbol} `;
  return `≈ ${amount < 0 ? '-' : ''}${prefix}${formatted}`;
}

export default function HomePage() {
  const { isSidebarOpen, setIsSidebarOpen, isCommandPaletteOpen, setIsCommandPaletteOpen } = useSidebar();
  const [activeMode, setActiveMode] = useState<'canvas' | 'library'>('canvas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  
  // Phase 2: Live Receipt & Export State
  const [isCopied, setIsCopied] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<'txt' | 'csv'>('txt');
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [displayCurrency, setDisplayCurrency] = useState<string>('USD');
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [showTemplatesMenu, setShowTemplatesMenu] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);

  // Split bill input expansion state
  const [showSplitInput, setShowSplitInput] = useState(false);
  const [splitCount, setSplitCount] = useState<number>(3);

  // History Drawer State
  const [showHistory, setShowHistory] = useState(false);
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);

  // Clear Confirmation / Tagging Modal State
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearSheetTag, setClearSheetTag] = useState('');
  const modalInputRef = useRef<HTMLInputElement>(null);

  // Multi-Tab Canvas Workspace State
  const [tabs, setTabs] = useState<CanvasTab[]>([
    {
      id: 'tab-1',
      title: 'Sheet 1',
      content: DEFAULT_CANVAS_TEXT,
      createdAt: 1,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [tempTabTitle, setTempTabTitle] = useState('');

  // Active note being edited in Section C
  // Inline tag editing in History Drawer
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);
  const [tempHistoryTag, setTempHistoryTag] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState('');

  const [isHydrated, setIsHydrated] = useState(false);
  const [calculatorOutput, setCalculatorOutput] = useState<{
    primaryOutput?: { label: string; value: string | number; prefix?: string; suffix?: string };
    secondaryMetrics?: { label: string; value: string | number; prefix?: string; suffix?: string }[];
  } | null>(null);

  // Active Tab and Canvas Code derivation
  const activeTab = useMemo(() => {
    return tabs.find((t) => t.id === activeTabId) || tabs[0];
  }, [tabs, activeTabId]);

  const canvasCode = activeTab ? activeTab.content : '';

  const setCanvasCode = (updater: string | ((prev: string) => string)) => {
    setTabs((prevTabs) => {
      const currentActiveId = activeTab?.id || prevTabs[0]?.id;
      return prevTabs.map((t) => {
        if (t.id === currentActiveId) {
          const nextContent = typeof updater === 'function' ? updater(t.content) : updater;
          return { ...t, content: nextContent };
        }
        return t;
      });
    });
  };

  // 1. Hydrate from LocalStorage on mount
  useEffect(() => {
    try {
      const savedTabsData = localStorage.getItem('solvehub_canvas_tabs_v1');
      if (savedTabsData) {
        const parsed = JSON.parse(savedTabsData);
        if (parsed && Array.isArray(parsed.tabs) && parsed.tabs.length > 0) {
          setTabs(parsed.tabs);
          if (parsed.activeTabId && parsed.tabs.some((t: CanvasTab) => t.id === parsed.activeTabId)) {
            setActiveTabId(parsed.activeTabId);
          } else {
            setActiveTabId(parsed.tabs[0].id);
          }
        }
      } else {
        const savedActive = localStorage.getItem('solvehub_active_canvas');
        if (savedActive !== null) {
          setTabs([
            {
              id: 'tab-1',
              title: 'Sheet 1',
              content: savedActive,
              createdAt: Date.now(),
            },
          ]);
        }
      }

      const savedHistory = localStorage.getItem('solvehub_canvas_history');
      if (savedHistory) {
        setHistoryList(JSON.parse(savedHistory));
      }
      const savedOutput = localStorage.getItem('solvehub_active_calculator_output');
      if (savedOutput) {
        setCalculatorOutput(JSON.parse(savedOutput));
      }
    } catch {
      // Ignore storage errors in restricted environments
    }
    setIsHydrated(true);
  }, []);

  // 2. Persist tabs array and activeTabId in localStorage ('solvehub_canvas_tabs_v1')
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(
        'solvehub_canvas_tabs_v1',
        JSON.stringify({ tabs, activeTabId })
      );
      const currentTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
      if (currentTab) {
        localStorage.setItem('solvehub_active_canvas', currentTab.content);
      }
    } catch {
      // Ignore
    }
  }, [tabs, activeTabId, isHydrated]);

  // Tab management helpers
  const handleNewTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTabNumber = tabs.length + 1;
    const newTab: CanvasTab = {
      id: newId,
      title: `Sheet ${newTabNumber}`,
      content: '',
      createdAt: Date.now(),
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length <= 1) return; // Guard preventing deleting the last tab

    const targetIndex = tabs.findIndex((t) => t.id === id);
    const updatedTabs = tabs.filter((t) => t.id !== id);
    setTabs(updatedTabs);

    if (activeTabId === id) {
      const nextIndex = Math.max(0, targetIndex - 1);
      const fallbackTab = updatedTabs[nextIndex] || updatedTabs[0];
      if (fallbackTab) {
        setActiveTabId(fallbackTab.id);
      }
    }
  };

  const startRenameTab = (tab: CanvasTab, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingTabId(tab.id);
    setTempTabTitle(tab.title);
  };

  const saveRenameTab = (id: string) => {
    const finalTitle = tempTabTitle.trim() || 'Untitled Sheet';
    setTabs((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title: finalTitle } : t))
    );
    setEditingTabId(null);
  };


  // Autofocus modal input when clear modal opens
  useEffect(() => {
    if (showClearModal) {
      setTimeout(() => {
        modalInputRef.current?.focus();
      }, 50);
    }
  }, [showClearModal]);
  // Close history on physical Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showHistory) {
        setShowHistory(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showHistory]);
  const canvasReceipt = useMemo(() => {
    return executeCanvasScript(canvasCode);
  }, [canvasCode]);

  // Converted amount calculation for hero result card
  const convertedHeroAmount = useMemo(() => {
    if (calculatorOutput?.primaryOutput) {
      const numVal =
        typeof calculatorOutput.primaryOutput.value === 'number'
          ? calculatorOutput.primaryOutput.value
          : parseFloat(String(calculatorOutput.primaryOutput.value).replace(/[^0-9.-]/g, ''));
      if (!isNaN(numVal)) {
        const sourceCurrency = calculatorOutput.primaryOutput.prefix || '$';
        const converted = convertAmount(numVal, sourceCurrency, displayCurrency);
        return formatConvertedAmount(converted, displayCurrency);
      }
    }
    if (!canvasReceipt.lastResult || canvasReceipt.lastResult.isError) return null;
    const rawVal =
      typeof canvasReceipt.lastResult.value === 'number'
        ? canvasReceipt.lastResult.value
        : canvasReceipt.finalTotal;
    if (typeof rawVal !== 'number' || isNaN(rawVal)) return null;

    const sourceCurrency = canvasReceipt.detectedCurrency || '$';
    const converted = convertAmount(rawVal, sourceCurrency, displayCurrency);
    const convertedStr = formatConvertedAmount(converted, displayCurrency);
    return canvasReceipt.splitResult ? `${convertedStr} / person` : convertedStr;
  }, [canvasReceipt, displayCurrency, calculatorOutput]);

  // Clean up copy feedback timer on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  // Close currency, download, and templates menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => {
      setShowCurrencyMenu(false);
      setShowDownloadMenu(false);
      setShowTemplatesMenu(false);
    };
    if (showCurrencyMenu || showDownloadMenu || showTemplatesMenu) {
      window.addEventListener('click', handleOutsideClick);
      return () => window.removeEventListener('click', handleOutsideClick);
    }
  }, [showCurrencyMenu, showDownloadMenu, showTemplatesMenu]);


  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return allCalculators.filter((calc) => {
      const matchesCategory =
        selectedCategoryFilter === 'all' || calc.category === selectedCategoryFilter;

      if (!matchesCategory) return false;
      if (!q) return true;

      return (
        calc.name.toLowerCase().includes(q) ||
        calc.description.toLowerCase().includes(q) ||
        calc.category.toLowerCase().includes(q) ||
        calc.naturalLanguageQueries?.some((nlq) => nlq.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, selectedCategoryFilter]);

  // Core Save to History
  const saveToHistory = (customTitle?: string) => {
    if (!canvasCode.trim() || canvasReceipt.variables.length === 0) return;

    // Derive intelligent default title if none provided
    const fallbackTitle =
      canvasReceipt.variables.find((v) => v.note)?.note ||
      canvasReceipt.variables[0]?.name ||
      'Untitled Ledger';

    const finalTitle = customTitle?.trim() || fallbackTitle;

    const newItem: HistoryItem = {
      id: `hist-${Date.now()}`,
      title: finalTitle,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        month: 'short',
        day: 'numeric',
      }),
      content: canvasCode,
      totalDisplay:
        calculatorOutput?.primaryOutput?.value
          ? `${calculatorOutput.primaryOutput.prefix || ''}${calculatorOutput.primaryOutput.value}${calculatorOutput.primaryOutput.suffix || ''}`
          : canvasReceipt.lastResult?.formattedValue || '0',
      itemCount: canvasReceipt.variables.length,
      calculatorOutput: calculatorOutput ? JSON.parse(JSON.stringify(calculatorOutput)) : null,
    };

    const updated = [newItem, ...historyList.filter((h) => h.content !== canvasCode)].slice(0, 20);
    setHistoryList(updated);
    try {
      localStorage.setItem('solvehub_canvas_history', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  // Helper to clear bridged calculator state
  const clearCalculatorOutputState = () => {
    try {
      localStorage.removeItem('solvehub_active_calculator_output');
    } catch {
      // Ignore
    }
    setCalculatorOutput(null);
  };

  // Intercept Clear Click
  const handleClearClick = () => {
    if (!canvasCode.trim() || canvasReceipt.variables.length === 0) {
      setCanvasCode('');
      clearCalculatorOutputState();
      return;
    }
    // Prefill tag suggestion from first available note
    const firstNote = canvasReceipt.variables.find((v) => v.note)?.note || '';
    setClearSheetTag(firstNote);
    setShowClearModal(true);
  };

  // Confirm save and clear
  const handleConfirmSaveAndClear = () => {
    saveToHistory(clearSheetTag);
    setShowClearModal(false);
    setClearSheetTag('');
    setCanvasCode('');
    clearCalculatorOutputState();
  };

  // Discard without saving and clear
  const handleDiscardAndClear = () => {
    setShowClearModal(false);
    setClearSheetTag('');
    setCanvasCode('');
    clearCalculatorOutputState();
  };

  const restoreHistory = (item: HistoryItem) => {
    setCanvasCode(item.content);
    if (item.calculatorOutput) {
      setCalculatorOutput(item.calculatorOutput);
      try {
        localStorage.setItem(
          'solvehub_active_calculator_output',
          JSON.stringify(item.calculatorOutput)
        );
      } catch {
        // Ignore
      }
    } else {
      clearCalculatorOutputState();
    }
    setShowHistory(false);
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = historyList.filter((item) => item.id !== id);
    setHistoryList(updated);
    try {
      localStorage.setItem('solvehub_canvas_history', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleSaveHistoryTag = (id: string) => {
    const updated = historyList.map((item) => {
      if (item.id === id) {
        return { ...item, title: tempHistoryTag.trim() };
      }
      return item;
    });
    setHistoryList(updated);
    try {
      localStorage.setItem('solvehub_canvas_history', JSON.stringify(updated));
    } catch {
      // Ignore
    }
    setEditingHistoryId(null);
  };

  const appendSyntax = (syntax: string) => {
    setCanvasCode((prev) => (prev ? `${prev.trimEnd()}\n${syntax}` : syntax));
  };

  const handleApplySplit = () => {
    const count = Math.max(1, splitCount || 2);
    appendSyntax(`split between ${count} people`);
    setShowSplitInput(false);
  };

  const handleSelectTemplate = (template: CanvasTemplate) => {
    setCanvasCode(template.content);
    if (activeTab && /^Sheet \d+$/.test(activeTab.title)) {
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTab.id ? { ...t, title: template.name.split('&')[0].trim().slice(0, 20) } : t))
      );
    }
    setShowTemplatesMenu(false);
  };

  const handleInsertTemplateActive = (template: CanvasTemplate) => {
    handleSelectTemplate(template);
    setIsTemplatesModalOpen(false);
  };

  const handleOpenTemplateInNewSheet = (template: CanvasTemplate) => {
    const newId = `tab-${Date.now()}`;
    const newTab: CanvasTab = {
      id: newId,
      title: template.name.split('&')[0].trim().slice(0, 20),
      content: template.content,
      createdAt: Date.now(),
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
    setIsTemplatesModalOpen(false);
    setShowTemplatesMenu(false);
  };

  const handleSaveNote = (v: EvaluatedVariable) => {
    if (v.lineNumber < 0) return;
    const lines = canvasCode.split('\n');
    const targetLine = lines[v.lineNumber];

    if (targetLine) {
      const baseWithoutNote = targetLine.replace(/\s*\([^)]*\)\s*$/, '').trim();
      const updatedLine = tempNoteText.trim()
        ? `${baseWithoutNote} (${tempNoteText.trim()})`
        : baseWithoutNote;

      lines[v.lineNumber] = updatedLine;
      setCanvasCode(lines.join('\n'));
    }
    setEditingNoteId(null);
  };

  const handleCopyReceipt = () => {
    if (canvasReceipt.variables.length === 0 && !calculatorOutput) return;

    const sheetTitle = activeTab?.title || 'Canvas Sheet';
    const timestamp = new Date().toLocaleString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const lines: string[] = [
      '# SolveHub Statement Receipt',
      `**Sheet**: ${sheetTitle} | **Date**: ${timestamp}`,
    ];

    const calcObj = calculatorOutput as any;
    if (calcObj && calcObj.primaryOutput) {
      const primaryVal = `${calcObj.primaryOutput.prefix || ''}${calcObj.primaryOutput.value}${calcObj.primaryOutput.suffix || ''}`;
      lines.push('');
      lines.push(`**Calculator**: ${calcObj.title || 'Calculation'}`);
      lines.push(`**${calcObj.primaryOutput.label || 'Result'}**: **${primaryVal}**`);
    }

    // 2. Itemized Breakdown
    const nonSummaryVars = canvasReceipt.variables.filter(
      (v) => v.type !== 'summary' && v.type !== 'modifier'
    );
    if (nonSummaryVars.length > 0) {
      lines.push('');
      lines.push('---');
      lines.push('');
      lines.push(`### ${calcObj?.primaryOutput ? 'Input Parameters' : 'Itemized Breakdown'}`);
      nonSummaryVars.forEach((v) => {
        const noteStr = v.note ? ` *(Note: ${v.note})*` : '';
        lines.push(`- **${v.name}**: ${v.formattedValue}${noteStr}`);
      });
    }

    if (calcObj?.secondaryMetrics && Array.isArray(calcObj.secondaryMetrics) && calcObj.secondaryMetrics.length > 0) {
      lines.push('');
      lines.push('### Calculation Metrics');
      calcObj.secondaryMetrics.forEach((m: any) => {
        const val = `${m.prefix || ''}${m.value}${m.suffix ? ` ${m.suffix}` : ''}`;
        lines.push(`- **${String(m.label || '')}**: ${val}`);
      });
    }

    // 3. Calculations Summary
    const curr = canvasReceipt.detectedCurrency;
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push(`- Subtotal: **${formatAmount(canvasReceipt.rawBaseSubtotal, curr)}**`);
    if (canvasReceipt.totalDiscounts > 0) {
      lines.push(`- Total Discounts: **-${formatAmount(canvasReceipt.totalDiscounts, curr)}**`);
    }
    if (canvasReceipt.totalTaxes > 0) {
      lines.push(`- Total Taxes: **+${formatAmount(canvasReceipt.totalTaxes, curr)}**`);
    }

    // 4. Hero & Split (prominent callout)
    lines.push('');
    lines.push(`## Total: ${formatAmount(canvasReceipt.finalTotal, curr)}`);

    if (canvasReceipt.splitResult) {
      const splitMatch = canvasReceipt.splitResult.name.match(/\d+/);
      const splitCountVal = splitMatch ? parseInt(splitMatch[0], 10) : splitCount;
      const splitPerPersonVal =
        canvasReceipt.splitResult.value !== null
          ? formatAmount(canvasReceipt.splitResult.value, curr)
          : canvasReceipt.splitResult.formattedValue.replace(/\s*\/ person$/, '');
      if (splitCountVal > 1) {
        lines.push(`> **Split (${splitCountVal} people)**: **${splitPerPersonVal} / person**`);
      }
    }

    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('_Generated via SolveHub Canvas_');

    const textOutput = lines.join('\n');

    const triggerCopiedFeedback = () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      setIsCopied(true);
      copyTimeoutRef.current = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    };

    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(textOutput)
        .then(() => triggerCopiedFeedback())
        .catch(() => {
          try {
            const textarea = document.createElement('textarea');
            textarea.value = textOutput;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            triggerCopiedFeedback();
          } catch {
            triggerCopiedFeedback();
          }
        });
    } else {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = textOutput;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        triggerCopiedFeedback();
      } catch {
        triggerCopiedFeedback();
      }
    }
  };

  const handleDownloadReceipt = (format: 'txt' | 'csv' = downloadFormat) => {
    if (canvasReceipt.variables.length === 0 && !calculatorOutput) return;

    const sheetTitle = activeTab?.title || 'Canvas Sheet';
    const titleSlug = sheetTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'sheet';
    const dateSlug = new Date().toISOString().slice(0, 10);
    const filename = `solvehub-receipt-${titleSlug}-${dateSlug}.${format}`;

    if (format === 'csv') {
      const csvEscape = (val: string | number): string => {
        const str = String(val ?? '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return `"${str}"`;
      };

      const rows: string[] = ['Item,Type,Value,Notes'];

      const calcObj = calculatorOutput as any;
      if (calcObj && calcObj.primaryOutput) {
        rows.push([
          csvEscape(calcObj.title || 'Calculator Result'),
          csvEscape('calculator'),
          csvEscape(calcObj.primaryOutput.value),
          csvEscape(calcObj.primaryOutput.label || ''),
        ].join(','));
      }

      canvasReceipt.variables.forEach((v) => {
        if (v.type !== 'summary' && v.type !== 'modifier') {
          rows.push([
            csvEscape(v.name),
            csvEscape(v.type),
            csvEscape(v.value ?? 0),
            csvEscape(v.note || ''),
          ].join(','));
        }
      });

      rows.push([csvEscape('Subtotal'), csvEscape('subtotal'), csvEscape(canvasReceipt.rawBaseSubtotal), csvEscape('')].join(','));
      if (canvasReceipt.totalDiscounts > 0) {
        rows.push([csvEscape('Total Discounts'), csvEscape('deduction'), csvEscape(-canvasReceipt.totalDiscounts), csvEscape('')].join(','));
      }
      if (canvasReceipt.totalTaxes > 0) {
        rows.push([csvEscape('Total Taxes'), csvEscape('addition'), csvEscape(canvasReceipt.totalTaxes), csvEscape('')].join(','));
      }
      rows.push([csvEscape('FINAL TOTAL'), csvEscape('summary'), csvEscape(canvasReceipt.finalTotal), csvEscape('')].join(','));

      if (canvasReceipt.splitResult) {
        rows.push([
          csvEscape(canvasReceipt.splitResult.name),
          csvEscape('modifier'),
          csvEscape(canvasReceipt.splitResult.value ?? 0),
          csvEscape('Per person share'),
        ].join(','));
      }

      const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // Retro thermal-printer style ledger slip with ASCII borders (+-------+)
      const w = 50;
      const border = '+' + '-'.repeat(w) + '+';
      const dblBorder = '+' + '='.repeat(w) + '+';

      const padCenter = (str: string, width: number): string => {
        const pad = width - str.length;
        if (pad <= 0) return str.slice(0, width);
        const left = Math.floor(pad / 2);
        const right = pad - left;
        return ' '.repeat(left) + str + ' '.repeat(right);
      };

      const row = (text: string): string => {
        return '| ' + text.slice(0, w - 2).padEnd(w - 2) + ' |';
      };

      const kvRow = (k: string, v: string): string => {
        const valStr = String(v).padStart(16);
        const keyWidth = w - 2 - valStr.length;
        const keyStr = String(k).slice(0, keyWidth).padEnd(keyWidth);
        return '| ' + keyStr + valStr + ' |';
      };

      const timestamp = new Date().toLocaleString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const slip: string[] = [
        border,
        '| ' + padCenter('SOLVEHUB RECEIPT', w - 2) + ' |',
        '| ' + padCenter('Generated via SolveHub Canvas', w - 2) + ' |',
        border,
        row(`Sheet: ${sheetTitle}`),
        row(`Date:  ${timestamp}`),
        border,
      ];

      const calcObj = calculatorOutput as any;
      if (calcObj && calcObj.primaryOutput) {
        slip.push(row(`CALCULATOR: ${(calcObj.title || 'CALCULATION').toUpperCase()}`));
        const primaryVal = `${calcObj.primaryOutput.prefix || ''}${calcObj.primaryOutput.value}${calcObj.primaryOutput.suffix || ''}`;
        slip.push(kvRow(String(calcObj.primaryOutput.label || 'Result'), primaryVal));
        slip.push(border);
        slip.push(row('INPUT PARAMETERS:'));
      } else {
        slip.push(kvRow('ITEM', 'AMOUNT'));
      }
      slip.push(border);

      canvasReceipt.variables.forEach((v) => {
        if (v.type !== 'summary' && v.type !== 'modifier') {
          slip.push(kvRow(v.name, v.formattedValue));
          if (v.note) {
            slip.push(row(`  ↳ Note: ${v.note}`));
          }
        }
      });

      const curr = canvasReceipt.detectedCurrency;
      slip.push(border);
      slip.push(kvRow('Subtotal:', formatAmount(canvasReceipt.rawBaseSubtotal, curr)));
      if (canvasReceipt.totalDiscounts > 0) {
        slip.push(kvRow('Total Discounts:', `-${formatAmount(canvasReceipt.totalDiscounts, curr)}`));
      }
      if (canvasReceipt.totalTaxes > 0) {
        slip.push(kvRow('Total Taxes:', `+${formatAmount(canvasReceipt.totalTaxes, curr)}`));
      }
      slip.push(dblBorder);
      slip.push(kvRow('FINAL TOTAL:', formatAmount(canvasReceipt.finalTotal, curr)));
      slip.push(dblBorder);

      if (canvasReceipt.splitResult) {
        slip.push(kvRow(canvasReceipt.splitResult.name, canvasReceipt.splitResult.formattedValue));
        slip.push(border);
      }

      slip.push('| ' + padCenter('Thank you for calculating.', w - 2) + ' |');
      slip.push('| ' + padCenter('Generated via SolveHub Canvas', w - 2) + ' |');
      slip.push(border);

      const blob = new Blob([slip.join('\n')], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const isHeroSplit = Boolean(canvasReceipt.splitResult);

  return (
    <div className="flex-1 h-full w-full flex overflow-hidden font-sans relative">
      {/* ──────────────────────────────────────────────────────────
          CLEAR / SAVE MODAL DIALOG
         ────────────────────────────────────────────────────────── */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div
            className="w-full max-w-md bg-[var(--surface)] dark:bg-[#131822] border border-[var(--border)] dark:border-slate-700/80 rounded-2xl p-6 shadow-2xl relative space-y-5"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleConfirmSaveAndClear();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                handleDiscardAndClear();
              }
            }}
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-500 dark:text-emerald-400 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>
                <span>SAVE SNAPSHOT</span>
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white font-mono">
                Save sheet before clearing?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                Tag this calculation so you can easily identify and restore it later.
              </p>
            </div>

            <div>
              <input
                ref={modalInputRef}
                type="text"
                value={clearSheetTag}
                onChange={(e) => setClearSheetTag(e.target.value)}
                placeholder="e.g., Pasta and drinks, Roundtrip ticket..."
                className="w-full bg-[var(--surface-subtle)] dark:bg-slate-950 border border-[var(--border)] dark:border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition"
              />
            </div>

            {/* Keyboard-styled Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {/* Exit / Skip Badge Button */}
              <button
                type="button"
                onClick={handleDiscardAndClear}
                className="group flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--surface-subtle)] hover:bg-slate-200/80 dark:bg-slate-900/90 dark:hover:bg-slate-800 border border-[var(--border)] dark:border-slate-700 text-slate-700 dark:text-slate-300 transition text-sm font-mono"
              >
                <kbd className="px-2 py-0.5 text-xs font-semibold bg-[var(--surface)] dark:bg-slate-800 border border-[var(--border)] dark:border-slate-600 rounded text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200">
                  esc
                </kbd>
                <span>Exit</span>
              </button>

              {/* Enter / Save Badge Button */}
              <button
                type="button"
                onClick={handleConfirmSaveAndClear}
                className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 hover:text-white transition text-sm font-mono font-medium shadow-sm"
              >
                <kbd className="px-2 py-0.5 text-xs font-semibold bg-emerald-900/60 border border-emerald-500/50 rounded text-emerald-300 group-hover:text-emerald-100">
                  ↵
                </kbd>
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          CANVAS WORKSPACE & LIVE RECEIPT
         ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">
          {/* Section B: Natural Editor */}
          <section className="flex-1 p-6 overflow-hidden border-r border-[var(--border)] bg-[var(--background)] flex flex-col transition-colors duration-200">
            {/* Clean Header */}
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                {!isSidebarOpen && (
                  <button
                    type="button"
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-1.5 mr-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent hover:bg-[#e2e8f0] dark:hover:bg-slate-800 transition flex items-center justify-center border border-[var(--border)] dark:border-slate-700 shadow-sm"
                    title="Toggle Sidebar (⌘B)"
                    aria-label="Toggle Sidebar"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M9 3v18" />
                    </svg>
                  </button>
                )}
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                <span>CANVAS • NATURAL LANGUAGE SOLVER</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCommandPaletteOpen(true)}
                  className="text-xs font-mono bg-[var(--surface-subtle)] dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2.5 py-1 rounded-md border border-[var(--border)] dark:border-slate-700 transition flex items-center gap-1.5 shadow-sm"
                  title="Search 487 calculators or switch sheets (/ or Cmd + K)"
                >
                  <svg className="w-3 h-3 text-emerald-500 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Search</span>
                  <kbd className="px-2 py-0.5 text-xs font-mono bg-[var(--surface-subtle)] dark:bg-slate-950 border border-[var(--border)] dark:border-slate-700/80 rounded text-slate-600 dark:text-slate-400 inline-flex items-center shadow-sm">
                    /
                  </kbd>
                </button>
                <button
                  type="button"
                  onClick={() => setShowHistory(!showHistory)}
                  className={`text-xs font-mono px-2.5 py-1 rounded-md border transition flex items-center gap-1.5 ${showHistory
                    ? 'bg-emerald-500/10 dark:bg-emerald-950/60 border-emerald-500/40 dark:border-emerald-500/50 text-emerald-600 dark:text-emerald-300'
                    : 'bg-[var(--surface-subtle)] dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-[var(--border)] dark:border-slate-700'
                    }`}
                >
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>History</span>
                  {historyList.length > 0 && (
                    <span className="text-xs bg-emerald-100 dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-300 dark:border-emerald-500/30">
                      {historyList.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClearClick}
                  className="text-xs font-mono bg-[var(--surface-subtle)] dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2.5 py-1 rounded-md border border-[var(--border)] dark:border-slate-700 transition"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Quick Inserts Toolbar */}
            <div className="mb-3 flex flex-wrap items-center gap-1.5 text-xs font-mono shrink-0">
              <span className="text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">Quick Inserts:</span>

              <button
                type="button"
                onClick={() => appendSyntax('total')}
                className="px-2.5 py-1 rounded-md bg-[#e2e8f0] dark:bg-slate-800 hover:bg-[#d0d9e2] dark:hover:bg-slate-700 text-emerald-500 dark:text-emerald-400 border border-[#cbd5e1] dark:border-slate-700 transition text-xs font-mono"
              >
                + total
              </button>

              <button
                type="button"
                onClick={() => appendSyntax('discount 10%')}
                className="px-2.5 py-1 rounded-md bg-[#e2e8f0] dark:bg-slate-800 hover:bg-[#d0d9e2] dark:hover:bg-slate-700 text-amber-500 dark:text-amber-400 border border-[#cbd5e1] dark:border-slate-700 transition text-xs font-mono"
              >
                + discount
              </button>

              <button
                type="button"
                onClick={() => appendSyntax('tax 18%')}
                className="px-2.5 py-1 rounded-md bg-[#e2e8f0] dark:bg-slate-800 hover:bg-[#d0d9e2] dark:hover:bg-slate-700 text-cyan-500 dark:text-cyan-400 border border-[#cbd5e1] dark:border-slate-700 transition text-xs font-mono"
              >
                + tax
              </button>

              {/* Split Bill Trigger + Inline Stepper */}
              {!showSplitInput ? (
                <button
                  type="button"
                  onClick={() => setShowSplitInput(true)}
                  className="px-2.5 py-1 rounded-md bg-[#e2e8f0] dark:bg-slate-800 hover:bg-[#d0d9e2] dark:hover:bg-slate-700 text-purple-500 dark:text-purple-400 border border-[#cbd5e1] dark:border-slate-700 transition text-xs font-mono"
                >
                  + split bill
                </button>
              ) : (
                <div className="flex items-center gap-1.5 bg-[#e2e8f0] dark:bg-slate-800 px-2 py-0.5 rounded-md border border-[#cbd5e1] dark:border-purple-500/40">
                  <span className="text-xs text-purple-600 dark:text-purple-400 font-mono">People:</span>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={splitCount}
                    onChange={(e) => setSplitCount(parseInt(e.target.value, 10) || 1)}
                    className="w-10 bg-[#f3f6f9] dark:bg-slate-950 text-center text-xs text-slate-900 dark:text-white border border-[#cbd5e1] dark:border-slate-700 rounded px-1 py-0.5 focus:outline-none focus:border-purple-400 font-mono"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleApplySplit}
                    className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-2 py-0.5 rounded font-semibold transition"
                  >
                    Insert
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSplitInput(false)}
                    className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-xs px-1"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Vertical divider line */}
              <span className="text-slate-400 dark:text-slate-700 text-xs select-none">|</span>

              {/* Pre-Built Canvas Templates Button */}
              <button
                type="button"
                onClick={() => setIsTemplatesModalOpen(true)}
                className="px-2.5 py-1 text-xs font-mono rounded bg-[var(--surface-subtle)] hover:bg-[#d0d9e2] dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-[var(--border)] dark:border-slate-700 transition flex items-center gap-1.5 shadow-sm"
                title="Browse Calculation Recipe Templates"
              >
                + templates
              </button>
            </div>

            {/* Multi-Tab Workspace Strip */}
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-[calc(100%-140px)]">
                {tabs.map((tab) => {
                  const isActive = tab.id === activeTabId;
                  const isEditing = editingTabId === tab.id;
                  return (
                    <div
                      key={tab.id}
                      onClick={() => setActiveTabId(tab.id)}
                      onDoubleClick={() => startRenameTab(tab)}
                      className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-mono transition-all cursor-pointer border select-none ${
                        isActive
                          ? 'bg-[var(--surface-subtle)] dark:bg-slate-800 text-slate-900 dark:text-white border-emerald-500/50 shadow-sm'
                          : 'bg-slate-200/50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-[var(--surface-subtle)] dark:hover:bg-slate-800/50 border-[var(--border)] dark:border-slate-800'
                      }`}
                    >
                      {/* Active Tab Indicator */}
                      <span
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          isActive ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-transparent'
                        }`}
                      />

                      {/* Title or Inline Edit Input */}
                      {isEditing ? (
                        <input
                          type="text"
                          value={tempTabTitle}
                          onChange={(e) => setTempTabTitle(e.target.value)}
                          onBlur={() => saveRenameTab(tab.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveRenameTab(tab.id);
                            if (e.key === 'Escape') setEditingTabId(null);
                          }}
                          className="w-24 bg-slate-950 border border-emerald-500 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="truncate max-w-[120px] font-medium" title={tab.title}>
                          {tab.title}
                        </span>
                      )}

                      {/* Pencil to rename */}
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={(e) => startRenameTab(tab, e)}
                          title="Rename Sheet"
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-emerald-400 transition text-xs"
                        >
                          ✎
                        </button>
                      )}

                      {/* Close tab button (✕) with guard preventing deleting the last tab */}
                      {tabs.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => handleCloseTab(tab.id, e)}
                          title="Close Sheet"
                          className="text-slate-500 hover:text-rose-400 opacity-60 hover:opacity-100 transition text-xs ml-0.5"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* + New Sheet Button */}
                <button
                  type="button"
                  onClick={handleNewTab}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-subtle)] dark:bg-slate-900/60 hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 border border-dashed border-[var(--border)] dark:border-slate-700 hover:border-emerald-500/50 transition text-xs sm:text-sm font-mono shrink-0"
                >
                  <span className="text-emerald-500 dark:text-emerald-400 font-bold">+</span>
                  <span>New Sheet</span>
                </button>
              </div>

              <div className="text-xs font-mono text-slate-500 shrink-0">
                Sheet {tabs.findIndex((t) => t.id === activeTabId) + 1} of {tabs.length}
              </div>
            </div>

            {/* Technical Dot-Grid Canvas Notepad */}
            <div
              className="relative flex-1 w-full rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--surface)] shadow-xl flex flex-col transition-colors duration-200"
              style={{
                backgroundImage: 'radial-gradient(circle, var(--canvas-dot) 1px, transparent 1px)',
                backgroundSize: '16px 24px',
                backgroundPosition: '16px 16px',
              }}
            >
              <textarea
                value={canvasCode}
                onChange={(e) => setCanvasCode(e.target.value)}
                placeholder="Start Calculating"
                className="w-full flex-1 bg-transparent border-none text-xs font-mono leading-[24px] text-emerald-500 dark:text-emerald-400 focus:outline-none placeholder-slate-400 dark:placeholder-slate-600 resize-none selection:bg-emerald-500/20 p-4"
                style={{
                  lineHeight: '24px',
                  fontSize: '12px',
                }}
                spellCheck={false}
              />
            </div>

            <div className="pt-2.5 text-xs font-mono text-slate-500 flex justify-between items-center shrink-0">
              <span>Section B • Zero-Friction Input</span>
              <span>Lines: {canvasCode.split('\n').length}</span>
            </div>
          </section>

          {/* Transparent Backdrop to Dismiss on Canvas Click */}
          {showHistory && (
            <div
              className="absolute inset-0 z-20"
              onClick={() => setShowHistory(false)}
            />
          )}

          {/* Slide-over History Drawer */}
          {showHistory && (
            <div className="absolute inset-y-0 right-76 w-80 bg-[#121720]/95 backdrop-blur-md border-l border-slate-800 shadow-2xl z-30 p-4 sm:p-5 flex flex-col">
              <div>
                <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider">
                      Calculation History
                    </span>
                  </div>
                  {/* Keyboard-styled ESC Close Button */}
                  <button
                    type="button"
                    onClick={() => setShowHistory(false)}
                    className="group flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 transition text-xs font-mono"
                  >
                    <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-slate-800 border border-slate-600 rounded text-slate-400 group-hover:text-slate-200">
                      esc
                    </kbd>
                    <span className="text-slate-400 group-hover:text-slate-200">Exit</span>
                  </button>
                </div>

                <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
                  {historyList.length === 0 ? (
                    <div className="text-center text-slate-500 text-xs py-10 font-mono">
                      No saved sheets yet.<br />Calculations save on Clear.
                    </div>
                  ) : (
                    historyList.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => restoreHistory(item)}
                        className="p-3 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 rounded-lg cursor-pointer transition group"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-mono text-slate-500">{item.timestamp}</span>
                          <button
                            type="button"
                            onClick={(e) => deleteHistoryItem(item.id, e)}
                            className="text-xs text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition"
                          >
                            Delete
                          </button>
                        </div>
                        <div className="text-sm font-mono text-emerald-400 font-bold truncate">
                          {item.totalDisplay}
                        </div>
                        <div className="mt-1.5" onClick={(e) => e.stopPropagation()}>
                          {editingHistoryId === item.id ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={tempHistoryTag}
                                onChange={(e) => setTempHistoryTag(e.target.value)}
                                placeholder="add tag..."
                                className="w-full bg-slate-950 border border-emerald-500/50 rounded-md px-2 py-0.5 text-xs font-mono text-white focus:outline-none"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveHistoryTag(item.id);
                                  if (e.key === 'Escape') setEditingHistoryId(null);
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveHistoryTag(item.id)}
                                className="text-xs bg-emerald-700 hover:bg-emerald-600 text-white px-2 py-0.5 rounded font-mono font-semibold"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingHistoryId(item.id);
                                setTempHistoryTag(item.title || '');
                              }}
                              className="group/tag flex items-center gap-1.5 text-xs font-mono text-left transition"
                            >
                              <svg
                                className={`w-3 h-3 shrink-0 ${item.title ? 'text-emerald-400' : 'text-slate-500 group-hover/tag:text-slate-400'
                                  }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                                />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                              </svg>
                              <span
                                className={`truncate ${item.title
                                  ? 'text-white font-medium group-hover/tag:text-emerald-300'
                                  : 'text-slate-500 group-hover/tag:text-slate-300'
                                  }`}
                              >
                                {item.title || 'add tag'}
                              </span>
                              <span className="opacity-0 group-hover/tag:opacity-100 text-xs text-slate-400">✎</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Section C: Live Structured Receipt */}
          <aside className="w-76 min-w-[290px] max-w-[315px] bg-[var(--surface)] p-3.5 sm:p-4 flex flex-col justify-between shrink-0 overflow-y-auto border-l border-[var(--border)] transition-colors duration-200">
            <div>
              <div className="flex justify-between items-center mb-3.5 pb-2.5 border-b border-[var(--border)]">
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">
                  Live Receipt
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--surface-subtle)] dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-[var(--border)] dark:border-slate-700 uppercase font-semibold">
                  {canvasReceipt.variables.length} Items
                </span>
              </div>

              {/* Top Hero Output Display */}
              {calculatorOutput?.primaryOutput ? (
                <div className="mb-4 py-2.5 px-3.5 rounded-xl border bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/30 dark:border-emerald-500/40 flex flex-col justify-center gap-1 relative shadow-md">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider block text-emerald-700 dark:text-emerald-400 font-semibold truncate">
                      {calculatorOutput.primaryOutput.label}
                    </span>

                    {/* Compact Currency Toggle Pill */}
                    <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setShowCurrencyMenu((prev) => !prev)}
                        className="flex items-center gap-1 py-0.5 px-2 rounded-full bg-[var(--surface-subtle)] dark:bg-slate-900/90 hover:bg-slate-200/80 dark:hover:bg-slate-800 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 border border-[var(--border)] dark:border-slate-700/80 hover:border-emerald-500/50 transition cursor-pointer shadow-sm active:scale-95"
                        title="Toggle currency conversion"
                      >
                        <span className="font-semibold">{displayCurrency}</span>
                        <span className="text-[10px] text-slate-400">▾</span>
                      </button>

                      {showCurrencyMenu && (
                        <div className="absolute right-0 top-full mt-1.5 w-36 bg-[var(--surface)] dark:bg-[#0e131b] border border-[var(--border)] dark:border-slate-700 rounded-lg shadow-2xl py-1 z-40 font-mono text-xs">
                          {Object.entries(BENCHMARK_RATES).map(([code, info]) => (
                            <button
                              key={code}
                              type="button"
                              onClick={() => {
                                setDisplayCurrency(code);
                                setShowCurrencyMenu(false);
                              }}
                              className={`w-full text-left px-3 py-1.5 flex items-center justify-between text-xs hover:bg-[var(--surface-subtle)] dark:hover:bg-slate-800/80 transition ${
                                displayCurrency === code
                                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 dark:bg-emerald-950/40'
                                  : 'text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <span>{info.label}</span>
                              {displayCurrency === code && <span className="text-emerald-600 dark:text-emerald-400 text-xs">✓</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight break-all text-slate-900 dark:text-white">
                    {calculatorOutput.primaryOutput.prefix || ''}
                    {calculatorOutput.primaryOutput.value}
                    {calculatorOutput.primaryOutput.suffix || ''}
                  </div>

                  {/* Converted Currency Sub-Value */}
                  {convertedHeroAmount && getCurrencyCodeFromSymbol(calculatorOutput.primaryOutput.prefix || '$') !== displayCurrency && (
                    <div className="text-[11px] sm:text-xs font-mono text-emerald-300 font-medium tracking-tight">
                      {convertedHeroAmount}
                    </div>
                  )}
                </div>
              ) : canvasReceipt.lastResult && !canvasReceipt.lastResult.isError ? (
                <div
                  className={`mb-4 py-2.5 px-3.5 rounded-xl border transition-colors flex flex-col justify-center gap-1 relative shadow-md ${isHeroSplit
                    ? 'bg-purple-500/10 dark:bg-purple-950/40 border-purple-500/30 dark:border-purple-500/40'
                    : 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/30 dark:border-emerald-500/40'
                    }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider block font-semibold truncate ${isHeroSplit ? 'text-purple-700 dark:text-purple-300' : 'text-emerald-700 dark:text-emerald-400'
                        }`}
                    >
                      {canvasReceipt.lastResult.name}
                    </span>

                    {/* Compact Currency Toggle Pill */}
                    <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setShowCurrencyMenu((prev) => !prev)}
                        className="flex items-center gap-1 py-0.5 px-2 rounded-full bg-[var(--surface-subtle)] dark:bg-slate-900/90 hover:bg-slate-200/80 dark:hover:bg-slate-800 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 border border-[var(--border)] dark:border-slate-700/80 hover:border-emerald-500/50 transition cursor-pointer shadow-sm active:scale-95"
                        title="Toggle currency conversion"
                      >
                        <span className="font-semibold">{displayCurrency}</span>
                        <span className="text-[10px] text-slate-400">▾</span>
                      </button>

                      {showCurrencyMenu && (
                        <div className="absolute right-0 top-full mt-1.5 w-36 bg-[var(--surface)] dark:bg-[#0e131b] border border-[var(--border)] dark:border-slate-700 rounded-lg shadow-2xl py-1 z-40 font-mono text-xs">
                          {Object.entries(BENCHMARK_RATES).map(([code, info]) => (
                            <button
                              key={code}
                              type="button"
                              onClick={() => {
                                setDisplayCurrency(code);
                                setShowCurrencyMenu(false);
                              }}
                              className={`w-full text-left px-3 py-1.5 flex items-center justify-between text-xs hover:bg-[var(--surface-subtle)] dark:hover:bg-slate-800/80 transition ${
                                displayCurrency === code
                                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40'
                                  : 'text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <span>{info.label}</span>
                              {displayCurrency === code && <span className="text-emerald-600 dark:text-emerald-400 text-xs">✓</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    className={`text-xl sm:text-2xl font-bold font-mono tracking-tight break-all ${isHeroSplit ? 'text-purple-700 dark:text-purple-200' : 'text-slate-900 dark:text-white'
                      }`}
                  >
                    {canvasReceipt.lastResult.formattedValue}
                  </div>

                  {/* Converted Currency Sub-Value */}
                  {convertedHeroAmount && getCurrencyCodeFromSymbol(canvasReceipt.detectedCurrency || '$') !== displayCurrency && (
                    <div className="text-[11px] sm:text-xs font-mono text-emerald-300 font-medium tracking-tight">
                      {convertedHeroAmount}
                    </div>
                  )}
                </div>
              ) : null}

              {/* Canonical Statement Breakdown */}
              <div className="space-y-1.5 font-mono">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
                    Statement Breakdown
                  </span>
                  <span className="text-[10px] font-mono tracking-wider text-slate-500">Auto-Reordered</span>
                </div>

                {canvasReceipt.variables.length === 0 ? (
                  <div className="p-4 text-center border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs">
                    Type items in Section B (e.g. ticket 450).
                  </div>
                ) : (
                  canvasReceipt.variables.map((v) => {
                    const isDeduction = v.type === 'deduction';
                    const isTax = v.type === 'addition';
                    const isSummary = v.type === 'summary';
                    const isModifier = v.type === 'modifier';
                    const isBase = v.type === 'base';

                    return (
                      <div
                        key={v.id}
                        className={`py-1.5 px-2.5 rounded-lg border transition flex flex-col gap-0.5 ${v.isError
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                          : isSummary
                            ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/40 dark:border-emerald-500/50 font-semibold'
                            : isModifier
                              ? 'bg-purple-500/10 dark:bg-purple-950/30 border-purple-500/30 dark:border-purple-500/40 text-purple-700 dark:text-purple-200'
                              : isDeduction
                                ? 'bg-amber-500/10 dark:bg-amber-950/20 border-amber-500/30'
                                : isTax
                                  ? 'bg-cyan-500/10 dark:bg-cyan-950/20 border-cyan-500/30'
                                  : 'bg-[var(--surface-subtle)] dark:bg-slate-900/60 border-[var(--border)] dark:border-slate-800/80 text-slate-700 dark:text-slate-300'
                          }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span
                              className={`text-xs font-mono font-medium truncate ${
                                isDeduction
                                  ? 'text-amber-500 dark:text-amber-400'
                                  : isTax
                                    ? 'text-cyan-500 dark:text-cyan-400'
                                    : isSummary
                                      ? 'text-emerald-500 dark:text-emerald-400 font-bold'
                                      : isModifier
                                        ? 'text-purple-500 dark:text-purple-300'
                                        : 'text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {v.name}
                            </span>
                            {v.calculatorSlug && (
                              <Link
                                href={`/${v.calculatorCategory || 'finance-business'}/${v.calculatorSlug}?params=${encodeURIComponent(
                                  JSON.stringify(v.initialParams || {})
                                )}${
                                  v.initialParams
                                    ? '&' +
                                      Object.entries(v.initialParams)
                                        .filter(([, val]) => val !== undefined && val !== null)
                                        .map(([k, val]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(val))}`)
                                        .join('&')
                                    : ''
                                }`}
                                title="Open Full Calculator"
                                aria-label="Open Full Calculator"
                                className="inline-flex items-center justify-center text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/60 px-1 py-0.5 rounded transition text-[11px] font-bold leading-none shrink-0 border border-emerald-500/30 hover:border-emerald-500/60"
                              >
                                ↗
                              </Link>
                            )}
                          </div>
                          <span
                            className={`font-mono ${isSummary ? 'text-sm font-bold text-emerald-600 dark:text-emerald-400' : 'text-xs font-medium'} ${isDeduction
                              ? 'text-amber-600 dark:text-amber-400'
                              : isTax
                                ? 'text-cyan-600 dark:text-cyan-400'
                                : isSummary
                                  ? ''
                                  : isModifier
                                    ? 'text-purple-600 dark:text-purple-300'
                                    : 'text-slate-900 dark:text-white'
                              }`}
                          >
                            {v.formattedValue}
                          </span>
                        </div>

                        {/* Editable Note: Exclusively on Base Items */}
                        {isBase && (
                          <div className="mt-0.5">
                            {editingNoteId === v.id ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={tempNoteText}
                                  onChange={(e) => setTempNoteText(e.target.value)}
                                  placeholder="Add or edit note..."
                                  className="w-full bg-slate-950 border border-emerald-500/50 rounded px-1.5 py-0.5 text-[10px] text-white focus:outline-none font-mono"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveNote(v);
                                    if (e.key === 'Escape') setEditingNoteId(null);
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveNote(v)}
                                  className="text-[10px] bg-emerald-700 hover:bg-emerald-600 text-white px-1.5 py-0.5 rounded font-semibold"
                                >
                                  Save
                                </button>
                              </div>
                            ) : v.note ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingNoteId(v.id);
                                  setTempNoteText(v.note || '');
                                }}
                                title="Click to edit note"
                                className="group/note text-[10px] text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/40 px-1.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1 transition"
                              >
                                <svg
                                  className="w-2.5 h-2.5 text-emerald-400 shrink-0"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                                  />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                                </svg>
                                <span>{v.note}</span>
                                <span className="opacity-0 group-hover/note:opacity-100 text-[10px] text-slate-400 ml-0.5">✎</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingNoteId(v.id);
                                  setTempNoteText('');
                                }}
                                className="text-[10px] text-slate-500 hover:text-slate-300 font-mono transition"
                              >
                                + add note
                              </button>
                            )}
                          </div>
                        )}

                      </div>
                    );
                  })
                )}
              </div>

              {/* Dedicated Calculation Metrics Block */}
              {calculatorOutput?.secondaryMetrics && calculatorOutput.secondaryMetrics.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 font-mono">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
                      Calculation Metrics
                    </span>
                    <span className="text-[10px] text-emerald-500 font-mono">Library Linked</span>
                  </div>
                  <div className="space-y-1.5">
                    {calculatorOutput.secondaryMetrics.map((metric, idx) => (
                      <div
                        key={idx}
                        className="py-1.5 px-2.5 rounded-lg border border-slate-800/80 bg-slate-900/60 flex justify-between items-center gap-2 text-xs"
                      >
                        <span className="text-slate-400 flex-1 min-w-0 pr-1 truncate text-xs">
                          {metric.label}
                        </span>
                        <span className="font-semibold text-slate-200 shrink-0 text-right whitespace-nowrap text-xs">
                          {metric.prefix || ''}
                          {metric.value}
                          {metric.suffix ? ` ${metric.suffix}` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Action Footer */}
            <div className="pt-3.5 border-t border-[var(--border)] dark:border-slate-800/80 space-y-2.5">
              <div className="flex items-center gap-1.5">
                {/* Copy Receipt Button with Reactive State */}
                <button
                  type="button"
                  onClick={handleCopyReceipt}
                  disabled={canvasReceipt.variables.length === 0 && !calculatorOutput}
                  className={`flex-initial shrink-0 py-2 px-2 rounded-lg font-mono text-[11px] font-medium border transition flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] ${
                    isCopied
                      ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300'
                      : 'bg-[var(--surface-subtle)] hover:bg-slate-200/80 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-700 dark:text-white border-[var(--border)] dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--surface-subtle)] disabled:hover:border-[var(--border)]'
                  }`}
                  title="Copy formatted markdown receipt to clipboard"
                >
                  {isCopied ? (
                    <>
                      <span className="text-emerald-400 font-bold text-xs leading-none">✓</span>
                      <span className="text-emerald-300 font-semibold whitespace-nowrap">Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.75"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="whitespace-nowrap">Copy Receipt</span>
                    </>
                  )}
                </button>

                {/* Download Button with Format Selector Dropdown */}
                <div className="relative flex-1 flex min-w-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => handleDownloadReceipt(downloadFormat)}
                    disabled={canvasReceipt.variables.length === 0 && !calculatorOutput}
                    className="flex-1 min-w-0 py-2 px-2 rounded-l-lg bg-[var(--surface-subtle)] hover:bg-slate-200/80 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-700 dark:text-white font-mono text-[11px] font-medium border border-r-0 border-[var(--border)] dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 transition flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--surface-subtle)] disabled:hover:border-[var(--border)]"
                    title={`Download ${downloadFormat.toUpperCase()} Receipt`}
                  >
                    <svg
                      className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.75"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    <span className="whitespace-nowrap">Download ({downloadFormat.toUpperCase()})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowDownloadMenu((prev) => !prev)}
                    disabled={canvasReceipt.variables.length === 0 && !calculatorOutput}
                    className="px-1.5 py-2 rounded-r-lg bg-[var(--surface-subtle)] hover:bg-slate-200/80 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-mono text-[11px] font-medium border border-[var(--border)] dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 transition flex items-center justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--surface-subtle)] disabled:hover:border-[var(--border)] shrink-0"
                    title="Choose download format (.txt or .csv)"
                  >
                    <span className="text-[10px]">▾</span>
                  </button>

                  {showDownloadMenu && (
                    <div className="absolute right-0 bottom-full mb-1.5 w-44 bg-[var(--surface)] dark:bg-[#0e131b] border border-[var(--border)] dark:border-slate-700 rounded-lg shadow-2xl py-1 z-40 font-mono text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setDownloadFormat('txt');
                          setShowDownloadMenu(false);
                          handleDownloadReceipt('txt');
                        }}
                        className={`w-full text-left px-2.5 py-1.5 flex items-center justify-between text-xs hover:bg-[var(--surface-subtle)] dark:hover:bg-slate-800/80 transition ${
                          downloadFormat === 'txt' ? 'text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 dark:bg-emerald-950/40' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-xs">Text (.txt)</span>
                          <span className="text-[10px] text-slate-500">ASCII Thermal Slip</span>
                        </div>
                        {downloadFormat === 'txt' && <span className="text-emerald-600 dark:text-emerald-400 text-xs">✓</span>}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setDownloadFormat('csv');
                          setShowDownloadMenu(false);
                          handleDownloadReceipt('csv');
                        }}
                        className={`w-full text-left px-2.5 py-1.5 flex items-center justify-between text-xs hover:bg-[var(--surface-subtle)] dark:hover:bg-slate-800/80 transition ${
                          downloadFormat === 'csv' ? 'text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 dark:bg-emerald-950/40' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-xs">CSV (.csv)</span>
                          <span className="text-[10px] text-slate-500">Spreadsheet Table</span>
                        </div>
                        {downloadFormat === 'csv' && <span className="text-emerald-600 dark:text-emerald-400 text-xs">✓</span>}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-[11px] font-mono text-slate-500 text-center">
                Section C • Instant Calculation Ledger
              </div>
            </div>
          </aside>
        </div>

      {/* Global Cmd + K Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={(tabId) => {
          setActiveTabId(tabId);
          setIsCommandPaletteOpen(false);
        }}
        onSelectTemplate={(tpl) => {
          handleSelectTemplate(tpl);
          setIsCommandPaletteOpen(false);
        }}
      />

      {/* Contextual Calculation Templates Modal */}
      <TemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onInsertActive={handleInsertTemplateActive}
        onOpenNewSheet={handleOpenTemplateInNewSheet}
      />
    </div>
  );
}