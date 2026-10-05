import { CalculatorDefinition } from '@/types/calculator';

export const healthFitnessCalculators: CalculatorDefinition[] = [
    // 1. BMI Calculator
    {
        id: 'bmi-calculator',
        name: 'BMI Calculator',
        category: 'health-fitness',
        group: 'Body Metrics',
        bucket: 'Bucket C1',
        tier: 1,
        phase: 1,
        monthlySearches: '7.5M',
        cpc: '$0.60',
        description: "A BMI Calculator estimates Body Mass Index using height and weight measurements. It helps assess whether an individual falls within underweight, normal, overweight, or obesity categories. The calculator is widely used as a screening tool for body-weight-related health risks.",
        inputs: [
            { id: 'gender', name: 'Biological Sex', type: 'dropdown', defaultValue: 'male', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }], tooltip: 'Biological sex.' },
            { id: 'age', name: 'Age', type: 'number', defaultValue: 28, min: 2, max: 120, step: 1, suffix: 'yrs', tooltip: 'Age in years.' },
            { id: 'heightCm', name: 'Height (cm)', type: 'number', defaultValue: 175, min: 50, max: 250, step: 0.5, suffix: 'cm', tooltip: 'Stature in centimeters.' },
            { id: 'weightKg', name: 'Weight (kg)', type: 'number', defaultValue: 72, min: 20, max: 350, step: 0.5, suffix: 'kg', tooltip: 'Current body mass.' }
        ],
        naturalLanguageQueries: ["What is my BMI if I am 5 foot 10 and weigh 180 pounds?", "Calculate BMI 75kg 1.78m", "Am I overweight at 200 lbs and 6 feet tall?"],
        edgeCases: ["Zero or negative height Extremely low or high weight values Athletic body compositions skewing results Pediatric BMI not applicable for adults"],
        calculate: (inputs) => {
            const heightM = (Number(inputs.heightCm) || 175) / 100;
            const weight = Number(inputs.weightKg) || 72;
            if (heightM <= 0) return { primaryOutput: { label: 'BMI', value: 'Invalid Height' }, secondaryMetrics: [] };

            const bmi = weight / (heightM * heightM);
            let classification = 'Normal weight';
            if (bmi < 18.5) classification = 'Underweight';
            else if (bmi < 25) classification = 'Normal weight';
            else if (bmi < 30) classification = 'Overweight';
            else if (bmi < 35) classification = 'Obesity Class I';
            else if (bmi < 40) classification = 'Obesity Class II';
            else classification = 'Obesity Class III (Severe)';

            const minHealthy = 18.5 * (heightM * heightM);
            const maxHealthy = 24.9 * (heightM * heightM);
            const prime = bmi / 25;

            return {
                primaryOutput: { label: 'Body Mass Index (BMI)', value: bmi.toFixed(1), suffix: 'kg/m²' },
                secondaryMetrics: [
                    { label: 'WHO Classification', value: classification },
                    { label: 'Healthy Weight Target Range', value: `${minHealthy.toFixed(1)} - ${maxHealthy.toFixed(1)} kg` },
                    { label: 'BMI Prime', value: prime.toFixed(2) },
                    { label: 'Ponderal Index', value: `${(weight / Math.pow(heightM, 3)).toFixed(2)} kg/m³` }
                ]
            };
        }
    },
    // 2. Body Fat Calculator (U.S. Navy Method)
    {
        id: 'body-fat-calculator',
        name: 'Body Fat Calculator',
        category: 'health-fitness',
        group: 'Body Metrics',
        bucket: 'Bucket C1',
        tier: 1,
        phase: 1,
        monthlySearches: '201K',
        cpc: '$1.03',
        description: "A Body Fat Calculator estimates body fat percentage using anthropometric measurements such as waist, neck, height, and weight. It helps assess body composition more accurately than BMI. The calculator commonly uses the U.",
        inputs: [
            { id: 'gender', name: 'Biological Sex', type: 'dropdown', defaultValue: 'male', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }], tooltip: 'Sex determines anthropometric formula.' },
            { id: 'heightCm', name: 'Height (cm)', type: 'number', defaultValue: 178, min: 100, max: 240, step: 0.5, suffix: 'cm', tooltip: 'Height in cm.' },
            { id: 'weightKg', name: 'Weight (kg)', type: 'number', defaultValue: 80, min: 30, max: 300, step: 0.5, suffix: 'kg', tooltip: 'Body weight.' },
            { id: 'neckCm', name: 'Neck Circumference (cm)', type: 'number', defaultValue: 38, min: 20, max: 80, step: 0.5, suffix: 'cm', tooltip: 'Measure below larynx.' },
            { id: 'waistCm', name: 'Waist Circumference (cm)', type: 'number', defaultValue: 86, min: 40, max: 200, step: 0.5, suffix: 'cm', tooltip: 'At navel for men, narrowest point for women.' },
            { id: 'hipCm', name: 'Hip Circumference (cm, Women Only)', type: 'number', defaultValue: 95, min: 50, max: 220, step: 0.5, suffix: 'cm', tooltip: 'Widest circumference around hips.' }
        ],
        naturalLanguageQueries: ["Calculate my body fat", "What is my body fat?", "Help me work out body fat"],
        edgeCases: ["Invalid circumference measurements Extremely muscular users Children and elderly populations Unit conversion precision issues"],
        calculate: (inputs) => {
            const isMale = inputs.gender === 'male';
            const h = Number(inputs.heightCm) || 178;
            const w = Number(inputs.weightKg) || 80;
            const neck = Number(inputs.neckCm) || 38;
            const waist = Number(inputs.waistCm) || 86;
            const hip = Number(inputs.hipCm) || 95;

            let bfPct = 15;
            if (isMale) {
                const diff = Math.max(1, waist - neck);
                bfPct = 495 / (1.0324 - 0.19077 * Math.log10(diff) + 0.15456 * Math.log10(h)) - 450;
            } else {
                const sum = Math.max(1, waist + hip - neck);
                bfPct = 495 / (1.29579 - 0.35004 * Math.log10(sum) + 0.22100 * Math.log10(h)) - 450;
            }
            bfPct = Math.max(2, Math.min(65, bfPct));

            const fatMassKg = w * (bfPct / 100);
            const leanMassKg = w - fatMassKg;

            let category = 'Fitness';
            if (isMale) {
                if (bfPct < 6) category = 'Essential Fat';
                else if (bfPct < 14) category = 'Athletes';
                else if (bfPct < 18) category = 'Fitness';
                else if (bfPct < 25) category = 'Average';
                else category = 'Obese';
            } else {
                if (bfPct < 14) category = 'Essential Fat';
                else if (bfPct < 21) category = 'Athletes';
                else if (bfPct < 25) category = 'Fitness';
                else if (bfPct < 32) category = 'Average';
                else category = 'Obese';
            }

            return {
                primaryOutput: { label: 'Body Fat Percentage', value: `${bfPct.toFixed(1)}%` },
                secondaryMetrics: [
                    { label: 'ACE Body Fat Category', value: category },
                    { label: 'Fat Mass', value: `${fatMassKg.toFixed(1)} kg` },
                    { label: 'Lean Body Mass (LBM)', value: `${leanMassKg.toFixed(1)} kg` }
                ]
            };
        }
    },
    // 3. Army Body Fat Calculator
    {
        id: 'army-body-fat-calculator',
        name: 'Army Body Fat Calculator',
        category: 'health-fitness',
        group: 'Body Metrics',
        bucket: 'Bucket A',
        tier: 2,
        phase: 2,
        monthlySearches: '22K',
        cpc: '$3.15',
        description: "An Army Body Fat Calculator determines compliance with military body composition standards. It uses circumference measurements and age-specific body fat limits. The calculator is commonly based on U.",
        inputs: [
            { id: 'gender', name: 'Gender', type: 'dropdown', defaultValue: 'male', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }], tooltip: 'US Army standard.' },
            { id: 'age', name: 'Age', type: 'number', defaultValue: 25, min: 17, max: 62, step: 1, suffix: 'yrs', tooltip: 'Age group determines max allowable body fat.' },
            { id: 'heightInches', name: 'Height (Inches)', type: 'number', defaultValue: 70, min: 40, max: 90, step: 0.5, suffix: 'in', tooltip: 'Stature in inches.' },
            { id: 'neckInches', name: 'Neck Circumference (Inches)', type: 'number', defaultValue: 15.5, min: 10, max: 30, step: 0.25, suffix: 'in', tooltip: 'Neck tape measure.' },
            { id: 'waistInches', name: 'Abdomen / Waist (Inches)', type: 'number', defaultValue: 34, min: 15, max: 70, step: 0.25, suffix: 'in', tooltip: 'Navel circumference.' },
            { id: 'hipInches', name: 'Hips (Inches, Female Only)', type: 'number', defaultValue: 38, min: 20, max: 80, step: 0.25, suffix: 'in', tooltip: 'Female hip measure.' }
        ],
        naturalLanguageQueries: ["Calculate my army body fat", "What is my army body fat?", "Help me work out army body fat"],
        edgeCases: ["Invalid military age ranges Incorrect tape measurements Measurement rounding differences"],
        calculate: (inputs) => {
            const isMale = inputs.gender === 'male';
            const age = Number(inputs.age) || 25;
            const h = Number(inputs.heightInches) || 70;
            const neck = Number(inputs.neckInches) || 15.5;
            const waist = Number(inputs.waistInches) || 34;
            const hip = Number(inputs.hipInches) || 38;

            let bf = 15;
            if (isMale) {
                bf = 86.010 * Math.log10(Math.max(1, waist - neck)) - 70.041 * Math.log10(h) + 36.76;
            } else {
                bf = 163.205 * Math.log10(Math.max(1, waist + hip - neck)) - 97.684 * Math.log10(h) - 78.387;
            }
            bf = Math.max(3, Math.min(60, bf));

            // Army Standard Maximum Allowable Body Fat (AR 600-9)
            let maxAllowable = 20;
            if (isMale) {
                if (age <= 20) maxAllowable = 20;
                else if (age <= 27) maxAllowable = 22;
                else if (age <= 39) maxAllowable = 24;
                else maxAllowable = 26;
            } else {
                if (age <= 20) maxAllowable = 30;
                else if (age <= 27) maxAllowable = 32;
                else if (age <= 39) maxAllowable = 34;
                else maxAllowable = 36;
            }
            const pass = bf <= maxAllowable;

            return {
                primaryOutput: { label: 'Army Body Fat', value: `${bf.toFixed(1)}%` },
                secondaryMetrics: [
                    { label: 'AR 600-9 Compliance Status', value: pass ? 'Meets Army Standard (PASS)' : 'Exceeds Standard (FAIL)' },
                    { label: 'Max Allowable for Age ' + age, value: `${maxAllowable}%` },
                    { label: 'Margin vs Army Standard', value: `${(maxAllowable - bf).toFixed(1)}%` }
                ]
            };
        }
    },
    // 4. Lean Body Mass Calculator
    {
        id: 'lean-body-mass-calculator',
        name: 'Lean Body Mass Calculator',
        category: 'health-fitness',
        group: 'Body Metrics',
        bucket: 'Bucket C1',
        tier: 3,
        phase: 3,
        monthlySearches: '18K',
        cpc: '$1.27',
        description: "A Lean Body Mass Calculator estimates the weight of all non-fat body components including muscle, organs, bones, and water. It helps users understand body composition. The calculator is commonly used in fitness and nutrition planning.",
        inputs: [
            { id: 'gender', name: 'Biological Sex', type: 'dropdown', defaultValue: 'male', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }], tooltip: 'Sex.' },
            { id: 'weightKg', name: 'Body Weight (kg)', type: 'number', defaultValue: 78, min: 30, max: 300, step: 0.5, suffix: 'kg', tooltip: 'Total body mass.' },
            { id: 'heightCm', name: 'Height (cm)', type: 'number', defaultValue: 178, min: 100, max: 240, step: 0.5, suffix: 'cm', tooltip: 'Height in cm.' }
        ],
        naturalLanguageQueries: ["Calculate my lean body mass", "What is my lean body mass?", "Help me work out lean body mass"],
        edgeCases: ["Body fat over 100% Negative weights Formula limitations for athletes"],
        calculate: (inputs) => {
            const isMale = inputs.gender === 'male';
            const w = Number(inputs.weightKg) || 78;
            const h = Number(inputs.heightCm) || 178;

            // Boer Formula
            const lbmBoer = isMale ? (0.407 * w) + (0.267 * h) - 19.2 : (0.252 * w) + (0.473 * h) - 48.3;
            // James Formula
            const lbmJames = isMale ? (1.1 * w) - 128 * Math.pow(w / h, 2) : (1.07 * w) - 148 * Math.pow(w / h, 2);
            // Hume Formula
            const lbmHume = isMale ? (0.32810 * w) + (0.33929 * h) - 29.5336 : (0.29569 * w) + (0.41813 * h) - 43.2933;

            const fatMassBoer = Math.max(0, w - lbmBoer);
            const bfBoer = (fatMassBoer / w) * 100;

            return {
                primaryOutput: { label: 'Lean Body Mass (Boer Formula)', value: `${lbmBoer.toFixed(1)} kg` },
                secondaryMetrics: [
                    { label: 'LBM (James Formula)', value: `${lbmJames.toFixed(1)} kg` },
                    { label: 'LBM (Hume Formula)', value: `${lbmHume.toFixed(1)} kg` },
                    { label: 'Estimated Body Fat Percentage', value: `${bfBoer.toFixed(1)}%` },
                    { label: 'Fat Mass', value: `${fatMassBoer.toFixed(1)} kg` }
                ]
            };
        }
    },
    // 5. Ideal Weight Calculator
    {
        id: 'ideal-weight-calculator',
        name: 'Ideal Weight Calculator',
        category: 'health-fitness',
        group: 'Body Metrics',
        bucket: 'Bucket C1',
        tier: 2,
        phase: 2,
        monthlySearches: '60K',
        cpc: '$1.40',
        description: "An Ideal Weight Calculator estimates healthy body weight ranges based on height, gender, and medical formulas. It helps users set weight management goals. The calculator commonly uses Devine, Robinson, Miller, or Hamwi formulas.",
        inputs: [
            { id: 'gender', name: 'Biological Sex', type: 'dropdown', defaultValue: 'male', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }], tooltip: 'Biological sex.' },
            { id: 'heightCm', name: 'Height (cm)', type: 'number', defaultValue: 178, min: 140, max: 230, step: 0.5, suffix: 'cm', tooltip: 'Stature.' }
        ],
        naturalLanguageQueries: ["Calculate my ideal weight", "What is my ideal weight?", "Help me work out ideal weight"],
        edgeCases: ["Heights below formula minimums Children outside adult standards Athletic body composition limitations"],
        calculate: (inputs) => {
            const isMale = inputs.gender === 'male';
            const h = Number(inputs.heightCm) || 178;
            const hInches = h / 2.54;
            const over5Feet = Math.max(0, hInches - 60);

            // Devine Formula
            const devine = isMale ? 50.0 + (2.3 * over5Feet) : 45.5 + (2.3 * over5Feet);
            // Robinson Formula
            const robinson = isMale ? 52.0 + (1.9 * over5Feet) : 49.0 + (1.7 * over5Feet);
            // Miller Formula
            const miller = isMale ? 56.2 + (1.41 * over5Feet) : 53.1 + (1.36 * over5Feet);
            // Hamwi Formula
            const hamwi = isMale ? 48.0 + (2.7 * over5Feet) : 45.5 + (2.2 * over5Feet);

            const hM = h / 100;
            const whoMin = 18.5 * (hM * hM);
            const whoMax = 24.9 * (hM * hM);

            return {
                primaryOutput: { label: 'Ideal Weight (Devine Formula)', value: `${devine.toFixed(1)} kg`, suffix: `(${(devine * 2.20462).toFixed(1)} lbs)` },
                secondaryMetrics: [
                    { label: 'Robinson Formula', value: `${robinson.toFixed(1)} kg` },
                    { label: 'Miller Formula', value: `${miller.toFixed(1)} kg` },
                    { label: 'Hamwi Formula', value: `${hamwi.toFixed(1)} kg` },
                    { label: 'WHO Healthy Weight Range', value: `${whoMin.toFixed(1)} - ${whoMax.toFixed(1)} kg` }
                ]
            };
        }
    },
    // 6. Healthy Weight Calculator
    {
        id: 'healthy-weight-calculator',
        name: 'Healthy Weight Calculator',
        category: 'health-fitness',
        group: 'Body Metrics',
        bucket: 'Bucket C1',
        tier: 3,
        phase: 3,
        monthlySearches: '12K',
        cpc: '$1.62',
        description: "A Healthy Weight Calculator estimates medically recommended weight ranges using BMI guidelines. It helps users determine target weight zones. The calculator supports metric and imperial units.",
        inputs: [
            { id: 'heightCm', name: 'Height (cm)', type: 'number', defaultValue: 175, min: 100, max: 240, step: 0.5, suffix: 'cm', tooltip: 'Stature.' }
        ],
        naturalLanguageQueries: ["Calculate my healthy weight", "What is my healthy weight?", "Help me work out healthy weight"],
        edgeCases: ["Very short or tall individuals Pediatric populations Bodybuilder body composition distortion"],
        calculate: (inputs) => {
            const h = (Number(inputs.heightCm) || 175) / 100;
            const minKg = 18.5 * (h * h);
            const maxKg = 24.9 * (h * h);
            const midKg = (minKg + maxKg) / 2;

            return {
                primaryOutput: { label: 'Healthy Weight Range (WHO)', value: `${minKg.toFixed(1)} - ${maxKg.toFixed(1)} kg` },
                secondaryMetrics: [
                    { label: 'Healthy Range in Pounds', value: `${(minKg * 2.20462).toFixed(1)} - ${(maxKg * 2.20462).toFixed(1)} lbs` },
                    { label: 'Optimal Midpoint Weight', value: `${midKg.toFixed(1)} kg` }
                ]
            };
        }
    },
    // 7. Overweight Calculator
    {
        id: 'overweight-calculator',
        name: 'Overweight Calculator',
        category: 'health-fitness',
        group: 'Body Metrics',
        bucket: 'Bucket C1',
        tier: 3,
        phase: 3,
        monthlySearches: '5K',
        cpc: '$0.53',
        description: "An Overweight Calculator estimates how much weight exceeds recommended healthy ranges. It helps users quantify overweight or obesity levels. The calculator generally uses BMI thresholds.",
        inputs: [
            { id: 'heightCm', name: 'Height (cm)', type: 'number', defaultValue: 175, min: 100, max: 240, step: 0.5, suffix: 'cm', tooltip: 'Height.' },
            { id: 'currentWeightKg', name: 'Current Weight (kg)', type: 'number', defaultValue: 88, min: 30, max: 300, step: 0.5, suffix: 'kg', tooltip: 'Weight.' }
        ],
        naturalLanguageQueries: ["Calculate my overweight", "What is my overweight?", "Help me work out overweight"],
        edgeCases: ["Underweight individuals Negative excess weight Muscular body types"],
        calculate: (inputs) => {
            const h = (Number(inputs.heightCm) || 175) / 100;
            const w = Number(inputs.currentWeightKg) || 88;

            const maxNormal = 24.9 * (h * h);
            const excessKg = Math.max(0, w - maxNormal);
            const bmi = w / (h * h);

            return {
                primaryOutput: { label: 'Excess Weight Above Normal BMI', value: excessKg > 0 ? `${excessKg.toFixed(1)} kg (${(excessKg * 2.20462).toFixed(1)} lbs)` : 'None (Within Normal Range)' },
                secondaryMetrics: [
                    { label: 'Current BMI', value: `${bmi.toFixed(1)} kg/m²` },
                    { label: 'Upper Normal Weight Threshold (BMI 24.9)', value: `${maxNormal.toFixed(1)} kg` }
                ]
            };
        }
    },
    // 8. Anorexic BMI Calculator
    {
        id: 'anorexic-bmi-calculator',
        name: 'Anorexic BMI Calculator',
        category: 'health-fitness',
        group: 'Body Metrics',
        bucket: 'Bucket C1',
        tier: 1,
        phase: 5,
        monthlySearches: '480',
        cpc: 'N/A',
        description: "An Anorexic BMI Calculator estimates whether BMI falls below medically recognized underweight thresholds associated with anorexia risk. It is intended for educational and screening purposes only. The calculator should include clear medical disclaimers and encourage professional consultation.",
        inputs: [
            { id: 'heightCm', name: 'Height (cm)', type: 'number', defaultValue: 165, min: 100, max: 240, step: 0.5, suffix: 'cm', tooltip: 'Height.' },
            { id: 'weightKg', name: 'Weight (kg)', type: 'number', defaultValue: 42, min: 20, max: 150, step: 0.5, suffix: 'kg', tooltip: 'Weight.' }
        ],
        naturalLanguageQueries: ["What is my BMI if I am 5 foot 10 and weigh 180 pounds?", "Calculate BMI 75kg 1.78m", "Am I overweight at 200 lbs and 6 feet tall?"],
        edgeCases: ["Eating disorder sensitivity Pediatric users Unrealistic height/weight values"],
        calculate: (inputs) => {
            const h = (Number(inputs.heightCm) || 165) / 100;
            const w = Number(inputs.weightKg) || 42;
            const bmi = w / (h * h);

            let severity = 'Normal';
            if (bmi < 15.0) severity = 'Very Severely Underweight (Critical Risk)';
            else if (bmi < 16.0) severity = 'Severely Underweight (Severe Thinness)';
            else if (bmi < 17.5) severity = 'Underweight (DSM-5 Anorexia Diagnostic Threshold)';
            else if (bmi < 18.5) severity = 'Mild Thinness';

            return {
                primaryOutput: { label: 'BMI Severity Classification', value: severity },
                secondaryMetrics: [
                    { label: 'Calculated BMI', value: `${bmi.toFixed(1)} kg/m²` },
                    { label: 'Weight for Normal BMI (18.5)', value: `${(18.5 * h * h).toFixed(1)} kg` }
                ]
            };
        }
    },
    // 9. Body Type Calculator
    {
        id: 'body-type-calculator',
        name: 'Body Type Calculator',
        category: 'health-fitness',
        group: 'Body Metrics',
        bucket: 'Bucket B',
        tier: 1,
        phase: 2,
        monthlySearches: '246K',
        cpc: '$1.65',
        description: "A Body Type Calculator estimates somatotype classification such as ectomorph, mesomorph, or endomorph. It helps users understand body composition tendencies. The calculator uses body measurements and composition indicators.",
        inputs: [
            { id: 'bustBustCm', name: 'Bust / Chest Circumference (cm)', type: 'number', defaultValue: 92, min: 50, max: 200, step: 0.5, suffix: 'cm', tooltip: 'Fullest chest point.' },
            { id: 'waistCm', name: 'Waist Circumference (cm)', type: 'number', defaultValue: 70, min: 40, max: 180, step: 0.5, suffix: 'cm', tooltip: 'Narrowest waist point.' },
            { id: 'hipCm', name: 'Hip Circumference (cm)', type: 'number', defaultValue: 96, min: 50, max: 200, step: 0.5, suffix: 'cm', tooltip: 'Widest hip point.' }
        ],
        naturalLanguageQueries: ["Calculate my body type", "What is my body type?", "Help me work out body type"],
        edgeCases: ["Mixed body types Athletic physiques Incomplete measurements"],
        calculate: (inputs) => {
            const bust = Number(inputs.bustBustCm) || 92;
            const waist = Number(inputs.waistCm) || 70;
            const hip = Number(inputs.hipCm) || 96;

            const whr = waist / hip;
            let shape = 'Hourglass';
            if (bust - hip > 5 && waist < bust * 0.75) shape = 'Inverted Triangle';
            else if (hip - bust > 5 && waist < hip * 0.75) shape = 'Pear / Triangle';
            else if (Math.abs(bust - hip) <= 5 && waist < bust * 0.75) shape = 'Hourglass';
            else if (waist >= bust * 0.80 && waist >= hip * 0.80) shape = 'Apple / Round';
            else shape = 'Rectangle / Athletic';

            return {
                primaryOutput: { label: 'Body Shape Category', value: shape },
                secondaryMetrics: [
                    { label: 'Waist-to-Hip Ratio (WHR)', value: whr.toFixed(2) },
                    { label: 'Bust-to-Hip Difference', value: `${(bust - hip).toFixed(1)} cm` }
                ]
            };
        }
    },
    // 10. Body Surface Area Calculator
    {
        id: 'body-surface-area-calculator',
        name: 'Body Surface Area Calculator',
        category: 'health-fitness',
        group: 'Body Metrics',
        bucket: 'Bucket C1',
        tier: 2,
        phase: 3,
        monthlySearches: '74K',
        cpc: '$0.28',
        description: "A Body Surface Area Calculator estimates total external body area. It is commonly used in medical dosing, burn assessment, and physiology calculations. The Mosteller formula is most commonly used clinically.",
        inputs: [
            { id: 'heightCm', name: 'Height (cm)', type: 'number', defaultValue: 175, min: 50, max: 250, step: 0.5, suffix: 'cm', tooltip: 'Height in cm.' },
            { id: 'weightKg', name: 'Weight (kg)', type: 'number', defaultValue: 72, min: 5, max: 300, step: 0.5, suffix: 'kg', tooltip: 'Weight in kg.' }
        ],
        naturalLanguageQueries: ["Calculate my body surface area", "What is my body surface area?", "Help me work out body surface area"],
        edgeCases: ["Extremely small pediatric patients Obesity-related inaccuracies Unit conversion precision"],
        calculate: (inputs) => {
            const h = Number(inputs.heightCm) || 175;
            const w = Number(inputs.weightKg) || 72;

            // Mosteller formula: sqrt((h * w) / 3600)
            const bsaMosteller = Math.sqrt((h * w) / 3600);
            // DuBois formula: 0.007184 * h^0.725 * w^0.425
            const bsaDuBois = 0.007184 * Math.pow(h, 0.725) * Math.pow(w, 0.425);
            // Haycock formula: 0.024265 * h^0.3964 * w^0.5378
            const bsaHaycock = 0.024265 * Math.pow(h, 0.3964) * Math.pow(w, 0.5378);

            return {
                primaryOutput: { label: 'Body Surface Area (Mosteller)', value: `${bsaMosteller.toFixed(2)} m²` },
                secondaryMetrics: [
                    { label: 'DuBois Formula BSA', value: `${bsaDuBois.toFixed(2)} m²` },
                    { label: 'Haycock Formula BSA', value: `${bsaHaycock.toFixed(2)} m²` }
                ]
            };
        }
    },
    // 11. Weight Watcher Points Calculator
    {
        id: 'weight-watcher-points-calculator',
        name: 'Weight Watcher Points Calculator',
        category: 'health-fitness',
        group: 'Body Metrics',
        bucket: 'Bucket A',
        tier: 1,
        phase: 4,
        monthlySearches: '1K',
        cpc: '$7.43  ★ HIGH CPC',
        description: "A Weight Watcher Points Calculator estimates food point values used in weight management systems. It helps users track dietary intake. The calculator estimates nutritional point costs based on macronutrients.",
        inputs: [
            { id: 'calories', name: 'Calories (kcal)', type: 'number', defaultValue: 250, min: 0, step: 10, suffix: 'kcal', tooltip: 'Serving calories.' },
            { id: 'satFatGrams', name: 'Saturated Fat (g)', type: 'number', defaultValue: 3.5, min: 0, step: 0.5, suffix: 'g', tooltip: 'Saturated fat grams.' },
            { id: 'sugarGrams', name: 'Sugar (g)', type: 'number', defaultValue: 12, min: 0, step: 1, suffix: 'g', tooltip: 'Total sugars.' },
            { id: 'proteinGrams', name: 'Protein (g)', type: 'number', defaultValue: 8, min: 0, step: 1, suffix: 'g', tooltip: 'Protein grams.' }
        ],
        naturalLanguageQueries: ["Calculate my weight watcher points", "What is my weight watcher points?", "Help me work out weight watcher points"],
        edgeCases: ["Proprietary formula limitations Missing nutrition fields Negative nutrition values"],
        calculate: (inputs) => {
            const cal = Number(inputs.calories) || 250;
            const satFat = Number(inputs.satFatGrams) || 3.5;
            const sugar = Number(inputs.sugarGrams) || 12;
            const protein = Number(inputs.proteinGrams) || 8;

            // SmartPoints approximation formula: (cal * 0.0305) + (satFat * 0.275) + (sugar * 0.12) - (protein * 0.098)
            const pts = Math.max(0, Math.round((cal * 0.0305) + (satFat * 0.275) + (sugar * 0.12) - (protein * 0.098)));

            return {
                primaryOutput: { label: 'SmartPoints Value', value: `${pts} pts` },
                secondaryMetrics: [
                    { label: 'Nutritional Density Rating', value: pts <= 3 ? 'Low Point / Zero-Point Friendly' : pts <= 8 ? 'Moderate Points' : 'High Points Treat' }
                ]
            };
        }
    },
    // 12. Waist to Hip Ratio Calculator
    {
        id: 'waist-to-hip-ratio-calculator',
        name: 'Waist to Hip Ratio Calculator',
        category: 'health-fitness',
        group: 'Body Metrics',
        bucket: 'Bucket C1',
        tier: 2,
        phase: 2,
        monthlySearches: '22K',
        cpc: '$0.89',
        description: "A Waist to Hip Ratio Calculator estimates fat distribution and associated cardiovascular risk. It helps assess abdominal obesity. The calculator is commonly used in metabolic health screening.",
        inputs: [
            { id: 'gender', name: 'Biological Sex', type: 'dropdown', defaultValue: 'male', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }], tooltip: 'Sex.' },
            { id: 'waistCircumference', name: 'Waist Circumference (cm)', type: 'number', defaultValue: 84, min: 30, max: 200, step: 0.5, suffix: 'cm', tooltip: 'Waist at navel.' },
            { id: 'hipCircumference', name: 'Hip Circumference (cm)', type: 'number', defaultValue: 98, min: 30, max: 220, step: 0.5, suffix: 'cm', tooltip: 'Widest hips.' }
        ],
        naturalLanguageQueries: ["Calculate my waist to hip ratio", "What is my waist to hip ratio?", "Help me work out waist to hip ratio"],
        edgeCases: ["Zero hip circumference Incorrect tape measurements Pregnancy-related body changes"],
        calculate: (inputs) => {
            const isMale = inputs.gender === 'male';
            const waist = Number(inputs.waistCircumference) || 84;
            const hip = Math.max(1, Number(inputs.hipCircumference) || 98);

            const whr = waist / hip;
            let risk = 'Low Health Risk';
            if (isMale) {
                if (whr > 1.0) risk = 'High Cardiovascular Risk';
                else if (whr > 0.90) risk = 'Moderate Health Risk';
            } else {
                if (whr > 0.85) risk = 'High Cardiovascular Risk';
                else if (whr > 0.80) risk = 'Moderate Health Risk';
            }

            return {
                primaryOutput: { label: 'Waist-to-Hip Ratio (WHR)', value: whr.toFixed(2) },
                secondaryMetrics: [
                    { label: 'WHO Cardiovascular Risk Level', value: risk },
                    { label: 'WHO Healthy Threshold', value: isMale ? '< 0.90 (Male)' : '< 0.85 (Female)' }
                ]
            };
        }
    },
    // 13. Waist to Height Ratio Calculator
    {
        id: 'waist-to-height-ratio-calculator',
        name: 'Waist to Height Ratio Calculator',
        category: 'health-fitness',
        group: 'Body Metrics',
        bucket: 'Bucket C1',
        tier: 3,
        phase: 3,
        monthlySearches: '7K',
        cpc: '$4.10',
        description: "A Waist to Height Ratio Calculator estimates health risk associated with abdominal fat relative to height. It is considered a strong predictor of metabolic disease. The calculator provides simple obesity risk screening.",
        inputs: [
            { id: 'waistCm', name: 'Waist Circumference (cm)', type: 'number', defaultValue: 82, min: 40, max: 200, step: 0.5, suffix: 'cm', tooltip: 'Waist circumference.' },
            { id: 'heightCm', name: 'Height (cm)', type: 'number', defaultValue: 175, min: 100, max: 240, step: 0.5, suffix: 'cm', tooltip: 'Height in cm.' }
        ],
        naturalLanguageQueries: ["Calculate my waist to height ratio", "What is my waist to height ratio?", "Help me work out waist to height ratio"],
        edgeCases: ["Pediatric interpretation differences Unit inconsistencies Invalid waist measurements"],
        calculate: (inputs) => {
            const waist = Number(inputs.waistCm) || 82;
            const h = Math.max(1, Number(inputs.heightCm) || 175);

            const whtr = waist / h;
            let status = 'Healthy (< 0.50)';
            if (whtr < 0.40) status = 'Extremely Slim';
            else if (whtr <= 0.49) status = 'Healthy Weight (Keep Waist < Half Height)';
            else if (whtr <= 0.59) status = 'Increased Central Adiposity Risk';
            else status = 'High Cardiometabolic Risk';

            return {
                primaryOutput: { label: 'Waist-to-Height Ratio (WHtR)', value: whtr.toFixed(2) },
                secondaryMetrics: [
                    { label: 'Health Assessment', value: status },
                    { label: 'Max Recommended Waist (50% Height)', value: `${(h * 0.5).toFixed(1)} cm` }
                ]
            };
        }
    },
    // 14. Visceral Fat Calculator
    {
        id: 'visceral-fat-calculator',
        name: 'Visceral Fat Calculator',
        category: 'health-fitness',
        group: 'Body Metrics',
        bucket: 'Bucket C1',
        tier: 3,
        phase: 3,
        monthlySearches: '7K',
        cpc: '$1.91',
        description: "A Visceral Fat Calculator estimates abdominal visceral fat risk using body measurements and composition indicators. It helps assess metabolic and cardiovascular health risks. The calculator provides estimation only and cannot replace medical imaging.",
        inputs: [
            { id: 'gender', name: 'Gender', type: 'dropdown', defaultValue: 'male', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }], tooltip: 'Sex.' },
            { id: 'age', name: 'Age', type: 'number', defaultValue: 35, min: 18, max: 90, step: 1, suffix: 'yrs', tooltip: 'Age.' },
            { id: 'bmi', name: 'Body Mass Index (BMI)', type: 'number', defaultValue: 24.5, min: 14, max: 60, step: 0.1, tooltip: 'BMI value.' },
            { id: 'waistCm', name: 'Waist Circumference (cm)', type: 'number', defaultValue: 86, min: 50, max: 180, step: 0.5, suffix: 'cm', tooltip: 'Waist.' }
        ],
        naturalLanguageQueries: ["Calculate my visceral fat", "What is my visceral fat?", "Help me work out visceral fat"],
        edgeCases: ["Severe obesity affecting estimates Athlete body composition Lack of imaging confirmation"],
        calculate: (inputs) => {
            const isMale = inputs.gender === 'male';
            const age = Number(inputs.age) || 35;
            const bmi = Number(inputs.bmi) || 24.5;
            const waist = Number(inputs.waistCm) || 86;

            // Estimated Visceral Fat Rating (1 to 59 scale)
            let rating = Math.round((bmi * 0.3) + (waist * 0.08) + (age * 0.05) - (isMale ? 4 : 7));
            rating = Math.max(1, Math.min(30, rating));

            let level = 'Healthy Level (1-9)';
            if (rating >= 15) level = 'Very High Risk (15+)';
            else if (rating >= 10) level = 'Excessive Visceral Fat (10-14)';

            return {
                primaryOutput: { label: 'Estimated Visceral Fat Rating', value: `${rating} / 59` },
                secondaryMetrics: [
                    { label: 'Visceral Fat Risk Classification', value: level },
                    { label: 'Target Optimal Rating', value: '1 - 9 (Low Risk)' }
                ]
            };
        }
    },
    // 15. Skeletal Muscle Mass Calculator
    {
        id: 'skeletal-muscle-mass-calculator',
        name: 'Skeletal Muscle Mass Calculator',
        category: 'health-fitness',
        group: 'Body Metrics',
        bucket: 'Bucket C1',
        tier: 1,
        phase: 5,
        monthlySearches: '880',
        cpc: '$1.05',
        description: "A Skeletal Muscle Mass Calculator estimates muscle mass involved in movement and posture. It helps users track muscular development and body composition. The calculator is commonly used in fitness and clinical assessments.",
        inputs: [
            { id: 'gender', name: 'Biological Sex', type: 'dropdown', defaultValue: 'male', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }], tooltip: 'Sex.' },
            { id: 'heightCm', name: 'Height (cm)', type: 'number', defaultValue: 178, min: 100, max: 240, step: 0.5, suffix: 'cm', tooltip: 'Height.' },
            { id: 'weightKg', name: 'Weight (kg)', type: 'number', defaultValue: 78, min: 30, max: 300, step: 0.5, suffix: 'kg', tooltip: 'Weight.' },
            { id: 'age', name: 'Age', type: 'number', defaultValue: 30, min: 18, max: 90, step: 1, suffix: 'yrs', tooltip: 'Age.' }
        ],
        naturalLanguageQueries: ["Calculate my skeletal muscle mass", "What is my skeletal muscle mass?", "Help me work out skeletal muscle mass"],
        edgeCases: ["Highly trained athletes Elderly populations Missing body fat data"],
        calculate: (inputs) => {
            const isMale = inputs.gender === 'male';
            const h = Number(inputs.heightCm) || 178;
            const w = Number(inputs.weightKg) || 78;
            const age = Number(inputs.age) || 30;

            // Janssen Skeletal Muscle Mass formula
            const smm = isMale ? (0.401 * w) + (0.07 * h) - (0.04 * age) : (0.307 * w) + (0.06 * h) - (0.03 * age);
            const smmPct = (smm / w) * 100;
            const smi = smm / Math.pow(h / 100, 2);

            return {
                primaryOutput: { label: 'Skeletal Muscle Mass (SMM)', value: `${smm.toFixed(1)} kg` },
                secondaryMetrics: [
                    { label: 'Muscle Mass Percentage', value: `${smmPct.toFixed(1)}% of Body Weight` },
                    { label: 'Skeletal Muscle Index (SMI)', value: `${smi.toFixed(2)} kg/m²` }
                ]
            };
        }
    },
    // 16. Ideal Body Weight Calculator
    {
        id: 'ideal-body-weight-calculator',
        name: 'Ideal Body Weight Calculator',
        category: 'health-fitness',
        group: 'Body Metrics',
        bucket: 'Bucket C1',
        tier: 2,
        phase: 2,
        monthlySearches: '40K',
        cpc: '$0.85',
        description: "An Ideal Body Weight Calculator estimates medically recommended body weight based on height and gender. It is commonly used in healthcare dosing and nutrition planning. The calculator supports multiple medical formulas.",
        inputs: [
            { id: 'gender', name: 'Biological Sex', type: 'dropdown', defaultValue: 'male', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }], tooltip: 'Biological sex.' },
            { id: 'heightCm', name: 'Height (cm)', type: 'number', defaultValue: 175, min: 140, max: 230, step: 0.5, suffix: 'cm', tooltip: 'Height.' }
        ],
        naturalLanguageQueries: ["Calculate my ideal body weight", "What is my ideal body weight?", "Help me work out ideal body weight"],
        edgeCases: ["Formula variation differences Non-adult populations Extreme heights"],
        calculate: (inputs) => {
            const isMale = inputs.gender === 'male';
            const hInches = (Number(inputs.heightCm) || 175) / 2.54;
            const over5 = Math.max(0, hInches - 60);

            const ibw = isMale ? 50.0 + (2.3 * over5) : 45.5 + (2.3 * over5);

            return {
                primaryOutput: { label: 'Ideal Body Weight (Devine)', value: `${ibw.toFixed(1)} kg`, suffix: `(${(ibw * 2.20462).toFixed(1)} lbs)` },
                secondaryMetrics: [
                    { label: 'Height in Feet & Inches', value: `${Math.floor(hInches / 12)}\'${Math.round(hInches % 12)}\"` }
                ]
            };
        }
    },
    // 17. BMI for Children Calculator
    {
        id: 'bmi-for-children-calculator',
        name: 'BMI for Children Calculator',
        category: 'health-fitness',
        group: 'Body Metrics',
        bucket: 'Bucket C1',
        tier: 1,
        phase: 3,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "A BMI for Children Calculator estimates BMI percentile adjusted for age and sex. It helps evaluate growth and healthy development in children and teenagers. The calculator uses pediatric growth chart standards.",
        inputs: [
            { id: 'childAgeYears', name: 'Child Age (Years)', type: 'number', defaultValue: 10, min: 2, max: 19, step: 0.5, suffix: 'yrs', tooltip: 'Age 2 to 19.' },
            { id: 'gender', name: 'Gender', type: 'dropdown', defaultValue: 'boy', options: [{ label: 'Boy', value: 'boy' }, { label: 'Girl', value: 'girl' }], tooltip: 'Sex determines percentile curves.' },
            { id: 'heightCm', name: 'Height (cm)', type: 'number', defaultValue: 138, min: 60, max: 210, step: 0.5, suffix: 'cm', tooltip: 'Height.' },
            { id: 'weightKg', name: 'Weight (kg)', type: 'number', defaultValue: 32, min: 8, max: 150, step: 0.5, suffix: 'kg', tooltip: 'Weight.' }
        ],
        naturalLanguageQueries: ["What is my BMI if I am 5 foot 10 and weigh 180 pounds?", "Calculate BMI 75kg 1.78m", "Am I overweight at 200 lbs and 6 feet tall?"],
        edgeCases: ["Ages outside pediatric range Premature growth variations Missing growth chart datasets"],
        calculate: (inputs) => {
            const h = (Number(inputs.heightCm) || 138) / 100;
            const w = Number(inputs.weightKg) || 32;
            const age = Number(inputs.childAgeYears) || 10;

            const bmi = w / (h * h);
            // CDC Percentile estimation
            const medianBmi = 14.5 + (age * 0.45);
            const z = (bmi - medianBmi) / 2.2;
            let percentile = Math.min(99, Math.max(1, Math.round(50 + z * 34)));

            let category = 'Healthy Weight (5th-85th percentile)';
            if (percentile < 5) category = 'Underweight (< 5th percentile)';
            else if (percentile >= 95) category = 'Obese (>= 95th percentile)';
            else if (percentile >= 85) category = 'Overweight (85th-95th percentile)';

            return {
                primaryOutput: { label: 'CDC Growth Percentile', value: `${percentile}th Percentile` },
                secondaryMetrics: [
                    { label: 'CDC Weight Category', value: category },
                    { label: 'Child BMI', value: `${bmi.toFixed(1)} kg/m²` }
                ]
            };
        }
    },
    // 18. Height Calculator
    {
        id: 'height-calculator',
        name: 'Height Calculator',
        category: 'health-fitness',
        group: 'Body Metrics',
        bucket: 'Bucket C1',
        tier: 1,
        phase: 1,
        monthlySearches: '246K',
        cpc: '$0.89',
        description: "A Height Calculator converts and compares height measurements across metric and imperial systems. It helps users translate feet/inches into centimeters or meters. The calculator may also estimate height percentiles or growth predictions optionally.",
        inputs: [
            { id: 'childGender', name: 'Child Sex', type: 'dropdown', defaultValue: 'boy', options: [{ label: 'Boy', value: 'boy' }, { label: 'Girl', value: 'girl' }], tooltip: 'Child biological sex.' },
            { id: 'motherHeightCm', name: 'Mother\'s Height (cm)', type: 'number', defaultValue: 165, min: 120, max: 220, step: 0.5, suffix: 'cm', tooltip: 'Mother stature.' },
            { id: 'fatherHeightCm', name: 'Father\'s Height (cm)', type: 'number', defaultValue: 180, min: 120, max: 230, step: 0.5, suffix: 'cm', tooltip: 'Father stature.' }
        ],
        naturalLanguageQueries: ["Convert height to cm", "Feet and inches to meters", "Height conversion calculator"],
        edgeCases: ["Negative height values Fractional inches Unrealistic human heights"],
        calculate: (inputs) => {
            const isBoy = inputs.childGender === 'boy';
            const mH = Number(inputs.motherHeightCm) || 165;
            const fH = Number(inputs.fatherHeightCm) || 180;

            // Khamis-Roche / Mid-Parental Target Height Method
            const targetHeightCm = isBoy ? ((mH + 13) + fH) / 2 : (mH + (fH - 13)) / 2;
            const minExpected = targetHeightCm - 5;
            const maxExpected = targetHeightCm + 5;

            return {
                primaryOutput: { label: 'Predicted Adult Height', value: `${targetHeightCm.toFixed(1)} cm`, suffix: `(${(targetHeightCm / 2.54 / 12).toFixed(1)} ft)` },
                secondaryMetrics: [
                    { label: 'Expected Adult Height Range', value: `${minExpected.toFixed(0)} - ${maxExpected.toFixed(0)} cm` }
                ]
            };
        }
    },
    // 19. Bra Size Calculator
    {
        id: 'bra-size-calculator',
        name: 'Bra Size Calculator',
        category: 'health-fitness',
        group: 'Body Metrics',
        bucket: 'Bucket C1',
        tier: 1,
        phase: 2,
        monthlySearches: '246K',
        cpc: '$0.86',
        description: "A Bra Size Calculator estimates bra band and cup size based on bust and underbust measurements. It helps users determine appropriate clothing fit. The calculator supports US, UK, and EU sizing systems.",
        inputs: [
            { id: 'snugUnderbustInches', name: 'Snug Underbust (Inches)', type: 'number', defaultValue: 30, min: 20, max: 60, step: 0.5, suffix: 'in', tooltip: 'Snug measurement around ribcage under bust.' },
            { id: 'standingBustInches', name: 'Standing Bust (Inches)', type: 'number', defaultValue: 35, min: 22, max: 70, step: 0.5, suffix: 'in', tooltip: 'Measurement around fullest part of bust.' }
        ],
        naturalLanguageQueries: ["Bra size calculator", "Find my bra size", "Bust measurement converter"],
        edgeCases: ["Invalid body measurements Extreme cup-size ranges Regional size inconsistencies"],
        calculate: (inputs) => {
            const under = Number(inputs.snugUnderbustInches) || 30;
            const bust = Number(inputs.standingBustInches) || 35;

            const band = Math.round(under % 2 === 0 ? under : under + 1);
            const diff = Math.max(0, bust - under);

            const cups = ['AA', 'A', 'B', 'C', 'D', 'DD / E', 'DDD / F', 'G', 'H', 'I', 'J'];
            const cupIdx = Math.min(cups.length - 1, Math.max(0, Math.round(diff)));
            const cupSize = cups[cupIdx] || 'A';

            return {
                primaryOutput: { label: 'Calculated US/UK Bra Size', value: `${band}${cupSize}` },
                secondaryMetrics: [
                    { label: 'Band Size', value: `${band}` },
                    { label: 'Cup Size', value: cupSize },
                    { label: 'Bust-to-Underbust Difference', value: `${diff.toFixed(1)} inches` }
                ]
            };
        }
    },
    // 20. BAC Calculator (Blood Alcohol Concentration)
    {
        id: 'bac-calculator',
        name: 'BAC Calculator',
        category: 'health-fitness',
        group: 'Body Metrics',
        bucket: 'Bucket C1',
        tier: 1,
        phase: 1,
        monthlySearches: '246K',
        cpc: '$3.23',
        description: "A BAC Calculator estimates blood alcohol concentration based on alcohol consumption, body weight, gender, and elapsed time. It helps users approximate intoxication levels. The calculator is informational only and must include strong safety disclaimers.",
        inputs: [
            { id: 'gender', name: 'Biological Sex', type: 'dropdown', defaultValue: 'male', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }], tooltip: 'r factor (0.68 male, 0.55 female).' },
            { id: 'bodyWeightKg', name: 'Body Weight (kg)', type: 'number', defaultValue: 75, min: 35, max: 250, step: 0.5, suffix: 'kg', tooltip: 'Weight in kg.' },
            { id: 'standardDrinks', name: 'Standard Drinks Consumed', type: 'number', defaultValue: 3, min: 0.5, max: 25, step: 0.5, tooltip: '1 drink = 14g pure alcohol (12oz beer / 5oz wine / 1.5oz spirit).' },
            { id: 'hoursElapsed', name: 'Hours Since First Drink', type: 'number', defaultValue: 2, min: 0, max: 24, step: 0.5, suffix: 'hrs', tooltip: 'Time since consumption started.' }
        ],
        naturalLanguageQueries: ["Calculate my bac", "What is my bac?", "Help me work out bac"],
        edgeCases: ["Drinking pattern variations Food intake ignored Medical/metabolic differences Extreme alcohol quantities"],
        calculate: (inputs) => {
            const isMale = inputs.gender === 'male';
            const wGrams = (Number(inputs.bodyWeightKg) || 75) * 1000;
            const drinks = Number(inputs.standardDrinks) || 3;
            const hours = Number(inputs.hoursElapsed) || 2;

            const alcoholGrams = drinks * 14;
            const r = isMale ? 0.68 : 0.55;
            const rawBac = (alcoholGrams / (wGrams * r)) * 100;
            const clearance = hours * 0.015;
            const bac = Math.max(0, rawBac - clearance);
            const hoursToSober = bac > 0 ? bac / 0.015 : 0;

            let legalStatus = 'Legal to Drive (Under 0.08%)';
            if (bac >= 0.08) legalStatus = 'Legally Intoxicated (>= 0.08% DUI Limit)';

            return {
                primaryOutput: { label: 'Current Blood Alcohol Concentration (BAC)', value: `${bac.toFixed(3)}%` },
                secondaryMetrics: [
                    { label: 'Driving Legality Status', value: legalStatus },
                    { label: 'Estimated Hours Until Completely Sober (0.00% BAC)', value: `${hoursToSober.toFixed(1)} Hours` }
                ]
            };
        }
    },
    // 21. Calorie Calculator
    {
        id: 'calorie-calculator',
        name: 'Calorie Calculator',
        category: 'health-fitness',
        group: 'Nutrition & Diet',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '2.2M',
        cpc: '$1.00',
        description: "A Calorie Calculator estimates the number of calories a person needs daily to maintain, lose, or gain weight. It combines metabolic rate equations with activity multipliers and weight goals. The calculator is commonly used in nutrition planning, fitness tracking, and weight management programs.",
        inputs: [
            { id: 'gender', name: 'Biological Sex', type: 'dropdown', defaultValue: 'male', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }], tooltip: 'Biological sex.' },
            { id: 'age', name: 'Age', type: 'number', defaultValue: 30, min: 15, max: 100, step: 1, suffix: 'yrs', tooltip: 'Age.' },
            { id: 'heightCm', name: 'Height (cm)', type: 'number', defaultValue: 178, min: 100, max: 240, step: 1, suffix: 'cm', tooltip: 'Height in cm.' },
            { id: 'weightKg', name: 'Weight (kg)', type: 'number', defaultValue: 78, min: 35, max: 250, step: 0.5, suffix: 'kg', tooltip: 'Weight.' },
            { id: 'activityLevel', name: 'Activity Multiplier', type: 'dropdown', defaultValue: 1.375, options: [{ label: 'Sedentary (1.2x)', value: 1.2 }, { label: 'Light Exercise (1.375x)', value: 1.375 }, { label: 'Moderate Exercise (1.55x)', value: 1.55 }, { label: 'Very Active (1.725x)', value: 1.725 }], tooltip: 'Activity level.' }
        ],
        naturalLanguageQueries: ["How many calories do I need per day to lose weight?", "Daily calorie needs for 30 year old female 130 lbs moderately active", "What is my TDEE?"],
        edgeCases: ["Extremely low calorie targets Pregnancy or medical conditions not modeled Athlete metabolic variations Pediatric populations"],
        calculate: (inputs) => {
            const isMale = inputs.gender === 'male';
            const age = Number(inputs.age) || 30;
            const h = Number(inputs.heightCm) || 178;
            const w = Number(inputs.weightKg) || 78;
            const act = Number(inputs.activityLevel) || 1.375;

            // Mifflin-St Jeor
            const bmr = (10 * w) + (6.25 * h) - (5 * age) + (isMale ? 5 : -161);
            const maintenanceTdee = bmr * act;
            const mildLoss = maintenanceTdee - 250;
            const weightLoss = maintenanceTdee - 500;
            const extremeLoss = maintenanceTdee - 1000;
            const mildGain = maintenanceTdee + 300;

            return {
                primaryOutput: { label: 'Daily Maintenance Calories', value: Math.round(maintenanceTdee), suffix: 'kcal/day' },
                secondaryMetrics: [
                    { label: 'Basal Metabolic Rate (BMR)', value: `${Math.round(bmr)} kcal/day` },
                    { label: 'Weight Loss Target (-0.5 kg / -1 lb/wk)', value: `${Math.round(weightLoss)} kcal/day` },
                    { label: 'Mild Weight Loss Target (-0.25 kg/wk)', value: `${Math.round(mildLoss)} kcal/day` },
                    { label: 'Lean Muscle Gain Target (+0.25 kg/wk)', value: `${Math.round(mildGain)} kcal/day` }
                ]
            };
        }
    },
    // 22. BMR Calculator (Basal Metabolic Rate)
    {
        id: 'bmr-calculator',
        name: 'BMR Calculator',
        category: 'health-fitness',
        group: 'Nutrition & Diet',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '550K',
        cpc: '$0.36',
        description: "A BMR Calculator estimates the number of calories the body burns at complete rest to maintain vital functions. It is the foundation for estimating total energy expenditure. The calculator commonly supports Mifflin-St Jeor, Harris-Benedict, and Katch-McArdle equations.",
        inputs: [
            { id: 'gender', name: 'Biological Sex', type: 'dropdown', defaultValue: 'male', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }], tooltip: 'Sex.' },
            { id: 'age', name: 'Age', type: 'number', defaultValue: 28, min: 15, max: 100, step: 1, suffix: 'yrs', tooltip: 'Age.' },
            { id: 'heightCm', name: 'Height (cm)', type: 'number', defaultValue: 175, min: 100, max: 240, step: 0.5, suffix: 'cm', tooltip: 'Height.' },
            { id: 'weightKg', name: 'Weight (kg)', type: 'number', defaultValue: 72, min: 30, max: 250, step: 0.5, suffix: 'kg', tooltip: 'Weight.' }
        ],
        naturalLanguageQueries: ["Calculate my bmr", "What is my bmr?", "Help me work out bmr"],
        edgeCases: ["Missing body fat for Katch-McArdle Extremely low/high body weights Invalid ages"],
        calculate: (inputs) => {
            const isMale = inputs.gender === 'male';
            const age = Number(inputs.age) || 28;
            const h = Number(inputs.heightCm) || 175;
            const w = Number(inputs.weightKg) || 72;

            // Mifflin-St Jeor
            const bmrMifflin = (10 * w) + (6.25 * h) - (5 * age) + (isMale ? 5 : -161);
            // Revised Harris-Benedict
            const bmrHarris = isMale ? 88.362 + (13.397 * w) + (4.799 * h) - (5.677 * age) : 447.593 + (9.247 * w) + (3.098 * h) - (4.330 * age);

            return {
                primaryOutput: { label: 'Basal Metabolic Rate (Mifflin-St Jeor)', value: Math.round(bmrMifflin), suffix: 'kcal/day' },
                secondaryMetrics: [
                    { label: 'Harris-Benedict BMR', value: `${Math.round(bmrHarris)} kcal/day` },
                    { label: 'Hourly Resting Calorie Burn', value: `${(bmrMifflin / 24).toFixed(1)} kcal/hr` }
                ]
            };
        }
    },
    // 23. TDEE Calculator (Total Daily Energy Expenditure)
    {
        id: 'tdee-calculator',
        name: 'TDEE Calculator',
        category: 'health-fitness',
        group: 'Nutrition & Diet',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '1.2M',
        cpc: '$0.59',
        description: "A TDEE Calculator estimates total calories burned daily including exercise and activity. It helps determine calorie intake targets for weight management. The calculator expands BMR calculations with activity multipliers.",
        inputs: [
            { id: 'gender', name: 'Biological Sex', type: 'dropdown', defaultValue: 'male', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }], tooltip: 'Sex.' },
            { id: 'age', name: 'Age', type: 'number', defaultValue: 30, min: 15, max: 100, step: 1, suffix: 'yrs', tooltip: 'Age.' },
            { id: 'heightCm', name: 'Height (cm)', type: 'number', defaultValue: 178, min: 100, max: 240, step: 1, suffix: 'cm', tooltip: 'Height.' },
            { id: 'weightKg', name: 'Weight (kg)', type: 'number', defaultValue: 78, min: 35, max: 250, step: 0.5, suffix: 'kg', tooltip: 'Weight.' },
            { id: 'activityLevel', name: 'Activity Level', type: 'dropdown', defaultValue: 1.55, options: [{ label: 'Sedentary (Desk job + no exercise)', value: 1.2 }, { label: 'Light (Exercise 1-3 times/wk)', value: 1.375 }, { label: 'Moderate (Exercise 3-5 times/wk)', value: 1.55 }, { label: 'Heavy (Hard exercise 6-7 times/wk)', value: 1.725 }, { label: 'Athlete (2x training/day)', value: 1.9 }], tooltip: 'Activity multiplier.' }
        ],
        naturalLanguageQueries: ["Calculate my tdee", "What is my tdee?", "Help me work out tdee"],
        edgeCases: ["Inaccurate activity reporting Elite athletes Medical metabolism disorders"],
        calculate: (inputs) => {
            const isMale = inputs.gender === 'male';
            const age = Number(inputs.age) || 30;
            const h = Number(inputs.heightCm) || 178;
            const w = Number(inputs.weightKg) || 78;
            const act = Number(inputs.activityLevel) || 1.55;

            const bmr = (10 * w) + (6.25 * h) - (5 * age) + (isMale ? 5 : -161);
            const tdee = bmr * act;

            return {
                primaryOutput: { label: 'Total Daily Energy Expenditure (TDEE)', value: Math.round(tdee), suffix: 'kcal/day' },
                secondaryMetrics: [
                    { label: 'Basal Metabolic Rate (BMR)', value: `${Math.round(bmr)} kcal/day` },
                    { label: 'Weekly Caloric Burn', value: `${Math.round(tdee * 7)} kcal/week` },
                    { label: 'Cutting Target (-500 kcal)', value: `${Math.round(tdee - 500)} kcal/day` },
                    { label: 'Bulking Target (+300 kcal)', value: `${Math.round(tdee + 300)} kcal/day` }
                ]
            };
        }
    },
    // 24. Macro Calculator
    {
        id: 'macro-calculator',
        name: 'Macro Calculator',
        category: 'health-fitness',
        group: 'Nutrition & Diet',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '165K',
        cpc: '$0.84',
        description: "A Macro Calculator estimates recommended daily intake of protein, carbohydrates, and fats based on calorie goals. It supports weight loss, maintenance, and muscle-building plans. The calculator converts calorie targets into macronutrient gram values.",
        inputs: [
            { id: 'dailyCalories', name: 'Target Daily Calories', type: 'number', defaultValue: 2200, min: 1000, max: 6000, step: 50, suffix: 'kcal', tooltip: 'Daily caloric goal.' },
            { id: 'dietGoal', name: 'Dietary Goal Ratio', type: 'dropdown', defaultValue: 'balanced', options: [{ label: 'Balanced (40% C / 30% P / 30% F)', value: 'balanced' }, { label: 'High Protein / Cutting (35% C / 40% P / 25% F)', value: 'high_protein' }, { label: 'Low Carb (20% C / 40% P / 40% F)', value: 'low_carb' }, { label: 'Keto (5% C / 25% P / 70% F)', value: 'keto' }], tooltip: 'Macronutrient breakdown.' }
        ],
        naturalLanguageQueries: ["Calculate my macro", "What is my macro?", "Help me work out macro"],
        edgeCases: ["Macro percentages exceeding 100% Extremely low fat diets Keto-specific edge cases"],
        calculate: (inputs) => {
            const cals = Number(inputs.dailyCalories) || 2200;
            const goal = String(inputs.dietGoal || 'balanced');

            let cPct = 0.40, pPct = 0.30, fPct = 0.30;
            if (goal === 'high_protein') { cPct = 0.35; pPct = 0.40; fPct = 0.25; }
            else if (goal === 'low_carb') { cPct = 0.20; pPct = 0.40; fPct = 0.40; }
            else if (goal === 'keto') { cPct = 0.05; pPct = 0.25; fPct = 0.70; }

            const proteinGrams = Math.round((cals * pPct) / 4);
            const carbGrams = Math.round((cals * cPct) / 4);
            const fatGrams = Math.round((cals * fPct) / 9);

            return {
                primaryOutput: { label: 'Daily Protein Target', value: `${proteinGrams}g`, suffix: `(${Math.round(proteinGrams * 4)} kcal)` },
                secondaryMetrics: [
                    { label: 'Daily Carbohydrates Target', value: `${carbGrams}g (${Math.round(carbGrams * 4)} kcal)` },
                    { label: 'Daily Dietary Fat Target', value: `${fatGrams}g (${Math.round(fatGrams * 9)} kcal)` },
                    { label: 'Macro Split Ratio (C / P / F)', value: `${Math.round(cPct * 100)}% / ${Math.round(pPct * 100)}% / ${Math.round(fPct * 100)}%` }
                ]
            };
        }
    },
    // 25. Carbohydrate Calculator
    {
        id: 'carbohydrate-calculator',
        name: 'Carbohydrate Calculator',
        category: 'health-fitness',
        group: 'Nutrition & Diet',
        bucket: 'Bucket B',
        tier: 1,
        phase: 4,
        monthlySearches: '1K',
        cpc: '$1.28',
        description: "A Carbohydrate Calculator estimates recommended carbohydrate intake based on calorie goals and activity levels. It helps users optimize energy intake for fitness and health. The calculator supports standard dietary recommendations and athletic performance targets.",
        inputs: [
            { id: 'dailyCalories', name: 'Total Daily Caloric Intake', type: 'number', defaultValue: 2000, min: 1000, max: 6000, step: 50, suffix: 'kcal', tooltip: 'Daily calories.' },
            { id: 'carbPercentage', name: 'Carbohydrate Target Percentage', type: 'percentage', defaultValue: 50, min: 5, max: 75, step: 5, suffix: '%', tooltip: 'USDA guideline is 45-65%.' }
        ],
        naturalLanguageQueries: ["Calculate my carbohydrate", "What is my carbohydrate?", "Help me work out carbohydrate"],
        edgeCases: ["Keto diets below recommended ranges Invalid macro percentages Extremely low calorie diets"],
        calculate: (inputs) => {
            const cals = Number(inputs.dailyCalories) || 2000;
            const pct = (Number(inputs.carbPercentage) || 50) / 100;

            const carbCals = cals * pct;
            const carbGrams = Math.round(carbCals / 4);

            return {
                primaryOutput: { label: 'Daily Carbohydrate Target', value: `${carbGrams}g / day` },
                secondaryMetrics: [
                    { label: 'Carbohydrate Calories', value: `${Math.round(carbCals)} kcal` },
                    { label: 'Per Meal Target (3 Meals/Day)', value: `${Math.round(carbGrams / 3)}g / meal` }
                ]
            };
        }
    },
    // 26. Protein Calculator
    {
        id: 'protein-calculator',
        name: 'Protein Calculator',
        category: 'health-fitness',
        group: 'Nutrition & Diet',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '165K',
        cpc: '$0.36',
        description: "A Protein Calculator estimates recommended daily protein intake based on body weight, fitness goals, and activity level. It helps support muscle maintenance, growth, and recovery. The calculator supports evidence-based protein intake ranges.",
        inputs: [
            { id: 'bodyWeightKg', name: 'Body Weight (kg)', type: 'number', defaultValue: 75, min: 30, max: 250, step: 0.5, suffix: 'kg', tooltip: 'Weight in kg.' },
            { id: 'activityGoal', name: 'Training Intensity / Goal', type: 'dropdown', defaultValue: 'strength', options: [{ label: 'Sedentary Adult (0.8 g/kg RDA)', value: 0.8 }, { label: 'Endurance Athlete (1.4 g/kg)', value: 1.4 }, { label: 'Hypertrophy / Muscle Building (1.8 g/kg)', value: 1.8 }, { label: 'Aggressive Fat Loss / Bodybuilder (2.2 g/kg)', value: 2.2 }], tooltip: 'Protein multiplier.' }
        ],
        naturalLanguageQueries: ["Calculate my protein", "What is my protein?", "Help me work out protein"],
        edgeCases: ["Kidney disease considerations Extremely high body weights Elderly protein needs"],
        calculate: (inputs) => {
            const w = Number(inputs.bodyWeightKg) || 75;
            const mult = Number(inputs.activityGoal) || 1.8;

            const proteinGrams = Math.round(w * mult);
            const proteinCalories = proteinGrams * 4;

            return {
                primaryOutput: { label: 'Recommended Daily Protein Intake', value: `${proteinGrams}g / day` },
                secondaryMetrics: [
                    { label: 'Protein Energy Contribution', value: `${proteinCalories} kcal` },
                    { label: 'Optimal Per-Meal Dose (4 Meals/Day)', value: `${Math.round(proteinGrams / 4)}g / meal` },
                    { label: 'Per Pound Equivalent', value: `${(proteinGrams / (w * 2.20462)).toFixed(2)} g/lb` }
                ]
            };
        }
    },
    // 27. Fat Intake Calculator
    {
        id: 'fat-intake-calculator',
        name: 'Fat Intake Calculator',
        category: 'health-fitness',
        group: 'Nutrition & Diet',
        bucket: 'Bucket B',
        tier: 1,
        phase: 4,
        monthlySearches: '2K',
        cpc: '$0.31',
        description: "A Fat Intake Calculator estimates recommended daily dietary fat intake based on calorie goals and nutritional guidelines. It helps balance healthy fat consumption. The calculator supports general and ketogenic diet targets.",
        inputs: [
            { id: 'dailyCalories', name: 'Total Daily Caloric Intake', type: 'number', defaultValue: 2200, min: 1000, max: 6000, step: 50, suffix: 'kcal', tooltip: 'Daily calories.' },
            { id: 'fatPercentage', name: 'Fat Target Percentage', type: 'percentage', defaultValue: 28, min: 15, max: 75, step: 1, suffix: '%', tooltip: 'Healthy range is 20-35% of total calories.' }
        ],
        naturalLanguageQueries: ["Calculate my fat intake", "What is my fat intake?", "Help me work out fat intake"],
        edgeCases: ["Extremely low fat intake Macro percentages exceeding 100% Ketogenic extremes"],
        calculate: (inputs) => {
            const cals = Number(inputs.dailyCalories) || 2200;
            const pct = (Number(inputs.fatPercentage) || 28) / 100;

            const fatCals = cals * pct;
            const fatGrams = Math.round(fatCals / 9);
            const maxSatFatGrams = Math.round((cals * 0.10) / 9); // AHA recommends < 10% saturated fat

            return {
                primaryOutput: { label: 'Daily Dietary Fat Target', value: `${fatGrams}g / day` },
                secondaryMetrics: [
                    { label: 'Calories from Fat (9 kcal/g)', value: `${Math.round(fatCals)} kcal` },
                    { label: 'Max Recommended Saturated Fat (<10%)', value: `${maxSatFatGrams}g / day` }
                ]
            };
        }
    },
    // 28. Calories Burned Calculator
    {
        id: 'calories-burned-calculator',
        name: 'Calories Burned Calculator',
        category: 'health-fitness',
        group: 'Nutrition & Diet',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '74K',
        cpc: '$0.66',
        description: "A Calories Burned Calculator estimates calories expended during physical activities. It helps users track exercise energy expenditure. The calculator commonly uses MET values.",
        inputs: [
            { id: 'activityMet', name: 'Exercise Activity Type', type: 'dropdown', defaultValue: 8.0, options: [{ label: 'Running (6 mph / 10 min-mile - MET 9.8)', value: 9.8 }, { label: 'Cycling (Moderate 12-14 mph - MET 7.5)', value: 7.5 }, { label: 'Swimming (Freestyle laps - MET 8.0)', value: 8.0 }, { label: 'Weightlifting (Vigorous - MET 6.0)', value: 6.0 }, { label: 'Brisk Walking (3.5 mph - MET 3.8)', value: 3.8 }, { label: 'Yoga / Pilates (MET 3.0)', value: 3.0 }], tooltip: 'Compendium of Physical Activities MET value.' },
            { id: 'bodyWeightKg', name: 'Body Weight (kg)', type: 'number', defaultValue: 75, min: 30, max: 250, step: 0.5, suffix: 'kg', tooltip: 'Weight.' },
            { id: 'durationMinutes', name: 'Workout Duration (Minutes)', type: 'number', defaultValue: 45, min: 5, max: 360, step: 5, suffix: 'min', tooltip: 'Time active.' }
        ],
        naturalLanguageQueries: ["How many calories do I need per day to lose weight?", "Daily calorie needs for 30 year old female 130 lbs moderately active", "What is my TDEE?"],
        edgeCases: ["Inaccurate MET assumptions Elite athlete expenditure differences Invalid durations"],
        calculate: (inputs) => {
            const met = Number(inputs.activityMet) || 8.0;
            const w = Number(inputs.bodyWeightKg) || 75;
            const mins = Number(inputs.durationMinutes) || 45;

            // Calories Burned = Duration (min) * (MET * 3.5 * weight in kg) / 200
            const calories = (mins * (met * 3.5 * w)) / 200;
            const calPerMin = calories / mins;

            return {
                primaryOutput: { label: 'Estimated Calories Burned', value: Math.round(calories), suffix: 'kcal' },
                secondaryMetrics: [
                    { label: 'Caloric Burn Rate', value: `${calPerMin.toFixed(1)} kcal/min` },
                    { label: 'MET Intensity Score', value: `${met.toFixed(1)} METs` }
                ]
            };
        }
    },
    // 29. Water Intake Calculator
    {
        id: 'water-intake-calculator',
        name: 'Water Intake Calculator',
        category: 'health-fitness',
        group: 'Nutrition & Diet',
        bucket: 'Bucket C1',
        tier: 2,
        phase: 2,
        monthlySearches: '27K',
        cpc: '$0.54',
        description: "A Water Intake Calculator estimates recommended daily fluid consumption based on weight, climate, and activity level. It helps support hydration planning. The calculator provides general hydration guidance.",
        inputs: [
            { id: 'bodyWeightKg', name: 'Body Weight (kg)', type: 'number', defaultValue: 70, min: 30, max: 250, step: 0.5, suffix: 'kg', tooltip: 'Weight.' },
            { id: 'exerciseMinutesDaily', name: 'Daily Exercise / Sweating (Minutes)', type: 'number', defaultValue: 45, min: 0, max: 240, step: 15, suffix: 'min', tooltip: 'Daily exercise time.' },
            { id: 'climate', name: 'Climate / Temperature', type: 'dropdown', defaultValue: 'moderate', options: [{ label: 'Temperate / Moderate', value: 'moderate' }, { label: 'Hot / Humid (+0.5L)', value: 'hot' }], tooltip: 'Ambient environment.' }
        ],
        naturalLanguageQueries: ["Calculate my water intake", "What is my water intake?", "Help me work out water intake"],
        edgeCases: ["Kidney or heart disease Extreme endurance exercise Pregnancy or breastfeeding"],
        calculate: (inputs) => {
            const w = Number(inputs.bodyWeightKg) || 70;
            const exerciseMins = Number(inputs.exerciseMinutesDaily) || 45;
            const isHot = inputs.climate === 'hot';

            // Baseline: 35ml per kg body weight
            let liters = (w * 0.035) + ((exerciseMins / 30) * 0.35) + (isHot ? 0.5 : 0);
            const ounces = liters * 33.814;
            const glasses = liters / 0.25; // 250ml glass

            return {
                primaryOutput: { label: 'Daily Water Target', value: `${liters.toFixed(1)} Liters`, suffix: `(${Math.round(ounces)} fl oz)` },
                secondaryMetrics: [
                    { label: 'Standard Glasses of Water (8 oz / 250ml)', value: `${Math.round(glasses)} Glasses` },
                    { label: 'Exercise Hydration Compensation', value: `+${((exerciseMins / 30) * 0.35).toFixed(2)} L` }
                ]
            };
        }
    },
    // 30. Intermittent Fasting Calculator
    {
        id: 'intermittent-fasting-calculator',
        name: 'Intermittent Fasting Calculator',
        category: 'health-fitness',
        group: 'Nutrition & Diet',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '5K',
        cpc: '$1.33',
        description: "An Intermittent Fasting Calculator estimates fasting and eating windows for time-restricted eating schedules. It helps users plan fasting protocols. The calculator supports popular fasting methods.",
        inputs: [
            { id: 'protocol', name: 'Fasting Protocol', type: 'dropdown', defaultValue: '16_8', options: [{ label: '16:8 Protocol (16h Fast, 8h Window)', value: '16_8' }, { label: '18:6 Protocol (18h Fast, 6h Window)', value: '18_6' }, { label: '20:4 Warrior Diet (20h Fast, 4h Window)', value: '20_4' }, { label: '14:10 Circadian (14h Fast, 10h Window)', value: '14_10' }], tooltip: 'Fasting:Eating ratio.' },
            { id: 'firstMealHour', name: 'First Meal Time (Hour: 0-23)', type: 'number', defaultValue: 12, min: 0, max: 23, step: 1, suffix: ':00', tooltip: 'When eating window opens (e.g. 12 for 12:00 PM).' }
        ],
        naturalLanguageQueries: ["Calculate my intermittent fasting", "What is my intermittent fasting?", "Help me work out intermittent fasting"],
        edgeCases: ["Overnight day-crossing calculations Time-zone changes Unsuitable medical conditions"],
        calculate: (inputs) => {
            const proto = String(inputs.protocol || '16_8');
            const startH = Number(inputs.firstMealHour) || 12;

            const windows: Record<string, number> = { '16_8': 8, '18_6': 6, '20_4': 4, '14_10': 10 };
            const eatWindow = windows[proto] || 8;
            const fastWindow = 24 - eatWindow;

            const endH = (startH + eatWindow) % 24;
            const formatTime = (h: number) => {
                const ampm = h >= 12 ? 'PM' : 'AM';
                const hour12 = h % 12 === 0 ? 12 : h % 12;
                return `${hour12}:00 ${ampm}`;
            };

            return {
                primaryOutput: { label: 'Eating Window', value: `${formatTime(startH)} - ${formatTime(endH)}` },
                secondaryMetrics: [
                    { label: 'Fasting Duration', value: `${fastWindow} Consecutive Hours` },
                    { label: 'Eating Window Length', value: `${eatWindow} Hours` },
                    { label: 'Fast Begins At', value: formatTime(endH) }
                ]
            };
        }
    },
    // 31. Calorie Deficit Calculator
    {
        id: 'calorie-deficit-calculator',
        name: 'Calorie Deficit Calculator',
        category: 'health-fitness',
        group: 'Nutrition & Diet',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '550K',
        cpc: '$0.82',
        description: "A Calorie Deficit Calculator estimates how many calories should be reduced daily to achieve weight loss goals. It helps users create sustainable fat-loss plans. The calculator converts desired weight-loss pace into calorie deficits.",
        inputs: [
            { id: 'tdeeCalories', name: 'Maintenance TDEE Calories', type: 'number', defaultValue: 2400, min: 1200, max: 6000, step: 50, suffix: 'kcal', tooltip: 'Maintenance energy.' },
            { id: 'targetLossRate', name: 'Weekly Weight Loss Goal', type: 'dropdown', defaultValue: 500, options: [{ label: '0.25 kg / 0.5 lb per week (-250 kcal/day)', value: 250 }, { label: '0.50 kg / 1.0 lb per week (-500 kcal/day)', value: 500 }, { label: '0.75 kg / 1.5 lb per week (-750 kcal/day)', value: 750 }, { label: '1.00 kg / 2.0 lb per week (-1000 kcal/day)', value: 1000 }], tooltip: '3500 kcal deficit ≈ 1 lb fat.' }
        ],
        naturalLanguageQueries: ["How many calories do I need per day to lose weight?", "Daily calorie needs for 30 year old female 130 lbs moderately active", "What is my TDEE?"],
        edgeCases: ["Unsafe calorie deficits Extremely low body fat levels Aggressive weight-loss targets"],
        calculate: (inputs) => {
            const tdee = Number(inputs.tdeeCalories) || 2400;
            const deficit = Number(inputs.targetLossRate) || 500;

            const targetCalories = Math.max(1200, tdee - deficit);
            const weeklyDeficit = deficit * 7;
            const estimatedMonthlyLossKg = (weeklyDeficit * 4) / 7700;

            return {
                primaryOutput: { label: 'Daily Calorie Intake Target', value: Math.round(targetCalories), suffix: 'kcal/day' },
                secondaryMetrics: [
                    { label: 'Daily Energy Deficit', value: `-${deficit} kcal/day` },
                    { label: 'Estimated Monthly Fat Loss', value: `${estimatedMonthlyLossKg.toFixed(1)} kg (${(estimatedMonthlyLossKg * 2.20462).toFixed(1)} lbs)` },
                    { label: 'Cumulative Weekly Deficit', value: `${weeklyDeficit} kcal/wk` }
                ]
            };
        }
    },
    // 32. Calorie Surplus Calculator
    {
        id: 'calorie-surplus-calculator',
        name: 'Calorie Surplus Calculator',
        category: 'health-fitness',
        group: 'Nutrition & Diet',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '5K',
        cpc: '$0.41',
        description: "A Calorie Surplus Calculator estimates additional calories needed to support weight gain or muscle growth. It helps users build structured bulking plans. The calculator adjusts calorie intake above maintenance.",
        inputs: [
            { id: 'tdeeCalories', name: 'Maintenance TDEE Calories', type: 'number', defaultValue: 2500, min: 1200, max: 6000, step: 50, suffix: 'kcal', tooltip: 'Maintenance calories.' },
            { id: 'surplusType', name: 'Bulking Goal', type: 'dropdown', defaultValue: 300, options: [{ label: 'Lean Bulk / Slow Gain (+250 kcal/day)', value: 250 }, { label: 'Standard Muscle Hypertrophy (+350 kcal/day)', value: 350 }, { label: 'Aggressive Bulking (+500 kcal/day)', value: 500 }], tooltip: 'Surplus size.' }
        ],
        naturalLanguageQueries: ["How many calories do I need per day to lose weight?", "Daily calorie needs for 30 year old female 130 lbs moderately active", "What is my TDEE?"],
        edgeCases: ["Excessive surplus targets Obesity considerations Inactive users attempting aggressive bulk"],
        calculate: (inputs) => {
            const tdee = Number(inputs.tdeeCalories) || 2500;
            const surplus = Number(inputs.surplusType) || 300;

            const targetCalories = tdee + surplus;
            const monthlyGainKg = (surplus * 30) / 7700;

            return {
                primaryOutput: { label: 'Daily Bulking Calorie Target', value: Math.round(targetCalories), suffix: 'kcal/day' },
                secondaryMetrics: [
                    { label: 'Daily Surplus Addition', value: `+${surplus} kcal/day` },
                    { label: 'Estimated Monthly Weight Gain', value: `+${monthlyGainKg.toFixed(1)} kg (+${(monthlyGainKg * 2.20462).toFixed(1)} lbs)` }
                ]
            };
        }
    },
    // 33. Weight Loss Pace Calculator
    {
        id: 'weight-loss-pace-calculator',
        name: 'Weight Loss Pace Calculator',
        category: 'health-fitness',
        group: 'Nutrition & Diet',
        bucket: 'Bucket C1',
        tier: 1,
        phase: 4,
        monthlySearches: '40',
        cpc: '$3.56',
        description: "A Weight Loss Pace Calculator estimates how long it will take to reach a target weight based on calorie deficits and expected fat loss rates. The calculator helps users set realistic timelines.",
        inputs: [
            { id: 'currentWeightKg', name: 'Current Weight (kg)', type: 'number', defaultValue: 90, min: 40, max: 250, step: 0.5, suffix: 'kg', tooltip: 'Current mass.' },
            { id: 'goalWeightKg', name: 'Target Goal Weight (kg)', type: 'number', defaultValue: 78, min: 35, max: 200, step: 0.5, suffix: 'kg', tooltip: 'Desired weight.' },
            { id: 'weeklyPaceKg', name: 'Planned Weekly Loss Pace', type: 'dropdown', defaultValue: 0.5, options: [{ label: '0.25 kg / wk (Gentle)', value: 0.25 }, { label: '0.50 kg / wk (Standard Recommended)', value: 0.5 }, { label: '0.75 kg / wk (Fast)', value: 0.75 }, { label: '1.00 kg / wk (Aggressive Max)', value: 1.0 }], tooltip: 'Pace.' }
        ],
        naturalLanguageQueries: ["Calculate my weight loss pace", "What is my weight loss pace?", "Help me work out weight loss pace"],
        edgeCases: ["Unrealistic deficits Plateau effects not modeled Metabolic adaptation ignored"],
        calculate: (inputs) => {
            const cur = Number(inputs.currentWeightKg) || 90;
            const goal = Number(inputs.goalWeightKg) || 78;
            const pace = Math.max(0.1, Number(inputs.weeklyPaceKg) || 0.5);

            const toLose = Math.max(0, cur - goal);
            const weeksNeeded = Math.ceil(toLose / pace);
            const monthsNeeded = (weeksNeeded / 4.33).toFixed(1);
            const requiredDeficitPerDay = Math.round((pace * 7700) / 7);

            return {
                primaryOutput: { label: 'Estimated Time to Goal Weight', value: `${weeksNeeded} Weeks`, suffix: `(~${monthsNeeded} Months)` },
                secondaryMetrics: [
                    { label: 'Total Weight to Lose', value: `${toLose.toFixed(1)} kg (${(toLose * 2.20462).toFixed(1)} lbs)` },
                    { label: 'Required Daily Caloric Deficit', value: `-${requiredDeficitPerDay} kcal/day` }
                ]
            };
        }
    },
    // 34. Muscle Building Macro Calculator
    {
        id: 'muscle-building-macro-calculator',
        name: 'Muscle Building Macro Calculator',
        category: 'health-fitness',
        group: 'Nutrition & Diet',
        bucket: 'Bucket B',
        tier: 1,
        phase: 4,
        monthlySearches: '2K',
        cpc: '$0.48',
        description: "A Muscle Building Macro Calculator estimates optimal calories and macronutrient distribution for hypertrophy and strength training. It helps users maximize muscle growth while limiting fat gain. The calculator emphasizes elevated protein intake.",
        inputs: [
            { id: 'bodyWeightKg', name: 'Body Weight (kg)', type: 'number', defaultValue: 75, min: 35, max: 250, step: 0.5, suffix: 'kg', tooltip: 'Weight.' },
            { id: 'targetCalories', name: 'Target Daily Calories (with Surplus)', type: 'number', defaultValue: 2800, min: 1500, max: 6000, step: 50, suffix: 'kcal', tooltip: 'Bulking calories.' }
        ],
        naturalLanguageQueries: ["Calculate my muscle building macro", "What is my muscle building macro?", "Help me work out muscle building macro"],
        edgeCases: ["Extremely low-carb bulks Obese beginners Unrealistic mass gain expectations"],
        calculate: (inputs) => {
            const w = Number(inputs.bodyWeightKg) || 75;
            const cals = Number(inputs.targetCalories) || 2800;

            const proteinGrams = Math.round(w * 2.0); // 2.0g/kg optimal hypertrophy
            const fatGrams = Math.round((cals * 0.25) / 9); // 25% fat
            const carbCalories = Math.max(0, cals - (proteinGrams * 4) - (fatGrams * 9));
            const carbGrams = Math.round(carbCalories / 4);

            return {
                primaryOutput: { label: 'Muscle Building Protein Target', value: `${proteinGrams}g / day` },
                secondaryMetrics: [
                    { label: 'Carbohydrates (Fuel / Glycogen)', value: `${carbGrams}g / day` },
                    { label: 'Fats (Hormonal Support)', value: `${fatGrams}g / day` },
                    { label: 'Protein Target per Pound', value: `${(proteinGrams / (w * 2.20462)).toFixed(2)} g/lb` }
                ]
            };
        }
    },
    // 35. A1C Calculator (Estimated Average Glucose)
    {
        id: 'a1c-calculator',
        name: 'A1C Calculator',
        category: 'health-fitness',
        group: 'Nutrition & Diet',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '27K',
        cpc: '$12.07  ★ HIGH CPC',
        description: "An A1C Calculator converts between HbA1c percentages and estimated average glucose levels. It helps users interpret long-term blood sugar control. The calculator is commonly used in diabetes management.",
        inputs: [
            { id: 'a1cPercentage', name: 'Hemoglobin A1C Level', type: 'percentage', defaultValue: 5.6, min: 4.0, max: 16.0, step: 0.1, suffix: '%', tooltip: 'HbA1c test percentage.' }
        ],
        naturalLanguageQueries: ["Calculate my a1c", "What is my a1c?", "Help me work out a1c"],
        edgeCases: ["Hemoglobin disorders affecting A1C Unit conversion errors Extreme glucose values"],
        calculate: (inputs) => {
            const a1c = Number(inputs.a1cPercentage) || 5.6;

            // ADAG Formula: eAG (mg/dL) = 28.7 * A1C - 46.7
            const eagMgDl = (28.7 * a1c) - 46.7;
            const eagMmolL = eagMgDl / 18.0182;

            let classification = 'Normal (< 5.7%)';
            if (a1c >= 6.5) classification = 'Diabetes (>= 6.5%)';
            else if (a1c >= 5.7) classification = 'Prediabetes (5.7% - 6.4%)';

            return {
                primaryOutput: { label: 'Estimated Average Glucose (eAG)', value: Math.round(eagMgDl), suffix: 'mg/dL' },
                secondaryMetrics: [
                    { label: 'eAG in International Units', value: `${eagMmolL.toFixed(1)} mmol/L` },
                    { label: 'ADA Diagnostic Category', value: classification }
                ]
            };
        }
    },
    // 36. Cholesterol Ratio Calculator
    {
        id: 'cholesterol-ratio-calculator',
        name: 'Cholesterol Ratio Calculator',
        category: 'health-fitness',
        group: 'Nutrition & Diet',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '5K',
        cpc: '$3.11',
        description: "A Cholesterol Ratio Calculator estimates cardiovascular risk ratios using cholesterol measurements. It helps evaluate heart disease risk. The calculator commonly analyzes total cholesterol-to-HDL ratios.",
        inputs: [
            { id: 'totalCholesterol', name: 'Total Cholesterol', type: 'number', defaultValue: 210, min: 50, max: 500, step: 1, suffix: 'mg/dL', tooltip: 'Total cholesterol.' },
            { id: 'hdlCholesterol', name: 'HDL Cholesterol (Good)', type: 'number', defaultValue: 55, min: 10, max: 150, step: 1, suffix: 'mg/dL', tooltip: 'High-density lipoprotein.' },
            { id: 'triglycerides', name: 'Triglycerides', type: 'number', defaultValue: 140, min: 20, max: 1000, step: 1, suffix: 'mg/dL', tooltip: 'Blood triglycerides.' }
        ],
        naturalLanguageQueries: ["Calculate my cholesterol ratio", "What is my cholesterol ratio?", "Help me work out cholesterol ratio"],
        edgeCases: ["HDL equal to zero Missing lipid components Unit inconsistencies"],
        calculate: (inputs) => {
            const tc = Number(inputs.totalCholesterol) || 210;
            const hdl = Math.max(1, Number(inputs.hdlCholesterol) || 55);
            const tg = Number(inputs.triglycerides) || 140;

            const ratioTcToHdl = tc / hdl;
            const ratioTgToHdl = tg / hdl;
            const nonHdl = tc - hdl;

            let risk = 'Optimal / Ideal (< 3.5)';
            if (ratioTcToHdl > 5.0) risk = 'High Cardiovascular Risk (> 5.0)';
            else if (ratioTcToHdl > 3.5) risk = 'Moderate Risk (3.5 - 5.0)';

            return {
                primaryOutput: { label: 'Total-to-HDL Ratio', value: ratioTcToHdl.toFixed(2) },
                secondaryMetrics: [
                    { label: 'Cardiac Risk Profile', value: risk },
                    { label: 'Non-HDL Cholesterol', value: `${nonHdl} mg/dL` },
                    { label: 'Triglyceride / HDL Ratio', value: ratioTgToHdl.toFixed(2) }
                ]
            };
        }
    },
    // 37. GFR Calculator (Kidney Function eGFR)
    {
        id: 'gfr-calculator',
        name: 'GFR Calculator',
        category: 'health-fitness',
        group: 'Nutrition & Diet',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '246K',
        cpc: '$2.65',
        description: "A GFR Calculator estimates kidney filtration efficiency using serum creatinine and demographic variables. It helps assess kidney function and chronic kidney disease stages. The calculator commonly uses CKD-EPI equations.",
        inputs: [
            { id: 'serumCreatinine', name: 'Serum Creatinine', type: 'number', defaultValue: 1.0, min: 0.1, max: 15.0, step: 0.05, suffix: 'mg/dL', tooltip: 'Blood creatinine level.' },
            { id: 'age', name: 'Patient Age', type: 'number', defaultValue: 50, min: 18, max: 110, step: 1, suffix: 'yrs', tooltip: 'Age.' },
            { id: 'gender', name: 'Biological Sex', type: 'dropdown', defaultValue: 'male', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }], tooltip: 'Biological sex.' }
        ],
        naturalLanguageQueries: ["Calculate my gfr", "What is my gfr?", "Help me work out gfr"],
        edgeCases: ["Acute kidney injury not modeled Extreme muscle mass affecting creatinine Pediatric patients"],
        calculate: (inputs) => {
            const scr = Number(inputs.serumCreatinine) || 1.0;
            const age = Number(inputs.age) || 50;
            const isFemale = inputs.gender === 'female';

            // CKD-EPI 2021 Race-Free Equation
            const kappa = isFemale ? 0.7 : 0.9;
            const alpha = isFemale ? -0.241 : -0.302;
            const sexFactor = isFemale ? 1.012 : 1.0;

            const egfr = 142 * Math.pow(Math.min(scr / kappa, 1), alpha) * Math.pow(Math.max(scr / kappa, 1), -1.200) * Math.pow(0.9938, age) * sexFactor;

            let stage = 'Stage 1: Normal / High Function (eGFR >= 90)';
            if (egfr < 15) stage = 'Stage 5: Kidney Failure (eGFR < 15)';
            else if (egfr < 30) stage = 'Stage 4: Severe Loss (eGFR 15-29)';
            else if (egfr < 60) stage = 'Stage 3: Moderate Loss (eGFR 30-59)';
            else if (egfr < 90) stage = 'Stage 2: Mild Reduction (eGFR 60-89)';

            return {
                primaryOutput: { label: 'Estimated GFR (CKD-EPI 2021)', value: Math.round(egfr), suffix: 'mL/min/1.73m²' },
                secondaryMetrics: [
                    { label: 'CKD Stage Classification', value: stage }
                ]
            };
        }
    },
    // 38. Resting Metabolic Rate Calculator (Katch-McArdle)
    {
        id: 'resting-metabolic-rate-calculator',
        name: 'Resting Metabolic Rate Calculator',
        category: 'health-fitness',
        group: 'Nutrition & Diet',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '15K',
        cpc: '$0.49',
        description: "A Resting Metabolic Rate Calculator estimates calories burned while resting under non-fasting conditions. It is similar to BMR but reflects real-world resting energy use. The calculator helps guide nutrition planning.",
        inputs: [
            { id: 'bodyWeightKg', name: 'Body Weight (kg)', type: 'number', defaultValue: 80, min: 30, max: 250, step: 0.5, suffix: 'kg', tooltip: 'Weight.' },
            { id: 'bodyFatPct', name: 'Body Fat Percentage', type: 'percentage', defaultValue: 15, min: 3, max: 60, step: 0.5, suffix: '%', tooltip: 'Body fat.' }
        ],
        naturalLanguageQueries: ["Calculate my resting metabolic rate", "What is my resting metabolic rate?", "Help me work out resting metabolic rate"],
        edgeCases: ["Missing lean body mass Extremely low calorie states Endocrine disorders"],
        calculate: (inputs) => {
            const w = Number(inputs.bodyWeightKg) || 80;
            const bf = (Number(inputs.bodyFatPct) || 15) / 100;

            const lbmKg = w * (1 - bf);
            // Katch-McArdle Formula: RMR = 370 + (21.6 * LBM in kg)
            const rmr = 370 + (21.6 * lbmKg);

            return {
                primaryOutput: { label: 'Resting Metabolic Rate (RMR)', value: Math.round(rmr), suffix: 'kcal/day' },
                secondaryMetrics: [
                    { label: 'Lean Body Mass (LBM)', value: `${lbmKg.toFixed(1)} kg` },
                    { label: 'Hourly Metabolic Burn', value: `${(rmr / 24).toFixed(1)} kcal/hr` }
                ]
            };
        }
    },
    // 39. Blood Pressure Risk Calculator
    {
        id: 'blood-pressure-risk-calculator',
        name: 'Blood Pressure Risk Calculator',
        category: 'health-fitness',
        group: 'Nutrition & Diet',
        bucket: 'Bucket B',
        tier: 1,
        phase: 4,
        monthlySearches: '40',
        cpc: '$11.47  ★ HIGH CPC',
        description: "A Blood Pressure Risk Calculator classifies blood pressure readings into medical risk categories. It helps users understand hypertension status. The calculator follows standard hypertension guidelines.",
        inputs: [
            { id: 'systolicMmHg', name: 'Systolic Pressure (Top Number)', type: 'number', defaultValue: 120, min: 60, max: 250, step: 1, suffix: 'mmHg', tooltip: 'Pressure during heartbeat.' },
            { id: 'diastolicMmHg', name: 'Diastolic Pressure (Bottom Number)', type: 'number', defaultValue: 80, min: 40, max: 150, step: 1, suffix: 'mmHg', tooltip: 'Pressure at rest between beats.' }
        ],
        naturalLanguageQueries: ["Calculate my blood pressure risk", "What is my blood pressure risk?", "Help me work out blood pressure risk"],
        edgeCases: ["Hypertensive crisis values Inconsistent readings White coat hypertension"],
        calculate: (inputs) => {
            const sys = Number(inputs.systolicMmHg) || 120;
            const dia = Number(inputs.diastolicMmHg) || 80;

            let stage = 'Normal (< 120 and < 80)';
            if (sys > 180 || dia > 120) stage = 'Hypertensive Crisis (Seek Emergency Medical Care)';
            else if (sys >= 140 || dia >= 90) stage = 'Stage 2 Hypertension (>= 140 or >= 90)';
            else if (sys >= 130 || dia >= 80) stage = 'Stage 1 Hypertension (130-139 or 80-89)';
            else if (sys >= 120 && dia < 80) stage = 'Elevated Blood Pressure (120-129 and < 80)';

            const map = dia + (sys - dia) / 3; // Mean Arterial Pressure
            const pulsePressure = sys - dia;

            return {
                primaryOutput: { label: 'AHA / ACC Blood Pressure Category', value: stage },
                secondaryMetrics: [
                    { label: 'Mean Arterial Pressure (MAP)', value: `${map.toFixed(1)} mmHg` },
                    { label: 'Pulse Pressure', value: `${pulsePressure} mmHg` }
                ]
            };
        }
    },
    // 40. Glycemic Index Calculator (Glycemic Load)
    {
        id: 'glycemic-index-calculator',
        name: 'Glycemic Index Calculator',
        category: 'health-fitness',
        group: 'Nutrition & Diet',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '5K',
        cpc: '$1.33',
        description: "A Glycemic Index Calculator estimates how carbohydrate-containing foods affect blood glucose levels. It helps users evaluate blood sugar impact. The calculator may also estimate glycemic load.",
        inputs: [
            { id: 'glycemicIndex', name: 'Food Glycemic Index (GI)', type: 'number', defaultValue: 65, min: 0, max: 120, step: 1, tooltip: 'GI index (0-100 scale relative to glucose).' },
            { id: 'netCarbsGrams', name: 'Net Carbs per Serving (g)', type: 'number', defaultValue: 25, min: 0, max: 200, step: 1, suffix: 'g', tooltip: 'Total carbs minus fiber.' }
        ],
        naturalLanguageQueries: ["Calculate my glycemic index", "What is my glycemic index?", "Help me work out glycemic index"],
        edgeCases: ["Mixed meals not modeled Invalid GI values Fiber adjustments omitted"],
        calculate: (inputs) => {
            const gi = Number(inputs.glycemicIndex) || 65;
            const carbs = Number(inputs.netCarbsGrams) || 25;

            // Glycemic Load = (GI * Net Carbs) / 100
            const gl = (gi * carbs) / 100;

            let glRating = 'Low Glycemic Load (<= 10)';
            if (gl >= 20) glRating = 'High Glycemic Load (>= 20)';
            else if (gl >= 11) glRating = 'Medium Glycemic Load (11 - 19)';

            let giRating = 'Medium GI (56-69)';
            if (gi >= 70) giRating = 'High GI (>= 70)';
            else if (gi <= 55) giRating = 'Low GI (<= 55)';

            return {
                primaryOutput: { label: 'Glycemic Load (GL)', value: gl.toFixed(1) },
                secondaryMetrics: [
                    { label: 'Glycemic Load Impact Rating', value: glRating },
                    { label: 'Glycemic Index Category', value: giRating }
                ]
            };
        }
    },
    // 41. Pace Calculator
    {
        id: 'pace-calculator',
        name: 'Pace Calculator',
        category: 'health-fitness',
        group: 'Fitness & Performance',
        bucket: 'Bucket C1',
        tier: 1,
        phase: 1,
        monthlySearches: '246K',
        cpc: '$0.87',
        description: "A Pace Calculator estimates pace, speed, or finish time based on distance and duration inputs. It helps runners, cyclists, swimmers, and endurance athletes plan workouts and races. The calculator supports multiple pace formats and unit systems.",
        inputs: [
            { id: 'distanceKm', name: 'Distance (Kilometers)', type: 'number', defaultValue: 10, min: 0.1, max: 200, step: 0.1, suffix: 'km', tooltip: 'Total run or bike distance.' },
            { id: 'durationHours', name: 'Time - Hours', type: 'number', defaultValue: 0, min: 0, max: 24, step: 1, suffix: 'hr', tooltip: 'Hours.' },
            { id: 'durationMinutes', name: 'Time - Minutes', type: 'number', defaultValue: 50, min: 0, max: 59, step: 1, suffix: 'min', tooltip: 'Minutes.' },
            { id: 'durationSeconds', name: 'Time - Seconds', type: 'number', defaultValue: 0, min: 0, max: 59, step: 1, suffix: 'sec', tooltip: 'Seconds.' }
        ],
        naturalLanguageQueries: ["Calculate my pace", "What is my pace?", "Help me work out pace"],
        edgeCases: ["Zero distance Time values below realistic thresholds Mixed-unit conversions Negative durations"],
        calculate: (inputs) => {
            const distKm = Math.max(0.01, Number(inputs.distanceKm) || 10);
            const hrs = Number(inputs.durationHours) || 0;
            const mins = Number(inputs.durationMinutes) || 0;
            const secs = Number(inputs.durationSeconds) || 0;
            const totalSecs = (hrs * 3600) + (mins * 60) + secs;

            const distMiles = distKm * 0.621371;
            const secPerKm = totalSecs / distKm;
            const secPerMile = totalSecs / distMiles;

            const formatPace = (totalSec: number) => {
                const m = Math.floor(totalSec / 60);
                const s = Math.floor(totalSec % 60);
                return `${m}:${s < 10 ? '0' : ''}${s}`;
            };

            const speedKmh = (distKm / (totalSecs / 3600)).toFixed(2);
            const speedMph = (distMiles / (totalSecs / 3600)).toFixed(2);

            return {
                primaryOutput: { label: 'Pace per Kilometer', value: `${formatPace(secPerKm)} /km` },
                secondaryMetrics: [
                    { label: 'Pace per Mile', value: `${formatPace(secPerMile)} /mi` },
                    { label: 'Speed in km/h', value: `${speedKmh} km/h` },
                    { label: 'Speed in mph', value: `${speedMph} mph` }
                ]
            };
        }
    },
    // 42. One Rep Max Calculator
    {
        id: 'one-rep-max-calculator',
        name: 'One Rep Max Calculator',
        category: 'health-fitness',
        group: 'Fitness & Performance',
        bucket: 'Bucket C1',
        tier: 1,
        phase: 2,
        monthlySearches: '165K',
        cpc: '$0.56',
        description: "A One Rep Max Calculator estimates the maximum weight a person can lift for a single repetition. It helps athletes design strength training programs and monitor progress. The calculator supports multiple predictive formulas including Epley and Brzycki.",
        inputs: [
            { id: 'liftWeightKg', name: 'Weight Lifted', type: 'number', defaultValue: 100, min: 1, max: 600, step: 2.5, suffix: 'kg/lbs', tooltip: 'Weight used for the working set.' },
            { id: 'repetitions', name: 'Reps Completed', type: 'number', defaultValue: 5, min: 1, max: 12, step: 1, suffix: 'reps', tooltip: 'Best accuracy is 1-10 reps.' }
        ],
        naturalLanguageQueries: ["Calculate my one rep max", "What is my one rep max?", "Help me work out one rep max"],
        edgeCases: ["Repetition counts above recommended predictive range Invalid weights High-rep endurance sets reducing accuracy"],
        calculate: (inputs) => {
            const w = Number(inputs.liftWeightKg) || 100;
            const r = Math.min(12, Math.max(1, Number(inputs.repetitions) || 5));

            if (r === 1) {
                return {
                    primaryOutput: { label: 'Estimated 1 Rep Max (1RM)', value: Math.round(w), suffix: 'kg/lbs' },
                    secondaryMetrics: [
                        { label: '90% 1RM (3 Reps)', value: `${Math.round(w * 0.90)} kg/lbs` },
                        { label: '80% 1RM (8 Reps)', value: `${Math.round(w * 0.80)} kg/lbs` },
                        { label: '70% 1RM (12 Reps)', value: `${Math.round(w * 0.70)} kg/lbs` }
                    ]
                };
            }

            // Brzycki: w / (1.0278 - 0.0278 * r)
            const brzycki = w / (1.0278 - 0.0278 * r);
            // Epley: w * (1 + 0.0333 * r)
            const epley = w * (1 + 0.0333 * r);
            const avg1RM = Math.round((brzycki + epley) / 2);

            return {
                primaryOutput: { label: 'Estimated 1 Rep Max (1RM)', value: avg1RM, suffix: 'kg/lbs' },
                secondaryMetrics: [
                    { label: 'Brzycki Formula 1RM', value: `${Math.round(brzycki)} kg/lbs` },
                    { label: 'Epley Formula 1RM', value: `${Math.round(epley)} kg/lbs` },
                    { label: '90% Training Max (~3-4 reps)', value: `${Math.round(avg1RM * 0.90)} kg/lbs` },
                    { label: '80% Hypertrophy Weight (~8 reps)', value: `${Math.round(avg1RM * 0.80)} kg/lbs` }
                ]
            };
        }
    },
    // 43. Target Heart Rate Calculator
    {
        id: 'target-heart-rate-calculator',
        name: 'Target Heart Rate Calculator',
        category: 'health-fitness',
        group: 'Fitness & Performance',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '12K',
        cpc: '$2.51',
        description: "A Target Heart Rate Calculator estimates ideal exercise heart rate zones for cardiovascular training. It helps optimize workout intensity and endurance development. The calculator commonly uses the Karvonen formula and maximum heart rate methods.",
        inputs: [
            { id: 'age', name: 'Age', type: 'number', defaultValue: 30, min: 15, max: 100, step: 1, suffix: 'yrs', tooltip: 'Age.' },
            { id: 'restingHeartRate', name: 'Resting Heart Rate (BPM)', type: 'number', defaultValue: 65, min: 35, max: 120, step: 1, suffix: 'bpm', tooltip: 'Morning resting pulse.' }
        ],
        naturalLanguageQueries: ["Calculate my target heart rate", "What is my target heart rate?", "Help me work out target heart rate"],
        edgeCases: ["Extremely low resting heart rates in athletes Cardiac medication effects Invalid age ranges"],
        calculate: (inputs) => {
            const age = Number(inputs.age) || 30;
            const rhr = Number(inputs.restingHeartRate) || 65;

            // Gellish formula: HRmax = 207 - (0.7 * age)
            const hrMax = Math.round(207 - (0.7 * age));
            const hrr = hrMax - rhr; // Heart Rate Reserve (Karvonen)

            const karvonen = (pct: number) => Math.round(rhr + (hrr * pct));

            const zone2Low = karvonen(0.60);
            const zone2High = karvonen(0.70);
            const zone4Low = karvonen(0.80);
            const zone4High = karvonen(0.90);

            return {
                primaryOutput: { label: 'Zone 2 Aerobic Base (60-70%)', value: `${zone2Low} - ${zone2High} bpm` },
                secondaryMetrics: [
                    { label: 'Estimated Max Heart Rate (HRmax)', value: `${hrMax} bpm` },
                    { label: 'Zone 1 Recovery (50-60%)', value: `${karvonen(0.50)} - ${karvonen(0.60)} bpm` },
                    { label: 'Zone 3 Tempo / Aerobic (70-80%)', value: `${karvonen(0.70)} - ${karvonen(0.80)} bpm` },
                    { label: 'Zone 4 Threshold (80-90%)', value: `${zone4Low} - ${zone4High} bpm` },
                    { label: 'Zone 5 VO2 Max (90-100%)', value: `${karvonen(0.90)} - ${hrMax} bpm` }
                ]
            };
        }
    },
    // 44. VO2 Max Calculator
    {
        id: 'vo2-max-calculator',
        name: 'VO2 Max Calculator',
        category: 'health-fitness',
        group: 'Fitness & Performance',
        bucket: 'Bucket C1',
        tier: 2,
        phase: 3,
        monthlySearches: '40K',
        cpc: '$0.84',
        description: "A VO2 Max Calculator estimates aerobic fitness capacity and maximal oxygen uptake. It helps evaluate cardiovascular endurance performance. The calculator supports Cooper Test, Rockport Walk Test, and heart-rate-based methods.",
        inputs: [
            { id: 'age', name: 'Age', type: 'number', defaultValue: 30, min: 18, max: 90, step: 1, suffix: 'yrs', tooltip: 'Age.' },
            { id: 'restingHeartRate', name: 'Resting Heart Rate (BPM)', type: 'number', defaultValue: 60, min: 35, max: 120, step: 1, suffix: 'bpm', tooltip: 'Resting pulse.' },
            { id: 'maxHeartRate', name: 'Max Heart Rate (or 0 for estimated)', type: 'number', defaultValue: 186, min: 0, max: 230, step: 1, suffix: 'bpm', tooltip: 'Measured or estimated max HR.' }
        ],
        naturalLanguageQueries: ["Calculate my vo2 max", "What is my vo2 max?", "Help me work out vo2 max"],
        edgeCases: ["Invalid exercise test data Elite athlete values outside norms Medical limitations not considered"],
        calculate: (inputs) => {
            const age = Number(inputs.age) || 30;
            const rhr = Math.max(35, Number(inputs.restingHeartRate) || 60);
            let mhr = Number(inputs.maxHeartRate) || 0;
            if (mhr === 0) {
                mhr = 208 - (0.7 * age);
            }

            // Uth–Sørensen–Overgaard–Pedersen formula: VO2 max = 15.3 * (HRmax / HRrest)
            const vo2max = 15.3 * (mhr / rhr);

            let fitnessCategory = 'Good (Top 40%)';
            if (vo2max >= 52) fitnessCategory = 'Superior / Elite (Top 5%)';
            else if (vo2max >= 45) fitnessCategory = 'Excellent (Top 15%)';
            else if (vo2max >= 38) fitnessCategory = 'Good / Above Average';
            else if (vo2max >= 32) fitnessCategory = 'Fair / Average';
            else fitnessCategory = 'Poor / Below Average';

            return {
                primaryOutput: { label: 'Estimated VO2 Max', value: vo2max.toFixed(1), suffix: 'mL/kg/min' },
                secondaryMetrics: [
                    { label: 'Cardiorespiratory Fitness Rating', value: fitnessCategory },
                    { label: 'Max Heart Rate Used', value: `${Math.round(mhr)} bpm` },
                    { label: 'Resting Heart Rate', value: `${rhr} bpm` }
                ]
            };
        }
    },
    // 45. Running Calorie Calculator
    {
        id: 'running-calorie-calculator',
        name: 'Running Calorie Calculator',
        category: 'health-fitness',
        group: 'Fitness & Performance',
        bucket: 'Bucket C1',
        tier: 3,
        phase: 3,
        monthlySearches: '18K',
        cpc: '$1.89',
        description: "A Running Calorie Calculator estimates calories burned while running based on distance, pace, weight, and duration. It helps runners track energy expenditure. The calculator supports treadmill and outdoor running estimates.",
        inputs: [
            { id: 'bodyWeightKg', name: 'Body Weight (kg)', type: 'number', defaultValue: 75, min: 35, max: 250, step: 0.5, suffix: 'kg', tooltip: 'Runner weight.' },
            { id: 'distanceKm', name: 'Running Distance (km)', type: 'number', defaultValue: 8.0, min: 0.5, max: 100, step: 0.5, suffix: 'km', tooltip: 'Distance completed.' },
            { id: 'durationMinutes', name: 'Running Duration (Minutes)', type: 'number', defaultValue: 45, min: 5, max: 360, step: 1, suffix: 'min', tooltip: 'Total run time.' }
        ],
        naturalLanguageQueries: ["How many calories do I need per day to lose weight?", "Daily calorie needs for 30 year old female 130 lbs moderately active", "What is my TDEE?"],
        edgeCases: ["Unrealistic running speeds GPS inaccuracies Extreme terrain variations"],
        calculate: (inputs) => {
            const w = Number(inputs.bodyWeightKg) || 75;
            const distKm = Number(inputs.distanceKm) || 8.0;
            const mins = Number(inputs.durationMinutes) || 45;

            // Net caloric cost of running is approximately 1.036 kcal / kg / km
            const calories = w * distKm * 1.036;
            const calPerKm = calories / distKm;
            const calPerMin = calories / mins;

            return {
                primaryOutput: { label: 'Total Calories Burned', value: Math.round(calories), suffix: 'kcal' },
                secondaryMetrics: [
                    { label: 'Burn Rate per Kilometer', value: `${calPerKm.toFixed(1)} kcal/km` },
                    { label: 'Burn Rate per Minute', value: `${calPerMin.toFixed(1)} kcal/min` },
                    { label: 'Equivalent Distance in Miles', value: `${(distKm * 0.621371).toFixed(2)} miles` }
                ]
            };
        }
    },
    // 46. Cycling Calorie Calculator
    {
        id: 'cycling-calorie-calculator',
        name: 'Cycling Calorie Calculator',
        category: 'health-fitness',
        group: 'Fitness & Performance',
        bucket: 'Bucket C1',
        tier: 3,
        phase: 3,
        monthlySearches: '10K',
        cpc: '$2.56',
        description: "A Cycling Calorie Calculator estimates calories burned while biking. It supports road cycling, mountain biking, and stationary cycling. The calculator adjusts energy expenditure based on speed and intensity.",
        inputs: [
            { id: 'bodyWeightKg', name: 'Body Weight (kg)', type: 'number', defaultValue: 75, min: 35, max: 250, step: 0.5, suffix: 'kg', tooltip: 'Rider weight.' },
            { id: 'cyclingIntensity', name: 'Cycling Speed / Intensity', type: 'dropdown', defaultValue: 8.0, options: [{ label: 'Leisure / Commute (< 10 mph / 16 km/h - MET 4.0)', value: 4.0 }, { label: 'Moderate Effort (12-13.9 mph / 20-22 km/h - MET 8.0)', value: 8.0 }, { label: 'Vigorous Road (14-15.9 mph / 22-25 km/h - MET 10.0)', value: 10.0 }, { label: 'Fast Racing (16-19 mph / 26-30 km/h - MET 12.0)', value: 12.0 }, { label: 'Peloton / Race (> 20 mph / > 32 km/h - MET 15.8)', value: 15.8 }], tooltip: 'Speed and effort.' },
            { id: 'durationMinutes', name: 'Ride Duration (Minutes)', type: 'number', defaultValue: 60, min: 10, max: 600, step: 5, suffix: 'min', tooltip: 'Duration.' }
        ],
        naturalLanguageQueries: ["How many calories do I need per day to lose weight?", "Daily calorie needs for 30 year old female 130 lbs moderately active", "What is my TDEE?"],
        edgeCases: ["E-bike assistance not modeled Wind resistance ignored Stationary bike variability"],
        calculate: (inputs) => {
            const w = Number(inputs.bodyWeightKg) || 75;
            const met = Number(inputs.cyclingIntensity) || 8.0;
            const mins = Number(inputs.durationMinutes) || 60;

            const calories = (mins * (met * 3.5 * w)) / 200;
            const calPerHour = (calories / mins) * 60;

            return {
                primaryOutput: { label: 'Calories Burned Cycling', value: Math.round(calories), suffix: 'kcal' },
                secondaryMetrics: [
                    { label: 'Hourly Calorie Burn Rate', value: `${Math.round(calPerHour)} kcal/hr` },
                    { label: 'MET Intensity Rating', value: `${met.toFixed(1)} METs` }
                ]
            };
        }
    },
    // 47. Swimming Calorie Calculator
    {
        id: 'swimming-calorie-calculator',
        name: 'Swimming Calorie Calculator',
        category: 'health-fitness',
        group: 'Fitness & Performance',
        bucket: 'Bucket C1',
        tier: 1,
        phase: 4,
        monthlySearches: '3K',
        cpc: '$1.08',
        description: "A Swimming Calorie Calculator estimates energy expenditure during swimming workouts. It supports different strokes and intensities. The calculator helps swimmers monitor workout efficiency.",
        inputs: [
            { id: 'bodyWeightKg', name: 'Body Weight (kg)', type: 'number', defaultValue: 72, min: 35, max: 250, step: 0.5, suffix: 'kg', tooltip: 'Swimmer weight.' },
            { id: 'swimStroke', name: 'Stroke & Intensity', type: 'dropdown', defaultValue: 8.0, options: [{ label: 'Freestyle (Moderate / Laps - MET 8.0)', value: 8.0 }, { label: 'Freestyle (Vigorous Effort - MET 10.0)', value: 10.0 }, { label: 'Breaststroke (General Laps - MET 7.0)', value: 7.0 }, { label: 'Backstroke (Moderate - MET 6.0)', value: 6.0 }, { label: 'Butterfly (Vigorous - MET 13.8)', value: 13.8 }, { label: 'Water Treading / Casual - MET 3.5', value: 3.5 }], tooltip: 'Swimming stroke style.' },
            { id: 'durationMinutes', name: 'Swim Duration (Minutes)', type: 'number', defaultValue: 45, min: 5, max: 240, step: 5, suffix: 'min', tooltip: 'Minutes swimming.' }
        ],
        naturalLanguageQueries: ["How many calories do I need per day to lose weight?", "Daily calorie needs for 30 year old female 130 lbs moderately active", "What is my TDEE?"],
        edgeCases: ["Open water conditions ignored Rest intervals not included Stroke efficiency variability"],
        calculate: (inputs) => {
            const w = Number(inputs.bodyWeightKg) || 72;
            const met = Number(inputs.swimStroke) || 8.0;
            const mins = Number(inputs.durationMinutes) || 45;

            const calories = (mins * (met * 3.5 * w)) / 200;

            return {
                primaryOutput: { label: 'Calories Burned Swimming', value: Math.round(calories), suffix: 'kcal' },
                secondaryMetrics: [
                    { label: 'Caloric Burn Rate', value: `${(calories / mins).toFixed(1)} kcal/min` },
                    { label: 'Hourly Equivalent', value: `${Math.round((calories / mins) * 60)} kcal/hr` }
                ]
            };
        }
    },
    // 48. Walking Calorie Calculator
    {
        id: 'walking-calorie-calculator',
        name: 'Walking Calorie Calculator',
        category: 'health-fitness',
        group: 'Fitness & Performance',
        bucket: 'Bucket C1',
        tier: 2,
        phase: 2,
        monthlySearches: '27K',
        cpc: '$1.04',
        description: "A Walking Calorie Calculator estimates calories burned during walking activities. It supports different walking speeds, inclines, and durations. The calculator is useful for fitness tracking and weight management.",
        inputs: [
            { id: 'bodyWeightKg', name: 'Body Weight (kg)', type: 'number', defaultValue: 75, min: 35, max: 250, step: 0.5, suffix: 'kg', tooltip: 'Weight.' },
            { id: 'walkingSpeed', name: 'Walking Speed / Surface', type: 'dropdown', defaultValue: 3.5, options: [{ label: 'Casual Walk (2.5 mph / 4.0 km/h - MET 3.0)', value: 3.0 }, { label: 'Moderate Pace (3.0 mph / 4.8 km/h - MET 3.5)', value: 3.5 }, { label: 'Brisk Walk (3.5 mph / 5.6 km/h - MET 4.3)', value: 4.3 }, { label: 'Very Brisk (4.0 mph / 6.4 km/h - MET 5.0)', value: 5.0 }, { label: 'Uphill / Incline Walk (3.5 mph at 5% grade - MET 6.0)', value: 6.0 }], tooltip: 'Walking speed.' },
            { id: 'durationMinutes', name: 'Walking Duration (Minutes)', type: 'number', defaultValue: 60, min: 10, max: 360, step: 5, suffix: 'min', tooltip: 'Walk duration.' }
        ],
        naturalLanguageQueries: ["How many calories do I need per day to lose weight?", "Daily calorie needs for 30 year old female 130 lbs moderately active", "What is my TDEE?"],
        edgeCases: ["Mobility limitations Uneven terrain not modeled Extremely slow walking speeds"],
        calculate: (inputs) => {
            const w = Number(inputs.bodyWeightKg) || 75;
            const met = Number(inputs.walkingSpeed) || 3.5;
            const mins = Number(inputs.durationMinutes) || 60;

            const calories = (mins * (met * 3.5 * w)) / 200;

            return {
                primaryOutput: { label: 'Calories Burned Walking', value: Math.round(calories), suffix: 'kcal' },
                secondaryMetrics: [
                    { label: 'Caloric Burn Rate', value: `${(calories / mins).toFixed(1)} kcal/min` },
                    { label: 'Estimated Steps (at ~110 steps/min)', value: `${mins * 110} Steps` }
                ]
            };
        }
    },
    // 49. Steps to Calories Calculator
    {
        id: 'steps-to-calories-calculator',
        name: 'Steps to Calories Calculator',
        category: 'health-fitness',
        group: 'Fitness & Performance',
        bucket: 'Bucket C1',
        tier: 3,
        phase: 3,
        monthlySearches: '18K',
        cpc: '$0.71',
        description: "A Steps to Calories Calculator estimates calories burned based on step count, body weight, and walking intensity. It helps users translate daily movement into energy expenditure. The calculator is commonly integrated into pedometer and fitness apps.",
        inputs: [
            { id: 'stepCount', name: 'Total Steps', type: 'number', defaultValue: 10000, min: 500, max: 100000, step: 500, suffix: 'steps', tooltip: 'Daily or workout step count.' },
            { id: 'bodyWeightKg', name: 'Body Weight (kg)', type: 'number', defaultValue: 75, min: 35, max: 250, step: 0.5, suffix: 'kg', tooltip: 'Body weight.' }
        ],
        naturalLanguageQueries: ["How many calories do I need per day to lose weight?", "Daily calorie needs for 30 year old female 130 lbs moderately active", "What is my TDEE?"],
        edgeCases: ["Inaccurate step trackers Individual gait differences Very short or long step lengths"],
        calculate: (inputs) => {
            const steps = Number(inputs.stepCount) || 10000;
            const w = Number(inputs.bodyWeightKg) || 75;

            // Approx 0.04 to 0.05 kcal per step per 70kg person => (w / 70) * 0.045 * steps
            const calories = (w / 70) * 0.045 * steps;
            const distanceKm = (steps * 0.762) / 1000; // avg 0.762m (30 in) per step
            const distanceMiles = distanceKm * 0.621371;

            return {
                primaryOutput: { label: 'Calories Burned from Steps', value: Math.round(calories), suffix: 'kcal' },
                secondaryMetrics: [
                    { label: 'Equivalent Distance Walked', value: `${distanceKm.toFixed(2)} km (${distanceMiles.toFixed(2)} miles)` },
                    { label: 'Caloric Burn per 1,000 Steps', value: `${((calories / steps) * 1000).toFixed(1)} kcal` }
                ]
            };
        }
    },
    // 50. Steps to Miles Calculator
    {
        id: 'steps-to-miles-calculator',
        name: 'Steps to Miles Calculator',
        category: 'health-fitness',
        group: 'Fitness & Performance',
        bucket: 'Bucket C1',
        tier: 3,
        phase: 3,
        monthlySearches: '15K',
        cpc: '$0.22',
        description: "A Steps to Miles Calculator converts walking or running step counts into estimated travel distance. It helps users interpret pedometer data. The calculator supports personalized stride lengths.",
        inputs: [
            { id: 'stepCount', name: 'Step Count', type: 'number', defaultValue: 10000, min: 100, max: 100000, step: 500, suffix: 'steps', tooltip: 'Total steps recorded.' },
            { id: 'heightCm', name: 'Height (cm)', type: 'number', defaultValue: 175, min: 120, max: 230, step: 1, suffix: 'cm', tooltip: 'Used to calculate personalized stride length.' },
            { id: 'gender', name: 'Biological Sex', type: 'dropdown', defaultValue: 'male', options: [{ label: 'Male (Stride ratio 0.415)', value: 'male' }, { label: 'Female (Stride ratio 0.413)', value: 'female' }], tooltip: 'Sex.' }
        ],
        naturalLanguageQueries: ["Calculate my steps to miles", "What is my steps to miles?", "Help me work out steps to miles"],
        edgeCases: ["Variable stride length during running Invalid step lengths Activity tracker inaccuracies"],
        calculate: (inputs) => {
            const steps = Number(inputs.stepCount) || 10000;
            const h = Number(inputs.heightCm) || 175;
            const isMale = inputs.gender === 'male';

            // Stride length = height * ratio
            const strideRatio = isMale ? 0.415 : 0.413;
            const strideCm = h * strideRatio;
            const totalMeters = (steps * strideCm) / 100;
            const totalKm = totalMeters / 1000;
            const totalMiles = totalKm * 0.621371;

            return {
                primaryOutput: { label: 'Distance in Miles', value: `${totalMiles.toFixed(2)} Miles` },
                secondaryMetrics: [
                    { label: 'Distance in Kilometers', value: `${totalKm.toFixed(2)} km` },
                    { label: 'Personalized Stride Length', value: `${strideCm.toFixed(1)} cm (${(strideCm / 2.54).toFixed(1)} inches)` },
                    { label: 'Steps per Mile', value: `${Math.round(steps / totalMiles)} steps/mile` }
                ]
            };
        }
    },
    // 51. Running Pace Calculator
    {
        id: 'running-pace-calculator',
        name: 'Running Pace Calculator',
        category: 'health-fitness',
        group: 'Fitness & Performance',
        bucket: 'Bucket C1',
        tier: 2,
        phase: 2,
        monthlySearches: '74K',
        cpc: '$2.32',
        description: "A Running Pace Calculator estimates pace, split times, and race finish times for runners. It helps athletes optimize race strategies. The calculator supports marathon, half-marathon, and custom distances.",
        inputs: [
            { id: 'raceDistance', name: 'Race / Run Distance', type: 'dropdown', defaultValue: 5.0, options: [{ label: '5K (5.0 km / 3.11 miles)', value: 5.0 }, { label: '10K (10.0 km / 6.21 miles)', value: 10.0 }, { label: 'Half Marathon (21.0975 km / 13.11 miles)', value: 21.0975 }, { label: 'Marathon (42.195 km / 26.22 miles)', value: 42.195 }], tooltip: 'Select distance.' },
            { id: 'targetHours', name: 'Target Finish - Hours', type: 'number', defaultValue: 0, min: 0, max: 12, step: 1, suffix: 'hr', tooltip: 'Target hours.' },
            { id: 'targetMinutes', name: 'Target Finish - Minutes', type: 'number', defaultValue: 25, min: 0, max: 59, step: 1, suffix: 'min', tooltip: 'Target minutes.' },
            { id: 'targetSeconds', name: 'Target Finish - Seconds', type: 'number', defaultValue: 0, min: 0, max: 59, step: 1, suffix: 'sec', tooltip: 'Target seconds.' }
        ],
        naturalLanguageQueries: ["Calculate my running pace", "What is my running pace?", "Help me work out running pace"],
        edgeCases: ["Unrealistically fast paces Negative time values Unit mismatches"],
        calculate: (inputs) => {
            const distKm = Number(inputs.raceDistance) || 5.0;
            const h = Number(inputs.targetHours) || 0;
            const m = Number(inputs.targetMinutes) || 0;
            const s = Number(inputs.targetSeconds) || 0;
            const totalSecs = (h * 3600) + (m * 60) + s;

            const distMiles = distKm * 0.621371;
            const secPerKm = totalSecs / distKm;
            const secPerMile = totalSecs / distMiles;
            const secPer400m = (secPerKm * 0.4);

            const formatTime = (secs: number) => {
                const min = Math.floor(secs / 60);
                const sec = Math.floor(secs % 60);
                return `${min}:${sec < 10 ? '0' : ''}${sec}`;
            };

            return {
                primaryOutput: { label: 'Required Mile Pace', value: `${formatTime(secPerMile)} /mile` },
                secondaryMetrics: [
                    { label: 'Required Kilometer Pace', value: `${formatTime(secPerKm)} /km` },
                    { label: 'Track 400m Lap Split', value: `${formatTime(secPer400m)} /lap` },
                    { label: 'Average Running Speed', value: `${(distKm / (totalSecs / 3600)).toFixed(2)} km/h (${(distMiles / (totalSecs / 3600)).toFixed(2)} mph)` }
                ]
            };
        }
    },
    // 52. Swim Pace Calculator
    {
        id: 'swim-pace-calculator',
        name: 'Swim Pace Calculator',
        category: 'health-fitness',
        group: 'Fitness & Performance',
        bucket: 'Bucket C1',
        tier: 3,
        phase: 5,
        monthlySearches: '7K',
        cpc: '$2.14',
        description: "A Swim Pace Calculator estimates swimming pace per 100 meters or yards. It helps swimmers plan intervals and race pacing. The calculator supports pool and open-water training.",
        inputs: [
            { id: 'distanceMeters', name: 'Total Swim Distance (Meters)', type: 'number', defaultValue: 1500, min: 50, max: 20000, step: 50, suffix: 'm', tooltip: 'Total distance swum.' },
            { id: 'durationMinutes', name: 'Swim Time - Minutes', type: 'number', defaultValue: 30, min: 0, max: 300, step: 1, suffix: 'min', tooltip: 'Minutes.' },
            { id: 'durationSeconds', name: 'Swim Time - Seconds', type: 'number', defaultValue: 0, min: 0, max: 59, step: 1, suffix: 'sec', tooltip: 'Seconds.' }
        ],
        naturalLanguageQueries: ["Calculate my swim pace", "What is my swim pace?", "Help me work out swim pace"],
        edgeCases: ["Open-water current variations Pool-length conversion errors Very short swim distances"],
        calculate: (inputs) => {
            const dist = Math.max(25, Number(inputs.distanceMeters) || 1500);
            const m = Number(inputs.durationMinutes) || 30;
            const s = Number(inputs.durationSeconds) || 0;
            const totalSecs = (m * 60) + s;

            const hundredMetersCount = dist / 100;
            const secPer100m = totalSecs / hundredMetersCount;
            const secPer50m = secPer100m / 2;

            const formatTime = (secs: number) => {
                const min = Math.floor(secs / 60);
                const sec = Math.floor(secs % 60);
                return `${min}:${sec < 10 ? '0' : ''}${sec}`;
            };

            return {
                primaryOutput: { label: 'Pace per 100m', value: `${formatTime(secPer100m)} / 100m` },
                secondaryMetrics: [
                    { label: 'Split per 50m Lap', value: `${formatTime(secPer50m)} / 50m` },
                    { label: 'Swim Speed (km/h)', value: `${((dist / 1000) / (totalSecs / 3600)).toFixed(2)} km/h` },
                    { label: 'Estimated 1500m Olympic Split', value: formatTime(secPer100m * 15) }
                ]
            };
        }
    },
    // 53. Cycling Power Calculator
    {
        id: 'cycling-power-calculator',
        name: 'Cycling Power Calculator',
        category: 'health-fitness',
        group: 'Fitness & Performance',
        bucket: 'Bucket C1',
        tier: 1,
        phase: 4,
        monthlySearches: '1K',
        cpc: '$3.21',
        description: "A Cycling Power Calculator estimates power output required for cycling performance based on speed, weight, terrain, and resistance. It helps cyclists optimize training and pacing. The calculator is commonly used in road cycling and triathlon training.",
        inputs: [
            { id: 'riderWeightKg', name: 'Rider Weight (kg)', type: 'number', defaultValue: 75, min: 35, max: 200, step: 0.5, suffix: 'kg', tooltip: 'Rider body mass.' },
            { id: 'bikeWeightKg', name: 'Bike + Gear Weight (kg)', type: 'number', defaultValue: 9, min: 5, max: 30, step: 0.5, suffix: 'kg', tooltip: 'Bike and equipment weight.' },
            { id: 'speedKmh', name: 'Speed (km/h)', type: 'number', defaultValue: 30, min: 5, max: 70, step: 1, suffix: 'km/h', tooltip: 'Riding speed.' },
            { id: 'gradientPct', name: 'Hill Gradient / Slope (%)', type: 'percentage', defaultValue: 3.0, min: -15, max: 25, step: 0.5, suffix: '%', tooltip: 'Road slope (e.g. 3% grade).' }
        ],
        naturalLanguageQueries: ["Calculate my cycling power", "What is my cycling power?", "Help me work out cycling power"],
        edgeCases: ["Extreme wind conditions Negative gradients downhill Drafting effects ignored Unrealistic speeds"],
        calculate: (inputs) => {
            const rw = Number(inputs.riderWeightKg) || 75;
            const bw = Number(inputs.bikeWeightKg) || 9;
            const speedKmh = Number(inputs.speedKmh) || 30;
            const slope = (Number(inputs.gradientPct) || 3.0) / 100;

            const totalM = rw + bw;
            const v = speedKmh / 3.6; // m/s

            // Rolling resistance: Crr * m * g * v (Crr ~ 0.004)
            const pRolling = 0.004 * totalM * 9.81 * v;
            // Gravity power: m * g * slope * v
            const pGravity = totalM * 9.81 * slope * v;
            // Aerodynamic drag: 0.5 * CdA * rho * v^3 (CdA ~ 0.32 m^2, rho ~ 1.225)
            const pAero = 0.5 * 0.32 * 1.225 * Math.pow(v, 3);
            // Drivetrain loss ~ 3%
            const rawPower = pRolling + pGravity + pAero;
            const totalWatts = Math.max(10, Math.round(rawPower / 0.97));
            const wattsPerKg = (totalWatts / rw).toFixed(2);

            return {
                primaryOutput: { label: 'Estimated Power Required', value: totalWatts, suffix: 'Watts' },
                secondaryMetrics: [
                    { label: 'Power-to-Weight Ratio', value: `${wattsPerKg} W/kg` },
                    { label: 'Climbing Component', value: `${Math.round(pGravity)} W` },
                    { label: 'Aerodynamic Drag Component', value: `${Math.round(pAero)} W` },
                    { label: 'Rolling Resistance Component', value: `${Math.round(pRolling)} W` }
                ]
            };
        }
    },
    // 54. Pregnancy Calculator
    {
        id: 'pregnancy-calculator',
        name: 'Pregnancy Calculator',
        category: 'health-fitness',
        group: 'Women\'s Health & Medical',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '1.0M',
        cpc: '$0.80',
        description: "A Pregnancy Calculator estimates important pregnancy milestones including gestational age, expected due date, trimester progression, and fetal development timeline. It helps expectant parents track pregnancy progress using standard obstetric calculations. The calculator commonly uses the first day of the last menstrual period (LMP), conception date, IVF transfer date, or ultrasound dating.",
        inputs: [
            { id: 'weeksPregnant', name: 'Gestational Age (Current Weeks)', type: 'number', defaultValue: 14, min: 1, max: 42, step: 1, suffix: 'weeks', tooltip: 'Current weeks completed.' },
            { id: 'cycleLengthDays', name: 'Average Menstrual Cycle Length', type: 'number', defaultValue: 28, min: 21, max: 40, step: 1, suffix: 'days', tooltip: 'Days between cycles.' }
        ],
        naturalLanguageQueries: ["Calculate my pregnancy", "What is my pregnancy?", "Help me work out pregnancy"],
        edgeCases: ["Irregular menstrual cycles Missing LMP date IVF pregnancies with adjusted dating Premature or post-term pregnancies Ultrasound dates conflicting with LMP Leap y"],
        calculate: (inputs) => {
            const w = Number(inputs.weeksPregnant) || 14;
            const cycle = Number(inputs.cycleLengthDays) || 28;

            const remainingWeeks = Math.max(0, 40 - w);
            const remainingDays = remainingWeeks * 7;
            const totalDaysGestational = w * 7;

            let trimester = 'First Trimester (Weeks 1 - 13)';
            if (w >= 28) trimester = 'Third Trimester (Weeks 28 - 40+)';
            else if (w >= 14) trimester = 'Second Trimester (Weeks 14 - 27)';

            const fetalLengthCm = (w * 1.2).toFixed(1);
            const fetalWeightGrams = Math.round(Math.pow(w, 2.8) * 0.15);

            return {
                primaryOutput: { label: 'Current Trimester', value: trimester },
                secondaryMetrics: [
                    { label: 'Weeks Remaining to Due Date', value: `${remainingWeeks} Weeks (${remainingDays} Days)` },
                    { label: 'Approximate Fetal Length', value: `~${fetalLengthCm} cm` },
                    { label: 'Approximate Fetal Weight', value: `~${fetalWeightGrams} g` }
                ]
            };
        }
    },
    // 55. Pregnancy Weight Gain Calculator
    {
        id: 'pregnancy-weight-gain-calculator',
        name: 'Pregnancy Weight Gain Calculator',
        category: 'health-fitness',
        group: 'Women\'s Health & Medical',
        bucket: 'Bucket C1',
        tier: 2,
        phase: 2,
        monthlySearches: '27K',
        cpc: '$1.64',
        description: "A Pregnancy Weight Gain Calculator estimates recommended weight gain ranges during pregnancy based on pre-pregnancy BMI and gestational age. It helps monitor healthy maternal and fetal development. The calculator follows Institute of Medicine (IOM) pregnancy weight gain guidelines.",
        inputs: [
            { id: 'prePregnancyBmi', name: 'Pre-Pregnancy BMI', type: 'number', defaultValue: 22.5, min: 15, max: 50, step: 0.1, tooltip: 'BMI before pregnancy.' },
            { id: 'currentWeek', name: 'Current Gestational Week', type: 'number', defaultValue: 24, min: 1, max: 40, step: 1, suffix: 'week', tooltip: 'Current week.' },
            { id: 'currentGainKg', name: 'Total Weight Gained So Far (kg)', type: 'number', defaultValue: 7, min: 0, max: 40, step: 0.5, suffix: 'kg', tooltip: 'Weight gained.' }
        ],
        naturalLanguageQueries: ["Calculate my pregnancy weight gain", "What is my pregnancy weight gain?", "Help me work out pregnancy weight gain"],
        edgeCases: ["Twin or multiple pregnancies Extreme pre-pregnancy BMI values Rapid abnormal weight gain Fluid retention/swelling distortions Missing pre-pregnancy weight"],
        calculate: (inputs) => {
            const bmi = Number(inputs.prePregnancyBmi) || 22.5;
            const week = Number(inputs.currentWeek) || 24;
            const gain = Number(inputs.currentGainKg) || 7;

            // Institute of Medicine (IOM) guidelines:
            // Underweight (<18.5): 12.5 - 18 kg (28-40 lbs)
            // Normal (18.5-24.9): 11.5 - 16 kg (25-35 lbs)
            // Overweight (25-29.9): 7 - 11.5 kg (15-25 lbs)
            // Obese (>=30): 5 - 9 kg (11-20 lbs)
            let minTotal = 11.5, maxTotal = 16.0, weeklyRate = 0.42;
            if (bmi < 18.5) { minTotal = 12.5; maxTotal = 18.0; weeklyRate = 0.45; }
            else if (bmi >= 30) { minTotal = 5.0; maxTotal = 9.0; weeklyRate = 0.22; }
            else if (bmi >= 25) { minTotal = 7.0; maxTotal = 11.5; weeklyRate = 0.28; }

            // Expected gain at current week: ~1.5kg in 1st tri (first 13 weeks), then weeklyRate thereafter
            const expectedGain = week <= 13 ? (week / 13) * 1.5 : 1.5 + ((week - 13) * weeklyRate);

            return {
                primaryOutput: { label: 'Recommended Total Pregnancy Gain', value: `${minTotal} - ${maxTotal} kg`, suffix: `(${Math.round(minTotal * 2.20462)} - ${Math.round(maxTotal * 2.20462)} lbs)` },
                secondaryMetrics: [
                    { label: 'Expected Gain at Current Week', value: `~${expectedGain.toFixed(1)} kg (${(expectedGain * 2.20462).toFixed(1)} lbs)` },
                    { label: 'Your Current Gain', value: `${gain.toFixed(1)} kg` },
                    { label: '2nd & 3rd Trimester Rate Guideline', value: `~${weeklyRate.toFixed(2)} kg / week` }
                ]
            };
        }
    },
    // 56. Pregnancy Conception Calculator
    {
        id: 'pregnancy-conception-calculator',
        name: 'Pregnancy Conception Calculator',
        category: 'health-fitness',
        group: 'Women\'s Health & Medical',
        bucket: 'Bucket B',
        tier: 1,
        phase: 3,
        monthlySearches: '4K',
        cpc: '$1.88',
        description: "A Pregnancy Conception Calculator estimates likely conception date based on due date, gestational age, or LMP. It helps identify the approximate time fertilization occurred. The calculator is commonly used for pregnancy dating and fertility tracking.",
        inputs: [
            { id: 'gestationalWeeks', name: 'Gestational Age from Ultrasound/LMP', type: 'number', defaultValue: 12, min: 4, max: 42, step: 1, suffix: 'weeks', tooltip: 'Weeks pregnant.' }
        ],
        naturalLanguageQueries: ["Calculate my pregnancy conception", "What is my pregnancy conception?", "Help me work out pregnancy conception"],
        edgeCases: ["IVF conception timing Irregular ovulation cycles Unknown LMP Ultrasound dating conflicts"],
        calculate: (inputs) => {
            const weeks = Number(inputs.gestationalWeeks) || 12;

            // Conception occurs approximately 2 weeks after LMP (gestational age - 2 weeks)
            const fetalAgeWeeks = Math.max(0, weeks - 2);
            const daysAgoConceived = fetalAgeWeeks * 7;

            return {
                primaryOutput: { label: 'Estimated Conception Timeline', value: `~${daysAgoConceived} Days Ago`, suffix: `(${fetalAgeWeeks} weeks fetal age)` },
                secondaryMetrics: [
                    { label: 'True Embryonic / Fetal Age', value: `${fetalAgeWeeks} Weeks` },
                    { label: 'Clinical Gestational Age', value: `${weeks} Weeks` },
                    { label: 'Estimated Due Date Countdown', value: `~${Math.max(0, 40 - weeks)} Weeks Remaining` }
                ]
            };
        }
    },
    // 57. Due Date Calculator
    {
        id: 'due-date-calculator',
        name: 'Due Date Calculator',
        category: 'health-fitness',
        group: 'Women\'s Health & Medical',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '673K',
        cpc: '$0.28',
        description: "A Due Date Calculator estimates expected delivery date based on menstrual cycle information or conception date. It helps track pregnancy progression and prenatal milestones. The calculator primarily uses Naegele\u2019s Rule.",
        inputs: [
            { id: 'daysSinceLmp', name: 'Days Since First Day of Last Period (LMP)', type: 'number', defaultValue: 70, min: 1, max: 300, step: 1, suffix: 'days', tooltip: 'Days since last period began.' },
            { id: 'cycleLength', name: 'Average Cycle Length', type: 'number', defaultValue: 28, min: 21, max: 40, step: 1, suffix: 'days', tooltip: 'Cycle length.' }
        ],
        naturalLanguageQueries: ["How many days between January 1 and December 31?", "Calculate time between two dates", "How many weeks until Christmas?"],
        edgeCases: ["Premature labor likelihood not modeled Post-term pregnancy ranges IVF adjustments Irregular menstrual cycles"],
        calculate: (inputs) => {
            const daysLmp = Number(inputs.daysSinceLmp) || 70;
            const cycle = Number(inputs.cycleLength) || 28;

            // Naegele's rule adjusted for cycle length: 280 + (cycle - 28)
            const totalDaysToDue = 280 + (cycle - 28);
            const daysRemaining = Math.max(0, totalDaysToDue - daysLmp);
            const weeksPregnant = Math.floor(daysLmp / 7);
            const daysExtra = daysLmp % 7;

            return {
                primaryOutput: { label: 'Estimated Days Until Due Date', value: `${daysRemaining} Days`, suffix: `(~${Math.round(daysRemaining / 7)} Weeks)` },
                secondaryMetrics: [
                    { label: 'Current Gestational Age', value: `${weeksPregnant} Weeks, ${daysExtra} Days` },
                    { label: 'Full Term Duration', value: `${totalDaysToDue} Days (40 Weeks)` },
                    { label: 'End of 1st Trimester Milestone', value: daysLmp >= 91 ? 'Completed' : `In ${91 - daysLmp} days` }
                ]
            };
        }
    },
    // 58. Ovulation Calculator
    {
        id: 'ovulation-calculator',
        name: 'Ovulation Calculator',
        category: 'health-fitness',
        group: 'Women\'s Health & Medical',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '823K',
        cpc: '$1.38',
        description: "An Ovulation Calculator estimates the most likely ovulation day and fertile period based on menstrual cycle data. It helps individuals plan conception or fertility awareness. The calculator assumes ovulation occurs roughly 14 days before the next period.",
        inputs: [
            { id: 'cycleLengthDays', name: 'Average Menstrual Cycle Length', type: 'number', defaultValue: 28, min: 21, max: 45, step: 1, suffix: 'days', tooltip: 'Days from first day of period to next.' },
            { id: 'lutealPhaseDays', name: 'Luteal Phase Length (Default 14)', type: 'number', defaultValue: 14, min: 10, max: 16, step: 1, suffix: 'days', tooltip: 'Days from ovulation to period.' }
        ],
        naturalLanguageQueries: ["Calculate my ovulation", "What is my ovulation?", "Help me work out ovulation"],
        edgeCases: ["Highly irregular cycles PCOS or ovulatory disorders Hormonal contraception users Stress-related cycle variation"],
        calculate: (inputs) => {
            const cycle = Number(inputs.cycleLengthDays) || 28;
            const luteal = Number(inputs.lutealPhaseDays) || 14;

            const ovulationDay = cycle - luteal; // e.g. Day 14 for 28-day cycle
            const fertileStart = Math.max(1, ovulationDay - 5);
            const fertileEnd = ovulationDay + 1;

            return {
                primaryOutput: { label: 'Most Likely Ovulation Day', value: `Day ${ovulationDay} of Cycle` },
                secondaryMetrics: [
                    { label: 'Fertile Window (6 Days)', value: `Cycle Days ${fertileStart} to ${fertileEnd}` },
                    { label: 'Peak Fertility Days (O-2, O-1, O)', value: `Cycle Days ${ovulationDay - 2}, ${ovulationDay - 1}, ${ovulationDay}` },
                    { label: 'Next Cycle Expected On', value: `Day ${cycle + 1}` }
                ]
            };
        }
    },
    // 59. Conception Calculator
    {
        id: 'conception-calculator',
        name: 'Conception Calculator',
        category: 'health-fitness',
        group: 'Women\'s Health & Medical',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '90K',
        cpc: '$1.45',
        description: "A Conception Calculator estimates probable conception timing based on due date, ovulation timing, or menstrual cycle data. It helps users identify the likely fertilization window. The calculator is frequently paired with fertility and pregnancy planning tools.",
        inputs: [
            { id: 'cycleLengthDays', name: 'Average Cycle Length', type: 'number', defaultValue: 28, min: 21, max: 45, step: 1, suffix: 'days', tooltip: 'Cycle length.' }
        ],
        naturalLanguageQueries: ["Calculate my conception", "What is my conception?", "Help me work out conception"],
        edgeCases: ["Irregular ovulation Assisted reproductive treatments Multiple conception possibilities Unknown cycle history"],
        calculate: (inputs) => {
            const cycle = Number(inputs.cycleLengthDays) || 28;
            const ovulationDay = cycle - 14;

            return {
                primaryOutput: { label: 'Optimal Conception Window', value: `Days ${ovulationDay - 3} to ${ovulationDay + 1}` },
                secondaryMetrics: [
                    { label: 'Peak Intercourse Timing for Conception', value: `Day ${ovulationDay - 1} and Day ${ovulationDay}` },
                    { label: 'Sperm Viability Window in Reproductive Tract', value: 'Up to 5 Days' },
                    { label: 'Egg Viability Window Post-Ovulation', value: '12 - 24 Hours' }
                ]
            };
        }
    },
    // 60. Period Calculator
    {
        id: 'period-calculator',
        name: 'Period Calculator',
        category: 'health-fitness',
        group: 'Women\'s Health & Medical',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '246K',
        cpc: '$1.10',
        description: "A Period Calculator predicts future menstrual periods based on historical cycle information. It helps users track cycle regularity and reproductive health. The calculator supports recurring cycle forecasting.",
        inputs: [
            { id: 'cycleLengthDays', name: 'Average Menstrual Cycle Length', type: 'number', defaultValue: 28, min: 21, max: 45, step: 1, suffix: 'days', tooltip: 'Average days between period start dates.' },
            { id: 'periodDurationDays', name: 'Period Bleeding Duration', type: 'number', defaultValue: 5, min: 2, max: 10, step: 1, suffix: 'days', tooltip: 'Days of menstrual bleeding.' },
            { id: 'daysSincePeriodStart', name: 'Days Since Last Period Started', type: 'number', defaultValue: 10, min: 0, max: 60, step: 1, suffix: 'days', tooltip: 'Current cycle day minus 1.' }
        ],
        naturalLanguageQueries: ["Calculate my period", "What is my period?", "Help me work out period"],
        edgeCases: ["Irregular menstrual cycles Missed periods Hormonal contraception changes Pregnancy-related interruptions"],
        calculate: (inputs) => {
            const cycle = Number(inputs.cycleLengthDays) || 28;
            const duration = Number(inputs.periodDurationDays) || 5;
            const daysSince = Number(inputs.daysSincePeriodStart) || 10;

            const daysUntilNextPeriod = Math.max(0, cycle - daysSince);
            const currentCycleDay = daysSince + 1;

            return {
                primaryOutput: { label: 'Days Until Next Period', value: `${daysUntilNextPeriod} Days` },
                secondaryMetrics: [
                    { label: 'Current Cycle Day', value: `Day ${currentCycleDay} of ${cycle}` },
                    { label: 'Upcoming Period Bleeding Window', value: `${duration} Days Duration` },
                    { label: 'Estimated Next Period Cycle Length', value: `${cycle} Days` }
                ]
            };
        }
    },
    // 61. Fertile Window Calculator
    {
        id: 'fertile-window-calculator',
        name: 'Fertile Window Calculator',
        category: 'health-fitness',
        group: 'Women\'s Health & Medical',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '12K',
        cpc: '$1.35',
        description: "A Fertile Window Calculator estimates the days during a menstrual cycle when conception is most likely. It helps individuals maximize or avoid pregnancy chances. The calculator is based on sperm survival and ovulation timing.",
        inputs: [
            { id: 'cycleLengthDays', name: 'Average Cycle Length', type: 'number', defaultValue: 28, min: 21, max: 45, step: 1, suffix: 'days', tooltip: 'Cycle length.' },
            { id: 'currentCycleDay', name: 'Current Cycle Day (Day 1 = Period Start)', type: 'number', defaultValue: 11, min: 1, max: 45, step: 1, suffix: 'day', tooltip: 'Current day of cycle.' }
        ],
        naturalLanguageQueries: ["Calculate my fertile window", "What is my fertile window?", "Help me work out fertile window"],
        edgeCases: ["Irregular cycles reducing accuracy Ovulation disorders Hormonal medication use Stress or illness affecting ovulation"],
        calculate: (inputs) => {
            const cycle = Number(inputs.cycleLengthDays) || 28;
            const currentDay = Number(inputs.currentCycleDay) || 11;

            const ovulationDay = cycle - 14;
            const fertileStart = ovulationDay - 5;
            const fertileEnd = ovulationDay + 1;

            let status = 'Low Probability of Conception';
            if (currentDay >= fertileStart && currentDay <= fertileEnd) {
                if (currentDay === ovulationDay || currentDay === ovulationDay - 1 || currentDay === ovulationDay - 2) {
                    status = 'PEAK Fertility (Highest Conception Chance)';
                } else {
                    status = 'High Fertility Window';
                }
            }

            return {
                primaryOutput: { label: 'Current Conception Likelihood', value: status },
                secondaryMetrics: [
                    { label: 'Fertile Window Span', value: `Days ${fertileStart} - ${fertileEnd} of Cycle` },
                    { label: 'Ovulation Day', value: `Day ${ovulationDay}` },
                    { label: 'Days Remaining in Fertile Window', value: currentDay <= fertileEnd ? `${Math.max(0, fertileEnd - currentDay)} Days` : '0 Days (Window Closed)' }
                ]
            };
        }
    },
    // 62. Trimester Calculator
    {
        id: 'trimester-calculator',
        name: 'Trimester Calculator',
        category: 'health-fitness',
        group: 'Women\'s Health & Medical',
        bucket: 'Bucket B',
        tier: 1,
        phase: 3,
        monthlySearches: '2K',
        cpc: '$6.28  ★ HIGH CPC',
        description: "A Trimester Calculator determines which pregnancy trimester a person is currently in based on gestational age or due date. It helps organize prenatal milestones and medical scheduling. The calculator provides trimester transition dates and pregnancy progress tracking.",
        inputs: [
            { id: 'gestationalWeek', name: 'Current Week of Pregnancy', type: 'number', defaultValue: 20, min: 1, max: 42, step: 1, suffix: 'week', tooltip: 'Current pregnancy week.' }
        ],
        naturalLanguageQueries: ["Calculate my trimester", "What is my trimester?", "Help me work out trimester"],
        edgeCases: ["Post-term pregnancies beyond 42 weeks Incorrect pregnancy dating IVF pregnancies with adjusted gestational age Missing LMP information"],
        calculate: (inputs) => {
            const w = Number(inputs.gestationalWeek) || 20;

            let trim = 'First Trimester (Weeks 1 to 13)';
            let focus = 'Major organogenesis, embryonic development, early ultrasounds, genetic screening.';
            let weeksInTrim = w;

            if (w >= 28) {
                trim = 'Third Trimester (Weeks 28 to 40+)';
                focus = 'Rapid fetal growth, lung maturation, kick counts, birth preparation.';
                weeksInTrim = w - 27;
            } else if (w >= 14) {
                trim = 'Second Trimester (Weeks 14 to 27)';
                focus = 'Anatomy scan (20 weeks), fetal movement felt, energy returning, glucose screening.';
                weeksInTrim = w - 13;
            }

            return {
                primaryOutput: { label: 'Current Trimester', value: trim },
                secondaryMetrics: [
                    { label: 'Progress in Current Trimester', value: `Week ${weeksInTrim} of trimester` },
                    { label: 'Clinical Focus & Milestones', value: focus },
                    { label: 'Full Term Countdown', value: `~${Math.max(0, 40 - w)} Weeks to Due Date` }
                ]
            };
        }
    }
];
