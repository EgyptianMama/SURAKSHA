import { getStorytellingVideos } from "@/lib/storytelling-videos-data"
import StorytellingClientPage from "./client-page";

export default async function StorytellingPage() {
    const videos = await getStorytellingVideos();
    return <StorytellingClientPage videos={videos} />
}
