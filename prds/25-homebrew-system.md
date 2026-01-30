# PRD 25: Homebrew System

> **Status**: Ready for Implementation  
> **Priority**: P2 - Medium  
> **Estimated Effort**: 6 days  
> **Dependencies**: 02-character-system, 03-combat-system, 17-database-schema, 20-content-management

---

## Overview

The Homebrew System empowers creators to extend SPARC RPG beyond its core content. Users can create custom monsters, items, abilities, spells, and class templates, then share their creations with the community. Version control ensures homebrew can evolve while maintaining compatibility with existing adventures.

### Goals
- Enable creative extension of SPARC's content library
- Provide intuitive creator tools with live preview
- Support community sharing and discovery of homebrew
- Maintain game balance through validation and community ratings
- Allow versioning and iteration on homebrew content

### Non-Goals
- Core rules modification (house rules system)
- Full class/race creation (templates only)
- AI-generated homebrew content
- Real-time collaborative homebrew editing

---

## User Stories

### US-01: Create Custom Monster
**As a** Seer  
**I want to** create custom monsters  
**So that** I can populate my adventures with unique creatures

**Acceptance Criteria:**
- [ ] Form for monster stats (HP, attributes, abilities)
- [ ] Art upload or selection from library
- [ ] Live preview of stat block
- [ ] Difficulty rating auto-calculated
- [ ] Save as draft or publish
- [ ] Usable in Adventure Forge combat nodes

### US-02: Create Custom Item
**As a** Seer  
**I want to** create custom items  
**So that** my adventures have unique rewards

**Acceptance Criteria:**
- [ ] Item types: weapon, armor, consumable, artifact
- [ ] Stat modifiers and special effects
- [ ] Rarity classification
- [ ] Flavor text and lore fields
- [ ] Icon upload or selection
- [ ] Items usable in adventure rewards

### US-03: Create Custom Ability/Spell
**As a** creator  
**I want to** create custom abilities and spells  
**So that** characters have unique options

**Acceptance Criteria:**
- [ ] Ability/spell name and description
- [ ] Effect type (damage, heal, buff, debuff, utility)
- [ ] Targeting (self, ally, enemy, area)
- [ ] Cost and cooldown
- [ ] Required attribute and roll mechanics
- [ ] Visual effect suggestions

### US-04: Create Class Template
**As a** creator  
**I want to** create custom class templates  
**So that** players have more character options

**Acceptance Criteria:**
- [ ] Base stats distribution (Might, Grace, Wit, Heart)
- [ ] Starting equipment set
- [ ] Class ability (one unique ability)
- [ ] Background lore
- [ ] Appearance guidelines
- [ ] Compatible with character creation flow

### US-05: Share Homebrew
**As a** creator  
**I want to** share my homebrew with the community  
**So that** others can use my creations

**Acceptance Criteria:**
- [ ] Publish homebrew to community library
- [ ] Set visibility (public, unlisted, private)
- [ ] Add tags and categories
- [ ] Include usage instructions
- [ ] Track usage statistics

### US-06: Discover Homebrew
**As a** Seer  
**I want to** browse community homebrew  
**So that** I can find content for my adventures

**Acceptance Criteria:**
- [ ] Browse by type (monsters, items, abilities, classes)
- [ ] Filter by rating, popularity, tags
- [ ] Search by name and description
- [ ] Preview before importing
- [ ] One-click import to my library

### US-07: Version Control
**As a** creator  
**I want to** update my published homebrew  
**So that** I can fix issues and improve content

**Acceptance Criteria:**
- [ ] Create new versions without breaking existing usage
- [ ] Changelog for each version
- [ ] Users notified of updates
- [ ] Option to pin specific version
- [ ] Rollback to previous versions

### US-08: Rate and Review Homebrew
**As a** user of homebrew content  
**I want to** rate and review homebrew  
**So that** quality content rises to the top

**Acceptance Criteria:**
- [ ] 5-star rating system
- [ ] Written reviews with guidelines
- [ ] Report inappropriate content
- [ ] Creator can respond to reviews
- [ ] Ratings visible on browse pages

