"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
  SendIcon,
  BotIcon,
  UserIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SparklesIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface TranscriptionResult {
  transcription: string
  segments: any[]
  words: any[]
  pauses: Pause[]
  duration: number
}

interface Pause {
  start: number
  end: number
  duration: number
  type: "short" | "awkward" | "long"
}

interface EditorChatbotProps {
  onAction?: (action: string, params?: any) => void
  transcriptionResult?: TranscriptionResult | null
}

export function EditorChatbot({ onAction, transcriptionResult }: EditorChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your video editing assistant. I can help you with tasks like adding clips, adjusting timing, applying effects, and more. What would you like to do?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      let responseContent = ""

      // Check if user is asking about pauses and we have transcription data
      const lowerInput = input.toLowerCase()
      const isPauseQuery =
        lowerInput.includes("pause") ||
        lowerInput.includes("awkward") ||
        lowerInput.includes("silence") ||
        lowerInput.includes("gap")

      if (isPauseQuery && transcriptionResult) {
        const awkwardPauses = transcriptionResult.pauses.filter(
          (p) => p.type === "awkward" || p.type === "long"
        )

        if (awkwardPauses.length > 0) {
          const formatTime = (seconds: number) => {
            const mins = Math.floor(seconds / 60)
            const secs = Math.floor(seconds % 60)
            return `${mins}:${secs.toString().padStart(2, "0")}`
          }

          responseContent = `I found ${awkwardPauses.length} awkward or long pause${
            awkwardPauses.length > 1 ? "s" : ""
          } in your audio:\n\n`

          awkwardPauses.slice(0, 3).forEach((pause, idx) => {
            responseContent += `${idx + 1}. ${pause.type.charAt(0).toUpperCase() + pause.type.slice(1)} pause (${pause.duration.toFixed(1)}s) at ${formatTime(pause.start)}\n`
          })

          if (awkwardPauses.length > 3) {
            responseContent += `\n...and ${awkwardPauses.length - 3} more. `
          }

          responseContent +=
            "\n\nI recommend cutting or trimming these sections for a smoother flow. Click on any pause in the panel to jump to that timestamp."
        } else {
          responseContent =
            "Great news! I didn't find any awkward pauses in your audio. The pacing looks good!"
        }
      } else if (transcriptionResult && lowerInput.includes("transcript")) {
        responseContent = `Here's your transcript:\n\n"${transcriptionResult.transcription}"\n\nDuration: ${Math.floor(transcriptionResult.duration / 60)}:${Math.floor(transcriptionResult.duration % 60).toString().padStart(2, "0")}`
      } else {
        const responses = [
          "I'll help you with that! Let me process your request.",
          "Great idea! I can add that to your timeline.",
          "I've noted that. Would you like me to apply this change?",
          "That's a good suggestion. I'll adjust the settings accordingly.",
          "Perfect! I'll update the video with those parameters.",
        ]
        responseContent = responses[Math.floor(Math.random() * responses.length)]
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)

      // Trigger action if callback provided
      if (onAction) {
        onAction("chat-command", { message: input.trim() })
      }
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const quickActions = transcriptionResult
    ? [
        { label: "Show awkward pauses", action: "show-pauses" },
        { label: "View transcript", action: "view-transcript" },
        { label: "Edit around pauses", action: "edit-pauses" },
        { label: "Add captions", action: "add-captions" },
      ]
    : [
        { label: "Add caption", action: "add-caption" },
        { label: "Trim clip", action: "trim-clip" },
        { label: "Add transition", action: "add-transition" },
        { label: "Export video", action: "export" },
      ]

  return (
    <Card className="flex flex-col border-t shadow-lg">
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 border-b bg-muted/30 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <SparklesIcon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">
              Ask me anything about editing
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          {isExpanded ? (
            <ChevronDownIcon className="h-4 w-4" />
          ) : (
            <ChevronUpIcon className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Chat Content */}
      {isExpanded && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-80 min-h-[200px]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <BotIcon className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-lg px-4 py-2 max-w-[80%]",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <UserIcon className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <BotIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce delay-100" />
                    <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-2 border-t bg-muted/20">
            <div className="flex gap-2 flex-wrap">
              {quickActions.map((action) => (
                <Button
                  key={action.action}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    setInput(action.label)
                    inputRef.current?.focus()
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me to help with your video..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
              >
                <SendIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  )
}
