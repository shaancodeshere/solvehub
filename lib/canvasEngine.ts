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
}

const KNOWN_CURRENCIES = [
    { symbol: '$', code: 'USD' },
    { symbol: '€', code: 'EUR' },
    { symbol: '£', code: 'GBP' },
    { symbol: '₹', code: 'INR' },
    { symbol: '¥', code: 'JPY' },
    { symbol: 'AED', code: 'AED' },
    { symbol: 'USD', code: 'USD' },
    { symbol: 'EUR', code: 'EUR' },
    { symbol: 'GBP', code: 'GBP' },
    { symbol: 'INR', code: 'INR' },
];

function detectCurrencySymbol(text: string): string {
    for (const c of KNOWN_CURRENCIES) {
        // Check for symbol or word boundary on codes
        if (text.includes(c.symbol)) {
            return c.symbol;
        }
    }
    return '';
}

function formatAmount(val: number, currency: string = ''): string {
    const isNeg = val < 0;
    const absVal = Math.abs(val);
    const formatted =
        absVal >= 1000
            ? Number.isInteger(absVal)
                ? absVal.toLocaleString()
                : absVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : Number.isInteger(absVal)
                ? absVal.toString()
                : absVal.toFixed(2);

    const prefix = currency ? `${currency} ` : '';
    return isNeg ? `-${prefix}${formatted}` : `${prefix}${formatted}`;
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

        let note: string | undefined = undefined;
        let clean = rawLine;

        // Extract inline parenthetical note
        const parenNoteMatch = clean.match(/\(([^)]+)\)\s*$/);
        if (parenNoteMatch) {
            note = parenNoteMatch[1].trim();
            clean = clean.replace(/\(([^)]+)\)\s*$/, '').trim();
        }

        // Strip currency symbols for evaluation calculations
        clean = clean.replace(/[$€£₹¥]/g, '').replace(/\b(AED|USD|EUR|GBP|INR)\b/gi, '').trim();

        const lower = clean.toLowerCase();

        // 1. Split Detection
        const splitMatch = lower.match(/(?:split(?:\s+(?:between|by|into|among|bill))?|per\s+(?:person|head|member))\s*(\d+)?/i);
        if (splitMatch || lower.includes('split')) {
            const numMatch = lower.match(/\d+/);
            const count = numMatch ? Math.max(1, parseInt(numMatch[0], 10)) : 2;
            splitModifier = { lineNum: i, count, raw: rawLine };
            continue;
        }

        // 2. Total Keyword
        if (/^(total|subtotal|net total|sum|balance|amount due)$/i.test(lower)) {
            userWroteTotal = true;
            continue;
        }

        // 3. Deductions / Discounts
        const isDiscount = /\b(discount|coupon|off|rebate|deduction|less|markdown)\b/i.test(lower);
        if (isDiscount) {
            const pctMatch = lower.match(/(\d+(?:\.\d+)?)%/);
            const flatMatch = clean.match(/\d+(?:\.\d+)?/);

            discountItems.push({
                id: `discount-${i}`,
                lineNumber: i,
                name: pctMatch ? `Discount (${pctMatch[1]}%)` : 'Discount',
                expression: rawLine,
                value: pctMatch ? parseFloat(pctMatch[1]) : (flatMatch ? parseFloat(flatMatch[0]) : 0),
                formattedValue: '',
                isError: false,
                type: 'deduction',
                currency: sessionCurrency,
            });
            continue;
        }

        // 4. Additions / Tax / Surcharge
        const isTax = /\b(tax|tip|fee|service charge|vat|gst|interest)\b/i.test(lower);
        if (isTax) {
            const pctMatch = lower.match(/(\d+(?:\.\d+)?)%/);
            const flatMatch = clean.match(/\d+(?:\.\d+)?/);

            taxItems.push({
                id: `tax-${i}`,
                lineNumber: i,
                name: pctMatch ? `Tax (${pctMatch[1]}%)` : 'Tax',
                expression: rawLine,
                value: pctMatch ? parseFloat(pctMatch[1]) : (flatMatch ? parseFloat(flatMatch[0]) : 0),
                formattedValue: '',
                isError: false,
                type: 'addition',
                currency: sessionCurrency,
            });
            continue;
        }

        // 5. Standard Base Line Items
        const kvMatch = clean.match(/^([a-zA-Z_\s]+?)(?:\s*[:=]\s*|\s+)([\d,.]+(?:\s*[+\-*/]\s*[\d,.]+)*)$/);
        if (kvMatch) {
            const label = kvMatch[1].trim();
            const expr = kvMatch[2].replace(/,/g, '');
            try {
                // eslint-disable-next-line @typescript-eslint/no-implied-eval
                const val = new Function(`"use strict"; return (${expr})`)();
                if (typeof val === 'number' && !isNaN(val)) {
                    baseItems.push({
                        id: `base-${i}`,
                        lineNumber: i,
                        name: label,
                        expression: expr,
                        value: val,
                        formattedValue: formatAmount(val, sessionCurrency),
                        isError: false,
                        type: 'base',
                        note: note,
                        currency: sessionCurrency,
                    });
                    continue;
                }
            } catch {
                // Fallback
            }
        }

        // Direct standalone numbers or simple math
        const numOnlyMatch = clean.match(/^([\d,.]+(?:\s*[+\-*/]\s*[\d,.]+)*)$/);
        if (numOnlyMatch) {
            try {
                // eslint-disable-next-line @typescript-eslint/no-implied-eval
                const val = new Function(`"use strict"; return (${clean.replace(/,/g, '')})`)();
                if (typeof val === 'number' && !isNaN(val)) {
                    baseItems.push({
                        id: `base-${i}`,
                        lineNumber: i,
                        name: `Item ${baseItems.length + 1}`,
                        expression: clean,
                        value: val,
                        formattedValue: formatAmount(val, sessionCurrency),
                        isError: false,
                        type: 'base',
                        note: note,
                        currency: sessionCurrency,
                    });
                    continue;
                }
            } catch {
                // Fallback
            }
        }
    }

    // Pass 2: Reconcile Ledger and format with currency
    const rawBaseSubtotal = baseItems.reduce((acc, item) => acc + (item.value || 0), 0);

    // Evaluate Discounts against Base Subtotal
    let evaluatedDiscountSum = 0;
    discountItems.forEach((d) => {
        const isPct = d.name.includes('%');
        const actualVal = isPct ? (rawBaseSubtotal * (d.value || 0)) / 100 : (d.value || 0);
        evaluatedDiscountSum += actualVal;
        d.value = -actualVal;
        d.formattedValue = `-${formatAmount(actualVal, sessionCurrency)}`;
        d.expression = `-${formatAmount(actualVal, sessionCurrency)}`;
    });

    const discountedSubtotal = Math.max(0, rawBaseSubtotal - evaluatedDiscountSum);

    // Evaluate Taxes against Discounted Subtotal
    let evaluatedTaxSum = 0;
    taxItems.forEach((t) => {
        const isPct = t.name.includes('%');
        const actualVal = isPct ? (discountedSubtotal * (t.value || 0)) / 100 : (t.value || 0);
        evaluatedTaxSum += actualVal;
        t.value = actualVal;
        t.formattedValue = `+${formatAmount(actualVal, sessionCurrency)}`;
        t.expression = `+${formatAmount(actualVal, sessionCurrency)}`;
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
        hasErrors: false,
        rawBaseSubtotal,
        totalDiscounts: evaluatedDiscountSum,
        totalTaxes: evaluatedTaxSum,
        finalTotal,
        splitResult,
        detectedCurrency: sessionCurrency,
    };
}