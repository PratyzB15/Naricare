'use server';

import { z } from 'genkit';
import { ai } from '@/ai/genkit';

// ================= INPUT SCHEMA =================

const DetectOccupationalDiseaseInputSchema = z.object({
  sector: z.enum(['desk', 'labor', 'sex_worker']),
  symptoms: z.array(z.string()),
});

export type DetectOccupationalDiseaseInput = z.infer<
  typeof DetectOccupationalDiseaseInputSchema
>;

// ================= OUTPUT TYPE =================

export type DetectOccupationalDiseaseOutput = {
  disease: string;
  cause: string;
  prevention: string;
  medication: string;
};

// ================= DESK SECTOR MAP (COMPLETE) =================

const DESK_SECTOR_MAP: Record<string, DetectOccupationalDiseaseOutput> = {
  "Neck, shoulder, upper-back pain": {
    disease: "Cervical Spondylosis / Upper Cross Syndrome",
    cause: "Poor posture, prolonged sitting, improper desk ergonomics, and muscle strain from static positions.",
    prevention: "Maintain proper posture, use ergonomic chairs, adjust monitor height, take regular breaks for stretching.",
    medication: "Over-the-counter pain relievers, physical therapy, muscle relaxants for severe cases.",
  },
  "Wrist/hand tingling or numbness": {
    disease: "Carpal Tunnel Syndrome",
    cause: "Repetitive hand movements, improper wrist positioning, prolonged typing or mouse use.",
    prevention: "Use ergonomic keyboards, wrist rests, maintain neutral wrist position, take frequent hand breaks.",
    medication: "Wrist splints, NSAIDs, corticosteroid injections, surgery in severe cases.",
  },
  "Eye strain, headaches": {
    disease: "Computer Vision Syndrome",
    cause: "Prolonged screen time, improper lighting, glare, uncorrected vision problems, and dry eyes.",
    prevention: "Follow 20-20-20 rule (every 20 minutes, look 20 feet away for 20 seconds), proper lighting, screen filters.",
    medication: "Artificial tears, prescription glasses for computer use, blue light filtering lenses.",
  },
  "Leg swelling, fatigue, varicose veins": {
    disease: "Chronic Venous Insufficiency",
    cause: "Prolonged sitting slows blood circulation in the legs.",
    prevention: "Stand and walk every 30–60 minutes, elevate legs, wear compression stockings.",
    medication: "Compression therapy for mild cases. Moderate–severe: sclerotherapy or RF ablation.",
  },
  "Fatigue, mental fog, stress": {
    disease: "Occupational Burnout / Chronic Fatigue Syndrome",
    cause: "High cognitive load, poor work-life balance, inadequate breaks, and mental exhaustion.",
    prevention: "Regular breaks, mindfulness practices, task prioritization, maintain sleep hygiene.",
    medication: "Counseling, stress management techniques, cognitive behavioral therapy.",
  },
  "Urinary urgency / incontinence": {
    disease: "Occupational Bladder Dysfunction",
    cause: "Delaying bathroom breaks due to work demands, excessive caffeine intake, and pelvic floor weakness.",
    prevention: "Schedule regular bathroom breaks, reduce caffeine, practice pelvic floor exercises.",
    medication: "Bladder training, anticholinergic medications, pelvic floor physical therapy.",
  },
  "Musculoskeletal pain (back, knees)": {
    disease: "Repetitive Strain Injury / Degenerative Joint Disease",
    cause: "Poor ergonomics, inadequate seating, lack of movement, and cumulative trauma from static postures.",
    prevention: "Use ergonomic furniture, alternate between sitting and standing, regular stretching exercises.",
    medication: "Physical therapy, anti-inflammatory medications, joint supplements for long-term health.",
  },
  "Cold-induced stiffness, discomfort": {
    disease: "Raynaud's Phenomenon / Cold Aggravated Arthritis",
    cause: "Poor office temperature control, cold environments exacerbating circulatory and joint issues.",
    prevention: "Maintain comfortable office temperature, use space heaters, wear warm clothing layers.",
    medication: "Vasodilators for Raynaud's, joint protectants, thermal therapy.",
  },
  "Overall sedentary-related health risks": {
    disease: "Metabolic Syndrome / Sedentary Lifestyle Syndrome",
    cause: "Lack of physical activity, poor diet, and prolonged sitting leading to systemic health decline.",
    prevention: "Incorporate regular exercise, take walking meetings, use standing desks, maintain balanced nutrition.",
    medication: "Lifestyle modification programs, regular health screenings, metabolic monitoring.",
  },
};

