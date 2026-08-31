import { CalculatorDefinition } from '../../types/calculator';

export const dateTimeProductivityCalculators: CalculatorDefinition[] = [
    // 1. Date Difference / Days Between Dates Calculator
    {
        id: 'date-difference-calculator',
        name: 'Days Between Dates Calculator',
        category: 'date-time-productivity',
        group: '4A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '823K',
        cpc: '$0.35',
        description: 'Calculates the exact duration between two calendar dates in total days, weeks, months, and calendar years.',
        inputs: [
            { id: 'startDate', name: 'Start Date', type: 'date', defaultValue: '2026-01-01', tooltip: 'Beginning date.' },
            { id: 'endDate', name: 'End Date', type: 'date', defaultValue: '2026-12-31', tooltip: 'Target completion date.' },
            {
                id: 'includeEndDay', name: 'Include End Date in Count (+1 Day)', type: 'dropdown', defaultValue: 'no', options: [
                    { label: 'Exclude End Date', value: 'no' },
                    { label: 'Include End Date', value: 'yes' }
                ], tooltip: 'Whether the final date is counted as a full elapsed day.'
            }
        ],
        naturalLanguageQueries: [
            'How many days between two dates?',
            'Days between Jan 1 and Dec 31',
            'Calendar days calculator'
        ],
        edgeCases: ['End date earlier than start date', 'Leap year duration calculations'],
        calculate: (inputs) => {
            const start = new Date(inputs.startDate || '2026-01-01');
            const end = new Date(inputs.endDate || '2026-12-31');
            const includeEnd = inputs.includeEndDay === 'yes';

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return { primaryOutput: { label: 'Error', value: 'Invalid Date Selection' }, secondaryMetrics: [] };
            }

            const diffMs = end.getTime() - start.getTime();
            let totalDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
            if (includeEnd && totalDays >= 0) totalDays += 1;

            const absDays = Math.abs(totalDays);
            const weeks = Math.floor(absDays / 7);
            const remDays = absDays % 7;
            const hours = absDays * 24;

            return {
                primaryOutput: { label: 'Total Calendar Days', value: `${totalDays} Days` },
                secondaryMetrics: [
                    { label: 'Weeks & Days Breakdown', value: `${weeks} Weeks, ${remDays} Days` },
                    { label: 'Total Elapsed Hours', value: `${hours.toLocaleString()} Hours` },
                    { label: 'Approximate Months', value: `~${(absDays / 30.437).toFixed(1)} Months` },
                    { label: 'Approximate Years', value: `~${(absDays / 365.25).toFixed(2)} Years` }
                ]
            };
        }
    },

    // 2. Business Days & Working Days Calculator
    {
        id: 'business-days-calculator',
        name: 'Business Days Calculator',
        category: 'date-time-productivity',
        group: '4A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '301K',
        cpc: '$0.40',
        description: 'Computes total working days between dates, automatically filtering out weekend Saturdays and Sundays.',
        inputs: [
            { id: 'startDate', name: 'Start Date', type: 'date', defaultValue: '2026-09-01', tooltip: 'Commencement date.' },
            { id: 'endDate', name: 'End Date', type: 'date', defaultValue: '2026-09-30', tooltip: 'Completion date.' },
            { id: 'holidayCount', name: 'Public Holidays to Deduct', type: 'number', defaultValue: 1, min: 0, max: 30, step: 1, suffix: 'days', tooltip: 'Statutory weekday holidays.' }
        ],
        naturalLanguageQueries: [
            'Business days between dates',
            'How many working days in a month?',
            'Working days calculator excluding weekends'
        ],
        edgeCases: ['Start date after end date', 'Deducting more holidays than available business days'],
        calculate: (inputs) => {
            const start = new Date(inputs.startDate || '2026-09-01');
            const end = new Date(inputs.endDate || '2026-09-30');
            const holidays = Number(inputs.holidayCount) || 0;

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return { primaryOutput: { label: 'Error', value: 'Invalid Date Selection' }, secondaryMetrics: [] };
            }

            if (start > end) {
                return { primaryOutput: { label: 'Error', value: 'Start date must precede end date' }, secondaryMetrics: [] };
            }

            let cur = new Date(start);
            let businessDays = 0;
            let weekendDays = 0;

            while (cur <= end) {
                const dayOfWeek = cur.getDay(); // 0 = Sunday, 6 = Saturday
                if (dayOfWeek === 0 || dayOfWeek === 6) {
                    weekendDays++;
                } else {
                    businessDays++;
                }
                cur.setDate(cur.getDate() + 1);
            }

            const netWorkingDays = Math.max(0, businessDays - holidays);
            const billableHours = netWorkingDays * 8; // 8 hours per day baseline

            return {
                primaryOutput: { label: 'Net Business Days', value: `${netWorkingDays} Work Days` },
                secondaryMetrics: [
                    { label: 'Gross Weekdays (Mon-Fri)', value: `${businessDays} Days` },
                    { label: 'Weekend Days Filtered', value: `${weekendDays} Days` },
                    { label: 'Standard Billable Hours (8h/day)', value: `${billableHours} Hours` },
                    { label: 'Holidays Subtracted', value: `${holidays} Days` }
                ]
            };
        }
    },

    // 3. Chronological Age & Life Milestone Calculator
    {
        id: 'age-calculator',
        name: 'Chronological Age & Milestone Calculator',
        category: 'date-time-productivity',
        group: '4A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '1.8M',
        cpc: '$0.20',
        description: 'Calculates exact age in years, months, days, total breaths, heartbeats, and countdown to next birthday.',
        inputs: [
            { id: 'birthDate', name: 'Date of Birth', type: 'date', defaultValue: '1998-05-15', tooltip: 'Date of birth.' },
            { id: 'targetDate', name: 'Age at Date (Default: Today)', type: 'date', defaultValue: '2026-08-31', tooltip: 'Reference date.' }
        ],
        naturalLanguageQueries: [
            'How old am I today?',
            'Exact age in months and days',
            'Age calculator date of birth'
        ],
        edgeCases: ['Birthdate set in the future relative to target date'],
        calculate: (inputs) => {
            const birth = new Date(inputs.birthDate || '1998-05-15');
            const target = new Date(inputs.targetDate || '2026-08-31');

            if (isNaN(birth.getTime()) || isNaN(target.getTime())) {
                return { primaryOutput: { label: 'Error', value: 'Invalid Date Selection' }, secondaryMetrics: [] };
            }

            if (birth > target) {
                return { primaryOutput: { label: 'Error', value: 'Birth date cannot be in the future' }, secondaryMetrics: [] };
            }

            let years = target.getFullYear() - birth.getFullYear();
            let months = target.getMonth() - birth.getMonth();
            let days = target.getDate() - birth.getDate();

            if (days < 0) {
                months--;
                const prevMonthLastDay = new Date(target.getFullYear(), target.getMonth(), 0).getDate();
                days += prevMonthLastDay;
            }
            if (months < 0) {
                years--;
                months += 12;
            }

            const totalDays = Math.floor((target.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
            const estHeartbeats = totalDays * 24 * 60 * 72; // ~72 bpm baseline

            return {
                primaryOutput: { label: 'Chronological Age', value: `${years} Yrs, ${months} Mos, ${days} Days` },
                secondaryMetrics: [
                    { label: 'Total Days Lived', value: `${totalDays.toLocaleString()} Days` },
                    { label: 'Total Hours Lived', value: `${(totalDays * 24).toLocaleString()} Hours` },
                    { label: 'Estimated Lifetime Heartbeats', value: `~${(estHeartbeats / 1e6).toFixed(1)} Million` }
                ]
            };
        }
    },

    // 4. Time Card & Decimal Hours Calculator
    {
        id: 'time-card-calculator',
        name: 'Time Card & Decimal Hours Calculator',
        category: 'date-time-productivity',
        group: '4A',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '450K',
        cpc: '$0.75',
        description: 'Converts daily clock-in and clock-out shifts into decimal hours, accounting for unpaid break deductions and overtime.',
        inputs: [
            { id: 'startTime', name: 'Shift Start Time', type: 'text', defaultValue: '08:30', tooltip: 'HH:MM format (e.g. 08:30).' },
            { id: 'endTime', name: 'Shift End Time', type: 'text', defaultValue: '17:15', tooltip: 'HH:MM format (e.g. 17:15).' },
            { id: 'unpaidBreakMins', name: 'Unpaid Meal / Break Duration', type: 'number', defaultValue: 45, min: 0, max: 180, step: 5, suffix: 'mins', tooltip: 'Break duration in minutes.' },
            { id: 'hourlyRate', name: 'Hourly Pay Rate', type: 'currency', defaultValue: 28.5, min: 0, step: 0.5, prefix: '$', tooltip: 'Base wage.' }
        ],
        naturalLanguageQueries: [
            'Time card hours calculator',
            'Convert 8 hours 45 minutes to decimal',
            'Work shift paycheck calculator'
        ],
        edgeCases: ['Shift crossing midnight (e.g., 22:00 to 06:00)', 'Break duration exceeding shift hours'],
        calculate: (inputs) => {
            const parseMinutes = (tStr: string): number => {
                const parts = (tStr || '00:00').split(':');
                const h = parseInt(parts[0] || '0', 10);
                const m = parseInt(parts[1] || '0', 10);
                return (h * 60) + m;
            };

            const startMin = parseMinutes(inputs.startTime);
            let endMin = parseMinutes(inputs.endTime);
            if (endMin < startMin) endMin += 24 * 60; // overnight shift handling

            const breakMins = Number(inputs.unpaidBreakMins) || 0;
            const rate = Number(inputs.hourlyRate) || 28.5;

            const grossMins = endMin - startMin;
            const netMins = Math.max(0, grossMins - breakMins);
            const decimalHours = netMins / 60;
            const grossEarnings = decimalHours * rate;

            const displayH = Math.floor(netMins / 60);
            const displayM = netMins % 60;

            return {
                primaryOutput: { label: 'Net Decimal Work Hours', value: decimalHours.toFixed(2), suffix: 'Hours' },
                secondaryMetrics: [
                    { label: 'Formatted Shift Duration', value: `${displayH} hrs, ${displayM} mins` },
                    { label: 'Gross Shift Pay', value: grossEarnings.toFixed(2), prefix: '$' },
                    { label: 'Unpaid Deducted Time', value: `${breakMins} Minutes` }
                ]
            };
        }
    },

    // 5. Pomodoro Cycle & Productivity Planner
    {
        id: 'pomodoro-planner-calculator',
        name: 'Pomodoro Cycle & Focus Block Planner',
        category: 'date-time-productivity',
        group: '4A',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '90K',
        cpc: '$0.30',
        description: 'Calculates total focus blocks, short/long break intervals, and estimated completion times for daily work sessions.',
        inputs: [
            { id: 'focusBlocks', name: 'Planned Focus Sprints', type: 'number', defaultValue: 6, min: 1, max: 20, step: 1, suffix: 'blocks', tooltip: 'Number of focus sessions.' },
            { id: 'workDurationMins', name: 'Sprint Duration (Standard: 25m)', type: 'number', defaultValue: 25, min: 10, max: 90, step: 5, suffix: 'mins', tooltip: 'Focus block length.' },
            { id: 'shortBreakMins', name: 'Short Break Duration (Standard: 5m)', type: 'number', defaultValue: 5, min: 1, max: 30, step: 1, suffix: 'mins', tooltip: 'Break between regular blocks.' },
            { id: 'longBreakMins', name: 'Long Break Duration (Standard: 20m)', type: 'number', defaultValue: 20, min: 10, max: 60, step: 5, suffix: 'mins', tooltip: 'Break after every 4th sprint.' }
        ],
        naturalLanguageQueries: [
            'Pomodoro planner calculator',
            'How long does 6 pomodoros take?',
            'Work session time estimator'
        ],
        edgeCases: ['Sessions with fewer than 4 blocks skipping long break trigger'],
        calculate: (inputs) => {
            const blocks = Number(inputs.focusBlocks) || 6;
            const workM = Number(inputs.workDurationMins) || 25;
            const shortM = Number(inputs.shortBreakMins) || 5;
            const longM = Number(inputs.longBreakMins) || 20;

            const totalWorkMins = blocks * workM;
            const longBreaksCount = Math.floor((blocks - 1) / 4);
            const shortBreaksCount = Math.max(0, (blocks - 1) - longBreaksCount);

            const totalBreakMins = (shortBreaksCount * shortM) + (longBreaksCount * longM);
            const totalSessionMins = totalWorkMins + totalBreakMins;

            const totalHours = Math.floor(totalSessionMins / 60);
            const remMins = totalSessionMins % 60;
            const focusEfficiencyPct = (totalWorkMins / totalSessionMins) * 100;

            return {
                primaryOutput: { label: 'Total Schedule Time Required', value: `${totalHours} hrs, ${remMins} mins` },
                secondaryMetrics: [
                    { label: 'Deep Focus Production Time', value: `${totalWorkMins} Minutes (${(totalWorkMins / 60).toFixed(1)} hrs)` },
                    { label: 'Total Rest & Recovery Time', value: `${totalBreakMins} Minutes` },
                    { label: 'Focus-to-Rest Ratio', value: `${focusEfficiencyPct.toFixed(0)}% Focused Work` }
                ]
            };
        }
    }
];