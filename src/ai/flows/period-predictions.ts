import { ai } from '../genkit';
import { z } from 'genkit';

// === Blood Color Types ===
export const BloodColorSchema = z.enum([
  'Bright Red',
  'Dark Red/Brown',
  'Black',
  'Pink',
  'Orange',
  'Gray',
  'Not Applicable'
]);

// === Input Schema with Blood Color ===
export const PredictPeriodInputSchema = z.object({
  pastCycleData: z.array(
    z.object({
      start: z.string(),
      end: z.string(),
    })
  ).min(1),
  mood: z.string().optional().default(''),
  physicalSymptoms: z.string().optional().default(''),
  bloodColor: BloodColorSchema.optional(),  // ⬅️ NEW FIELD
  age: z.number().optional(),
  medicalHistory: z.string().optional(),
  periodOccurred: z.boolean().optional(),
  flowFeedback: z.string().optional(),
});

export type PredictPeriodInput = z.infer<typeof PredictPeriodInputSchema>;

// === Output Schema with Blood Analysis ===
export const PredictPeriodOutputSchema = z.object({
  predictedStartDate: z.string(),
  confidence: z.number(),
  reasoning: z.string(),
  healthAnalysis: z.string().optional(),
  flowPrediction: z.string().optional(),
  bloodColorAnalysis: z.string().optional(),  // ⬅️ NEW FIELD
  recommendations: z.array(z.string()).optional(),
  cyclePhase: z.string().optional(),
  phaseDescription: z.string().optional(),
  phaseSymptoms: z.string().optional(),
  emotionalState: z.string().optional(),
});

export type PredictPeriodOutput = z.infer<typeof PredictPeriodOutputSchema>;

// === AI Prompt with Blood Color Analysis ===
const predictPeriodPrompt = ai.definePrompt({
  name: 'predictPeriodPrompt',
  input: { schema: PredictPeriodInputSchema },
  output: { schema: PredictPeriodOutputSchema },
  prompt: `You are an AI women's health expert for NariCare.

**User Information:**
- Past Cycles: {{#each pastCycleData}}Start: {{start}}, End: {{end}}; {{/each}}
- Mood: {{mood}}
- Symptoms: {{physicalSymptoms}}
- Blood Color: {{bloodColor}}  ⬅️ NEW
- Period Occurred: {{periodOccurred}}

**Tasks:**
1. Predict next period date (YYYY-MM-DD)
2. Blood color analysis (important!) ⬅️ NEW
3. Health recommendations
4. Current cycle phase

**Blood Color Guide:**
- Bright Red: Normal fresh flow
- Dark Red/Brown: Normal, older blood
- Black: Oxidized, may be leftover
- Pink: Low estrogen/anemia possible
- Orange: Possible infection
- Gray: Urgent - possible infection/miscarriage
- Not Applicable: No current period

Return ONLY JSON with these keys:
{
  "predictedStartDate": "YYYY-MM-DD",
  "confidence": 0.8,
  "reasoning": "...",
  "healthAnalysis": "...",
  "flowPrediction": "Day 1: Medium...",
  "bloodColorAnalysis": "...",  ⬅️ NEW
  "recommendations": ["..."],
  "cyclePhase": "...",
  "phaseDescription": "...",
  "phaseSymptoms": "...",
  "emotionalState": "..."
}
`,
});

// === Helper: Blood Color Fallback Analysis ===
function getBloodColorAnalysis(color: string): string {
  const analysisMap: Record<string, string> = {
    'Bright Red': 'Normal fresh menstrual flow. Indicates active menstruation.',
    'Dark Red/Brown': 'Older blood, normal at beginning or end of period.',
    'Black': 'Very old, oxidized blood. May be leftover from previous cycle.',
    'Pink': 'May indicate low estrogen levels or anemia. Consider nutritional evaluation.',
    'Orange': 'Could suggest possible infection. Monitor for other symptoms.',
    'Gray': 'Potential infection or other concerns. Seek medical attention.',
    'Not Applicable': 'No current menstrual flow to analyze.'
  };
  return analysisMap[color] || '';
}

// === Helper: Calculate Average Cycle ===
function calculateAverageCycle(cycles: { start: string }[]): number {
  if (cycles.length < 2) return 28;
  const diffs = cycles.slice(1).map((cycle, i) => {
    const prev = new Date(cycles[i].start);
    const curr = new Date(cycle.start);
    return Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
  });
  const sum = diffs.reduce((a, b) => a + b, 0);
  return Math.round(sum / diffs.length);
}

// === Main Flow ===
export const predictPeriodFlow = ai.defineFlow(
  {
    name: 'predictPeriodFlow',
    inputSchema: PredictPeriodInputSchema,
    outputSchema: PredictPeriodOutputSchema,
  },
  async (input) => {
    try {
      const result = await predictPeriodPrompt(input);
      const output = result.output;
      
      if (!output) throw new Error('No AI output');
      
      return output;
    } catch (error) {
      console.error('AI prediction failed:', error);
      
      // Fallback logic
      const lastStart = new Date(input.pastCycleData[input.pastCycleData.length - 1].start);
      const avgLength = calculateAverageCycle(input.pastCycleData);
      const predictedDate = new Date(lastStart);
      predictedDate.setDate(predictedDate.getDate() + avgLength);
      
      return {
        predictedStartDate: predictedDate.toISOString().split('T')[0],
        confidence: 0.5,
        reasoning: 'Used average cycle length as fallback.',
        healthAnalysis: 'Consult healthcare provider for personalized advice.',
        flowPrediction: 'Day 1: Medium, Day 2: Heavy, Day 3: Heavy, Day 4: Medium, Day 5: Light',
        bloodColorAnalysis: input.bloodColor ? getBloodColorAnalysis(input.bloodColor) : '',
        recommendations: ['Track 3-6 cycles for accuracy', 'Consult doctor for concerns'],
        cyclePhase: 'Follicular Phase',
        phaseDescription: 'Uterine lining thickens preparing for potential pregnancy.',
        phaseSymptoms: 'Increased energy, clear-mindedness',
        emotionalState: 'Optimism, sociability, happiness'
      };
    }
  }
);

// === Server Action Export ===
export async function predictPeriod(input: PredictPeriodInput): Promise<PredictPeriodOutput> {
  return await predictPeriodFlow(input);
}