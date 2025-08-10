'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a description of fetal development based on the week of pregnancy.
 *
 * - getPregnancyProgress - A function that handles the pregnancy progress description generation.
 * - PregnancyProgressInput - The input type for the getPregnancyProgress function.
 * - PregnancyProgressOutput - The return type for the getPregnancyProgress function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
});
export type PregnancyProgressOutput = z.infer<typeof PregnancyProgressOutputSchema>;

export async function getPregnancyProgress(
  input: PregnancyProgressInput
): Promise<PregnancyProgressOutput> {
  return pregnancyProgressFlow(input);
}

const prompt = ai.definePrompt({
  name: 'pregnancyProgressPrompt',
  input: {schema: PregnancyProgressInputSchema},
  output: {schema: PregnancyProgressOutputSchema},
  prompt: `
You are an expert embryologist and gynecologist. Your task is to provide a clear, reassuring, and scientifically accurate summary of fetal development for a specific week of pregnancy, using the data provided below.

Based on the requested week, provide the following information:
1.  **Fetal Development**: Write a concise, single-paragraph summary of the most important developmental milestones for that week. Mention key organ development, new abilities, and other significant changes.
2.  **Baby Size Comparison**: Use the "Size Comparison" from the table for the requested week.

Your tone should be informative and encouraging for an expecting mother.

**Requested Week of Pregnancy:** {{{pregnancyWeeks}}}

---
**REFERENCE DATA:**

**First Trimester (Weeks 1–12)**
- Week 1–2: Pre-conception. Hormonal changes prepare the uterus lining.
- Week 3 (Poppy seed): Conception occurs. The fertilized egg (zygote) becomes a blastocyst and travels to the uterus.
- Week 4 (Sesame seed): Implantation in the uterine wall. The amniotic sac, placenta, and neural tube (future brain & spinal cord) start forming.
- Week 5 (Lentil): Heart tube starts beating. Blueprints for major organs are being drawn.
- Week 6 (Grain of rice): Eyes, ears, and limb buds appear. Heart rate is detectable.
- Week 7 (Blueberry): Facial features, arms, and legs begin to take shape. Rapid neuron growth.
- Week 8 (Kidney bean): Fingers and toes start separating. All major organs have a basic structure.
- Week 9 (Grape): Embryonic tail disappears. Cerebellum development begins.
- Week 10 (Kumquat): Genitals start differentiating. Liver produces red blood cells.
- Week 11 (Fig): Fingernails and tooth buds form. Skin is still transparent.
- Week 12 (Lime): All organ systems are formed and will now mature. Risk of miscarriage drops significantly.

**Second Trimester (Weeks 13–27)**
- Week 13 (Pea pod): Vocal cords form. Baby can swallow.
- Week 14 (Lemon): Facial muscles allow frowning and squinting.
- Week 15 (Apple): Hearing begins as bones harden.
- Week 16 (Avocado): Stronger movements; "quickening" may be felt.
- Week 17 (Onion): Fat stores begin to form under the skin.
- Week 18 (Sweet potato): Ears are fully formed; can hear external sounds. Myelination of nerves begins.
- Week 19 (Mango): Vernix caseosa (a waxy protective layer) covers the skin.
- Week 20 (Banana): Halfway point! Senses are developing rapidly.
- Week 21 (Carrot): Taste buds are functional.
- Week 22 (Spaghetti squash): Eyelids and eyebrows are fully formed.
- Week 23 (Large mango): Baby can respond to touch and sound.
- Week 24 (Corn on the cob): Lungs are producing surfactant, essential for breathing after birth.
- Week 25 (Rutabaga): Skin becomes pinker as capillaries form.
- Week 26 (Scallion bunch): Eyes begin to open. Basic sleep-wake cycles emerge.
- Week 27 (Cauliflower): Breathing-like movements become more rhythmic.

**Third Trimester (Weeks 28–40)**
- Week 28 (Large eggplant): Brain activity shows REM sleep, suggesting dreaming is possible.
- Week 29 (Butternut squash): Muscles are strengthening; baby can grip.
- Week 30 (Cabbage): Eyes can track movement.
- Week 31 (Coconut): The central nervous system is mature enough to control more body functions.
- Week 32 (Jicama): Bones are fully formed but still soft.
- Week 33 (Pineapple): The immune system is developing.
- Week 34 (Cantaloupe): Coordinated movements increase. Head may turn downward into the birth position.
- Week 35 (Honeydew melon): Skin is smooth due to fat layers.
- Week 36 (Romaine lettuce head): Organs are almost fully mature, except for the lungs which continue to develop.
- Week 37 (Swiss chard bunch): Considered "early term." Baby is ready for birth.
- Week 38 (Leek bunch): Lungs are fully ready. Shedding vernix and lanugo (fine hair).
- Week 39 (Mini watermelon): Fully mature. Brain is still growing rapidly.
- Week 40 (Small pumpkin): Due date. Ready for life outside the womb.
`,
});

const pregnancyProgressFlow = ai.defineFlow(
  {
    name: 'pregnancyProgressFlow',
    inputSchema: PregnancyProgressInputSchema,
    outputSchema: PregnancyProgressOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
