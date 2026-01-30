# PRD 20: Content Management System

> **Status**: Ready for Implementation  
> **Priority**: P1 - High  
> **Estimated Effort**: 10 days  
> **Dependencies**: 12-publishing-system, 17-database-schema, 18-authentication

---

## Overview

The Content Management System (CMS) provides the backend infrastructure for managing adventure content, digital assets, creator tools, and community curation. It extends the Publishing System (PRD 12) with robust asset handling, version control, moderation workflows, discovery features, and localization support.

### Goals
- Reliable asset storage and CDN delivery for images and audio
- Full version history with rollback capability
- Scalable content moderation for community safety
- Intelligent discovery and recommendation systems
- Multi-language support for global reach
- Comprehensive creator analytics and tools

### Non-Goals
- User-generated content beyond adventures (forums, comments)
- Live streaming or video hosting
- Real-time collaborative editing (future consideration)
- Direct file system access (all assets via API)
- Payment processing (handled by separate billing system)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CONTENT MANAGEMENT SYSTEM                             │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────────┐
                              │   Cloudflare     │
                              │   CDN + WAF      │
                              └────────┬─────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         │                             │                             │
         ▼                             ▼                             ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  Asset Service  │         │ Content Service │         │ Search Service  │
│─────────────────│         │─────────────────│         │─────────────────│
│ Upload/Process  │         │ Version Control │         │ Meilisearch     │
│ Optimization    │         │ Draft/Publish   │         │ Indexing        │
│ CDN Integration │         │ Moderation      │         │ Recommendations │
└────────┬────────┘         └────────┬────────┘         └────────┬────────┘
         │                           │                           │
         ▼                           ▼                           ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│ Supabase Storage│         │   PostgreSQL    │         │   Redis Cache   │
│ (S3-compatible) │         │   + Supabase    │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
         │                           │
         └───────────────────────────┘
                     │
              ┌──────┴──────┐
              │ Background  │
              │ Job Queue   │
              │ (BullMQ)    │
              └─────────────┘
```

---

## User Stories

### Asset Management

#### US-01: Upload Image Assets
**As a** Seer creating an adventure  
**I want to** upload images for my nodes  
**So that** my adventure has visual content

**Acceptance Criteria:**
- [ ] Support JPEG, PNG, WebP, GIF formats
- [ ] Max file size: 10MB per image
- [ ] Auto-generate responsive variants (thumbnail, medium, large)
- [ ] Display upload progress indicator
- [ ] Validate image dimensions and content type
- [ ] Store original and optimized versions

#### US-02: Upload Audio Assets
**As a** Seer  
**I want to** add ambient music and sound effects  
**So that** my adventure is more immersive

**Acceptance Criteria:**
- [ ] Support MP3, OGG, WAV formats
- [ ] Max file size: 25MB per audio file
- [ ] Auto-convert to web-friendly format (MP3)
- [ ] Preview audio before saving
- [ ] Normalize audio levels automatically
- [ ] Support looping flag for ambient tracks

#### US-03: Manage Asset Library
**As a** Seer  
**I want to** organize and reuse my uploaded assets  
**So that** I can efficiently build multiple adventures

**Acceptance Criteria:**
- [ ] View all uploaded assets in library
- [ ] Filter by type (image/audio) and tags
- [ ] Search assets by name
- [ ] Delete unused assets
- [ ] See which adventures use each asset
- [ ] Bulk operations (delete, tag)

#### US-04: Use Licensed Assets
**As a** Seer  
**I want to** access shared/licensed asset packs  
**So that** I can enhance my adventure without creating art

**Acceptance Criteria:**
- [ ] Browse available asset packs
- [ ] Preview assets before use
- [ ] One-click add to adventure
- [ ] Attribution displayed automatically
- [ ] License terms clearly shown

### Content Versioning

#### US-05: Save Draft
**As a** Seer  
**I want to** save work-in-progress versions  
**So that** I don't lose my changes

**Acceptance Criteria:**
- [ ] Auto-save every 30 seconds when editing
- [ ] Manual save with keyboard shortcut (Cmd+S)
- [ ] Visual indicator showing save status
- [ ] Conflict detection if editing from multiple tabs
- [ ] Recover from browser crash

#### US-06: View Version History
**As a** Seer  
**I want to** see the history of my adventure changes  
**So that** I can track what changed over time

**Acceptance Criteria:**
- [ ] List all saved versions with timestamps
- [ ] Show who made each change
- [ ] Display brief change summary
- [ ] Paginate for adventures with many versions
- [ ] Filter by date range

#### US-07: Compare Versions
**As a** Seer  
**I want to** compare two versions side-by-side  
**So that** I can see exactly what changed

**Acceptance Criteria:**
- [ ] Visual diff of node changes
- [ ] Highlight added/removed/modified nodes
- [ ] Show connection changes
- [ ] Display property-level diffs
- [ ] Navigation between changes

#### US-08: Rollback Version
**As a** Seer  
**I want to** restore a previous version  
**So that** I can undo unwanted changes

**Acceptance Criteria:**
- [ ] One-click restore to any version
- [ ] Confirmation before rollback
- [ ] Current version preserved (not lost)
- [ ] Restore creates new version entry
- [ ] Notification of successful rollback

### Admin & Moderation

#### US-09: Flag Content
**As a** player  
**I want to** report inappropriate content  
**So that** the community stays safe

**Acceptance Criteria:**
- [ ] Flag button on adventure pages
- [ ] Select reason from predefined list
- [ ] Optional additional details
- [ ] Confirmation that report was submitted
- [ ] Anonymous reporting option

#### US-10: Review Flagged Content
**As a** moderator  
**I want to** review flagged adventures  
**So that** I can take appropriate action

**Acceptance Criteria:**
- [ ] Queue of flagged content
- [ ] See flag reason and reporter info
- [ ] View adventure content
- [ ] Actions: approve, warn, restrict, remove
- [ ] Notify creator of decision
- [ ] Record decision with notes

#### US-11: Verify Creator
**As a** moderator  
**I want to** verify creator identities  
**So that** featured creators are trustworthy

**Acceptance Criteria:**
- [ ] Verification request workflow
- [ ] Review creator's portfolio
- [ ] Approve/deny with reason
- [ ] Verified badge on profile
- [ ] Revoke verification if needed

### Curation & Discovery

#### US-12: Feature Adventures
**As an** editor  
**I want to** curate featured adventures  
**So that** quality content gets visibility

**Acceptance Criteria:**
- [ ] Add/remove from featured list
- [ ] Set feature duration
- [ ] Order/prioritize features
- [ ] Schedule future features
- [ ] Different feature categories (staff picks, new, trending)

#### US-13: Search Adventures
**As a** player  
**I want to** search for adventures by keyword  
**So that** I can find specific content

**Acceptance Criteria:**
- [ ] Full-text search on title/description
- [ ] Search as you type (debounced)
- [ ] Highlight matching terms
- [ ] Recent searches remembered
- [ ] Suggested searches

#### US-14: Get Recommendations
**As a** player  
**I want to** get personalized recommendations  
**So that** I discover adventures I'll enjoy

**Acceptance Criteria:**
- [ ] Based on play history
- [ ] Similar to adventures I liked
- [ ] "Players also played" suggestions
- [ ] New creator spotlight
- [ ] Refresh recommendations on demand

### Localization

#### US-15: Create Localized Content
**As a** Seer  
**I want to** create translations of my adventure  
**So that** non-English speakers can enjoy it

**Acceptance Criteria:**
- [ ] Add language variant
- [ ] Translate node content
- [ ] Preview in target language
- [ ] Mark translation completeness
- [ ] Publish per-language

#### US-16: Play in My Language
**As a** player  
**I want to** play adventures in my language  
**So that** I understand the content

**Acceptance Criteria:**
- [ ] Language preference in settings
- [ ] Filter library by language
- [ ] Show available languages per adventure
- [ ] Graceful fallback to primary language
- [ ] RTL layout support for Arabic/Hebrew

### Creator Tools & Analytics

#### US-17: View Play Statistics
**As a** Seer  
**I want to** see how my adventure performs  
**So that** I can improve it

**Acceptance Criteria:**
- [ ] Total plays and unique players
- [ ] Completion rate
- [ ] Average session duration
- [ ] Drop-off points (which nodes)
- [ ] Daily/weekly/monthly trends
- [ ] Export data as CSV

#### US-18: See Player Feedback
**As a** Seer  
**I want to** see player ratings and reviews  
**So that** I understand player sentiment

**Acceptance Criteria:**
- [ ] Rating distribution chart
- [ ] Read individual reviews
- [ ] Reply to reviews
- [ ] Highlight constructive feedback
- [ ] Filter by rating level

#### US-19: Export Adventure
**As a** Seer  
**I want to** export my adventure data  
**So that** I have a backup

**Acceptance Criteria:**
- [ ] Export as JSON (full fidelity)
- [ ] Export as PDF (printable summary)
- [ ] Include all assets (optional)
- [ ] Version selection
- [ ] Download as ZIP archive

---

## Technical Specification

### Asset Management

#### Asset Types and Limits

```typescript
interface AssetConfig {
  images: {
    maxSize: 10 * 1024 * 1024;           // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    maxDimensions: { width: 4096; height: 4096 };
    variants: AssetVariant[];
  };
  audio: {
    maxSize: 25 * 1024 * 1024;           // 25MB
    allowedTypes: ['audio/mpeg', 'audio/ogg', 'audio/wav'];
    maxDuration: 300;                     // 5 minutes
    outputFormat: 'audio/mpeg';           // MP3
  };
  quotas: {
    freeStorageBytes: 100 * 1024 * 1024;  // 100MB
    proStorageBytes: 1024 * 1024 * 1024;  // 1GB
    maxAssetsPerAdventure: 100;
  };
}

interface AssetVariant {
  name: 'thumbnail' | 'medium' | 'large' | 'original';
  maxWidth: number;
  maxHeight: number;
  quality: number;
  format: 'webp' | 'jpeg' | 'original';
}

