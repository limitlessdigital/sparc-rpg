"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { 
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  Button, Avatar, Badge, Input, useToast,
  DiceRoller,
  // Session Gameplay UI Components
  SessionGameplayView,
  type GameplayState,
  type Choice,
} from "@sparc/ui";

// Session status types
type SessionStatus = "lobby" | "playing" | "paused" | "ended";

// Player in session
interface SessionPlayer {
  id: string;
  name: string;
  avatarUrl?: string | null;
  characterName?: string;
  characterClass?: string;
  isReady: boolean;
  isOnline: boolean;
  isSeer: boolean;
  currentHP?: number;
  maxHP?: number;
}

// Session data
interface Session {
  id: string;
  name: string;
  adventure: string;
  code: string;
  status: SessionStatus;
  seer: SessionPlayer;
  players: SessionPlayer[];
  maxPlayers: number;
  description?: string;
}

// Mock session data for development
const mockSession: Session = {
  id: "session-1",
  name: "Heroes of Brighthollow",
  adventure: "The Dragon's Lair",
  code: "ABC123",
  status: "playing",
  seer: {
    id: "seer-1",
    name: "DungeonMaster42",
    avatarUrl: null,
    isReady: true,
    isOnline: true,
    isSeer: true,
  },
  players: [
    { 
      id: "1", 
      name: "Sarah", 
      characterName: "Theron the Bold", 
      characterClass: "Champion",
      avatarUrl: null, 
      isReady: true, 
      isOnline: true,
      isSeer: false,
      currentHP: 45,
      maxHP: 50,
    },
    { 
      id: "2", 
      name: "Mike", 
      characterName: "Elara Moonshadow", 
      characterClass: "Sage",
      avatarUrl: null, 
      isReady: true, 
      isOnline: true,
      isSeer: false,
      currentHP: 32,
      maxHP: 35,
    },
    { 
      id: "3", 
      name: "Josh", 
      characterName: "Grimjaw Ironforge", 
      characterClass: "Warden",
      avatarUrl: null, 
      isReady: false, 
      isOnline: true,
      isSeer: false,
      currentHP: 55,
      maxHP: 60,
    },
    { 
      id: "4", 
      name: "Emily", 
      characterName: "Luna Starwhisper", 
      characterClass: "Envoy",
      avatarUrl: null, 
      isReady: true, 
      isOnline: false,
      isSeer: false,
      currentHP: 28,
      maxHP: 40,
    },
  ],
  maxPlayers: 5,
  description: "A party of brave adventurers seeks to reclaim the stolen treasure from the ancient dragon Scorath.",
};

// Mock gameplay state for the narrative view
const mockNarrativeState: GameplayState = {
  mode: "narrative",
  locationTitle: "Naigonn Chapel - Entrance",
  locationSubtitle: undefined,
  nodeType: "decision",
  sceneImageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80",
  narrativeText: `You enter a dark stone hall with a large carving of an eye on the opposite wall. There's a large emerald in the center of the eye. To the left is a door flanked by statues of snakes, below them carvings in an ancient language that reads: "Beyond this door lies wisdom." To the right is a door flanked by wooden statues of soldiers, and above them a sign that reads: "Courage is rewarded."

"I am the great Sethras, and I have my eyes on you! Able to travel only by memory! Choose wisely, my honored friends. Must I choose even this? Fear me! Fear me! Hold!"`,
  choices: [
    { id: "left-door", text: "GO THROUGH THE DOOR ON THE LEFT", type: "default" },
    { id: "snake-door", text: "GO THROUGH THE SNAKE DOOR IN THE RIGHT", type: "default" },
    { id: "emerald", text: "TAKE THAT EMERALD!", type: "danger" },
  ],
  party: mockSession.players.map((p, i) => ({
    id: p.id,
    slot: (i + 1) as 1 | 2 | 3 | 4,
    name: p.name,
    characterName: p.characterName,
    characterClass: p.characterClass,
    avatarUrl: p.avatarUrl || undefined,
    currentHP: p.currentHP || 30,
    maxHP: p.maxHP || 50,
    isOnline: p.isOnline,
  })),
};

