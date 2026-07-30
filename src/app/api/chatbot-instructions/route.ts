import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { authenticateRequest, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";

/* ─────────────────────────── GET /api/chatbot-instructions ─────────────────────────── */

export async function GET() {
  try {
    const { data: instructions, error } = await supabaseAdmin
      .from("chatbot_instructions")
      .select("id, section, content, is_active, updated_at")
      .eq("is_active", true)
      .order("section", { ascending: true });

    if (error) {
      console.error("Chatbot instructions GET error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch chatbot instructions" },
        { status: 500 }
      );
    }

    // Build a structured object keyed by section
    const instructionMap: Record<string, string> = {};
    for (const inst of instructions ?? []) {
      instructionMap[inst.section] = inst.content;
    }

    return NextResponse.json(
      {
        success: true,
        data: instructionMap,
        sections: instructions ?? [],
      },
      {
        headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
      }
    );
  } catch (error) {
    console.error("Chatbot instructions GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch chatbot instructions" },
      { status: 500 }
    );
  }
}

/* ─────────────────────────── PUT /api/chatbot-instructions ─────────────────────────── */

export async function PUT(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return unauthorizedResponse();

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "editor"].includes(profile.role)) {
      return forbiddenResponse("Admin access required to update chatbot instructions");
    }

    const body = await request.json();
    const { section, content } = body;

    if (!section || content === undefined) {
      return NextResponse.json(
        { success: false, error: "Section and content are required" },
        { status: 400 }
      );
    }

    // Upsert: insert or update the section
    const { data: instruction, error } = await supabaseAdmin
      .from("chatbot_instructions")
      .upsert({
        section,
        content,
        is_active: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "section",
      })
      .select()
      .single();

    if (error) {
      console.error("Chatbot instructions PUT error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update chatbot instructions" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: instruction });
  } catch (error) {
    console.error("Chatbot instructions PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update chatbot instructions" },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
