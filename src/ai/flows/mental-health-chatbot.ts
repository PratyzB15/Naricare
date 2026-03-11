'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MentalHealthChatbotInputSchema = z.object({
  message: z.string().describe('The user message to the chatbot.'),
  chatHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'bot']),
        content: z.string(),
      })
    )
    .optional()
    .describe('The chat history between the user and the chatbot.'),
});

export type MentalHealthChatbotInput = z.infer<typeof MentalHealthChatbotInputSchema>;

const MentalHealthChatbotOutputSchema = z.object({
  response: z.string().describe('The chatbot response to the user message.'),
});

export type MentalHealthChatbotOutput = z.infer<typeof MentalHealthChatbotOutputSchema>;

export async function mentalHealthChatbot(
  input: MentalHealthChatbotInput
): Promise<MentalHealthChatbotOutput> {
  return mentalHealthChatbotFlow(input);
}

const mentalHealthChatbotFlow = ai.defineFlow(
  {
    name: 'mentalHealthChatbotFlow',
    inputSchema: MentalHealthChatbotInputSchema,
    outputSchema: MentalHealthChatbotOutputSchema,
  },
  async (input) => {
    const history = input.chatHistory
      ? input.chatHistory
          .map((m) => (m.role === 'user' ? `User: ${m.content}` : `Bot: ${m.content}`))
          .join('\n')
      : '';

    const prompt = `You are a compassionate psychologist chatbot designed to provide mental health support and guidance to women.

You can answer questions related to premenstrual symptoms, postpartum challenges, mood swings, anxiety, and depression. Offer empathetic, evidence-based support and encourage professional help when needed.

${history}
User: ${input.message}
Bot:`;

const modelNames = [
  "googleai/gemini-2.5-flash",
  "googleai/gemini-2.5-pro"
];




    for (const modelName of modelNames) {
      try {
        console.log(`Trying model: ${modelName}`);
        const result = await ai.generate({
          model: modelName,
          prompt,
          config: {
            temperature: 0.7,
            topK: 50,
            topP: 0.9,
          },
        });
        console.log(`✅ Success with model: ${modelName}`);
        return { response: result.text };
      } catch (error: unknown) {
        console.error(`❌ Full error for model ${modelName}:`, error);
      }
    }

    throw new Error('All model attempts failed. Check available models in terminal.');
  }
);
