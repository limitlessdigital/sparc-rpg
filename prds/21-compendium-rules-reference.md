# PRD 21: Compendium & Rules Reference

> **Status**: Ready for Implementation  
> **Priority**: P2 - Medium  
> **Estimated Effort**: 4 days  
> **Dependencies**: 17-database-schema, 18-authentication, 19-design-system

---

## Overview

The Compendium is SPARC RPG's comprehensive rules database, providing searchable access to all game content including rules, items, monsters, abilities, and classes. It serves as both a learning resource for new players and a quick reference during gameplay.

### Goals
- Provide instant access to any game rule or content
- Enable context-sensitive help during active sessions
- Support offline access for areas with poor connectivity
- Reduce game interruptions for rule lookups
- Help new players learn through discovery

### Non-Goals
- Community-created homebrew content (future consideration)
- Full rulebook replacement (supplements physical materials)
- Video tutorials (separate system)
- Adventure spoilers or walkthroughs

---

## User Stories

### US-01: Search Rules Database
**As a** player  
**I want to** search for rules and content  
**So that** I can quickly find information I need

**Acceptance Criteria:**
- [ ] Full-text search across all compendium content
- [ ] Results ranked by relevance
- [ ] Search as you type with debounced queries (300ms)
- [ ] Recent searches saved locally (last 10)
- [ ] Search suggestions based on popular queries
- [ ] Results display <500ms for common queries

### US-02: Browse Categories
**As a** player  
**I want to** browse content by category  
**So that** I can explore related content

**Acceptance Criteria:**
- [ ] Categories: Rules, Classes, Abilities, Items, Monsters, Conditions
- [ ] Subcategories where appropriate (e.g., Items → Weapons, Armor, Consumables)
- [ ] Alphabetical sorting within categories
- [ ] Item count per category displayed
- [ ] Breadcrumb navigation for deep browsing

### US-03: Hover Tooltips
**As a** player  
**I want to** see tooltips when hovering over game terms  
**So that** I can understand references without leaving context

**Acceptance Criteria:**
- [ ] Hover over item/monster/ability names shows tooltip
- [ ] Tooltip displays: name, type, brief description, key stats
- [ ] Tooltip appears after 500ms hover delay
- [ ] Tooltip stays visible while cursor is over it
- [ ] Works in chat, character sheets, adventure text
- [ ] Mobile: tap-and-hold triggers tooltip

### US-04: Quick Reference Cards
**As a** player  
**I want to** view condensed reference cards  
**So that** I can quickly check key information

**Acceptance Criteria:**
- [ ] Each entry has a "card view" with essential info only
- [ ] Cards fit on single screen (no scrolling needed)
- [ ] Cards optimized for printing (optional print view)
- [ ] Cards can be pinned during session (max 3)
- [ ] Pinned cards accessible via hotkey or floating button

### US-05: Bookmarks & Favorites
**As a** player  
**I want to** save frequently used entries  
**So that** I can quickly access them later

**Acceptance Criteria:**
- [ ] Star/bookmark button on every entry
- [ ] Favorites synced to user account
- [ ] Favorites accessible from dedicated section
- [ ] Can organize favorites into folders
- [ ] Quick access to favorites from search bar
- [ ] Maximum 100 bookmarks per user

### US-06: Offline Access
**As a** player  
**I want to** access rules without internet  
**So that** I can play in areas with poor connectivity

**Acceptance Criteria:**
- [ ] Core rules downloadable for offline use
- [ ] Download size indicator before download (~5MB)
- [ ] Automatic sync when back online
- [ ] Clear cache option in settings
- [ ] Offline indicator in UI
- [ ] Service worker handles offline requests

### US-07: Context-Sensitive Help
**As a** player  
**I want to** see relevant help during gameplay  
**So that** I understand what's happening

**Acceptance Criteria:**
- [ ] Help icon (?) appears next to game UI elements
- [ ] Clicking help shows relevant compendium entry
- [ ] During combat: show combat rules, ability descriptions
- [ ] During character creation: show class/attribute details
- [ ] During dice rolls: show roll mechanics explanation
- [ ] Help can be dismissed or expanded to full entry

### US-08: Version History
**As a** player  
**I want to** see when rules were last updated  
**So that** I know I'm using current information

**Acceptance Criteria:**
- [ ] Last updated date shown on entries
- [ ] Change log for entries with significant updates
- [ ] "New" badge for recently added content (7 days)
- [ ] "Updated" badge for recently changed content (7 days)

---

