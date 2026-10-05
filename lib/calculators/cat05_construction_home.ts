import { CalculatorDefinition } from '@/types/calculator';

export const constructionHomeCalculators: CalculatorDefinition[] = [
    // 1. Concrete Calculator
    {
        id: 'concrete-calculator',
        name: 'Concrete Calculator',
        category: 'construction-trades',
        group: 'Measurements & Materials',
        bucket: 'Bucket C1',
        tier: 1,
        phase: 1,
        monthlySearches: '673K',
        cpc: '$2.08',
        description: "A Concrete Calculator estimates the volume of concrete required for slabs, footings, columns, walls, and other construction structures. It helps contractors, builders, and homeowners determine material quantities and reduce waste. The calculator supports multiple shape types and includes optional waste allowances for overpour and uneven surfaces.",
        inputs: [
            { id: 'lengthFt', name: 'Slab Length (Feet)', type: 'number', defaultValue: 20, min: 1, step: 0.5, suffix: 'ft', tooltip: 'Length in feet.' },
            { id: 'widthFt', name: 'Slab Width (Feet)', type: 'number', defaultValue: 10, min: 1, step: 0.5, suffix: 'ft', tooltip: 'Width in feet.' },
            { id: 'thicknessIn', name: 'Slab Thickness (Inches)', type: 'number', defaultValue: 4, min: 1, max: 24, step: 0.5, suffix: 'in', tooltip: 'Thickness (standard patio is 4 in).' },
            { id: 'wastePct', name: 'Waste Factor (%)', type: 'percentage', defaultValue: 10, min: 0, max: 25, step: 1, suffix: '%', tooltip: 'Spillage & uneven subgrade margin.' }
        ],
        naturalLanguageQueries: ["Calculate my concrete calculator", "What is my concrete calculator?", "Help me solve concrete calculator"],
        edgeCases: ["Negative dimensions Zero thickness Mixed unit systems Extremely large pours causing overflow"],
        calculate: (inputs) => {
            const l = Number(inputs.lengthFt) || 20;
            const w = Number(inputs.widthFt) || 10;
            const tIn = Number(inputs.thicknessIn) || 4;
            const waste = (Number(inputs.wastePct) || 10) / 100;

            const cuFt = l * w * (tIn / 12);
            const rawYards = cuFt / 27;
            const totalYards = rawYards * (1 + waste);

            const bags80 = Math.ceil(totalYards * 45); // ~45 80lb bags per yard (0.6 cu ft/bag)
            const bags60 = Math.ceil(totalYards * 60); // ~60 60lb bags per yard (0.45 cu ft/bag)

            return {
                primaryOutput: { label: 'Concrete Volume Required', value: Number(totalYards.toFixed(2)), suffix: 'Cubic Yards' },
                secondaryMetrics: [
                    { label: 'Volume in Cubic Feet', value: `${Number((totalYards * 27).toFixed(1))} cu ft` },
                    { label: '80 lb Pre-mixed Bags (0.6 cu ft)', value: `${bags80} Bags` },
                    { label: '60 lb Pre-mixed Bags (0.45 cu ft)', value: `${bags60} Bags` }
                ]
            };
        }
    },
    // 2. Square Footage Calculator
    {
        id: 'square-footage-calculator',
        name: 'Square Footage Calculator',
        category: 'construction-trades',
        group: 'Measurements & Materials',
        bucket: 'Bucket C1',
        tier: 1,
        phase: 1,
        monthlySearches: '246K',
        cpc: '$0.52',
        description: "A Square Footage Calculator computes floor or surface area for rooms, buildings, and outdoor spaces. It helps estimate materials, pricing, and construction requirements. The calculator supports rectangular, circular, triangular, and irregular spaces.",
        inputs: [
            { id: 'lengthFt', name: 'Length (Feet)', type: 'number', defaultValue: 15, min: 0.1, step: 0.5, suffix: 'ft', tooltip: 'Room length.' },
            { id: 'widthFt', name: 'Width (Feet)', type: 'number', defaultValue: 12, min: 0.1, step: 0.5, suffix: 'ft', tooltip: 'Room width.' },
            { id: 'pricePerSqFt', name: 'Price per Square Foot ($)', type: 'currency', defaultValue: 4.50, min: 0, step: 0.25, prefix: '$', tooltip: 'Cost rate.' }
        ],
        naturalLanguageQueries: ["Calculate my square footage calculator", "What is my square footage calculator?", "Help me solve square footage calculator"],
        edgeCases: ["Negative dimensions Unsupported custom shapes Unit inconsistencies"],
        calculate: (inputs) => {
            const l = Number(inputs.lengthFt) || 15;
            const w = Number(inputs.widthFt) || 12;
            const price = Number(inputs.pricePerSqFt) || 4.50;

            const sqFt = l * w;
            const sqMeters = sqFt * 0.092903;
            const totalCost = sqFt * price;

            return {
                primaryOutput: { label: 'Total Area', value: Number(sqFt.toFixed(2)), suffix: 'Sq Ft' },
                secondaryMetrics: [
                    { label: 'Metric Equivalent', value: `${sqMeters.toFixed(2)} m²` },
                    { label: 'Estimated Material Cost', value: `$${Math.round(totalCost).toLocaleString()}` },
                    { label: 'Perimeter Boundary', value: `${2 * (l + w)} Linear Feet` }
                ]
            };
        }
    },
    // 3. Roofing Calculator
    {
        id: 'roofing-calculator',
        name: 'Roofing Calculator',
        category: 'construction-trades',
        group: 'Measurements & Materials',
        bucket: 'Bucket C1',
        tier: 3,
        phase: 2,
        monthlySearches: '18K',
        cpc: '$14.75  ★ HIGH CPC',
        description: "A Roofing Calculator estimates roofing materials required for roof installation or replacement. It helps determine shingles, underlayment, and roofing costs. The calculator supports pitched roofs and waste adjustments.",
        inputs: [
            { id: 'groundAreaSqFt', name: 'Roof Base Footprint Area (Sq Ft)', type: 'number', defaultValue: 2000, min: 100, step: 50, suffix: 'sq ft', tooltip: 'Base building area.' },
            { id: 'roofPitch', name: 'Roof Pitch Slope (Rise / 12)', type: 'dropdown', defaultValue: 1.054, options: [{ label: 'Flat / Low Slope (2:12 - Factor 1.014)', value: 1.014 }, { label: 'Medium Pitch (4:12 - Factor 1.054)', value: 1.054 }, { label: 'Standard Pitch (6:12 - Factor 1.118)', value: 1.118 }, { label: 'Steep Pitch (8:12 - Factor 1.202)', value: 1.202 }, { label: 'Very Steep (12:12 - Factor 1.414)', value: 1.414 }], tooltip: 'Pitch multiplier.' },
            { id: 'wastePct', name: 'Waste Factor (%)', type: 'percentage', defaultValue: 10, min: 0, max: 25, step: 1, suffix: '%', tooltip: 'Overlaps & valley cuts.' }
        ],
        naturalLanguageQueries: ["Calculate my roofing calculator", "What is my roofing calculator?", "Help me solve roofing calculator"],
        edgeCases: ["Zero division errors", "Invalid input formats", "Boundary conditions"],
        calculate: (inputs) => {
            const baseSqFt = Number(inputs.groundAreaSqFt) || 2000;
            const pitchFactor = Number(inputs.roofPitch) || 1.054;
            const waste = (Number(inputs.wastePct) || 10) / 100;

            const actualSqFt = baseSqFt * pitchFactor * (1 + waste);
            const squares = actualSqFt / 100; // 1 roofing square = 100 sq ft
            const bundles = Math.ceil(squares * 3); // 3 bundles per square for 3-tab/architectural shingles
            const underlaymentRolls = Math.ceil(actualSqFt / 400); // 400 sq ft roll coverage

            return {
                primaryOutput: { label: 'Roofing Squares Required', value: Number(squares.toFixed(1)), suffix: 'Squares (100 sq ft)' },
                secondaryMetrics: [
                    { label: 'Total Surface Area with Waste', value: `${Math.round(actualSqFt)} sq ft` },
                    { label: 'Shingle Bundles Needed (3/Square)', value: `${bundles} Bundles` },
                    { label: 'Underlayment Rolls (400 sq ft/roll)', value: `${underlaymentRolls} Rolls` }
                ]
            };
        }
    },
    // 4. Tile Calculator
    {
        id: 'tile-calculator',
        name: 'Tile Calculator',
        category: 'construction-trades',
        group: 'Measurements & Materials',
        bucket: 'Bucket C1',
        tier: 2,
        phase: 2,
        monthlySearches: '33K',
        cpc: '$1.00',
        description: "A Tile Calculator estimates the number of tiles needed for floors, walls, and backsplashes. It helps avoid material shortages during installations. The calculator includes grout spacing and waste percentages.",
        inputs: [
            { id: 'roomLengthFt', name: 'Room Length (Feet)', type: 'number', defaultValue: 14, min: 1, step: 0.5, suffix: 'ft', tooltip: 'Length.' },
            { id: 'roomWidthFt', name: 'Room Width (Feet)', type: 'number', defaultValue: 10, min: 1, step: 0.5, suffix: 'ft', tooltip: 'Width.' },
            { id: 'tileSizeIn', name: 'Tile Dimensions (Inches)', type: 'dropdown', defaultValue: 144, options: [{ label: '12" × 12" (1.0 sq ft)', value: 144 }, { label: '18" × 18" (2.25 sq ft)', value: 324 }, { label: '24" × 24" (4.0 sq ft)', value: 576 }, { label: '6" × 24" Plank (1.0 sq ft)', value: 144 }, { label: '4" × 4" Subway (0.11 sq ft)', value: 16 }], tooltip: 'Tile size.' },
            { id: 'wastePct', name: 'Waste Factor (%)', type: 'percentage', defaultValue: 10, min: 0, max: 25, step: 1, suffix: '%', tooltip: 'Cuts & breakage.' }
        ],
        naturalLanguageQueries: ["Calculate my tile calculator", "What is my tile calculator?", "Help me solve tile calculator"],
        edgeCases: ["Zero tile dimensions Excessive grout spacing Fractional tile rounding"],
        calculate: (inputs) => {
            const l = Number(inputs.roomLengthFt) || 14;
            const w = Number(inputs.roomWidthFt) || 10;
            const tileSqIn = Number(inputs.tileSizeIn) || 144;
            const waste = (Number(inputs.wastePct) || 10) / 100;

            const roomSqFt = l * w;
            const totalSqFt = roomSqFt * (1 + waste);
            const tileSqFt = tileSqIn / 144;
            const tilesNeeded = Math.ceil(totalSqFt / tileSqFt);
            const boxesNeeded = Math.ceil(tilesNeeded / 10); // ~10 tiles per box

            return {
                primaryOutput: { label: 'Total Tiles Required', value: tilesNeeded, suffix: 'Tiles' },
                secondaryMetrics: [
                    { label: 'Tiled Area with Waste Margin', value: `${totalSqFt.toFixed(1)} sq ft` },
                    { label: 'Estimated Boxes (10 tiles/box)', value: `${boxesNeeded} Boxes` },
                    { label: 'Thin-Set Mortar Needed (~50 sq ft/bag)', value: `${Math.ceil(totalSqFt / 50)} Bags (50 lb)` }
                ]
            };
        }
    },
    // 5. Stair Calculator
    {
        id: 'stair-calculator',
        name: 'Stair Calculator',
        category: 'construction-trades',
        group: 'Measurements & Materials',
        bucket: 'Bucket C1',
        tier: 2,
        phase: 2,
        monthlySearches: '50K',
        cpc: '$1.06',
        description: "A Stair Calculator computes stair dimensions including risers, treads, angle, and total run. It helps builders design code-compliant staircases. The calculator supports residential and commercial standards.",
        inputs: [
            { id: 'totalRiseIn', name: 'Total Rise / Height (Inches)', type: 'number', defaultValue: 105, min: 10, max: 300, step: 0.5, suffix: 'in', tooltip: 'Finished floor to finished floor.' },
            { id: 'targetTreadDepthIn', name: 'Target Tread Depth (Inches)', type: 'number', defaultValue: 10.5, min: 9, max: 14, step: 0.25, suffix: 'in', tooltip: 'Tread depth (IBC code min 10 in).' }
        ],
        naturalLanguageQueries: ["Calculate my stair calculator", "What is my stair calculator?", "Help me solve stair calculator"],
        edgeCases: ["Non-compliant riser heights Negative rise Uneven stair spacing"],
        calculate: (inputs) => {
            const rise = Number(inputs.totalRiseIn) || 105;
            const tread = Number(inputs.targetTreadDepthIn) || 10.5;

            // Target riser height ~7.5 in (IBC max 7.75 in)
            const numRisers = Math.round(rise / 7.5);
            const exactRiserHeight = rise / numRisers;
            const numTreads = numRisers - 1;
            const totalRun = numTreads * tread;
            const stringerLength = Math.sqrt((rise * rise) + (totalRun * totalRun));
            const angleDeg = Math.atan(rise / totalRun) * (180 / Math.PI);

            return {
                primaryOutput: { label: 'Exact Riser Height', value: Number(exactRiserHeight.toFixed(2)), suffix: 'Inches' },
                secondaryMetrics: [
                    { label: 'Number of Risers', value: `${numRisers} Risers` },
                    { label: 'Number of Treads', value: `${numTreads} Treads` },
                    { label: 'Total Horizontal Run', value: `${totalRun.toFixed(1)} in (${(totalRun / 12).toFixed(2)} ft)` },
                    { label: 'Stringer Length', value: `${stringerLength.toFixed(1)} in (${(stringerLength / 12).toFixed(2)} ft)` },
                    { label: 'Stair Incline Angle', value: `${angleDeg.toFixed(1)}° (Code ideal 30°-37°)` }
                ]
            };
        }
    },
    // 6. Mulch Calculator
    {
        id: 'mulch-calculator',
        name: 'Mulch Calculator',
        category: 'construction-trades',
        group: 'Measurements & Materials',
        bucket: 'Bucket C1',
        tier: 2,
        phase: 2,
        monthlySearches: '60K',
        cpc: '$0.60',
        description: "A Mulch Calculator estimates mulch volume required for landscaping beds and gardens. It helps homeowners purchase proper mulch quantities. The calculator supports multiple depth settings.",
        inputs: [
            { id: 'bedLengthFt', name: 'Garden Bed Length (Feet)', type: 'number', defaultValue: 30, min: 1, step: 1, suffix: 'ft', tooltip: 'Length in feet.' },
            { id: 'bedWidthFt', name: 'Garden Bed Width (Feet)', type: 'number', defaultValue: 6, min: 1, step: 0.5, suffix: 'ft', tooltip: 'Width in feet.' },
            { id: 'depthIn', name: 'Mulch Depth (Inches)', type: 'number', defaultValue: 3, min: 1, max: 12, step: 0.5, suffix: 'in', tooltip: 'Recommended is 2-3 inches.' }
        ],
        naturalLanguageQueries: ["Calculate my mulch calculator", "What is my mulch calculator?", "Help me solve mulch calculator"],
        edgeCases: ["Zero depth Negative dimensions Mixed unit systems"],
        calculate: (inputs) => {
            const l = Number(inputs.bedLengthFt) || 30;
            const w = Number(inputs.bedWidthFt) || 6;
            const d = Number(inputs.depthIn) || 3;

            const cuFt = l * w * (d / 12);
            const cuYards = cuFt / 27;
            const bags2CuFt = Math.ceil(cuFt / 2);
            const bags3CuFt = Math.ceil(cuFt / 3);

            return {
                primaryOutput: { label: 'Bulk Mulch Volume', value: Number(cuYards.toFixed(2)), suffix: 'Cubic Yards' },
                secondaryMetrics: [
                    { label: 'Total Volume in Cubic Feet', value: `${cuFt.toFixed(1)} cu ft` },
                    { label: 'Standard 2 cu ft Bags', value: `${bags2CuFt} Bags` },
                    { label: 'Large 3 cu ft Bags', value: `${bags3CuFt} Bags` }
                ]
            };
        }
    },
    // 7. Gravel Calculator
    {
        id: 'gravel-calculator',
        name: 'Gravel Calculator',
        category: 'construction-trades',
        group: 'Measurements & Materials',
        bucket: 'Bucket C1',
        tier: 2,
        phase: 2,
        monthlySearches: '74K',
        cpc: '$0.53',
        description: "A Gravel Calculator estimates gravel quantities required for driveways, landscaping, and construction projects. It helps calculate both volume and weight. The calculator supports density-based weight estimation.",
        inputs: [
            { id: 'drivewayLengthFt', name: 'Area Length (Feet)', type: 'number', defaultValue: 40, min: 1, step: 1, suffix: 'ft', tooltip: 'Length.' },
            { id: 'drivewayWidthFt', name: 'Area Width (Feet)', type: 'number', defaultValue: 12, min: 1, step: 0.5, suffix: 'ft', tooltip: 'Width.' },
            { id: 'depthIn', name: 'Gravel Depth (Inches)', type: 'number', defaultValue: 4, min: 1, max: 24, step: 0.5, suffix: 'in', tooltip: 'Depth.' },
            { id: 'densityTonsPerYard', name: 'Gravel Density (Tons / Cu Yd)', type: 'number', defaultValue: 1.4, min: 1.0, max: 2.0, step: 0.05, suffix: 'tons/yd³', tooltip: 'Crushed gravel ~1.4 tons/yd³.' }
        ],
        naturalLanguageQueries: ["Calculate my gravel calculator", "What is my gravel calculator?", "Help me solve gravel calculator"],
        edgeCases: ["Invalid density values Zero depth Large-volume overflow"],
        calculate: (inputs) => {
            const l = Number(inputs.drivewayLengthFt) || 40;
            const w = Number(inputs.drivewayWidthFt) || 12;
            const d = Number(inputs.depthIn) || 4;
            const density = Number(inputs.densityTonsPerYard) || 1.4;

            const cuFt = l * w * (d / 12);
            const cuYards = cuFt / 27;
            const tons = cuYards * density;

            return {
                primaryOutput: { label: 'Gravel Weight Needed', value: Number(tons.toFixed(2)), suffix: 'Tons' },
                secondaryMetrics: [
                    { label: 'Volume in Cubic Yards', value: `${cuYards.toFixed(2)} cu yd` },
                    { label: 'Volume in Cubic Feet', value: `${cuFt.toFixed(1)} cu ft` },
                    { label: 'Metric Tonnes', value: `${(tons * 0.907185).toFixed(2)} Tonnes` }
                ]
            };
        }
    },
    // 8. Paint Calculator
    {
        id: 'paint-calculator',
        name: 'Paint Calculator',
        category: 'construction-trades',
        group: 'Measurements & Materials',
        bucket: 'Bucket C1',
        tier: 2,
        phase: 2,
        monthlySearches: '74K',
        cpc: '$0.98',
        description: "A Paint Calculator estimates paint quantities required for walls, ceilings, and surfaces. It helps users determine gallons/liters needed and project cost estimates. The calculator accounts for windows, doors, and multiple coats.",
        inputs: [
            { id: 'roomLengthFt', name: 'Room Length (Feet)', type: 'number', defaultValue: 16, min: 1, step: 0.5, suffix: 'ft', tooltip: 'Length.' },
            { id: 'roomWidthFt', name: 'Room Width (Feet)', type: 'number', defaultValue: 12, min: 1, step: 0.5, suffix: 'ft', tooltip: 'Width.' },
            { id: 'ceilingHeightFt', name: 'Ceiling Height (Feet)', type: 'number', defaultValue: 9, min: 6, max: 20, step: 0.5, suffix: 'ft', tooltip: 'Wall height.' },
            { id: 'doorsCount', name: 'Number of Doors (20 sq ft each)', type: 'number', defaultValue: 2, min: 0, step: 1, tooltip: 'Doors count.' },
            { id: 'windowsCount', name: 'Number of Windows (15 sq ft each)', type: 'number', defaultValue: 2, min: 0, step: 1, tooltip: 'Windows count.' },
            { id: 'coats', name: 'Number of Coats', type: 'dropdown', defaultValue: 2, options: [{ label: '1 Coat (Touch-up)', value: 1 }, { label: '2 Coats (Standard)', value: 2 }, { label: '3 Coats (Dark to Light Color Change)', value: 3 }], tooltip: 'Coats.' }
        ],
        naturalLanguageQueries: ["Calculate my paint calculator", "What is my paint calculator?", "Help me solve paint calculator"],
        edgeCases: ["Negative excluded areas Zero coverage rate Multiple room aggregation errors"],
        calculate: (inputs) => {
            const l = Number(inputs.roomLengthFt) || 16;
            const w = Number(inputs.roomWidthFt) || 12;
            const h = Number(inputs.ceilingHeightFt) || 9;
            const doors = Number(inputs.doorsCount) || 0;
            const windows = Number(inputs.windowsCount) || 0;
            const coats = Number(inputs.coats) || 2;

            const grossWallArea = 2 * (l + w) * h;
            const deductions = (doors * 20) + (windows * 15);
            const netWallArea = Math.max(0, grossWallArea - deductions);
            const totalPaintArea = netWallArea * coats;

            // 1 gallon covers approx 350-400 sq ft
            const gallonsNeeded = Math.ceil(totalPaintArea / 350);

            return {
                primaryOutput: { label: 'Paint Gallons Needed', value: gallonsNeeded, suffix: 'Gallons' },
                secondaryMetrics: [
                    { label: 'Net Paintable Wall Area', value: `${netWallArea.toFixed(1)} sq ft` },
                    { label: 'Total Coverage with Coats', value: `${totalPaintArea.toFixed(1)} sq ft` },
                    { label: 'Ceiling Area (if painting)', value: `${l * w} sq ft (${Math.ceil((l * w) / 350)} gal)` }
                ]
            };
        }
    },
    // 9. Wallpaper Calculator
    {
        id: 'wallpaper-calculator',
        name: 'Wallpaper Calculator',
        category: 'construction-trades',
        group: 'Measurements & Materials',
        bucket: 'Bucket C1',
        tier: 2,
        phase: 3,
        monthlySearches: '22K',
        cpc: '$1.96',
        description: "A Wallpaper Calculator estimates wallpaper rolls required for walls and rooms. It helps reduce material shortages and excess purchases. The calculator accounts for pattern repeats and waste.",
        inputs: [
            { id: 'wallWidthFt', name: 'Total Wall Width (Feet)', type: 'number', defaultValue: 30, min: 1, step: 0.5, suffix: 'ft', tooltip: 'Total perimeter width.' },
            { id: 'wallHeightFt', name: 'Wall Height (Feet)', type: 'number', defaultValue: 9, min: 6, step: 0.5, suffix: 'ft', tooltip: 'Wall height.' },
            { id: 'rollCoverageSqFt', name: 'Single Roll Usable Coverage (Sq Ft)', type: 'number', defaultValue: 28, min: 10, step: 1, suffix: 'sq ft', tooltip: 'Standard single roll is ~28 sq ft usable.' }
        ],
        naturalLanguageQueries: ["Calculate my wallpaper calculator", "What is my wallpaper calculator?", "Help me solve wallpaper calculator"],
        edgeCases: ["Zero roll coverage Excessive pattern repeat Non-rectangular walls"],
        calculate: (inputs) => {
            const w = Number(inputs.wallWidthFt) || 30;
            const h = Number(inputs.wallHeightFt) || 9;
            const rollSqFt = Number(inputs.rollCoverageSqFt) || 28;

            const totalSqFt = w * h;
            const withWaste = totalSqFt * 1.15; // 15% pattern match waste
            const rolls = Math.ceil(withWaste / rollSqFt);

            return {
                primaryOutput: { label: 'Wallpaper Rolls Required', value: rolls, suffix: 'Rolls' },
                secondaryMetrics: [
                    { label: 'Total Wall Surface Area', value: `${totalSqFt} sq ft` },
                    { label: 'Pattern Repeat Waste Included', value: '15% Margin' }
                ]
            };
        }
    },
    // 10. Flooring Calculator
    {
        id: 'flooring-calculator',
        name: 'Flooring Calculator',
        category: 'construction-trades',
        group: 'Measurements & Materials',
        bucket: 'Bucket C1',
        tier: 3,
        phase: 3,
        monthlySearches: '8K',
        cpc: '$2.27',
        description: "A Flooring Calculator estimates flooring material required for rooms and buildings. It supports hardwood, laminate, vinyl, and tile flooring. The calculator includes waste allowances for cuts and installation errors.",
        inputs: [
            { id: 'roomLengthFt', name: 'Room Length (Feet)', type: 'number', defaultValue: 20, min: 1, step: 0.5, suffix: 'ft', tooltip: 'Length.' },
            { id: 'roomWidthFt', name: 'Room Width (Feet)', type: 'number', defaultValue: 15, min: 1, step: 0.5, suffix: 'ft', tooltip: 'Width.' },
            { id: 'boxSqFt', name: 'Coverage per Box (Sq Ft)', type: 'number', defaultValue: 24, min: 5, step: 0.5, suffix: 'sq ft/box', tooltip: 'Manufacturer box size.' },
            { id: 'wastePct', name: 'Waste Factor (%)', type: 'percentage', defaultValue: 10, min: 0, max: 25, step: 1, suffix: '%', tooltip: 'Standard 10%, herringbone 15%.' }
        ],
        naturalLanguageQueries: ["Calculate my flooring calculator", "What is my flooring calculator?", "Help me solve flooring calculator"],
        edgeCases: ["Zero room area Invalid box coverage Multiple room handling"],
        calculate: (inputs) => {
            const l = Number(inputs.roomLengthFt) || 20;
            const w = Number(inputs.roomWidthFt) || 15;
            const boxSize = Math.max(1, Number(inputs.boxSqFt) || 24);
            const waste = (Number(inputs.wastePct) || 10) / 100;

            const roomArea = l * w;
            const totalAreaWithWaste = roomArea * (1 + waste);
            const boxes = Math.ceil(totalAreaWithWaste / boxSize);

            return {
                primaryOutput: { label: 'Flooring Boxes Required', value: boxes, suffix: 'Boxes' },
                secondaryMetrics: [
                    { label: 'Room Net Square Footage', value: `${roomArea} sq ft` },
                    { label: 'Total Material to Order', value: `${totalAreaWithWaste.toFixed(1)} sq ft` },
                    { label: 'Total Coverage Provided by Boxes', value: `${boxes * boxSize} sq ft` }
                ]
            };
        }
    },
    // 11. Lumber Calculator (Studs & Plates)
    {
        id: 'lumber-calculator',
        name: 'Lumber Calculator',
        category: 'construction-trades',
        group: 'Measurements & Materials',
        bucket: 'Bucket C1',
        tier: 4,
        phase: 3,
        monthlySearches: '2K',
        cpc: '$3.13',
        description: "A Lumber Calculator estimates wood quantities and costs for framing and woodworking projects. It helps determine board counts and dimensions. The calculator supports nominal and actual lumber dimensions.",
        inputs: [
            { id: 'wallLengthFt', name: 'Total Wall Length (Feet)', type: 'number', defaultValue: 40, min: 1, step: 1, suffix: 'ft', tooltip: 'Linear feet of wall.' },
            { id: 'studSpacingIn', name: 'Stud On-Center Spacing (Inches)', type: 'dropdown', defaultValue: 16, options: [{ label: '16" On-Center (Standard Load-Bearing)', value: 16 }, { label: '24" On-Center (Advanced / Non-Bearing)', value: 24 }], tooltip: 'Stud spacing.' },
            { id: 'cornersCount', name: 'Number of Wall Corners / Intersections', type: 'number', defaultValue: 4, min: 0, step: 1, tooltip: 'Extra studs for corners.' }
        ],
        naturalLanguageQueries: ["Calculate my lumber calculator", "What is my lumber calculator?", "Help me solve lumber calculator"],
        edgeCases: ["Nominal vs actual dimensions Negative board sizes Unit conversion errors"],
        calculate: (inputs) => {
            const l = Number(inputs.wallLengthFt) || 40;
            const spacing = Number(inputs.studSpacingIn) || 16;
            const corners = Number(inputs.cornersCount) || 4;

            // Stud count: (length in inches / spacing) + 1 + (2 per corner) + 10% waste
            const wallInches = l * 12;
            const baseStuds = Math.ceil(wallInches / spacing) + 1;
            const totalStuds = Math.ceil((baseStuds + (corners * 2)) * 1.10);
            const platesLinearFt = l * 3; // double top plate + single bottom plate

            return {
                primaryOutput: { label: 'Total 2x4 / 2x6 Wall Studs', value: totalStuds, suffix: 'Studs' },
                secondaryMetrics: [
                    { label: 'Top & Bottom Plates Material', value: `${Math.round(platesLinearFt)} Linear Feet (3 rows)` },
                    { label: 'Base Field Studs', value: `${baseStuds} Studs` },
                    { label: 'Corner / Intersection Studs', value: `${corners * 2} Studs` }
                ]
            };
        }
    },
    // 12. Fence Calculator
    {
        id: 'fence-calculator',
        name: 'Fence Calculator',
        category: 'construction-trades',
        group: 'Measurements & Materials',
        bucket: 'Bucket C1',
        tier: 3,
        phase: 3,
        monthlySearches: '15K',
        cpc: '$2.40',
        description: "A Fence Calculator estimates fencing materials including posts, rails, and panels. It helps homeowners and contractors budget fencing projects. The calculator supports multiple fence styles.",
        inputs: [
            { id: 'fenceLengthFt', name: 'Total Fence Length (Feet)', type: 'number', defaultValue: 150, min: 5, step: 5, suffix: 'ft', tooltip: 'Linear footage.' },
            { id: 'postSpacingFt', name: 'Post Spacing (Feet)', type: 'dropdown', defaultValue: 8, options: [{ label: '8 Feet Spacing (Standard)', value: 8 }, { label: '6 Feet Spacing (Heavy Duty / Wind)', value: 6 }], tooltip: 'Distance between posts.' },
            { id: 'picketWidthIn', name: 'Picket Width (Inches)', type: 'dropdown', defaultValue: 5.5, options: [{ label: '5.5" Picket (Standard 1x6)', value: 5.5 }, { label: '3.5" Picket (Standard 1x4)', value: 3.5 }], tooltip: 'Picket width.' }
        ],
        naturalLanguageQueries: ["Calculate my fence calculator", "What is my fence calculator?", "Help me solve fence calculator"],
        edgeCases: ["Zero spacing Gate overlap calculations Uneven terrain ignored"],
        calculate: (inputs) => {
            const l = Number(inputs.fenceLengthFt) || 150;
            const postSpacing = Number(inputs.postSpacingFt) || 8;
            const picketW = Number(inputs.picketWidthIn) || 5.5;

            const sections = Math.ceil(l / postSpacing);
            const posts = sections + 1;
            const rails = sections * 3; // 3 horizontal rails (top, middle, bottom)
            const pickets = Math.ceil((l * 12) / picketW * 1.05); // 5% waste
            const concreteBags = posts * 2; // 2 bags (50lb) per post

            return {
                primaryOutput: { label: 'Total Fence Posts Required', value: posts, suffix: 'Posts' },
                secondaryMetrics: [
                    { label: 'Fence Pickets Required', value: `${pickets} Pickets` },
                    { label: 'Horizontal 2x4 Rails', value: `${rails} Rails (${postSpacing} ft each)` },
                    { label: 'Concrete Bags for Post Holes', value: `${concreteBags} Bags (50 lb)` }
                ]
            };
        }
    },
    // 13. Deck Calculator
    {
        id: 'deck-calculator',
        name: 'Deck Calculator',
        category: 'construction-trades',
        group: 'Measurements & Materials',
        bucket: 'Bucket C1',
        tier: 3,
        phase: 3,
        monthlySearches: '18K',
        cpc: '$2.88',
        description: "A Deck Calculator estimates decking materials including boards, joists, and fasteners. It helps plan outdoor deck construction. The calculator supports rectangular and custom deck layouts.",
        inputs: [
            { id: 'deckLengthFt', name: 'Deck Length along House (Feet)', type: 'number', defaultValue: 20, min: 4, step: 1, suffix: 'ft', tooltip: 'Length.' },
            { id: 'deckWidthFt', name: 'Deck Projection Width (Feet)', type: 'number', defaultValue: 12, min: 4, step: 1, suffix: 'ft', tooltip: 'Width.' },
            { id: 'joistSpacingIn', name: 'Joist Spacing (Inches)', type: 'dropdown', defaultValue: 16, options: [{ label: '16" On-Center (Wood Decking)', value: 16 }, { label: '12" On-Center (Composite / Diagonal)', value: 12 }], tooltip: 'Joist spacing.' }
        ],
        naturalLanguageQueries: ["Calculate my deck calculator", "What is my deck calculator?", "Help me solve deck calculator"],
        edgeCases: ["Zero board width Excessive board gaps Complex deck shapes"],
        calculate: (inputs) => {
            const l = Number(inputs.deckLengthFt) || 20;
            const w = Number(inputs.deckWidthFt) || 12;
            const spacing = Number(inputs.joistSpacingIn) || 16;

            const deckSqFt = l * w;
            const deckBoards = Math.ceil((w * 12) / 5.5 * 1.10); // 5.5" boards + 10% waste
            const joists = Math.ceil((l * 12) / spacing) + 1;
            const posts = Math.ceil(l / 8) + 1; // posts every 8 ft

            return {
                primaryOutput: { label: 'Deck Surface Boards (5.5" width)', value: deckBoards, suffix: `${l} ft Boards` },
                secondaryMetrics: [
                    { label: 'Floor Joists Needed', value: `${joists} Joists (${w} ft long)` },
                    { label: 'Support Posts & Footings', value: `${posts} Footings` },
                    { label: 'Total Deck Area', value: `${deckSqFt} sq ft` }
                ]
            };
        }
    },
    // 14. Drywall Calculator
    {
        id: 'drywall-calculator',
        name: 'Drywall Calculator',
        category: 'construction-trades',
        group: 'Measurements & Materials',
        bucket: 'Bucket C1',
        tier: 3,
        phase: 3,
        monthlySearches: '18K',
        cpc: '$0.45',
        description: "A Drywall Calculator estimates drywall sheets, screws, and joint compound required for walls and ceilings. It helps optimize material purchasing. The calculator supports standard drywall sizes.",
        inputs: [
            { id: 'roomLengthFt', name: 'Room Length (Feet)', type: 'number', defaultValue: 16, min: 1, step: 0.5, suffix: 'ft', tooltip: 'Length.' },
            { id: 'roomWidthFt', name: 'Room Width (Feet)', type: 'number', defaultValue: 12, min: 1, step: 0.5, suffix: 'ft', tooltip: 'Width.' },
            { id: 'wallHeightFt', name: 'Ceiling Height (Feet)', type: 'number', defaultValue: 9, min: 7, max: 20, step: 0.5, suffix: 'ft', tooltip: 'Height.' },
            { id: 'sheetSize', name: 'Drywall Sheet Size', type: 'dropdown', defaultValue: 32, options: [{ label: '4x8 Sheet (32 sq ft)', value: 32 }, { label: '4x12 Sheet (48 sq ft)', value: 48 }], tooltip: 'Sheet dimension.' }
        ],
        naturalLanguageQueries: ["Calculate my drywall calculator", "What is my drywall calculator?", "Help me solve drywall calculator"],
        edgeCases: ["Openings exceeding wall area Zero wall dimensions Partial-sheet rounding"],
        calculate: (inputs) => {
            const l = Number(inputs.roomLengthFt) || 16;
            const w = Number(inputs.roomWidthFt) || 12;
            const h = Number(inputs.wallHeightFt) || 9;
            const sheetSqFt = Number(inputs.sheetSize) || 32;

            const wallArea = 2 * (l + w) * h;
            const ceilingArea = l * w;
            const totalSqFt = (wallArea + ceilingArea) * 1.10; // 10% cut waste
            const sheets = Math.ceil(totalSqFt / sheetSqFt);

            const screwsLbs = Math.ceil(sheets * 0.35); // ~0.35 lb screws per sheet (approx 32 screws/sheet)
            const tapeRolls = Math.ceil(sheets / 8); // 1 250ft roll per 8 sheets
            const jointCompoundGal = Math.ceil(sheets * 0.45); // ~0.45 gal per sheet

            return {
                primaryOutput: { label: 'Drywall Sheets Required', value: sheets, suffix: `Sheets (${sheetSqFt === 32 ? '4x8' : '4x12'})` },
                secondaryMetrics: [
                    { label: 'Total Area with Waste Margin', value: `${Math.round(totalSqFt)} sq ft` },
                    { label: 'Joint Compound / Mud', value: `${jointCompoundGal} Gallons (5-gal buckets: ${Math.ceil(jointCompoundGal / 5)})` },
                    { label: 'Drywall Screws', value: `${screwsLbs} lbs (approx ${sheets * 32} screws)` },
                    { label: 'Drywall Joint Tape', value: `${tapeRolls} Rolls (250 ft)` }
                ]
            };
        }
    },
    // 15. Insulation Calculator
    {
        id: 'insulation-calculator',
        name: 'Insulation Calculator',
        category: 'construction-trades',
        group: 'Measurements & Materials',
        bucket: 'Bucket C1',
        tier: 3,
        phase: 3,
        monthlySearches: '7K',
        cpc: '$2.67',
        description: "An Insulation Calculator estimates insulation material quantities and R-values for buildings. It helps improve thermal efficiency and energy planning. The calculator supports batt, blown-in, and rigid insulation.",
        inputs: [
            { id: 'insulationAreaSqFt', name: 'Insulation Area (Sq Ft)', type: 'number', defaultValue: 1200, min: 50, step: 50, suffix: 'sq ft', tooltip: 'Attic or wall area.' },
            { id: 'targetRValue', name: 'Target R-Value', type: 'dropdown', defaultValue: 38, options: [{ label: 'R-13 (2x4 Exterior Walls - 3.5" Batt)', value: 13 }, { label: 'R-19 (2x6 Exterior Walls - 6.25" Batt)', value: 19 }, { label: 'R-30 (Attic Mild Climate - 10" Batt)', value: 30 }, { label: 'R-38 (Attic Standard Code - 12" Batt)', value: 38 }, { label: 'R-49 (Attic Cold Climate - 16" Blown-in)', value: 49 }], tooltip: 'Thermal resistance code.' }
        ],
        naturalLanguageQueries: ["Calculate my insulation calculator", "What is my insulation calculator?", "Help me solve insulation calculator"],
        edgeCases: ["Invalid R-values Unsupported insulation types Area measurement errors"],
        calculate: (inputs) => {
            const sqFt = Number(inputs.insulationAreaSqFt) || 1200;
            const rVal = Number(inputs.targetRValue) || 38;

            // Batt bundle coverage ~40-60 sq ft depending on thickness
            const sqFtPerBag = rVal <= 19 ? 80 : 40;
            const bagsNeeded = Math.ceil((sqFt * 1.05) / sqFtPerBag);
            const thicknessIn = rVal <= 13 ? 3.5 : (rVal <= 19 ? 6.25 : (rVal <= 30 ? 10.0 : (rVal <= 38 ? 12.0 : 16.0)));

            return {
                primaryOutput: { label: `Insulation Bags / Rolls (R-${rVal})`, value: bagsNeeded, suffix: 'Bags' },
                secondaryMetrics: [
                    { label: 'Insulation Layer Thickness', value: `~${thicknessIn} Inches` },
                    { label: 'Total Insulated Area with Waste', value: `${Math.round(sqFt * 1.05)} sq ft` },
                    { label: 'Energy Cost Reduction Potential', value: '15% - 25% on HVAC bills' }
                ]
            };
        }
    },
    // 16. Carpet Calculator
    {
        id: 'carpet-calculator',
        name: 'Carpet Calculator',
        category: 'construction-trades',
        group: 'Measurements & Materials',
        bucket: 'Bucket C1',
        tier: 3,
        phase: 3,
        monthlySearches: '8K',
        cpc: '$2.64',
        description: "A Carpet Calculator estimates carpet material required for rooms and buildings. It helps determine rolls, padding, and installation costs. The calculator includes seam and waste allowances.",
        inputs: [
            { id: 'roomLengthFt', name: 'Room Length (Feet)', type: 'number', defaultValue: 18, min: 1, step: 0.5, suffix: 'ft', tooltip: 'Length.' },
            { id: 'roomWidthFt', name: 'Room Width (Feet)', type: 'number', defaultValue: 14, min: 1, step: 0.5, suffix: 'ft', tooltip: 'Width.' },
            { id: 'pricePerSqYd', name: 'Carpet Price per Square Yard ($)', type: 'currency', defaultValue: 28, min: 5, step: 1, prefix: '$', tooltip: 'Carpet price/sq yd.' }
        ],
        naturalLanguageQueries: ["Calculate my carpet calculator", "What is my carpet calculator?", "Help me solve carpet calculator"],
        edgeCases: ["Roll-width mismatch Complex room layouts Negative dimensions"],
        calculate: (inputs) => {
            const l = Number(inputs.roomLengthFt) || 18;
            const w = Number(inputs.roomWidthFt) || 14;
            const price = Number(inputs.pricePerSqYd) || 28;

            const sqFt = l * w;
            const sqFtWithWaste = sqFt * 1.10; // 10% seam waste
            const sqYards = sqFtWithWaste / 9;
            const totalCost = sqYards * price;

            return {
                primaryOutput: { label: 'Carpet Required', value: Number(sqYards.toFixed(1)), suffix: 'Square Yards' },
                secondaryMetrics: [
                    { label: 'Area in Square Feet', value: `${Math.round(sqFtWithWaste)} sq ft` },
                    { label: 'Estimated Carpet Material Cost', value: `$${Math.round(totalCost).toLocaleString()}` },
                    { label: 'Carpet Padding Needed (sq ft)', value: `${sqFt} sq ft` }
                ]
            };
        }
    },
    // 17. Siding Calculator
    {
        id: 'siding-calculator',
        name: 'Siding Calculator',
        category: 'construction-trades',
        group: 'Measurements & Materials',
        bucket: 'Bucket C1',
        tier: 3,
        phase: 3,
        monthlySearches: '8K',
        cpc: '$4.88',
        description: "A Siding Calculator estimates siding panels required for exterior walls. It helps contractors budget cladding materials and labor. The calculator accounts for windows and doors.",
        inputs: [
            { id: 'totalExteriorSqFt', name: 'Gross Exterior Wall Area (Sq Ft)', type: 'number', defaultValue: 2200, min: 100, step: 50, suffix: 'sq ft', tooltip: 'Perimeter * height.' },
            { id: 'openingsSqFt', name: 'Windows & Doors Deduction (Sq Ft)', type: 'number', defaultValue: 300, min: 0, step: 25, suffix: 'sq ft', tooltip: 'Total window & door area.' },
            { id: 'wastePct', name: 'Waste Factor (%)', type: 'percentage', defaultValue: 10, min: 0, max: 25, step: 1, suffix: '%', tooltip: 'Cuts & overlaps.' }
        ],
        naturalLanguageQueries: ["Calculate my siding calculator", "What is my siding calculator?", "Help me solve siding calculator"],
        edgeCases: ["Openings larger than walls Zero panel coverage Multiple-story calculations"],
        calculate: (inputs) => {
            const gross = Number(inputs.totalExteriorSqFt) || 2200;
            const deductions = Number(inputs.openingsSqFt) || 300;
            const waste = (Number(inputs.wastePct) || 10) / 100;

            const netSqFt = Math.max(0, gross - deductions);
            const totalWithWaste = netSqFt * (1 + waste);
            const squares = totalWithWaste / 100; // 1 square = 100 sq ft
            const boxes = Math.ceil(squares / 2); // vinyl siding typically 2 squares per box

            return {
                primaryOutput: { label: 'Siding Squares Required', value: Number(squares.toFixed(1)), suffix: 'Squares (100 sq ft)' },
                secondaryMetrics: [
                    { label: 'Net Siding Surface Area', value: `${Math.round(netSqFt)} sq ft` },
                    { label: 'Vinyl Siding Boxes (2 Sq/box)', value: `${boxes} Boxes` },
                    { label: 'Housewrap Rolls (900 sq ft/roll)', value: `${Math.ceil(netSqFt / 900)} Rolls` }
                ]
            };
        }
    },
    // 18. Paver Calculator
    {
        id: 'paver-calculator',
        name: 'Paver Calculator',
        category: 'construction-trades',
        group: 'Measurements & Materials',
        bucket: 'Bucket C1',
        tier: 3,
        phase: 3,
        monthlySearches: '12K',
        cpc: '$0.74',
        description: "A Paver Calculator estimates pavers required for patios, driveways, and walkways. It helps determine materials and installation costs. The calculator includes spacing and waste allowances.",
        inputs: [
            { id: 'patioLengthFt', name: 'Patio Length (Feet)', type: 'number', defaultValue: 20, min: 1, step: 0.5, suffix: 'ft', tooltip: 'Length.' },
            { id: 'patioWidthFt', name: 'Patio Width (Feet)', type: 'number', defaultValue: 15, min: 1, step: 0.5, suffix: 'ft', tooltip: 'Width.' },
            { id: 'paverSizeSqIn', name: 'Paver Size (Inches)', type: 'dropdown', defaultValue: 32, options: [{ label: '4" × 8" Brick Paver (32 sq in / 0.22 sq ft)', value: 32 }, { label: '6" × 6" Square Paver (36 sq in / 0.25 sq ft)', value: 36 }, { label: '12" × 12" Large Paver (144 sq in / 1.0 sq ft)', value: 144 }], tooltip: 'Paver size.' }
        ],
        naturalLanguageQueries: ["Calculate my paver calculator", "What is my paver calculator?", "Help me solve paver calculator"],
        edgeCases: ["Zero paver dimensions Excessive joint spacing Irregular layouts"],
        calculate: (inputs) => {
            const l = Number(inputs.patioLengthFt) || 20;
            const w = Number(inputs.patioWidthFt) || 15;
            const paverSqIn = Number(inputs.paverSizeSqIn) || 32;

            const areaSqFt = l * w;
            const totalWithWaste = areaSqFt * 1.10; // 10% cuts
            const paverSqFt = paverSqIn / 144;
            const paversCount = Math.ceil(totalWithWaste / paverSqFt);

            const sandTons = (areaSqFt * (1 / 12) / 27) * 1.4; // 1" sand bed
            const baseGravelTons = (areaSqFt * (4 / 12) / 27) * 1.4; // 4" gravel base

            return {
                primaryOutput: { label: 'Total Pavers Required', value: paversCount, suffix: 'Pavers' },
                secondaryMetrics: [
                    { label: 'Patio Total Area', value: `${areaSqFt} sq ft` },
                    { label: 'Bedding Sand Required (1" depth)', value: `${sandTons.toFixed(1)} Tons` },
                    { label: 'Crushed Base Gravel (4" depth)', value: `${baseGravelTons.toFixed(1)} Tons` }
                ]
            };
        }
    },
    // 19. Brick Calculator
    {
        id: 'brick-calculator',
        name: 'Brick Calculator',
        category: 'construction-trades',
        group: 'Measurements & Materials',
        bucket: 'Bucket C1',
        tier: 2,
        phase: 3,
        monthlySearches: '33K',
        cpc: '$0.34',
        description: "A Brick Calculator estimates the number of bricks required for walls and masonry projects. It helps determine mortar-adjusted brick quantities. The calculator supports standard and custom brick sizes.",
        inputs: [
            { id: 'wallLengthFt', name: 'Wall Length (Feet)', type: 'number', defaultValue: 30, min: 1, step: 0.5, suffix: 'ft', tooltip: 'Length.' },
            { id: 'wallHeightFt', name: 'Wall Height (Feet)', type: 'number', defaultValue: 8, min: 1, step: 0.5, suffix: 'ft', tooltip: 'Height.' },
            { id: 'brickType', name: 'Brick Size Standard', type: 'dropdown', defaultValue: 6.85, options: [{ label: 'Standard Modular (6.85 bricks / sq ft)', value: 6.85 }, { label: 'Queen Size (5.75 bricks / sq ft)', value: 5.75 }, { label: 'King Size (4.80 bricks / sq ft)', value: 4.80 }], tooltip: 'Brick type.' }
        ],
        naturalLanguageQueries: ["Calculate my brick calculator", "What is my brick calculator?", "Help me solve brick calculator"],
        edgeCases: ["Zero brick dimensions Mortar thicker than brick Irregular wall shapes"],
        calculate: (inputs) => {
            const l = Number(inputs.wallLengthFt) || 30;
            const h = Number(inputs.wallHeightFt) || 8;
            const bricksPerSqFt = Number(inputs.brickType) || 6.85;

            const wallSqFt = l * h;
            const totalBricks = Math.ceil(wallSqFt * bricksPerSqFt * 1.10); // 10% waste/cuts
            const mortarBags = Math.ceil(totalBricks / 140); // 1 80lb bag per ~140 bricks

            return {
                primaryOutput: { label: 'Total Bricks Required', value: totalBricks, suffix: 'Bricks' },
                secondaryMetrics: [
                    { label: 'Wall Surface Area', value: `${wallSqFt} sq ft` },
                    { label: 'Mortar Bags Needed (80 lb bags)', value: `${mortarBags} Bags` },
                    { label: 'Brick Pallets (approx 500/pallet)', value: `${(totalBricks / 500).toFixed(1)} Pallets` }
                ]
            };
        }
    },
    // 20. Board Feet Calculator (FBM)
    {
        id: 'board-feet-calculator',
        name: 'Board Feet Calculator',
        category: 'construction-trades',
        group: 'Measurements & Materials',
        bucket: 'Bucket A',
        tier: 2,
        phase: 2,
        monthlySearches: '40K',
        cpc: '$0.19',
        description: "A Board Feet Calculator computes lumber volume in board feet for woodworking and construction projects. It helps estimate wood inventory and pricing. The calculator supports standard lumber measurements.",
        inputs: [
            { id: 'thicknessIn', name: 'Nominal Thickness (Inches)', type: 'number', defaultValue: 2, min: 0.25, step: 0.25, suffix: 'in', tooltip: 'Thickness.' },
            { id: 'widthIn', name: 'Nominal Width (Inches)', type: 'number', defaultValue: 6, min: 0.5, step: 0.5, suffix: 'in', tooltip: 'Width.' },
            { id: 'lengthFt', name: 'Length (Feet)', type: 'number', defaultValue: 10, min: 1, step: 0.5, suffix: 'ft', tooltip: 'Length in feet.' },
            { id: 'quantity', name: 'Quantity of Boards', type: 'number', defaultValue: 20, min: 1, step: 1, tooltip: 'Number of pieces.' },
            { id: 'pricePerBf', name: 'Lumber Cost per Board Foot ($)', type: 'currency', defaultValue: 3.50, min: 0, step: 0.25, prefix: '$', tooltip: 'Cost/BF.' }
        ],
        naturalLanguageQueries: ["Calculate my board feet calculator", "What is my board feet calculator?", "Help me solve board feet calculator"],
        edgeCases: ["Zero dimensions Unit mismatches Fractional lumber sizes"],
        calculate: (inputs) => {
            const t = Number(inputs.thicknessIn) || 2;
            const w = Number(inputs.widthIn) || 6;
            const l = Number(inputs.lengthFt) || 10;
            const qty = Number(inputs.quantity) || 20;
            const price = Number(inputs.pricePerBf) || 3.50;

            // 1 Board Foot = (T in * W in * L ft) / 12
            const bfPerPiece = (t * w * l) / 12;
            const totalBf = bfPerPiece * qty;
            const totalCost = totalBf * price;

            return {
                primaryOutput: { label: 'Total Board Feet (FBM)', value: Number(totalBf.toFixed(2)), suffix: 'BDFT' },
                secondaryMetrics: [
                    { label: 'Board Feet per Piece', value: `${bfPerPiece.toFixed(2)} BDFT` },
                    { label: 'Estimated Lumber Cost', value: `$${Math.round(totalCost).toLocaleString()}` },
                    { label: 'Total Linear Feet', value: `${l * qty} Linear Feet` }
                ]
            };
        }
    },
    // 21. BTU Calculator
    {
        id: 'btu-calculator',
        name: 'BTU Calculator',
        category: 'construction-trades',
        group: 'Home Systems & Outdoor',
        bucket: 'Bucket C1',
        tier: 2,
        phase: 2,
        monthlySearches: '33K',
        cpc: '$2.18',
        description: "A BTU Calculator estimates the heating or cooling capacity required for a room or building. It helps homeowners, HVAC technicians, and contractors size air conditioners, heaters, and HVAC systems appropriately. The calculator considers room dimensions, insulation quality, occupancy, climate, and heat-generating appliances.",
        inputs: [
            { id: 'roomAreaSqFt', name: 'Room / House Area (Sq Ft)', type: 'number', defaultValue: 500, min: 50, step: 25, suffix: 'sq ft', tooltip: 'Area to cool/heat.' },
            { id: 'ceilingHeightFt', name: 'Ceiling Height (Feet)', type: 'number', defaultValue: 8, min: 7, max: 20, step: 1, suffix: 'ft', tooltip: 'Ceiling height.' },
            { id: 'climateZone', name: 'Climate Zone', type: 'dropdown', defaultValue: 35, options: [{ label: 'Cool / Mild Climate (30 BTU/sq ft)', value: 30 }, { label: 'Moderate Climate (35 BTU/sq ft)', value: 35 }, { label: 'Hot / Humid Southern Climate (40 BTU/sq ft)', value: 40 }, { label: 'Extreme Desert Heat (45 BTU/sq ft)', value: 45 }], tooltip: 'Climate severity.' },
            { id: 'sunExposure', name: 'Sun Exposure', type: 'dropdown', defaultValue: 1.0, options: [{ label: 'Heavily Shaded (-10%)', value: 0.9 }, { label: 'Average Sun Exposure', value: 1.0 }, { label: 'Very Sunny / South Facing (+10%)', value: 1.1 }], tooltip: 'Sunlight effect.' },
            { id: 'occupants', name: 'Average Room Occupants', type: 'number', defaultValue: 2, min: 1, max: 20, step: 1, tooltip: 'People heat generation.' }
        ],
        naturalLanguageQueries: ["Calculate my btu calculator", "What is my btu calculator?", "Help me solve btu calculator"],
        edgeCases: ["Extremely high ceilings Poor insulation exaggeration Mixed unit systems Unrealistically small rooms"],
        calculate: (inputs) => {
            const sqFt = Number(inputs.roomAreaSqFt) || 500;
            const height = Number(inputs.ceilingHeightFt) || 8;
            const baseBTU = Number(inputs.climateZone) || 35;
            const sun = Number(inputs.sunExposure) || 1.0;
            const people = Number(inputs.occupants) || 2;

            const heightFactor = height / 8;
            const peopleBTU = Math.max(0, people - 2) * 600; // 600 BTU per person over 2
            const totalBTU = Math.round((sqFt * baseBTU * heightFactor * sun) + peopleBTU);
            const tons = (totalBTU / 12000).toFixed(2);
            const kw = (totalBTU * 0.000293071).toFixed(2);

            return {
                primaryOutput: { label: 'Required HVAC Capacity', value: totalBTU.toLocaleString(), suffix: 'BTU / hr' },
                secondaryMetrics: [
                    { label: 'Air Conditioner Tonnage', value: `${tons} Tons (${(Number(tons) * 12000).toLocaleString()} BTU)` },
                    { label: 'Equivalent Electric Heating Power', value: `${kw} kW` },
                    { label: 'Recommended Mini-Split / AC Size', value: totalBTU <= 6000 ? '6,000 BTU' : totalBTU <= 9000 ? '9,000 BTU' : totalBTU <= 12000 ? '12,000 BTU (1 Ton)' : totalBTU <= 18000 ? '18,000 BTU (1.5 Ton)' : totalBTU <= 24000 ? '24,000 BTU (2 Ton)' : `${Math.ceil(totalBTU / 6000) * 6000} BTU` }
                ]
            };
        }
    },
    // 22. Electricity Calculator
    {
        id: 'electricity-calculator',
        name: 'Electricity Calculator',
        category: 'construction-trades',
        group: 'Home Systems & Outdoor',
        bucket: 'Bucket C1',
        tier: 3,
        phase: 3,
        monthlySearches: '10K',
        cpc: '$2.77',
        description: "An Electricity Calculator estimates electrical energy usage and operating costs for appliances and devices. It helps homeowners and businesses track electricity consumption. The calculator supports multiple billing periods and energy-rate structures.",
        inputs: [
            { id: 'applianceWatts', name: 'Appliance Power (Watts)', type: 'number', defaultValue: 1500, min: 1, step: 50, suffix: 'W', tooltip: 'Wattage rating.' },
            { id: 'hoursPerDay', name: 'Usage Hours per Day', type: 'number', defaultValue: 4, min: 0.1, max: 24, step: 0.5, suffix: 'hrs', tooltip: 'Hours active.' },
            { id: 'costPerKWh', name: 'Electricity Rate ($/kWh)', type: 'number', defaultValue: 0.16, min: 0.01, step: 0.01, prefix: '$', tooltip: 'Utility rate.' }
        ],
        naturalLanguageQueries: ["Calculate my electricity calculator", "What is my electricity calculator?", "Help me solve electricity calculator"],
        edgeCases: ["Negative rates Zero usage hours Invalid wattage values"],
        calculate: (inputs) => {
            const watts = Number(inputs.applianceWatts) || 1500;
            const hours = Number(inputs.hoursPerDay) || 4;
            const rate = Number(inputs.costPerKWh) || 0.16;

            const dailyKWh = (watts * hours) / 1000;
            const monthlyKWh = dailyKWh * 30.42;
            const annualKWh = dailyKWh * 365;

            const dailyCost = dailyKWh * rate;
            const monthlyCost = monthlyKWh * rate;
            const annualCost = annualKWh * rate;
            const co2LbsAnnual = annualKWh * 0.855; // 0.855 lbs CO2 per kWh US grid average

            return {
                primaryOutput: { label: 'Estimated Monthly Cost', value: `$${monthlyCost.toFixed(2)}`, suffix: '/ month' },
                secondaryMetrics: [
                    { label: 'Daily Energy Cost', value: `$${dailyCost.toFixed(2)} / day (${dailyKWh.toFixed(2)} kWh)` },
                    { label: 'Annual Electricity Cost', value: `$${annualCost.toFixed(2)} / year` },
                    { label: 'Annual Energy Consumption', value: `${Math.round(annualKWh).toLocaleString()} kWh` },
                    { label: 'Annual Carbon Footprint', value: `${Math.round(co2LbsAnnual).toLocaleString()} lbs CO2` }
                ]
            };
        }
    },
    // 23. Voltage Drop Calculator
    {
        id: 'voltage-drop-calculator',
        name: 'Voltage Drop Calculator',
        category: 'construction-trades',
        group: 'Home Systems & Outdoor',
        bucket: 'Bucket C1',
        tier: 2,
        phase: 3,
        monthlySearches: '50K',
        cpc: '$0.54',
        description: "A Voltage Drop Calculator estimates voltage loss across electrical conductors due to resistance. It helps electricians design efficient circuits and comply with electrical standards. The calculator supports copper and aluminum conductors.",
        inputs: [
            { id: 'supplyVoltage', name: 'Supply Voltage (Volts)', type: 'dropdown', defaultValue: 120, options: [{ label: '12V DC', value: 12 }, { label: '24V DC', value: 24 }, { label: '120V AC (Single Phase)', value: 120 }, { label: '240V AC (Single Phase)', value: 240 }, { label: '208V AC (3-Phase)', value: 208 }, { label: '480V AC (3-Phase)', value: 480 }], tooltip: 'Circuit voltage.' },
            { id: 'loadCurrentAmps', name: 'Load Current (Amps)', type: 'number', defaultValue: 15, min: 0.5, step: 1, suffix: 'A', tooltip: 'Circuit load.' },
            { id: 'wireLengthFt', name: 'One-Way Wire Distance (Feet)', type: 'number', defaultValue: 100, min: 5, step: 10, suffix: 'ft', tooltip: 'One-way distance.' },
            { id: 'wireGauge', name: 'Copper Wire Gauge (AWG)', type: 'dropdown', defaultValue: 1.93, options: [{ label: '14 AWG (15A Max - 3.07 Ω/kft)', value: 3.07 }, { label: '12 AWG (20A Max - 1.93 Ω/kft)', value: 1.93 }, { label: '10 AWG (30A Max - 1.21 Ω/kft)', value: 1.21 }, { label: '8 AWG (50A Max - 0.764 Ω/kft)', value: 0.764 }, { label: '6 AWG (65A Max - 0.491 Ω/kft)', value: 0.491 }, { label: '4 AWG (85A Max - 0.308 Ω/kft)', value: 0.308 }, { label: '2 AWG (115A Max - 0.194 Ω/kft)', value: 0.194 }, { label: '1/0 AWG (150A Max - 0.122 Ω/kft)', value: 0.122 }], tooltip: 'Conductor size.' }
        ],
        naturalLanguageQueries: ["Calculate my voltage drop calculator", "What is my voltage drop calculator?", "Help me solve voltage drop calculator"],
        edgeCases: ["Zero-length wires Invalid AWG values Excessive current causing unrealistic losses"],
        calculate: (inputs) => {
            const v = Number(inputs.supplyVoltage) || 120;
            const amps = Number(inputs.loadCurrentAmps) || 15;
            const length = Number(inputs.wireLengthFt) || 100;
            const resPerKft = Number(inputs.wireGauge) || 1.93;

            const is3Phase = (v === 208 || v === 480);
            const multiplier = is3Phase ? Math.sqrt(3) : 2;
            const totalResistance = (resPerKft * length * multiplier) / 1000;
            const voltageDrop = amps * totalResistance;
            const dropPercent = (voltageDrop / v) * 100;
            const endVoltage = Math.max(0, v - voltageDrop);
            const isCompliant = dropPercent <= 3.0;

            return {
                primaryOutput: { label: 'Voltage Drop', value: `${voltageDrop.toFixed(2)} V (${dropPercent.toFixed(2)}%)`, suffix: dropPercent <= 3 ? 'Compliant' : 'Exceeds 3%' },
                secondaryMetrics: [
                    { label: 'Voltage at Destination Load', value: `${endVoltage.toFixed(1)} V` },
                    { label: 'NEC Recommended Limit', value: '3.0% Maximum Branch Circuit Drop' },
                    { label: 'Total Conductor Resistance', value: `${totalResistance.toFixed(3)} Ohms` },
                    { label: 'Circuit Status', value: isCompliant ? 'PASS: Voltage drop is within 3% NEC limit' : 'WARNING: Upsize wire gauge to reduce voltage drop below 3%' }
                ]
            };
        }
    },
    // 24. Resistor Calculator
    {
        id: 'resistor-calculator',
        name: 'Resistor Calculator',
        category: 'construction-trades',
        group: 'Home Systems & Outdoor',
        bucket: 'Bucket B',
        tier: 2,
        phase: 3,
        monthlySearches: '33K',
        cpc: '$0.15',
        description: "A Resistor Calculator computes resistance values and resistor color codes used in electronics. It helps engineers and hobbyists identify resistor specifications. The calculator supports series and parallel combinations.",
        inputs: [
            { id: 'band1', name: '1st Band (Digit 1)', type: 'dropdown', defaultValue: 4, options: [{ label: 'Black (0)', value: 0 }, { label: 'Brown (1)', value: 1 }, { label: 'Red (2)', value: 2 }, { label: 'Orange (3)', value: 3 }, { label: 'Yellow (4)', value: 4 }, { label: 'Green (5)', value: 5 }, { label: 'Blue (6)', value: 6 }, { label: 'Violet (7)', value: 7 }, { label: 'Gray (8)', value: 8 }, { label: 'White (9)', value: 9 }], tooltip: 'First digit.' },
            { id: 'band2', name: '2nd Band (Digit 2)', type: 'dropdown', defaultValue: 7, options: [{ label: 'Black (0)', value: 0 }, { label: 'Brown (1)', value: 1 }, { label: 'Red (2)', value: 2 }, { label: 'Orange (3)', value: 3 }, { label: 'Yellow (4)', value: 4 }, { label: 'Green (5)', value: 5 }, { label: 'Blue (6)', value: 6 }, { label: 'Violet (7)', value: 7 }, { label: 'Gray (8)', value: 8 }, { label: 'White (9)', value: 9 }], tooltip: 'Second digit.' },
            { id: 'multiplier', name: '3rd Band (Multiplier)', type: 'dropdown', defaultValue: 100, options: [{ label: 'Silver (x0.01)', value: 0.01 }, { label: 'Gold (x0.1)', value: 0.1 }, { label: 'Black (x1)', value: 1 }, { label: 'Brown (x10)', value: 10 }, { label: 'Red (x100)', value: 100 }, { label: 'Orange (x1k)', value: 1000 }, { label: 'Yellow (x10k)', value: 10000 }, { label: 'Green (x100k)', value: 100000 }, { label: 'Blue (x1M)', value: 1000000 }], tooltip: 'Multiplier.' },
            { id: 'tolerance', name: '4th Band (Tolerance)', type: 'dropdown', defaultValue: 5, options: [{ label: 'Brown (±1%)', value: 1 }, { label: 'Red (±2%)', value: 2 }, { label: 'Gold (±5%)', value: 5 }, { label: 'Silver (±10%)', value: 10 }, { label: 'None (±20%)', value: 20 }], tooltip: 'Tolerance rating.' }
        ],
        naturalLanguageQueries: ["Calculate my resistor calculator", "What is my resistor calculator?", "Help me solve resistor calculator"],
        edgeCases: ["Zero-ohm parallel branches Invalid color combinations Extremely high resistance values"],
        calculate: (inputs) => {
            const b1 = Number(inputs.band1) ?? 4;
            const b2 = Number(inputs.band2) ?? 7;
            const mult = Number(inputs.multiplier) || 100;
            const tol = Number(inputs.tolerance) || 5;

            const rawOhms = (b1 * 10 + b2) * mult;
            const minOhms = rawOhms * (1 - tol / 100);
            const maxOhms = rawOhms * (1 + tol / 100);

            let formattedR = '';
            if (rawOhms >= 1000000) formattedR = `${(rawOhms / 1000000).toFixed(2)} MΩ`;
            else if (rawOhms >= 1000) formattedR = `${(rawOhms / 1000).toFixed(2)} kΩ`;
            else formattedR = `${rawOhms.toFixed(1)} Ω`;

            return {
                primaryOutput: { label: 'Nominal Resistance', value: formattedR, suffix: `±${tol}%` },
                secondaryMetrics: [
                    { label: 'Exact Resistance in Ohms', value: `${rawOhms.toLocaleString()} Ω` },
                    { label: 'Minimum Resistance Range', value: `${minOhms.toLocaleString()} Ω` },
                    { label: 'Maximum Resistance Range', value: `${maxOhms.toLocaleString()} Ω` },
                    { label: 'Tolerance Rating', value: `±${tol}%` }
                ]
            };
        }
    },
    // 25. Ohms Law Calculator
    {
        id: 'ohms-law-calculator',
        name: 'Ohms Law Calculator',
        category: 'construction-trades',
        group: 'Home Systems & Outdoor',
        bucket: 'Bucket B',
        tier: 2,
        phase: 3,
        monthlySearches: '22K',
        cpc: '$0.23',
        description: "An Ohm\u2019s Law Calculator solves relationships among voltage, current, resistance, and power in electrical circuits. It helps analyze and design electrical systems. The calculator can solve for any unknown variable.",
        inputs: [
            { id: 'calcMode', name: 'Select Known Values', type: 'dropdown', defaultValue: 'VI', options: [{ label: 'Voltage (V) & Current (I)', value: 'VI' }, { label: 'Voltage (V) & Resistance (R)', value: 'VR' }, { label: 'Current (I) & Resistance (R)', value: 'IR' }, { label: 'Power (P) & Voltage (V)', value: 'PV' }, { label: 'Power (P) & Current (I)', value: 'PI' }], tooltip: 'Select pair.' },
            { id: 'val1', name: 'First Value (V, I, or P)', type: 'number', defaultValue: 120, min: 0.001, step: 0.1, tooltip: 'First parameter.' },
            { id: 'val2', name: 'Second Value (I, R, or V)', type: 'number', defaultValue: 10, min: 0.001, step: 0.1, tooltip: 'Second parameter.' }
        ],
        naturalLanguageQueries: ["Calculate my ohms law calculator", "What is my ohms law calculator?", "Help me solve ohms law calculator"],
        edgeCases: ["Division by zero Negative resistance Missing sufficient inputs"],
        calculate: (inputs) => {
            const mode = String(inputs.calcMode || 'VI');
            const a = Number(inputs.val1) || 120;
            const b = Number(inputs.val2) || 10;

            let V = 0, I = 0, R = 0, P = 0;

            if (mode === 'VI') {
                V = a; I = b;
                R = V / I;
                P = V * I;
            } else if (mode === 'VR') {
                V = a; R = b;
                I = V / R;
                P = (V * V) / R;
            } else if (mode === 'IR') {
                I = a; R = b;
                V = I * R;
                P = I * I * R;
            } else if (mode === 'PV') {
                P = a; V = b;
                I = P / V;
                R = (V * V) / P;
            } else if (mode === 'PI') {
                P = a; I = b;
                V = P / I;
                R = P / (I * I);
            }

            return {
                primaryOutput: { label: 'Power (P) / Resistance (R)', value: `${P.toFixed(1)} W / ${R.toFixed(2)} Ω`, suffix: 'Calculated' },
                secondaryMetrics: [
                    { label: 'Voltage (V)', value: `${V.toFixed(2)} Volts (V)` },
                    { label: 'Current (I)', value: `${I.toFixed(3)} Amperes (A)` },
                    { label: 'Resistance (R)', value: `${R.toFixed(3)} Ohms (Ω)` },
                    { label: 'Power (P)', value: `${P.toFixed(2)} Watts (W) / ${(P / 1000).toFixed(3)} kW` }
                ]
            };
        }
    },
    // 26. Solar Panel Calculator
    {
        id: 'solar-panel-calculator',
        name: 'Solar Panel Calculator',
        category: 'construction-trades',
        group: 'Home Systems & Outdoor',
        bucket: 'Bucket C1',
        tier: 2,
        phase: 2,
        monthlySearches: '22K',
        cpc: '$4.55',
        description: "A Solar Panel Calculator estimates solar energy system size, panel count, and energy production. It helps homeowners and businesses evaluate solar installations. The calculator considers energy consumption, sunlight hours, and panel efficiency.",
        inputs: [
            { id: 'monthlyKWh', name: 'Monthly Electric Bill (kWh)', type: 'number', defaultValue: 900, min: 100, step: 50, suffix: 'kWh', tooltip: 'Monthly energy usage.' },
            { id: 'sunHours', name: 'Average Daily Sun Hours', type: 'dropdown', defaultValue: 4.5, options: [{ label: '3.5 Hours (Northern US / Cloudy)', value: 3.5 }, { label: '4.5 Hours (Average US Sun)', value: 4.5 }, { label: '5.5 Hours (Sunny Southwest / CA / FL)', value: 5.5 }, { label: '6.5 Hours (Desert Southwest / AZ / NV)', value: 6.5 }], tooltip: 'Solar irradiance.' },
            { id: 'panelWatts', name: 'Solar Panel Wattage Rating', type: 'dropdown', defaultValue: 400, options: [{ label: '350 Watts (Standard)', value: 350 }, { label: '400 Watts (High Efficiency)', value: 400 }, { label: '450 Watts (Premium Commercial/Res)', value: 450 }], tooltip: 'Panel wattage.' },
            { id: 'offsetTarget', name: 'Electricity Offset Target (%)', type: 'number', defaultValue: 100, min: 20, max: 150, step: 10, suffix: '%', tooltip: 'Target coverage.' }
        ],
        naturalLanguageQueries: ["Calculate my solar panel calculator", "What is my solar panel calculator?", "Help me solve solar panel calculator"],
        edgeCases: ["Zero sunlight hours Unrealistically low efficiencies Insufficient roof space"],
        calculate: (inputs) => {
            const monthlyUsage = Number(inputs.monthlyKWh) || 900;
            const sunHours = Number(inputs.sunHours) || 4.5;
            const panelW = Number(inputs.panelWatts) || 400;
            const offset = (Number(inputs.offsetTarget) || 100) / 100;

            const targetMonthly = monthlyUsage * offset;
            const dailyKWh = targetMonthly / 30.42;
            const derating = 0.80; // 80% system performance ratio accounting for inverter, temp, wiring losses

            const requiredKW = dailyKWh / (sunHours * derating);
            const panelsNeeded = Math.ceil((requiredKW * 1000) / panelW);
            const actualSystemKW = (panelsNeeded * panelW) / 1000;
            const roofSqFt = panelsNeeded * 18.5; // ~18.5 sq ft per residential 400W panel
            const annualKWh = actualSystemKW * sunHours * 365 * derating;

            return {
                primaryOutput: { label: 'Solar Panels Required', value: panelsNeeded, suffix: `${actualSystemKW.toFixed(1)} kW System` },
                secondaryMetrics: [
                    { label: 'Estimated Roof Space Needed', value: `${Math.round(roofSqFt)} sq ft` },
                    { label: 'Estimated Annual Energy Output', value: `${Math.round(annualKWh).toLocaleString()} kWh / year` },
                    { label: 'Daily Solar Production', value: `${(annualKWh / 365).toFixed(1)} kWh / day` },
                    { label: 'Estimated Electric Bill Offset', value: `${Math.round((annualKWh / (monthlyUsage * 12)) * 100)}%` }
                ]
            };
        }
    },
    // 27. Generator Size Calculator
    {
        id: 'generator-size-calculator',
        name: 'Generator Size Calculator',
        category: 'construction-trades',
        group: 'Home Systems & Outdoor',
        bucket: 'Bucket C1',
        tier: 4,
        phase: 4,
        monthlySearches: '2K',
        cpc: '$1.48',
        description: "A Generator Size Calculator estimates required generator capacity for homes, businesses, or equipment loads. It helps ensure sufficient backup power during outages. The calculator supports startup and running watt calculations.",
        inputs: [
            { id: 'refrigerator', name: 'Refrigerator / Freezer', type: 'dropdown', defaultValue: 1, options: [{ label: 'None', value: 0 }, { label: '1 Standard Refrigerator (700W / 2200W Surge)', value: 1 }, { label: '2 Units (Fridge + Deep Freezer) (1400W / 4400W Surge)', value: 2 }], tooltip: 'Refrigeration.' },
            { id: 'sumpWellPump', name: 'Sump Pump or Well Pump', type: 'dropdown', defaultValue: 1, options: [{ label: 'None', value: 0 }, { label: '1/2 HP Sump Pump (1000W / 2100W Surge)', value: 1 }, { label: '1 HP Well Pump (2000W / 4000W Surge)', value: 2 }], tooltip: 'Water pumps.' },
            { id: 'acHeating', name: 'Air Conditioning / Heating', type: 'dropdown', defaultValue: 1, options: [{ label: 'None / Space Heaters Only', value: 0 }, { label: '1 Portable/Window AC (1200W / 3600W Surge)', value: 1 }, { label: 'Central AC (3 Ton) (3500W / 9000W Surge)', value: 2 }], tooltip: 'Cooling / Heating load.' },
            { id: 'lightingElectronicsWatts', name: 'Lights, TV, Router & Essentials (Watts)', type: 'number', defaultValue: 800, min: 100, step: 100, suffix: 'W', tooltip: 'Continuous electronics.' }
        ],
        naturalLanguageQueries: ["Calculate my generator size calculator", "What is my generator size calculator?", "Help me solve generator size calculator"],
        edgeCases: ["Simultaneous motor surges Negative wattages Overloaded generator estimates"],
        calculate: (inputs) => {
            const fridge = Number(inputs.refrigerator) || 1;
            const pump = Number(inputs.sumpWellPump) || 1;
            const ac = Number(inputs.acHeating) || 1;
            const essentials = Number(inputs.lightingElectronicsWatts) || 800;

            const fridgeRun = fridge * 700;
            const fridgeSurge = fridge * 2200;

            const pumpRun = pump === 1 ? 1000 : pump === 2 ? 2000 : 0;
            const pumpSurge = pump === 1 ? 2100 : pump === 2 ? 4000 : 0;

            const acRun = ac === 1 ? 1200 : ac === 2 ? 3500 : 0;
            const acSurge = ac === 1 ? 3600 : ac === 2 ? 9000 : 0;

            const totalRunningWatts = fridgeRun + pumpRun + acRun + essentials;
            // Surge = total running + largest single motor starting extra
            const motorExtras = [fridgeSurge - fridgeRun, pumpSurge - pumpRun, acSurge - acRun];
            const maxMotorSurgeExtra = Math.max(...motorExtras, 0);
            const totalSurgeWatts = totalRunningWatts + maxMotorSurgeExtra;

            const recRunningKW = (totalRunningWatts * 1.20 / 1000).toFixed(1);
            const recSurgeKW = (totalSurgeWatts * 1.20 / 1000).toFixed(1);

            return {
                primaryOutput: { label: 'Recommended Generator Size', value: `${recSurgeKW} kW Surge / ${recRunningKW} kW Running`, suffix: 'Minimum' },
                secondaryMetrics: [
                    { label: 'Total Running Load', value: `${totalRunningWatts.toLocaleString()} Watts` },
                    { label: 'Peak Starting / Surge Load', value: `${totalSurgeWatts.toLocaleString()} Watts` },
                    { label: 'Recommended Generator Type', value: totalSurgeWatts <= 4500 ? 'Portable Inverter Generator (3.5kW - 5kW)' : totalSurgeWatts <= 9500 ? 'Heavy-Duty Portable Generator (7.5kW - 10kW)' : 'Whole-Home Standby Generator (14kW - 22kW)' },
                    { label: 'Safety Margin Buffer', value: '20% Capacity Overhead Included' }
                ]
            };
        }
    },
    // 28. Water Heater Size Calculator
    {
        id: 'water-heater-size-calculator',
        name: 'Water Heater Size Calculator',
        category: 'construction-trades',
        group: 'Home Systems & Outdoor',
        bucket: 'Bucket C1',
        tier: 4,
        phase: 4,
        monthlySearches: '1K',
        cpc: '$2.31',
        description: "A Water Heater Size Calculator estimates the required water heater capacity for residential or commercial use. It helps size tank or tankless systems appropriately. The calculator considers household size and simultaneous hot-water demand.",
        inputs: [
            { id: 'occupants', name: 'Number of Household Occupants', type: 'number', defaultValue: 3, min: 1, max: 10, step: 1, tooltip: 'Number of people.' },
            { id: 'simultaneousShowers', name: 'Peak Simultaneous Showers', type: 'number', defaultValue: 2, min: 1, max: 4, step: 1, tooltip: 'Showers running together.' },
            { id: 'heaterType', name: 'Water Heater Type', type: 'dropdown', defaultValue: 'tank', options: [{ label: 'Storage Tank Water Heater', value: 'tank' }, { label: 'Tankless On-Demand Water Heater', value: 'tankless' }], tooltip: 'Technology type.' },
            { id: 'groundWaterTemp', name: 'Inlet Groundwater Temperature', type: 'dropdown', defaultValue: 55, options: [{ label: 'Northern US / Canada (40°F - 45°F)', value: 42 }, { label: 'Central US (50°F - 55°F)', value: 55 }, { label: 'Southern US (65°F - 70°F)', value: 68 }], tooltip: 'Cold inlet temp.' }
        ],
        naturalLanguageQueries: ["Calculate my water heater size calculator", "What is my water heater size calculator?", "Help me solve water heater size calculator"],
        edgeCases: ["Unrealistically high simultaneous demand Negative temperature rise Invalid occupancy counts"],
        calculate: (inputs) => {
            const people = Number(inputs.occupants) || 3;
            const showers = Number(inputs.simultaneousShowers) || 2;
            const type = String(inputs.heaterType || 'tank');
            const inletTemp = Number(inputs.groundWaterTemp) || 55;

            const tempRise = 120 - inletTemp; // Target 120°F

            if (type === 'tank') {
                // Tank sizing: 1-2 people = 30-40 gal, 3-4 people = 40-50 gal, 5+ = 50-80 gal
                const tankGallons = people <= 2 ? 40 : people <= 4 ? 50 : people <= 6 ? 65 : 80;
                const fhrDemand = (showers * 20) + (people * 10);

                return {
                    primaryOutput: { label: 'Recommended Tank Capacity', value: `${tankGallons} Gallons`, suffix: `FHR: ${fhrDemand} Gal/hr` },
                    secondaryMetrics: [
                        { label: 'Required First Hour Rating (FHR)', value: `${fhrDemand} Gallons` },
                        { label: 'Target Output Temperature', value: '120°F (Scald-Safe Standard)' },
                        { label: 'Recommended Fuel / Efficiency', value: 'Hybrid Heat Pump Water Heater (UEF ≥ 3.5) or High-Efficiency Gas' }
                    ]
                };
            } else {
                // Tankless sizing in GPM
                const gpm = (showers * 2.0) + 1.0; // 2.0 GPM per shower + 1.0 GPM faucet/appliance
                const requiredBTUGas = Math.round(gpm * tempRise * 500 / 0.85); // 85% gas efficiency
                const requiredKWElec = (gpm * tempRise * 0.147 / 0.98).toFixed(1);

                return {
                    primaryOutput: { label: 'Recommended Tankless Flow Rate', value: `${gpm.toFixed(1)} GPM`, suffix: `@ ${tempRise}°F Rise` },
                    secondaryMetrics: [
                        { label: 'Required Gas Heat Input', value: `${requiredBTUGas.toLocaleString()} BTU / hr` },
                        { label: 'Required Electric Power', value: `${requiredKWElec} kW (${Math.ceil(Number(requiredKWElec) * 1000 / 240)} Amps @ 240V)` },
                        { label: 'Temperature Rise Needed', value: `${tempRise}°F (${inletTemp}°F to 120°F)` }
                    ]
                };
            }
        }
    },
    // 29. Air Conditioner Size Calculator
    {
        id: 'air-conditioner-size-calculator',
        name: 'Air Conditioner Size Calculator',
        category: 'construction-trades',
        group: 'Home Systems & Outdoor',
        bucket: 'Bucket C1',
        tier: 3,
        phase: 3,
        monthlySearches: '5K',
        cpc: '$1.78',
        description: "An Air Conditioner Size Calculator estimates AC capacity required for cooling spaces effectively. It helps prevent undersized or oversized HVAC installations. The calculator considers room area, insulation, climate, and occupancy.",
        inputs: [
            { id: 'conditionedSqFt', name: 'Conditioned Living Area (Sq Ft)', type: 'number', defaultValue: 2000, min: 200, step: 50, suffix: 'sq ft', tooltip: 'Square footage.' },
            { id: 'climateZone', name: 'US Climate Region', type: 'dropdown', defaultValue: 1.0, options: [{ label: 'Zone 1: Hot / Humid South (1 Ton / 450 sq ft)', value: 1.25 }, { label: 'Zone 2: Warm Central / Mid-Atlantic (1 Ton / 550 sq ft)', value: 1.0 }, { label: 'Zone 3: Cool Northern States (1 Ton / 650 sq ft)', value: 0.85 }], tooltip: 'Climate cooling load.' },
            { id: 'insulationQuality', name: 'Home Insulation Quality', type: 'dropdown', defaultValue: 1.0, options: [{ label: 'Poor / Pre-1980 Uninsulated (+15% load)', value: 1.15 }, { label: 'Average / Built 1990-2010', value: 1.0 }, { label: 'Excellent / Modern Energy Star (-10% load)', value: 0.90 }], tooltip: 'Insulation envelope.' }
        ],
        naturalLanguageQueries: ["Calculate my air conditioner size calculator", "What is my air conditioner size calculator?", "Help me solve air conditioner size calculator"],
        edgeCases: ["Extremely large spaces Poor insulation exaggeration High ceilings"],
        calculate: (inputs) => {
            const sqFt = Number(inputs.conditionedSqFt) || 2000;
            const climate = Number(inputs.climateZone) || 1.0;
            const insulation = Number(inputs.insulationQuality) || 1.0;

            const baseTonnage = (sqFt / 550) * climate * insulation;
            // Round to standard 0.5 ton AC unit increments
            const roundedTonnage = Math.round(baseTonnage * 2) / 2;
            const totalBTU = Math.round(roundedTonnage * 12000);

            return {
                primaryOutput: { label: 'Recommended Central AC Size', value: `${roundedTonnage.toFixed(1)} Tons`, suffix: `${totalBTU.toLocaleString()} BTU/hr` },
                secondaryMetrics: [
                    { label: 'Exact Calculated Tonnage', value: `${baseTonnage.toFixed(2)} Tons` },
                    { label: 'Airflow Requirement (CFM)', value: `~${Math.round(roundedTonnage * 400)} CFM (400 CFM/Ton)` },
                    { label: 'Recommended SEER2 Rating', value: '15.2 to 18+ SEER2' },
                    { label: 'Ductwork Supply Trunk Size', value: `~${Math.round(roundedTonnage * 60)} sq inches cross-section` }
                ]
            };
        }
    },
    // 30. Landscaping Cost Calculator
    {
        id: 'landscaping-cost-calculator',
        name: 'Landscaping Cost Calculator',
        category: 'construction-trades',
        group: 'Home Systems & Outdoor',
        bucket: 'Bucket B',
        tier: 4,
        phase: 4,
        monthlySearches: '2K',
        cpc: '$4.72',
        description: "A Landscaping Cost Calculator estimates expenses for landscaping projects including labor, materials, and maintenance. It helps homeowners and contractors budget outdoor improvements. The calculator supports multiple landscaping categories.",
        inputs: [
            { id: 'yardAreaSqFt', name: 'Yard / Project Area (Sq Ft)', type: 'number', defaultValue: 3000, min: 100, step: 100, suffix: 'sq ft', tooltip: 'Total landscaping area.' },
            { id: 'projectType', name: 'Landscaping Scope', type: 'dropdown', defaultValue: 'sod_plants', options: [{ label: 'Basic Sod Lawn Installation ($1.50/sq ft)', value: 'sod' }, { label: 'Lawn + Plant Beds & Mulch ($4.50/sq ft)', value: 'sod_plants' }, { label: 'Full Overhaul: Lawn, Shrubs, Trees, Edging ($8.00/sq ft)', value: 'full' }, { label: 'Hardscaping + Paver Patio & Landscape ($18.00/sq ft)', value: 'hardscape' }], tooltip: 'Scope of work.' },
            { id: 'laborModel', name: 'Labor Type', type: 'dropdown', defaultValue: 'pro', options: [{ label: 'Professional Contractor (Full Labor & Equipment)', value: 'pro' }, { label: 'DIY Self-Installed (Materials & Rental Only - ~40% Cost)', value: 'diy' }], tooltip: 'Labor choice.' }
        ],
        naturalLanguageQueries: ["Calculate my landscaping cost calculator", "What is my landscaping cost calculator?", "Help me solve landscaping cost calculator"],
        edgeCases: ["Negative pricing Zero project area Multiple-material overlaps"],
        calculate: (inputs) => {
            const sqFt = Number(inputs.yardAreaSqFt) || 3000;
            const scope = String(inputs.projectType || 'sod_plants');
            const labor = String(inputs.laborModel || 'pro');

            let costPerSqFt = 4.50;
            if (scope === 'sod') costPerSqFt = 1.50;
            else if (scope === 'sod_plants') costPerSqFt = 4.50;
            else if (scope === 'full') costPerSqFt = 8.00;
            else if (scope === 'hardscape') costPerSqFt = 18.00;

            if (labor === 'diy') costPerSqFt *= 0.40;

            const totalCost = sqFt * costPerSqFt;
            const materialCost = totalCost * (labor === 'diy' ? 0.85 : 0.45);
            const laborCost = totalCost - materialCost;

            return {
                primaryOutput: { label: 'Estimated Landscaping Cost', value: `$${Math.round(totalCost).toLocaleString()}`, suffix: `$${costPerSqFt.toFixed(2)} / sq ft` },
                secondaryMetrics: [
                    { label: 'Estimated Material & Plant Costs', value: `$${Math.round(materialCost).toLocaleString()}` },
                    { label: 'Estimated Labor & Installation Costs', value: `$${Math.round(laborCost).toLocaleString()}` },
                    { label: 'Typical Price Range (±20%)', value: `$${Math.round(totalCost * 0.8).toLocaleString()} - $${Math.round(totalCost * 1.2).toLocaleString()}` }
                ]
            };
        }
    },
    // 31. Foundation Calculator
    {
        id: 'foundation-calculator',
        name: 'Foundation Calculator',
        category: 'construction-trades',
        group: 'Home Systems & Outdoor',
        bucket: 'Bucket C1',
        tier: 4,
        phase: 4,
        monthlySearches: '1K',
        cpc: '$1.56',
        description: "A Foundation Calculator estimates concrete and excavation requirements for building foundations. It helps contractors plan footings and slabs accurately. The calculator supports slab, crawl-space, and footing foundations.",
        inputs: [
            { id: 'foundationType', name: 'Foundation Design', type: 'dropdown', defaultValue: 'slab', options: [{ label: 'Monolithic Slab-on-Grade', value: 'slab' }, { label: 'Stem Wall & Footing (Crawlspace)', value: 'stem' }, { label: 'Full Basement (Walls + Slab)', value: 'basement' }], tooltip: 'Foundation style.' },
            { id: 'lengthFt', name: 'Building Length (Feet)', type: 'number', defaultValue: 40, min: 10, step: 1, suffix: 'ft', tooltip: 'Length.' },
            { id: 'widthFt', name: 'Building Width (Feet)', type: 'number', defaultValue: 30, min: 10, step: 1, suffix: 'ft', tooltip: 'Width.' },
            { id: 'slabThicknessIn', name: 'Slab Thickness (Inches)', type: 'number', defaultValue: 4, min: 3, max: 12, step: 0.5, suffix: 'in', tooltip: 'Floor thickness.' }
        ],
        naturalLanguageQueries: ["Calculate my foundation calculator", "What is my foundation calculator?", "Help me solve foundation calculator"],
        edgeCases: ["Negative dimensions Extremely deep foundations Mixed unit systems"],
        calculate: (inputs) => {
            const l = Number(inputs.lengthFt) || 40;
            const w = Number(inputs.widthFt) || 30;
            const thickIn = Number(inputs.slabThicknessIn) || 4;
            const type = String(inputs.foundationType || 'slab');

            const perimeter = 2 * (l + w);
            const slabArea = l * w;
            const slabYards = (slabArea * (thickIn / 12)) / 27;

            // Footing: 16" wide x 12" deep perimeter footing
            const footingYards = (perimeter * (16 / 12) * (12 / 12)) / 27;

            let wallYards = 0;
            if (type === 'stem') {
                // 8" thick x 3 ft high stem wall
                wallYards = (perimeter * (8 / 12) * 3) / 27;
            } else if (type === 'basement') {
                // 8" thick x 8 ft high basement wall
                wallYards = (perimeter * (8 / 12) * 8) / 27;
            }

            const rawTotalYards = slabYards + footingYards + wallYards;
            const totalWithWaste = rawTotalYards * 1.10; // 10% waste

            const rebarLinearFt = Math.round((slabArea / 2) + (perimeter * 4)); // Grid + footing dowels
            const rebarSticks20Ft = Math.ceil(rebarLinearFt / 20);

            return {
                primaryOutput: { label: 'Total Ready-Mix Concrete', value: `${totalWithWaste.toFixed(1)} Cu Yds`, suffix: 'incl. 10% waste' },
                secondaryMetrics: [
                    { label: 'Slab Concrete Volume', value: `${slabYards.toFixed(1)} Cu Yds` },
                    { label: 'Footing Concrete Volume', value: `${footingYards.toFixed(1)} Cu Yds` },
                    { label: 'Foundation Wall Concrete', value: `${wallYards.toFixed(1)} Cu Yds` },
                    { label: '#4 (1/2") Rebar Required', value: `${rebarSticks20Ft} Sticks (20 ft each - ${rebarLinearFt} linear ft)` }
                ]
            };
        }
    },
    // 32. Excavation Calculator
    {
        id: 'excavation-calculator',
        name: 'Excavation Calculator',
        category: 'construction-trades',
        group: 'Home Systems & Outdoor',
        bucket: 'Bucket C1',
        tier: 5,
        phase: 5,
        monthlySearches: '720',
        cpc: '$4.90',
        description: "An Excavation Calculator estimates soil removal volume and hauling requirements for construction projects. It helps determine excavation costs and equipment needs. The calculator supports trenches, pits, and rectangular excavations.",
        inputs: [
            { id: 'excavationLengthFt', name: 'Excavation Length (Feet)', type: 'number', defaultValue: 40, min: 1, step: 1, suffix: 'ft', tooltip: 'Trench / pit length.' },
            { id: 'excavationWidthFt', name: 'Excavation Width (Feet)', type: 'number', defaultValue: 30, min: 1, step: 1, suffix: 'ft', tooltip: 'Trench / pit width.' },
            { id: 'excavationDepthFt', name: 'Excavation Depth (Feet)', type: 'number', defaultValue: 6, min: 0.5, step: 0.5, suffix: 'ft', tooltip: 'Depth below grade.' },
            { id: 'soilType', name: 'Soil Type & Swell Factor', type: 'dropdown', defaultValue: 1.25, options: [{ label: 'Sand & Gravel (10% Swell)', value: 1.10 }, { label: 'Common Earth / Topsoil (25% Swell)', value: 1.25 }, { label: 'Dense Heavy Clay (35% Swell)', value: 1.35 }, { label: 'Blasted Rock / Hardpan (50% Swell)', value: 1.50 }], tooltip: 'Soil volume expansion.' }
        ],
        naturalLanguageQueries: ["Calculate my excavation calculator", "What is my excavation calculator?", "Help me solve excavation calculator"],
        edgeCases: ["Negative depth Soil swell >1000% Unit mismatches"],
        calculate: (inputs) => {
            const l = Number(inputs.excavationLengthFt) || 40;
            const w = Number(inputs.excavationWidthFt) || 30;
            const d = Number(inputs.excavationDepthFt) || 6;
            const swell = Number(inputs.soilType) || 1.25;

            const bankCubicYards = (l * w * d) / 27; // In-situ volume (BCY)
            const looseCubicYards = bankCubicYards * swell; // Loose haul volume (LCY)

            const dumpTruckTrips10Yd = Math.ceil(looseCubicYards / 10);
            const dumpTruckTrips14Yd = Math.ceil(looseCubicYards / 14);
            const machineHours = (bankCubicYards / 25).toFixed(1); // ~25 BCY/hr standard excavator

            return {
                primaryOutput: { label: 'Loose Haul Volume', value: `${Math.round(looseCubicYards)} Cu Yds`, suffix: `(${Math.round(bankCubicYards)} Bank Yds)` },
                secondaryMetrics: [
                    { label: 'In-Ground Bank Volume (BCY)', value: `${bankCubicYards.toFixed(1)} Cu Yds` },
                    { label: 'Standard 10-Yard Dump Truck Loads', value: `${dumpTruckTrips10Yd} Truckloads` },
                    { label: 'Tri-Axle 14-Yard Dump Truck Loads', value: `${dumpTruckTrips14Yd} Truckloads` },
                    { label: 'Estimated Excavator Machine Time', value: `~${machineHours} Hours (@ 25 yd/hr)` }
                ]
            };
        }
    },
    // 33. Retaining Wall Calculator
    {
        id: 'retaining-wall-calculator',
        name: 'Retaining Wall Calculator',
        category: 'construction-trades',
        group: 'Home Systems & Outdoor',
        bucket: 'Bucket C1',
        tier: 4,
        phase: 4,
        monthlySearches: '3K',
        cpc: '$3.69',
        description: "A Retaining Wall Calculator estimates materials and structural dimensions for retaining-wall construction. It helps builders determine block counts and drainage requirements. The calculator supports segmental retaining walls.",
        inputs: [
            { id: 'wallLengthFt', name: 'Wall Length (Feet)', type: 'number', defaultValue: 30, min: 2, step: 1, suffix: 'ft', tooltip: 'Total wall run.' },
            { id: 'exposedHeightFt', name: 'Exposed Wall Height (Feet)', type: 'number', defaultValue: 3.5, min: 1, max: 10, step: 0.5, suffix: 'ft', tooltip: 'Visible height.' },
            { id: 'blockSize', name: 'Retaining Block Face Size', type: 'dropdown', defaultValue: '12x4', options: [{ label: 'Standard Block (12" Wide x 4" High - 0.33 sq ft)', value: '12x4' }, { label: 'Large Keystone / Allan Block (16" Wide x 6" High - 0.67 sq ft)', value: '16x6' }, { label: 'Jumbo Commercial Block (18" Wide x 8" High - 1.0 sq ft)', value: '18x8' }], tooltip: 'Block unit dimensions.' }
        ],
        naturalLanguageQueries: ["Calculate my retaining wall calculator", "What is my retaining wall calculator?", "Help me solve retaining wall calculator"],
        edgeCases: ["Excessive wall heights requiring engineering review Negative dimensions Non-standard block sizes"],
        calculate: (inputs) => {
            const l = Number(inputs.wallLengthFt) || 30;
            const h = Number(inputs.exposedHeightFt) || 3.5;
            const size = String(inputs.blockSize || '12x4');

            // Add 6" (0.5 ft) buried base course for stability
            const totalHeight = h + 0.5;
            const totalSqFt = l * totalHeight;

            let blockFaceSqFt = 0.333;
            let blockWidthFt = 1.0;
            if (size === '16x6') {
                blockFaceSqFt = 0.667;
                blockWidthFt = 1.333;
            } else if (size === '18x8') {
                blockFaceSqFt = 1.0;
                blockWidthFt = 1.5;
            }

            const blocks = Math.ceil((totalSqFt / blockFaceSqFt) * 1.05); // 5% cuts
            const capBlocks = Math.ceil(l / blockWidthFt);

            // Drainage gravel: 12" gravel backfill behind wall
            const gravelCuYds = (l * totalHeight * 1.0) / 27;
            const gravelTons = gravelCuYds * 1.35; // ~1.35 tons per yard crushed stone
            const baseGravelTons = ((l * 1.5 * 0.5) / 27) * 1.35; // 6" deep trench base

            return {
                primaryOutput: { label: 'Retaining Wall Blocks Needed', value: blocks, suffix: `Blocks (+ ${capBlocks} Caps)` },
                secondaryMetrics: [
                    { label: 'Total Wall Face Area (incl. buried row)', value: `${totalSqFt.toFixed(1)} sq ft` },
                    { label: 'Drainage Gravel Backfill (12" chimney)', value: `${gravelTons.toFixed(1)} Tons (${gravelCuYds.toFixed(1)} Cu Yds)` },
                    { label: 'Base Trench Leveling Gravel', value: `${baseGravelTons.toFixed(1)} Tons` },
                    { label: 'Geogrid Reinforcement Needed', value: h > 4 ? 'REQUIRED: Grid reinforcement recommended every 2 courses for walls > 4 ft' : 'Not required for gravity walls under 4 ft' }
                ]
            };
        }
    },
    // 34. Feet and Inches Calculator
    {
        id: 'feet-and-inches-calculator',
        name: 'Feet and Inches Calculator',
        category: 'construction-trades',
        group: 'Home Systems & Outdoor',
        bucket: 'Bucket C1',
        tier: 2,
        phase: 2,
        monthlySearches: '22K',
        cpc: '$1.33',
        description: "A Feet and Inches Calculator performs arithmetic and conversions using imperial length units. It helps builders, carpenters, and homeowners work with measurements. The calculator supports addition, subtraction, multiplication, division, and unit conversion.",
        inputs: [
            { id: 'feet1', name: 'Measurement 1 - Feet', type: 'number', defaultValue: 12, min: 0, step: 1, suffix: 'ft', tooltip: 'Feet.' },
            { id: 'inches1', name: 'Measurement 1 - Inches', type: 'number', defaultValue: 7, min: 0, max: 11, step: 1, suffix: 'in', tooltip: 'Inches.' },
            { id: 'fraction1', name: 'Measurement 1 - Fraction', type: 'dropdown', defaultValue: 0.375, options: [{ label: '0', value: 0 }, { label: '1/8"', value: 0.125 }, { label: '1/4"', value: 0.25 }, { label: '3/8"', value: 0.375 }, { label: '1/2"', value: 0.5 }, { label: '5/8"', value: 0.625 }, { label: '3/4"', value: 0.75 }, { label: '7/8"', value: 0.875 }], tooltip: 'Fraction.' },
            { id: 'operation', name: 'Operation', type: 'dropdown', defaultValue: 'add', options: [{ label: 'Add (+)', value: 'add' }, { label: 'Subtract (-)', value: 'sub' }, { label: 'Multiply (*)', value: 'mul' }, { label: 'Divide (/)', value: 'div' }], tooltip: 'Math operator.' },
            { id: 'feet2', name: 'Measurement 2 - Feet / Multiplier', type: 'number', defaultValue: 5, min: 0, step: 1, suffix: 'ft', tooltip: 'Second operand feet.' },
            { id: 'inches2', name: 'Measurement 2 - Inches', type: 'number', defaultValue: 9, min: 0, max: 11, step: 1, suffix: 'in', tooltip: 'Second operand inches.' },
            { id: 'fraction2', name: 'Measurement 2 - Fraction', type: 'dropdown', defaultValue: 0.5, options: [{ label: '0', value: 0 }, { label: '1/8"', value: 0.125 }, { label: '1/4"', value: 0.25 }, { label: '3/8"', value: 0.375 }, { label: '1/2"', value: 0.5 }, { label: '5/8"', value: 0.625 }, { label: '3/4"', value: 0.75 }, { label: '7/8"', value: 0.875 }], tooltip: 'Fraction.' }
        ],
        naturalLanguageQueries: ["Calculate my feet and inches calculator", "What is my feet and inches calculator?", "Help me solve feet and inches calculator"],
        edgeCases: ["Negative lengths Fractional-inch precision Mixed-unit confusion"],
        calculate: (inputs) => {
            const f1 = Number(inputs.feet1) || 0;
            const i1 = Number(inputs.inches1) || 0;
            const fr1 = Number(inputs.fraction1) || 0;
            const op = String(inputs.operation || 'add');
            const f2 = Number(inputs.feet2) || 0;
            const i2 = Number(inputs.inches2) || 0;
            const fr2 = Number(inputs.fraction2) || 0;

            const totalInches1 = (f1 * 12) + i1 + fr1;
            const totalInches2 = (f2 * 12) + i2 + fr2;

            let resultInches = 0;
            if (op === 'add') resultInches = totalInches1 + totalInches2;
            else if (op === 'sub') resultInches = Math.max(0, totalInches1 - totalInches2);
            else if (op === 'mul') resultInches = totalInches1 * totalInches2;
            else if (op === 'div') resultInches = totalInches2 !== 0 ? totalInches1 / totalInches2 : 0;

            const resFeet = Math.floor(resultInches / 12);
            const remainingInches = resultInches - (resFeet * 12);
            const wholeInches = Math.floor(remainingInches);
            const fracPart = remainingInches - wholeInches;

            // Nearest 1/16th
            const sixteenths = Math.round(fracPart * 16);
            let fracStr = '';
            if (sixteenths === 16) {
                // rolled over
            } else if (sixteenths > 0) {
                // simplify fraction
                let num = sixteenths;
                let den = 16;
                while (num % 2 === 0 && den % 2 === 0) {
                    num /= 2;
                    den /= 2;
                }
                fracStr = ` ${num}/${den}"`;
            }

            const formattedResult = `${resFeet} ft ${wholeInches}${fracStr}`;
            const meters = (resultInches * 0.0254).toFixed(3);
            const millimeters = (resultInches * 25.4).toFixed(1);

            return {
                primaryOutput: { label: 'Result (Feet & Inches)', value: formattedResult, suffix: `${resultInches.toFixed(3)}"` },
                secondaryMetrics: [
                    { label: 'Total Inches (Decimal)', value: `${resultInches.toFixed(3)} inches` },
                    { label: 'Total Feet (Decimal)', value: `${(resultInches / 12).toFixed(4)} feet` },
                    { label: 'Metric Millimeters', value: `${millimeters} mm` },
                    { label: 'Metric Meters', value: `${meters} m` }
                ]
            };
        }
    },
    // 35. Internet Speed Calculator
    {
        id: 'internet-speed-calculator',
        name: 'Internet Speed Calculator',
        category: 'construction-trades',
        group: 'Home Systems & Outdoor',
        bucket: 'Bucket B',
        tier: 4,
        phase: 3,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "An Internet Speed Calculator estimates file-transfer times and evaluates internet performance. It helps users understand connection capabilities for streaming, gaming, and downloads. The calculator supports upload and download scenarios.",
        inputs: [
            { id: 'fileSize', name: 'File / Game / Video Size', type: 'number', defaultValue: 50, min: 0.1, step: 1, tooltip: 'Size quantity.' },
            { id: 'sizeUnit', name: 'File Size Unit', type: 'dropdown', defaultValue: 'GB', options: [{ label: 'Megabytes (MB)', value: 'MB' }, { label: 'Gigabytes (GB)', value: 'GB' }, { label: 'Terabytes (TB)', value: 'TB' }], tooltip: 'Unit.' },
            { id: 'downloadSpeedMbps', name: 'Download Speed (Mbps)', type: 'number', defaultValue: 100, min: 1, step: 10, suffix: 'Mbps', tooltip: 'Your connection speed.' }
        ],
        naturalLanguageQueries: ["Calculate my internet speed calculator", "What is my internet speed calculator?", "Help me solve internet speed calculator"],
        edgeCases: ["Zero bandwidth Efficiency above 100% Unit conversion errors"],
        calculate: (inputs) => {
            const size = Number(inputs.fileSize) || 50;
            const unit = String(inputs.sizeUnit || 'GB');
            const speedMbps = Number(inputs.downloadSpeedMbps) || 100;

            let sizeMB = size;
            if (unit === 'GB') sizeMB = size * 1024;
            else if (unit === 'TB') sizeMB = size * 1024 * 1024;

            // 1 MB = 8 Megabits. Realistic transfer efficiency = 90% (TCP/IP overhead)
            const totalMegabits = sizeMB * 8;
            const effectiveMbps = speedMbps * 0.90;
            const totalSeconds = totalMegabits / effectiveMbps;

            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = Math.floor(totalSeconds % 60);

            let timeStr = '';
            if (hours > 0) timeStr = `${hours}h ${minutes}m ${seconds}s`;
            else if (minutes > 0) timeStr = `${minutes}m ${seconds}s`;
            else timeStr = `${seconds} seconds`;

            const transferRateMBps = (speedMbps / 8 * 0.90).toFixed(1);

            return {
                primaryOutput: { label: 'Estimated Download Time', value: timeStr, suffix: `@ ${speedMbps} Mbps` },
                secondaryMetrics: [
                    { label: 'Effective Transfer Speed', value: `${transferRateMBps} MB / second` },
                    { label: 'Total File Size (MB)', value: `${Math.round(sizeMB).toLocaleString()} MB` },
                    { label: 'Gigabit Fiber Speed Comparison (1000 Mbps)', value: `${Math.ceil(totalMegabits / (1000 * 0.90))} seconds` }
                ]
            };
        }
    },
    // 36. Bandwidth Calculator
    {
        id: 'bandwidth-calculator',
        name: 'Bandwidth Calculator',
        category: 'construction-trades',
        group: 'Home Systems & Outdoor',
        bucket: 'Bucket B',
        tier: 4,
        phase: 4,
        monthlySearches: '4K',
        cpc: '$1.07',
        description: "A Bandwidth Calculator estimates network bandwidth requirements for internet usage, streaming, conferencing, gaming, and enterprise systems. It helps determine adequate internet capacity. The calculator supports concurrent-user and application-specific estimates.",
        inputs: [
            { id: 'monthlyPageViews', name: 'Monthly Website Pageviews', type: 'number', defaultValue: 100000, min: 1000, step: 10000, tooltip: 'Visitors / pageviews per month.' },
            { id: 'avgPageSizeMB', name: 'Average Page & Asset Size (MB)', type: 'number', defaultValue: 2.0, min: 0.1, step: 0.5, suffix: 'MB', tooltip: 'Average page payload.' },
            { id: 'peakTrafficFactor', name: 'Peak Traffic Spurt Multiplier', type: 'dropdown', defaultValue: 2.0, options: [{ label: 'Even Traffic (1.2x)', value: 1.2 }, { label: 'Standard Web Peaks (2.0x)', value: 2.0 }, { label: 'Viral / Spiky Flash Traffic (4.0x)', value: 4.0 }], tooltip: 'Peak redundancy buffer.' }
        ],
        naturalLanguageQueries: ["Calculate my bandwidth calculator", "What is my bandwidth calculator?", "Help me solve bandwidth calculator"],
        edgeCases: ["Zero users Utilization above 100% Invalid bandwidth units"],
        calculate: (inputs) => {
            const views = Number(inputs.monthlyPageViews) || 100000;
            const pageSizeMB = Number(inputs.avgPageSizeMB) || 2.0;
            const peakFactor = Number(inputs.peakTrafficFactor) || 2.0;

            const totalMonthlyMB = views * pageSizeMB;
            const totalMonthlyGB = totalMonthlyMB / 1024;
            const totalMonthlyTB = totalMonthlyGB / 1024;

            // Continuous bandwidth in Mbps: (Total Megabits) / (30 days * 86400 seconds)
            const avgMbps = (totalMonthlyMB * 8) / (30.42 * 86400);
            const peakMbps = avgMbps * peakFactor;

            return {
                primaryOutput: { label: 'Monthly Data Transfer', value: totalMonthlyGB >= 1000 ? `${totalMonthlyTB.toFixed(2)} TB` : `${totalMonthlyGB.toFixed(1)} GB`, suffix: '/ month' },
                secondaryMetrics: [
                    { label: 'Required Peak Bandwidth Capacity', value: `${peakMbps.toFixed(2)} Mbps` },
                    { label: 'Average Sustained Data Rate', value: `${avgMbps.toFixed(2)} Mbps` },
                    { label: 'Total Megabytes Transferred', value: `${Math.round(totalMonthlyMB).toLocaleString()} MB` },
                    { label: 'Hosting / CDN Recommendation', value: totalMonthlyTB > 10 ? 'Enterprise CDN + Dedicated High-Bandwidth Cloud Hosting' : totalMonthlyTB > 1 ? 'Standard Cloud VPS / AWS CloudFront / Cloudflare' : 'Shared / Entry VPS Hosting Sufficient' }
                ]
            };
        }
    }
];

export const cat05ConstructionCalculators = constructionHomeCalculators;
export default constructionHomeCalculators;
