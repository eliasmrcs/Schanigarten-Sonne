'use client'

import type { Choice } from '@/types'

interface ChoiceButtonsProps {
  choices: Choice[]
  onChoose: (choice: Choice) => void
  disabled: boolean
}

const CHOICE_STYLES = [
  'border-purple-500/50 hover:border-purple-400 hover:bg-purple-500/20 active:bg-purple-500/30',
  'border-cyan-500/50 hover:border-cyan-400 hover:bg-cyan-500/20 active:bg-cyan-500/30',
  'border-amber-500/50 hover:border-amber-400 hover:bg-amber-500/20 active:bg-amber-500/30',
]

const CHOICE_LABELS = ['A', 'B', 'C']

function getStatHint(delta: Choice['statDelta']): string | null {
  const hints: string[] = []
  if ((delta.mood ?? 0) > 10) hints.push('+mood')
  if ((delta.mood ?? 0) < -10) hints.push('-mood')
  if ((delta.energy ?? 0) > 10) hints.push('+energy')
  if ((delta.energy ?? 0) < -10) hints.push('-energy')
  if ((delta.hunger ?? 0) > 10) hints.push('+hunger')
  if ((delta.hunger ?? 0) < -10) hints.push('-hunger')
  if ((delta.happiness ?? 0) > 10) hints.push('+happy')
  if ((delta.happiness ?? 0) < -10) hints.push('-happy')
  return hints.length > 0 ? hints.slice(0, 2).join(' ') : null
}

export default function ChoiceButtons({ choices, onChoose, disabled }: ChoiceButtonsProps) {
  return (
    <div className="flex flex-col gap-2">
      {choices.map((choice, i) => {
        const hint = getStatHint(choice.statDelta)
        return (
          <button
            key={i}
            onClick={() => !disabled && onChoose(choice)}
            disabled={disabled}
            className={`
              w-full text-left px-4 py-3 rounded-lg border font-mono text-sm
              text-white transition-all duration-150
              ${CHOICE_STYLES[i]}
              ${disabled
                ? 'opacity-40 cursor-not-allowed'
                : 'cursor-pointer'
              }
            `}
          >
            <span className="flex items-center justify-between gap-3">
              <span>
                <span className="text-white/40 mr-2">[{CHOICE_LABELS[i]}]</span>
                {choice.text}
              </span>
              {hint && (
                <span className="text-xs text-white/30 shrink-0">{hint}</span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
