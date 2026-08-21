import React from 'react';

export default function SectionC() {
    return (
        <aside className="w-full md:w-[320px] md:min-w-[320px] md:max-w-[320px] h-full border-l border-neutral-800 bg-neutral-950 p-4 flex flex-col justify-between text-neutral-200 select-none">
            <div className="flex flex-col gap-5">
                {/* Panel Header */}
                <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3 px-1">
                    <span className="text-xs font-semibold tracking-wide text-neutral-300">Live Receipt</span>
                    <span className="text-[10px] font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                        Realtime
                    </span>
                </div>

                {/* Live Variable Tokens */}
                <div className="flex flex-col gap-2">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 px-1">
                        Registered Variables
                    </div>
                    <div className="space-y-1.5 font-mono text-xs">
                        <div className="flex items-center justify-between p-2 rounded bg-neutral-900 border border-neutral-800/60">
                            <span className="text-neutral-400">revenue</span>
                            <span className="text-neutral-200 font-semibold">$120,000</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded bg-neutral-900 border border-neutral-800/60">
                            <span className="text-neutral-400">operating_expenses</span>
                            <span className="text-neutral-200 font-semibold">$45,000</span>
                        </div>
                    </div>
                </div>

                {/* Receipt Total Calculation Card */}
                <div className="flex flex-col gap-2">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 px-1">
                        Output Summary
                    </div>
                    <div className="p-3.5 rounded-lg bg-neutral-900/90 border border-emerald-500/30 flex flex-col gap-1.5">
                        <span className="text-[11px] font-mono text-neutral-400">net_profit</span>
                        <span className="text-2xl font-bold font-mono text-emerald-400">$75,000</span>
                        <span className="text-[10px] text-neutral-500 font-mono mt-1">Margin: 62.5%</span>
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