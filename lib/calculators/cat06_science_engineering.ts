import { CalculatorDefinition } from '../../types/calculator';

export const scienceEngineeringCalculators: CalculatorDefinition[] = [
    // 1. Ohm's Law & DC Power Calculator
    {
        id: 'ohms-law-calculator',
        name: "Ohm's Law & Electrical Power Calculator",
        category: 'science-engineering',
        group: '6A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '450K',
        cpc: '$0.40',
        description: "Solves voltage (V), current (I), resistance (R), and electric power (P) across DC circuits using Ohm's law and Joule's law.",
        inputs: [
            {
                id: 'knownPair', name: 'Known Variable Pair', type: 'dropdown', defaultValue: 'vi', options: [
                    { label: 'Voltage (V) & Current (I)', value: 'vi' },
                    { label: 'Voltage (V) & Resistance (R)', value: 'vr' },
                    { label: 'Current (I) & Resistance (R)', value: 'ir' },
                    { label: 'Power (P) & Voltage (V)', value: 'pv' }
                ], tooltip: 'Select the two known electrical values.'
            },
            { id: 'param1', name: 'First Value', type: 'number', defaultValue: 12, step: 0.1, tooltip: 'First variable magnitude.' },
            { id: 'param2', name: 'Second Value', type: 'number', defaultValue: 2, step: 0.1, tooltip: 'Second variable magnitude.' }
        ],
        naturalLanguageQueries: [
            'Ohms law calculator',
            'Calculate wattage from volts and amps',
            'Resistance formula V over I'
        ],
        edgeCases: ['Zero resistance short circuit condition', 'Zero current open circuit'],
        calculate: (inputs) => {
            const mode = inputs.knownPair;
            const v1 = Number(inputs.param1) || 0;
            const v2 = Number(inputs.param2) || 0;

            let v = 0;
            let i = 0;
            let r = 0;
            let p = 0;

            if (mode === 'vi') {
                // v1 = V, v2 = I
                v = v1;
                i = v2;
                r = i !== 0 ? v / i : 0;
                p = v * i;
            } else if (mode === 'vr') {
                // v1 = V, v2 = R
                v = v1;
                r = v2;
                i = r !== 0 ? v / r : 0;
                p = r !== 0 ? (v * v) / r : 0;
            } else if (mode === 'ir') {
                // v1 = I, v2 = R
                i = v1;
                r = v2;
                v = i * r;
                p = (i * i) * r;
            } else {
                // mode === 'pv' -> v1 = P, v2 = V
                p = v1;
                v = v2;
                i = v !== 0 ? p / v : 0;
                r = (v !== 0 && i !== 0) ? (v * v) / p : 0;
            }

            return {
                primaryOutput: { label: 'Electrical Power Dissipated', value: p.toFixed(2), suffix: 'Watts (W)' },
                secondaryMetrics: [
                    { label: 'Voltage Potential (V)', value: `${v.toFixed(2)} Volts` },
                    { label: 'Current Flow (I)', value: `${i.toFixed(3)} Amperes (A)` },
                    { label: 'Resistance (R)', value: `${r.toFixed(2)} Ohms (Ω)` },
                    { label: 'Milliwatt Equivalent', value: `${(p * 1000).toFixed(0)} mW` }
                ]
            };
        }
    },

    // 2. Kinetic & Gravitational Potential Energy Calculator
    {
        id: 'kinetic-energy-calculator',
        name: 'Kinetic & Potential Energy Calculator',
        category: 'science-engineering',
        group: '6A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '165K',
        cpc: '$0.30',
        description: 'Computes kinetic energy (0.5mv²), gravitational potential energy (mgh), and mechanical velocity in Joules.',
        inputs: [
            { id: 'massKg', name: 'Object Mass (kg)', type: 'number', defaultValue: 15, min: 0.001, step: 0.5, suffix: 'kg', tooltip: 'Mass in kilograms.' },
            { id: 'velocityMs', name: 'Velocity (m/s)', type: 'number', defaultValue: 10, min: 0, step: 0.5, suffix: 'm/s', tooltip: 'Velocity in meters per second.' },
            { id: 'heightM', name: 'Height Elevation (Meters)', type: 'number', defaultValue: 5, min: 0, step: 0.5, suffix: 'm', tooltip: 'Elevation above datum.' }
        ],
        naturalLanguageQueries: [
            'Kinetic energy calculator',
            'Potential energy formula mgh',
            'Calculate Joules from mass and speed'
        ],
        edgeCases: ['Zero mass or velocity'],
        calculate: (inputs) => {
            const m = Number(inputs.massKg) || 15;
            const v = Number(inputs.velocityMs) || 10;
            const h = Number(inputs.heightM) || 5;
            const g = 9.80665; // Earth gravity constant

            // KE = 1/2 * m * v^2
            const ke = 0.5 * m * (v * v);
            // PE = m * g * h
            const pe = m * g * h;
            const totalMechanicalEnergy = ke + pe;

            return {
                primaryOutput: { label: 'Kinetic Energy (KE)', value: ke.toFixed(2), suffix: 'Joules (J)' },
                secondaryMetrics: [
                    { label: 'Gravitational Potential Energy (PE)', value: `${pe.toFixed(2)} Joules (J)` },
                    { label: 'Total Mechanical Energy (E)', value: `${totalMechanicalEnergy.toFixed(2)} Joules` },
                    { label: 'Speed Equivalent (km/h)', value: `${(v * 3.6).toFixed(1)} km/h` },
                    { label: 'Speed Equivalent (mph)', value: `${(v * 2.23694).toFixed(1)} mph` }
                ]
            };
        }
    },

    // 3. Ideal Gas Law Calculator (PV = nRT)
    {
        id: 'ideal-gas-law-calculator',
        name: 'Ideal Gas Law Calculator (PV = nRT)',
        category: 'science-engineering',
        group: '6A',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '90K',
        cpc: '$0.35',
        description: 'Solves pressure, volume, moles, or thermodynamic temperature for an ideal gas with the universal gas constant R.',
        inputs: [
            {
                id: 'solveFor', name: 'Solve For Variable', type: 'dropdown', defaultValue: 'p', options: [
                    { label: 'Pressure (P) in atmospheres (atm)', value: 'p' },
                    { label: 'Volume (V) in liters (L)', value: 'v' },
                    { label: 'Quantity (n) in moles', value: 'n' }
                ], tooltip: 'Variable to isolate.'
            },
            { id: 'molesN', name: 'Substance Amount (n)', type: 'number', defaultValue: 2.5, min: 0.01, step: 0.1, suffix: 'mol', tooltip: 'Number of moles.' },
            { id: 'tempKelvin', name: 'Temperature in Kelvin (K)', type: 'number', defaultValue: 298.15, min: 1, step: 1, suffix: 'K', tooltip: 'Absolute temperature (273.15 K = 0°C).' },
            { id: 'volumeLiters', name: 'Volume (Liters)', type: 'number', defaultValue: 10, min: 0.1, step: 0.5, suffix: 'L', tooltip: 'Container volume in liters.' }
        ],
        naturalLanguageQueries: [
            'PV nRT calculator',
            'Ideal gas law solve for pressure',
            'Calculate volume of gas at Kelvin'
        ],
        edgeCases: ['Zero Kelvin (absolute zero division guard)', 'Zero volume'],
        calculate: (inputs) => {
            const mode = inputs.solveFor;
            const n = Number(inputs.molesN) || 2.5;
            const t = Number(inputs.tempKelvin) || 298.15;
            const v = Number(inputs.volumeLiters) || 10;
            const R = 0.082057; // L·atm/(mol·K)

            if (mode === 'p') {
                const pressureAtm = (n * R * t) / Math.max(0.001, v);
                const pressureKpa = pressureAtm * 101.325;
                return {
                    primaryOutput: { label: 'Calculated Gas Pressure', value: pressureAtm.toFixed(3), suffix: 'atm' },
                    secondaryMetrics: [
                        { label: 'Pressure in Kilopascals (kPa)', value: `${pressureKpa.toFixed(2)} kPa` },
                        { label: 'Pressure in Bar', value: `${(pressureAtm * 1.01325).toFixed(3)} bar` },
                        { label: 'Temperature Equivalent', value: `${(t - 273.15).toFixed(1)} °C` }
                    ]
                };
            } else if (mode === 'v') {
                const pAtm = 1.0; // 1 atm standard baseline
                const volL = (n * R * t) / pAtm;
                return {
                    primaryOutput: { label: 'Gas Volume (at 1 atm)', value: volL.toFixed(2), suffix: 'Liters' },
                    secondaryMetrics: [
                        { label: 'Cubic Meters Equivalent', value: `${(volL / 1000).toFixed(4)} m³` },
                        { label: 'Molar Volume', value: `${(volL / n).toFixed(2)} L/mol` }
                    ]
                };
            } else {
                const pAtm = 1.0;
                const moles = (pAtm * v) / (R * t);
                return {
                    primaryOutput: { label: 'Molar Quantity (n)', value: moles.toFixed(4), suffix: 'moles' },
                    secondaryMetrics: [
                        { label: 'Molecules (Avogadro)', value: `${(moles * 6.022e23).toExponential(3)} molecules` }
                    ]
                };
            }
        }
    },

    // 4. Reynolds Number (Fluid Mechanics Flow Regime)
    {
        id: 'reynolds-number-calculator',
        name: 'Reynolds Number Fluid Flow Calculator',
        category: 'science-engineering',
        group: '6A',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '60K',
        cpc: '$0.45',
        description: 'Determines laminar, transitional, or turbulent flow regimes for internal pipe and channel fluid dynamics.',
        inputs: [
            { id: 'fluidDensity', name: 'Fluid Density (kg/m³)', type: 'number', defaultValue: 1000, min: 1, step: 10, suffix: 'kg/m³', tooltip: 'Water is ~1000 kg/m³.' },
            { id: 'flowVelocity', name: 'Flow Velocity (m/s)', type: 'number', defaultValue: 1.5, min: 0.01, step: 0.1, suffix: 'm/s', tooltip: 'Mean fluid velocity.' },
            { id: 'pipeDiameter', name: 'Internal Pipe Diameter (m)', type: 'number', defaultValue: 0.05, min: 0.001, step: 0.005, suffix: 'm', tooltip: 'Hydraulic diameter (0.05 m = 50 mm).' },
            { id: 'dynamicViscosity', name: 'Dynamic Viscosity (Pa·s)', type: 'number', defaultValue: 0.001, min: 0.00001, step: 0.0001, suffix: 'Pa·s', tooltip: 'Water at 20°C is ~0.001 Pa·s.' }
        ],
        naturalLanguageQueries: [
            'Reynolds number calculator',
            'Laminar vs turbulent flow calculation',
            'Re formula fluid dynamics'
        ],
        edgeCases: ['Viscosity zero division guard'],
        calculate: (inputs) => {
            const rho = Number(inputs.fluidDensity) || 1000;
            const v = Number(inputs.flowVelocity) || 1.5;
            const d = Number(inputs.pipeDiameter) || 0.05;
            const mu = Math.max(0.0000001, Number(inputs.dynamicViscosity) || 0.001);

            // Re = (rho * v * d) / mu
            const re = (rho * v * d) / mu;

            let regime = 'Laminar Flow (Re < 2300)';
            if (re >= 2300 && re <= 4000) {
                regime = 'Transitional Flow (2300 ≤ Re ≤ 4000)';
            } else if (re > 4000) {
                regime = 'Turbulent Flow (Re > 4000)';
            }

            return {
                primaryOutput: { label: 'Reynolds Number (Re)', value: Math.round(re).toLocaleString(), suffix: '(Dimensionless)' },
                secondaryMetrics: [
                    { label: 'Flow Regime Classification', value: regime },
                    { label: 'Kinematic Viscosity (ν)', value: `${(mu / rho).toExponential(4)} m²/s` },
                    { label: 'Pipe Cross-Section Area', value: `${(Math.PI * Math.pow(d / 2, 2)).toFixed(5)} m²` }
                ]
            };
        }
    },

    // 5. Projectile Motion Trajectory Calculator
    {
        id: 'projectile-motion-calculator',
        name: 'Projectile Motion Trajectory Calculator',
        category: 'science-engineering',
        group: '6A',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '110K',
        cpc: '$0.30',
        description: 'Calculates flight time, maximum apogee height, and total horizontal range for parabolic projectile launches.',
        inputs: [
            { id: 'initialVelocity', name: 'Launch Velocity (v₀)', type: 'number', defaultValue: 25, min: 1, step: 1, suffix: 'm/s', tooltip: 'Initial speed.' },
            { id: 'launchAngleDeg', name: 'Launch Angle (Degrees)', type: 'number', defaultValue: 45, min: 1, max: 89, step: 1, suffix: '°', tooltip: 'Angle above horizontal (45° gives maximum range).' },
            { id: 'initialHeight', name: 'Initial Launch Height (y₀)', type: 'number', defaultValue: 0, min: 0, step: 0.5, suffix: 'm', tooltip: 'Starting elevation.' }
        ],
        naturalLanguageQueries: [
            'Projectile motion calculator',
            'Calculate range of projectile launched at angle',
            'Flight time and maximum height formula'
        ],
        edgeCases: ['90-degree launch (straight up vertical motion)'],
        calculate: (inputs) => {
            const v0 = Number(inputs.initialVelocity) || 25;
            const thetaDeg = Number(inputs.launchAngleDeg) || 45;
            const y0 = Number(inputs.initialHeight) || 0;
            const g = 9.80665;

            const rad = (thetaDeg * Math.PI) / 180;
            const v0x = v0 * Math.cos(rad);
            const v0y = v0 * Math.sin(rad);

            // Max height: y0 + (v0y^2) / (2 * g)
            const hMax = y0 + (Math.pow(v0y, 2) / (2 * g));

            // Flight time: solving y0 + v0y*t - 0.5*g*t^2 = 0
            const discriminant = (v0y * v0y) + (2 * g * y0);
            const flightTime = (v0y + Math.sqrt(discriminant)) / g;

            // Range: v0x * flightTime
            const totalRange = v0x * flightTime;

            return {
                primaryOutput: { label: 'Total Horizontal Range', value: totalRange.toFixed(2), suffix: 'Meters' },
                secondaryMetrics: [
                    { label: 'Maximum Apogee Height', value: `${hMax.toFixed(2)} Meters` },
                    { label: 'Total Flight Hangtime', value: `${flightTime.toFixed(2)} Seconds` },
                    { label: 'Initial Horizontal Velocity (vₓ)', value: `${v0x.toFixed(2)} m/s` },
                    { label: 'Initial Vertical Velocity (vᵧ)', value: `${v0y.toFixed(2)} m/s` }
                ]
            };
        }
    },

    // 6. Resistor 4-Band Color Code Calculator
    {
        id: 'resistor-color-code-calculator',
        name: '4-Band Resistor Color Code Calculator',
        category: 'science-engineering',
        group: '6A',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '201K',
        cpc: '$0.35',
        description: 'Decodes electronic resistor color bands into nominal resistance values (Ohms, kΩ, MΩ) and tolerance percentages.',
        inputs: [
            {
                id: 'band1', name: '1st Band (1st Digit)', type: 'dropdown', defaultValue: '4', options: [
                    { label: 'Brown (1)', value: '1' },
                    { label: 'Red (2)', value: '2' },
                    { label: 'Orange (3)', value: '3' },
                    { label: 'Yellow (4)', value: '4' },
                    { label: 'Green (5)', value: '5' },
                    { label: 'Blue (6)', value: '6' }
                ], tooltip: 'First significant digit.'
            },
            {
                id: 'band2', name: '2nd Band (2nd Digit)', type: 'dropdown', defaultValue: '7', options: [
                    { label: 'Black (0)', value: '0' },
                    { label: 'Brown (1)', value: '1' },
                    { label: 'Red (2)', value: '2' },
                    { label: 'Green (5)', value: '5' },
                    { label: 'Violet (7)', value: '7' },
                    { label: 'Gray (8)', value: '8' }
                ], tooltip: 'Second significant digit.'
            },
            {
                id: 'band3', name: '3rd Band (Multiplier)', type: 'dropdown', defaultValue: '100', options: [
                    { label: 'Black (×1 Ω)', value: '1' },
                    { label: 'Brown (×10 Ω)', value: '10' },
                    { label: 'Red (×100 Ω)', value: '100' },
                    { label: 'Orange (×1,000 Ω / 1k)', value: '1000' },
                    { label: 'Yellow (×10,000 Ω / 10k)', value: '10000' },
                    { label: 'Green (×100,000 Ω / 100k)', value: '100000' }
                ], tooltip: 'Decimal multiplier.'
            },
            {
                id: 'band4', name: '4th Band (Tolerance)', type: 'dropdown', defaultValue: '5', options: [
                    { label: 'Gold (±5%)', value: '5' },
                    { label: 'Silver (±10%)', value: '10' },
                    { label: 'Brown (±1%)', value: '1' },
                    { label: 'Red (±2%)', value: '2' }
                ], tooltip: 'Manufacturing tolerance.'
            }
        ],
        naturalLanguageQueries: [
            'Resistor color code calculator',
            'Yellow violet red gold resistor value',
            'Decode 4 band resistor'
        ],
        edgeCases: ['Multiplier values extending to megaohm ranges'],
        calculate: (inputs) => {
            const b1 = inputs.band1 || '4';
            const b2 = inputs.band2 || '7';
            const multiplier = Number(inputs.band3) || 100;
            const tolPct = Number(inputs.band4) || 5;

            const baseDigits = parseInt(`${b1}${b2}`, 10);
            const resistanceOhms = baseDigits * multiplier;

            let displayStr = `${resistanceOhms} Ω`;
            if (resistanceOhms >= 1000000) {
                displayStr = `${(resistanceOhms / 1000000).toFixed(2)} MΩ`;
            } else if (resistanceOhms >= 1000) {
                displayStr = `${(resistanceOhms / 1000).toFixed(1)} kΩ`;
            }

            const minR = resistanceOhms * (1 - (tolPct / 100));
            const maxR = resistanceOhms * (1 + (tolPct / 100));

            return {
                primaryOutput: { label: 'Nominal Resistance', value: displayStr, suffix: `±${tolPct}%` },
                secondaryMetrics: [
                    { label: 'Exact Resistance in Ohms', value: `${resistanceOhms.toLocaleString()} Ω` },
                    { label: 'Tolerance Range (Min - Max)', value: `${minR.toFixed(1)} Ω to ${maxR.toFixed(1)} Ω` },
                    { label: 'Tolerance Margin (±Δ)', value: `±${(resistanceOhms * (tolPct / 100)).toFixed(1)} Ω` }
                ]
            };
        }
    }
];