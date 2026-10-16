export interface EvaluatedVariable {
    id: string;
    lineNumber: number;
    name: string;
    expression: string;
    value: number | null;
    formattedValue: string;
    isError: boolean;
    errorMessage?: string;
    type: 'base' | 'addition' | 'deduction' | 'summary' | 'modifier';
    note?: string;
    currency?: string;
    isFlat?: boolean;
}

export interface CanvasExecutionResult {
    variables: EvaluatedVariable[];
    lastResult: EvaluatedVariable | null;
    hasErrors: boolean;
    rawBaseSubtotal: number;
    totalDiscounts: number;
    totalTaxes: number;
    finalTotal: number;
    splitResult: EvaluatedVariable | null;
    detectedCurrency: string;
    scope?: Record<string, number>;
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

export function evaluateLine(
    rawLine: string,
    scope: Record<string, number> = {},
    lineNumber: number = 0,
    sessionCurrency: string = ''
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
        let p = 0;
        let r = 0;
        let y = 0;

        const rateMatch = lower.match(/(?:rate|at|return)?\s*(\d+(?:\.\d+)?)\s*%/i);
        const yearMatch = lower.match(/(?:for|tenure|horizon|period|in)?\s*(\d+(?:\.\d+)?)\s*(?:yrs|years|yr|y)\b/i);

        if (rateMatch && yearMatch) {
            r = parseFloat(rateMatch[1]);
            y = parseFloat(yearMatch[1]);
            const remaining = clean
                .replace(rateMatch[0], '')
                .replace(yearMatch[0], '')
                .replace(/sip|systematic\s+investment/gi, '')
                .trim();
            const pMatch = remaining.match(/[\d,.]+/);
            if (pMatch) p = parseFloat(pMatch[0].replace(/,/g, ''));
        } else {
            const nums = clean.replace(/sip|systematic\s+investment/gi, '').match(/[\d.]+/g);
            if (nums && nums.length >= 3) {
                p = parseFloat(nums[0]);
                r = parseFloat(nums[1]);
                y = parseFloat(nums[2]);
            } else if (nums && nums.length === 2) {
                p = parseFloat(nums[0]);
                r = parseFloat(nums[1]);
                y = 10;
            }
        }

        if (p > 0 && r > 0 && y > 0) {
            const n = y * 12;
            const monthlyRate = (r / 100) / 12;
            const totalInvested = p * n;
            const maturityValue = monthlyRate === 0
                ? totalInvested
                : p * ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate) * (1 + monthlyRate);
            const wealthGain = maturityValue - totalInvested;
            const curr = lineCurrency || sessionCurrency || '₹';
            const finalVal = Math.round(maturityValue);
            scope['sip'] = finalVal;

            return {
                id: `sip-${lineNumber}`,
                lineNumber,
                name: `SIP Maturity (${y} yrs @ ${r}%)`,
                expression: `${formatAmount(p, curr)}/mo × ${n} mo`,
                value: finalVal,
                formattedValue: formatAmount(finalVal, curr),
                isError: false,
                type: 'base',
                note: note || `Invested: ${formatAmount(Math.round(totalInvested), curr)} | Est. Gain: +${formatAmount(Math.round(wealthGain), curr)}`,
                currency: curr,
            };
        }
    }

    // 2. Regional Tool: EMI (Equated Monthly Installment)
    const emiMatch = lower.match(/\b(?:emi|loan\s+emi)\b/i);
    if (emiMatch) {
        let p = 0;
        let r = 0;
        let y = 0;

        const rateMatch = lower.match(/(?:rate|at|interest)?\s*(\d+(?:\.\d+)?)\s*%/i);
        const yearMatch = lower.match(/(?:for|tenure|term|period|in)?\s*(\d+(?:\.\d+)?)\s*(?:yrs|years|yr|y)\b/i);

        if (rateMatch && yearMatch) {
            r = parseFloat(rateMatch[1]);
            y = parseFloat(yearMatch[1]);
            const remaining = clean
                .replace(rateMatch[0], '')
                .replace(yearMatch[0], '')
                .replace(/loan\s+emi|emi/gi, '')
                .trim();
            const pMatch = remaining.match(/[\d,.]+/);
            if (pMatch) p = parseFloat(pMatch[0].replace(/,/g, ''));
        } else {
            const nums = clean.replace(/loan\s+emi|emi/gi, '').match(/[\d.]+/g);
            if (nums && nums.length >= 3) {
                p = parseFloat(nums[0]);
                r = parseFloat(nums[1]);
                y = parseFloat(nums[2]);
            } else if (nums && nums.length === 2) {
                p = parseFloat(nums[0]);
                r = parseFloat(nums[1]);
                y = 20;
            }
        }

        if (p > 0 && r > 0 && y > 0) {
            const n = y * 12;
            const monthlyRate = (r / 100) / 12;
            const monthlyEmi = (p * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
            const totalPayment = monthlyEmi * n;
            const totalInterest = totalPayment - p;
            const curr = lineCurrency || sessionCurrency || '₹';
            const finalVal = Math.round(monthlyEmi);
            scope['emi'] = finalVal;

            return {
                id: `emi-${lineNumber}`,
                lineNumber,
                name: `Monthly EMI (${y} yrs @ ${r}%)`,
                expression: `${formatAmount(p, curr)} loan`,
                value: finalVal,
                formattedValue: `${formatAmount(finalVal, curr)}/mo`,
                isError: false,
                type: 'base',
                note: note || `Total Repaid: ${formatAmount(Math.round(totalPayment), curr)} | Interest: ${formatAmount(Math.round(totalInterest), curr)}`,
                currency: curr,
            };
        }
    }

    // 3. Regional Tool: UK & Canadian Mortgages
    const ukMortgageMatch = lower.match(/\buk\s+(?:mortgage|home\s*loan)\b/i);
    const cadMortgageMatch = lower.match(/\b(?:canadian|cad|canada)\s+(?:mortgage|home\s*loan)\b/i);

    if (ukMortgageMatch || cadMortgageMatch) {
        const isCad = Boolean(cadMortgageMatch);
        let p = 0;
        let r = 0;
        let y = 0;

        const rateMatch = lower.match(/(?:rate|at|interest)?\s*(\d+(?:\.\d+)?)\s*%/i);
        const yearMatch = lower.match(/(?:for|tenure|term|period|in)?\s*(\d+(?:\.\d+)?)\s*(?:yrs|years|yr|y)\b/i);
        const strippedTag = clean.replace(/(?:canadian|cad|canada|uk)\s+(?:mortgage|home\s*loan)/gi, '').trim();

        if (rateMatch && yearMatch) {
            r = parseFloat(rateMatch[1]);
            y = parseFloat(yearMatch[1]);
            const remaining = strippedTag.replace(rateMatch[0], '').replace(yearMatch[0], '').trim();
            const pMatch = remaining.match(/[\d,.]+/);
            if (pMatch) p = parseFloat(pMatch[0].replace(/,/g, ''));
        } else {
            const nums = strippedTag.match(/[\d.]+/g);
            if (nums && nums.length >= 3) {
                p = parseFloat(nums[0]);
                r = parseFloat(nums[1]);
                y = parseFloat(nums[2]);
            } else if (nums && nums.length === 2) {
                p = parseFloat(nums[0]);
                r = parseFloat(nums[1]);
                y = 25;
            }
        }

        if (p > 0 && r > 0 && y > 0) {
            const n = y * 12;
            let monthlyPayment = 0;
            const defaultCurr = isCad ? 'C$' : '£';
            const curr = lineCurrency || sessionCurrency || defaultCurr;

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
                name: `${isCad ? 'Canadian' : 'UK'} Mortgage (${y} yrs @ ${r}%)`,
                expression: `${formatAmount(p, curr)} loan`,
                value: finalVal,
                formattedValue: `${formatAmount(finalVal, curr)}/mo`,
                isError: false,
                type: 'base',
                note: note || `Total Repaid: ${formatAmount(Math.round(totalPayment), curr)} | Interest: ${formatAmount(Math.round(totalInterest), curr)}`,
                currency: curr,
            };
        }
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

        return {
            id: `tax-${lineNumber}`,
            lineNumber,
            name: pctMatch ? `Tax (${pctMatch[1]}%)` : 'Tax',
            expression: rawTrimmed,
            value: val,
            formattedValue: '',
            isError: false,
            type: 'addition',
            currency: sessionCurrency,
            note,
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

export function executeCanvasScript(rawText: string): CanvasExecutionResult {
    const lines = rawText.split('\n');

    // Detect dominant currency across the entire script
    let sessionCurrency = '';
    for (const line of lines) {
        const found = detectCurrencySymbol(line);
        if (found) {
            sessionCurrency = found;
            break;
        }
    }

    // Maintain a scope map across lines during script execution
    const scope: Record<string, number> = {};
    const baseItems: EvaluatedVariable[] = [];
    const discountItems: EvaluatedVariable[] = [];
    const taxItems: EvaluatedVariable[] = [];
    let userWroteTotal = false;
    let splitModifier: { lineNum: number; count: number; raw: string } | null = null;

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
                });
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
                });
                continue;
            }
        }

        // Evaluate line using unified evaluator
        const item = evaluateLine(rawLine, scope, i, sessionCurrency);
        if (!item) {
            continue;
        }

        if (item.type === 'modifier') {
            const count = typeof item.value === 'number' ? item.value : 2;
            splitModifier = { lineNum: i, count, raw: rawLine };
        } else if (item.type === 'summary') {
            userWroteTotal = true;
        } else if (item.type === 'deduction') {
            discountItems.push(item);
        } else if (item.type === 'addition') {
            taxItems.push(item);
        } else {
            baseItems.push(item);
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
    if (userWroteTotal || discountItems.length > 0 || taxItems.length > 0 || splitModifier) {
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

    const lastHighlight = splitResult || (orderedList.length > 0 ? orderedList[orderedList.length - 1] : null);

    return {
        variables: orderedList,
        lastResult: lastHighlight,
        hasErrors: orderedList.some((v) => v.isError),
        rawBaseSubtotal,
        totalDiscounts: evaluatedDiscountSum,
        totalTaxes: evaluatedTaxSum,
        finalTotal,
        splitResult,
        detectedCurrency: sessionCurrency,
        scope,
    };
}