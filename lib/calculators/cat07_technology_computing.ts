import { CalculatorDefinition } from '@/types/calculator';

export const technologyComputingCalculators: CalculatorDefinition[] = [
    // 1. IP Subnet Calculator
    {
        id: 'ip-subnet-calculator',
        name: 'IP Subnet Calculator',
        category: 'computer-science',
        group: 'Technology & Computing',
        bucket: 'Bucket B',
        tier: 2,
        phase: 3,
        monthlySearches: '60K',
        cpc: '$0.09',
        description: "IP Subnet Calculator tool.",
        inputs: [
            { id: 'ipAddress', name: 'IP Address (IPv4)', type: 'text', defaultValue: '192.168.1.50', tooltip: 'IPv4 address (e.g. 192.168.1.1).' },
            { id: 'cidrPrefix', name: 'Subnet CIDR Prefix', type: 'dropdown', defaultValue: 24, options: [{ label: '/8 (255.0.0.0 - 16.7M hosts)', value: 8 }, { label: '/16 (255.255.0.0 - 65,534 hosts)', value: 16 }, { label: '/24 (255.255.255.0 - 254 hosts)', value: 24 }, { label: '/25 (255.255.255.128 - 126 hosts)', value: 25 }, { label: '/26 (255.255.255.192 - 62 hosts)', value: 26 }, { label: '/27 (255.255.255.224 - 30 hosts)', value: 27 }, { label: '/28 (255.255.255.240 - 14 hosts)', value: 28 }, { label: '/29 (255.255.255.248 - 6 hosts)', value: 29 }, { label: '/30 (255.255.255.252 - 2 hosts Point-to-Point)', value: 30 }], tooltip: 'Subnet prefix.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const ipStr = String(inputs.ipAddress || '192.168.1.50').trim();
            const prefix = Number(inputs.cidrPrefix) || 24;

            const octets = ipStr.split('.').map(o => parseInt(o, 10) || 0);
            while (octets.length < 4) octets.push(0);

            const ipNum = ((octets[0] << 24) >>> 0) + ((octets[1] << 16) >>> 0) + ((octets[2] << 8) >>> 0) + (octets[3] >>> 0);
            const maskNum = prefix === 0 ? 0 : ((0xFFFFFFFF << (32 - prefix)) >>> 0);
            const netNum = (ipNum & maskNum) >>> 0;
            const broadcastNum = (netNum | (~maskNum >>> 0)) >>> 0;

            const numToIp = (num: number) => [
                (num >>> 24) & 255,
                (num >>> 16) & 255,
                (num >>> 8) & 255,
                num & 255
            ].join('.');

            const subnetMask = numToIp(maskNum);
            const wildcardMask = numToIp(~maskNum >>> 0);
            const netAddress = numToIp(netNum);
            const broadcastAddress = numToIp(broadcastNum);

            const firstHost = prefix <= 30 ? numToIp(netNum + 1) : netAddress;
            const lastHost = prefix <= 30 ? numToIp(broadcastNum - 1) : broadcastAddress;
            const usableHosts = prefix <= 30 ? Math.pow(2, 32 - prefix) - 2 : (prefix === 31 ? 2 : 1);

            let ipClass = 'Class C';
            if (octets[0] <= 127) ipClass = 'Class A';
            else if (octets[0] <= 191) ipClass = 'Class B';
            else if (octets[0] <= 223) ipClass = 'Class C';
            else if (octets[0] <= 239) ipClass = 'Class D (Multicast)';
            else ipClass = 'Class E (Experimental)';

            const isPrivate = (octets[0] === 10) ||
                (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
                (octets[0] === 192 && octets[1] === 168);

            return {
                primaryOutput: { label: 'Usable Host Range', value: `${firstHost} - ${lastHost}`, suffix: `${usableHosts.toLocaleString()} Usable Hosts` },
                secondaryMetrics: [
                    { label: 'Subnet Mask', value: `${subnetMask} (/${prefix})` },
                    { label: 'Network ID Address', value: netAddress },
                    { label: 'Broadcast Address', value: broadcastAddress },
                    { label: 'IP Scope & Classification', value: `${ipClass} (${isPrivate ? 'Private RFC1918' : 'Public Routable'})` }
                ]
            };
        }
    },
    // 2. Data Storage Converter
    {
        id: 'data-storage-converter',
        name: 'Data Storage Converter',
        category: 'computer-science',
        group: 'Technology & Computing',
        bucket: 'Bucket B',
        tier: 5,
        phase: 4,
        monthlySearches: '210',
        cpc: 'N/A',
        description: "Data Storage Converter tool.",
        inputs: [
            { id: 'storageValue', name: 'Storage Quantity', type: 'number', defaultValue: 1, min: 0.001, step: 1, tooltip: 'Amount of data.' },
            { id: 'unitFrom', name: 'Source Storage Unit', type: 'dropdown', defaultValue: 'TB', options: [{ label: 'Megabytes (MB - 10⁶)', value: 'MB' }, { label: 'Gigabytes (GB - 10⁹)', value: 'GB' }, { label: 'Terabytes (TB - 10¹²)', value: 'TB' }, { label: 'Petabytes (PB - 10¹⁵)', value: 'PB' }, { label: 'Gibibytes (GiB - 2³⁰)', value: 'GiB' }, { label: 'Tebibytes (TiB - 2⁴⁰)', value: 'TiB' }], tooltip: 'Unit to convert from.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const val = Number(inputs.storageValue) || 1;
            const unit = String(inputs.unitFrom || 'TB');

            let bytes = val;
            if (unit === 'MB') bytes = val * 1000000;
            else if (unit === 'GB') bytes = val * 1000000000;
            else if (unit === 'TB') bytes = val * 1000000000000;
            else if (unit === 'PB') bytes = val * 1000000000000000;
            else if (unit === 'GiB') bytes = val * 1073741824;
            else if (unit === 'TiB') bytes = val * 1099511627776;

            const gb = bytes / 1000000000;
            const tb = bytes / 1000000000000;
            const gib = bytes / 1073741824;
            const tib = bytes / 1099511627776;
            const photos12MP = Math.floor(bytes / (3.5 * 1024 * 1024));
            const movies4K = (bytes / (25 * 1073741824)).toFixed(1);

            return {
                primaryOutput: { label: 'Binary Storage (OS Standard)', value: `${tib.toFixed(3)} TiB`, suffix: `${gib.toFixed(1)} GiB` },
                secondaryMetrics: [
                    { label: 'Decimal Storage (Drive Manufacturers)', value: `${tb.toFixed(3)} TB (${gb.toFixed(1)} GB)` },
                    { label: 'Total Exact Bytes', value: `${Math.round(bytes).toLocaleString()} Bytes` },
                    { label: '12MP High-Res Photos Capacity', value: `~${photos12MP.toLocaleString()} Photos (@ 3.5 MB each)` },
                    { label: '4K UHD Movie Streams (~25 GB)', value: `~${movies4K} Full Movies` }
                ]
            };
        }
    },
    // 3. Download Time Calculator
    {
        id: 'download-time-calculator',
        name: 'Download Time Calculator',
        category: 'computer-science',
        group: 'Technology & Computing',
        bucket: 'Bucket B',
        tier: 2,
        phase: 3,
        monthlySearches: '27K',
        cpc: '$0.70',
        description: "Download Time Calculator tool.",
        inputs: [
            { id: 'fileSize', name: 'File / Game / Video Size', type: 'number', defaultValue: 60, min: 0.1, step: 5, tooltip: 'Size of file.' },
            { id: 'sizeUnit', name: 'File Size Unit', type: 'dropdown', defaultValue: 'GB', options: [{ label: 'Gigabytes (GB)', value: 'GB' }, { label: 'Megabytes (MB)', value: 'MB' }, { label: 'Terabytes (TB)', value: 'TB' }], tooltip: 'Unit.' },
            { id: 'speedMbps', name: 'Internet Download Speed (Mbps)', type: 'number', defaultValue: 100, min: 1, step: 25, suffix: 'Mbps', tooltip: 'Your bandwidth.' },
            { id: 'overheadPercent', name: 'Protocol TCP/IP Overhead (%)', type: 'number', defaultValue: 10, min: 0, max: 30, step: 1, suffix: '%', tooltip: 'Network overhead.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const size = Number(inputs.fileSize) || 60;
            const unit = String(inputs.sizeUnit || 'GB');
            const speed = Number(inputs.speedMbps) || 100;
            const overhead = Number(inputs.overheadPercent) || 10;

            let sizeMB = size;
            if (unit === 'GB') sizeMB = size * 1024;
            else if (unit === 'TB') sizeMB = size * 1024 * 1024;

            const megabits = sizeMB * 8;
            const effectiveMbps = speed * (1 - (overhead / 100));
            const totalSeconds = megabits / effectiveMbps;

            const h = Math.floor(totalSeconds / 3600);
            const m = Math.floor((totalSeconds % 3600) / 60);
            const s = Math.floor(totalSeconds % 60);

            const formatTime = (secs: number) => {
                const hrs = Math.floor(secs / 3600);
                const mins = Math.floor((secs % 3600) / 60);
                const sc = Math.floor(secs % 60);
                if (hrs > 0) return `${hrs}h ${mins}m ${sc}s`;
                if (mins > 0) return `${mins}m ${sc}s`;
                return `${sc} seconds`;
            };

            const gigabitSecs = megabits / (1000 * 0.90);
            const transferMBps = (effectiveMbps / 8).toFixed(1);

            return {
                primaryOutput: { label: 'Estimated Download Duration', value: formatTime(totalSeconds), suffix: `@ ${speed} Mbps` },
                secondaryMetrics: [
                    { label: 'Effective Transfer Speed', value: `${transferMBps} MB / second` },
                    { label: 'Time on Gigabit Fiber (1000 Mbps)', value: formatTime(gigabitSecs) },
                    { label: 'Time on 5G Mobile (300 Mbps)', value: formatTime(megabits / (300 * 0.90)) },
                    { label: 'Total Data Transferred (incl. overhead)', value: `${Math.round(sizeMB * (1 + overhead / 100)).toLocaleString()} MB` }
                ]
            };
        }
    },
    // 4. RGB to Hex Calculator
    {
        id: 'rgb-to-hex-calculator',
        name: 'RGB to Hex Calculator',
        category: 'computer-science',
        group: 'Technology & Computing',
        bucket: 'Bucket B',
        tier: 4,
        phase: 4,
        monthlySearches: '4K',
        cpc: '$0.02',
        description: "RGB to Hex Calculator tool.",
        inputs: [
            { id: 'red', name: 'Red Channel (R: 0-255)', type: 'number', defaultValue: 59, min: 0, max: 255, step: 1, tooltip: 'Red intensity.' },
            { id: 'green', name: 'Green Channel (G: 0-255)', type: 'number', defaultValue: 130, min: 0, max: 255, step: 1, tooltip: 'Green intensity.' },
            { id: 'blue', name: 'Blue Channel (B: 0-255)', type: 'number', defaultValue: 246, min: 0, max: 255, step: 1, tooltip: 'Blue intensity.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const r = Math.min(255, Math.max(0, Math.round(Number(inputs.red) || 0)));
            const g = Math.min(255, Math.max(0, Math.round(Number(inputs.green) || 0)));
            const b = Math.min(255, Math.max(0, Math.round(Number(inputs.blue) || 0)));

            const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
            const hexCode = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

            // HSL calculation
            const rNorm = r / 255;
            const gNorm = g / 255;
            const bNorm = b / 255;
            const max = Math.max(rNorm, gNorm, bNorm);
            const min = Math.min(rNorm, gNorm, bNorm);
            const l = (max + min) / 2;
            let h = 0, s = 0;

            if (max !== min) {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                if (max === rNorm) h = ((gNorm - bNorm) / d) + (gNorm < bNorm ? 6 : 0);
                else if (max === gNorm) h = ((bNorm - rNorm) / d) + 2;
                else h = ((rNorm - gNorm) / d) + 4;
                h *= 60;
            }

            const hslStr = `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
            const luminance = 0.2126 * rNorm + 0.7152 * gNorm + 0.0722 * bNorm;

            return {
                primaryOutput: { label: 'Hexadecimal Color Code', value: hexCode, suffix: hslStr },
                secondaryMetrics: [
                    { label: 'CSS RGB Format', value: `rgb(${r}, ${g}, ${b})` },
                    { label: 'CSS HSL Format', value: hslStr },
                    { label: 'Relative Perceived Luminance', value: `${(luminance * 100).toFixed(1)}% (${luminance > 0.5 ? 'Light color - use dark text' : 'Dark color - use white text'})` },
                    { label: 'CMYK Estimate', value: `C: ${Math.round((1 - rNorm - (1 - max)) / max * 100 || 0)}% M: ${Math.round((1 - gNorm - (1 - max)) / max * 100 || 0)}% Y: ${Math.round((1 - bNorm - (1 - max)) / max * 100 || 0)}% K: ${Math.round((1 - max) * 100)}%` }
                ]
            };
        }
    },
    // 5. Hex to RGB Calculator
    {
        id: 'hex-to-rgb-calculator',
        name: 'Hex to RGB Calculator',
        category: 'computer-science',
        group: 'Technology & Computing',
        bucket: 'Bucket B',
        tier: 4,
        phase: 4,
        monthlySearches: '3K',
        cpc: '$0.02',
        description: "Hex to RGB Calculator tool.",
        inputs: [
            { id: 'hexInput', name: 'Hex Color Code', type: 'text', defaultValue: '#3B82F6', tooltip: '6-character or 3-character hex (e.g. #3B82F6 or #FFF).' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            let hex = String(inputs.hexInput || '#3B82F6').trim().replace(/^#/, '');
            if (hex.length === 3) {
                hex = hex.split('').map(c => c + c).join('');
            }
            if (hex.length !== 6) hex = '3B82F6';

            const r = parseInt(hex.substring(0, 2), 16) || 0;
            const g = parseInt(hex.substring(2, 4), 16) || 0;
            const b = parseInt(hex.substring(4, 6), 16) || 0;

            const rgbStr = `rgb(${r}, ${g}, ${b})`;
            const rNorm = r / 255;
            const gNorm = g / 255;
            const bNorm = b / 255;

            const max = Math.max(rNorm, gNorm, bNorm);
            const min = Math.min(rNorm, gNorm, bNorm);
            const l = (max + min) / 2;
            let h = 0, s = 0;

            if (max !== min) {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                if (max === rNorm) h = ((gNorm - bNorm) / d) + (gNorm < bNorm ? 6 : 0);
                else if (max === gNorm) h = ((bNorm - rNorm) / d) + 2;
                else h = ((rNorm - gNorm) / d) + 4;
                h *= 60;
            }

            const hslStr = `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;

            return {
                primaryOutput: { label: 'RGB Values', value: `R: ${r}, G: ${g}, B: ${b}`, suffix: rgbStr },
                secondaryMetrics: [
                    { label: 'CSS Format', value: rgbStr },
                    { label: 'HSL Representation', value: hslStr },
                    { label: 'Normalized Decimals (0-1.0)', value: `r: ${rNorm.toFixed(3)}, g: ${gNorm.toFixed(3)}, b: ${bNorm.toFixed(3)}` },
                    { label: 'Contrast Pairing Recommendation', value: l > 0.5 ? 'Pair with Black / Dark Grey Text (#111827)' : 'Pair with White Text (#FFFFFF)' }
                ]
            };
        }
    },
    // 6. Aspect Ratio Calculator
    {
        id: 'aspect-ratio-calculator',
        name: 'Aspect Ratio Calculator',
        category: 'computer-science',
        group: 'Technology & Computing',
        bucket: 'Bucket B',
        tier: 2,
        phase: 3,
        monthlySearches: '50K',
        cpc: '$1.38',
        description: "Aspect Ratio Calculator tool.",
        inputs: [
            { id: 'originalWidth', name: 'Original Width (Pixels)', type: 'number', defaultValue: 1920, min: 1, step: 10, suffix: 'px', tooltip: 'Width dimension.' },
            { id: 'originalHeight', name: 'Original Height (Pixels)', type: 'number', defaultValue: 1080, min: 1, step: 10, suffix: 'px', tooltip: 'Height dimension.' },
            { id: 'newWidth', name: 'New Scaled Width (Pixels)', type: 'number', defaultValue: 1280, min: 1, step: 10, suffix: 'px', tooltip: 'Target width to scale.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const w = Number(inputs.originalWidth) || 1920;
            const h = Number(inputs.originalHeight) || 1080;
            const newW = Number(inputs.newWidth) || 1280;

            const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
            const divisor = gcd(w, h);
            const ratioW = w / divisor;
            const ratioH = h / divisor;

            const decimalRatio = w / h;
            const newH = Math.round(newW / decimalRatio);

            let name = 'Custom Ratio';
            if (ratioW === 16 && ratioH === 9) name = '16:9 (Standard Widescreen HD/4K)';
            else if (ratioW === 4 && ratioH === 3) name = '4:3 (Classic TV / Tablet)';
            else if (ratioW === 21 && ratioH === 9) name = '21:9 (Ultrawide Cinema)';
            else if (ratioW === 1 && ratioH === 1) name = '1:1 (Square / Instagram Post)';
            else if (ratioW === 9 && ratioH === 16) name = '9:16 (Vertical Video / TikTok / Reels)';

            return {
                primaryOutput: { label: 'Aspect Ratio', value: `${ratioW}:${ratioH}`, suffix: name },
                secondaryMetrics: [
                    { label: 'New Scaled Dimensions', value: `${newW} x ${newH} px` },
                    { label: 'Decimal Aspect Ratio', value: `${decimalRatio.toFixed(4)}:1` },
                    { label: 'Original Resolution', value: `${w} x ${h} px (${((w * h) / 1000000).toFixed(2)} MP)` },
                    { label: 'Standard Profile', value: name }
                ]
            };
        }
    },
    // 7. Screen Resolution Calculator
    {
        id: 'screen-resolution-calculator',
        name: 'Screen Resolution Calculator',
        category: 'computer-science',
        group: 'Technology & Computing',
        bucket: 'Bucket B',
        tier: 5,
        phase: 5,
        monthlySearches: '880',
        cpc: 'N/A',
        description: "Screen Resolution Calculator tool.",
        inputs: [
            { id: 'horizPixels', name: 'Horizontal Pixels', type: 'number', defaultValue: 3840, min: 100, step: 100, suffix: 'px', tooltip: 'Horizontal resolution.' },
            { id: 'vertPixels', name: 'Vertical Pixels', type: 'number', defaultValue: 2160, min: 100, step: 100, suffix: 'px', tooltip: 'Vertical resolution.' },
            { id: 'diagonalInches', name: 'Screen Diagonal (Inches)', type: 'number', defaultValue: 27, min: 1, max: 120, step: 0.5, suffix: 'in', tooltip: 'Monitor or TV size.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const w = Number(inputs.horizPixels) || 3840;
            const h = Number(inputs.vertPixels) || 2160;
            const diag = Number(inputs.diagonalInches) || 27;

            const totalPixels = w * h;
            const megapixels = totalPixels / 1000000;
            const ppi = Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2)) / diag;
            const dotPitchMm = 25.4 / ppi;

            // Optimal viewing distance for human 20/20 vision (1 arcminute resolving power)
            const optimalDistanceInches = (3438 / ppi);
            const optimalDistanceFeet = (optimalDistanceInches / 12).toFixed(1);

            return {
                primaryOutput: { label: 'Pixel Density (PPI)', value: `${Math.round(ppi)} PPI`, suffix: `${megapixels.toFixed(2)} Megapixels` },
                secondaryMetrics: [
                    { label: 'Total Display Pixels', value: `${totalPixels.toLocaleString()} Pixels` },
                    { label: 'Pixel Pitch (Dot Pitch)', value: `${dotPitchMm.toFixed(4)} mm` },
                    { label: 'Optimal Viewing Distance (20/20 vision)', value: `~${optimalDistanceFeet} ft (${Math.round(optimalDistanceInches)} inches)` },
                    { label: 'Retina Resolving Distance', value: ppi >= 200 ? 'Retina sharp at typical desk distances (> 17 inches)' : 'Standard desktop density' }
                ]
            };
        }
    },
    // 8. Server Uptime Calculator
    {
        id: 'server-uptime-calculator',
        name: 'Server Uptime Calculator',
        category: 'computer-science',
        group: 'Technology & Computing',
        bucket: 'Bucket B',
        tier: 5,
        phase: 5,
        monthlySearches: '20',
        cpc: '$3.89',
        description: "Server Uptime Calculator tool.",
        inputs: [
            { id: 'slaPercentage', name: 'Target SLA Uptime (%)', type: 'dropdown', defaultValue: 99.9, options: [{ label: '99% ("Two Nines")', value: 99.0 }, { label: '99.5% Uptime', value: 99.5 }, { label: '99.9% ("Three Nines")', value: 99.9 }, { label: '99.95% ("High Availability")', value: 99.95 }, { label: '99.99% ("Four Nines")', value: 99.99 }, { label: '99.999% ("Five Nines - Mission Critical")', value: 99.999 }], tooltip: 'SLA guarantee.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const uptime = Number(inputs.slaPercentage) || 99.9;
            const downtimeFraction = (100 - uptime) / 100;

            const formatSecs = (totalSecs: number) => {
                const days = Math.floor(totalSecs / 86400);
                const hrs = Math.floor((totalSecs % 86400) / 3600);
                const mins = Math.floor((totalSecs % 3600) / 60);
                const secs = (totalSecs % 60).toFixed(1);

                if (days > 0) return `${days}d ${hrs}h ${mins}m`;
                if (hrs > 0) return `${hrs}h ${mins}m ${Math.round(Number(secs))}s`;
                if (mins > 0) return `${mins}m ${secs}s`;
                return `${secs} seconds`;
            };

            const yearSecs = 365.25 * 86400 * downtimeFraction;
            const monthSecs = 30.42 * 86400 * downtimeFraction;
            const weekSecs = 7 * 86400 * downtimeFraction;
            const daySecs = 86400 * downtimeFraction;

            return {
                primaryOutput: { label: 'Allowed Downtime per Year', value: formatSecs(yearSecs), suffix: `${uptime}% SLA` },
                secondaryMetrics: [
                    { label: 'Allowed Downtime per Month', value: formatSecs(monthSecs) },
                    { label: 'Allowed Downtime per Week', value: formatSecs(weekSecs) },
                    { label: 'Allowed Downtime per Day', value: formatSecs(daySecs) },
                    { label: 'SLA Reliability Tier', value: uptime >= 99.999 ? 'Five-Nines Carrier Grade' : uptime >= 99.99 ? 'Four-Nines Enterprise' : uptime >= 99.9 ? 'Three-Nines Standard Cloud SLA' : 'Basic Hosting Tier' }
                ]
            };
        }
    },
    // 9. Hash Calculator
    {
        id: 'hash-calculator',
        name: 'Hash Calculator',
        category: 'computer-science',
        group: 'Technology & Computing',
        bucket: 'Bucket B',
        tier: 5,
        phase: 5,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "Hash Calculator tool.",
        inputs: [
            { id: 'algorithm', name: 'Cryptographic Hash Function', type: 'dropdown', defaultValue: 'sha256', options: [{ label: 'SHA-256 (256-bit Secure)', value: 'sha256' }, { label: 'SHA-512 (512-bit Secure)', value: 'sha512' }, { label: 'SHA-1 (160-bit Deprecated)', value: 'sha1' }, { label: 'MD5 (128-bit Broken / Insecure)', value: 'md5' }, { label: 'bcrypt / Argon2 (Adaptive Password Hash)', value: 'bcrypt' }], tooltip: 'Hash algorithm.' },
            { id: 'inputLengthChars', name: 'Input String Length (Characters)', type: 'number', defaultValue: 32, min: 1, max: 1000000, step: 8, tooltip: 'Length of input plaintext.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const algo = String(inputs.algorithm || 'sha256');
            const chars = Number(inputs.inputLengthChars) || 32;

            let digestBits = 256;
            let hexChars = 64;
            let security = 'SECURE (NIST Approved)';
            let collisionSpace = '2¹²⁸ operations (Infeasible to collide)';

            if (algo === 'sha512') {
                digestBits = 512;
                hexChars = 128;
                security = 'EXTREMELY SECURE (Military / Enterprise standard)';
                collisionSpace = '2²⁵⁶ operations';
            } else if (algo === 'sha1') {
                digestBits = 160;
                hexChars = 40;
                security = 'DEPRECATED (Theoretical collisions demonstrated)';
                collisionSpace = '2⁶³ operations (Vulnerable to state actors)';
            } else if (algo === 'md5') {
                digestBits = 128;
                hexChars = 32;
                security = 'BROKEN (Do NOT use for security/passwords)';
                collisionSpace = 'Instant collision generation via hashclash';
            } else if (algo === 'bcrypt') {
                digestBits = 184;
                hexChars = 60;
                security = 'OPTIMAL FOR PASSWORDS (Key stretching & salt built-in)';
                collisionSpace = 'Slow hash with tunable cost factor';
            }

            return {
                primaryOutput: { label: 'Hash Digest Length', value: `${hexChars} Hex Characters`, suffix: `${digestBits} Bits` },
                secondaryMetrics: [
                    { label: 'Security Classification', value: security },
                    { label: 'Collision Resistance Search Space', value: collisionSpace },
                    { label: 'Input Plaintext Payload', value: `${chars} Characters (${chars} Bytes ASCII)` },
                    { label: 'Primary Use Case', value: algo === 'bcrypt' ? 'User Password Storage & Authentication' : 'Digital Signatures, Blockchain, File Integrity' }
                ]
            };
        }
    },
    // 10. API Response Time Calculator
    {
        id: 'api-response-time-calculator',
        name: 'API Response Time Calculator',
        category: 'computer-science',
        group: 'Technology & Computing',
        bucket: 'Bucket B',
        tier: 5,
        phase: 5,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "API Response Time Calculator tool.",
        inputs: [
            { id: 'dnsTimeMs', name: 'DNS Lookup Latency (ms)', type: 'number', defaultValue: 15, min: 0, step: 5, suffix: 'ms', tooltip: 'DNS resolution time.' },
            { id: 'tcpTlsTimeMs', name: 'TCP + TLS Handshake (ms)', type: 'number', defaultValue: 45, min: 0, step: 5, suffix: 'ms', tooltip: 'Connection setup.' },
            { id: 'serverProcessingMs', name: 'Server Backend Processing (ms)', type: 'number', defaultValue: 85, min: 1, step: 10, suffix: 'ms', tooltip: 'DB & compute time.' },
            { id: 'contentTransferMs', name: 'Content Payload Download (ms)', type: 'number', defaultValue: 25, min: 1, step: 5, suffix: 'ms', tooltip: 'Transfer payload duration.' }
        ],
        naturalLanguageQueries: [],
        edgeCases: [],
        calculate: (inputs) => {
            const dns = Number(inputs.dnsTimeMs) || 15;
            const conn = Number(inputs.tcpTlsTimeMs) || 45;
            const server = Number(inputs.serverProcessingMs) || 85;
            const transfer = Number(inputs.contentTransferMs) || 25;

            const ttfb = dns + conn + server;
            const totalLatency = ttfb + transfer;

            let grade = 'A+ (Lightning Fast < 100ms)';
            if (totalLatency > 1000) grade = 'F (Severely Sluggish > 1000ms)';
            else if (totalLatency > 500) grade = 'D (Slow - Needs Optimization > 500ms)';
            else if (totalLatency > 250) grade = 'C (Average Web Service 250-500ms)';
            else if (totalLatency > 150) grade = 'B (Good Performance 150-250ms)';

            const maxThroughputRPS = Math.round(1000 / (server || 1));

            return {
                primaryOutput: { label: 'Total API Response Latency', value: `${totalLatency} ms`, suffix: grade.split(' ')[0] },
                secondaryMetrics: [
                    { label: 'Time to First Byte (TTFB)', value: `${ttfb} ms` },
                    { label: 'Server Compute Duration', value: `${server} ms (${Math.round((server / totalLatency) * 100)}% of total)` },
                    { label: 'Network Transit Overhead', value: `${dns + conn + transfer} ms (${Math.round(((dns + conn + transfer) / totalLatency) * 100)}% of total)` },
                    { label: 'Performance Tier Rating', value: grade }
                ]
            };
        }
    }
];

export const cat07TechnologyCalculators = technologyComputingCalculators;
export default technologyComputingCalculators;
