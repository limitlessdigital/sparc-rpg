import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// AI Assistant API for Seer helpers

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { sessionId, prompt } = await request.json();
    if (!sessionId || !prompt) {
      return NextResponse.json({ error: "sessionId and prompt required" }, { status: 400 });
    }

    // TODO: Call AI service for narrative suggestions
    const suggestion = `Based on the current scene, consider: ${prompt.slice(0, 50)}...`;

    return NextResponse.json({
      success: true,
      data: { suggestion, timestamp: new Date().toISOString() },
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
