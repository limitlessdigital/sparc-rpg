# Real-Time Collaboration API Specification

## Overview

The SPARC Adventure Forge real-time collaboration system enables multiple users to simultaneously edit adventures with conflict resolution, live cursors, and seamless synchronization. This document provides comprehensive API specifications for implementing collaborative editing.

## WebSocket Connection Architecture

### Connection Establishment

**WebSocket Endpoint**: `wss://api.sparcrpg.com/v1/collaboration`

**Authentication Flow**
```typescript
// 1. Client initiates connection with JWT token
const socket = new WebSocket(`wss://api.sparcrpg.com/v1/collaboration?token=${jwtToken}`);

// 2. Server validates token and responds with session info
interface ConnectionResponse {
  type: 'connection_established';
  sessionId: string;
  userId: string;
  permissions: CollaborationPermissions;
  timestamp: Date;
}

// 3. Client joins specific adventure
socket.send({
  type: 'join_adventure',
  adventureId: 'uuid-here',
  lastKnownVersion: number
});
```

**Connection States**
```typescript
enum ConnectionState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  SYNCHRONIZED = 'synchronized',
  CONFLICT = 'conflict',
  DISCONNECTED = 'disconnected',
  ERROR = 'error'
}
```

## Core Event System

### Event Types & Payloads

**Base Event Structure**
```typescript
interface BaseCollaborationEvent {
  type: string;
  adventureId: string;
  userId: string;
  timestamp: Date;
  version: number;
  sessionId: string;
}
```

### User Presence Events

**User Joined Adventure**
```typescript
interface UserJoinedEvent extends BaseCollaborationEvent {
  type: 'user_joined';
  user: {
    id: string;
    name: string;
    avatar?: string;
    color: string; // Assigned cursor color
    permissions: CollaborationPermissions;
  };
  initialState: {
    cursor: Point;
    viewport: CanvasViewport;
    selection: string[];
  };
}
```

**User Left Adventure**
```typescript
interface UserLeftEvent extends BaseCollaborationEvent {
  type: 'user_left';
  userId: string;
  reason: 'disconnect' | 'intentional' | 'timeout';
}
```

**Cursor Movement**
```typescript
interface CursorMovedEvent extends BaseCollaborationEvent {
  type: 'cursor_moved';
  position: Point;
  viewport?: CanvasViewport; // Optional viewport sync
  throttled: boolean; // Indicates if this is a throttled update
}

// Throttling: Max 30 cursor updates per second
const CURSOR_THROTTLE_MS = 33;
```

**Selection Changed**
```typescript
interface SelectionChangedEvent extends BaseCollaborationEvent {
  type: 'selection_changed';
  selectedNodes: string[];
  selectionType: 'single' | 'multiple' | 'rubber_band';
  selectionBounds?: Rectangle; // For visual selection indicators
}
```

### Content Modification Events

**Node Operations**
```typescript
// Node Created
interface NodeCreatedEvent extends BaseCollaborationEvent {
  type: 'node_created';
  node: AdventureNode;
  operation: {
    method: 'drag_from_palette' | 'duplicate' | 'paste';
    sourceData?: any;
  };
}

// Node Updated  
interface NodeUpdatedEvent extends BaseCollaborationEvent {
  type: 'node_updated';
  nodeId: string;
  changes: Partial<AdventureNode>;
  changeType: 'position' | 'properties' | 'both';
  
  // For operational transform
  basedOnVersion: number;
  dependencies: string[]; // Other nodes this change depends on
}

// Node Deleted
interface NodeDeletedEvent extends BaseCollaborationEvent {
  type: 'node_deleted';
  nodeId: string;
  cascadeDeleted: string[]; // Connections that were also deleted
  softDelete: boolean; // Whether this can be undone
}

// Bulk Operations
interface BulkNodeOperationEvent extends BaseCollaborationEvent {
  type: 'bulk_node_operation';
  operation: 'copy' | 'cut' | 'paste' | 'delete' | 'move';
  nodeIds: string[];
  operationData: {
    targetPosition?: Point;
    sourceAdventureId?: string;
    grouping?: string;
  };
}
```

**Connection Operations**
```typescript
// Connection Created
interface ConnectionCreatedEvent extends BaseCollaborationEvent {
  type: 'connection_created';
  connection: NodeConnection;
  validationPassed: boolean;
  warningsGenerated: ValidationWarning[];
}

