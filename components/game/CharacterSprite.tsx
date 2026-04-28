'use client'

import { useEffect, useRef } from 'react'
import { renderSpriteToCanvas } from '@/lib/pixel/generator'
import type { Emotion } from '@/types'

interface CharacterSpriteProps {
  seed: string
  evolutionStage: number
  emotion: Emotion
  scale?: number
  className?: string
}

const EMOTION_CLASSES: Record<Emotion, string> = {
  happy: 'animate-bounce-slow',
  excited: 'animate-wiggle',
  sad: 'animate-droop',
  tired: 'opacity-70',
  hungry: 'animate-pulse',
  bored: 'animate-sway',
  curious: 'animate-peek',
  chaotic: 'animate-spin-slow',
}

export default function CharacterSprite({
  seed,
  evolutionStage,
  emotion,
  scale = 6,
  className = '',
}: CharacterSpriteProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    renderSpriteToCanvas(canvasRef.current, seed, evolutionStage, scale)
  }, [seed, evolutionStage, scale])

  const emotionClass = EMOTION_CLASSES[emotion] ?? ''

  return (
    <canvas
      ref={canvasRef}
      className={`${emotionClass} ${className} pixel-canvas`}
      style={{ imageRendering: 'pixelated' }}
      aria-label={`Pixel art character in ${emotion} mood`}
    />
  )
}
