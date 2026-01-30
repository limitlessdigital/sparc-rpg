import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Adventure publishing API

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { adventureId } = await request.json();
    if (!adventureId) return NextResponse.json({ error: "adventureId required" }, { status: 400 });

    // TODO: Validate adventure and publish
    return NextResponse.json({
      success: true,
      data: { adventureId, status: "published", publishedAt: new Date().toISOString() },
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
