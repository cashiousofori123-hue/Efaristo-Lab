"use client"

import { useEffect, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Send, X } from "lucide-react"

export function DraculaAssistant() {
  const [open, setOpen] = useState(false)
  const [showBubble, setShowBubble] = useState(false)
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })

  // Recurring "Chat with Dracula" bubble every 8s when closed.
  useEffect(() => {
    if (open) {
      setShowBubble(false)
      return
    }
    const interval = setInterval(() => {
      setShowBubble(true)
      setTimeout(() => setShowBubble(false), 3500)
    }, 8000)
    return () => clearInterval(interval)
  }, [open])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, open])

  // After an error the chat stays usable, so the customer can simply ask again.
  const busy = status === "submitted" || status === "streaming"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || busy) return
    sendMessage({ text })
    setInput("")
  }

  return (
    <>
      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[70vh] max-h-[560px] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:right-6">
          <div
            className="flex items-center justify-between gap-2 px-4 py-3 text-white"
            style={{ backgroundColor: "var(--brand)" }}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden>
                🧛‍♂️
              </span>
              <div>
                <p className="text-sm font-bold leading-tight">Dracula</p>
                <p className="text-[11px] opacity-90">Your friendly tech vampire</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded-full p-1 transition-colors hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="rounded-2xl rounded-tl-sm bg-muted p-3 text-sm">
                Good evening! 🧛‍♂️ I&apos;m Dracula, resident tech vampire at Efaristo Fix Tech Lab. Ask me about our
                repairs, prices, or our labs in Accra &amp; Assin Fosu — no bites, only fixes!
              </div>
            )}

            {messages.map((message) => {
              const text = message.parts
                .map((p) => (p.type === "text" ? p.text : ""))
                .join("")
              const isUser = message.role === "user"
              return (
                <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl p-3 text-sm ${
                      isUser
                        ? "rounded-tr-sm text-white"
                        : "rounded-tl-sm bg-muted text-foreground"
                    }`}
                    style={isUser ? { backgroundColor: "var(--brand)" } : undefined}
                  >
                    {text}
                  </div>
                </div>
              )
            })}

            {error && !busy && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-muted p-3 text-sm text-foreground">
                  Sorry, I couldn&apos;t answer just now 🧛‍♂️. Try again, or call / WhatsApp us on{" "}
                  <a href="https://wa.me/233554068969" target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                    0554068969
                  </a>
                  .
                </div>
              </div>
            )}

            {status === "submitted" && (
              <div className="flex justify-start">
                <div className="flex gap-1 rounded-2xl rounded-tl-sm bg-muted p-3">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/50 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/50 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/50" />
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Dracula anything..."
              className="min-w-0 flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-[var(--brand)]"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send message"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-opacity disabled:opacity-40"
              style={{ backgroundColor: "var(--brand)" }}
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating button + bubble */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 sm:right-6">
        {showBubble && !open && (
          <div className="animate-fade-up rounded-full border border-border bg-card px-4 py-2 text-sm font-medium shadow-lg">
            Chat with Dracula 🧛‍♂️
          </div>
        )}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Open Dracula chat assistant"
          className="flex h-14 w-14 items-center justify-center rounded-full text-3xl shadow-xl transition-transform hover:scale-110"
          style={{ backgroundColor: "var(--brand)" }}
        >
          <span aria-hidden>🧛‍♂️</span>
        </button>
      </div>
    </>
  )
}
