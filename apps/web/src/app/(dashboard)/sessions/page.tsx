"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Avatar,
  Input,
  Select,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalClose,
  ModalBody,
  ModalFooter,
  Spinner,
  useToast,
} from "@sparc/ui";

// ============================================================================
// TYPES
// ============================================================================

type SessionStatus = "waiting" | "starting_soon" | "in_progress" | "completed";
type Difficulty = "easy" | "medium" | "hard";

interface SessionListItem {
  id: string;
  code: string;
  adventureId: string;
  adventureName: string;
  adventureThumbnail: string | null;
  difficulty: Difficulty;
  estimatedDuration: number;
  seerId: string;
  seerDisplayName: string;
  seerAvatarUrl: string | null;
  seerGamesRun: number;
  playerCount: number;
  maxPlayers: number;
  status: SessionStatus;
  scheduledStart: string | null;
  createdAt: string;
  isPublic: boolean;
}

interface SessionPlayer {
  userId: string;
  displayName: string;
  characterId: string;
  characterName: string;
  characterClass: string;
}

interface SessionPreview extends SessionListItem {
  adventureDescription: string;
  adventureArtwork: string | null;
  players: SessionPlayer[];
  lookingFor: string | null;
}

interface Character {
  id: string;
  name: string;
  class: string;
  level: number;
  lastPlayed: string | null;
}

