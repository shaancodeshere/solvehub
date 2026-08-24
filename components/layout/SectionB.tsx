'use client';

import React, { useEffect } from 'react';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { evaluateScratchpad } from '@/lib/evaluator';
import CuratedCatalog from '@/components/curated/CuratedCatalog';

export default function SectionB() {
    const { mode, rawScratchpad, setRawScratchpad, setReceipt } = useWorkspace();

    useEffect(() => {
        if (mode === 'canvas') {
            const result = evaluateScratchpad(rawScratchpad);
            setReceipt(result.receipt);
        }
    }, [rawScratchpad, mode, setReceipt]);

    const handleClearScratchpad = () => {
        setRawScratchpad('');
    };

    return (
        <main className="flex-1 h-full bg-neutral-900 overflow-y-auto flex flex-col justify-between text-neutral-100">
            {/* Workspace Header Bar */}
            <header className="h-12 border-b border-neutral-800 px-6 flex items-center justify-between text-xs font-mono text-neutral-400 bg-neutral-950/60 shrink-0 select-none">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-neutral-500 shrink-0">Mode:</span>
                    <span className="text-emerald-400 font-semibold tracking-wide uppercase truncate">
                        {mode === 'canvas' ? 'Canvas (Scratchpad)' : 'Curated Tools'}
                    </span>
                </div>
                <div className="flex items-center gap-4 shrink-0 pl-4">
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-neutral-400">Auto-eval</span>
                    </div>
                    <span className="text-neutral-600 hidden sm:inline">|</span>
                    <span className="text-neutral-500 hidden sm:inline">Section B</span>
                </div>
            </header>

            {/* Main Interaction Canvas Area */}
            <div className="p-8 max-w-3xl w-full mx-auto flex-1 flex flex-col gap-4 font-mono">
                {mode === 'canvas' ? (
                    <div className="flex flex-col gap-3 h-full">
                        <div className="flex items-center justify-between">
                            <span className="text-xs uppercase text-neutral-500 tracking-wider">
                                Interactive Scratchpad
                            </span>
                            {rawScratchpad.length > 0 && (
                                <button
                                    onClick={handleClearScratchpad}
                                    className="text-[11px] text-neutral-500 hover:text-rose-400 transition"
                                >
                                    Clear Buffer
                                </button>
                            )}
                        </div>
                        <textarea
                            value={rawScratchpad}
                            onChange={(e) => setRawScratchpad(e.target.value)}
                            placeholder="Type your calculations here... (e.g., price 200)"
                            className="w-full h-64 p-4 rounded-lg bg-neutral-950/70 border border-neutral-800 text-sm text-neutral-200 font-mono focus:outline-none focus:border-emerald-500/50 resize-none leading-relaxed transition"
                            spellCheck={false}
                        />
                        <p className="text-xs text-neutral-500 italic">
                            Variables and math evaluate automatically into Section C as you type.
                        </p>
                    </div>
                ) : (
                    <CuratedCatalog />
                )}
            </div>

            {/* Workspace Status Footer */}
            <footer className="h-8 border-t border-neutral-800 px-6 flex items-center justify-between text-[11px] font-mono text-neutral-500 bg-neutral-950/60 shrink-0 select-none">
                <span>Ready</span>
                <span>UTF-8 • Client Execution Engine</span>
            </footer>
        </main>
    );
}