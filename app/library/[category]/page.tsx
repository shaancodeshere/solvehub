'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { masterCategories } from '@/lib/categories';
import { getCalculatorsByCategory } from '@/lib/calculators';
import { CalculatorDefinition } from '@/types/calculator';
import SidebarExpandButton from '@/components/layout/SidebarExpandButton';

export default function CategoryListingPage() {
    const params = useParams();
    const categorySlug = params.category as string;
    const currentCategory = masterCategories.find(
        (c) => c.slug === categorySlug || c.id === categorySlug
    );

    if (!currentCategory) {
        notFound();
    }

    const allCategoryCalculators = useMemo(
        () => getCalculatorsByCategory(currentCategory.slug),
        [currentCategory]
    );

    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    // 200ms Debounce timer
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, 200);
        return () => clearTimeout(handler);
    }, [query]);

    // Filtered calculators list
    const filteredCalculators = useMemo(() => {
        const q = debouncedQuery.trim().toLowerCase();

        return allCategoryCalculators.filter((calc) => {
            if (!q) return true;

            return (
                calc.name.toLowerCase().includes(q) ||
                calc.description.toLowerCase().includes(q) ||
                calc.bucket?.toLowerCase().includes(q) ||
                calc.naturalLanguageQueries?.some((nlq) => nlq.toLowerCase().includes(q))
            );
        });
    }, [allCategoryCalculators, debouncedQuery]);

    return (
        <main className="flex-1 min-w-0 h-full overflow-y-auto p-6 sm:p-8 font-sans transition-colors duration-200">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Hierarchical Breadcrumbs */}
                <div className="flex items-center gap-2">
                    <SidebarExpandButton />
                    <nav className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                        <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                            Home
                        </Link>
                        <span className="text-slate-400 dark:text-slate-600">/</span>
                        <Link href="/library" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                            Library
                        </Link>
                        <span className="text-slate-400 dark:text-slate-600">/</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{currentCategory.name}</span>
                    </nav>
                </div>

                {/* Navigation Back Link */}
                <div>
                    <Link
                        href="/library"
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition uppercase tracking-wider"
                    >
                        <span>←</span>
                        <span>Back to All Calculators</span>
                    </Link>
                </div>

                {/* Category Header Card */}
                <header className="p-6 bg-[#e8edf2] dark:bg-[#121824] border border-[#cbd5e1] dark:border-slate-800 rounded-xl text-slate-900 dark:text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-[#d5dde5] dark:bg-slate-800/80 border border-[#cbd5e1] dark:border-slate-700/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                                dangerouslySetInnerHTML={{ __html: currentCategory.iconSvg }}
                            />
                        </div>
                        <div>
                            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">{currentCategory.groupCode}</span>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{currentCategory.name}</h1>
                        </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{currentCategory.description}</p>
                </header>

                {/* Search Toolbar */}
                <div className="space-y-4">
                    {/* Search Input */}
                    <div className="relative max-w-xl">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-mono text-xs">
                            🔍
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={`Search in ${currentCategory.name}...`}
                            className="w-full bg-[#f3f6f9] dark:bg-slate-900/90 border border-[#cbd5e1] dark:border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 transition font-mono shadow-inner"
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery('')}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-mono text-xs"
                                title="Clear search"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* Results Count Summary */}
                <div className="flex items-center justify-between text-sm font-mono text-slate-600 dark:text-slate-400 pt-3 border-t border-[#cbd5e1] dark:border-slate-800/80">
                    <div>
                        Showing <span className="text-slate-900 dark:text-white font-bold">{filteredCalculators.length}</span> of{' '}
                        <span className="text-slate-700 dark:text-slate-300">{allCategoryCalculators.length}</span> calculators in this category
                    </div>
                    {debouncedQuery && (
                        <button
                            type="button"
                            onClick={() => {
                                setQuery('');
                            }}
                            className="text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition"
                        >
                            Reset filters
                        </button>
                    )}
                </div>

                {/* Calculator Cards Grid */}
                {filteredCalculators.length === 0 ? (
                    <div className="p-8 text-center bg-[#e8edf2] dark:bg-[#161b22] border border-[#cbd5e1] dark:border-slate-800 rounded-2xl space-y-3">
                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                            No calculators matched your keyword in this category.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setQuery('');
                            }}
                            className="px-4 py-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/80 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-sm font-mono hover:bg-emerald-500/20 dark:hover:bg-emerald-900 transition"
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredCalculators.map((calc: CalculatorDefinition) => (
                            <Link
                                key={calc.id}
                                href={`/${calc.category}/${calc.id}`}
                                className="group p-6 bg-[#e8edf2] dark:bg-[#121824] border border-[#cbd5e1] dark:border-slate-800/90 rounded-2xl hover:border-emerald-500/50 hover:bg-[#dbe3eb] dark:hover:bg-[#1c2128] transition flex flex-col justify-between shadow-sm"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-3 gap-2">
                                        <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-[#dbe3eb] dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-[#cbd5e1] dark:border-slate-700">
                                            {calc.bucket}
                                        </span>
                                        {calc.cpc && (
                                            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
                                                CPC {calc.cpc}
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition font-sans">
                                        {calc.name}
                                    </h2>
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                                        {calc.description}
                                    </p>
                                </div>

                                <div className="mt-5 pt-3.5 border-t border-[#cbd5e1] dark:border-slate-800/80 flex justify-between items-center text-sm text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                                    <span>Launch Tool</span>
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}