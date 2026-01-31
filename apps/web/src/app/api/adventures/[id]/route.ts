import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// GET /api/adventures/[id] - Get single adventure
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("adventures")
      .select(`
        *,
        creator:users!creator_id (
          id,
          username,
          avatar_url
        )
      `)
      .eq("id", params.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Adventure not found" }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Check access - draft adventures only visible to creator
    if (data.status === "draft") {
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("auth_id", user.id)
        .single();

      if (!userData || userData.id !== data.creator_id) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Get adventure error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/adventures/[id] - Update adventure
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const allowedFields = [
      "name",
      "description",
      "thumbnail_url",
      "artwork_url",
      "difficulty",
      "estimated_duration",
      "min_players",
      "max_players",
      "content",
    ];

    // Filter to only allowed fields
    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    // Verify ownership
    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("adventures")
      .update(updates)
      .eq("id", params.id)
      .eq("creator_id", userData.id) // Ensure ownership
      .select()
      .single();

    if (error) {
      console.error("Update adventure error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Adventure not found or not owned" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Update adventure error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/adventures/[id] - Delete adventure
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("adventures")
      .delete()
      .eq("id", params.id)
      .eq("creator_id", userData.id); // Ensure ownership

    if (error) {
      console.error("Delete adventure error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete adventure error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
