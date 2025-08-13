'use server';
/**
 * @fileOverview An AI flow for analyzing pregnancy symptoms and providing guidance.
 *
 * - pregnancySymptomChecker - A function that returns an analysis of pregnancy symptoms.
 * - PregnancySymptomCheckerInput - The input type for the pregnancySymptomChecker function.
 * - PregnancySymptomCheckerOutput - The return type for the pregnancySymptomChecker function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PregnancySymptomCheckerInputSchema = z.object({
  symptoms: z.array(z.string()).describe('An array of symptoms selected by the user.'),
});
export type PregnancySymptomCheckerInput = z.infer<typeof PregnancySymptomCheckerInputSchema>;

const PregnancySymptomCheckerOutputSchema = z.object({
  analysis: z.string().describe('A summary of the most likely cause for the combination of symptoms.'),
  severity: z.string().describe('The severity level (e.g., "Mild (Normal)", "High (Emergency)").'),
  immediateAction: z.string().describe('The recommended immediate action.'),
  preventionTips: z.string().describe('Tips to prevent the symptom.'),
  safeMedications: z.string().describe('A list of safe medications, with a strong disclaimer to consult a doctor first.'),
});
export type PregnancySymptomCheckerOutput = z.infer<typeof PregnancySymptomCheckerOutputSchema>;

export async function pregnancySymptomChecker(input: PregnancySymptomCheckerInput): Promise<PregnancySymptomCheckerOutput> {
  return pregnancySymptomCheckerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'pregnancySymptomCheckerPrompt',
  input: {schema: PregnancySymptomCheckerInputSchema},
  output: {schema: PregnancySymptomCheckerOutputSchema},
  prompt: `You are an expert AI gynecologist assistant. Your task is to analyze the reported pregnancy symptoms and provide clear, safe guidance based on the provided reference table.

**Reference Table of Pregnancy Symptoms:**
| Symptom / Discomfort                                           | Possible Cause / Abnormality                                   | Severity         | Immediate Action                                | Prevention Tips                            | Safe Medications (only after doctor approval) |
| ------------------------------------------------------------------ | ------------------------------------------------------------------ | ---------------- | --------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------- |
| **Mild nausea & vomiting (Morning sickness)**                      | Common in early pregnancy due to hormonal changes                  | Mild (Normal)    | Eat small, frequent meals; drink fluids; ginger tea | Avoid strong smells, stay hydrated, rest       | *Vitamin B6 (Pyridoxine)*, *Doxylamine*           |
| **Excessive vomiting (Hyperemesis Gravidarum)**                    | Severe vomiting, dehydration, electrolyte imbalance                | High (Emergency) | Go to hospital immediately for IV fluids            | Early treatment of nausea, high-protein snacks | *Ondansetron* (only if prescribed), IV fluids     |
| **Mild back pain**                                                 | Normal due to weight gain, posture                                 | Mild (Normal)    | Gentle exercise, warm compress                      | Maintain good posture, use maternity belt      | *Paracetamol* (not NSAIDs)                        |
| **Severe back pain with fever**                                    | Kidney infection (Pyelonephritis)                                  | High (Emergency) | Immediate hospital visit, urine culture             | Adequate hydration, treat UTIs early           | IV antibiotics as prescribed                      |
| **Mild leg swelling**                                              | Normal fluid retention                                             | Mild (Normal)    | Elevate legs, avoid standing long                   | Wear compression stockings                     | None needed                                       |
| **Sudden severe swelling (face, hands), headache, vision changes** | **Preeclampsia** (high BP)                                         | High (Emergency) | Rush to hospital, check BP                          | Regular BP check, low-salt diet                | *Labetalol*, *Nifedipine* (doctor prescribed)     |
| **Mild abdominal discomfort**                                      | Ligament stretching                                                | Mild (Normal)    | Rest, gentle movement                               | Avoid sudden movements                         | None                                              |
| **Severe abdominal pain with vaginal bleeding**                    | **Placental abruption / Miscarriage**                              | High (Emergency) | Lie on side, call ambulance                         | Avoid trauma, monitor BP                       | Hospital-based treatment only                     |
| **Sudden vaginal bleeding (any amount)**                           | **Placenta previa, abruption, miscarriage**                        | High (Emergency) | No vaginal exam, rush to hospital                   | Early scans to detect previa                   | None at home, hospital care only                  |
| **Spotting in early pregnancy**                                    | Implantation bleeding (sometimes normal) or threatened miscarriage | Medium           | Bed rest, monitor bleeding                          | Avoid strenuous activity                       | *Progesterone support* (if indicated)             |
| **Painful urination, burning**                                     | Urinary tract infection                                            | Medium           | Increase fluids, consult doctor                     | Good hygiene, hydration                        | *Cephalexin*, *Amoxicillin* (doctor prescribed)   |
| **Itching all over, especially palms & soles**                     | **Intrahepatic Cholestasis of Pregnancy (ICP)**                    | Medium to High   | Immediate liver function test                       | Avoid fatty foods                              | *Ursodeoxycholic acid*                            |
| **Shortness of breath (mild)**                                     | Normal in late pregnancy                                           | Mild             | Rest, sleep propped up                              | Gentle exercise, avoid overexertion            | None                                              |
| **Sudden severe breathlessness, chest pain**                       | **Pulmonary embolism, heart issue**                                | High (Emergency) | Rush to hospital                                    | Avoid immobility, hydrate                      | Anticoagulants at hospital                        |
| **Fever with chills**                                              | Infection (viral, bacterial)                                       | Medium           | Hydrate, paracetamol, doctor visit                  | Hygiene, vaccines (flu, Tdap)                  | *Paracetamol*, antibiotics if needed              |
| **Severe headache + blurred vision**                               | **Preeclampsia / Eclampsia**                                       | High             | Hospitalize, monitor BP                             | BP monitoring, low-salt diet                   | Antihypertensives, magnesium sulfate (hospital)   |
| **Reduced fetal movement**                                         | **Fetal distress / stillbirth risk**                               | High             | Immediate hospital for NST/USG                      | Kick count monitoring                          | Hospital intervention                             |
| **Water leakage (clear fluid)**                                    | **Preterm rupture of membranes**                                   | High             | Go to hospital, lie down                            | Avoid infection, timely check-ups              | Antibiotics & steroid injections in hospital      |

**User's Reported Symptoms:**
{{#each symptoms}}
- {{{this}}}
{{/each}}

**Your Task:**
1.  Analyze the user's reported symptoms. If multiple symptoms are selected, prioritize the one with the highest severity.
2.  Provide the corresponding "Possible Cause / Abnormality" as the \`analysis\`.
3.  Provide the "Severity" as \`severity\`.
4.  Provide the "Immediate Action" as \`immediateAction\`.
5.  Provide the "Prevention Tips" as \`preventionTips\`.
6.  Provide the "Safe Medications" as \`safeMedications\`. Add a strong disclaimer: "Note: All medications must be approved by a healthcare professional."

Based on the user's symptoms, provide a structured response.
`,
});

const pregnancySymptomCheckerFlow = ai.defineFlow(
  {
    name: 'pregnancySymptomCheckerFlow',
    inputSchema: PregnancySymptomCheckerInputSchema,
    outputSchema: PregnancySymptomCheckerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
