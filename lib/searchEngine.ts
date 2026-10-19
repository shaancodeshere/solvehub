import { CalculatorDefinition } from '@/types/calculator';
import { masterCategories } from '@/lib/categories';

// Category mapping helper
const categoryNameMap = new Map<string, string>();
masterCategories.forEach((cat) => {
  categoryNameMap.set(cat.slug, cat.name);
  categoryNameMap.set(cat.id, cat.name);
});

export type UnitDomain =
  | 'length'
  | 'weight'
  | 'temperature'
  | 'volume'
  | 'speed'
  | 'area';

// Unit aliases dictionary mapping common units, abbreviations, and plurals to domains
export const UNIT_TO_DOMAIN: Record<string, UnitDomain> = {
  // Length units (cm, meter, millimetre, inch, feet, yard, km, mile)
  cm: 'length',
  centimeter: 'length',
  centimeters: 'length',
  centimetre: 'length',
  centimetres: 'length',
  m: 'length',
  meter: 'length',
  meters: 'length',
  metre: 'length',
  metres: 'length',
  mm: 'length',
  millimeter: 'length',
  millimeters: 'length',
  millimetre: 'length',
  millimetres: 'length',
  km: 'length',
  kilometer: 'length',
  kilometers: 'length',
  kilometre: 'length',
  kilometres: 'length',
  in: 'length',
  inch: 'length',
  inches: 'length',
  ft: 'length',
  foot: 'length',
  feet: 'length',
  yd: 'length',
  yard: 'length',
  yards: 'length',
  mi: 'length',
  mile: 'length',
  miles: 'length',
  nm: 'length',
  'nautical mile': 'length',
  'nautical miles': 'length',

  // Weight / Mass units (kg, gram, pound, lbs, ounce, oz, ton)
  kg: 'weight',
  kilogram: 'weight',
  kilograms: 'weight',
  kilo: 'weight',
  kilos: 'weight',
  g: 'weight',
  gram: 'weight',
  grams: 'weight',
  mg: 'weight',
  milligram: 'weight',
  milligrams: 'weight',
  lb: 'weight',
  lbs: 'weight',
  pound: 'weight',
  pounds: 'weight',
  oz: 'weight',
  ounce: 'weight',
  ounces: 'weight',
  ton: 'weight',
  tons: 'weight',
  tonne: 'weight',
  tonnes: 'weight',
  st: 'weight',
  stone: 'weight',
  stones: 'weight',

  // Temperature units (celsius, fahrenheit, kelvin)
  c: 'temperature',
  celsius: 'temperature',
  centigrade: 'temperature',
  f: 'temperature',
  fahrenheit: 'temperature',
  k: 'temperature',
  kelvin: 'temperature',
  r: 'temperature',
  rankine: 'temperature',

  // Volume units (liter, gallon, quart, pint, cup, etc.)
  l: 'volume',
  liter: 'volume',
  liters: 'volume',
  litre: 'volume',
  litres: 'volume',
  ml: 'volume',
  milliliter: 'volume',
  milliliters: 'volume',
  gal: 'volume',
  gallon: 'volume',
  gallons: 'volume',
  qt: 'volume',
  quart: 'volume',
  quarts: 'volume',
  pt: 'volume',
  pint: 'volume',
  pints: 'volume',
  cup: 'volume',
  cups: 'volume',

  // Speed units
  mph: 'speed',
  kph: 'speed',
  knot: 'speed',
  knots: 'speed',

  // Area units
  acre: 'area',
  acres: 'area',
  hectare: 'area',
  hectares: 'area',
  sqft: 'area',
  sqm: 'area',
};

