// Learning Path data model and localStorage persistence for Safety Hero Pathway

export type LessonType = 'quiz' | 'safe-spot' | 'dos-donts' | 'matching'

export type Lesson = {
  id: string
  title: string
  type: LessonType
  disasterType: string
  description: string
}

export type Unit = {
  id: string
  title: string
  emoji: string
  color: string
  gradient: string
  lessons: Lesson[]
}

export type UserProgress = {
  completedLessons: string[]
  xp: number
  streak: number
  lastPlayedDate: string
  hearts: number
  maxHearts: number
}

// === UNITS & LESSONS ===

export const units: Unit[] = [
  {
    id: "unit-1",
    title: "Earthquake Basics",
    emoji: "🌍",
    color: "text-blue-600",
    gradient: "from-blue-400 to-blue-600",
    lessons: [
      { id: "eq-1", title: "Earthquake Safety Quiz", type: "quiz", disasterType: "Earthquake", description: "Test your knowledge about earthquake response" },
      { id: "eq-2", title: "Find the Safe Spot", type: "safe-spot", disasterType: "Earthquake", description: "Can you spot the safest place during an earthquake?" },
      { id: "eq-3", title: "Do or Don't?", type: "dos-donts", disasterType: "Earthquake", description: "Classify earthquake safety actions" },
      { id: "eq-4", title: "Safety Match", type: "matching", disasterType: "Earthquake", description: "Match earthquake safety items to their purpose" },
    ],
  },
  {
    id: "unit-2",
    title: "Fire Safety",
    emoji: "🔥",
    color: "text-red-600",
    gradient: "from-red-400 to-orange-500",
    lessons: [
      { id: "fr-1", title: "Fire Response Quiz", type: "quiz", disasterType: "Fire Emergency", description: "How well do you handle fire emergencies?" },
      { id: "fr-2", title: "Find the Safe Spot", type: "safe-spot", disasterType: "Fire Emergency", description: "Choose the safest spot during a fire" },
      { id: "fr-3", title: "Do or Don't?", type: "dos-donts", disasterType: "Fire Emergency", description: "Classify fire safety actions" },
      { id: "fr-4", title: "Safety Match", type: "matching", disasterType: "Fire Emergency", description: "Match fire equipment to their use" },
    ],
  },
  {
    id: "unit-3",
    title: "Flood Response",
    emoji: "🌊",
    color: "text-cyan-600",
    gradient: "from-cyan-400 to-blue-500",
    lessons: [
      { id: "fl-1", title: "Flood Safety Quiz", type: "quiz", disasterType: "Flood", description: "Test your flood preparedness knowledge" },
      { id: "fl-2", title: "Find the Safe Spot", type: "safe-spot", disasterType: "Flood", description: "Where is safest during a flood?" },
      { id: "fl-3", title: "Do or Don't?", type: "dos-donts", disasterType: "Flood", description: "Classify flood safety actions" },
    ],
  },
  {
    id: "unit-4",
    title: "First Aid Essentials",
    emoji: "🏥",
    color: "text-emerald-600",
    gradient: "from-emerald-400 to-green-500",
    lessons: [
      { id: "fa-1", title: "First Aid Quiz", type: "quiz", disasterType: "Medical Emergency", description: "Test your first aid knowledge" },
      { id: "fa-2", title: "Do or Don't?", type: "dos-donts", disasterType: "Medical Emergency", description: "Classify first aid actions" },
      { id: "fa-3", title: "Equipment Match", type: "matching", disasterType: "Medical Emergency", description: "Match first aid items to their purpose" },
    ],
  },
  {
    id: "unit-5",
    title: "General Safety",
    emoji: "🛡️",
    color: "text-purple-600",
    gradient: "from-purple-400 to-violet-500",
    lessons: [
      { id: "gs-1", title: "Campus Safety Quiz", type: "quiz", disasterType: "General Safety", description: "General campus safety awareness" },
      { id: "gs-2", title: "Do or Don't?", type: "dos-donts", disasterType: "General Safety", description: "Classify general safety actions" },
    ],
  },
]

// === DO'S AND DON'TS DATA ===
export type DosDontsItem = { statement: string; isDo: boolean; explanation: string }

