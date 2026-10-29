import fs from "fs/promises";
import path from "path";

export type TrainingVideo = {
  id: string;
  title: string;
  description: string;
  category: string;
  videoUrl: string;
};

const dataFilePath = path.join(process.cwd(), "src", "data", "training-videos.json");

const initialVideos: TrainingVideo[] = [
    {
      id: "fire-safety",
      title: "Fire Safety Drill",
      description: "Comprehensive fire safety and evacuation procedures.",
      category: "Natural Disasters",
      videoUrl: "https://www.youtube.com/embed/OFt5Sj1it2s",
    },
    {
      id: "earthquake-drill",
      title: "Earthquake Drill",
      description: "Learn the 'Drop, Cover, and Hold On' technique.",
      category: "Natural Disasters",
      videoUrl: "https://www.youtube.com/embed/GSDmqLQmMN0",
    },
    {
      id: "first-aid-basics",
      title: "First-Aid Basics",
      description: "Basic first-aid training for common injuries.",
      category: "Medical Emergencies",
      videoUrl: "https://www.youtube.com/embed/Erq__y42AAY",
    },
    {
      id: "cpr-training",
      title: "CPR Training",
      description: "Learn life-saving CPR techniques for adults and children.",
      category: "Medical Emergencies",
      videoUrl: "https://www.youtube.com/embed/0C5oK3_4k34",
    },
    {
      id: "active-shooter-response",
      title: "Active Shooter Response",
      description: "Run, Hide, Fight: Responding to an active shooter event.",
      category: "Security Threats",
      videoUrl: "https://www.youtube.com/embed/5VcSwejU2D0",
    },
];

async function readData(): Promise<TrainingVideo[]> {
  try {
    const data = await fs.readFile(dataFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, create it with initial data
      await writeData(initialVideos);
      return initialVideos;
    }
    console.error("Error reading training videos data:", error);
    return initialVideos; // Fallback to initial data on other errors
  }
}

async function writeData(data: TrainingVideo[]): Promise<void> {
  try {
    // Ensure the directory exists
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing training videos data:", error);
  }
}

export async function getTrainingVideos(): Promise<TrainingVideo[]> {
  return await readData();
}

export async function addTrainingVideo(video: Omit<TrainingVideo, 'id'>): Promise<void> {
  const videos = await readData();
  const newVideo = { ...video, id: crypto.randomUUID() };
  const updatedVideos = [...videos, newVideo];
  await writeData(updatedVideos);
}

export async function removeTrainingVideo(videoId: string): Promise<void> {
  const videos = await readData();
  const updatedVideos = videos.filter(v => v.id !== videoId);
  await writeData(updatedVideos);
}
