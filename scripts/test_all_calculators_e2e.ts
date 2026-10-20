import { allCalculators } from '../lib/calculators';
import { CalculatorDefinition, MetricItem, CalculationResult } from '../types/calculator';

interface FailureReason {
    test: 'DEFAULT' | 'BOUNDARY' | 'ZERO_RATE' | 'DROPDOWN' | 'LAYOUT_REDUNDANCY';
    message: string;
    details?: any;
}

interface CalculatorTestResult {
    calcId: string;
    calcName: string;
    category: string;
    passed: boolean;
    failures: FailureReason[];
}

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

function isInvalidValue(val: any, allowEmptyString: boolean = false): boolean {
    if (val === undefined || val === null) return true;
    if (typeof val === 'number') {
        return isNaN(val) || !isFinite(val);
    }
    const str = String(val).trim();
    if (!allowEmptyString && str === '') return true;
    if (str.includes('NaN')) return true;
    if (str.includes('undefined')) return true;
    if (str.includes('[object Object]')) return true;
    if (str.includes('Infinity') || str.includes('-Infinity')) return true;
    return false;
}

function getSecondaryOutputs(result: CalculationResult | null | undefined): MetricItem[] {
    if (!result) return [];
    return result.secondaryOutputs || result.secondaryMetrics || [];
}

function checkConverterRedundancy(
    calc: CalculatorDefinition,
    payload: Record<string, any>,
    secondaries: MetricItem[],
    failures: FailureReason[],
    contextDesc: string
) {
    const isConverter =
        calc.category === 'conversion-units' ||
        calc.category.includes('08') ||
        unitConverterIds.includes(calc.id);

    if (!isConverter) return;

    const sourceUnit = payload.sourceUnit || payload.unitFrom || payload.fromUnit;
    const targetUnit = payload.targetUnit || payload.unitTo || payload.toUnit;

    const srcInput = calc.inputs.find((i) => i.id === 'sourceUnit' || i.id === 'unitFrom' || i.id === 'fromUnit');
    const tgtInput = calc.inputs.find((i) => i.id === 'targetUnit' || i.id === 'unitTo' || i.id === 'toUnit');

    const srcOpt = srcInput?.options?.find((o) => o.value === sourceUnit);
    const tgtOpt = tgtInput?.options?.find((o) => o.value === targetUnit);

    const srcLabel = srcOpt ? srcOpt.label.toLowerCase() : String(sourceUnit || '').toLowerCase();
    const tgtLabel = tgtOpt ? tgtOpt.label.toLowerCase() : String(targetUnit || '').toLowerCase();

    for (let idx = 0; idx < secondaries.length; idx++) {
        const sec = secondaries[idx];
        const sLabelLower = String(sec.label || '').trim().toLowerCase();
        const sIdLower = String((sec as any).id || '').trim().toLowerCase();

        if ((sourceUnit && sIdLower === String(sourceUnit).toLowerCase()) || (srcLabel && sLabelLower === srcLabel)) {
            failures.push({
                test: 'LAYOUT_REDUNDANCY',
                message: `${contextDesc}: Converter secondaryOutput contains sourceUnit '${sourceUnit}': '${sec.label}'`
            });
        }
        if ((targetUnit && sIdLower === String(targetUnit).toLowerCase()) || (tgtLabel && sLabelLower === tgtLabel)) {
            failures.push({
                test: 'LAYOUT_REDUNDANCY',
                message: `${contextDesc}: Converter secondaryOutput contains targetUnit '${targetUnit}': '${sec.label}'`
            });
        }
    }
}