### US-09: Import/Export Homebrew
**As a** creator  
**I want to** export and import homebrew  
**So that** I can backup and share outside the platform

**Acceptance Criteria:**
- [ ] Export to JSON format
- [ ] Export to PDF (formatted stat blocks)
- [ ] Import from JSON
- [ ] Bulk import/export
- [ ] Validation on import

---

## Technical Specification

### Data Models

```typescript
// Base homebrew entity
interface HomebrewBase {
  id: string;
  creatorId: string;
  creatorName: string;
  
  // Metadata
  name: string;
  description: string;
  tags: string[];
  category: HomebrewCategory;
  
  // Media
  iconUrl?: string;
  artUrl?: string;
  
  // State
  status: HomebrewStatus;
  visibility: 'private' | 'unlisted' | 'public';
  
  // Versioning
  currentVersion: string;       // semver
  versions: HomebrewVersion[];
  
  // Stats
  usageCount: number;
  favoriteCount: number;
  averageRating: number;
  ratingCount: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

type HomebrewCategory = 'monster' | 'item' | 'ability' | 'spell' | 'class';
type HomebrewStatus = 'draft' | 'published' | 'archived' | 'flagged';

interface HomebrewVersion {
  id: string;
  homebrewId: string;
  version: string;              // "1.0.0", "1.1.0", etc.
  changelog?: string;
  data: HomebrewData;           // Type-specific content
  createdAt: string;
}

// Monster-specific
interface HomebrewMonster extends HomebrewBase {
  category: 'monster';
  data: MonsterData;
}

interface MonsterData {
  // Core stats
  hitPoints: number;            // 1-100
  armorClass: number;           // 1-20
  
  // Attributes (for opposing rolls)
  might: number;                // 1-6
  grace: number;                // 1-6
  wit: number;                  // 1-6
  heart: number;                // 1-6
  
  // Combat
  attacks: MonsterAttack[];
  abilities: MonsterAbility[];
  
  // Classification
  type: CreatureType;
  size: CreatureSize;
  challengeRating: number;      // Auto-calculated
  
  // Behavior
  tactics?: string;
  motivations?: string;
  weaknesses?: string;
  
  // Lore
  lore?: string;
  habitat?: string;
}

interface MonsterAttack {
  name: string;
  attribute: Attribute;         // Which stat to roll
  diceCount: number;
  damageType: DamageType;
  description?: string;
}

interface MonsterAbility {
  name: string;
  description: string;
  cooldown?: number;            // Rounds
  effect: AbilityEffect;
}

type CreatureType = 
  | 'beast' | 'humanoid' | 'undead' | 'construct'
  | 'elemental' | 'fiend' | 'celestial' | 'aberration'
  | 'dragon' | 'giant' | 'plant' | 'ooze';

type CreatureSize = 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan';
type DamageType = 'physical' | 'fire' | 'ice' | 'lightning' | 'poison' | 'necrotic' | 'radiant';

// Item-specific
interface HomebrewItem extends HomebrewBase {
  category: 'item';
  data: ItemData;
}

interface ItemData {
  itemType: ItemType;
  rarity: ItemRarity;
  
  // Effects
  statModifiers?: StatModifier[];
  specialEffects?: SpecialEffect[];
  
  // For consumables
  uses?: number;
  consumable?: boolean;
  
  // For weapons
  weaponType?: WeaponType;
  diceBonus?: number;           // Extra dice on attacks
  damageType?: DamageType;
  
  // For armor
  armorBonus?: number;
  
  // Flavor
  flavorText?: string;
  lore?: string;
  weight?: number;
  value?: number;               // Gold value
  
  // Requirements
  requirements?: ItemRequirement[];
}

type ItemType = 'weapon' | 'armor' | 'shield' | 'accessory' | 'consumable' | 'artifact' | 'tool';
type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
type WeaponType = 'sword' | 'axe' | 'mace' | 'dagger' | 'bow' | 'staff' | 'spear';

interface StatModifier {
  attribute: Attribute;
  modifier: number;             // +1, +2, etc.
}

interface SpecialEffect {
  name: string;
  description: string;
  trigger: 'always' | 'on_hit' | 'on_crit' | 'on_use' | 'on_damage';
}

interface ItemRequirement {
  type: 'attribute' | 'class' | 'level';
  attribute?: Attribute;
  class?: string;
  minValue?: number;
}

// Ability/Spell-specific
interface HomebrewAbility extends HomebrewBase {
  category: 'ability' | 'spell';
  data: AbilityData;
}

interface AbilityData {
  abilityType: AbilityType;
  
  // Targeting
  targetType: TargetType;
  range?: 'self' | 'touch' | 'ranged';
  areaOfEffect?: 'single' | 'line' | 'cone' | 'circle';
  
  // Mechanics
  attribute?: Attribute;        // Required roll attribute
  difficulty?: number;          // Target difficulty
  
  // Effects
  effects: AbilityEffect[];
  
  // Cost/Limits
  cooldown?: number;            // Rounds or encounters
  usesPerEncounter?: number;
  usesPerDay?: number;
  
  // Flavor
  description: string;
  castingDescription?: string;  // "You raise your hands and..."
  visualEffect?: string;        // Suggested visual
}

type AbilityType = 'attack' | 'heal' | 'buff' | 'debuff' | 'utility' | 'summon';
type TargetType = 'self' | 'ally' | 'enemy' | 'any' | 'all_allies' | 'all_enemies' | 'area';

interface AbilityEffect {
  type: EffectType;
  value?: number;               // Damage amount, heal amount, etc.
  duration?: number;            // Rounds
  condition?: string;           // "On hit", "If target is undead"
}

type EffectType = 
  | 'damage' | 'heal' | 'buff_attribute' | 'debuff_attribute'
  | 'stun' | 'poison' | 'burn' | 'freeze' | 'blind'
  | 'shield' | 'regeneration' | 'haste' | 'slow';

// Class Template-specific
interface HomebrewClass extends HomebrewBase {
  category: 'class';
  data: ClassData;
}

interface ClassData {
  // Base Stats
  primaryAttribute: Attribute;
  attributes: {
    might: number;              // 1-6
    grace: number;
    wit: number;
    heart: number;
  };
  hitPoints: number;
  
  // Starting Gear
  startingEquipment: string[];
  
  // Class Ability
  classAbility: {
    name: string;
    description: string;
    effect: AbilityEffect;
    cooldown?: string;
  };
  
  // Flavor
  archetype: string;            // "The mysterious wanderer..."
  background: string;
  playstyle: string;            // Tips for playing this class
  roleInParty: string;          // "Tank", "Healer", "DPS", "Support"
  
  // Visual
  suggestedAppearance?: string;
}

// Reviews & Ratings
interface HomebrewReview {
  id: string;
  homebrewId: string;
  userId: string;
  userName: string;
  
  rating: number;               // 1-5
  review?: string;
  
  // Metadata
  helpfulCount: number;
  reportCount: number;
  
  // Creator response
  creatorResponse?: {
    text: string;
    respondedAt: string;
  };
  
  createdAt: string;
  updatedAt?: string;
}

// User's homebrew library
interface UserHomebrewLibrary {
  userId: string;
  
  // Created by user
  created: HomebrewReference[];
  
  // Imported from community
  imported: ImportedHomebrew[];
  
  // Favorites
  favorites: string[];          // Homebrew IDs
}

interface HomebrewReference {
  homebrewId: string;
  name: string;
  category: HomebrewCategory;
  status: HomebrewStatus;
}

interface ImportedHomebrew {
  homebrewId: string;
  importedVersion: string;      // Version at import time
  pinnedVersion?: string;       // If user pinned to specific version
  importedAt: string;
}
```