// Connection Deleted
interface ConnectionDeletedEvent extends BaseCollaborationEvent {
  type: 'connection_deleted';
  connectionId: string;
  sourceNodeId: string;
  targetNodeId: string;
  reason: 'user_action' | 'node_deleted' | 'validation_failure';
}
```

### Conflict Resolution Events

**Operation Conflict Detected**
```typescript
interface OperationConflictEvent extends BaseCollaborationEvent {
  type: 'operation_conflict';
  conflictId: string;
  conflictType: 'concurrent_edit' | 'position_overlap' | 'connection_conflict';
  
  localOperation: Operation;
  remoteOperation: Operation;
  
  // Suggested resolutions
  resolutionOptions: ConflictResolution[];
  autoResolve: boolean; // Whether system can auto-resolve
  timeoutMs: number; // How long to wait for user resolution
}

interface ConflictResolution {
  id: string;
  description: string;
  result: 'accept_local' | 'accept_remote' | 'merge' | 'create_variant';
  preview?: any; // Preview of the resolution result
}
```

**Conflict Resolution Response**
```typescript
interface ConflictResolvedEvent extends BaseCollaborationEvent {
  type: 'conflict_resolved';
  conflictId: string;
  resolution: ConflictResolution;
  resultingOperations: Operation[];
  affectedNodes: string[];
}
```

## Operational Transform System

### Operation Types
```typescript
// Base Operation Interface
interface Operation {
  id: string;
  type: OperationType;
  userId: string;
  timestamp: Date;
  basedOnVersion: number;
  
  // For operational transform
  dependencies: string[];
  priority: number;
}

enum OperationType {
  // Node operations
  NODE_CREATE = 'node_create',
  NODE_UPDATE = 'node_update',
  NODE_DELETE = 'node_delete',
  NODE_MOVE = 'node_move',
  
  // Connection operations
  CONNECTION_CREATE = 'connection_create',
  CONNECTION_DELETE = 'connection_delete',
  
  // Text operations
  TEXT_INSERT = 'text_insert',
  TEXT_DELETE = 'text_delete',
  TEXT_FORMAT = 'text_format',
  
  // Canvas operations
  VIEWPORT_CHANGE = 'viewport_change'
}
```

### Transform Functions
```typescript
// Operational Transform Engine
class OperationalTransform {
  /**
   * Transform operation against another concurrent operation
   */
  transform(
    localOp: Operation,
    remoteOp: Operation,
    priority: 'local' | 'remote'
  ): TransformResult {
    
    // Position conflicts - adjust positions to avoid overlap
    if (localOp.type === 'NODE_MOVE' && remoteOp.type === 'NODE_MOVE') {
      return this.resolvePositionConflict(localOp, remoteOp, priority);
    }
    
    // Text editing conflicts - use three-way merge
    if (localOp.type === 'TEXT_INSERT' && remoteOp.type === 'TEXT_INSERT') {
      return this.resolveTextConflict(localOp, remoteOp);
    }
    
    // Property editing conflicts - last-writer-wins with merge
    if (localOp.type === 'NODE_UPDATE' && remoteOp.type === 'NODE_UPDATE') {
      return this.mergeNodeProperties(localOp, remoteOp, priority);
    }
    
    return { transformed: localOp, conflicts: [] };
  }
  
  private resolvePositionConflict(
    localOp: NodeMoveOperation,
    remoteOp: NodeMoveOperation,
    priority: 'local' | 'remote'
  ): TransformResult {
    // If nodes would overlap, offset the lower-priority operation
    const OVERLAP_THRESHOLD = 20; // pixels
    const OFFSET_DISTANCE = 50;
    
    const distance = this.calculateDistance(
      localOp.newPosition,
      remoteOp.newPosition
    );
    
    if (distance < OVERLAP_THRESHOLD) {
      const offsetDirection = priority === 'local' ? 
        this.calculateOffsetVector(remoteOp.newPosition, localOp.newPosition) :
        this.calculateOffsetVector(localOp.newPosition, remoteOp.newPosition);
      
      const adjustedOp = {
        ...localOp,
        newPosition: {
          x: localOp.newPosition.x + (offsetDirection.x * OFFSET_DISTANCE),
          y: localOp.newPosition.y + (offsetDirection.y * OFFSET_DISTANCE)
        }
      };
      
      return {
        transformed: adjustedOp,
        conflicts: [{
          type: 'position_adjusted',
          reason: 'overlap_prevention',
          originalPosition: localOp.newPosition,
          adjustedPosition: adjustedOp.newPosition
        }]
      };
    }
    
    return { transformed: localOp, conflicts: [] };
  }
}
```

## Real-Time Synchronization Protocol

### Message Queuing & Ordering
```typescript
// Message Queue System
class CollaborationMessageQueue {
  private queue: QueuedMessage[] = [];
  private processing = false;
  