export function runAllCalculatorTests(): {
    total: number;
    passed: number;
    failed: number;
    results: CalculatorTestResult[];
} {
    const results: CalculatorTestResult[] = [];

    for (const calc of allCalculators) {
        const failures: FailureReason[] = [];

        // -------------------------------------------------------------
        // A. Default Parameters Test
        // -------------------------------------------------------------
        const defaultPayload: Record<string, any> = {};
        for (const input of calc.inputs) {
            defaultPayload[input.id] = input.defaultValue;
        }

        let defaultResult: CalculationResult | null = null;
        try {
            defaultResult = calc.calculate(defaultPayload);
            if (!defaultResult || typeof defaultResult !== 'object') {
                failures.push({
                    test: 'DEFAULT',
                    message: 'calculate(defaultPayload) returned null or non-object result'
                });
            } else if (!defaultResult.primaryOutput) {
                failures.push({
                    test: 'DEFAULT',
                    message: 'result.primaryOutput is missing or undefined'
                });
            } else {
                const po = defaultResult.primaryOutput;
                if (!po.label || String(po.label).trim() === '') {
                    failures.push({
                        test: 'DEFAULT',
                        message: 'result.primaryOutput.label is empty or undefined'
                    });
                }
                if (isInvalidValue(po.value, false)) {
                    failures.push({
                        test: 'DEFAULT',
                        message: `result.primaryOutput.value is invalid: "${po.value}"`
                    });
                }

                // Inspect secondaryOutputs
                const secondaries = getSecondaryOutputs(defaultResult);
                for (let idx = 0; idx < secondaries.length; idx++) {
                    const sec = secondaries[idx];
                    if (!sec || !sec.label || String(sec.label).trim() === '') {
                        failures.push({
                            test: 'DEFAULT',
                            message: `secondaryOutput[${idx}] has missing or empty label`
                        });
                    }
                    if (isInvalidValue(sec?.value, false)) {
                        failures.push({
                            test: 'DEFAULT',
                            message: `secondaryOutput[${idx}] ('${sec?.label}') has invalid value: "${sec?.value}"`
                        });
                    }
                }
            }
        } catch (err: any) {
            failures.push({
                test: 'DEFAULT',
                message: `calculate(defaultPayload) threw exception: ${err?.message || err}`,
                details: err?.stack
            });
        }

        // -------------------------------------------------------------
        // B. Boundary & Zero-Value Resilience Test
        // -------------------------------------------------------------
        // B1: All numeric inputs set to zero or minimal valid bound
        const allBoundaryPayload: Record<string, any> = { ...defaultPayload };
        const numericInputs = calc.inputs.filter(
            (input) =>
                input.type === 'number' ||
                input.type === 'currency' ||
                input.type === 'percentage' ||
                typeof input.defaultValue === 'number'
        );

        for (const input of numericInputs) {
            const minBound = (input.min !== undefined && input.min > 0) ? input.min : 0;
            allBoundaryPayload[input.id] = minBound;
        }

        if (numericInputs.length > 0) {
            try {
                const boundResult = calc.calculate(allBoundaryPayload);
                if (boundResult && boundResult.primaryOutput) {
                    if (isInvalidValue(boundResult.primaryOutput.value, false)) {
                        failures.push({
                            test: 'BOUNDARY',
                            message: `All-boundary inputs caused invalid primaryOutput.value: "${boundResult.primaryOutput.value}"`
                        });
                    }
                    const boundSecondaries = getSecondaryOutputs(boundResult);
                    for (let idx = 0; idx < boundSecondaries.length; idx++) {
                        const sec = boundSecondaries[idx];
                        if (isInvalidValue(sec?.value, false)) {
                            failures.push({
                                test: 'BOUNDARY',
                                message: `All-boundary inputs caused secondaryOutput[${idx}] ('${sec?.label}') to be invalid: "${sec?.value}"`
                            });
                        }
                    }
                } else if (!boundResult) {
                    failures.push({
                        test: 'BOUNDARY',
                        message: 'calculate(allBoundaryPayload) returned null or non-object result'
                    });
                }
            } catch (err: any) {
                failures.push({
                    test: 'BOUNDARY',
                    message: `calculate(allBoundaryPayload) threw exception: ${err?.message || err}`,
                    details: err?.stack
                });
            }

            // B2: Individual numeric input boundary test
            for (const input of numericInputs) {
                const singleBoundPayload = { ...defaultPayload };
                const minBound = (input.min !== undefined && input.min > 0) ? input.min : 0;
                singleBoundPayload[input.id] = minBound;

                try {
                    const singleBoundResult = calc.calculate(singleBoundPayload);
                    if (singleBoundResult && singleBoundResult.primaryOutput) {
                        if (isInvalidValue(singleBoundResult.primaryOutput.value, false)) {
                            failures.push({
                                test: 'BOUNDARY',
                                message: `Single boundary on '${input.id}' (${minBound}) caused invalid primaryOutput.value: "${singleBoundResult.primaryOutput.value}"`
                            });
                        }
                        const singleSecondaries = getSecondaryOutputs(singleBoundResult);
                        for (let idx = 0; idx < singleSecondaries.length; idx++) {
                            const sec = singleSecondaries[idx];
                            if (isInvalidValue(sec?.value, false)) {
                                failures.push({
                                    test: 'BOUNDARY',
                                    message: `Single boundary on '${input.id}' caused secondaryOutput[${idx}] ('${sec?.label}') to be invalid: "${sec?.value}"`
                                });
                            }
                        }
                    }
                } catch (err: any) {
                    failures.push({
                        test: 'BOUNDARY',
                        message: `calculate(singleBound on '${input.id}') threw exception: ${err?.message || err}`,
                        details: err?.stack
                    });
                }
            }
        }

        // B3: Financial and Rate Zero-Rate / Zero-Fee resilience
        const rateOrFeeInputs = calc.inputs.filter((input) => {
            const idLower = input.id.toLowerCase();
            const nameLower = input.name.toLowerCase();
            const isRateOrFee =
                idLower.includes('rate') ||
                idLower.includes('interest') ||
                idLower.includes('apr') ||
                idLower.includes('fee') ||
                idLower.includes('discount') ||
                idLower.includes('margin') ||
                idLower.includes('tax') ||
                nameLower.includes('rate') ||
                nameLower.includes('interest') ||
                nameLower.includes('apr') ||
                nameLower.includes('fee');

            return isRateOrFee && (input.type === 'number' || input.type === 'percentage' || input.type === 'currency' || typeof input.defaultValue === 'number');
        });

        if (rateOrFeeInputs.length > 0) {
            const zeroRatePayload: Record<string, any> = { ...defaultPayload };
            for (const input of rateOrFeeInputs) {
                zeroRatePayload[input.id] = 0;
            }

            try {
                const zeroRateResult = calc.calculate(zeroRatePayload);
                if (zeroRateResult && zeroRateResult.primaryOutput) {
                    if (isInvalidValue(zeroRateResult.primaryOutput.value, false)) {
                        failures.push({
                            test: 'ZERO_RATE',
                            message: `Zero rate/fee caused invalid primaryOutput.value: "${zeroRateResult.primaryOutput.value}"`
                        });
                    }
                    const zeroSecondaries = getSecondaryOutputs(zeroRateResult);
                    for (let idx = 0; idx < zeroSecondaries.length; idx++) {
                        const sec = zeroSecondaries[idx];
                        if (isInvalidValue(sec?.value, false)) {
                            failures.push({
                                test: 'ZERO_RATE',
                                message: `Zero rate/fee caused secondaryOutput[${idx}] ('${sec?.label}') to be invalid: "${sec?.value}"`
                            });
                        }
                    }
                }
            } catch (err: any) {
                failures.push({
                    test: 'ZERO_RATE',
                    message: `calculate(zeroRatePayload) threw exception: ${err?.message || err}`,
                    details: err?.stack
                });
            }
        }

        // -------------------------------------------------------------
        // C. Dropdown / Select Option Integrity
        // -------------------------------------------------------------
        for (const input of calc.inputs) {
            const isSelect = input.type === 'dropdown' || (input as any).type === 'select' || (input.options && input.options.length > 0);
            if (!isSelect) continue;

            if (!input.options || input.options.length === 0) {
                failures.push({
                    test: 'DROPDOWN',
                    message: `Select input '${input.id}' has empty or missing options array`
                });
                continue;
            }

            // Verify defaultValue matches one of declared options
            const defaultMatch = input.options.some((opt) => opt.value === input.defaultValue || String(opt.value) === String(input.defaultValue));
            if (!defaultMatch) {
                failures.push({
                    test: 'DROPDOWN',
                    message: `Select input '${input.id}' defaultValue '${input.defaultValue}' does not match any declared option in [${input.options.map(o => o.value).join(', ')}]`
                });
            }

            // Test calculating with each declared option
            for (const option of input.options) {
                const optionPayload = { ...defaultPayload, [input.id]: option.value };
                try {
                    const optResult = calc.calculate(optionPayload);
                    if (!optResult || !optResult.primaryOutput) {
                        failures.push({
                            test: 'DROPDOWN',
                            message: `Option '${option.value}' on input '${input.id}' produced missing or null result`
                        });
                    } else {
                        if (isInvalidValue(optResult.primaryOutput.value, false)) {
                            failures.push({
                                test: 'DROPDOWN',
                                message: `Option '${option.value}' on input '${input.id}' produced invalid primaryOutput.value: "${optResult.primaryOutput.value}"`
                            });
                        }
                        const optSecondaries = getSecondaryOutputs(optResult);
                        for (let sIdx = 0; sIdx < optSecondaries.length; sIdx++) {
                            const sec = optSecondaries[sIdx];
                            if (isInvalidValue(sec?.value, false)) {
                                failures.push({
                                    test: 'DROPDOWN',
                                    message: `Option '${option.value}' on input '${input.id}' produced invalid secondaryOutput[${sIdx}] ('${sec?.label}'): "${sec?.value}"`
                                });
                            }
                        }

                        // Converter check for options
                        checkConverterRedundancy(calc, optionPayload, optSecondaries, failures, `Option '${option.value}' on '${input.id}'`);
                    }
                } catch (err: any) {
                    failures.push({
                        test: 'DROPDOWN',
                        message: `Option '${option.value}' on input '${input.id}' threw exception: ${err?.message || err}`,
                        details: err?.stack
                    });
                }
            }
        }

        // -------------------------------------------------------------
        // D. Layout & Redundancy Check
        // -------------------------------------------------------------
        if (defaultResult && defaultResult.primaryOutput) {
            const primaryLabel = String(defaultResult.primaryOutput.label || '').trim().toLowerCase();
            const secondaries = getSecondaryOutputs(defaultResult);
            const seenSecondaryLabels = new Set<string>();

            for (let idx = 0; idx < secondaries.length; idx++) {
                const sec = secondaries[idx];
                const secLabel = String(sec.label || '').trim();
                const secLabelLower = secLabel.toLowerCase();

                // 1. Check if secondary output label duplicates primary output label
                if (secLabelLower && secLabelLower === primaryLabel) {
                    failures.push({
                        test: 'LAYOUT_REDUNDANCY',
                        message: `secondaryOutput[${idx}] label ('${secLabel}') duplicates primaryOutput label ('${defaultResult.primaryOutput.label}')`
                    });
                }

                // Check duplicate label within secondary list
                if (seenSecondaryLabels.has(secLabelLower)) {
                    failures.push({
                        test: 'LAYOUT_REDUNDANCY',
                        message: `Duplicate secondaryOutput label ('${secLabel}') at index ${idx}`
                    });
                }
                seenSecondaryLabels.add(secLabelLower);

                // 2. Secondary output label length check (> 32 characters)
                if (secLabel.length > 32) {
                    failures.push({
                        test: 'LAYOUT_REDUNDANCY',
                        message: `secondaryOutput[${idx}] label exceeds 32 characters (${secLabel.length} chars): "${secLabel}"`
                    });
                }
            }

            // 3. For converters (Category 08), check secondary list does not re-display chosen source or target units
            checkConverterRedundancy(calc, defaultPayload, secondaries, failures, 'Default inputs');
        }

        results.push({
            calcId: calc.id,
            calcName: calc.name,
            category: calc.category,
            passed: failures.length === 0,
            failures
        });
    }

    const total = results.length;
    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;

    return { total, passed, failed, results };
}