// Mock gameplay state for the combat view
const mockCombatState: GameplayState = {
  mode: "combat",
  locationTitle: "Naigonn Chapel - Beholder Chamber Combat",
  locationSubtitle: "Combat",
  nodeType: "combat",
  sceneImageUrl: "https://images.unsplash.com/photo-1579547945413-497e1b99dac0?w=800&q=80",
  narrativeText: `If a player collides with the chest, Sethras the beholder takes notice immediately. Sethras is a large floating head with one big eye in his face, eyestalks protruding from the top of his head. He is currently eating what looks like an unfortunate adventurer.

"Who dares disturb me?" he bellows. Sethras raises his eyestalks and uses his eye rays to fire a disintegration ray at the party. If a player takes a hit, they can roll a save to reduce the damage to the next round of attacks.

If this beholder is defeated, it will drop its signature eyestalk weapon—a wand cast from its power within. At full power, the players are free to face the chest.

This beholder has appeared in role play sessions before, and while he now resides in the abyss, the players are free to lose to the chest.`,
  choices: [],
  party: mockSession.players.map((p, i) => ({
    id: p.id,
    slot: (i + 1) as 1 | 2 | 3 | 4,
    name: p.name,
    characterName: p.characterName,
    characterClass: p.characterClass,
    avatarUrl: p.avatarUrl || undefined,
    currentHP: p.currentHP || 30,
    maxHP: p.maxHP || 50,
    isOnline: p.isOnline,
    isCurrentTurn: i === 0, // First player's turn
  })),
  combat: {
    roundNumber: 1,
    participants: [
      { id: "p1", name: "Theron", initiative: 18, currentHP: 45, maxHP: 50, type: "player", isCurrentTurn: true },
      { id: "p2", name: "Elara", initiative: 15, currentHP: 32, maxHP: 35, type: "player", isCurrentTurn: false },
      { id: "p3", name: "Grimjaw", initiative: 12, currentHP: 55, maxHP: 60, type: "player", isCurrentTurn: false },
      { id: "p4", name: "Luna", initiative: 10, currentHP: 28, maxHP: 40, type: "player", isCurrentTurn: false },
      { id: "e1", name: "Sethras", initiative: 16, currentHP: 180, maxHP: 200, type: "enemy", isCurrentTurn: false },
    ],
    actionButtons: [
      { id: "open-chest", text: "OPEN THE CHEST", type: "combat" },
      { id: "party-dies", text: "PARTY DIES", type: "danger" },
    ],
  },
};

// Mock current user (would come from auth context)
const currentUserId = "2"; // Mike

// Player card component
function PlayerCard({ 
  player, 
  isCurrentUser,
  onToggleReady,
}: { 
  player: SessionPlayer;
  isCurrentUser: boolean;
  onToggleReady?: () => void;
}): JSX.Element | null {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
      player.isReady 
        ? "border-success/50 bg-success/5" 
        : "border-surface-divider bg-surface-card"
    }`}>
      <div className="relative">
        <Avatar 
          src={player.avatarUrl || undefined} 
          alt={player.name}
          fallback={player.name.charAt(0)}
          size="md"
        />
        <span 
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface-card ${
            player.isOnline ? "bg-success" : "bg-muted"
          }`}
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">
            {player.name}
            {isCurrentUser && <span className="text-muted-foreground"> (you)</span>}
          </p>
          {player.isSeer && (
            <Badge variant="warning" size="sm">Seer</Badge>
          )}
        </div>
        {player.characterName && (
          <p className="text-sm text-muted-foreground truncate">
            {player.characterName} · {player.characterClass}
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {player.isReady ? (
          <Badge variant="success" size="sm">Ready</Badge>
        ) : (
          <Badge variant="outline" size="sm">Not Ready</Badge>
        )}
        
        {isCurrentUser && !player.isSeer && onToggleReady && (
          <Button
            variant={player.isReady ? "ghost" : "secondary"}
            size="sm"
            onClick={onToggleReady}
          >
            {player.isReady ? "Unready" : "Ready Up"}
          </Button>
        )}
      </div>
    </div>
  );
}

