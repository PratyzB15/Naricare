'use server';

import { predictPeriod, type PredictPeriodInput } from '@/ai/flows/period-predictions';
import { getHormonalCycleNutrition, type HormonalCycleNutritionInput } from '@/ai/flows/hormonal-cycle-nutrition';
import { mentalHealthChatbot, type MentalHealthChatbotInput } from '@/ai/flows/mental-health-chatbot';
import { babyHealthTracker, type BabyHealthTrackerInput } from '@/ai/flows/baby-health-tracker';


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
