// src/ai/test-api.ts
import { googleAI } from '@genkit-ai/googleai';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

async function testGoogleAI() {
  console.log('🔍 Testing Google AI API...');
  console.log('API Key present:', !!apiKey);
  
  if (!apiKey) {
    console.log('❌ No API key found');
    return;
  }

  try {
    // Create a simple Google AI instance directly
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Test with the most basic model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    console.log('✅ Google AI instance created');
    
    // Try a simple generation
    const result = await model.generateContent('Say "Hello World"');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ API Test Successful!');
    console.log('Response:', text);
    
  } catch (error: any) {
    console.log('❌ API Test Failed:');
    console.log('Error:', error.message);
    console.log('Full error:', error);
  }
}

testGoogleAI();