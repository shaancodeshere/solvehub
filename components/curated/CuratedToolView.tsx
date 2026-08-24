'use client';

import React, { useState, useEffect } from 'react';
import { CuratedTool } from '@/types/workspace';
import { useWorkspace } from '@/lib/WorkspaceContext';

interface CuratedToolViewProps {
    tool: CuratedTool;
    onBack: () => void;
}

export default function CuratedToolView({ tool, onBack }: CuratedToolViewProps) {
    const { setReceipt } = useWorkspace();

    // Initialize input state from default values in the tool schema
    const [values, setValues] = useState<Record<string, number>>(() => {
        const init: Record<string, number> = {};
        tool.inputs?.forEach((param) => {
            init[param.key] = param.defaultValue;
        });
        return init;
    });

    const handleInputChange = (key: string, val: number) => {
        setValues((prev) => ({ ...prev, [key]: val }));
    };

    // Run calculation logic and dispatch to Section C
    useEffect(() => {
        if (tool.calculate) {
            const receipt = tool.calculate(values);
            setReceipt(receipt);
        }
    }, [tool, values, setReceipt]);

    return (
        <div className="flex flex-col gap-6">
            {/* Top Navigation */}
            <button
                onClick={onBack}
                className="self-start text-xs font-mono text-neutral-400 hover:text-emerald-400 flex items-center gap-1.5 transition"
            >
                ← Back to Catalog
            </button>

            {/* Calculator Body */}
            <div className="flex flex-col gap-5 p-6 rounded-lg bg-neutral-950 border border-neutral-800">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{tool.icon}</span>
                    <div>
                        <h3 className="text-sm font-semibold text-neutral-200">{tool.title}</h3>
                        <p className="text-xs text-neutral-500 mt-0.5">{tool.description}</p>
                    </div>
                </div>

                {/* Dynamic Input Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                    {tool.inputs?.map((param) => (
                        <div key={param.key} className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-mono uppercase text-neutral-400">
                                {param.label} {param.prefix ? `(${param.prefix})` : param.suffix ? `(${param.suffix})` : ''}
                            </label>
                            <input
                                type="number"
                                value={values[param.key] ?? ''}
                                step={param.step || 1}
                                min={param.min}
                                max={param.max}
                                onChange={(e) => handleInputChange(param.key, Number(e.target.value) || 0)}
                                className="p-2.5 rounded bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-200 focus:outline-none focus:border-emerald-500/50"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}