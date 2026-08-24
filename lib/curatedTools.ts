import { CuratedTool } from '@/types/workspace';

export const CURATED_TOOLS: CuratedTool[] = [
    {
        id: 'margin-calculator',
        title: 'Gross & Net Margin',
        category: 'Business',
        description: 'Calculate gross profit, net operating income, and contribution margins from revenue and cost inputs.',
        icon: '📊',
    },
    {
        id: 'compound-interest',
        title: 'Compound Growth & ROI',
        category: 'Finance',
        description: 'Project investment compounding, annual yields, and total ROI over customizable time horizons.',
        icon: '📈',
    },
    {
        id: 'unit-economics',
        title: 'Unit Economics & CAC/LTV',
        category: 'Business',
        description: 'Evaluate customer acquisition costs, lifetime value ratios, and payback periods for recurring models.',
        icon: '🎯',
    },
    {
        id: 'break-even',
        title: 'Break-Even Analysis',
        category: 'Business',
        description: 'Determine units and minimum monthly revenue needed to cover fixed overhead and variable costs.',
        icon: '⚖️',
    },
];