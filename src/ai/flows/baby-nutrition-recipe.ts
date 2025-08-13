'use server';
/**
 * @fileOverview Provides nutrition advice and simple recipes for babies based on their age.
 *
 * - getBabyNutrition - A function that returns nutrition info and a recipe.
 * - BabyNutritionInput - The input type for the getBabyNutrition function.
 * - BabyNutritionOutput - The return type for the getBabyNutrition function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BabyNutritionInputSchema = z.object({
  babyAgeInMonths: z
    .number()
    .describe("The baby's age in months."),
});
export type BabyNutritionInput = z.infer<typeof BabyNutritionInputSchema>;

const BabyNutritionOutputSchema = z.object({
  essentialNutrients: z.string().describe("A summary of essential nutrients, vitamins, and minerals for the baby's age, formatted as a bulleted list."),
  dietSuggestions: z.string().describe("Dietary suggestions and foods to introduce at this age, formatted as a bulleted list."),
  simpleRecipe: z.object({
      name: z.string().describe("The name of a simple, age-appropriate recipe."),
      ingredients: z.string().describe("A bulleted list of ingredients for the recipe."),
      instructions: z.string().describe("A numbered list of simple instructions to make the recipe."),
  }).describe("A simple recipe suitable for the baby's age."),
});
export type BabyNutritionOutput = z.infer<typeof BabyNutritionOutputSchema>;

export async function getBabyNutrition(
  input: BabyNutritionInput
): Promise<BabyNutritionOutput> {
  return babyNutritionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'babyNutritionPrompt',
  input: {schema: BabyNutritionInputSchema},
  output: {schema: BabyNutritionOutputSchema},
  prompt: `You are an expert pediatric nutritionist. A mother is asking for nutrition advice for her baby who is {{{babyAgeInMonths}}} months old.

**Your Task:**
Provide clear, safe, and age-appropriate nutritional information.

1.  **Essential Nutrients:** Based on the baby's age, list the most important nutrients, vitamins, and minerals. Format as a bulleted list.
2.  **Diet Suggestions:** Suggest foods that are appropriate to introduce at this age. Format as a bulleted list.
3.  **Simple Recipe:** Provide one simple, nutritious, and easy-to-make recipe. The recipe should have a name, a bulleted list of ingredients, and numbered instructions.

**Age-Specific Guidance:**
- **0-6 months:** Focus on exclusive breastfeeding or formula. Nutrients are delivered through milk. Do not suggest solid foods.
- **6-9 months:** Introduce single-ingredient purees (e.g., avocado, sweet potato, banana). Focus on iron-rich foods.
- **9-12 months:** Introduce mashed foods, small soft pieces, and more variety. Encourage self-feeding.
- **12+ months:** Transition to family meals (with no salt/sugar), cow's milk. Focus on a balanced diet.

Generate the response based on the baby's age of **{{{babyAgeInMonths}}} months**.
`,
});

const babyNutritionFlow = ai.defineFlow(
  {
    name: 'babyNutritionFlow',
    inputSchema: BabyNutritionInputSchema,
    outputSchema: BabyNutritionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