export const dosDontsData: Record<string, DosDontsItem[]> = {
  "Earthquake": [
    { statement: "Drop, Cover, and Hold On under a sturdy desk", isDo: true, explanation: "This is the standard earthquake safety procedure" },
    { statement: "Run outside immediately during shaking", isDo: false, explanation: "Running during shaking is dangerous — wait until shaking stops" },
    { statement: "Stay away from windows and heavy furniture", isDo: true, explanation: "Glass can shatter and furniture can fall during an earthquake" },
    { statement: "Use the elevator to evacuate faster", isDo: false, explanation: "Elevators can malfunction during earthquakes — always use stairs" },
    { statement: "Move to an open area after shaking stops", isDo: true, explanation: "Open areas are safer from falling debris" },
    { statement: "Stand in a doorway for protection", isDo: false, explanation: "Modern doorways are not stronger than other parts of the building" },
    { statement: "Keep emergency supplies in your bag", isDo: true, explanation: "Water, snacks, and a flashlight can be lifesaving" },
    { statement: "Ignore aftershocks since the main quake is over", isDo: false, explanation: "Aftershocks can be strong and cause additional damage" },
  ],
  "Fire Emergency": [
    { statement: "Crawl low under smoke to breathe cleaner air", isDo: true, explanation: "Smoke rises, so cleaner air is near the floor" },
    { statement: "Open doors quickly to check for fire", isDo: false, explanation: "Feel doors first — opening a hot door can cause a backdraft" },
    { statement: "Use a wet cloth to cover your nose and mouth", isDo: true, explanation: "This filters out some smoke particles" },
    { statement: "Go back to collect personal belongings", isDo: false, explanation: "Your life is more valuable than any belongings" },
    { statement: "Know the location of fire extinguishers", isDo: true, explanation: "Knowing where they are saves critical time" },
    { statement: "Use the elevator during a fire emergency", isDo: false, explanation: "Elevators can stop working or open on fire floors" },
    { statement: "Stop, Drop, and Roll if clothes catch fire", isDo: true, explanation: "This smothers the flames" },
    { statement: "Break windows for ventilation during fire", isDo: false, explanation: "This can feed the fire with more oxygen" },
  ],
  "Flood": [
    { statement: "Move to higher ground immediately", isDo: true, explanation: "Water flows downhill — higher ground is safer" },
    { statement: "Walk through floodwater to save time", isDo: false, explanation: "Just 6 inches of moving water can knock you down" },
    { statement: "Avoid contact with floodwater", isDo: true, explanation: "Floodwater can carry disease, chemicals, and debris" },
    { statement: "Drive through flooded roads if water looks shallow", isDo: false, explanation: "Turn around, don't drown — water depth is deceptive" },
    { statement: "Store important documents in waterproof bags", isDo: true, explanation: "Protecting documents helps with recovery after flooding" },
    { statement: "Touch electrical equipment during flooding", isDo: false, explanation: "Water conducts electricity — extreme electrocution risk" },
  ],
  "Medical Emergency": [
    { statement: "Call emergency services (108) first", isDo: true, explanation: "Professional help should be summoned immediately" },
    { statement: "Move an injured person without checking for spinal injury", isDo: false, explanation: "Moving can worsen spinal injuries" },
    { statement: "Apply pressure to stop bleeding", isDo: true, explanation: "Direct pressure is the first step for wound management" },
    { statement: "Give water to an unconscious person", isDo: false, explanation: "They could choke — never give liquids to unconscious people" },
    { statement: "Learn CPR and basic first aid", isDo: true, explanation: "These skills can save lives in emergencies" },
    { statement: "Remove objects stuck in wounds", isDo: false, explanation: "This can cause more bleeding — leave for doctors" },
  ],
  "General Safety": [
    { statement: "Know your school's evacuation routes", isDo: true, explanation: "Familiarity with routes saves time during emergencies" },
    { statement: "Block fire exits with furniture for extra space", isDo: false, explanation: "Fire exits must always remain clear and accessible" },
    { statement: "Participate in regular safety drills", isDo: true, explanation: "Practice makes responses automatic in real emergencies" },
    { statement: "Ignore safety announcements over the PA system", isDo: false, explanation: "Announcements may contain critical safety information" },
    { statement: "Keep a list of emergency contact numbers", isDo: true, explanation: "Quick access to contacts is vital during emergencies" },
    { statement: "Prop open fire doors for convenience", isDo: false, explanation: "Fire doors prevent smoke and fire spread" },
  ],
}

// === MATCHING DATA ===
export type MatchingPair = { item: string; match: string }

export const matchingData: Record<string, MatchingPair[]> = {
  "Earthquake": [
    { item: "Emergency kit", match: "Contains water, food, flashlight" },
    { item: "Sturdy desk", match: "Drop, Cover, Hold On shelter" },
    { item: "Open field", match: "Safest outdoor evacuation point" },
    { item: "Emergency whistle", match: "Signal for help under debris" },
  ],
  "Fire Emergency": [
    { item: "Fire extinguisher", match: "Put out small fires" },
    { item: "Smoke detector", match: "Early warning of fire" },
    { item: "Fire blanket", match: "Smother small fires or wrap around person" },
    { item: "Assembly point", match: "Safe meeting area after evacuation" },
  ],
  "Medical Emergency": [
    { item: "Bandage", match: "Stop bleeding from wounds" },
    { item: "AED device", match: "Restart heart during cardiac arrest" },
    { item: "Antiseptic wipes", match: "Clean wounds to prevent infection" },
    { item: "Triangular sling", match: "Support injured arm or shoulder" },
  ],
}

// ============================================================
// SECONDARY (Class 6–12) UNITS & LESSONS
// Progressively harder: difficulty increases from unit 1 → 7
// Uses existing lesson types: quiz, safe-spot, dos-donts, matching
// ============================================================

