import Link from 'next/link';
import { notFound } from 'next/navigation';
import { allCalculators, getCalculatorById } from '@/lib/calculators';
import { masterCategories } from '@/lib/categories';
import UniversalCalculator from '@/components/calculator/UniversalCalculator';

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
        <main className="min-h-screen bg-slate-900 text-white py-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto mb-6">
                <nav className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <Link href="/" className="hover:text-emerald-400 transition">
                        Home
                    </Link>
                    <span className="text-slate-600">/</span>
                    <Link
                        href={`/library/${calculator.category}`}
                        className="hover:text-emerald-400 transition"
                    >
                        {categoryName}
                    </Link>
                    <span className="text-slate-600">/</span>
                    <span className="text-emerald-400 font-semibold truncate">{calculator.name}</span>
                </nav>
            </div>
            <UniversalCalculator calculatorId={calculator.id} />
        </main>
    );
}