interface SessionFilters {
  search: string;
  difficulty: string;
  duration: string;
  startTime: string;
  minOpenSlots: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockSessions: SessionListItem[] = [
  {
    id: "session-1",
    code: "CRY5TL",
    adventureId: "adv-1",
    adventureName: "The Crystal Caverns",
    adventureThumbnail: null,
    difficulty: "medium",
    estimatedDuration: 60,
    seerId: "seer-1",
    seerDisplayName: "DungeonMaster42",
    seerAvatarUrl: null,
    seerGamesRun: 47,
    playerCount: 2,
    maxPlayers: 4,
    status: "starting_soon",
    scheduledStart: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    isPublic: true,
  },
  {
    id: "session-2",
    code: "DRFST2",
    adventureId: "adv-2",
    adventureName: "The Dark Forest",
    adventureThumbnail: null,
    difficulty: "easy",
    estimatedDuration: 45,
    seerId: "seer-2",
    seerDisplayName: "NewbieSeer",
    seerAvatarUrl: null,
    seerGamesRun: 3,
    playerCount: 1,
    maxPlayers: 4,
    status: "waiting",
    scheduledStart: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    isPublic: true,
  },
  {
    id: "session-3",
    code: "DRGN3X",
    adventureId: "adv-3",
    adventureName: "Dragon's Descent",
    adventureThumbnail: null,
    difficulty: "hard",
    estimatedDuration: 90,
    seerId: "seer-3",
    seerDisplayName: "EpicStoryteller",
    seerAvatarUrl: null,
    seerGamesRun: 156,
    playerCount: 3,
    maxPlayers: 5,
    status: "waiting",
    scheduledStart: null,
    createdAt: new Date().toISOString(),
    isPublic: true,
  },
  {
    id: "session-4",
    code: "LSTTP4",
    adventureId: "adv-4",
    adventureName: "Lost Temple of Secrets",
    adventureThumbnail: null,
    difficulty: "medium",
    estimatedDuration: 60,
    seerId: "seer-4",
    seerDisplayName: "AncientLore",
    seerAvatarUrl: null,
    seerGamesRun: 28,
    playerCount: 0,
    maxPlayers: 4,
    status: "waiting",
    scheduledStart: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    isPublic: true,
  },
];

const mockSessionPreview: SessionPreview = {
  ...mockSessions[0],
  adventureDescription: "A group of adventurers must navigate treacherous crystal caves to find the legendary Gem of Souls before the dark sorcerer claims it for his own nefarious purposes. Ancient traps, magical puzzles, and crystalline guardians await those brave enough to enter.",
  adventureArtwork: null,
  players: [
    {
      userId: "user-1",
      displayName: "Player1",
      characterId: "char-1",
      characterName: "Thorn",
      characterClass: "Warrior",
    },
    {
      userId: "user-2",
      displayName: "Player2",
      characterId: "char-2",
      characterName: "Lyra",
      characterClass: "Wizard",
    },
  ],
  lookingFor: "🩹 Healer recommended • 🗡️ Any class welcome",
};

const mockCharacters: Character[] = [
  { id: "char-1", name: "Kael the Ranger", class: "Scout", level: 1, lastPlayed: "Today" },
  { id: "char-2", name: "Shadow the Rogue", class: "Rogue", level: 2, lastPlayed: "3 days ago" },
  { id: "char-3", name: "Aria Starweaver", class: "Sage", level: 1, lastPlayed: null },
];

const mockActiveSessions: SessionListItem[] = [
  {
    id: "active-1",
    code: "HRO3BH",
    adventureId: "adv-5",
    adventureName: "Heroes of Brighthollow",
    adventureThumbnail: null,
    difficulty: "medium",
    estimatedDuration: 60,
    seerId: "seer-1",
    seerDisplayName: "DungeonMaster42",
    seerAvatarUrl: null,
    seerGamesRun: 47,
    playerCount: 3,
    maxPlayers: 4,
    status: "in_progress",
    scheduledStart: null,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    isPublic: false,
  },
];

// ============================================================================
// HELPERS
// ============================================================================

const difficultyConfig: Record<Difficulty, { label: string; emoji: string; color: string }> = {
  easy: { label: "Easy", emoji: "⭐", color: "text-success" },
  medium: { label: "Medium", emoji: "⭐⭐", color: "text-warning" },
  hard: { label: "Hard", emoji: "⭐⭐⭐", color: "text-error" },
};

function formatTimeUntil(dateStr: string | null): string {
  if (!dateStr) return "Flexible start";
  
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  
  if (diffMs < 0) return "Starting now";
  
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (minutes < 60) return `Starts in ${minutes} minutes`;
  if (hours < 24) return `Starts in ${hours} hour${hours > 1 ? "s" : ""}`;
  return `Starts in ${days} day${days > 1 ? "s" : ""}`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// ============================================================================
// COMPONENTS
// ============================================================================

// Search Bar Component
function SearchBar({ 
  value, 
  onChange, 
  onClear,
}: { 
  value: string; 
  onChange: (value: string) => void;
  onClear: () => void;
}): JSX.Element | null {
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  return (
    <div className="relative flex-1">
      <Input
        ref={inputRef}
        placeholder="Search adventures or Seers..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        startIcon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        }
        endIcon={
          value ? (
            <button
              type="button"
              onClick={() => {
                onClear();
                inputRef.current?.focus();
              }}
              className="p-0.5 rounded hover:bg-surface-card"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          ) : undefined
        }
      />
    </div>
  );
}

// Filter Bar Component  
function FilterBar({
  filters,
  onChange,
  onReset,
}: {
  filters: SessionFilters;
  onChange: (key: keyof SessionFilters, value: string) => void;
  onReset: () => void;
}): JSX.Element | null {
  const hasActiveFilters = 
    filters.difficulty !== "" || 
    filters.duration !== "" || 
    filters.startTime !== "" || 
    filters.minOpenSlots !== "";

  return (
    <>
      {/* Desktop filters */}
      <div className="hidden md:flex items-center gap-3 flex-wrap">
        <Select
          value={filters.difficulty}
          onChange={(v) => onChange("difficulty", v)}
          placeholder="All Difficulties"
          options={[
            { value: "", label: "All Difficulties" },
            { value: "easy", label: "⭐ Easy" },
            { value: "medium", label: "⭐⭐ Medium" },
            { value: "hard", label: "⭐⭐⭐ Hard" },
          ]}
        />
        <Select
          value={filters.duration}
          onChange={(v) => onChange("duration", v)}
          placeholder="Any Duration"
          options={[
            { value: "", label: "Any Duration" },
            { value: "30", label: "~30 min" },
            { value: "60", label: "~60 min" },
            { value: "90", label: "90+ min" },
          ]}
        />
        <Select
          value={filters.startTime}
          onChange={(v) => onChange("startTime", v)}
          placeholder="Any Time"
          options={[
            { value: "", label: "Any Time" },
            { value: "soon", label: "Starting Soon (<30m)" },
            { value: "today", label: "Later Today" },
            { value: "later", label: "Tomorrow+" },
          ]}
        />
        <Select
          value={filters.minOpenSlots}
          onChange={(v) => onChange("minOpenSlots", v)}
          placeholder="Any Slots"
          options={[
            { value: "", label: "Any Open Slots" },
            { value: "1", label: "1+ Open" },
            { value: "2", label: "2+ Open" },
            { value: "3", label: "3+ Open" },
          ]}
        />
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            Reset
          </Button>
        )}
      </div>

      {/* Mobile filter button */}
      <div className="md:hidden">
        <MobileFilterSheet 
          filters={filters} 
          onChange={onChange} 
          onReset={onReset}
          hasActiveFilters={hasActiveFilters}
        />
      </div>
    </>
  );
}

