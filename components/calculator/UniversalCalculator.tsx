'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCalculatorById } from '@/lib/calculators';
import { sendCalculatorToCanvas } from '@/lib/canvasBridge';

interface Props {
    calculatorId: string;
    initialParams?: Record<string, any>;
}

export default function UniversalCalculator({ calculatorId, initialParams }: Props) {
    const router = useRouter();
    const [isSent, setIsSent] = useState(false);

    // 1. Look up the calculator directly inside the Client Component
    const calculator = useMemo(() => getCalculatorById(calculatorId), [calculatorId]);

    // 2. Initialize input state using default values from definition, overridden by initialParams prop if provided
    const [formValues, setFormValues] = useState<Record<string, any>>(() => {
        if (!calculator) return {};
        const initial: Record<string, any> = {};
        calculator.inputs.forEach((input) => {
            initial[input.id] = initialParams?.[input.id] ?? input.defaultValue;
        });
        return initial;
    });

    // 3. Hydrate from URL query parameters (?params=... or individual keys like ?principal=5000&rate=12)
    useEffect(() => {
        if (typeof window === 'undefined' || !calculator) return;

        try {
            const search = window.location.search;
            if (!search) return;

            const urlParams = new URLSearchParams(search);
            const paramsJson = urlParams.get('params');
            let queryData: Record<string, any> = {};

            if (paramsJson) {
                try {
                    queryData = JSON.parse(paramsJson);
                } catch {
                    // Ignore malformed JSON string
                }
            }

            // Also ingest individual URL search parameters
            urlParams.forEach((val, key) => {
                if (key !== 'params' && val !== '') {
                    queryData[key] = val;
                }
            });

            if (Object.keys(queryData).length === 0) return;

            setFormValues((prev) => {
                const next = { ...prev };
                calculator.inputs.forEach((input) => {
                    let matchedVal = queryData[input.id];

                    // Check case-insensitive key match
                    if (matchedVal === undefined) {
                        const lowerId = input.id.toLowerCase();
                        for (const [k, v] of Object.entries(queryData)) {
                            if (k.toLowerCase() === lowerId) {
                                matchedVal = v;
                                break;
                            }
                        }
                    }

                    // Check common aliases
                    if (matchedVal === undefined) {
                        if (
                            input.id === 'monthlyInvestment' ||
                            input.id === 'loanAmount' ||
                            input.id === 'propertyPrice' ||
                            input.id === 'homePrice' ||
                            input.id === 'amount' ||
                            input.id === 'principal'
                        ) {
                            matchedVal =
                                queryData.principal ??
                                queryData.amount ??
                                queryData.price ??
                                queryData.loan ??
                                queryData.investment ??
                                queryData.monthlyInvestment;
                        } else if (
                            input.id === 'expectedReturnRate' ||
                            input.id === 'interestRate' ||
                            input.id === 'mortgageRate' ||
                            input.id === 'vatRate' ||
                            input.id === 'rate'
                        ) {
                            matchedVal =
                                queryData.rate ??
                                queryData.interestRate ??
                                queryData.returnRate ??
                                queryData.interest ??
                                queryData.vatRate;
                        } else if (
                            input.id === 'investmentPeriodYears' ||
                            input.id === 'tenureYears' ||
                            input.id === 'mortgageTermYears' ||
                            input.id === 'amortizationYears' ||
                            input.id === 'years'
                        ) {
                            matchedVal =
                                queryData.tenure ??
                                queryData.years ??
                                queryData.period ??
                                queryData.term ??
                                queryData.tenureYears ??
                                queryData.mortgageTermYears;
                        } else if (input.id === 'depositAmount' || input.id === 'downPaymentDollars') {
                            matchedVal = queryData.deposit ?? queryData.downPayment ?? queryData.downPaymentDollars ?? queryData.depositAmount;
                        } else if (input.id === 'discountPct') {
                            matchedVal = queryData.discountPct ?? queryData.discount ?? queryData.pct ?? queryData.rate;
                        } else if (input.id === 'originalPrice') {
                            matchedVal = queryData.originalPrice ?? queryData.price ?? queryData.amount ?? queryData.subtotal;
                        } else if (input.id === 'tipPercentage') {
                            matchedVal = queryData.tipPercentage ?? queryData.tip ?? queryData.gratuity ?? queryData.rate;
                        } else if (input.id === 'billAmount') {
                            matchedVal = queryData.billAmount ?? queryData.bill ?? queryData.amount ?? queryData.subtotal;
                        } else if (input.id === 'repaymentType' || input.id === 'mode' || input.id === 'paymentSchedule') {
                            matchedVal = queryData[input.id] ?? queryData.mode ?? queryData.type;
                        }
                    }

                    if (matchedVal !== undefined && matchedVal !== null && matchedVal !== '') {
                        if (input.type === 'number' || input.type === 'currency' || input.type === 'percentage') {
                            const num = Number(matchedVal);
                            if (!isNaN(num)) next[input.id] = num;
                        } else if (input.type === 'dropdown') {
                            const isNumericOption = input.options?.some((opt) => typeof opt.value === 'number');
                            if (isNumericOption && !isNaN(Number(matchedVal))) {
                                next[input.id] = Number(matchedVal);
                            } else {
                                next[input.id] = matchedVal;
                            }
                        } else {
                            next[input.id] = matchedVal;
                        }
                    }
                });
                return next;
            });
        } catch (e) {
            console.error('Error hydrating calculator query parameters:', e);
        }
    }, [calculator]);

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
        } catch {
            return {
                primaryOutput: { label: 'Error', value: 'Calculation failed' },
                secondaryMetrics: [{ label: 'Details', value: 'Check your input parameters' }],
            };
        }
    }, [calculator, formValues]);

    // 5. Send parameters to Section B and metrics to Section C
    const handleSendToCanvas = () => {
        if (!result?.primaryOutput || result.primaryOutput.label === 'Error') return;

        // Collect parameters for Section B (Notepad)
        const parameters = calculator.inputs.map((input) => ({
            label: input.name,
            value: formValues[input.id] ?? input.defaultValue,
        }));

        sendCalculatorToCanvas({
            parameters,
            primaryOutput: result.primaryOutput,
            secondaryMetrics: result.secondaryMetrics || [],
        });

        setIsSent(true);

        // Redirect smoothly back to canvas
        setTimeout(() => {
            router.push('/');
        }, 600);
    };

    return (
        <div className="max-w-3xl w-full mx-auto p-6 sm:p-8 bg-[#161b22] rounded-2xl shadow-2xl border border-slate-800 text-slate-100 font-mono">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">{calculator.name}</h1>
                <p className="text-sm sm:text-base text-slate-400 mt-2 font-sans leading-relaxed">{calculator.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form Inputs */}
                <div className="space-y-5">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                        Parameters
                    </h2>
                    {calculator.inputs.map((input) => (
                        <div key={input.id} className="space-y-1.5">
                            <label className="block text-sm font-medium text-slate-300">
                                {input.name}
                            </label>

                            {/* Dropdown controls */}
                            {input.type === 'dropdown' ? (
                                <select
                                    value={formValues[input.id] ?? input.defaultValue}
                                    onChange={(e) => handleInputChange(input.id, e.target.value)}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2 px-3 text-sm text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
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
                                        <span className="absolute left-3 top-2 text-slate-400 text-sm">
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
                                        className={`w-full rounded-xl border border-slate-700 bg-slate-900 py-2 px-3 text-sm text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none ${input.prefix ? 'pl-8' : ''
                                            } ${input.suffix ? 'pr-12' : ''}`}
                                    />
                                    {input.suffix && (
                                        <span className="absolute right-3 top-2 text-slate-400 text-sm">
                                            {input.suffix}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Dynamic Output Receipt */}
                <div className="bg-[#0e131b] p-6 sm:p-7 rounded-2xl border border-slate-800 flex flex-col justify-between">
                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
                            Calculation Output
                        </h2>

                        {/* Primary Metric Card */}
                        <div className="p-5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl mb-5">
                            <span className="text-sm font-semibold text-emerald-400 uppercase tracking-wide block">
                                {result.primaryOutput.label}
                            </span>
                            <div className="text-2xl sm:text-3xl font-mono font-bold text-white mt-1.5 break-all">
                                {result.primaryOutput.prefix}
                                {result.primaryOutput.value}
                                {result.primaryOutput.suffix && (
                                    <span className="text-sm sm:text-base font-normal text-emerald-300 ml-1.5">
                                        {result.primaryOutput.suffix}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* "Send to Canvas" Action Button */}
                        <button
                            type="button"
                            onClick={handleSendToCanvas}
                            disabled={isSent || result.primaryOutput.label === 'Error'}
                            className={`w-full py-2.5 px-3.5 rounded-xl border text-sm font-mono font-medium transition flex items-center justify-center gap-2 mb-5 shadow-sm active:scale-[0.98] ${isSent
                                ? 'bg-emerald-900/80 border-emerald-500 text-white'
                                : 'bg-emerald-950/50 hover:bg-emerald-900/60 border-emerald-500/40 hover:border-emerald-500 text-emerald-300 hover:text-white'
                                }`}
                        >
                            <svg
                                className="w-4 h-4 stroke-current"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                            </svg>
                            <span>{isSent ? 'Added to Canvas' : 'Send to Canvas'}</span>
                        </button>

                        {/* Secondary Metrics */}
                        {result.secondaryMetrics && result.secondaryMetrics.length > 0 && (
                            <div className="space-y-3 pt-2">
                                {result.secondaryMetrics.map((metric, idx) => (
                                    <div
                                        key={idx}
                                        className="flex justify-between items-center text-sm border-b border-slate-800/80 pb-2.5"
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

                    <p className="text-xs text-slate-500 mt-6 text-center font-mono">
                        Deterministic calculation engine • SolveHub
                    </p>
                </div>
            </div>
        </div>
    );
}