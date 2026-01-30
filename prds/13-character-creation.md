# PRD 13: Character Creation Wizard

> **Status**: Ready for Implementation  
> **Priority**: P0 - Critical Path  
> **Estimated Effort**: 4 days  
> **Dependencies**: 02-character-system, 17-database-schema, 18-authentication

---

## Overview

The character creation wizard is the player's first meaningful interaction with SPARC RPG. It must be fast (<5 minutes), approachable for newcomers, and produce characters that feel personal and exciting. This PRD defines the complete wizard UI/UX flow from landing to ready-to-play.

### Goals
- Complete character creation in under 5 minutes
- Zero TTRPG knowledge required to succeed
- Every choice feels meaningful but never paralyzing
- Characters feel personal through minimal inputs
- Seamless transition to joining sessions

### Non-Goals
- Deep character customization (stat allocation, multiclass)
- Character backstory generators
- Avatar/portrait creation tools
- Party composition suggestions

---

## User Stories

### US-01: Class Selection
**As a** new player  
**I want to** browse and select a class visually  
**So that** I can pick a character that appeals to my playstyle

**Acceptance Criteria:**
- [ ] All 7 classes displayed with artwork and short taglines
- [ ] Hovering/tapping shows expanded preview (abilities, stats)
- [ ] Clear visual indication of selected class
- [ ] Mobile-optimized touch targets (48px minimum)
- [ ] Selection persists if user navigates back

### US-02: Quick Preview
**As a** new player  
**I want to** understand what each class does at a glance  
**So that** I don't need to read lengthy descriptions

**Acceptance Criteria:**
- [ ] Tagline (max 10 words) visible without interaction
- [ ] Stat distribution shown as visual bars, not numbers
- [ ] Special ability name + one-sentence description
- [ ] Example playstyle hint (e.g., "Lead from the front")
- [ ] No jargon in any preview text

### US-03: Name Entry
**As a** player  
**I want to** name my character easily  
**So that** I feel ownership over my creation

**Acceptance Criteria:**
- [ ] Single text input, clearly labeled
- [ ] Name suggestions button (random fantasy names)
- [ ] Validation: 2-50 characters, alphanumeric + spaces
- [ ] Profanity filter with graceful error message
- [ ] Auto-capitalize first letter

### US-04: Confirmation Summary
**As a** player  
**I want to** review my character before finalizing  
**So that** I can catch any mistakes

**Acceptance Criteria:**
- [ ] Full character card shown (name, class, stats, ability)
- [ ] Equipment list visible
- [ ] Edit buttons to return to previous steps
- [ ] "Create Character" button prominent
- [ ] Loading state during creation

### US-05: Mobile Experience
**As a** mobile user  
**I want to** create a character on my phone  
**So that** I can join a session without a computer

**Acceptance Criteria:**
- [ ] Entire flow works on 320px viewport
- [ ] Class grid adapts (2 columns on mobile)
- [ ] Touch gestures for navigation (swipe between classes)
- [ ] Keyboard doesn't obscure name input
- [ ] No horizontal scroll at any step

### US-06: Returning User
**As a** returning player  
**I want to** see my existing characters  
**So that** I can either use one or create new

**Acceptance Criteria:**
- [ ] Character list shown before wizard starts
- [ ] Quick "Create New" action visible
- [ ] Existing characters show name, class, last played
- [ ] Can delete characters (with confirmation)
- [ ] Maximum 10 characters per account

---

