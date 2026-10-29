import { NextRequest, NextResponse } from "next/server"
import { safetyChatbotFlow } from "@/ai/flows/safety-chatbot"
import { withAuthAndRateLimit } from "@/lib/api-auth"
import { evaluateChatbotQuery, UserTier } from "@/lib/chatbot-guard"
import { USER_ROLES } from "@/app/constants"

export const POST = withAuthAndRateLimit(async (req: NextRequest, user) => {
  try {
    const body = await req.json()
    const { messages, userTier: clientTier } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 })
    }

    // Validate messages format
    const hasInvalidMessage = messages.some(
      (msg) => !msg.role || !msg.content || typeof msg.content !== 'string'
    )
    if (hasInvalidMessage) {
      return NextResponse.json(
        { error: "Each message must have 'role' and 'content' fields" },
        { status: 400 }
      )
    }

    // Determine secure user tier, override client tier to prevent spoofing
    let userTier: UserTier = 'primary'
    if (user.role === USER_ROLES.ADMINISTRATOR) {
      userTier = 'admin'
    } else if (user.role === USER_ROLES.TEACHER) {
      userTier = 'teacher'
    } else if (clientTier === 'secondary') {
      userTier = 'secondary'
    }

    // Pre-flight content check on the latest user message
    const latestUserMessage = [...messages].reverse().find(m => m.role === 'user')
    if (latestUserMessage) {
      const guardResult = evaluateChatbotQuery(latestUserMessage.content, userTier)
      if (!guardResult.isAllowed) {
        return NextResponse.json({
          reply: guardResult.suggestedReply,
          meta: { blocked: true, reason: guardResult.reason }
        })
      }
    }

    // Call the Genkit flow with authenticated user context
    const reply = await safetyChatbotFlow({
      messages,
      userTier,
    })

    // Log usage for monitoring (optional)
    console.log(`Chat request from user ${user.uid} (${user.role}), messages: ${messages.length}`)

    return NextResponse.json({ 
      reply,
      // Include metadata for client (optional)
      meta: {
        userId: user.uid,
        role: user.role,
      }
    })
  } catch (error) {
    console.error("Chat API Error:", error)
    return NextResponse.json(
      { 
        error: "Failed to generate response",
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
})
