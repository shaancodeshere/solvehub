import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim();
        process.env[k] = v;
      }
    }
  }
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('GEMINI_API_KEY present:', Boolean(apiKey));
  if (!apiKey) {
    console.error('ERROR: GEMINI_API_KEY not found in .env.local');
    process.exit(1);
  }
  console.log(`API Key preview: ${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`);

  const ai = new GoogleGenAI({ apiKey });
  const prompt = 'Find the next number in the sequence: 5, 11, 23, 47, 95, ...';
  console.log(`\nCalling @google/genai with model 'gemini-2.5-flash'...`);
  console.log(`Prompt: "${prompt}"\n`);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    console.log('Raw response from gemini-2.5-flash:');
    console.log(response.text);
  } catch (err: any) {
    console.error('Full error message from gemini-2.5-flash:');
    console.error(err);

    // If 2.5-flash is deprecated/not found, also test recommended gemini-3.8-flash
    console.log('\n--- Diagnostic Follow-up with gemini-3.8-flash ---');
    try {
      const res38 = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });
      console.log('Raw response from gemini-3.8-flash:');
      console.log(res38.text);
    } catch (err38: any) {
      console.error('Error from gemini-3.8-flash:', err38?.message || err38);
    }
  }
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
