"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { USER_ROLES } from "@/app/constants"
import { auth } from "@/lib/firebase"
import { safetyChatbotFlow, type Message } from "@/ai/flows/safety-chatbot"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, User, X, MessageSquare, Send, Sparkles, Loader2, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

export function SafetyChatbot() {
  const { profile } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const userTier = profile?.role === USER_ROLES.ADMINISTRATOR ? "admin" 
                 : profile?.role === USER_ROLES.TEACHER ? "teacher" 
                 : profile?.tier || "primary"

  const getGreeting = () => {
    switch (userTier) {
      case 'admin': return "Hi Admin! I'm Suraksha. I can help you with school safety reports, drills, managing emergency alerts, and NDMA compliance."
      case 'teacher': return "Hello! I'm Suraksha. Ask me about your class's safety training, running mock drills, or assigning modules."
      case 'secondary': return "Hi there! I'm Suraksha. Ready to learn about disaster safety or check your Hero Path progress?"
      default: return "Hi! I'm Suraksha, your AI Safety Companion. Let's learn how to stay safe!"
    }
  }

  const [messages, setMessages] = useState<Message[]>([
    { role: "model", content: getGreeting() }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])



  const [lastMessageTime, setLastMessageTime] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Client-side debounce / cooldown (1 second)
    const now = Date.now()
    if (now - lastMessageTime < 1000) return
    setLastMessageTime(now)

    const userMessage: Message = { role: "user", content: input.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Get Firebase ID token for authentication
      const currentUser = auth.currentUser
      if (!currentUser) {
        throw new Error("You must be logged in to use the chatbot")
      }

      const idToken = await currentUser.getIdToken()

      // Call authenticated API with Bearer token
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userTier
        })
      })

      if (response.status === 401) {
        throw new Error("Authentication failed. Please log in again.")
      }

      if (response.status === 429) {
        const data = await response.json()
        throw new Error(data.error || "Rate limit exceeded. Please wait a minute before sending more messages.")
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to get response")
      }

      const data = await response.json()
      setMessages(prev => [...prev, { role: "model", content: data.reply }])
    } catch (error) {
      console.error("Chatbot error:", error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : "I'm having trouble connecting to my safety database right now. Please try again later."
      
      setMessages(prev => [...prev, { role: "model", content: errorMessage }])
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 size-14 rounded-full shadow-2xl bg-accent hover:bg-accent/90 text-accent-foreground p-0 z-50 group hover:scale-105 transition-transform"
      >
        <Sparkles className="size-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all text-white/50" />
        <MessageSquare className="size-6 group-hover:opacity-0 transition-all" />
      </Button>
    )
  }

  return (
    <Card className={cn(
      "fixed bottom-6 right-6 w-[350px] shadow-2xl border-accent/20 z-50 flex flex-col transition-all duration-300",
      isMinimized ? "h-[60px]" : "h-[500px]"
    )}>
      <CardHeader className="p-3 pb-2 border-b bg-muted/30 flex flex-row items-center justify-between space-y-0 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-accent/10 rounded-lg">
            <Bot className="size-4 text-accent" />
          </div>
          <div>
            <CardTitle className="text-sm font-headline font-bold">Suraksha AI</CardTitle>
            <CardDescription className="text-[10px]">NDMA Safety Companion</CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="size-6" onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized) }}>
            <Minus className="size-3" />
          </Button>
          <Button variant="ghost" size="icon" className="size-6" onClick={(e) => { e.stopPropagation(); setIsOpen(false) }}>
            <X className="size-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={cn(
                    "flex gap-2 max-w-[85%]",
                    msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}>
                    <div className={cn(
                      "size-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                      msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-accent/20 text-accent"
                    )}>
                      {msg.role === "user" ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
                    </div>
                    <div className={cn(
                      "p-2.5 rounded-xl text-xs",
                      msg.role === "user" 
                        ? "bg-primary text-primary-foreground rounded-tr-sm" 
                        : "bg-muted rounded-tl-sm"
                    )}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-2 max-w-[85%] mr-auto">
                    <div className="size-6 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0">
                      <Bot className="size-3.5" />
                    </div>
                    <div className="p-2.5 rounded-xl bg-muted rounded-tl-sm flex items-center gap-1">
                      <span className="size-1.5 bg-accent/50 rounded-full animate-bounce" />
                      <span className="size-1.5 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="size-1.5 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="p-3 pt-2 border-t bg-background">
            <form onSubmit={handleSubmit} className="flex w-full gap-2">
              <Input 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder="Ask about safety..." 
                className="flex-1 h-9 text-xs"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" className="h-9 w-9 bg-accent hover:bg-accent/90" disabled={!input.trim() || isLoading}>
                {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </Button>
            </form>
          </CardFooter>
        </>
      )}
    </Card>
  )
}