const IMAGE_VARIANTS: AssetVariant[] = [
  { name: 'thumbnail', maxWidth: 200, maxHeight: 200, quality: 80, format: 'webp' },
  { name: 'medium', maxWidth: 800, maxHeight: 600, quality: 85, format: 'webp' },
  { name: 'large', maxWidth: 1920, maxHeight: 1080, quality: 90, format: 'webp' },
  { name: 'original', maxWidth: 4096, maxHeight: 4096, quality: 100, format: 'original' },
];
```

#### Asset Data Models

```typescript
interface Asset {
  id: string;
  ownerId: string;
  adventureId?: string;               // null = in library, not attached
  
  // Core
  type: 'image' | 'audio';
  name: string;
  description?: string;
  tags: string[];
  
  // File info
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  
  // Storage
  storagePath: string;                // Path in Supabase Storage
  cdnUrl: string;                     // Cloudflare CDN URL
  variants: Record<string, AssetVariantInfo>;
  
  // Metadata
  metadata: ImageMetadata | AudioMetadata;
  
  // Status
  status: 'uploading' | 'processing' | 'ready' | 'error';
  processingError?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

interface AssetVariantInfo {
  storagePath: string;
  cdnUrl: string;
  width?: number;
  height?: number;
  sizeBytes: number;
}

interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  hasAlpha: boolean;
  isAnimated: boolean;                // For GIFs
  dominantColor?: string;             // For placeholders
  blurHash?: string;                  // For loading placeholders
}

interface AudioMetadata {
  duration: number;                   // seconds
  bitrate: number;
  sampleRate: number;
  channels: number;
  isLoopable: boolean;
  normalizedDb?: number;
}

interface AssetPack {
  id: string;
  name: string;
  description: string;
  coverImageUrl: string;
  
  // Contents
  assets: Asset[];
  assetCount: number;
  
  // License
  license: AssetLicense;
  attribution?: string;
  
  // Access
  type: 'free' | 'premium' | 'exclusive';
  price?: number;                     // For premium packs
  
  // Metadata
  categories: string[];
  tags: string[];
  
  createdAt: string;
  updatedAt: string;
}

interface AssetLicense {
  type: 'cc0' | 'cc-by' | 'cc-by-sa' | 'proprietary' | 'sparc-exclusive';
  requiresAttribution: boolean;
  commercialUse: boolean;
  modifications: boolean;
  shareAlike: boolean;
  licenseUrl?: string;
}
```

#### Asset Processing Pipeline

```typescript
interface AssetProcessingJob {
  id: string;
  assetId: string;
  type: 'image' | 'audio';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  steps: ProcessingStep[];
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

interface ProcessingStep {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
}

class AssetProcessor {
  async processImage(assetId: string, file: Buffer): Promise<void> {
    const steps: ProcessingStep[] = [
      { name: 'validate', status: 'pending' },
      { name: 'extract_metadata', status: 'pending' },
      { name: 'generate_variants', status: 'pending' },
      { name: 'upload_cdn', status: 'pending' },
      { name: 'generate_blurhash', status: 'pending' },
    ];
    
    // 1. Validate
    await this.validateImage(file);
    
    // 2. Extract metadata
    const metadata = await sharp(file).metadata();
    
    // 3. Generate variants
    const variants: Record<string, Buffer> = {};
    for (const variant of IMAGE_VARIANTS) {
      if (variant.name === 'original') {
        variants[variant.name] = file;
      } else {
        variants[variant.name] = await sharp(file)
          .resize(variant.maxWidth, variant.maxHeight, { fit: 'inside' })
          .toFormat(variant.format === 'webp' ? 'webp' : metadata.format!, { 
            quality: variant.quality 
          })
          .toBuffer();
      }
    }
    
    // 4. Upload to storage
    const variantInfos: Record<string, AssetVariantInfo> = {};
    for (const [name, buffer] of Object.entries(variants)) {
      const path = `assets/${assetId}/${name}`;
      await this.storage.upload(path, buffer);
      variantInfos[name] = {
        storagePath: path,
        cdnUrl: this.getCdnUrl(path),
        sizeBytes: buffer.length,
      };
    }
    
    // 5. Generate BlurHash
    const blurHash = await this.generateBlurHash(variants.thumbnail);
    
    // 6. Update asset record
    await this.updateAsset(assetId, {
      status: 'ready',
      variants: variantInfos,
      metadata: {
        width: metadata.width!,
        height: metadata.height!,
        format: metadata.format!,
        hasAlpha: metadata.hasAlpha || false,
        isAnimated: metadata.pages ? metadata.pages > 1 : false,
        blurHash,
      },
    });
  }
  
  async processAudio(assetId: string, file: Buffer): Promise<void> {
    // 1. Validate
    const probe = await ffprobe(file);
    if (probe.format.duration > 300) {
      throw new ValidationError('Audio exceeds 5 minute limit');
    }
    
    // 2. Convert to MP3
    const mp3Buffer = await ffmpeg(file)
      .toFormat('mp3')
      .audioBitrate(192)
      .audioChannels(2)
      .output();
    
    // 3. Normalize audio levels
    const normalizedBuffer = await this.normalizeAudio(mp3Buffer);
    
    // 4. Upload
    const path = `assets/${assetId}/audio.mp3`;
    await this.storage.upload(path, normalizedBuffer);
    
    // 5. Update record
    await this.updateAsset(assetId, {
      status: 'ready',
      metadata: {
        duration: probe.format.duration,
        bitrate: 192000,
        sampleRate: 44100,
        channels: 2,
        isLoopable: false,
      },
    });
  }
}
```

### Content Versioning

#### Version Data Models

```typescript
interface AdventureVersion {
  id: string;
  adventureId: string;
  
  // Version info
  versionNumber: number;              // Auto-incrementing
  label?: string;                     // Optional user label
  
  // Content snapshot
  contentSnapshot: AdventureContent;
  contentHash: string;                // SHA-256 of content
  
  // Change tracking
  changeType: 'auto' | 'manual' | 'publish' | 'rollback';
  changeSummary?: string;
  changedBy: string;
  
  // Diff from previous
  diffFromPrevious?: VersionDiff;
  
  // Metadata
  nodeCount: number;
  connectionCount: number;
  wordCount: number;
  
  createdAt: string;
}

interface AdventureContent {
  title: string;
  description: string;
  coverImageId?: string;
  settings: AdventureSettings;
  nodes: AdventureNode[];
  connections: Connection[];
  startNodeId: string;
  assets: AssetReference[];
  localizations: Record<string, LocalizedContent>;
}

interface VersionDiff {
  nodesAdded: string[];
  nodesRemoved: string[];
  nodesModified: NodeModification[];
  connectionsAdded: string[];
  connectionsRemoved: string[];
  metadataChanged: string[];          // Field names
}

interface NodeModification {
  nodeId: string;
  fields: FieldChange[];
}

interface FieldChange {
  field: string;
  oldValue: any;
  newValue: any;
}

interface DraftState {
  adventureId: string;
  userId: string;
  
  // Current working copy
  content: AdventureContent;
  
  // Auto-save
  lastAutoSave: string;
  autoSaveIntervalMs: 30000;
  
  // Conflict detection
  baseVersionId: string;              // Version this draft is based on
  hasConflicts: boolean;
  conflicts?: ConflictInfo[];
  
  // Recovery
  recoveryPoint?: string;             // Timestamp of last known good state
  
  createdAt: string;
  updatedAt: string;
}

interface ConflictInfo {
  type: 'concurrent_edit' | 'node_deleted' | 'connection_broken';
  details: string;
  resolution?: 'keep_mine' | 'keep_theirs' | 'merge';
}
```

#### Version Control Service

```typescript
class VersionControlService {
  private readonly MAX_AUTO_VERSIONS = 100;
  private readonly AUTO_SAVE_INTERVAL_MS = 30000;
  
  async createVersion(
    adventureId: string,
    content: AdventureContent,
    changeType: AdventureVersion['changeType'],
    changeSummary?: string
  ): Promise<AdventureVersion> {
    // Get previous version for diff
    const previousVersion = await this.getLatestVersion(adventureId);
    
    // Calculate content hash
    const contentHash = this.hashContent(content);
    
    // Skip if content unchanged
    if (previousVersion?.contentHash === contentHash) {
      return previousVersion;
    }
    
    // Calculate diff
    const diff = previousVersion 
      ? this.calculateDiff(previousVersion.contentSnapshot, content)
      : null;
    
    // Generate summary if not provided
    const summary = changeSummary || this.generateChangeSummary(diff);
    
    // Create version
    const version = await this.repo.createVersion({
      adventureId,
      versionNumber: (previousVersion?.versionNumber || 0) + 1,
      contentSnapshot: content,
      contentHash,
      changeType,
      changeSummary: summary,
      changedBy: this.currentUserId,
      diffFromPrevious: diff,
      nodeCount: content.nodes.length,
      connectionCount: content.connections.length,
      wordCount: this.countWords(content),
    });
    
    // Cleanup old auto-save versions
    if (changeType === 'auto') {
      await this.cleanupAutoVersions(adventureId);
    }
    
    return version;
  }
  
  async rollback(
    adventureId: string,
    targetVersionId: string
  ): Promise<AdventureVersion> {
    const targetVersion = await this.repo.getVersion(targetVersionId);
    if (!targetVersion) {
      throw new NotFoundError('Version not found');
    }
    
    // Create new version with rolled-back content
    return this.createVersion(
      adventureId,
      targetVersion.contentSnapshot,
      'rollback',
      `Rolled back to version ${targetVersion.versionNumber}`
    );
  }
  
  async compareVersions(
    versionIdA: string,
    versionIdB: string
  ): Promise<VersionComparison> {
    const [versionA, versionB] = await Promise.all([
      this.repo.getVersion(versionIdA),
      this.repo.getVersion(versionIdB),
    ]);
    
    const diff = this.calculateDiff(
      versionA.contentSnapshot,
      versionB.contentSnapshot
    );
    
    return {
      versionA,
      versionB,
      diff,
      visualDiff: this.generateVisualDiff(diff),
    };
  }
  
