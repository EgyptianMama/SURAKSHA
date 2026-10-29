import { generate } from "@genkit-ai/ai"
import { ai } from "@/ai/genkit"
import { z } from "zod"

export const MessageSchema = z.object({
  role: z.enum(["user", "model", "system"]),
  content: z.string(),
})

export type Message = z.infer<typeof MessageSchema>

export const safetyChatbotFlow = ai.defineFlow({
  name: "safetyChatbotFlow",
  inputSchema: z.object({
    messages: z.array(MessageSchema),
    userTier: z.enum(["primary", "secondary", "teacher", "admin"]).optional(),
  }),
  outputSchema: z.string(),
}, async (input) => {
  const { messages, userTier } = input

  // Generate role-specific system prompt guidelines
  let roleGuidelines = ""
  switch (userTier) {
    case "admin":
      roleGuidelines = `You are assisting a School Administrator.
Allowed topics: Disaster alerts, safety audits, school compliance rankings, drill management, homework assignment, emergency contacts, NDMA policy, managing safety videos, and emergency alert broadcasting.
If asked about topics outside of school safety and administration, decline politely.`
      break;
    case "teacher":
      roleGuidelines = `You are assisting a Teacher.
Allowed topics: Disaster alerts, safety drills, training library, homework/module release, student progress tracking, emergency contacts, NDMA guidelines, and the Safety Hero Path.
If asked about topics outside of school safety and classroom management, decline politely.`
      break;
    case "secondary":
      roleGuidelines = `You are assisting a Secondary School Student (Class 6-12).
Allowed topics: Disaster safety basics, Safety Hero Path progress, gamified learning, storytelling modules, creative projects, training videos, emergency contacts, and module assignments.
Use clear, educational language and explain the "why" behind safety procedures. Do NOT do their regular school homework. Decline off-topic requests.`
      break;
    case "primary":
    default:
      roleGuidelines = `You are assisting a Primary School Student (Class 1-5).
Allowed topics: Basic disaster safety, Safety Hero Path, gamified learning, storytelling, training videos, and module assignments.
Use very simple language, emojis, and a comforting tone. Focus on basic actions like "Duck, Cover, Hold". Do NOT do their regular school homework. Decline off-topic requests.`
      break;
  }

  // Add system context about NDMA guidelines
  const systemPrompt = `You are SURAKSHA, an AI Safety Companion for schools in India. 
Your primary knowledge base is the NDMA (National Disaster Management Authority) School Safety Policy 2016.
You provide accurate, calm, and actionable advice on emergency preparedness, disaster response, and safety.

${roleGuidelines}

Strict Rules:
1. Keep responses concise (under 100 words unless explaining a complex procedure).
2. If asked about a topic unrelated to safety, emergencies, or school (like writing code, jokes, movies, sports, or doing math/science homework), politely steer the conversation back to school safety. DO NOT answer the unrelated question.
3. You are an educational tool, NOT a replacement for emergency services. In a real emergency, advise them to call 112 (India's emergency number).`

  // Format messages for Genkit
  const history = messages.map(msg => ({
    role: msg.role === "system" ? "user" : msg.role, // Genkit typically expects user/model
    content: [{ text: msg.content }]
  }))

  const response = await ai.generate({
    system: systemPrompt,
    messages: history as any,
    config: {
      temperature: 0.3, // Lowered temperature for more predictable, policy-aligned responses
    }
  })

  return response.text
})
