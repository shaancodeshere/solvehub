import { GoogleGenAI, Type } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is not defined in .env.local");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

const candidateModels = [
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];

const systemInstruction =
  "You are SolveHub's deterministic quantitative aptitude and mathematical reasoning engine. Analyze the user's input (word problems, number series, logic puzzles, algebra, permutations, probability, percentages, age gaps, tare weights). Return STRICT JSON conforming to the schema with exact calculations.";

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    isSolvable: { type: Type.BOOLEAN },
    problemType: { type: Type.STRING },
    title: { type: Type.STRING },
    answer: { type: Type.STRING },
    steps: { type: Type.STRING },
    matchedCalculatorSlug: { type: Type.STRING },
  },
  required: ["isSolvable", "title", "answer", "steps"],
};

async function testCascade() {
  console.log("=== VERIFYING MODEL CASCADE ===");
  const query = "Find the next number: 2, 4, 8, 16, ?";
  let response: any = null;
  let activeModelUsed = '';
  let hadRateLimit = false;

  for (const model of candidateModels) {
    console.log(`Trying candidate model: '${model}'...`);
    try {
      response = await ai.models.generateContent({
        model,
        contents: query,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema,
        },
      });
      if (response && response.text) {
        activeModelUsed = model;
        console.log(`✓ Model '${model}' succeeded!`);
        break;
      }
    } catch (err: any) {
      const errMsg = String(err?.message || '');
      const errStatus = err?.status;
      if (errStatus === 429 || errMsg.includes('429') || errMsg.toLowerCase().includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
        hadRateLimit = true;
      }
      console.log(`✗ Model '${model}' failed (${errStatus || 'error'}): ${errMsg.slice(0, 100)}`);
      continue;
    }
  }

  if (response && response.text) {
    const parsed = JSON.parse(response.text.trim());
    console.log("\nParsed AI Output from active model (" + activeModelUsed + "):");
    console.log(JSON.stringify(parsed, null, 2));
    console.log("\nAssertion Check:");
    console.log(`Answer: "${parsed.answer}"`);
    console.log(`Contains '32': ${parsed.answer.includes('32')}`);
    if (parsed.answer.includes('32')) {
      console.log("✓ SUCCESS: Active model correctly solved the sequence with answer 32!");
    } else {
      console.error("✗ FAILURE: Answer does not match 32");
    }
  } else if (hadRateLimit) {
    console.log("\nAll candidate models exhausted due to rate limits.");
    console.log("Clean JSON fallback payload:");
    console.log(JSON.stringify({
      isSolvable: false,
      title: "Rate Limit Exceeded",
      answer: "Please try again in 30 seconds",
      steps: "The free Google AI quota limit was reached. It resets automatically every minute.",
      error: "RATE_LIMIT"
    }, null, 2));
  } else {
    console.error("No model succeeded and no rate limit detected.");
  }
}

testCascade();
