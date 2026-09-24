export interface BridgeMetric {
    label: string;
    value: string | number;
    prefix?: string;
    suffix?: string;
}

export interface BridgePayload {
    parameters: { label: string; value: number | string }[];
    primaryOutput: { label: string; value: string | number; prefix?: string; suffix?: string };
    secondaryMetrics: BridgeMetric[];
}

/**
 * Sets Section B to only the parameter inputs and stores the calculation outputs for Section C
 */
export function sendCalculatorToCanvas(payload: BridgePayload): void {
    try {
        // 1. Format parameter lines in clean plain English without underscores or punctuation
        const paramLines: string[] = [];
        payload.parameters.forEach((param) => {
            // Retain parentheses, letters, numbers, and clean up extra spaces
            const cleanLabel = param.label
                .trim()
                .replace(/[^a-zA-Z0-9\s()/%-]/g, ' ')
                .replace(/\s+/g, ' ');

            const cleanVal =
                typeof param.value === 'number'
                    ? param.value
                    : param.value.toString().replace(/[^0-9.-]/g, '');

            if (cleanLabel && cleanVal !== '') {
                paramLines.push(`${cleanLabel} ${cleanVal}`);
            }
        });

        // 2. Overwrite Section B with ONLY the parameters from the chosen calculator
        const cleanCanvasText = paramLines.join('\n');
        localStorage.setItem('solvehub_active_canvas', cleanCanvasText);

        // 3. Store the output hero and secondary metrics for Section C
        const outputData = {
            primaryOutput: payload.primaryOutput,
            secondaryMetrics: payload.secondaryMetrics,
        };
        localStorage.setItem('solvehub_active_calculator_output', JSON.stringify(outputData));
    } catch (err) {
        console.error('Failed to bridge calculator to canvas:', err);
    }
}