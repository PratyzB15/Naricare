'use server';

/**
 * @fileOverview An AI flow for analyzing user-reported symptoms for breast cancer risk.
 *
 * - breastCancerAnalysis - A function that handles the breast cancer symptom analysis.
 * - BreastCancerAnalysisInput - The input type for the breastCancerAnalysis function.
 * - BreastCancerAnalysisOutput - The return type for the breastCancerAnalysis function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// === Input Schema ===
const BreastCancerAnalysisInputSchema = z.object({
  symptoms: z
    .array(z.string())
    .describe('An array of symptoms selected by the user.'),
  imageDataUri: z.string().optional().describe(
    "An optional photo of the breast area, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type BreastCancerAnalysisInput = z.infer<typeof BreastCancerAnalysisInputSchema>;

// === Output Schema ===
const BreastCancerAnalysisOutputSchema = z.object({
  riskLevel: z
    .enum(['Low', 'Medium', 'High'])
    .describe('The assessed risk level based on the symptoms.'),
  recommendation: z
    .string()
    .describe('A clear recommendation for the user based on the risk level.'),
  analysis: z.string().describe('A brief analysis of why the risk level was assigned.'),
});
export type BreastCancerAnalysisOutput = z.infer<typeof BreastCancerAnalysisOutputSchema>;

// === Main Function ===
export async function breastCancerAnalysis(
  input: BreastCancerAnalysisInput
): Promise<BreastCancerAnalysisOutput> {
  return await breastCancerAnalysisFlow(input);
}

// === AI Flow Definition ===
const breastCancerAnalysisFlow = ai.defineFlow(
  {
    name: 'breastCancerAnalysisFlow',
    inputSchema: BreastCancerAnalysisInputSchema,
    outputSchema: BreastCancerAnalysisOutputSchema,
  },
  async (input) => {
    if (input.symptoms.length === 0 && !input.imageDataUri) {
      return {
        riskLevel: 'Low',
        analysis: 'No symptoms or images were reported.',
        recommendation: 'No symptoms were reported. It is important to continue regular self-examinations and report any new or changing symptoms to your doctor during your next check-up.'
      };
    }

    const symptomList = input.symptoms.map(symptom => `- ${symptom}`).join('\n');
    const imageInfo = input.imageDataUri ? `\n**User's Provided Image:** An image has been provided for visual analysis.` : '';

    const prompt = `You are a medical AI assistant specializing in breast cancer risk analysis. Your role is to provide a preliminary assessment based on user-reported symptoms and an optional image. You must be cautious and always encourage users to consult a healthcare professional.

**User's Reported Symptoms:**
${symptomList}
${imageInfo}

**Your Task:**
Analyze the provided symptoms and image (if available) to determine a risk level and recommendation. If an image is provided, look for visual signs like skin dimpling, redness, or nipple inversion.

**Risk Logic:**
- **High Risk:** Assign this if symptoms like "Lump or thickened area...", "If the lump is growing day by day", "Nipple inversion (if new)", or "Unusual nipple discharge (especially bloody or clear)" are present, or if the image shows clear signs of puckering, redness, or inversion. These are significant warning signs.
- **Medium Risk:** Assign this if symptoms like "Change in breast size or shape", "Skin dimpling...", or "Persistent pain in one area" are present without the high-risk symptoms, or if the image shows subtle but noticeable changes.
- **Low Risk:** If no symptoms are selected, or only symptoms not strongly associated with cancer are chosen and the image appears normal. Even with low risk, always remind the user that self-exams are important.

**IMPORTANT:** Do not provide a medical diagnosis. Your goal is to guide the user on the urgency of seeking professional medical advice.

**Output Format:**
Return ONLY a valid JSON object with these keys:
{
  "riskLevel": "Low" | "Medium" | "High",
  "analysis": "Brief explanation of why the risk level was chosen",
  "recommendation": "Appropriate recommendation based on risk level"
}

⚠️ DO NOT include any markdown, code blocks, explanations, or extra text.
Return only the raw JSON object.
`;

    try {
      const result = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        prompt,
        output: {
          schema: BreastCancerAnalysisOutputSchema,
          format: 'json',
        },
        config: {
          temperature: 0.3,
          topK: 30,
          topP: 0.8,
        },
      });

      // ✅ Use `result.output` (property), not `result.output()`
      const output = result.output;

      if (!output) {
        throw new Error('AI generated invalid or null output.');
      }

      return output;
    } catch (error: any) {
      console.error('Error in breastCancerAnalysisFlow:', error.message);

      // Fallback with meaningful defaults
      return {
        riskLevel: 'Medium',
        analysis: 'Unable to process the analysis due to an error. Please ensure symptoms are clearly described and consider consulting a healthcare professional.',
        recommendation: 'Please schedule a visit with your doctor for a proper evaluation of your symptoms.'
      };
    }
  }
);