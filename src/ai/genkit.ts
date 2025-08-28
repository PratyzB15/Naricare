// src/ai/genkit.ts
import 'server-only';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';


// Use GEMINI_API_KEY or GOOGLE_API_KEY
const apiKey =
  process.env.GEMINI_API_KEY ??
  process.env.GOOGLE_API_KEY ??
  process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!apiKey) { 
  throw new Error(
    '❌ Missing API Key: Set GEMINI_API_KEY or GOOGLE_API_KEY in .env.local and restart the server.'
  );
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey,
    }),
  ],
});

console.log('✅ Genkit initialized successfully.');
