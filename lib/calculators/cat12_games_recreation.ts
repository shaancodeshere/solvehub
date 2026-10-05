import { CalculatorDefinition } from '@/types/calculator';

export const gamesRecreationCalculators: CalculatorDefinition[] = [
    // 1. Coin Flip Simulator
    {
        id: 'coin-flip-simulator',
        name: 'Coin Flip Simulator',
        category: 'games-recreation',
        group: 'Games & Recreation',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '50K',
        cpc: 'N/A',
        description: "Coin Flip Simulator tool.",
        inputs: [
            { id: 'numCoins', name: 'Number of Flips (n)', type: 'number', defaultValue: 10, min: 1, max: 1000, step: 1, tooltip: 'Number of coin flips.' },
            { id: 'targetHeads', name: 'Target Heads Count (k)', type: 'number', defaultValue: 5, min: 0, max: 1000, step: 1, tooltip: 'Desired number of heads.' },
            { id: 'biasPercent', name: 'Coin Bias (% Heads Chance)', type: 'number', defaultValue: 50, min: 1, max: 99, step: 1, suffix: '%', tooltip: '50% for a fair coin.' },
            { id: 'condition', name: 'Outcome Condition', type: 'dropdown', defaultValue: 'exact', options: [{ label: 'Exactly k Heads', value: 'exact' }, { label: 'At Least k Heads (>= k)', value: 'at_least' }, { label: 'At Most k Heads (<= k)', value: 'at_most' }], tooltip: 'Condition.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const n = Math.max(1, Math.min(1000, Math.round(Number(inputs.numCoins) || 10)));
            const k = Math.max(0, Math.min(n, Math.round(Number(inputs.targetHeads) || 5)));
            const p = (Number(inputs.biasPercent) || 50) / 100;
            const q = 1 - p;
            const cond = String(inputs.condition || 'exact');

            // Log-combinations helper for large n
            const logFact = (num: number): number => {
                let ans = 0;
                for (let i = 2; i <= num; i++) ans += Math.log(i);
                return ans;
            };

            const binomProb = (trials: number, successes: number, prob: number): number => {
                if (successes < 0 || successes > trials) return 0;
                if (prob === 0) return successes === 0 ? 1 : 0;
                if (prob === 1) return successes === trials ? 1 : 0;
                const logComb = logFact(trials) - logFact(successes) - logFact(trials - successes);
                const logP = logComb + successes * Math.log(prob) + (trials - successes) * Math.log(1 - prob);
                return Math.exp(logP);
            };

            let probability = 0;
            if (cond === 'exact') {
                probability = binomProb(n, k, p);
            } else if (cond === 'at_least') {
                for (let i = k; i <= n; i++) probability += binomProb(n, i, p);
            } else {
                for (let i = 0; i <= k; i++) probability += binomProb(n, i, p);
            }

            const expectedHeads = n * p;
            const stdDev = Math.sqrt(n * p * q);
            const probPct = probability * 100;
            const oddsRatio = probability > 0 ? (1 / probability) : Infinity;

            return {
                primaryOutput: { label: 'Outcome Probability', value: `${probPct.toFixed(2)}%`, suffix: oddsRatio < 1000000 ? `1 in ${oddsRatio.toFixed(1)} Odds` : 'Extremely Rare' },
                secondaryMetrics: [
                    { label: 'Theoretical Probability (Decimal)', value: probability.toFixed(6) },
                    { label: 'Expected Number of Heads (E[X])', value: `${expectedHeads.toFixed(1)} Heads` },
                    { label: 'Binomial Standard Deviation (σ)', value: `±${stdDev.toFixed(2)} Heads` },
                    { label: 'Fair Coin Benchmark (50/50)', value: p === 0.5 ? 'Fair Coin (Balanced 50/50)' : 'Biased Probability Model' }
                ]
            };
        }
    },
    // 2. Dice Probability Calculator
    {
        id: 'dice-probability-calculator',
        name: 'Dice Probability Calculator',
        category: 'games-recreation',
        group: 'Games & Recreation',
        bucket: 'Bucket B',
        tier: 4,
        phase: 4,
        monthlySearches: '4K',
        cpc: 'N/A',
        description: "Dice Probability Calculator tool.",
        inputs: [
            { id: 'numDice', name: 'Number of Dice', type: 'dropdown', defaultValue: 2, options: [{ label: '1 Die', value: 1 }, { label: '2 Dice (Standard 2d6)', value: 2 }, { label: '3 Dice (3d6 / RPG)', value: 3 }, { label: '4 Dice (4d6)', value: 4 }, { label: '5 Dice (Yahtzee)', value: 5 }, { label: '6 Dice', value: 6 }], tooltip: 'Dice count.' },
            { id: 'dieSides', name: 'Sides per Die', type: 'dropdown', defaultValue: 6, options: [{ label: 'd4 (4-Sided)', value: 4 }, { label: 'd6 (Standard 6-Sided)', value: 6 }, { label: 'd8 (8-Sided)', value: 8 }, { label: 'd10 (10-Sided)', value: 10 }, { label: 'd12 (12-Sided)', value: 12 }, { label: 'd20 (20-Sided D&D)', value: 20 }, { label: 'd100 (Percentile)', value: 100 }], tooltip: 'Number of faces.' },
            { id: 'targetSum', name: 'Target Dice Sum', type: 'number', defaultValue: 7, min: 1, max: 600, step: 1, tooltip: 'Target sum.' },
            { id: 'condition', name: 'Roll Condition', type: 'dropdown', defaultValue: 'exact', options: [{ label: 'Exact Sum (= Target)', value: 'exact' }, { label: 'At Least (>= Target)', value: 'at_least' }, { label: 'At Most (<= Target)', value: 'at_most' }], tooltip: 'Condition.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const n = Number(inputs.numDice) || 2;
            const s = Number(inputs.dieSides) || 6;
            const target = Number(inputs.targetSum) || 7;
            const cond = String(inputs.condition || 'exact');

            const minPossible = n * 1;
            const maxPossible = n * s;
            const totalOutcomes = Math.pow(s, n);

            // DP to count ways to reach each sum
            let dp = new Array(maxPossible + 1).fill(0);
            dp[0] = 1;

            for (let d = 0; d < n; d++) {
                let nextDp = new Array(maxPossible + 1).fill(0);
                for (let cur = 0; cur <= maxPossible; cur++) {
                    if (dp[cur] > 0) {
                        for (let face = 1; face <= s; face++) {
                            if (cur + face <= maxPossible) {
                                nextDp[cur + face] += dp[cur];
                            }
                        }
                    }
                }
                dp = nextDp;
            }

            let favorableWays = 0;
            if (cond === 'exact') {
                favorableWays = (target >= minPossible && target <= maxPossible) ? dp[target] : 0;
            } else if (cond === 'at_least') {
                for (let v = target; v <= maxPossible; v++) {
                    if (v >= minPossible) favorableWays += dp[v];
                }
            } else {
                for (let v = minPossible; v <= Math.min(target, maxPossible); v++) {
                    favorableWays += dp[v];
                }
            }

            const prob = favorableWays / totalOutcomes;
            const probPct = prob * 100;
            const oddsRatio = favorableWays > 0 ? (totalOutcomes / favorableWays) : Infinity;
            const avgSum = n * (s + 1) / 2;

            return {
                primaryOutput: { label: 'Roll Probability', value: `${probPct.toFixed(2)}%`, suffix: oddsRatio < 100000 ? `1 in ${oddsRatio.toFixed(1)} Rolls` : 'Near Impossible' },
                secondaryMetrics: [
                    { label: 'Favorable Combinations', value: `${favorableWays.toLocaleString()} / ${totalOutcomes.toLocaleString()} Total Ways` },
                    { label: 'Theoretical Expected Mean Sum', value: `${avgSum.toFixed(1)} (Range: ${minPossible}–${maxPossible})` },
                    { label: 'Exact Decimal Probability', value: prob.toFixed(6) },
                    { label: 'Most Probable Sum(s)', value: `${Math.floor(avgSum)} and ${Math.ceil(avgSum)}` }
                ]
            };
        }
    },
    // 3. Card Draw Probability Calculator
    {
        id: 'card-draw-probability-calculator',
        name: 'Card Draw Probability Calculator',
        category: 'games-recreation',
        group: 'Games & Recreation',
        bucket: 'Bucket B',
        tier: 5,
        phase: 5,
        monthlySearches: '170',
        cpc: 'N/A',
        description: "Card Draw Probability Calculator tool.",
        inputs: [
            { id: 'deckSize', name: 'Total Cards in Deck (N)', type: 'number', defaultValue: 52, min: 10, max: 200, step: 1, tooltip: '52 for standard deck, 60 for MTG, 40 for Yu-Gi-Oh.' },
            { id: 'targetCardsInDeck', name: 'Target Copies in Deck (K)', type: 'number', defaultValue: 4, min: 1, max: 50, step: 1, tooltip: 'E.g., 4 Aces in standard deck.' },
            { id: 'cardsDrawn', name: 'Cards Drawn / Hand Size (n)', type: 'number', defaultValue: 5, min: 1, max: 50, step: 1, tooltip: 'Opening hand or draw count.' },
            { id: 'targetSuccesses', name: 'Copies Needed (k)', type: 'number', defaultValue: 1, min: 1, max: 10, step: 1, tooltip: 'Target copies.' },
            { id: 'drawCondition', name: 'Success Condition', type: 'dropdown', defaultValue: 'at_least', options: [{ label: 'At Least k Copies (>= k)', value: 'at_least' }, { label: 'Exactly k Copies (= k)', value: 'exact' }, { label: 'No Copies (0 drawn)', value: 'none' }], tooltip: 'Condition.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const N = Math.max(1, Number(inputs.deckSize) || 52);
            const K = Math.min(N, Math.max(1, Number(inputs.targetCardsInDeck) || 4));
            const n = Math.min(N, Math.max(1, Number(inputs.cardsDrawn) || 5));
            const k = Math.min(n, Math.min(K, Math.max(1, Number(inputs.targetSuccesses) || 1)));
            const cond = String(inputs.drawCondition || 'at_least');

            const nCr = (total: number, choose: number): number => {
                if (choose < 0 || choose > total) return 0;
                if (choose === 0 || choose === total) return 1;
                let c = 1;
                for (let i = 1; i <= choose; i++) {
                    c = c * (total - (choose - i)) / i;
                }
                return c;
            };

            // Hypergeometric P(X = x) = [C(K, x) * C(N-K, n-x)] / C(N, n)
            const totalCombos = nCr(N, n);
            const hyperProb = (x: number): number => {
                if (x < 0 || x > K || x > n || (n - x) > (N - K)) return 0;
                return (nCr(K, x) * nCr(N - K, n - x)) / totalCombos;
            };

            let probability = 0;
            if (cond === 'exact') {
                probability = hyperProb(k);
            } else if (cond === 'at_least') {
                for (let x = k; x <= Math.min(n, K); x++) {
                    probability += hyperProb(x);
                }
            } else {
                probability = hyperProb(0);
            }

            const probPct = probability * 100;
            const oddsRatio = probability > 0 ? (1 / probability) : Infinity;

            return {
                primaryOutput: { label: 'Draw Probability', value: `${probPct.toFixed(2)}%`, suffix: oddsRatio < 1000000 ? `1 in ${oddsRatio.toFixed(1)} Hands` : '0%' },
                secondaryMetrics: [
                    { label: 'Exact Decimal Probability', value: probability.toFixed(6) },
                    { label: 'Total Possible Starting Hands', value: `${Math.round(totalCombos).toLocaleString()} Hands` },
                    { label: 'Chance of 0 Target Cards (Blanking)', value: `${(hyperProb(0) * 100).toFixed(2)}%` },
                    { label: 'Expected Value in Hand', value: `${((n * K) / N).toFixed(2)} Copies` }
                ]
            };
        }
    },
    // 4. Bingo Number Generator
    {
        id: 'bingo-number-generator',
        name: 'Bingo Number Generator',
        category: 'games-recreation',
        group: 'Games & Recreation',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '12K',
        cpc: '$0.61',
        description: "Bingo Number Generator tool.",
        inputs: [
            { id: 'bingoFormat', name: 'Bingo Style / Game Format', type: 'dropdown', defaultValue: '75_ball', options: [{ label: '75-Ball (US Standard B-I-N-G-O)', value: '75_ball' }, { label: '90-Ball (UK / Australian Housie)', value: '90_ball' }, { label: '80-Ball (Shutter Board)', value: '80_ball' }], tooltip: 'Game rules.' },
            { id: 'drawsCompleted', name: 'Current Balls Already Called', type: 'number', defaultValue: 15, min: 0, max: 89, step: 1, tooltip: 'Called count.' },
            { id: 'targetColumn', name: 'Column Focus (for 75-ball)', type: 'dropdown', defaultValue: 'any', options: [{ label: 'Any Column / General Ball', value: 'any' }, { label: 'B (1-15)', value: 'B' }, { label: 'I (16-30)', value: 'I' }, { label: 'N (31-45)', value: 'N' }, { label: 'G (46-60)', value: 'G' }, { label: 'O (61-75)', value: 'O' }], tooltip: 'Column.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const format = String(inputs.bingoFormat || '75_ball');
            const called = Number(inputs.drawsCompleted) || 15;
            const col = String(inputs.targetColumn || 'any');

            let totalBalls = 75;
            if (format === '90_ball') totalBalls = 90;
            else if (format === '80_ball') totalBalls = 80;

            const validCalled = Math.min(totalBalls - 1, Math.max(0, called));
            const remainingBalls = totalBalls - validCalled;

            // Odds of a specific needed number being called on next draw
            const singleBallChanceNext = (1 / remainingBalls) * 100;
            const colRemaining = Math.max(1, Math.round(15 - (validCalled / 5)));
            const colChanceNext = (colRemaining / remainingBalls) * 100;

            // Generate sample deterministic next 5 calls for display
            const seedSample = (validCalled * 17 + 7) % totalBalls + 1;
            let sampleCallName = `Ball #${seedSample}`;
            if (format === '75_ball') {
                if (seedSample <= 15) sampleCallName = `B-${seedSample}`;
                else if (seedSample <= 30) sampleCallName = `I-${seedSample}`;
                else if (seedSample <= 45) sampleCallName = `N-${seedSample}`;
                else if (seedSample <= 60) sampleCallName = `G-${seedSample}`;
                else sampleCallName = `O-${seedSample}`;
            }

            return {
                primaryOutput: { label: 'Remaining Uncalled Balls', value: `${remainingBalls} Balls`, suffix: `${((validCalled / totalBalls) * 100).toFixed(0)}% Game Elapsed` },
                secondaryMetrics: [
                    { label: 'Chance of Specific Needed Number on Next Call', value: `${singleBallChanceNext.toFixed(2)}% (1 in ${remainingBalls})` },
                    { label: 'Chance of Target Column on Next Call', value: format === '75_ball' ? `${colChanceNext.toFixed(1)}%` : 'N/A (Non 75-Ball)' },
                    { label: 'Sample Next Deterministic Call', value: sampleCallName },
                    { label: 'Game Progress Status', value: `${validCalled} of ${totalBalls} balls drawn` }
                ]
            };
        }
    },
    // 5. Poker Hand Probability Calculator
    {
        id: 'poker-hand-probability-calculator',
        name: 'Poker Hand Probability Calculator',
        category: 'games-recreation',
        group: 'Games & Recreation',
        bucket: 'Bucket B',
        tier: 5,
        phase: 5,
        monthlySearches: '210',
        cpc: '$1.09',
        description: "Poker Hand Probability Calculator tool.",
        inputs: [
            { id: 'pokerVariant', name: 'Poker Variant', type: 'dropdown', defaultValue: 'holdem', options: [{ label: "Texas Hold'em (7 Cards Total)", value: 'holdem' }, { label: '5-Card Draw / Video Poker (5 Cards)', value: 'five_card' }, { label: 'Omaha (4 Hole Cards)', value: 'omaha' }], tooltip: 'Game variant.' },
            { id: 'gameStreet', name: 'Game Street / Situation', type: 'dropdown', defaultValue: 'flop_to_river', options: [{ label: 'Flop to River (2 Cards to Come)', value: 'flop_to_river' }, { label: 'Turn to River (1 Card to Come)', value: 'turn_to_river' }, { label: 'Pre-Flop (5 Cards to Come)', value: 'preflop' }], tooltip: 'Current street.' },
            { id: 'unseenOuts', name: 'Number of Clean Outs (X)', type: 'number', defaultValue: 9, min: 1, max: 21, step: 1, tooltip: 'E.g., 9 outs for flush draw, 8 for open-ended straight, 4 for gutshot.' },
            { id: 'potSizeDollars', name: 'Current Pot Size ($)', type: 'number', defaultValue: 120, min: 5, step: 5, prefix: '$', tooltip: 'Pot before bet.' },
            { id: 'betToCallDollars', name: 'Bet to Call ($)', type: 'number', defaultValue: 30, min: 1, step: 5, prefix: '$', tooltip: 'Amount needed to call.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const street = String(inputs.gameStreet || 'flop_to_river');
            const outs = Math.min(45, Math.max(1, Number(inputs.unseenOuts) || 9));
            const pot = Number(inputs.potSizeDollars) || 120;
            const callBet = Number(inputs.betToCallDollars) || 30;

            let hitProb = 0;
            if (street === 'turn_to_river') {
                // 1 card to come from 46 unseen cards
                hitProb = outs / 46;
            } else if (street === 'flop_to_river') {
                // 2 cards to come: 1 - [(47-outs)/47 * (46-outs)/46]
                hitProb = 1 - (((47 - outs) / 47) * ((46 - outs) / 46));
            } else {
                // Preflop to river rough heuristic
                hitProb = 1 - Math.pow((50 - outs) / 50, 5);
            }

            const hitPct = hitProb * 100;
            // Pot odds calculation: Call / (Pot + Call)
            const totalPotAfterCall = pot + callBet;
            const potOddsRequiredPct = (callBet / (totalPotAfterCall + callBet)) * 100;
            const potOddsRatio = (pot + callBet) / callBet;

            const isProfitableCall = hitPct >= potOddsRequiredPct;
            const ruleOf4or2 = street === 'flop_to_river' ? (outs * 4) : (outs * 2);

            return {
                primaryOutput: { label: 'Equity / Hit Probability', value: `${hitPct.toFixed(1)}%`, suffix: `Pot Odds Needed: ${potOddsRequiredPct.toFixed(1)}%` },
                secondaryMetrics: [
                    { label: 'Call Decision Recommendation', value: isProfitableCall ? `+EV CALL: Equity (${hitPct.toFixed(1)}%) beats Pot Odds (${potOddsRequiredPct.toFixed(1)}%)` : `-EV FOLD: Pot Odds (${potOddsRequiredPct.toFixed(1)}%) exceed Equity (${hitPct.toFixed(1)}%)` },
                    { label: 'Pot Odds Ratio Offered', value: `${potOddsRatio.toFixed(2)} to 1 ($${callBet} to win $${totalPotAfterCall})` },
                    { label: 'Rule of 4 and 2 Shortcut', value: `~${ruleOf4or2}% Quick Estimate` },
                    { label: 'Unseen Deck Cards', value: street === 'turn_to_river' ? '46 Unknown Cards' : '47 Unknown Cards' }
                ]
            };
        }
    },
    // 6. Sports Bet Calculator
    {
        id: 'sports-bet-calculator',
        name: 'Sports Bet Calculator',
        category: 'games-recreation',
        group: 'Games & Recreation',
        bucket: 'Bucket B',
        tier: 4,
        phase: 4,
        monthlySearches: '4K',
        cpc: '$5.01  ★ HIGH CPC',
        description: "Sports Bet Calculator tool.",
        inputs: [
            { id: 'wagerAmount', name: 'Bet Stake / Wager Amount ($)', type: 'number', defaultValue: 100, min: 1, step: 10, prefix: '$', tooltip: 'Money wagered.' },
            { id: 'oddsFormat', name: 'Sportsbook Odds Format', type: 'dropdown', defaultValue: 'american', options: [{ label: 'American Odds (+150 or -110)', value: 'american' }, { label: 'Decimal Odds (e.g. 2.50)', value: 'decimal' }, { label: 'Fractional Odds (e.g. 3/2)', value: 'fractional' }], tooltip: 'Odds format.' },
            { id: 'americanOdds', name: 'American Odds Value', type: 'number', defaultValue: 150, min: -10000, max: 10000, step: 10, tooltip: 'e.g. -110 or +150 (only for American).' },
            { id: 'decimalOdds', name: 'Decimal Odds Value', type: 'number', defaultValue: 2.50, min: 1.01, max: 100.0, step: 0.05, tooltip: 'e.g. 2.50 (only for Decimal).' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const stake = Number(inputs.wagerAmount) || 100;
            const format = String(inputs.oddsFormat || 'american');
            const amOdds = Number(inputs.americanOdds) || 150;
            const decOdds = Number(inputs.decimalOdds) || 2.50;

            let impliedProb = 0;
            let netProfit = 0;
            let totalPayout = 0;

            if (format === 'american') {
                if (amOdds > 0) {
                    netProfit = stake * (amOdds / 100);
                    impliedProb = (100 / (amOdds + 100)) * 100;
                } else if (amOdds < 0) {
                    netProfit = stake * (100 / Math.abs(amOdds));
                    impliedProb = (Math.abs(amOdds) / (Math.abs(amOdds) + 100)) * 100;
                } else {
                    netProfit = stake;
                    impliedProb = 50;
                }
            } else {
                netProfit = stake * (decOdds - 1);
                impliedProb = (1 / decOdds) * 100;
            }

            totalPayout = stake + netProfit;
            const roiPct = (netProfit / stake) * 100;

            return {
                primaryOutput: { label: 'Total Potential Payout', value: `$${netProfit > 0 ? Math.round(totalPayout).toLocaleString() : '0'}`, suffix: `+$${Math.round(netProfit).toLocaleString()} Profit` },
                secondaryMetrics: [
                    { label: 'Implied Win Probability', value: `${impliedProb.toFixed(1)}%` },
                    { label: 'Return on Investment (ROI)', value: `+${roiPct.toFixed(1)}%` },
                    { label: 'Break-Even Win Rate Required', value: `${impliedProb.toFixed(1)}% to break even` },
                    { label: 'Equivalent Odds Format', value: format === 'american' ? `Decimal: ${ (1 + (netProfit / stake)).toFixed(2) }` : `American: ${ decOdds >= 2.0 ? `+${Math.round((decOdds - 1) * 100)}` : `-${Math.round(100 / (decOdds - 1))}` }` }
                ]
            };
        }
    },
    // 7. Lottery Odds Calculator
    {
        id: 'lottery-odds-calculator',
        name: 'Lottery Odds Calculator',
        category: 'games-recreation',
        group: 'Games & Recreation',
        bucket: 'Bucket B',
        tier: 4,
        phase: 4,
        monthlySearches: '2K',
        cpc: '$2.38',
        description: "Lottery Odds Calculator tool.",
        inputs: [
            { id: 'lotteryPreset', name: 'Lottery Game Preset', type: 'dropdown', defaultValue: 'powerball', options: [{ label: 'US Powerball (5/69 + 1/26)', value: 'powerball' }, { label: 'Mega Millions (5/70 + 1/25)', value: 'megamillions' }, { label: 'EuroMillions (5/50 + 2/12)', value: 'euromillions' }, { label: 'Classic Lotto (6/49)', value: 'classic_649' }], tooltip: 'Lottery rules.' },
            { id: 'ticketsPurchased', name: 'Number of Tickets / Lines Bought', type: 'number', defaultValue: 5, min: 1, max: 1000, step: 1, tooltip: 'Tickets played.' },
            { id: 'ticketPrice', name: 'Price per Ticket ($)', type: 'number', defaultValue: 2, min: 1, step: 1, prefix: '$', tooltip: 'Cost per ticket.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const preset = String(inputs.lotteryPreset || 'powerball');
            const tickets = Math.max(1, Number(inputs.ticketsPurchased) || 5);
            const price = Number(inputs.ticketPrice) || 2;

            let jackpotOddsOne = 292201338; // Powerball
            let match5Odds = 11688053;
            let match4Odds = 913125;

            if (preset === 'megamillions') {
                jackpotOddsOne = 302575350;
                match5Odds = 12607306;
                match4Odds = 931001;
            } else if (preset === 'euromillions') {
                jackpotOddsOne = 139838160;
                match5Odds = 6991908;
                match4Odds = 621503;
            } else if (preset === 'classic_649') {
                jackpotOddsOne = 13983816;
                match5Odds = 55491;
                match4Odds = 1033;
            }

            const ticketOddsRatio = jackpotOddsOne / tickets;
            const probPct = (tickets / jackpotOddsOne) * 100;
            const totalCost = tickets * price;
            const yearsToGuaranteeWeekly = (jackpotOddsOne / (tickets * 52));

            return {
                primaryOutput: { label: 'Jackpot Winning Odds', value: `1 in ${Math.round(ticketOddsRatio).toLocaleString()}`, suffix: `${probPct.toFixed(8)}% Chance` },
                secondaryMetrics: [
                    { label: 'Total Ticket Outlay', value: `$${totalCost.toLocaleString()} (${tickets} Tickets)` },
                    { label: 'Odds of Matching 5 White Balls ($1M+)', value: `1 in ${Math.round(match5Odds / tickets).toLocaleString()}` },
                    { label: 'Odds of Matching 4 Balls ($500+)', value: `1 in ${Math.round(match4Odds / tickets).toLocaleString()}` },
                    { label: 'Years Playing Weekly for 50% Stat Probability', value: `~${Math.round(yearsToGuaranteeWeekly * 0.693).toLocaleString()} Years` }
                ]
            };
        }
    },
    // 8. Fantasy Points Calculator
    {
        id: 'fantasy-points-calculator',
        name: 'Fantasy Points Calculator',
        category: 'games-recreation',
        group: 'Games & Recreation',
        bucket: 'Bucket B',
        tier: 4,
        phase: 4,
        monthlySearches: '4K',
        cpc: '$10.92  ★ HIGH CPC',
        description: "Fantasy Points Calculator tool.",
        inputs: [
            { id: 'scoringFormat', name: 'Fantasy Football Scoring Format', type: 'dropdown', defaultValue: 'full_ppr', options: [{ label: 'Full PPR (1.0 Pt / Reception)', value: 'full_ppr' }, { label: 'Half PPR (0.5 Pt / Reception)', value: 'half_ppr' }, { label: 'Standard / Non-PPR (0 Pt / Reception)', value: 'standard' }], tooltip: 'Scoring format.' },
            { id: 'passYards', name: 'Passing Yards', type: 'number', defaultValue: 280, min: 0, step: 20, tooltip: '1 pt per 25 yds.' },
            { id: 'passTDs', name: 'Passing Touchdowns', type: 'number', defaultValue: 2, min: 0, max: 8, step: 1, tooltip: '4 pts each.' },
            { id: 'rushYards', name: 'Rushing / Receiving Yards', type: 'number', defaultValue: 85, min: 0, step: 10, tooltip: '1 pt per 10 yds.' },
            { id: 'rushRecTDs', name: 'Rushing / Receiving TDs', type: 'number', defaultValue: 1, min: 0, max: 6, step: 1, tooltip: '6 pts each.' },
            { id: 'receptions', name: 'Receptions (Catches)', type: 'number', defaultValue: 6, min: 0, max: 20, step: 1, tooltip: 'PPR catches.' },
            { id: 'turnovers', name: 'Interceptions & Fumbles Lost', type: 'number', defaultValue: 1, min: 0, max: 6, step: 1, tooltip: '-2 pts each.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const format = String(inputs.scoringFormat || 'full_ppr');
            const passYds = Number(inputs.passYards) || 280;
            const passTD = Number(inputs.passTDs) || 2;
            const rushRecYds = Number(inputs.rushYards) || 85;
            const rushRecTD = Number(inputs.rushRecTDs) || 1;
            const rec = Number(inputs.receptions) || 6;
            const to = Number(inputs.turnovers) || 1;

            let pprWeight = 1.0;
            if (format === 'half_ppr') pprWeight = 0.5;
            else if (format === 'standard') pprWeight = 0.0;

            const passPts = (passYds * 0.04) + (passTD * 4);
            const rushRecPts = (rushRecYds * 0.10) + (rushRecTD * 6);
            const recPts = rec * pprWeight;
            const penaltyPts = to * -2;

            const totalPoints = passPts + rushRecPts + recPts + penaltyPts;

            return {
                primaryOutput: { label: 'Total Fantasy Points', value: `${totalPoints.toFixed(2)} Pts`, suffix: `${format.toUpperCase()} Scoring` },
                secondaryMetrics: [
                    { label: 'Passing Production Points', value: `${passPts.toFixed(1)} Pts (${passYds} yds, ${passTD} TDs)` },
                    { label: 'Rushing & Receiving Yardage/TD Points', value: `${rushRecPts.toFixed(1)} Pts (${rushRecYds} yds, ${rushRecTD} TDs)` },
                    { label: 'PPR Reception Bonus Points', value: `+${recPts.toFixed(1)} Pts (${rec} catches @ ${pprWeight} pt/rec)` },
                    { label: 'Turnover Deductions', value: `${penaltyPts.toFixed(1)} Pts (${to} turnovers)` }
                ]
            };
        }
    }
];

export const cat12GamesCalculators = gamesRecreationCalculators;
export default gamesRecreationCalculators;
