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
    .array(z.object({
        start: z.string().describe('The start date of the period in ISO format (YYYY-MM-DD).'),
        end: z.string().describe('The end date of the period in ISO format (YYYY-MM-DD).'),
    }))
    .describe('An array of past period start and end dates.'),
  mood: z.string().describe('The user current mood.'),
  physicalSymptoms: z.string().describe('The user physical symptoms.'),
  age: z.number().optional().describe('The age of the user.'),
  medicalHistory: z.string().optional().describe('Any pre-existing medical conditions like Thyroid, PCOS etc.'),
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
  healthAnalysis: z.string().optional().describe('An analysis of menstrual health, including warnings for PCOS/PCOD, irregularities, or menopause based on cycle history, age and medical conditions.'),
  flowPrediction: z.string().optional().describe('A day-by-day prediction of the menstrual flow (e.g., "Day 1: Medium, Day 2: Heavy, Day 3: Heavy, Day 4: Medium, Day 5: Light").'),
});
export type PredictPeriodOutput = z.infer<typeof PredictPeriodOutputSchema>;

export async function predictPeriod(input: PredictPeriodInput): Promise<PredictPeriodOutput> {
  return predictPeriodFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictPeriodPrompt',
  input: {schema: PredictPeriodInputSchema},
  output: {schema: PredictPeriodOutputSchema},
  prompt: `You are an AI period prediction and women's health expert. You will predict the start date of the next period and analyze the user's menstrual health based on their past cycle data, age, medical history, mood, and physical symptoms.

**User Information:**
- Age: {{{age}}}
- Medical History: {{{medicalHistory}}}
- Past Cycle Data: {{#each pastCycleData}}Start: {{start}}, End: {{end}}; {{/each}}
- Current Mood: {{mood}}
- Current Physical Symptoms: {{physicalSymptoms}}

**Your Tasks:**

1.  **Predict Next Period:**
    *   First, calculate the average cycle length from the provided pastCycleData. A cycle is the time from the start of one period to the start of the next.
    *   Based on this average, predict the predictedStartDate of the next menstrual cycle by adding the average cycle length to the start date of the most recent period. A typical cycle is 28-32 days, but you must use the user's historical average.
    *   Provide a confidence score (0-1). Confidence should be higher for users with very regular cycles.
    *   Provide your reasoning, explaining the average cycle length you calculated and how you used it for the prediction.

2.  **Analyze Menstrual Health:** Provide a healthAnalysis. This is crucial.
    *   **Cycle Regularity:** Analyze the cycle lengths. A normal cycle is 21-35 days. If cycles are consistently shorter or longer, or vary wildly, it's irregular. Mention this.
    *   **PCOS/PCOD Detection:** If you see a history of very irregular or missed periods (e.g., cycles longer than 35-40 days, or large variations), especially if combined with a medical history of PCOS, flag this. Mention symptoms like irregular periods. Suggest seeing a doctor.
    *   **Menopause Detection:** If the user is over 45-50 and has highly irregular or missed periods, consider mentioning that perimenopause or menopause can cause such changes.
    *   **Personalization:** Use the age and medicalHistory (e.g., Thyroid issues) to make your analysis more accurate. Thyroid issues can cause irregular periods.

3.  **Predict Flow Intensity:** Provide a day-by-day flowPrediction for the next cycle. A standard pattern is: Day 1: Medium, Day 2: Heavy, Day 3: Heavy, Day 4: Medium, Day 5: Light.

**Output Format:**
Provide your response in a clear JSON format. If there are no health concerns, the healthAnalysis can be a simple statement like "Your cycles appear to be regular and healthy."
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
