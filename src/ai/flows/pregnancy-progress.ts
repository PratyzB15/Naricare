
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a description of fetal development based on the week of pregnancy.
 *
 * - getPregnancyProgress - A function that handles the pregnancy progress description generation.
 * - PregnancyProgressInput - The input type for the getPregnancyProgress function.
 * - PregnancyProgressOutput - The return type for the getPregnancyProgress function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PregnancyProgressInputSchema = z.object({
  pregnancyWeeks: z.number().describe('The number of weeks of pregnancy.'),
});
export type PregnancyProgressInput = z.infer<typeof PregnancyProgressInputSchema>;

const PregnancyProgressOutputSchema = z.object({
  fetalDevelopment: z
    .string()
    .describe(
      "A detailed, one-paragraph description of the baby's key development milestones for the given week of pregnancy. This should include major organ formation, new abilities, and other significant changes."
    ),
  babySizeComparison: z
    .string()
    .describe(
      "A simple and relatable comparison of the baby's size to a common fruit, vegetable, or seed (e.g., 'a poppy seed', 'a lime', 'an avocado')."
    ),
    motherSymptoms: z.string().describe("A detailed description of common symptoms the mother might be experiencing during this week, such as nausea, fatigue, or body changes.")
});
export type PregnancyProgressOutput = z.infer<typeof PregnancyProgressOutputSchema>;

export async function getPregnancyProgress(
  input: PregnancyProgressInput
): Promise<PregnancyProgressOutput> {
  return pregnancyProgressFlow(input);
}

const prompt = ai.definePrompt({
  name: 'pregnancyProgressPrompt',
  input: {schema: PregnancyProgressInputSchema},
  output: {schema: PregnancyProgressOutputSchema},
  prompt: `
You are an expert embryologist and gynecologist. Your task is to provide a clear, reassuring, and scientifically accurate summary of fetal development and maternal symptoms for a specific week of pregnancy.

Based on your expert knowledge for week {{{pregnancyWeeks}}}, provide the following:
1.  **fetalDevelopment**: A detailed description of the most important developmental milestones for that week. Mention key organ development, new abilities, and other significant changes.
2.  **babySizeComparison**: A simple, relatable comparison of the baby's size to a common fruit, vegetable, or seed (e.g., 'a poppy seed', 'a lime', 'an avocado').
3.  **motherSymptoms**: A detailed summary of the common physical and emotional symptoms a mother might experience this week (e.g., morning sickness, fatigue, backaches, mood changes).

Your tone should be informative and encouraging for an expecting mother.
`,
});

const pregnancyProgressFlow = ai.defineFlow(
  {
    name: 'pregnancyProgressFlow',
    inputSchema: PregnancyProgressInputSchema,
    outputSchema: PregnancyProgressOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