export const secondaryUnits: Unit[] = [
  {
    id: "sec-unit-1",
    title: "Advanced Earthquake Response",
    emoji: "🌍",
    color: "text-blue-700",
    gradient: "from-blue-500 to-indigo-600",
    lessons: [
      { id: "seq-1", title: "Seismic Science Quiz", type: "quiz", disasterType: "Earthquake Advanced", description: "Test your knowledge of tectonic plates, seismic zones, and Richter scale" },
      { id: "seq-2", title: "Find the Safe Spot", type: "safe-spot", disasterType: "Earthquake Advanced", description: "Identify the safest location in complex multi-floor scenarios" },
      { id: "seq-3", title: "Protocol Check", type: "dos-donts", disasterType: "Earthquake Advanced", description: "Classify advanced earthquake safety protocols" },
      { id: "seq-4", title: "Equipment Match", type: "matching", disasterType: "Earthquake Advanced", description: "Match seismic equipment to their functions" },
    ],
  },
  {
    id: "sec-unit-2",
    title: "Fire Emergency Protocols",
    emoji: "🔥",
    color: "text-red-700",
    gradient: "from-red-500 to-orange-600",
    lessons: [
      { id: "sfr-1", title: "Fire Science Quiz", type: "quiz", disasterType: "Fire Advanced", description: "Test your understanding of fire triangle, extinguisher types, and PASS technique" },
      { id: "sfr-2", title: "Find the Safe Spot", type: "safe-spot", disasterType: "Fire Advanced", description: "Choose the safest position during complex fire scenarios" },
      { id: "sfr-3", title: "Protocol Check", type: "dos-donts", disasterType: "Fire Advanced", description: "Classify fire emergency protocols and evacuation procedures" },
      { id: "sfr-4", title: "Equipment Match", type: "matching", disasterType: "Fire Advanced", description: "Match fire safety equipment to their correct application" },
    ],
  },
  {
    id: "sec-unit-3",
    title: "Flood Disaster Management",
    emoji: "🌊",
    color: "text-cyan-700",
    gradient: "from-cyan-500 to-blue-600",
    lessons: [
      { id: "sfl-1", title: "Flood Science Quiz", type: "quiz", disasterType: "Flood Advanced", description: "Test your knowledge of flood types, warning systems, and evacuation" },
      { id: "sfl-2", title: "Find the Safe Spot", type: "safe-spot", disasterType: "Flood Advanced", description: "Navigate complex flood scenarios and identify safe zones" },
      { id: "sfl-3", title: "Protocol Check", type: "dos-donts", disasterType: "Flood Advanced", description: "Classify flood response protocols including post-flood safety" },
    ],
  },
  {
    id: "sec-unit-4",
    title: "Advanced First Aid & CPR",
    emoji: "🏥",
    color: "text-emerald-700",
    gradient: "from-emerald-500 to-green-600",
    lessons: [
      { id: "sfa-1", title: "Medical Emergency Quiz", type: "quiz", disasterType: "Medical Advanced", description: "CPR rates, AED usage, tourniquet protocol, and Heimlich maneuver" },
      { id: "sfa-2", title: "Protocol Check", type: "dos-donts", disasterType: "Medical Advanced", description: "Classify advanced first aid and trauma response actions" },
      { id: "sfa-3", title: "Equipment Match", type: "matching", disasterType: "Medical Advanced", description: "Match medical equipment to their correct emergency use" },
    ],
  },
  {
    id: "sec-unit-5",
    title: "Security & Threat Response",
    emoji: "🔒",
    color: "text-amber-700",
    gradient: "from-amber-500 to-orange-600",
    lessons: [
      { id: "sst-1", title: "Security Protocols Quiz", type: "quiz", disasterType: "Security Advanced", description: "Lockdown vs lockout, Run-Hide-Fight, and communication protocols" },
      { id: "sst-2", title: "Find the Safe Spot", type: "safe-spot", disasterType: "Security Advanced", description: "Identify the safest position during a security threat scenario" },
      { id: "sst-3", title: "Protocol Check", type: "dos-donts", disasterType: "Security Advanced", description: "Classify security response actions during threat scenarios" },
    ],
  },
  {
    id: "sec-unit-6",
    title: "Chemical & HAZMAT Safety",
    emoji: "⚗️",
    color: "text-violet-700",
    gradient: "from-violet-500 to-purple-600",
    lessons: [
      { id: "sch-1", title: "Chemical Safety Quiz", type: "quiz", disasterType: "Chemical Advanced", description: "HAZMAT awareness, lab safety protocols, and decontamination" },
      { id: "sch-2", title: "Protocol Check", type: "dos-donts", disasterType: "Chemical Advanced", description: "Classify chemical safety and HAZMAT response protocols" },
      { id: "sch-3", title: "Equipment Match", type: "matching", disasterType: "Chemical Advanced", description: "Match HAZMAT equipment and chemicals to their safety protocols" },
    ],
  },
  {
    id: "sec-unit-7",
    title: "Disaster Leadership & Communication",
    emoji: "📡",
    color: "text-rose-700",
    gradient: "from-rose-500 to-pink-600",
    lessons: [
      { id: "sdl-1", title: "Leadership Quiz", type: "quiz", disasterType: "Leadership Advanced", description: "Incident command, triage, communication chains, and NDMA protocols" },
      { id: "sdl-2", title: "Protocol Check", type: "dos-donts", disasterType: "Leadership Advanced", description: "Classify disaster leadership and communication protocols" },
      { id: "sdl-3", title: "Equipment Match", type: "matching", disasterType: "Leadership Advanced", description: "Match disaster management roles to their responsibilities" },
    ],
  },
]

