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
          .filter((line) => line.length > 0)
          .filter((line) => !/^(?:total|statement\s+total)\b/i.test(line));

        if (lines.length > 0) {
          return lines.map((line, idx) => {
            // Standalone number or currency amount (e.g. "7,898" or "₹7,898" or "7898")
            const standaloneNumMatch = line.match(/^([₹$€£]?\s*[\d,]+(?:\.\d+)?)\s*$/);
            if (standaloneNumMatch) {
              const matchedItem = items?.find((it, i) => i === idx || (it.label || it.name || '').toLowerCase() === `item ${idx + 1}`.toLowerCase());
              return {
                label: matchedItem?.label || matchedItem?.name || `Item ${idx + 1}`,
                value: matchedItem?.value || matchedItem?.formattedValue || standaloneNumMatch[1].trim(),
              };
            }
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
        return items
          .filter((item) => !/^(?:total|statement\s+total)\b/i.test(item.label || item.name || ''))
          .map((item) => ({
            label: item.label || item.name || '',
            value: item.value || item.formattedValue || '',
          }));
      }

      return [];
    }, [effectiveCanvasText, items]);

    const finalDisplayTotal = useMemo(() => {
      if (formattedTotal && formattedTotal !== '0') return formattedTotal;
      // Fallback: auto-accumulate sum of parsed items
      let sum = 0;
      let symbol = '$';
      for (const item of parsedItems) {
        const valStr = String(item.value || '');
        const symMatch = valStr.match(/^[₹$€£]/);
        if (symMatch) symbol = symMatch[0];
        const num = parseFloat(valStr.replace(/[^0-9.-]/g, ''));
        if (!isNaN(num)) sum += num;
      }
      return sum > 0 ? `${symbol}${sum.toLocaleString('en-US', { maximumFractionDigits: 2 })}` : (formattedTotal || '0');
    }, [formattedTotal, parsedItems]);

    return (
      <div
        ref={ref}
        className="w-[480px] h-auto p-8 relative flex flex-col bg-[#D9D9D9] text-black select-none"
        style={{
          backgroundColor: '#D9D9D9',
          color: '#000000',
          fontFamily:
            'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {/* Top Header Section */}
        <div className="mb-6">
          {/* Top-Right SolveHub Brand Lockup */}
          <div className="flex items-center justify-end gap-2 text-black font-mono">
            <span className="text-xl font-bold tracking-tight text-black font-sans">
              solvhub
            </span>
            <div
              className="w-[1px] h-5 bg-black"
              style={{ backgroundColor: '#000000', width: '1px' }}
            />
            <img
              src="/logo-mark.svg"
              alt="SolveHub Logo"
              className="w-5 h-5 object-contain brightness-0"
              crossOrigin="anonymous"
            />
          </div>

          {/* Dynamic Date & Sheet Metadata (Shifted Upwards) */}
          <div className="mt-5 space-y-2">
            <div className="text-xs font-bold text-black">
              {formattedDate}
            </div>
            <div>
              <span className="text-xs font-bold text-black block mb-0.5">
                Sheet:
              </span>
              <h2 className="text-base font-bold text-black tracking-tight leading-tight">
                {sheetTitle || 'Untitled Calculation'}
              </h2>
            </div>
          </div>
        </div>

        {/* Horizontal Rule */}
        <div className="w-full border-t border-black mb-4" />

        {/* Ledger Items Container */}
        <div className="relative mb-6">
          {/* Full vertical dividing line spanning only the rendered rows */}
          <div
            className="absolute right-[130px] top-0 bottom-0 w-[1px] bg-black pointer-events-none"
            style={{ backgroundColor: '#000000', width: '1px' }}
          />

          <div className="grid grid-cols-[1fr_auto] gap-x-6">
            {/* Render all line items */}
            <div className="space-y-3.5 pr-6">
              {parsedItems.length === 0 ? (
                <div className="text-sm font-medium text-neutral-600 italic">
                  No line items recorded
                </div>
              ) : (
                parsedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="text-sm font-bold text-black leading-snug break-words"
                  >
                    {item.label}
                  </div>
                ))
              )}
            </div>

            <div className="space-y-3.5 pl-6 text-right w-[130px]">
              {parsedItems.length === 0 ? (
                <div className="text-sm font-bold text-neutral-600 font-mono">
                  -
                </div>
              ) : (
                parsedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="text-sm font-bold text-black font-mono"
                  >
                    {item.value}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Statement Total Anchor */}
        <div className="grid grid-cols-[1fr_auto] gap-x-6 pt-4 border-t border-neutral-400 mb-8">
          <span className="text-base font-bold text-black">
            Statement Total
          </span>
          <span className="text-base font-bold text-black font-mono text-right w-[130px]">
            {finalDisplayTotal}
          </span>
        </div>

        {/* Bottom Crowd Artwork Container */}
        <div className="w-full relative overflow-hidden h-[140px] flex items-end">
          <img
            src="/export-crowd.png"
            alt="SolveHub Community Crowd"
            crossOrigin="anonymous"
            className="w-full absolute bottom-0 left-0"
          />
        </div>

        {/* Hairline Divider with Centered Badge */}
        <div className="relative mt-4">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-neutral-400" />
          </div>
          <div className="relative flex justify-center">
            <span
              className="bg-[#D9D9D9] px-2 text-[11px] font-mono text-neutral-800"
              style={{ backgroundColor: '#D9D9D9', color: '#262626' }}
            >
              calculated on solvehub.app
            </span>
          </div>
        </div>
      </div>
    );
  }
);

ExportReceiptCard.displayName = 'ExportReceiptCard';
