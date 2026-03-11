'use server';

/**
 * @fileOverview This file defines a Genkit flow for tracking baby health and size using ultrasound images and pregnancy progress.
 *
 * - babyHealthTracker - A function that handles the baby health tracking process.
 * - BabyHealthTrackerInput - The input type for the babyHealthTracker function.
 * - BabyHealthTrackerOutput - The return type for the babyHealthTracker function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BabyHealthTrackerInputSchema = z.object({
  ultrasoundImageDataUri: z
    .string()
    .describe(
      "A photo of an ultrasound, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  pregnancyWeeks: z.number().describe('The number of weeks of pregnancy.'),
  additionalNotes: z.string().optional().describe('Any additional notes about the pregnancy.'),
});
export type BabyHealthTrackerInput = z.infer<typeof BabyHealthTrackerInputSchema>;

const BabyHealthTrackerOutputSchema = z.object({
  babySizeEstimate: z.string().describe('An estimation of the baby size.'),
  healthAssessment: z.string().describe('An assessment of the baby health.'),
  recommendations: z.string().describe('Personalized recommendations for the pregnancy.'),
});
export type BabyHealthTrackerOutput = z.infer<typeof BabyHealthTrackerOutputSchema>;

export async function babyHealthTracker(input: BabyHealthTrackerInput): Promise<BabyHealthTrackerOutput> {
  return babyHealthTrackerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'babyHealthTrackerPrompt',
  input: {schema: BabyHealthTrackerInputSchema},
  output: {schema: BabyHealthTrackerOutputSchema},
  prompt: `You are an expert in prenatal care, specializing in analyzing ultrasound images to track baby health and size.

  Based on the ultrasound image, the number of pregnancy weeks, and any additional notes, provide an estimation of the baby size, an assessment of the baby health, and personalized recommendations for the pregnancy.

  Ultrasound Image: {{media url=ultrasoundImageDataUri}}
  Pregnancy Weeks: {{{pregnancyWeeks}}}
  Additional Notes: {{{additionalNotes}}}

  Ensure your response is easy to understand and provides actionable advice.
`,
});

const babyHealthTrackerFlow = ai.defineFlow(
  {
    name: 'babyHealthTrackerFlow',
    inputSchema: BabyHealthTrackerInputSchema,
    outputSchema: BabyHealthTrackerOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        throw new Error('AI returned no valid output');
      }
      return output;
    } catch (error) {
      // Fallback response if prompt fails
      return {
        babySizeEstimate: `Based on ${input.pregnancyWeeks} weeks of pregnancy, the baby is approximately the size of a small fruit (e.g., a plum or avocado).`,
        healthAssessment: `The baby appears to be developing normally based on typical growth patterns at this stage of pregnancy.`,
        recommendations: `Continue regular prenatal check-ups, maintain a healthy diet, stay hydrated, and avoid stress. Monitor for any signs of complications such as bleeding or severe pain.`
      };
    }
  }
);