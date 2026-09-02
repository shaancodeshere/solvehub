export interface CategoryDefinition {
    id: string;
    slug: string;
    groupCode: string;
    name: string;
    description: string;
    iconSvg: string; // Clean SVG path data
}

export const masterCategories: CategoryDefinition[] = [
    {
        id: 'cat01',
        slug: 'finance-business',
        groupCode: 'CAT-01',
        name: 'Finance & Business',
        description: 'Amortization, cash flow, unit economics, ROI, and corporate tax models.',
        iconSvg: `
      <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    `,
    },
    {
        id: 'cat02',
        slug: 'health-fitness',
        groupCode: 'CAT-02',
        name: 'Health & Fitness',
        description: 'Metabolic rate, macro tracking, heart rate zones, and body composition.',
        iconSvg: `
      <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 10.5h2.25l1.5-2.25 2.25 4.5 1.5-2.25h1.5" />
    `,
    },
    {
        id: 'cat03',
        slug: 'math-algebra',
        groupCode: 'CAT-03',
        name: 'Math & Algebra',
        description: 'Polynomial solvers, matrix calculations, sequences, and combinatorics.',
        iconSvg: `
      <!-- Top Left: Plus (+) -->
      <path stroke-linecap="round" stroke-linejoin="round" d="M6 3.75v5.5m-2.75-2.75h5.5" />
      <!-- Top Right: Minus (-) -->
      <path stroke-linecap="round" stroke-linejoin="round" d="M15.25 6.5h5.5" />
      <!-- Bottom Left: Multiply (×) -->
      <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 15.25l4.5 4.5m0-4.5l-4.5 4.5" />
      <!-- Bottom Right: Divide (÷) -->
      <path stroke-linecap="round" stroke-linejoin="round" d="M15.25 17.5h5.5m-2.75-2.25v.01m0 4.49v.01" />
    `,
    },
    {
        id: 'cat04',
        slug: 'date-time-productivity',
        groupCode: 'CAT-04',
        name: 'Date, Time & Productivity',
        description: 'Day duration, calendar offsets, time cards, work hours, and productivity trackers.',
        iconSvg: `
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    `,
    },
    {
        id: 'cat05',
        slug: 'construction-trades',
        groupCode: 'CAT-05',
        name: 'Construction & Trades',
        description: 'Concrete yardage, lumber framing, roof pitch, and electrical load runs.',
        iconSvg: `
      <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m16.5-18v18M7.5 3v18M12 3v18M16.5 3v18M3.75 7.5h16.5M3.75 12h16.5M3.75 16.5h16.5" />
    `,
    },
    {
        id: 'cat06',
        slug: 'engineering-physics',
        groupCode: 'CAT-06',
        name: 'Engineering & Physics',
        description: 'Stress-strain calculations, fluid dynamics, thermodynamics, and kinematics.',
        iconSvg: `
      <!-- Precision Engineering Gear & Axis -->
      <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    `,
    },
    {
        id: 'cat07',
        slug: 'computer-science',
        groupCode: 'CAT-07',
        name: 'Computer Science & Tech',
        description: 'Subnet masking, hash generation, binary conversions, and complexity analysis.',
        iconSvg: `
      <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    `,
    },
    {
        id: 'cat08',
        slug: 'conversion-units',
        groupCode: 'CAT-08',
        name: 'Conversion & Units',
        description: 'Metric and imperial conversions for length, mass, pressure, temperature, torque, and power.',
        iconSvg: `
      <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    `,
    },
    {
        id: 'cat09',
        slug: 'legal-compliance',
        groupCode: 'CAT-09',
        name: 'Legal & Compliance',
        description: 'Child support, spousal maintenance, statutory severance pay, and structured settlement present value.',
        iconSvg: `
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v18m0-18l-8 4m8-4l8 4M4 7l-2 5h8L8 7m8 0l-2 5h8l-2-5M9 21h6" />
    `,
    },
    {
        id: 'cat10',
        slug: 'education-learning',
        groupCode: 'CAT-10',
        name: 'Education & Learning',
        description: 'Semester GPA projections, test score concordances, text readability indexes, and SM-2 memory intervals.',
        iconSvg: `
      <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
    `,
    },
    {
        id: 'cat11',
        slug: 'environmental-energy',
        groupCode: 'CAT-11',
        name: 'Environmental & Energy',
        description: 'Solar array sizing, battery capacity, carbon emissions, and heat dissipation.',
        iconSvg: `
      <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    `,
    },
    {
        id: 'cat12',
        slug: 'games-recreation',
        groupCode: 'CAT-12',
        name: 'Games & Recreation',
        description: 'Golf handicaps, competitive Elo rankings, poker pot odds, lottery combinatorics, and pool volumes.',
        iconSvg: `
      <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.003 0H9.497m5.003 0a3.375 3.375 0 003.375-3.375V4.875c0-.621-.504-1.125-1.125-1.125H7.25c-.621 0-1.125.504-1.125 1.125v7.125a3.375 3.375 0 003.375 3.375" />
    `,
    },
];