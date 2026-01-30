import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Single session management

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionId = params.id;
    // TODO: Fetch from database

    return NextResponse.json({
      success: true,
      data: {
        session: {
          id: sessionId,
          status: "active",
          players: [],
          currentScene: null,
        },
      },
    });
  } catch (error) {
    console.error("Session get error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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

    const sessionId = params.id;
    const body = await request.json();
    const { status, currentScene } = body;

    // TODO: Update in database

    return NextResponse.json({
      success: true,
      data: { session: { id: sessionId, status, currentScene } },
    });
  } catch (error) {
    console.error("Session update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionId = params.id;
    // TODO: Delete from database

    return NextResponse.json({ success: true, data: { deleted: sessionId } });
  } catch (error) {
    console.error("Session delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
