export interface EvaluatedVariable {
    id: string;
    lineNumber: number;
    name: string;
    expression: string;
    value: number | null;
    formattedValue: string;
    isError: boolean;
    errorMessage?: string;
    type: 'base' | 'addition' | 'deduction' | 'summary' | 'modifier' | 'financing';
    isFinancing?: boolean;
    financingDetails?: {
        principal: number;
        monthlyInstallment: number;
        totalRepaid: number;
        totalInterest: number;
        tenureLabel: string;
        rate: number;
        months: number;
    };
    note?: string;
    currency?: string;
    isFlat?: boolean;
    calculatorSlug?: string;
    calculatorCategory?: string;
    initialParams?: Record<string, any>;
    metrics?: { label: string; value: string | number; prefix?: string; suffix?: string }[];
    isInvestment?: boolean;
}

export interface CanvasExecutionResult {
    variables: EvaluatedVariable[];
    financingItems: EvaluatedVariable[];
    lastResult: EvaluatedVariable | null;
    hasErrors: boolean;
    rawBaseSubtotal: number;
    totalDiscounts: number;
    totalTaxes: number;
    finalTotal: number;
    splitResult: EvaluatedVariable | null;
    detectedCurrency: string;
    scope?: Record<string, number>;
    heroTitle?: string;
    portfolioMetrics?: { label: string; value: string | number; prefix?: string; suffix?: string }[];
    customMetrics?: { label: string; value: string | number; prefix?: string; suffix?: string }[];
    hasInvestmentEngine?: boolean;
    hasTotal?: boolean;
}

export const KNOWN_CURRENCIES = [
    { symbol: 'C$', code: 'CAD', displaySymbol: 'C$' },
    { symbol: 'CAD', code: 'CAD', displaySymbol: 'C$' },
    { symbol: '£', code: 'GBP', displaySymbol: '£' },
    { symbol: 'GBP', code: 'GBP', displaySymbol: '£' },
    { symbol: '€', code: 'EUR', displaySymbol: '€' },
    { symbol: 'EUR', code: 'EUR', displaySymbol: '€' },
    { symbol: '₹', code: 'INR', displaySymbol: '₹' },
    { symbol: 'INR', code: 'INR', displaySymbol: '₹' },
    { symbol: '¥', code: 'JPY', displaySymbol: '¥' },
    { symbol: 'AED', code: 'AED', displaySymbol: 'AED' },
    { symbol: '$', code: 'USD', displaySymbol: '$' },
    { symbol: 'USD', code: 'USD', displaySymbol: '$' },
];

export function getCurrencySymbolFromCode(codeOrSymbol: string = 'USD'): string {
    if (!codeOrSymbol) return '$';
    const trimmed = codeOrSymbol.trim();
    const found = KNOWN_CURRENCIES.find(
        (c) => c.code.toLowerCase() === trimmed.toLowerCase() || c.symbol.toLowerCase() === trimmed.toLowerCase()
    );
    return found ? found.displaySymbol : '$';
}

export const SPELLING_CORRECTIONS: Record<string, string> = {
    accesories: 'accessories',
    accesory: 'accessory',
    intrest: 'interest',
    intreset: 'interest',
    discnt: 'discount',
    discont: 'discount',
    dicount: 'discount',
    subtotel: 'subtotal',
    subtotle: 'subtotal',
    totel: 'total',
    totle: 'total',
    morgage: 'mortgage',
    mortguage: 'mortgage',
    reciept: 'receipt',
    salry: 'salary',
    expence: 'expense',
    expences: 'expenses',
    bonas: 'bonus',
};

export function correctSpelling(text: string): string {
    let result = text;
    for (const [typo, replacement] of Object.entries(SPELLING_CORRECTIONS)) {
        const regex = new RegExp(`\\b${typo}\\b`, 'gi');
        result = result.replace(regex, (match) => {
            if (match === match.toUpperCase()) return replacement.toUpperCase();
            if (match[0] === match[0].toUpperCase()) {
                return replacement.charAt(0).toUpperCase() + replacement.slice(1);
            }
            return replacement;
        });
    }
    return result;
}

export function detectCurrencySymbol(text: string): string {
    if (/C\$|\bCAD\b/i.test(text)) return 'C$';
    if (/£|\bGBP\b/i.test(text)) return '£';
    if (/€|\bEUR\b/i.test(text)) return '€';
    if (/₹|\bINR\b/i.test(text)) return '₹';
    if (/¥|\bJPY\b/i.test(text)) return '¥';
    if (/\bAED\b/i.test(text)) return 'AED';
    if (/\$|\bUSD\b/i.test(text)) return '$';
    return '';
}

export function formatAmount(val: number, currency: string = ''): string {
    const isNeg = val < 0;
    const absVal = Math.abs(val);
    const formatted =
        absVal >= 1000
            ? Number.isInteger(absVal)
                ? absVal.toLocaleString('en-US')
                : absVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : Number.isInteger(absVal)
                ? absVal.toString()
                : absVal.toFixed(2);

    let prefix = '';
    if (currency) {
        if (['$', '€', '£', '₹', '¥', 'C$'].includes(currency)) {
            prefix = `${currency}`;
        } else {
            prefix = `${currency} `;
        }
    }
    return isNeg ? `-${prefix}${formatted}` : `${prefix}${formatted}`;
}

