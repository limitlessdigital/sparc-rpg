/**
 * AI Seer Assistant - Response Parser
 * Parse and structure AI responses into actionable data
 */

import type { Attribute, ParsedAIResponse, SuggestedRoll } from "./types";

// Attribute keywords for detection
const ATTRIBUTE_KEYWORDS: Record<string, Attribute> = {
  might: "might",
  strength: "might",
  str: "might",
  power: "might",
  force: "might",
  grace: "grace",
  dexterity: "grace",
  dex: "grace",
  agility: "grace",
  reflex: "grace",
  wit: "wit",
  intelligence: "wit",
  int: "wit",
  wisdom: "wit",
  knowledge: "wit",
  smart: "wit",
  heart: "heart",
  charisma: "heart",
  cha: "heart",
  presence: "heart",
  charm: "heart",
  persuasion: "heart",
};

/**
 * Parse raw AI response text into structured data
 */
export function parseAIResponse(raw: string): ParsedAIResponse {
  const lines = raw.split("\n").filter((l) => l.trim());

  // Extract suggestion (main text before any structured data)
  let suggestion = "";
  let idx = 0;

  // Collect lines until we hit a structured element
  while (idx < lines.length) {
    const line = lines[idx].trim();
    const lower = line.toLowerCase();

    // Stop at roll suggestions, narrative markers, or rule citations
    if (
      lower.includes("roll") &&
      (lower.includes("vs") || lower.includes("dc") || lower.includes("difficulty"))
    ) {
      break;
    }
    if (lower.startsWith("narrative:") || lower.startsWith("hook:")) {
      break;
    }
    if (lower.startsWith("rule:") || lower.startsWith("clarification:")) {
      break;
    }

    suggestion += line + " ";
    idx++;
  }

  // Extract suggested roll
  const suggestedRoll = extractRoll(raw);

  // Extract narrative hook
  const narrativeHook = extractNarrativeHook(raw);

  // Extract rule clarification
  const ruleClarification = extractRuleClarification(raw);

  return {
    suggestion: suggestion.trim() || raw.split("\n")[0] || raw,
    suggestedRoll,
    narrativeHook,
    ruleClarification,
  };
}

/**
 * Extract roll information from response
 */
function extractRoll(text: string): SuggestedRoll | undefined {
  // Pattern 1: "ATTRIBUTE roll vs DC X" or "ATTRIBUTE vs DC X"
  const pattern1 = /\b(might|grace|wit|heart|strength|dexterity|intelligence|charisma)\s+(?:roll\s+)?(?:check\s+)?(?:vs|against|versus)\s+(?:dc\s*)?(\d+)/i;

  // Pattern 2: "DC X ATTRIBUTE check"
  const pattern2 = /\bdc\s*(\d+)\s+(might|grace|wit|heart)\s+(?:roll|check)?/i;

  // Pattern 3: "difficulty X for ATTRIBUTE"
  const pattern3 = /\bdifficulty\s*[:\-]?\s*(\d+)\s+(?:for\s+)?(might|grace|wit|heart)/i;

  // Pattern 4: Just mentions "ATTRIBUTE DC X" anywhere
  const pattern4 = /\b(might|grace|wit|heart)\s+(?:dc|difficulty)\s*[:\-]?\s*(\d+)/i;

  let attribute: Attribute | undefined;
  let difficulty: number | undefined;

  // Try each pattern
  const match1 = text.match(pattern1);
  if (match1) {
    attribute = normalizeAttribute(match1[1]);
    difficulty = parseInt(match1[2], 10);
  }

  if (!attribute || !difficulty) {
    const match2 = text.match(pattern2);
    if (match2) {
      difficulty = parseInt(match2[1], 10);
      attribute = normalizeAttribute(match2[2]);
    }
  }

  if (!attribute || !difficulty) {
    const match3 = text.match(pattern3);
    if (match3) {
      difficulty = parseInt(match3[1], 10);
      attribute = normalizeAttribute(match3[2]);
    }
  }

  if (!attribute || !difficulty) {
    const match4 = text.match(pattern4);
    if (match4) {
      attribute = normalizeAttribute(match4[1]);
      difficulty = parseInt(match4[2], 10);
    }
  }

  if (attribute && difficulty && difficulty >= 3 && difficulty <= 18) {
    // Extract reason (context around the roll mention)
    const reason = extractRollReason(text, attribute);
    return { attribute, difficulty, reason };
  }

  return undefined;
}

