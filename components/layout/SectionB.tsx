import React from 'react';

export default function SectionB() {
    return (
        <main className="flex-1 h-full bg-neutral-900 overflow-y-auto flex flex-col justify-between text-neutral-100">
            {/* Workspace Header Bar */}
            <header className="h-12 border-b border-neutral-800 px-6 flex items-center justify-between text-xs font-mono text-neutral-400 bg-neutral-950/40">
                <div className="flex items-center gap-2">
                    <span className="text-neutral-500">Active Mode:</span>
                    <span className="text-emerald-400 font-semibold">Canvas (Scratchpad)</span>
                </div>
                <div className="flex items-center gap-4">
                    <span>Auto-eval: <span className="text-neutral-200">ON</span></span>
                    <span>Section B (Fluid)</span>
                </div>
            </header>

            {/* Main Interaction Canvas Area */}
            <div className="p-8 max-w-3xl w-full mx-auto flex-1 flex flex-col gap-4 font-mono">
                <div className="border border-dashed border-neutral-800 rounded-lg p-6 bg-neutral-950/30 flex flex-col gap-3">
                    <div className="text-xs uppercase text-neutral-500 tracking-wider">Scratchpad Buffer</div>
                    <div className="text-sm text-neutral-300">
                        revenue = $120,000
                    </div>
                    <div className="text-sm text-neutral-300">
                        operating_expenses = $45,000
                    </div>
                    <div className="text-sm text-emerald-400 font-semibold border-t border-neutral-800/80 pt-2">
                        net_profit = revenue - operating_expenses
                    </div>
                </div>
                <p className="text-xs text-neutral-500 italic">
                    AST tokenizer and block execution engine will mount directly into this viewport during Phase 4.
                </p>
            </div>

            {/* Workspace Status Footer */}
            <footer className="h-8 border-t border-neutral-800 px-6 flex items-center justify-between text-[11px] font-mono text-neutral-500 bg-neutral-950/40">
                <span>Ready</span>
                <span>UTF-8 • Client Execution</span>
            </footer>
        </main>
    );
}