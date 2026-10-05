import { CalculatorDefinition } from '@/types/calculator';

export const scienceEngineeringCalculators: CalculatorDefinition[] = [
    // 1. Horsepower Calculator
    {
        id: 'horsepower-calculator',
        name: 'Horsepower Calculator',
        category: 'engineering-physics',
        group: 'Physics & Mechanics',
        bucket: 'Bucket C1',
        tier: 4,
        phase: 4,
        monthlySearches: '4K',
        cpc: '$1.83',
        description: "A Horsepower Calculator computes mechanical or electrical power output in horsepower based on force, torque, speed, or electrical parameters. It helps engineers, mechanics, and automotive professionals evaluate machine and engine performance. The calculator supports multiple horsepower definitions including mechanical, metric, and electrical horsepower.",
        inputs: [
            { id: 'calcMethod', name: 'Calculation Method', type: 'dropdown', defaultValue: 'torque_rpm', options: [{ label: 'Torque & RPM (Dyno Formula)', value: 'torque_rpm' }, { label: '1/4 Mile Elapsed Time (ET & Weight)', value: 'et_weight' }, { label: '1/4 Mile Trap Speed & Weight', value: 'trap_weight' }], tooltip: 'Calculation method.' },
            { id: 'torqueLbFt', name: 'Torque (lb-ft)', type: 'number', defaultValue: 350, min: 1, step: 5, suffix: 'lb-ft', tooltip: 'Engine torque.' },
            { id: 'rpm', name: 'Engine Speed (RPM)', type: 'number', defaultValue: 5500, min: 500, max: 20000, step: 100, suffix: 'RPM', tooltip: 'Revolutions per minute.' },
            { id: 'vehicleWeightLbs', name: 'Vehicle Weight with Driver (lbs)', type: 'number', defaultValue: 3400, min: 500, step: 50, suffix: 'lbs', tooltip: 'Total curb weight.' },
            { id: 'quarterMileET', name: '1/4 Mile Elapsed Time (seconds)', type: 'number', defaultValue: 12.2, min: 5, max: 30, step: 0.1, suffix: 'sec', tooltip: 'Drag strip ET.' },
            { id: 'trapSpeedMph', name: '1/4 Mile Trap Speed (MPH)', type: 'number', defaultValue: 114, min: 30, max: 350, step: 1, suffix: 'mph', tooltip: 'Finish line speed.' }
        ],
        naturalLanguageQueries: ["Calculate my horsepower calculator", "What is my horsepower calculator?", "Help me solve horsepower calculator"],
        edgeCases: ["Zero RPM Negative torque Unrealistic power values Unit mismatches"],
        calculate: (inputs) => {
            const method = String(inputs.calcMethod || 'torque_rpm');
            const torque = Number(inputs.torqueLbFt) || 350;
            const rpm = Number(inputs.rpm) || 5500;
            const weight = Number(inputs.vehicleWeightLbs) || 3400;
            const et = Number(inputs.quarterMileET) || 12.2;
            const trap = Number(inputs.trapSpeedMph) || 114;

            let hp = 0;
            if (method === 'torque_rpm') {
                hp = (torque * rpm) / 5252;
            } else if (method === 'et_weight') {
                // Fox / Hale formula: HP = Weight * (5.825 / ET)^3
                hp = weight * Math.pow(5.825 / et, 3);
            } else if (method === 'trap_weight') {
                // HP = Weight * (TrapSpeed / 234)^3
                hp = weight * Math.pow(trap / 234, 3);
            }

            const kw = hp * 0.7457;
            const metricHp = hp * 1.01387; // PS / CV
            const whp = hp * 0.85; // Wheel HP approx 15% loss

            return {
                primaryOutput: { label: 'Calculated Engine Horsepower', value: `${Math.round(hp)} HP`, suffix: `${Math.round(kw)} kW` },
                secondaryMetrics: [
                    { label: 'Wheel Horsepower (WHP @ 15% Drivetrain Loss)', value: `${Math.round(whp)} WHP` },
                    { label: 'Metric Horsepower (PS / CV)', value: `${Math.round(metricHp)} PS` },
                    { label: 'Kilowatt Power (kW)', value: `${kw.toFixed(1)} kW` },
                    { label: 'Torque at Current RPM', value: `${torque} lb-ft (${Math.round(torque * 1.35582)} N·m)` }
                ]
            };
        }
    },
    // 2. Engine Horsepower Calculator
    {
        id: 'engine-horsepower-calculator',
        name: 'Engine Horsepower Calculator',
        category: 'engineering-physics',
        group: 'Physics & Mechanics',
        bucket: 'Bucket C1',
        tier: 5,
        phase: 4,
        monthlySearches: '590',
        cpc: 'N/A',
        description: "An Engine Horsepower Calculator estimates engine power based on torque, displacement, airflow, or quarter-mile performance. It helps automotive enthusiasts and engineers evaluate engine capability. The calculator supports crank horsepower and wheel horsepower estimates.",
        inputs: [
            { id: 'displacementLiters', name: 'Engine Displacement (Liters)', type: 'number', defaultValue: 3.0, min: 0.5, max: 16.0, step: 0.1, suffix: 'L', tooltip: 'Engine swept volume.' },
            { id: 'maxRPM', name: 'Peak Power RPM', type: 'number', defaultValue: 6500, min: 2000, max: 15000, step: 250, suffix: 'RPM', tooltip: 'Peak horsepower RPM.' },
            { id: 'aspiration', name: 'Induction / Boost', type: 'dropdown', defaultValue: 'turbo_14', options: [{ label: 'Naturally Aspirated (Stock VE ~85%)', value: 'na_stock' }, { label: 'Naturally Aspirated (Race Cam / Ported VE ~100%)', value: 'na_race' }, { label: 'Turbo / Supercharged (8 PSI Boost)', value: 'turbo_8' }, { label: 'Turbo / Supercharged (14.7 PSI / 1 Bar Boost)', value: 'turbo_14' }, { label: 'High Boost Race (25 PSI Boost)', value: 'turbo_25' }], tooltip: 'Aspiration and boost level.' },
            { id: 'fuelType', name: 'Fuel Octane / Type', type: 'dropdown', defaultValue: '93', options: [{ label: 'Regular 87 Octane', value: '87' }, { label: 'Premium 93 Octane', value: '93' }, { label: 'E85 Ethanol (+12% HP Potential)', value: 'e85' }, { label: 'Race Gas 100+ Octane', value: 'race' }], tooltip: 'Fuel octane rating.' }
        ],
        naturalLanguageQueries: ["Calculate my engine horsepower calculator", "What is my engine horsepower calculator?", "Help me solve engine horsepower calculator"],
        edgeCases: ["Zero RPM Unrealistic quarter-mile times Negative drivetrain losses"],
        calculate: (inputs) => {
            const dispL = Number(inputs.displacementLiters) || 3.0;
            const rpm = Number(inputs.maxRPM) || 6500;
            const asp = String(inputs.aspiration || 'turbo_14');
            const fuel = String(inputs.fuelType || '93');

            const dispCID = dispL * 61.0237;

            let ve = 0.85;
            let boostPsi = 0;
            if (asp === 'na_stock') { ve = 0.85; boostPsi = 0; }
            else if (asp === 'na_race') { ve = 1.00; boostPsi = 0; }
            else if (asp === 'turbo_8') { ve = 0.90; boostPsi = 8; }
            else if (asp === 'turbo_14') { ve = 0.92; boostPsi = 14.7; }
            else if (asp === 'turbo_25') { ve = 0.95; boostPsi = 25; }

            const pressureRatio = (14.7 + boostPsi) / 14.7;
            const airFlowCFM = (dispCID * rpm * ve) / 3456 * pressureRatio;

            // Fuel multiplier
            let fuelMult = 1.0;
            if (fuel === '87') fuelMult = 0.96;
            else if (fuel === '93') fuelMult = 1.0;
            else if (fuel === 'e85') fuelMult = 1.12;
            else if (fuel === 'race') fuelMult = 1.08;

            const estimatedBHP = (airFlowCFM / 1.55) * fuelMult;
            const torqueLbFt = (estimatedBHP * 5252) / rpm;
            const whp = estimatedBHP * 0.85;

            return {
                primaryOutput: { label: 'Estimated Brake Horsepower (BHP)', value: `${Math.round(estimatedBHP)} BHP`, suffix: `@ ${rpm} RPM` },
                secondaryMetrics: [
                    { label: 'Estimated Wheel HP (WHP)', value: `${Math.round(whp)} WHP` },
                    { label: 'Estimated Peak Torque', value: `${Math.round(torqueLbFt)} lb-ft (${Math.round(torqueLbFt * 1.3558)} N·m)` },
                    { label: 'Engine Airflow Demand', value: `${Math.round(airFlowCFM)} CFM` },
                    { label: 'Specific Power Output', value: `${(estimatedBHP / dispL).toFixed(1)} HP / Liter` }
                ]
            };
        }
    },
    // 3. Speed Calculator
    {
        id: 'speed-calculator',
        name: 'Speed Calculator',
        category: 'engineering-physics',
        group: 'Physics & Mechanics',
        bucket: 'Bucket C1',
        tier: 2,
        phase: 2,
        monthlySearches: '40K',
        cpc: '$0.48',
        description: "A Speed Calculator computes speed, distance, or travel time using motion equations. It helps solve transportation, athletics, and physics problems. The calculator supports multiple unit systems.",
        inputs: [
            { id: 'distance', name: 'Distance', type: 'number', defaultValue: 100, min: 0.01, step: 1, tooltip: 'Distance traveled.' },
            { id: 'distanceUnit', name: 'Distance Unit', type: 'dropdown', defaultValue: 'miles', options: [{ label: 'Miles (mi)', value: 'miles' }, { label: 'Kilometers (km)', value: 'km' }, { label: 'Meters (m)', value: 'meters' }, { label: 'Feet (ft)', value: 'feet' }, { label: 'Nautical Miles (NM)', value: 'nm' }], tooltip: 'Unit.' },
            { id: 'hours', name: 'Time - Hours', type: 'number', defaultValue: 1, min: 0, step: 1, suffix: 'hr', tooltip: 'Hours.' },
            { id: 'minutes', name: 'Time - Minutes', type: 'number', defaultValue: 30, min: 0, max: 59, step: 1, suffix: 'min', tooltip: 'Minutes.' },
            { id: 'seconds', name: 'Time - Seconds', type: 'number', defaultValue: 0, min: 0, max: 59, step: 1, suffix: 'sec', tooltip: 'Seconds.' }
        ],
        naturalLanguageQueries: ["Calculate my speed calculator", "What is my speed calculator?", "Help me solve speed calculator"],
        edgeCases: ["Zero time Negative distance Mixed units"],
        calculate: (inputs) => {
            const dist = Number(inputs.distance) || 100;
            const unit = String(inputs.distanceUnit || 'miles');
            const h = Number(inputs.hours) || 0;
            const min = Number(inputs.minutes) || 0;
            const sec = Number(inputs.seconds) || 0;

            const totalHours = h + (min / 60) + (sec / 3600);
            if (totalHours <= 0) {
                return {
                    primaryOutput: { label: 'Average Speed', value: '0 mph', suffix: 'Invalid Time' },
                    secondaryMetrics: []
                };
            }

            let distMiles = dist;
            if (unit === 'km') distMiles = dist * 0.621371;
            else if (unit === 'meters') distMiles = dist * 0.000621371;
            else if (unit === 'feet') distMiles = dist / 5280;
            else if (unit === 'nm') distMiles = dist * 1.15078;

            const mph = distMiles / totalHours;
            const kmh = mph * 1.60934;
            const mps = kmh / 3.6;
            const knots = mph / 1.15078;
            const ftps = mph * 1.46667;

            // Pace per mile: mins per mile
            const paceMinsPerMile = 60 / mph;
            const paceM = Math.floor(paceMinsPerMile);
            const paceS = Math.round((paceMinsPerMile - paceM) * 60);

            return {
                primaryOutput: { label: 'Average Speed', value: `${mph.toFixed(2)} MPH`, suffix: `${kmh.toFixed(2)} km/h` },
                secondaryMetrics: [
                    { label: 'Kilometers per Hour (km/h)', value: `${kmh.toFixed(2)} km/h` },
                    { label: 'Meters per Second (m/s)', value: `${mps.toFixed(2)} m/s` },
                    { label: 'Knots (Nautical MPH)', value: `${knots.toFixed(2)} knots` },
                    { label: 'Pace per Mile', value: `${paceM}:${paceS < 10 ? '0' : ''}${paceS} / mile` }
                ]
            };
        }
    },
    // 4. Mass Calculator
    {
        id: 'mass-calculator',
        name: 'Mass Calculator',
        category: 'engineering-physics',
        group: 'Physics & Mechanics',
        bucket: 'Bucket C1',
        tier: 3,
        phase: 3,
        monthlySearches: '7K',
        cpc: '$11.54  ★ HIGH CPC',
        description: "A Mass Calculator computes mass from density and volume or from force and acceleration relationships. It helps solve engineering and physics problems. The calculator supports SI and imperial units.",
        inputs: [
            { id: 'volume', name: 'Volume Quantity', type: 'number', defaultValue: 1.5, min: 0.0001, step: 0.1, tooltip: 'Volume amount.' },
            { id: 'volumeUnit', name: 'Volume Unit', type: 'dropdown', defaultValue: 'm3', options: [{ label: 'Cubic Meters (m³)', value: 'm3' }, { label: 'Liters (L)', value: 'L' }, { label: 'Cubic Centimeters / mL (cm³)', value: 'cm3' }, { label: 'Cubic Feet (ft³)', value: 'ft3' }, { label: 'US Gallons (gal)', value: 'gal' }], tooltip: 'Volume measure.' },
            { id: 'material', name: 'Substance / Material', type: 'dropdown', defaultValue: 7850, options: [{ label: 'Steel / Iron (7,850 kg/m³)', value: 7850 }, { label: 'Aluminum (2,700 kg/m³)', value: 2700 }, { label: 'Gold (19,300 kg/m³)', value: 19300 }, { label: 'Pure Water (1,000 kg/m³)', value: 1000 }, { label: 'Concrete (2,400 kg/m³)', value: 2400 }, { label: 'Oak Wood (750 kg/m³)', value: 750 }, { label: 'Air @ STP (1.225 kg/m³)', value: 1.225 }], tooltip: 'Substance density.' }
        ],
        naturalLanguageQueries: ["Calculate my mass calculator", "What is my mass calculator?", "Help me solve mass calculator"],
        edgeCases: ["Zero division errors", "Invalid input formats", "Boundary conditions"],
        calculate: (inputs) => {
            const vol = Number(inputs.volume) || 1.5;
            const unit = String(inputs.volumeUnit || 'm3');
            const density = Number(inputs.material) || 7850; // kg/m3

            let volM3 = vol;
            if (unit === 'L') volM3 = vol / 1000;
            else if (unit === 'cm3') volM3 = vol / 1000000;
            else if (unit === 'ft3') volM3 = vol * 0.0283168;
            else if (unit === 'gal') volM3 = vol * 0.00378541;

            const massKg = volM3 * density;
            const massGrams = massKg * 1000;
            const massLbs = massKg * 2.20462;
            const massTons = massKg / 1000;

            return {
                primaryOutput: { label: 'Calculated Mass', value: massKg >= 1000 ? `${massTons.toFixed(3)} Metric Tons` : `${massKg.toFixed(2)} kg`, suffix: `${massLbs.toFixed(1)} lbs` },
                secondaryMetrics: [
                    { label: 'Mass in Kilograms (kg)', value: `${massKg.toLocaleString(undefined, {maximumFractionDigits: 2})} kg` },
                    { label: 'Mass in Pounds (lbs)', value: `${massLbs.toLocaleString(undefined, {maximumFractionDigits: 1})} lbs` },
                    { label: 'Mass in Grams (g)', value: `${Math.round(massGrams).toLocaleString()} g` },
                    { label: 'Substance Density', value: `${density.toLocaleString()} kg/m³` }
                ]
            };
        }
    },
    // 5. Weight Calculator
    {
        id: 'weight-calculator',
        name: 'Weight Calculator',
        category: 'engineering-physics',
        group: 'Physics & Mechanics',
        bucket: 'Bucket C1',
        tier: 2,
        phase: 2,
        monthlySearches: '90K',
        cpc: '$1.04',
        description: "A Weight Calculator computes weight from mass and gravitational acceleration. It helps solve engineering, aerospace, and physics problems. The calculator supports Earth and custom planetary gravity.",
        inputs: [
            { id: 'massKg', name: 'Object Mass (kg)', type: 'number', defaultValue: 75, min: 0.01, step: 1, suffix: 'kg', tooltip: 'Invariable mass.' },
            { id: 'celestialBody', name: 'Celestial Body / Gravity', type: 'dropdown', defaultValue: 9.807, options: [{ label: 'Earth (1.00g - 9.81 m/s²)', value: 9.80665 }, { label: 'Moon (0.166g - 1.62 m/s²)', value: 1.62 }, { label: 'Mars (0.379g - 3.72 m/s²)', value: 3.72 }, { label: 'Jupiter (2.53g - 24.79 m/s²)', value: 24.79 }, { label: 'Venus (0.904g - 8.87 m/s²)', value: 8.87 }, { label: 'Sun Surface (27.9g - 274 m/s²)', value: 274.0 }], tooltip: 'Gravitational field.' }
        ],
        naturalLanguageQueries: ["Calculate my weight calculator", "What is my weight calculator?", "Help me solve weight calculator"],
        edgeCases: ["Negative mass Zero gravity Unrealistic gravity inputs"],
        calculate: (inputs) => {
            const mass = Number(inputs.massKg) || 75;
            const g = Number(inputs.celestialBody) || 9.80665;

            const weightNewtons = mass * g;
            const weightLbf = weightNewtons * 0.224809;
            const earthWeightLbf = mass * 9.80665 * 0.224809;
            const apparentScaleKg = (weightNewtons / 9.80665);
            const gravityRatio = g / 9.80665;

            return {
                primaryOutput: { label: 'Gravitational Weight Force', value: `${weightNewtons.toFixed(1)} N`, suffix: `${weightLbf.toFixed(1)} lbf` },
                secondaryMetrics: [
                    { label: 'Apparent Scale Reading', value: `${apparentScaleKg.toFixed(1)} kg (${weightLbf.toFixed(1)} lbs)` },
                    { label: 'Earth Equivalent Weight', value: `${earthWeightLbf.toFixed(1)} lbs` },
                    { label: 'Local Gravitational Acceleration', value: `${g.toFixed(2)} m/s² (${gravityRatio.toFixed(3)}g)` },
                    { label: 'Weight Relative to Earth', value: `${(gravityRatio * 100).toFixed(1)}% of Earth Weight` }
                ]
            };
        }
    },
    // 6. Density Calculator
    {
        id: 'density-calculator',
        name: 'Density Calculator',
        category: 'engineering-physics',
        group: 'Physics & Mechanics',
        bucket: 'Bucket C1',
        tier: 3,
        phase: 3,
        monthlySearches: '12K',
        cpc: '$5.04  ★ HIGH CPC',
        description: "A Density Calculator computes density, mass, or volume relationships. It helps engineers and scientists analyze material properties. The calculator supports fluid and solid densities.",
        inputs: [
            { id: 'massValue', name: 'Mass Quantity', type: 'number', defaultValue: 500, min: 0.001, step: 1, tooltip: 'Mass.' },
            { id: 'massUnit', name: 'Mass Unit', type: 'dropdown', defaultValue: 'g', options: [{ label: 'Grams (g)', value: 'g' }, { label: 'Kilograms (kg)', value: 'kg' }, { label: 'Pounds (lbs)', value: 'lb' }, { label: 'Ounces (oz)', value: 'oz' }], tooltip: 'Mass unit.' },
            { id: 'volumeValue', name: 'Volume Quantity', type: 'number', defaultValue: 250, min: 0.001, step: 1, tooltip: 'Volume.' },
            { id: 'volumeUnit', name: 'Volume Unit', type: 'dropdown', defaultValue: 'cm3', options: [{ label: 'Cubic Centimeters / mL (cm³)', value: 'cm3' }, { label: 'Liters (L)', value: 'L' }, { label: 'Cubic Meters (m³)', value: 'm3' }, { label: 'Cubic Inches (in³)', value: 'in3' }, { label: 'Cubic Feet (ft³)', value: 'ft3' }], tooltip: 'Volume unit.' }
        ],
        naturalLanguageQueries: ["Calculate my density calculator", "What is my density calculator?", "Help me solve density calculator"],
        edgeCases: ["Zero division errors", "Invalid input formats", "Boundary conditions"],
        calculate: (inputs) => {
            const mVal = Number(inputs.massValue) || 500;
            const mUnit = String(inputs.massUnit || 'g');
            const vVal = Number(inputs.volumeValue) || 250;
            const vUnit = String(inputs.volumeUnit || 'cm3');

            let massKg = mVal;
            if (mUnit === 'g') massKg = mVal / 1000;
            else if (mUnit === 'lb') massKg = mVal * 0.453592;
            else if (mUnit === 'oz') massKg = mVal * 0.0283495;

            let volM3 = vVal;
            if (vUnit === 'cm3') volM3 = vVal / 1000000;
            else if (vUnit === 'L') volM3 = vVal / 1000;
            else if (vUnit === 'in3') volM3 = vVal * 0.0000163871;
            else if (vUnit === 'ft3') volM3 = vVal * 0.0283168;

            const densityKgM3 = massKg / volM3;
            const densityGCm3 = densityKgM3 / 1000;
            const densityLbFt3 = densityKgM3 * 0.062428;
            const specificGravity = densityKgM3 / 1000;

            return {
                primaryOutput: { label: 'Calculated Density', value: `${densityGCm3.toFixed(3)} g/cm³`, suffix: `${Math.round(densityKgM3)} kg/m³` },
                secondaryMetrics: [
                    { label: 'Density in kg/m³', value: `${Math.round(densityKgM3).toLocaleString()} kg/m³` },
                    { label: 'Density in lb/ft³', value: `${densityLbFt3.toFixed(2)} lb/ft³` },
                    { label: 'Specific Gravity (vs Water)', value: specificGravity.toFixed(3) },
                    { label: 'Water Buoyancy Behavior', value: specificGravity < 1 ? 'FLOATS on water (Density < 1.0 g/cm³)' : specificGravity > 1 ? 'SINKS in water (Density > 1.0 g/cm³)' : 'NEUTRALLY BUOYANT' }
                ]
            };
        }
    },
    // 7. Torque Calculator
    {
        id: 'torque-calculator',
        name: 'Torque Calculator',
        category: 'engineering-physics',
        group: 'Physics & Mechanics',
        bucket: 'Bucket C1',
        tier: 3,
        phase: 3,
        monthlySearches: '7K',
        cpc: '$2.14',
        description: "A Torque Calculator computes rotational force based on force and lever-arm distance. It helps solve mechanical and automotive engineering problems. The calculator supports static and rotational applications.",
        inputs: [
            { id: 'forceValue', name: 'Applied Force', type: 'number', defaultValue: 50, min: 0.1, step: 1, tooltip: 'Force magnitude.' },
            { id: 'forceUnit', name: 'Force Unit', type: 'dropdown', defaultValue: 'lbf', options: [{ label: 'Pounds-force (lbf)', value: 'lbf' }, { label: 'Newtons (N)', value: 'N' }, { label: 'Kilograms-force (kgf)', value: 'kgf' }], tooltip: 'Unit.' },
            { id: 'leverArm', name: 'Lever Arm Distance / Radius', type: 'number', defaultValue: 1.5, min: 0.01, step: 0.1, tooltip: 'Distance from pivot.' },
            { id: 'armUnit', name: 'Distance Unit', type: 'dropdown', defaultValue: 'ft', options: [{ label: 'Feet (ft)', value: 'ft' }, { label: 'Inches (in)', value: 'in' }, { label: 'Meters (m)', value: 'm' }, { label: 'Centimeters (cm)', value: 'cm' }], tooltip: 'Length unit.' },
            { id: 'angleDegrees', name: 'Angle of Force Application (°)', type: 'number', defaultValue: 90, min: 1, max: 180, step: 1, suffix: '°', tooltip: 'Angle relative to lever (90° is max).' }
        ],
        naturalLanguageQueries: ["Calculate my torque calculator", "What is my torque calculator?", "Help me solve torque calculator"],
        edgeCases: ["Zero lever arm Invalid angles Negative force direction ambiguity"],
        calculate: (inputs) => {
            const fVal = Number(inputs.forceValue) || 50;
            const fUnit = String(inputs.forceUnit || 'lbf');
            const lVal = Number(inputs.leverArm) || 1.5;
            const lUnit = String(inputs.armUnit || 'ft');
            const angle = Number(inputs.angleDegrees) || 90;

            let forceN = fVal;
            if (fUnit === 'lbf') forceN = fVal * 4.44822;
            else if (fUnit === 'kgf') forceN = fVal * 9.80665;

            let armM = lVal;
            if (lUnit === 'ft') armM = lVal * 0.3048;
            else if (lUnit === 'in') armM = lVal * 0.0254;
            else if (lUnit === 'cm') armM = lVal / 100;

            const angleRad = (angle * Math.PI) / 180;
            const torqueNm = forceN * armM * Math.sin(angleRad);
            const torqueLbFt = torqueNm * 0.737562;
            const torqueLbIn = torqueLbFt * 12;

            return {
                primaryOutput: { label: 'Calculated Torque', value: `${torqueNm.toFixed(2)} N·m`, suffix: `${torqueLbFt.toFixed(2)} lb-ft` },
                secondaryMetrics: [
                    { label: 'Torque in Foot-Pounds (lb-ft)', value: `${torqueLbFt.toFixed(2)} lb-ft` },
                    { label: 'Torque in Inch-Pounds (lb-in)', value: `${torqueLbIn.toFixed(1)} lb-in` },
                    { label: 'Effective Lever Arm Length', value: `${(armM * Math.sin(angleRad)).toFixed(3)} m` },
                    { label: 'Equivalent Power at 3000 RPM', value: `${((torqueLbFt * 3000) / 5252).toFixed(1)} HP` }
                ]
            };
        }
    },
    // 8. Pressure Calculator
    {
        id: 'pressure-calculator',
        name: 'Pressure Calculator',
        category: 'engineering-physics',
        group: 'Physics & Mechanics',
        bucket: 'Bucket C1',
        tier: 4,
        phase: 4,
        monthlySearches: '4K',
        cpc: '$0.03',
        description: "A Pressure Calculator computes pressure, force, or area relationships. It helps solve hydraulic, pneumatic, and fluid mechanics problems. The calculator supports multiple pressure units.",
        inputs: [
            { id: 'forceValue', name: 'Applied Force', type: 'number', defaultValue: 1000, min: 0.1, step: 10, tooltip: 'Total force.' },
            { id: 'forceUnit', name: 'Force Unit', type: 'dropdown', defaultValue: 'lbf', options: [{ label: 'Pounds-force (lbf)', value: 'lbf' }, { label: 'Newtons (N)', value: 'N' }, { label: 'Kilonewtons (kN)', value: 'kN' }], tooltip: 'Force unit.' },
            { id: 'areaValue', name: 'Surface Area', type: 'number', defaultValue: 25, min: 0.001, step: 1, tooltip: 'Contact area.' },
            { id: 'areaUnit', name: 'Area Unit', type: 'dropdown', defaultValue: 'sq_in', options: [{ label: 'Square Inches (sq in)', value: 'sq_in' }, { label: 'Square Feet (sq ft)', value: 'sq_ft' }, { label: 'Square Meters (m²)', value: 'sq_m' }, { label: 'Square Centimeters (cm²)', value: 'sq_cm' }], tooltip: 'Area unit.' }
        ],
        naturalLanguageQueries: ["Calculate my pressure calculator", "What is my pressure calculator?", "Help me solve pressure calculator"],
        edgeCases: ["Zero area Negative pressures Mixed units"],
        calculate: (inputs) => {
            const fVal = Number(inputs.forceValue) || 1000;
            const fUnit = String(inputs.forceUnit || 'lbf');
            const aVal = Number(inputs.areaValue) || 25;
            const aUnit = String(inputs.areaUnit || 'sq_in');

            let forceN = fVal;
            if (fUnit === 'lbf') forceN = fVal * 4.44822;
            else if (fUnit === 'kN') forceN = fVal * 1000;

            let areaM2 = aVal;
            if (aUnit === 'sq_in') areaM2 = aVal * 0.00064516;
            else if (aUnit === 'sq_ft') areaM2 = aVal * 0.092903;
            else if (aUnit === 'sq_cm') areaM2 = aVal / 10000;

            const pascals = forceN / areaM2;
            const psi = pascals * 0.000145038;
            const bar = pascals / 100000;
            const atm = pascals / 101325;
            const kPa = pascals / 1000;

            return {
                primaryOutput: { label: 'Pressure', value: `${psi.toFixed(2)} PSI`, suffix: `${kPa.toFixed(2)} kPa` },
                secondaryMetrics: [
                    { label: 'Pressure in Bar', value: `${bar.toFixed(4)} bar` },
                    { label: 'Pressure in Standard Atmospheres', value: `${atm.toFixed(4)} atm` },
                    { label: 'Pressure in Pascals (N/m²)', value: `${Math.round(pascals).toLocaleString()} Pa` },
                    { label: 'Millimeters of Mercury (mmHg)', value: `${(pascals * 0.00750062).toFixed(2)} mmHg` }
                ]
            };
        }
    },
    // 9. Thermal Expansion Calculator
    {
        id: 'thermal-expansion-calculator',
        name: 'Thermal Expansion Calculator',
        category: 'engineering-physics',
        group: 'Physics & Mechanics',
        bucket: 'Bucket C1',
        tier: 4,
        phase: 4,
        monthlySearches: '2K',
        cpc: '$30.21  ★ HIGH CPC',
        description: "A Thermal Expansion Calculator estimates dimensional changes in materials caused by temperature variation. It helps engineers account for expansion in structures and machinery. The calculator supports linear thermal expansion.",
        inputs: [
            { id: 'initialLengthM', name: 'Initial Length (Meters)', type: 'number', defaultValue: 10, min: 0.1, step: 0.5, suffix: 'm', tooltip: 'Length at initial temperature.' },
            { id: 'material', name: 'Material', type: 'dropdown', defaultValue: 0.000012, options: [{ label: 'Structural Carbon Steel (12.0 x 10⁻⁶ /°C)', value: 0.000012 }, { label: 'Aluminum (23.0 x 10⁻⁶ /°C)', value: 0.000023 }, { label: 'Copper (16.5 x 10⁻⁶ /°C)', value: 0.0000165 }, { label: 'Concrete (10.0 x 10⁻⁶ /°C)', value: 0.000010 }, { label: 'PVC Plastic (52.0 x 10⁻⁶ /°C)', value: 0.000052 }, { label: 'Glass (9.0 x 10⁻⁶ /°C)', value: 0.000009 }], tooltip: 'Linear coefficient α.' },
            { id: 'tempChangeC', name: 'Temperature Change ΔT (°C)', type: 'number', defaultValue: 40, min: -100, max: 500, step: 5, suffix: '°C', tooltip: 'Final temp minus initial temp.' }
        ],
        naturalLanguageQueries: ["Calculate my thermal expansion calculator", "What is my thermal expansion calculator?", "Help me solve thermal expansion calculator"],
        edgeCases: ["Zero division errors", "Invalid input formats", "Boundary conditions"],
        calculate: (inputs) => {
            const L0 = Number(inputs.initialLengthM) || 10;
            const alpha = Number(inputs.material) || 0.000012;
            const deltaT = Number(inputs.tempChangeC) || 40;

            const deltaLMeters = alpha * L0 * deltaT;
            const deltaLMm = deltaLMeters * 1000;
            const deltaLInches = deltaLMm / 25.4;
            const finalLengthM = L0 + deltaLMeters;
            const strainPercent = (deltaLMeters / L0) * 100;

            return {
                primaryOutput: { label: 'Linear Expansion / Contraction', value: `${deltaLMm.toFixed(2)} mm`, suffix: `${deltaLInches.toFixed(3)} inches` },
                secondaryMetrics: [
                    { label: 'New Final Length', value: `${finalLengthM.toFixed(5)} m` },
                    { label: 'Thermal Strain', value: `${strainPercent.toFixed(4)}%` },
                    { label: 'Expansion Rate per 10°C Change', value: `${(alpha * L0 * 10 * 1000).toFixed(2)} mm` },
                    { label: 'Recommended Expansion Gap Joint', value: `${Math.ceil(Math.abs(deltaLMm) * 1.5)} mm minimum clearance` }
                ]
            };
        }
    },
    // 10. Gear Ratio Calculator
    {
        id: 'gear-ratio-calculator',
        name: 'Gear Ratio Calculator',
        category: 'engineering-physics',
        group: 'Physics & Mechanics',
        bucket: 'Bucket B',
        tier: 2,
        phase: 3,
        monthlySearches: '22K',
        cpc: '$0.99',
        description: "A Gear Ratio Calculator computes speed and torque relationships between gears. It helps mechanical engineers and automotive designers analyze drivetrain performance. The calculator supports simple gear trains.",
        inputs: [
            { id: 'driveTeeth', name: 'Driving Gear Teeth (Input Pinion)', type: 'number', defaultValue: 15, min: 1, max: 500, step: 1, tooltip: 'Input teeth.' },
            { id: 'drivenTeeth', name: 'Driven Gear Teeth (Output Ring)', type: 'number', defaultValue: 45, min: 1, max: 500, step: 1, tooltip: 'Output teeth.' },
            { id: 'inputRPM', name: 'Input Speed (RPM)', type: 'number', defaultValue: 1800, min: 1, step: 50, suffix: 'RPM', tooltip: 'Motor speed.' },
            { id: 'inputTorqueNm', name: 'Input Torque (N·m)', type: 'number', defaultValue: 50, min: 0.1, step: 1, suffix: 'N·m', tooltip: 'Motor torque.' }
        ],
        naturalLanguageQueries: ["Calculate my gear ratio calculator", "What is my gear ratio calculator?", "Help me solve gear ratio calculator"],
        edgeCases: ["Zero teeth count Negative RPM Non-integer gear teeth"],
        calculate: (inputs) => {
            const drive = Number(inputs.driveTeeth) || 15;
            const driven = Number(inputs.drivenTeeth) || 45;
            const rpmIn = Number(inputs.inputRPM) || 1800;
            const torqueIn = Number(inputs.inputTorqueNm) || 50;

            const ratio = driven / drive;
            const rpmOut = rpmIn / ratio;
            const efficiency = 0.96; // 96% single stage spur gear efficiency
            const torqueOut = torqueIn * ratio * efficiency;

            return {
                primaryOutput: { label: 'Gear Ratio', value: `${ratio.toFixed(2)}:1`, suffix: ratio > 1 ? 'Speed Reduction / Torque Multiply' : 'Overdrive' },
                secondaryMetrics: [
                    { label: 'Output Speed (RPM)', value: `${rpmOut.toFixed(1)} RPM` },
                    { label: 'Output Torque (with 96% eff)', value: `${torqueOut.toFixed(1)} N·m (${(torqueOut * 0.73756).toFixed(1)} lb-ft)` },
                    { label: 'Mechanical Advantage', value: `${ratio.toFixed(2)}x Force Multiplication` },
                    { label: 'Speed Change Factor', value: `${(1 / ratio).toFixed(3)}x Input Speed` }
                ]
            };
        }
    },
    // 11. Beam Deflection Calculator
    {
        id: 'beam-deflection-calculator',
        name: 'Beam Deflection Calculator',
        category: 'engineering-physics',
        group: 'Physics & Mechanics',
        bucket: 'Bucket C1',
        tier: 4,
        phase: 4,
        monthlySearches: '3K',
        cpc: '$2.37',
        description: "A Beam Deflection Calculator estimates structural bending under applied loads. It helps civil and mechanical engineers evaluate beam performance and safety. The calculator supports common support/load configurations.",
        inputs: [
            { id: 'beamSpanFt', name: 'Beam Span Length (Feet)', type: 'number', defaultValue: 16, min: 1, max: 60, step: 1, suffix: 'ft', tooltip: 'Clear span distance.' },
            { id: 'loadPounds', name: 'Center Point Load (lbs)', type: 'number', defaultValue: 1500, min: 10, step: 50, suffix: 'lbs', tooltip: 'Applied point load at midspan.' },
            { id: 'material', name: 'Beam Material', type: 'dropdown', defaultValue: 29000000, options: [{ label: 'Structural Steel (E = 29,000,000 psi)', value: 29000000 }, { label: '6061-T6 Aluminum (E = 10,000,000 psi)', value: 10000000 }, { label: 'Douglas Fir Wood (E = 1,600,000 psi)', value: 1600000 }, { label: 'Engineered LVL Lumber (E = 2,000,000 psi)', value: 2000000 }], tooltip: 'Modulus of elasticity.' },
            { id: 'momentOfInertiaIn4', name: 'Moment of Inertia I (in⁴)', type: 'number', defaultValue: 82.8, min: 1, step: 1, suffix: 'in⁴', tooltip: 'Cross section inertia (e.g. W8x15 = 48.0, 2-2x10 wood = 82.8).' }
        ],
        naturalLanguageQueries: ["Calculate my beam deflection calculator", "What is my beam deflection calculator?", "Help me solve beam deflection calculator"],
        edgeCases: ["Zero moment of inertia Unrealistic beam stiffness Excessive loads"],
        calculate: (inputs) => {
            const L_ft = Number(inputs.beamSpanFt) || 16;
            const P = Number(inputs.loadPounds) || 1500;
            const E = Number(inputs.material) || 29000000;
            const I = Number(inputs.momentOfInertiaIn4) || 82.8;

            const L_in = L_ft * 12;
            // Simply supported center load formula: δ = (P * L^3) / (48 * E * I)
            const deflectionIn = (P * Math.pow(L_in, 3)) / (48 * E * I);
            const deflectionMm = deflectionIn * 25.4;
            const deflectionRatio = L_in / deflectionIn;

            const isL360 = deflectionRatio >= 360;
            const isL240 = deflectionRatio >= 240;

            return {
                primaryOutput: { label: 'Maximum Midspan Deflection', value: `${deflectionIn.toFixed(3)} in`, suffix: `(L / ${Math.round(deflectionRatio)})` },
                secondaryMetrics: [
                    { label: 'Deflection in Millimeters', value: `${deflectionMm.toFixed(2)} mm` },
                    { label: 'L/360 Floor Code Standard', value: isL360 ? 'PASS (Deflection < L/360)' : 'FAIL (Exceeds L/360 limit for floors)' },
                    { label: 'L/240 Roof Code Standard', value: isL240 ? 'PASS (Deflection < L/240)' : 'FAIL (Exceeds L/240 limit for roofs)' },
                    { label: 'Maximum Bending Moment', value: `${Math.round((P * L_ft) / 4)} lb-ft` }
                ]
            };
        }
    },
    // 12. Beam Load Calculator
    {
        id: 'beam-load-calculator',
        name: 'Beam Load Calculator',
        category: 'engineering-physics',
        group: 'Physics & Mechanics',
        bucket: 'Bucket C1',
        tier: 4,
        phase: 4,
        monthlySearches: '1K',
        cpc: '$1.98',
        description: "A Beam Load Calculator estimates load capacity and reactions on structural beams. It helps engineers evaluate structural support systems. The calculator supports distributed and point loads.",
        inputs: [
            { id: 'spanFt', name: 'Beam Span (Feet)', type: 'number', defaultValue: 18, min: 2, step: 1, suffix: 'ft', tooltip: 'Span length.' },
            { id: 'tributaryWidthFt', name: 'Tributary Width (Feet)', type: 'number', defaultValue: 10, min: 1, step: 0.5, suffix: 'ft', tooltip: 'Half the distance to adjacent supports on each side.' },
            { id: 'deadLoadPSF', name: 'Dead Load (PSF)', type: 'number', defaultValue: 15, min: 5, step: 5, suffix: 'psf', tooltip: 'Structure weight.' },
            { id: 'liveLoadPSF', name: 'Live Load (PSF)', type: 'number', defaultValue: 40, min: 10, step: 5, suffix: 'psf', tooltip: 'Occupancy / furniture load.' }
        ],
        naturalLanguageQueries: ["Calculate my beam load calculator", "What is my beam load calculator?", "Help me solve beam load calculator"],
        edgeCases: ["Unsupported load cases Zero-length beams Negative loads"],
        calculate: (inputs) => {
            const span = Number(inputs.spanFt) || 18;
            const trib = Number(inputs.tributaryWidthFt) || 10;
            const dl = Number(inputs.deadLoadPSF) || 15;
            const ll = Number(inputs.liveLoadPSF) || 40;

            const totalPSF = dl + ll;
            const uniformLoadPLF = totalPSF * trib; // Pounds per linear foot
            const totalLoadOnBeam = uniformLoadPLF * span;
            const endReactionEach = totalLoadOnBeam / 2; // lbs at each post/column
            const maxMomentLbFt = (uniformLoadPLF * Math.pow(span, 2)) / 8;

            return {
                primaryOutput: { label: 'End Support Reactions', value: `${Math.round(endReactionEach).toLocaleString()} lbs`, suffix: 'per support column' },
                secondaryMetrics: [
                    { label: 'Total Uniform Load on Beam', value: `${Math.round(uniformLoadPLF)} lbs / linear ft` },
                    { label: 'Total Carried Load', value: `${Math.round(totalLoadOnBeam).toLocaleString()} lbs` },
                    { label: 'Maximum Bending Moment', value: `${Math.round(maxMomentLbFt).toLocaleString()} lb-ft` },
                    { label: 'Required Wood Section Modulus (Fb=1000 psi)', value: `${((maxMomentLbFt * 12) / 1000).toFixed(1)} in³` }
                ]
            };
        }
    },
    // 13. Pipe Flow Calculator
    {
        id: 'pipe-flow-calculator',
        name: 'Pipe Flow Calculator',
        category: 'engineering-physics',
        group: 'Physics & Mechanics',
        bucket: 'Bucket C1',
        tier: 4,
        phase: 4,
        monthlySearches: '2K',
        cpc: '$1.97',
        description: "A Pipe Flow Calculator estimates fluid flow rate, velocity, and pressure losses in piping systems. It helps engineers design plumbing and industrial flow systems. The calculator supports laminar and turbulent flow.",
        inputs: [
            { id: 'pipeInsideDiameterIn', name: 'Pipe Inside Diameter (Inches)', type: 'number', defaultValue: 2.0, min: 0.25, max: 48, step: 0.25, suffix: 'in', tooltip: 'Internal bore diameter.' },
            { id: 'flowVelocityFtS', name: 'Flow Velocity (ft/sec)', type: 'number', defaultValue: 5.0, min: 0.1, max: 30, step: 0.5, suffix: 'ft/s', tooltip: 'Recommended water velocity is 4-8 ft/s.' },
            { id: 'pipeLengthFt', name: 'Pipe Run Length (Feet)', type: 'number', defaultValue: 100, min: 1, step: 10, suffix: 'ft', tooltip: 'Total pipe length.' }
        ],
        naturalLanguageQueries: ["Calculate my pipe flow calculator", "What is my pipe flow calculator?", "Help me solve pipe flow calculator"],
        edgeCases: ["Zero diameter Negative flow rates Extremely turbulent conditions"],
        calculate: (inputs) => {
            const dIn = Number(inputs.pipeInsideDiameterIn) || 2.0;
            const vFtS = Number(inputs.flowVelocityFtS) || 5.0;
            const lFt = Number(inputs.pipeLengthFt) || 100;

            const areaSqFt = Math.PI * Math.pow(dIn / 24, 2);
            const flowCFS = areaSqFt * vFtS;
            const gpm = flowCFS * 448.831;
            const litersPerMin = gpm * 3.78541;

            // Hazen-Williams friction loss for PVC (C=150)
            // h_f (ft) = 0.002083 * L * (100/C)^1.852 * (GPM^1.852 / d^4.8655)
            const frictionLossFt = 0.002083 * lFt * Math.pow(100 / 150, 1.852) * (Math.pow(gpm, 1.852) / Math.pow(dIn, 4.8655));
            const frictionLossPsi = frictionLossFt * 0.4335;

            return {
                primaryOutput: { label: 'Discharge Flow Rate', value: `${gpm.toFixed(1)} GPM`, suffix: `${litersPerMin.toFixed(0)} L/min` },
                secondaryMetrics: [
                    { label: 'Friction Pressure Loss', value: `${frictionLossPsi.toFixed(2)} PSI (${frictionLossFt.toFixed(1)} ft of head)` },
                    { label: 'Cross-Sectional Flow Area', value: `${(areaSqFt * 144).toFixed(2)} sq inches` },
                    { label: 'Daily Water Volume', value: `${Math.round(gpm * 1440).toLocaleString()} Gallons / day` },
                    { label: 'Velocity Assessment', value: vFtS > 8 ? 'HIGH: Velocity exceeds 8 ft/s (risk of water hammer & erosion)' : vFtS < 2 ? 'LOW: Velocity under 2 ft/s (risk of sedimentation)' : 'OPTIMAL: Standard domestic/commercial velocity range' }
                ]
            };
        }
    },
    // 14. Heat Transfer Calculator
    {
        id: 'heat-transfer-calculator',
        name: 'Heat Transfer Calculator',
        category: 'engineering-physics',
        group: 'Physics & Mechanics',
        bucket: 'Bucket C1',
        tier: 5,
        phase: 5,
        monthlySearches: '880',
        cpc: '$2.92',
        description: "A Heat Transfer Calculator computes thermal energy transfer through conduction, convection, or radiation. It helps solve thermodynamics and HVAC problems. The calculator supports steady-state heat flow.",
        inputs: [
            { id: 'surfaceAreaSqM', name: 'Surface Area (m²)', type: 'number', defaultValue: 20, min: 0.1, step: 1, suffix: 'm²', tooltip: 'Heat exchange area.' },
            { id: 'thicknessM', name: 'Material Thickness (Meters)', type: 'number', defaultValue: 0.15, min: 0.001, step: 0.01, suffix: 'm', tooltip: 'Wall thickness.' },
            { id: 'thermalConductivityK', name: 'Thermal Conductivity k (W/m·K)', type: 'dropdown', defaultValue: 0.15, options: [{ label: 'Wood / Timber (k = 0.15 W/m·K)', value: 0.15 }, { label: 'Fiberglass / Foam Insulation (k = 0.035 W/m·K)', value: 0.035 }, { label: 'Concrete / Brick (k = 0.80 W/m·K)', value: 0.80 }, { label: 'Window Glass (k = 0.96 W/m·K)', value: 0.96 }, { label: 'Carbon Steel (k = 50 W/m·K)', value: 50 }, { label: 'Copper (k = 385 W/m·K)', value: 385 }], tooltip: 'Conductivity k.' },
            { id: 'tempDifferenceC', name: 'Temperature Difference ΔT (°C)', type: 'number', defaultValue: 25, min: 0.1, step: 1, suffix: '°C', tooltip: 'Inside minus outside temperature.' }
        ],
        naturalLanguageQueries: ["Calculate my heat transfer calculator", "What is my heat transfer calculator?", "Help me solve heat transfer calculator"],
        edgeCases: ["Zero thickness Negative conductivity Unrealistic temperature differences"],
        calculate: (inputs) => {
            const A = Number(inputs.surfaceAreaSqM) || 20;
            const L = Number(inputs.thicknessM) || 0.15;
            const k = Number(inputs.thermalConductivityK) || 0.15;
            const deltaT = Number(inputs.tempDifferenceC) || 25;

            // Fourier Conduction: Q = (k * A * ΔT) / L (Watts)
            const heatTransferWatts = (k * A * deltaT) / L;
            const heatTransferBTU = heatTransferWatts * 3.412142;
            const heatFlux = heatTransferWatts / A;
            const rValueSI = L / k; // m²·K/W
            const rValueUS = rValueSI * 5.67826;

            return {
                primaryOutput: { label: 'Conduction Heat Transfer Rate', value: `${Math.round(heatTransferWatts).toLocaleString()} Watts`, suffix: `${Math.round(heatTransferBTU).toLocaleString()} BTU/hr` },
                secondaryMetrics: [
                    { label: 'Heat Flux (Rate per Area)', value: `${heatFlux.toFixed(2)} W/m²` },
                    { label: 'Thermal Resistance (R-Value US)', value: `R-${rValueUS.toFixed(1)}` },
                    { label: 'Thermal Resistance (SI R-Value)', value: `${rValueSI.toFixed(3)} m²·K/W` },
                    { label: 'Daily Energy Loss', value: `${((heatTransferWatts * 24) / 1000).toFixed(2)} kWh / day` }
                ]
            };
        }
    },
    // 15. Reynolds Number Calculator
    {
        id: 'reynolds-number-calculator',
        name: 'Reynolds Number Calculator',
        category: 'engineering-physics',
        group: 'Physics & Mechanics',
        bucket: 'Bucket B',
        tier: 3,
        phase: 4,
        monthlySearches: '5K',
        cpc: '$0.12',
        description: "A Reynolds Number Calculator determines whether fluid flow is laminar or turbulent. It helps engineers analyze flow behavior in pipes and around objects. The calculator supports multiple fluids.",
        inputs: [
            { id: 'fluidVelocityMS', name: 'Fluid Velocity (m/s)', type: 'number', defaultValue: 1.5, min: 0.001, step: 0.1, suffix: 'm/s', tooltip: 'Average velocity.' },
            { id: 'pipeDiameterM', name: 'Internal Pipe Diameter (m)', type: 'number', defaultValue: 0.05, min: 0.001, step: 0.01, suffix: 'm', tooltip: 'Diameter (50mm = 0.05m).' },
            { id: 'fluidPreset', name: 'Fluid Properties', type: 'dropdown', defaultValue: 'water', options: [{ label: 'Water @ 20°C (ρ=998 kg/m³, μ=0.001002 Pa·s)', value: 'water' }, { label: 'Air @ 20°C (ρ=1.204 kg/m³, μ=1.825e-5 Pa·s)', value: 'air' }, { label: 'Engine Oil @ 20°C (ρ=888 kg/m³, μ=0.290 Pa·s)', value: 'oil' }, { label: 'Glycerin (ρ=1260 kg/m³, μ=1.412 Pa·s)', value: 'glycerin' }], tooltip: 'Fluid viscosity and density.' }
        ],
        naturalLanguageQueries: ["Calculate my reynolds number calculator", "What is my reynolds number calculator?", "Help me solve reynolds number calculator"],
        edgeCases: ["Zero viscosity Negative density Extremely high velocities"],
        calculate: (inputs) => {
            const v = Number(inputs.fluidVelocityMS) || 1.5;
            const d = Number(inputs.pipeDiameterM) || 0.05;
            const fluid = String(inputs.fluidPreset || 'water');

            let rho = 998.2;
            let mu = 0.001002;
            if (fluid === 'air') { rho = 1.204; mu = 0.00001825; }
            else if (fluid === 'oil') { rho = 888.0; mu = 0.290; }
            else if (fluid === 'glycerin') { rho = 1260.0; mu = 1.412; }

            const re = (rho * v * d) / mu;

            let regime = '';
            let frictionFactor = 0;
            if (re < 2300) {
                regime = 'Laminar Flow (Re < 2,300)';
                frictionFactor = 64 / re;
            } else if (re <= 4000) {
                regime = 'Transitional Flow (2,300 ≤ Re ≤ 4,000)';
                frictionFactor = 0.035;
            } else {
                regime = 'Turbulent Flow (Re > 4,000)';
                frictionFactor = 0.3164 / Math.pow(re, 0.25); // Blasius formula
            }

            return {
                primaryOutput: { label: 'Reynolds Number (Re)', value: `${Math.round(re).toLocaleString()}`, suffix: regime.split(' ')[0] },
                secondaryMetrics: [
                    { label: 'Flow Regime Classification', value: regime },
                    { label: 'Darcy Friction Factor (f)', value: frictionFactor.toFixed(5) },
                    { label: 'Kinematic Viscosity (ν)', value: `${(mu / rho).toExponential(4)} m²/s` },
                    { label: 'Fluid Density', value: `${rho} kg/m³` }
                ]
            };
        }
    },
    // 16. Acceleration Calculator
    {
        id: 'acceleration-calculator',
        name: 'Acceleration Calculator',
        category: 'engineering-physics',
        group: 'Physics & Mechanics',
        bucket: 'Bucket C1',
        tier: 5,
        phase: 4,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "An Acceleration Calculator computes acceleration, velocity, distance, or time relationships. It helps solve motion and dynamics problems. The calculator supports constant acceleration equations.",
        inputs: [
            { id: 'initialVelocityMph', name: 'Initial Velocity (MPH)', type: 'number', defaultValue: 0, min: 0, step: 5, suffix: 'mph', tooltip: 'Starting speed.' },
            { id: 'finalVelocityMph', name: 'Final Velocity (MPH)', type: 'number', defaultValue: 60, min: 0, step: 5, suffix: 'mph', tooltip: 'Ending speed.' },
            { id: 'timeSeconds', name: 'Time Elapsed (Seconds)', type: 'number', defaultValue: 4.5, min: 0.01, step: 0.1, suffix: 'sec', tooltip: 'Duration.' }
        ],
        naturalLanguageQueries: ["Calculate my acceleration calculator", "What is my acceleration calculator?", "Help me solve acceleration calculator"],
        edgeCases: ["Zero time Negative distances Inconsistent motion inputs"],
        calculate: (inputs) => {
            const v0Mph = Number(inputs.initialVelocityMph) || 0;
            const vfMph = Number(inputs.finalVelocityMph) || 60;
            const t = Number(inputs.timeSeconds) || 4.5;

            const v0Mps = v0Mph * 0.44704;
            const vfMps = vfMph * 0.44704;

            const accelMps2 = (vfMps - v0Mps) / t;
            const accelFtS2 = accelMps2 * 3.28084;
            const gForce = accelMps2 / 9.80665;
            const distanceMeters = (v0Mps * t) + (0.5 * accelMps2 * Math.pow(t, 2));
            const distanceFeet = distanceMeters * 3.28084;

            return {
                primaryOutput: { label: 'Acceleration', value: `${accelMps2.toFixed(2)} m/s²`, suffix: `${gForce.toFixed(2)} G` },
                secondaryMetrics: [
                    { label: 'Acceleration in ft/s²', value: `${accelFtS2.toFixed(2)} ft/s²` },
                    { label: 'G-Force Experienced', value: `${gForce.toFixed(3)} g` },
                    { label: 'Distance Covered During Acceleration', value: `${distanceFeet.toFixed(1)} ft (${distanceMeters.toFixed(1)} m)` },
                    { label: 'Speed Change (Δv)', value: `${(vfMph - v0Mph).toFixed(1)} MPH` }
                ]
            };
        }
    },
    // 17. Force Calculator
    {
        id: 'force-calculator',
        name: 'Force Calculator',
        category: 'engineering-physics',
        group: 'Physics & Mechanics',
        bucket: 'Bucket C1',
        tier: 4,
        phase: 4,
        monthlySearches: '4K',
        cpc: 'N/A',
        description: "A Force Calculator computes force, mass, or acceleration using Newton\u2019s Second Law. It helps solve engineering and physics mechanics problems. The calculator supports SI and imperial systems.",
        inputs: [
            { id: 'massKg', name: 'Mass (kg)', type: 'number', defaultValue: 1200, min: 0.01, step: 10, suffix: 'kg', tooltip: 'Mass of the object.' },
            { id: 'accelerationMps2', name: 'Acceleration (m/s²)', type: 'number', defaultValue: 4.5, min: 0.01, step: 0.1, suffix: 'm/s²', tooltip: 'Acceleration rate.' }
        ],
        naturalLanguageQueries: ["Calculate my force calculator", "What is my force calculator?", "Help me solve force calculator"],
        edgeCases: ["Zero acceleration Negative masses Extremely high forces"],
        calculate: (inputs) => {
            const mVal = Number(inputs.massKg) || 1200;
            const aVal = Number(inputs.accelerationMps2) || 4.5;

            const forceNewtons = mVal * aVal;
            const forceKN = forceNewtons / 1000;
            const forceLbf = forceNewtons * 0.224809;
            const forceDynes = forceNewtons * 100000;

            return {
                primaryOutput: { label: 'Net Force (F = m · a)', value: `${forceNewtons.toLocaleString(undefined, {maximumFractionDigits: 1})} N`, suffix: `${forceLbf.toFixed(1)} lbf` },
                secondaryMetrics: [
                    { label: 'Force in Kilonewtons (kN)', value: `${forceKN.toFixed(3)} kN` },
                    { label: 'Force in Pounds-Force (lbf)', value: `${forceLbf.toLocaleString(undefined, {maximumFractionDigits: 1})} lbf` },
                    { label: 'Force in Dynes', value: `${Math.round(forceDynes).toLocaleString()} dyn` },
                    { label: 'Equivalent Static Earth Weight', value: `${(mVal * 2.20462).toFixed(1)} lbs` }
                ]
            };
        }
    },
    // 18. Work and Power Calculator
    {
        id: 'work-and-power-calculator',
        name: 'Work and Power Calculator',
        category: 'engineering-physics',
        group: 'Physics & Mechanics',
        bucket: 'Bucket C1',
        tier: 5,
        phase: 5,
        monthlySearches: '40',
        cpc: 'N/A',
        description: "A Work and Power Calculator computes mechanical work and power relationships. It helps engineers analyze energy transfer and machine efficiency. The calculator supports rotational and linear systems.",
        inputs: [
            { id: 'forceNewtons', name: 'Applied Force (Newtons)', type: 'number', defaultValue: 500, min: 0.1, step: 10, suffix: 'N', tooltip: 'Force in direction of motion.' },
            { id: 'distanceMeters', name: 'Displacement Distance (Meters)', type: 'number', defaultValue: 20, min: 0.1, step: 1, suffix: 'm', tooltip: 'Distance moved.' },
            { id: 'timeSeconds', name: 'Time to Complete (Seconds)', type: 'number', defaultValue: 8, min: 0.01, step: 0.5, suffix: 'sec', tooltip: 'Time taken.' }
        ],
        naturalLanguageQueries: ["Calculate my work and power calculator", "What is my work and power calculator?", "Help me solve work and power calculator"],
        edgeCases: ["Zero time Negative distances Infinite power scenarios"],
        calculate: (inputs) => {
            const f = Number(inputs.forceNewtons) || 500;
            const d = Number(inputs.distanceMeters) || 20;
            const t = Number(inputs.timeSeconds) || 8;

            const workJoules = f * d;
            const workKJ = workJoules / 1000;
            const workFtLbf = workJoules * 0.737562;
            const powerWatts = workJoules / t;
            const powerHP = powerWatts / 745.7;

            return {
                primaryOutput: { label: 'Work Done / Power Output', value: `${workKJ.toFixed(2)} kJ / ${powerWatts.toFixed(0)} W`, suffix: `${powerHP.toFixed(2)} HP` },
                secondaryMetrics: [
                    { label: 'Total Work Done (Joules)', value: `${Math.round(workJoules).toLocaleString()} J` },
                    { label: 'Work Done in Foot-Pounds', value: `${Math.round(workFtLbf).toLocaleString()} ft-lbf` },
                    { label: 'Power in Horsepower (HP)', value: `${powerHP.toFixed(2)} HP` },
                    { label: 'Power in Kilowatts (kW)', value: `${(powerWatts / 1000).toFixed(3)} kW` }
                ]
            };
        }
    },
    // 19. Buoyancy Calculator
    {
        id: 'buoyancy-calculator',
        name: 'Buoyancy Calculator',
        category: 'engineering-physics',
        group: 'Physics & Mechanics',
        bucket: 'Bucket C1',
        tier: 4,
        phase: 4,
        monthlySearches: '1K',
        cpc: 'N/A',
        description: "A Buoyancy Calculator computes buoyant force exerted by fluids on submerged objects. It helps solve fluid mechanics and marine engineering problems. The calculator supports partially and fully submerged objects.",
        inputs: [
            { id: 'objectVolumeM3', name: 'Object Submerged Volume (m³)', type: 'number', defaultValue: 0.5, min: 0.0001, step: 0.05, suffix: 'm³', tooltip: 'Volume of displaced fluid.' },
            { id: 'objectMassKg', name: 'Object Total Mass (kg)', type: 'number', defaultValue: 400, min: 0.01, step: 10, suffix: 'kg', tooltip: 'Total mass of object.' },
            { id: 'fluidDensity', name: 'Fluid Medium', type: 'dropdown', defaultValue: 1000, options: [{ label: 'Fresh Water (1,000 kg/m³)', value: 1000 }, { label: 'Sea Water / Ocean (1,025 kg/m³)', value: 1025 }, { label: 'Dead Sea Salt Water (1,240 kg/m³)', value: 1240 }, { label: 'Gasoline (720 kg/m³)', value: 720 }], tooltip: 'Displaced fluid.' }
        ],
        naturalLanguageQueries: ["Calculate my buoyancy calculator", "What is my buoyancy calculator?", "Help me solve buoyancy calculator"],
        edgeCases: ["Negative densities Zero displaced volume Unrealistic gravity"],
        calculate: (inputs) => {
            const v = Number(inputs.objectVolumeM3) || 0.5;
            const m = Number(inputs.objectMassKg) || 400;
            const rho = Number(inputs.fluidDensity) || 1000;
            const g = 9.80665;

            const buoyantForceN = rho * v * g;
            const objectWeightN = m * g;
            const netForceN = buoyantForceN - objectWeightN;
            const netWeightLbs = netForceN * 0.224809;
            const objectDensity = m / v;

            return {
                primaryOutput: { label: 'Buoyant Upward Force', value: `${buoyantForceN.toFixed(0)} N`, suffix: `${(buoyantForceN * 0.224809).toFixed(1)} lbf` },
                secondaryMetrics: [
                    { label: 'Object Gravitational Weight', value: `${objectWeightN.toFixed(0)} N (${(m * 2.20462).toFixed(1)} lbs)` },
                    { label: 'Net Apparent Buoyancy', value: netForceN >= 0 ? `+${netForceN.toFixed(0)} N (Floats with ${netWeightLbs.toFixed(1)} lbs lift)` : `${netForceN.toFixed(0)} N (Sinks with ${Math.abs(netWeightLbs).toFixed(1)} lbs apparent weight)` },
                    { label: 'Object Average Density', value: `${objectDensity.toFixed(1)} kg/m³` },
                    { label: 'Submerged Fraction to Float', value: objectDensity <= rho ? `${((objectDensity / rho) * 100).toFixed(1)}% submerged when resting` : '100% Submerged (Denser than fluid)' }
                ]
            };
        }
    },
    // 20. Pulley System Calculator
    {
        id: 'pulley-system-calculator',
        name: 'Pulley System Calculator',
        category: 'engineering-physics',
        group: 'Physics & Mechanics',
        bucket: 'Bucket C1',
        tier: 5,
        phase: 5,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "A Pulley System Calculator estimates mechanical advantage, required force, and rope displacement in pulley arrangements. It helps solve lifting and mechanical-system problems. The calculator supports fixed and movable pulley systems.",
        inputs: [
            { id: 'loadWeightLbs', name: 'Load to Lift (lbs)', type: 'number', defaultValue: 600, min: 1, step: 25, suffix: 'lbs', tooltip: 'Weight of the load.' },
            { id: 'supportingStrands', name: 'Number of Supporting Rope Strands', type: 'dropdown', defaultValue: 4, options: [{ label: '1 Strand (Single Fixed Pulley - 1:1 MA)', value: 1 }, { label: '2 Strands (Single Movable Pulley - 2:1 MA)', value: 2 }, { label: '3 Strands (Luff Tackle - 3:1 MA)', value: 3 }, { label: '4 Strands (Double Block & Tackle - 4:1 MA)', value: 4 }, { label: '6 Strands (Triple Block & Tackle - 6:1 MA)', value: 6 }, { label: '8 Strands (Quadruple Block - 8:1 MA)', value: 8 }], tooltip: 'Rope parts supporting the load.' },
            { id: 'sheaveFriction', name: 'Friction Loss per Sheave (%)', type: 'number', defaultValue: 5, min: 0, max: 15, step: 1, suffix: '%', tooltip: 'Bearing friction per wheel.' }
        ],
        naturalLanguageQueries: ["Calculate my pulley system calculator", "What is my pulley system calculator?", "Help me solve pulley system calculator"],
        edgeCases: ["Zero supporting ropes Efficiency greater than 100% Negative load weights"],
        calculate: (inputs) => {
            const load = Number(inputs.loadWeightLbs) || 600;
            const strands = Number(inputs.supportingStrands) || 4;
            const frictionPercent = Number(inputs.sheaveFriction) || 5;

            const idealEffort = load / strands;
            const frictionFactor = 1 + ((strands * frictionPercent) / 100);
            const actualEffort = idealEffort * frictionFactor;
            const actualMA = load / actualEffort;

            return {
                primaryOutput: { label: 'Required Pulling Effort', value: `${Math.round(actualEffort)} lbs`, suffix: `${strands}:1 Mechanical Adv.` },
                secondaryMetrics: [
                    { label: 'Ideal Pull Force (0% friction)', value: `${idealEffort.toFixed(1)} lbs` },
                    { label: 'Actual Mechanical Advantage (AMA)', value: `${actualMA.toFixed(2)}:1` },
                    { label: 'Rope Pull Distance for 10 ft Lift', value: `${10 * strands} Feet of Rope` },
                    { label: 'System Mechanical Efficiency', value: `${((idealEffort / actualEffort) * 100).toFixed(1)}%` }
                ]
            };
        }
    },
    // 21. Wind Chill Calculator
    {
        id: 'wind-chill-calculator',
        name: 'Wind Chill Calculator',
        category: 'engineering-physics',
        group: 'Weather & Environment',
        bucket: 'Bucket C1',
        tier: 5,
        phase: 4,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "A Wind Chill Calculator estimates how cold the air feels on exposed skin when wind speed is combined with low air temperature. It helps people assess cold-weather safety risks and appropriate clothing requirements. The calculator uses standard meteorological formulas from the National Weather Service and Environment Canada.",
        inputs: [
            { id: 'airTempF', name: 'Air Temperature (°F)', type: 'number', defaultValue: 25, min: -60, max: 50, step: 1, suffix: '°F', tooltip: 'Air temperature (must be ≤ 50°F).' },
            { id: 'windSpeedMph', name: 'Wind Speed (MPH)', type: 'number', defaultValue: 15, min: 3, max: 100, step: 1, suffix: 'mph', tooltip: 'Wind speed at 5ft (must be ≥ 3 mph).' }
        ],
        naturalLanguageQueries: ["Calculate my wind chill calculator", "What is my wind chill calculator?", "Help me solve wind chill calculator"],
        edgeCases: ["Wind speed below formula threshold Temperatures above applicability range Negative wind speeds Unit conversion inconsistencies"],
        calculate: (inputs) => {
            const t = Number(inputs.airTempF) || 25;
            const v = Number(inputs.windSpeedMph) || 15;

            // NWS Wind Chill Index Formula: 35.74 + 0.6215T - 35.75(V^0.16) + 0.4275T(V^0.16)
            let windChillF = t;
            if (t <= 50 && v >= 3) {
                windChillF = 35.74 + (0.6215 * t) - (35.75 * Math.pow(v, 0.16)) + (0.4275 * t * Math.pow(v, 0.16));
            }

            const windChillC = (windChillF - 32) * (5 / 9);
            const tempDrop = t - windChillF;

            let dangerLevel = 'Low Risk (Dress warmly in layers)';
            let frostbiteTime = '> 60 Minutes';
            if (windChillF < -45) {
                dangerLevel = 'EXTREME DANGER: Frostbite imminent!';
                frostbiteTime = 'Under 5 Minutes of exposed skin';
            } else if (windChillF < -30) {
                dangerLevel = 'VERY HIGH DANGER: Severe frostbite hazard';
                frostbiteTime = '10 Minutes of exposed skin';
            } else if (windChillF < -18) {
                dangerLevel = 'HIGH RISK: Frostbite possible on exposed skin';
                frostbiteTime = '30 Minutes of exposed skin';
            } else if (windChillF < 0) {
                dangerLevel = 'MODERATE RISK: Hypothermia risk if wet/unprepared';
                frostbiteTime = '30-60 Minutes';
            }

            return {
                primaryOutput: { label: 'Feels Like Wind Chill', value: `${Math.round(windChillF)}°F`, suffix: `${Math.round(windChillC)}°C` },
                secondaryMetrics: [
                    { label: 'Wind Cooling Deficit', value: `${Math.round(tempDrop)}°F Colder than Air Temp` },
                    { label: 'Frostbite Risk Classification', value: dangerLevel },
                    { label: 'Estimated Time to Frostbite', value: frostbiteTime },
                    { label: 'Wind Speed Intensity', value: `${v} MPH (${(v * 1.60934).toFixed(1)} km/h / ${(v * 0.44704).toFixed(1)} m/s)` }
                ]
            };
        }
    },
    // 22. Heat Index Calculator
    {
        id: 'heat-index-calculator',
        name: 'Heat Index Calculator',
        category: 'engineering-physics',
        group: 'Weather & Environment',
        bucket: 'Bucket C1',
        tier: 3,
        phase: 3,
        monthlySearches: '18K',
        cpc: '$2.73',
        description: "A Heat Index Calculator estimates how hot the weather feels when humidity is combined with air temperature. It helps assess heat stress and outdoor safety conditions. The calculator uses NOAA/NWS heat index equations.",
        inputs: [
            { id: 'airTempF', name: 'Air Temperature (°F)', type: 'number', defaultValue: 90, min: 75, max: 130, step: 1, suffix: '°F', tooltip: 'Ambient temperature.' },
            { id: 'relativeHumidity', name: 'Relative Humidity (%)', type: 'number', defaultValue: 65, min: 5, max: 100, step: 1, suffix: '%', tooltip: 'Relative humidity.' }
        ],
        naturalLanguageQueries: ["Calculate my heat index calculator", "What is my heat index calculator?", "Help me solve heat index calculator"],
        edgeCases: ["Humidity outside 0\u2013100% Temperatures below valid range Unrealistic weather conditions"],
        calculate: (inputs) => {
            const T = Number(inputs.airTempF) || 90;
            const RH = Number(inputs.relativeHumidity) || 65;

            // Simplified Rothfusz NWS equation
            let HI = 0.5 * (T + 61.0 + ((T - 68.0) * 1.2) + (RH * 0.094));
            if (HI >= 80) {
                HI = -42.379 + (2.04901523 * T) + (10.14333127 * RH) - (0.22475541 * T * RH)
                    - (0.00683783 * T * T) - (0.05481717 * RH * RH) + (0.00122874 * T * T * RH)
                    + (0.00085282 * T * RH * RH) - (0.00000199 * T * T * RH * RH);
            }

            const hiC = (HI - 32) * (5 / 9);

            let danger = 'Caution: Fatigue possible with prolonged exposure';
            let hydration = '0.5 to 1.0 Quart / hour';
            if (HI >= 125) {
                danger = 'EXTREME DANGER: Heat stroke highly likely!';
                hydration = '1.0+ Quart / hour + Mandatory Shade Breaks';
            } else if (HI >= 103) {
                danger = 'DANGER: Heat cramps and heat exhaustion likely; heat stroke probable';
                hydration = '1.0 Quart / hour of water & electrolytes';
            } else if (HI >= 90) {
                danger = 'EXTREME CAUTION: Heat cramps & exhaustion possible with physical activity';
                hydration = '0.75 Quart / hour';
            }

            return {
                primaryOutput: { label: 'Feels Like Heat Index', value: `${Math.round(HI)}°F`, suffix: `${Math.round(hiC)}°C` },
                secondaryMetrics: [
                    { label: 'NWS Danger Classification', value: danger },
                    { label: 'Recommended Hydration Intake', value: hydration },
                    { label: 'Apparent Temperature Spike', value: `+${Math.max(0, Math.round(HI - T))}°F over dry bulb temp` },
                    { label: 'Dew Point Estimate', value: `~${Math.round(T - ((100 - RH) / 5))}°F` }
                ]
            };
        }
    },
    // 23. Dew Point Calculator
    {
        id: 'dew-point-calculator',
        name: 'Dew Point Calculator',
        category: 'engineering-physics',
        group: 'Weather & Environment',
        bucket: 'Bucket C1',
        tier: 2,
        phase: 3,
        monthlySearches: '33K',
        cpc: '$6.93  ★ HIGH CPC',
        description: "A Dew Point Calculator estimates the temperature at which air becomes saturated and condensation begins. It helps evaluate humidity comfort and weather conditions. The calculator is commonly used in HVAC, meteorology, and environmental science.",
        inputs: [
            { id: 'tempF', name: 'Air Temperature (°F)', type: 'number', defaultValue: 78, min: -40, max: 130, step: 1, suffix: '°F', tooltip: 'Air temperature.' },
            { id: 'relativeHumidity', name: 'Relative Humidity (%)', type: 'number', defaultValue: 60, min: 1, max: 100, step: 1, suffix: '%', tooltip: 'Humidity percentage.' }
        ],
        naturalLanguageQueries: ["Calculate my dew point calculator", "What is my dew point calculator?", "Help me solve dew point calculator"],
        edgeCases: ["Zero division errors", "Invalid input formats", "Boundary conditions"],
        calculate: (inputs) => {
            const tempF = Number(inputs.tempF) || 78;
            const rh = Number(inputs.relativeHumidity) || 60;

            const tempC = (tempF - 32) * (5 / 9);
            const b = 17.625;
            const c = 243.04;
            const gamma = Math.log(rh / 100) + ((b * tempC) / (c + tempC));
            const dewPointC = (c * gamma) / (b - gamma);
            const dewPointF = (dewPointC * (9 / 5)) + 32;

            let comfort = 'Comfortable';
            if (dewPointF < 50) comfort = 'Dry & Crisp (Low moisture)';
            else if (dewPointF <= 55) comfort = 'Very Comfortable';
            else if (dewPointF <= 60) comfort = 'Pleasant & Mild';
            else if (dewPointF <= 65) comfort = 'Noticeably Humid / Sticky';
            else if (dewPointF <= 70) comfort = 'Muggy & Uncomfortable';
            else if (dewPointF <= 75) comfort = 'Oppressive & Very Uncomfortable';
            else comfort = 'Extremely Miserable / Tropical';

            return {
                primaryOutput: { label: 'Dew Point Temperature', value: `${dewPointF.toFixed(1)}°F`, suffix: `${dewPointC.toFixed(1)}°C` },
                secondaryMetrics: [
                    { label: 'Human Comfort Perception', value: comfort },
                    { label: 'Air Moisture Saturation Spread', value: `${(tempF - dewPointF).toFixed(1)}°F Temperature Depression` },
                    { label: 'Relative Humidity', value: `${rh}%` },
                    { label: 'Condensation Point', value: `Water vapor condenses when surfaces drop below ${dewPointF.toFixed(1)}°F` }
                ]
            };
        }
    },
    // 24. UV Index Calculator
    {
        id: 'uv-index-calculator',
        name: 'UV Index Calculator',
        category: 'engineering-physics',
        group: 'Weather & Environment',
        bucket: 'Bucket B',
        tier: 5,
        phase: 4,
        monthlySearches: '720',
        cpc: '$0.25',
        description: "A UV Index Calculator estimates ultraviolet radiation exposure risk based on environmental conditions. It helps users evaluate sunburn risk and sun-protection needs. The calculator may incorporate altitude, cloud cover, and ozone adjustments.",
        inputs: [
            { id: 'uvIndex', name: 'Forecasted UV Index', type: 'number', defaultValue: 8, min: 0, max: 15, step: 1, suffix: 'UVI', tooltip: 'UV Index reading.' },
            { id: 'skinType', name: 'Fitzpatrick Skin Type', type: 'dropdown', defaultValue: 2, options: [{ label: 'Type I: Very Fair / Always Burns / Freckles', value: 1 }, { label: 'Type II: Fair / Usually Burns / Tans Minimally', value: 2 }, { label: 'Type III: Medium / Sometimes Mild Burn / Uniform Tan', value: 3 }, { label: 'Type IV: Olive / Rarely Burns / Tans Easily', value: 4 }, { label: 'Type V: Brown / Very Rarely Burns / Darkens Easily', value: 5 }, { label: 'Type VI: Deeply Pigmented Dark Skin / Never Burns', value: 6 }], tooltip: 'Melanin skin type.' }
        ],
        naturalLanguageQueries: ["Calculate my uv index calculator", "What is my uv index calculator?", "Help me solve uv index calculator"],
        edgeCases: ["Negative UV values Extreme altitudes Missing environmental adjustments"],
        calculate: (inputs) => {
            const uvi = Number(inputs.uvIndex) || 8;
            const skin = Number(inputs.skinType) || 2;

            // Base burn time (minutes) = (200 * skinFactor) / (3 * UVI)
            const skinFactors = [1.0, 1.5, 2.0, 3.0, 4.5, 6.0];
            const factor = skinFactors[skin - 1] || 1.5;
            const burnTimeMins = uvi > 0 ? Math.round((67 * factor) / uvi) : 999;

            let uvCategory = 'Low (0-2)';
            let spf = 'SPF 15';
            if (uvi >= 11) { uvCategory = 'Extreme (11+)'; spf = 'SPF 50+ & UV Protective Clothing / Shade'; }
            else if (uvi >= 8) { uvCategory = 'Very High (8-10)'; spf = 'SPF 30-50 & Wide-Brim Hat + Sunglasses'; }
            else if (uvi >= 6) { uvCategory = 'High (6-7)'; spf = 'SPF 30 & Seek Midday Shade'; }
            else if (uvi >= 3) { uvCategory = 'Moderate (3-5)'; spf = 'SPF 15-30'; }

            return {
                primaryOutput: { label: 'Time to Unprotected Sunburn', value: burnTimeMins >= 120 ? '> 2 Hours' : `${burnTimeMins} Minutes`, suffix: `UV Index: ${uvi}` },
                secondaryMetrics: [
                    { label: 'UV Exposure Category', value: uvCategory },
                    { label: 'Recommended Sun Protection', value: spf },
                    { label: 'Peak Solar Radiation Hours', value: '10:00 AM - 4:00 PM' },
                    { label: 'Vitamin D Synthesis Time', value: `~${Math.max(5, Math.round(burnTimeMins * 0.25))} Minutes of sun exposure` }
                ]
            };
        }
    },
    // 25. Carbon Footprint Calculator
    {
        id: 'carbon-footprint-calculator',
        name: 'Carbon Footprint Calculator',
        category: 'engineering-physics',
        group: 'Weather & Environment',
        bucket: 'Bucket B',
        tier: 2,
        phase: 3,
        monthlySearches: '27K',
        cpc: '$3.53',
        description: "A Carbon Footprint Calculator estimates greenhouse gas emissions from transportation, electricity, diet, and lifestyle activities. It helps individuals and businesses evaluate environmental impact. The calculator expresses emissions in CO\u2082 equivalent units.",
        inputs: [
            { id: 'annualDrivingMiles', name: 'Annual Driving Miles', type: 'number', defaultValue: 12000, min: 0, step: 500, suffix: 'mi', tooltip: 'Vehicle miles per year.' },
            { id: 'vehicleMPG', name: 'Vehicle Fuel Economy (MPG)', type: 'number', defaultValue: 25, min: 10, max: 150, step: 1, suffix: 'mpg', tooltip: 'Average gas mileage.' },
            { id: 'monthlyKWh', name: 'Monthly Home Electricity (kWh)', type: 'number', defaultValue: 900, min: 50, step: 50, suffix: 'kWh', tooltip: 'Electric bill usage.' },
            { id: 'flightsPerYear', name: 'Round-Trip Airline Flights', type: 'number', defaultValue: 2, min: 0, max: 50, step: 1, tooltip: 'Round trips per year (~3000 miles each).' },
            { id: 'dietType', name: 'Dietary Preference', type: 'dropdown', defaultValue: 'omnivore', options: [{ label: 'Heavy Meat Consumer (3.3 Tons CO2)', value: 'heavy_meat' }, { label: 'Average Omnivore (2.5 Tons CO2)', value: 'omnivore' }, { label: 'Vegetarian (1.7 Tons CO2)', value: 'vegetarian' }, { label: 'Vegan (1.5 Tons CO2)', value: 'vegan' }], tooltip: 'Diet footprint.' }
        ],
        naturalLanguageQueries: ["Calculate my carbon footprint calculator", "What is my carbon footprint calculator?", "Help me solve carbon footprint calculator"],
        edgeCases: ["Missing regional emission data Negative energy usage Unrealistic travel distances"],
        calculate: (inputs) => {
            const miles = Number(inputs.annualDrivingMiles) || 12000;
            const mpg = Number(inputs.vehicleMPG) || 25;
            const kwh = Number(inputs.monthlyKWh) || 900;
            const flights = Number(inputs.flightsPerYear) || 2;
            const diet = String(inputs.dietType || 'omnivore');

            // Vehicle: 19.6 lbs CO2 per gallon of gasoline
            const vehicleCO2Kg = (miles / mpg) * 8.887; // kg CO2
            // Electricity: ~0.386 kg CO2 per kWh US grid average
            const electricityCO2Kg = (kwh * 12) * 0.386;
            // Flights: ~450 kg CO2 per 3000-mile roundtrip economy seat
            const flightCO2Kg = flights * 450;

            let dietCO2Kg = 2500;
            if (diet === 'heavy_meat') dietCO2Kg = 3300;
            else if (diet === 'vegetarian') dietCO2Kg = 1700;
            else if (diet === 'vegan') dietCO2Kg = 1500;

            const totalCO2Kg = vehicleCO2Kg + electricityCO2Kg + flightCO2Kg + dietCO2Kg;
            const totalMetricTons = totalCO2Kg / 1000;
            const totalPounds = totalCO2Kg * 2.20462;
            const treesToOffset = Math.ceil(totalCO2Kg / 22); // 1 mature tree absorbs ~22 kg (48 lbs) CO2/year

            return {
                primaryOutput: { label: 'Annual Carbon Footprint', value: `${totalMetricTons.toFixed(2)} Metric Tons`, suffix: `${Math.round(totalPounds).toLocaleString()} lbs CO2` },
                secondaryMetrics: [
                    { label: 'Vehicle Transportation Emissions', value: `${(vehicleCO2Kg / 1000).toFixed(2)} Tons (${Math.round((vehicleCO2Kg / totalCO2Kg) * 100)}%)` },
                    { label: 'Home Electricity Emissions', value: `${(electricityCO2Kg / 1000).toFixed(2)} Tons (${Math.round((electricityCO2Kg / totalCO2Kg) * 100)}%)` },
                    { label: 'Aviation Flights Emissions', value: `${(flightCO2Kg / 1000).toFixed(2)} Tons` },
                    { label: 'Trees Needed to Offset Annually', value: `${treesToOffset.toLocaleString()} Mature Trees` }
                ]
            };
        }
    },
    // 26. Water Usage Calculator
    {
        id: 'water-usage-calculator',
        name: 'Water Usage Calculator',
        category: 'engineering-physics',
        group: 'Weather & Environment',
        bucket: 'Bucket C1',
        tier: 4,
        phase: 4,
        monthlySearches: '3K',
        cpc: '$4.29',
        description: "A Water Usage Calculator estimates household or business water consumption. It helps users identify conservation opportunities and utility costs. The calculator supports appliance and activity-based estimates.",
        inputs: [
            { id: 'occupants', name: 'Household Members', type: 'number', defaultValue: 3, min: 1, max: 12, step: 1, tooltip: 'Number of people.' },
            { id: 'showerMinsPerDay', name: 'Shower Minutes per Person / Day', type: 'number', defaultValue: 8, min: 2, max: 30, step: 1, suffix: 'min', tooltip: 'Daily shower duration.' },
            { id: 'showerFlowGPM', name: 'Showerhead Flow Rate (GPM)', type: 'dropdown', defaultValue: 2.0, options: [{ label: 'Standard WaterSense (1.8 GPM)', value: 1.8 }, { label: 'Standard Modern (2.0 GPM)', value: 2.0 }, { label: 'Older Showerhead (2.5 GPM)', value: 2.5 }, { label: 'High Flow / Rainfall (3.5 GPM)', value: 3.5 }], tooltip: 'Shower GPM.' },
            { id: 'lawnWateringMinsWeek', name: 'Lawn / Garden Watering (Mins / Week)', type: 'number', defaultValue: 45, min: 0, step: 15, suffix: 'min', tooltip: 'Sprinklers (~10 GPM).' }
        ],
        naturalLanguageQueries: ["Calculate my water usage calculator", "What is my water usage calculator?", "Help me solve water usage calculator"],
        edgeCases: ["Negative flow rates Missing appliance assumptions Extreme household sizes"],
        calculate: (inputs) => {
            const people = Number(inputs.occupants) || 3;
            const showerMins = Number(inputs.showerMinsPerDay) || 8;
            const showerGPM = Number(inputs.showerFlowGPM) || 2.0;
            const lawnMins = Number(inputs.lawnWateringMinsWeek) || 45;

            const dailyShowerGal = people * showerMins * showerGPM;
            const dailyToiletGal = people * 5 * 1.6; // 5 flushes @ 1.6 GPF
            const dailyFaucetsGal = people * 10; // 10 gal handwashing, brushing, cooking
            const dailyAppliancesGal = (people * 15); // Laundry + dishwasher normalized daily

            const indoorDailyGal = dailyShowerGal + dailyToiletGal + dailyFaucetsGal + dailyAppliancesGal;
            const outdoorDailyGal = (lawnMins * 10) / 7; // Sprinkler ~10 GPM

            const totalDailyGal = indoorDailyGal + outdoorDailyGal;
            const monthlyGal = totalDailyGal * 30.42;
            const monthlyCCF = monthlyGal / 748; // 1 CCF = 748 gallons
            const estMonthlyCost = (monthlyCCF * 4.50) + 20; // $4.50/CCF + $20 base charge

            return {
                primaryOutput: { label: 'Monthly Water Consumption', value: `${Math.round(monthlyGal).toLocaleString()} Gallons`, suffix: `${monthlyCCF.toFixed(1)} CCF / HCF` },
                secondaryMetrics: [
                    { label: 'Daily Household Usage', value: `${Math.round(totalDailyGal)} Gallons / day (${Math.round(totalDailyGal * 3.785)} Liters)` },
                    { label: 'Daily Usage per Person', value: `${Math.round(indoorDailyGal / people)} Gallons / person / day` },
                    { label: 'Estimated Monthly Water & Sewer Bill', value: `$${estMonthlyCost.toFixed(2)} / month` },
                    { label: 'Annual Water Usage', value: `${Math.round(monthlyGal * 12).toLocaleString()} Gallons / year` }
                ]
            };
        }
    },
    // 27. Energy Consumption Calculator
    {
        id: 'energy-consumption-calculator',
        name: 'Energy Consumption Calculator',
        category: 'engineering-physics',
        group: 'Weather & Environment',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '10K',
        cpc: '$4.12',
        description: "An Energy Consumption Calculator estimates total energy usage from electrical devices and systems. It helps households and businesses monitor efficiency and costs. The calculator supports multiple appliances and billing periods.",
        inputs: [
            { id: 'monthlyKWh', name: 'Monthly Electricity Usage (kWh)', type: 'number', defaultValue: 950, min: 100, step: 50, suffix: 'kWh', tooltip: 'Monthly electricity bill.' },
            { id: 'monthlyGasTherms', name: 'Monthly Natural Gas (Therms)', type: 'number', defaultValue: 45, min: 0, step: 5, suffix: 'therms', tooltip: 'Monthly natural gas.' },
            { id: 'annualGasolineGal', name: 'Annual Vehicle Fuel (Gallons)', type: 'number', defaultValue: 480, min: 0, step: 50, suffix: 'gal', tooltip: 'Gasoline consumed annually.' }
        ],
        naturalLanguageQueries: ["Calculate my energy consumption calculator", "What is my energy consumption calculator?", "Help me solve energy consumption calculator"],
        edgeCases: ["Zero wattage Negative usage hours Invalid utility rates"],
        calculate: (inputs) => {
            const kwh = Number(inputs.monthlyKWh) || 950;
            const therms = Number(inputs.monthlyGasTherms) || 45;
            const gasGal = Number(inputs.annualGasolineGal) || 480;

            // Conversions to MMBtu (Million British Thermal Units):
            // 1 kWh = 0.003412 MMBtu
            // 1 Therm = 0.10 MMBtu
            // 1 Gal Gasoline = 0.120 MMBtu
            const elecMMBtu = (kwh * 12) * 0.003412;
            const gasMMBtu = (therms * 12) * 0.10;
            const autoMMBtu = gasGal * 0.120;

            const totalMMBtu = elecMMBtu + gasMMBtu + autoMMBtu;
            const totalMWh = totalMMBtu * 0.293071;
            const totalGJ = totalMMBtu * 1.05506;

            const elecCost = (kwh * 12) * 0.16;
            const natGasCost = (therms * 12) * 1.40;
            const autoFuelCost = gasGal * 3.50;
            const totalAnnualSpend = elecCost + natGasCost + autoFuelCost;

            return {
                primaryOutput: { label: 'Total Annual Energy Consumption', value: `${totalMMBtu.toFixed(1)} MMBtu`, suffix: `${totalMWh.toFixed(1)} MWh` },
                secondaryMetrics: [
                    { label: 'Total Annual Energy Spend', value: `$${Math.round(totalAnnualSpend).toLocaleString()} / year` },
                    { label: 'Energy in Gigajoules (GJ)', value: `${totalGJ.toFixed(1)} GJ` },
                    { label: 'Home Electricity Share', value: `${elecMMBtu.toFixed(1)} MMBtu (${Math.round((elecMMBtu / totalMMBtu) * 100)}%)` },
                    { label: 'Home Heating & Transport Share', value: `${(gasMMBtu + autoMMBtu).toFixed(1)} MMBtu (${Math.round(((gasMMBtu + autoMMBtu) / totalMMBtu) * 100)}%)` }
                ]
            };
        }
    },
    // 28. Solar Energy Calculator
    {
        id: 'solar-energy-calculator',
        name: 'Solar Energy Calculator',
        category: 'engineering-physics',
        group: 'Weather & Environment',
        bucket: 'Bucket C1',
        tier: 2,
        phase: 2,
        monthlySearches: '22K',
        cpc: '$4.74',
        description: "A Solar Energy Calculator estimates solar power generation from photovoltaic systems. It helps evaluate renewable energy potential and savings. The calculator considers sunlight, efficiency, and system size.",
        inputs: [
            { id: 'systemCapacityKW', name: 'Solar System DC Size (kW)', type: 'number', defaultValue: 8.0, min: 1, max: 50, step: 0.5, suffix: 'kW', tooltip: 'Installed DC capacity.' },
            { id: 'peakSunHours', name: 'Average Daily Peak Sun Hours', type: 'number', defaultValue: 4.8, min: 2.0, max: 7.5, step: 0.1, suffix: 'hrs', tooltip: 'Solar resource.' },
            { id: 'systemEfficiency', name: 'System Derate Factor (%)', type: 'number', defaultValue: 82, min: 60, max: 95, step: 1, suffix: '%', tooltip: 'Loss factor for inverters, wiring, soiling.' },
            { id: 'electricRatePerKWh', name: 'Utility Electric Rate ($/kWh)', type: 'number', defaultValue: 0.17, min: 0.05, step: 0.01, prefix: '$', tooltip: 'Current rate.' }
        ],
        naturalLanguageQueries: ["Calculate my solar energy calculator", "What is my solar energy calculator?", "Help me solve solar energy calculator"],
        edgeCases: ["Zero sunlight hours Efficiency above 100% Negative panel wattages"],
        calculate: (inputs) => {
            const kw = Number(inputs.systemCapacityKW) || 8.0;
            const sunHours = Number(inputs.peakSunHours) || 4.8;
            const derate = (Number(inputs.systemEfficiency) || 82) / 100;
            const rate = Number(inputs.electricRatePerKWh) || 0.17;

            const dailyKWh = kw * sunHours * derate;
            const annualKWh = dailyKWh * 365;
            const annualSavings = annualKWh * rate;
            const savings25Year = annualSavings * 25 * 1.02; // with 2% utility inflation offset
            const co2AvoidedTons = (annualKWh * 25 * 0.386) / 1000;

            return {
                primaryOutput: { label: 'Annual Solar Electricity Generation', value: `${Math.round(annualKWh).toLocaleString()} kWh`, suffix: `$${Math.round(annualSavings).toLocaleString()} / yr` },
                secondaryMetrics: [
                    { label: 'Average Daily Generation', value: `${dailyKWh.toFixed(1)} kWh / day` },
                    { label: '25-Year Estimated Utility Savings', value: `$${Math.round(savings25Year).toLocaleString()}` },
                    { label: '25-Year Lifetime Clean Energy', value: `${Math.round(annualKWh * 25 / 1000)} MWh` },
                    { label: 'Lifetime Carbon Offset', value: `${co2AvoidedTons.toFixed(1)} Metric Tons CO2` }
                ]
            };
        }
    },
    // 29. Tire Size Calculator
    {
        id: 'tire-size-calculator',
        name: 'Tire Size Calculator',
        category: 'engineering-physics',
        group: 'Automotive',
        bucket: 'Bucket C1',
        tier: 1,
        phase: 2,
        monthlySearches: '201K',
        cpc: '$2.85',
        description: "A Tire Size Calculator compares tire dimensions, revolutions, and speedometer effects between tire sizes. It helps drivers evaluate replacement and performance tires. The calculator supports metric tire notation.",
        inputs: [
            { id: 'width1', name: 'Original Tire Width (mm)', type: 'number', defaultValue: 225, min: 145, max: 355, step: 10, suffix: 'mm', tooltip: 'Section width (e.g. 225).' },
            { id: 'ratio1', name: 'Original Aspect Ratio (%)', type: 'number', defaultValue: 45, min: 25, max: 85, step: 5, suffix: '%', tooltip: 'Aspect profile (e.g. 45).' },
            { id: 'rim1', name: 'Original Wheel Diameter (in)', type: 'number', defaultValue: 17, min: 12, max: 26, step: 1, suffix: 'in', tooltip: 'Rim size (e.g. 17).' },
            { id: 'width2', name: 'New Tire Width (mm)', type: 'number', defaultValue: 245, min: 145, max: 355, step: 10, suffix: 'mm', tooltip: 'New section width (e.g. 245).' },
            { id: 'ratio2', name: 'New Aspect Ratio (%)', type: 'number', defaultValue: 40, min: 25, max: 85, step: 5, suffix: '%', tooltip: 'New profile (e.g. 40).' },
            { id: 'rim2', name: 'New Wheel Diameter (in)', type: 'number', defaultValue: 18, min: 12, max: 26, step: 1, suffix: 'in', tooltip: 'New rim size (e.g. 18).' }
        ],
        naturalLanguageQueries: ["Calculate my tire size calculator", "What is my tire size calculator?", "Help me solve tire size calculator"],
        edgeCases: ["Invalid aspect ratios Zero wheel diameter Nonstandard tire formats"],
        calculate: (inputs) => {
            const w1 = Number(inputs.width1) || 225;
            const r1 = Number(inputs.ratio1) || 45;
            const d1 = Number(inputs.rim1) || 17;

            const w2 = Number(inputs.width2) || 245;
            const r2 = Number(inputs.ratio2) || 40;
            const d2 = Number(inputs.rim2) || 18;

            const sidewall1In = (w1 * (r1 / 100)) / 25.4;
            const sidewall2In = (w2 * (r2 / 100)) / 25.4;

            const diam1In = d1 + (2 * sidewall1In);
            const diam2In = d2 + (2 * sidewall2In);

            const circ1In = Math.PI * diam1In;
            const circ2In = Math.PI * diam2In;

            const revsPerMile1 = 63360 / circ1In;
            const revsPerMile2 = 63360 / circ2In;

            const diamDiffIn = diam2In - diam1In;
            const speedoActualAt65 = 65 * (diam2In / diam1In);
            const percentDiff = ((diam2In - diam1In) / diam1In) * 100;

            return {
                primaryOutput: { label: 'Overall Diameter Difference', value: `${diamDiffIn >= 0 ? '+' : ''}${diamDiffIn.toFixed(2)} in`, suffix: `(${diamDiffIn >= 0 ? '+' : ''}${percentDiff.toFixed(2)}%)` },
                secondaryMetrics: [
                    { label: 'Speedometer Reading at 65 MPH', value: `Actual speed: ${speedoActualAt65.toFixed(1)} MPH` },
                    { label: 'Original Tire Dimensions', value: `${diam1In.toFixed(2)}" Diameter (${Math.round(revsPerMile1)} Revs/Mile)` },
                    { label: 'New Tire Dimensions', value: `${diam2In.toFixed(2)}" Diameter (${Math.round(revsPerMile2)} Revs/Mile)` },
                    { label: 'Ride Height Difference', value: `${(diamDiffIn / 2).toFixed(2)} inches` }
                ]
            };
        }
    },
    // 30. Car Depreciation Calculator
    {
        id: 'car-depreciation-calculator',
        name: 'Car Depreciation Calculator',
        category: 'engineering-physics',
        group: 'Automotive',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '18K',
        cpc: '$2.06',
        description: "A Car Depreciation Calculator estimates how vehicle value decreases over time. It helps buyers and sellers evaluate resale value and ownership costs. The calculator supports straight-line and percentage-based depreciation.",
        inputs: [
            { id: 'purchasePrice', name: 'Vehicle Purchase Price ($)', type: 'number', defaultValue: 38000, min: 1000, step: 1000, prefix: '$', tooltip: 'Original price.' },
            { id: 'ownershipYears', name: 'Years of Ownership', type: 'number', defaultValue: 5, min: 1, max: 10, step: 1, suffix: 'yrs', tooltip: 'Length of ownership.' },
            { id: 'vehicleCategory', name: 'Vehicle Category', type: 'dropdown', defaultValue: 'suv', options: [{ label: 'Pickup Truck (Retains Value Best - ~12%/yr)', value: 'truck' }, { label: 'Compact / Midsize SUV (~14%/yr)', value: 'suv' }, { label: 'Sedan / Hatchback (~15%/yr)', value: 'sedan' }, { label: 'Electric Vehicle EV (~18%/yr)', value: 'ev' }, { label: 'Luxury Brand (~20%/yr)', value: 'luxury' }], tooltip: 'Depreciation profile.' }
        ],
        naturalLanguageQueries: ["Calculate my car depreciation calculator", "What is my car depreciation calculator?", "Help me solve car depreciation calculator"],
        edgeCases: ["Depreciation above 100% Negative vehicle age Unrealistic mileage inputs"],
        calculate: (inputs) => {
            const price = Number(inputs.purchasePrice) || 38000;
            const years = Number(inputs.ownershipYears) || 5;
            const cat = String(inputs.vehicleCategory || 'suv');

            // Year 1 loss + subsequent annual decay rates
            let y1Drop = 0.20;
            let subRate = 0.13;
            if (cat === 'truck') { y1Drop = 0.16; subRate = 0.11; }
            else if (cat === 'sedan') { y1Drop = 0.22; subRate = 0.14; }
            else if (cat === 'ev') { y1Drop = 0.26; subRate = 0.16; }
            else if (cat === 'luxury') { y1Drop = 0.28; subRate = 0.18; }

            let value = price * (1 - y1Drop);
            for (let i = 2; i <= years; i++) {
                value *= (1 - subRate);
            }

            const totalDeprec = price - value;
            const retainedPercent = (value / price) * 100;
            const monthlyLoss = totalDeprec / (years * 12);

            return {
                primaryOutput: { label: 'Estimated Future Resale Value', value: `$${Math.round(value).toLocaleString()}`, suffix: `Year ${years} (${retainedPercent.toFixed(0)}% retained)` },
                secondaryMetrics: [
                    { label: 'Total Value Depreciated', value: `$${Math.round(totalDeprec).toLocaleString()}` },
                    { label: 'Average Monthly Depreciation Cost', value: `$${Math.round(monthlyLoss)} / month` },
                    { label: 'Cost per Mile (at 12,000 mi/yr)', value: `$${(totalDeprec / (years * 12000)).toFixed(2)} / mile` },
                    { label: 'Annual Depreciation Loss', value: `$${Math.round(totalDeprec / years).toLocaleString()} / year` }
                ]
            };
        }
    },
    // 31. Fuel Efficiency Calculator
    {
        id: 'fuel-efficiency-calculator',
        name: 'Fuel Efficiency Calculator',
        category: 'engineering-physics',
        group: 'Automotive',
        bucket: 'Bucket C1',
        tier: 2,
        phase: 2,
        monthlySearches: '22K',
        cpc: '$5.98  ★ HIGH CPC',
        description: "A Fuel Efficiency Calculator computes vehicle fuel economy and consumption. It helps drivers monitor fuel costs and compare vehicle efficiency. The calculator supports MPG and metric systems.",
        inputs: [
            { id: 'distanceDrivenMiles', name: 'Distance Driven (Miles)', type: 'number', defaultValue: 350, min: 1, step: 10, suffix: 'mi', tooltip: 'Trip distance.' },
            { id: 'fuelUsedGallons', name: 'Fuel Consumed (Gallons)', type: 'number', defaultValue: 11.2, min: 0.1, step: 0.1, suffix: 'gal', tooltip: 'Gallons pumped.' },
            { id: 'gasPricePerGal', name: 'Gas Price ($/Gallon)', type: 'number', defaultValue: 3.55, min: 0.5, step: 0.05, prefix: '$', tooltip: 'Fuel unit cost.' }
        ],
        naturalLanguageQueries: ["Calculate my fuel efficiency calculator", "What is my fuel efficiency calculator?", "Help me solve fuel efficiency calculator"],
        edgeCases: ["Zero division errors", "Invalid input formats", "Boundary conditions"],
        calculate: (inputs) => {
            const miles = Number(inputs.distanceDrivenMiles) || 350;
            const gal = Number(inputs.fuelUsedGallons) || 11.2;
            const price = Number(inputs.gasPricePerGal) || 3.55;

            const mpgUS = miles / gal;
            const lPer100Km = 235.215 / mpgUS;
            const kmPerL = mpgUS * 0.425144;
            const costPerMile = (gal * price) / miles;
            const annualCost15k = 15000 * costPerMile;

            return {
                primaryOutput: { label: 'Calculated Fuel Economy', value: `${mpgUS.toFixed(2)} MPG`, suffix: `${lPer100Km.toFixed(2)} L/100km` },
                secondaryMetrics: [
                    { label: 'Fuel Cost per Mile', value: `$${costPerMile.toFixed(3)} / mile` },
                    { label: 'Cost per 100 Miles', value: `$${(costPerMile * 100).toFixed(2)}` },
                    { label: 'Estimated Annual Gas Spend (15k mi)', value: `$${Math.round(annualCost15k).toLocaleString()} / year` },
                    { label: 'Metric Fuel Economy', value: `${kmPerL.toFixed(2)} km / Liter` }
                ]
            };
        }
    },
    // 32. EV Range Calculator
    {
        id: 'ev-range-calculator',
        name: 'EV Range Calculator',
        category: 'engineering-physics',
        group: 'Automotive',
        bucket: 'Bucket C1',
        tier: 5,
        phase: 4,
        monthlySearches: '590',
        cpc: '$3.19',
        description: "An EV Range Calculator estimates how far an electric vehicle can travel on a charge. It helps drivers plan trips and charging requirements. The calculator considers battery capacity, efficiency, and environmental conditions.",
        inputs: [
            { id: 'batteryKWh', name: 'Usable Battery Capacity (kWh)', type: 'number', defaultValue: 75, min: 20, max: 200, step: 1, suffix: 'kWh', tooltip: 'Net battery capacity.' },
            { id: 'epaRatedMPG', name: 'Rated Efficiency (Miles / kWh)', type: 'number', defaultValue: 3.6, min: 1.5, max: 6.0, step: 0.1, suffix: 'mi/kWh', tooltip: 'EPA efficiency.' },
            { id: 'ambientTemp', name: 'Outside Temperature (°F)', type: 'dropdown', defaultValue: 70, options: [{ label: 'Freezing / Winter Cold (20°F - 25% loss)', value: 20 }, { label: 'Chilly Autumn / Spring (45°F - 10% loss)', value: 45 }, { label: 'Ideal Moderate Temp (70°F - 0% loss)', value: 70 }, { label: 'Extreme Summer Heat (95°F - 8% loss)', value: 95 }], tooltip: 'Weather impact.' },
            { id: 'cruisingSpeed', name: 'Driving Style & Speed', type: 'dropdown', defaultValue: 65, options: [{ label: 'City / Stop-and-Go (35 MPH +15% range)', value: 35 }, { label: 'Mixed Commute (50 MPH 0% impact)', value: 50 }, { label: 'Standard Highway (65 MPH -10% range)', value: 65 }, { label: 'High Speed Interstate (75-80 MPH -22% range)', value: 75 }], tooltip: 'Aerodynamic speed drag.' }
        ],
        naturalLanguageQueries: ["Calculate my ev range calculator", "What is my ev range calculator?", "Help me solve ev range calculator"],
        edgeCases: ["Zero consumption values Negative battery capacity Extreme temperatures"],
        calculate: (inputs) => {
            const kwh = Number(inputs.batteryKWh) || 75;
            const baseEff = Number(inputs.epaRatedMPG) || 3.6;
            const temp = Number(inputs.ambientTemp) || 70;
            const speed = Number(inputs.cruisingSpeed) || 65;

            let tempMult = 1.0;
            if (temp <= 20) tempMult = 0.75;
            else if (temp <= 45) tempMult = 0.90;
            else if (temp >= 95) tempMult = 0.92;

            let speedMult = 1.0;
            if (speed === 35) speedMult = 1.15;
            else if (speed === 50) speedMult = 1.00;
            else if (speed === 65) speedMult = 0.90;
            else if (speed === 75) speedMult = 0.78;

            const realEfficiency = baseEff * tempMult * speedMult;
            const realRangeMiles = kwh * realEfficiency;
            const realRangeKm = realRangeMiles * 1.60934;
            const epaRange = kwh * baseEff;

            const costToChargeHome = kwh * 0.16;
            const costPerMile = costToChargeHome / realRangeMiles;

            return {
                primaryOutput: { label: 'Estimated Real-World Range', value: `${Math.round(realRangeMiles)} Miles`, suffix: `${Math.round(realRangeKm)} km` },
                secondaryMetrics: [
                    { label: 'Nominal EPA Rated Range', value: `${Math.round(epaRange)} Miles` },
                    { label: 'Real-World Energy Efficiency', value: `${realEfficiency.toFixed(2)} mi/kWh (${Math.round(1000 / realEfficiency)} Wh/mi)` },
                    { label: 'Cost to Fully Charge at Home ($0.16/kWh)', value: `$${costToChargeHome.toFixed(2)}` },
                    { label: 'Electricity Cost per Mile', value: `$${costPerMile.toFixed(3)} / mile` }
                ]
            };
        }
    },
    // 33. Towing Capacity Calculator
    {
        id: 'towing-capacity-calculator',
        name: 'Towing Capacity Calculator',
        category: 'engineering-physics',
        group: 'Automotive',
        bucket: 'Bucket C1',
        tier: 4,
        phase: 4,
        monthlySearches: '2K',
        cpc: '$2.65',
        description: "A Towing Capacity Calculator estimates safe towing limits for vehicles and trailers. It helps ensure compliance with safety and manufacturer specifications. The calculator considers payload, tongue weight, and gross combined weight ratings.",
        inputs: [
            { id: 'gcwrLbs', name: 'Gross Combined Weight Rating GCWR (lbs)', type: 'number', defaultValue: 14500, min: 2000, step: 250, suffix: 'lbs', tooltip: 'Vehicle door jamb GCWR.' },
            { id: 'gvwrLbs', name: 'Gross Vehicle Weight Rating GVWR (lbs)', type: 'number', defaultValue: 7100, min: 2000, step: 100, suffix: 'lbs', tooltip: 'Max allowable vehicle weight.' },
            { id: 'curbWeightLbs', name: 'Vehicle Curb Weight (lbs)', type: 'number', defaultValue: 5100, min: 1500, step: 100, suffix: 'lbs', tooltip: 'Unloaded vehicle weight.' },
            { id: 'passengersCargoLbs', name: 'Passengers + In-Truck Cargo (lbs)', type: 'number', defaultValue: 650, min: 100, step: 50, suffix: 'lbs', tooltip: 'Weight of occupants and bed gear.' },
            { id: 'trailerWeightLbs', name: 'Trailer Loaded Weight (lbs)', type: 'number', defaultValue: 6500, min: 500, step: 250, suffix: 'lbs', tooltip: 'Loaded trailer total weight.' }
        ],
        naturalLanguageQueries: ["Calculate my towing capacity calculator", "What is my towing capacity calculator?", "Help me solve towing capacity calculator"],
        edgeCases: ["Exceeding GVWR Negative trailer weights Missing GCWR data"],
        calculate: (inputs) => {
            const gcwr = Number(inputs.gcwrLbs) || 14500;
            const gvwr = Number(inputs.gvwrLbs) || 7100;
            const curb = Number(inputs.curbWeightLbs) || 5100;
            const cargo = Number(inputs.passengersCargoLbs) || 650;
            const trailer = Number(inputs.trailerWeightLbs) || 6500;

            const loadedTruckWeight = curb + cargo;
            const tongueWeight = trailer * 0.12; // 12% standard tongue weight
            const totalTruckWithTongue = loadedTruckWeight + tongueWeight;
            const totalCombinedWeight = loadedTruckWeight + trailer;

            const maxTowByGCWR = gcwr - loadedTruckWeight;
            const remainingPayload = gvwr - totalTruckWithTongue;
            const gcwrMargin = gcwr - totalCombinedWeight;

            const isSafe = totalTruckWithTongue <= gvwr && totalCombinedWeight <= gcwr;

            return {
                primaryOutput: { label: 'Max Safe Towing Capacity', value: `${Math.round(maxTowByGCWR).toLocaleString()} lbs`, suffix: isSafe ? 'SAFE' : 'OVERLOADED' },
                secondaryMetrics: [
                    { label: 'Estimated Tongue Weight (12%)', value: `${Math.round(tongueWeight)} lbs` },
                    { label: 'Remaining Payload Capacity', value: `${Math.round(remainingPayload).toLocaleString()} lbs (${remainingPayload >= 0 ? 'Within GVWR' : 'EXCEEDS GVWR' })` },
                    { label: 'Total Combined Rig Weight', value: `${Math.round(totalCombinedWeight).toLocaleString()} / ${gcwr.toLocaleString()} lbs GCWR` },
                    { label: 'Safety Compliance Verdict', value: isSafe ? 'PASS: Rig operates within both GVWR and GCWR ratings' : 'WARNING: Rig exceeds manufacturer weight safety limits' }
                ]
            };
        }
    },
    // 34. Golf Handicap Calculator
    {
        id: 'golf-handicap-calculator',
        name: 'Golf Handicap Calculator',
        category: 'engineering-physics',
        group: 'Sports',
        bucket: 'Bucket B',
        tier: 2,
        phase: 3,
        monthlySearches: '33K',
        cpc: '$2.64',
        description: "A Golf Handicap Calculator estimates a golfer\u2019s playing handicap based on score history and course difficulty. It helps standardize player ability across courses. The calculator follows USGA/WHS handicap principles.",
        inputs: [
            { id: 'adjustedGrossScore', name: '18-Hole Adjusted Gross Score', type: 'number', defaultValue: 85, min: 55, max: 150, step: 1, tooltip: 'Strokes played.' },
            { id: 'courseRating', name: 'Course Rating (e.g. 71.8)', type: 'number', defaultValue: 71.8, min: 60.0, max: 80.0, step: 0.1, tooltip: 'USGA Course rating.' },
            { id: 'slopeRating', name: 'Slope Rating (55 to 155)', type: 'number', defaultValue: 125, min: 55, max: 155, step: 1, tooltip: 'Course slope difficulty (113 is average).' },
            { id: 'pccAdjustment', name: 'Playing Conditions Calc (PCC)', type: 'dropdown', defaultValue: 0, options: [{ label: 'Normal Weather (0)', value: 0 }, { label: 'Tough Weather / High Winds (+1)', value: 1 }, { label: 'Extreme Weather Conditions (+2)', value: 2 }, { label: 'Easy Scoring Conditions (-1)', value: -1 }], tooltip: 'WHS daily conditions factor.' }
        ],
        naturalLanguageQueries: ["Calculate my golf handicap calculator", "What is my golf handicap calculator?", "Help me solve golf handicap calculator"],
        edgeCases: ["Insufficient score history Invalid slope ratings Extreme scores"],
        calculate: (inputs) => {
            const score = Number(inputs.adjustedGrossScore) || 85;
            const rating = Number(inputs.courseRating) || 71.8;
            const slope = Number(inputs.slopeRating) || 125;
            const pcc = Number(inputs.pccAdjustment) || 0;

            // WHS Score Differential = (113 / Slope) * (Score - CourseRating - PCC)
            const scoreDifferential = (113 / slope) * (score - rating - pcc);
            const courseHandicap = Math.round(scoreDifferential * (slope / 113) + (rating - 72));

            return {
                primaryOutput: { label: 'Score Differential', value: scoreDifferential.toFixed(1), suffix: `Handicap Round` },
                secondaryMetrics: [
                    { label: 'Estimated Course Handicap', value: `${courseHandicap} Strokes` },
                    { label: 'Net Score for Round (Par 72)', value: `${score - courseHandicap} Net Strokes` },
                    { label: 'Strokes Relative to Course Rating', value: `+${(score - rating).toFixed(1)} strokes` },
                    { label: 'Course Difficulty (Slope)', value: slope > 130 ? 'High Difficulty' : slope < 110 ? 'Mild / Forgiving' : 'Standard Difficulty' }
                ]
            };
        }
    },
    // 35. Batting Average Calculator
    {
        id: 'batting-average-calculator',
        name: 'Batting Average Calculator',
        category: 'engineering-physics',
        group: 'Sports',
        bucket: 'Bucket B',
        tier: 3,
        phase: 5,
        monthlySearches: '10K',
        cpc: '$0.04',
        description: "A Batting Average Calculator computes a baseball player's batting average. It helps evaluate offensive performance. The calculator follows official baseball statistics rules.",
        inputs: [
            { id: 'atBats', name: 'At Bats (AB)', type: 'number', defaultValue: 450, min: 1, step: 10, tooltip: 'Official at bats.' },
            { id: 'hits', name: 'Hits (H)', type: 'number', defaultValue: 125, min: 0, step: 5, tooltip: 'Total hits.' },
            { id: 'doubles', name: 'Doubles (2B)', type: 'number', defaultValue: 25, min: 0, step: 1, tooltip: 'Two-base hits.' },
            { id: 'triples', name: 'Triples (3B)', type: 'number', defaultValue: 3, min: 0, step: 1, tooltip: 'Three-base hits.' },
            { id: 'homeRuns', name: 'Home Runs (HR)', type: 'number', defaultValue: 20, min: 0, step: 1, tooltip: 'Four-base hits.' },
            { id: 'walks', name: 'Walks / Bases on Balls (BB)', type: 'number', defaultValue: 45, min: 0, step: 1, tooltip: 'Walks.' },
            { id: 'hitByPitch', name: 'Hit By Pitch (HBP)', type: 'number', defaultValue: 4, min: 0, step: 1, tooltip: 'HBP count.' },
            { id: 'sacFlies', name: 'Sacrifice Flies (SF)', type: 'number', defaultValue: 5, min: 0, step: 1, tooltip: 'Sac flies.' }
        ],
        naturalLanguageQueries: ["Calculate my batting average calculator", "What is my batting average calculator?", "Help me solve batting average calculator"],
        edgeCases: ["Zero at-bats Hits exceeding at-bats Negative statistics"],
        calculate: (inputs) => {
            const ab = Number(inputs.atBats) || 450;
            const h = Number(inputs.hits) || 125;
            const d = Number(inputs.doubles) || 25;
            const t = Number(inputs.triples) || 3;
            const hr = Number(inputs.homeRuns) || 20;
            const bb = Number(inputs.walks) || 45;
            const hbp = Number(inputs.hitByPitch) || 4;
            const sf = Number(inputs.sacFlies) || 5;

            const singles = Math.max(0, h - (d + t + hr));
            const ba = h / ab;
            const totalBases = singles + (2 * d) + (3 * t) + (4 * hr);
            const slg = totalBases / ab;
            const pa = ab + bb + hbp + sf;
            const obp = pa > 0 ? (h + bb + hbp) / pa : 0;
            const ops = obp + slg;

            const formatStat = (val: number) => val.toFixed(3).replace(/^0/, '');

            return {
                primaryOutput: { label: 'Batting Average (AVG / BA)', value: formatStat(ba), suffix: `OPS: ${formatStat(ops)}` },
                secondaryMetrics: [
                    { label: 'On-Base Percentage (OBP)', value: formatStat(obp) },
                    { label: 'Slugging Percentage (SLG)', value: formatStat(slg) },
                    { label: 'On-Base Plus Slugging (OPS)', value: formatStat(ops) },
                    { label: 'Total Bases (TB)', value: `${totalBases} Bases` }
                ]
            };
        }
    },
    // 36. ERA Calculator
    {
        id: 'era-calculator',
        name: 'ERA Calculator',
        category: 'engineering-physics',
        group: 'Sports',
        bucket: 'Bucket B',
        tier: 3,
        phase: 5,
        monthlySearches: '12K',
        cpc: '$0.07',
        description: "An ERA Calculator computes a baseball pitcher\u2019s earned run average. It helps evaluate pitching effectiveness. The calculator follows official MLB statistical standards.",
        inputs: [
            { id: 'earnedRuns', name: 'Earned Runs Allowed (ER)', type: 'number', defaultValue: 32, min: 0, step: 1, tooltip: 'Earned runs.' },
            { id: 'inningsPitched', name: 'Innings Pitched (IP) (e.g. 75.1)', type: 'number', defaultValue: 78.2, min: 0.1, step: 0.1, tooltip: 'Use .1 for 1/3, .2 for 2/3.' },
            { id: 'walksAllowed', name: 'Walks Allowed (BB)', type: 'number', defaultValue: 24, min: 0, step: 1, tooltip: 'Base on balls.' },
            { id: 'hitsAllowed', name: 'Hits Allowed (H)', type: 'number', defaultValue: 68, min: 0, step: 1, tooltip: 'Hits allowed.' },
            { id: 'regulationInnings', name: 'Regulation Game Length', type: 'dropdown', defaultValue: 9, options: [{ label: 'MLB / College / Adult (9 Innings)', value: 9 }, { label: 'Softball / High School / Little League (7 Innings)', value: 7 }], tooltip: 'Game length standard.' }
        ],
        naturalLanguageQueries: ["Calculate my era calculator", "What is my era calculator?", "Help me solve era calculator"],
        edgeCases: ["Zero innings pitched Negative earned runs Fractional inning parsing errors"],
        calculate: (inputs) => {
            const er = Number(inputs.earnedRuns) || 32;
            const rawIP = Number(inputs.inningsPitched) || 78.2;
            const bb = Number(inputs.walksAllowed) || 24;
            const h = Number(inputs.hitsAllowed) || 68;
            const reg = Number(inputs.regulationInnings) || 9;

            const wholeInnings = Math.floor(rawIP);
            const fractionalInning = (rawIP - wholeInnings) * 10;
            const trueIP = wholeInnings + (fractionalInning === 1 ? 1 / 3 : fractionalInning === 2 ? 2 / 3 : 0);

            const era = trueIP > 0 ? (er * reg) / trueIP : 0;
            const whip = trueIP > 0 ? (bb + h) / trueIP : 0;

            let tier = 'Average Pitching';
            if (era < 2.50) tier = 'Elite / Cy Young Candidate';
            else if (era < 3.50) tier = 'All-Star Caliber';
            else if (era < 4.25) tier = 'Solid Major League Starter';
            else if (era > 5.00) tier = 'High ERA / Replacement Level';

            return {
                primaryOutput: { label: 'Earned Run Average (ERA)', value: era.toFixed(2), suffix: `WHIP: ${whip.toFixed(2)}` },
                secondaryMetrics: [
                    { label: 'WHIP (Walks + Hits per Inning)', value: whip.toFixed(3) },
                    { label: 'Pitching Performance Rating', value: tier },
                    { label: 'Total Base Runners Allowed', value: `${bb + h} (${h} Hits, ${bb} Walks)` },
                    { label: 'Runs per 100 Innings', value: `${((er / trueIP) * 100).toFixed(1)} ER / 100 IP` }
                ]
            };
        }
    },
    // 37. Fantasy Sports Points Calculator
    {
        id: 'fantasy-sports-points-calculator',
        name: 'Fantasy Sports Points Calculator',
        category: 'engineering-physics',
        group: 'Sports',
        bucket: 'Bucket B',
        tier: 5,
        phase: 4,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "A Fantasy Sports Points Calculator computes fantasy-league scores based on player statistics and league scoring rules. It helps players evaluate performance and strategy. The calculator supports customizable scoring systems.",
        inputs: [
            { id: 'passingYards', name: 'Passing Yards', type: 'number', defaultValue: 285, min: 0, step: 10, suffix: 'yds', tooltip: 'Pass yards (25 yds = 1 pt).' },
            { id: 'passingTDs', name: 'Passing Touchdowns', type: 'number', defaultValue: 2, min: 0, step: 1, tooltip: '4 pts per Pass TD.' },
            { id: 'interceptions', name: 'Interceptions Thrown', type: 'number', defaultValue: 1, min: 0, step: 1, tooltip: '-2 pts per INT.' },
            { id: 'rushingYards', name: 'Rushing Yards', type: 'number', defaultValue: 45, min: 0, step: 5, suffix: 'yds', tooltip: '10 yds = 1 pt.' },
            { id: 'rushingTDs', name: 'Rushing Touchdowns', type: 'number', defaultValue: 1, min: 0, step: 1, tooltip: '6 pts per Rush TD.' },
            { id: 'receptions', name: 'Receptions (Catches)', type: 'number', defaultValue: 6, min: 0, step: 1, tooltip: 'PPR scoring.' },
            { id: 'receivingYards', name: 'Receiving Yards', type: 'number', defaultValue: 75, min: 0, step: 5, suffix: 'yds', tooltip: '10 yds = 1 pt.' },
            { id: 'receivingTDs', name: 'Receiving Touchdowns', type: 'number', defaultValue: 1, min: 0, step: 1, tooltip: '6 pts per Rec TD.' },
            { id: 'pprSetting', name: 'Scoring Format', type: 'dropdown', defaultValue: 1.0, options: [{ label: 'Full PPR (1.0 Point per Reception)', value: 1.0 }, { label: 'Half PPR (0.5 Points per Reception)', value: 0.5 }, { label: 'Standard / Non-PPR (0.0 PPR)', value: 0.0 }], tooltip: 'League PPR rule.' }
        ],
        naturalLanguageQueries: ["Calculate my fantasy sports points calculator", "What is my fantasy sports points calculator?", "Help me solve fantasy sports points calculator"],
        edgeCases: ["Missing scoring categories Negative statistics Duplicate scoring rules"],
        calculate: (inputs) => {
            const passYds = Number(inputs.passingYards) || 0;
            const passTD = Number(inputs.passingTDs) || 0;
            const intThrown = Number(inputs.interceptions) || 0;
            const rushYds = Number(inputs.rushingYards) || 0;
            const rushTD = Number(inputs.rushingTDs) || 0;
            const rec = Number(inputs.receptions) || 0;
            const recYds = Number(inputs.receivingYards) || 0;
            const recTD = Number(inputs.receivingTDs) || 0;
            const ppr = Number(inputs.pprSetting) ?? 1.0;

            const passPts = (passYds * 0.04) + (passTD * 4) - (intThrown * 2);
            const rushPts = (rushYds * 0.10) + (rushTD * 6);
            const recPts = (recYds * 0.10) + (recTD * 6) + (rec * ppr);

            const totalPoints = passPts + rushPts + recPts;
            const standardPoints = passPts + rushPts + (recYds * 0.10) + (recTD * 6);

            return {
                primaryOutput: { label: 'Total Fantasy Points', value: `${totalPoints.toFixed(2)} PTS`, suffix: `${ppr === 1.0 ? 'Full PPR' : ppr === 0.5 ? 'Half PPR' : 'Standard'}` },
                secondaryMetrics: [
                    { label: 'Standard (Non-PPR) Points', value: `${standardPoints.toFixed(2)} PTS` },
                    { label: 'Passing Production Points', value: `${passPts.toFixed(2)} PTS (${passYds} yds, ${passTD} TD)` },
                    { label: 'Rushing Production Points', value: `${rushPts.toFixed(2)} PTS (${rushYds} yds, ${rushTD} TD)` },
                    { label: 'Receiving Production Points', value: `${recPts.toFixed(2)} PTS (${rec} rec, ${recYds} yds)` }
                ]
            };
        }
    }
];

export const cat06ScienceEngineeringCalculators = scienceEngineeringCalculators;
export default scienceEngineeringCalculators;
