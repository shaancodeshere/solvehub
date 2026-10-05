import { CalculatorDefinition } from '../../types/calculator';

// --- Shared Financial Helpers ---
function calculateAmortizationMonthlyPayment(principal: number, annualRatePct: number, termYears: number): number {
    if (annualRatePct <= 0 || termYears <= 0) return termYears > 0 ? principal / (termYears * 12) : 0;
    const monthlyRate = annualRatePct / 100 / 12;
    const totalMonths = termYears * 12;
    return (principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
}

function calculatePmt(principal: number, annualRatePct: number, totalMonths: number): number {
    if (annualRatePct <= 0 || totalMonths <= 0) return totalMonths > 0 ? principal / totalMonths : 0;
    const monthlyRate = annualRatePct / 100 / 12;
    return (principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
}

function calculateCompoundFutureValue(principal: number, monthlyContrib: number, annualRatePct: number, years: number, compoundsPerYear = 12): number {
    const r = (annualRatePct || 0) / 100;
    const n = compoundsPerYear;
    const t = years;
    const fvPrincipal = principal * Math.pow(1 + r / n, n * t);
    const rMonthly = r / 12;
    const totalMonths = t * 12;
    const fvContributions = rMonthly > 0 ? monthlyContrib * ((Math.pow(1 + rMonthly, totalMonths) - 1) / rMonthly) : monthlyContrib * totalMonths;
    return fvPrincipal + fvContributions;
}

export const financialCalculators: CalculatorDefinition[] = [
    // 1. Mortgage Calculator
    {
        id: 'mortgage-calculator',
        name: 'Mortgage Calculator',
        category: 'finance-business',
        group: 'Loans & Debt',
        bucket: 'Bucket A',
        tier: 1,
        phase: 1,
        monthlySearches: '4.1M',
        cpc: '$1.80',
        description: "A Mortgage Calculator estimates the monthly payment required to repay a home loan over a fixed period of time. It helps users understand how much they will pay each month toward principal and interest, and optionally taxes, insurance, HOA fees, and PMI. The calculator is commonly used when buying a house, comparing mortgage options, or evaluating affordability before applying for a home loan.",
        inputs: [
            { id: 'homePrice', name: 'Home Purchase Price', type: 'currency', defaultValue: 400000, min: 10000, step: 5000, prefix: '$', tooltip: 'Contract purchase price of the home.' },
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
            { id: 'annualHomeInsurance', name: 'Annual Homeowners Insurance', type: 'currency', defaultValue: 1500, min: 0, step: 100, prefix: '$', tooltip: 'Annual hazard and fire policy premium.' },
            { id: 'monthlyHoaFee', name: 'Monthly HOA Dues', type: 'currency', defaultValue: 0, min: 0, step: 25, prefix: '$', tooltip: 'Monthly Homeowners Association fees.' }
        ],
        naturalLanguageQueries: ["What is my monthly mortgage payment on a $400,000 house at 6.5% for 30 years?", "Calculate mortgage 350000 at 7% for 25 years", "How much do I pay monthly on a 500k mortgage?"],
        edgeCases: ["Zero interest loans Down payment greater than home price Negative values Extremely short loan terms Interest-only edge scenarios PMI automatically removed once"],
        calculate: (inputs) => {
            const price = Number(inputs.homePrice) || 400000;
            const down = Math.min(price, Number(inputs.downPayment) || 0);
            const rate = Number(inputs.interestRate) || 6.75;
            const term = Number(inputs.loanTermYears) || 30;
            const taxMonthly = (Number(inputs.annualPropertyTax) || 0) / 12;
            const insMonthly = (Number(inputs.annualHomeInsurance) || 0) / 12;
            const hoaMonthly = Number(inputs.monthlyHoaFee) || 0;

            const principal = Math.max(0, price - down);
            const piMonthly = calculateAmortizationMonthlyPayment(principal, rate, term);
            const ltv = price > 0 ? (principal / price) * 100 : 0;
            const pmiMonthly = ltv > 80 ? (principal * 0.0075) / 12 : 0;
            const totalPiti = piMonthly + taxMonthly + insMonthly + pmiMonthly + hoaMonthly;

            const totalMonths = term * 12;
            const totalInterest = Math.max(0, (piMonthly * totalMonths) - principal);

            return {
                primaryOutput: { label: 'Total Monthly Payment (PITI)', value: totalPiti.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Principal & Interest (P&I)', value: piMonthly.toFixed(2), prefix: '$' },
                    { label: 'Property Tax (Monthly)', value: taxMonthly.toFixed(2), prefix: '$' },
                    { label: 'Home Insurance (Monthly)', value: insMonthly.toFixed(2), prefix: '$' },
                    { label: 'PMI (Monthly)', value: pmiMonthly.toFixed(2), prefix: '$' },
                    { label: 'Total Lifetime Interest', value: totalInterest.toFixed(2), prefix: '$' },
                    { label: 'Loan-to-Value (LTV)', value: `${ltv.toFixed(1)}%` }
                ]
            };
        }
    },

    // 2. Mortgage Payoff Calculator
    {
        id: 'mortgage-payoff-calculator',
        name: 'Mortgage Payoff Calculator',
        category: 'finance-business',
        group: 'Loans & Debt',
        bucket: 'Bucket A',
        tier: 1,
        phase: 1,
        monthlySearches: '74K',
        cpc: '$1.45',
        description: "A Mortgage Payoff Calculator estimates how quickly a borrower can pay off a mortgage early by making additional payments. It shows the impact of extra monthly payments, lump sums, or accelerated payment schedules. The calculator helps users reduce interest costs and shorten the repayment timeline.",
        inputs: [
            { id: 'currentBalance', name: 'Current Mortgage Balance', type: 'currency', defaultValue: 280000, min: 1000, step: 5000, prefix: '$', tooltip: 'Remaining unpaid loan principal.' },
            { id: 'interestRate', name: 'Annual Interest Rate (APR)', type: 'percentage', defaultValue: 6.5, min: 0.1, max: 20, step: 0.125, suffix: '%', tooltip: 'Current interest rate.' },
            { id: 'remainingYears', name: 'Remaining Term (Years)', type: 'number', defaultValue: 25, min: 1, max: 30, step: 1, suffix: 'years', tooltip: 'Years left on current schedule.' },
            { id: 'extraMonthlyPayment', name: 'Extra Monthly Principal', type: 'currency', defaultValue: 200, min: 0, step: 25, prefix: '$', tooltip: 'Additional monthly principal contribution.' },
            { id: 'oneTimeLumpSum', name: 'One-Time Lump Sum Payment', type: 'currency', defaultValue: 5000, min: 0, step: 500, prefix: '$', tooltip: 'Immediate one-time paydown.' }
        ],
        naturalLanguageQueries: ["What is my monthly mortgage payment on a $400,000 house at 6.5% for 30 years?", "Calculate mortgage 350000 at 7% for 25 years", "How much do I pay monthly on a 500k mortgage?"],
        edgeCases: ["Extra payment exceeds balance Zero interest mortgages Negative amortization Lump sum entered after payoff date Very small remaining balances"],
        calculate: (inputs) => {
            const bal = Math.max(0, (Number(inputs.currentBalance) || 280000) - (Number(inputs.oneTimeLumpSum) || 0));
            const apr = Number(inputs.interestRate) || 6.5;
            const years = Number(inputs.remainingYears) || 25;
            const extra = Number(inputs.extraMonthlyPayment) || 0;

            const basePmt = calculateAmortizationMonthlyPayment(Number(inputs.currentBalance) || 280000, apr, years);
            const totalScheduledMonths = years * 12;
            const standardInterest = (basePmt * totalScheduledMonths) - (Number(inputs.currentBalance) || 280000);

            const r = apr / 100 / 12;
            let currentBal = bal;
            let months = 0;
            let totalInterestPaid = 0;

            while (currentBal > 0 && months < 600) {
                months++;
                const interest = currentBal * r;
                totalInterestPaid += interest;
                const principalPaid = Math.min(currentBal, (basePmt - interest) + extra);
                currentBal -= principalPaid;
            }

            const interestSaved = Math.max(0, standardInterest - totalInterestPaid);
            const monthsSaved = Math.max(0, totalScheduledMonths - months);

            return {
                primaryOutput: { label: 'Total Interest Saved', value: interestSaved.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Accelerated Payoff Time', value: `${(months / 12).toFixed(1)} Years`, suffix: `(${months} Months)` },
                    { label: 'Time Saved Off Mortgage', value: `${(monthsSaved / 12).toFixed(1)} Years Earlier` },
                    { label: 'New Total Monthly Payment', value: (basePmt + extra).toFixed(2), prefix: '$' },
                    { label: 'Total Interest Paid', value: totalInterestPaid.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 3. Mortgage Amortization Calculator
    {
        id: 'mortgage-amortization-calculator',
        name: 'Mortgage Amortization Calculator',
        category: 'finance-business',
        group: 'Loans & Debt',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '74K',
        cpc: '$2.26',
        description: "A Mortgage Amortization Calculator generates a detailed payment schedule for a mortgage loan. It shows how each payment is divided between principal and interest over the life of the loan. The calculator helps users visualize balance reduction and total interest accumulation.",
        inputs: [
            { id: 'loanAmount', name: 'Mortgage Principal Amount', type: 'currency', defaultValue: 300000, min: 1000, step: 5000, prefix: '$', tooltip: 'Total loan balance.' },
            { id: 'interestRate', name: 'Annual Interest Rate (APR)', type: 'percentage', defaultValue: 6.5, min: 0.1, max: 20, step: 0.125, suffix: '%', tooltip: 'Annual interest rate.' },
            { id: 'loanTermYears', name: 'Loan Term (Years)', type: 'dropdown', defaultValue: 30, options: [{ label: '30-Year Fixed', value: 30 }, { label: '15-Year Fixed', value: 15 }, { label: '10-Year Fixed', value: 10 }], tooltip: 'Schedule length.' }
        ],
        naturalLanguageQueries: ["What is my monthly mortgage payment on a $400,000 house at 6.5% for 30 years?", "Calculate mortgage 350000 at 7% for 25 years", "How much do I pay monthly on a 500k mortgage?"],
        edgeCases: ["Rounding causing negative ending balance Zero interest loans Non-monthly frequencies Balloon payment scenarios"],
        calculate: (inputs) => {
            const p = Number(inputs.loanAmount) || 300000;
            const apr = Number(inputs.interestRate) || 6.5;
            const term = Number(inputs.loanTermYears) || 30;
            const monthly = calculateAmortizationMonthlyPayment(p, apr, term);
            const totalMonths = term * 12;
            const totalPaid = monthly * totalMonths;
            const totalInterest = Math.max(0, totalPaid - p);

            return {
                primaryOutput: { label: 'Monthly Principal & Interest', value: monthly.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Loan Principal', value: p.toFixed(2), prefix: '$' },
                    { label: 'Total Lifetime Interest', value: totalInterest.toFixed(2), prefix: '$' },
                    { label: 'Total Lifetime Repaid', value: totalPaid.toFixed(2), prefix: '$' },
                    { label: 'Total Number of Payments', value: `${totalMonths} Months` }
                ]
            };
        }
    },

    // 4. FHA Loan Calculator
    {
        id: 'fha-loan-calculator',
        name: 'FHA Loan Calculator',
        category: 'finance-business',
        group: 'Loans & Debt',
        bucket: 'Bucket A',
        tier: 2,
        phase: 2,
        monthlySearches: '27K',
        cpc: '$4.46',
        description: "An FHA Loan Calculator estimates monthly payments and insurance costs for loans insured by the Federal Housing Administration. It accounts for FHA mortgage insurance premiums and lower down payment requirements. The calculator is designed for borrowers using FHA-backed mortgages.",
        inputs: [
            { id: 'homePrice', name: 'Home Purchase Price', type: 'currency', defaultValue: 350000, min: 10000, step: 5000, prefix: '$', tooltip: 'Purchase price.' },
            { id: 'downPaymentPct', name: 'Down Payment Percentage', type: 'percentage', defaultValue: 3.5, min: 3.5, max: 50, step: 0.5, suffix: '%', tooltip: 'FHA minimum is 3.5%.' },
            { id: 'interestRate', name: 'Mortgage Interest Rate', type: 'percentage', defaultValue: 6.25, min: 0.1, max: 20, step: 0.125, suffix: '%', tooltip: 'Annual interest rate.' },
            { id: 'loanTermYears', name: 'Loan Term', type: 'dropdown', defaultValue: 30, options: [{ label: '30-Year Fixed', value: 30 }, { label: '15-Year Fixed', value: 15 }], tooltip: 'Mortgage duration.' },
            { id: 'upfrontMipPct', name: 'Upfront MIP Rate', type: 'percentage', defaultValue: 1.75, min: 0, max: 3, step: 0.05, suffix: '%', tooltip: 'Standard FHA Upfront MIP is 1.75%.' },
            { id: 'annualMipPct', name: 'Annual MIP Rate', type: 'percentage', defaultValue: 0.55, min: 0, max: 2, step: 0.05, suffix: '%', tooltip: 'Standard FHA Annual MIP is 0.55%.' },
            { id: 'annualPropertyTax', name: 'Annual Property Tax', type: 'currency', defaultValue: 4200, min: 0, step: 100, prefix: '$', tooltip: 'Property taxes.' },
            { id: 'annualInsurance', name: 'Annual Home Insurance', type: 'currency', defaultValue: 1400, min: 0, step: 50, prefix: '$', tooltip: 'Hazard insurance.' }
        ],
        naturalLanguageQueries: ["What is my monthly payment on a $20,000 loan at 5% for 5 years?", "Calculate loan payment 15000 at 8% over 3 years", "How much interest will I pay on a $50,000 loan?"],
        edgeCases: ["Minimum FHA down payment validation Loan limits by county MIP removal conditions High loan balances"],
        calculate: (inputs) => {
            const price = Number(inputs.homePrice) || 350000;
            const downPct = (Number(inputs.downPaymentPct) || 3.5) / 100;
            const down = price * downPct;
            const baseLoan = Math.max(0, price - down);
            const ufmipRate = (Number(inputs.upfrontMipPct) || 1.75) / 100;
            const ufmip = baseLoan * ufmipRate;
            const totalLoanFinanced = baseLoan + ufmip;

            const rate = Number(inputs.interestRate) || 6.25;
            const term = Number(inputs.loanTermYears) || 30;
            const piMonthly = calculateAmortizationMonthlyPayment(totalLoanFinanced, rate, term);

            const annualMipRate = (Number(inputs.annualMipPct) || 0.55) / 100;
            const monthlyMip = (baseLoan * annualMipRate) / 12;
            const taxMonthly = (Number(inputs.annualPropertyTax) || 0) / 12;
            const insMonthly = (Number(inputs.annualInsurance) || 0) / 12;

            const totalMonthly = piMonthly + monthlyMip + taxMonthly + insMonthly;

            return {
                primaryOutput: { label: 'Total Monthly FHA Payment', value: totalMonthly.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Principal & Interest (P&I)', value: piMonthly.toFixed(2), prefix: '$' },
                    { label: 'Monthly FHA MIP', value: monthlyMip.toFixed(2), prefix: '$' },
                    { label: 'Upfront MIP Financed', value: ufmip.toFixed(2), prefix: '$' },
                    { label: 'Total Loan Amount Financed', value: totalLoanFinanced.toFixed(2), prefix: '$' },
                    { label: 'Down Payment Required', value: down.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 5. VA Mortgage Calculator
    {
        id: 'va-mortgage-calculator',
        name: 'VA Mortgage Calculator',
        category: 'finance-business',
        group: 'Loans & Debt',
        bucket: 'Bucket A',
        tier: 3,
        phase: 2,
        monthlySearches: '15K',
        cpc: '$8.24  ★ HIGH CPC',
        description: "A VA Mortgage Calculator estimates payments for loans backed by the U. S. Department of Veterans Affairs.",
        inputs: [
            { id: 'homePrice', name: 'Home Purchase Price', type: 'currency', defaultValue: 380000, min: 10000, step: 5000, prefix: '$', tooltip: 'Purchase price.' },
            { id: 'downPayment', name: 'Down Payment Amount', type: 'currency', defaultValue: 0, min: 0, step: 2500, prefix: '$', tooltip: 'VA loans support 0% down.' },
            { id: 'interestRate', name: 'Mortgage Interest Rate', type: 'percentage', defaultValue: 6.25, min: 0.1, max: 20, step: 0.125, suffix: '%', tooltip: 'Annual rate.' },
            { id: 'loanTermYears', name: 'Loan Term (Years)', type: 'dropdown', defaultValue: 30, options: [{ label: '30-Year Fixed', value: 30 }, { label: '15-Year Fixed', value: 15 }], tooltip: 'Term.' },
            { id: 'fundingFeePct', name: 'VA Funding Fee Percentage', type: 'percentage', defaultValue: 2.15, min: 0, max: 5, step: 0.05, suffix: '%', tooltip: 'Typically 2.15% for first-time use with 0% down.' },
            { id: 'isExempt', name: 'Disability / Exemption Toggle', type: 'toggle', defaultValue: false, tooltip: 'Service-connected disability waives fee.' }
        ],
        naturalLanguageQueries: ["What is my monthly mortgage payment on a $400,000 house at 6.5% for 30 years?", "Calculate mortgage 350000 at 7% for 25 years", "How much do I pay monthly on a 500k mortgage?"],
        edgeCases: ["Funding fee exemptions Zero down financing VA jumbo loans Disabled veteran rules"],
        calculate: (inputs) => {
            const price = Number(inputs.homePrice) || 380000;
            const down = Math.min(price, Number(inputs.downPayment) || 0);
            const baseLoan = Math.max(0, price - down);
            const isExempt = Boolean(inputs.isExempt);
            const feePct = isExempt ? 0 : (Number(inputs.fundingFeePct) || 2.15) / 100;
            const fundingFee = baseLoan * feePct;
            const totalLoan = baseLoan + fundingFee;

            const rate = Number(inputs.interestRate) || 6.25;
            const term = Number(inputs.loanTermYears) || 30;
            const piMonthly = calculateAmortizationMonthlyPayment(totalLoan, rate, term);
            const totalPaid = piMonthly * (term * 12);
            const totalInterest = Math.max(0, totalPaid - totalLoan);

            return {
                primaryOutput: { label: 'Monthly VA Loan Payment', value: piMonthly.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'VA Funding Fee Amount', value: fundingFee.toFixed(2), prefix: '$' },
                    { label: 'Total Loan Financed', value: totalLoan.toFixed(2), prefix: '$' },
                    { label: 'Total Lifetime Interest', value: totalInterest.toFixed(2), prefix: '$' },
                    { label: 'Funding Fee Status', value: isExempt ? 'Fee Waived (Exempt)' : 'Financed into Loan' }
                ]
            };
        }
    },

    // 6. Auto Loan Calculator
    {
        id: 'auto-loan-calculator',
        name: 'Auto Loan Calculator',
        category: 'finance-business',
        group: 'Loans & Debt',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '823K',
        cpc: '$1.44',
        description: "An Auto Loan Calculator estimates monthly payments and total borrowing costs for financing a vehicle purchase. It includes taxes, fees, trade-ins, and down payments. The calculator helps users compare financing options before buying a car.",
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
        naturalLanguageQueries: ["What is my monthly payment on a $20,000 loan at 5% for 5 years?", "Calculate loan payment 15000 at 8% over 3 years", "How much interest will I pay on a $50,000 loan?"],
        edgeCases: ["Negative equity trade-ins Zero APR financing Very short terms Balloon payments"],
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
            const totalInterest = Math.max(0, totalPaid - principal);

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

    // 7. Boat Loan Calculator
    {
        id: 'boat-loan-calculator',
        name: 'Boat Loan Calculator',
        category: 'finance-business',
        group: 'Loans & Debt',
        bucket: 'Bucket B',
        tier: 2,
        phase: 3,
        monthlySearches: '50K',
        cpc: '$1.68',
        description: "A Boat Loan Calculator estimates financing costs for purchasing a boat or marine vehicle. It calculates periodic payments and total interest over the loan term. The calculator helps buyers compare marine financing options.",
        inputs: [
            { id: 'boatPrice', name: 'Boat Purchase Price', type: 'currency', defaultValue: 65000, min: 1000, step: 2500, prefix: '$', tooltip: 'Price of the vessel.' },
            { id: 'downPayment', name: 'Down Payment Amount', type: 'currency', defaultValue: 10000, min: 0, step: 1000, prefix: '$', tooltip: 'Upfront cash deposit.' },
            { id: 'interestRate', name: 'Annual Interest Rate (APR)', type: 'percentage', defaultValue: 7.5, min: 0.1, max: 25, step: 0.25, suffix: '%', tooltip: 'Marine loan APR.' },
            { id: 'loanTermYears', name: 'Loan Term (Years)', type: 'dropdown', defaultValue: 10, options: [{ label: '5 Years', value: 5 }, { label: '10 Years', value: 10 }, { label: '15 Years', value: 15 }, { label: '20 Years', value: 20 }], tooltip: 'Marine loan term length.' }
        ],
        naturalLanguageQueries: ["What is my monthly payment on a $20,000 loan at 5% for 5 years?", "Calculate loan payment 15000 at 8% over 3 years", "How much interest will I pay on a $50,000 loan?"],
        edgeCases: ["Luxury boat long-term loans High interest subprime loans Zero down financing"],
        calculate: (inputs) => {
            const price = Number(inputs.boatPrice) || 65000;
            const down = Math.min(price, Number(inputs.downPayment) || 0);
            const principal = Math.max(0, price - down);
            const apr = Number(inputs.interestRate) || 7.5;
            const term = Number(inputs.loanTermYears) || 10;
            const monthly = calculateAmortizationMonthlyPayment(principal, apr, term);
            const totalPaid = monthly * (term * 12);
            const totalInterest = Math.max(0, totalPaid - principal);

            return {
                primaryOutput: { label: 'Monthly Marine Loan Payment', value: monthly.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Principal Financed', value: principal.toFixed(2), prefix: '$' },
                    { label: 'Total Lifetime Interest', value: totalInterest.toFixed(2), prefix: '$' },
                    { label: 'Total Cost of Vessel', value: (totalPaid + down).toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 8. Personal Loan Calculator
    {
        id: 'personal-loan-calculator',
        name: 'Personal Loan Calculator',
        category: 'finance-business',
        group: 'Loans & Debt',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '368K',
        cpc: '$4.35',
        description: "A Personal Loan Calculator estimates monthly repayments for unsecured personal loans. It helps borrowers evaluate affordability and total borrowing costs. The calculator is commonly used for debt consolidation, emergencies, or major purchases.",
        inputs: [
            { id: 'loanAmount', name: 'Loan Amount Requested', type: 'currency', defaultValue: 15000, min: 500, step: 500, prefix: '$', tooltip: 'Borrowed amount.' },
            { id: 'interestRate', name: 'Annual Interest Rate (APR)', type: 'percentage', defaultValue: 10.5, min: 0.1, max: 36, step: 0.25, suffix: '%', tooltip: 'Fixed personal loan APR.' },
            { id: 'loanTermMonths', name: 'Loan Duration (Months)', type: 'dropdown', defaultValue: 36, options: [{ label: '12 Months (1 Yr)', value: 12 }, { label: '24 Months (2 Yrs)', value: 24 }, { label: '36 Months (3 Yrs)', value: 36 }, { label: '48 Months (4 Yrs)', value: 48 }, { label: '60 Months (5 Yrs)', value: 60 }], tooltip: 'Repayment term.' }
        ],
        naturalLanguageQueries: ["What is my monthly payment on a $20,000 loan at 5% for 5 years?", "Calculate loan payment 15000 at 8% over 3 years", "How much interest will I pay on a $50,000 loan?"],
        edgeCases: ["High origination fees Zero interest loans Short-term loans"],
        calculate: (inputs) => {
            const p = Number(inputs.loanAmount) || 15000;
            const apr = Number(inputs.interestRate) || 10.5;
            const months = Number(inputs.loanTermMonths) || 36;
            const monthly = calculatePmt(p, apr, months);
            const totalPaid = monthly * months;
            const totalInterest = Math.max(0, totalPaid - p);

            return {
                primaryOutput: { label: 'Monthly Payment', value: monthly.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Principal Borrowed', value: p.toFixed(2), prefix: '$' },
                    { label: 'Total Finance Charge (Interest)', value: totalInterest.toFixed(2), prefix: '$' },
                    { label: 'Total Repayment Amount', value: totalPaid.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 9. Business Loan Calculator
    {
        id: 'business-loan-calculator',
        name: 'Business Loan Calculator',
        category: 'finance-business',
        group: 'Loans & Debt',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '33K',
        cpc: '$8.09  ★ HIGH CPC',
        description: "A Business Loan Calculator estimates payments and borrowing costs for commercial loans. It supports term loans, SBA loans, and other business financing structures. The calculator helps business owners project repayment obligations.",
        inputs: [
            { id: 'loanAmount', name: 'Commercial Loan Amount', type: 'currency', defaultValue: 100000, min: 5000, step: 5000, prefix: '$', tooltip: 'Capital borrowed for business.' },
            { id: 'interestRate', name: 'Interest Rate (APR)', type: 'percentage', defaultValue: 8.5, min: 0.1, max: 30, step: 0.25, suffix: '%', tooltip: 'Annual interest rate.' },
            { id: 'loanTermYears', name: 'Loan Term (Years)', type: 'number', defaultValue: 5, min: 1, max: 25, step: 1, suffix: 'years', tooltip: 'Loan duration in years.' },
            { id: 'originationFeePct', name: 'Origination / Closing Fee', type: 'percentage', defaultValue: 2.0, min: 0, max: 10, step: 0.25, suffix: '%', tooltip: 'Upfront lender fee.' }
        ],
        naturalLanguageQueries: ["What is my monthly payment on a $20,000 loan at 5% for 5 years?", "Calculate loan payment 15000 at 8% over 3 years", "How much interest will I pay on a $50,000 loan?"],
        edgeCases: ["Daily repayment loans Balloon commercial loans Variable interest loans"],
        calculate: (inputs) => {
            const p = Number(inputs.loanAmount) || 100000;
            const apr = Number(inputs.interestRate) || 8.5;
            const term = Number(inputs.loanTermYears) || 5;
            const feePct = (Number(inputs.originationFeePct) || 2.0) / 100;
            const origFee = p * feePct;
            const netCapital = p - origFee;

            const monthly = calculateAmortizationMonthlyPayment(p, apr, term);
            const totalRepaid = monthly * (term * 12);
            const totalInterest = Math.max(0, totalRepaid - p);
            const effectiveCost = totalInterest + origFee;

            return {
                primaryOutput: { label: 'Monthly Business Loan Payment', value: monthly.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Net Capital Received', value: netCapital.toFixed(2), prefix: '$' },
                    { label: 'Upfront Origination Fee', value: origFee.toFixed(2), prefix: '$' },
                    { label: 'Total Interest Paid', value: totalInterest.toFixed(2), prefix: '$' },
                    { label: 'Total Cost of Financing', value: effectiveCost.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 10. Student Loan Calculator
    {
        id: 'student-loan-calculator',
        name: 'Student Loan Calculator',
        category: 'finance-business',
        group: 'Loans & Debt',
        bucket: 'Bucket A',
        tier: 2,
        phase: 2,
        monthlySearches: '60K',
        cpc: '$4.82',
        description: "A Student Loan Calculator estimates repayment schedules and interest costs for education loans. It supports standard, graduated, and income-based repayment estimates. The calculator helps students understand future loan obligations.",
        inputs: [
            { id: 'loanBalance', name: 'Total Student Loan Balance', type: 'currency', defaultValue: 35000, min: 1000, step: 1000, prefix: '$', tooltip: 'Total student debt.' },
            { id: 'interestRate', name: 'Annual Interest Rate (APR)', type: 'percentage', defaultValue: 5.5, min: 0.1, max: 20, step: 0.1, suffix: '%', tooltip: 'Federal or private student loan interest rate.' },
            { id: 'loanTermYears', name: 'Standard Repayment Term', type: 'dropdown', defaultValue: 10, options: [{ label: '10 Years (Standard)', value: 10 }, { label: '15 Years', value: 15 }, { label: '20 Years (Extended)', value: 20 }, { label: '25 Years (IDR Plan)', value: 25 }], tooltip: 'Repayment period.' }
        ],
        naturalLanguageQueries: ["What is my monthly payment on a $20,000 loan at 5% for 5 years?", "Calculate loan payment 15000 at 8% over 3 years", "How much interest will I pay on a $50,000 loan?"],
        edgeCases: ["Deferred repayment Income-based estimates Interest capitalization"],
        calculate: (inputs) => {
            const p = Number(inputs.loanBalance) || 35000;
            const apr = Number(inputs.interestRate) || 5.5;
            const term = Number(inputs.loanTermYears) || 10;
            const monthly = calculateAmortizationMonthlyPayment(p, apr, term);
            const totalPaid = monthly * (term * 12);
            const totalInterest = Math.max(0, totalPaid - p);

            return {
                primaryOutput: { label: 'Monthly Student Loan Payment', value: monthly.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Principal Repaid', value: p.toFixed(2), prefix: '$' },
                    { label: 'Total Lifetime Interest', value: totalInterest.toFixed(2), prefix: '$' },
                    { label: 'Total Cumulative Payments', value: totalPaid.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 11. Loan Calculator
    {
        id: 'loan-calculator',
        name: 'Loan Calculator',
        category: 'finance-business',
        group: 'Loans & Debt',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '1.5M',
        cpc: '$2.32',
        description: "A general Loan Calculator estimates periodic payments and borrowing costs for installment loans. It supports a wide range of financing scenarios. The calculator acts as a universal financing estimator.",
        inputs: [
            { id: 'loanAmount', name: 'Total Loan Principal', type: 'currency', defaultValue: 20000, min: 100, step: 500, prefix: '$', tooltip: 'Borrowed amount.' },
            { id: 'interestRate', name: 'Interest Rate (APR)', type: 'percentage', defaultValue: 7.5, min: 0, max: 40, step: 0.25, suffix: '%', tooltip: 'Annual rate.' },
            { id: 'loanTermMonths', name: 'Loan Duration (Months)', type: 'number', defaultValue: 48, min: 1, max: 360, step: 1, suffix: 'months', tooltip: 'Duration in months.' }
        ],
        naturalLanguageQueries: ["What is my monthly payment on a $20,000 loan at 5% for 5 years?", "Calculate loan payment 15000 at 8% over 3 years", "How much interest will I pay on a $50,000 loan?"],
        edgeCases: ["Zero interest loans Negative values Extremely long repayment periods"],
        calculate: (inputs) => {
            const p = Number(inputs.loanAmount) || 20000;
            const apr = Number(inputs.interestRate) || 7.5;
            const months = Math.max(1, Number(inputs.loanTermMonths) || 48);
            const monthly = calculatePmt(p, apr, months);
            const totalPaid = monthly * months;
            const totalInterest = Math.max(0, totalPaid - p);

            return {
                primaryOutput: { label: 'Monthly Payment', value: monthly.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Interest Charge', value: totalInterest.toFixed(2), prefix: '$' },
                    { label: 'Total Repayment Outlay', value: totalPaid.toFixed(2), prefix: '$' },
                    { label: 'Annual Loan Cost (APR)', value: `${apr.toFixed(2)}%` }
                ]
            };
        }
    },

    // 12. Repayment Calculator
    {
        id: 'repayment-calculator',
        name: 'Repayment Calculator',
        category: 'finance-business',
        group: 'Loans & Debt',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '60K',
        cpc: '$0.58',
        description: "A Repayment Calculator estimates the amount required to fully repay a debt over time. It may support loans, credit balances, or repayment plans. The calculator helps borrowers understand repayment obligations.",
        inputs: [
            { id: 'principal', name: 'Outstanding Debt Principal', type: 'currency', defaultValue: 12000, min: 500, step: 500, prefix: '$', tooltip: 'Total debt balance.' },
            { id: 'interestRate', name: 'Interest Rate (APR)', type: 'percentage', defaultValue: 9.0, min: 0.1, max: 35, step: 0.25, suffix: '%', tooltip: 'Annual interest rate.' },
            { id: 'targetMonths', name: 'Desired Repayment Horizon (Months)', type: 'number', defaultValue: 24, min: 1, max: 120, step: 1, suffix: 'months', tooltip: 'Target months to clear balance.' }
        ],
        naturalLanguageQueries: ["Calculate my repayment", "What is my repayment?", "Help me work out repayment"],
        edgeCases: ["Underpayment causing negative amortization Zero interest High APR loans"],
        calculate: (inputs) => {
            const p = Number(inputs.principal) || 12000;
            const apr = Number(inputs.interestRate) || 9.0;
            const months = Math.max(1, Number(inputs.targetMonths) || 24);
            const monthly = calculatePmt(p, apr, months);
            const totalRepaid = monthly * months;
            const totalInterest = Math.max(0, totalRepaid - p);

            return {
                primaryOutput: { label: 'Required Monthly Repayment', value: monthly.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Lifetime Interest', value: totalInterest.toFixed(2), prefix: '$' },
                    { label: 'Total Repayment Sum', value: totalRepaid.toFixed(2), prefix: '$' },
                    { label: 'Debt-Free In', value: `${(months / 12).toFixed(1)} Years (${months} Months)` }
                ]
            };
        }
    },

    // 13. Refinance Calculator
    {
        id: 'refinance-calculator',
        name: 'Refinance Calculator',
        category: 'finance-business',
        group: 'Loans & Debt',
        bucket: 'Bucket A',
        tier: 2,
        phase: 2,
        monthlySearches: '60K',
        cpc: '$6.46  ★ HIGH CPC',
        description: "A Refinance Calculator compares an existing loan against a new refinancing option. It helps users determine savings, break-even points, and repayment impacts. The calculator is commonly used for mortgage refinancing.",
        inputs: [
            { id: 'currentBalance', name: 'Remaining Mortgage Balance', type: 'currency', defaultValue: 320000, min: 10000, step: 5000, prefix: '$', tooltip: 'Current loan principal owed.' },
            { id: 'currentRate', name: 'Current Mortgage Rate', type: 'percentage', defaultValue: 7.25, min: 1, max: 15, step: 0.125, suffix: '%', tooltip: 'Existing rate.' },
            { id: 'currentTermYears', name: 'Years Remaining on Current Loan', type: 'number', defaultValue: 27, min: 1, max: 30, step: 1, suffix: 'years', tooltip: 'Remaining term.' },
            { id: 'newRate', name: 'New Proposed Mortgage Rate', type: 'percentage', defaultValue: 5.875, min: 1, max: 15, step: 0.125, suffix: '%', tooltip: 'Refinance rate.' },
            { id: 'newTermYears', name: 'New Loan Term', type: 'dropdown', defaultValue: 30, options: [{ label: '30-Year Fixed', value: 30 }, { label: '15-Year Fixed', value: 15 }], tooltip: 'New loan duration.' },
            { id: 'closingCosts', name: 'Refinance Closing Costs', type: 'currency', defaultValue: 6500, min: 0, step: 250, prefix: '$', tooltip: 'Lender fees, title, appraisal.' }
        ],
        naturalLanguageQueries: ["Calculate my refinance", "What is my refinance?", "Help me work out refinance"],
        edgeCases: ["Negative savings refinance Cash-out refinance Adjustable-rate loans"],
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
                primaryOutput: { label: 'Monthly Payment Reduction', value: monthlySavings > 0 ? monthlySavings.toFixed(2) : '0.00', prefix: '$' },
                secondaryMetrics: [
                    { label: 'Break-Even Timeframe', value: monthlySavings > 0 ? `${breakEvenMonths.toFixed(1)} Months (~${(breakEvenMonths / 12).toFixed(1)} yrs)` : 'N/A (No Savings)' },
                    { label: 'Lifetime Net Savings', value: lifetimeSavings.toFixed(2), prefix: '$' },
                    { label: 'New Monthly Principal & Interest', value: newMonthly.toFixed(2), prefix: '$' },
                    { label: 'Upfront Refinance Fees', value: closing.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 14. Debt Payoff Calculator
    {
        id: 'debt-payoff-calculator',
        name: 'Debt Payoff Calculator',
        category: 'finance-business',
        group: 'Loans & Debt',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '22K',
        cpc: '$5.01  ★ HIGH CPC',
        description: "A Debt Payoff Calculator estimates how long it will take to eliminate debt balances. It supports payoff strategies such as avalanche and snowball methods. The calculator helps users optimize repayment planning.",
        inputs: [
            { id: 'totalDebt', name: 'Total Debt Balance', type: 'currency', defaultValue: 18000, min: 500, step: 500, prefix: '$', tooltip: 'Cumulative debt.' },
            { id: 'avgInterestRate', name: 'Average Interest Rate (APR)', type: 'percentage', defaultValue: 16.5, min: 0.1, max: 35, step: 0.25, suffix: '%', tooltip: 'Blended APR.' },
            { id: 'monthlyPayment', name: 'Monthly Payment Budget', type: 'currency', defaultValue: 600, min: 50, step: 25, prefix: '$', tooltip: 'Monthly debt payoff budget.' }
        ],
        naturalLanguageQueries: ["Calculate my debt payoff", "What is my debt payoff?", "Help me work out debt payoff"],
        edgeCases: ["Minimum payment less than accrued interest Variable APR debts Extra payment insufficient"],
        calculate: (inputs) => {
            const debt = Number(inputs.totalDebt) || 18000;
            const apr = Number(inputs.avgInterestRate) || 16.5;
            const pmt = Number(inputs.monthlyPayment) || 600;
            const r = apr / 100 / 12;

            const minInterest = debt * r;
            if (pmt <= minInterest) {
                return {
                    primaryOutput: { label: 'Payoff Status', value: 'Payment Too Low to Cover Interest' },
                    secondaryMetrics: [
                        { label: 'Minimum Interest Accrual / Mo', value: minInterest.toFixed(2), prefix: '$' }
                    ]
                };
            }

            let bal = debt;
            let months = 0;
            let totalInterest = 0;

            while (bal > 0 && months < 360) {
                months++;
                const interest = bal * r;
                totalInterest += interest;
                const principal = pmt - interest;
                bal -= principal;
            }

            return {
                primaryOutput: { label: 'Time to Become Debt-Free', value: `${(months / 12).toFixed(1)} Years`, suffix: `(${months} Months)` },
                secondaryMetrics: [
                    { label: 'Total Interest Paid', value: totalInterest.toFixed(2), prefix: '$' },
                    { label: 'Total Cash Outlay', value: (debt + totalInterest).toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 15. Debt Consolidation Calculator
    {
        id: 'debt-consolidation-calculator',
        name: 'Debt Consolidation Calculator',
        category: 'finance-business',
        group: 'Loans & Debt',
        bucket: 'Bucket B',
        tier: 1,
        phase: 3,
        monthlySearches: '4K',
        cpc: '$17.75  ★ HIGH CPC',
        description: "A Debt Consolidation Calculator compares multiple debts against a single consolidation loan. It helps determine whether consolidation reduces monthly payments or interest costs. The calculator supports personal loans, balance transfers, and refinancing.",
        inputs: [
            { id: 'totalCurrentDebt', name: 'Total Debt to Consolidate', type: 'currency', defaultValue: 25000, min: 1000, step: 1000, prefix: '$', tooltip: 'Existing debt balance.' },
            { id: 'currentAvgRate', name: 'Current Blended APR', type: 'percentage', defaultValue: 22.0, min: 1, max: 40, step: 0.5, suffix: '%', tooltip: 'Current weighted interest rate.' },
            { id: 'currentMonthlyPayment', name: 'Current Total Monthly Payments', type: 'currency', defaultValue: 850, min: 50, step: 25, prefix: '$', tooltip: 'Current combined payments.' },
            { id: 'consolidationLoanRate', name: 'Consolidation Loan APR', type: 'percentage', defaultValue: 9.9, min: 1, max: 30, step: 0.25, suffix: '%', tooltip: 'New consolidation loan rate.' },
            { id: 'consolidationTermYears', name: 'Consolidation Term (Years)', type: 'dropdown', defaultValue: 4, options: [{ label: '3 Years (36 Mo)', value: 3 }, { label: '4 Years (48 Mo)', value: 4 }, { label: '5 Years (60 Mo)', value: 5 }], tooltip: 'Consolidation duration.' }
        ],
        naturalLanguageQueries: ["Calculate my debt consolidation", "What is my debt consolidation?", "Help me work out debt consolidation"],
        edgeCases: ["Consolidation increases total interest Longer terms reducing payment but increasing cost Balance transfer expiration rates"],
        calculate: (inputs) => {
            const debt = Number(inputs.totalCurrentDebt) || 25000;
            const newApr = Number(inputs.consolidationLoanRate) || 9.9;
            const term = Number(inputs.consolidationTermYears) || 4;
            const curPmt = Number(inputs.currentMonthlyPayment) || 850;

            const newMonthly = calculateAmortizationMonthlyPayment(debt, newApr, term);
            const monthlySavings = curPmt - newMonthly;
            const totalNewRepaid = newMonthly * (term * 12);
            const totalNewInterest = totalNewRepaid - debt;

            return {
                primaryOutput: { label: 'New Consolidated Monthly Payment', value: newMonthly.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Monthly Payment Savings', value: monthlySavings > 0 ? monthlySavings.toFixed(2) : '0.00', prefix: '$' },
                    { label: 'Total Interest on Consolidation', value: totalNewInterest.toFixed(2), prefix: '$' },
                    { label: 'Consolidation Term', value: `${term * 12} Months (${term} Years)` }
                ]
            };
        }
    },

    // 16. Debt-to-Income Ratio Calculator
    {
        id: 'debt-to-income-ratio-calculator',
        name: 'Debt-to-Income Ratio Calculator',
        category: 'finance-business',
        group: 'Loans & Debt',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '27K',
        cpc: '$1.53',
        description: "A Debt-to-Income Ratio Calculator measures how much of a borrower\u2019s income goes toward debt obligations. Lenders use DTI to evaluate creditworthiness. The calculator helps borrowers assess financial health and loan eligibility.",
        inputs: [
            { id: 'grossMonthlyIncome', name: 'Gross Monthly Income', type: 'currency', defaultValue: 8000, min: 500, step: 250, prefix: '$', tooltip: 'Pre-tax total monthly household earnings.' },
            { id: 'monthlyMortgageRent', name: 'Monthly Housing Payment (Rent/Mortgage)', type: 'currency', defaultValue: 2000, min: 0, step: 100, prefix: '$', tooltip: 'Primary residence housing expense.' },
            { id: 'monthlyAutoLoans', name: 'Monthly Auto Loan Payments', type: 'currency', defaultValue: 450, min: 0, step: 50, prefix: '$', tooltip: 'Vehicle loan/lease obligations.' },
            { id: 'monthlyCreditCards', name: 'Monthly Minimum Credit Card Payments', type: 'currency', defaultValue: 200, min: 0, step: 25, prefix: '$', tooltip: 'Total minimum credit card dues.' },
            { id: 'monthlyOtherDebts', name: 'Student Loans & Other Debt Payments', type: 'currency', defaultValue: 350, min: 0, step: 25, prefix: '$', tooltip: 'Personal, student, or alimony obligations.' }
        ],
        naturalLanguageQueries: ["Calculate my debt-to-income ratio", "What is my debt-to-income ratio?", "Help me work out debt-to-income ratio"],
        edgeCases: ["Zero income Negative income Missing debts"],
        calculate: (inputs) => {
            const income = Math.max(1, Number(inputs.grossMonthlyIncome) || 8000);
            const housing = Number(inputs.monthlyMortgageRent) || 2000;
            const auto = Number(inputs.monthlyAutoLoans) || 450;
            const cards = Number(inputs.monthlyCreditCards) || 200;
            const other = Number(inputs.monthlyOtherDebts) || 350;

            const totalDebt = housing + auto + cards + other;
            const frontEndDti = (housing / income) * 100;
            const backEndDti = (totalDebt / income) * 100;

            let status = 'Excellent (Under 36%)';
            if (backEndDti > 50) status = 'High Risk (>50%)';
            else if (backEndDti > 43) status = 'Qualified Mortgage Limit (43-50%)';
            else if (backEndDti > 36) status = 'Moderate (36-43%)';

            return {
                primaryOutput: { label: 'Back-End DTI Ratio', value: `${backEndDti.toFixed(1)}%` },
                secondaryMetrics: [
                    { label: 'Front-End (Housing) DTI', value: `${frontEndDti.toFixed(1)}%` },
                    { label: 'Total Monthly Debt Service', value: totalDebt.toFixed(2), prefix: '$' },
                    { label: 'Remaining Discretionary Income', value: (income - totalDebt).toFixed(2), prefix: '$' },
                    { label: 'Lending Assessment Status', value: status }
                ]
            };
        }
    },

    // 17. Credit Card Calculator
    {
        id: 'credit-card-calculator',
        name: 'Credit Card Calculator',
        category: 'finance-business',
        group: 'Loans & Debt',
        bucket: 'Bucket B',
        tier: 3,
        phase: 2,
        monthlySearches: '18K',
        cpc: '$3.71',
        description: "A Credit Card Calculator estimates payments, payoff time, and interest costs on revolving credit balances. It helps borrowers understand the long-term cost of carrying balances. The calculator is useful for budgeting and repayment planning.",
        inputs: [
            { id: 'balance', name: 'Credit Card Balance', type: 'currency', defaultValue: 5000, min: 100, step: 100, prefix: '$', tooltip: 'Current card balance.' },
            { id: 'interestRate', name: 'Annual APR', type: 'percentage', defaultValue: 22.5, min: 1, max: 40, step: 0.25, suffix: '%', tooltip: 'Credit card interest rate.' },
            { id: 'monthlyPayment', name: 'Monthly Payment Amount', type: 'currency', defaultValue: 200, min: 15, step: 15, prefix: '$', tooltip: 'Payment made each month.' }
        ],
        naturalLanguageQueries: ["Calculate my credit card", "What is my credit card?", "Help me work out credit card"],
        edgeCases: ["Payment below accrued interest APR changes Ongoing spending exceeding payments"],
        calculate: (inputs) => {
            const bal = Number(inputs.balance) || 5000;
            const apr = Number(inputs.interestRate) || 22.5;
            const pmt = Number(inputs.monthlyPayment) || 200;
            const r = apr / 100 / 12;

            if (pmt <= bal * r) {
                return {
                    primaryOutput: { label: 'Payoff Status', value: 'Payment Less than Monthly Interest Accrual' },
                    secondaryMetrics: [{ label: 'Monthly Interest Alone', value: (bal * r).toFixed(2), prefix: '$' }]
                };
            }

            let remaining = bal;
            let months = 0;
            let totalInterest = 0;

            while (remaining > 0 && months < 360) {
                months++;
                const interest = remaining * r;
                totalInterest += interest;
                remaining -= (pmt - interest);
            }

            return {
                primaryOutput: { label: 'Time to Full Payoff', value: `${(months / 12).toFixed(1)} Years`, suffix: `(${months} Mo)` },
                secondaryMetrics: [
                    { label: 'Total Finance Charges (Interest)', value: totalInterest.toFixed(2), prefix: '$' },
                    { label: 'Total Cash Repaid', value: (bal + totalInterest).toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 18. Credit Cards Payoff Calculator
    {
        id: 'credit-cards-payoff-calculator',
        name: 'Credit Cards Payoff Calculator',
        category: 'finance-business',
        group: 'Loans & Debt',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '33K',
        cpc: '$3.66',
        description: "A Credit Cards Payoff Calculator manages multiple credit card balances and repayment strategies. It helps optimize debt elimination using avalanche or snowball methods. The calculator is focused specifically on revolving credit accounts.",
        inputs: [
            { id: 'totalBalance', name: 'Total Aggregate Card Balance', type: 'currency', defaultValue: 10000, min: 500, step: 500, prefix: '$', tooltip: 'Combined balances of all credit cards.' },
            { id: 'avgApr', name: 'Average Card APR', type: 'percentage', defaultValue: 21.0, min: 1, max: 40, step: 0.25, suffix: '%', tooltip: 'Weighted average APR.' },
            { id: 'monthlyPayment', name: 'Planned Fixed Monthly Payment', type: 'currency', defaultValue: 400, min: 25, step: 25, prefix: '$', tooltip: 'Total payment across all cards.' }
        ],
        naturalLanguageQueries: ["Calculate my credit cards payoff", "What is my credit cards payoff?", "Help me work out credit cards payoff"],
        edgeCases: ["Cards entering penalty APR Payments below minimums New purchases during payoff"],
        calculate: (inputs) => {
            const bal = Number(inputs.totalBalance) || 10000;
            const apr = Number(inputs.avgApr) || 21.0;
            const pmt = Number(inputs.monthlyPayment) || 400;
            const r = apr / 100 / 12;

            if (pmt <= bal * r) {
                return {
                    primaryOutput: { label: 'Payoff Status', value: 'Payment Too Low to Outpace Interest' },
                    secondaryMetrics: [{ label: 'Monthly Interest Accrual', value: (bal * r).toFixed(2), prefix: '$' }]
                };
            }

            let remaining = bal;
            let months = 0;
            let totalInterest = 0;

            while (remaining > 0 && months < 360) {
                months++;
                const interest = remaining * r;
                totalInterest += interest;
                remaining -= (pmt - interest);
            }

            return {
                primaryOutput: { label: 'Months to Zero Balance', value: `${months} Months`, suffix: `(~${(months / 12).toFixed(1)} yrs)` },
                secondaryMetrics: [
                    { label: 'Total Interest Charge', value: totalInterest.toFixed(2), prefix: '$' },
                    { label: 'Total Payments Made', value: (bal + totalInterest).toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 19. Auto Lease Calculator
    {
        id: 'auto-lease-calculator',
        name: 'Auto Lease Calculator',
        category: 'finance-business',
        group: 'Loans & Debt',
        bucket: 'Bucket A',
        tier: 2,
        phase: 2,
        monthlySearches: '33K',
        cpc: '$2.41',
        description: "An Auto Lease Calculator estimates monthly lease payments for a vehicle. It includes depreciation, money factor, residual value, taxes, and fees. The calculator helps users compare leasing versus financing.",
        inputs: [
            { id: 'msrp', name: 'Vehicle MSRP / Capitalized Cost', type: 'currency', defaultValue: 42000, min: 5000, step: 1000, prefix: '$', tooltip: 'Agreed upon car price.' },
            { id: 'residualPct', name: 'Residual Value Percentage', type: 'percentage', defaultValue: 58.0, min: 20, max: 85, step: 0.5, suffix: '%', tooltip: 'Estimated value at lease end.' },
            { id: 'leaseTermMonths', name: 'Lease Term (Months)', type: 'dropdown', defaultValue: 36, options: [{ label: '24 Months', value: 24 }, { label: '36 Months', value: 36 }, { label: '48 Months', value: 48 }], tooltip: 'Lease duration.' },
            { id: 'moneyFactor', name: 'Money Factor (Lease Rate)', type: 'number', defaultValue: 0.0025, min: 0.0001, max: 0.01, step: 0.0001, tooltip: 'Equivalent to APR / 2400 (0.0025 ≈ 6.0% APR).' },
            { id: 'downPaymentCash', name: 'Down Payment / Capitalized Cost Reduction', type: 'currency', defaultValue: 3000, min: 0, step: 500, prefix: '$', tooltip: 'Upfront cash reduction.' },
            { id: 'salesTaxRate', name: 'Monthly Lease Sales Tax Rate', type: 'percentage', defaultValue: 7.0, min: 0, max: 15, step: 0.25, suffix: '%', tooltip: 'Sales tax applied to monthly lease.' }
        ],
        naturalLanguageQueries: ["Calculate my auto lease", "What is my auto lease?", "Help me work out auto lease"],
        edgeCases: ["Negative equity rollovers Zero money factor leases Excess mileage fees not included"],
        calculate: (inputs) => {
            const capCost = Number(inputs.msrp) || 42000;
            const down = Number(inputs.downPaymentCash) || 0;
            const netCapCost = Math.max(0, capCost - down);
            const residualPct = (Number(inputs.residualPct) || 58.0) / 100;
            const residualVal = capCost * residualPct;
            const term = Number(inputs.leaseTermMonths) || 36;
            const mf = Number(inputs.moneyFactor) || 0.0025;
            const taxRate = (Number(inputs.salesTaxRate) || 7.0) / 100;

            const monthlyDepreciation = (netCapCost - residualVal) / term;
            const monthlyFinanceFee = (netCapCost + residualVal) * mf;
            const baseMonthly = monthlyDepreciation + monthlyFinanceFee;
            const totalMonthly = baseMonthly * (1 + taxRate);
            const totalLeaseOutlay = (totalMonthly * term) + down;

            return {
                primaryOutput: { label: 'Total Monthly Lease Payment', value: totalMonthly.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Base Payment (Pre-Tax)', value: baseMonthly.toFixed(2), prefix: '$' },
                    { label: 'Monthly Depreciation Cost', value: monthlyDepreciation.toFixed(2), prefix: '$' },
                    { label: 'Monthly Rent Charge (Finance Fee)', value: monthlyFinanceFee.toFixed(2), prefix: '$' },
                    { label: 'End of Lease Residual Value', value: residualVal.toFixed(2), prefix: '$' },
                    { label: 'Total Lease Outlay Over Term', value: totalLeaseOutlay.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 20. Lease Calculator
    {
        id: 'lease-calculator',
        name: 'Lease Calculator',
        category: 'finance-business',
        group: 'Loans & Debt',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '40K',
        cpc: '$1.66',
        description: "A Lease Calculator estimates periodic lease payments for assets such as vehicles, equipment, or property. It supports both consumer and commercial leasing structures. The calculator helps evaluate leasing affordability and ownership alternatives.",
        inputs: [
            { id: 'assetValue', name: 'Leased Asset Value', type: 'currency', defaultValue: 30000, min: 1000, step: 1000, prefix: '$', tooltip: 'Initial fair market value of leased equipment or vehicle.' },
            { id: 'residualValue', name: 'Expected Residual Value', type: 'currency', defaultValue: 15000, min: 0, step: 500, prefix: '$', tooltip: 'Asset value at end of lease.' },
            { id: 'leaseTermMonths', name: 'Lease Duration (Months)', type: 'number', defaultValue: 36, min: 6, max: 120, step: 6, suffix: 'months', tooltip: 'Lease duration.' },
            { id: 'interestRatePct', name: 'Annual Lease APR', type: 'percentage', defaultValue: 6.5, min: 0.1, max: 25, step: 0.25, suffix: '%', tooltip: 'Implicit financing rate.' }
        ],
        naturalLanguageQueries: ["Calculate my lease", "What is my lease?", "Help me work out lease"],
        edgeCases: ["Residual greater than asset value Negative depreciation Zero-interest leases Balloon end-of-term obligations"],
        calculate: (inputs) => {
            const assetVal = Number(inputs.assetValue) || 30000;
            const resVal = Number(inputs.residualValue) || 15000;
            const term = Math.max(1, Number(inputs.leaseTermMonths) || 36);
            const apr = Number(inputs.interestRatePct) || 6.5;
            const mf = apr / 2400;

            const monthlyDeprec = (assetVal - resVal) / term;
            const monthlyInterest = (assetVal + resVal) * mf;
            const monthlyPayment = monthlyDeprec + monthlyInterest;
            const totalPaid = monthlyPayment * term;

            return {
                primaryOutput: { label: 'Monthly Lease Payment', value: monthlyPayment.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Monthly Depreciation', value: monthlyDeprec.toFixed(2), prefix: '$' },
                    { label: 'Monthly Finance Charge', value: monthlyInterest.toFixed(2), prefix: '$' },
                    { label: 'Total Lease Payments', value: totalPaid.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 21. Down Payment Calculator
    {
        id: 'down-payment-calculator',
        name: 'Down Payment Calculator',
        category: 'finance-business',
        group: 'Real Estate & Housing',
        bucket: 'Bucket A',
        tier: 3,
        phase: 2,
        monthlySearches: '15K',
        cpc: '$1.86',
        description: "A Down Payment Calculator estimates the upfront amount required when purchasing property or financing large assets. It helps borrowers understand loan size and mortgage insurance implications. The calculator supports percentage-based and fixed down payments.",
        inputs: [
            { id: 'homePrice', name: 'Target Home Purchase Price', type: 'currency', defaultValue: 450000, min: 20000, step: 5000, prefix: '$', tooltip: 'Estimated price of home.' },
            { id: 'targetDownPct', name: 'Desired Down Payment Percentage', type: 'percentage', defaultValue: 20, min: 1, max: 100, step: 0.5, suffix: '%', tooltip: '20% avoids private mortgage insurance (PMI).' },
            { id: 'currentSavings', name: 'Current Saved Capital', type: 'currency', defaultValue: 30000, min: 0, step: 1000, prefix: '$', tooltip: 'Cash already earmarked for down payment.' },
            { id: 'monthlySavings', name: 'Monthly Savings Capacity', type: 'currency', defaultValue: 1500, min: 50, step: 50, prefix: '$', tooltip: 'Monthly contribution to home fund.' }
        ],
        naturalLanguageQueries: ["Calculate my down payment", "What is my down payment?", "Help me work out down payment"],
        edgeCases: ["Down payment exceeding purchase price Zero down loans Negative closing costs"],
        calculate: (inputs) => {
            const price = Number(inputs.homePrice) || 450000;
            const pct = (Number(inputs.targetDownPct) || 20) / 100;
            const saved = Number(inputs.currentSavings) || 0;
            const monthlySave = Math.max(1, Number(inputs.monthlySavings) || 1500);

            const requiredDown = price * pct;
            const remainingNeeded = Math.max(0, requiredDown - saved);
            const monthsToGoal = Math.ceil(remainingNeeded / monthlySave);
            const closingBuffer = price * 0.03; // ~3% estimated closing costs

            return {
                primaryOutput: { label: 'Required Down Payment Goal', value: requiredDown.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Remaining Savings Needed', value: remainingNeeded.toFixed(2), prefix: '$' },
                    { label: 'Estimated Months to Reach Goal', value: `${monthsToGoal} Months`, suffix: `(~${(monthsToGoal / 12).toFixed(1)} yrs)` },
                    { label: 'Est. Closing Costs (3% Buffer)', value: closingBuffer.toFixed(2), prefix: '$' },
                    { label: 'Total Cash Needed at Closing', value: (requiredDown + closingBuffer).toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 22. House Affordability Calculator
    {
        id: 'house-affordability-calculator',
        name: 'House Affordability Calculator',
        category: 'finance-business',
        group: 'Real Estate & Housing',
        bucket: 'Bucket A',
        tier: 2,
        phase: 2,
        monthlySearches: '60K',
        cpc: '$3.02',
        description: "A House Affordability Calculator estimates the maximum home price a buyer can afford based on income, debts, down payment, and loan terms. It helps prospective homeowners determine realistic purchase budgets. The calculator commonly applies lender debt-to-income guidelines and mortgage qualification standards.",
        inputs: [
            { id: 'annualIncome', name: 'Gross Annual Household Income', type: 'currency', defaultValue: 110000, min: 20000, step: 5000, prefix: '$', tooltip: 'Pre-tax yearly earnings.' },
            { id: 'monthlyDebts', name: 'Monthly Recurring Debt Payments', type: 'currency', defaultValue: 600, min: 0, step: 50, prefix: '$', tooltip: 'Car loans, credit cards, student debt.' },
            { id: 'downPaymentAvailable', name: 'Available Cash for Down Payment', type: 'currency', defaultValue: 60000, min: 0, step: 2500, prefix: '$', tooltip: 'Total liquid funds.' },
            { id: 'mortgageRate', name: 'Estimated Mortgage Rate (APR)', type: 'percentage', defaultValue: 6.75, min: 1, max: 15, step: 0.125, suffix: '%', tooltip: 'Current prevailing mortgage rate.' },
            { id: 'dtiRule', name: 'Front-End / Back-End DTI Standard', type: 'dropdown', defaultValue: 'standard', options: [{ label: 'Conservative (28% / 36%)', value: 'conservative' }, { label: 'Standard (31% / 43%)', value: 'standard' }, { label: 'Aggressive (36% / 50%)', value: 'aggressive' }], tooltip: 'Lender debt ratio limits.' }
        ],
        naturalLanguageQueries: ["Calculate my house affordability", "What is my house affordability?", "Help me work out house affordability"],
        edgeCases: ["Extremely high debt-to-income ratios Zero down payment scenarios Negative disposable income Unrealistically high HOA fees"],
        calculate: (inputs) => {
            const income = Number(inputs.annualIncome) || 110000;
            const monthlyIncome = income / 12;
            const debts = Number(inputs.monthlyDebts) || 600;
            const down = Number(inputs.downPaymentAvailable) || 60000;
            const rate = Number(inputs.mortgageRate) || 6.75;
            const rule = String(inputs.dtiRule || 'standard');

            const frontLimit = rule === 'conservative' ? 0.28 : rule === 'aggressive' ? 0.36 : 0.31;
            const backLimit = rule === 'conservative' ? 0.36 : rule === 'aggressive' ? 0.50 : 0.43;

            const maxHousingByFront = monthlyIncome * frontLimit;
            const maxHousingByBack = Math.max(0, (monthlyIncome * backLimit) - debts);
            const maxMonthlyHousing = Math.min(maxHousingByFront, maxHousingByBack);

            // Back-calculate principal from monthly payment assuming 80% goes to P&I, 20% to tax/ins
            const r = rate / 100 / 12;
            const n = 360;
            const maxPi = maxMonthlyHousing * 0.80;
            const maxLoan = r > 0 ? (maxPi * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n)) : maxPi * n;
            const maxHomePrice = maxLoan + down;

            return {
                primaryOutput: { label: 'Maximum Affordable Home Price', value: maxHomePrice.toFixed(0), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Maximum Monthly Housing Budget', value: maxMonthlyHousing.toFixed(2), prefix: '$' },
                    { label: 'Maximum Borrowing Loan Capacity', value: maxLoan.toFixed(0), prefix: '$' },
                    { label: 'Down Payment Applied', value: down.toFixed(0), prefix: '$' },
                    { label: 'Gross Monthly Income', value: monthlyIncome.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 23. Rent Calculator
    {
        id: 'rent-calculator',
        name: 'Rent Calculator',
        category: 'finance-business',
        group: 'Real Estate & Housing',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '90K',
        cpc: '$1.13',
        description: "A Rent Calculator estimates affordable monthly rent based on income and budgeting rules. It helps renters determine safe housing expenses without overextending financially. The calculator commonly uses recommended income-to-rent ratios.",
        inputs: [
            { id: 'grossMonthlyIncome', name: 'Gross Monthly Household Income', type: 'currency', defaultValue: 6000, min: 500, step: 250, prefix: '$', tooltip: 'Monthly income before taxes.' },
            { id: 'monthlyDebt', name: 'Other Monthly Debt Obligations', type: 'currency', defaultValue: 400, min: 0, step: 50, prefix: '$', tooltip: 'Car loans, credit cards, student loans.' },
            { id: 'affordabilityGuideline', name: 'Income Rule of Thumb', type: 'dropdown', defaultValue: 30, options: [{ label: '30% Standard Rule', value: 30 }, { label: '25% Frugal Rule', value: 25 }, { label: '35% High Cost-of-Living City', value: 35 }, { label: '50/30/20 Budgeting (Needs Pool)', value: 28 }], tooltip: 'Percentage guideline for rent.' }
        ],
        naturalLanguageQueries: ["Calculate my rent", "What is my rent?", "Help me work out rent"],
        edgeCases: ["Negative income Utilities exceeding rent budget Multiple income sources"],
        calculate: (inputs) => {
            const income = Number(inputs.grossMonthlyIncome) || 6000;
            const debts = Number(inputs.monthlyDebt) || 400;
            const pct = (Number(inputs.affordabilityGuideline) || 30) / 100;

            const targetRent = income * pct;
            const annualRentCost = targetRent * 12;
            const netDisposableRemaining = Math.max(0, income - targetRent - debts);

            return {
                primaryOutput: { label: 'Recommended Max Monthly Rent', value: targetRent.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Annual Housing Cost', value: annualRentCost.toFixed(2), prefix: '$' },
                    { label: 'Remaining Cash After Rent & Debt', value: netDisposableRemaining.toFixed(2), prefix: '$' },
                    { label: 'Monthly Debt Service', value: debts.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 24. Rent vs Buy Calculator
    {
        id: 'rent-vs-buy-calculator',
        name: 'Rent vs Buy Calculator',
        category: 'finance-business',
        group: 'Real Estate & Housing',
        bucket: 'Bucket A',
        tier: 2,
        phase: 2,
        monthlySearches: '22K',
        cpc: '$1.35',
        description: "A Rent vs Buy Calculator compares the financial outcomes of renting versus purchasing a property over time. It factors in mortgage costs, appreciation, taxes, maintenance, rent inflation, and opportunity costs. The calculator helps users determine which option may be financially preferable.",
        inputs: [
            { id: 'homePrice', name: 'Home Purchase Price', type: 'currency', defaultValue: 420000, min: 25000, step: 5000, prefix: '$', tooltip: 'Purchase price of property.' },
            { id: 'monthlyRent', name: 'Monthly Rent for Comparable Home', type: 'currency', defaultValue: 2200, min: 200, step: 50, prefix: '$', tooltip: 'Current rent.' },
            { id: 'stayDurationYears', name: 'Planned Length of Stay (Years)', type: 'number', defaultValue: 7, min: 1, max: 30, step: 1, suffix: 'years', tooltip: 'Time horizon before moving.' },
            { id: 'annualAppreciationPct', name: 'Home Value Annual Appreciation', type: 'percentage', defaultValue: 3.5, min: -5, max: 15, step: 0.25, suffix: '%', tooltip: 'Estimated property growth.' },
            { id: 'investmentReturnPct', name: 'Alternative Investment Return Rate', type: 'percentage', defaultValue: 7.0, min: 0, max: 15, step: 0.25, suffix: '%', tooltip: 'Stock market return for saved down payment.' }
        ],
        naturalLanguageQueries: ["Calculate my rent vs buy", "What is my rent vs buy?", "Help me work out rent vs buy"],
        edgeCases: ["Short ownership durations Negative home appreciation High maintenance cost assumptions Extremely high rent inflation"],
        calculate: (inputs) => {
            const price = Number(inputs.homePrice) || 420000;
            const rent = Number(inputs.monthlyRent) || 2200;
            const years = Number(inputs.stayDurationYears) || 7;
            const appPct = (Number(inputs.annualAppreciationPct) || 3.5) / 100;
            const invPct = (Number(inputs.investmentReturnPct) || 7.0) / 100;

            const down = price * 0.20;
            const loan = price * 0.80;
            const monthlyMortgage = calculateAmortizationMonthlyPayment(loan, 6.5, 30);
            const monthlyTaxInsMaint = (price * 0.025) / 12;
            const totalMonthlyBuy = monthlyMortgage + monthlyTaxInsMaint;

            const totalBuyCost = (totalMonthlyBuy * years * 12) + (price * 0.03); // + closing costs
            const endHomeValue = price * Math.pow(1 + appPct, years);
            const equityGained = (endHomeValue - price * 0.70); // approx remaining loan
            const netCostBuying = totalBuyCost - equityGained;

            const totalRentPaid = rent * 12 * years * 1.05; // 5% average rent increase over time
            const invGrowthOfDown = down * Math.pow(1 + invPct, years) - down;
            const netCostRenting = totalRentPaid - invGrowthOfDown;

            const buyingIsBetter = netCostBuying < netCostRenting;
            const difference = Math.abs(netCostBuying - netCostRenting);

            return {
                primaryOutput: { label: 'Financial Advantage', value: buyingIsBetter ? `Buying Saves $${difference.toFixed(0)}` : `Renting Saves $${difference.toFixed(0)}` },
                secondaryMetrics: [
                    { label: 'Total Net Cost of Buying', value: netCostBuying.toFixed(0), prefix: '$' },
                    { label: 'Total Net Cost of Renting', value: netCostRenting.toFixed(0), prefix: '$' },
                    { label: 'Future Home Value in ' + years + ' Yrs', value: endHomeValue.toFixed(0), prefix: '$' },
                    { label: 'Monthly Buying Outlay (Mortgage+Tax)', value: totalMonthlyBuy.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 25. Real Estate Calculator
    {
        id: 'real-estate-calculator',
        name: 'Real Estate Calculator',
        category: 'finance-business',
        group: 'Real Estate & Housing',
        bucket: 'Bucket B',
        tier: 1,
        phase: 3,
        monthlySearches: '4K',
        cpc: '$1.75',
        description: "A Real Estate Calculator estimates investment performance metrics for real estate purchases. It helps investors analyze financing, appreciation, rental income, and cash flow. The calculator supports residential and commercial property evaluation.",
        inputs: [
            { id: 'purchasePrice', name: 'Real Estate Purchase Price', type: 'currency', defaultValue: 350000, min: 10000, step: 5000, prefix: '$', tooltip: 'Total purchase cost.' },
            { id: 'grossMonthlyRent', name: 'Gross Monthly Rental Income', type: 'currency', defaultValue: 2800, min: 0, step: 50, prefix: '$', tooltip: 'Expected gross monthly rent.' },
            { id: 'monthlyOperatingExpenses', name: 'Monthly Operating Costs', type: 'currency', defaultValue: 800, min: 0, step: 25, prefix: '$', tooltip: 'Taxes, insurance, maintenance, management.' },
            { id: 'financingMonthlyPmt', name: 'Monthly Mortgage Payment', type: 'currency', defaultValue: 1400, min: 0, step: 50, prefix: '$', tooltip: 'P&I mortgage cost.' }
        ],
        naturalLanguageQueries: ["Calculate my real estate", "What is my real estate?", "Help me work out real estate"],
        edgeCases: ["Negative cash flow Vacancy assumptions omitted Unrealistic appreciation estimates"],
        calculate: (inputs) => {
            const price = Number(inputs.purchasePrice) || 350000;
            const rent = Number(inputs.grossMonthlyRent) || 2800;
            const opex = Number(inputs.monthlyOperatingExpenses) || 800;
            const debt = Number(inputs.financingMonthlyPmt) || 1400;

            const noiMonthly = rent - opex;
            const noiAnnual = noiMonthly * 12;
            const capRate = price > 0 ? (noiAnnual / price) * 100 : 0;
            const monthlyCashFlow = noiMonthly - debt;
            const annualCashFlow = monthlyCashFlow * 12;

            return {
                primaryOutput: { label: 'Net Monthly Cash Flow', value: monthlyCashFlow.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Annual Net Operating Income (NOI)', value: noiAnnual.toFixed(2), prefix: '$' },
                    { label: 'Capitalization Rate (Cap Rate)', value: `${capRate.toFixed(2)}%` },
                    { label: 'Annual Net Cash Flow', value: annualCashFlow.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 26. Rental Property Calculator
    {
        id: 'rental-property-calculator',
        name: 'Rental Property Calculator',
        category: 'finance-business',
        group: 'Real Estate & Housing',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '8K',
        cpc: '$4.20',
        description: "A Rental Property Calculator evaluates profitability of income-producing real estate. It estimates cash flow, ROI, capitalization rate, and financing costs. The calculator helps investors assess rental investment viability.",
        inputs: [
            { id: 'purchasePrice', name: 'Purchase Price', type: 'currency', defaultValue: 300000, min: 10000, step: 5000, prefix: '$', tooltip: 'Acquisition price.' },
            { id: 'downPayment', name: 'Cash Invested (Down + Rehab)', type: 'currency', defaultValue: 75000, min: 5000, step: 2500, prefix: '$', tooltip: 'Total initial cash outlay.' },
            { id: 'monthlyRent', name: 'Monthly Rental Revenue', type: 'currency', defaultValue: 2500, min: 100, step: 50, prefix: '$', tooltip: 'Gross rent.' },
            { id: 'vacancyRatePct', name: 'Vacancy Allowance', type: 'percentage', defaultValue: 5.0, min: 0, max: 25, step: 0.5, suffix: '%', tooltip: 'Expected vacancy percentage.' },
            { id: 'operatingExpensesMonthly', name: 'Operating Expenses (Tax/Ins/Maint)', type: 'currency', defaultValue: 700, min: 0, step: 25, prefix: '$', tooltip: 'Monthly non-mortgage costs.' },
            { id: 'mortgageMonthly', name: 'Monthly Mortgage Payment', type: 'currency', defaultValue: 1250, min: 0, step: 25, prefix: '$', tooltip: 'Monthly debt service.' }
        ],
        naturalLanguageQueries: ["Calculate my rental property", "What is my rental property?", "Help me work out rental property"],
        edgeCases: ["Vacancy greater than 100% Negative cash flow Irregular rental income"],
        calculate: (inputs) => {
            const price = Number(inputs.purchasePrice) || 300000;
            const cashInvested = Math.max(1, Number(inputs.downPayment) || 75000);
            const rent = Number(inputs.monthlyRent) || 2500;
            const vacancyPct = (Number(inputs.vacancyRatePct) || 5.0) / 100;
            const effectiveRent = rent * (1 - vacancyPct);
            const opex = Number(inputs.operatingExpensesMonthly) || 700;
            const mortgage = Number(inputs.mortgageMonthly) || 1250;

            const netMonthlyCashFlow = effectiveRent - opex - mortgage;
            const annualCashFlow = netMonthlyCashFlow * 12;
            const cashOnCashRoi = (annualCashFlow / cashInvested) * 100;
            const capRate = ((effectiveRent - opex) * 12 / price) * 100;

            return {
                primaryOutput: { label: 'Monthly Cash Flow', value: netMonthlyCashFlow.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Cash-on-Cash Return (CoC)', value: `${cashOnCashRoi.toFixed(2)}%` },
                    { label: 'Annual Cash Flow', value: annualCashFlow.toFixed(2), prefix: '$' },
                    { label: 'Property Cap Rate', value: `${capRate.toFixed(2)}%` },
                    { label: 'Effective Monthly Gross Rent', value: effectiveRent.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 27. Home Equity Loan Calculator
    {
        id: 'home-equity-loan-calculator',
        name: 'Home Equity Loan Calculator',
        category: 'finance-business',
        group: 'Real Estate & Housing',
        bucket: 'Bucket A',
        tier: 2,
        phase: 1,
        monthlySearches: '90K',
        cpc: '$11.28  ★ HIGH CPC',
        description: "A Home Equity Loan Calculator estimates payments and borrowing capacity using home equity as collateral. It helps homeowners evaluate second mortgages. The calculator supports fixed-rate home equity loans.",
        inputs: [
            { id: 'homeValue', name: 'Current Home Market Value', type: 'currency', defaultValue: 500000, min: 10000, step: 5000, prefix: '$', tooltip: 'Appraised home value.' },
            { id: 'currentMortgageBal', name: 'Primary Mortgage Balance', type: 'currency', defaultValue: 280000, min: 0, step: 5000, prefix: '$', tooltip: 'Remaining first mortgage principal.' },
            { id: 'maxCltvPct', name: 'Maximum Combined LTV (CLTV)', type: 'percentage', defaultValue: 85.0, min: 50, max: 95, step: 1.0, suffix: '%', tooltip: 'Lender maximum borrowing ceiling.' },
            { id: 'equityLoanApr', name: 'Home Equity Loan Interest Rate', type: 'percentage', defaultValue: 7.5, min: 1, max: 20, step: 0.125, suffix: '%', tooltip: 'Fixed APR on second mortgage.' },
            { id: 'loanTermYears', name: 'Loan Term (Years)', type: 'dropdown', defaultValue: 15, options: [{ label: '10 Years', value: 10 }, { label: '15 Years', value: 15 }, { label: '20 Years', value: 20 }], tooltip: 'Repayment term.' }
        ],
        naturalLanguageQueries: ["What is my monthly payment on a $20,000 loan at 5% for 5 years?", "Calculate loan payment 15000 at 8% over 3 years", "How much interest will I pay on a $50,000 loan?"],
        edgeCases: ["Negative equity Loan request exceeding LTV limits Zero-interest loans"],
        calculate: (inputs) => {
            const val = Number(inputs.homeValue) || 500000;
            const bal = Number(inputs.currentMortgageBal) || 280000;
            const cltvPct = (Number(inputs.maxCltvPct) || 85.0) / 100;
            const apr = Number(inputs.equityLoanApr) || 7.5;
            const term = Number(inputs.loanTermYears) || 15;

            const maxBorrowingTotal = val * cltvPct;
            const maxEquityLoan = Math.max(0, maxBorrowingTotal - bal);
            const monthlyPayment = calculateAmortizationMonthlyPayment(maxEquityLoan, apr, term);
            const totalPaid = monthlyPayment * (term * 12);
            const totalInterest = Math.max(0, totalPaid - maxEquityLoan);

            return {
                primaryOutput: { label: 'Max Borrowable Home Equity', value: maxEquityLoan.toFixed(0), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Monthly Payment on Max Loan', value: monthlyPayment.toFixed(2), prefix: '$' },
                    { label: 'Total Interest Over Term', value: totalInterest.toFixed(2), prefix: '$' },
                    { label: 'Total Current Home Equity', value: (val - bal).toFixed(0), prefix: '$' }
                ]
            };
        }
    },

    // 28. HELOC Calculator
    {
        id: 'heloc-calculator',
        name: 'HELOC Calculator',
        category: 'finance-business',
        group: 'Real Estate & Housing',
        bucket: 'Bucket A',
        tier: 2,
        phase: 2,
        monthlySearches: '60K',
        cpc: '$9.81  ★ HIGH CPC',
        description: "A HELOC Calculator estimates payments and borrowing costs for Home Equity Lines of Credit. It models revolving credit behavior and variable interest rates. The calculator supports draw and repayment periods.",
        inputs: [
            { id: 'helocBalance', name: 'Drawn HELOC Line Amount', type: 'currency', defaultValue: 50000, min: 1000, step: 2500, prefix: '$', tooltip: 'Outstanding balance drawn.' },
            { id: 'variableApr', name: 'Variable Interest Rate (APR)', type: 'percentage', defaultValue: 8.25, min: 1, max: 25, step: 0.125, suffix: '%', tooltip: 'Current index + margin rate.' },
            { id: 'drawPeriodYears', name: 'Draw Period Length (Years)', type: 'dropdown', defaultValue: 10, options: [{ label: '5 Years', value: 5 }, { label: '10 Years', value: 10 }], tooltip: 'Interest-only draw phase.' },
            { id: 'repayPeriodYears', name: 'Repayment Period (Years)', type: 'dropdown', defaultValue: 20, options: [{ label: '10 Years', value: 10 }, { label: '20 Years', value: 20 }], tooltip: 'Principal & interest phase.' }
        ],
        naturalLanguageQueries: ["Calculate my heloc", "What is my heloc?", "Help me work out heloc"],
        edgeCases: ["Variable rate changes Draw amount exceeding limit Negative home equity"],
        calculate: (inputs) => {
            const bal = Number(inputs.helocBalance) || 50000;
            const apr = Number(inputs.variableApr) || 8.25;
            const repayYears = Number(inputs.repayPeriodYears) || 20;

            const interestOnlyMonthly = (bal * (apr / 100)) / 12;
            const amortizingMonthly = calculateAmortizationMonthlyPayment(bal, apr, repayYears);

            return {
                primaryOutput: { label: 'Interest-Only Monthly Payment (Draw Phase)', value: interestOnlyMonthly.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Monthly Payment in Repayment Phase', value: amortizingMonthly.toFixed(2), prefix: '$' },
                    { label: 'Principal Balance Drawn', value: bal.toFixed(2), prefix: '$' },
                    { label: 'Annual Interest Cost (Draw Phase)', value: (interestOnlyMonthly * 12).toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 29. Mortgage Points Calculator
    {
        id: 'mortgage-points-calculator',
        name: 'Mortgage Points Calculator',
        category: 'finance-business',
        group: 'Real Estate & Housing',
        bucket: 'Bucket A',
        tier: 1,
        phase: 3,
        monthlySearches: '4K',
        cpc: '$2.97',
        description: "A Mortgage Points Calculator evaluates whether paying discount points lowers borrowing costs over time. It helps borrowers compare upfront costs versus interest savings. The calculator determines break-even timelines.",
        inputs: [
            { id: 'loanAmount', name: 'Mortgage Loan Amount', type: 'currency', defaultValue: 350000, min: 10000, step: 5000, prefix: '$', tooltip: 'Financed amount.' },
            { id: 'baseRate', name: 'Base Interest Rate (0 Points)', type: 'percentage', defaultValue: 6.75, min: 1, max: 20, step: 0.125, suffix: '%', tooltip: 'Standard rate without discount.' },
            { id: 'pointsPurchased', name: 'Discount Points Purchased', type: 'number', defaultValue: 2.0, min: 0.25, max: 5.0, step: 0.25, suffix: 'pts', tooltip: 'Each point costs 1% of loan amount.' },
            { id: 'rateReductionPerPoint', name: 'Rate Reduction per Point', type: 'percentage', defaultValue: 0.25, min: 0.1, max: 0.5, step: 0.05, suffix: '%', tooltip: 'Typically 0.25% APR reduction per point.' }
        ],
        naturalLanguageQueries: ["What is my monthly mortgage payment on a $400,000 house at 6.5% for 30 years?", "Calculate mortgage 350000 at 7% for 25 years", "How much do I pay monthly on a 500k mortgage?"],
        edgeCases: ["Refinancing before break-even Zero rate reduction Fractional points"],
        calculate: (inputs) => {
            const loan = Number(inputs.loanAmount) || 350000;
            const baseRate = Number(inputs.baseRate) || 6.75;
            const points = Number(inputs.pointsPurchased) || 2.0;
            const reduction = Number(inputs.rateReductionPerPoint) || 0.25;

            const upfrontCost = loan * (points / 100);
            const newRate = Math.max(0.1, baseRate - (points * reduction));

            const baseMonthly = calculateAmortizationMonthlyPayment(loan, baseRate, 30);
            const newMonthly = calculateAmortizationMonthlyPayment(loan, newRate, 30);
            const monthlySavings = baseMonthly - newMonthly;
            const breakEvenMonths = monthlySavings > 0 ? upfrontCost / monthlySavings : 0;

            return {
                primaryOutput: { label: 'Break-Even Timeframe', value: `${breakEvenMonths.toFixed(1)} Months`, suffix: `(~${(breakEvenMonths / 12).toFixed(1)} yrs)` },
                secondaryMetrics: [
                    { label: 'Upfront Points Cost', value: upfrontCost.toFixed(2), prefix: '$' },
                    { label: 'Monthly Payment Savings', value: monthlySavings.toFixed(2), prefix: '$' },
                    { label: 'Discounted Interest Rate', value: `${newRate.toFixed(3)}%` },
                    { label: 'Lifetime Interest Savings (30 Yrs)', value: ((monthlySavings * 360) - upfrontCost).toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 30. Property Appreciation Calculator
    {
        id: 'property-appreciation-calculator',
        name: 'Property Appreciation Calculator',
        category: 'finance-business',
        group: 'Real Estate & Housing',
        bucket: 'Bucket B',
        tier: 1,
        phase: 4,
        monthlySearches: '480',
        cpc: '$2.55',
        description: "A Property Appreciation Calculator estimates future property value growth based on annual appreciation assumptions. It helps homeowners and investors forecast real estate asset value. The calculator supports compound annual appreciation.",
        inputs: [
            { id: 'initialPropertyValue', name: 'Initial Property Value', type: 'currency', defaultValue: 300000, min: 10000, step: 5000, prefix: '$', tooltip: 'Current or baseline value.' },
            { id: 'annualAppreciationRate', name: 'Annual Appreciation Rate', type: 'percentage', defaultValue: 4.5, min: -10, max: 25, step: 0.1, suffix: '%', tooltip: 'Estimated year-over-year value increase.' },
            { id: 'timeHorizonYears', name: 'Holding Period (Years)', type: 'number', defaultValue: 10, min: 1, max: 50, step: 1, suffix: 'years', tooltip: 'Years modeled.' }
        ],
        naturalLanguageQueries: ["Calculate my property appreciation", "What is my property appreciation?", "Help me work out property appreciation"],
        edgeCases: ["Negative appreciation Market crashes not modeled Extremely high appreciation assumptions"],
        calculate: (inputs) => {
            const pv = Number(inputs.initialPropertyValue) || 300000;
            const r = (Number(inputs.annualAppreciationRate) || 4.5) / 100;
            const t = Number(inputs.timeHorizonYears) || 10;

            const futureVal = pv * Math.pow(1 + r, t);
            const totalGain = futureVal - pv;
            const totalGainPct = (totalGain / pv) * 100;

            return {
                primaryOutput: { label: 'Projected Property Value', value: futureVal.toFixed(0), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Value Gain', value: totalGain.toFixed(0), prefix: '$' },
                    { label: 'Cumulative Appreciation Percentage', value: `${totalGainPct.toFixed(1)}%` },
                    { label: 'Initial Baseline Value', value: pv.toFixed(0), prefix: '$' }
                ]
            };
        }
    },

    // 31. Rental Yield Calculator
    {
        id: 'rental-yield-calculator',
        name: 'Rental Yield Calculator',
        category: 'finance-business',
        group: 'Real Estate & Housing',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '10K',
        cpc: '$2.52',
        description: "A Rental Yield Calculator estimates the percentage return generated by rental income relative to property value. It helps investors compare rental property performance. The calculator supports gross and net rental yield.",
        inputs: [
            { id: 'propertyValue', name: 'Property Purchase Price / Market Value', type: 'currency', defaultValue: 250000, min: 10000, step: 5000, prefix: '$', tooltip: 'Total property value.' },
            { id: 'monthlyRent', name: 'Monthly Rental Income', type: 'currency', defaultValue: 1800, min: 50, step: 50, prefix: '$', tooltip: 'Gross monthly rent.' },
            { id: 'annualExpenses', name: 'Annual Operating Expenses', type: 'currency', defaultValue: 4500, min: 0, step: 100, prefix: '$', tooltip: 'Taxes, insurance, HOA, maintenance.' }
        ],
        naturalLanguageQueries: ["Calculate my rental yield", "What is my rental yield?", "Help me work out rental yield"],
        edgeCases: ["Property value zero Negative net income High vacancy assumptions omitted"],
        calculate: (inputs) => {
            const val = Math.max(1, Number(inputs.propertyValue) || 250000);
            const rentAnnual = (Number(inputs.monthlyRent) || 1800) * 12;
            const expAnnual = Number(inputs.annualExpenses) || 4500;

            const grossYield = (rentAnnual / val) * 100;
            const netIncome = rentAnnual - expAnnual;
            const netYield = (netIncome / val) * 100;

            return {
                primaryOutput: { label: 'Net Rental Yield', value: `${netYield.toFixed(2)}%` },
                secondaryMetrics: [
                    { label: 'Gross Rental Yield', value: `${grossYield.toFixed(2)}%` },
                    { label: 'Annual Gross Rental Income', value: rentAnnual.toFixed(2), prefix: '$' },
                    { label: 'Annual Net Operating Income', value: netIncome.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 32. Cap Rate Calculator
    {
        id: 'cap-rate-calculator',
        name: 'Cap Rate Calculator',
        category: 'finance-business',
        group: 'Real Estate & Housing',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '12K',
        cpc: '$1.54',
        description: "A Cap Rate Calculator estimates capitalization rate for real estate investments. It measures annual net operating income relative to property value. The calculator is commonly used in commercial real estate analysis.",
        inputs: [
            { id: 'propertyPrice', name: 'Property Value / Purchase Price', type: 'currency', defaultValue: 400000, min: 10000, step: 5000, prefix: '$', tooltip: 'Asset market value.' },
            { id: 'grossIncomeAnnual', name: 'Gross Annual Rental Revenue', type: 'currency', defaultValue: 36000, min: 0, step: 1000, prefix: '$', tooltip: 'Total yearly rent collected.' },
            { id: 'operatingExpensesAnnual', name: 'Annual Operating Expenses', type: 'currency', defaultValue: 10000, min: 0, step: 500, prefix: '$', tooltip: 'Taxes, insurance, repairs, management fees.' }
        ],
        naturalLanguageQueries: ["Calculate my cap rate", "What is my cap rate?", "Help me work out cap rate"],
        edgeCases: ["Negative NOI Zero property value One-time income distortions"],
        calculate: (inputs) => {
            const price = Math.max(1, Number(inputs.propertyPrice) || 400000);
            const gross = Number(inputs.grossIncomeAnnual) || 36000;
            const opex = Number(inputs.operatingExpensesAnnual) || 10000;

            const noi = gross - opex;
            const capRate = (noi / price) * 100;

            return {
                primaryOutput: { label: 'Capitalization Rate (Cap Rate)', value: `${capRate.toFixed(2)}%` },
                secondaryMetrics: [
                    { label: 'Net Operating Income (NOI)', value: noi.toFixed(2), prefix: '$' },
                    { label: 'Expense Ratio', value: `${((opex / (gross || 1)) * 100).toFixed(1)}%` }
                ]
            };
        }
    },

    // 33. Home Improvement ROI Calculator
    {
        id: 'home-improvement-roi-calculator',
        name: 'Home Improvement ROI Calculator',
        category: 'finance-business',
        group: 'Real Estate & Housing',
        bucket: 'Bucket B',
        tier: 1,
        phase: 4,
        monthlySearches: '90',
        cpc: '$4.29',
        description: "A Home Improvement ROI Calculator estimates return on investment from renovation projects. It compares project costs against estimated increases in property value. The calculator helps homeowners evaluate renovation profitability.",
        inputs: [
            { id: 'projectCost', name: 'Renovation / Project Cost', type: 'currency', defaultValue: 25000, min: 500, step: 500, prefix: '$', tooltip: 'Total improvement outlay.' },
            { id: 'addedHomeValue', name: 'Estimated Added Resale Value', type: 'currency', defaultValue: 18500, min: 0, step: 500, prefix: '$', tooltip: 'Appraisal increase.' }
        ],
        naturalLanguageQueries: ["Calculate my home improvement roi", "What is my home improvement roi?", "Help me work out home improvement roi"],
        edgeCases: ["Renovation cost exceeding value increase Negative ROI Market fluctuations not modeled"],
        calculate: (inputs) => {
            const cost = Math.max(1, Number(inputs.projectCost) || 25000);
            const value = Number(inputs.addedHomeValue) || 18500;
            const costRecoupedPct = (value / cost) * 100;
            const netGainOrLoss = value - cost;

            return {
                primaryOutput: { label: 'Cost Recouped ROI', value: `${costRecoupedPct.toFixed(1)}%` },
                secondaryMetrics: [
                    { label: 'Net Value Difference', value: netGainOrLoss.toFixed(2), prefix: '$' },
                    { label: 'Renovation Outlay', value: cost.toFixed(2), prefix: '$' },
                    { label: 'Added Resale Equity', value: value.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 34. Moving Cost Calculator
    {
        id: 'moving-cost-calculator',
        name: 'Moving Cost Calculator',
        category: 'finance-business',
        group: 'Real Estate & Housing',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '10K',
        cpc: '$12.12  ★ HIGH CPC',
        description: "A Moving Cost Calculator estimates relocation expenses based on distance, home size, labor, and transportation costs. It helps individuals and businesses budget moving expenses. The calculator supports local and long-distance moves.",
        inputs: [
            { id: 'homeSizeBedrooms', name: 'Home Size', type: 'dropdown', defaultValue: 2, options: [{ label: 'Studio / 1 Bedroom', value: 1 }, { label: '2-3 Bedrooms', value: 2 }, { label: '4+ Bedrooms', value: 4 }], tooltip: 'Volume of household goods.' },
            { id: 'distanceMiles', name: 'Moving Distance (Miles)', type: 'number', defaultValue: 250, min: 1, max: 4000, step: 10, suffix: 'miles', tooltip: 'One-way transit distance.' },
            { id: 'movingType', name: 'Moving Method', type: 'dropdown', defaultValue: 'pro', options: [{ label: 'Full Service Movers', value: 'pro' }, { label: 'DIY Truck Rental', value: 'diy' }, { label: 'Moving Container / Pod', value: 'pod' }], tooltip: 'Service level.' }
        ],
        naturalLanguageQueries: ["Calculate my moving cost", "What is my moving cost?", "Help me work out moving cost"],
        edgeCases: ["Zero-distance moves Large commercial moves Fuel price fluctuations not modeled"],
        calculate: (inputs) => {
            const beds = Number(inputs.homeSizeBedrooms) || 2;
            const miles = Number(inputs.distanceMiles) || 250;
            const type = String(inputs.movingType || 'pro');

            let baseCost = beds * 450;
            let mileageRate = miles > 100 ? (miles - 100) * (beds * 0.95) : 0;

            if (type === 'diy') {
                baseCost = beds * 150 + miles * 0.85 + 100; // truck + gas
            } else if (type === 'pod') {
                baseCost = beds * 280 + miles * 1.20;
            } else {
                baseCost += mileageRate;
            }

            const packingSupplies = beds * 120;
            const totalCost = baseCost + packingSupplies;

            return {
                primaryOutput: { label: 'Estimated Total Moving Cost', value: totalCost.toFixed(0), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Base Transportation & Labor', value: baseCost.toFixed(0), prefix: '$' },
                    { label: 'Packing & Boxes Estimate', value: packingSupplies.toFixed(0), prefix: '$' }
                ]
            };
        }
    },

    // 35. Reverse Mortgage Calculator
    {
        id: 'reverse-mortgage-calculator',
        name: 'Reverse Mortgage Calculator',
        category: 'finance-business',
        group: 'Real Estate & Housing',
        bucket: 'Bucket A',
        tier: 3,
        phase: 2,
        monthlySearches: '18K',
        cpc: '$27.90  ★ HIGH CPC',
        description: "A Reverse Mortgage Calculator estimates borrowing capacity and future loan balances for senior homeowners using reverse mortgages. It helps retirees understand available home equity access. The calculator models accumulating interest over time.",
        inputs: [
            { id: 'homeValue', name: 'Current Home Value', type: 'currency', defaultValue: 450000, min: 50000, step: 5000, prefix: '$', tooltip: 'Appraised value (HECM cap applies).' },
            { id: 'borrowerAge', name: 'Age of Youngest Borrower', type: 'number', defaultValue: 68, min: 62, max: 100, step: 1, suffix: 'yrs', tooltip: 'Must be at least 62 for HECM.' },
            { id: 'existingMortgage', name: 'Existing Mortgage Balance to Pay Off', type: 'currency', defaultValue: 80000, min: 0, step: 5000, prefix: '$', tooltip: 'Existing lien must be cleared.' },
            { id: 'interestRatePct', name: 'Expected Reverse Mortgage Rate', type: 'percentage', defaultValue: 6.5, min: 1, max: 15, step: 0.125, suffix: '%', tooltip: 'HECM interest rate.' }
        ],
        naturalLanguageQueries: ["What is my monthly mortgage payment on a $400,000 house at 6.5% for 30 years?", "Calculate mortgage 350000 at 7% for 25 years", "How much do I pay monthly on a 500k mortgage?"],
        edgeCases: ["Borrower below eligibility age Existing mortgage exceeding limits Declining home values"],
        calculate: (inputs) => {
            const val = Number(inputs.homeValue) || 450000;
            const age = Math.max(62, Number(inputs.borrowerAge) || 68);
            const lien = Number(inputs.existingMortgage) || 80000;

            // Principal Limit Factor approximately scales with age (approx 40% at 62 to 65% at 85)
            const plf = Math.min(0.70, 0.35 + (age - 62) * 0.012);
            const maxPrincipalLimit = val * plf;
            const netProceeds = Math.max(0, maxPrincipalLimit - lien);

            return {
                primaryOutput: { label: 'Net Available Cash Proceeds', value: netProceeds.toFixed(0), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Initial Principal Limit', value: maxPrincipalLimit.toFixed(0), prefix: '$' },
                    { label: 'Existing Mortgage Payoff', value: lien.toFixed(0), prefix: '$' },
                    { label: 'Principal Limit Factor (PLF)', value: `${(plf * 100).toFixed(1)}%` }
                ]
            };
        }
    },

    // 36. Bridge Loan Calculator
    {
        id: 'bridge-loan-calculator',
        name: 'Bridge Loan Calculator',
        category: 'finance-business',
        group: 'Real Estate & Housing',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '8K',
        cpc: '$7.51  ★ HIGH CPC',
        description: "A Bridge Loan Calculator estimates temporary financing costs used when purchasing a new property before selling an existing one. It helps borrowers manage short-term liquidity needs. The calculator models interest-only bridge financing.",
        inputs: [
            { id: 'loanAmount', name: 'Bridge Loan Amount', type: 'currency', defaultValue: 120000, min: 5000, step: 5000, prefix: '$', tooltip: 'Short-term financing amount.' },
            { id: 'interestRatePct', name: 'Bridge Loan APR', type: 'percentage', defaultValue: 9.5, min: 1, max: 25, step: 0.25, suffix: '%', tooltip: 'Short-term interest rate.' },
            { id: 'durationMonths', name: 'Loan Duration (Months)', type: 'dropdown', defaultValue: 6, options: [{ label: '3 Months', value: 3 }, { label: '6 Months', value: 6 }, { label: '12 Months', value: 12 }], tooltip: 'Bridge period.' },
            { id: 'originationFeePct', name: 'Origination Fee Rate', type: 'percentage', defaultValue: 2.0, min: 0, max: 5, step: 0.25, suffix: '%', tooltip: 'Upfront lender fee.' }
        ],
        naturalLanguageQueries: ["What is my monthly payment on a $20,000 loan at 5% for 5 years?", "Calculate loan payment 15000 at 8% over 3 years", "How much interest will I pay on a $50,000 loan?"],
        edgeCases: ["Delayed home sale beyond loan term Negative equity homes High bridge loan rates"],
        calculate: (inputs) => {
            const p = Number(inputs.loanAmount) || 120000;
            const apr = Number(inputs.interestRatePct) || 9.5;
            const months = Number(inputs.durationMonths) || 6;
            const feePct = (Number(inputs.originationFeePct) || 2.0) / 100;

            const origFee = p * feePct;
            const monthlyInterest = (p * (apr / 100)) / 12;
            const totalInterest = monthlyInterest * months;
            const totalCost = origFee + totalInterest;

            return {
                primaryOutput: { label: 'Monthly Interest Payment', value: monthlyInterest.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Financing Cost (Fee + Interest)', value: totalCost.toFixed(2), prefix: '$' },
                    { label: 'Upfront Origination Fee', value: origFee.toFixed(2), prefix: '$' },
                    { label: 'Total Interest Over ' + months + ' Months', value: totalInterest.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 37. Balloon Payment Calculator
    {
        id: 'balloon-payment-calculator',
        name: 'Balloon Payment Calculator',
        category: 'finance-business',
        group: 'Real Estate & Housing',
        bucket: 'Bucket B',
        tier: 1,
        phase: 4,
        monthlySearches: '4K',
        cpc: '$1.28',
        description: "A Balloon Payment Calculator estimates periodic loan payments with a large lump-sum payment due at the end of the term. It is commonly used in commercial lending and short-term financing. The calculator helps borrowers understand remaining balance obligations.",
        inputs: [
            { id: 'loanAmount', name: 'Total Loan Principal', type: 'currency', defaultValue: 250000, min: 5000, step: 5000, prefix: '$', tooltip: 'Initial loan balance.' },
            { id: 'interestRate', name: 'Annual Interest Rate (APR)', type: 'percentage', defaultValue: 7.0, min: 0.1, max: 25, step: 0.125, suffix: '%', tooltip: 'Loan rate.' },
            { id: 'amortizationYears', name: 'Amortization Basis (Years)', type: 'number', defaultValue: 30, min: 10, max: 40, step: 5, suffix: 'years', tooltip: 'Schedule payment is calculated on.' },
            { id: 'balloonDueYears', name: 'Balloon Due in (Years)', type: 'dropdown', defaultValue: 5, options: [{ label: '3 Years', value: 3 }, { label: '5 Years', value: 5 }, { label: '7 Years', value: 7 }, { label: '10 Years', value: 10 }], tooltip: 'When full remaining principal is due.' }
        ],
        naturalLanguageQueries: ["Calculate my balloon payment", "What is my balloon payment?", "Help me work out balloon payment"],
        edgeCases: ["Balloon amount larger than principal Negative amortization Interest-only structures"],
        calculate: (inputs) => {
            const p = Number(inputs.loanAmount) || 250000;
            const apr = Number(inputs.interestRate) || 7.0;
            const amortYears = Number(inputs.amortizationYears) || 30;
            const balloonYears = Number(inputs.balloonDueYears) || 5;

            const monthlyPmt = calculateAmortizationMonthlyPayment(p, apr, amortYears);
            const r = apr / 100 / 12;
            const balloonMonths = balloonYears * 12;

            let balance = p;
            let totalInterestPaid = 0;
            for (let m = 0; m < balloonMonths; m++) {
                const interest = balance * r;
                totalInterestPaid += interest;
                const principal = monthlyPmt - interest;
                balance -= principal;
            }

            return {
                primaryOutput: { label: 'Lump-Sum Balloon Payment Due', value: Math.max(0, balance).toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Monthly Payment During Loan', value: monthlyPmt.toFixed(2), prefix: '$' },
                    { label: 'Total Interest Paid Before Balloon', value: totalInterestPaid.toFixed(2), prefix: '$' },
                    { label: 'Original Principal Financed', value: p.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 38. Bi-Weekly Mortgage Payment Calculator
    {
        id: 'bi-weekly-mortgage-payment-calculator',
        name: 'Bi-Weekly Mortgage Payment Calculator',
        category: 'finance-business',
        group: 'Real Estate & Housing',
        bucket: 'Bucket A',
        tier: 1,
        phase: 4,
        monthlySearches: '1K',
        cpc: '$1.44',
        description: "A Bi-Weekly Mortgage Payment Calculator estimates savings from making half mortgage payments every two weeks instead of monthly. It helps borrowers reduce interest costs and shorten loan terms. The calculator models accelerated repayment schedules.",
        inputs: [
            { id: 'mortgageBalance', name: 'Mortgage Loan Principal', type: 'currency', defaultValue: 320000, min: 10000, step: 5000, prefix: '$', tooltip: 'Current loan principal.' },
            { id: 'interestRate', name: 'Annual Interest Rate (APR)', type: 'percentage', defaultValue: 6.5, min: 0.1, max: 20, step: 0.125, suffix: '%', tooltip: 'Interest rate.' },
            { id: 'termYears', name: 'Original Loan Term (Years)', type: 'dropdown', defaultValue: 30, options: [{ label: '30-Year Fixed', value: 30 }, { label: '15-Year Fixed', value: 15 }], tooltip: 'Term length.' }
        ],
        naturalLanguageQueries: ["What is my monthly mortgage payment on a $400,000 house at 6.5% for 30 years?", "Calculate mortgage 350000 at 7% for 25 years", "How much do I pay monthly on a 500k mortgage?"],
        edgeCases: ["Extra payment application timing Variable-rate mortgages Non-standard payment schedules"],
        calculate: (inputs) => {
            const p = Number(inputs.mortgageBalance) || 320000;
            const apr = Number(inputs.interestRate) || 6.5;
            const term = Number(inputs.termYears) || 30;

            const standardMonthly = calculateAmortizationMonthlyPayment(p, apr, term);
            const biWeeklyPayment = standardMonthly / 2; // 26 payments = 13 full monthly payments / yr
            const standardTotalInterest = (standardMonthly * term * 12) - p;

            // Bi-weekly schedule simulation
            const rBiWeekly = apr / 100 / 26;
            let balance = p;
            let biWeeks = 0;
            let biWeeklyTotalInterest = 0;

            while (balance > 0 && biWeeks < 1500) {
                biWeeks++;
                const interest = balance * rBiWeekly;
                biWeeklyTotalInterest += interest;
                const principal = biWeeklyPayment - interest;
                balance -= principal;
            }

            const payoffYears = biWeeks / 26;
            const yearsSaved = Math.max(0, term - payoffYears);
            const interestSaved = Math.max(0, standardTotalInterest - biWeeklyTotalInterest);

            return {
                primaryOutput: { label: 'Total Interest Saved', value: interestSaved.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Accelerated Payoff Time', value: `${payoffYears.toFixed(1)} Years (${Math.round(biWeeks / 2.167)} Mo)` },
                    { label: 'Time Shaved Off Mortgage', value: `${yearsSaved.toFixed(1)} Years Earlier` },
                    { label: 'Bi-Weekly Payment Amount', value: biWeeklyPayment.toFixed(2), prefix: '$' },
                    { label: 'Standard Monthly Payment', value: standardMonthly.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 39. Loan Comparison Calculator
    {
        id: 'loan-comparison-calculator',
        name: 'Loan Comparison Calculator',
        category: 'finance-business',
        group: 'Real Estate & Housing',
        bucket: 'Bucket B',
        tier: 1,
        phase: 3,
        monthlySearches: '2K',
        cpc: '$6.82  ★ HIGH CPC',
        description: "A Loan Comparison Calculator compares multiple loan offers based on rates, terms, fees, and total repayment cost. It helps borrowers identify the most cost-effective financing option. The calculator supports mortgages, auto loans, and personal loans.",
        inputs: [
            { id: 'loanAmount', name: 'Loan Principal Amount', type: 'currency', defaultValue: 250000, min: 5000, step: 5000, prefix: '$', tooltip: 'Borrowed amount.' },
            { id: 'loanA_Rate', name: 'Loan Option A Rate (APR)', type: 'percentage', defaultValue: 6.5, min: 0.1, max: 25, step: 0.125, suffix: '%', tooltip: 'Option A interest rate.' },
            { id: 'loanA_TermYears', name: 'Loan Option A Term (Years)', type: 'dropdown', defaultValue: 30, options: [{ label: '30 Years', value: 30 }, { label: '20 Years', value: 20 }, { label: '15 Years', value: 15 }], tooltip: 'Option A duration.' },
            { id: 'loanB_Rate', name: 'Loan Option B Rate (APR)', type: 'percentage', defaultValue: 5.875, min: 0.1, max: 25, step: 0.125, suffix: '%', tooltip: 'Option B interest rate.' },
            { id: 'loanB_TermYears', name: 'Loan Option B Term (Years)', type: 'dropdown', defaultValue: 15, options: [{ label: '30 Years', value: 30 }, { label: '20 Years', value: 20 }, { label: '15 Years', value: 15 }], tooltip: 'Option B duration.' }
        ],
        naturalLanguageQueries: ["What is my monthly payment on a $20,000 loan at 5% for 5 years?", "Calculate loan payment 15000 at 8% over 3 years", "How much interest will I pay on a $50,000 loan?"],
        edgeCases: ["Different payment frequencies Promotional interest rates Hidden fees omitted"],
        calculate: (inputs) => {
            const p = Number(inputs.loanAmount) || 250000;
            const rA = Number(inputs.loanA_Rate) || 6.5;
            const tA = Number(inputs.loanA_TermYears) || 30;
            const rB = Number(inputs.loanB_Rate) || 5.875;
            const tB = Number(inputs.loanB_TermYears) || 15;

            const pmtA = calculateAmortizationMonthlyPayment(p, rA, tA);
            const totalA = pmtA * (tA * 12);
            const intA = totalA - p;

            const pmtB = calculateAmortizationMonthlyPayment(p, rB, tB);
            const totalB = pmtB * (tB * 12);
            const intB = totalB - p;

            const interestDiff = Math.abs(intA - intB);
            const cheaper = intA < intB ? 'Option A' : 'Option B';

            return {
                primaryOutput: { label: 'Lifetime Interest Savings with ' + cheaper, value: interestDiff.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Option A Monthly Payment', value: pmtA.toFixed(2), prefix: '$' },
                    { label: 'Option A Total Interest Paid', value: intA.toFixed(2), prefix: '$' },
                    { label: 'Option B Monthly Payment', value: pmtB.toFixed(2), prefix: '$' },
                    { label: 'Option B Total Interest Paid', value: intB.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 40. Investment Calculator
    {
        id: 'investment-calculator',
        name: 'Investment Calculator',
        category: 'finance-business',
        group: 'Savings & Investment',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '673K',
        cpc: '$2.02',
        description: "An Investment Calculator estimates the future value of an investment based on initial capital, recurring contributions, investment duration, and expected return rate. It helps users project long-term wealth growth and compare different investment strategies. The calculator is commonly used for financial planning, retirement preparation, and investment goal forecasting.",
        inputs: [
            { id: 'initialAmount', name: 'Starting Investment Amount', type: 'currency', defaultValue: 10000, min: 0, step: 500, prefix: '$', tooltip: 'Initial capital.' },
            { id: 'monthlyContribution', name: 'Monthly Contribution', type: 'currency', defaultValue: 500, min: 0, step: 50, prefix: '$', tooltip: 'Periodic monthly addition.' },
            { id: 'annualReturnPct', name: 'Estimated Annual Rate of Return', type: 'percentage', defaultValue: 8.0, min: 0, max: 30, step: 0.25, suffix: '%', tooltip: 'Expected annualized growth rate.' },
            { id: 'investmentYears', name: 'Investment Horizon (Years)', type: 'number', defaultValue: 20, min: 1, max: 60, step: 1, suffix: 'years', tooltip: 'Investment duration.' }
        ],
        naturalLanguageQueries: ["Calculate my investment", "What is my investment?", "Help me work out investment"],
        edgeCases: ["Negative return rates Zero contribution investments Zero compounding frequency Extremely long investment durations Contributions exceeding system numeric precis"],
        calculate: (inputs) => {
            const p = Number(inputs.initialAmount) || 0;
            const pmt = Number(inputs.monthlyContribution) || 0;
            const r = Number(inputs.annualReturnPct) || 8.0;
            const t = Number(inputs.investmentYears) || 20;

            const fv = calculateCompoundFutureValue(p, pmt, r, t, 12);
            const totalContributed = p + (pmt * t * 12);
            const totalEarnings = Math.max(0, fv - totalContributed);

            return {
                primaryOutput: { label: 'End Balance Portfolio Value', value: fv.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Invested Capital', value: totalContributed.toFixed(2), prefix: '$' },
                    { label: 'Total Compound Growth / Interest', value: totalEarnings.toFixed(2), prefix: '$' },
                    { label: 'Profit-to-Principal Multiple', value: `${(fv / (totalContributed || 1)).toFixed(2)}x` }
                ]
            };
        }
    },

    // 41. Compound Interest Calculator
    {
        id: 'compound-interest-calculator',
        name: 'Compound Interest Calculator',
        category: 'finance-business',
        group: 'Savings & Investment',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '1.5M',
        cpc: '$1.42',
        description: "A Compound Interest Calculator estimates how money grows when earned interest is reinvested over time. It demonstrates the exponential growth effect of compounding. The calculator is commonly used for savings accounts, investments, and long-term financial projections.",
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
        naturalLanguageQueries: ["What is my monthly payment on a $20,000 loan at 5% for 5 years?", "Calculate loan payment 15000 at 8% over 3 years", "How much interest will I pay on a $50,000 loan?"],
        edgeCases: ["Negative interest rates Daily compounding precision errors Extremely high compounding frequencies Zero-interest scenarios"],
        calculate: (inputs) => {
            const p = Number(inputs.initialPrincipal) || 0;
            const pmt = Number(inputs.monthlyContribution) || 0;
            const r = Number(inputs.annualRatePct) || 8.0;
            const t = Number(inputs.timeHorizonYears) || 20;
            const freq = Number(inputs.compoundingFrequency) || 12;

            const fv = calculateCompoundFutureValue(p, pmt, r, t, freq);
            const totalInvested = p + (pmt * t * 12);
            const totalInterestEarned = Math.max(0, fv - totalInvested);

            return {
                primaryOutput: { label: 'Ending Portfolio Value', value: fv.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Cumulative Contributions', value: totalInvested.toFixed(2), prefix: '$' },
                    { label: 'Total Compound Interest Growth', value: totalInterestEarned.toFixed(2), prefix: '$' },
                    { label: 'Interest-to-Principal Ratio', value: totalInvested > 0 ? `${((totalInterestEarned / totalInvested) * 100).toFixed(0)}%` : '0%' }
                ]
            };
        }
    },

    // 42. Simple Interest Calculator
    {
        id: 'simple-interest-calculator',
        name: 'Simple Interest Calculator',
        category: 'finance-business',
        group: 'Savings & Investment',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '110K',
        cpc: '$1.80',
        description: "A Simple Interest Calculator estimates interest earned or owed using a non-compounding interest model. Interest is calculated only on the original principal amount. The calculator is commonly used for short-term loans and basic lending agreements.",
        inputs: [
            { id: 'principal', name: 'Principal Amount', type: 'currency', defaultValue: 5000, min: 10, step: 100, prefix: '$', tooltip: 'Initial capital sum.' },
            { id: 'annualRatePct', name: 'Annual Interest Rate', type: 'percentage', defaultValue: 5.0, min: 0, max: 100, step: 0.1, suffix: '%', tooltip: 'Simple interest rate per year.' },
            { id: 'timePeriodYears', name: 'Time Period (Years)', type: 'number', defaultValue: 3, min: 0.1, max: 50, step: 0.5, suffix: 'years', tooltip: 'Duration in years.' }
        ],
        naturalLanguageQueries: ["What is my monthly payment on a $20,000 loan at 5% for 5 years?", "Calculate loan payment 15000 at 8% over 3 years", "How much interest will I pay on a $50,000 loan?"],
        edgeCases: ["Negative time periods Zero-interest loans Fractional years precision"],
        calculate: (inputs) => {
            const p = Number(inputs.principal) || 5000;
            const r = (Number(inputs.annualRatePct) || 5.0) / 100;
            const t = Number(inputs.timePeriodYears) || 3;

            const interest = p * r * t;
            const total = p + interest;

            return {
                primaryOutput: { label: 'Total Simple Interest Earned', value: interest.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Ending Balance (P + I)', value: total.toFixed(2), prefix: '$' },
                    { label: 'Annual Interest Earnings', value: (p * r).toFixed(2), prefix: '$' },
                    { label: 'Effective Return on Principal', value: `${((interest / p) * 100).toFixed(1)}%` }
                ]
            };
        }
    },

    // 43. Interest Calculator
    {
        id: 'interest-calculator',
        name: 'Interest Calculator',
        category: 'finance-business',
        group: 'Savings & Investment',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '450K',
        cpc: '$2.10',
        description: "An Interest Calculator computes interest earned or paid across various financial scenarios including simple and compound interest. It allows flexible comparison of growth models. The calculator supports loans, savings, and investment calculations.",
        inputs: [
            { id: 'principal', name: 'Principal Amount', type: 'currency', defaultValue: 10000, min: 100, step: 500, prefix: '$', tooltip: 'Deposit amount.' },
            { id: 'interestRatePct', name: 'Annual Interest Rate', type: 'percentage', defaultValue: 4.5, min: 0, max: 50, step: 0.1, suffix: '%', tooltip: 'APY or APR.' },
            { id: 'years', name: 'Investment Term (Years)', type: 'number', defaultValue: 5, min: 1, max: 40, step: 1, suffix: 'years', tooltip: 'Duration.' },
            { id: 'compoundType', name: 'Interest Mode', type: 'dropdown', defaultValue: 'compound', options: [{ label: 'Compound Interest (Monthly)', value: 'compound' }, { label: 'Simple Interest', value: 'simple' }], tooltip: 'Compounding vs linear.' }
        ],
        naturalLanguageQueries: ["What is my monthly payment on a $20,000 loan at 5% for 5 years?", "Calculate loan payment 15000 at 8% over 3 years", "How much interest will I pay on a $50,000 loan?"],
        edgeCases: ["Invalid compounding frequencies Negative rates Large duration overflow calculations"],
        calculate: (inputs) => {
            const p = Number(inputs.principal) || 10000;
            const r = (Number(inputs.interestRatePct) || 4.5) / 100;
            const t = Number(inputs.years) || 5;
            const isCompound = inputs.compoundType !== 'simple';

            const ending = isCompound ? p * Math.pow(1 + r / 12, 12 * t) : p * (1 + r * t);
            const interest = ending - p;

            return {
                primaryOutput: { label: 'Total Interest Accrued', value: interest.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Ending Balance', value: ending.toFixed(2), prefix: '$' },
                    { label: 'Initial Principal', value: p.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 44. Interest Rate Calculator
    {
        id: 'interest-rate-calculator',
        name: 'Interest Rate Calculator',
        category: 'finance-business',
        group: 'Savings & Investment',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '135K',
        cpc: '$2.06',
        description: "An Interest Rate Calculator solves for the unknown interest rate required to achieve a target payment, balance, or investment outcome. It is commonly used in loan and investment planning. The calculator may use iterative methods because interest rate equations are nonlinear.",
        inputs: [
            { id: 'principal', name: 'Original Principal Amount', type: 'currency', defaultValue: 10000, min: 100, step: 500, prefix: '$', tooltip: 'Starting sum.' },
            { id: 'endingBalance', name: 'Final Ending Balance', type: 'currency', defaultValue: 14693, min: 100, step: 500, prefix: '$', tooltip: 'Total accumulated sum.' },
            { id: 'years', name: 'Time Horizon (Years)', type: 'number', defaultValue: 5, min: 0.5, max: 50, step: 0.5, suffix: 'years', tooltip: 'Duration elapsed.' }
        ],
        naturalLanguageQueries: ["What is my monthly payment on a $20,000 loan at 5% for 5 years?", "Calculate loan payment 15000 at 8% over 3 years", "How much interest will I pay on a $50,000 loan?"],
        edgeCases: ["Impossible repayment conditions Division by zero Non-converging iterative solutions"],
        calculate: (inputs) => {
            const p = Math.max(1, Number(inputs.principal) || 10000);
            const fv = Math.max(p, Number(inputs.endingBalance) || 14693);
            const t = Math.max(0.1, Number(inputs.years) || 5);

            // CAGR: (FV / PV)^(1/t) - 1
            const cagr = (Math.pow(fv / p, 1 / t) - 1) * 100;
            const simpleRate = (((fv - p) / p) / t) * 100;

            return {
                primaryOutput: { label: 'Annual Compound Interest Rate (CAGR)', value: `${cagr.toFixed(2)}%` },
                secondaryMetrics: [
                    { label: 'Simple Annual Interest Rate', value: `${simpleRate.toFixed(2)}%` },
                    { label: 'Total Dollar Growth', value: (fv - p).toFixed(2), prefix: '$' },
                    { label: 'Total Percentage Gain', value: `${(((fv - p) / p) * 100).toFixed(1)}%` }
                ]
            };
        }
    },

    // 45. Savings Calculator
    {
        id: 'savings-calculator',
        name: 'Savings Calculator',
        category: 'finance-business',
        group: 'Savings & Investment',
        bucket: 'Bucket B',
        tier: 2,
        phase: 1,
        monthlySearches: '90K',
        cpc: '$2.93',
        description: "A Savings Calculator estimates future account balances based on deposits, interest rates, and contribution schedules. It helps users plan emergency funds and financial goals. The calculator models compound growth over time.",
        inputs: [
            { id: 'initialDeposit', name: 'Initial Deposit', type: 'currency', defaultValue: 5000, min: 0, step: 250, prefix: '$', tooltip: 'Opening balance.' },
            { id: 'monthlyDeposit', name: 'Monthly Recurring Savings', type: 'currency', defaultValue: 300, min: 0, step: 25, prefix: '$', tooltip: 'Monthly contribution.' },
            { id: 'apyPct', name: 'Annual Percentage Yield (APY)', type: 'percentage', defaultValue: 4.5, min: 0, max: 20, step: 0.1, suffix: '%', tooltip: 'High-yield savings APY.' },
            { id: 'yearsToSave', name: 'Savings Horizon (Years)', type: 'number', defaultValue: 5, min: 1, max: 50, step: 1, suffix: 'years', tooltip: 'Duration.' }
        ],
        naturalLanguageQueries: ["Calculate my savings", "What is my savings?", "Help me work out savings"],
        edgeCases: ["Negative savings growth Zero-interest savings High-frequency compounding precision"],
        calculate: (inputs) => {
            const p = Number(inputs.initialDeposit) || 5000;
            const pmt = Number(inputs.monthlyDeposit) || 300;
            const apy = Number(inputs.apyPct) || 4.5;
            const t = Number(inputs.yearsToSave) || 5;

            const fv = calculateCompoundFutureValue(p, pmt, apy, t, 12);
            const totalSaved = p + (pmt * t * 12);
            const interest = Math.max(0, fv - totalSaved);

            return {
                primaryOutput: { label: 'Projected Total Savings Balance', value: fv.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Principal Saved', value: totalSaved.toFixed(2), prefix: '$' },
                    { label: 'Total Interest Earned', value: interest.toFixed(2), prefix: '$' },
                    { label: 'Average Monthly Interest in Year ' + t, value: ((fv * (apy / 100)) / 12).toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 46. CD Calculator
    {
        id: 'cd-calculator',
        name: 'CD Calculator',
        category: 'finance-business',
        group: 'Savings & Investment',
        bucket: 'Bucket A',
        tier: 1,
        phase: 1,
        monthlySearches: '165K',
        cpc: '$5.84  ★ HIGH CPC',
        description: "A CD Calculator estimates maturity value and earned interest for Certificates of Deposit. It models fixed-rate deposits held until maturity. The calculator helps compare CD investment options.",
        inputs: [
            { id: 'depositAmount', name: 'Certificate of Deposit Principal', type: 'currency', defaultValue: 10000, min: 500, step: 500, prefix: '$', tooltip: 'Lump-sum deposit.' },
            { id: 'apyPct', name: 'CD APY Rate', type: 'percentage', defaultValue: 5.0, min: 0.1, max: 15, step: 0.05, suffix: '%', tooltip: 'Annual percentage yield.' },
            { id: 'cdTermMonths', name: 'CD Maturity Term (Months)', type: 'dropdown', defaultValue: 12, options: [{ label: '6 Months', value: 6 }, { label: '12 Months (1 Yr)', value: 12 }, { label: '18 Months', value: 18 }, { label: '24 Months (2 Yrs)', value: 24 }, { label: '36 Months (3 Yrs)', value: 36 }, { label: '60 Months (5 Yrs)', value: 60 }], tooltip: 'Lock-in period.' }
        ],
        naturalLanguageQueries: ["Calculate my cd", "What is my cd?", "Help me work out cd"],
        edgeCases: ["Early withdrawal penalties not included Zero APY CDs Very short CD terms"],
        calculate: (inputs) => {
            const p = Number(inputs.depositAmount) || 10000;
            const apy = (Number(inputs.apyPct) || 5.0) / 100;
            const months = Number(inputs.cdTermMonths) || 12;
            const years = months / 12;

            // Compounded monthly
            const fv = p * Math.pow(1 + apy / 12, 12 * years);
            const interest = fv - p;

            return {
                primaryOutput: { label: 'CD Balance at Maturity', value: fv.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Guaranteed Interest', value: interest.toFixed(2), prefix: '$' },
                    { label: 'Effective Monthly Yield', value: (interest / months).toFixed(2), prefix: '$' },
                    { label: 'Maturity Duration', value: `${months} Months (${years.toFixed(1)} Years)` }
                ]
            };
        }
    },

    // 47. Bond Calculator
    {
        id: 'bond-calculator',
        name: 'Bond Calculator',
        category: 'finance-business',
        group: 'Savings & Investment',
        bucket: 'Bucket B',
        tier: 2,
        phase: 3,
        monthlySearches: '33K',
        cpc: '$0.45',
        description: "A Bond Calculator estimates bond pricing, yield, coupon payments, and maturity value. It supports fixed-income investment analysis. The calculator helps investors evaluate bond profitability.",
        inputs: [
            { id: 'faceValue', name: 'Bond Face / Par Value', type: 'currency', defaultValue: 1000, min: 100, step: 100, prefix: '$', tooltip: 'Redemption value at maturity.' },
            { id: 'couponRatePct', name: 'Annual Coupon Rate', type: 'percentage', defaultValue: 5.0, min: 0, max: 20, step: 0.125, suffix: '%', tooltip: 'Stated coupon interest rate.' },
            { id: 'yieldToMaturityPct', name: 'Market Yield to Maturity (YTM)', type: 'percentage', defaultValue: 4.5, min: 0.1, max: 25, step: 0.125, suffix: '%', tooltip: 'Required market yield.' },
            { id: 'yearsToMaturity', name: 'Years to Maturity', type: 'number', defaultValue: 10, min: 1, max: 30, step: 1, suffix: 'years', tooltip: 'Remaining bond life.' }
        ],
        naturalLanguageQueries: ["Calculate my bond", "What is my bond?", "Help me work out bond"],
        edgeCases: ["Zero-coupon bonds Negative yields Semiannual compounding precision"],
        calculate: (inputs) => {
            const fv = Number(inputs.faceValue) || 1000;
            const cRate = (Number(inputs.couponRatePct) || 5.0) / 100;
            const ytm = (Number(inputs.yieldToMaturityPct) || 4.5) / 100;
            const t = Number(inputs.yearsToMaturity) || 10;

            const coupon = fv * (cRate / 2); // Semi-annual
            const y = ytm / 2;
            const n = t * 2;

            const pvCoupons = y > 0 ? coupon * ((1 - Math.pow(1 + y, -n)) / y) : coupon * n;
            const pvFace = fv / Math.pow(1 + y, n);
            const bondPrice = pvCoupons + pvFace;
            const currentYield = (fv * cRate / bondPrice) * 100;

            return {
                primaryOutput: { label: 'Calculated Fair Bond Price', value: bondPrice.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Pricing Status', value: bondPrice > fv ? 'Trading at Premium' : bondPrice < fv ? 'Trading at Discount' : 'Trading at Par' },
                    { label: 'Current Annual Yield', value: `${currentYield.toFixed(2)}%` },
                    { label: 'Annual Coupon Payment', value: (fv * cRate).toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 48. Mutual Fund Calculator
    {
        id: 'mutual-fund-calculator',
        name: 'Mutual Fund Calculator',
        category: 'finance-business',
        group: 'Savings & Investment',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '246K',
        cpc: '$0.30',
        description: "A Mutual Fund Calculator estimates investment growth in mutual funds using SIPs or lump-sum investing. It helps investors visualize long-term wealth accumulation. The calculator supports annualized return assumptions.",
        inputs: [
            { id: 'initialInvestment', name: 'Initial Investment Amount', type: 'currency', defaultValue: 10000, min: 500, step: 500, prefix: '$', tooltip: 'Starting capital.' },
            { id: 'monthlyContribution', name: 'Monthly Investment', type: 'currency', defaultValue: 500, min: 0, step: 50, prefix: '$', tooltip: 'Recurring SIP contribution.' },
            { id: 'annualReturnPct', name: 'Gross Annual Return Rate', type: 'percentage', defaultValue: 9.0, min: 1, max: 25, step: 0.25, suffix: '%', tooltip: 'Estimated fund return.' },
            { id: 'expenseRatioPct', name: 'Fund Expense Ratio (MER)', type: 'percentage', defaultValue: 0.75, min: 0.01, max: 3.0, step: 0.05, suffix: '%', tooltip: 'Annual management fee.' },
            { id: 'years', name: 'Investment Horizon (Years)', type: 'number', defaultValue: 20, min: 1, max: 40, step: 1, suffix: 'years', tooltip: 'Holding duration.' }
        ],
        naturalLanguageQueries: ["Calculate my mutual fund", "What is my mutual fund?", "Help me work out mutual fund"],
        edgeCases: ["Negative returns Missed SIP contributions Extremely high annual returns"],
        calculate: (inputs) => {
            const p = Number(inputs.initialInvestment) || 10000;
            const pmt = Number(inputs.monthlyContribution) || 500;
            const grossR = Number(inputs.annualReturnPct) || 9.0;
            const mer = Number(inputs.expenseRatioPct) || 0.75;
            const netR = Math.max(0, grossR - mer);
            const t = Number(inputs.years) || 20;

            const grossFv = calculateCompoundFutureValue(p, pmt, grossR, t, 12);
            const netFv = calculateCompoundFutureValue(p, pmt, netR, t, 12);
            const totalFeesLost = Math.max(0, grossFv - netFv);

            return {
                primaryOutput: { label: 'Net Ending Portfolio Value', value: netFv.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Fees Paid to Fund Managers', value: totalFeesLost.toFixed(2), prefix: '$' },
                    { label: 'Net Annual Return Rate', value: `${netR.toFixed(2)}%` },
                    { label: 'Gross Value (Without Fees)', value: grossFv.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 49. Roth IRA Calculator
    {
        id: 'roth-ira-calculator',
        name: 'Roth IRA Calculator',
        category: 'finance-business',
        group: 'Savings & Investment',
        bucket: 'Bucket A',
        tier: 1,
        phase: 1,
        monthlySearches: '135K',
        cpc: '$3.34',
        description: "A Roth IRA Calculator estimates retirement savings growth in a Roth Individual Retirement Account. It models tax-free growth and retirement withdrawals. The calculator helps retirement savers evaluate future tax-free retirement assets.",
        inputs: [
            { id: 'currentAge', name: 'Current Age', type: 'number', defaultValue: 28, min: 18, max: 70, step: 1, suffix: 'yrs', tooltip: 'Your current age.' },
            { id: 'retirementAge', name: 'Retirement Age', type: 'number', defaultValue: 65, min: 50, max: 80, step: 1, suffix: 'yrs', tooltip: 'Age when withdrawals begin.' },
            { id: 'currentBalance', name: 'Current Roth IRA Balance', type: 'currency', defaultValue: 15000, min: 0, step: 1000, prefix: '$', tooltip: 'Existing Roth savings.' },
            { id: 'annualContribution', name: 'Annual Contribution', type: 'currency', defaultValue: 7000, min: 0, max: 8000, step: 500, prefix: '$', tooltip: '2024 IRS limit is $7,000 ($8,000 if 50+).' },
            { id: 'expectedReturnPct', name: 'Expected Annual Return', type: 'percentage', defaultValue: 8.0, min: 1, max: 15, step: 0.25, suffix: '%', tooltip: 'Annual growth.' }
        ],
        naturalLanguageQueries: ["Calculate my roth ira", "What is my roth ira?", "Help me work out roth ira"],
        edgeCases: ["IRS contribution limits Catch-up contributions after age threshold Early withdrawal penalties not modeled"],
        calculate: (inputs) => {
            const curAge = Number(inputs.currentAge) || 28;
            const retAge = Math.max(curAge + 1, Number(inputs.retirementAge) || 65);
            const startBal = Number(inputs.currentBalance) || 15000;
            const annualContrib = Number(inputs.annualContribution) || 7000;
            const r = Number(inputs.expectedReturnPct) || 8.0;

            const years = retAge - curAge;
            const monthlyContrib = annualContrib / 12;
            const fv = calculateCompoundFutureValue(startBal, monthlyContrib, r, years, 12);
            const totalContributed = startBal + (annualContrib * years);
            const taxFreeEarnings = Math.max(0, fv - totalContributed);
            const safeWithdrawalMonthly = (fv * 0.04) / 12;

            return {
                primaryOutput: { label: 'Tax-Free Nest Egg at Age ' + retAge, value: fv.toFixed(0), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total 100% Tax-Free Earnings', value: taxFreeEarnings.toFixed(0), prefix: '$' },
                    { label: 'Estimated Monthly Income (4% Rule)', value: safeWithdrawalMonthly.toFixed(2), prefix: '$' },
                    { label: 'Total Contributions Invested', value: totalContributed.toFixed(0), prefix: '$' }
                ]
            };
        }
    },

    // 50. IRA Calculator
    {
        id: 'ira-calculator',
        name: 'IRA Calculator',
        category: 'finance-business',
        group: 'Savings & Investment',
        bucket: 'Bucket A',
        tier: 2,
        phase: 2,
        monthlySearches: '27K',
        cpc: '$2.83',
        description: "An IRA Calculator estimates retirement savings growth within traditional or Roth IRA accounts. It supports tax-deferred and tax-free retirement scenarios. The calculator helps compare retirement contribution strategies.",
        inputs: [
            { id: 'currentAge', name: 'Current Age', type: 'number', defaultValue: 35, min: 18, max: 70, step: 1, suffix: 'yrs', tooltip: 'Age today.' },
            { id: 'retirementAge', name: 'Retirement Age', type: 'number', defaultValue: 65, min: 50, max: 80, step: 1, suffix: 'yrs', tooltip: 'Retirement target.' },
            { id: 'annualContribution', name: 'Annual Contribution', type: 'currency', defaultValue: 7000, min: 0, max: 8000, step: 500, prefix: '$', tooltip: 'Annual IRA investment.' },
            { id: 'currentBalance', name: 'Current Balance', type: 'currency', defaultValue: 25000, min: 0, step: 2500, prefix: '$', tooltip: 'Existing IRA value.' },
            { id: 'expectedReturnPct', name: 'Expected Annual Growth Rate', type: 'percentage', defaultValue: 7.5, min: 1, max: 15, step: 0.25, suffix: '%', tooltip: 'Annual return.' }
        ],
        naturalLanguageQueries: ["Calculate my ira", "What is my ira?", "Help me work out ira"],
        edgeCases: ["IRS annual contribution caps Early withdrawal penalties Negative returns"],
        calculate: (inputs) => {
            const curAge = Number(inputs.currentAge) || 35;
            const retAge = Math.max(curAge + 1, Number(inputs.retirementAge) || 65);
            const annual = Number(inputs.annualContribution) || 7000;
            const start = Number(inputs.currentBalance) || 25000;
            const r = Number(inputs.expectedReturnPct) || 7.5;

            const years = retAge - curAge;
            const fv = calculateCompoundFutureValue(start, annual / 12, r, years, 12);
            const totalSaved = start + (annual * years);
            const growth = Math.max(0, fv - totalSaved);

            return {
                primaryOutput: { label: 'Projected IRA Balance at Age ' + retAge, value: fv.toFixed(0), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Investment Contributions', value: totalSaved.toFixed(0), prefix: '$' },
                    { label: 'Total Compound Growth', value: growth.toFixed(0), prefix: '$' },
                    { label: 'Annual Safe Withdrawal (4%)', value: (fv * 0.04).toFixed(0), prefix: '$' }
                ]
            };
        }
    },

    // 51. RMD Calculator
    {
        id: 'rmd-calculator',
        name: 'RMD Calculator',
        category: 'finance-business',
        group: 'Savings & Investment',
        bucket: 'Bucket A',
        tier: 2,
        phase: 2,
        monthlySearches: '90K',
        cpc: '$0.62',
        description: "An RMD Calculator estimates required minimum distributions from retirement accounts based on IRS life expectancy tables. It helps retirees comply with mandatory withdrawal rules. The calculator applies age-based distribution factors.",
        inputs: [
            { id: 'accountBalanceDec31', name: 'IRA / 401(k) Balance on Dec 31', type: 'currency', defaultValue: 600000, min: 1000, step: 10000, prefix: '$', tooltip: 'Prior year-end account balance.' },
            { id: 'currentAge', name: 'Age in Distribution Year', type: 'number', defaultValue: 75, min: 73, max: 110, step: 1, suffix: 'yrs', tooltip: 'IRS Uniform Lifetime Table applies starting age 73.' }
        ],
        naturalLanguageQueries: ["Calculate my rmd", "What is my rmd?", "Help me work out rmd"],
        edgeCases: ["Users below RMD age threshold Missing IRS distribution factors Spousal exceptions 13. 401K Calculator IRS contribution limits Catch-up contributions Salary grow"],
        calculate: (inputs) => {
            const bal = Number(inputs.accountBalanceDec31) || 600000;
            const age = Math.max(73, Number(inputs.currentAge) || 75);

            // IRS Uniform Lifetime Table Life Expectancy Factors
            const irsTable: Record<number, number> = {
                73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0, 79: 21.1,
                80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0, 86: 15.2,
                87: 14.4, 88: 13.7, 89: 12.9, 90: 12.2, 95: 8.9, 100: 6.4
            };
            const factor = irsTable[age] || Math.max(2.0, 24.6 - (age - 75) * 0.85);
            const rmdAmount = bal / factor;

            return {
                primaryOutput: { label: 'Required Minimum Distribution (RMD)', value: rmdAmount.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Monthly Equivalent Distribution', value: (rmdAmount / 12).toFixed(2), prefix: '$' },
                    { label: 'IRS Life Expectancy Factor', value: factor.toFixed(1) },
                    { label: 'RMD as % of Account Balance', value: `${((rmdAmount / bal) * 100).toFixed(2)}%` }
                ]
            };
        }
    },

    // 52. 401K Calculator
    {
        id: '401k-calculator',
        name: '401K Calculator',
        category: 'finance-business',
        group: 'Savings & Investment',
        bucket: 'Bucket A',
        tier: 1,
        phase: 1,
        monthlySearches: '165K',
        cpc: '$1.36',
        description: "Calculates 401k calculator metrics, schedules, and financial estimates.",
        inputs: [
            { id: 'currentAge', name: 'Current Age', type: 'number', defaultValue: 30, min: 18, max: 75, step: 1, suffix: 'yrs', tooltip: 'Current age.' },
            { id: 'retirementAge', name: 'Target Retirement Age', type: 'number', defaultValue: 65, min: 45, max: 80, step: 1, suffix: 'yrs', tooltip: 'Age when withdrawals begin.' },
            { id: 'currentBalance', name: 'Current 401(k) Balance', type: 'currency', defaultValue: 45000, min: 0, step: 5000, prefix: '$', tooltip: 'Existing balance.' },
            { id: 'annualSalary', name: 'Current Gross Annual Salary', type: 'currency', defaultValue: 85000, min: 10000, step: 2500, prefix: '$', tooltip: 'Base annual wage.' },
            { id: 'employeeContributionPct', name: 'Your Contribution Rate', type: 'percentage', defaultValue: 8.0, min: 0, max: 50, step: 0.5, suffix: '%', tooltip: 'Percentage of salary invested.' },
            { id: 'employerMatchPct', name: 'Employer Match Up To', type: 'percentage', defaultValue: 4.0, min: 0, max: 15, step: 0.5, suffix: '%', tooltip: 'Company matching limit.' },
            { id: 'expectedReturnPct', name: 'Estimated Annual Investment Return', type: 'percentage', defaultValue: 7.5, min: 1, max: 15, step: 0.25, suffix: '%', tooltip: 'Market return expectation.' }
        ],
        naturalLanguageQueries: ["Calculate my 401k", "What is my 401k?", "Help me work out 401k"],
        edgeCases: ["Zero or negative numerical inputs", "Boundary conditions"],
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
            let totalEmp = 0;
            let totalMatch = 0;
            let currentSal = salary;

            for (let y = 0; y < years; y++) {
                const empAnnual = currentSal * empPct;
                const matchAnnual = currentSal * Math.min(empPct, matchPct);
                totalEmp += empAnnual;
                totalMatch += matchAnnual;
                balance = (balance + empAnnual + matchAnnual) * (1 + r);
                currentSal *= 1.02; // 2% wage inflation
            }

            const monthlyIncome4Pct = (balance * 0.04) / 12;

            return {
                primaryOutput: { label: 'Projected 401(k) Balance at Retirement', value: balance.toFixed(0), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Monthly Retirement Income (4% Rule)', value: monthlyIncome4Pct.toFixed(2), prefix: '$' },
                    { label: 'Total Employee Contributions', value: totalEmp.toFixed(0), prefix: '$' },
                    { label: 'Total Free Employer Match Received', value: totalMatch.toFixed(0), prefix: '$' }
                ]
            };
        }
    },

    // 53. Annuity Calculator
    {
        id: 'annuity-calculator',
        name: 'Annuity Calculator',
        category: 'finance-business',
        group: 'Savings & Investment',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '74K',
        cpc: '$5.28  ★ HIGH CPC',
        description: "An Annuity Calculator estimates the future or present value of a stream of equal periodic payments. It supports ordinary annuities and annuities due. The calculator is commonly used for retirement planning and pension analysis.",
        inputs: [
            { id: 'initialPremium', name: 'Initial Annuity Premium Deposit', type: 'currency', defaultValue: 50000, min: 1000, step: 5000, prefix: '$', tooltip: 'Lump-sum investment.' },
            { id: 'monthlyContribution', name: 'Monthly Recurring Addition', type: 'currency', defaultValue: 500, min: 0, step: 50, prefix: '$', tooltip: 'Periodic premium deposit.' },
            { id: 'guaranteedRatePct', name: 'Guaranteed Interest Rate', type: 'percentage', defaultValue: 5.5, min: 0.5, max: 15, step: 0.1, suffix: '%', tooltip: 'Fixed annuity growth rate.' },
            { id: 'accumulationYears', name: 'Accumulation Period (Years)', type: 'number', defaultValue: 15, min: 1, max: 40, step: 1, suffix: 'years', tooltip: 'Time before annuitization.' }
        ],
        naturalLanguageQueries: ["Calculate my annuity", "What is my annuity?", "Help me work out annuity"],
        edgeCases: ["Zero interest annuities Very large payment counts Negative discount rates"],
        calculate: (inputs) => {
            const p = Number(inputs.initialPremium) || 50000;
            const pmt = Number(inputs.monthlyContribution) || 500;
            const r = Number(inputs.guaranteedRatePct) || 5.5;
            const years = Number(inputs.accumulationYears) || 15;

            const fv = calculateCompoundFutureValue(p, pmt, r, years, 12);
            const totalPaid = p + (pmt * years * 12);
            const growth = Math.max(0, fv - totalPaid);

            return {
                primaryOutput: { label: 'Annuity Value at Accumulation End', value: fv.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Premiums Paid', value: totalPaid.toFixed(2), prefix: '$' },
                    { label: 'Total Guaranteed Interest Growth', value: growth.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 54. Annuity Payout Calculator
    {
        id: 'annuity-payout-calculator',
        name: 'Annuity Payout Calculator',
        category: 'finance-business',
        group: 'Savings & Investment',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '12K',
        cpc: '$5.51  ★ HIGH CPC',
        description: "An Annuity Payout Calculator estimates periodic withdrawal payments from an annuity balance. It helps retirees determine sustainable payout amounts. The calculator supports fixed payout periods and lifetime estimates.",
        inputs: [
            { id: 'annuityFundBalance', name: 'Annuity Lump Sum Principal', type: 'currency', defaultValue: 250000, min: 10000, step: 10000, prefix: '$', tooltip: 'Total capital annuitized.' },
            { id: 'payoutYears', name: 'Payout Term (Years)', type: 'dropdown', defaultValue: 20, options: [{ label: '10 Years', value: 10 }, { label: '15 Years', value: 15 }, { label: '20 Years', value: 20 }, { label: '25 Years', value: 25 }, { label: '30 Years', value: 30 }], tooltip: 'Guaranteed payout period.' },
            { id: 'payoutRatePct', name: 'Annuity Interest Rate', type: 'percentage', defaultValue: 5.0, min: 0.5, max: 12, step: 0.125, suffix: '%', tooltip: 'Insurer crediting rate.' }
        ],
        naturalLanguageQueries: ["Calculate my annuity payout", "What is my annuity payout?", "Help me work out annuity payout"],
        edgeCases: ["Insufficient balance scenarios Lifetime payout assumptions Negative returns during payout phase"],
        calculate: (inputs) => {
            const p = Number(inputs.annuityFundBalance) || 250000;
            const years = Number(inputs.payoutYears) || 20;
            const apr = Number(inputs.payoutRatePct) || 5.0;

            const monthlyPayout = calculateAmortizationMonthlyPayment(p, apr, years);
            const totalLifetimePayout = monthlyPayout * (years * 12);
            const totalInterestReceived = Math.max(0, totalLifetimePayout - p);

            return {
                primaryOutput: { label: 'Guaranteed Monthly Annuity Payout', value: monthlyPayout.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Lifetime Payouts Received', value: totalLifetimePayout.toFixed(2), prefix: '$' },
                    { label: 'Total Earnings / Interest Built-In', value: totalInterestReceived.toFixed(2), prefix: '$' },
                    { label: 'Annual Income Stream', value: (monthlyPayout * 12).toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 55. Pension Calculator
    {
        id: 'pension-calculator',
        name: 'Pension Calculator',
        category: 'finance-business',
        group: 'Savings & Investment',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '90K',
        cpc: '$1.89',
        description: "A Pension Calculator estimates retirement pension income based on salary history, years of service, and pension formulas. It helps employees forecast retirement benefits. The calculator supports defined benefit pension plans.",
        inputs: [
            { id: 'yearsOfService', name: 'Years of Credited Service', type: 'number', defaultValue: 25, min: 1, max: 50, step: 1, suffix: 'years', tooltip: 'Total tenure with employer.' },
            { id: 'finalAverageSalary', name: 'Final Average Salary (High 3/5)', type: 'currency', defaultValue: 85000, min: 10000, step: 2500, prefix: '$', tooltip: 'Average top earning salary.' },
            { id: 'multiplierPct', name: 'Pension Multiplier per Year', type: 'percentage', defaultValue: 1.75, min: 0.5, max: 3.0, step: 0.05, suffix: '%', tooltip: 'Defined benefit formula factor.' }
        ],
        naturalLanguageQueries: ["Calculate my pension", "What is my pension?", "Help me work out pension"],
        edgeCases: ["Early retirement reductions Inflation adjustments Service year caps"],
        calculate: (inputs) => {
            const years = Number(inputs.yearsOfService) || 25;
            const salary = Number(inputs.finalAverageSalary) || 85000;
            const mult = (Number(inputs.multiplierPct) || 1.75) / 100;

            const replacementPct = (years * mult) * 100;
            const annualPension = salary * (years * mult);
            const monthlyPension = annualPension / 12;

            return {
                primaryOutput: { label: 'Monthly Pension Benefit', value: monthlyPension.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Annual Guaranteed Pension', value: annualPension.toFixed(2), prefix: '$' },
                    { label: 'Salary Replacement Percentage', value: `${replacementPct.toFixed(1)}%` },
                    { label: 'Total Years of Service', value: `${years} Years` }
                ]
            };
        }
    },

    // 56. Retirement Calculator
    {
        id: 'retirement-calculator',
        name: 'Retirement Calculator',
        category: 'finance-business',
        group: 'Savings & Investment',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '368K',
        cpc: '$2.97',
        description: "A Retirement Calculator estimates how much money a person needs and may accumulate for retirement. It models investment growth, inflation, savings, and retirement spending. The calculator helps users evaluate retirement readiness.",
        inputs: [
            { id: 'currentAge', name: 'Current Age', type: 'number', defaultValue: 35, min: 18, max: 70, step: 1, suffix: 'yrs', tooltip: 'Age today.' },
            { id: 'retirementAge', name: 'Target Retirement Age', type: 'number', defaultValue: 65, min: 45, max: 80, step: 1, suffix: 'yrs', tooltip: 'Retirement age.' },
            { id: 'currentSavings', name: 'Current Total Retirement Savings', type: 'currency', defaultValue: 80000, min: 0, step: 5000, prefix: '$', tooltip: 'All retirement accounts.' },
            { id: 'monthlyContribution', name: 'Monthly Retirement Savings', type: 'currency', defaultValue: 1000, min: 0, step: 50, prefix: '$', tooltip: 'Monthly investment.' },
            { id: 'desiredMonthlyIncome', name: 'Desired Monthly Retirement Income', type: 'currency', defaultValue: 5000, min: 1000, step: 250, prefix: '$', tooltip: 'Target monthly spending in retirement.' },
            { id: 'investmentReturnPct', name: 'Pre-Retirement Investment Return', type: 'percentage', defaultValue: 7.5, min: 1, max: 15, step: 0.25, suffix: '%', tooltip: 'Expected growth.' }
        ],
        naturalLanguageQueries: ["Calculate my retirement", "What is my retirement?", "Help me work out retirement"],
        edgeCases: ["Retirement age less than current age Negative investment returns Unrealistic withdrawal assumptions"],
        calculate: (inputs) => {
            const curAge = Number(inputs.currentAge) || 35;
            const retAge = Math.max(curAge + 1, Number(inputs.retirementAge) || 65);
            const saved = Number(inputs.currentSavings) || 80000;
            const monthly = Number(inputs.monthlyContribution) || 1000;
            const desiredMonthly = Number(inputs.desiredMonthlyIncome) || 5000;
            const r = Number(inputs.investmentReturnPct) || 7.5;

            const years = retAge - curAge;
            const projectedNestEgg = calculateCompoundFutureValue(saved, monthly, r, years, 12);
            const requiredNestEgg = (desiredMonthly * 12) / 0.04; // 4% rule
            const surplusOrShortfall = projectedNestEgg - requiredNestEgg;

            return {
                primaryOutput: { label: 'Projected Retirement Nest Egg', value: projectedNestEgg.toFixed(0), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Required Target Nest Egg (4% Rule)', value: requiredNestEgg.toFixed(0), prefix: '$' },
                    { label: 'Retirement Readiness Status', value: surplusOrShortfall >= 0 ? `On Track (+$$${surplusOrShortfall.toFixed(0)} Surplus)` : `Shortfall of $$${Math.abs(surplusOrShortfall).toFixed(0)}` },
                    { label: 'Sustainable Monthly Income at Age ' + retAge, value: ((projectedNestEgg * 0.04) / 12).toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 57. Average Return Calculator
    {
        id: 'average-return-calculator',
        name: 'Average Return Calculator',
        category: 'finance-business',
        group: 'Savings & Investment',
        bucket: 'Bucket B',
        tier: 1,
        phase: 4,
        monthlySearches: '210',
        cpc: '$2.02',
        description: "An Average Return Calculator computes the average annual return of investments over time. It supports arithmetic and geometric average return methods. The calculator helps investors compare historical performance.",
        inputs: [
            { id: 'initialValue', name: 'Starting Portfolio Value', type: 'currency', defaultValue: 50000, min: 100, step: 1000, prefix: '$', tooltip: 'Initial valuation.' },
            { id: 'finalValue', name: 'Ending Portfolio Value', type: 'currency', defaultValue: 110000, min: 100, step: 1000, prefix: '$', tooltip: 'Terminal valuation.' },
            { id: 'years', name: 'Number of Years Elapsed', type: 'number', defaultValue: 8, min: 0.5, max: 50, step: 0.5, suffix: 'years', tooltip: 'Investment horizon.' }
        ],
        naturalLanguageQueries: ["How old am I if I was born on March 15 1990?", "Calculate my age born 1985", "How many days old am I?"],
        edgeCases: ["Negative returns below -100% Missing return periods Single-period return calculations"],
        calculate: (inputs) => {
            const p = Math.max(1, Number(inputs.initialValue) || 50000);
            const fv = Number(inputs.finalValue) || 110000;
            const t = Math.max(0.1, Number(inputs.years) || 8);

            const totalReturnPct = ((fv - p) / p) * 100;
            const arithmeticMean = totalReturnPct / t;
            const cagr = (Math.pow(fv / p, 1 / t) - 1) * 100;

            return {
                primaryOutput: { label: 'Compound Annual Growth Rate (CAGR)', value: `${cagr.toFixed(2)}%` },
                secondaryMetrics: [
                    { label: 'Arithmetic Average Annual Return', value: `${arithmeticMean.toFixed(2)}%` },
                    { label: 'Total Cumulative Return', value: `${totalReturnPct.toFixed(2)}%` },
                    { label: 'Absolute Capital Gain', value: (fv - p).toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 58. IRR Calculator
    {
        id: 'irr-calculator',
        name: 'IRR Calculator',
        category: 'finance-business',
        group: 'Savings & Investment',
        bucket: 'Bucket B',
        tier: 2,
        phase: 3,
        monthlySearches: '22K',
        cpc: '$3.25',
        description: "An IRR Calculator computes the Internal Rate of Return for investments with multiple cash flows. It identifies the discount rate where net present value equals zero. The calculator is commonly used in capital budgeting and investment analysis.",
        inputs: [
            { id: 'initialOutlay', name: 'Initial Outlay (Year 0)', type: 'currency', defaultValue: 100000, min: 1000, step: 5000, prefix: '$', tooltip: 'Initial capital investment.' },
            { id: 'cfYear1', name: 'Cash Flow Year 1', type: 'currency', defaultValue: 25000, min: 0, step: 1000, prefix: '$', tooltip: 'Year 1 return.' },
            { id: 'cfYear2', name: 'Cash Flow Year 2', type: 'currency', defaultValue: 35000, min: 0, step: 1000, prefix: '$', tooltip: 'Year 2 return.' },
            { id: 'cfYear3', name: 'Cash Flow Year 3', type: 'currency', defaultValue: 40000, min: 0, step: 1000, prefix: '$', tooltip: 'Year 3 return.' },
            { id: 'cfYear4', name: 'Cash Flow Year 4', type: 'currency', defaultValue: 45000, min: 0, step: 1000, prefix: '$', tooltip: 'Year 4 return.' }
        ],
        naturalLanguageQueries: ["Calculate my irr", "What is my irr?", "Help me work out irr"],
        edgeCases: ["Multiple IRR solutions No valid IRR Non-converging iterations All-positive or all-negative cash flows"],
        calculate: (inputs) => {
            const c0 = -Math.abs(Number(inputs.initialOutlay) || 100000);
            const cfs = [
                c0,
                Number(inputs.cfYear1) || 25000,
                Number(inputs.cfYear2) || 35000,
                Number(inputs.cfYear3) || 40000,
                Number(inputs.cfYear4) || 45000
            ];

            // Newton-Raphson approximation for IRR
            let rate = 0.10;
            for (let iter = 0; iter < 100; iter++) {
                let npv = 0;
                let dNpv = 0;
                for (let t = 0; t < cfs.length; t++) {
                    npv += cfs[t] / Math.pow(1 + rate, t);
                    if (t > 0) dNpv -= (t * cfs[t]) / Math.pow(1 + rate, t + 1);
                }
                if (Math.abs(dNpv) < 1e-7) break;
                const newRate = rate - npv / dNpv;
                if (Math.abs(newRate - rate) < 1e-6) {
                    rate = newRate;
                    break;
                }
                rate = newRate;
            }

            const totalInflows = cfs.slice(1).reduce((a, b) => a + b, 0);
            const netProfit = totalInflows + c0;

            return {
                primaryOutput: { label: 'Internal Rate of Return (IRR)', value: `${(rate * 100).toFixed(2)}%` },
                secondaryMetrics: [
                    { label: 'Total Inflow Receipts', value: totalInflows.toFixed(2), prefix: '$' },
                    { label: 'Net Nominal Profit', value: netProfit.toFixed(2), prefix: '$' },
                    { label: 'Initial Investment Capital', value: Math.abs(c0).toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 59. ROI Calculator
    {
        id: 'roi-calculator',
        name: 'ROI Calculator',
        category: 'finance-business',
        group: 'Savings & Investment',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '60K',
        cpc: '$3.24',
        description: "An ROI Calculator measures the profitability of an investment relative to its cost. It provides a simple percentage return metric. The calculator is commonly used for business investments, marketing campaigns, and asset evaluation.",
        inputs: [
            { id: 'amountInvested', name: 'Initial Amount Invested', type: 'currency', defaultValue: 10000, min: 10, step: 250, prefix: '$', tooltip: 'Capital outlay.' },
            { id: 'amountReturned', name: 'Final Amount Returned', type: 'currency', defaultValue: 14500, min: 0, step: 250, prefix: '$', tooltip: 'Total gross proceeds.' },
            { id: 'holdingPeriodYears', name: 'Investment Duration (Years)', type: 'number', defaultValue: 3, min: 0.1, max: 50, step: 0.5, suffix: 'years', tooltip: 'Holding period.' }
        ],
        naturalLanguageQueries: ["Calculate my roi", "What is my roi?", "Help me work out roi"],
        edgeCases: ["Zero investment cost Negative profits Extremely large gains causing overflow"],
        calculate: (inputs) => {
            const invested = Math.max(1, Number(inputs.amountInvested) || 10000);
            const returned = Number(inputs.amountReturned) || 14500;
            const years = Math.max(0.1, Number(inputs.holdingPeriodYears) || 3);

            const netProfit = returned - invested;
            const roiPct = (netProfit / invested) * 100;
            const annualizedRoiPct = (Math.pow(returned / invested, 1 / years) - 1) * 100;

            return {
                primaryOutput: { label: 'Total Return on Investment (ROI)', value: `${roiPct.toFixed(2)}%` },
                secondaryMetrics: [
                    { label: 'Annualized ROI (CAGR)', value: `${annualizedRoiPct.toFixed(2)}%` },
                    { label: 'Net Profit / Gain', value: netProfit.toFixed(2), prefix: '$' },
                    { label: 'Capital Multiple', value: `${(returned / invested).toFixed(2)}x` }
                ]
            };
        }
    },

    // 60. Present Value Calculator
    {
        id: 'present-value-calculator',
        name: 'Present Value Calculator',
        category: 'finance-business',
        group: 'Savings & Investment',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '22K',
        cpc: '$2.82',
        description: "A Present Value Calculator determines the current worth of a future amount of money based on a specified discount or interest rate. It helps users evaluate how much a future payment or investment is worth in today\u2019s dollars. The calculator is widely used in investment analysis, retirement planning, bond valuation, and corporate finance.",
        inputs: [
            { id: 'futureValue', name: 'Future Lump Sum Value', type: 'currency', defaultValue: 50000, min: 100, step: 1000, prefix: '$', tooltip: 'Nominal amount in the future.' },
            { id: 'discountRatePct', name: 'Annual Discount Rate', type: 'percentage', defaultValue: 6.0, min: 0, max: 30, step: 0.25, suffix: '%', tooltip: 'Required rate of return.' },
            { id: 'numberOfPeriodsYears', name: 'Number of Years', type: 'number', defaultValue: 10, min: 1, max: 50, step: 1, suffix: 'years', tooltip: 'Time until receipt.' }
        ],
        naturalLanguageQueries: ["Calculate my present value", "What is my present value?", "Help me work out present value"],
        edgeCases: ["Zero discount rate Negative discount rates Extremely large future values Fractional compounding periods Division precision issues"],
        calculate: (inputs) => {
            const fv = Number(inputs.futureValue) || 50000;
            const r = (Number(inputs.discountRatePct) || 6.0) / 100;
            const t = Number(inputs.numberOfPeriodsYears) || 10;

            const pv = fv / Math.pow(1 + r, t);
            const discountAmount = fv - pv;

            return {
                primaryOutput: { label: 'Present Value (Today\'s Worth)', value: pv.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Discount Value', value: discountAmount.toFixed(2), prefix: '$' },
                    { label: 'Present Value Ratio', value: `${((pv / fv) * 100).toFixed(1)}% of FV` }
                ]
            };
        }
    },

    // 61. Future Value Calculator
    {
        id: 'future-value-calculator',
        name: 'Future Value Calculator',
        category: 'finance-business',
        group: 'Savings & Investment',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '60K',
        cpc: '$2.01',
        description: "A Future Value Calculator estimates how much an investment or savings account will be worth in the future after earning interest or returns over time. It supports both lump-sum and recurring contribution calculations. The calculator helps users plan long-term financial goals.",
        inputs: [
            { id: 'presentValue', name: 'Present Value (Initial Sum)', type: 'currency', defaultValue: 25000, min: 0, step: 1000, prefix: '$', tooltip: 'Starting capital.' },
            { id: 'periodicDeposit', name: 'Periodic Monthly Deposit', type: 'currency', defaultValue: 400, min: 0, step: 50, prefix: '$', tooltip: 'Recurring monthly addition.' },
            { id: 'interestRatePct', name: 'Annual Growth Rate', type: 'percentage', defaultValue: 7.0, min: 0, max: 30, step: 0.25, suffix: '%', tooltip: 'Expected interest rate.' },
            { id: 'years', name: 'Investment Term (Years)', type: 'number', defaultValue: 15, min: 1, max: 50, step: 1, suffix: 'years', tooltip: 'Time horizon.' }
        ],
        naturalLanguageQueries: ["Calculate my future value", "What is my future value?", "Help me work out future value"],
        edgeCases: ["Negative growth rates Zero interest scenarios Extremely long durations Zero recurring contributions"],
        calculate: (inputs) => {
            const pv = Number(inputs.presentValue) || 25000;
            const pmt = Number(inputs.periodicDeposit) || 400;
            const r = Number(inputs.interestRatePct) || 7.0;
            const t = Number(inputs.years) || 15;

            const fv = calculateCompoundFutureValue(pv, pmt, r, t, 12);
            const totalPrincipal = pv + (pmt * t * 12);
            const totalGrowth = fv - totalPrincipal;

            return {
                primaryOutput: { label: 'Projected Future Value (FV)', value: fv.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Invested Outlay', value: totalPrincipal.toFixed(2), prefix: '$' },
                    { label: 'Total Investment Return', value: totalGrowth.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 62. Payback Period Calculator
    {
        id: 'payback-period-calculator',
        name: 'Payback Period Calculator',
        category: 'finance-business',
        group: 'Savings & Investment',
        bucket: 'Bucket B',
        tier: 1,
        phase: 3,
        monthlySearches: '3K',
        cpc: '$2.36',
        description: "A Payback Period Calculator estimates how long it takes for an investment to recover its initial cost through generated cash flows. It is commonly used in project evaluation and business investments. The calculator helps determine investment recovery timelines.",
        inputs: [
            { id: 'initialInvestment', name: 'Initial Project Capital Cost', type: 'currency', defaultValue: 60000, min: 1000, step: 2500, prefix: '$', tooltip: 'Upfront capital expense.' },
            { id: 'annualCashFlow', name: 'Expected Annual Net Cash Inflow', type: 'currency', defaultValue: 16000, min: 500, step: 500, prefix: '$', tooltip: 'Recurring annual savings or earnings.' }
        ],
        naturalLanguageQueries: ["Calculate my payback period", "What is my payback period?", "Help me work out payback period"],
        edgeCases: ["Negative annual cash flow No payback achieved Irregular cash flow schedules Zero cash flow values"],
        calculate: (inputs) => {
            const cost = Number(inputs.initialInvestment) || 60000;
            const flow = Math.max(1, Number(inputs.annualCashFlow) || 16000);

            const paybackYears = cost / flow;
            const paybackMonths = Math.round(paybackYears * 12);

            return {
                primaryOutput: { label: 'Payback Period', value: `${paybackYears.toFixed(2)} Years`, suffix: `(${paybackMonths} Months)` },
                secondaryMetrics: [
                    { label: 'Annual Cash Inflow', value: flow.toFixed(2), prefix: '$' },
                    { label: 'Initial Capital Cost', value: cost.toFixed(2), prefix: '$' },
                    { label: 'Simple Return on Capital', value: `${((flow / cost) * 100).toFixed(1)}% / yr` }
                ]
            };
        }
    },

    // 63. Lumpsum Investment Calculator
    {
        id: 'lumpsum-investment-calculator',
        name: 'Lumpsum Investment Calculator',
        category: 'finance-business',
        group: 'Savings & Investment',
        bucket: 'Bucket B',
        tier: 1,
        phase: 3,
        monthlySearches: '4K',
        cpc: '$0.30',
        description: "A Lumpsum Investment Calculator estimates future value of a one-time investment. It demonstrates long-term compounding growth without recurring contributions. The calculator helps investors compare investment horizons and expected returns.",
        inputs: [
            { id: 'lumpSumAmount', name: 'Lump Sum Investment Amount', type: 'currency', defaultValue: 50000, min: 500, step: 2500, prefix: '$', tooltip: 'One-time investment.' },
            { id: 'expectedReturnRate', name: 'Expected Annual Return Rate', type: 'percentage', defaultValue: 9.0, min: 0.1, max: 25, step: 0.25, suffix: '%', tooltip: 'Annual rate of return.' },
            { id: 'years', name: 'Investment Horizon (Years)', type: 'number', defaultValue: 15, min: 1, max: 50, step: 1, suffix: 'years', tooltip: 'Duration.' }
        ],
        naturalLanguageQueries: ["Calculate my lumpsum investment", "What is my lumpsum investment?", "Help me work out lumpsum investment"],
        edgeCases: ["Negative returns Zero duration investments Large investment amounts"],
        calculate: (inputs) => {
            const p = Number(inputs.lumpSumAmount) || 50000;
            const r = (Number(inputs.expectedReturnRate) || 9.0) / 100;
            const t = Number(inputs.years) || 15;

            const fv = p * Math.pow(1 + r, t);
            const totalWealthGain = fv - p;

            return {
                primaryOutput: { label: 'Projected Portfolio Value', value: fv.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Wealth Gain', value: totalWealthGain.toFixed(2), prefix: '$' },
                    { label: 'Wealth Multiple', value: `${(fv / p).toFixed(2)}x Initial Deposit` },
                    { label: 'Initial Investment', value: p.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 64. Stock Return Calculator
    {
        id: 'stock-return-calculator',
        name: 'Stock Return Calculator',
        category: 'finance-business',
        group: 'Savings & Investment',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '7K',
        cpc: '$2.41',
        description: "A Stock Return Calculator estimates gains or losses from stock investments including capital appreciation and dividends. It helps investors measure investment performance. The calculator supports percentage and dollar-based return analysis.",
        inputs: [
            { id: 'sharesBought', name: 'Number of Shares', type: 'number', defaultValue: 100, min: 1, max: 100000, step: 1, tooltip: 'Quantity of shares.' },
            { id: 'buyPrice', name: 'Purchase Price per Share', type: 'currency', defaultValue: 150, min: 0.01, step: 5, prefix: '$', tooltip: 'Cost basis per share.' },
            { id: 'sellPrice', name: 'Selling Price per Share', type: 'currency', defaultValue: 210, min: 0.01, step: 5, prefix: '$', tooltip: 'Sale price.' },
            { id: 'totalDividendsReceived', name: 'Total Dividends Received', type: 'currency', defaultValue: 800, min: 0, step: 50, prefix: '$', tooltip: 'Dividend cash collected.' },
            { id: 'commissionFees', name: 'Total Trading Commissions / Fees', type: 'currency', defaultValue: 10, min: 0, step: 1, prefix: '$', tooltip: 'Broker fees.' }
        ],
        naturalLanguageQueries: ["Calculate my stock return", "What is my stock return?", "Help me work out stock return"],
        edgeCases: ["Stock splits not adjusted Negative stock returns Fractional shares"],
        calculate: (inputs) => {
            const shares = Number(inputs.sharesBought) || 100;
            const buy = Number(inputs.buyPrice) || 150;
            const sell = Number(inputs.sellPrice) || 210;
            const div = Number(inputs.totalDividendsReceived) || 800;
            const fees = Number(inputs.commissionFees) || 10;

            const totalCost = (shares * buy) + fees;
            const grossProceeds = shares * sell;
            const capitalGain = grossProceeds - (shares * buy);
            const totalNetProfit = capitalGain + div - fees;
            const totalRoiPct = (totalNetProfit / totalCost) * 100;

            return {
                primaryOutput: { label: 'Total Net Profit / Gain', value: totalNetProfit.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Return Percentage (ROI)', value: `${totalRoiPct.toFixed(2)}%` },
                    { label: 'Capital Gain (Excluding Dividends)', value: capitalGain.toFixed(2), prefix: '$' },
                    { label: 'Dividend Income Collected', value: div.toFixed(2), prefix: '$' },
                    { label: 'Total Cost Basis', value: totalCost.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 65. Dividend Calculator
    {
        id: 'dividend-calculator',
        name: 'Dividend Calculator',
        category: 'finance-business',
        group: 'Savings & Investment',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '50K',
        cpc: '$2.39',
        description: "A Dividend Calculator estimates dividend income from stock investments. It helps investors project passive income generated from dividend-paying stocks. The calculator supports annual, quarterly, and monthly dividend schedules.",
        inputs: [
            { id: 'portfolioValue', name: 'Dividend Stock Portfolio Value', type: 'currency', defaultValue: 100000, min: 1000, step: 5000, prefix: '$', tooltip: 'Current portfolio equity.' },
            { id: 'dividendYieldPct', name: 'Average Annual Dividend Yield', type: 'percentage', defaultValue: 4.2, min: 0.1, max: 20, step: 0.1, suffix: '%', tooltip: 'Weighted dividend yield.' },
            { id: 'annualDividendGrowthRate', name: 'Annual Dividend Growth Rate (DGR)', type: 'percentage', defaultValue: 5.0, min: 0, max: 20, step: 0.25, suffix: '%', tooltip: 'Yearly dividend payout increases.' },
            { id: 'yearsHeld', name: 'Holding Period (Years)', type: 'number', defaultValue: 10, min: 1, max: 40, step: 1, suffix: 'years', tooltip: 'Duration.' },
            { id: 'reinvestDividends', name: 'Dividend Reinvestment (DRIP)', type: 'toggle', defaultValue: true, tooltip: 'Reinvest payouts into more shares.' }
        ],
        naturalLanguageQueries: ["Calculate my dividend", "What is my dividend?", "Help me work out dividend"],
        edgeCases: ["Dividend cuts or suspensions not modeled Fractional shares Zero-dividend stocks"],
        calculate: (inputs) => {
            let val = Number(inputs.portfolioValue) || 100000;
            const yieldPct = (Number(inputs.dividendYieldPct) || 4.2) / 100;
            const dgr = (Number(inputs.annualDividendGrowthRate) || 5.0) / 100;
            const years = Number(inputs.yearsHeld) || 10;
            const drip = Boolean(inputs.reinvestDividends);

            let totalDivPaid = 0;
            let currentYield = yieldPct;

            for (let y = 0; y < years; y++) {
                const annualDiv = val * currentYield;
                totalDivPaid += annualDiv;
                if (drip) val += annualDiv;
                currentYield *= (1 + dgr);
            }

            const finalAnnualIncome = val * currentYield;

            return {
                primaryOutput: { label: 'Annual Dividend Income in Year ' + years, value: finalAnnualIncome.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Cumulative Dividends Collected', value: totalDivPaid.toFixed(2), prefix: '$' },
                    { label: 'Portfolio Value at Year ' + years, value: val.toFixed(2), prefix: '$' },
                    { label: 'Yield on Cost (YOC)', value: `${((finalAnnualIncome / (Number(inputs.portfolioValue) || 100000)) * 100).toFixed(2)}%` }
                ]
            };
        }
    },

    // 66. Dollar Cost Averaging Calculator
    {
        id: 'dollar-cost-averaging-calculator',
        name: 'Dollar Cost Averaging Calculator',
        category: 'finance-business',
        group: 'Savings & Investment',
        bucket: 'Bucket B',
        tier: 1,
        phase: 3,
        monthlySearches: '2K',
        cpc: '$2.49',
        description: "A Dollar Cost Averaging Calculator estimates investment growth when fixed amounts are invested periodically regardless of market price. It demonstrates average purchase cost reduction over time. The calculator helps investors model disciplined investing strategies.",
        inputs: [
            { id: 'monthlyInvestment', name: 'Monthly Periodic DCA Amount', type: 'currency', defaultValue: 500, min: 25, step: 25, prefix: '$', tooltip: 'Fixed sum invested each interval.' },
            { id: 'expectedAnnualReturn', name: 'Expected Annual Market Return', type: 'percentage', defaultValue: 8.5, min: 0, max: 25, step: 0.25, suffix: '%', tooltip: 'Average market growth.' },
            { id: 'investmentYears', name: 'DCA Duration (Years)', type: 'number', defaultValue: 10, min: 1, max: 40, step: 1, suffix: 'years', tooltip: 'Years of regular deposits.' }
        ],
        naturalLanguageQueries: ["Calculate my dollar cost averaging", "What is my dollar cost averaging?", "Help me work out dollar cost averaging"],
        edgeCases: ["Zero asset prices Missing price periods Fractional share handling"],
        calculate: (inputs) => {
            const pmt = Number(inputs.monthlyInvestment) || 500;
            const r = Number(inputs.expectedAnnualReturn) || 8.5;
            const t = Number(inputs.investmentYears) || 10;

            const fv = calculateCompoundFutureValue(0, pmt, r, t, 12);
            const totalInvested = pmt * t * 12;
            const profit = Math.max(0, fv - totalInvested);

            return {
                primaryOutput: { label: 'Projected DCA Portfolio Value', value: fv.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Invested Capital', value: totalInvested.toFixed(2), prefix: '$' },
                    { label: 'Total Capital Gains & Compounding', value: profit.toFixed(2), prefix: '$' },
                    { label: 'Total Number of Purchases', value: `${t * 12} Contributions` }
                ]
            };
        }
    },

    // 67. Portfolio Rebalancing Calculator
    {
        id: 'portfolio-rebalancing-calculator',
        name: 'Portfolio Rebalancing Calculator',
        category: 'finance-business',
        group: 'Savings & Investment',
        bucket: 'Bucket B',
        tier: 1,
        phase: 4,
        monthlySearches: '390',
        cpc: '$4.58',
        description: "A Portfolio Rebalancing Calculator determines how much of each asset to buy or sell to restore target allocation percentages. It helps investors maintain desired risk exposure. The calculator supports stocks, bonds, cash, and alternative assets.",
        inputs: [
            { id: 'stocksCurrentVal', name: 'Current Stocks Value', type: 'currency', defaultValue: 75000, min: 0, step: 1000, prefix: '$', tooltip: 'Current equity holdings.' },
            { id: 'bondsCurrentVal', name: 'Current Bonds Value', type: 'currency', defaultValue: 15000, min: 0, step: 1000, prefix: '$', tooltip: 'Current fixed income holdings.' },
            { id: 'cashCurrentVal', name: 'Current Cash Value', type: 'currency', defaultValue: 10000, min: 0, step: 1000, prefix: '$', tooltip: 'Current cash reserves.' },
            { id: 'targetStocksPct', name: 'Target Stocks Allocation', type: 'percentage', defaultValue: 70, min: 0, max: 100, step: 5, suffix: '%', tooltip: 'Target equity weight.' },
            { id: 'targetBondsPct', name: 'Target Bonds Allocation', type: 'percentage', defaultValue: 20, min: 0, max: 100, step: 5, suffix: '%', tooltip: 'Target bond weight.' },
            { id: 'targetCashPct', name: 'Target Cash Allocation', type: 'percentage', defaultValue: 10, min: 0, max: 100, step: 5, suffix: '%', tooltip: 'Target cash weight.' }
        ],
        naturalLanguageQueries: ["Calculate my portfolio rebalancing", "What is my portfolio rebalancing?", "Help me work out portfolio rebalancing"],
        edgeCases: ["Allocations not totaling 100% Negative holdings Tax consequences not modeled"],
        calculate: (inputs) => {
            const s = Number(inputs.stocksCurrentVal) || 75000;
            const b = Number(inputs.bondsCurrentVal) || 15000;
            const c = Number(inputs.cashCurrentVal) || 10000;
            const total = s + b + c;

            const tS_pct = (Number(inputs.targetStocksPct) || 70) / 100;
            const tB_pct = (Number(inputs.targetBondsPct) || 20) / 100;
            const tC_pct = (Number(inputs.targetCashPct) || 10) / 100;

            const targetS = total * tS_pct;
            const targetB = total * tB_pct;
            const targetC = total * tC_pct;

            const diffS = targetS - s;
            const diffB = targetB - b;
            const diffC = targetC - c;

            return {
                primaryOutput: { label: 'Stock Rebalance Adjustment', value: (diffS >= 0 ? `Buy $${diffS.toFixed(0)}` : `Sell $${Math.abs(diffS).toFixed(0)}`) },
                secondaryMetrics: [
                    { label: 'Bond Rebalance Adjustment', value: (diffB >= 0 ? `Buy $${diffB.toFixed(0)}` : `Sell $${Math.abs(diffB).toFixed(0)}`) },
                    { label: 'Cash Rebalance Adjustment', value: (diffC >= 0 ? `Hold $${diffC.toFixed(0)}` : `Withdraw $${Math.abs(diffC).toFixed(0)}`) },
                    { label: 'Total Portfolio Net Worth', value: total.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 68. Emergency Fund Calculator
    {
        id: 'emergency-fund-calculator',
        name: 'Emergency Fund Calculator',
        category: 'finance-business',
        group: 'Savings & Investment',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '50K',
        cpc: '$0.63',
        description: "An Emergency Fund Calculator estimates how much money a user should save to cover essential living expenses during emergencies such as job loss or medical issues. The calculator helps users build financial safety reserves.",
        inputs: [
            { id: 'monthlyEssentialExpenses', name: 'Monthly Essential Living Expenses', type: 'currency', defaultValue: 4200, min: 500, step: 100, prefix: '$', tooltip: 'Housing, food, utilities, health, minimum debt.' },
            { id: 'monthsCoverage', name: 'Coverage Goal (Months)', type: 'dropdown', defaultValue: 6, options: [{ label: '3 Months (Lean)', value: 3 }, { label: '6 Months (Standard)', value: 6 }, { label: '9 Months (Cautious)', value: 9 }, { label: '12 Months (Self-Employed / High Stability)', value: 12 }], tooltip: 'Number of months protection.' },
            { id: 'currentEmergencySavings', name: 'Current Emergency Savings', type: 'currency', defaultValue: 12000, min: 0, step: 500, prefix: '$', tooltip: 'Liquid cash in high-yield savings.' }
        ],
        naturalLanguageQueries: ["Calculate my emergency fund", "What is my emergency fund?", "Help me work out emergency fund"],
        edgeCases: ["Zero expenses Negative savings Unrealistically high expense inputs"],
        calculate: (inputs) => {
            const expenses = Number(inputs.monthlyEssentialExpenses) || 4200;
            const months = Number(inputs.monthsCoverage) || 6;
            const saved = Number(inputs.currentEmergencySavings) || 12000;

            const targetFund = expenses * months;
            const gap = Math.max(0, targetFund - saved);
            const pctFunded = (saved / (targetFund || 1)) * 100;

            return {
                primaryOutput: { label: 'Target Emergency Fund Goal', value: targetFund.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Savings Shortfall Remaining', value: gap.toFixed(2), prefix: '$' },
                    { label: 'Emergency Fund Progress', value: `${pctFunded.toFixed(1)}% Funded` },
                    { label: 'Current Runway with Existing Cash', value: `${(saved / (expenses || 1)).toFixed(1)} Months` }
                ]
            };
        }
    },

    // 69. Rule of 72 Calculator
    {
        id: 'rule-of-72-calculator',
        name: 'Rule of 72 Calculator',
        category: 'finance-business',
        group: 'Savings & Investment',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '5K',
        cpc: '$2.40',
        description: "A Rule of 72 Calculator estimates how long it takes for an investment to double based on a fixed annual return rate. It provides a quick approximation for compound growth. The calculator is commonly used for educational investment planning.",
        inputs: [
            { id: 'annualRatePct', name: 'Annual Rate of Return or Inflation', type: 'percentage', defaultValue: 7.2, min: 0.1, max: 72, step: 0.1, suffix: '%', tooltip: 'Compounding percentage rate.' }
        ],
        naturalLanguageQueries: ["Calculate my rule of 72", "What is my rule of 72?", "Help me work out rule of 72"],
        edgeCases: ["Zero or negative rates Very high return rates reducing accuracy Non-compounding scenarios"],
        calculate: (inputs) => {
            const r = Math.max(0.01, Number(inputs.annualRatePct) || 7.2);
            const approxYears = 72 / r;
            const exactYears = Math.log(2) / Math.log(1 + r / 100);

            return {
                primaryOutput: { label: 'Years to Double Capital (Rule of 72)', value: `${approxYears.toFixed(1)} Years` },
                secondaryMetrics: [
                    { label: 'Exact Mathematical Doubling Time', value: `${exactYears.toFixed(2)} Years` },
                    { label: 'Tripling Time (Rule of 114)', value: `${(114 / r).toFixed(1)} Years` },
                    { label: 'Quadrupling Time (Rule of 144)', value: `${(144 / r).toFixed(1)} Years` }
                ]
            };
        }
    },

    // 70. FIRE Calculator
    {
        id: 'fire-calculator',
        name: 'FIRE Calculator',
        category: 'finance-business',
        group: 'Savings & Investment',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '33K',
        cpc: '$2.16',
        description: "A FIRE Calculator estimates how much wealth a user needs to achieve financial independence and retire early. It models savings growth, expenses, and sustainable withdrawal rates. The calculator helps users project time required to reach FIRE goals.",
        inputs: [
            { id: 'currentAge', name: 'Current Age', type: 'number', defaultValue: 30, min: 18, max: 75, step: 1, suffix: 'yrs', tooltip: 'Your current age.' },
            { id: 'currentNetWorth', name: 'Current Invested Net Worth', type: 'currency', defaultValue: 120000, min: 0, step: 5000, prefix: '$', tooltip: 'Liquid investment assets.' },
            { id: 'annualExpenses', name: 'Target Annual Retirement Living Expenses', type: 'currency', defaultValue: 60000, min: 10000, step: 2500, prefix: '$', tooltip: 'Expected yearly lifestyle cost.' },
            { id: 'annualSavings', name: 'Annual Investment Savings', type: 'currency', defaultValue: 30000, min: 1000, step: 1000, prefix: '$', tooltip: 'New savings invested per year.' },
            { id: 'safeWithdrawalRatePct', name: 'Safe Withdrawal Rate (SWR)', type: 'percentage', defaultValue: 4.0, min: 2.5, max: 6.0, step: 0.25, suffix: '%', tooltip: 'Trinity study baseline is 4.0%.' },
            { id: 'investmentReturnRatePct', name: 'Expected Real Investment Return', type: 'percentage', defaultValue: 7.0, min: 1, max: 15, step: 0.25, suffix: '%', tooltip: 'Real return above inflation.' }
        ],
        naturalLanguageQueries: ["Calculate my fire", "What is my fire?", "Help me work out fire"],
        edgeCases: ["Negative savings rates Unrealistic withdrawal rates Negative investment returns"],
        calculate: (inputs) => {
            const age = Number(inputs.currentAge) || 30;
            let nw = Number(inputs.currentNetWorth) || 120000;
            const exp = Number(inputs.annualExpenses) || 60000;
            const save = Number(inputs.annualSavings) || 30000;
            const swr = (Number(inputs.safeWithdrawalRatePct) || 4.0) / 100;
            const r = (Number(inputs.investmentReturnRatePct) || 7.0) / 100;

            const fireNumber = exp / swr;
            let years = 0;
            while (nw < fireNumber && years < 60) {
                years++;
                nw = (nw + save) * (1 + r);
            }

            const fireAge = age + years;

            return {
                primaryOutput: { label: 'Target FIRE Number', value: fireNumber.toFixed(0), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Projected FIRE Age', value: `${fireAge} Years Old` },
                    { label: 'Years to Financial Independence', value: `${years} Years` },
                    { label: 'Annual Safe Income Stream', value: exp.toFixed(0), prefix: '$' }
                ]
            };
        }
    },

    // 71. Net Worth Calculator
    {
        id: 'net-worth-calculator',
        name: 'Net Worth Calculator',
        category: 'finance-business',
        group: 'Savings & Investment',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '33K',
        cpc: '$1.30',
        description: "A Net Worth Calculator measures total assets minus total liabilities to estimate personal financial health. It provides a snapshot of financial position. The calculator helps users track wealth accumulation over time.",
        inputs: [
            { id: 'cashAndEquivalents', name: 'Cash, Checking & High-Yield Savings', type: 'currency', defaultValue: 25000, min: 0, step: 1000, prefix: '$', tooltip: 'Liquid banking assets.' },
            { id: 'investmentsAndRetirement', name: 'Retirement & Brokerage Investments', type: 'currency', defaultValue: 180000, min: 0, step: 5000, prefix: '$', tooltip: '401k, IRA, stocks, crypto.' },
            { id: 'realEstateAndVehicles', name: 'Real Estate Equity & Vehicles Market Value', type: 'currency', defaultValue: 350000, min: 0, step: 5000, prefix: '$', tooltip: 'Physical property market value.' },
            { id: 'mortgagesOwed', name: 'Mortgage & Home Equity Debt', type: 'currency', defaultValue: 220000, min: 0, step: 5000, prefix: '$', tooltip: 'Mortgage balances.' },
            { id: 'consumerAndStudentDebt', name: 'Auto Loans, Student Loans & Credit Cards', type: 'currency', defaultValue: 25000, min: 0, step: 1000, prefix: '$', tooltip: 'Unsecured and consumer liabilities.' }
        ],
        naturalLanguageQueries: ["Calculate my net worth", "What is my net worth?", "Help me work out net worth"],
        edgeCases: ["Negative net worth Missing asset categories Duplicate entries"],
        calculate: (inputs) => {
            const cash = Number(inputs.cashAndEquivalents) || 25000;
            const inv = Number(inputs.investmentsAndRetirement) || 180000;
            const property = Number(inputs.realEstateAndVehicles) || 350000;
            const mortgage = Number(inputs.mortgagesOwed) || 220000;
            const consumer = Number(inputs.consumerAndStudentDebt) || 25000;

            const totalAssets = cash + inv + property;
            const totalLiabilities = mortgage + consumer;
            const netWorth = totalAssets - totalLiabilities;
            const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

            return {
                primaryOutput: { label: 'Total Net Worth', value: netWorth.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Cumulative Assets', value: totalAssets.toFixed(2), prefix: '$' },
                    { label: 'Total Liabilities & Debt', value: totalLiabilities.toFixed(2), prefix: '$' },
                    { label: 'Debt-to-Asset Ratio', value: `${debtToAssetRatio.toFixed(1)}%` }
                ]
            };
        }
    },

    // 72. Stock Average Calculator
    {
        id: 'stock-average-calculator',
        name: 'Stock Average Calculator',
        category: 'finance-business',
        group: 'Savings & Investment',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '74K',
        cpc: '$2.36',
        description: "A Stock Average Calculator computes the average purchase price of shares after multiple buy transactions. It helps investors understand their effective cost basis. The calculator is useful for averaging down or tracking portfolio costs.",
        inputs: [
            { id: 'firstBuyShares', name: '1st Purchase Shares Count', type: 'number', defaultValue: 50, min: 1, step: 1, tooltip: 'First batch shares.' },
            { id: 'firstBuyPrice', name: '1st Purchase Price per Share', type: 'currency', defaultValue: 120, min: 0.01, step: 1, prefix: '$', tooltip: 'Initial buy price.' },
            { id: 'secondBuyShares', name: '2nd Purchase Shares Count', type: 'number', defaultValue: 75, min: 0, step: 1, tooltip: 'Second batch shares.' },
            { id: 'secondBuyPrice', name: '2nd Purchase Price per Share', type: 'currency', defaultValue: 95, min: 0.01, step: 1, prefix: '$', tooltip: 'Second buy price (averaging down/up).' }
        ],
        naturalLanguageQueries: ["How old am I if I was born on March 15 1990?", "Calculate my age born 1985", "How many days old am I?"],
        edgeCases: ["Fractional shares Zero-share transactions Negative quantities from sells"],
        calculate: (inputs) => {
            const s1 = Number(inputs.firstBuyShares) || 50;
            const p1 = Number(inputs.firstBuyPrice) || 120;
            const s2 = Number(inputs.secondBuyShares) || 75;
            const p2 = Number(inputs.secondBuyPrice) || 95;

            const totalCost = (s1 * p1) + (s2 * p2);
            const totalShares = s1 + s2;
            const avgPrice = totalShares > 0 ? totalCost / totalShares : 0;

            return {
                primaryOutput: { label: 'New Weighted Average Share Price', value: avgPrice.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Aggregate Shares Owned', value: `${totalShares} Shares` },
                    { label: 'Total Invested Capital Outlay', value: totalCost.toFixed(2), prefix: '$' },
                    { label: 'First Batch Cost Basis', value: (s1 * p1).toFixed(2), prefix: '$' },
                    { label: 'Second Batch Cost Basis', value: (s2 * p2).toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 73. Income Tax Calculator
    {
        id: 'income-tax-calculator',
        name: 'Income Tax Calculator',
        category: 'finance-business',
        group: 'Tax & Income',
        bucket: 'Bucket A',
        tier: 1,
        phase: 1,
        monthlySearches: '550K',
        cpc: '$1.26',
        description: "An Income Tax Calculator estimates the total income tax owed based on taxable income, deductions, filing status, and applicable tax brackets. It helps individuals and businesses estimate annual tax liability. The calculator supports progressive tax systems commonly used in countries such as the United States, India, the UK, and Canada.",
        inputs: [
            { id: 'grossAnnualIncome', name: 'Gross Annual Income', type: 'currency', defaultValue: 95000, min: 5000, step: 2500, prefix: '$', tooltip: 'Total pre-tax earnings.' },
            { id: 'filingStatus', name: 'Tax Filing Status', type: 'dropdown', defaultValue: 'single', options: [{ label: 'Single', value: 'single' }, { label: 'Married Filing Jointly', value: 'married' }, { label: 'Head of Household', value: 'hoh' }], tooltip: 'IRS filing classification.' },
            { id: 'itemizedDeductions', name: 'Itemized Deductions (0 for Standard)', type: 'currency', defaultValue: 0, min: 0, step: 500, prefix: '$', tooltip: 'Mortgage interest, state taxes, charitable gifts.' }
        ],
        naturalLanguageQueries: ["How much income tax do I owe on $75,000 salary?", "Calculate my tax for income of 90000", "What is my effective tax rate at 80k?"],
        edgeCases: ["Negative taxable income Deductions exceeding income Tax credits creating zero liability Unsupported tax years International tax residency conflicts"],
        calculate: (inputs) => {
            const income = Number(inputs.grossAnnualIncome) || 95000;
            const status = String(inputs.filingStatus || 'single');
            const itemized = Number(inputs.itemizedDeductions) || 0;

            const stdDeductions: Record<string, number> = { single: 14600, married: 29200, hoh: 21900 };
            const deduction = Math.max(stdDeductions[status] || 14600, itemized);
            const taxableIncome = Math.max(0, income - deduction);

            // Progressive 2024 Federal Brackets for Single
            let fedTax = 0;
            if (status === 'married') {
                if (taxableIncome <= 23200) fedTax = taxableIncome * 0.10;
                else if (taxableIncome <= 94300) fedTax = 2320 + (taxableIncome - 23200) * 0.12;
                else if (taxableIncome <= 201050) fedTax = 10852 + (taxableIncome - 94300) * 0.22;
                else if (taxableIncome <= 383900) fedTax = 34337 + (taxableIncome - 201050) * 0.24;
                else fedTax = 78221 + (taxableIncome - 383900) * 0.32;
            } else {
                if (taxableIncome <= 11600) fedTax = taxableIncome * 0.10;
                else if (taxableIncome <= 47150) fedTax = 1160 + (taxableIncome - 11600) * 0.12;
                else if (taxableIncome <= 100525) fedTax = 5426 + (taxableIncome - 47150) * 0.22;
                else if (taxableIncome <= 191950) fedTax = 17168.5 + (taxableIncome - 100525) * 0.24;
                else fedTax = 39110.5 + (taxableIncome - 191950) * 0.32;
            }

            const ficaTax = (income * 0.062) + (income * 0.0145); // Social Security + Medicare
            const totalTax = fedTax + ficaTax;
            const effectiveRate = (totalTax / (income || 1)) * 100;
            const netIncome = income - totalTax;

            return {
                primaryOutput: { label: 'Estimated Total Federal Tax Owed', value: fedTax.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Effective Overall Tax Rate', value: `${effectiveRate.toFixed(1)}%` },
                    { label: 'FICA Payroll Taxes (SS + Medicare)', value: ficaTax.toFixed(2), prefix: '$' },
                    { label: 'Taxable Income (After Deductions)', value: taxableIncome.toFixed(2), prefix: '$' },
                    { label: 'Estimated Take-Home Pay', value: netIncome.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 74. Sales Tax Calculator
    {
        id: 'sales-tax-calculator',
        name: 'Sales Tax Calculator',
        category: 'finance-business',
        group: 'Tax & Income',
        bucket: 'Bucket A',
        tier: 1,
        phase: 1,
        monthlySearches: '110K',
        cpc: '$4.74',
        description: "A Sales Tax Calculator estimates sales tax added to a product or service purchase. It supports both tax-exclusive and tax-inclusive pricing systems. The calculator helps consumers and businesses determine total transaction costs.",
        inputs: [
            { id: 'amount', name: 'Purchase / Transaction Amount', type: 'currency', defaultValue: 250, min: 0.01, step: 10, prefix: '$', tooltip: 'Base price.' },
            { id: 'salesTaxRatePct', name: 'Sales Tax Rate', type: 'percentage', defaultValue: 7.25, min: 0, max: 25, step: 0.125, suffix: '%', tooltip: 'State plus local sales tax rate.' },
            { id: 'taxMode', name: 'Calculation Direction', type: 'dropdown', defaultValue: 'add', options: [{ label: 'Price Before Tax (Add Sales Tax)', value: 'add' }, { label: 'Price Includes Tax (Reverse Sales Tax)', value: 'reverse' }], tooltip: 'Add tax or extract tax.' }
        ],
        naturalLanguageQueries: ["How much income tax do I owe on $75,000 salary?", "Calculate my tax for income of 90000", "What is my effective tax rate at 80k?"],
        edgeCases: ["Zero tax rate Negative purchase amounts Tax-inclusive pricing precision errors"],
        calculate: (inputs) => {
            const amt = Number(inputs.amount) || 250;
            const rate = (Number(inputs.salesTaxRatePct) || 7.25) / 100;
            const mode = String(inputs.taxMode || 'add');

            let tax = 0;
            let total = 0;
            let base = 0;

            if (mode === 'add') {
                base = amt;
                tax = amt * rate;
                total = amt + tax;
            } else {
                total = amt;
                base = amt / (1 + rate);
                tax = total - base;
            }

            return {
                primaryOutput: { label: 'Total Sales Tax Charged', value: tax.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Final Total Amount (With Tax)', value: total.toFixed(2), prefix: '$' },
                    { label: 'Net Base Price (Pre-Tax)', value: base.toFixed(2), prefix: '$' },
                    { label: 'Effective Tax Rate', value: `${(rate * 100).toFixed(3)}%` }
                ]
            };
        }
    },

    // 75. Marriage Tax Calculator
    {
        id: 'marriage-tax-calculator',
        name: 'Marriage Tax Calculator',
        category: 'finance-business',
        group: 'Tax & Income',
        bucket: 'Bucket A',
        tier: 1,
        phase: 4,
        monthlySearches: '320',
        cpc: '$6.53  ★ HIGH CPC',
        description: "A Marriage Tax Calculator estimates tax impact after marriage compared to filing separately. It identifies marriage penalties or marriage bonuses. The calculator helps couples optimize tax planning.",
        inputs: [
            { id: 'spouse1Income', name: 'Spouse 1 Gross Annual Income', type: 'currency', defaultValue: 90000, min: 0, step: 2500, prefix: '$', tooltip: 'Earnings for first partner.' },
            { id: 'spouse2Income', name: 'Spouse 2 Gross Annual Income', type: 'currency', defaultValue: 85000, min: 0, step: 2500, prefix: '$', tooltip: 'Earnings for second partner.' }
        ],
        naturalLanguageQueries: ["How much income tax do I owe on $75,000 salary?", "Calculate my tax for income of 90000", "What is my effective tax rate at 80k?"],
        edgeCases: ["Large income disparities Negative taxable income Different state filing rules"],
        calculate: (inputs) => {
            const inc1 = Number(inputs.spouse1Income) || 90000;
            const inc2 = Number(inputs.spouse2Income) || 85000;
            const combined = inc1 + inc2;

            // Simplified federal tax calculation
            const taxSingle = (inc: number) => {
                const taxInc = Math.max(0, inc - 14600);
                if (taxInc <= 11600) return taxInc * 0.10;
                if (taxInc <= 47150) return 1160 + (taxInc - 11600) * 0.12;
                if (taxInc <= 100525) return 5426 + (taxInc - 47150) * 0.22;
                return 17168.5 + (taxInc - 100525) * 0.24;
            };

            const taxMarried = (inc: number) => {
                const taxInc = Math.max(0, inc - 29200);
                if (taxInc <= 23200) return taxInc * 0.10;
                if (taxInc <= 94300) return 2320 + (taxInc - 23200) * 0.12;
                if (taxInc <= 201050) return 10852 + (taxInc - 94300) * 0.22;
                return 34337 + (taxInc - 201050) * 0.24;
            };

            const singleTaxesTotal = taxSingle(inc1) + taxSingle(inc2);
            const marriedJointTax = taxMarried(combined);
            const diff = singleTaxesTotal - marriedJointTax; // positive = marriage bonus, negative = penalty

            return {
                primaryOutput: { label: diff >= 0 ? 'Marriage Tax Bonus (Savings)' : 'Marriage Tax Penalty', value: Math.abs(diff).toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Joint Filing Tax Liability', value: marriedJointTax.toFixed(2), prefix: '$' },
                    { label: 'Combined Single Filing Tax Liability', value: singleTaxesTotal.toFixed(2), prefix: '$' },
                    { label: 'Status Impact', value: diff >= 0 ? 'Filing Jointly Saves Money' : 'Filing Jointly Incurs Marriage Penalty' }
                ]
            };
        }
    },

    // 76. Estate Tax Calculator
    {
        id: 'estate-tax-calculator',
        name: 'Estate Tax Calculator',
        category: 'finance-business',
        group: 'Tax & Income',
        bucket: 'Bucket A',
        tier: 3,
        phase: 3,
        monthlySearches: '15K',
        cpc: '$1.59',
        description: "An Estate Tax Calculator estimates taxes owed on inherited estates above exemption thresholds. It supports federal and regional estate tax rules. The calculator helps with estate planning and inheritance forecasting.",
        inputs: [
            { id: 'totalEstateValue', name: 'Total Gross Estate Valuation', type: 'currency', defaultValue: 15000000, min: 100000, step: 500000, prefix: '$', tooltip: 'Real estate, investments, business assets, insurance.' },
            { id: 'exemptionAmount', name: 'Federal Lifetime Exemption', type: 'currency', defaultValue: 13610000, min: 5000000, step: 500000, prefix: '$', tooltip: '2024 individual exemption is $13.61M.' },
            { id: 'deductionsAndGifts', name: 'Charitable / Marital Deductions', type: 'currency', defaultValue: 500000, min: 0, step: 100000, prefix: '$', tooltip: 'Transfers to spouse or 501(c)(3) charities.' }
        ],
        naturalLanguageQueries: ["How much income tax do I owe on $75,000 salary?", "Calculate my tax for income of 90000", "What is my effective tax rate at 80k?"],
        edgeCases: ["Estate below exemption threshold State inheritance tax overlap Trust structures not modeled"],
        calculate: (inputs) => {
            const estate = Number(inputs.totalEstateValue) || 15000000;
            const exemption = Number(inputs.exemptionAmount) || 13610000;
            const deductions = Number(inputs.deductionsAndGifts) || 500000;

            const netEstate = Math.max(0, estate - deductions);
            const taxableEstate = Math.max(0, netEstate - exemption);
            const estateTax = taxableEstate * 0.40; // Top federal rate is 40%

            return {
                primaryOutput: { label: 'Estimated Federal Estate Tax Owed', value: estateTax.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Taxable Portion Above Exemption', value: taxableEstate.toFixed(2), prefix: '$' },
                    { label: 'Net Estate Passing to Beneficiaries', value: (estate - estateTax).toFixed(2), prefix: '$' },
                    { label: 'Effective Estate Tax Rate', value: `${((estateTax / (estate || 1)) * 100).toFixed(2)}%` }
                ]
            };
        }
    },

    // 77. Take-Home-Paycheck Calculator
    {
        id: 'take-home-paycheck-calculator',
        name: 'Take-Home-Paycheck Calculator',
        category: 'finance-business',
        group: 'Tax & Income',
        bucket: 'Bucket A',
        tier: 1,
        phase: 3,
        monthlySearches: '1K',
        cpc: '$3.55',
        description: "A Take-Home Paycheck Calculator estimates net income after taxes and payroll deductions. It helps employees understand actual take-home earnings. The calculator includes federal, state, Social Security, Medicare, and benefit deductions.",
        inputs: [
            { id: 'grossSalaryAnnual', name: 'Gross Annual Base Salary', type: 'currency', defaultValue: 85000, min: 5000, step: 2500, prefix: '$', tooltip: 'Pre-tax yearly salary.' },
            { id: 'payFrequency', name: 'Paycheck Frequency', type: 'dropdown', defaultValue: 'biweekly', options: [{ label: 'Bi-Weekly (26 Paychecks)', value: 'biweekly' }, { label: 'Semi-Monthly (24 Paychecks)', value: 'semimonthly' }, { label: 'Monthly (12 Paychecks)', value: 'monthly' }, { label: 'Weekly (52 Paychecks)', value: 'weekly' }], tooltip: 'Pay schedule.' },
            { id: 'stateTaxRatePct', name: 'State Income Tax Rate', type: 'percentage', defaultValue: 4.5, min: 0, max: 13.3, step: 0.25, suffix: '%', tooltip: 'Estimated state tax.' },
            { id: 'preTaxDeductionsMonthly', name: 'Pre-Tax Benefits / 401(k) per Month', type: 'currency', defaultValue: 500, min: 0, step: 50, prefix: '$', tooltip: '401k, health, dental, HSA.' }
        ],
        naturalLanguageQueries: ["Calculate my take-home-paycheck", "What is my take-home-paycheck?", "Help me work out take-home-paycheck"],
        edgeCases: ["High-income Social Security cap Zero state tax states Bonus paycheck taxation"],
        calculate: (inputs) => {
            const gross = Number(inputs.grossSalaryAnnual) || 85000;
            const freq = String(inputs.payFrequency || 'biweekly');
            const stateRate = (Number(inputs.stateTaxRatePct) || 4.5) / 100;
            const preTaxAnnual = (Number(inputs.preTaxDeductionsMonthly) || 500) * 12;

            const periods: Record<string, number> = { biweekly: 26, semimonthly: 24, monthly: 12, weekly: 52 };
            const n = periods[freq] || 26;

            const fedRate = 0.12; // blended effective federal rate approx
            const ficaRate = 0.0765;

            const fedTax = gross * fedRate;
            const stateTax = gross * stateRate;
            const ficaTax = gross * ficaRate;
            const netAnnual = gross - fedTax - stateTax - ficaTax - preTaxAnnual;
            const netPerPaycheck = netAnnual / n;

            return {
                primaryOutput: { label: 'Take-Home Pay per Paycheck', value: netPerPaycheck.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Annual Net Take-Home Pay', value: netAnnual.toFixed(2), prefix: '$' },
                    { label: 'Federal Income Tax (Annual)', value: fedTax.toFixed(2), prefix: '$' },
                    { label: 'FICA Social Security & Medicare', value: ficaTax.toFixed(2), prefix: '$' },
                    { label: 'State Income Tax (Annual)', value: stateTax.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 78. Salary Calculator
    {
        id: 'salary-calculator',
        name: 'Salary Calculator',
        category: 'finance-business',
        group: 'Tax & Income',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '823K',
        cpc: '$1.86',
        description: "A Salary Calculator converts income across hourly, weekly, monthly, and annual pay structures. It helps users compare compensation formats. The calculator supports overtime and work schedule assumptions.",
        inputs: [
            { id: 'salaryAmount', name: 'Salary Compensation Amount', type: 'currency', defaultValue: 75000, min: 100, step: 2500, prefix: '$', tooltip: 'Base compensation.' },
            { id: 'salaryType', name: 'Frequency of Input', type: 'dropdown', defaultValue: 'annual', options: [{ label: 'Per Year', value: 'annual' }, { label: 'Per Month', value: 'month' }, { label: 'Per Hour', value: 'hour' }], tooltip: 'Time basis.' },
            { id: 'hoursPerWeek', name: 'Standard Weekly Hours', type: 'number', defaultValue: 40, min: 1, max: 80, step: 1, suffix: 'hrs', tooltip: 'Working hours.' }
        ],
        naturalLanguageQueries: ["Calculate my salary", "What is my salary?", "Help me work out salary"],
        edgeCases: ["Zero work hours Fractional schedules Overtime above legal limits"],
        calculate: (inputs) => {
            const amt = Number(inputs.salaryAmount) || 75000;
            const type = String(inputs.salaryType || 'annual');
            const hours = Math.max(1, Number(inputs.hoursPerWeek) || 40);

            let annual = amt;
            if (type === 'month') annual = amt * 12;
            else if (type === 'hour') annual = amt * hours * 52;

            const hourly = annual / (hours * 52);
            const monthly = annual / 12;
            const biweekly = annual / 26;
            const weekly = annual / 52;

            return {
                primaryOutput: { label: 'Equivalent Annual Gross Salary', value: annual.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Hourly Wage Equivalent', value: hourly.toFixed(2), prefix: '$', suffix: '/ hr' },
                    { label: 'Monthly Gross Pay', value: monthly.toFixed(2), prefix: '$' },
                    { label: 'Bi-Weekly Gross Pay', value: biweekly.toFixed(2), prefix: '$' },
                    { label: 'Weekly Gross Pay', value: weekly.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 79. Commission Calculator
    {
        id: 'commission-calculator',
        name: 'Commission Calculator',
        category: 'finance-business',
        group: 'Tax & Income',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '10K',
        cpc: '$13.44  ★ HIGH CPC',
        description: "A Commission Calculator estimates earnings based on sales volume and commission structures. It supports flat-rate, tiered, and percentage commissions. The calculator helps sales professionals forecast earnings.",
        inputs: [
            { id: 'totalSalesRevenue', name: 'Total Sales Revenue Generated', type: 'currency', defaultValue: 120000, min: 0, step: 5000, prefix: '$', tooltip: 'Gross sales volume.' },
            { id: 'commissionRatePct', name: 'Commission Percentage Rate', type: 'percentage', defaultValue: 6.0, min: 0.1, max: 50, step: 0.25, suffix: '%', tooltip: 'Sales commission percentage.' },
            { id: 'baseSalaryMonthly', name: 'Base Monthly Salary (Draw/Base)', type: 'currency', defaultValue: 3000, min: 0, step: 250, prefix: '$', tooltip: 'Guaranteed base pay.' }
        ],
        naturalLanguageQueries: ["Calculate my commission", "What is my commission?", "Help me work out commission"],
        edgeCases: ["Negative sales adjustments Tier thresholds overlap Zero commission rates"],
        calculate: (inputs) => {
            const sales = Number(inputs.totalSalesRevenue) || 120000;
            const rate = (Number(inputs.commissionRatePct) || 6.0) / 100;
            const base = Number(inputs.baseSalaryMonthly) || 3000;

            const commissionEarned = sales * rate;
            const totalCompensation = base + commissionEarned;

            return {
                primaryOutput: { label: 'Total Sales Commission Earned', value: commissionEarned.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Earnings (Base + Commission)', value: totalCompensation.toFixed(2), prefix: '$' },
                    { label: 'Guaranteed Base Salary', value: base.toFixed(2), prefix: '$' },
                    { label: 'Commission Share of Income', value: `${((commissionEarned / (totalCompensation || 1)) * 100).toFixed(1)}%` }
                ]
            };
        }
    },

    // 80. Social Security Calculator
    {
        id: 'social-security-calculator',
        name: 'Social Security Calculator',
        category: 'finance-business',
        group: 'Tax & Income',
        bucket: 'Bucket A',
        tier: 2,
        phase: 2,
        monthlySearches: '60K',
        cpc: '$0.40',
        description: "A Social Security Calculator estimates retirement benefits based on earnings history and retirement age. It models reductions and increases for early or delayed retirement. The calculator helps users estimate future government retirement income.",
        inputs: [
            { id: 'averageAnnualEarnings', name: 'Average Indexed Annual Earnings', type: 'currency', defaultValue: 80000, min: 10000, step: 5000, prefix: '$', tooltip: 'Top 35 earning years average.' },
            { id: 'claimAge', name: 'Planned Claiming Age', type: 'dropdown', defaultValue: 67, options: [{ label: '62 (Early - 30% Reduction)', value: 62 }, { label: '67 (Full Retirement Age - 100%)', value: 67 }, { label: '70 (Delayed - 124% Max)', value: 70 }], tooltip: 'Age when benefits start.' }
        ],
        naturalLanguageQueries: ["Calculate my social security", "What is my social security?", "Help me work out social security"],
        edgeCases: ["Retirement before eligibility age Missing earnings history Maximum benefit caps"],
        calculate: (inputs) => {
            const aime = (Number(inputs.averageAnnualEarnings) || 80000) / 12;
            const age = Number(inputs.claimAge) || 67;

            // SSA 2024 Bend Points approximation: 90% up to $1,174, 32% to $7,078, 15% above
            let pia = 0;
            if (aime <= 1174) pia = aime * 0.90;
            else if (aime <= 7078) pia = (1174 * 0.90) + (aime - 1174) * 0.32;
            else pia = (1174 * 0.90) + ((7078 - 1174) * 0.32) + (aime - 7078) * 0.15;

            let adjustment = 1.0;
            if (age === 62) adjustment = 0.70;
            else if (age === 70) adjustment = 1.24;

            const monthlyBenefit = pia * adjustment;
            const annualBenefit = monthlyBenefit * 12;

            return {
                primaryOutput: { label: 'Estimated Monthly Social Security Benefit', value: monthlyBenefit.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Annual Benefit at Age ' + age, value: annualBenefit.toFixed(2), prefix: '$' },
                    { label: 'Full Retirement Age (FRA) Primary Insurance Amount (PIA)', value: pia.toFixed(2), prefix: '$' },
                    { label: 'Adjustment Factor', value: `${(adjustment * 100).toFixed(0)}% of FRA Benefit` }
                ]
            };
        }
    },

    // 81. Capital Gains Tax Calculator
    {
        id: 'capital-gains-tax-calculator',
        name: 'Capital Gains Tax Calculator',
        category: 'finance-business',
        group: 'Tax & Income',
        bucket: 'Bucket A',
        tier: 2,
        phase: 2,
        monthlySearches: '60K',
        cpc: '$3.85',
        description: "A Capital Gains Tax Calculator estimates taxes owed on profits from asset sales such as stocks, property, or investments. It distinguishes short-term and long-term capital gains. The calculator supports federal and regional tax rules.",
        inputs: [
            { id: 'purchaseCost', name: 'Asset Cost Basis (Purchase Price)', type: 'currency', defaultValue: 20000, min: 0, step: 1000, prefix: '$', tooltip: 'Initial purchase cost.' },
            { id: 'saleProceeds', name: 'Selling Price (Gross Proceeds)', type: 'currency', defaultValue: 55000, min: 0, step: 1000, prefix: '$', tooltip: 'Sale price.' },
            { id: 'holdingPeriod', name: 'Holding Duration', type: 'dropdown', defaultValue: 'long', options: [{ label: 'Long Term (> 1 Year - 0%/15%/20%)', value: 'long' }, { label: 'Short Term (<= 1 Year - Ordinary Income)', value: 'short' }], tooltip: 'Tax bracket classification.' },
            { id: 'taxableIncomeTier', name: 'Overall Household Taxable Income Tier', type: 'dropdown', defaultValue: 'mid', options: [{ label: 'Low (< $47,025 - 0% LTCG)', value: 'low' }, { label: 'Middle ($47,025 to $518,900 - 15% LTCG)', value: 'mid' }, { label: 'High (> $518,900 - 20% LTCG)', value: 'high' }], tooltip: 'Income level.' }
        ],
        naturalLanguageQueries: ["How much income tax do I owe on $75,000 salary?", "Calculate my tax for income of 90000", "What is my effective tax rate at 80k?"],
        edgeCases: ["Capital losses Multiple tax jurisdictions Inflation adjustments not modeled"],
        calculate: (inputs) => {
            const cost = Number(inputs.purchaseCost) || 20000;
            const proceeds = Number(inputs.saleProceeds) || 55000;
            const isLong = inputs.holdingPeriod === 'long';
            const tier = String(inputs.taxableIncomeTier || 'mid');

            const gain = Math.max(0, proceeds - cost);
            let taxRate = 0.15;
            if (isLong) {
                if (tier === 'low') taxRate = 0.0;
                else if (tier === 'high') taxRate = 0.20;
                else taxRate = 0.15;
            } else {
                taxRate = tier === 'low' ? 0.12 : tier === 'high' ? 0.35 : 0.24;
            }

            const taxOwed = gain * taxRate;
            const netProceeds = proceeds - taxOwed;

            return {
                primaryOutput: { label: 'Estimated Capital Gains Tax Owed', value: taxOwed.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Net Profit After Taxes', value: (gain - taxOwed).toFixed(2), prefix: '$' },
                    { label: 'Gross Capital Gain', value: gain.toFixed(2), prefix: '$' },
                    { label: 'Applicable Tax Rate', value: `${(taxRate * 100).toFixed(1)}%` }
                ]
            };
        }
    },

    // 82. Self Employment Tax Calculator
    {
        id: 'self-employment-tax-calculator',
        name: 'Self Employment Tax Calculator',
        category: 'finance-business',
        group: 'Tax & Income',
        bucket: 'Bucket A',
        tier: 3,
        phase: 2,
        monthlySearches: '12K',
        cpc: '$4.43',
        description: "A Self Employment Tax Calculator estimates Social Security and Medicare taxes owed by self-employed individuals. It supports sole proprietors and freelancers. The calculator helps independent workers plan tax obligations.",
        inputs: [
            { id: 'netBusinessProfit', name: 'Net Self-Employment Business Profit', type: 'currency', defaultValue: 90000, min: 1000, step: 2500, prefix: '$', tooltip: 'Gross 1099 revenue minus expenses (Schedule C).' }
        ],
        naturalLanguageQueries: ["How much income tax do I owe on $75,000 salary?", "Calculate my tax for income of 90000", "What is my effective tax rate at 80k?"],
        edgeCases: ["Income below SE thresholds Wage base caps exceeded Multiple income sources"],
        calculate: (inputs) => {
            const profit = Number(inputs.netBusinessProfit) || 90000;
            // IRS Schedule SE: 92.35% of net profit is subject to SE tax
            const subjectToSeTax = profit * 0.9235;

            // 15.3% = 12.4% Social Security (capped at $168,600 in 2024) + 2.9% Medicare (uncapped)
            const ssCap = 168600;
            const ssTax = Math.min(subjectToSeTax, ssCap) * 0.124;
            const medicareTax = subjectToSeTax * 0.029;
            const totalSeTax = ssTax + medicareTax;
            const halfSeDeduction = totalSeTax / 2; // Above-the-line deduction on Form 1040

            return {
                primaryOutput: { label: 'Total Self-Employment Tax (15.3%)', value: totalSeTax.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Social Security Portion (12.4%)', value: ssTax.toFixed(2), prefix: '$' },
                    { label: 'Medicare Portion (2.9%)', value: medicareTax.toFixed(2), prefix: '$' },
                    { label: '50% Above-the-Line Tax Deduction', value: halfSeDeduction.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 83. Withholding Tax Calculator
    {
        id: 'withholding-tax-calculator',
        name: 'Withholding Tax Calculator',
        category: 'finance-business',
        group: 'Tax & Income',
        bucket: 'Bucket A',
        tier: 2,
        phase: 2,
        monthlySearches: '50K',
        cpc: '$5.06  ★ HIGH CPC',
        description: "A Withholding Tax Calculator estimates taxes withheld from wages or payments before income is received. It helps employers and employees manage tax withholding accuracy. The calculator supports payroll withholding systems.",
        inputs: [
            { id: 'grossPaycheck', name: 'Gross Pay per Period', type: 'currency', defaultValue: 3500, min: 200, step: 100, prefix: '$', tooltip: 'Gross earnings per check.' },
            { id: 'paySchedule', name: 'Pay Period Schedule', type: 'dropdown', defaultValue: 26, options: [{ label: 'Bi-Weekly (26x/year)', value: 26 }, { label: 'Monthly (12x/year)', value: 12 }, { label: 'Semi-Monthly (24x/year)', value: 24 }, { label: 'Weekly (52x/year)', value: 52 }], tooltip: 'Pay frequency.' },
            { id: 'extraWithholding', name: 'Extra Voluntary Withholding (W-4 Line 4c)', type: 'currency', defaultValue: 50, min: 0, step: 10, prefix: '$', tooltip: 'Additional dollar amount.' }
        ],
        naturalLanguageQueries: ["How much income tax do I owe on $75,000 salary?", "Calculate my tax for income of 90000", "What is my effective tax rate at 80k?"],
        edgeCases: ["Under-withholding Large bonuses Multiple jobs"],
        calculate: (inputs) => {
            const gross = Number(inputs.grossPaycheck) || 3500;
            const periods = Number(inputs.paySchedule) || 26;
            const extra = Number(inputs.extraWithholding) || 50;

            const annualGross = gross * periods;
            const fedTaxAnnual = annualGross * 0.13; // estimated baseline withholding
            const fedTaxPerPeriod = (fedTaxAnnual / periods) + extra;
            const ficaPerPeriod = gross * 0.0765;
            const totalWithheld = fedTaxPerPeriod + ficaPerPeriod;

            return {
                primaryOutput: { label: 'Total Taxes Withheld per Paycheck', value: totalWithheld.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Federal Income Tax Withholding', value: fedTaxPerPeriod.toFixed(2), prefix: '$' },
                    { label: 'FICA (Social Security & Medicare)', value: ficaPerPeriod.toFixed(2), prefix: '$' },
                    { label: 'Net Take-Home per Check', value: (gross - totalWithheld).toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 84. Dividend Tax Calculator
    {
        id: 'dividend-tax-calculator',
        name: 'Dividend Tax Calculator',
        category: 'finance-business',
        group: 'Tax & Income',
        bucket: 'Bucket A',
        tier: 3,
        phase: 3,
        monthlySearches: '8K',
        cpc: '$2.01',
        description: "A Dividend Tax Calculator estimates taxes owed on dividend income from investments. It distinguishes qualified and non-qualified dividends. The calculator helps investors estimate after-tax dividend income.",
        inputs: [
            { id: 'annualDividendIncome', name: 'Annual Dividend Income', type: 'currency', defaultValue: 12000, min: 100, step: 500, prefix: '$', tooltip: 'Total dividend receipts.' },
            { id: 'dividendType', name: 'Dividend Classification', type: 'dropdown', defaultValue: 'qualified', options: [{ label: 'Qualified Dividends (0% / 15% / 20%)', value: 'qualified' }, { label: 'Ordinary / Non-Qualified (Income Tax Rates)', value: 'ordinary' }], tooltip: 'Holding period requirement.' },
            { id: 'marginalTaxRate', name: 'Marginal Federal Tax Rate', type: 'percentage', defaultValue: 24, min: 10, max: 37, step: 1, suffix: '%', tooltip: 'Your top federal bracket.' }
        ],
        naturalLanguageQueries: ["How much income tax do I owe on $75,000 salary?", "Calculate my tax for income of 90000", "What is my effective tax rate at 80k?"],
        edgeCases: ["Zero dividend tax brackets Foreign withholding taxes Mixed dividend classifications"],
        calculate: (inputs) => {
            const div = Number(inputs.annualDividendIncome) || 12000;
            const isQualified = inputs.dividendType === 'qualified';
            const marginal = Number(inputs.marginalTaxRate) || 24;

            const rate = isQualified ? 0.15 : marginal / 100;
            const tax = div * rate;
            const net = div - tax;

            return {
                primaryOutput: { label: 'Tax Liability on Dividends', value: tax.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Net After-Tax Dividend Income', value: net.toFixed(2), prefix: '$' },
                    { label: 'Effective Dividend Tax Rate', value: `${(rate * 100).toFixed(1)}%` }
                ]
            };
        }
    },

    // 85. Property Tax Calculator
    {
        id: 'property-tax-calculator',
        name: 'Property Tax Calculator',
        category: 'finance-business',
        group: 'Tax & Income',
        bucket: 'Bucket A',
        tier: 2,
        phase: 2,
        monthlySearches: '22K',
        cpc: '$5.14  ★ HIGH CPC',
        description: "A Property Tax Calculator estimates annual property taxes based on assessed property value and local tax rates. It helps homeowners estimate ownership costs. The calculator supports regional tax adjustments and exemptions.",
        inputs: [
            { id: 'assessedHomeValue', name: 'Assessed Property Value', type: 'currency', defaultValue: 380000, min: 10000, step: 5000, prefix: '$', tooltip: 'County assessed valuation.' },
            { id: 'propertyTaxRatePct', name: 'Property Tax Rate', type: 'percentage', defaultValue: 1.25, min: 0.1, max: 5.0, step: 0.05, suffix: '%', tooltip: 'Local county/municipal millage rate.' },
            { id: 'homesteadExemption', name: 'Homestead / Senior Exemption', type: 'currency', defaultValue: 25000, min: 0, step: 5000, prefix: '$', tooltip: 'Value reduction for primary residence.' }
        ],
        naturalLanguageQueries: ["How much income tax do I owe on $75,000 salary?", "Calculate my tax for income of 90000", "What is my effective tax rate at 80k?"],
        edgeCases: ["Exemptions exceeding property value Negative assessments Regional assessment caps"],
        calculate: (inputs) => {
            const val = Number(inputs.assessedHomeValue) || 380000;
            const rate = (Number(inputs.propertyTaxRatePct) || 1.25) / 100;
            const exemption = Number(inputs.homesteadExemption) || 25000;

            const taxableVal = Math.max(0, val - exemption);
            const annualTax = taxableVal * rate;
            const monthlyTax = annualTax / 12;

            return {
                primaryOutput: { label: 'Annual Property Tax Bill', value: annualTax.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Monthly Escrow Property Tax Portion', value: monthlyTax.toFixed(2), prefix: '$' },
                    { label: 'Taxable Assessed Value', value: taxableVal.toFixed(2), prefix: '$' },
                    { label: 'Annual Exemption Savings', value: (exemption * rate).toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 86. Freelancer Tax Calculator
    {
        id: 'freelancer-tax-calculator',
        name: 'Freelancer Tax Calculator',
        category: 'finance-business',
        group: 'Tax & Income',
        bucket: 'Bucket A',
        tier: 1,
        phase: 4,
        monthlySearches: '170',
        cpc: '$4.57',
        description: "A Freelancer Tax Calculator estimates total taxes owed by freelancers and independent contractors. It combines income tax and self-employment tax estimates. The calculator helps freelancers avoid underpayment penalties.",
        inputs: [
            { id: 'gross1099Income', name: 'Gross 1099 Freelance Revenue', type: 'currency', defaultValue: 95000, min: 5000, step: 2500, prefix: '$', tooltip: 'Total client invoices paid.' },
            { id: 'businessExpenses', name: 'Tax-Deductible Business Expenses', type: 'currency', defaultValue: 15000, min: 0, step: 1000, prefix: '$', tooltip: 'Software, equipment, home office, travel.' },
            { id: 'estimatedIncomeTaxRate', name: 'Estimated Income Tax Rate (Fed+State)', type: 'percentage', defaultValue: 15, min: 0, max: 40, step: 1, suffix: '%', tooltip: 'Combined state and federal income bracket.' }
        ],
        naturalLanguageQueries: ["How much income tax do I owe on $75,000 salary?", "Calculate my tax for income of 90000", "What is my effective tax rate at 80k?"],
        edgeCases: ["Negative net business income Multiple freelance sources International contractor taxation"],
        calculate: (inputs) => {
            const gross = Number(inputs.gross1099Income) || 95000;
            const exp = Number(inputs.businessExpenses) || 15000;
            const incRate = (Number(inputs.estimatedIncomeTaxRate) || 15) / 100;

            const netProfit = Math.max(0, gross - exp);
            const seTax = (netProfit * 0.9235) * 0.153;
            const incomeTax = netProfit * incRate;
            const totalTax = seTax + incomeTax;
            const quarterlyEstimated = totalTax / 4;

            return {
                primaryOutput: { label: 'Total Annual Freelance Tax Liability', value: totalTax.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Quarterly Estimated Tax Payment (IRS 1040-ES)', value: quarterlyEstimated.toFixed(2), prefix: '$' },
                    { label: 'Self-Employment Tax (SECA 15.3%)', value: seTax.toFixed(2), prefix: '$' },
                    { label: 'Net Take-Home Profit After Taxes', value: (netProfit - totalTax).toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 87. Effective Tax Rate Calculator
    {
        id: 'effective-tax-rate-calculator',
        name: 'Effective Tax Rate Calculator',
        category: 'finance-business',
        group: 'Tax & Income',
        bucket: 'Bucket A',
        tier: 3,
        phase: 3,
        monthlySearches: '8K',
        cpc: '$2.61',
        description: "An Effective Tax Rate Calculator measures the percentage of total income paid in taxes. It helps compare actual tax burden against marginal tax rates. The calculator is commonly used in financial planning.",
        inputs: [
            { id: 'totalGrossIncome', name: 'Total Gross Income', type: 'currency', defaultValue: 110000, min: 1000, step: 2500, prefix: '$', tooltip: 'Total yearly earnings.' },
            { id: 'totalTaxesPaid', name: 'Total All Taxes Paid (Fed, State, FICA)', type: 'currency', defaultValue: 26400, min: 0, step: 500, prefix: '$', tooltip: 'Sum of all income and payroll taxes.' }
        ],
        naturalLanguageQueries: ["How much income tax do I owe on $75,000 salary?", "Calculate my tax for income of 90000", "What is my effective tax rate at 80k?"],
        edgeCases: ["Zero income Negative taxes from refunds Large refundable credits"],
        calculate: (inputs) => {
            const income = Math.max(1, Number(inputs.totalGrossIncome) || 110000);
            const taxes = Number(inputs.totalTaxesPaid) || 26400;

            const effectiveRate = (taxes / income) * 100;
            const netIncome = income - taxes;

            return {
                primaryOutput: { label: 'Effective Overall Tax Rate', value: `${effectiveRate.toFixed(2)}%` },
                secondaryMetrics: [
                    { label: 'Net Take-Home Income', value: netIncome.toFixed(2), prefix: '$' },
                    { label: 'Total Taxes Remitted', value: taxes.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 88. Budget Calculator
    {
        id: 'budget-calculator',
        name: 'Budget Calculator',
        category: 'finance-business',
        group: 'Budgeting & Everyday Money',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '33K',
        cpc: '$3.66',
        description: "A Budget Calculator helps users track income, expenses, savings, and spending categories to create a balanced financial plan. It supports personal, household, and business budgeting. The calculator helps users identify spending patterns, savings opportunities, and cash flow gaps.",
        inputs: [
            { id: 'monthlyNetIncome', name: 'Monthly After-Tax Take-Home Income', type: 'currency', defaultValue: 5500, min: 500, step: 250, prefix: '$', tooltip: 'Net monthly earnings.' },
            { id: 'housingUtilities', name: 'Monthly Housing & Utilities', type: 'currency', defaultValue: 1800, min: 0, step: 50, prefix: '$', tooltip: 'Rent/mortgage, electric, water, internet.' },
            { id: 'foodTransportHealth', name: 'Food, Transportation & Healthcare', type: 'currency', defaultValue: 1100, min: 0, step: 50, prefix: '$', tooltip: 'Groceries, car fuel/transit, health needs.' },
            { id: 'discretionaryWants', name: 'Discretionary Wants (Dining, Entertainment)', type: 'currency', defaultValue: 1000, min: 0, step: 50, prefix: '$', tooltip: 'Subscriptions, dining out, hobbies.' },
            { id: 'savingsDebtPayment', name: 'Savings & Debt Paydown', type: 'currency', defaultValue: 1200, min: 0, step: 50, prefix: '$', tooltip: 'Investments, emergency fund, extra debt paydown.' }
        ],
        naturalLanguageQueries: ["Calculate my budget", "What is my budget?", "Help me work out budget"],
        edgeCases: ["Expenses exceeding income Negative savings goals Missing expense categories Irregular income streams"],
        calculate: (inputs) => {
            const income = Math.max(1, Number(inputs.monthlyNetIncome) || 5500);
            const needs = (Number(inputs.housingUtilities) || 1800) + (Number(inputs.foodTransportHealth) || 1100);
            const wants = Number(inputs.discretionaryWants) || 1000;
            const savings = Number(inputs.savingsDebtPayment) || 1200;

            const totalSpent = needs + wants + savings;
            const unallocated = income - totalSpent;

            const needsPct = (needs / income) * 100;
            const wantsPct = (wants / income) * 100;
            const savingsPct = (savings / income) * 100;

            return {
                primaryOutput: { label: '50/30/20 Budgeting Alignment', value: `${needsPct.toFixed(0)}% Needs / ${wantsPct.toFixed(0)}% Wants / ${savingsPct.toFixed(0)}% Savings` },
                secondaryMetrics: [
                    { label: 'Total Needs (Target: 50%)', value: needs.toFixed(2), prefix: '$' },
                    { label: 'Total Wants (Target: 30%)', value: wants.toFixed(2), prefix: '$' },
                    { label: 'Total Savings / Debt (Target: 20%)', value: savings.toFixed(2), prefix: '$' },
                    { label: 'Unallocated Cash Margin', value: unallocated.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 89. Payment Calculator
    {
        id: 'payment-calculator',
        name: 'Payment Calculator',
        category: 'finance-business',
        group: 'Budgeting & Everyday Money',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '550K',
        cpc: '$1.26',
        description: "A Payment Calculator estimates periodic payments required to repay a loan or finance agreement. It supports mortgages, installment loans, leases, and other financing structures. The calculator helps users understand payment obligations over time.",
        inputs: [
            { id: 'loanPrincipal', name: 'Principal Loan Amount', type: 'currency', defaultValue: 30000, min: 100, step: 500, prefix: '$', tooltip: 'Borrowed sum.' },
            { id: 'interestRateApr', name: 'Annual Interest Rate (APR)', type: 'percentage', defaultValue: 7.5, min: 0, max: 35, step: 0.25, suffix: '%', tooltip: 'Interest rate.' },
            { id: 'termMonths', name: 'Loan Duration (Months)', type: 'number', defaultValue: 60, min: 1, max: 360, step: 1, suffix: 'months', tooltip: 'Repayment period.' }
        ],
        naturalLanguageQueries: ["Calculate my payment", "What is my payment?", "Help me work out payment"],
        edgeCases: ["Zero interest loans Very short repayment periods Negative principal values"],
        calculate: (inputs) => {
            const p = Number(inputs.loanPrincipal) || 30000;
            const apr = Number(inputs.interestRateApr) || 7.5;
            const months = Math.max(1, Number(inputs.termMonths) || 60);

            const monthly = calculatePmt(p, apr, months);
            const total = monthly * months;
            const interest = Math.max(0, total - p);

            return {
                primaryOutput: { label: 'Fixed Monthly Payment', value: monthly.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Interest Payable', value: interest.toFixed(2), prefix: '$' },
                    { label: 'Total Repayment Outlay', value: total.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 90. Finance Calculator
    {
        id: 'finance-calculator',
        name: 'Finance Calculator',
        category: 'finance-business',
        group: 'Budgeting & Everyday Money',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '201K',
        cpc: '$1.15',
        description: "A Finance Calculator performs general-purpose financial calculations including loans, investments, interest growth, and payment schedules. It acts as a multi-functional finance engine. The calculator can solve for unknown variables such as payment, principal, rate, or term.",
        inputs: [
            { id: 'presentValue', name: 'Present Value (PV)', type: 'currency', defaultValue: 10000, min: 0, step: 500, prefix: '$', tooltip: 'Starting value.' },
            { id: 'ratePct', name: 'Rate per Period (r)', type: 'percentage', defaultValue: 8.0, min: 0, max: 50, step: 0.25, suffix: '%', tooltip: 'Periodic return rate.' },
            { id: 'periods', name: 'Number of Periods (n)', type: 'number', defaultValue: 10, min: 1, max: 100, step: 1, tooltip: 'Number of periods.' },
            { id: 'periodicPayment', name: 'Periodic Payment (PMT)', type: 'currency', defaultValue: 0, min: 0, step: 50, prefix: '$', tooltip: 'Recurring addition.' }
        ],
        naturalLanguageQueries: ["Calculate my finance", "What is my finance?", "Help me work out finance"],
        edgeCases: ["Multiple unknown variables Non-converging rate calculations Zero-interest scenarios"],
        calculate: (inputs) => {
            const pv = Number(inputs.presentValue) || 10000;
            const r = (Number(inputs.ratePct) || 8.0) / 100;
            const n = Number(inputs.periods) || 10;
            const pmt = Number(inputs.periodicPayment) || 0;

            const fvPv = pv * Math.pow(1 + r, n);
            const fvPmt = r > 0 ? pmt * ((Math.pow(1 + r, n) - 1) / r) : pmt * n;
            const fv = fvPv + fvPmt;

            return {
                primaryOutput: { label: 'Calculated Future Value (FV)', value: fv.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Invested Capital (PV + PMT*n)', value: (pv + pmt * n).toFixed(2), prefix: '$' },
                    { label: 'Total Compounded Earnings', value: (fv - (pv + pmt * n)).toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 91. APR Calculator
    {
        id: 'apr-calculator',
        name: 'APR Calculator',
        category: 'finance-business',
        group: 'Budgeting & Everyday Money',
        bucket: 'Bucket A',
        tier: 2,
        phase: 2,
        monthlySearches: '40K',
        cpc: '$4.29',
        description: "An APR Calculator estimates the Annual Percentage Rate of a loan including interest and fees. It provides a standardized borrowing cost metric. The calculator helps borrowers compare financing offers more accurately.",
        inputs: [
            { id: 'loanAmount', name: 'Loan Amount', type: 'currency', defaultValue: 200000, min: 1000, step: 5000, prefix: '$', tooltip: 'Total borrowed sum.' },
            { id: 'interestRatePct', name: 'Nominal Interest Rate', type: 'percentage', defaultValue: 6.5, min: 0.1, max: 25, step: 0.125, suffix: '%', tooltip: 'Stated note interest rate.' },
            { id: 'closingCostsAndFees', name: 'Prepaid Finance Charges & Fees', type: 'currency', defaultValue: 4000, min: 0, step: 250, prefix: '$', tooltip: 'Points, origination, lender fees.' },
            { id: 'termYears', name: 'Loan Term (Years)', type: 'dropdown', defaultValue: 30, options: [{ label: '30 Years', value: 30 }, { label: '15 Years', value: 15 }], tooltip: 'Loan duration.' }
        ],
        naturalLanguageQueries: ["Calculate my apr", "What is my apr?", "Help me work out apr"],
        edgeCases: ["Zero-fee loans Negative amortization Non-standard payment schedules"],
        calculate: (inputs) => {
            const p = Number(inputs.loanAmount) || 200000;
            const rate = Number(inputs.interestRatePct) || 6.5;
            const fees = Number(inputs.closingCostsAndFees) || 4000;
            const term = Number(inputs.termYears) || 30;

            const monthlyPmt = calculateAmortizationMonthlyPayment(p, rate, term);
            const netProceeds = p - fees;
            const n = term * 12;

            // Solve for APR using net proceeds
            let r = rate / 100 / 12;
            for (let i = 0; i < 50; i++) {
                const f = (netProceeds * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1) - monthlyPmt;
                const df = (netProceeds * (Math.pow(1 + r, n) * (1 + r * n) - Math.pow(1 + r, 2 * n))) / Math.pow(Math.pow(1 + r, n) - 1, 2);
                r = r - (f / (df || 1));
            }
            const apr = Math.max(rate, r * 12 * 100);

            return {
                primaryOutput: { label: 'True Annual Percentage Rate (APR)', value: `${apr.toFixed(3)}%` },
                secondaryMetrics: [
                    { label: 'Stated Nominal Interest Rate', value: `${rate.toFixed(3)}%` },
                    { label: 'Monthly Payment Installment', value: monthlyPmt.toFixed(2), prefix: '$' },
                    { label: 'Financed Closing Fees', value: fees.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 92. Inflation Calculator
    {
        id: 'inflation-calculator',
        name: 'Inflation Calculator',
        category: 'finance-business',
        group: 'Budgeting & Everyday Money',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '823K',
        cpc: '$1.18',
        description: "An Inflation Calculator measures purchasing power changes over time due to inflation. It converts historical values into present-day equivalents. The calculator helps users compare money values across different years.",
        inputs: [
            { id: 'startingAmount', name: 'Starting Capital Amount', type: 'currency', defaultValue: 1000, min: 1, step: 100, prefix: '$', tooltip: 'Base dollar amount.' },
            { id: 'avgInflationRate', name: 'Average Annual Inflation Rate', type: 'percentage', defaultValue: 3.2, min: 0, max: 25, step: 0.1, suffix: '%', tooltip: 'Historical US CPI average is ~3.2%.' },
            { id: 'yearsPassed', name: 'Years Elapsed / Horizon', type: 'number', defaultValue: 20, min: 1, max: 100, step: 1, suffix: 'years', tooltip: 'Time horizon.' }
        ],
        naturalLanguageQueries: ["Calculate my inflation", "What is my inflation?", "Help me work out inflation"],
        edgeCases: ["Deflationary periods Unsupported years Hyperinflation scenarios"],
        calculate: (inputs) => {
            const amount = Number(inputs.startingAmount) || 1000;
            const rate = (Number(inputs.avgInflationRate) || 3.2) / 100;
            const years = Number(inputs.yearsPassed) || 20;

            const futureCost = amount * Math.pow(1 + rate, years);
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

    // 93. Currency Calculator
    {
        id: 'currency-calculator',
        name: 'Currency Calculator',
        category: 'finance-business',
        group: 'Budgeting & Everyday Money',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '60K',
        cpc: '$0.47',
        description: "A Currency Calculator converts monetary amounts between different currencies using exchange rates. It supports real-time or manually entered conversion rates. The calculator is commonly used for travel, international trade, and finance.",
        inputs: [
            { id: 'sourceAmount', name: 'Amount to Convert', type: 'number', defaultValue: 1000, min: 0.01, step: 50, tooltip: 'Amount in base currency.' },
            { id: 'exchangeRate', name: 'Exchange Rate (Target per 1 Base)', type: 'number', defaultValue: 0.92, min: 0.0001, max: 100000, step: 0.01, tooltip: 'e.g. 1 USD = 0.92 EUR' },
            { id: 'currencyPair', name: 'Currency Pair Label', type: 'dropdown', defaultValue: 'USD_EUR', options: [{ label: 'USD to EUR (Euro)', value: 'USD_EUR' }, { label: 'USD to GBP (Pound)', value: 'USD_GBP' }, { label: 'USD to CAD (Canadian $)', value: 'USD_CAD' }, { label: 'USD to JPY (Yen)', value: 'USD_JPY' }], tooltip: 'Currency pair.' }
        ],
        naturalLanguageQueries: ["Calculate my currency", "What is my currency?", "Help me work out currency"],
        edgeCases: ["Unsupported currencies Rapid exchange-rate fluctuations Zero or invalid exchange rates"],
        calculate: (inputs) => {
            const amt = Number(inputs.sourceAmount) || 1000;
            const rate = Number(inputs.exchangeRate) || 0.92;
            const converted = amt * rate;
            const inverse = rate > 0 ? 1 / rate : 0;

            return {
                primaryOutput: { label: 'Converted Currency Value', value: converted.toFixed(2) },
                secondaryMetrics: [
                    { label: 'Direct Conversion Rate', value: `1 = ${rate.toFixed(4)}` },
                    { label: 'Inverse Exchange Rate', value: `1 Target = ${inverse.toFixed(4)} Base` },
                    { label: 'Original Source Sum', value: amt.toFixed(2) }
                ]
            };
        }
    },

    // 94. Discount Calculator
    {
        id: 'discount-calculator',
        name: 'Discount Calculator',
        category: 'finance-business',
        group: 'Budgeting & Everyday Money',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '110K',
        cpc: '$6.61  ★ HIGH CPC',
        description: "A Discount Calculator estimates final prices after applying discounts or markdowns. It helps consumers and businesses calculate savings. The calculator supports fixed and percentage discounts.",
        inputs: [
            { id: 'originalPrice', name: 'Original List Price', type: 'currency', defaultValue: 120, min: 0.01, step: 5, prefix: '$', tooltip: 'Initial price tag.' },
            { id: 'discountPct', name: 'Discount Percentage', type: 'percentage', defaultValue: 25, min: 0, max: 100, step: 1, suffix: '%', tooltip: 'Percent off.' },
            { id: 'additionalCouponPct', name: 'Additional Extra Coupon Discount', type: 'percentage', defaultValue: 10, min: 0, max: 50, step: 1, suffix: '%', tooltip: 'Stacked promo code discount.' }
        ],
        naturalLanguageQueries: ["Calculate my discount", "What is my discount?", "Help me work out discount"],
        edgeCases: ["Discounts greater than 100% Negative prices Stacked discounts"],
        calculate: (inputs) => {
            const orig = Number(inputs.originalPrice) || 120;
            const d1 = (Number(inputs.discountPct) || 25) / 100;
            const d2 = (Number(inputs.additionalCouponPct) || 10) / 100;

            const afterD1 = orig * (1 - d1);
            const finalPrice = afterD1 * (1 - d2);
            const totalSaved = orig - finalPrice;
            const totalDiscountPct = (totalSaved / orig) * 100;

            return {
                primaryOutput: { label: 'Final Discounted Price', value: finalPrice.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Money Saved', value: totalSaved.toFixed(2), prefix: '$' },
                    { label: 'Effective Overall Discount', value: `${totalDiscountPct.toFixed(1)}% Off` },
                    { label: 'Original Price', value: orig.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 95. Percent Off Calculator
    {
        id: 'percent-off-calculator',
        name: 'Percent Off Calculator',
        category: 'finance-business',
        group: 'Budgeting & Everyday Money',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '50K',
        cpc: '$0.62',
        description: "A Percent Off Calculator determines savings and final prices after percentage-based discounts. It is commonly used for retail shopping and promotions. The calculator simplifies sale-price calculations.",
        inputs: [
            { id: 'retailPrice', name: 'Original Retail Price', type: 'currency', defaultValue: 80, min: 0.01, step: 5, prefix: '$', tooltip: 'Original item price.' },
            { id: 'percentOff', name: 'Percentage Off', type: 'percentage', defaultValue: 30, min: 0, max: 100, step: 1, suffix: '%', tooltip: 'Discount rate.' }
        ],
        naturalLanguageQueries: ["Calculate my percent off", "What is my percent off?", "Help me work out percent off"],
        edgeCases: ["Discount exceeding original price Negative taxes Multiple discount layers"],
        calculate: (inputs) => {
            const price = Number(inputs.retailPrice) || 80;
            const pct = (Number(inputs.percentOff) || 30) / 100;

            const savings = price * pct;
            const finalPrice = price - savings;

            return {
                primaryOutput: { label: 'Final Sale Price', value: finalPrice.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'You Save', value: savings.toFixed(2), prefix: '$' },
                    { label: 'Original Price', value: price.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 96. Margin Calculator
    {
        id: 'margin-calculator',
        name: 'Margin Calculator',
        category: 'finance-business',
        group: 'Budgeting & Everyday Money',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '201K',
        cpc: '$3.04',
        description: "A Margin Calculator estimates gross margin, markup, cost, and selling price relationships. It helps businesses determine pricing profitability. The calculator supports retail and wholesale pricing analysis.",
        inputs: [
            { id: 'costOfGoods', name: 'Cost of Goods Sold (COGS)', type: 'currency', defaultValue: 45, min: 0.01, step: 1, prefix: '$', tooltip: 'Cost to produce or buy.' },
            { id: 'revenueSellingPrice', name: 'Selling Price (Revenue)', type: 'currency', defaultValue: 75, min: 0.01, step: 1, prefix: '$', tooltip: 'Retail price to consumer.' }
        ],
        naturalLanguageQueries: ["Calculate my margin", "What is my margin?", "Help me work out margin"],
        edgeCases: ["Selling price below cost Zero product cost Negative margins"],
        calculate: (inputs) => {
            const cost = Number(inputs.costOfGoods) || 45;
            const price = Number(inputs.revenueSellingPrice) || 75;

            const profit = price - cost;
            const marginPct = price > 0 ? (profit / price) * 100 : 0;
            const markupPct = cost > 0 ? (profit / cost) * 100 : 0;

            return {
                primaryOutput: { label: 'Gross Profit Margin', value: `${marginPct.toFixed(2)}%` },
                secondaryMetrics: [
                    { label: 'Gross Profit per Unit', value: profit.toFixed(2), prefix: '$' },
                    { label: 'Equivalent Markup Percentage', value: `${markupPct.toFixed(2)}%` }
                ]
            };
        }
    },

    // 97. Cash Back or Low Interest Calculator
    {
        id: 'cash-back-or-low-interest-calculator',
        name: 'Cash Back or Low Interest Calculator',
        category: 'finance-business',
        group: 'Budgeting & Everyday Money',
        bucket: 'Bucket A',
        tier: 1,
        phase: 5,
        monthlySearches: '10',
        cpc: 'N/A',
        description: "A Cash Back or Low Interest Calculator compares financing offers between upfront cash-back incentives and lower interest rates. It helps consumers determine cheaper financing options. The calculator is commonly used for auto loans and promotional financing.",
        inputs: [
            { id: 'vehiclePrice', name: 'Vehicle Purchase Price', type: 'currency', defaultValue: 38000, min: 5000, step: 1000, prefix: '$', tooltip: 'Total purchase price.' },
            { id: 'cashBackRebate', name: 'Upfront Cash Back Rebate', type: 'currency', defaultValue: 2500, min: 0, step: 250, prefix: '$', tooltip: 'Manufacturer cash rebate.' },
            { id: 'standardApr', name: 'Standard Bank APR (with Rebate)', type: 'percentage', defaultValue: 6.5, min: 0.1, max: 20, step: 0.125, suffix: '%', tooltip: 'APR when taking cash back.' },
            { id: 'promotionalApr', name: 'Dealer Promo APR (0% or Low Rate)', type: 'percentage', defaultValue: 0.9, min: 0, max: 10, step: 0.1, suffix: '%', tooltip: 'Subsidized dealer financing APR.' },
            { id: 'loanTermMonths', name: 'Financing Term (Months)', type: 'dropdown', defaultValue: 60, options: [{ label: '36 Months', value: 36 }, { label: '48 Months', value: 48 }, { label: '60 Months', value: 60 }, { label: '72 Months', value: 72 }], tooltip: 'Term.' }
        ],
        naturalLanguageQueries: ["What is my monthly payment on a $20,000 loan at 5% for 5 years?", "Calculate loan payment 15000 at 8% over 3 years", "How much interest will I pay on a $50,000 loan?"],
        edgeCases: ["Zero-interest financing Negative rebates Extremely short loan terms"],
        calculate: (inputs) => {
            const price = Number(inputs.vehiclePrice) || 38000;
            const rebate = Number(inputs.cashBackRebate) || 2500;
            const stdApr = Number(inputs.standardApr) || 6.5;
            const promoApr = Number(inputs.promotionalApr) || 0.9;
            const months = Number(inputs.loanTermMonths) || 60;

            // Option 1: Take rebate, finance remaining at standard APR
            const loanWithRebate = Math.max(0, price - rebate);
            const pmtRebate = calculatePmt(loanWithRebate, stdApr, months);
            const totalCostRebate = pmtRebate * months;

            // Option 2: No rebate, finance full price at promotional APR
            const pmtPromo = calculatePmt(price, promoApr, months);
            const totalCostPromo = pmtPromo * months;

            const savings = Math.abs(totalCostRebate - totalCostPromo);
            const winner = totalCostPromo < totalCostRebate ? 'Low APR Promo' : 'Cash Back Rebate';

            return {
                primaryOutput: { label: 'Best Financial Choice', value: `${winner} Saves $${savings.toFixed(2)}` },
                secondaryMetrics: [
                    { label: 'Low APR Promo Total Cost', value: totalCostPromo.toFixed(2), prefix: '$' },
                    { label: 'Cash Back Rebate Total Cost', value: totalCostRebate.toFixed(2), prefix: '$' },
                    { label: 'Low APR Monthly Payment', value: pmtPromo.toFixed(2), prefix: '$' },
                    { label: 'Cash Back Monthly Payment', value: pmtRebate.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 98. Depreciation Calculator
    {
        id: 'depreciation-calculator',
        name: 'Depreciation Calculator',
        category: 'finance-business',
        group: 'Budgeting & Everyday Money',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '12K',
        cpc: '$6.14  ★ HIGH CPC',
        description: "A Depreciation Calculator estimates reduction in asset value over time. It supports straight-line, declining balance, and sum-of-years-digits methods. The calculator is commonly used in accounting and tax reporting.",
        inputs: [
            { id: 'assetCost', name: 'Initial Asset Cost Basis', type: 'currency', defaultValue: 50000, min: 100, step: 1000, prefix: '$', tooltip: 'Purchase price.' },
            { id: 'salvageValue', name: 'Estimated Salvage / Scrap Value', type: 'currency', defaultValue: 5000, min: 0, step: 500, prefix: '$', tooltip: 'Residual value at useful life end.' },
            { id: 'usefulLifeYears', name: 'Useful Life (Years)', type: 'number', defaultValue: 5, min: 1, max: 40, step: 1, suffix: 'years', tooltip: 'Depreciation life.' },
            { id: 'depreciationMethod', name: 'Depreciation Method', type: 'dropdown', defaultValue: 'straight_line', options: [{ label: 'Straight Line', value: 'straight_line' }, { label: 'Double Declining Balance (200% DB)', value: 'ddb' }], tooltip: 'Accounting method.' }
        ],
        naturalLanguageQueries: ["Calculate my depreciation", "What is my depreciation?", "Help me work out depreciation"],
        edgeCases: ["Salvage value exceeding asset cost Zero useful life Negative depreciation"],
        calculate: (inputs) => {
            const cost = Number(inputs.assetCost) || 50000;
            const salvage = Number(inputs.salvageValue) || 5000;
            const life = Math.max(1, Number(inputs.usefulLifeYears) || 5);
            const method = String(inputs.depreciationMethod || 'straight_line');

            const totalDepreciable = Math.max(0, cost - salvage);
            const straightLineAnnual = totalDepreciable / life;
            const ddbRate = (2 / life) * 100;
            const ddbYear1 = cost * (2 / life);

            return {
                primaryOutput: { label: method === 'ddb' ? 'Year 1 DDB Depreciation' : 'Annual Straight-Line Depreciation', value: (method === 'ddb' ? ddbYear1 : straightLineAnnual).toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Lifetime Depreciable Base', value: totalDepreciable.toFixed(2), prefix: '$' },
                    { label: 'Straight-Line Annual Expense', value: straightLineAnnual.toFixed(2), prefix: '$' },
                    { label: 'Terminal Salvage Value', value: salvage.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 99. College Cost Calculator
    {
        id: 'college-cost-calculator',
        name: 'College Cost Calculator',
        category: 'finance-business',
        group: 'Budgeting & Everyday Money',
        bucket: 'Bucket A',
        tier: 1,
        phase: 4,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "A College Cost Calculator estimates future education expenses including tuition, fees, housing, and inflation. It helps families plan education funding. The calculator supports inflation-adjusted projections.",
        inputs: [
            { id: 'currentAnnualTuition', name: 'Current Annual College Cost (Tuition + Room)', type: 'currency', defaultValue: 30000, min: 1000, step: 1000, prefix: '$', tooltip: 'Current 1-year total cost.' },
            { id: 'yearsUntilCollege', name: 'Years Until Child Enters College', type: 'number', defaultValue: 10, min: 0, max: 20, step: 1, suffix: 'years', tooltip: 'Time to college.' },
            { id: 'tuitionInflationRatePct', name: 'Annual Tuition Inflation Rate', type: 'percentage', defaultValue: 4.5, min: 0, max: 12, step: 0.25, suffix: '%', tooltip: 'Historical college inflation ~4.5%.' },
            { id: 'yearsInCollege', name: 'Degree Duration (Years)', type: 'dropdown', defaultValue: 4, options: [{ label: '4 Years (Bachelor\'s)', value: 4 }, { label: '2 Years (Associate\'s)', value: 2 }], tooltip: 'Program duration.' }
        ],
        naturalLanguageQueries: ["Calculate my college cost", "What is my college cost?", "Help me work out college cost"],
        edgeCases: ["Negative tuition inflation Multi-child planning omitted Variable yearly tuition increases"],
        calculate: (inputs) => {
            const currentCost = Number(inputs.currentAnnualTuition) || 30000;
            const yearsUntil = Number(inputs.yearsUntilCollege) || 10;
            const inflation = (Number(inputs.tuitionInflationRatePct) || 4.5) / 100;
            const degreeYears = Number(inputs.yearsInCollege) || 4;

            let totalDegreeCost = 0;
            let year1FutureCost = 0;

            for (let y = 0; y < degreeYears; y++) {
                const annualCost = currentCost * Math.pow(1 + inflation, yearsUntil + y);
                if (y === 0) year1FutureCost = annualCost;
                totalDegreeCost += annualCost;
            }

            const monthlySavingsNeeded = totalDegreeCost / (Math.max(1, yearsUntil * 12));

            return {
                primaryOutput: { label: 'Total Projected 4-Year Degree Cost', value: totalDegreeCost.toFixed(0), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Estimated Year 1 Tuition at Enrollment', value: year1FutureCost.toFixed(0), prefix: '$' },
                    { label: 'Monthly Savings Target (0% Interest Baseline)', value: monthlySavingsNeeded.toFixed(2), prefix: '$' },
                    { label: 'Current 4-Year Cost Today', value: (currentCost * degreeYears).toFixed(0), prefix: '$' }
                ]
            };
        }
    },

    // 100. GDP Calculator
    {
        id: 'gdp-calculator',
        name: 'GDP Calculator',
        category: 'finance-business',
        group: 'Budgeting & Everyday Money',
        bucket: 'Bucket B',
        tier: 1,
        phase: 4,
        monthlySearches: '2K',
        cpc: '$2.56',
        description: "A GDP Calculator estimates Gross Domestic Product using expenditure, income, or production approaches. It helps measure economic activity. The calculator is commonly used in economics and academic analysis.",
        inputs: [
            { id: 'consumption', name: 'Private Consumption (C)', type: 'currency', defaultValue: 14000, min: 0, step: 500, prefix: '$B', tooltip: 'Consumer spending.' },
            { id: 'investment', name: 'Gross Private Investment (I)', type: 'currency', defaultValue: 4000, min: 0, step: 250, prefix: '$B', tooltip: 'Business capital investments.' },
            { id: 'governmentSpending', name: 'Government Spending (G)', type: 'currency', defaultValue: 4500, min: 0, step: 250, prefix: '$B', tooltip: 'Federal, state, and municipal spending.' },
            { id: 'exports', name: 'Total Exports (X)', type: 'currency', defaultValue: 2500, min: 0, step: 100, prefix: '$B', tooltip: 'Goods sold abroad.' },
            { id: 'imports', name: 'Total Imports (M)', type: 'currency', defaultValue: 3200, min: 0, step: 100, prefix: '$B', tooltip: 'Foreign goods purchased.' }
        ],
        naturalLanguageQueries: ["Calculate my gdp", "What is my gdp?", "Help me work out gdp"],
        edgeCases: ["Negative net exports Missing economic sectors Inflation-adjusted GDP not modeled"],
        calculate: (inputs) => {
            const c = Number(inputs.consumption) || 14000;
            const i = Number(inputs.investment) || 4000;
            const g = Number(inputs.governmentSpending) || 4500;
            const x = Number(inputs.exports) || 2500;
            const m = Number(inputs.imports) || 3200;

            const netExports = x - m;
            const gdp = c + i + g + netExports;

            return {
                primaryOutput: { label: 'Gross Domestic Product (GDP)', value: gdp.toFixed(2), prefix: '$', suffix: ' Billion' },
                secondaryMetrics: [
                    { label: 'Net Exports (X - M)', value: netExports.toFixed(2), prefix: '$', suffix: ' Billion' },
                    { label: 'Consumption Share of GDP', value: `${((c / gdp) * 100).toFixed(1)}%` },
                    { label: 'Trade Balance Status', value: netExports >= 0 ? 'Trade Surplus' : 'Trade Deficit' }
                ]
            };
        }
    },

    // 101. Net Profit Calculator
    {
        id: 'net-profit-calculator',
        name: 'Net Profit Calculator',
        category: 'finance-business',
        group: 'Budgeting & Everyday Money',
        bucket: 'Bucket B',
        tier: 1,
        phase: 3,
        monthlySearches: '2K',
        cpc: '$3.49',
        description: "A Net Profit Calculator estimates final business profit after all expenses, taxes, and operating costs are deducted from revenue. It helps businesses measure profitability. The calculator supports general business financial analysis.",
        inputs: [
            { id: 'totalRevenue', name: 'Total Gross Revenue', type: 'currency', defaultValue: 500000, min: 0, step: 10000, prefix: '$', tooltip: 'Top-line sales revenue.' },
            { id: 'cogs', name: 'Cost of Goods Sold (COGS)', type: 'currency', defaultValue: 200000, min: 0, step: 5000, prefix: '$', tooltip: 'Direct production expenses.' },
            { id: 'operatingExpenses', name: 'Operating Expenses (OPEX)', type: 'currency', defaultValue: 150000, min: 0, step: 5000, prefix: '$', tooltip: 'Salaries, rent, utilities, marketing.' },
            { id: 'taxesAndInterest', name: 'Taxes & Interest Expense', type: 'currency', defaultValue: 40000, min: 0, step: 2500, prefix: '$', tooltip: 'Corporate income tax and loan interest.' }
        ],
        naturalLanguageQueries: ["Calculate my net profit", "What is my net profit?", "Help me work out net profit"],
        edgeCases: ["Negative profits Zero revenue businesses Missing expense categories"],
        calculate: (inputs) => {
            const rev = Math.max(1, Number(inputs.totalRevenue) || 500000);
            const cogs = Number(inputs.cogs) || 200000;
            const opex = Number(inputs.operatingExpenses) || 150000;
            const tax = Number(inputs.taxesAndInterest) || 40000;

            const grossProfit = rev - cogs;
            const operatingIncome = grossProfit - opex;
            const netProfit = operatingIncome - tax;
            const netMargin = (netProfit / rev) * 100;

            return {
                primaryOutput: { label: 'Bottom-Line Net Profit', value: netProfit.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Net Profit Margin', value: `${netMargin.toFixed(2)}%` },
                    { label: 'Gross Profit', value: grossProfit.toFixed(2), prefix: '$' },
                    { label: 'Operating Income (EBIT)', value: operatingIncome.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 102. Gross Profit Calculator
    {
        id: 'gross-profit-calculator',
        name: 'Gross Profit Calculator',
        category: 'finance-business',
        group: 'Budgeting & Everyday Money',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '10K',
        cpc: '$1.56',
        description: "A Gross Profit Calculator estimates profit after subtracting cost of goods sold from revenue. It measures core operational profitability. The calculator helps businesses analyze product profitability.",
        inputs: [
            { id: 'revenue', name: 'Total Sales Revenue', type: 'currency', defaultValue: 150000, min: 0, step: 5000, prefix: '$', tooltip: 'Gross sales receipts.' },
            { id: 'cogs', name: 'Cost of Goods Sold (COGS)', type: 'currency', defaultValue: 65000, min: 0, step: 2500, prefix: '$', tooltip: 'Direct material and labor costs.' }
        ],
        naturalLanguageQueries: ["Calculate my gross profit", "What is my gross profit?", "Help me work out gross profit"],
        edgeCases: ["Negative gross profit Zero revenue COGS exceeding revenue"],
        calculate: (inputs) => {
            const rev = Math.max(1, Number(inputs.revenue) || 150000);
            const cogs = Number(inputs.cogs) || 65000;

            const grossProfit = rev - cogs;
            const margin = (grossProfit / rev) * 100;

            return {
                primaryOutput: { label: 'Gross Profit', value: grossProfit.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Gross Profit Margin', value: `${margin.toFixed(2)}%` },
                    { label: 'COGS as % of Revenue', value: `${((cogs / rev) * 100).toFixed(2)}%` }
                ]
            };
        }
    },

    // 103. Gross Margin Calculator
    {
        id: 'gross-margin-calculator',
        name: 'Gross Margin Calculator',
        category: 'finance-business',
        group: 'Budgeting & Everyday Money',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '22K',
        cpc: '$1.53',
        description: "A Gross Margin Calculator measures gross profit relative to revenue as a percentage. It helps businesses evaluate operational efficiency. The calculator is widely used in retail, manufacturing, and SaaS industries.",
        inputs: [
            { id: 'salesRevenue', name: 'Total Sales Revenue', type: 'currency', defaultValue: 80000, min: 1, step: 2500, prefix: '$', tooltip: 'Gross revenue.' },
            { id: 'cogs', name: 'Cost of Goods Sold (COGS)', type: 'currency', defaultValue: 32000, min: 0, step: 1000, prefix: '$', tooltip: 'Direct cost of product.' }
        ],
        naturalLanguageQueries: ["Calculate my gross margin", "What is my gross margin?", "Help me work out gross margin"],
        edgeCases: ["Zero revenue Negative margins Revenue less than COGS"],
        calculate: (inputs) => {
            const rev = Math.max(1, Number(inputs.salesRevenue) || 80000);
            const cogs = Number(inputs.cogs) || 32000;

            const profit = rev - cogs;
            const grossMarginPct = (profit / rev) * 100;

            return {
                primaryOutput: { label: 'Gross Margin Percentage', value: `${grossMarginPct.toFixed(2)}%` },
                secondaryMetrics: [
                    { label: 'Gross Profit Dollar Amount', value: profit.toFixed(2), prefix: '$' },
                    { label: 'Markup Percentage on Cost', value: `${((profit / (cogs || 1)) * 100).toFixed(2)}%` }
                ]
            };
        }
    },

    // 104. Net Profit Margin Calculator
    {
        id: 'net-profit-margin-calculator',
        name: 'Net Profit Margin Calculator',
        category: 'finance-business',
        group: 'Budgeting & Everyday Money',
        bucket: 'Bucket B',
        tier: 1,
        phase: 5,
        monthlySearches: '880',
        cpc: '$1.22',
        description: "A Net Profit Margin Calculator measures net profit as a percentage of revenue. It evaluates overall business profitability after all expenses. The calculator helps businesses compare financial efficiency.",
        inputs: [
            { id: 'netIncome', name: 'Net Income (Bottom-Line Profit)', type: 'currency', defaultValue: 45000, min: 0, step: 2500, prefix: '$', tooltip: 'Profit after all costs and taxes.' },
            { id: 'totalRevenue', name: 'Total Gross Revenue', type: 'currency', defaultValue: 300000, min: 1, step: 10000, prefix: '$', tooltip: 'Top-line sales revenue.' }
        ],
        naturalLanguageQueries: ["Calculate my net profit margin", "What is my net profit margin?", "Help me work out net profit margin"],
        edgeCases: ["Negative profits Zero revenue Extreme margins over 100%"],
        calculate: (inputs) => {
            const net = Number(inputs.netIncome) || 45000;
            const rev = Math.max(1, Number(inputs.totalRevenue) || 300000);

            const netMargin = (net / rev) * 100;

            return {
                primaryOutput: { label: 'Net Profit Margin', value: `${netMargin.toFixed(2)}%` },
                secondaryMetrics: [
                    { label: 'Net Profit Kept per $100 Revenue', value: `$${netMargin.toFixed(2)}` },
                    { label: 'Total Gross Revenue', value: rev.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 105. Selling Price Calculator
    {
        id: 'selling-price-calculator',
        name: 'Selling Price Calculator',
        category: 'finance-business',
        group: 'Budgeting & Everyday Money',
        bucket: 'Bucket B',
        tier: 1,
        phase: 3,
        monthlySearches: '1K',
        cpc: '$3.75',
        description: "A Selling Price Calculator determines the required sale price based on desired margin or markup. It helps businesses price products profitably. The calculator supports retail and wholesale pricing models.",
        inputs: [
            { id: 'unitCost', name: 'Unit Cost Basis', type: 'currency', defaultValue: 60, min: 0.01, step: 1, prefix: '$', tooltip: 'Cost to produce or acquire 1 unit.' },
            { id: 'desiredMarginPct', name: 'Target Gross Profit Margin', type: 'percentage', defaultValue: 40, min: 1, max: 99, step: 1, suffix: '%', tooltip: 'Target margin percentage.' }
        ],
        naturalLanguageQueries: ["Calculate my selling price", "What is my selling price?", "Help me work out selling price"],
        edgeCases: ["Margin equal to 100% Negative costs Unrealistic markups"],
        calculate: (inputs) => {
            const cost = Number(inputs.unitCost) || 60;
            const margin = Math.min(99, Math.max(1, Number(inputs.desiredMarginPct) || 40)) / 100;

            const sellingPrice = cost / (1 - margin);
            const grossProfit = sellingPrice - cost;
            const markup = (grossProfit / cost) * 100;

            return {
                primaryOutput: { label: 'Recommended Selling Price', value: sellingPrice.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Dollar Gross Profit per Unit', value: grossProfit.toFixed(2), prefix: '$' },
                    { label: 'Equivalent Cost Markup Percentage', value: `${markup.toFixed(2)}%` },
                    { label: 'Unit Production Cost', value: cost.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 106. List Price Markdown Calculator
    {
        id: 'list-price-markdown-calculator',
        name: 'List Price Markdown Calculator',
        category: 'finance-business',
        group: 'Budgeting & Everyday Money',
        bucket: 'Bucket B',
        tier: 1,
        phase: 3,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "A List Price Markdown Calculator estimates sale prices and markdown percentages relative to original list prices. It helps retailers and shoppers evaluate discounts. The calculator supports sequential markdown analysis.",
        inputs: [
            { id: 'listPrice', name: 'Original List Price', type: 'currency', defaultValue: 150, min: 1, step: 5, prefix: '$', tooltip: 'MSRP or catalogue price.' },
            { id: 'markdownPct', name: 'Markdown Percentage', type: 'percentage', defaultValue: 35, min: 0, max: 100, step: 1, suffix: '%', tooltip: 'Discount from list price.' }
        ],
        naturalLanguageQueries: ["Calculate my list price markdown", "What is my list price markdown?", "Help me work out list price markdown"],
        edgeCases: ["Discounts exceeding 100% Multiple sequential markdown rounding Negative list prices"],
        calculate: (inputs) => {
            const list = Number(inputs.listPrice) || 150;
            const md = (Number(inputs.markdownPct) || 35) / 100;

            const markdownAmount = list * md;
            const salePrice = list - markdownAmount;

            return {
                primaryOutput: { label: 'Marked-Down Sale Price', value: salePrice.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Customer Markdown Savings', value: markdownAmount.toFixed(2), prefix: '$' },
                    { label: 'Original List Price', value: list.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 107. Effective Annual Rate Calculator
    {
        id: 'effective-annual-rate-calculator',
        name: 'Effective Annual Rate Calculator',
        category: 'finance-business',
        group: 'Budgeting & Everyday Money',
        bucket: 'Bucket B',
        tier: 1,
        phase: 3,
        monthlySearches: '4K',
        cpc: '$2.09',
        description: "An Effective Annual Rate Calculator estimates the true annual interest rate after compounding effects are included. It helps compare loans and investments with different compounding frequencies. The calculator standardizes annualized returns and borrowing costs.",
        inputs: [
            { id: 'nominalRatePct', name: 'Nominal Stated APR Rate', type: 'percentage', defaultValue: 8.0, min: 0.1, max: 50, step: 0.125, suffix: '%', tooltip: 'Stated annual percentage rate.' },
            { id: 'compoundingPeriods', name: 'Compounding Frequency', type: 'dropdown', defaultValue: 12, options: [{ label: 'Monthly (12x/year)', value: 12 }, { label: 'Daily (365x/year)', value: 365 }, { label: 'Quarterly (4x/year)', value: 4 }, { label: 'Semi-Annually (2x/year)', value: 2 }], tooltip: 'Compounding periods per year.' }
        ],
        naturalLanguageQueries: ["Calculate my effective annual rate", "What is my effective annual rate?", "Help me work out effective annual rate"],
        edgeCases: ["Zero interest rates Extremely high compounding frequencies Negative nominal rates"],
        calculate: (inputs) => {
            const nom = (Number(inputs.nominalRatePct) || 8.0) / 100;
            const n = Number(inputs.compoundingPeriods) || 12;

            const ear = (Math.pow(1 + nom / n, n) - 1) * 100;

            return {
                primaryOutput: { label: 'Effective Annual Rate (EAR / APY)', value: `${ear.toFixed(4)}%` },
                secondaryMetrics: [
                    { label: 'Stated Nominal APR', value: `${(nom * 100).toFixed(4)}%` },
                    { label: 'Compounding Yield Premium', value: `+${(ear - nom * 100).toFixed(4)}%` }
                ]
            };
        }
    },

    // 108. Pay Raise Calculator
    {
        id: 'pay-raise-calculator',
        name: 'Pay Raise Calculator',
        category: 'finance-business',
        group: 'Budgeting & Everyday Money',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '40K',
        cpc: '$11.85  ★ HIGH CPC',
        description: "A Pay Raise Calculator estimates new salary or wage amounts after a raise increase. It helps employees understand compensation changes in both percentage and fixed-dollar formats. The calculator also estimates annual, monthly, and hourly earnings differences after the raise.",
        inputs: [
            { id: 'currentSalaryAnnual', name: 'Current Annual Gross Salary', type: 'currency', defaultValue: 65000, min: 1000, step: 2500, prefix: '$', tooltip: 'Current salary.' },
            { id: 'raisePct', name: 'Pay Raise Percentage', type: 'percentage', defaultValue: 5.5, min: 0.1, max: 100, step: 0.25, suffix: '%', tooltip: 'Percentage increase.' }
        ],
        naturalLanguageQueries: ["Calculate my pay raise", "What is my pay raise?", "Help me work out pay raise"],
        edgeCases: ["Negative raise values representing pay cuts Zero salary inputs Extremely high percentage increases Hourly-to-salary conversion inconsistencies"],
        calculate: (inputs) => {
            const cur = Number(inputs.currentSalaryAnnual) || 65000;
            const pct = (Number(inputs.raisePct) || 5.5) / 100;

            const annualRaise = cur * pct;
            const newAnnual = cur + annualRaise;
            const monthlyIncrease = annualRaise / 12;
            const hourlyIncrease = annualRaise / 2080;

            return {
                primaryOutput: { label: 'New Annual Gross Salary', value: newAnnual.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Annual Raise Amount', value: annualRaise.toFixed(2), prefix: '$' },
                    { label: 'Monthly Pay Increase', value: monthlyIncrease.toFixed(2), prefix: '$' },
                    { label: 'Equivalent Hourly Raise', value: hourlyIncrease.toFixed(2), prefix: '$', suffix: '/ hr' }
                ]
            };
        }
    },

    // 109. Overtime Pay Calculator
    {
        id: 'overtime-pay-calculator',
        name: 'Overtime Pay Calculator',
        category: 'finance-business',
        group: 'Budgeting & Everyday Money',
        bucket: 'Bucket A',
        tier: 1,
        phase: 3,
        monthlySearches: '4K',
        cpc: '$13.16  ★ HIGH CPC',
        description: "An Overtime Pay Calculator estimates additional compensation earned from overtime work hours. It helps employees and employers calculate regular pay, overtime pay, and total earnings. The calculator supports standard overtime multipliers and holiday rates.",
        inputs: [
            { id: 'hourlyWage', name: 'Regular Hourly Wage', type: 'currency', defaultValue: 25, min: 1, step: 1, prefix: '$', tooltip: 'Base hourly rate.' },
            { id: 'regularHoursWorked', name: 'Regular Hours Worked', type: 'number', defaultValue: 40, min: 0, max: 40, step: 1, suffix: 'hrs', tooltip: 'Up to 40 hours.' },
            { id: 'overtimeHoursWorked', name: 'Overtime Hours Worked (1.5x)', type: 'number', defaultValue: 10, min: 0, max: 60, step: 1, suffix: 'hrs', tooltip: 'Hours above 40.' }
        ],
        naturalLanguageQueries: ["How many days between January 1 and December 31?", "Calculate time between two dates", "How many weeks until Christmas?"],
        edgeCases: ["Overtime multiplier below 1 Negative hours worked Excessive weekly hours beyond legal limits Fractional overtime hours"],
        calculate: (inputs) => {
            const wage = Number(inputs.hourlyWage) || 25;
            const regHours = Number(inputs.regularHoursWorked) || 40;
            const otHours = Number(inputs.overtimeHoursWorked) || 10;

            const regularPay = wage * regHours;
            const otRate = wage * 1.5;
            const otPay = otRate * otHours;
            const totalGross = regularPay + otPay;

            return {
                primaryOutput: { label: 'Total Weekly Gross Pay', value: totalGross.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Overtime Earnings (1.5x Rate)', value: otPay.toFixed(2), prefix: '$' },
                    { label: 'Regular Base Earnings', value: regularPay.toFixed(2), prefix: '$' },
                    { label: 'Overtime Hourly Rate', value: otRate.toFixed(2), prefix: '$', suffix: '/ hr' }
                ]
            };
        }
    },

    // 110. Cost of Living Calculator
    {
        id: 'cost-of-living-calculator',
        name: 'Cost of Living Calculator',
        category: 'finance-business',
        group: 'Budgeting & Everyday Money',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '74K',
        cpc: '$2.56',
        description: "A Cost of Living Calculator compares living expenses between different cities or regions. It estimates how much income is needed to maintain the same standard of living after relocation. The calculator commonly uses regional price indexes and inflation-adjusted expense categories.",
        inputs: [
            { id: 'currentSalary', name: 'Current Annual Salary', type: 'currency', defaultValue: 80000, min: 10000, step: 2500, prefix: '$', tooltip: 'Current earnings.' },
            { id: 'currentCityIndex', name: 'Current City Cost of Living Index', type: 'number', defaultValue: 100, min: 50, max: 300, step: 5, tooltip: '100 is baseline national average.' },
            { id: 'targetCityIndex', name: 'Target City Cost of Living Index', type: 'number', defaultValue: 135, min: 50, max: 300, step: 5, tooltip: 'Index of new city.' }
        ],
        naturalLanguageQueries: ["Calculate my cost of living", "What is my cost of living?", "Help me work out cost of living"],
        edgeCases: ["Missing regional data Extreme inflation scenarios Unsupported international cities User spending patterns differing heavily from averages"],
        calculate: (inputs) => {
            const sal = Number(inputs.currentSalary) || 80000;
            const curIdx = Math.max(1, Number(inputs.currentCityIndex) || 100);
            const tgtIdx = Math.max(1, Number(inputs.targetCityIndex) || 135);

            const requiredSalary = sal * (tgtIdx / curIdx);
            const diffPct = ((tgtIdx - curIdx) / curIdx) * 100;
            const dollarDiff = requiredSalary - sal;

            return {
                primaryOutput: { label: 'Required Salary in Target City', value: requiredSalary.toFixed(0), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Cost of Living Difference', value: `${diffPct >= 0 ? '+' : ''}${diffPct.toFixed(1)}%` },
                    { label: 'Annual Salary Adjustment Needed', value: `${dollarDiff >= 0 ? '+' : ''}${dollarDiff.toFixed(0)}`, prefix: '$' }
                ]
            };
        }
    },

    // 111. Purchasing Power Calculator
    {
        id: 'purchasing-power-calculator',
        name: 'Purchasing Power Calculator',
        category: 'finance-business',
        group: 'Budgeting & Everyday Money',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '5K',
        cpc: '$4.37',
        description: "A Purchasing Power Calculator estimates how inflation impacts the value of money over time. It helps users understand changes in buying power between years or economies. The calculator is commonly used for salary comparisons and long-term financial planning.",
        inputs: [
            { id: 'baseAmount', name: 'Initial Dollar Amount', type: 'currency', defaultValue: 10000, min: 100, step: 500, prefix: '$', tooltip: 'Baseline sum.' },
            { id: 'inflationRatePct', name: 'Annual Inflation Rate', type: 'percentage', defaultValue: 3.5, min: 0, max: 25, step: 0.1, suffix: '%', tooltip: 'Yearly inflation.' },
            { id: 'years', name: 'Time Horizon (Years)', type: 'number', defaultValue: 15, min: 1, max: 50, step: 1, suffix: 'years', tooltip: 'Years passed.' }
        ],
        naturalLanguageQueries: ["Calculate my purchasing power", "What is my purchasing power?", "Help me work out purchasing power"],
        edgeCases: ["Deflation periods Unsupported historical years Hyperinflation distortions"],
        calculate: (inputs) => {
            const amt = Number(inputs.baseAmount) || 10000;
            const r = (Number(inputs.inflationRatePct) || 3.5) / 100;
            const t = Number(inputs.years) || 15;

            const realWorth = amt / Math.pow(1 + r, t);
            const futureEquivalent = amt * Math.pow(1 + r, t);
            const lossPct = (1 - (realWorth / amt)) * 100;

            return {
                primaryOutput: { label: 'Real Purchasing Power in ' + t + ' Yrs', value: realWorth.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Future Equivalent Cost', value: futureEquivalent.toFixed(2), prefix: '$' },
                    { label: 'Total Value Erosion', value: `-${lossPct.toFixed(1)}%` }
                ]
            };
        }
    },

    // 112. Hourly to Salary Calculator
    {
        id: 'hourly-to-salary-calculator',
        name: 'Hourly to Salary Calculator',
        category: 'finance-business',
        group: 'Budgeting & Everyday Money',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '60K',
        cpc: '$0.46',
        description: "An Hourly to Salary Calculator converts hourly wages into annual, monthly, weekly, or daily salary equivalents. It helps workers compare compensation structures. The calculator supports overtime and varying work schedules.",
        inputs: [
            { id: 'hourlyWage', name: 'Hourly Pay Rate', type: 'currency', defaultValue: 35, min: 1, step: 1, prefix: '$', tooltip: 'Hourly wage.' },
            { id: 'hoursPerWeek', name: 'Working Hours Per Week', type: 'number', defaultValue: 40, min: 1, max: 80, step: 1, suffix: 'hrs', tooltip: 'Hours worked each week.' },
            { id: 'weeksPerYear', name: 'Paid Weeks Per Year', type: 'number', defaultValue: 52, min: 1, max: 52, step: 1, suffix: 'weeks', tooltip: 'Paid weeks.' }
        ],
        naturalLanguageQueries: ["Calculate my hourly to salary", "What is my hourly to salary?", "Help me work out hourly to salary"],
        edgeCases: ["Zero hours worked Excessive weekly hours Seasonal employment schedules"],
        calculate: (inputs) => {
            const wage = Number(inputs.hourlyWage) || 35;
            const hours = Number(inputs.hoursPerWeek) || 40;
            const weeks = Number(inputs.weeksPerYear) || 52;

            const annual = wage * hours * weeks;
            const monthly = annual / 12;
            const biweekly = annual / 26;
            const weekly = annual / weeks;

            return {
                primaryOutput: { label: 'Annual Gross Salary', value: annual.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Monthly Gross Pay', value: monthly.toFixed(2), prefix: '$' },
                    { label: 'Bi-Weekly Paycheck (Gross)', value: biweekly.toFixed(2), prefix: '$' },
                    { label: 'Weekly Gross Pay', value: weekly.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 113. Salary to Hourly Calculator
    {
        id: 'salary-to-hourly-calculator',
        name: 'Salary to Hourly Calculator',
        category: 'finance-business',
        group: 'Budgeting & Everyday Money',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '60K',
        cpc: '$0.46',
        description: "A Salary to Hourly Calculator converts annual or monthly salaries into estimated hourly wages. It helps employees compare salaried and hourly job offers. The calculator accounts for work schedules and unpaid time off.",
        inputs: [
            { id: 'annualSalary', name: 'Annual Gross Salary', type: 'currency', defaultValue: 75000, min: 1000, step: 2500, prefix: '$', tooltip: 'Gross yearly compensation.' },
            { id: 'hoursPerWeek', name: 'Working Hours Per Week', type: 'number', defaultValue: 40, min: 1, max: 80, step: 1, suffix: 'hrs', tooltip: 'Standard full-time is 40 hours.' },
            { id: 'weeksPerYear', name: 'Paid Weeks Per Year', type: 'number', defaultValue: 52, min: 1, max: 52, step: 1, suffix: 'weeks', tooltip: '52 standard weeks.' }
        ],
        naturalLanguageQueries: ["Calculate my salary to hourly", "What is my salary to hourly?", "Help me work out salary to hourly"],
        edgeCases: ["Zero work hours Part-time schedules Salaries with bonuses not included"],
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
    },

    // 114. Bill Split Calculator
    {
        id: 'bill-split-calculator',
        name: 'Bill Split Calculator',
        category: 'finance-business',
        group: 'Budgeting & Everyday Money',
        bucket: 'Bucket B',
        tier: 1,
        phase: 3,
        monthlySearches: '4K',
        cpc: '$0.93',
        description: "A Bill Split Calculator divides shared expenses among multiple people. It supports equal splits, weighted splits, tax calculations, and tip adjustments. The calculator is commonly used for restaurant bills, travel expenses, and shared household costs.",
        inputs: [
            { id: 'billAmount', name: 'Total Pre-Tax Bill Amount', type: 'currency', defaultValue: 120, min: 1, step: 5, prefix: '$', tooltip: 'Subtotal of bill.' },
            { id: 'tipPct', name: 'Tip Percentage', type: 'percentage', defaultValue: 18, min: 0, max: 50, step: 1, suffix: '%', tooltip: 'Gratuity.' },
            { id: 'taxPct', name: 'Sales Tax Percentage', type: 'percentage', defaultValue: 8.5, min: 0, max: 20, step: 0.25, suffix: '%', tooltip: 'Local tax rate.' },
            { id: 'numberOfPeople', name: 'Number of People Splitting', type: 'number', defaultValue: 4, min: 1, max: 50, step: 1, tooltip: 'Group size.' }
        ],
        naturalLanguageQueries: ["Calculate my bill split", "What is my bill split?", "Help me work out bill split"],
        edgeCases: ["Split percentages not totaling 100% Negative bill values Very large group sizes"],
        calculate: (inputs) => {
            const bill = Number(inputs.billAmount) || 120;
            const tipPct = (Number(inputs.tipPct) || 18) / 100;
            const taxPct = (Number(inputs.taxPct) || 8.5) / 100;
            const people = Math.max(1, Number(inputs.numberOfPeople) || 4);

            const tipAmount = bill * tipPct;
            const taxAmount = bill * taxPct;
            const totalBill = bill + tipAmount + taxAmount;
            const perPerson = totalBill / people;

            return {
                primaryOutput: { label: 'Amount Owed per Person', value: perPerson.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Combined Bill (With Tax & Tip)', value: totalBill.toFixed(2), prefix: '$' },
                    { label: 'Total Tip Amount', value: tipAmount.toFixed(2), prefix: '$' },
                    { label: 'Total Sales Tax', value: taxAmount.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 115. Subscription Cost Calculator
    {
        id: 'subscription-cost-calculator',
        name: 'Subscription Cost Calculator',
        category: 'finance-business',
        group: 'Budgeting & Everyday Money',
        bucket: 'Bucket B',
        tier: 1,
        phase: 4,
        monthlySearches: '40',
        cpc: '$6.84  ★ HIGH CPC',
        description: "A Subscription Cost Calculator estimates recurring costs from subscriptions over monthly or yearly periods. It helps users track and optimize recurring expenses. The calculator supports inflation, taxes, and bundled service analysis.",
        inputs: [
            { id: 'streamingMonthly', name: 'Streaming & Video (Netflix, Spotify, etc.)', type: 'currency', defaultValue: 55, min: 0, step: 5, prefix: '$', tooltip: 'Entertainment subscriptions.' },
            { id: 'softwareCloudMonthly', name: 'Software, Cloud & Productivity', type: 'currency', defaultValue: 45, min: 0, step: 5, prefix: '$', tooltip: 'iCloud, Office, AI tools.' },
            { id: 'fitnessBoxesMonthly', name: 'Gym, Fitness & Subscription Boxes', type: 'currency', defaultValue: 80, min: 0, step: 5, prefix: '$', tooltip: 'Gym, meal kits, coffee clubs.' }
        ],
        naturalLanguageQueries: ["Calculate my subscription cost", "What is my subscription cost?", "Help me work out subscription cost"],
        edgeCases: ["Mixed billing frequencies Free trial periods Subscription cancellations mid-cycle"],
        calculate: (inputs) => {
            const stream = Number(inputs.streamingMonthly) || 55;
            const software = Number(inputs.softwareCloudMonthly) || 45;
            const gym = Number(inputs.fitnessBoxesMonthly) || 80;

            const totalMonthly = stream + software + gym;
            const totalAnnual = totalMonthly * 12;
            const tenYearCostWithCompounding = calculateCompoundFutureValue(0, totalMonthly, 7.0, 10, 12);

            return {
                primaryOutput: { label: 'Annual Subscriptions Cost', value: totalAnnual.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Monthly Subscriptions Outlay', value: totalMonthly.toFixed(2), prefix: '$' },
                    { label: 'Opportunity Cost in 10 Yrs (If Invested at 7%)', value: tenYearCostWithCompounding.toFixed(0), prefix: '$' }
                ]
            };
        }
    },

    // 116. Tip Split Calculator
    {
        id: 'tip-split-calculator',
        name: 'Tip Split Calculator',
        category: 'finance-business',
        group: 'Budgeting & Everyday Money',
        bucket: 'Bucket B',
        tier: 1,
        phase: 3,
        monthlySearches: '170',
        cpc: 'N/A',
        description: "A Tip Split Calculator calculates gratuity amounts and divides them among multiple people. It helps groups fairly allocate restaurant tips and service charges. The calculator supports custom split percentages and uneven contributions.",
        inputs: [
            { id: 'billTotal', name: 'Bill Amount', type: 'currency', defaultValue: 85, min: 1, step: 5, prefix: '$', tooltip: 'Check total.' },
            { id: 'tipPercentage', name: 'Tip Percentage', type: 'percentage', defaultValue: 20, min: 0, max: 50, step: 1, suffix: '%', tooltip: 'Tip percent.' },
            { id: 'numberOfGuests', name: 'Number of Diners', type: 'number', defaultValue: 2, min: 1, max: 30, step: 1, tooltip: 'Guest count.' }
        ],
        naturalLanguageQueries: ["Calculate my tip split", "What is my tip split?", "Help me work out tip split"],
        edgeCases: ["Negative tips Zero participants Custom splits not balancing correctly"],
        calculate: (inputs) => {
            const bill = Number(inputs.billTotal) || 85;
            const pct = (Number(inputs.tipPercentage) || 20) / 100;
            const guests = Math.max(1, Number(inputs.numberOfGuests) || 2);

            const tip = bill * pct;
            const total = bill + tip;
            const tipPerGuest = tip / guests;
            const totalPerGuest = total / guests;

            return {
                primaryOutput: { label: 'Total Share per Guest', value: totalPerGuest.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Tip Share per Guest', value: tipPerGuest.toFixed(2), prefix: '$' },
                    { label: 'Total Tip', value: tip.toFixed(2), prefix: '$' },
                    { label: 'Combined Total with Tip', value: total.toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 117. Markup Calculator
    {
        id: 'markup-calculator',
        name: 'Markup Calculator',
        category: 'finance-business',
        group: 'Budgeting & Everyday Money',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '33K',
        cpc: '$2.66',
        description: "A Markup Calculator determines selling price increases above product cost. It helps businesses establish pricing strategies and profitability targets. The calculator supports percentage markups and desired selling-price calculations.",
        inputs: [
            { id: 'unitCost', name: 'Product Unit Cost Basis', type: 'currency', defaultValue: 50, min: 0.01, step: 1, prefix: '$', tooltip: 'Cost of product.' },
            { id: 'markupPercentage', name: 'Desired Markup Percentage', type: 'percentage', defaultValue: 60, min: 0, max: 1000, step: 1, suffix: '%', tooltip: 'Markup on cost.' }
        ],
        naturalLanguageQueries: ["Calculate my markup", "What is my markup?", "Help me work out markup"],
        edgeCases: ["Zero product cost Negative markups representing losses Extremely high markup percentages"],
        calculate: (inputs) => {
            const cost = Number(inputs.unitCost) || 50;
            const markupPct = (Number(inputs.markupPercentage) || 60) / 100;

            const profit = cost * markupPct;
            const sellingPrice = cost + profit;
            const marginPct = (profit / sellingPrice) * 100;

            return {
                primaryOutput: { label: 'Calculated Selling Price', value: sellingPrice.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Gross Profit per Unit', value: profit.toFixed(2), prefix: '$' },
                    { label: 'Equivalent Profit Margin', value: `${marginPct.toFixed(2)}%` }
                ]
            };
        }
    },

    // 118. Unit Price Calculator
    {
        id: 'unit-price-calculator',
        name: 'Unit Price Calculator',
        category: 'finance-business',
        group: 'Budgeting & Everyday Money',
        bucket: 'Bucket B',
        tier: 1,
        phase: 3,
        monthlySearches: '4K',
        cpc: '$3.21',
        description: "A Unit Price Calculator compares costs per unit of measure across products. It helps consumers and businesses identify the most cost-effective option. The calculator supports weight, volume, quantity, and length measurements.",
        inputs: [
            { id: 'packagePrice', name: 'Package / Item Total Price', type: 'currency', defaultValue: 14.99, min: 0.01, step: 0.5, prefix: '$', tooltip: 'Total price of package.' },
            { id: 'quantity', name: 'Quantity / Volume in Package', type: 'number', defaultValue: 32, min: 0.01, step: 1, tooltip: 'Ounces, grams, count, liters.' },
            { id: 'unitLabel', name: 'Unit of Measure', type: 'dropdown', defaultValue: 'oz', options: [{ label: 'Ounces (oz)', value: 'oz' }, { label: 'Pounds (lbs)', value: 'lbs' }, { label: 'Count / Pieces', value: 'count' }, { label: 'Grams (g)', value: 'g' }, { label: 'Liters (L)', value: 'L' }], tooltip: 'Unit name.' }
        ],
        naturalLanguageQueries: ["Calculate my unit price", "What is my unit price?", "Help me work out unit price"],
        edgeCases: ["Zero quantity Unsupported measurement units Fractional quantities with precision issues"],
        calculate: (inputs) => {
            const price = Number(inputs.packagePrice) || 14.99;
            const qty = Math.max(0.001, Number(inputs.quantity) || 32);
            const unit = String(inputs.unitLabel || 'oz');

            const unitPrice = price / qty;

            return {
                primaryOutput: { label: `Unit Price (per ${unit})`, value: unitPrice.toFixed(3), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Package Cost', value: price.toFixed(2), prefix: '$' },
                    { label: 'Total Quantity', value: `${qty} ${unit}` }
                ]
            };
        }
    },

    // 119. Brokerage Calculator
    {
        id: 'brokerage-calculator',
        name: 'Brokerage Calculator',
        category: 'finance-business',
        group: 'Budgeting & Everyday Money',
        bucket: 'Bucket B',
        tier: 2,
        phase: 3,
        monthlySearches: '40K',
        cpc: '$2.51',
        description: "A Brokerage Calculator estimates transaction costs associated with stock, commodity, or derivatives trading. It includes brokerage fees, taxes, exchange charges, and regulatory fees. The calculator helps traders estimate net profit or loss after fees.",
        inputs: [
            { id: 'buyPrice', name: 'Share Buy Price', type: 'currency', defaultValue: 100, min: 0.01, step: 1, prefix: '$', tooltip: 'Purchase price.' },
            { id: 'sellPrice', name: 'Share Sell Price', type: 'currency', defaultValue: 125, min: 0.01, step: 1, prefix: '$', tooltip: 'Selling price.' },
            { id: 'sharesQuantity', name: 'Number of Shares Traded', type: 'number', defaultValue: 100, min: 1, step: 1, tooltip: 'Trade size.' },
            { id: 'brokerageFeeFlat', name: 'Broker Flat Commission Fee', type: 'currency', defaultValue: 4.95, min: 0, step: 1, prefix: '$', tooltip: 'Broker trade fee.' }
        ],
        naturalLanguageQueries: ["How old am I if I was born on March 15 1990?", "Calculate my age born 1985", "How many days old am I?"],
        edgeCases: ["Sell price below buy price Zero quantity trades Exchange-specific fee variations High-frequency trading rounding issues"],
        calculate: (inputs) => {
            const buy = Number(inputs.buyPrice) || 100;
            const sell = Number(inputs.sellPrice) || 125;
            const qty = Number(inputs.sharesQuantity) || 100;
            const fee = Number(inputs.brokerageFeeFlat) || 4.95;

            const buyTurnover = buy * qty;
            const sellTurnover = sell * qty;
            const grossProfit = sellTurnover - buyTurnover;
            const totalBrokerage = fee * 2; // buy + sell fee
            const netProfit = grossProfit - totalBrokerage;
            const roiPct = (netProfit / (buyTurnover + fee)) * 100;

            return {
                primaryOutput: { label: 'Net Trading Profit', value: netProfit.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Gross Trading Profit', value: grossProfit.toFixed(2), prefix: '$' },
                    { label: 'Total Brokerage Fees (Round-Trip)', value: totalBrokerage.toFixed(2), prefix: '$' },
                    { label: 'Net Return on Trade (ROI)', value: `${roiPct.toFixed(2)}%` }
                ]
            };
        }
    },

    // 120. Tip Calculator
    {
        id: 'tip-calculator',
        name: 'Tip Calculator',
        category: 'finance-business',
        group: 'Budgeting & Everyday Money',
        bucket: 'Bucket A',
        tier: 1,
        phase: 1,
        monthlySearches: '450K',
        cpc: '$0.88',
        description: "A Tip Calculator computes gratuity amounts for restaurant bills and shared expenses. It helps users quickly determine tip amounts and per-person totals. The calculator supports tax-inclusive and tax-exclusive tipping.",
        inputs: [
            { id: 'billAmount', name: 'Bill Amount', type: 'currency', defaultValue: 65, min: 0.01, step: 1, prefix: '$', tooltip: 'Total check amount.' },
            { id: 'tipPercentage', name: 'Tip Percentage', type: 'percentage', defaultValue: 18, min: 0, max: 50, step: 1, suffix: '%', tooltip: 'Tip rate (15%, 18%, 20%).' }
        ],
        naturalLanguageQueries: ["Calculate my tip", "What is my tip?", "Help me work out tip"],
        edgeCases: ["Negative bill amounts Zero people splitting bill Extremely high tip percentages"],
        calculate: (inputs) => {
            const bill = Number(inputs.billAmount) || 65;
            const pct = (Number(inputs.tipPercentage) || 18) / 100;

            const tip = bill * pct;
            const total = bill + tip;

            return {
                primaryOutput: { label: 'Tip Amount', value: tip.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Bill (Including Tip)', value: total.toFixed(2), prefix: '$' },
                    { label: '15% Standard Tip', value: (bill * 0.15).toFixed(2), prefix: '$' },
                    { label: '20% Generous Tip', value: (bill * 0.20).toFixed(2), prefix: '$' }
                ]
            };
        }
    },

    // 121. Discount Price Calculator
    {
        id: 'discount-price-calculator',
        name: 'Discount Price Calculator',
        category: 'finance-business',
        group: 'Budgeting & Everyday Money',
        bucket: 'Bucket B',
        tier: 1,
        phase: 3,
        monthlySearches: '2K',
        cpc: '$0.97',
        description: "A Discount Calculator estimates final prices after applying discounts or markdowns. It helps consumers and businesses calculate savings. The calculator supports fixed and percentage discounts.",
        inputs: [
            { id: 'originalPrice', name: 'Original Price', type: 'currency', defaultValue: 100, min: 0.01, step: 5, prefix: '$', tooltip: 'Original price.' },
            { id: 'discountPercentage', name: 'Discount Percentage', type: 'percentage', defaultValue: 20, min: 0, max: 100, step: 1, suffix: '%', tooltip: 'Discount rate.' }
        ],
        naturalLanguageQueries: ["Calculate my discount price", "What is my discount price?", "Help me work out discount price"],
        edgeCases: ["Discounts greater than 100% Negative prices Stacked discounts"],
        calculate: (inputs) => {
            const price = Number(inputs.originalPrice) || 100;
            const pct = (Number(inputs.discountPercentage) || 20) / 100;

            const discountAmount = price * pct;
            const finalPrice = price - discountAmount;

            return {
                primaryOutput: { label: 'Discounted Price', value: finalPrice.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Savings', value: discountAmount.toFixed(2), prefix: '$' },
                    { label: 'Original Price', value: price.toFixed(2), prefix: '$' }
                ]
            };
        }
    },
// 122. Mortgage Calculator UK
    {
        id: 'mortgage-calculator-uk',
        name: 'Mortgage Calculator UK',
        category: 'finance-business',
        group: 'Mortgage & Real Estate',
        bucket: 'Bucket C',
        tier: 2,
        phase: 2,
        monthlySearches: '110K',
        cpc: '$4.80',
        description: "A UK Mortgage Calculator computes monthly mortgage repayments, total interest, and Stamp Duty Land Tax (SDLT) across England and Northern Ireland property tiers.",
        inputs: [
            { id: 'propertyPrice', name: 'Property Purchase Price (£)', type: 'number', defaultValue: 325000, min: 25000, step: 5000, prefix: '£', tooltip: 'Agreed property purchase price in GBP.' },
            { id: 'depositAmount', name: 'Deposit Amount (£)', type: 'number', defaultValue: 50000, min: 0, step: 5000, prefix: '£', tooltip: 'Cash deposit provided.' },
            { id: 'interestRate', name: 'Annual Mortgage Interest Rate (%)', type: 'number', defaultValue: 4.65, min: 0.5, max: 20.0, step: 0.05, suffix: '%', tooltip: 'Lender initial fixed or variable rate.' },
            { id: 'mortgageTermYears', name: 'Mortgage Term (Years)', type: 'number', defaultValue: 25, min: 5, max: 40, step: 1, suffix: 'yrs', tooltip: 'Length of mortgage repayment term.' },
            { id: 'repaymentType', name: 'Repayment Type', type: 'dropdown', defaultValue: 'repayment', options: [{ label: 'Capital & Interest (Repayment)', value: 'repayment' }, { label: 'Interest-Only', value: 'interest_only' }], tooltip: 'Repayment method.' }
        ],
        naturalLanguageQueries: ["UK mortgage repayment calculator", "Calculate monthly mortgage payment in pounds", "Mortgage calculator UK with interest and stamp duty"],
        edgeCases: ["Deposit equals or exceeds property price", "Zero interest rate", "Interest only mortgage with balloon principal"],
        calculate: (inputs) => {
            const price = Number(inputs.propertyPrice) || 325000;
            const deposit = Math.min(price, Math.max(0, Number(inputs.depositAmount) || 50000));
            const rate = Number(inputs.interestRate) || 4.65;
            const years = Number(inputs.mortgageTermYears) || 25;
            const repType = String(inputs.repaymentType || 'repayment');

            const loanAmount = price - deposit;
            const ltv = (loanAmount / price) * 100;
            const monthlyRate = (rate / 100) / 12;
            const totalMonths = years * 12;

            let monthlyPayment = 0;
            let totalInterest = 0;
            let totalRepayment = 0;

            if (repType === 'interest_only') {
                monthlyPayment = loanAmount * monthlyRate;
                totalInterest = monthlyPayment * totalMonths;
                totalRepayment = totalInterest + loanAmount;
            } else {
                if (monthlyRate === 0) {
                    monthlyPayment = loanAmount / totalMonths;
                } else {
                    monthlyPayment = (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
                }
                totalRepayment = monthlyPayment * totalMonths;
                totalInterest = totalRepayment - loanAmount;
            }

            // UK SDLT standard residential tiers (England/NI)
            let sdlt = 0;
            if (price > 250000) {
                if (price <= 925000) {
                    sdlt += (price - 250000) * 0.05;
                } else if (price <= 1500000) {
                    sdlt += (925000 - 250000) * 0.05 + (price - 925000) * 0.10;
                } else {
                    sdlt += (925000 - 250000) * 0.05 + (1500000 - 925000) * 0.10 + (price - 1500000) * 0.12;
                }
            }

            return {
                primaryOutput: { label: 'Monthly Mortgage Payment', value: `£${Math.round(monthlyPayment).toLocaleString()}`, suffix: `per month (${repType === 'repayment' ? 'Capital + Interest' : 'Interest-Only'})` },
                secondaryMetrics: [
                    { label: 'Mortgage Loan Borrowed', value: `£${Math.round(loanAmount).toLocaleString()} (${ltv.toFixed(1)}% LTV)` },
                    { label: 'Total Interest Payable Over Term', value: `£${Math.round(totalInterest).toLocaleString()}` },
                    { label: 'Total Cost Over Term', value: `£${Math.round(totalRepayment).toLocaleString()}` },
                    { label: 'Estimated Stamp Duty (SDLT Standard)', value: `£${Math.round(sdlt).toLocaleString()}` }
                ]
            };
        }
    },
    // 123. Canadian Mortgage Calculator
    {
        id: 'canadian-mortgage-calculator',
        name: 'Canadian Mortgage Calculator',
        category: 'finance-business',
        group: 'Mortgage & Real Estate',
        bucket: 'Bucket C',
        tier: 2,
        phase: 2,
        monthlySearches: '85K',
        cpc: '$5.20',
        description: "A Canadian Mortgage Calculator computes payments using official Canadian semi-annual compounding rules, CMHC default insurance premiums, and stress test qualifying rates.",
        inputs: [
            { id: 'homePrice', name: 'Home Purchase Price ($ CAD)', type: 'number', defaultValue: 650000, min: 50000, step: 10000, prefix: '$', tooltip: 'Purchase price in CAD.' },
            { id: 'downPaymentDollars', name: 'Down Payment ($ CAD)', type: 'number', defaultValue: 100000, min: 0, step: 5000, prefix: '$', tooltip: 'Down payment amount.' },
            { id: 'mortgageRate', name: 'Mortgage Interest Rate (%)', type: 'number', defaultValue: 4.89, min: 0.5, max: 20.0, step: 0.05, suffix: '%', tooltip: 'Contract interest rate (compounded semi-annually).' },
            { id: 'amortizationYears', name: 'Amortization Period (Years)', type: 'dropdown', defaultValue: 25, options: [{ label: '25 Years (Standard Insured)', value: 25 }, { label: '30 Years (Uninsured / 20%+ Down)', value: 30 }, { label: '20 Years', value: 20 }, { label: '15 Years', value: 15 }], tooltip: 'Total amortization duration.' },
            { id: 'paymentSchedule', name: 'Payment Frequency', type: 'dropdown', defaultValue: 'monthly', options: [{ label: 'Monthly (12/year)', value: 'monthly' }, { label: 'Bi-Weekly (26/year)', value: 'biweekly' }, { label: 'Accelerated Bi-Weekly (Fast Payoff)', value: 'acc_biweekly' }], tooltip: 'Payment schedule.' }
        ],
        naturalLanguageQueries: ["Canadian mortgage calculator with CMHC insurance", "Calculate mortgage payment Canada semi annual compounding", "Mortgage stress test Canada calculator"],
        edgeCases: ["Down payment less than statutory 5% minimum", "Purchase price over $1M with less than 20% down", "Zero interest rate"],
        calculate: (inputs) => {
            const price = Number(inputs.homePrice) || 650000;
            const down = Math.min(price, Math.max(0, Number(inputs.downPaymentDollars) || 100000));
            const rate = Number(inputs.mortgageRate) || 4.89;
            const years = Number(inputs.amortizationYears) || 25;
            const freq = String(inputs.paymentSchedule || 'monthly');

            const downPct = (down / price) * 100;
            let cmhcPremiumPct = 0;
            if (downPct < 20) {
                if (downPct >= 15) cmhcPremiumPct = 0.028;
                else if (downPct >= 10) cmhcPremiumPct = 0.031;
                else cmhcPremiumPct = 0.040;
            }

            const baseLoan = price - down;
            const cmhcAmount = baseLoan * cmhcPremiumPct;
            const totalInsuredLoan = baseLoan + cmhcAmount;

            // Canadian compounding rule: semi-annual compounding converted to effective monthly
            // r_eff = (1 + r/2)^(2/12) - 1
            const rSemi = (rate / 100) / 2;
            const rMonthlyEff = Math.pow(1 + rSemi, 2 / 12) - 1;
            const totalMonths = years * 12;

            const monthlyBasePayment = (totalInsuredLoan * (rMonthlyEff * Math.pow(1 + rMonthlyEff, totalMonths))) / (Math.pow(1 + rMonthlyEff, totalMonths) - 1);

            let periodicPayment = monthlyBasePayment;
            let paymentLabel = 'Monthly Payment';
            if (freq === 'biweekly') {
                periodicPayment = (monthlyBasePayment * 12) / 26;
                paymentLabel = 'Bi-Weekly Payment';
            } else if (freq === 'acc_biweekly') {
                periodicPayment = monthlyBasePayment / 2;
                paymentLabel = 'Accelerated Bi-Weekly Payment';
            }

            const totalPaid = freq === 'acc_biweekly' ? (periodicPayment * 26 * (years * 0.88)) : (monthlyBasePayment * totalMonths);
            const totalInterest = totalPaid - totalInsuredLoan;
            const qualifyingRate = Math.max(5.25, rate + 2.0); // Canadian Federal Stress Test

            return {
                primaryOutput: { label: paymentLabel, value: `$${Math.round(periodicPayment).toLocaleString()} CAD`, suffix: `${years}-Yr Amortization (${freq.replace('_', ' ').toUpperCase()})` },
                secondaryMetrics: [
                    { label: 'Mortgage Loan (incl. CMHC Insurance)', value: `$${Math.round(totalInsuredLoan).toLocaleString()} (CMHC Fee: $${Math.round(cmhcAmount).toLocaleString()})` },
                    { label: 'Total Interest Over Amortization', value: `$${Math.round(totalInterest).toLocaleString()}` },
                    { label: 'Canada Stress Test Qualifying Rate', value: `${qualifyingRate.toFixed(2)}% (Contract Rate + 2%)` },
                    { label: 'Down Payment Equity Ratio', value: `${downPct.toFixed(1)}% ($${Math.round(down).toLocaleString()} CAD)` }
                ]
            };
        }
    },
    // 124. VAT Calculator
    {
        id: 'vat-calculator',
        name: 'VAT Calculator',
        category: 'finance-business',
        group: 'Tax & Compliance',
        bucket: 'Bucket C',
        tier: 2,
        phase: 2,
        monthlySearches: '95K',
        cpc: '$1.45',
        description: "A Value Added Tax (VAT) Calculator adds or removes VAT from gross or net amounts using standard regional rates (UK, EU, Global) or custom tax rates.",
        inputs: [
            { id: 'amount', name: 'Transaction Amount', type: 'number', defaultValue: 500, min: 0.01, step: 10, prefix: '£/€/$', tooltip: 'Input invoice or purchase amount.' },
            { id: 'vatRate', name: 'VAT Rate (%)', type: 'dropdown', defaultValue: 20, options: [{ label: '20% (UK Standard / France)', value: 20 }, { label: '19% (Germany Standard)', value: 19 }, { label: '21% (Spain / Netherlands / Belgium)', value: 21 }, { label: '5% (UK Reduced Energy/Renovation)', value: 5 }, { label: '10% (Australia / Global GST/VAT)', value: 10 }, { label: '15% (New Zealand / Saudi Arabia)', value: 15 }], tooltip: 'Applicable VAT tax rate.' },
            { id: 'mode', name: 'Calculation Operation', type: 'dropdown', defaultValue: 'add_vat', options: [{ label: 'Add VAT (Net to Gross Total)', value: 'add_vat' }, { label: 'Remove VAT (Gross to Net Amount)', value: 'remove_vat' }], tooltip: 'Tax direction.' }
        ],
        naturalLanguageQueries: ["VAT calculator add or remove VAT", "Calculate 20% VAT in pounds or euros", "Reverse VAT calculator extract tax"],
        edgeCases: ["Zero transaction amount", "Zero percent VAT rate", "Negative numbers"],
        calculate: (inputs) => {
            const amount = Number(inputs.amount) || 500;
            const rate = Number(inputs.vatRate) || 20;
            const mode = String(inputs.mode || 'add_vat');

            let net = 0;
            let vat = 0;
            let gross = 0;

            if (mode === 'add_vat') {
                net = amount;
                vat = net * (rate / 100);
                gross = net + vat;
            } else {
                gross = amount;
                net = gross / (1 + (rate / 100));
                vat = gross - net;
            }

            return {
                primaryOutput: { label: mode === 'add_vat' ? 'Gross Total (incl. VAT)' : 'Net Amount (excl. VAT)', value: `$${gross.toFixed(2)}`, suffix: `VAT Amount: $${vat.toFixed(2)} (${rate}%)` },
                secondaryMetrics: [
                    { label: 'Net Base Amount (excl. Tax)', value: `$${net.toFixed(2)}` },
                    { label: 'Value Added Tax (VAT) Amount', value: `$${vat.toFixed(2)}` },
                    { label: 'Gross Invoice Total (incl. Tax)', value: `$${gross.toFixed(2)}` },
                    { label: 'Effective Tax Share of Gross', value: `${((vat / gross) * 100).toFixed(1)}%` }
                ]
            };
        }
    },
    // 125. Stamp Duty Calculator
    {
        id: 'stamp-duty-calculator',
        name: 'Stamp Duty Calculator',
        category: 'finance-business',
        group: 'Mortgage & Real Estate',
        bucket: 'Bucket C',
        tier: 2,
        phase: 2,
        monthlySearches: '70K',
        cpc: '$4.10',
        description: "A Stamp Duty Land Tax (SDLT) Calculator estimates progressive property tax liabilities across England & Northern Ireland for first-time buyers, home movers, and additional properties.",
        inputs: [
            { id: 'purchasePrice', name: 'Property Purchase Price (£)', type: 'number', defaultValue: 450000, min: 10000, step: 5000, prefix: '£', tooltip: 'Total property purchase consideration.' },
            { id: 'buyerProfile', name: 'Buyer Circumstance', type: 'dropdown', defaultValue: 'mover', options: [{ label: 'Home Mover / Standard Main Residence', value: 'mover' }, { label: 'First-Time Buyer (FTB Relief)', value: 'first_time_buyer' }, { label: 'Additional Property / Buy-to-Let (+3% Surcharge)', value: 'additional_property' }], tooltip: 'Buyer profile determines tax bands.' },
            { id: 'nonUkResident', name: 'Non-UK Resident Surcharge (+2%)', type: 'dropdown', defaultValue: 'no', options: [{ label: 'No (UK Resident)', value: 'no' }, { label: 'Yes (+2% Non-Resident Surcharge)', value: 'yes' }], tooltip: 'Non-resident surcharge.' }
        ],
        naturalLanguageQueries: ["Stamp duty calculator UK property", "How much SDLT will I pay on 400k house", "First time buyer stamp duty relief calculator"],
        edgeCases: ["Purchase price under £250,000 threshold", "First time buyer property exceeding £625,000 cap", "Zero purchase price"],
        calculate: (inputs) => {
            const price = Number(inputs.purchasePrice) || 450000;
            const profile = String(inputs.buyerProfile || 'mover');
            const nonUk = String(inputs.nonUkResident || 'no') === 'yes';

            const surcharge = (profile === 'additional_property' ? 0.03 : 0.0) + (nonUk ? 0.02 : 0.0);

            let sdlt = 0;
            if (profile === 'first_time_buyer' && price <= 625000) {
                // First-Time Buyer Relief: 0% up to £425k, 5% on portion between £425k and £625k
                if (price > 425000) {
                    sdlt += (price - 425000) * 0.05;
                }
            } else {
                // Standard England/NI residential bands
                if (price > 250000) {
                    const band1 = Math.min(price, 925000) - 250000;
                    sdlt += band1 * 0.05;
                }
                if (price > 925000) {
                    const band2 = Math.min(price, 1500000) - 925000;
                    sdlt += band2 * 0.10;
                }
                if (price > 1500000) {
                    const band3 = price - 1500000;
                    sdlt += band3 * 0.12;
                }
            }

            // Surcharge applies to the entire purchase price
            const surchargeTotal = price * surcharge;
            const totalTax = sdlt + surchargeTotal;
            const effectiveRate = price > 0 ? (totalTax / price) * 100 : 0;

            return {
                primaryOutput: { label: 'Total Stamp Duty (SDLT) Payable', value: `£${Math.round(totalTax).toLocaleString()}`, suffix: `${effectiveRate.toFixed(2)}% Effective Tax Rate` },
                secondaryMetrics: [
                    { label: 'Base Progressive SDLT', value: `£${Math.round(sdlt).toLocaleString()}` },
                    { label: 'Additional Surcharges (Buy-to-Let / Non-UK)', value: `£${Math.round(surchargeTotal).toLocaleString()} (${(surcharge * 100).toFixed(0)}%)` },
                    { label: 'Effective Rate on Purchase Price', value: `${effectiveRate.toFixed(2)}%` },
                    { label: 'Total Capital Needed (incl. Tax)', value: `£${Math.round(price + totalTax).toLocaleString()}` }
                ]
            };
        }
    },
    // 126. SIP Calculator
    {
        id: 'sip-calculator',
        name: 'SIP Calculator',
        category: 'finance-business',
        group: 'Investments & Wealth',
        bucket: 'Bucket C',
        tier: 1,
        phase: 1,
        monthlySearches: '350K',
        cpc: '$1.85',
        description: "A Systematic Investment Plan (SIP) Calculator computes the accumulated maturity wealth and compounding returns of monthly mutual fund investments.",
        inputs: [
            { id: 'monthlyInvestment', name: 'Monthly Investment Amount (₹ / $)', type: 'number', defaultValue: 10000, min: 500, step: 500, prefix: '₹', tooltip: 'Amount invested every month.' },
            { id: 'expectedReturnRate', name: 'Expected Annual Return Rate (%)', type: 'number', defaultValue: 12.5, min: 1, max: 30, step: 0.5, suffix: '%', tooltip: 'Historical mutual fund return rate.' },
            { id: 'investmentPeriodYears', name: 'Investment Horizon (Years)', type: 'number', defaultValue: 15, min: 1, max: 40, step: 1, suffix: 'yrs', tooltip: 'Tenure of systematic investment.' }
        ],
        naturalLanguageQueries: ["SIP calculator mutual fund returns", "Calculate 15 year SIP compounding in rupees", "Systematic investment plan maturity value"],
        edgeCases: ["Zero return rate", "Very high return rates exceeding 30%", "1 year short term horizon"],
        calculate: (inputs) => {
            const p = Number(inputs.monthlyInvestment) || 10000;
            const r = Number(inputs.expectedReturnRate) || 12.5;
            const y = Number(inputs.investmentPeriodYears) || 15;

            const n = y * 12;
            const i = (r / 100) / 12;

            // Compound monthly SIP formula: M = P * ((1+i)^n - 1) / i * (1+i)
            const totalInvested = p * n;
            let maturityValue = 0;
            if (i === 0) {
                maturityValue = totalInvested;
            } else {
                maturityValue = p * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
            }

            const wealthGain = maturityValue - totalInvested;
            const wealthMultiplier = totalInvested > 0 ? (maturityValue / totalInvested) : 1;

            return {
                primaryOutput: { label: 'Total Expected Corpus', value: `₹${Math.round(maturityValue).toLocaleString()}`, suffix: `${wealthMultiplier.toFixed(1)}x Wealth Multiplier` },
                secondaryMetrics: [
                    { label: 'Total Amount Invested', value: `₹${Math.round(totalInvested).toLocaleString()}` },
                    { label: 'Estimated Wealth Gain (Returns)', value: `₹${Math.round(wealthGain).toLocaleString()}` },
                    { label: 'Total Months Invested', value: `${n} Months (${y} Years)` },
                    { label: 'Return on Capital Ratio', value: `+${((wealthGain / totalInvested) * 100).toFixed(0)}% Profit` }
                ]
            };
        }
    },
    // 127. EMI Calculator
    {
        id: 'emi-calculator',
        name: 'EMI Calculator',
        category: 'finance-business',
        group: 'Loans & Credit',
        bucket: 'Bucket C',
        tier: 1,
        phase: 1,
        monthlySearches: '450K',
        cpc: '$2.15',
        description: "An Equated Monthly Installment (EMI) Calculator computes monthly loan repayments, total interest payable, and amortization breakdown for home, car, or personal loans.",
        inputs: [
            { id: 'loanAmount', name: 'Loan Principal Amount (₹ / $)', type: 'number', defaultValue: 3500000, min: 10000, step: 50000, prefix: '₹', tooltip: 'Total borrowed loan amount.' },
            { id: 'interestRate', name: 'Annual Interest Rate (%)', type: 'number', defaultValue: 8.75, min: 1, max: 36, step: 0.25, suffix: '%', tooltip: 'Reducing balance interest rate.' },
            { id: 'tenureYears', name: 'Loan Tenure (Years)', type: 'number', defaultValue: 20, min: 1, max: 30, step: 1, suffix: 'yrs', tooltip: 'Repayment tenure in years.' }
        ],
        naturalLanguageQueries: ["EMI calculator for home loan", "Calculate monthly EMI in rupees with interest breakdown", "Car loan EMI calculator"],
        edgeCases: ["Zero interest rate", "Loan tenure under 1 year", "Extremely large loan amounts"],
        calculate: (inputs) => {
            const p = Number(inputs.loanAmount) || 3500000;
            const rAnnual = Number(inputs.interestRate) || 8.75;
            const years = Number(inputs.tenureYears) || 20;

            const n = years * 12;
            const r = (rAnnual / 100) / 12;

            // Reducing balance formula: E = P * r * (1+r)^n / ((1+r)^n - 1)
            let emi = 0;
            if (r === 0) {
                emi = p / n;
            } else {
                emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            }

            const totalPayment = emi * n;
            const totalInterest = totalPayment - p;
            const interestRatio = (totalInterest / totalPayment) * 100;

            return {
                primaryOutput: { label: 'Monthly Loan EMI', value: `₹${Math.round(emi).toLocaleString()}`, suffix: `for ${n} months (${years} yrs)` },
                secondaryMetrics: [
                    { label: 'Total Interest Payable', value: `₹${Math.round(totalInterest).toLocaleString()}` },
                    { label: 'Total Amount Payable (Principal + Interest)', value: `₹${Math.round(totalPayment).toLocaleString()}` },
                    { label: 'Principal Loan Amount', value: `₹${Math.round(p).toLocaleString()}` },
                    { label: 'Interest Share of Total Payment', value: `${interestRatio.toFixed(1)}%` }
                ]
            };
        }
    },
    // 128. FD Calculator
    {
        id: 'fd-calculator',
        name: 'FD Calculator',
        category: 'finance-business',
        group: 'Investments & Wealth',
        bucket: 'Bucket C',
        tier: 1,
        phase: 1,
        monthlySearches: '180K',
        cpc: '$1.10',
        description: "A Fixed Deposit (FD) Calculator computes maturity payouts and cumulative compound interest earned across bank and post office term deposits.",
        inputs: [
            { id: 'principal', name: 'Total Deposit Amount (₹ / $)', type: 'number', defaultValue: 500000, min: 1000, step: 10000, prefix: '₹', tooltip: 'Lump sum deposit amount.' },
            { id: 'interestRate', name: 'Annual FD Interest Rate (%)', type: 'number', defaultValue: 7.25, min: 1, max: 15, step: 0.1, suffix: '%', tooltip: 'Bank contracted FD rate.' },
            { id: 'tenureYears', name: 'Tenure (Years)', type: 'number', defaultValue: 5, min: 0.25, max: 10, step: 0.5, suffix: 'yrs', tooltip: 'Term deposit duration.' },
            { id: 'compoundingFrequency', name: 'Compounding Frequency', type: 'dropdown', defaultValue: 'quarterly', options: [{ label: 'Quarterly (Standard Bank Practice)', value: 'quarterly' }, { label: 'Monthly', value: 'monthly' }, { label: 'Half-Yearly', value: 'semi_annual' }, { label: 'Annually', value: 'annual' }], tooltip: 'Interest compounding cycle.' }
        ],
        naturalLanguageQueries: ["FD calculator maturity amount", "Calculate fixed deposit return with quarterly compounding", "Bank FD interest calculator"],
        edgeCases: ["Short term FD under 1 year", "Zero interest rate", "Senior citizen bonus rates"],
        calculate: (inputs) => {
            const p = Number(inputs.principal) || 500000;
            const r = Number(inputs.interestRate) || 7.25;
            const t = Number(inputs.tenureYears) || 5;
            const freq = String(inputs.compoundingFrequency || 'quarterly');

            let n = 4; // quarterly
            if (freq === 'monthly') n = 12;
            else if (freq === 'semi_annual') n = 2;
            else if (freq === 'annual') n = 1;

            // A = P * (1 + r/n)^(n*t)
            const maturityAmount = p * Math.pow(1 + ((r / 100) / n), n * t);
            const totalInterest = maturityAmount - p;
            const effectiveApy = (Math.pow(1 + ((r / 100) / n), n) - 1) * 100;

            return {
                primaryOutput: { label: 'Total Maturity Value', value: `₹${Math.round(maturityAmount).toLocaleString()}`, suffix: `Total Interest: ₹${Math.round(totalInterest).toLocaleString()}` },
                secondaryMetrics: [
                    { label: 'Initial Principal Deposit', value: `₹${Math.round(p).toLocaleString()}` },
                    { label: 'Total Compound Interest Earned', value: `₹${Math.round(totalInterest).toLocaleString()}` },
                    { label: 'Effective Annual Yield (APY)', value: `${effectiveApy.toFixed(2)}%` },
                    { label: 'Compounding Basis', value: `${freq.toUpperCase()} (${n}x per year)` }
                ]
            };
        }
    },
    // 129. RD Calculator
    {
        id: 'rd-calculator',
        name: 'RD Calculator',
        category: 'finance-business',
        group: 'Investments & Wealth',
        bucket: 'Bucket C',
        tier: 2,
        phase: 2,
        monthlySearches: '75K',
        cpc: '$0.95',
        description: "A Recurring Deposit (RD) Calculator computes maturity amounts and quarterly compounded interest on regular monthly deposits.",
        inputs: [
            { id: 'monthlyDeposit', name: 'Monthly Deposit Amount (₹ / $)', type: 'number', defaultValue: 5000, min: 500, step: 500, prefix: '₹', tooltip: 'Amount deposited every month.' },
            { id: 'interestRate', name: 'Annual Interest Rate (%)', type: 'number', defaultValue: 6.80, min: 1, max: 15, step: 0.1, suffix: '%', tooltip: 'RD interest rate.' },
            { id: 'tenureMonths', name: 'Tenure (Months)', type: 'number', defaultValue: 36, min: 6, max: 120, step: 6, suffix: 'mo', tooltip: 'Total duration in months.' }
        ],
        naturalLanguageQueries: ["RD calculator recurring deposit maturity", "Post office RD calculator with interest", "Calculate monthly RD maturity amount"],
        edgeCases: ["Tenure less than 6 months", "Zero interest rate", "Premature withdrawal penalty"],
        calculate: (inputs) => {
            const p = Number(inputs.monthlyDeposit) || 5000;
            const r = (Number(inputs.interestRate) || 6.80) / 100;
            const n = Number(inputs.tenureMonths) || 36;

            // Bank RD Formula: Quarterly compounding applied to each installment
            // M = sum_{k=1}^n P * (1 + r/4)^(4*(n - k + 1)/12)
            let maturity = 0;
            for (let k = 1; k <= n; k++) {
                const quarters = (n - k + 1) / 3;
                maturity += p * Math.pow(1 + r / 4, quarters);
            }

            const totalDeposited = p * n;
            const totalInterest = maturity - totalDeposited;

            return {
                primaryOutput: { label: 'Maturity Amount', value: `₹${Math.round(maturity).toLocaleString()}`, suffix: `${n} Monthly Installments` },
                secondaryMetrics: [
                    { label: 'Total Invested Capital', value: `₹${Math.round(totalDeposited).toLocaleString()}` },
                    { label: 'Total Interest Earned', value: `₹${Math.round(totalInterest).toLocaleString()}` },
                    { label: 'Annual Compound Growth', value: `+${((totalInterest / totalDeposited) * 100).toFixed(1)}% Return` },
                    { label: 'Quarterly Compounding Frequency', value: 'Bank Standard (4 Quarters / Yr)' }
                ]
            };
        }
    },
    // 130. PPF Calculator
    {
        id: 'ppf-calculator',
        name: 'PPF Calculator',
        category: 'finance-business',
        group: 'Investments & Wealth',
        bucket: 'Bucket C',
        tier: 1,
        phase: 1,
        monthlySearches: '160K',
        cpc: '$1.05',
        description: "A Public Provident Fund (PPF) Calculator projects maturity amounts, tax-free annual interest, and 15-year statutory compounding under government guaranteed EEE tax rules.",
        inputs: [
            { id: 'annualDeposit', name: 'Annual Contribution Amount (₹)', type: 'number', defaultValue: 150000, min: 500, max: 150000, step: 5000, prefix: '₹', tooltip: 'Annual deposit (Statutory ceiling: ₹1,50,000 per financial year).' },
            { id: 'interestRate', name: 'Current Government Interest Rate (%)', type: 'number', defaultValue: 7.10, min: 4.0, max: 12.0, step: 0.1, suffix: '%', tooltip: 'Current Ministry of Finance benchmark PPF rate.' },
            { id: 'tenureYears', name: 'Tenure (Years)', type: 'dropdown', defaultValue: 15, options: [{ label: '15 Years (Statutory Lock-in)', value: 15 }, { label: '20 Years (1 Extension of 5 Years)', value: 20 }, { label: '25 Years (2 Extensions of 5 Years)', value: 25 }, { label: '30 Years (3 Extensions)', value: 30 }], tooltip: 'Account duration.' }
        ],
        naturalLanguageQueries: ["PPF calculator 15 years maturity", "Calculate Public Provident Fund returns in India", "PPF interest tax free calculator"],
        edgeCases: ["Deposit exceeding statutory ₹1.5L annual cap", "Extension periods beyond 15 years", "Zero deposit"],
        calculate: (inputs) => {
            const annual = Math.min(150000, Math.max(500, Number(inputs.annualDeposit) || 150000));
            const rate = (Number(inputs.interestRate) || 7.10) / 100;
            const years = Number(inputs.tenureYears) || 15;

            let balance = 0;
            let totalInvested = 0;

            for (let y = 1; y <= years; y++) {
                balance = (balance + annual) * (1 + rate);
                totalInvested += annual;
            }

            const totalInterest = balance - totalInvested;

            return {
                primaryOutput: { label: 'PPF Maturity Balance', value: `₹${Math.round(balance).toLocaleString()}`, suffix: `100% Tax-Free (EEE Status)` },
                secondaryMetrics: [
                    { label: 'Total Invested Capital', value: `₹${Math.round(totalInvested).toLocaleString()} (${years} Years)` },
                    { label: 'Total Tax-Free Interest Earned', value: `₹${Math.round(totalInterest).toLocaleString()}` },
                    { label: 'Tax Status', value: 'Exempt-Exempt-Exempt (Section 80C)' },
                    { label: 'Wealth Multiple', value: `${(balance / totalInvested).toFixed(2)}x Deposited Principal` }
                ]
            };
        }
    },
    // 131. SWP Calculator
    {
        id: 'swp-calculator',
        name: 'SWP Calculator',
        category: 'finance-business',
        group: 'Investments & Wealth',
        bucket: 'Bucket C',
        tier: 2,
        phase: 2,
        monthlySearches: '80K',
        cpc: '$1.40',
        description: "A Systematic Withdrawal Plan (SWP) Calculator models regular monthly cash flow generation from a mutual fund investment while simulating ongoing portfolio growth.",
        inputs: [
            { id: 'initialCorpus', name: 'Total Initial Investment Corpus (₹ / $)', type: 'number', defaultValue: 5000000, min: 50000, step: 100000, prefix: '₹', tooltip: 'Initial lump sum corpus.' },
            { id: 'monthlyWithdrawal', name: 'Monthly Withdrawal Amount (₹ / $)', type: 'number', defaultValue: 35000, min: 1000, step: 1000, prefix: '₹', tooltip: 'Fixed monthly cash payout.' },
            { id: 'annualReturnRate', name: 'Expected Annual Portfolio Return (%)', type: 'number', defaultValue: 10.0, min: 1, max: 25, step: 0.5, suffix: '%', tooltip: 'Expected mutual fund annual growth rate.' },
            { id: 'durationYears', name: 'Withdrawal Duration (Years)', type: 'number', defaultValue: 15, min: 1, max: 40, step: 1, suffix: 'yrs', tooltip: 'Withdrawal horizon in years.' }
        ],
        naturalLanguageQueries: ["SWP calculator monthly withdrawal returns", "Calculate systematic withdrawal plan corpus longevity", "Mutual fund SWP pension calculator"],
        edgeCases: ["Monthly withdrawal exceeding portfolio growth rate", "Corpus depletion to zero before tenure ends", "High inflation adjustments"],
        calculate: (inputs) => {
            const corpus = Number(inputs.initialCorpus) || 5000000;
            const w = Number(inputs.monthlyWithdrawal) || 35000;
            const r = (Number(inputs.annualReturnRate) || 10.0) / 100 / 12;
            const years = Number(inputs.durationYears) || 15;
            const totalMonths = years * 12;

            let balance = corpus;
            let totalWithdrawn = 0;
            let depletedMonth = 0;

            for (let m = 1; m <= totalMonths; m++) {
                if (balance <= 0) {
                    if (depletedMonth === 0) depletedMonth = m - 1;
                    break;
                }
                balance = balance - w;
                if (balance > 0) {
                    balance = balance * (1 + r);
                } else {
                    balance = 0;
                    if (depletedMonth === 0) depletedMonth = m;
                }
                totalWithdrawn += w;
            }

            const isSustainable = balance > 0;

            return {
                primaryOutput: { label: 'Remaining Portfolio Corpus', value: `₹${Math.round(balance).toLocaleString()}`, suffix: isSustainable ? 'Sustainable Cash Flow' : `Depleted at Year ${(depletedMonth / 12).toFixed(1)}` },
                secondaryMetrics: [
                    { label: 'Total Amount Withdrawn', value: `₹${Math.round(totalWithdrawn).toLocaleString()}` },
                    { label: 'Net Overall Financial Gain', value: `₹${Math.round((balance + totalWithdrawn) - corpus).toLocaleString()}` },
                    { label: 'Annual Withdrawal Rate', value: `${((w * 12 / corpus) * 100).toFixed(2)}% of Initial Corpus` },
                    { label: 'Corpus Longevity Status', value: isSustainable ? `Survives Full ${years} Years with Capital Growth` : 'Warning: High Withdrawal Rate Depletes Corpus' }
                ]
            };
        }
    },
    // 132. Step-Up SIP Calculator
    {
        id: 'step-up-sip-calculator',
        name: 'Step-Up SIP Calculator',
        category: 'finance-business',
        group: 'Investments & Wealth',
        bucket: 'Bucket C',
        tier: 2,
        phase: 2,
        monthlySearches: '65K',
        cpc: '$1.60',
        description: "A Step-Up (Top-Up) SIP Calculator calculates accelerated wealth growth when increasing monthly mutual fund contributions annually in line with salary increments.",
        inputs: [
            { id: 'initialMonthlySip', name: 'Initial Monthly SIP Amount (₹ / $)', type: 'number', defaultValue: 15000, min: 500, step: 1000, prefix: '₹', tooltip: 'Starting monthly investment.' },
            { id: 'annualStepUpPercent', name: 'Annual Top-Up / Step-Up Rate (%)', type: 'number', defaultValue: 10, min: 1, max: 50, step: 1, suffix: '%', tooltip: 'Percentage increase in SIP amount every year.' },
            { id: 'expectedReturnRate', name: 'Expected Annual Return (%)', type: 'number', defaultValue: 13.0, min: 1, max: 25, step: 0.5, suffix: '%', tooltip: 'Expected mutual fund annual return.' },
            { id: 'tenureYears', name: 'Investment Horizon (Years)', type: 'number', defaultValue: 15, min: 1, max: 35, step: 1, suffix: 'yrs', tooltip: 'Total investment duration.' }
        ],
        naturalLanguageQueries: ["Step up SIP calculator with annual increment", "Top up SIP mutual fund return calculator", "Calculate wealth from 10 percent yearly step up SIP"],
        edgeCases: ["Step-up percentage exceeding 50%", "Zero return rate", "Comparison against static standard SIP"],
        calculate: (inputs) => {
            const p0 = Number(inputs.initialMonthlySip) || 15000;
            const stepUpPct = (Number(inputs.annualStepUpPercent) || 10) / 100;
            const rAnnual = (Number(inputs.expectedReturnRate) || 13.0) / 100;
            const rMonthly = rAnnual / 12;
            const years = Number(inputs.tenureYears) || 15;

            let totalBalance = 0;
            let totalInvested = 0;
            let currentMonthlySip = p0;

            // Static SIP benchmark for comparison
            let staticBalance = 0;
            let staticInvested = p0 * years * 12;
            const nTotal = years * 12;
            staticBalance = p0 * ((Math.pow(1 + rMonthly, nTotal) - 1) / rMonthly) * (1 + rMonthly);

            for (let y = 1; y <= years; y++) {
                for (let m = 1; m <= 12; m++) {
                    const monthsRemaining = (years - y) * 12 + (12 - m + 1);
                    totalBalance += currentMonthlySip * Math.pow(1 + rMonthly, monthsRemaining);
                    totalInvested += currentMonthlySip;
                }
                currentMonthlySip = currentMonthlySip * (1 + stepUpPct);
            }

            const stepUpAdvantage = totalBalance - staticBalance;

            return {
                primaryOutput: { label: 'Step-Up Maturity Wealth', value: `₹${Math.round(totalBalance).toLocaleString()}`, suffix: `+₹${Math.round(stepUpAdvantage).toLocaleString()} vs Standard SIP` },
                secondaryMetrics: [
                    { label: 'Total Invested Capital', value: `₹${Math.round(totalInvested).toLocaleString()}` },
                    { label: 'Estimated Wealth Gain', value: `₹${Math.round(totalBalance - totalInvested).toLocaleString()}` },
                    { label: 'Final Year Monthly SIP Amount', value: `₹${Math.round(currentMonthlySip / (1 + stepUpPct)).toLocaleString()} / month` },
                    { label: 'Static Non-Step-Up SIP Benchmark', value: `₹${Math.round(staticBalance).toLocaleString()} (Invested: ₹${Math.round(staticInvested).toLocaleString()})` }
                ]
            };
        }
    },
    // 133. GST Calculator
    {
        id: 'gst-calculator',
        name: 'GST Calculator',
        category: 'finance-business',
        group: 'Tax & Compliance',
        bucket: 'Bucket C',
        tier: 1,
        phase: 1,
        monthlySearches: '290K',
        cpc: '$0.85',
        description: "A Goods and Services Tax (GST) Calculator calculates pre-tax and post-tax prices with CGST, SGST, and IGST breakdowns across standard tax slabs.",
        inputs: [
            { id: 'baseAmount', name: 'Transaction Amount (₹ / $)', type: 'number', defaultValue: 10000, min: 1, step: 100, prefix: '₹', tooltip: 'Base net or gross amount.' },
            { id: 'gstSlabRate', name: 'GST Slab Rate (%)', type: 'dropdown', defaultValue: 18, options: [{ label: '18% (Standard Services & Goods)', value: 18 }, { label: '12% (Processed Goods & Standard Items)', value: 12 }, { label: '5% (Essential Commodities & Transport)', value: 5 }, { label: '28% (Luxury & De-merit Goods)', value: 28 }, { label: '3% (Gold & Precious Metals)', value: 3 }, { label: '0% (Exempt)', value: 0 }], tooltip: 'Statutory GST slab rate.' },
            { id: 'supplyType', name: 'Supply Region Type', type: 'dropdown', defaultValue: 'intra_state', options: [{ label: 'Intra-State (CGST 50% + SGST 50%)', value: 'intra_state' }, { label: 'Inter-State (IGST 100%)', value: 'inter_state' }], tooltip: 'Supply location.' },
            { id: 'calcType', name: 'Tax Direction', type: 'dropdown', defaultValue: 'exclusive', options: [{ label: 'Add GST (Exclusive -> Gross Total)', value: 'exclusive' }, { label: 'Remove GST (Inclusive -> Net Base)', value: 'inclusive' }], tooltip: 'Tax addition or extraction.' }
        ],
        naturalLanguageQueries: ["GST calculator 18 percent online", "Calculate CGST and SGST split", "Reverse GST calculator extract tax from bill"],
        edgeCases: ["Zero transaction amount", "Exempt 0% GST rate", "Inter-state IGST calculation"],
        calculate: (inputs) => {
            const amount = Number(inputs.baseAmount) || 10000;
            const rate = Number(inputs.gstSlabRate) || 18;
            const supply = String(inputs.supplyType || 'intra_state');
            const mode = String(inputs.calcType || 'exclusive');

            let net = 0;
            let gst = 0;
            let gross = 0;

            if (mode === 'exclusive') {
                net = amount;
                gst = net * (rate / 100);
                gross = net + gst;
            } else {
                gross = amount;
                net = gross / (1 + (rate / 100));
                gst = gross - net;
            }

            const cgst = supply === 'intra_state' ? (gst / 2) : 0;
            const sgst = supply === 'intra_state' ? (gst / 2) : 0;
            const igst = supply === 'inter_state' ? gst : 0;

            return {
                primaryOutput: { label: mode === 'exclusive' ? 'Total Invoice Amount (incl. GST)' : 'Net Base Price (excl. GST)', value: `₹${gross.toFixed(2)}`, suffix: `Total Tax: ₹${gst.toFixed(2)} (${rate}%)` },
                secondaryMetrics: [
                    { label: 'Net Base Amount', value: `₹${net.toFixed(2)}` },
                    { label: 'Total GST Amount', value: `₹${gst.toFixed(2)}` },
                    { label: supply === 'intra_state' ? 'CGST (Central) & SGST (State)' : 'Integrated GST (IGST)', value: supply === 'intra_state' ? `CGST: ₹${cgst.toFixed(2)} + SGST: ₹${sgst.toFixed(2)}` : `IGST: ₹${igst.toFixed(2)}` },
                    { label: 'Effective Tax Share', value: `${((gst / gross) * 100).toFixed(2)}% of Final Price` }
                ]
            };
        }
    },
    // 134. HRA Calculator
    {
        id: 'hra-calculator',
        name: 'HRA Calculator',
        category: 'finance-business',
        group: 'Tax & Compliance',
        bucket: 'Bucket C',
        tier: 1,
        phase: 1,
        monthlySearches: '210K',
        cpc: '$1.25',
        description: "A House Rent Allowance (HRA) Exemption Calculator calculates tax-exempt HRA under Section 10(13A) of the Indian Income Tax Act to optimize tax savings.",
        inputs: [
            { id: 'basicSalaryAnnual', name: 'Annual Basic Salary + DA (₹)', type: 'number', defaultValue: 720000, min: 50000, step: 20000, prefix: '₹', tooltip: 'Basic salary plus Dearness Allowance per annum.' },
            { id: 'hraReceivedAnnual', name: 'Annual HRA Received from Employer (₹)', type: 'number', defaultValue: 240000, min: 0, step: 10000, prefix: '₹', tooltip: 'Total HRA allowance received in Form 16.' },
            { id: 'rentPaidAnnual', name: 'Total Actual Rent Paid in Year (₹)', type: 'number', defaultValue: 300000, min: 0, step: 10000, prefix: '₹', tooltip: 'Actual annual rent paid to landlord.' },
            { id: 'cityCategory', name: 'City Category', type: 'dropdown', defaultValue: 'metro', options: [{ label: 'Metro City (Delhi, Mumbai, Kolkata, Chennai - 50% Basic)', value: 'metro' }, { label: 'Non-Metro City (All Other Cities - 40% Basic)', value: 'non_metro' }], tooltip: 'Metro vs Non-Metro location.' }
        ],
        naturalLanguageQueries: ["HRA exemption calculator Section 10 13A", "How much HRA is tax exempt in India", "Calculate taxable and exempt HRA salary"],
        edgeCases: ["Rent paid is less than 10% of basic salary (0 exemption)", "HRA received is zero", "Rent paid exceeds basic salary"],
        calculate: (inputs) => {
            const basic = Number(inputs.basicSalaryAnnual) || 720000;
            const hraReceived = Number(inputs.hraReceivedAnnual) || 240000;
            const rentPaid = Number(inputs.rentPaidAnnual) || 300000;
            const isMetro = String(inputs.cityCategory || 'metro') === 'metro';

            // Section 10(13A) Rule: Exemption is lowest of:
            // 1. Actual HRA received
            // 2. Rent paid - 10% of Basic
            // 3. 50% (metro) or 40% (non-metro) of Basic
            const cond1 = hraReceived;
            const cond2 = Math.max(0, rentPaid - (0.10 * basic));
            const cond3 = (isMetro ? 0.50 : 0.40) * basic;

            const exemptHra = Math.min(cond1, cond2, cond3);
            const taxableHra = Math.max(0, hraReceived - exemptHra);
            const approxTaxSavings = exemptHra * 0.312; // Assuming 30% slab + 4% cess

            return {
                primaryOutput: { label: 'Tax-Exempt HRA Amount', value: `₹${Math.round(exemptHra).toLocaleString()}`, suffix: `Taxable HRA: ₹${Math.round(taxableHra).toLocaleString()}` },
                secondaryMetrics: [
                    { label: 'Condition 1: Actual HRA Received', value: `₹${Math.round(cond1).toLocaleString()}` },
                    { label: 'Condition 2: Rent Paid - 10% Basic', value: `₹${Math.round(cond2).toLocaleString()}` },
                    { label: `Condition 3: ${isMetro ? '50%' : '40%'} of Basic Salary`, value: `₹${Math.round(cond3).toLocaleString()}` },
                    { label: 'Estimated Tax Savings (30% Bracket)', value: `~₹${Math.round(approxTaxSavings).toLocaleString()} / year` }
                ]
            };
        }
    },
    // 135. TDS Calculator
    {
        id: 'tds-calculator',
        name: 'TDS Calculator',
        category: 'finance-business',
        group: 'Tax & Compliance',
        bucket: 'Bucket C',
        tier: 2,
        phase: 2,
        monthlySearches: '90K',
        cpc: '$1.15',
        description: "A Tax Deducted at Source (TDS) Calculator determines statutory withholding tax deductions and net payable amounts across professional, contractor, and rent payment sections.",
        inputs: [
            { id: 'grossAmount', name: 'Gross Payment / Invoice Amount (₹)', type: 'number', defaultValue: 150000, min: 1000, step: 5000, prefix: '₹', tooltip: 'Total billable or contractual payment amount.' },
            { id: 'tdsSection', name: 'Payment Nature / Section', type: 'dropdown', defaultValue: '194J_prof', options: [{ label: 'Sec 194J: Professional Fees (10%)', value: '194J_prof' }, { label: 'Sec 194J: Technical Fees / Royalty (2%)', value: '194J_tech' }, { label: 'Sec 194C: Individual/HUF Contractor (1%)', value: '194C_ind' }, { label: 'Sec 194C: Company/Firm Contractor (2%)', value: '194C_corp' }, { label: 'Sec 194I: Rent on Land & Building (10%)', value: '194I_rent_bldg' }, { label: 'Sec 194I: Rent on Plant & Machinery (2%)', value: '194I_rent_plant' }, { label: 'Sec 194H: Commission & Brokerage (5%)', value: '194H_comm' }], tooltip: 'Statutory section classification.' },
            { id: 'panAvailable', name: 'Valid PAN Provided?', type: 'dropdown', defaultValue: 'yes', options: [{ label: 'Yes (Standard Section Rate)', value: 'yes' }, { label: 'No / Inoperative (Higher Rate 20% Sec 206AA)', value: 'no' }], tooltip: 'PAN status determines default 20% penalty deduction.' }
        ],
        naturalLanguageQueries: ["TDS calculator Section 194J professional fees", "Calculate TDS deduction on contractor invoice", "TDS on rent building Section 194I"],
        edgeCases: ["PAN not provided triggering mandatory 20% rate", "Invoice below threshold limits", "Zero invoice amount"],
        calculate: (inputs) => {
            const amount = Number(inputs.grossAmount) || 150000;
            const section = String(inputs.tdsSection || '194J_prof');
            const hasPan = String(inputs.panAvailable || 'yes') === 'yes';

            let rate = 10;
            let sectionName = 'Section 194J (Professional Fees)';
            let threshold = 30000;

            if (section === '194J_tech') {
                rate = 2;
                sectionName = 'Section 194J (Technical / FTS)';
                threshold = 30000;
            } else if (section === '194C_ind') {
                rate = 1;
                sectionName = 'Section 194C (Individual Contractor)';
                threshold = 100000;
            } else if (section === '194C_corp') {
                rate = 2;
                sectionName = 'Section 194C (Corporate Contractor)';
                threshold = 100000;
            } else if (section === '194I_rent_bldg') {
                rate = 10;
                sectionName = 'Section 194I (Rent Land & Building)';
                threshold = 240000;
            } else if (section === '194I_rent_plant') {
                rate = 2;
                sectionName = 'Section 194I (Rent Plant & Machinery)';
                threshold = 240000;
            } else if (section === '194H_comm') {
                rate = 5;
                sectionName = 'Section 194H (Commission & Brokerage)';
                threshold = 15000;
            }

            if (!hasPan) {
                rate = 20; // Section 206AA penalty rate
            }

            const tdsAmount = amount * (rate / 100);
            const netPayable = amount - tdsAmount;

            return {
                primaryOutput: { label: 'Net Amount Payable to Beneficiary', value: `₹${Math.round(netPayable).toLocaleString()}`, suffix: `TDS Deducted: ₹${Math.round(tdsAmount).toLocaleString()} (${rate}%)` },
                secondaryMetrics: [
                    { label: 'Gross Invoice Amount', value: `₹${Math.round(amount).toLocaleString()}` },
                    { label: 'TDS Withholding Amount', value: `₹${Math.round(tdsAmount).toLocaleString()}` },
                    { label: 'Applicable Rate & Section', value: `${rate}% under ${sectionName}` },
                    { label: 'Statutory Annual Exemption Limit', value: `₹${Math.round(threshold).toLocaleString()} per Financial Year` }
                ]
            };
        }
    },
    // 136. Gratuity Calculator
    {
        id: 'gratuity-calculator',
        name: 'Gratuity Calculator',
        category: 'finance-business',
        group: 'Tax & Compliance',
        bucket: 'Bucket C',
        tier: 1,
        phase: 1,
        monthlySearches: '190K',
        cpc: '$1.00',
        description: "A Gratuity Calculator calculates retirement and resignation gratuity payouts under the Payment of Gratuity Act, 1972 with statutory ₹20 Lakh tax exemption rules.",
        inputs: [
            { id: 'lastDrawnSalary', name: 'Last Drawn Basic Salary + DA (₹ / month)', type: 'number', defaultValue: 65000, min: 5000, step: 2500, prefix: '₹', tooltip: 'Last drawn Basic Pay plus Dearness Allowance.' },
            { id: 'completedYears', name: 'Completed Years of Continuous Service', type: 'number', defaultValue: 8, min: 5, max: 45, step: 1, suffix: 'yrs', tooltip: 'Minimum 5 years mandatory service for eligibility.' },
            { id: 'organizationType', name: 'Gratuity Act Coverage', type: 'dropdown', defaultValue: 'covered', options: [{ label: 'Covered under Payment of Gratuity Act 1972 (15/26 Formula)', value: 'covered' }, { label: 'Not Covered under Gratuity Act (15/30 Formula)', value: 'uncovered' }], tooltip: 'Statutory act applicability.' }
        ],
        naturalLanguageQueries: ["Gratuity calculator India formula 15 26", "Calculate gratuity payout after 5 years service", "Tax free gratuity limit calculator 20 lakh"],
        edgeCases: ["Tenure under 5 years (except in case of death/disablement)", "Gratuity exceeding statutory ₹20 Lakh tax exemption ceiling", "Zero salary"],
        calculate: (inputs) => {
            const salary = Number(inputs.lastDrawnSalary) || 65000;
            const years = Math.max(1, Number(inputs.completedYears) || 8);
            const isCovered = String(inputs.organizationType || 'covered') === 'covered';

            // Covered: Gratuity = (15 * Last Drawn Salary * Tenure) / 26
            // Uncovered: Gratuity = (15 * Last Drawn Salary * Tenure) / 30
            const denominator = isCovered ? 26 : 30;
            const totalGratuity = (15 * salary * years) / denominator;

            const maxTaxFreeLimit = 2000000; // ₹20 Lakhs statutory exemption
            const taxFreePortion = Math.min(totalGratuity, maxTaxFreeLimit);
            const taxablePortion = Math.max(0, totalGratuity - maxTaxFreeLimit);

            return {
                primaryOutput: { label: 'Total Gratuity Payable', value: `₹${Math.round(totalGratuity).toLocaleString()}`, suffix: `${years} Years of Service (${isCovered ? 'Covered 15/26' : 'Uncovered 15/30'})` },
                secondaryMetrics: [
                    { label: 'Tax-Free Exempt Gratuity', value: `₹${Math.round(taxFreePortion).toLocaleString()} (Cap: ₹20 Lakhs)` },
                    { label: 'Taxable Gratuity Portion', value: taxablePortion > 0 ? `₹${Math.round(taxablePortion).toLocaleString()}` : '₹0 (Fully Tax-Exempt)' },
                    { label: 'Calculation Formula Basis', value: `(15 × ₹${salary.toLocaleString()} × ${years}) ÷ ${denominator}` },
                    { label: 'Eligibility Status', value: years >= 5 ? 'Eligible (>= 5 Years Continuous Service)' : 'Ineligible (< 5 Years Service Required)' }
                ]
            };
        }
    },
    // 137. EPF Calculator
    {
        id: 'epf-calculator',
        name: 'EPF Calculator',
        category: 'finance-business',
        group: 'Investments & Wealth',
        bucket: 'Bucket C',
        tier: 1,
        phase: 1,
        monthlySearches: '220K',
        cpc: '$1.30',
        description: "An Employees' Provident Fund (EPF) Calculator projects the retirement corpus at age 58 combining 12% employee and 3.67% employer EPF contributions with annual compound interest.",
        inputs: [
            { id: 'monthlyBasicSalary', name: 'Monthly Basic Salary + DA (₹)', type: 'number', defaultValue: 45000, min: 5000, step: 2500, prefix: '₹', tooltip: 'Basic pay plus DA for EPF wage calculation.' },
            { id: 'currentAge', name: 'Current Age (Years)', type: 'number', defaultValue: 28, min: 18, max: 57, step: 1, suffix: 'yrs', tooltip: 'Your current age.' },
            { id: 'retirementAge', name: 'Retirement Age (Years)', type: 'number', defaultValue: 58, min: 50, max: 65, step: 1, suffix: 'yrs', tooltip: 'EPF statutory retirement age is 58.' },
            { id: 'currentEpfBalance', name: 'Existing EPF Account Balance (₹)', type: 'number', defaultValue: 250000, min: 0, step: 25000, prefix: '₹', tooltip: 'Current balance in EPF passbook.' },
            { id: 'annualSalaryIncrement', name: 'Expected Annual Salary Increment (%)', type: 'number', defaultValue: 7.0, min: 0, max: 25, step: 0.5, suffix: '%', tooltip: 'Expected yearly pay raise.' },
            { id: 'epfInterestRate', name: 'EPF Annual Interest Rate (%)', type: 'number', defaultValue: 8.25, min: 6.0, max: 12.0, step: 0.05, suffix: '%', tooltip: 'Current EPFO declared annual interest rate.' }
        ],
        naturalLanguageQueries: ["EPF calculator retirement corpus 58 years", "Calculate PF balance with salary increment and interest", "Employees Provident Fund maturity calculator India"],
        edgeCases: ["Current age greater than retirement age", "Zero existing balance", "High salary increments exceeding 20%"],
        calculate: (inputs) => {
            let basic = Number(inputs.monthlyBasicSalary) || 45000;
            const curAge = Number(inputs.currentAge) || 28;
            const retAge = Number(inputs.retirementAge) || 58;
            let balance = Number(inputs.currentEpfBalance) || 250000;
            const incRate = (Number(inputs.annualSalaryIncrement) || 7.0) / 100;
            const intRate = (Number(inputs.epfInterestRate) || 8.25) / 100;

            const totalYears = Math.max(1, retAge - curAge);
            let totalEmployeeContrib = 0;
            let totalEmployerContrib = 0;

            for (let y = 1; y <= totalYears; y++) {
                const empMonthly = basic * 0.12;
                const emplyrMonthly = basic * 0.0367; // 3.67% to EPF (8.33% goes to EPS pension)
                const annualContribution = (empMonthly + emplyrMonthly) * 12;

                totalEmployeeContrib += empMonthly * 12;
                totalEmployerContrib += emplyrMonthly * 12;

                // Monthly average balance compounding approximation
                balance = (balance + annualContribution) * (1 + intRate);
                basic = basic * (1 + incRate);
            }

            const totalInterestAccrued = balance - (Number(inputs.currentEpfBalance) || 250000) - totalEmployeeContrib - totalEmployerContrib;

            return {
                primaryOutput: { label: 'Total EPF Corpus at Retirement', value: `₹${Math.round(balance).toLocaleString()}`, suffix: `at Age ${retAge} (${totalYears} Yrs Contribution)` },
                secondaryMetrics: [
                    { label: 'Total Employee 12% Contributions', value: `₹${Math.round(totalEmployeeContrib).toLocaleString()}` },
                    { label: 'Total Employer 3.67% Contributions', value: `₹${Math.round(totalEmployerContrib).toLocaleString()}` },
                    { label: 'Total Compound Interest Accrued', value: `₹${Math.round(totalInterestAccrued).toLocaleString()}` },
                    { label: 'Final Monthly Basic Pay', value: `₹${Math.round(basic).toLocaleString()} / month` }
                ]
            };
        }
    },
    // 138. UK Take Home Pay Calculator
    {
        id: 'uk-take-home-pay-calculator',
        name: 'UK Take Home Pay Calculator',
        category: 'finance-business',
        group: 'Tax & Compliance',
        bucket: 'Bucket C',
        tier: 1,
        phase: 1,
        monthlySearches: '250K',
        cpc: '$2.80',
        description: "A UK Salary and Take-Home Pay Calculator computes net pay after HMRC Income Tax, National Insurance, Student Loan repayments, and workplace pension contributions.",
        inputs: [
            { id: 'grossAnnualSalary', name: 'Gross Annual Salary (£)', type: 'number', defaultValue: 48000, min: 5000, step: 1000, prefix: '£', tooltip: 'Total annual gross pay before tax.' },
            { id: 'pensionContributionPercent', name: 'Workplace Pension Contribution (%)', type: 'number', defaultValue: 5, min: 0, max: 50, step: 0.5, suffix: '%', tooltip: 'Employee auto-enrolment pension percentage.' },
            { id: 'studentLoanPlan', name: 'Student Loan Repayment Plan', type: 'dropdown', defaultValue: 'none', options: [{ label: 'No Student Loan', value: 'none' }, { label: 'Plan 2 (Threshold £27,295 @ 9%)', value: 'plan2' }, { label: 'Plan 1 (Threshold £24,990 @ 9%)', value: 'plan1' }, { label: 'Plan 5 (Threshold £25,000 @ 9%)', value: 'plan5' }, { label: 'Postgraduate Loan (Threshold £21,000 @ 6%)', value: 'postgrad' }], tooltip: 'Student loan deduction scheme.' }
        ],
        naturalLanguageQueries: ["UK salary take home pay calculator", "How much tax do I pay on 50k salary UK", "Monthly net pay calculator HMRC tax and NI"],
        edgeCases: ["Salary over £100,000 personal allowance taper", "Zero salary", "High pension contribution relief"],
        calculate: (inputs) => {
            const gross = Number(inputs.grossAnnualSalary) || 48000;
            const pensionPct = (Number(inputs.pensionContributionPercent) || 5) / 100;
            const loanPlan = String(inputs.studentLoanPlan || 'none');

            const pensionDeduction = gross * pensionPct;
            const taxableGross = gross - pensionDeduction;

            // Personal Allowance: £12,570, reduced by £1 for every £2 earned above £100,000
            let personalAllowance = 12570;
            if (taxableGross > 100000) {
                personalAllowance = Math.max(0, 12570 - ((taxableGross - 100000) / 2));
            }

            // Income Tax Bands (England/Wales/NI 2024/25)
            let incomeTax = 0;
            const taxableIncome = Math.max(0, taxableGross - personalAllowance);

            if (taxableIncome > 0) {
                const basicBand = Math.min(taxableIncome, 50270 - 12570);
                incomeTax += basicBand * 0.20;

                if (taxableGross > 50270) {
                    const higherBand = Math.min(taxableGross, 125140) - 50270;
                    incomeTax += Math.max(0, higherBand) * 0.40;
                }
                if (taxableGross > 125140) {
                    const additionalBand = taxableGross - 125140;
                    incomeTax += additionalBand * 0.45;
                }
            }

            // National Insurance Class 1 (2024/25: 8% from £12,570 to £50,270, 2% above £50,270)
            let ni = 0;
            if (gross > 12570) {
                const mainBand = Math.min(gross, 50270) - 12570;
                ni += mainBand * 0.08;
                if (gross > 50270) {
                    ni += (gross - 50270) * 0.02;
                }
            }

            // Student Loan
            let studentLoan = 0;
            if (loanPlan === 'plan2' && gross > 27295) {
                studentLoan = (gross - 27295) * 0.09;
            } else if (loanPlan === 'plan1' && gross > 24990) {
                studentLoan = (gross - 24990) * 0.09;
            } else if (loanPlan === 'plan5' && gross > 25000) {
                studentLoan = (gross - 25000) * 0.09;
            } else if (loanPlan === 'postgrad' && gross > 21000) {
                studentLoan = (gross - 21000) * 0.06;
            }

            const totalDeductions = incomeTax + ni + pensionDeduction + studentLoan;
            const netAnnual = gross - totalDeductions;
            const netMonthly = netAnnual / 12;
            const netWeekly = netAnnual / 52;

            return {
                primaryOutput: { label: 'Net Monthly Take-Home Pay', value: `£${Math.round(netMonthly).toLocaleString()}`, suffix: `£${Math.round(netAnnual).toLocaleString()} / year` },
                secondaryMetrics: [
                    { label: 'Weekly Take-Home Pay', value: `£${Math.round(netWeekly).toLocaleString()} / week` },
                    { label: 'Annual Income Tax (PAYE)', value: `£${Math.round(incomeTax).toLocaleString()}` },
                    { label: 'National Insurance (NI)', value: `£${Math.round(ni).toLocaleString()}` },
                    { label: 'Pension & Student Loan Deductions', value: `£${Math.round(pensionDeduction + studentLoan).toLocaleString()} (Pension: £${Math.round(pensionDeduction).toLocaleString()})` }
                ]
            };
        }
    },
    // 139. Canadian Income Tax Calculator
    {
        id: 'canadian-income-tax-calculator',
        name: 'Canadian Income Tax Calculator',
        category: 'finance-business',
        group: 'Tax & Compliance',
        bucket: 'Bucket C',
        tier: 2,
        phase: 2,
        monthlySearches: '110K',
        cpc: '$3.40',
        description: "A Canadian Income Tax Calculator computes combined CRA Federal and Provincial income taxes, CPP/EI contributions, and net take-home pay.",
        inputs: [
            { id: 'employmentIncome', name: 'Annual Employment Income ($ CAD)', type: 'number', defaultValue: 85000, min: 5000, step: 2500, prefix: '$', tooltip: 'Gross employment earnings before deductions.' },
            { id: 'province', name: 'Province / Territory', type: 'dropdown', defaultValue: 'ON', options: [{ label: 'Ontario (ON)', value: 'ON' }, { label: 'British Columbia (BC)', value: 'BC' }, { label: 'Alberta (AB)', value: 'AB' }, { label: 'Quebec (QC)', value: 'QC' }, { label: 'Nova Scotia (NS)', value: 'NS' }], tooltip: 'Provincial tax jurisdiction.' },
            { id: 'rrspDeduction', name: 'RRSP Contribution Deduction ($ CAD)', type: 'number', defaultValue: 5000, min: 0, step: 500, prefix: '$', tooltip: 'Tax deductible RRSP contributions.' }
        ],
        naturalLanguageQueries: ["Canada income tax calculator federal provincial", "Ontario take home pay after tax calculator", "Calculate CRA tax and CPP EI deductions"],
        edgeCases: ["Income below basic personal amount", "RRSP exceeding contribution room", "Zero income"],
        calculate: (inputs) => {
            const gross = Number(inputs.employmentIncome) || 85000;
            const prov = String(inputs.province || 'ON');
            const rrsp = Number(inputs.rrspDeduction) || 5000;

            const taxableIncome = Math.max(0, gross - rrsp);

            // 2024 Federal Tax Brackets
            // 15% up to $55,867; 20.5% up to $111,733; 26% up to $173,205; 29% up to $246,752; 33% above
            let fedTax = 0;
            if (taxableIncome > 15705) { // Federal Basic Personal Amount
                const netTaxable = taxableIncome - 15705;
                const b1 = Math.min(netTaxable, 55867 - 15705);
                fedTax += b1 * 0.15;
                if (taxableIncome > 55867) {
                    const b2 = Math.min(taxableIncome, 111733) - 55867;
                    fedTax += b2 * 0.205;
                }
                if (taxableIncome > 111733) {
                    const b3 = Math.min(taxableIncome, 173205) - 111733;
                    fedTax += b3 * 0.26;
                }
                if (taxableIncome > 173205) {
                    const b4 = Math.min(taxableIncome, 246752) - 173205;
                    fedTax += b4 * 0.29;
                }
                if (taxableIncome > 246752) {
                    fedTax += (taxableIncome - 246752) * 0.33;
                }
            }

            // Simplified Provincial Tax Rates
            let provRate = 0.0915; // Ontario average effective
            if (prov === 'BC') provRate = 0.077;
            else if (prov === 'AB') provRate = 0.100;
            else if (prov === 'QC') provRate = 0.140;
            else if (prov === 'NS') provRate = 0.120;

            const provTax = Math.max(0, (taxableIncome - 11865) * provRate);

            // CPP (Canada Pension Plan) 2024: 5.95% up to max ~$3,867
            const cpp = Math.min(3867, Math.max(0, (gross - 3500) * 0.0595));
            // EI (Employment Insurance) 2024: 1.66% up to max ~$1,049
            const ei = Math.min(1049, gross * 0.0166);

            const totalTaxAndDeductions = fedTax + provTax + cpp + ei;
            const netAnnual = gross - totalTaxAndDeductions;
            const netMonthly = netAnnual / 12;
            const effectiveTaxRate = (totalTaxAndDeductions / gross) * 100;

            return {
                primaryOutput: { label: 'Net Monthly Take-Home Pay', value: `$${Math.round(netMonthly).toLocaleString()} CAD`, suffix: `$${Math.round(netAnnual).toLocaleString()} / year` },
                secondaryMetrics: [
                    { label: 'Federal Income Tax (CRA)', value: `$${Math.round(fedTax).toLocaleString()} CAD` },
                    { label: `Provincial Tax (${prov})`, value: `$${Math.round(provTax).toLocaleString()} CAD` },
                    { label: 'CPP & EI Deductions', value: `$${Math.round(cpp + ei).toLocaleString()} (CPP: $${Math.round(cpp)}, EI: $${Math.round(ei)})` },
                    { label: 'Total Effective Tax & Deduction Rate', value: `${effectiveTaxRate.toFixed(1)}%` }
                ]
            };
        }
    },
    // 140. Australian Income Tax Calculator
    {
        id: 'australian-income-tax-calculator',
        name: 'Australian Income Tax Calculator',
        category: 'finance-business',
        group: 'Tax & Compliance',
        bucket: 'Bucket C',
        tier: 2,
        phase: 2,
        monthlySearches: '130K',
        cpc: '$3.10',
        description: "An Australian Income Tax Calculator computes ATO Stage 3 income tax brackets, 2% Medicare Levy, and statutory 11.5% Superannuation Guarantee entitlements.",
        inputs: [
            { id: 'grossAnnualIncome', name: 'Annual Taxable Income ($ AUD)', type: 'number', defaultValue: 95000, min: 10000, step: 2500, prefix: '$', tooltip: 'Gross income before tax.' },
            { id: 'residencyStatus', name: 'Residency for Tax Purposes', type: 'dropdown', defaultValue: 'resident', options: [{ label: 'Australian Resident for Tax Purposes', value: 'resident' }, { label: 'Foreign Resident', value: 'non_resident' }, { label: 'Working Holiday Maker', value: 'whm' }], tooltip: 'Tax residency status.' },
            { id: 'includeSuper', name: 'Superannuation Quote Basis', type: 'dropdown', defaultValue: 'exclusive', options: [{ label: 'Salary Exclusive of Super (+11.5% Super on top)', value: 'exclusive' }, { label: 'Total Remuneration Package (Super Inclusive)', value: 'inclusive' }], tooltip: 'Superannuation packaging.' }
        ],
        naturalLanguageQueries: ["Australian tax calculator ATO Stage 3", "Calculate take home pay Australia after tax and medicare", "Salary calculator Australia with superannuation"],
        edgeCases: ["Income below $18,200 tax-free threshold", "Working holiday maker flat 15% rate", "Medicare levy surcharge for high earners without private health insurance"],
        calculate: (inputs) => {
            const rawIncome = Number(inputs.grossAnnualIncome) || 95000;
            const res = String(inputs.residencyStatus || 'resident');
            const superBasis = String(inputs.includeSuper || 'exclusive');

            let taxableSalary = rawIncome;
            let employerSuper = 0;
            if (superBasis === 'inclusive') {
                taxableSalary = rawIncome / 1.115;
                employerSuper = rawIncome - taxableSalary;
            } else {
                employerSuper = taxableSalary * 0.115; // 11.5% Super Guarantee
            }

            // ATO Stage 3 Tax Rates (2024-25 onwards)
            // $0 – $18,200: Nil
            // $18,201 – $45,000: 16%
            // $45,001 – $135,000: 30%
            // $135,001 – $190,000: 37%
            // $190,001+: 45%
            let incomeTax = 0;
            if (res === 'resident') {
                if (taxableSalary > 18200) {
                    const b1 = Math.min(taxableSalary, 45000) - 18200;
                    incomeTax += b1 * 0.16;
                }
                if (taxableSalary > 45000) {
                    const b2 = Math.min(taxableSalary, 135000) - 45000;
                    incomeTax += b2 * 0.30;
                }
                if (taxableSalary > 135000) {
                    const b3 = Math.min(taxableSalary, 190000) - 135000;
                    incomeTax += b3 * 0.37;
                }
                if (taxableSalary > 190000) {
                    incomeTax += (taxableSalary - 190000) * 0.45;
                }
            } else {
                // Non-resident flat 30% up to $135k
                incomeTax = taxableSalary * 0.30;
            }

            // Medicare Levy: 2.0% for residents
            const medicareLevy = res === 'resident' ? (taxableSalary * 0.02) : 0;
            const totalTax = incomeTax + medicareLevy;
            const netAnnual = taxableSalary - totalTax;
            const netMonthly = netAnnual / 12;
            const netFortnightly = netAnnual / 26;

            return {
                primaryOutput: { label: 'Net Monthly Take-Home Pay', value: `$${Math.round(netMonthly).toLocaleString()} AUD`, suffix: `$${Math.round(netFortnightly).toLocaleString()} Fortnightly` },
                secondaryMetrics: [
                    { label: 'Annual Net Take-Home Pay', value: `$${Math.round(netAnnual).toLocaleString()} AUD` },
                    { label: 'ATO Income Tax (Stage 3)', value: `$${Math.round(incomeTax).toLocaleString()} AUD` },
                    { label: 'Medicare Levy (2.0%)', value: `$${Math.round(medicareLevy).toLocaleString()} AUD` },
                    { label: 'Employer Superannuation (11.5%)', value: `$${Math.round(employerSuper).toLocaleString()} AUD / year` }
                ]
            };
        }
    },
    // 141. NZ PAYE Calculator
    {
        id: 'nz-paye-calculator',
        name: 'NZ PAYE Calculator',
        category: 'finance-business',
        group: 'Tax & Compliance',
        bucket: 'Bucket C',
        tier: 2,
        phase: 2,
        monthlySearches: '60K',
        cpc: '$2.10',
        description: "A New Zealand PAYE Tax Calculator computes IRD progressive income tax brackets, ACC Earners' Levy, and KiwiSaver employee contributions.",
        inputs: [
            { id: 'grossSalaryNZD', name: 'Annual Gross Salary (NZ$)', type: 'number', defaultValue: 78000, min: 10000, step: 2000, prefix: '$', tooltip: 'Gross salary before deductions in NZD.' },
            { id: 'kiwisaverPercent', name: 'KiwiSaver Contribution (%)', type: 'dropdown', defaultValue: 3, options: [{ label: '3% (Default Minimum)', value: 3 }, { label: '4%', value: 4 }, { label: '6%', value: 6 }, { label: '8%', value: 8 }, { label: '10%', value: 10 }, { label: '0% (Opt Out)', value: 0 }], tooltip: 'KiwiSaver employee rate.' },
            { id: 'studentLoan', name: 'Student Loan Deduction', type: 'dropdown', defaultValue: 'no', options: [{ label: 'No Student Loan', value: 'no' }, { label: 'Yes (12% above $24,128 threshold)', value: 'yes' }], tooltip: 'NZ Student loan deduction.' }
        ],
        naturalLanguageQueries: ["NZ PAYE tax calculator salary take home", "Calculate New Zealand net pay after tax and KiwiSaver", "IRD tax calculator NZ"],
        edgeCases: ["Salary below $15,600 bracket", "Student loan threshold boundary", "Zero KiwiSaver contribution"],
        calculate: (inputs) => {
            const gross = Number(inputs.grossSalaryNZD) || 78000;
            const ksRate = (Number(inputs.kiwisaverPercent) || 3) / 100;
            const hasLoan = String(inputs.studentLoan || 'no') === 'yes';

            // NZ IRD Tax Tiers (2024/25):
            // Up to $15,600: 10.5%
            // $15,601 – $53,500: 17.5%
            // $53,501 – $78,100: 30.0%
            // $78,101 – $180,000: 33.0%
            // Above $180,000: 39.0%
            let payeTax = 0;
            const b1 = Math.min(gross, 15600);
            payeTax += b1 * 0.105;

            if (gross > 15600) {
                const b2 = Math.min(gross, 53500) - 15600;
                payeTax += b2 * 0.175;
            }
            if (gross > 53500) {
                const b3 = Math.min(gross, 78100) - 53500;
                payeTax += b3 * 0.30;
            }
            if (gross > 78100) {
                const b4 = Math.min(gross, 180000) - 78100;
                payeTax += b4 * 0.33;
            }
            if (gross > 180000) {
                payeTax += (gross - 180000) * 0.39;
            }

            // ACC Earners' Levy: 1.60% (capped at $142,283 max earnings)
            const accLevy = Math.min(gross, 142283) * 0.0160;
            const kiwisaverAmount = gross * ksRate;

            let studentLoanAmount = 0;
            if (hasLoan && gross > 24128) {
                studentLoanAmount = (gross - 24128) * 0.12;
            }

            const totalDeductions = payeTax + accLevy + kiwisaverAmount + studentLoanAmount;
            const netAnnual = gross - totalDeductions;
            const netFortnightly = netAnnual / 26;
            const netMonthly = netAnnual / 12;

            return {
                primaryOutput: { label: 'Net Monthly Take-Home Pay', value: `$${Math.round(netMonthly).toLocaleString()} NZD`, suffix: `$${Math.round(netFortnightly).toLocaleString()} Fortnightly` },
                secondaryMetrics: [
                    { label: 'Annual Net Take-Home Pay', value: `$${Math.round(netAnnual).toLocaleString()} NZD` },
                    { label: 'IRD PAYE Income Tax', value: `$${Math.round(payeTax).toLocaleString()} NZD` },
                    { label: "ACC Earners' Levy (1.60%)", value: `$${Math.round(accLevy).toLocaleString()} NZD` },
                    { label: 'KiwiSaver Employee Savings', value: `$${Math.round(kiwisaverAmount).toLocaleString()} NZD / year` }
                ]
            };
        }
    },
    // 142. Superannuation Calculator
    {
        id: 'superannuation-calculator',
        name: 'Superannuation Calculator',
        category: 'finance-business',
        group: 'Investments & Wealth',
        bucket: 'Bucket C',
        tier: 2,
        phase: 2,
        monthlySearches: '70K',
        cpc: '$3.50',
        description: "An Australian Superannuation Growth Calculator projects retirement wealth accumulation with 11.5% employer contributions, 15% super tax, and compound investment growth.",
        inputs: [
            { id: 'currentSuperBalance', name: 'Current Super Balance ($ AUD)', type: 'number', defaultValue: 85000, min: 0, step: 5000, prefix: '$', tooltip: 'Current balance across super funds.' },
            { id: 'currentAge', name: 'Current Age (Years)', type: 'number', defaultValue: 32, min: 18, max: 70, step: 1, suffix: 'yrs', tooltip: 'Your current age.' },
            { id: 'retirementAge', name: 'Preservation / Retirement Age (Years)', type: 'number', defaultValue: 65, min: 55, max: 75, step: 1, suffix: 'yrs', tooltip: 'Target super preservation age (typically 60-67).' },
            { id: 'annualSalary', name: 'Current Annual Salary ($ AUD)', type: 'number', defaultValue: 90000, min: 15000, step: 2500, prefix: '$', tooltip: 'Annual gross base salary.' },
            { id: 'investmentReturnRate', name: 'Expected Net Investment Return (%)', type: 'number', defaultValue: 7.0, min: 2.0, max: 12.0, step: 0.5, suffix: '%', tooltip: 'Balanced/Growth super investment return.' }
        ],
        naturalLanguageQueries: ["Australian superannuation calculator retirement balance", "Calculate super fund balance at age 65", "Superannuation compound growth calculator"],
        edgeCases: ["Current age greater than retirement age", "Concessional contribution cap of $30,000", "Zero starting balance"],
        calculate: (inputs) => {
            let balance = Number(inputs.currentSuperBalance) || 85000;
            const curAge = Number(inputs.currentAge) || 32;
            const retAge = Number(inputs.retirementAge) || 65;
            const salary = Number(inputs.annualSalary) || 90000;
            const returnRate = (Number(inputs.investmentReturnRate) || 7.0) / 100;

            const years = Math.max(1, retAge - curAge);
            const employerContribGross = salary * 0.115; // 11.5% SG
            // 15% Super Concessional Contributions Tax
            const employerContribNet = employerContribGross * (1 - 0.15);
            // 15% Super Fund Earnings Tax
            const netReturnRate = returnRate * (1 - 0.15);

            let totalContributed = 0;

            for (let y = 1; y <= years; y++) {
                balance = (balance + employerContribNet) * (1 + netReturnRate);
                totalContributed += employerContribGross;
            }

            // Estimate annual retirement income assuming 5% sustainable drawdown
            const annualDrawdown = balance * 0.05;

            return {
                primaryOutput: { label: 'Estimated Super at Retirement', value: `$${Math.round(balance).toLocaleString()} AUD`, suffix: `at Age ${retAge} (${years} Yrs Accumulation)` },
                secondaryMetrics: [
                    { label: 'Estimated Annual Retirement Income (5% Drawdown)', value: `$${Math.round(annualDrawdown).toLocaleString()} AUD / year` },
                    { label: 'Total Gross Employer Contributions', value: `$${Math.round(totalContributed).toLocaleString()} AUD` },
                    { label: 'Investment Growth Generated', value: `$${Math.round(balance - totalContributed - (Number(inputs.currentSuperBalance) || 85000)).toLocaleString()} AUD` },
                    { label: 'Net Annual Super Return Rate', value: `${(netReturnRate * 100).toFixed(2)}% (after 15% tax)` }
                ]
            };
        }
    }
];
