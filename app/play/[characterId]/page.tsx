'use client'

import { useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useGameStore } from '@/lib/store/gameStore'
import GameCanvas from '@/components/game/GameCanvas'
import StoryPanel from '@/components/ui/StoryPanel'
import ChoiceButtons from '@/components/ui/ChoiceButtons'
import StatsBar from '@/components/ui/StatsBar'
import type { Choice } from '@/types'

export default function PlayPage() {
  const params = useParams<{ characterId: string }>()
  const characterId = params.characterId

  const {
    character,
    currentScene,
    isGenerating,
    lastChoice,
    error,
    setCharacter,
    setScene,
    setGenerating,
    setLastChoice,
    setError,
    updateStats,
    incrementSceneCount,
  } = useGameStore()

  const fetchNextScene = useCallback(
    async (chosenAction?: string, statDelta?: Choice['statDelta']) => {
      setGenerating(true)
      setError(null)

      try {
        const res = await fetch('/api/story', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ characterId, chosenAction, statDelta }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error ?? 'Failed to generate scene')
        }

        const { scene, updatedCharacter } = await res.json()
        setScene(scene)
        setCharacter(updatedCharacter)
        incrementSceneCount()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setGenerating(false)
      }
    },
    [characterId, setGenerating, setError, setScene, setCharacter, incrementSceneCount]
  )

  // Load character and first scene on mount
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch(`/api/character?id=${characterId}`)
        if (!res.ok) throw new Error('Character not found')
        const char = await res.json()
        setCharacter(char)
        await fetchNextScene()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load')
      }
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterId])

  function handleChoice(choice: Choice) {
    if (isGenerating) return
    setLastChoice(choice.text)
    updateStats(choice.statDelta)
    fetchNextScene(choice.text, choice.statDelta)
  }

  if (!character && !error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-white/40 font-mono text-sm animate-pulse">loading homie...</p>
      </div>
    )
  }

  if (error && !character) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 font-mono text-sm">{error}</p>
        <a href="/" className="text-purple-400 font-mono text-sm hover:underline">← go back</a>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-start px-4 py-6 gap-4">
      {/* Header */}
      <div className="w-full max-w-md flex items-center justify-between">
        <a href="/" className="text-white/30 font-mono text-xs hover:text-white/60 transition-colors">
          ← back
        </a>
        <span className="text-white/40 font-mono text-xs">
          scene #{character?.scene_count ?? 0}
        </span>
      </div>

      {/* Game canvas — pixel art view */}
      {character && (
        <GameCanvas
          character={character}
          emotion={currentScene?.emotion ?? 'happy'}
          sceneText={currentScene?.scene ?? ''}
        />
      )}

      {/* Stats */}
      {character && (
        <div className="w-full max-w-md">
          <StatsBar
            mood={character.mood}
            energy={character.energy}
            hunger={character.hunger}
            happiness={character.happiness}
          />
        </div>
      )}

      {/* Story panel */}
      <div className="w-full max-w-md">
        <StoryPanel
          text={currentScene?.scene ?? ''}
          isGenerating={isGenerating}
          characterName={character?.name ?? 'Homie'}
        />
      </div>

      {/* Choices */}
      {currentScene?.choices && (
        <div className="w-full max-w-md">
          <ChoiceButtons
            choices={currentScene.choices}
            onChoose={handleChoice}
            disabled={isGenerating}
          />
        </div>
      )}

      {/* Error inline */}
      {error && (
        <div className="w-full max-w-md">
          <div className="bg-red-900/30 border border-red-500/30 rounded-lg px-4 py-3 flex items-center justify-between">
            <p className="text-red-400 font-mono text-xs">{error}</p>
            <button
              onClick={() => fetchNextScene()}
              className="text-red-400 font-mono text-xs hover:text-red-300 underline ml-4"
            >
              retry
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
