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

    const prompt = `You are a psychologist chatbot designed to provide mental health support and guidance to women.

You can answer questions related to pre-period, postpartum, and mood swings. You can also provide support and console the user if they are feeling depressed or anxious.

Your goal is to analyze their mental health through chat and act as a psychiatrist to provide emotional support and answer their questions.

${history}
User: ${input.message}
Bot:`;

    const result = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt,
      config: {
        temperature: 0.7,
        topK: 50,
        topP: 0.9,
      },
    });

    return { response: result.text };
  }
);
