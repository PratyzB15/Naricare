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
    const {output} = await prompt(input);
    return output!;
  }
);