// === SECONDARY DO'S AND DON'TS DATA (Harder, protocol-based) ===
export const secondaryDosDontsData: Record<string, DosDontsItem[]> = {
  "Earthquake Advanced": [
    { statement: "Check for gas leaks by smell after earthquake — never use a lighter to find leaks", isDo: true, explanation: "Gas leaks are common post-earthquake; using flames can cause explosions" },
    { statement: "Use the Triangle of Life method instead of Drop-Cover-Hold", isDo: false, explanation: "The Triangle of Life is NOT recommended by FEMA, Red Cross, or NDMA — Drop-Cover-Hold is the proven protocol" },
    { statement: "Secure heavy bookshelves and equipment to walls as a preventive measure", isDo: true, explanation: "Non-structural hazards cause the majority of earthquake injuries in moderate quakes" },
    { statement: "Run to the nearest stairwell during shaking in a multi-story building", isDo: false, explanation: "Stairwells can collapse or become blocked — Drop-Cover-Hold until shaking stops, then evacuate" },
    { statement: "After the main quake, prepare for aftershocks which can sometimes exceed the original magnitude", isDo: true, explanation: "Aftershock sequences can continue for weeks and occasionally exceed the mainshock" },
    { statement: "Assume the building is structurally sound if there are no visible cracks", isDo: false, explanation: "Internal structural damage may not be visible — always get professional assessment before re-entry" },
    { statement: "Keep shoes near your bed in earthquake-prone zones for protection from broken glass", isDo: true, explanation: "Shattered glass from windows is one of the most common injury sources post-earthquake" },
    { statement: "Drive faster to get away from the earthquake zone", isDo: false, explanation: "Pull over safely and stop — driving during an earthquake is dangerous due to road damage and debris" },
    { statement: "Know the seismic zone classification of your region (Zone I-V in India)", isDo: true, explanation: "Understanding your risk zone helps in preparedness planning — Zone V is highest risk" },
    { statement: "Evacuate a tsunami-risk coastal area immediately after a strong earthquake, without waiting for official warnings", isDo: true, explanation: "A strong coastal earthquake IS your tsunami warning — higher ground immediately" },
  ],
  "Fire Advanced": [
    { statement: "Use the PASS technique: Pull pin, Aim at base, Squeeze handle, Sweep side to side", isDo: true, explanation: "PASS is the standard protocol for portable fire extinguisher operation" },
    { statement: "Open a hot door during a fire to check the other side quickly", isDo: false, explanation: "This can cause a backdraft — a sudden explosive ignition when oxygen enters a superheated room" },
    { statement: "Assign fire marshals for each floor to ensure complete headcount at assembly points", isDo: true, explanation: "Fire marshals ensure no one is left behind and provide accurate reports to firefighters" },
    { statement: "Use a Type A (water) extinguisher on an electrical fire", isDo: false, explanation: "Water conducts electricity — use CO2 (Type C) or dry chemical extinguishers for electrical fires" },
    { statement: "Map and memorize at least two evacuation routes from every room you regularly use", isDo: true, explanation: "Your primary exit may be blocked — always have an alternative escape route" },
    { statement: "Re-enter a burning building to rescue belongings after evacuating", isDo: false, explanation: "Flashover can occur in under 5 minutes — re-entry is extremely dangerous even for trained firefighters" },
    { statement: "Conduct fire drills at least once per semester and evaluate response times", isDo: true, explanation: "Regular drills make responses automatic — drill-trained groups evacuate 50% faster" },
    { statement: "Use the elevator for faster evacuation from upper floors during a fire", isDo: false, explanation: "Elevators can stop on fire floors, fill with smoke, or lose power — always use stairs" },
    { statement: "Close classroom doors behind you when evacuating to slow fire spread", isDo: true, explanation: "A closed door can hold back fire for 20+ minutes, giving more time for others to evacuate" },
    { statement: "Attempt to fight a fire that is taller than you with a portable extinguisher", isDo: false, explanation: "If the fire is larger than a waste bin or above head height, evacuate immediately and call 112" },
  ],
  "Flood Advanced": [
    { statement: "Turn around, don't drown — never attempt to cross flooded roads even in a vehicle", isDo: true, explanation: "12-24 inches of moving water can float most vehicles; 6 inches can knock a person down" },
    { statement: "Touch electrical equipment or switchboards in a flooded building", isDo: false, explanation: "Water and electricity create fatal electrocution risk — cut mains only if standing on dry surface" },
    { statement: "Understand IMD color-coded warnings: Orange means Be Prepared, Red means Take Action", isDo: true, explanation: "IMD's 4-tier warning system (Green, Yellow, Orange, Red) guides preparedness levels" },
    { statement: "Drink tap water immediately after floodwaters recede", isDo: false, explanation: "Water supply is likely contaminated with sewage — boil water or use purification tablets" },
    { statement: "Store emergency supplies on upper floors or elevated platforms in flood-prone areas", isDo: true, explanation: "Ground-level storage gets destroyed first — elevate medicines, documents, and food supplies" },
    { statement: "Swim through floodwater to reach safety faster since you are a good swimmer", isDo: false, explanation: "Floodwater contains hidden debris, chemicals, open manholes, and carries diseases" },
    { statement: "Document damage with photos before cleanup for insurance and relief claims", isDo: true, explanation: "Insurance and NDRF relief require evidence of damage — photograph everything before cleanup" },
    { statement: "Return home immediately after flood levels drop to start cleaning", isDo: false, explanation: "Wait for official all-clear — weakened structures can collapse, and secondary flooding may occur" },
  ],
  "Medical Advanced": [
    { statement: "Perform Hands-Only CPR at 100-120 compressions per minute on an unresponsive adult", isDo: true, explanation: "Pushing to the beat of Stayin Alive gives approximately 100-120 bpm — the optimal rate" },
    { statement: "Move a person with a suspected spinal injury to make them comfortable", isDo: false, explanation: "Spinal movement can cause permanent paralysis — immobilize the head/neck and wait for paramedics" },
    { statement: "Apply a tourniquet high and tight on a limb with life-threatening bleeding that won't stop", isDo: true, explanation: "Stop the Bleed protocol: tourniquets save lives in severe extremity hemorrhage within minutes" },
    { statement: "Remove an object impaled in a wound to stop the bleeding", isDo: false, explanation: "The object may be plugging a blood vessel — removing it can cause fatal hemorrhage" },
    { statement: "Use an AED as soon as available — it will analyze the rhythm and only shock if needed", isDo: true, explanation: "AEDs are designed for untrained users — every minute without defibrillation reduces survival by 10%" },
    { statement: "Give aspirin to someone having a suspected heart attack (if not allergic)", isDo: true, explanation: "Aspirin thins blood and can limit damage — recommended by AHA while waiting for emergency services" },
    { statement: "Tilt a seizure patient's head back and put something in their mouth", isDo: false, explanation: "Never put objects in a seizing person's mouth — place them on their side and protect from injury" },
    { statement: "For a chemical burn, flush with cool running water for at least 20 minutes", isDo: true, explanation: "Continuous flushing dilutes and removes the chemical — the most critical first intervention" },
  ],
  "Security Advanced": [
    { statement: "In an active threat, prioritize RUN first — evacuate if there is a safe escape path", isDo: true, explanation: "Evacuating is statistically the safest option if a clear path exists. Leave belongings, hands visible" },
    { statement: "During a lockdown, check the hallway to see what is happening before hiding", isDo: false, explanation: "Opening doors increases exposure risk — lock, barricade, stay low and out of sight" },
    { statement: "Silence your phone completely (including vibration) during a lockdown", isDo: true, explanation: "A vibrating phone on a hard surface can be heard and give away your location" },
    { statement: "Evacuate immediately when the fire alarm sounds during an active lockdown", isDo: false, explanation: "Intruders may pull fire alarms to draw people into hallways — stay in lockdown unless you see fire" },
    { statement: "Report suspicious online threats against the school to adults and police immediately", isDo: true, explanation: "See Something, Say Something — early reporting of online threats has prevented numerous incidents" },
    { statement: "Assume a lockout (external threat) means you can relax inside the building", isDo: false, explanation: "During a lockout, exterior doors are secured — remain vigilant, the threat is nearby" },
    { statement: "If forced to FIGHT as a last resort, use improvised tools and act as a team", isDo: true, explanation: "Fighting is the absolute last resort — but coordinated action has stopped active threats" },
    { statement: "Post real-time updates on social media during an active threat at your school", isDo: false, explanation: "Live-posting reveals your location and may cause panic — communicate only with emergency services" },
  ],
  "Chemical Advanced": [
    { statement: "If you smell a gas leak (rotten egg odor), evacuate without switching any electrical devices", isDo: true, explanation: "Electrical sparks from switches can ignite gas — evacuate silently and report from a safe distance" },
    { statement: "Use a lighter or match to check for a gas leak", isDo: false, explanation: "Open flames near gas leaks cause explosions — this is extremely dangerous" },
    { statement: "During an external chemical release, Shelter-in-Place: seal windows and turn off HVAC", isDo: true, explanation: "Sealing the building prevents toxic outdoor air from entering — standard HAZMAT SIP protocol" },
    { statement: "Flush chemical splashes from eyes for only 2-3 minutes since more would damage the eyes", isDo: false, explanation: "International protocol requires 15-20 minutes of continuous flushing" },
    { statement: "Know the location of eyewash stations, safety showers, and fume hoods in your lab", isDo: true, explanation: "In a chemical emergency, seconds matter — you must know equipment locations without searching" },
    { statement: "Mix unknown chemicals together to see what happens for a science experiment", isDo: false, explanation: "Mixing chemicals without knowledge can produce toxic gases, explosions, or corrosive reactions" },
    { statement: "Read Safety Data Sheets (SDS) before handling any unfamiliar chemical in the lab", isDo: true, explanation: "SDS contains critical info: hazards, PPE requirements, first aid, and spill procedures" },
    { statement: "Clean up a large chemical spill in the lab yourself to avoid getting in trouble", isDo: false, explanation: "Large spills require trained HAZMAT response — evacuate and let professionals handle it" },
  ],
  "Leadership Advanced": [
    { statement: "Establish a clear chain of command before a disaster — everyone should know their role", isDo: true, explanation: "Incident Command System requires pre-defined roles: IC, Safety Officer, Operations" },
    { statement: "Make important decisions alone during a crisis to save time", isDo: false, explanation: "Collaborative decision-making reduces errors — consult with team leads when possible" },
    { statement: "Use the START triage system to rapidly categorize casualties by severity", isDo: true, explanation: "START uses 30-2-Can Do: 30 respirations/min, 2-second capillary refill, can follow commands" },
    { statement: "Share unverified information to keep everyone informed during a crisis", isDo: false, explanation: "Rumors cause panic — only share verified, official information through proper channels" },
    { statement: "Conduct regular mock drills and After-Action Reviews to improve response", isDo: true, explanation: "AARs identify gaps between planned and actual response — continuous improvement saves lives" },
    { statement: "Assume the crisis is over when the immediate threat has passed", isDo: false, explanation: "Post-crisis includes medical treatment, psychological first aid, damage assessment, and recovery" },
    { statement: "Know the NDMA helpline (1078) and NDRF activation protocols for your state", isDo: true, explanation: "NDMA coordinates all disaster response in India — 1078 is the 24/7 helpline" },
    { statement: "Prioritize saving property over saving lives during a disaster", isDo: false, explanation: "Life safety is ALWAYS the top priority — property can be replaced, lives cannot" },
  ],
}