// Unit aliases dictionary for query normalization & expansions
export const UNIT_ALIASES: Record<string, string[]> = {
  // Length
  cm: ['cm', 'centimeter', 'centimeters', 'centimetre', 'centimetres'],
  centimeter: ['cm', 'centimeter', 'centimeters', 'centimetre', 'centimetres'],
  centimeters: ['cm', 'centimeter', 'centimeters', 'centimetre', 'centimetres'],
  centimetre: ['cm', 'centimeter', 'centimeters', 'centimetre', 'centimetres'],
  centimetres: ['cm', 'centimeter', 'centimeters', 'centimetre', 'centimetres'],
  m: ['m', 'meter', 'meters', 'metre', 'metres'],
  meter: ['m', 'meter', 'meters', 'metre', 'metres'],
  meters: ['m', 'meter', 'meters', 'metre', 'metres'],
  metre: ['m', 'meter', 'meters', 'metre', 'metres'],
  metres: ['m', 'meter', 'meters', 'metre', 'metres'],
  mm: ['mm', 'millimeter', 'millimeters', 'millimetre', 'millimetres'],
  millimeter: ['mm', 'millimeter', 'millimeters', 'millimetre', 'millimetres'],
  millimeters: ['mm', 'millimeter', 'millimeters', 'millimetre', 'millimetres'],
  millimetre: ['mm', 'millimeter', 'millimeters', 'millimetre', 'millimetres'],
  millimetres: ['mm', 'millimeter', 'millimeters', 'millimetre', 'millimetres'],
  km: ['km', 'kilometer', 'kilometers', 'kilometre', 'kilometres'],
  kilometer: ['km', 'kilometer', 'kilometers', 'kilometre', 'kilometres'],
  kilometers: ['km', 'kilometer', 'kilometers', 'kilometre', 'kilometres'],
  kilometre: ['km', 'kilometer', 'kilometers', 'kilometre', 'kilometres'],
  kilometres: ['km', 'kilometer', 'kilometers', 'kilometre', 'kilometres'],
  in: ['in', 'inch', 'inches'],
  inch: ['in', 'inch', 'inches'],
  inches: ['in', 'inch', 'inches'],
  ft: ['ft', 'foot', 'feet'],
  foot: ['ft', 'foot', 'feet'],
  feet: ['ft', 'foot', 'feet'],
  yd: ['yd', 'yard', 'yards'],
  yard: ['yd', 'yard', 'yards'],
  yards: ['yd', 'yard', 'yards'],
  mi: ['mi', 'mile', 'miles'],
  mile: ['mi', 'mile', 'miles'],
  miles: ['mi', 'mile', 'miles'],

  // Weight
  kg: ['kg', 'kilo', 'kilos', 'kilogram', 'kilograms'],
  kilogram: ['kg', 'kilo', 'kilos', 'kilogram', 'kilograms'],
  kilograms: ['kg', 'kilo', 'kilos', 'kilogram', 'kilograms'],
  g: ['g', 'gram', 'grams'],
  gram: ['g', 'gram', 'grams'],
  grams: ['g', 'gram', 'grams'],
  lb: ['lb', 'lbs', 'pound', 'pounds'],
  lbs: ['lb', 'lbs', 'pound', 'pounds'],
  pound: ['lb', 'lbs', 'pound', 'pounds'],
  pounds: ['lb', 'lbs', 'pound', 'pounds'],
  oz: ['oz', 'ounce', 'ounces'],
  ounce: ['oz', 'ounce', 'ounces'],
  ounces: ['oz', 'ounce', 'ounces'],
  ton: ['ton', 'tons', 'tonne', 'tonnes'],
  tons: ['ton', 'tons', 'tonne', 'tonnes'],

  // Temperature
  c: ['c', 'celsius', 'centigrade'],
  celsius: ['c', 'celsius', 'centigrade'],
  centigrade: ['c', 'celsius', 'centigrade'],
  f: ['f', 'fahrenheit'],
  fahrenheit: ['f', 'fahrenheit'],
  k: ['k', 'kelvin'],
  kelvin: ['k', 'kelvin'],
};

export function getUnitAliases(unit: string): string[] {
  const clean = unit.toLowerCase().trim();
  return UNIT_ALIASES[clean] || [clean];
}

