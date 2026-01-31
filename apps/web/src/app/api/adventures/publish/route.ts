import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// POST /api/adventures/publish - Publish an adventure
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { adventureId, visibility = "public" } = await request.json();
    
    if (!adventureId) {
      return NextResponse.json({ error: "adventureId required" }, { status: 400 });
    }

    // Get user's internal ID
    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch the adventure and verify ownership
    const { data: adventure, error: fetchError } = await supabase
      .from("adventures")
      .select("*")
      .eq("id", adventureId)
      .eq("creator_id", userData.id)
      .single();

    if (fetchError || !adventure) {
      return NextResponse.json({ error: "Adventure not found or not owned" }, { status: 404 });
    }

    // Basic validation - must have name and at least some content
    const validationErrors: string[] = [];
    
    if (!adventure.name || adventure.name.length < 3) {
      validationErrors.push("Adventure must have a name (min 3 characters)");
    }
    
    if (!adventure.content || Object.keys(adventure.content).length === 0) {
      validationErrors.push("Adventure must have content");
    }

    if (validationErrors.length > 0) {
      return NextResponse.json({ 
        error: "Validation failed", 
        validationErrors 
      }, { status: 400 });
    }

    // Publish the adventure
    const { data, error } = await supabase
      .from("adventures")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
        is_valid: true,
        validation_errors: [],
      })
      .eq("id", adventureId)
      .eq("creator_id", userData.id)
      .select()
      .single();

    if (error) {
      console.error("Publish error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        name: data.name,
        status: data.status,
        publishedAt: data.published_at,
      },
    });
  } catch (error) {
    console.error("Publish adventure error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
