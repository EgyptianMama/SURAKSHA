"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { StorytellingVideo } from "@/lib/storytelling-videos-data"
import { ArrowLeft, BookOpen, Play, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const cardColors = [
  "from-pink-400 to-rose-500",
  "from-violet-400 to-purple-500",
  "from-blue-400 to-cyan-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
]

export default function StorytellingClientPage({ videos }: { videos: StorytellingVideo[] }) {
  const [activeVideo, setActiveVideo] = useState<StorytellingVideo | null>(null)

  if (activeVideo) {
    return (
      <div className="space-y-4 animate-fade-up">
        <Button onClick={() => setActiveVideo(null)} variant="outline" size="sm">
          <ArrowLeft className="mr-2 size-4" /> Back to Stories
        </Button>
        <Card className="overflow-hidden shadow-md">
          <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-5 pattern-dots-light">
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
      {/* Colorful Page Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-700 p-6 md:p-8 animate-fade-up pattern-dots-light">
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <BookOpen className="size-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-headline font-bold text-white">Storytelling & Visuals</h1>
            <p className="text-white/70 text-sm mt-0.5">Short animated videos showing correct disaster responses 🎬</p>
          </div>
        </div>
        <div className="absolute top-4 right-6 opacity-20">
          <Sparkles className="size-20 text-white animate-float-slow" />
        </div>
      </div>

      {videos.length > 0 ? (
        <Carousel opts={{ align: "start" }} className="w-full animate-fade-up" style={{ "--delay": "100ms" } as React.CSSProperties}>
          <CarouselContent>
            {videos.map((video, i) => (
              <CarouselItem key={video.id} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1 h-full">
                  <Card className="card-hover card-press flex flex-col h-full overflow-hidden group">
                    {/* Colorful top gradient */}
                    <div className={cn("h-1.5 bg-gradient-to-r", cardColors[i % cardColors.length])} />
                    {/* Visual thumbnail area */}
                    <div className={cn(
                      "p-8 flex items-center justify-center bg-gradient-to-br relative",
                      cardColors[i % cardColors.length]
                    )}>
                      <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:scale-110 transition-transform">
                        <BookOpen className="size-8 text-white" />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                        <div className="p-3 bg-white rounded-full shadow-lg">
                          <Play className="size-5 text-primary" />
                        </div>
                      </div>
                    </div>
                    <CardHeader className="pb-1">
                      <CardTitle className="font-headline text-base">{video.title}</CardTitle>
                      <CardDescription className="text-xs line-clamp-2">{video.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col justify-end pt-0">
                      <Button onClick={() => setActiveVideo(video)} size="sm" className="w-full gap-2">
                        <Play className="size-3.5" /> Watch Story
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="size-12 mx-auto mb-4 opacity-30" />
          <p>No storytelling videos are available at the moment.</p>
        </div>
      )}
    </div>
  )
}
