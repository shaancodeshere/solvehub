export interface CalculatorInput {
    id: string;
    name: string;
    type: 'number' | 'currency' | 'percentage' | 'dropdown' | 'text' | 'date' | 'toggle';
    defaultValue: any;
    min?: number;
    max?: number;
    step?: number;
    prefix?: string;
    suffix?: string;
    options?: { label: string; value: any }[];
    tooltip?: string;
}

export interface MetricItem {
    label: string;
    value: string | number;
    prefix?: string;
    suffix?: string;
}

export interface CalculationResult {
    primaryOutput: MetricItem;
    secondaryMetrics?: MetricItem[];
}

export interface CalculatorDefinition {
    id: string;
    name: string;
    category: string;
    group?: string;
    bucket: 'Bucket A' | 'Bucket B' | 'Bucket C1';
    tier?: number;
    phase?: number;
    monthlySearches?: string;
    cpc?: string;
    description: string;
    inputs: CalculatorInput[];
    naturalLanguageQueries?: string[];
    edgeCases?: string[];
    calculate: (inputs: Record<string, any>) => CalculationResult;
}