'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { masterCategories } from '@/lib/categories';
import { getCalculatorsByCategory } from '@/lib/calculators';

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

    const filteredCalculators = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return allCategoryCalculators;

        return allCategoryCalculators.filter(
            (calc) =>
                calc.name.toLowerCase().includes(q) ||
                calc.description.toLowerCase().includes(q) ||
                calc.bucket?.toLowerCase().includes(q) ||
                calc.naturalLanguageQueries?.some((nlq) => nlq.toLowerCase().includes(q))
        );
    }, [allCategoryCalculators, query]);

    return (
        <main className="min-h-screen bg-[#0d1117] text-slate-100 p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                {/* Navigation Breadcrumb */}
                <div className="mb-6">
                    <Link
                        href="/"
                        className="text-xs font-mono text-emerald-400 hover:underline uppercase tracking-wider"
                    >
                        ← Back to All Categories
                    </Link>
                </div>

                {/* Category Header Card */}
                <header className="mb-6 p-6 bg-[#161b22] border border-slate-800 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/80 text-emerald-400 flex items-center justify-center shrink-0">
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
                            <span className="text-xs font-mono text-emerald-400">{currentCategory.groupCode}</span>
                            <h1 className="text-2xl font-bold text-white">{currentCategory.name}</h1>
                        </div>
                    </div>
                    <p className="text-sm text-slate-400 mt-2">{currentCategory.description}</p>
                </header>

                {/* Search Toolbar within Category */}
                <div className="mb-6">
                    <div className="relative max-w-xl">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-mono text-xs">
                            🔍
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={`Search in ${currentCategory.name}...`}
                            className="w-full bg-[#161b22] border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 transition font-mono"
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery('')}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 font-mono text-xs"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* Calculator Cards Grid */}
                {filteredCalculators.length === 0 ? (
                    <div className="p-8 text-center bg-[#161b22] border border-slate-800 rounded-xl">
                        <p className="text-slate-400 text-sm">No calculators matched your keyword in this category.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredCalculators.map((calc) => (
                            <Link
                                key={calc.id}
                                href={`/${calc.category}/${calc.id}`}
                                className="group p-5 bg-[#161b22] border border-slate-800 rounded-xl hover:border-emerald-500/50 hover:bg-[#1c2128] transition flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                            {calc.bucket}
                                        </span>
                                        {calc.cpc && (
                                            <span className="text-[10px] font-mono text-emerald-400">
                                                CPC {calc.cpc}
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-base font-semibold text-white group-hover:text-emerald-400 transition">
                                        {calc.name}
                                    </h2>
                                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                                        {calc.description}
                                    </p>
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between items-center text-xs text-emerald-400 font-mono">
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