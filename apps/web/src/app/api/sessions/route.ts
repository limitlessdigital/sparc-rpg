import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Session Management API

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const _status = searchParams.get("status"); // active, pending, completed (TODO: use for filtering)

    // TODO: Query sessions from database
    const sessions: unknown[] = [];

    return NextResponse.json({ success: true, data: { sessions } });
  } catch (error) {
    console.error("Sessions list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { adventureId, name, maxPlayers = 4 } = body;

    if (!adventureId || !name) {
      return NextResponse.json({ error: "adventureId and name required" }, { status: 400 });
    }

    const session = {
      id: crypto.randomUUID(),
      adventureId,
      name,
      seerId: user.id,
      maxPlayers,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    // TODO: Save to database

    return NextResponse.json({ success: true, data: { session } }, { status: 201 });
  } catch (error) {
    console.error("Session create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
