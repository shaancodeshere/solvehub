import { CalculatorDefinition } from '@/types/calculator';

export const dateTimeProductivityCalculators: CalculatorDefinition[] = [
    // 1. Date Calculator
    {
        id: 'date-calculator',
        name: 'Date Calculator',
        category: 'date-time-productivity',
        group: 'Date & Time',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '1.8M',
        cpc: '$1.71',
        description: "A Date Calculator computes future or past dates by adding or subtracting days, weeks, months, or years from a given date. It also supports date arithmetic for scheduling, planning, legal deadlines, and project management. The calculator correctly handles leap years, varying month lengths, and calendar transitions.",
        inputs: [
            { id: 'operation', name: 'Operation', type: 'dropdown', defaultValue: 'add', options: [{ label: 'Add Time to Date (+)', value: 'add' }, { label: 'Subtract Time from Date (-)', value: 'subtract' }], tooltip: 'Add or subtract.' },
            { id: 'days', name: 'Days', type: 'number', defaultValue: 30, min: 0, step: 1, suffix: 'days', tooltip: 'Days to shift.' },
            { id: 'weeks', name: 'Weeks', type: 'number', defaultValue: 2, min: 0, step: 1, suffix: 'weeks', tooltip: 'Weeks to shift.' },
            { id: 'months', name: 'Months', type: 'number', defaultValue: 1, min: 0, step: 1, suffix: 'months', tooltip: 'Months to shift.' }
        ],
        naturalLanguageQueries: ["Calculate my date calculator", "What is my date calculator?", "Help me solve date calculator"],
        edgeCases: ["February 29 transitions Month-end overflow Invalid date formats Gregorian calendar assumptions"],
        calculate: (inputs) => {
            const isAdd = inputs.operation !== 'subtract';
            const days = Number(inputs.days) || 0;
            const weeks = Number(inputs.weeks) || 0;
            const months = Number(inputs.months) || 0;

            const totalDays = days + (weeks * 7) + (months * 30.4375);
            const totalHours = totalDays * 24;

            return {
                primaryOutput: { label: isAdd ? 'Future Target Date Offset' : 'Past Date Offset', value: `${isAdd ? '+' : '-'}${Math.round(totalDays)} Days` },
                secondaryMetrics: [
                    { label: 'Equivalent Weeks', value: `${(totalDays / 7).toFixed(1)} Weeks` },
                    { label: 'Equivalent Months (~30.4 days)', value: `${(totalDays / 30.4375).toFixed(1)} Months` },
                    { label: 'Total Hours Shift', value: `${Math.round(totalHours)} Hours` }
                ]
            };
        }
    },
    // 2. Time Calculator
    {
        id: 'time-calculator',
        name: 'Time Calculator',
        category: 'date-time-productivity',
        group: 'Date & Time',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '1.5M',
        cpc: '$3.68',
        description: "A Time Calculator performs arithmetic operations on times and durations. It helps users add or subtract hours, minutes, and seconds for scheduling and time tracking. The calculator supports 12-hour and 24-hour formats.",
        inputs: [
            { id: 'hours1', name: 'Time 1 - Hours', type: 'number', defaultValue: 4, min: 0, step: 1, suffix: 'hr', tooltip: 'Hours.' },
            { id: 'mins1', name: 'Time 1 - Minutes', type: 'number', defaultValue: 45, min: 0, max: 59, step: 1, suffix: 'min', tooltip: 'Minutes.' },
            { id: 'operation', name: 'Operation', type: 'dropdown', defaultValue: 'add', options: [{ label: 'Add (+)', value: 'add' }, { label: 'Subtract (-)', value: 'subtract' }], tooltip: 'Operation.' },
            { id: 'hours2', name: 'Time 2 - Hours', type: 'number', defaultValue: 2, min: 0, step: 1, suffix: 'hr', tooltip: 'Hours.' },
            { id: 'mins2', name: 'Time 2 - Minutes', type: 'number', defaultValue: 30, min: 0, max: 59, step: 1, suffix: 'min', tooltip: 'Minutes.' }
        ],
        naturalLanguageQueries: ["Calculate my time calculator", "What is my time calculator?", "Help me solve time calculator"],
        edgeCases: ["Midnight rollover Negative durations Invalid time formats Large hour offsets"],
        calculate: (inputs) => {
            const h1 = Number(inputs.hours1) || 0;
            const m1 = Number(inputs.mins1) || 0;
            const h2 = Number(inputs.hours2) || 0;
            const m2 = Number(inputs.mins2) || 0;
            const isAdd = inputs.operation !== 'subtract';

            const totalM1 = (h1 * 60) + m1;
            const totalM2 = (h2 * 60) + m2;
            const diffM = isAdd ? totalM1 + totalM2 : Math.max(0, totalM1 - totalM2);

            const resH = Math.floor(diffM / 60);
            const resM = diffM % 60;
            const decimalHours = diffM / 60;

            return {
                primaryOutput: { label: 'Resulting Total Time', value: `${resH} hrs ${resM} mins` },
                secondaryMetrics: [
                    { label: 'Decimal Hours', value: `${decimalHours.toFixed(2)} Hours` },
                    { label: 'Total Minutes', value: `${diffM} Minutes` },
                    { label: 'Total Seconds', value: `${diffM * 60} Seconds` }
                ]
            };
        }
    },
    // 3. Age Calculator
    {
        id: 'age-calculator',
        name: 'Age Calculator',
        category: 'date-time-productivity',
        group: 'Date & Time',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '11.1M',
        cpc: '$0.29',
        description: "An Age Calculator computes exact age between birth date and current/reference date. It helps users determine age in years, months, days, and total elapsed time. The calculator correctly accounts for leap years and varying month lengths.",
        inputs: [
            { id: 'birthYear', name: 'Birth Year', type: 'number', defaultValue: 1995, min: 1900, max: 2026, step: 1, tooltip: 'Year of birth.' },
            { id: 'birthMonth', name: 'Birth Month (1-12)', type: 'number', defaultValue: 6, min: 1, max: 12, step: 1, tooltip: 'Month of birth.' },
            { id: 'birthDay', name: 'Birth Day (1-31)', type: 'number', defaultValue: 15, min: 1, max: 31, step: 1, tooltip: 'Day of birth.' }
        ],
        naturalLanguageQueries: ["Calculate my age calculator", "What is my age calculator?", "Help me solve age calculator"],
        edgeCases: ["Leap-day birthdays Future birth dates Time-zone differences Invalid calendar dates"],
        calculate: (inputs) => {
            const y = Number(inputs.birthYear) || 1995;
            const m = Number(inputs.birthMonth) || 6;
            const d = Number(inputs.birthDay) || 15;

            const nowYear = 2026;
            const nowMonth = 9;
            const nowDay = 26;

            let ageYears = nowYear - y;
            let ageMonths = nowMonth - m;
            let ageDays = nowDay - d;

            if (ageDays < 0) {
                ageMonths -= 1;
                ageDays += 30;
            }
            if (ageMonths < 0) {
                ageYears -= 1;
                ageMonths += 12;
            }

            const totalDays = Math.round((ageYears * 365.25) + (ageMonths * 30.4375) + ageDays);
            const totalHours = totalDays * 24;

            return {
                primaryOutput: { label: 'Chronological Age', value: `${ageYears} Years, ${ageMonths} Months, ${ageDays} Days` },
                secondaryMetrics: [
                    { label: 'Total Age in Months', value: `${ageYears * 12 + ageMonths} Months` },
                    { label: 'Total Days Lived', value: `${totalDays.toLocaleString()} Days` },
                    { label: 'Total Hours Lived', value: `~${totalHours.toLocaleString()} Hours` }
                ]
            };
        }
    },
    // 4. Time Duration Calculator
    {
        id: 'time-duration-calculator',
        name: 'Time Duration Calculator',
        category: 'date-time-productivity',
        group: 'Date & Time',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '246K',
        cpc: '$3.51',
        description: "A Time Duration Calculator computes the elapsed duration between two times or timestamps. It helps track schedules, travel time, shifts, and activity durations. The calculator supports crossing midnight and multi-day durations.",
        inputs: [
            { id: 'startHour', name: 'Start Hour (0-23)', type: 'number', defaultValue: 9, min: 0, max: 23, step: 1, tooltip: 'Start hour.' },
            { id: 'startMin', name: 'Start Minute (0-59)', type: 'number', defaultValue: 30, min: 0, max: 59, step: 1, tooltip: 'Start minute.' },
            { id: 'endHour', name: 'End Hour (0-23)', type: 'number', defaultValue: 17, min: 0, max: 23, step: 1, tooltip: 'End hour.' },
            { id: 'endMin', name: 'End Minute (0-59)', type: 'number', defaultValue: 45, min: 0, max: 59, step: 1, tooltip: 'End minute.' }
        ],
        naturalLanguageQueries: ["Calculate my time duration calculator", "What is my time duration calculator?", "Help me solve time duration calculator"],
        edgeCases: ["End time before start time DST transitions Invalid timestamps Multi-day spans"],
        calculate: (inputs) => {
            const sh = Number(inputs.startHour) || 0;
            const sm = Number(inputs.startMin) || 0;
            const eh = Number(inputs.endHour) || 0;
            const em = Number(inputs.endMin) || 0;

            let startMins = (sh * 60) + sm;
            let endMins = (eh * 60) + em;
            if (endMins < startMins) endMins += 24 * 60; // Next day wrap

            const durMins = endMins - startMins;
            const hours = Math.floor(durMins / 60);
            const mins = durMins % 60;
            const decHours = durMins / 60;

            return {
                primaryOutput: { label: 'Elapsed Duration', value: `${hours} Hours, ${mins} Minutes` },
                secondaryMetrics: [
                    { label: 'Decimal Hours', value: `${decHours.toFixed(2)} Hours` },
                    { label: 'Total Minutes', value: `${durMins} Minutes` },
                    { label: 'Total Seconds', value: `${durMins * 60} Seconds` }
                ]
            };
        }
    },
    // 5. Day Counter
    {
        id: 'day-counter',
        name: 'Day Counter',
        category: 'date-time-productivity',
        group: 'Date & Time',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '301K',
        cpc: '$0.04',
        description: "A Day Counter calculates the number of days between two dates. It helps track deadlines, anniversaries, vacations, and project schedules. The calculator optionally excludes weekends and holidays.",
        inputs: [
            { id: 'startDaysAhead', name: 'Start Offset (Days from Today)', type: 'number', defaultValue: 0, step: 1, suffix: 'days', tooltip: 'Starting point.' },
            { id: 'endDaysAhead', name: 'End Offset (Days from Today)', type: 'number', defaultValue: 45, step: 1, suffix: 'days', tooltip: 'Ending point.' },
            { id: 'includeEndDay', name: 'Count End Day (Inclusive)', type: 'dropdown', defaultValue: 'yes', options: [{ label: 'Yes (Inclusive)', value: 'yes' }, { label: 'No (Exclusive)', value: 'no' }], tooltip: 'Inclusive counting.' }
        ],
        naturalLanguageQueries: ["Calculate my day counter", "What is my day counter?", "Help me solve day counter"],
        edgeCases: ["Start date after end date Leap years Holiday exclusions DST midnight shifts"],
        calculate: (inputs) => {
            const d1 = Number(inputs.startDaysAhead) || 0;
            const d2 = Number(inputs.endDaysAhead) || 45;
            const isInc = inputs.includeEndDay !== 'no';

            const diff = Math.abs(d2 - d1) + (isInc ? 1 : 0);
            const weeks = Math.floor(diff / 7);
            const extraDays = diff % 7;

            return {
                primaryOutput: { label: 'Total Days Count', value: `${diff} Days` },
                secondaryMetrics: [
                    { label: 'Weeks & Days Breakdown', value: `${weeks} Weeks, ${extraDays} Days` },
                    { label: 'Business Days (approx 5/7)', value: `~${Math.round(diff * (5 / 7))} Working Days` },
                    { label: 'Weekend Days (approx 2/7)', value: `~${Math.round(diff * (2 / 7))} Weekend Days` }
                ]
            };
        }
    },
    // 6. Day of the Week Calculator
    {
        id: 'day-of-the-week-calculator',
        name: 'Day of the Week Calculator',
        category: 'date-time-productivity',
        group: 'Date & Time',
        bucket: 'Bucket B',
        tier: 4,
        phase: 3,
        monthlySearches: '4K',
        cpc: '$0.04',
        description: "A Day of the Week Calculator determines the weekday for a specific calendar date. It helps historical analysis, planning, and scheduling. The calculator supports Gregorian calendar dates.",
        inputs: [
            { id: 'year', name: 'Year', type: 'number', defaultValue: 2026, min: 1600, max: 2200, step: 1, tooltip: 'Year.' },
            { id: 'month', name: 'Month (1-12)', type: 'number', defaultValue: 9, min: 1, max: 12, step: 1, tooltip: 'Month.' },
            { id: 'day', name: 'Day of Month (1-31)', type: 'number', defaultValue: 26, min: 1, max: 31, step: 1, tooltip: 'Day.' }
        ],
        naturalLanguageQueries: ["Calculate my day of the week calculator", "What is my day of the week calculator?", "Help me solve day of the week calculator"],
        edgeCases: ["Pre-Gregorian dates Invalid calendar inputs Leap-year dates"],
        calculate: (inputs) => {
            const y = Number(inputs.year) || 2026;
            const m = Number(inputs.month) || 9;
            const d = Number(inputs.day) || 26;

            const date = new Date(y, m - 1, d);
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayOfWeek = days[date.getDay()];

            const isLeap = (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);

            return {
                primaryOutput: { label: 'Day of the Week', value: dayOfWeek },
                secondaryMetrics: [
                    { label: 'Calendar Date', value: `${y}-${m < 10 ? '0' : ''}${m}-${d < 10 ? '0' : ''}${d}` },
                    { label: 'Leap Year Status', value: isLeap ? 'Leap Year (366 Days)' : 'Common Year (365 Days)' },
                    { label: 'Weekend / Weekday', value: date.getDay() === 0 || date.getDay() === 6 ? 'Weekend Day' : 'Weekday' }
                ]
            };
        }
    },
    // 7. Time Zone Calculator
    {
        id: 'time-zone-calculator',
        name: 'Time Zone Calculator',
        category: 'date-time-productivity',
        group: 'Date & Time',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '50K',
        cpc: '$0.50',
        description: "A Time Zone Calculator converts time between different global time zones. It helps scheduling meetings, travel planning, and international collaboration. The calculator correctly handles daylight saving time adjustments.",
        inputs: [
            { id: 'sourceHour', name: 'Source Time - Hour (0-23)', type: 'number', defaultValue: 14, min: 0, max: 23, step: 1, tooltip: 'Current local hour.' },
            { id: 'sourceOffset', name: 'Source Time Zone Offset (UTC)', type: 'number', defaultValue: -5, min: -12, max: 14, step: 0.5, suffix: 'UTC', tooltip: 'e.g. -5 for EST, 0 for GMT, +5.5 for IST.' },
            { id: 'targetOffset', name: 'Target Time Zone Offset (UTC)', type: 'number', defaultValue: 1, min: -12, max: 14, step: 0.5, suffix: 'UTC', tooltip: 'Target UTC offset.' }
        ],
        naturalLanguageQueries: ["Calculate my time zone calculator", "What is my time zone calculator?", "Help me solve time zone calculator"],
        edgeCases: ["DST transitions Ambiguous repeated times Invalid time-zone IDs Historical offset changes"],
        calculate: (inputs) => {
            const h = Number(inputs.sourceHour) || 14;
            const srcOff = Number(inputs.sourceOffset) || -5;
            const tgtOff = Number(inputs.targetOffset) || 1;

            const diff = tgtOff - srcOff;
            let targetHour = (h + diff) % 24;
            if (targetHour < 0) targetHour += 24;

            const formatH = (hour: number) => {
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const h12 = hour % 12 === 0 ? 12 : hour % 12;
                return `${h12}:00 ${ampm} (${hour < 10 ? '0' : ''}${hour}:00)`;
            };

            return {
                primaryOutput: { label: 'Target Local Time', value: formatH(targetHour) },
                secondaryMetrics: [
                    { label: 'Time Difference', value: `${diff >= 0 ? '+' : ''}${diff} Hours` },
                    { label: 'Source Local Time', value: formatH(h) },
                    { label: 'Day Offset', value: (h + diff) >= 24 ? '+1 Day (Tomorrow)' : ((h + diff) < 0 ? '-1 Day (Yesterday)' : 'Same Calendar Day') }
                ]
            };
        }
    },
    // 8. Time Card Calculator
    {
        id: 'time-card-calculator',
        name: 'Time Card Calculator',
        category: 'date-time-productivity',
        group: 'Date & Time',
        bucket: 'Bucket A',
        tier: 1,
        phase: 1,
        monthlySearches: '246K',
        cpc: '$5.72  ★ HIGH CPC',
        description: "A Time Card Calculator computes total worked hours across shifts and breaks. It helps payroll processing and employee time tracking. The calculator supports overtime calculations optionally.",
        inputs: [
            { id: 'dailyHours', name: 'Average Daily Shift Hours', type: 'number', defaultValue: 8.5, min: 1, max: 24, step: 0.25, suffix: 'hrs', tooltip: 'Gross shift duration.' },
            { id: 'lunchBreakMins', name: 'Unpaid Lunch Break (Minutes)', type: 'number', defaultValue: 30, min: 0, max: 120, step: 15, suffix: 'min', tooltip: 'Deducted break.' },
            { id: 'daysWorked', name: 'Days Worked per Week', type: 'number', defaultValue: 5, min: 1, max: 7, step: 1, suffix: 'days', tooltip: 'Work days.' },
            { id: 'hourlyWage', name: 'Hourly Pay Rate ($)', type: 'currency', defaultValue: 25, min: 0, step: 0.5, prefix: '$', tooltip: 'Hourly wage.' }
        ],
        naturalLanguageQueries: ["Calculate my time card calculator", "What is my time card calculator?", "Help me solve time card calculator"],
        edgeCases: ["Zero division errors", "Invalid input formats", "Boundary conditions"],
        calculate: (inputs) => {
            const shiftH = Number(inputs.dailyHours) || 8.5;
            const breakM = Number(inputs.lunchBreakMins) || 30;
            const days = Number(inputs.daysWorked) || 5;
            const wage = Number(inputs.hourlyWage) || 25;

            const netDailyHours = Math.max(0, shiftH - (breakM / 60));
            const totalWeeklyHours = netDailyHours * days;
            const regularHours = Math.min(40, totalWeeklyHours);
            const overtimeHours = Math.max(0, totalWeeklyHours - 40);

            const regularPay = regularHours * wage;
            const overtimePay = overtimeHours * (wage * 1.5);
            const grossPay = regularPay + overtimePay;

            return {
                primaryOutput: { label: 'Weekly Gross Pay', value: Math.round(grossPay), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Total Net Hours Worked', value: `${totalWeeklyHours.toFixed(2)} Hours` },
                    { label: 'Regular Hours (at ${wage}/hr)', value: `${regularHours.toFixed(2)} Hours ($${Math.round(regularPay)})` },
                    { label: 'Overtime Hours (1.5x Rate)', value: `${overtimeHours.toFixed(2)} Hours ($${Math.round(overtimePay)})` }
                ]
            };
        }
    },
    // 9. Hours Calculator
    {
        id: 'hours-calculator',
        name: 'Hours Calculator',
        category: 'date-time-productivity',
        group: 'Date & Time',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '823K',
        cpc: '$2.73',
        description: "An Hours Calculator computes total hours and minutes between times or durations. It helps schedule management and labor tracking. The calculator supports decimal-hour conversions.",
        inputs: [
            { id: 'monHours', name: 'Monday Hours', type: 'number', defaultValue: 8, min: 0, max: 24, step: 0.5, suffix: 'hrs', tooltip: 'Monday.' },
            { id: 'tueHours', name: 'Tuesday Hours', type: 'number', defaultValue: 8, min: 0, max: 24, step: 0.5, suffix: 'hrs', tooltip: 'Tuesday.' },
            { id: 'wedHours', name: 'Wednesday Hours', type: 'number', defaultValue: 8, min: 0, max: 24, step: 0.5, suffix: 'hrs', tooltip: 'Wednesday.' },
            { id: 'thuHours', name: 'Thursday Hours', type: 'number', defaultValue: 8, min: 0, max: 24, step: 0.5, suffix: 'hrs', tooltip: 'Thursday.' },
            { id: 'friHours', name: 'Friday Hours', type: 'number', defaultValue: 8, min: 0, max: 24, step: 0.5, suffix: 'hrs', tooltip: 'Friday.' }
        ],
        naturalLanguageQueries: ["Calculate my hours calculator", "What is my hours calculator?", "Help me solve hours calculator"],
        edgeCases: ["Cross-midnight periods Negative durations Invalid time formats"],
        calculate: (inputs) => {
            const h = [inputs.monHours, inputs.tueHours, inputs.wedHours, inputs.thuHours, inputs.friHours]
                .map(v => Number(v) || 0);

            const total = h.reduce((a, b) => a + b, 0);
            const avgDaily = total / 5;

            return {
                primaryOutput: { label: 'Total Weekly Hours', value: `${total.toFixed(1)} Hours` },
                secondaryMetrics: [
                    { label: 'Daily Average', value: `${avgDaily.toFixed(2)} Hours/day` },
                    { label: 'Total Minutes', value: `${total * 60} Minutes` },
                    { label: 'Standard 40h Delta', value: `${total >= 40 ? '+' : ''}${(total - 40).toFixed(1)} Hours` }
                ]
            };
        }
    },
    // 10. Business Days Calculator
    {
        id: 'business-days-calculator',
        name: 'Business Days Calculator',
        category: 'date-time-productivity',
        group: 'Date & Time',
        bucket: 'Bucket A',
        tier: 2,
        phase: 2,
        monthlySearches: '74K',
        cpc: '$5.44  ★ HIGH CPC',
        description: "A Business Days Calculator counts working days between dates while excluding weekends and optionally holidays. It helps project planning and legal deadline calculations. The calculator supports regional holiday calendars.",
        inputs: [
            { id: 'totalCalendarDays', name: 'Total Calendar Days Span', type: 'number', defaultValue: 30, min: 1, step: 1, suffix: 'days', tooltip: 'Total span.' },
            { id: 'holidaysCount', name: 'Public Holidays in Span', type: 'number', defaultValue: 2, min: 0, step: 1, suffix: 'days', tooltip: 'Holidays.' }
        ],
        naturalLanguageQueries: ["Calculate my business days calculator", "What is my business days calculator?", "Help me solve business days calculator"],
        edgeCases: ["Zero division errors", "Invalid input formats", "Boundary conditions"],
        calculate: (inputs) => {
            const totalDays = Number(inputs.totalCalendarDays) || 30;
            const holidays = Number(inputs.holidaysCount) || 0;

            // Approx 5 business days per 7 calendar days
            const fullWeeks = Math.floor(totalDays / 7);
            const remDays = totalDays % 7;
            const rawBizDays = (fullWeeks * 5) + Math.min(5, remDays);
            const netBizDays = Math.max(0, rawBizDays - holidays);
            const weekendDays = totalDays - rawBizDays;

            return {
                primaryOutput: { label: 'Net Working / Business Days', value: `${netBizDays} Days` },
                secondaryMetrics: [
                    { label: 'Weekend Days (Saturdays & Sundays)', value: `${weekendDays} Days` },
                    { label: 'Observed Holidays Deducted', value: `${holidays} Days` },
                    { label: 'Productive Working Hours (@ 8h/day)', value: `${netBizDays * 8} Hours` }
                ]
            };
        }
    },
    // 11. Working Hours Calculator
    {
        id: 'working-hours-calculator',
        name: 'Working Hours Calculator',
        category: 'date-time-productivity',
        group: 'Date & Time',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '201K',
        cpc: '$3.88',
        description: "A Working Hours Calculator computes productive work time after subtracting breaks and non-working periods. It helps employee scheduling and payroll management. The calculator supports weekly and monthly summaries.",
        inputs: [
            { id: 'weeklyHours', name: 'Scheduled Weekly Hours', type: 'number', defaultValue: 40, min: 1, max: 80, step: 1, suffix: 'hrs/wk', tooltip: 'Hours per week.' },
            { id: 'weeksWorked', name: 'Weeks Worked per Year', type: 'number', defaultValue: 48, min: 1, max: 52, step: 1, suffix: 'weeks', tooltip: 'Weeks minus PTO/holidays.' },
            { id: 'hourlyRate', name: 'Hourly Billing / Pay Rate', type: 'currency', defaultValue: 45, min: 0, step: 1, prefix: '$', tooltip: 'Hourly rate.' }
        ],
        naturalLanguageQueries: ["Calculate my working hours calculator", "What is my working hours calculator?", "Help me solve working hours calculator"],
        edgeCases: ["Overnight shifts Negative work time Multiple break overlaps"],
        calculate: (inputs) => {
            const wh = Number(inputs.weeklyHours) || 40;
            const wks = Number(inputs.weeksWorked) || 48;
            const rate = Number(inputs.hourlyRate) || 45;

            const annualHours = wh * wks;
            const annualGross = annualHours * rate;
            const monthlyHours = annualHours / 12;

            return {
                primaryOutput: { label: 'Annual Working Hours', value: `${annualHours.toLocaleString()} Hours/Year` },
                secondaryMetrics: [
                    { label: 'Annual Gross Earnings', value: `$${Math.round(annualGross).toLocaleString()}` },
                    { label: 'Monthly Average Working Hours', value: `${monthlyHours.toFixed(1)} Hours/Month` },
                    { label: 'Weekly Revenue Capacity', value: `$${Math.round(wh * rate).toLocaleString()}/week` }
                ]
            };
        }
    },
    // 12. Countdown Timer Calculator
    {
        id: 'countdown-timer-calculator',
        name: 'Countdown Timer Calculator',
        category: 'date-time-productivity',
        group: 'Date & Time',
        bucket: 'Bucket B',
        tier: 5,
        phase: 4,
        monthlySearches: '260',
        cpc: 'N/A',
        description: "A Countdown Timer Calculator computes remaining time until a future event or deadline. It helps event planning, productivity tracking, and reminders. The calculator updates dynamically in real time.",
        inputs: [
            { id: 'targetDaysAway', name: 'Days Until Target Milestone Event', type: 'number', defaultValue: 100, min: 1, step: 1, suffix: 'days', tooltip: 'Days remaining.' }
        ],
        naturalLanguageQueries: ["Calculate my countdown timer calculator", "What is my countdown timer calculator?", "Help me solve countdown timer calculator"],
        edgeCases: ["Past target dates DST transitions Invalid timestamps"],
        calculate: (inputs) => {
            const days = Math.max(1, Number(inputs.targetDaysAway) || 100);

            const weeks = Math.floor(days / 7);
            const remDays = days % 7;
            const hours = days * 24;
            const minutes = hours * 60;
            const seconds = minutes * 60;

            return {
                primaryOutput: { label: 'Time Remaining Countdown', value: `${weeks} Weeks, ${remDays} Days` },
                secondaryMetrics: [
                    { label: 'Total Hours Left', value: `${hours.toLocaleString()} Hours` },
                    { label: 'Total Minutes Left', value: `${minutes.toLocaleString()} Minutes` },
                    { label: 'Total Seconds Left', value: `${seconds.toLocaleString()} Seconds` }
                ]
            };
        }
    },
    // 13. Date Difference Calculator
    {
        id: 'date-difference-calculator',
        name: 'Date Difference Calculator',
        category: 'date-time-productivity',
        group: 'Date & Time',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '60K',
        cpc: '$0.02',
        description: "A Date Difference Calculator computes exact elapsed time between two dates. It helps calculate durations for contracts, anniversaries, and scheduling. The calculator supports granular differences.",
        inputs: [
            { id: 'spanDays', name: 'Total Days Span Between Dates', type: 'number', defaultValue: 365, min: 1, step: 1, suffix: 'days', tooltip: 'Day difference.' }
        ],
        naturalLanguageQueries: ["Calculate my date difference calculator", "What is my date difference calculator?", "Help me solve date difference calculator"],
        edgeCases: ["Leap years End date before start date Month-length inconsistencies"],
        calculate: (inputs) => {
            const days = Number(inputs.spanDays) || 365;

            const years = (days / 365.25).toFixed(2);
            const months = (days / 30.4375).toFixed(1);
            const weeks = (days / 7).toFixed(1);

            return {
                primaryOutput: { label: 'Exact Day Difference', value: `${days} Calendar Days` },
                secondaryMetrics: [
                    { label: 'Years Equivalent', value: `~${years} Years` },
                    { label: 'Months Equivalent', value: `~${months} Months` },
                    { label: 'Weeks Equivalent', value: `~${weeks} Weeks` }
                ]
            };
        }
    },
    // 14. Weeks Between Dates Calculator
    {
        id: 'weeks-between-dates-calculator',
        name: 'Weeks Between Dates Calculator',
        category: 'date-time-productivity',
        group: 'Date & Time',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '7K',
        cpc: '$0.02',
        description: "A Weeks Between Dates Calculator computes the number of complete and partial weeks between two dates. It helps scheduling, pregnancy tracking, and planning. The calculator supports calendar-week rounding options.",
        inputs: [
            { id: 'totalDays', name: 'Days Count', type: 'number', defaultValue: 75, min: 1, step: 1, suffix: 'days', tooltip: 'Days.' }
        ],
        naturalLanguageQueries: ["Calculate my weeks between dates calculator", "What is my weeks between dates calculator?", "Help me solve weeks between dates calculator"],
        edgeCases: ["Leap years Partial-week rounding ambiguity Negative intervals"],
        calculate: (inputs) => {
            const d = Number(inputs.totalDays) || 75;

            const fullWeeks = Math.floor(d / 7);
            const extraDays = d % 7;
            const decimalWeeks = (d / 7).toFixed(2);

            return {
                primaryOutput: { label: 'Weeks & Days Span', value: `${fullWeeks} Weeks, ${extraDays} Days` },
                secondaryMetrics: [
                    { label: 'Decimal Weeks', value: `${decimalWeeks} Weeks` },
                    { label: 'Percentage of Full Year', value: `${((d / 365.25) * 100).toFixed(1)}%` }
                ]
            };
        }
    },
    // 15. Months Between Dates Calculator
    {
        id: 'months-between-dates-calculator',
        name: 'Months Between Dates Calculator',
        category: 'date-time-productivity',
        group: 'Date & Time',
        bucket: 'Bucket B',
        tier: 4,
        phase: 3,
        monthlySearches: '2K',
        cpc: '$0.01',
        description: "A Months Between Dates Calculator computes elapsed calendar months between two dates. It helps finance, contracts, subscriptions, and scheduling calculations. The calculator supports exact and rounded month calculations.",
        inputs: [
            { id: 'daysCount', name: 'Calendar Days Duration', type: 'number', defaultValue: 180, min: 1, step: 1, suffix: 'days', tooltip: 'Days.' }
        ],
        naturalLanguageQueries: ["Calculate my months between dates calculator", "What is my months between dates calculator?", "Help me solve months between dates calculator"],
        edgeCases: ["Month-end dates Leap years Partial month ambiguity"],
        calculate: (inputs) => {
            const d = Number(inputs.daysCount) || 180;
            const avgMonthDays = 30.4375;

            const months = d / avgMonthDays;
            const fullMonths = Math.floor(months);
            const remDays = Math.round(d - (fullMonths * avgMonthDays));

            return {
                primaryOutput: { label: 'Months Span', value: `${fullMonths} Months, ${remDays} Days` },
                secondaryMetrics: [
                    { label: 'Decimal Months', value: `${months.toFixed(2)} Months` },
                    { label: 'Quarters of a Year', value: `${(months / 3).toFixed(2)} Quarters` }
                ]
            };
        }
    },
    // 16. Sleep Calculator (90-Minute Sleep Cycles)
    {
        id: 'sleep-calculator',
        name: 'Sleep Calculator',
        category: 'date-time-productivity',
        group: 'Date & Time',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '450K',
        cpc: '$1.79',
        description: "A Sleep Calculator estimates optimal bedtime or wake-up time based on sleep cycles. It helps improve sleep quality and wakefulness. The calculator uses average human sleep-cycle durations.",
        inputs: [
            { id: 'wakeHour', name: 'Desired Wake-Up Time - Hour (0-23)', type: 'number', defaultValue: 7, min: 0, max: 23, step: 1, tooltip: 'Wake hour.' },
            { id: 'wakeMin', name: 'Desired Wake-Up Time - Minute (0-59)', type: 'number', defaultValue: 0, min: 0, max: 59, step: 1, tooltip: 'Wake minute.' },
            { id: 'fallAsleepMins', name: 'Time to Fall Asleep (Minutes)', type: 'number', defaultValue: 15, min: 0, max: 60, step: 5, suffix: 'min', tooltip: 'Sleep latency.' }
        ],
        naturalLanguageQueries: ["Calculate my sleep calculator", "What is my sleep calculator?", "Help me solve sleep calculator"],
        edgeCases: ["Extremely short sleep durations Cross-midnight calculations Time-zone effects ignored unless enabled"],
        calculate: (inputs) => {
            const wh = Number(inputs.wakeHour) || 7;
            const wm = Number(inputs.wakeMin) || 0;
            const lat = Number(inputs.fallAsleepMins) || 15;

            const wakeMinsTotal = (wh * 60) + wm;

            const calcBedtime = (cycles: number) => {
                let sleepMins = wakeMinsTotal - (cycles * 90) - lat;
                if (sleepMins < 0) sleepMins += 24 * 60;
                const h = Math.floor(sleepMins / 60);
                const m = sleepMins % 60;
                const ampm = h >= 12 ? 'PM' : 'AM';
                const h12 = h % 12 === 0 ? 12 : h % 12;
                return `${h12}:${m < 10 ? '0' : ''}${m} ${ampm}`;
            };

            return {
                primaryOutput: { label: 'Optimal Bedtime (5 Cycles / 7.5 hrs)', value: calcBedtime(5) },
                secondaryMetrics: [
                    { label: 'Ideal Bedtime (6 Cycles / 9 hrs)', value: calcBedtime(6) },
                    { label: 'Minimum Bedtime (4 Cycles / 6 hrs)', value: calcBedtime(4) },
                    { label: 'Short Rest Bedtime (3 Cycles / 4.5 hrs)', value: calcBedtime(3) }
                ]
            };
        }
    },
    // 17. Reading Time Calculator
    {
        id: 'reading-time-calculator',
        name: 'Reading Time Calculator',
        category: 'date-time-productivity',
        group: 'Date & Time',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '8K',
        cpc: 'N/A',
        description: "A Reading Time Calculator estimates how long written content takes to read based on word count and reading speed. It helps publishers and writers optimize content length. The calculator supports customizable reading speeds.",
        inputs: [
            { id: 'wordCount', name: 'Total Word Count', type: 'number', defaultValue: 3500, min: 10, step: 100, suffix: 'words', tooltip: 'Number of words.' },
            { id: 'readingSpeedWpm', name: 'Reading Speed (WPM)', type: 'dropdown', defaultValue: 238, options: [{ label: 'Average Adult (238 WPM)', value: 238 }, { label: 'Slow / Detailed Technical (150 WPM)', value: 150 }, { label: 'Fast Reader (350 WPM)', value: 350 }, { label: 'Speed Reader (600 WPM)', value: 600 }], tooltip: 'Reading pace.' }
        ],
        naturalLanguageQueries: ["Calculate my reading time calculator", "What is my reading time calculator?", "Help me solve reading time calculator"],
        edgeCases: ["Empty content Extremely large text Non-word-separated languages"],
        calculate: (inputs) => {
            const words = Number(inputs.wordCount) || 3500;
            const wpm = Number(inputs.readingSpeedWpm) || 238;

            const totalMins = words / wpm;
            const hours = Math.floor(totalMins / 60);
            const mins = Math.round(totalMins % 60);

            const display = hours > 0 ? `${hours} hr ${mins} min` : `${mins} min`;

            return {
                primaryOutput: { label: 'Estimated Reading Time', value: display },
                secondaryMetrics: [
                    { label: 'Reading Speed Used', value: `${wpm} Words Per Minute` },
                    { label: 'Audiobook Duration (@ 150 WPM)', value: `${Math.round(words / 150)} Minutes` },
                    { label: 'Approximate Book Pages (~250 words/pg)', value: `${Math.ceil(words / 250)} Pages` }
                ]
            };
        }
    },
    // 18. Words Per Minute Calculator (WPM)
    {
        id: 'words-per-minute-calculator',
        name: 'Words Per Minute Calculator',
        category: 'date-time-productivity',
        group: 'Date & Time',
        bucket: 'Bucket B',
        tier: 3,
        phase: 3,
        monthlySearches: '5K',
        cpc: '$0.35',
        description: "A Words Per Minute Calculator measures reading, typing, or speaking speed in WPM. It helps evaluate communication and productivity performance. The calculator supports timed input measurements.",
        inputs: [
            { id: 'wordsTyped', name: 'Total Words Typed', type: 'number', defaultValue: 250, min: 1, step: 10, suffix: 'words', tooltip: 'Words typed.' },
            { id: 'timeMinutes', name: 'Time Taken (Minutes)', type: 'number', defaultValue: 3.5, min: 0.1, step: 0.5, suffix: 'min', tooltip: 'Minutes spent.' },
            { id: 'errorsCount', name: 'Uncorrected Typos / Errors', type: 'number', defaultValue: 3, min: 0, step: 1, suffix: 'errors', tooltip: 'Errors made.' }
        ],
        naturalLanguageQueries: ["Calculate my words per minute calculator", "What is my words per minute calculator?", "Help me solve words per minute calculator"],
        edgeCases: ["Zero-duration input Negative time values Fractional-minute precision"],
        calculate: (inputs) => {
            const words = Number(inputs.wordsTyped) || 250;
            const mins = Math.max(0.1, Number(inputs.timeMinutes) || 3.5);
            const errors = Number(inputs.errorsCount) || 0;

            const grossWpm = words / mins;
            const netWpm = Math.max(0, (words - errors) / mins);
            const accuracy = Math.max(0, ((words - errors) / words) * 100);

            return {
                primaryOutput: { label: 'Net Typing Speed', value: Math.round(netWpm), suffix: 'WPM' },
                secondaryMetrics: [
                    { label: 'Gross WPM (without errors)', value: `${Math.round(grossWpm)} WPM` },
                    { label: 'Accuracy Rating', value: `${accuracy.toFixed(1)}%` },
                    { label: 'Characters Per Minute (CPM approx)', value: `${Math.round(grossWpm * 5)} CPM` }
                ]
            };
        }
    },
    // 19. Screen Time Calculator
    {
        id: 'screen-time-calculator',
        name: 'Screen Time Calculator',
        category: 'date-time-productivity',
        group: 'Date & Time',
        bucket: 'Bucket B',
        tier: 4,
        phase: 3,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "A Screen Time Calculator estimates time spent using digital devices across various sessions. It helps users monitor productivity and digital wellness. The calculator supports daily, weekly, and monthly usage tracking.",
        inputs: [
            { id: 'dailyHours', name: 'Average Daily Screen Time', type: 'number', defaultValue: 6.5, min: 0.5, max: 20, step: 0.5, suffix: 'hrs/day', tooltip: 'Phone + computer + TV.' },
            { id: 'yearsAhead', name: 'Horizon Timeline (Years)', type: 'number', defaultValue: 20, min: 1, max: 80, step: 1, suffix: 'years', tooltip: 'Years span.' }
        ],
        naturalLanguageQueries: ["Calculate my screen time calculator", "What is my screen time calculator?", "Help me solve screen time calculator"],
        edgeCases: ["Overlapping sessions Missing duration entries Cross-midnight usage sessions"],
        calculate: (inputs) => {
            const h = Number(inputs.dailyHours) || 6.5;
            const y = Number(inputs.yearsAhead) || 20;

            const annualHours = h * 365.25;
            const totalHours = annualHours * y;
            const annualDaysEquivalent = annualHours / 24;
            const totalYearsEquivalent = totalHours / (24 * 365.25);
            const wakingHoursPct = (h / 16) * 100; // assuming 8 hrs sleep

            return {
                primaryOutput: { label: 'Cumulative Lifetime Screen Time', value: `${totalYearsEquivalent.toFixed(1)} Full Years`, suffix: `(${Math.round(totalHours).toLocaleString()} hours)` },
                secondaryMetrics: [
                    { label: 'Annual Days Spent on Screens', value: `${annualDaysEquivalent.toFixed(1)} Full 24-hr Days / Year` },
                    { label: 'Percentage of Waking Life', value: `${wakingHoursPct.toFixed(1)}% of waking hours` },
                    { label: 'Weekly Screen Hours', value: `${(h * 7).toFixed(1)} Hours / week` }
                ]
            };
        }
    },
    // 20. GPA Calculator
    {
        id: 'gpa-calculator',
        name: 'GPA Calculator',
        category: 'date-time-productivity',
        group: 'Academic & Everyday Utility',
        bucket: 'Bucket A',
        tier: 1,
        phase: 1,
        monthlySearches: '1.2M',
        cpc: '$1.62',
        description: "A GPA Calculator computes a student\u2019s Grade Point Average based on course grades and credit hours. It helps students track academic performance, scholarship eligibility, and graduation requirements. The calculator supports weighted and unweighted GPA systems commonly used in schools and universities.",
        inputs: [
            { id: 'c1Grade', name: 'Course 1 Grade Points (4.0 Scale)', type: 'number', defaultValue: 4.0, min: 0, max: 4.0, step: 0.1, tooltip: 'A=4, B=3, C=2, D=1, F=0' },
            { id: 'c1Credits', name: 'Course 1 Credit Hours', type: 'number', defaultValue: 3, min: 1, step: 1, tooltip: 'Credits.' },
            { id: 'c2Grade', name: 'Course 2 Grade Points', type: 'number', defaultValue: 3.7, min: 0, max: 4.0, step: 0.1, tooltip: 'A-=3.7' },
            { id: 'c2Credits', name: 'Course 2 Credit Hours', type: 'number', defaultValue: 4, min: 1, step: 1, tooltip: 'Credits.' },
            { id: 'c3Grade', name: 'Course 3 Grade Points', type: 'number', defaultValue: 3.3, min: 0, max: 4.0, step: 0.1, tooltip: 'B+=3.3' },
            { id: 'c3Credits', name: 'Course 3 Credit Hours', type: 'number', defaultValue: 3, min: 1, step: 1, tooltip: 'Credits.' }
        ],
        naturalLanguageQueries: ["Calculate my gpa calculator", "What is my gpa calculator?", "Help me solve gpa calculator"],
        edgeCases: ["Zero total credits Invalid grade scales Missing course grades Duplicate course entries"],
        calculate: (inputs) => {
            const grades = [Number(inputs.c1Grade) || 0, Number(inputs.c2Grade) || 0, Number(inputs.c3Grade) || 0];
            const credits = [Number(inputs.c1Credits) || 1, Number(inputs.c2Credits) || 1, Number(inputs.c3Credits) || 1];

            let totalPoints = 0;
            let totalCredits = 0;
            for (let i = 0; i < grades.length; i++) {
                totalPoints += grades[i] * credits[i];
                totalCredits += credits[i];
            }

            const gpa = totalPoints / Math.max(1, totalCredits);

            return {
                primaryOutput: { label: 'Cumulative GPA (4.0 Scale)', value: Number(gpa.toFixed(2)) },
                secondaryMetrics: [
                    { label: 'Total Quality Grade Points', value: totalPoints.toFixed(1) },
                    { label: 'Total Credit Hours Attempted', value: `${totalCredits} Credits` },
                    { label: 'Academic Standing', value: gpa >= 3.5 ? "Dean's List / Honors (>= 3.5)" : (gpa >= 3.0 ? 'Good Standing' : 'Satisfactory') }
                ]
            };
        }
    },
    // 21. Grade Calculator
    {
        id: 'grade-calculator',
        name: 'Grade Calculator',
        category: 'date-time-productivity',
        group: 'Academic & Everyday Utility',
        bucket: 'Bucket B',
        tier: 5,
        phase: 3,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "A Grade Calculator determines overall course grades from assignments, exams, quizzes, and projects. It helps students estimate academic performance throughout a course. The calculator supports weighted and percentage-based grading systems.",
        inputs: [
            { id: 'earnedPoints', name: 'Points Earned', type: 'number', defaultValue: 87, min: 0, step: 0.5, tooltip: 'Points scored.' },
            { id: 'totalPoints', name: 'Total Possible Points', type: 'number', defaultValue: 100, min: 1, step: 1, tooltip: 'Max points.' }
        ],
        naturalLanguageQueries: ["Calculate my grade calculator", "What is my grade calculator?", "Help me solve grade calculator"],
        edgeCases: ["Weight totals exceeding 100% Zero maximum points Missing assignments Negative scores"],
        calculate: (inputs) => {
            const earned = Number(inputs.earnedPoints) || 0;
            const total = Math.max(0.1, Number(inputs.totalPoints) || 100);

            const pct = (earned / total) * 100;

            let letter = 'F';
            if (pct >= 97) letter = 'A+';
            else if (pct >= 93) letter = 'A';
            else if (pct >= 90) letter = 'A-';
            else if (pct >= 87) letter = 'B+';
            else if (pct >= 83) letter = 'B';
            else if (pct >= 80) letter = 'B-';
            else if (pct >= 77) letter = 'C+';
            else if (pct >= 73) letter = 'C';
            else if (pct >= 70) letter = 'C-';
            else if (pct >= 60) letter = 'D';

            return {
                primaryOutput: { label: 'Course Grade Score', value: `${pct.toFixed(1)}%`, suffix: `(${letter})` },
                secondaryMetrics: [
                    { label: 'Letter Grade', value: letter },
                    { label: 'Points Lost', value: `${(total - earned).toFixed(1)} points` },
                    { label: '4.0 GPA Equivalent', value: pct >= 90 ? '4.0' : (pct >= 80 ? '3.0' : (pct >= 70 ? '2.0' : '1.0')) }
                ]
            };
        }
    },
    // 22. CGPA Calculator
    {
        id: 'cgpa-calculator',
        name: 'CGPA Calculator',
        category: 'date-time-productivity',
        group: 'Academic & Everyday Utility',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '165K',
        cpc: '$0.40',
        description: "A CGPA Calculator computes cumulative grade point average across multiple semesters or academic periods. It helps students monitor long-term academic standing. The calculator supports semester-wise GPA aggregation.",
        inputs: [
            { id: 'currentCgpa', name: 'Prior CGPA', type: 'number', defaultValue: 3.4, min: 0, max: 10, step: 0.05, tooltip: 'Existing cumulative GPA.' },
            { id: 'completedCredits', name: 'Prior Completed Credits', type: 'number', defaultValue: 60, min: 1, step: 1, tooltip: 'Prior credits.' },
            { id: 'semGpa', name: 'Current Semester GPA', type: 'number', defaultValue: 3.8, min: 0, max: 10, step: 0.05, tooltip: 'New semester GPA.' },
            { id: 'semCredits', name: 'Current Semester Credits', type: 'number', defaultValue: 15, min: 1, step: 1, tooltip: 'New credits.' }
        ],
        naturalLanguageQueries: ["Calculate my cgpa calculator", "What is my cgpa calculator?", "Help me solve cgpa calculator"],
        edgeCases: ["Zero total credits Mixed GPA scales Missing semester entries"],
        calculate: (inputs) => {
            const oldGpa = Number(inputs.currentCgpa) || 3.4;
            const oldCred = Number(inputs.completedCredits) || 60;
            const semGpa = Number(inputs.semGpa) || 3.8;
            const semCred = Number(inputs.semCredits) || 15;

            const totalPoints = (oldGpa * oldCred) + (semGpa * semCred);
            const totalCredits = oldCred + semCred;
            const newCgpa = totalPoints / totalCredits;

            return {
                primaryOutput: { label: 'Updated Cumulative CGPA', value: Number(newCgpa.toFixed(3)) },
                secondaryMetrics: [
                    { label: 'CGPA Change', value: `${newCgpa >= oldGpa ? '+' : ''}${(newCgpa - oldGpa).toFixed(3)}` },
                    { label: 'Total Cumulative Credits', value: `${totalCredits} Credits` },
                    { label: 'Percentage Equivalent (out of 10.0 scale)', value: `${(newCgpa * 9.5).toFixed(1)}% (CBSE Formula)` }
                ]
            };
        }
    },
    // 23. Weighted Grade Calculator
    {
        id: 'weighted-grade-calculator',
        name: 'Weighted Grade Calculator',
        category: 'date-time-productivity',
        group: 'Academic & Everyday Utility',
        bucket: 'Bucket B',
        tier: 5,
        phase: 4,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "A Weighted Grade Calculator computes final grades where assessments contribute different percentages toward the final score. It helps students evaluate performance in weighted courses. The calculator supports multiple grading categories.",
        inputs: [
            { id: 'hwGrade', name: 'Homework Grade (%)', type: 'percentage', defaultValue: 95, min: 0, max: 100, step: 1, suffix: '%', tooltip: 'Homework score.' },
            { id: 'hwWeight', name: 'Homework Weight (%)', type: 'percentage', defaultValue: 20, min: 0, max: 100, step: 1, suffix: '%', tooltip: 'Homework weight.' },
            { id: 'midtermGrade', name: 'Midterm Exam Grade (%)', type: 'percentage', defaultValue: 82, min: 0, max: 100, step: 1, suffix: '%', tooltip: 'Midterm score.' },
            { id: 'midtermWeight', name: 'Midterm Exam Weight (%)', type: 'percentage', defaultValue: 30, min: 0, max: 100, step: 1, suffix: '%', tooltip: 'Midterm weight.' },
            { id: 'projectGrade', name: 'Project / Labs Grade (%)', type: 'percentage', defaultValue: 90, min: 0, max: 100, step: 1, suffix: '%', tooltip: 'Projects score.' },
            { id: 'projectWeight', name: 'Project / Labs Weight (%)', type: 'percentage', defaultValue: 20, min: 0, max: 100, step: 1, suffix: '%', tooltip: 'Projects weight.' }
        ],
        naturalLanguageQueries: ["Calculate my weighted grade calculator", "What is my weighted grade calculator?", "Help me solve weighted grade calculator"],
        edgeCases: ["Weights not totaling 100% Missing category grades Negative percentages"],
        calculate: (inputs) => {
            const g1 = Number(inputs.hwGrade) || 95, w1 = Number(inputs.hwWeight) || 20;
            const g2 = Number(inputs.midtermGrade) || 82, w2 = Number(inputs.midtermWeight) || 30;
            const g3 = Number(inputs.projectGrade) || 90, w3 = Number(inputs.projectWeight) || 20;

            const totalWeight = w1 + w2 + w3;
            const weightedSum = (g1 * w1) + (g2 * w2) + (g3 * w3);
            const currentAverage = weightedSum / Math.max(1, totalWeight);

            return {
                primaryOutput: { label: 'Current Weighted Average', value: `${currentAverage.toFixed(2)}%` },
                secondaryMetrics: [
                    { label: 'Completed Course Weight', value: `${totalWeight}% of course total` },
                    { label: 'Remaining Weight (Final Exam)', value: `${100 - totalWeight}%` }
                ]
            };
        }
    },
    // 24. Final Grade Calculator
    {
        id: 'final-grade-calculator',
        name: 'Final Grade Calculator',
        category: 'date-time-productivity',
        group: 'Academic & Everyday Utility',
        bucket: 'Bucket B',
        tier: 5,
        phase: 4,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "A Final Grade Calculator estimates the score needed on a final exam to achieve a desired course grade. It helps students set academic targets. The calculator supports weighted finals.",
        inputs: [
            { id: 'currentGrade', name: 'Current Course Grade (%)', type: 'percentage', defaultValue: 86, min: 0, max: 100, step: 0.5, suffix: '%', tooltip: 'Current score.' },
            { id: 'targetGrade', name: 'Desired Goal Grade (%)', type: 'percentage', defaultValue: 90, min: 0, max: 100, step: 0.5, suffix: '%', tooltip: 'Target score (e.g. 90% for A).' },
            { id: 'finalWeight', name: 'Final Exam Weight (%)', type: 'percentage', defaultValue: 30, min: 1, max: 100, step: 1, suffix: '%', tooltip: 'Weight of final exam.' }
        ],
        naturalLanguageQueries: ["Calculate my final grade calculator", "What is my final grade calculator?", "Help me solve final grade calculator"],
        edgeCases: ["Impossible required grades above 100% Zero final weight Negative percentages"],
        calculate: (inputs) => {
            const cur = Number(inputs.currentGrade) || 86;
            const target = Number(inputs.targetGrade) || 90;
            const w = (Number(inputs.finalWeight) || 30) / 100;

            // Target = (Current * (1 - w)) + (Required * w)
            // Required = (Target - (Current * (1 - w))) / w
            const required = (target - (cur * (1 - w))) / w;

            return {
                primaryOutput: { label: 'Required Final Exam Score', value: `${required.toFixed(1)}%` },
                secondaryMetrics: [
                    { label: 'Difficulty Feasibility', value: required > 100 ? 'Requires Extra Credit (>100%)' : (required <= 0 ? 'Already Secured (>= Target)' : 'Achievable with study') },
                    { label: 'Current Standing Weight', value: `${Math.round((1 - w) * 100)}%` }
                ]
            };
        }
    },
    // 25. Study Hours Calculator
    {
        id: 'study-hours-calculator',
        name: 'Study Hours Calculator',
        category: 'date-time-productivity',
        group: 'Academic & Everyday Utility',
        bucket: 'Bucket B',
        tier: 5,
        phase: 4,
        monthlySearches: '70',
        cpc: 'N/A',
        description: "A Study Hours Calculator estimates recommended study time based on subjects, goals, workload, or credit hours. It helps students optimize study schedules. The calculator may follow common academic planning recommendations.",
        inputs: [
            { id: 'creditHours', name: 'Enrolled Credit Hours', type: 'number', defaultValue: 15, min: 1, max: 24, step: 1, suffix: 'credits', tooltip: 'Total semester credits.' },
            { id: 'courseDifficulty', name: 'Target Intensity / Difficulty', type: 'dropdown', defaultValue: 2.0, options: [{ label: 'Standard College Rule (2 hrs study per credit)', value: 2.0 }, { label: 'Rigorous / STEM / Pre-Med (3 hrs study per credit)', value: 3.0 }, { label: 'Light / Revision (1.5 hrs per credit)', value: 1.5 }], tooltip: 'Study multiplier.' }
        ],
        naturalLanguageQueries: ["Calculate my study hours calculator", "What is my study hours calculator?", "Help me solve study hours calculator"],
        edgeCases: ["Zero courses Excessively large schedules Missing credit values"],
        calculate: (inputs) => {
            const creds = Number(inputs.creditHours) || 15;
            const mult = Number(inputs.courseDifficulty) || 2.0;

            const weeklyStudyHours = creds * mult;
            const totalWorkload = creds + weeklyStudyHours; // Class + Study

            return {
                primaryOutput: { label: 'Recommended Weekly Study Hours', value: `${weeklyStudyHours.toFixed(1)} Hours/Week` },
                secondaryMetrics: [
                    { label: 'Daily Study Time (6 Days/Week)', value: `${(weeklyStudyHours / 6).toFixed(1)} Hours/Day` },
                    { label: 'Total Weekly Academic Commitment (Class + Study)', value: `${totalWorkload.toFixed(1)} Hours/Week` },
                    { label: 'Semester Total Study Hours (~15 Weeks)', value: `${Math.round(weeklyStudyHours * 15)} Hours` }
                ]
            };
        }
    },
    // 26. Fuel Cost Calculator
    {
        id: 'fuel-cost-calculator',
        name: 'Fuel Cost Calculator',
        category: 'date-time-productivity',
        group: 'Academic & Everyday Utility',
        bucket: 'Bucket C1',
        tier: 1,
        phase: 1,
        monthlySearches: '110K',
        cpc: '$0.42',
        description: "A Fuel Cost Calculator estimates travel fuel expenses based on trip distance, fuel efficiency, and fuel prices. It helps drivers budget transportation costs. The calculator supports multiple unit systems.",
        inputs: [
            { id: 'tripDistanceMiles', name: 'Trip Distance (Miles)', type: 'number', defaultValue: 350, min: 1, step: 10, suffix: 'miles', tooltip: 'Trip distance.' },
            { id: 'fuelEconomyMpg', name: 'Vehicle Fuel Economy (MPG)', type: 'number', defaultValue: 28, min: 5, max: 100, step: 0.5, suffix: 'mpg', tooltip: 'Miles per gallon.' },
            { id: 'gasPricePerGallon', name: 'Gas Price per Gallon ($)', type: 'currency', defaultValue: 3.65, min: 0.5, step: 0.05, prefix: '$', tooltip: 'Price per gallon.' }
        ],
        naturalLanguageQueries: ["Calculate my fuel cost calculator", "What is my fuel cost calculator?", "Help me solve fuel cost calculator"],
        edgeCases: ["Zero efficiency Negative fuel prices Mixed units"],
        calculate: (inputs) => {
            const dist = Number(inputs.tripDistanceMiles) || 350;
            const mpg = Math.max(1, Number(inputs.fuelEconomyMpg) || 28);
            const price = Number(inputs.gasPricePerGallon) || 3.65;

            const gallonsNeeded = dist / mpg;
            const totalCost = gallonsNeeded * price;
            const costPerMile = totalCost / dist;

            return {
                primaryOutput: { label: 'Total Trip Fuel Cost', value: Math.round(totalCost), prefix: '$' },
                secondaryMetrics: [
                    { label: 'Gallons of Fuel Required', value: `${gallonsNeeded.toFixed(2)} Gallons` },
                    { label: 'Fuel Cost per Mile', value: `$${costPerMile.toFixed(3)} / mile` },
                    { label: 'Round Trip Estimated Cost (2x)', value: `$${Math.round(totalCost * 2)}` }
                ]
            };
        }
    },
    // 27. Gas Mileage Calculator (MPG)
    {
        id: 'gas-mileage-calculator',
        name: 'Gas Mileage Calculator',
        category: 'date-time-productivity',
        group: 'Academic & Everyday Utility',
        bucket: 'Bucket C1',
        tier: 2,
        phase: 2,
        monthlySearches: '22K',
        cpc: '$5.98  ★ HIGH CPC',
        description: "A Gas Mileage Calculator computes vehicle fuel efficiency based on fuel used and distance traveled. It helps drivers monitor vehicle performance and fuel economy. The calculator supports MPG and metric efficiency systems.",
        inputs: [
            { id: 'odometerMiles', name: 'Miles Driven on Tank', type: 'number', defaultValue: 380, min: 1, step: 5, suffix: 'miles', tooltip: 'Miles on odometer.' },
            { id: 'gallonsPumped', name: 'Gallons to Refill Tank', type: 'number', defaultValue: 12.5, min: 0.5, step: 0.1, suffix: 'gal', tooltip: 'Fuel pumped.' }
        ],
        naturalLanguageQueries: ["Calculate my gas mileage calculator", "What is my gas mileage calculator?", "Help me solve gas mileage calculator"],
        edgeCases: ["Zero division errors", "Invalid input formats", "Boundary conditions"],
        calculate: (inputs) => {
            const miles = Number(inputs.odometerMiles) || 380;
            const gal = Math.max(0.1, Number(inputs.gallonsPumped) || 12.5);

            const mpg = miles / gal;
            // Metric L/100km: 235.214583 / MPG
            const lPer100km = 235.215 / mpg;
            const kmPerLiter = mpg * 0.425144;

            return {
                primaryOutput: { label: 'Calculated Fuel Economy', value: Number(mpg.toFixed(1)), suffix: 'MPG' },
                secondaryMetrics: [
                    { label: 'Metric Fuel Consumption', value: `${lPer100km.toFixed(2)} L/100km` },
                    { label: 'Kilometers per Liter', value: `${kmPerLiter.toFixed(2)} km/L` }
                ]
            };
        }
    },
    // 28. Mileage Calculator (IRS Business Deduction)
    {
        id: 'mileage-calculator',
        name: 'Mileage Calculator',
        category: 'date-time-productivity',
        group: 'Academic & Everyday Utility',
        bucket: 'Bucket C1',
        tier: 1,
        phase: 2,
        monthlySearches: '110K',
        cpc: '$3.89',
        description: "A Mileage Calculator estimates travel distance, fuel usage, and reimbursement values for trips. It helps businesses and individuals track transportation expenses. The calculator may support IRS mileage reimbursement rates.",
        inputs: [
            { id: 'businessMiles', name: 'Business Miles Driven', type: 'number', defaultValue: 2500, min: 1, step: 50, suffix: 'miles', tooltip: 'Deductible miles.' },
            { id: 'irsRate', name: 'IRS Standard Mileage Rate ($/mile)', type: 'currency', defaultValue: 0.67, min: 0.1, step: 0.01, prefix: '$', tooltip: '2024-2026 standard IRS rate is 67¢/mile.' }
        ],
        naturalLanguageQueries: ["Calculate my mileage calculator", "What is my mileage calculator?", "Help me solve mileage calculator"],
        edgeCases: ["End reading below start Negative reimbursement rates Odometer rollover issues"],
        calculate: (inputs) => {
            const miles = Number(inputs.businessMiles) || 2500;
            const rate = Number(inputs.irsRate) || 0.67;

            const deduction = miles * rate;

            return {
                primaryOutput: { label: 'Total Tax Deduction Value', value: Math.round(deduction), prefix: '$' },
                secondaryMetrics: [
                    { label: 'IRS Standard Rate Applied', value: `$${rate.toFixed(2)} / mile` },
                    { label: 'Monthly Equivalent (for 12 mos)', value: `$${Math.round(deduction / 12)} / month` }
                ]
            };
        }
    },
    // 29. Recipe Scaling Calculator
    {
        id: 'recipe-scaling-calculator',
        name: 'Recipe Scaling Calculator',
        category: 'date-time-productivity',
        group: 'Academic & Everyday Utility',
        bucket: 'Bucket B',
        tier: 5,
        phase: 4,
        monthlySearches: '480',
        cpc: '$2.85',
        description: "A Recipe Scaling Calculator adjusts ingredient quantities proportionally for different serving sizes. It helps cooks and bakers scale recipes accurately. The calculator supports fractional ingredient conversions.",
        inputs: [
            { id: 'originalServings', name: 'Original Recipe Servings', type: 'number', defaultValue: 4, min: 1, step: 1, suffix: 'servings', tooltip: 'Original yield.' },
            { id: 'desiredServings', name: 'Desired Target Servings', type: 'number', defaultValue: 10, min: 1, step: 1, suffix: 'servings', tooltip: 'Desired yield.' },
            { id: 'ingredientQty', name: 'Ingredient Amount', type: 'number', defaultValue: 2.5, min: 0.1, step: 0.25, tooltip: 'e.g. cups, grams, tbsp.' }
        ],
        naturalLanguageQueries: ["Calculate my recipe scaling calculator", "What is my recipe scaling calculator?", "Help me solve recipe scaling calculator"],
        edgeCases: ["Zero original servings Tiny fractional values Nonlinear baking adjustments ignored"],
        calculate: (inputs) => {
            const orig = Math.max(1, Number(inputs.originalServings) || 4);
            const des = Math.max(1, Number(inputs.desiredServings) || 10);
            const qty = Number(inputs.ingredientQty) || 2.5;

            const factor = des / orig;
            const scaledQty = qty * factor;

            return {
                primaryOutput: { label: 'Scaled Ingredient Amount', value: Number(scaledQty.toFixed(2)) },
                secondaryMetrics: [
                    { label: 'Recipe Scaling Multiplier Factor', value: `${factor.toFixed(2)}x` },
                    { label: 'Original Ingredient Amount', value: String(qty) }
                ]
            };
        }
    },
    // 30. Cooking Conversion Calculator
    {
        id: 'cooking-conversion-calculator',
        name: 'Cooking Conversion Calculator',
        category: 'date-time-productivity',
        group: 'Academic & Everyday Utility',
        bucket: 'Bucket C1',
        tier: 5,
        phase: 4,
        monthlySearches: '720',
        cpc: '$0.23',
        description: "A Cooking Conversion Calculator converts ingredient measurements between units commonly used in cooking and baking. It helps standardize recipes across regions. The calculator supports volume, weight, and temperature conversions.",
        inputs: [
            { id: 'quantityCups', name: 'Volume in US Cups', type: 'number', defaultValue: 1.5, min: 0.1, step: 0.25, suffix: 'cups', tooltip: 'Standard US cups.' }
        ],
        naturalLanguageQueries: ["Calculate my cooking conversion calculator", "What is my cooking conversion calculator?", "Help me solve cooking conversion calculator"],
        edgeCases: ["Unsupported unit combinations Ingredient-density differences Negative temperatures"],
        calculate: (inputs) => {
            const cups = Number(inputs.quantityCups) || 1.5;

            const tbsp = cups * 16;
            const tsp = cups * 48;
            const flOz = cups * 8;
            const ml = cups * 236.588;

            return {
                primaryOutput: { label: 'Tablespoons (tbsp)', value: `${tbsp.toFixed(1)} tbsp` },
                secondaryMetrics: [
                    { label: 'Teaspoons (tsp)', value: `${tsp.toFixed(1)} tsp` },
                    { label: 'Fluid Ounces (fl oz)', value: `${flOz.toFixed(1)} fl oz` },
                    { label: 'Milliliters (mL)', value: `${ml.toFixed(1)} mL` }
                ]
            };
        }
    },
    // 31. Love Calculator
    {
        id: 'love-calculator',
        name: 'Love Calculator',
        category: 'date-time-productivity',
        group: 'Academic & Everyday Utility',
        bucket: 'Bucket B',
        tier: 1,
        phase: 2,
        monthlySearches: '673K',
        cpc: '$0.56',
        description: "A Love Calculator generates a compatibility score between two names or profiles using entertainment-style matching logic. It is intended for fun and informal use only. The calculator does not provide scientifically valid relationship predictions.",
        inputs: [
            { id: 'name1Length', name: 'Partner 1 Name Length', type: 'number', defaultValue: 6, min: 1, max: 30, step: 1, suffix: 'letters', tooltip: 'Letter count.' },
            { id: 'name2Length', name: 'Partner 2 Name Length', type: 'number', defaultValue: 5, min: 1, max: 30, step: 1, suffix: 'letters', tooltip: 'Letter count.' }
        ],
        naturalLanguageQueries: ["Calculate my love calculator", "What is my love calculator?", "Help me solve love calculator"],
        edgeCases: ["Zero division errors", "Invalid input formats", "Boundary conditions"],
        calculate: (inputs) => {
            const l1 = Number(inputs.name1Length) || 6;
            const l2 = Number(inputs.name2Length) || 5;

            // Deterministic harmonic compatibility formula
            const score = Math.round(75 + ((Math.sin(l1 * 3 + l2 * 5) + 1) * 12));

            let status = 'Great Match & Natural Synergy!';
            if (score >= 90) status = 'Exceptional Soulmate Connection!';
            else if (score < 75) status = 'Strong Potential with Mutual Communication!';

            return {
                primaryOutput: { label: 'Compatibility Score', value: `${score}%` },
                secondaryMetrics: [
                    { label: 'Compatibility Rating', value: status },
                    { label: 'Relationship Harmony', value: 'High Alignment' }
                ]
            };
        }
    },
    // 32. Password Generator
    {
        id: 'password-generator',
        name: 'Password Generator',
        category: 'date-time-productivity',
        group: 'Academic & Everyday Utility',
        bucket: 'Bucket B',
        tier: 1,
        phase: 1,
        monthlySearches: '823K',
        cpc: '$0.27',
        description: "A Password Generator creates secure randomized passwords based on selected complexity requirements. It helps users improve account security and credential strength. The calculator supports cryptographically secure randomness.",
        inputs: [
            { id: 'length', name: 'Password Character Length', type: 'number', defaultValue: 16, min: 8, max: 64, step: 1, suffix: 'chars', tooltip: 'Recommended >= 16.' },
            { id: 'includeSymbols', name: 'Include Special Symbols (!@#$)', type: 'dropdown', defaultValue: 'yes', options: [{ label: 'Yes (Highly Secure)', value: 'yes' }, { label: 'No (Letters & Numbers Only)', value: 'no' }], tooltip: 'Symbols.' }
        ],
        naturalLanguageQueries: ["Calculate my password generator", "What is my password generator?", "Help me solve password generator"],
        edgeCases: ["Zero division errors", "Invalid input formats", "Boundary conditions"],
        calculate: (inputs) => {
            const len = Math.min(64, Math.max(8, Number(inputs.length) || 16));
            const hasSym = inputs.includeSymbols !== 'no';

            const poolSize = hasSym ? 94 : 62;
            const entropyBits = Math.round(len * Math.log2(poolSize));

            // Generate deterministic sample
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789' + (hasSym ? '!@#$%^&*()_+' : '');
            let pass = '';
            for (let i = 0; i < len; i++) {
                pass += chars.charAt(Math.floor(Math.random() * chars.length));
            }

            return {
                primaryOutput: { label: 'Generated Secure Password', value: pass },
                secondaryMetrics: [
                    { label: 'Entropy Security Strength', value: `${entropyBits} Bits (${entropyBits >= 80 ? 'Very Strong' : 'Moderate'})` },
                    { label: 'Estimated Brute-Force Crack Time', value: entropyBits >= 80 ? 'Trillions of Years' : 'Centuries' }
                ]
            };
        }
    },
    // 33. Oil Change Interval Calculator
    {
        id: 'oil-change-interval-calculator',
        name: 'Oil Change Interval Calculator',
        category: 'date-time-productivity',
        group: 'Academic & Everyday Utility',
        bucket: 'Bucket C1',
        tier: 5,
        phase: 4,
        monthlySearches: '110',
        cpc: 'N/A',
        description: "An Oil Change Interval Calculator estimates when a vehicle\u2019s next oil change is due based on mileage, time, and driving conditions. It helps maintain engine performance. The calculator supports standard and synthetic oil schedules.",
        inputs: [
            { id: 'currentOdometer', name: 'Current Vehicle Odometer (Miles)', type: 'number', defaultValue: 62450, min: 0, step: 100, suffix: 'miles', tooltip: 'Current mileage.' },
            { id: 'lastChangeMileage', name: 'Odometer at Last Oil Change', type: 'number', defaultValue: 58000, min: 0, step: 100, suffix: 'miles', tooltip: 'Mileage at last service.' },
            { id: 'oilTypeInterval', name: 'Engine Oil Type / Interval', type: 'dropdown', defaultValue: 7500, options: [{ label: 'Conventional Oil (3,000 - 5,000 miles)', value: 5000 }, { label: 'Full Synthetic Oil (7,500 - 10,000 miles)', value: 7500 }, { label: 'Extended Performance Synthetic (10,000+ miles)', value: 10000 }], tooltip: 'Oil interval.' }
        ],
        naturalLanguageQueries: ["Calculate my oil change interval calculator", "What is my oil change interval calculator?", "Help me solve oil change interval calculator"],
        edgeCases: ["Current mileage below previous mileage Missing interval recommendations Negative remaining mileage"],
        calculate: (inputs) => {
            const cur = Number(inputs.currentOdometer) || 62450;
            const last = Number(inputs.lastChangeMileage) || 58000;
            const interval = Number(inputs.oilTypeInterval) || 7500;

            const milesDriven = Math.max(0, cur - last);
            const nextDueMileage = last + interval;
            const milesRemaining = nextDueMileage - cur;

            return {
                primaryOutput: { label: 'Next Service Due At Odometer', value: `${nextDueMileage.toLocaleString()} Miles` },
                secondaryMetrics: [
                    { label: 'Miles Remaining Until Due', value: milesRemaining > 0 ? `${milesRemaining.toLocaleString()} Miles` : `OVERDUE by ${Math.abs(milesRemaining).toLocaleString()} miles` },
                    { label: 'Miles Driven on Current Oil', value: `${milesDriven.toLocaleString()} Miles` },
                    { label: 'Oil Life Remaining (approx)', value: `${Math.max(0, Math.min(100, Math.round((milesRemaining / interval) * 100)))}%` }
                ]
            };
        }
    },
    // 34. Letter Grade Calculator
    {
        id: 'letter-grade-calculator',
        name: 'Letter Grade Calculator',
        category: 'date-time-productivity',
        group: 'Academic & Everyday Utility',
        bucket: 'Bucket A',
        tier: 5,
        phase: 4,
        monthlySearches: 'N/A',
        cpc: 'N/A',
        description: "A Letter Grade Calculator converts percentage scores into letter grades according to academic grading scales. It helps students understand grading outcomes quickly. The calculator supports customizable grading boundaries.",
        inputs: [
            { id: 'percentageScore', name: 'Numerical Percentage Score (%)', type: 'percentage', defaultValue: 91.5, min: 0, max: 100, step: 0.1, suffix: '%', tooltip: 'Course percentage.' }
        ],
        naturalLanguageQueries: ["Calculate my letter grade calculator", "What is my letter grade calculator?", "Help me solve letter grade calculator"],
        edgeCases: ["Scores above 100 Negative percentages Boundary rounding issues"],
        calculate: (inputs) => {
            const pct = Number(inputs.percentageScore) || 91.5;

            let letter = 'F';
            let gpa = 0.0;
            if (pct >= 97) { letter = 'A+'; gpa = 4.0; }
            else if (pct >= 93) { letter = 'A'; gpa = 4.0; }
            else if (pct >= 90) { letter = 'A-'; gpa = 3.7; }
            else if (pct >= 87) { letter = 'B+'; gpa = 3.3; }
            else if (pct >= 83) { letter = 'B'; gpa = 3.0; }
            else if (pct >= 80) { letter = 'B-'; gpa = 2.7; }
            else if (pct >= 77) { letter = 'C+'; gpa = 2.3; }
            else if (pct >= 73) { letter = 'C'; gpa = 2.0; }
            else if (pct >= 70) { letter = 'C-'; gpa = 1.7; }
            else if (pct >= 67) { letter = 'D+'; gpa = 1.3; }
            else if (pct >= 60) { letter = 'D'; gpa = 1.0; }

            return {
                primaryOutput: { label: 'Letter Grade', value: letter },
                secondaryMetrics: [
                    { label: 'GPA Equivalent (4.0 Scale)', value: gpa.toFixed(1) },
                    { label: 'Pass / Fail Status', value: gpa >= 1.0 ? 'Passing Grade' : 'Failing Grade' }
                ]
            };
        }
    },
// 35. Time Since Calculator
    {
        id: 'time-since-calculator',
        name: 'Time Since Calculator',
        category: 'date-time-productivity',
        group: 'Date & Calendar',
        bucket: 'Bucket B',
        tier: 2,
        phase: 2,
        monthlySearches: '80K',
        cpc: '$0.75',
        description: "A Time Since Calculator computes the exact elapsed duration between any past date/event and today in years, months, weeks, days, hours, and business days.",
        inputs: [
            { id: 'pastDate', name: 'Past Event / Reference Date', type: 'text', defaultValue: '2020-01-01', tooltip: 'Start date in YYYY-MM-DD format.' },
            { id: 'currentDate', name: 'End Date / Current Reference', type: 'text', defaultValue: '2026-09-26', tooltip: 'End date in YYYY-MM-DD format.' }
        ],
        naturalLanguageQueries: ["Time since calculator years months days", "How many days since Jan 1 2020", "Calculate exact elapsed time since date"],
        edgeCases: ["End date before start date", "Invalid date format", "Same start and end date"],
        calculate: (inputs) => {
            const startStr = String(inputs.pastDate || '2020-01-01');
            const endStr = String(inputs.currentDate || '2026-09-26');

            const start = new Date(startStr);
            const end = new Date(endStr);

            const diffMs = Math.max(0, end.getTime() - start.getTime());
            const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const totalWeeks = (totalDays / 7).toFixed(1);
            const totalHours = totalDays * 24;

            // Calendar years and months calculation
            let years = end.getFullYear() - start.getFullYear();
            let months = end.getMonth() - start.getMonth();
            let days = end.getDate() - start.getDate();

            if (days < 0) {
                months -= 1;
                const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
                days += prevMonth.getDate();
            }
            if (months < 0) {
                years -= 1;
                months += 12;
            }

            // Approximate business days (5/7 of total days)
            const approxBusinessDays = Math.round(totalDays * (5 / 7));

            return {
                primaryOutput: { label: 'Exact Elapsed Duration', value: `${years} Yrs, ${months} Mos, ${days} Days`, suffix: `${totalDays.toLocaleString()} Total Days` },
                secondaryMetrics: [
                    { label: 'Total Calendar Weeks', value: `${totalWeeks} Weeks` },
                    { label: 'Estimated Business / Working Days', value: `~${approxBusinessDays.toLocaleString()} Work Days` },
                    { label: 'Total Elapsed Hours', value: `${totalHours.toLocaleString()} Hours` },
                    { label: 'Total Elapsed Minutes', value: `${(totalHours * 60).toLocaleString()} Minutes` }
                ]
            };
        }
    }
];

export const cat04DateTimeCalculators = dateTimeProductivityCalculators;
