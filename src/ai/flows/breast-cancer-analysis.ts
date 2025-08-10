'use server';

/**
 * @fileOverview An AI flow for analyzing user-reported symptoms for breast cancer risk.
 *
 * - breastCancerAnalysis - A function that handles the breast cancer symptom analysis.
 * - BreastCancerAnalysisInput - The input type for the breastCancerAnalysis function.
 * - BreastCancerAnalysisOutput - The return type for the breastCancerAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BreastCancerAnalysisInputSchema = z.object({
  symptoms: z
    .array(z.string())
    .describe('An array of symptoms selected by the user.'),
  imageDataUri: z.string().optional().describe(
      "An optional photo of the breast area, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type BreastCancerAnalysisInput = z.infer<typeof BreastCancerAnalysisInputSchema>;

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

export async function breastCancerAnalysis(
  input: BreastCancerAnalysisInput
): Promise<BreastCancerAnalysisOutput> {
  return breastCancerAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'breastCancerAnalysisPrompt',
  input: {schema: BreastCancerAnalysisInputSchema},
  output: {schema: BreastCancerAnalysisOutputSchema},
  prompt: `You are a medical AI assistant specializing in breast cancer risk analysis. Your role is to provide a preliminary assessment based on user-reported symptoms and an optional image. You must be cautious and always encourage users to consult a healthcare professional.

**User's Reported Symptoms:**
{{#each symptoms}}
- {{{this}}}
{{/each}}

{{#if imageDataUri}}
**User's Provided Image:**
{{media url=imageDataUri}}
{{/if}}

**Your Task:**
Analyze the provided symptoms and image (if available) to determine a risk level and recommendation. If an image is provided, look for visual signs like skin dimpling, redness, or nipple inversion.

**Risk Logic:**
- **High Risk:** Assign this if symptoms like "Lump or thickened area...", "If the lump is growing day by day", "Nipple inversion (if new)", or "Unusual nipple discharge (especially bloody or clear)" are present, or if the image shows clear signs of puckering, redness, or inversion. These are significant warning signs.
- **Medium Risk:** Assign this if symptoms like "Change in breast size or shape", "Skin dimpling...", or "Persistent pain in one area" are present without the high-risk symptoms, or if the image shows subtle but noticeable changes.
- **Low Risk:** If no symptoms are selected, or only symptoms not strongly associated with cancer are chosen and the image appears normal. Even with low risk, always remind the user that self-exams are important.

**Output:**
- **riskLevel**: "Low", "Medium", or "High".
- **analysis**: Briefly explain why the risk level was chosen, referencing the reported symptoms and any visual cues from the image.
- **recommendation**: Provide a clear, actionable recommendation.
    - **High Risk Recommendation:** "Your reported symptoms and/or the provided image show concerning signs. It is highly recommended that you schedule an appointment with a doctor or gynecologist as soon as possible for a professional evaluation."
    - **Medium Risk Recommendation:** "The symptoms you've selected or visual signs can sometimes be associated with breast changes. While it may not be serious, it is important to consult a healthcare professional to rule out any issues. Please schedule a visit with your doctor."
    - **Low Risk Recommendation:** "Based on your report, your symptoms do not strongly indicate a high risk. However, it is important to continue regular self-examinations and report any new or changing symptoms to your doctor during your next check-up."

**IMPORTANT:** Do not provide a medical diagnosis. Your goal is to guide the user on the urgency of seeking professional medical advice.`,
});

const breastCancerAnalysisFlow = ai.defineFlow(
  {
    name: 'breastCancerAnalysisFlow',
    inputSchema: BreastCancerAnalysisInputSchema,
    outputSchema: BreastCancerAnalysisOutputSchema,
  },
  async input => {
    if (input.symptoms.length === 0 && !input.imageDataUri) {
        return {
            riskLevel: 'Low',
            analysis: 'No symptoms or images were reported.',
            recommendation: 'No symptoms were reported. It is important to continue regular self-examinations and report any new or changing symptoms to your doctor during your next check-up.'
        }
    }
    const {output} = await prompt(input);
    return output!;
  }
);
