import { CalculatorDefinition } from '@/types/calculator';

export const conversionUnitsCalculators: CalculatorDefinition[] = [
    // 1. Conversion Calculator (Universal Multi-Unit Converter)
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
        description: "A universal multi-unit conversion calculator that seamlessly converts values across length, weight, temperature, volume, area, and speed standards.",
        inputs: [
            { id: 'inputValue', name: 'Input Value', type: 'number', defaultValue: 100, min: -1000000, step: 1, tooltip: 'Amount to convert.' },
            {
                id: 'sourceUnit',
                name: 'From Unit',
                type: 'dropdown',
                defaultValue: 'm',
                options: [
                    { label: 'Meters (m)', value: 'm' },
                    { label: 'Feet (ft)', value: 'ft' },
                    { label: 'Inches (in)', value: 'in' },
                    { label: 'Kilometers (km)', value: 'km' },
                    { label: 'Miles (mi)', value: 'mi' },
                    { label: 'Kilograms (kg)', value: 'kg' },
                    { label: 'Pounds (lbs)', value: 'lb' },
                    { label: 'Celsius (°C)', value: 'c' },
                    { label: 'Fahrenheit (°F)', value: 'f' },
                    { label: 'Liters (L)', value: 'l' },
                    { label: 'US Gallons (gal)', value: 'gal' },
                    { label: 'Kilometers/hr (km/h)', value: 'kmh' },
                    { label: 'Miles per Hour (mph)', value: 'mph' }
                ],
                tooltip: 'Source unit.'
            },
            {
                id: 'targetUnit',
                name: 'To Unit',
                type: 'dropdown',
                defaultValue: 'ft',
                options: [
                    { label: 'Feet (ft)', value: 'ft' },
                    { label: 'Meters (m)', value: 'm' },
                    { label: 'Inches (in)', value: 'in' },
                    { label: 'Kilometers (km)', value: 'km' },
                    { label: 'Miles (mi)', value: 'mi' },
                    { label: 'Pounds (lbs)', value: 'lb' },
                    { label: 'Kilograms (kg)', value: 'kg' },
                    { label: 'Fahrenheit (°F)', value: 'f' },
                    { label: 'Celsius (°C)', value: 'c' },
                    { label: 'US Gallons (gal)', value: 'gal' },
                    { label: 'Liters (L)', value: 'l' },
                    { label: 'Miles per Hour (mph)', value: 'mph' },
                    { label: 'Kilometers/hr (km/h)', value: 'kmh' }
                ],
                tooltip: 'Target unit.'
            }
        ],
        naturalLanguageQueries: ["Convert 100 meters to feet", "How many feet in 100 m", "Conversion calculator"],
        edgeCases: ["Incompatible unit types", "Negative values in temperature vs length"],
        calculate: (inputs) => {
            const val = Number(inputs.inputValue) ?? 100;
            const from = String(inputs.sourceUnit || 'm');
            const to = String(inputs.targetUnit || 'ft');

            // Categorize units
            const lengthUnits = ['m', 'ft', 'in', 'km', 'mi'];
            const weightUnits = ['kg', 'lb'];
            const tempUnits = ['c', 'f'];
            const volUnits = ['l', 'gal'];
            const speedUnits = ['kmh', 'mph'];

            const toMeters: Record<string, number> = { m: 1, ft: 0.3048, in: 0.0254, km: 1000, mi: 1609.344 };
            const toKg: Record<string, number> = { kg: 1, lb: 0.45359237 };
            const toLiters: Record<string, number> = { l: 1, gal: 3.785411784 };
            const toKmh: Record<string, number> = { kmh: 1, mph: 1.609344 };

            const unitLabels: Record<string, string> = {
                m: 'm', ft: 'ft', in: 'in', km: 'km', mi: 'mi',
                kg: 'kg', lb: 'lbs',
                c: '°C', f: '°F',
                l: 'L', gal: 'gal',
                kmh: 'km/h', mph: 'mph'
            };

            let converted = 0;
            let secondary: { label: string; value: string }[] = [];

            if (lengthUnits.includes(from)) {
                const targetKey = lengthUnits.includes(to) ? to : 'ft';
                const meters = val * (toMeters[from] || 1);
                converted = meters / (toMeters[targetKey] || 1);
                secondary = [
                    { label: 'Meters (m)', value: `${meters.toLocaleString(undefined, { maximumFractionDigits: 4 })} m` },
                    { label: 'Feet (ft)', value: `${(meters / 0.3048).toLocaleString(undefined, { maximumFractionDigits: 4 })} ft` },
                    { label: 'Inches (in)', value: `${(meters / 0.0254).toLocaleString(undefined, { maximumFractionDigits: 2 })} in` },
                    { label: 'Kilometers (km)', value: `${(meters / 1000).toLocaleString(undefined, { maximumFractionDigits: 4 })} km` },
                    { label: 'Miles (mi)', value: `${(meters / 1609.344).toLocaleString(undefined, { maximumFractionDigits: 4 })} mi` }
                ];
            } else if (weightUnits.includes(from)) {
                const targetKey = weightUnits.includes(to) ? to : (from === 'kg' ? 'lb' : 'kg');
                const kg = val * (toKg[from] || 1);
                converted = kg / (toKg[targetKey] || 1);
                secondary = [
                    { label: 'Kilograms (kg)', value: `${kg.toLocaleString(undefined, { maximumFractionDigits: 4 })} kg` },
                    { label: 'Pounds (lbs)', value: `${(kg / 0.45359237).toLocaleString(undefined, { maximumFractionDigits: 4 })} lbs` },
                    { label: 'Ounces (oz)', value: `${(kg * 35.274).toLocaleString(undefined, { maximumFractionDigits: 2 })} oz` },
                    { label: 'Grams (g)', value: `${(kg * 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} g` }
                ];
            } else if (tempUnits.includes(from)) {
                const targetKey = tempUnits.includes(to) ? to : (from === 'c' ? 'f' : 'c');
                let c = val;
                if (from === 'f') c = (val - 32) * 5 / 9;
                converted = targetKey === 'c' ? c : (c * 9 / 5) + 32;
                secondary = [
                    { label: 'Celsius (°C)', value: `${c.toFixed(2)} °C` },
                    { label: 'Fahrenheit (°F)', value: `${((c * 9 / 5) + 32).toFixed(2)} °F` },
                    { label: 'Kelvin (K)', value: `${(c + 273.15).toFixed(2)} K` }
                ];
            } else if (volUnits.includes(from)) {
                const targetKey = volUnits.includes(to) ? to : (from === 'l' ? 'gal' : 'l');
                const l = val * (toLiters[from] || 1);
                converted = l / (toLiters[targetKey] || 1);
                secondary = [
                    { label: 'Liters (L)', value: `${l.toLocaleString(undefined, { maximumFractionDigits: 4 })} L` },
                    { label: 'US Gallons (gal)', value: `${(l / 3.785411784).toLocaleString(undefined, { maximumFractionDigits: 4 })} gal` },
                    { label: 'Fluid Ounces (fl oz)', value: `${(l * 33.814).toLocaleString(undefined, { maximumFractionDigits: 2 })} fl oz` }
                ];
            } else {
                const targetKey = speedUnits.includes(to) ? to : (from === 'kmh' ? 'mph' : 'kmh');
                const kmh = val * (toKmh[from] || 1);
                converted = kmh / (toKmh[targetKey] || 1);
                secondary = [
                    { label: 'Kilometers per Hour (km/h)', value: `${kmh.toFixed(2)} km/h` },
                    { label: 'Miles per Hour (MPH)', value: `${(kmh / 1.609344).toFixed(2)} mph` },
                    { label: 'Meters per Second (m/s)', value: `${(kmh / 3.6).toFixed(2)} m/s` },
                    { label: 'Knots (knots)', value: `${(kmh / 1.852).toFixed(2)} knots` }
                ];
            }

            const targetLabel = unitLabels[to] || to;
            return {
                primaryOutput: {
                    label: 'Converted Value',
                    value: `${converted.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${targetLabel}`
                },
                secondaryMetrics: secondary
            };
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
        description: "A Shoe Size Conversion tool that translates footwear sizes between US Men, US Women, UK, European (EU), and Japanese (CM) standards.",
        inputs: [
            { id: 'gender', name: 'Gender / Sizing Standard', type: 'dropdown', defaultValue: 'men', options: [{ label: 'US Men', value: 'men' }, { label: 'US Women', value: 'women' }, { label: 'Youth / Big Kids', value: 'youth' }], tooltip: 'Shoe category.' },
            { id: 'usSize', name: 'US Shoe Size', type: 'number', defaultValue: 10, min: 4, max: 16, step: 0.5, tooltip: 'US shoe size.' }
        ],
        naturalLanguageQueries: ["Shoe size conversion US to EU", "US size 10 to UK shoe size"],
        edgeCases: ["Half sizes", "Women to men size shift"],
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
                primaryOutput: { label: 'European (EU) Size', value: `EU ${euRounded}` },
                secondaryMetrics: [
                    { label: 'UK Shoe Size', value: `UK ${uk.toFixed(1)}` },
                    { label: 'Foot Length (Centimeters / CM)', value: `${cm.toFixed(1)} cm` },
                    { label: 'Foot Length (Inches)', value: `${inches.toFixed(2)} in` },
                    { label: 'US Cross-Gender Equivalent', value: g === 'men' ? `US Women ${(us + 1.5).toFixed(1)}` : `US Men ${(us - 1.5).toFixed(1)}` }
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
        description: "A Temperature Converter that converts readings between Celsius, Fahrenheit, Kelvin, and Rankine scales with precise thermal references.",
        inputs: [
            { id: 'tempVal', name: 'Temperature Value', type: 'number', defaultValue: 100, min: -460, max: 10000, step: 1, tooltip: 'Temperature reading.' },
            { id: 'sourceUnit', name: 'Source Scale', type: 'dropdown', defaultValue: 'C', options: [{ label: 'Celsius (°C)', value: 'C' }, { label: 'Fahrenheit (°F)', value: 'F' }, { label: 'Kelvin (K)', value: 'K' }, { label: 'Rankine (°R)', value: 'R' }], tooltip: 'Origin scale.' },
            { id: 'targetUnit', name: 'Target Scale', type: 'dropdown', defaultValue: 'F', options: [{ label: 'Fahrenheit (°F)', value: 'F' }, { label: 'Celsius (°C)', value: 'C' }, { label: 'Kelvin (K)', value: 'K' }, { label: 'Rankine (°R)', value: 'R' }], tooltip: 'Desired scale.' }
        ],
        naturalLanguageQueries: ["Convert 100 C to F", "Celsius to Fahrenheit converter", "Temperature conversion"],
        edgeCases: ["Absolute zero lower bound", "High temperature boiling points"],
        calculate: (inputs) => {
            const val = Number(inputs.tempVal) ?? 100;
            const from = String(inputs.sourceUnit || 'C');
            const to = String(inputs.targetUnit || 'F');

            let c = val;
            if (from === 'F') c = (val - 32) * 5 / 9;
            else if (from === 'K') c = val - 273.15;
            else if (from === 'R') c = (val - 491.67) * 5 / 9;

            const f = (c * 9 / 5) + 32;
            const k = c + 273.15;
            const r = (c + 273.15) * 9 / 5;

            let result = f;
            let targetLabel = '°F';
            if (to === 'C') { result = c; targetLabel = '°C'; }
            else if (to === 'K') { result = k; targetLabel = 'K'; }
            else if (to === 'R') { result = r; targetLabel = '°R'; }

            return {
                primaryOutput: { label: 'Converted Temperature', value: `${result.toFixed(2)} ${targetLabel}` },
                secondaryMetrics: [
                    { label: 'Celsius (°C)', value: `${c.toFixed(2)} °C` },
                    { label: 'Fahrenheit (°F)', value: `${f.toFixed(2)} °F` },
                    { label: 'Kelvin (K)', value: `${k.toFixed(2)} K` },
                    { label: 'Rankine (°R)', value: `${r.toFixed(2)} °R` }
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
        description: "A Length Converter that accurately converts distances and dimensions across metric (m, km, cm, mm) and imperial units (ft, in, yd, mi, nm).",
        inputs: [
            { id: 'lengthVal', name: 'Length Value', type: 'number', defaultValue: 10, min: 0.0001, step: 1, tooltip: 'Length amount.' },
            {
                id: 'sourceUnit',
                name: 'Source Unit',
                type: 'dropdown',
                defaultValue: 'm',
                options: [
                    { label: 'Meters (m)', value: 'm' },
                    { label: 'Feet (ft)', value: 'ft' },
                    { label: 'Inches (in)', value: 'in' },
                    { label: 'Kilometers (km)', value: 'km' },
                    { label: 'Miles (mi)', value: 'mi' },
                    { label: 'Yards (yd)', value: 'yd' },
                    { label: 'Centimeters (cm)', value: 'cm' },
                    { label: 'Millimeters (mm)', value: 'mm' },
                    { label: 'Nautical Miles (NM)', value: 'nm' }
                ],
                tooltip: 'Source unit.'
            },
            {
                id: 'targetUnit',
                name: 'Target Unit',
                type: 'dropdown',
                defaultValue: 'ft',
                options: [
                    { label: 'Feet (ft)', value: 'ft' },
                    { label: 'Meters (m)', value: 'm' },
                    { label: 'Inches (in)', value: 'in' },
                    { label: 'Kilometers (km)', value: 'km' },
                    { label: 'Miles (mi)', value: 'mi' },
                    { label: 'Yards (yd)', value: 'yd' },
                    { label: 'Centimeters (cm)', value: 'cm' },
                    { label: 'Millimeters (mm)', value: 'mm' },
                    { label: 'Nautical Miles (NM)', value: 'nm' }
                ],
                tooltip: 'Target unit.'
            }
        ],
        naturalLanguageQueries: ["Convert 10 meters to feet", "Length converter feet to inches", "Meters to miles converter"],
        edgeCases: ["Very small millimeter dimensions", "Astronomical distance overflow"],
        calculate: (inputs) => {
            const val = Number(inputs.lengthVal) || 10;
            const from = String(inputs.sourceUnit || 'm');
            const to = String(inputs.targetUnit || 'ft');

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

            const labels: Record<string, string> = {
                m: 'm', ft: 'ft', in: 'in', km: 'km', mi: 'mi',
                yd: 'yd', cm: 'cm', mm: 'mm', nm: 'NM'
            };

            const meters = val * (toMeters[from] || 1);
            const targetMeters = toMeters[to] || 0.3048;
            const result = meters / targetMeters;

            return {
                primaryOutput: {
                    label: 'Converted Length',
                    value: `${result.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${labels[to] || to}`
                },
                secondaryMetrics: [
                    { label: 'Meters (m)', value: `${meters.toLocaleString(undefined, { maximumFractionDigits: 4 })} m` },
                    { label: 'Feet (ft)', value: `${(meters / 0.3048).toLocaleString(undefined, { maximumFractionDigits: 4 })} ft` },
                    { label: 'Inches (in)', value: `${(meters / 0.0254).toLocaleString(undefined, { maximumFractionDigits: 2 })} in` },
                    { label: 'Yards (yd)', value: `${(meters / 0.9144).toLocaleString(undefined, { maximumFractionDigits: 3 })} yd` },
                    { label: 'Kilometers (km)', value: `${(meters / 1000).toLocaleString(undefined, { maximumFractionDigits: 4 })} km` },
                    { label: 'Statute Miles (mi)', value: `${(meters / 1609.344).toLocaleString(undefined, { maximumFractionDigits: 4 })} mi` },
                    { label: 'Centimeters (cm)', value: `${(meters * 100).toLocaleString(undefined, { maximumFractionDigits: 1 })} cm` }
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
        description: "A Weight Converter that translates mass across metric and imperial systems including pounds, kilograms, grams, ounces, stones, and metric tons.",
        inputs: [
            { id: 'weightVal', name: 'Weight Value', type: 'number', defaultValue: 175, min: 0.001, step: 1, tooltip: 'Weight magnitude.' },
            {
                id: 'sourceUnit',
                name: 'Source Unit',
                type: 'dropdown',
                defaultValue: 'lb',
                options: [
                    { label: 'Pounds (lbs)', value: 'lb' },
                    { label: 'Kilograms (kg)', value: 'kg' },
                    { label: 'Grams (g)', value: 'g' },
                    { label: 'Ounces (oz)', value: 'oz' },
                    { label: 'Metric Tons (t)', value: 't' },
                    { label: 'Stones (st)', value: 'st' }
                ],
                tooltip: 'Source unit.'
            },
            {
                id: 'targetUnit',
                name: 'Target Unit',
                type: 'dropdown',
                defaultValue: 'kg',
                options: [
                    { label: 'Kilograms (kg)', value: 'kg' },
                    { label: 'Pounds (lbs)', value: 'lb' },
                    { label: 'Grams (g)', value: 'g' },
                    { label: 'Ounces (oz)', value: 'oz' },
                    { label: 'Metric Tons (t)', value: 't' },
                    { label: 'Stones (st)', value: 'st' }
                ],
                tooltip: 'Target unit.'
            }
        ],
        naturalLanguageQueries: ["Convert 175 lbs to kg", "Pounds to kilograms converter", "Weight conversion chart"],
        edgeCases: ["Stone/pound remainder splitting", "Microgram precision"],
        calculate: (inputs) => {
            const val = Number(inputs.weightVal) || 175;
            const from = String(inputs.sourceUnit || 'lb');
            const to = String(inputs.targetUnit || 'kg');

            const toKg: Record<string, number> = {
                kg: 1,
                lb: 0.45359237,
                g: 0.001,
                oz: 0.028349523,
                t: 1000,
                st: 6.35029318
            };

            const labels: Record<string, string> = {
                kg: 'kg', lb: 'lbs', g: 'g', oz: 'oz', t: 't', st: 'st'
            };

            const kg = val * (toKg[from] || 1);
            const targetKg = toKg[to] || 1;
            const result = kg / targetKg;
            const lbs = kg / 0.45359237;
            const stones = Math.floor(lbs / 14);
            const remLbs = lbs % 14;

            return {
                primaryOutput: {
                    label: 'Converted Weight',
                    value: `${result.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${labels[to] || to}`
                },
                secondaryMetrics: [
                    { label: 'Kilograms (kg)', value: `${kg.toLocaleString(undefined, { maximumFractionDigits: 3 })} kg` },
                    { label: 'Pounds (lbs)', value: `${lbs.toLocaleString(undefined, { maximumFractionDigits: 2 })} lbs` },
                    { label: 'Stone & Pounds (UK)', value: `${stones} st ${remLbs.toFixed(1)} lbs` },
                    { label: 'Grams (g)', value: `${Math.round(kg * 1000).toLocaleString()} g` },
                    { label: 'Ounces (oz)', value: `${(kg / 0.028349523).toLocaleString(undefined, { maximumFractionDigits: 1 })} oz` },
                    { label: 'Metric Tons (t)', value: `${(kg / 1000).toFixed(4)} t` }
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
        cpc: '$0.35',
        description: "A Volume & Liquid Converter that converts capacity across US gallons, liters, milliliters, fluid ounces, cups, cubic meters, and cubic feet.",
        inputs: [
            { id: 'volumeVal', name: 'Volume Quantity', type: 'number', defaultValue: 1, min: 0.0001, step: 0.5, tooltip: 'Volume measure.' },
            {
                id: 'sourceUnit',
                name: 'Source Unit',
                type: 'dropdown',
                defaultValue: 'gal_us',
                options: [
                    { label: 'US Gallons (gal)', value: 'gal_us' },
                    { label: 'Liters (L)', value: 'l' },
                    { label: 'Milliliters (mL)', value: 'ml' },
                    { label: 'Fluid Ounces (fl oz)', value: 'floz' },
                    { label: 'US Cups', value: 'cups' },
                    { label: 'Imperial Gallons (UK)', value: 'gal_uk' },
                    { label: 'Cubic Meters (m³)', value: 'm3' },
                    { label: 'Cubic Feet (ft³)', value: 'ft3' }
                ],
                tooltip: 'Source unit.'
            },
            {
                id: 'targetUnit',
                name: 'Target Unit',
                type: 'dropdown',
                defaultValue: 'l',
                options: [
                    { label: 'Liters (L)', value: 'l' },
                    { label: 'US Gallons (gal)', value: 'gal_us' },
                    { label: 'Milliliters (mL)', value: 'ml' },
                    { label: 'Fluid Ounces (fl oz)', value: 'floz' },
                    { label: 'US Cups', value: 'cups' },
                    { label: 'Imperial Gallons (UK)', value: 'gal_uk' },
                    { label: 'Cubic Meters (m³)', value: 'm3' },
                    { label: 'Cubic Feet (ft³)', value: 'ft3' }
                ],
                tooltip: 'Target unit.'
            }
        ],
        naturalLanguageQueries: ["Convert 1 gallon to liters", "Gallons to liters calculator", "Volume converter"],
        edgeCases: ["US vs UK gallon discrepancy", "Very small milliliter fractions"],
        calculate: (inputs) => {
            const val = Number(inputs.volumeVal) || 1;
            const from = String(inputs.sourceUnit || 'gal_us');
            const to = String(inputs.targetUnit || 'l');

            const toLiters: Record<string, number> = {
                l: 1,
                gal_us: 3.785411784,
                ml: 0.001,
                floz: 0.02957353,
                cups: 0.236588236,
                gal_uk: 4.54609,
                m3: 1000,
                ft3: 28.316846592
            };

            const labels: Record<string, string> = {
                l: 'L', gal_us: 'gal (US)', ml: 'mL', floz: 'fl oz',
                cups: 'cups', gal_uk: 'gal (UK)', m3: 'm³', ft3: 'ft³'
            };

            const liters = val * (toLiters[from] || 1);
            const targetLiters = toLiters[to] || 1;
            const result = liters / targetLiters;

            return {
                primaryOutput: {
                    label: 'Converted Volume',
                    value: `${result.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${labels[to] || to}`
                },
                secondaryMetrics: [
                    { label: 'Liters (L)', value: `${liters.toLocaleString(undefined, { maximumFractionDigits: 4 })} L` },
                    { label: 'US Gallons (gal)', value: `${(liters / 3.785411784).toLocaleString(undefined, { maximumFractionDigits: 4 })} gal` },
                    { label: 'Fluid Ounces (fl oz)', value: `${(liters / 0.02957353).toLocaleString(undefined, { maximumFractionDigits: 2 })} fl oz` },
                    { label: 'US Cups', value: `${(liters / 0.236588236).toLocaleString(undefined, { maximumFractionDigits: 2 })} cups` },
                    { label: 'Imperial Gallons (UK)', value: `${(liters / 4.54609).toLocaleString(undefined, { maximumFractionDigits: 4 })} gal (UK)` },
                    { label: 'Cubic Feet (ft³)', value: `${(liters / 28.316846592).toLocaleString(undefined, { maximumFractionDigits: 4 })} ft³` }
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
        description: "An Area Converter that converts surface area between acres, square feet, square meters, hectares, square miles, and square kilometers.",
        inputs: [
            { id: 'areaVal', name: 'Area Quantity', type: 'number', defaultValue: 1, min: 0.0001, step: 0.5, tooltip: 'Surface area.' },
            {
                id: 'sourceUnit',
                name: 'Source Unit',
                type: 'dropdown',
                defaultValue: 'acres',
                options: [
                    { label: 'Acres (ac)', value: 'acres' },
                    { label: 'Square Feet (sq ft)', value: 'sq_ft' },
                    { label: 'Square Meters (m²)', value: 'sq_m' },
                    { label: 'Hectares (ha)', value: 'hectares' },
                    { label: 'Square Miles (sq mi)', value: 'sq_mi' },
                    { label: 'Square Kilometers (km²)', value: 'sq_km' },
                    { label: 'Square Yards (sq yd)', value: 'sq_yd' }
                ],
                tooltip: 'Source unit.'
            },
            {
                id: 'targetUnit',
                name: 'Target Unit',
                type: 'dropdown',
                defaultValue: 'sq_ft',
                options: [
                    { label: 'Square Feet (sq ft)', value: 'sq_ft' },
                    { label: 'Acres (ac)', value: 'acres' },
                    { label: 'Square Meters (m²)', value: 'sq_m' },
                    { label: 'Hectares (ha)', value: 'hectares' },
                    { label: 'Square Miles (sq mi)', value: 'sq_mi' },
                    { label: 'Square Kilometers (km²)', value: 'sq_km' },
                    { label: 'Square Yards (sq yd)', value: 'sq_yd' }
                ],
                tooltip: 'Target unit.'
            }
        ],
        naturalLanguageQueries: ["Convert 1 acre to square feet", "Acres to sq ft calculator", "Area converter"],
        edgeCases: ["Acre vs hectare scaling", "Small room surface area"],
        calculate: (inputs) => {
            const val = Number(inputs.areaVal) || 1;
            const from = String(inputs.sourceUnit || 'acres');
            const to = String(inputs.targetUnit || 'sq_ft');

            const toSqM: Record<string, number> = {
                sq_m: 1,
                acres: 4046.8564224,
                sq_ft: 0.09290304,
                hectares: 10000,
                sq_mi: 2589988.110336,
                sq_km: 1000000,
                sq_yd: 0.836127
            };

            const labels: Record<string, string> = {
                acres: 'ac', sq_ft: 'sq ft', sq_m: 'm²',
                hectares: 'ha', sq_mi: 'sq mi', sq_km: 'km²', sq_yd: 'sq yd'
            };

            const sqM = val * (toSqM[from] || 1);
            const targetSqM = toSqM[to] || 0.09290304;
            const result = sqM / targetSqM;

            return {
                primaryOutput: {
                    label: 'Converted Area',
                    value: `${result.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${labels[to] || to}`
                },
                secondaryMetrics: [
                    { label: 'Square Feet (sq ft)', value: `${(sqM / 0.09290304).toLocaleString(undefined, { maximumFractionDigits: 2 })} sq ft` },
                    { label: 'Acres (ac)', value: `${(sqM / 4046.8564224).toLocaleString(undefined, { maximumFractionDigits: 4 })} ac` },
                    { label: 'Square Meters (m²)', value: `${sqM.toLocaleString(undefined, { maximumFractionDigits: 2 })} m²` },
                    { label: 'Hectares (ha)', value: `${(sqM / 10000).toLocaleString(undefined, { maximumFractionDigits: 4 })} ha` },
                    { label: 'Square Yards (sq yd)', value: `${(sqM / 0.836127).toLocaleString(undefined, { maximumFractionDigits: 2 })} sq yd` },
                    { label: 'Square Miles (sq mi)', value: `${(sqM / 2589988.110336).toLocaleString(undefined, { maximumFractionDigits: 6 })} sq mi` }
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
        description: "A Speed Converter that translates velocities between miles per hour (mph), kilometers per hour (km/h), meters per second (m/s), and nautical knots.",
        inputs: [
            { id: 'speedVal', name: 'Speed Magnitude', type: 'number', defaultValue: 65, min: 0.01, step: 1, tooltip: 'Speed value.' },
            {
                id: 'sourceUnit',
                name: 'Source Unit',
                type: 'dropdown',
                defaultValue: 'mph',
                options: [
                    { label: 'Miles per Hour (MPH)', value: 'mph' },
                    { label: 'Kilometers per Hour (km/h)', value: 'kmh' },
                    { label: 'Meters per Second (m/s)', value: 'mps' },
                    { label: 'Knots (NM/h)', value: 'knots' },
                    { label: 'Feet per Second (ft/s)', value: 'ftps' }
                ],
                tooltip: 'Source unit.'
            },
            {
                id: 'targetUnit',
                name: 'Target Unit',
                type: 'dropdown',
                defaultValue: 'kmh',
                options: [
                    { label: 'Kilometers per Hour (km/h)', value: 'kmh' },
                    { label: 'Miles per Hour (MPH)', value: 'mph' },
                    { label: 'Meters per Second (m/s)', value: 'mps' },
                    { label: 'Knots (NM/h)', value: 'knots' },
                    { label: 'Feet per Second (ft/s)', value: 'ftps' }
                ],
                tooltip: 'Target unit.'
            }
        ],
        naturalLanguageQueries: ["Convert 65 mph to km/h", "MPH to km/h speed converter", "Knots to mph"],
        edgeCases: ["Supersonic Mach speed threshold", "Zero velocity"],
        calculate: (inputs) => {
            const val = Number(inputs.speedVal) || 65;
            const from = String(inputs.sourceUnit || 'mph');
            const to = String(inputs.targetUnit || 'kmh');

            const toKmh: Record<string, number> = {
                kmh: 1,
                mph: 1.609344,
                mps: 3.6,
                knots: 1.852,
                ftps: 1.09728
            };

            const labels: Record<string, string> = {
                kmh: 'km/h', mph: 'MPH', mps: 'm/s', knots: 'knots', ftps: 'ft/s'
            };

            const kmh = val * (toKmh[from] || 1);
            const targetKmh = toKmh[to] || 1;
            const result = kmh / targetKmh;
            const mps = kmh / 3.6;

            return {
                primaryOutput: {
                    label: 'Converted Speed',
                    value: `${result.toFixed(2)} ${labels[to] || to}`
                },
                secondaryMetrics: [
                    { label: 'Kilometers per Hour (km/h)', value: `${kmh.toFixed(2)} km/h` },
                    { label: 'Miles per Hour (MPH)', value: `${(kmh / 1.609344).toFixed(2)} MPH` },
                    { label: 'Meters per Second (m/s)', value: `${mps.toFixed(2)} m/s` },
                    { label: 'Knots (NM/h)', value: `${(kmh / 1.852).toFixed(2)} knots` },
                    { label: 'Feet per Second (ft/s)', value: `${(kmh / 1.09728).toFixed(2)} ft/s` },
                    { label: 'Mach (Sea Level Std)', value: `Mach ${(mps / 340.29).toFixed(3)}` }
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
        description: "A Pressure Converter that calculates equivalent pressure across PSI, Bar, Kilopascals (kPa), Standard Atmospheres (atm), and mmHg.",
        inputs: [
            { id: 'pressureVal', name: 'Pressure Value', type: 'number', defaultValue: 32, min: 0.001, step: 1, tooltip: 'Pressure reading.' },
            {
                id: 'sourceUnit',
                name: 'Source Unit',
                type: 'dropdown',
                defaultValue: 'psi',
                options: [
                    { label: 'Pounds per Sq Inch (PSI)', value: 'psi' },
                    { label: 'Bar', value: 'bar' },
                    { label: 'Kilopascals (kPa)', value: 'kpa' },
                    { label: 'Atmospheres (atm)', value: 'atm' },
                    { label: 'Pascals (Pa)', value: 'pa' },
                    { label: 'Millimeters of Mercury (mmHg / Torr)', value: 'mmhg' }
                ],
                tooltip: 'Source scale.'
            },
            {
                id: 'targetUnit',
                name: 'Target Unit',
                type: 'dropdown',
                defaultValue: 'bar',
                options: [
                    { label: 'Bar', value: 'bar' },
                    { label: 'Pounds per Sq Inch (PSI)', value: 'psi' },
                    { label: 'Kilopascals (kPa)', value: 'kpa' },
                    { label: 'Atmospheres (atm)', value: 'atm' },
                    { label: 'Pascals (Pa)', value: 'pa' },
                    { label: 'Millimeters of Mercury (mmHg / Torr)', value: 'mmhg' }
                ],
                tooltip: 'Target scale.'
            }
        ],
        naturalLanguageQueries: ["Convert 32 psi to bar", "PSI to bar tire pressure converter", "Pressure unit conversion"],
        edgeCases: ["Atmospheric standard baseline", "Tire gauge pressure vs absolute"],
        calculate: (inputs) => {
            const val = Number(inputs.pressureVal) || 32;
            const from = String(inputs.sourceUnit || 'psi');
            const to = String(inputs.targetUnit || 'bar');

            const toPa: Record<string, number> = {
                pa: 1,
                kpa: 1000,
                bar: 100000,
                psi: 6894.75729,
                atm: 101325,
                mmhg: 133.322368
            };

            const labels: Record<string, string> = {
                bar: 'bar', psi: 'PSI', kpa: 'kPa', atm: 'atm', pa: 'Pa', mmhg: 'mmHg'
            };

            const pa = val * (toPa[from] || 1);
            const targetPa = toPa[to] || 100000;
            const result = pa / targetPa;

            return {
                primaryOutput: {
                    label: 'Converted Pressure',
                    value: `${result.toFixed(4)} ${labels[to] || to}`
                },
                secondaryMetrics: [
                    { label: 'Bar', value: `${(pa / 100000).toFixed(4)} bar` },
                    { label: 'Pounds per Sq Inch (PSI)', value: `${(pa / 6894.75729).toFixed(2)} PSI` },
                    { label: 'Kilopascals (kPa)', value: `${(pa / 1000).toFixed(2)} kPa` },
                    { label: 'Standard Atmospheres (atm)', value: `${(pa / 101325).toFixed(4)} atm` },
                    { label: 'Millimeters of Mercury (mmHg)', value: `${(pa / 133.322368).toFixed(1)} mmHg` }
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
        description: "An Energy Converter that converts work and energy across kilowatt-hours (kWh), Joules, British Thermal Units (BTU), and dietary calories (kcal).",
        inputs: [
            { id: 'energyVal', name: 'Energy Magnitude', type: 'number', defaultValue: 1000, min: 0.001, step: 50, tooltip: 'Energy quantity.' },
            {
                id: 'sourceUnit',
                name: 'Source Unit',
                type: 'dropdown',
                defaultValue: 'kwh',
                options: [
                    { label: 'Kilowatt-hours (kWh)', value: 'kwh' },
                    { label: 'British Thermal Units (BTU)', value: 'btu' },
                    { label: 'Joules (J)', value: 'j' },
                    { label: 'Kilojoules (kJ)', value: 'kj' },
                    { label: 'Dietary Calories (kcal)', value: 'kcal' },
                    { label: 'Foot-Pounds (ft-lbf)', value: 'ftlbf' }
                ],
                tooltip: 'Source unit.'
            },
            {
                id: 'targetUnit',
                name: 'Target Unit',
                type: 'dropdown',
                defaultValue: 'btu',
                options: [
                    { label: 'British Thermal Units (BTU)', value: 'btu' },
                    { label: 'Kilowatt-hours (kWh)', value: 'kwh' },
                    { label: 'Joules (J)', value: 'j' },
                    { label: 'Kilojoules (kJ)', value: 'kj' },
                    { label: 'Dietary Calories (kcal)', value: 'kcal' },
                    { label: 'Foot-Pounds (ft-lbf)', value: 'ftlbf' }
                ],
                tooltip: 'Target unit.'
            }
        ],
        naturalLanguageQueries: ["Convert 1000 kWh to BTU", "kWh to Joules converter", "Energy unit conversion"],
        edgeCases: ["Dietary kcal vs thermodynamic gram calorie", "Large kilowatt scale"],
        calculate: (inputs) => {
            const val = Number(inputs.energyVal) || 1000;
            const from = String(inputs.sourceUnit || 'kwh');
            const to = String(inputs.targetUnit || 'btu');

            const toJoules: Record<string, number> = {
                j: 1,
                kj: 1000,
                kwh: 3600000,
                kcal: 4184,
                btu: 1055.05585,
                ftlbf: 1.355817948
            };

            const labels: Record<string, string> = {
                kwh: 'kWh', btu: 'BTU', j: 'J', kj: 'kJ', kcal: 'kcal', ftlbf: 'ft-lbf'
            };

            const joules = val * (toJoules[from] || 1);
            const targetJoules = toJoules[to] || 1055.05585;
            const result = joules / targetJoules;

            return {
                primaryOutput: {
                    label: 'Converted Energy',
                    value: `${result.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${labels[to] || to}`
                },
                secondaryMetrics: [
                    { label: 'Kilowatt-Hours (kWh)', value: `${(joules / 3600000).toLocaleString(undefined, { maximumFractionDigits: 4 })} kWh` },
                    { label: 'British Thermal Units (BTU)', value: `${Math.round(joules / 1055.05585).toLocaleString()} BTU` },
                    { label: 'Kilojoules (kJ)', value: `${(joules / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} kJ` },
                    { label: 'Dietary Calories (kcal)', value: `${(joules / 4184).toLocaleString(undefined, { maximumFractionDigits: 1 })} kcal` },
                    { label: 'Foot-Pounds (ft-lbf)', value: `${Math.round(joules / 1.355817948).toLocaleString()} ft-lbf` }
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
        description: "A Power Converter that converts power ratings between mechanical horsepower (HP), metric horsepower (PS), kilowatts (kW), and Watts (W).",
        inputs: [
            { id: 'powerVal', name: 'Power Magnitude', type: 'number', defaultValue: 100, min: 0.001, step: 10, tooltip: 'Power output.' },
            {
                id: 'sourceUnit',
                name: 'Source Unit',
                type: 'dropdown',
                defaultValue: 'hp',
                options: [
                    { label: 'Mechanical Horsepower (HP)', value: 'hp' },
                    { label: 'Kilowatts (kW)', value: 'kw' },
                    { label: 'Watts (W)', value: 'w' },
                    { label: 'Metric Horsepower (PS)', value: 'ps' },
                    { label: 'BTU per hour (BTU/hr)', value: 'btu_hr' }
                ],
                tooltip: 'Source unit.'
            },
            {
                id: 'targetUnit',
                name: 'Target Unit',
                type: 'dropdown',
                defaultValue: 'kw',
                options: [
                    { label: 'Kilowatts (kW)', value: 'kw' },
                    { label: 'Mechanical Horsepower (HP)', value: 'hp' },
                    { label: 'Watts (W)', value: 'w' },
                    { label: 'Metric Horsepower (PS)', value: 'ps' },
                    { label: 'BTU per hour (BTU/hr)', value: 'btu_hr' }
                ],
                tooltip: 'Target unit.'
            }
        ],
        naturalLanguageQueries: ["Convert 100 HP to kW", "Horsepower to kilowatts converter", "Power conversion"],
        edgeCases: ["Mechanical vs metric horsepower PS", "Electrical kW vs thermal kW"],
        calculate: (inputs) => {
            const val = Number(inputs.powerVal) || 100;
            const from = String(inputs.sourceUnit || 'hp');
            const to = String(inputs.targetUnit || 'kw');

            const toWatts: Record<string, number> = {
                w: 1,
                kw: 1000,
                hp: 745.699872,
                ps: 735.49875,
                btu_hr: 0.29307107
            };

            const labels: Record<string, string> = {
                kw: 'kW', hp: 'HP', ps: 'PS', w: 'W', btu_hr: 'BTU/hr'
            };

            const watts = val * (toWatts[from] || 1);
            const targetWatts = toWatts[to] || 1000;
            const result = watts / targetWatts;

            return {
                primaryOutput: {
                    label: 'Converted Power',
                    value: `${result.toFixed(2)} ${labels[to] || to}`
                },
                secondaryMetrics: [
                    { label: 'Kilowatts (kW)', value: `${(watts / 1000).toFixed(2)} kW` },
                    { label: 'Mechanical Horsepower (HP)', value: `${(watts / 745.699872).toFixed(2)} HP` },
                    { label: 'Metric Horsepower (PS)', value: `${(watts / 735.49875).toFixed(2)} PS` },
                    { label: 'Watts (W)', value: `${Math.round(watts).toLocaleString()} W` },
                    { label: 'Heat Rate (BTU/hr)', value: `${Math.round(watts / 0.29307107).toLocaleString()} BTU/hr` }
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
        description: "A Fuel Consumption Converter that translates automobile fuel economy between US MPG, UK Imperial MPG, L/100km, and km/L.",
        inputs: [
            { id: 'fuelVal', name: 'Fuel Economy Value', type: 'number', defaultValue: 30, min: 0.1, step: 1, tooltip: 'Economy number.' },
            {
                id: 'sourceUnit',
                name: 'Source Standard',
                type: 'dropdown',
                defaultValue: 'mpg_us',
                options: [
                    { label: 'Miles per Gallon (US MPG)', value: 'mpg_us' },
                    { label: 'Liters per 100km (L/100km)', value: 'l100km' },
                    { label: 'Miles per Gallon (UK / Imperial MPG)', value: 'mpg_uk' },
                    { label: 'Kilometers per Liter (km/L)', value: 'kml' }
                ],
                tooltip: 'Source standard.'
            },
            {
                id: 'targetUnit',
                name: 'Target Standard',
                type: 'dropdown',
                defaultValue: 'l100km',
                options: [
                    { label: 'Liters per 100km (L/100km)', value: 'l100km' },
                    { label: 'Miles per Gallon (US MPG)', value: 'mpg_us' },
                    { label: 'Miles per Gallon (UK / Imperial MPG)', value: 'mpg_uk' },
                    { label: 'Kilometers per Liter (km/L)', value: 'kml' }
                ],
                tooltip: 'Target standard.'
            }
        ],
        naturalLanguageQueries: ["Convert 30 mpg to L/100km", "MPG to L/100km fuel converter", "Fuel consumption conversion"],
        edgeCases: ["Zero or inverted reciprocal consumption", "US vs UK gallon discrepancy"],
        calculate: (inputs) => {
            const val = Math.max(0.01, Number(inputs.fuelVal) || 30);
            const from = String(inputs.sourceUnit || 'mpg_us');
            const to = String(inputs.targetUnit || 'l100km');

            let mpgUS = val;
            if (from === 'l100km') mpgUS = 235.214583 / val;
            else if (from === 'mpg_uk') mpgUS = val * 0.832674;
            else if (from === 'kml') mpgUS = val * 2.35214583;

            let result = mpgUS;
            let targetLabel = 'MPG (US)';

            if (to === 'l100km') {
                result = 235.214583 / Math.max(0.01, mpgUS);
                targetLabel = 'L/100km';
            } else if (to === 'mpg_uk') {
                result = mpgUS / 0.832674;
                targetLabel = 'MPG (UK)';
            } else if (to === 'kml') {
                result = mpgUS / 2.35214583;
                targetLabel = 'km/L';
            }

            const l100km = 235.214583 / Math.max(0.01, mpgUS);
            const mpgUK = mpgUS / 0.832674;
            const kml = mpgUS / 2.35214583;

            return {
                primaryOutput: {
                    label: 'Converted Fuel Economy',
                    value: `${result.toFixed(2)} ${targetLabel}`
                },
                secondaryMetrics: [
                    { label: 'US Miles per Gallon (MPG)', value: `${mpgUS.toFixed(2)} MPG` },
                    { label: 'Liters per 100 Kilometers', value: `${l100km.toFixed(2)} L/100km` },
                    { label: 'Imperial (UK) MPG', value: `${mpgUK.toFixed(2)} MPG` },
                    { label: 'Kilometers per Liter (km/L)', value: `${kml.toFixed(2)} km/L` }
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
        description: "A Culinary Cooking Measurement Converter that converts recipe quantities across cups, tablespoons, teaspoons, fluid ounces, and milliliters.",
        inputs: [
            { id: 'amount', name: 'Measurement Amount', type: 'number', defaultValue: 1, min: 0.125, step: 0.25, tooltip: 'Amount of ingredient.' },
            {
                id: 'sourceUnit',
                name: 'Source Cooking Unit',
                type: 'dropdown',
                defaultValue: 'cup',
                options: [
                    { label: 'Cups (US Cup)', value: 'cup' },
                    { label: 'Tablespoons (tbsp)', value: 'tbsp' },
                    { label: 'Teaspoons (tsp)', value: 'tsp' },
                    { label: 'Fluid Ounces (fl oz)', value: 'floz' },
                    { label: 'Milliliters (ml)', value: 'ml' },
                    { label: 'Pints (pt)', value: 'pint' },
                    { label: 'Quarts (qt)', value: 'quart' },
                    { label: 'Liters (L)', value: 'l' }
                ],
                tooltip: 'Cooking unit.'
            },
            {
                id: 'targetUnit',
                name: 'Target Cooking Unit',
                type: 'dropdown',
                defaultValue: 'tbsp',
                options: [
                    { label: 'Tablespoons (tbsp)', value: 'tbsp' },
                    { label: 'Cups (US Cup)', value: 'cup' },
                    { label: 'Teaspoons (tsp)', value: 'tsp' },
                    { label: 'Fluid Ounces (fl oz)', value: 'floz' },
                    { label: 'Milliliters (ml)', value: 'ml' },
                    { label: 'Pints (pt)', value: 'pint' },
                    { label: 'Quarts (qt)', value: 'quart' },
                    { label: 'Liters (L)', value: 'l' }
                ],
                tooltip: 'Target unit.'
            }
        ],
        naturalLanguageQueries: ["How many tablespoons in a cup", "Cup to tablespoon converter", "Cooking measurement conversion"],
        edgeCases: ["Fractional tablespoon subdivisions", "Liquid volume scaling"],
        calculate: (inputs) => {
            const amt = Number(inputs.amount) || 1;
            const from = String(inputs.sourceUnit || 'cup');
            const to = String(inputs.targetUnit || 'tbsp');

            const toML: Record<string, number> = {
                cup: 236.588,
                tbsp: 14.7868,
                tsp: 4.92892,
                floz: 29.5735,
                ml: 1,
                pint: 473.176,
                quart: 946.353,
                l: 1000
            };

            const labels: Record<string, string> = {
                tbsp: 'tbsp', cup: 'cups', tsp: 'tsp', floz: 'fl oz',
                ml: 'mL', pint: 'pt', quart: 'qt', l: 'L'
            };

            const ml = amt * (toML[from] || 1);
            const targetML = toML[to] || 14.7868;
            const result = ml / targetML;

            return {
                primaryOutput: {
                    label: 'Converted Culinary Amount',
                    value: `${result.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${labels[to] || to}`
                },
                secondaryMetrics: [
                    { label: 'Tablespoons (tbsp)', value: `${(ml / 14.7868).toFixed(1)} tbsp` },
                    { label: 'Teaspoons (tsp)', value: `${(ml / 4.92892).toFixed(1)} tsp` },
                    { label: 'US Cups', value: `${(ml / 236.588).toFixed(2)} cups` },
                    { label: 'Fluid Ounces (fl oz)', value: `${(ml / 29.5735).toFixed(2)} fl oz` },
                    { label: 'Metric Milliliters', value: `${ml.toFixed(1)} mL` }
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
        description: "A Clothing Size Converter that maps apparel dimensions between US, UK, and European standards for men's and women's clothing.",
        inputs: [
            { id: 'genderCategory', name: 'Garment Category', type: 'dropdown', defaultValue: 'mens_tops', options: [{ label: "Men's Shirts & Jackets", value: 'mens_tops' }, { label: "Women's Dresses & Tops", value: 'womens_tops' }, { label: "Men's Pants / Waist", value: 'mens_pants' }], tooltip: 'Garment type.' },
            { id: 'usSize', name: 'US Standard Size', type: 'number', defaultValue: 40, min: 2, max: 54, step: 2, tooltip: 'US size number (e.g. 40 or 8).' }
        ],
        naturalLanguageQueries: ["Clothing size conversion US to UK EU", "Men's shirt size converter", "Women's dress size conversion"],
        edgeCases: ["Alpha vs numeric sizing", "Vanity sizing variations"],
        calculate: (inputs) => {
            const cat = String(inputs.genderCategory || 'mens_tops');
            const us = Number(inputs.usSize) || 40;

            let uk = us;
            let eu = us + 10;
            let alpha = 'Medium (M)';

            if (cat === 'mens_tops') {
                uk = us;
                eu = us + 10;
                if (us <= 36) alpha = 'Small (S)';
                else if (us <= 40) alpha = 'Medium (M)';
                else if (us <= 44) alpha = 'Large (L)';
                else if (us <= 48) alpha = 'Extra Large (XL)';
                else alpha = '2X Large (XXL)';
            } else if (cat === 'womens_tops') {
                uk = us + 4;
                eu = us + 32;
                if (us <= 4) alpha = 'Extra Small (XS)';
                else if (us <= 6) alpha = 'Small (S)';
                else if (us <= 10) alpha = 'Medium (M)';
                else if (us <= 14) alpha = 'Large (L)';
                else alpha = 'Extra Large (XL)';
            }

            return {
                primaryOutput: { label: 'European (EU) Size', value: `EU ${eu}` },
                secondaryMetrics: [
                    { label: 'Alpha Size Label', value: alpha },
                    { label: 'UK / Australian Size', value: `UK ${uk}` },
                    { label: 'US Size Standard', value: `US ${us}` },
                    { label: 'Garment Category', value: cat.replace('_', ' ').toUpperCase() }
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
        description: "A Ring Size Converter that maps finger circumferences and diameters across US, UK letter sizes, and European millimeter ISO standards.",
        inputs: [
            { id: 'usRingSize', name: 'US / Canada Ring Size', type: 'number', defaultValue: 7, min: 3, max: 14, step: 0.5, tooltip: 'Standard US ring size (3 to 14).' }
        ],
        naturalLanguageQueries: ["Ring size converter US to UK EU", "What is US ring size 7 in UK", "Ring size circumference mm"],
        edgeCases: ["Quarter ring sizes", "Comfort fit vs standard fit"],
        calculate: (inputs) => {
            const us = Number(inputs.usRingSize) || 7;

            const diamMm = 11.63 + (0.8128 * us);
            const circMm = Math.PI * diamMm;
            const diamInches = diamMm / 25.4;

            const letters = ['F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
            const idx = Math.min(letters.length - 1, Math.max(0, Math.round((us - 3) * 2)));
            const ukLetter = letters[idx] || 'N';

            return {
                primaryOutput: { label: 'UK & Australia Ring Size', value: `UK ${ukLetter}` },
                secondaryMetrics: [
                    { label: 'Inside Circumference (EU ISO Size)', value: `${circMm.toFixed(1)} mm` },
                    { label: 'Inside Diameter (Millimeters)', value: `${diamMm.toFixed(2)} mm` },
                    { label: 'Inside Diameter (Inches)', value: `${diamInches.toFixed(3)} in` },
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
        description: "A Global Currency Converter that calculates foreign exchange values across major global reserve currencies using mid-market benchmark rates.",
        inputs: [
            { id: 'amount', name: 'Currency Amount', type: 'number', defaultValue: 100, min: 1, step: 10, tooltip: 'Amount to convert.' },
            { id: 'sourceUnit', name: 'From Currency', type: 'dropdown', defaultValue: 'USD', options: [{ label: 'US Dollar (USD)', value: 'USD' }, { label: 'Euro (EUR)', value: 'EUR' }, { label: 'British Pound (GBP)', value: 'GBP' }, { label: 'Japanese Yen (JPY)', value: 'JPY' }, { label: 'Canadian Dollar (CAD)', value: 'CAD' }, { label: 'Australian Dollar (AUD)', value: 'AUD' }, { label: 'Swiss Franc (CHF)', value: 'CHF' }, { label: 'Indian Rupee (INR)', value: 'INR' }], tooltip: 'Source currency.' },
            { id: 'targetUnit', name: 'To Currency', type: 'dropdown', defaultValue: 'EUR', options: [{ label: 'Euro (EUR)', value: 'EUR' }, { label: 'US Dollar (USD)', value: 'USD' }, { label: 'British Pound (GBP)', value: 'GBP' }, { label: 'Japanese Yen (JPY)', value: 'JPY' }, { label: 'Canadian Dollar (CAD)', value: 'CAD' }, { label: 'Australian Dollar (AUD)', value: 'AUD' }, { label: 'Indian Rupee (INR)', value: 'INR' }], tooltip: 'Target currency.' }
        ],
        naturalLanguageQueries: ["Convert 100 USD to EUR", "Currency exchange converter", "Dollar to euro conversion"],
        edgeCases: ["Zero or negative amount", "High volatility spreads"],
        calculate: (inputs) => {
            const amt = Number(inputs.amount) || 100;
            const from = String(inputs.sourceUnit || inputs.fromCurrency || 'USD');
            const to = String(inputs.targetUnit || inputs.toCurrency || 'EUR');

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
                primaryOutput: {
                    label: `Converted Value (${to})`,
                    value: `${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${to}`
                },
                secondaryMetrics: [
                    { label: 'Exchange Rate', value: `1 ${from} = ${rate.toFixed(4)} ${to}` },
                    { label: 'Inverse Exchange Rate', value: `1 ${to} = ${(1 / rate).toFixed(4)} ${from}` },
                    { label: 'USD Equivalent Benchmark', value: `$${amountInUSD.toFixed(2)} USD` },
                    { label: 'Rate Type', value: 'Mid-Market Reference Rate' }
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
        description: "A Hat Size Calculator that converts head circumference measurements into US fractional hat sizes, UK sizes, metric cm, and alpha fits.",
        inputs: [
            { id: 'headCircumference', name: 'Head Circumference', type: 'number', defaultValue: 22.5, min: 19, max: 26, step: 0.125, tooltip: 'Measured just above ears.' },
            { id: 'circUnit', name: 'Measurement Unit', type: 'dropdown', defaultValue: 'in', options: [{ label: 'Inches (in)', value: 'in' }, { label: 'Centimeters (cm)', value: 'cm' }], tooltip: 'Unit.' }
        ],
        naturalLanguageQueries: ["Hat size calculator circumference inches", "What hat size is 22.5 inches", "Head circumference to hat size"],
        edgeCases: ["Boundary fraction rounding", "Loose vs tight fit"],
        calculate: (inputs) => {
            const cVal = Number(inputs.headCircumference) || 22.5;
            const unit = String(inputs.circUnit || 'in');

            const circInches = unit === 'cm' ? cVal / 2.54 : cVal;
            const circCm = unit === 'in' ? cVal * 2.54 : cVal;

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
                primaryOutput: { label: 'US Hat Size', value: `Size ${usHatSize}` },
                secondaryMetrics: [
                    { label: 'Alpha Fitting', value: alpha },
                    { label: 'Metric Hat Size', value: `${metricSize} cm` },
                    { label: 'UK Hat Size', value: `~${ukHatSize}` },
                    { label: 'Head Circumference', value: `${circInches.toFixed(2)} in (${circCm.toFixed(1)} cm)` }
                ]
            };
        }
    },

    // 18. International Shoe Size Conversion
    {
        id: 'shoe-size-conversion',
        name: 'International Shoe Size Conversion',
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

            const ukSize = gender === 'womens' ? Math.max(1, usSize - 2.0) : Math.max(1, usSize - 0.5);
            const euSize = gender === 'womens' ? Math.round(usSize + 31) : Math.round(usSize + 33);
            const cmLength = gender === 'womens' ? (usSize + 17) : (usSize + 18);
            const inches = (cmLength / 2.54).toFixed(1);

            return {
                primaryOutput: { label: 'International Size Standards', value: `US ${usSize.toFixed(1)} / UK ${ukSize.toFixed(1)} / EU ${euSize}` },
                secondaryMetrics: [
                    { label: 'US & Canada Size', value: `US ${usSize.toFixed(1)} (${gender.toUpperCase()})` },
                    { label: 'UK & Australia Size', value: `UK ${ukSize.toFixed(1)}` },
                    { label: 'European Sizing (EU)', value: `EU ${euSize}` },
                    { label: 'Foot Length (Japan / CM)', value: `${cmLength.toFixed(1)} cm (${inches} in)` }
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

            const euBand = Math.round((band * 2.54) / 5) * 5;
            const frBand = euBand + 15;
            const auBand = band - 22;

            let ukCup = cup;
            let euCup = cup;
            if (cup === 'DD') { ukCup = 'DD'; euCup = 'E'; }
            else if (cup === 'DDD') { ukCup = 'E'; euCup = 'F'; }
            else if (cup === 'G') { ukCup = 'F'; euCup = 'G'; }
            else if (cup === 'H') { ukCup = 'FF'; euCup = 'H'; }

            const sisterTight = `${band - 2}${cup === 'A' ? 'B' : cup === 'B' ? 'C' : cup === 'C' ? 'D' : 'DD'}`;
            const sisterLoose = `${band + 2}${cup === 'DD' ? 'D' : cup === 'D' ? 'C' : cup === 'C' ? 'B' : 'A'}`;

            return {
                primaryOutput: { label: 'International Size Equivalent', value: `US/UK ${band}${cup} = EU ${euBand}${euCup}` },
                secondaryMetrics: [
                    { label: 'US & UK Size', value: `${band}${cup} (UK: ${band}${ukCup})` },
                    { label: 'Continental European (EU)', value: `${euBand}${euCup}` },
                    { label: 'France & Spain (FR/ES)', value: `${frBand}${euCup}` },
                    { label: 'Australia & New Zealand (AU/NZ)', value: `Size ${auBand}${cup}` },
                    { label: 'Sister Sizes (Equal Cup Volume)', value: `Tighter: ${sisterTight} | Looser: ${sisterLoose}` }
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

            let cupGrams = 120;
            if (ing === 'sugar') cupGrams = 200;
            else if (ing === 'brown_sugar') cupGrams = 220;
            else if (ing === 'butter') cupGrams = 227;
            else if (ing === 'liquid') cupGrams = 240;
            else if (ing === 'cocoa') cupGrams = 100;
            else if (ing === 'oats') cupGrams = 90;

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
                primaryOutput: {
                    label: 'Metric Weight Equivalent',
                    value: `${Math.round(totalGrams).toLocaleString()} grams (g)`
                },
                secondaryMetrics: [
                    { label: 'US Cup Measurement', value: `${usCups.toFixed(2)} Cups` },
                    { label: 'Weight in Ounces (oz)', value: `${totalOz.toFixed(2)} oz` },
                    { label: 'Tablespoons & Teaspoons', value: `${tbsp.toFixed(1)} tbsp (${tsp.toFixed(0)} tsp)` },
                    { label: 'Liquid Volume Equivalent', value: `~${Math.round(mlLiquid)} mL` },
                    { label: 'Ingredient Density Standard', value: `1 Cup = ${cupGrams}g (${ing.replace('_', ' ').toUpperCase()})` }
                ]
            };
        }
    }
];

export const cat08ConversionCalculators = conversionUnitsCalculators;
export default conversionUnitsCalculators;
