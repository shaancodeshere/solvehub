import { CalculatorDefinition } from '@/types/calculator';

export const legalComplianceCalculators: CalculatorDefinition[] = [
    // 1. Alimony Calculator
    {
        id: 'alimony-calculator',
        name: 'Alimony Calculator',
        category: 'legal-compliance',
        group: 'Legal & Compliance',
        bucket: 'Bucket A',
        tier: 3,
        phase: 3,
        monthlySearches: '5K',
        cpc: '$1.03',
        description: "Alimony Calculator tool.",
        inputs: [
            { id: 'payerMonthlyGross', name: 'Higher Earner Monthly Gross Income', type: 'number', defaultValue: 9500, min: 1000, step: 500, prefix: '$', tooltip: 'Payer monthly gross.' },
            { id: 'recipientMonthlyGross', name: 'Lower Earner Monthly Gross Income', type: 'number', defaultValue: 3200, min: 0, step: 250, prefix: '$', tooltip: 'Recipient monthly gross.' },
            { id: 'marriageDurationYears', name: 'Length of Marriage (Years)', type: 'number', defaultValue: 12, min: 1, max: 50, step: 1, suffix: 'yrs', tooltip: 'Marriage duration.' },
            { id: 'guidelineFormula', name: 'Jurisdiction Guideline Formula', type: 'dropdown', defaultValue: 'aaml', options: [{ label: 'AAML Standard (30% Payer - 20% Recipient)', value: 'aaml' }, { label: 'California Guideline (40% Payer - 50% Recipient Net)', value: 'ca' }, { label: 'New York Statutory (20% Payer - 25% Recipient)', value: 'ny' }, { label: 'Texas Cap Formula (20% Payer capped at $5k/mo)', value: 'tx' }], tooltip: 'Statutory formula.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const payer = Number(inputs.payerMonthlyGross) || 9500;
            const recipient = Number(inputs.recipientMonthlyGross) || 3200;
            const years = Number(inputs.marriageDurationYears) || 12;
            const formula = String(inputs.guidelineFormula || 'aaml');

            let monthlyAlimony = 0;
            if (formula === 'aaml') {
                // AAML: 30% of payer's gross minus 20% of recipient's gross.
                // Combined support + recipient income cannot exceed 40% of combined gross.
                const raw = (payer * 0.30) - (recipient * 0.20);
                const cap = ((payer + recipient) * 0.40) - recipient;
                monthlyAlimony = Math.max(0, Math.min(raw, cap));
            } else if (formula === 'ca') {
                // CA temporary guideline approx: 40% of payer gross - 50% of recipient gross
                monthlyAlimony = Math.max(0, (payer * 0.40) - (recipient * 0.50));
            } else if (formula === 'ny') {
                // NY: 20% payer - 25% recipient
                monthlyAlimony = Math.max(0, (payer * 0.20) - (recipient * 0.25));
            } else if (formula === 'tx') {
                // TX: 20% payer gross up to max $5,000/mo
                monthlyAlimony = Math.min(5000, Math.max(0, payer * 0.20));
            }

            // Estimated duration
            let durationFactor = 0.50;
            let durationText = '50% of Marriage Duration';
            if (years < 5) { durationFactor = 0.30; durationText = `${(years * 0.3).toFixed(1)} Years (Short marriage)`; }
            else if (years < 10) { durationFactor = 0.40; durationText = `${(years * 0.4).toFixed(1)} Years`; }
            else if (years < 20) { durationFactor = 0.60; durationText = `${(years * 0.6).toFixed(1)} Years`; }
            else { durationFactor = 1.0; durationText = 'Indefinite / Long-Term (20+ years marriage)'; }

            const annualAlimony = monthlyAlimony * 12;
            const estimatedDurationYears = years >= 20 ? 20 : (years * durationFactor);
            const totalEstimatedPayout = annualAlimony * estimatedDurationYears;

            return {
                primaryOutput: { label: 'Estimated Monthly Spousal Support', value: `$${Math.round(monthlyAlimony).toLocaleString()}`, suffix: '/ month' },
                secondaryMetrics: [
                    { label: 'Estimated Support Duration', value: durationText },
                    { label: 'Annual Alimony Obligation', value: `$${Math.round(annualAlimony).toLocaleString()} / year` },
                    { label: 'Total Estimated Lifetime Support', value: `$${Math.round(totalEstimatedPayout).toLocaleString()}` },
                    { label: 'Post-Support Income Disparity', value: `Payer: $${Math.round(payer - monthlyAlimony).toLocaleString()} / Recipient: $${Math.round(recipient + monthlyAlimony).toLocaleString()}` }
                ]
            };
        }
    },
    // 2. Child Support Calculator
    {
        id: 'child-support-calculator',
        name: 'Child Support Calculator',
        category: 'legal-compliance',
        group: 'Legal & Compliance',
        bucket: 'Bucket A',
        tier: 5,
        phase: 4,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "Child Support Calculator tool.",
        inputs: [
            { id: 'payerNetMonthly', name: 'Non-Custodial Parent Monthly Net Income', type: 'number', defaultValue: 5200, min: 500, step: 250, prefix: '$', tooltip: 'Net monthly take-home.' },
            { id: 'recipientNetMonthly', name: 'Custodial Parent Monthly Net Income', type: 'number', defaultValue: 3400, min: 0, step: 250, prefix: '$', tooltip: 'Net monthly take-home.' },
            { id: 'numChildren', name: 'Number of Dependent Children', type: 'dropdown', defaultValue: 2, options: [{ label: '1 Child (~18% Combined)', value: 1 }, { label: '2 Children (~25% Combined)', value: 2 }, { label: '3 Children (~30% Combined)', value: 3 }, { label: '4+ Children (~35% Combined)', value: 4 }], tooltip: 'Number of children.' },
            { id: 'healthDaycareMonthly', name: 'Monthly Childcare & Health Insurance ($)', type: 'number', defaultValue: 800, min: 0, step: 100, prefix: '$', tooltip: 'Total health & daycare costs.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const payerNet = Number(inputs.payerNetMonthly) || 5200;
            const recipientNet = Number(inputs.recipientNetMonthly) || 3400;
            const children = Number(inputs.numChildren) || 2;
            const extraCosts = Number(inputs.healthDaycareMonthly) || 800;

            const combinedNet = payerNet + recipientNet;
            const payerSharePercent = payerNet / combinedNet;

            // Income Shares standard basic schedule percentage
            let baseRate = 0.18;
            if (children === 2) baseRate = 0.25;
            else if (children === 3) baseRate = 0.30;
            else if (children >= 4) baseRate = 0.35;

            const basicSupportCombined = combinedNet * baseRate;
            const totalSupportObligation = basicSupportCombined + extraCosts;
            const payerMonthlyPayment = totalSupportObligation * payerSharePercent;

            return {
                primaryOutput: { label: 'Monthly Child Support Payment', value: `$${Math.round(payerMonthlyPayment).toLocaleString()}`, suffix: '/ month' },
                secondaryMetrics: [
                    { label: 'Payer Pro-Rata Income Share', value: `${(payerSharePercent * 100).toFixed(1)}% of Combined Income` },
                    { label: 'Annual Child Support Total', value: `$${Math.round(payerMonthlyPayment * 12).toLocaleString()} / year` },
                    { label: 'Total Combined Child Support Need', value: `$${Math.round(totalSupportObligation).toLocaleString()} / month` },
                    { label: 'Payer Share of Health & Daycare', value: `$${Math.round(extraCosts * payerSharePercent).toLocaleString()} / month` }
                ]
            };
        }
    },
    // 3. Legal Fee Calculator
    {
        id: 'legal-fee-calculator',
        name: 'Legal Fee Calculator',
        category: 'legal-compliance',
        group: 'Legal & Compliance',
        bucket: 'Bucket A',
        tier: 3,
        phase: 3,
        monthlySearches: '5K',
        cpc: '$4.78',
        description: "Legal Fee Calculator tool.",
        inputs: [
            { id: 'feeStructure', name: 'Attorney Billing Arrangement', type: 'dropdown', defaultValue: 'hourly', options: [{ label: 'Hourly Billing Rate', value: 'hourly' }, { label: 'Contingency Fee (% of Settlement)', value: 'contingency' }, { label: 'Flat Fee / Retainer', value: 'flat' }], tooltip: 'Billing model.' },
            { id: 'hourlyRate', name: 'Attorney Hourly Rate ($/hr)', type: 'number', defaultValue: 375, min: 50, step: 25, prefix: '$', tooltip: 'Hourly fee.' },
            { id: 'hoursBilled', name: 'Estimated Billable Hours', type: 'number', defaultValue: 35, min: 1, step: 5, suffix: 'hrs', tooltip: 'Hours worked.' },
            { id: 'settlementAmount', name: 'Settlement Amount (for Contingency)', type: 'number', defaultValue: 100000, min: 1000, step: 5000, prefix: '$', tooltip: 'Contingency recovery.' },
            { id: 'contingencyPct', name: 'Contingency Fee (%)', type: 'number', defaultValue: 33.3, min: 15, max: 50, step: 0.1, suffix: '%', tooltip: 'Contingency %.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const structure = String(inputs.feeStructure || 'hourly');
            const rate = Number(inputs.hourlyRate) || 375;
            const hours = Number(inputs.hoursBilled) || 35;
            const settlement = Number(inputs.settlementAmount) || 100000;
            const contPct = (Number(inputs.contingencyPct) || 33.3) / 100;

            let totalFees = 0;
            let netClient = 0;

            if (structure === 'hourly') {
                totalFees = rate * hours;
                netClient = 0;
            } else if (structure === 'contingency') {
                totalFees = settlement * contPct;
                netClient = settlement - totalFees;
            } else {
                totalFees = 5000;
            }

            const estimatedParalegalFees = structure === 'hourly' ? (hours * 0.25 * 125) : 0;
            const grandTotal = totalFees + estimatedParalegalFees;

            return {
                primaryOutput: { label: 'Total Estimated Legal Fees', value: `$${Math.round(grandTotal).toLocaleString()}`, suffix: structure === 'contingency' ? `${(contPct * 100).toFixed(1)}% Contingency` : `${hours} Hours Billed` },
                secondaryMetrics: [
                    { label: 'Attorney Base Fee', value: `$${Math.round(totalFees).toLocaleString()}` },
                    { label: 'Net Client Settlement Recovery', value: structure === 'contingency' ? `$${Math.round(netClient).toLocaleString()}` : 'N/A (Direct Out-of-Pocket Expense)' },
                    { label: 'Paralegal & Associate Support Fees', value: `$${Math.round(estimatedParalegalFees).toLocaleString()}` },
                    { label: 'Effective Billing Rate', value: `$${rate} / hour` }
                ]
            };
        }
    },
    // 4. Workers Compensation Calculator
    {
        id: 'workers-compensation-calculator',
        name: 'Workers Compensation Calculator',
        category: 'legal-compliance',
        group: 'Legal & Compliance',
        bucket: 'Bucket A',
        tier: 5,
        phase: 4,
        monthlySearches: '590',
        cpc: '$8.79  ★ HIGH CPC',
        description: "Workers Compensation Calculator tool.",
        inputs: [
            { id: 'grossWeeklyWage', name: 'Pre-Injury Average Weekly Wage ($)', type: 'number', defaultValue: 1350, min: 100, step: 50, prefix: '$', tooltip: 'Gross weekly earnings.' },
            { id: 'weeksOffWork', name: 'Temporary Total Disability Weeks (TTD)', type: 'number', defaultValue: 16, min: 1, max: 104, step: 1, suffix: 'weeks', tooltip: 'Weeks unable to work.' },
            { id: 'impairmentRatingPercent', name: 'Permanent Impairment Rating (%)', type: 'number', defaultValue: 15, min: 0, max: 100, step: 1, suffix: '%', tooltip: 'Doctor assigned disability %.' },
            { id: 'statutoryMaxTTD', name: 'State Max Weekly TTD Cap ($)', type: 'number', defaultValue: 1100, min: 500, step: 50, prefix: '$', tooltip: 'State statutory maximum.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const aww = Number(inputs.grossWeeklyWage) || 1350;
            const weeksTTD = Number(inputs.weeksOffWork) || 16;
            const impairmentPct = (Number(inputs.impairmentRatingPercent) || 15) / 100;
            const maxCap = Number(inputs.statutoryMaxTTD) || 1100;

            // 66.67% of Average Weekly Wage capped at state maximum
            const rawTTD = aww * (2 / 3);
            const weeklyBenefit = Math.min(rawTTD, maxCap);
            const totalTTDPaid = weeklyBenefit * weeksTTD;

            // PPD award: standard schedule approx 300 weeks * impairment rating * weekly benefit rate
            const ppdWeeks = 300 * impairmentPct;
            const estimatedPPDAward = ppdWeeks * weeklyBenefit;
            const totalClaimValue = totalTTDPaid + estimatedPPDAward;

            return {
                primaryOutput: { label: 'Weekly Wage Replacement (TTD)', value: `$${Math.round(weeklyBenefit).toLocaleString()} / wk`, suffix: 'Tax-Free Benefit' },
                secondaryMetrics: [
                    { label: 'Total Temporary Disability (TTD) Paid', value: `$${Math.round(totalTTDPaid).toLocaleString()} (${weeksTTD} weeks)` },
                    { label: 'Estimated Permanent Disability (PPD) Award', value: `$${Math.round(estimatedPPDAward).toLocaleString()} (${(impairmentPct * 100).toFixed(0)}% rating)` },
                    { label: 'Total Estimated Indemnity Compensation', value: `$${Math.round(totalClaimValue).toLocaleString()}` },
                    { label: 'Statutory Benefit Cap Status', value: rawTTD > maxCap ? `Capped at State Max ($${maxCap}/wk)` : 'Full 66.7% Wage Replacement Rate' }
                ]
            };
        }
    },
    // 5. Employment Severance Calculator
    {
        id: 'employment-severance-calculator',
        name: 'Employment Severance Calculator',
        category: 'legal-compliance',
        group: 'Legal & Compliance',
        bucket: 'Bucket A',
        tier: 5,
        phase: 4,
        monthlySearches: '70',
        cpc: '$0.76',
        description: "Employment Severance Calculator tool.",
        inputs: [
            { id: 'annualSalary', name: 'Annual Base Salary ($)', type: 'number', defaultValue: 95000, min: 10000, step: 2500, prefix: '$', tooltip: 'Yearly salary.' },
            { id: 'yearsOfService', name: 'Years with Employer', type: 'number', defaultValue: 6, min: 0.5, max: 40, step: 0.5, suffix: 'yrs', tooltip: 'Tenure.' },
            { id: 'weeksPerYearMultiplier', name: 'Severance Weeks per Year of Service', type: 'dropdown', defaultValue: 2, options: [{ label: '1 Week per Year (Entry Standard)', value: 1 }, { label: '2 Weeks per Year (Standard Professional)', value: 2 }, { label: '3 Weeks per Year (Senior / Management)', value: 3 }, { label: '4 Weeks per Year (Executive)', value: 4 }], tooltip: 'Company severance policy.' },
            { id: 'unusedPTOHours', name: 'Accrued Unused PTO (Hours)', type: 'number', defaultValue: 48, min: 0, step: 8, suffix: 'hrs', tooltip: 'Paid time off payout.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const salary = Number(inputs.annualSalary) || 95000;
            const years = Number(inputs.yearsOfService) || 6;
            const multiplier = Number(inputs.weeksPerYearMultiplier) || 2;
            const ptoHours = Number(inputs.unusedPTOHours) || 48;

            const weeklyRate = salary / 52;
            const hourlyRate = salary / 2080;

            const severanceWeeks = Math.max(2, years * multiplier);
            const severancePay = severanceWeeks * weeklyRate;
            const ptoPayout = ptoHours * hourlyRate;
            const cobraHealthEst = 3 * 750; // 3 months typical health bridge

            const totalPackage = severancePay + ptoPayout + cobraHealthEst;

            return {
                primaryOutput: { label: 'Total Estimated Severance Package', value: `$${Math.round(totalPackage).toLocaleString()}`, suffix: `${severanceWeeks.toFixed(1)} Weeks Pay` },
                secondaryMetrics: [
                    { label: 'Base Severance Pay', value: `$${Math.round(severancePay).toLocaleString()}` },
                    { label: 'Accrued PTO Payout', value: `$${Math.round(ptoPayout).toLocaleString()} (${ptoHours} hours)` },
                    { label: 'Estimated COBRA Health Bridge (3 mo)', value: `$${Math.round(cobraHealthEst).toLocaleString()}` },
                    { label: 'Weekly Salary Equivalent', value: `$${Math.round(weeklyRate).toLocaleString()} / week` }
                ]
            };
        }
    },
    // 6. Settlement Calculator
    {
        id: 'settlement-calculator',
        name: 'Settlement Calculator',
        category: 'legal-compliance',
        group: 'Legal & Compliance',
        bucket: 'Bucket A',
        tier: 4,
        phase: 4,
        monthlySearches: '3K',
        cpc: '$14.03  ★ HIGH CPC',
        description: "Settlement Calculator tool.",
        inputs: [
            { id: 'medicalBills', name: 'Past & Future Medical Expenses ($)', type: 'number', defaultValue: 30000, min: 500, step: 2500, prefix: '$', tooltip: 'Total medical bills.' },
            { id: 'lostWages', name: 'Lost Wages & Income ($)', type: 'number', defaultValue: 9500, min: 0, step: 500, prefix: '$', tooltip: 'Lost earnings.' },
            { id: 'painSufferingMultiplier', name: 'Pain & Suffering Severity Multiplier', type: 'dropdown', defaultValue: 2.5, options: [{ label: '1.5x (Minor / Soft Tissue Strain)', value: 1.5 }, { label: '2.5x (Moderate / Broken Bone / Physical Therapy)', value: 2.5 }, { label: '4.0x (Severe / Surgery / Disc Herniation)', value: 4.0 }, { label: '5.0x+ (Catastrophic / Permanent Disability)', value: 5.0 }], tooltip: 'Pain multiplier.' },
            { id: 'attorneyFeePercent', name: 'Attorney Contingency Fee (%)', type: 'number', defaultValue: 33.3, min: 20, max: 45, step: 0.1, suffix: '%', tooltip: 'Attorney fee percentage.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const med = Number(inputs.medicalBills) || 30000;
            const wages = Number(inputs.lostWages) || 9500;
            const mult = Number(inputs.painSufferingMultiplier) || 2.5;
            const attyPct = (Number(inputs.attorneyFeePercent) || 33.3) / 100;

            const specialDamages = med + wages;
            const generalDamages = med * mult; // Pain & suffering based on medical severity
            const grossSettlement = specialDamages + generalDamages;

            const attyFee = grossSettlement * attyPct;
            const caseCosts = Math.round(grossSettlement * 0.03); // approx 3% litigation expenses
            const netToClient = Math.max(0, grossSettlement - attyFee - med - caseCosts);

            return {
                primaryOutput: { label: 'Estimated Gross Settlement Value', value: `$${Math.round(grossSettlement).toLocaleString()}`, suffix: `Multiplier: ${mult}x` },
                secondaryMetrics: [
                    { label: 'Estimated Net in Pocket to You', value: `$${Math.round(netToClient).toLocaleString()}` },
                    { label: 'Pain & Suffering Non-Economic Damages', value: `$${Math.round(generalDamages).toLocaleString()}` },
                    { label: 'Attorney Legal Fee', value: `$${Math.round(attyFee).toLocaleString()} (${(attyPct * 100).toFixed(1)}%)` },
                    { label: 'Total Economic Hard Damages', value: `$${Math.round(specialDamages).toLocaleString()}` }
                ]
            };
        }
    },
    // 7. Court Fine Calculator
    {
        id: 'court-fine-calculator',
        name: 'Court Fine Calculator',
        category: 'legal-compliance',
        group: 'Legal & Compliance',
        bucket: 'Bucket A',
        tier: 5,
        phase: 4,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "Court Fine Calculator tool.",
        inputs: [
            { id: 'baseFine', name: 'Statutory Base Citation Fine ($)', type: 'number', defaultValue: 100, min: 10, step: 25, prefix: '$', tooltip: 'Base ticket fine.' },
            { id: 'penaltyAssessmentFactor', name: 'State Penalty Assessment Rate', type: 'dropdown', defaultValue: 2.6, options: [{ label: 'Standard State ($26 per $10 base - 260%)', value: 2.6 }, { label: 'High Assessment State (300%)', value: 3.0 }, { label: 'Low Assessment State (150%)', value: 1.5 }], tooltip: 'Mandatory surcharges.' },
            { id: 'courtSecurityConvictionFee', name: 'Court Security & Operations Fees ($)', type: 'number', defaultValue: 75, min: 0, step: 10, prefix: '$', tooltip: 'Fixed administrative court fees.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const base = Number(inputs.baseFine) || 100;
            const factor = Number(inputs.penaltyAssessmentFactor) || 2.6;
            const adminFees = Number(inputs.courtSecurityConvictionFee) || 75;

            const statutoryPenaltyAssessment = base * factor;
            const totalFine = base + statutoryPenaltyAssessment + adminFees;
            const trafficSchoolFee = 64;

            return {
                primaryOutput: { label: 'Total Court Fine Obligation', value: `$${Math.round(totalFine).toLocaleString()}`, suffix: `$${base} Base Ticket` },
                secondaryMetrics: [
                    { label: 'State Penalty Assessments & Surcharges', value: `$${Math.round(statutoryPenaltyAssessment).toLocaleString()}` },
                    { label: 'Mandatory Court Security & Admin Fees', value: `$${Math.round(adminFees).toLocaleString()}` },
                    { label: 'With Traffic School Option', value: `$${Math.round(totalFine + trafficSchoolFee).toLocaleString()} (+$${trafficSchoolFee} fee)` },
                    { label: 'Surcharge Multiplier Rate', value: `${(factor * 100).toFixed(0)}% above base fine` }
                ]
            };
        }
    },
    // 8. Statute of Limitations Calculator
    {
        id: 'statute-of-limitations-calculator',
        name: 'Statute of Limitations Calculator',
        category: 'legal-compliance',
        group: 'Legal & Compliance',
        bucket: 'Bucket A',
        tier: 5,
        phase: 4,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "Statute of Limitations Calculator tool.",
        inputs: [
            { id: 'yearsSinceIncident', name: 'Years Elapsed Since Incident / Breach', type: 'number', defaultValue: 1.5, min: 0.1, max: 20, step: 0.25, suffix: 'yrs', tooltip: 'Time since incident.' },
            { id: 'claimType', name: 'Legal Cause of Action', type: 'dropdown', defaultValue: 'personal_injury', options: [{ label: 'Personal Injury / Car Accident (2 Years)', value: 'personal_injury' }, { label: 'Written Contract Breach (4-6 Years)', value: 'written_contract' }, { label: 'Oral / Verbal Agreement (2 Years)', value: 'oral_contract' }, { label: 'Medical Malpractice (2.5 Years)', value: 'med_mal' }, { label: 'Property Damage (3 Years)', value: 'property_damage' }, { label: 'Defamation / Slander / Libel (1 Year)', value: 'defamation' }], tooltip: 'Cause of action.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const elapsed = Number(inputs.yearsSinceIncident) || 1.5;
            const type = String(inputs.claimType || 'personal_injury');

            let limitYears = 2.0;
            if (type === 'written_contract') limitYears = 4.0;
            else if (type === 'oral_contract') limitYears = 2.0;
            else if (type === 'med_mal') limitYears = 2.5;
            else if (type === 'property_damage') limitYears = 3.0;
            else if (type === 'defamation') limitYears = 1.0;

            const remainingYears = limitYears - elapsed;
            const remainingMonths = Math.max(0, remainingYears * 12);
            const remainingDays = Math.max(0, Math.round(remainingYears * 365));

            let status = 'ACTIVE: Within Legal Filing Window';
            if (remainingYears <= 0) status = 'EXPIRED: Time-Barred under Statute of Limitations';
            else if (remainingYears < 0.5) status = 'CRITICAL URGENCY: Expiring in under 6 months!';

            return {
                primaryOutput: { label: 'Statute of Limitations Status', value: remainingYears > 0 ? `${remainingDays} Days Remaining` : 'EXPIRED / TIME-BARRED', suffix: status.split(':')[0] },
                secondaryMetrics: [
                    { label: 'Time Remaining to File Lawsuit', value: remainingYears > 0 ? `${remainingMonths.toFixed(1)} Months (${remainingYears.toFixed(2)} Years)` : '0 Days (Filing deadline passed)' },
                    { label: 'Statutory Limitation Window', value: `${limitYears} Years Total Period` },
                    { label: 'Elapsed Duration', value: `${elapsed} Years (${Math.round(elapsed * 365)} Days)` },
                    { label: 'Legal Compliance Verdict', value: status }
                ]
            };
        }
    },
    // 9. Contract Value Calculator
    {
        id: 'contract-value-calculator',
        name: 'Contract Value Calculator',
        category: 'legal-compliance',
        group: 'Legal & Compliance',
        bucket: 'Bucket B',
        tier: 5,
        phase: 4,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "Contract Value Calculator tool.",
        inputs: [
            { id: 'baseAnnualValue', name: 'Annual Contract Base Value ($)', type: 'number', defaultValue: 120000, min: 1000, step: 5000, prefix: '$', tooltip: 'Base yearly value.' },
            { id: 'contractTermYears', name: 'Contract Term (Years)', type: 'number', defaultValue: 3, min: 1, max: 10, step: 1, suffix: 'yrs', tooltip: 'Agreement length.' },
            { id: 'annualEscalationPct', name: 'Annual Price Escalation (%)', type: 'number', defaultValue: 4.0, min: 0, max: 20, step: 0.5, suffix: '%', tooltip: 'Yearly rate increase.' },
            { id: 'contingencyBufferPct', name: 'Contingency & Scope Buffer (%)', type: 'number', defaultValue: 10, min: 0, max: 30, step: 1, suffix: '%', tooltip: 'Contingency reserve.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const base = Number(inputs.baseAnnualValue) || 120000;
            const years = Number(inputs.contractTermYears) || 3;
            const esc = (Number(inputs.annualEscalationPct) || 4.0) / 100;
            const contingency = (Number(inputs.contingencyBufferPct) || 10) / 100;

            let totalNominal = 0;
            let currentYearValue = base;
            for (let i = 0; i < years; i++) {
                totalNominal += currentYearValue;
                currentYearValue *= (1 + esc);
            }

            const contingencyAmount = totalNominal * contingency;
            const grandTotalContractValue = totalNominal + contingencyAmount;
            const avgAnnualValue = grandTotalContractValue / years;

            return {
                primaryOutput: { label: 'Total Contract Value (TCV)', value: `$${Math.round(grandTotalContractValue).toLocaleString()}`, suffix: `${years}-Year Agreement` },
                secondaryMetrics: [
                    { label: 'Nominal Term Revenue (Excl. Contingency)', value: `$${Math.round(totalNominal).toLocaleString()}` },
                    { label: 'Contingency & Scope Expansion Reserve', value: `$${Math.round(contingencyAmount).toLocaleString()} (${(contingency * 100).toFixed(0)}%)` },
                    { label: 'Average Annual Contract Value (ACV)', value: `$${Math.round(avgAnnualValue).toLocaleString()} / year` },
                    { label: 'Final Year Annual Run-Rate', value: `$${Math.round(base * Math.pow(1 + esc, years - 1)).toLocaleString()} / year` }
                ]
            };
        }
    },
// 10. GDPR Fine Calculator
    {
        id: 'gdpr-fine-calculator',
        name: 'GDPR Fine Calculator',
        category: 'legal-compliance',
        group: 'Corporate & Regulatory',
        bucket: 'Bucket C',
        tier: 2,
        phase: 2,
        monthlySearches: '45K',
        cpc: '$6.50',
        description: "A GDPR Fine Calculator determines statutory maximum data protection regulatory fine ceilings under EU GDPR Article 83 for Tier 1 and Tier 2 corporate infringements.",
        inputs: [
            { id: 'infringementTier', name: 'GDPR Infringement Classification', type: 'dropdown', defaultValue: 'tier2_severe', options: [{ label: 'Tier 2 Severe: Art 5, 6, 9 Data Breach / Consent / Rights (Up to €20M or 4% Turnover)', value: 'tier2_severe' }, { label: 'Tier 1 Standard: Art 8, 11, 25-39 Security / DPO / Records (Up to €10M or 2% Turnover)', value: 'tier1_standard' }], tooltip: 'Statutory infringement severity under Article 83.' },
            { id: 'globalTurnoverEUR', name: 'Annual Global Corporate Turnover (€ EUR)', type: 'number', defaultValue: 150000000, min: 100000, step: 5000000, prefix: '€', tooltip: 'Preceding financial year total global revenue.' },
            { id: 'culpabilityLevel', name: 'Culpability & Mitigating Factors', type: 'dropdown', defaultValue: 'moderate', options: [{ label: 'High / Intentional Negligence (80% Exposure Factor)', value: 0.80 }, { label: 'Moderate Negligence / Cooperative (45% Exposure Factor)', value: 0.45 }, { label: 'Minor Technical Oversight / Self-Reported (20% Exposure Factor)', value: 0.20 }], tooltip: 'Mitigating circumstances factor.' }
        ],
        naturalLanguageQueries: ["GDPR fine calculator maximum penalty", "Calculate GDPR Article 83 statutory fine percentage turnover", "EU data protection fine exposure calculator"],
        edgeCases: ["Turnover where percentage exceeds static €20M cap", "Zero turnover", "Non-profit or governmental exemptions"],
        calculate: (inputs) => {
            const tier = String(inputs.infringementTier || 'tier2_severe');
            const turnover = Number(inputs.globalTurnoverEUR) || 150000000;
            const factor = Number(inputs.culpabilityLevel) || 0.45;

            // GDPR Article 83(4) & 83(5):
            // Tier 1: Higher of €10,000,000 or 2% of annual global turnover
            // Tier 2: Higher of €20,000,000 or 4% of annual global turnover
            let staticCap = 20000000;
            let turnoverPct = 0.04;
            let tierName = 'Tier 2 (Severe Infringement - Art 83(5))';

            if (tier === 'tier1_standard') {
                staticCap = 10000000;
                turnoverPct = 0.02;
                tierName = 'Tier 1 (Standard Infringement - Art 83(4))';
            }

            const turnoverCeiling = turnover * turnoverPct;
            const statutoryMaximum = Math.max(staticCap, turnoverCeiling);
            const estimatedExposure = statutoryMaximum * factor;

            return {
                primaryOutput: { label: 'Statutory Maximum Fine Ceiling', value: `€${Math.round(statutoryMaximum).toLocaleString()} EUR`, suffix: turnoverCeiling > staticCap ? `${(turnoverPct * 100).toFixed(0)}% Global Turnover Applied` : `Static Statutory Cap (€${staticCap / 1000000}M)` },
                secondaryMetrics: [
                    { label: 'Risk-Adjusted Estimated Fine Exposure', value: `€${Math.round(estimatedExposure).toLocaleString()} EUR` },
                    { label: 'Statutory Classification', value: tierName },
                    { label: 'Turnover Percentage Benchmark', value: `€${Math.round(turnoverCeiling).toLocaleString()} (${(turnoverPct * 100).toFixed(0)}% of €${Math.round(turnover).toLocaleString()})` },
                    { label: 'Equivalent USD Estimate', value: `~$${Math.round(statutoryMaximum * 1.08).toLocaleString()} USD` }
                ]
            };
        }
    }
];

export const cat09LegalCalculators = legalComplianceCalculators;
export default legalComplianceCalculators;
