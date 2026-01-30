import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// SPARC Dice System API
// D6 dice pools with difficulty thresholds

interface RollRequest {
  sessionId: string;
  characterId: string;
  attribute: "might" | "grace" | "wit" | "heart";
  difficulty: number;
  description?: string;
  modifiers?: { source: string; value: number }[];
}

interface DiceRoll {
  id: string;
  sessionId: string;
  characterId: string;
  attribute: string;
  diceCount: number;
  difficulty: number;
  results: number[];
  total: number;
  successes: number;
  success: boolean;
  outcome: "critical_success" | "success" | "partial" | "failure" | "critical_failure";
  modifiers: { source: string; value: number }[];
  description?: string;
  timestamp: string;
}

function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

function evaluateRoll(
  results: number[],
  difficulty: number
): { success: boolean; outcome: DiceRoll["outcome"]; successes: number } {
  const successes = results.filter((d) => d >= difficulty).length;
  const sixes = results.filter((d) => d === 6).length;
  const ones = results.filter((d) => d === 1).length;

  // Critical success: 2+ sixes
  if (sixes >= 2) {
    return { success: true, outcome: "critical_success", successes };
  }
  // Critical failure: all ones
  if (ones === results.length && results.length > 0) {
    return { success: false, outcome: "critical_failure", successes };
  }
  // Success: majority meet difficulty
  if (successes >= Math.ceil(results.length / 2)) {
    return { success: true, outcome: "success", successes };
  }
  // Partial: at least one success
  if (successes > 0) {
    return { success: true, outcome: "partial", successes };
  }
  // Failure
  return { success: false, outcome: "failure", successes };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: RollRequest = await request.json();
    const { sessionId, characterId, attribute, difficulty, description, modifiers = [] } = body;

    // Validate
    if (!sessionId || !characterId || !attribute || !difficulty) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (difficulty < 3 || difficulty > 6) {
      return NextResponse.json({ error: "Difficulty must be 3-6" }, { status: 400 });
    }

    // Get character to determine dice pool
    const { data: character, error: charError } = await supabase
      .from("characters")
      .select("*")
      .eq("id", characterId)
      .single();

    if (charError || !character) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    // Calculate dice pool from attribute
    const attributeValue = character[attribute] as number;
    const modifierBonus = modifiers.reduce((sum, m) => sum + m.value, 0);
    const diceCount = Math.max(1, Math.min(10, attributeValue + modifierBonus));

    // Roll dice
    const results: number[] = [];
    for (let i = 0; i < diceCount; i++) {
      results.push(rollD6());
    }

    const total = results.reduce((sum, d) => sum + d, 0);
    const { success, outcome, successes } = evaluateRoll(results, difficulty);

    const roll: DiceRoll = {
      id: crypto.randomUUID(),
      sessionId,
      characterId,
      attribute,
      diceCount,
      difficulty,
      results,
      total,
      successes,
      success,
      outcome,
      modifiers,
      description,
      timestamp: new Date().toISOString(),
    };

    // TODO: Store roll in database
    // TODO: Broadcast via realtime

    return NextResponse.json({
      success: true,
      data: { roll },
      meta: { timestamp: roll.timestamp, requestId: roll.id },
    });
  } catch (error) {
    console.error("Dice roll error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
