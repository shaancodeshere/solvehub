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
        <main className="flex-1 min-w-0 h-full overflow-y-auto py-12 px-4 sm:px-6 transition-colors">
            <div className="max-w-3xl w-full mx-auto mb-6">
                <nav className="flex items-center gap-2 text-sm font-mono text-slate-500 dark:text-slate-400">
                    <SidebarExpandButton />
                    <Link href="/" className="hover:text-emerald-500 transition">
                        Home
                    </Link>
                    <span className="text-slate-400 dark:text-slate-600">/</span>
                    <Link href="/library" className="hover:text-emerald-500 transition">
                        Library
                    </Link>
                    <span className="text-slate-400 dark:text-slate-600">/</span>
                    <Link
                        href={`/library/${calculator.category}`}
                        className="hover:text-emerald-500 transition"
                    >
                        {categoryName}
                    </Link>
                    <span className="text-slate-400 dark:text-slate-600">/</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold truncate">{calculator.name}</span>
                </nav>
            </div>
            <Suspense fallback={<div className="max-w-3xl mx-auto p-6 bg-[var(--surface)] dark:bg-[#161b22] border border-[var(--border)] dark:border-slate-800 rounded-2xl text-slate-500 font-mono">Loading calculator...</div>}>
                <UniversalCalculator calculatorId={calculator.id} />
            </Suspense>
        </main>
    );
}