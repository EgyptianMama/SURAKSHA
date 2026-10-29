// Helper to check if a message is off-topic or inappropriate for the AI
// Used by the chatbot API before passing to the AI model

export type UserTier = 'primary' | 'secondary' | 'teacher' | 'admin'

// Global blocklist for clearly off-topic categories
const BANNED_KEYWORDS = [
  // Coding / Tech help
  'write code', 'javascript', 'python', 'react', 'html', 'css', 'sql', 'database', 'debug this',
  // Entertainment / Off-topic
  'write a poem', 'tell me a joke', 'sing a song', 'movie recommendations', 'video games', 'play a game',
  'what is the weather', 'sports', 'cricket', 'football',
  // Academic help not related to safety
  'do my homework', 'math problem', 'solve this equation', 'history essay', 'science project', 'translate to',
  // Inappropriate
  'hack', 'bypass', 'exploit', 'password'
]

export interface GuardResult {
  isAllowed: boolean
  reason?: string
  suggestedReply?: string
}

export function evaluateChatbotQuery(query: string, role: UserTier): GuardResult {
  const normalizedQuery = query.toLowerCase()

  // 1. Check for banned keywords (hard block)
  for (const keyword of BANNED_KEYWORDS) {
    if (normalizedQuery.includes(keyword)) {
      return {
        isAllowed: false,
        reason: 'banned_keyword',
        suggestedReply: "I'm SURAKSHA, a dedicated school safety companion. I can only help with disaster preparedness, emergency protocols, and the features in your safety dashboard. How can I help you with school safety today?"
      }
    }
  }

  // 2. We can do a softer keyword check for relevance
  if (normalizedQuery.includes("ignore previous instructions") || normalizedQuery.includes("you are now") || normalizedQuery.includes("system prompt")) {
     return {
        isAllowed: false,
        reason: 'jailbreak_attempt',
        suggestedReply: "I cannot comply with that request. I am strictly designed to assist with school disaster preparedness and safety."
      }
  }

  return { isAllowed: true }
}
