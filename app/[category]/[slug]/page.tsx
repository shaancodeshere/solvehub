import { notFound } from 'next/navigation';
import { allCalculators, getCalculatorById } from '@/lib/calculators';
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

    return (
        <main className="min-h-screen bg-slate-900 text-white py-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto mb-6">
                <a
                    href="/"
                    className="text-xs text-emerald-400 hover:underline uppercase tracking-wider font-mono"
                >
                    ← Back to Catalog
                </a>
            </div>
            <UniversalCalculator calculatorId={calculator.id} />
        </main>
    );
}