  private calculateDiff(
    oldContent: AdventureContent,
    newContent: AdventureContent
  ): VersionDiff {
    const oldNodeIds = new Set(oldContent.nodes.map(n => n.id));
    const newNodeIds = new Set(newContent.nodes.map(n => n.id));
    
    const nodesAdded = [...newNodeIds].filter(id => !oldNodeIds.has(id));
    const nodesRemoved = [...oldNodeIds].filter(id => !newNodeIds.has(id));
    
    const nodesModified: NodeModification[] = [];
    for (const newNode of newContent.nodes) {
      if (oldNodeIds.has(newNode.id)) {
        const oldNode = oldContent.nodes.find(n => n.id === newNode.id)!;
        const changes = this.diffNodes(oldNode, newNode);
        if (changes.length > 0) {
          nodesModified.push({ nodeId: newNode.id, fields: changes });
        }
      }
    }
    
    // Similar for connections...
    const oldConnIds = new Set(oldContent.connections.map(c => c.id));
    const newConnIds = new Set(newContent.connections.map(c => c.id));
    
    return {
      nodesAdded,
      nodesRemoved,
      nodesModified,
      connectionsAdded: [...newConnIds].filter(id => !oldConnIds.has(id)),
      connectionsRemoved: [...oldConnIds].filter(id => !newConnIds.has(id)),
      metadataChanged: this.diffMetadata(oldContent, newContent),
    };
  }
  
  private generateChangeSummary(diff: VersionDiff | null): string {
    if (!diff) return 'Initial version';
    
    const parts: string[] = [];
    if (diff.nodesAdded.length) parts.push(`+${diff.nodesAdded.length} nodes`);
    if (diff.nodesRemoved.length) parts.push(`-${diff.nodesRemoved.length} nodes`);
    if (diff.nodesModified.length) parts.push(`~${diff.nodesModified.length} modified`);
    
    return parts.join(', ') || 'Minor changes';
  }
  
  private async cleanupAutoVersions(adventureId: string): Promise<void> {
    const autoVersions = await this.repo.getVersions(adventureId, {
      changeType: 'auto',
      limit: 1000,
    });
    
    if (autoVersions.length > this.MAX_AUTO_VERSIONS) {
      // Keep every Nth version to preserve history while reducing storage
      const toDelete = autoVersions
        .slice(this.MAX_AUTO_VERSIONS)
        .filter((_, i) => i % 5 !== 0); // Keep every 5th old version
      
      await this.repo.deleteVersions(toDelete.map(v => v.id));
    }
  }
}
```

#### Auto-Save Service

```typescript
class AutoSaveService {
  private saveTimers: Map<string, NodeJS.Timeout> = new Map();
  
  async initDraft(adventureId: string, userId: string): Promise<DraftState> {
    const latestVersion = await this.versionService.getLatestVersion(adventureId);
    
    const draft: DraftState = {
      adventureId,
      userId,
      content: latestVersion?.contentSnapshot || this.createEmptyContent(),
      lastAutoSave: new Date().toISOString(),
      autoSaveIntervalMs: 30000,
      baseVersionId: latestVersion?.id || '',
      hasConflicts: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await this.repo.saveDraft(draft);
    return draft;
  }
  
  async updateDraft(
    adventureId: string,
    userId: string,
    content: AdventureContent
  ): Promise<DraftState> {
    // Check for conflicts
    const draft = await this.repo.getDraft(adventureId, userId);
    const latestVersion = await this.versionService.getLatestVersion(adventureId);
    
    if (latestVersion && latestVersion.id !== draft.baseVersionId) {
      // Someone else saved while we were editing
      const conflicts = await this.detectConflicts(draft, latestVersion);
      if (conflicts.length > 0) {
        draft.hasConflicts = true;
        draft.conflicts = conflicts;
      }
    }
    
    draft.content = content;
    draft.updatedAt = new Date().toISOString();
    
    await this.repo.saveDraft(draft);
    
    // Schedule auto-save
    this.scheduleAutoSave(adventureId, userId);
    
    return draft;
  }
  
  private scheduleAutoSave(adventureId: string, userId: string): void {
    const key = `${adventureId}:${userId}`;
    
    // Clear existing timer
    const existingTimer = this.saveTimers.get(key);
    if (existingTimer) clearTimeout(existingTimer);
    
    // Schedule new auto-save
    const timer = setTimeout(async () => {
      await this.performAutoSave(adventureId, userId);
    }, 30000);
    
    this.saveTimers.set(key, timer);
  }
  
  private async performAutoSave(adventureId: string, userId: string): Promise<void> {
    const draft = await this.repo.getDraft(adventureId, userId);
    if (!draft) return;
    
    await this.versionService.createVersion(
      adventureId,
      draft.content,
      'auto',
      'Auto-save'
    );
    
    draft.lastAutoSave = new Date().toISOString();
    await this.repo.saveDraft(draft);
  }
  
  async recoverDraft(adventureId: string, userId: string): Promise<DraftState | null> {
    // Try to recover from browser storage first
    const localDraft = await this.localStorage.get(`draft:${adventureId}`);
    if (localDraft) {
      return this.initDraft(adventureId, userId).then(draft => ({
        ...draft,
        content: localDraft,
        recoveryPoint: 'local_storage',
      }));
    }
    
    // Fall back to server draft
    return this.repo.getDraft(adventureId, userId);
  }
}
```

### Admin & Moderation

#### Moderation Data Models

```typescript
interface ContentFlag {
  id: string;
  
  // Target
  targetType: 'adventure' | 'review' | 'profile';
  targetId: string;
  
  // Reporter
  reporterId: string;
  isAnonymous: boolean;
  
  // Details
  reason: FlagReason;
  details?: string;
  evidence?: string[];                // Screenshot URLs
  
  // Status
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Resolution
  resolvedBy?: string;
  resolvedAt?: string;
  resolution?: FlagResolution;
  internalNotes?: string;
  
  createdAt: string;
  updatedAt: string;
}

type FlagReason = 
  | 'inappropriate_content'
  | 'harassment'
  | 'copyright_violation'
  | 'spam'
  | 'misleading'
  | 'hate_speech'
  | 'violence'
  | 'other';

interface FlagResolution {
  action: 'no_action' | 'warning' | 'content_removed' | 'user_suspended' | 'user_banned';
  notifiedCreator: boolean;
  notifiedReporter: boolean;
  appealable: boolean;
  expiresAt?: string;                 // For temporary actions
}

interface ModerationAction {
  id: string;
  
  // Target
  targetType: 'adventure' | 'user';
  targetId: string;
  
  // Action
  action: 'warning' | 'restrict' | 'remove' | 'suspend' | 'ban' | 'reinstate';
  reason: string;
  flagIds: string[];                  // Related flags
  
  // Details
  moderatorId: string;
  internalNotes?: string;
  
  // Duration
  permanent: boolean;
  expiresAt?: string;
  
  createdAt: string;
}

interface CreatorVerification {
  id: string;
  userId: string;
  
  // Application
  applicationDate: string;
  portfolioLinks: string[];
  statement: string;
  
  // Review
  status: 'pending' | 'approved' | 'denied';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  
  // Verification
  verifiedAt?: string;
  verificationBadge?: 'creator' | 'featured' | 'partner';
  
  // Revocation
  revokedAt?: string;
  revocationReason?: string;
}
```

#### Moderation Service

```typescript
class ModerationService {
  async submitFlag(
    reporterId: string,
    targetType: ContentFlag['targetType'],
    targetId: string,
    reason: FlagReason,
    details?: string,
    isAnonymous: boolean = false
  ): Promise<ContentFlag> {
    // Check for duplicate flags
    const existingFlag = await this.repo.findFlag({
      reporterId,
      targetType,
      targetId,
      status: ['pending', 'reviewing'],
    });
    
    if (existingFlag) {
      throw new ConflictError('You have already flagged this content');
    }
    
    // Calculate priority based on reason
    const priority = this.calculatePriority(reason, targetType);
    
    const flag = await this.repo.createFlag({
      targetType,
      targetId,
      reporterId,
      isAnonymous,
      reason,
      details,
      status: 'pending',
      priority,
    });
    
    // Auto-restrict if critical priority
    if (priority === 'critical') {
      await this.autoRestrict(targetType, targetId, flag.id);
    }
    
    // Notify moderators
    await this.notifyModerators(flag);
    
    return flag;
  }
  
  async resolveFlag(
    flagId: string,
    moderatorId: string,
    resolution: FlagResolution,
    internalNotes?: string
  ): Promise<ContentFlag> {
    const flag = await this.repo.getFlag(flagId);
    if (!flag) throw new NotFoundError('Flag not found');
    
    // Apply action
    if (resolution.action !== 'no_action') {
      await this.applyModerationAction(flag, resolution, moderatorId);
    }
    
    // Update flag
    const updatedFlag = await this.repo.updateFlag(flagId, {
      status: 'resolved',
      resolvedBy: moderatorId,
      resolvedAt: new Date().toISOString(),
      resolution,
      internalNotes,
    });
    
    // Notify parties
    if (resolution.notifiedCreator) {
      await this.notifyCreator(flag, resolution);
    }
    if (resolution.notifiedReporter) {
      await this.notifyReporter(flag, resolution);
    }
    
    return updatedFlag;
  }
  
  async getModeratorQueue(
    moderatorId: string,
    filters?: QueueFilters
  ): Promise<PaginatedResult<ContentFlag>> {
    return this.repo.getFlags({
      status: ['pending', 'reviewing'],
      priority: filters?.priority,
      reason: filters?.reason,
      orderBy: 'priority',
      orderDir: 'desc',
      ...filters?.pagination,
    });
  }
  
