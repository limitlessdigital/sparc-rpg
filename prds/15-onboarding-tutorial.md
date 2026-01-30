# PRD 15: Onboarding Tutorial

> **Status**: Ready for Implementation  
> **Priority**: P1 - High  
> **Estimated Effort**: 4 days  
> **Dependencies**: 01-dice-system, 13-character-creation, 04-session-management

---

## Overview

The onboarding tutorial teaches new users how to play SPARC RPG through interactive, hands-on experience. It must work for complete TTRPG newcomers while remaining skippable for veterans. The first 5 minutes determine if players return.

### Goals
- Teach core mechanics in under 10 minutes
- Zero prior TTRPG knowledge required
- Interactive learning (not walls of text)
- Separate paths for Players and Seers
- High completion rate (target: 85%+)

### Non-Goals
- Complete rules compendium
- Advanced strategy guides
- Video tutorials (future enhancement)
- Multiplayer tutorial sessions

---

## User Stories

### US-01: Tutorial Detection
**As a** new user  
**I want to** be prompted to take the tutorial  
**So that** I learn the basics before jumping in

**Acceptance Criteria:**
- [ ] First-time users see tutorial prompt after signup
- [ ] Prompt offers "Start Tutorial" or "Skip for now"
- [ ] Skipping saves preference (can access later)
- [ ] Tutorial accessible from help menu anytime
- [ ] Completing tutorial sets `has_completed_tutorial` flag

### US-02: Role Selection
**As a** new user  
**I want to** choose whether to learn as Player or Seer  
**So that** I learn what's relevant to my interests

**Acceptance Criteria:**
- [ ] Clear explanation of Player vs Seer roles
- [ ] Visual distinction (icons, colors)
- [ ] Player path is shorter (~5 min)
- [ ] Seer path includes Player basics + Seer tools (~10 min)
- [ ] Can switch roles and restart anytime

### US-03: Interactive Dice Rolling
**As a** tutorial player  
**I want to** practice rolling dice with guidance  
**So that** I understand the core mechanic

**Acceptance Criteria:**
- [ ] Simulated dice roll with highlighting/tooltips
- [ ] Explains dice pools, difficulty, success/failure
- [ ] User performs actual roll (not just watching)
- [ ] Shows critical success/failure possibilities
- [ ] Explains Heroic Save mechanic

### US-04: Character Introduction
**As a** tutorial player  
**I want to** understand my character sheet  
**So that** I know what my character can do

**Acceptance Criteria:**
- [ ] Tour of character card UI
- [ ] Explains each attribute (Might/Grace/Wit/Heart)
- [ ] Shows how attributes affect dice pools
- [ ] Explains HP and equipment basics
- [ ] Interactive: hover/tap for explanations

### US-05: Combat Basics
**As a** tutorial player  
**I want to** experience a simple combat scenario  
**So that** I understand how fights work

**Acceptance Criteria:**
- [ ] Scripted mini-encounter (1 enemy, guaranteed survivable)
- [ ] Guides through initiative, attack, defense
- [ ] Shows damage calculation
- [ ] Explains turn order
- [ ] Victory celebration at end

### US-06: Seer Tools Overview
**As a** tutorial Seer  
**I want to** understand my dashboard  
**So that** I can run games confidently

**Acceptance Criteria:**
- [ ] Tour of Seer dashboard layout
- [ ] Explains player management
- [ ] Shows how to trigger events/rolls
- [ ] Introduces AI Seer Assistant
- [ ] Brief Adventure Forge preview

### US-07: Tutorial Progress
**As a** tutorial user  
**I want to** see my progress  
**So that** I know how much is left

**Acceptance Criteria:**
- [ ] Progress bar or step indicator visible
- [ ] Can pause and resume later
- [ ] Progress persists across sessions
- [ ] Clear "Complete" state at end
- [ ] Celebration/reward on completion

---

## Tutorial Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         TUTORIAL SYSTEM FLOW                            │
└─────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────┐
                    │  New User       │
                    │  Signs Up       │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Tutorial       │
                    │  Prompt Modal   │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
     [Start Tutorial]              [Skip for now]
              │                             │
              │                             └──────► Dashboard
              ▼                                      (normal flow)
     ┌─────────────────┐
     │  ROLE SELECTION │
     │                 │
     │  ┌───────────┐  │
     │  │  👤       │  │
     │  │ PLAYER    │  │  "Join adventures and
     │  │           │  │   play as a hero"
     │  └───────────┘  │
     │                 │
     │  ┌───────────┐  │
     │  │  🎭       │  │
     │  │  SEER     │  │  "Run games and tell
     │  │           │  │   stories"
     │  └───────────┘  │
     └────────┬────────┘
              │
    ┌─────────┴─────────┐
    │                   │
    ▼                   ▼
