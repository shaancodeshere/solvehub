import { CalculatorDefinition } from '../../types/calculator';

export const conversionUnitsCalculators: CalculatorDefinition[] = [
    // 1. Length & Distance Converter
    {
        id: 'length-converter',
        name: 'Length & Distance Unit Converter',
        category: 'conversion-units',
        group: '8A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '1.2M',
        cpc: '$0.20',
        description: 'Converts lengths and distances across metric and imperial systems including meters, feet, inches, centimeters, kilometers, and miles.',
        inputs: [
            { id: 'inputValue', name: 'Length Magnitude', type: 'number', defaultValue: 100, step: 0.1, tooltip: 'Amount to convert.' },
            {
                id: 'fromUnit', name: 'From Unit', type: 'dropdown', defaultValue: 'm', options: [
                    { label: 'Meters (m)', value: 'm' },
                    { label: 'Kilometers (km)', value: 'km' },
                    { label: 'Centimeters (cm)', value: 'cm' },
                    { label: 'Millimeters (mm)', value: 'mm' },
                    { label: 'Inches (in)', value: 'in' },
                    { label: 'Feet (ft)', value: 'ft' },
                    { label: 'Yards (yd)', value: 'yd' },
                    { label: 'Miles (mi)', value: 'mi' }
                ], tooltip: 'Source unit.'
            }
        ],
        naturalLanguageQueries: [
            'Convert meters to feet',
            'Length converter inches to cm',
            'Kilometers to miles conversion'
        ],
        edgeCases: ['Negative length input guards'],
        calculate: (inputs) => {
            const val = Number(inputs.inputValue) || 0;
            const unit = inputs.fromUnit || 'm';

            // Base conversion to meters
            const toMeters: Record<string, number> = {
                m: 1,
                km: 1000,
                cm: 0.01,
                mm: 0.001,
                in: 0.0254,
                ft: 0.3048,
                yd: 0.9144,
                mi: 1609.344
            };

            const meters = val * (toMeters[unit] || 1);
            const feet = meters / 0.3048;
            const inches = meters / 0.0254;
            const km = meters / 1000;
            const miles = meters / 1609.344;
            const cm = meters * 100;

            return {
                primaryOutput: { label: 'Imperial Feet Equivalent', value: feet.toFixed(2), suffix: 'ft' },
                secondaryMetrics: [
                    { label: 'Inches (in)', value: `${inches.toFixed(2)} in` },
                    { label: 'Meters (m)', value: `${meters.toFixed(3)} m` },
                    { label: 'Centimeters (cm)', value: `${cm.toFixed(1)} cm` },
                    { label: 'Kilometers (km)', value: `${km.toFixed(4)} km` },
                    { label: 'Statute Miles (mi)', value: `${miles.toFixed(4)} mi` }
                ]
            };
        }
    },

    // 2. Mass & Weight Converter
    {
        id: 'weight-mass-converter',
        name: 'Weight & Mass Converter',
        category: 'conversion-units',
        group: '8A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '823K',
        cpc: '$0.25',
        description: 'Converts mass across kilograms, pounds (lbs), ounces (oz), grams, stones, and metric tons.',
        inputs: [
            { id: 'massValue', name: 'Weight / Mass Value', type: 'number', defaultValue: 175, min: 0, step: 0.5, tooltip: 'Weight to convert.' },
            {
                id: 'fromUnit', name: 'From Unit', type: 'dropdown', defaultValue: 'lb', options: [
                    { label: 'Pounds (lbs)', value: 'lb' },
                    { label: 'Kilograms (kg)', value: 'kg' },
                    { label: 'Grams (g)', value: 'g' },
                    { label: 'Ounces (oz)', value: 'oz' },
                    { label: 'Stones (st - UK)', value: 'st' },
                    { label: 'Metric Tons (t)', value: 't' }
                ], tooltip: 'Origin unit.'
            }
        ],
        naturalLanguageQueries: [
            'Lbs to kg converter',
            'Convert 175 lbs to kilograms',
            'Weight converter grams to ounces'
        ],
        edgeCases: ['Zero mass values'],
        calculate: (inputs) => {
            const val = Number(inputs.massValue) || 0;
            const unit = inputs.fromUnit || 'lb';

            // Base conversion to kilograms
            const toKg: Record<string, number> = {
                kg: 1,
                g: 0.001,
                lb: 0.45359237,
                oz: 0.028349523125,
                st: 6.35029318,
                t: 1000
            };

            const kg = val * (toKg[unit] || 1);
            const lbs = kg / 0.45359237;
            const oz = kg / 0.028349523125;
            const grams = kg * 1000;
            const stones = kg / 6.35029318;

            return {
                primaryOutput: { label: 'Kilograms Equivalent', value: kg.toFixed(2), suffix: 'kg' },
                secondaryMetrics: [
                    { label: 'Pounds (lbs)', value: `${lbs.toFixed(2)} lbs` },
                    { label: 'Ounces (oz)', value: `${oz.toFixed(1)} oz` },
                    { label: 'Grams (g)', value: `${grams.toLocaleString()} g` },
                    { label: 'Stones (UK)', value: `${stones.toFixed(2)} st` }
                ]
            };
        }
    },

    // 3. Temperature Scale Converter
    {
        id: 'temperature-converter',
        name: 'Temperature Scale Converter',
        category: 'conversion-units',
        group: '8A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '1.5M',
        cpc: '$0.20',
        description: 'Converts temperatures across Celsius (°C), Fahrenheit (°F), Kelvin (K), and Rankine (°R).',
        inputs: [
            { id: 'tempValue', name: 'Temperature Value', type: 'number', defaultValue: 72, step: 0.5, tooltip: 'Measured temperature.' },
            {
                id: 'fromScale', name: 'From Scale', type: 'dropdown', defaultValue: 'f', options: [
                    { label: 'Fahrenheit (°F)', value: 'f' },
                    { label: 'Celsius (°C)', value: 'c' },
                    { label: 'Kelvin (K)', value: 'k' }
                ], tooltip: 'Source scale.'
            }
        ],
        naturalLanguageQueries: [
            '72 F to Celsius',
            'Temperature converter Fahrenheit to Celsius',
            'Convert Celsius to Kelvin'
        ],
        edgeCases: ['Temperatures below absolute zero (0 K / -273.15 °C)'],
        calculate: (inputs) => {
            const val = Number(inputs.tempValue) || 72;
            const scale = inputs.fromScale || 'f';

            // Normalize to Celsius
            let celsius = 0;
            if (scale === 'f') celsius = (val - 32) * (5 / 9);
            else if (scale === 'k') celsius = val - 273.15;
            else celsius = val;

            const fahrenheit = (celsius * (9 / 5)) + 32;
            const kelvin = celsius + 273.15;
            const rankine = (celsius + 273.15) * (9 / 5);

            return {
                primaryOutput: { label: 'Celsius Equivalent', value: celsius.toFixed(2), suffix: '°C' },
                secondaryMetrics: [
                    { label: 'Fahrenheit (°F)', value: `${fahrenheit.toFixed(2)} °F` },
                    { label: 'Kelvin Absolute (K)', value: `${kelvin.toFixed(2)} K` },
                    { label: 'Rankine (°R)', value: `${rankine.toFixed(2)} °R` }
                ]
            };
        }
    },

    // 4. Pressure & Stress Converter
    {
        id: 'pressure-converter',
        name: 'Pressure & Stress Unit Converter',
        category: 'conversion-units',
        group: '8A',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '110K',
        cpc: '$0.35',
        description: 'Converts pressure and mechanical stress across PSI, Bar, Pascal (Pa), Kilopascal (kPa), Atmosphere (atm), and Torr/mmHg.',
        inputs: [
            { id: 'pressureValue', name: 'Pressure Value', type: 'number', defaultValue: 32, min: 0, step: 0.5, tooltip: 'Tire or hydraulic pressure.' },
            {
                id: 'fromUnit', name: 'From Unit', type: 'dropdown', defaultValue: 'psi', options: [
                    { label: 'Pounds per sq inch (PSI)', value: 'psi' },
                    { label: 'Bar', value: 'bar' },
                    { label: 'Kilopascals (kPa)', value: 'kpa' },
                    { label: 'Standard Atmospheres (atm)', value: 'atm' },
                    { label: 'Millimeters of Mercury (mmHg / Torr)', value: 'mmhg' }
                ], tooltip: 'Source pressure unit.'
            }
        ],
        naturalLanguageQueries: [
            'Convert 32 PSI to Bar',
            'Pressure converter PSI to kPa',
            'Bar to atmospheric pressure'
        ],
        edgeCases: ['Zero pressure baseline'],
        calculate: (inputs) => {
            const val = Number(inputs.pressureValue) || 32;
            const unit = inputs.fromUnit || 'psi';

            // Base conversion to Pascals (Pa)
            const toPascals: Record<string, number> = {
                psi: 6894.75729,
                bar: 100000,
                kpa: 1000,
                atm: 101325,
                mmhg: 133.322368
            };

            const pa = val * (toPascals[unit] || 6894.75729);
            const psi = pa / 6894.75729;
            const bar = pa / 100000;
            const kpa = pa / 1000;
            const atm = pa / 101325;
            const mmhg = pa / 133.322368;

            return {
                primaryOutput: { label: 'Bar Equivalent', value: bar.toFixed(3), suffix: 'bar' },
                secondaryMetrics: [
                    { label: 'Pounds per Sq Inch (PSI)', value: `${psi.toFixed(2)} PSI` },
                    { label: 'Kilopascals (kPa)', value: `${kpa.toFixed(2)} kPa` },
                    { label: 'Standard Atmospheres (atm)', value: `${atm.toFixed(3)} atm` },
                    { label: 'Torr / mmHg', value: `${mmhg.toFixed(1)} mmHg` }
                ]
            };
        }
    },

    // 5. Liquid Volume & Capacity Converter
    {
        id: 'volume-converter',
        name: 'Liquid Volume & Capacity Converter',
        category: 'conversion-units',
        group: '8A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '450K',
        cpc: '$0.25',
        description: 'Converts liquid volumes across US Gallons, Liters, Milliliters, Fluid Ounces, Quarts, Pints, and Cups.',
        inputs: [
            { id: 'volumeValue', name: 'Volume Magnitude', type: 'number', defaultValue: 1, min: 0, step: 0.1, tooltip: 'Amount of liquid.' },
            {
                id: 'fromUnit', name: 'From Unit', type: 'dropdown', defaultValue: 'gal', options: [
                    { label: 'US Gallons (gal)', value: 'gal' },
                    { label: 'Liters (L)', value: 'l' },
                    { label: 'Milliliters (mL)', value: 'ml' },
                    { label: 'Fluid Ounces (fl oz)', value: 'floz' },
                    { label: 'Quarts (qt)', value: 'qt' },
                    { label: 'Pints (pt)', value: 'pt' },
                    { label: 'US Cups', value: 'cup' }
                ], tooltip: 'Source liquid unit.'
            }
        ],
        naturalLanguageQueries: [
            'Gallons to liters converter',
            'Convert 1 gallon to fluid ounces',
            'Cups to milliliters conversion'
        ],
        edgeCases: ['Zero liquid volume'],
        calculate: (inputs) => {
            const val = Number(inputs.volumeValue) || 1;
            const unit = inputs.fromUnit || 'gal';

            // Base conversion to Liters
            const toLiters: Record<string, number> = {
                l: 1,
                ml: 0.001,
                gal: 3.785411784,
                floz: 0.0295735295625,
                qt: 0.946352946,
                pt: 0.473176473,
                cup: 0.2365882365
            };

            const liters = val * (toLiters[unit] || 3.785411784);
            const gallons = liters / 3.785411784;
            const flOz = liters / 0.0295735295625;
            const ml = liters * 1000;
            const cups = liters / 0.2365882365;

            return {
                primaryOutput: { label: 'Metric Liters Equivalent', value: liters.toFixed(3), suffix: 'Liters (L)' },
                secondaryMetrics: [
                    { label: 'US Gallons', value: `${gallons.toFixed(3)} gal` },
                    { label: 'Fluid Ounces (fl oz)', value: `${flOz.toFixed(1)} fl oz` },
                    { label: 'Milliliters (mL)', value: `${ml.toFixed(0)} mL` },
                    { label: 'US Cups', value: `${cups.toFixed(2)} Cups` }
                ]
            };
        }
    }
];