## User Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          COMPENDIUM FLOW                                │
└─────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────┐
  │ Player opens    │
  │ Compendium      │
  └────────┬────────┘
           │
           ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │ COMPENDIUM                                      [⭐ Favorites]  │
  │                                                                 │
  │ ┌───────────────────────────────────────────────────────────┐  │
  │ │ 🔍 Search rules, items, monsters...                       │  │
  │ └───────────────────────────────────────────────────────────┘  │
  │                                                                 │
  │ CATEGORIES                                                      │
  │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
  │ │ 📖      │ │ ⚔️      │ │ 🎭      │ │ 📦      │ │ 👹      │   │
  │ │ Rules   │ │ Classes │ │Abilities│ │ Items   │ │Monsters │   │
  │ │  (24)   │ │   (7)   │ │  (35)   │ │  (48)   │ │  (62)   │   │
  │ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
  │                                                                 │
  │ RECENTLY VIEWED                                                 │
  │ ┌─────────────────────────────────────────────────────────────┐│
  │ │ Heroic Save • Warrior Class • Healing Potion               ││
  │ └─────────────────────────────────────────────────────────────┘│
  └─────────────────────────────────────────────────────────────────┘
           │
           │ Click category or search
           ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │ ITEMS > WEAPONS                                        [← Back] │
  │                                                                 │
  │ ┌─────────────────────────────────────────────────────────────┐│
  │ │ 🗡️ Longsword                                          [⭐] ││
  │ │ Melee Weapon • 1d6 damage                                   ││
  │ ├─────────────────────────────────────────────────────────────┤│
  │ │ 🏹 Shortbow                                            [⭐] ││
  │ │ Ranged Weapon • 1d6 damage • Range: 60ft                    ││
  │ ├─────────────────────────────────────────────────────────────┤│
  │ │ 🪄 Staff                                               [⭐] ││
  │ │ Melee Weapon • 1d4 damage • Arcane Focus                    ││
  │ └─────────────────────────────────────────────────────────────┘│
  └─────────────────────────────────────────────────────────────────┘
           │
           │ Click entry
           ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │ LONGSWORD                                   [⭐] [📌 Pin] [✕]  │
  │                                                                 │
  │  Type: Melee Weapon                                            │
  │  Damage: 1d6                                                   │
  │  Properties: Versatile                                          │
  │                                                                 │
  │  ─────────────────────────────────────────────────────────────  │
  │                                                                 │
  │  A standard one-handed sword favored by Warriors and Paladins. │
  │  Can be wielded with two hands for +1 damage.                  │
  │                                                                 │
  │  RELATED                                                        │
  │  • Warrior Class                                                │
  │  • Paladin Class                                                │
  │  • Combat Rules                                                 │
  │                                                                 │
  │  Updated: 2024-01-15                                            │
  └─────────────────────────────────────────────────────────────────┘
```

---

## Technical Specification

### Data Models

```typescript
// Compendium Entry
interface CompendiumEntry {
  id: string;
  slug: string;                    // URL-friendly identifier
  title: string;
  type: CompendiumType;
  category: string;
  subcategory?: string;
  summary: string;                 // Brief description (max 200 chars)
  content: string;                 // Full content (Markdown)
  stats?: Record<string, any>;     // Type-specific stats
  tags: string[];                  // For search
  relatedEntries: string[];        // IDs of related entries
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

type CompendiumType = 
  | 'rule'
  | 'class'
  | 'ability'
  | 'item'
  | 'monster'
  | 'condition';

// Item-specific stats
interface ItemStats {
  itemType: 'weapon' | 'armor' | 'consumable' | 'misc';
  damage?: string;
  defense?: number;
  range?: string;
  properties: string[];
  weight?: number;
  value?: number;
}

// Monster-specific stats
interface MonsterStats {
  hitPoints: number;
  might: number;
  grace: number;
  wit: number;
  heart: number;
  abilities: string[];
  challenge: 'minion' | 'standard' | 'elite' | 'boss';
  loot?: string[];
}

// Class-specific stats
interface ClassStats {
  primaryAttribute: Attribute;
  hitPoints: number;
  specialAbility: string;
  startingEquipment: string[];
  description: string;
}

// User bookmark
interface Bookmark {
  id: string;
  userId: string;
  entryId: string;
  folderId?: string;
  createdAt: string;
}

// Bookmark folder
interface BookmarkFolder {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
}

// Search result
interface SearchResult {
  entry: CompendiumEntry;
  score: number;
  highlights: {
    field: string;
    snippet: string;
  }[];
}

// Tooltip data (minimal for fast loading)
interface TooltipData {
  id: string;
  title: string;
  type: CompendiumType;
  summary: string;
  keyStats: Record<string, string>;
}
```

### Database Schema

```sql
-- Compendium entries table
CREATE TABLE compendium_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  type VARCHAR(50) NOT NULL,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  summary VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  stats JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  related_entries UUID[] DEFAULT '{}',
  image_url TEXT,
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER DEFAULT 1
);

