import { allCalculators } from '../lib/calculators';

interface AuditIssue {
    calcId: string;
    calcName: string;
    category: string;
    issueType: string;
    detail: string;
}

const issues: AuditIssue[] = [];

console.log(`Starting audit across ${allCalculators.length} calculators...`);

// Set of converter IDs that should have sourceUnit/targetUnit
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

allCalculators.forEach((calc) => {
    // 1. Description check
    if (!calc.description || calc.description.trim() === '') {
        issues.push({
            calcId: calc.id,
            calcName: calc.name,
            category: calc.category,
            issueType: 'EMPTY_DESCRIPTION',
            detail: 'Description is empty.'
        });
    } else if (calc.description.endsWith(' tool.') || calc.description.endsWith(' Tool.') || /^[A-Za-z0-9\s]+ tool\.$/i.test(calc.description.trim())) {
        issues.push({
            calcId: calc.id,
            calcName: calc.name,
            category: calc.category,
            issueType: 'PLACEHOLDER_DESCRIPTION',
            detail: `Placeholder description: "${calc.description}"`
        });
    }

    // 2. Input checks
    calc.inputs.forEach((input) => {
        if (input.type === 'dropdown') {
            if (!input.options || input.options.length === 0) {
                issues.push({
                    calcId: calc.id,
                    calcName: calc.name,
                    category: calc.category,
                    issueType: 'DROPDOWN_NO_OPTIONS',
                    detail: `Input '${input.id}' has no options.`
                });
            } else if (input.defaultValue !== undefined && !input.options.some((o) => String(o.value) === String(input.defaultValue))) {
                issues.push({
                    calcId: calc.id,
                    calcName: calc.name,
                    category: calc.category,
                    issueType: 'DROPDOWN_INVALID_DEFAULT',
                    detail: `Input '${input.id}' default value '${input.defaultValue}' not in options.`
                });
            }
        }

        if (input.defaultValue === undefined || input.defaultValue === null) {
            issues.push({
                calcId: calc.id,
                calcName: calc.name,
                category: calc.category,
                issueType: 'MISSING_DEFAULT_VALUE',
                detail: `Input '${input.id}' has undefined/null defaultValue.`
            });
        }
    });

    // 3. Converter source / target unit check
    if (unitConverterIds.includes(calc.id)) {
        const hasSource = calc.inputs.some(i => i.id === 'sourceUnit' || i.id === 'unitFrom' || i.id === 'fromUnit');
        const hasTarget = calc.inputs.some(i => i.id === 'targetUnit' || i.id === 'unitTo' || i.id === 'toUnit');
        if (!hasSource || !hasTarget) {
            issues.push({
                calcId: calc.id,
                calcName: calc.name,
                category: calc.category,
                issueType: 'CONVERTER_MISSING_UNITS',
                detail: `Converter lacks sourceUnit or targetUnit (hasSource=${hasSource}, hasTarget=${hasTarget})`
            });
        }
    }

    // 4. Execution check with default inputs
    const defaultInputs: Record<string, any> = {};
    calc.inputs.forEach((input) => {
        defaultInputs[input.id] = input.defaultValue;
    });

    try {
        const result = calc.calculate(defaultInputs);

        if (!result || !result.primaryOutput) {
            issues.push({
                calcId: calc.id,
                calcName: calc.name,
                category: calc.category,
                issueType: 'CALC_NO_PRIMARY_OUTPUT',
                detail: 'calculate() returned no primaryOutput.'
            });
        } else {
            const pVal = String(result.primaryOutput.value);
            const pSuffix = result.primaryOutput.suffix ? String(result.primaryOutput.suffix) : '';

            if (pVal.includes('NaN') || pVal.includes('undefined') || pVal.includes('null')) {
                issues.push({
                    calcId: calc.id,
                    calcName: calc.name,
                    category: calc.category,
                    issueType: 'OUTPUT_NAN_OR_UNDEFINED',
                    detail: `primaryOutput.value contains NaN/undefined: "${pVal}"`
                });
            }

            if (pSuffix.includes('NaN') || pSuffix.includes('undefined') || pSuffix.includes('null')) {
                issues.push({
                    calcId: calc.id,
                    calcName: calc.name,
                    category: calc.category,
                    issueType: 'SUFFIX_NAN_OR_UNDEFINED',
                    detail: `primaryOutput.suffix contains NaN/undefined: "${pSuffix}"`
                });
            }

            // Check if suffix and value both have units that collide
            if (pSuffix && (
                (pVal.includes('ft') && pSuffix.includes('"')) ||
                (pVal.includes('lbs') && pSuffix.includes('oz')) ||
                (pVal.includes('°F') && pSuffix.includes('K')) ||
                (pVal.includes('gal') && pSuffix.includes('fl oz')) ||
                (pVal.includes('sq ft') && pSuffix.includes('Acres')) ||
                (pVal.includes('MPH') && pSuffix.includes('m/s'))
            )) {
                issues.push({
                    calcId: calc.id,
                    calcName: calc.name,
                    category: calc.category,
                    issueType: 'STRING_COLLISION',
                    detail: `Primary output value "${pVal}" and suffix "${pSuffix}" collide.`
                });
            }

            // Check secondary metrics
            if (result.secondaryMetrics) {
                result.secondaryMetrics.forEach((m, idx) => {
                    const mVal = String(m.value);
                    if (mVal.includes('NaN') || mVal.includes('undefined') || mVal.includes('null')) {
                        issues.push({
                            calcId: calc.id,
                            calcName: calc.name,
                            category: calc.category,
                            issueType: 'SECONDARY_NAN_OR_UNDEFINED',
                            detail: `secondaryMetrics[${idx}] (${m.label}) contains NaN/undefined: "${mVal}"`
                        });
                    }
                });
            }
        }
    } catch (err: any) {
        issues.push({
            calcId: calc.id,
            calcName: calc.name,
            category: calc.category,
            issueType: 'CALC_CRASH',
            detail: `calculate() threw an exception: ${err?.message || err}`
        });
    }
});

console.log(`\nAudit completed. Found ${issues.length} total issues.\n`);

const issueTypesCount: Record<string, number> = {};
issues.forEach((iss) => {
    issueTypesCount[iss.issueType] = (issueTypesCount[iss.issueType] || 0) + 1;
});

console.log('Issues by Type:');
console.table(issueTypesCount);

console.log('\nDetailed Issues:');
issues.forEach((iss) => {
    console.log(`[${iss.category}] ${iss.calcId} (${iss.calcName}) -> ${iss.issueType}: ${iss.detail}`);
});