### API Endpoints

#### Homebrew CRUD

##### POST /api/v1/homebrew

Create new homebrew content.

```typescript
interface CreateHomebrewRequest {
  category: HomebrewCategory;
  name: string;
  description: string;
  tags?: string[];
  data: MonsterData | ItemData | AbilityData | ClassData;
}

interface CreateHomebrewResponse {
  success: true;
  data: {
    homebrew: HomebrewBase;
  };
}
```

##### GET /api/v1/homebrew/:id

Get homebrew by ID.

```typescript
interface GetHomebrewResponse {
  success: true;
  data: {
    homebrew: HomebrewBase;
    currentData: HomebrewData;  // Resolved from current version
    reviews: HomebrewReview[];
    userImported: boolean;      // Has current user imported this
  };
}
```

##### PUT /api/v1/homebrew/:id

Update homebrew (creates new version if published).

```typescript
interface UpdateHomebrewRequest {
  name?: string;
  description?: string;
  tags?: string[];
  data?: Partial<HomebrewData>;
  changelog?: string;           // Required if published
}
```

##### DELETE /api/v1/homebrew/:id

Delete or archive homebrew.

```typescript
interface DeleteHomebrewResponse {
  success: true;
  data: {
    archived: boolean;          // True if had usage, false if fully deleted
  };
}
```