// Domain-to-tool mapping
export const DOMAIN_PRIMARY_TOOLS: Record<UnitDomain, { primary: string; secondary?: string }> = {
  length: { primary: 'length-converter', secondary: 'conversion-calculator' },
  weight: { primary: 'weight-converter', secondary: 'conversion-calculator' },
  temperature: { primary: 'temperature-converter', secondary: 'conversion-calculator' },
  volume: { primary: 'volume-converter', secondary: 'conversion-calculator' },
  speed: { primary: 'speed-converter', secondary: 'conversion-calculator' },
  area: { primary: 'area-converter', secondary: 'conversion-calculator' },
};

// Currency / Financial intent engines mapping
export const FINANCIAL_INTENT_TOOLS: Record<string, { primary: string; secondary?: string[] }> = {
  sip: {
    primary: 'sip-calculator',
    secondary: ['step-up-sip-calculator'],
  },
  emi: {
    primary: 'emi-calculator',
    secondary: ['loan-calculator', 'car-loan-calculator'],
  },
  mortgage: {
    primary: 'mortgage-calculator',
    secondary: ['mortgage-payoff-calculator', 'down-payment-calculator'],
  },
  vat: {
    primary: 'vat-calculator',
    secondary: ['sales-tax-calculator'],
  },
  tax: {
    primary: 'income-tax-calculator',
    secondary: ['sales-tax-calculator', 'tax-calculator'],
  },
  loan: {
    primary: 'loan-calculator',
    secondary: ['personal-loan-calculator', 'auto-loan-calculator'],
  },
};

export interface ConversionIntentInfo {
  isConversion: boolean;
  rawFrom?: string;
  rawTo?: string;
  domain?: UnitDomain;
  primaryToolId?: string;
  secondaryToolId?: string;
}

/**
 * Detects conversion intent patterns:
 * /(?:convert\s+)?(\w+)\s+(?:to|in|into)\s+(\w+)/i
 */
export function detectConversionIntent(query: string): ConversionIntentInfo {
  const clean = query.trim().toLowerCase();
  const match = clean.match(/(?:convert\s+)?(?:[\d.]+\s*)?([a-z]+)\s+(?:to|in|into)\s+([a-z]+)/i);
  if (!match) {
    return { isConversion: false };
  }

  const rawFrom = match[1].toLowerCase();
  const rawTo = match[2].toLowerCase();

  const domainFrom = UNIT_TO_DOMAIN[rawFrom];
  const domainTo = UNIT_TO_DOMAIN[rawTo];
  const domain = domainFrom || domainTo;

  if (domain && DOMAIN_PRIMARY_TOOLS[domain]) {
    return {
      isConversion: true,
      rawFrom,
      rawTo,
      domain,
      primaryToolId: DOMAIN_PRIMARY_TOOLS[domain].primary,
      secondaryToolId: DOMAIN_PRIMARY_TOOLS[domain].secondary,
    };
  }

  return {
    isConversion: true,
    rawFrom,
    rawTo,
  };
}

export interface InputSearchMetadata {
  id: string;
  name: string;
  unit: string;
  options: string[];
  combined: string;
}

export interface CalculatorSearchIndex {
  calc: CalculatorDefinition;
  titleLower: string;
  baseTitleLower: string;
  idLower: string;
  categoryLower: string;
  categoryNameLower: string;
  groupLower: string;
  descriptionLower: string;
  queriesLower: string[];
  edgeCasesLower: string[];
  inputs: InputSearchMetadata[];
  converterOptionTokens: string[];
  primaryOutput: {
    label: string;
    unit: string;
  };
  combinedText: string;
}

export interface CalculatorMatchDetails {
  matched: boolean;
  score: number;
  matchedTitle: boolean;
  matchedInputLabel?: string;
}

export interface RankedResult {
  calculator: CalculatorDefinition;
  score: number;
  matchedInputLabel?: string;
}

// In-memory cache for precomputed calculator search metadata
const searchIndexCache = new WeakMap<CalculatorDefinition, CalculatorSearchIndex>();

