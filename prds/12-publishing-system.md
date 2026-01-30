# PRD 12: Publishing System

> **Status**: Ready for Implementation  
> **Priority**: P2 - Medium  
> **Estimated Effort**: 3 days  
> **Dependencies**: 11-validation-system

---

## Overview

The Publishing System allows Seers to share their adventures with the SPARC community. It handles the transition from draft to published state, manages visibility settings, and provides the community library for discovering adventures.

### Goals
- Enable seamless publishing of validated adventures
- Provide community library for discovering content
- Support adventure versioning
- Enable ratings and feedback

### Non-Goals
- Monetization/paid adventures
- Adventure moderation workflow (MVP)
- Collaborative adventure editing

---

## User Stories

### US-01: Publish Adventure
**As a** Seer  
**I want to** publish my adventure  
**So that** others can play it

**Acceptance Criteria:**
- [ ] Validation must pass before publishing
- [ ] Set visibility (public/unlisted/private)
- [ ] Add tags and metadata
- [ ] Generate shareable link
- [ ] Adventure appears in library (if public)

### US-02: Browse Library
**As a** player  
**I want to** browse available adventures  
**So that** I can find games to play

**Acceptance Criteria:**
- [ ] See list of public adventures
- [ ] Filter by difficulty, duration, tags
- [ ] Search by title/description
- [ ] Sort by rating, popularity, newest
- [ ] See adventure preview/stats

### US-03: Rate Adventure
**As a** player who completed an adventure  
**I want to** rate and review it  
**So that** others know what to expect

**Acceptance Criteria:**
- [ ] Rate 1-5 stars
- [ ] Optional written review
- [ ] Can only rate after completing
- [ ] Can update existing rating
- [ ] Ratings visible on adventure page

### US-04: Version Control
**As a** Seer  
**I want to** update my published adventure  
**So that** I can fix issues and add content

**Acceptance Criteria:**
- [ ] Create new version without affecting active sessions
- [ ] Publish update when ready
- [ ] Changelog for version history
- [ ] Option to roll back to previous version

---

## Technical Specification

### Publishing Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          PUBLISHING FLOW                                 │
└─────────────────────────────────────────────────────────────────────────┘

    DRAFT                    VALIDATING               PUBLISHED
      │                          │                        │
      │    [Publish]             │                        │
      ├─────────────────────────>│                        │
      │                          │                        │
      │                          │ Run validation         │
      │                          │ ─────────────>         │
      │                          │                        │
      │    [Errors]              │                        │
      │<─────────────────────────│                        │
      │                          │                        │
      │                          │ [Pass]                 │
      │                          │───────────────────────>│
      │                          │                        │
      │                          │                        │ In Library
      │                          │                        │ ────────────>
      │                          │                        │
      │                                                   │
      │                     [Unpublish]                   │
      │<──────────────────────────────────────────────────│
```

### Data Models

```typescript
interface PublishedAdventure {
  id: string;
  adventureId: string;           // Source adventure
  authorId: string;
  authorName: string;
  
  // Metadata
  title: string;
  description: string;
  coverImageUrl?: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDurationMinutes: number;
  recommendedPlayers: { min: number; max: number };
  
  // Content (snapshot at publish time)
  contentVersion: number;
  contentHash: string;            // For change detection
  
  // Visibility
  visibility: AdventureVisibility;
  
  // Stats
  playCount: number;
  completionCount: number;
  completionRate: number;
  averageRating: number;
  ratingCount: number;
  
  // Timestamps
  publishedAt: string;
  lastUpdatedAt: string;
  
  // Versions
  currentVersion: string;
  versions: AdventureVersion[];
}

interface AdventureVersion {
  id: string;
  adventureId: string;
  versionNumber: string;          // semver: "1.0.0"
  contentSnapshot: Adventure;     // Full adventure at this version
  changelog?: string;
  publishedAt: string;
}

