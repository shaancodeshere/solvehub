import { CalculatorDefinition } from '../../types/calculator';

export const legalComplianceCalculators: CalculatorDefinition[] = [
    // 1. Statutory Severance Pay Calculator
    {
        id: 'severance-pay-calculator',
        name: 'Statutory Severance Pay Calculator',
        category: 'legal-compliance',
        group: '9A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '110K',
        cpc: '$1.45',
        description: 'Estimates statutory severance packages, accrued vacation payouts, and notice period equivalents based on tenure length and salary.',
        inputs: [
            { id: 'annualSalary', name: 'Annual Base Salary', type: 'currency', defaultValue: 75000, min: 1000, step: 1000, prefix: '$', tooltip: 'Gross annual compensation.' },
            { id: 'yearsOfService', name: 'Years of Service / Tenure', type: 'number', defaultValue: 4.5, min: 0.1, max: 40, step: 0.5, suffix: 'yrs', tooltip: 'Completed years with the employer.' },
            {
                id: 'weeksPerYear', name: 'Severance Weeks per Year of Service', type: 'dropdown', defaultValue: 2, options: [
                    { label: '1 Week per Year (Statutory Minimum)', value: 1 },
                    { label: '2 Weeks per Year (Standard Corporate)', value: 2 },
                    { label: '3 Weeks per Year (Senior / Executive)', value: 3 },
                    { label: '4 Weeks per Year (Generous Package)', value: 4 }
                ], tooltip: 'Policy multiple for severance calculation.'
            },
            { id: 'unusedVacationDays', name: 'Accrued Unused Vacation Days', type: 'number', defaultValue: 8, min: 0, max: 60, step: 1, suffix: 'days', tooltip: 'Paid time off balance to be liquidated.' }
        ],
        naturalLanguageQueries: [
            'How to calculate severance pay',
            'Severance package estimator',
            'Severance pay 2 weeks per year worked'
        ],
        edgeCases: ['Zero years of service', 'Cap limits on maximum allowable weeks'],
        calculate: (inputs) => {
            const salary = Number(inputs.annualSalary) || 75000;
            const tenure = Number(inputs.yearsOfService) || 4.5;
            const weeksPerYear = Number(inputs.weeksPerYear) || 2;
            const vacationDays = Number(inputs.unusedVacationDays) || 0;

            const weeklyRate = salary / 52;
            const dailyRate = salary / 260; // 260 working days per year

            const severanceWeeks = Math.max(1, tenure * weeksPerYear);
            const severanceTotal = severanceWeeks * weeklyRate;
            const vacationPayout = vacationDays * dailyRate;
            const grossPackage = severanceTotal + vacationPayout;

            return {
                primaryOutput: { label: 'Estimated Gross Severance Package', value: Math.round(grossPackage).toLocaleString(), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Severance Pay Portion', value: `$${Math.round(severanceTotal).toLocaleString()} (${severanceWeeks.toFixed(1)} Weeks)` },
                    { label: 'Accrued Vacation Payout', value: `$${Math.round(vacationPayout).toLocaleString()} (${vacationDays} Days)` },
                    { label: 'Effective Weekly Wage Basis', value: `$${weeklyRate.toFixed(2)}` },
                    { label: 'Months of Pay Equivalent', value: `${(severanceWeeks / 4.333).toFixed(1)} Months` }
                ]
            };
        }
    },

    // 2. Structured Settlement & Annuity Present Value Calculator
    {
        id: 'settlement-present-value-calculator',
        name: 'Structured Settlement Present Value Calculator',
        category: 'legal-compliance',
        group: '9A',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '60K',
        cpc: '$4.20',
        description: 'Calculates the lump-sum cash present value of structured legal settlement annuities using standard discount rate compounding.',
        inputs: [
            { id: 'periodicPayment', name: 'Periodic Annuity Payment', type: 'currency', defaultValue: 2500, min: 100, step: 100, prefix: '$', tooltip: 'Scheduled cash installment.' },
            {
                id: 'paymentFrequency', name: 'Payment Frequency', type: 'dropdown', defaultValue: 12, options: [
                    { label: 'Monthly (12/yr)', value: 12 },
                    { label: 'Quarterly (4/yr)', value: 4 },
                    { label: 'Annual (1/yr)', value: 1 }
                ], tooltip: 'Installment cadence.'
            },
            { id: 'durationYears', name: 'Duration Remaining (Years)', type: 'number', defaultValue: 15, min: 1, max: 50, step: 1, suffix: 'yrs', tooltip: 'Remaining payout timeframe.' },
            { id: 'discountRate', name: 'Discount / Opportunity Rate (APR)', type: 'percentage', defaultValue: 7.5, min: 1, max: 20, step: 0.25, suffix: '%', tooltip: 'Purchasing company discount rate.' }
        ],
        naturalLanguageQueries: [
            'Cash payout for structured settlement',
            'Lump sum vs annuity calculator legal settlement',
            'Present value of monthly legal settlement'
        ],
        edgeCases: ['Zero discount rate (pure nominal sum)'],
        calculate: (inputs) => {
            const pmt = Number(inputs.periodicPayment) || 2500;
            const freq = Number(inputs.paymentFrequency) || 12;
            const years = Number(inputs.durationYears) || 15;
            const rAnnual = (Number(inputs.discountRate) || 7.5) / 100;

            const totalPeriods = years * freq;
            const rPeriod = rAnnual / freq;
            const totalNominalPayout = pmt * totalPeriods;

            // Present Value of Ordinary Annuity = PMT * [ (1 - (1 + r)^-n) / r ]
            let pv = 0;
            if (rPeriod > 0) {
                pv = pmt * ((1 - Math.pow(1 + rPeriod, -totalPeriods)) / rPeriod);
            } else {
                pv = totalNominalPayout;
            }

            const discountDiscount = totalNominalPayout - pv;
            const discountHaircutPct = (discountDiscount / totalNominalPayout) * 100;

            return {
                primaryOutput: { label: 'Estimated Lump-Sum Present Value', value: Math.round(pv).toLocaleString(), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Nominal Payments Remaining', value: `$${Math.round(totalNominalPayout).toLocaleString()}` },
                    { label: 'Discount Haircut / Surrender Cost', value: `$${Math.round(discountDiscount).toLocaleString()} (-${discountHaircutPct.toFixed(1)}%)` },
                    { label: 'Total Installments Scheduled', value: `${totalPeriods} Payments` },
                    { label: 'Applied Periodic Rate', value: `${(rPeriod * 100).toFixed(3)}%` }
                ]
            };
        }
    },

    // 3. Child Support Guideline Estimator
    {
        id: 'child-support-calculator',
        name: 'Child Support Guideline Estimator',
        category: 'legal-compliance',
        group: '9A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '450K',
        cpc: '$1.80',
        description: 'Estimates parental statutory support obligations using an Income Shares model based on combined gross monthly income and overnight custody splits.',
        inputs: [
            { id: 'payingParentIncome', name: 'Paying Parent Monthly Gross Income', type: 'currency', defaultValue: 6000, min: 500, step: 250, prefix: '$', tooltip: 'Monthly income before taxes.' },
            { id: 'recipientParentIncome', name: 'Recipient Parent Monthly Gross Income', type: 'currency', defaultValue: 4000, min: 0, step: 250, prefix: '$', tooltip: 'Receiving parent monthly income.' },
            {
                id: 'childrenCount', name: 'Number of Qualifying Children', type: 'dropdown', defaultValue: 2, options: [
                    { label: '1 Child (17% Baseline)', value: 1 },
                    { label: '2 Children (25% Baseline)', value: 2 },
                    { label: '3 Children (29% Baseline)', value: 3 },
                    { label: '4+ Children (31% Baseline)', value: 4 }
                ], tooltip: 'Dependent minor children.'
            },
            { id: 'overnightPercent', name: 'Paying Parent Overnight Custody Share', type: 'percentage', defaultValue: 20, min: 0, max: 50, step: 5, suffix: '%', tooltip: 'Percentage of nights child stays with paying parent.' }
        ],
        naturalLanguageQueries: [
            'Child support calculator',
            'Income shares model child support formula',
            'Child support with 20% overnights'
        ],
        edgeCases: ['Equal 50/50 custody parenting time offsets'],
        calculate: (inputs) => {
            const inc1 = Number(inputs.payingParentIncome) || 6000;
            const inc2 = Number(inputs.recipientParentIncome) || 4000;
            const kids = Number(inputs.childrenCount) || 2;
            const custodyPct = (Number(inputs.overnightPercent) || 20) / 100;

            const combinedIncome = inc1 + inc2;
            const payingParentShare = combinedIncome > 0 ? inc1 / combinedIncome : 0.5;

            // Model percentage based on number of children
            const pctMap: Record<number, number> = { 1: 0.17, 2: 0.25, 3: 0.29, 4: 0.31 };
            const baseSupportRate = pctMap[kids] || 0.25;

            // Basic combined child support obligation
            const combinedObligation = combinedIncome * baseSupportRate;

            // Base share of paying parent
            let obligation = combinedObligation * payingParentShare;

            // Custody adjustment credit: If paying parent has >15% overnights, apply shared-custody credit
            if (custodyPct > 0.15) {
                const custodyCredit = combinedObligation * custodyPct * 0.75;
                obligation = Math.max(50, obligation - custodyCredit);
            }

            return {
                primaryOutput: { label: 'Estimated Monthly Support Obligation', value: Math.round(obligation).toLocaleString(), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Paying Parent Income Share', value: `${(payingParentShare * 100).toFixed(1)}%` },
                    { label: 'Combined Monthly Gross Income', value: `$${Math.round(combinedIncome).toLocaleString()}` },
                    { label: 'Theoretical Combined Obligation', value: `$${Math.round(combinedObligation).toLocaleString()}` },
                    { label: 'Annual Total Support Transferred', value: `$${Math.round(obligation * 12).toLocaleString()}` }
                ]
            };
        }
    },

    // 4. Statutory Late Payment Interest Calculator
    {
        id: 'statutory-late-payment-calculator',
        name: 'Statutory Late Payment Interest Calculator',
        category: 'legal-compliance',
        group: '9A',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '40K',
        cpc: '$1.10',
        description: 'Calculates statutory post-judgment or overdue commercial invoice interest and debt recovery compensations.',
        inputs: [
            { id: 'principalAmount', name: 'Overdue Principal Invoice Amount', type: 'currency', defaultValue: 12500, min: 10, step: 250, prefix: '$', tooltip: 'Unpaid invoice balance.' },
            { id: 'daysOverdue', name: 'Days Overdue Past Due Date', type: 'number', defaultValue: 65, min: 1, max: 1825, step: 1, suffix: 'days', tooltip: 'Calendar days elapsed since payment deadline.' },
            { id: 'statutoryRate', name: 'Statutory Interest Rate (APR)', type: 'percentage', defaultValue: 8.0, min: 1, max: 30, step: 0.5, suffix: '%', tooltip: 'Contractual or statutory rate (e.g. 8% + central bank base rate).' },
            { id: 'fixedCompensation', name: 'Statutory Debt Recovery Fixed Fee', type: 'currency', defaultValue: 70, min: 0, step: 10, prefix: '$', tooltip: 'Statutory recovery allowance for late B2B debts.' }
        ],
        naturalLanguageQueries: [
            'Commercial debt late payment interest calculator',
            'Statutory 8 percent interest invoice formula',
            'Court judgment late interest calculator'
        ],
        edgeCases: ['Single day overdue', 'Zero principal'],
        calculate: (inputs) => {
            const principal = Number(inputs.principalAmount) || 12500;
            const days = Number(inputs.daysOverdue) || 65;
            const apr = (Number(inputs.statutoryRate) || 8.0) / 100;
            const fixedFee = Number(inputs.fixedCompensation) || 70;

            // Simple statutory daily interest: (Principal * APR * Days) / 365
            const dailyInterest = (principal * apr) / 365;
            const totalInterest = dailyInterest * days;
            const totalOwed = principal + totalInterest + fixedFee;

            return {
                primaryOutput: { label: 'Total Outstanding Balance Due', value: totalOwed.toFixed(2), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Accrued Statutory Interest', value: `$${totalInterest.toFixed(2)}` },
                    { label: 'Daily Accrual Rate', value: `$${dailyInterest.toFixed(2)} / day` },
                    { label: 'Statutory Late Fee Claim', value: `$${fixedFee.toFixed(2)}` },
                    { label: 'Original Principal Amount', value: `$${principal.toFixed(2)}` }
                ]
            };
        }
    }
];