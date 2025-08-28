'use server';

/**
 * @fileOverview Predicts the start date of the next period by analyzing past cycle data and considering mood, symptoms, age, and medical history.
 *
 * - predictPeriod - Main function to trigger prediction
 * - PredictPeriodInput - Input schema
 * - PredictPeriodOutput - Output schema with predicted date, confidence, reasoning, health analysis, and flow
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// === Input Schema ===
const PredictPeriodInputSchema = z.object({
  pastCycleData: z
    .array(
      z.object({
        start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be ISO date string (YYYY-MM-DD)'),
        end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be ISO date string (YYYY-MM-DD)'),
      })
    )
    .min(1, 'At least one past cycle is required')
    .describe('Array of past period start and end dates in ISO format.'),
  mood: z.string().describe('User’s current mood.'),
  physicalSymptoms: z.string().describe('User’s current physical symptoms.'),
  age: z.number().optional().describe('User’s age.'),
  medicalHistory: z.string().optional().describe('Pre-existing conditions like PCOS, Thyroid, etc.'),
});
export type PredictPeriodInput = z.infer<typeof PredictPeriodInputSchema>;

// === Output Schema ===
const PredictPeriodOutputSchema = z.object({
  predictedStartDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be valid ISO date string (YYYY-MM-DD)')
    .describe('Predicted start date of next period.'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('Confidence score between 0 and 1 based on cycle regularity.'),
  reasoning: z.string().describe('Explanation of prediction logic.'),
  healthAnalysis: z.string().optional().describe('Analysis of menstrual health including PCOS, menopause, irregularities.'),
  flowPrediction: z.string().optional().describe('Day-by-day flow intensity, e.g., "Day 1: Medium, Day 2: Heavy..."'),
});
export type PredictPeriodOutput = z.infer<typeof PredictPeriodOutputSchema>;

// === Define Prompt with Handlebars Syntax ===
const predictPeriodPrompt = ai.definePrompt({
  name: 'predictPeriodPrompt',
  input: { schema: PredictPeriodInputSchema },
  output: { schema: PredictPeriodOutputSchema },
  prompt: `You are an AI women's health expert specializing in menstrual cycle prediction and analysis.

**User Information:**
- Age: {{{age}}}
- Medical History: {{{medicalHistory}}}
- Past Cycle Data: {{#each pastCycleData}}Start: {{start}}, End: {{end}}; {{/each}}
- Current Mood: {{mood}}
- Current Physical Symptoms: {{physicalSymptoms}}

**Your Tasks:**

1. **Predict Next Period Start Date**
   - Calculate the average cycle length (in days) from the provided pastCycleData. A cycle is the number of days between the start of one period and the next.
   - Use this average to predict the **predictedStartDate** by adding it to the most recent period's start date.
   - Return the date in strict ISO format: YYYY-MM-DD.
   - Assign a **confidence** score (0–1):
     - 0.9–1.0: Cycles very regular (±1–2 days)
     - 0.7–0.8: Slight variation (±3–4 days)
     - 0.5–0.6: Moderately irregular
     - <0.5: Highly irregular or insufficient data
   - Provide **reasoning** explaining the average and confidence.

2. **Analyze Menstrual Health (healthAnalysis)**
   - **Regularity**: Normal cycle length is 21–35 days. Flag if cycles are consistently shorter, longer, or vary by more than 5 days.
   - **PCOS/PCOD Risk**: If cycles are frequently >35 days, highly irregular, or skipped — especially if medical history mentions PCOS — indicate possible PCOS. Suggest consulting a doctor.
   - **Perimenopause/Menopause**: If age ≥ 45 and cycles are becoming irregular or longer, mention perimenopause as a likely factor.
   - **Thyroid & Other Factors**: Note that thyroid disorders, stress, or extreme mood changes can disrupt cycles.
   - Always personalize advice using age and medical history.

3. **Predict Flow Intensity (flowPrediction)**
   - Provide a day-by-day prediction of flow for the upcoming period.
   - Format: "Day 1: Medium, Day 2: Heavy, Day 3: Heavy, Day 4: Medium, Day 5: Light"
   - Adjust based on symptoms:
     - Fatigue, cramps → heavier flow
     - Low energy, spotting → lighter flow
     - Mood swings → possible hormonal fluctuations

**Output Format**
Return ONLY a valid JSON object with these keys:
{
  "predictedStartDate": "YYYY-MM-DD",
  "confidence": 0.8,
  "reasoning": "...",
  "healthAnalysis": "...",
  "flowPrediction": "Day 1: Medium, Day 2: Heavy, ..."
}
⚠️ DO NOT include markdown, explanations, or code blocks. Return only raw JSON.
`,
});

// === Main Flow ===
const predictPeriodFlow = ai.defineFlow(
  {
    name: 'predictPeriodFlow',
    inputSchema: PredictPeriodInputSchema,
    outputSchema: PredictPeriodOutputSchema,
  },
  async (input) => {
    try {
      const result = await predictPeriodPrompt(input);
      const output = result.output;

      if (!output) throw new Error('AI returned no output');

      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(output.predictedStartDate)) {
        throw new Error('Invalid predictedStartDate format');
      }

      return output;
    } catch (error: any) {
      console.error('AI prediction failed:', error.message);
      // Fallback logic
      const lastStart = new Date(input.pastCycleData[input.pastCycleData.length - 1].start);
      const avgLength = _calculateAverageCycleLength(input.pastCycleData);
      const predictedDate = new Date(lastStart);
      predictedDate.setDate(predictedDate.getDate() + avgLength);
      const predictedStartDate = predictedDate.toISOString().split('T')[0];

      return {
        predictedStartDate,
        confidence: 0.5,
        reasoning: 'Fallback: Used average cycle length due to AI error.',
        healthAnalysis:
          'Could not perform full health analysis. Ensure at least 3–6 cycles are logged for accurate insights. Consult a healthcare provider for concerns about PCOS, menopause, or irregular cycles.',
        flowPrediction: 'Day 1: Medium, Day 2: Heavy, Day 3: Heavy, Day 4: Medium, Day 5: Light',
      };
    }
  }
);

// === Exported Function ===
export async function predictPeriod(input: PredictPeriodInput): Promise<PredictPeriodOutput> {
  return await predictPeriodFlow(input);
}

// === Helper: Calculate Average Cycle Length ===
function _calculateAverageCycleLength(cycles: { start: string }[]): number {
  if (cycles.length < 2) return 28;

  const diffs = cycles.slice(1).map((cycle, i) => {
    const prev = new Date(cycles[i].start);
    const curr = new Date(cycle.start);
    return Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
  });

  const sum = diffs.reduce((a, b) => a + b, 0);
  return Math.round(sum / diffs.length);
}