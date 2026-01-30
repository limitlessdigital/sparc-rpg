import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Get roll history for a session

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const characterId = searchParams.get("characterId");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    // TODO: Fetch from database with filters
    // For now return empty array - will implement when rolls table exists
    const rolls: unknown[] = [];

    return NextResponse.json({
      success: true,
      data: { rolls, total: rolls.length },
      meta: {
        sessionId,
        characterId,
        limit,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Roll history error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
