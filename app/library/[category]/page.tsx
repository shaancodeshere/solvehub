import Link from 'next/link';
import { notFound } from 'next/navigation';
import { masterCategories } from '@/lib/categories';
import { getCalculatorsByCategory } from '@/lib/calculators';

interface PageProps {
    params: Promise<{
        category: string;
    }>;
}

export async function generateStaticParams() {
    return masterCategories.map((c) => ({
        category: c.slug,
    }));
}

export default async function CategoryListingPage({ params }: PageProps) {
    const { category: categorySlug } = await params;
    const currentCategory = masterCategories.find((c) => c.slug === categorySlug);

    if (!currentCategory) {
        notFound();
    }

    const categoryCalculators = getCalculatorsByCategory(categorySlug);

    return (
        <main className="min-h-screen bg-[#0d1117] text-slate-100 p-8">
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

                {/* Category Header */}
                <header className="mb-8 p-6 bg-[#161b22] border border-slate-800 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{currentCategory.icon}</span>
                        <div>
                            <span className="text-xs font-mono text-emerald-400">{currentCategory.groupCode}</span>
                            <h1 className="text-2xl font-bold text-white">{currentCategory.name}</h1>
                        </div>
                    </div>
                    <p className="text-sm text-slate-400 mt-2">{currentCategory.description}</p>
                    <div className="text-xs font-mono text-slate-500 mt-3">
                        {categoryCalculators.length} calculators ready in this category
                    </div>
                </header>

                {/* Category Calculators Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {categoryCalculators.map((calc) => (
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
            </div>
        </main>
    );
}