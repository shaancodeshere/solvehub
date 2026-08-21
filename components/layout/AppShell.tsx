'use client';

import React from 'react';
import { WorkspaceProvider } from '@/lib/WorkspaceContext';
import SectionA from './SectionA';
import SectionB from './SectionB';
import SectionC from './SectionC';

export default function AppShell() {
    return (
        <WorkspaceProvider>
            <div className="flex h-screen w-screen overflow-hidden bg-black antialiased">
                <SectionA />
                <SectionB />
                <SectionC />
            </div>
        </WorkspaceProvider>
    );
}