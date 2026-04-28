import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">
      {/* Pixel grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-md gap-8">
        <div>
          <h1 className="text-5xl font-bold tracking-tight mb-2 font-mono">
            homie<span className="text-purple-400">.</span>
          </h1>
          <p className="text-white/40 font-mono text-sm">
            a tiny creature that lives on the internet
          </p>
        </div>

        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="w-20 h-20 bg-purple-500/20 rounded-xl border border-purple-500/30 flex items-center justify-center">
            <span className="text-4xl select-none">🥚</span>
          </div>
          <div className="absolute -top-2 -right-2 text-xs bg-purple-500/80 px-2 py-0.5 rounded-full font-mono">
            your homie
          </div>
        </div>

        <div className="flex flex-col gap-2 text-sm font-mono text-white/50">
          <span>▸ a never-ending pixel story, shaped by you</span>
          <span>▸ feed it. ignore it. regret it.</span>
          <span>▸ it has opinions. strong ones.</span>
          <span>▸ no two are the same. ever.</span>
        </div>

        <Link
          href="/create"
          className="px-8 py-4 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 rounded-xl font-mono font-bold text-lg transition-colors w-full text-center"
        >
          hatch your homie →
        </Link>

        <p className="text-white/20 font-mono text-xs">
          powered by AI · pixel-rendered · yours forever
        </p>
      </div>
    </main>
  )
}
