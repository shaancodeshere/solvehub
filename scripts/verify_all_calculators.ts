import { allCalculators } from '../lib/calculators';
import { CalculatorDefinition, MetricItem } from '../types/calculator';

interface RuleViolation {
    calcId: string;
    calcName: string;
    category: string;
    rule: string;
    description: string;
    detail?: any;
}

const violations: RuleViolation[] = [];

console.log(`=======================================================`);
console.log(`SOLVEHUB PORTFOLIO-WIDE VERIFICATION & AUDIT SUITE`);
console.log(`Auditing ${allCalculators.length} calculators...`);
console.log(`=======================================================\n`);

// 12 Cat08 unit converter IDs
const unitConverterIds = [
    'conversion-calculator',
    'length-converter',
    'weight-converter',
    'temperature-converter',
    'volume-converter',
    'area-converter',
    'speed-converter',
    'pressure-converter',
    'energy-converter',
    'power-converter',
    'fuel-consumption-converter',
    'cooking-measurement-converter'
];

allCalculators.forEach((calc: CalculatorDefinition) => {
    // -------------------------------------------------------------
    // Extract default inputs
    // -------------------------------------------------------------
    const defaultInputs: Record<string, any> = {};
    calc.inputs.forEach((input) => {
        defaultInputs[input.id] = input.defaultValue;
    });

    // -------------------------------------------------------------
    // TEST 1: Default execution & Rule 3 (Math/NaN/Crash)
    // -------------------------------------------------------------
    let defaultResult: any = null;
    try {
        defaultResult = calc.calculate(defaultInputs);
        if (!defaultResult || !defaultResult.primaryOutput) {
            violations.push({
                calcId: calc.id,
                calcName: calc.name,
                category: calc.category,
                rule: 'RULE 3: Math Integrity',
                description: 'calculate() returned null or missing primaryOutput'
            });
        }
    } catch (err: any) {
        violations.push({
            calcId: calc.id,
            calcName: calc.name,
            category: calc.category,
            rule: 'RULE 3: Math Integrity',
            description: `calculate(defaultInputs) threw an exception: ${err?.message || err}`
        });
    }

    if (defaultResult) {
        const secList: MetricItem[] = defaultResult.secondaryMetrics || defaultResult.secondaryOutputs || [];

        // ---------------------------------------------------------
        // RULE 1: Redundancy & Self-Referential Metric Filtering
        // ---------------------------------------------------------
        const pLabel = String(defaultResult.primaryOutput?.label || '').trim().toLowerCase();
        const pVal = String(defaultResult.primaryOutput?.value ?? '').trim().toLowerCase();

        // Check if secondary duplicates primaryOutput
        secList.forEach((sec, idx) => {
            const sLabel = String(sec.label || '').trim().toLowerCase();
            const sVal = String(sec.value ?? '').trim().toLowerCase();
            if (sLabel === pLabel && sVal === pVal) {
                violations.push({
                    calcId: calc.id,
                    calcName: calc.name,
                    category: calc.category,
                    rule: 'RULE 1: Redundancy',
                    description: `secondaryMetrics[${idx}] ('${sec.label}: ${sec.value}') duplicates primaryOutput exactly`
                });
            }
        });

        // Check duplicate labels within secondary
        const seenLabels = new Set<string>();
        secList.forEach((sec, idx) => {
            const sLabel = String(sec.label || '').trim().toLowerCase();
            if (seenLabels.has(sLabel)) {
                violations.push({
                    calcId: calc.id,
                    calcName: calc.name,
                    category: calc.category,
                    rule: 'RULE 1: Redundancy',
                    description: `Duplicate secondary metric label '${sec.label}' at index ${idx}`
                });
            }
            seenLabels.add(sLabel);
        });

        // Unit converter specific checks: sourceUnit & targetUnit filtering
        if (unitConverterIds.includes(calc.id)) {
            const sourceUnit = defaultInputs.sourceUnit || defaultInputs.unitFrom || defaultInputs.fromUnit;
            const targetUnit = defaultInputs.targetUnit || defaultInputs.unitTo || defaultInputs.toUnit;

            const srcOpt = calc.inputs.find(i => i.id === 'sourceUnit' || i.id === 'unitFrom')?.options?.find(o => o.value === sourceUnit);
            const tgtOpt = calc.inputs.find(i => i.id === 'targetUnit' || i.id === 'unitTo')?.options?.find(o => o.value === targetUnit);

            const srcLabel = srcOpt ? srcOpt.label.toLowerCase() : String(sourceUnit || '').toLowerCase();
            const tgtLabel = tgtOpt ? tgtOpt.label.toLowerCase() : String(targetUnit || '').toLowerCase();

            secList.forEach((sec, idx) => {
                const sLabel = String(sec.label || '').toLowerCase();
                const sId = String((sec as any).id || '').toLowerCase();
                if ((sourceUnit && sId === String(sourceUnit).toLowerCase()) || (srcLabel && sLabel === srcLabel)) {
                    violations.push({
                        calcId: calc.id,
                        calcName: calc.name,
                        category: calc.category,
                        rule: 'RULE 1: Converter Redundancy',
                        description: `Converter secondary output contains sourceUnit '${sourceUnit}': '${sec.label}'`
                    });
                }
                if ((targetUnit && sId === String(targetUnit).toLowerCase()) || (tgtLabel && sLabel === tgtLabel)) {
                    violations.push({
                        calcId: calc.id,
                        calcName: calc.name,
                        category: calc.category,
                        rule: 'RULE 1: Converter Redundancy',
                        description: `Converter secondary output contains targetUnit '${targetUnit}': '${sec.label}'`
                    });
                }
            });
        }

        // ---------------------------------------------------------
        // RULE 2: Layout Safety & Long Metric Labels (> 30 chars)
        // ---------------------------------------------------------
        secList.forEach((sec, idx) => {
            const labelStr = String(sec.label || '').trim();
            if (labelStr.length > 30) {
                violations.push({
                    calcId: calc.id,
                    calcName: calc.name,
                    category: calc.category,
                    rule: 'RULE 2: Long Metric Label',
                    description: `secondaryMetrics[${idx}] label exceeds 30 chars (${labelStr.length}): "${labelStr}"`,
                    detail: { label: labelStr, length: labelStr.length }
                });
            }
        });

        // ---------------------------------------------------------
        // RULE 3: Math Integrity & No NaN / Infinity / Divergent floats
        // ---------------------------------------------------------
        const checkValue = (val: any, location: string) => {
            const strVal = String(val);
            if (strVal.includes('NaN')) {
                violations.push({
                    calcId: calc.id,
                    calcName: calc.name,
                    category: calc.category,
                    rule: 'RULE 3: NaN Detected',
                    description: `${location} contains NaN: "${strVal}"`
                });
            }
            if (strVal.includes('Infinity') || strVal.includes('-Infinity')) {
                violations.push({
                    calcId: calc.id,
                    calcName: calc.name,
                    category: calc.category,
                    rule: 'RULE 3: Infinity Detected',
                    description: `${location} contains Infinity: "${strVal}"`
                });
            }
            if (strVal.includes('undefined')) {
                violations.push({
                    calcId: calc.id,
                    calcName: calc.name,
                    category: calc.category,
                    rule: 'RULE 3: Undefined Detected',
                    description: `${location} contains undefined: "${strVal}"`
                });
            }
            // Check unrounded percentage decimals e.g. 12.3456789% (excluding medical BAC or microscopic probability)
            if (calc.id !== 'lottery-odds-calculator' && calc.id !== 'bac-calculator' && calc.id !== 'thermal-expansion-calculator') {
                const pctMatch = strVal.match(/(\d+\.\d{3,})%/);
                if (pctMatch) {
                    violations.push({
                        calcId: calc.id,
                        calcName: calc.name,
                        category: calc.category,
                        rule: 'RULE 3: Precision Divergence',
                        description: `${location} has unrounded floating percentage: "${pctMatch[0]}"`
                    });
                }
            }
        };

        checkValue(defaultResult.primaryOutput?.value, 'primaryOutput.value');
        if (defaultResult.primaryOutput?.suffix) {
            checkValue(defaultResult.primaryOutput.suffix, 'primaryOutput.suffix');
        }

        secList.forEach((sec, idx) => {
            checkValue(sec.value, `secondaryMetrics[${idx}] (${sec.label}) value`);
            if (sec.suffix) {
                checkValue(sec.suffix, `secondaryMetrics[${idx}] (${sec.label}) suffix`);
            }
        });
    }

    // -------------------------------------------------------------
    // TEST 2: Boundary / Zero-Rate / Zero-Input Edge Cases (Rule 3)
    // -------------------------------------------------------------
    const boundaryInputs: Record<string, any> = { ...defaultInputs };
    calc.inputs.forEach((input) => {
        if (input.type === 'number' || input.type === 'currency' || input.type === 'percentage') {
            // Test 0 if min <= 0 or not specified, else test min
            const testVal = (input.min !== undefined && input.min > 0) ? input.min : 0;
            boundaryInputs[input.id] = testVal;
        }
    });

    // Also specifically test zero interest rate on loan/debt calculators
    const zeroRateInputs: Record<string, any> = { ...defaultInputs };
    calc.inputs.forEach((input) => {
        const idLower = input.id.toLowerCase();
        if (idLower.includes('rate') || idLower.includes('interest') || idLower.includes('apr')) {
            zeroRateInputs[input.id] = 0;
        }
    });

    try {
        const zeroRes = calc.calculate(zeroRateInputs);
        if (zeroRes?.primaryOutput) {
            const pVal = String(zeroRes.primaryOutput.value);
            if (pVal.includes('NaN') || pVal.includes('Infinity')) {
                violations.push({
                    calcId: calc.id,
                    calcName: calc.name,
                    category: calc.category,
                    rule: 'RULE 3: Zero-Rate Division By Zero',
                    description: `Zero interest rate caused primary output to be '${pVal}'`
                });
            }
        }
    } catch (err: any) {
        violations.push({
            calcId: calc.id,
            calcName: calc.name,
            category: calc.category,
            rule: 'RULE 3: Zero-Rate Crash',
            description: `calculate(zeroRateInputs) threw an exception: ${err?.message || err}`
        });
    }

    try {
        const boundRes = calc.calculate(boundaryInputs);
        if (boundRes?.primaryOutput) {
            const pVal = String(boundRes.primaryOutput.value);
            if (pVal.includes('NaN') || pVal.includes('Infinity')) {
                violations.push({
                    calcId: calc.id,
                    calcName: calc.name,
                    category: calc.category,
                    rule: 'RULE 3: Boundary Value Error',
                    description: `Boundary inputs caused primary output to be '${pVal}'`
                });
            }
        }
    } catch (err: any) {
        // Boundary crashes
        violations.push({
            calcId: calc.id,
            calcName: calc.name,
            category: calc.category,
            rule: 'RULE 3: Boundary Crash',
            description: `calculate(boundaryInputs) threw an exception: ${err?.message || err}`
        });
    }
});

console.log(`\n=======================================================`);
console.log(`AUDIT COMPLETE: Found ${violations.length} total rule violations.`);
console.log(`=======================================================\n`);

const violationsByRule: Record<string, number> = {};
violations.forEach((v) => {
    violationsByRule[v.rule] = (violationsByRule[v.rule] || 0) + 1;
});

console.log('VIOLATIONS BY RULE:');
console.table(violationsByRule);

console.log('\n--- DETAILED VIOLATIONS ---');
violations.forEach((v, idx) => {
    console.log(`${idx + 1}. [${v.rule}] [${v.category}] ${v.calcId}: ${v.description}`);
});