// === SECONDARY MATCHING DATA (Harder, technical) ===
export const secondaryMatchingData: Record<string, MatchingPair[]> = {
  "Earthquake Advanced": [
    { item: "Seismograph", match: "Instrument that records ground movement" },
    { item: "Richter Scale", match: "Measures earthquake magnitude logarithmically" },
    { item: "P-waves", match: "Primary waves that arrive first — compressional" },
    { item: "Seismic Zone V", match: "Highest earthquake risk zone in India (BIS)" },
    { item: "Aftershock", match: "Smaller quakes following the mainshock" },
  ],
  "Fire Advanced": [
    { item: "CO2 Extinguisher (Type C)", match: "Electrical fires — displaces oxygen safely" },
    { item: "Fire Triangle", match: "Heat + Fuel + Oxygen = Fire" },
    { item: "PASS Technique", match: "Pull, Aim, Squeeze, Sweep" },
    { item: "Backdraft", match: "Explosive ignition from oxygen entering hot room" },
    { item: "Fire Marshal", match: "Ensures floor evacuation and headcount" },
  ],
  "Medical Advanced": [
    { item: "AED", match: "Delivers shock to restore heart rhythm" },
    { item: "Heimlich Maneuver", match: "Abdominal thrusts to clear airway obstruction" },
    { item: "Tourniquet", match: "Stops life-threatening limb bleeding" },
    { item: "Recovery Position", match: "Side-lying for unconscious breathing patient" },
    { item: "100-120 BPM", match: "Optimal chest compression rate for CPR" },
  ],
  "Chemical Advanced": [
    { item: "Safety Data Sheet (SDS)", match: "Document listing chemical hazards and first aid" },
    { item: "Fume Hood", match: "Ventilated enclosure for volatile chemicals" },
    { item: "Eyewash Station", match: "15-20 minute flush for chemical eye exposure" },
    { item: "HAZMAT Diamond", match: "Color-coded label: health/fire/reactivity/special" },
    { item: "Methyl Isocyanate", match: "Chemical involved in the 1984 Bhopal disaster" },
  ],
  "Leadership Advanced": [
    { item: "ICS (Incident Command System)", match: "Standardized disaster response management" },
    { item: "START Triage", match: "Rapid categorization of casualties by severity" },
    { item: "NDMA", match: "National Disaster Management Authority of India" },
    { item: "After-Action Review (AAR)", match: "Post-incident analysis to improve response" },
    { item: "NDRF", match: "National Disaster Response Force — specialized rescue" },
  ],
}