#### Publishing

##### POST /api/v1/homebrew/:id/publish

Publish homebrew to community.

```typescript
interface PublishHomebrewRequest {
  visibility: 'public' | 'unlisted';
}

interface PublishHomebrewResponse {
  success: true;
  data: {
    homebrew: HomebrewBase;
    shareUrl: string;
  };
}
```

##### POST /api/v1/homebrew/:id/unpublish

Remove from community library.

#### Discovery

##### GET /api/v1/homebrew/browse

Browse community homebrew.

```typescript
interface BrowseHomebrewRequest {
  category?: HomebrewCategory;
  tags?: string[];
  search?: string;
  sortBy?: 'rating' | 'popular' | 'newest' | 'updated';
  minRating?: number;
  creatorId?: string;
  limit?: number;
  offset?: number;
}

interface BrowseHomebrewResponse {
  success: true;
  data: {
    homebrew: HomebrewSummary[];
    total: number;
    facets: {
      categories: { category: string; count: number }[];
      tags: { tag: string; count: number }[];
    };
  };
}

interface HomebrewSummary {
  id: string;
  name: string;
  description: string;
  category: HomebrewCategory;
  creatorName: string;
  iconUrl?: string;
  averageRating: number;
  ratingCount: number;
  usageCount: number;
  tags: string[];
  updatedAt: string;
}
```

#### Import/Export

##### POST /api/v1/homebrew/:id/import

Import homebrew to user's library.

```typescript
interface ImportHomebrewRequest {
  version?: string;             // Specific version, or latest
}

interface ImportHomebrewResponse {
  success: true;
  data: {
    imported: ImportedHomebrew;
  };
}
```

##### GET /api/v1/homebrew/:id/export

Export homebrew as JSON.

```typescript
interface ExportHomebrewResponse {
  success: true;
  data: {
    format: 'sparc-homebrew-v1';
    exportedAt: string;
    homebrew: HomebrewBase;
    allVersions: HomebrewVersion[];
  };
}
```

##### GET /api/v1/homebrew/:id/export/pdf

Export formatted PDF stat block.

##### POST /api/v1/homebrew/import

Import from JSON file.

```typescript
interface ImportFromFileRequest {
  file: File;                   // JSON file
  overwrite?: boolean;          // Overwrite if exists
}
```

#### Reviews

##### POST /api/v1/homebrew/:id/reviews

Submit review.

```typescript
interface CreateReviewRequest {
  rating: number;               // 1-5
  review?: string;              // Optional text, max 2000 chars
}
```

##### PUT /api/v1/homebrew/:id/reviews/:reviewId

Update own review.

##### POST /api/v1/homebrew/:id/reviews/:reviewId/respond

Creator responds to review.

```typescript
interface RespondToReviewRequest {
  text: string;                 // Max 1000 chars
}
```

#### Version Control

##### GET /api/v1/homebrew/:id/versions

List all versions.

```typescript
interface ListVersionsResponse {
  success: true;
  data: {
    versions: {
      version: string;
      changelog?: string;
      createdAt: string;
    }[];
  };
}
```

##### POST /api/v1/homebrew/:id/rollback

Rollback to previous version.

