import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Heroic Save - reroll a failed roll once per encounter

interface HeroicSaveRequest {
  sessionId: string;
  characterId: string;
  originalRollId: string;
}

function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

function evaluateRoll(results: number[], difficulty: number) {
  const successes = results.filter((d) => d >= difficulty).length;
  const sixes = results.filter((d) => d === 6).length;
  const ones = results.filter((d) => d === 1).length;

  if (sixes >= 2) return { success: true, outcome: "critical_success" as const, successes };
  if (ones === results.length && results.length > 0) return { success: false, outcome: "critical_failure" as const, successes };
  if (successes >= Math.ceil(results.length / 2)) return { success: true, outcome: "success" as const, successes };
  if (successes > 0) return { success: true, outcome: "partial" as const, successes };
  return { success: false, outcome: "failure" as const, successes };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: HeroicSaveRequest = await request.json();
    const { sessionId, characterId, originalRollId } = body;

    if (!sessionId || !characterId || !originalRollId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // TODO: Verify character belongs to user
    // TODO: Check heroic save not already used this encounter
    // TODO: Get original roll from database

    // For now, simulate reroll with same parameters
    // In production, fetch original roll details from DB
    const diceCount = 3; // Placeholder
    const difficulty = 4; // Placeholder

    const results: number[] = [];
    for (let i = 0; i < diceCount; i++) {
      results.push(rollD6());
    }

    const total = results.reduce((sum, d) => sum + d, 0);
    const { success, outcome, successes } = evaluateRoll(results, difficulty);

    const reroll = {
      id: crypto.randomUUID(),
      sessionId,
      characterId,
      originalRollId,
      isHeroicSave: true,
      diceCount,
      difficulty,
      results,
      total,
      successes,
      success,
      outcome,
      timestamp: new Date().toISOString(),
    };

    // TODO: Mark heroic save as used for this encounter
    // TODO: Store reroll in database
    // TODO: Broadcast via realtime

    return NextResponse.json({
      success: true,
      data: { roll: reroll, heroicSaveUsed: true },
      meta: { timestamp: reroll.timestamp, requestId: reroll.id },
    });
  } catch (error) {
    console.error("Heroic save error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