interface AdventureRating {
  id: string;
  adventureId: string;
  userId: string;
  sessionId: string;              // Which playthrough
  rating: number;                 // 1-5
  review?: string;
  completedAt: string;
  createdAt: string;
  updatedAt?: string;
}

interface AdventureTag {
  id: string;
  name: string;
  slug: string;
  adventureCount: number;
}
```

### API Endpoints

#### POST /api/v1/adventures/:id/publish

Publish an adventure.

```typescript
interface PublishRequest {
  visibility: AdventureVisibility;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface PublishResponse {
  success: true;
  data: {
    publishedAdventure: PublishedAdventure;
    shareUrl: string;
  };
}
```

#### POST /api/v1/adventures/:id/unpublish

Remove from public library.

```typescript
interface UnpublishResponse {
  success: true;
  data: { unpublished: true };
}
```

#### GET /api/v1/library

Browse published adventures.

```typescript
interface LibraryQuery {
  search?: string;
  tags?: string[];
  difficulty?: string;
  minDuration?: number;
  maxDuration?: number;
  minRating?: number;
  sortBy?: 'newest' | 'popular' | 'rating' | 'trending';
  page?: number;
  pageSize?: number;
}

interface LibraryResponse {
  success: true;
  data: PublishedAdventure[];
  meta: {
    pagination: PaginationMeta;
    availableTags: AdventureTag[];
  };
}
```

#### POST /api/v1/adventures/:id/rate

Rate an adventure.

```typescript
interface RateRequest {
  rating: number;                 // 1-5
  review?: string;
  sessionId: string;
}

interface RateResponse {
  success: true;
  data: AdventureRating;
}
```

### Database Schema

```sql
CREATE TABLE published_adventures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adventure_id UUID NOT NULL REFERENCES adventures(id),
  author_id UUID NOT NULL REFERENCES auth.users(id),
  author_name TEXT NOT NULL,
  
  -- Metadata
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  cover_image_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration_minutes INTEGER NOT NULL,
  recommended_players_min INTEGER NOT NULL DEFAULT 1,
  recommended_players_max INTEGER NOT NULL DEFAULT 6,
  
  -- Content
  content_version INTEGER NOT NULL DEFAULT 1,
  content_hash TEXT NOT NULL,
  
  -- Visibility
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'unlisted', 'public')),
  
  -- Stats (updated via triggers)
  play_count INTEGER NOT NULL DEFAULT 0,
  completion_count INTEGER NOT NULL DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT NULL,
  rating_count INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Versioning
  current_version TEXT NOT NULL DEFAULT '1.0.0'
);

CREATE TABLE adventure_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  published_adventure_id UUID NOT NULL REFERENCES published_adventures(id) ON DELETE CASCADE,
  version_number TEXT NOT NULL,
  content_snapshot JSONB NOT NULL,
  changelog TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE (published_adventure_id, version_number)
);

CREATE TABLE adventure_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adventure_id UUID NOT NULL REFERENCES published_adventures(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  session_id UUID NOT NULL REFERENCES sessions(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  
  UNIQUE (adventure_id, user_id)
);

CREATE TABLE adventure_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  adventure_count INTEGER NOT NULL DEFAULT 0
);

-- Indexes
CREATE INDEX idx_published_visibility ON published_adventures(visibility) WHERE visibility = 'public';
CREATE INDEX idx_published_tags ON published_adventures USING GIN(tags);
CREATE INDEX idx_published_rating ON published_adventures(average_rating DESC NULLS LAST);
CREATE INDEX idx_published_popular ON published_adventures(play_count DESC);

-- Update rating stats trigger
CREATE OR REPLACE FUNCTION update_adventure_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE published_adventures
  SET 
    average_rating = (SELECT AVG(rating) FROM adventure_ratings WHERE adventure_id = NEW.adventure_id),
    rating_count = (SELECT COUNT(*) FROM adventure_ratings WHERE adventure_id = NEW.adventure_id)
  WHERE id = NEW.adventure_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_stats
