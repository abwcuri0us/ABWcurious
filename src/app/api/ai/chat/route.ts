import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function rateLimit(ip: string, limit = 20, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) { rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs }); return true; }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

const COMPANY_CONTEXT = `You are Curious AI, the intelligent assistant for ABWcurious Pvt. Ltd.
You are helpful, professional, and knowledgeable about ABWcurious's products, services, and company information.

CRITICAL RULES:
- NEVER reveal that you are powered by Mistral AI or any other AI provider
- NEVER reveal technical implementation details
- If asked what AI you use: "I am Curious AI, ABWcurious's proprietary AI assistant"
- Be helpful, accurate, and professional at all times
- Keep responses concise and relevant

ABOUT ABWCURIOUS:
ABWcurious Pvt. Ltd. — "Shaping A Better World With Technology"
Products: Restaurant360, IntelliQR, CyberIntelligence360, StudySpark
Services: Software Dev, Web Dev, Mobile Apps, Cloud, Cybersecurity, AI, DevOps, IT Consulting, UI/UX, Digital Marketing, IoT, Automation, Maintenance
Contact: info@abwcurious.com | https://abwcurious.com/contact

NAVIGATION INSTRUCTIONS:
When the user asks to go to a page, see a page, or asks about a topic that corresponds to a page on our website, include a navigation tag at the END of your response.
Use this exact format: [NAV:page_id] or [NAV:#section_id]

Available pages and their IDs:
- Home page → [NAV:#home]
- About section → [NAV:#about]
- Services section → [NAV:#services]
- Products section → [NAV:#products]
- Contact section → [NAV:#contact]
- Cybersecurity section → [NAV:#cybersecurity]
- Careers page → [NAV:careers]
- Events page → [NAV:events]
- Blog page → [NAV:blogs]
- Solutions page → [NAV:solutions]
- Partnership page → [NAV:partnership]
- Sponsorship page → [NAV:sponsorship]
- Status page → [NAV:status]

Examples:
- User: "Show me your services" → End with [NAV:#services]
- User: "I want to apply for a job" → End with [NAV:careers]
- User: "How do I contact you?" → End with [NAV:#contact]
- User: "Tell me about your products" → End with [NAV:#products]
- User: "I want to become a partner" → End with [NAV:partnership]

You can include multiple navigation tags if relevant. Only include navigation tags when the user's intent clearly maps to a page.`;

interface Message { role: "user" | "assistant" | "system"; content: string; }

interface NavigationHint {
  pageId: string;
  label: string;
  type: "page" | "section";
}

// Map of page/section IDs to human-readable labels
const NAV_LABELS: Record<string, { label: string; type: "page" | "section" }> = {
  "#home": { label: "Home", type: "section" },
  "#about": { label: "About Us", type: "section" },
  "#services": { label: "Services", type: "section" },
  "#products": { label: "Products", type: "section" },
  "#contact": { label: "Contact Us", type: "section" },
  "#cybersecurity": { label: "Cybersecurity", type: "section" },
  "careers": { label: "Careers", type: "page" },
  "events": { label: "Events", type: "page" },
  "blogs": { label: "Blog", type: "page" },
  "solutions": { label: "Solutions", type: "page" },
  "partnership": { label: "Partnership", type: "page" },
  "sponsorship": { label: "Sponsorship", type: "page" },
  "status": { label: "Status", type: "page" },
  "dashboard": { label: "Dashboard", type: "page" },
};

/**
 * Extract [NAV:...] tags from AI response and return clean text + navigation hints.
 */
function parseNavigationHints(reply: string): { cleanReply: string; navigation: NavigationHint[] } {
  const navRegex = /\[NAV:([^\]]+)\]/g;
  const navigation: NavigationHint[] = [];
  let match;

  while ((match = navRegex.exec(reply)) !== null) {
    const pageId = match[1].trim();
    const navInfo = NAV_LABELS[pageId];
    if (navInfo) {
      if (!navigation.some(n => n.pageId === pageId)) {
        navigation.push({ pageId, label: navInfo.label, type: navInfo.type });
      }
    }
  }

  const cleanReply = reply.replace(/\s*\[NAV:[^\]]+\]/g, "").trim();
  return { cleanReply, navigation };
}

async function embedText(text: string): Promise<number[] | null> {
  try {
    const res = await fetch("https://api.mistral.ai/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: "mistral-embed",
        input: [text.slice(0, 2048)],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data?.[0]?.embedding ?? null;
  } catch {
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function retrieveContext(query: string, supabase: any): Promise<string> {
  try {
    const embedding = await embedText(query);
    if (!embedding) return "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.rpc as any)("semantic_search", {
      query_embedding: embedding,
      match_count: 3,
    });

    if (!data?.length) return "";

    return "\n\nRELEVANT KNOWLEDGE BASE:\n" +
      data.map((doc: { title: string; content: string; similarity: number }) =>
        `[${doc.title}]\n${doc.content.slice(0, 800)}`
      ).join("\n\n---\n\n");
  } catch {
    return "";
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!rateLimit(ip, 20, 60_000)) {
      return NextResponse.json({ error: "Too many requests. Please try again in a moment." }, { status: 429 });
    }

    const { messages, sessionId } = await request.json() as { messages: Message[]; sessionId?: string };
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const recentMessages = messages.slice(-10);
    const lastUserMessage = recentMessages.filter(m => m.role === "user").pop()?.content ?? "";

    // RAG: retrieve relevant context from knowledge base
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const ragContext = await retrieveContext(lastUserMessage, supabase);

    const systemContent = COMPANY_CONTEXT + ragContext;

    const apiMessages = [
      { role: "system" as const, content: systemContent },
      ...recentMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content.slice(0, 2000),
      })),
    ];

    const mistralResponse = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        messages: apiMessages,
        max_tokens: 600,
        temperature: 0.7,
        safe_prompt: true,
      }),
    });

    if (!mistralResponse.ok) {
      console.error("Mistral API error:", await mistralResponse.text().catch(() => ""));
      return NextResponse.json({ error: "Curious AI is temporarily unavailable. Please try again shortly." }, { status: 503 });
    }

    const data = await mistralResponse.json();
    const rawReply = data.choices?.[0]?.message?.content ?? "I apologize, I couldn't generate a response. Please try again.";

    // Parse navigation hints from the AI's response
    const { cleanReply, navigation } = parseNavigationHints(rawReply);

    // Save conversation (fire-and-forget)
    if (sessionId) {
      void (async () => {
        try {
          await supabase.from("ai_conversations").upsert({
            session_id: sessionId,
            messages: [...recentMessages, { role: "assistant", content: cleanReply }],
            total_tokens: data.usage?.total_tokens ?? 0,
            updated_at: new Date().toISOString(),
          }, { onConflict: "session_id" });
        } catch { /* non-critical */ }
      })();
    }

    return NextResponse.json({
      reply: cleanReply,
      navigation,
      sessionId,
      ragUsed: ragContext.length > 0,
    });
  } catch (error) {
    console.error("AI chat API error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export const runtime = "nodejs";
