# Adventure Forge Technical Architecture

## System Architecture Overview

The Adventure Forge requires a sophisticated backend architecture to support real-time collaboration, complex validation, version control, and high-performance node-based operations. This document outlines the complete technical architecture for the SPARC RPG Adventure Forge system.

## Architecture Principles

### Core Requirements
1. **Real-Time Collaboration** - Multiple users editing adventures simultaneously
2. **High Performance** - Sub-100ms response times for node operations
3. **Scalability** - Support 10,000+ concurrent users and 100,000+ adventures
4. **Data Integrity** - ACID transactions for critical adventure operations
5. **Mobile Optimization** - Efficient data sync for mobile devices

### System Design Patterns
- **Event-Driven Architecture** for real-time updates
- **CQRS** (Command Query Responsibility Segregation) for read/write optimization
- **Microservices** for independent scaling of different features
- **Event Sourcing** for complete audit trails and version control

## Core Service Architecture

### 1. Adventure Management Service

**Responsibilities**
- Adventure CRUD operations
- Node and connection management
- Version control and branching
- Publishing and sharing workflows

**Data Model**
```typescript
// Core Adventure Schema
interface Adventure {
  id: string;
  title: string;
  authorId: string;
  status: 'draft' | 'published' | 'archived';
  version: number;
  
  // Canvas State
  canvas: {
    viewport: CanvasViewport;
    nodes: AdventureNode[];
    connections: NodeConnection[];
  };
  
  // Metadata
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date;
    estimatedPlaytime: number; // minutes
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    tags: string[];
  };
  
  // Collaboration
  collaborators: CollaboratorInfo[];
  shareSettings: ShareSettings;
}

// Node Storage Schema  
interface AdventureNode {
  id: string;
  adventureId: string;
  type: NodeType;
  position: { x: number; y: number };
  
  // Polymorphic properties based on type
  properties: StoryProperties | DecisionProperties | ChallengeProperties | CombatProperties | CheckProperties;
  
  // System fields
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

// Connection Schema
interface NodeConnection {
  id: string;
  adventureId: string;
  sourceNodeId: string;
  sourcePort: string;
  targetNodeId: string;
  targetPort: string;
  
  // Visual routing data
  pathData: {
    controlPoints: Point[];
    style: ConnectionStyle;
  };
  
  // Metadata
  createdAt: Date;
  createdBy: string;
}
```

**API Endpoints**
```typescript
// Adventure Management
POST   /api/v1/adventures                    // Create adventure
GET    /api/v1/adventures/{id}               // Get adventure
PUT    /api/v1/adventures/{id}               // Update adventure
DELETE /api/v1/adventures/{id}               // Delete adventure
POST   /api/v1/adventures/{id}/publish       // Publish adventure
POST   /api/v1/adventures/{id}/duplicate     // Duplicate adventure

// Node Operations
POST   /api/v1/adventures/{id}/nodes         // Add node
PUT    /api/v1/adventures/{id}/nodes/{nodeId} // Update node
DELETE /api/v1/adventures/{id}/nodes/{nodeId} // Delete node
POST   /api/v1/adventures/{id}/nodes/bulk    // Bulk node operations

// Connection Operations  
POST   /api/v1/adventures/{id}/connections   // Create connection
DELETE /api/v1/adventures/{id}/connections/{connId} // Delete connection

// Validation
POST   /api/v1/adventures/{id}/validate      // Validate adventure
GET    /api/v1/adventures/{id}/validation-status // Get validation state
```

### 2. Real-Time Collaboration Service

**Architecture Pattern: Event-Driven WebSocket System**

```typescript
// WebSocket Event Types
enum CollaborationEvent {
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
  NODE_UPDATED = 'node_updated',  
  NODE_CREATED = 'node_created',
  NODE_DELETED = 'node_deleted',
  CONNECTION_CREATED = 'connection_created',
  CONNECTION_DELETED = 'connection_deleted',
  CURSOR_MOVED = 'cursor_moved',
  SELECTION_CHANGED = 'selection_changed',
  CONFLICT_DETECTED = 'conflict_detected'
}

// Event Payload Structures
interface NodeUpdatedEvent {
  type: CollaborationEvent.NODE_UPDATED;
  adventureId: string;
  nodeId: string;
  changes: Partial<AdventureNode>;
  userId: string;
  timestamp: Date;
  version: number;
}

interface ConflictDetectedEvent {
  type: CollaborationEvent.CONFLICT_DETECTED;
  adventureId: string;
  conflictingChanges: ConflictInfo[];
  resolution: ConflictResolution;
}
```

**Operational Transform System**
```typescript
// Conflict Resolution Engine
class OperationalTransform {
  // Transform operations based on concurrent changes
  transformOperation(
    localOp: Operation,
    remoteOp: Operation,
    priority: 'local' | 'remote'
  ): TransformedOperation;
  
  // Resolve position conflicts when nodes moved simultaneously
  resolvePositionConflict(
    node1: NodePosition,
    node2: NodePosition
  ): ResolvedPosition;
  
  // Merge text changes using three-way merge
  mergeTextChanges(
    base: string,
    local: string, 
    remote: string
  ): MergedText;
}
```