PLAYER PATH         SEER PATH
(~5 min)           (~10 min)
    │                   │
    ▼                   │
┌───────────────┐       │
│ 1. Welcome    │       │
│    & Overview │       │
└───────┬───────┘       │
        │               │
        ▼               │
┌───────────────┐       │
│ 2. Character  │       │
│    Basics     │       │
└───────┬───────┘       │
        │               │
        ▼               │
┌───────────────┐       │
│ 3. Dice       │       │
│    Rolling    │       │
└───────┬───────┘       │
        │               │
        ▼               │
┌───────────────┐       │
│ 4. Combat     │       │
│    Practice   │       │
└───────┬───────┘       │
        │               │
        ▼               │
┌───────────────┐       │
│ 5. Ready to   │◄──────┤ (Seer completes
│    Play!      │       │  Player path first)
└───────┬───────┘       │
        │               ▼
        │         ┌───────────────┐
        │         │ 6. Seer       │
        │         │    Dashboard  │
        │         └───────┬───────┘
        │                 │
        │                 ▼
        │         ┌───────────────┐
        │         │ 7. Running    │
        │         │    Sessions   │
        │         └───────┬───────┘
        │                 │
        │                 ▼
        │         ┌───────────────┐
        │         │ 8. AI Seer    │
        │         │    Assistant  │
        │         └───────┬───────┘
        │                 │
        │                 ▼
        │         ┌───────────────┐
        │         │ 9. Adventure  │
        │         │    Forge Peek │
        │         └───────┬───────┘
        │                 │
        │◄────────────────┘
        │
        ▼
┌───────────────┐
│  COMPLETION   │
│  🎉           │
│  Badge/reward │
│  Next steps   │
└───────────────┘
```

---

## Tutorial Content

### Step 1: Welcome & Overview (30 seconds)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    🎲 Welcome to SPARC!                         │
│                                                                 │
│     SPARC is a tabletop roleplaying game where you and        │
│     your friends tell stories together.                        │
│                                                                 │
│     ┌─────────────────────────────────────────────────────┐    │
│     │                                                     │    │
│     │  YOU control a hero                                │    │
│     │  The SEER tells the story                          │    │
│     │  DICE determine what happens                       │    │
│     │                                                     │    │
│     └─────────────────────────────────────────────────────┘    │
│                                                                 │
│     No experience needed. We'll teach you everything!          │
│                                                                 │
│                                          [Let's Go! →]         │
│                                                                 │
│  ═══════════════════════════════════════════════════════════   │
│  Progress: [▓░░░░░░░░░] Step 1 of 5                            │
└─────────────────────────────────────────────────────────────────┘
```

### Step 2: Character Basics (1 minute)

