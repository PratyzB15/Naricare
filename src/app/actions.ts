'use server';

import { predictPeriod, type PredictPeriodInput } from '@/ai/flows/period-predictions';

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