  private calculatePriority(reason: FlagReason, targetType: string): ContentFlag['priority'] {
    // Critical reasons
    if (['hate_speech', 'violence'].includes(reason)) return 'critical';
    
    // High priority
    if (['harassment', 'copyright_violation'].includes(reason)) return 'high';
    
    // Adventures get higher priority than profiles
    if (targetType === 'adventure') return 'medium';
    
    return 'low';
  }
  
  private async autoRestrict(
    targetType: string,
    targetId: string,
    flagId: string
  ): Promise<void> {
    if (targetType === 'adventure') {
      await this.adventureRepo.update(targetId, {
        visibility: 'restricted',
        restrictedReason: 'under_review',
        restrictedAt: new Date().toISOString(),
      });
    }
    
    await this.createModerationAction({
      targetType,
      targetId,
      action: 'restrict',
      reason: 'Auto-restricted pending review',
      flagIds: [flagId],
      moderatorId: 'system',
    });
  }
}
```

### Curation & Discovery

#### Discovery Data Models

```typescript
interface FeaturedContent {
  id: string;
  
  // Content
  contentType: 'adventure' | 'collection' | 'creator';
  contentId: string;
  
  // Feature details
  category: FeatureCategory;
  headline?: string;
  description?: string;
  customImageUrl?: string;
  
  // Scheduling
  startDate: string;
  endDate?: string;
  
  // Display
  position: number;
  isActive: boolean;
  
  // Stats
  impressions: number;
  clicks: number;
  
  // Metadata
  curatedBy: string;
  createdAt: string;
  updatedAt: string;
}

type FeatureCategory = 
  | 'staff_pick'
  | 'new_notable'
  | 'trending'
  | 'seasonal'
  | 'beginner_friendly'
  | 'community_favorite';

interface SearchIndex {
  // Meilisearch document
  id: string;                         // adventure_<id>
  
  // Core fields
  title: string;
  description: string;
  authorName: string;
  
  // Filterable
  difficulty: string;
  tags: string[];
  language: string;
  duration: number;
  playerCount: { min: number; max: number };
  
  // Sortable
  publishedAt: number;                // Unix timestamp
  rating: number;
  playCount: number;
  completionRate: number;
  trendingScore: number;
  
  // Searchable content (not displayed)
  nodeContent: string;                // All node text concatenated
}

interface RecommendationProfile {
  userId: string;
  
  // Preferences (learned)
  preferredDifficulties: Record<string, number>;
  preferredTags: Record<string, number>;
  preferredDurations: Record<string, number>;
  
  // History
  playedAdventures: string[];
  ratedAdventures: Record<string, number>;
  
  // Explicit preferences
  dislikedTags?: string[];
  
  updatedAt: string;
}

interface TrendingScore {
  adventureId: string;
  
  // Components
  recentPlays: number;                // Last 7 days
  recentCompletions: number;
  recentRatings: number;
  ratingVelocity: number;             // Change in avg rating
  
  // Calculated
  rawScore: number;
  normalizedScore: number;            // 0-100
  rank: number;
  
  calculatedAt: string;
}
```

#### Search Service

```typescript
class SearchService {
  private meilisearch: MeiliSearch;
  private readonly INDEX_NAME = 'adventures';
  
  async indexAdventure(adventure: PublishedAdventure): Promise<void> {
    const nodeContent = adventure.nodes
      .map(n => `${n.title || ''} ${n.content || ''}`)
      .join(' ');
    
    const document: SearchIndex = {
      id: `adventure_${adventure.id}`,
      title: adventure.title,
      description: adventure.description,
      authorName: adventure.authorName,
      difficulty: adventure.difficulty,
      tags: adventure.tags,
      language: adventure.primaryLanguage || 'en',
      duration: adventure.estimatedDurationMinutes,
      playerCount: adventure.recommendedPlayers,
      publishedAt: new Date(adventure.publishedAt).getTime(),
      rating: adventure.averageRating || 0,
      playCount: adventure.playCount,
      completionRate: adventure.completionRate,
      trendingScore: await this.getTrendingScore(adventure.id),
      nodeContent,
    };
    
    await this.meilisearch.index(this.INDEX_NAME).addDocuments([document]);
  }
  
  async search(query: SearchQuery): Promise<SearchResults> {
    const searchParams: SearchParams = {
      q: query.text,
      filter: this.buildFilters(query),
      sort: this.buildSort(query.sortBy),
      limit: query.limit || 20,
      offset: query.offset || 0,
      attributesToHighlight: ['title', 'description'],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
    };
    
    const results = await this.meilisearch
      .index(this.INDEX_NAME)
      .search(query.text, searchParams);
    
    return {
      hits: results.hits.map(this.mapHit),
      total: results.estimatedTotalHits,
      processingTime: results.processingTimeMs,
      query: query.text,
    };
  }
  
  private buildFilters(query: SearchQuery): string[] {
    const filters: string[] = [];
    
    if (query.difficulty) {
      filters.push(`difficulty = "${query.difficulty}"`);
    }
    
    if (query.tags?.length) {
      filters.push(`tags IN [${query.tags.map(t => `"${t}"`).join(', ')}]`);
    }
    
    if (query.language) {
      filters.push(`language = "${query.language}"`);
    }
    
    if (query.minDuration) {
      filters.push(`duration >= ${query.minDuration}`);
    }
    
    if (query.maxDuration) {
      filters.push(`duration <= ${query.maxDuration}`);
    }
    
    if (query.minRating) {
      filters.push(`rating >= ${query.minRating}`);
    }
    
    return filters;
  }
  
  private buildSort(sortBy?: string): string[] {
    switch (sortBy) {
      case 'newest': return ['publishedAt:desc'];
      case 'popular': return ['playCount:desc'];
      case 'rating': return ['rating:desc', 'playCount:desc'];
      case 'trending': return ['trendingScore:desc'];
      default: return ['_rankingScore:desc'];
    }
  }
}
```

#### Recommendation Engine

```typescript
class RecommendationEngine {
  async getRecommendations(
    userId: string,
    limit: number = 10
  ): Promise<RecommendedAdventure[]> {
    const profile = await this.getOrCreateProfile(userId);
    
    // Get candidates using multiple strategies
    const [
      similarToPlayed,
      basedOnPreferences,
      trending,
      newFromFollowed,
    ] = await Promise.all([
      this.getSimilarToPlayed(profile, limit),
      this.getBasedOnPreferences(profile, limit),
      this.getTrending(profile, limit),
      this.getNewFromFollowed(userId, limit),
    ]);
    
    // Merge and deduplicate
    const allCandidates = this.mergeCandidates([
      { items: similarToPlayed, weight: 0.35 },
      { items: basedOnPreferences, weight: 0.25 },
      { items: trending, weight: 0.20 },
      { items: newFromFollowed, weight: 0.20 },
    ]);
    
    // Filter out played adventures
    const filtered = allCandidates.filter(
      c => !profile.playedAdventures.includes(c.id)
    );
    
    // Apply diversity (don't show too many from same author/tag)
    const diverse = this.applyDiversity(filtered, {
      maxPerAuthor: 2,
      maxPerTag: 3,
    });
    
    return diverse.slice(0, limit);
  }
  
  private async getSimilarToPlayed(
    profile: RecommendationProfile,
    limit: number
  ): Promise<ScoredAdventure[]> {
    // Get recently highly-rated adventures
    const likedAdventures = Object.entries(profile.ratedAdventures)
      .filter(([_, rating]) => rating >= 4)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);
    
    if (likedAdventures.length === 0) return [];
    
    // Find similar based on tags and difficulty
    const similar = await this.adventureRepo.findSimilar(likedAdventures, {
      limit: limit * 2,
      excludeIds: profile.playedAdventures,
    });
    
    return similar.map(a => ({
      ...a,
      score: this.calculateSimilarityScore(a, likedAdventures),
      reason: 'similar_to_played',
    }));
  }
  
  private async getBasedOnPreferences(
    profile: RecommendationProfile,
    limit: number
  ): Promise<ScoredAdventure[]> {
    // Build weighted query from preferences
    const topTags = Object.entries(profile.preferredTags)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);
    
    const topDifficulty = Object.entries(profile.preferredDifficulties)
      .sort((a, b) => b[1] - a[1])[0]?.[0];
    
    const adventures = await this.adventureRepo.find({
      tags: { $in: topTags },
      difficulty: topDifficulty,
      excludeIds: profile.playedAdventures,
      limit: limit * 2,
    });
    
    return adventures.map(a => ({
      ...a,
      score: this.calculatePreferenceScore(a, profile),
      reason: 'matches_preferences',
    }));
  }
  
  async updateProfile(
    userId: string,
    event: ProfileEvent
  ): Promise<void> {
    const profile = await this.getOrCreateProfile(userId);
    
    switch (event.type) {
      case 'adventure_played':
        profile.playedAdventures.push(event.adventureId);
        this.updateTagPreferences(profile, event.adventure.tags, 1);
        this.updateDifficultyPreference(profile, event.adventure.difficulty, 1);
        break;
        
      case 'adventure_completed':
        this.updateTagPreferences(profile, event.adventure.tags, 2);
        break;
        
      case 'adventure_rated':
        profile.ratedAdventures[event.adventureId] = event.rating;
        const weight = event.rating >= 4 ? 3 : event.rating <= 2 ? -2 : 0;
        this.updateTagPreferences(profile, event.adventure.tags, weight);
        break;
    }
    
    profile.updatedAt = new Date().toISOString();
    await this.repo.saveProfile(profile);
  }
}
```

### Localization

#### Localization Data Models

```typescript
interface LocalizedContent {
  language: string;                   // ISO 639-1 code
  direction: 'ltr' | 'rtl';
  
  // Adventure metadata
  title: string;
  description: string;
  
  // Node content
  nodes: LocalizedNode[];
  
  // Status
  completeness: number;               // 0-100%
  status: 'draft' | 'review' | 'published';
  
