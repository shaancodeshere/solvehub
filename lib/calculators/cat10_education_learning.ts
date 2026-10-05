import { CalculatorDefinition } from '@/types/calculator';

export const educationLearningCalculators: CalculatorDefinition[] = [
    // 1. Student Loan Repayment Calculator
    {
        id: 'student-loan-repayment-calculator',
        name: 'Student Loan Repayment Calculator',
        category: 'education-learning',
        group: 'Education & Learning',
        bucket: 'Bucket A',
        tier: 2,
        phase: 2,
        monthlySearches: '40K',
        cpc: '$4.13',
        description: "Student Loan Repayment Calculator tool.",
        inputs: [
            { id: 'loanBalance', name: 'Total Student Loan Balance ($)', type: 'number', defaultValue: 38000, min: 1000, step: 1000, prefix: '$', tooltip: 'Current loan principal balance.' },
            { id: 'interestRate', name: 'Annual Interest Rate (%)', type: 'number', defaultValue: 6.5, min: 0.1, max: 20, step: 0.1, suffix: '%', tooltip: 'Fixed interest rate.' },
            { id: 'loanTermYears', name: 'Repayment Term (Years)', type: 'dropdown', defaultValue: 10, options: [{ label: '10 Years (Standard Federal Plan)', value: 10 }, { label: '15 Years (Extended)', value: 15 }, { label: '20 Years (Income-Driven / Consolidated)', value: 20 }, { label: '25 Years (Extended Fixed)', value: 25 }], tooltip: 'Term length.' },
            { id: 'extraMonthly', name: 'Extra Monthly Payment ($)', type: 'number', defaultValue: 75, min: 0, step: 25, prefix: '$', tooltip: 'Additional monthly principal.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const balance = Number(inputs.loanBalance) || 38000;
            const rate = (Number(inputs.interestRate) || 6.5) / 100 / 12;
            const years = Number(inputs.loanTermYears) || 10;
            const extra = Number(inputs.extraMonthly) || 75;

            const nMonths = years * 12;
            const monthlyPayment = (balance * (rate * Math.pow(1 + rate, nMonths))) / (Math.pow(1 + rate, nMonths) - 1);
            const standardTotalInterest = (monthlyPayment * nMonths) - balance;

            // Extra payment payoff simulation
            let remBalance = balance;
            let actualMonths = 0;
            let actualInterest = 0;
            const totalMonthly = monthlyPayment + extra;

            while (remBalance > 0 && actualMonths < 600) {
                const interestMonth = remBalance * rate;
                actualInterest += interestMonth;
                const principalMonth = Math.min(remBalance, totalMonthly - interestMonth);
                remBalance -= principalMonth;
                actualMonths++;
            }

            const interestSaved = Math.max(0, standardTotalInterest - actualInterest);
            const monthsSaved = Math.max(0, nMonths - actualMonths);
            const yearsSaved = (monthsSaved / 12).toFixed(1);

            return {
                primaryOutput: { label: 'Monthly Payment Required', value: `$${Math.round(monthlyPayment).toLocaleString()} / mo`, suffix: `$${Math.round(totalMonthly)} with extra` },
                secondaryMetrics: [
                    { label: 'Total Standard Interest', value: `$${Math.round(standardTotalInterest).toLocaleString()}` },
                    { label: 'Interest Saved with Extra Payments', value: `$${Math.round(interestSaved).toLocaleString()}` },
                    { label: 'Payoff Time Acceleration', value: extra > 0 ? `${yearsSaved} Years Sooner (${actualMonths} vs ${nMonths} months)` : 'Standard Schedule' },
                    { label: 'Total Lifetime Loan Cost', value: `$${Math.round(balance + actualInterest).toLocaleString()}` }
                ]
            };
        }
    },
    // 2. Scholarship Savings Calculator
    {
        id: 'scholarship-savings-calculator',
        name: 'Scholarship Savings Calculator',
        category: 'education-learning',
        group: 'Education & Learning',
        bucket: 'Bucket B',
        tier: 5,
        phase: 5,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "Scholarship Savings Calculator tool.",
        inputs: [
            { id: 'annualTuition', name: 'Annual Tuition & Fees ($)', type: 'number', defaultValue: 28000, min: 1000, step: 1000, prefix: '$', tooltip: 'Tuition per year.' },
            { id: 'annualScholarship', name: 'Annual Scholarship / Grant Award ($)', type: 'number', defaultValue: 12500, min: 500, step: 500, prefix: '$', tooltip: 'Scholarship amount per year.' },
            { id: 'collegeYears', name: 'Program Length (Years)', type: 'number', defaultValue: 4, min: 1, max: 6, step: 1, suffix: 'yrs', tooltip: 'Degree duration.' },
            { id: 'loanInterestRate', name: 'Avoided Student Loan Rate (%)', type: 'number', defaultValue: 6.0, min: 1, max: 15, step: 0.5, suffix: '%', tooltip: 'Typical loan rate avoided.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const tuition = Number(inputs.annualTuition) || 28000;
            const scholarship = Number(inputs.annualScholarship) || 12500;
            const years = Number(inputs.collegeYears) || 4;
            const loanRate = (Number(inputs.loanInterestRate) || 6.0) / 100 / 12;

            const totalTuition = tuition * years;
            const directGrantSavings = scholarship * years;
            const netTuitionCost = Math.max(0, totalTuition - directGrantSavings);
            const percentDiscount = (directGrantSavings / totalTuition) * 100;

            // 10-year loan interest avoided on the scholarship balance
            const nMonths = 120;
            const monthlyPaymentAvoided = (directGrantSavings * (loanRate * Math.pow(1 + loanRate, nMonths))) / (Math.pow(1 + loanRate, nMonths) - 1);
            const loanInterestAvoided = (monthlyPaymentAvoided * nMonths) - directGrantSavings;
            const totalFinancialImpact = directGrantSavings + loanInterestAvoided;

            return {
                primaryOutput: { label: 'Direct Scholarship Aid', value: `$${Math.round(directGrantSavings).toLocaleString()}`, suffix: `${percentDiscount.toFixed(0)}% Tuition Covered` },
                secondaryMetrics: [
                    { label: 'Total Value (Aid + Avoided Loan Interest)', value: `$${Math.round(totalFinancialImpact).toLocaleString()}` },
                    { label: 'Avoided 10-Year Student Loan Interest', value: `$${Math.round(loanInterestAvoided).toLocaleString()}` },
                    { label: 'Net Remaining Tuition Cost', value: `$${Math.round(netTuitionCost).toLocaleString()} (${years} years)` },
                    { label: 'Monthly Loan Payment Saved', value: `$${Math.round(monthlyPaymentAvoided).toLocaleString()} / month` }
                ]
            };
        }
    },
    // 3. Tuition Inflation Calculator
    {
        id: 'tuition-inflation-calculator',
        name: 'Tuition Inflation Calculator',
        category: 'education-learning',
        group: 'Education & Learning',
        bucket: 'Bucket A',
        tier: 5,
        phase: 5,
        monthlySearches: '20',
        cpc: 'N/A',
        description: "Tuition Inflation Calculator tool.",
        inputs: [
            { id: 'currentAnnualCost', name: 'Current Annual College Cost ($)', type: 'number', defaultValue: 26000, min: 2000, step: 1000, prefix: '$', tooltip: 'Current tuition + room & board.' },
            { id: 'yearsUntilCollege', name: 'Years Until Child Attends College', type: 'number', defaultValue: 10, min: 1, max: 20, step: 1, suffix: 'yrs', tooltip: 'Years until enrollment.' },
            { id: 'tuitionInflationRate', name: 'Annual Tuition Inflation Rate (%)', type: 'number', defaultValue: 5.0, min: 1, max: 10, step: 0.5, suffix: '%', tooltip: 'Historical college inflation is ~5%.' },
            { id: 'investmentReturnRate', name: '529 Plan Expected Investment Return (%)', type: 'number', defaultValue: 7.0, min: 2, max: 12, step: 0.5, suffix: '%', tooltip: '529 growth rate.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const currentCost = Number(inputs.currentAnnualCost) || 26000;
            const years = Number(inputs.yearsUntilCollege) || 10;
            const infRate = (Number(inputs.tuitionInflationRate) || 5.0) / 100;
            const invRate = (Number(inputs.investmentReturnRate) || 7.0) / 100 / 12;

            // Future 4-year cost: year 1, 2, 3, 4 with ongoing inflation
            let totalFutureCost = 0;
            for (let i = 0; i < 4; i++) {
                totalFutureCost += currentCost * Math.pow(1 + infRate, years + i);
            }

            const futureYear1Tuition = currentCost * Math.pow(1 + infRate, years);
            const totalMonths = years * 12;

            // Monthly 529 savings needed to fund 100% of totalFutureCost
            // FV = PMT * ((1 + r)^n - 1) / r
            const monthly529Contribution = (totalFutureCost * invRate) / (Math.pow(1 + invRate, totalMonths) - 1);

            return {
                primaryOutput: { label: 'Projected 4-Year College Cost', value: `$${Math.round(totalFutureCost).toLocaleString()}`, suffix: `in ${years} Years` },
                secondaryMetrics: [
                    { label: 'Projected Year 1 Annual Tuition', value: `$${Math.round(futureYear1Tuition).toLocaleString()} / year` },
                    { label: 'Monthly 529 Savings Target', value: `$${Math.round(monthly529Contribution).toLocaleString()} / month` },
                    { label: 'Total Inflation Multiple', value: `${(totalFutureCost / (currentCost * 4)).toFixed(2)}x of Today's Cost` },
                    { label: "Today's 4-Year Baseline Cost", value: `$${Math.round(currentCost * 4).toLocaleString()}` }
                ]
            };
        }
    },
    // 4. Education ROI Calculator
    {
        id: 'education-roi-calculator',
        name: 'Education ROI Calculator',
        category: 'education-learning',
        group: 'Education & Learning',
        bucket: 'Bucket B',
        tier: 5,
        phase: 5,
        monthlySearches: '20',
        cpc: '$2.55',
        description: "Education ROI Calculator tool.",
        inputs: [
            { id: 'totalDegreeCost', name: 'Total Degree Investment Cost ($)', type: 'number', defaultValue: 75000, min: 2000, step: 2500, prefix: '$', tooltip: 'Tuition + fees + materials.' },
            { id: 'expectedStartingSalary', name: 'Expected Starting Graduate Salary ($)', type: 'number', defaultValue: 68000, min: 20000, step: 2000, prefix: '$', tooltip: 'Entry salary.' },
            { id: 'baselineSalary', name: 'Alternative / Without-Degree Salary ($)', type: 'number', defaultValue: 38000, min: 15000, step: 2000, prefix: '$', tooltip: 'Baseline salary.' },
            { id: 'careerHorizonYears', name: 'Career Evaluation Horizon (Years)', type: 'dropdown', defaultValue: 25, options: [{ label: '10 Years', value: 10 }, { label: '20 Years', value: 20 }, { label: '25 Years (Standard Career)', value: 25 }, { label: '35 Years (Full Career Lifetime)', value: 35 }], tooltip: 'Time horizon.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const cost = Number(inputs.totalDegreeCost) || 75000;
            const gradSalary = Number(inputs.expectedStartingSalary) || 68000;
            const baseSalary = Number(inputs.baselineSalary) || 38000;
            const years = Number(inputs.careerHorizonYears) || 25;

            const annualPremium = gradSalary - baseSalary;
            const breakevenYears = cost / annualPremium;

            // 3% annual wage growth lifetime calculation
            let totalGradEarnings = 0;
            let totalBaseEarnings = 0;
            let currGrad = gradSalary;
            let currBase = baseSalary;

            for (let i = 0; i < years; i++) {
                totalGradEarnings += currGrad;
                totalBaseEarnings += currBase;
                currGrad *= 1.03;
                currBase *= 1.025;
            }

            const netLifetimeGain = (totalGradEarnings - totalBaseEarnings) - cost;
            const roiPercent = ((totalGradEarnings - totalBaseEarnings) / cost) * 100;

            return {
                primaryOutput: { label: 'Lifetime Net Earnings Premium', value: `$${Math.round(netLifetimeGain).toLocaleString()}`, suffix: `${years}-Year Horizon` },
                secondaryMetrics: [
                    { label: 'Investment Breakeven Payback Period', value: `${breakevenYears.toFixed(1)} Years to Break Even` },
                    { label: 'Annual Salary Premium (Year 1)', value: `+$${Math.round(annualPremium).toLocaleString()} / year` },
                    { label: 'Total Education ROI', value: `${Math.round(roiPercent).toLocaleString()}% Return on Investment` },
                    { label: 'Lifetime Cumulative Career Advantage', value: `$${Math.round(totalGradEarnings - totalBaseEarnings).toLocaleString()} Gross Premium` }
                ]
            };
        }
    },
    // 5. Course Cost Calculator
    {
        id: 'course-cost-calculator',
        name: 'Course Cost Calculator',
        category: 'education-learning',
        group: 'Education & Learning',
        bucket: 'Bucket B',
        tier: 5,
        phase: 5,
        monthlySearches: '10',
        cpc: 'N/A',
        description: "Course Cost Calculator tool.",
        inputs: [
            { id: 'coursePrice', name: 'Course Tuition / Fee ($)', type: 'number', defaultValue: 1450, min: 10, step: 50, prefix: '$', tooltip: 'Course cost.' },
            { id: 'instructionHours', name: 'Total Instructional Hours', type: 'number', defaultValue: 40, min: 1, step: 5, suffix: 'hrs', tooltip: 'Class / video hours.' },
            { id: 'materialsSoftwareCost', name: 'Books, Software & Materials ($)', type: 'number', defaultValue: 150, min: 0, step: 25, prefix: '$', tooltip: 'Required materials.' },
            { id: 'expectedHourlyPayBump', name: 'Expected Hourly Wage Increase ($/hr)', type: 'number', defaultValue: 2.50, min: 0.25, step: 0.25, prefix: '$', tooltip: 'Projected raise upon completion.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const price = Number(inputs.coursePrice) || 1450;
            const hours = Number(inputs.instructionHours) || 40;
            const materials = Number(inputs.materialsSoftwareCost) || 150;
            const payBump = Number(inputs.expectedHourlyPayBump) || 2.50;

            const totalCost = price + materials;
            const costPerHour = totalCost / hours;
            const hoursToRecoup = totalCost / payBump;
            const weeksToRecoup = hoursToRecoup / 40;
            const annualWageGain = payBump * 2080;

            return {
                primaryOutput: { label: 'Cost per Instructional Hour', value: `$${costPerHour.toFixed(2)} / hour`, suffix: `$${Math.round(totalCost)} Total Cost` },
                secondaryMetrics: [
                    { label: 'Work Hours to Recoup Investment', value: `${Math.round(hoursToRecoup)} Hours (${weeksToRecoup.toFixed(1)} Weeks of Full-Time Work)` },
                    { label: 'Total Course All-In Investment', value: `$${Math.round(totalCost).toLocaleString()}` },
                    { label: 'Annual Salary Value of Skill Upgrade', value: `$${Math.round(annualWageGain).toLocaleString()} / year` },
                    { label: 'First Year Return on Course Cost', value: `${Math.round((annualWageGain / totalCost) * 100)}% Annual ROI` }
                ]
            };
        }
    },
    // 6. Learning Time Calculator
    {
        id: 'learning-time-calculator',
        name: 'Learning Time Calculator',
        category: 'education-learning',
        group: 'Education & Learning',
        bucket: 'Bucket B',
        tier: 5,
        phase: 5,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "Learning Time Calculator tool.",
        inputs: [
            { id: 'proficiencyTarget', name: 'Target Mastery Level', type: 'dropdown', defaultValue: 250, options: [{ label: 'Basic Familiarity / Conversational (50 Hours)', value: 50 }, { label: 'Intermediate Working Competence (250 Hours)', value: 250 }, { label: 'Professional Job-Ready Proficiency (600 Hours)', value: 600 }, { label: 'Senior Expert / Complete Mastery (2,000 Hours)', value: 2000 }], tooltip: 'Skill level target.' },
            { id: 'weeklyStudyHours', name: 'Weekly Dedicated Study Hours', type: 'number', defaultValue: 10, min: 1, max: 80, step: 1, suffix: 'hrs/wk', tooltip: 'Hours committed per week.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const targetHours = Number(inputs.proficiencyTarget) || 250;
            const weeklyHours = Number(inputs.weeklyStudyHours) || 10;

            const totalWeeks = targetHours / weeklyHours;
            const totalMonths = totalWeeks / 4.333;
            const dailyMins = (weeklyHours / 7) * 60;

            return {
                primaryOutput: { label: 'Time to Reach Mastery Target', value: totalMonths >= 12 ? `${(totalMonths / 12).toFixed(1)} Years` : `${totalMonths.toFixed(1)} Months`, suffix: `${Math.ceil(totalWeeks)} Weeks` },
                secondaryMetrics: [
                    { label: 'Total Dedicated Hours Required', value: `${targetHours} Hours` },
                    { label: 'Daily Study Commitment', value: `~${Math.round(dailyMins)} Minutes / day (7 days/wk)` },
                    { label: 'Milestone 50-Hour Checkpoint', value: `Week ${Math.ceil(50 / weeklyHours)}` },
                    { label: 'Weekly Study Pace', value: `${weeklyHours} Hours / week` }
                ]
            };
        }
    },
    // 7. Teacher Salary Calculator
    {
        id: 'teacher-salary-calculator',
        name: 'Teacher Salary Calculator',
        category: 'education-learning',
        group: 'Education & Learning',
        bucket: 'Bucket A',
        tier: 5,
        phase: 5,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "Teacher Salary Calculator tool.",
        inputs: [
            { id: 'baseEntrySalary', name: 'District Base Starting Salary ($)', type: 'number', defaultValue: 46000, min: 25000, step: 1000, prefix: '$', tooltip: 'Step 1 BA salary.' },
            { id: 'degreeLevel', name: 'Education Degree Lane', type: 'dropdown', defaultValue: 4500, options: [{ label: "Bachelor's Degree (BA / BS)", value: 0 }, { label: "Bachelor's + 15 / 30 Credits (+$2,500)", value: 2500 }, { label: "Master's Degree (MA / MS) (+$4,500)", value: 4500 }, { label: "Master's + 30 / Specialist (+$7,500)", value: 7500 }, { label: 'Doctorate / PhD / EdD (+$11,000)', value: 11000 }], tooltip: 'Salary schedule column.' },
            { id: 'yearsExperience', name: 'Years of Experience (Step)', type: 'number', defaultValue: 6, min: 0, max: 35, step: 1, suffix: 'yrs', tooltip: 'Salary schedule step.' },
            { id: 'extraStipends', name: 'Coaching & Extracurricular Stipends ($)', type: 'number', defaultValue: 3500, min: 0, step: 500, prefix: '$', tooltip: 'Club/sports stipends.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const base = Number(inputs.baseEntrySalary) || 46000;
            const degreeBump = Number(inputs.degreeLevel) || 4500;
            const step = Number(inputs.yearsExperience) || 6;
            const stipends = Number(inputs.extraStipends) || 3500;

            // Standard step increase is ~2.2% per year of tenure
            const stepMultiplier = Math.pow(1 + 0.022, step);
            const scheduledBase = (base * stepMultiplier) + degreeBump;
            const totalSalary = scheduledBase + stipends;

            const contractDays = 185;
            const dailyRate = totalSalary / contractDays;
            const hourlyRate = dailyRate / 7.5; // 7.5 hour contract day

            return {
                primaryOutput: { label: 'Total Annual Compensation', value: `$${Math.round(totalSalary).toLocaleString()}`, suffix: `Step ${step} Schedule` },
                secondaryMetrics: [
                    { label: 'Scheduled Base Pay', value: `$${Math.round(scheduledBase).toLocaleString()}` },
                    { label: 'Effective Contract Daily Rate', value: `$${Math.round(dailyRate)} / day (${contractDays} contract days)` },
                    { label: 'Effective Contract Hourly Rate', value: `$${hourlyRate.toFixed(2)} / hour (7.5 hr day)` },
                    { label: 'Degree Education Premium', value: `+$${degreeBump.toLocaleString()} / year` }
                ]
            };
        }
    },
    // 8. School Supply Cost Calculator
    {
        id: 'school-supply-cost-calculator',
        name: 'School Supply Cost Calculator',
        category: 'education-learning',
        group: 'Education & Learning',
        bucket: 'Bucket B',
        tier: 5,
        phase: 5,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "School Supply Cost Calculator tool.",
        inputs: [
            { id: 'numStudents', name: 'Number of Enrolled Children', type: 'number', defaultValue: 2, min: 1, max: 8, step: 1, tooltip: 'Number of kids.' },
            { id: 'gradeLevel', name: 'Primary Grade Level', type: 'dropdown', defaultValue: 'middle', options: [{ label: 'Elementary School (K-5)', value: 'elem' }, { label: 'Middle School (6-8)', value: 'middle' }, { label: 'High School (9-12)', value: 'high' }, { label: 'College / University', value: 'college' }], tooltip: 'Grade band.' },
            { id: 'techUpgrade', name: 'Electronics / Laptop Purchase', type: 'dropdown', defaultValue: 250, options: [{ label: 'No Tech Purchase ($0)', value: 0 }, { label: 'Basic Chromebook / Tablet ($250)', value: 250 }, { label: 'Mid-Tier Student Laptop ($650)', value: 650 }, { label: 'High-Performance College Laptop ($1,200)', value: 1200 }], tooltip: 'Tech budget.' },
            { id: 'clothingPerStudent', name: 'Back-to-School Clothing / Shoes ($/child)', type: 'number', defaultValue: 250, min: 0, step: 25, prefix: '$', tooltip: 'Apparel budget.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const students = Number(inputs.numStudents) || 2;
            const grade = String(inputs.gradeLevel || 'middle');
            const tech = Number(inputs.techUpgrade) || 250;
            const clothingPerChild = Number(inputs.clothingPerStudent) || 250;

            let baseSuppliesPerChild = 120;
            if (grade === 'elem') baseSuppliesPerChild = 95;
            else if (grade === 'middle') baseSuppliesPerChild = 140;
            else if (grade === 'high') baseSuppliesPerChild = 185;
            else if (grade === 'college') baseSuppliesPerChild = 350;

            const totalSupplies = baseSuppliesPerChild * students;
            const totalClothing = clothingPerChild * students;
            const totalTech = tech; // Household shared or single purchase
            const grandTotal = totalSupplies + totalClothing + totalTech;
            const perChildAverage = grandTotal / students;

            return {
                primaryOutput: { label: 'Total Back-to-School Expense', value: `$${Math.round(grandTotal).toLocaleString()}`, suffix: `${students} Students` },
                secondaryMetrics: [
                    { label: 'Average Cost per Student', value: `$${Math.round(perChildAverage).toLocaleString()} / child` },
                    { label: 'Stationery & Class Supplies', value: `$${Math.round(totalSupplies).toLocaleString()}` },
                    { label: 'Clothing & Shoes Budget', value: `$${Math.round(totalClothing).toLocaleString()}` },
                    { label: 'Electronics & Tech Hardware', value: `$${Math.round(totalTech).toLocaleString()}` }
                ]
            };
        }
    }
];

export const cat10EducationCalculators = educationLearningCalculators;
export default educationLearningCalculators;
