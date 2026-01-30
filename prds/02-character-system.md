# PRD 02: Character System

> **Status**: Ready for Implementation  
> **Priority**: P0 - Critical Path  
> **Estimated Effort**: 4 days  
> **Dependencies**: 17-database-schema, 18-authentication

---

## Overview

The character system manages player avatars in SPARC RPG. Characters have attributes, classes, equipment, and special abilities. The system prioritizes simplicity—character creation should complete in under 5 minutes for new players.

### Goals
- Enable character creation in under 5 minutes
- Support all 7 SPARC character classes
- Manage character state throughout gameplay
- Persist characters across sessions

### Non-Goals
- Character leveling/progression (MVP scope)
- Inventory trading between players
- Character customization beyond basics

---

## User Stories

### US-01: Create Character
**As a** new player  
**I want to** create a character quickly  
**So that** I can join a game without delay

**Acceptance Criteria:**
- [ ] Select from 7 class archetypes
- [ ] See clear stat previews before selection
- [ ] Enter character name (2-50 characters)
- [ ] Optional: Add short background
- [ ] Character created in database with all defaults
- [ ] Total flow completes in <5 minutes

### US-02: View Class Options
**As a** player choosing a class  
**I want to** see all classes with their abilities  
**So that** I can make an informed choice

**Acceptance Criteria:**
- [ ] All 7 classes displayed with visuals
- [ ] Stats clearly shown (Might/Grace/Wit/Heart)
- [ ] Special ability explained
- [ ] Starting equipment listed
- [ ] Suggested playstyle/background hints

### US-03: View Character Sheet
**As a** player  
**I want to** view my character's full details  
**So that** I know my capabilities

**Acceptance Criteria:**
- [ ] All 4 attributes visible with values
- [ ] Current/max HP displayed
- [ ] Equipment list with effects
- [ ] Special ability with uses remaining
- [ ] Background story section
- [ ] Portrait (if uploaded)

### US-04: Update Character
**As a** player  
**I want to** edit my character's details  
**So that** I can personalize my avatar

**Acceptance Criteria:**
- [ ] Can change name (if not in active session)
- [ ] Can update background text
- [ ] Can upload/change portrait
- [ ] Cannot change class after creation
- [ ] Cannot modify stats directly

### US-05: Manage Multiple Characters
**As a** player  
**I want to** have multiple characters  
**So that** I can play different archetypes

**Acceptance Criteria:**
- [ ] Create up to 10 characters per account
- [ ] List all characters with status
- [ ] Delete inactive characters
- [ ] See which character is in which session

### US-06: Character State in Session
**As a** player in a game  
**I want to** see my character's current state  
**So that** I know my options during play

**Acceptance Criteria:**
- [ ] HP updates in real-time
- [ ] Ability uses tracked per encounter
- [ ] Temporary effects displayed
- [ ] Equipment changes reflected
- [ ] State persists if session pauses

---

## Technical Specification

### Data Models

```typescript
// Core character types (see ARCHITECTURE.md for full definitions)

interface AttributeBlock {
  might: number;   // 1-6, physical power
  grace: number;   // 1-6, agility
  wit: number;     // 1-6, intelligence
  heart: number;   // 1-6, charisma
}

interface Character {
  id: string;
  userId: string;
  name: string;                    // 2-50 chars
  characterClass: CharacterClass;
  attributes: AttributeBlock;
  primaryAttribute: Attribute;
  equipment: Equipment[];
  specialAbilities: SpecialAbility[];
  background: string;              // max 500 chars
  
  maxHitPoints: number;            // default 6
  currentHitPoints: number;
  temporaryHitPoints: number;
  
  experiencePoints: number;
  level: number;                   // 1-10 (future)
  
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  portraitUrl?: string;
}

interface CharacterTemplate {
  characterClass: CharacterClass;
  defaultAttributes: AttributeBlock;
  primaryAttribute: Attribute;
  startingEquipment: Omit<Equipment, 'id'>[];
  specialAbility: Omit<SpecialAbility, 'id' | 'currentUses'>;
  suggestedBackgrounds: string[];
  flavorText: string;
  iconUrl: string;
}
```

### Class Templates

