import Groq from 'groq-sdk';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  console.error("GROQ_API_KEY is not defined in .env.local");
  process.exit(1);
}

const groq = new Groq({ apiKey });

async function testGroqSpeed() {
  const query = "Find the next number in the sequence: 5, 11, 23, 47, 95, ...";
  console.log("=== TESTING GROQ LPU SPEED ===");
  console.log("Query:", query);

  const candidateModels = [
    'llama-3.3-70b-versatile',
    'qwen/qwen3.8-27b',
    'openai/gpt-oss-120b',
  ];

  for (const model of candidateModels) {
    const t0 = Date.now();
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: "You are SolveHub's deterministic quantitative aptitude engine. Return STRICT JSON with keys: isSolvable (boolean), problemType (string), title (string), answer (string), steps (string), matchedCalculatorSlug (string or null). Keep steps concise in 1 to 2 sentences."
          },
          {
            role: 'user',
            content: query
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_completion_tokens: 300,
      });

      const elapsed = Date.now() - t0;
      const rawText = completion.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(rawText);

      console.log(`\n✓ Active Groq Model: ${model}`);
      console.log(`✓ Groq LPU Execution Time: ${elapsed}ms`);
      console.log("Parsed JSON response:");
      console.log(JSON.stringify(parsed, null, 2));
      console.log("\nAnswer verification:");
      console.log(`Answer: "${parsed.answer}"`);
      console.log(`Matches 191: ${String(parsed.answer).includes('191')}`);
      return;
    } catch (err: any) {
      console.warn(`Model ${model} unavailable (${err?.status}): ${err?.message?.slice(0, 80)}. Falling back to next model...`);
    }
  }
}

testGroqSpeed();
