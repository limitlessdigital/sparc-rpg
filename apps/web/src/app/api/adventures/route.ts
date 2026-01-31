import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// GET /api/adventures - List adventures
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get("status"); // draft, published, all
    const mine = searchParams.get("mine") === "true";
    const search = searchParams.get("search");
    const difficulty = searchParams.get("difficulty");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabase
      .from("adventures")
      .select(`
        id,
        name,
        description,
        thumbnail_url,
        difficulty,
        estimated_duration,
        min_players,
        max_players,
        status,
        published_at,
        times_played,
        average_rating,
        created_at,
        updated_at,
        creator:users!creator_id (
          id,
          username,
          avatar_url
        )
      `)
      .order("updated_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by ownership
    if (mine) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      query = query.eq("creator_id", user.id);
    } else {
      // Public only shows published
      query = query.eq("status", "published");
    }

    // Filter by status (for own adventures)
    if (status && status !== "all" && mine) {
      query = query.eq("status", status);
    }

    // Search
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Filter by difficulty
    if (difficulty) {
      query = query.eq("difficulty", difficulty);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching adventures:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, count });
  } catch (error) {
    console.error("Adventures API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/adventures - Create new adventure
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, difficulty, estimated_duration, min_players, max_players, content } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
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

    const { data, error } = await supabase
      .from("adventures")
      .insert({
        creator_id: userData.id,
        name,
        description: description || "",
        difficulty: difficulty || "medium",
        estimated_duration: estimated_duration || 60,
        min_players: min_players || 2,
        max_players: max_players || 4,
        content: content || {},
        status: "draft",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating adventure:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("Create adventure error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