AFTER INSERT OR UPDATE ON adventure_ratings
FOR EACH ROW EXECUTE FUNCTION update_adventure_rating_stats();
```

### Publishing Service

```typescript
class PublishingService {
  async publish(adventureId: string, options: PublishRequest): Promise<PublishedAdventure> {
    // 1. Validate adventure
    const adventure = await this.adventureRepo.findById(adventureId);
    const validation = await validateAdventure(adventure);
    
    if (!validation.canPublish) {
      throw new ValidationError('Adventure cannot be published', validation.errors);
    }
    
    // 2. Check if already published
    const existing = await this.publishedRepo.findByAdventureId(adventureId);
    
    if (existing) {
      // Update existing publication
      return this.updatePublication(existing, adventure, options);
    }
    
    // 3. Create snapshot
    const contentHash = hashAdventureContent(adventure);
    
    // 4. Create published record
    const published = await this.publishedRepo.create({
      adventureId,
      authorId: adventure.authorId,
      authorName: await this.getUserName(adventure.authorId),
      title: adventure.title,
      description: adventure.description,
      coverImageUrl: adventure.coverImageUrl,
      tags: options.tags,
      difficulty: options.difficulty,
      estimatedDurationMinutes: validation.stats.estimatedDurationMinutes,
      visibility: options.visibility,
      contentVersion: 1,
      contentHash,
      currentVersion: '1.0.0',
    });
    
    // 5. Create initial version
    await this.createVersion(published.id, adventure, '1.0.0');
    
    // 6. Update tag counts
    await this.updateTagCounts(options.tags);
    
    return published;
  }
  
  async updatePublication(
    existing: PublishedAdventure,
    adventure: Adventure,
    options: Partial<PublishRequest>
  ): Promise<PublishedAdventure> {
    const contentHash = hashAdventureContent(adventure);
    const contentChanged = contentHash !== existing.contentHash;
    
    let newVersion = existing.currentVersion;
    if (contentChanged) {
      // Increment version
      newVersion = incrementVersion(existing.currentVersion);
      await this.createVersion(existing.id, adventure, newVersion);
    }
    
    return this.publishedRepo.update(existing.id, {
      ...options,
      contentHash: contentChanged ? contentHash : existing.contentHash,
      contentVersion: contentChanged ? existing.contentVersion + 1 : existing.contentVersion,
      currentVersion: newVersion,
      lastUpdatedAt: new Date().toISOString(),
    });
  }
  
  async unpublish(adventureId: string): Promise<void> {
    const published = await this.publishedRepo.findByAdventureId(adventureId);
    if (!published) throw new NotFoundError('Published adventure not found');
    
    await this.publishedRepo.update(published.id, {
      visibility: 'private',
    });
  }
}

function hashAdventureContent(adventure: Adventure): string {
  const content = JSON.stringify({
    nodes: adventure.nodes,
    connections: adventure.connections,
    startNodeId: adventure.startNodeId,
  });
  return createHash('sha256').update(content).digest('hex').substring(0, 16);
}

function incrementVersion(version: string): string {
  const [major, minor, patch] = version.split('.').map(Number);
  return `${major}.${minor}.${patch + 1}`;
}
```

### Library Component

```typescript
function AdventureLibrary() {
  const [filters, setFilters] = useState<LibraryFilters>({});
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  
  const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery(
    ['library', filters, sortBy],
    ({ pageParam = 1 }) => fetchLibrary({ ...filters, sortBy, page: pageParam }),
    { getNextPageParam: (last) => last.meta.pagination.hasNext ? last.meta.pagination.page + 1 : undefined }
  );
  
  return (
    <div className="adventure-library">
      <LibraryHeader>
        <SearchInput 
          value={filters.search}
          onChange={(search) => setFilters({ ...filters, search })}
        />
        <SortDropdown value={sortBy} onChange={setSortBy} />
      </LibraryHeader>
      
      <div className="library-layout">
        <LibraryFilters filters={filters} onChange={setFilters} />
        
        <div className="library-results">
          {isLoading ? (
            <LoadingGrid />
          ) : (
            <InfiniteScroll
              hasMore={hasNextPage}
              loadMore={fetchNextPage}
            >
              <div className="adventure-grid">
                {data?.pages.flatMap(page => page.data).map(adventure => (
                  <AdventureCard key={adventure.id} adventure={adventure} />
                ))}
              </div>
            </InfiniteScroll>
          )}
        </div>
      </div>
    </div>
  );
}