## User Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CHARACTER CREATION FLOW                         │
└─────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────┐
  │  User lands on  │
  │  /characters    │
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐    Has characters?
  │  Check existing │─────────────────────┐
  │   characters    │                     │
  └────────┬────────┘                     │
           │ No                           │ Yes
           ▼                              ▼
  ┌─────────────────┐         ┌─────────────────┐
  │  Direct to      │         │  Show character │
  │  wizard Step 1  │         │  list + Create  │
  └────────┬────────┘         └────────┬────────┘
           │                           │
           │◄──────────────────────────┘ User clicks "Create New"
           │
           ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │ STEP 1: CLASS SELECTION                                         │
  │                                                                 │
  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐               │
  │  │ Warrior │ │ Rogue   │ │ Wizard  │ │ Cleric  │               │
  │  │  ⚔️     │ │  🗡️     │ │  🔮     │ │  ✨     │               │
  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘               │
  │  ┌─────────┐ ┌─────────┐ ┌─────────┐                           │
  │  │ Paladin │ │ Ranger  │ │Necromancer│                          │
  │  │  🛡️     │ │  🏹     │ │  💀     │                           │
  │  └─────────┘ └─────────┘ └─────────┘                           │
  │                                                                 │
  │  [Hover/tap for details]                    [Continue →]       │
  └────────────────────────────────┬────────────────────────────────┘
                                   │
                                   ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │ STEP 2: NAME YOUR CHARACTER                                     │
  │                                                                 │
  │  You've chosen: Warrior                                         │
  │                                                                 │
  │  ┌─────────────────────────────────────────────────────────┐   │
  │  │  Character Name                                          │   │
  │  └─────────────────────────────────────────────────────────┘   │
  │                                                                 │
  │  [🎲 Suggest Name]                                              │
  │                                                                 │
  │  [← Back]                                    [Continue →]       │
  └────────────────────────────────┬────────────────────────────────┘
                                   │
                                   ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │ STEP 3: REVIEW & CREATE                                         │
  │                                                                 │
  │  ┌─────────────────────────────────────────────────────────┐   │
  │  │                    CHARACTER CARD                        │   │
  │  │  ┌─────────┐                                            │   │
  │  │  │  Art    │  THORN                                     │   │
  │  │  │         │  Warrior                                   │   │
  │  │  └─────────┘                                            │   │
  │  │                                                         │   │
  │  │  Might ████████░░  6    Heart ████░░░░░░  3             │   │
  │  │  Grace ████░░░░░░  3    Wit   ██░░░░░░░░  2             │   │
  │  │                                                         │   │
  │  │  ⚔️ Berserker Rage: +2 Might for one attack            │   │
  │  │                                                         │   │
  │  │  Equipment: Longsword, Shield, Chainmail                │   │
  │  └─────────────────────────────────────────────────────────┘   │
  │                                                                 │
  │  [← Edit Name]  [← Change Class]           [Create Character]  │
  └────────────────────────────────┬────────────────────────────────┘
                                   │
                                   ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │ SUCCESS!                                                        │
  │                                                                 │
  │  Thorn the Warrior is ready for adventure!                      │
  │                                                                 │
  │  [Join a Session]              [Create Another]                 │
  └─────────────────────────────────────────────────────────────────┘
```

---

## Technical Specification

### Data Models

```typescript
// Character Creation State (client-side)
interface CharacterCreationState {
  step: 'class' | 'name' | 'review';
  selectedClass: CharacterClass | null;
  characterName: string;
  isValid: boolean;
  errors: Record<string, string>;
}

// Class Definition (static data)
interface ClassDefinition {
  id: CharacterClass;
  name: string;
  tagline: string;              // Max 10 words
  description: string;          // 2-3 sentences
  attributes: {
    might: number;              // 1-6
    grace: number;
    wit: number;
    heart: number;
  };
  specialAbility: {
    name: string;
    description: string;
    shortDescription: string;   // Max 50 chars
  };
  equipment: string[];
  playstyleHint: string;        // e.g., "For players who like to solve puzzles"
  artworkUrl: string;
}

// Character Creation Request
interface CreateCharacterRequest {
  name: string;
  classId: CharacterClass;
}

