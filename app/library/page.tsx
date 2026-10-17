'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { masterCategories } from '@/lib/categories';
import { allCalculators } from '@/lib/calculators';
import { CalculatorDefinition } from '@/types/calculator';
import SidebarExpandButton from '@/components/layout/SidebarExpandButton';

export default function LibraryPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // 1. 200ms Debounced live search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 200);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    // 2. Category lookup map for fast title & group retrieval
    const categoryMap = useMemo(() => {
        const map = new Map<string, (typeof masterCategories)[0]>();
        masterCategories.forEach((cat) => {
            map.set(cat.slug, cat);
        });
        return map;
    }, []);

    // 3. Filtered calculators list
    const filteredCalculators = useMemo(() => {
        const q = debouncedQuery.trim().toLowerCase();

        return allCalculators.filter((calc) => {
            const matchesCat = selectedCategory === 'all' || calc.category === selectedCategory;
            if (!matchesCat) return false;

            if (!q) return true;

            return (
                calc.name.toLowerCase().includes(q) ||
                calc.description.toLowerCase().includes(q) ||
                calc.category.toLowerCase().includes(q) ||
                calc.naturalLanguageQueries?.some((nlq) => nlq.toLowerCase().includes(q))
            );
        });
    }, [debouncedQuery, selectedCategory]);

    return (
        <main className="flex-1 min-w-0 h-full overflow-y-auto p-6 sm:p-8 font-sans transition-colors duration-200">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Navigation Breadcrumbs */}
                <div className="flex items-center gap-2">
                    <SidebarExpandButton />
                    <nav className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                        <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                            Home
                        </Link>
                        <span className="text-slate-400 dark:text-slate-600">/</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Library</span>
                    </nav>
                </div>

                {/* Header Banner */}
                <header className="p-6 bg-[#e8edf2] dark:bg-[#121824] border border-[#cbd5e1] dark:border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-slate-900 dark:text-white">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-400 mb-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 inline-block animate-pulse"></span>
                            <span>CENTRAL REPOSITORY • 12 CATEGORIES</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight font-mono">
                            Calculator Library
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
                            Search and explore all 487 dynamic computational tools, formulas, and domain engines.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <div className="px-4 py-2.5 bg-[#dbe3eb] dark:bg-slate-900/90 border border-[#cbd5e1] dark:border-slate-700/80 rounded-xl text-center">
                            <span className="block text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                                {allCalculators.length}
                            </span>
                            <span className="text-xs font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold">
                                Total Tools
                            </span>
                        </div>
                    </div>
                </header>

                {/* Filter Toolbar: Search + Categories */}
                <div className="space-y-4">
                    {/* Search Input */}
                    <div className="relative max-w-3xl">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-mono text-sm">
                            🔍
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search calculators by name, keywords, formulas (e.g., SIP, EMI, concrete, mortgage)..."
                            className="w-full bg-[#f3f6f9] dark:bg-slate-900/90 border border-[#cbd5e1] dark:border-slate-800 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 transition font-mono shadow-inner"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-mono text-xs"
                                title="Clear search"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Category Filter Chips (Horizontal Scroll) */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs font-mono">
                        <span className="text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider shrink-0 mr-1 font-semibold">
                            Category:
                        </span>
                        <button
                            type="button"
                            onClick={() => setSelectedCategory('all')}
                            className={`px-3 py-1.5 rounded-lg border transition whitespace-nowrap shrink-0 ${
                                selectedCategory === 'all'
                                    ? 'bg-emerald-500/20 dark:bg-emerald-950/80 border-emerald-500/50 text-emerald-800 dark:text-emerald-300 font-semibold'
                                    : 'bg-[#e2e8f0] dark:bg-slate-900/80 border-[#cbd5e1] dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-[#d5dde5] dark:hover:bg-slate-800'
                            }`}
                        >
                            All Categories ({allCalculators.length})
                        </button>
                        {masterCategories.map((cat) => {
                            const count = allCalculators.filter((c) => c.category === cat.slug).length;
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat.slug)}
                                    className={`px-3 py-1.5 rounded-lg border transition whitespace-nowrap shrink-0 ${
                                        selectedCategory === cat.slug
                                            ? 'bg-emerald-500/20 dark:bg-emerald-950/80 border-emerald-500/50 text-emerald-800 dark:text-emerald-300 font-semibold'
                                            : 'bg-[#e2e8f0] dark:bg-slate-900/80 border-[#cbd5e1] dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-[#d5dde5] dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {cat.name} ({count})
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Results Counter / Active Filter Bar */}
                <div className="flex items-center justify-between text-sm font-mono text-slate-600 dark:text-slate-400 pt-3 border-t border-[#cbd5e1] dark:border-slate-800/80">
                    <div>
                        Showing <span className="text-slate-900 dark:text-white font-bold">{filteredCalculators.length}</span> of{' '}
                        <span className="text-slate-700 dark:text-slate-300">{allCalculators.length}</span> calculators
                        {selectedCategory !== 'all' && (
                            <span className="text-sky-600 dark:text-sky-400 ml-1.5">
                                • {categoryMap.get(selectedCategory)?.name || selectedCategory}
                            </span>
                        )}
                    </div>
                    {(debouncedQuery || selectedCategory !== 'all') && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedCategory('all');
                            }}
                            className="text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition"
                        >
                            Reset filters
                        </button>
                    )}
                </div>

                {/* Calculator Cards Grid */}
                {filteredCalculators.length === 0 ? (
                    <div className="p-12 text-center bg-[#e8edf2] dark:bg-[#161b22] border border-[#cbd5e1] dark:border-slate-800 rounded-2xl space-y-3">
                        <div className="text-3xl">🔍</div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white font-mono">No calculators found</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                            No tools matched your current search query or filter combination. Try adjusting your
                            keywords or selected category.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedCategory('all');
                            }}
                            className="mt-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/80 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-sm font-mono hover:bg-emerald-500/20 dark:hover:bg-emerald-900 transition"
                        >
                            Clear All Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredCalculators.map((calc: CalculatorDefinition) => {
                            const catDef = categoryMap.get(calc.category);

                            return (
                                <Link
                                    key={calc.id}
                                    href={`/${calc.category}/${calc.id}`}
                                    className="group p-6 bg-[#e8edf2] dark:bg-[#121824] border border-[#cbd5e1] dark:border-slate-800/90 rounded-2xl hover:border-emerald-500/50 hover:bg-[#dbe3eb] dark:hover:bg-[#1c2128] transition flex flex-col justify-between shadow-sm"
                                >
                                    <div>
                                        {/* Meta Header */}
                                        <div className="flex justify-between items-start mb-3 gap-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-[#dbe3eb] dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-[#cbd5e1] dark:border-slate-700/80">
                                                    {catDef?.groupCode || 'CAT'}
                                                </span>
                                                <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[#dbe3eb] dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-[#cbd5e1] dark:border-slate-700">
                                                    {calc.bucket}
                                                </span>
                                            </div>
                                            {calc.cpc && (
                                                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
                                                    CPC {calc.cpc}
                                                </span>
                                            )}
                                        </div>

                                        {/* Category Label */}
                                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 block mb-1">
                                            {catDef?.name || calc.category}
                                        </span>

                                        {/* Title */}
                                        <h2 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition font-sans">
                                            {calc.name}
                                        </h2>

                                        {/* Description */}
                                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                                            {calc.description}
                                        </p>
                                    </div>

                                    {/* Action Footer */}
                                    <div className="mt-5 pt-3.5 border-t border-[#cbd5e1] dark:border-slate-800/80 flex justify-between items-center text-sm text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                                        <span>Launch Tool</span>
                                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
