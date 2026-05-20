'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Sparkles } from 'lucide-react'
import Image from 'next/image'

/* ============================================
   TYPES
   ============================================ */

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

/* ============================================
   CONSTANTS
   ============================================ */

const QUICK_ACTIONS = [
  { label: 'Our Services', message: 'Tell me about your services' },
  { label: 'Cybersecurity', message: 'What cybersecurity solutions do you offer?' },
  { label: 'Products', message: 'Tell me about your products' },
  { label: 'Contact Us', message: 'How can I contact you?' },
]

const TYPING_INTERVAL_MS = 30

/* ============================================
   ANIMATED AI AVATAR COMPONENT
   ============================================ */

function AnimatedAIAvatar({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  }

  const ringSizes = {
    sm: 32,
    md: 40,
    lg: 48,
  }

  const s = sizeClasses[size]
  const iconSize = iconSizes[size]
  const ringSize = ringSizes[size]

  return (
    <div className={`relative ${s} shrink-0`}>
      {/* Outer rotating ring with gradient segments */}
      <svg
        className="absolute inset-0 animate-[ai-avatar-spin_6s_linear_infinite]"
        width={ringSize}
        height={ringSize}
        viewBox={`0 0 ${ringSize} ${ringSize}`}
        fill="none"
      >
        <defs>
          <linearGradient id={`ring-grad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.8" />
            <stop offset="50%" stopColor="var(--glow-color)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        <circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={ringSize / 2 - 1.5}
          stroke={`url(#ring-grad-${size})`}
          strokeWidth="1.5"
          strokeDasharray="6 4"
        />
        {/* Second ring - counter-rotating */}
        <circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={ringSize / 2 - 3.5}
          stroke="var(--primary)"
          strokeWidth="0.8"
          strokeDasharray="3 8"
          opacity="0.3"
        />
      </svg>

      {/* 3D depth glow layers */}
      <div
        className={`absolute inset-[1px] rounded-full animate-[ai-avatar-breathe_3s_ease-in-out_infinite]`}
        style={{
          background: `radial-gradient(circle at 35% 35%, var(--primary) 0%, rgba(0,240,255,0.3) 30%, transparent 70%)`,
          opacity: 0.25,
        }}
      />

      {/* Inner glow pulse */}
      <div
        className={`absolute inset-[4px] rounded-full animate-[ai-avatar-breathe_2s_ease-in-out_infinite_0.5s]`}
        style={{
          background: `radial-gradient(circle at 40% 40%, rgba(0,240,255,0.4) 0%, transparent 60%)`,
          opacity: 0.2,
        }}
      />

      {/* Main 3D sphere with gradient */}
      <div
        className={`absolute inset-[3px] rounded-full flex items-center justify-center`}
        style={{
          background: `linear-gradient(145deg, 
            rgba(0,240,255,0.15) 0%, 
            var(--card) 30%, 
            var(--secondary) 70%, 
            rgba(0,0,0,0.3) 100%)`,
          boxShadow: `
            0 0 12px var(--glow-color),
            inset 0 1px 2px rgba(255,255,255,0.15),
            inset 0 -1px 2px rgba(0,0,0,0.3)
          `,
        }}
      >
        {/* Professional AI brain icon with 3D effect */}
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
        >
          {/* Glow behind the icon */}
          <defs>
            <filter id={`icon-glow-${size}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id={`brain-grad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--primary)" />
              <stop offset="100%" stopColor="rgba(0,240,255,0.7)" />
            </linearGradient>
          </defs>
          <g filter={`url(#icon-glow-${size})`}>
            {/* Brain hemispheres */}
            <path d="M12 3C9 3 6.5 5 6.5 8c0 1.2.4 2.3 1 3" stroke={`url(#brain-grad-${size})`} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M12 3c3 0 5.5 2 5.5 5 0 1.2-.4 2.3-1 3" stroke={`url(#brain-grad-${size})`} strokeWidth="1.5" strokeLinecap="round" />
            {/* Center divide */}
            <path d="M12 3v18" stroke="var(--primary)" strokeWidth="1" opacity="0.4" />
            {/* Neural connections */}
            <path d="M8 8c-.3 1-.5 2-.5 3.5 0 2.5 1.5 4 3 5" stroke="var(--primary)" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
            <path d="M16 8c.3 1 .5 2 .5 3.5 0 2.5-1.5 4-3 5" stroke="var(--primary)" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
            {/* Animated circuit nodes */}
            <circle cx="9.5" cy="6.5" r="1.2" fill="var(--primary)" opacity="0.9">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="14.5" cy="6.5" r="1.2" fill="var(--primary)" opacity="0.9">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" begin="0.3s" />
            </circle>
            <circle cx="8" cy="11" r="0.8" fill="var(--primary)" opacity="0.6">
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.8s" repeatCount="indefinite" begin="0.6s" />
            </circle>
            <circle cx="16" cy="11" r="0.8" fill="var(--primary)" opacity="0.6">
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.8s" repeatCount="indefinite" begin="0.9s" />
            </circle>
            {/* Bottom arc */}
            <path d="M9.5 17c0 1.5 1.2 2.5 2.5 2.5s2.5-1 2.5-2.5" stroke="var(--primary)" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="11" cy="19" r="0.8" fill="var(--primary)" opacity="0.5">
              <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2.2s" repeatCount="indefinite" begin="0.4s" />
            </circle>
            <circle cx="13" cy="19" r="0.8" fill="var(--primary)" opacity="0.5">
              <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2.2s" repeatCount="indefinite" begin="0.8s" />
            </circle>
          </g>
        </svg>
      </div>
    </div>
  )
}

/* ============================================
   LIGHTWEIGHT MARKDOWN RENDERER
   ============================================ */

function renderMarkdown(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  const lines = text.split('\n')
  let i = 0
  let listItems: string[] = []
  let listType: 'ul' | 'ol' | null = null
  let inCodeBlock = false
  let codeBlockContent: string[] = []
  let codeBlockLang = ''

  const flushList = () => {
    if (listItems.length === 0) return
    if (listType === 'ul') {
      nodes.push(
        <ul key={`ul-${i}`} className="my-1.5 space-y-0.5 pl-4 list-disc list-outside">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-sm leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </ul>
      )
    } else if (listType === 'ol') {
      nodes.push(
        <ol key={`ol-${i}`} className="my-1.5 space-y-0.5 pl-4 list-decimal list-outside">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-sm leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </ol>
      )
    }
    listItems = []
    listType = null
  }

  while (i < lines.length) {
    const line = lines[i]

    // Code block fence detection
    if (line.trimStart().startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        flushList()
        nodes.push(
          <pre
            key={`codeblock-${i}`}
            className="my-2 overflow-x-auto rounded-lg bg-secondary/50 p-3 text-xs font-mono text-foreground/90 border border-border"
          >
            <code>{codeBlockContent.join('\n')}</code>
          </pre>
        )
        codeBlockContent = []
        inCodeBlock = false
        i++
        continue
      } else {
        // Start code block
        flushList()
        inCodeBlock = true
        codeBlockLang = line.trimStart().slice(3).trim()
        i++
        continue
      }
    }

    if (inCodeBlock) {
      codeBlockContent.push(line)
      i++
      continue
    }

    // Headers
    const headerMatch = line.match(/^(#{1,4})\s+(.+)/)
    if (headerMatch) {
      flushList()
      const level = headerMatch[1].length
      const headerStyles: Record<number, string> = {
        1: 'text-lg font-bold mt-3 mb-1.5',
        2: 'text-base font-bold mt-2.5 mb-1',
        3: 'text-sm font-semibold mt-2 mb-0.5',
        4: 'text-sm font-semibold mt-1.5 mb-0.5',
      }
      nodes.push(
        <div key={`h-${i}`} className={headerStyles[level] ?? 'text-sm font-semibold'}>
          {renderInline(headerMatch[2])}
        </div>
      )
      i++
      continue
    }

    // Unordered list items
    const ulMatch = line.match(/^[\s]*[-*]\s+(.+)/)
    if (ulMatch) {
      if (listType !== 'ul') {
        flushList()
        listType = 'ul'
      }
      listItems.push(ulMatch[1])
      i++
      continue
    }

    // Ordered list items
    const olMatch = line.match(/^[\s]*\d+\.\s+(.+)/)
    if (olMatch) {
      if (listType !== 'ol') {
        flushList()
        listType = 'ol'
      }
      listItems.push(olMatch[1])
      i++
      continue
    }

    // Empty line
    if (line.trim() === '') {
      flushList()
      // Add a small spacer for empty lines
      nodes.push(<div key={`br-${i}`} className="h-1.5" />)
      i++
      continue
    }

    // Regular paragraph
    flushList()
    nodes.push(
      <p key={`p-${i}`} className="text-sm leading-relaxed">
        {renderInline(line)}
      </p>
    )
    i++
  }

  // Flush any remaining list items
  flushList()

  // If still in code block at end
  if (inCodeBlock && codeBlockContent.length > 0) {
    nodes.push(
      <pre
        key="codeblock-final"
        className="my-2 overflow-x-auto rounded-lg bg-secondary/50 p-3 text-xs font-mono text-foreground/90 border border-border"
      >
        <code>{codeBlockContent.join('\n')}</code>
      </pre>
    )
  }

  return nodes
}

/** Render inline markdown: bold, italic, inline code */
function renderInline(text: string): React.ReactNode[] {
  const result: React.ReactNode[] = []
  // Process with a regex that matches: **bold**, *bold*, _italic_, `code`
  const inlineRegex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(_(.+?)_)|(`(.+?)`)/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let keyIdx = 0

  while ((match = inlineRegex.exec(text)) !== null) {
    // Text before the match
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index))
    }

    if (match[1]) {
      // **bold**
      result.push(
        <strong key={`b-${keyIdx++}`} className="font-semibold">
          {match[2]}
        </strong>
      )
    } else if (match[3]) {
      // *bold/italic*
      result.push(
        <strong key={`bi-${keyIdx++}`} className="font-semibold">
          {match[4]}
        </strong>
      )
    } else if (match[5]) {
      // _italic_
      result.push(
        <em key={`i-${keyIdx++}`} className="italic">
          {match[6]}
        </em>
      )
    } else if (match[7]) {
      // `code`
      result.push(
        <code
          key={`c-${keyIdx++}`}
          className="bg-secondary/50 px-1.5 py-0.5 rounded text-xs font-mono"
        >
          {match[8]}
        </code>
      )
    }

    lastIndex = match.index + match[0].length
  }

  // Remaining text
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex))
  }

  return result.length > 0 ? result : [text]
}