// === SAFE-SPOT SCENARIOS (Multi-factor) ===
export type SafeSpotOption = {
  label: string
  correct: boolean
  explanation: string
}

export type SafeSpotScenario = {
  scenario: string
  options: SafeSpotOption[]
}

export const safeSpotData: Record<string, SafeSpotScenario[]> = {
  // Primary safe-spot scenarios (simpler)
  "Earthquake": [
    {
      scenario: "You are in a classroom when an earthquake starts. Where is the safest spot?",
      options: [
        { label: "Under a sturdy desk, holding on", correct: true, explanation: "A sturdy desk protects you from falling debris" },
        { label: "Next to the window", correct: false, explanation: "Windows can shatter and cause serious injury" },
        { label: "Standing in the doorway", correct: false, explanation: "Doorways are not safer in modern buildings" },
        { label: "Running into the hallway", correct: false, explanation: "Hallways have falling ceiling tiles and no cover" },
      ]
    },
  ],
  "Fire Emergency": [
    {
      scenario: "Smoke is filling the hallway. Where is the safest position?",
      options: [
        { label: "Crawling low near the floor toward the exit", correct: true, explanation: "Smoke rises — breathable air is near the floor" },
        { label: "Standing upright and running fast", correct: false, explanation: "Standing means you inhale toxic smoke which can cause unconsciousness" },
        { label: "Opening a window and leaning out", correct: false, explanation: "Opening windows can feed the fire with oxygen" },
        { label: "Hiding in a closet", correct: false, explanation: "Closets trap you — firefighters may not find you" },
      ]
    },
  ],
  "Flood": [
    {
      scenario: "Water is rising around your school. Where should you go?",
      options: [
        { label: "To the highest floor of the building", correct: true, explanation: "Higher ground is safest — water cannot reach upper floors as quickly" },
        { label: "To the basement", correct: false, explanation: "Basements flood first and can trap you underwater" },
        { label: "Walk through the water to reach home", correct: false, explanation: "Even ankle-deep moving water can knock you off your feet" },
        { label: "Stay on the ground floor and wait", correct: false, explanation: "Ground floors can flood rapidly — always move up, not out" },
      ]
    },
  ],
  // Secondary safe-spot scenarios (complex multi-factor)
  "Earthquake Advanced": [
    {
      scenario: "You are in a 5-story school on the 3rd floor. The earthquake stopped but you smell gas. What is the safest action?",
      options: [
        { label: "Evacuate via stairs without touching electrical switches; report gas from outside", correct: true, explanation: "Gas leaks + electrical sparks = explosion. Evacuate calmly via stairs" },
        { label: "Open all windows to ventilate the gas, then wait inside", correct: false, explanation: "If structural damage exists, the building may not be safe" },
        { label: "Use the elevator since shaking has stopped", correct: false, explanation: "Post-earthquake elevators may be damaged" },
        { label: "Turn on the exhaust fan to clear the gas", correct: false, explanation: "Any electrical switch near a gas leak can create a spark" },
      ]
    },
    {
      scenario: "During an earthquake you are in the school computer lab. Monitors are falling. Where is safest?",
      options: [
        { label: "Under the heaviest desk, away from shelves and monitors", correct: true, explanation: "Heavy desks protect from falling equipment" },
        { label: "Against the wall between two desks", correct: false, explanation: "Monitors can slide off and hit you from above" },
        { label: "Running to the door to escape", correct: false, explanation: "Moving during shaking is dangerous due to falling objects" },
        { label: "Standing under the door frame", correct: false, explanation: "Modern doorframes are no stronger than walls" },
      ]
    },
  ],
  "Fire Advanced": [
    {
      scenario: "A chemical fire breaks out in the chemistry lab. The fire is waist-high. What should you do?",
      options: [
        { label: "Evacuate immediately — too large for a portable extinguisher and involves chemicals", correct: true, explanation: "Chemical fires are unpredictable. If fire is above desk height, evacuate" },
        { label: "Grab the nearest fire extinguisher", correct: false, explanation: "A waist-high chemical fire exceeds portable extinguisher capacity" },
        { label: "Pour water on the chemical fire", correct: false, explanation: "Water on metal or oil fires can cause explosions" },
        { label: "Cover the fire with your lab coat", correct: false, explanation: "Lab coats may be contaminated and could catch fire" },
      ]
    },
    {
      scenario: "You touch a closed door and it feels hot. What is the safest action?",
      options: [
        { label: "Keep door shut, seal gaps with wet cloth, signal from window", correct: true, explanation: "A hot door means fire on the other side. Opening it causes backdraft" },
        { label: "Open the door slowly to check", correct: false, explanation: "Opening introduces oxygen to superheated gases — backdraft" },
        { label: "Break the door window to check the hallway", correct: false, explanation: "Breaking glass lets smoke and heat rush in" },
        { label: "Open the door and run through quickly", correct: false, explanation: "The hallway may be engulfed in flames" },
      ]
    },
  ],
  "Flood Advanced": [
    {
      scenario: "Urban monsoon flooding: 2 feet of water outside, power lines are down nearby. Where is safest?",
      options: [
        { label: "Stay inside on upper floor, away from electrical systems, until rescue", correct: true, explanation: "Downed power lines energize floodwater — staying elevated avoids drowning and electrocution" },
        { label: "Wade through water to higher ground across the street", correct: false, explanation: "Downed power lines + floodwater = fatal electrocution. Moving water hides open manholes" },
        { label: "Move to the school basement for supplies", correct: false, explanation: "Basements are death traps in floods — they fill rapidly" },
        { label: "Climb onto the school roof", correct: false, explanation: "Roof access is dangerous during rain. Upper floors with sealed rooms are safer" },
      ]
    },
  ],
  "Security Advanced": [
    {
      scenario: "Unusual sounds in the hallway. Teacher announces lockdown. The door has no lock. What is safest?",
      options: [
        { label: "Barricade the door with desks, turn off lights, stay low and silent", correct: true, explanation: "Barricading creates a physical barrier. Darkness + silence makes the room appear empty" },
        { label: "Open the door to check what is happening", correct: false, explanation: "Opening the door exposes you to the threat" },
        { label: "Jump out the window regardless of floor", correct: false, explanation: "Jumping from upper floors causes serious injury" },
        { label: "Call your parents to come pick you up", correct: false, explanation: "Parents arriving creates more targets and interferes with law enforcement" },
      ]
    },
  ],
}

