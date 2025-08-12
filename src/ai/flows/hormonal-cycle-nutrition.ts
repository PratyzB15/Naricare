'use server';
/**
 * @fileOverview Personalized nutrition and diet recommendations based on hormonal cycle phase or pregnancy week.
 *
 * - getHormonalCycleNutrition - A function that provides personalized nutrition recommendations.
 * - HormonalCycleNutritionInput - The input type for the getHormonalCycleNutrition function.
 * - HormonalCycleNutritionOutput - The return type for the getHormonalCycleNutrition function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HormonalCycleNutritionInputSchema = z.object({
  cyclePhase: z
    .string()
    .optional()
    .describe("The current phase of the user's menstrual cycle (e.g., menstruation, follicular, ovulation, luteal)."),
  pregnancyTrimester: z
    .number()
    .optional()
    .describe("The user's current pregnancy trimester (1, 2, or 3)."),
  mood: z.string().optional().describe('The current mood of the user.'),
  physicalSymptoms: z
    .string()
    .optional()
    .describe('Any physical symptoms the user is experiencing.'),
  dietaryPreferences: z
    .string()
    .optional()
    .describe('Any dietary preferences or restrictions of the user (e.g., vegan, vegetarian, gluten-free).'),
  medicalHistory: z
    .string()
    .optional()
    .describe('Relevant medical history, including thyroid issues, PCOS, or PCOD.'),
  postDelivery: z.boolean().optional().describe('Set to true if user is in post-delivery phase.')
});
export type HormonalCycleNutritionInput = z.infer<typeof HormonalCycleNutritionInputSchema>;

const HormonalCycleNutritionOutputSchema = z.object({
  recommendations: z.string().describe("A detailed, structured response. Each section heading (like 'Key Nutrients:', 'Foods to Eat:', 'Lifestyle & Exercise:') must be enclosed in double asterisks to be bold (e.g., **Key Nutrients:**). Each item under a heading should be on a new line, starting with a hyphen."),
  dashboardTip: z.string().optional().describe("A very short, crisp 2-3 line summary of the most important nutritional advice for the dashboard."),
});
export type HormonalCycleNutritionOutput = z.infer<typeof HormonalCycleNutritionOutputSchema>;

export async function getHormonalCycleNutrition(
  input: HormonalCycleNutritionInput
): Promise<HormonalCycleNutritionOutput> {
  return hormonalCycleNutritionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'hormonalCycleNutritionPrompt',
  input: {schema: HormonalCycleNutritionInputSchema},
  output: {schema: HormonalCycleNutritionOutputSchema},
  prompt: `You are an expert nutritionist specializing in women's hormonal health, pregnancy, and postpartum recovery.

**IMPORTANT FORMATTING RULES:**
- All section headings MUST be bolded by enclosing them in double asterisks (e.g., **Key Nutrients:**).
- Each item under a heading MUST start on a new line with a hyphen (-).

{{#if pregnancyTrimester}}
You are providing advice for a pregnant person in trimester {{{pregnancyTrimester}}}.

**User Preferences:**
- Dietary: {{{dietaryPreferences}}}
- Medical History: {{{medicalHistory}}}

**Your Task:** Provide a detailed, structured response with specific sections for diet, lifestyle, and exercise.

**Output format:**
- **recommendations**: Use these exact headings: **Key Nutrients:**, **Foods to Eat:**, **Foods to Avoid:**, and **Lifestyle & Exercise:**. This should be comprehensive.
- **dashboardTip**: Provide a very short, 2-3 line summary of the absolute most important advice for this trimester. For example, "Focus on folate-rich foods like lentils and spinach for neural tube development. Stay hydrated and consider gentle walks."

{{else if postDelivery}}
You are providing advice for a person who has recently given birth.

**User Preferences:**
- Dietary: {{{dietaryPreferences}}}

**Your Task:** Provide a detailed, structured response for postpartum recovery.

**Output format:**
- **recommendations**: Use these exact headings: **Key Nutrients for Recovery:**, **Foods for Healing & Energy:**, **Gentle Exercises:**.
- **dashboardTip**: Provide a very short, 2-3 line summary about postpartum recovery nutrition.

{{else}}
You are providing general nutrition advice based on the menstrual cycle.

**User Information:**
- Cycle Phase: {{{cyclePhase}}}
- Mood: {{{mood}}}
- Physical Symptoms: {{{physicalSymptoms}}}
- Dietary Preferences: {{{dietaryPreferences}}}
- Medical History: {{{medicalHistory}}}

**Your Task:** Provide personalized nutrition and diet recommendations.

**Output format:**
- **recommendations**: Use headings like **Foods to Focus On:** and **Lifestyle Tips:**. Provide a comprehensive response in a single block of text, following the formatting rules.
- **dashboardTip**: Create a short, 2-3 line summary of the main point in the recommendations.
{{/if}}
`,
});

const hormonalCycleNutritionFlow = ai.defineFlow(
  {
    name: 'hormonalCycleNutritionFlow',
    inputSchema: HormonalCycleNutritionInputSchema,
    outputSchema: HormonalCycleNutritionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
