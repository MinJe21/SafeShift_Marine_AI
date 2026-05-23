import { GoogleGenerativeAI } from 'npm:@google/generative-ai';

// Initialize the Gemini Client
// Requires GEMINI_API_KEY environment variable to be set in Supabase Edge Functions
const getGeminiClient = () => {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set. Please provide your Gemini API Key.');
  }
  return new GoogleGenerativeAI(apiKey);
};

export const getGeminiModel = (modelName: string = 'gemini-2.5-flash') => {
  const genAI = getGeminiClient();
  return genAI.getGenerativeModel({ model: modelName });
};