export function evaluateExpression(expr: string, scope: Record<string, number> = {}): number {
    let sanitized = expr.trim();
    // 1. Remove number grouping commas: e.g. 50,000 -> 50000
    sanitized = sanitized.replace(/(\d),(\d)/g, '$1$2');
    // 2. Correct spellings in expression
    sanitized = correctSpelling(sanitized);
    // 3. Replace percentages: e.g. 20% -> (20 / 100)
    sanitized = sanitized.replace(/(\d+(?:\.\d+)?)%/g, '($1 / 100)');

    // Build execution scope with case-insensitive fallbacks for valid JS identifiers
    const fullScope: Record<string, number> = {};
    for (const [k, v] of Object.entries(scope)) {
        if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k)) {
            fullScope[k] = v;
            const lowerK = k.toLowerCase();
            if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(lowerK) && !(lowerK in fullScope)) {
                fullScope[lowerK] = v;
            }
        }
    }

    const keys = Object.keys(fullScope);
    const values = keys.map((k) => fullScope[k]);

    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const fn = new Function(...keys, `"use strict"; return (${sanitized});`);
    const result = fn(...values);

    if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
        throw new Error(`Expression evaluated to invalid number: ${result}`);
    }
    return result;
}

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface ParsedFinancialParams {
    p: number;
    r: number;
    y: number;
    durationLabel: string;
    isError: boolean;
    errorMessage?: string;
}

function parseFinancialParams(
    clean: string,
    lower: string,
    toolType: 'emi' | 'sip' | 'compound' | 'mortgage',
    scope: Record<string, number>,
    currentCartSubtotal: number = 0
): ParsedFinancialParams {
    // 1. Duration parsing: Check months vs years explicitly
    const monthMatch = lower.match(/(?:for|tenure|term|period|horizon|in)?\s*(\d+(?:\.\d+)?)\s*(?:months?|mos?|m)\b/i);
    const yearMatch = lower.match(/(?:for|tenure|term|period|horizon|in)?\s*(\d+(?:\.\d+)?)\s*(?:years?|yrs?|yr|y)\b/i);

    let tenureYears: number | null = null;
    let durationLabel = '';
    let matchedDurationStr = '';

    if (monthMatch) {
        const monthsVal = parseFloat(monthMatch[1]);
        tenureYears = monthsVal / 12;
        durationLabel = `${monthsVal} mos`;
        matchedDurationStr = monthMatch[0];
    } else if (yearMatch) {
        const yearsVal = parseFloat(yearMatch[1]);
        tenureYears = yearsVal;
        durationLabel = `${yearsVal} yr${yearsVal === 1 ? '' : 's'}`;
        matchedDurationStr = yearMatch[0];
    }

    // 2. Rate parsing
    let rateVal: number | null = null;
    let matchedRateStr = '';

    const pctMatch = lower.match(/(?:@|at|rate|interest[:\s]*|with|return)?\s*(\d+(?:\.\d+)?)\s*(?:%|\s*percent\b)/i);
    if (pctMatch) {
        rateVal = parseFloat(pctMatch[1]);
        matchedRateStr = pctMatch[0];
    } else {
        const keywordMatch = lower.match(/(?:(?:@|at|with)\s+)?(\d+(?:\.\d+)?)\s*interest\b/i)
            || lower.match(/\binterest(?:\s*rate)?[:\s]+(\d+(?:\.\d+)?)\b/i)
            || lower.match(/\brate[:\s]+(\d+(?:\.\d+)?)\b/i)
            || lower.match(/\breturn[:\s]+(\d+(?:\.\d+)?)\b/i);
        if (keywordMatch) {
            rateVal = parseFloat(keywordMatch[1]);
            matchedRateStr = keywordMatch[0];
        }
    }

    // 3. Principal extraction
    let remaining = clean;
    if (matchedRateStr) {
        remaining = remaining.replace(new RegExp(escapeRegex(matchedRateStr), 'i'), ' ');
    }
    if (matchedDurationStr) {
        remaining = remaining.replace(new RegExp(escapeRegex(matchedDurationStr), 'i'), ' ');
    }

    remaining = remaining
        .replace(/\b(?:uk\s+mortgage|canadian\s+mortgage|home\s*loan|car\s*loan|personal\s*loan|loan\s*emi|systematic\s*investment|compound\s*interest|investment\s*growth|mortgage|emi|loan|sip|investment|compound)\b/gi, ' ')
        .replace(/\b(?:on|for|of|with|at|interest|rate|tenure|term|period|horizon|return|months?|years?|yrs?|yr|mos?|m|y)\b/gi, ' ')
        .trim();

    const pMatch = remaining.match(/[\d,.]+/);
    let p = pMatch ? parseFloat(pMatch[0].replace(/,/g, '')) : 0;

    // Positional fallback only when both rate and duration had no explicit units/keywords
    if (rateVal === null && tenureYears === null) {
        const nums = clean.replace(/uk\s+mortgage|canadian\s+mortgage|loan\s+emi|home\s+loan|car\s+loan|personal\s+loan|compound\s+interest|systematic\s+investment|emi|loan|mortgage|sip|compound|investment/gi, '').match(/[\d.]+/g);
        if (nums && nums.length >= 3) {
            p = parseFloat(nums[0]);
            rateVal = parseFloat(nums[1]);
            tenureYears = parseFloat(nums[2]);
            durationLabel = `${tenureYears} yr${tenureYears === 1 ? '' : 's'}`;
        }
    }

    // If principal is missing, check preceding cart subtotal or explicit named scope variables
    if (p <= 0) {
        if (currentCartSubtotal > 0) {
            p = currentCartSubtotal;
        } else if (scope['loan_amount'] && scope['loan_amount'] > 0) {
            p = scope['loan_amount'];
        } else if (scope['principal'] && scope['principal'] > 0) {
            p = scope['principal'];
        }
    }

    // Missing principal error guard:
    if (p <= 0) {
        let msg = 'Please specify loan amount (e.g., emi 100000 at 12% for 12 months)';
        if (toolType === 'sip') {
            msg = 'Specify monthly investment (e.g., sip 5000 at 12% for 10 years)';
        } else if (toolType === 'compound') {
            msg = 'Specify investment amount (e.g., compound interest 100000 at 8% for 10 years)';
        } else if (toolType === 'mortgage') {
            msg = 'Please specify mortgage amount (e.g., mortgage 250000 at 5% for 25 years)';
        }
        return {
            p: 0,
            r: rateVal || 0,
            y: tenureYears || 0,
            durationLabel,
            isError: true,
            errorMessage: msg,
        };
    }

    if (rateVal === null || rateVal <= 0) {
        return {
            p,
            r: 0,
            y: tenureYears || 0,
            durationLabel,
            isError: true,
            errorMessage: 'Specify interest rate (e.g., emi 100000 at 12% for 12 months)',
        };
    }

    if (tenureYears === null || tenureYears <= 0) {
        return {
            p,
            r: rateVal,
            y: 0,
            durationLabel,
            isError: true,
            errorMessage: 'Specify tenure in months or years (e.g., emi 100000 at 12% for 12 months)',
        };
    }

    return {
        p,
        r: rateVal,
        y: tenureYears,
        durationLabel,
        isError: false,
    };
}