// Mobile Filter Sheet
function MobileFilterSheet({
  filters,
  onChange,
  onReset,
  hasActiveFilters,
}: {
  filters: SessionFilters;
  onChange: (key: keyof SessionFilters, value: string) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}): JSX.Element | null {
  const [isOpen, setIsOpen] = React.useState(false);
  const activeCount = [filters.difficulty, filters.duration, filters.startTime, filters.minOpenSlots].filter(Boolean).length;

  return (
    <>
      <Button 
        variant="secondary" 
        onClick={() => setIsOpen(true)}
        className="relative"
      >
        Filters
        {activeCount > 0 && (
          <Badge variant="info" size="sm" className="ml-2">
            {activeCount}
          </Badge>
        )}
      </Button>

      <Modal open={isOpen} onClose={() => setIsOpen(false)} size="lg">
        <ModalHeader>
          <ModalTitle>Filter Sessions</ModalTitle>
          <ModalClose onClick={() => setIsOpen(false)} />
        </ModalHeader>
        <ModalBody className="space-y-4">
          <Select
            label="Difficulty"
            value={filters.difficulty}
            onChange={(v) => onChange("difficulty", v)}
            placeholder="All Difficulties"
            options={[
              { value: "", label: "All Difficulties" },
              { value: "easy", label: "⭐ Easy" },
              { value: "medium", label: "⭐⭐ Medium" },
              { value: "hard", label: "⭐⭐⭐ Hard" },
            ]}
          />
          <Select
            label="Duration"
            value={filters.duration}
            onChange={(v) => onChange("duration", v)}
            placeholder="Any Duration"
            options={[
              { value: "", label: "Any Duration" },
              { value: "30", label: "~30 minutes" },
              { value: "60", label: "~60 minutes" },
              { value: "90", label: "90+ minutes" },
            ]}
          />
          <Select
            label="Start Time"
            value={filters.startTime}
            onChange={(v) => onChange("startTime", v)}
            placeholder="Any Time"
            options={[
              { value: "", label: "Any Time" },
              { value: "soon", label: "Starting Soon (<30m)" },
              { value: "today", label: "Later Today" },
              { value: "later", label: "Tomorrow+" },
            ]}
          />
          <Select
            label="Open Slots"
            value={filters.minOpenSlots}
            onChange={(v) => onChange("minOpenSlots", v)}
            placeholder="Any Slots"
            options={[
              { value: "", label: "Any Open Slots" },
              { value: "1", label: "1+ Open" },
              { value: "2", label: "2+ Open" },
              { value: "3", label: "3+ Open" },
            ]}
          />
        </ModalBody>
        <ModalFooter>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={onReset}>
              Reset All
            </Button>
          )}
          <Button variant="primary" onClick={() => setIsOpen(false)}>
            Apply Filters
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