```typescript
interface RollbackRequest {
  version: string;
}
```

### Balance Validation

Auto-calculate challenge ratings and flag potential balance issues:

```typescript
interface BalanceCheck {
  homebrewId: string;
  category: HomebrewCategory;
  
  calculatedRating: number;     // CR for monsters, power level for items
  balanceWarnings: BalanceWarning[];
  
  comparable: {                 // Similar official content
    id: string;
    name: string;
    rating: number;
  }[];
}

interface BalanceWarning {
  severity: 'info' | 'warning' | 'error';
  field: string;
  message: string;
  suggestion?: string;
}

// Example warnings:
// { severity: 'warning', field: 'hitPoints', message: 'HP (80) is very high for CR 3. Consider reducing to 45-55.' }
// { severity: 'info', field: 'diceBonus', message: '+3 dice is powerful. Ensure appropriate rarity (Legendary recommended).' }
```

---

## UI/UX Specifications

### Monster Creator

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Create Monster                                               [Preview] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌──────────────────────────┐  ┌──────────────────────────────────────┐ │
│ │                          │  │ SHADOW STALKER                       │ │
│ │                          │  │ Medium undead • CR 4                 │ │
│ │    [Upload Art]          │  │ ─────────────────────────────────── │ │
│ │    or drag & drop        │  │ HP: 32        AC: 14                │ │
│ │                          │  │                                      │ │
│ │                          │  │ MIG: 2  GRA: 4  WIT: 2  HRT: 1      │ │
│ └──────────────────────────┘  │ ─────────────────────────────────── │ │
│                                │ ATTACKS                             │ │
│ Basic Info                     │ • Shadow Claw (Grace) 3d6 necrotic │ │
│ ┌─────────────────────────┐   │                                      │ │
│ │ Name: Shadow Stalker    │   │ ABILITIES                            │ │
│ │ Type: [Undead      ▼]   │   │ • Shadow Step: Teleport to shadows  │ │
│ │ Size: [Medium      ▼]   │   │   (2 round cooldown)                │ │
│ └─────────────────────────┘   │ ─────────────────────────────────── │ │
│                                │ TACTICS                             │ │
│ Stats                          │ Strikes from darkness, retreats    │ │
│ ┌─────────────────────────┐   │ when exposed to light.              │ │
│ │ Hit Points: [32    ]    │   └──────────────────────────────────────┘ │
│ │ Armor Class: [14   ]    │                                         │
│ │                         │   ⚠️ Balance Check                       │
│ │ Might:  [2] ━━●━━━━━   │   ┌──────────────────────────────────────┐ │
│ │ Grace:  [4] ━━━━━━●━   │   │ ✅ Stats look balanced for CR 4      │ │
│ │ Wit:    [2] ━━●━━━━━   │   │ ℹ️ Shadow Step is similar to         │ │
│ │ Heart:  [1] ●━━━━━━━   │   │   official "Blink Dog" ability       │ │
│ └─────────────────────────┘   └──────────────────────────────────────┘ │
│                                                                         │
│ Attacks                        [+ Add Attack]                          │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ Name: [Shadow Claw        ]  Attribute: [Grace ▼]  Dice: [3]    │   │
│ │ Damage Type: [Necrotic ▼]    Description: [Slashing shadow...]  │   │
│ └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│ Abilities                      [+ Add Ability]                         │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ Name: [Shadow Step          ]  Cooldown: [2] rounds              │   │
│ │ Description: [Teleport to any shadow within 30 feet...]         │   │
│ └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│ Lore & Tactics                                                         │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ Tactics: [Strikes from darkness, retreats when exposed...]      │   │
│ │ Lore: [Born from the souls of those who died in darkness...]    │   │
│ │ Habitat: [Dark caves, abandoned buildings, shadow realms]       │   │
│ └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│ Tags: [undead] [shadow] [stealth] [+]                                  │
│                                                                         │
│           [Save Draft]    [Preview in Combat]    [Publish]             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Item Creator

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Create Item                                                  [Preview] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌────────┐  Basic Info                                                 │
│ │  🗡️   │  Name: [Frostbrand Dagger            ]                      │
│ │        │  Type: [Weapon    ▼]    Rarity: [Rare       ▼]             │
│ │[Change]│                                                             │
│ └────────┘  Weapon Type: [Dagger ▼]    Damage: [Ice ▼]                │
│                                                                         │
│ Stats                                                                   │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ Dice Bonus: [+1]    (Extra dice on attacks)                      │   │
│ │                                                                   │   │
│ │ Stat Modifiers:                                                   │   │
│ │ • Grace: [+1]    [×]                                             │   │
│ │ [+ Add Modifier]                                                  │   │
│ └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│ Special Effects                                                         │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ Effect: [Frostbite                                ]               │   │
│ │ Trigger: [On Critical Hit ▼]                                     │   │
│ │ Description: [Target is slowed for 2 rounds, -1 Grace]           │   │
│ │ [× Remove]                                                        │   │
│ │                                                                   │   │
│ │ [+ Add Special Effect]                                            │   │
│ └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│ Flavor                                                                  │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ Flavor Text: [A blade of eternal ice, forged in the heart of    │   │
│ │              the Northern Wastes...]                              │   │
│ │                                                                   │   │
│ │ Lore: [Legends say this dagger was wielded by the Ice Queen     │   │
│ │        herself before her defeat...]                              │   │
│ │                                                                   │   │
│ │ Value: [500] gold    Weight: [1] lb                              │   │
│ └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│ Requirements (Optional)                                                 │
│ ┌──────────────────────────────────────────────────────────────────┐   │
│ │ [✓] Attribute Requirement: [Grace ▼] minimum [3]                 │   │
│ │ [ ] Class Requirement: [Select class...]                          │   │
│ └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│           [Save Draft]         [Publish]                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Homebrew Browser

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Community Homebrew                                              🔍      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Filter: [All Types ▼] [All Tags ▼] [Rating: Any ▼] [Sort: Popular ▼]  │
│                                                                         │
│ ┌──────────────────────────────────────┐ ┌──────────────────────────────┐
│ │ 🐉 Elder Shadow Dragon               │ │ 🗡️ Blade of the Phoenix      │
│ │ Monster • Legendary                  │ │ Item • Epic Weapon           │
│ │ by DragonMaster42                    │ │ by ForgeKnight               │
│ │ ★★★★★ (4.9) • 1.2k uses             │ │ ★★★★☆ (4.2) • 890 uses       │
│ │ #dragon #boss #epic                  │ │ #fire #sword #legendary      │
│ │                       [Import] [♡]   │ │                    [Import]  │
│ └──────────────────────────────────────┘ └──────────────────────────────┘
│                                                                         │
│ ┌──────────────────────────────────────┐ ┌──────────────────────────────┐
│ │ ✨ Time Stop                         │ │ 🧙 Chronomancer              │
│ │ Spell • Legendary                    │ │ Class Template               │
│ │ by WizardSupreme                     │ │ by TimeWeaver                │
│ │ ★★★★☆ (4.4) • 567 uses              │ │ ★★★★★ (4.8) • 423 uses       │
│ │ #time #utility #powerful             │ │ #time #wizard #support       │
│ │                       [Import] [♡]   │ │                    [Import]  │
│ └──────────────────────────────────────┘ └──────────────────────────────┘
│                                                                         │
│ ┌──────────────────────────────────────┐ ┌──────────────────────────────┐
│ │ 🧟 Plague Zombie Horde               │ │ 🛡️ Aegis of the Fallen       │
│ │ Monster • Common                     │ │ Item • Rare Shield           │
│ │ by UndeadArmy                        │ │ by ShieldMaiden              │
│ │ ★★★☆☆ (3.5) • 2.1k uses             │ │ ★★★★☆ (4.1) • 334 uses       │
│ │ #undead #swarm #minion               │ │ #shield #protection #tank    │
│ │                       [Import] [♡]   │ │                    [Import]  │
│ └──────────────────────────────────────┘ └──────────────────────────────┘
│                                                                         │
│ [Load More...]                                                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Version History

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Version History: Shadow Stalker                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ● v1.2.0 (Current)                               Jan 28, 2025          │
│   ├─ Reduced HP from 40 to 32 based on feedback                        │
│   ├─ Shadow Step cooldown increased to 2 rounds                        │
│   └─ Added weakness to radiant damage                                  │
│                                                                         │
│ ○ v1.1.0                                         Jan 20, 2025          │
│   ├─ Added Shadow Step ability                                         │
│   └─ Updated artwork                            [View] [Rollback]      │
│                                                                         │
│ ○ v1.0.0                                         Jan 15, 2025          │
│   └─ Initial release                            [View] [Rollback]      │
│                                                                         │
│ [Compare Versions ▼]                                                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Export Formats

