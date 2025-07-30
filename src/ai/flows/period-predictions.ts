'use server';
/**
 * @fileOverview Predicts the start date of the next period by analyzing past cycle data and considering other inputs like mood and physical symptoms.
 *
 * - predictPeriod - A function that handles the period prediction process.
 * - PredictPeriodInput - The input type for the predictPeriod function.
 * - PredictPeriodOutput - The return type for the predictPeriod function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictPeriodInputSchema = z.object({
  pastCycleData: z
    .array(z.string())
    .describe('An array of past period start dates in ISO format (YYYY-MM-DD).'),
  mood: z.string().describe('The user current mood.'),
  physicalSymptoms: z.string().describe('The user physical symptoms.'),
});
export type PredictPeriodInput = z.infer<typeof PredictPeriodInputSchema>;

const PredictPeriodOutputSchema = z.object({
  predictedStartDate: z
    .string()
    .describe('The predicted start date of the next period in ISO format (YYYY-MM-DD).'),
  confidence: z
    .number()
    .describe('A number between 0 and 1 indicating the confidence in the prediction.'),
  reasoning: z.string().describe('The reasoning behind the prediction.'),
});
export type PredictPeriodOutput = z.infer<typeof PredictPeriodOutputSchema>;

export async function predictPeriod(input: PredictPeriodInput): Promise<PredictPeriodOutput> {
  return predictPeriodFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictPeriodPrompt',
  input: {schema: PredictPeriodInputSchema},
  output: {schema: PredictPeriodOutputSchema},
  prompt: `You are an AI period prediction assistant. You will predict the start date of the next period based on the user\'s past cycle data, mood, and physical symptoms.

Past Cycle Data: {{pastCycleData}}
Mood: {{mood}}
Physical Symptoms: {{physicalSymptoms}}

Give the predicted start date, confidence level, and reasoning behind the prediction.

Output in JSON format:
`,
});

const predictPeriodFlow = ai.defineFlow(
  {
    name: 'predictPeriodFlow',
    inputSchema: PredictPeriodInputSchema,
    outputSchema: PredictPeriodOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