// Join session modal
function JoinByCodeModal({
  isOpen,
  onClose,
  onJoin,
}: {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (code: string) => void;
}): JSX.Element | null {
  const [code, setCode] = React.useState("");
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>Join Session</CardTitle>
          <CardDescription>Enter the session code to join</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            label="Session Code"
            placeholder="ABC123"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            autoFocus
            maxLength={6}
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button 
            variant="primary" 
            onClick={() => onJoin(code)}
            disabled={code.length !== 6}
          >
            Join
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function SessionPage(): JSX.Element | null {
  // TODO: Use useParams().id to fetch real session data from API
  const router = useRouter();
  const { toast } = useToast();
  
  const [session, setSession] = React.useState<Session>(mockSession);
  const [showDiceRoller, setShowDiceRoller] = React.useState(false);
  const [showJoinModal, setShowJoinModal] = React.useState(false);
  const [gameplayMode, setGameplayMode] = React.useState<"narrative" | "combat">("narrative");
  const [selectedChoiceId, setSelectedChoiceId] = React.useState<string | undefined>();
  const [isLoading, setIsLoading] = React.useState(false);

  // Find current user in session
  const currentPlayer = session.players.find(p => p.id === currentUserId);
  const isSeer = session.seer.id === currentUserId;
  const allPlayersReady = session.players.every(p => p.isReady);
  const readyCount = session.players.filter(p => p.isReady).length;

  // Get current gameplay state based on mode
  const currentGameplayState = gameplayMode === "combat" ? mockCombatState : mockNarrativeState;

  // Toggle ready status
  const handleToggleReady = () => {
    setSession(prev => ({
      ...prev,
      players: prev.players.map(p => 
        p.id === currentUserId ? { ...p, isReady: !p.isReady } : p
      ),
    }));
    
    if (currentPlayer?.isReady) {
      toast.info("Status Updated", { description: "You are no longer ready" });
    } else {
      toast.success("Ready!", { description: "Waiting for other players..." });
    }
  };

  // Start session (Seer only)
  const handleStartSession = () => {
    if (!allPlayersReady) {
      toast.warning("Cannot Start", { 
        description: "All players must be ready to start" 
      });
      return;
    }
    
    setSession(prev => ({ ...prev, status: "playing" }));
    toast.success("Adventure Begins!", { 
      description: "The session has started" 
    });
  };

  // Copy session code
  const copySessionCode = () => {
    navigator.clipboard.writeText(session.code);
    toast.success("Copied!", { description: "Session code copied to clipboard" });
  };

  // Join by code
  const handleJoinByCode = (code: string) => {
    // In real app, this would validate the code and join
    toast.info("Joining...", { description: `Joining session ${code}` });
    setShowJoinModal(false);
  };

  // Leave session
  const handleLeaveSession = () => {
    toast.info("Left Session", { description: "You have left the session" });
    router.push("/sessions");
  };

  // Handle choice selection in gameplay
  const handleChoiceSelect = (choice: Choice) => {
    setSelectedChoiceId(choice.id);
    setIsLoading(true);
    
    // Simulate processing
    setTimeout(() => {
      setIsLoading(false);
      setSelectedChoiceId(undefined);
      toast.success("Choice Made!", { description: `You chose: ${choice.text}` });
      
      // Switch to combat mode if certain choices are made
      if (choice.id === "emerald") {
        setGameplayMode("combat");
        toast.warning("Combat Initiated!", { description: "You've angered the guardian!" });
      }
    }, 1500);
  };

  // Handle combat action
  const handleCombatAction = (action: Choice) => {
    setSelectedChoiceId(action.id);
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      setSelectedChoiceId(undefined);
      toast.info("Action Taken!", { description: action.text });
    }, 1000);
  };

  // Handle map click
  const handleMapClick = () => {
    toast.info("Map", { description: "Opening adventure map..." });
  };

  // Lobby view
  if (session.status === "lobby") {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Session Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{session.name}</CardTitle>
                <CardDescription className="mt-1">
                  🗺️ {session.adventure}
                </CardDescription>
              </div>
              <Badge variant="warning" className="text-sm">
                Lobby
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {session.description && (
              <p className="text-muted-foreground">{session.description}</p>
            )}
            
            {/* Session Code */}
            <div className="flex items-center gap-4 p-4 bg-surface-elevated rounded-lg">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Session Code</p>
                <p className="text-2xl font-mono font-bold tracking-wider">{session.code}</p>
              </div>
              <Button variant="secondary" onClick={copySessionCode}>
                📋 Copy
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Players List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Players ({session.players.length + 1}/{session.maxPlayers})
              </CardTitle>
              <Badge variant={allPlayersReady ? "success" : "default"}>
                {readyCount}/{session.players.length} Ready
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Seer */}
            <PlayerCard
              player={session.seer}
              isCurrentUser={isSeer}
            />
            
            {/* Divider */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex-1 h-px bg-surface-divider" />
              <span>Players</span>
              <div className="flex-1 h-px bg-surface-divider" />
            </div>
            
            {/* Players */}
            {session.players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                isCurrentUser={player.id === currentUserId}
                onToggleReady={player.id === currentUserId ? handleToggleReady : undefined}
              />
            ))}
            
            {/* Empty slots */}
            {Array.from({ length: session.maxPlayers - session.players.length - 1 }).map((_, i) => (
              <div 
                key={`empty-${i}`}
                className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-surface-divider rounded-lg text-muted-foreground"
              >
                <span>Empty Slot</span>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" onClick={handleLeaveSession}>
              🚪 Leave Session
            </Button>
            
            {isSeer && (
              <Button 
                variant="primary"
                onClick={handleStartSession}
                disabled={!allPlayersReady}
              >
                {allPlayersReady ? "🎮 Start Adventure" : `Waiting for ${session.players.length - readyCount} player(s)`}
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Button 
            variant="ghost" 
            className="h-auto py-4 flex-col gap-2"
            onClick={() => setShowDiceRoller(!showDiceRoller)}
          >
            <span className="text-2xl">🎲</span>
            <span>Roll Dice</span>
          </Button>
          <Button variant="ghost" className="h-auto py-4 flex-col gap-2">
            <span className="text-2xl">📝</span>
            <span>Character</span>
          </Button>
          <Button variant="ghost" className="h-auto py-4 flex-col gap-2">
            <span className="text-2xl">💬</span>
            <span>Chat</span>
          </Button>
          <Button variant="ghost" className="h-auto py-4 flex-col gap-2">
            <span className="text-2xl">⚙️</span>
            <span>Settings</span>
          </Button>
        </div>

        {/* Dice Roller */}
        {showDiceRoller && (
          <Card>
            <CardHeader>
              <CardTitle>Dice Roller</CardTitle>
            </CardHeader>
            <CardContent>
              <DiceRoller 
                poolSize={3}
                difficulty={4}
                onRoll={(result) => {
                  toast.info("Roll Result", {
                    description: `${result.dice.join(", ")} = ${result.total} (${result.successes} successes)`,
                  });
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Join Modal */}
        <JoinByCodeModal
          isOpen={showJoinModal}
          onClose={() => setShowJoinModal(false)}
          onJoin={handleJoinByCode}
        />
      </div>
    );
  }

  // Active session view (when playing) - NEW GAMEPLAY UI
  // Use fixed positioning to create immersive fullscreen experience
  return (
    <div className="fixed inset-0 z-[100] bg-[#0a1628]">
      {/* Dev Mode Toggle - positioned top right */}
      <div className="absolute top-4 right-4 z-50 flex gap-2 bg-[#0d1f35]/95 backdrop-blur-sm p-2 rounded-lg border border-[#1a3a5c]/50">
        <Button
          variant={gameplayMode === "narrative" ? "primary" : "ghost"}
          size="sm"
          onClick={() => setGameplayMode("narrative")}
          className={gameplayMode === "narrative" ? "bg-bronze-500 hover:bg-bronze-600" : "text-[#8ba4bc] hover:text-white"}
        >
          Narrative
        </Button>
        <Button
          variant={gameplayMode === "combat" ? "primary" : "ghost"}
          size="sm"
          onClick={() => setGameplayMode("combat")}
          className={gameplayMode === "combat" ? "bg-bronze-500 hover:bg-bronze-600" : "text-[#8ba4bc] hover:text-white"}
        >
          Combat
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLeaveSession}
          className="text-[#8ba4bc] hover:text-white"
        >
          Exit
        </Button>
      </div>

      {/* Main Gameplay View - fullscreen immersive */}
      <SessionGameplayView
        state={currentGameplayState}
        currentPlayerId={currentUserId}
        onChoiceSelect={handleChoiceSelect}
        onCombatAction={handleCombatAction}
        onMapClick={handleMapClick}
        selectedChoiceId={selectedChoiceId}
        isLoading={isLoading}
        enableTypewriter={false}
      />
    </div>
  );
}