// Character Creation Response
interface CreateCharacterResponse {
  success: true;
  data: {
    character: Character;
    redirectUrl?: string;       // If joining session
  };
}
```

### API Endpoints

#### GET /api/v1/characters/classes

Returns all available classes with full details for the wizard.

**Response (200 OK):**
```typescript
interface ClassesResponse {
  success: true;
  data: ClassDefinition[];
}
```

#### POST /api/v1/characters

Creates a new character.

**Request:**
```typescript
interface CreateCharacterRequest {
  name: string;                 // 2-50 chars, validated
  classId: CharacterClass;      // Valid class enum
}
```

**Response (201 Created):**
```typescript
interface CreateCharacterResponse {
  success: true;
  data: {
    character: Character;
  };
}
```

**Error Responses:**
- `400 Bad Request`: Invalid name or class
- `401 Unauthorized`: Not authenticated
- `409 Conflict`: Character limit reached (10)
- `422 Unprocessable Entity`: Name profanity filter

#### GET /api/v1/characters/name-suggestions

Returns random fantasy name suggestions.

**Query Parameters:**
- `count` (optional): Number of names (default 5, max 10)
- `gender` (optional): masculine, feminine, neutral

**Response (200 OK):**
```typescript
interface NameSuggestionsResponse {
  success: true;
  data: {
    names: string[];
  };
}
```

#### GET /api/v1/characters

Returns user's existing characters.

**Response (200 OK):**
```typescript
interface CharacterListResponse {
  success: true;
  data: {
    characters: CharacterSummary[];
    canCreate: boolean;         // false if at limit
    maxCharacters: number;      // 10
  };
}

interface CharacterSummary {
  id: string;
  name: string;
  classId: CharacterClass;
  className: string;
  level: number;
  lastPlayedAt: string | null;
  createdAt: string;
}
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CharacterCreationPage                       │
│  - Route: /characters/new                                       │
│  - Manages wizard state                                         │
│  - Handles navigation between steps                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ ClassSelection  │ │   NameEntry     │ │ ReviewConfirm   │
│ Step            │ │   Step          │ │ Step            │
│                 │ │                 │ │                 │
│ - ClassGrid     │ │ - NameInput     │ │ - CharacterCard │
│ - ClassPreview  │ │ - NameSuggest   │ │ - EditButtons   │
│ - SelectButton  │ │ - Validation    │ │ - CreateButton  │
└─────────────────┘ └─────────────────┘ └─────────────────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │  ProgressIndicator  │
                │  (Step 1/2/3)       │
                └─────────────────────┘
```

### Validation Rules

```typescript
const validationRules = {
  name: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z][a-zA-Z\s'-]*$/,
    profanityCheck: true,
    messages: {
      minLength: 'Name must be at least 2 characters',
      maxLength: 'Name cannot exceed 50 characters',
      pattern: 'Name can only contain letters, spaces, hyphens, and apostrophes',
      profanity: 'Please choose an appropriate name',
    },
  },
  class: {
    required: true,
    validValues: ['warrior', 'rogue', 'wizard', 'cleric', 'paladin', 'ranger', 'necromancer'],
    messages: {
      required: 'Please select a class',
      invalid: 'Invalid class selected',
    },
  },
};
```

### State Management

```typescript
// React Context for wizard state
interface CharacterWizardContext {
  state: CharacterCreationState;
  actions: {
    selectClass: (classId: CharacterClass) => void;
    setName: (name: string) => void;
    validateName: () => boolean;
    goToStep: (step: 'class' | 'name' | 'review') => void;
    createCharacter: () => Promise<Character>;
    reset: () => void;
  };
}

// Reducer for predictable state updates
type WizardAction =
  | { type: 'SELECT_CLASS'; payload: CharacterClass }
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_ERROR'; payload: { field: string; message: string } }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'GO_TO_STEP'; payload: 'class' | 'name' | 'review' }
  | { type: 'RESET' };