// ================= LABOR SECTOR MAP (COMPLETE) =================

const LABOR_SECTOR_MAP: Record<string, DetectOccupationalDiseaseOutput> = {
  "Dark/light 'raindrop' skin patches, thick palms/soles, wart-like growths, brittle nails": {
    disease: "Arsenicosis / Heavy Metal Poisoning",
    cause: "Exposure to arsenic or heavy metals through contaminated water, soil, or industrial materials.",
    prevention: "Use protective gloves and clothing, proper washing facilities, regular health monitoring.",
    medication: "Chelation therapy, dermatological treatments, nutritional supplements.",
  },
  "Brown-stained teeth, bent legs, joint stiffness": {
    disease: "Skeletal Fluorosis / Dental Fluorosis",
    cause: "Chronic exposure to high fluoride levels in water, dust, or industrial processes.",
    prevention: "Use filtered water, respiratory protection in dusty environments, regular dental checkups.",
    medication: "Nutritional support, pain management, orthopedic interventions for advanced cases.",
  },
  "Redness, itching, blistering on skin": {
    disease: "Contact Dermatitis / Occupational Eczema",
    cause: "Exposure to irritants like chemicals, solvents, or allergens in the workplace.",
    prevention: "Use protective clothing, barrier creams, proper hygiene practices, allergen identification.",
    medication: "Topical corticosteroids, antihistamines, immunomodulators for severe cases.",
  },
  "Rash that worsens in sunlight, dark patches": {
    disease: "Photoallergic Dermatitis / Phytophotodermatitis",
    cause: "Interaction between sunlight and certain chemicals or plant substances on the skin.",
    prevention: "Sun protection, protective clothing, washing after exposure to sensitizing substances.",
    medication: "Topical steroids, sunscreens with high SPF, antioxidant supplements.",
  },
  "Blisters, blackened skin from chemical spillage": {
    disease: "Chemical Burns",
    cause: "Direct contact with corrosive chemicals, acids, or alkalis without proper protection.",
    prevention: "Proper chemical handling training, use of PPE, emergency wash stations availability.",
    medication: "Emergency decontamination, wound care, pain management, possible skin grafting.",
  },
  "Thickened, cracked skin on palms/fingers": {
    disease: "Hyperkeratosis / Occupational Callosities",
    cause: "Repeated friction, pressure, or exposure to irritants without adequate hand protection.",
    prevention: "Use padded gloves, moisturize regularly, reduce direct contact with abrasive materials.",
    medication: "Keratolytic creams, urea-based moisturizers, protective dressings.",
  },
  "Twisted, enlarged leg veins": {
    disease: "Occupational Varicose Veins",
    cause: "Standing for long hours causes blood pooling in leg veins.",
    prevention: "Take sitting breaks, elevate legs after work, wear compression stockings.",
    medication: "Compression therapy and leg elevation. Severe cases need medical procedures.",
  },
  "Fleshy growth on the eye": {
    disease: "Pterygium / Pinguecula",
    cause: "Exposure to UV radiation, dust, wind, and dry environments without eye protection.",
    prevention: "Wear UV-protective sunglasses, use artificial tears, avoid dusty work areas.",
    medication: "Lubricating eye drops, anti-inflammatory medications, surgical removal if vision affected.",
  },
  "Red, watery eyes after chemical exposure": {
    disease: "Chemical Conjunctivitis",
    cause: "Exposure to airborne chemicals, fumes, or direct chemical splash to the eyes.",
    prevention: "Wear safety goggles, ensure proper ventilation, emergency eyewash stations.",
    medication: "Eye irrigation, antibiotic eye drops, anti-inflammatory medications.",
  },
  "Circular red rashes, peeling skin": {
    disease: "Tinea Corporis (Ringworm) / Fungal Infections",
    cause: "Moist work environments, shared equipment, poor hygiene, and warm conditions promoting fungal growth.",
    prevention: "Maintain personal hygiene, wear breathable clothing, disinfect shared equipment.",
    medication: "Topical antifungal creams, oral antifungals for widespread infection.",
  },
  "Hair loss patches, scalp irritation": {
    disease: "Alopecia Areata / Occupational Alopecia",
    cause: "Chemical exposure, traction from protective headgear, stress, or autoimmune factors.",
    prevention: "Proper helmet fitting, scalp protection from chemicals, stress management.",
    medication: "Topical minoxidil, corticosteroid injections, immunomodulatory treatments.",
  },
  "A non-healing ulcer or scaly patch on skin": {
    disease: "Occupational Skin Cancer / Chronic Dermatitis",
    cause: "Cumulative exposure to carcinogens, UV radiation, or chronic irritation leading to malignant changes.",
    prevention: "Regular skin checks, sun protection, avoid known carcinogens, use protective barriers.",
    medication: "Biopsy for diagnosis, surgical excision, topical chemotherapy, radiation therapy.",
  },
  "Uneven dark patches on skin from sun": {
    disease: "Actinic Keratosis / Solar Lentigines",
    cause: "Chronic sun exposure without protection, leading to precancerous or hyperpigmented lesions.",
    prevention: "Daily sunscreen use, protective clothing, seek shade during peak sun hours.",
    medication: "Cryotherapy, topical fluorouracil, chemical peels, laser treatment.",
  },
  "Thick, discolored nails": {
    disease: "Onychomycosis / Occupational Nail Disorders",
    cause: "Fungal infection from moist environments, trauma to nails, or chemical exposure.",
    prevention: "Keep nails dry and clean, wear protective gloves, avoid nail trauma.",
    medication: "Oral antifungal medications, topical antifungal solutions, laser treatment.",
  },
  "Thick, hard skin on palms, soles, or knuckles": {
    disease: "Occupational Hyperkeratosis / Calluses",
    cause: "Chronic friction, pressure, or manual labor without adequate hand/foot protection.",
    prevention: "Use properly fitted gloves and footwear, padding for high-pressure areas.",
    medication: "Salicylic acid treatments, regular filing, orthotic devices for pressure redistribution.",
  },
  "Stooped/hunched back, uneven shoulders": {
    disease: "Occupational Postural Deformity / Kyphosis",
    cause: "Repetitive bending, lifting with poor technique, or asymmetric work postures over time.",
    prevention: "Proper lifting techniques, ergonomic adjustments, core strengthening exercises.",
    medication: "Physical therapy, postural correction exercises, pain management strategies.",
  },
  "Swollen joints (knees, wrists, elbows)": {
    disease: "Occupational Arthritis / Bursitis",
    cause: "Repetitive joint use, trauma, vibration exposure, or inflammatory responses to work activities.",
    prevention: "Job rotation, ergonomic tools, vibration-dampening equipment, joint protection strategies.",
    medication: "Anti-inflammatory drugs, joint injections, physical therapy, assistive devices.",
  },
  "Pale skin, brittle nails, fatigue": {
    disease: "Occupational Anemia / Nutritional Deficiencies",
    cause: "Poor nutrition, exposure to toxins affecting blood production, or chronic blood loss from injuries.",
    prevention: "Balanced diet, regular health checkups, iron-rich foods, toxin avoidance.",
    medication: "Iron supplements, vitamin B12 injections, dietary modifications, treat underlying causes.",
  },
};