Interactive character card with tooltips:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Meet Your Character                          │
│                                                                 │
│     ╔═══════════════════════════════════════════════════════╗  │
│     ║  ┌─────────────┐                                      ║  │
│     ║  │   [Art]     │   THORN                              ║  │
│     ║  │             │   Warrior        ❤️ 6 HP ←──┐        ║  │
│     ║  └─────────────┘                            │        ║  │
│     ║                                              │        ║  │
│     ║  Might ████████░░  6 ←─────────┐            │        ║  │
│     ║  Grace ████░░░░░░  3           │            │        ║  │
│     ║  Wit   ██░░░░░░░░  2           │            │        ║  │
│     ║  Heart ████░░░░░░  3           │            │        ║  │
│     ╚════════════════════════════════│════════════│════════╝  │
│                                      │            │            │
│     ┌────────────────────────────────▼────┐   ┌───▼──────────┐│
│     │ 💪 ATTRIBUTES                        │   │ ❤️ HIT POINTS ││
│     │ These determine how many dice       │   │ How much     ││
│     │ you roll. Higher = better!          │   │ damage you   ││
│     └─────────────────────────────────────┘   │ can take.    ││
│                                               └──────────────┘│
│                                                                │
│  [Tap any stat to learn more]              [Continue →]        │
│                                                                 │
│  ═══════════════════════════════════════════════════════════   │
│  Progress: [▓▓░░░░░░░░] Step 2 of 5                            │
└─────────────────────────────────────────────────────────────────┘
```

### Step 3: Dice Rolling (2 minutes)

Interactive dice practice:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Rolling Dice                                  │
│                                                                 │
│     The Seer sets a DIFFICULTY. You roll dice based on         │
│     your ATTRIBUTE. Beat the difficulty to succeed!            │
│                                                                 │
│     ┌─────────────────────────────────────────────────────┐    │
│     │                                                     │    │
│     │  SCENARIO: A locked door blocks your path.         │    │
│     │  You try to BASH it down (using Might).            │    │
│     │                                                     │    │
│     │  Your Might: 4  →  Roll 4 dice                     │    │
│     │  Difficulty: 10 →  Need total of 10+ to succeed    │    │
│     │                                                     │    │
│     └─────────────────────────────────────────────────────┘    │
│                                                                 │
│                    ┌─────────────────┐                          │
│                    │                 │                          │
│                    │    [🎲] [🎲]    │                          │
│                    │    [🎲] [🎲]    │                          │
│                    │                 │                          │
│                    └─────────────────┘                          │
│                                                                 │
│                    [ ROLL THE DICE ]                            │
│                                                                 │
│  ═══════════════════════════════════════════════════════════   │
│  Progress: [▓▓▓░░░░░░░] Step 3 of 5                            │
└─────────────────────────────────────────────────────────────────┘
```

After rolling (success):
```
┌─────────────────────────────────────────────────────────────────┐
│                    ✨ SUCCESS!                                   │
│                                                                 │
│     ┌─────────────────────────────────────────────────────┐    │
│     │                                                     │    │
│     │         [3] [5] [4] [2]  =  14                     │    │
│     │                                                     │    │
│     │         You needed: 10                             │    │
│     │         You rolled: 14                             │    │
│     │                                                     │    │
│     │         The door SPLINTERS open!                   │    │
│     │                                                     │    │
│     └─────────────────────────────────────────────────────┘    │
│                                                                 │
│     Great! Now let's see what happens when you fail...         │
│                                                                 │
│                                          [Continue →]          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Step 4: Combat Practice (2-3 minutes)

Mini-encounter with guided steps:

```
┌─────────────────────────────────────────────────────────────────┐
│                    ⚔️ Combat Tutorial                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │    YOU          vs.         GOBLIN                      │   │
│  │  ┌──────┐                  ┌──────┐                    │   │
│  │  │ 👤   │                  │ 👹   │                    │   │
│  │  │ 6 HP │                  │ 3 HP │                    │   │
│  │  └──────┘                  └──────┘                    │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 💬 TUTORIAL GUIDE                                       │   │
│  │                                                         │   │
│  │ Combat has simple steps:                               │   │
│  │ 1. Roll INITIATIVE to see who goes first              │   │
│  │ 2. ATTACK using your attribute vs enemy defense       │   │
│  │ 3. If you hit, deal DAMAGE                           │   │
│  │                                                         │   │
│  │ Let's start by rolling initiative!                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                    [ Roll Initiative ]                          │
│                                                                 │
│  ═══════════════════════════════════════════════════════════   │
│  Progress: [▓▓▓▓░░░░░░] Step 4 of 5                            │
└─────────────────────────────────────────────────────────────────┘
```

### Step 5: Completion

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    🎉 Tutorial Complete!                        │
│                                                                 │
│     ┌─────────────────────────────────────────────────────┐    │
│     │                                                     │    │
│     │              🏆 ADVENTURER                          │    │
│     │                                                     │    │
│     │         You've learned the basics!                 │    │
│     │                                                     │    │
│     └─────────────────────────────────────────────────────┘    │
│                                                                 │
│     You now know:                                              │
│     ✓ How your character works                                 │
│     ✓ How to roll dice                                         │
│     ✓ How combat flows                                         │
│                                                                 │
│     ─────────────────────────────────────────────────────      │
│                                                                 │
│     WHAT'S NEXT?                                               │
│                                                                 │
│     [Create Your Character]    [Browse Sessions]               │
│                                                                 │
│     [Take Seer Tutorial]       [Return to Dashboard]           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technical Specification

### Data Models

```typescript
// Tutorial progress tracking
interface TutorialProgress {
  userId: string;
  path: 'player' | 'seer' | null;
  currentStep: number;
  completedSteps: string[];
  startedAt: string;
  completedAt: string | null;
  skipped: boolean;
}

