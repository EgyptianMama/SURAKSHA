import { type Module } from "./modules-data"

const PROGRESS_KEY_PREFIX = "suraksha_module_progress_"

export type ModuleProgress = {
  status: "completed"
  scorePercent: number   // Always a percentage 0-100
  xpEarned: number
  completedAt: string
}

export function getLocalProgress(uid: string): Record<string, ModuleProgress> {
  if (typeof window === "undefined") return {}
  try {
    const data = localStorage.getItem(`${PROGRESS_KEY_PREFIX}${uid}`)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

export function saveModuleCompletion(
  uid: string, 
  moduleId: string, 
  scorePercent: number, 
  xpEarned: number
) {
  if (typeof window === "undefined") return
  const current = getLocalProgress(uid)
  current[moduleId] = { 
    status: "completed", 
    scorePercent, 
    xpEarned, 
    completedAt: new Date().toISOString() 
  }
  localStorage.setItem(`${PROGRESS_KEY_PREFIX}${uid}`, JSON.stringify(current))
}

export function resetAllProgress(uid: string) {
  if (typeof window === "undefined") return
  localStorage.removeItem(`${PROGRESS_KEY_PREFIX}${uid}`)
}

export function isModuleUnlocked(
  moduleOrder: number, 
  modules: Module[], 
  progressData: Record<string, ModuleProgress>
): boolean {
  // Module 1 is always unlocked
  if (moduleOrder === 1) return true
  // All previous modules must be completed
  const prevModule = modules.find(m => m.order === moduleOrder - 1)
  if (!prevModule) return true
  return progressData[prevModule.id]?.status === "completed"
}