// Direct CLI Execution
if (require.main === module || (typeof process !== 'undefined' && process.argv[1]?.includes('test_all_calculators_e2e'))) {
    console.log('======================================================================');
    console.log('   SOLVEHUB END-TO-END AUTOMATED TEST RUNNER (ALL 487 CALCULATORS)    ');
    console.log('======================================================================\n');

    const outcome = runAllCalculatorTests();

    console.log('----------------------------------------------------------------------');
    console.log(`Total Calculators Scanned : ${outcome.total}`);
    console.log(`Total Passed             : ${outcome.passed}`);
    console.log(`Total Failed             : ${outcome.failed}`);
    console.log(`Success Rate             : ${((outcome.passed / outcome.total) * 100).toFixed(2)}%`);
    console.log('----------------------------------------------------------------------\n');

    if (outcome.failed > 0) {
        console.error('FAILED CALCULATORS BREAKDOWN:\n');
        outcome.results
            .filter((r) => !r.passed)
            .forEach((r, idx) => {
                console.error(`${idx + 1}. [${r.category}] ${r.calcId} ("${r.calcName}")`);
                r.failures.forEach((f) => {
                    console.error(`   - [${f.test}] ${f.message}`);
                    if (f.details) {
                        console.error(`     Stack: ${f.details.split('\n').slice(0, 3).join('\n     ')}`);
                    }
                });
                console.error('');
            });
        process.exit(1);
    } else {
        console.log(`✅ 487 / 487 Calculators Passed (100% Success)`);
        process.exit(0);
    }
}
