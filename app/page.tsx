'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { masterCategories } from '@/lib/categories';
import { allCalculators } from '@/lib/calculators';
import { executeCanvasScript, EvaluatedVariable, formatAmount } from '@/lib/canvasEngine';
import CommandPalette from '@/components/CommandPalette';
import TemplatesModal from '@/components/TemplatesModal';
import DownloadModal from '@/components/DownloadModal';
import ThemeToggle from '@/components/ThemeToggle';
import { CANVAS_TEMPLATES, CanvasTemplate } from '@/lib/canvasTemplates';
import { useSidebar } from '@/components/layout/AppShell';
import { matchesCalculator } from '@/lib/searchEngine';
import { CanvasModeIcon, LibraryModeIcon, SidebarToggleIcon } from '@/components/layout/AppSidebar';
import { ShareLinkIcon, HistoryHourglassIcon, ClearTrashIcon } from '@/components/icons/ToolbarIcons';
import LZString from 'lz-string';
import { encodeCanvasState, decodeCanvasState } from '@/lib/urlSnapshot';

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

interface AiSolverResult {
  isSolvable: boolean;
  problemType?: string;
  title: string;
  answer: string;
  steps: string;
  matchedCalculatorSlug?: string | null;
  matchedCalculatorCategory?: string | null;
  error?: string;
}