// Session Card Component
function SessionCard({
  session,
  onClick,
  onJoin,
  isActive = false,
}: {
  session: SessionListItem;
  onClick: () => void;
  onJoin: (e: React.MouseEvent) => void;
  isActive?: boolean;
}): JSX.Element | null {
  const difficulty = difficultyConfig[session.difficulty];
  const openSlots = session.maxPlayers - session.playerCount;
  const isFull = openSlots <= 0;
  const isStartingSoon = session.status === "starting_soon";

  return (
    <Card 
      interactive 
      className={`relative overflow-hidden transition-all ${
        isStartingSoon ? "ring-2 ring-warning/50" : ""
      } ${isFull ? "opacity-60" : ""}`}
      onClick={onClick}
    >
      {isStartingSoon && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-warning animate-pulse" />
      )}
      
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Thumbnail */}
          <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-surface-elevated flex items-center justify-center text-3xl">
            {session.adventureThumbnail ? (
              <img 
                src={session.adventureThumbnail} 
                alt={session.adventureName}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              "🗺️"
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold truncate">{session.adventureName}</h3>
              {isFull && <Badge variant="default">Full</Badge>}
              {isStartingSoon && !isFull && <Badge variant="warning">Starting Soon</Badge>}
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mb-2">
              <span className={difficulty.color}>{difficulty.emoji} {difficulty.label}</span>
              <span>⏱️ {formatDuration(session.estimatedDuration)}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Avatar
                src={session.seerAvatarUrl || undefined}
                alt={session.seerDisplayName}
                fallback={session.seerDisplayName.charAt(0)}
                size="xs"
              />
              <span>@{session.seerDisplayName}</span>
              <span className="text-muted">({session.seerGamesRun} games)</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <span className={openSlots > 0 ? "text-success" : "text-muted"}>
                  👥 {session.playerCount}/{session.maxPlayers} players
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-divider">
          <span className="text-sm text-muted-foreground">
            🕐 {formatTimeUntil(session.scheduledStart)}
          </span>
          
          {isActive ? (
            <Link href={`/sessions/${session.id}`}>
              <Button variant="primary" size="sm" onClick={(e) => e.stopPropagation()}>
                Continue
              </Button>
            </Link>
          ) : (
            <Button
              variant={isFull ? "secondary" : "primary"}
              size="sm"
              onClick={onJoin}
              disabled={isFull}
            >
              {isFull ? "Full" : "Join"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Session Preview Modal
function SessionPreviewModal({
  session,
  isOpen,
  onClose,
  onJoin,
}: {
  session: SessionPreview | null;
  isOpen: boolean;
  onClose: () => void;
  onJoin: () => void;
}): JSX.Element | null {
  if (!session) return null;
  
  const difficulty = difficultyConfig[session.difficulty];
  const openSlots = session.maxPlayers - session.playerCount;
  const isFull = openSlots <= 0;

  return (
    <Modal open={isOpen} onClose={onClose} size="lg">
      <ModalHeader>
        <ModalTitle>Session Preview</ModalTitle>
        <ModalClose onClick={onClose} />
      </ModalHeader>
      
      <ModalBody className="space-y-6">
        {/* Adventure header */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-24 h-24 rounded-lg bg-surface-elevated flex items-center justify-center text-4xl">
            {session.adventureArtwork ? (
              <img 
                src={session.adventureArtwork} 
                alt={session.adventureName}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              "🗺️"
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-1">{session.adventureName}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Avatar
                src={session.seerAvatarUrl || undefined}
                alt={session.seerDisplayName}
                fallback={session.seerDisplayName.charAt(0)}
                size="xs"
              />
              <span>by @{session.seerDisplayName}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-muted-foreground leading-relaxed">
          {session.adventureDescription}
        </p>

        <hr className="border-surface-divider" />

        {/* Current Party */}
        <div>
          <h4 className="font-medium mb-3">
            Current Party ({session.playerCount}/{session.maxPlayers})
          </h4>
          {session.players.length > 0 ? (
            <div className="space-y-2">
              {session.players.map((player) => (
                <div key={player.characterId} className="flex items-center gap-3 p-2 rounded-lg bg-surface-elevated">
                  <Avatar
                    alt={player.characterName}
                    fallback={player.characterName.charAt(0)}
                    size="sm"
                  />
                  <div>
                    <p className="font-medium text-sm">{player.characterName}</p>
                    <p className="text-xs text-muted-foreground">
                      {player.characterClass} · @{player.displayName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No players yet. Be the first to join!</p>
          )}
        </div>

        {/* Looking For */}
        {session.lookingFor && (
          <div className="p-3 rounded-lg bg-surface-elevated">
            <h4 className="font-medium mb-1 text-sm">Looking For</h4>
            <p className="text-sm text-muted-foreground">{session.lookingFor}</p>
          </div>
        )}

        <hr className="border-surface-divider" />

        {/* Session Details */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl mb-1">⏱️</p>
            <p className="text-sm text-muted-foreground">Estimated</p>
            <p className="font-medium">{formatDuration(session.estimatedDuration)}</p>
          </div>
          <div>
            <p className="text-2xl mb-1">{difficulty.emoji}</p>
            <p className="text-sm text-muted-foreground">Difficulty</p>
            <p className={`font-medium ${difficulty.color}`}>{difficulty.label}</p>
          </div>
          <div>
            <p className="text-2xl mb-1">🕐</p>
            <p className="text-sm text-muted-foreground">Starts</p>
            <p className="font-medium text-sm">{formatTimeUntil(session.scheduledStart)}</p>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onJoin} disabled={isFull}>
          {isFull ? "Session Full" : "Join with Character"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

// Character Select Modal
function CharacterSelectModal({
  isOpen,
  onClose,
  onSelect,
  characters,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (characterId: string) => void;
  characters: Character[];
}): JSX.Element | null {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  return (
    <Modal open={isOpen} onClose={onClose} size="md">
      <ModalHeader>
        <ModalTitle>Select Character</ModalTitle>
        <ModalClose onClick={onClose} />
      </ModalHeader>

      <ModalBody>
        <p className="text-sm text-muted-foreground mb-4">
          Choose a character to join this session:
        </p>

        <div className="space-y-2">
          {characters.map((char) => (
            <button
              key={char.id}
              type="button"
              className={`w-full p-3 rounded-lg border text-left transition-all ${
                selectedId === char.id
                  ? "border-bronze bg-bronze/10"
                  : "border-surface-divider bg-surface-card hover:border-bronze/50"
              }`}
              onClick={() => setSelectedId(char.id)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedId === char.id ? "border-bronze" : "border-muted"
                }`}>
                  {selectedId === char.id && (
                    <div className="w-2.5 h-2.5 rounded-full bg-bronze" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{char.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Level {char.level} {char.class}
                    {char.lastPlayed && ` · Last played: ${char.lastPlayed}`}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <Link 
          href="/characters/new"
          className="flex items-center gap-2 mt-4 p-3 rounded-lg border border-dashed border-surface-divider text-muted-foreground hover:text-foreground hover:border-bronze/50 transition-colors"
        >
          <span className="text-xl">+</span>
          <span>Create New Character</span>
        </Link>
      </ModalBody>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={() => selectedId && onSelect(selectedId)}
          disabled={!selectedId}
        >
          Join Session
        </Button>
      </ModalFooter>
    </Modal>
  );
}

// Quick Join Modal (by code)
function QuickJoinModal({
  isOpen,
  onClose,
  onJoin,
}: {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (code: string) => void;
}): JSX.Element | null {
  const [code, setCode] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      onJoin(code);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} size="sm">
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          <ModalTitle>Quick Join</ModalTitle>
          <ModalClose onClick={onClose} />
        </ModalHeader>

        <ModalBody>
          <p className="text-sm text-muted-foreground mb-4">
            Enter the 6-character session code to join directly.
          </p>
          <Input
            label="Session Code"
            placeholder="ABC123"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={6}
            autoFocus
            className="font-mono text-center text-xl tracking-widest"
          />
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={code.length !== 6}>
            Join
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

// Empty State Component
function EmptyState({
  type,
  onClearFilters,
  onCreateSession,
}: {
  type: "no-sessions" | "no-results";
  onClearFilters?: () => void;
  onCreateSession?: () => void;
}): JSX.Element | null {
  if (type === "no-results") {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold mb-2">No sessions match your search</h3>
          <p className="text-muted-foreground mb-6">
            Try different keywords or adjust your filters
          </p>
          {onClearFilters && (
            <Button variant="secondary" onClick={onClearFilters}>
              Clear Filters
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="py-16 text-center">
        <div className="text-5xl mb-4">🎲</div>
        <h3 className="text-lg font-semibold mb-2">No public sessions right now</h3>
        <p className="text-muted-foreground mb-6">
          Check back later or create your own adventure!
        </p>
        {onCreateSession && (
          <Button variant="primary" onClick={onCreateSession}>
            Create Session
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function SessionBrowserPage(): JSX.Element | null {
  const router = useRouter();
  const { toast } = useToast();

  // State
  const [sessions] = React.useState<SessionListItem[]>(mockSessions);
  const [activeSessions] = React.useState<SessionListItem[]>(mockActiveSessions);
  const [isLoading, setIsLoading] = React.useState(false);
  const [filters, setFilters] = React.useState<SessionFilters>({
    search: "",
    difficulty: "",
    duration: "",
    startTime: "",
    minOpenSlots: "",
  });

  // Modal state
  const [previewSession, setPreviewSession] = React.useState<SessionPreview | null>(null);
  const [showPreviewModal, setShowPreviewModal] = React.useState(false);
  const [showCharacterModal, setShowCharacterModal] = React.useState(false);
  const [showQuickJoinModal, setShowQuickJoinModal] = React.useState(false);
  const [selectedSessionId, setSelectedSessionId] = React.useState<string | null>(null);

  // Filter change handler
  const handleFilterChange = (key: keyof SessionFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: "",
      difficulty: "",
      duration: "",
      startTime: "",
      minOpenSlots: "",
    });
  };

  // Apply filters (simulated)
  const filteredSessions = React.useMemo(() => {
    return sessions.filter((session) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesName = session.adventureName.toLowerCase().includes(searchLower);
        const matchesSeer = session.seerDisplayName.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesSeer) return false;
      }

      // Difficulty filter
      if (filters.difficulty && session.difficulty !== filters.difficulty) {
        return false;
      }

      // Duration filter
      if (filters.duration) {
        const durationTarget = parseInt(filters.duration);
        if (durationTarget === 90 && session.estimatedDuration < 90) return false;
        if (durationTarget !== 90 && Math.abs(session.estimatedDuration - durationTarget) > 15) return false;
      }

      // Open slots filter
      if (filters.minOpenSlots) {
        const minSlots = parseInt(filters.minOpenSlots);
        const openSlots = session.maxPlayers - session.playerCount;
        if (openSlots < minSlots) return false;
      }

      return true;
    });
  }, [sessions, filters]);

  // Open session preview
  const handleOpenPreview = (session: SessionListItem) => {
    // In real app, fetch full preview data
    setPreviewSession({ ...mockSessionPreview, ...session });
    setShowPreviewModal(true);
  };

  // Handle join click from card
  const handleJoinClick = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    setSelectedSessionId(sessionId);
    setShowCharacterModal(true);
  };

  // Handle join from preview
  const handleJoinFromPreview = () => {
    setShowPreviewModal(false);
    if (previewSession) {
      setSelectedSessionId(previewSession.id);
      setShowCharacterModal(true);
    }
  };

  // Handle character selection
  const handleCharacterSelect = (_characterId: string) => {
    setIsLoading(true);
    
    // Simulate join - in real app, would use characterId to join with that character
    setTimeout(() => {
      setIsLoading(false);
      setShowCharacterModal(false);
      toast.success("Joined Session!", { 
        description: "Redirecting to session lobby..." 
      });
      
      // Redirect to session
      router.push(`/sessions/${selectedSessionId}`);
    }, 1000);
  };

  // Handle quick join by code
  const handleQuickJoin = (code: string) => {
    setIsLoading(true);
    
    // Simulate code lookup
    setTimeout(() => {
      const found = sessions.find((s) => s.code === code);
      setIsLoading(false);
      setShowQuickJoinModal(false);
      
      if (found) {
        handleOpenPreview(found);
      } else {
        toast.error("Session Not Found", {
          description: `No session found with code ${code}`,
        });
      }
    }, 500);
  };

  const hasActiveFilters = 
    filters.search !== "" ||
    filters.difficulty !== "" ||
    filters.duration !== "" ||
    filters.startTime !== "" ||
    filters.minOpenSlots !== "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Browse Sessions</h1>
          <p className="text-sm text-muted-foreground">
            Find and join public game sessions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setShowQuickJoinModal(true)}>
            🎫 Join by Code
          </Button>
          <Link href="/sessions/create">
            <Button variant="primary">+ Create Session</Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          value={filters.search}
          onChange={(v) => handleFilterChange("search", v)}
          onClear={() => handleFilterChange("search", "")}
        />
        <FilterBar
          filters={filters}
          onChange={handleFilterChange}
          onReset={resetFilters}
        />
      </div>

      {/* Active Sessions (user's own) */}
      {activeSessions.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
            Your Active Sessions
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onClick={() => router.push(`/sessions/${session.id}`)}
                onJoin={(e) => e.stopPropagation()}
                isActive
              />
            ))}
          </div>
        </section>
      )}

      {/* Public Sessions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {hasActiveFilters ? "Filtered Sessions" : "Open Sessions"}
            {filteredSessions.length > 0 && (
              <span className="text-muted-foreground font-normal ml-2">
                ({filteredSessions.length})
              </span>
            )}
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : filteredSessions.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onClick={() => handleOpenPreview(session)}
                onJoin={(e) => handleJoinClick(e, session.id)}
              />
            ))}
          </div>
        ) : hasActiveFilters ? (
          <EmptyState type="no-results" onClearFilters={resetFilters} />
        ) : (
          <EmptyState 
            type="no-sessions" 
            onCreateSession={() => router.push("/sessions/create")} 
          />
        )}
      </section>

      {/* Session Preview Modal */}
      <SessionPreviewModal
        session={previewSession}
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onJoin={handleJoinFromPreview}
      />

      {/* Character Select Modal */}
      <CharacterSelectModal
        isOpen={showCharacterModal}
        onClose={() => setShowCharacterModal(false)}
        onSelect={handleCharacterSelect}
        characters={mockCharacters}
      />

      {/* Quick Join Modal */}
      <QuickJoinModal
        isOpen={showQuickJoinModal}
        onClose={() => setShowQuickJoinModal(false)}
        onJoin={handleQuickJoin}
      />
    </div>
  );
}
