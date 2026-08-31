import { CalculatorDefinition } from '../../types/calculator';

export const healthFitnessCalculators: CalculatorDefinition[] = [
    // 1. BMI Calculator (Body Mass Index)
    {
        id: 'bmi-calculator',
        name: 'BMI Calculator',
        category: 'health-fitness',
        group: '2A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '1.5M',
        cpc: '$0.45',
        description: 'Calculates Body Mass Index (BMI) using WHO criteria and displays healthy weight ranges for adults.',
        inputs: [
            { id: 'gender', name: 'Biological Sex', type: 'dropdown', defaultValue: 'male', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }], tooltip: 'Biological sex for contextual health metrics.' },
            { id: 'age', name: 'Age', type: 'number', defaultValue: 28, min: 2, max: 120, step: 1, suffix: 'yrs', tooltip: 'Age in completed years.' },
            { id: 'heightCm', name: 'Height (cm)', type: 'number', defaultValue: 175, min: 50, max: 250, step: 0.5, suffix: 'cm', tooltip: 'Stature in centimeters.' },
            { id: 'weightKg', name: 'Weight (kg)', type: 'number', defaultValue: 72, min: 20, max: 350, step: 0.5, suffix: 'kg', tooltip: 'Current body mass in kilograms.' }
        ],
        naturalLanguageQueries: [
            'Calculate my BMI',
            'What is healthy weight for 175 cm?',
            'BMI classification calculator'
        ],
        edgeCases: ['Zero height division guard', 'Extreme body mass values'],
        calculate: (inputs) => {
            const heightM = (Number(inputs.heightCm) || 175) / 100;
            const weight = Number(inputs.weightKg) || 72;

            if (heightM <= 0) {
                return { primaryOutput: { label: 'BMI', value: 'Invalid Height' }, secondaryMetrics: [] };
            }

            const bmi = weight / (heightM * heightM);
            let classification = 'Normal weight';
            if (bmi < 18.5) classification = 'Underweight';
            else if (bmi < 25) classification = 'Normal weight';
            else if (bmi < 30) classification = 'Overweight';
            else if (bmi < 35) classification = 'Obesity Class I';
            else if (bmi < 40) classification = 'Obesity Class II';
            else classification = 'Obesity Class III (Severe)';

            const minHealthyWeight = 18.5 * (heightM * heightM);
            const maxHealthyWeight = 24.9 * (heightM * heightM);

            return {
                primaryOutput: { label: 'Body Mass Index (BMI)', value: bmi.toFixed(1), suffix: 'kg/m²' },
                secondaryMetrics: [
                    { label: 'WHO Classification', value: classification },
                    { label: 'Healthy Weight Target Range', value: `${minHealthyWeight.toFixed(1)} - ${maxHealthyWeight.toFixed(1)} kg` },
                    { label: 'Ponderal Index', value: `${(weight / Math.pow(heightM, 3)).toFixed(2)} kg/m³` }
                ]
            };
        }
    },

    // 2. Calorie Calculator & TDEE
    {
        id: 'calorie-calculator',
        name: 'Daily Calorie & TDEE Calculator',
        category: 'health-fitness',
        group: '2A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '1.2M',
        cpc: '$0.60',
        description: 'Estimates Total Daily Energy Expenditure (TDEE) and target daily caloric intake for maintenance, weight loss, or muscle gain.',
        inputs: [
            { id: 'gender', name: 'Biological Sex', type: 'dropdown', defaultValue: 'male', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }], tooltip: 'Sex determines metabolic constant offset.' },
            { id: 'age', name: 'Age', type: 'number', defaultValue: 30, min: 15, max: 100, step: 1, suffix: 'yrs', tooltip: 'Chronological age.' },
            { id: 'heightCm', name: 'Height (cm)', type: 'number', defaultValue: 178, min: 100, max: 230, step: 1, suffix: 'cm', tooltip: 'Height in cm.' },
            { id: 'weightKg', name: 'Weight (kg)', type: 'number', defaultValue: 78, min: 35, max: 250, step: 0.5, suffix: 'kg', tooltip: 'Body weight.' },
            {
                id: 'activityLevel', name: 'Daily Activity Level', type: 'dropdown', defaultValue: 1.375, options: [
                    { label: 'Sedentary (Little or no exercise)', value: 1.2 },
                    { label: 'Lightly Active (Exercise 1-3 days/wk)', value: 1.375 },
                    { label: 'Moderately Active (Exercise 3-5 days/wk)', value: 1.55 },
                    { label: 'Very Active (Hard exercise 6-7 days/wk)', value: 1.725 },
                    { label: 'Extra Active (Physical job + intense training)', value: 1.9 }
                ], tooltip: 'Physical activity multiplier.'
            }
        ],
        naturalLanguageQueries: [
            'How many calories should I eat a day?',
            'TDEE calculator for weight loss',
            'Maintenance calories estimate'
        ],
        edgeCases: ['Extreme caloric deficit below biological minimums (1200 kcal/day)'],
        calculate: (inputs) => {
            const isMale = inputs.gender === 'male';
            const age = Number(inputs.age) || 30;
            const h = Number(inputs.heightCm) || 178;
            const w = Number(inputs.weightKg) || 78;
            const act = Number(inputs.activityLevel) || 1.375;

            // Mifflin-St Jeor BMR Formula
            const bmr = (10 * w) + (6.25 * h) - (5 * age) + (isMale ? 5 : -161);
            const tdee = bmr * act;

            const mildDeficit = Math.max(1200, tdee - 250);
            const weightLoss = Math.max(1200, tdee - 500);
            const muscleGain = tdee + 300;

            return {
                primaryOutput: { label: 'Daily Maintenance Calories (TDEE)', value: Math.round(tdee).toLocaleString(), suffix: 'kcal/day' },
                secondaryMetrics: [
                    { label: 'Basal Metabolic Rate (BMR)', value: `${Math.round(bmr).toLocaleString()} kcal/day` },
                    { label: 'Weight Loss Target (-0.5 kg/wk)', value: `${Math.round(weightLoss).toLocaleString()} kcal/day` },
                    { label: 'Mild Weight Loss Target (-0.25 kg/wk)', value: `${Math.round(mildDeficit).toLocaleString()} kcal/day` },
                    { label: 'Lean Bulking Target (+0.25 kg/wk)', value: `${Math.round(muscleGain).toLocaleString()} kcal/day` }
                ]
            };
        }
    },

    // 3. Body Fat Percentage Calculator (U.S. Navy Method)
    {
        id: 'body-fat-calculator',
        name: 'Body Fat Percentage Calculator',
        category: 'health-fitness',
        group: '2A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '823K',
        cpc: '$0.50',
        description: 'Estimates body fat percentage, fat mass, and lean muscle mass using the official U.S. Navy circumferential method.',
        inputs: [
            { id: 'gender', name: 'Biological Sex', type: 'dropdown', defaultValue: 'male', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }], tooltip: 'Affects anatomical tape points.' },
            { id: 'heightCm', name: 'Height (cm)', type: 'number', defaultValue: 180, min: 120, max: 230, step: 1, suffix: 'cm', tooltip: 'Stature.' },
            { id: 'weightKg', name: 'Weight (kg)', type: 'number', defaultValue: 80, min: 40, max: 220, step: 0.5, suffix: 'kg', tooltip: 'Scale weight.' },
            { id: 'neckCm', name: 'Neck Circumference (cm)', type: 'number', defaultValue: 38, min: 25, max: 60, step: 0.5, suffix: 'cm', tooltip: 'Narrowest point below Adam’s apple.' },
            { id: 'waistCm', name: 'Waist Circumference (cm)', type: 'number', defaultValue: 86, min: 50, max: 180, step: 0.5, suffix: 'cm', tooltip: 'Measured at the naval line horizontally.' },
            { id: 'hipCm', name: 'Hip Circumference (cm - Female only)', type: 'number', defaultValue: 95, min: 60, max: 180, step: 0.5, suffix: 'cm', tooltip: 'Widest point of buttocks/hips.' }
        ],
        naturalLanguageQueries: [
            'US Navy body fat calculator',
            'Estimate body fat percentage with tape measure',
            'Lean mass vs fat mass calculator'
        ],
        edgeCases: ['Neck measurement greater than or equal to waist', 'Logarithmic negative input guards'],
        calculate: (inputs) => {
            const isMale = inputs.gender === 'male';
            const h = Number(inputs.heightCm) || 180;
            const w = Number(inputs.weightKg) || 80;
            const neck = Number(inputs.neckCm) || 38;
            const waist = Number(inputs.waistCm) || 86;
            const hip = Number(inputs.hipCm) || 95;

            let bf = 15;
            if (isMale) {
                const diff = waist - neck;
                if (diff > 0) {
                    bf = 495 / (1.0324 - (0.19077 * Math.log10(diff)) + (0.15456 * Math.log10(h))) - 450;
                }
            } else {
                const sum = waist + hip - neck;
                if (sum > 0) {
                    bf = 495 / (1.29579 - (0.35004 * Math.log10(sum)) + (0.22100 * Math.log10(h))) - 450;
                }
            }

            const clampedBf = Math.max(3, Math.min(60, bf));
            const fatMassKg = w * (clampedBf / 100);
            const leanMassKg = w - fatMassKg;

            return {
                primaryOutput: { label: 'Estimated Body Fat Percentage', value: clampedBf.toFixed(1), suffix: '%' },
                secondaryMetrics: [
                    { label: 'Lean Muscle & Bone Mass', value: `${leanMassKg.toFixed(1)} kg` },
                    { label: 'Total Fat Tissue Mass', value: `${fatMassKg.toFixed(1)} kg` },
                    { label: 'Body Composition Category', value: isMale ? (clampedBf < 14 ? 'Athletic / Lean' : clampedBf < 20 ? 'Fitness / Healthy' : 'Above Average') : (clampedBf < 21 ? 'Athletic / Lean' : clampedBf < 25 ? 'Fitness / Healthy' : 'Above Average') }
                ]
            };
        }
    },

    // 4. BMR Calculator (Basal Metabolic Rate)
    {
        id: 'bmr-calculator',
        name: 'BMR Calculator (Mifflin & Harris-Benedict)',
        category: 'health-fitness',
        group: '2A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '673K',
        cpc: '$0.40',
        description: 'Computes resting metabolic energy requirements comparing both the modern Mifflin-St Jeor and Revised Harris-Benedict equations.',
        inputs: [
            { id: 'gender', name: 'Biological Sex', type: 'dropdown', defaultValue: 'female', options: [{ label: 'Female', value: 'female' }, { label: 'Male', value: 'male' }], tooltip: 'Sex constant.' },
            { id: 'age', name: 'Age', type: 'number', defaultValue: 29, min: 15, max: 105, step: 1, suffix: 'yrs', tooltip: 'Age in years.' },
            { id: 'heightCm', name: 'Height (cm)', type: 'number', defaultValue: 165, min: 100, max: 240, step: 1, suffix: 'cm', tooltip: 'Height in cm.' },
            { id: 'weightKg', name: 'Weight (kg)', type: 'number', defaultValue: 62, min: 30, max: 250, step: 0.5, suffix: 'kg', tooltip: 'Weight in kg.' }
        ],
        naturalLanguageQueries: [
            'Basal metabolic rate calculator',
            'How many calories burned doing nothing?',
            'Mifflin St Jeor BMR formula'
        ],
        edgeCases: ['Zero age or weight'],
        calculate: (inputs) => {
            const isMale = inputs.gender === 'male';
            const age = Number(inputs.age) || 29;
            const h = Number(inputs.heightCm) || 165;
            const w = Number(inputs.weightKg) || 62;

            // 1. Mifflin-St Jeor
            const mifflin = (10 * w) + (6.25 * h) - (5 * age) + (isMale ? 5 : -161);

            // 2. Revised Harris-Benedict
            const hb = isMale
                ? (13.397 * w) + (4.799 * h) - (5.677 * age) + 88.362
                : (9.247 * w) + (3.098 * h) - (4.330 * age) + 447.593;

            return {
                primaryOutput: { label: 'Basal Metabolic Rate (Mifflin-St Jeor)', value: Math.round(mifflin).toLocaleString(), suffix: 'kcal/day' },
                secondaryMetrics: [
                    { label: 'Harris-Benedict Benchmark', value: `${Math.round(hb).toLocaleString()} kcal/day` },
                    { label: 'Hourly Resting Energy Burn', value: `${(mifflin / 24).toFixed(1)} kcal/hr` },
                    { label: 'Formula Variance Differential', value: `${Math.abs(Math.round(mifflin - hb))} kcal` }
                ]
            };
        }
    },

    // 5. Ideal Body Weight Calculator (Devine, Robinson, Miller)
    {
        id: 'ideal-weight-calculator',
        name: 'Ideal Body Weight Calculator',
        category: 'health-fitness',
        group: '2A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '301K',
        cpc: '$0.35',
        description: 'Compares medical Ideal Body Weight (IBW) targets across standard clinical formulas: Devine, Robinson, Miller, and Hamwi.',
        inputs: [
            { id: 'gender', name: 'Biological Sex', type: 'dropdown', defaultValue: 'male', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }], tooltip: 'Sex baseline.' },
            { id: 'heightCm', name: 'Height (cm)', type: 'number', defaultValue: 180, min: 152, max: 230, step: 1, suffix: 'cm', tooltip: 'Height in cm (standard formulas apply above 5 feet / 152.4 cm).' }
        ],
        naturalLanguageQueries: [
            'What is my ideal body weight?',
            'Devine formula IBW calculator',
            'Ideal weight for 5ft 11 male'
        ],
        edgeCases: ['Height under 152.4 cm (5 feet)'],
        calculate: (inputs) => {
            const isMale = inputs.gender === 'male';
            const hCm = Number(inputs.heightCm) || 180;
            const hInches = hCm / 2.54;
            const inchesOver5Ft = Math.max(0, hInches - 60);

            // Devine Formula
            const devineKg = isMale ? 50.0 + (2.3 * inchesOver5Ft) : 45.5 + (2.3 * inchesOver5Ft);
            // Robinson Formula
            const robinsonKg = isMale ? 52.0 + (1.9 * inchesOver5Ft) : 49.0 + (1.7 * inchesOver5Ft);
            // Miller Formula
            const millerKg = isMale ? 56.2 + (1.41 * inchesOver5Ft) : 53.1 + (1.36 * inchesOver5Ft);

            const avgIbwKg = (devineKg + robinsonKg + millerKg) / 3;

            return {
                primaryOutput: { label: 'Consensus Ideal Weight (Devine Baseline)', value: devineKg.toFixed(1), suffix: 'kg' },
                secondaryMetrics: [
                    { label: 'Imperial Equivalent', value: `${(devineKg * 2.20462).toFixed(1)} lbs` },
                    { label: 'Robinson Formula Target', value: `${robinsonKg.toFixed(1)} kg (${(robinsonKg * 2.20462).toFixed(1)} lbs)` },
                    { label: 'Miller Formula Target', value: `${millerKg.toFixed(1)} kg (${(millerKg * 2.20462).toFixed(1)} lbs)` },
                    { label: 'Tri-Formula Clinical Average', value: `${avgIbwKg.toFixed(1)} kg` }
                ]
            };
        }
    },

    // 6. Target Heart Rate & Training Zones Calculator
    {
        id: 'target-heart-rate-calculator',
        name: 'Target Heart Rate & Training Zones Calculator',
        category: 'health-fitness',
        group: '2A',
        bucket: 'Bucket B',
        tier: 2,
        phase: 1,
        monthlySearches: '201K',
        cpc: '$0.55',
        description: 'Calculates maximum heart rate (HRmax) and Karvonen aerobic endurance, tempo, and anaerobic lactate threshold training zones.',
        inputs: [
            { id: 'age', name: 'Age', type: 'number', defaultValue: 32, min: 14, max: 95, step: 1, suffix: 'yrs', tooltip: 'Age in years.' },
            { id: 'restingHeartRate', name: 'Resting Heart Rate (BPM)', type: 'number', defaultValue: 62, min: 35, max: 110, step: 1, suffix: 'BPM', tooltip: 'Morning resting pulse.' }
        ],
        naturalLanguageQueries: [
            'Target heart rate calculator',
            'Karvonen heart rate zones formula',
            'Zone 2 cardio heart rate for 30 year old'
        ],
        edgeCases: ['Resting heart rate higher than predicted max heart rate'],
        calculate: (inputs) => {
            const age = Number(inputs.age) || 32;
            const rhr = Number(inputs.restingHeartRate) || 62;

            // Tanaka Formula: HRmax = 208 - (0.7 * age)
            const maxHr = Math.round(208 - (0.7 * age));
            const hrr = Math.max(10, maxHr - rhr); // Heart Rate Reserve

            // Karvonen Target = RHR + (HRR * intensity)
            const z1Low = Math.round(rhr + (hrr * 0.50));
            const z2High = Math.round(rhr + (hrr * 0.70));
            const z3High = Math.round(rhr + (hrr * 0.80));
            const z4High = Math.round(rhr + (hrr * 0.90));

            return {
                primaryOutput: { label: 'Zone 2 Aerobic Base Target', value: `${z1Low} - ${z2High}`, suffix: 'BPM' },
                secondaryMetrics: [
                    { label: 'Estimated Maximum Heart Rate (HRmax)', value: `${maxHr} BPM` },
                    { label: 'Heart Rate Reserve (HRR)', value: `${hrr} BPM` },
                    { label: 'Zone 3 Tempo Threshold (70-80%)', value: `${z2High} - ${z3High} BPM` },
                    { label: 'Zone 4 Anaerobic Lactate (80-90%)', value: `${z3High} - ${z4High} BPM` }
                ]
            };
        }
    },

    // 7. Macronutrient Ratio Calculator
    {
        id: 'macro-calculator',
        name: 'Macronutrient Ratio Calculator',
        category: 'health-fitness',
        group: '2A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '450K',
        cpc: '$0.80',
        description: 'Breaks down daily caloric goals into grams of protein, carbohydrates, and dietary fats based on dietary preference.',
        inputs: [
            { id: 'dailyCalories', name: 'Target Daily Calories', type: 'number', defaultValue: 2400, min: 1000, max: 7000, step: 50, suffix: 'kcal', tooltip: 'Total calories planned.' },
            {
                id: 'dietPlan', name: 'Dietary Protocol Ratio', type: 'dropdown', defaultValue: 'balanced', options: [
                    { label: 'Balanced (40% Carb / 30% Protein / 30% Fat)', value: 'balanced' },
                    { label: 'High Protein / Bodybuilding (35% Carb / 40% Protein / 25% Fat)', value: 'high_protein' },
                    { label: 'Low Carb (20% Carb / 45% Protein / 35% Fat)', value: 'low_carb' },
                    { label: 'Ketogenic (5% Carb / 25% Protein / 70% Fat)', value: 'keto' }
                ], tooltip: 'Target macro split.'
            }
        ],
        naturalLanguageQueries: [
            'Macro split for 2000 calories',
            'Keto macro calculator grams',
            'High protein macro breakdown'
        ],
        edgeCases: ['Extremely low calorie diet allocations'],
        calculate: (inputs) => {
            const kcal = Number(inputs.dailyCalories) || 2400;
            const plan = inputs.dietPlan;

            let carbPct = 0.40;
            let protPct = 0.30;
            let fatPct = 0.30;

            if (plan === 'high_protein') { carbPct = 0.35; protPct = 0.40; fatPct = 0.25; }
            else if (plan === 'low_carb') { carbPct = 0.20; protPct = 0.45; fatPct = 0.35; }
            else if (plan === 'keto') { carbPct = 0.05; protPct = 0.25; fatPct = 0.70; }

            // 4 kcal per gram of protein & carb, 9 kcal per gram of fat
            const protGrams = Math.round((kcal * protPct) / 4);
            const carbGrams = Math.round((kcal * carbPct) / 4);
            const fatGrams = Math.round((kcal * fatPct) / 9);

            return {
                primaryOutput: { label: 'Daily Protein Target', value: `${protGrams} g`, suffix: `(${Math.round(protGrams * 4)} kcal)` },
                secondaryMetrics: [
                    { label: 'Carbohydrates Target', value: `${carbGrams} g (${Math.round(carbGrams * 4)} kcal)` },
                    { label: 'Dietary Fats Target', value: `${fatGrams} g (${Math.round(fatGrams * 9)} kcal)` },
                    { label: 'Caloric Ratio Profile', value: `${(carbPct * 100).toFixed(0)}% Carb / ${(protPct * 100).toFixed(0)}% Prot / ${(fatPct * 100).toFixed(0)}% Fat` }
                ]
            };
        }
    },

    // 8. Water Intake Calculator
    {
        id: 'water-intake-calculator',
        name: 'Daily Water Intake Calculator',
        category: 'health-fitness',
        group: '2A',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '110K',
        cpc: '$0.30',
        description: 'Computes optimal daily hydration targets in liters, fluid ounces, and glasses based on body mass, exercise duration, and climate.',
        inputs: [
            { id: 'weightKg', name: 'Body Weight (kg)', type: 'number', defaultValue: 75, min: 30, max: 200, step: 1, suffix: 'kg', tooltip: 'Body mass.' },
            { id: 'exerciseMinutes', name: 'Daily Exercise Duration (Minutes)', type: 'number', defaultValue: 45, min: 0, max: 240, step: 15, suffix: 'mins', tooltip: 'Workout time.' },
            {
                id: 'climate', name: 'Ambient Climate', type: 'dropdown', defaultValue: 'moderate', options: [
                    { label: 'Temperate / Moderate', value: 'moderate' },
                    { label: 'Hot / Arid or Humid (+0.5 L)', value: 'hot' }
                ], tooltip: 'Environmental temperature.'
            }
        ],
        naturalLanguageQueries: [
            'How much water should I drink for my weight?',
            'Daily hydration calculator in liters',
            'Water intake with exercise'
        ],
        edgeCases: ['Zero exercise duration'],
        calculate: (inputs) => {
            const w = Number(inputs.weightKg) || 75;
            const exercise = Number(inputs.exerciseMinutes) || 0;
            const isHot = inputs.climate === 'hot';

            // Base: ~35 mL per kg of body weight
            let liters = (w * 0.035);
            // Exercise sweat replenishment: ~350 mL per 30 minutes
            liters += (exercise / 30) * 0.35;
            if (isHot) liters += 0.5;

            const oz = liters * 33.814;
            const standardGlasses = liters / 0.25; // 250ml glasses

            return {
                primaryOutput: { label: 'Daily Hydration Target', value: liters.toFixed(2), suffix: 'Liters' },
                secondaryMetrics: [
                    { label: 'Fluid Ounces Equivalent', value: `${Math.round(oz)} fl oz` },
                    { label: 'Standard 250mL Water Glasses', value: `~${Math.round(standardGlasses)} Glasses` },
                    { label: 'Exercise Hydration Added', value: `+${((exercise / 30) * 0.35).toFixed(2)} L` }
                ]
            };
        }
    },

    // 9. Intermittent Fasting Schedule Calculator
    {
        id: 'intermittent-fasting-calculator',
        name: 'Intermittent Fasting Schedule Calculator',
        category: 'health-fitness',
        group: '2A',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '74K',
        cpc: '$0.40',
        description: 'Calculates eating and fasting time windows for protocols including 16:8, 18:6, 20:4 (Warrior), and OMAD.',
        inputs: [
            {
                id: 'protocol', name: 'Fasting Protocol', type: 'dropdown', defaultValue: 16, options: [
                    { label: '16:8 (16 hrs Fast / 8 hrs Eating - Standard Leangains)', value: 16 },
                    { label: '18:6 (18 hrs Fast / 6 hrs Eating)', value: 18 },
                    { label: '20:4 (20 hrs Fast / 4 hrs Eating - Warrior Diet)', value: 20 },
                    { label: '14:10 (Gentle Starter)', value: 14 }
                ], tooltip: 'Fasting:Eating ratio.'
            },
            { id: 'firstMealHour', name: 'First Meal Time (24h Clock)', type: 'number', defaultValue: 12, min: 0, max: 23, step: 1, suffix: ':00', tooltip: 'Hour of first meal (e.g. 12 = 12:00 PM).' }
        ],
        naturalLanguageQueries: [
            '16 8 intermittent fasting schedule calculator',
            'When should I stop eating on 18:6?',
            'Fasting window timer calculator'
        ],
        edgeCases: ['Eating window crossing midnight'],
        calculate: (inputs) => {
            const fastHours = Number(inputs.protocol) || 16;
            const startHour = Number(inputs.firstMealHour) || 12;

            const eatingHours = 24 - fastHours;
            const endHour = (startHour + eatingHours) % 24;

            const formatTime = (h: number) => {
                const period = h >= 12 ? 'PM' : 'AM';
                const displayH = h % 12 === 0 ? 12 : h % 12;
                return `${displayH}:00 ${period}`;
            };

            return {
                primaryOutput: { label: 'Daily Eating Window', value: `${formatTime(startHour)} - ${formatTime(endHour)}`, suffix: `(${eatingHours} Hours)` },
                secondaryMetrics: [
                    { label: 'Daily Fasting Window', value: `${formatTime(endHour)} - ${formatTime(startHour)} (${fastHours} Hours)` },
                    { label: 'Metabolic Fasting Duration', value: `${fastHours} Consecutive Hours` },
                    { label: 'Autophagy Activation Horizon', value: fastHours >= 16 ? 'Likely Triggered (16+ hrs)' : 'Minimal (Requires 16+ hrs)' }
                ]
            };
        }
    },

    // 10. One-Rep Max (1RM) Calculator
    {
        id: 'one-rep-max-calculator',
        name: 'One-Rep Max (1RM) Calculator',
        category: 'health-fitness',
        group: '2A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '301K',
        cpc: '$0.50',
        description: 'Predicts maximum single-rep strength using the Brzycki, Epley, and Lombardi lifting formulas from submaximal sets.',
        inputs: [
            { id: 'liftWeight', name: 'Weight Lifted', type: 'number', defaultValue: 100, min: 1, step: 2.5, suffix: 'kg/lbs', tooltip: 'Resistance moved.' },
            { id: 'repetitions', name: 'Repetitions Completed to Failure', type: 'number', defaultValue: 6, min: 1, max: 25, step: 1, suffix: 'reps', tooltip: 'Reps completed.' }
        ],
        naturalLanguageQueries: [
            'Calculate 1 rep max',
            'Epley vs Brzycki 1RM calculator',
            'Bench press max calculator from reps'
        ],
        edgeCases: ['Rep count = 1 (1RM equals weight lifted)', 'Rep count > 15 (decreased accuracy)'],
        calculate: (inputs) => {
            const w = Number(inputs.liftWeight) || 100;
            const r = Number(inputs.repetitions) || 6;

            if (r === 1) {
                return {
                    primaryOutput: { label: 'One-Rep Max (1RM)', value: w.toFixed(1) },
                    secondaryMetrics: [{ label: '90% 1RM (Heavy Triple)', value: (w * 0.9).toFixed(1) }]
                };
            }

            // Epley: w * (1 + r/30)
            const epley = w * (1 + (r / 30));
            // Brzycki: w * (36 / (37 - r))
            const brzycki = r < 37 ? w * (36 / (37 - r)) : epley;
            // Lombardi: w * r^0.10
            const lombardi = w * Math.pow(r, 0.10);

            const consensus = (epley + brzycki + lombardi) / 3;

            return {
                primaryOutput: { label: 'Predicted One-Rep Max (1RM)', value: Math.round(consensus).toString(), suffix: 'units' },
                secondaryMetrics: [
                    { label: 'Epley Formula Estimate', value: Math.round(epley).toString() },
                    { label: 'Brzycki Formula Estimate', value: Math.round(brzycki).toString() },
                    { label: '85% 1RM (5-Rep Training Weight)', value: Math.round(consensus * 0.85).toString() },
                    { label: '70% 1RM (Hypertrophy 10-Rep)', value: Math.round(consensus * 0.70).toString() }
                ]
            };
        }
    }
];