// === XP & LEVEL SYSTEM ===

export const XP_PER_CORRECT = 5
export const XP_LESSON_BONUS = 15
export const XP_UNIT_BONUS = 100
export const MAX_HEARTS = 5

export type Level = {
  name: string
  emoji: string
  minXP: number
  color: string
}

export const levels: Level[] = [
  { name: "Novice", emoji: "🌱", minXP: 0, color: "text-slate-500" },
  { name: "Learner", emoji: "📚", minXP: 200, color: "text-blue-500" },
  { name: "Prepared", emoji: "⭐", minXP: 500, color: "text-amber-500" },
  { name: "Safety Hero", emoji: "🦸", minXP: 1000, color: "text-purple-500" },
  { name: "Guardian", emoji: "🛡️", minXP: 2000, color: "text-emerald-500" },
]

// === LOCAL STORAGE HELPERS ===

const OLD_PROGRESS_KEY = "suraksha_learning_progress"

const getProgressKey = (uid: string) => `suraksha_learning_progress_${uid}`

const defaultProgress: UserProgress = {
  completedLessons: [],
  xp: 0,
  streak: 0,
  lastPlayedDate: "",
  hearts: MAX_HEARTS,
  maxHearts: MAX_HEARTS,
}

export function getUserProgress(uid: string): UserProgress {
  if (typeof window === "undefined" || !uid) return defaultProgress
  try {
    // Cleanup old orphaned generic data if it exists
    if (localStorage.getItem(OLD_PROGRESS_KEY)) {
      localStorage.removeItem(OLD_PROGRESS_KEY)
    }

    const data = localStorage.getItem(getProgressKey(uid))
    if (!data) return { ...defaultProgress }
    
    const parsed = JSON.parse(data) as UserProgress
    
    // Ensure structural integrity of parsed data
    if (!parsed.completedLessons || !Array.isArray(parsed.completedLessons)) {
      parsed.completedLessons = []
    }
    if (typeof parsed.xp !== "number") parsed.xp = 0
    if (typeof parsed.streak !== "number") parsed.streak = 0
    if (typeof parsed.hearts !== "number") parsed.hearts = MAX_HEARTS
    if (typeof parsed.maxHearts !== "number") parsed.maxHearts = MAX_HEARTS
    
    // Check streak
    const today = new Date().toISOString().split("T")[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]
    if (parsed.lastPlayedDate !== today && parsed.lastPlayedDate !== yesterday) {
      parsed.streak = 0 // Reset streak if missed more than a day
    }
    return parsed
  } catch {
    return { ...defaultProgress }
  }
}

export function saveProgress(uid: string, progress: UserProgress): void {
  if (typeof window === "undefined" || !uid) return
  localStorage.setItem(getProgressKey(uid), JSON.stringify(progress))
}

export function resetProgress(uid: string): UserProgress {
  if (typeof window !== "undefined" && uid) {
    localStorage.setItem(getProgressKey(uid), JSON.stringify({ ...defaultProgress }))
  }
  return { ...defaultProgress }
}