export function getOrCreateIndex(calc: CalculatorDefinition): CalculatorSearchIndex {
  const cached = searchIndexCache.get(calc);
  if (cached) return cached;

  const titleLower = (calc.name || '').toLowerCase().trim();
  const baseTitleLower = titleLower
    .replace(/\s*(calculator|converter|tool)$/i, '')
    .trim();
  const idLower = (calc.id || '').toLowerCase().trim();
  const categoryLower = (calc.category || '').toLowerCase().trim();
  const categoryName = categoryNameMap.get(calc.category) || '';
  const categoryNameLower = categoryName.toLowerCase().trim();
  const groupLower = (calc.group || '').toLowerCase().trim();
  const descriptionLower = (calc.description || '').toLowerCase();
  const queriesLower = (calc.naturalLanguageQueries || []).map((q) => q.toLowerCase());
  const edgeCasesLower = (calc.edgeCases || []).map((e) => e.toLowerCase());

  // Index all inputs and collect converter option unit tokens
  const inputs: InputSearchMetadata[] = [];
  const inputsTextParts: string[] = [];
  const converterOptionTokens: string[] = [];

  const isConverterTool =
    calc.category === 'conversion-units' ||
    idLower.includes('converter') ||
    titleLower.includes('converter');

  if (calc.inputs && Array.isArray(calc.inputs)) {
    for (const inp of calc.inputs) {
      const inputId = (inp.id || '').toLowerCase();
      const inputName = ((inp as any).label || inp.name || '').trim();
      const inputNameLower = inputName.toLowerCase();
      const inputUnit = ((inp as any).unit || inp.suffix || inp.prefix || '').trim();
      const inputUnitLower = inputUnit.toLowerCase();
      const inputTooltip = (inp.tooltip || '').toLowerCase();

      const options: string[] = [];
      if (inp.options && Array.isArray(inp.options)) {
        for (const opt of inp.options) {
          if (opt.label) {
            const optLabel = opt.label.toLowerCase();
            options.push(optLabel);
            if (isConverterTool) {
              converterOptionTokens.push(optLabel);
              const parenMatch = optLabel.match(/\(([^)]+)\)/);
              if (parenMatch) {
                converterOptionTokens.push(parenMatch[1].trim());
              }
              const wordTokens = optLabel.replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(Boolean);
              converterOptionTokens.push(...wordTokens);
            }
          }
          if (opt.value !== undefined && opt.value !== null) {
            const optVal = String(opt.value).toLowerCase();
            options.push(optVal);
            if (isConverterTool) {
              converterOptionTokens.push(optVal);
            }
          }
        }
      }

      const inputCombined = `${inputNameLower} ${inputId} ${inputUnitLower} ${inputTooltip} ${options.join(' ')}`;
      inputs.push({
        id: inp.id,
        name: inputName,
        unit: inputUnit,
        options,
        combined: inputCombined,
      });
      inputsTextParts.push(inputCombined);
    }
  }

  // Extract primary output label & unit
  let primaryOutputLabel = '';
  let primaryOutputUnit = '';

  if ((calc as any).primaryOutput) {
    primaryOutputLabel = String((calc as any).primaryOutput.label || '').toLowerCase();
    primaryOutputUnit = String(
      (calc as any).primaryOutput.unit ||
        (calc as any).primaryOutput.suffix ||
        (calc as any).primaryOutput.prefix ||
        ''
    ).toLowerCase();
  } else if (typeof calc.calculate === 'function') {
    try {
      const defaultInputs: Record<string, any> = {};
      if (calc.inputs) {
        for (const inp of calc.inputs) {
          defaultInputs[inp.id] =
            inp.defaultValue !== undefined
              ? inp.defaultValue
              : inp.options?.[0]?.value ?? 0;
        }
      }
      const res = calc.calculate(defaultInputs);
      if (res?.primaryOutput) {
        primaryOutputLabel = String(res.primaryOutput.label || '').toLowerCase();
        primaryOutputUnit = String(
          (res.primaryOutput as any).unit ||
            res.primaryOutput.suffix ||
            res.primaryOutput.prefix ||
            ''
        ).toLowerCase();
      }
    } catch {
      // Ignore if calculate fails with default values
    }
  }

  const combinedText = [
    titleLower,
    baseTitleLower,
    idLower,
    categoryLower,
    categoryNameLower,
    groupLower,
    descriptionLower,
    ...queriesLower,
    ...edgeCasesLower,
    ...inputsTextParts,
    primaryOutputLabel,
    primaryOutputUnit,
  ].join(' ');

  const indexed: CalculatorSearchIndex = {
    calc,
    titleLower,
    baseTitleLower,
    idLower,
    categoryLower,
    categoryNameLower,
    groupLower,
    descriptionLower,
    queriesLower,
    edgeCasesLower,
    inputs,
    converterOptionTokens,
    primaryOutput: {
      label: primaryOutputLabel,
      unit: primaryOutputUnit,
    },
    combinedText,
  };

  searchIndexCache.set(calc, indexed);
  return indexed;
}