  async enqueue(message: CollaborationMessage): Promise<void> {
    // Add message to queue with ordering info
    const queuedMessage: QueuedMessage = {
      ...message,
      queuedAt: Date.now(),
      dependencies: this.extractDependencies(message),
      priority: this.calculatePriority(message)
    };
    
    this.queue.push(queuedMessage);
    this.queue.sort((a, b) => {
      // Sort by version first, then by priority, then by timestamp
      if (a.version !== b.version) return a.version - b.version;
      if (a.priority !== b.priority) return b.priority - a.priority;
      return a.queuedAt - b.queuedAt;
    });
    
    if (!this.processing) {
      this.processQueue();
    }
  }
  
  private async processQueue(): Promise<void> {
    this.processing = true;
    
    while (this.queue.length > 0) {
      const message = this.queue[0];
      
      // Check if all dependencies are satisfied
      if (!this.dependenciesSatisfied(message)) {
        // Wait for dependencies or timeout
        await this.waitForDependencies(message, 5000);
      }
      
      try {
        await this.processMessage(message);
        this.queue.shift(); // Remove processed message
      } catch (error) {
        // Handle processing error
        await this.handleMessageError(message, error);
        this.queue.shift();
      }
    }
    
    this.processing = false;
  }
}
```

### State Synchronization
```typescript
// Adventure State Synchronization
interface AdventureStateSync {
  version: number;
  checksum: string;
  lastModified: Date;
  
  // Incremental updates
  deltaUpdates: DeltaUpdate[];
  
  // Full state for new joiners
  fullState?: AdventureState;
}

interface DeltaUpdate {
  version: number;
  operations: Operation[];
  affectedNodes: string[];
  affectedConnections: string[];
  
  // For conflict detection
  basedOnVersion: number;
  author: string;
  timestamp: Date;
}
```

## Error Handling & Recovery

### Connection Recovery
```typescript
// Reconnection Strategy
class ConnectionRecovery {
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  
  async handleDisconnection(reason: DisconnectionReason): Promise<void> {
    // Store unsent operations locally
    await this.storeUnsentOperations();
    
    // Attempt reconnection with exponential backoff
    while (this.reconnectAttempts < this.maxReconnectAttempts) {
      try {
        await this.sleep(this.reconnectDelay);
        await this.reconnect();
        
        // Sync operations that occurred during disconnection
        await this.syncAfterReconnection();
        return;
        
      } catch (error) {
        this.reconnectAttempts++;
        this.reconnectDelay *= 2; // Exponential backoff
      }
    }
    
    // Max attempts reached - show offline mode
    this.enterOfflineMode();
  }
  
  private async syncAfterReconnection(): Promise<void> {
    // Get server state since last known version
    const serverState = await this.getServerStateSince(this.lastKnownVersion);
    
    // Get local operations that occurred during disconnection
    const localOperations = await this.getUnsentOperations();
    
    // Resolve conflicts between local and server operations
    const resolvedOperations = await this.resolveReconnectionConflicts(
      localOperations,
      serverState.operations
    );
    
    // Apply resolved operations
    await this.applyOperations(resolvedOperations);
  }
}
```

### Data Integrity Checks
```typescript
// Periodic State Validation
class StateIntegrityChecker {
  private checkInterval = 30000; // 30 seconds
  
  startPeriodicChecks(): void {
    setInterval(() => {
      this.performIntegrityCheck();
    }, this.checkInterval);
  }
  
  private async performIntegrityCheck(): Promise<void> {
    // Calculate local state checksum
    const localChecksum = this.calculateStateChecksum();
    
    // Get server checksum
    const serverChecksum = await this.getServerChecksum();
    
    if (localChecksum !== serverChecksum) {
      // State mismatch detected
      await this.handleStateMismatch();
    }
  }
  
  private async handleStateMismatch(): Promise<void> {
    // Request full state resync from server
    const serverState = await this.requestFullStateSync();
    
    // Merge with local unsaved changes
    const mergedState = await this.mergeWithLocalChanges(serverState);
    
    // Update local state
    await this.updateLocalState(mergedState);
    
    // Notify user of sync
    this.notifyStateResync();
  }
}
```

## API Rate Limiting & Throttling

### Rate Limiting Configuration
```typescript
// Rate Limiting Rules
const COLLABORATION_RATE_LIMITS = {
  // Cursor movement updates
  cursor_moved: {
    maxPerSecond: 30,
    burstSize: 5,
    throttleMethod: 'sliding_window'
  },
  
  // Node operations
  node_operations: {
    maxPerMinute: 120,
    burstSize: 10,
    throttleMethod: 'token_bucket'
  },
  
  // Text editing
  text_operations: {
    maxPerSecond: 10,
    burstSize: 20,
    throttleMethod: 'adaptive' // Adapts based on content length
  },
  
  // Connection operations
  connection_operations: {
    maxPerMinute: 60,
    burstSize: 5,
    throttleMethod: 'leaky_bucket'
  }
};
```

### Adaptive Throttling
```typescript
// Smart Throttling Based on Activity
class AdaptiveThrottler {
  private activityLevel: 'low' | 'medium' | 'high' = 'medium';
  private connectedUsers = 0;
  
