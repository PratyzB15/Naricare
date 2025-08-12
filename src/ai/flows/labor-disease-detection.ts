'use server';
/**
 * @fileOverview An AI flow for detecting diseases related to labor work.
 *
 * - detectLaborDisease - A function that handles disease detection based on symptoms.
 * - DetectLaborDiseaseInput - The input type for the detectLaborDisease function.
 * - DetectLaborDiseaseOutput - The return type for the detectLaborDisease function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectLaborDiseaseInputSchema = z.object({
  symptoms: z.array(z.string()).describe('An array of visible symptoms selected by the user.'),
});
export type DetectLaborDiseaseInput = z.infer<typeof DetectLaborDiseaseInputSchema>;

const DetectLaborDiseaseOutputSchema = z.object({
  disease: z.string().describe('The name of the predicted disease or condition.'),
  cause: z.string().describe('The likely cause related to farming or labor exposure.'),
  prevention: z.string().describe('Recommended prevention methods.'),
  medication: z.string().describe('Recommended medication or first aid.'),
});
export type DetectLaborDiseaseOutput = z.infer<typeof DetectLaborDiseaseOutputSchema>;

export async function detectLaborDisease(input: DetectLaborDiseaseInput): Promise<DetectLaborDiseaseOutput> {
  return detectLaborDiseaseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectLaborDiseasePrompt',
  input: {schema: DetectLaborDiseaseInputSchema},
  output: {schema: DetectLaborDiseaseOutputSchema},
  prompt: `You are an expert in occupational health for women in labor-intensive fields like farming and construction. Based on the user's selected symptoms, identify the most likely disease or condition from the reference table and provide the corresponding information.

**Reference Table:**
| Disease / Condition                  | Visible Symptoms                                                                        | Farming Exposure Cause              | Prevention                                                                                 | Medication / First Aid                                                                                                                                        |
| ------------------------------------ | --------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Arsenicosis (Arsenic Poisoning)**  | Dark/light “raindrop” skin patches, thick palms/soles, wart-like growths, brittle nails | Arsenic-contaminated groundwater    | Use arsenic-free drinking water, rainwater harvesting, wear gloves/boots in flooded fields | No direct cure — early detection important. Use safe water, topical keratolytic creams (salicylic acid) for thick skin, surgical removal of growths if needed |
| **Fluorosis**                        | Brown-stained teeth, bent legs, joint stiffness                                         | Fluoride-rich groundwater           | Test & filter water, avoid high-fluoride sources                                           | Dental fluorosis: no reversal, cosmetic treatment possible. Skeletal fluorosis: calcium-rich diet, physiotherapy, safe water                                  |
| **Pesticide Dermatitis**             | Redness, itching, blistering                                                            | Direct skin contact with pesticide  | Wear gloves, long clothes, wash after spraying                                             | Wash affected skin immediately, apply calamine lotion or mild steroid cream (hydrocortisone) for inflammation                                                 |
| **Photodermatitis**                  | Rash worsens in sunlight, dark patches                                                  | Pesticide/plant sap reaction in sun | Wide-brim hat, zinc oxide sunscreen, avoid midday work                                     | Oral antihistamines for itching, soothing creams like aloe vera gel                                                                                           |
| **Chemical Burns**                   | Blisters, blackened skin                                                                | Pesticide/fertilizer spillage       | Waterproof apron, careful handling                                                         | Rinse with plenty of clean water for 15–20 min, apply antiseptic, cover with sterile dressing; severe burns require hospital care                             |
| **Chronic Hand Eczema**              | Thickened, cracked skin on palms/fingers                                                | Continuous fertilizer handling      | Rubber gloves, moisturize daily                                                            | Apply petroleum jelly or coconut oil, topical steroid creams for flare-ups                                                                                    |
| **Varicose Veins**                   | Twisted, enlarged leg veins                                                             | Standing long hours                 | Rest breaks, elevate legs, compression stockings                                           | Compression therapy, leg elevation, in severe cases surgical/laser treatment                                                                                  |
| **Pterygium**                        | Fleshy eye growth                                                                       | UV, dust, wind                      | Sunglasses/UV goggles                                                                      | Lubricating eye drops, surgical removal if vision blocked                                                                                                     |
| **Chemical Conjunctivitis**          | Red, watery eyes                                                                        | Spray drift in eyes                 | Protective goggles                                                                         | Rinse eyes with clean water for 10 min, lubricating drops, antibiotic drops if infected                                                                       |
| **Fungal Skin Infections**           | Circular red rashes, peeling                                                            | Wet clothes, muddy water            | Keep skin dry, change wet clothes                                                          | Antifungal creams (clotrimazole, terbinafine), antifungal powders                                                                                             |
| **Hair Thinning / Scalp Irritation** | Hair loss patches                                                                       | Chemical absorption, dust           | Cover head, wash regularly                                                                 | Mild medicated shampoos (ketoconazole), coconut oil massage, nutrition supplements                                                                            |
| **Skin Cancer**                      | Non-healing ulcer, scaly patch                                                          | UV, arsenic                         | Full sleeves, hat, early checkups                                                          | Surgical removal, radiation/chemo (hospital-based)                                                                                                            |
| **Hyperpigmentation (Sun Damage)**   | Uneven dark patches                                                                     | Chronic UV exposure                 | Sunscreen, light clothes                                                                   | Skin-lightening creams (azelaic acid), vitamin C serum                                                                                                        |
| **Nail Fungal Infections**           | Thick, discolored nails                                                                 | Wet soil, chemicals                 | Short nails, waterproof gloves                                                             | Antifungal creams (clotrimazole), oral antifungals (terbinafine) in severe cases                                                                              |
| **Calluses & Corns**                                  | Thick, hard skin on palms, soles, knuckles | Repeated friction from tools, carrying loads | Wear padded gloves/shoes, reduce friction    | Pumice stone filing, moisturizing creams, salicylic acid plaster      |
| **Musculoskeletal Deformities** (Kyphosis, Scoliosis) | Stooped/hunched back, uneven shoulders     | Carrying heavy loads, prolonged bending      | Use correct lifting techniques, use trolleys | Physiotherapy, pain relief medicines, calcium + vitamin D supplements |
| **Tendonitis & Joint Swelling**                       | Swollen joints (knees, wrists, elbows)     | Repetitive strain, kneeling, squatting       | Take rest breaks, use knee pads              | Cold compress, NSAID pain gels (diclofenac)                           |
| **Anemia (Iron Deficiency)**                          | Pale skin, brittle nails, fatigue          | Poor diet, high physical demand              | Iron-rich diet, iron supplements             | Oral iron tablets, folic acid                                         |
| **Heat Rash (Prickly Heat)**                          | Small red itchy bumps on neck, chest       | Hot, sweaty work environment                 | Light, breathable clothing                   | Calamine lotion, keep skin dry                                        |
| **Dehydration & Heat Stroke**                         | Dry lips, dizziness, flushed face          | Working in high heat without enough water    | Drink water every 30 min, shade breaks       | Oral rehydration salts (ORS), shade, cool compress                    |
| **Chronic Back Pain**                                 | Visible stooping, stiffness                | Lifting heavy loads incorrectly              | Back support belt, correct posture           | NSAID pain gels, physiotherapy                                        |
| **Hand & Foot Cracks**                                | Deep painful cracks in skin                | Constant contact with rough surfaces, cement | Protective gloves, moisturizing              | Petroleum jelly, antiseptic cream for infected cracks                 |
| **Respiratory Skin Stains (from cement/coal)**        | Dark stains on hands, arms, face           | Cement, coal dust settling on skin           | Long-sleeve clothing, mask                   | Wash with mild soap, apply moisturizer                                |
| **Carpal Tunnel Syndrome**                            | Swelling in wrist, weak grip               | Repetitive hand movements                    | Ergonomic tools, rest breaks                 | Wrist splint, anti-inflammatory medicines                             |
| **Skin Allergies from Cement & Lime**                 | Itchy rashes, skin peeling                 | Direct contact with cement/lime              | Waterproof gloves, barrier creams            | Wash with clean water, apply hydrocortisone cream                     |
| **Eye Irritation from Dust**                          | Red, watery eyes                           | Sand, cement, smoke exposure                 | Goggles                                      | Lubricating eye drops, eyewash                                        |
| **Blisters from Friction**                            | Fluid-filled bubbles on hands/feet         | Handling rough tools without gloves          | Gloves, padded footwear                      | Do not burst, cover with sterile gauze, antiseptic ointment           |

**User's Selected Symptoms:**
{{#each symptoms}}
- {{{this}}}
{{/each}}

Based on these symptoms, identify the single most likely condition and provide the corresponding 'Disease / Condition', 'Farming Exposure Cause', 'Prevention', and 'Medication / First Aid' in the specified output format.
`,
});

const detectLaborDiseaseFlow = ai.defineFlow(
  {
    name: 'detectLaborDiseaseFlow',
    inputSchema: DetectLaborDiseaseInputSchema,
    outputSchema: DetectLaborDiseaseOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