// ================= SEX WORKER SECTOR MAP (UNCHANGED) =================

const SEX_WORKER_SECTOR_MAP: Record<string, DetectOccupationalDiseaseOutput> = {
  "Pain during intercourse": {
    disease: "Dyspareunia",
    cause: "Genital infections, vaginal dryness, or tissue trauma.",
    prevention: "Use water-based lubricants, practice gentle intercourse, regular gynecological checkups.",
    medication: "Topical estrogen for dryness, infection-specific treatment after examination.",
  },
  "Unusual vaginal discharge (yellow/green, foul smell)": {
    disease: "Sexually Transmitted Infection (Gonorrhea / Trichomoniasis / BV)",
    cause: "Bacterial or protozoal infection transmitted through unprotected sex.",
    prevention: "Consistent condom use, routine STI screening.",
    medication: "Doctor-prescribed antibiotics such as Ceftriaxone or Metronidazole.",
  },
  "Burning sensation while urinating": {
    disease: "Urinary Tract Infection (UTI)",
    cause: "Bacterial infection entering urinary tract after sexual activity.",
    prevention: "Drink plenty of water, urinate after intercourse, maintain hygiene.",
    medication: "Antibiotics such as Nitrofurantoin under medical supervision.",
  },
  "Genital ulcers or sores": {
    disease: "Genital Herpes or Syphilis",
    cause: "Viral (HSV) or bacterial (Syphilis) sexually transmitted infection.",
    prevention: "Use condoms, avoid sexual contact during outbreaks.",
    medication: "Acyclovir for herpes, Penicillin injections for syphilis.",
  },
  "Itching around genitals": {
    disease: "Vaginal Candidiasis (Yeast Infection)",
    cause: "Fungal overgrowth due to moisture and frequent intercourse.",
    prevention: "Keep area dry, wear breathable underwear, avoid harsh soaps.",
    medication: "Antifungal creams like Clotrimazole or oral Fluconazole.",
  },
  "Lower abdominal pain": {
    disease: "Pelvic Inflammatory Disease (PID)",
    cause: "Untreated STIs spreading to uterus and fallopian tubes.",
    prevention: "Regular STI screening and early treatment.",
    medication: "Immediate medical care with IV or oral antibiotics.",
  },
  "Excessive bleeding (non-menstrual)": {
    disease: "Cervical Infection or Trauma",
    cause: "Cervical inflammation, injury, or malignancy.",
    prevention: "Routine gynecological exams and safe sexual practices.",
    medication: "Urgent hospital evaluation for diagnosis-based treatment.",
  },
  "Skin rashes or lesions on body": {
    disease: "Scabies or Allergic Dermatitis",
    cause: "Skin-to-skin contact infections or allergic reactions.",
    prevention: "Maintain hygiene, wash bedding regularly, avoid infected contact.",
    medication: "Permethrin lotion or prescribed anti-inflammatory creams.",
  },
  "Weight loss, fever, night sweats": {
    disease: "HIV/AIDS or Tuberculosis",
    cause: "Chronic viral or bacterial infection due to unprotected exposure.",
    prevention: "Condom use, PrEP, routine HIV and TB screening.",
    medication: "Antiretroviral therapy (ART) or TB treatment regimen under doctor supervision.",
  },
  "Severe stress, anxiety, depression": {
    disease: "Work-related PTSD and Depression",
    cause: "Chronic mental strain, stigma, and unsafe working conditions.",
    prevention: "Mental health counseling, support groups, stress management practices.",
    medication: "Psychotherapy and antidepressant medication if required.",
  },
  "Drug/alcohol dependency": {
    disease: "Substance Use Disorder",
    cause: "Psychological coping mechanism for chronic stress and trauma.",
    prevention: "Access to rehabilitation support and counseling services.",
    medication: "Medically supervised detox and addiction treatment programs.",
  },
};

