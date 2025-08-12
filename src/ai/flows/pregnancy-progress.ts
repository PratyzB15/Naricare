
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
You are an expert embryologist and gynecologist. Your task is to provide a clear, reassuring, and scientifically accurate summary of fetal development for a specific week of pregnancy.

Use the reference table below to find the information for the requested week ({{{pregnancyWeeks}}}).
Based on that information, provide the following:
1.  **fetalDevelopment**: A concise, single-paragraph summary of the most important developmental milestones for that week. Mention key organ development, new abilities, and other significant changes.
2.  **babySizeComparison**: A simple, relatable comparison of the baby's size to the corresponding fruit, vegetable, or seed from the table.

Your tone should be informative and encouraging for an expecting mother.

**Pregnancy Development Reference Table:**
| Week | Size Comparison        |
|------|------------------------|
| 3    | Poppy seed             |
| 4    | Sesame seed            |
| 5    | Lentil                 |
| 6    | Grain of rice          |
| 7    | Blueberry              |
| 8    | Kidney bean            |
| 9    | Grape                  |
| 10   | Kumquat                |
| 11   | Fig                    |
| 12   | Lime                   |
| 13   | Pea pod                |
| 14   | Lemon                  |
| 15   | Apple                  |
| 16   | Avocado                |
| 17   | Onion                  |
| 18   | Sweet potato           |
| 19   | Mango                  |
| 20   | Banana                 |
| 21   | Carrot                 |
| 22   | Spaghetti squash       |
| 23   | Large mango            |
| 24   | Corn on the cob        |
| 25   | Rutabaga               |
| 26   | Scallion bunch         |
| 27   | Cauliflower            |
| 28   | Large eggplant         |
| 29   | Butternut squash       |
| 30   | Cabbage                |
| 31   | Coconut                |
| 32   | Jicama                 |
| 33   | Pineapple              |
| 34   | Cantaloupe             |
| 35   | Honeydew melon         |
| 36   | Romaine lettuce head   |
| 37   | Swiss chard bunch      |
| 38   | Leek bunch             |
| 39   | Mini watermelon        |
| 40   | Small pumpkin          |
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
