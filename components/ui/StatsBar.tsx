'use client'

interface Stat {
  label: string
  value: number
  color: string
  emoji: string
}

interface StatsBarProps {
  mood: number
  energy: number
  hunger: number
  happiness: number
}

function StatRow({ label, value, color, emoji }: Stat) {
  const width = Math.max(0, Math.min(100, value))
  const isLow = value < 30
  const isCritical = value < 15

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm w-4 text-center" title={label}>{emoji}</span>
      <div className="flex-1 h-3 bg-black/40 rounded overflow-hidden border border-white/10">
        <div
          className={`h-full transition-all duration-500 ${color} ${isCritical ? 'animate-pulse' : ''}`}
          style={{ width: `${width}%`, imageRendering: 'pixelated' }}
        />
      </div>
      <span
        className={`text-xs font-mono w-7 text-right ${isLow ? 'text-red-400' : 'text-white/50'}`}
      >
        {value}
      </span>
    </div>
  )
}

export default function StatsBar({ mood, energy, hunger, happiness }: StatsBarProps) {
  const stats: Stat[] = [
    { label: 'Mood', value: mood, color: 'bg-yellow-400', emoji: '😶' },
    { label: 'Energy', value: energy, color: 'bg-blue-400', emoji: '⚡' },
    { label: 'Hunger', value: hunger, color: 'bg-orange-400', emoji: '🍕' },
    { label: 'Happiness', value: happiness, color: 'bg-pink-400', emoji: '💜' },
  ]

  return (
    <div className="flex flex-col gap-2 bg-black/30 backdrop-blur-sm rounded-lg p-3 border border-white/10">
      {stats.map((stat) => (
        <StatRow key={stat.label} {...stat} />
      ))}
    </div>
  )
}
