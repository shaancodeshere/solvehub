import { CalculatorDefinition } from '../../types/calculator';

// Core Financial Helper Functions
function calculateAmortizationMonthlyPayment(principal: number, annualRatePct: number, termYears: number): number {
    if (annualRatePct === 0) return principal / (termYears * 12);
    const monthlyRate = annualRatePct / 100 / 12;
    const totalMonths = termYears * 12;
    return (principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
}

export const financialCalculators: CalculatorDefinition[] = [
    // 1. Mortgage Calculator
    {
        id: 'mortgage-calculator',
        name: 'Mortgage Calculator',
        category: 'finance-business',
        group: '1A',
        bucket: 'Bucket A',
        tier: 1,
        phase: 1,
        monthlySearches: '1.8M',
        cpc: '$14.25',
        description: 'Calculates monthly mortgage principal and interest payments, total loan cost, property tax, and PMI amortization.',
        inputs: [
            { id: 'homeValue', name: 'Home Purchase Price', type: 'currency', defaultValue: 400000, min: 10000, step: 5000, prefix: '$', tooltip: 'Contract purchase price of the home.' },
            { id: 'downPayment', name: 'Down Payment Amount', type: 'currency', defaultValue: 80000, min: 0, step: 2500, prefix: '$', tooltip: 'Initial cash down payment.' },
            { id: 'interestRate', name: 'Annual Interest Rate (APR)', type: 'percentage', defaultValue: 6.75, min: 0.1, max: 20, step: 0.125, suffix: '%', tooltip: 'Fixed annual interest rate.' },
            {
                id: 'loanTermYears', name: 'Loan Term (Years)', type: 'dropdown', defaultValue: 30, options: [
                    { label: '30-Year Fixed', value: 30 },
                    { label: '20-Year Fixed', value: 20 },
                    { label: '15-Year Fixed', value: 15 },
                    { label: '10-Year Fixed', value: 10 }
                ], tooltip: 'Length of mortgage schedule.'
            },
            { id: 'annualPropertyTax', name: 'Annual Property Tax', type: 'currency', defaultValue: 4800, min: 0, step: 250, prefix: '$', tooltip: 'Annual municipal property taxes.' },
            { id: 'annualHomeInsurance', name: 'Annual Homeowners Insurance', type: 'currency', defaultValue: 1500, min: 0, step: 100, prefix: '$', tooltip: 'Annual hazard and fire policy premium.' }
        ],
        naturalLanguageQueries: [
            'Mortgage calculator with taxes and insurance',
            'What is my monthly payment on a 400k house?',
            '30 year fixed mortgage monthly cost'
        ],
        edgeCases: ['Down payment exceeding home purchase price', 'Zero interest rate mortgages'],
        calculate: (inputs) => {
            const price = Number(inputs.homeValue) || 400000;
            const down = Math.min(price, Number(inputs.downPayment) || 0);
            const rate = Number(inputs.interestRate) || 6.75;
            const term = Number(inputs.loanTermYears) || 30;
            const taxMonthly = (Number(inputs.annualPropertyTax) || 0) / 12;
            const insMonthly = (Number(inputs.annualHomeInsurance) || 0) / 12;

            const principal = Math.max(0, price - down);
            const piMonthly = calculateAmortizationMonthlyPayment(principal, rate, term);
            const ltv = price > 0 ? (principal / price) * 100 : 0;
            const pmiMonthly = ltv > 80 ? (principal * 0.007) / 12 : 0; // ~0.7% annual PMI if down payment < 20%
            const totalPiti = piMonthly + taxMonthly + insMonthly + pmiMonthly;

            const totalMonths = term * 12;
            const totalPrincipalAndInterest = piMonthly * totalMonths;
            const totalInterest = Math.max(0, totalPrincipalAndInterest - principal);

            return {
                primaryOutput: { label: 'Total Monthly Payment (PITI)', value: totalPiti.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Principal & Interest (P&I)', value: piMonthly.toFixed(2), prefix: '$' },
                    { label: 'Property Tax (Monthly)', value: taxMonthly.toFixed(2), prefix: '$' },
                    { label: 'Homeowners Insurance', value: insMonthly.toFixed(2), prefix: '$' },
                    { label: 'Private Mortgage Insurance (PMI)', value: pmiMonthly.toFixed(2), prefix: '$' },
                    { label: 'Total Lifetime Interest Paid', value: totalInterest.toFixed(2), prefix: '$' },
                    { label: 'Loan-to-Value Ratio (LTV)', value: `${ltv.toFixed(1)}%` }
                ]
            };
        }
    },

    // 2. Loan Calculator
    {
        id: 'loan-calculator',
        name: 'General Loan Calculator',
        category: 'finance-business',
        group: '1A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '1.2M',
        cpc: '$5.50',
        description: 'Computes simple and amortized personal or business loan schedules, monthly installments, and total finance charges.',
        inputs: [
            { id: 'loanAmount', name: 'Total Loan Amount', type: 'currency', defaultValue: 25000, min: 500, step: 500, prefix: '$', tooltip: 'Principal borrowed.' },
            { id: 'interestRate', name: 'Annual Interest Rate (APR)', type: 'percentage', defaultValue: 8.5, min: 0.1, max: 36, step: 0.25, suffix: '%', tooltip: 'Fixed APR rate.' },
            { id: 'loanTermMonths', name: 'Loan Duration (Months)', type: 'number', defaultValue: 48, min: 6, max: 120, step: 6, suffix: 'months', tooltip: 'Duration in months.' }
        ],
        naturalLanguageQueries: [
            'Loan payment calculator',
            'How much is a 25k personal loan per month?',
            'Calculate interest on personal loan'
        ],
        edgeCases: ['Zero duration', 'Negative interest rate'],
        calculate: (inputs) => {
            const p = Number(inputs.loanAmount) || 25000;
            const apr = Number(inputs.interestRate) || 8.5;
            const months = Math.max(1, Number(inputs.loanTermMonths) || 48);

            const r = apr / 100 / 12;
            const monthlyPayment = apr === 0 ? p / months : (p * (r * Math.pow(1 + r, months))) / (Math.pow(1 + r, months) - 1);
            const totalRepaid = monthlyPayment * months;
            const totalInterest = totalRepaid - p;

            return {
                primaryOutput: { label: 'Monthly Payment Installment', value: monthlyPayment.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Finance Charge (Interest)', value: totalInterest.toFixed(2), prefix: '$' },
                    { label: 'Total Principal & Interest Repaid', value: totalRepaid.toFixed(2), prefix: '$' },
                    { label: 'Interest as % of Principal', value: `${((totalInterest / p) * 100).toFixed(1)}%` }
                ]
            };
        }
    },

    // 3. Auto Loan Calculator
    {
        id: 'auto-loan-calculator',
        name: 'Auto Loan Calculator',
        category: 'finance-business',
        group: '1A',
        bucket: 'Bucket A',
        tier: 1,
        phase: 1,
        monthlySearches: '823K',
        cpc: '$7.80',
        description: 'Calculates vehicle financing costs accounting for sales tax, trade-in equity, dealer fees, and interest charges.',
        inputs: [
            { id: 'vehiclePrice', name: 'Vehicle Purchase Price', type: 'currency', defaultValue: 35000, min: 1000, step: 500, prefix: '$', tooltip: 'Negotiated car price.' },
            { id: 'tradeInValue', name: 'Trade-In Allowance', type: 'currency', defaultValue: 5000, min: 0, step: 500, prefix: '$', tooltip: 'Dealer credit for existing vehicle.' },
            { id: 'downPaymentCash', name: 'Cash Down Payment', type: 'currency', defaultValue: 3000, min: 0, step: 500, prefix: '$', tooltip: 'Out-of-pocket cash paid upfront.' },
            { id: 'interestRate', name: 'Auto Loan APR', type: 'percentage', defaultValue: 5.9, min: 0.1, max: 25, step: 0.1, suffix: '%', tooltip: 'Financing APR.' },
            {
                id: 'loanTermMonths', name: 'Loan Term (Months)', type: 'dropdown', defaultValue: 60, options: [
                    { label: '36 Months (3 Years)', value: 36 },
                    { label: '48 Months (4 Years)', value: 48 },
                    { label: '60 Months (5 Years)', value: 60 },
                    { label: '72 Months (6 Years)', value: 72 },
                    { label: '84 Months (7 Years)', value: 84 }
                ], tooltip: 'Term in months.'
            },
            { id: 'salesTaxRate', name: 'State / Local Sales Tax Rate', type: 'percentage', defaultValue: 6.5, min: 0, max: 15, step: 0.25, suffix: '%', tooltip: 'Sales tax.' }
        ],
        naturalLanguageQueries: [
            'Car loan monthly payment calculator',
            'Auto loan calculator with trade in',
            'What is my car payment for 35000?'
        ],
        edgeCases: ['Trade-in value higher than vehicle purchase price'],
        calculate: (inputs) => {
            const price = Number(inputs.vehiclePrice) || 35000;
            const trade = Number(inputs.tradeInValue) || 0;
            const down = Number(inputs.downPaymentCash) || 0;
            const apr = Number(inputs.interestRate) || 5.9;
            const months = Number(inputs.loanTermMonths) || 60;
            const taxRate = (Number(inputs.salesTaxRate) || 0) / 100;

            const taxableAmount = Math.max(0, price - trade);
            const tax = taxableAmount * taxRate;
            const principal = Math.max(0, price + tax - trade - down);

            const r = apr / 100 / 12;
            const monthly = apr === 0 ? principal / months : (principal * (r * Math.pow(1 + r, months))) / (Math.pow(1 + r, months) - 1);
            const totalPaid = monthly * months;
            const totalInterest = totalPaid - principal;

            return {
                primaryOutput: { label: 'Monthly Car Payment', value: monthly.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Net Financed Amount', value: principal.toFixed(2), prefix: '$' },
                    { label: 'Sales Tax Charged', value: tax.toFixed(2), prefix: '$' },
                    { label: 'Total Financing Interest Cost', value: totalInterest.toFixed(2), prefix: '$' },
                    { label: 'Total Purchase Outlay', value: (totalPaid + trade + down).toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 4. Compound Interest Calculator
    {
        id: 'compound-interest-calculator',
        name: 'Compound Interest Calculator',
        category: 'finance-business',
        group: '1A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '1.5M',
        cpc: '$2.80',
        description: 'Models exponential growth of investments with recurring deposits across daily, monthly, or annual compounding frequencies.',
        inputs: [
            { id: 'initialPrincipal', name: 'Initial Principal Deposit', type: 'currency', defaultValue: 10000, min: 0, step: 500, prefix: '$', tooltip: 'Starting capital.' },
            { id: 'monthlyContribution', name: 'Monthly Additional Deposit', type: 'currency', defaultValue: 500, min: 0, step: 50, prefix: '$', tooltip: 'Recurring monthly addition.' },
            { id: 'annualRatePct', name: 'Estimated Annual Rate of Return', type: 'percentage', defaultValue: 8.0, min: 0.1, max: 30, step: 0.25, suffix: '%', tooltip: 'Expected yearly return rate.' },
            { id: 'timeHorizonYears', name: 'Investment Horizon (Years)', type: 'number', defaultValue: 20, min: 1, max: 60, step: 1, suffix: 'years', tooltip: 'Duration to compound.' },
            {
                id: 'compoundingFrequency', name: 'Compounding Frequency', type: 'dropdown', defaultValue: 12, options: [
                    { label: 'Annually (1x/year)', value: 1 },
                    { label: 'Semi-Annually (2x/year)', value: 2 },
                    { label: 'Quarterly (4x/year)', value: 4 },
                    { label: 'Monthly (12x/year)', value: 12 },
                    { label: 'Daily (365x/year)', value: 365 }
                ], tooltip: 'How often interest capitalizes.'
            }
        ],
        naturalLanguageQueries: [
            'Compound interest calculator with monthly deposits',
            'How much will 10k grow in 20 years at 8%?',
            'Investment compound growth formula'
        ],
        edgeCases: ['Zero principal and contributions', 'Negative return rates'],
        calculate: (inputs) => {
            const p = Number(inputs.initialPrincipal) || 0;
            const pmt = Number(inputs.monthlyContribution) || 0;
            const r = (Number(inputs.annualRatePct) || 0) / 100;
            const t = Number(inputs.timeHorizonYears) || 20;
            const n = Number(inputs.compoundingFrequency) || 12;

            // Compound Principal: P * (1 + r/n)^(n*t)
            const fvPrincipal = p * Math.pow(1 + r / n, n * t);

            // Future Value of monthly stream: PMT * [((1 + r/12)^(12*t) - 1) / (r/12)]
            const rMonthly = r / 12;
            const totalMonths = t * 12;
            const fvContributions = rMonthly > 0 ? pmt * ((Math.pow(1 + rMonthly, totalMonths) - 1) / rMonthly) : pmt * totalMonths;

            const totalBalance = fvPrincipal + fvContributions;
            const totalInvested = p + (pmt * totalMonths);
            const totalInterestEarned = Math.max(0, totalBalance - totalInvested);

            return {
                primaryOutput: { label: 'Ending Portfolio Value', value: totalBalance.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Cumulative Contributions', value: totalInvested.toFixed(2), prefix: '$' },
                    { label: 'Total Compound Interest Growth', value: totalInterestEarned.toFixed(2), prefix: '$' },
                    { label: 'Interest-to-Principal Ratio', value: totalInvested > 0 ? `${((totalInterestEarned / totalInvested) * 100).toFixed(0)}%` : '0%' }
                ]
            };
        }
    },

    // 5. Retirement 401(k) Calculator
    {
        id: 'retirement-401k-calculator',
        name: '401(k) Retirement Calculator',
        category: 'finance-business',
        group: '1A',
        bucket: 'Bucket A',
        tier: 1,
        phase: 1,
        monthlySearches: '301K',
        cpc: '$12.10',
        description: 'Estimates retirement nest egg balance with salary increases, employer match matching formulas, and inflation projections.',
        inputs: [
            { id: 'currentAge', name: 'Current Age', type: 'number', defaultValue: 30, min: 18, max: 75, step: 1, suffix: 'yrs', tooltip: 'Current age.' },
            { id: 'retirementAge', name: 'Target Retirement Age', type: 'number', defaultValue: 65, min: 45, max: 80, step: 1, suffix: 'yrs', tooltip: 'Age when withdrawals begin.' },
            { id: 'currentBalance', name: 'Current 401(k) Balance', type: 'currency', defaultValue: 45000, min: 0, step: 5000, prefix: '$', tooltip: 'Existing balance.' },
            { id: 'annualSalary', name: 'Current Gross Annual Salary', type: 'currency', defaultValue: 85000, min: 10000, step: 2500, prefix: '$', tooltip: 'Base annual wage.' },
            { id: 'employeeContributionPct', name: 'Your Contribution Rate', type: 'percentage', defaultValue: 8.0, min: 0, max: 50, step: 0.5, suffix: '%', tooltip: 'Percentage of salary invested.' },
            { id: 'employerMatchPct', name: 'Employer Match Up To', type: 'percentage', defaultValue: 4.0, min: 0, max: 15, step: 0.5, suffix: '%', tooltip: 'Company matching limit.' },
            { id: 'expectedReturnPct', name: 'Estimated Annual Investment Return', type: 'percentage', defaultValue: 7.5, min: 1, max: 15, step: 0.25, suffix: '%', tooltip: 'Market return expectation.' }
        ],
        naturalLanguageQueries: [
            '401k calculator with employer match',
            'How much will I have at 65 in my 401k?',
            'Retirement savings projection'
        ],
        edgeCases: ['Current age exceeding retirement age', 'IRS maximum annual contribution limits'],
        calculate: (inputs) => {
            const curAge = Number(inputs.currentAge) || 30;
            const retAge = Math.max(curAge + 1, Number(inputs.retirementAge) || 65);
            const startBalance = Number(inputs.currentBalance) || 0;
            const salary = Number(inputs.annualSalary) || 85000;
            const empPct = (Number(inputs.employeeContributionPct) || 8) / 100;
            const matchPct = (Number(inputs.employerMatchPct) || 4) / 100;
            const r = (Number(inputs.expectedReturnPct) || 7.5) / 100;

            const years = retAge - curAge;
            let balance = startBalance;
            let totalEmpContributed = 0;
            let totalMatchContributed = 0;

            // Annual simulation loop with 2% wage inflation
            let currentSalary = salary;
            for (let y = 0; y < years; y++) {
                const empAnnual = Math.min(23000, currentSalary * empPct); // 2024 IRS baseline limit guide
                const matchAnnual = currentSalary * Math.min(empPct, matchPct);
                totalEmpContributed += empAnnual;
                totalMatchContributed += matchAnnual;

                balance = (balance + empAnnual + matchAnnual) * (1 + r);
                currentSalary *= 1.02; // modest 2% wage growth
            }

            const safeWithdrawalMonthly = (balance * 0.04) / 12; // 4% Trinity Study Rule

            return {
                primaryOutput: { label: 'Projected 401(k) Balance at Retirement', value: balance.toFixed(0), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Estimated Monthly Retirement Income (4% Rule)', value: safeWithdrawalMonthly.toFixed(2), prefix: '$' },
                    { label: 'Total Employee Contributions', value: totalEmpContributed.toFixed(0), prefix: '$' },
                    { label: 'Free Employer Match Pocketed', value: totalMatchContributed.toFixed(0), prefix: '$' },
                    { label: 'Compound Growth Multiple', value: `${(balance / (totalEmpContributed + startBalance || 1)).toFixed(1)}x` }
                ]
            };
        }
    },

    // 6. Credit Card Payoff Calculator
    {
        id: 'credit-card-payoff-calculator',
        name: 'Credit Card Payoff Calculator',
        category: 'finance-business',
        group: '1A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '246K',
        cpc: '$9.20',
        description: 'Calculates the months and total interest charges needed to reach zero credit card balance based on fixed monthly payments.',
        inputs: [
            { id: 'balance', name: 'Credit Card Balance Owed', type: 'currency', defaultValue: 6500, min: 100, step: 100, prefix: '$', tooltip: 'Current credit balance.' },
            { id: 'aprRate', name: 'Credit Card APR', type: 'percentage', defaultValue: 21.99, min: 0.1, max: 40, step: 0.25, suffix: '%', tooltip: 'Annual Percentage Rate.' },
            { id: 'fixedMonthlyPayment', name: 'Planned Fixed Monthly Payment', type: 'currency', defaultValue: 250, min: 25, step: 25, prefix: '$', tooltip: 'Amount budgeted each month.' }
        ],
        naturalLanguageQueries: [
            'Credit card payoff calculator',
            'How long to pay off 5000 credit card?',
            'Credit card debt repayment interest'
        ],
        edgeCases: ['Payment lower than monthly interest charge (infinite debt loop)'],
        calculate: (inputs) => {
            const bal = Number(inputs.balance) || 6500;
            const apr = Number(inputs.aprRate) || 21.99;
            const pmt = Number(inputs.fixedMonthlyPayment) || 250;
            const r = apr / 100 / 12;

            const initialInterest = bal * r;
            if (pmt <= initialInterest) {
                return {
                    primaryOutput: { label: 'Payoff Status', value: 'Payment Too Low (Balance Will Never Clear)' },
                    secondaryMetrics: [
                        { label: 'Minimum Payment Needed to Cover Interest', value: (initialInterest + 10).toFixed(2), prefix: '$' },
                        { label: 'Monthly Interest Accrual Alone', value: initialInterest.toFixed(2), prefix: '$' }
                    ]
                };
            }

            let remaining = bal;
            let months = 0;
            let totalInterest = 0;

            while (remaining > 0 && months < 360) {
                months++;
                const interest = remaining * r;
                totalInterest += interest;
                const principal = pmt - interest;
                remaining -= principal;
            }

            return {
                primaryOutput: { label: 'Time to Become Debt-Free', value: `${(months / 12).toFixed(1)} Years`, suffix: `(${months} Months)` },
                secondaryMetrics: [
                    { label: 'Total Interest Added to Principal', value: totalInterest.toFixed(2), prefix: '$' },
                    { label: 'Total Cash Paid Over Life', value: (bal + totalInterest).toFixed(2), prefix: '$' },
                    { label: 'Interest Premium Percentage', value: `${((totalInterest / bal) * 100).toFixed(1)}%` }
                ]
            };
        }
    },

    // 7. Refinance Calculator
    {
        id: 'refinance-calculator',
        name: 'Mortgage Refinance Break-Even Calculator',
        category: 'finance-business',
        group: '1A',
        bucket: 'Bucket A',
        tier: 1,
        phase: 1,
        monthlySearches: '165K',
        cpc: '$16.50',
        description: 'Determines monthly payment savings, lifetime interest reduction, and closing cost break-even months when refinancing a home loan.',
        inputs: [
            { id: 'currentBalance', name: 'Remaining Mortgage Balance', type: 'currency', defaultValue: 320000, min: 10000, step: 5000, prefix: '$', tooltip: 'Current loan principal owed.' },
            { id: 'currentRate', name: 'Current Mortgage Rate', type: 'percentage', defaultValue: 7.25, min: 1, max: 15, step: 0.125, suffix: '%', tooltip: 'Existing rate.' },
            { id: 'currentTermYears', name: 'Years Remaining on Current Loan', type: 'number', defaultValue: 27, min: 1, max: 30, step: 1, suffix: 'years', tooltip: 'Remaining term.' },
            { id: 'newRate', name: 'New Proposed Mortgage Rate', type: 'percentage', defaultValue: 5.875, min: 1, max: 15, step: 0.125, suffix: '%', tooltip: 'Refinance rate.' },
            { id: 'newTermYears', name: 'New Loan Term', type: 'dropdown', defaultValue: 30, options: [{ label: '30-Year Fixed', value: 30 }, { label: '15-Year Fixed', value: 15 }], tooltip: 'New loan duration.' },
            { id: 'closingCosts', name: 'Refinance Closing Costs', type: 'currency', defaultValue: 6500, min: 0, step: 250, prefix: '$', tooltip: 'Lender fees, title, appraisal.' }
        ],
        naturalLanguageQueries: [
            'Mortgage refinance break even calculator',
            'Is it worth refinancing my home?',
            'Refinance monthly savings calculator'
        ],
        edgeCases: ['New rate higher than existing rate (negative savings)'],
        calculate: (inputs) => {
            const bal = Number(inputs.currentBalance) || 320000;
            const curRate = Number(inputs.currentRate) || 7.25;
            const curTerm = Number(inputs.currentTermYears) || 27;
            const newRate = Number(inputs.newRate) || 5.875;
            const newTerm = Number(inputs.newTermYears) || 30;
            const closing = Number(inputs.closingCosts) || 6500;

            const curMonthly = calculateAmortizationMonthlyPayment(bal, curRate, curTerm);
            const newMonthly = calculateAmortizationMonthlyPayment(bal, newRate, newTerm);
            const monthlySavings = curMonthly - newMonthly;

            const breakEvenMonths = monthlySavings > 0 ? closing / monthlySavings : 0;
            const totalCurCost = curMonthly * (curTerm * 12);
            const totalNewCost = (newMonthly * (newTerm * 12)) + closing;
            const lifetimeSavings = totalCurCost - totalNewCost;

            return {
                primaryOutput: { label: 'Monthly Payment Reduction', value: monthlySavings > 0 ? monthlySavings.toFixed(2) : 'No Monthly Savings', prefix: monthlySavings > 0 ? '$' : '' },
                secondaryMetrics: [
                    { label: 'Break-Even Timeframe', value: monthlySavings > 0 ? `${breakEvenMonths.toFixed(1)} Months (~${(breakEvenMonths / 12).toFixed(1)} yrs)` : 'N/A' },
                    { label: 'Lifetime Net Financial Savings', value: lifetimeSavings.toFixed(2), prefix: '$' },
                    { label: 'Upfront Closing Costs', value: closing.toFixed(2), prefix: '$' },
                    { label: 'New Monthly Principal & Interest', value: newMonthly.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 8. Amortization Schedule Calculator
    {
        id: 'amortization-calculator',
        name: 'Loan Amortization Schedule Calculator',
        category: 'finance-business',
        group: '1A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '301K',
        cpc: '$6.40',
        description: 'Generates detailed principal versus interest breakdowns and shows accelerated equity gains with extra principal payments.',
        inputs: [
            { id: 'principal', name: 'Loan Principal Amount', type: 'currency', defaultValue: 200000, min: 1000, step: 5000, prefix: '$', tooltip: 'Borrowed sum.' },
            { id: 'interestRate', name: 'Annual Interest Rate (APR)', type: 'percentage', defaultValue: 6.5, min: 0.1, max: 20, step: 0.125, suffix: '%', tooltip: 'APR.' },
            { id: 'termYears', name: 'Loan Term (Years)', type: 'number', defaultValue: 30, min: 1, max: 40, step: 1, suffix: 'years', tooltip: 'Duration.' },
            { id: 'extraPaymentMonthly', name: 'Extra Monthly Principal Payment', type: 'currency', defaultValue: 100, min: 0, step: 25, prefix: '$', tooltip: 'Additional paydown.' }
        ],
        naturalLanguageQueries: [
            'Loan amortization calculator with extra payments',
            'How much interest do I save paying extra on mortgage?',
            'Amortization schedule table generator'
        ],
        edgeCases: ['Extra payments exceeding monthly principal remaining'],
        calculate: (inputs) => {
            const p = Number(inputs.principal) || 200000;
            const apr = Number(inputs.interestRate) || 6.5;
            const termYears = Number(inputs.termYears) || 30;
            const extra = Number(inputs.extraPaymentMonthly) || 0;

            const baseMonthly = calculateAmortizationMonthlyPayment(p, apr, termYears);
            const totalMonthsScheduled = termYears * 12;
            const standardTotalInterest = (baseMonthly * totalMonthsScheduled) - p;

            // Simulate schedule with extra payments
            const r = apr / 100 / 12;
            let balance = p;
            let monthsCount = 0;
            let totalInterestPaid = 0;

            while (balance > 0 && monthsCount < 600) {
                monthsCount++;
                const interest = balance * r;
                totalInterestPaid += interest;
                const principalPaid = Math.min(balance, (baseMonthly - interest) + extra);
                balance -= principalPaid;
            }

            const interestSaved = Math.max(0, standardTotalInterest - totalInterestPaid);
            const yearsSaved = Math.max(0, (totalMonthsScheduled - monthsCount) / 12);

            return {
                primaryOutput: { label: 'Interest Saved via Extra Payments', value: interestSaved.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'New Accelerated Payoff Time', value: `${(monthsCount / 12).toFixed(1)} Years`, suffix: `(${monthsCount} Months)` },
                    { label: 'Time Shaved Off Loan', value: `${yearsSaved.toFixed(1)} Years Earlier` },
                    { label: 'Standard Monthly Base Payment', value: baseMonthly.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 9. Inflation Calculator
    {
        id: 'inflation-calculator',
        name: 'Historical Inflation & Purchasing Power Calculator',
        category: 'finance-business',
        group: '1A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '450K',
        cpc: '$1.95',
        description: 'Calculates the historical erosion of purchasing power and future nominal values based on consumer price index (CPI) inflation rates.',
        inputs: [
            { id: 'startingAmount', name: 'Starting Capital Amount', type: 'currency', defaultValue: 1000, min: 1, step: 100, prefix: '$', tooltip: 'Base dollar amount.' },
            { id: 'avgInflationRate', name: 'Average Annual Inflation Rate', type: 'percentage', defaultValue: 3.2, min: 0, max: 25, step: 0.1, suffix: '%', tooltip: 'Historical US CPI average is ~3.2%.' },
            { id: 'yearsPassed', name: 'Years Elapsed / Horizon', type: 'number', defaultValue: 20, min: 1, max: 100, step: 1, suffix: 'years', tooltip: 'Time horizon.' }
        ],
        naturalLanguageQueries: [
            'Inflation calculator future value',
            'What was $1000 worth 20 years ago?',
            'Purchasing power loss calculator'
        ],
        edgeCases: ['Zero inflation rate', 'Hyperinflation scenarios'],
        calculate: (inputs) => {
            const amount = Number(inputs.startingAmount) || 1000;
            const rate = (Number(inputs.avgInflationRate) || 3.2) / 100;
            const years = Number(inputs.yearsPassed) || 20;

            // Future equivalent cost: Amount * (1 + r)^years
            const futureCost = amount * Math.pow(1 + rate, years);
            // Depreciated purchasing power of today's amount: Amount / (1 + r)^years
            const purchasingPower = amount / Math.pow(1 + rate, years);
            const lossPct = (1 - (purchasingPower / amount)) * 100;

            return {
                primaryOutput: { label: 'Future Equivalent Cost', value: futureCost.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Remaining Purchasing Power Today', value: purchasingPower.toFixed(2), prefix: '$' },
                    { label: 'Cumulative Inflation Increase', value: `${(((futureCost - amount) / amount) * 100).toFixed(1)}%` },
                    { label: 'Real Value Erosion', value: `-${lossPct.toFixed(1)}%` }
                ]
            };
        }
    },

    // 10. Salary to Hourly Pay Converter
    {
        id: 'salary-to-hourly-calculator',
        name: 'Salary to Hourly Pay Converter',
        category: 'finance-business',
        group: '1A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '823K',
        cpc: '$3.40',
        description: 'Converts annual salary into hourly, weekly, bi-weekly, and monthly gross compensation metrics based on work week hours.',
        inputs: [
            { id: 'annualSalary', name: 'Annual Gross Salary', type: 'currency', defaultValue: 75000, min: 1000, step: 2500, prefix: '$', tooltip: 'Gross yearly compensation.' },
            { id: 'hoursPerWeek', name: 'Working Hours Per Week', type: 'number', defaultValue: 40, min: 1, max: 80, step: 1, suffix: 'hrs', tooltip: 'Standard full-time is 40 hours.' },
            { id: 'weeksPerYear', name: 'Paid Weeks Per Year', type: 'number', defaultValue: 52, min: 1, max: 52, step: 1, suffix: 'weeks', tooltip: '52 standard weeks.' }
        ],
        naturalLanguageQueries: [
            '75k salary to hourly pay',
            'Convert annual salary to hourly wage',
            'How much is 40 dollars an hour yearly?'
        ],
        edgeCases: ['Zero hours per week division guard'],
        calculate: (inputs) => {
            const salary = Number(inputs.annualSalary) || 75000;
            const hours = Math.max(1, Number(inputs.hoursPerWeek) || 40);
            const weeks = Math.max(1, Number(inputs.weeksPerYear) || 52);

            const totalAnnualHours = hours * weeks;
            const hourlyWage = salary / totalAnnualHours;
            const weekly = salary / weeks;
            const biWeekly = weekly * 2;
            const monthly = salary / 12;

            return {
                primaryOutput: { label: 'Equivalent Hourly Pay', value: hourlyWage.toFixed(2), prefix: '$', suffix: '/ hr' },
                secondaryMetrics: [
                    { label: 'Bi-Weekly Paycheck (Gross)', value: biWeekly.toFixed(2), prefix: '$' },
                    { label: 'Monthly Gross Income', value: monthly.toFixed(2), prefix: '$' },
                    { label: 'Weekly Gross Pay', value: weekly.toFixed(2), prefix: '$' },
                    { label: 'Total Annual Working Hours', value: `${totalAnnualHours.toLocaleString()} Hours` }
                ]
            };
        }
    }
];