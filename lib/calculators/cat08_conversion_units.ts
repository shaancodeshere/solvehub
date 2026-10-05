import { CalculatorDefinition } from '@/types/calculator';

export const conversionUnitsCalculators: CalculatorDefinition[] = [
    // 1. Conversion Calculator
    {
        id: 'conversion-calculator',
        name: 'Conversion Calculator',
        category: 'conversion-units',
        group: 'Conversion & Units',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '90K',
        cpc: '$0.59',
        description: "Conversion Calculator tool.",
        inputs: [
            { id: 'category', name: 'Conversion Category', type: 'dropdown', defaultValue: 'length', options: [{ label: 'Length & Distance', value: 'length' }, { label: 'Weight & Mass', value: 'weight' }, { label: 'Temperature', value: 'temp' }, { label: 'Volume & Liquid', value: 'volume' }, { label: 'Area', value: 'area' }, { label: 'Speed & Velocity', value: 'speed' }], tooltip: 'Unit dimension.' },
            { id: 'inputValue', name: 'Input Value', type: 'number', defaultValue: 100, min: -1000000, step: 1, tooltip: 'Amount to convert.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const cat = String(inputs.category || 'length');
            const val = Number(inputs.inputValue) || 100;

            if (cat === 'length') {
                const meters = val;
                const feet = meters * 3.28084;
                const inches = meters * 39.3701;
                const miles = meters * 0.000621371;
                const km = meters / 1000;
                return {
                    primaryOutput: { label: 'Feet & Inches', value: `${feet.toFixed(2)} ft`, suffix: `${inches.toFixed(1)}"` },
                    secondaryMetrics: [
                        { label: 'Miles (mi)', value: `${miles.toFixed(4)} mi` },
                        { label: 'Kilometers (km)', value: `${km.toFixed(3)} km` },
                        { label: 'Centimeters (cm)', value: `${(meters * 100).toLocaleString()} cm` },
                        { label: 'Yards (yd)', value: `${(meters * 1.09361).toFixed(2)} yd` }
                    ]
                };
            } else if (cat === 'weight') {
                const kg = val;
                const lbs = kg * 2.20462;
                const oz = kg * 35.274;
                const grams = kg * 1000;
                const stones = Math.floor(lbs / 14);
                const remLbs = lbs % 14;
                return {
                    primaryOutput: { label: 'Pounds (lbs)', value: `${lbs.toFixed(2)} lbs`, suffix: `${oz.toFixed(1)} oz` },
                    secondaryMetrics: [
                        { label: 'Stone & Pounds (UK)', value: `${stones} st ${remLbs.toFixed(1)} lbs` },
                        { label: 'Grams (g)', value: `${grams.toLocaleString()} g` },
                        { label: 'Metric Tons (t)', value: `${(kg / 1000).toFixed(4)} t` },
                        { label: 'Ounces (oz)', value: `${oz.toFixed(1)} oz` }
                    ]
                };
            } else if (cat === 'temp') {
                const c = val;
                const f = (c * 9 / 5) + 32;
                const k = c + 273.15;
                const r = (c + 273.15) * 9 / 5;
                return {
                    primaryOutput: { label: 'Fahrenheit (°F)', value: `${f.toFixed(2)}°F`, suffix: `${k.toFixed(2)} K` },
                    secondaryMetrics: [
                        { label: 'Kelvin (K)', value: `${k.toFixed(2)} K` },
                        { label: 'Rankine (°R)', value: `${r.toFixed(2)}°R` },
                        { label: 'Freezing Point Spread', value: `${(c - 0).toFixed(1)}°C above water freeze` },
                        { label: 'Boiling Point Spread', value: `${(100 - c).toFixed(1)}°C below water boil` }
                    ]
                };
            } else if (cat === 'volume') {
                const liters = val;
                const galUS = liters * 0.264172;
                const flOz = liters * 33.814;
                const cups = liters * 4.22675;
                return {
                    primaryOutput: { label: 'US Gallons (gal)', value: `${galUS.toFixed(3)} gal`, suffix: `${flOz.toFixed(1)} fl oz` },
                    secondaryMetrics: [
                        { label: 'Fluid Ounces (fl oz)', value: `${flOz.toFixed(1)} fl oz` },
                        { label: 'US Cups', value: `${cups.toFixed(2)} cups` },
                        { label: 'Imperial Gallons (UK)', value: `${(liters * 0.219969).toFixed(3)} gal` },
                        { label: 'Cubic Meters (m³)', value: `${(liters / 1000).toFixed(4)} m³` }
                    ]
                };
            } else if (cat === 'area') {
                const sqM = val;
                const sqFt = sqM * 10.7639;
                const acres = sqM * 0.000247105;
                const hectares = sqM / 10000;
                return {
                    primaryOutput: { label: 'Square Feet (sq ft)', value: `${sqFt.toFixed(2)} sq ft`, suffix: `${acres.toFixed(4)} Acres` },
                    secondaryMetrics: [
                        { label: 'Acres', value: `${acres.toFixed(4)} ac` },
                        { label: 'Hectares (ha)', value: `${hectares.toFixed(4)} ha` },
                        { label: 'Square Yards (sq yd)', value: `${(sqM * 1.19599).toFixed(2)} sq yd` },
                        { label: 'Square Kilometers (km²)', value: `${(sqM / 1000000).toFixed(6)} km²` }
                    ]
                };
            } else {
                // speed
                const kmh = val;
                const mph = kmh * 0.621371;
                const mps = kmh / 3.6;
                const knots = kmh * 0.539957;
                return {
                    primaryOutput: { label: 'Miles per Hour (MPH)', value: `${mph.toFixed(2)} MPH`, suffix: `${mps.toFixed(2)} m/s` },
                    secondaryMetrics: [
                        { label: 'Meters per Second (m/s)', value: `${mps.toFixed(2)} m/s` },
                        { label: 'Knots (NM/hr)', value: `${knots.toFixed(2)} knots` },
                        { label: 'Feet per Second (ft/s)', value: `${(mph * 1.46667).toFixed(2)} ft/s` },
                        { label: 'Mach (Sea Level Std)', value: `Mach ${(mps / 340.29).toFixed(3)}` }
                    ]
                };
            }
        }
    },
    // 2. Shoe Size Conversion
    {
        id: 'shoe-size-conversion-calculator',
        name: 'Shoe Size Conversion',
        category: 'conversion-units',
        group: 'Conversion & Units',
        bucket: 'Bucket C1',
        tier: 2,
        phase: 2,
        monthlySearches: '60K',
        cpc: '$0.24',
        description: "Shoe Size Conversion tool.",
        inputs: [
            { id: 'gender', name: 'Gender / Sizing Standard', type: 'dropdown', defaultValue: 'men', options: [{ label: 'US Men', value: 'men' }, { label: 'US Women', value: 'women' }, { label: 'Youth / Big Kids', value: 'youth' }], tooltip: 'Shoe category.' },
            { id: 'usSize', name: 'US Shoe Size', type: 'number', defaultValue: 10, min: 4, max: 16, step: 0.5, tooltip: 'US shoe size.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const g = String(inputs.gender || 'men');
            const us = Number(inputs.usSize) || 10;

            let uk = us - 0.5;
            let eu = 33 + (us * 1.33);
            let cm = 22 + (us * 0.85);
            let inches = cm / 2.54;

            if (g === 'women') {
                uk = us - 2.0;
                eu = 31 + (us * 1.33);
                cm = 20.5 + (us * 0.85);
                inches = cm / 2.54;
            }

            const euRounded = Math.round(eu);

            return {
                primaryOutput: { label: 'European (EU) Size', value: `EU ${euRounded}`, suffix: `UK ${uk.toFixed(1)}` },
                secondaryMetrics: [
                    { label: 'UK Shoe Size', value: `UK ${uk.toFixed(1)}` },
                    { label: 'Foot Length (Centimeters / CM / Mondo)', value: `${cm.toFixed(1)} cm` },
                    { label: 'Foot Length (Inches)', value: `${inches.toFixed(2)} inches` },
                    { label: 'US Cross-Gender Equivalent', value: g === 'men' ? `US Women's ${(us + 1.5).toFixed(1)}` : `US Men's ${(us - 1.5).toFixed(1)}` }
                ]
            };
        }
    },
    // 3. Temperature Converter
    {
        id: 'temperature-converter',
        name: 'Temperature Converter',
        category: 'conversion-units',
        group: 'Conversion & Units',
        bucket: 'Bucket B',
        tier: 2,
        phase: 1,
        monthlySearches: '27K',
        cpc: '$0.07',
        description: "Temperature Converter tool.",
        inputs: [
            { id: 'tempVal', name: 'Temperature Value', type: 'number', defaultValue: 100, min: -460, max: 10000, step: 1, tooltip: 'Temperature reading.' },
            { id: 'unitFrom', name: 'Source Scale', type: 'dropdown', defaultValue: 'C', options: [{ label: 'Celsius (°C)', value: 'C' }, { label: 'Fahrenheit (°F)', value: 'F' }, { label: 'Kelvin (K)', value: 'K' }, { label: 'Rankine (°R)', value: 'R' }], tooltip: 'Origin scale.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const val = Number(inputs.tempVal) ?? 100;
            const unit = String(inputs.unitFrom || 'C');

            let c = val;
            if (unit === 'F') c = (val - 32) * 5 / 9;
            else if (unit === 'K') c = val - 273.15;
            else if (unit === 'R') c = (val - 491.67) * 5 / 9;

            const f = (c * 9 / 5) + 32;
            const k = c + 273.15;
            const r = (c + 273.15) * 9 / 5;

            return {
                primaryOutput: { label: 'Converted Temperature', value: unit === 'C' ? `${f.toFixed(2)}°F` : `${c.toFixed(2)}°C`, suffix: `${k.toFixed(2)} K` },
                secondaryMetrics: [
                    { label: 'Celsius (°C)', value: `${c.toFixed(2)}°C` },
                    { label: 'Fahrenheit (°F)', value: `${f.toFixed(2)}°F` },
                    { label: 'Kelvin (K)', value: `${k.toFixed(2)} K` },
                    { label: 'Rankine (°R)', value: `${r.toFixed(2)}°R` }
                ]
            };
        }
    },
    // 4. Length Converter
    {
        id: 'length-converter',
        name: 'Length Converter',
        category: 'conversion-units',
        group: 'Conversion & Units',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '110K',
        cpc: '$0.46',
        description: "Length Converter tool.",
        inputs: [
            { id: 'lengthVal', name: 'Length Value', type: 'number', defaultValue: 10, min: 0.0001, step: 1, tooltip: 'Length amount.' },
            { id: 'unitFrom', name: 'Source Unit', type: 'dropdown', defaultValue: 'm', options: [{ label: 'Meters (m)', value: 'm' }, { label: 'Feet (ft)', value: 'ft' }, { label: 'Inches (in)', value: 'in' }, { label: 'Kilometers (km)', value: 'km' }, { label: 'Miles (mi)', value: 'mi' }, { label: 'Yards (yd)', value: 'yd' }, { label: 'Centimeters (cm)', value: 'cm' }, { label: 'Millimeters (mm)', value: 'mm' }, { label: 'Nautical Miles (NM)', value: 'nm' }], tooltip: 'Source unit.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const val = Number(inputs.lengthVal) || 10;
            const unit = String(inputs.unitFrom || 'm');

            const toMeters: Record<string, number> = {
                m: 1,
                ft: 0.3048,
                in: 0.0254,
                km: 1000,
                mi: 1609.344,
                yd: 0.9144,
                cm: 0.01,
                mm: 0.001,
                nm: 1852
            };

            const meters = val * (toMeters[unit] || 1);
            const feet = meters / 0.3048;
            const inches = meters / 0.0254;
            const km = meters / 1000;
            const miles = meters / 1609.344;
            const yards = meters / 0.9144;

            return {
                primaryOutput: { label: 'Imperial (Feet / Inches)', value: `${feet.toFixed(3)} ft`, suffix: `${inches.toFixed(2)}"` },
                secondaryMetrics: [
                    { label: 'Metric Meters (m)', value: `${meters.toFixed(4)} m` },
                    { label: 'Kilometers (km)', value: `${km.toFixed(4)} km` },
                    { label: 'Statute Miles (mi)', value: `${miles.toFixed(4)} mi` },
                    { label: 'Yards (yd)', value: `${yards.toFixed(3)} yd` }
                ]
            };
        }
    },
    // 5. Weight Converter
    {
        id: 'weight-converter',
        name: 'Weight Converter',
        category: 'conversion-units',
        group: 'Conversion & Units',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '135K',
        cpc: '$0.52',
        description: "Weight Converter tool.",
        inputs: [
            { id: 'weightVal', name: 'Weight Value', type: 'number', defaultValue: 175, min: 0.001, step: 1, tooltip: 'Weight magnitude.' },
            { id: 'unitFrom', name: 'Source Unit', type: 'dropdown', defaultValue: 'lb', options: [{ label: 'Pounds (lbs)', value: 'lb' }, { label: 'Kilograms (kg)', value: 'kg' }, { label: 'Grams (g)', value: 'g' }, { label: 'Ounces (oz)', value: 'oz' }, { label: 'Metric Tons (t)', value: 't' }, { label: 'Stones (st)', value: 'st' }], tooltip: 'Original unit.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const val = Number(inputs.weightVal) || 175;
            const unit = String(inputs.unitFrom || 'lb');

            const toKg: Record<string, number> = {
                kg: 1,
                lb: 0.45359237,
                g: 0.001,
                oz: 0.028349523,
                t: 1000,
                st: 6.35029318
            };

            const kg = val * (toKg[unit] || 1);
            const lbs = kg / 0.45359237;
            const oz = kg / 0.028349523;
            const grams = kg * 1000;
            const stones = Math.floor(lbs / 14);
            const remLbs = lbs % 14;

            return {
                primaryOutput: { label: 'Converted Weight', value: unit === 'kg' ? `${lbs.toFixed(2)} lbs` : `${kg.toFixed(2)} kg`, suffix: `${oz.toFixed(1)} oz` },
                secondaryMetrics: [
                    { label: 'Kilograms (kg)', value: `${kg.toFixed(3)} kg` },
                    { label: 'Pounds (lbs)', value: `${lbs.toFixed(2)} lbs` },
                    { label: 'Stone & Pounds (UK)', value: `${stones} st ${remLbs.toFixed(1)} lbs` },
                    { label: 'Grams (g)', value: `${Math.round(grams).toLocaleString()} g` }
                ]
            };
        }
    },
    // 6. Volume Converter
    {
        id: 'volume-converter',
        name: 'Volume Converter',
        category: 'conversion-units',
        group: 'Conversion & Units',
        bucket: 'Bucket B',
        tier: 4,
        phase: 3,
        monthlySearches: '4K',
        cpc: 'N/A',
        description: "Volume Converter tool.",
        inputs: [
            { id: 'volumeVal', name: 'Volume Quantity', type: 'number', defaultValue: 1, min: 0.0001, step: 0.5, tooltip: 'Volume measure.' },
            { id: 'unitFrom', name: 'Source Unit', type: 'dropdown', defaultValue: 'gal_us', options: [{ label: 'US Gallons (gal)', value: 'gal_us' }, { label: 'Liters (L)', value: 'l' }, { label: 'Milliliters (mL)', value: 'ml' }, { label: 'Fluid Ounces (fl oz)', value: 'floz' }, { label: 'US Cups', value: 'cups' }, { label: 'Cubic Meters (m³)', value: 'm3' }, { label: 'Cubic Feet (ft³)', value: 'ft3' }], tooltip: 'Source unit.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const val = Number(inputs.volumeVal) || 1;
            const unit = String(inputs.unitFrom || 'gal_us');

            const toLiters: Record<string, number> = {
                l: 1,
                gal_us: 3.785411784,
                ml: 0.001,
                floz: 0.02957353,
                cups: 0.236588236,
                m3: 1000,
                ft3: 28.316846592
            };

            const liters = val * (toLiters[unit] || 1);
            const galUS = liters / 3.785411784;
            const flOz = liters / 0.02957353;
            const cups = liters / 0.236588236;
            const ml = liters * 1000;
            const cuFt = liters / 28.316846592;

            return {
                primaryOutput: { label: 'Converted Volume', value: unit === 'l' ? `${galUS.toFixed(3)} US Gal` : `${liters.toFixed(3)} Liters`, suffix: `${flOz.toFixed(1)} fl oz` },
                secondaryMetrics: [
                    { label: 'US Liquid Gallons', value: `${galUS.toFixed(3)} gal` },
                    { label: 'Liters (L)', value: `${liters.toFixed(3)} L` },
                    { label: 'Fluid Ounces (fl oz)', value: `${flOz.toFixed(1)} fl oz` },
                    { label: 'Cubic Feet (ft³)', value: `${cuFt.toFixed(3)} ft³` }
                ]
            };
        }
    },
    // 7. Area Converter
    {
        id: 'area-converter',
        name: 'Area Converter',
        category: 'conversion-units',
        group: 'Conversion & Units',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '40K',
        cpc: '$0.03',
        description: "Area Converter tool.",
        inputs: [
            { id: 'areaVal', name: 'Area Quantity', type: 'number', defaultValue: 1, min: 0.0001, step: 0.5, tooltip: 'Surface area.' },
            { id: 'unitFrom', name: 'Source Unit', type: 'dropdown', defaultValue: 'acres', options: [{ label: 'Acres (ac)', value: 'acres' }, { label: 'Square Feet (sq ft)', value: 'sq_ft' }, { label: 'Square Meters (m²)', value: 'sq_m' }, { label: 'Hectares (ha)', value: 'hectares' }, { label: 'Square Miles (sq mi)', value: 'sq_mi' }, { label: 'Square Kilometers (km²)', value: 'sq_km' }], tooltip: 'Source unit.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const val = Number(inputs.areaVal) || 1;
            const unit = String(inputs.unitFrom || 'acres');

            const toSqM: Record<string, number> = {
                sq_m: 1,
                acres: 4046.8564224,
                sq_ft: 0.09290304,
                hectares: 10000,
                sq_mi: 2589988.110336,
                sq_km: 1000000
            };

            const sqM = val * (toSqM[unit] || 1);
            const sqFt = sqM / 0.09290304;
            const acres = sqM / 4046.8564224;
            const ha = sqM / 10000;
            const sqMi = sqM / 2589988.110336;

            return {
                primaryOutput: { label: 'Converted Area', value: unit === 'acres' ? `${Math.round(sqFt).toLocaleString()} sq ft` : `${acres.toFixed(3)} Acres`, suffix: `${ha.toFixed(3)} Hectares` },
                secondaryMetrics: [
                    { label: 'Square Feet (sq ft)', value: `${Math.round(sqFt).toLocaleString()} sq ft` },
                    { label: 'Acres (ac)', value: `${acres.toFixed(4)} ac` },
                    { label: 'Square Meters (m²)', value: `${Math.round(sqM).toLocaleString()} m²` },
                    { label: 'Hectares (ha)', value: `${ha.toFixed(4)} ha` }
                ]
            };
        }
    },
    // 8. Speed Converter
    {
        id: 'speed-converter',
        name: 'Speed Converter',
        category: 'conversion-units',
        group: 'Conversion & Units',
        bucket: 'Bucket B',
        tier: 4,
        phase: 3,
        monthlySearches: '4K',
        cpc: '$0.43',
        description: "Speed Converter tool.",
        inputs: [
            { id: 'speedVal', name: 'Speed Magnitude', type: 'number', defaultValue: 65, min: 0.01, step: 1, tooltip: 'Speed value.' },
            { id: 'unitFrom', name: 'Source Unit', type: 'dropdown', defaultValue: 'mph', options: [{ label: 'Miles per Hour (MPH)', value: 'mph' }, { label: 'Kilometers per Hour (km/h)', value: 'kmh' }, { label: 'Meters per Second (m/s)', value: 'mps' }, { label: 'Knots (NM/h)', value: 'knots' }, { label: 'Feet per Second (ft/s)', value: 'ftps' }], tooltip: 'Source unit.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const val = Number(inputs.speedVal) || 65;
            const unit = String(inputs.unitFrom || 'mph');

            const toKmh: Record<string, number> = {
                kmh: 1,
                mph: 1.609344,
                mps: 3.6,
                knots: 1.852,
                ftps: 1.09728
            };

            const kmh = val * (toKmh[unit] || 1);
            const mph = kmh / 1.609344;
            const mps = kmh / 3.6;
            const knots = kmh / 1.852;
            const ftps = kmh / 1.09728;

            return {
                primaryOutput: { label: 'Converted Speed', value: unit === 'mph' ? `${kmh.toFixed(2)} km/h` : `${mph.toFixed(2)} MPH`, suffix: `${mps.toFixed(2)} m/s` },
                secondaryMetrics: [
                    { label: 'Miles per Hour (MPH)', value: `${mph.toFixed(2)} MPH` },
                    { label: 'Kilometers per Hour (km/h)', value: `${kmh.toFixed(2)} km/h` },
                    { label: 'Meters per Second (m/s)', value: `${mps.toFixed(2)} m/s` },
                    { label: 'Knots (Nautical MPH)', value: `${knots.toFixed(2)} knots` }
                ]
            };
        }
    },
    // 9. Pressure Converter
    {
        id: 'pressure-converter',
        name: 'Pressure Converter',
        category: 'conversion-units',
        group: 'Conversion & Units',
        bucket: 'Bucket B',
        tier: 4,
        phase: 4,
        monthlySearches: '4K',
        cpc: '$0.62',
        description: "Pressure Converter tool.",
        inputs: [
            { id: 'pressureVal', name: 'Pressure Value', type: 'number', defaultValue: 32, min: 0.001, step: 1, tooltip: 'Pressure reading.' },
            { id: 'unitFrom', name: 'Source Unit', type: 'dropdown', defaultValue: 'psi', options: [{ label: 'Pounds per Sq Inch (PSI)', value: 'psi' }, { label: 'Bar', value: 'bar' }, { label: 'Kilopascals (kPa)', value: 'kpa' }, { label: 'Atmospheres (atm)', value: 'atm' }, { label: 'Pascals (Pa)', value: 'pa' }, { label: 'Millimeters of Mercury (mmHg / Torr)', value: 'mmhg' }], tooltip: 'Source scale.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const val = Number(inputs.pressureVal) || 32;
            const unit = String(inputs.unitFrom || 'psi');

            const toPa: Record<string, number> = {
                pa: 1,
                kpa: 1000,
                bar: 100000,
                psi: 6894.75729,
                atm: 101325,
                mmhg: 133.322368
            };

            const pa = val * (toPa[unit] || 1);
            const psi = pa / 6894.75729;
            const bar = pa / 100000;
            const kpa = pa / 1000;
            const atm = pa / 101325;
            const mmhg = pa / 133.322368;

            return {
                primaryOutput: { label: 'Converted Pressure', value: unit === 'psi' ? `${bar.toFixed(3)} bar` : `${psi.toFixed(2)} PSI`, suffix: `${kpa.toFixed(1)} kPa` },
                secondaryMetrics: [
                    { label: 'Bar', value: `${bar.toFixed(4)} bar` },
                    { label: 'Pounds per Sq Inch (PSI)', value: `${psi.toFixed(2)} PSI` },
                    { label: 'Standard Atmospheres (atm)', value: `${atm.toFixed(4)} atm` },
                    { label: 'Millimeters of Mercury (mmHg)', value: `${mmhg.toFixed(1)} mmHg` }
                ]
            };
        }
    },
    // 10. Energy Converter
    {
        id: 'energy-converter',
        name: 'Energy Converter',
        category: 'conversion-units',
        group: 'Conversion & Units',
        bucket: 'Bucket B',
        tier: 4,
        phase: 4,
        monthlySearches: '4K',
        cpc: '$4.22',
        description: "Energy Converter tool.",
        inputs: [
            { id: 'energyVal', name: 'Energy Magnitude', type: 'number', defaultValue: 1000, min: 0.001, step: 50, tooltip: 'Energy quantity.' },
            { id: 'unitFrom', name: 'Source Unit', type: 'dropdown', defaultValue: 'kwh', options: [{ label: 'Kilowatt-hours (kWh)', value: 'kwh' }, { label: 'Joules (J)', value: 'j' }, { label: 'Kilojoules (kJ)', value: 'kj' }, { label: 'Dietary Calories (kcal)', value: 'kcal' }, { label: 'British Thermal Units (BTU)', value: 'btu' }, { label: 'Foot-Pounds (ft-lbf)', value: 'ftlbf' }], tooltip: 'Source unit.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const val = Number(inputs.energyVal) || 1000;
            const unit = String(inputs.unitFrom || 'kwh');

            const toJoules: Record<string, number> = {
                j: 1,
                kj: 1000,
                kwh: 3600000,
                kcal: 4184,
                btu: 1055.05585,
                ftlbf: 1.355817948
            };

            const joules = val * (toJoules[unit] || 1);
            const kwh = joules / 3600000;
            const btu = joules / 1055.05585;
            const kcal = joules / 4184;
            const kj = joules / 1000;

            return {
                primaryOutput: { label: 'Converted Energy', value: unit === 'kwh' ? `${Math.round(btu).toLocaleString()} BTU` : `${kwh.toFixed(3)} kWh`, suffix: `${kj.toFixed(1)} kJ` },
                secondaryMetrics: [
                    { label: 'Kilowatt-Hours (kWh)', value: `${kwh.toFixed(4)} kWh` },
                    { label: 'BTU (British Thermal Units)', value: `${Math.round(btu).toLocaleString()} BTU` },
                    { label: 'Dietary Calories (kcal)', value: `${Math.round(kcal).toLocaleString()} kcal` },
                    { label: 'Kilojoules (kJ)', value: `${Math.round(kj).toLocaleString()} kJ` }
                ]
            };
        }
    },
    // 11. Power Converter
    {
        id: 'power-converter',
        name: 'Power Converter',
        category: 'conversion-units',
        group: 'Conversion & Units',
        bucket: 'Bucket B',
        tier: 3,
        phase: 4,
        monthlySearches: '12K',
        cpc: '$0.48',
        description: "Power Converter tool.",
        inputs: [
            { id: 'powerVal', name: 'Power Magnitude', type: 'number', defaultValue: 100, min: 0.001, step: 10, tooltip: 'Power output.' },
            { id: 'unitFrom', name: 'Source Unit', type: 'dropdown', defaultValue: 'hp', options: [{ label: 'Mechanical Horsepower (HP)', value: 'hp' }, { label: 'Kilowatts (kW)', value: 'kw' }, { label: 'Watts (W)', value: 'w' }, { label: 'Metric Horsepower (PS)', value: 'ps' }, { label: 'BTU per hour (BTU/hr)', value: 'btu_hr' }], tooltip: 'Source unit.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const val = Number(inputs.powerVal) || 100;
            const unit = String(inputs.unitFrom || 'hp');

            const toWatts: Record<string, number> = {
                w: 1,
                kw: 1000,
                hp: 745.699872,
                ps: 735.49875,
                btu_hr: 0.29307107
            };

            const watts = val * (toWatts[unit] || 1);
            const hp = watts / 745.699872;
            const kw = watts / 1000;
            const ps = watts / 735.49875;
            const btuHr = watts / 0.29307107;

            return {
                primaryOutput: { label: 'Converted Power', value: unit === 'hp' ? `${kw.toFixed(2)} kW` : `${hp.toFixed(2)} HP`, suffix: `${ps.toFixed(2)} PS` },
                secondaryMetrics: [
                    { label: 'Mechanical Horsepower (HP)', value: `${hp.toFixed(2)} HP` },
                    { label: 'Kilowatts (kW)', value: `${kw.toFixed(2)} kW` },
                    { label: 'Metric Horsepower (PS / CV)', value: `${ps.toFixed(2)} PS` },
                    { label: 'Heat Rate (BTU / hr)', value: `${Math.round(btuHr).toLocaleString()} BTU/hr` }
                ]
            };
        }
    },
    // 12. Fuel Consumption Converter
    {
        id: 'fuel-consumption-converter',
        name: 'Fuel Consumption Converter',
        category: 'conversion-units',
        group: 'Conversion & Units',
        bucket: 'Bucket B',
        tier: 5,
        phase: 4,
        monthlySearches: '590',
        cpc: 'N/A',
        description: "Fuel Consumption Converter tool.",
        inputs: [
            { id: 'fuelVal', name: 'Fuel Economy Value', type: 'number', defaultValue: 30, min: 0.1, step: 1, tooltip: 'Economy number.' },
            { id: 'unitFrom', name: 'Source Standard', type: 'dropdown', defaultValue: 'mpg_us', options: [{ label: 'Miles per Gallon (US MPG)', value: 'mpg_us' }, { label: 'Liters per 100km (L/100km)', value: 'l100km' }, { label: 'Miles per Gallon (UK / Imperial MPG)', value: 'mpg_uk' }, { label: 'Kilometers per Liter (km/L)', value: 'kml' }], tooltip: 'Source standard.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const val = Number(inputs.fuelVal) || 30;
            const unit = String(inputs.unitFrom || 'mpg_us');

            let mpgUS = val;
            if (unit === 'l100km') mpgUS = 235.214583 / val;
            else if (unit === 'mpg_uk') mpgUS = val * 0.832674;
            else if (unit === 'kml') mpgUS = val * 2.35214583;

            const l100km = 235.214583 / mpgUS;
            const mpgUK = mpgUS / 0.832674;
            const kml = mpgUS / 2.35214583;

            return {
                primaryOutput: { label: 'Converted Fuel Economy', value: unit === 'mpg_us' ? `${l100km.toFixed(2)} L/100km` : `${mpgUS.toFixed(2)} MPG (US)`, suffix: `${mpgUK.toFixed(1)} MPG UK` },
                secondaryMetrics: [
                    { label: 'US MPG', value: `${mpgUS.toFixed(2)} MPG` },
                    { label: 'Liters per 100 Kilometers', value: `${l100km.toFixed(2)} L/100km` },
                    { label: 'Imperial (UK) MPG', value: `${mpgUK.toFixed(2)} MPG` },
                    { label: 'Kilometers per Liter', value: `${kml.toFixed(2)} km/L` }
                ]
            };
        }
    },
    // 13. Cooking Measurement Converter
    {
        id: 'cooking-measurement-converter',
        name: 'Cooking Measurement Converter',
        category: 'conversion-units',
        group: 'Conversion & Units',
        bucket: 'Bucket C1',
        tier: 4,
        phase: 3,
        monthlySearches: '2K',
        cpc: '$0.13',
        description: "Cooking Measurement Converter tool.",
        inputs: [
            { id: 'amount', name: 'Measurement Amount', type: 'number', defaultValue: 1, min: 0.125, step: 0.25, tooltip: 'Amount of ingredient.' },
            { id: 'unitFrom', name: 'Source Cooking Unit', type: 'dropdown', defaultValue: 'cup', options: [{ label: 'Cups (US Cup)', value: 'cup' }, { label: 'Tablespoons (tbsp)', value: 'tbsp' }, { label: 'Teaspoons (tsp)', value: 'tsp' }, { label: 'Fluid Ounces (fl oz)', value: 'floz' }, { label: 'Milliliters (ml)', value: 'ml' }, { label: 'Pints (pt)', value: 'pint' }, { label: 'Quarts (qt)', value: 'quart' }], tooltip: 'Cooking unit.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const amt = Number(inputs.amount) || 1;
            const unit = String(inputs.unitFrom || 'cup');

            const toML: Record<string, number> = {
                cup: 236.588,
                tbsp: 14.7868,
                tsp: 4.92892,
                floz: 29.5735,
                ml: 1,
                pint: 473.176,
                quart: 946.353
            };

            const ml = amt * (toML[unit] || 1);
            const cups = ml / 236.588;
            const tbsp = ml / 14.7868;
            const tsp = ml / 4.92892;
            const floz = ml / 29.5735;

            return {
                primaryOutput: { label: 'Metric Volume', value: `${ml.toFixed(1)} mL`, suffix: `${tbsp.toFixed(1)} Tablespoons` },
                secondaryMetrics: [
                    { label: 'Tablespoons (tbsp)', value: `${tbsp.toFixed(1)} tbsp` },
                    { label: 'Teaspoons (tsp)', value: `${tsp.toFixed(1)} tsp` },
                    { label: 'Fluid Ounces (fl oz)', value: `${floz.toFixed(2)} fl oz` },
                    { label: 'US Cups', value: `${cups.toFixed(2)} cups` }
                ]
            };
        }
    },
    // 14. Clothing Size Converter
    {
        id: 'clothing-size-converter',
        name: 'Clothing Size Converter',
        category: 'conversion-units',
        group: 'Conversion & Units',
        bucket: 'Bucket C1',
        tier: 4,
        phase: 4,
        monthlySearches: '2K',
        cpc: '$0.37',
        description: "Clothing Size Converter tool.",
        inputs: [
            { id: 'genderCategory', name: 'Garment Category', type: 'dropdown', defaultValue: 'mens_tops', options: [{ label: "Men's Shirts & Jackets", value: 'mens_tops' }, { label: "Women's Dresses & Tops", value: 'womens_tops' }, { label: "Men's Pants / Waist", value: 'mens_pants' }], tooltip: 'Garment type.' },
            { id: 'usSize', name: 'US Standard Size', type: 'number', defaultValue: 40, min: 2, max: 54, step: 2, tooltip: 'US size number (e.g. 40 or 8).' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const cat = String(inputs.genderCategory || 'mens_tops');
            const us = Number(inputs.usSize) || 40;

            let uk = us;
            let eu = us + 10;
            let alpha = 'Medium (M)';

            if (cat === 'mens_tops') {
                uk = us;
                eu = us + 10; // US 40 = EU 50
                if (us <= 36) alpha = 'Small (S)';
                else if (us <= 40) alpha = 'Medium (M)';
                else if (us <= 44) alpha = 'Large (L)';
                else if (us <= 48) alpha = 'Extra Large (XL)';
                else alpha = '2X Large (XXL)';
            } else if (cat === 'womens_tops') {
                uk = us + 4; // US 8 = UK 12
                eu = us + 32; // US 8 = EU 40
                if (us <= 4) alpha = 'Extra Small (XS)';
                else if (us <= 6) alpha = 'Small (S)';
                else if (us <= 10) alpha = 'Medium (M)';
                else if (us <= 14) alpha = 'Large (L)';
                else alpha = 'Extra Large (XL)';
            }

            return {
                primaryOutput: { label: 'International Sizing', value: `EU ${eu} / UK ${uk}`, suffix: alpha },
                secondaryMetrics: [
                    { label: 'Alpha Size Label', value: alpha },
                    { label: 'European (EU) Size', value: `EU ${eu}` },
                    { label: 'UK / Australian Size', value: `UK ${uk}` },
                    { label: 'US Size Standard', value: `US ${us}` }
                ]
            };
        }
    },
    // 15. Ring Size Converter
    {
        id: 'ring-size-converter',
        name: 'Ring Size Converter',
        category: 'conversion-units',
        group: 'Conversion & Units',
        bucket: 'Bucket C1',
        tier: 3,
        phase: 3,
        monthlySearches: '15K',
        cpc: '$0.67',
        description: "Ring Size Converter tool.",
        inputs: [
            { id: 'usRingSize', name: 'US / Canada Ring Size', type: 'number', defaultValue: 7, min: 3, max: 14, step: 0.5, tooltip: 'Standard US ring size (3 to 14).' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const us = Number(inputs.usRingSize) || 7;

            // Inside diameter (mm) = 11.63 + (0.8128 * US)
            const diamMm = 11.63 + (0.8128 * us);
            const circMm = Math.PI * diamMm;
            const diamInches = diamMm / 25.4;

            // UK Letter scale approx: US 7 = UK N 1/2
            const letters = ['F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
            const idx = Math.min(letters.length - 1, Math.max(0, Math.round((us - 3) * 2)));
            const ukLetter = letters[idx] || 'N';

            return {
                primaryOutput: { label: 'UK / Australia / NZ Size', value: `UK ${ukLetter}`, suffix: `EU ${Math.round(circMm)}` },
                secondaryMetrics: [
                    { label: 'Inside Circumference (EU ISO Size)', value: `${circMm.toFixed(1)} mm` },
                    { label: 'Inside Diameter (Millimeters)', value: `${diamMm.toFixed(2)} mm` },
                    { label: 'Inside Diameter (Inches)', value: `${diamInches.toFixed(3)}"` },
                    { label: 'US / Canada Ring Size', value: `Size ${us}` }
                ]
            };
        }
    },
    // 16. Currency Converter Live
    {
        id: 'currency-converter-live',
        name: 'Currency Converter Live',
        category: 'conversion-units',
        group: 'Conversion & Units',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '40K',
        cpc: '$0.91',
        description: "Currency Converter Live tool.",
        inputs: [
            { id: 'amount', name: 'Currency Amount', type: 'number', defaultValue: 100, min: 1, step: 10, tooltip: 'Amount to convert.' },
            { id: 'fromCurrency', name: 'From Currency', type: 'dropdown', defaultValue: 'USD', options: [{ label: 'US Dollar (USD)', value: 'USD' }, { label: 'Euro (EUR)', value: 'EUR' }, { label: 'British Pound (GBP)', value: 'GBP' }, { label: 'Japanese Yen (JPY)', value: 'JPY' }, { label: 'Canadian Dollar (CAD)', value: 'CAD' }, { label: 'Australian Dollar (AUD)', value: 'AUD' }, { label: 'Swiss Franc (CHF)', value: 'CHF' }, { label: 'Indian Rupee (INR)', value: 'INR' }], tooltip: 'Source currency.' },
            { id: 'toCurrency', name: 'To Currency', type: 'dropdown', defaultValue: 'EUR', options: [{ label: 'Euro (EUR)', value: 'EUR' }, { label: 'US Dollar (USD)', value: 'USD' }, { label: 'British Pound (GBP)', value: 'GBP' }, { label: 'Japanese Yen (JPY)', value: 'JPY' }, { label: 'Canadian Dollar (CAD)', value: 'CAD' }, { label: 'Australian Dollar (AUD)', value: 'AUD' }, { label: 'Indian Rupee (INR)', value: 'INR' }], tooltip: 'Target currency.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const amt = Number(inputs.amount) || 100;
            const from = String(inputs.fromCurrency || 'USD');
            const to = String(inputs.toCurrency || 'EUR');

            // Baseline standard benchmark rates to USD
            const ratesToUSD: Record<string, number> = {
                USD: 1.00,
                EUR: 1.08,
                GBP: 1.28,
                JPY: 0.0068,
                CAD: 0.74,
                AUD: 0.66,
                CHF: 1.14,
                INR: 0.012
            };

            const amountInUSD = amt * (ratesToUSD[from] || 1.0);
            const converted = amountInUSD / (ratesToUSD[to] || 1.0);
            const rate = (ratesToUSD[from] || 1.0) / (ratesToUSD[to] || 1.0);

            return {
                primaryOutput: { label: `Converted Value (${to})`, value: `${converted.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ${to}`, suffix: `Rate: ${rate.toFixed(4)}` },
                secondaryMetrics: [
                    { label: 'Exchange Rate', value: `1 ${from} = ${rate.toFixed(4)} ${to}` },
                    { label: 'Inverse Exchange Rate', value: `1 ${to} = ${(1 / rate).toFixed(4)} ${from}` },
                    { label: 'USD Benchmark Value', value: `$${amountInUSD.toFixed(2)} USD` },
                    { label: 'Rate Type', value: 'Benchmark Mid-Market Exchange Reference' }
                ]
            };
        }
    },
    // 17. Hat Size Calculator
    {
        id: 'hat-size-calculator',
        name: 'Hat Size Calculator',
        category: 'conversion-units',
        group: 'Conversion & Units',
        bucket: 'Bucket C1',
        tier: 5,
        phase: 5,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "Hat Size Calculator tool.",
        inputs: [
            { id: 'headCircumference', name: 'Head Circumference', type: 'number', defaultValue: 22.5, min: 19, max: 26, step: 0.125, tooltip: 'Measured just above ears.' },
            { id: 'circUnit', name: 'Measurement Unit', type: 'dropdown', defaultValue: 'in', options: [{ label: 'Inches (in)', value: 'in' }, { label: 'Centimeters (cm)', value: 'cm' }], tooltip: 'Unit.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const cVal = Number(inputs.headCircumference) || 22.5;
            const unit = String(inputs.circUnit || 'in');

            const circInches = unit === 'cm' ? cVal / 2.54 : cVal;
            const circCm = unit === 'in' ? cVal * 2.54 : cVal;

            // US Hat size = Circumference (inches) / PI approx
            const usDec = circInches / Math.PI;
            const whole = Math.floor(usDec);
            const frac = usDec - whole;
            const eighths = Math.round(frac * 8);

            let fracStr = '';
            if (eighths === 1) fracStr = ' 1/8';
            else if (eighths === 2) fracStr = ' 1/4';
            else if (eighths === 3) fracStr = ' 3/8';
            else if (eighths === 4) fracStr = ' 1/2';
            else if (eighths === 5) fracStr = ' 5/8';
            else if (eighths === 6) fracStr = ' 3/4';
            else if (eighths === 7) fracStr = ' 7/8';

            const usHatSize = `${whole}${fracStr}`;
            const ukHatSize = (usDec - 0.125).toFixed(2);
            const metricSize = Math.round(circCm);

            let alpha = 'Medium (M)';
            if (circInches < 21.5) alpha = 'Small (S)';
            else if (circInches <= 22.25) alpha = 'Medium (M)';
            else if (circInches <= 23.0) alpha = 'Large (L)';
            else if (circInches <= 23.8) alpha = 'Extra Large (XL)';
            else alpha = '2X Large (XXL)';

            return {
                primaryOutput: { label: 'US Hat Size', value: `Size ${usHatSize}`, suffix: alpha },
                secondaryMetrics: [
                    { label: 'Metric Hat Size', value: `${metricSize} cm` },
                    { label: 'UK Hat Size', value: `~${ukHatSize}` },
                    { label: 'Head Circumference', value: `${circInches.toFixed(2)}" (${circCm.toFixed(1)} cm)` },
                    { label: 'Alpha Fitting', value: alpha }
                ]
            };
        }
    },
// 18. International Shoe Size Conversion
    {
        id: 'shoe-size-conversion',
        name: 'Shoe Size Conversion',
        category: 'conversion-units',
        group: 'Apparel & Sizing',
        bucket: 'Bucket C',
        tier: 2,
        phase: 2,
        monthlySearches: '140K',
        cpc: '$0.85',
        description: "An International Shoe Size Conversion tool maps footwear sizes across US, UK, Europe (EU), Japan (CM), and Australia sizing standards for men, women, and children.",
        inputs: [
            { id: 'genderCategory', name: 'Footwear Category', type: 'dropdown', defaultValue: 'mens', options: [{ label: "Men's Footwear", value: 'mens' }, { label: "Women's Footwear", value: 'womens' }, { label: "Kids' / Youth Footwear", value: 'kids' }], tooltip: 'Sizing chart category.' },
            { id: 'sourceSystem', name: 'Source Sizing Standard', type: 'dropdown', defaultValue: 'us', options: [{ label: 'US / Canada Size', value: 'us' }, { label: 'UK Size', value: 'uk' }, { label: 'EU Size (Continental Europe)', value: 'eu' }, { label: 'Japan / CM (Mondopoint cm)', value: 'cm' }], tooltip: 'Starting sizing system.' },
            { id: 'sizeValue', name: 'Shoe Size Value', type: 'number', defaultValue: 10, min: 1, max: 55, step: 0.5, tooltip: 'Input shoe size.' }
        ],
        naturalLanguageQueries: ["Shoe size conversion chart US to EU UK", "Convert women's US size 8 to EU shoe size", "Japan CM shoe size to US men's converter"],
        edgeCases: ["Kids size vs adult size crossover", "Half size interpolation", "Out of bounds size values"],
        calculate: (inputs) => {
            const gender = String(inputs.genderCategory || 'mens');
            const sys = String(inputs.sourceSystem || 'us');
            const val = Number(inputs.sizeValue) || 10;

            let usSize = val;
            if (sys === 'uk') {
                usSize = gender === 'womens' ? val + 2.0 : val + 0.5;
            } else if (sys === 'eu') {
                usSize = gender === 'womens' ? (val - 31) : (val - 33);
            } else if (sys === 'cm') {
                usSize = gender === 'womens' ? (val - 17) : (val - 18);
            }

            // Standard conversion mapping
            const ukSize = gender === 'womens' ? Math.max(1, usSize - 2.0) : Math.max(1, usSize - 0.5);
            const euSize = gender === 'womens' ? Math.round(usSize + 31) : Math.round(usSize + 33);
            const cmLength = gender === 'womens' ? (usSize + 17) : (usSize + 18);
            const inches = (cmLength / 2.54).toFixed(1);

            return {
                primaryOutput: { label: 'International Size Equivalent', value: `US ${usSize.toFixed(1)} | UK ${ukSize.toFixed(1)} | EU ${euSize}`, suffix: `${cmLength.toFixed(1)} cm (${inches}")` },
                secondaryMetrics: [
                    { label: 'US & Canada Size', value: `US ${usSize.toFixed(1)} (${gender.toUpperCase()})` },
                    { label: 'UK & Australia Size', value: `UK ${ukSize.toFixed(1)}` },
                    { label: 'European Sizing (EU)', value: `EU ${euSize}` },
                    { label: 'Foot Length (Japan / CM)', value: `${cmLength.toFixed(1)} cm / Mondopoint ${Math.round(cmLength * 10)}` }
                ]
            };
        }
    },
    // 19. International Bra Size Converter
    {
        id: 'international-bra-size-converter',
        name: 'International Bra Size Converter',
        category: 'conversion-units',
        group: 'Apparel & Sizing',
        bucket: 'Bucket C',
        tier: 2,
        phase: 2,
        monthlySearches: '85K',
        cpc: '$1.10',
        description: "An International Bra Size Converter maps cup and band dimensions across US, UK, EU, French (FR/ES), and Australian/NZ sizing standards.",
        inputs: [
            { id: 'bandInches', name: 'Snug Underbust Band (Inches)', type: 'number', defaultValue: 34, min: 26, max: 50, step: 2, suffix: '"', tooltip: 'Snug ribcage underbust measurement in inches.' },
            { id: 'cupLetter', name: 'Current Cup Size', type: 'dropdown', defaultValue: 'D', options: [{ label: 'A Cup (1" difference)', value: 'A' }, { label: 'B Cup (2" difference)', value: 'B' }, { label: 'C Cup (3" difference)', value: 'C' }, { label: 'D Cup (4" difference)', value: 'D' }, { label: 'DD / E Cup (5" difference)', value: 'DD' }, { label: 'DDD / F Cup (6" difference)', value: 'DDD' }, { label: 'G Cup (7" difference)', value: 'G' }, { label: 'H Cup (8" difference)', value: 'H' }], tooltip: 'Cup letter size.' }
        ],
        naturalLanguageQueries: ["International bra size converter US UK EU", "Convert 34D bra size to French and European size", "Sister bra sizing international chart"],
        edgeCases: ["Non-standard band sizes", "Large cup progression differences (UK vs US DD/E/F)", "Sister size band shifts"],
        calculate: (inputs) => {
            const band = Number(inputs.bandInches) || 34;
            const cup = String(inputs.cupLetter || 'D');

            // Regional conversions:
            // US: Band 34 -> UK 34 -> EU 75 -> FR 90 -> AU/NZ 12
            const euBand = Math.round((band * 2.54) / 5) * 5; // e.g. 34" * 2.54 = ~75cm
            const frBand = euBand + 15; // French band is EU + 15cm (75 -> 90)
            const auBand = band - 22; // AU dress size band (34 -> 12)

            let ukCup = cup;
            let euCup = cup;
            if (cup === 'DD') { ukCup = 'DD'; euCup = 'E'; }
            else if (cup === 'DDD') { ukCup = 'E'; euCup = 'F'; }
            else if (cup === 'G') { ukCup = 'F'; euCup = 'G'; }
            else if (cup === 'H') { ukCup = 'FF'; euCup = 'H'; }

            const sisterTight = `${band - 2}${cup === 'A' ? 'B' : cup === 'B' ? 'C' : cup === 'C' ? 'D' : 'DD'}`;
            const sisterLoose = `${band + 2}${cup === 'DD' ? 'D' : cup === 'D' ? 'C' : cup === 'C' ? 'B' : 'A'}`;

            return {
                primaryOutput: { label: 'International Size Standards', value: `US/UK ${band}${cup} = EU ${euBand}${euCup}`, suffix: `FR ${frBand}${euCup} | AU ${auBand}${cup}` },
                secondaryMetrics: [
                    { label: 'US & UK Size', value: `${band}${cup} (UK: ${band}${ukCup})` },
                    { label: 'Continental European (EU)', value: `${euBand}${euCup}` },
                    { label: 'France / Spain (FR/ES)', value: `${frBand}${euCup}` },
                    { label: 'Sister Sizes (Equal Cup Volume)', value: `Tighter Band: ${sisterTight} | Looser Band: ${sisterLoose}` }
                ]
            };
        }
    },
    // 20. Regional Cooking Measurement Converter
    {
        id: 'regional-cooking-measurement-converter',
        name: 'Regional Cooking Measurement Converter',
        category: 'conversion-units',
        group: 'Culinary & Volume',
        bucket: 'Bucket C',
        tier: 2,
        phase: 2,
        monthlySearches: '110K',
        cpc: '$0.65',
        description: "A Regional Cooking Measurement Converter accurately translates baking weights (grams/oz) to volume measurements (US cups, UK cups, tablespoons) based on true ingredient densities.",
        inputs: [
            { id: 'ingredient', name: 'Culinary Ingredient', type: 'dropdown', defaultValue: 'flour', options: [{ label: 'All-Purpose Flour (1 Cup = 120g)', value: 'flour' }, { label: 'Granulated White Sugar (1 Cup = 200g)', value: 'sugar' }, { label: 'Packed Brown Sugar (1 Cup = 220g)', value: 'brown_sugar' }, { label: 'Butter / Margarine (1 Cup = 227g / 2 Sticks)', value: 'butter' }, { label: 'Water / Milk / Liquids (1 Cup = 240g / 240ml)', value: 'liquid' }, { label: 'Cocoa Powder (1 Cup = 100g)', value: 'cocoa' }, { label: 'Rolled Oats (1 Cup = 90g)', value: 'oats' }], tooltip: 'Ingredient density factor.' },
            { id: 'sourceUnit', name: 'Input Measurement Unit', type: 'dropdown', defaultValue: 'us_cups', options: [{ label: 'US Cups', value: 'us_cups' }, { label: 'Metric Grams (g)', value: 'grams' }, { label: 'Ounces (oz)', value: 'oz' }, { label: 'Tablespoons (tbsp)', value: 'tbsp' }, { label: 'Milliliters (ml)', value: 'ml' }], tooltip: 'Starting recipe unit.' },
            { id: 'inputAmount', name: 'Quantity / Amount', type: 'number', defaultValue: 2, min: 0.1, step: 0.25, tooltip: 'Recipe quantity.' }
        ],
        naturalLanguageQueries: ["Convert 2 cups flour to grams", "How many grams is 1 cup sugar", "Baking measurement converter cups to metric grams"],
        edgeCases: ["Flour aeration differences (scooped vs sifted)", "Liquid volume vs solid density", "Zero quantity"],
        calculate: (inputs) => {
            const ing = String(inputs.ingredient || 'flour');
            const unit = String(inputs.sourceUnit || 'us_cups');
            const qty = Number(inputs.inputAmount) || 2;

            // Density: Grams per 1 US Cup
            let cupGrams = 120;
            if (ing === 'sugar') cupGrams = 200;
            else if (ing === 'brown_sugar') cupGrams = 220;
            else if (ing === 'butter') cupGrams = 227;
            else if (ing === 'liquid') cupGrams = 240;
            else if (ing === 'cocoa') cupGrams = 100;
            else if (ing === 'oats') cupGrams = 90;

            // Convert input to standardized grams
            let totalGrams = 0;
            if (unit === 'us_cups') totalGrams = qty * cupGrams;
            else if (unit === 'grams') totalGrams = qty;
            else if (unit === 'oz') totalGrams = qty * 28.3495;
            else if (unit === 'tbsp') totalGrams = (qty / 16) * cupGrams;
            else if (unit === 'ml') totalGrams = (qty / 240) * cupGrams;

            const usCups = totalGrams / cupGrams;
            const totalOz = totalGrams / 28.3495;
            const tbsp = usCups * 16;
            const tsp = tbsp * 3;
            const mlLiquid = usCups * 236.588;

            return {
                primaryOutput: { label: 'Metric Weight Equivalent', value: `${Math.round(totalGrams).toLocaleString()} grams (g)`, suffix: `${totalOz.toFixed(2)} oz (${usCups.toFixed(2)} US Cups)` },
                secondaryMetrics: [
                    { label: 'US Cup Measurement', value: `${usCups.toFixed(2)} Cups` },
                    { label: 'Tablespoons & Teaspoons', value: `${tbsp.toFixed(1)} tbsp (${tsp.toFixed(0)} tsp)` },
                    { label: 'Liquid Volume Equivalent', value: `~${Math.round(mlLiquid)} ml` },
                    { label: 'Ingredient Density Standard', value: `1 Cup = ${cupGrams}g (${ing.replace('_', ' ').toUpperCase()})` }
                ]
            };
        }
    }
];

export const cat08ConversionCalculators = conversionUnitsCalculators;
export default conversionUnitsCalculators;