-- Full-text search index
CREATE INDEX idx_compendium_search ON compendium_entries USING GIN(search_vector);
CREATE INDEX idx_compendium_type ON compendium_entries(type);
CREATE INDEX idx_compendium_category ON compendium_entries(category);
CREATE INDEX idx_compendium_tags ON compendium_entries USING GIN(tags);

-- Trigger to update search vector
CREATE OR REPLACE FUNCTION update_compendium_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector = 
    setweight(to_tsvector('english', NEW.title), 'A') ||
    setweight(to_tsvector('english', NEW.summary), 'B') ||
    setweight(to_tsvector('english', NEW.content), 'C') ||
    setweight(to_tsvector('english', array_to_string(NEW.tags, ' ')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER compendium_search_update
  BEFORE INSERT OR UPDATE ON compendium_entries
  FOR EACH ROW EXECUTE FUNCTION update_compendium_search_vector();

-- User bookmarks table
CREATE TABLE compendium_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_id UUID NOT NULL REFERENCES compendium_entries(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES compendium_bookmark_folders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, entry_id)
);

-- Bookmark folders table
CREATE TABLE compendium_bookmark_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE compendium_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE compendium_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE compendium_bookmark_folders ENABLE ROW LEVEL SECURITY;

-- Anyone can read compendium
CREATE POLICY "Compendium entries are publicly readable"
  ON compendium_entries FOR SELECT
  USING (true);

-- Users manage their own bookmarks
CREATE POLICY "Users can manage their bookmarks"
  ON compendium_bookmarks FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their folders"
  ON compendium_bookmark_folders FOR ALL
  USING (auth.uid() = user_id);
```

### API Endpoints

#### GET /api/v1/compendium/search

**Request:**
```typescript
interface SearchRequest {
  query: string;              // Search query
  type?: CompendiumType;      // Filter by type
  category?: string;          // Filter by category
  limit?: number;             // Max results (default 20)
  offset?: number;            // Pagination offset
}
```

**Response:**
```typescript
interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  suggestions: string[];      // Alternative search suggestions
}
```

#### GET /api/v1/compendium/entries/:id

**Response:**
```typescript
interface EntryResponse {
  entry: CompendiumEntry;
  relatedEntries: CompendiumEntry[];  // Hydrated related entries
}
```

#### GET /api/v1/compendium/tooltip/:id

**Response:**
```typescript
interface TooltipResponse {
  tooltip: TooltipData;
}
```

#### GET /api/v1/compendium/categories

**Response:**
```typescript
interface CategoriesResponse {
  categories: {
    type: CompendiumType;
    name: string;
    count: number;
    subcategories: {
      name: string;
      count: number;
    }[];
  }[];
}
```

#### GET /api/v1/compendium/bookmarks

**Response:**
```typescript
interface BookmarksResponse {
  bookmarks: (Bookmark & { entry: CompendiumEntry })[];
  folders: BookmarkFolder[];
}
```

#### POST /api/v1/compendium/bookmarks

**Request:**
```typescript
interface CreateBookmarkRequest {
  entryId: string;
  folderId?: string;
}
```

#### DELETE /api/v1/compendium/bookmarks/:entryId

Removes a bookmark.

#### GET /api/v1/compendium/offline-bundle

**Response:**
Returns a compressed JSON bundle of all compendium data for offline storage.

```typescript
interface OfflineBundleResponse {
  version: string;
  bundleUrl: string;           // URL to download bundle
  size: number;                // Size in bytes
  checksum: string;            // MD5 for integrity check
  generatedAt: string;
}
```

---

## Component Architecture

### React Components

```typescript
// Compendium page
<CompendiumPage>
  <CompendiumSearch onSearch={handleSearch} />
  <CompendiumCategories categories={categories} onSelect={handleCategorySelect} />
  <CompendiumResults results={results} onEntryClick={handleEntryClick} />
  <CompendiumEntryModal entry={selectedEntry} onClose={handleClose} />
</CompendiumPage>

// Tooltip component (used throughout app)
<CompendiumTooltip entryId={entryId}>
  <span className="compendium-link">Longsword</span>
</CompendiumTooltip>

// Context-sensitive help
<ContextHelp entryId="dice-rolling-rules" placement="bottom">
  <DiceRollButton />
</ContextHelp>

// Quick reference card
<QuickReferenceCard 
  entry={entry} 
  pinned={isPinned}
  onPin={handlePin}
/>

// Offline indicator
<OfflineIndicator 
  isOffline={isOffline}
  lastSynced={lastSynced}
/>
```

### State Management

```typescript
interface CompendiumState {
  // Search
  searchQuery: string;
  searchResults: SearchResult[];
  isSearching: boolean;
  
  // Navigation
  currentCategory: string | null;
  currentSubcategory: string | null;
  categoryEntries: CompendiumEntry[];
  
  // Selected entry
  selectedEntry: CompendiumEntry | null;
  
