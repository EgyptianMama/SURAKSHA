import { getTrainingVideos } from "@/lib/training-videos-data";
import TrainingClientPage from "./client-page";

export default async function TrainingPage() {
    const videos = await getTrainingVideos();
    return <TrainingClientPage videos={videos} />
}
