'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { renderSpriteToCanvas } from '@/lib/pixel/generator'
import { getBrowserClient } from '@/lib/supabase'
import { PERSONALITY_DESCRIPTIONS } from '@/types'
import type { PersonalityTrait } from '@/types'

const TRAITS: PersonalityTrait[] = ['curious', 'lazy', 'chaotic', 'wholesome']

const TRAIT_EMOJIS: Record<PersonalityTrait, string> = {
  curious: '🔍',
  lazy: '😴',
  chaotic: '🌀',
  wholesome: '🌻',
}

function generatePreviewSeed(name: string, trait: PersonalityTrait): string {
  return `${name.trim().toLowerCase() || 'homie'}-${trait}-preview`
}

export default function CreatePage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [name, setName] = useState('')
  const [trait, setTrait] = useState<PersonalityTrait>('curious')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthReady, setIsAuthReady] = useState(false)

  // Wait for anonymous session before allowing character creation
  useEffect(() => {
    const supabase = getBrowserClient()
    async function ensureAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        const { error } = await supabase.auth.signInAnonymously()
        if (error) {
          setError('Failed to connect: ' + error.message)
          return
        }
      }
      setIsAuthReady(true)
    }
    ensureAuth()
  }, [])

  // Live sprite preview
  useEffect(() => {
    if (!canvasRef.current) return
    const seed = generatePreviewSeed(name, trait)
    renderSpriteToCanvas(canvasRef.current, seed, 0, 6)
  }, [name, trait])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = getBrowserClient()
      let { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        const { data, error: signInError } = await supabase.auth.signInAnonymously()
        if (signInError) throw new Error('Auth failed: ' + signInError.message)
        session = data.session
      }

      if (!session?.access_token) throw new Error('No auth session — try refreshing the page')

      const res = await fetch('/api/character', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ name: name.trim(), personalityTrait: trait }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to create character')
      }

      const character = await res.json()
      router.push(`/play/${character.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4 py-12">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold font-mono mb-1">create your homie</h1>
          <p className="text-white/40 font-mono text-xs">choose wisely. you&apos;re stuck with them.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Sprite preview */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-40 h-40 bg-gray-900 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden">
              <canvas
                ref={canvasRef}
                style={{ imageRendering: 'pixelated' }}
                aria-label="Character preview"
              />
            </div>
            <p className="text-white/30 font-mono text-xs">live preview</p>
          </div>

          {/* Name input */}
          <div className="flex flex-col gap-2">
            <label className="font-mono text-sm text-white/70">name your homie</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Grizwald, Splorp, Deekz..."
              maxLength={20}
              className="bg-gray-900 border border-white/10 rounded-lg px-4 py-3 font-mono text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500 transition-colors"
              required
            />
          </div>

          {/* Trait picker */}
          <div className="flex flex-col gap-2">
            <label className="font-mono text-sm text-white/70">pick a vibe</label>
            <div className="grid grid-cols-2 gap-2">
              {TRAITS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTrait(t)}
                  className={`
                    p-3 rounded-lg border font-mono text-left transition-all
                    ${trait === t
                      ? 'border-purple-500 bg-purple-500/20 text-white'
                      : 'border-white/10 bg-gray-900 text-white/50 hover:border-white/30'
                    }
                  `}
                >
                  <div className="text-xl mb-1">{TRAIT_EMOJIS[t]}</div>
                  <div className="text-xs font-bold capitalize">{t}</div>
                  <div className="text-xs text-white/40 leading-tight mt-0.5 line-clamp-2">
                    {PERSONALITY_DESCRIPTIONS[t]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-400 font-mono text-xs text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={!name.trim() || isSubmitting || !isAuthReady}
            className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-white/30 rounded-xl font-mono font-bold text-lg transition-colors"
          >
            {!isAuthReady ? 'connecting...' : isSubmitting ? 'hatching...' : 'hatch →'}
          </button>
        </form>
      </div>
    </main>
  )
}
