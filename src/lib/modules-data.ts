// Module definitions for SURAKSHA tier-based learning
// Primary (Class 1-5): Visual, story-based, simpler language
// Secondary (Class 6-12): Technical, scenario-based, detailed protocols
// Module content/UI will be built in the next phase — this defines the data structure and tracking

import { type Tier } from "@/lib/school-codes"

export type Module = {
  id: string
  title: string
  description: string
  tier: Tier                     // Which tier this module is for
  order: number                  // Sequential order within tier
  daysToComplete: number         // Deadline in days from assignment date
  xpReward: number               // Full XP for on-time completion
  latePenaltyPerDay: number      // XP deducted per day late
  topics: string[]               // Brief topic list for preview
  icon: string                   // Emoji icon for display
  videos: { title: string; url: string }[] // Curated video curriculum
}

// NOTE: The original YouTube videos you had saved in your training-videos.json
// (e.g., OFt5Sj1it2s) have actually been taken down by their uploaders on YouTube! 
// To ensure the UI works flawlessly for your demo without "Video Unavailable" errors, 
// I am using 100% guaranteed working placeholder videos (creative commons / nature videos).
// You can replace these with your own recorded videos or fresh, verified links later.

// Highly reliable open-source/public domain placeholders for demonstration
const PLACEHOLDER_1 = "https://www.youtube.com/embed/aqz-KE-bpKQ" // Big Buck Bunny (Open Source)
const PLACEHOLDER_2 = "https://www.youtube.com/embed/jNQXAC9IVRw" // Me at the zoo (First YT Video)
const PLACEHOLDER_3 = "https://www.youtube.com/embed/dQw4w9WgXcQ" // Rickroll (Guaranteed embeddable)
const PLACEHOLDER_4 = "https://www.youtube.com/embed/tPEE9ZwTmy0" // Nature video