```typescript
const CHARACTER_TEMPLATES: Record<CharacterClass, CharacterTemplate> = {
  [CharacterClass.WARRIOR]: {
    characterClass: CharacterClass.WARRIOR,
    defaultAttributes: { might: 5, grace: 3, wit: 2, heart: 2 },
    primaryAttribute: Attribute.MIGHT,
    startingEquipment: [
      { name: 'Longsword', type: 'weapon', damage: 2, description: 'A reliable steel blade' },
      { name: 'Shield', type: 'armor', defense: 1, description: 'Wooden shield with iron rim' },
      { name: 'Chain Mail', type: 'armor', defense: 2, description: 'Protective metal armor' },
    ],
    specialAbility: {
      name: 'Battle Cry',
      description: 'Intimidate all enemies, giving allies +1 die on their next attack',
      usesPerEncounter: 1,
      effect: {
        type: 'buff',
        targetType: 'all_allies',
        value: 1,
        duration: 1,
      },
    },
    suggestedBackgrounds: [
      'Former soldier seeking redemption',
      'Village protector answering a greater call',
      'Mercenary with a code of honor',
    ],
    flavorText: 'Masters of combat who lead from the front line.',
    iconUrl: '/assets/classes/warrior.svg',
  },

  [CharacterClass.ROGUE]: {
    characterClass: CharacterClass.ROGUE,
    defaultAttributes: { might: 2, grace: 5, wit: 3, heart: 2 },
    primaryAttribute: Attribute.GRACE,
    startingEquipment: [
      { name: 'Daggers (pair)', type: 'weapon', damage: 1, description: 'Twin throwing daggers' },
      { name: 'Leather Armor', type: 'armor', defense: 1, description: 'Light, flexible protection' },
      { name: 'Lockpicks', type: 'accessory', description: 'For opening locked things' },
    ],
    specialAbility: {
      name: 'Sneak Attack',
      description: 'Deal double damage when attacking an unaware enemy',
      usesPerEncounter: 1,
      effect: {
        type: 'damage_boost',
        targetType: 'enemy',
        value: 2, // multiplier
      },
    },
    suggestedBackgrounds: [
      'Street urchin who learned to survive',
      'Disgraced noble living in the shadows',
      'Reformed thief seeking a new path',
    ],
    flavorText: 'Quick and cunning, striking from the shadows.',
    iconUrl: '/assets/classes/rogue.svg',
  },

  [CharacterClass.WIZARD]: {
    characterClass: CharacterClass.WIZARD,
    defaultAttributes: { might: 1, grace: 2, wit: 5, heart: 4 },
    primaryAttribute: Attribute.WIT,
    startingEquipment: [
      { name: 'Staff', type: 'weapon', damage: 1, description: 'Gnarled wooden focus' },
      { name: 'Spellbook', type: 'accessory', description: 'Contains your magical knowledge' },
      { name: 'Robes', type: 'armor', defense: 0, description: 'Comfortable traveling clothes' },
    ],
    specialAbility: {
      name: 'Arcane Bolt',
      description: 'Launch a magical projectile that ignores armor',
      usesPerEncounter: 2,
      effect: {
        type: 'damage_boost',
        targetType: 'enemy',
        value: 3,
      },
    },
    suggestedBackgrounds: [
      'Academy dropout with natural talent',
      'Self-taught mage from a remote village',
      'Apprentice seeking their missing master',
    ],
    flavorText: 'Wielders of arcane power through study and will.',
    iconUrl: '/assets/classes/wizard.svg',
  },

  [CharacterClass.CLERIC]: {
    characterClass: CharacterClass.CLERIC,
    defaultAttributes: { might: 2, grace: 2, wit: 3, heart: 5 },
    primaryAttribute: Attribute.HEART,
    startingEquipment: [
      { name: 'Mace', type: 'weapon', damage: 1, description: 'Blessed blunt weapon' },
      { name: 'Holy Symbol', type: 'accessory', description: 'Focus for divine magic' },
      { name: 'Scale Mail', type: 'armor', defense: 2, description: 'Blessed protective armor' },
    ],
    specialAbility: {
      name: 'Divine Heal',
      description: 'Restore 2 HP to yourself or an ally',
      usesPerEncounter: 2,
      effect: {
        type: 'heal',
        targetType: 'ally',
        value: 2,
      },
    },
    suggestedBackgrounds: [
      'Temple acolyte called to adventure',
      'Wandering healer following visions',
      'Former soldier turned to faith',
    ],
    flavorText: 'Divine servants who heal and protect.',
    iconUrl: '/assets/classes/cleric.svg',
  },

  [CharacterClass.RANGER]: {
    characterClass: CharacterClass.RANGER,
    defaultAttributes: { might: 3, grace: 4, wit: 3, heart: 2 },
    primaryAttribute: Attribute.GRACE,
    startingEquipment: [
      { name: 'Longbow', type: 'weapon', damage: 2, description: 'Expertly crafted hunting bow' },
      { name: 'Short Sword', type: 'weapon', damage: 1, description: 'Backup melee weapon' },
      { name: 'Leather Armor', type: 'armor', defense: 1, description: 'Woodland camouflage' },
    ],
    specialAbility: {
      name: 'Hunter\'s Mark',
      description: 'Mark a target, gaining +2 dice on all attacks against them',
      usesPerEncounter: 1,
      effect: {
        type: 'buff',
        targetType: 'self',
        value: 2,
        duration: 3,
      },
    },
    suggestedBackgrounds: [
      'Wilderness guide who knows every path',
      'Hunter tracking a legendary beast',
      'Exile from civilization finding purpose',
    ],
    flavorText: 'Masters of the wild and deadly with a bow.',
    iconUrl: '/assets/classes/ranger.svg',
  },

  [CharacterClass.PALADIN]: {
    characterClass: CharacterClass.PALADIN,
    defaultAttributes: { might: 4, grace: 2, wit: 2, heart: 4 },
    primaryAttribute: Attribute.MIGHT,
    startingEquipment: [
      { name: 'Blessed Sword', type: 'weapon', damage: 2, description: 'Holy blade that glows faintly' },
      { name: 'Tower Shield', type: 'armor', defense: 2, description: 'Large protective shield' },
      { name: 'Plate Armor', type: 'armor', defense: 3, description: 'Heavy blessed armor' },
    ],
    specialAbility: {
      name: 'Smite Evil',
      description: 'Channel divine energy for +3 damage against undead or demons',
      usesPerEncounter: 1,
      effect: {
        type: 'damage_boost',
        targetType: 'enemy',
        value: 3,
      },
    },
    suggestedBackgrounds: [
      'Holy knight sworn to an oath',
      'Reformed villain seeking redemption',
      'Chosen champion of a forgotten god',
    ],
    flavorText: 'Holy warriors who smite evil and protect the innocent.',
    iconUrl: '/assets/classes/paladin.svg',
  },

  [CharacterClass.NECROMANCER]: {
    characterClass: CharacterClass.NECROMANCER,
    defaultAttributes: { might: 1, grace: 2, wit: 5, heart: 4 },
    primaryAttribute: Attribute.WIT,
    startingEquipment: [
      { name: 'Bone Staff', type: 'weapon', damage: 1, description: 'Staff carved from ancient bone' },
      { name: 'Grimoire', type: 'accessory', description: 'Dark tome of forbidden knowledge' },
      { name: 'Dark Robes', type: 'armor', defense: 0, description: 'Hooded black robes' },
    ],
    specialAbility: {
      name: 'Raise Dead',
      description: 'Animate a defeated enemy to fight for you (2 HP, attacks for 1 damage)',
      usesPerEncounter: 1,
      effect: {
        type: 'custom',
        targetType: 'enemy',
        customLogic: 'summon_skeleton',
      },
    },
    suggestedBackgrounds: [
      'Scholar obsessed with death\'s mysteries',
      'Outcast seeking power others fear',
      'Someone who lost everything and wants it back',
    ],
    flavorText: 'Dark mages who command the forces of death.',
    iconUrl: '/assets/classes/necromancer.svg',
  },
};
```

