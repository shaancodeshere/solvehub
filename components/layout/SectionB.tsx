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
        <main className="flex-1 h-full bg-[var(--background)] overflow-y-auto flex flex-col justify-between text-[var(--foreground)]">
            {/* Workspace Header Bar */}
            <header className="h-12 border-b border-[var(--border)] px-6 flex items-center justify-between text-xs font-mono text-[var(--muted)] bg-[var(--surface-subtle)] shrink-0 select-none">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[var(--muted)] shrink-0">Mode:</span>
                    <span className="text-[var(--foreground)] font-semibold tracking-wide uppercase truncate">
                        {mode === 'canvas' ? 'Canvas (Scratchpad)' : 'Curated Tools'}
                    </span>
                </div>
                <div className="flex items-center gap-4 shrink-0 pl-4">
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1c5f27] dark:bg-[#cff060] animate-pulse" />
                        <span className="text-[var(--muted)]">Auto-eval</span>
                    </div>
                    <span className="text-[var(--border)] hidden sm:inline">|</span>
                    <span className="text-[var(--muted)] hidden sm:inline">Section B</span>
                </div>
            </header>

            {/* Main Interaction Canvas Area */}
            <div className="p-8 max-w-3xl w-full mx-auto flex-1 flex flex-col gap-4 font-mono">
                {mode === 'canvas' ? (
                    <div className="flex flex-col gap-3 h-full">
                        <div className="flex items-center justify-between">
                            <span className="text-xs uppercase text-[var(--muted)] tracking-wider font-semibold">
                                Interactive Scratchpad
                            </span>
                            {rawScratchpad.length > 0 && (
                                <button
                                    onClick={handleClearScratchpad}
                                    className="text-xs text-[var(--muted)] hover:text-rose-500 transition cursor-pointer"
                                >
                                    Clear Buffer
                                </button>
                            )}
                        </div>
                        <textarea
                            value={rawScratchpad}
                            onChange={(e) => setRawScratchpad(e.target.value)}
                            placeholder="Type your calculations here... (e.g., price 200)"
                            className="w-full h-64 p-4 rounded-xl bg-[var(--background)] border border-[var(--border)] text-sm sm:text-base text-[var(--foreground)] font-mono focus:outline-none focus:border-[var(--foreground)] resize-none leading-relaxed transition placeholder:text-[var(--muted)]"
                            style={{
                                backgroundImage: 'radial-gradient(circle, var(--canvas-dot) 1px, transparent 1px)',
                                backgroundSize: '16px 24px',
                            }}
                            spellCheck={false}
                        />
                        <p className="text-xs text-[var(--muted)] italic">
                            Variables and math evaluate automatically into Section C as you type.
                        </p>
                    </div>
                ) : (
                    <CuratedCatalog />
                )}
            </div>

            {/* Workspace Status Footer */}
            <footer className="h-8 border-t border-[var(--border)] px-6 flex items-center justify-between text-xs font-mono text-[var(--muted)] bg-[var(--surface-subtle)] shrink-0 select-none">
                <span>Ready</span>
                <span>UTF-8 • Client Execution Engine</span>
            </footer>
        </main>
    );
}
