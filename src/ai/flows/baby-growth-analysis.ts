'use server';
/**
 * @fileOverview Analyzes baby's growth parameters and optional photo to provide a health assessment.
 *
 * - babyGrowthAnalysis - A function that returns a health and growth analysis for a baby.
 * - BabyGrowthAnalysisInput - The input type for the babyGrowthAnalysis function.
 * - BabyGrowthAnalysisOutput - The return type for the babyGrowthAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BabyGrowthAnalysisInputSchema = z.object({
  ageInMonths: z
    .number()
    .describe("The baby's age in months."),
  weightInKg: z.number().optional().describe("The baby's weight in kilograms."),
  heightInCm: z.number().optional().describe("The baby's height in centimeters."),
  headCircumferenceInCm: z.number().optional().describe("The baby's head circumference in centimeters."),
  babyPhotoDataUri: z.string().optional().describe(
      "An optional photo of the baby, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type BabyGrowthAnalysisInput = z.infer<typeof BabyGrowthAnalysisInputSchema>;

const BabyGrowthAnalysisOutputSchema = z.object({
  analysis: z.string().describe("A comprehensive analysis of the baby's growth and health. Each section heading (like '**Growth Parameters:**', '**Developmental Milestones:**') must be enclosed in double asterisks to be bold. Each item under a heading should be on a new line, starting with a hyphen."),
});
export type BabyGrowthAnalysisOutput = z.infer<typeof BabyGrowthAnalysisOutputSchema>;

export async function babyGrowthAnalysis(
  input: BabyGrowthAnalysisInput
): Promise<BabyGrowthAnalysisOutput> {
  return babyGrowthAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'babyGrowthAnalysisPrompt',
  input: {schema: BabyGrowthAnalysisInputSchema},
  output: {schema: BabyGrowthAnalysisOutputSchema},
  prompt: `You are an expert pediatrician specializing in infant growth and development. Analyze the provided data and optional photo to give a comprehensive health assessment for a baby of {{{ageInMonths}}} months.

**IMPORTANT FORMATTING RULES:**
- All section headings MUST be bolded by enclosing them in double asterisks (e.g., **Growth Parameters:**).
- Each item under a heading MUST start on a new line with a hyphen (-).

**Baby's Data:**
- Age: {{{ageInMonths}}} months
{{#if weightInKg}}- Weight: {{{weightInKg}}} kg{{/if}}
{{#if heightInCm}}- Height: {{{heightInCm}}} cm{{/if}}
{{#if headCircumferenceInCm}}- Head Circumference: {{{headCircumferenceInCm}}} cm{{/if}}

{{#if babyPhotoDataUri}}
**Baby's Photo:**
{{media url=babyPhotoDataUri}}
{{/if}}

**Reference Tables:**

*Growth Parameters by Age:*
| Age (Months) | Weight (kg) | Length (cm) | Head (cm) |
| :--- | :--- | :--- | :--- |
| Birth | 2.5–4.0 | 48–52 | 33–35 |
| 1 | 3.4–5.0 | 50–55 | 34–37 |
| 3 | 5.0–6.5 | 58–62 | 39–41 |
| 6 | 6.5–8.0 | 64–68 | 41–43 |
| 9 | 7.5–9.0 | 68–72 | 43–45 |
| 12 | 8.5–10.5 | 74–78 | 44–46 |

*Abnormal Values and Indicators:*
| Parameter | Abnormal | Indicates |
| :--- | :--- | :--- |
| Weight | <2.5 kg | Low birth weight (prematurity, IUGR) |
| Weight | >4.0 kg | Macrosomia (diabetes in mother, genetic) |
| Length | <45 cm | Prematurity |
| Head | <32 cm | Microcephaly (brain growth issue) |
| Head | >37 cm | Hydrocephalus |

*Developmental Milestones & Health Signs by Age:*
| Age | Physical Signs | Developmental Signs | Feeding & Growth |
| :--- | :--- | :--- | :--- |
| 0–1 Mo | Pink skin, responds to touch | Turns head to sound, startle reflex | Breastfed 8–12 times/day, regains birth weight |
| 1–3 Mo | Head steady, alert eyes | Smiles socially, follows objects | Gains 150–200 g/week |
| 3–6 Mo | Good muscle tone, rolls over | Laughs, babbles | Doubles birth weight by 5–6 months |
| 6–9 Mo | Sits with support, crawls | Responds to name | Eats solids |
| 9–12 Mo | Stands with support, waves bye | Says “mama/dada” | Triples birth weight by 12 months |
| 12–24 Mo | Walks independently, stacks blocks | Speaks simple words, imitates | Drinks from cup, self-feeding |
| 24–36 Mo| Runs, jumps, climbs | 2–3 word sentences | Steady growth, balanced diet |

**Your Task:**
Generate a structured report with the following sections.

1.  **Growth Parameters:**
    - Compare the baby's provided weight, height, and head circumference to the normal range for their age.
    - State clearly if each parameter is "Within Normal Range," "Above Normal Range," or "Below Normal Range."
    - If a parameter is abnormal, briefly mention the potential indicator (e.g., "Weight is below normal range, which can be a sign of low birth weight or IUGR.").

2.  **Developmental Milestones:**
    - Based on the age, describe the expected developmental signs (physical, cognitive, social).
    - If a photo is provided, analyze it for visible health signs like skin color, alertness, and muscle tone. For example, "The photo shows the baby has pink skin and alert eyes, which are positive health indicators."

3.  **Potential Health Concerns:**
    - Based on the age, list 1-2 common illnesses for this age group (e.g., Common Cold, Diaper Rash).
    - Provide a brief, one-sentence prevention tip for each.

4.  **General Recommendations:**
    - Provide 2-3 key recommendations for this age, focusing on feeding, safety, or interaction (e.g., "Ensure timely vaccinations," "Introduce tummy time for muscle development," "Continue exclusive breastfeeding.").

If no parameters are provided, just give general advice for the given age based on the developmental milestones table.
`,
});

const babyGrowthAnalysisFlow = ai.defineFlow(
  {
    name: 'babyGrowthAnalysisFlow',
    inputSchema: BabyGrowthAnalysisInputSchema,
    outputSchema: BabyGrowthAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