### API Endpoints

#### GET /api/v1/characters/templates

Returns all available character class templates.

**Response (200 OK):**
```typescript
interface GetTemplatesResponse {
  success: true;
  data: CharacterTemplate[];
}
```

#### POST /api/v1/characters

Create a new character.

**Request:**
```typescript
interface CreateCharacterRequest {
  name: string;                   // 2-50 chars, required
  characterClass: CharacterClass; // required
  background?: string;            // max 500 chars
}
```

**Response (201 Created):**
```typescript
interface CreateCharacterResponse {
  success: true;
  data: Character;
}
```

**Validation:**
- Name: 2-50 characters, alphanumeric + spaces
- Class: Must be valid CharacterClass enum value
- Background: Max 500 characters
- User cannot have >10 characters

**Error Responses:**
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Not authenticated
- `409 Conflict`: Name already used by this user
- `422 Unprocessable Entity`: Character limit reached

#### GET /api/v1/characters

List all characters for authenticated user.

**Query Parameters:**
- `includeInactive` (boolean): Include soft-deleted characters
- `page` (number): Page number (default 1)
- `pageSize` (number): Results per page (default 20, max 100)

**Response (200 OK):**
```typescript
interface ListCharactersResponse {
  success: true;
  data: Character[];
  meta: {
    pagination: PaginationMeta;
  };
}
```

