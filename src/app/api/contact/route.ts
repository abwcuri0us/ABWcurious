import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Rate limiting: simple in-memory store (in production, use Upstash Redis)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

function sanitize(str: string): string {
  return str.replace(/<[^>]*>/g, "").trim().slice(0, 2000);
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!rateLimit(ip, 5, 60_000)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const { name, email, phone, company, subject, message, inquiryType, contact_type } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    // Sanitize inputs
    const sanitized = {
      name: sanitize(name),
      email: sanitize(email),
      phone: phone ? sanitize(phone) : null,
      company: company ? sanitize(company) : null,
      subject: subject ? sanitize(subject) : "General Inquiry",
      message: sanitize(message),
      contact_type: inquiryType ?? contact_type ?? "general",
    };

    // Save to Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: dbError } = await supabase.from("contacts").insert([sanitized]);

    if (dbError) {
      console.error("Contact DB error:", dbError);
      // Don't fail silently - still send email notification
    }

    // Sending email notifications via Brevo has been removed as requested.
    // Ensure you check the 'contacts' table in Supabase for new messages!

    return NextResponse.json({ success: true, message: "Message received. We'll be in touch soon!" });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export const runtime = "nodejs";