### JSON Format (SPARC Homebrew v1)

```json
{
  "format": "sparc-homebrew-v1",
  "exportedAt": "2025-01-29T12:00:00Z",
  "homebrew": {
    "id": "hb_abc123",
    "category": "monster",
    "name": "Shadow Stalker",
    "description": "A creature of pure darkness...",
    "tags": ["undead", "shadow", "stealth"],
    "currentVersion": "1.2.0",
    "data": {
      "hitPoints": 32,
      "armorClass": 14,
      "might": 2,
      "grace": 4,
      "wit": 2,
      "heart": 1,
      "type": "undead",
      "size": "medium",
      "attacks": [...],
      "abilities": [...]
    }
  }
}
```

### PDF Stat Block

Generates formatted stat blocks matching official SPARC style for printing or sharing.

---

## Testing Requirements

### Unit Tests

```typescript
describe('HomebrewValidation', () => {
  it('should calculate monster CR correctly', () => {
    const monster = createTestMonster({ hp: 32, ac: 14, attacks: [...] });
    const cr = calculateChallengeRating(monster);
    expect(cr).toBe(4);
  });
  
  it('should flag overpowered items', () => {
    const item = createTestItem({ diceBonus: 5, rarity: 'common' });
    const warnings = validateItemBalance(item);
    expect(warnings).toContainEqual(
      expect.objectContaining({ severity: 'error' })
    );
  });
  
  it('should validate class stat distribution', () => {
    const classData = { might: 3, grace: 3, wit: 3, heart: 3 };  // 12 total
    const result = validateClassStats(classData);
    expect(result.valid).toBe(false);  // Max 10 total
  });
});
```