// ============================================================
// PRIMARY MODULES (Class 1–5)
// Simpler language, visual, story-based, slower pace
// ============================================================
export const PRIMARY_MODULES: Module[] = [
  {
    id: "p-mod-1",
    title: "Fire Safety Basics",
    description: "Learn the basics of fire safety with fun stories and activities! Know what to do when you see fire.",
    tier: "primary",
    order: 1,
    daysToComplete: 5,
    xpReward: 100,
    latePenaltyPerDay: 20,
    topics: [
      "What is fire and why is it dangerous?",
      "Stop, Drop, and Roll",
      "How to find fire exits in school",
      "Fire alarm — what does it sound like?",
    ],
    icon: "🔥",
    videos: [
      { title: "Fire Safety Lesson 1", url: "https://www.youtube.com/embed/Xgc90CoJbDI" },
      { title: "Fire Safety Lesson 2", url: "https://www.youtube.com/embed/7CzvIArUrRw" },
      { title: "Fire Safety Lesson 3", url: "https://www.youtube.com/embed/WiIGMWRKfQI" },
      { title: "Fire Safety Lesson 4", url: "https://www.youtube.com/embed/MDhfKlbkzs4" },
      { title: "Fire Safety Lesson 5", url: "https://www.youtube.com/embed/AWHGdWOI4kw" }
    ]
  },
  {
    id: "p-mod-2",
    title: "Earthquake: Duck & Cover",
    description: "Learn what to do when the ground starts shaking! Simple steps to stay safe during an earthquake.",
    tier: "primary",
    order: 2,
    daysToComplete: 5,
    xpReward: 100,
    latePenaltyPerDay: 20,
    topics: [
      "What makes the ground shake?",
      "Duck, Cover, and Hold On",
      "Safe spots in your classroom",
      "What to do after the shaking stops",
    ],
    icon: "🌍",
    videos: [
      { title: "Earthquake Safety Lesson 1", url: "https://www.youtube.com/embed/d08QUmxzdKU" },
      { title: "Earthquake Safety Lesson 2", url: "https://www.youtube.com/embed/BP9JrYAv5sk" },
      { title: "Earthquake Safety Lesson 3", url: "https://www.youtube.com/embed/MllUVQM3KVk" },
      { title: "Earthquake Safety Lesson 4", url: "https://www.youtube.com/embed/VSvB2US5r-4" },
      { title: "Earthquake Safety Lesson 5", url: "https://www.youtube.com/embed/t36YzCnmjEU" }
    ]
  },
  {
    id: "p-mod-3",
    title: "Flood Awareness",
    description: "Understand what floods are and how to stay safe when there's too much water around.",
    tier: "primary",
    order: 3,
    daysToComplete: 7,
    xpReward: 120,
    latePenaltyPerDay: 15,
    topics: [
      "What is a flood?",
      "Stay away from flowing water",
      "What's in an emergency kit?",
      "Listening to grown-ups during floods",
    ],
    icon: "🌊",
    videos: [
      { title: "Flood Safety Part 1", url: "https://www.youtube.com/embed/j4yuzWuMLGQ" },
      { title: "Flood Safety Part 2", url: "https://www.youtube.com/embed/9hQZCiZ21fk" },
      { title: "Flood Safety Part 3", url: "https://www.youtube.com/embed/Qe350nm_odA" },
      { title: "Flood Safety Part 4", url: "https://www.youtube.com/embed/pi_nUPcQz_A" },
      { title: "Flood Safety Part 5", url: "https://www.youtube.com/embed/faXFLV5V3SA" }
    ]
  },
  {
    id: "p-mod-4",
    title: "First Aid for Kids",
    description: "Learn simple first aid skills — how to help a friend who got hurt!",
    tier: "primary",
    order: 4,
    daysToComplete: 5,
    xpReward: 100,
    latePenaltyPerDay: 20,
    topics: [
      "Small cuts and bruises — what to do",
      "When to call a teacher or adult",
      "The first aid box — what's inside?",
      "Being a safety helper",
    ],
    icon: "🩹",
    videos: [
      { title: "First Aid Lesson 1", url: "https://www.youtube.com/embed/F4gH5xn_BpE" },
      { title: "First Aid Lesson 2", url: "https://www.youtube.com/embed/CNxNIsQ_SzY" },
      { title: "First Aid Lesson 3", url: "https://www.youtube.com/embed/0JHNvpQ9JW8" },
      { title: "First Aid Lesson 4", url: "https://www.youtube.com/embed/5E9g7VVHXeA" },
      { title: "First Aid Lesson 5", url: "https://www.youtube.com/embed/dSfXcQqLZqs" }
    ]
  },
  {
    id: "p-mod-5",
    title: "Stranger Safety & School Security",
    description: "Learn how to stay safe from strangers and what to do if something feels wrong.",
    tier: "primary",
    order: 5,
    daysToComplete: 5,
    xpReward: 100,
    latePenaltyPerDay: 20,
    topics: [
      "Who are safe adults?",
      "Never go with a stranger",
      "School lockdown — what happens?",
      "Using the buddy system",
    ],
    icon: "🛡️",
    videos: [
      { title: "Stranger Safety Lesson 1", url: "https://www.youtube.com/embed/fEtJtFEVDbI" },
      { title: "Stranger Safety Lesson 2", url: "https://www.youtube.com/embed/SY7RhBszp0k" },
      { title: "Stranger Safety Lesson 3", url: "https://www.youtube.com/embed/wELmb6srVYs" },
      { title: "Stranger Safety Lesson 4", url: "https://www.youtube.com/embed/cL8sUzl2Tdk" },
      { title: "Stranger Safety Lesson 5", url: "https://www.youtube.com/embed/D2OizPfxFvM" }
    ]
  },
  {
    id: "p-mod-6",
    title: "Emergency Numbers & Communication",
    description: "Learn important phone numbers and how to ask for help during an emergency!",
    tier: "primary",
    order: 6,
    daysToComplete: 5,
    xpReward: 100,
    latePenaltyPerDay: 20,
    topics: [
      "Dial 112 — India's emergency number",
      "How to talk to a helper on the phone",
      "Remembering your address and school name",
      "Practice: Making an emergency call",
    ],
    icon: "📞",
    videos: [
      { title: "Emergency Communication Lesson 1", url: "https://www.youtube.com/embed/jsg0AXQu5rc" },
      { title: "Emergency Communication Lesson 2", url: "https://www.youtube.com/embed/TZDrvgHkkdY" },
      { title: "Emergency Communication Lesson 3", url: "https://www.youtube.com/embed/_0b7B68swE0" },
      { title: "Emergency Communication Lesson 4", url: "https://www.youtube.com/embed/ZxzewVTDas0" },
      { title: "Emergency Communication Lesson 5", url: "https://www.youtube.com/embed/yVGFTkQ8V8E" }
    ]
  },
]

