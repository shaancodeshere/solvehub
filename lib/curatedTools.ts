import { CuratedTool } from '@/types/workspace';

export const CURATED_TOOLS: CuratedTool[] = [
    {
        id: 'margin-calculator',
        title: 'Gross & Net Margin',
        category: 'Business',
        description: 'Simulate gross margin, operating overhead, and bottom-line net income.',
        icon: '📊',
        inputs: [
            { key: 'revenue', label: 'Total Revenue', defaultValue: 100000, prefix: '$' },
            { key: 'cogs', label: 'Cost of Goods (COGS)', defaultValue: 35000, prefix: '$' },
            { key: 'opex', label: 'Operating Expenses', defaultValue: 25000, prefix: '$' },
        ],
        calculate: (values) => {
            const revenue = values.revenue || 0;
            const cogs = values.cogs || 0;
            const opex = values.opex || 0;

            const grossProfit = revenue - cogs;
            const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
            const netProfit = grossProfit - opex;
            const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

            return {
                primaryVariable: 'Net Operating Income',
                primaryValue: `$${netProfit.toLocaleString('en-US')}`,
                secondaryMetrics: [
                    { label: 'Gross Margin', value: `${grossMargin.toFixed(1)}%` },
                    { label: 'Net Margin', value: `${netMargin.toFixed(1)}%` },
                ],
                variables: [
                    { name: 'Revenue', value: revenue, rawExpression: `${revenue}`, formattedValue: `$${revenue.toLocaleString('en-US')}` },
                    { name: 'COGS', value: cogs, rawExpression: `${cogs}`, formattedValue: `$${cogs.toLocaleString('en-US')}` },
                    { name: 'Gross Profit', value: grossProfit, rawExpression: 'Revenue - COGS', formattedValue: `$${grossProfit.toLocaleString('en-US')}` },
                    { name: 'Operating Expenses', value: opex, rawExpression: `${opex}`, formattedValue: `$${opex.toLocaleString('en-US')}` },
                ],
            };
        },
    },
    {
        id: 'compound-interest',
        title: 'Compound Growth & ROI',
        category: 'Finance',
        description: 'Project investment compounding, annual yields, and total capital ROI.',
        icon: '📈',
        inputs: [
            { key: 'principal', label: 'Initial Principal', defaultValue: 10000, prefix: '$' },
            { key: 'rate', label: 'Annual Rate', defaultValue: 8, suffix: '%' },
            { key: 'years', label: 'Horizon (Years)', defaultValue: 5, suffix: 'yrs' },
        ],
        calculate: (values) => {
            const principal = values.principal || 0;
            const rate = (values.rate || 0) / 100;
            const years = values.years || 0;

            const finalAmount = principal * Math.pow(1 + rate, years);
            const totalInterest = finalAmount - principal;
            const roi = principal > 0 ? (totalInterest / principal) * 100 : 0;

            return {
                primaryVariable: 'Future Portfolio Value',
                primaryValue: `$${Math.round(finalAmount).toLocaleString('en-US')}`,
                secondaryMetrics: [
                    { label: 'Total Growth', value: `$${Math.round(totalInterest).toLocaleString('en-US')}` },
                    { label: 'Total ROI', value: `${roi.toFixed(1)}%` },
                ],
                variables: [
                    { name: 'Principal', value: principal, rawExpression: `${principal}`, formattedValue: `$${principal.toLocaleString('en-US')}` },
                    { name: 'Annual Rate', value: values.rate, rawExpression: `${values.rate}%`, formattedValue: `${values.rate}%` },
                    { name: 'Time Horizon', value: years, rawExpression: `${years} years`, formattedValue: `${years} yrs` },
                ],
            };
        },
    },
    {
        id: 'break-even',
        title: 'Break-Even Analysis',
        category: 'Operations',
        description: 'Determine units and monthly sales volume required to cover fixed costs.',
        icon: '⚖️',
        inputs: [
            { key: 'fixedCosts', label: 'Fixed Costs / Mo', defaultValue: 15000, prefix: '$' },
            { key: 'pricePerUnit', label: 'Price Per Unit', defaultValue: 120, prefix: '$' },
            { key: 'costPerUnit', label: 'Variable Cost / Unit', defaultValue: 45, prefix: '$' },
        ],
        calculate: (values) => {
            const fixed = values.fixedCosts || 0;
            const price = values.pricePerUnit || 0;
            const variable = values.costPerUnit || 0;

            const contributionMargin = price - variable;
            const breakEvenUnits = contributionMargin > 0 ? Math.ceil(fixed / contributionMargin) : 0;
            const breakEvenRevenue = breakEvenUnits * price;

            return {
                primaryVariable: 'Break-Even Units',
                primaryValue: `${breakEvenUnits.toLocaleString('en-US')} units`,
                secondaryMetrics: [
                    { label: 'Required Revenue', value: `$${breakEvenRevenue.toLocaleString('en-US')}` },
                    { label: 'Unit Margin', value: `$${contributionMargin.toLocaleString('en-US')}` },
                ],
                variables: [
                    { name: 'Fixed Overhead', value: fixed, rawExpression: `${fixed}`, formattedValue: `$${fixed.toLocaleString('en-US')}` },
                    { name: 'Unit Price', value: price, rawExpression: `${price}`, formattedValue: `$${price.toLocaleString('en-US')}` },
                    { name: 'Unit Cost', value: variable, rawExpression: `${variable}`, formattedValue: `$${variable.toLocaleString('en-US')}` },
                ],
            };
        },
    },
];