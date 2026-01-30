"use client";

import { cn } from "../lib/utils";

export interface PartyMember {
  id: string;
  slot: number; // 1-4
  name: string;
  characterName?: string;
  characterClass?: string;
  avatarUrl?: string;
  currentHP: number;
  maxHP: number;
  isOnline: boolean;
  isCurrentTurn?: boolean;
}

export interface PartyStatusGridProps {
  /** Array of party members (up to 4) */
  members: PartyMember[];
  /** Currently active player ID (for highlighting) */
  activePlayerId?: string;
  /** Custom class name */
  className?: string;
}

// Official SPARC Class icon paths (Version E2)
const CLASS_ICONS: Record<string, string> = {
  // Official 7 SPARC Classes
  warrior: "/assets/classes/WARRIOR/WARRIOR-WHITE.png",
  wizard: "/assets/classes/WIZARD/WIZARD-WHITE.png",
  cleric: "/assets/classes/CLERIC/CLERIC-WHITE.png",
  rogue: "/assets/classes/ROGUE/ROGUE-WHITE.png",
  ranger: "/assets/classes/RANGER/RANGER-WHITE.png",
  paladin: "/assets/classes/PALADIN/PALADIN-WHITE.png",
  necromancer: "/assets/classes/NECROMANCER/NECROMANCER-WHITE.png",
};

function getClassIcon(characterClass?: string): string | undefined {
  if (!characterClass) return undefined;
  const normalizedClass = characterClass.toLowerCase().trim();
  return CLASS_ICONS[normalizedClass];
}

function PartySlot({
  member,
  isActive,
}: {
  member?: PartyMember;
  isActive: boolean;
}) {
  if (!member) {
    // Empty slot
    return (
      <div className="relative aspect-square bg-[#0d1f35]/60 border border-[#1a3a5c]/50 rounded-lg flex items-center justify-center">
        <span className="text-[#2a4a6c] text-2xl font-bold">?</span>
      </div>
    );
  }

  const hpPercent = Math.max(0, (member.currentHP / member.maxHP) * 100);
  const hpColor = hpPercent > 50 ? "bg-bronze-500" : hpPercent > 25 ? "bg-warning" : "bg-error";
  const classIcon = getClassIcon(member.characterClass);

  return (
    <div
      className={cn(
        "relative aspect-square bg-[#0d1f35] border rounded-lg overflow-hidden transition-all",
        isActive 
          ? "border-gold ring-2 ring-gold/30" 
          : member.isCurrentTurn 
            ? "border-bronze-400 ring-1 ring-bronze-400/50"
            : "border-[#1a3a5c]/70"
      )}
    >
      {/* Player number badge */}
      <div className={cn(
        "absolute top-1 left-1 z-10 w-5 h-5 rounded flex items-center justify-center text-xs font-bold",
        member.isOnline ? "bg-bronze-500 text-white" : "bg-[#2a4a6c] text-[#5a7a9c]"
      )}>
        {member.slot}
      </div>

      {/* Avatar area with class icon */}
      <div className="absolute inset-0 flex items-center justify-center p-2">
        {member.avatarUrl ? (
          <img
            src={member.avatarUrl}
            alt={member.characterName || member.name}
            className={cn(
              "w-full h-full object-cover rounded",
              !member.isOnline && "grayscale opacity-60"
            )}
          />
        ) : classIcon ? (
          <img
            src={classIcon}
            alt={member.characterClass}
            className={cn(
              "w-10 h-10 md:w-12 md:h-12 object-contain opacity-80",
              !member.isOnline && "grayscale opacity-40"
            )}
          />
        ) : (
          <span className={cn(
            "text-2xl md:text-3xl font-bold text-[#3a5a7c]",
            !member.isOnline && "opacity-40"
          )}>
            {(member.characterName || member.name).charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* HP bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-[#0a1628] to-transparent pt-4">
        <div className="text-center mb-0.5">
          <span className={cn(
            "text-[10px] font-mono font-bold tabular-nums drop-shadow-md",
            hpPercent > 50 ? "text-bronze-300" : hpPercent > 25 ? "text-warning" : "text-error"
          )}>
            {member.currentHP}
          </span>
        </div>
        <div className="h-1.5 bg-[#0a1628]/90 rounded-full overflow-hidden border border-[#1a3a5c]/50">
          <div
            className={cn("h-full transition-all duration-500 rounded-full", hpColor)}
            style={{ width: `${hpPercent}%` }}
          />
        </div>
      </div>

      {/* Online indicator */}
      {!member.isOnline && (
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#4a4a4a]" />
      )}
      {member.isOnline && (
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-success animate-pulse" />
      )}
    </div>
  );
}

export function PartyStatusGrid({
  members,
  activePlayerId,
  className,
}: PartyStatusGridProps) {
  // Create a 4-slot array
  const slots: (PartyMember | undefined)[] = [
    members.find(m => m.slot === 1),
    members.find(m => m.slot === 2),
    members.find(m => m.slot === 3),
    members.find(m => m.slot === 4),
  ];

  return (
    <div className={cn("grid grid-cols-2 gap-2 w-fit", className)}>
      {slots.map((member, index) => (
        <PartySlot
          key={member?.id || `empty-${index}`}
          member={member}
          isActive={!!activePlayerId && member?.id === activePlayerId}
        />
      ))}
    </div>
  );
}
