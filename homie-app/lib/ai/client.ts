import OpenAI from 'openai'

// OpenRouter is OpenAI-compatible — just swap the base URL
export const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'https://homie.app',
    'X-Title': 'Homie — AI Tamagotchi',
  },
})

// Model: Mistral Small Creative — purpose-built for narrative/roleplay at $0.10/$0.30 per 1M tokens
// Fallback free option during MVP dev: 'meta-llama/llama-3.3-70b-instruct:free'
export const STORY_MODEL = 'mistralai/mistral-small-3.2-24b-instruct'