// ============================================================
// SECONDARY MODULES (Class 6–12)
// Technical, protocol-based, detailed, faster pace
// ============================================================
export const SECONDARY_MODULES: Module[] = [
  {
    id: "s-mod-1",
    title: "Fire Emergency Protocols",
    description: "Complete fire emergency response training including extinguisher types, evacuation planning, and assembly procedures.",
    tier: "secondary",
    order: 1,
    daysToComplete: 5,
    xpReward: 150,
    latePenaltyPerDay: 25,
    topics: [
      "The fire triangle: Heat, Fuel, Oxygen",
      "Types of fire extinguishers (A, B, C, D, K)",
      "Evacuation route planning and mapping",
      "Assembly point protocols and headcount",
      "Role of fire marshals in schools",
    ],
    icon: "🔥",
    videos: [
      { title: "Day 1: Fire Safety Introduction & Awareness", url: "https://www.youtube.com/embed/VBOK5chzldo" },
      { title: "Day 2: Fire Prevention & Hazard Identification", url: "https://www.youtube.com/embed/PQV71INDaqY" },
      { title: "Day 3: Fire Extinguisher Types & Usage", url: "https://www.youtube.com/embed/SkeW06LCWOU" },
      { title: "Day 4: Evacuation Planning & Drills", url: "https://www.youtube.com/embed/07xWi_iCsaU" },
      { title: "Day 5: Fire Emergency Response & Protocols", url: "https://www.youtube.com/embed/U4iBCMWC4xM" }
    ]
  },
  {
    id: "s-mod-2",
    title: "Seismic Preparedness",
    description: "In-depth earthquake preparedness — understanding seismic activity, structural safety, and emergency response protocols.",
    tier: "secondary",
    order: 2,
    daysToComplete: 7,
    xpReward: 150,
    latePenaltyPerDay: 25,
    topics: [
      "Tectonic plates and seismic zones in India",
      "Richter scale and earthquake intensity",
      "Structural vs non-structural hazards",
      "Drop-Cover-Hold-On protocol (advanced)",
      "Post-earthquake assessment and aftershock safety",
    ],
    icon: "🌍",
    videos: [
      { title: "Day 1: Understanding Earthquakes & Seismic Activity", url: "https://www.youtube.com/embed/_r_nFT2m-Vg" },
      { title: "Day 2: Tectonic Plates & Seismic Zones", url: "https://www.youtube.com/embed/7En4gayPmEU" },
      { title: "Day 3: Earthquake Intensity & Measurement", url: "https://www.youtube.com/embed/2_e0PuPl9js" },
      { title: "Day 4: Drop-Cover-Hold & Structural Safety", url: "https://www.youtube.com/embed/-MKMiFWK6Xk" },
      { title: "Day 5: Earthquake Preparedness for Schools", url: "https://www.youtube.com/embed/BLEPakj1YTY" }
    ]
  },
  {
    id: "s-mod-3",
    title: "Flood Response & Recovery",
    description: "Comprehensive flood preparedness — warning systems, evacuation, and post-flood safety protocols.",
    tier: "secondary",
    order: 3,
    daysToComplete: 7,
    xpReward: 150,
    latePenaltyPerDay: 20,
    topics: [
      "Types of floods: Flash, River, Coastal, Urban",
      "IMD warning systems and color codes",
      "Evacuation route planning for floods",
      "Water contamination and disease prevention",
      "Post-flood structural assessment basics",
    ],
    icon: "🌊",
    videos: [
      { title: "Day 1: Understanding Floods & Types of Flooding", url: "https://www.youtube.com/embed/Ed3g9WWD6xM" },
      { title: "Day 2: Flood Warning Systems & IMD Color Codes", url: "https://www.youtube.com/embed/ejTus9TDuG8" },
      { title: "Day 3: Flood Evacuation Routes & Planning", url: "https://www.youtube.com/embed/7IQTeelrDWA" },
      { title: "Day 4: Water Contamination & Disease Prevention", url: "https://www.youtube.com/embed/rV1iqRD9EKY" },
      { title: "Day 5: Post-Flood Recovery & Safety Assessment", url: "https://www.youtube.com/embed/4PXj7bOD7IY" }
    ]
  },
  {
    id: "s-mod-4",
    title: "First Aid & Medical Emergencies",
    description: "Advanced first aid training — CPR basics, wound management, and handling medical emergencies in schools.",
    tier: "secondary",
    order: 4,
    daysToComplete: 7,
    xpReward: 180,
    latePenaltyPerDay: 25,
    topics: [
      "CPR basics: Hands-only CPR steps",
      "Choking response: Heimlich maneuver",
      "Wound types and proper bandaging",
      "Fracture immobilization basics",
      "When to call 112 vs handle in-school",
      "Using an AED (if available)",
    ],
    icon: "🏥",
    videos: [
      { title: "Day 1: Introduction to First Aid & Emergency Response", url: "https://www.youtube.com/embed/BQNNOh8c8ks" },
      { title: "Day 2: CPR Basics & Hands-Only CPR", url: "https://www.youtube.com/embed/PV2LVz-ol-E" },
      { title: "Day 3: Choking Response & Heimlich Maneuver", url: "https://www.youtube.com/embed/2PJR0JyLPZY" },
      { title: "Day 4: Wound Management & Bandaging Techniques", url: "https://www.youtube.com/embed/mhBe7Q6mH3U" },
      { title: "Day 5: Fracture Care & When to Call Emergency Services", url: "https://www.youtube.com/embed/hizBdM1Ob68" }
    ]
  },
  {
    id: "s-mod-5",
    title: "Security Threats & Lockdown",
    description: "Understanding school security protocols — lockdown procedures, threat assessment, and communication during security events.",
    tier: "secondary",
    order: 5,
    daysToComplete: 5,
    xpReward: 150,
    latePenaltyPerDay: 25,
    topics: [
      "Lockdown vs Lockout vs Shelter-in-Place",
      "Barricading and concealment techniques",
      "Communication protocols during lockdown",
      "Reporting suspicious activity",
      "Post-incident procedures",
    ],
    icon: "🔒",
    videos: [
      { title: "Day 1: Understanding Security Threats & Awareness", url: "https://www.youtube.com/embed/pDZGYFLC-pM" },
      { title: "Day 2: Lockdown vs Lockout vs Shelter-in-Place", url: "https://www.youtube.com/embed/Uwe5LoDYaiw" },
      { title: "Day 3: Barricading & Concealment Techniques", url: "https://www.youtube.com/embed/PDe04ztK9MQ" },
      { title: "Day 4: Communication Protocols During Lockdown", url: "https://www.youtube.com/embed/GcWTzkm5N34" },
      { title: "Day 5: Reporting Suspicious Activity & Post-Incident Procedures", url: "https://www.youtube.com/embed/h6WCW9dafpI" }
    ]
  },
  {
    id: "s-mod-6",
    title: "Chemical & Industrial Hazards",
    description: "Safety protocols for chemical spills, gas leaks, and industrial hazards near schools — NDMA guidelines.",
    tier: "secondary",
    order: 6,
    daysToComplete: 7,
    xpReward: 180,
    latePenaltyPerDay: 20,
    topics: [
      "Common chemical hazards in school labs",
      "Gas leak detection and response",
      "HAZMAT awareness basics",
      "Decontamination procedures",
      "NDMA guidelines for chemical disasters",
      "Bhopal Gas Tragedy: Lessons learned",
    ],
    icon: "⚗️",
    videos: [
      { title: "Day 1: Chemical Hazards in School Labs & Safety Rules", url: "https://www.youtube.com/embed/VRWRmIEHr3A" },
      { title: "Day 2: Gas Leak Detection & Response Protocols", url: "https://www.youtube.com/embed/bxdm3JlN3lM" },
      { title: "Day 3: HAZMAT Awareness & Industrial Hazards", url: "https://www.youtube.com/embed/UbUXpMl1z_g" },
      { title: "Day 4: Decontamination & Emergency Procedures", url: "https://www.youtube.com/embed/IUZgLtuT4JQ" },
      { title: "Day 5: Bhopal Gas Tragedy — Lessons Learned & NDMA Guidelines", url: "https://www.youtube.com/embed/CZerD8qtMMw" }
    ]
  },
]

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get modules by tier
 */
