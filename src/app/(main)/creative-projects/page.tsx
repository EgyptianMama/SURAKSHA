"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FilePenLine, Heart, PlusCircle, Sparkles, Send, Palette, Star, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

type Project = {
  id: string
  title: string
  description: string
  category: string
  author: string
  likes: number
  createdAt: string
  imageUrl?: string
}

const categoryConfig: Record<string, { emoji: string; color: string; gradient: string }> = {
  "Earthquake": { emoji: "🌍", color: "text-blue-600", gradient: "from-blue-400 to-blue-600" },
  "Fire Emergency": { emoji: "🔥", color: "text-red-600", gradient: "from-red-400 to-orange-500" },
  "Flood": { emoji: "🌊", color: "text-cyan-600", gradient: "from-cyan-400 to-blue-500" },
  "Medical Emergency": { emoji: "🏥", color: "text-emerald-600", gradient: "from-emerald-400 to-green-500" },
  "General Safety": { emoji: "🛡️", color: "text-purple-600", gradient: "from-purple-400 to-violet-500" },
}

const featuredProjects: Project[] = [
  {
    id: "fp-1",
    title: "Earthquake Safety Poster",
    description: "A hand-drawn poster showing Drop, Cover, and Hold On steps with illustrations for classrooms.",
    category: "Earthquake",
    author: "Aarav S.",
    likes: 24,
    createdAt: "2026-06-15",
    imageUrl: "/mock-projects/earthquake_poster.jpg"
  },
  {
    id: "fp-2",
    title: "Fire Safety Poster",
    description: "A poster showing how to use a fire extinguisher and Stop, Drop, and Roll.",
    category: "Fire Emergency",
    author: "Priya P.",
    likes: 18,
    createdAt: "2026-06-12",
    imageUrl: "/mock-projects/fire_poster.jpg"
  }
]

const STORAGE_KEY = "suraksha_creative_projects"

export default function CreativeProjectsPage() {
  const { addXP } = useAuth()
  const [projects, setProjects] = useState<Project[]>(featuredProjects)
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Project[]
        setProjects([...parsed, ...featuredProjects])
      } catch { /* ignore */ }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const form = e.currentTarget
    const formData = new FormData(form)
    
    const saveProject = async (imageUrl?: string) => {
      const newProject: Project = {
        id: `user-${Date.now()}`,
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        author: "You",
        likes: 0,
        createdAt: new Date().toISOString().split("T")[0],
        imageUrl,
      }

      const userProjects = projects.filter(p => p.id.startsWith("user-"))
      const updated = [newProject, ...userProjects]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      setProjects([newProject, ...projects])
      
      // Give 25 XP for submission
      await addXP(25)
      
      setShowForm(false)
      setIsSubmitting(false)
      form.reset()
    }

    const file = formData.get("image") as File
    if (file && file.size > 0) {
      const reader = new FileReader()
      reader.onload = (e) => {
        saveProject(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      saveProject()
    }
  }

  const handleLike = (id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p))
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 via-orange-500 to-amber-500 p-6 md:p-8 animate-fade-up pattern-dots-light">
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <Palette className="size-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-headline font-bold text-white">Creative Projects</h1>
            <p className="text-white/70 text-sm mt-0.5">Create safety posters, slogans, and ideas — share with your school!</p>
          </div>
        </div>
        <div className="absolute top-4 right-6 opacity-15">
          <Sparkles className="size-28 text-white animate-float-slow" />
        </div>
      </div>

      {/* XP incentive + Submit button */}
      <div className="flex flex-col sm:flex-row items-center gap-3 animate-fade-up" style={{ "--delay": "50ms" } as React.CSSProperties}>
        <Card className="flex-1 w-full border-l-4 border-l-accent bg-accent/5">
          <CardContent className="p-3.5 flex items-center gap-3">
            <Star className="size-5 text-accent shrink-0" />
            <p className="text-xs"><span className="font-semibold">Earn 25 XP</span> for every project you submit!</p>
          </CardContent>
        </Card>
        <Button onClick={() => setShowForm(!showForm)} size="lg" className="font-semibold gap-2 shrink-0">
          <PlusCircle className="size-4" /> {showForm ? "Cancel" : "Submit a Project"}
        </Button>
      </div>

      {/* Submit Form */}
      {showForm && (
        <Card className="shadow-md animate-scale-in">
          <CardHeader>
            <CardTitle className="font-headline text-base flex items-center gap-2">
              <div className="p-1.5 bg-accent/10 rounded-lg">
                <FilePenLine className="size-4 text-accent" />
              </div>
              Submit Your Project
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-semibold">Project Title</Label>
                <Input id="title" name="title" placeholder="e.g., Fire Safety Poster for Class 9" required className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-semibold">Description</Label>
                <Textarea id="description" name="description" placeholder="Describe your project idea..." required className="min-h-[80px]" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs font-semibold">Category</Label>
                <Select name="category" required defaultValue="Earthquake">
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryConfig).map(([cat, config]) => (
                      <SelectItem key={cat} value={cat}>{config.emoji} {cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="image" className="text-xs font-semibold">Project Image (Optional)</Label>
                <div className="flex items-center gap-2 border rounded-md px-3 h-10 bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                  <ImageIcon className="size-4 text-muted-foreground shrink-0" />
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    className="flex-1 text-sm file:bg-transparent file:text-sm file:font-medium file:text-foreground file:border-0 file:mr-2 file:cursor-pointer text-muted-foreground outline-none"
                  />
                </div>
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full font-semibold gap-2">
                <Send className="size-4" /> {isSubmitting ? "Submitting..." : "Submit Project"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Project Gallery */}
      <div className="animate-fade-up" style={{ "--delay": "150ms" } as React.CSSProperties}>
        <h2 className="text-lg font-headline font-semibold mb-4 text-muted-foreground">🎨 Project Gallery</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => {
            const config = categoryConfig[project.category] || categoryConfig["Earthquake"]
            return (
              <Card
                key={project.id}
                className="card-hover overflow-hidden animate-fade-up flex flex-col"
                style={{ "--delay": `${170 + i * 50}ms` } as React.CSSProperties}
              >
                <div className={cn("h-1.5 shrink-0 bg-gradient-to-r", config.gradient)} />
                <CardContent className="p-5 flex-1 flex flex-col">
                  {project.imageUrl && (
                    <div className="w-full aspect-video rounded-lg overflow-hidden mb-4 shrink-0 bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-lg shadow-sm shrink-0",
                      config.gradient
                    )}>
                      {config.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge variant="secondary" className="text-[9px] px-1.5">{project.category}</Badge>
                        {project.author === "You" && (
                          <Badge className="bg-accent/10 text-accent text-[9px] px-1.5">Your project</Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm">{project.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
                    </div>
                  </div>
                  <div className="flex-1" />
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>by {project.author}</span>
                      <span>·</span>
                      <span>{new Date(project.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(project.id)}
                      className="gap-1 text-xs text-muted-foreground hover:text-red-500"
                    >
                      <Heart className="size-3.5" /> {project.likes}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
