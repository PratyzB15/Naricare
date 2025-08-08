// filename: src/ai/flows/mental-health-chatbot.ts
'use server';

/**
 * @fileOverview An AI chatbot for providing mental health support and guidance.
 *
 * - mentalHealthChatbot - A function that handles the chatbot interactions.
 * - MentalHealthChatbotInput - The input type for the mentalHealthChatbot function.
 * - MentalHealthChatbotOutput - The return type for the mentalHealthChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MentalHealthChatbotInputSchema = z.object({
  message: z.string().describe('The user message to the chatbot.'),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'bot']),
    content: z.string(),
  })).optional().describe('The chat history between the user and the chatbot.')
});
export type MentalHealthChatbotInput = z.infer<typeof MentalHealthChatbotInputSchema>;

const MentalHealthChatbotOutputSchema = z.object({
  response: z.string().describe('The chatbot response to the user message.'),
});
export type MentalHealthChatbotOutput = z.infer<typeof MentalHealthChatbotOutputSchema>;

export async function mentalHealthChatbot(input: MentalHealthChatbotInput): Promise<MentalHealthChatbotOutput> {
  return mentalHealthChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'mentalHealthChatbotPrompt',
  input: {schema: MentalHealthChatbotInputSchema},
  output: {schema: MentalHealthChatbotOutputSchema},
  prompt: `You are a psychologist chatbot designed to provide mental health support and guidance to women.

You can answer questions related to pre-period, postpartum, and mood swings. You can also provide support and console the user if they are feeling depressed or anxious.

Your goal is to analyze their mental health through chat and act as a psychiatrist to provide emotional support and answer their questions.

This is the conversation history. The user's last message is at the end.
{{#if chatHistory}}
{{#each chatHistory}}
  {{#if (eq role 'user')}}
    User: {{{content}}}
  {{else}}
    Bot: {{{content}}}
  {{/if}}
{{/each}}
{{/if}}
User: {{{message}}}
Bot:`,
});

const mentalHealthChatbotFlow = ai.defineFlow(
  {
    name: 'mentalHealthChatbotFlow',
    inputSchema: MentalHealthChatbotInputSchema,
    outputSchema: MentalHealthChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
