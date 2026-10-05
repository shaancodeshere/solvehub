import { CalculatorDefinition } from '@/types/calculator';

export const mathScienceCalculators: CalculatorDefinition[] = [
    // 1. Basic Calculator
    {
        id: 'basic-calculator',
        name: 'Basic Calculator',
        category: 'math-algebra',
        group: 'General & Arithmetic',
        bucket: 'Bucket B',
        tier: 2,
        phase: 1,
        monthlySearches: '33K',
        cpc: '$0.28',
        description: "A Basic Calculator performs standard arithmetic operations such as addition, subtraction, multiplication, and division. It is designed for general-purpose mathematical calculations and everyday numeric problem solving. The calculator supports sequential operations, parentheses, decimal numbers, and sign handling.",
        inputs: [
            { id: 'num1', name: 'First Number (a)', type: 'number', defaultValue: 12, step: 0.1, tooltip: 'First operand.' },
            { id: 'operation', name: 'Operation', type: 'dropdown', defaultValue: 'add', options: [{ label: 'Addition (a + b)', value: 'add' }, { label: 'Subtraction (a - b)', value: 'subtract' }, { label: 'Multiplication (a × b)', value: 'multiply' }, { label: 'Division (a ÷ b)', value: 'divide' }, { label: 'Exponentiation (a ^ b)', value: 'power' }, { label: 'Modulo / Remainder (a % b)', value: 'mod' }], tooltip: 'Arithmetic operation.' },
            { id: 'num2', name: 'Second Number (b)', type: 'number', defaultValue: 4, step: 0.1, tooltip: 'Second operand.' }
        ],
        naturalLanguageQueries: ["Calculate my basic calculator", "What is my basic calculator?", "Help me solve basic calculator"],
        edgeCases: ["Division by zero Invalid expressions Floating-point precision issues Extremely large numbers"],
        calculate: (inputs) => {
            const a = Number(inputs.num1) || 0;
            const b = Number(inputs.num2) || 0;
            const op = String(inputs.operation || 'add');

            let result = 0;
            let opSymbol = '+';
            if (op === 'add') { result = a + b; opSymbol = '+'; }
            else if (op === 'subtract') { result = a - b; opSymbol = '-'; }
            else if (op === 'multiply') { result = a * b; opSymbol = '×'; }
            else if (op === 'divide') {
                if (b === 0) return { primaryOutput: { label: 'Result', value: 'Error: Division by zero' } };
                result = a / b;
                opSymbol = '÷';
            }
            else if (op === 'power') { result = Math.pow(a, b); opSymbol = '^'; }
            else if (op === 'mod') { result = a % b; opSymbol = '%'; }

            return {
                primaryOutput: { label: 'Calculated Result', value: Number.isInteger(result) ? result : Number(result.toFixed(6)) },
                secondaryMetrics: [
                    { label: 'Expression', value: `${a} ${opSymbol} ${b} = ${Number.isInteger(result) ? result : Number(result.toFixed(6))}` },
                    { label: 'Opposite Operation (a - b / a + b)', value: String(op === 'add' ? a - b : (op === 'subtract' ? a + b : a * b)) }
                ]
            };
        }
    },
    // 2. Scientific Calculator
    {
        id: 'scientific-calculator',
        name: 'Scientific Calculator',
        category: 'math-algebra',
        group: 'General & Arithmetic',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '1.5M',
        cpc: '$0.20',
        description: "A Scientific Calculator performs advanced mathematical operations including trigonometry, logarithms, exponents, roots, and scientific notation. It is designed for engineering, science, and academic calculations. The calculator supports complex mathematical expressions and advanced functions.",
        inputs: [
            { id: 'valX', name: 'Input Value (x)', type: 'number', defaultValue: 45, step: 0.1, tooltip: 'Primary numeric value.' },
            { id: 'func', name: 'Scientific Function', type: 'dropdown', defaultValue: 'sin', options: [{ label: 'Sine: sin(x deg)', value: 'sin' }, { label: 'Cosine: cos(x deg)', value: 'cos' }, { label: 'Tangent: tan(x deg)', value: 'tan' }, { label: 'Square Root: sqrt(x)', value: 'sqrt' }, { label: 'Natural Log: ln(x)', value: 'ln' }, { label: 'Log Base 10: log10(x)', value: 'log10' }, { label: 'Exponential: e^x', value: 'exp' }, { label: 'Factorial: x!', value: 'factorial' }], tooltip: 'Function to evaluate.' }
        ],
        naturalLanguageQueries: ["Calculate my scientific calculator", "What is my scientific calculator?", "Help me solve scientific calculator"],
        edgeCases: ["Invalid domain values Undefined tangent values Factorials of negative integers Floating-point rounding errors"],
        calculate: (inputs) => {
            const x = Number(inputs.valX) || 0;
            const fn = String(inputs.func || 'sin');
            const rad = (x * Math.PI) / 180;

            let result = 0;
            let note = '';
            if (fn === 'sin') { result = Math.sin(rad); note = `sin(${x}°) = ${result.toFixed(6)}`; }
            else if (fn === 'cos') { result = Math.cos(rad); note = `cos(${x}°) = ${result.toFixed(6)}`; }
            else if (fn === 'tan') { result = Math.tan(rad); note = `tan(${x}°) = ${result.toFixed(6)}`; }
            else if (fn === 'sqrt') {
                if (x < 0) return { primaryOutput: { label: 'Result', value: 'Error: Negative Square Root' } };
                result = Math.sqrt(x);
                note = `√${x} = ${result.toFixed(6)}`;
            }
            else if (fn === 'ln') {
                if (x <= 0) return { primaryOutput: { label: 'Result', value: 'Error: ln(x) undefined for x <= 0' } };
                result = Math.log(x);
                note = `ln(${x}) = ${result.toFixed(6)}`;
            }
            else if (fn === 'log10') {
                if (x <= 0) return { primaryOutput: { label: 'Result', value: 'Error: log10(x) undefined for x <= 0' } };
                result = Math.log10(x);
                note = `log10(${x}) = ${result.toFixed(6)}`;
            }
            else if (fn === 'exp') { result = Math.exp(x); note = `e^${x} = ${result.toFixed(6)}`; }
            else if (fn === 'factorial') {
                if (x < 0 || !Number.isInteger(x) || x > 170) return { primaryOutput: { label: 'Result', value: 'Error: Integer 0-170 required' } };
                let f = 1;
                for (let i = 2; i <= x; i++) f *= i;
                result = f;
                note = `${x}! = ${result}`;
            }

            return {
                primaryOutput: { label: 'Function Result f(x)', value: Number.isInteger(result) ? result : Number(result.toFixed(6)) },
                secondaryMetrics: [
                    { label: 'Expression Note', value: note },
                    { label: 'Input in Radians', value: `${rad.toFixed(4)} rad` }
                ]
            };
        }
    },
    // 3. Fraction Calculator
    {
        id: 'fraction-calculator',
        name: 'Fraction Calculator',
        category: 'math-algebra',
        group: 'General & Arithmetic',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '450K',
        cpc: '$1.37',
        description: "A Fraction Calculator performs arithmetic operations involving fractions including addition, subtraction, multiplication, and division. It also simplifies and converts fractions. The calculator supports mixed numbers and improper fractions.",
        inputs: [
            { id: 'numA', name: 'Fraction 1 - Numerator (a)', type: 'number', defaultValue: 3, step: 1, tooltip: 'Numerator 1.' },
            { id: 'denA', name: 'Fraction 1 - Denominator (b)', type: 'number', defaultValue: 4, min: 1, step: 1, tooltip: 'Denominator 1.' },
            { id: 'operation', name: 'Operator', type: 'dropdown', defaultValue: 'add', options: [{ label: 'Add (+)', value: 'add' }, { label: 'Subtract (-)', value: 'subtract' }, { label: 'Multiply (×)', value: 'multiply' }, { label: 'Divide (÷)', value: 'divide' }], tooltip: 'Operation.' },
            { id: 'numB', name: 'Fraction 2 - Numerator (c)', type: 'number', defaultValue: 2, step: 1, tooltip: 'Numerator 2.' },
            { id: 'denB', name: 'Fraction 2 - Denominator (d)', type: 'number', defaultValue: 5, min: 1, step: 1, tooltip: 'Denominator 2.' }
        ],
        naturalLanguageQueries: ["Calculate my fraction calculator", "What is my fraction calculator?", "Help me solve fraction calculator"],
        edgeCases: ["Zero denominators Negative fractions Improper fraction normalization"],
        calculate: (inputs) => {
            const nA = Number(inputs.numA) || 0;
            const dA = Number(inputs.denA) || 1;
            const nB = Number(inputs.numB) || 0;
            const dB = Number(inputs.denB) || 1;
            const op = String(inputs.operation || 'add');

            if (dA === 0 || dB === 0) return { primaryOutput: { label: 'Result', value: 'Error: Denominator cannot be 0' } };

            let resNum = 0, resDen = 1;
            if (op === 'add') { resNum = (nA * dB) + (nB * dA); resDen = dA * dB; }
            else if (op === 'subtract') { resNum = (nA * dB) - (nB * dA); resDen = dA * dB; }
            else if (op === 'multiply') { resNum = nA * nB; resDen = dA * dB; }
            else if (op === 'divide') {
                if (nB === 0) return { primaryOutput: { label: 'Result', value: 'Error: Cannot divide by zero fraction' } };
                resNum = nA * dB; resDen = dA * nB;
            }

            const gcd = (x: number, y: number): number => {
                x = Math.abs(x); y = Math.abs(y);
                while (y) { const t = y; y = x % y; x = t; }
                return x;
            };

            const g = gcd(resNum, resDen);
            const simNum = resNum / g;
            const simDen = resDen / g;
            const dec = resNum / resDen;

            const whole = Math.floor(Math.abs(simNum) / simDen);
            const rem = Math.abs(simNum) % simDen;
            const mixed = whole > 0 && rem > 0 ? `${simNum < 0 ? '-' : ''}${whole} ${rem}/${simDen}` : `${simNum}/${simDen}`;

            return {
                primaryOutput: { label: 'Simplified Fraction Result', value: `${simNum} / ${simDen}`, suffix: `(${dec.toFixed(4)})` },
                secondaryMetrics: [
                    { label: 'Mixed Number Form', value: mixed },
                    { label: 'Exact Decimal Value', value: dec.toFixed(6) },
                    { label: 'Percentage Equivalent', value: `${(dec * 100).toFixed(2)}%` }
                ]
            };
        }
    },
    // 4. Percentage Calculator
    {
        id: 'percentage-calculator',
        name: 'Percentage Calculator',
        category: 'math-algebra',
        group: 'General & Arithmetic',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '1.8M',
        cpc: '$0.66',
        description: "A Percentage Calculator solves common percentage problems including percentage of a number, percentage increase/decrease, and finding percentages between values. The calculator supports educational, financial, and statistical use cases.",
        inputs: [
            { id: 'percentX', name: 'Percentage (X %)', type: 'number', defaultValue: 25, step: 0.1, suffix: '%', tooltip: 'Percentage.' },
            { id: 'totalY', name: 'Of Value (Y)', type: 'number', defaultValue: 400, step: 1, tooltip: 'Base total value.' }
        ],
        naturalLanguageQueries: ["Calculate my percentage calculator", "What is my percentage calculator?", "Help me solve percentage calculator"],
        edgeCases: ["Division by zero Negative percentages Percentages over 100%"],
        calculate: (inputs) => {
            const x = Number(inputs.percentX) || 0;
            const y = Number(inputs.totalY) || 0;

            const result = (x / 100) * y;
            const whatPercentIsYofX = x !== 0 ? ((y / x) * 100).toFixed(2) : '0';

            return {
                primaryOutput: { label: `${x}% of ${y}`, value: Number.isInteger(result) ? result : Number(result.toFixed(4)) },
                secondaryMetrics: [
                    { label: 'Remainder Value (100% - X%)', value: String(Number((y - result).toFixed(4))) },
                    { label: 'What % is Y of X?', value: `${whatPercentIsYofX}%` },
                    { label: 'Multiplier Decimal Factor', value: (x / 100).toFixed(4) }
                ]
            };
        }
    },
    // 5. Average Calculator
    {
        id: 'average-calculator',
        name: 'Average Calculator',
        category: 'math-algebra',
        group: 'General & Arithmetic',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '201K',
        cpc: '$2.66',
        description: "An Average Calculator computes mean values from a list of numbers. It helps summarize data and calculate central tendency. The calculator may also support median and mode calculations.",
        inputs: [
            { id: 'num1', name: 'Value 1', type: 'number', defaultValue: 15, step: 1, tooltip: 'Number 1.' },
            { id: 'num2', name: 'Value 2', type: 'number', defaultValue: 22, step: 1, tooltip: 'Number 2.' },
            { id: 'num3', name: 'Value 3', type: 'number', defaultValue: 38, step: 1, tooltip: 'Number 3.' },
            { id: 'num4', name: 'Value 4', type: 'number', defaultValue: 45, step: 1, tooltip: 'Number 4.' },
            { id: 'num5', name: 'Value 5', type: 'number', defaultValue: 60, step: 1, tooltip: 'Number 5.' }
        ],
        naturalLanguageQueries: ["Calculate my average calculator", "What is my average calculator?", "Help me solve average calculator"],
        edgeCases: ["Empty datasets Non-numeric values Multiple modes"],
        calculate: (inputs) => {
            const vals = [inputs.num1, inputs.num2, inputs.num3, inputs.num4, inputs.num5]
                .map(v => Number(v))
                .filter(v => !isNaN(v));

            if (vals.length === 0) return { primaryOutput: { label: 'Average', value: 0 } };

            const sum = vals.reduce((a, b) => a + b, 0);
            const avg = sum / vals.length;
            const sorted = [...vals].sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
            const min = sorted[0];
            const max = sorted[sorted.length - 1];
            const range = max - min;

            return {
                primaryOutput: { label: 'Arithmetic Mean (Average)', value: Number(avg.toFixed(4)) },
                secondaryMetrics: [
                    { label: 'Median Value', value: String(median) },
                    { label: 'Sum Total', value: String(sum) },
                    { label: 'Range (Max - Min)', value: `${min} to ${max} (Range: ${range})` },
                    { label: 'Item Count (n)', value: `${vals.length} numbers` }
                ]
            };
        }
    },
    // 6. Rounding Calculator
    {
        id: 'rounding-calculator',
        name: 'Rounding Calculator',
        category: 'math-algebra',
        group: 'General & Arithmetic',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '27K',
        cpc: '$2.04',
        description: "A Rounding Calculator rounds numbers to specified decimal places, significant figures, or nearest multiples. It helps simplify numeric outputs. The calculator supports financial, scientific, and educational rounding.",
        inputs: [
            { id: 'inputValue', name: 'Number to Round', type: 'number', defaultValue: 147.6582, step: 0.0001, tooltip: 'Input decimal number.' },
            { id: 'precision', name: 'Round Precision / Position', type: 'dropdown', defaultValue: '2', options: [{ label: 'Nearest Integer (0 decimals)', value: '0' }, { label: 'Tenths (1 decimal place)', value: '1' }, { label: 'Hundredths (2 decimal places)', value: '2' }, { label: 'Thousandths (3 decimal places)', value: '3' }, { label: 'Nearest Ten (10s)', value: '-1' }, { label: 'Nearest Hundred (100s)', value: '-2' }], tooltip: 'Precision level.' }
        ],
        naturalLanguageQueries: ["Calculate my rounding calculator", "What is my rounding calculator?", "Help me solve rounding calculator"],
        edgeCases: ["Large decimal precision Floating-point representation issues Negative precision values"],
        calculate: (inputs) => {
            const val = Number(inputs.inputValue) || 0;
            const p = Number(inputs.precision) || 0;

            const factor = Math.pow(10, p);
            const rounded = Math.round(val * factor) / factor;
            const floorVal = Math.floor(val * factor) / factor;
            const ceilVal = Math.ceil(val * factor) / factor;

            return {
                primaryOutput: { label: 'Rounded Value', value: p >= 0 ? rounded.toFixed(p) : String(rounded) },
                secondaryMetrics: [
                    { label: 'Rounded Down (Floor)', value: p >= 0 ? floorVal.toFixed(p) : String(floorVal) },
                    { label: 'Rounded Up (Ceiling)', value: p >= 0 ? ceilVal.toFixed(p) : String(ceilVal) },
                    { label: 'Absolute Rounding Error', value: Math.abs(val - rounded).toFixed(6) }
                ]
            };
        }
    },
    // 7. Big Number Calculator
    {
        id: 'big-number-calculator',
        name: 'Big Number Calculator',
        category: 'math-algebra',
        group: 'General & Arithmetic',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '15K',
        cpc: '$0.42',
        description: "A Big Number Calculator performs arithmetic operations on extremely large integers or high-precision decimal numbers beyond standard floating-point limits. The calculator is commonly used in cryptography, finance, and scientific computing.",
        inputs: [
            { id: 'baseNum', name: 'Base Number', type: 'number', defaultValue: 1250000, step: 1000, tooltip: 'First big number.' },
            { id: 'operation', name: 'Operation', type: 'dropdown', defaultValue: 'multiply', options: [{ label: 'Multiply (A × B)', value: 'multiply' }, { label: 'Add (A + B)', value: 'add' }, { label: 'Power (A ^ B)', value: 'power' }], tooltip: 'Operation.' },
            { id: 'operandB', name: 'Operand / Power', type: 'number', defaultValue: 45000, step: 100, tooltip: 'Second big number or exponent.' }
        ],
        naturalLanguageQueries: ["Calculate my big number calculator", "What is my big number calculator?", "Help me solve big number calculator"],
        edgeCases: ["Extremely large exponents Memory overflow constraints Precision truncation settings"],
        calculate: (inputs) => {
            const a = BigInt(Math.floor(Number(inputs.baseNum) || 0));
            const b = BigInt(Math.floor(Number(inputs.operandB) || 0));
            const op = String(inputs.operation || 'multiply');

            let resultStr = '0';
            if (op === 'multiply') {
                resultStr = (a * b).toString();
            } else if (op === 'add') {
                resultStr = (a + b).toString();
            } else if (op === 'power') {
                const exp = Number(inputs.operandB) || 0;
                if (exp > 1000) return { primaryOutput: { label: 'Result', value: 'Exponent too large (max 1000)' } };
                resultStr = (a ** BigInt(exp)).toString();
            }

            const numDigits = resultStr.length;
            const sci = Number(resultStr).toExponential(4);

            return {
                primaryOutput: { label: 'Big Number Exact Output', value: resultStr.length > 30 ? resultStr.slice(0, 25) + '...' : resultStr },
                secondaryMetrics: [
                    { label: 'Scientific Notation', value: sci },
                    { label: 'Total Number of Digits', value: `${numDigits} Digits` }
                ]
            };
        }
    },
    // 8. Long Division Calculator
    {
        id: 'long-division-calculator',
        name: 'Long Division Calculator',
        category: 'math-algebra',
        group: 'General & Arithmetic',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '50K',
        cpc: '$1.62',
        description: "A Long Division Calculator performs division using traditional step-by-step long division methods. It helps students learn manual arithmetic processes. The calculator supports quotient and remainder outputs.",
        inputs: [
            { id: 'dividend', name: 'Dividend (Number to Divide)', type: 'number', defaultValue: 487, step: 1, tooltip: 'Dividend (numerator).' },
            { id: 'divisor', name: 'Divisor (Divided by)', type: 'number', defaultValue: 12, min: 1, step: 1, tooltip: 'Divisor (denominator).' }
        ],
        naturalLanguageQueries: ["Calculate my long division calculator", "What is my long division calculator?", "Help me solve long division calculator"],
        edgeCases: ["Division by zero Decimal divisions Very large dividends"],
        calculate: (inputs) => {
            const d = Number(inputs.dividend) || 0;
            const v = Number(inputs.divisor) || 1;

            if (v === 0) return { primaryOutput: { label: 'Result', value: 'Error: Cannot divide by zero' } };

            const quotient = Math.floor(d / v);
            const remainder = d % v;
            const decimal = d / v;

            return {
                primaryOutput: { label: 'Quotient with Remainder', value: `${quotient} R ${remainder}` },
                secondaryMetrics: [
                    { label: 'Quotient (Integer Part)', value: String(quotient) },
                    { label: 'Remainder', value: String(remainder) },
                    { label: 'Decimal Quotient', value: decimal.toFixed(6) },
                    { label: 'Mixed Fraction Result', value: `${quotient} ${remainder}/${v}` }
                ]
            };
        }
    },
    // 9. Exponent Calculator
    {
        id: 'exponent-calculator',
        name: 'Exponent Calculator',
        category: 'math-algebra',
        group: 'General & Arithmetic',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '33K',
        cpc: '$1.24',
        description: "An Exponent Calculator raises numbers to powers and evaluates exponential expressions. It helps solve algebraic and scientific equations. The calculator supports positive, negative, and fractional exponents.",
        inputs: [
            { id: 'baseNum', name: 'Base (b)', type: 'number', defaultValue: 5, step: 0.1, tooltip: 'Base number.' },
            { id: 'exponentNum', name: 'Exponent (n)', type: 'number', defaultValue: 4, step: 0.1, tooltip: 'Power / exponent.' }
        ],
        naturalLanguageQueries: ["Calculate my exponent calculator", "What is my exponent calculator?", "Help me solve exponent calculator"],
        edgeCases: ["Negative bases with fractional exponents Overflow errors Zero to zero power ambiguity"],
        calculate: (inputs) => {
            const b = Number(inputs.baseNum) || 0;
            const n = Number(inputs.exponentNum) || 0;

            const result = Math.pow(b, n);
            const invResult = Math.pow(b, -n);

            return {
                primaryOutput: { label: `${b} ^ ${n}`, value: Number.isInteger(result) ? result : Number(result.toFixed(6)) },
                secondaryMetrics: [
                    { label: 'Negative Exponent (b ^ -n)', value: invResult.toFixed(6) },
                    { label: 'Scientific Notation', value: result.toExponential(4) }
                ]
            };
        }
    },
    // 10. Root Calculator
    {
        id: 'root-calculator',
        name: 'Root Calculator',
        category: 'math-algebra',
        group: 'General & Arithmetic',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '10K',
        cpc: '$0.56',
        description: "A Root Calculator computes square roots, cube roots, and nth roots. It helps solve algebraic equations and scientific calculations. The calculator supports irrational and fractional outputs.",
        inputs: [
            { id: 'radicand', name: 'Radicand (x)', type: 'number', defaultValue: 81, min: 0, step: 0.1, tooltip: 'Value under radical sign.' },
            { id: 'degree', name: 'Root Degree (n)', type: 'number', defaultValue: 2, min: 1, step: 1, tooltip: 'Degree of root (2 = square root, 3 = cube root).' }
        ],
        naturalLanguageQueries: ["Calculate my root calculator", "What is my root calculator?", "Help me solve root calculator"],
        edgeCases: ["Even roots of negative numbers Irrational decimals Large root degrees"],
        calculate: (inputs) => {
            const x = Number(inputs.radicand) || 0;
            const n = Math.max(1, Number(inputs.degree) || 2);

            if (x < 0 && n % 2 === 0) return { primaryOutput: { label: 'Result', value: 'Error: Even root of negative number is complex' } };

            const rootVal = Math.pow(x, 1 / n);

            return {
                primaryOutput: { label: `${n}-th Root of ${x}`, value: Number.isInteger(rootVal) ? rootVal : Number(rootVal.toFixed(6)) },
                secondaryMetrics: [
                    { label: 'Power Form Verification ((x^(1/n))^n)', value: String(Math.round(Math.pow(rootVal, n))) },
                    { label: 'Square Root Comparison (√x)', value: Math.sqrt(Math.max(0, x)).toFixed(4) }
                ]
            };
        }
    },
    // 11. Scientific Notation Calculator
    {
        id: 'scientific-notation-calculator',
        name: 'Scientific Notation Calculator',
        category: 'math-algebra',
        group: 'General & Arithmetic',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '27K',
        cpc: '$1.44',
        description: "A Scientific Notation Calculator converts numbers between standard and scientific notation formats. It helps simplify representation of very large or very small values. The calculator also supports arithmetic using scientific notation.",
        inputs: [
            { id: 'rawNumber', name: 'Standard Decimal Number', type: 'number', defaultValue: 4520000, step: 1, tooltip: 'Decimal value.' }
        ],
        naturalLanguageQueries: ["Calculate my scientific notation calculator", "What is my scientific notation calculator?", "Help me solve scientific notation calculator"],
        edgeCases: ["Zero representation Extremely large exponents Precision rounding"],
        calculate: (inputs) => {
            const val = Number(inputs.rawNumber) || 0;

            if (val === 0) return { primaryOutput: { label: 'Scientific Notation', value: '0 × 10^0' } };

            const exponent = Math.floor(Math.log10(Math.abs(val)));
            const coefficient = val / Math.pow(10, exponent);

            return {
                primaryOutput: { label: 'Scientific Notation (a × 10^b)', value: `${coefficient.toFixed(4)} × 10^${exponent}` },
                secondaryMetrics: [
                    { label: 'Coefficient (Mantissa)', value: coefficient.toFixed(4) },
                    { label: 'Exponent (Order of Magnitude)', value: String(exponent) },
                    { label: 'Engineering Notation', value: val.toExponential(3) }
                ]
            };
        }
    },
    // 12. Mixed Number Calculator
    {
        id: 'mixed-number-calculator',
        name: 'Mixed Number Calculator',
        category: 'math-algebra',
        group: 'General & Arithmetic',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '27K',
        cpc: '$1.78',
        description: "A Mixed Number Calculator performs operations involving mixed fractions and improper fractions. It converts between forms and simplifies results. The calculator supports arithmetic operations and educational formatting.",
        inputs: [
            { id: 'whole1', name: 'Fraction 1 - Whole Part', type: 'number', defaultValue: 2, step: 1, tooltip: 'Whole integer part.' },
            { id: 'num1', name: 'Fraction 1 - Numerator', type: 'number', defaultValue: 1, step: 1, tooltip: 'Numerator.' },
            { id: 'den1', name: 'Fraction 1 - Denominator', type: 'number', defaultValue: 3, min: 1, step: 1, tooltip: 'Denominator.' },
            { id: 'operation', name: 'Operation', type: 'dropdown', defaultValue: 'add', options: [{ label: 'Add (+)', value: 'add' }, { label: 'Subtract (-)', value: 'subtract' }, { label: 'Multiply (×)', value: 'multiply' }, { label: 'Divide (÷)', value: 'divide' }], tooltip: 'Operation.' },
            { id: 'whole2', name: 'Fraction 2 - Whole Part', type: 'number', defaultValue: 1, step: 1, tooltip: 'Whole integer part.' },
            { id: 'num2', name: 'Fraction 2 - Numerator', type: 'number', defaultValue: 3, step: 1, tooltip: 'Numerator.' },
            { id: 'den2', name: 'Fraction 2 - Denominator', type: 'number', defaultValue: 4, min: 1, step: 1, tooltip: 'Denominator.' }
        ],
        naturalLanguageQueries: ["Calculate my mixed number calculator", "What is my mixed number calculator?", "Help me solve mixed number calculator"],
        edgeCases: ["Negative mixed numbers Zero denominators Improper simplification"],
        calculate: (inputs) => {
            const w1 = Number(inputs.whole1) || 0;
            const n1 = Number(inputs.num1) || 0;
            const d1 = Number(inputs.den1) || 1;
            const w2 = Number(inputs.whole2) || 0;
            const n2 = Number(inputs.num2) || 0;
            const d2 = Number(inputs.den2) || 1;
            const op = String(inputs.operation || 'add');

            // Improper fractions
            const imp1 = (w1 * d1) + n1;
            const imp2 = (w2 * d2) + n2;

            let resNum = 0, resDen = 1;
            if (op === 'add') { resNum = (imp1 * d2) + (imp2 * d1); resDen = d1 * d2; }
            else if (op === 'subtract') { resNum = (imp1 * d2) - (imp2 * d1); resDen = d1 * d2; }
            else if (op === 'multiply') { resNum = imp1 * imp2; resDen = d1 * d2; }
            else if (op === 'divide') {
                if (imp2 === 0) return { primaryOutput: { label: 'Result', value: 'Error: Division by 0' } };
                resNum = imp1 * d2; resDen = d1 * imp2;
            }

            const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : Math.abs(a);
            const g = gcd(resNum, resDen);
            const sn = resNum / g;
            const sd = resDen / g;

            const wholeRes = Math.floor(Math.abs(sn) / sd);
            const remRes = Math.abs(sn) % sd;
            const mixedStr = wholeRes > 0 && remRes > 0 ? `${sn < 0 ? '-' : ''}${wholeRes} ${remRes}/${sd}` : `${sn}/${sd}`;

            return {
                primaryOutput: { label: 'Mixed Number Result', value: mixedStr },
                secondaryMetrics: [
                    { label: 'Improper Fraction', value: `${sn} / ${sd}` },
                    { label: 'Decimal Equivalent', value: (resNum / resDen).toFixed(4) }
                ]
            };
        }
    },
    // 13. Decimal to Fraction Calculator
    {
        id: 'decimal-to-fraction-calculator',
        name: 'Decimal to Fraction Calculator',
        category: 'math-algebra',
        group: 'General & Arithmetic',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '12K',
        cpc: '$0.64',
        description: "A Decimal to Fraction Calculator converts decimal numbers into fractional form. It simplifies rational decimal values into reduced fractions. The calculator supports terminating and repeating decimals.",
        inputs: [
            { id: 'decimalVal', name: 'Decimal Number', type: 'number', defaultValue: 0.625, step: 0.001, tooltip: 'Decimal value to convert.' }
        ],
        naturalLanguageQueries: ["Calculate my decimal to fraction calculator", "What is my decimal to fraction calculator?", "Help me solve decimal to fraction calculator"],
        edgeCases: ["Repeating decimal detection Very long precision decimals Negative decimal values"],
        calculate: (inputs) => {
            const d = Number(inputs.decimalVal) || 0;
            const decStr = String(d).split('.')[1] || '';
            const numDigits = decStr.length;
            const den = Math.pow(10, numDigits);
            const num = Math.round(d * den);

            const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : Math.abs(a);
            const g = gcd(num, den);

            const sn = num / g;
            const sd = den / g;

            return {
                primaryOutput: { label: 'Simplified Fraction', value: `${sn} / ${sd}` },
                secondaryMetrics: [
                    { label: 'Unsimplified Fraction', value: `${num} / ${den}` },
                    { label: 'Percentage', value: `${(d * 100).toFixed(2)}%` }
                ]
            };
        }
    },
    // 14. Fraction to Decimal Calculator
    {
        id: 'fraction-to-decimal-calculator',
        name: 'Fraction to Decimal Calculator',
        category: 'math-algebra',
        group: 'General & Arithmetic',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '8K',
        cpc: '$1.37',
        description: "A Fraction to Decimal Calculator converts fractions into decimal representations. It helps compare rational numbers numerically and supports repeating decimal detection. The calculator may also display percentage equivalents.",
        inputs: [
            { id: 'numerator', name: 'Numerator (Top)', type: 'number', defaultValue: 7, step: 1, tooltip: 'Numerator.' },
            { id: 'denominator', name: 'Denominator (Bottom)', type: 'number', defaultValue: 8, min: 1, step: 1, tooltip: 'Denominator.' }
        ],
        naturalLanguageQueries: ["Calculate my fraction to decimal calculator", "What is my fraction to decimal calculator?", "Help me solve fraction to decimal calculator"],
        edgeCases: ["Division by zero Infinite repeating decimals Negative fractions"],
        calculate: (inputs) => {
            const n = Number(inputs.numerator) || 0;
            const d = Number(inputs.denominator) || 1;

            if (d === 0) return { primaryOutput: { label: 'Result', value: 'Error: Denominator is 0' } };

            const dec = n / d;

            return {
                primaryOutput: { label: 'Decimal Value', value: Number(dec.toFixed(6)) },
                secondaryMetrics: [
                    { label: 'Percentage Equivalent', value: `${(dec * 100).toFixed(2)}%` },
                    { label: 'Reciprocal (d / n)', value: n !== 0 ? (d / n).toFixed(4) : 'Undefined' }
                ]
            };
        }
    },
    // 15. Percentage Increase Calculator
    {
        id: 'percentage-increase-calculator',
        name: 'Percentage Increase Calculator',
        category: 'math-algebra',
        group: 'General & Arithmetic',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '368K',
        cpc: '$0.32',
        description: "A Percentage Increase Calculator measures how much a value has increased relative to its original amount. It is commonly used in finance, sales, and statistics. The calculator expresses growth as a percentage.",
        inputs: [
            { id: 'initialVal', name: 'Initial Value', type: 'number', defaultValue: 80, step: 0.1, tooltip: 'Starting value.' },
            { id: 'finalVal', name: 'Final Value', type: 'number', defaultValue: 100, step: 0.1, tooltip: 'Ending value.' }
        ],
        naturalLanguageQueries: ["Calculate my percentage increase calculator", "What is my percentage increase calculator?", "Help me solve percentage increase calculator"],
        edgeCases: ["Original value equals zero Negative starting values No change scenarios"],
        calculate: (inputs) => {
            const v1 = Number(inputs.initialVal) || 0;
            const v2 = Number(inputs.finalVal) || 0;

            if (v1 === 0) return { primaryOutput: { label: 'Result', value: 'Error: Initial value cannot be 0' } };

            const diff = v2 - v1;
            const pct = (diff / v1) * 100;

            return {
                primaryOutput: { label: 'Percentage Increase', value: `${pct.toFixed(2)}%` },
                secondaryMetrics: [
                    { label: 'Absolute Increase', value: `+${diff.toFixed(2)}` },
                    { label: 'Multiplier Ratio', value: `${(v2 / v1).toFixed(4)}x` }
                ]
            };
        }
    },
    // 16. Percentage Decrease Calculator
    {
        id: 'percentage-decrease-calculator',
        name: 'Percentage Decrease Calculator',
        category: 'math-algebra',
        group: 'General & Arithmetic',
        bucket: 'Bucket B',
        tier: 2,
        phase: 1,
        monthlySearches: '50K',
        cpc: '$1.59',
        description: "A Percentage Decrease Calculator determines how much a value has decreased relative to its original amount. It helps analyze losses, discounts, and reductions. The calculator expresses decline as a percentage.",
        inputs: [
            { id: 'initialVal', name: 'Original Starting Value', type: 'number', defaultValue: 120, step: 0.1, tooltip: 'Original price or quantity.' },
            { id: 'finalVal', name: 'Decreased Final Value', type: 'number', defaultValue: 90, step: 0.1, tooltip: 'Discounted or reduced quantity.' }
        ],
        naturalLanguageQueries: ["Calculate my percentage decrease calculator", "What is my percentage decrease calculator?", "Help me solve percentage decrease calculator"],
        edgeCases: ["Original value equals zero Negative values Increase accidentally entered"],
        calculate: (inputs) => {
            const v1 = Number(inputs.initialVal) || 0;
            const v2 = Number(inputs.finalVal) || 0;

            if (v1 === 0) return { primaryOutput: { label: 'Result', value: 'Error: Initial value is 0' } };

            const drop = v1 - v2;
            const pctDrop = (drop / v1) * 100;

            return {
                primaryOutput: { label: 'Percentage Decrease', value: `${pctDrop.toFixed(2)}%` },
                secondaryMetrics: [
                    { label: 'Absolute Decrease Amount', value: `-${drop.toFixed(2)}` },
                    { label: 'Remaining Percentage of Original', value: `${((v2 / v1) * 100).toFixed(2)}%` }
                ]
            };
        }
    },
    // 17. Percentage Difference Calculator
    {
        id: 'percentage-difference-calculator',
        name: 'Percentage Difference Calculator',
        category: 'math-algebra',
        group: 'General & Arithmetic',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '368K',
        cpc: '$0.32',
        description: "A Percentage Difference Calculator compares two values and expresses their relative difference. It is commonly used in statistics and scientific measurements. Unlike percentage change, it treats both numbers symmetrically.",
        inputs: [
            { id: 'val1', name: 'First Value (V1)', type: 'number', defaultValue: 100, step: 0.1, tooltip: 'Value 1.' },
            { id: 'val2', name: 'Second Value (V2)', type: 'number', defaultValue: 120, step: 0.1, tooltip: 'Value 2.' }
        ],
        naturalLanguageQueries: ["Calculate my percentage difference calculator", "What is my percentage difference calculator?", "Help me solve percentage difference calculator"],
        edgeCases: ["Both values equal zero Negative comparison values Tiny denominator precision issues"],
        calculate: (inputs) => {
            const v1 = Number(inputs.val1) || 0;
            const v2 = Number(inputs.val2) || 0;

            const avg = (v1 + v2) / 2;
            if (avg === 0) return { primaryOutput: { label: 'Result', value: '0%' } };

            const diff = Math.abs(v1 - v2);
            const pctDiff = (diff / avg) * 100;

            return {
                primaryOutput: { label: 'Percentage Difference', value: `${pctDiff.toFixed(2)}%` },
                secondaryMetrics: [
                    { label: 'Absolute Difference (|V1 - V2|)', value: String(diff.toFixed(2)) },
                    { label: 'Average of Values ((V1 + V2) / 2)', value: String(avg.toFixed(2)) }
                ]
            };
        }
    },
    // 18. Percentage Change Calculator
    {
        id: 'percentage-change-calculator',
        name: 'Percentage Change Calculator',
        category: 'math-algebra',
        group: 'General & Arithmetic',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '165K',
        cpc: '$2.66',
        description: "A Percentage Change Calculator measures relative increase or decrease between two values. It is widely used in economics, finance, and analytics. The calculator distinguishes positive and negative change.",
        inputs: [
            { id: 'initialVal', name: 'Initial Old Value', type: 'number', defaultValue: 50, step: 0.1, tooltip: 'Old value.' },
            { id: 'finalVal', name: 'Final New Value', type: 'number', defaultValue: 75, step: 0.1, tooltip: 'New value.' }
        ],
        naturalLanguageQueries: ["Calculate my percentage change calculator", "What is my percentage change calculator?", "Help me solve percentage change calculator"],
        edgeCases: ["Zero old values Negative baseline values No change situations"],
        calculate: (inputs) => {
            const v1 = Number(inputs.initialVal) || 0;
            const v2 = Number(inputs.finalVal) || 0;

            if (v1 === 0) return { primaryOutput: { label: 'Result', value: 'Error: Initial value is 0' } };

            const delta = v2 - v1;
            const pctChange = (delta / Math.abs(v1)) * 100;

            return {
                primaryOutput: { label: 'Percentage Change', value: `${pctChange >= 0 ? '+' : ''}${pctChange.toFixed(2)}%` },
                secondaryMetrics: [
                    { label: 'Absolute Numeric Change', value: `${delta >= 0 ? '+' : ''}${delta.toFixed(2)}` },
                    { label: 'Direction of Change', value: pctChange >= 0 ? 'Increase / Gain' : 'Decrease / Loss' }
                ]
            };
        }
    },
    // 19. Percent Error Calculator
    {
        id: 'percent-error-calculator',
        name: 'Percent Error Calculator',
        category: 'math-algebra',
        group: 'General & Arithmetic',
        bucket: 'Bucket B',
        tier: 5,
        phase: 4,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "A Percent Error Calculator measures deviation between experimental and true values. It helps quantify measurement accuracy. The calculator is commonly used in science and laboratory work.",
        inputs: [
            { id: 'experimentalVal', name: 'Experimental / Measured Value', type: 'number', defaultValue: 9.6, step: 0.01, tooltip: 'Observed value in lab.' },
            { id: 'theoreticalVal', name: 'Theoretical / Accepted True Value', type: 'number', defaultValue: 9.81, step: 0.01, tooltip: 'Standard true value.' }
        ],
        naturalLanguageQueries: ["Calculate my percent error calculator", "What is my percent error calculator?", "Help me solve percent error calculator"],
        edgeCases: ["True value equals zero Negative measurements Tiny denominator instability"],
        calculate: (inputs) => {
            const exp = Number(inputs.experimentalVal) || 0;
            const theo = Number(inputs.theoreticalVal) || 0;

            if (theo === 0) return { primaryOutput: { label: 'Result', value: 'Error: Theoretical value cannot be 0' } };

            const absError = Math.abs(exp - theo);
            const pctError = (absError / Math.abs(theo)) * 100;

            return {
                primaryOutput: { label: 'Percentage Error', value: `${pctError.toFixed(2)}%` },
                secondaryMetrics: [
                    { label: 'Absolute Error (|Exp - True|)', value: absError.toFixed(4) },
                    { label: 'Relative Error', value: (absError / Math.abs(theo)).toFixed(6) },
                    { label: 'Experimental Accuracy', value: `${(100 - pctError).toFixed(2)}%` }
                ]
            };
        }
    },
    // 20. Absolute Value Calculator
    {
        id: 'absolute-value-calculator',
        name: 'Absolute Value Calculator',
        category: 'math-algebra',
        group: 'General & Arithmetic',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '7K',
        cpc: '$0.34',
        description: "An Absolute Value Calculator computes the magnitude of a number regardless of sign. It also solves equations and inequalities involving absolute values. The calculator is commonly used in algebra and geometry.",
        inputs: [
            { id: 'realNumber', name: 'Real Number (x)', type: 'number', defaultValue: -42.5, step: 0.1, tooltip: 'Any real number.' }
        ],
        naturalLanguageQueries: ["Calculate my absolute value calculator", "What is my absolute value calculator?", "Help me solve absolute value calculator"],
        edgeCases: ["Complex-number inputs Undefined expressions Multiple solution branches"],
        calculate: (inputs) => {
            const x = Number(inputs.realNumber) || 0;
            const absVal = Math.abs(x);

            return {
                primaryOutput: { label: '|x| Absolute Value', value: absVal },
                secondaryMetrics: [
                    { label: 'Distance from Zero on Number Line', value: `${absVal} units` },
                    { label: 'Opposite Sign Value (-x)', value: String(-x) },
                    { label: 'Squared Value (x²)', value: String((x * x).toFixed(2)) }
                ]
            };
        }
    },
    // 21. Quadratic Formula Calculator
    {
        id: 'quadratic-formula-calculator',
        name: 'Quadratic Formula Calculator',
        category: 'math-algebra',
        group: 'Algebra & Functions',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '60K',
        cpc: '$1.29',
        description: "A Quadratic Formula Calculator solves quadratic equations of the form ax\u00b2 + bx + c = 0. It calculates real or complex roots and helps students, engineers, and scientists solve polynomial equations. The calculator may also provide vertex, discriminant, and graph-related information.",
        inputs: [
            { id: 'coeffA', name: 'Coefficient a (x²)', type: 'number', defaultValue: 1, step: 0.1, tooltip: 'Quadratic coefficient.' },
            { id: 'coeffB', name: 'Coefficient b (x)', type: 'number', defaultValue: -5, step: 0.1, tooltip: 'Linear coefficient.' },
            { id: 'coeffC', name: 'Constant c', type: 'number', defaultValue: 6, step: 0.1, tooltip: 'Constant term.' }
        ],
        naturalLanguageQueries: ["Calculate my quadratic formula calculator", "What is my quadratic formula calculator?", "Help me solve quadratic formula calculator"],
        edgeCases: ["a = 0 reducing to linear equation Complex number outputs Floating-point precision errors Extremely large coefficients"],
        calculate: (inputs) => {
            const a = Number(inputs.coeffA) || 1;
            const b = Number(inputs.coeffB) || 0;
            const c = Number(inputs.coeffC) || 0;

            if (a === 0) return { primaryOutput: { label: 'Result', value: 'Error: a cannot be 0 in quadratic equation' } };

            const disc = (b * b) - (4 * a * c);
            const vertexX = -b / (2 * a);
            const vertexY = (a * vertexX * vertexX) + (b * vertexX) + c;

            if (disc > 0) {
                const x1 = (-b + Math.sqrt(disc)) / (2 * a);
                const x2 = (-b - Math.sqrt(disc)) / (2 * a);
                return {
                    primaryOutput: { label: 'Real Roots (x1, x2)', value: `x1 = ${Number(x1.toFixed(4))}, x2 = ${Number(x2.toFixed(4))}` },
                    secondaryMetrics: [
                        { label: 'Discriminant (Δ = b² - 4ac)', value: `${disc} (Two distinct real roots)` },
                        { label: 'Parabola Vertex (h, k)', value: `(${vertexX.toFixed(2)}, ${vertexY.toFixed(2)})` },
                        { label: 'Axis of Symmetry', value: `x = ${vertexX.toFixed(2)}` }
                    ]
                };
            } else if (disc === 0) {
                const x = -b / (2 * a);
                return {
                    primaryOutput: { label: 'Single Repeated Root', value: `x = ${Number(x.toFixed(4))}` },
                    secondaryMetrics: [
                        { label: 'Discriminant (Δ)', value: '0 (One real repeated root)' },
                        { label: 'Parabola Vertex', value: `(${vertexX.toFixed(2)}, ${vertexY.toFixed(2)})` }
                    ]
                };
            } else {
                const realPart = (-b / (2 * a)).toFixed(4);
                const imagPart = (Math.sqrt(-disc) / (2 * a)).toFixed(4);
                return {
                    primaryOutput: { label: 'Complex Roots', value: `${realPart} ± ${imagPart}i` },
                    secondaryMetrics: [
                        { label: 'Discriminant (Δ)', value: `${disc} (No real roots, complex conjugate pair)` },
                        { label: 'Parabola Vertex', value: `(${vertexX.toFixed(2)}, ${vertexY.toFixed(2)})` }
                    ]
                };
            }
        }
    },
    // 22. Slope Calculator
    {
        id: 'slope-calculator',
        name: 'Slope Calculator',
        category: 'math-algebra',
        group: 'Algebra & Functions',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '50K',
        cpc: '$2.52',
        description: "A Slope Calculator computes the slope of a line between two points. It helps analyze rate of change and line direction in coordinate geometry. The calculator may also provide line equations and graph visualizations.",
        inputs: [
            { id: 'x1', name: 'Point 1: x₁', type: 'number', defaultValue: 1, step: 0.1, tooltip: 'x-coordinate 1.' },
            { id: 'y1', name: 'Point 1: y₁', type: 'number', defaultValue: 2, step: 0.1, tooltip: 'y-coordinate 1.' },
            { id: 'x2', name: 'Point 2: x₂', type: 'number', defaultValue: 4, step: 0.1, tooltip: 'x-coordinate 2.' },
            { id: 'y2', name: 'Point 2: y₂', type: 'number', defaultValue: 8, step: 0.1, tooltip: 'y-coordinate 2.' }
        ],
        naturalLanguageQueries: ["Calculate my slope calculator", "What is my slope calculator?", "Help me solve slope calculator"],
        edgeCases: ["Vertical lines where x\u2082 = x\u2081 Identical points Fractional coordinates"],
        calculate: (inputs) => {
            const x1 = Number(inputs.x1) || 0;
            const y1 = Number(inputs.y1) || 0;
            const x2 = Number(inputs.x2) || 0;
            const y2 = Number(inputs.y2) || 0;

            const dx = x2 - x1;
            const dy = y2 - y1;

            if (dx === 0) {
                return {
                    primaryOutput: { label: 'Slope (m)', value: 'Undefined (Vertical Line)' },
                    secondaryMetrics: [
                        { label: 'Line Equation', value: `x = ${x1}` },
                        { label: 'Angle of Inclination', value: '90°' },
                        { label: 'Distance Between Points', value: `${Math.abs(dy).toFixed(4)} units` }
                    ]
                };
            }

            const m = dy / dx;
            const b = y1 - (m * x1);
            const angleRad = Math.atan(m);
            const angleDeg = (angleRad * 180) / Math.PI;
            const dist = Math.sqrt((dx * dx) + (dy * dy));

            return {
                primaryOutput: { label: 'Slope (m = Δy / Δx)', value: Number(m.toFixed(4)) },
                secondaryMetrics: [
                    { label: 'Slope-Intercept Equation', value: `y = ${m.toFixed(2)}x ${b >= 0 ? '+ ' + b.toFixed(2) : '- ' + Math.abs(b).toFixed(2)}` },
                    { label: 'Angle of Inclination', value: `${angleDeg.toFixed(2)}°` },
                    { label: 'Euclidean Distance (d)', value: `${dist.toFixed(4)} units` }
                ]
            };
        }
    },
    // 23. Log Calculator
    {
        id: 'log-calculator',
        name: 'Log Calculator',
        category: 'math-algebra',
        group: 'Algebra & Functions',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '40K',
        cpc: '$0.42',
        description: "A Log Calculator computes logarithms for different bases including natural logarithms and base-10 logs. It helps solve exponential equations and scientific computations. The calculator supports logarithmic identities and change-of-base calculations.",
        inputs: [
            { id: 'logBase', name: 'Logarithm Base (b)', type: 'number', defaultValue: 10, min: 0.001, step: 0.1, tooltip: 'Base (must be > 0 and != 1).' },
            { id: 'argumentX', name: 'Argument (x)', type: 'number', defaultValue: 1000, min: 0.0001, step: 0.1, tooltip: 'Argument x (must be > 0).' }
        ],
        naturalLanguageQueries: ["Calculate my log calculator", "What is my log calculator?", "Help me solve log calculator"],
        edgeCases: ["Negative inputs Base equal to 1 Zero input values Floating-point precision issues"],
        calculate: (inputs) => {
            const b = Number(inputs.logBase) || 10;
            const x = Number(inputs.argumentX) || 1000;

            if (b <= 0 || b === 1 || x <= 0) {
                return { primaryOutput: { label: 'Result', value: 'Error: Base > 0, != 1 and Argument > 0 required' } };
            }

            const logBx = Math.log(x) / Math.log(b);
            const lnX = Math.log(x);
            const log10X = Math.log10(x);
            const log2X = Math.log2(x);

            return {
                primaryOutput: { label: `log_${b}(${x})`, value: Number(logBx.toFixed(6)) },
                secondaryMetrics: [
                    { label: 'Natural Log ln(x)', value: lnX.toFixed(6) },
                    { label: 'Common Log log10(x)', value: log10X.toFixed(6) },
                    { label: 'Binary Log log2(x)', value: log2X.toFixed(6) }
                ]
            };
        }
    },
    // 24. Matrix Calculator (2x2 Matrix)
    {
        id: 'matrix-calculator',
        name: 'Matrix Calculator',
        category: 'math-algebra',
        group: 'Algebra & Functions',
        bucket: 'Bucket B',
        tier: 2,
        phase: 3,
        monthlySearches: '90K',
        cpc: '$1.13',
        description: "A Matrix Calculator performs operations on matrices including addition, multiplication, inversion, determinants, and row reduction. It is used in linear algebra, engineering, and data science. The calculator supports matrices of varying dimensions.",
        inputs: [
            { id: 'm11', name: 'Row 1, Col 1 (a)', type: 'number', defaultValue: 4, step: 1, tooltip: 'a' },
            { id: 'm12', name: 'Row 1, Col 2 (b)', type: 'number', defaultValue: 7, step: 1, tooltip: 'b' },
            { id: 'm21', name: 'Row 2, Col 1 (c)', type: 'number', defaultValue: 2, step: 1, tooltip: 'c' },
            { id: 'm22', name: 'Row 2, Col 2 (d)', type: 'number', defaultValue: 6, step: 1, tooltip: 'd' }
        ],
        naturalLanguageQueries: ["Calculate my matrix calculator", "What is my matrix calculator?", "Help me solve matrix calculator"],
        edgeCases: ["Non-square matrices for determinants/inverses Singular matrices Dimension mismatch errors Floating-point precision issues"],
        calculate: (inputs) => {
            const a = Number(inputs.m11) || 0;
            const b = Number(inputs.m12) || 0;
            const c = Number(inputs.m21) || 0;
            const d = Number(inputs.m22) || 0;

            const det = (a * d) - (b * c);
            const trace = a + d;

            let invStr = 'Matrix is Singular (det = 0, no inverse)';
            if (det !== 0) {
                invStr = `[[${(d / det).toFixed(3)}, ${((-b) / det).toFixed(3)}], [${((-c) / det).toFixed(3)}, ${((a) / det).toFixed(3)}]]`;
            }

            return {
                primaryOutput: { label: 'Determinant det(A)', value: det },
                secondaryMetrics: [
                    { label: 'Matrix Trace tr(A)', value: String(trace) },
                    { label: 'Inverse Matrix A⁻¹', value: invStr },
                    { label: 'Transpose Matrix Aᵀ', value: `[[${a}, ${c}], [${b}, ${d}]]` }
                ]
            };
        }
    },
    // 25. Factor Calculator
    {
        id: 'factor-calculator',
        name: 'Factor Calculator',
        category: 'math-algebra',
        group: 'Algebra & Functions',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '40K',
        cpc: '$0.09',
        description: "A Factor Calculator finds all factors or divisors of a given integer. It helps analyze divisibility and number properties. The calculator supports positive and negative integers.",
        inputs: [
            { id: 'targetInteger', name: 'Positive Integer (N)', type: 'number', defaultValue: 72, min: 1, max: 1000000, step: 1, tooltip: 'Integer to find factors for.' }
        ],
        naturalLanguageQueries: ["Calculate my factor calculator", "What is my factor calculator?", "Help me solve factor calculator"],
        edgeCases: ["Zero having infinite divisors Negative numbers Prime numbers with limited factors"],
        calculate: (inputs) => {
            const n = Math.abs(Math.floor(Number(inputs.targetInteger) || 1));

            const factors: number[] = [];
            for (let i = 1; i <= Math.sqrt(n); i++) {
                if (n % i === 0) {
                    factors.push(i);
                    if (i !== n / i) factors.push(n / i);
                }
            }
            factors.sort((a, b) => a - b);

            const sum = factors.reduce((a, b) => a + b, 0);
            const isPrime = factors.length === 2;

            return {
                primaryOutput: { label: 'All Factors of N', value: factors.join(', ') },
                secondaryMetrics: [
                    { label: 'Total Number of Factors', value: `${factors.length} factors` },
                    { label: 'Sum of Factors', value: String(sum) },
                    { label: 'Prime Check', value: isPrime ? 'Yes, N is a Prime Number' : 'No, N is a Composite Number' }
                ]
            };
        }
    },
    // 26. Prime Factorization Calculator
    {
        id: 'prime-factorization-calculator',
        name: 'Prime Factorization Calculator',
        category: 'math-algebra',
        group: 'Algebra & Functions',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '8K',
        cpc: '$9.90  ★ HIGH CPC',
        description: "A Prime Factorization Calculator decomposes integers into prime-number components. It helps simplify fractions, compute GCF/LCM, and analyze number structure. The calculator commonly uses trial division or optimized factoring algorithms.",
        inputs: [
            { id: 'targetNum', name: 'Positive Integer', type: 'number', defaultValue: 360, min: 2, max: 10000000, step: 1, tooltip: 'Integer to factorize.' }
        ],
        naturalLanguageQueries: ["Calculate my prime factorization calculator", "What is my prime factorization calculator?", "Help me solve prime factorization calculator"],
        edgeCases: ["Zero division errors", "Negative inputs where not defined", "Boundary values"],
        calculate: (inputs) => {
            let n = Math.abs(Math.floor(Number(inputs.targetNum) || 2));
            if (n < 2) return { primaryOutput: { label: 'Result', value: 'Enter an integer >= 2' } };

            const primeCounts: Record<number, number> = {};
            let d = 2;
            while (d * d <= n) {
                while (n % d === 0) {
                    primeCounts[d] = (primeCounts[d] || 0) + 1;
                    n = Math.floor(n / d);
                }
                d++;
            }
            if (n > 1) {
                primeCounts[n] = (primeCounts[n] || 0) + 1;
            }

            const factorsWithExp = Object.entries(primeCounts).map(([p, count]) => count > 1 ? `${p}^${count}` : `${p}`);
            const expandedList: number[] = [];
            Object.entries(primeCounts).forEach(([p, count]) => {
                for (let i = 0; i < count; i++) expandedList.push(Number(p));
            });

            return {
                primaryOutput: { label: 'Canonical Prime Factorization', value: factorsWithExp.join(' × ') },
                secondaryMetrics: [
                    { label: 'Expanded Prime Factors', value: expandedList.join(' × ') },
                    { label: 'Distinct Prime Factors', value: Object.keys(primeCounts).join(', ') }
                ]
            };
        }
    },
    // 27. Greatest Common Factor Calculator (GCF / GCD)
    {
        id: 'greatest-common-factor-calculator',
        name: 'Greatest Common Factor Calculator',
        category: 'math-algebra',
        group: 'Algebra & Functions',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '27K',
        cpc: '$3.59',
        description: "A Greatest Common Factor Calculator determines the largest integer dividing two or more numbers evenly. It helps simplify fractions and algebraic expressions. The calculator may also support polynomial GCF.",
        inputs: [
            { id: 'num1', name: 'First Number (a)', type: 'number', defaultValue: 48, min: 1, step: 1, tooltip: 'First integer.' },
            { id: 'num2', name: 'Second Number (b)', type: 'number', defaultValue: 72, min: 1, step: 1, tooltip: 'Second integer.' },
            { id: 'num3', name: 'Third Number (Optional c)', type: 'number', defaultValue: 120, step: 1, tooltip: 'Optional 3rd integer.' }
        ],
        naturalLanguageQueries: ["Calculate my greatest common factor calculator", "What is my greatest common factor calculator?", "Help me solve greatest common factor calculator"],
        edgeCases: ["Zero inputs Negative integers Multiple-number recursion handling"],
        calculate: (inputs) => {
            const a = Math.abs(Math.floor(Number(inputs.num1) || 1));
            const b = Math.abs(Math.floor(Number(inputs.num2) || 1));
            const c = Number(inputs.num3) ? Math.abs(Math.floor(Number(inputs.num3))) : 0;

            const gcd2 = (x: number, y: number): number => y ? gcd2(y, x % y) : x;
            let gcf = gcd2(a, b);
            if (c > 0) gcf = gcd2(gcf, c);

            return {
                primaryOutput: { label: 'Greatest Common Factor (GCF / GCD)', value: gcf },
                secondaryMetrics: [
                    { label: 'Least Common Multiple (LCM) of a & b', value: String((a * b) / gcd2(a, b)) },
                    { label: 'Simplified Ratio a : b', value: `${a / gcd2(a, b)} : ${b / gcd2(a, b)}` }
                ]
            };
        }
    },
    // 28. Least Common Multiple Calculator (LCM)
    {
        id: 'least-common-multiple-calculator',
        name: 'Least Common Multiple Calculator',
        category: 'math-algebra',
        group: 'Algebra & Functions',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '40K',
        cpc: '$1.78',
        description: "A Least Common Multiple Calculator finds the smallest positive number divisible by multiple integers. It helps solve fraction arithmetic and scheduling problems. The calculator commonly uses GCD relationships.",
        inputs: [
            { id: 'num1', name: 'Number 1 (a)', type: 'number', defaultValue: 12, min: 1, step: 1, tooltip: 'First integer.' },
            { id: 'num2', name: 'Number 2 (b)', type: 'number', defaultValue: 18, min: 1, step: 1, tooltip: 'Second integer.' },
            { id: 'num3', name: 'Number 3 (Optional c)', type: 'number', defaultValue: 24, step: 1, tooltip: 'Optional 3rd integer.' }
        ],
        naturalLanguageQueries: ["Calculate my least common multiple calculator", "What is my least common multiple calculator?", "Help me solve least common multiple calculator"],
        edgeCases: ["Zero inputs Negative numbers Very large integer overflow"],
        calculate: (inputs) => {
            const a = Math.abs(Math.floor(Number(inputs.num1) || 1));
            const b = Math.abs(Math.floor(Number(inputs.num2) || 1));
            const c = Number(inputs.num3) ? Math.abs(Math.floor(Number(inputs.num3))) : 0;

            const gcd2 = (x: number, y: number): number => y ? gcd2(y, x % y) : x;
            const lcm2 = (x: number, y: number): number => (x * y) / gcd2(x, y);

            let lcm = lcm2(a, b);
            if (c > 0) lcm = lcm2(lcm, c);

            return {
                primaryOutput: { label: 'Least Common Multiple (LCM)', value: lcm },
                secondaryMetrics: [
                    { label: 'Greatest Common Factor (GCF)', value: String(c > 0 ? gcd2(gcd2(a, b), c) : gcd2(a, b)) },
                    { label: 'Product (a × b)', value: String(a * b) }
                ]
            };
        }
    },
    // 29. Common Factor Calculator
    {
        id: 'common-factor-calculator',
        name: 'Common Factor Calculator',
        category: 'math-algebra',
        group: 'Algebra & Functions',
        bucket: 'Bucket B',
        tier: 4,
        phase: 4,
        monthlySearches: '1K',
        cpc: '$0.55',
        description: "A Common Factor Calculator identifies all shared divisors between two or more integers. It helps compare divisibility relationships. The calculator complements GCF calculations.",
        inputs: [
            { id: 'num1', name: 'First Integer', type: 'number', defaultValue: 36, min: 1, step: 1, tooltip: 'First number.' },
            { id: 'num2', name: 'Second Integer', type: 'number', defaultValue: 60, min: 1, step: 1, tooltip: 'Second number.' }
        ],
        naturalLanguageQueries: ["Calculate my common factor calculator", "What is my common factor calculator?", "Help me solve common factor calculator"],
        edgeCases: ["Prime numbers with only 1 in common Zero handling Negative integers"],
        calculate: (inputs) => {
            const a = Math.abs(Math.floor(Number(inputs.num1) || 1));
            const b = Math.abs(Math.floor(Number(inputs.num2) || 1));

            const common: number[] = [];
            const minVal = Math.min(a, b);
            for (let i = 1; i <= minVal; i++) {
                if (a % i === 0 && b % i === 0) common.push(i);
            }

            const gcf = common[common.length - 1];

            return {
                primaryOutput: { label: 'Shared Common Factors', value: common.join(', ') },
                secondaryMetrics: [
                    { label: 'Greatest Common Factor (GCF)', value: String(gcf) },
                    { label: 'Total Common Factors Count', value: `${common.length} common factors` }
                ]
            };
        }
    },
    // 30. Number Sequence Calculator
    {
        id: 'number-sequence-calculator',
        name: 'Number Sequence Calculator',
        category: 'math-algebra',
        group: 'Algebra & Functions',
        bucket: 'Bucket B',
        tier: 5,
        phase: 4,
        monthlySearches: '720',
        cpc: '$0.06',
        description: "A Number Sequence Calculator analyzes and predicts mathematical sequences including arithmetic, geometric, Fibonacci, and recursive patterns. It helps identify sequence rules and generate terms. The calculator supports nth-term and summation calculations.",
        inputs: [
            { id: 'seqType', name: 'Sequence Type', type: 'dropdown', defaultValue: 'arithmetic', options: [{ label: 'Arithmetic Progression (aₙ = a₁ + (n-1)d)', value: 'arithmetic' }, { label: 'Geometric Progression (aₙ = a₁ · rⁿ⁻¹)', value: 'geometric' }], tooltip: 'Sequence formula.' },
            { id: 'firstTerm', name: 'First Term (a₁)', type: 'number', defaultValue: 3, step: 0.1, tooltip: 'Initial term.' },
            { id: 'diffOrRatio', name: 'Common Difference (d) or Ratio (r)', type: 'number', defaultValue: 4, step: 0.1, tooltip: 'Step or multiplier.' },
            { id: 'termNumber', name: 'Target Term Index (n)', type: 'number', defaultValue: 10, min: 1, max: 1000, step: 1, tooltip: 'n-th term.' }
        ],
        naturalLanguageQueries: ["Calculate my number sequence calculator", "What is my number sequence calculator?", "Help me solve number sequence calculator"],
        edgeCases: ["Ambiguous patterns Nonlinear sequences Insufficient input terms"],
        calculate: (inputs) => {
            const t = String(inputs.seqType || 'arithmetic');
            const a1 = Number(inputs.firstTerm) || 0;
            const dOrR = Number(inputs.diffOrRatio) || 1;
            const n = Math.max(1, Math.floor(Number(inputs.termNumber) || 10));

            if (t === 'arithmetic') {
                const an = a1 + (n - 1) * dOrR;
                const sn = (n / 2) * (2 * a1 + (n - 1) * dOrR);
                const terms = Array.from({ length: Math.min(6, n) }, (_, i) => a1 + i * dOrR).join(', ');

                return {
                    primaryOutput: { label: `n-th Term a_${n}`, value: Number(an.toFixed(4)) },
                    secondaryMetrics: [
                        { label: `Sum of First ${n} Terms (S_${n})`, value: String(Number(sn.toFixed(4))) },
                        { label: 'First Few Terms', value: `${terms}${n > 6 ? ', ...' : ''}` },
                        { label: 'Formula', value: `a_n = ${a1} + (n-1)·${dOrR}` }
                    ]
                };
            } else {
                const an = a1 * Math.pow(dOrR, n - 1);
                let sn = 0;
                if (dOrR === 1) sn = a1 * n;
                else sn = a1 * (1 - Math.pow(dOrR, n)) / (1 - dOrR);
                const terms = Array.from({ length: Math.min(6, n) }, (_, i) => Number((a1 * Math.pow(dOrR, i)).toFixed(2))).join(', ');

                return {
                    primaryOutput: { label: `n-th Term a_${n}`, value: Number(an.toFixed(4)) },
                    secondaryMetrics: [
                        { label: `Sum of First ${n} Terms (S_${n})`, value: String(Number(sn.toFixed(4))) },
                        { label: 'First Few Terms', value: `${terms}${n > 6 ? ', ...' : ''}` }
                    ]
                };
            }
        }
    },
    // 31. Linear Equation Calculator (ax + b = c)
    {
        id: 'linear-equation-calculator',
        name: 'Linear Equation Calculator',
        category: 'math-algebra',
        group: 'Algebra & Functions',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '7K',
        cpc: '$1.57',
        description: "A Linear Equation Calculator solves equations involving one variable. It helps isolate unknown values and simplify algebraic expressions. The calculator supports fractions, decimals, and symbolic forms.",
        inputs: [
            { id: 'coeffA', name: 'Coefficient a', type: 'number', defaultValue: 3, step: 0.1, tooltip: 'Coefficient of x.' },
            { id: 'constantB', name: 'Constant b', type: 'number', defaultValue: 7, step: 0.1, tooltip: 'Constant added to ax.' },
            { id: 'rightSideC', name: 'Right Side c', type: 'number', defaultValue: 22, step: 0.1, tooltip: 'Equal to c.' }
        ],
        naturalLanguageQueries: ["Calculate my linear equation calculator", "What is my linear equation calculator?", "Help me solve linear equation calculator"],
        edgeCases: ["Infinite solutions No-solution contradictions Division by zero coefficients"],
        calculate: (inputs) => {
            const a = Number(inputs.coeffA) || 1;
            const b = Number(inputs.constantB) || 0;
            const c = Number(inputs.rightSideC) || 0;

            if (a === 0) {
                return { primaryOutput: { label: 'Result', value: b === c ? 'Infinite Solutions (Identity)' : 'No Solution (Contradiction)' } };
            }

            const x = (c - b) / a;

            return {
                primaryOutput: { label: 'Solution for x', value: Number.isInteger(x) ? x : Number(x.toFixed(4)) },
                secondaryMetrics: [
                    { label: 'Step 1 (Subtract b)', value: `${a}x = ${c - b}` },
                    { label: 'Step 2 (Divide by a)', value: `x = ${c - b} / ${a} = ${Number(x.toFixed(4))}` },
                    { label: 'Verification', value: `${a}(${Number(x.toFixed(4))}) + ${b} = ${Number((a * x + b).toFixed(4))}` }
                ]
            };
        }
    },
    // 32. System of Equations Calculator (2x2 Linear System)
    {
        id: 'system-of-equations-calculator',
        name: 'System of Equations Calculator',
        category: 'math-algebra',
        group: 'Algebra & Functions',
        bucket: 'Bucket B',
        tier: 2,
        phase: 3,
        monthlySearches: '40K',
        cpc: '$2.10',
        description: "A System of Equations Calculator solves multiple simultaneous equations involving multiple variables. It helps solve algebraic, engineering, and optimization problems. The calculator supports linear and nonlinear systems.",
        inputs: [
            { id: 'a1', name: 'Eq 1: a₁x', type: 'number', defaultValue: 2, step: 0.1, tooltip: 'a1' },
            { id: 'b1', name: 'Eq 1: b₁y', type: 'number', defaultValue: 3, step: 0.1, tooltip: 'b1' },
            { id: 'c1', name: 'Eq 1: = c₁', type: 'number', defaultValue: 13, step: 0.1, tooltip: 'c1' },
            { id: 'a2', name: 'Eq 2: a₂x', type: 'number', defaultValue: 4, step: 0.1, tooltip: 'a2' },
            { id: 'b2', name: 'Eq 2: b₂y', type: 'number', defaultValue: -1, step: 0.1, tooltip: 'b2' },
            { id: 'c2', name: 'Eq 2: = c₂', type: 'number', defaultValue: 5, step: 0.1, tooltip: 'c2' }
        ],
        naturalLanguageQueries: ["Calculate my system of equations calculator", "What is my system of equations calculator?", "Help me solve system of equations calculator"],
        edgeCases: ["Dependent systems Inconsistent systems Singular matrices"],
        calculate: (inputs) => {
            const a1 = Number(inputs.a1) || 0;
            const b1 = Number(inputs.b1) || 0;
            const c1 = Number(inputs.c1) || 0;
            const a2 = Number(inputs.a2) || 0;
            const b2 = Number(inputs.b2) || 0;
            const c2 = Number(inputs.c2) || 0;

            const D = (a1 * b2) - (a2 * b1);
            const Dx = (c1 * b2) - (c2 * b1);
            const Dy = (a1 * c2) - (a2 * c1);

            if (D === 0) {
                return {
                    primaryOutput: { label: 'Solution', value: Dx === 0 && Dy === 0 ? 'Infinite Solutions (Coincident Lines)' : 'No Solution (Parallel Lines)' }
                };
            }

            const x = Dx / D;
            const y = Dy / D;

            return {
                primaryOutput: { label: 'Intersection Point (x, y)', value: `(${Number(x.toFixed(4))}, ${Number(y.toFixed(4))})` },
                secondaryMetrics: [
                    { label: 'Variable x Value', value: String(Number(x.toFixed(4))) },
                    { label: 'Variable y Value', value: String(Number(y.toFixed(4))) },
                    { label: 'Determinant (D)', value: String(D) }
                ]
            };
        }
    },
    // 33. Polynomial Calculator
    {
        id: 'polynomial-calculator',
        name: 'Polynomial Calculator',
        category: 'math-algebra',
        group: 'Algebra & Functions',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '10K',
        cpc: '$1.48',
        description: "A Polynomial Calculator performs operations on polynomial expressions including addition, multiplication, factoring, differentiation, and evaluation. The calculator supports symbolic algebraic simplification.",
        inputs: [
            { id: 'c3', name: 'x³ Coefficient (a)', type: 'number', defaultValue: 2, step: 0.1, tooltip: 'Cubic term.' },
            { id: 'c2', name: 'x² Coefficient (b)', type: 'number', defaultValue: -3, step: 0.1, tooltip: 'Quadratic term.' },
            { id: 'c1', name: 'x Coefficient (c)', type: 'number', defaultValue: 4, step: 0.1, tooltip: 'Linear term.' },
            { id: 'c0', name: 'Constant (d)', type: 'number', defaultValue: -5, step: 0.1, tooltip: 'Constant term.' },
            { id: 'valX', name: 'Evaluate at x', type: 'number', defaultValue: 2, step: 0.1, tooltip: 'x value.' }
        ],
        naturalLanguageQueries: ["Calculate my polynomial calculator", "What is my polynomial calculator?", "Help me solve polynomial calculator"],
        edgeCases: ["Zero division errors", "Negative inputs where not defined", "Boundary values"],
        calculate: (inputs) => {
            const a = Number(inputs.c3) || 0;
            const b = Number(inputs.c2) || 0;
            const c = Number(inputs.c1) || 0;
            const d = Number(inputs.c0) || 0;
            const x = Number(inputs.valX) || 0;

            const px = (a * Math.pow(x, 3)) + (b * Math.pow(x, 2)) + (c * x) + d;
            const dpx = (3 * a * Math.pow(x, 2)) + (2 * b * x) + c;

            return {
                primaryOutput: { label: `P(${x}) Evaluated Result`, value: Number(px.toFixed(4)) },
                secondaryMetrics: [
                    { label: `Derivative P'(${x})`, value: String(Number(dpx.toFixed(4))) },
                    { label: 'Polynomial Expression', value: `${a}x³ + ${b}x² + ${c}x + ${d}` }
                ]
            };
        }
    },
    // 34. Inequality Calculator (ax + b < c / > c)
    {
        id: 'inequality-calculator',
        name: 'Inequality Calculator',
        category: 'math-algebra',
        group: 'Algebra & Functions',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '10K',
        cpc: '$0.97',
        description: "An Inequality Calculator solves algebraic inequalities and identifies solution intervals. It helps analyze ranges satisfying mathematical conditions. The calculator supports linear and quadratic inequalities.",
        inputs: [
            { id: 'coeffA', name: 'Coefficient a', type: 'number', defaultValue: -2, step: 0.1, tooltip: 'Coefficient of x.' },
            { id: 'constantB', name: 'Constant b', type: 'number', defaultValue: 6, step: 0.1, tooltip: 'Constant b.' },
            { id: 'operator', name: 'Inequality Sign', type: 'dropdown', defaultValue: 'lt', options: [{ label: '< (Less than)', value: 'lt' }, { label: '<= (Less than or equal)', value: 'lte' }, { label: '> (Greater than)', value: 'gt' }, { label: '>= (Greater than or equal)', value: 'gte' }], tooltip: 'Sign.' },
            { id: 'rightSideC', name: 'Right Side c', type: 'number', defaultValue: 14, step: 0.1, tooltip: 'Constant c.' }
        ],
        naturalLanguageQueries: ["Calculate my inequality calculator", "What is my inequality calculator?", "Help me solve inequality calculator"],
        edgeCases: ["Undefined intervals Absolute-value inequalities Division by zero"],
        calculate: (inputs) => {
            const a = Number(inputs.coeffA) || 1;
            const b = Number(inputs.constantB) || 0;
            const c = Number(inputs.rightSideC) || 0;
            const op = String(inputs.operator || 'lt');

            if (a === 0) return { primaryOutput: { label: 'Result', value: 'Error: a cannot be 0' } };

            const bound = (c - b) / a;
            const flip = a < 0;

            let resultingOp = op;
            if (flip) {
                if (op === 'lt') resultingOp = 'gt';
                else if (op === 'lte') resultingOp = 'gte';
                else if (op === 'gt') resultingOp = 'lt';
                else if (op === 'gte') resultingOp = 'lte';
            }

            const signSymbols: Record<string, string> = { 'lt': '<', 'lte': '≤', 'gt': '>', 'gte': '≥' };

            return {
                primaryOutput: { label: 'Inequality Solution', value: `x ${signSymbols[resultingOp]} ${Number(bound.toFixed(4))}` },
                secondaryMetrics: [
                    { label: 'Sign Flip Required', value: flip ? 'Yes (Divided by negative number)' : 'No (Positive divisor)' },
                    { label: 'Boundary Value', value: String(Number(bound.toFixed(4))) }
                ]
            };
        }
    },
    // 35. FOIL Method Calculator ((ax + b)(cx + d))
    {
        id: 'foil-method-calculator',
        name: 'FOIL Method Calculator',
        category: 'math-algebra',
        group: 'Algebra & Functions',
        bucket: 'Bucket B',
        tier: 4,
        phase: 4,
        monthlySearches: '2K',
        cpc: '$0.35',
        description: "A FOIL Method Calculator expands products of two binomials using the First, Outer, Inner, Last multiplication technique. It helps simplify algebraic expressions. The calculator is commonly used in introductory algebra.",
        inputs: [
            { id: 'a', name: 'First Binomial - a (x coeff)', type: 'number', defaultValue: 2, step: 1, tooltip: 'a' },
            { id: 'b', name: 'First Binomial - b (constant)', type: 'number', defaultValue: 3, step: 1, tooltip: 'b' },
            { id: 'c', name: 'Second Binomial - c (x coeff)', type: 'number', defaultValue: 4, step: 1, tooltip: 'c' },
            { id: 'd', name: 'Second Binomial - d (constant)', type: 'number', defaultValue: -5, step: 1, tooltip: 'd' }
        ],
        naturalLanguageQueries: ["Calculate my foil method calculator", "What is my foil method calculator?", "Help me solve foil method calculator"],
        edgeCases: ["Missing terms Negative coefficients Non-binomial inputs"],
        calculate: (inputs) => {
            const a = Number(inputs.a) || 1;
            const b = Number(inputs.b) || 0;
            const c = Number(inputs.c) || 1;
            const d = Number(inputs.d) || 0;

            const first = a * c;
            const outer = a * d;
            const inner = b * c;
            const last = b * d;

            const middle = outer + inner;

            return {
                primaryOutput: { label: 'Expanded Quadratic Form', value: `${first}x² ${middle >= 0 ? '+ ' + middle : '- ' + Math.abs(middle)}x ${last >= 0 ? '+ ' + last : '- ' + Math.abs(last)}` },
                secondaryMetrics: [
                    { label: 'First (F: a·c·x²)', value: `${first}x²` },
                    { label: 'Outer (O: a·d·x)', value: `${outer}x` },
                    { label: 'Inner (I: b·c·x)', value: `${inner}x` },
                    { label: 'Last (L: b·d)', value: String(last) }
                ]
            };
        }
    },
    // 36. Factorial Calculator
    {
        id: 'factorial-calculator',
        name: 'Factorial Calculator',
        category: 'math-algebra',
        group: 'Algebra & Functions',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '15K',
        cpc: '$0.59',
        description: "A Factorial Calculator computes factorial values used in combinatorics, probability, and discrete mathematics. It helps evaluate permutations and series expansions. The calculator supports large factorial computations.",
        inputs: [
            { id: 'nValue', name: 'Integer (n)', type: 'number', defaultValue: 6, min: 0, max: 170, step: 1, suffix: 'n', tooltip: 'Integer 0 to 170.' }
        ],
        naturalLanguageQueries: ["Calculate my factorial calculator", "What is my factorial calculator?", "Help me solve factorial calculator"],
        edgeCases: ["Negative integers undefined Extremely large factorial overflow Non-integer inputs"],
        calculate: (inputs) => {
            const n = Math.abs(Math.floor(Number(inputs.nValue) || 0));
            if (n > 170) return { primaryOutput: { label: 'Result', value: 'Value exceeds IEEE-754 precision limit (n <= 170)' } };

            let f = 1;
            for (let i = 2; i <= n; i++) f *= i;

            return {
                primaryOutput: { label: `${n}! Factorial Result`, value: n <= 20 ? f : f.toExponential(6) },
                secondaryMetrics: [
                    { label: 'Scientific Notation', value: f.toExponential(4) },
                    { label: 'Preceding Factorial ((n-1)!)', value: n > 0 ? String(f / n) : '1' }
                ]
            };
        }
    },
    // 37. Large Exponents Calculator (Modular Exponentiation)
    {
        id: 'large-exponents-calculator',
        name: 'Large Exponents Calculator',
        category: 'math-algebra',
        group: 'Algebra & Functions',
        bucket: 'Bucket B',
        tier: 5,
        phase: 5,
        monthlySearches: '40',
        cpc: 'N/A',
        description: "A Large Exponents Calculator computes extremely large exponentiation operations using arbitrary precision arithmetic. It helps solve scientific, cryptographic, and mathematical computations. The calculator supports modular arithmetic optionally.",
        inputs: [
            { id: 'baseNum', name: 'Base (b)', type: 'number', defaultValue: 7, min: 1, step: 1, tooltip: 'Base number.' },
            { id: 'exponentNum', name: 'Exponent (e)', type: 'number', defaultValue: 13, min: 1, step: 1, tooltip: 'Power / exponent.' },
            { id: 'modulusNum', name: 'Modulus (m, Optional)', type: 'number', defaultValue: 100, min: 1, step: 1, tooltip: 'Modulus m.' }
        ],
        naturalLanguageQueries: ["Calculate my large exponents calculator", "What is my large exponents calculator?", "Help me solve large exponents calculator"],
        edgeCases: ["Huge memory requirements Zero-to-zero ambiguity Negative exponents"],
        calculate: (inputs) => {
            const b = BigInt(Math.floor(Number(inputs.baseNum) || 1));
            const e = BigInt(Math.floor(Number(inputs.exponentNum) || 1));
            const m = BigInt(Math.floor(Number(inputs.modulusNum) || 100));

            // Fast modular exponentiation
            let res = BigInt(1);
            let base = b % m;
            let exp = e;
            const zero = BigInt(0);
            const one = BigInt(1);
            const two = BigInt(2);
            while (exp > zero) {
                if (exp % two === one) res = (res * base) % m;
                base = (base * base) % m;
                exp = exp / two;
            }

            return {
                primaryOutput: { label: `${b}^${e} mod ${m}`, value: res.toString() },
                secondaryMetrics: [
                    { label: 'Last Digits of b^e', value: res.toString() },
                    { label: 'Base and Exponent', value: `${b}^${e}` }
                ]
            };
        }
    },
    // 38. Trigonometry Calculator
    {
        id: 'trigonometry-calculator',
        name: 'Trigonometry Calculator',
        category: 'math-algebra',
        group: 'Algebra & Functions',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '60K',
        cpc: '$1.41',
        description: "A Trigonometry Calculator evaluates trigonometric functions including sine, cosine, tangent, inverse trig functions, and identities. It helps solve geometry and physics problems. The calculator supports degree and radian modes.",
        inputs: [
            { id: 'angleValue', name: 'Angle (θ)', type: 'number', defaultValue: 30, step: 0.1, tooltip: 'Angle.' },
            { id: 'unit', name: 'Angle Unit', type: 'dropdown', defaultValue: 'degrees', options: [{ label: 'Degrees (°)', value: 'degrees' }, { label: 'Radians (rad)', value: 'radians' }], tooltip: 'Unit.' }
        ],
        naturalLanguageQueries: ["Calculate my trigonometry calculator", "What is my trigonometry calculator?", "Help me solve trigonometry calculator"],
        edgeCases: ["Undefined tangent values Degree/radian confusion Floating-point precision"],
        calculate: (inputs) => {
            const a = Number(inputs.angleValue) || 0;
            const isDeg = inputs.unit === 'degrees';
            const rad = isDeg ? (a * Math.PI) / 180 : a;

            const sin = Math.sin(rad);
            const cos = Math.cos(rad);
            const tan = Math.abs(cos) < 1e-10 ? 'Undefined' : (sin / cos).toFixed(6);

            return {
                primaryOutput: { label: 'sin(θ)', value: Number(sin.toFixed(6)) },
                secondaryMetrics: [
                    { label: 'cos(θ)', value: String(Number(cos.toFixed(6))) },
                    { label: 'tan(θ)', value: String(tan) },
                    { label: 'Angle in Radians', value: `${rad.toFixed(4)} rad` },
                    { label: 'Angle in Degrees', value: `${(rad * 180 / Math.PI).toFixed(2)}°` }
                ]
            };
        }
    },
    // 39. Limit Calculator (lim x->c)
    {
        id: 'limit-calculator',
        name: 'Limit Calculator',
        category: 'math-algebra',
        group: 'Algebra & Functions',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '40K',
        cpc: '$0.36',
        description: "A Limit Calculator computes limits of functions as variables approach specified values or infinity. It helps analyze continuity, asymptotic behavior, and calculus problems. The calculator supports symbolic and numerical evaluation.",
        inputs: [
            { id: 'coeffA', name: 'Polynomial a (x²)', type: 'number', defaultValue: 1, step: 0.1, tooltip: 'x^2' },
            { id: 'coeffB', name: 'Polynomial b (x)', type: 'number', defaultValue: -4, step: 0.1, tooltip: 'x' },
            { id: 'coeffC', name: 'Polynomial c', type: 'number', defaultValue: 3, step: 0.1, tooltip: 'constant' },
            { id: 'targetC', name: 'x approaches (c)', type: 'number', defaultValue: 2, step: 0.1, tooltip: 'Target c.' }
        ],
        naturalLanguageQueries: ["Calculate my limit calculator", "What is my limit calculator?", "Help me solve limit calculator"],
        edgeCases: ["Zero division errors", "Negative inputs where not defined", "Boundary values"],
        calculate: (inputs) => {
            const a = Number(inputs.coeffA) || 0;
            const b = Number(inputs.coeffB) || 0;
            const c = Number(inputs.coeffC) || 0;
            const x0 = Number(inputs.targetC) || 0;

            const limitVal = (a * x0 * x0) + (b * x0) + c;

            return {
                primaryOutput: { label: `lim (x → ${x0}) f(x)`, value: Number(limitVal.toFixed(4)) },
                secondaryMetrics: [
                    { label: 'Left Hand Limit', value: String(Number(limitVal.toFixed(4))) },
                    { label: 'Right Hand Limit', value: String(Number(limitVal.toFixed(4))) },
                    { label: 'Continuity Status', value: 'Continuous at x = c' }
                ]
            };
        }
    },
    // 40. Derivative Calculator (Power Rule)
    {
        id: 'derivative-calculator',
        name: 'Derivative Calculator',
        category: 'math-algebra',
        group: 'Algebra & Functions',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '135K',
        cpc: '$0.41',
        description: "A Derivative Calculator calculates mathematical and scientific values with high precision and step-by-step clarity.",
        inputs: [
            { id: 'coeffA', name: 'Coefficient a (xⁿ)', type: 'number', defaultValue: 3, step: 0.1, tooltip: 'a' },
            { id: 'powerN', name: 'Power n', type: 'number', defaultValue: 2, step: 1, tooltip: 'Exponent n.' },
            { id: 'pointX', name: 'Evaluate Derivative at x₀', type: 'number', defaultValue: 4, step: 0.1, tooltip: 'Evaluation point.' }
        ],
        naturalLanguageQueries: ["Calculate my derivative calculator", "What is my derivative calculator?", "Help me solve derivative calculator"],
        edgeCases: ["Zero division errors", "Negative inputs where not defined", "Boundary values"],
        calculate: (inputs) => {
            const a = Number(inputs.coeffA) || 1;
            const n = Number(inputs.powerN) || 1;
            const x0 = Number(inputs.pointX) || 0;

            const derivCoeff = a * n;
            const derivPower = n - 1;
            const slopeAtX0 = derivCoeff * Math.pow(x0, derivPower);

            return {
                primaryOutput: { label: `f'(${x0}) Derivative Value`, value: Number(slopeAtX0.toFixed(4)) },
                secondaryMetrics: [
                    { label: "Symbolic Derivative f'(x)", value: `${derivCoeff}x^${derivPower}` },
                    { label: 'Original Function Value f(x₀)', value: String(Number((a * Math.pow(x0, n)).toFixed(4))) }
                ]
            };
        }
    },
    // 41. Integral Calculator (Definite Integral of a·xⁿ)
    {
        id: 'integral-calculator',
        name: 'Integral Calculator',
        category: 'math-algebra',
        group: 'Algebra & Functions',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '246K',
        cpc: '$0.29',
        description: "A Integral Calculator calculates mathematical and scientific values with high precision and step-by-step clarity.",
        inputs: [
            { id: 'coeffA', name: 'Coefficient a', type: 'number', defaultValue: 3, step: 0.1, tooltip: 'Coefficient a.' },
            { id: 'powerN', name: 'Power n', type: 'number', defaultValue: 2, step: 1, tooltip: 'Exponent n (n != -1).' },
            { id: 'lowerBound', name: 'Lower Bound (a)', type: 'number', defaultValue: 0, step: 0.1, tooltip: 'Lower integration limit.' },
            { id: 'upperBound', name: 'Upper Bound (b)', type: 'number', defaultValue: 3, step: 0.1, tooltip: 'Upper integration limit.' }
        ],
        naturalLanguageQueries: ["Calculate my integral calculator", "What is my integral calculator?", "Help me solve integral calculator"],
        edgeCases: ["Zero division errors", "Negative inputs where not defined", "Boundary values"],
        calculate: (inputs) => {
            const a = Number(inputs.coeffA) || 1;
            const n = Number(inputs.powerN) || 1;
            const l = Number(inputs.lowerBound) || 0;
            const u = Number(inputs.upperBound) || 1;

            if (n === -1) {
                const val = a * (Math.log(Math.abs(u)) - Math.log(Math.abs(l)));
                return { primaryOutput: { label: 'Definite Integral', value: Number(val.toFixed(6)) } };
            }

            const antideriv = (x: number) => (a / (n + 1)) * Math.pow(x, n + 1);
            const definiteInt = antideriv(u) - antideriv(l);

            return {
                primaryOutput: { label: 'Definite Integral ∫ f(x) dx', value: Number(definiteInt.toFixed(4)) },
                secondaryMetrics: [
                    { label: 'Antiderivative F(x)', value: `(${a}/${n + 1}) x^${n + 1} + C` },
                    { label: 'F(Upper Bound)', value: String(Number(antideriv(u).toFixed(4))) },
                    { label: 'F(Lower Bound)', value: String(Number(antideriv(l).toFixed(4))) }
                ]
            };
        }
    },
    // 42. Complex Number Calculator
    {
        id: 'complex-number-calculator',
        name: 'Complex Number Calculator',
        category: 'math-algebra',
        group: 'Algebra & Functions',
        bucket: 'Bucket B',
        tier: 3,
        phase: 5,
        monthlySearches: '7K',
        cpc: '$0.72',
        description: "A Big Number Calculator performs arithmetic operations on extremely large integers or high-precision decimal numbers beyond standard floating-point limits. The calculator is commonly used in cryptography, finance, and scientific computing.",
        inputs: [
            { id: 'r1', name: 'Z1 - Real Part (a)', type: 'number', defaultValue: 3, step: 0.1, tooltip: 'Real part of Z1.' },
            { id: 'i1', name: 'Z1 - Imaginary Part (b)', type: 'number', defaultValue: 4, step: 0.1, tooltip: 'Imaginary part of Z1.' },
            { id: 'operation', name: 'Operation', type: 'dropdown', defaultValue: 'multiply', options: [{ label: 'Multiply (Z1 × Z2)', value: 'multiply' }, { label: 'Add (Z1 + Z2)', value: 'add' }, { label: 'Subtract (Z1 - Z2)', value: 'subtract' }, { label: 'Divide (Z1 ÷ Z2)', value: 'divide' }], tooltip: 'Operation.' },
            { id: 'r2', name: 'Z2 - Real Part (c)', type: 'number', defaultValue: 1, step: 0.1, tooltip: 'Real part of Z2.' },
            { id: 'i2', name: 'Z2 - Imaginary Part (d)', type: 'number', defaultValue: -2, step: 0.1, tooltip: 'Imaginary part of Z2.' }
        ],
        naturalLanguageQueries: ["Calculate my complex number calculator", "What is my complex number calculator?", "Help me solve complex number calculator"],
        edgeCases: ["Extremely large exponents Memory overflow constraints Precision truncation settings"],
        calculate: (inputs) => {
            const a = Number(inputs.r1) || 0;
            const b = Number(inputs.i1) || 0;
            const c = Number(inputs.r2) || 0;
            const d = Number(inputs.i2) || 0;
            const op = String(inputs.operation || 'multiply');

            let resR = 0, resI = 0;
            if (op === 'add') { resR = a + c; resI = b + d; }
            else if (op === 'subtract') { resR = a - c; resI = b - d; }
            else if (op === 'multiply') { resR = (a * c) - (b * d); resI = (a * d) + (b * c); }
            else if (op === 'divide') {
                const den = (c * c) + (d * d);
                if (den === 0) return { primaryOutput: { label: 'Result', value: 'Error: Cannot divide by zero complex number' } };
                resR = ((a * c) + (b * d)) / den;
                resI = ((b * c) - (a * d)) / den;
            }

            const mod1 = Math.sqrt((a * a) + (b * b));
            const signStr = resI >= 0 ? '+ ' + resI.toFixed(2) : '- ' + Math.abs(resI).toFixed(2);

            return {
                primaryOutput: { label: 'Resulting Complex Number', value: `${resR.toFixed(2)} ${signStr}i` },
                secondaryMetrics: [
                    { label: '|Z1| Modulus', value: mod1.toFixed(4) },
                    { label: 'Arg(Z1) in Radians', value: Math.atan2(b, a).toFixed(4) }
                ]
            };
        }
    },
    // 43. Vector Calculator (3D Vectors)
    {
        id: 'vector-calculator',
        name: 'Vector Calculator',
        category: 'math-algebra',
        group: 'Algebra & Functions',
        bucket: 'Bucket B',
        tier: 3,
        phase: 5,
        monthlySearches: '7K',
        cpc: '$0.51',
        description: "A Vector Calculator calculates mathematical and scientific values with high precision and step-by-step clarity.",
        inputs: [
            { id: 'u1', name: 'Vector u: x', type: 'number', defaultValue: 1, step: 0.1, tooltip: 'u_x' },
            { id: 'u2', name: 'Vector u: y', type: 'number', defaultValue: 2, step: 0.1, tooltip: 'u_y' },
            { id: 'u3', name: 'Vector u: z', type: 'number', defaultValue: 3, step: 0.1, tooltip: 'u_z' },
            { id: 'v1', name: 'Vector v: x', type: 'number', defaultValue: 4, step: 0.1, tooltip: 'v_x' },
            { id: 'v2', name: 'Vector v: y', type: 'number', defaultValue: 5, step: 0.1, tooltip: 'v_y' },
            { id: 'v3', name: 'Vector v: z', type: 'number', defaultValue: 6, step: 0.1, tooltip: 'v_z' }
        ],
        naturalLanguageQueries: ["Calculate my vector calculator", "What is my vector calculator?", "Help me solve vector calculator"],
        edgeCases: ["Zero division errors", "Negative inputs where not defined", "Boundary values"],
        calculate: (inputs) => {
            const ux = Number(inputs.u1) || 0, uy = Number(inputs.u2) || 0, uz = Number(inputs.u3) || 0;
            const vx = Number(inputs.v1) || 0, vy = Number(inputs.v2) || 0, vz = Number(inputs.v3) || 0;

            const magU = Math.sqrt((ux * ux) + (uy * uy) + (uz * uz));
            const magV = Math.sqrt((vx * vx) + (vy * vy) + (vz * vz));
            const dot = (ux * vx) + (uy * vy) + (uz * vz);

            const crossX = (uy * vz) - (uz * vy);
            const crossY = (uz * vx) - (ux * vz);
            const crossZ = (ux * vy) - (uy * vx);

            const cosAngle = (magU * magV) !== 0 ? Math.max(-1, Math.min(1, dot / (magU * magV))) : 0;
            const angleDeg = (Math.acos(cosAngle) * 180) / Math.PI;

            return {
                primaryOutput: { label: 'Dot Product (u · v)', value: dot },
                secondaryMetrics: [
                    { label: 'Cross Product (u × v)', value: `⟨${crossX}, ${crossY}, ${crossZ}⟩` },
                    { label: 'Angle Between Vectors', value: `${angleDeg.toFixed(2)}°` },
                    { label: '|u| Magnitude', value: magU.toFixed(4) },
                    { label: '|v| Magnitude', value: magV.toFixed(4) }
                ]
            };
        }
    },
    // 44. Standard Deviation Calculator
    {
        id: 'standard-deviation-calculator',
        name: 'Standard Deviation Calculator',
        category: 'math-algebra',
        group: 'Statistics & Probability',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '110K',
        cpc: '$2.05',
        description: "A Standard Deviation Calculator measures how spread out values are around the mean of a dataset. It helps quantify variability, volatility, and consistency in statistical analysis. The calculator supports both population and sample standard deviation methods.",
        inputs: [
            { id: 'num1', name: 'Value 1', type: 'number', defaultValue: 10, step: 0.1, tooltip: 'Sample point 1.' },
            { id: 'num2', name: 'Value 2', type: 'number', defaultValue: 12, step: 0.1, tooltip: 'Sample point 2.' },
            { id: 'num3', name: 'Value 3', type: 'number', defaultValue: 23, step: 0.1, tooltip: 'Sample point 3.' },
            { id: 'num4', name: 'Value 4', type: 'number', defaultValue: 23, step: 0.1, tooltip: 'Sample point 4.' },
            { id: 'num5', name: 'Value 5', type: 'number', defaultValue: 16, step: 0.1, tooltip: 'Sample point 5.' },
            { id: 'num6', name: 'Value 6', type: 'number', defaultValue: 23, step: 0.1, tooltip: 'Sample point 6.' },
            { id: 'num7', name: 'Value 7', type: 'number', defaultValue: 21, step: 0.1, tooltip: 'Sample point 7.' },
            { id: 'num8', name: 'Value 8', type: 'number', defaultValue: 16, step: 0.1, tooltip: 'Sample point 8.' }
        ],
        naturalLanguageQueries: ["Calculate my standard deviation calculator", "What is my standard deviation calculator?", "Help me solve standard deviation calculator"],
        edgeCases: ["Empty datasets Single-value sample datasets Extremely large values causing overflow Non-numeric entries"],
        calculate: (inputs) => {
            const vals = [inputs.num1, inputs.num2, inputs.num3, inputs.num4, inputs.num5, inputs.num6, inputs.num7, inputs.num8]
                .map(v => Number(v))
                .filter(v => !isNaN(v));

            const n = vals.length;
            if (n < 2) return { primaryOutput: { label: 'Sample Standard Deviation (s)', value: 0 } };

            const mean = vals.reduce((a, b) => a + b, 0) / n;
            const sumSqDiff = vals.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);

            const sampleVar = sumSqDiff / (n - 1);
            const sampleStd = Math.sqrt(sampleVar);
            const popVar = sumSqDiff / n;
            const popStd = Math.sqrt(popVar);

            return {
                primaryOutput: { label: 'Sample Standard Deviation (s)', value: Number(sampleStd.toFixed(4)) },
                secondaryMetrics: [
                    { label: 'Population Standard Deviation (σ)', value: String(Number(popStd.toFixed(4))) },
                    { label: 'Sample Variance (s²)', value: String(Number(sampleVar.toFixed(4))) },
                    { label: 'Sample Mean (x̄)', value: String(Number(mean.toFixed(4))) },
                    { label: 'Sample Size (n)', value: `${n} items` }
                ]
            };
        }
    },
    // 45. Statistics Calculator
    {
        id: 'statistics-calculator',
        name: 'Statistics Calculator',
        category: 'math-algebra',
        group: 'Statistics & Probability',
        bucket: 'Bucket B',
        tier: 2,
        phase: 3,
        monthlySearches: '33K',
        cpc: '$2.23',
        description: "A Statistics Calculator computes descriptive statistical measures including mean, median, mode, variance, range, and standard deviation. It helps summarize and analyze datasets. The calculator is commonly used in education, research, and business analytics.",
        inputs: [
            { id: 'v1', name: 'Data 1', type: 'number', defaultValue: 4, step: 0.1, tooltip: 'v1' },
            { id: 'v2', name: 'Data 2', type: 'number', defaultValue: 8, step: 0.1, tooltip: 'v2' },
            { id: 'v3', name: 'Data 3', type: 'number', defaultValue: 6, step: 0.1, tooltip: 'v3' },
            { id: 'v4', name: 'Data 4', type: 'number', defaultValue: 5, step: 0.1, tooltip: 'v4' },
            { id: 'v5', name: 'Data 5', type: 'number', defaultValue: 3, step: 0.1, tooltip: 'v5' },
            { id: 'v6', name: 'Data 6', type: 'number', defaultValue: 8, step: 0.1, tooltip: 'v6' },
            { id: 'v7', name: 'Data 7', type: 'number', defaultValue: 9, step: 0.1, tooltip: 'v7' }
        ],
        naturalLanguageQueries: ["Calculate my statistics calculator", "What is my statistics calculator?", "Help me solve statistics calculator"],
        edgeCases: ["Empty datasets Multiple modes Non-numeric values Skewed outlier-heavy distributions"],
        calculate: (inputs) => {
            const vals = [inputs.v1, inputs.v2, inputs.v3, inputs.v4, inputs.v5, inputs.v6, inputs.v7]
                .map(v => Number(v))
                .filter(v => !isNaN(v));

            const n = vals.length;
            if (n === 0) return { primaryOutput: { label: 'Mean', value: 0 } };

            const sum = vals.reduce((a, b) => a + b, 0);
            const mean = sum / n;

            const sorted = [...vals].sort((a, b) => a - b);
            const mid = Math.floor(n / 2);
            const median = n % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

            const counts: Record<number, number> = {};
            let maxFreq = 0;
            vals.forEach(v => {
                counts[v] = (counts[v] || 0) + 1;
                if (counts[v] > maxFreq) maxFreq = counts[v];
            });
            const modes = Object.keys(counts).filter(k => counts[Number(k)] === maxFreq && maxFreq > 1);

            const sumSq = vals.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);
            const stdDev = Math.sqrt(sumSq / (n > 1 ? n - 1 : 1));

            return {
                primaryOutput: { label: 'Mean Average (x̄)', value: Number(mean.toFixed(4)) },
                secondaryMetrics: [
                    { label: 'Median', value: String(median) },
                    { label: 'Mode', value: modes.length > 0 ? modes.join(', ') : 'No Mode' },
                    { label: 'Sample Standard Deviation', value: stdDev.toFixed(4) },
                    { label: 'Range (Max - Min)', value: `${sorted[0]} to ${sorted[n - 1]} (Δ = ${sorted[n - 1] - sorted[0]})` }
                ]
            };
        }
    },
    // 46. Mean Median Mode Range Calculator
    {
        id: 'mean-median-mode-range-calculator',
        name: 'Mean Median Mode Range Calculator',
        category: 'math-algebra',
        group: 'Statistics & Probability',
        bucket: 'Bucket B',
        tier: 4,
        phase: 3,
        monthlySearches: '2K',
        cpc: '$2.50',
        description: "A Mean Median Mode Range Calculator computes the most common descriptive statistics for a dataset. It helps users quickly summarize central tendency and spread. The calculator supports sorted and unsorted datasets.",
        inputs: [
            { id: 'n1', name: 'Value 1', type: 'number', defaultValue: 12, step: 0.1, tooltip: 'Number 1.' },
            { id: 'n2', name: 'Value 2', type: 'number', defaultValue: 15, step: 0.1, tooltip: 'Number 2.' },
            { id: 'n3', name: 'Value 3', type: 'number', defaultValue: 12, step: 0.1, tooltip: 'Number 3.' },
            { id: 'n4', name: 'Value 4', type: 'number', defaultValue: 18, step: 0.1, tooltip: 'Number 4.' },
            { id: 'n5', name: 'Value 5', type: 'number', defaultValue: 25, step: 0.1, tooltip: 'Number 5.' }
        ],
        naturalLanguageQueries: ["Calculate my mean median mode range calculator", "What is my mean median mode range calculator?", "Help me solve mean median mode range calculator"],
        edgeCases: ["Even-numbered datasets for median Multiple modes Empty input lists"],
        calculate: (inputs) => {
            const arr = [inputs.n1, inputs.n2, inputs.n3, inputs.n4, inputs.n5]
                .map(v => Number(v))
                .filter(v => !isNaN(v));

            if (arr.length === 0) return { primaryOutput: { label: 'Mean', value: 0 } };

            const sum = arr.reduce((a, b) => a + b, 0);
            const mean = sum / arr.length;
            const sorted = [...arr].sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
            const min = sorted[0];
            const max = sorted[sorted.length - 1];
            const range = max - min;

            const freq: Record<number, number> = {};
            let maxF = 0;
            arr.forEach(v => {
                freq[v] = (freq[v] || 0) + 1;
                if (freq[v] > maxF) maxF = freq[v];
            });
            const modes = Object.keys(freq).filter(k => freq[Number(k)] === maxF && maxF > 1);

            return {
                primaryOutput: { label: 'Mean', value: Number(mean.toFixed(2)) },
                secondaryMetrics: [
                    { label: 'Median', value: String(median) },
                    { label: 'Mode', value: modes.length > 0 ? modes.join(', ') : 'None' },
                    { label: 'Range', value: String(range) },
                    { label: 'Minimum & Maximum', value: `Min: ${min}, Max: ${max}` }
                ]
            };
        }
    },
    // 47. Probability Calculator
    {
        id: 'probability-calculator',
        name: 'Probability Calculator',
        category: 'math-algebra',
        group: 'Statistics & Probability',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '22K',
        cpc: '$2.62',
        description: "A Probability Calculator computes the likelihood of events occurring. It supports independent, conditional, and combined event probabilities. The calculator is widely used in statistics, gaming, and risk analysis.",
        inputs: [
            { id: 'probA', name: 'Probability of Event A: P(A)', type: 'number', defaultValue: 0.4, min: 0, max: 1, step: 0.05, suffix: 'prob', tooltip: 'P(A) between 0 and 1.' },
            { id: 'probB', name: 'Probability of Event B: P(B)', type: 'number', defaultValue: 0.5, min: 0, max: 1, step: 0.05, suffix: 'prob', tooltip: 'P(B) between 0 and 1.' },
            { id: 'eventType', name: 'Relationship Type', type: 'dropdown', defaultValue: 'independent', options: [{ label: 'Independent Events', value: 'independent' }, { label: 'Mutually Exclusive (Disjoint)', value: 'exclusive' }], tooltip: 'Independence assumption.' }
        ],
        naturalLanguageQueries: ["Calculate my probability calculator", "What is my probability calculator?", "Help me solve probability calculator"],
        edgeCases: ["Probabilities outside 0\u20131 range Division by zero in conditional probability Mutually exclusive event handling"],
        calculate: (inputs) => {
            const pA = Math.max(0, Math.min(1, Number(inputs.probA) || 0.4));
            const pB = Math.max(0, Math.min(1, Number(inputs.probB) || 0.5));
            const isInd = inputs.eventType === 'independent';

            const pAnd = isInd ? pA * pB : 0;
            const pOr = isInd ? pA + pB - pAnd : Math.min(1, pA + pB);
            const pNotA = 1 - pA;
            const pNotB = 1 - pB;

            return {
                primaryOutput: { label: 'P(A and B) Both Occur', value: Number(pAnd.toFixed(4)), suffix: `(${(pAnd * 100).toFixed(2)}%)` },
                secondaryMetrics: [
                    { label: 'P(A or B) At Least One Occurs', value: `${pOr.toFixed(4)} (${(pOr * 100).toFixed(2)}%)` },
                    { label: 'Complement P(Not A)', value: `${pNotA.toFixed(4)} (${(pNotA * 100).toFixed(2)}%)` },
                    { label: 'Odds in Favor of A', value: `${(pA / Math.max(0.0001, 1 - pA)).toFixed(2)} : 1` }
                ]
            };
        }
    },
    // 48. Permutation and Combination Calculator
    {
        id: 'permutation-and-combination-calculator',
        name: 'Permutation and Combination Calculator',
        category: 'math-algebra',
        group: 'Statistics & Probability',
        bucket: 'Bucket B',
        tier: 4,
        phase: 4,
        monthlySearches: '1K',
        cpc: 'N/A',
        description: "A Permutation and Combination Calculator computes arrangements and selections of items. It helps solve combinatorics and probability problems. The calculator distinguishes ordered vs unordered selections.",
        inputs: [
            { id: 'totalN', name: 'Total Set Size (n)', type: 'number', defaultValue: 10, min: 1, max: 100, step: 1, tooltip: 'Total items.' },
            { id: 'subsetR', name: 'Subset Chosen (r)', type: 'number', defaultValue: 3, min: 0, max: 100, step: 1, tooltip: 'Items chosen.' }
        ],
        naturalLanguageQueries: ["Calculate my permutation and combination calculator", "What is my permutation and combination calculator?", "Help me solve permutation and combination calculator"],
        edgeCases: ["r > n Negative integers Very large factorial overflow"],
        calculate: (inputs) => {
            const n = Math.abs(Math.floor(Number(inputs.totalN) || 10));
            const r = Math.abs(Math.floor(Number(inputs.subsetR) || 3));

            if (r > n) return { primaryOutput: { label: 'Combinations nCr', value: 'Error: r cannot be greater than n' } };

            // nPr = n * (n-1) * ... * (n-r+1)
            let nPr = 1;
            for (let i = 0; i < r; i++) {
                nPr *= (n - i);
            }

            // r!
            let rFact = 1;
            for (let i = 2; i <= r; i++) {
                rFact *= i;
            }

            const nCr = Math.round(nPr / rFact);

            return {
                primaryOutput: { label: 'Combinations (nCr - Order does not matter)', value: nCr },
                secondaryMetrics: [
                    { label: 'Permutations (nPr - Order matters)', value: String(nPr) },
                    { label: 'Permutations with Repetition (n^r)', value: String(Math.pow(n, r)) },
                    { label: 'Factorial n!', value: n <= 20 ? String(rFact) : 'Large' }
                ]
            };
        }
    },
    // 49. Z-Score Calculator
    {
        id: 'z-score-calculator',
        name: 'Z-Score Calculator',
        category: 'math-algebra',
        group: 'Statistics & Probability',
        bucket: 'Bucket B',
        tier: 2,
        phase: 3,
        monthlySearches: '22K',
        cpc: '$2.82',
        description: "A Z-Score Calculator measures how many standard deviations a value lies from the mean. It helps standardize data and compare values across distributions. The calculator is commonly used in statistics and hypothesis testing.",
        inputs: [
            { id: 'rawScore', name: 'Raw Score (x)', type: 'number', defaultValue: 85, step: 0.1, tooltip: 'Observed value.' },
            { id: 'meanMu', name: 'Population Mean (μ)', type: 'number', defaultValue: 75, step: 0.1, tooltip: 'Mean.' },
            { id: 'stdSigma', name: 'Standard Deviation (σ)', type: 'number', defaultValue: 10, min: 0.001, step: 0.1, tooltip: 'Standard deviation.' }
        ],
        naturalLanguageQueries: ["Calculate my z-score calculator", "What is my z-score calculator?", "Help me solve z-score calculator"],
        edgeCases: ["Zero standard deviation Extreme outlier values Negative distributions"],
        calculate: (inputs) => {
            const x = Number(inputs.rawScore) || 85;
            const mu = Number(inputs.meanMu) || 75;
            const sigma = Math.max(0.0001, Number(inputs.stdSigma) || 10);

            const z = (x - mu) / sigma;

            // Cumulative normal distribution approximation (Abramowitz & Stegun)
            const erf = (t: number) => {
                const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
                const sign = t < 0 ? -1 : 1;
                const absT = Math.abs(t);
                const k = 1.0 / (1.0 + p * absT);
                const y = 1.0 - (((((a5 * k + a4) * k) + a3) * k + a2) * k + a1) * k * Math.exp(-absT * absT);
                return sign * y;
            };
            const cdf = 0.5 * (1 + erf(z / Math.SQRT2));
            const percentile = cdf * 100;

            return {
                primaryOutput: { label: 'Standard Z-Score', value: Number(z.toFixed(4)) },
                secondaryMetrics: [
                    { label: 'Percentile Rank P(Z < z)', value: `${percentile.toFixed(2)}th Percentile` },
                    { label: 'p-value (Right Tail P(Z > z))', value: (1 - cdf).toFixed(4) },
                    { label: 'Distance from Mean', value: `${z >= 0 ? '+' : ''}${z.toFixed(2)} standard deviations` }
                ]
            };
        }
    },
    // 50. Confidence Interval Calculator
    {
        id: 'confidence-interval-calculator',
        name: 'Confidence Interval Calculator',
        category: 'math-algebra',
        group: 'Statistics & Probability',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '8K',
        cpc: '$3.77',
        description: "A Confidence Interval Calculator estimates the range within which a population parameter likely falls. It helps quantify statistical uncertainty. The calculator supports means and proportions.",
        inputs: [
            { id: 'sampleMean', name: 'Sample Mean (x̄)', type: 'number', defaultValue: 50, step: 0.1, tooltip: 'Sample mean.' },
            { id: 'stdDev', name: 'Standard Deviation (s / σ)', type: 'number', defaultValue: 8, min: 0.01, step: 0.1, tooltip: 'Std dev.' },
            { id: 'sampleSize', name: 'Sample Size (n)', type: 'number', defaultValue: 100, min: 2, step: 1, tooltip: 'Sample count.' },
            { id: 'confLevel', name: 'Confidence Level', type: 'dropdown', defaultValue: 1.96, options: [{ label: '90% (Z = 1.645)', value: 1.645 }, { label: '95% (Z = 1.960)', value: 1.96 }, { label: '99% (Z = 2.576)', value: 2.576 }], tooltip: 'Confidence coefficient.' }
        ],
        naturalLanguageQueries: ["Calculate my confidence interval calculator", "What is my confidence interval calculator?", "Help me solve confidence interval calculator"],
        edgeCases: ["Small sample sizes requiring t-distribution Zero variance Invalid confidence levels"],
        calculate: (inputs) => {
            const mean = Number(inputs.sampleMean) || 50;
            const s = Number(inputs.stdDev) || 8;
            const n = Math.max(2, Number(inputs.sampleSize) || 100);
            const z = Number(inputs.confLevel) || 1.96;

            const stdError = s / Math.sqrt(n);
            const me = z * stdError;
            const lower = mean - me;
            const upper = mean + me;

            return {
                primaryOutput: { label: 'Confidence Interval', value: `[${lower.toFixed(2)}, ${upper.toFixed(2)}]` },
                secondaryMetrics: [
                    { label: 'Margin of Error (± ME)', value: `± ${me.toFixed(4)}` },
                    { label: 'Standard Error of the Mean (SE)', value: stdError.toFixed(4) },
                    { label: 'Point Estimate (Mean)', value: String(mean) }
                ]
            };
        }
    },
    // 51. P-Value Calculator
    {
        id: 'p-value-calculator',
        name: 'P-Value Calculator',
        category: 'math-algebra',
        group: 'Statistics & Probability',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '15K',
        cpc: '$6.05  ★ HIGH CPC',
        description: "A P-Value Calculator computes statistical significance values for hypothesis testing. It helps determine whether observed results are likely due to chance. The calculator supports z-tests, t-tests, and chi-square tests.",
        inputs: [
            { id: 'zScore', name: 'Z Test Statistic', type: 'number', defaultValue: 2.15, step: 0.01, tooltip: 'Calculated z statistic.' },
            { id: 'tailType', name: 'Hypothesis Test Tail', type: 'dropdown', defaultValue: 'two', options: [{ label: 'Two-Tailed Test (≠)', value: 'two' }, { label: 'Left-Tailed Test (<)', value: 'left' }, { label: 'Right-Tailed Test (>)', value: 'right' }], tooltip: 'Test direction.' }
        ],
        naturalLanguageQueries: ["Calculate my p-value calculator", "What is my p-value calculator?", "Help me solve p-value calculator"],
        edgeCases: ["Zero division errors", "Negative inputs where not defined", "Boundary values"],
        calculate: (inputs) => {
            const z = Number(inputs.zScore) || 2.15;
            const tail = String(inputs.tailType || 'two');

            const erf = (t: number) => {
                const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
                const sign = t < 0 ? -1 : 1;
                const absT = Math.abs(t);
                const k = 1.0 / (1.0 + p * absT);
                const y = 1.0 - (((((a5 * k + a4) * k) + a3) * k + a2) * k + a1) * k * Math.exp(-absT * absT);
                return sign * y;
            };
            const cdf = 0.5 * (1 + erf(z / Math.SQRT2));

            let pVal = 0;
            if (tail === 'left') pVal = cdf;
            else if (tail === 'right') pVal = 1 - cdf;
            else pVal = 2 * (1 - 0.5 * (1 + erf(Math.abs(z) / Math.SQRT2)));

            let sig = 'Significant at α = 0.05';
            if (pVal < 0.01) sig = 'Highly Significant at α = 0.01';
            else if (pVal >= 0.05) sig = 'Not Statistically Significant (Fail to reject H₀ at α = 0.05)';

            return {
                primaryOutput: { label: 'Calculated p-value', value: Number(pVal.toFixed(5)) },
                secondaryMetrics: [
                    { label: 'Statistical Significance', value: sig },
                    { label: 'Z Statistic Value', value: String(z) },
                    { label: 'Cumulative Probability P(Z ≤ z)', value: cdf.toFixed(5) }
                ]
            };
        }
    },
    // 52. Sample Size Calculator
    {
        id: 'sample-size-calculator',
        name: 'Sample Size Calculator',
        category: 'math-algebra',
        group: 'Statistics & Probability',
        bucket: 'Bucket B',
        tier: 2,
        phase: 3,
        monthlySearches: '50K',
        cpc: '$1.22',
        description: "A Sample Size Calculator estimates the number of observations required for reliable statistical results. It helps design surveys and experiments. The calculator balances confidence, margin of error, and variability.",
        inputs: [
            { id: 'marginErrorPct', name: 'Margin of Error (± %)', type: 'percentage', defaultValue: 5, min: 0.5, max: 20, step: 0.5, suffix: '%', tooltip: 'Desired margin of error.' },
            { id: 'confLevel', name: 'Confidence Level', type: 'dropdown', defaultValue: 1.96, options: [{ label: '90% (Z = 1.645)', value: 1.645 }, { label: '95% (Z = 1.960)', value: 1.96 }, { label: '99% (Z = 2.576)', value: 2.576 }], tooltip: 'Confidence level.' },
            { id: 'populationProp', name: 'Estimated Proportion (p)', type: 'percentage', defaultValue: 50, min: 1, max: 99, step: 1, suffix: '%', tooltip: '50% gives conservative max sample size.' }
        ],
        naturalLanguageQueries: ["Calculate my sample size calculator", "What is my sample size calculator?", "Help me solve sample size calculator"],
        edgeCases: ["Very small populations Extreme proportions near 0 or 1 Invalid confidence levels"],
        calculate: (inputs) => {
            const e = (Number(inputs.marginErrorPct) || 5) / 100;
            const z = Number(inputs.confLevel) || 1.96;
            const p = (Number(inputs.populationProp) || 50) / 100;

            // Cochran's formula: n = (Z^2 * p * (1-p)) / e^2
            const n = (Math.pow(z, 2) * p * (1 - p)) / Math.pow(e, 2);
            const reqN = Math.ceil(n);

            return {
                primaryOutput: { label: 'Recommended Minimum Sample Size', value: reqN, suffix: 'Respondents' },
                secondaryMetrics: [
                    { label: 'Exact Unrounded n', value: n.toFixed(2) },
                    { label: 'Target Margin of Error', value: `± ${(e * 100).toFixed(1)}%` },
                    { label: 'Variance Product p(1-p)', value: (p * (1 - p)).toFixed(4) }
                ]
            };
        }
    },
    // 53. Correlation Coefficient Calculator (Pearson r)
    {
        id: 'correlation-coefficient-calculator',
        name: 'Correlation Coefficient Calculator',
        category: 'math-algebra',
        group: 'Statistics & Probability',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '15K',
        cpc: '$4.38',
        description: "A Correlation Coefficient Calculator measures the strength and direction of relationships between two variables. It helps identify linear associations in data. The calculator commonly computes Pearson correlation.",
        inputs: [
            { id: 'x1', name: 'Pair 1: X', type: 'number', defaultValue: 1, step: 0.1, tooltip: 'x1' },
            { id: 'y1', name: 'Pair 1: Y', type: 'number', defaultValue: 2, step: 0.1, tooltip: 'y1' },
            { id: 'x2', name: 'Pair 2: X', type: 'number', defaultValue: 2, step: 0.1, tooltip: 'x2' },
            { id: 'y2', name: 'Pair 2: Y', type: 'number', defaultValue: 5, step: 0.1, tooltip: 'y2' },
            { id: 'x3', name: 'Pair 3: X', type: 'number', defaultValue: 3, step: 0.1, tooltip: 'x3' },
            { id: 'y3', name: 'Pair 3: Y', type: 'number', defaultValue: 7, step: 0.1, tooltip: 'y3' },
            { id: 'x4', name: 'Pair 4: X', type: 'number', defaultValue: 4, step: 0.1, tooltip: 'x4' },
            { id: 'y4', name: 'Pair 4: Y', type: 'number', defaultValue: 9, step: 0.1, tooltip: 'y4' }
        ],
        naturalLanguageQueries: ["Calculate my correlation coefficient calculator", "What is my correlation coefficient calculator?", "Help me solve correlation coefficient calculator"],
        edgeCases: ["Different dataset lengths Zero variance variables Nonlinear relationships"],
        calculate: (inputs) => {
            const xs = [Number(inputs.x1) || 0, Number(inputs.x2) || 0, Number(inputs.x3) || 0, Number(inputs.x4) || 0];
            const ys = [Number(inputs.y1) || 0, Number(inputs.y2) || 0, Number(inputs.y3) || 0, Number(inputs.y4) || 0];
            const n = xs.length;

            const sumX = xs.reduce((a, b) => a + b, 0);
            const sumY = ys.reduce((a, b) => a + b, 0);
            const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0);
            const sumX2 = xs.reduce((acc, x) => acc + x * x, 0);
            const sumY2 = ys.reduce((acc, y) => acc + y * y, 0);

            const num = (n * sumXY) - (sumX * sumY);
            const den = Math.sqrt(((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY)));

            if (den === 0) return { primaryOutput: { label: 'Pearson r', value: 0 } };

            const r = num / den;
            const r2 = r * r;

            let strength = 'Strong Positive Correlation';
            if (r < -0.7) strength = 'Strong Negative Correlation';
            else if (r > 0.7) strength = 'Strong Positive Correlation';
            else if (r > 0.3) strength = 'Moderate Positive Correlation';
            else if (r < -0.3) strength = 'Moderate Negative Correlation';
            else strength = 'Weak / Negligible Correlation';

            return {
                primaryOutput: { label: 'Pearson Correlation Coefficient (r)', value: Number(r.toFixed(4)) },
                secondaryMetrics: [
                    { label: 'Coefficient of Determination (R²)', value: `${(r2 * 100).toFixed(2)}%` },
                    { label: 'Relationship Strength', value: strength }
                ]
            };
        }
    },
    // 54. Regression Calculator (Linear Regression)
    {
        id: 'regression-calculator',
        name: 'Regression Calculator',
        category: 'math-algebra',
        group: 'Statistics & Probability',
        bucket: 'Bucket B',
        tier: 4,
        phase: 4,
        monthlySearches: '4K',
        cpc: '$3.54',
        description: "A Regression Calculator fits mathematical models to data and estimates predictive relationships between variables. It is commonly used for forecasting and trend analysis. The calculator supports linear regression and optionally polynomial regression.",
        inputs: [
            { id: 'x1', name: 'X1', type: 'number', defaultValue: 1, step: 0.1, tooltip: 'x1' },
            { id: 'y1', name: 'Y1', type: 'number', defaultValue: 3, step: 0.1, tooltip: 'y1' },
            { id: 'x2', name: 'X2', type: 'number', defaultValue: 2, step: 0.1, tooltip: 'x2' },
            { id: 'y2', name: 'Y2', type: 'number', defaultValue: 5, step: 0.1, tooltip: 'y2' },
            { id: 'x3', name: 'X3', type: 'number', defaultValue: 3, step: 0.1, tooltip: 'x3' },
            { id: 'y3', name: 'Y3', type: 'number', defaultValue: 7, step: 0.1, tooltip: 'y3' },
            { id: 'x4', name: 'X4', type: 'number', defaultValue: 4, step: 0.1, tooltip: 'x4' },
            { id: 'y4', name: 'Y4', type: 'number', defaultValue: 10, step: 0.1, tooltip: 'y4' },
            { id: 'predX', name: 'Predict Y at X =', type: 'number', defaultValue: 5, step: 0.1, tooltip: 'Predict.' }
        ],
        naturalLanguageQueries: ["Calculate my regression calculator", "What is my regression calculator?", "Help me solve regression calculator"],
        edgeCases: ["Vertical-line datasets Insufficient observations Nonlinear relationships poorly fitted"],
        calculate: (inputs) => {
            const xs = [Number(inputs.x1) || 0, Number(inputs.x2) || 0, Number(inputs.x3) || 0, Number(inputs.x4) || 0];
            const ys = [Number(inputs.y1) || 0, Number(inputs.y2) || 0, Number(inputs.y3) || 0, Number(inputs.y4) || 0];
            const predX = Number(inputs.predX) || 5;
            const n = xs.length;

            const sumX = xs.reduce((a, b) => a + b, 0);
            const sumY = ys.reduce((a, b) => a + b, 0);
            const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0);
            const sumX2 = xs.reduce((acc, x) => acc + x * x, 0);

            const slope = ((n * sumXY) - (sumX * sumY)) / ((n * sumX2) - (sumX * sumX));
            const intercept = (sumY - (slope * sumX)) / n;
            const predictedY = (slope * predX) + intercept;

            return {
                primaryOutput: { label: 'Linear Regression Line', value: `y = ${slope.toFixed(3)}x ${intercept >= 0 ? '+ ' + intercept.toFixed(3) : '- ' + Math.abs(intercept).toFixed(3)}` },
                secondaryMetrics: [
                    { label: `Predicted Y at X = ${predX}`, value: predictedY.toFixed(3) },
                    { label: 'Slope (m)', value: slope.toFixed(4) },
                    { label: 'Y-Intercept (b)', value: intercept.toFixed(4) }
                ]
            };
        }
    },
    // 55. Margin of Error Calculator
    {
        id: 'margin-of-error-calculator',
        name: 'Margin of Error Calculator',
        category: 'math-algebra',
        group: 'Statistics & Probability',
        bucket: 'Bucket B',
        tier: 5,
        phase: 4,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "A Margin of Error Calculator estimates uncertainty in survey or sample estimates. It helps interpret polling and research reliability. The calculator is commonly paired with confidence intervals.",
        inputs: [
            { id: 'sampleSize', name: 'Sample Size (n)', type: 'number', defaultValue: 400, min: 10, step: 10, tooltip: 'Number of observations.' },
            { id: 'confLevel', name: 'Confidence Level', type: 'dropdown', defaultValue: 1.96, options: [{ label: '90% (Z = 1.645)', value: 1.645 }, { label: '95% (Z = 1.960)', value: 1.96 }, { label: '99% (Z = 2.576)', value: 2.576 }], tooltip: 'Confidence level.' }
        ],
        naturalLanguageQueries: ["Calculate my margin of error calculator", "What is my margin of error calculator?", "Help me solve margin of error calculator"],
        edgeCases: ["Small sample sizes Invalid confidence levels Extreme proportions"],
        calculate: (inputs) => {
            const n = Math.max(1, Number(inputs.sampleSize) || 400);
            const z = Number(inputs.confLevel) || 1.96;

            // Maximum margin of error for proportion p = 0.5: ME = Z * sqrt(0.25 / n)
            const me = z * Math.sqrt(0.25 / n);
            const mePct = me * 100;

            return {
                primaryOutput: { label: 'Margin of Error (ME)', value: `± ${mePct.toFixed(2)}%` },
                secondaryMetrics: [
                    { label: 'Decimal Margin of Error', value: `± ${me.toFixed(4)}` },
                    { label: 'Sample Size (n)', value: `${n} surveyed` }
                ]
            };
        }
    },
    // 56. Chi Square Calculator (Goodness of Fit)
    {
        id: 'chi-square-calculator',
        name: 'Chi Square Calculator',
        category: 'math-algebra',
        group: 'Statistics & Probability',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '15K',
        cpc: '$0.95',
        description: "A Chi Square Calculator performs chi-square statistical tests to evaluate categorical data relationships. It helps determine independence or goodness-of-fit. The calculator supports contingency tables.",
        inputs: [
            { id: 'o1', name: 'Category 1 Observed', type: 'number', defaultValue: 25, min: 0, step: 1, tooltip: 'O1' },
            { id: 'e1', name: 'Category 1 Expected', type: 'number', defaultValue: 20, min: 0.1, step: 1, tooltip: 'E1' },
            { id: 'o2', name: 'Category 2 Observed', type: 'number', defaultValue: 15, min: 0, step: 1, tooltip: 'O2' },
            { id: 'e2', name: 'Category 2 Expected', type: 'number', defaultValue: 20, min: 0.1, step: 1, tooltip: 'E2' },
            { id: 'o3', name: 'Category 3 Observed', type: 'number', defaultValue: 20, min: 0, step: 1, tooltip: 'O3' },
            { id: 'e3', name: 'Category 3 Expected', type: 'number', defaultValue: 20, min: 0.1, step: 1, tooltip: 'E3' }
        ],
        naturalLanguageQueries: ["Calculate my chi square calculator", "What is my chi square calculator?", "Help me solve chi square calculator"],
        edgeCases: ["Expected frequencies below 5 Missing categories Sparse contingency tables"],
        calculate: (inputs) => {
            const obs = [Number(inputs.o1) || 0, Number(inputs.o2) || 0, Number(inputs.o3) || 0];
            const exp = [Number(inputs.e1) || 1, Number(inputs.e2) || 1, Number(inputs.e3) || 1];

            let chi2 = 0;
            for (let i = 0; i < obs.length; i++) {
                const e = Math.max(0.001, exp[i]);
                chi2 += Math.pow(obs[i] - e, 2) / e;
            }
            const df = obs.length - 1;

            return {
                primaryOutput: { label: 'Chi-Square Statistic (χ²)', value: Number(chi2.toFixed(4)) },
                secondaryMetrics: [
                    { label: 'Degrees of Freedom (df)', value: String(df) },
                    { label: 'Critical Value (α = 0.05, df = 2)', value: '5.991' },
                    { label: 'Null Hypothesis Decision', value: chi2 > 5.991 ? 'Reject H₀ (Significant Difference)' : 'Fail to Reject H₀' }
                ]
            };
        }
    },
    // 57. ANOVA Calculator (One-Way ANOVA F-Test)
    {
        id: 'anova-calculator',
        name: 'ANOVA Calculator',
        category: 'math-algebra',
        group: 'Statistics & Probability',
        bucket: 'Bucket B',
        tier: 4,
        phase: 4,
        monthlySearches: '4K',
        cpc: '$2.25',
        description: "An ANOVA Calculator compares means across multiple groups to determine whether significant differences exist. It helps analyze experimental and observational data. The calculator commonly performs one-way ANOVA.",
        inputs: [
            { id: 'mean1', name: 'Group 1 Mean', type: 'number', defaultValue: 10, step: 0.1, tooltip: 'Mean 1.' },
            { id: 'var1', name: 'Group 1 Variance', type: 'number', defaultValue: 4, min: 0.01, step: 0.1, tooltip: 'Var 1.' },
            { id: 'mean2', name: 'Group 2 Mean', type: 'number', defaultValue: 14, step: 0.1, tooltip: 'Mean 2.' },
            { id: 'var2', name: 'Group 2 Variance', type: 'number', defaultValue: 5, min: 0.01, step: 0.1, tooltip: 'Var 2.' },
            { id: 'mean3', name: 'Group 3 Mean', type: 'number', defaultValue: 18, step: 0.1, tooltip: 'Mean 3.' },
            { id: 'var3', name: 'Group 3 Variance', type: 'number', defaultValue: 4.5, min: 0.01, step: 0.1, tooltip: 'Var 3.' },
            { id: 'nPerGroup', name: 'Sample Size per Group (n)', type: 'number', defaultValue: 10, min: 3, step: 1, tooltip: 'n each.' }
        ],
        naturalLanguageQueries: ["Calculate my anova calculator", "What is my anova calculator?", "Help me solve anova calculator"],
        edgeCases: ["Unequal variances Tiny group sizes Missing observations"],
        calculate: (inputs) => {
            const m1 = Number(inputs.mean1) || 10;
            const m2 = Number(inputs.mean2) || 14;
            const m3 = Number(inputs.mean3) || 18;
            const v1 = Number(inputs.var1) || 4;
            const v2 = Number(inputs.var2) || 5;
            const v3 = Number(inputs.var3) || 4.5;
            const n = Math.max(3, Number(inputs.nPerGroup) || 10);

            const grandMean = (m1 + m2 + m3) / 3;
            const msBetween = n * (Math.pow(m1 - grandMean, 2) + Math.pow(m2 - grandMean, 2) + Math.pow(m3 - grandMean, 2)) / 2;
            const msWithin = (v1 + v2 + v3) / 3;
            const fStat = msBetween / Math.max(0.0001, msWithin);

            return {
                primaryOutput: { label: 'ANOVA F-Statistic', value: Number(fStat.toFixed(4)) },
                secondaryMetrics: [
                    { label: 'Mean Square Between (MSB)', value: msBetween.toFixed(3) },
                    { label: 'Mean Square Within / Error (MSW)', value: msWithin.toFixed(3) },
                    { label: 'Grand Mean (x̄̄)', value: grandMean.toFixed(2) }
                ]
            };
        }
    },
    // 58. Quartile Calculator
    {
        id: 'quartile-calculator',
        name: 'Quartile Calculator',
        category: 'math-algebra',
        group: 'Statistics & Probability',
        bucket: 'Bucket B',
        tier: 4,
        phase: 4,
        monthlySearches: '4K',
        cpc: 'N/A',
        description: "A Quartile Calculator divides ordered datasets into four equal sections. It helps analyze data distribution and spread. The calculator computes Q1, Q2, and Q3 values.",
        inputs: [
            { id: 'v1', name: 'Val 1', type: 'number', defaultValue: 3, step: 0.1, tooltip: 'v1' },
            { id: 'v2', name: 'Val 2', type: 'number', defaultValue: 7, step: 0.1, tooltip: 'v2' },
            { id: 'v3', name: 'Val 3', type: 'number', defaultValue: 8, step: 0.1, tooltip: 'v3' },
            { id: 'v4', name: 'Val 4', type: 'number', defaultValue: 12, step: 0.1, tooltip: 'v4' },
            { id: 'v5', name: 'Val 5', type: 'number', defaultValue: 14, step: 0.1, tooltip: 'v5' },
            { id: 'v6', name: 'Val 6', type: 'number', defaultValue: 18, step: 0.1, tooltip: 'v6' },
            { id: 'v7', name: 'Val 7', type: 'number', defaultValue: 21, step: 0.1, tooltip: 'v7' }
        ],
        naturalLanguageQueries: ["Calculate my quartile calculator", "What is my quartile calculator?", "Help me solve quartile calculator"],
        edgeCases: ["Small datasets Duplicate values Different quartile conventions"],
        calculate: (inputs) => {
            const arr = [inputs.v1, inputs.v2, inputs.v3, inputs.v4, inputs.v5, inputs.v6, inputs.v7]
                .map(v => Number(v))
                .filter(v => !isNaN(v));

            const s = [...arr].sort((a, b) => a - b);
            const n = s.length;
            const q2 = s[Math.floor(n * 0.5)];
            const q1 = s[Math.floor(n * 0.25)];
            const q3 = s[Math.floor(n * 0.75)];

            return {
                primaryOutput: { label: 'Quartiles (Q1, Q2, Q3)', value: `Q1 = ${q1}, Q2 = ${q2}, Q3 = ${q3}` },
                secondaryMetrics: [
                    { label: 'Interquartile Range (IQR = Q3 - Q1)', value: String(q3 - q1) },
                    { label: 'Minimum & Maximum', value: `Min: ${s[0]}, Max: ${s[n - 1]}` }
                ]
            };
        }
    },
    // 59. Interquartile Range Calculator (IQR)
    {
        id: 'interquartile-range-calculator',
        name: 'Interquartile Range Calculator',
        category: 'math-algebra',
        group: 'Statistics & Probability',
        bucket: 'Bucket B',
        tier: 4,
        phase: 4,
        monthlySearches: '3K',
        cpc: 'N/A',
        description: "An Interquartile Range Calculator measures the spread of the middle 50% of data. It helps detect variability and outliers. The calculator is commonly used in boxplot analysis.",
        inputs: [
            { id: 'q1Val', name: 'First Quartile (Q1 - 25th Percentile)', type: 'number', defaultValue: 15, step: 0.1, tooltip: 'Q1.' },
            { id: 'q3Val', name: 'Third Quartile (Q3 - 75th Percentile)', type: 'number', defaultValue: 32, step: 0.1, tooltip: 'Q3.' }
        ],
        naturalLanguageQueries: ["Calculate my interquartile range calculator", "What is my interquartile range calculator?", "Help me solve interquartile range calculator"],
        edgeCases: ["Tiny datasets Identical values Multiple quartile methods"],
        calculate: (inputs) => {
            const q1 = Number(inputs.q1Val) || 15;
            const q3 = Number(inputs.q3Val) || 32;

            const iqr = q3 - q1;
            const lowerOutlier = q1 - (1.5 * iqr);
            const upperOutlier = q3 + (1.5 * iqr);

            return {
                primaryOutput: { label: 'Interquartile Range (IQR)', value: Number(iqr.toFixed(4)) },
                secondaryMetrics: [
                    { label: 'Lower Outlier Threshold (Q1 - 1.5·IQR)', value: String(Number(lowerOutlier.toFixed(2))) },
                    { label: 'Upper Outlier Threshold (Q3 + 1.5·IQR)', value: String(Number(upperOutlier.toFixed(2))) }
                ]
            };
        }
    },
    // 60. Bayes Theorem Calculator
    {
        id: 'bayes-theorem-calculator',
        name: 'Bayes Theorem Calculator',
        category: 'math-algebra',
        group: 'Statistics & Probability',
        bucket: 'Bucket B',
        tier: 5,
        phase: 5,
        monthlySearches: '480',
        cpc: '$3.05',
        description: "A Bayes Theorem Calculator computes conditional probabilities using prior probabilities and evidence likelihoods. It helps update probabilities based on new information. The calculator is widely used in statistics, machine learning, and medical testing.",
        inputs: [
            { id: 'priorA', name: 'Prior Probability: P(A)', type: 'percentage', defaultValue: 1.0, min: 0.01, max: 99.9, step: 0.1, suffix: '%', tooltip: 'Disease prevalence or baseline probability.' },
            { id: 'sensitivity', name: 'Sensitivity: P(B|A)', type: 'percentage', defaultValue: 95.0, min: 0.1, max: 100, step: 0.5, suffix: '%', tooltip: 'True positive rate.' },
            { id: 'falsePositiveRate', name: 'False Positive Rate: P(B|Not A)', type: 'percentage', defaultValue: 5.0, min: 0, max: 100, step: 0.5, suffix: '%', tooltip: 'Test positive when negative.' }
        ],
        naturalLanguageQueries: ["Calculate my bayes theorem calculator", "What is my bayes theorem calculator?", "Help me solve bayes theorem calculator"],
        edgeCases: ["Zero evidence probability Invalid probabilities outside range Tiny decimal precision issues"],
        calculate: (inputs) => {
            const pA = (Number(inputs.priorA) || 1.0) / 100;
            const pBGivenA = (Number(inputs.sensitivity) || 95.0) / 100;
            const pBGivenNotA = (Number(inputs.falsePositiveRate) || 5.0) / 100;
            const pNotA = 1 - pA;

            const pB = (pBGivenA * pA) + (pBGivenNotA * pNotA);
            const pAGivenB = (pBGivenA * pA) / Math.max(0.00001, pB);
            const pAGivenBPct = pAGivenB * 100;

            return {
                primaryOutput: { label: 'Posterior Probability P(A|B)', value: `${pAGivenBPct.toFixed(2)}%` },
                secondaryMetrics: [
                    { label: 'Total Probability P(B)', value: `${(pB * 100).toFixed(3)}%` },
                    { label: 'True Positive Contribution (P(B|A)·P(A))', value: `${(pBGivenA * pA * 100).toFixed(4)}%` },
                    { label: 'False Positive Contribution', value: `${(pBGivenNotA * pNotA * 100).toFixed(4)}%` }
                ]
            };
        }
    },
    // 61. Random Number Generator
    {
        id: 'random-number-generator',
        name: 'Random Number Generator',
        category: 'math-algebra',
        group: 'Statistics & Probability',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '3.4M',
        cpc: '$0.78',
        description: "A Random Number Generator produces random integers or decimal values within specified ranges. It is used in simulations, gaming, testing, and statistical sampling. The calculator may support pseudo-random and cryptographic randomness.",
        inputs: [
            { id: 'minVal', name: 'Minimum Bound', type: 'number', defaultValue: 1, step: 1, tooltip: 'Lower bound.' },
            { id: 'maxVal', name: 'Maximum Bound', type: 'number', defaultValue: 100, step: 1, tooltip: 'Upper bound.' },
            { id: 'sampleCount', name: 'Quantity of Numbers', type: 'number', defaultValue: 5, min: 1, max: 20, step: 1, tooltip: 'Count.' }
        ],
        naturalLanguageQueries: ["Calculate my random number generator", "What is my random number generator?", "Help me solve random number generator"],
        edgeCases: ["Minimum greater than maximum Quantity exceeding range without repeats Random seed predictability"],
        calculate: (inputs) => {
            const min = Math.floor(Number(inputs.minVal) || 1);
            const max = Math.floor(Number(inputs.maxVal) || 100);
            const count = Math.min(20, Math.max(1, Math.floor(Number(inputs.sampleCount) || 5)));

            const low = Math.min(min, max);
            const high = Math.max(min, max);

            const generated: number[] = [];
            for (let i = 0; i < count; i++) {
                generated.push(Math.floor(Math.random() * (high - low + 1)) + low);
            }

            const sum = generated.reduce((a, b) => a + b, 0);

            return {
                primaryOutput: { label: 'Generated Random Numbers', value: generated.join(', ') },
                secondaryMetrics: [
                    { label: 'Sum of Generated Numbers', value: String(sum) },
                    { label: 'Average of Sample', value: (sum / count).toFixed(2) },
                    { label: 'Range Bounds', value: `[${low}, ${high}]` }
                ]
            };
        }
    },
    // 62. Dice Roller
    {
        id: 'dice-roller',
        name: 'Dice Roller',
        category: 'math-algebra',
        group: 'Statistics & Probability',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '823K',
        cpc: '$0.38',
        description: "A Dice Roller simulates rolling physical dice for games, probability exercises, and randomization tasks. It supports multiple dice types and quantities. The calculator is commonly used in tabletop gaming and education.",
        inputs: [
            { id: 'diceCount', name: 'Number of Dice', type: 'number', defaultValue: 2, min: 1, max: 10, step: 1, tooltip: 'How many dice.' },
            { id: 'dieSides', name: 'Sides per Die', type: 'dropdown', defaultValue: 6, options: [{ label: 'd4 (4-sided)', value: 4 }, { label: 'd6 (6-sided standard)', value: 6 }, { label: 'd8 (8-sided)', value: 8 }, { label: 'd10 (10-sided)', value: 10 }, { label: 'd12 (12-sided)', value: 12 }, { label: 'd20 (20-sided D&D)', value: 20 }, { label: 'd100 (Percentile)', value: 100 }], tooltip: 'Die geometry.' },
            { id: 'modifier', name: 'Roll Modifier (+ / -)', type: 'number', defaultValue: 0, step: 1, tooltip: 'Added to total.' }
        ],
        naturalLanguageQueries: ["Calculate my dice roller", "What is my dice roller?", "Help me solve dice roller"],
        edgeCases: ["Invalid dice sides Negative dice counts Extremely large roll simulations"],
        calculate: (inputs) => {
            const count = Math.min(10, Math.max(1, Math.floor(Number(inputs.diceCount) || 2)));
            const sides = Math.max(2, Math.floor(Number(inputs.dieSides) || 6));
            const mod = Number(inputs.modifier) || 0;

            const rolls: number[] = [];
            for (let i = 0; i < count; i++) {
                rolls.push(Math.floor(Math.random() * sides) + 1);
            }

            const rawSum = rolls.reduce((a, b) => a + b, 0);
            const total = rawSum + mod;
            const expectedAvg = (count * (sides + 1) / 2) + mod;

            return {
                primaryOutput: { label: 'Total Roll Sum', value: total },
                secondaryMetrics: [
                    { label: 'Individual Dice Rolls', value: rolls.join(', ') },
                    { label: 'Theoretical Average', value: expectedAvg.toFixed(1) },
                    { label: 'Possible Range', value: `${count + mod} to ${count * sides + mod}` }
                ]
            };
        }
    },
    // 63. Triangle Calculator
    {
        id: 'triangle-calculator',
        name: 'Triangle Calculator',
        category: 'math-algebra',
        group: 'Geometry & Measurement',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '90K',
        cpc: '$0.76',
        description: "A Triangle Calculator computes unknown sides, angles, area, perimeter, and other properties of a triangle based on known inputs. It supports multiple triangle-solving methods including SSS, SAS, ASA, AAS, and right-triangle configurations. The calculator is commonly used in geometry, construction, engineering, and trigonometry.",
        inputs: [
            { id: 'sideA', name: 'Side a', type: 'number', defaultValue: 6, min: 0.1, step: 0.1, tooltip: 'Side a.' },
            { id: 'sideB', name: 'Side b', type: 'number', defaultValue: 8, min: 0.1, step: 0.1, tooltip: 'Side b.' },
            { id: 'sideC', name: 'Side c', type: 'number', defaultValue: 10, min: 0.1, step: 0.1, tooltip: 'Side c.' }
        ],
        naturalLanguageQueries: ["Calculate my triangle calculator", "What is my triangle calculator?", "Help me solve triangle calculator"],
        edgeCases: ["Invalid triangle inequality Ambiguous SSA cases Negative side lengths Degenerate triangles"],
        calculate: (inputs) => {
            const a = Number(inputs.sideA) || 6;
            const b = Number(inputs.sideB) || 8;
            const c = Number(inputs.sideC) || 10;

            if (a + b <= c || a + c <= b || b + c <= a) {
                return { primaryOutput: { label: 'Result', value: 'Error: Triangle inequality violated (sum of 2 sides must exceed 3rd)' } };
            }

            const perimeter = a + b + c;
            const s = perimeter / 2;
            const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));

            // Angles via Law of Cosines
            const angleA = Math.acos(Math.max(-1, Math.min(1, (b * b + c * c - a * a) / (2 * b * c)))) * (180 / Math.PI);
            const angleB = Math.acos(Math.max(-1, Math.min(1, (a * a + c * c - b * b) / (2 * a * c)))) * (180 / Math.PI);
            const angleC = 180 - angleA - angleB;

            return {
                primaryOutput: { label: "Triangle Area (Heron's Formula)", value: Number(area.toFixed(4)), suffix: 'sq units' },
                secondaryMetrics: [
                    { label: 'Perimeter', value: `${perimeter} units` },
                    { label: 'Semi-Perimeter (s)', value: `${s} units` },
                    { label: 'Angles (A, B, C)', value: `∠A: ${angleA.toFixed(1)}°, ∠B: ${angleB.toFixed(1)}°, ∠C: ${angleC.toFixed(1)}°` }
                ]
            };
        }
    },
    // 64. Right Triangle Calculator
    {
        id: 'right-triangle-calculator',
        name: 'Right Triangle Calculator',
        category: 'math-algebra',
        group: 'Geometry & Measurement',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '60K',
        cpc: '$1.27',
        description: "A Right Triangle Calculator computes unknown sides, angles, area, and perimeter for right-angled triangles. It simplifies calculations involving trigonometry and the Pythagorean theorem. The calculator supports side-angle and side-side solving methods.",
        inputs: [
            { id: 'legA', name: 'Leg a (Base)', type: 'number', defaultValue: 3, min: 0.1, step: 0.1, tooltip: 'Base leg.' },
            { id: 'legB', name: 'Leg b (Height)', type: 'number', defaultValue: 4, min: 0.1, step: 0.1, tooltip: 'Height leg.' }
        ],
        naturalLanguageQueries: ["Calculate my right triangle calculator", "What is my right triangle calculator?", "Help me solve right triangle calculator"],
        edgeCases: ["Invalid side combinations Hypotenuse shorter than leg Zero-length sides"],
        calculate: (inputs) => {
            const a = Number(inputs.legA) || 3;
            const b = Number(inputs.legB) || 4;

            const c = Math.sqrt((a * a) + (b * b));
            const area = 0.5 * a * b;
            const perimeter = a + b + c;
            const alpha = Math.atan(a / b) * (180 / Math.PI);
            const beta = 90 - alpha;

            return {
                primaryOutput: { label: 'Hypotenuse (c = √(a² + b²))', value: Number(c.toFixed(4)), suffix: 'units' },
                secondaryMetrics: [
                    { label: 'Right Triangle Area', value: `${area.toFixed(2)} sq units` },
                    { label: 'Perimeter', value: `${perimeter.toFixed(2)} units` },
                    { label: 'Acute Angles (α, β)', value: `α = ${alpha.toFixed(2)}°, β = ${beta.toFixed(2)}°` }
                ]
            };
        }
    },
    // 65. Pythagorean Theorem Calculator
    {
        id: 'pythagorean-theorem-calculator',
        name: 'Pythagorean Theorem Calculator',
        category: 'math-algebra',
        group: 'Geometry & Measurement',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '50K',
        cpc: '$1.37',
        description: "A Pythagorean Theorem Calculator computes missing side lengths in right triangles using the Pythagorean theorem. It is commonly used in geometry, navigation, and engineering. The calculator supports solving for either a leg or hypotenuse.",
        inputs: [
            { id: 'solveFor', name: 'Solve For', type: 'dropdown', defaultValue: 'c', options: [{ label: 'Hypotenuse c (given a and b)', value: 'c' }, { label: 'Leg a (given b and c)', value: 'a' }], tooltip: 'Target side.' },
            { id: 'side1', name: 'Side 1 (a or b)', type: 'number', defaultValue: 5, min: 0.1, step: 0.1, tooltip: 'First given side.' },
            { id: 'side2', name: 'Side 2 (b or c)', type: 'number', defaultValue: 12, min: 0.1, step: 0.1, tooltip: 'Second given side.' }
        ],
        naturalLanguageQueries: ["Calculate my pythagorean theorem calculator", "What is my pythagorean theorem calculator?", "Help me solve pythagorean theorem calculator"],
        edgeCases: ["Negative side lengths Impossible side relationships Zero values"],
        calculate: (inputs) => {
            const s = String(inputs.solveFor || 'c');
            const v1 = Number(inputs.side1) || 5;
            const v2 = Number(inputs.side2) || 12;

            if (s === 'c') {
                const c = Math.sqrt((v1 * v1) + (v2 * v2));
                return {
                    primaryOutput: { label: 'Hypotenuse (c)', value: Number(c.toFixed(4)), suffix: 'units' },
                    secondaryMetrics: [
                        { label: 'Formula Calculation', value: `c = √(${v1}² + ${v2}²) = √${v1 * v1 + v2 * v2}` },
                        { label: 'Area', value: `${(0.5 * v1 * v2).toFixed(2)} sq units` }
                    ]
                };
            } else {
                const b = v1;
                const c = v2;
                if (c <= b) return { primaryOutput: { label: 'Result', value: 'Error: Hypotenuse c must be strictly greater than leg b' } };
                const a = Math.sqrt((c * c) - (b * b));
                return {
                    primaryOutput: { label: 'Missing Leg (a)', value: Number(a.toFixed(4)), suffix: 'units' },
                    secondaryMetrics: [
                        { label: 'Formula Calculation', value: `a = √(${c}² - ${b}²) = √${c * c - b * b}` },
                        { label: 'Area', value: `${(0.5 * a * b).toFixed(2)} sq units` }
                    ]
                };
            }
        }
    },
    // 66. Circle Calculator
    {
        id: 'circle-calculator',
        name: 'Circle Calculator',
        category: 'math-algebra',
        group: 'Geometry & Measurement',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '15K',
        cpc: '$4.91',
        description: "A Circle Calculator computes radius, diameter, circumference, and area using any known circle measurement. It helps solve geometric and engineering problems. The calculator automatically derives missing circle properties.",
        inputs: [
            { id: 'radius', name: 'Circle Radius (r)', type: 'number', defaultValue: 5, min: 0.01, step: 0.1, tooltip: 'Radius of circle.' }
        ],
        naturalLanguageQueries: ["Calculate my circle calculator", "What is my circle calculator?", "Help me solve circle calculator"],
        edgeCases: ["Negative radii Extremely large precision requirements Zero radius"],
        calculate: (inputs) => {
            const r = Math.max(0.001, Number(inputs.radius) || 5);

            const d = 2 * r;
            const area = Math.PI * r * r;
            const circ = 2 * Math.PI * r;

            return {
                primaryOutput: { label: 'Circle Area (A = πr²)', value: Number(area.toFixed(4)), suffix: 'sq units' },
                secondaryMetrics: [
                    { label: 'Circumference (C = 2πr)', value: `${circ.toFixed(4)} units` },
                    { label: 'Diameter (d = 2r)', value: `${d} units` },
                    { label: 'Semicircle Area', value: `${(area / 2).toFixed(4)} sq units` }
                ]
            };
        }
    },
    // 67. Area Calculator
    {
        id: 'area-calculator',
        name: 'Area Calculator',
        category: 'math-algebra',
        group: 'Geometry & Measurement',
        bucket: 'Bucket C1',
        tier: 2,
        phase: 2,
        monthlySearches: '90K',
        cpc: '$0.12',
        description: "An Area Calculator computes surface area for 2D geometric shapes including rectangles, triangles, circles, trapezoids, and polygons. It helps solve geometry and construction problems. The calculator supports multiple shape types.",
        inputs: [
            { id: 'shape', name: 'Geometric Shape', type: 'dropdown', defaultValue: 'rectangle', options: [{ label: 'Rectangle (Length × Width)', value: 'rectangle' }, { label: 'Triangle (½ × Base × Height)', value: 'triangle' }, { label: 'Circle (π × r²)', value: 'circle' }, { label: 'Trapezoid (½ × (a+b) × h)', value: 'trapezoid' }, { label: 'Ellipse (π × a × b)', value: 'ellipse' }], tooltip: 'Shape.' },
            { id: 'dim1', name: 'Primary Dimension (Length / Base / Radius / a)', type: 'number', defaultValue: 8, min: 0.1, step: 0.1, tooltip: 'Primary dim.' },
            { id: 'dim2', name: 'Secondary Dimension (Width / Height / b)', type: 'number', defaultValue: 5, min: 0.1, step: 0.1, tooltip: 'Secondary dim.' }
        ],
        naturalLanguageQueries: ["Calculate my area calculator", "What is my area calculator?", "Help me solve area calculator"],
        edgeCases: ["Missing required dimensions Negative measurements Unit inconsistencies"],
        calculate: (inputs) => {
            const s = String(inputs.shape || 'rectangle');
            const d1 = Number(inputs.dim1) || 8;
            const d2 = Number(inputs.dim2) || 5;

            let area = 0;
            let formula = '';
            if (s === 'rectangle') { area = d1 * d2; formula = `${d1} × ${d2}`; }
            else if (s === 'triangle') { area = 0.5 * d1 * d2; formula = `0.5 × ${d1} × ${d2}`; }
            else if (s === 'circle') { area = Math.PI * d1 * d1; formula = `π × ${d1}²`; }
            else if (s === 'trapezoid') { area = 0.5 * (d1 + d2) * 4; formula = `0.5 × (${d1} + ${d2}) × h`; }
            else if (s === 'ellipse') { area = Math.PI * d1 * d2; formula = `π × ${d1} × ${d2}`; }

            return {
                primaryOutput: { label: 'Calculated Surface Area', value: Number(area.toFixed(4)), suffix: 'sq units' },
                secondaryMetrics: [
                    { label: 'Shape Type', value: s.toUpperCase() },
                    { label: 'Formula Applied', value: formula }
                ]
            };
        }
    },
    // 68. Volume Calculator
    {
        id: 'volume-calculator',
        name: 'Volume Calculator',
        category: 'math-algebra',
        group: 'Geometry & Measurement',
        bucket: 'Bucket C1',
        tier: 1,
        phase: 1,
        monthlySearches: '110K',
        cpc: '$0.81',
        description: "A Volume Calculator computes 3D space occupied by geometric solids such as cubes, cylinders, cones, spheres, and prisms. It is widely used in engineering, manufacturing, and education. The calculator supports multiple solid types.",
        inputs: [
            { id: 'solidShape', name: '3D Solid Shape', type: 'dropdown', defaultValue: 'box', options: [{ label: 'Rectangular Box / Prism (l × w × h)', value: 'box' }, { label: 'Cylinder (π × r² × h)', value: 'cylinder' }, { label: 'Sphere (4/3 × π × r³)', value: 'sphere' }, { label: 'Cone (1/3 × π × r² × h)', value: 'cone' }], tooltip: 'Solid geometry.' },
            { id: 'dim1', name: 'Dimension 1 (Length / Radius r)', type: 'number', defaultValue: 6, min: 0.1, step: 0.1, tooltip: 'Dimension 1.' },
            { id: 'dim2', name: 'Dimension 2 (Width / Height h)', type: 'number', defaultValue: 4, min: 0.1, step: 0.1, tooltip: 'Dimension 2.' },
            { id: 'dim3', name: 'Dimension 3 (Height h for Box)', type: 'number', defaultValue: 5, min: 0.1, step: 0.1, tooltip: 'Dimension 3.' }
        ],
        naturalLanguageQueries: ["Calculate my volume calculator", "What is my volume calculator?", "Help me solve volume calculator"],
        edgeCases: ["Negative dimensions Zero-height solids Unit conversion mismatches"],
        calculate: (inputs) => {
            const s = String(inputs.solidShape || 'box');
            const d1 = Number(inputs.dim1) || 6;
            const d2 = Number(inputs.dim2) || 4;
            const d3 = Number(inputs.dim3) || 5;

            let vol = 0;
            if (s === 'box') vol = d1 * d2 * d3;
            else if (s === 'cylinder') vol = Math.PI * d1 * d1 * d2;
            else if (s === 'sphere') vol = (4 / 3) * Math.PI * Math.pow(d1, 3);
            else if (s === 'cone') vol = (1 / 3) * Math.PI * d1 * d1 * d2;

            return {
                primaryOutput: { label: 'Total Volume', value: Number(vol.toFixed(4)), suffix: 'cubic units' },
                secondaryMetrics: [
                    { label: 'Volume in Liters (if dimensions in cm)', value: `${(vol / 1000).toFixed(4)} L` },
                    { label: 'Volume in Gallons (approx)', value: `${(vol / 3785.41).toFixed(4)} gal` }
                ]
            };
        }
    },
    // 69. Surface Area Calculator
    {
        id: 'surface-area-calculator',
        name: 'Surface Area Calculator',
        category: 'math-algebra',
        group: 'Geometry & Measurement',
        bucket: 'Bucket C1',
        tier: 3,
        phase: 3,
        monthlySearches: '15K',
        cpc: '$0.70',
        description: "A Surface Area Calculator computes exterior area of 3D solids. It helps estimate covering material, paint, insulation, and manufacturing requirements. The calculator supports common geometric solids.",
        inputs: [
            { id: 'solidShape', name: '3D Solid Shape', type: 'dropdown', defaultValue: 'cylinder', options: [{ label: 'Cylinder (2πr² + 2πrh)', value: 'cylinder' }, { label: 'Sphere (4πr²)', value: 'sphere' }, { label: 'Rectangular Box (2(lw+lh+wh))', value: 'box' }, { label: 'Cube (6s²)', value: 'cube' }], tooltip: 'Solid geometry.' },
            { id: 'radiusOrL', name: 'Radius (r) or Length (l) or Side (s)', type: 'number', defaultValue: 4, min: 0.1, step: 0.1, tooltip: 'Primary size.' },
            { id: 'heightOrW', name: 'Height (h) or Width (w)', type: 'number', defaultValue: 10, min: 0.1, step: 0.1, tooltip: 'Secondary size.' },
            { id: 'depthH', name: 'Box Height (h)', type: 'number', defaultValue: 6, min: 0.1, step: 0.1, tooltip: 'Box height.' }
        ],
        naturalLanguageQueries: ["Calculate my surface area calculator", "What is my surface area calculator?", "Help me solve surface area calculator"],
        edgeCases: ["Missing dimensions Negative radii or heights Extremely large values"],
        calculate: (inputs) => {
            const s = String(inputs.solidShape || 'cylinder');
            const d1 = Number(inputs.radiusOrL) || 4;
            const d2 = Number(inputs.heightOrW) || 10;
            const d3 = Number(inputs.depthH) || 6;

            let sa = 0;
            if (s === 'cylinder') sa = 2 * Math.PI * d1 * (d1 + d2);
            else if (s === 'sphere') sa = 4 * Math.PI * d1 * d1;
            else if (s === 'box') sa = 2 * ((d1 * d2) + (d1 * d3) + (d2 * d3));
            else if (s === 'cube') sa = 6 * d1 * d1;

            return {
                primaryOutput: { label: 'Total Surface Area', value: Number(sa.toFixed(4)), suffix: 'sq units' },
                secondaryMetrics: [
                    { label: 'Solid Geometry', value: s.toUpperCase() },
                    { label: 'Formula Form', value: s === 'cylinder' ? '2πr(r + h)' : (s === 'sphere' ? '4πr²' : '2(lw + lh + wh)') }
                ]
            };
        }
    },
    // 70. Distance Calculator (2D and 3D Euclidean Distance)
    {
        id: 'distance-calculator',
        name: 'Distance Calculator',
        category: 'math-algebra',
        group: 'Geometry & Measurement',
        bucket: 'Bucket C1',
        tier: 1,
        phase: 1,
        monthlySearches: '135K',
        cpc: '$0.23',
        description: "A Distance Calculator computes the distance between two points in 2D or 3D coordinate systems. It helps solve geometry, navigation, and mapping problems. The calculator supports Euclidean distance.",
        inputs: [
            { id: 'x1', name: 'Point 1: x₁', type: 'number', defaultValue: 2, step: 0.1, tooltip: 'x1' },
            { id: 'y1', name: 'Point 1: y₁', type: 'number', defaultValue: 3, step: 0.1, tooltip: 'y1' },
            { id: 'z1', name: 'Point 1: z₁ (3D)', type: 'number', defaultValue: 0, step: 0.1, tooltip: 'z1' },
            { id: 'x2', name: 'Point 2: x₂', type: 'number', defaultValue: 6, step: 0.1, tooltip: 'x2' },
            { id: 'y2', name: 'Point 2: y₂', type: 'number', defaultValue: 7, step: 0.1, tooltip: 'y2' },
            { id: 'z2', name: 'Point 2: z₂ (3D)', type: 'number', defaultValue: 0, step: 0.1, tooltip: 'z2' }
        ],
        naturalLanguageQueries: ["Calculate my distance calculator", "What is my distance calculator?", "Help me solve distance calculator"],
        edgeCases: ["Identical points Invalid coordinates Precision rounding issues"],
        calculate: (inputs) => {
            const x1 = Number(inputs.x1) || 0, y1 = Number(inputs.y1) || 0, z1 = Number(inputs.z1) || 0;
            const x2 = Number(inputs.x2) || 0, y2 = Number(inputs.y2) || 0, z2 = Number(inputs.z2) || 0;

            const dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
            const dist2D = Math.sqrt((dx * dx) + (dy * dy));
            const dist3D = Math.sqrt((dx * dx) + (dy * dy) + (dz * dz));
            const manhattan = Math.abs(dx) + Math.abs(dy) + Math.abs(dz);

            return {
                primaryOutput: { label: 'Euclidean Distance (d)', value: Number((dz === 0 ? dist2D : dist3D).toFixed(4)), suffix: 'units' },
                secondaryMetrics: [
                    { label: '2D Distance (xy-plane)', value: `${dist2D.toFixed(4)} units` },
                    { label: 'Manhattan / Taxicab Distance', value: `${manhattan} units` },
                    { label: 'Midpoint Coordinates', value: `(${((x1 + x2) / 2).toFixed(2)}, ${((y1 + y2) / 2).toFixed(2)}, ${((z1 + z2) / 2).toFixed(2)})` }
                ]
            };
        }
    },
    // 71. Ratio Calculator
    {
        id: 'ratio-calculator',
        name: 'Ratio Calculator',
        category: 'math-algebra',
        group: 'Geometry & Measurement',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '90K',
        cpc: '$1.13',
        description: "A Ratio Calculator simplifies ratios and computes proportional relationships between values. It helps solve scaling, mixture, and comparison problems. The calculator supports ratio simplification and missing-term solving.",
        inputs: [
            { id: 'ratioA', name: 'Ratio A', type: 'number', defaultValue: 16, step: 0.1, tooltip: 'A' },
            { id: 'ratioB', name: 'Ratio B', type: 'number', defaultValue: 9, step: 0.1, tooltip: 'B' },
            { id: 'scaledA', name: 'Solve Proportion: If A =', type: 'number', defaultValue: 1920, step: 1, tooltip: 'New A to solve for new B.' }
        ],
        naturalLanguageQueries: ["Calculate my ratio calculator", "What is my ratio calculator?", "Help me solve ratio calculator"],
        edgeCases: ["Zero denominators Negative ratios Decimal precision issues"],
        calculate: (inputs) => {
            const a = Number(inputs.ratioA) || 16;
            const b = Number(inputs.ratioB) || 9;
            const targetA = Number(inputs.scaledA) || 1920;

            if (a === 0) return { primaryOutput: { label: 'Result', value: 'Error: Ratio A cannot be 0' } };

            const scaledB = (targetA * b) / a;

            const gcd = (x: number, y: number): number => y ? gcd(y, x % y) : Math.abs(x);
            const g = gcd(Math.round(a), Math.round(b));
            const simA = Math.round(a) / (g || 1);
            const simB = Math.round(b) / (g || 1);

            return {
                primaryOutput: { label: 'Scaled Result B', value: Number(scaledB.toFixed(2)) },
                secondaryMetrics: [
                    { label: 'Simplified Base Ratio', value: `${simA} : ${simB}` },
                    { label: 'Decimal Equivalent (A ÷ B)', value: (a / b).toFixed(4) },
                    { label: 'Percentage Distribution', value: `${((a / (a + b)) * 100).toFixed(1)}% A / ${((b / (a + b)) * 100).toFixed(1)}% B` }
                ]
            };
        }
    },
    // 72. Perimeter Calculator
    {
        id: 'perimeter-calculator',
        name: 'Perimeter Calculator',
        category: 'math-algebra',
        group: 'Geometry & Measurement',
        bucket: 'Bucket C1',
        tier: 3,
        phase: 3,
        monthlySearches: '5K',
        cpc: '$0.55',
        description: "A Perimeter Calculator computes boundary lengths of geometric shapes. It helps solve fencing, framing, and geometric measurement problems. The calculator supports polygons and curved shapes.",
        inputs: [
            { id: 'shape', name: 'Geometric Figure', type: 'dropdown', defaultValue: 'rectangle', options: [{ label: 'Rectangle (2l + 2w)', value: 'rectangle' }, { label: 'Circle / Circumference (2πr)', value: 'circle' }, { label: 'Triangle (a + b + c)', value: 'triangle' }, { label: 'Regular Polygon (n × side)', value: 'polygon' }], tooltip: 'Shape.' },
            { id: 'side1', name: 'Dimension 1 (Length / Radius / Side a / Num Sides)', type: 'number', defaultValue: 12, min: 0.1, step: 0.1, tooltip: 'Dim 1.' },
            { id: 'side2', name: 'Dimension 2 (Width / Side b / Side Length)', type: 'number', defaultValue: 8, min: 0.1, step: 0.1, tooltip: 'Dim 2.' },
            { id: 'side3', name: 'Dimension 3 (Side c for Triangle)', type: 'number', defaultValue: 10, min: 0.1, step: 0.1, tooltip: 'Dim 3.' }
        ],
        naturalLanguageQueries: ["Calculate my perimeter calculator", "What is my perimeter calculator?", "Help me solve perimeter calculator"],
        edgeCases: ["Negative side lengths Missing dimensions Degenerate polygons"],
        calculate: (inputs) => {
            const s = String(inputs.shape || 'rectangle');
            const d1 = Number(inputs.side1) || 12;
            const d2 = Number(inputs.side2) || 8;
            const d3 = Number(inputs.side3) || 10;

            let p = 0;
            if (s === 'rectangle') p = 2 * (d1 + d2);
            else if (s === 'circle') p = 2 * Math.PI * d1;
            else if (s === 'triangle') p = d1 + d2 + d3;
            else if (s === 'polygon') p = d1 * d2;

            return {
                primaryOutput: { label: 'Total Perimeter', value: Number(p.toFixed(4)), suffix: 'units' },
                secondaryMetrics: [
                    { label: 'Shape Form', value: s.toUpperCase() },
                    { label: 'Semi-Perimeter', value: `${(p / 2).toFixed(4)} units` }
                ]
            };
        }
    },
    // 73. Diagonal Calculator
    {
        id: 'diagonal-calculator',
        name: 'Diagonal Calculator',
        category: 'math-algebra',
        group: 'Geometry & Measurement',
        bucket: 'Bucket C1',
        tier: 3,
        phase: 3,
        monthlySearches: '10K',
        cpc: '$0.23',
        description: "A Diagonal Calculator computes diagonal lengths of rectangles, squares, cubes, and prisms. It helps solve geometry and engineering layout problems. The calculator commonly uses the Pythagorean theorem.",
        inputs: [
            { id: 'width', name: 'Width (w)', type: 'number', defaultValue: 16, min: 0.1, step: 0.1, tooltip: 'Width.' },
            { id: 'height', name: 'Height (h)', type: 'number', defaultValue: 9, min: 0.1, step: 0.1, tooltip: 'Height.' },
            { id: 'depth', name: 'Depth (d, 0 for 2D screen/box)', type: 'number', defaultValue: 0, min: 0, step: 0.1, tooltip: '3D depth.' }
        ],
        naturalLanguageQueries: ["Calculate my diagonal calculator", "What is my diagonal calculator?", "Help me solve diagonal calculator"],
        edgeCases: ["Negative dimensions Zero values Precision rounding issues"],
        calculate: (inputs) => {
            const w = Number(inputs.width) || 16;
            const h = Number(inputs.height) || 9;
            const d = Number(inputs.depth) || 0;

            const diag2D = Math.sqrt((w * w) + (h * h));
            const diag3D = Math.sqrt((w * w) + (h * h) + (d * d));

            return {
                primaryOutput: { label: d > 0 ? '3D Space Diagonal' : '2D Screen / Box Diagonal', value: Number((d > 0 ? diag3D : diag2D).toFixed(4)), suffix: 'units/inches' },
                secondaryMetrics: [
                    { label: '2D Diagonal √(w² + h²)', value: `${diag2D.toFixed(4)} units` },
                    { label: 'Aspect Ratio Angle', value: `${(Math.atan(h / w) * (180 / Math.PI)).toFixed(2)}°` }
                ]
            };
        }
    },
    // 74. Polygon Calculator (Regular n-Gon)
    {
        id: 'polygon-calculator',
        name: 'Polygon Calculator',
        category: 'math-algebra',
        group: 'Geometry & Measurement',
        bucket: 'Bucket C1',
        tier: 4,
        phase: 4,
        monthlySearches: '1K',
        cpc: '$4.86',
        description: "A Polygon Calculator computes interior angles, perimeter, area, and diagonals for regular polygons. It helps analyze geometric properties of multi-sided figures. The calculator supports regular polygons primarily.",
        inputs: [
            { id: 'sidesN', name: 'Number of Sides (n)', type: 'number', defaultValue: 6, min: 3, max: 100, step: 1, tooltip: 'Polygon sides.' },
            { id: 'sideLengthS', name: 'Side Length (s)', type: 'number', defaultValue: 5, min: 0.1, step: 0.1, tooltip: 'Length of each side.' }
        ],
        naturalLanguageQueries: ["Calculate my polygon calculator", "What is my polygon calculator?", "Help me solve polygon calculator"],
        edgeCases: ["Fewer than 3 sides Negative side lengths Non-regular polygon limitations"],
        calculate: (inputs) => {
            const n = Math.max(3, Math.floor(Number(inputs.sidesN) || 6));
            const s = Number(inputs.sideLengthS) || 5;

            const perimeter = n * s;
            const interiorAngle = ((n - 2) * 180) / n;
            const apothem = s / (2 * Math.tan(Math.PI / n));
            const area = 0.5 * perimeter * apothem;

            return {
                primaryOutput: { label: 'Regular Polygon Area', value: Number(area.toFixed(4)), suffix: 'sq units' },
                secondaryMetrics: [
                    { label: 'Perimeter', value: `${perimeter} units` },
                    { label: 'Interior Angle', value: `${interiorAngle.toFixed(2)}°` },
                    { label: 'Apothem (Inradius r)', value: `${apothem.toFixed(4)} units` },
                    { label: 'Circumradius (R)', value: `${(s / (2 * Math.sin(Math.PI / n))).toFixed(4)} units` }
                ]
            };
        }
    },
    // 75. Ellipse Calculator
    {
        id: 'ellipse-calculator',
        name: 'Ellipse Calculator',
        category: 'math-algebra',
        group: 'Geometry & Measurement',
        bucket: 'Bucket C1',
        tier: 4,
        phase: 4,
        monthlySearches: '2K',
        cpc: 'N/A',
        description: "An Ellipse Calculator computes area, circumference approximation, eccentricity, and focal distances of ellipses. It helps solve geometry and orbital mechanics problems. The calculator supports standard ellipse equations.",
        inputs: [
            { id: 'semiMajorA', name: 'Semi-Major Axis (a)', type: 'number', defaultValue: 8, min: 0.1, step: 0.1, tooltip: 'Semi-major radius.' },
            { id: 'semiMinorB', name: 'Semi-Minor Axis (b)', type: 'number', defaultValue: 5, min: 0.1, step: 0.1, tooltip: 'Semi-minor radius.' }
        ],
        naturalLanguageQueries: ["Calculate my ellipse calculator", "What is my ellipse calculator?", "Help me solve ellipse calculator"],
        edgeCases: ["Minor axis larger than major axis Negative radii Circular special case where a=b"],
        calculate: (inputs) => {
            const a = Number(inputs.semiMajorA) || 8;
            const b = Number(inputs.semiMinorB) || 5;

            const area = Math.PI * a * b;
            // Ramanujan's perimeter approximation
            const h = Math.pow(a - b, 2) / Math.pow(a + b, 2);
            const perimeter = Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
            const ecc = Math.sqrt(1 - (b * b) / (a * a));

            return {
                primaryOutput: { label: 'Ellipse Area (A = πab)', value: Number(area.toFixed(4)), suffix: 'sq units' },
                secondaryMetrics: [
                    { label: 'Perimeter (Ramanujan Approx)', value: `${perimeter.toFixed(4)} units` },
                    { label: 'Eccentricity (e)', value: ecc.toFixed(4) },
                    { label: 'Focal Distance (c = √(a² - b²))', value: `${Math.sqrt(a * a - b * b).toFixed(4)} units` }
                ]
            };
        }
    },
    // 76. Cylinder Calculator
    {
        id: 'cylinder-calculator',
        name: 'Cylinder Calculator',
        category: 'math-algebra',
        group: 'Geometry & Measurement',
        bucket: 'Bucket C1',
        tier: 3,
        phase: 3,
        monthlySearches: '5K',
        cpc: 'N/A',
        description: "A Cylinder Calculator computes volume, surface area, and lateral area for cylindrical solids. It helps solve manufacturing, storage, and geometry problems. The calculator supports right circular cylinders.",
        inputs: [
            { id: 'radius', name: 'Base Radius (r)', type: 'number', defaultValue: 4, min: 0.1, step: 0.1, tooltip: 'Radius.' },
            { id: 'height', name: 'Height (h)', type: 'number', defaultValue: 10, min: 0.1, step: 0.1, tooltip: 'Height.' }
        ],
        naturalLanguageQueries: ["Calculate my cylinder calculator", "What is my cylinder calculator?", "Help me solve cylinder calculator"],
        edgeCases: ["Negative dimensions Zero radius or height Unit inconsistencies"],
        calculate: (inputs) => {
            const r = Number(inputs.radius) || 4;
            const h = Number(inputs.height) || 10;

            const volume = Math.PI * r * r * h;
            const lateralArea = 2 * Math.PI * r * h;
            const topBottomArea = 2 * Math.PI * r * r;
            const totalSA = lateralArea + topBottomArea;

            return {
                primaryOutput: { label: 'Cylinder Volume (V = πr²h)', value: Number(volume.toFixed(4)), suffix: 'cubic units' },
                secondaryMetrics: [
                    { label: 'Total Surface Area', value: `${totalSA.toFixed(4)} sq units` },
                    { label: 'Lateral Curved Surface Area', value: `${lateralArea.toFixed(4)} sq units` },
                    { label: 'Base Circle Area', value: `${(Math.PI * r * r).toFixed(4)} sq units` }
                ]
            };
        }
    },
    // 77. Cone Calculator
    {
        id: 'cone-calculator',
        name: 'Cone Calculator',
        category: 'math-algebra',
        group: 'Geometry & Measurement',
        bucket: 'Bucket C1',
        tier: 4,
        phase: 4,
        monthlySearches: '4K',
        cpc: 'N/A',
        description: "A Cone Calculator computes volume, slant height, and surface area for conical solids. It helps solve engineering and geometric problems. The calculator supports right circular cones.",
        inputs: [
            { id: 'radius', name: 'Base Radius (r)', type: 'number', defaultValue: 3, min: 0.1, step: 0.1, tooltip: 'Radius.' },
            { id: 'height', name: 'Height (h)', type: 'number', defaultValue: 7, min: 0.1, step: 0.1, tooltip: 'Height.' }
        ],
        naturalLanguageQueries: ["Calculate my cone calculator", "What is my cone calculator?", "Help me solve cone calculator"],
        edgeCases: ["Negative radius or height Zero dimensions Precision rounding"],
        calculate: (inputs) => {
            const r = Number(inputs.radius) || 3;
            const h = Number(inputs.height) || 7;

            const slant = Math.sqrt((r * r) + (h * h));
            const volume = (1 / 3) * Math.PI * r * r * h;
            const lateralSA = Math.PI * r * slant;
            const totalSA = Math.PI * r * (r + slant);

            return {
                primaryOutput: { label: 'Cone Volume (V = ⅓πr²h)', value: Number(volume.toFixed(4)), suffix: 'cubic units' },
                secondaryMetrics: [
                    { label: 'Slant Height (s = √(r² + h²))', value: `${slant.toFixed(4)} units` },
                    { label: 'Total Surface Area', value: `${totalSA.toFixed(4)} sq units` },
                    { label: 'Lateral Area', value: `${lateralSA.toFixed(4)} sq units` }
                ]
            };
        }
    },
    // 78. Sphere Calculator
    {
        id: 'sphere-calculator',
        name: 'Sphere Calculator',
        category: 'math-algebra',
        group: 'Geometry & Measurement',
        bucket: 'Bucket C1',
        tier: 4,
        phase: 4,
        monthlySearches: '2K',
        cpc: 'N/A',
        description: "A Sphere Calculator computes volume, surface area, circumference, and diameter of spheres. It helps solve geometry, astronomy, and physics problems. The calculator derives all sphere properties from any known measurement.",
        inputs: [
            { id: 'radius', name: 'Sphere Radius (r)', type: 'number', defaultValue: 6, min: 0.1, step: 0.1, tooltip: 'Radius.' }
        ],
        naturalLanguageQueries: ["Calculate my sphere calculator", "What is my sphere calculator?", "Help me solve sphere calculator"],
        edgeCases: ["Negative radius Zero sphere size Precision limitations"],
        calculate: (inputs) => {
            const r = Number(inputs.radius) || 6;

            const vol = (4 / 3) * Math.PI * Math.pow(r, 3);
            const sa = 4 * Math.PI * r * r;
            const hemiVol = vol / 2;

            return {
                primaryOutput: { label: 'Sphere Volume (V = ⁴⁄₃πr³)', value: Number(vol.toFixed(4)), suffix: 'cubic units' },
                secondaryMetrics: [
                    { label: 'Total Surface Area (4πr²)', value: `${sa.toFixed(4)} sq units` },
                    { label: 'Hemisphere Volume', value: `${hemiVol.toFixed(4)} cubic units` },
                    { label: 'Diameter', value: `${2 * r} units` }
                ]
            };
        }
    },
    // 79. Rectangular Prism Calculator
    {
        id: 'rectangular-prism-calculator',
        name: 'Rectangular Prism Calculator',
        category: 'math-algebra',
        group: 'Geometry & Measurement',
        bucket: 'Bucket C1',
        tier: 4,
        phase: 4,
        monthlySearches: '2K',
        cpc: 'N/A',
        description: "A Rectangular Prism Calculator computes volume, surface area, and space diagonal of rectangular boxes. It helps solve packaging, construction, and geometry problems. The calculator supports cuboids and boxes.",
        inputs: [
            { id: 'length', name: 'Length (l)', type: 'number', defaultValue: 8, min: 0.1, step: 0.1, tooltip: 'Length.' },
            { id: 'width', name: 'Width (w)', type: 'number', defaultValue: 5, min: 0.1, step: 0.1, tooltip: 'Width.' },
            { id: 'height', name: 'Height (h)', type: 'number', defaultValue: 4, min: 0.1, step: 0.1, tooltip: 'Height.' }
        ],
        naturalLanguageQueries: ["Calculate my rectangular prism calculator", "What is my rectangular prism calculator?", "Help me solve rectangular prism calculator"],
        edgeCases: ["Negative dimensions Flat prism with zero height Unit mismatch"],
        calculate: (inputs) => {
            const l = Number(inputs.length) || 8;
            const w = Number(inputs.width) || 5;
            const h = Number(inputs.height) || 4;

            const volume = l * w * h;
            const sa = 2 * ((l * w) + (l * h) + (w * h));
            const diag = Math.sqrt((l * l) + (w * w) + (h * h));

            return {
                primaryOutput: { label: 'Prism Volume (V = l·w·h)', value: Number(volume.toFixed(4)), suffix: 'cubic units' },
                secondaryMetrics: [
                    { label: 'Total Surface Area', value: `${sa} sq units` },
                    { label: 'Space Diagonal √(l² + w² + h²)', value: `${diag.toFixed(4)} units` }
                ]
            };
        }
    },
    // 80. Trapezoid Calculator
    {
        id: 'trapezoid-calculator',
        name: 'Trapezoid Calculator',
        category: 'math-algebra',
        group: 'Geometry & Measurement',
        bucket: 'Bucket C1',
        tier: 5,
        phase: 4,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "A Trapezoid Calculator computes area, perimeter, height, and side lengths of trapezoids. It helps solve geometry and construction layout problems. The calculator supports isosceles and general trapezoids.",
        inputs: [
            { id: 'baseA', name: 'Top Base (a)', type: 'number', defaultValue: 6, min: 0.1, step: 0.1, tooltip: 'Parallel base a.' },
            { id: 'baseB', name: 'Bottom Base (b)', type: 'number', defaultValue: 10, min: 0.1, step: 0.1, tooltip: 'Parallel base b.' },
            { id: 'heightH', name: 'Height (h)', type: 'number', defaultValue: 5, min: 0.1, step: 0.1, tooltip: 'Perpendicular height.' }
        ],
        naturalLanguageQueries: ["Calculate my trapezoid calculator", "What is my trapezoid calculator?", "Help me solve trapezoid calculator"],
        edgeCases: ["Negative lengths Impossible side combinations Zero height"],
        calculate: (inputs) => {
            const a = Number(inputs.baseA) || 6;
            const b = Number(inputs.baseB) || 10;
            const h = Number(inputs.heightH) || 5;

            const area = 0.5 * (a + b) * h;
            const midSegment = (a + b) / 2;

            return {
                primaryOutput: { label: 'Trapezoid Area (A = ½(a+b)h)', value: Number(area.toFixed(4)), suffix: 'sq units' },
                secondaryMetrics: [
                    { label: 'Median / Midsegment Length', value: `${midSegment.toFixed(2)} units` },
                    { label: 'Formula Calculation', value: `½ × (${a} + ${b}) × ${h} = ${area.toFixed(2)}` }
                ]
            };
        }
    },
    // 81. Parallelogram Calculator
    {
        id: 'parallelogram-calculator',
        name: 'Parallelogram Calculator',
        category: 'math-algebra',
        group: 'Geometry & Measurement',
        bucket: 'Bucket C1',
        tier: 4,
        phase: 4,
        monthlySearches: '1K',
        cpc: 'N/A',
        description: "A Parallelogram Calculator computes area, perimeter, side lengths, and heights of parallelograms. It helps solve geometry and engineering problems. The calculator supports angle-based calculations.",
        inputs: [
            { id: 'baseB', name: 'Base (b)', type: 'number', defaultValue: 12, min: 0.1, step: 0.1, tooltip: 'Base length.' },
            { id: 'heightH', name: 'Height (h)', type: 'number', defaultValue: 7, min: 0.1, step: 0.1, tooltip: 'Perpendicular height.' },
            { id: 'sideA', name: 'Side (a)', type: 'number', defaultValue: 9, min: 0.1, step: 0.1, tooltip: 'Adjacent side length.' }
        ],
        naturalLanguageQueries: ["Calculate my parallelogram calculator", "What is my parallelogram calculator?", "Help me solve parallelogram calculator"],
        edgeCases: ["Invalid angles Negative dimensions Zero height"],
        calculate: (inputs) => {
            const b = Number(inputs.baseB) || 12;
            const h = Number(inputs.heightH) || 7;
            const a = Number(inputs.sideA) || 9;

            const area = b * h;
            const perimeter = 2 * (a + b);
            const angleDeg = h <= a ? Math.asin(h / a) * (180 / Math.PI) : 90;

            return {
                primaryOutput: { label: 'Parallelogram Area (A = b·h)', value: Number(area.toFixed(4)), suffix: 'sq units' },
                secondaryMetrics: [
                    { label: 'Perimeter (2(a + b))', value: `${perimeter} units` },
                    { label: 'Corner Angle', value: `${angleDeg.toFixed(2)}°` }
                ]
            };
        }
    },
    // 82. Half Life Calculator
    {
        id: 'half-life-calculator',
        name: 'Half Life Calculator',
        category: 'math-algebra',
        group: 'Geometry & Measurement',
        bucket: 'Bucket B',
        tier: 3,
        phase: 5,
        monthlySearches: '5K',
        cpc: 'N/A',
        description: "A Half Life Calculator estimates remaining quantity of a substance after radioactive decay or exponential reduction. It helps solve chemistry, physics, pharmacology, and finance problems. The calculator supports exponential decay modeling.",
        inputs: [
            { id: 'initialQuantity', name: 'Initial Quantity (N₀)', type: 'number', defaultValue: 100, min: 0.001, step: 0.1, suffix: 'units/g', tooltip: 'Starting mass or count.' },
            { id: 'halfLife', name: 'Half-Life Duration (t½)', type: 'number', defaultValue: 5730, min: 0.0001, step: 1, suffix: 'yrs/days', tooltip: 'Time to decay 50%.' },
            { id: 'elapsedTime', name: 'Elapsed Time (t)', type: 'number', defaultValue: 11460, min: 0, step: 1, suffix: 'yrs/days', tooltip: 'Time passed.' }
        ],
        naturalLanguageQueries: ["Calculate my half life calculator", "What is my half life calculator?", "Help me solve half life calculator"],
        edgeCases: ["Zero or negative half-life Negative elapsed time Extremely large decay durations"],
        calculate: (inputs) => {
            const n0 = Number(inputs.initialQuantity) || 100;
            const tHalf = Math.max(0.0001, Number(inputs.halfLife) || 5730);
            const t = Number(inputs.elapsedTime) || 0;

            const halfLivesPassed = t / tHalf;
            const remaining = n0 * Math.pow(0.5, halfLivesPassed);
            const decayed = n0 - remaining;
            const decayConstant = Math.LN2 / tHalf;

            return {
                primaryOutput: { label: 'Remaining Quantity N(t)', value: Number(remaining.toFixed(4)), suffix: 'units' },
                secondaryMetrics: [
                    { label: 'Percentage Remaining', value: `${((remaining / n0) * 100).toFixed(2)}%` },
                    { label: 'Decayed Amount', value: `${decayed.toFixed(4)} units` },
                    { label: 'Half-Lives Elapsed', value: `${halfLivesPassed.toFixed(2)} half-lives` },
                    { label: 'Decay Constant (λ)', value: decayConstant.toExponential(4) }
                ]
            };
        }
    },
    // 83. Binary Calculator
    {
        id: 'binary-calculator',
        name: 'Binary Calculator',
        category: 'math-algebra',
        group: 'Number Systems',
        bucket: 'Bucket B',
        tier: 2,
        phase: 3,
        monthlySearches: '27K',
        cpc: '$2.07',
        description: "A Binary Calculator performs arithmetic operations using binary (base-2) numbers. It supports addition, subtraction, multiplication, division, bitwise operations, and binary conversions used in computer science and digital electronics. The calculator helps programmers, engineers, and students understand low-level numeric computation.",
        inputs: [
            { id: 'bin1', name: 'First Binary Number', type: 'number', defaultValue: 1010, step: 1, tooltip: 'Binary 0s and 1s.' },
            { id: 'operation', name: 'Operation', type: 'dropdown', defaultValue: 'add', options: [{ label: 'ADD (+)', value: 'add' }, { label: 'SUBTRACT (-)', value: 'sub' }, { label: 'MULTIPLY (×)', value: 'mul' }, { label: 'AND (&)', value: 'and' }, { label: 'OR (|)', value: 'or' }, { label: 'XOR (^)', value: 'xor' }], tooltip: 'Operation.' },
            { id: 'bin2', name: 'Second Binary Number', type: 'number', defaultValue: 1100, step: 1, tooltip: 'Binary 0s and 1s.' }
        ],
        naturalLanguageQueries: ["Calculate my binary calculator", "What is my binary calculator?", "Help me solve binary calculator"],
        edgeCases: ["Invalid binary digits Overflow in fixed-bit signed mode Division by zero Leading zero normalization"],
        calculate: (inputs) => {
            const str1 = String(inputs.bin1 || '0').trim();
            const str2 = String(inputs.bin2 || '0').trim();
            const op = String(inputs.operation || 'add');

            const dec1 = parseInt(str1, 2);
            const dec2 = parseInt(str2, 2);

            if (isNaN(dec1) || isNaN(dec2)) {
                return { primaryOutput: { label: 'Result', value: 'Error: Inputs must contain only 0s and 1s' } };
            }

            let resDec = 0;
            if (op === 'add') resDec = dec1 + dec2;
            else if (op === 'sub') resDec = dec1 - dec2;
            else if (op === 'mul') resDec = dec1 * dec2;
            else if (op === 'and') resDec = dec1 & dec2;
            else if (op === 'or') resDec = dec1 | dec2;
            else if (op === 'xor') resDec = dec1 ^ dec2;

            const resBin = (resDec >>> 0).toString(2);

            return {
                primaryOutput: { label: 'Binary Result', value: resBin },
                secondaryMetrics: [
                    { label: 'Decimal Equivalent', value: String(resDec) },
                    { label: 'Hexadecimal Equivalent', value: `0x${(resDec >>> 0).toString(16).toUpperCase()}` },
                    { label: 'Input 1 in Decimal', value: String(dec1) },
                    { label: 'Input 2 in Decimal', value: String(dec2) }
                ]
            };
        }
    },
    // 84. Hex Calculator
    {
        id: 'hex-calculator',
        name: 'Hex Calculator',
        category: 'math-algebra',
        group: 'Number Systems',
        bucket: 'Bucket B',
        tier: 5,
        phase: 3,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "A Hex Calculator performs arithmetic and bitwise operations using hexadecimal (base-16) numbers. It helps developers and engineers work with memory addresses, machine code, and color values. The calculator supports conversion between hexadecimal, decimal, binary, and octal.",
        inputs: [
            { id: 'hex1', name: 'First Hex Value (0-9, A-F)', type: 'dropdown', defaultValue: '2F', options: [{ label: '2F (47 dec)', value: '2F' }, { label: 'FF (255 dec)', value: 'FF' }, { label: '1A4 (420 dec)', value: '1A4' }, { label: '80 (128 dec)', value: '80' }, { label: 'C0 (192 dec)', value: 'C0' }], tooltip: 'Hex string.' },
            { id: 'operation', name: 'Operation', type: 'dropdown', defaultValue: 'add', options: [{ label: 'ADD (+)', value: 'add' }, { label: 'SUBTRACT (-)', value: 'sub' }, { label: 'MULTIPLY (×)', value: 'mul' }], tooltip: 'Operation.' },
            { id: 'hex2', name: 'Second Hex Value (0-9, A-F)', type: 'dropdown', defaultValue: 'A3', options: [{ label: 'A3 (163 dec)', value: 'A3' }, { label: '10 (16 dec)', value: '10' }, { label: '5B (91 dec)', value: '5B' }, { label: '7F (127 dec)', value: '7F' }], tooltip: 'Hex string.' }
        ],
        naturalLanguageQueries: ["Calculate my hex calculator", "What is my hex calculator?", "Help me solve hex calculator"],
        edgeCases: ["Invalid hex characters Negative hexadecimal representation Overflow for fixed-width systems"],
        calculate: (inputs) => {
            const h1 = String(inputs.hex1 || '0').trim();
            const h2 = String(inputs.hex2 || '0').trim();
            const op = String(inputs.operation || 'add');

            const d1 = parseInt(h1, 16);
            const d2 = parseInt(h2, 16);

            if (isNaN(d1) || isNaN(d2)) return { primaryOutput: { label: 'Result', value: 'Invalid Hex Input' } };

            let resDec = 0;
            if (op === 'add') resDec = d1 + d2;
            else if (op === 'sub') resDec = d1 - d2;
            else if (op === 'mul') resDec = d1 * d2;

            const resHex = (resDec >>> 0).toString(16).toUpperCase();
            const resBin = (resDec >>> 0).toString(2);

            return {
                primaryOutput: { label: 'Hexadecimal Result', value: `0x${resHex}` },
                secondaryMetrics: [
                    { label: 'Decimal Equivalent', value: String(resDec) },
                    { label: 'Binary Equivalent', value: resBin },
                    { label: 'Input 1 Decimal', value: String(d1) },
                    { label: 'Input 2 Decimal', value: String(d2) }
                ]
            };
        }
    },
    // 85. Octal Calculator
    {
        id: 'octal-calculator',
        name: 'Octal Calculator',
        category: 'math-algebra',
        group: 'Number Systems',
        bucket: 'Bucket B',
        tier: 4,
        phase: 5,
        monthlySearches: '1K',
        cpc: 'N/A',
        description: "An Octal Calculator performs arithmetic operations using octal (base-8) numbers. It is commonly used in legacy computing systems and Unix permission representations. The calculator supports conversions between octal, decimal, binary, and hexadecimal.",
        inputs: [
            { id: 'oct1', name: 'First Octal Number (0-7)', type: 'number', defaultValue: 75, step: 1, tooltip: 'Base 8 number.' },
            { id: 'operation', name: 'Operation', type: 'dropdown', defaultValue: 'add', options: [{ label: 'ADD (+)', value: 'add' }, { label: 'SUBTRACT (-)', value: 'sub' }], tooltip: 'Operation.' },
            { id: 'oct2', name: 'Second Octal Number (0-7)', type: 'number', defaultValue: 32, step: 1, tooltip: 'Base 8 number.' }
        ],
        naturalLanguageQueries: ["Calculate my octal calculator", "What is my octal calculator?", "Help me solve octal calculator"],
        edgeCases: ["Invalid octal digits Division by zero Leading zero ambiguity"],
        calculate: (inputs) => {
            const o1 = String(inputs.oct1 || '0').trim();
            const o2 = String(inputs.oct2 || '0').trim();
            const op = String(inputs.operation || 'add');

            const d1 = parseInt(o1, 8);
            const d2 = parseInt(o2, 8);

            if (isNaN(d1) || isNaN(d2)) return { primaryOutput: { label: 'Result', value: 'Error: Digits must be between 0 and 7' } };

            const resDec = op === 'add' ? d1 + d2 : d1 - d2;
            const resOct = (resDec >>> 0).toString(8);

            return {
                primaryOutput: { label: 'Octal Result', value: resOct },
                secondaryMetrics: [
                    { label: 'Decimal Equivalent', value: String(resDec) },
                    { label: 'Binary Equivalent', value: (resDec >>> 0).toString(2) }
                ]
            };
        }
    },
    // 86. Decimal to Binary Calculator
    {
        id: 'decimal-to-binary-calculator',
        name: 'Decimal to Binary Calculator',
        category: 'math-algebra',
        group: 'Number Systems',
        bucket: 'Bucket B',
        tier: 2,
        phase: 3,
        monthlySearches: '22K',
        cpc: '$7.89  ★ HIGH CPC',
        description: "A Decimal to Binary Calculator converts decimal integers into binary representation. It helps users understand how computers internally represent numeric values. The calculator supports positive and negative integers.",
        inputs: [
            { id: 'decNum', name: 'Decimal Integer (Base 10)', type: 'number', defaultValue: 156, step: 1, tooltip: 'Decimal value.' }
        ],
        naturalLanguageQueries: ["Calculate my decimal to binary calculator", "What is my decimal to binary calculator?", "Help me solve decimal to binary calculator"],
        edgeCases: ["Zero division errors", "Negative inputs where not defined", "Boundary values"],
        calculate: (inputs) => {
            const d = Math.floor(Number(inputs.decNum) || 0);

            const binStr = (d >>> 0).toString(2);
            const hexStr = (d >>> 0).toString(16).toUpperCase();
            const octStr = (d >>> 0).toString(8);

            return {
                primaryOutput: { label: 'Binary Representation (Base 2)', value: binStr },
                secondaryMetrics: [
                    { label: 'Hexadecimal (Base 16)', value: `0x${hexStr}` },
                    { label: 'Octal (Base 8)', value: octStr },
                    { label: 'Bit Length', value: `${binStr.length} bits` }
                ]
            };
        }
    },
    // 87. Binary to Decimal Calculator
    {
        id: 'binary-to-decimal-calculator',
        name: 'Binary to Decimal Calculator',
        category: 'math-algebra',
        group: 'Number Systems',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '18K',
        cpc: '$15.23  ★ HIGH CPC',
        description: "A Binary to Decimal Calculator converts binary numbers into decimal representation. It helps interpret binary machine values in human-readable form. The calculator supports signed and unsigned binary interpretation.",
        inputs: [
            { id: 'binaryStr', name: 'Binary String (Base 2)', type: 'number', defaultValue: 1100100, step: 1, tooltip: 'Binary string.' }
        ],
        naturalLanguageQueries: ["Calculate my binary to decimal calculator", "What is my binary to decimal calculator?", "Help me solve binary to decimal calculator"],
        edgeCases: ["Zero division errors", "Negative inputs where not defined", "Boundary values"],
        calculate: (inputs) => {
            const str = String(inputs.binaryStr || '0').trim();
            const dec = parseInt(str, 2);

            if (isNaN(dec)) return { primaryOutput: { label: 'Result', value: 'Error: Input must contain only 0s and 1s' } };

            return {
                primaryOutput: { label: 'Decimal Value (Base 10)', value: dec },
                secondaryMetrics: [
                    { label: 'Hexadecimal', value: `0x${dec.toString(16).toUpperCase()}` },
                    { label: 'Octal', value: dec.toString(8) },
                    { label: 'Bit Count', value: `${str.length} bits` }
                ]
            };
        }
    },
    // 88. Binary to Hex Calculator
    {
        id: 'binary-to-hex-calculator',
        name: 'Binary to Hex Calculator',
        category: 'math-algebra',
        group: 'Number Systems',
        bucket: 'Bucket B',
        tier: 4,
        phase: 4,
        monthlySearches: '2K',
        cpc: 'N/A',
        description: "A Binary to Hex Calculator converts binary numbers into hexadecimal notation. It helps programmers, students, and engineers work with low-level computer representations efficiently. The calculator supports large binary values and signed/unsigned interpretations.",
        inputs: [
            { id: 'binString', name: 'Binary Input (e.g. 11110000)', type: 'number', defaultValue: 11110000, step: 1, tooltip: 'Binary.' }
        ],
        naturalLanguageQueries: ["Calculate my binary to hex calculator", "What is my binary to hex calculator?", "Help me solve binary to hex calculator"],
        edgeCases: ["Invalid binary characters Empty input Overflow in signed interpretation"],
        calculate: (inputs) => {
            const str = String(inputs.binString || '0').trim();
            const dec = parseInt(str, 2);
            if (isNaN(dec)) return { primaryOutput: { label: 'Result', value: 'Invalid Binary' } };

            const hex = dec.toString(16).toUpperCase();

            return {
                primaryOutput: { label: 'Hexadecimal Output', value: `0x${hex}` },
                secondaryMetrics: [
                    { label: 'Decimal Form', value: String(dec) },
                    { label: 'Nibble Count (Hex Digits)', value: `${hex.length} hex digits` }
                ]
            };
        }
    },
    // 89. Hex to Binary Calculator
    {
        id: 'hex-to-binary-calculator',
        name: 'Hex to Binary Calculator',
        category: 'math-algebra',
        group: 'Number Systems',
        bucket: 'Bucket B',
        tier: 4,
        phase: 4,
        monthlySearches: '2K',
        cpc: 'N/A',
        description: "A Hex to Binary Calculator converts hexadecimal numbers into binary format. It is useful for low-level computing, memory visualization, and digital electronics. The calculator expands each hexadecimal digit into 4 binary bits.",
        inputs: [
            { id: 'hexInput', name: 'Hex Value', type: 'dropdown', defaultValue: 'A5', options: [{ label: 'A5', value: 'A5' }, { label: 'FF', value: 'FF' }, { label: '1C', value: '1C' }, { label: '3E8', value: '3E8' }, { label: 'DEAD', value: 'DEAD' }], tooltip: 'Hex string.' }
        ],
        naturalLanguageQueries: ["Calculate my hex to binary calculator", "What is my hex to binary calculator?", "Help me solve hex to binary calculator"],
        edgeCases: ["Invalid hex characters Case-insensitive parsing Leading zero preservation"],
        calculate: (inputs) => {
            const hex = String(inputs.hexInput || 'A5').trim();
            const dec = parseInt(hex, 16);
            if (isNaN(dec)) return { primaryOutput: { label: 'Result', value: 'Invalid Hex' } };

            const bin = dec.toString(2);

            return {
                primaryOutput: { label: 'Binary Output', value: bin },
                secondaryMetrics: [
                    { label: 'Decimal Equivalent', value: String(dec) },
                    { label: 'Bit Length', value: `${bin.length} bits` }
                ]
            };
        }
    },
    // 90. ASCII to Binary Calculator
    {
        id: 'ascii-to-binary-calculator',
        name: 'ASCII to Binary Calculator',
        category: 'math-algebra',
        group: 'Number Systems',
        bucket: 'Bucket B',
        tier: 5,
        phase: 5,
        monthlySearches: '720',
        cpc: '$14.63  ★ HIGH CPC',
        description: "An ASCII to Binary Calculator converts text characters into ASCII binary encoding. It helps users understand text encoding and binary communication systems. The calculator supports standard ASCII and optionally UTF-8.",
        inputs: [
            { id: 'asciiWord', name: 'Word / Text Preset', type: 'dropdown', defaultValue: 'Hello', options: [{ label: 'Hello', value: 'Hello' }, { label: 'Code', value: 'Code' }, { label: 'Math', value: 'Math' }, { label: 'AI', value: 'AI' }, { label: 'Solve', value: 'Solve' }], tooltip: 'ASCII text.' }
        ],
        naturalLanguageQueries: ["Calculate my ascii to binary calculator", "What is my ascii to binary calculator?", "Help me solve ascii to binary calculator"],
        edgeCases: ["Zero division errors", "Negative inputs where not defined", "Boundary values"],
        calculate: (inputs) => {
            const text = String(inputs.asciiWord || 'Hello');

            const binaryList: string[] = [];
            const hexList: string[] = [];
            for (let i = 0; i < text.length; i++) {
                const code = text.charCodeAt(i);
                binaryList.push(code.toString(2).padStart(8, '0'));
                hexList.push(code.toString(16).toUpperCase().padStart(2, '0'));
            }

            return {
                primaryOutput: { label: '8-Bit Binary Representation', value: binaryList.join(' ') },
                secondaryMetrics: [
                    { label: 'Hex Encoded ASCII', value: hexList.join(' ') },
                    { label: 'Byte Count', value: `${text.length} Bytes (${text.length * 8} Bits)` }
                ]
            };
        }
    },
    // 91. Number Base Converter
    {
        id: 'number-base-converter',
        name: 'Number Base Converter',
        category: 'math-algebra',
        group: 'Number Systems',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '8K',
        cpc: 'N/A',
        description: "A Number Base Converter converts numeric values between different numeral systems such as binary, decimal, octal, and hexadecimal. It helps programmers and students work across multiple number representations. The calculator supports arbitrary base conversion.",
        inputs: [
            { id: 'inputNumber', name: 'Input Integer Number', type: 'number', defaultValue: 255, step: 1, tooltip: 'Number value.' },
            { id: 'fromBase', name: 'From Base (2-36)', type: 'dropdown', defaultValue: 10, options: [{ label: 'Base 10 (Decimal)', value: 10 }, { label: 'Base 2 (Binary)', value: 2 }, { label: 'Base 8 (Octal)', value: 8 }, { label: 'Base 16 (Hexadecimal)', value: 16 }], tooltip: 'Source base.' },
            { id: 'toBase', name: 'To Base (2-36)', type: 'dropdown', defaultValue: 16, options: [{ label: 'Base 16 (Hexadecimal)', value: 16 }, { label: 'Base 2 (Binary)', value: 2 }, { label: 'Base 8 (Octal)', value: 8 }, { label: 'Base 10 (Decimal)', value: 10 }], tooltip: 'Target base.' }
        ],
        naturalLanguageQueries: ["Calculate my number base converter", "What is my number base converter?", "Help me solve number base converter"],
        edgeCases: ["Invalid digits for chosen base Bases outside supported range Fractional base conversions"],
        calculate: (inputs) => {
            const numStr = String(inputs.inputNumber || '255').trim();
            const fromB = Number(inputs.fromBase) || 10;
            const toB = Number(inputs.toBase) || 16;

            const dec = parseInt(numStr, fromB);
            if (isNaN(dec)) return { primaryOutput: { label: 'Result', value: `Invalid Number for Base ${fromB}` } };

            const converted = dec.toString(toB).toUpperCase();

            return {
                primaryOutput: { label: `Converted Value in Base ${toB}`, value: converted },
                secondaryMetrics: [
                    { label: 'Decimal Equivalent (Base 10)', value: String(dec) },
                    { label: 'Binary (Base 2)', value: dec.toString(2) }
                ]
            };
        }
    },
    // 92. Roman Numeral Converter
    {
        id: 'roman-numeral-converter',
        name: 'Roman Numeral Converter',
        category: 'math-algebra',
        group: 'Number Systems',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '60K',
        cpc: '$0.05',
        description: "A Roman Numeral Converter converts decimal numbers into Roman numerals and vice versa. It helps students, historians, and developers work with classical numbering systems. The calculator supports standard Roman numeral rules.",
        inputs: [
            { id: 'arabicNum', name: 'Arabic Integer (1 to 3999)', type: 'number', defaultValue: 2026, min: 1, max: 3999, step: 1, tooltip: 'Integer 1-3999.' }
        ],
        naturalLanguageQueries: ["Calculate my roman numeral converter", "What is my roman numeral converter?", "Help me solve roman numeral converter"],
        edgeCases: ["Invalid Roman numeral sequences Numbers above standard Roman limits Lowercase input handling"],
        calculate: (inputs) => {
            let n = Math.min(3999, Math.max(1, Math.floor(Number(inputs.arabicNum) || 2026)));

            const valMap: [number, string][] = [
                [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
                [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
                [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
            ];

            let roman = '';
            let remaining = n;
            for (const [v, sym] of valMap) {
                while (remaining >= v) {
                    roman += sym;
                    remaining -= v;
                }
            }

            return {
                primaryOutput: { label: 'Roman Numeral', value: roman },
                secondaryMetrics: [
                    { label: 'Input Arabic Number', value: String(n) },
                    { label: 'Character Count', value: `${roman.length} symbols` }
                ]
            };
        }
    },
    // 93. Base64 Encode Decode
    {
        id: 'base64-encode-decode',
        name: 'Base64 Encode Decode',
        category: 'math-algebra',
        group: 'Number Systems',
        bucket: 'Bucket B',
        tier: 4,
        phase: 4,
        monthlySearches: '2K',
        cpc: '$0.23',
        description: "A Base64 Encode/Decode calculator converts binary or text data into Base64 format and back. It helps safely transmit binary data through text-based systems such as APIs, emails, and JSON payloads. The calculator follows RFC 4648 Base64 standards.",
        inputs: [
            { id: 'textString', name: 'Text Preset / String', type: 'dropdown', defaultValue: 'SolveHub Engine 2026', options: [{ label: 'SolveHub Engine 2026', value: 'SolveHub Engine 2026' }, { label: 'Hello World!', value: 'Hello World!' }, { label: 'admin:password123', value: 'admin:password123' }, { label: 'Mathematics & Science', value: 'Mathematics & Science' }], tooltip: 'Text.' }
        ],
        naturalLanguageQueries: ["Calculate my base64 encode decode", "What is my base64 encode decode?", "Help me solve base64 encode decode"],
        edgeCases: ["Invalid Base64 padding Unsupported character encodings Binary corruption during decode"],
        calculate: (inputs) => {
            const str = String(inputs.textString || 'SolveHub');

            // Encode to base64
            let encoded = '';
            try {
                encoded = typeof btoa === 'function' ? btoa(str) : Buffer.from(str).toString('base64');
            } catch (e) {
                encoded = 'Encoding error';
            }

            return {
                primaryOutput: { label: 'Base64 Encoded Output', value: encoded },
                secondaryMetrics: [
                    { label: 'Original String Length', value: `${str.length} characters` },
                    { label: 'Base64 Length', value: `${encoded.length} characters (padded)` }
                ]
            };
        }
    },
    // 94. URL Encode Decode
    {
        id: 'url-encode-decode',
        name: 'URL Encode Decode',
        category: 'math-algebra',
        group: 'Number Systems',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '7K',
        cpc: '$13.54  ★ HIGH CPC',
        description: "A URL Encode/Decode calculator converts special characters into URL-safe percent-encoded format and decodes encoded URLs back into readable text. It helps safely transmit data within URLs and query parameters. The calculator follows RFC 3986 URL encoding standards.",
        inputs: [
            { id: 'queryText', name: 'URL / Query Preset', type: 'dropdown', defaultValue: 'search?q=math & science=100%', options: [{ label: 'search?q=math & science=100%', value: 'search?q=math & science=100%' }, { label: 'https://solvehub.com/calc?id=bmi#top', value: 'https://solvehub.com/calc?id=bmi#top' }, { label: 'user name=john doe&age=25', value: 'user name=john doe&age=25' }], tooltip: 'URL string.' }
        ],
        naturalLanguageQueries: ["Calculate my url encode decode", "What is my url encode decode?", "Help me solve url encode decode"],
        edgeCases: ["Zero division errors", "Negative inputs where not defined", "Boundary values"],
        calculate: (inputs) => {
            const rawStr = String(inputs.queryText || '');
            const encoded = encodeURIComponent(rawStr);

            return {
                primaryOutput: { label: 'Percent-Encoded URL String', value: encoded },
                secondaryMetrics: [
                    { label: 'Original String', value: rawStr },
                    { label: 'Safe for Query Parameters', value: 'Yes (RFC 3986 Standard)' }
                ]
            };
        }
    },
    // 95. Molecular Weight Calculator
    {
        id: 'molecular-weight-calculator',
        name: 'Molecular Weight Calculator',
        category: 'math-algebra',
        group: 'Science',
        bucket: 'Bucket B',
        tier: 5,
        phase: 4,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "A Molecular Weight Calculator computes the molar mass (molecular weight) of a chemical compound based on its chemical formula. It helps chemists, students, pharmacists, and laboratory professionals determine the mass of one mole of a substance. The calculator parses chemical formulas, identifies constituent atoms, and sums their atomic masses using periodic table data.",
        inputs: [
            { id: 'compound', name: 'Chemical Compound', type: 'dropdown', defaultValue: 'H2O', options: [{ label: 'Water (H2O)', value: 'H2O' }, { label: 'Glucose (C6H12O6)', value: 'C6H12O6' }, { label: 'Sodium Chloride (NaCl)', value: 'NaCl' }, { label: 'Sulfuric Acid (H2SO4)', value: 'H2SO4' }, { label: 'Carbon Dioxide (CO2)', value: 'CO2' }, { label: 'Methane (CH4)', value: 'CH4' }, { label: 'Ethanol (C2H5OH)', value: 'C2H5OH' }, { label: 'Caffeine (C8H10N4O2)', value: 'C8H10N4O2' }], tooltip: 'Chemical compound.' }
        ],
        naturalLanguageQueries: ["Calculate my molecular weight calculator", "What is my molecular weight calculator?", "Help me solve molecular weight calculator"],
        edgeCases: ["Zero division errors", "Negative inputs where not defined", "Boundary values"],
        calculate: (inputs) => {
            const comp = String(inputs.compound || 'H2O');

            const weights: Record<string, { mass: number, formula: string }> = {
                'H2O': { mass: 18.015, formula: '2(H: 1.008) + 1(O: 15.999)' },
                'C6H12O6': { mass: 180.156, formula: '6(C: 12.011) + 12(H: 1.008) + 6(O: 15.999)' },
                'NaCl': { mass: 58.44, formula: '1(Na: 22.990) + 1(Cl: 35.45)' },
                'H2SO4': { mass: 98.078, formula: '2(H) + 1(S: 32.06) + 4(O: 16.00)' },
                'CO2': { mass: 44.01, formula: '1(C: 12.011) + 2(O: 15.999)' },
                'CH4': { mass: 16.04, formula: '1(C: 12.011) + 4(H: 1.008)' },
                'C2H5OH': { mass: 46.07, formula: '2(C) + 6(H) + 1(O)' },
                'C8H10N4O2': { mass: 194.19, formula: '8(C) + 10(H) + 4(N: 14.007) + 2(O)' }
            };

            const info = weights[comp] || { mass: 18.015, formula: 'H2O' };

            return {
                primaryOutput: { label: 'Molar Mass (Molecular Weight)', value: info.mass, suffix: 'g/mol' },
                secondaryMetrics: [
                    { label: 'Elemental Composition', value: info.formula },
                    { label: 'Mass of 1 Mole', value: `${info.mass} grams` }
                ]
            };
        }
    },
    // 96. Molarity Calculator (M = mol / L)
    {
        id: 'molarity-calculator',
        name: 'Molarity Calculator',
        category: 'math-algebra',
        group: 'Science',
        bucket: 'Bucket B',
        tier: 2,
        phase: 3,
        monthlySearches: '60K',
        cpc: '$6.75  ★ HIGH CPC',
        description: "A Molarity Calculator computes solution concentration in moles per liter. It helps chemists prepare laboratory solutions and determine concentration relationships. The calculator can solve for molarity, moles, or volume depending on known variables.",
        inputs: [
            { id: 'soluteMassGrams', name: 'Solute Mass (g)', type: 'number', defaultValue: 58.44, min: 0.001, step: 0.1, suffix: 'g', tooltip: 'Mass of solute.' },
            { id: 'molarMass', name: 'Molar Mass (g/mol)', type: 'number', defaultValue: 58.44, min: 1, step: 0.1, suffix: 'g/mol', tooltip: 'Molecular weight.' },
            { id: 'solutionLiters', name: 'Solution Volume (Liters)', type: 'number', defaultValue: 1.0, min: 0.001, step: 0.1, suffix: 'L', tooltip: 'Volume in liters.' }
        ],
        naturalLanguageQueries: ["Calculate my molarity calculator", "What is my molarity calculator?", "Help me solve molarity calculator"],
        edgeCases: ["Zero division errors", "Negative inputs where not defined", "Boundary values"],
        calculate: (inputs) => {
            const mass = Number(inputs.soluteMassGrams) || 58.44;
            const mw = Math.max(0.1, Number(inputs.molarMass) || 58.44);
            const v = Math.max(0.001, Number(inputs.solutionLiters) || 1.0);

            const moles = mass / mw;
            const molarity = moles / v;

            return {
                primaryOutput: { label: 'Molar Concentration (Molarity)', value: Number(molarity.toFixed(4)), suffix: 'M (mol/L)' },
                secondaryMetrics: [
                    { label: 'Moles of Solute', value: `${moles.toFixed(4)} moles` },
                    { label: 'Millimolar Concentration (mM)', value: `${(molarity * 1000).toFixed(2)} mM` }
                ]
            };
        }
    },
    // 97. pH Calculator
    {
        id: 'ph-calculator',
        name: 'pH Calculator',
        category: 'math-algebra',
        group: 'Science',
        bucket: 'Bucket B',
        tier: 3,
        phase: 5,
        monthlySearches: '7K',
        cpc: '$1.33',
        description: "A pH Calculator calculates mathematical and scientific values with high precision and step-by-step clarity.",
        inputs: [
            { id: 'hConcentration', name: '[H⁺] Hydronium Concentration (mol/L)', type: 'number', defaultValue: 0.0001, min: 1e-15, max: 10, step: 0.0001, suffix: 'M', tooltip: 'Concentration in mol/L.' }
        ],
        naturalLanguageQueries: ["Calculate my ph calculator", "What is my ph calculator?", "Help me solve ph calculator"],
        edgeCases: ["Zero division errors", "Negative inputs where not defined", "Boundary values"],
        calculate: (inputs) => {
            const h = Math.max(1e-15, Number(inputs.hConcentration) || 0.0001);

            const ph = -Math.log10(h);
            const poh = 14 - ph;
            const oh = Math.pow(10, -poh);

            let classification = 'Neutral Solution (pH = 7.0)';
            if (ph < 7.0) classification = `Acidic Solution (pH < 7, Strong Acid if pH < 3)`;
            else if (ph > 7.0) classification = `Basic / Alkaline Solution (pH > 7)`;

            return {
                primaryOutput: { label: 'Solution pH Level', value: Number(ph.toFixed(2)) },
                secondaryMetrics: [
                    { label: 'Acidity Classification', value: classification },
                    { label: 'pOH Level', value: poh.toFixed(2) },
                    { label: '[OH⁻] Hydroxide Concentration', value: `${oh.toExponential(4)} M` }
                ]
            };
        }
    },
    // 98. Titration Calculator (Ma · Va = Mb · Vb)
    {
        id: 'titration-calculator',
        name: 'Titration Calculator',
        category: 'math-algebra',
        group: 'Science',
        bucket: 'Bucket B',
        tier: 3,
        phase: 4,
        monthlySearches: '5K',
        cpc: '$11.84  ★ HIGH CPC',
        description: "A Titration Calculator determines unknown solution concentration using titration relationships between analyte and titrant. It helps laboratory analysis and chemical stoichiometry calculations. The calculator supports acid-base stoichiometric relationships.",
        inputs: [
            { id: 'acidVolMl', name: 'Acid Volume (Va)', type: 'number', defaultValue: 25, min: 0.1, step: 0.5, suffix: 'mL', tooltip: 'Acid volume.' },
            { id: 'baseConcM', name: 'Base Titrant Concentration (Mb)', type: 'number', defaultValue: 0.1, min: 0.001, step: 0.01, suffix: 'M', tooltip: 'Base concentration.' },
            { id: 'baseVolMl', name: 'Base Volume at Equivalence (Vb)', type: 'number', defaultValue: 32.5, min: 0.1, step: 0.5, suffix: 'mL', tooltip: 'Titrant volume added.' }
        ],
        naturalLanguageQueries: ["Calculate my titration calculator", "What is my titration calculator?", "Help me solve titration calculator"],
        edgeCases: ["Zero division errors", "Negative inputs where not defined", "Boundary values"],
        calculate: (inputs) => {
            const va = Math.max(0.01, Number(inputs.acidVolMl) || 25);
            const mb = Number(inputs.baseConcM) || 0.1;
            const vb = Number(inputs.baseVolMl) || 32.5;

            // 1:1 monoprotic neutralization: Ma = (Mb * Vb) / Va
            const ma = (mb * vb) / va;

            return {
                primaryOutput: { label: 'Unknown Acid Concentration (Ma)', value: Number(ma.toFixed(4)), suffix: 'M (mol/L)' },
                secondaryMetrics: [
                    { label: 'Moles of Neutralized Analyte', value: `${((mb * vb) / 1000).toFixed(5)} moles` },
                    { label: 'Titrant Volume Used', value: `${vb} mL` }
                ]
            };
        }
    },
    // 99. Ideal Gas Law Calculator (PV = nRT)
    {
        id: 'ideal-gas-law-calculator',
        name: 'Ideal Gas Law Calculator',
        category: 'math-algebra',
        group: 'Science',
        bucket: 'Bucket B',
        tier: 4,
        phase: 4,
        monthlySearches: '3K',
        cpc: 'N/A',
        description: "An Ideal Gas Law Calculator solves relationships among pressure, volume, temperature, and moles of gases. It helps solve chemistry and thermodynamics problems. The calculator can solve for any missing gas variable.",
        inputs: [
            { id: 'volumeL', name: 'Volume (V)', type: 'number', defaultValue: 22.414, min: 0.1, step: 0.1, suffix: 'L', tooltip: 'Volume in liters.' },
            { id: 'molesN', name: 'Amount of Substance (n)', type: 'number', defaultValue: 1.0, min: 0.01, step: 0.1, suffix: 'mol', tooltip: 'Moles.' },
            { id: 'tempC', name: 'Temperature (°C)', type: 'number', defaultValue: 0, min: -273.15, max: 2000, step: 1, suffix: '°C', tooltip: 'Temperature.' }
        ],
        naturalLanguageQueries: ["Calculate my ideal gas law calculator", "What is my ideal gas law calculator?", "Help me solve ideal gas law calculator"],
        edgeCases: ["Negative Kelvin temperatures Zero volume Invalid pressure values Unit inconsistency"],
        calculate: (inputs) => {
            const v = Math.max(0.001, Number(inputs.volumeL) || 22.414);
            const n = Number(inputs.molesN) || 1.0;
            const tc = Number(inputs.tempC) || 0;

            const tk = tc + 273.15;
            const R = 0.082057; // L·atm / (mol·K)

            // P = nRT / V
            const pAtm = (n * R * tk) / v;
            const pKpa = pAtm * 101.325;
            const pPsi = pAtm * 14.6959;

            return {
                primaryOutput: { label: 'Gas Pressure (P)', value: Number(pAtm.toFixed(4)), suffix: 'atm' },
                secondaryMetrics: [
                    { label: 'Pressure in Kilopascals (kPa)', value: `${pKpa.toFixed(2)} kPa` },
                    { label: 'Pressure in PSI', value: `${pPsi.toFixed(2)} psi` },
                    { label: 'Absolute Temperature (T)', value: `${tk.toFixed(2)} K` }
                ]
            };
        }
    },
    // 100. Boyle's Law Calculator (P1 · V1 = P2 · V2)
    {
        id: 'boyles-law-calculator',
        name: 'Boyles Law Calculator',
        category: 'math-algebra',
        group: 'Science',
        bucket: 'Bucket B',
        tier: 5,
        phase: 5,
        monthlySearches: '10',
        cpc: 'N/A',
        description: "A Boyle\u2019s Law Calculator computes pressure-volume relationships for gases at constant temperature. It helps solve compression and expansion gas problems. The calculator assumes ideal gas behavior.",
        inputs: [
            { id: 'p1Atm', name: 'Initial Pressure (P₁)', type: 'number', defaultValue: 2.0, min: 0.01, step: 0.1, suffix: 'atm', tooltip: 'Initial pressure.' },
            { id: 'v1L', name: 'Initial Volume (V₁)', type: 'number', defaultValue: 5.0, min: 0.01, step: 0.1, suffix: 'L', tooltip: 'Initial volume.' },
            { id: 'p2Atm', name: 'Final Pressure (P₂)', type: 'number', defaultValue: 4.0, min: 0.01, step: 0.1, suffix: 'atm', tooltip: 'Final pressure.' }
        ],
        naturalLanguageQueries: ["Calculate my boyles law calculator", "What is my boyles law calculator?", "Help me solve boyles law calculator"],
        edgeCases: ["Zero pressure or volume Negative values Non-constant temperature misuse"],
        calculate: (inputs) => {
            const p1 = Number(inputs.p1Atm) || 2.0;
            const v1 = Number(inputs.v1L) || 5.0;
            const p2 = Math.max(0.001, Number(inputs.p2Atm) || 4.0);

            // V2 = (P1 * V1) / P2
            const v2 = (p1 * v1) / p2;

            return {
                primaryOutput: { label: 'Final Volume (V₂)', value: Number(v2.toFixed(4)), suffix: 'L' },
                secondaryMetrics: [
                    { label: 'Pressure Ratio (P₂ / P₁)', value: `${(p2 / p1).toFixed(2)}x` },
                    { label: 'Constant k = P·V', value: `${(p1 * v1).toFixed(2)} L·atm` }
                ]
            };
        }
    },
    // 101. Charles's Law Calculator (V1 / T1 = V2 / T2)
    {
        id: 'charles-law-calculator',
        name: 'Charles Law Calculator',
        category: 'math-algebra',
        group: 'Science',
        bucket: 'Bucket B',
        tier: 5,
        phase: 5,
        monthlySearches: '590',
        cpc: 'N/A',
        description: "A Charles Law Calculator computes volume-temperature relationships for gases at constant pressure. It helps analyze thermal expansion behavior. The calculator assumes ideal gas conditions.",
        inputs: [
            { id: 'v1L', name: 'Initial Volume (V₁)', type: 'number', defaultValue: 3.0, min: 0.01, step: 0.1, suffix: 'L', tooltip: 'Initial volume.' },
            { id: 't1C', name: 'Initial Temperature (T₁ in °C)', type: 'number', defaultValue: 20, min: -273.15, step: 1, suffix: '°C', tooltip: 'Initial temp.' },
            { id: 't2C', name: 'Final Temperature (T₂ in °C)', type: 'number', defaultValue: 80, min: -273.15, step: 1, suffix: '°C', tooltip: 'Final temp.' }
        ],
        naturalLanguageQueries: ["Calculate my charles law calculator", "What is my charles law calculator?", "Help me solve charles law calculator"],
        edgeCases: ["Temperatures below absolute zero Zero Kelvin division Negative volumes"],
        calculate: (inputs) => {
            const v1 = Number(inputs.v1L) || 3.0;
            const t1c = Number(inputs.t1C) || 20;
            const t2c = Number(inputs.t2C) || 80;

            const t1k = Math.max(0.1, t1c + 273.15);
            const t2k = Math.max(0.1, t2c + 273.15);

            // V2 = V1 * (T2 / T1)
            const v2 = v1 * (t2k / t1k);

            return {
                primaryOutput: { label: 'Final Expanded Volume (V₂)', value: Number(v2.toFixed(4)), suffix: 'L' },
                secondaryMetrics: [
                    { label: 'Initial Kelvin Temp (T₁)', value: `${t1k.toFixed(2)} K` },
                    { label: 'Final Kelvin Temp (T₂)', value: `${t2k.toFixed(2)} K` },
                    { label: 'Volume Expansion Factor', value: `${(v2 / v1).toFixed(3)}x` }
                ]
            };
        }
    },
    // 102. Kinetic Energy Calculator (KE = ½mv²)
    {
        id: 'kinetic-energy-calculator',
        name: 'Kinetic Energy Calculator',
        category: 'math-algebra',
        group: 'Science',
        bucket: 'Bucket C1',
        tier: 5,
        phase: 4,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "A Kinetic Energy Calculator computes the energy possessed by moving objects. It helps solve physics, engineering, and mechanics problems. The calculator supports SI and imperial units.",
        inputs: [
            { id: 'massKg', name: 'Object Mass (m)', type: 'number', defaultValue: 1200, min: 0.0001, step: 1, suffix: 'kg', tooltip: 'Mass in kilograms.' },
            { id: 'velocityMs', name: 'Velocity / Speed (v)', type: 'number', defaultValue: 27.78, min: 0, step: 0.1, suffix: 'm/s', tooltip: 'Speed in m/s (e.g. 27.78 m/s ≈ 100 km/h).' }
        ],
        naturalLanguageQueries: ["Calculate my kinetic energy calculator", "What is my kinetic energy calculator?", "Help me solve kinetic energy calculator"],
        edgeCases: ["Negative mass Extremely high velocities Relativistic effects ignored"],
        calculate: (inputs) => {
            const m = Number(inputs.massKg) || 1200;
            const v = Number(inputs.velocityMs) || 27.78;

            const keJoules = 0.5 * m * v * v;
            const keKj = keJoules / 1000;
            const keCalories = keJoules / 4184;

            return {
                primaryOutput: { label: 'Kinetic Energy (KE)', value: Math.round(keJoules), suffix: 'Joules (J)' },
                secondaryMetrics: [
                    { label: 'Energy in Kilojoules (kJ)', value: `${keKj.toFixed(2)} kJ` },
                    { label: 'Speed in km/h', value: `${(v * 3.6).toFixed(1)} km/h` },
                    { label: 'Speed in mph', value: `${(v * 2.23694).toFixed(1)} mph` },
                    { label: 'Equivalent Food Calories (kcal)', value: `${keCalories.toFixed(2)} kcal` }
                ]
            };
        }
    },
    // 103. Potential Energy Calculator (PE = m·g·h)
    {
        id: 'potential-energy-calculator',
        name: 'Potential Energy Calculator',
        category: 'math-algebra',
        group: 'Science',
        bucket: 'Bucket C1',
        tier: 4,
        phase: 4,
        monthlySearches: '2K',
        cpc: 'N/A',
        description: "A Potential Energy Calculator computes stored gravitational energy due to object position. It helps solve mechanics and physics problems. The calculator primarily supports gravitational potential energy.",
        inputs: [
            { id: 'massKg', name: 'Mass (m)', type: 'number', defaultValue: 75, min: 0.001, step: 0.5, suffix: 'kg', tooltip: 'Mass.' },
            { id: 'heightM', name: 'Height / Elevation (h)', type: 'number', defaultValue: 10, min: 0, step: 0.5, suffix: 'm', tooltip: 'Height in meters.' },
            { id: 'gravityG', name: 'Gravitational Acceleration (g)', type: 'number', defaultValue: 9.807, min: 0.1, step: 0.01, suffix: 'm/s²', tooltip: 'Earth standard is 9.807 m/s².' }
        ],
        naturalLanguageQueries: ["Calculate my potential energy calculator", "What is my potential energy calculator?", "Help me solve potential energy calculator"],
        edgeCases: ["Negative heights Negative mass Custom gravity environments"],
        calculate: (inputs) => {
            const m = Number(inputs.massKg) || 75;
            const h = Number(inputs.heightM) || 10;
            const g = Number(inputs.gravityG) || 9.807;

            const pe = m * g * h;

            return {
                primaryOutput: { label: 'Gravitational Potential Energy', value: Number(pe.toFixed(2)), suffix: 'Joules (J)' },
                secondaryMetrics: [
                    { label: 'Energy in Kilojoules', value: `${(pe / 1000).toFixed(3)} kJ` },
                    { label: 'Impact Velocity upon Free Fall (√(2gh))', value: `${Math.sqrt(2 * g * h).toFixed(2)} m/s` }
                ]
            };
        }
    },
    // 104. Wavelength Calculator (c = λ · f)
    {
        id: 'wavelength-calculator',
        name: 'Wavelength Calculator',
        category: 'math-algebra',
        group: 'Science',
        bucket: 'Bucket B',
        tier: 3,
        phase: 5,
        monthlySearches: '7K',
        cpc: '$1.56',
        description: "A Wavelength Calculator computes wavelength, frequency, or wave speed relationships for electromagnetic and mechanical waves. It helps solve physics, optics, and communication problems. The calculator supports light, sound, and general wave equations.",
        inputs: [
            { id: 'frequencyMhz', name: 'Wave Frequency (MHz)', type: 'number', defaultValue: 2400, min: 0.001, step: 1, suffix: 'MHz', tooltip: 'e.g. 2400 MHz for 2.4 GHz Wi-Fi.' },
            { id: 'waveType', name: 'Propagation Medium / Wave Type', type: 'dropdown', defaultValue: 'light', options: [{ label: 'Electromagnetic / Light (c ≈ 3 × 10⁸ m/s)', value: 'light' }, { label: 'Sound in Air (v ≈ 343 m/s)', value: 'sound' }], tooltip: 'Wave speed.' }
        ],
        naturalLanguageQueries: ["Calculate my wavelength calculator", "What is my wavelength calculator?", "Help me solve wavelength calculator"],
        edgeCases: ["Zero frequency Negative wavelengths Extremely high electromagnetic frequencies"],
        calculate: (inputs) => {
            const fMhz = Number(inputs.frequencyMhz) || 2400;
            const isLight = inputs.waveType === 'light';

            const fHz = fMhz * 1e6;
            const speed = isLight ? 299792458 : 343; // m/s

            const lambdaMeters = speed / fHz;
            const lambdaCm = lambdaMeters * 100;

            // Photon energy E = h * f for EM waves (h = 6.62607015e-34 J·s)
            const photonEnergyEv = isLight ? (6.62607015e-34 * fHz) / 1.602176634e-19 : 0;

            return {
                primaryOutput: { label: 'Wavelength (λ)', value: lambdaCm >= 1 ? `${lambdaCm.toFixed(2)} cm` : `${(lambdaMeters * 1e9).toFixed(1)} nm` },
                secondaryMetrics: [
                    { label: 'Wavelength in Meters', value: lambdaMeters.toExponential(4) + ' m' },
                    { label: 'Wave Velocity (v)', value: `${speed.toLocaleString()} m/s` },
                    { label: 'Photon Energy (for EM)', value: isLight ? `${photonEnergyEv.toExponential(4)} eV` : 'N/A (Sound)' }
                ]
            };
        }
    }
];

export const cat03MathScienceCalculators = mathScienceCalculators;
