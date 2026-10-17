'use client';

import React, { useState } from 'react';
import { CURATED_TOOLS } from '@/lib/curatedTools';
import CuratedToolView from './CuratedToolView';

export default function CuratedCatalog() {
    const [selectedToolId, setSelectedToolId] = useState<string | null>(null);

    const activeTool = CURATED_TOOLS.find((t) => t.id === selectedToolId);

    if (activeTool) {
        return <CuratedToolView tool={activeTool} onBack={() => setSelectedToolId(null)} />;
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-300">
                    Curated Calculator Catalog
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                    Select a domain calculator with pre-built models and instant parameter controls.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CURATED_TOOLS.map((tool) => (
                    <div
                        key={tool.id}
                        onClick={() => setSelectedToolId(tool.id)}
                        className="p-5 rounded-xl bg-neutral-950 border border-neutral-800/80 hover:border-emerald-500/40 cursor-pointer transition flex flex-col justify-between group"
                    >
                        <div className="flex flex-col gap-2.5">
                            <div className="flex items-center justify-between">
                                <span className="text-2xl">{tool.icon}</span>
                                <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400">
                                    {tool.category}
                                </span>
                            </div>
                            <h3 className="text-sm font-semibold text-neutral-200 group-hover:text-emerald-400 transition">
                                {tool.title}
                            </h3>
                            <p className="text-xs text-neutral-400 leading-relaxed">
                                {tool.description}
                            </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-neutral-900 text-xs font-mono text-emerald-400/80 flex items-center justify-between">
                            <span>Open Tool</span>
                            <span>→</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}