import fs from "fs/promises";
import path from "path";

export type StorytellingVideo = {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
};

const dataFilePath = path.join(process.cwd(), "src", "data", "storytelling-videos.json");

const initialVideos: StorytellingVideo[] = [
    {
      id: "earthquake-story",
      title: "The Day the Ground Shook",
      description: "A short animated story about how Lily the Squirrel learned to 'Drop, Cover, and Hold On' during an earthquake.",
      videoUrl: "https://www.youtube.com/embed/GSDmqLQmMN0",
    },
    {
      id: "fire-safety-cartoon",
      title: "Fire Safety with Freddy the Fox",
      description: "Freddy the Fox teaches kids how to stay low and go, and why they should never hide during a fire.",
      videoUrl: "https://www.youtube.com/embed/OFt5Sj1it2s",
    },
];

async function readData(): Promise<StorytellingVideo[]> {
  try {
    const data = await fs.readFile(dataFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, create it with initial data
      await writeData(initialVideos);
      return initialVideos;
    }
    console.error("Error reading storytelling videos data:", error);
    return initialVideos; // Fallback to initial data on other errors
  }
}

async function writeData(data: StorytellingVideo[]): Promise<void> {
  try {
    // Ensure the directory exists
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing storytelling videos data:", error);
  }
}

export async function getStorytellingVideos(): Promise<StorytellingVideo[]> {
  return await readData();
}

export async function addStorytellingVideo(video: Omit<StorytellingVideo, 'id'>): Promise<void> {
  const videos = await readData();
  const newVideo = { ...video, id: crypto.randomUUID() };
  const updatedVideos = [...videos, newVideo];
  await writeData(updatedVideos);
}

export async function removeStorytellingVideo(videoId: string): Promise<void> {
  const videos = await readData();
  const updatedVideos = videos.filter(v => v.id !== videoId);
  await writeData(updatedVideos);
}