  // Bookmarks
  bookmarks: Bookmark[];
  folders: BookmarkFolder[];
  
  // Offline
  offlineAvailable: boolean;
  lastSynced: string | null;
  
  // UI
  pinnedCards: CompendiumEntry[];  // Max 3
  recentlyViewed: string[];        // Entry IDs, max 10
}
```

---

## Offline Architecture

### Service Worker Strategy

```typescript
// Cache strategies
const CACHE_NAME = 'sparc-compendium-v1';

// Cache compendium bundle on demand
async function cacheCompendiumBundle(bundleUrl: string) {
  const cache = await caches.open(CACHE_NAME);
  const response = await fetch(bundleUrl);
  await cache.put('/api/v1/compendium/offline', response);
}

// Serve from cache when offline
async function handleCompendiumRequest(request: Request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    // Offline - serve from cache
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match('/api/v1/compendium/offline');
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}
```

### IndexedDB Storage

```typescript
// Store compendium data in IndexedDB for fast offline access
interface CompendiumDB {
  entries: CompendiumEntry[];
  version: string;
  lastSynced: string;
}

async function storeOfflineData(data: CompendiumDB) {
  const db = await openDB('sparc-compendium', 1);
  await db.put('compendium', data, 'offline-data');
}

async function getOfflineData(): Promise<CompendiumDB | null> {
  const db = await openDB('sparc-compendium', 1);
  return db.get('compendium', 'offline-data');
}
```

---

## Tooltip System

### Implementation

```typescript
// Detect compendium links in text
const COMPENDIUM_LINK_REGEX = /\[\[(\w+):([^\]]+)\]\]/g;
// Example: [[item:Longsword]] or [[monster:Goblin]]

// Process text to add tooltips
function processCompendiumLinks(text: string): ReactNode {
  const parts = [];
  let lastIndex = 0;
  let match;
  
  while ((match = COMPENDIUM_LINK_REGEX.exec(text)) !== null) {
    // Add text before match
    parts.push(text.slice(lastIndex, match.index));
    
    // Add tooltip component
    const [, type, name] = match;
    parts.push(
      <CompendiumTooltip key={match.index} type={type} name={name}>
        {name}
      </CompendiumTooltip>
    );
    
    lastIndex = match.index + match[0].length;
  }
  
  parts.push(text.slice(lastIndex));
  return parts;
}

// Tooltip fetch with caching
const tooltipCache = new Map<string, TooltipData>();

async function fetchTooltip(entryId: string): Promise<TooltipData> {
  if (tooltipCache.has(entryId)) {
    return tooltipCache.get(entryId)!;
  }
  
  const response = await fetch(`/api/v1/compendium/tooltip/${entryId}`);
  const data = await response.json();
  
  tooltipCache.set(entryId, data.tooltip);
  return data.tooltip;
}
```

---

## Performance Considerations

### Search Optimization
- Use PostgreSQL full-text search with weighted vectors
- Cache popular queries in Redis (5 minute TTL)
- Implement typeahead suggestions from pre-computed list
- Debounce search input (300ms)

### Tooltip Performance
- Prefetch tooltips for visible links
- Cache tooltips in memory (client-side)
- Use lightweight tooltip endpoint (minimal data)
- Lazy load full entry only when clicked

### Offline Bundle
- Generate bundle nightly via scheduled job
- Use compression (gzip) to minimize size
- Include version hash for cache invalidation
- Delta updates for subsequent syncs (future)

---

## Content Management

### Initial Data Population
- Import from SPARC-MASTER.md
- Generate entries for all classes, items, monsters
- Create rule entries for each game mechanic
- Tag and categorize all entries

### Update Process
1. Content team updates entries via admin panel
2. Changes automatically update search vectors
3. Version number increments
4. Offline bundle regenerates nightly
5. Clients check for updates on app launch

---

## Testing Requirements

### Unit Tests
- Search ranking algorithm
- Tooltip data extraction
- Offline data serialization
- Bookmark CRUD operations

### Integration Tests
- Full-text search accuracy
- Bookmark sync across devices
- Offline mode fallback
- Tooltip hover behavior

### E2E Tests
- Complete search flow
- Browse → select → bookmark flow
- Offline mode activation
- Context help in session

### Performance Tests
- Search response time (<500ms)
- Tooltip load time (<100ms)
- Offline bundle download time
- Memory usage with large result sets

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Search response time | <500ms P95 |
| Tooltip load time | <100ms P95 |
| Offline bundle size | <10MB |
| Daily active compendium users | 40% of total users |
| Average bookmarks per user | 5+ |
| Context help click rate | 20% of new users |

---

## Future Considerations

- Community-contributed content (homebrew)
- AI-powered search ("What beats a dragon?")
- Voice search integration
- Print-friendly exports
- Integration with character sheet (auto-link abilities)
- Compendium API for third-party tools