const STOP_WORDS = new Set(['to', 'in', 'into', 'convert', 'a', 'an', 'the', 'of', 'for', 'with', 'and', 'or', 'is']);

/**
 * Detailed calculator matcher that computes weighted match relevance score
 * and identifies if an input parameter matched.
 */
export function matchCalculatorDetails(
  calc: CalculatorDefinition,
  query: string
): CalculatorMatchDetails {
  if (!query) {
    return { matched: true, score: 0, matchedTitle: true };
  }

  const cleanQuery = query.toLowerCase().trim();
  const allTokens = cleanQuery.split(/\s+/).filter(Boolean);
  if (allTokens.length === 0) {
    return { matched: true, score: 0, matchedTitle: true };
  }

  const index = getOrCreateIndex(calc);
  const conversionIntent = detectConversionIntent(cleanQuery);

  // Filter out stop words for meaningful token comparison
  const contentTokens = allTokens.filter((t) => !STOP_WORDS.has(t));
  const effectiveTokens = contentTokens.length > 0 ? contentTokens : allTokens;

  // Check if meaningful tokens or raw query appear in combined metadata
  const hasConversionIntentMatch =
    conversionIntent.isConversion &&
    (conversionIntent.primaryToolId === calc.id ||
      conversionIntent.secondaryToolId === calc.id ||
      (calc.category === 'conversion-units' &&
        Boolean(
          (conversionIntent.rawFrom && index.converterOptionTokens.includes(conversionIntent.rawFrom)) ||
          (conversionIntent.rawTo && index.converterOptionTokens.includes(conversionIntent.rawTo))
        )));

  const allTokensMatch = effectiveTokens.every((token) => index.combinedText.includes(token));
  const rawQueryMatches = index.combinedText.includes(cleanQuery);

  if (!hasConversionIntentMatch && !allTokensMatch && !rawQueryMatches) {
    return { matched: false, score: 0, matchedTitle: false };
  }

  let score = 0;
  let titleScore = 0;
  let intentScore = 0;
  let categoryScore = 0;

  // 1. UNIT INTENT & CONVERSION DETECTION (+1000 point bonus to matching Category 08 conversion tools)
  if (conversionIntent.isConversion) {
    if (conversionIntent.primaryToolId === calc.id) {
      intentScore += 1000;
    } else if (conversionIntent.secondaryToolId === calc.id) {
      intentScore += 800;
    } else if (calc.category === 'conversion-units') {
      const matchesFrom = conversionIntent.rawFrom && index.converterOptionTokens.includes(conversionIntent.rawFrom);
      const matchesTo = conversionIntent.rawTo && index.converterOptionTokens.includes(conversionIntent.rawTo);
      if (matchesFrom && matchesTo) {
        intentScore += 1000;
      } else if (matchesFrom || matchesTo) {
        intentScore += 600;
      }
    }
  }

  // 2. FINANCIAL ENGINES INTENT BOOST
  for (const [finKey, finConfig] of Object.entries(FINANCIAL_INTENT_TOOLS)) {
    if (allTokens.includes(finKey) || cleanQuery.includes(finKey)) {
      if (calc.id === finConfig.primary) {
        intentScore += 1000;
      } else if (finConfig.secondary?.includes(calc.id)) {
        intentScore += 500;
      }
    }
  }

  // 3. TITLE MATCHING
  // Exact Title Match: +1500 points
  const exactTitleMatch =
    index.titleLower === cleanQuery ||
    index.baseTitleLower === cleanQuery ||
    index.idLower === cleanQuery ||
    index.idLower.replace(/-calculator|-converter$/, '') === cleanQuery;

  // Acronym match (e.g. "body mass index" matches "BMI Calculator")
  const queryAcronym = effectiveTokens.map((t) => t[0]).join('');
  const titleWords = index.titleLower.replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w) => !STOP_WORDS.has(w));
  const titleAcronym = titleWords.map((w) => w[0]).join('');
  const isAcronymMatch =
    (queryAcronym.length >= 2 && (index.baseTitleLower === queryAcronym || titleWords.includes(queryAcronym))) ||
    (titleAcronym.length >= 2 && cleanQuery === titleAcronym);

  // Title starts with query / contains query: +800 points
  const titleStartsWith =
    index.titleLower.startsWith(cleanQuery) ||
    index.baseTitleLower.startsWith(cleanQuery);

  const titleContainsQuery =
    index.titleLower.includes(cleanQuery) ||
    index.baseTitleLower.includes(cleanQuery);

  const titleContainsAllTokens =
    effectiveTokens.length > 0 &&
    effectiveTokens.every((t) => index.titleLower.includes(t));

  if (exactTitleMatch) {
    titleScore += 1500;
  } else if (isAcronymMatch) {
    titleScore += 1200;
  } else if (titleStartsWith) {
    titleScore += 800;
  } else if (titleContainsQuery) {
    titleScore += 800;
  } else if (titleContainsAllTokens) {
    titleScore += 600;
  } else {
    for (const t of effectiveTokens) {
      if (index.titleLower.includes(t)) {
        titleScore += 200;
      }
    }
  }

  // Id/Slug direct match bonus
  if (index.idLower === `${cleanQuery}-calculator` || index.idLower === `${cleanQuery}-converter`) {
    titleScore += 500;
  } else if (index.idLower.includes(cleanQuery)) {
    titleScore += 300;
  }

  // 4. CATEGORY MATCH: +400 points
  if (
    index.categoryNameLower.includes(cleanQuery) ||
    index.categoryLower.includes(cleanQuery) ||
    cleanQuery.includes(index.categoryNameLower) ||
    cleanQuery.includes(index.categoryLower) ||
    (conversionIntent.isConversion && calc.category === 'conversion-units')
  ) {
    categoryScore += 400;
  }

  // 5. TARGET / SOURCE UNIT OPTIONS MATCH IN A CONVERTER TOOL: +250 points per unit
  let converterUnitScore = 0;
  if (
    calc.category === 'conversion-units' ||
    index.idLower.includes('converter') ||
    index.titleLower.includes('converter')
  ) {
    const checkedUnits = new Set<string>();
    if (conversionIntent.rawFrom) {
      for (const a of getUnitAliases(conversionIntent.rawFrom)) checkedUnits.add(a);
    }
    if (conversionIntent.rawTo) {
      for (const a of getUnitAliases(conversionIntent.rawTo)) checkedUnits.add(a);
    }
    for (const t of effectiveTokens) {
      for (const a of getUnitAliases(t)) checkedUnits.add(a);
    }

    let unitMatchesCount = 0;
    const unitsToCheck = [conversionIntent.rawFrom, conversionIntent.rawTo].filter(Boolean) as string[];
    const evalUnits = unitsToCheck.length > 0 ? unitsToCheck : effectiveTokens;

    for (const u of evalUnits) {
      const aliases = getUnitAliases(u);
      const matchesOption = aliases.some(
        (alias) =>
          index.converterOptionTokens.includes(alias) ||
          index.converterOptionTokens.some((tok) => tok === alias || (alias.length >= 3 && tok.includes(alias)))
      );
      if (matchesOption) {
        unitMatchesCount++;
      }
    }

    converterUnitScore += unitMatchesCount * 250;
  }

  // 6. NATURAL LANGUAGE QUERY MATCH: +300 points
  let nlQueryScore = 0;
  for (const q of index.queriesLower) {
    if (q.includes(cleanQuery) || effectiveTokens.every((t) => q.includes(t))) {
      nlQueryScore += 300;
      break;
    }
  }

  // 7. PRIMARY OUTPUT LABEL MATCH (e.g. Body Mass Index)
  let outputScore = 0;
  if (
    index.primaryOutput.label.includes(cleanQuery) ||
    (effectiveTokens.length >= 2 && effectiveTokens.every((t) => index.primaryOutput.label.includes(t)))
  ) {
    outputScore += 400;
  }

  // 8. DESCRIPTION KEYWORD MATCH: +100 points
  let descriptionScore = 0;
  if (
    index.descriptionLower.includes(cleanQuery) ||
    effectiveTokens.every((t) => index.descriptionLower.includes(t))
  ) {
    descriptionScore += 100;
  }

  // 9. SECONDARY INPUT PARAMETER LABEL MATCH (e.g. "Height (cm)" in BMI): +30 points ONLY.
  let highestInputScore = 0;
  let matchedInputLabel: string | undefined;

  for (const inp of index.inputs) {
    let inpScore = 0;
    const nameLower = inp.name.toLowerCase();

    // Secondary parameter label matches
    if (nameLower === cleanQuery) {
      inpScore = 30;
    } else if (nameLower.includes(cleanQuery)) {
      inpScore = 30;
    } else if (effectiveTokens.some((t) => nameLower.includes(t))) {
      inpScore = 30;
    } else if (effectiveTokens.some((t) => inp.combined.includes(t))) {
      inpScore = 20;
    }

    if (inpScore > highestInputScore) {
      highestInputScore = inpScore;
      matchedInputLabel = inp.name;
    }
  }

  score =
    intentScore +
    titleScore +
    categoryScore +
    converterUnitScore +
    nlQueryScore +
    outputScore +
    descriptionScore +
    highestInputScore;

  // Match is considered title-driven if title or base title matched
  const matchedTitle = titleScore >= 600 || titleStartsWith || titleContainsQuery;

  // Show matchedInputLabel ONLY if the score was not already driven by title/intent/category
  const isScoreDrivenByTitleOrIntent = titleScore >= 600 || intentScore >= 500 || categoryScore >= 400;
  const finalMatchedInputLabel =
    !isScoreDrivenByTitleOrIntent && matchedInputLabel ? matchedInputLabel : undefined;

  return {
    matched: score > 0,
    score,
    matchedTitle,
    matchedInputLabel: finalMatchedInputLabel,
  };
}