// ================= AI EXPLANATION ENHANCER =================

async function enhanceWithAI(
  base: DetectOccupationalDiseaseOutput
): Promise<DetectOccupationalDiseaseOutput> {
  const prompt = `
Rewrite this medical advice in a calm, supportive tone for a women's healthcare app:

Disease: ${base.disease}
Cause: ${base.cause}
Prevention: ${base.prevention}
Medication: ${base.medication}
`;

  const result = await ai.generate({
    model: 'googleai/gemini-2.5-flash',
    prompt,
  });

  return base; // AI used only for future UI tone upgrades
}

// ================= MAIN ENGINE =================

export async function detectOccupationalDisease(
  input: DetectOccupationalDiseaseInput
): Promise<DetectOccupationalDiseaseOutput> {
  const symptom = input.symptoms[0];
  let match: DetectOccupationalDiseaseOutput | undefined;

  if (input.sector === 'desk') {
    match = DESK_SECTOR_MAP[symptom];
  }

  if (input.sector === 'labor') {
    match = LABOR_SECTOR_MAP[symptom];
  }

  if (input.sector === 'sex_worker') {
    match = SEX_WORKER_SECTOR_MAP[symptom];
  }

  if (!match) {
    return {
      disease: "Unknown condition",
      cause: `Could not determine cause for symptoms in ${input.sector} sector.`,
      prevention: "Consult a healthcare provider for occupational health advice.",
      medication: "Please see a doctor for proper diagnosis and treatment.",
    };
  }

  return await enhanceWithAI(match);
}