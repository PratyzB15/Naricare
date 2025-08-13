'use server';

import { predictPeriod, type PredictPeriodInput } from '@/ai/flows/period-predictions';
import { getHormonalCycleNutrition, type HormonalCycleNutritionInput } from '@/ai/flows/hormonal-cycle-nutrition';
import { mentalHealthChatbot, type MentalHealthChatbotInput } from '@/ai/flows/mental-health-chatbot';
import { babyHealthTracker, type BabyHealthTrackerInput } from '@/ai/flows/baby-health-tracker';
import { getPregnancyProgress, type PregnancyProgressInput } from '@/ai/flows/pregnancy-progress';
import { breastCancerAnalysis, type BreastCancerAnalysisInput } from '@/ai/flows/breast-cancer-analysis';
import { detectLaborDisease, type DetectLaborDiseaseInput } from '@/ai/flows/labor-disease-detection';
import { getBabyNutrition, type BabyNutritionInput } from '@/ai/flows/baby-nutrition-recipe';


export async function predictPeriodAction(input: PredictPeriodInput) {
  try {
    const result = await predictPeriod(input);
    return result;
  } catch (e) {
    console.error(e);
    // A real app should have more robust error handling
    throw new Error('Failed to get prediction from AI.');
  }
}

export async function getHormonalNutritionAction(input: HormonalCycleNutritionInput) {
    try {
        const result = await getHormonalCycleNutrition(input);
        return result;
    } catch (e) {
        console.error(e);
        throw new Error('Failed to get nutrition advice from AI.');
    }
}

export async function mentalHealthChatbotAction(input: MentalHealthChatbotInput) {
    try {
        const result = await mentalHealthChatbot(input);
        return result;
    } catch (e) {
        console.error(e);
        throw new Error('Failed to get response from chatbot.');
    }
}

export async function babyHealthTrackerAction(input: BabyHealthTrackerInput) {
    try {
        const result = await babyHealthTracker(input);
        return result;
    } catch (e) {
        console.error(e);
        throw new Error('Failed to get baby health analysis from AI.');
    }
}

export async function getPregnancyProgressAction(input: PregnancyProgressInput) {
    try {
        const result = await getPregnancyProgress(input);
        return result;
    } catch (e) {
        console.error(e);
        throw new Error('Failed to get pregnancy progress from AI.');
    }
}

export async function breastCancerAnalysisAction(input: BreastCancerAnalysisInput) {
    try {
        const result = await breastCancerAnalysis(input);
        return result;
    } catch (e) {
        console.error(e);
        throw new Error('Failed to get cancer analysis from AI.');
    }
}

export async function detectLaborDiseaseAction(input: DetectLaborDiseaseInput) {
    try {
        const result = await detectLaborDisease(input);
        return result;
    } catch (e) {
        console.error(e);
        throw new Error('Failed to get disease detection from AI.');
    }
}

export async function getBabyNutritionAction(input: BabyNutritionInput) {
    try {
        const result = await getBabyNutrition(input);
        return result;
    } catch (e) {
        console.error(e);
        throw new Error('Failed to get baby nutrition advice from AI.');
    }
}
