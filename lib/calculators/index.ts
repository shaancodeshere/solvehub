import { CalculatorDefinition } from '../../types/calculator';

// Import all 12 category files
import { financialCalculators } from './cat01_financial';
import { healthFitnessCalculators } from './cat02_health_fitness';
import { mathScienceCalculators } from './cat03_math_science';
import { dateTimeProductivityCalculators } from './cat04_date_time_productivity';
import { constructionHomeCalculators } from './cat05_construction_home';
import { scienceEngineeringCalculators } from './cat06_science_engineering';
import { technologyComputingCalculators } from './cat07_technology_computing';
import { conversionUnitsCalculators } from './cat08_conversion_units';
import { legalComplianceCalculators } from './cat09_legal_compliance';
import { educationLearningCalculators } from './cat10_education_learning';
import { environmentSustainabilityCalculators } from './cat11_environment_sustainability';
import { gamesRecreationCalculators } from './cat12_games_recreation';

// Master aggregation array
export const allCalculators: CalculatorDefinition[] = [
    ...financialCalculators,
    ...healthFitnessCalculators,
    ...mathScienceCalculators,
    ...dateTimeProductivityCalculators,
    ...constructionHomeCalculators,
    ...scienceEngineeringCalculators,
    ...technologyComputingCalculators,
    ...conversionUnitsCalculators,
    ...legalComplianceCalculators,
    ...educationLearningCalculators,
    ...environmentSustainabilityCalculators,
    ...gamesRecreationCalculators,
];

// Lookup and filtering helpers
export function getCalculatorById(id: string): CalculatorDefinition | undefined {
    return allCalculators.find((c) => c.id === id);
}

export function getCalculatorsByBucket(bucket: 'Bucket A' | 'Bucket B' | 'Bucket C1'): CalculatorDefinition[] {
    return allCalculators.filter((c) => c.bucket === bucket);
}

export function getCalculatorsByCategory(category: string): CalculatorDefinition[] {
    return allCalculators.filter((c) => c.category === category);
}