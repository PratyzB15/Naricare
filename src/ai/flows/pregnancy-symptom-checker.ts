// src/ai/flows/pregnancy-symptom-checker.ts
'use server';

/**
 * @fileOverview An AI flow for analyzing pregnancy symptoms and providing guidance.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// === Input Schema ===
const PregnancySymptomCheckerInputSchema = z.object({
  symptoms: z.array(z.string()).describe('An array of symptoms selected by the user.'),
});
export type PregnancySymptomCheckerInput = z.infer<typeof PregnancySymptomCheckerInputSchema>;

// === Output Schema ===
const PregnancySymptomCheckerOutputSchema = z.object({
  analysis: z.string(),
  severity: z.string(),
  immediateAction: z.string(),
  preventionTips: z.string(),
  safeMedications: z.string(),
});
export type PregnancySymptomCheckerOutput = z.infer<typeof PregnancySymptomCheckerOutputSchema>;

// === Public Function ===
export async function pregnancySymptomChecker(
  input: PregnancySymptomCheckerInput
): Promise<PregnancySymptomCheckerOutput> {
  return await pregnancySymptomCheckerFlow(input);
}

// === Flow Definition ===
const pregnancySymptomCheckerFlow = ai.defineFlow(
  {
    name: 'pregnancySymptomCheckerFlow',
    inputSchema: PregnancySymptomCheckerInputSchema,
    outputSchema: PregnancySymptomCheckerOutputSchema,
  },
  async (input) => {
    const symptomList = input.symptoms.map((s) => `- ${s}`).join('\n');

    const prompt = `
You are an expert AI gynecologist assistant. Analyze the reported pregnancy symptoms and provide clear, safe guidance.

**User's Reported Symptoms:**
${symptomList}

**REFERENCE MEDICAL TABLE FOR PREGNANCY SYMPTOMS:**

EMERGENCY SYMPTOMS (Severity: High - Immediate Medical Attention Required):
- Severe abdominal pain or cramping
- Vaginal bleeding or spotting with pain
- Severe headaches with vision changes (blurred vision, seeing spots)
- Sudden swelling of face, hands, or feet
- Decreased fetal movement after 28 weeks
- Fever over 100.4°F (38°C) with abdominal pain
- Severe vomiting (unable to keep liquids down for 24 hours)
- Leaking amniotic fluid or gush of fluid
- Severe dizziness or fainting
- Difficulty breathing or chest pain
- Severe pelvic pressure or feeling like baby is pushing down

CONCERNING SYMPTOMS (Severity: Medium - Contact Provider Within 24 Hours):
- Moderate abdominal pain without bleeding
- Light spotting without pain (less than a pad per hour)
- Persistent headaches without vision changes
- Mild to moderate swelling that doesn't improve with rest
- Burning sensation during urination
- Itchy skin with rash
- Back pain with fever
- Mild contractions before 37 weeks
- Excessive thirst and urination (signs of gestational diabetes)
- Vaginal discharge with unusual color or odor

NORMAL SYMPTOMS (Severity: Low - Monitor at Home):
- Mild nausea/vomiting (morning sickness)
- Fatigue and tiredness
- Mild backache
- Frequent urination
- Food cravings or aversions
- Mild breast tenderness
- Constipation
- Mild swelling in feet/ankles (especially after standing)
- Heartburn or indigestion
- Mild headaches
- Round ligament pain (sharp pain in lower abdomen when changing positions)
- Nasal congestion
- Mood swings
- Mild shortness of breath (especially in third trimester)

**INSTRUCTIONS:**
1. Analyze the user's symptoms based on the reference table above.
2. Determine severity: "High (Emergency)", "Medium (Concerning)", or "Low (Normal)".
3. Provide specific, actionable advice.
4. Your response MUST be valid JSON with EXACTLY these 5 fields: analysis, severity, immediateAction, preventionTips, safeMedications.
5. The safeMedications field must end with: "Note: All medications must be approved by a healthcare professional."

**OUTPUT FORMAT - RETURN ONLY VALID JSON, NO OTHER TEXT:**
{
  "analysis": "Your detailed analysis here...",
  "severity": "Low (Normal)",
  "immediateAction": "Specific actions to take...",
  "preventionTips": "Tips to prevent or manage symptoms...",
  "safeMedications": "Acetaminophen (Tylenol) for pain relief as directed. Note: All medications must be approved by a healthcare professional."
}
`;

    try {
      console.log('🔍 Calling AI with symptoms:', input.symptoms);
      
      const result = await ai.generate({
        model: 'gemini-2.0-flash',
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

      console.log('✅ AI Result received:', {
        text: result.text,
        output: result.output,
        usage: result.usage
      });

      const response = result.output;
      
      if (!response) {
        console.error('❌ AI returned no valid output. Raw text:', result.text);
        throw new Error('AI returned no valid output.');
      }

      // Validate required fields
      const requiredFields = ['analysis', 'severity', 'immediateAction', 'preventionTips', 'safeMedications'];
      const missingFields = requiredFields.filter(field => !response[field as keyof typeof response]);
      
      if (missingFields.length > 0) {
        console.warn('⚠️ Missing fields in AI response:', missingFields);
      }

      return {
        analysis: response.analysis || 'Analysis unavailable. Please describe your symptoms to a healthcare provider.',
        severity: response.severity || 'Unknown - Requires Professional Assessment',
        immediateAction: response.immediateAction || 'Contact your healthcare provider for personalized guidance.',
        preventionTips: response.preventionTips || 'Maintain regular prenatal visits and report any new or worsening symptoms.',
        safeMedications: response.safeMedications?.includes('Note:')
          ? response.safeMedications
          : `${response.safeMedications || 'Acetaminophen (Tylenol) may be used for pain relief as directed.'} Note: All medications must be approved by a healthcare professional.`,
      };
    } catch (error: any) {
      console.error('❌ pregnancySymptomCheckerFlow error:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
        inputSymptoms: input.symptoms
      });
      
      // Simple fallback logic
      const hasEmergencyKeywords = input.symptoms.some(symptom => {
        const lowerSymptom = symptom.toLowerCase();
        return lowerSymptom.includes('bleeding') || 
               lowerSymptom.includes('severe pain') || 
               lowerSymptom.includes('fever') || 
               lowerSymptom.includes('fluid leak') ||
               lowerSymptom.includes('vision change') ||
               lowerSymptom.includes('chest pain');
      });
      
      return {
        analysis: hasEmergencyKeywords 
          ? 'System error occurred. Some symptoms you reported may be serious. Please seek immediate medical attention.' 
          : 'System temporarily unavailable. Please consult your healthcare provider about your symptoms.',
        severity: hasEmergencyKeywords ? 'High (Emergency)' : 'Medium (Concerning)',
        immediateAction: hasEmergencyKeywords 
          ? 'Go to the nearest emergency room or call emergency services immediately.' 
          : 'Contact your healthcare provider within 24 hours for proper evaluation.',
        preventionTips: 'Keep track of your symptoms, including timing, severity, and any triggers.',
        safeMedications: 'Do not take any medication without consulting your healthcare provider. Note: All medications must be approved by a healthcare professional.',
      };
    }
  }
);