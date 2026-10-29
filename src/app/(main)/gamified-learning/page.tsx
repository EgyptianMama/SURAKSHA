"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Gamepad2, Play, ArrowLeft, Route, Zap, Trophy, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

// w/h = the game's native pixel size; the frame is scaled to fit the screen with no extra whitespace
type Game = { id: string; title: string; description: string; url: string; icon: string; w: number; h: number; xp: number }

// Add new games here — the Games section renders automatically.
// xp = awarded once per day after PLAY_SECONDS of play (we can't see inside someone else's game, so it rewards time played).
const PLAY_SECONDS = 120
const games: Game[] = [
  {
    id: "disaster-master",
    title: "Disaster Master",
    description: "Help the heroes make the right decisions across 7 disaster levels. Wrong choices can end the game!",
    url: "https://www.ready.gov/kids/games/data/dm-english/index.html",
    icon: "🦸",
    w: 1024,
    h: 700,
    xp: 15,
  },
]

function GameFrame({ game }: { game: Game }) {
  const box = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const el = box.current
    if (!el) return
    const fit = () => setScale(Math.min(el.clientWidth / game.w, (window.innerHeight * 0.8) / game.h))
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [game])
  return (
    <div ref={box} className="w-full flex justify-center">
      <div style={{ width: game.w * scale, height: game.h * scale }}>
        <iframe
          src={game.url}
          title={game.title}
          allowFullScreen
          style={{ width: game.w, height: game.h, border: 0, transform: `scale(${scale})`, transformOrigin: "top left" }}
        />
      </div>
    </div>
  )
}

export default function GamifiedLearningPage() {
  const { profile, addXP } = useAuth()
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [earned, setEarned] = useState<number | null>(null)

  useEffect(() => {
    setEarned(null)
    if (!activeGame || !profile?.uid) return
    const key = `suraksha_game_xp_${profile.uid}_${activeGame.id}`
    const today = new Date().toISOString().split("T")[0]
    try { if (localStorage.getItem(key) === today) { setEarned(-1); return } } catch {}
    const t = setTimeout(() => {
      try { localStorage.setItem(key, today) } catch {}
      addXP(activeGame.xp)
      setEarned(activeGame.xp)
    }, PLAY_SECONDS * 1000)
    return () => clearTimeout(t)
  }, [activeGame, profile?.uid]) // eslint-disable-line react-hooks/exhaustive-deps

  if (activeGame) {
    return (
      <div className="space-y-4 animate-fade-up">
        <Button onClick={() => setActiveGame(null)} variant="outline" size="sm">
          <ArrowLeft className="mr-2 size-4" /> Back to Learning Hub
        </Button>
        <p className="text-sm font-semibold">
          {earned === null && <span className="text-muted-foreground">⏱️ Play for {PLAY_SECONDS / 60} minutes to earn +{activeGame.xp} XP</span>}
          {earned === -1 && <span className="text-muted-foreground">✅ You already earned today&apos;s XP for this game — come back tomorrow!</span>}
          {earned !== null && earned > 0 && <span className="text-emerald-600">🎉 +{earned} XP earned!</span>}
        </p>
        <Card className="overflow-hidden shadow-md">
          <CardContent className="p-0 bg-black/5">
            <GameFrame game={activeGame} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 p-6 md:p-8 animate-fade-up">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <Gamepad2 className="size-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-headline font-bold text-white">Gamified Learning Hub</h1>
              <p className="text-white/70 text-sm mt-0.5">Learn safety through play — games, quizzes, and interactive challenges!</p>
            </div>
          </div>
        </div>
        <div className="absolute top-4 right-6 text-4xl animate-float opacity-20 select-none">🎮</div>
      </div>

      {/* Safety Path CTA — Primary */}
      <Card className="overflow-hidden border-2 animate-border-glow shadow-md">
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🛡️</span>
              <h2 className="font-headline text-xl font-bold">Safety Hero Pathway</h2>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Follow a Duolingo-style learning journey! Complete lessons, earn XP, maintain your streak, and become a Safety Guardian.
            </p>
            <div className="flex items-center gap-4 mb-5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Zap className="size-3.5 text-amber-500" /> Earn XP</span>
              <span className="flex items-center gap-1"><Star className="size-3.5 text-purple-500" /> Level Up</span>
              <span className="flex items-center gap-1"><Trophy className="size-3.5 text-emerald-500" /> Win Badges</span>
            </div>
            <Button asChild size="lg" className="font-bold shadow-md">
              <Link href="/safety-path">
                <Route className="mr-2 size-4" /> Start Learning Path
              </Link>
            </Button>
          </div>
          <div className="hidden md:flex items-center justify-center w-48 bg-gradient-to-br from-emerald-400 to-teal-500 p-6">
            <div className="text-center text-white">
              <Route className="size-12 mx-auto mb-2 animate-float" />
              <p className="text-xs font-semibold opacity-80">5 Units</p>
              <p className="text-xs font-semibold opacity-80">20+ Lessons</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Games */}
      {games.length > 0 && (
      <div className="animate-fade-up" style={{ "--delay": "200ms" } as React.CSSProperties}>
        <h2 className="text-lg font-headline font-semibold mb-4 text-muted-foreground">🎮 Games</h2>
        <div className="grid gap-5 md:grid-cols-2">
          {games.map((game, i) => (
            <Card key={game.id} className="card-hover card-press overflow-hidden">
              <div className={cn(
                "h-1.5 bg-gradient-to-r",
                i === 0 ? "from-amber-400 to-orange-500" : "from-pink-400 to-rose-500"
              )} />
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-md text-3xl",
                    i === 0 ? "from-amber-400 to-orange-500" : "from-pink-400 to-rose-500"
                  )}>
                    {game.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-headline font-semibold">{game.title}</h3>
                    <p className="text-sm text-muted-foreground">{game.description}</p>
                    <p className="text-xs font-semibold text-amber-600 mt-1">⚡ +{game.xp} XP · once a day</p>
                    <Button
                      onClick={() => setActiveGame(game)}
                      disabled={!game.url}
                      size="sm"
                      variant="outline"
                      className="mt-2 gap-1.5"
                    >
                      <Play className="size-3.5" /> Play
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      )}
    </div>
  )
}
