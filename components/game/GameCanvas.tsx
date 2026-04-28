'use client'

import { useEffect, useRef } from 'react'
import CharacterSprite from './CharacterSprite'
import type { Character, Emotion } from '@/types'

const BACKGROUNDS = [
  { id: 'bedroom', label: 'Bedroom', gradient: 'from-indigo-900 to-purple-900', floor: 'bg-amber-800', accent: '🛏️' },
  { id: 'park', label: 'Park', gradient: 'from-sky-600 to-blue-700', floor: 'bg-green-700', accent: '🌿' },
  { id: 'cafe', label: 'Café', gradient: 'from-amber-800 to-orange-900', floor: 'bg-stone-600', accent: '☕' },
  { id: 'rooftop', label: 'Rooftop', gradient: 'from-slate-700 to-slate-900', floor: 'bg-slate-500', accent: '🏙️' },
  { id: 'store', label: 'Corner Store', gradient: 'from-teal-800 to-cyan-900', floor: 'bg-stone-700', accent: '🏪' },
]

function pickBackground(sceneText: string): typeof BACKGROUNDS[0] {
  const lower = sceneText.toLowerCase()
  if (lower.includes('café') || lower.includes('cafe') || lower.includes('coffee')) return BACKGROUNDS[2]
  if (lower.includes('park') || lower.includes('grass') || lower.includes('outside') || lower.includes('sun')) return BACKGROUNDS[1]
  if (lower.includes('roof') || lower.includes('sky') || lower.includes('city')) return BACKGROUNDS[3]
  if (lower.includes('store') || lower.includes('shop') || lower.includes('market')) return BACKGROUNDS[4]
  return BACKGROUNDS[0] // default: bedroom
}

interface GameCanvasProps {
  character: Character
  emotion: Emotion
  sceneText: string
}

export default function GameCanvas({ character, emotion, sceneText }: GameCanvasProps) {
  const bg = pickBackground(sceneText)

  return (
    <div className={`relative w-full aspect-video max-w-md mx-auto rounded-xl overflow-hidden bg-gradient-to-b ${bg.gradient} border-2 border-white/10 shadow-2xl`}>
      {/* Background decoration */}
      <div className="absolute inset-0 flex items-end">
        {/* Sky/wall area — simple pixel dots for texture */}
        <div className="w-full h-2/3 relative overflow-hidden">
          {/* Stars/ambient dots */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{
                left: `${(i * 37 + 11) % 100}%`,
                top: `${(i * 53 + 7) % 60}%`,
              }}
            />
          ))}
          {/* Background accent emoji */}
          <div className="absolute right-4 top-4 text-4xl opacity-20 select-none">
            {bg.accent}
          </div>
        </div>
      </div>

      {/* Floor */}
      <div className={`absolute bottom-0 w-full h-1/4 ${bg.floor} opacity-80`} />

      {/* Floor highlight line */}
      <div className="absolute bottom-1/4 w-full h-px bg-white/10" />

      {/* Character centered */}
      <div className="absolute inset-0 flex items-center justify-center pb-6">
        <div className="flex flex-col items-center gap-1">
          <CharacterSprite
            seed={character.sprite_seed}
            evolutionStage={character.evolution_stage}
            emotion={emotion}
            scale={6}
          />
          <span className="text-white/50 text-xs font-mono mt-1">{character.name}</span>
        </div>
      </div>

      {/* Shadow under character */}
      <div className="absolute bottom-[24%] left-1/2 -translate-x-1/2 w-20 h-3 bg-black/30 rounded-full blur-sm" />

      {/* HUD: location tag */}
      <div className="absolute top-2 left-2 bg-black/30 backdrop-blur-sm text-white/70 text-xs px-2 py-0.5 rounded font-mono">
        {bg.label}
      </div>

      {/* HUD: evolution stage */}
      <div className="absolute top-2 right-2 bg-black/30 backdrop-blur-sm text-white/70 text-xs px-2 py-0.5 rounded font-mono">
        Stage {character.evolution_stage}
      </div>
    </div>
  )
}
