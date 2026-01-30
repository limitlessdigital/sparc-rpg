"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  Button,
  Input,
  Select,
  Textarea,
  useToast,
  Spinner,
} from "@sparc/ui";

// ============================================================================
// TYPES
// ============================================================================

type WizardStep = "adventure" | "settings" | "review";

interface Adventure {
  id: string;
  name: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  estimatedDuration: number;
  thumbnail: string | null;
  author: string;
}

interface SessionSettings {
  adventureId: string | null;
  name: string;
  maxPlayers: number;
  isPublic: boolean;
  scheduledStart: string;
  lookingFor: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockAdventures: Adventure[] = [
  {
    id: "adv-1",
    name: "The Crystal Caverns",
    description: "Navigate treacherous crystal caves to find the legendary Gem of Souls before dark forces claim it.",
    difficulty: "medium",
    estimatedDuration: 60,
    thumbnail: null,
    author: "Official SPARC",
  },
  {
    id: "adv-2",
    name: "The Dark Forest",
    description: "A mysterious forest holds secrets of an ancient civilization. Brave adventurers must uncover the truth.",
    difficulty: "easy",
    estimatedDuration: 45,
    thumbnail: null,
    author: "Official SPARC",
  },
  {
    id: "adv-3",
    name: "Dragon's Descent",
    description: "The most challenging dungeon yet. Only the bravest adventurers dare face the ancient wyrm below.",
    difficulty: "hard",
    estimatedDuration: 90,
    thumbnail: null,
    author: "EpicStoryteller",
  },
  {
    id: "adv-4",
    name: "Lost Temple of Secrets",
    description: "Explore ancient ruins filled with puzzles, traps, and forgotten treasures.",
    difficulty: "medium",
    estimatedDuration: 60,
    thumbnail: null,
    author: "AncientLore",
  },
  {
    id: "adv-5",
    name: "The Haunted Manor",
    description: "Investigate strange occurrences at Blackwood Manor. Not all is as it seems...",
    difficulty: "easy",
    estimatedDuration: 45,
    thumbnail: null,
    author: "MysteryWriter",
  },
];

// ============================================================================
// HELPERS
// ============================================================================

const difficultyConfig = {
  easy: { label: "Easy", emoji: "⭐", color: "text-success", bgColor: "bg-success/10" },
  medium: { label: "Medium", emoji: "⭐⭐", color: "text-warning", bgColor: "bg-warning/10" },
  hard: { label: "Hard", emoji: "⭐⭐⭐", color: "text-error", bgColor: "bg-error/10" },
};

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function generateSessionCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ============================================================================
// COMPONENTS
// ============================================================================

// Step Indicator
function StepIndicator({ 
  currentStep, 
  steps 
}: { 
  currentStep: WizardStep;
  steps: { key: WizardStep; label: string }[];
}): JSX.Element | null {
  const currentIndex = steps.findIndex((s) => s.key === currentStep);
  
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isComplete = index < currentIndex;
        
        return (
          <React.Fragment key={step.key}>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-bronze text-white"
                    : isComplete
                    ? "bg-success text-white"
                    : "bg-surface-elevated text-muted"
                }`}
              >
                {isComplete ? "✓" : index + 1}
              </div>
              <span
                className={`hidden sm:inline text-sm ${
                  isActive ? "font-medium text-foreground" : "text-muted"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-8 sm:w-16 h-0.5 ${
                  index < currentIndex ? "bg-success" : "bg-surface-elevated"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Adventure Card for selection
function AdventureCard({
  adventure,
  isSelected,
  onSelect,
}: {
  adventure: Adventure;
  isSelected: boolean;
  onSelect: () => void;
}): JSX.Element | null {
  const difficulty = difficultyConfig[adventure.difficulty];
  
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-lg border transition-all ${
        isSelected
          ? "border-bronze bg-bronze/5 ring-2 ring-bronze/20"
          : "border-surface-divider bg-surface-card hover:border-bronze/50"
      }`}
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-surface-elevated flex items-center justify-center text-2xl">
          {adventure.thumbnail ? (
            <img
              src={adventure.thumbnail}
              alt={adventure.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            "🗺️"
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold truncate">{adventure.name}</h4>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {adventure.description}
          </p>
          <div className="flex items-center gap-3 text-xs">
            <span className={difficulty.color}>
              {difficulty.emoji} {difficulty.label}
            </span>
            <span className="text-muted-foreground">
              ⏱️ {formatDuration(adventure.estimatedDuration)}
            </span>
            <span className="text-muted-foreground">by {adventure.author}</span>
          </div>
        </div>
        {isSelected && (
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-bronze text-white flex items-center justify-center">
            ✓
          </div>
        )}
      </div>
    </button>
  );
}

// Step 1: Adventure Selection
function AdventureStep({
  adventures,
  selectedId,
  onSelect,
  onNext,
}: {
  adventures: Adventure[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
}): JSX.Element | null {
  const [searchQuery, setSearchQuery] = React.useState("");
  
  const filtered = React.useMemo(() => {
    if (!searchQuery) return adventures;
    const q = searchQuery.toLowerCase();
    return adventures.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.author.toLowerCase().includes(q)
    );
  }, [adventures, searchQuery]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select an Adventure</CardTitle>
        <CardDescription>
          Choose the adventure you want to run for this session
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Search adventures..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          startIcon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          }
        />
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((adventure) => (
              <AdventureCard
                key={adventure.id}
                adventure={adventure}
                isSelected={selectedId === adventure.id}
                onSelect={() => onSelect(adventure.id)}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No adventures found matching &quot;{searchQuery}&quot;
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link href="/sessions">
          <Button variant="ghost">Cancel</Button>
        </Link>
        <Button variant="primary" onClick={onNext} disabled={!selectedId}>
          Continue
        </Button>
      </CardFooter>
    </Card>
  );
}

// Step 2: Session Settings
function SettingsStep({
  adventure,
  settings,
  onChange,
  onBack,
  onNext,
}: {
  adventure: Adventure;
  settings: SessionSettings;
  onChange: (updates: Partial<SessionSettings>) => void;
  onBack: () => void;
  onNext: () => void;
}): JSX.Element | null {
  const difficulty = difficultyConfig[adventure.difficulty];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Settings</CardTitle>
        <CardDescription>
          Configure how your session will run
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selected Adventure Summary */}
        <div className="p-4 rounded-lg bg-surface-elevated">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-surface-card flex items-center justify-center text-xl">
              🗺️
            </div>
            <div>
              <p className="font-medium">{adventure.name}</p>
              <p className="text-xs text-muted-foreground">
                <span className={difficulty.color}>{difficulty.emoji} {difficulty.label}</span>
                {" · "}
                <span>⏱️ {formatDuration(adventure.estimatedDuration)}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Session Name */}
        <Input
          label="Session Name"
          placeholder={`${adventure.name} - Game Night`}
          value={settings.name}
          onChange={(e) => onChange({ name: e.target.value })}
          helperText="Give your session a memorable name"
        />

        {/* Max Players */}
        <Select
          label="Maximum Players"
          value={String(settings.maxPlayers)}
          onChange={(v) => onChange({ maxPlayers: parseInt(v) })}
          options={[
            { value: "2", label: "2 Players" },
            { value: "3", label: "3 Players" },
            { value: "4", label: "4 Players" },
            { value: "5", label: "5 Players" },
            { value: "6", label: "6 Players" },
          ]}
        />

        {/* Visibility */}
        <div>
          <label className="block mb-2 text-sm font-medium text-muted-foreground">
            Session Visibility
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onChange({ isPublic: true })}
              className={`p-4 rounded-lg border text-left transition-all ${
                settings.isPublic
                  ? "border-bronze bg-bronze/5"
                  : "border-surface-divider hover:border-bronze/50"
              }`}
            >
              <div className="text-2xl mb-2">🌐</div>
              <p className="font-medium">Public</p>
              <p className="text-xs text-muted-foreground">
                Anyone can find and join
              </p>
            </button>
            <button
              type="button"
              onClick={() => onChange({ isPublic: false })}
              className={`p-4 rounded-lg border text-left transition-all ${
                !settings.isPublic
                  ? "border-bronze bg-bronze/5"
                  : "border-surface-divider hover:border-bronze/50"
              }`}
            >
              <div className="text-2xl mb-2">🔒</div>
              <p className="font-medium">Private</p>
              <p className="text-xs text-muted-foreground">
                Invite only via code
              </p>
            </button>
          </div>
        </div>

        {/* Scheduled Start */}
        <Input
          type="datetime-local"
          label="Scheduled Start (Optional)"
          value={settings.scheduledStart}
          onChange={(e) => onChange({ scheduledStart: e.target.value })}
          helperText="Leave empty to start when you're ready"
        />

        {/* Looking For */}
        {settings.isPublic && (
          <Textarea
            label="Looking For (Optional)"
            placeholder="e.g., 🩹 Healer recommended • 🗡️ Any class welcome"
            value={settings.lookingFor}
            onChange={(e) => onChange({ lookingFor: e.target.value })}
            helperText="Let players know what roles would help the party"
          />
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" onClick={onNext}>
          Review
        </Button>
      </CardFooter>
    </Card>
  );
}

// Step 3: Review & Create
function ReviewStep({
  adventure,
  settings,
  onBack,
  onCreate,
  isCreating,
}: {
  adventure: Adventure;
  settings: SessionSettings;
  onBack: () => void;
  onCreate: () => void;
  isCreating: boolean;
}): JSX.Element | null {
  const difficulty = difficultyConfig[adventure.difficulty];
  const sessionName = settings.name || `${adventure.name} Session`;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Review & Create</CardTitle>
        <CardDescription>
          Review your session details before creating
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Session Summary */}
        <div className="p-6 rounded-lg bg-surface-elevated space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-lg bg-surface-card flex items-center justify-center text-4xl">
              🗺️
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-1">{sessionName}</h3>
              <p className="text-muted-foreground">{adventure.name}</p>
            </div>
          </div>
          
          <hr className="border-surface-divider" />
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl mb-1">{difficulty.emoji}</p>
              <p className="text-xs text-muted-foreground">Difficulty</p>
              <p className={`text-sm font-medium ${difficulty.color}`}>{difficulty.label}</p>
            </div>
            <div>
              <p className="text-2xl mb-1">⏱️</p>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-sm font-medium">{formatDuration(adventure.estimatedDuration)}</p>
            </div>
            <div>
              <p className="text-2xl mb-1">👥</p>
              <p className="text-xs text-muted-foreground">Max Players</p>
              <p className="text-sm font-medium">{settings.maxPlayers}</p>
            </div>
            <div>
              <p className="text-2xl mb-1">{settings.isPublic ? "🌐" : "🔒"}</p>
              <p className="text-xs text-muted-foreground">Visibility</p>
              <p className="text-sm font-medium">{settings.isPublic ? "Public" : "Private"}</p>
            </div>
          </div>

          {settings.scheduledStart && (
            <>
              <hr className="border-surface-divider" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Scheduled Start</p>
                <p className="font-medium">
                  {new Date(settings.scheduledStart).toLocaleString()}
                </p>
              </div>
            </>
          )}

          {settings.lookingFor && (
            <>
              <hr className="border-surface-divider" />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Looking For</p>
                <p className="text-sm">{settings.lookingFor}</p>
              </div>
            </>
          )}
        </div>

        {/* Info box */}
        <div className="p-4 rounded-lg bg-bronze/10 border border-bronze/20">
          <p className="text-sm">
            <strong>📢 What happens next:</strong> After creating, you&apos;ll receive a 
            unique session code to share with players. 
            {settings.isPublic 
              ? " Your session will also appear in the public browser." 
              : " Only people with the code can join."}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost" onClick={onBack} disabled={isCreating}>
          Back
        </Button>
        <Button variant="primary" onClick={onCreate} disabled={isCreating}>
          {isCreating ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Creating...
            </>
          ) : (
            "Create Session"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

const STEPS: { key: WizardStep; label: string }[] = [
  { key: "adventure", label: "Adventure" },
  { key: "settings", label: "Settings" },
  { key: "review", label: "Review" },
];

export default function CreateSessionPage(): JSX.Element | null {
  const router = useRouter();
  const { toast } = useToast();

  // Wizard state
  const [currentStep, setCurrentStep] = React.useState<WizardStep>("adventure");
  const [isCreating, setIsCreating] = React.useState(false);
  
  // Session settings
  const [settings, setSettings] = React.useState<SessionSettings>({
    adventureId: null,
    name: "",
    maxPlayers: 4,
    isPublic: true,
    scheduledStart: "",
    lookingFor: "",
  });

  // Get selected adventure
  const selectedAdventure = React.useMemo(
    () => mockAdventures.find((a) => a.id === settings.adventureId) || null,
    [settings.adventureId]
  );

  // Update settings
  const updateSettings = (updates: Partial<SessionSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  // Create session
  const handleCreate = async () => {
    setIsCreating(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const sessionCode = generateSessionCode();
    
    toast.success("Session Created! 🎉", {
      description: `Session code: ${sessionCode}`,
    });

    // Redirect to session lobby (using demo for now until backend integration)
    router.push(`/sessions/demo`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Create Session</h1>
        <p className="text-muted-foreground">
          Set up a new game session for players to join
        </p>
      </div>

      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} steps={STEPS} />

      {/* Step Content */}
      {currentStep === "adventure" && (
        <AdventureStep
          adventures={mockAdventures}
          selectedId={settings.adventureId}
          onSelect={(id) => updateSettings({ adventureId: id })}
          onNext={() => setCurrentStep("settings")}
        />
      )}

      {currentStep === "settings" && selectedAdventure && (
        <SettingsStep
          adventure={selectedAdventure}
          settings={settings}
          onChange={updateSettings}
          onBack={() => setCurrentStep("adventure")}
          onNext={() => setCurrentStep("review")}
        />
      )}

      {currentStep === "review" && selectedAdventure && (
        <ReviewStep
          adventure={selectedAdventure}
          settings={settings}
          onBack={() => setCurrentStep("settings")}
          onCreate={handleCreate}
          isCreating={isCreating}
        />
      )}
    </div>
  );
}
