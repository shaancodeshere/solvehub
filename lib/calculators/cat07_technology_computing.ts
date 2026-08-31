import { CalculatorDefinition } from '../../types/calculator';

export const technologyComputingCalculators: CalculatorDefinition[] = [
    // 1. IPv4 Subnet & CIDR Calculator
    {
        id: 'ipv4-subnet-calculator',
        name: 'IPv4 Subnet & CIDR Calculator',
        category: 'technology-computing',
        group: '7A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '301K',
        cpc: '$0.85',
        description: 'Calculates network address, broadcast address, usable host IP ranges, and wildcard mask from an IP and CIDR prefix length.',
        inputs: [
            { id: 'ipAddress', name: 'IP Address', type: 'text', defaultValue: '192.168.1.1', tooltip: 'Dotted-decimal IPv4 address.' },
            {
                id: 'cidrPrefix', name: 'Subnet Mask / CIDR', type: 'dropdown', defaultValue: 24, options: [
                    { label: '/24 — 255.255.255.0 (254 Usable Hosts)', value: 24 },
                    { label: '/25 — 255.255.255.128 (126 Usable Hosts)', value: 25 },
                    { label: '/26 — 255.255.255.192 (62 Usable Hosts)', value: 26 },
                    { label: '/27 — 255.255.255.224 (30 Usable Hosts)', value: 27 },
                    { label: '/28 — 255.255.255.240 (14 Usable Hosts)', value: 28 },
                    { label: '/29 — 255.255.255.248 (6 Usable Hosts)', value: 29 },
                    { label: '/30 — 255.255.255.252 (2 Point-to-Point Hosts)', value: 30 },
                    { label: '/16 — 255.255.0.0 (65,534 Usable Hosts)', value: 16 }
                ], tooltip: 'CIDR prefix length.'
            }
        ],
        naturalLanguageQueries: [
            'CIDR subnet calculator',
            'How many usable hosts in slash 24?',
            'Calculate network and broadcast address'
        ],
        edgeCases: ['Invalid IP octet values', '/31 and /32 zero usable host boundaries'],
        calculate: (inputs) => {
            const rawIp = (inputs.ipAddress || '192.168.1.1').toString().trim();
            const prefix = Number(inputs.cidrPrefix) || 24;

            const octets = rawIp.split('.').map((o: string) => parseInt(o, 10));
            if (octets.length !== 4 || octets.some((n: number) => isNaN(n) || n < 0 || n > 255)) {
                return { primaryOutput: { label: 'Error', value: 'Invalid IPv4 Address Format' }, secondaryMetrics: [] };
            }

            // Convert IP to 32-bit unsigned integer
            const ipNum = ((octets[0] << 24) >>> 0) + ((octets[1] << 16) >>> 0) + ((octets[2] << 8) >>> 0) + (octets[3] >>> 0);
            const maskNum = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
            const wildcardNum = (~maskNum) >>> 0;

            const netNum = (ipNum & maskNum) >>> 0;
            const bcastNum = (netNum | wildcardNum) >>> 0;

            const numToIp = (num: number): string => [
                (num >>> 24) & 255,
                (num >>> 16) & 255,
                (num >>> 8) & 255,
                num & 255
            ].join('.');

            const totalAddresses = Math.pow(2, 32 - prefix);
            const usableHosts = Math.max(0, totalAddresses - 2);

            const firstUsable = numToIp(netNum + 1);
            const lastUsable = numToIp(bcastNum - 1);

            return {
                primaryOutput: { label: 'Usable Host Capacity', value: usableHosts.toLocaleString(), suffix: 'IPs' },
                secondaryMetrics: [
                    { label: 'Network Address', value: numToIp(netNum) },
                    { label: 'Broadcast Address', value: numToIp(bcastNum) },
                    { label: 'Subnet Mask', value: numToIp(maskNum) },
                    { label: 'Usable Range', value: `${firstUsable} — ${lastUsable}` },
                    { label: 'Wildcard Mask', value: numToIp(wildcardNum) }
                ]
            };
        }
    },

    // 2. Download & Data Transfer Time Calculator
    {
        id: 'download-time-calculator',
        name: 'Download & Data Transfer Time Calculator',
        category: 'technology-computing',
        group: '7A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '450K',
        cpc: '$0.50',
        description: 'Estimates file download and backup transfer duration across connection bandwidths (accounting for bit-to-byte conversion and network overhead).',
        inputs: [
            { id: 'fileSize', name: 'File Size', type: 'number', defaultValue: 50, min: 0.1, step: 1, tooltip: 'Size of file to transfer.' },
            {
                id: 'fileUnit', name: 'File Size Unit', type: 'dropdown', defaultValue: 'GB', options: [
                    { label: 'Megabytes (MB)', value: 'MB' },
                    { label: 'Gigabytes (GB)', value: 'GB' },
                    { label: 'Terabytes (TB)', value: 'TB' }
                ], tooltip: 'Data volume unit.'
            },
            { id: 'connectionSpeed', name: 'Connection Speed', type: 'number', defaultValue: 100, min: 0.5, step: 10, tooltip: 'Speed provided by ISP.' },
            {
                id: 'speedUnit', name: 'Speed Unit', type: 'dropdown', defaultValue: 'Mbps', options: [
                    { label: 'Megabits/sec (Mbps)', value: 'Mbps' },
                    { label: 'Gigabits/sec (Gbps)', value: 'Gbps' },
                    { label: 'Megabytes/sec (MB/s)', value: 'MBs' }
                ], tooltip: 'Bandwidth unit.'
            },
            {
                id: 'overheadPct', name: 'Network Protocol Overhead', type: 'dropdown', defaultValue: 10, options: [
                    { label: '0% (Theoretical Ideal)', value: 0 },
                    { label: '10% (Typical TCP/IP & Wi-Fi Loss)', value: 10 },
                    { label: '20% (Congested / High Latency)', value: 20 }
                ], tooltip: 'Real-world protocol overhead allowance.'
            }
        ],
        naturalLanguageQueries: [
            'How long to download 50GB at 100 Mbps?',
            'Download time calculator',
            'Data transfer speed estimator'
        ],
        edgeCases: ['Zero connection speed division guard'],
        calculate: (inputs) => {
            const sizeVal = Number(inputs.fileSize) || 50;
            const sizeUnit = inputs.fileUnit;
            const speedVal = Math.max(0.001, Number(inputs.connectionSpeed) || 100);
            const speedUnit = inputs.speedUnit;
            const overhead = (Number(inputs.overheadPct) || 10) / 100;

            // Convert file size to Megabits (Mb)
            let sizeInMB = sizeVal;
            if (sizeUnit === 'GB') sizeInMB = sizeVal * 1024;
            if (sizeUnit === 'TB') sizeInMB = sizeVal * 1024 * 1024;
            const sizeInMb = sizeInMB * 8; // 8 bits per byte

            // Convert speed to Mbps
            let speedInMbps = speedVal;
            if (speedUnit === 'Gbps') speedInMbps = speedVal * 1000;
            if (speedUnit === 'MBs') speedInMbps = speedVal * 8;

            const effectiveSpeed = speedInMbps * (1 - overhead);
            const secondsTotal = sizeInMb / effectiveSpeed;

            const hours = Math.floor(secondsTotal / 3600);
            const minutes = Math.floor((secondsTotal % 3600) / 60);
            const seconds = Math.round(secondsTotal % 60);

            let formatted = `${seconds} Seconds`;
            if (hours > 0) {
                formatted = `${hours}h ${minutes}m ${seconds}s`;
            } else if (minutes > 0) {
                formatted = `${minutes}m ${seconds}s`;
            }

            return {
                primaryOutput: { label: 'Estimated Download Time', value: formatted },
                secondaryMetrics: [
                    { label: 'Total Transfer Seconds', value: `${Math.round(secondsTotal).toLocaleString()}s` },
                    { label: 'Effective Transfer Throughput', value: `${(effectiveSpeed / 8).toFixed(1)} MB/s` },
                    { label: 'Total Bits Transferred', value: `${(sizeInMb / 1000).toFixed(1)} Gb` }
                ]
            };
        }
    },

    // 3. Binary vs. Decimal Storage Unit Converter
    {
        id: 'storage-converter',
        name: 'Storage Converter (GB vs. GiB)',
        category: 'technology-computing',
        group: '7A',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '90K',
        cpc: '$0.30',
        description: 'Explains hard drive capacity loss by converting decimal storage units (SI Base-10: GB/TB) into binary OS recognition units (IEC Base-2: GiB/TiB).',
        inputs: [
            { id: 'advertisedCapacity', name: 'Advertised Drive Capacity', type: 'number', defaultValue: 1, min: 0.1, step: 0.5, tooltip: 'Capacity on retail packaging.' },
            {
                id: 'unitScale', name: 'Capacity Scale', type: 'dropdown', defaultValue: 'TB', options: [
                    { label: 'Terabytes (TB)', value: 'TB' },
                    { label: 'Gigabytes (GB)', value: 'GB' }
                ], tooltip: 'Drive specification unit.'
            }
        ],
        naturalLanguageQueries: [
            'Why is my 1TB drive only 931 GB?',
            'Convert GB to GiB calculator',
            'Hard drive real usable capacity'
        ],
        edgeCases: ['Zero storage capacity'],
        calculate: (inputs) => {
            const cap = Number(inputs.advertisedCapacity) || 1;
            const unit = inputs.unitScale;

            // Base-10 bytes: 1 TB = 1,000,000,000,000 bytes
            const totalBytes = unit === 'TB' ? cap * 1e12 : cap * 1e9;

            // Base-2 binary gigabytes (GiB = 2^30 bytes = 1,073,741,824 bytes)
            const gib = totalBytes / Math.pow(1024, 3);
            // Base-2 binary terabytes (TiB = 2^40 bytes)
            const tib = totalBytes / Math.pow(1024, 4);

            const lostBytes = totalBytes * (1 - (gib / (unit === 'TB' ? cap * 1000 : cap)));

            return {
                primaryOutput: { label: 'Actual OS Usable Capacity', value: unit === 'TB' ? `${gib.toFixed(1)} GiB` : `${gib.toFixed(2)} GiB`, suffix: unit === 'TB' ? `(~${tib.toFixed(2)} TiB)` : '' },
                secondaryMetrics: [
                    { label: 'Advertised Decimal Bytes', value: `${totalBytes.toLocaleString()} Bytes` },
                    { label: 'Binary OS Reporting Delta', value: `~7.3% lower due to 1024 vs 1000 base` },
                    { label: 'Exact Usable Megabytes', value: `${Math.round(totalBytes / Math.pow(1024, 2)).toLocaleString()} MiB` }
                ]
            };
        }
    },

    // 4. Color Code HEX / RGB / HSL Converter
    {
        id: 'color-converter',
        name: 'Color Code Converter (HEX / RGB / HSL)',
        category: 'technology-computing',
        group: '7A',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '301K',
        cpc: '$0.35',
        description: 'Translates color representations across CSS HEX, RGB (Red, Green, Blue), and HSL (Hue, Saturation, Lightness) color spaces.',
        inputs: [
            { id: 'hexCode', name: 'HEX Color Code', type: 'text', defaultValue: '#10B981', tooltip: '6-character hexadecimal color string.' }
        ],
        naturalLanguageQueries: [
            'HEX to RGB converter',
            'Convert #10B981 to RGB and HSL',
            'CSS color space calculator'
        ],
        edgeCases: ['Invalid hex characters', 'Shorthand 3-digit hex strings'],
        calculate: (inputs) => {
            let hex = (inputs.hexCode || '#10B981').toString().trim().replace('#', '');
            if (hex.length === 3) {
                hex = hex.split('').map((c: string) => c + c).join('');
            }

            if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
                return { primaryOutput: { label: 'Error', value: 'Invalid 6-Digit HEX Code' }, secondaryMetrics: [] };
            }

            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);

            // Convert RGB to HSL
            const rNorm = r / 255;
            const gNorm = g / 255;
            const bNorm = b / 255;

            const max = Math.max(rNorm, gNorm, bNorm);
            const min = Math.min(rNorm, gNorm, bNorm);
            let h = 0;
            let s = 0;
            const l = (max + min) / 2;

            if (max !== min) {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
                    case gNorm: h = (bNorm - rNorm) / d + 2; break;
                    case bNorm: h = (rNorm - gNorm) / d + 4; break;
                }
                h /= 6;
            }

            const hDeg = Math.round(h * 360);
            const sPct = Math.round(s * 100);
            const lPct = Math.round(l * 100);

            return {
                primaryOutput: { label: 'CSS RGB Format', value: `rgb(${r}, ${g}, ${b})` },
                secondaryMetrics: [
                    { label: 'CSS HSL Format', value: `hsl(${hDeg}deg, ${sPct}%, ${lPct}%)` },
                    { label: 'Normalized RGB', value: `${(r / 255).toFixed(2)}, ${(g / 255).toFixed(2)}, ${(b / 255).toFixed(2)}` },
                    { label: 'Standardized HEX', value: `#${hex.toUpperCase()}` }
                ]
            };
        }
    },

    // 5. RAID Storage & Parity Overhead Calculator
    {
        id: 'raid-calculator',
        name: 'RAID Storage & Parity Calculator',
        category: 'technology-computing',
        group: '7A',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '80K',
        cpc: '$0.65',
        description: 'Calculates usable storage capacity, fault tolerance drive limits, and parity overhead for RAID 0, 1, 5, 6, and 10 disk arrays.',
        inputs: [
            {
                id: 'raidLevel', name: 'RAID Configuration Level', type: 'dropdown', defaultValue: 'raid5', options: [
                    { label: 'RAID 0 (Striping — 0 Fault Tolerance)', value: 'raid0' },
                    { label: 'RAID 1 (Mirroring — 1 Drive Tolerance)', value: 'raid1' },
                    { label: 'RAID 5 (Single Parity — Min 3 Disks)', value: 'raid5' },
                    { label: 'RAID 6 (Dual Parity — Min 4 Disks)', value: 'raid6' },
                    { label: 'RAID 10 (Striped Mirrors — Min 4 Even Disks)', value: 'raid10' }
                ], tooltip: 'Array architecture.'
            },
            { id: 'diskCount', name: 'Number of Disks', type: 'number', defaultValue: 4, min: 2, max: 24, step: 1, suffix: 'disks', tooltip: 'Total identical drives in array.' },
            { id: 'diskCapacityTb', name: 'Single Disk Capacity (TB)', type: 'number', defaultValue: 8, min: 0.5, step: 1, suffix: 'TB', tooltip: 'Storage per drive.' }
        ],
        naturalLanguageQueries: [
            'RAID 5 usable storage calculator',
            'RAID 6 vs RAID 10 capacity',
            'How much storage do I lose in RAID?'
        ],
        edgeCases: ['Disk count lower than required minimum for chosen RAID level'],
        calculate: (inputs) => {
            const level = inputs.raidLevel;
            const count = Number(inputs.diskCount) || 4;
            const cap = Number(inputs.diskCapacityTb) || 8;
            const rawCapacity = count * cap;

            let usable = 0;
            let parity = 0;
            let faultLimit = '';

            if (level === 'raid0') {
                usable = rawCapacity;
                parity = 0;
                faultLimit = '0 Disks (Any failure causes complete data loss)';
            } else if (level === 'raid1') {
                usable = cap;
                parity = rawCapacity - cap;
                faultLimit = `${count - 1} Disks`;
            } else if (level === 'raid5') {
                if (count < 3) {
                    return { primaryOutput: { label: 'Error', value: 'RAID 5 Requires Minimum 3 Disks' }, secondaryMetrics: [] };
                }
                usable = (count - 1) * cap;
                parity = cap;
                faultLimit = '1 Disk';
            } else if (level === 'raid6') {
                if (count < 4) {
                    return { primaryOutput: { label: 'Error', value: 'RAID 6 Requires Minimum 4 Disks' }, secondaryMetrics: [] };
                }
                usable = (count - 2) * cap;
                parity = 2 * cap;
                faultLimit = '2 Disks';
            } else if (level === 'raid10') {
                if (count < 4 || count % 2 !== 0) {
                    return { primaryOutput: { label: 'Error', value: 'RAID 10 Requires 4+ Even Disks' }, secondaryMetrics: [] };
                }
                usable = (count / 2) * cap;
                parity = (count / 2) * cap;
                faultLimit = '1 Disk per mirror set (Up to half of total disks)';
            }

            const efficiencyPct = (usable / rawCapacity) * 100;

            return {
                primaryOutput: { label: 'Usable Array Capacity', value: usable.toFixed(1), suffix: 'TB' },
                secondaryMetrics: [
                    { label: 'Storage Efficiency Ratio', value: `${efficiencyPct.toFixed(0)}% Usable` },
                    { label: 'Parity / Redundancy Reserve', value: `${parity.toFixed(1)} TB` },
                    { label: 'Fault Tolerance Tolerance Limit', value: faultLimit },
                    { label: 'Total Raw Unformatted Space', value: `${rawCapacity.toFixed(1)} TB` }
                ]
            };
        }
    }
];