  calculateThrottleRate(eventType: string): number {
    const baseRate = COLLABORATION_RATE_LIMITS[eventType].maxPerSecond;
    
    // Adjust based on number of connected users
    const userMultiplier = Math.max(0.3, 1 - (this.connectedUsers * 0.1));
    
    // Adjust based on activity level
    const activityMultiplier = {
      low: 1.2,
      medium: 1.0,
      high: 0.8
    }[this.activityLevel];
    
    return baseRate * userMultiplier * activityMultiplier;
  }
  
  updateActivityLevel(recentEvents: CollaborationEvent[]): void {
    const eventsPerMinute = recentEvents.length;
    
    if (eventsPerMinute < 10) {
      this.activityLevel = 'low';
    } else if (eventsPerMinute < 50) {
      this.activityLevel = 'medium';
    } else {
      this.activityLevel = 'high';
    }
  }
}
```

## Security & Privacy

### Permission Validation
```typescript
// Permission Checking for Operations
class CollaborationPermissions {
  static canPerformOperation(
    user: CollaborationUser,
    operation: Operation,
    adventure: Adventure
  ): boolean {
    
    // Check basic adventure permissions
    if (!user.permissions.write) {
      return false;
    }
    
    // Check node-level permissions
    if (operation.type.startsWith('NODE_')) {
      return this.canModifyNode(user, operation.nodeId, adventure);
    }
    
    // Check connection permissions
    if (operation.type.startsWith('CONNECTION_')) {
      return this.canModifyConnections(user, adventure);
    }
    
    return true;
  }
  
  private static canModifyNode(
    user: CollaborationUser,
    nodeId: string,
    adventure: Adventure
  ): boolean {
    const node = adventure.canvas.nodes.find(n => n.id === nodeId);
    
    // Node owner or adventure owner can always modify
    if (node?.createdBy === user.id || adventure.authorId === user.id) {
      return true;
    }
    
    // Check if node is locked by another user
    if (this.isNodeLocked(nodeId) && !this.isLockedByUser(nodeId, user.id)) {
      return false;
    }
    
    return user.permissions.write;
  }
}
```

### Data Sanitization
```typescript
// Input Sanitization for Collaboration Events
class EventSanitizer {
  static sanitizeCollaborationEvent(event: CollaborationEvent): SanitizedEvent {
    // Remove potential XSS from text content
    if (event.type === 'node_updated' && event.changes?.properties) {
      event.changes.properties = this.sanitizeNodeProperties(
        event.changes.properties
      );
    }
    
    // Validate coordinate ranges
    if (event.type === 'cursor_moved') {
      event.position = this.validateCoordinates(event.position);
    }
    
    // Validate node positions
    if (event.type === 'node_created' || event.type === 'node_updated') {
      event.node.position = this.validateCoordinates(event.node.position);
    }
    
    return event as SanitizedEvent;
  }
  
  private static validateCoordinates(point: Point): Point {
    // Ensure coordinates are within reasonable bounds
    const MAX_COORDINATE = 100000;
    const MIN_COORDINATE = -100000;
    
    return {
      x: Math.max(MIN_COORDINATE, Math.min(MAX_COORDINATE, point.x)),
      y: Math.max(MIN_COORDINATE, Math.min(MAX_COORDINATE, point.y))
    };
  }
}
```

## Performance Monitoring

### Real-Time Metrics
```typescript
// Collaboration Performance Metrics
interface CollaborationMetrics {
  // Latency metrics
  averageEventPropagationTime: number;
  conflictResolutionTime: number;
  stateSync95thPercentile: number;
  
  // Throughput metrics
  eventsPerSecond: number;
  concurrentCollaborators: number;
  peakCollaboratorCount: number;
  
  // Error metrics
  connectionDropRate: number;
  conflictRate: number;
  stateDesyncEvents: number;
  
  // Resource usage
  memoryUsagePerSession: number;
  cpuUsagePerCollaborator: number;
  networkBandwidthPerUser: number;
}
```

This comprehensive collaboration API provides the foundation for seamless real-time editing in the Adventure Forge, handling complex scenarios like conflict resolution, offline recovery, and multi-user coordination while maintaining performance and security.