export function completeLesson(uid: string, lessonId: string, correctAnswers: number): UserProgress {
  const progress = getUserProgress(uid)
  if (progress.completedLessons.includes(lessonId)) return progress

  const today = new Date().toISOString().split("T")[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]

  // Update streak
  if (progress.lastPlayedDate === yesterday) {
    progress.streak += 1
  } else if (progress.lastPlayedDate !== today) {
    progress.streak = 1
  }

  progress.completedLessons.push(lessonId)
  progress.xp += (correctAnswers * XP_PER_CORRECT) + XP_LESSON_BONUS
  progress.lastPlayedDate = today

  // Check if unit completed — check both primary and secondary units
  const allUnits = [...units, ...secondaryUnits]
  for (const unit of allUnits) {
    const allDone = unit.lessons.every(l => progress.completedLessons.includes(l.id))
    if (allDone) {
      // Add unit bonus only once (check if any lesson was just added)
      const justCompleted = unit.lessons.find(l => l.id === lessonId)
      if (justCompleted) {
        const previouslyCompleted = unit.lessons.filter(l => l.id !== lessonId).every(l => progress.completedLessons.includes(l.id))
        if (previouslyCompleted) {
          progress.xp += XP_UNIT_BONUS
        }
      }
    }
  }

  saveProgress(uid, progress)
  return progress
}

export function loseHeart(uid: string): UserProgress {
  const progress = getUserProgress(uid)
  progress.hearts = Math.max(0, progress.hearts - 1)
  saveProgress(uid, progress)
  return progress
}

export function getCurrentLevel(xp: number): Level {
  let current = levels[0]
  for (const level of levels) {
    if (xp >= level.minXP) current = level
  }
  return current
}

export function getNextLevel(xp: number): Level | null {
  for (const level of levels) {
    if (xp < level.minXP) return level
  }
  return null
}

export function isLessonUnlocked(lessonId: string, completedLessons: string[], tier?: "primary" | "secondary"): boolean {
  // Search in the correct unit set based on tier, or both if not specified
  const unitSets = tier === "secondary" ? secondaryUnits : tier === "primary" ? units : [...units, ...secondaryUnits]
  
  for (const unit of unitSets) {
    const lessonIdx = unit.lessons.findIndex(l => l.id === lessonId)
    if (lessonIdx === -1) continue

    if (lessonIdx === 0) {
      // First lesson of unit
      const unitIdx = unitSets.indexOf(unit)
      if (unitIdx === 0) return true // First unit always unlocked
      const prevUnit = unitSets[unitIdx - 1]
      return prevUnit.lessons.every(l => completedLessons.includes(l.id))
    } else {
      // Need previous lesson in same unit
      return completedLessons.includes(unit.lessons[lessonIdx - 1].id)
    }
  }
  return false
}

export function getTotalLessons(tier?: "primary" | "secondary"): number {
  const unitSet = tier === "secondary" ? secondaryUnits : tier === "primary" ? units : [...units, ...secondaryUnits]
  return unitSet.reduce((sum, u) => sum + u.lessons.length, 0)
}

// === TIER-AWARE HELPER FUNCTIONS ===

import { type Tier } from "@/lib/school-codes"

/**
 * Get the correct units array for a tier
 */
export function getUnitsForTier(tier: Tier): Unit[] {
  return tier === "primary" ? units : secondaryUnits
}

/**
 * Get do's/don'ts data for a tier — returns merged primary + secondary or tier-specific
 */
export function getDosDontsForTier(tier: Tier): Record<string, DosDontsItem[]> {
  return tier === "primary" ? dosDontsData : secondaryDosDontsData
}

/**
 * Get matching data for a tier
 */
export function getMatchingForTier(tier: Tier): Record<string, MatchingPair[]> {
  return tier === "primary" ? matchingData : secondaryMatchingData
}

/**
 * Find a lesson by ID across both unit sets
 */
export function findLessonById(lessonId: string): { lesson: Lesson; unit: Unit; tier: Tier } | null {
  for (const unit of units) {
    const lesson = unit.lessons.find(l => l.id === lessonId)
    if (lesson) return { lesson, unit, tier: "primary" as Tier }
  }
  for (const unit of secondaryUnits) {
    const lesson = unit.lessons.find(l => l.id === lessonId)
    if (lesson) return { lesson, unit, tier: "secondary" as Tier }
  }
  return null
}


// === CHOICE-QUESTION LESSONS (quiz + safe-spot) ===

import { quizData } from "@/lib/quiz-data"

export type ChoiceOption = { label: string; correct: boolean; explanation: string }
export type ChoiceQuestion = { prompt: string; options: ChoiceOption[] }

/** Questions for a quiz / safe-spot lesson, normalised to one shape (options in author order). */
export function getChoiceQuestions(lesson: Lesson): ChoiceQuestion[] {
  if (lesson.type === "safe-spot") {
    const scenarios = safeSpotData[lesson.disasterType] || []
    return scenarios.map(s => ({ prompt: s.scenario, options: s.options.map(o => ({ ...o })) }))
  }
  const qs = quizData[lesson.disasterType] || quizData["General Safety"]
  return qs.map(q => ({
    prompt: q.q,
    options: [
      { label: q.correct, correct: true, explanation: q.why },
      ...q.wrong.map(w => ({ label: w, correct: false, explanation: q.why })),
    ],
  }))
}

/** Number of questions/items in a lesson — used for XP preview and the results screen. */
export function getLessonItemCount(lesson: Lesson, tier: Tier): number {
  if (lesson.type === "dos-donts") return (getDosDontsForTier(tier)[lesson.disasterType] || dosDontsData["General Safety"]).length
  if (lesson.type === "matching") return (getMatchingForTier(tier)[lesson.disasterType] || matchingData["Earthquake"]).length
  return getChoiceQuestions(lesson).length
}
