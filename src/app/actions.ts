'use server';

import { predictPeriod, type PredictPeriodInput } from '@/ai/flows/period-predictions';
import { getHormonalCycleNutrition, type HormonalCycleNutritionInput } from '@/ai/flows/hormonal-cycle-nutrition';
import { mentalHealthChatbot, type MentalHealthChatbotInput } from '@/ai/flows/mental-health-chatbot';
import { babyHealthTracker, type BabyHealthTrackerInput } from '@/ai/flows/baby-health-tracker';
import { getPregnancyProgress, type PregnancyProgressInput } from '@/ai/flows/pregnancy-progress';
import { breastCancerAnalysis, type BreastCancerAnalysisInput } from '@/ai/flows/breast-cancer-analysis';
import { detectOccupationalDisease, type DetectOccupationalDiseaseInput } from '@/ai/flows/occupational-disease-detection';
import { getBabyNutrition, type BabyNutritionInput } from '@/ai/flows/baby-nutrition-recipe';
import { babyGrowthAnalysis, type BabyGrowthAnalysisInput } from '@/ai/flows/baby-growth-analysis';
import { pregnancySymptomChecker, type PregnancySymptomCheckerInput } from '@/ai/flows/pregnancy-symptom-checker';

export async function predictPeriodAction(input: PredictPeriodInput) {
  try { 
    return await predictPeriod(input);
  } catch (e) {
    console.error('predictPeriodAction error:', e);
    throw new Error('Failed to get prediction from AI.');
  }
}

export async function getHormonalNutritionAction(input: HormonalCycleNutritionInput) {
  try {
    return await getHormonalCycleNutrition(input);
  } catch (e) {
    console.error('getHormonalNutritionAction error:', e);
    
    // Enhanced error handling for debugging
    const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
    const errorStack = e instanceof Error ? e.stack : 'No stack trace available';
    
    console.error('Detailed getHormonalNutritionAction error details:', {
      message: errorMessage,
      stack: errorStack,
      input: input,
      timestamp: new Date().toISOString()
    });
    
    // Throw error with more context while keeping user-friendly message
    throw new Error(`Failed to get nutrition advice from AI. Details: ${errorMessage}`);
  }
}

export async function mentalHealthChatbotAction(input: MentalHealthChatbotInput) {
  try {
    return await mentalHealthChatbot(input);
  } catch (e) {
    console.error('mentalHealthChatbotAction error:', e);
    // Bubble up the real reason in dev while keeping fallback message
    const msg = e instanceof Error ? e.message : 'Failed to get response from chatbot.';
    throw new Error(msg);
  }
}

export async function babyHealthTrackerAction(input: BabyHealthTrackerInput) {
  try {
    return await babyHealthTracker(input);
  } catch (e) {
    console.error('babyHealthTrackerAction error:', e);
    throw new Error('Failed to get baby health analysis from AI.');
  }
}

export async function getPregnancyProgressAction(input: PregnancyProgressInput) {
  try {
    return await getPregnancyProgress(input);
  } catch (e) {
    console.error('getPregnancyProgressAction error:', e);
    throw new Error('Failed to get pregnancy progress from AI.');
  }
}

export async function breastCancerAnalysisAction(input: BreastCancerAnalysisInput) {
  try {
    return await breastCancerAnalysis(input);
  } catch (e) {
    console.error('breastCancerAnalysisAction error:', e);
    throw new Error('Failed to get cancer analysis from AI.');
  }
}

export async function detectOccupationalDiseaseAction(input: DetectOccupationalDiseaseInput) {
  try {
    return await detectOccupationalDisease(input);
  } catch (e) {
    console.error('detectOccupationalDiseaseAction error:', e);
    throw new Error('Failed to get disease detection from AI.');
  }
}

export async function getBabyNutritionAction(input: BabyNutritionInput) {
  try {
    return await getBabyNutrition(input);
  } catch (e) {
    console.error('getBabyNutritionAction error:', e);
    throw new Error('Failed to get baby nutrition advice from AI.');
  }
}

export async function babyGrowthAnalysisAction(input: BabyGrowthAnalysisInput) {
  try {
    return await babyGrowthAnalysis(input);
  } catch (e) {
    console.error('babyGrowthAnalysisAction error:', e);
    throw new Error('Failed to get baby growth analysis from AI.');
  }
}

export async function pregnancySymptomCheckerAction(input: PregnancySymptomCheckerInput) {
  try {
    return await pregnancySymptomChecker(input);
  } catch (e) {
    console.error('pregnancySymptomCheckerAction error:', e);
    throw new Error('Failed to get symptom analysis from AI.');
  }
}