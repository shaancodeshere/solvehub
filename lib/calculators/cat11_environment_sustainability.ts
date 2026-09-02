import { CalculatorDefinition } from '../../types/calculator';

export const environmentSustainabilityCalculators: CalculatorDefinition[] = [
    // 1. Solar Panel Payback & Energy Output Calculator
    {
        id: 'solar-payback-calculator',
        name: 'Rooftop Solar Payback & Output Calculator',
        category: 'environmental-energy',
        group: '11A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '301K',
        cpc: '$1.95',
        description: 'Calculates annual kWh production, utility savings, federal tax credit reductions, and return-on-investment payback years for rooftop solar PV systems.',
        inputs: [
            { id: 'systemSizeKw', name: 'PV System Capacity (kW DC)', type: 'number', defaultValue: 8, min: 1, max: 50, step: 0.5, suffix: 'kW', tooltip: 'Standard residential systems are 6 to 10 kW.' },
            { id: 'sunlightHoursPerDay', name: 'Average Daily Peak Sun Hours', type: 'number', defaultValue: 4.5, min: 2, max: 7, step: 0.1, suffix: 'hrs/day', tooltip: 'Regional solar irradiance benchmark.' },
            { id: 'electricRate', name: 'Utility Electricity Rate ($/kWh)', type: 'currency', defaultValue: 0.18, min: 0.05, max: 0.60, step: 0.01, prefix: '$', tooltip: 'Cost per kilowatt-hour from the grid.' },
            { id: 'grossSystemCost', name: 'Gross Installation Cost', type: 'currency', defaultValue: 22000, min: 2000, step: 500, prefix: '$', tooltip: 'Total turnkey installation invoice.' },
            { id: 'taxCreditPct', name: 'Government Clean Energy Tax Credit', type: 'percentage', defaultValue: 30, min: 0, max: 50, step: 1, suffix: '%', tooltip: 'Federal/regional solar investment tax credit.' }
        ],
        naturalLanguageQueries: [
            'Solar panel payback calculator',
            'How long for solar panels to pay for themselves?',
            'Rooftop solar kWh production per year'
        ],
        edgeCases: ['Zero sunshine hours', '100% tax credit edge cases'],
        calculate: (inputs) => {
            const kw = Number(inputs.systemSizeKw) || 8;
            const sunHours = Number(inputs.sunlightHoursPerDay) || 4.5;
            const rate = Number(inputs.electricRate) || 0.18;
            const grossCost = Number(inputs.grossSystemCost) || 22000;
            const creditPct = (Number(inputs.taxCreditPct) || 30) / 100;

            // Annual Production: kW * sun_hours * 365 days * 0.80 (system derate / inverter efficiency)
            const annualKwh = kw * sunHours * 365 * 0.80;
            const annualSavings = annualKwh * rate;

            const netSystemCost = grossCost * (1 - creditPct);
            const taxCreditValue = grossCost * creditPct;

            const paybackYears = annualSavings > 0 ? netSystemCost / annualSavings : 0;
            const lifetimeSavings25Yr = (annualSavings * 25) - netSystemCost;

            return {
                primaryOutput: { label: 'Estimated Payback Period', value: paybackYears.toFixed(1), suffix: 'Years' },
                secondaryMetrics: [
                    { label: 'Annual Electricity Generated', value: `${Math.round(annualKwh).toLocaleString()} kWh / yr` },
                    { label: 'Annual Utility Bill Savings', value: `$${Math.round(annualSavings).toLocaleString()} / yr` },
                    { label: 'Net System Cost (After Tax Credit)', value: `$${Math.round(netSystemCost).toLocaleString()}` },
                    { label: 'Tax Credit Direct Savings', value: `$${Math.round(taxCreditValue).toLocaleString()}` },
                    { label: '25-Year Net Life Profit', value: `$${Math.round(lifetimeSavings25Yr).toLocaleString()}` }
                ]
            };
        }
    },

    // 2. Electric Vehicle (EV) vs. Gasoline Cost Parity Calculator
    {
        id: 'ev-vs-gas-calculator',
        name: 'EV vs. Gas Vehicle Cost Parity Calculator',
        category: 'environmental-energy',
        group: '11A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '201K',
        cpc: '$1.25',
        description: 'Compares annual operational fueling costs and carbon emissions between an electric vehicle and an internal combustion gas vehicle.',
        inputs: [
            { id: 'annualMiles', name: 'Annual Driving Distance', type: 'number', defaultValue: 13500, min: 1000, step: 500, suffix: 'miles', tooltip: 'Average US commuter mileage.' },
            { id: 'gasPricePerGal', name: 'Gasoline Price per Gallon', type: 'currency', defaultValue: 3.65, min: 1, step: 0.05, prefix: '$', tooltip: 'Local pump price.' },
            { id: 'iceMpg', name: 'Gas Car Fuel Efficiency (MPG)', type: 'number', defaultValue: 28, min: 10, max: 70, step: 1, suffix: 'MPG', tooltip: 'Average miles per gallon.' },
            { id: 'electricRateKwh', name: 'Home Electricity Rate ($/kWh)', type: 'currency', defaultValue: 0.16, min: 0.05, step: 0.01, prefix: '$', tooltip: 'Residential rate.' },
            { id: 'evEfficiencyKwh', name: 'EV Efficiency (kWh / 100 miles)', type: 'number', defaultValue: 30, min: 20, max: 50, step: 1, suffix: 'kWh', tooltip: 'Typical EV consumes 28-34 kWh per 100 miles.' }
        ],
        naturalLanguageQueries: [
            'EV vs gas cost calculator',
            'How much do you save driving an electric car?',
            'EV charging vs gas pump annual cost'
        ],
        edgeCases: ['Zero MPG division guard'],
        calculate: (inputs) => {
            const miles = Number(inputs.annualMiles) || 13500;
            const gasPrice = Number(inputs.gasPricePerGal) || 3.65;
            const mpg = Math.max(1, Number(inputs.iceMpg) || 28);
            const kwhRate = Number(inputs.electricRateKwh) || 0.16;
            const evKwhPer100 = Number(inputs.evEfficiencyKwh) || 30;

            // Gas Vehicle Annual Cost
            const gasGallons = miles / mpg;
            const annualGasCost = gasGallons * gasPrice;

            // EV Vehicle Annual Cost
            const totalKwh = (miles / 100) * evKwhPer100;
            const annualEvCost = totalKwh * kwhRate;

            const annualSavings = annualGasCost - annualEvCost;
            const costPerMileIce = annualGasCost / miles;
            const costPerMileEv = annualEvCost / miles;

            // CO2 benchmark: ~8.887 kg CO2 per gallon of gasoline burned
            const annualCo2KgGas = gasGallons * 8.887;
            // Grid EV benchmark: ~0.386 kg CO2 per kWh (national average)
            const annualCo2KgEv = totalKwh * 0.386;
            const netCo2SavedKg = Math.max(0, annualCo2KgGas - annualCo2KgEv);

            return {
                primaryOutput: { label: 'Annual Fuel Savings with EV', value: Math.round(annualSavings).toLocaleString(), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Annual EV Charging Cost', value: `$${Math.round(annualEvCost).toLocaleString()} / yr (${costPerMileEv.toFixed(3)}/mi)` },
                    { label: 'Annual Gas Pump Cost', value: `$${Math.round(annualGasCost).toLocaleString()} / yr (${costPerMileIce.toFixed(3)}/mi)` },
                    { label: 'Annual CO₂ Emissions Reduced', value: `~${Math.round(netCo2SavedKg).toLocaleString()} kg CO₂ / yr` },
                    { label: '5-Year Cumulative Savings', value: `$${Math.round(annualSavings * 5).toLocaleString()}` }
                ]
            };
        }
    },

    // 3. Rainwater Harvesting Collection Yield Calculator
    {
        id: 'rainwater-harvesting-calculator',
        name: 'Rainwater Harvesting Collection Calculator',
        category: 'environmental-energy',
        group: '11A',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '70K',
        cpc: '$0.85',
        description: 'Estimates seasonal water harvest volume in gallons and liters based on roof catchment area, annual rainfall, and filter runoff coefficients.',
        inputs: [
            { id: 'roofAreaSqFt', name: 'Catchment Roof Area (Square Feet)', type: 'number', defaultValue: 2000, min: 100, step: 50, suffix: 'sq ft', tooltip: 'Footprint of guttered roof.' },
            { id: 'annualRainfallInches', name: 'Annual Rainfall (Inches)', type: 'number', defaultValue: 38, min: 1, max: 150, step: 1, suffix: 'in', tooltip: 'Average local annual rainfall depth.' },
            {
                id: 'catchmentType', name: 'Roof Surface Type', type: 'dropdown', defaultValue: 'metal', options: [
                    { label: 'Metal / Seamless Steel (95% Efficiency)', value: 0.95 },
                    { label: 'Asphalt Shingle (80% Efficiency)', value: 0.80 },
                    { label: 'Concrete / Clay Tile (85% Efficiency)', value: 0.85 }
                ], tooltip: 'Runoff friction coefficient.'
            }
        ],
        naturalLanguageQueries: [
            'How much rainwater can I collect from my roof?',
            'Rainwater harvesting gallon yield calculator',
            'Roof catchment runoff formula'
        ],
        edgeCases: ['Zero rainfall or zero roof area'],
        calculate: (inputs) => {
            const area = Number(inputs.roofAreaSqFt) || 2000;
            const rainInches = Number(inputs.annualRainfallInches) || 38;
            const coeff = Number(inputs.catchmentType) || 0.95;

            // Standard Water Yield Equation: Gallons = Area (sq ft) * Rainfall (in) * 0.6233 * Runoff Efficiency
            const annualGallons = area * rainInches * 0.6233 * coeff;
            const annualLiters = annualGallons * 3.78541;
            const monthlyAverageGallons = annualGallons / 12;

            // Standard 55-gallon drums required for single 1-inch storm event
            const singleStorm1InchGallons = area * 1 * 0.6233 * coeff;
            const drumsNeeded = Math.ceil(singleStorm1InchGallons / 55);

            return {
                primaryOutput: { label: 'Annual Rainwater Harvested', value: Math.round(annualGallons).toLocaleString(), suffix: 'Gallons' },
                secondaryMetrics: [
                    { label: 'Metric Volume Equivalent', value: `${Math.round(annualLiters).toLocaleString()} Liters` },
                    { label: 'Monthly Average Harvesting', value: `~${Math.round(monthlyAverageGallons).toLocaleString()} gal / mo` },
                    { label: 'Single 1" Storm Event Yield', value: `~${Math.round(singleStorm1InchGallons).toLocaleString()} gal` },
                    { label: '55-Gallon Rain Barrels for 1" Storm', value: `${drumsNeeded} Barrels` }
                ]
            };
        }
    },

    // 4. Compost Carbon-to-Nitrogen (C:N) Ratio Calculator
    {
        id: 'compost-ratio-calculator',
        name: 'Compost C:N Carbon-to-Nitrogen Balance Calculator',
        category: 'environmental-energy',
        group: '11A',
        bucket: 'Bucket B',
        tier: 3,
        phase: 2,
        monthlySearches: '40K',
        cpc: '$0.40',
        description: 'Calculates the optimal 30:1 carbon-to-nitrogen balance between "Brown" carbon materials (leaves, cardboard) and "Green" nitrogen materials (food scraps, grass).',
        inputs: [
            { id: 'greenWeightLbs', name: 'Greens / Nitrogen Materials (Weight)', type: 'number', defaultValue: 20, min: 1, step: 1, suffix: 'lbs', tooltip: 'Kitchen food scraps, fresh grass clippings, coffee grounds.' },
            {
                id: 'greenCnRatio', name: 'Average Greens C:N Ratio', type: 'dropdown', defaultValue: 15, options: [
                    { label: 'Vegetable / Food Scraps (~15:1)', value: 15 },
                    { label: 'Fresh Grass Clippings (~20:1)', value: 20 },
                    { label: 'Coffee Grounds (~20:1)', value: 20 }
                ], tooltip: 'Inherent C:N ratio of greens.'
            },
            {
                id: 'brownType', name: 'Browns / Carbon Material Source', type: 'dropdown', defaultValue: 60, options: [
                    { label: 'Dry Autumn Leaves (~60:1)', value: 60 },
                    { label: 'Cardboard & Shredded Paper (~350:1)', value: 350 },
                    { label: 'Wood Chips / Sawdust (~400:1)', value: 400 },
                    { label: 'Straw / Dry Hay (~80:1)', value: 80 }
                ], tooltip: 'Carbon feedstock.'
            }
        ],
        naturalLanguageQueries: [
            'Compost carbon nitrogen ratio calculator',
            'How much brown material for food scraps?',
            'Ideal 30 to 1 compost pile recipe'
        ],
        edgeCases: ['Extreme high carbon inputs requiring negligible volume'],
        calculate: (inputs) => {
            const greensLbs = Number(inputs.greenWeightLbs) || 20;
            const greenRatio = Number(inputs.greenCnRatio) || 15;
            const brownRatio = Number(inputs.brownType) || 60;
            const targetRatio = 30; // Target optimal compost C:N

            // Required browns weight: Browns = Greens * (Target - GreenRatio) / (BrownRatio - Target)
            let requiredBrownsLbs = 0;
            if (brownRatio > targetRatio) {
                requiredBrownsLbs = greensLbs * ((targetRatio - greenRatio) / (brownRatio - targetRatio));
            }

            const totalPileLbs = greensLbs + requiredBrownsLbs;
            const volumeRatioEst = requiredBrownsLbs > 0 ? (requiredBrownsLbs * 2.5) / greensLbs : 1; // Browns are ~2.5x fluffier/lighter by volume

            return {
                primaryOutput: { label: 'Brown Carbon Material Needed', value: Math.max(0.5, requiredBrownsLbs).toFixed(1), suffix: 'lbs' },
                secondaryMetrics: [
                    { label: 'Approximate Volume Balance', value: `~${Math.round(volumeRatioEst)} Parts Brown : 1 Part Green` },
                    { label: 'Total Recipe Pile Weight', value: `${totalPileLbs.toFixed(1)} lbs` },
                    { label: 'Target Equilibrium Ratio', value: '30:1 (Aerobic Decomposition)' }
                ]
            };
        }
    }
];