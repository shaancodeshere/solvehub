export type WorkspaceMode = 'canvas' | 'curated';

export interface CalculatedVariable {
    name: string;
    value: number;
    rawExpression: string;
    formattedValue: string;
    isError?: boolean;
}

export interface CalculationReceipt {
    primaryVariable: string;
    primaryValue: string;
    secondaryMetrics?: Array<{ label: string; value: string }>;
    variables: CalculatedVariable[];
}

export interface ToolInputParam {
    key: string;
    label: string;
    defaultValue: number;
    prefix?: string;
    suffix?: string;
    step?: number;
    min?: number;
    max?: number;
}

export interface CuratedTool {
    id: string;
    title: string;
    category: 'Business' | 'Finance' | 'Engineering' | 'Operations';
    description: string;
    icon: string;
    inputs?: ToolInputParam[];
    calculate?: (values: Record<string, number>) => CalculationReceipt;
}