#### GET /api/v1/characters/:id

Get single character by ID.

**Response (200 OK):**
```typescript
interface GetCharacterResponse {
  success: true;
  data: Character;
}
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Character belongs to another user
- `404 Not Found`: Character not found

#### PATCH /api/v1/characters/:id

Update character details.

**Request:**
```typescript
interface UpdateCharacterRequest {
  name?: string;                  // 2-50 chars
  background?: string;            // max 500 chars
  portraitUrl?: string;           // valid URL
}
```

**Response (200 OK):**
```typescript
interface UpdateCharacterResponse {
  success: true;
  data: Character;
}
```

**Constraints:**
- Cannot update if character is in active session
- Cannot change class or stats

#### DELETE /api/v1/characters/:id

Soft-delete a character.

**Response (200 OK):**
```typescript
interface DeleteCharacterResponse {
  success: true;
  data: { deleted: true; id: string };
}
```

**Constraints:**
- Cannot delete if character is in active session
- Soft delete (sets isActive = false)

#### POST /api/v1/characters/:id/portrait

Upload character portrait image.

**Request:**
- Content-Type: multipart/form-data
- Field: `portrait` (image file)
- Max size: 2MB
- Formats: JPEG, PNG, WebP

**Response (200 OK):**
```typescript
interface UploadPortraitResponse {
  success: true;
  data: {
    portraitUrl: string;
  };
}
```

### Database Schema

```sql
CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic info
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 50),
  character_class TEXT NOT NULL CHECK (character_class IN (
    'warrior', 'rogue', 'wizard', 'cleric', 'ranger', 'paladin', 'necromancer'
  )),
  background TEXT CHECK (char_length(background) <= 500),
  portrait_url TEXT,
  
  -- Attributes (stored as JSONB for flexibility)
  attributes JSONB NOT NULL DEFAULT '{"might": 2, "grace": 2, "wit": 2, "heart": 2}',
  primary_attribute TEXT NOT NULL CHECK (primary_attribute IN ('might', 'grace', 'wit', 'heart')),
  
  -- Equipment and abilities (JSONB arrays)
  equipment JSONB NOT NULL DEFAULT '[]',
  special_abilities JSONB NOT NULL DEFAULT '[]',
  
  -- Combat stats
  max_hit_points INTEGER NOT NULL DEFAULT 6 CHECK (max_hit_points BETWEEN 1 AND 20),
  current_hit_points INTEGER NOT NULL DEFAULT 6,
  temporary_hit_points INTEGER NOT NULL DEFAULT 0,
  
  -- Progression (future)
  experience_points INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 10),
  
  -- Meta
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_current_hp CHECK (current_hit_points <= max_hit_points + temporary_hit_points),
  CONSTRAINT unique_name_per_user UNIQUE (user_id, name) WHERE is_active = true
);

-- Indexes
CREATE INDEX idx_characters_user ON characters(user_id);
CREATE INDEX idx_characters_active ON characters(user_id) WHERE is_active = true;

