import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function rateLimit(ip: string, limit = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) { rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs }); return true; }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim().slice(0, 80);
}

/* ─────────────────────────── GET /api/blogs ─────────────────────────── */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "12", 10), 50);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const authorId = searchParams.get("author_id");
  const status = searchParams.get("status"); // requires auth for non-public
  const offset = (page - 1) * limit;

  const supabase = getAdminClient();

  let query = supabase
    .from("blogs")
    .select(`
      id, title, slug, excerpt, thumbnail_url, category, tags, status,
      reading_time, view_count, created_at, published_at,
      author:profiles!blogs_author_id_fkey(id, full_name, avatar_url)
    `, { count: "exact" })
    .is("deleted_at", null);

  // By default only show published; admins/authors can request drafts/private
  if (!status || status === "published") {
    query = query.eq("status", "published");
  } else {
    // status filter (admin-only — validated server-side by auth in a full impl)
    query = query.eq("status", status);
  }

  if (category && category !== "all") query = query.eq("category", category);
  if (search) query = query.ilike("title", `%${search}%`);
  if (authorId) query = query.eq("author_id", authorId);

  query = query.order("published_at", { ascending: false }).range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("Blogs GET error:", error);
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 });
  }

  return NextResponse.json({
    blogs: data ?? [],
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
    },
  });
}

/* ─────────────────────────── POST /api/blogs ─────────────────────────── */

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(ip, 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // Get auth token from cookie/header
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify user with Supabase
  const supabase = getAdminClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("id, role").eq("id", user.id).single();
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 403 });

  const body = await request.json();
  const { title, content, excerpt, category, tags, status, thumbnail_url, reading_time } = body;

  if (!title || !content) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
  }

  // Generate unique slug
  let baseSlug = slugify(title);
  let slug = baseSlug;
  let suffix = 1;
  while (true) {
    const { data: existing } = await supabase.from("blogs").select("id").eq("slug", slug).single();
    if (!existing) break;
    slug = `${baseSlug}-${suffix++}`;
  }

  // Non-admin users can only publish public or private (not pending_review is fine)
  const isAdmin = ["admin", "super_admin", "editor"].includes(profile.role);
  const finalStatus = isAdmin
    ? (status ?? "draft")
    : (status === "private" ? "private" : "published");

  const { data, error } = await supabase.from("blogs").insert({
    title: title.slice(0, 200),
    slug,
    content,
    excerpt: excerpt?.slice(0, 500) ?? content.replace(/<[^>]*>/g, "").slice(0, 200) + "…",
    category: category ?? "general",
    tags: Array.isArray(tags) ? tags.slice(0, 10) : [],
    status: finalStatus,
    thumbnail_url: thumbnail_url ?? null,
    reading_time: reading_time ?? Math.ceil(content.replace(/<[^>]*>/g, "").split(/\s+/).length / 200),
    author_id: profile.id,
    published_at: finalStatus === "published" ? new Date().toISOString() : null,
  }).select().single();

  if (error) {
    console.error("Blog create error:", error);
    return NextResponse.json({ error: "Failed to create blog post" }, { status: 500 });
  }

  return NextResponse.json({ blog: data }, { status: 201 });
}

export const runtime = "nodejs";