  // Attribution
  translatorId?: string;
  reviewerId?: string;
  
  lastUpdatedAt: string;
}

interface LocalizedNode {
  nodeId: string;
  title?: string;
  content?: string;
  choices?: LocalizedChoice[];
  
  // Translation status
  isTranslated: boolean;
  needsReview: boolean;
  lastUpdatedAt: string;
}

interface LocalizedChoice {
  choiceId: string;
  text: string;
}

interface TranslationMemory {
  id: string;
  sourceLanguage: string;
  targetLanguage: string;
  
  // Content
  sourceText: string;
  translatedText: string;
  
  // Context
  context?: string;                   // Node type, surrounding text
  
  // Quality
  confirmedBy?: string;
  usageCount: number;
  
  createdAt: string;
  updatedAt: string;
}

interface LocaleConfig {
  code: string;                       // 'en', 'es', 'ar', etc.
  name: string;                       // 'English', 'Español', 'العربية'
  nativeName: string;
  direction: 'ltr' | 'rtl';
  
  // Formatting
  numberFormat: Intl.NumberFormatOptions;
  dateFormat: Intl.DateTimeFormatOptions;
  
  // Content
  isSupported: boolean;               // UI translations available
  adventureCount: number;             // Number of adventures in this language
}

const SUPPORTED_LOCALES: LocaleConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', isSupported: true },
  { code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr', isSupported: true },
  { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr', isSupported: true },
  { code: 'de', name: 'German', nativeName: 'Deutsch', direction: 'ltr', isSupported: true },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', direction: 'ltr', isSupported: true },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', direction: 'ltr', isSupported: true },
  { code: 'ko', name: 'Korean', nativeName: '한국어', direction: 'ltr', isSupported: true },
  { code: 'zh', name: 'Chinese', nativeName: '中文', direction: 'ltr', isSupported: true },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl', isSupported: true },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', direction: 'rtl', isSupported: true },
];
```

#### Localization Service

```typescript
class LocalizationService {
  async createLocalization(
    adventureId: string,
    language: string
  ): Promise<LocalizedContent> {
    const adventure = await this.adventureRepo.get(adventureId);
    const locale = this.getLocaleConfig(language);
    
    // Initialize with empty translations
    const localizedNodes: LocalizedNode[] = adventure.nodes.map(node => ({
      nodeId: node.id,
      title: '',
      content: '',
      choices: node.choices?.map(c => ({ choiceId: c.id, text: '' })),
      isTranslated: false,
      needsReview: false,
      lastUpdatedAt: new Date().toISOString(),
    }));
    
    const localization: LocalizedContent = {
      language,
      direction: locale.direction,
      title: '',
      description: '',
      nodes: localizedNodes,
      completeness: 0,
      status: 'draft',
      lastUpdatedAt: new Date().toISOString(),
    };
    
    await this.repo.saveLocalization(adventureId, localization);
    return localization;
  }
  
  async updateNodeTranslation(
    adventureId: string,
    language: string,
    nodeId: string,
    translation: Partial<LocalizedNode>
  ): Promise<void> {
    const localization = await this.repo.getLocalization(adventureId, language);
    if (!localization) throw new NotFoundError('Localization not found');
    
    const nodeIndex = localization.nodes.findIndex(n => n.nodeId === nodeId);
    if (nodeIndex === -1) throw new NotFoundError('Node not found');
    
    localization.nodes[nodeIndex] = {
      ...localization.nodes[nodeIndex],
      ...translation,
      isTranslated: true,
      lastUpdatedAt: new Date().toISOString(),
    };
    
    // Store in translation memory
    const originalNode = await this.getOriginalNode(adventureId, nodeId);
    if (translation.content && originalNode.content) {
      await this.addToTranslationMemory({
        sourceLanguage: 'en',
        targetLanguage: language,
        sourceText: originalNode.content,
        translatedText: translation.content,
        context: `node:${originalNode.type}`,
      });
    }
    
    // Recalculate completeness
    localization.completeness = this.calculateCompleteness(localization);
    localization.lastUpdatedAt = new Date().toISOString();
    
    await this.repo.saveLocalization(adventureId, localization);
  }
  
  async suggestTranslation(
    sourceText: string,
    targetLanguage: string
  ): Promise<TranslationSuggestion[]> {
    // Check translation memory
    const memorySuggestions = await this.repo.findSimilarTranslations({
      sourceText,
      targetLanguage,
      minSimilarity: 0.7,
      limit: 3,
    });
    
    // If no good memory matches, could integrate machine translation
    // (out of scope for MVP)
    
    return memorySuggestions.map(m => ({
      text: m.translatedText,
      source: 'memory',
      confidence: m.similarity,
      usageCount: m.usageCount,
    }));
  }
  
  async getAdventureInLanguage(
    adventureId: string,
    language: string
  ): Promise<Adventure> {
    const adventure = await this.adventureRepo.get(adventureId);
    const localization = await this.repo.getLocalization(adventureId, language);
    
    if (!localization || localization.status !== 'published') {
      // Fall back to primary language
      return adventure;
    }
    
    // Merge localized content
    return {
      ...adventure,
      title: localization.title || adventure.title,
      description: localization.description || adventure.description,
      nodes: adventure.nodes.map(node => {
        const localizedNode = localization.nodes.find(n => n.nodeId === node.id);
        if (!localizedNode?.isTranslated) return node;
        
        return {
          ...node,
          title: localizedNode.title || node.title,
          content: localizedNode.content || node.content,
          choices: node.choices?.map(choice => {
            const localizedChoice = localizedNode.choices?.find(c => c.choiceId === choice.id);
            return localizedChoice 
              ? { ...choice, text: localizedChoice.text }
              : choice;
          }),
        };
      }),
    };
  }
  
  private calculateCompleteness(localization: LocalizedContent): number {
    const totalFields = 2 + localization.nodes.length * 2; // title, desc + per-node
    const translatedFields = 
      (localization.title ? 1 : 0) +
      (localization.description ? 1 : 0) +
      localization.nodes.filter(n => n.isTranslated).length * 2;
    
    return Math.round((translatedFields / totalFields) * 100);
  }
}
```

### Creator Tools & Analytics

#### Analytics Data Models

```typescript
interface AdventureAnalytics {
  adventureId: string;
  
  // Overview
  totalPlays: number;
  uniquePlayers: number;
  totalCompletions: number;
  completionRate: number;
  averageSessionDuration: number;     // minutes
  
  // Ratings
  averageRating: number;
  ratingDistribution: Record<number, number>; // 1-5 -> count
  totalReviews: number;
  
  // Trends
  playsLast7Days: number;
  playsLast30Days: number;
  playsTrend: number;                 // % change from previous period
  
  // Player retention
  returnPlayers: number;
  returnRate: number;
  
  // Updated
  lastCalculatedAt: string;
}

interface NodeAnalytics {
  nodeId: string;
  adventureId: string;
  
  // Visits
  totalVisits: number;
  uniqueVisitors: number;
  
  // Engagement
  averageTimeSpent: number;           // seconds
  
  // Outcomes
  successRate?: number;               // For challenge nodes
  choiceDistribution?: Record<string, number>; // For decision nodes
  
  // Flow
  exitRate: number;                   // Players who quit at this node
  isDropOffPoint: boolean;            // Significantly higher exit rate
}

interface PlaySession {
  id: string;
  adventureId: string;
  userId: string;
  
  // Timing
  startedAt: string;
  endedAt?: string;
  duration?: number;
  
  // Progress
  nodesVisited: string[];
  currentNodeId: string;
  completed: boolean;
  outcome?: 'victory' | 'defeat' | 'abandoned';
  
  // Engagement
  diceRolls: number;
  decisionsCount: number;
}

interface CreatorDashboardData {
  // Summary
  totalAdventures: number;
  publishedAdventures: number;
  totalPlays: number;
  totalPlayers: number;
  
  // Performance
  averageRating: number;
  totalReviews: number;
  
  // Trending
  topAdventures: AdventureSummary[];
  recentReviews: Review[];
  
  // Activity
  playsOverTime: TimeSeriesData[];
  playersOverTime: TimeSeriesData[];
}

interface TimeSeriesData {
  date: string;
  value: number;
}
```

#### Analytics Service

```typescript
class AnalyticsService {
  async trackSessionStart(
    adventureId: string,
    userId: string
  ): Promise<PlaySession> {
    const session: PlaySession = {
      id: generateId(),
      adventureId,
      userId,
      startedAt: new Date().toISOString(),
      nodesVisited: [],
      currentNodeId: '',
      completed: false,
      diceRolls: 0,
      decisionsCount: 0,
    };
    
    await this.repo.createSession(session);
    
    // Increment play count (debounced per user)
    await this.incrementPlayCount(adventureId, userId);
    
    return session;
  }
  
  async trackNodeVisit(
    sessionId: string,
    nodeId: string,
    timeSpent: number
  ): Promise<void> {
    // Update session
    await this.repo.updateSession(sessionId, {
      $push: { nodesVisited: nodeId },
      $set: { currentNodeId: nodeId },
    });
    
    // Update node analytics
    await this.repo.incrementNodeVisit(nodeId, timeSpent);
  }
  
  async trackSessionEnd(
    sessionId: string,
    outcome: PlaySession['outcome']
  ): Promise<void> {
    const session = await this.repo.getSession(sessionId);
    const duration = Date.now() - new Date(session.startedAt).getTime();
    
    await this.repo.updateSession(sessionId, {
      endedAt: new Date().toISOString(),
      duration: Math.round(duration / 1000 / 60),
      completed: outcome !== 'abandoned',
      outcome,
    });
    
    // Update adventure analytics
    if (outcome !== 'abandoned') {
      await this.incrementCompletion(session.adventureId);
    }
    
    // Update drop-off analytics
    if (outcome === 'abandoned') {
      await this.trackDropOff(session.adventureId, session.currentNodeId);
    }
  }
  