**Collaboration State Management**
```typescript
interface CollaborationSession {
  adventureId: string;
  activeUsers: ConnectedUser[];
  lockManager: ResourceLockManager;
  operationQueue: OperationQueue;
  conflictResolver: ConflictResolver;
}

interface ConnectedUser {
  userId: string;
  socketId: string;
  cursor: { x: number; y: number };
  selectedNodes: string[];
  lockedResources: string[];
  lastActivity: Date;
}
```

### 3. Validation Service

**Real-Time Validation Engine**
```typescript
// Validation Rule System
abstract class ValidationRule {
  abstract id: string;
  abstract severity: 'error' | 'warning';
  abstract description: string;
  
  abstract validate(adventure: Adventure): ValidationResult;
  abstract suggestFix(adventure: Adventure): ValidationSuggestion;
}

// Core Validation Rules
class VictoryPathRule extends ValidationRule {
  id = 'victory-path-required';
  severity = 'error' as const;
  description = 'Adventure must have at least one path to victory';
  
  validate(adventure: Adventure): ValidationResult {
    const hasVictoryPath = this.findVictoryPaths(adventure.canvas.nodes);
    return {
      passed: hasVictoryPath.length > 0,
      message: hasVictoryPath.length === 0 ? 'No victory condition found' : undefined,
      affectedNodes: hasVictoryPath.length === 0 ? this.getTerminalNodes(adventure) : []
    };
  }
}

class OrphanedNodesRule extends ValidationRule {
  id = 'orphaned-nodes';
  severity = 'warning' as const;
  description = 'All nodes should be reachable from the start';
  
  validate(adventure: Adventure): ValidationResult {
    const orphanedNodes = this.findOrphanedNodes(adventure);
    return {
      passed: orphanedNodes.length === 0,
      message: `${orphanedNodes.length} unreachable nodes found`,
      affectedNodes: orphanedNodes
    };
  }
}
```

**Validation API Design**
```typescript
// Validation Service Interface
interface ValidationService {
  // Real-time validation during editing
  validateIncremental(
    adventureId: string,
    changes: AdventureChange[]
  ): Promise<ValidationResult>;
  
  // Full validation before publishing
  validateComplete(adventureId: string): Promise<CompleteValidationResult>;
  
  // Get validation suggestions
  getSuggestions(
    adventureId: string,
    errors: ValidationError[]
  ): Promise<ValidationSuggestion[]>;
  
  // Auto-fix common issues
  autoFix(
    adventureId: string,
    fixIds: string[]
  ): Promise<AutoFixResult>;
}
```

### 4. Content Management Service

**Creature & Item Integration**
```typescript
// Content Library Integration
interface ContentLibraryService {
  // Creature Management
  getCreatures(filters: CreatureFilters): Promise<Creature[]>;
  getCreatureById(creatureId: string): Promise<Creature>;
  searchCreatures(query: string): Promise<CreatureSearchResult[]>;
  
  // Item Management  
  getItems(filters: ItemFilters): Promise<Item[]>;
  getItemById(itemId: string): Promise<Item>;
  searchItems(query: string): Promise<ItemSearchResult[]>;
  
  // Template Management
  getAdventureTemplates(): Promise<AdventureTemplate[]>;
  createFromTemplate(templateId: string, customizations: TemplateCustomization): Promise<Adventure>;
}

// Rich Content Storage
interface MediaService {
  uploadImage(file: File, adventureId: string): Promise<ImageUploadResult>;
  getImageUrl(imageId: string, size?: 'thumbnail' | 'medium' | 'full'): string;
  deleteImage(imageId: string): Promise<void>;
  
  // Image processing for different display contexts
  processForDisplay(imageId: string, context: 'node' | 'player' | 'thumbnail'): Promise<ProcessedImage>;
}
```

### 5. Performance Optimization Service

**Caching Strategy**
```typescript
// Multi-Layer Caching System
interface CacheService {
  // Redis for session data and real-time collaboration
  sessionCache: RedisCache;
  
  // CDN for static assets (images, templates)
  cdnCache: CDNCache;
  
  // Database query cache for frequent operations
  queryCache: QueryCache;
  
  // Client-side cache coordination
  clientCache: ClientCacheManager;
}

// Database Optimization
interface DatabaseOptimization {
  // Spatial indexing for canvas queries
  spatialIndex: SpatialIndex;
  
  // Connection queries optimization
  connectionIndex: GraphIndex;
  
  // Version control optimization
  versionIndex: VersionIndex;
  
  // Full-text search for adventure content
  searchIndex: SearchIndex;
}
```

**Scalability Architecture**
```typescript
// Load Balancing Strategy
interface LoadBalancer {
  // Route collaboration sessions to specific servers
  collaborationRouter: ConsistentHashRouter;
  
  // API load balancing with health checks
  apiLoadBalancer: RoundRobinRouter;
  
  // Database read replicas
  databaseRouter: ReadWriteSplitRouter;
  
  // WebSocket connection management
  websocketBalancer: StickySessionRouter;
}
```

## Database Schema Design