/* ============================================
   MESSAGE BUBBLE COMPONENT
   ============================================ */

function MessageBubble({
  message,
  isStreaming,
  displayedContent,
}: {
  message: Message
  isStreaming: boolean
  displayedContent: string
}) {
  const content = isStreaming ? displayedContent : message.content

  const renderedContent = useMemo(() => {
    if (message.role === 'user') return content
    return renderMarkdown(content)
  }, [content, message.role])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`mb-3 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`flex max-w-[85%] gap-2.5 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
      >
        {/* Avatar for assistant */}
        {message.role === 'assistant' && (
          <div className="mt-0.5">
            <AnimatedAIAvatar size="sm" />
          </div>
        )}
        {/* Message bubble */}
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
            message.role === 'user'
              ? 'bg-primary text-primary-foreground rounded-tr-sm'
              : 'chatbot-assistant-bubble rounded-tl-sm border border-border text-foreground whitespace-pre-wrap'
          }`}
        >
          {message.role === 'user' ? content : renderedContent}
          {isStreaming && (
            <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary align-text-bottom" />
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ============================================
   TYPING INDICATOR COMPONENT
   ============================================ */

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-3 flex justify-start"
    >
      <div className="flex max-w-[85%] gap-2.5">
        <div className="mt-0.5">
          <AnimatedAIAvatar size="sm" />
        </div>
        <div className="chatbot-assistant-bubble rounded-2xl rounded-tl-sm border border-border px-4 py-3.5">
          <div className="flex items-center gap-1.5">
            <motion.span
              className="h-2 w-2 rounded-full bg-primary"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0, ease: 'easeInOut' }}
            />
            <motion.span
              className="h-2 w-2 rounded-full bg-primary"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.15, ease: 'easeInOut' }}
            />
            <motion.span
              className="h-2 w-2 rounded-full bg-primary"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.3, ease: 'easeInOut' }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ============================================
   MAIN AI CHATBOT COMPONENT
   ============================================ */

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
  const [displayedContent, setDisplayedContent] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const typingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const streamingCompleteRef = useRef(false)
  const displayIndexRef = useRef(0)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Scroll when displayed content changes (typing effect)
  useEffect(() => {
    scrollToBottom()
  }, [displayedContent, messages, scrollToBottom])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Per-character typing effect
  useEffect(() => {
    // Clean up any existing timer
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current)
      typingTimerRef.current = null
    }

    if (!streamingContent) {
      setDisplayedContent('')
      displayIndexRef.current = 0
      return
    }

    // If streaming just completed or content is shorter/equal, snap immediately
    if (streamingCompleteRef.current || streamingContent.length <= displayIndexRef.current) {
      setDisplayedContent(streamingContent)
      displayIndexRef.current = streamingContent.length
      streamingCompleteRef.current = false
      return
    }

    typingTimerRef.current = setInterval(() => {
      const currentIdx = displayIndexRef.current
      if (currentIdx < streamingContent.length) {
        // Add 1-2 characters at a time for natural feel
        const charsToAdd = Math.min(2, streamingContent.length - currentIdx)
        displayIndexRef.current = currentIdx + charsToAdd
        setDisplayedContent(streamingContent.slice(0, displayIndexRef.current))
      } else {
        // Caught up - clear interval
        if (typingTimerRef.current) {
          clearInterval(typingTimerRef.current)
          typingTimerRef.current = null
        }
      }
    }, TYPING_INTERVAL_MS)

    return () => {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current)
        typingTimerRef.current = null
      }
    }
  }, [streamingContent])

  const sendMessage = useCallback(
    async (messageText?: string) => {
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
      setDisplayedContent('')
      streamingCompleteRef.current = false
      displayIndexRef.current = 0

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

        // Streaming complete - snap to full content immediately
        streamingCompleteRef.current = true
        displayIndexRef.current = fullContent.length
        setDisplayedContent(fullContent)

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
          console.error('Chat error:', error)
          const errorMessage: Message = {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content:
              "I apologize, but I'm having trouble responding right now. Please try again or contact our team directly through the contact form.",
          }
          setMessages((prev) => [...prev, errorMessage])
        }
        setStreamingContent('')
        setDisplayedContent('')
        displayIndexRef.current = 0
      } finally {
        setIsTyping(false)
        abortControllerRef.current = null
        streamingCompleteRef.current = false
      }
    },
    [input, isTyping, messages]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        sendMessage()
      }
    },
    [sendMessage]
  )

  const handleClose = useCallback(() => {
    setIsOpen(false)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current)
      typingTimerRef.current = null
    }
  }, [])

  const handleQuickAction = useCallback(
    (message: string) => {
      sendMessage(message)
    },
    [sendMessage]
  )

  // Memoize message list to avoid re-rendering all messages on typing tick
  // Only the streaming message re-renders due to displayedContent
  const memoizedMessages = useMemo(() => messages, [messages])

  // Determine streaming state
  const isCurrentlyStreaming = isTyping && streamingContent.length > 0

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
            className="fixed bottom-6 right-6 z-50"
          >
            {/* Tooltip */}
            <div className="absolute -top-10 right-0 whitespace-nowrap rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none">
              Chat with AI
              <div className="absolute -bottom-1 right-4 h-2 w-2 rotate-45 bg-foreground" />
            </div>

            <motion.button
              onClick={() => setIsOpen(true)}
              className="group relative flex h-16 w-16 items-center justify-center rounded-full"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              aria-label="Open AI Chat"
            >
              {/* Rotating gradient ring */}
              <span className="chatbot-ring absolute inset-0 rounded-full" />

              {/* Pulse rings */}
              <span className="absolute inset-0 rounded-full bg-primary/20 animate-[chatbot-pulse_2.5s_ease-in-out_infinite]" />
              <span className="absolute inset-0 rounded-full bg-primary/10 animate-[chatbot-pulse_2.5s_ease-in-out_infinite_0.5s]" />

              {/* Inner circle with static avatar image (floating button only) */}
              <span className="absolute inset-[3px] rounded-full bg-card flex items-center justify-center overflow-hidden shadow-lg">
                <Image
                  src="/ai-avatar.png"
                  alt="AI Assistant"
                  width={52}
                  height={52}
                  className="h-full w-full object-cover rounded-full"
                  priority
                  sizes="52px"
                />
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop overlay - click outside to close (mobile only) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] sm:bg-black/30 sm:backdrop-blur-sm"
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
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col overflow-hidden rounded-2xl chat-panel shadow-2xl w-[calc(100vw-2rem)] sm:w-[420px] h-[min(calc(100vh-4rem),580px)] sm:h-[580px]"
            role="dialog"
            aria-label="AI Chat"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between chat-header px-4 py-3.5">
              <div className="flex items-center gap-3">
                {/* Animated AI Avatar in header */}
                <div className="animate-[ai-avatar-breathe_3s_ease-in-out_infinite]">
                  <AnimatedAIAvatar size="md" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    ABWcurious AI
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="relative flex h-2 w-2" aria-hidden="true">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Online</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-secondary hover:text-foreground hover:rotate-90 duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
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
                <p className="text-[11px] text-muted-foreground mb-2 font-medium">
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
                      className="rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-primary/10 hover:text-primary hover:border-primary/30 backdrop-blur-sm"
                    >
                      {action.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-3 scroll-smooth chat-messages-area" role="log" aria-label="Chat messages" aria-live="polite">
              {memoizedMessages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isStreaming={false}
                  displayedContent={message.content}
                />
              ))}

              {/* Streaming message with typing effect */}
              {isCurrentlyStreaming && (
                <MessageBubble
                  message={{
                    id: 'streaming',
                    role: 'assistant',
                    content: streamingContent,
                  }}
                  isStreaming={true}
                  displayedContent={displayedContent}
                />
              )}

              {/* Typing indicator (before streaming starts) */}
              {isTyping && !streamingContent && <TypingIndicator />}

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
                  aria-label="Type your message"
                  className="flex-1 chat-input rounded-xl px-4 py-2.5 text-sm outline-none transition-colors disabled:opacity-50"
                />
                <motion.button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isTyping}
                  className="chatbot-send-btn flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.92 }}
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </motion.button>
              </div>
              <p className="mt-2 text-center text-[10px] text-muted-foreground/60 flex items-center justify-center gap-1">
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
