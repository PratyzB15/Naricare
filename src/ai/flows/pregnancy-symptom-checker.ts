// src/ai/flows/pregnancy-symptom-checker.ts
'use server';

/**
 * @fileOverview An AI flow for analyzing pregnancy symptoms and providing guidance.
 *
 * - pregnancySymptomChecker - A function that returns an analysis of pregnancy symptoms.
 * - PregnancySymptomCheckerInput - The input type for the pregnancySymptomChecker function.
 * - PregnancySymptomCheckerOutput - The return type for the pregnancySymptomChecker function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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

export async function pregnancySymptomChecker(
  input: PregnancySymptomCheckerInput
): Promise<PregnancySymptomCheckerOutput> {
  return pregnancySymptomCheckerFlow(input);
}

/**
 * The main function for analyzing pregnancy symptoms using Gemini 1.5 Flash.
 */
const pregnancySymptomCheckerFlow = ai.defineFlow(
  {
    name: 'pregnancySymptomCheckerFlow',
    inputSchema: PregnancySymptomCheckerInputSchema,
    outputSchema: PregnancySymptomCheckerOutputSchema,
  },
  async (input) => {
    const symptomList = input.symptoms.map((symptom) => `- ${symptom}`).join('\n');

    const prompt = `
You are an expert AI gynecologist assistant. Your task is to analyze the reported pregnancy symptoms and provide clear, safe guidance.

**Reference Table of Pregnancy Symptoms:**
| Symptom / Discomfort                                               | Possible Cause / Abnormality                                       | Severity         | Immediate Action                                    | Prevention Tips                                | Safe Medications (only after doctor approval) |
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
${symptomList}

**CRITICAL INSTRUCTIONS:**
1. CAREFULLY analyze each reported symptom and MATCH it to the closest corresponding entry in the reference table.
2. If multiple symptoms are reported, identify the ONE with the HIGHEST severity level (Emergency > High > Medium > Mild).
3. For the highest severity symptom, provide EXACTLY the information from the corresponding row in the table.
4. If symptoms don't match the table exactly, find the CLOSEST match based on medical knowledge.
5. DO NOT provide generic responses - be specific to the reported symptoms.

**Your Task:**
For the highest priority symptom, provide:
1. The corresponding "Possible Cause / Abnormality" as the \`analysis\`.
2. The "Severity" as \`severity\`.
3. The "Immediate Action" as \`immediateAction\`.
4. The "Prevention Tips" as \`preventionTips\`.
5. The "Safe Medications" as \`safeMedications\`. Always include: "Note: All medications must be approved by a healthcare professional."

**Output Format:**
Output ONLY a valid JSON object matching this exact schema:
{
  "analysis": "specific cause from the table",
  "severity": "exact severity level from the table",
  "immediateAction": "specific immediate action from the table",
  "preventionTips": "specific prevention tips from the table",
  "safeMedications": "specific medications from table with disclaimer"
}

**Example for mild nausea:**
{
  "analysis": "Common in early pregnancy due to hormonal changes",
  "severity": "Mild (Normal)",
  "immediateAction": "Eat small, frequent meals; drink fluids; ginger tea",
  "preventionTips": "Avoid strong smells, stay hydrated, rest",
  "safeMedications": "Vitamin B6 (Pyridoxine), Doxylamine. Note: All medications must be approved by a healthcare professional."
}
`;

    const result = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt,
      output: {
        schema: PregnancySymptomCheckerOutputSchema,
        format: 'json',
      },
      config: {
        temperature: 0.1,
        topK: 40,
        topP: 0.8,
      },
    });

    // Parse the JSON response from the AI
    try {
      const response = result.output;

      if (!response) {
        throw new Error('AI returned no valid output');
      }

      return {
        analysis: response.analysis || "Unable to analyze symptoms. Please consult a healthcare professional.",
        severity: response.severity || "Unknown",
        immediateAction: response.immediateAction || "Contact your healthcare provider for guidance.",
        preventionTips: response.preventionTips || "Regular prenatal care is essential for monitoring symptoms.",
        safeMedications: response.safeMedications ? 
          response.safeMedications.includes("Note:") ? 
            response.safeMedications : 
            response.safeMedications + " Note: All medications must be approved by a healthcare professional."
          : "Note: All medications must be approved by a healthcare professional."
      };
    } catch (error) {
      // Fallback in case JSON parsing fails
      return {
        analysis: "Unable to analyze symptoms. Please consult a healthcare professional immediately.",
        severity: "High (Emergency)",
        immediateAction: "Contact your healthcare provider or go to the nearest emergency room.",
        preventionTips: "Regular prenatal check-ups and monitoring are essential.",
        safeMedications: "Note: All medications must be approved by a healthcare professional."
      };
    }
  }
);