### PostgreSQL Schema (Primary Data)
```sql
-- Adventures table
CREATE TABLE adventures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  author_id UUID NOT NULL,
  status adventure_status NOT NULL DEFAULT 'draft',
  version INTEGER NOT NULL DEFAULT 1,
  canvas_data JSONB NOT NULL,
  metadata JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for performance
  INDEX idx_adventures_author (author_id),
  INDEX idx_adventures_status (status),
  INDEX idx_adventures_updated (updated_at DESC)
);

-- Nodes table (normalized for better querying)
CREATE TABLE adventure_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adventure_id UUID NOT NULL REFERENCES adventures(id) ON DELETE CASCADE,
  node_type node_type_enum NOT NULL,
  position POINT NOT NULL,
  properties JSONB NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,
  
  -- Spatial index for canvas queries
  INDEX idx_nodes_position USING GIST (position),
  INDEX idx_nodes_adventure (adventure_id),
  INDEX idx_nodes_type (node_type)
);

-- Connections table
CREATE TABLE node_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adventure_id UUID NOT NULL REFERENCES adventures(id) ON DELETE CASCADE,
  source_node_id UUID NOT NULL REFERENCES adventure_nodes(id) ON DELETE CASCADE,
  source_port VARCHAR(50) NOT NULL,
  target_node_id UUID NOT NULL REFERENCES adventure_nodes(id) ON DELETE CASCADE,
  target_port VARCHAR(50) NOT NULL,
  path_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Graph traversal optimization
  INDEX idx_connections_source (source_node_id),
  INDEX idx_connections_target (target_node_id),
  INDEX idx_connections_adventure (adventure_id)
);
```

### Redis Schema (Real-Time Data)
```typescript
// Collaboration Sessions
interface RedisCollaborationData {
  [`session:${adventureId}`]: {
    activeUsers: ConnectedUser[];
    lastActivity: Date;
    lockState: ResourceLockState;
  };
  
  // Operation queues for conflict resolution
  [`operations:${adventureId}`]: Operation[];
  
  // User cursors and selections
  [`user:${userId}:${adventureId}`]: {
    cursor: Point;
    selection: string[];
    lastSeen: Date;
  };
}
```

## Security Architecture

### Authentication & Authorization
```typescript
// Role-Based Access Control
enum AdventureRole {
  OWNER = 'owner',
  EDITOR = 'editor', 
  VIEWER = 'viewer'
}

interface AdventurePermissions {
  adventureId: string;
  userId: string;
  role: AdventureRole;
  permissions: {
    read: boolean;
    write: boolean;
    delete: boolean;
    publish: boolean;
    share: boolean;
  };
}

// JWT Token Structure
interface AdventureToken {
  userId: string;
  adventurePermissions: AdventurePermissions[];
  sessionId: string;
  expiresAt: Date;
}
```

### Data Protection
- **Encryption**: All adventure data encrypted at rest (AES-256)
- **Network Security**: TLS 1.3 for all API communications
- **Input Validation**: Comprehensive sanitization of all user input
- **Rate Limiting**: API rate limits per user and IP address
- **Audit Logging**: Complete audit trail of all adventure modifications

## Monitoring & Observability

### Key Metrics
```typescript
// Performance Metrics
interface PerformanceMetrics {
  // API Response Times
  apiLatency: {
    p50: number;
    p95: number;
    p99: number;
  };
  
  // Collaboration Performance
  collaborationLatency: {
    eventPropagation: number;
    conflictResolution: number;
    userSyncTime: number;
  };
  
  // Database Performance
  databaseMetrics: {
    queryTime: number;
    connectionPoolUsage: number;
    cacheHitRate: number;
  };
}

// Business Metrics
interface BusinessMetrics {
  adventuresCreated: number;
  adventuresPublished: number;
  activeCollaborations: number;
  averageAdventureComplexity: number;
  validationErrorRate: number;
}
```

### Error Handling & Recovery
```typescript
// Circuit Breaker Pattern
class ServiceCircuitBreaker {
  private failureThreshold = 5;
  private timeout = 30000; // 30 seconds
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      throw new Error('Circuit breaker is open');
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
}
```

## Deployment Architecture

### Container Strategy
```yaml
# Docker Compose for Development
version: '3.8'
services:
  adventure-api:
    build: ./services/adventure-api
    ports: [8181:8181]
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    
  collaboration-service:
    build: ./services/collaboration
    ports: [8182:8182]
    environment:
      - REDIS_URL=${REDIS_URL}
      - WEBSOCKET_ORIGINS=${ALLOWED_ORIGINS}
      
  validation-service:
    build: ./services/validation
    ports: [8183:8183]
    environment:
      - DATABASE_URL=${DATABASE_URL}
```

### Production Infrastructure
- **Kubernetes** for container orchestration
- **NGINX** for load balancing and SSL termination
- **PostgreSQL** with read replicas for database scaling
- **Redis Cluster** for session management and caching
- **AWS S3** for image storage with CloudFront CDN

This technical architecture provides a robust foundation for the Adventure Forge system, supporting real-time collaboration, complex validation, and high-performance node-based operations while maintaining scalability and security.