'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/lib/WorkspaceContext';

export default function MarginCalculator() {
    const { setReceipt } = useWorkspace();

    const [revenue, setRevenue] = useState<number>(100000);
    const [cogs, setCogs] = useState<number>(35000);
    const [opex, setOpex] = useState<number>(25000);

    const grossProfit = revenue - cogs;
    const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
    const netProfit = grossProfit - opex;
    const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    // Sync calculations directly to Section C live receipt
    useEffect(() => {
        setReceipt({
            primaryVariable: 'Net Operating Income',
            primaryValue: `$${netProfit.toLocaleString('en-US')}`,
            secondaryMetrics: [
                { label: 'Gross Margin', value: `${grossMargin.toFixed(1)}%` },
                { label: 'Net Margin', value: `${netMargin.toFixed(1)}%` },
            ],
            variables: [
                { name: 'Revenue', value: revenue, rawExpression: `${revenue}`, formattedValue: `$${revenue.toLocaleString('en-US')}` },
                { name: 'COGS', value: cogs, rawExpression: `${cogs}`, formattedValue: `$${cogs.toLocaleString('en-US')}` },
                { name: 'Gross Profit', value: grossProfit, rawExpression: 'Revenue - COGS', formattedValue: `$${grossProfit.toLocaleString('en-US')}` },
                { name: 'Operating Expenses', value: opex, rawExpression: `${opex}`, formattedValue: `$${opex.toLocaleString('en-US')}` },
            ],
        });
    }, [revenue, cogs, opex, grossProfit, grossMargin, netProfit, netMargin, setReceipt]);

    return (
        <div className="flex flex-col gap-5 p-6 rounded-lg bg-neutral-950 border border-neutral-800">
            <div>
                <h3 className="text-sm font-semibold text-neutral-200">Gross & Net Margin Calculator</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                    Adjust inputs below to simulate unit economics and profitability.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-mono uppercase text-neutral-400">Total Revenue ($)</label>
                    <input
                        type="number"
                        value={revenue}
                        onChange={(e) => setRevenue(Number(e.target.value) || 0)}
                        className="p-2.5 rounded bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-200 focus:outline-none focus:border-emerald-500/50"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-mono uppercase text-neutral-400">Cost of Goods (COGS) ($)</label>
                    <input
                        type="number"
                        value={cogs}
                        onChange={(e) => setCogs(Number(e.target.value) || 0)}
                        className="p-2.5 rounded bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-200 focus:outline-none focus:border-emerald-500/50"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-mono uppercase text-neutral-400">Operating Expenses ($)</label>
                    <input
                        type="number"
                        value={opex}
                        onChange={(e) => setOpex(Number(e.target.value) || 0)}
                        className="p-2.5 rounded bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-200 focus:outline-none focus:border-emerald-500/50"
                    />
                </div>
            </div>
        </div>
    );
}