  async getAdventureAnalytics(adventureId: string): Promise<AdventureAnalytics> {
    // Try cache first
    const cached = await this.cache.get(`analytics:${adventureId}`);
    if (cached) return cached;
    
    // Calculate fresh
    const [sessions, ratings] = await Promise.all([
      this.repo.getSessions(adventureId),
      this.repo.getRatings(adventureId),
    ]);
    
    const analytics: AdventureAnalytics = {
      adventureId,
      totalPlays: sessions.length,
      uniquePlayers: new Set(sessions.map(s => s.userId)).size,
      totalCompletions: sessions.filter(s => s.completed).length,
      completionRate: sessions.length > 0 
        ? sessions.filter(s => s.completed).length / sessions.length 
        : 0,
      averageSessionDuration: this.calculateAverageDuration(sessions),
      averageRating: this.calculateAverageRating(ratings),
      ratingDistribution: this.calculateRatingDistribution(ratings),
      totalReviews: ratings.filter(r => r.review).length,
      playsLast7Days: this.countRecentSessions(sessions, 7),
      playsLast30Days: this.countRecentSessions(sessions, 30),
      playsTrend: this.calculateTrend(sessions),
      returnPlayers: this.countReturnPlayers(sessions),
      returnRate: this.calculateReturnRate(sessions),
      lastCalculatedAt: new Date().toISOString(),
    };
    
    // Cache for 5 minutes
    await this.cache.set(`analytics:${adventureId}`, analytics, 300);
    
    return analytics;
  }
  
  async getNodeAnalytics(adventureId: string): Promise<NodeAnalytics[]> {
    const sessions = await this.repo.getSessions(adventureId);
    const adventure = await this.adventureRepo.get(adventureId);
    
    const nodeStats = new Map<string, NodeAnalytics>();
    
    for (const node of adventure.nodes) {
      const visits = sessions.flatMap(s => 
        s.nodesVisited.filter(n => n === node.id)
      );
      
      const exits = sessions.filter(s => 
        s.outcome === 'abandoned' && s.currentNodeId === node.id
      );
      
      nodeStats.set(node.id, {
        nodeId: node.id,
        adventureId,
        totalVisits: visits.length,
        uniqueVisitors: new Set(
          sessions.filter(s => s.nodesVisited.includes(node.id)).map(s => s.userId)
        ).size,
        averageTimeSpent: 0, // Would need more granular tracking
        exitRate: visits.length > 0 ? exits.length / visits.length : 0,
        isDropOffPoint: false, // Calculated below
      });
    }
    
    // Mark drop-off points (> 2x average exit rate)
    const avgExitRate = Array.from(nodeStats.values())
      .reduce((sum, n) => sum + n.exitRate, 0) / nodeStats.size;
    
    for (const [_, stats] of nodeStats) {
      stats.isDropOffPoint = stats.exitRate > avgExitRate * 2;
    }
    
    return Array.from(nodeStats.values());
  }
  
  async getCreatorDashboard(userId: string): Promise<CreatorDashboardData> {
    const adventures = await this.adventureRepo.findByAuthor(userId);
    const publishedIds = adventures
      .filter(a => a.visibility === 'public')
      .map(a => a.id);
    
    const [allSessions, recentReviews] = await Promise.all([
      this.repo.getSessionsForAdventures(publishedIds),
      this.repo.getRecentReviews(publishedIds, 10),
    ]);
    
    // Build time series
    const playsOverTime = this.buildTimeSeries(allSessions, 'startedAt', 30);
    
    return {
      totalAdventures: adventures.length,
      publishedAdventures: publishedIds.length,
      totalPlays: allSessions.length,
      totalPlayers: new Set(allSessions.map(s => s.userId)).size,
      averageRating: await this.calculateOverallRating(publishedIds),
      totalReviews: recentReviews.length,
      topAdventures: await this.getTopAdventures(publishedIds, 5),
      recentReviews,
      playsOverTime,
      playersOverTime: this.buildPlayerTimeSeries(allSessions, 30),
    };
  }
}
```

#### Export Service

```typescript
class ExportService {
  async exportAdventure(
    adventureId: string,
    format: 'json' | 'pdf',
    options: ExportOptions
  ): Promise<ExportResult> {
    const adventure = await this.adventureRepo.get(adventureId);
    
    switch (format) {
      case 'json':
        return this.exportAsJson(adventure, options);
      case 'pdf':
        return this.exportAsPdf(adventure, options);
    }
  }
  
  private async exportAsJson(
    adventure: Adventure,
    options: ExportOptions
  ): Promise<ExportResult> {
    const exportData: AdventureExport = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      adventure: {
        ...adventure,
        // Omit internal IDs if requested
        id: options.includeIds ? adventure.id : undefined,
      },
    };
    
    // Include assets if requested
    if (options.includeAssets) {
      const assets = await this.assetService.getAssetsForAdventure(adventure.id);
      exportData.assets = assets;
    }
    
    // Include all localizations if requested
    if (options.includeLocalizations) {
      exportData.localizations = await this.localizationService
        .getAllLocalizations(adventure.id);
    }
    
    const jsonContent = JSON.stringify(exportData, null, 2);
    
    if (options.includeAssets && exportData.assets?.length) {
      // Create ZIP with JSON and assets
      return this.createZipExport(jsonContent, exportData.assets);
    }
    
    return {
      filename: `${slugify(adventure.title)}_export.json`,
      contentType: 'application/json',
      content: Buffer.from(jsonContent),
    };
  }
  
  private async exportAsPdf(
    adventure: Adventure,
    options: ExportOptions
  ): Promise<ExportResult> {
    const doc = new PDFDocument();
    
    // Title page
    doc.fontSize(24).text(adventure.title, { align: 'center' });
    doc.fontSize(12).text(`By ${adventure.authorName}`, { align: 'center' });
    doc.moveDown();
    doc.text(adventure.description);
    
    // Table of contents
    doc.addPage();
    doc.fontSize(18).text('Nodes', { underline: true });
    doc.moveDown();
    
    for (const node of adventure.nodes) {
      doc.fontSize(14).text(node.title || `Node ${node.id.slice(0, 8)}`);
      doc.fontSize(10).text(`Type: ${node.type}`);
      if (node.content) {
        doc.fontSize(10).text(node.content);
      }
      doc.moveDown();
    }
    
    // Finalize PDF
    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      const chunks: Buffer[] = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.end();
    });
    
    return {
      filename: `${slugify(adventure.title)}_export.pdf`,
      contentType: 'application/pdf',
      content: pdfBuffer,
    };
  }
}
```

---

## API Endpoints

### Asset Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/assets/upload` | Upload new asset |
| GET | `/assets` | List user's assets |
| GET | `/assets/:id` | Get asset details |
| DELETE | `/assets/:id` | Delete asset |
| PATCH | `/assets/:id` | Update asset metadata |
| GET | `/assets/packs` | List available asset packs |
| GET | `/assets/packs/:id` | Get pack details |
| POST | `/assets/packs/:id/use` | Add pack asset to adventure |

### Content Versioning

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/adventures/:id/versions` | List versions |
| GET | `/adventures/:id/versions/:versionId` | Get specific version |
| POST | `/adventures/:id/versions` | Create manual checkpoint |
| POST | `/adventures/:id/rollback` | Rollback to version |
| GET | `/adventures/:id/versions/compare` | Compare two versions |
| GET | `/adventures/:id/draft` | Get current draft |
| PUT | `/adventures/:id/draft` | Save draft |
| POST | `/adventures/:id/draft/recover` | Attempt draft recovery |

### Moderation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/flags` | Submit content flag |
| GET | `/admin/flags` | Get moderation queue |
| PATCH | `/admin/flags/:id` | Resolve flag |
| GET | `/admin/actions` | List moderation actions |
| POST | `/admin/verification` | Submit verification request |
| GET | `/admin/verification/:id` | Get verification status |
| PATCH | `/admin/verification/:id` | Process verification |

### Discovery

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/discover/featured` | Get featured content |
| POST | `/admin/featured` | Create featured item |
| DELETE | `/admin/featured/:id` | Remove featured item |
| GET | `/search` | Search adventures |
| GET | `/recommendations` | Get personalized recommendations |
| GET | `/trending` | Get trending adventures |

### Localization

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/adventures/:id/localizations` | List localizations |
| POST | `/adventures/:id/localizations` | Create localization |
| GET | `/adventures/:id/localizations/:lang` | Get localization |
| PUT | `/adventures/:id/localizations/:lang` | Update localization |
| DELETE | `/adventures/:id/localizations/:lang` | Delete localization |
| POST | `/localizations/suggest` | Get translation suggestions |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/adventures/:id/analytics` | Get adventure analytics |
| GET | `/adventures/:id/analytics/nodes` | Get node-level analytics |
| GET | `/creator/dashboard` | Get creator dashboard data |
| POST | `/analytics/track` | Track session event |
| GET | `/adventures/:id/export` | Export adventure |

---

## Database Schema

```sql
-- Assets
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  adventure_id UUID REFERENCES adventures(id) ON DELETE SET NULL,
  
  type TEXT NOT NULL CHECK (type IN ('image', 'audio')),
  name TEXT NOT NULL,
  description TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  
  storage_path TEXT NOT NULL,
  cdn_url TEXT NOT NULL,
  variants JSONB NOT NULL DEFAULT '{}',
  
  metadata JSONB NOT NULL DEFAULT '{}',
  
  status TEXT NOT NULL DEFAULT 'uploading' CHECK (status IN ('uploading', 'processing', 'ready', 'error')),
  processing_error TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assets_owner ON assets(owner_id);
CREATE INDEX idx_assets_adventure ON assets(adventure_id);
CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_assets_status ON assets(status);

-- Asset Packs
CREATE TABLE asset_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  cover_image_url TEXT,
  
  license_type TEXT NOT NULL,
  license_details JSONB NOT NULL,
  
  pack_type TEXT NOT NULL CHECK (pack_type IN ('free', 'premium', 'exclusive')),
  price_cents INTEGER,
  
  categories TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  asset_count INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Adventure Versions
