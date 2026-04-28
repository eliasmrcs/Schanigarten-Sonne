import OpenAI from 'openai'

// Lazy — instantiated on first request, not at module load time
let _openrouter: OpenAI | null = null

export function getOpenRouter(): OpenAI {
  if (!_openrouter) {
    _openrouter = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        'HTTP-Referer': 'https://homie.app',
        'X-Title': 'Homie — AI Tamagotchi',
      },
    })
  }
  return _openrouter
}

// Model: Mistral Small Creative — purpose-built for narrative/roleplay at $0.10/$0.30 per 1M tokens
// Fallback free option during MVP dev: 'meta-llama/llama-3.3-70b-instruct:free'
export const STORY_MODEL = 'mistralai/mistral-small-3.2-24b-instruct'