function AdventureCard({ adventure }: { adventure: PublishedAdventure }) {
  return (
    <Link to={`/adventures/${adventure.id}`} className="adventure-card">
      <div className="card-image">
        {adventure.coverImageUrl ? (
          <img src={adventure.coverImageUrl} alt={adventure.title} />
        ) : (
          <DefaultCover difficulty={adventure.difficulty} />
        )}
        <DifficultyBadge difficulty={adventure.difficulty} />
      </div>
      
      <div className="card-content">
        <h3>{adventure.title}</h3>
        <p className="author">by {adventure.authorName}</p>
        <p className="description">{truncate(adventure.description, 100)}</p>
        
        <div className="card-meta">
          <span className="duration">
            <ClockIcon /> {adventure.estimatedDurationMinutes} min
          </span>
          <span className="players">
            <UsersIcon /> {adventure.recommendedPlayers.min}-{adventure.recommendedPlayers.max}
          </span>
        </div>
        
        <div className="card-stats">
          <RatingDisplay rating={adventure.averageRating} count={adventure.ratingCount} />
          <span className="plays">{adventure.playCount} plays</span>
        </div>
        
        <div className="card-tags">
          {adventure.tags.slice(0, 3).map(tag => (
            <TagBadge key={tag}>{tag}</TagBadge>
          ))}
        </div>
      </div>
    </Link>
  );
}
```

---

## Testing

```typescript
describe('Publishing System', () => {
  describe('publish', () => {
    it('should publish valid adventure', async () => {
      const adventure = await createValidAdventure();
      
      const published = await publishingService.publish(adventure.id, {
        visibility: 'public',
        tags: ['fantasy', 'beginner'],
        difficulty: 'beginner',
      });
      
      expect(published.visibility).toBe('public');
      expect(published.currentVersion).toBe('1.0.0');
    });
    
    it('should reject invalid adventure', async () => {
      const adventure = await createInvalidAdventure(); // No victory node
      
      await expect(
        publishingService.publish(adventure.id, publishOptions)
      ).rejects.toThrow('cannot be published');
    });
    
    it('should increment version on content change', async () => {
      const adventure = await createPublishedAdventure('1.0.0');
      
      // Modify adventure
      await addNodeToAdventure(adventure.id);
      
      const updated = await publishingService.publish(adventure.id, publishOptions);
      
      expect(updated.currentVersion).toBe('1.0.1');
    });
  });
  
  describe('library', () => {
    it('should return only public adventures', async () => {
      await createPublishedAdventure({ visibility: 'public' });
      await createPublishedAdventure({ visibility: 'private' });
      
      const library = await libraryService.browse({});
      
      expect(library.data).toHaveLength(1);
      expect(library.data[0].visibility).toBe('public');
    });
    
    it('should filter by tags', async () => {
      await createPublishedAdventure({ tags: ['fantasy'] });
      await createPublishedAdventure({ tags: ['scifi'] });
      
      const library = await libraryService.browse({ tags: ['fantasy'] });
      
      expect(library.data).toHaveLength(1);
      expect(library.data[0].tags).toContain('fantasy');
    });
  });
});
```

---

## Appendix

### Suggested Tags

| Category | Tags |
|----------|------|
| Theme | fantasy, horror, mystery, comedy, scifi |
| Tone | serious, lighthearted, dark, epic |
| Focus | combat-heavy, story-heavy, puzzle-focused |
| Setting | dungeon, wilderness, urban, underwater |