// In-Memory Client Cache (0ms instant response for previously queried questions)
const clientSolveCache = new Map<string, AiSolverResult>();

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
  const router = useRouter();
  const {
    isSidebarOpen,
    setIsSidebarOpen,
    setIsMobileDrawerOpen,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    isShortcutsModalOpen,
    setIsShortcutsModalOpen,
  } = useSidebar();
  const [activeMode, setActiveMode] = useState<'canvas' | 'library'>('canvas');
  const mode = activeMode;
  const setMode = useCallback((newMode: 'canvas' | 'library') => {
    setActiveMode(newMode);
    if (newMode === 'library') {
      router.push('/library');
    }
  }, [router]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [mobileTab, setMobileTab] = useState<'canvas' | 'receipt'>('canvas');

  // Phase 2: Live Receipt & Export State
  const [isCopied, setIsCopied] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<'txt' | 'csv'>('txt');
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [displayCurrency, setDisplayCurrency] = useState<string>('USD');
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [showTemplatesMenu, setShowTemplatesMenu] = useState(false);

  // Contextual Templates Modal State
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const isTemplatesModalOpen = isTemplatesOpen;
  const setIsTemplatesModalOpen = setIsTemplatesOpen;

  // Split bill input expansion state
  const [showSplitInput, setShowSplitInput] = useState(false);
  const [splitCount, setSplitCount] = useState<number>(3);

  // Calculation History Centered Modal State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const showHistory = isHistoryOpen;
  const setShowHistory = setIsHistoryOpen;
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);

  // Clear Confirmation / Tagging Modal State
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearSheetTag, setClearSheetTag] = useState('');
  const modalInputRef = useRef<HTMLInputElement>(null);

  // Multi-Tab Canvas Workspace State
  const [tabs, setTabs] = useState<CanvasTab[]>([
    {
      id: 'tab-1',
      title: 'Untitled Sheet',
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
    script?: string;
  } | null>(null);

  // Share URL Snapshot State
  const [isSharedCopied, setIsSharedCopied] = useState(false);
  const shareTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  useEffect(() => {
    return () => {
      if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // AI Hybrid Solver Tier 2 State
  const [aiResult, setAiResult] = useState<AiSolverResult | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Active Tab and Canvas Code derivation
  const activeTab = useMemo(() => {
    return tabs.find((t) => t.id === activeTabId) || tabs[0];
  }, [tabs, activeTabId]);

  const canvasCode = activeTab ? activeTab.content : '';
  const canvasText = canvasCode;
  const activeSheetText = canvasCode;
  const hasCanvasContent = activeSheetText.trim().length > 0;

  const setActiveSheetText = (updater: string | ((prev: string) => string)) => {
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
  const setCanvasCode = setActiveSheetText;

  // 1. Hydrate from URL Hash Snapshot (#c=...) or LocalStorage on mount
  useEffect(() => {
    let hashDecompressed: string | null = null;
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.startsWith('#c=')) {
        const payload = hash.slice(3);
        const decompressed = LZString.decompressFromEncodedURIComponent(payload);
        if (decompressed) {
          hashDecompressed = decompressed;
        }
      }
    }

    try {
      const savedTabsData = localStorage.getItem('solvehub_canvas_tabs_v1');
      if (hashDecompressed) {
        // Hydrate active canvas with decoded snapshot
        if (savedTabsData) {
          const parsed = JSON.parse(savedTabsData);
          if (parsed && Array.isArray(parsed.tabs) && parsed.tabs.length > 0) {
            const activeId = parsed.activeTabId || parsed.tabs[0].id;
            const updatedTabs = parsed.tabs.map((t: CanvasTab) =>
              t.id === activeId ? { ...t, content: hashDecompressed! } : t
            );
            setTabs(updatedTabs);
            setActiveTabId(activeId);
          } else {
            setTabs([
              {
                id: 'tab-1',
                title: 'Shared Sheet',
                content: hashDecompressed,
                createdAt: Date.now(),
              },
            ]);
            setActiveTabId('tab-1');
          }
        } else {
          setTabs([
            {
              id: 'tab-1',
              title: 'Shared Sheet',
              content: hashDecompressed,
              createdAt: Date.now(),
            },
          ]);
          setActiveTabId('tab-1');
        }
        setActiveSheetText(hashDecompressed);
      } else {
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
                title: 'Untitled Sheet',
                content: savedActive,
                createdAt: Date.now(),
              },
            ]);
          }
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

  // Listen for in-app hash updates (#c=...)
  useEffect(() => {
    const handleHashChange = () => {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash;
        if (hash.startsWith('#c=')) {
          const payload = hash.slice(3);
          const decompressed = LZString.decompressFromEncodedURIComponent(payload);
          if (decompressed) {
            setActiveSheetText(decompressed);
          }
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
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
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [hasTabOverflow, setHasTabOverflow] = useState(false);

  const checkTabOverflow = () => {
    if (tabsContainerRef.current) {
      const { scrollWidth, clientWidth } = tabsContainerRef.current;
      setHasTabOverflow(scrollWidth > clientWidth + 4);
    }
  };

  useEffect(() => {
    checkTabOverflow();
    const handleResize = () => checkTabOverflow();
    window.addEventListener('resize', handleResize);
    const el = tabsContainerRef.current;
    if (!el) return () => window.removeEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      checkTabOverflow();
    });
    resizeObserver.observe(el);

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, [tabs]);

  const handleScrollTabsNext = () => {
    if (tabsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        tabsContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        tabsContainerRef.current.scrollBy({ left: 160, behavior: 'smooth' });
      }
    }
  };

  const handleNewTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab: CanvasTab = {
      id: newId,
      title: 'Untitled Sheet',
      content: '',
      createdAt: Date.now(),
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
    setTimeout(() => {
      if (tabsContainerRef.current) {
        tabsContainerRef.current.scrollTo({ left: tabsContainerRef.current.scrollWidth, behavior: 'smooth' });
      }
    }, 50);
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
  // Auto-scroll active tab into view in tab strip
  useEffect(() => {
    if (!tabsContainerRef.current) return;
    const activeEl = tabsContainerRef.current.querySelector<HTMLElement>('[data-active-tab="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [activeTabId]);
  const canvasReceipt = useMemo(() => {
    return executeCanvasScript(canvasCode, displayCurrency);
  }, [canvasCode, displayCurrency]);

  // Determine if calculatorOutput is active and valid for the current canvas script
  const isCalculatorOutputActive = useMemo(() => {
    if (!calculatorOutput?.primaryOutput) return false;
    // If output has an associated script, it's ONLY valid if active canvas matches it exactly
    if (calculatorOutput.script) {
      if (canvasCode.trim() !== calculatorOutput.script.trim()) {
        return false;
      }
    }
    // If user's script contains explicit total statements or splits, canvas takes precedence
    if (canvasReceipt.hasTotal || canvasReceipt.splitResult) {
      return false;
    }
    return true;
  }, [calculatorOutput, canvasCode, canvasReceipt]);

  const secondaryMetricsToDisplay = useMemo(() => {
    if (canvasReceipt.portfolioMetrics && canvasReceipt.portfolioMetrics.length > 0) {
      return canvasReceipt.portfolioMetrics;
    }
    // If financingItems exist, they are displayed directly in their dedicated card beneath cart total
    if (canvasReceipt.financingItems && canvasReceipt.financingItems.length > 0) {
      return [];
    }
    if (canvasReceipt.customMetrics && canvasReceipt.customMetrics.length > 0) {
      return canvasReceipt.customMetrics;
    }
    if (isCalculatorOutputActive && calculatorOutput?.secondaryMetrics && calculatorOutput.secondaryMetrics.length > 0) {
      return calculatorOutput.secondaryMetrics;
    }
    return [];
  }, [canvasReceipt, isCalculatorOutputActive, calculatorOutput]);

  const hasReceiptItems = useMemo(() => {
    return canvasReceipt.variables.length > 0 || Boolean(canvasReceipt.financingItems && canvasReceipt.financingItems.length > 0);
  }, [canvasReceipt]);

  const totalReceiptItemCount = useMemo(() => {
    return canvasReceipt.variables.length + (canvasReceipt.financingItems ? canvasReceipt.financingItems.length : 0);
  }, [canvasReceipt]);

  // Natural Language & Word Problem Detection for AI Hybrid Solver
  const isNaturalLanguageQuestion = useMemo(() => {
    const trimmed = canvasCode.trim();
    if (!trimmed) return false;

    const lower = trimmed.toLowerCase();
    const words = trimmed.split(/\s+/).filter(Boolean);

    // Explicit question mark indicator
    const hasQuestionMark = lower.includes('?');

    // Key mathematical & word problem keywords
    const triggerKeywords = [
      'find',
      'which',
      'what',
      'how',
      'why',
      'sequence',
      'pattern',
      'increased by',
      'decreased by',
      'bottles',
      'bottle',
      'budget',
      'predict',
      'outlier',
      'odd one out',
      'next number',
      'solve',
      'algebra',
      'equation',
      'permutation',
      'probability',
      'tare weight',
      'age gap',
    ];

    const hasTriggerKeyword = triggerKeywords.some((kw) => {
      if (kw.includes(' ')) {
        return lower.includes(kw);
      }
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      return regex.test(lower);
    });

    // When text has >5 words and yields no valid ledger numbers
    const isWordyWithoutLedger = words.length > 5 && !hasReceiptItems;

    return hasQuestionMark || hasTriggerKeyword || isWordyWithoutLedger;
  }, [canvasCode, hasReceiptItems]);

  // Hybrid AI Solver Orchestration (debounced 200ms with AbortController & 0ms client-side instant cache)
  useEffect(() => {
    if (!isNaturalLanguageQuestion) {
      setIsAiLoading(false);
      setAiResult(null);
      setAiError(null);
      return;
    }

    const query = canvasCode.trim();
    if (!query) return;

    const normalizedKey = query.toLowerCase();
    const cachedResult = clientSolveCache.get(normalizedKey);
    if (cachedResult) {
      setAiResult(cachedResult);
      setAiError(null);
      setIsAiLoading(false);
      return;
    }

    setIsAiLoading(true);
    setAiError(null);

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/solve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errPayload = await res.json().catch(() => ({}));
          setAiResult({
            isSolvable: false,
            title: errPayload.title || "Solver Notice",
            answer: errPayload.answer || "Could not evaluate",
            steps: errPayload.steps || errPayload.error || "The service is temporarily unavailable. Please retry in a moment.",
            error: errPayload.error || "SERVICE_NOTICE",
          });
          setIsAiLoading(false);
          return;
        }

        const data: AiSolverResult = await res.json();
        setAiResult(data);
        if (data && !data.error) {
          clientSolveCache.set(normalizedKey, data);
        }
        setIsAiLoading(false);
      } catch (err: any) {
        if (err.name === 'AbortError') return; // Clean abort, do not log error or change state
        console.warn("Solve request notice:", err);
        setAiResult({
          isSolvable: false,
          title: "Solver Notice",
          answer: "Could not evaluate",
          steps: "The service is temporarily unavailable. Please retry in a moment.",
          error: "SERVICE_NOTICE",
        });
        setIsAiLoading(false);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [canvasCode, isNaturalLanguageQuestion]);

  // Converted amount calculation for hero result card
  const convertedHeroAmount = useMemo(() => {
    if (isCalculatorOutputActive && calculatorOutput?.primaryOutput) {
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
  }, [canvasReceipt, displayCurrency, calculatorOutput, isCalculatorOutputActive]);

  // Auto-purge stale calculator output when switching tabs or when script divergence is detected
  useEffect(() => {
    if (!isHydrated) return;
    if (calculatorOutput && !isCalculatorOutputActive) {
      clearCalculatorOutputState();
    }
  }, [activeTabId, isCalculatorOutputActive, calculatorOutput, isHydrated]);

  // Clean up copy feedback timer on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  // Close currency and templates menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => {
      setShowCurrencyMenu(false);
      setShowTemplatesMenu(false);
    };
    if (showCurrencyMenu || showTemplatesMenu) {
      window.addEventListener('click', handleOutsideClick);
      return () => window.removeEventListener('click', handleOutsideClick);
    }
  }, [showCurrencyMenu, showTemplatesMenu]);


  const searchResults = useMemo(() => {
    const q = searchQuery.trim();

    return allCalculators.filter((calc) => {
      const matchesCategory =
        selectedCategoryFilter === 'all' || calc.category === selectedCategoryFilter;

      if (!matchesCategory) return false;
      if (!q) return true;

      return matchesCalculator(calc, q);
    });
  }, [searchQuery, selectedCategoryFilter]);

  // Core Save to History
  const saveToHistory = (customTitle?: string) => {
    if (!canvasCode.trim() || (!hasReceiptItems && !aiResult)) return;

    // Derive intelligent default title if none provided
    const fallbackTitle =
      aiResult?.title ||
      canvasReceipt.variables.find((v) => v.note)?.note ||
      canvasReceipt.variables[0]?.name ||
      canvasReceipt.financingItems?.[0]?.name ||
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
        isCalculatorOutputActive && calculatorOutput?.primaryOutput?.value
          ? `${calculatorOutput.primaryOutput.prefix || ''}${calculatorOutput.primaryOutput.value}${calculatorOutput.primaryOutput.suffix || ''}`
          : canvasReceipt.lastResult?.formattedValue || '0',
      itemCount: totalReceiptItemCount,
      calculatorOutput: isCalculatorOutputActive && calculatorOutput ? JSON.parse(JSON.stringify(calculatorOutput)) : null,
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
    if (!canvasCode.trim() || !hasReceiptItems) {
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

  // One-click Shareable URL Snapshot Handler (#c=...)
  const handleShareClick = async () => {
    if (!activeSheetText || !activeSheetText.trim()) return;

    const compressed = LZString.compressToEncodedURIComponent(activeSheetText);
    const shareUrl = `${window.location.origin}${window.location.pathname}#c=${compressed}`;

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }

    // Keep hash in address bar without causing router reload
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#c=${compressed}`);
    }

    setIsSharedCopied(true);
    showToast('URL copied');
    if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
    shareTimeoutRef.current = setTimeout(() => {
      setIsSharedCopied(false);
    }, 2000);
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
    if (activeTab && (/^Untitled Sheet( \d+)?$/.test(activeTab.title) || /^Sheet \d+$/.test(activeTab.title))) {
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
    if (!hasReceiptItems && (!isCalculatorOutputActive || !calculatorOutput)) return;

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

    const calcObj = isCalculatorOutputActive ? (calculatorOutput as any) : null;
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

    if (canvasReceipt.financingItems && canvasReceipt.financingItems.length > 0) {
      lines.push('');
      lines.push('### Financing & Payment Plan');
      canvasReceipt.financingItems.forEach((f) => {
        lines.push(`- **${f.name}**: **${f.formattedValue}**`);
        if (f.note) lines.push(`  *${f.note}*`);
      });
    }

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
    if (!hasReceiptItems && (!isCalculatorOutputActive || !calculatorOutput)) return;

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

      const calcObj = isCalculatorOutputActive ? (calculatorOutput as any) : null;
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

      if (canvasReceipt.financingItems && canvasReceipt.financingItems.length > 0) {
        canvasReceipt.financingItems.forEach((f) => {
          rows.push([
            csvEscape(f.name),
            csvEscape('financing'),
            csvEscape(f.formattedValue),
            csvEscape(f.note || ''),
          ].join(','));
        });
      }

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

      const calcObj = isCalculatorOutputActive ? (calculatorOutput as any) : null;
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

      if (canvasReceipt.financingItems && canvasReceipt.financingItems.length > 0) {
        slip.push(row('FINANCING & PAYMENT PLAN:'));
        canvasReceipt.financingItems.forEach((f) => {
          slip.push(kvRow(f.name, f.formattedValue));
          if (f.note) {
            slip.push(row(`  ↳ ${f.note}`));
          }
        });
        slip.push(border);
      }

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

  // ─── UNIFIED GLOBAL KEYBOARD CONTROLS & STRICT INPUT GUARDS ───
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;

      // ─── 0. ESCAPE: Close active modal ───────────────────────────
      if (e.key === 'Escape') {
        if (
          isHistoryOpen ||
          isShortcutsModalOpen ||
          isTemplatesOpen ||
          showClearModal ||
          isCommandPaletteOpen ||
          isDownloadModalOpen
        ) {
          e.preventDefault();
          if (isHistoryOpen) setIsHistoryOpen(false);
          if (isShortcutsModalOpen) setIsShortcutsModalOpen(false);
          if (isTemplatesOpen) setIsTemplatesOpen(false);
          if (showClearModal) setShowClearModal(false);
          if (isCommandPaletteOpen) setIsCommandPaletteOpen(false);
          if (isDownloadModalOpen) setIsDownloadModalOpen(false);
          return;
        }
      }

      const isModifierKey = e.metaKey || e.ctrlKey;
      const isAltKey = e.altKey;

      // ─── 1. MODIFIER COMBINATIONS (Cmd / Ctrl - Active Even When Typing) ───
      if (isModifierKey && !isAltKey) {
        const key = e.key.toLowerCase();

        // Cmd/Ctrl + B -> toggle sidebar collapse
        if (key === 'b') {
          e.preventDefault();
          setIsSidebarOpen((prev) => !prev);
          return;
        }

        // Cmd/Ctrl + K -> trigger Clear Sheet confirmation
        if (key === 'k') {
          e.preventDefault();
          handleClearClick();
          return;
        }

        // Cmd/Ctrl + U -> new sheet
        if (key === 'u') {
          e.preventDefault();
          if (activeMode !== 'canvas') {
            setActiveMode('canvas');
          }
          handleNewTab();
          return;
        }

        // Cmd/Ctrl + ]: next canvas sheet
        if (e.key === ']' || e.key === '}') {
          e.preventDefault();
          setTabs((prevTabs) => {
            if (prevTabs.length <= 1) return prevTabs;
            const currentIndex = prevTabs.findIndex((t) => t.id === activeTabId);
            const nextIndex = (currentIndex + 1) % prevTabs.length;
            const nextTab = prevTabs[nextIndex];
            if (nextTab) {
              setActiveTabId(nextTab.id);
            }
            return prevTabs;
          });
          return;
        }

        // Cmd/Ctrl + [: previous canvas sheet
        if (e.key === '[' || e.key === '{') {
          e.preventDefault();
          setTabs((prevTabs) => {
            if (prevTabs.length <= 1) return prevTabs;
            const currentIndex = prevTabs.findIndex((t) => t.id === activeTabId);
            const prevIndex = (currentIndex - 1 + prevTabs.length) % prevTabs.length;
            const prevTab = prevTabs[prevIndex];
            if (prevTab) {
              setActiveTabId(prevTab.id);
            }
            return prevTabs;
          });
          return;
        }

        // Cmd/Ctrl + C (when target is receipt) -> copy formatted receipt
        if (key === 'c') {
          const selection = window.getSelection()?.toString();
          if (selection && selection.length > 0) {
            return; // Allow native copy for highlighted text
          }
          const isReceiptTarget = Boolean(
            target?.closest('aside') ||
            target?.closest('[data-receipt-panel]') ||
            target?.id === 'receipt-panel'
          );
          const isTargetTyping = ['INPUT', 'TEXTAREA'].includes(target?.tagName || '');
          if ((isReceiptTarget || !isTargetTyping) && (hasReceiptItems || (isCalculatorOutputActive && calculatorOutput))) {
            e.preventDefault();
            handleCopyReceipt();
          }
          return;
        }

        // Cmd/Ctrl + D -> download receipt (.txt / .csv)
        if (key === 'd') {
          e.preventDefault();
          setIsDownloadModalOpen(true);
          return;
        }
      }

      // ─── 2. SINGLE LETTER SHORTCUTS (Strict Input Guards) ──────
      const activeEl = document.activeElement;
      const targetEl = e.target as HTMLElement | null;
      const isTyping = Boolean(
        (activeEl && (
          activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable
        )) ||
        (targetEl && (
          targetEl.tagName === 'INPUT' ||
          targetEl.tagName === 'TEXTAREA' ||
          targetEl.isContentEditable
        ))
      );

      if (isTyping || isModifierKey || isAltKey) {
        return;
      }

      // 'c' / 'C' -> setMode('canvas')
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setMode('canvas');
        return;
      }

      // 'l' / 'L' -> setMode('library')
      if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        setMode('library');
        return;
      }

      // 'h' / 'H' -> toggle calculation history modal
      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setIsHistoryOpen((prev) => !prev);
        return;
      }

      // 't' / 'T' -> toggle templates modal
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setIsTemplatesOpen((prev) => !prev);
        return;
      }

      // '/' -> e.preventDefault(), focus search input
      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[type="search"], input[placeholder*="Search"], input[placeholder*="search"]'
        );
        if (searchInput && document.body.contains(searchInput)) {
          searchInput.focus();
          searchInput.select?.();
        } else {
          setIsCommandPaletteOpen(true);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeTabId,
    activeMode,
    isHistoryOpen,
    isTemplatesOpen,
    isShortcutsModalOpen,
    showClearModal,
    isCommandPaletteOpen,
    isDownloadModalOpen,
    hasReceiptItems,
    isCalculatorOutputActive,
    calculatorOutput,
    handleClearClick,
    handleCopyReceipt,
    handleNewTab,
    setIsSidebarOpen,
    setIsCommandPaletteOpen,
    setIsShortcutsModalOpen,
    setIsTemplatesOpen,
    setIsHistoryOpen,
    setShowClearModal,
    setIsDownloadModalOpen,
    setMode,
    router,
  ]);

  return (
    <div className="flex-1 h-full w-full flex flex-col overflow-hidden font-sans relative">
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
          MOBILE TOP BAR (<768px)
          - Hamburger menu opens off-canvas Section A navigation drawer
          - Sleek segmented toggle: [ Canvas | Live Receipt ]
         ────────────────────────────────────────────────────────── */}
      <header className="md:hidden flex items-center justify-between px-3 py-2 bg-[var(--surface)] border-b border-[var(--border)] shrink-0 z-10 transition-colors duration-200">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-[var(--surface-subtle)] dark:bg-slate-800 border border-[var(--border)] dark:border-slate-700 transition flex items-center justify-center shadow-sm"
            title="Open Navigation Menu"
            aria-label="Open Navigation Menu"
          >
            <SidebarToggleIcon className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <Image
              src="/logo-mark.svg"
              alt="SolveHub Logo"
              width={20}
              height={20}
              className="w-5 h-5 shrink-0"
            />
            <span className="font-bold text-sm text-slate-900 dark:text-white font-mono">
              SolveHub
            </span>
          </div>
        </div>

        {/* Segmented View Bar: [ Canvas | Live Receipt ] */}
        <div className="flex items-center p-0.5 rounded-lg bg-[var(--surface-subtle)] dark:bg-slate-900/90 border border-[var(--border)] dark:border-slate-800 font-mono text-xs shadow-inner">
          <button
            type="button"
            onClick={() => setMobileTab('canvas')}
            className={`px-3 py-1 rounded-md font-semibold transition flex items-center gap-1.5 ${
              mobileTab === 'canvas'
                ? 'bg-[var(--surface)] dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-[var(--border)] dark:border-slate-700'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CanvasModeIcon className="w-3.5 h-3.5 shrink-0" />
            <span>Canvas</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('receipt')}
            className={`px-3 py-1 rounded-md font-semibold transition flex items-center gap-1.5 ${
              mobileTab === 'receipt'
                ? 'bg-[var(--surface)] dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-[var(--border)] dark:border-slate-700'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Live Receipt</span>
            {totalReceiptItemCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                {totalReceiptItemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────
          CANVAS WORKSPACE & LIVE RECEIPT
         ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Section B: Natural Editor */}
        <section
          className={`${
            mobileTab === 'canvas' ? 'flex w-full' : 'hidden'
          } md:flex flex-1 px-3.5 sm:px-6 pt-3 sm:pt-5 pb-3 overflow-hidden border-r-0 md:border-r border-[var(--border)] bg-[var(--background)] flex-col transition-colors duration-200`}
        >
          {/* Top Bar: Quick Inserts & Controls */}
          <div className="flex items-center justify-between gap-2 sm:gap-3 mb-3.5 shrink-0 min-h-[28px]">
            <div className="flex items-center gap-1.5 text-xs font-mono min-w-0 overflow-x-auto scrollbar-none">
              <span className="text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold shrink-0">
                Quick Inserts:
              </span>

              <button
                type="button"
                onClick={() => appendSyntax('total')}
                className="px-2.5 py-1 rounded-md bg-[#e2e8f0] dark:bg-slate-800 hover:bg-[#d0d9e2] dark:hover:bg-slate-700 text-emerald-500 dark:text-emerald-400 border border-[#cbd5e1] dark:border-slate-700 transition text-xs font-mono shrink-0"
              >
                + total
              </button>

              <button
                type="button"
                onClick={() => appendSyntax('discount 10%')}
                className="px-2.5 py-1 rounded-md bg-[#e2e8f0] dark:bg-slate-800 hover:bg-[#d0d9e2] dark:hover:bg-slate-700 text-amber-500 dark:text-amber-400 border border-[#cbd5e1] dark:border-slate-700 transition text-xs font-mono shrink-0"
              >
                + discount
              </button>

              <button
                type="button"
                onClick={() => appendSyntax('tax 18%')}
                className="px-2.5 py-1 rounded-md bg-[#e2e8f0] dark:bg-slate-800 hover:bg-[#d0d9e2] dark:hover:bg-slate-700 text-cyan-500 dark:text-cyan-400 border border-[#cbd5e1] dark:border-slate-700 transition text-xs font-mono shrink-0"
              >
                + tax
              </button>

              {/* Split Bill Trigger + Inline Stepper */}
              {!showSplitInput ? (
                <button
                  type="button"
                  onClick={() => setShowSplitInput(true)}
                  className="px-2.5 py-1 rounded-md bg-[#e2e8f0] dark:bg-slate-800 hover:bg-[#d0d9e2] dark:hover:bg-slate-700 text-purple-500 dark:text-purple-400 border border-[#cbd5e1] dark:border-slate-700 transition text-xs font-mono shrink-0"
                >
                  + split bill
                </button>
              ) : (
                <div className="flex items-center gap-1.5 bg-[#e2e8f0] dark:bg-slate-800 px-2 py-0.5 rounded-md border border-[#cbd5e1] dark:border-purple-500/40 shrink-0">
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
              <span className="text-slate-400 dark:text-slate-700 text-xs select-none shrink-0">|</span>

              {/* Pre-Built Canvas Templates Button */}
              <button
                type="button"
                onClick={() => setIsTemplatesModalOpen(true)}
                className="px-2.5 py-1 text-xs font-mono rounded bg-[var(--surface-subtle)] hover:bg-[#d0d9e2] dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-[var(--border)] dark:border-slate-700 transition flex items-center gap-1.5 shadow-sm shrink-0"
                title="Browse Calculation Recipe Templates"
              >
                + templates
              </button>
            </div>

            {/* Controls: Share, History & Clear */}
            <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
              <button
                id="share-canvas-btn"
                type="button"
                disabled={!hasCanvasContent}
                onClick={handleShareClick}
                className={`text-xs font-mono p-1.5 md:px-2.5 md:py-1 rounded-md border transition flex items-center gap-1.5 shadow-sm group ${
                  isSharedCopied
                    ? 'bg-emerald-500/10 dark:bg-emerald-950/60 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-semibold'
                    : hasCanvasContent
                    ? 'cursor-pointer active:scale-95 bg-[var(--surface-subtle)] dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-[var(--border)] dark:border-slate-700'
                    : 'cursor-not-allowed opacity-40 bg-[var(--surface-subtle)] dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-[var(--border)] dark:border-slate-800'
                }`}
                title={isSharedCopied ? 'Copied' : 'Share'}
                aria-label="Share"
              >
                {isSharedCopied ? (
                  <>
                    <svg
                      className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 animate-in zoom-in-75 duration-150"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="hidden md:inline">Copied</span>
                  </>
                ) : (
                  <>
                    <ShareLinkIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition shrink-0" />
                    <span className="hidden md:inline">Share</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                className={`text-xs font-mono p-1.5 md:px-2.5 md:py-1 rounded-md border transition flex items-center gap-1.5 shadow-sm group ${isHistoryOpen
                  ? 'bg-emerald-500/10 dark:bg-emerald-950/60 border-emerald-500/40 dark:border-emerald-500/50 text-emerald-600 dark:text-emerald-300'
                  : 'bg-[var(--surface-subtle)] dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-[var(--border)] dark:border-slate-700'
                  }`}
                title="History"
                aria-label="History"
              >
                <HistoryHourglassIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white shrink-0" />
                <span className="hidden md:inline">History</span>
                {historyList.length > 0 && (
                  <span className="text-[10px] md:text-xs bg-emerald-100 dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-300 dark:border-emerald-500/30">
                    {historyList.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                disabled={!hasCanvasContent}
                onClick={handleClearClick}
                className={`text-xs font-mono p-1.5 md:px-2.5 md:py-1 rounded-md border transition flex items-center gap-1.5 shadow-sm group ${hasCanvasContent
                  ? 'cursor-pointer active:scale-95 bg-[var(--surface-subtle)] dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-[var(--border)] dark:border-slate-700'
                  : 'cursor-not-allowed opacity-40 bg-[var(--surface-subtle)] dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-[var(--border)] dark:border-slate-800'
                  }`}
                title="Clear"
                aria-label="Clear"
              >
                <ClearTrashIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white shrink-0" />
                <span className="hidden md:inline">Clear</span>
              </button>
            </div>
          </div>

          {/* Multi-Tab Workspace Strip */}
          <div className="flex items-center justify-between gap-3 mb-3 shrink-0">
            <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
              {/* Scrollable Tab List */}
              <div
                ref={tabsContainerRef}
                className="overflow-x-auto scrollbar-none flex items-center gap-1.5 min-w-0 py-0.5 scroll-smooth"
              >
                {tabs.map((tab) => {
                  const isActive = tab.id === activeTabId;
                  const isEditing = editingTabId === tab.id;
                  return (
                    <div
                      key={tab.id}
                      data-active-tab={isActive}
                      onClick={() => setActiveTabId(tab.id)}
                      onDoubleClick={() => startRenameTab(tab)}
                      className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-all cursor-pointer border select-none shrink-0 ${isActive
                        ? 'bg-[var(--surface-subtle)] dark:bg-slate-800 text-slate-900 dark:text-white border-emerald-500/50 shadow-sm'
                        : 'bg-slate-200/50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-[var(--surface-subtle)] dark:hover:bg-slate-800/50 border-[var(--border)] dark:border-slate-800'
                        }`}
                    >
                      {/* Active Tab Indicator */}
                      <span
                        className={`w-1.5 h-1.5 rounded-full transition-colors shrink-0 ${isActive ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-transparent'
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
                          className="w-24 bg-slate-950 border border-emerald-500 rounded px-1.5 py-0.5 text-[11px] font-mono text-white focus:outline-none"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="whitespace-nowrap" title={tab.title}>
                          {tab.title}
                        </span>
                      )}

                      {/* Close tab button (✕) with guard preventing deleting the last tab */}
                      {tabs.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => handleCloseTab(tab.id, e)}
                          title="Close Sheet"
                          className="text-slate-500 hover:text-rose-400 opacity-60 hover:opacity-100 transition text-[11px] ml-0.5 shrink-0"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Overflow Navigation Arrow (Rendered when multiple tabs exceed strip width) */}
              {hasTabOverflow && (
                <button
                  type="button"
                  onClick={handleScrollTabsNext}
                  title="Scroll to next sheet"
                  className="w-5 h-5 p-1 flex items-center justify-center rounded-md bg-[var(--surface-subtle)] dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-[var(--border)] dark:border-slate-700 transition shadow-sm shrink-0"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              )}

              {/* + New Sheet Button */}
              <button
                type="button"
                onClick={handleNewTab}
                title="New Sheet (⌘U / Ctrl+U)"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--surface-subtle)] dark:bg-slate-900/60 hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 border border-dashed border-[var(--border)] dark:border-slate-700 hover:border-emerald-500/50 transition text-[11px] font-mono shrink-0"
              >
                <span className="text-emerald-500 dark:text-emerald-400 font-bold">+</span>
                <span className="whitespace-nowrap">New Sheet</span>
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
              backgroundPosition: '16px 19px',
            }}
          >
            <textarea
              value={canvasCode}
              onChange={(e) => {
                const nextVal = e.target.value;
                setCanvasCode(nextVal);
                if (calculatorOutput && nextVal.trim() !== (calculatorOutput.script || '').trim()) {
                  clearCalculatorOutputState();
                }
              }}
              placeholder="Start Calculating"
              className="w-full flex-1 bg-transparent border-none text-xs font-mono leading-[24px] text-emerald-500 dark:text-emerald-400 focus:outline-none placeholder-slate-400 dark:placeholder-slate-600 resize-none selection:bg-emerald-500/20 p-4"
              style={{
                lineHeight: '24px',
                fontSize: '12px',
              }}
              spellCheck={false}
            />
          </div>

          <div className="h-4 flex items-center justify-between text-[11px] font-mono text-slate-500 shrink-0 mt-2.5">
            <span className="leading-none">Section B • Zero-Friction Input</span>
            <span className="leading-none">Lines: {canvasCode.split('\n').length}</span>
          </div>
        </section>

        {/* Section C: Live Structured Receipt */}
        <aside
          id="receipt-panel"
          data-receipt-panel="true"
          className={`${
            mobileTab === 'receipt' ? 'flex w-full' : 'hidden'
          } md:flex md:w-76 md:min-w-[290px] md:max-w-[315px] bg-[var(--surface)] flex-col justify-between shrink-0 overflow-hidden border-l-0 md:border-l border-[var(--border)] transition-colors duration-200`}
        >
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 md:pt-5 lg:pt-4 min-h-0">
            <div className="flex justify-between items-center md:min-h-[28px] lg:min-h-0 mb-3.5 pb-2.5 border-b border-[var(--border)]">
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">
                Live Receipt
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--surface-subtle)] dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-[var(--border)] dark:border-slate-700 uppercase font-semibold">
                {totalReceiptItemCount} Items
              </span>
            </div>

            {/* Top Hero Output Display */}
            {isAiLoading ? (
              <div className="mb-4 py-2.5 px-3.5 rounded-xl border bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/30 dark:border-emerald-500/40 flex flex-col justify-center gap-1 relative shadow-md animate-pulse">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider block text-emerald-700 dark:text-emerald-400 font-semibold truncate">
                    AI Quantitative Solver
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-semibold">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Solving...
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-400 dark:text-slate-300">
                  Solving...
                </div>
              </div>
            ) : aiResult ? (
              <div
                className={`mb-4 py-2.5 px-3.5 rounded-xl border flex flex-col justify-center gap-1 relative shadow-md ${
                  aiResult.error === 'RATE_LIMIT'
                    ? 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/30 dark:border-amber-500/40'
                    : 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/30 dark:border-emerald-500/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-mono uppercase tracking-wider block font-semibold truncate ${
                      aiResult.error === 'RATE_LIMIT'
                        ? 'text-amber-700 dark:text-amber-400'
                        : 'text-emerald-700 dark:text-emerald-400'
                    }`}
                  >
                    {aiResult.title || 'AI Quantitative Solution'}
                  </span>
                  {aiResult.problemType && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                        aiResult.error === 'RATE_LIMIT'
                          ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-950/60 border-amber-500/30'
                          : 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-950/60 border-emerald-500/30'
                      }`}
                    >
                      {aiResult.problemType}
                    </span>
                  )}
                </div>
                <div
                  className={`text-xl sm:text-2xl font-bold font-mono tracking-tight break-all ${
                    aiResult.error === 'RATE_LIMIT'
                      ? 'text-amber-600 dark:text-amber-300 text-lg sm:text-xl'
                      : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {aiResult.answer}
                </div>
              </div>
            ) : isCalculatorOutputActive && calculatorOutput?.primaryOutput ? (
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
                            className={`w-full text-left px-3 py-1.5 flex items-center justify-between text-xs hover:bg-[var(--surface-subtle)] dark:hover:bg-slate-800/80 transition ${displayCurrency === code
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
                    {canvasReceipt.heroTitle || canvasReceipt.lastResult.name}
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
                            className={`w-full text-left px-3 py-1.5 flex items-center justify-between text-xs hover:bg-[var(--surface-subtle)] dark:hover:bg-slate-800/80 transition ${displayCurrency === code
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

              {isAiLoading && !hasReceiptItems ? (
                <div className="py-4 px-3 text-center border border-dashed border-emerald-500/30 dark:border-emerald-500/40 rounded-lg bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-xs font-mono animate-pulse">
                  Analyzing problem and calculating step-by-step deduction...
                </div>
              ) : !hasReceiptItems && !aiResult ? (
                <div className="p-4 text-center border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs">
                  Type items in Section B (e.g. ticket 450).
                </div>
              ) : (
                <>
                  {aiResult && (
                    <div
                      className={`py-2.5 px-3 rounded-lg border transition shadow-sm mb-2 flex flex-col gap-1.5 ${
                        aiResult.error === 'RATE_LIMIT'
                          ? 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/40 dark:border-amber-500/50'
                          : 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/40 dark:border-emerald-500/50'
                      }`}
                    >
                      <div className="flex justify-between items-center gap-2">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <span
                            className={`text-xs font-mono font-bold leading-tight truncate ${
                              aiResult.error === 'RATE_LIMIT'
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {aiResult.title}
                          </span>
                          {aiResult.matchedCalculatorSlug && (
                            <Link
                              href={`/${aiResult.matchedCalculatorCategory || 'finance-business'}/${aiResult.matchedCalculatorSlug}?currency=${encodeURIComponent(
                                displayCurrency
                              )}`}
                              title="Open Full Calculator"
                              aria-label="Open Full Calculator"
                              className="inline-flex items-center justify-center text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/60 px-1 py-0.5 rounded transition text-[11px] font-bold leading-none shrink-0 border border-emerald-500/30 hover:border-emerald-500/60"
                            >
                              ↗
                            </Link>
                          )}
                        </div>
                        <span
                          className={`font-mono shrink-0 whitespace-nowrap text-right text-xs font-bold ${
                            aiResult.error === 'RATE_LIMIT'
                              ? 'text-amber-600 dark:text-amber-300'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {aiResult.answer}
                        </span>
                      </div>
                      {aiResult.steps && (
                        <div
                          className={`text-xs font-mono whitespace-pre-line leading-relaxed pt-1.5 border-t ${
                            aiResult.error === 'RATE_LIMIT'
                              ? 'text-amber-700/90 dark:text-amber-300/80 border-amber-500/20'
                              : 'text-slate-400 dark:text-slate-400 border-emerald-500/20'
                          }`}
                        >
                          {aiResult.steps}
                        </div>
                      )}
                    </div>
                  )}

                  {canvasReceipt.variables.map((v) => {
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
                      <div className="flex justify-between items-center gap-2">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <span
                            className={`text-xs font-mono font-medium leading-tight ${isDeduction
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
                              href={`/${v.calculatorCategory || 'finance-business'}/${v.calculatorSlug}?currency=${encodeURIComponent(
                                displayCurrency
                              )}&params=${encodeURIComponent(
                                JSON.stringify(v.initialParams || {})
                              )}${v.initialParams
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
                          className={`font-mono shrink-0 whitespace-nowrap text-right ${isSummary ? 'text-sm font-bold text-emerald-600 dark:text-emerald-400' : 'text-xs font-medium'} ${isDeduction
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
                })}
              </>
            )}
            </div>

            {/* Dedicated Financing Breakdown Card (Beneath Cart Total) */}
            {canvasReceipt.financingItems && canvasReceipt.financingItems.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[var(--border)] dark:border-slate-800/80 space-y-2 font-mono">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-500 dark:text-indigo-400 font-semibold block">
                    Financing & Payment Plan
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Debt Facility</span>
                </div>
                {canvasReceipt.financingItems.map((f) => (
                  <div
                    key={f.id}
                    className={`p-3 rounded-xl border transition flex flex-col gap-2.5 ${f.isError
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                      : 'bg-indigo-500/10 dark:bg-indigo-950/40 border-indigo-500/30 dark:border-indigo-500/40 text-slate-800 dark:text-slate-200 shadow-sm'
                      }`}
                  >
                    {f.isError ? (
                      <div className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                        {f.errorMessage || 'Please specify loan amount'}
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-300 leading-tight">
                              {f.name}
                            </span>
                            {f.calculatorSlug && (
                              <Link
                                href={`/${f.calculatorCategory || 'finance-business'}/${f.calculatorSlug}?currency=${encodeURIComponent(
                                  displayCurrency
                                )}&params=${encodeURIComponent(
                                  JSON.stringify(f.initialParams || {})
                                )}${f.initialParams
                                  ? '&' +
                                  Object.entries(f.initialParams)
                                    .filter(([, val]) => val !== undefined && val !== null)
                                    .map(([k, val]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(val))}`)
                                    .join('&')
                                  : ''
                                  }`}
                                title="Open Full Calculator"
                                aria-label="Open Full Calculator"
                                className="inline-flex items-center justify-center text-indigo-500 hover:text-indigo-400 hover:bg-indigo-950/60 px-1 py-0.5 rounded transition text-[11px] font-bold leading-none shrink-0 border border-indigo-500/30 hover:border-indigo-500/60"
                              >
                                ↗
                              </Link>
                            )}
                          </div>
                          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-300 shrink-0 whitespace-nowrap">
                            {f.formattedValue}
                          </span>
                        </div>

                        {/* Financing Details Grid */}
                        {f.financingDetails && (
                          <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-indigo-500/20 text-[11px]">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Loan Principal</span>
                              <span className="font-semibold text-slate-900 dark:text-slate-200">
                                {formatAmount(f.financingDetails.principal, f.currency)}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Total Repaid</span>
                              <span className="font-semibold text-slate-900 dark:text-slate-200">
                                {formatAmount(f.financingDetails.totalRepaid, f.currency)}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Total Interest</span>
                              <span className="font-semibold text-amber-600 dark:text-amber-400">
                                +{formatAmount(f.financingDetails.totalInterest, f.currency)}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Terms</span>
                              <span className="font-semibold text-slate-900 dark:text-slate-200">
                                {f.financingDetails.rate}% • {f.financingDetails.tenureLabel}
                              </span>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Dedicated Calculation Metrics Block */}
            {secondaryMetricsToDisplay.length > 0 && (
              <div className="mt-4 pt-3 border-t border-[var(--border)] dark:border-slate-800/80 space-y-1.5 font-mono">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
                    Calculation Metrics
                  </span>
                  <span className="text-[10px] text-emerald-500 font-mono">
                    {canvasReceipt.hasInvestmentEngine ? 'Portfolio Engine' : isCalculatorOutputActive ? 'Library Linked' : 'Active Tool'}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {secondaryMetricsToDisplay.map((metric, idx) => (
                    <div
                      key={idx}
                      className="py-1.5 px-2.5 rounded-lg border border-[var(--border)] dark:border-slate-800/80 bg-[var(--surface-subtle)] dark:bg-slate-900/60 flex justify-between items-center gap-2 text-xs"
                    >
                      <span className="text-slate-600 dark:text-slate-400 flex-1 min-w-0 pr-1 truncate text-xs">
                        {metric.label}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-slate-200 shrink-0 text-right whitespace-nowrap text-xs">
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
          <div className="w-full shrink-0 pb-3 px-4 flex flex-col">
            {/* Inset Divider Line */}
            <div className="w-full h-px bg-slate-300 dark:bg-slate-800 mb-3" />

            <div className="flex items-center gap-2 h-9 mb-2.5 w-full">
              {/* Copy Button with Reactive State */}
              <button
                type="button"
                onClick={handleCopyReceipt}
                disabled={!hasReceiptItems && (!isCalculatorOutputActive || !calculatorOutput)}
                className={`h-9 flex-initial shrink-0 px-3 rounded-xl font-mono text-[11px] font-medium tracking-tight border transition flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] ${isCopied
                  ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300'
                  : 'bg-[#E4EAF1] hover:bg-[#D7E0EB] dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border border-[#CBD5E1] dark:border-slate-700/80 text-[#334155] dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                title="Copy formatted markdown receipt to clipboard"
              >
                {isCopied ? (
                  <>
                    <span className="text-emerald-400 font-bold text-xs leading-none">✓</span>
                    <span className="text-emerald-300 font-semibold whitespace-nowrap">Copied</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-3.5 h-3.5 text-[#334155] dark:text-slate-300 shrink-0"
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
                    <span className="whitespace-nowrap">Copy</span>
                  </>
                )}
              </button>

              {/* Download Button */}
              <button
                type="button"
                onClick={() => setIsDownloadModalOpen(true)}
                disabled={!hasReceiptItems && (!isCalculatorOutputActive || !calculatorOutput)}
                className="h-9 flex-1 min-w-0 px-3 rounded-xl bg-[#E4EAF1] hover:bg-[#D7E0EB] dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-[#334155] dark:text-slate-300 font-mono text-[11px] font-medium tracking-tight border border-[#CBD5E1] dark:border-slate-700/80 transition flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                title="Download Receipt (.txt / .csv) (⌘D)"
              >
                <svg
                  className="w-3.5 h-3.5 text-[#334155] dark:text-slate-300 shrink-0"
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
                <span className="whitespace-nowrap">Download</span>
              </button>
            </div>

            <div className="h-4 flex items-center justify-center text-[11px] font-mono text-slate-500 text-center">
              <span className="leading-none">Section C • Instant Calculation Ledger</span>
            </div>
          </div>
        </aside>
      </div>

      {/* ──────────────────────────────────────────────────────────
          CALCULATION HISTORY CENTERED MODAL
         ────────────────────────────────────────────────────────── */}
      {isHistoryOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Calculation History"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsHistoryOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-200 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Layout */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                  <svg
                    className="w-4 h-4 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold font-mono text-white tracking-wide">
                    Calculation History
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Saved sheet snapshots and totals
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                className="px-2.5 py-1 text-xs font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                aria-label="Close calculation history"
              >
                Esc
              </button>
            </div>

            {/* Content */}
            <div className="space-y-3 overflow-y-auto pr-1 flex-1">
              {historyList.length === 0 ? (
                <div className="text-center text-slate-400 text-xs py-10 font-mono">
                  No saved sheets yet.<br />Calculations save on Clear.
                </div>
              ) : (
                historyList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => restoreHistory(item)}
                    className="p-3.5 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 rounded-xl cursor-pointer transition group"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-mono text-slate-500">{item.timestamp}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-emerald-400 opacity-0 group-hover:opacity-100 transition">
                          Restore
                        </span>
                        <button
                          type="button"
                          onClick={(e) => deleteHistoryItem(item.id, e)}
                          className="text-xs text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition px-1.5 py-0.5 rounded hover:bg-rose-950/40"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="text-sm font-mono text-emerald-400 font-bold truncate">
                      {item.totalDisplay}
                    </div>
                    <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                      {editingHistoryId === item.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={tempHistoryTag}
                            onChange={(e) => setTempHistoryTag(e.target.value)}
                            placeholder="add tag..."
                            className="w-full bg-slate-950 border border-emerald-500/50 rounded-md px-2 py-1 text-xs font-mono text-white focus:outline-none"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveHistoryTag(item.id);
                              if (e.key === 'Escape') setEditingHistoryId(null);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveHistoryTag(item.id)}
                            className="text-xs bg-emerald-700 hover:bg-emerald-600 text-white px-2.5 py-1 rounded-md font-mono font-semibold transition shrink-0"
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
                            className={`w-3.5 h-3.5 shrink-0 ${
                              item.title ? 'text-emerald-400' : 'text-slate-500 group-hover/tag:text-slate-400'
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
                            className={`truncate ${
                              item.title
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

      {/* Download Receipt Format Modal */}
      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        onSelectFormat={(format) => {
          setDownloadFormat(format);
          handleDownloadReceipt(format);
        }}
        activeFormat={downloadFormat}
      />

      {/* Floating Toast Feedback for Link Copied / Actions */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900/95 dark:bg-slate-800/95 text-white shadow-2xl border border-slate-700/60 text-xs font-mono backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <svg
            className="w-4 h-4 text-emerald-400 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}