### Integration Tests

- Homebrew CRUD operations
- Version creation on publish updates
- Import/export round-trip
- Rating and review aggregation

### E2E Tests

- Create monster, use in combat node, play session
- Import community homebrew, verify in library
- Publish, update, verify users see new version

---

## Performance Requirements

| Operation | Target |
|-----------|--------|
| Browse page load | <500ms |
| Search results | <200ms |
| Import homebrew | <300ms |
| Export JSON | <100ms |
| Export PDF | <2s |
| Balance check | <500ms |

---

## Security Considerations

- Rate limit homebrew creation (20/day per user)
- Sanitize all text input (XSS prevention)
- Validate uploaded images (type, size, content)
- Review queue for reported content
- Creator verification for featured content

---

## Implementation Phases

### Phase 1: Core CRUD (Days 1-2)
- Data models and database schema
- Basic CRUD endpoints
- Monster and item creators

### Phase 2: Abilities & Classes (Day 3)
- Ability/spell creator
- Class template creator
- Balance validation system

### Phase 3: Publishing & Discovery (Day 4)
- Publishing workflow
- Browse and search functionality
- Import to user library

### Phase 4: Community Features (Day 5)
- Ratings and reviews
- Version control system
- Creator responses

### Phase 5: Import/Export & Polish (Day 6)
- JSON import/export
- PDF generation
- Testing and bug fixes

---

## Future Enhancements

- **AI Balance Assistant**: AI suggestions for balanced stats
- **Homebrew Bundles**: Group related homebrew together
- **Collaboration**: Multiple creators on one homebrew
- **Remix System**: Fork and modify published homebrew
- **Official Curation**: SPARC-verified homebrew badge

---

*PRD 25 - Homebrew System*  
*Version 1.0 | January 2025*
