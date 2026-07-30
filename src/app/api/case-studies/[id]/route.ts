import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { authenticateRequest, unauthorizedResponse, forbiddenResponse, notFoundResponse } from "@/lib/auth";

/* ─────────────────────────── GET /api/case-studies/[id] ─────────────────────────── */

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: caseStudy, error } = await supabaseAdmin
      .from("case_studies")
      .select("id, title, slug, excerpt, content, cover_image, client_name, industry, challenge, solution, results, tags, is_featured, is_published, published_at, created_at, updated_at")
      .eq("id", id)
      .single();

    if (error || !caseStudy) {
      return notFoundResponse("Case study not found");
    }

    return NextResponse.json({ success: true, data: caseStudy });
  } catch (error) {
    console.error("Case study get error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch case study" },
      { status: 500 }
    );
  }
}

/* ─────────────────────────── PUT /api/case-studies/[id] ─────────────────────────── */

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return unauthorizedResponse();

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "editor"].includes(profile.role)) {
      return forbiddenResponse("Admin access required to update case studies");
    }

    const { id } = await params;

    const body = await request.json();
    const { title, excerpt, content, coverImage, clientName, industry, challenge, solution, results, tags, isPublished, isFeatured } = body;

    // Check if case study exists
    const { data: existing } = await supabaseAdmin
      .from("case_studies")
      .select("id")
      .eq("id", id)
      .single();

    if (!existing) {
      return notFoundResponse("Case study not found");
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (content !== undefined) updateData.content = content;
    if (coverImage !== undefined) updateData.cover_image = coverImage;
    if (clientName !== undefined) updateData.client_name = clientName;
    if (industry !== undefined) updateData.industry = industry;
    if (challenge !== undefined) updateData.challenge = challenge;
    if (solution !== undefined) updateData.solution = solution;
    if (results !== undefined) updateData.results = results;
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];
    if (isFeatured !== undefined) updateData.is_featured = isFeatured;
    if (isPublished !== undefined) {
      updateData.is_published = isPublished;
      updateData.published_at = isPublished ? new Date().toISOString() : null;
    }

    const { data: caseStudy, error } = await supabaseAdmin
      .from("case_studies")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Case study update error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update case study" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: caseStudy });
  } catch (error) {
    console.error("Case study update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update case study" },
      { status: 500 }
    );
  }
}

/* ─────────────────────────── DELETE /api/case-studies/[id] ─────────────────────────── */

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateRequest(_request);
    if (!user) return unauthorizedResponse();

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "editor"].includes(profile.role)) {
      return forbiddenResponse("Admin access required to delete case studies");
    }

    const { id } = await params;

    const { error } = await supabaseAdmin
      .from("case_studies")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Case study delete error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to delete case study" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Case study deleted" });
  } catch (error) {
    console.error("Case study delete error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete case study" },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
