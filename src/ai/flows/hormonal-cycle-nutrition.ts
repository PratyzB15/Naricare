'use server';
/**
 * @fileOverview Personalized nutrition and diet recommendations based on hormonal cycle phase or pregnancy week.
 *
 * - getHormonalCycleNutrition - A function that provides personalized nutrition recommendations.
 * - HormonalCycleNutritionInput - The input type for the getHormonalCycleNutrition function.
 * - HormonalCycleNutritionOutput - The return type for the getHormonalCycleNutrition function.
 */
 
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const HormonalCycleNutritionInputSchema = z.object({
  cyclePhase: z
    .string()
    .optional()
    .describe("The current phase of the user's menstrual cycle (e.g., menstruation, follicular, ovulation, luteal)."),
  pregnancyTrimester: z
    .number()
    .optional()
    .describe("The user's current pregnancy trimester (1, 2, or 3)."),
  mood: z.string().optional().describe('The current mood of the user.'),
  physicalSymptoms: z
    .string()
    .optional()
    .describe('Any physical symptoms the user is experiencing.'),
  dietaryPreferences: z
    .string()
    .optional()
    .describe('Any dietary preferences or restrictions of the user (e.g., vegan, vegetarian, gluten-free).'),
  medicalHistory: z
    .string()
    .optional()
    .describe('Relevant medical history, including thyroid issues, PCOS, or PCOD.'),
  postDelivery: z.boolean().optional().describe('Set to true if user is in post-delivery phase.')
});
export type HormonalCycleNutritionInput = z.infer<typeof HormonalCycleNutritionInputSchema>;

const HormonalCycleNutritionOutputSchema = z.object({
  recommendations: z.string().describe("A detailed, structured response. Each section heading (like 'Key Nutrients:', 'Foods to Eat:', 'Lifestyle & Exercise:') must be enclosed in double asterisks to be bold (e.g., **Key Nutrients:**). Each item under a heading should be on a new line, starting with a hyphen."),
  dashboardTip: z.string().optional().describe("A very short, crisp 2-3 line summary of the most important nutritional advice for the dashboard."),
});
export type HormonalCycleNutritionOutput = z.infer<typeof HormonalCycleNutritionOutputSchema>;

export async function getHormonalCycleNutrition(
  input: HormonalCycleNutritionInput
): Promise<HormonalCycleNutritionOutput> {
  return hormonalCycleNutritionFlow(input);
}

const hormonalCycleNutritionFlow = ai.defineFlow(
  {
    name: 'hormonalCycleNutritionFlow',
    inputSchema: HormonalCycleNutritionInputSchema,
    outputSchema: HormonalCycleNutritionOutputSchema,
  },
  async (input) => {
    let context = '';
    
    if (input.pregnancyTrimester) {
      context = `You are providing advice for a pregnant person in trimester ${input.pregnancyTrimester}.`;
    } else if (input.postDelivery) {
      context = 'You are providing advice for a person who has recently given birth.';
    } else {
      context = `You are providing general nutrition advice based on the menstrual cycle. Cycle Phase: ${input.cyclePhase || 'Not specified'}`;
    }

    const userInfo = `
**User Information:**
- Dietary Preferences: ${input.dietaryPreferences || 'Not specified'}
- Medical History: ${input.medicalHistory || 'Not specified'}
- Mood: ${input.mood || 'Not specified'}
- Physical Symptoms: ${input.physicalSymptoms || 'Not specified'}
${input.cyclePhase ? `- Cycle Phase: ${input.cyclePhase}` : ''}
${input.pregnancyTrimester ? `- Pregnancy Trimester: ${input.pregnancyTrimester}` : ''}
${input.postDelivery ? '- Post-Delivery: Yes' : ''}
`;

    const prompt = `You are an expert nutritionist specializing in women's hormonal health, pregnancy, and postpartum recovery.

**IMPORTANT FORMATTING RULES:**
- All section headings MUST be bolded by enclosing them in double asterisks (e.g., **Key Nutrients:**).
- Each item under a heading MUST start on a new line with a hyphen (-).

${context}
${userInfo}

**Your Task:** Provide personalized nutrition and diet recommendations based on the user's specific situation.

${input.pregnancyTrimester ? `
**For Pregnancy Trimester ${input.pregnancyTrimester}:**
Provide a detailed, structured response with specific sections for diet, lifestyle, and exercise.
Use these exact headings: **Key Nutrients:**, **Foods to Eat:**, **Foods to Avoid:**, and **Lifestyle & Exercise:**.
` : input.postDelivery ? `
**For Postpartum Recovery:**
Provide a detailed, structured response for postpartum recovery.
Use these exact headings: **Key Nutrients for Recovery:**, **Foods for Healing & Energy:**, **Gentle Exercises:**.
` : `
**For Menstrual Cycle Nutrition:**
Provide personalized nutrition and diet recommendations based on the menstrual cycle phase.
Use headings like **Foods to Focus On:** and **Lifestyle Tips:**.
`}

**Output Format:**
Output a valid JSON object matching this exact schema:
{
  "recommendations": "Detailed recommendations with bold headings and bullet points",
  "dashboardTip": "Very short 2-3 line summary of most important advice"
}

**Example Output:**
{
  "recommendations": "**Key Nutrients:**\\n- Iron-rich foods\\n- Folate\\n- Calcium\\n\\n**Foods to Eat:**\\n- Leafy greens\\n- Lean proteins\\n- Whole grains",
  "dashboardTip": "Focus on iron-rich foods during this phase. Stay hydrated and include plenty of leafy greens in your diet."
}

Ensure your response is comprehensive and follows all formatting rules.`;

    const result = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt,
      config: {
        temperature: 0.7,
        topK: 50,
        topP: 0.9,
      },
    });

    try {
      const response = JSON.parse(result.text);
      return {
        recommendations: response.recommendations || "Please consult with a nutritionist for personalized dietary recommendations.",
        dashboardTip: response.dashboardTip || "Focus on balanced nutrition and consult a healthcare professional for specific advice."
      };
    } catch (error) {
      // Fallback response if JSON parsing fails
      return {
        recommendations: "**Key Nutrients:**\n- Focus on a balanced diet with essential vitamins and minerals\n- Stay hydrated with plenty of water\n- Include fiber-rich foods for digestive health\n\n**General Advice:**\n- Consult with a healthcare professional for personalized recommendations\n- Maintain regular meal times and portion control",
        dashboardTip: "Focus on balanced nutrition and consult a healthcare professional for personalized dietary advice."
      };
    }
  }
);