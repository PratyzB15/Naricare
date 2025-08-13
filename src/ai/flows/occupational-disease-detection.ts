'use server';
/**
 * @fileOverview An AI flow for detecting diseases related to different work sectors.
 *
 * - detectOccupationalDisease - A function that handles disease detection based on symptoms and sector.
 * - DetectOccupationalDiseaseInput - The input type for the detectOccupationalDisease function.
 * - DetectOccupationalDiseaseOutput - The return type for the detectOccupationalDisease function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectOccupationalDiseaseInputSchema = z.object({
  sector: z.enum(['desk', 'labor', 'sex_worker']).describe('The user\'s work sector.'),
  symptoms: z.array(z.string()).describe('An array of visible symptoms selected by the user.'),
});
export type DetectOccupationalDiseaseInput = z.infer<typeof DetectOccupationalDiseaseInputSchema>;

const DetectOccupationalDiseaseOutputSchema = z.object({
  disease: z.string().describe('The name of the predicted disease or condition.'),
  cause: z.string().describe('The likely cause related to the work sector exposure.'),
  prevention: z.string().describe('Recommended prevention methods.'),
  medication: z.string().describe('Recommended medication, first aid, or treatment guidelines.'),
});
export type DetectOccupationalDiseaseOutput = z.infer<typeof DetectOccupationalDiseaseOutputSchema>;

export async function detectOccupationalDisease(input: DetectOccupationalDiseaseInput): Promise<DetectOccupationalDiseaseOutput> {
  return detectOccupationalDiseaseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectOccupationalDiseasePrompt',
  input: {schema: DetectOccupationalDiseaseInputSchema},
  output: {schema: DetectOccupationalDiseaseOutputSchema},
  prompt: `You are an expert in occupational health for women. Based on the user's selected work sector and symptoms, identify the most likely disease or condition from the appropriate reference table and provide the corresponding information.

**User's Work Sector:** {{{sector}}}
**User's Selected Symptoms:**
{{#each symptoms}}
- {{{this}}}
{{/each}}

**Reference Tables by Sector:**

---
**IF SECTOR IS 'desk' USE THIS TABLE:**
| Symptom / Discomfort | Possible Condition / Cause | Prevention & Lifestyle Adjustments | Treatment / Medication Guidelines (Consult Doctor) |
|---|---|---|---|
| Neck, shoulder, upper-back pain | Poor posture or ergonomics; musculoskeletal strain | - Use chair with lumbar support; keep monitor at eye level<br>- Take micro-breaks; stretch, walk around every 30–60 min<br>- Stay hydrated; supports joints and alertness | - Over-the-counter analgesics (e.g., paracetamol or NSAIDs)<br>- Physical therapy, ergonomic consultation |
| Wrist/hand tingling or numbness | Repetitive strain injury (RSI) or Carpal Tunnel Syndrome (CTS) | - Keep wrists straight; use ergonomic keyboard/mouse<br>- Take frequent breaks; perform hand and wrist stretches | - Early intervention important: occupational therapy, ergonomic adjustments<br>- RICE (rest, ice, compression) for acute flare-ups<br>- Severe cases may require splints, corticosteroid injections, or surgery |
| Eye strain, headaches | Digital eye strain; poor lighting or screen setup | - Use 20-20-20 rule: every 20 min look 20 ft away for 20 s<br>- Position monitor at arm’s length, reduce glare | - Artificial tears for dryness<br>- Evaluate for possible vision correction (e.g., computer glasses) |
| Leg swelling, fatigue, varicose veins | Poor circulation; venous insufficiency | - Stand and move every 30–60 min; avoid crossing legs<br>- Use compression stockings, raise legs during breaks | - Mild cases: conservative measures above<br>- Moderate to severe: sclerotherapy or radiofrequency (RF) ablation |
| Fatigue, mental fog, stress | Sedentarism; poor nutrition; mental overload | - Regular movement; healthy meal/snack breaks; hydration<br>- Set clear work–life boundaries; practice stress-management | - For stress/anxiety: counseling, therapy<br>- For fatigue from anemia or deficiency: medical evaluation, supplements (e.g., iron, vitamin D) |
| Urinary urgency / incontinence | Prolonged sitting linked to increased risk | - Limit sitting time; stand and move more frequently | - Pelvic floor exercises (Kegels)<br>- Medical evaluation if persistent |
| Musculoskeletal pain (back, knees) | Osteoarthritis flare-ups from poor posture | - Use ergonomic chair; adjust seat height; use footrest<br>- Take stretch breaks; avoid static posture | - Pain relief: NSAIDs or paracetamol (short-term)<br>- Physical therapy, posture training |
| Cold-induced stiffness, discomfort | Temperature discomfort in office | - Dress in adjustable layers; use desk heaters | - Manage discomfort via warm compresses, mild movement |
| Overall sedentary-related health risks | Cardiovascular disease, diabetes, obesity risk | - Break up sitting with short walks; regular exercise | - Lifestyle-based prevention; overall health screening |

---
**IF SECTOR IS 'labor' USE THIS TABLE:**
| Disease / Condition | Visible Symptoms | Farming Exposure Cause | Prevention | Medication / First Aid |
|---|---|---|---|---|
| Arsenicosis (Arsenic Poisoning) | Dark/light “raindrop” skin patches, thick palms/soles | Arsenic-contaminated groundwater | Use arsenic-free drinking water, wear gloves | No direct cure — early detection. Use safe water, topical keratolytic creams. |
| Fluorosis | Brown-stained teeth, bent legs, joint stiffness | Fluoride-rich groundwater | Test & filter water | Dental: cosmetic treatment. Skeletal: calcium-rich diet, physiotherapy. |
| Pesticide Dermatitis | Redness, itching, blistering | Direct skin contact with pesticide | Wear gloves, long clothes, wash after spraying | Wash affected skin, apply calamine lotion or mild steroid cream. |
| Photodermatitis | Rash worsens in sunlight, dark patches | Pesticide/plant sap reaction in sun | Wide-brim hat, zinc oxide sunscreen | Oral antihistamines, aloe vera gel. |
| Chemical Burns | Blisters, blackened skin | Pesticide/fertilizer spillage | Waterproof apron, careful handling | Rinse with clean water for 15–20 min, apply antiseptic. |
| Chronic Hand Eczema | Thickened, cracked skin on palms/fingers | Continuous fertilizer handling | Rubber gloves, moisturize daily | Petroleum jelly, topical steroid creams for flare-ups. |
| Varicose Veins | Twisted, enlarged leg veins | Standing long hours | Rest breaks, elevate legs, compression stockings | Compression therapy, leg elevation. |
| Pterygium | Fleshy eye growth | UV, dust, wind | Sunglasses/UV goggles | Lubricating eye drops, surgical removal if vision blocked. |
| Chemical Conjunctivitis | Red, watery eyes | Spray drift in eyes | Protective goggles | Rinse eyes with clean water, lubricating drops. |
| Fungal Skin Infections | Circular red rashes, peeling | Wet clothes, muddy water | Keep skin dry, change wet clothes | Antifungal creams (clotrimazole, terbinafine). |
| Hair Thinning / Scalp Irritation | Hair loss patches | Chemical absorption, dust | Cover head, wash regularly | Mild medicated shampoos (ketoconazole). |
| Skin Cancer | Non-healing ulcer, scaly patch | UV, arsenic | Full sleeves, hat, early checkups | Surgical removal, radiation/chemo (hospital-based). |
| Hyperpigmentation (Sun Damage) | Uneven dark patches | Chronic UV exposure | Sunscreen, light clothes | Skin-lightening creams (azelaic acid). |
| Nail Fungal Infections | Thick, discolored nails | Wet soil, chemicals | Short nails, waterproof gloves | Antifungal creams (clotrimazole). |
| Calluses & Corns | Thick, hard skin on palms, soles | Repeated friction from tools | Wear padded gloves/shoes | Pumice stone filing, moisturizing creams. |
| Musculoskeletal Deformities | Stooped/hunched back, uneven shoulders | Carrying heavy loads, prolonged bending | Use correct lifting techniques, use trolleys | Physiotherapy, pain relief medicines, calcium + vitamin D. |
| Tendonitis & Joint Swelling | Swollen joints (knees, wrists, elbows) | Repetitive strain, kneeling | Take rest breaks, use knee pads | Cold compress, NSAID pain gels (diclofenac). |
| Anemia (Iron Deficiency) | Pale skin, brittle nails, fatigue | Poor diet, high physical demand | Iron-rich diet, iron supplements | Oral iron tablets, folic acid. |

---
**IF SECTOR IS 'sex_worker' USE THIS TABLE:**
| Symptom / Issue | Possible Condition / Cause | Prevention Strategies | Immediate Action / Treatment | Medication (Doctor-supervised) |
|---|---|---|---|---|
| Pain during intercourse | Genital infections, inadequate lubrication, trauma | Use water-based lubricants, practice safe sex | Stop activity, assess for injury, consult healthcare provider | Topical estrogen (for dryness), lubricants |
| Unusual vaginal discharge (yellow/green, foul smell) | STIs like Gonorrhea, Trichomoniasis, Bacterial Vaginosis | Consistent condom use, regular STI screening | Visit sexual health clinic for swab tests | Antibiotics (Ceftriaxone, Metronidazole) |
| Burning sensation while urinating | Urinary Tract Infection (UTI) or STI | Maintain hygiene, urinate after intercourse, hydration | Seek medical attention | Nitrofurantoin for UTI, STI treatment |
| Genital ulcers or sores | Herpes Simplex Virus (HSV), Syphilis | Use condoms, avoid sex during outbreak | Get tested immediately | Antivirals (Acyclovir), Penicillin |
| Itching around genitals | Yeast infection, STIs, poor hygiene | Proper cleaning, breathable underwear | Antifungal creams or oral meds | Clotrimazole cream, Fluconazole tablet |
| Lower abdominal pain | Pelvic Inflammatory Disease (PID) | Condom use, timely STI treatment | Emergency visit if severe | IV antibiotics (Ceftriaxone, Doxycycline) |
| Excessive bleeding (non-menstrual) | Trauma, cervical infection, cancer | Regular gynecological check-ups | Hospital care if bleeding persists | Treatment based on diagnosis |
| Skin rashes or lesions on body | Scabies, allergic reactions, STIs | Clean bedding, personal hygiene | Use prescribed creams | Permethrin lotion |
| Weight loss, fever, night sweats | HIV/AIDS or TB | Condom use, PrEP, regular HIV testing | HIV test immediately | Antiretroviral therapy (ART) |
| Severe stress, anxiety, depression | Work-related mental strain, stigma, PTSD | Counseling, support groups, mindfulness | Consult mental health professional | Antidepressants, CBT therapy |
| Drug/alcohol dependency | Coping mechanism for stress or coercion | Seek rehabilitation support | Detox program, counseling | Medications for withdrawal |

---
**Your Task:**
1. Based on the user's sector, select the correct table.
2. Based on their symptoms, identify the single most likely condition.
3. Provide the corresponding 'Possible Condition / Cause' as 'cause', 'Prevention' as 'prevention', and 'Medication/Treatment' as 'medication'.
4. Rename the 'Symptom / Discomfort' or 'Disease / Condition' or 'Symptom / Issue' column to 'disease' in the output.
`
});

const detectOccupationalDiseaseFlow = ai.defineFlow(
  {
    name: 'detectOccupationalDiseaseFlow',
    inputSchema: DetectOccupationalDiseaseInputSchema,
    outputSchema: DetectOccupationalDiseaseOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
