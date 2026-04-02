import { create } from 'zustand'
import type { Character, Scene, Choice, Stats } from '@/types'

interface GameState {
  character: Character | null
  currentScene: Scene | null
  isGenerating: boolean
  lastChoice: string | null
  error: string | null

  // Actions
  setCharacter: (character: Character) => void
  setScene: (scene: Scene) => void
  setGenerating: (val: boolean) => void
  setLastChoice: (choice: string) => void
  setError: (error: string | null) => void
  updateStats: (stats: Partial<Stats>) => void
  incrementSceneCount: () => void
  reset: () => void
}

const initialState = {
  character: null,
  currentScene: null,
  isGenerating: false,
  lastChoice: null,
  error: null,
}

export const useGameStore = create<GameState>((set) => ({
  ...initialState,

  setCharacter: (character) => set({ character }),

  setScene: (scene) => set({ currentScene: scene, error: null }),

  setGenerating: (isGenerating) => set({ isGenerating }),

  setLastChoice: (choice) => set({ lastChoice: choice }),

  setError: (error) => set({ error, isGenerating: false }),

  updateStats: (stats) =>
    set((state) => {
      if (!state.character) return {}
      return {
        character: {
          ...state.character,
          mood: clamp((state.character.mood ?? 80) + (stats.mood ?? 0)),
          energy: clamp((state.character.energy ?? 80) + (stats.energy ?? 0)),
          hunger: clamp((state.character.hunger ?? 80) + (stats.hunger ?? 0)),
          happiness: clamp((state.character.happiness ?? 80) + (stats.happiness ?? 0)),
        },
      }
    }),

  incrementSceneCount: () =>
    set((state) => {
      if (!state.character) return {}
      const newCount = state.character.scene_count + 1
      const newStage = getEvolutionStage(newCount)
      return {
        character: {
          ...state.character,
          scene_count: newCount,
          evolution_stage: newStage,
        },
      }
    }),

  reset: () => set(initialState),
}))

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function getEvolutionStage(sceneCount: number): 0 | 1 | 2 | 3 {
  if (sceneCount >= 75) return 3
  if (sceneCount >= 30) return 2
  if (sceneCount >= 10) return 1
  return 0
}
