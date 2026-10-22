import React, { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { allCalculators, getCalculatorById } from '@/lib/calculators';
import { masterCategories } from '@/lib/categories';
import UniversalCalculator from '@/components/calculator/UniversalCalculator';
import SidebarExpandButton from '@/components/layout/SidebarExpandButton';

interface PageProps {
    params: Promise<{
        category: string;
        slug: string;
    }>;
}

// 1. Generate static pages for calculators at build time
export async function generateStaticParams() {
    return allCalculators.map((calc) => ({
        category: calc.category,
        slug: calc.id,
    }));
}

// 2. Dynamic SEO title and description
export async function generateMetadata({ params }: PageProps) {
    const resolvedParams = await params;
    const calculator = getCalculatorById(resolvedParams.slug);
    if (!calculator) return {};

    return {
        title: `${calculator.name} — Free Online Tool`,
        description: calculator.description,
    };
}

// 3. Main Page Component: Passes ONLY the slug (string) to the Client Component
export default async function CalculatorPage({ params }: PageProps) {
    const resolvedParams = await params;
    const calculator = getCalculatorById(resolvedParams.slug);

    if (!calculator) {
        notFound();
    }

    const categoryDef = masterCategories.find(
        (c) => c.slug === calculator.category || c.id === calculator.category
    );
    const categoryName = categoryDef?.name || calculator.category;

    return (
        <main className="flex-1 min-w-0 h-full overflow-y-auto pt-2 pb-4 px-2.5 sm:pt-3 sm:pb-6 sm:px-6 transition-colors">
            <div className="max-w-3xl w-full mx-auto mb-2">
                <nav className="flex items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400 overflow-x-auto scrollbar-none whitespace-nowrap py-1">
                    <SidebarExpandButton />
                    <Link href="/" className="hover:text-emerald-500 transition shrink-0">
                        Home
                    </Link>
                    <span className="text-slate-400 dark:text-slate-600 shrink-0">/</span>
                    <Link href="/library" className="hover:text-emerald-500 transition shrink-0">
                        Library
                    </Link>
                    <span className="text-slate-400 dark:text-slate-600 shrink-0">/</span>
                    <Link
                        href={`/library/${calculator.category}`}
                        className="hover:text-emerald-500 transition truncate max-w-[120px] sm:max-w-[160px] shrink-0"
                    >
                        {categoryName}
                    </Link>
                    <span className="text-slate-400 dark:text-slate-600 shrink-0">/</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold truncate max-w-[160px] sm:max-w-[240px] shrink-0">{calculator.name}</span>
                </nav>
            </div>
            <Suspense fallback={<div className="max-w-3xl mx-auto p-4 bg-[var(--surface)] dark:bg-[#161b22] border border-[var(--border)] dark:border-slate-800 rounded-xl text-slate-500 font-mono text-xs">Loading calculator...</div>}>
                <UniversalCalculator calculatorId={calculator.id} />
            </Suspense>
        </main>
    );
}