/**
 * Normalize attribute name to SPARC attribute
 */
function normalizeAttribute(raw: string): Attribute {
  const lower = raw.toLowerCase().trim();
  return ATTRIBUTE_KEYWORDS[lower] || "wit";
}

/**
 * Extract reason/context for the suggested roll
 */
function extractRollReason(text: string, attribute: Attribute): string {
  // Look for common reason patterns
  const patterns = [
    /(?:because|since|as|for)\s+([^.!?]+)/i,
    /(?:this|the)\s+(?:requires?|needs?|involves?)\s+([^.!?]+)/i,
    /(?:to|in order to)\s+([^.!?]+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  // Default reasons based on attribute
  const defaultReasons: Record<Attribute, string> = {
    might: "Physical strength or power required",
    grace: "Agility and finesse required",
    wit: "Mental acuity and knowledge required",
    heart: "Force of personality required",
  };

  return defaultReasons[attribute];
}

/**
 * Extract narrative hook from response
 */
function extractNarrativeHook(text: string): string | undefined {
  // Look for explicit narrative markers
  const narrativePatterns = [
    /narrative:\s*["']?([^"'\n]+)["']?/i,
    /hook:\s*["']?([^"'\n]+)["']?/i,
    /read[- ]?aloud:\s*["']?([^"'\n]+)["']?/i,
  ];

  for (const pattern of narrativePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  // Look for quoted text that could be narrative
  const quotePatterns = [
    /"([^"]{20,})"/, // Double quotes, min 20 chars
    /'([^']{20,})'/, // Single quotes, min 20 chars
    />\s*["']?([^"'\n]{20,})["']?/m, // Markdown quote
  ];

  for (const pattern of quotePatterns) {
    const match = text.match(pattern);
    if (match) {
      const potential = match[1].trim();
      // Must look like narrative (starts with "The", "As", "You", etc.)
      if (/^(the|as|you|a|an|in|with|from|to)\s/i.test(potential)) {
        return potential;
      }
    }
  }

  // Look for text that starts a new paragraph and sounds narrative
  const lines = text.split("\n").filter((l) => l.trim());
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed.length > 30 &&
      /^(the|as|you|suddenly|meanwhile|in the)/i.test(trimmed) &&
      !trimmed.includes("DC") &&
      !trimmed.includes("roll")
    ) {
      return trimmed;
    }
  }

  return undefined;
}

/**
 * Extract rule clarification from response
 */
function extractRuleClarification(text: string): string | undefined {
  // Look for explicit rule markers
  const rulePatterns = [
    /rule(?:s)?:\s*([^.!?\n]+[.!?]?)/i,
    /clarification:\s*([^.!?\n]+[.!?]?)/i,
    /note:\s*(?:in sparc[,]?\s*)?([^.!?\n]+[.!?]?)/i,
    /(?:according to|per) (?:the )?(?:sparc )?rules?[,:]?\s*([^.!?\n]+[.!?]?)/i,
  ];

  for (const pattern of rulePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return undefined;
}

/**
 * Calculate confidence score based on response quality
 */
export function calculateConfidence(parsed: ParsedAIResponse): number {
  let confidence = 0.5; // Base confidence

  // Has a clear suggestion
  if (parsed.suggestion && parsed.suggestion.length > 20) {
    confidence += 0.1;
  }

  // Has a suggested roll with valid difficulty
  if (parsed.suggestedRoll) {
    confidence += 0.2;
    // Reasonable difficulty range
    if (parsed.suggestedRoll.difficulty >= 6 && parsed.suggestedRoll.difficulty <= 15) {
      confidence += 0.1;
    }
  }

  // Has narrative hook
  if (parsed.narrativeHook) {
    confidence += 0.1;
  }

  return Math.min(confidence, 1.0);
}

/**
 * Clean and format suggestion text
 */
export function cleanSuggestion(text: string): string {
  let cleaned = text.trim();

  // Remove common prefixes
  cleaned = cleaned.replace(/^(sure|okay|certainly|of course|here'?s?)[,!.]?\s*/i, "");

  // Remove meta-commentary
  cleaned = cleaned.replace(/\s*\(.*?roll.*?\)/gi, "");

  // Ensure proper capitalization
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  // Ensure ends with punctuation
  if (!/[.!?]$/.test(cleaned)) {
    cleaned += ".";
  }

  return cleaned;
}
