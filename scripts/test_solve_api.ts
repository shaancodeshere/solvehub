import fs from 'fs';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';

// 1. Explicitly load .env.local if GEMINI_API_KEY is not already present in environment
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

async function runDirectVerification() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('ERROR: GEMINI_API_KEY is not configured in .env.local');
    process.exit(1);
  }

  console.log('------------------------------------------------------------');
  console.log('SOLVEHUB TIER 2 AI HYBRID SOLVER DIRECT VERIFICATION');
  console.log('------------------------------------------------------------');
  console.log(`API Key detected: ${apiKey.slice(0, 6)}...${apiKey.slice(-4)}`);

  const ai = new GoogleGenAI({ apiKey });

  const testPrompt = 'Find the next number in the sequence: 5, 11, 23, 47, 95, ...';
  console.log(`Prompt: "${testPrompt}"\n`);

  const systemInstruction =
    "You are SolveHub's deterministic quantitative aptitude and mathematical reasoning engine. Analyze the user's input (word problems, number series, logic puzzles, algebra, permutations, probability, percentages, age gaps, tare weights). Return STRICT JSON conforming to the schema with exact calculations.";

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      isSolvable: { type: Type.BOOLEAN },
      problemType: {
        type: Type.STRING,
        description: 'e.g. Sequence Prediction, Pattern Outlier, Word Problem, Reverse Percentage, Algebra',
      },
      title: {
        type: Type.STRING,
        description: "Short clean title like 'Next Sequence Number' or 'Pattern Outlier'",
      },
      answer: {
        type: Type.STRING,
        description: "The exact final answer, e.g. '191', '36', '6 trips', '400 g', '30 years old', 'x + 17 = 30'",
      },
      steps: {
        type: Type.STRING,
        description: 'Concise step-by-step mathematical deduction in 1 to 3 sentences',
      },
      matchedCalculatorSlug: {
        type: Type.STRING,
        description:
          "Closest matching calculator slug from SolveHub (e.g. 'number-sequence-calculator', 'percentage-calculator', 'probability-calculator', 'age-calculator', 'ratio-calculator') or null",
      },
    },
    required: ['isSolvable', 'title', 'answer', 'steps'],
  };

  const candidateModels = ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-2.0-flash'];
  let response: any = null;
  let usedModel = '';

  for (const model of candidateModels) {
    try {
      console.log(`Querying model: ${model}...`);
      response = await ai.models.generateContent({
        model,
        contents: testPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

      if (response && response.text) {
        usedModel = model;
        console.log(`Successfully received response from ${model}!`);
        break;
      }
    } catch (err: any) {
      console.error('Gemini API Error details:', err?.message || err);
    }
  }

  if (!response || !response.text) {
    console.error('FATAL: Failed to obtain response from any candidate model.');
    process.exit(1);
  }

  console.log('\n--- RAW JSON RESPONSE ---');
  console.log(response.text);

  const parsed = JSON.parse(response.text);
  console.log('\n--- PARSED RESPONSE OBJECT ---');
  console.dir(parsed, { depth: null });

  console.log('\n--- ASSERTIONS ---');
  console.log(`1. isSolvable = ${parsed.isSolvable} (${parsed.isSolvable === true ? 'PASS' : 'FAIL'})`);
  console.log(`2. title = "${parsed.title}" (${Boolean(parsed.title) ? 'PASS' : 'FAIL'})`);
  console.log(`3. answer = "${parsed.answer}" (${parsed.answer?.includes('191') ? 'PASS (191 verified)' : 'FAIL'})`);
  console.log(`4. steps = "${parsed.steps}" (${Boolean(parsed.steps) ? 'PASS' : 'FAIL'})`);

  if (parsed.answer?.includes('191')) {
    console.log('\n✅ VERIFICATION COMPLETE: Answer 191 accurately deduced!');
  } else {
    console.warn('\n⚠️ Answer did not explicitly match 191, check parsed output above.');
  }
}

runDirectVerification().catch((err) => {
  console.error('Unhandled verification error:', err);
  process.exit(1);
});
