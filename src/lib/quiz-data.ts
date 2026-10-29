// Multiple-choice question bank for the Safety Hero / Safety Commander pathway quizzes.
// Keyed by lesson.disasterType. Primary = simple language; "... Advanced" keys = secondary tier.

export type QuizQuestion = {
  q: string
  correct: string
  wrong: [string, string, string]
  why: string
}

export const quizData: Record<string, QuizQuestion[]> = {
  // ───────────── PRIMARY ─────────────
  "Earthquake": [
    { q: "The ground starts shaking in your classroom. What do you do first?", correct: "Drop, Cover and Hold On under a desk", wrong: ["Run to the door as fast as you can", "Stand next to the window to watch", "Climb on top of the table"], why: "Get low, protect your head and neck, and hold on to a sturdy desk until the shaking stops." },
    { q: "The shaking has stopped. Where should you go?", correct: "An open ground, away from buildings", wrong: ["Back to class to get your bag", "To the top floor", "Under the stairs"], why: "Open ground is safest from falling glass, walls and wires." },
    { q: "Which of these is NOT safe during an earthquake?", correct: "Using the lift", wrong: ["Covering your head", "Staying away from windows", "Taking cover under a table"], why: "Lifts can get stuck when power fails. Always use the stairs." },
    { q: "What should be in your emergency bag?", correct: "Water, a torch and a whistle", wrong: ["Toys and video games", "Fireworks", "A pile of heavy books"], why: "Water keeps you going, a torch helps in the dark, and a whistle lets rescuers find you." },
    { q: "What is an aftershock?", correct: "A smaller shake that can come after the big one", wrong: ["The sound an earthquake makes", "A big wave in the sea", "A crack in the road"], why: "Aftershocks can still cause damage, so stay alert and keep following safety steps." },
  ],
  "Fire Emergency": [
    { q: "You hear the fire alarm at school. What should you do?", correct: "Line up quietly and walk to the assembly point", wrong: ["Run back to get your bag", "Hide under your desk", "Wait to see if the fire is real"], why: "Always take fire alarms seriously. Walk, don't run, and never go back for belongings." },
    { q: "Your clothes catch fire. What should you do?", correct: "Stop, Drop and Roll", wrong: ["Run to find water", "Wave your arms around", "Take the lift down"], why: "Running feeds the flames. Rolling on the ground smothers them." },
    { q: "There is smoke in the corridor. How should you move?", correct: "Stay low and crawl under the smoke", wrong: ["Stand tall and run", "Hold your breath and jump", "Open every window"], why: "Smoke rises, so the cleanest air is close to the floor." },
    { q: "Which number do you call for a fire in India?", correct: "101", wrong: ["100", "102", "1098"], why: "101 is the fire service. 112 is the all-in-one emergency number that also works." },
    { q: "Before opening a closed door during a fire, you should…", correct: "Touch it with the back of your hand to check if it is hot", wrong: ["Kick it open", "Knock loudly three times", "Pour water on the handle"], why: "A hot door means fire on the other side. Find another way out." },
  ],
  "Flood": [
    { q: "Flood water is rising near your school. What is the safest choice?", correct: "Move to higher ground", wrong: ["Walk through the water to check its depth", "Go to the basement", "Play in the water"], why: "Water keeps rising. Get high and stay with your teachers." },
    { q: "Why should you never walk or play in flood water?", correct: "It can hide holes, sweep you away and is dirty", wrong: ["It is always too cold", "It makes your shoes wet", "It is safe if it is shallow"], why: "Even shallow, fast water can knock you over, and it carries germs and sharp objects." },
    { q: "What should you do about electric switches during a flood?", correct: "Stay away and let an adult turn off the power", wrong: ["Switch everything on", "Touch them with wet hands", "Plug in the phone charger"], why: "Water and electricity are a deadly mix." },
    { q: "Which water is safe to drink after a flood?", correct: "Boiled or bottled water", wrong: ["Water from the flooded street", "Water from a puddle", "Any water that looks clear"], why: "Flood water spreads germs. Clear water can still make you ill." },
    { q: "Who should you listen to during a flood warning?", correct: "Teachers, parents and official warnings", wrong: ["Rumours on social media", "Only your friends", "Nobody"], why: "Official warnings from the government and your school are accurate and up to date." },
  ],
  "Medical Emergency": [
    { q: "A friend falls and has a bleeding cut. What do you do first?", correct: "Tell a teacher and press a clean cloth on the cut", wrong: ["Pour juice on it", "Ignore it", "Pull your friend up quickly"], why: "Pressing on the wound slows bleeding while an adult gets help." },
    { q: "Which number can you call for an ambulance in India?", correct: "108 (or 112)", wrong: ["101", "100", "1098"], why: "108 is the ambulance service and 112 is the all-in-one emergency number." },
    { q: "Someone is choking and cannot speak. What do you do?", correct: "Shout for an adult right away", wrong: ["Give them water", "Tell them to lie down", "Pat them on the head"], why: "Choking is urgent. Trained adults can help with back blows or abdominal thrusts." },
    { q: "What helps a small burn the most?", correct: "Cool (not ice-cold) running water for several minutes", wrong: ["Butter", "Popping the blister", "Toothpaste"], why: "Cool water takes the heat out of the skin. Butter and toothpaste make things worse." },
    { q: "What belongs in a first aid box?", correct: "Bandages, antiseptic and gloves", wrong: ["Sweets and toys", "Matches and a lighter", "Perfume"], why: "A first aid box holds things that clean and cover wounds." },
  ],
  "General Safety": [
    { q: "A stranger offers you sweets and asks you to come with them. You…", correct: "Say no, move away and tell a trusted adult", wrong: ["Go, because sweets are nice", "Go if they seem friendly", "Say nothing and stay quiet"], why: "Never go with someone you don't know. Tell a trusted adult straight away." },
    { q: "Where do you gather when the school is evacuated?", correct: "The assembly point", wrong: ["Near the classroom door", "In the toilets", "At the school gate alone"], why: "At the assembly point teachers can count everyone and make sure nobody is missing." },
    { q: "What is India's all-in-one emergency number?", correct: "112", wrong: ["911", "999", "123"], why: "112 connects you to police, fire and ambulance." },
    { q: "You spot a broken, sparking wire at school. You…", correct: "Stay away and tell a teacher", wrong: ["Touch it to check", "Ignore it", "Take a photo and leave it"], why: "Never touch electrical hazards. Tell an adult who can fix it safely." },
    { q: "Why do we practise safety drills?", correct: "So we know what to do without panicking", wrong: ["To miss lessons", "To scare us", "Because teachers like alarms"], why: "Practice turns the right action into a habit when it counts." },
  ],

  // ───────────── SECONDARY ─────────────
  "Earthquake Advanced": [
    { q: "Which measure describes the ENERGY released by an earthquake at its source?", correct: "Magnitude", wrong: ["Intensity", "Epicentral distance", "Seismic zone number"], why: "Magnitude measures the energy released. Intensity describes how strongly shaking is felt at a place." },
    { q: "The point on the surface directly above where the rupture begins is the…", correct: "Epicentre", wrong: ["Hypocentre", "Fault line", "Seismic gap"], why: "The hypocentre (focus) is underground; the epicentre is directly above it." },
    { q: "In India's seismic zoning (II to V), which zone is the most seismically active?", correct: "Zone V", wrong: ["Zone II", "Zone III", "Zone IV"], why: "Zone V, which includes the Himalayan belt and the north-east, has the highest hazard." },
    { q: "An earthquake hits while you are asleep in bed. Best action?", correct: "Stay in bed and protect your head with a pillow", wrong: ["Run to the stairs", "Stand in the doorway", "Jump out of the window"], why: "Moving during shaking causes most injuries. Protecting your head is the priority." },
    { q: "Which feature most improves a building's earthquake resistance?", correct: "Ductile, well-detailed reinforced frames", wrong: ["Extra-heavy roof slabs", "Unreinforced brick walls", "Large glass facades"], why: "Ductile structures bend without collapsing; heavy, brittle structures fail suddenly." },
  ],
  "Fire Advanced": [
    { q: "The three elements of the fire triangle are…", correct: "Heat, fuel and oxygen", wrong: ["Smoke, heat and wind", "Spark, smoke and gas", "Fuel, carbon dioxide and heat"], why: "Remove any one of the three and the fire goes out." },
    { q: "In the PASS technique, what does the first P stand for?", correct: "Pull the pin", wrong: ["Press the alarm", "Point at the flames", "Push the door shut"], why: "PASS: Pull, Aim, Squeeze, Sweep. Aim at the base of the fire." },
    { q: "Which extinguisher suits an electrical fire?", correct: "Carbon dioxide (CO₂)", wrong: ["Water", "Foam", "Wet chemical"], why: "CO₂ doesn't conduct electricity and leaves no residue. Water on live electrics can electrocute you." },
    { q: "Why are lifts dangerous in a fire?", correct: "Power can fail and shafts fill with smoke", wrong: ["They are always too slow", "They are too heavy", "Alarms are louder inside"], why: "You could be trapped between floors in smoke. Use the stairs." },
    { q: "Most fire deaths are caused by…", correct: "Toxic smoke and gases such as carbon monoxide", wrong: ["Direct burns only", "Building collapse", "Panic alone"], why: "Smoke incapacitates people before flames reach them, so get low and get out fast." },
  ],
  "Flood Advanced": [
    { q: "How much fast-moving water can float and sweep away a car?", correct: "About 60 cm", wrong: ["About 3 metres", "Over 5 metres", "Cars are never swept away"], why: "Roughly 60 cm of moving water can carry a car. Never drive through flood water." },
    { q: "Why are flash floods especially dangerous?", correct: "They rise within minutes with little warning", wrong: ["They only happen at night", "They last for weeks", "The water is always clean"], why: "Flash floods leave almost no time. Move to higher ground at the first warning." },
    { q: "An IMD RED alert means…", correct: "Take action — severe weather is expected", wrong: ["No action needed", "Weather is normal", "Just be aware"], why: "IMD colours: Yellow = be aware, Orange = be prepared, Red = take action." },
    { q: "Which is a major health risk after a flood?", correct: "Waterborne diseases like cholera and leptospirosis", wrong: ["Frostbite", "Altitude sickness", "Sunburn only"], why: "Contaminated water spreads disease, so use boiled or treated water and avoid wading." },
    { q: "Where should a flood emergency kit be kept?", correct: "In a waterproof bag on an upper level, ready to grab", wrong: ["In the basement", "Under the ground-floor bed", "Locked in a garage"], why: "Flood water reaches low spaces first. Keep the kit high, dry and easy to carry." },
  ],
  "Medical Advanced": [
    { q: "Adult CPR chest compressions should be done at about…", correct: "100–120 per minute", wrong: ["40–60 per minute", "60–80 per minute", "140–160 per minute"], why: "This steady rate keeps blood moving to the brain until help arrives." },
    { q: "The recovery position is used for someone who is…", correct: "Unconscious but breathing", wrong: ["Bleeding heavily", "Burned", "Having a broken bone"], why: "It keeps the airway open and prevents choking on vomit." },
    { q: "What is the first action for severe bleeding?", correct: "Apply firm direct pressure with a clean cloth", wrong: ["Keep lifting the cloth to check", "Wash it with hot water", "Wait for a doctor"], why: "Direct pressure is the most effective way to control bleeding. Keep it on and call for help." },
    { q: "A student may have a spinal injury after a fall. You should…", correct: "Keep them still and call emergency services", wrong: ["Sit them up", "Walk them to the sick room", "Help them stand"], why: "Moving someone with a spinal injury can cause permanent damage." },
    { q: "The most urgent treatment for anaphylaxis is…", correct: "Adrenaline auto-injector and calling emergency services", wrong: ["An antacid", "A cold drink", "Waiting to observe"], why: "Anaphylaxis can close the airway within minutes. Adrenaline works fast." },
  ],
  "Security Advanced": [
    { q: "In a lockdown, your priority is to…", correct: "Lock or barricade, stay silent and out of sight", wrong: ["Gather in the corridor", "Move towards the noise", "Call out to friends"], why: "A secured, quiet, dark room looks empty and gives time for help to arrive." },
    { q: "A fire alarm rings DURING a lockdown. You should…", correct: "Stay put unless staff direct otherwise or you see real fire or smoke", wrong: ["Leave immediately", "Open the door to check", "Ignore every instruction"], why: "Alarms can be used to draw people out. Follow staff instructions and verify the danger." },
    { q: "You find an unattended bag. First step?", correct: "Don't touch it, move away and report to staff", wrong: ["Open it to find the owner", "Kick it aside", "Post about it online"], why: "Don't handle it. Move away and let trained staff and police assess it." },
    { q: "Which describes 'Run, Hide, Fight' correctly?", correct: "Run if safe, hide if not, fight only as a last resort", wrong: ["Fight first", "Hide in the open", "Always stay still"], why: "Escape is the best option; fighting is only for when your life is in immediate danger." },
    { q: "When police arrive, you should…", correct: "Keep your hands visible and follow instructions", wrong: ["Run towards them", "Point and shout", "Hide your hands"], why: "Officers don't yet know who is a threat. Calm, visible hands keep everyone safe." },
  ],
  "Chemical Advanced": [
    { q: "A chemical spills in the lab. What is the first priority?", correct: "Alert others, move away and tell the teacher", wrong: ["Wipe it up straight away", "Smell it to identify it", "Pour water on every chemical"], why: "Some chemicals react with water or give off harmful fumes, so don't improvise." },
    { q: "What does a Safety Data Sheet (SDS) tell you?", correct: "Hazards, safe handling and emergency measures", wrong: ["The price", "The colour only", "The supplier's address only"], why: "The SDS is your guide to using a chemical safely and responding to accidents." },
    { q: "Chlorine (heavier than air) is leaking outside. Where do you go?", correct: "Upwind and to higher ground", wrong: ["Downwind into a basement", "Into low-lying areas", "Stay near the leak"], why: "Heavy gases sink and collect in low spaces. Move upwind and uphill." },
    { q: "For a chemical splash in the eye, rinse with…", correct: "Clean running water for at least 15 minutes", wrong: ["A little water for 1 minute", "Milk only", "Eye drops"], why: "Long flushing dilutes and removes the chemical. Then get medical help." },
    { q: "How should you dilute concentrated acid?", correct: "Add the acid slowly to water", wrong: ["Add water to the acid", "Mix both quickly", "Heat the acid first"], why: "Adding water to acid can boil and spatter violently. Remember: 'Acid into water'." },
  ],
  "Leadership Advanced": [
    { q: "As a student safety captain, your first duty in an evacuation is to…", correct: "Calmly guide your group to the assembly point and report the head count", wrong: ["Run ahead and leave first", "Check every room alone", "Wait for everyone else to leave"], why: "Leaders keep the group together and make sure nobody is missing." },
    { q: "Why do schools hold regular mock drills?", correct: "To build habits and find weaknesses in the plan", wrong: ["To meet an attendance target", "To scare students", "Only for inspection photos"], why: "Drills expose gaps in a safe setting so they can be fixed before a real emergency." },
    { q: "Under NDMA's School Safety Policy, a School Disaster Management Plan should be prepared by…", correct: "The school, together with teachers, students and parents", wrong: ["Only the police", "Only a private contractor", "Only the state government"], why: "A plan works best when the whole school community helps build and own it." },
    { q: "What is the best way to calm a panicking group?", correct: "Give clear, calm, short instructions", wrong: ["Shout louder", "Stay silent", "Offer many options at once"], why: "People under stress follow simple, confident directions." },
    { q: "After a drill, the most useful step is…", correct: "A debrief: record what worked and fix the gaps", wrong: ["Nothing, the drill is over", "Punish the slowest students", "Skip the next drill"], why: "Learning from each drill is how safety plans improve." },
  ],
}
