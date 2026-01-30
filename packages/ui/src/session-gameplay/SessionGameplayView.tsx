"use client";

import { cn } from "../lib/utils";
import { PartyStatusGrid, type PartyMember } from "./PartyStatusGrid";
import { LocationHeader } from "./LocationHeader";
import { useTypewriter } from "./NarrativePanel";
import { ChoiceButtonGroup, type Choice } from "./ChoiceButton";
import { CombatSidebar, type CombatParticipant } from "./CombatSidebar";

export type GameplayMode = "narrative" | "combat" | "challenge";

export interface GameplayState {
  mode: GameplayMode;
  locationTitle: string;
  locationSubtitle?: string;
  nodeType?: "story" | "decision" | "challenge" | "combat";
  sceneImageUrl?: string;
  narrativeText: string;
  choices: Choice[];
  party: PartyMember[];
  combat?: {
    participants: CombatParticipant[];
    roundNumber: number;
    actionButtons?: Choice[];
  };
}

export interface SessionGameplayViewProps {
  /** Current gameplay state */
  state: GameplayState;
  /** Current player ID (to highlight in party grid) */
  currentPlayerId?: string;
  /** On choice selected */
  onChoiceSelect?: (choice: Choice) => void;
  /** On combat action selected */
  onCombatAction?: (action: Choice) => void;
  /** On combat participant clicked */
  onParticipantClick?: (participant: CombatParticipant) => void;
  /** On compass/map clicked */
  onMapClick?: () => void;
  /** Selected choice ID (for loading state) */
  selectedChoiceId?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Enable typewriter effect for narrative */
  enableTypewriter?: boolean;
  /** Custom class name */
  className?: string;
}

export function SessionGameplayView({
  state,
  currentPlayerId,
  onChoiceSelect,
  onCombatAction,
  onParticipantClick,
  onMapClick,
  selectedChoiceId,
  isLoading = false,
  enableTypewriter = false,
  className,
}: SessionGameplayViewProps) {
  const { displayedText, isComplete, skip } = useTypewriter(
    state.narrativeText,
    enableTypewriter ? 20 : 0
  );

  const narrativeToDisplay = enableTypewriter ? displayedText : state.narrativeText;
  const isTyping = enableTypewriter && !isComplete;

  // Handle click to skip typewriter
  const handleNarrativeClick = () => {
    if (isTyping) {
      skip();
    }
  };

  const isCombatMode = state.mode === "combat" && state.combat;

  return (
    <div 
      className={cn(
        "min-h-screen bg-[#0a1628]",
        className
      )}
    >
      {/* Location Header */}
      <LocationHeader
        title={state.locationTitle}
        subtitle={state.locationSubtitle}
        nodeType={state.nodeType}
        showCompass={true}
        onCompassClick={onMapClick}
      />

      {/* Main Content Area */}
      <div className="relative flex">
        {/* Center - Narrative/Scene Panel */}
        <div 
          className="flex-1 flex flex-col min-w-0"
          onClick={handleNarrativeClick}
        >
          {/* Scene Image with Party Grid Overlay */}
          <div className="relative w-full aspect-[16/9] max-h-[350px] overflow-hidden">
            {state.sceneImageUrl && (
              <img
                src={state.sceneImageUrl}
                alt={state.locationTitle}
                className="w-full h-full object-cover"
              />
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0a1628] to-transparent" />
            
            {/* Party Status Grid - Overlaid on scene */}
            <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10">
              <PartyStatusGrid
                members={state.party}
                activePlayerId={currentPlayerId}
                className="w-[100px] md:w-[140px]"
              />
            </div>
          </div>

          {/* Narrative Text */}
          <div className="flex-1 px-4 md:px-6 py-4 overflow-y-auto">
            <div 
              className={cn(
                "prose prose-invert prose-sm max-w-none",
                isTyping && "cursor-pointer"
              )}
            >
              <p className={cn(
                "text-[#b8d0e8] text-base md:text-lg leading-relaxed whitespace-pre-wrap",
                isTyping && "after:content-['▋'] after:animate-pulse after:ml-0.5 after:text-bronze-400"
              )}>
                {narrativeToDisplay}
              </p>
            </div>
          </div>

          {/* Choices Area (non-combat) */}
          {!isCombatMode && state.choices.length > 0 && (
            <div className="px-4 md:px-6 py-4 bg-[#0a1628] border-t border-[#1a3a5c]/30">
              <ChoiceButtonGroup
                choices={state.choices}
                onSelect={onChoiceSelect}
                selectedId={selectedChoiceId}
                isLoading={isLoading}
                layout="horizontal"
              />
            </div>
          )}

          {/* Combat Actions (combat mode) */}
          {isCombatMode && state.combat?.actionButtons && state.combat.actionButtons.length > 0 && (
            <div className="px-4 md:px-6 py-4 bg-[#0a1628] border-t border-[#1a3a5c]/30">
              <ChoiceButtonGroup
                choices={state.combat.actionButtons}
                onSelect={onCombatAction}
                selectedId={selectedChoiceId}
                isLoading={isLoading}
                layout="horizontal"
              />
            </div>
          )}
        </div>

        {/* Right Sidebar - Combat Turn Tracker (only in combat) */}
        {isCombatMode && state.combat && (
          <div className="flex-shrink-0 w-52 p-3 md:p-4">
            <CombatSidebar
              participants={state.combat.participants}
              roundNumber={state.combat.roundNumber}
              onParticipantClick={onParticipantClick}
              className="h-[400px]"
            />
          </div>
        )}
      </div>

      {/* Footer - Credits / Attribution */}
      <div className="absolute bottom-2 right-4 text-[10px] text-[#3a5a7c] font-mono">
        © Heuristics, LLC
      </div>
    </div>
  );
}
