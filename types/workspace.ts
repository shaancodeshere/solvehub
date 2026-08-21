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
    secondaryMetrics: { label: string; value: string }[];
    variables: CalculatedVariable[];
}

export interface CuratedTool {
    id: string;
    title: string;
    category: 'Business' | 'Finance' | 'Engineering' | 'Utility';
    description: string;
    icon: string;
}