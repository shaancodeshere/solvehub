'use client';

import React, { forwardRef, useMemo, useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

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
  theme?: 'light' | 'dark';
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
      theme: propTheme,
    },
    ref
  ) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    const { resolvedTheme } = useTheme();
    const activeTheme = propTheme || (resolvedTheme === 'light' ? 'light' : 'dark');
    const isDark = activeTheme === 'dark';

    const formattedTotal = propFormattedTotal || totalFormatted || '0';

    const formattedDate =
      dateStr ||
      new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
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

    const cardBg = isDark ? '#1c5f27' : '#cff060';
    const cardFg = isDark ? '#cff060' : '#1c5f27';
    const dividerColor = isDark ? '#cff060' : '#1c5f27';
    const bannerBg = isDark ? '#cff060' : '#1c5f27';
    const bannerFg = isDark ? '#1c5f27' : '#cff060';
    const footerTextColor = isDark ? 'rgba(207, 240, 96, 0.72)' : 'rgba(28, 95, 39, 0.72)';
    const footerBorderColor = isDark ? 'rgba(207, 240, 96, 0.35)' : 'rgba(28, 95, 39, 0.35)';

    // Asymmetrical Line-Wrap Calibration for Sheet Title:
    // Line 1 wraps before 's' in solvhub (124px right spacer).
    // Line 2+ may extend further right, wrapping before '|' + logo mark (36px right spacer).
    const effectiveTitle = sheetTitle || 'Untitled Calculation';
    const titleLen = effectiveTitle.length;
    const spacer2Lines = titleLen <= 18 ? 0 : Math.min(5, Math.ceil((titleLen - 18) / 20));
    const spacer2Height = `${spacer2Lines * 1.25}em`;

    if (!mounted) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={`w-[480px] h-auto relative flex flex-col select-none overflow-hidden ${
          isDark ? 'bg-[#1c5f27] text-[#cff060]' : 'bg-[#cff060] text-[#1c5f27]'
        }`}
        style={{
          backgroundColor: cardBg,
          color: cardFg,
          fontFamily:
            'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {/* Full-bleed Seamless Toroidal Grain Overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            backgroundImage: isDark ? 'url("/grain-dark.png")' : 'url("/grain-light.png")',
            backgroundRepeat: 'repeat',
            backgroundSize: '256px 256px',
            opacity: 1,
          }}
        />

        {/* Top Header Section */}
        <div className="pt-6 px-6 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-tight" style={{ color: cardFg }}>
              {formattedDate}
            </span>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-xl font-bold tracking-tight font-sans" style={{ color: cardFg }}>
                solvhub
              </span>
              <div
                className="w-[1px] h-4"
                style={{ backgroundColor: dividerColor }}
              />
              <img
                src={isDark ? '/logo-mark.svg' : '/logo-mark-light.svg'}
                alt="SolveHub Logo"
                className="w-5 h-5 object-contain"
                crossOrigin="anonymous"
              />
            </div>
          </div>
          <div className="w-full border-t mt-3.5" style={{ borderColor: dividerColor }} />
        </div>

        {/* Main Content Section */}
        <div className="px-10 mt-8 flex-1 flex flex-col relative z-10">
          {/* Sheet Title with Asymmetrical Line-Wrap Spacers */}
          <h2
            className="text-2xl sm:text-[28px] font-extrabold tracking-tight leading-tight mb-8 break-words"
            style={{ color: cardFg }}
          >
            {/* Spacer 1: Line 1 stops before 's' in solvhub (~124px right exclusion) */}
            <span
              aria-hidden="true"
              className="float-right h-[1.25em] w-[124px] pointer-events-none"
            />
            {/* Spacer 2: Line 2+ stops before '|' + logo mark (~36px right exclusion) */}
            {spacer2Lines > 0 && (
              <span
                aria-hidden="true"
                className="float-right clear-right w-[36px] pointer-events-none"
                style={{ height: spacer2Height }}
              />
            )}
            {effectiveTitle}
          </h2>

          {/* Line Items Container */}
          <div className="w-full mb-4">
            {parsedItems.length === 0 ? (
              <div className="text-sm font-medium italic py-2" style={{ color: cardFg, opacity: 0.7 }}>
                No line items recorded
              </div>
            ) : (
              parsedItems.map((item, idx) => (
                <div key={idx} className="w-full">
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-sm font-bold tracking-tight pr-4 break-words" style={{ color: cardFg }}>
                      {item.label}
                    </span>
                    <span className="text-sm font-bold font-mono tracking-tight text-right shrink-0" style={{ color: cardFg }}>
                      {item.value}
                    </span>
                  </div>
                  {idx < parsedItems.length - 1 && (
                    <div className="w-full border-t" style={{ borderColor: dividerColor }} />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Statement Total Banner */}
          <div
            className="w-full flex items-center justify-between px-4 py-3 mt-4"
            style={{
              backgroundColor: bannerBg,
              color: bannerFg,
            }}
          >
            <span className="text-sm font-extrabold tracking-tight">Statement Total</span>
            <span className="text-sm font-bold font-mono tracking-tight text-right">{finalDisplayTotal}</span>
          </div>
        </div>

        {/* Bottom Crowd Artwork Container */}
        <div className="w-full mt-10 relative overflow-hidden flex items-end justify-center z-10">
          <img
            src="/export-crowd.png"
            alt="SolveHub Community Crowd"
            crossOrigin="anonymous"
            className="w-full object-contain pointer-events-none"
          />
        </div>

        {/* Bottom Hairline Watermark Footer */}
        <div className="w-full px-6 pb-6 mt-3 relative z-10">
          <div className="flex items-center gap-3 w-full">
            <div
              className="flex-1 h-[1px]"
              style={{ backgroundColor: footerBorderColor }}
            />
            <span
              className="font-mono text-[11px] tracking-wide whitespace-nowrap"
              style={{ color: footerTextColor }}
            >
              calculated on solvehub.app
            </span>
            <div
              className="flex-1 h-[1px]"
              style={{ backgroundColor: footerBorderColor }}
            />
          </div>
        </div>
      </div>
    );
  }
);

ExportReceiptCard.displayName = 'ExportReceiptCard';
