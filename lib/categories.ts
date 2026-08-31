export interface CategoryMeta {
    id: string;
    name: string;
    slug: string;
    icon: string;
    description: string;
    groupCode: string;
}

export const masterCategories: CategoryMeta[] = [
    {
        id: 'financial-money',
        slug: 'financial-money',
        name: 'Financial & Money',
        icon: '💳',
        groupCode: 'CAT-01',
        description: 'Mortgages, personal loans, investment returns, taxes, amortization, and retirement models.'
    },
    {
        id: 'health-fitness',
        slug: 'health-fitness',
        name: 'Health & Fitness',
        icon: '🩺',
        groupCode: 'CAT-02',
        description: 'BMI, BMR, daily caloric expenditure, macro splits, body composition, and workout pacing.'
    },
    {
        id: 'math-science',
        slug: 'math-science',
        name: 'Math & Science',
        icon: '📐',
        groupCode: 'CAT-03',
        description: 'Algebra, geometry, matrices, probability, statistics, percentages, and scientific formulas.'
    },
    {
        id: 'date-time-productivity',
        slug: 'date-time-productivity',
        name: 'Date, Time & Productivity',
        icon: '⏱️',
        groupCode: 'CAT-04',
        description: 'Day duration, calendar offsets, time cards, work hours, and productivity trackers.'
    },
    {
        id: 'construction-home',
        slug: 'construction-home',
        name: 'Construction & Home',
        icon: '🔨',
        groupCode: 'CAT-05',
        description: 'Concrete yardage, lumber framing, paint coverage, roofing, electrical wire gauge, and HVAC sizing.'
    },
    {
        id: 'science-engineering',
        slug: 'science-engineering',
        name: 'Science & Engineering',
        icon: '⚙️',
        groupCode: 'CAT-06',
        description: 'Physics mechanics, fluid dynamics, thermodynamics, electrical circuits, and chemistry stoichiometry.'
    },
    {
        id: 'technology-computing',
        slug: 'technology-computing',
        name: 'Technology & Computing',
        icon: '💻',
        groupCode: 'CAT-07',
        description: 'IP subnetting, data storage units, network download speeds, hex/RGB color, and API latency.'
    },
    {
        id: 'conversion-units',
        slug: 'conversion-units',
        name: 'Conversion & Units',
        icon: '🔄',
        groupCode: 'CAT-08',
        description: 'Metric and imperial conversions for length, mass, pressure, temperature, torque, and power.'
    },
    {
        id: 'legal-compliance',
        slug: 'legal-compliance',
        name: 'Legal & Compliance',
        icon: '⚖️',
        groupCode: 'CAT-09',
        description: 'Child support, spousal maintenance, statutory severance pay, and structured settlement present value.'
    },
    {
        id: 'education-learning',
        slug: 'education-learning',
        name: 'Education & Learning',
        icon: '📚',
        groupCode: 'CAT-10',
        description: 'Semester GPA projections, test score concordances, text readability indexes, and SM-2 memory intervals.'
    },
    {
        id: 'environment-sustainability',
        slug: 'environment-sustainability',
        name: 'Environment & Sustainability',
        icon: '🌱',
        groupCode: 'CAT-11',
        description: 'Carbon emissions, solar system payback periods, EV fuel parity, and rainwater harvesting yield.'
    },
    {
        id: 'games-recreation',
        slug: 'games-recreation',
        name: 'Games & Recreation',
        icon: '🎲',
        groupCode: 'CAT-12',
        description: 'Golf handicaps, competitive Elo rankings, poker pot odds, lottery combinatorics, and pool volumes.'
    }
];