import { CalculatorDefinition } from '../../types/calculator';

export const constructionHomeCalculators: CalculatorDefinition[] = [
    // 1. Concrete Slab & Footing Calculator
    {
        id: 'concrete-calculator',
        name: 'Concrete Slab & Footing Calculator',
        category: 'construction-trades',
        group: '5A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '673K',
        cpc: '$1.40',
        description: 'Calculates concrete volume in cubic yards, cubic meters, and pre-mixed bag quantities (60lb & 80lb) with standard spillage safety margins.',
        inputs: [
            { id: 'lengthFt', name: 'Slab Length (Feet)', type: 'number', defaultValue: 20, min: 1, step: 0.5, suffix: 'ft', tooltip: 'Length of the pour area.' },
            { id: 'widthFt', name: 'Slab Width (Feet)', type: 'number', defaultValue: 10, min: 1, step: 0.5, suffix: 'ft', tooltip: 'Width of the pour area.' },
            { id: 'thicknessInches', name: 'Thickness (Inches)', type: 'number', defaultValue: 4, min: 1, max: 24, step: 0.5, suffix: 'in', tooltip: 'Standard patio/driveway depth is 4-6 inches.' },
            {
                id: 'wasteAllowancePct', name: 'Waste & Spillage Allowance', type: 'dropdown', defaultValue: 10, options: [
                    { label: '5% Extra', value: 5 },
                    { label: '10% Extra (Standard)', value: 10 },
                    { label: '15% Extra (Uneven Ground)', value: 15 }
                ], tooltip: 'Recommended allowance for uneven excavation and spillage.'
            }
        ],
        naturalLanguageQueries: [
            'How much concrete do I need for a 10x20 slab?',
            'Concrete cubic yard calculator',
            'How many 80lb bags of concrete for 4 inch slab?'
        ],
        edgeCases: ['Zero depth or dimensions', 'Excessive waste percentages'],
        calculate: (inputs) => {
            const l = Number(inputs.lengthFt) || 20;
            const w = Number(inputs.widthFt) || 10;
            const t = Number(inputs.thicknessInches) || 4;
            const waste = (Number(inputs.wasteAllowancePct) || 10) / 100;

            // Volume in cubic feet: L * W * (T / 12)
            const cubicFeetRaw = l * w * (t / 12);
            const cubicFeetWithWaste = cubicFeetRaw * (1 + waste);

            // 1 cubic yard = 27 cubic feet
            const cubicYards = cubicFeetWithWaste / 27;
            // 1 cubic meter = 35.3147 cubic feet
            const cubicMeters = cubicFeetWithWaste / 35.3147;

            // 80lb bag yields ~0.60 cu ft; 60lb bag yields ~0.45 cu ft
            const bags80lb = Math.ceil(cubicFeetWithWaste / 0.60);
            const bags60lb = Math.ceil(cubicFeetWithWaste / 0.45);

            return {
                primaryOutput: { label: 'Total Concrete Needed', value: cubicYards.toFixed(2), suffix: 'Cubic Yards' },
                secondaryMetrics: [
                    { label: 'Metric Volume', value: `${cubicMeters.toFixed(2)} m³` },
                    { label: 'Total Volume (Cubic Feet)', value: `${cubicFeetWithWaste.toFixed(1)} cu ft` },
                    { label: '80 lb Pre-mix Bags Required', value: `${bags80lb} Bags` },
                    { label: '60 lb Pre-mix Bags Required', value: `${bags60lb} Bags` }
                ]
            };
        }
    },

    // 2. Paint Wall Coverage Calculator
    {
        id: 'paint-calculator',
        name: 'Interior Paint & Primer Calculator',
        category: 'construction-trades',
        group: '5A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '450K',
        cpc: '$1.10',
        description: 'Estimates gallons and liters of paint required for room walls, factoring in door/window surface deductions and multiple coats.',
        inputs: [
            { id: 'roomPerimeterFt', name: 'Total Room Wall Perimeter (Feet)', type: 'number', defaultValue: 50, min: 5, step: 1, suffix: 'ft', tooltip: 'Sum of all four wall lengths.' },
            { id: 'ceilingHeightFt', name: 'Ceiling Height (Feet)', type: 'number', defaultValue: 9, min: 6, max: 20, step: 0.5, suffix: 'ft', tooltip: 'Standard height is 8 to 10 feet.' },
            { id: 'doorsCount', name: 'Number of Doors', type: 'number', defaultValue: 2, min: 0, max: 10, step: 1, suffix: 'doors', tooltip: 'Standard door deducts ~21 sq ft.' },
            { id: 'windowsCount', name: 'Number of Windows', type: 'number', defaultValue: 2, min: 0, max: 20, step: 1, suffix: 'windows', tooltip: 'Standard window deducts ~15 sq ft.' },
            {
                id: 'coats', name: 'Number of Coats', type: 'dropdown', defaultValue: 2, options: [
                    { label: '1 Coat (Touch-up / Same Color)', value: 1 },
                    { label: '2 Coats (Standard Coverage)', value: 2 },
                    { label: '3 Coats (Dark to Light Color Change)', value: 3 }
                ], tooltip: 'Number of coverage layers.'
            }
        ],
        naturalLanguageQueries: [
            'How much paint do I need for a 12x12 room?',
            'Paint gallon calculator',
            'Square footage paint estimator'
        ],
        edgeCases: ['Deductions exceeding total gross wall area'],
        calculate: (inputs) => {
            const perim = Number(inputs.roomPerimeterFt) || 50;
            const height = Number(inputs.ceilingHeightFt) || 9;
            const doors = Number(inputs.doorsCount) || 0;
            const windows = Number(inputs.windowsCount) || 0;
            const coats = Number(inputs.coats) || 2;

            const grossArea = perim * height;
            const deductions = (doors * 21) + (windows * 15);
            const netWallArea = Math.max(0, grossArea - deductions);
            const totalCoatedArea = netWallArea * coats;

            // 1 standard gallon covers ~350 square feet
            const gallonsNeeded = totalCoatedArea / 350;
            const litersNeeded = gallonsNeeded * 3.78541;

            return {
                primaryOutput: { label: 'Paint Required', value: `${Math.ceil(gallonsNeeded)} Gallons`, suffix: `(${gallonsNeeded.toFixed(2)} Exact)` },
                secondaryMetrics: [
                    { label: 'Net Wall Surface Area', value: `${netWallArea.toFixed(0)} sq ft` },
                    { label: 'Cumulative Coated Area', value: `${totalCoatedArea.toFixed(0)} sq ft` },
                    { label: 'Metric Volume Equivalent', value: `${litersNeeded.toFixed(1)} Liters` },
                    { label: 'Deducted Door & Window Area', value: `${deductions} sq ft` }
                ]
            };
        }
    },

    // 3. Tile & Grout Coverage Calculator
    {
        id: 'tile-calculator',
        name: 'Floor & Wall Tile Calculator',
        category: 'construction-trades',
        group: '5A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '301K',
        cpc: '$0.95',
        description: 'Calculates the number of tiles, cartons, and square footage required for flooring or backsplash installations including cut waste.',
        inputs: [
            { id: 'areaLengthFt', name: 'Room / Area Length (Feet)', type: 'number', defaultValue: 15, min: 1, step: 0.5, suffix: 'ft', tooltip: 'Length of surface to tile.' },
            { id: 'areaWidthFt', name: 'Room / Area Width (Feet)', type: 'number', defaultValue: 12, min: 1, step: 0.5, suffix: 'ft', tooltip: 'Width of surface to tile.' },
            { id: 'tileWidthInches', name: 'Tile Width (Inches)', type: 'number', defaultValue: 12, min: 1, max: 48, step: 1, suffix: 'in', tooltip: 'Nominal tile width.' },
            { id: 'tileLengthInches', name: 'Tile Length (Inches)', type: 'number', defaultValue: 24, min: 1, max: 48, step: 1, suffix: 'in', tooltip: 'Nominal tile length.' },
            {
                id: 'wastePct', name: 'Cutting & Pattern Waste Allowance', type: 'dropdown', defaultValue: 10, options: [
                    { label: '10% Extra (Standard Grid)', value: 10 },
                    { label: '15% Extra (Diagonal / Herringbone)', value: 15 },
                    { label: '20% Extra (Complex Cuts / Irregular Rooms)', value: 20 }
                ], tooltip: 'Extra tiles needed for border cuts and breakage.'
            }
        ],
        naturalLanguageQueries: [
            'How many 12x24 tiles for 180 sq ft?',
            'Tile calculator with waste factor',
            'How many boxes of tile do I need?'
        ],
        edgeCases: ['Zero tile size inputs'],
        calculate: (inputs) => {
            const l = Number(inputs.areaLengthFt) || 15;
            const w = Number(inputs.areaWidthFt) || 12;
            const tileW = Math.max(1, Number(inputs.tileWidthInches) || 12);
            const tileL = Math.max(1, Number(inputs.tileLengthInches) || 24);
            const waste = (Number(inputs.wastePct) || 10) / 100;

            const baseAreaSqFt = l * w;
            const totalAreaWithWaste = baseAreaSqFt * (1 + waste);

            const singleTileSqFt = (tileW * tileL) / 144;
            const totalTiles = Math.ceil(totalAreaWithWaste / singleTileSqFt);
            // Average carton covers approx 15 sq ft of tile
            const estimatedCartons = Math.ceil(totalAreaWithWaste / 15);

            return {
                primaryOutput: { label: 'Total Tiles Required', value: `${totalTiles} Tiles` },
                secondaryMetrics: [
                    { label: 'Total Purchase Area (Inc. Waste)', value: `${totalAreaWithWaste.toFixed(1)} sq ft` },
                    { label: 'Net Surface Area', value: `${baseAreaSqFt.toFixed(1)} sq ft` },
                    { label: 'Single Tile Surface Area', value: `${singleTileSqFt.toFixed(2)} sq ft` },
                    { label: 'Estimated Boxes / Cartons (~15 sq ft/box)', value: `${estimatedCartons} Boxes` }
                ]
            };
        }
    },

    // 4. Mulch & Landscaping Soil Calculator
    {
        id: 'mulch-calculator',
        name: 'Mulch, Topsoil & Gravel Calculator',
        category: 'construction-trades',
        group: '5A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '550K',
        cpc: '$1.05',
        description: 'Computes volume of mulch, topsoil, or decorative stone for garden beds in cubic yards and standard 2-cubic-foot bags.',
        inputs: [
            { id: 'bedLengthFt', name: 'Garden Bed Length (Feet)', type: 'number', defaultValue: 30, min: 1, step: 0.5, suffix: 'ft', tooltip: 'Length of garden bed.' },
            { id: 'bedWidthFt', name: 'Garden Bed Width (Feet)', type: 'number', defaultValue: 6, min: 1, step: 0.5, suffix: 'ft', tooltip: 'Width of garden bed.' },
            {
                id: 'layerDepthInches', name: 'Desired Depth (Inches)', type: 'dropdown', defaultValue: 3, options: [
                    { label: '2 Inches (Annual Refresh)', value: 2 },
                    { label: '3 Inches (Standard Weed Suppression)', value: 3 },
                    { label: '4 Inches (New Installation)', value: 4 }
                ], tooltip: 'Depth of mulch layer.'
            }
        ],
        naturalLanguageQueries: [
            'How much mulch do I need for a 30x6 bed?',
            'Cubic yards of mulch calculator',
            'How many bags of mulch in a cubic yard?'
        ],
        edgeCases: ['Zero depth selection'],
        calculate: (inputs) => {
            const l = Number(inputs.bedLengthFt) || 30;
            const w = Number(inputs.bedWidthFt) || 6;
            const d = Number(inputs.layerDepthInches) || 3;

            const areaSqFt = l * w;
            const cuFt = areaSqFt * (d / 12);
            const cuYds = cuFt / 27;

            // Standard retail bags are 2.0 cu ft (large) or 1.5 cu ft (medium)
            const bags2cuft = Math.ceil(cuFt / 2.0);
            const bags1_5cuft = Math.ceil(cuFt / 1.5);

            return {
                primaryOutput: { label: 'Bulk Mulch Volume', value: cuYds.toFixed(2), suffix: 'Cubic Yards' },
                secondaryMetrics: [
                    { label: 'Total Volume (Cubic Feet)', value: `${cuFt.toFixed(1)} cu ft` },
                    { label: 'Standard 2 cu ft Bags Needed', value: `${bags2cuft} Bags` },
                    { label: 'Small 1.5 cu ft Bags Needed', value: `${bags1_5cuft} Bags` },
                    { label: 'Ground Coverage Area', value: `${areaSqFt} sq ft` }
                ]
            };
        }
    },

    // 5. HVAC Cooling Capacity & BTU Calculator
    {
        id: 'hvac-btu-calculator',
        name: 'HVAC Air Conditioner BTU & Tonnage Calculator',
        category: 'construction-trades',
        group: '5A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '201K',
        cpc: '$1.85',
        description: 'Calculates the British Thermal Units (BTU/hr) and refrigeration tons needed to cool a residential or office space.',
        inputs: [
            { id: 'roomSqFt', name: 'Total Area to Cool (Square Feet)', type: 'number', defaultValue: 500, min: 50, max: 5000, step: 25, suffix: 'sq ft', tooltip: 'Floor surface area.' },
            {
                id: 'sunlightExposure', name: 'Sunlight Exposure', type: 'dropdown', defaultValue: 'average', options: [
                    { label: 'Average Sunlight', value: 'average' },
                    { label: 'Heavily Shaded (-10% BTU)', value: 'shaded' },
                    { label: 'Very Sunny (+10% BTU)', value: 'sunny' }
                ], tooltip: 'Window orientation and shade.'
            },
            { id: 'occupants', name: 'Typical Regular Occupants', type: 'number', defaultValue: 2, min: 1, max: 20, step: 1, suffix: 'people', tooltip: 'Each person above 2 adds 600 BTUs.' },
            {
                id: 'isKitchen', name: 'Is this space a Kitchen?', type: 'dropdown', defaultValue: 'no', options: [
                    { label: 'No (Living / Bed / Office)', value: 'no' },
                    { label: 'Yes (Kitchen +4,000 BTU for oven)', value: 'yes' }
                ], tooltip: 'Kitchen cooking appliances add thermal load.'
            }
        ],
        naturalLanguageQueries: [
            'How many BTUs for a 500 sq ft room?',
            'AC tonnage calculator',
            'What size air conditioner do I need?'
        ],
        edgeCases: ['Commercial oversized load configurations'],
        calculate: (inputs) => {
            const sqFt = Number(inputs.roomSqFt) || 500;
            const sun = inputs.sunlightExposure;
            const people = Number(inputs.occupants) || 2;
            const kitchen = inputs.isKitchen === 'yes';

            // Base: ~20 BTU per square foot of living space
            let btu = sqFt * 20;

            // Sunlight modifier
            if (sun === 'shaded') btu *= 0.90;
            else if (sun === 'sunny') btu *= 1.10;

            // People modifier (600 BTU for each additional person beyond 2)
            if (people > 2) {
                btu += (people - 2) * 600;
            }

            // Kitchen heat modifier
            if (kitchen) {
                btu += 4000;
            }

            // 1 Ton of refrigeration = 12,000 BTU/hr
            const tons = btu / 12000;

            return {
                primaryOutput: { label: 'Recommended Cooling Capacity', value: Math.round(btu).toLocaleString(), suffix: 'BTU / hr' },
                secondaryMetrics: [
                    { label: 'Refrigeration Tonnage', value: `${tons.toFixed(2)} Tons` },
                    { label: 'Recommended Unit Size Rating', value: tons < 1 ? '12,000 BTU (1.0 Ton)' : `${(Math.ceil(tons * 2) / 2).toFixed(1)} Ton Unit` },
                    { label: 'Thermal Load Per Sq Ft', value: `${(btu / sqFt).toFixed(1)} BTU / sq ft` }
                ]
            };
        }
    },

    // 6. Drywall Sheet Calculator
    {
        id: 'drywall-calculator',
        name: 'Drywall Sheet & Mud Calculator',
        category: 'construction-trades',
        group: '5A',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '110K',
        cpc: '$0.80',
        description: 'Estimates sheets of drywall (4x8 or 4x12), joint compound mud buckets, tape, and screws for rooms or ceilings.',
        inputs: [
            { id: 'wallAreaSqFt', name: 'Total Wall & Ceiling Area', type: 'number', defaultValue: 650, min: 50, step: 25, suffix: 'sq ft', tooltip: 'Gross surface area.' },
            {
                id: 'sheetSize', name: 'Drywall Sheet Size', type: 'dropdown', defaultValue: '4x8', options: [
                    { label: '4 ft × 8 ft Sheet (32 sq ft)', value: '4x8' },
                    { label: '4 ft × 12 ft Sheet (48 sq ft)', value: '4x12' }
                ], tooltip: 'Standard sheet dimensions.'
            }
        ],
        naturalLanguageQueries: [
            'How many sheets of drywall for 650 sq ft?',
            'Drywall calculator with screws and tape',
            '4x8 vs 4x12 sheet count'
        ],
        edgeCases: ['Zero square footage inputs'],
        calculate: (inputs) => {
            const area = Number(inputs.wallAreaSqFt) || 650;
            const size = inputs.sheetSize;
            const sheetSqFt = size === '4x12' ? 48 : 32;

            // Add 10% waste for cutoffs and corner trimming
            const sheetsExact = (area * 1.10) / sheetSqFt;
            const sheetsRounded = Math.ceil(sheetsExact);

            // Rule of thumb estimates:
            // ~0.05 gallons of joint compound per sq ft (~1 standard 4.5 gal bucket per 100 sq ft)
            const compoundGallons = area * 0.053;
            const screwsCount = sheetsRounded * 32; // ~32 screws per 4x8 sheet
            const tapeRolls = Math.ceil(area / 350); // ~1 roll (250ft) covers ~350 sq ft

            return {
                primaryOutput: { label: 'Drywall Sheets Required', value: `${sheetsRounded} Sheets`, suffix: `(${size})` },
                secondaryMetrics: [
                    { label: 'Joint Compound Mud Required', value: `~${compoundGallons.toFixed(1)} Gallons` },
                    { label: 'Fasteners / Drywall Screws', value: `~${screwsCount} Screws` },
                    { label: 'Joint Tape Rolls (250ft rolls)', value: `${tapeRolls} Rolls` },
                    { label: 'Total Covered Area (Inc. 10% Waste)', value: `${(area * 1.10).toFixed(0)} sq ft` }
                ]
            };
        }
    }
];