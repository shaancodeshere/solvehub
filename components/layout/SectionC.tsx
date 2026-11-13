'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { toPng } from 'html-to-image';
import { ExportReceiptCard } from '@/components/export/ExportReceiptCard';
import { isTextReasoningOrError } from '@/lib/evaluator';

export default function SectionC() {
    const { receipt, rawScratchpad } = useWorkspace();
    const [copied, setCopied] = useState(false);
    const [isExportingCard, setIsExportingCard] = useState(false);
    const [isCardExported, setIsCardExported] = useState(false);
    const [isDownloadOpen, setIsDownloadOpen] = useState(false);
    const exportCardRef = useRef<HTMLDivElement | null>(null);
    const downloadDropdownRef = useRef<HTMLDivElement | null>(null);

    const isHeroReasoningOrError = isTextReasoningOrError(receipt.primaryValue);

    // Close download dropdown on outside click or Escape
    useEffect(() => {
        if (!isDownloadOpen) return;
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (downloadDropdownRef.current && !downloadDropdownRef.current.contains(event.target as Node)) {
                setIsDownloadOpen(false);
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsDownloadOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isDownloadOpen]);

    const exportItems = useMemo(() => {
        if (rawScratchpad && rawScratchpad.trim()) {
            const parsed = rawScratchpad
                .split('\n')
                .map((line) => line.trim())
                .filter((line) => line.length > 0)
                .filter((line) => !/^(?:total|statement\s+total)\b/i.test(line))
                .map((line, idx) => {
                    const standaloneNumMatch = line.match(/^([₹$€£]?\s*[\d,]+(?:\.\d+)?)\s*$/);
                    if (standaloneNumMatch) {
                        const matchedVar = receipt.variables.find(
                            (v) => v.name.toLowerCase() === `item ${idx + 1}`.toLowerCase()
                        );
                        return {
                            label: matchedVar?.name || `Item ${idx + 1}`,
                            value: matchedVar?.formattedValue || standaloneNumMatch[1].trim(),
                        };
                    }
                    const match = line.match(
                        /^(.*?)\s*[-:=–—]\s*([₹$€£]?\s*[\d,]+(?:\.\d+)?.*)$/
                    );
                    if (match) {
                        const label = match[1].trim();
                        let value = match[2].trim();
                        const matchingVar = receipt.variables.find(
                            (v) => v.name.toLowerCase() === label.toLowerCase()
                        );
                        if (matchingVar && !/[₹$€£]/.test(value)) {
                            value = matchingVar.formattedValue;
                        }
                        return { label, value };
                    }
                    const endMatch = line.match(
                        /^(.*?)\s+([₹$€£]?\s*[\d,]+(?:\.\d+)?)$/
                    );
                    if (endMatch) {
                        const label = endMatch[1].trim();
                        let value = endMatch[2].trim();
                        const matchingVar = receipt.variables.find(
                            (v) => v.name.toLowerCase() === label.toLowerCase()
                        );
                        if (matchingVar && !/[₹$€£]/.test(value)) {
                            value = matchingVar.formattedValue;
                        }
                        return { label, value };
                    }
                    const pctMatch = line.match(/^(.*?)\s*[-:=–—]?\s*([+\-]?\s*\d+(?:\.\d+)?%)\s*$/i);
                    if (pctMatch) {
                        const rawLabel = pctMatch[1].trim();
                        const matchingVar = receipt.variables.find(
                            (v) =>
                                v.name.toLowerCase() === rawLabel.toLowerCase() ||
                                v.name.toLowerCase().includes(rawLabel.toLowerCase())
                        );
                        if (matchingVar) {
                            return { label: matchingVar.name, value: matchingVar.formattedValue };
                        }
                        return { label: rawLabel || line, value: pctMatch[2].trim() };
                    }
                    const matchingVar = receipt.variables.find(
                        (v) =>
                            v.name.toLowerCase() === line.toLowerCase() ||
                            (line.toLowerCase().includes('tax') && v.name.toLowerCase().includes('tax')) ||
                            (line.toLowerCase().includes('discount') && v.name.toLowerCase().includes('discount'))
                    );
                    if (matchingVar) {
                        return { label: matchingVar.name, value: matchingVar.formattedValue };
                    }
                    return { label: line, value: '' };
                });
            if (parsed.length > 0) {
                return parsed;
            }
        }

        return receipt.variables.map((v) => ({
            label: v.name,
            value: v.formattedValue,
        }));
    }, [rawScratchpad, receipt.variables]);

    const handleCopyReceipt = async () => {
        let summaryText = `--- SolveHub Calculation Receipt ---\n`;
        summaryText += `Primary Output: ${receipt.primaryVariable} = ${receipt.primaryValue}\n\n`;

        if (receipt.secondaryMetrics && receipt.secondaryMetrics.length > 0) {
            summaryText += `Key Metrics:\n`;
            receipt.secondaryMetrics.forEach((m) => {
                summaryText += `- ${m.label}: ${m.value}\n`;
            });
            summaryText += `\n`;
        }

        if (receipt.variables.length > 0) {
            summaryText += `Variables:\n`;
            receipt.variables.forEach((v) => {
                summaryText += `- ${v.name}: ${v.formattedValue} (${v.rawExpression})\n`;
            });
        }

        try {
            await navigator.clipboard.writeText(summaryText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback if clipboard API is blocked
        }
    };

    const handleDownloadTxt = () => {
        let summaryText = `--- SolveHub Calculation Receipt ---\n`;
        summaryText += `Primary Output: ${receipt.primaryVariable} = ${receipt.primaryValue}\n\n`;

        if (receipt.secondaryMetrics && receipt.secondaryMetrics.length > 0) {
            summaryText += `Key Metrics:\n`;
            receipt.secondaryMetrics.forEach((m) => {
                summaryText += `- ${m.label}: ${m.value}\n`;
            });
            summaryText += `\n`;
        }

        if (receipt.variables.length > 0) {
            summaryText += `Variables:\n`;
            receipt.variables.forEach((v) => {
                summaryText += `- ${v.name}: ${v.formattedValue} (${v.rawExpression})\n`;
            });
        }

        const sanitizedTitle = (receipt.primaryVariable || 'receipt')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || 'receipt';
        const dateSlug = new Date().toISOString().slice(0, 10);
        const filename = `solvehub-receipt-${sanitizedTitle}-${dateSlug}.txt`;

        const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDownloadCsv = () => {
        const csvEscape = (val: string | number): string => {
            const str = String(val ?? '');
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return `"${str}"`;
        };

        const rows: string[] = ['Item,Value,Expression'];
        receipt.variables.forEach((v) => {
            rows.push([csvEscape(v.name), csvEscape(v.formattedValue), csvEscape(v.rawExpression)].join(','));
        });
        rows.push([csvEscape(receipt.primaryVariable), csvEscape(receipt.primaryValue), csvEscape('')].join(','));

        const sanitizedTitle = (receipt.primaryVariable || 'receipt')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || 'receipt';
        const dateSlug = new Date().toISOString().slice(0, 10);
        const filename = `solvehub-receipt-${sanitizedTitle}-${dateSlug}.csv`;

        const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleExportCardPng = async () => {
        if (!exportCardRef.current || isExportingCard) return;
        setIsExportingCard(true);

        try {
            const sanitizedTitle = (receipt.primaryVariable || 'receipt')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '') || 'receipt';
            const timestamp = Date.now();
            const filename = `solvehub-${sanitizedTitle}-${timestamp}.png`;

            const dataUrl = await toPng(exportCardRef.current, {
                cacheBust: true,
                pixelRatio: 2,
            });

            const link = document.createElement('a');
            link.download = filename;
            link.href = dataUrl;
            link.click();

            setIsCardExported(true);
            setTimeout(() => setIsCardExported(false), 2000);
        } catch (err) {
            console.error('Failed to export receipt card as PNG:', err);
        } finally {
            setIsExportingCard(false);
        }
    };

    return (
        <aside className="w-full md:w-76 md:min-w-[290px] md:max-w-[315px] h-full border-l border-[var(--border)] bg-[var(--background)] p-4 flex flex-col justify-between text-[var(--foreground)] select-none">
            <div className="flex flex-col gap-6">
                {/* Panel Header */}
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-3.5 px-1">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold tracking-wide text-[var(--foreground)]">Live Receipt</span>
                        <span className="text-xs font-mono uppercase bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] px-2 py-0.5 rounded-lg">
                            Live
                        </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)] uppercase font-semibold">
                        {receipt.variables.length} {receipt.variables.length === 1 ? 'ITEM' : 'ITEMS'}
                    </span>
                </div>

                {/* Live Variable Tokens */}
                <div className="flex flex-col gap-2.5">
                    <div className="text-xs font-mono uppercase tracking-wider text-[var(--muted)] px-1 font-semibold">
                        Registered Variables
                    </div>
                    <div className="space-y-2 font-mono text-sm max-h-56 overflow-y-auto pr-1">
                        {receipt.variables.length === 0 ? (
                            <div className="text-sm text-[var(--muted)] italic px-1 py-4 text-center">No variables declared</div>
                        ) : (
                            receipt.variables.map((v, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] gap-2 shadow-sm"
                                >
                                    <span className="text-[var(--foreground)] text-sm font-semibold line-clamp-2 break-words max-w-[180px]">{v.name}</span>
                                    <span className={`font-semibold shrink-0 ${v.isError ? 'text-rose-500' : 'text-[var(--foreground)]'}`}>
                                        {v.formattedValue}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Receipt Total Calculation Card */}
                <div className="flex flex-col gap-2.5">
                    <div className="text-xs font-mono uppercase tracking-wider text-[var(--muted)] px-1 font-semibold">
                        Output Summary
                    </div>
                    <div className={`p-4 rounded-xl flex flex-col gap-2 shadow-lg transition-colors bg-[var(--surface)] border border-[var(--border)]`}>
                        <span className="text-xs font-mono uppercase tracking-wide truncate text-[var(--muted)]">
                            {receipt.primaryVariable}
                        </span>
                        <span className={
                            isHeroReasoningOrError
                                ? 'text-base md:text-lg font-medium text-[var(--foreground)] leading-relaxed break-words tracking-normal font-sans'
                                : 'text-3xl md:text-4xl font-bold tracking-tight text-[var(--foreground)] font-mono break-words'
                        }>
                            {receipt.primaryValue}
                        </span>
                        {receipt.secondaryMetrics && receipt.secondaryMetrics.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 mt-1.5 border-t border-[var(--border)] pt-2.5">
                                {receipt.secondaryMetrics.map((metric, i) => (
                                    <span key={i} className="text-xs text-[var(--muted)] font-mono">
                                        {metric.label}: <strong className="text-[var(--foreground)]">{metric.value}</strong>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Toolbar: Clean 2-button [ Copy ] [ Download ▾ ] */}
            <div className="border-t border-[var(--border)] pt-3.5 pb-2 px-1 flex flex-col gap-2.5 relative z-20">
                <div className="flex items-center gap-2 w-full">
                    <button
                        type="button"
                        onClick={handleCopyReceipt}
                        className="h-9 flex-1 min-w-0 px-2.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-subtle)] text-[var(--foreground)] font-mono text-[11px] font-medium tracking-tight border border-[var(--border)] transition flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] cursor-pointer"
                        title="Copy formatted calculation receipt"
                    >
                        {copied ? (
                            <>
                                <span className="text-[var(--foreground)] font-bold text-xs leading-none">✓</span>
                                <span className="text-[var(--foreground)] font-semibold whitespace-nowrap">Copied</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span className="whitespace-nowrap">Copy</span>
                            </>
                        )}
                    </button>

                    <div className="relative flex-1 min-w-0" ref={downloadDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsDownloadOpen((prev) => !prev)}
                            aria-expanded={isDownloadOpen}
                            aria-haspopup="true"
                            className={`h-9 w-full px-2.5 rounded-xl bg-[#1c5f27] text-[#cff060] dark:bg-[#cff060] dark:text-[#1c5f27] font-mono text-[11px] font-medium tracking-tight border border-[var(--border)] transition flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] cursor-pointer ${
                                isDownloadOpen ? 'ring-2 ring-[var(--border)]' : ''
                            }`}
                            title="Download / Export options"
                        >
                            <svg className="w-3.5 h-3.5 text-current shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span className="whitespace-nowrap truncate">Download</span>
                            <span className={`text-[10px] transition-transform duration-150 ${isDownloadOpen ? 'rotate-180' : ''}`}>▾</span>
                        </button>

                        {isDownloadOpen && (
                            <div className="absolute right-0 bottom-full mb-1.5 w-full min-w-[124px] rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 shadow-2xl backdrop-blur-md z-50 animate-in fade-in zoom-in-95 duration-100">
                                {(['CSV', 'TXT', 'PNG'] as const).map((format) => (
                                    <button
                                        key={format}
                                        type="button"
                                        onClick={() => {
                                            if (format === 'CSV') handleDownloadCsv();
                                            else if (format === 'TXT') handleDownloadTxt();
                                            else if (format === 'PNG') handleExportCardPng();
                                            setIsDownloadOpen(false);
                                        }}
                                        disabled={format === 'PNG' && isExportingCard}
                                        className="group flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left font-mono text-xs text-[var(--foreground)] transition-colors hover:bg-[var(--surface-subtle)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#1c5f27] dark:bg-[#cff060] opacity-0 transition-opacity group-hover:opacity-100 shrink-0" />
                                        <span className="font-medium tracking-wide">
                                            {format === 'PNG' && isExportingCard ? 'Exporting...' : format}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Meta */}
                <div className="flex items-center justify-between text-[11px] text-[var(--muted)] font-mono">
                    <span>Section C</span>
                    <span>Active</span>
                </div>
            </div>

            {/* Off-screen Export Receipt Card for PNG capture */}
            <div className="fixed -left-[9999px] top-0 pointer-events-none -z-50" aria-hidden="true">
                <ExportReceiptCard
                    ref={exportCardRef}
                    sheetTitle={receipt.primaryVariable || 'Calculation Receipt'}
                    items={exportItems}
                    activeSheetText={rawScratchpad}
                    rawCanvasText={rawScratchpad}
                    formattedTotal={receipt.primaryValue || '0'}
                    totalFormatted={receipt.primaryValue || '0'}
                />
            </div>
        </aside>
    );
}