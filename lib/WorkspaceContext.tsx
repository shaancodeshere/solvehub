'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { WorkspaceMode, CalculationReceipt } from '@/types/workspace';

interface WorkspaceContextType {
    mode: WorkspaceMode;
    setMode: (mode: WorkspaceMode) => void;
    rawScratchpad: string;
    setRawScratchpad: (val: string) => void;
    receipt: CalculationReceipt;
    setReceipt: React.Dispatch<React.SetStateAction<CalculationReceipt>>;
}

const defaultScratchpad = `revenue = 120000
operating_expenses = 45000
net_profit = revenue - operating_expenses`;

const defaultReceipt: CalculationReceipt = {
    primaryVariable: 'net_profit',
    primaryValue: '$75,000',
    secondaryMetrics: [{ label: 'Margin', value: '62.5%' }],
    variables: [
        { name: 'revenue', value: 120000, rawExpression: '120000', formattedValue: '$120,000' },
        { name: 'operating_expenses', value: 45000, rawExpression: '45000', formattedValue: '$45,000' },
    ],
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = useState<WorkspaceMode>('canvas');
    const [rawScratchpad, setRawScratchpad] = useState<string>(defaultScratchpad);
    const [receipt, setReceipt] = useState<CalculationReceipt>(defaultReceipt);
    const [isHydrated, setIsHydrated] = useState(false);

    // Load persisted buffer from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('solvehub_scratchpad');
        if (saved !== null) {
            setRawScratchpad(saved);
        }
        const savedMode = localStorage.getItem('solvehub_mode') as WorkspaceMode | null;
        if (savedMode) {
            setMode(savedMode);
        }
        setIsHydrated(true);
    }, []);

    // Save changes to localStorage
    useEffect(() => {
        if (isHydrated) {
            localStorage.setItem('solvehub_scratchpad', rawScratchpad);
            localStorage.setItem('solvehub_mode', mode);
        }
    }, [rawScratchpad, mode, isHydrated]);

    return (
        <WorkspaceContext.Provider
            value={{
                mode,
                setMode,
                rawScratchpad,
                setRawScratchpad,
                receipt,
                setReceipt,
            }}
        >
            {children}
        </WorkspaceContext.Provider>
    );
}

export function useWorkspace() {
    const context = useContext(WorkspaceContext);
    if (!context) {
        throw new Error('useWorkspace must be used within a WorkspaceProvider');
    }
    return context;
}