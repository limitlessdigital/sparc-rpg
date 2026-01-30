import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Audio narration API

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { text, voice = "default" } = await request.json();
    if (!text) return NextResponse.json({ error: "text required" }, { status: 400 });

    // TODO: Generate audio via TTS service
    const audioUrl = null; // Placeholder

    return NextResponse.json({
      success: true,
      data: { audioUrl, text, voice, duration: text.length * 50 },
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
