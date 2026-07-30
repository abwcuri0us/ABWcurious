import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Admin-only: embed a document and store in knowledge base
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!["admin", "super_admin"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
  }

  const { title, content, category, source_url, id } = await request.json();
  if (!title || !content) return NextResponse.json({ error: "Title and content required" }, { status: 400 });

  // Generate embedding via Mistral
  const embedRes = await fetch("https://api.mistral.ai/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: "mistral-embed",
      input: [`${title}\n\n${content}`.slice(0, 4096)],
    }),
  });

  if (!embedRes.ok) {
    return NextResponse.json({ error: "Embedding failed" }, { status: 500 });
  }

  const embedData = await embedRes.json();
  const embedding = embedData.data?.[0]?.embedding;
  if (!embedding) return NextResponse.json({ error: "No embedding returned" }, { status: 500 });

  // Upsert into knowledge_base
  const upsertData = {
    title: title.slice(0, 200),
    content: content.slice(0, 10000),
    category: category ?? "general",
    source_url: source_url ?? null,
    embedding,
    created_by: user.id,
    is_active: true,
  };

  const { data, error } = id
    ? await supabase.from("knowledge_base").update({ ...upsertData, embedding }).eq("id", id).select().single()
    : await supabase.from("knowledge_base").insert(upsertData).select().single();

  if (error) {
    console.error("KB upsert error:", error);
    return NextResponse.json({ error: "Failed to save to knowledge base" }, { status: 500 });
  }

  return NextResponse.json({ entry: data, dimensions: embedding.length });
}

// List all KB entries (admin only)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!["admin", "super_admin"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("knowledge_base")
    .select("id, title, category, source_url, is_active, created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  return NextResponse.json({ entries: data ?? [] });
}

export const runtime = "nodejs";
