import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { authenticateRequest, unauthorizedResponse, forbiddenResponse, generateSlug, badRequestResponse } from "@/lib/auth";
import { randomUUID } from "crypto";

/* ─────────────────────────── GET /api/case-studies ─────────────────────────── */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12")));
    const industry = searchParams.get("industry") || "";
    const search = searchParams.get("search") || "";
    const featured = searchParams.get("featured");

    let query = supabaseAdmin
      .from("case_studies")
      .select("id, title, slug, excerpt, cover_image, client_name, industry, challenge, solution, results, tags, is_featured, is_published, published_at, created_at", { count: "exact" })
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .range((page - 1) * limit, (page - 1) * limit + limit - 1);

    if (industry) {
      query = query.eq("industry", industry);
    }
    if (featured === "true") {
      query = query.eq("is_featured", true);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%,client_name.ilike.%${search}%`);
    }

    const { data: caseStudies, error, count } = await query;

    if (error) {
      console.error("Case studies list error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch case studies" },
        { status: 500 }
      );
    }

    const total = count ?? 0;

    return NextResponse.json({
      success: true,
      data: caseStudies ?? [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    console.error("Case studies list error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch case studies" },
      { status: 500 }
    );
  }
}

/* ─────────────────────────── POST /api/case-studies ─────────────────────────── */

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return unauthorizedResponse();

    // Check admin role from user metadata or profiles table
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "editor"].includes(profile.role)) {
      return forbiddenResponse("Admin access required to create case studies");
    }

    const body = await request.json();
    const { title, excerpt, content, coverImage, clientName, industry, challenge, solution, results, tags, isPublished, isFeatured } = body;

    if (!title || !content) {
      return badRequestResponse("Title and content are required");
    }

    const slug = generateSlug(title);

    // Check for existing slug
    const { data: existingSlug } = await supabaseAdmin
      .from("case_studies")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existingSlug) {
      return NextResponse.json(
        { success: false, error: "A case study with a similar title already exists" },
        { status: 409 }
      );
    }

    const { data: caseStudy, error } = await supabaseAdmin
      .from("case_studies")
      .insert([{
        id: randomUUID(),
        title,
        slug,
        excerpt: excerpt || null,
        content,
        cover_image: coverImage || null,
        client_name: clientName || null,
        industry: industry || null,
        challenge: challenge || null,
        solution: solution || null,
        results: results || null,
        tags: Array.isArray(tags) ? tags : [],
        is_featured: isFeatured ?? false,
        is_published: isPublished ?? false,
        published_at: isPublished ? new Date().toISOString() : null,
        author_id: user.id,
      }])
      .select()
      .single();

    if (error) {
      console.error("Case study create error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to create case study" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: caseStudy },
      { status: 201 }
    );
  } catch (error) {
    console.error("Case study create error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create case study" },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