```

---

## UI Specifications

### Class Selection Grid

```
Desktop (>768px):
┌─────────────────────────────────────────────────────────────────┐
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  🗡️      │  │  ⚔️      │  │  🔮      │  │  ✨      │        │
│  │ Warrior  │  │  Rogue   │  │  Wizard  │  │  Cleric  │        │
│  │"Lead the │  │"Strike   │  │"Command  │  │"Support  │        │
│  │ charge"  │  │ swiftly" │  │ arcane"  │  │ allies"  │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │  🛡️      │  │  🏹      │  │  💀      │                      │
│  │ Paladin  │  │  Ranger  │  │Necromancer│                      │
│  │"Righteous│  │"Hunt     │  │"Embrace  │                      │
│  │ protector│  │ & track" │  │ darkness"│                      │
│  └──────────┘  └──────────┘  └──────────┘                      │
└─────────────────────────────────────────────────────────────────┘

Mobile (<768px):
┌─────────────────────────────┐
│  ┌──────────┐ ┌──────────┐  │
│  │ Warrior  │ │  Rogue   │  │
│  └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐  │
│  │  Wizard  │ │  Cleric  │  │
│  └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐  │
│  │ Paladin  │ │  Ranger  │  │
│  └──────────┘ └──────────┘  │
│  ┌──────────┐               │
│  │Necromancer│               │
│  └──────────┘               │
└─────────────────────────────┘
```

### Class Preview Panel

When a class is hovered (desktop) or tapped (mobile):

```
┌─────────────────────────────────────────────────────────────────┐
│  WARRIOR                                                 [✕]   │
│  "Lead the charge and protect your allies"                     │
│                                                                 │
│  ┌──────────────────┐                                          │
│  │                  │  ATTRIBUTES                              │
│  │   [Class Art]    │  Might ████████░░ 6                      │
│  │                  │  Grace ████░░░░░░ 3                      │
│  │                  │  Wit   ██░░░░░░░░ 2                      │
│  └──────────────────┘  Heart ████░░░░░░ 3                      │
│                                                                 │
│  ⚔️ BERSERKER RAGE                                             │
│  Once per encounter, gain +2 Might for your next attack.       │
│                                                                 │
│  📦 STARTING EQUIPMENT                                          │
│  Longsword • Shield • Chainmail                                │
│                                                                 │
│  💡 Perfect for: Players who want to lead from the front       │
│                                                                 │
│                                         [Select Warrior →]     │
└─────────────────────────────────────────────────────────────────┘
```

### Character Card (Review Step)

```
┌─────────────────────────────────────────────────────────────────┐
│  ╔═══════════════════════════════════════════════════════════╗ │
│  ║  ┌─────────────┐                                          ║ │
│  ║  │             │    THORN                                 ║ │
│  ║  │ [Class Art] │    Warrior                               ║ │
│  ║  │             │    ❤️ 6 HP                               ║ │
│  ║  └─────────────┘                                          ║ │
│  ║                                                           ║ │
│  ║  Might ████████░░  6     Heart ████░░░░░░  3              ║ │
│  ║  Grace ████░░░░░░  3     Wit   ██░░░░░░░░  2              ║ │
│  ║                                                           ║ │
│  ║  ────────────────────────────────────────────────────     ║ │
│  ║  ⚔️ Berserker Rage                                        ║ │
│  ║  Once per encounter, gain +2 Might for your next attack.  ║ │
│  ║  ────────────────────────────────────────────────────     ║ │
│  ║                                                           ║ │
│  ║  📦 Equipment                                             ║ │
│  ║  • Longsword (+1 Might attack)                           ║ │
│  ║  • Shield (+1 Grace defense)                             ║ │
│  ║  • Chainmail (Armor 2)                                   ║ │
│  ╚═══════════════════════════════════════════════════════════╝ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| Keyboard navigation | Full tab order, Enter to select |
| Screen reader | ARIA labels on all interactive elements |
| Color contrast | WCAG AA minimum (4.5:1) |
| Focus indicators | Visible focus ring on all elements |
| Error announcements | aria-live regions for validation |
| Touch targets | Minimum 48x48px on mobile |

---

## Performance Requirements

