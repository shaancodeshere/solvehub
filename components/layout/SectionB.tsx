'use client';

import React, { useEffect } from 'react';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { evaluateScratchpad } from '@/lib/evaluator';

export default function SectionB() {
    const { mode, rawScratchpad, setRawScratchpad, setReceipt } = useWorkspace();

    // Evaluate calculation whenever text changes
    useEffect(() => {
        if (mode === 'canvas') {
            const result = evaluateScratchpad(rawScratchpad);
            setReceipt(result.receipt);
        }
    }, [rawScratchpad, mode, setReceipt]);

    return (
        <main className="flex-1 h-full bg-neutral-900 overflow-y-auto flex flex-col justify-between text-neutral-100">
            {/* Workspace Header Bar */}
            <header className="h-12 border-b border-neutral-800 px-6 flex items-center justify-between text-xs font-mono text-neutral-400 bg-neutral-950/40">
                <div className="flex items-center gap-2">
                    <span className="text-neutral-500">Active Mode:</span>
                    <span className="text-emerald-400 font-semibold uppercase">
                        {mode === 'canvas' ? 'Canvas (Scratchpad)' : 'Curated Tools Catalog'}
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <span>Auto-eval: <span className="text-emerald-400 font-semibold">ON</span></span>
                    <span>Section B (Fluid)</span>
                </div>
            </header>

            {/* Main Interaction Canvas Area */}
            <div className="p-8 max-w-3xl w-full mx-auto flex-1 flex flex-col gap-4 font-mono">
                {mode === 'canvas' ? (
                    <div className="flex flex-col gap-3 h-full">
                        <div className="text-xs uppercase text-neutral-500 tracking-wider">
                            Interactive Scratchpad
                        </div>
                        <textarea
                            value={rawScratchpad}
                            onChange={(e) => setRawScratchpad(e.target.value)}
                            placeholder="Type your calculations here... (e.g., revenue = 5000 * 12)"
                            className="w-full h-64 p-4 rounded-lg bg-neutral-950/70 border border-neutral-800 text-sm text-neutral-200 font-mono focus:outline-none focus:border-emerald-500/50 resize-none leading-relaxed transition"
                            spellCheck={false}
                        />
                        <p className="text-xs text-neutral-500 italic">
                            Variables and math evaluate automatically into Section C as you type.
                        </p>
                    </div>
                ) : (
                    <div className="border border-neutral-800 rounded-lg p-6 bg-neutral-950/40 flex flex-col gap-3">
                        <div className="text-xs uppercase text-emerald-400 font-semibold tracking-wider">Curated Catalog Mode</div>
                        <p className="text-sm text-neutral-300">
                            Interactive domain calculator cards (Margin Calculators, Amortization, ROI models) mount here.
                        </p>
                    </div>
                )}
            </div>

            {/* Workspace Status Footer */}
            <footer className="h-8 border-t border-neutral-800 px-6 flex items-center justify-between text-[11px] font-mono text-neutral-500 bg-neutral-950/40">
                <span>Ready</span>
                <span>UTF-8 • Client Execution Engine</span>
            </footer>
        </main>
    );
}