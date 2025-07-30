'use server';
/**
 * @fileOverview Personalized nutrition and diet recommendations based on hormonal cycle phase.
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
    .describe("The current phase of the user's menstrual cycle (e.g., menstruation, follicular, ovulation, luteal)."),
  mood: z.string().optional().describe('The current mood of the user.'),
  physicalSymptoms: z
    .string()
    .optional()
    .describe('Any physical symptoms the user is experiencing.'),
  dietaryPreferences: z
    .string()
    .optional()
    .describe('Any dietary preferences or restrictions of the user.'),
  medicalHistory: z
    .string()
    .optional()
    .describe('Relevant medical history, including thyroid issues, PCOS, or PCOD.'),
});
export type HormonalCycleNutritionInput = z.infer<typeof HormonalCycleNutritionInputSchema>;

const HormonalCycleNutritionOutputSchema = z.object({
  recommendations: z.string().describe('Personalized nutrition and diet recommendations based on the input data.'),
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
  prompt: `You are a nutritionist specializing in hormonal health.

  Based on the user's current menstrual cycle phase, mood, physical symptoms, dietary preferences, and medical history, provide personalized nutrition and diet recommendations.

  Cycle Phase: {{{cyclePhase}}}
  Mood: {{{mood}}}
  Physical Symptoms: {{{physicalSymptoms}}}
  Dietary Preferences: {{{dietaryPreferences}}}
  Medical History: {{{medicalHistory}}}

  Recommendations:`, // Removed extra space at the end
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
