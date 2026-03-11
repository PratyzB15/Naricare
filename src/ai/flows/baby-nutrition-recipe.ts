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
    try {
      const {output} = await prompt(input);
      if (!output) {
        throw new Error('AI returned no valid output');
      }
      return output;
    } catch (error) {
      // Fallback response if AI fails
      const age = input.babyAgeInMonths;

      let essentialNutrients, dietSuggestions, simpleRecipe;

      if (age < 6) {
        essentialNutrients = `- Breast milk or formula provides all essential nutrients\n- Key nutrients: Iron, DHA, Vitamin D`;
        dietSuggestions = `- Exclusive breastfeeding or formula feeding\n- No solid foods before 6 months`;
        simpleRecipe = {
          name: "Breast Milk or Formula",
          ingredients: `- Breast milk or iron-fortified infant formula`,
          instructions: `1. Feed on demand, typically 8–12 times per day\n2. Ensure proper latch or bottle hygiene\n3. Consult pediatrician for formula choice`
        };
      } else if (age < 9) {
        essentialNutrients = `- Iron (critical for brain development)\n- Vitamin C (aids iron absorption)\n- Healthy fats (DHA, avocado, oils)`;
        dietSuggestions = `- Start with single-ingredient purees (sweet potato, banana, apple)\n- Introduce iron-rich foods (fortified cereal, pureed meat)\n- Offer one new food every 3–5 days`;
        simpleRecipe = {
          name: "Mashed Banana with Breast Milk",
          ingredients: `- 1 ripe banana\n- 1–2 tablespoons breast milk or formula`,
          instructions: `1. Peel and mash banana in a bowl\n2. Mix in breast milk or formula for smooth texture\n3. Serve at room temperature`
        };
      } else if (age < 12) {
        essentialNutrients = `- Protein (for growth)\n- Calcium (for bones)\n- Fiber (for digestion)`;
        dietSuggestions = `- Mashed fruits and vegetables\n- Soft finger foods (cooked carrots, banana pieces)\n- Yogurt (no added sugar)\n- Continue breast milk or formula`;
        simpleRecipe = {
          name: "Mashed Sweet Potato",
          ingredients: `- 1 small sweet potato\n- 1 teaspoon olive oil (optional)`,
          instructions: `1. Boil or steam sweet potato until soft\n2. Mash with a fork, add olive oil if desired\n3. Cool before serving`
        };
      } else {
        essentialNutrients = `- Balanced intake of protein, carbs, and fats\n- Calcium, Iron, Vitamin D\n- Fiber-rich foods`;
        dietSuggestions = `- Soft family foods (chopped vegetables, rice, eggs)\n- Whole milk (after 12 months)\n- Avoid added salt, sugar, and choking hazards`;
        simpleRecipe = {
          name: "Scrambled Eggs",
          ingredients: `- 1 egg\n- 1 tablespoon breast milk or formula\n- Pinch of butter`,
          instructions: `1. Whisk egg with milk\n2. Cook on low heat with butter, stirring gently\n3. Cool completely before serving`
        };
      }

      return {
        essentialNutrients,
        dietSuggestions,
        simpleRecipe
      };
    }
  }
);