-- Update trigger
CREATE TRIGGER update_characters_timestamp
  BEFORE UPDATE ON characters
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- RLS Policies
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own characters"
ON characters FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own characters"
ON characters FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own characters"
ON characters FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own characters"
ON characters FOR DELETE
USING (auth.uid() = user_id);
```

### Data Flow: Character Creation

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Player    │     │   Frontend  │     │   Backend   │     │  Database   │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │                   │
       │  Open create form │                   │                   │
       │──────────────────>│                   │                   │
       │                   │                   │                   │
       │                   │  GET /templates   │                   │
       │                   │──────────────────>│                   │
       │                   │                   │                   │
       │                   │<──────────────────│                   │
       │                   │  CharacterTemplate[]                  │
       │                   │                   │                   │
       │<──────────────────│                   │                   │
       │  Display classes  │                   │                   │
       │                   │                   │                   │
       │  Select Warrior   │                   │                   │
       │──────────────────>│                   │                   │
       │                   │                   │                   │
       │<──────────────────│                   │                   │
       │  Show Warrior stats│                  │                   │
       │                   │                   │                   │
       │  Enter name       │                   │                   │
       │  "Thorin"         │                   │                   │
       │──────────────────>│                   │                   │
       │                   │                   │                   │
       │  Click Create     │                   │                   │
       │──────────────────>│                   │                   │
       │                   │                   │                   │
       │                   │  POST /characters │                   │
       │                   │  { name, class }  │                   │
       │                   │──────────────────>│                   │
       │                   │                   │                   │
       │                   │                   │  Validate input   │
       │                   │                   │  Apply template   │
       │                   │                   │                   │
       │                   │                   │  INSERT character │
       │                   │                   │──────────────────>│
       │                   │                   │                   │
       │                   │                   │<──────────────────│
       │                   │                   │  Character row    │
       │                   │                   │                   │
       │                   │<──────────────────│                   │
       │                   │  Character object │                   │
       │                   │                   │                   │
       │<──────────────────│                   │                   │
       │  Show character   │                   │                   │
       │  sheet + success  │                   │                   │
       │                   │                   │                   │
```

### Error Handling

```typescript
enum CharacterErrorCode {
  NAME_REQUIRED = 'CHAR_001',
  NAME_TOO_SHORT = 'CHAR_002',
  NAME_TOO_LONG = 'CHAR_003',
  NAME_INVALID_CHARS = 'CHAR_004',
  NAME_ALREADY_EXISTS = 'CHAR_005',
  INVALID_CLASS = 'CHAR_006',
  BACKGROUND_TOO_LONG = 'CHAR_007',
  CHARACTER_LIMIT_REACHED = 'CHAR_008',
  CHARACTER_NOT_FOUND = 'CHAR_009',
  CHARACTER_IN_SESSION = 'CHAR_010',
  INVALID_PORTRAIT_FORMAT = 'CHAR_011',
  PORTRAIT_TOO_LARGE = 'CHAR_012',
}

const characterErrors: Record<CharacterErrorCode, { status: number; message: string }> = {
  [CharacterErrorCode.NAME_REQUIRED]: {
    status: 400,
    message: 'Character name is required',
  },
  [CharacterErrorCode.NAME_TOO_SHORT]: {
    status: 400,
    message: 'Character name must be at least 2 characters',
  },
  [CharacterErrorCode.NAME_TOO_LONG]: {
    status: 400,
    message: 'Character name cannot exceed 50 characters',
  },
  [CharacterErrorCode.NAME_INVALID_CHARS]: {
    status: 400,
    message: 'Character name can only contain letters, numbers, and spaces',
  },
  [CharacterErrorCode.NAME_ALREADY_EXISTS]: {
    status: 409,
    message: 'You already have a character with this name',
  },
  [CharacterErrorCode.INVALID_CLASS]: {
    status: 400,
    message: 'Invalid character class',
  },
  [CharacterErrorCode.BACKGROUND_TOO_LONG]: {
    status: 400,
    message: 'Background cannot exceed 500 characters',
  },
  [CharacterErrorCode.CHARACTER_LIMIT_REACHED]: {
    status: 422,
    message: 'Maximum of 10 characters per account',
  },
  [CharacterErrorCode.CHARACTER_NOT_FOUND]: {
    status: 404,
    message: 'Character not found',
  },
  [CharacterErrorCode.CHARACTER_IN_SESSION]: {
    status: 422,
    message: 'Cannot modify character while in active session',
  },
  [CharacterErrorCode.INVALID_PORTRAIT_FORMAT]: {
    status: 400,
    message: 'Portrait must be JPEG, PNG, or WebP',
  },
  [CharacterErrorCode.PORTRAIT_TOO_LARGE]: {
    status: 400,
    message: 'Portrait cannot exceed 2MB',
  },
};
```

---

## Testing Requirements

### Unit Tests

