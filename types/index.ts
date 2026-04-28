export type PersonalityTrait = 'curious' | 'lazy' | 'chaotic' | 'wholesome'
export type Emotion = 'happy' | 'sad' | 'excited' | 'tired' | 'hungry' | 'bored' | 'curious' | 'chaotic'
export type EvolutionStage = 0 | 1 | 2 | 3

export interface Stats {
  mood: number
  energy: number
  hunger: number
  happiness: number
}

export interface StatDelta {
  mood?: number
  energy?: number
  hunger?: number
  happiness?: number
}

export interface Choice {
  text: string
  statDelta: StatDelta
}

export interface Scene {
  scene: string
  emotion: Emotion
  choices: Choice[]
}

export interface Character {
  id: string
  user_id: string
  name: string
  sprite_seed: string
  personality_trait: PersonalityTrait
  evolution_stage: EvolutionStage
  mood: number
  energy: number
  hunger: number
  happiness: number
  scene_count: number
  created_at: string
  updated_at: string
}

export interface StoryMoment {
  id: string
  character_id: string
  scene_text: string
  emotion: string
  chosen_action: string | null
  stat_delta: StatDelta
  created_at: string
}

export const EVOLUTION_STAGE_NAMES: Record<EvolutionStage, string> = {
  0: 'Egg',
  1: 'Baby',
  2: 'Teen',
  3: 'Adult',
}

export const PERSONALITY_DESCRIPTIONS: Record<PersonalityTrait, string> = {
  curious: 'Always poking at things. Will investigate anything. Consequences: unknown.',
  lazy: 'Maximum vibe, minimum effort. Somehow still gets into trouble.',
  chaotic: 'No plan. No rules. Tremendous energy. Absolute menace.',
  wholesome: 'Genuinely nice. Suspiciously nice. What are they hiding?',
}
