// src/ai/genkit.ts
import 'server-only';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const apiKey =
  process.env.GEMINI_API_KEY ??
  process.env.GOOGLE_API_KEY ??
  process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!apiKey) {
  throw new Error(
    '❌ Missing API Key: Set GEMINI_API_KEY in .env.local and restart the server.'
  );
}

// ✅ Initialize Genkit with Google GenAI (v1)
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey,
      apiVersion: 'v1', // ✅ correct & stable
    }),
  ],
});

if (process.env.NODE_ENV === 'development') {
  console.log('✅ Genkit initialized with Google GenAI v1');
}
