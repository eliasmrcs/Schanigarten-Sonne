'use client'

import { useEffect, useState, useRef } from 'react'

interface StoryPanelProps {
  text: string
  isGenerating: boolean
  characterName: string
}

export default function StoryPanel({ text, isGenerating, characterName }: StoryPanelProps) {
  const [displayed, setDisplayed] = useState('')
  const [isDone, setIsDone] = useState(false)
  const indexRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Typewriter effect
  useEffect(() => {
    if (!text) return

    setDisplayed('')
    setIsDone(false)
    indexRef.current = 0

    if (intervalRef.current) clearInterval(intervalRef.current)

    intervalRef.current = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1))
        indexRef.current++
      } else {
        setIsDone(true)
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }, 22) // ~22ms per char ≈ fast typewriter

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [text])

  if (isGenerating) {
    return (
      <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/10 min-h-[80px] flex items-center justify-center">
        <div className="flex items-center gap-2 text-white/60 font-mono text-sm">
          <span className="animate-pulse">▮</span>
          <span>{characterName} is thinking...</span>
          <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>▮</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/10 min-h-[80px]">
      <p className="text-white font-mono text-sm leading-relaxed">
        {displayed}
        {!isDone && <span className="animate-pulse text-white/50">▮</span>}
      </p>
    </div>
  )
}