export function evaluateLine(
    rawLine: string,
    scope: Record<string, number> = {},
    lineNumber: number = 0,
    sessionCurrency: string = '',
    currentCartSubtotal: number = 0
): EvaluatedVariable | null {
    const rawTrimmed = rawLine.trim();
    if (!rawTrimmed || rawTrimmed.startsWith('#') || rawTrimmed.startsWith('//')) {
        return null;
    }

    const lineCurrency = detectCurrencySymbol(rawTrimmed) || sessionCurrency;

    let note: string | undefined = undefined;
    let clean = rawTrimmed;

    // Extract inline parenthetical note
    const parenNoteMatch = clean.match(/\(([^)]+)\)\s*$/);
    if (parenNoteMatch) {
        note = parenNoteMatch[1].trim();
        clean = clean.replace(/\(([^)]+)\)\s*$/, '').trim();
    }

    // Clean currency prefixes and symbols for calculation parsing without leaving stray characters
    clean = clean
        .replace(/C\$/gi, '')
        .replace(/[$€£₹¥]/g, '')
        .replace(/\b(AED|USD|EUR|GBP|INR|CAD)\b/gi, '')
        .trim();

    // Apply spelling corrections to clean line
    clean = correctSpelling(clean);
    const lower = clean.toLowerCase();

    // 1. Regional Tool: SIP (Systematic Investment Plan)
    const sipMatch = lower.match(/\b(?:sip|systematic\s+investment)\b/i);
    if (sipMatch) {
        const parsed = parseFinancialParams(clean, lower, 'sip', scope, currentCartSubtotal);
        const curr = lineCurrency || sessionCurrency;

        if (parsed.isError) {
            return {
                id: `sip-${lineNumber}`,
                lineNumber,
                name: `SIP Maturity`,
                expression: rawTrimmed,
                value: null,
                formattedValue: 'Error',
                isError: true,
                errorMessage: parsed.errorMessage,
                type: 'base',
                currency: curr,
            };
        }

        const { p, r, y, durationLabel } = parsed;
        const n = Math.max(1, Math.round(y * 12));
        const monthlyRate = (r / 100) / 12;
        const totalInvested = p * n;
        const maturityValue = monthlyRate === 0
            ? totalInvested
            : p * ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate) * (1 + monthlyRate);
        const wealthGain = maturityValue - totalInvested;
        const finalVal = Math.round(maturityValue);
        scope['sip'] = finalVal;
        scope['_lastAmount'] = finalVal;

        return {
            id: `sip-${lineNumber}`,
            lineNumber,
            name: `SIP Maturity (${durationLabel} @ ${r}%)`,
            expression: `${formatAmount(p, curr)}/mo × ${n} mo`,
            value: finalVal,
            formattedValue: formatAmount(finalVal, curr),
            isError: false,
            type: 'base',
            note: note || `Invested: ${formatAmount(Math.round(totalInvested), curr)} | Est. Gain: +${formatAmount(Math.round(wealthGain), curr)}`,
            currency: curr,
            calculatorSlug: 'sip-calculator',
            calculatorCategory: 'finance-business',
            isInvestment: true,
            initialParams: {
                monthlyInvestment: p,
                expectedReturnRate: r,
                investmentPeriodYears: y,
                principal: p,
                rate: r,
                tenure: y,
            },
            metrics: [
                { label: 'Total Invested Capital', value: formatAmount(Math.round(totalInvested), curr) },
                { label: 'Total Compound Growth', value: formatAmount(Math.round(wealthGain), curr) },
            ],
        };
    }

    // 2. Regional Tool: EMI & Loan (Equated Monthly Installment)
    const isEmi = /\b(?:emi|loan\s+emi)\b/i.test(lower);
    const isGenericLoan = !isEmi && /\b(?:home\s+loan|car\s+loan|personal\s+loan|loan)\b/i.test(lower) && !/\buk\s+home\s*loan|canadian\s+home\s*loan/i.test(lower);

    if (isEmi || isGenericLoan) {
        const parsed = parseFinancialParams(clean, lower, 'emi', scope, currentCartSubtotal);
        const curr = lineCurrency || sessionCurrency;

        if (parsed.isError) {
            return {
                id: `emi-${lineNumber}`,
                lineNumber,
                name: `Monthly EMI`,
                expression: rawTrimmed,
                value: null,
                formattedValue: 'Error',
                isError: true,
                errorMessage: parsed.errorMessage,
                type: 'financing',
                isFinancing: true,
                currency: curr,
            };
        }

        const { p, r, y, durationLabel } = parsed;
        const n = Math.max(1, Math.round(y * 12));
        const monthlyRate = (r / 100) / 12;
        const monthlyEmi = monthlyRate === 0
            ? p / n
            : (p * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
        const totalPayment = monthlyEmi * n;
        const totalInterest = totalPayment - p;
        const finalVal = Math.round(monthlyEmi);
        scope['emi'] = finalVal;

        return {
            id: `emi-${lineNumber}`,
            lineNumber,
            name: `Monthly EMI (${durationLabel} @ ${r}%)`,
            expression: `${formatAmount(p, curr)} loan`,
            value: finalVal,
            formattedValue: `${formatAmount(finalVal, curr)}/mo`,
            isError: false,
            type: 'financing',
            isFinancing: true,
            note: note || `Total Repaid: ${formatAmount(Math.round(totalPayment), curr)} | Interest: ${formatAmount(Math.round(totalInterest), curr)}`,
            currency: curr,
            calculatorSlug: 'emi-calculator',
            calculatorCategory: 'finance-business',
            initialParams: {
                loanAmount: p,
                interestRate: r,
                tenureYears: y,
                principal: p,
                rate: r,
                tenure: y,
            },
            financingDetails: {
                principal: p,
                monthlyInstallment: finalVal,
                totalRepaid: Math.round(totalPayment),
                totalInterest: Math.round(totalInterest),
                tenureLabel: durationLabel,
                rate: r,
                months: n,
            },
            metrics: [
                { label: 'Loan Principal', value: formatAmount(p, curr) },
                { label: 'Monthly Installment', value: `${formatAmount(finalVal, curr)}/mo` },
                { label: 'Total Interest Payable', value: formatAmount(Math.round(totalInterest), curr) },
                { label: 'Total Amount Repaid', value: formatAmount(Math.round(totalPayment), curr) },
            ],
        };
    }

    // 3. Regional Tool: Compound Interest & Investment Growth
    const isCompound = /\b(?:compound\s*interest|investment\s*growth|compound)\b/i.test(lower);
    if (isCompound) {
        const parsed = parseFinancialParams(clean, lower, 'compound', scope, currentCartSubtotal);
        const curr = lineCurrency || sessionCurrency;

        if (parsed.isError) {
            return {
                id: `ci-${lineNumber}`,
                lineNumber,
                name: `Compound Growth`,
                expression: rawTrimmed,
                value: null,
                formattedValue: 'Error',
                isError: true,
                errorMessage: parsed.errorMessage,
                type: 'base',
                currency: curr,
            };
        }

        const { p, r, y, durationLabel } = parsed;
        const n = Math.max(1, Math.round(y * 12));
        const monthlyRate = (r / 100) / 12;
        const fv = p * Math.pow(1 + monthlyRate, n);
        const growth = fv - p;
        const finalVal = Math.round(fv);
        scope['compound'] = finalVal;
        scope['_lastAmount'] = finalVal;

        return {
            id: `ci-${lineNumber}`,
            lineNumber,
            name: `Compound Growth (${durationLabel} @ ${r}%)`,
            expression: `${formatAmount(p, curr)} principal`,
            value: finalVal,
            formattedValue: formatAmount(finalVal, curr),
            isError: false,
            type: 'base',
            note: note || `Principal: ${formatAmount(p, curr)} | Growth: +${formatAmount(Math.round(growth), curr)}`,
            currency: curr,
            calculatorSlug: 'compound-interest-calculator',
            calculatorCategory: 'finance-business',
            isInvestment: true,
            initialParams: {
                initialDeposit: p,
                interestRate: r,
                investmentPeriodYears: y,
                principal: p,
                rate: r,
                tenure: y,
            },
            metrics: [
                { label: 'Total Invested Capital', value: formatAmount(Math.round(p), curr) },
                { label: 'Total Compound Growth', value: formatAmount(Math.round(growth), curr) },
            ],
        };
    }

    // 4. Regional Tool: UK, Canadian & Home Mortgages
    const ukMortgageMatch = lower.match(/\buk\s+(?:mortgage|home\s*loan)\b/i);
    const cadMortgageMatch = lower.match(/\b(?:canadian|cad|canada)\s+(?:mortgage|home\s*loan)\b/i);
    const genericMortgageMatch = !ukMortgageMatch && !cadMortgageMatch && /\bmortgage\b/i.test(lower);

    if (ukMortgageMatch || cadMortgageMatch || genericMortgageMatch) {
        const isCad = Boolean(cadMortgageMatch);
        const isUk = Boolean(ukMortgageMatch);
        const defaultCurr = isCad ? 'C$' : (isUk ? '£' : sessionCurrency);
        const curr = lineCurrency || sessionCurrency || defaultCurr;

        const parsed = parseFinancialParams(clean, lower, 'mortgage', scope, currentCartSubtotal);
        if (parsed.isError) {
            return {
                id: `mortgage-${lineNumber}`,
                lineNumber,
                name: `${isCad ? 'Canadian ' : isUk ? 'UK ' : ''}Mortgage`,
                expression: rawTrimmed,
                value: null,
                formattedValue: 'Error',
                isError: true,
                errorMessage: parsed.errorMessage,
                type: 'financing',
                isFinancing: true,
                currency: curr,
            };
        }

        const { p, r, y, durationLabel } = parsed;
        const n = Math.max(1, Math.round(y * 12));
        let monthlyPayment = 0;

        if (isCad) {
            const semiRate = (r / 100) / 2;
            const effectiveMonthlyRate = Math.pow(1 + semiRate, 2 / 12) - 1;
            monthlyPayment = (p * effectiveMonthlyRate * Math.pow(1 + effectiveMonthlyRate, n)) / (Math.pow(1 + effectiveMonthlyRate, n) - 1);
        } else {
            const monthlyRate = (r / 100) / 12;
            monthlyPayment = (p * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
        }

        const totalPayment = monthlyPayment * n;
        const totalInterest = totalPayment - p;
        const finalVal = Math.round(monthlyPayment);
        scope['mortgage'] = finalVal;

        return {
            id: `mortgage-${lineNumber}`,
            lineNumber,
            name: `${isCad ? 'Canadian' : isUk ? 'UK' : 'Home'} Mortgage (${durationLabel} @ ${r}%)`,
            expression: `${formatAmount(p, curr)} loan`,
            value: finalVal,
            formattedValue: `${formatAmount(finalVal, curr)}/mo`,
            isError: false,
            type: 'financing',
            isFinancing: true,
            note: note || `Total Repaid: ${formatAmount(Math.round(totalPayment), curr)} | Interest: ${formatAmount(Math.round(totalInterest), curr)}`,
            currency: curr,
            calculatorSlug: isCad ? 'canadian-mortgage-calculator' : 'mortgage-calculator-uk',
            calculatorCategory: 'finance-business',
            initialParams: isCad
                ? {
                    homePrice: p,
                    downPaymentDollars: 0,
                    mortgageRate: r,
                    amortizationYears: y,
                    paymentSchedule: 'monthly',
                    principal: p,
                    price: p,
                    rate: r,
                    tenure: y,
                }
                : {
                    propertyPrice: p,
                    depositAmount: 0,
                    interestRate: r,
                    mortgageTermYears: y,
                    repaymentType: 'repayment',
                    principal: p,
                    price: p,
                    rate: r,
                    tenure: y,
                },
            financingDetails: {
                principal: p,
                monthlyInstallment: finalVal,
                totalRepaid: Math.round(totalPayment),
                totalInterest: Math.round(totalInterest),
                tenureLabel: durationLabel,
                rate: r,
                months: n,
            },
            metrics: [
                { label: 'Mortgage Principal', value: formatAmount(p, curr) },
                { label: 'Monthly Installment', value: `${formatAmount(finalVal, curr)}/mo` },
                { label: 'Total Interest Payable', value: formatAmount(Math.round(totalInterest), curr) },
                { label: 'Total Amount Repaid', value: formatAmount(Math.round(totalPayment), curr) },
            ],
        };
    }

    // 4. Split Detection
    const splitMatch = lower.match(/(?:split(?:\s+(?:between|by|into|among|bill))?|per\s+(?:person|head|member))\s*(\d+)?/i);
    if (splitMatch || lower.includes('split')) {
        const numMatch = lower.match(/\d+/);
        const count = numMatch ? Math.max(1, parseInt(numMatch[0], 10)) : 2;
        return {
            id: `split-${lineNumber}`,
            lineNumber,
            name: `Split between ${count}`,
            expression: rawTrimmed,
            value: count,
            formattedValue: `${count} people`,
            isError: false,
            type: 'modifier',
            currency: lineCurrency || sessionCurrency,
            note,
        };
    }

    // 5. Total Keyword
    if (/^(total|subtotal|net total|sum|balance|amount due)$/i.test(lower)) {
        return {
            id: `total-${lineNumber}`,
            lineNumber,
            name: 'Total',
            expression: rawTrimmed,
            value: null,
            formattedValue: '',
            isError: false,
            type: 'summary',
            currency: lineCurrency || sessionCurrency,
            note,
        };
    }

    // 6. Deductions / Discounts
    const isParameterNameDiscount = /\b(discount\s*rate|discount\s*factor|payoff|takeoff)\b/i.test(lower);
    const isDiscount = !isParameterNameDiscount && (
        /^(discount|coupon|rebate|markdown|less)\s*[:=]?\s*[\d.]+%?$/i.test(clean) ||
        /\b\d+(?:\.\d+)?%\s*(?:off|discount)\b/i.test(clean) ||
        /^(?:less\s+)?(?:discount|coupon)\s+\d+/i.test(clean)
    );
    if (isDiscount) {
        const pctMatch = lower.match(/(\d+(?:\.\d+)?)%/);
        const flatMatch = clean.match(/\d+(?:\.\d+)?/);
        const val = pctMatch ? parseFloat(pctMatch[1]) : (flatMatch ? parseFloat(flatMatch[0]) : 0);

        return {
            id: `discount-${lineNumber}`,
            lineNumber,
            name: pctMatch ? `Discount (${pctMatch[1]}%)` : 'Discount',
            expression: rawTrimmed,
            value: val,
            formattedValue: '',
            isError: false,
            type: 'deduction',
            currency: sessionCurrency,
            note,
            calculatorSlug: 'discount-calculator',
            calculatorCategory: 'finance-business',
            initialParams: {
                discountPct: val,
                originalPrice: 100,
            },
        };
    }

    // 7. Additions / Tax / Surcharge
    const isParameterNameTax = /\b(property\s*tax|income\s*tax|annual|interest|monthly|rate|apr)\b/i.test(lower);
    const isTax = !isParameterNameTax && (
        /^(tax|sales\s*tax|vat|gst|tip|service\s*charge|gratuity)\s*[:=]?\s*[\d.]+%?$/i.test(clean) ||
        /^(?:add\s+)?(?:tax|tip|fee)\s+\d+/i.test(clean)
    );
    if (isTax) {
        const pctMatch = lower.match(/(\d+(?:\.\d+)?)%/);
        const flatMatch = clean.match(/\d+(?:\.\d+)?/);
        const val = pctMatch ? parseFloat(pctMatch[1]) : (flatMatch ? parseFloat(flatMatch[0]) : 0);

        const isTip = /\b(?:tip|gratuity)\b/i.test(lower);
        const isVat = !isTip && /\b(?:vat|sales\s*tax)\b/i.test(lower);

        let calcSlug: string | undefined = undefined;
        let initParams: Record<string, any> | undefined = undefined;

        if (isTip) {
            calcSlug = 'tip-calculator';
            initParams = {
                tipPercentage: val,
                billAmount: 100,
            };
        } else if (isVat) {
            calcSlug = 'vat-calculator';
            initParams = {
                amount: 500,
                vatRate: val,
                mode: 'add_vat',
                rate: val,
            };
        }

        return {
            id: `tax-${lineNumber}`,
            lineNumber,
            name: pctMatch ? (isTip ? `Tip (${pctMatch[1]}%)` : `Tax (${pctMatch[1]}%)`) : (isTip ? 'Tip' : 'Tax'),
            expression: rawTrimmed,
            value: val,
            formattedValue: '',
            isError: false,
            type: 'addition',
            currency: sessionCurrency,
            note,
            ...(calcSlug
                ? {
                    calculatorSlug: calcSlug,
                    calculatorCategory: 'finance-business',
                    initialParams: initParams,
                }
                : {}),
        };
    }

    // 8. Dynamic Variable Definition: variable_name = expression
    // e.g. salary = 50000, bonus = 10000, tax = (salary + bonus) * 0.20, a = 100, b = a * 2, total = a + b
    const varDefMatch = clean.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
    if (varDefMatch) {
        const varName = varDefMatch[1].trim();
        const expr = varDefMatch[2].trim();
        try {
            const val = evaluateExpression(expr, scope);
            scope[varName] = val;
            if (val > 0) scope['_lastAmount'] = val;
            return {
                id: `var-${lineNumber}`,
                lineNumber,
                name: varName,
                expression: expr,
                value: val,
                formattedValue: formatAmount(val, lineCurrency || sessionCurrency),
                isError: false,
                type: 'base',
                note,
                currency: lineCurrency || sessionCurrency,
            };
        } catch (err: any) {
            return {
                id: `var-err-${lineNumber}`,
                lineNumber,
                name: varName,
                expression: expr,
                value: null,
                formattedValue: 'Error',
                isError: true,
                errorMessage: err?.message || 'Calculation error',
                type: 'base',
                note,
                currency: lineCurrency || sessionCurrency,
            };
        }
    }

    // 9. Standard Base Line Items: "ticket 450", "flight: 350 + 50", "rent: 1200"
    const kvMatch = clean.match(/^([a-zA-Z0-9_\s()[\]/%-]+?)(?:\s*[:=]\s*|\s+)(.+)$/);
    if (kvMatch) {
        const label = kvMatch[1].trim();
        const expr = kvMatch[2].trim();
        try {
            const val = evaluateExpression(expr, scope);
            if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(label)) {
                scope[label] = val;
            }
            if (val > 0) scope['_lastAmount'] = val;
            return {
                id: `base-${lineNumber}`,
                lineNumber,
                name: label,
                expression: expr,
                value: val,
                formattedValue: formatAmount(val, lineCurrency || sessionCurrency),
                isError: false,
                type: 'base',
                note,
                currency: lineCurrency || sessionCurrency,
            };
        } catch {
            // Not a valid math expression, fall through
        }
    }

    // 10. Standalone expression or numbers: "100 + 200", "a + b"
    try {
        const val = evaluateExpression(clean, scope);
        if (val > 0) scope['_lastAmount'] = val;
        return {
            id: `base-${lineNumber}`,
            lineNumber,
            name: `Item ${lineNumber + 1}`,
            expression: clean,
            value: val,
            formattedValue: formatAmount(val, lineCurrency || sessionCurrency),
            isError: false,
            type: 'base',
            note,
            currency: lineCurrency || sessionCurrency,
        };
    } catch {
        // Fallback: line cannot be evaluated
    }

    return null;
}

