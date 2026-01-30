import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Combat action API - handles attacks, abilities, and movement

interface CombatActionRequest {
  sessionId: string;
  encounterId: string;
  characterId: string;
  actionType: "attack" | "ability" | "move" | "defend" | "end_turn";
  targetId?: string;
  abilityId?: string;
  position?: { x: number; y: number };
}

function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CombatActionRequest = await request.json();
    const { sessionId, encounterId, characterId, actionType, targetId, abilityId, position } = body;

    if (!sessionId || !encounterId || !characterId || !actionType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let result: Record<string, unknown> = { actionType };

    switch (actionType) {
      case "attack":
        if (!targetId) {
          return NextResponse.json({ error: "targetId required for attack" }, { status: 400 });
        }
        // Roll attack dice pool
        const attackDice = [rollD6(), rollD6(), rollD6()];
        const attackTotal = attackDice.reduce((a, b) => a + b, 0);
        const hit = attackTotal >= 10; // Simplified threshold
        result = {
          ...result,
          targetId,
          attackDice,
          attackTotal,
          hit,
          damage: hit ? rollD6() + rollD6() : 0,
        };
        break;

      case "ability":
        if (!abilityId) {
          return NextResponse.json({ error: "abilityId required" }, { status: 400 });
        }
        result = {
          ...result,
          abilityId,
          targetId,
          success: true,
          // TODO: Look up ability effects
        };
        break;

      case "move":
        if (!position) {
          return NextResponse.json({ error: "position required for move" }, { status: 400 });
        }
        result = { ...result, position, success: true };
        break;

      case "defend":
        result = { ...result, defenseBonus: 2, success: true };
        break;

      case "end_turn":
        result = { ...result, turnEnded: true };
        break;
    }

    return NextResponse.json({
      success: true,
      data: {
        action: {
          id: crypto.randomUUID(),
          ...result,
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Combat action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
