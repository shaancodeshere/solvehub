import React from 'react';

export default function SectionA() {
    return (
        <aside className="w-full md:w-[260px] md:min-w-[260px] md:max-w-[260px] h-full border-r border-neutral-800 bg-neutral-950 p-4 flex flex-col justify-between text-neutral-200 select-none">
            <div className="flex flex-col gap-6">
                {/* Brand / Logo */}
                <div className="flex items-center gap-2 px-2">
                    <div className="h-6 w-6 rounded bg-emerald-500 flex items-center justify-center font-bold text-black text-xs">
                        S
                    </div>
                    <span className="font-semibold tracking-tight text-sm text-white">SolveHub</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 ml-auto">v1.0</span>
                </div>

                {/* Mode Navigation */}
                <nav className="flex flex-col gap-1">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 px-2 mb-1">
                        Modes
                    </div>
                    <button className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md bg-neutral-800/80 text-white text-xs font-medium transition hover:bg-neutral-800">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        Canvas Mode
                    </button>
                    <button className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 text-xs font-medium transition">
                        <span className="w-2 h-2 rounded-full bg-neutral-600"></span>
                        Curated Tools
                    </button>
                </nav>

                {/* Workspace Quick Links */}
                <div className="flex flex-col gap-1">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 px-2 mb-1">
                        Library
                    </div>
                    <div className="text-xs text-neutral-500 px-2 italic">
                        No saved sheets yet
                    </div>
                </div>
            </div>

            {/* Footer Meta */}
            <div className="border-t border-neutral-800/80 pt-3 px-2 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                <span>Section A</span>
                <span>260px</span>
            </div>
        </aside>
    );
}