export function executeCanvasScript(rawText: string, displayCurrency: string = 'USD'): CanvasExecutionResult {
    const lines = rawText.split('\n');

    // 1. Currency Synchronization:
    // If the user typed an explicit currency symbol in the script (e.g. ₹ or $), respect it.
    // Otherwise, default strictly to the active displayCurrency benchmark symbol.
    const defaultBenchmarkSymbol = getCurrencySymbolFromCode(displayCurrency);
    let typedCurrency = '';
    for (const line of lines) {
        const found = detectCurrencySymbol(line);
        if (found) {
            typedCurrency = found;
            break;
        }
    }
    const sessionCurrency = typedCurrency || defaultBenchmarkSymbol;

    // Maintain a scope map across lines during script execution
    const scope: Record<string, number> = {};
    const baseItems: EvaluatedVariable[] = [];
    const discountItems: EvaluatedVariable[] = [];
    const taxItems: EvaluatedVariable[] = [];
    const financingItems: EvaluatedVariable[] = [];
    let userWroteTotal = false;
    let splitModifier: { lineNum: number; count: number; raw: string } | null = null;
    let hasInvestmentEngine = false;
    let heroTitle: string | undefined = undefined;
    let portfolioMetrics: { label: string; value: string | number; prefix?: string; suffix?: string }[] = [];
    let customMetrics: { label: string; value: string | number; prefix?: string; suffix?: string }[] = [];

    // Running cart subtotal across standard purchase items
    let runningCartSubtotal = 0;
    let hasEncounteredTotal = false;
    let statementTotalAtTotal = 0;

    // Helper to calculate current net total at any point
    const getCurrentStatementTotal = () => {
        const rawSub = baseItems.reduce((acc, item) => acc + (item.value || 0), 0);
        let discSum = 0;
        discountItems.forEach((d) => {
            if (d.isFlat) {
                discSum += d.value || 0;
            } else {
                const isPct = d.name.includes('%');
                const actual = isPct ? (rawSub * (d.value || 0)) / 100 : (d.value || 0);
                discSum += actual;
            }
        });
        const discSub = Math.max(0, rawSub - discSum);
        let taxSum = 0;
        taxItems.forEach((t) => {
            if (t.isFlat) {
                taxSum += t.value || 0;
            } else {
                const isPct = t.name.includes('%');
                const actual = isPct ? (discSub * (t.value || 0)) / 100 : (t.value || 0);
                taxSum += actual;
            }
        });
        return discSub + taxSum;
    };

    // Pass 1: Parse and categorize statements
    for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i].trim();
        if (!rawLine || rawLine.startsWith('#') || rawLine.startsWith('//')) {
            continue;
        }

        const lineCurrency = detectCurrencySymbol(rawLine) || sessionCurrency;

        let note: string | undefined = undefined;
        let clean = rawLine;

        // Extract inline parenthetical note
        const parenNoteMatch = clean.match(/\(([^)]+)\)\s*$/);
        if (parenNoteMatch) {
            note = parenNoteMatch[1].trim();
            clean = clean.replace(/\(([^)]+)\)\s*$/, '').trim();
        }

        // Clean currency prefixes and symbols for calculation parsing without leaving stray characters
        clean = clean
            .replace(/C\$/gi, '')
            .replace(/[$€£₹¥]/g, '')
            .replace(/\b(AED|USD|EUR|GBP|INR|CAD)\b/gi, '')
            .trim();

        // Spelling correction
        clean = correctSpelling(clean);
        const lower = clean.toLowerCase();

        // Regional Tool: VAT Calculations (handles multi-card generation)
        // Case A: Inclusive VAT (e.g. "vat 20% included in 120" or "extract vat 20% from £120")
        const vatInclusiveMatch = lower.match(/\b(?:extract\s+)?vat\s+(\d+(?:\.\d+)?)%\s*(?:included\s+in|from|in)\s*([\d,.]+)/i);
        if (vatInclusiveMatch) {
            const vatRate = parseFloat(vatInclusiveMatch[1]);
            const grossVal = parseFloat(vatInclusiveMatch[2].replace(/,/g, ''));
            if (grossVal > 0 && vatRate > 0) {
                const netVal = grossVal / (1 + vatRate / 100);
                const vatAmt = grossVal - netVal;
                const curr = lineCurrency || sessionCurrency;

                scope['vat_net'] = netVal;
                scope['vat_amt'] = vatAmt;

                baseItems.push({
                    id: `vat-net-${i}`,
                    lineNumber: i,
                    name: `Net Subtotal (excl. ${vatRate}% VAT)`,
                    expression: `${formatAmount(grossVal, curr)} / (1 + ${vatRate}%)`,
                    value: netVal,
                    formattedValue: formatAmount(netVal, curr),
                    isError: false,
                    type: 'base',
                    note: note,
                    currency: curr,
                    calculatorSlug: 'vat-calculator',
                    calculatorCategory: 'finance-business',
                    initialParams: {
                        amount: grossVal,
                        vatRate: vatRate,
                        mode: 'remove_vat',
                        rate: vatRate,
                    },
                });

                taxItems.push({
                    id: `vat-tax-${i}`,
                    lineNumber: i,
                    name: `Extracted VAT (${vatRate}%)`,
                    expression: `+${formatAmount(vatAmt, curr)}`,
                    value: vatAmt,
                    formattedValue: `+${formatAmount(vatAmt, curr)}`,
                    isError: false,
                    type: 'addition',
                    currency: curr,
                    isFlat: true,
                    calculatorSlug: 'vat-calculator',
                    calculatorCategory: 'finance-business',
                    initialParams: {
                        amount: grossVal,
                        vatRate: vatRate,
                        mode: 'remove_vat',
                        rate: vatRate,
                    },
                });
                runningCartSubtotal += netVal;
                continue;
            }
        }

        // Case B: Exclusive VAT with base amount (e.g. "vat 20% on 150" or "add vat 20% to £200" or "vat 20% 150")
        const vatExclusiveMatch = lower.match(/\b(?:add\s+)?vat\s+(\d+(?:\.\d+)?)%\s*(?:on|to|\s)\s*([\d,.]+)/i);
        if (vatExclusiveMatch) {
            const vatRate = parseFloat(vatExclusiveMatch[1]);
            const baseVal = parseFloat(vatExclusiveMatch[2].replace(/,/g, ''));
            if (baseVal > 0 && vatRate > 0) {
                const vatAmt = (baseVal * vatRate) / 100;
                const curr = lineCurrency || sessionCurrency;

                scope['vat_base'] = baseVal;
                scope['vat_amt'] = vatAmt;

                baseItems.push({
                    id: `vat-base-${i}`,
                    lineNumber: i,
                    name: `Subtotal Amount`,
                    expression: `${baseVal}`,
                    value: baseVal,
                    formattedValue: formatAmount(baseVal, curr),
                    isError: false,
                    type: 'base',
                    note: note,
                    currency: curr,
                    calculatorSlug: 'vat-calculator',
                    calculatorCategory: 'finance-business',
                    initialParams: {
                        amount: baseVal,
                        vatRate: vatRate,
                        mode: 'add_vat',
                        rate: vatRate,
                    },
                });

                taxItems.push({
                    id: `vat-tax-${i}`,
                    lineNumber: i,
                    name: `VAT (${vatRate}%)`,
                    expression: `+${formatAmount(vatAmt, curr)}`,
                    value: vatAmt,
                    formattedValue: `+${formatAmount(vatAmt, curr)}`,
                    isError: false,
                    type: 'addition',
                    currency: curr,
                    isFlat: true,
                    calculatorSlug: 'vat-calculator',
                    calculatorCategory: 'finance-business',
                    initialParams: {
                        amount: baseVal,
                        vatRate: vatRate,
                        mode: 'add_vat',
                        rate: vatRate,
                    },
                });
                runningCartSubtotal += baseVal;
                continue;
            }
        }

        // Available cart subtotal / statement total before this line
        const availableSubtotal = hasEncounteredTotal
            ? statementTotalAtTotal
            : (runningCartSubtotal > 0 ? runningCartSubtotal : getCurrentStatementTotal());

        // Evaluate line using unified evaluator
        const item = evaluateLine(rawLine, scope, i, sessionCurrency, availableSubtotal);
        if (!item) {
            continue;
        }

        if (item.isInvestment) {
            hasInvestmentEngine = true;
            heroTitle = item.name.toUpperCase();
            if (item.metrics && item.metrics.length > 0) {
                portfolioMetrics = item.metrics;
            }
        }

        if (item.type === 'modifier') {
            const count = typeof item.value === 'number' ? item.value : 2;
            splitModifier = { lineNum: i, count, raw: rawLine };
        } else if (item.type === 'summary') {
            userWroteTotal = true;
            hasEncounteredTotal = true;
            statementTotalAtTotal = getCurrentStatementTotal();
        } else if (item.type === 'financing' || item.isFinancing) {
            financingItems.push(item);
            if (item.metrics && item.metrics.length > 0) {
                customMetrics = item.metrics;
            }
        } else if (item.type === 'deduction') {
            discountItems.push(item);
        } else if (item.type === 'addition') {
            taxItems.push(item);
        } else {
            baseItems.push(item);
            if (typeof item.value === 'number' && !item.isError) {
                runningCartSubtotal += item.value;
            }
        }
    }

    // Pass 2: Reconcile Ledger and format with currency
    const rawBaseSubtotal = baseItems.reduce((acc, item) => acc + (item.value || 0), 0);

    // Evaluate Discounts against Base Subtotal
    let evaluatedDiscountSum = 0;
    discountItems.forEach((d) => {
        if (d.isFlat) {
            evaluatedDiscountSum += d.value || 0;
            d.formattedValue = `-${formatAmount(d.value || 0, d.currency || sessionCurrency)}`;
            d.expression = `-${formatAmount(d.value || 0, d.currency || sessionCurrency)}`;
        } else {
            const isPct = d.name.includes('%');
            const actualVal = isPct ? (rawBaseSubtotal * (d.value || 0)) / 100 : (d.value || 0);
            evaluatedDiscountSum += actualVal;
            d.value = -actualVal;
            d.formattedValue = `-${formatAmount(actualVal, d.currency || sessionCurrency)}`;
            d.expression = `-${formatAmount(actualVal, d.currency || sessionCurrency)}`;
        }
    });

    const discountedSubtotal = Math.max(0, rawBaseSubtotal - evaluatedDiscountSum);

    // Evaluate Taxes against Discounted Subtotal
    let evaluatedTaxSum = 0;
    taxItems.forEach((t) => {
        if (t.isFlat) {
            evaluatedTaxSum += t.value || 0;
            t.formattedValue = `+${formatAmount(t.value || 0, t.currency || sessionCurrency)}`;
            t.expression = `+${formatAmount(t.value || 0, t.currency || sessionCurrency)}`;
        } else {
            const isPct = t.name.includes('%');
            const actualVal = isPct ? (discountedSubtotal * (t.value || 0)) / 100 : (t.value || 0);
            evaluatedTaxSum += actualVal;
            t.value = actualVal;
            t.formattedValue = `+${formatAmount(actualVal, t.currency || sessionCurrency)}`;
            t.expression = `+${formatAmount(actualVal, t.currency || sessionCurrency)}`;
        }
    });

    const finalTotal = discountedSubtotal + evaluatedTaxSum;

    // Build Ordered Template: Base -> Discounts -> Taxes -> Total -> Split
    const orderedList: EvaluatedVariable[] = [...baseItems, ...discountItems, ...taxItems];

    // Insert TOTAL Card
    if (userWroteTotal || discountItems.length > 0 || taxItems.length > 0 || splitModifier || (baseItems.length > 0 && financingItems.length > 0)) {
        orderedList.push({
            id: 'template-total',
            lineNumber: -1,
            name: 'Total',
            expression: `${baseItems.length} items consolidated`,
            value: finalTotal,
            formattedValue: formatAmount(finalTotal, sessionCurrency),
            isError: false,
            type: 'summary',
            currency: sessionCurrency,
        });
    }

    // Insert Split Card
    let splitResult: EvaluatedVariable | null = null;
    if (splitModifier) {
        const perPerson = finalTotal / splitModifier.count;
        splitResult = {
            id: 'template-split',
            lineNumber: splitModifier.lineNum,
            name: `Split between ${splitModifier.count}`,
            expression: `${formatAmount(finalTotal, sessionCurrency)} / ${splitModifier.count}`,
            value: perPerson,
            formattedValue: `${formatAmount(perPerson, sessionCurrency)} / person`,
            isError: false,
            type: 'modifier',
            currency: sessionCurrency,
        };
        orderedList.push(splitResult);
    }

    // Hero Title & Highlight Determination
    let lastHighlight: EvaluatedVariable | null = null;
    if (splitModifier && splitResult) {
        heroTitle = splitResult.name.toUpperCase();
        lastHighlight = splitResult;
    } else if (userWroteTotal || baseItems.length > 0) {
        heroTitle = 'STATEMENT TOTAL';
        lastHighlight = orderedList.find((v) => v.type === 'summary') || (orderedList.length > 0 ? orderedList[orderedList.length - 1] : null);
    } else if (financingItems.length > 0) {
        const firstFin = financingItems[0];
        heroTitle = (firstFin.name || 'MONTHLY EMI').toUpperCase();
        lastHighlight = firstFin;
    } else if (hasInvestmentEngine) {
        lastHighlight = orderedList.length > 0 ? orderedList[orderedList.length - 1] : null;
    } else if (orderedList.length > 0) {
        const lastItem = orderedList[orderedList.length - 1];
        heroTitle = (lastItem.name || 'TOTAL').toUpperCase();
        lastHighlight = lastItem;
    } else {
        heroTitle = 'STATEMENT TOTAL';
        lastHighlight = null;
    }

    // STRICT PURGE:
    // If the script does NOT contain a portfolio/investment engine (SIP, Compound Interest),
    // heroTitle must NEVER default to or contain "END BALANCE PORTFOLIO VALUE"
    if (!hasInvestmentEngine) {
        if (heroTitle && (heroTitle.includes('PORTFOLIO') || heroTitle.includes('END BALANCE'))) {
            heroTitle = 'STATEMENT TOTAL';
        }
        portfolioMetrics = [];
    }

    return {
        variables: orderedList,
        financingItems,
        lastResult: lastHighlight,
        hasErrors: orderedList.some((v) => v.isError) || financingItems.some((f) => f.isError),
        rawBaseSubtotal,
        totalDiscounts: evaluatedDiscountSum,
        totalTaxes: evaluatedTaxSum,
        finalTotal,
        splitResult,
        detectedCurrency: sessionCurrency,
        scope,
        heroTitle,
        portfolioMetrics,
        customMetrics,
        hasInvestmentEngine,
        hasTotal: userWroteTotal,
    };
}