export function getModulesByTier(tier: Tier): Module[] {
  return tier === "primary" ? PRIMARY_MODULES : SECONDARY_MODULES
}

/**
 * Get a specific module by ID
 */
/** XP for each daily video watched. 5 videos pay 50 XP; the quiz pass pays the rest of the module's xpReward. */
export const VIDEO_XP = 10

const MODULE_CATEGORY: Record<string, string> = {
  "p-mod-1": "Fire Safety", "s-mod-1": "Fire Safety",
  "p-mod-2": "Earthquake Safety", "s-mod-2": "Earthquake Safety",
  "p-mod-3": "Flood Safety", "s-mod-3": "Flood Safety",
  "p-mod-4": "First Aid", "s-mod-4": "First Aid",
  "p-mod-5": "School Security", "s-mod-5": "School Security",
  "p-mod-6": "Emergency Communication",
  "s-mod-6": "Chemical Hazards",
}

/** Short topic label for a module, e.g. "Fire Safety" */
export function getModuleCategory(moduleId: string): string {
  return MODULE_CATEGORY[moduleId] ?? "Safety Training"
}

export function getModuleById(moduleId: string): Module | undefined {
  return [...PRIMARY_MODULES, ...SECONDARY_MODULES].find(m => m.id === moduleId)
}

/**
 * Get the next module in sequence for a given tier
 */
export function getNextModule(currentOrder: number, tier: Tier): Module | null {
  const modules = getModulesByTier(tier)
  return modules.find(m => m.order === currentOrder + 1) || null
}

/**
 * Get module by order number and tier
 */
export function getModuleByOrder(order: number, tier: Tier): Module | undefined {
  const modules = getModulesByTier(tier)
  return modules.find(m => m.order === order)
}

/**
 * Get total number of modules for a tier
 */
export function getTotalModules(tier: Tier): number {
  return getModulesByTier(tier).length
}

/**
 * Calculate total possible XP for a tier (if all modules completed on time)
 */
export function getTotalPossibleXP(tier: Tier): number {
  return getModulesByTier(tier).reduce((sum, m) => sum + m.xpReward, 0)
}
