import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { GoogleGenAI, Type } from '@google/genai';
import { getCalculatorById } from '@/lib/calculators';

export const runtime = 'nodejs';

// Server-Side LRU Map Cache (0ms instant response across sessions/tabs)
const serverCache = new Map<string, any>();
const MAX_CACHE_SIZE = 500;

function cleanJsonParse(text: string) {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const query = typeof body.query === 'string' ? body.query.trim() : typeof body.text === 'string' ? body.text.trim() : '';

    if (!query) {
      return NextResponse.json(
        { error: 'Input query is required and cannot be empty.' },
        { status: 400 }
      );
    }

    const normalizedKey = query.toLowerCase();

    // Tier 0: 0ms server edge cache lookup
    if (serverCache.has(normalizedKey)) {
      return NextResponse.json(serverCache.get(normalizedKey));
    }

    // ==========================================
    // Tier 1: Primary Solver via Groq LPU (Sub-second inference)
    // ==========================================
    const groqApiKey = process.env.GROQ_API_KEY;
    if (groqApiKey) {
      const groq = new Groq({ apiKey: groqApiKey });
      const groqCandidateModels = [
        'llama-3.3-70b-versatile',
        'qwen/qwen3.8-27b',
        'openai/gpt-oss-120b',
      ];

      for (const model of groqCandidateModels) {
        try {
          const completion = await groq.chat.completions.create({
            model,
            messages: [
              {
                role: 'system',
                content:
                  "You are SolveHub's deterministic quantitative aptitude engine. Return STRICT JSON with keys: isSolvable (boolean), problemType (string), title (string), answer (string), steps (string), matchedCalculatorSlug (string or null). Keep steps concise in 1 to 2 sentences.",
              },
              {
                role: 'user',
                content: query,
              },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.1,
            max_completion_tokens: 300,
          });

          const rawContent = completion.choices[0]?.message?.content;
          if (rawContent) {
            const parsed = cleanJsonParse(rawContent);
            if (parsed && typeof parsed.answer !== 'undefined') {
              if (parsed.matchedCalculatorSlug && typeof parsed.matchedCalculatorSlug === 'string') {
                const calc = getCalculatorById(parsed.matchedCalculatorSlug);
                parsed.matchedCalculatorCategory = calc ? calc.category : null;
              }

              // Store in server cache
              if (serverCache.size >= MAX_CACHE_SIZE) {
                const oldest = serverCache.keys().next().value;
                if (oldest) serverCache.delete(oldest);
              }
              serverCache.set(normalizedKey, parsed);

              return NextResponse.json(parsed);
            }
          }
        } catch (groqErr: any) {
          console.warn(`[SolveHub Groq LPU] Model ${model} fallback (${groqErr?.status || 'error'}): ${groqErr?.message?.slice(0, 80)}`);
          continue;
        }
      }
    }

    // ==========================================
    // Tier 2: Secondary Solver via Gemini Fallback
    // ==========================================
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (geminiApiKey) {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });

      const systemInstruction =
        "You are SolveHub's deterministic quantitative aptitude and mathematical reasoning engine. Analyze the user's input (word problems, number series, logic puzzles, algebra, permutations, probability, percentages, age gaps, tare weights). Return STRICT JSON conforming to the schema with exact calculations. Keep steps to 1 to 2 concise sentences.";

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          isSolvable: { type: Type.BOOLEAN },
          problemType: {
            type: Type.STRING,
            description: "e.g. Sequence Prediction, Pattern Outlier, Word Problem, Reverse Percentage, Algebra",
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
            description: "Concise step-by-step mathematical deduction in 1 to 2 sentences",
          },
          matchedCalculatorSlug: {
            type: Type.STRING,
            description:
              "Closest matching calculator slug from SolveHub (e.g. 'number-sequence-calculator', 'percentage-calculator', 'probability-calculator', 'age-calculator', 'ratio-calculator') or null",
          },
        },
        required: ["isSolvable", "title", "answer", "steps"],
      };

      const geminiCandidateModels = [
        'gemini-3.5-flash',
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-3.8-flash',
      ];

      for (const model of geminiCandidateModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: query,
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema,
              maxOutputTokens: 220,
              temperature: 0.1,
              // @ts-ignore
              thinkingConfig: { thinkingBudget: 0 },
            },
          });

          if (response && response.text) {
            const parsed = cleanJsonParse(response.text);
            if (parsed && typeof parsed.answer !== 'undefined') {
              if (parsed.matchedCalculatorSlug && typeof parsed.matchedCalculatorSlug === 'string') {
                const calc = getCalculatorById(parsed.matchedCalculatorSlug);
                parsed.matchedCalculatorCategory = calc ? calc.category : null;
              }

              if (serverCache.size >= MAX_CACHE_SIZE) {
                const oldest = serverCache.keys().next().value;
                if (oldest) serverCache.delete(oldest);
              }
              serverCache.set(normalizedKey, parsed);

              return NextResponse.json(parsed);
            }
          }
        } catch (geminiErr: any) {
          console.warn(`[SolveHub Gemini Fallback] Model ${model} fallback (${geminiErr?.status || 'error'}): ${geminiErr?.message?.slice(0, 80)}`);
          continue;
        }
      }
    }

    // Both Tier 1 & Tier 2 exhausted or rate-limited
    return NextResponse.json(
      {
        isSolvable: false,
        title: "Service Notice",
        answer: "Please retry in a moment",
        steps: "The AI reasoning engines are currently experiencing high demand. Please try again in a few moments.",
        error: "RATE_LIMIT",
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.warn("API /api/solve Error:", err);
    return NextResponse.json(
      {
        isSolvable: false,
        title: "Solver Notice",
        answer: "Could not evaluate",
        steps: "The service is temporarily unavailable. Please retry in a moment.",
        error: "SERVICE_NOTICE",
      },
      { status: 200 }
    );
  }
}
