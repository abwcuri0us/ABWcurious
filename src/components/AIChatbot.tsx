'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Sparkles } from 'lucide-react'
import AIAvatar from '@/components/AIAvatar'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const QUICK_ACTIONS = [
  { label: 'Our Services', message: 'Tell me about your services' },
  { label: 'Cybersecurity', message: 'What cybersecurity solutions do you offer?' },
  { label: 'Products', message: 'Tell me about your products' },
  { label: 'Contact Us', message: 'How can I contact you?' },
]

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hello! I'm the ABWcurious AI Assistant. How can I help you today? Ask me about our services in cybersecurity, AI, software development, or digital transformation.",
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingContent, scrollToBottom])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const sendMessage = async (messageText?: string) => {
    const trimmed = (messageText || input).trim()
    if (!trimmed || isTyping) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)
    setStreamingContent('')

    // Build conversation history for context (last 10 messages)
    const conversationHistory = messages
      .filter((m) => m.id !== 'welcome')
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }))

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          conversationHistory,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response stream')

      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        fullContent += chunk
        setStreamingContent(fullContent)
      }

      // Add the complete assistant message
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: fullContent,
      }
      setMessages((prev) => [...prev, assistantMessage])
      setStreamingContent('')
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        // User cancelled
      } else {
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content:
            "I apologize, but I'm having trouble responding right now. Please try again or contact our team directly through the contact form.",
        }
        setMessages((prev) => [...prev, errorMessage])
      }
      setStreamingContent('')
    } finally {
      setIsTyping(false)
      abortControllerRef.current = null
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  const handleQuickAction = (message: string) => {
    sendMessage(message)
  }

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="group fixed bottom-6 right-6 z-[60]"
            style={{ willChange: 'transform, opacity' }}
          >
            {/* Tooltip */}
            <div className="absolute -top-10 right-0 whitespace-nowrap rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none">
              Chat with AI
              <div className="absolute -bottom-1 right-4 h-2 w-2 rotate-45 bg-foreground" />
            </div>

            <motion.button
              onClick={() => setIsOpen(true)}
              className="group relative flex h-16 w-16 items-center justify-center rounded-full"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              animate={{ y: [0, -4, 0] }}
              transition={{
                y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                scale: { duration: 0.2 },
              }}
              style={{ willChange: 'transform' }}
              aria-label="Open AI Chat"
            >
              {/* Rotating gradient ring - more visible */}
              <span className="chatbot-ring absolute inset-[-2px] rounded-full opacity-90" />

              {/* Pulse rings - more prominent */}
              <span className="absolute inset-0 rounded-full bg-primary/30 animate-[chatbot-pulse_2s_ease-in-out_infinite]" />
              <span className="absolute inset-0 rounded-full bg-primary/15 animate-[chatbot-pulse_2s_ease-in-out_infinite_0.6s]" />
              <span className="absolute inset-0 rounded-full bg-primary/5 animate-[chatbot-pulse_2s_ease-in-out_infinite_1.2s]" />

              {/* Inner circle with avatar */}
              <span className="absolute inset-[3px] rounded-full bg-card flex items-center justify-center overflow-hidden shadow-lg">
                <AIAvatar size={52} />
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop overlay - click outside to close */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[55] bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="fixed bottom-6 right-6 z-[60] flex flex-col overflow-hidden rounded-2xl chat-panel shadow-2xl w-[calc(100vw-2rem)] sm:w-[420px] h-[min(calc(100vh-6rem),580px)] sm:h-[580px]"
            style={{ willChange: 'transform, opacity' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between chat-header px-4 py-3.5">
              <div className="flex items-center gap-3">
                {/* AI Avatar with breathing glow */}
                <motion.div
                  className="relative"
                  animate={{
                    boxShadow: [
                      '0 0 8px rgba(0, 240, 255, 0.2), 0 0 16px rgba(0, 240, 255, 0.1)',
                      '0 0 16px rgba(0, 240, 255, 0.4), 0 0 32px rgba(0, 240, 255, 0.2)',
                      '0 0 8px rgba(0, 240, 255, 0.2), 0 0 16px rgba(0, 240, 255, 0.1)',
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full overflow-hidden bg-card ring-2 ring-primary/30">
                    <AIAvatar size={40} excited={isOpen} />
                  </div>
                </motion.div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    ABWcurious AI
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <p className="text-[11px] text-emerald-500 font-medium">Online</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-secondary hover:text-foreground hover:rotate-90 duration-200"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Action Buttons */}
            {messages.length <= 1 && !isTyping && !streamingContent && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="px-4 pb-3 pt-1"
              >
                <p className="text-[11px] text-muted-foreground dark:text-gray-400 mb-2 font-medium">
                  Quick Actions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_ACTIONS.map((action, index) => (
                    <motion.button
                      key={action.label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: 0.3 + index * 0.05 }}
                      onClick={() => handleQuickAction(action.message)}
                      whileHover={{ scale: 1.04, y: -1 }}
                      whileTap={{ scale: 0.96 }}
                      className="chat-quick-action rounded-full border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-primary/10 hover:text-primary hover:border-primary/30 backdrop-blur-sm"
                    >
                      {action.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-3 scroll-smooth chat-messages-area">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index === 0 ? 0 : 0.05 }}
                  className={`mb-3 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex max-w-[85%] gap-2.5 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar for assistant */}
                    {message.role === 'assistant' && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full overflow-hidden bg-card ring-1 ring-primary/20 mt-0.5">
                        <AIAvatar size={32} />
                      </div>
                    )}
                    {/* Message bubble */}
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        message.role === 'user'
                          ? 'chat-user-bubble rounded-tr-sm text-white'
                          : 'chatbot-assistant-bubble rounded-tl-sm text-foreground dark:text-[#e8edf5]'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Streaming content */}
              {streamingContent && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3 flex justify-start"
                >
                  <div className="flex max-w-[85%] gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full overflow-hidden bg-card ring-1 ring-primary/20 mt-0.5">
                      <AIAvatar size={32} />
                    </div>
                    <div className="chatbot-assistant-bubble rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm leading-relaxed text-foreground dark:text-[#e8edf5]">
                      {streamingContent}
                      <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Typing indicator */}
              {isTyping && !streamingContent && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3 flex justify-start"
                >
                  <div className="flex max-w-[85%] gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full overflow-hidden bg-card ring-1 ring-primary/20 mt-0.5">
                      <AIAvatar size={32} />
                    </div>
                    <div className="chatbot-assistant-bubble rounded-2xl rounded-tl-sm px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <motion.span
                          className="h-2 w-2 rounded-full bg-primary"
                          animate={{ y: [0, -6, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: 0,
                            ease: 'easeInOut',
                          }}
                        />
                        <motion.span
                          className="h-2 w-2 rounded-full bg-primary"
                          animate={{ y: [0, -6, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: 0.15,
                            ease: 'easeInOut',
                          }}
                        />
                        <motion.span
                          className="h-2 w-2 rounded-full bg-primary"
                          animate={{ y: [0, -6, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: 0.3,
                            ease: 'easeInOut',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="chat-input-area px-4 py-3">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about our services..."
                  disabled={isTyping}
                  className="flex-1 chat-input rounded-xl px-4 py-2.5 text-sm outline-none transition-colors disabled:opacity-50"
                />
                <motion.button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isTyping}
                  className="chatbot-send-btn flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.92 }}
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </motion.button>
              </div>
              <p className="mt-2 text-center text-[10px] text-muted-foreground dark:text-gray-500 flex items-center justify-center gap-1">
                <Sparkles className="h-2.5 w-2.5" />
                Powered by ABWcurious AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
