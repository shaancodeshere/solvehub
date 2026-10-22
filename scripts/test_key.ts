import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const key = process.env.GEMINI_API_KEY || '';
console.log('--- GEMINI API KEY DIAGNOSTICS ---');
console.log('Key length:', key.length);
console.log('Last 4 characters:', key.slice(-4));
console.log('Matches AYaA:', key.slice(-4) === 'AYaA');
console.log('-----------------------------------\n');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function main() {
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Compute 25 * 4. Return only the number.',
    });
    console.log("SUCCESS! Model response:", res.text);
  } catch (err: any) {
    console.error("AUTH/API ERROR:", err?.status, err?.message);
  }
}
main();
