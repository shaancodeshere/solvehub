import { CalculatorDefinition } from '@/types/calculator';

export const environmentSustainabilityCalculators: CalculatorDefinition[] = [
    // 1. Air Quality Index Calculator
    {
        id: 'air-quality-index-calculator',
        name: 'Air Quality Index Calculator',
        category: 'environmental-energy',
        group: 'Environment & Sustainability',
        bucket: 'Bucket B',
        tier: 5,
        phase: 4,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "Air Quality Index Calculator tool.",
        inputs: [
            { id: 'pollutantType', name: 'Air Pollutant Parameter', type: 'dropdown', defaultValue: 'pm25', options: [{ label: 'Fine Particulate Matter (PM2.5 - µg/m³)', value: 'pm25' }, { label: 'Coarse Particulate Matter (PM10 - µg/m³)', value: 'pm10' }, { label: 'Ozone (O3 - 8-hr ppb)', value: 'o3' }, { label: 'Carbon Monoxide (CO - 8-hr ppm)', value: 'co' }], tooltip: 'Pollutant type.' },
            { id: 'concentrationValue', name: 'Measured Concentration', type: 'number', defaultValue: 35.4, min: 0, step: 1, tooltip: 'Concentration reading.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const type = String(inputs.pollutantType || 'pm25');
            const c = Number(inputs.concentrationValue) || 35.4;

            // EPA AQI breakpoints for PM2.5: [C_low, C_high, I_low, I_high]
            let aqi = 50;
            let category = 'Moderate';
            let color = 'Yellow';

            if (type === 'pm25') {
                if (c <= 12.0) { aqi = (50 / 12.0) * c; category = 'Good (0-50)'; color = 'Green'; }
                else if (c <= 35.4) { aqi = ((100 - 51) / (35.4 - 12.1)) * (c - 12.1) + 51; category = 'Moderate (51-100)'; color = 'Yellow'; }
                else if (c <= 55.4) { aqi = ((150 - 101) / (55.4 - 35.5)) * (c - 35.5) + 101; category = 'Unhealthy for Sensitive Groups (101-150)'; color = 'Orange'; }
                else if (c <= 150.4) { aqi = ((200 - 151) / (150.4 - 55.5)) * (c - 55.5) + 151; category = 'Unhealthy (151-200)'; color = 'Red'; }
                else if (c <= 250.4) { aqi = ((300 - 201) / (250.4 - 150.5)) * (c - 150.5) + 201; category = 'Very Unhealthy (201-300)'; color = 'Purple'; }
                else { aqi = ((500 - 301) / (500.4 - 250.5)) * (c - 250.5) + 301; category = 'Hazardous (301-500)'; color = 'Maroon'; }
            } else if (type === 'pm10') {
                if (c <= 54) aqi = (50 / 54) * c;
                else if (c <= 154) aqi = ((100 - 51) / (154 - 55)) * (c - 55) + 51;
                else if (c <= 254) aqi = ((150 - 101) / (254 - 155)) * (c - 155) + 101;
                else aqi = 180;
                category = aqi <= 50 ? 'Good' : aqi <= 100 ? 'Moderate' : 'Unhealthy';
            } else {
                aqi = Math.min(500, Math.round(c * 1.5));
                category = aqi <= 50 ? 'Good' : aqi <= 100 ? 'Moderate' : 'Unhealthy';
            }

            const aqiRounded = Math.min(500, Math.max(0, Math.round(aqi)));

            return {
                primaryOutput: { label: 'Air Quality Index (AQI)', value: `${aqiRounded} AQI`, suffix: category.split(' ')[0] },
                secondaryMetrics: [
                    { label: 'EPA Health Advisory Level', value: category },
                    { label: 'General Population Recommendation', value: aqiRounded <= 100 ? 'Safe for outdoor exercise and recreation' : aqiRounded <= 150 ? 'Sensitive groups should reduce prolonged outdoor exertion' : 'Avoid outdoor physical activities; use HEPA air purifier indoors' },
                    { label: 'Measured Pollutant Concentration', value: `${c} ${type === 'co' ? 'ppm' : 'µg/m³'}` },
                    { label: 'AQI Color Code', value: color }
                ]
            };
        }
    },
    // 2. Water Footprint Calculator
    {
        id: 'water-footprint-calculator',
        name: 'Water Footprint Calculator',
        category: 'environmental-energy',
        group: 'Environment & Sustainability',
        bucket: 'Bucket B',
        tier: 4,
        phase: 4,
        monthlySearches: '3K',
        cpc: '$12.56  ★ HIGH CPC',
        description: "Water Footprint Calculator tool.",
        inputs: [
            { id: 'dietChoice', name: 'Dietary Lifestyle', type: 'dropdown', defaultValue: 'omnivore', options: [{ label: 'Meat Heavy (Red meat daily - ~1,200 gal/day virtual water)', value: 'heavy_meat' }, { label: 'Average Omnivore (~850 gal/day)', value: 'omnivore' }, { label: 'Pescatarian (~650 gal/day)', value: 'pesc' }, { label: 'Vegetarian (~500 gal/day)', value: 'veg' }, { label: 'Vegan (~350 gal/day)', value: 'vegan' }], tooltip: 'Diet virtual water.' },
            { id: 'dailyShowerMins', name: 'Daily Shower Duration (Minutes)', type: 'number', defaultValue: 10, min: 2, max: 45, step: 1, suffix: 'min', tooltip: 'Shower length.' },
            { id: 'clothesPurchasedMonth', name: 'New Garments Purchased / Month', type: 'number', defaultValue: 2, min: 0, step: 1, tooltip: 'Cotton / textile virtual water.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const diet = String(inputs.dietChoice || 'omnivore');
            const showerMins = Number(inputs.dailyShowerMins) || 10;
            const clothes = Number(inputs.clothesPurchasedMonth) || 2;

            let dietGalDaily = 850;
            if (diet === 'heavy_meat') dietGalDaily = 1200;
            else if (diet === 'pesc') dietGalDaily = 650;
            else if (diet === 'veg') dietGalDaily = 500;
            else if (diet === 'vegan') dietGalDaily = 350;

            const directDomesticGalDaily = (showerMins * 2.1) + 40; // Shower + toilet/faucets
            const goodsVirtualGalDaily = (clothes * 700) / 30.42; // ~700 gal per average garment

            const totalDailyGal = dietGalDaily + directDomesticGalDaily + goodsVirtualGalDaily;
            const annualGal = totalDailyGal * 365;
            const annualLiters = annualGal * 3.78541;

            return {
                primaryOutput: { label: 'Daily Total Water Footprint', value: `${Math.round(totalDailyGal).toLocaleString()} Gallons`, suffix: `${Math.round(totalDailyGal * 3.785).toLocaleString()} Liters / day` },
                secondaryMetrics: [
                    { label: 'Virtual Food Water Share', value: `${dietGalDaily} Gal/day (${Math.round((dietGalDaily / totalDailyGal) * 100)}% of footprint)` },
                    { label: 'Direct Domestic Water Use', value: `${Math.round(directDomesticGalDaily)} Gal/day` },
                    { label: 'Annual Total Water Consumption', value: `${Math.round(annualGal).toLocaleString()} Gallons / year` },
                    { label: 'Comparison to US National Average', value: totalDailyGal < 1800 ? `${Math.round(((1800 - totalDailyGal) / 1800) * 100)}% below national average (1,800 gal/day)` : 'Above national average' }
                ]
            };
        }
    },
    // 3. Tree Planting Impact Calculator
    {
        id: 'tree-planting-impact-calculator',
        name: 'Tree Planting Impact Calculator',
        category: 'environmental-energy',
        group: 'Environment & Sustainability',
        bucket: 'Bucket B',
        tier: 5,
        phase: 5,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "Tree Planting Impact Calculator tool.",
        inputs: [
            { id: 'treesCount', name: 'Number of Trees Planted', type: 'number', defaultValue: 25, min: 1, step: 5, tooltip: 'Number of saplings.' },
            { id: 'treeType', name: 'Tree Species Growth Profile', type: 'dropdown', defaultValue: 'hardwood', options: [{ label: 'Deciduous Hardwood (Oak/Maple - 48 lbs CO2/yr)', value: 'hardwood' }, { label: 'Evergreen Conifer (Pine/Spruce - 35 lbs CO2/yr)', value: 'conifer' }, { label: 'Fast-Growing Hybrid (Poplar/Willow - 60 lbs CO2/yr)', value: 'fast' }], tooltip: 'Species sequestration.' },
            { id: 'lifetimeYears', name: 'Evaluation Lifespan (Years)', type: 'dropdown', defaultValue: 25, options: [{ label: '10 Years', value: 10 }, { label: '25 Years (Maturity)', value: 25 }, { label: '50 Years (Full Forest Canopy)', value: 50 }], tooltip: 'Time horizon.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const trees = Number(inputs.treesCount) || 25;
            const species = String(inputs.treeType || 'hardwood');
            const years = Number(inputs.lifetimeYears) || 25;

            let co2LbsPerYear = 48;
            if (species === 'conifer') co2LbsPerYear = 35;
            else if (species === 'fast') co2LbsPerYear = 60;

            const survivalRate = 0.85; // 85% survival rate
            const survivingTrees = trees * survivalRate;

            const annualCO2Lbs = survivingTrees * co2LbsPerYear;
            const lifetimeCO2Lbs = annualCO2Lbs * years;
            const lifetimeCO2Tons = lifetimeCO2Lbs / 2204.62;

            const stormwaterGalAnnual = survivingTrees * 1000; // ~1000 gal stormwater intercepted/tree/yr
            const carMilesOffsetAnnual = (annualCO2Lbs / 0.8887) * 2.20462; // ~0.89 lbs CO2 per car mile

            return {
                primaryOutput: { label: 'Lifetime CO2 Sequestered', value: `${lifetimeCO2Tons.toFixed(1)} Metric Tons`, suffix: `${years}-Year Lifespan` },
                secondaryMetrics: [
                    { label: 'Annual Carbon Sequestration', value: `${Math.round(annualCO2Lbs).toLocaleString()} lbs CO2 / year` },
                    { label: 'Surviving Mature Trees', value: `~${Math.round(survivingTrees)} Trees (85% survival rate)` },
                    { label: 'Passenger Car Miles Offset Annually', value: `${Math.round(carMilesOffsetAnnual).toLocaleString()} Miles` },
                    { label: 'Annual Stormwater Intercepted', value: `${Math.round(stormwaterGalAnnual).toLocaleString()} Gallons / year` }
                ]
            };
        }
    },
    // 4. Ecological Footprint Calculator
    {
        id: 'ecological-footprint-calculator',
        name: 'Ecological Footprint Calculator',
        category: 'environmental-energy',
        group: 'Environment & Sustainability',
        bucket: 'Bucket B',
        tier: 3,
        phase: 4,
        monthlySearches: '12K',
        cpc: '$4.08',
        description: "Ecological Footprint Calculator tool.",
        inputs: [
            { id: 'housingType', name: 'Housing & Space Type', type: 'dropdown', defaultValue: 'suburban', options: [{ label: 'Small Apartment / Condo (Low resource footprint)', value: 'apt' }, { label: 'Medium Suburban Single Family Home', value: 'suburban' }, { label: 'Large Detached Home / Acreage', value: 'large' }], tooltip: 'Housing footprint.' },
            { id: 'commuteMilesWeekly', name: 'Weekly Driving Miles', type: 'number', defaultValue: 180, min: 0, step: 25, suffix: 'mi', tooltip: 'Commute distance.' },
            { id: 'dietHabits', name: 'Dietary Protein Consumption', type: 'dropdown', defaultValue: 'moderate', options: [{ label: 'Heavy Meat Daily', value: 'heavy' }, { label: 'Moderate Meat / Omnivore', value: 'moderate' }, { label: 'Plant-Based / Vegetarian / Vegan', value: 'plant' }], tooltip: 'Diet type.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const house = String(inputs.housingType || 'suburban');
            const miles = Number(inputs.commuteMilesWeekly) || 180;
            const diet = String(inputs.dietHabits || 'moderate');

            let houseGHA = 1.2;
            if (house === 'apt') houseGHA = 0.7;
            else if (house === 'large') houseGHA = 2.1;

            const transportGHA = (miles * 52) * 0.00018; // Global hectares per mile

            let dietGHA = 1.5;
            if (diet === 'heavy') dietGHA = 2.4;
            else if (diet === 'plant') dietGHA = 0.8;

            const goodsServicesGHA = 1.1; // Baseline infrastructure
            const totalGHA = houseGHA + transportGHA + dietGHA + goodsServicesGHA;

            // Global biocapacity available per person is ~1.6 global hectares (gha)
            const earthsNeeded = totalGHA / 1.6;

            return {
                primaryOutput: { label: 'Ecological Footprint', value: `${totalGHA.toFixed(1)} Global Hectares`, suffix: `${earthsNeeded.toFixed(1)} Planet Earths` },
                secondaryMetrics: [
                    { label: 'Planets Required if Everyone Lived Like You', value: `${earthsNeeded.toFixed(2)} Earths (Biocapacity limit: 1.0)` },
                    { label: 'Transportation Biocapacity Demand', value: `${transportGHA.toFixed(2)} gha` },
                    { label: 'Food & Agricultural Footprint', value: `${dietGHA.toFixed(2)} gha` },
                    { label: 'Sustainability Status', value: 'Ecological biocapacity demand calculated' }
                ]
            };
        }
    },
    // 5. Renewable Energy Savings Calculator
    {
        id: 'renewable-energy-savings-calculator',
        name: 'Renewable Energy Savings Calculator',
        category: 'environmental-energy',
        group: 'Environment & Sustainability',
        bucket: 'Bucket B',
        tier: 5,
        phase: 5,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "Renewable Energy Savings Calculator tool.",
        inputs: [
            { id: 'currentMonthlyElectricBill', name: 'Average Monthly Electric Bill ($)', type: 'number', defaultValue: 175, min: 25, step: 25, prefix: '$', tooltip: 'Current utility bill.' },
            { id: 'renewableOffsetPct', name: 'Renewable Power Offset (%)', type: 'number', defaultValue: 90, min: 20, max: 120, step: 5, suffix: '%', tooltip: 'Target coverage.' },
            { id: 'evaluationYears', name: 'Evaluation Horizon (Years)', type: 'dropdown', defaultValue: 20, options: [{ label: '10 Years', value: 10 }, { label: '20 Years', value: 20 }, { label: '25 Years (Standard Warranty)', value: 25 }], tooltip: 'Years.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const bill = Number(inputs.currentMonthlyElectricBill) || 175;
            const offset = (Number(inputs.renewableOffsetPct) || 90) / 100;
            const years = Number(inputs.evaluationYears) || 20;

            const annualSpend = bill * 12;
            const utilityInflation = 0.035; // 3.5% historical rate escalation

            let cumulativeUtilityCost = 0;
            let currentYearBill = annualSpend;
            for (let i = 0; i < years; i++) {
                cumulativeUtilityCost += currentYearBill;
                currentYearBill *= (1 + utilityInflation);
            }

            const cumulativeSavings = cumulativeUtilityCost * offset;
            const co2AvoidedTons = (annualSpend / 0.16) * 0.386 * years / 1000;

            return {
                primaryOutput: { label: 'Cumulative Lifetime Utility Savings', value: `$${Math.round(cumulativeSavings).toLocaleString()}`, suffix: `${years}-Year Horizon` },
                secondaryMetrics: [
                    { label: 'Year 1 Estimated Savings', value: `$${Math.round(annualSpend * offset).toLocaleString()} / year` },
                    { label: 'Status Quo Cumulative Utility Spend', value: `$${Math.round(cumulativeUtilityCost).toLocaleString()}` },
                    { label: 'Clean Energy Generated', value: `~${Math.round((annualSpend / 0.16) * offset * years / 1000)} MWh` },
                    { label: 'Lifetime Carbon Emissions Avoided', value: `${co2AvoidedTons.toFixed(1)} Metric Tons CO2` }
                ]
            };
        }
    },
    // 6. Food Carbon Footprint Calculator
    {
        id: 'food-carbon-footprint-calculator',
        name: 'Food Carbon Footprint Calculator',
        category: 'environmental-energy',
        group: 'Environment & Sustainability',
        bucket: 'Bucket B',
        tier: 5,
        phase: 5,
        monthlySearches: '320',
        cpc: '$4.24',
        description: "Food Carbon Footprint Calculator tool.",
        inputs: [
            { id: 'beefServingsWeek', name: 'Beef / Lamb Meals per Week', type: 'number', defaultValue: 3, min: 0, max: 21, step: 1, tooltip: 'Red meat meals (~6.5 kg CO2e each).' },
            { id: 'poultryPorkServingsWeek', name: 'Chicken / Pork / Fish Meals per Week', type: 'number', defaultValue: 5, min: 0, max: 21, step: 1, tooltip: 'Poultry meals (~1.8 kg CO2e each).' },
            { id: 'dairyServingsDay', name: 'Daily Dairy Servings (Milk/Cheese)', type: 'number', defaultValue: 2, min: 0, max: 10, step: 1, tooltip: 'Dairy (~1.2 kg CO2e/day).' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const beef = Number(inputs.beefServingsWeek) || 3;
            const poultry = Number(inputs.poultryPorkServingsWeek) || 5;
            const dairy = Number(inputs.dairyServingsDay) || 2;

            const beefAnnualKg = beef * 52 * 6.5;
            const poultryAnnualKg = poultry * 52 * 1.8;
            const dairyAnnualKg = dairy * 365 * 1.2;
            const basePlantAnnualKg = 450; // vegetables, grains, fruits base

            const totalKgCO2 = beefAnnualKg + poultryAnnualKg + dairyAnnualKg + basePlantAnnualKg;
            const totalTons = totalKgCO2 / 1000;
            const carMilesEquiv = (totalKgCO2 / 0.404); // 404g CO2 per car mile

            return {
                primaryOutput: { label: 'Annual Diet Carbon Footprint', value: `${totalTons.toFixed(2)} Metric Tons`, suffix: `${Math.round(totalKgCO2 * 2.20462).toLocaleString()} lbs CO2e` },
                secondaryMetrics: [
                    { label: 'Red Meat Share of Emissions', value: `${Math.round(beefAnnualKg)} kg CO2e (${Math.round((beefAnnualKg / totalKgCO2) * 100)}%)` },
                    { label: 'Equivalent Driving Distance', value: `${Math.round(carMilesEquiv).toLocaleString()} Passenger Car Miles` },
                    { label: 'Poultry & Dairy Emissions', value: `${Math.round(poultryAnnualKg + dairyAnnualKg)} kg CO2e / year` },
                    { label: '1 Meatless Day/Week Savings Potential', value: `-${Math.round((beefAnnualKg / (beef || 1)) + 50)} kg CO2e / year` }
                ]
            };
        }
    },
    // 7. Recycling Savings Calculator
    {
        id: 'recycling-savings-calculator',
        name: 'Recycling Savings Calculator',
        category: 'environmental-energy',
        group: 'Environment & Sustainability',
        bucket: 'Bucket B',
        tier: 5,
        phase: 5,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "Recycling Savings Calculator tool.",
        inputs: [
            { id: 'aluminumCansWeekly', name: 'Aluminum Beverage Cans / Week', type: 'number', defaultValue: 14, min: 0, step: 2, tooltip: 'Cans recycled.' },
            { id: 'plasticBottlesWeekly', name: 'Plastic Bottles (PET) / Week', type: 'number', defaultValue: 10, min: 0, step: 2, tooltip: 'Bottles recycled.' },
            { id: 'cardboardLbsWeekly', name: 'Cardboard & Paper (lbs / week)', type: 'number', defaultValue: 8, min: 0, step: 2, suffix: 'lbs', tooltip: 'Paper goods.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const cans = Number(inputs.aluminumCansWeekly) || 14;
            const bottles = Number(inputs.plasticBottlesWeekly) || 10;
            const paper = Number(inputs.cardboardLbsWeekly) || 8;

            // Aluminum: 1 can recycled saves ~0.20 kWh electricity & 0.35 lbs CO2
            const canKWh = cans * 52 * 0.20;
            const canCO2Lbs = cans * 52 * 0.35;

            // Plastic: 1 bottle saves ~0.05 kWh & 0.12 lbs CO2
            const bottleKWh = bottles * 52 * 0.05;
            const bottleCO2Lbs = bottles * 52 * 0.12;

            // Paper: 1 lb paper saves ~1.5 kWh & 2.5 lbs CO2 + 3.5 gal water
            const paperKWh = paper * 52 * 1.5;
            const paperCO2Lbs = paper * 52 * 2.5;
            const paperWaterGal = paper * 52 * 3.5;

            const totalKWhSaved = canKWh + bottleKWh + paperKWh;
            const totalCO2Lbs = canCO2Lbs + bottleCO2Lbs + paperCO2Lbs;
            const totalLbsWasteDiverted = (cans * 52 * 0.033) + (bottles * 52 * 0.065) + (paper * 52);

            return {
                primaryOutput: { label: 'Annual Energy Saved', value: `${Math.round(totalKWhSaved).toLocaleString()} kWh`, suffix: `${Math.round(totalCO2Lbs)} lbs CO2 Avoided` },
                secondaryMetrics: [
                    { label: 'Total Landfill Waste Diverted', value: `${Math.round(totalLbsWasteDiverted)} lbs / year` },
                    { label: 'Water Conserved (Paper Recycling)', value: `${Math.round(paperWaterGal).toLocaleString()} Gallons` },
                    { label: 'Equivalent TV Operating Hours', value: `${Math.round(totalKWhSaved * 10).toLocaleString()} Hours (100W TV)` },
                    { label: 'Trees Saved from Paper Recycling', value: `${(paper * 52 * 0.0085).toFixed(1)} Mature Trees / year` }
                ]
            };
        }
    },
    // 8. Electric Vehicle Savings Calculator
    {
        id: 'electric-vehicle-savings-calculator',
        name: 'Electric Vehicle Savings Calculator',
        category: 'environmental-energy',
        group: 'Environment & Sustainability',
        bucket: 'Bucket C1',
        tier: 5,
        phase: 5,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "Electric Vehicle Savings Calculator tool.",
        inputs: [
            { id: 'annualMiles', name: 'Annual Driving Miles', type: 'number', defaultValue: 13500, min: 1000, step: 500, suffix: 'mi', tooltip: 'Miles driven per year.' },
            { id: 'gasolinePrice', name: 'Gasoline Price ($/Gallon)', type: 'number', defaultValue: 3.65, min: 1.0, step: 0.1, prefix: '$', tooltip: 'Current gas price.' },
            { id: 'iceMPG', name: 'Gas Vehicle MPG', type: 'number', defaultValue: 26, min: 10, max: 60, step: 1, suffix: 'mpg', tooltip: 'Gas car efficiency.' },
            { id: 'electricRateKWh', name: 'Electricity Rate ($/kWh)', type: 'number', defaultValue: 0.16, min: 0.05, step: 0.01, prefix: '$', tooltip: 'Home charging rate.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const miles = Number(inputs.annualMiles) || 13500;
            const gasPrice = Number(inputs.gasolinePrice) || 3.65;
            const mpg = Number(inputs.iceMPG) || 26;
            const elecRate = Number(inputs.electricRateKWh) || 0.16;

            const gasFuelCostAnnual = (miles / mpg) * gasPrice;
            const evFuelCostAnnual = (miles / 3.6) * elecRate; // 3.6 mi/kWh average EV
            const maintSavingsAnnual = 600; // Oil changes, brake pads, fluids

            const annualTotalSavings = (gasFuelCostAnnual - evFuelCostAnnual) + maintSavingsAnnual;
            const fiveYearSavings = annualTotalSavings * 5;
            const co2SavedTons = ((miles / mpg) * 19.6 - (miles / 3.6) * 0.855) / 2204.62;

            return {
                primaryOutput: { label: 'Estimated Annual Savings', value: `$${Math.round(annualTotalSavings).toLocaleString()} / year`, suffix: `$${Math.round(fiveYearSavings).toLocaleString()} (5-Yr)` },
                secondaryMetrics: [
                    { label: 'Gas Fuel Cost vs EV Electricity', value: `$${Math.round(gasFuelCostAnnual)} Gas vs $${Math.round(evFuelCostAnnual)} EV` },
                    { label: 'Fuel Cost per Mile', value: `Gas: $${(gasPrice / mpg).toFixed(3)}/mi vs EV: $${(elecRate / 3.6).toFixed(3)}/mi` },
                    { label: 'Annual Maintenance Advantage', value: `+$${maintSavingsAnnual} Saved (No oil changes/tuneups)` },
                    { label: 'Annual Carbon Reduction', value: `${co2SavedTons.toFixed(1)} Metric Tons CO2 / year` }
                ]
            };
        }
    },
    // 9. Solar Savings Calculator
    {
        id: 'solar-savings-calculator',
        name: 'Solar Savings Calculator',
        category: 'environmental-energy',
        group: 'Environment & Sustainability',
        bucket: 'Bucket B',
        tier: 5,
        phase: 5,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "Solar Savings Calculator tool.",
        inputs: [
            { id: 'systemCapacityKW', name: 'Rooftop System Capacity (kW DC)', type: 'number', defaultValue: 8.5, min: 2, max: 40, step: 0.5, suffix: 'kW', tooltip: 'System size.' },
            { id: 'costPerWatt', name: 'Gross Installation Cost ($/Watt)', type: 'number', defaultValue: 2.85, min: 1.5, max: 5.0, step: 0.1, prefix: '$', tooltip: 'Cost per watt before tax credit.' },
            { id: 'electricRate', name: 'Current Utility Rate ($/kWh)', type: 'number', defaultValue: 0.18, min: 0.05, step: 0.01, prefix: '$', tooltip: 'Electric tariff.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const kw = Number(inputs.systemCapacityKW) || 8.5;
            const cpw = Number(inputs.costPerWatt) || 2.85;
            const rate = Number(inputs.electricRate) || 0.18;

            const grossCost = kw * 1000 * cpw;
            const federalTaxCredit = grossCost * 0.30; // 30% Residential Clean Energy Credit (Section 25D)
            const netCost = grossCost - federalTaxCredit;

            const annualGenerationKWh = kw * 4.6 * 365 * 0.82; // 4.6 sun hours * 82% derate
            const year1Savings = annualGenerationKWh * rate;
            const simplePaybackYears = netCost / year1Savings;

            // 25 year cumulative with 2.5% utility escalation
            let cumulativeSavings25 = 0;
            let curSavings = year1Savings;
            for (let i = 0; i < 25; i++) {
                cumulativeSavings25 += curSavings;
                curSavings *= 1.025;
            }

            const net25YearProfit = cumulativeSavings25 - netCost;

            return {
                primaryOutput: { label: 'Net 25-Year Clean Energy Profit', value: `$${Math.round(net25YearProfit).toLocaleString()}`, suffix: `${simplePaybackYears.toFixed(1)} Yr Payback` },
                secondaryMetrics: [
                    { label: 'Net System Cost (after 30% Tax Credit)', value: `$${Math.round(netCost).toLocaleString()} (Credit: $${Math.round(federalTaxCredit).toLocaleString()})` },
                    { label: 'Year 1 Electricity Bill Savings', value: `$${Math.round(year1Savings).toLocaleString()} / year` },
                    { label: 'Annual Solar Generation', value: `${Math.round(annualGenerationKWh).toLocaleString()} kWh / year` },
                    { label: 'Simple Investment Payback Period', value: `${simplePaybackYears.toFixed(1)} Years` }
                ]
            };
        }
    },
    // 10. Water Conservation Calculator
    {
        id: 'water-conservation-calculator',
        name: 'Water Conservation Calculator',
        category: 'environmental-energy',
        group: 'Environment & Sustainability',
        bucket: 'Bucket B',
        tier: 5,
        phase: 5,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "Water Conservation Calculator tool.",
        inputs: [
            { id: 'householdSize', name: 'Number of Household Members', type: 'number', defaultValue: 3, min: 1, max: 10, step: 1, tooltip: 'People in home.' },
            { id: 'showerFixtureUpgrade', name: 'Low-Flow Showerhead Upgrade', type: 'dropdown', defaultValue: 'yes', options: [{ label: 'Yes (Upgrade 2.5 GPM to 1.75 GPM)', value: 'yes' }, { label: 'No Upgrade', value: 'no' }], tooltip: 'Shower retrofit.' },
            { id: 'toiletUpgrade', name: 'High-Efficiency Toilet Upgrade', type: 'dropdown', defaultValue: 'yes', options: [{ label: 'Yes (Upgrade 3.5 GPF to 1.28 GPF WaterSense)', value: 'yes' }, { label: 'No Upgrade', value: 'no' }], tooltip: 'Toilet retrofit.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const people = Number(inputs.householdSize) || 3;
            const shower = String(inputs.showerFixtureUpgrade || 'yes');
            const toilet = String(inputs.toiletUpgrade || 'yes');

            let showerSavingsGalAnnual = 0;
            if (shower === 'yes') {
                showerSavingsGalAnnual = people * 8 * (2.5 - 1.75) * 365; // 8 mins shower per person
            }

            let toiletSavingsGalAnnual = 0;
            if (toilet === 'yes') {
                toiletSavingsGalAnnual = people * 5 * (3.5 - 1.28) * 365; // 5 flushes per person
            }

            const totalGalSaved = showerSavingsGalAnnual + toiletSavingsGalAnnual;
            const totalCCFSaved = totalGalSaved / 748;
            const waterBillSavings = totalCCFSaved * 6.50; // $6.50 per CCF water + sewer
            const waterHeatingGasKWh = (showerSavingsGalAnnual * 0.12); // Hot water energy avoided

            return {
                primaryOutput: { label: 'Annual Water Conserved', value: `${Math.round(totalGalSaved).toLocaleString()} Gallons`, suffix: `$${Math.round(waterBillSavings)} / yr saved` },
                secondaryMetrics: [
                    { label: 'Annual Water & Sewer Bill Savings', value: `$${Math.round(waterBillSavings).toLocaleString()} / year` },
                    { label: 'Toilet Efficiency Savings', value: `${Math.round(toiletSavingsGalAnnual).toLocaleString()} Gal/yr` },
                    { label: 'Showerhead Efficiency Savings', value: `${Math.round(showerSavingsGalAnnual).toLocaleString()} Gal/yr` },
                    { label: 'Water Heater Energy Avoided', value: `~${Math.round(waterHeatingGasKWh)} kWh / year` }
                ]
            };
        }
    },
    // 11. Food Waste Calculator
    {
        id: 'food-waste-calculator',
        name: 'Food Waste Calculator',
        category: 'environmental-energy',
        group: 'Environment & Sustainability',
        bucket: 'Bucket B',
        tier: 5,
        phase: 5,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "Food Waste Calculator tool.",
        inputs: [
            { id: 'weeklyGroceryBill', name: 'Weekly Grocery Spending ($)', type: 'number', defaultValue: 185, min: 20, step: 10, prefix: '$', tooltip: 'Weekly grocery cost.' },
            { id: 'estimatedWastePercent', name: 'Estimated Food Uneaten / Discarded (%)', type: 'dropdown', defaultValue: 20, options: [{ label: '10% (Low / Strict Meal Planning)', value: 10 }, { label: '20% (Moderate Household Waste)', value: 20 }, { label: '30% (US National Average)', value: 30 }, { label: '40% (High Waste / Expired Produce)', value: 40 }], tooltip: 'Discarded percentage.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const weeklyBill = Number(inputs.weeklyGroceryBill) || 185;
            const wastePct = (Number(inputs.estimatedWastePercent) || 20) / 100;

            const annualGrocerySpend = weeklyBill * 52;
            const annualWastedDollars = annualGrocerySpend * wastePct;
            const monthlyWastedDollars = annualWastedDollars / 12;
            const wastedFoodLbsAnnual = (annualWastedDollars / 3.25); // ~ $3.25/lb average food grocery cost
            const methaneCO2eKg = wastedFoodLbsAnnual * 1.8; // kg CO2e in anaerobic landfill

            return {
                primaryOutput: { label: 'Annual Cost of Wasted Food', value: `$${Math.round(annualWastedDollars).toLocaleString()}`, suffix: `$${Math.round(monthlyWastedDollars)} / month` },
                secondaryMetrics: [
                    { label: 'Annual Weight of Discarded Food', value: `~${Math.round(wastedFoodLbsAnnual)} lbs / year` },
                    { label: 'Landfill Methane Impact', value: `${Math.round(methaneCO2eKg * 2.20462)} lbs CO2e / year` },
                    { label: '10-Year Cumulative Loss', value: `$${Math.round(annualWastedDollars * 10).toLocaleString()}` },
                    { label: 'Meal Prep Savings Opportunity', value: `Cutting waste in half saves $${Math.round(annualWastedDollars / 2).toLocaleString()} / year` }
                ]
            };
        }
    },
    // 12. Plastic Usage Calculator
    {
        id: 'plastic-usage-calculator',
        name: 'Plastic Usage Calculator',
        category: 'environmental-energy',
        group: 'Environment & Sustainability',
        bucket: 'Bucket B',
        tier: 5,
        phase: 5,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "Plastic Usage Calculator tool.",
        inputs: [
            { id: 'bottlesWeek', name: 'Plastic Beverage Bottles / Week', type: 'number', defaultValue: 6, min: 0, step: 1, tooltip: 'Single-use bottles.' },
            { id: 'bagsWeek', name: 'Plastic Shopping Bags / Week', type: 'number', defaultValue: 8, min: 0, step: 2, tooltip: 'Grocery bags.' },
            { id: 'takeoutContainersWeek', name: 'Plastic Takeout Food Containers / Week', type: 'number', defaultValue: 3, min: 0, step: 1, tooltip: 'Takeout boxes.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const bottles = Number(inputs.bottlesWeek) || 6;
            const bags = Number(inputs.bagsWeek) || 8;
            const takeout = Number(inputs.takeoutContainersWeek) || 3;

            const bottlesAnnual = bottles * 52;
            const bagsAnnual = bags * 52;
            const takeoutAnnual = takeout * 52;

            const totalItemsAnnual = bottlesAnnual + bagsAnnual + takeoutAnnual;
            const totalWeightLbs = (bottlesAnnual * 0.055) + (bagsAnnual * 0.015) + (takeoutAnnual * 0.088);
            const oilLitersConsumed = totalWeightLbs * 2.0; // ~2L petroleum per lb plastic produced

            return {
                primaryOutput: { label: 'Annual Single-Use Plastic Waste', value: `${totalItemsAnnual.toLocaleString()} Items`, suffix: `${totalWeightLbs.toFixed(1)} lbs / year` },
                secondaryMetrics: [
                    { label: 'Petroleum Consumed in Production', value: `~${Math.round(oilLitersConsumed)} Liters Crude Oil` },
                    { label: 'Bottles & Bags Discarded', value: `${bottlesAnnual} Bottles, ${bagsAnnual} Bags` },
                    { label: 'Decomposition Lifespan in Nature', value: '450 to 1,000+ Years per item' },
                    { label: 'Reusable Alternative Savings', value: `Switching to reusable saves ~$${Math.round(bottlesAnnual * 1.50)}/yr` }
                ]
            };
        }
    },
    // 13. Home Energy Audit Calculator
    {
        id: 'home-energy-audit-calculator',
        name: 'Home Energy Audit Calculator',
        category: 'environmental-energy',
        group: 'Environment & Sustainability',
        bucket: 'Bucket B',
        tier: 5,
        phase: 5,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "Home Energy Audit Calculator tool.",
        inputs: [
            { id: 'homeSqFt', name: 'Home Conditioned Area (Sq Ft)', type: 'number', defaultValue: 2200, min: 400, step: 100, suffix: 'sq ft', tooltip: 'House square footage.' },
            { id: 'annualEnergyBill', name: 'Total Annual Energy Bills ($)', type: 'number', defaultValue: 3200, min: 500, step: 100, prefix: '$', tooltip: 'Combined electric + gas/oil.' },
            { id: 'homeAgeBand', name: 'Home Construction Era', type: 'dropdown', defaultValue: '1980_1999', options: [{ label: 'Pre-1980 (Poor insulation & drafty windows - 35% potential)', value: 'pre1980' }, { label: 'Built 1980 - 2005 (Moderate envelope - 22% potential)', value: '1980_1999' }, { label: 'Built 2006 or Newer (Modern standard - 12% potential)', value: 'modern' }], tooltip: 'Construction era.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const sqFt = Number(inputs.homeSqFt) || 2200;
            const bill = Number(inputs.annualEnergyBill) || 3200;
            const era = String(inputs.homeAgeBand || '1980_1999');

            let potentialSavingsPct = 0.22;
            if (era === 'pre1980') potentialSavingsPct = 0.35;
            else if (era === 'modern') potentialSavingsPct = 0.12;

            const annualSavingsDollars = bill * potentialSavingsPct;
            const retrofitCostEst = (sqFt * 1.60); // Air sealing + attic insulation top-up
            const paybackYears = retrofitCostEst / annualSavingsDollars;
            const costPerSqFt = bill / sqFt;

            return {
                primaryOutput: { label: 'Potential Annual Energy Savings', value: `$${Math.round(annualSavingsDollars).toLocaleString()} / year`, suffix: `${(potentialSavingsPct * 100).toFixed(0)}% Bill Reduction` },
                secondaryMetrics: [
                    { label: 'Estimated Weatherization Retrofit Cost', value: `$${Math.round(retrofitCostEst).toLocaleString()}` },
                    { label: 'Upgrade Investment Payback', value: `${paybackYears.toFixed(1)} Years` },
                    { label: 'Current Energy Cost Intensity', value: `$${costPerSqFt.toFixed(2)} / sq ft / year` },
                    { label: '10-Year Cumulative Savings', value: `$${Math.round(annualSavingsDollars * 10).toLocaleString()}` }
                ]
            };
        }
    },
    // 14. Composting Calculator
    {
        id: 'composting-calculator',
        name: 'Composting Calculator',
        category: 'environmental-energy',
        group: 'Environment & Sustainability',
        bucket: 'Bucket B',
        tier: 5,
        phase: 5,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "Composting Calculator tool.",
        inputs: [
            { id: 'kitchenScrapsLbsWeek', name: 'Kitchen Food Scraps (lbs / week)', type: 'number', defaultValue: 10, min: 1, step: 2, suffix: 'lbs', tooltip: 'Vegetables, coffee, fruit peels.' },
            { id: 'yardWasteLbsWeek', name: 'Yard & Garden Browns (lbs / week)', type: 'number', defaultValue: 15, min: 0, step: 5, suffix: 'lbs', tooltip: 'Dry leaves, twigs, cardboard.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const kitchen = Number(inputs.kitchenScrapsLbsWeek) || 10;
            const yard = Number(inputs.yardWasteLbsWeek) || 15;

            const totalInputLbsAnnual = (kitchen + yard) * 52;
            // Finished compost yields ~30% of raw organic input weight due to decomposition & moisture loss
            const finishedCompostLbsAnnual = totalInputLbsAnnual * 0.30;
            const finishedCuYds = finishedCompostLbsAnnual / 1000; // ~1000 lbs per cu yd finished compost
            const landfillMethaneCO2e = (kitchen * 52) * 1.5; // lbs CO2e avoided

            return {
                primaryOutput: { label: 'Annual Finished Compost Output', value: `${Math.round(finishedCompostLbsAnnual)} lbs`, suffix: `${finishedCuYds.toFixed(2)} Cu Yds` },
                secondaryMetrics: [
                    { label: 'Total Organic Waste Diverted', value: `${Math.round(totalInputLbsAnnual).toLocaleString()} lbs / year` },
                    { label: 'Landfill Methane Emissions Avoided', value: `${Math.round(landfillMethaneCO2e).toLocaleString()} lbs CO2e / year` },
                    { label: 'Organic Soil Amendment Value', value: `~$${Math.round(finishedCuYds * 45)} worth of retail garden compost` },
                    { label: 'Optimal Carbon-to-Nitrogen Ratio', value: 'Maintain 2 to 3 parts Brown (Yard) to 1 part Green (Kitchen)' }
                ]
            };
        }
    },
    // 15. Green Building Cost Calculator
    {
        id: 'green-building-cost-calculator',
        name: 'Green Building Cost Calculator',
        category: 'environmental-energy',
        group: 'Environment & Sustainability',
        bucket: 'Bucket B',
        tier: 5,
        phase: 5,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "Green Building Cost Calculator tool.",
        inputs: [
            { id: 'buildingSqFt', name: 'Total Gross Building Area (Sq Ft)', type: 'number', defaultValue: 3000, min: 500, step: 250, suffix: 'sq ft', tooltip: 'Building area.' },
            { id: 'greenTier', name: 'Target Certification Standard', type: 'dropdown', defaultValue: 'leed_silver', options: [{ label: 'LEED Certified / Energy Star (+1.5% Premium)', value: 0.015 }, { label: 'LEED Silver (+3.0% Premium)', value: 0.03 }, { label: 'LEED Gold (+5.0% Premium)', value: 0.05 }, { label: 'LEED Platinum / Net-Zero Ready (+8.0% Premium)', value: 0.08 }], tooltip: 'Green rating tier.' },
            { id: 'baseCostPerSqFt', name: 'Standard Construction Baseline ($/sq ft)', type: 'number', defaultValue: 220, min: 100, step: 10, prefix: '$', tooltip: 'Baseline build cost.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const sqFt = Number(inputs.buildingSqFt) || 3000;
            const premiumRate = Number(inputs.greenTier) || 0.03;
            const baseCpsqft = Number(inputs.baseCostPerSqFt) || 220;

            const baseTotalCost = sqFt * baseCpsqft;
            const greenUpfrontPremium = baseTotalCost * premiumRate;
            const totalProjectCost = baseTotalCost + greenUpfrontPremium;

            // Operational utility savings: 25% - 40% reduction in annual utility bills
            const baseAnnualUtility = sqFt * 1.60;
            const annualUtilitySavings = baseAnnualUtility * (0.20 + (premiumRate * 2.5));
            const paybackYears = greenUpfrontPremium / annualUtilitySavings;
            const netBenefit30Year = (annualUtilitySavings * 30) - greenUpfrontPremium;

            return {
                primaryOutput: { label: 'Upfront Green Construction Premium', value: `$${Math.round(greenUpfrontPremium).toLocaleString()}`, suffix: `${(premiumRate * 100).toFixed(1)}% Premium` },
                secondaryMetrics: [
                    { label: 'Total Green Project Budget', value: `$${Math.round(totalProjectCost).toLocaleString()}` },
                    { label: 'Annual Operational Utility Savings', value: `$${Math.round(annualUtilitySavings).toLocaleString()} / year` },
                    { label: 'Investment Payback Period', value: `${paybackYears.toFixed(1)} Years` },
                    { label: '30-Year Net Lifecycle Financial Gain', value: `+$${Math.round(netBenefit30Year).toLocaleString()}` }
                ]
            };
        }
    }
];

export const cat11EnvironmentCalculators = environmentSustainabilityCalculators;
export default environmentSustainabilityCalculators;