```typescript
describe('CharacterService', () => {
  describe('createCharacter', () => {
    it('should create character with template defaults', async () => {
      const character = await CharacterService.create({
        userId: user.id,
        name: 'Thorin',
        characterClass: CharacterClass.WARRIOR,
      });

      expect(character.name).toBe('Thorin');
      expect(character.characterClass).toBe(CharacterClass.WARRIOR);
      expect(character.attributes).toEqual({ might: 5, grace: 3, wit: 2, heart: 2 });
      expect(character.primaryAttribute).toBe(Attribute.MIGHT);
      expect(character.equipment).toHaveLength(3);
      expect(character.maxHitPoints).toBe(6);
      expect(character.currentHitPoints).toBe(6);
    });

    it('should reject duplicate names for same user', async () => {
      await CharacterService.create({ userId: user.id, name: 'Thorin', characterClass: CharacterClass.WARRIOR });
      
      await expect(
        CharacterService.create({ userId: user.id, name: 'Thorin', characterClass: CharacterClass.ROGUE })
      ).rejects.toThrow(CharacterErrorCode.NAME_ALREADY_EXISTS);
    });

    it('should allow same name for different users', async () => {
      await CharacterService.create({ userId: user1.id, name: 'Thorin', characterClass: CharacterClass.WARRIOR });
      
      const character = await CharacterService.create({ 
        userId: user2.id, 
        name: 'Thorin', 
        characterClass: CharacterClass.WARRIOR 
      });
      
      expect(character.name).toBe('Thorin');
    });

    it('should enforce character limit', async () => {
      // Create 10 characters
      for (let i = 0; i < 10; i++) {
        await CharacterService.create({ 
          userId: user.id, 
          name: `Character ${i}`, 
          characterClass: CharacterClass.WARRIOR 
        });
      }

      await expect(
        CharacterService.create({ userId: user.id, name: 'Character 11', characterClass: CharacterClass.WARRIOR })
      ).rejects.toThrow(CharacterErrorCode.CHARACTER_LIMIT_REACHED);
    });

    it('should validate name format', async () => {
      await expect(
        CharacterService.create({ userId: user.id, name: 'A', characterClass: CharacterClass.WARRIOR })
      ).rejects.toThrow(CharacterErrorCode.NAME_TOO_SHORT);

      await expect(
        CharacterService.create({ userId: user.id, name: 'X'.repeat(51), characterClass: CharacterClass.WARRIOR })
      ).rejects.toThrow(CharacterErrorCode.NAME_TOO_LONG);

      await expect(
        CharacterService.create({ userId: user.id, name: 'Thorin@123', characterClass: CharacterClass.WARRIOR })
      ).rejects.toThrow(CharacterErrorCode.NAME_INVALID_CHARS);
    });
  });

  describe('updateCharacter', () => {
    it('should update allowed fields', async () => {
      const updated = await CharacterService.update(character.id, user.id, {
        name: 'Thorin II',
        background: 'A new journey begins',
      });

      expect(updated.name).toBe('Thorin II');
      expect(updated.background).toBe('A new journey begins');
    });

    it('should reject update if in active session', async () => {
      await SessionService.addPlayer(session.id, character.id);
      await SessionService.start(session.id);

      await expect(
        CharacterService.update(character.id, user.id, { name: 'New Name' })
      ).rejects.toThrow(CharacterErrorCode.CHARACTER_IN_SESSION);
    });
  });

  describe('deleteCharacter', () => {
    it('should soft-delete character', async () => {
      await CharacterService.delete(character.id, user.id);

      const deleted = await CharacterService.getById(character.id, user.id, { includeInactive: true });
      expect(deleted.isActive).toBe(false);
    });

    it('should reject delete if in active session', async () => {
      await SessionService.addPlayer(session.id, character.id);
      await SessionService.start(session.id);

      await expect(
        CharacterService.delete(character.id, user.id)
      ).rejects.toThrow(CharacterErrorCode.CHARACTER_IN_SESSION);
    });
  });
});
```

### Integration Tests

