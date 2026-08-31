'use client';

import React, { useState, useMemo } from 'react';
import { getCalculatorById } from '@/lib/calculators';

interface Props {
    calculatorId: string;
}

export default function UniversalCalculator({ calculatorId }: Props) {
    // 1. Look up the calculator directly inside the Client Component
    const calculator = useMemo(() => getCalculatorById(calculatorId), [calculatorId]);

    // 2. Initialize input state using default values from definition
    const [formValues, setFormValues] = useState<Record<string, any>>(() => {
        if (!calculator) return {};
        const initial: Record<string, any> = {};
        calculator.inputs.forEach((input) => {
            initial[input.id] = input.defaultValue;
        });
        return initial;
    });

    if (!calculator) {
        return (
            <div className="max-w-3xl mx-auto p-6 bg-slate-800 rounded-xl text-white">
                Calculator not found.
            </div>
        );
    }

    // 3. Update reactive values as user edits fields
    const handleInputChange = (id: string, value: any) => {
        setFormValues((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    // 4. Compute outputs dynamically
    const result = useMemo(() => {
        try {
            return calculator.calculate(formValues);
        } catch (err) {
            return {
                primaryOutput: { label: 'Error', value: 'Calculation failed' },
                secondaryMetrics: [{ label: 'Details', value: 'Check your input parameters' }],
            };
        }
    }, [calculator, formValues]);

    return (
        <div className="max-w-3xl mx-auto p-6 bg-slate-800 rounded-xl shadow-lg border border-slate-700 text-slate-100">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">{calculator.name}</h1>
                <p className="text-sm text-slate-400 mt-1">{calculator.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form Inputs */}
                <div className="space-y-4">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Parameters
                    </h2>
                    {calculator.inputs.map((input) => (
                        <div key={input.id} className="space-y-1">
                            <label className="block text-sm font-medium text-slate-300">
                                {input.name}
                            </label>

                            {/* Dropdown controls */}
                            {input.type === 'dropdown' ? (
                                <select
                                    value={formValues[input.id] ?? input.defaultValue}
                                    onChange={(e) => handleInputChange(input.id, e.target.value)}
                                    className="w-full rounded-lg border border-slate-600 bg-slate-900 p-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                >
                                    {input.options?.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                /* Numeric, Currency, Text, Date controls */
                                <div className="relative">
                                    {input.prefix && (
                                        <span className="absolute left-3 top-2 text-slate-500 text-sm">
                                            {input.prefix}
                                        </span>
                                    )}
                                    <input
                                        type={input.type === 'text' || input.type === 'date' ? input.type : 'number'}
                                        value={formValues[input.id] ?? input.defaultValue}
                                        min={input.min}
                                        max={input.max}
                                        step={input.step || 'any'}
                                        onChange={(e) =>
                                            handleInputChange(
                                                input.id,
                                                input.type === 'number' || input.type === 'currency' || input.type === 'percentage'
                                                    ? parseFloat(e.target.value) || 0
                                                    : e.target.value
                                            )
                                        }
                                        className={`w-full rounded-lg border border-slate-600 bg-slate-900 p-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none ${input.prefix ? 'pl-7' : ''
                                            } ${input.suffix ? 'pr-12' : ''}`}
                                    />
                                    {input.suffix && (
                                        <span className="absolute right-3 top-2 text-slate-500 text-sm">
                                            {input.suffix}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Dynamic Output Receipt */}
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 flex flex-col justify-between">
                    <div>
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
                            Calculation Output
                        </h2>

                        {/* Primary Metric Card */}
                        <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-lg mb-4">
                            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                                {result.primaryOutput.label}
                            </span>
                            <div className="text-3xl font-bold text-white mt-1">
                                {result.primaryOutput.prefix}
                                {result.primaryOutput.value}
                                {result.primaryOutput.suffix && (
                                    <span className="text-lg font-normal text-emerald-300 ml-1">
                                        {result.primaryOutput.suffix}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Secondary Metrics */}
                        {result.secondaryMetrics && result.secondaryMetrics.length > 0 && (
                            <div className="space-y-3 pt-2">
                                {result.secondaryMetrics.map((metric, idx) => (
                                    <div
                                        key={idx}
                                        className="flex justify-between items-center text-sm border-b border-slate-800 pb-2"
                                    >
                                        <span className="text-slate-400">{metric.label}</span>
                                        <span className="font-semibold text-slate-200">
                                            {metric.prefix}
                                            {metric.value}
                                            {metric.suffix ? ` ${metric.suffix}` : ''}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <p className="text-xs text-slate-500 mt-6 text-center">
                        Deterministic calculation engine
                    </p>
                </div>
            </div>
        </div>
    );
}