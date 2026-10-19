'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCalculatorById } from '@/lib/calculators';
import { sendCalculatorToCanvas } from '@/lib/canvasBridge';
import { getCurrencySymbolFromCode } from '@/lib/canvasEngine';
import { CalculationResult, MetricItem } from '@/types/calculator';

interface Props {
    calculatorId: string;
    initialParams?: Record<string, any>;
    currency?: string;
}

export default function UniversalCalculator({ calculatorId, initialParams, currency }: Props) {
    const router = useRouter();
    const [isSent, setIsSent] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Safe initial currency code matching SSR exactly
    const [currencyCode, setCurrencyCode] = useState<string | null>(() => {
        if (currency) return currency.trim().toUpperCase();
        if (initialParams?.currency) return String(initialParams.currency).trim().toUpperCase();
        return null;
    });

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

            // Ingest currency if present
            const currParam = urlParams.get('currency');
            if (currParam) {
                setCurrencyCode(currParam.trim().toUpperCase());
            } else if (queryData.currency) {
                setCurrencyCode(String(queryData.currency).trim().toUpperCase());
            } else if (currency) {
                setCurrencyCode(currency.trim().toUpperCase());
            }

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

    // 4. Currency symbols and replacement helpers
    const targetCurrencySymbol = useMemo(() => {
        const code = isMounted
            ? currencyCode
            : (currency?.trim().toUpperCase() || (initialParams?.currency ? String(initialParams.currency).trim().toUpperCase() : null));
        if (!code) return null;
        return getCurrencySymbolFromCode(code);
    }, [isMounted, currencyCode, currency, initialParams]);

    const isCurrencySymbol = (str?: string): boolean => {
        if (!str) return false;
        const trimmed = str.trim();
        return ['₹', '$', '€', '£', '¥', 'C$', 'AED'].includes(trimmed);
    };

    const replaceCurrencyInString = (text: any): any => {
        if (typeof text !== 'string' || !targetCurrencySymbol) return text;
        return text.replace(/(₹|€|£|¥|C\$|\$)/g, () => targetCurrencySymbol);
    };

    const replacePrefix = (prefix?: string): string | undefined => {
        if (!prefix) return prefix;
        if (targetCurrencySymbol && isCurrencySymbol(prefix)) {
            return targetCurrencySymbol;
        }
        return prefix;
    };

    // 4. Compute outputs dynamically
    const result = useMemo<CalculationResult>(() => {
        try {
            const rawRes = calculator.calculate(formValues);
            if (!rawRes) {
                return {
                    primaryOutput: { label: 'Result', value: '-' },
                    secondaryMetrics: [],
                };
            }

            const rawPrimary = rawRes.primaryOutput || { label: 'Result', value: '-' };
            const formattedPrimary = {
                ...rawPrimary,
                prefix: replacePrefix(rawPrimary.prefix),
                value: replaceCurrencyInString(rawPrimary.value),
                suffix: replaceCurrencyInString(rawPrimary.suffix),
            };

            const pLabel = String(rawPrimary.label || '').trim().toLowerCase();
            const pVal = String(rawPrimary.value ?? '').trim().toLowerCase();
            const rawSecondary: MetricItem[] = rawRes.secondaryMetrics || rawRes.secondaryOutputs || [];

            // Filter out any secondary metric that duplicates the primary output or another secondary metric
            const seenLabels = new Set<string>();
            const filtered = rawSecondary.filter((m: MetricItem) => {
                if (!m || !m.label) return false;
                const mLabel = String(m.label || '').trim().toLowerCase();
                const mVal = String(m.value ?? '').trim().toLowerCase();
                // Deduplicate against primary output
                if (mLabel === pLabel && mVal === pVal) return false;
                if (mLabel === pLabel) return false;
                // Deduplicate against previously seen secondary metrics
                if (seenLabels.has(mLabel)) return false;
                seenLabels.add(mLabel);
                return true;
            });

            const formattedSecondary = filtered.map((m: MetricItem) => ({
                ...m,
                prefix: replacePrefix(m.prefix),
                value: replaceCurrencyInString(m.value),
                suffix: replaceCurrencyInString(m.suffix),
            }));

            return {
                ...rawRes,
                primaryOutput: formattedPrimary,
                secondaryMetrics: formattedSecondary,
                secondaryOutputs: formattedSecondary,
            };
        } catch {
            return {
                primaryOutput: { label: 'Error', value: 'Calculation failed' },
                secondaryMetrics: [{ label: 'Details', value: 'Check your input parameters' }],
            };
        }
    }, [calculator, formValues, targetCurrencySymbol]);

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
        <div className="max-w-3xl w-full mx-auto p-4 sm:p-5 bg-[var(--surface)] dark:bg-[#161b22] rounded-2xl shadow-xl border border-[var(--border)] dark:border-slate-800 text-slate-800 dark:text-slate-100 font-mono transition-colors overflow-hidden">
            {/* Header */}
            <div className="mb-2 sm:mb-2.5">
                <h1 className="text-xl font-bold font-mono tracking-tight text-slate-900 dark:text-white mb-0.5">{calculator.name}</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2.5 line-clamp-1 max-w-2xl leading-normal">{calculator.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 min-w-0">
                {/* Form Inputs */}
                <div className="space-y-2 min-w-0">
                    <h2 className="text-[10px] font-mono tracking-wider mb-1.5 font-semibold uppercase text-slate-400 dark:text-slate-400">
                        Parameters
                    </h2>
                    {calculator.inputs.map((input) => (
                        <div key={input.id} className="space-y-0.5">
                            <label className="block text-xs font-mono font-medium mb-0.5 text-slate-700 dark:text-slate-300">
                                {input.name}
                            </label>

                            {/* Dropdown controls */}
                            {input.type === 'dropdown' ? (
                                <div className="relative w-full">
                                    <select
                                        suppressHydrationWarning
                                        value={formValues[input.id] ?? input.defaultValue}
                                        onChange={(e) => handleInputChange(input.id, e.target.value)}
                                        className="w-full appearance-none rounded-lg border border-[#cbd5e1] dark:border-slate-800 bg-[#f3f6f9] dark:bg-slate-900/90 pl-3 pr-8 py-1.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition cursor-pointer"
                                    >
                                        {input.options?.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 dark:text-slate-500 text-xs">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            ) : (
                                /* Numeric, Currency, Text, Date controls */
                                <div className="relative">
                                    {input.prefix && (
                                        <span
                                            suppressHydrationWarning
                                            className="absolute left-2.5 top-1.5 text-slate-400 text-xs font-mono pointer-events-none select-none"
                                        >
                                            {replacePrefix(input.prefix)}
                                        </span>
                                    )}
                                    <input
                                        suppressHydrationWarning
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
                                        className={`w-full rounded-lg border border-[#cbd5e1] dark:border-slate-800 bg-[#f3f6f9] dark:bg-slate-900/90 py-1.5 px-3 text-xs font-mono text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none transition ${input.prefix ? 'pl-7' : ''
                                            } ${input.suffix ? 'pr-9' : ''}`}
                                    />
                                    {input.suffix && (
                                        <span
                                            suppressHydrationWarning
                                            className="absolute right-2.5 top-1.5 text-slate-400 text-xs font-mono pointer-events-none select-none"
                                        >
                                            {input.suffix}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Dynamic Output Receipt */}
                <div className="bg-[var(--surface-subtle)] dark:bg-[#0e131b] p-3 sm:p-3.5 rounded-xl border border-[var(--border)] dark:border-slate-800 flex flex-col justify-between overflow-hidden min-w-0">
                    <div className="min-w-0 overflow-hidden">
                        <h2 className="text-[10px] font-mono tracking-wider mb-1.5 font-semibold uppercase text-slate-400 dark:text-slate-400">
                            Calculation Output
                        </h2>

                        {/* Primary Metric Card (Hero) */}
                        <div className="py-2 px-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/40 rounded-lg mb-2 overflow-hidden">
                            <span
                                suppressHydrationWarning
                                className="text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-0.5 truncate"
                            >
                                {result.primaryOutput.label}
                            </span>
                            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 min-w-0">
                                <span
                                    suppressHydrationWarning
                                    className="text-xl font-bold font-mono text-slate-900 dark:text-white tracking-tight break-words"
                                >
                                    {result.primaryOutput.prefix}
                                    {result.primaryOutput.value}
                                </span>
                                {result.primaryOutput.suffix && (
                                    <span
                                        suppressHydrationWarning
                                        className="text-xs sm:text-sm font-mono font-medium text-emerald-700 dark:text-emerald-300"
                                    >
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
                            className={`w-full py-1.5 px-3 rounded-lg border text-xs font-mono font-medium transition flex items-center justify-center gap-1.5 mb-2 shadow-sm active:scale-[0.98] ${isSent
                                ? 'bg-emerald-600 dark:bg-emerald-900/80 border-emerald-500 text-white'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 border-emerald-500/40 hover:border-emerald-500 dark:text-emerald-300 dark:hover:text-white'
                                }`}
                        >
                            <svg
                                className="w-3.5 h-3.5 stroke-current"
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
                            <div className="space-y-0.5 min-w-0">
                                {result.secondaryMetrics.map((metric: MetricItem, idx: number) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between gap-3 min-w-0 py-1 border-b border-slate-200 dark:border-slate-800/80 last:border-b-0"
                                    >
                                        <span
                                            suppressHydrationWarning
                                            className="text-xs font-mono text-slate-600 dark:text-slate-400 truncate min-w-0"
                                            title={metric.label}
                                        >
                                            {metric.label}
                                        </span>
                                        <span
                                            suppressHydrationWarning
                                            className="text-xs font-mono font-bold text-slate-900 dark:text-white shrink-0 text-right whitespace-nowrap"
                                        >
                                            {metric.prefix}
                                            {metric.value}
                                            {metric.suffix ? ` ${metric.suffix}` : ''}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <p className="text-[10px] text-slate-400 mt-2 text-center font-mono">
                        Deterministic calculation engine • SolveHub
                    </p>
                </div>
            </div>
        </div>
    );
}