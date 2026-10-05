'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { masterCategories } from '@/lib/categories';
import { getCalculatorsByCategory } from '@/lib/calculators';
import { CalculatorDefinition } from '@/types/calculator';

type BucketFilter = 'all' | 'Bucket A' | 'Bucket B' | 'Bucket C1' | 'Bucket C';

interface BucketPillOption {
    id: BucketFilter;
    label: string;
}

const BUCKET_PILLS: BucketPillOption[] = [
    { id: 'all', label: 'All' },
    { id: 'Bucket A', label: 'Bucket A (US Core)' },
    { id: 'Bucket B', label: 'Bucket B (Universal)' },
    { id: 'Bucket C1', label: 'Bucket C1 (Unit-Flexible)' },
    { id: 'Bucket C', label: 'Bucket C (Regional)' },
];

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
    const [selectedBucket, setSelectedBucket] = useState<BucketFilter>('all');

    // 200ms Debounce timer
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, 200);
        return () => clearTimeout(handler);
    }, [query]);

    // Live Bucket Counts within this category (filtered by query)
    const bucketCounts = useMemo(() => {
        const counts: Record<BucketFilter, number> = {
            all: 0,
            'Bucket A': 0,
            'Bucket B': 0,
            'Bucket C1': 0,
            'Bucket C': 0,
        };

        const q = debouncedQuery.trim().toLowerCase();

        allCategoryCalculators.forEach((calc) => {
            const matchesQuery =
                !q ||
                calc.name.toLowerCase().includes(q) ||
                calc.description.toLowerCase().includes(q) ||
                calc.bucket?.toLowerCase().includes(q) ||
                calc.naturalLanguageQueries?.some((nlq) => nlq.toLowerCase().includes(q));

            if (matchesQuery) {
                counts.all += 1;
                if (calc.bucket in counts) {
                    counts[calc.bucket as BucketFilter] += 1;
                }
            }
        });

        return counts;
    }, [allCategoryCalculators, debouncedQuery]);

    // Filtered calculators list
    const filteredCalculators = useMemo(() => {
        const q = debouncedQuery.trim().toLowerCase();

        return allCategoryCalculators.filter((calc) => {
            const matchesBucket = selectedBucket === 'all' || calc.bucket === selectedBucket;
            if (!matchesBucket) return false;

            if (!q) return true;

            return (
                calc.name.toLowerCase().includes(q) ||
                calc.description.toLowerCase().includes(q) ||
                calc.bucket?.toLowerCase().includes(q) ||
                calc.naturalLanguageQueries?.some((nlq) => nlq.toLowerCase().includes(q))
            );
        });
    }, [allCategoryCalculators, debouncedQuery, selectedBucket]);

    return (
        <main className="min-h-screen bg-[#0d1117] text-slate-100 p-6 sm:p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Hierarchical Breadcrumbs */}
                <nav className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <Link href="/" className="hover:text-emerald-400 transition">
                        Home
                    </Link>
                    <span className="text-slate-600">/</span>
                    <Link href="/library" className="hover:text-emerald-400 transition">
                        Library
                    </Link>
                    <span className="text-slate-600">/</span>
                    <span className="text-emerald-400 font-semibold">{currentCategory.name}</span>
                </nav>

                {/* Navigation Back Link */}
                <div>
                    <Link
                        href="/library"
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 hover:text-emerald-300 transition uppercase tracking-wider"
                    >
                        <span>←</span>
                        <span>Back to All Calculators</span>
                    </Link>
                </div>

                {/* Category Header Card */}
                <header className="p-6 bg-[#161b22] border border-slate-800 rounded-xl">
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
                            <h1 className="text-2xl font-bold text-white font-mono">{currentCategory.name}</h1>
                        </div>
                    </div>
                    <p className="text-sm text-slate-400 mt-2">{currentCategory.description}</p>
                </header>

                {/* Search Toolbar + Bucket Filter Pills */}
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
                            className="w-full bg-[#161b22] border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 transition font-mono"
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery('')}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 font-mono text-xs"
                                title="Clear search"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Bucket Quick Filter Pills */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono">
                        <span className="text-slate-500 text-[10px] uppercase tracking-wider shrink-0 mr-1">
                            Bucket Filter:
                        </span>
                        {BUCKET_PILLS.map((pill) => {
                            const count = bucketCounts[pill.id];
                            const isActive = selectedBucket === pill.id;

                            return (
                                <button
                                    key={pill.id}
                                    type="button"
                                    onClick={() => setSelectedBucket(pill.id)}
                                    className={`px-3 py-1.5 rounded-full border transition flex items-center gap-2 ${
                                        isActive
                                            ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-sm'
                                            : 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-600'
                                    }`}
                                >
                                    <span>{pill.label}</span>
                                    <span
                                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                                            isActive
                                                ? 'bg-slate-950/20 text-slate-950'
                                                : 'bg-slate-800 text-emerald-400 border border-emerald-500/20'
                                        }`}
                                    >
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Results Count Summary */}
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                    <div>
                        Showing <span className="text-white font-bold">{filteredCalculators.length}</span> of{' '}
                        <span className="text-slate-300">{allCategoryCalculators.length}</span> calculators in this category
                        {selectedBucket !== 'all' && (
                            <span className="text-emerald-400 ml-1.5">• Filter: {selectedBucket}</span>
                        )}
                    </div>
                    {(debouncedQuery || selectedBucket !== 'all') && (
                        <button
                            type="button"
                            onClick={() => {
                                setQuery('');
                                setSelectedBucket('all');
                            }}
                            className="text-slate-400 hover:text-rose-400 transition"
                        >
                            Reset filters
                        </button>
                    )}
                </div>

                {/* Calculator Cards Grid */}
                {filteredCalculators.length === 0 ? (
                    <div className="p-8 text-center bg-[#161b22] border border-slate-800 rounded-xl space-y-3">
                        <p className="text-slate-400 text-sm">
                            No calculators matched your keyword or bucket filter in this category.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setQuery('');
                                setSelectedBucket('all');
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono hover:bg-emerald-900 transition"
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredCalculators.map((calc: CalculatorDefinition) => (
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
                                    <h2 className="text-base font-semibold text-white group-hover:text-emerald-400 transition font-sans">
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