```typescript
describe('Character API', () => {
  describe('POST /api/v1/characters', () => {
    it('should create character for authenticated user', async () => {
      const response = await request(app)
        .post('/api/v1/characters')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Thorin',
          characterClass: 'warrior',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Thorin');
      expect(response.body.data.userId).toBe(user.id);
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app)
        .post('/api/v1/characters')
        .send({ name: 'Thorin', characterClass: 'warrior' });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/characters', () => {
    it('should list only user\'s characters', async () => {
      // Create characters for two users
      await createCharacter(user1.id, 'Character 1');
      await createCharacter(user2.id, 'Character 2');

      const response = await request(app)
        .get('/api/v1/characters')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Character 1');
    });
  });

  describe('GET /api/v1/characters/:id', () => {
    it('should return character for owner', async () => {
      const character = await createCharacter(user.id, 'Thorin');

      const response = await request(app)
        .get(`/api/v1/characters/${character.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(character.id);
    });

    it('should reject access to other user\'s character', async () => {
      const character = await createCharacter(user1.id, 'Thorin');

      const response = await request(app)
        .get(`/api/v1/characters/${character.id}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(response.status).toBe(403);
    });
  });
});
```

### E2E Tests

```typescript
describe('Character Creation Flow', () => {
  it('should complete character creation under 5 minutes', async () => {
    const startTime = Date.now();

    // Navigate to character creation
    await page.goto('/characters/new');

    // Select a class
    await page.click('[data-testid="class-warrior"]');
    await page.waitForSelector('[data-testid="class-preview-warrior"]');

    // Verify stats are shown
    const mightStat = await page.textContent('[data-testid="stat-might"]');
    expect(mightStat).toContain('5');

    // Enter name
    await page.fill('[data-testid="character-name-input"]', 'Thorin the Bold');

    // Optional: Add background
    await page.fill('[data-testid="character-background-input"]', 'A wandering warrior...');

    // Create character
    await page.click('[data-testid="create-character-button"]');

    // Verify redirect to character sheet
    await page.waitForURL(/\/characters\/[a-z0-9-]+/);
    await page.waitForSelector('[data-testid="character-sheet"]');

    // Verify name appears
    const displayedName = await page.textContent('[data-testid="character-name"]');
    expect(displayedName).toBe('Thorin the Bold');

    // Check time
    const totalTime = Date.now() - startTime;
    expect(totalTime).toBeLessThan(5 * 60 * 1000); // 5 minutes in ms
  });

  it('should show validation errors inline', async () => {
    await page.goto('/characters/new');
    await page.click('[data-testid="class-warrior"]');

    // Try to create with empty name
    await page.click('[data-testid="create-character-button"]');

    // Should show error
    const error = await page.textContent('[data-testid="name-error"]');
    expect(error).toContain('required');

    // Try with too short name
    await page.fill('[data-testid="character-name-input"]', 'A');
    await page.click('[data-testid="create-character-button"]');

    const shortError = await page.textContent('[data-testid="name-error"]');
    expect(shortError).toContain('at least 2');
  });
});
```

---

## Implementation Checklist

### Backend
- [ ] Create `characters` table with full schema
- [ ] Implement `GET /api/v1/characters/templates`
- [ ] Implement `POST /api/v1/characters`
- [ ] Implement `GET /api/v1/characters`
- [ ] Implement `GET /api/v1/characters/:id`
- [ ] Implement `PATCH /api/v1/characters/:id`
- [ ] Implement `DELETE /api/v1/characters/:id`
- [ ] Implement `POST /api/v1/characters/:id/portrait`
- [ ] Add portrait image processing (resize, optimize)
- [ ] Add RLS policies
- [ ] Write unit tests
- [ ] Write integration tests

### Frontend
- [ ] Create `CharacterService` API client
- [ ] Create `useCharacter` hook
- [ ] Create `useCharacterList` hook
- [ ] Build class selection component
- [ ] Build character creation form
- [ ] Build character sheet component
- [ ] Build character list view
- [ ] Build character edit form
- [ ] Add portrait upload with preview
- [ ] Add form validation with Zod
- [ ] Write E2E tests

---

## Appendix

### Class Comparison Chart

| Class | Might | Grace | Wit | Heart | Primary | Special |
|-------|-------|-------|-----|-------|---------|---------|
| Warrior | 5 | 3 | 2 | 2 | Might | Battle Cry |
| Rogue | 2 | 5 | 3 | 2 | Grace | Sneak Attack |
| Wizard | 1 | 2 | 5 | 4 | Wit | Arcane Bolt |
| Cleric | 2 | 2 | 3 | 5 | Heart | Divine Heal |
| Ranger | 3 | 4 | 3 | 2 | Grace | Hunter's Mark |
| Paladin | 4 | 2 | 2 | 4 | Might | Smite Evil |
| Necromancer | 1 | 2 | 5 | 4 | Wit | Raise Dead |
