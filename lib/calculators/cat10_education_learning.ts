import { CalculatorDefinition } from '../../types/calculator';

export const educationLearningCalculators: CalculatorDefinition[] = [
    // 1. College GPA & Target Projections Calculator
    {
        id: 'gpa-calculator',
        name: 'College GPA & Grade Projection Calculator',
        category: 'education-learning',
        group: '10A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '1.2M',
        cpc: '$0.55',
        description: 'Computes cumulative GPA on a 4.0 weighted credit-hour scale and estimates future term grades needed to hit graduation targets.',
        inputs: [
            { id: 'currentGpa', name: 'Current Cumulative GPA', type: 'number', defaultValue: 3.35, min: 0, max: 4.0, step: 0.01, tooltip: 'Present GPA.' },
            { id: 'completedCredits', name: 'Completed Credit Hours', type: 'number', defaultValue: 60, min: 0, max: 200, step: 1, suffix: 'credits', tooltip: 'Credits already graded.' },
            { id: 'semesterCredits', name: 'Current Semester Credit Hours', type: 'number', defaultValue: 15, min: 1, max: 30, step: 1, suffix: 'credits', tooltip: 'Credits taken this term.' },
            { id: 'targetGpa', name: 'Desired Graduation Target GPA', type: 'number', defaultValue: 3.50, min: 0, max: 4.0, step: 0.01, tooltip: 'Target cumulative GPA.' }
        ],
        naturalLanguageQueries: [
            'College GPA calculator',
            'What GPA do I need to raise my GPA to 3.5?',
            'Cumulative GPA projector with credit hours'
        ],
        edgeCases: ['Target GPA mathematically impossible (requiring > 4.0 term GPA)'],
        calculate: (inputs) => {
            const curGpa = Number(inputs.currentGpa) || 3.35;
            const doneCredits = Number(inputs.completedCredits) || 60;
            const semCredits = Number(inputs.semesterCredits) || 15;
            const target = Number(inputs.targetGpa) || 3.50;

            const totalExistingQualityPoints = curGpa * doneCredits;
            const newTotalCredits = doneCredits + semCredits;

            // Target Quality Points: target * newTotalCredits
            // Required Term Points = (target * newTotalCredits) - totalExistingQualityPoints
            const neededPoints = (target * newTotalCredits) - totalExistingQualityPoints;
            const requiredTermGpa = semCredits > 0 ? neededPoints / semCredits : 0;

            let feasibility = 'Feasible within normal grading limits (A / A-)';
            if (requiredTermGpa > 4.0) {
                feasibility = `Mathematically impossible in 1 semester (Requires ${requiredTermGpa.toFixed(2)} GPA)`;
            } else if (requiredTermGpa <= curGpa) {
                feasibility = 'Easily achievable (Requires lower than current average)';
            }

            return {
                primaryOutput: { label: 'Required Semester Term GPA', value: requiredTermGpa <= 4.0 ? requiredTermGpa.toFixed(2) : 'Exceeds 4.0', suffix: 'Target' },
                secondaryMetrics: [
                    { label: 'Feasibility Analysis', value: feasibility },
                    { label: 'Total Post-Term Credits', value: `${newTotalCredits} Credits` },
                    { label: 'Quality Points Needed This Term', value: `${Math.max(0, neededPoints).toFixed(1)} Points` },
                    { label: 'Current Quality Points Stored', value: `${totalExistingQualityPoints.toFixed(1)} Points` }
                ]
            };
        }
    },

    // 2. Final Exam Grade Calculator
    {
        id: 'final-exam-calculator',
        name: 'Final Exam Grade Calculator',
        category: 'education-learning',
        group: '10A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '673K',
        cpc: '$0.40',
        description: 'Calculates the minimum score you must achieve on your final exam to secure your desired overall course grade.',
        inputs: [
            { id: 'currentGradePct', name: 'Current Course Grade', type: 'percentage', defaultValue: 84.5, min: 0, max: 100, step: 0.5, suffix: '%', tooltip: 'Grade in class before final.' },
            { id: 'desiredGradePct', name: 'Desired Letter Grade Threshold', type: 'percentage', defaultValue: 90.0, min: 0, max: 100, step: 0.5, suffix: '%', tooltip: 'Minimum target (e.g., 90% for an A).' },
            { id: 'finalExamWeightPct', name: 'Final Exam Weight', type: 'percentage', defaultValue: 25.0, min: 1, max: 90, step: 1, suffix: '%', tooltip: 'Weight percentage of the exam.' }
        ],
        naturalLanguageQueries: [
            'What do I need on my final exam to get an A?',
            'Final exam score calculator',
            'Calculate test grade needed to pass'
        ],
        edgeCases: ['Exam weight = 100%', 'Required exam score > 100% (requires extra credit)'],
        calculate: (inputs) => {
            const current = Number(inputs.currentGradePct) || 84.5;
            const target = Number(inputs.desiredGradePct) || 90.0;
            const weight = (Number(inputs.finalExamWeightPct) || 25) / 100;

            // Desired = (Current * (1 - w)) + (Exam * w)
            // Exam = (Desired - (Current * (1 - w))) / w
            const priorWeight = 1 - weight;
            const requiredExamScore = (target - (current * priorWeight)) / weight;

            let status = 'Achievable with standard preparation';
            if (requiredExamScore > 100) {
                status = 'Requires Extra Credit (> 100%)';
            } else if (requiredExamScore <= 50) {
                status = 'High Safety Cushion (Under 50% needed)';
            }

            return {
                primaryOutput: { label: 'Required Final Exam Score', value: requiredExamScore.toFixed(1), suffix: '%' },
                secondaryMetrics: [
                    { label: 'Status & Outlook', value: status },
                    { label: 'Current Pre-Final Contribution', value: `${(current * priorWeight).toFixed(1)}% / ${(priorWeight * 100).toFixed(0)}%` },
                    { label: 'Exam Total Weight Contribution', value: `${(weight * 100).toFixed(0)}% of Course` }
                ]
            };
        }
    },

    // 3. SAT to ACT Concordance Calculator
    {
        id: 'sat-act-concordance-calculator',
        name: 'SAT to ACT Concordance Score Converter',
        category: 'education-learning',
        group: '10A',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '201K',
        cpc: '$0.65',
        description: 'Converts between SAT and ACT composite scores using the official College Board and ACT cross-test concordance tables.',
        inputs: [
            {
                id: 'testType', name: 'Original Test Taken', type: 'dropdown', defaultValue: 'sat', options: [
                    { label: 'SAT (Scale 400 - 1600)', value: 'sat' },
                    { label: 'ACT (Scale 1 - 36)', value: 'act' }
                ], tooltip: 'Source exam.'
            },
            { id: 'scoreInput', name: 'Exam Score', type: 'number', defaultValue: 1350, min: 1, max: 1600, step: 10, tooltip: 'Composite score.' }
        ],
        naturalLanguageQueries: [
            'SAT to ACT score conversion',
            'What is 1350 SAT in ACT?',
            'College board ACT SAT concordance'
        ],
        edgeCases: ['Out of range test scores beyond official score minimums and maximums'],
        calculate: (inputs) => {
            const isSat = inputs.testType === 'sat';
            const score = Number(inputs.scoreInput) || (isSat ? 1350 : 29);

            if (isSat) {
                const satScore = Math.max(400, Math.min(1600, score));
                // Linear/piecewise concordance model
                let actEquiv = 9;
                if (satScore >= 1570) actEquiv = 36;
                else if (satScore >= 1530) actEquiv = 35;
                else if (satScore >= 1490) actEquiv = 34;
                else if (satScore >= 1450) actEquiv = 33;
                else if (satScore >= 1420) actEquiv = 32;
                else if (satScore >= 1390) actEquiv = 31;
                else if (satScore >= 1350) actEquiv = 30;
                else if (satScore >= 1310) actEquiv = 29;
                else if (satScore >= 1260) actEquiv = 28;
                else if (satScore >= 1210) actEquiv = 27;
                else if (satScore >= 1160) actEquiv = 26;
                else if (satScore >= 1110) actEquiv = 24;
                else if (satScore >= 1030) actEquiv = 21;
                else actEquiv = Math.max(9, Math.round((satScore - 400) / 33.3));

                return {
                    primaryOutput: { label: 'Concordant ACT Composite Score', value: actEquiv.toString(), suffix: '/ 36' },
                    secondaryMetrics: [
                        { label: 'Percentile Rank Estimate', value: satScore >= 1400 ? 'Top 5% (95th+ percentile)' : satScore >= 1200 ? 'Top 25% (75th percentile)' : 'National Average Range' },
                        { label: 'Source Standardized Exam', value: `SAT Composite ${satScore}` }
                    ]
                };
            } else {
                const actScore = Math.max(1, Math.min(36, score));
                const satLookup: Record<number, string> = {
                    36: '1570-1600', 35: '1530-1560', 34: '1490-1520', 33: '1450-1480',
                    32: '1420-1440', 31: '1390-1410', 30: '1350-1380', 29: '1310-1340',
                    28: '1260-1300', 27: '1210-1250', 26: '1160-1200', 25: '1110-1150',
                    24: '1070-1100', 23: '1030-1060', 22: '990-1020', 21: '950-980'
                };

                return {
                    primaryOutput: { label: 'Concordant SAT Score Range', value: satLookup[actScore] || `${Math.round(actScore * 44.4)}` },
                    secondaryMetrics: [
                        { label: 'Source Composite Score', value: `ACT Composite ${actScore}` },
                        { label: 'Concordance Methodology', value: 'College Board / ACT Joint Table Standard' }
                    ]
                };
            }
        }
    },

    // 4. Flesch Reading Ease & Readability Index
    {
        id: 'flesch-readability-calculator',
        name: 'Flesch Reading Ease & Grade Level Calculator',
        category: 'education-learning',
        group: '10A',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '80K',
        cpc: '$0.35',
        description: 'Computes Flesch-Kincaid Grade Level and Reading Ease scores based on words, sentences, and syllable count metrics.',
        inputs: [
            { id: 'wordCount', name: 'Total Word Count', type: 'number', defaultValue: 350, min: 1, step: 10, suffix: 'words', tooltip: 'Number of words in passage.' },
            { id: 'sentenceCount', name: 'Total Sentence Count', type: 'number', defaultValue: 22, min: 1, step: 1, suffix: 'sentences', tooltip: 'Number of sentences in passage.' },
            { id: 'syllableCount', name: 'Total Syllable Count', type: 'number', defaultValue: 520, min: 1, step: 10, suffix: 'syllables', tooltip: 'Total syllables across all words.' }
        ],
        naturalLanguageQueries: [
            'Flesch reading ease formula calculator',
            'Flesch Kincaid grade level calculator',
            'Text readability score'
        ],
        edgeCases: ['Sentence count or word count equal to zero'],
        calculate: (inputs) => {
            const words = Math.max(1, Number(inputs.wordCount) || 350);
            const sentences = Math.max(1, Number(inputs.sentenceCount) || 22);
            const syllables = Math.max(1, Number(inputs.syllableCount) || 520);

            const wordsPerSentence = words / sentences;
            const syllablesPerWord = syllables / words;

            // Flesch Reading Ease = 206.835 - (1.015 * ASL) - (84.6 * ASW)
            const readingEase = 206.835 - (1.015 * wordsPerSentence) - (84.6 * syllablesPerWord);

            // Flesch-Kincaid Grade Level = (0.39 * ASL) + (11.8 * ASW) - 15.59
            const gradeLevel = (0.39 * wordsPerSentence) + (11.8 * syllablesPerWord) - 15.59;

            let easeCategory = 'Plain English / 8th-9th Grade';
            if (readingEase >= 90) easeCategory = 'Very Easy (5th Grade level)';
            else if (readingEase >= 70) easeCategory = 'Fairly Easy (7th Grade)';
            else if (readingEase >= 60) easeCategory = 'Standard English (8th-9th Grade)';
            else if (readingEase >= 50) easeCategory = 'Fairly Difficult (10th-12th Grade)';
            else if (readingEase >= 30) easeCategory = 'Difficult (College Undergrad)';
            else easeCategory = 'Very Confusing / Academic Graduate';

            return {
                primaryOutput: { label: 'Flesch Reading Ease Score', value: Math.max(0, Math.min(100, readingEase)).toFixed(1), suffix: '/ 100' },
                secondaryMetrics: [
                    { label: 'Equivalent US School Grade Level', value: `Grade ${Math.max(1, gradeLevel).toFixed(1)}` },
                    { label: 'Readability Classification', value: easeCategory },
                    { label: 'Average Sentence Length (ASL)', value: `${wordsPerSentence.toFixed(1)} words/sentence` },
                    { label: 'Average Syllables Per Word', value: `${syllablesPerWord.toFixed(2)} syllables/word` }
                ]
            };
        }
    },

    // 5. SM-2 Spaced Repetition Review Interval Calculator
    {
        id: 'spaced-repetition-calculator',
        name: 'SM-2 Spaced Repetition Interval Calculator',
        category: 'education-learning',
        group: '10A',
        bucket: 'Bucket B',
        tier: 3,
        phase: 2,
        monthlySearches: '30K',
        cpc: '$0.40',
        description: 'Calculates the next optimal memory review interval (days) and Easiness Factor (EF) according to SuperMemo SM-2 memory mechanics.',
        inputs: [
            { id: 'repetitionNumber', name: 'Current Consecutive Correct Reps (n)', type: 'number', defaultValue: 3, min: 0, max: 50, step: 1, tooltip: 'How many times successfully recalled.' },
            { id: 'previousIntervalDays', name: 'Previous Interval (Days)', type: 'number', defaultValue: 6, min: 1, step: 1, suffix: 'days', tooltip: 'Days since prior review.' },
            { id: 'priorEasinessFactor', name: 'Current Easiness Factor (EF)', type: 'number', defaultValue: 2.5, min: 1.3, max: 4.0, step: 0.1, tooltip: 'Initial default is 2.5.' },
            {
                id: 'reviewQualityGrade', name: 'Recall Quality Grade (0 to 5)', type: 'dropdown', defaultValue: 4, options: [
                    { label: '5 — Perfect recall without hesitation', value: 5 },
                    { label: '4 — Correct response after slight hesitation', value: 4 },
                    { label: '3 — Correct response with serious difficulty', value: 3 },
                    { label: '2 — Incorrect response; where correct was easy to recall', value: 2 },
                    { label: '1 — Incorrect response; but the correct answer remembered', value: 1 },
                    { label: '0 — Complete blackout memory failure', value: 0 }
                ], tooltip: 'Standard SM-2 performance score.'
            }
        ],
        naturalLanguageQueries: [
            'SM-2 algorithm calculator',
            'Spaced repetition flashcard interval formula',
            'SuperMemo memory interval schedule'
        ],
        edgeCases: ['Quality grade < 3 resetting interval sequence to 1 day'],
        calculate: (inputs) => {
            const n = Number(inputs.repetitionNumber) || 3;
            const prevI = Number(inputs.previousIntervalDays) || 6;
            const priorEf = Number(inputs.priorEasinessFactor) || 2.5;
            const q = Number(inputs.reviewQualityGrade) || 4;

            // EF formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
            const newEf = Math.max(1.3, priorEf + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

            let nextInterval = 1;
            if (q < 3) {
                // Failed card reset
                nextInterval = 1;
            } else {
                if (n === 0) nextInterval = 1;
                else if (n === 1) nextInterval = 6;
                else nextInterval = Math.round(prevI * newEf);
            }

            return {
                primaryOutput: { label: 'Next Scheduled Review Date', value: `+${nextInterval} Days`, suffix: 'Interval' },
                secondaryMetrics: [
                    { label: 'Updated Easiness Factor (EF)', value: newEf.toFixed(2) },
                    { label: 'Consecutive Successful Repetitions', value: q >= 3 ? `${n + 1} reps` : 'Reset to 0 (Failed Recall)' },
                    { label: 'Memory Retention Probability Target', value: '~90% at interval threshold' }
                ]
            };
        }
    }
];