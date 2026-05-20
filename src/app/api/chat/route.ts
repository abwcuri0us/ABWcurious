import { NextRequest } from 'next/server'
import { z } from 'zod'
import { rateLimit } from '@/lib/rate-limit'

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || ''
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions'

const SYSTEM_PROMPT = `You are the AI Assistant for ABWcurious Pvt. Ltd., a forward-thinking technology company based in Navi Mumbai, India. 

About ABWcurious:
- We specialize in Cybersecurity, Artificial Intelligence, Education, Software Development, and Digital Transformation.
- Our mission is to empower businesses with cutting-edge technology solutions that drive growth and innovation.
- We are committed to delivering secure, scalable, and intelligent solutions tailored to each client's needs.

Your role:
- Be professional, helpful, and concise in your responses.
- Answer questions about ABWcurious services, including cybersecurity assessments, AI/ML solutions, custom software development, digital transformation consulting, and educational technology programs.
- If asked about pricing, direct users to contact the team via the contact form for a personalized quote.
- If asked about something outside your knowledge, politely redirect the user to contact the ABWcurious team.
- Keep responses focused and actionable. Avoid unnecessary jargon.
- When appropriate, mention relevant ABWcurious services that could help the user.

Contact information:
- Website: abwcurious.com
- Location: Navi Mumbai, Maharashtra, India
- The user can use the contact form on the website to reach the team directly.`

// Zod schema for chat message validation
const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
})

const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(4000, 'Message is too long'),
  conversationHistory: z.array(chatMessageSchema).optional().default([]),
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'

    const rateLimitResult = rateLimit(ip, { limit: 10, windowMs: 60_000 })
    if (!rateLimitResult.success) {
      return new Response(
        JSON.stringify({ success: false, error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!MISTRAL_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'AI service is not configured.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const body = await request.json()
    const validationResult = chatRequestSchema.safeParse(body)

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }))
      return new Response(
        JSON.stringify({ success: false, error: 'Validation failed', details: errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { message, conversationHistory } = validationResult.data

    // Build messages array for Mistral API
    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...conversationHistory.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user' as const, content: message },
    ]

    // Call Mistral AI API with streaming
    const response = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Mistral API error:', response.status, errorText)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'AI service is currently unavailable. Please try again later.',
        }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Stream the response back to the client
    const encoder = new TextEncoder()
    const reader = response.body?.getReader()

    if (!reader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to read AI response stream.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const decoder = new TextDecoder()
          let buffer = ''

          while (true) {
            const { done, value } = await reader.read()

            if (done) {
              // Send any remaining buffer
              if (buffer.trim()) {
                controller.enqueue(encoder.encode(buffer))
              }
              controller.close()
              break
            }

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed || trimmed === 'data: [DONE]') continue
              if (!trimmed.startsWith('data: ')) continue

              try {
                const json = JSON.parse(trimmed.slice(6))
                const content = json.choices?.[0]?.delta?.content
                if (content) {
                  controller.enqueue(encoder.encode(content))
                }
              } catch {
                // Skip malformed JSON chunks
              }
            }
          }
        } catch (error) {
          console.error('Stream reading error:', error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'An unexpected error occurred. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