// Tutorial step definition
interface TutorialStep {
  id: string;
  path: 'player' | 'seer' | 'both';
  order: number;
  title: string;
  type: 'info' | 'interactive' | 'practice';
  content: TutorialContent;
  duration: number;           // estimated seconds
  nextStep: string | null;
}

// Interactive elements
interface TutorialContent {
  component: string;          // React component name
  props: Record<string, any>;
  highlights?: HighlightZone[];
  tooltips?: TooltipConfig[];
}

interface HighlightZone {
  selector: string;
  message: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}
```

### API Endpoints

#### GET /api/v1/tutorial/progress

Returns user's tutorial progress.

**Response (200 OK):**
```typescript
interface TutorialProgressResponse {
  success: true;
  data: {
    progress: TutorialProgress | null;
    hasCompleted: boolean;
    canSkip: boolean;
  };
}
```

#### POST /api/v1/tutorial/start

Starts or resumes tutorial.

**Request:**
```typescript
interface StartTutorialRequest {
  path: 'player' | 'seer';
}
```

**Response (200 OK):**
```typescript
interface StartTutorialResponse {
  success: true;
  data: {
    progress: TutorialProgress;
    currentStep: TutorialStep;
  };
}
```

#### POST /api/v1/tutorial/step/{stepId}/complete

Marks a step as completed.

**Response (200 OK):**
```typescript
interface CompleteStepResponse {
  success: true;
  data: {
    progress: TutorialProgress;
    nextStep: TutorialStep | null;
    isComplete: boolean;
  };
}
```

#### POST /api/v1/tutorial/skip

Skips the tutorial.

**Response (200 OK):**
```typescript
interface SkipTutorialResponse {
  success: true;
  data: {
    skipped: true;
  };
}
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      TutorialProvider                           │
│  - Context for tutorial state                                   │
│  - Manages step progression                                     │
│  - Handles skip/resume                                          │
└──────────────────────────┬──────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ TutorialModal   │ │ TutorialOverlay │ │ TutorialStep    │
│                 │ │                 │ │ Components      │
│ - Entry prompt  │ │ - Highlights    │ │                 │
│ - Role select   │ │ - Tooltips      │ │ - WelcomeStep   │
│ - Exit confirm  │ │ - Focus mask    │ │ - CharacterStep │
└─────────────────┘ └─────────────────┘ │ - DiceStep      │
                                        │ - CombatStep    │
                                        │ - SeerStep      │
                                        │ - CompleteStep  │
                                        └─────────────────┘
