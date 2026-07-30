import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

type Params = { params: Promise<{ id: string }> };

/* ─── GET /api/blogs/[id] ─── */
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = getAdminClient();

  // Support lookup by id OR slug
  const isUuid = /^[0-9a-f-]{36}$/.test(id);
  const query = supabase
    .from("blogs")
    .select(`
      *, author:profiles!blogs_author_id_fkey(id, full_name, avatar_url, bio)
    `)
    .is("deleted_at", null);

  const { data, error } = await (isUuid ? query.eq("id", id) : query.eq("slug", id)).single();

  if (error || !data) return NextResponse.json({ error: "Blog post not found" }, { status: 404 });

  // Increment view count (fire-and-forget)
  void (async () => { try { await (supabase.rpc as any)("increment_blog_views", { blog_id: data.id }); } catch { /* ignore */ } })();

  return NextResponse.json({ blog: data });
}

/* ─── PUT /api/blogs/[id] ─── */
export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getAdminClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get existing post
  const { data: existing } = await supabase.from("blogs").select("author_id, status").eq("id", id).single();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Get profile
  const { data: profile } = await supabase.from("profiles").select("id, role").eq("id", user.id).single();
  const isAdmin = ["admin", "super_admin", "editor"].includes(profile?.role ?? "");
  const isOwner = existing.author_id === profile?.id;

  if (!isAdmin && !isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { title, content, excerpt, category, tags, status, thumbnail_url, reading_time } = body;

  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title.slice(0, 200);
  if (content !== undefined) {
    updates.content = content;
    updates.reading_time = reading_time ?? Math.ceil(content.replace(/<[^>]*>/g, "").split(/\s+/).length / 200);
  }
  if (excerpt !== undefined) updates.excerpt = excerpt.slice(0, 500);
  if (category !== undefined) updates.category = category;
  if (tags !== undefined) updates.tags = Array.isArray(tags) ? tags.slice(0, 10) : [];
  if (thumbnail_url !== undefined) updates.thumbnail_url = thumbnail_url;
  if (status !== undefined) {
    updates.status = status;
    if (status === "published" && existing.status !== "published") {
      updates.published_at = new Date().toISOString();
    }
  }

  const { data, error } = await supabase.from("blogs").update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: "Failed to update" }, { status: 500 });

  return NextResponse.json({ blog: data });
}

/* ─── DELETE /api/blogs/[id] ─── */
export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getAdminClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: existing } = await supabase.from("blogs").select("author_id").eq("id", id).single();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: profile } = await supabase.from("profiles").select("id, role").eq("id", user.id).single();
  const isAdmin = ["admin", "super_admin"].includes(profile?.role ?? "");
  const isOwner = existing.author_id === profile?.id;

  if (!isAdmin && !isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Soft delete
  const { error } = await supabase.from("blogs").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) return NextResponse.json({ error: "Failed to delete" }, { status: 500 });

  return NextResponse.json({ success: true });
}

export const runtime = "nodejs";
