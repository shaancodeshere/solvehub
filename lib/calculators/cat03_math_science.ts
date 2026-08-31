import { CalculatorDefinition } from '../../types/calculator';

// Factorial helper for combinatorics
function factorial(n: number): number {
    if (n < 0) return 0;
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
}

export const mathScienceCalculators: CalculatorDefinition[] = [
    // 1. Percentage Calculator
    {
        id: 'percentage-calculator',
        name: 'Percentage Calculator',
        category: 'math-science',
        group: '3A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '2.2M',
        cpc: '$0.30',
        description: 'Computes common percentage problems: What is X% of Y, X is what percentage of Y, and percentage increase/decrease.',
        inputs: [
            {
                id: 'calcMode', name: 'Calculation Type', type: 'dropdown', defaultValue: 'what_is_pct_of', options: [
                    { label: 'What is X% of Y?', value: 'what_is_pct_of' },
                    { label: 'X is what % of Y?', value: 'x_is_what_pct_of_y' },
                    { label: 'Percentage Change from X to Y', value: 'pct_change' }
                ], tooltip: 'Select problem format.'
            },
            { id: 'valX', name: 'Value X', type: 'number', defaultValue: 15, step: 0.1, tooltip: 'First variable.' },
            { id: 'valY', name: 'Value Y', type: 'number', defaultValue: 250, step: 1, tooltip: 'Second variable.' }
        ],
        naturalLanguageQueries: [
            'Percentage calculator',
            'What is 15% of 250?',
            'Percentage increase from 50 to 75'
        ],
        edgeCases: ['Division by zero when base value Y is zero'],
        calculate: (inputs) => {
            const mode = inputs.calcMode;
            const x = Number(inputs.valX) || 0;
            const y = Number(inputs.valY) || 0;

            if (mode === 'what_is_pct_of') {
                const res = (x / 100) * y;
                return {
                    primaryOutput: { label: `${x}% of ${y}`, value: res.toFixed(2) },
                    secondaryMetrics: [
                        { label: 'Decimal Multiplier', value: (x / 100).toFixed(4) },
                        { label: 'Remaining Balance (Y - Result)', value: (y - res).toFixed(2) }
                    ]
                };
            } else if (mode === 'x_is_what_pct_of_y') {
                if (y === 0) {
                    return { primaryOutput: { label: 'Result', value: 'Cannot divide by 0' }, secondaryMetrics: [] };
                }
                const pct = (x / y) * 100;
                return {
                    primaryOutput: { label: 'Percentage Share', value: `${pct.toFixed(2)}%` },
                    secondaryMetrics: [
                        { label: 'Fraction Representation', value: `${x} / ${y}` },
                        { label: 'Decimal Ratio', value: (x / y).toFixed(4) }
                    ]
                };
            } else {
                // pct_change
                if (x === 0) {
                    return { primaryOutput: { label: 'Result', value: 'Initial value X cannot be 0' }, secondaryMetrics: [] };
                }
                const diff = y - x;
                const changePct = (diff / Math.abs(x)) * 100;
                return {
                    primaryOutput: { label: 'Percentage Change', value: `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%` },
                    secondaryMetrics: [
                        { label: 'Direction', value: changePct >= 0 ? 'Increase' : 'Decrease' },
                        { label: 'Absolute Difference', value: diff.toFixed(2) }
                    ]
                };
            }
        }
    },

    // 2. Scientific Notation & Standard Form Calculator
    {
        id: 'scientific-notation-calculator',
        name: 'Scientific Notation Calculator',
        category: 'math-science',
        group: '3A',
        bucket: 'Bucket B',
        tier: 2,
        phase: 1,
        monthlySearches: '110K',
        cpc: '$0.25',
        description: 'Converts between standard decimal format, scientific notation (a × 10^b), and engineering notation.',
        inputs: [
            { id: 'decimalInput', name: 'Input Number (Standard or Decimal)', type: 'text', defaultValue: '0.0000452', tooltip: 'Number to convert.' }
        ],
        naturalLanguageQueries: [
            'Scientific notation converter',
            'Convert 0.0000452 to scientific notation',
            'Engineering notation calculator'
        ],
        edgeCases: ['Invalid non-numeric input', 'Zero value notation'],
        calculate: (inputs) => {
            const raw = (inputs.decimalInput || '0').toString().trim();
            const num = Number(raw);

            if (isNaN(num)) {
                return { primaryOutput: { label: 'Error', value: 'Invalid Numeric Format' }, secondaryMetrics: [] };
            }

            if (num === 0) {
                return {
                    primaryOutput: { label: 'Scientific Notation', value: '0 × 10⁰' },
                    secondaryMetrics: [{ label: 'Engineering Notation', value: '0 × 10⁰' }]
                };
            }

            const expStr = num.toExponential();
            const [coeff, exponent] = expStr.split('e');
            const expNum = parseInt(exponent, 10);

            // Engineering notation: exponent must be a multiple of 3
            const engExp = Math.floor(expNum / 3) * 3;
            const engCoeff = num / Math.pow(10, engExp);

            return {
                primaryOutput: { label: 'Scientific Notation', value: `${parseFloat(coeff).toFixed(4)} × 10^${expNum}` },
                secondaryMetrics: [
                    { label: 'Engineering Notation', value: `${engCoeff.toFixed(4)} × 10^${engExp}` },
                    { label: 'Raw Exponential (E-notation)', value: expStr.toUpperCase() },
                    { label: 'Standard Decimal Form', value: num.toString() }
                ]
            };
        }
    },

    // 3. Quadratic Formula Calculator
    {
        id: 'quadratic-formula-calculator',
        name: 'Quadratic Equation Solver',
        category: 'math-science',
        group: '3A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '301K',
        cpc: '$0.35',
        description: 'Finds real and complex roots for quadratic polynomials in the standard form ax² + bx + c = 0.',
        inputs: [
            { id: 'coeffA', name: 'Coefficient a (x²)', type: 'number', defaultValue: 1, step: 0.1, tooltip: 'Leading coefficient (cannot be 0).' },
            { id: 'coeffB', name: 'Coefficient b (x)', type: 'number', defaultValue: -5, step: 0.1, tooltip: 'Linear coefficient.' },
            { id: 'coeffC', name: 'Constant c', type: 'number', defaultValue: 6, step: 0.1, tooltip: 'Constant term.' }
        ],
        naturalLanguageQueries: [
            'Solve quadratic equation x^2 - 5x + 6',
            'Quadratic formula calculator with steps',
            'Find roots of parabola'
        ],
        edgeCases: ['Leading coefficient a = 0 (linear degradation)', 'Negative discriminant (complex/imaginary roots)'],
        calculate: (inputs) => {
            const a = Number(inputs.coeffA) || 0;
            const b = Number(inputs.coeffB) || 0;
            const c = Number(inputs.coeffC) || 0;

            if (a === 0) {
                if (b === 0) {
                    return { primaryOutput: { label: 'Roots', value: 'Degenerate equation' }, secondaryMetrics: [] };
                }
                return {
                    primaryOutput: { label: 'Linear Root', value: `x = ${(-c / b).toFixed(4)}` },
                    secondaryMetrics: [{ label: 'Note', value: 'a = 0 reduces equation to linear form' }]
                };
            }

            // Discriminant: D = b^2 - 4ac
            const disc = (b * b) - (4 * a * c);
            const vertexX = -b / (2 * a);
            const vertexY = (a * vertexX * vertexX) + (b * vertexX) + c;

            if (disc > 0) {
                const root1 = (-b + Math.sqrt(disc)) / (2 * a);
                const root2 = (-b - Math.sqrt(disc)) / (2 * a);
                return {
                    primaryOutput: { label: 'Real Roots', value: `x₁ = ${root1.toFixed(4)}, x₂ = ${root2.toFixed(4)}` },
                    secondaryMetrics: [
                        { label: 'Discriminant (Δ)', value: disc.toFixed(2) },
                        { label: 'Parabola Vertex', value: `(${vertexX.toFixed(2)}, ${vertexY.toFixed(2)})` },
                        { label: 'Nature of Roots', value: 'Two Distinct Real Roots' }
                    ]
                };
            } else if (disc === 0) {
                const root = -b / (2 * a);
                return {
                    primaryOutput: { label: 'Single Repeated Root', value: `x = ${root.toFixed(4)}` },
                    secondaryMetrics: [
                        { label: 'Discriminant (Δ)', value: '0' },
                        { label: 'Parabola Vertex', value: `(${vertexX.toFixed(2)}, 0.00)` },
                        { label: 'Nature of Roots', value: 'One Real Double Root' }
                    ]
                };
            } else {
                const realPart = (-b / (2 * a)).toFixed(4);
                const imagPart = (Math.sqrt(-disc) / (2 * a)).toFixed(4);
                return {
                    primaryOutput: { label: 'Complex Roots', value: `${realPart} ± ${Math.abs(Number(imagPart))}i` },
                    secondaryMetrics: [
                        { label: 'Discriminant (Δ)', value: disc.toFixed(2) },
                        { label: 'Nature of Roots', value: 'Complex Conjugate Pair' }
                    ]
                };
            }
        }
    },

    // 4. Fraction to Decimal & Percent Calculator
    {
        id: 'fraction-calculator',
        name: 'Fraction to Decimal & Percentage Converter',
        category: 'math-science',
        group: '3A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '450K',
        cpc: '$0.20',
        description: 'Converts proper, improper, and mixed fractions into simplified terms, exact decimals, and percentages.',
        inputs: [
            { id: 'numerator', name: 'Numerator', type: 'number', defaultValue: 3, step: 1, tooltip: 'Top number of the fraction.' },
            { id: 'denominator', name: 'Denominator', type: 'number', defaultValue: 8, step: 1, tooltip: 'Bottom number of the fraction.' }
        ],
        naturalLanguageQueries: [
            'Convert 3/8 to decimal',
            'Fraction to percent calculator',
            'Simplify fraction'
        ],
        edgeCases: ['Denominator equal to 0'],
        calculate: (inputs) => {
            const num = Number(inputs.numerator) || 0;
            const den = Number(inputs.denominator) || 1;

            if (den === 0) {
                return { primaryOutput: { label: 'Error', value: 'Undefined (Denominator cannot be 0)' }, secondaryMetrics: [] };
            }

            // GCD for simplification
            const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
            const divisor = gcd(num, den);
            const simpNum = num / divisor;
            const simpDen = den / divisor;

            const decimal = num / den;
            const percent = decimal * 100;

            return {
                primaryOutput: { label: 'Decimal Equivalent', value: decimal.toFixed(6).replace(/\.?0+$/, '') },
                secondaryMetrics: [
                    { label: 'Simplified Fraction', value: `${simpNum} / ${simpDen}` },
                    { label: 'Percentage', value: `${percent.toFixed(2)}%` },
                    { label: 'Fraction Type', value: Math.abs(num) < Math.abs(den) ? 'Proper Fraction' : 'Improper Fraction' }
                ]
            };
        }
    },

    // 5. Permutations & Combinations Calculator (nPr / nCr)
    {
        id: 'permutations-combinations-calculator',
        name: 'Permutations & Combinations Calculator',
        category: 'math-science',
        group: '3A',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '110K',
        cpc: '$0.30',
        description: 'Computes combinations nCr (order does not matter) and permutations nPr (order matters) for statistical sampling.',
        inputs: [
            { id: 'totalN', name: 'Total Set Elements (n)', type: 'number', defaultValue: 10, min: 0, max: 25, step: 1, tooltip: 'Total available elements.' },
            { id: 'subsetR', name: 'Sample Subset Picked (r)', type: 'number', defaultValue: 3, min: 0, max: 25, step: 1, tooltip: 'Number of elements chosen.' }
        ],
        naturalLanguageQueries: [
            'nCr combinations calculator',
            'Permutations of 10 choose 3',
            'Combinatorics formula solver'
        ],
        edgeCases: ['r greater than n', 'n > 25 triggering JavaScript integer limit overflow'],
        calculate: (inputs) => {
            const n = Math.min(25, Math.max(0, Math.round(Number(inputs.totalN) || 10)));
            const r = Math.min(25, Math.max(0, Math.round(Number(inputs.subsetR) || 3)));

            if (r > n) {
                return { primaryOutput: { label: 'Result', value: 'r cannot be greater than n' }, secondaryMetrics: [] };
            }

            // nCr = n! / (r! * (n - r)!)
            const nFact = factorial(n);
            const rFact = factorial(r);
            const nMinusRFact = factorial(n - r);

            const nCr = Math.round(nFact / (rFact * nMinusRFact));
            const nPr = Math.round(nFact / nMinusRFact);

            return {
                primaryOutput: { label: 'Combinations (nCr — Order Independent)', value: nCr.toLocaleString() },
                secondaryMetrics: [
                    { label: 'Permutations (nPr — Order Matters)', value: nPr.toLocaleString() },
                    { label: 'Total Permutations Ratio', value: `${r}! = ${rFact}x more arrangements` }
                ]
            };
        }
    },

    // 6. Logarithm Calculator (log10, ln, log2, log_b)
    {
        id: 'logarithm-calculator',
        name: 'Logarithm Calculator',
        category: 'math-science',
        group: '3A',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '80K',
        cpc: '$0.25',
        description: 'Computes common logarithm (base 10), natural logarithm (ln / base e), binary log (base 2), and arbitrary base logs.',
        inputs: [
            { id: 'argumentX', name: 'Logarithm Argument (x)', type: 'number', defaultValue: 100, min: 0.000001, step: 1, tooltip: 'Input x (must be > 0).' },
            { id: 'baseB', name: 'Custom Base (b)', type: 'number', defaultValue: 10, min: 0.000001, step: 1, tooltip: 'Log base (must be > 0 and ≠ 1).' }
        ],
        naturalLanguageQueries: [
            'Log calculator',
            'Calculate natural log ln of 100',
            'Log base 2 calculator'
        ],
        edgeCases: ['Argument x <= 0', 'Base b <= 0 or b = 1'],
        calculate: (inputs) => {
            const x = Number(inputs.argumentX) || 100;
            const b = Number(inputs.baseB) || 10;

            if (x <= 0) {
                return { primaryOutput: { label: 'Error', value: 'Argument must be greater than 0' }, secondaryMetrics: [] };
            }
            if (b <= 0 || b === 1) {
                return { primaryOutput: { label: 'Error', value: 'Base must be > 0 and ≠ 1' }, secondaryMetrics: [] };
            }

            const logCustom = Math.log(x) / Math.log(b);
            const log10 = Math.log10(x);
            const ln = Math.log(x);
            const log2 = Math.log2(x);

            return {
                primaryOutput: { label: `Log base ${b} of ${x}`, value: logCustom.toFixed(5) },
                secondaryMetrics: [
                    { label: 'Common Log (log₁₀)', value: log10.toFixed(5) },
                    { label: 'Natural Log (ln)', value: ln.toFixed(5) },
                    { label: 'Binary Log (log₂)', value: log2.toFixed(5) }
                ]
            };
        }
    },

    // 7. Standard Deviation & Variance Calculator
    {
        id: 'standard-deviation-calculator',
        name: 'Standard Deviation & Variance Calculator',
        category: 'math-science',
        group: '3A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '450K',
        cpc: '$0.40',
        description: 'Computes population and sample standard deviation, variance, mean, and range from comma-separated data values.',
        inputs: [
            { id: 'datasetInput', name: 'Data Set (Comma Separated)', type: 'text', defaultValue: '12, 18, 24, 30, 36, 42', tooltip: 'Enter numbers separated by commas.' }
        ],
        naturalLanguageQueries: [
            'Standard deviation calculator',
            'Sample vs population standard deviation',
            'Calculate variance of numbers'
        ],
        edgeCases: ['Single data point (sample variance requires n >= 2)', 'Non-numeric string values'],
        calculate: (inputs) => {
            const raw = (inputs.datasetInput || '10, 20').toString();
            const numbers: number[] = raw
                .split(',')
                .map((s: string) => parseFloat(s.trim()))
                .filter((n: number) => !isNaN(n));

            const n = numbers.length;
            if (n === 0) {
                return { primaryOutput: { label: 'Error', value: 'No valid numbers provided' }, secondaryMetrics: [] };
            }

            const sum = numbers.reduce((acc: number, val: number) => acc + val, 0);
            const mean = sum / n;

            const sumSquaredDiffs = numbers.reduce((acc: number, val: number) => acc + Math.pow(val - mean, 2), 0);
            const popVariance = sumSquaredDiffs / n;
            const popStdDev = Math.sqrt(popVariance);

            const sampleVariance = n > 1 ? sumSquaredDiffs / (n - 1) : 0;
            const sampleStdDev = Math.sqrt(sampleVariance);

            const min = Math.min(...numbers);
            const max = Math.max(...numbers);

            return {
                primaryOutput: { label: 'Sample Standard Deviation (s)', value: sampleStdDev.toFixed(4) },
                secondaryMetrics: [
                    { label: 'Population Standard Deviation (σ)', value: popStdDev.toFixed(4) },
                    { label: 'Mean (Average)', value: mean.toFixed(4) },
                    { label: 'Sample Variance (s²)', value: sampleVariance.toFixed(4) },
                    { label: 'Data Count (n)', value: n.toString() },
                    { label: 'Range (Max - Min)', value: (max - min).toFixed(2) }
                ]
            };
        }
    },

    // 8. Matrix 2x2 Determinant & Inverse Calculator
    {
        id: 'matrix-determinant-calculator',
        name: '2x2 Matrix Determinant & Inverse Calculator',
        category: 'math-science',
        group: '3A',
        bucket: 'Bucket B',
        tier: 3,
        phase: 2,
        monthlySearches: '40K',
        cpc: '$0.20',
        description: 'Calculates the determinant, trace, and inverse matrix for a standard 2x2 linear algebra matrix.',
        inputs: [
            { id: 'm11', name: 'Matrix [Row 1, Col 1]', type: 'number', defaultValue: 4, step: 1, tooltip: 'a' },
            { id: 'm12', name: 'Matrix [Row 1, Col 2]', type: 'number', defaultValue: 7, step: 1, tooltip: 'b' },
            { id: 'm21', name: 'Matrix [Row 2, Col 1]', type: 'number', defaultValue: 2, step: 1, tooltip: 'c' },
            { id: 'm22', name: 'Matrix [Row 2, Col 2]', type: 'number', defaultValue: 6, step: 1, tooltip: 'd' }
        ],
        naturalLanguageQueries: [
            '2x2 matrix determinant calculator',
            'Find inverse of 2x2 matrix',
            'Matrix trace and determinant'
        ],
        edgeCases: ['Determinant = 0 (singular / non-invertible matrix)'],
        calculate: (inputs) => {
            const a = Number(inputs.m11) || 0;
            const b = Number(inputs.m12) || 0;
            const c = Number(inputs.m21) || 0;
            const d = Number(inputs.m22) || 0;

            // Determinant: det(A) = ad - bc
            const det = (a * d) - (b * c);
            const trace = a + d;

            if (det === 0) {
                return {
                    primaryOutput: { label: 'Determinant |A|', value: '0 (Singular Matrix)' },
                    secondaryMetrics: [
                        { label: 'Inverse Matrix A⁻¹', value: 'Undefined (Cannot Invert)' },
                        { label: 'Matrix Trace', value: trace.toString() }
                    ]
                };
            }

            // Inverse A^-1 = (1/det) * [ d  -b ]
            //                          [ -c  a ]
            const invA = (d / det).toFixed(3);
            const invB = (-b / det).toFixed(3);
            const invC = (-c / det).toFixed(3);
            const invD = (a / det).toFixed(3);

            return {
                primaryOutput: { label: 'Determinant |A|', value: det.toFixed(2) },
                secondaryMetrics: [
                    { label: 'Inverse Row 1', value: `[ ${invA}, ${invB} ]` },
                    { label: 'Inverse Row 2', value: `[ ${invC}, ${invD} ]` },
                    { label: 'Matrix Trace Tr(A)', value: trace.toFixed(2) }
                ]
            };
        }
    }
];