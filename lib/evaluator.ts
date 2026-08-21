import { CalculatedVariable, CalculationReceipt } from '@/types/workspace';

function normalizeKey(key: string): string {
    return key.trim().toLowerCase().replace(/_/g, ' ').replace(/\s+/g, ' ');
}

function isValidVariableName(name: string): boolean {
    return /^[a-zA-Z0-9_\s]+$/.test(name) && name.trim().length > 0;
}

function formatCurrencyOrNumber(val: number): string {
    if (Math.abs(val) >= 1000) {
        return '$' + val.toLocaleString('en-US', { maximumFractionDigits: 2 });
    }
    return val.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function evaluateExpression(exprRaw: string, context: Record<string, number>): number {
    let sanitized = exprRaw.replace(/\$/g, '').replace(/,/g, '');
    const sortedKeys = Object.keys(context).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
        const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&').replace(/\s+/g, '[_\\s]+');
        const regex = new RegExp(`\\b${escapedKey}\\b`, 'gi');
        sanitized = sanitized.replace(regex, context[key].toString());
    }

    if (!/^[0-9+\-*/().\s^%]+$/.test(sanitized)) {
        throw new Error('Invalid characters in expression');
    }

    let jsExpr = sanitized.replace(/\^/g, '**');
    const evaluated = Function(`"use strict"; return (${jsExpr})`)();
    if (typeof evaluated !== 'number' || isNaN(evaluated)) {
        throw new Error('Evaluation did not result in a valid number');
    }
    return evaluated;
}

function isLikelyQuery(exprRaw: string, context: Record<string, number>): boolean {
    const trimmedExpr = exprRaw.trim();
    if (!trimmedExpr) return false;
    return /^[a-zA-Z0-9_+\-*/().\s^%$]+$/.test(trimmedExpr);
}

export function evaluateScratchpad(text: string): {
    variables: CalculatedVariable[];
    receipt: CalculationReceipt;
} {
    const lines = text.split('\n');
    const context: Record<string, number> = {};
    const variables: CalculatedVariable[] = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) {
            continue;
        }

        // 1. Query/question resolution (ends with '?')
        if (trimmed.endsWith('?')) {
            const exprRaw = trimmed.slice(0, -1).trim();
            if (isLikelyQuery(exprRaw, context)) {
                try {
                    const evaluated = evaluateExpression(exprRaw, context);
                    variables.push({
                        name: trimmed,
                        value: evaluated,
                        rawExpression: exprRaw,
                        formattedValue: formatCurrencyOrNumber(evaluated),
                    });
                } catch {
                    variables.push({
                        name: trimmed,
                        value: 0,
                        rawExpression: exprRaw,
                        formattedValue: 'Error',
                        isError: true,
                    });
                }
            }
            continue;
        }

        // 2. Explicit Assignment (contains =, :, or word "is")
        const separatorRegex = /^(.*?)(?:\s*=\s*|\s*:\s*|\s+is\s+)(.*)$/i;
        const match = trimmed.match(separatorRegex);

        if (match && isValidVariableName(match[1])) {
            const rawName = match[1].trim();
            const rawExpr = match[2].trim();
            const normName = normalizeKey(rawName);
            const hasEquals = trimmed.includes('=');

            try {
                const evaluated = evaluateExpression(rawExpr, context);
                context[normName] = evaluated;
                variables.push({
                    name: rawName,
                    value: evaluated,
                    rawExpression: rawExpr,
                    formattedValue: formatCurrencyOrNumber(evaluated),
                });
            } catch (err) {
                // For '=' we explicitly show the error.
                // For ':' or 'is', we skip/ignore (treat as note) unless it's a valid expression.
                if (hasEquals) {
                    variables.push({
                        name: rawName,
                        value: 0,
                        rawExpression: rawExpr,
                        formattedValue: 'Error',
                        isError: true,
                    });
                }
            }
            continue;
        }

        // 3. Implicit Assignment (no explicit separator, e.g. "price 200" or "total cost 200")
        const tokens = trimmed.split(/\s+/);
        let implicitAssigned = false;
        if (tokens.length >= 2) {
            for (let i = 1; i < tokens.length; i++) {
                const left = tokens.slice(0, i).join(' ');
                const right = tokens.slice(i).join(' ');

                if (isValidVariableName(left)) {
                    try {
                        const evaluated = evaluateExpression(right, context);
                        const normName = normalizeKey(left);
                        context[normName] = evaluated;
                        variables.push({
                            name: left.trim(),
                            value: evaluated,
                            rawExpression: right.trim(),
                            formattedValue: formatCurrencyOrNumber(evaluated),
                        });
                        implicitAssigned = true;
                        break;
                    } catch {
                        // Try next split
                    }
                }
            }
        }

        // If it wasn't an assignment or query, we just ignore it (treat as comment/note).
    }

    const lastVar = variables[variables.length - 1];
    const priorVars = variables.slice(0, variables.length - 1);

    let marginMetric: { label: string; value: string } | null = null;
    // Check normalized names for revenue & net profit
    const revVal = context['revenue'];
    const profitVal = context['net profit'];
    if (revVal && profitVal && revVal > 0) {
        const margin = (profitVal / revVal) * 100;
        marginMetric = { label: 'Margin', value: `${margin.toFixed(1)}%` };
    }

    const receipt: CalculationReceipt = {
        primaryVariable: lastVar ? lastVar.name : 'Ready',
        primaryValue: lastVar ? lastVar.formattedValue : '$0',
        secondaryMetrics: marginMetric ? [marginMetric] : [],
        variables: priorVars.length > 0 ? priorVars : variables,
    };

    return { variables, receipt };
}