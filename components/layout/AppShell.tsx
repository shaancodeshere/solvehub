import React from 'react';
import SectionA from './SectionA';
import SectionB from './SectionB';
import SectionC from './SectionC';

export default function AppShell() {
    return (
        <div className="flex h-screen w-screen overflow-hidden bg-black antialiased">
            {/* Section A: Fixed 260px Left Navigator */}
            <SectionA />

            {/* Section B: Fluid Center Calculation Workspace */}
            <SectionB />

            {/* Section C: Fixed 320px Right Inspector / Receipt */}
            <SectionC />
        </div>
    );
}