| Metric | Target |
|--------|--------|
| Time to interactive | <2s on 3G |
| Class art loading | Lazy load, <100KB each |
| Name validation | <50ms (client-side) |
| Character creation | <500ms API response |
| Page transitions | <100ms animations |

---

## Error Handling

```typescript
enum CharacterCreationErrorCode {
  INVALID_NAME = 'CHAR_001',
  NAME_PROFANITY = 'CHAR_002',
  INVALID_CLASS = 'CHAR_003',
  CHARACTER_LIMIT = 'CHAR_004',
  DUPLICATE_NAME = 'CHAR_005',
  CREATION_FAILED = 'CHAR_006',
}

const characterCreationErrors = {
  [CharacterCreationErrorCode.INVALID_NAME]: {
    status: 400,
    message: 'Please enter a valid character name (2-50 characters)',
  },
  [CharacterCreationErrorCode.NAME_PROFANITY]: {
    status: 422,
    message: 'Please choose an appropriate character name',
  },
  [CharacterCreationErrorCode.INVALID_CLASS]: {
    status: 400,
    message: 'Please select a valid class',
  },
  [CharacterCreationErrorCode.CHARACTER_LIMIT]: {
    status: 409,
    message: 'You have reached the maximum of 10 characters',
  },
  [CharacterCreationErrorCode.DUPLICATE_NAME]: {
    status: 409,
    message: 'You already have a character with this name',
  },
  [CharacterCreationErrorCode.CREATION_FAILED]: {
    status: 500,
    message: 'Failed to create character. Please try again.',
  },
};
```

---

## Testing Requirements

### Unit Tests

```typescript
describe('CharacterCreationWizard', () => {
  describe('Name Validation', () => {
    it('should reject names shorter than 2 characters', () => {
      expect(validateName('A')).toEqual({
        valid: false,
        error: 'Name must be at least 2 characters',
      });
    });

    it('should reject names with invalid characters', () => {
      expect(validateName('Th0rn!')).toEqual({
        valid: false,
        error: 'Name can only contain letters, spaces, hyphens, and apostrophes',
      });
    });

    it('should accept valid names', () => {
      expect(validateName('Thorn')).toEqual({ valid: true });
      expect(validateName("D'arcy")).toEqual({ valid: true });
      expect(validateName('Ana-Maria')).toEqual({ valid: true });
    });

    it('should auto-capitalize first letter', () => {
      const result = formatName('thorn');
      expect(result).toBe('Thorn');
    });
  });

  describe('Class Selection', () => {
    it('should enable continue only when class selected', () => {
      render(<ClassSelectionStep />);
      expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled();
      
      fireEvent.click(screen.getByRole('button', { name: /warrior/i }));
      expect(screen.getByRole('button', { name: /continue/i })).toBeEnabled();
    });

    it('should show preview panel on class hover', async () => {
      render(<ClassSelectionStep />);
      
      fireEvent.mouseEnter(screen.getByRole('button', { name: /wizard/i }));
      await waitFor(() => {
        expect(screen.getByText(/command arcane/i)).toBeInTheDocument();
      });
    });
  });

  describe('Wizard Navigation', () => {
    it('should preserve state when navigating back', async () => {
      render(<CharacterCreationWizard />);
      
      // Select class
      fireEvent.click(screen.getByRole('button', { name: /rogue/i }));
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));
      
      // Enter name
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Shadow' } });
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));
      
      // Go back to class
      fireEvent.click(screen.getByRole('button', { name: /change class/i }));
      
      // Verify rogue still selected
      expect(screen.getByRole('button', { name: /rogue/i })).toHaveAttribute('aria-pressed', 'true');
    });
  });
});
```

### E2E Tests