CREATE TABLE adventure_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adventure_id UUID NOT NULL REFERENCES adventures(id) ON DELETE CASCADE,
  
  version_number INTEGER NOT NULL,
  label TEXT,
  
  content_snapshot JSONB NOT NULL,
  content_hash TEXT NOT NULL,
  
  change_type TEXT NOT NULL CHECK (change_type IN ('auto', 'manual', 'publish', 'rollback')),
  change_summary TEXT,
  changed_by UUID NOT NULL REFERENCES users(id),
  
  diff_from_previous JSONB,
  
  node_count INTEGER NOT NULL,
  connection_count INTEGER NOT NULL,
  word_count INTEGER NOT NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_versions_adventure ON adventure_versions(adventure_id);
CREATE INDEX idx_versions_number ON adventure_versions(adventure_id, version_number DESC);
CREATE UNIQUE INDEX idx_versions_unique ON adventure_versions(adventure_id, version_number);

-- Draft States
CREATE TABLE draft_states (
  adventure_id UUID NOT NULL REFERENCES adventures(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  content JSONB NOT NULL,
  
  last_auto_save TIMESTAMPTZ NOT NULL,
  base_version_id UUID REFERENCES adventure_versions(id),
  
  has_conflicts BOOLEAN NOT NULL DEFAULT false,
  conflicts JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  PRIMARY KEY (adventure_id, user_id)
);

-- Content Flags
CREATE TABLE content_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  target_type TEXT NOT NULL CHECK (target_type IN ('adventure', 'review', 'profile')),
  target_id UUID NOT NULL,
  
  reporter_id UUID NOT NULL REFERENCES users(id),
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  
  reason TEXT NOT NULL,
  details TEXT,
  evidence TEXT[],
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  resolution JSONB,
  internal_notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_flags_status ON content_flags(status);
CREATE INDEX idx_flags_priority ON content_flags(priority DESC);
CREATE INDEX idx_flags_target ON content_flags(target_type, target_id);

-- Moderation Actions
CREATE TABLE moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  target_type TEXT NOT NULL CHECK (target_type IN ('adventure', 'user')),
  target_id UUID NOT NULL,
  
  action TEXT NOT NULL CHECK (action IN ('warning', 'restrict', 'remove', 'suspend', 'ban', 'reinstate')),
  reason TEXT NOT NULL,
  flag_ids UUID[] NOT NULL DEFAULT '{}',
  
  moderator_id UUID NOT NULL REFERENCES users(id),
  internal_notes TEXT,
  
  permanent BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mod_actions_target ON moderation_actions(target_type, target_id);

-- Creator Verification
CREATE TABLE creator_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  application_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  portfolio_links TEXT[] NOT NULL,
  statement TEXT NOT NULL,
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  
  verified_at TIMESTAMPTZ,
  verification_badge TEXT CHECK (verification_badge IN ('creator', 'featured', 'partner')),
  
  revoked_at TIMESTAMPTZ,
  revocation_reason TEXT
);

CREATE UNIQUE INDEX idx_verification_user ON creator_verifications(user_id) WHERE status = 'approved';

-- Featured Content
CREATE TABLE featured_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  content_type TEXT NOT NULL CHECK (content_type IN ('adventure', 'collection', 'creator')),
  content_id UUID NOT NULL,
  
  category TEXT NOT NULL,
  headline TEXT,
  description TEXT,
  custom_image_url TEXT,
  
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  
  position INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  impressions BIGINT NOT NULL DEFAULT 0,
  clicks BIGINT NOT NULL DEFAULT 0,
  
  curated_by UUID NOT NULL REFERENCES users(id),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_featured_active ON featured_content(is_active, start_date, end_date);
CREATE INDEX idx_featured_category ON featured_content(category, position);