/**
 * Matches a calculator against a query string.
 */
export function matchesCalculator(calc: CalculatorDefinition, query: string): boolean {
  if (!query || !query.trim()) return true;
  const details = matchCalculatorDetails(calc, query);
  return details.matched;
}

/**
 * Searches and ranks calculators according to weighted relevance scoring.
 * Supports both signatures:
 *   searchCalculators(query, allCalculators)
 *   searchCalculators(allCalculators, query)
 */
export function searchCalculators(
  query: string,
  allCalculators: CalculatorDefinition[]
): RankedResult[];
export function searchCalculators(
  allCalculators: CalculatorDefinition[],
  query: string
): RankedResult[];
export function searchCalculators(
  arg1: string | CalculatorDefinition[],
  arg2: string | CalculatorDefinition[]
): RankedResult[] {
  let query: string;
  let calculators: CalculatorDefinition[];

  if (typeof arg1 === 'string') {
    query = arg1;
    calculators = arg2 as CalculatorDefinition[];
  } else {
    calculators = arg1;
    query = arg2 as string;
  }

  if (!query || !query.trim()) {
    return calculators.map((calc) => ({
      calculator: calc,
      score: 0,
    }));
  }

  const results: RankedResult[] = [];

  for (const calc of calculators) {
    const details = matchCalculatorDetails(calc, query);
    if (details.matched) {
      results.push({
        calculator: calc,
        score: details.score,
        matchedInputLabel: details.matchedInputLabel,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}
