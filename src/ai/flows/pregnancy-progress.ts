
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
  fetalDevelopment: z.string().describe('A detailed description of the baby\'s development at the given week of pregnancy, including organ formation and size.'),
  babySizeComparison: z.string().describe('A comparison of the baby\'s size to a fruit, vegetable, or other common object.'),
});
export type PregnancyProgressOutput = z.infer<typeof PregnancyProgressOutputSchema>;

export async function getPregnancyProgress(input: PregnancyProgressInput): Promise<PregnancyProgressOutput> {
  return pregnancyProgressFlow(input);
}

const prompt = ai.definePrompt({
  name: 'pregnancyProgressPrompt',
  input: {schema: PregnancyProgressInputSchema},
  output: {schema: PregnancyProgressOutputSchema},
  prompt: `You are an expert in embryology and fetal development. Your task is to provide a detailed description of fetal development and a size comparison for a specific week of pregnancy.

You will be given the week number. Use the provided data tables to find the matching week and return:
1.  A detailed \`fetalDevelopment\` description.
2.  The \`babySizeComparison\` from the table.

**Fetal Development Data by Week:**

*   **Week 1–2**: Before conception. Pregnancy is counted from the first day of your last menstrual period. Baby: No fetus yet; the egg is maturing. Mother: Hormonal changes prepare the uterus.
*   **Week 3**: Conception. Sperm fertilizes egg -> zygote -> blastocyst. Baby: Starts traveling toward uterus; early cell division begins.
*   **Week 4**: Implantation. Baby: Implants in uterine wall; forms amniotic sac and placenta. Size: poppy seed. Organs: Neural tube (future brain & spinal cord) starts forming.
*   **Week 5**: Heart beat begins. Baby: Heart tube starts beating. Organs: Major organs begin blueprinting. Brain: First primitive brain vesicles appear.
*   **Week 6**: Features emerge. Baby: Eyes, ears, and limb buds visible. Heart rate detectable on ultrasound (~100–120 bpm).
*   **Week 7**: Rapid growth. Baby: Facial features begin; arms/legs elongate. Brain: Rapid neuron growth; first synapses form.
*   **Week 8**: All major organs present. Baby: Fingers/toes start separating; bones begin forming. Organs: All major organs have a basic structure.
*   **Week 9**: Becoming human-like. Baby: Tail disappears. Brain: Cerebellum development starts (motor control).
*   **Week 10**: Genitals form. Baby: Genitals begin differentiating. Organs: Liver produces red blood cells; kidneys start forming urine.
*   **Week 11**: Details develop. Baby: Nails, tooth buds form; skin transparent. Brain: Spinal cord fully closed; reflexes start.
*   **Week 12**: End of first trimester. Baby: All organ systems formed, now start maturing. Risk of miscarriage drops significantly.
*   **Week 13**: Baby can swallow. Baby: Vocal cords form; baby can swallow amniotic fluid.
*   **Week 14**: Facial expressions. Baby: Facial muscles allow frowning/squinting. Brain: Nerve cells forming complex networks.
*   **Week 15**: Hearing begins. Baby: Hearing begins; bones harden.
*   **Week 16**: Movement. Baby: Movements stronger. Mother: “Quickening” (first movements) may be felt.
*   **Week 17**: Fat stores form. Baby: Fat stores start forming under skin.
*   **Week 18**: Hearing is developed. Baby: Ears fully formed; can hear heartbeat and outside sounds. Brain: Myelination begins (faster nerve communication).
*   **Week 19**: Protective coating. Baby: Vernix (protective wax) covers skin.
*   **Week 20**: Halfway point. Baby: Senses developing rapidly. Ultrasound can reveal gender.
*   **Week 21**: Taste buds function. Baby: Taste buds functional.
*   **Week 22**: Eyelids and eyebrows. Baby: Eyelids & eyebrows fully formed. Brain: Rapid sensory brain growth.
*   **Week 23**: Responds to touch. Baby: Can respond to touch and sound.
*   **Week 24**: Viability. Baby: Lungs producing surfactant (needed for breathing after birth).
*   **Week 25**: Skin pinker. Baby: Skin pinker; fat deposits continue.
*   **Week 26**: Eyes open. Baby: Eyes begin opening; can see light/dark. Brain: Awareness increases; basic sleep–wake cycles begin.
*   **Week 27**: Breathing practice. Baby: Stronger breathing movements in preparation for life outside.
*   **Week 28**: Dreaming. Baby: Brain activity shows REM sleep -> dreams possible.
*   **Week 29**: Muscles strengthen. Baby: Muscles stronger; can grip. Brain: Massive increase in folds and complexity.
*   **Week 30**: Can track movement. Baby: Eyes can track movement; may respond to music.
*   **Week 31**: Nervous system control. Baby: Nervous system controlling more body functions.
*   **Week 32**: Gaining weight. Baby: Bones fully formed but soft; gaining ~200g/week.
*   **Week 33**: Immune system develops. Baby: Immune system developing.
*   **Week 34**: Head down. Baby: More coordinated movements; head may turn downward. Brain: Higher brain functions increasing.
*   **Week 35**: Getting plump. Baby: Skin smooth, fat layers well-developed.
*   **Week 36**: Organs maturing. Baby: Organs almost fully mature except lungs.
*   **Week 37**: Early term. Baby: Considered “early term” — ready for birth anytime.
*   **Week 38**: Ready for birth. Baby: Lungs fully ready; shedding vernix and lanugo.
*   **Week 39**: Fully mature. Baby: Fully mature; brain still growing rapidly.
*   **Week 40**: Due date. Baby: Most weigh 2.8–4 kg.

**Fetal Size Comparison Data by Week:**
*   **Week 1-2**: — (pre-conception)
*   **Week 3**: Poppy seed
*   **Week 4**: Sesame seed
*   **Week 5**: Lentil
*   **Week 6**: Grain of rice
*   **Week 7**: Blueberry
*   **Week 8**: Kidney bean
*   **Week 9**: Grape
*   **Week 10**: Kumquat
*   **Week 11**: Fig
*   **Week 12**: Lime
*   **Week 13**: Pea pod
*   **Week 14**: Lemon
*   **Week 15**: Apple
*   **Week 16**: Avocado
*   **Week 17**: Onion
*   **Week 18**: Sweet potato
*   **Week 19**: Mango
*   **Week 20**: Banana
*   **Week 21**: Carrot
*   **Week 22**: Spaghetti squash
*   **Week 23**: Large mango
*   **Week 24**: Corn on the cob
*   **Week 25**: Rutabaga
*   **Week 26**: Scallion bunch
*   **Week 27**: Cauliflower
*   **Week 28**: Large eggplant
*   **Week 29**: Butternut squash
*   **Week 30**: Cabbage
*   **Week 31**: Coconut
*   **Week 32**: Jicama
*   **Week 33**: Pineapple
*   **Week 34**: Cantaloupe
*   **Week 35**: Honeydew melon
*   **Week 36**: Romaine lettuce head
*   **Week 37**: Swiss chard bunch
*   **Week 38**: Leek bunch
*   **Week 39**: Mini watermelon
*   **Week 40**: Small pumpkin

Based on the data tables above, provide the development details and size comparison for the following week.

Requested week: {{{pregnancyWeeks}}}
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
