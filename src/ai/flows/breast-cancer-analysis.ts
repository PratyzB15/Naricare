'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// === Input Schema ===
const BreastCancerAnalysisInputSchema = z.object({
  symptoms: z
    .array(z.string())
    .describe('An array of symptoms selected by the user.'),
  imageDataUri: z
    .string()
    .optional()
    .describe(
      "An optional photo of the breast area, as a data URI that includes the MIME type and Base64 encoding."
    ),
});

export type BreastCancerAnalysisInput = z.infer<
  typeof BreastCancerAnalysisInputSchema
>;

// === Output Schema ===
const BreastCancerAnalysisOutputSchema = z.object({
  riskLevel: z.enum(['Low', 'Medium', 'High']),
  recommendation: z.string(),
  analysis: z.string(),
});

export type BreastCancerAnalysisOutput = z.infer<
  typeof BreastCancerAnalysisOutputSchema
>;

// === AI Flow ===
export async function breastCancerAnalysis(
  input: BreastCancerAnalysisInput
): Promise<BreastCancerAnalysisOutput> {
  return await breastCancerAnalysisFlow(input);
}

const breastCancerAnalysisFlow = ai.defineFlow<
  typeof BreastCancerAnalysisInputSchema,
  typeof BreastCancerAnalysisOutputSchema
>(
  {
    name: 'breastCancerAnalysisFlow',
    inputSchema: BreastCancerAnalysisInputSchema,
    outputSchema: BreastCancerAnalysisOutputSchema,
  },
  async (
    input
  ): Promise<z.infer<typeof BreastCancerAnalysisOutputSchema>> => {
    if (input.symptoms.length === 0 && !input.imageDataUri) {
      return {
        riskLevel: 'Low',
        analysis: 'No symptoms or images were reported.',
        recommendation:
          'No symptoms were reported. Continue regular self-examinations and consult your doctor if you notice changes.',
      };
    }

    const symptomList = input.symptoms.map((s) => `- ${s}`).join('\n');
    const imageInfo = input.imageDataUri
      ? '\nAn image has been provided for analysis.'
      : '';

    const prompt = `You are a medical AI assistant specializing in breast cancer risk assessment.

**User's Reported Symptoms:**
${symptomList}
${imageInfo}

Determine a risk level and give a brief analysis with a recommendation.

Risk logic:
- High Risk: "Lump", "nipple inversion (new)", "bloody discharge"
- Medium Risk: "Pain", "swelling", "skin dimpling"
- Low Risk: Other or no concerning symptoms.

Output strict JSON:
{
  "riskLevel": "Low" | "Medium" | "High",
  "analysis": "why the risk level was chosen",
  "recommendation": "appropriate next step"
}`;

    try {
      const result = await ai.generate({
        model: 'gemini-3-pro',
        prompt,
        output: {
          schema: BreastCancerAnalysisOutputSchema,
          format: 'json',
        },
        config: { temperature: 0.3 },
      });

      // ✅ Zod validation guarantees proper enum type
      const parsed = BreastCancerAnalysisOutputSchema.parse(result.output);
      return parsed;
    } catch (err) {
      console.error('Error in breastCancerAnalysisFlow:', err);
      // ✅ Safe fallback still matches enum type
      return {
        riskLevel: 'Medium',
        analysis:
          'Unable to process AI output. Returning safe default risk assessment.',
        recommendation:
          'Please consult a healthcare professional for an accurate evaluation.',
      };
    }
  }
);
