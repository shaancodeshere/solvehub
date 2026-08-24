'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/lib/WorkspaceContext';

export default function SectionC() {
    const { receipt } = useWorkspace();
    const [copied, setCopied] = useState(false);

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

    return (
        <aside className="w-full md:w-[320px] md:min-w-[320px] md:max-w-[320px] h-full border-l border-neutral-800 bg-neutral-950 p-4 flex flex-col justify-between text-neutral-200 select-none">
            <div className="flex flex-col gap-5">
                {/* Panel Header */}
                <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3 px-1">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold tracking-wide text-neutral-300">Live Receipt</span>
                        <span className="text-[10px] font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                            Live
                        </span>
                    </div>
                    <button
                        onClick={handleCopyReceipt}
                        className="text-[11px] font-mono text-neutral-400 hover:text-emerald-400 transition flex items-center gap-1"
                        title="Copy formatted calculation receipt"
                    >
                        {copied ? (
                            <span className="text-emerald-400 font-semibold">✓ Copied</span>
                        ) : (
                            <span>Copy</span>
                        )}
                    </button>
                </div>

                {/* Live Variable Tokens */}
                <div className="flex flex-col gap-2">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 px-1">
                        Registered Variables
                    </div>
                    <div className="space-y-1.5 font-mono text-xs max-h-48 overflow-y-auto pr-1">
                        {receipt.variables.length === 0 ? (
                            <div className="text-xs text-neutral-600 italic px-1">No variables declared</div>
                        ) : (
                            receipt.variables.map((v, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-2 rounded bg-neutral-900 border border-neutral-800/60"
                                >
                                    <span className="text-neutral-400 truncate max-w-[140px]">{v.name}</span>
                                    <span className={`font-semibold ${v.isError ? 'text-rose-400' : 'text-neutral-200'}`}>
                                        {v.formattedValue}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Receipt Total Calculation Card */}
                <div className="flex flex-col gap-2">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 px-1">
                        Output Summary
                    </div>
                    <div className="p-3.5 rounded-lg bg-neutral-900/90 border border-emerald-500/30 flex flex-col gap-1.5">
                        <span className="text-[11px] font-mono text-neutral-400 truncate">
                            {receipt.primaryVariable}
                        </span>
                        <span className="text-2xl font-bold font-mono text-emerald-400">
                            {receipt.primaryValue}
                        </span>
                        {receipt.secondaryMetrics && receipt.secondaryMetrics.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 mt-1 border-t border-neutral-800/60 pt-2">
                                {receipt.secondaryMetrics.map((metric, i) => (
                                    <span key={i} className="text-[10px] text-neutral-400 font-mono">
                                        {metric.label}: <strong className="text-neutral-200">{metric.value}</strong>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Meta */}
            <div className="border-t border-neutral-800/80 pt-3 px-1 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                <span>Section C</span>
                <span>320px</span>
            </div>
        </aside>
    );
}