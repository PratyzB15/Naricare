// src/ai/flows/pregnancy-progress.ts
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PregnancyProgressInputSchema = z.object({
  pregnancyWeeks: z.number().describe('The number of weeks of pregnancy.'),
});
export type PregnancyProgressInput = z.infer<typeof PregnancyProgressInputSchema>;

const PregnancyProgressOutputSchema = z.object({
  fetalDevelopment: z
    .string()
    .describe(
      "A detailed, one-paragraph description of the baby's key development milestones for the given week of pregnancy. This should include major organ formation, new abilities, and other significant changes."
    ),
  babySizeComparison: z
    .string()
    .describe(
      "A simple and relatable comparison of the baby's size to a common fruit, vegetable, or seed (e.g., 'a poppy seed', 'a lime', 'an avocado')."
    ),
  motherSymptoms: z.string().describe("A detailed description of common symptoms the mother might be experiencing during this week, such as nausea, fatigue, or body changes."),
});
export type PregnancyProgressOutput = z.infer<typeof PregnancyProgressOutputSchema>;

export async function getPregnancyProgress(
  input: PregnancyProgressInput
): Promise<PregnancyProgressOutput> {
  try {
    return await pregnancyProgressFlow(input);
  } catch (error) {
    console.error('getPregnancyProgress error:', error);
    // Use fallback data based on week
    return getFallbackPregnancyData(input.pregnancyWeeks);
  }
}

function getFallbackPregnancyData(week: number): PregnancyProgressOutput {
  // Validate week range first
  if (week < 1 || week > 42) {
    throw new Error('Pregnancy week must be between 1 and 42.');
  }

  let fetalDevelopment, babySizeComparison, motherSymptoms;

  if (week <= 4) {
    fetalDevelopment = "This week, the embryo is forming the neural tube, which will become the brain and spinal cord. The heart begins to beat and circulate blood.";
    babySizeComparison = "a poppy seed";
    motherSymptoms = "Many women experience mild cramping, spotting, and increased fatigue as the body adjusts to hormonal changes.";
  } else if (week <= 8) {
    fetalDevelopment = "Major organs and limbs are forming rapidly. The heart has divided into chambers and beats steadily. Facial features begin to develop.";
    babySizeComparison = "a raspberry";
    motherSymptoms = "Morning sickness, breast tenderness, and frequent urination are common. Mood swings may occur due to hormonal shifts.";
  } else if (week <= 12) {
    fetalDevelopment = "The baby's bones are hardening, and fingers and toes are fully formed. The nervous system continues to develop.";
    babySizeComparison = "a plum";
    motherSymptoms = "Nausea may improve. Many women feel more energetic. Some may notice slight weight gain.";
  } else if (week <= 20) {
    fetalDevelopment = "The baby can now hear sounds and may react to loud noises. The skin is thin and translucent, covered in fine hair.";
    babySizeComparison = "a banana";
    motherSymptoms = "Backaches, bloating, and swelling in the hands and feet may begin. Some women feel the first fetal movements (quickening).";
  } else if (week <= 28) {
    fetalDevelopment = "The baby is gaining weight and fat. The eyes can open and close, and brain development is accelerating.";
    babySizeComparison = "a large eggplant";
    motherSymptoms = "Heartburn, shortness of breath, and leg cramps become more common. Braxton Hicks contractions may start.";
  } else if (week <= 32) {
    fetalDevelopment = "The baby is gaining fat and filling out. The lungs are developing surfactant to help with breathing after birth.";
    babySizeComparison = "a pineapple";
    motherSymptoms = "Swelling in the feet and hands may increase. Sleep becomes more difficult due to size and discomfort.";
  } else if (week <= 36) {
    fetalDevelopment = "The baby's head is likely engaged in the pelvis. The lungs are nearly mature and ready for breathing air.";
    babySizeComparison = "a small watermelon";
    motherSymptoms = "Pelvic pressure increases. Frequent urination returns. Some women experience nesting urges.";
  } else {
    fetalDevelopment = "The baby is full-term and ready for birth. The lungs are mature, and all systems are prepared for life outside the womb.";
    babySizeComparison = "a large watermelon";
    motherSymptoms = "Braxton Hicks contractions, pelvic pressure, and possible mucus plug loss. Labor can begin at any time now.";
  }

  return {
    fetalDevelopment,
    babySizeComparison,
    motherSymptoms
  };
}

const pregnancyProgressFlow = ai.defineFlow(
  {
    name: 'pregnancyProgressFlow',
    inputSchema: PregnancyProgressInputSchema,
    outputSchema: PregnancyProgressOutputSchema,
  },
  async (input) => {
    const week = input.pregnancyWeeks;

    // Validate week range
    if (week < 1 || week > 42) {
      throw new Error('Pregnancy week must be between 1 and 42.');
    }

    const prompt = `You are an expert embryologist and gynecologist. Your task is to provide a clear, reassuring, and scientifically accurate summary of fetal development and maternal symptoms for week ${week} of pregnancy.

**Your Task:**
Provide the following information for week ${week}:

1. **fetalDevelopment**: A detailed, one-paragraph description of the baby's most important developmental milestones this week. Include key organ development, new abilities, and structural changes.

2. **babySizeComparison**: A simple, relatable comparison of the baby's size to a common fruit, vegetable, or seed (e.g., 'a poppy seed', 'a lime', 'an avocado').

3. **motherSymptoms**: A detailed paragraph describing common physical and emotional symptoms a mother might experience this week (e.g., morning sickness, fatigue, backaches, mood swings).

**Tone:** Informative, warm, and encouraging — suitable for an expecting mother.

**Output Format:**
Return ONLY a valid JSON object with these keys:
{
  "fetalDevelopment": "string",
  "babySizeComparison": "string",
  "motherSymptoms": "string"
}

⚠️ DO NOT include any markdown, code blocks, explanations, or extra text.
Return only the raw JSON object.
`;

    try {
      const result = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        prompt,
        output: {
          schema: PregnancyProgressOutputSchema,
          format: 'json',
        },
        config: {
          temperature: 0.3,
          topK: 30,
          topP: 0.8,
        },
      });

      if (!result.output) {
        throw new Error('AI returned no valid output');
      }

      return result.output;
    } catch (error) {
      console.error('AI generation failed:', error);
      // Return fallback data instead of throwing
      return getFallbackPregnancyData(week);
    }
  }
);