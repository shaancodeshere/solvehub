'use client';

import React, { forwardRef, useMemo } from 'react';

export interface ExportReceiptItem {
  label?: string;
  name?: string;
  value?: string;
  formattedValue?: string;
}

export interface ExportReceiptCardProps {
  sheetTitle?: string;
  dateStr?: string;
  items?: ExportReceiptItem[];
  activeSheetText?: string;
  rawCanvasText?: string;
  totalFormatted?: string;
  formattedTotal?: string;
}

export const ExportReceiptCard = forwardRef<HTMLDivElement, ExportReceiptCardProps>(
  function ExportReceiptCard(
    {
      sheetTitle = 'Canvas Sheet',
      dateStr,
      items,
      activeSheetText,
      rawCanvasText,
      totalFormatted = '0',
      formattedTotal: propFormattedTotal,
    },
    ref
  ) {
    const formattedTotal = propFormattedTotal || totalFormatted || '0';

    const formattedDate =
      dateStr ||
      new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date());

    const effectiveCanvasText = activeSheetText || rawCanvasText || '';

    const parsedItems = useMemo(() => {
      // 1. Extract Line Items Directly from Canvas Text if available
      if (effectiveCanvasText && effectiveCanvasText.trim()) {
        const lines = effectiveCanvasText
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0);

        if (lines.length > 0) {
          return lines.map((line) => {
            // Match common patterns: "Label - ₹45,000", "Label: 45000", "Label = 45000", etc.
            const match = line.match(
              /^(.*?)\s*[-:=–—]\s*([₹$€£]?\s*[\d,]+(?:\.\d+)?.*)$/
            );
            if (match) {
              const label = match[1].trim();
              const matchedItem = items?.find(it => (it.label || it.name || '').toLowerCase() === label.toLowerCase());
              return { label, value: matchedItem?.value || matchedItem?.formattedValue || match[2].trim() };
            }
            // Fallback if no separator: check if line ends with a number/currency
            const endMatch = line.match(
              /^(.*?)\s+([₹$€£]?\s*[\d,]+(?:\.\d+)?)$/
            );
            if (endMatch) {
              const label = endMatch[1].trim();
              const matchedItem = items?.find(it => (it.label || it.name || '').toLowerCase() === label.toLowerCase());
              return { label, value: matchedItem?.value || matchedItem?.formattedValue || endMatch[2].trim() };
            }
            // Modifier / percentage lines: "tax 18%", "discount 10%"
            const pctMatch = line.match(/^(.*?)\s*[-:=–—]?\s*([+\-]?\s*\d+(?:\.\d+)?%)\s*$/i);
            if (pctMatch) {
              const label = pctMatch[1].trim();
              const matchedItem = items?.find(it => {
                const l = (it.label || it.name || '').toLowerCase();
                return l === label.toLowerCase() || l.includes(label.toLowerCase());
              });
              return {
                label: matchedItem?.label || matchedItem?.name || label,
                value: matchedItem?.value || matchedItem?.formattedValue || pctMatch[2].trim()
              };
            }
            const matchedItem = items?.find(it => (it.label || it.name || '').toLowerCase() === line.toLowerCase());
            return { label: matchedItem?.label || line, value: matchedItem?.value || matchedItem?.formattedValue || '' };
          });
        }
      }

      // 2. If items prop is passed (e.g. from parsed lines or statement breakdown), use it
      if (items && items.length > 0) {
        return items.map((item) => ({
          label: item.label || item.name || '',
          value: item.value || item.formattedValue || '',
        }));
      }

      return [];
    }, [effectiveCanvasText, items]);

    return (
      <div
        ref={ref}
        className="w-[480px] min-h-[700px] h-auto p-8 relative flex flex-col justify-between bg-white text-neutral-900 select-none"
        style={{
          backgroundColor: '#ffffff',
          color: '#171717',
          fontFamily:
            'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {/* Top Header Section */}
        <div>
          {/* Centered SolveHub Brand Lockup */}
          <div className="flex items-center justify-center gap-3">
            <img
              src="/logo-mark.svg"
              alt="SolveHub Logo"
              className="w-7 h-7 object-contain"
              crossOrigin="anonymous"
            />
            <div
              className="w-[1px] h-6 bg-neutral-300"
              style={{ backgroundColor: '#d4d4d4', width: '1px' }}
            />
            <span className="text-2xl font-bold tracking-tight text-neutral-950 font-sans">
              solvehub
            </span>
          </div>

          {/* Dynamic Date & Sheet Metadata */}
          <div className="mt-8 space-y-2">
            <div className="text-xs font-medium text-neutral-600">
              {formattedDate}
            </div>
            <div>
              <span className="text-xs text-neutral-500 font-medium block mb-0.5">
                Sheet:
              </span>
              <h2 className="text-base font-bold text-neutral-900 tracking-tight leading-tight">
                {sheetTitle || 'Untitled Calculation'}
              </h2>
            </div>
          </div>
        </div>

        {/* Ledger Body with Continuous Vertical Separator */}
        <div className="relative border-t border-neutral-300 my-5 pt-4 flex-1 flex flex-col justify-between min-h-[220px]">
          {/* Continuous vertical line spanning from top border down through statement total */}
          <div
            className="absolute right-[130px] -top-2.5 bottom-0 w-[1px] bg-neutral-300 pointer-events-none"
            style={{ backgroundColor: '#d4d4d4', width: '1px' }}
          />

          <div className="grid grid-cols-[1fr_auto] gap-x-6 relative">
            {/* Full vertical dividing line spanning from top border down to Statement Total */}
            <div
              className="absolute right-[130px] top-0 bottom-0 w-[1px] bg-neutral-300"
              style={{ backgroundColor: '#d4d4d4', width: '1px' }}
            />

            {/* Render all line items */}
            <div className="space-y-3.5 pr-6">
              {parsedItems.length === 0 ? (
                <div className="text-sm font-medium text-neutral-400 italic">
                  No line items recorded
                </div>
              ) : (
                parsedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="text-sm font-medium text-neutral-800 leading-snug break-words"
                  >
                    {item.label}
                  </div>
                ))
              )}
            </div>

            <div className="space-y-3.5 pl-6 text-right w-[130px]">
              {parsedItems.length === 0 ? (
                <div className="text-sm font-semibold text-neutral-400 font-mono">
                  -
                </div>
              ) : (
                parsedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="text-sm font-semibold text-neutral-900 font-mono"
                  >
                    {item.value}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Statement Total Anchor */}
          <div className="grid grid-cols-[1fr_auto] gap-x-6 pt-6 mt-6 border-t border-neutral-200">
            <span className="text-base font-bold text-neutral-900">
              Statement Total
            </span>
            <span className="text-base font-bold text-neutral-950 font-mono text-right w-[130px]">
              {formattedTotal}
            </span>
          </div>
        </div>

        {/* Footer Anchor */}
        <div className="w-full mt-8 flex flex-col justify-end">
          {/* Bottom crowd artwork container */}
          <div className="w-full relative overflow-hidden h-[140px] flex items-end">
            <img
              src="/export-crowd.png"
              alt="SolveHub Community Crowd"
              crossOrigin="anonymous"
              className="w-full absolute bottom-0 left-0"
            />
          </div>

          {/* Hairline divider with centered badge */}
          <div className="relative mt-4">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-neutral-300" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-2 text-[11px] font-mono text-neutral-600">
                calculated on solvehub.app
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ExportReceiptCard.displayName = 'ExportReceiptCard';