```

### Tutorial Step Registry

```typescript
const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    path: 'both',
    order: 1,
    title: 'Welcome to SPARC',
    type: 'info',
    duration: 30,
    nextStep: 'character-basics',
  },
  {
    id: 'character-basics',
    path: 'both',
    order: 2,
    title: 'Character Basics',
    type: 'interactive',
    duration: 60,
    nextStep: 'dice-rolling',
  },
  {
    id: 'dice-rolling',
    path: 'both',
    order: 3,
    title: 'Rolling Dice',
    type: 'practice',
    duration: 120,
    nextStep: 'combat-practice',
  },
  {
    id: 'combat-practice',
    path: 'both',
    order: 4,
    title: 'Combat Practice',
    type: 'practice',
    duration: 180,
    nextStep: 'player-complete',
  },
  {
    id: 'player-complete',
    path: 'player',
    order: 5,
    title: 'Ready to Play!',
    type: 'info',
    duration: 30,
    nextStep: null,
  },
  {
    id: 'seer-dashboard',
    path: 'seer',
    order: 6,
    title: 'Seer Dashboard',
    type: 'interactive',
    duration: 90,
    nextStep: 'running-sessions',
  },
  // ... more Seer steps
];
```

### Database Schema

```sql
CREATE TABLE tutorial_progress (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  path TEXT CHECK (path IN ('player', 'seer')),
  current_step TEXT NOT NULL DEFAULT 'welcome',
  completed_steps TEXT[] NOT NULL DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  skipped BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for quick lookup
CREATE INDEX idx_tutorial_progress_completed ON tutorial_progress(completed_at) 
  WHERE completed_at IS NOT NULL;
```

---

## Analytics & Metrics

Track the following for tutorial optimization:

| Metric | Purpose |
|--------|---------|
| Tutorial start rate | % of new users who start |
| Completion rate | % who finish vs skip |
| Step drop-off | Where users quit |
| Time per step | Identify slow spots |
| Path preference | Player vs Seer choice |
| Post-tutorial action | What users do next |

---

## Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| Keyboard navigation | Tab through all steps |
| Screen reader | ARIA labels, live regions |
| Reduced motion | Option to disable animations |
| Text alternatives | Captions for visual demos |
| Pause capability | Can pause at any point |

---

## Testing Requirements

### Unit Tests

```typescript
describe('TutorialSystem', () => {
  describe('Progress Tracking', () => {
    it('should save progress after each step', async () => {
      const { completeStep } = useTutorial();
      
      await completeStep('welcome');
      
      expect(mockApi.post).toHaveBeenCalledWith(
        '/tutorial/step/welcome/complete'
      );
    });

    it('should restore progress on return', async () => {
      mockApi.get.mockResolvedValue({
        progress: { currentStep: 'dice-rolling', completedSteps: ['welcome', 'character-basics'] }
      });
      
      const { currentStep } = await loadTutorialProgress();
      
      expect(currentStep.id).toBe('dice-rolling');
    });
  });

  describe('Interactive Steps', () => {
    it('should require dice roll before continuing', () => {
      render(<DiceRollingStep />);
      
      expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled();
      
      fireEvent.click(screen.getByRole('button', { name: /roll/i }));
      
      expect(screen.getByRole('button', { name: /continue/i })).toBeEnabled();
    });
  });
});
```

### E2E Tests

```typescript
describe('Tutorial E2E', () => {
  it('should complete player tutorial', async () => {
    await signUpNewUser();
    
    // Tutorial prompt appears
    await expect(page.locator('[data-testid="tutorial-prompt"]')).toBeVisible();
    
    // Start tutorial
    await page.click('[data-testid="start-tutorial"]');
    await page.click('[data-testid="path-player"]');
    
    // Step 1: Welcome
    await page.click('[data-testid="continue-button"]');
    
    // Step 2: Character
    await page.click('[data-testid="continue-button"]');
    
    // Step 3: Dice
    await page.click('[data-testid="roll-dice-button"]');
    await page.click('[data-testid="continue-button"]');
    
    // Step 4: Combat
    await page.click('[data-testid="roll-initiative-button"]');
    await page.click('[data-testid="attack-button"]');
    await page.click('[data-testid="continue-button"]');
    
    // Complete
    await expect(page.locator('[data-testid="tutorial-complete"]')).toBeVisible();
    await expect(page.locator('text=Tutorial Complete')).toBeVisible();
  });

  it('should allow skipping', async () => {
    await signUpNewUser();
    
    await page.click('[data-testid="skip-tutorial"]');
    
    await expect(page).toHaveURL('/dashboard');
  });
});
```

---

## Implementation Checklist

### Backend
- [ ] Create `tutorial_progress` table
- [ ] Create `/api/v1/tutorial/progress` endpoint
- [ ] Create `/api/v1/tutorial/start` endpoint
- [ ] Create `/api/v1/tutorial/step/{id}/complete` endpoint
- [ ] Create `/api/v1/tutorial/skip` endpoint
- [ ] Add analytics event tracking
- [ ] Write unit tests

### Frontend
- [ ] Create `TutorialProvider` context
- [ ] Create `TutorialModal` component
- [ ] Create `TutorialOverlay` component
- [ ] Create `WelcomeStep` component
- [ ] Create `CharacterBasicsStep` component
- [ ] Create `DiceRollingStep` component
- [ ] Create `CombatPracticeStep` component
- [ ] Create `SeerDashboardStep` component (Seer path)
- [ ] Create `TutorialCompleteStep` component
- [ ] Create `ProgressIndicator` component
- [ ] Add highlight/tooltip system
- [ ] Add reduced motion support
- [ ] Write component tests
- [ ] Write E2E tests

### Content
- [ ] Write all tutorial copy
- [ ] Create tutorial character assets
- [ ] Create goblin enemy for combat
- [ ] Record any demo animations
