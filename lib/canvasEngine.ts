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
}

function formatNumber(val: number): string {
    if (Math.abs(val) >= 1000) {
        return Number.isInteger(val)
            ? val.toLocaleString()
            : val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return Number.isInteger(val) ? val.toString() : val.toFixed(2);
}

export function executeCanvasScript(rawText: string): CanvasExecutionResult {
    const lines = rawText.split('\n');
    const rawParsedItems: EvaluatedVariable[] = [];

    const baseItems: EvaluatedVariable[] = [];
    const discountItems: EvaluatedVariable[] = [];
    const taxItems: EvaluatedVariable[] = [];
    let userWroteTotal = false;
    let splitModifier: { lineNum: number; count: number; raw: string } | null = null;

    // Pass 1: Categorize and parse all statements
    for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i].trim();
        if (!rawLine || rawLine.startsWith('#') || rawLine.startsWith('//')) {
            continue;
        }

        let note: string | undefined = undefined;
        let clean = rawLine.replace(/[$€£₹]/g, '').trim();

        // Extract note if wrapped in ()
        const parenNoteMatch = clean.match(/\(([^)]+)\)\s*$/);
        if (parenNoteMatch) {
            note = parenNoteMatch[1].trim();
            clean = clean.replace(/\(([^)]+)\)\s*$/, '').trim();
        }

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

        // 3. Discount / Deductions
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
                // Notes strictly forbidden on discounts
            });
            continue;
        }

        // 4. Tax / Additions
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
                // Notes strictly forbidden on taxes
            });
            continue;
        }

        // 5. Standard Base Line Items (ticket, hotel, food, misc, etc.)
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
                        formattedValue: formatNumber(val),
                        isError: false,
                        type: 'base',
                        note: note, // Notes permitted on base items
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
                        formattedValue: formatNumber(val),
                        isError: false,
                        type: 'base',
                        note: note,
                    });
                    continue;
                }
            } catch {
                // Fallback
            }
        }
    }

    // Pass 2: Reconcile Reordered Canonical Financial Ledger
    const rawBaseSubtotal = baseItems.reduce((acc, item) => acc + (item.value || 0), 0);

    // Evaluate Discounts against Base Subtotal
    let evaluatedDiscountSum = 0;
    discountItems.forEach((d) => {
        const isPct = d.name.includes('%');
        const actualVal = isPct ? (rawBaseSubtotal * (d.value || 0)) / 100 : (d.value || 0);
        evaluatedDiscountSum += actualVal;
        d.value = -actualVal;
        d.formattedValue = `-${formatNumber(actualVal)}`;
        d.expression = isPct ? `-${formatNumber(actualVal)}` : `-${formatNumber(actualVal)}`;
    });

    const discountedSubtotal = Math.max(0, rawBaseSubtotal - evaluatedDiscountSum);

    // Evaluate Taxes against Discounted Subtotal
    let evaluatedTaxSum = 0;
    taxItems.forEach((t) => {
        const isPct = t.name.includes('%');
        const actualVal = isPct ? (discountedSubtotal * (t.value || 0)) / 100 : (t.value || 0);
        evaluatedTaxSum += actualVal;
        t.value = actualVal;
        t.formattedValue = `+${formatNumber(actualVal)}`;
        t.expression = `+${formatNumber(actualVal)}`;
    });

    const finalTotal = discountedSubtotal + evaluatedTaxSum;

    // Build Ordered Template: Base -> Discounts -> Taxes -> Total -> Split
    const orderedList: EvaluatedVariable[] = [...baseItems, ...discountItems, ...taxItems];

    // Insert TOTAL card if user typed 'total' or if there are modifiers
    if (userWroteTotal || discountItems.length > 0 || taxItems.length > 0 || splitModifier) {
        orderedList.push({
            id: 'template-total',
            lineNumber: -1,
            name: 'TOTAL',
            expression: `${baseItems.length} items consolidated`,
            value: finalTotal,
            formattedValue: formatNumber(finalTotal),
            isError: false,
            type: 'summary',
        });
    }

    // Insert Split Card (Strictly comes last)
    let splitResult: EvaluatedVariable | null = null;
    if (splitModifier) {
        const perPerson = finalTotal / splitModifier.count;
        splitResult = {
            id: 'template-split',
            lineNumber: splitModifier.lineNum,
            name: `Split between ${splitModifier.count}`,
            expression: `${formatNumber(finalTotal)} / ${splitModifier.count}`,
            value: perPerson,
            formattedValue: `${formatNumber(perPerson)} / person`,
            isError: false,
            type: 'modifier',
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
    };
}