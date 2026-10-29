"use server"

import { revalidatePath } from "next/cache"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  getTrainingVideos,
  addTrainingVideo,
  removeTrainingVideo,
  TrainingVideo,
} from "@/lib/training-videos-data"
import { Film, Trash2, PlusCircle, Video as VideoIcon, Settings } from "lucide-react"

async function addAction(formData: FormData) {
  "use server"
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const category = formData.get("category") as string
  const videoUrl = formData.get("videoUrl") as string
  if (title && description && category && videoUrl) {
    await addTrainingVideo({ title, description, category, videoUrl })
    revalidatePath("/admin/manage-videos")
    revalidatePath("/training")
  }
}

async function removeAction(formData: FormData) {
    "use server"
    const id = formData.get("id") as string
    if (id) {
        await removeTrainingVideo(id);
        revalidatePath("/admin/manage-videos")
        revalidatePath("/training")
    }
}

export default async function ManageVideosPage() {
  const videos = await getTrainingVideos()

  return (
    <div className="space-y-6">
      {/* Page Hero */}
      <div className="relative overflow-hidden rounded-2xl gradient-hero-navy p-6 md:p-8 pattern-dots-light">
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <Settings className="size-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-headline font-bold text-white">Manage Training Videos</h1>
            <p className="text-white/70 text-sm mt-0.5">Add or remove videos from the training library for teachers</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card className="shadow-sm border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline text-base">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <PlusCircle className="size-4 text-primary" />
                </div>
                Add New Video
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={addAction} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-semibold">Video Title</Label>
                  <Input id="title" name="title" placeholder="e.g., Fire Evacuation Drill" required className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-xs font-semibold">Description</Label>
                  <Textarea id="description" name="description" placeholder="A brief summary of the video." required className="text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="videoUrl" className="text-xs font-semibold">Video URL</Label>
                  <Input id="videoUrl" name="videoUrl" placeholder="https://youtube.com/embed/..." required className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-xs font-semibold">Category</Label>
                  <Select name="category" defaultValue="Natural Disasters">
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Natural Disasters">🌪️ Natural Disasters</SelectItem>
                      <SelectItem value="Medical Emergencies">🏥 Medical Emergencies</SelectItem>
                      <SelectItem value="Security Threats">🔒 Security Threats</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full h-9 font-semibold text-sm">
                  <PlusCircle className="mr-2 size-3.5" /> Add Video
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="font-headline text-base flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Film className="size-4 text-primary" />
                </div>
                Current Training Videos
                <span className="ml-auto text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {videos.length} videos
                </span>
              </CardTitle>
              <CardDescription className="text-xs">These videos are visible to all teachers in the training library.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {videos.length > 0 ? videos.map((video: TrainingVideo) => (
                  <div key={video.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <VideoIcon className="size-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{video.title}</h4>
                        <p className="text-xs text-muted-foreground">{video.category}</p>
                      </div>
                    </div>
                    <form action={removeAction}>
                      <Input type="hidden" name="id" value={video.id} />
                      <Button variant="ghost" size="icon" type="submit" className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10">
                        <Trash2 className="size-4 text-destructive" />
                        <span className="sr-only">Remove Video</span>
                      </Button>
                    </form>
                  </div>
                )) : (
                  <div className="text-center py-12">
                    <Film className="size-10 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-muted-foreground text-sm">No videos have been added yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