```typescript
describe('Character Creation E2E', () => {
  it('should complete full creation flow', async () => {
    await page.goto('/characters/new');
    
    // Step 1: Select class
    await page.click('[data-testid="class-warrior"]');
    await page.click('[data-testid="continue-button"]');
    
    // Step 2: Enter name
    await page.fill('[data-testid="character-name-input"]', 'Thorn');
    await page.click('[data-testid="continue-button"]');
    
    // Step 3: Confirm
    await expect(page.locator('[data-testid="character-card"]')).toContainText('Thorn');
    await expect(page.locator('[data-testid="character-card"]')).toContainText('Warrior');
    await page.click('[data-testid="create-character-button"]');
    
    // Success
    await expect(page).toHaveURL(/\/characters$/);
    await expect(page.locator('[data-testid="character-list"]')).toContainText('Thorn');
  });

  it('should handle name suggestions', async () => {
    await page.goto('/characters/new');
    await page.click('[data-testid="class-wizard"]');
    await page.click('[data-testid="continue-button"]');
    
    await page.click('[data-testid="suggest-name-button"]');
    await expect(page.locator('[data-testid="character-name-input"]')).not.toHaveValue('');
  });

  it('should work on mobile viewport', async () => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/characters/new');
    
    // Verify grid is 2 columns
    const classButtons = await page.$$('[data-testid^="class-"]');
    expect(classButtons.length).toBe(7);
    
    // Complete flow
    await page.tap('[data-testid="class-cleric"]');
    await page.tap('[data-testid="continue-button"]');
    await page.fill('[data-testid="character-name-input"]', 'Lumen');
    await page.tap('[data-testid="continue-button"]');
    await page.tap('[data-testid="create-character-button"]');
    
    await expect(page).toHaveURL(/\/characters$/);
  });
});
```

---

## Implementation Checklist

### Backend
- [ ] Create `/api/v1/characters/classes` endpoint
- [ ] Create `/api/v1/characters` POST endpoint
- [ ] Create `/api/v1/characters/name-suggestions` endpoint
- [ ] Add profanity filter service
- [ ] Add character limit validation
- [ ] Write unit tests

### Frontend
- [ ] Create `CharacterCreationPage` route
- [ ] Create `ClassSelectionStep` component
- [ ] Create `ClassPreview` component
- [ ] Create `NameEntryStep` component
- [ ] Create `ReviewConfirmStep` component
- [ ] Create `CharacterCard` component
- [ ] Create `ProgressIndicator` component
- [ ] Implement wizard state management
- [ ] Add client-side validation
- [ ] Add responsive styles
- [ ] Add keyboard navigation
- [ ] Add ARIA labels and screen reader support
- [ ] Write component tests
- [ ] Write E2E tests

---

## Appendix

### Class Reference Data

| Class | Might | Grace | Wit | Heart | Special Ability |
|-------|-------|-------|-----|-------|-----------------|
| Warrior | 6 | 3 | 2 | 3 | Berserker Rage (+2 Might, 1/encounter) |
| Rogue | 2 | 6 | 4 | 2 | Sneak Attack (auto-crit from stealth) |
| Wizard | 1 | 2 | 6 | 5 | Arcane Blast (ranged Wit attack) |
| Cleric | 3 | 2 | 4 | 5 | Healing Touch (restore 2 HP, 1/encounter) |
| Paladin | 5 | 2 | 2 | 5 | Divine Shield (+2 defense, 1/encounter) |
| Ranger | 3 | 5 | 4 | 2 | Precise Shot (ignore cover penalties) |
| Necromancer | 2 | 2 | 5 | 5 | Raise Dead (summon skeleton ally) |

### Name Suggestion Word Lists

```typescript
const nameComponents = {
  prefixes: ['Thorn', 'Shadow', 'Storm', 'Bright', 'Iron', 'Silver', 'Dark', 'Swift'],
  suffixes: ['blade', 'heart', 'wind', 'fire', 'stone', 'song', 'strike', 'watch'],
  standalone: ['Aldric', 'Lyra', 'Kael', 'Mira', 'Theron', 'Sage', 'Quinn', 'Rowan'],
};
```
