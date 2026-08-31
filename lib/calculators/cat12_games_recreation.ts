import { CalculatorDefinition } from '../../types/calculator';

export const gamesRecreationCalculators: CalculatorDefinition[] = [
    // 1. Elo Rating System (Chess, Gaming & Competitive Matchmaking)
    {
        id: 'elo-rating-calculator',
        name: 'Elo Rating System & Matchmaking Calculator',
        category: 'games-recreation',
        group: '12A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '165K',
        cpc: '$0.40',
        description: 'Calculates expected win probability and post-match rating updates for chess, esports, and competitive 1v1 ladder rankings.',
        inputs: [
            { id: 'playerRating', name: 'Player Rating (Ra)', type: 'number', defaultValue: 1500, min: 100, max: 3500, step: 10, tooltip: 'Your current Elo rating.' },
            { id: 'opponentRating', name: 'Opponent Rating (Rb)', type: 'number', defaultValue: 1580, min: 100, max: 3500, step: 10, tooltip: 'Opponent current Elo rating.' },
            {
                id: 'kFactor', name: 'K-Factor (Sensitivity Weight)', type: 'dropdown', defaultValue: 32, options: [
                    { label: 'K = 32 (New players / Rapid adjustments)', value: 32 },
                    { label: 'K = 20 (Standard club / competitive ladder)', value: 20 },
                    { label: 'K = 10 (Master tier / stable veterans)', value: 10 }
                ], tooltip: 'Maximum possible point swing per match.'
            },
            {
                id: 'matchOutcome', name: 'Match Outcome', type: 'dropdown', defaultValue: 'win', options: [
                    { label: 'Win (Score = 1.0)', value: 'win' },
                    { label: 'Draw / Tie (Score = 0.5)', value: 'draw' },
                    { label: 'Loss (Score = 0.0)', value: 'loss' }
                ], tooltip: 'Actual match result.'
            }
        ],
        naturalLanguageQueries: [
            'Elo rating change calculator',
            'Chess rating calculator win loss',
            'Expected win probability Elo formula'
        ],
        edgeCases: ['Massive rating differentials exceeding 800 points'],
        calculate: (inputs) => {
            const ra = Number(inputs.playerRating) || 1500;
            const rb = Number(inputs.opponentRating) || 1580;
            const k = Number(inputs.kFactor) || 32;
            const outcome = inputs.matchOutcome;

            // Expected win probability: Ea = 1 / (1 + 10^((Rb - Ra) / 400))
            const expectedScore = 1 / (1 + Math.pow(10, (rb - ra) / 400));

            let actualScore = 1.0;
            if (outcome === 'draw') actualScore = 0.5;
            if (outcome === 'loss') actualScore = 0.0;

            // New Rating: Ra' = Ra + K * (Sa - Ea)
            const ratingChange = k * (actualScore - expectedScore);
            const newRating = Math.round(ra + ratingChange);

            return {
                primaryOutput: {
                    label: 'Updated Rating',
                    value: newRating.toString(),
                    suffix: `(${ratingChange >= 0 ? '+' : ''}${ratingChange.toFixed(1)} Pts)`
                },
                secondaryMetrics: [
                    { label: 'Pre-Match Win Expectancy (Ea)', value: `${(expectedScore * 100).toFixed(1)}%` },
                    { label: 'Rating Point Shift', value: `${ratingChange >= 0 ? '+' : ''}${Math.round(ratingChange)} Points` },
                    { label: 'Opponent Counterpart Rating', value: `${Math.round(rb - ratingChange)} (${ratingChange >= 0 ? '-' : '+'}${Math.round(Math.abs(ratingChange))})` },
                    { label: 'Rating Differential (Δ)', value: `${Math.abs(ra - rb)} Points (${ra >= rb ? 'Higher' : 'Lower'})` }
                ]
            };
        }
    },

    // 2. Texas Hold'em Poker Pot Odds & Equity Calculator
    {
        id: 'poker-pot-odds-calculator',
        name: "Poker Pot Odds & Call Equity Calculator",
        category: 'games-recreation',
        group: '12A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '110K',
        cpc: '$0.85',
        description: "Calculates pot odds percentage, required equity to call, and rule of 2 & 4 hand draw odds for Texas Hold'em poker.",
        inputs: [
            { id: 'potSizeBeforeCall', name: 'Pot Size Before Bet', type: 'currency', defaultValue: 120, min: 1, step: 5, prefix: '$', tooltip: 'Current chips in pot.' },
            { id: 'betToCall', name: 'Bet Amount to Call', type: 'currency', defaultValue: 40, min: 1, step: 5, prefix: '$', tooltip: 'Cost to continue.' },
            { id: 'cleanOuts', name: 'Number of Clean Outs', type: 'number', defaultValue: 9, min: 1, max: 21, step: 1, suffix: 'outs', tooltip: 'e.g. 9 outs for flush draw, 8 for open-ended straight.' },
            {
                id: 'street', name: 'Current Street', type: 'dropdown', defaultValue: 'flop', options: [
                    { label: 'Flop (2 cards to come — Rule of 4)', value: 'flop' },
                    { label: 'Turn (1 card to come — Rule of 2)', value: 'turn' }
                ], tooltip: 'Flop or Turn round.'
            }
        ],
        naturalLanguageQueries: [
            'Poker pot odds calculator',
            'Should I call flush draw pot odds',
            'Rule of 4 and 2 poker equity'
        ],
        edgeCases: ['Calling bet equal to zero'],
        calculate: (inputs) => {
            const pot = Number(inputs.potSizeBeforeCall) || 120;
            const call = Number(inputs.betToCall) || 40;
            const outs = Number(inputs.cleanOuts) || 9;
            const isFlop = inputs.street === 'flop';

            // Pot Odds % = Call / (Pot + Call)
            const totalPotAfterCall = pot + call;
            const requiredEquityPct = (call / totalPotAfterCall) * 100;
            const ratioOdds = ((pot) / call).toFixed(1);

            // Rule of 2 & 4 estimated equity
            const estimatedHandEquityPct = isFlop ? outs * 4 : outs * 2;
            const isProfitableCall = estimatedHandEquityPct >= requiredEquityPct;

            return {
                primaryOutput: {
                    label: 'Call Decision Verdict',
                    value: isProfitableCall ? '+EV Profitable Call' : '-EV Unfavorable Fold'
                },
                secondaryMetrics: [
                    { label: 'Required Win Equity to Break Even', value: `${requiredEquityPct.toFixed(1)}%` },
                    { label: 'Estimated Drawing Equity', value: `~${estimatedHandEquityPct.toFixed(1)}% (${outs} Outs)` },
                    { label: 'Direct Pot Odds Ratio', value: `${ratioOdds} : 1` },
                    { label: 'Total Pot Size on Call', value: `$${totalPotAfterCall.toFixed(2)}` }
                ]
            };
        }
    },

    // 3. Swimming Pool Volume & Chemical Treatment Calculator
    {
        id: 'pool-volume-calculator',
        name: 'Swimming Pool Volume & Chemical Calculator',
        category: 'games-recreation',
        group: '12A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '301K',
        cpc: '$1.10',
        description: 'Calculates pool water volume in US gallons and liters for rectangular, round, and oval pools, with chlorine shock dosing targets.',
        inputs: [
            {
                id: 'poolShape', name: 'Pool Shape', type: 'dropdown', defaultValue: 'rect', options: [
                    { label: 'Rectangular / Square', value: 'rect' },
                    { label: 'Circular / Round', value: 'round' },
                    { label: 'Oval', value: 'oval' }
                ], tooltip: 'Geometry of pool perimeter.'
            },
            { id: 'dimensionA', name: 'Length or Diameter (Feet)', type: 'number', defaultValue: 32, min: 4, max: 100, step: 1, suffix: 'ft', tooltip: 'Length or circular diameter.' },
            { id: 'dimensionB', name: 'Width (Feet - Ignored if Circular)', type: 'number', defaultValue: 16, min: 4, max: 50, step: 1, suffix: 'ft', tooltip: 'Width across.' },
            { id: 'shallowDepthFt', name: 'Shallow End Depth (Feet)', type: 'number', defaultValue: 3.5, min: 1, max: 12, step: 0.5, suffix: 'ft', tooltip: 'Minimum depth.' },
            { id: 'deepDepthFt', name: 'Deep End Depth (Feet)', type: 'number', defaultValue: 7.5, min: 1, max: 16, step: 0.5, suffix: 'ft', tooltip: 'Maximum depth.' }
        ],
        naturalLanguageQueries: [
            'How many gallons is my pool?',
            'Pool volume calculator rectangular',
            'How much chlorine shock for 15000 gallon pool'
        ],
        edgeCases: ['Zero dimensions', 'Shallow depth greater than deep depth'],
        calculate: (inputs) => {
            const shape = inputs.poolShape;
            const dimA = Number(inputs.dimensionA) || 32;
            const dimB = Number(inputs.dimensionB) || 16;
            const d1 = Number(inputs.shallowDepthFt) || 3.5;
            const d2 = Number(inputs.deepDepthFt) || 7.5;

            const avgDepth = (d1 + d2) / 2;
            let gallons = 0;

            if (shape === 'rect') {
                // L * W * AvgDepth * 7.48052 (gal per cu ft)
                gallons = dimA * dimB * avgDepth * 7.48052;
            } else if (shape === 'round') {
                // Pi * r^2 * AvgDepth * 7.48052
                const r = dimA / 2;
                gallons = Math.PI * (r * r) * avgDepth * 7.48052;
            } else {
                // Oval: L * W * AvgDepth * 5.9 (standard empirical multiplier)
                gallons = dimA * dimB * avgDepth * 5.9;
            }

            const liters = gallons * 3.78541;
            // Rule of thumb: ~1 lb cal-hypo shock granules per 10,000 gallons
            const shockPounds = gallons / 10000;

            return {
                primaryOutput: {
                    label: 'Total Pool Water Capacity',
                    value: Math.round(gallons).toLocaleString(),
                    suffix: 'US Gallons'
                },
                secondaryMetrics: [
                    { label: 'Metric Volume Equivalent', value: `${Math.round(liters).toLocaleString()} Liters (${(liters / 1000).toFixed(1)} m³)` },
                    { label: 'Average Water Depth', value: `${avgDepth.toFixed(1)} Feet` },
                    { label: 'Standard Chlorine Shock Dose', value: `~${shockPounds.toFixed(1)} lbs of Shock Granules` },
                    { label: 'Turnover Rate (8-hr cycle)', value: `${Math.round(gallons / 8).toLocaleString()} gal / hr pump flow` }
                ]
            };
        }
    },

    // 4. Golf Handicap Differential & Index Calculator
    {
        id: 'golf-handicap-calculator',
        name: 'Golf Handicap Score Differential Calculator',
        category: 'games-recreation',
        group: '12A',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '90K',
        cpc: '$0.50',
        description: 'Computes official USGA/WHS 18-hole score differentials from gross 18-hole score, course rating, slope rating, and PCC adjustments.',
        inputs: [
            { id: 'grossScore', name: '18-Hole Gross Score', type: 'number', defaultValue: 86, min: 54, max: 160, step: 1, suffix: 'strokes', tooltip: 'Total strokes taken.' },
            { id: 'courseRating', name: 'Course Rating', type: 'number', defaultValue: 71.4, min: 60, max: 85, step: 0.1, tooltip: 'Scratch golfer benchmark.' },
            { id: 'slopeRating', name: 'Slope Rating', type: 'number', defaultValue: 128, min: 55, max: 155, step: 1, tooltip: 'Course difficulty for bogey golfers (standard is 113).' },
            {
                id: 'pccAdjustment', name: 'Playing Conditions Calc (PCC)', type: 'dropdown', defaultValue: 0, options: [
                    { label: '0 (Normal / Calm Conditions)', value: 0 },
                    { label: '+1 (Tough wind / heavy rain)', value: 1 },
                    { label: '-1 (Favorable weather / fast greens)', value: -1 }
                ], tooltip: 'Course condition adjustment.'
            }
        ],
        naturalLanguageQueries: [
            'Golf handicap differential formula',
            'Calculate score differential from slope and rating',
            'WHS golf handicap calculator'
        ],
        edgeCases: ['Slope rating out of bounds (< 55 or > 155)'],
        calculate: (inputs) => {
            const gross = Number(inputs.grossScore) || 86;
            const rating = Number(inputs.courseRating) || 71.4;
            const slope = Math.max(55, Math.min(155, Number(inputs.slopeRating) || 128));
            const pcc = Number(inputs.pccAdjustment) || 0;

            // WHS Formula: Differential = (113 / Slope Rating) * (Gross Score - Course Rating - PCC)
            const diff = (113 / slope) * (gross - rating - pcc);

            return {
                primaryOutput: {
                    label: 'Score Differential',
                    value: diff.toFixed(1),
                    suffix: 'Handicap Basis'
                },
                secondaryMetrics: [
                    { label: 'Strokes Over Course Rating', value: `${(gross - rating).toFixed(1)} Strokes` },
                    { label: 'Relative Slope Ratio (113/Slope)', value: (113 / slope).toFixed(3) },
                    { label: 'Standard Course Par Baseline', value: 'Par 72' }
                ]
            };
        }
    },

    // 5. Lottery Combinatorics & Odds Calculator
    {
        id: 'lottery-odds-calculator',
        name: 'Lottery Combinatorics & Jackpot Odds Calculator',
        category: 'games-recreation',
        group: '12A',
        bucket: 'Bucket B',
        tier: 3,
        phase: 2,
        monthlySearches: '70K',
        cpc: '$0.30',
        description: 'Calculates exact mathematical odds of winning jackpot and tiered secondary prizes for multi-ball drawing formats (e.g., Powerball / Mega Millions).',
        inputs: [
            { id: 'mainPoolTotal', name: 'Main Number Pool Size', type: 'number', defaultValue: 69, min: 10, max: 99, step: 1, suffix: 'balls', tooltip: 'e.g. 69 in Powerball.' },
            { id: 'mainPicksCount', name: 'Main Numbers Picked', type: 'number', defaultValue: 5, min: 1, max: 10, step: 1, suffix: 'picks', tooltip: 'e.g. 5 white balls.' },
            { id: 'bonusPoolTotal', name: 'Bonus Ball Pool Size', type: 'number', defaultValue: 26, min: 1, max: 50, step: 1, suffix: 'balls', tooltip: 'e.g. 26 red Powerballs.' }
        ],
        naturalLanguageQueries: [
            'Lottery odds calculator',
            'Odds of winning 5 out of 69 plus powerball',
            'Combinations formula for lotto tickets'
        ],
        edgeCases: ['Main picks greater than main pool total'],
        calculate: (inputs) => {
            const n = Number(inputs.mainPoolTotal) || 69;
            const k = Number(inputs.mainPicksCount) || 5;
            const bonus = Number(inputs.bonusPoolTotal) || 26;

            // Combination formula n! / (k! * (n-k)!)
            const combinations = (total: number, pick: number): number => {
                if (pick > total) return 0;
                let c = 1;
                for (let i = 1; i <= pick; i++) {
                    c = (c * (total - i + 1)) / i;
                }
                return Math.round(c);
            };

            const mainCombos = combinations(n, k);
            const jackpotCombos = mainCombos * bonus;
            const oddsPct = (1 / jackpotCombos) * 100;

            return {
                primaryOutput: {
                    label: 'Grand Jackpot Odds',
                    value: `1 in ${jackpotCombos.toLocaleString()}`
                },
                secondaryMetrics: [
                    { label: 'Exact Mathematical Probability', value: `${oddsPct.toExponential(4)}%` },
                    { label: 'Main Pool Combinations Alone', value: `1 in ${mainCombos.toLocaleString()}` },
                    { label: 'Bonus Ball Factor', value: `×${bonus} Multiplier` }
                ]
            };
        }
    }
];