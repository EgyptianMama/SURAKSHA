// Quiz questions mapped to each module for the SURAKSHA learning platform

export type QuizQuestion = {
  id: string
  moduleId: string
  question: string
  options: string[]
  correctIndex: number // Index of the correct option (0-3)
  explanation: string
  difficulty: "easy" | "medium" | "hard"
}

// 60% pass threshold (3 out of 5)
export const QUIZ_PASS_THRESHOLD = 0.6;

export const MODULE_QUIZZES: QuizQuestion[] = [
  // ============================================================
  // PRIMARY MODULES
  // ============================================================
  
  // p-mod-1: Fire Safety Basics
  {
    id: "q-p1-1", moduleId: "p-mod-1", difficulty: "easy",
    question: "What is the very first thing you should do if your clothes catch on fire?",
    options: ["Run fast to find water", "Stop, Drop, and Roll", "Call for help immediately", "Hide under a desk"],
    correctIndex: 1, explanation: "Stop, Drop, and Roll is the best way to put out a fire on your clothes quickly."
  },
  {
    id: "q-p1-2", moduleId: "p-mod-1", difficulty: "easy",
    question: "When you hear the fire alarm at school, what should you do?",
    options: ["Pack your bag", "Hide in the closet", "Line up quietly and follow the teacher", "Run outside as fast as you can"],
    correctIndex: 2, explanation: "Staying calm, lining up, and following the teacher ensures everyone gets out safely."
  },
  {
    id: "q-p1-3", moduleId: "p-mod-1", difficulty: "medium",
    question: "Why do we crawl low during a fire?",
    options: ["To hide from the fire", "Because the floor is cooler", "Because smoke rises, so the cleaner air is near the floor", "To move faster"],
    correctIndex: 2, explanation: "Smoke goes up to the ceiling, so crawling keeps you in the safe, breathable air."
  },
  {
    id: "q-p1-4", moduleId: "p-mod-1", difficulty: "easy",
    question: "Should you ever hide during a fire?",
    options: ["Yes, under a bed", "Yes, in a closet", "No, never hide", "Only if the teacher says so"],
    correctIndex: 2, explanation: "Never hide during a fire! Firefighters need to be able to find you easily."
  },
  {
    id: "q-p1-5", moduleId: "p-mod-1", difficulty: "medium",
    question: "If a door feels hot, should you open it?",
    options: ["Yes, quickly", "No, keep it closed", "Open it a little bit", "Kick it open"],
    correctIndex: 1, explanation: "A hot door means there is fire on the other side. Keep it closed and find another way out."
  },

  // p-mod-2: Earthquake: Duck & Cover
  {
    id: "q-p2-1", moduleId: "p-mod-2", difficulty: "easy",
    question: "What are the three steps you should take during an earthquake?",
    options: ["Run, Jump, Hide", "Duck, Cover, and Hold On", "Stop, Drop, and Roll", "Stand, Yell, Run"],
    correctIndex: 1, explanation: "Duck, Cover, and Hold On protects you from falling objects."
  },
  {
    id: "q-p2-2", moduleId: "p-mod-2", difficulty: "easy",
    question: "Where is the safest place to be in a classroom during an earthquake?",
    options: ["Near the windows", "Under a sturdy desk or table", "Next to the bookshelf", "In the doorway"],
    correctIndex: 1, explanation: "A sturdy desk will protect you from things falling from the ceiling."
  },
  {
    id: "q-p2-3", moduleId: "p-mod-2", difficulty: "medium",
    question: "Why shouldn't you stand near windows during an earthquake?",
    options: ["They might open", "You can't see the teacher", "The glass might break and hurt you", "It's too loud outside"],
    correctIndex: 2, explanation: "Shaking can cause glass to shatter and fly across the room."
  },
  {
    id: "q-p2-4", moduleId: "p-mod-2", difficulty: "easy",
    question: "If you are outside playing when an earthquake happens, what should you do?",
    options: ["Run inside the building", "Stay away from buildings and trees and drop to the ground", "Climb a tree", "Keep playing"],
    correctIndex: 1, explanation: "Running inside is dangerous. Stay in an open area away from things that could fall on you."
  },
  {
    id: "q-p2-5", moduleId: "p-mod-2", difficulty: "medium",
    question: "When should you leave your safe spot under the desk?",
    options: ["Right away", "After 1 minute", "When you hear the fire alarm", "When the shaking completely stops and the teacher says it's safe"],
    correctIndex: 3, explanation: "Wait until the shaking is over and an adult gives directions."
  },

  // p-mod-3: Flood Awareness
  {
    id: "q-p3-1", moduleId: "p-mod-3", difficulty: "easy",
    question: "What is a flood?",
    options: ["A very hot day", "When there is too much water on dry land", "A strong wind", "A type of storm in the ocean"],
    correctIndex: 1, explanation: "A flood happens when water overflows onto land that is normally dry."
  },
  {
    id: "q-p3-2", moduleId: "p-mod-3", difficulty: "medium",
    question: "Why is it dangerous to walk or play in floodwater?",
    options: ["It can ruin your shoes", "It might be cold", "It can carry diseases, dangerous animals, and move very fast", "It smells bad"],
    correctIndex: 2, explanation: "Floodwater is dirty and can knock you over easily even if it looks shallow."
  },
  {
    id: "q-p3-3", moduleId: "p-mod-3", difficulty: "easy",
    question: "Where should you go if there is a flood warning?",
    options: ["To a basement", "To higher ground", "To the park", "Stay exactly where you are"],
    correctIndex: 1, explanation: "Water flows downhill, so moving to higher ground keeps you safe."
  },
  {
    id: "q-p3-4", moduleId: "p-mod-3", difficulty: "medium",
    question: "What should you include in a family emergency kit for floods?",
    options: ["Toys and games", "Water, food, and a flashlight", "School books", "Fancy clothes"],
    correctIndex: 1, explanation: "Clean water, non-perishable food, and light sources are essentials during an emergency."
  },
  {
    id: "q-p3-5", moduleId: "p-mod-3", difficulty: "medium",
    question: "If you see a flooded road while in a car, what should the driver do?",
    options: ["Drive very fast through it", "Turn around and find another way", "Honk the horn", "Drive slowly"],
    correctIndex: 1, explanation: "Turn around, don't drown! Cars can easily be swept away by shallow water."
  },

  // p-mod-4: First Aid for Kids
  {
    id: "q-p4-1", moduleId: "p-mod-4", difficulty: "easy",
    question: "What is the first thing you should do if your friend gets a bad cut?",
    options: ["Cry", "Put a band-aid on it immediately", "Tell a teacher or a safe adult", "Wash it with dirty water"],
    correctIndex: 2, explanation: "Always get an adult to help with bad cuts to ensure it's treated properly."
  },
  {
    id: "q-p4-2", moduleId: "p-mod-4", difficulty: "medium",
    question: "What is usually inside a school first aid box?",
    options: ["Candy", "Bandages, wipes, and thermometers", "Pencils", "Tools for fixing desks"],
    correctIndex: 1, explanation: "First aid boxes contain medical supplies for minor injuries."
  },
  {
    id: "q-p4-3", moduleId: "p-mod-4", difficulty: "easy",
    question: "If you get a small scrape on your knee, what should you do first?",
    options: ["Ignore it", "Wash it with clean water and soap", "Put dirt on it", "Go home immediately"],
    correctIndex: 1, explanation: "Washing the scrape keeps germs away so it doesn't get infected."
  },
  {
    id: "q-p4-4", moduleId: "p-mod-4", difficulty: "medium",
    question: "How can you be a 'safety helper' at school?",
    options: ["By doing surgery", "By letting a teacher know if you see someone get hurt or if you see a broken step", "By keeping secrets", "By ignoring rules"],
    correctIndex: 1, explanation: "Safety helpers keep an eye out for danger and tell adults so it can be fixed."
  },
  {
    id: "q-p4-5", moduleId: "p-mod-4", difficulty: "medium",
    question: "Should you ever give another child medicine from a first aid kit?",
    options: ["Yes, if they ask", "Yes, if they are crying", "No, only an adult or nurse should give medicine", "Only if it tastes good"],
    correctIndex: 2, explanation: "Never give or take medicine without an adult. It can be dangerous if it's the wrong kind."
  },

  // p-mod-5: Stranger Safety & School Security
  {
    id: "q-p5-1", moduleId: "p-mod-5", difficulty: "easy",
    question: "What should you do if a stranger asks you to help find a lost puppy?",
    options: ["Help them look", "Say NO, run away, and tell a safe adult", "Get into their car", "Ask your friends to help"],
    correctIndex: 1, explanation: "Adults shouldn't ask kids for help. Always say NO and run to a safe adult."
  },
  {
    id: "q-p5-2", moduleId: "p-mod-5", difficulty: "easy",
    question: "Who is an example of a 'safe adult' at school?",
    options: ["A person walking their dog outside", "Your teacher or the school principal", "Someone you met online", "A stranger at the gate"],
    correctIndex: 1, explanation: "Teachers, principals, and school guards are safe adults who are there to protect you."
  },
  {
    id: "q-p5-3", moduleId: "p-mod-5", difficulty: "medium",
    question: "During a school lockdown drill, what is the most important rule?",
    options: ["Talk loudly", "Run in the hallways", "Stay very quiet, hide out of sight, and listen to your teacher", "Look out the window"],
    correctIndex: 2, explanation: "Being quiet and out of sight keeps everyone safe during a lockdown."
  },
  {
    id: "q-p5-4", moduleId: "p-mod-5", difficulty: "easy",
    question: "What is the 'buddy system'?",
    options: ["Sharing your lunch", "Always going places (like the bathroom) with a friend so you are never alone", "Doing homework together", "Playing tag"],
    correctIndex: 1, explanation: "The buddy system means you always have a friend with you, which is much safer than being alone."
  },
  {
    id: "q-p5-5", moduleId: "p-mod-5", difficulty: "medium",
    question: "If someone makes you feel scared or uncomfortable, what should you do?",
    options: ["Keep it a secret", "Tell a safe adult immediately", "Cry in the bathroom", "Yell at them"],
    correctIndex: 1, explanation: "Never keep secrets about feeling unsafe. Tell a trusted adult right away."
  },

  // p-mod-6: Emergency Numbers & Communication
  {
    id: "q-p6-1", moduleId: "p-mod-6", difficulty: "easy",
    question: "What is the universal emergency number in India?",
    options: ["100", "112", "911", "999"],
    correctIndex: 1, explanation: "112 is the pan-India emergency number for police, fire, and ambulance."
  },
  {
    id: "q-p6-2", moduleId: "p-mod-6", difficulty: "easy",
    question: "When should you call an emergency number?",
    options: ["When you lose a toy", "When you have homework", "Only when there is a real emergency, like a fire or someone is very hurt", "To practice on the phone"],
    correctIndex: 2, explanation: "Emergency numbers are only for real emergencies where you need immediate help."
  },
  {
    id: "q-p6-3", moduleId: "p-mod-6", difficulty: "medium",
    question: "If you have to call 112, what is the most important thing to tell the operator?",
    options: ["Your favorite color", "Your name and where you are (your address or school name)", "What you had for breakfast", "A joke"],
    correctIndex: 1, explanation: "The operator needs to know where you are so they can send help to the right place."
  },
  {
    id: "q-p6-4", moduleId: "p-mod-6", difficulty: "medium",
    question: "If you call 112 by accident, what should you do?",
    options: ["Hang up immediately", "Scream", "Stay on the line and tell them it was an accident", "Throw the phone away"],
    correctIndex: 2, explanation: "If you hang up, they might think you are in danger and send police. Just explain it was a mistake."
  },
  {
    id: "q-p6-5", moduleId: "p-mod-6", difficulty: "medium",
    question: "Why is it important to memorize your parents' phone numbers?",
    options: ["To win a prize", "So you can call them if you get lost or need help", "So you can play games on their phone", "You don't need to memorize them"],
    correctIndex: 1, explanation: "If you get lost, you can ask a safe adult (like a police officer) to call your parents."
  },


  // ============================================================
  // SECONDARY MODULES
  // ============================================================

  // s-mod-1: Fire Emergency Protocols
  {
    id: "q-s1-1", moduleId: "s-mod-1", difficulty: "easy",
    question: "What are the three components of the Fire Triangle?",
    options: ["Heat, Fuel, Oxygen", "Wood, Paper, Plastic", "Water, Foam, CO2", "Spark, Smoke, Flame"],
    correctIndex: 0, explanation: "A fire needs heat, fuel, and oxygen to start and continue burning. Removing any one element can extinguish the fire."
  },
  {
    id: "q-s1-2", moduleId: "s-mod-1", difficulty: "medium",
    question: "Which of the following is a common fire hazard in schools that should be identified and reported?",
    options: ["Open windows", "Blocked fire exits and overloaded electrical sockets", "Too many students in a classroom", "Wet floors"],
    correctIndex: 1, explanation: "Blocked fire exits prevent evacuation, and overloaded sockets can cause electrical fires. Both are critical hazards."
  },
  {
    id: "q-s1-3", moduleId: "s-mod-1", difficulty: "medium",
    question: "What does the acronym PASS stand for when using a fire extinguisher?",
    options: ["Point, Aim, Squeeze, Sweep", "Pull, Aim, Squeeze, Sweep", "Push, Activate, Spray, Stop", "Pull, Approach, Spray, Sweep"],
    correctIndex: 1, explanation: "Pull the pin, Aim at the base of the fire, Squeeze the handle, Sweep side to side."
  },
  {
    id: "q-s1-4", moduleId: "s-mod-1", difficulty: "medium",
    question: "During a fire evacuation drill, what is the correct procedure when the alarm sounds?",
    options: ["Collect all belongings and exit slowly", "Use the elevator for faster evacuation", "Leave immediately using the nearest fire exit, stay low if smoky, assemble at the designated point", "Wait for the teacher to check if it's a real fire"],
    correctIndex: 2, explanation: "Time is critical. Leave immediately through fire exits, stay low to avoid smoke, and gather at the assembly point for headcount."
  },
  {
    id: "q-s1-5", moduleId: "s-mod-1", difficulty: "hard",
    question: "Why is it dangerous to open a hot door during a fire?",
    options: ["It might be locked", "It can cause a backdraft by introducing oxygen to a starved fire", "The door handle will burn you", "It lets smoke out"],
    correctIndex: 1, explanation: "A backdraft is an explosive ignition caused by the sudden introduction of oxygen into an enclosed space containing superheated flammable gases."
  },

  // s-mod-2: Seismic Preparedness
  {
    id: "q-s2-1", moduleId: "s-mod-2", difficulty: "easy",
    question: "What causes earthquakes?",
    options: ["Strong winds underground", "Movement of tectonic plates along fault lines", "Underground volcanoes", "Heavy rainfall seeping into the ground"],
    correctIndex: 1, explanation: "Earthquakes occur when tectonic plates move, slide, or collide, releasing stored energy as seismic waves."
  },
  {
    id: "q-s2-2", moduleId: "s-mod-2", difficulty: "medium",
    question: "Which seismic zone in India represents the highest risk of earthquakes?",
    options: ["Zone II", "Zone III", "Zone IV", "Zone V"],
    correctIndex: 3, explanation: "Zone V is the most seismically active region in the Bureau of Indian Standards (BIS) classification, covering parts of Northeast India, J&K, and Himachal Pradesh."
  },
  {
    id: "q-s2-3", moduleId: "s-mod-2", difficulty: "medium",
    question: "What does the Richter scale measure?",
    options: ["The duration of the earthquake", "The magnitude (energy released) of the earthquake", "The damage caused by the earthquake", "The depth of the earthquake"],
    correctIndex: 1, explanation: "The Richter scale measures the magnitude of an earthquake based on seismograph readings."
  },
  {
    id: "q-s2-4", moduleId: "s-mod-2", difficulty: "medium",
    question: "What is the correct protocol to follow during an earthquake if you are indoors?",
    options: ["Run outside immediately", "Drop, Cover, and Hold On under a sturdy desk or table", "Stand in a doorway", "Use the elevator to evacuate"],
    correctIndex: 1, explanation: "Drop, Cover, and Hold On protects you from falling objects. Running outside during shaking increases risk of injury."
  },
  {
    id: "q-s2-5", moduleId: "s-mod-2", difficulty: "hard",
    question: "What should schools do to prepare for earthquakes as part of a preparedness plan?",
    options: ["Only teach students to run outside", "Conduct regular earthquake drills, secure heavy furniture, identify safe zones, and maintain emergency supplies", "Install earthquake-proof windows only", "Wait for government warnings before taking action"],
    correctIndex: 1, explanation: "Comprehensive preparedness includes drills, securing non-structural hazards, identifying safe zones, and maintaining emergency kits."
  },

  // s-mod-3: Flood Response & Recovery
  {
    id: "q-s3-1", moduleId: "s-mod-3", difficulty: "easy",
    question: "Which of the following is NOT a type of flood?",
    options: ["Flash Flood", "River Flood", "Urban Flood", "Seismic Flood"],
    correctIndex: 3, explanation: "There is no such thing as a 'Seismic Flood'. Flash, river, coastal, and urban floods are the main types."
  },
  {
    id: "q-s3-2", moduleId: "s-mod-3", difficulty: "medium",
    question: "What does a 'Red Alert' from the Indian Meteorological Department (IMD) signify regarding rainfall/flooding?",
    options: ["Be Updated", "Be Prepared", "Take Action (extremely heavy rain expected)", "No Danger"],
    correctIndex: 2, explanation: "A Red Alert means authorities and the public need to take immediate action to protect life and property."
  },
  {
    id: "q-s3-3", moduleId: "s-mod-3", difficulty: "medium",
    question: "Why should you never walk or drive through moving floodwater?",
    options: ["It's illegal", "It will ruin your clothes", "Just 6 inches of moving water can knock a person down, and 12-24 inches can float a car", "You might get a ticket"],
    correctIndex: 2, explanation: "The force of moving water is deceptive. 'Turn Around, Don't Drown.'"
  },
  {
    id: "q-s3-4", moduleId: "s-mod-3", difficulty: "hard",
    question: "After a flood, what is a major health risk from contaminated water?",
    options: ["Sunburn", "Waterborne diseases like cholera and typhoid", "Frostbite", "Altitude sickness"],
    correctIndex: 1, explanation: "Floodwaters often mix with sewage and chemicals, contaminating drinking water sources and causing outbreaks."
  },
  {
    id: "q-s3-5", moduleId: "s-mod-3", difficulty: "medium",
    question: "What is the first step in post-flood safety assessment of a building?",
    options: ["Enter immediately to check for damage", "Check for structural cracks and gas leaks from the outside before entering", "Turn on all electrical switches", "Start cleaning up right away"],
    correctIndex: 1, explanation: "Always inspect from outside first. Look for structural damage, gas leaks, and electrical hazards before entering a flooded building."
  },

  // s-mod-4: First Aid & Medical Emergencies
  {
    id: "q-s4-1", moduleId: "s-mod-4", difficulty: "easy",
    question: "What is the first step in any first aid emergency situation?",
    options: ["Start CPR immediately", "Check the scene is safe, then check the victim's responsiveness", "Call your parents", "Move the victim immediately"],
    correctIndex: 1, explanation: "Always ensure the scene is safe before approaching. Then check if the person is responsive by tapping and asking loudly."
  },
  {
    id: "q-s4-2", moduleId: "s-mod-4", difficulty: "medium",
    question: "For Hands-Only CPR on an adult, what is the recommended rate of chest compressions?",
    options: ["50-60 beats per minute", "100-120 beats per minute", "150-200 beats per minute", "As fast as you possibly can"],
    correctIndex: 1, explanation: "Push hard and fast in the center of the chest at 100-120 bpm (to the beat of 'Stayin' Alive')."
  },
  {
    id: "q-s4-3", moduleId: "s-mod-4", difficulty: "medium",
    question: "What is the Heimlich maneuver used for?",
    options: ["Treating a burn", "Stopping severe bleeding", "Helping a person who is choking on an object", "Performing CPR"],
    correctIndex: 2, explanation: "Abdominal thrusts (Heimlich) force air out of the lungs to dislodge a blocked airway."
  },
  {
    id: "q-s4-4", moduleId: "s-mod-4", difficulty: "medium",
    question: "When treating a wound, what is the correct order of steps?",
    options: ["Bandage first, then clean", "Apply pressure to stop bleeding, clean the wound, then apply a sterile bandage", "Pour alcohol directly on it", "Ignore small wounds"],
    correctIndex: 1, explanation: "Stop the bleeding with pressure first, clean gently to prevent infection, then cover with a sterile bandage."
  },
  {
    id: "q-s4-5", moduleId: "s-mod-4", difficulty: "hard",
    question: "If you suspect someone has a fracture, what should you do while waiting for emergency services?",
    options: ["Try to push the bone back into place", "Immobilize the injured area without moving it and apply ice wrapped in cloth", "Apply a heating pad immediately", "Tell them to walk it off"],
    correctIndex: 1, explanation: "Keep the bone from moving to prevent further injury. Apply ice to reduce swelling while waiting for paramedics."
  },

  // s-mod-5: Security Threats & Lockdown
  {
    id: "q-s5-1", moduleId: "s-mod-5", difficulty: "easy",
    question: "What is the first thing you should do if you notice a suspicious person or activity near your school?",
    options: ["Confront them directly", "Ignore it", "Report it immediately to a trusted adult, school official, or the police", "Take a photo and post it on social media"],
    correctIndex: 2, explanation: "If you see something, say something. Early reporting prevents potential threats from escalating."
  },
  {
    id: "q-s5-2", moduleId: "s-mod-5", difficulty: "hard",
    question: "What is the difference between a 'Lockdown' and a 'Lockout'?",
    options: ["They are the same thing", "Lockdown means the threat is inside the building; Lockout means the threat is outside, so exterior doors are locked but activities continue inside", "Lockout means everyone goes outside", "Lockdown is only for weather events"],
    correctIndex: 1, explanation: "Understanding this difference prevents panic. A lockout for nearby police activity doesn't require hiding like an internal lockdown does."
  },
  {
    id: "q-s5-3", moduleId: "s-mod-5", difficulty: "medium",
    question: "During a lockdown, which of the following is a correct barricading technique?",
    options: ["Open all doors so you can escape", "Use desks, chairs, and heavy furniture to block the door from opening", "Stand near the window", "Turn on all the lights"],
    correctIndex: 1, explanation: "Barricading the door with heavy objects prevents an intruder from entering, buying critical time."
  },
  {
    id: "q-s5-4", moduleId: "s-mod-5", difficulty: "medium",
    question: "During a lockdown, why should you silence your cell phone completely (including vibration)?",
    options: ["To save battery", "Because the vibration sound can give away your hiding location to an intruder", "Because teachers don't allow phones", "To prevent network congestion"],
    correctIndex: 1, explanation: "In a quiet room, a vibrating phone on a hard floor can be heard easily and reveal your location."
  },
  {
    id: "q-s5-5", moduleId: "s-mod-5", difficulty: "medium",
    question: "What should you do if the fire alarm goes off during an active lockdown?",
    options: ["Evacuate immediately", "Ignore it completely", "Do not evacuate unless you smell smoke or see fire; it may be a tactic to draw people out", "Open the door to check the hallway"],
    correctIndex: 2, explanation: "Unless there is a verified fire threat, stay in lockdown. Intruders sometimes pull alarms to draw people into hallways."
  },

  // s-mod-6: Chemical & Industrial Hazards
  {
    id: "q-s6-1", moduleId: "s-mod-6", difficulty: "easy",
    question: "What is the most important safety rule when working with chemicals in a school lab?",
    options: ["Taste chemicals to identify them", "Always wear safety goggles, gloves, and follow the teacher's instructions", "Mix chemicals together to see what happens", "Work alone so you have more space"],
    correctIndex: 1, explanation: "Personal protective equipment (PPE) and following instructions are the foundation of lab safety."
  },
  {
    id: "q-s6-2", moduleId: "s-mod-6", difficulty: "medium",
    question: "If you smell a strong, unusual chemical odor (like rotten eggs/gas) in the school, what is the FIRST thing you should do?",
    options: ["Try to find the source with a lighter", "Alert the teacher, evacuate the area, and do not turn on/off electrical switches", "Open a window and stay in the room", "Clean up the lab tables"],
    correctIndex: 1, explanation: "Electrical sparks can ignite gas leaks. Evacuate safely and notify authorities immediately."
  },
  {
    id: "q-s6-3", moduleId: "s-mod-6", difficulty: "medium",
    question: "What does 'HAZMAT' stand for?",
    options: ["Hazardous Materials", "Hazards and Materials", "Hazardous Atmosphere", "Hazard Mitigation"],
    correctIndex: 0, explanation: "HAZMAT refers to substances that pose a risk to health, safety, and property during storage or transport."
  },
  {
    id: "q-s6-4", moduleId: "s-mod-6", difficulty: "medium",
    question: "During a chemical spill, what is the correct decontamination procedure?",
    options: ["Wipe the chemical with your bare hands", "Remove contaminated clothing, flush affected skin with water for 15-20 minutes, and seek medical help", "Ignore it if it doesn't smell", "Cover it with paper towels and leave"],
    correctIndex: 1, explanation: "Quick decontamination reduces chemical exposure. Remove clothing, flush thoroughly, and get medical attention."
  },
  {
    id: "q-s6-5", moduleId: "s-mod-6", difficulty: "hard",
    question: "What major industrial disaster in India led to strict regulations on chemical safety (NDMA guidelines)?",
    options: ["The 2004 Tsunami", "The 1984 Bhopal Gas Tragedy", "The 2001 Gujarat Earthquake", "The 2013 Uttarakhand Floods"],
    correctIndex: 1, explanation: "The Bhopal disaster involved a massive leak of methyl isocyanate (MIC) gas, killing thousands and changing industrial safety laws globally."
  }
]

export function getQuizForModule(moduleId: string): QuizQuestion[] {
  return MODULE_QUIZZES.filter(q => q.moduleId === moduleId)
}