-- Recommendation Profiles
CREATE TABLE recommendation_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  
  preferred_difficulties JSONB NOT NULL DEFAULT '{}',
  preferred_tags JSONB NOT NULL DEFAULT '{}',
  preferred_durations JSONB NOT NULL DEFAULT '{}',
  
  played_adventures UUID[] NOT NULL DEFAULT '{}',
  rated_adventures JSONB NOT NULL DEFAULT '{}',
  disliked_tags TEXT[],
  
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trending Scores (updated by cron job)
CREATE TABLE trending_scores (
  adventure_id UUID PRIMARY KEY REFERENCES published_adventures(id) ON DELETE CASCADE,
  
  recent_plays INTEGER NOT NULL DEFAULT 0,
  recent_completions INTEGER NOT NULL DEFAULT 0,
  recent_ratings INTEGER NOT NULL DEFAULT 0,
  rating_velocity DECIMAL(5,2) NOT NULL DEFAULT 0,
  
  raw_score DECIMAL(10,2) NOT NULL DEFAULT 0,
  normalized_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  rank INTEGER NOT NULL DEFAULT 0,
  
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trending_rank ON trending_scores(rank);
CREATE INDEX idx_trending_score ON trending_scores(normalized_score DESC);

-- Localizations
CREATE TABLE adventure_localizations (
  adventure_id UUID NOT NULL REFERENCES adventures(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  
  direction TEXT NOT NULL DEFAULT 'ltr' CHECK (direction IN ('ltr', 'rtl')),
  
  title TEXT,
  description TEXT,
  nodes JSONB NOT NULL DEFAULT '[]',
  
  completeness INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published')),
  
  translator_id UUID REFERENCES users(id),
  reviewer_id UUID REFERENCES users(id),
  
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  PRIMARY KEY (adventure_id, language)
);

CREATE INDEX idx_localizations_status ON adventure_localizations(status);

-- Translation Memory
CREATE TABLE translation_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  source_language TEXT NOT NULL,
  target_language TEXT NOT NULL,
  
  source_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  
  context TEXT,
  
  confirmed_by UUID REFERENCES users(id),
  usage_count INTEGER NOT NULL DEFAULT 1,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tm_lookup ON translation_memory(source_language, target_language, source_text);

-- Play Sessions (for analytics)
CREATE TABLE play_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adventure_id UUID NOT NULL REFERENCES adventures(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  
  nodes_visited UUID[] NOT NULL DEFAULT '{}',
  current_node_id UUID,
  
  completed BOOLEAN NOT NULL DEFAULT false,
  outcome TEXT CHECK (outcome IN ('victory', 'defeat', 'abandoned')),
  
  dice_rolls INTEGER NOT NULL DEFAULT 0,
  decisions_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_sessions_adventure ON play_sessions(adventure_id);
CREATE INDEX idx_sessions_user ON play_sessions(user_id);
CREATE INDEX idx_sessions_started ON play_sessions(started_at DESC);

-- Node Analytics (aggregated)
CREATE TABLE node_analytics (
  node_id UUID NOT NULL,
  adventure_id UUID NOT NULL REFERENCES adventures(id) ON DELETE CASCADE,
  
  total_visits BIGINT NOT NULL DEFAULT 0,
  unique_visitors BIGINT NOT NULL DEFAULT 0,
  
  average_time_spent INTEGER NOT NULL DEFAULT 0,
  
  exit_rate DECIMAL(5,4) NOT NULL DEFAULT 0,
  is_drop_off_point BOOLEAN NOT NULL DEFAULT false,
  
  success_rate DECIMAL(5,4),
  choice_distribution JSONB,
  
  last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  PRIMARY KEY (adventure_id, node_id)
);
```

---

## Background Jobs

### Job Definitions

```typescript
interface JobDefinition {
  name: string;
  schedule?: string;              // Cron expression
  queue: 'default' | 'assets' | 'analytics' | 'search';
  timeout: number;                // seconds
  retries: number;
}

const JOBS: JobDefinition[] = [
  // Asset processing
  { name: 'process-image', queue: 'assets', timeout: 60, retries: 3 },
  { name: 'process-audio', queue: 'assets', timeout: 120, retries: 3 },
  { name: 'cleanup-orphan-assets', schedule: '0 3 * * *', queue: 'default', timeout: 300, retries: 1 },
  
  // Analytics
  { name: 'calculate-trending', schedule: '0 * * * *', queue: 'analytics', timeout: 300, retries: 1 },
  { name: 'update-adventure-stats', schedule: '*/15 * * * *', queue: 'analytics', timeout: 600, retries: 1 },
  { name: 'aggregate-node-analytics', schedule: '0 4 * * *', queue: 'analytics', timeout: 900, retries: 1 },
  
  // Search
  { name: 'reindex-adventure', queue: 'search', timeout: 30, retries: 3 },
  { name: 'full-reindex', schedule: '0 2 * * 0', queue: 'search', timeout: 3600, retries: 1 },
  
  // Cleanup
  { name: 'cleanup-old-versions', schedule: '0 5 * * *', queue: 'default', timeout: 300, retries: 1 },
  { name: 'cleanup-expired-drafts', schedule: '0 6 * * *', queue: 'default', timeout: 300, retries: 1 },
];
```

---

## Caching Strategy

```typescript
interface CacheConfig {
  // Asset URLs (CDN handles most caching)
  assetUrls: {
    ttl: 86400;                   // 24 hours
    staleWhileRevalidate: true;
  };
  
  // Search results
  searchResults: {
    ttl: 300;                     // 5 minutes
    keyPrefix: 'search:';
    maxEntries: 10000;
  };
  
  // Analytics (expensive to compute)
  analytics: {
    adventure: { ttl: 300 };      // 5 minutes
    nodeAnalytics: { ttl: 600 };  // 10 minutes
    dashboard: { ttl: 300 };      // 5 minutes
  };
  
  // Recommendations
  recommendations: {
    ttl: 3600;                    // 1 hour
    perUser: true;
  };
  
  // Trending
  trending: {
    ttl: 3600;                    // 1 hour (updated hourly)
    global: true;
  };
  
  // Featured content
  featured: {
    ttl: 300;                     // 5 minutes
  };
}
```

---

## Testing

### Unit Tests

```typescript
describe('Asset Processing', () => {
  describe('Image Processing', () => {
    it('should generate all required variants', async () => {
      const buffer = await readFile('test-fixtures/image.jpg');
      const result = await processor.processImage('test-id', buffer);
      
      expect(result.variants).toHaveProperty('thumbnail');
      expect(result.variants).toHaveProperty('medium');
      expect(result.variants).toHaveProperty('large');
      expect(result.variants).toHaveProperty('original');
    });
    
    it('should reject oversized images', async () => {
      const buffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
      
      await expect(processor.processImage('test-id', buffer))
        .rejects.toThrow('exceeds maximum');
    });
    
    it('should generate blurhash for placeholders', async () => {
      const buffer = await readFile('test-fixtures/image.jpg');
      const result = await processor.processImage('test-id', buffer);
      
      expect(result.metadata.blurHash).toBeDefined();
      expect(result.metadata.blurHash).toHaveLength(28);
    });
  });
  
  describe('Audio Processing', () => {
    it('should convert to MP3', async () => {
      const wavBuffer = await readFile('test-fixtures/audio.wav');
      const result = await processor.processAudio('test-id', wavBuffer);
      
      expect(result.storagePath).toEndWith('.mp3');
    });
    
    it('should reject audio over 5 minutes', async () => {
      const longAudio = await readFile('test-fixtures/long-audio.wav');
      
      await expect(processor.processAudio('test-id', longAudio))
        .rejects.toThrow('exceeds 5 minute limit');
    });
  });
});

describe('Version Control', () => {
  describe('createVersion', () => {
    it('should calculate diff from previous version', async () => {
      const adventure = await createTestAdventure();
      await versionService.createVersion(adventure.id, adventure.content, 'manual');
      
      // Modify and create new version
      adventure.content.nodes.push(createTestNode());
      const version = await versionService.createVersion(
        adventure.id, adventure.content, 'manual'
      );
      
      expect(version.diffFromPrevious?.nodesAdded).toHaveLength(1);
    });
    
    it('should skip duplicate content', async () => {
      const adventure = await createTestAdventure();
      const v1 = await versionService.createVersion(adventure.id, adventure.content, 'manual');
      const v2 = await versionService.createVersion(adventure.id, adventure.content, 'manual');
      
      expect(v2.id).toBe(v1.id); // Same version returned
    });
  });
  
  describe('rollback', () => {
    it('should create new version with old content', async () => {
      const adventure = await createTestAdventure();
      const v1 = await versionService.createVersion(adventure.id, adventure.content, 'manual');
      
      adventure.content.title = 'Modified';
      await versionService.createVersion(adventure.id, adventure.content, 'manual');
      
      const rolled = await versionService.rollback(adventure.id, v1.id);
      
      expect(rolled.contentSnapshot.title).toBe(adventure.content.title);
      expect(rolled.changeType).toBe('rollback');
    });
  });
});

describe('Moderation', () => {
  describe('submitFlag', () => {
    it('should auto-restrict critical content', async () => {
      const adventure = await createPublishedAdventure();
      
      await moderationService.submitFlag(
        userId,
        'adventure',
        adventure.id,
        'hate_speech'
      );
      
      const updated = await adventureRepo.get(adventure.id);
      expect(updated.visibility).toBe('restricted');
    });
    
    it('should prevent duplicate flags', async () => {
      const adventure = await createPublishedAdventure();
      
      await moderationService.submitFlag(userId, 'adventure', adventure.id, 'spam');
      
      await expect(
        moderationService.submitFlag(userId, 'adventure', adventure.id, 'spam')
      ).rejects.toThrow('already flagged');
    });
  });
});

describe('Recommendations', () => {
  it('should exclude already-played adventures', async () => {
    const user = await createUserWithPlayHistory(5);
    const recommendations = await recommendationEngine.getRecommendations(user.id, 10);
    
    const playedIds = user.playHistory.map(p => p.adventureId);
    const recommendedIds = recommendations.map(r => r.id);
    
    expect(recommendedIds).not.toEqual(expect.arrayContaining(playedIds));
  });
  
  it('should apply diversity constraints', async () => {
    const recommendations = await recommendationEngine.getRecommendations(userId, 10);
    
    const authorCounts = new Map<string, number>();
    for (const rec of recommendations) {
      const count = (authorCounts.get(rec.authorId) || 0) + 1;
      authorCounts.set(rec.authorId, count);
    }
    
    for (const count of authorCounts.values()) {
      expect(count).toBeLessThanOrEqual(2);
    }
  });
});

describe('Localization', () => {
  it('should calculate completeness percentage', async () => {
    const adventure = await createTestAdventure({ nodeCount: 10 });
    const localization = await localizationService.createLocalization(adventure.id, 'es');
    
    expect(localization.completeness).toBe(0);
    
    // Translate half the nodes
    for (let i = 0; i < 5; i++) {
      await localizationService.updateNodeTranslation(
        adventure.id, 'es', adventure.nodes[i].id,
        { content: 'Translated content' }
      );
    }
    
    const updated = await localizationService.getLocalization(adventure.id, 'es');
    expect(updated.completeness).toBe(50);
  });
  
  it('should fall back to primary language for missing translations', async () => {
    const adventure = await createTestAdventure();
    await localizationService.createLocalization(adventure.id, 'es');
    
    // Only translate title, not description
    await localizationService.updateMetadata(adventure.id, 'es', {
      title: 'Título en español',
    });
    
    const localized = await localizationService.getAdventureInLanguage(adventure.id, 'es');
    
    expect(localized.title).toBe('Título en español');
    expect(localized.description).toBe(adventure.description); // Fallback
  });
});

describe('Analytics', () => {
  it('should identify drop-off points', async () => {
    // Create sessions that frequently abandon at node-3
    const adventure = await createTestAdventure();
    for (let i = 0; i < 10; i++) {
      await analyticsService.trackSessionStart(adventure.id, `user-${i}`);
      await analyticsService.trackNodeVisit(sessionId, 'node-1', 30);
      await analyticsService.trackNodeVisit(sessionId, 'node-2', 30);
      await analyticsService.trackNodeVisit(sessionId, 'node-3', 30);
      
      if (i < 7) {
        await analyticsService.trackSessionEnd(sessionId, 'abandoned');
      } else {
        await analyticsService.trackNodeVisit(sessionId, 'node-4', 30);
        await analyticsService.trackSessionEnd(sessionId, 'victory');
      }
    }
    
    const nodeAnalytics = await analyticsService.getNodeAnalytics(adventure.id);
    const node3 = nodeAnalytics.find(n => n.nodeId === 'node-3');
    
    expect(node3?.isDropOffPoint).toBe(true);
  });
});
```

### Integration Tests

```typescript
describe('CMS Integration', () => {
  it('should handle complete asset upload flow', async () => {
    // 1. Upload
    const uploadResponse = await api.post('/assets/upload', {
      file: testImageBuffer,
      name: 'test-image.jpg',
    });
    expect(uploadResponse.status).toBe(201);
    const { assetId } = uploadResponse.data;
    
    // 2. Wait for processing
    await waitForAssetReady(assetId);
    
    // 3. Verify variants
    const asset = await api.get(`/assets/${assetId}`);
    expect(asset.data.status).toBe('ready');
    expect(asset.data.variants.thumbnail).toBeDefined();
    
    // 4. Verify CDN access
    const cdnResponse = await fetch(asset.data.cdnUrl);
    expect(cdnResponse.status).toBe(200);
  });
  
  it('should maintain version history through edits', async () => {
    const adventure = await createTestAdventure();
    
    // Make multiple edits
    for (let i = 0; i < 5; i++) {
      adventure.content.title = `Version ${i}`;
      await api.put(`/adventures/${adventure.id}`, adventure.content);
    }
    
    // Check version history
    const versions = await api.get(`/adventures/${adventure.id}/versions`);
    expect(versions.data.length).toBeGreaterThanOrEqual(5);
    
    // Rollback to version 2
    const v2 = versions.data.find(v => v.contentSnapshot.title === 'Version 2');
    await api.post(`/adventures/${adventure.id}/rollback`, { versionId: v2.id });
    
    // Verify rollback
    const current = await api.get(`/adventures/${adventure.id}`);
    expect(current.data.title).toBe('Version 2');
  });
});
```

---

## Appendix

### Storage Quotas by Plan

| Plan | Storage | Assets/Adventure | Max File Size |
|------|---------|------------------|---------------|
| Free | 100 MB | 50 | 5 MB |
| Pro | 1 GB | 100 | 10 MB |
| Partner | 10 GB | 500 | 25 MB |

### Supported Languages

| Code | Language | Direction | UI Support |
|------|----------|-----------|------------|
| en | English | LTR | ✅ |
| es | Spanish | LTR | ✅ |
| fr | French | LTR | ✅ |
| de | German | LTR | ✅ |
| pt | Portuguese | LTR | ✅ |
| ja | Japanese | LTR | ✅ |
| ko | Korean | LTR | ✅ |
| zh | Chinese | LTR | ✅ |
| ar | Arabic | RTL | ✅ |
| he | Hebrew | RTL | ✅ |

### Flag Reason Definitions

| Reason | Description | Default Priority |
|--------|-------------|------------------|
| inappropriate_content | Adult/explicit content | Medium |
| harassment | Targeting individuals | High |
| copyright_violation | Stolen content/IP | High |
| spam | Low-effort/promotional | Low |
| misleading | False information | Medium |
| hate_speech | Discrimination/bigotry | Critical |
| violence | Graphic violence/gore | Critical |
| other | Requires manual review | Low |

### Trending Score Formula

```
TrendingScore = (
  (recentPlays × 1.0) +
  (recentCompletions × 2.0) +
  (recentRatings × 1.5) +
  (ratingVelocity × 10.0)
) × timeDecayFactor

timeDecayFactor = 1 / (1 + daysSincePublish × 0.1)
```
