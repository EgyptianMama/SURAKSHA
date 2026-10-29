"use client"

import { useState, useMemo } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { TrainingVideo } from "@/lib/training-videos-data"
import { Youtube, ArrowLeft, Play, Clock, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

const categoryConfig: Record<string, { emoji: string; color: string; bg: string }> = {
  "Natural Disasters": { emoji: "🌪️", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
  "Medical Emergencies": { emoji: "🏥", color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30" },
  "Security Threats": { emoji: "🔒", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
}

export default function TrainingClientPage({ videos }: { videos: TrainingVideo[] }) {
  const [activeVideo, setActiveVideo] = useState<TrainingVideo | null>(null)

  const categories = useMemo(() => {
    const cats = new Set(videos.map((v) => v.category))
    return Array.from(cats)
  }, [videos])

  if (activeVideo) {
    return (
      <div className="space-y-4 animate-fade-up">
        <Button onClick={() => setActiveVideo(null)} variant="outline" size="sm">
          <ArrowLeft className="mr-2 size-4" /> Back to Library
        </Button>
        <Card className="overflow-hidden shadow-md">
          <div className="gradient-hero-navy p-5 pattern-dots-light">
            <CardTitle className="text-white font-headline text-xl">{activeVideo.title}</CardTitle>
            <CardDescription className="text-white/70 mt-1">{activeVideo.description}</CardDescription>
          </div>
          <CardContent className="p-0">
            <div className="aspect-video w-full">
              <iframe
                className="w-full h-full"
                src={activeVideo.videoUrl}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Hero */}
      <div className="relative overflow-hidden rounded-2xl gradient-hero-success p-6 md:p-8 animate-fade-up pattern-dots-light">
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <Youtube className="size-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-headline font-bold text-white">Training Library</h1>
            <p className="text-white/70 text-sm mt-0.5">Curated video content for emergency preparedness and safety drills</p>
          </div>
        </div>
      </div>

      {videos.length > 0 ? (
        <Tabs defaultValue={categories[0]} className="w-full animate-fade-up" style={{ "--delay": "100ms" } as React.CSSProperties}>
          <div className="flex justify-center">
            <TabsList className="bg-muted/50">
              {categories.map((category) => {
                const config = categoryConfig[category] || { emoji: "📹", color: "", bg: "" }
                return (
                  <TabsTrigger key={category} value={category} className="gap-1.5 text-xs font-semibold">
                    <span>{config.emoji}</span> {category}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>
          {categories.map((category) => (
            <TabsContent key={category} value={category}>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 mt-4">
                {videos
                  .filter((video) => video.category === category)
                  .map((video, i) => {
                    const config = categoryConfig[video.category] || { emoji: "📹", color: "", bg: "" }
                    return (
                      <Card
                        key={video.id}
                        className="card-hover card-press flex flex-col overflow-hidden animate-fade-up"
                        style={{ "--delay": `${i * 60}ms` } as React.CSSProperties}
                      >
                        {/* Color top bar */}
                        <div className={cn("h-1.5 bg-gradient-to-r",
                          category === "Natural Disasters" ? "from-blue-400 to-cyan-500" :
                          category === "Medical Emergencies" ? "from-red-400 to-rose-500" :
                          "from-amber-400 to-orange-500"
                        )} />
                        {/* Thumbnail placeholder */}
                        <div className="relative bg-muted/30 p-6 flex items-center justify-center">
                          <div className={cn("p-4 rounded-2xl", config.bg)}>
                            <Shield className={cn("size-8", config.color)} />
                          </div>
                          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md">
                            <Clock className="size-3" /> 5 min
                          </div>
                        </div>
                        <CardHeader className="pb-1">
                          <CardTitle className="font-headline text-base">{video.title}</CardTitle>
                          <CardDescription className="text-xs line-clamp-2">{video.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow flex flex-col justify-end pt-0">
                          <Button onClick={() => setActiveVideo(video)} size="sm" className="w-full gap-2">
                            <Play className="size-3.5" /> Watch Video
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <Shield className="size-12 mx-auto mb-4 opacity-30" />
          <p>No training videos are available at the moment.</p>
        </div>
      )}
    </div>
  )
}
