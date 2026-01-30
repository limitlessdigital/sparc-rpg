# PRD 10: Connection Engine

> **Status**: ✅ Implemented  
> **Priority**: P0 - Critical Path  
> **Estimated Effort**: 3 days (completed)  
> **Dependencies**: 09-node-system

---

## Overview

The Connection Engine manages links between adventure nodes, creating the branching narrative structure. Connections define how players progress through the adventure, with different connection types for success/failure paths, choices, and conditional transitions.

### Implemented Features
- ✅ Bezier curve rendering
- ✅ Connection type styling (success/failure/choice)
- ✅ Interactive connection creation
- ✅ Connection validation
- ✅ Connection labels

---

## Technical Specification

### Data Model

```typescript
interface NodeConnection {
  id: string;
  adventureId: string;
  sourceNodeId: string;
  sourcePort: string;             // 'next', 'success', 'failure', 'choice-1', etc.
  targetNodeId: string;
  connectionType: ConnectionType;
  label?: string;                 // Display text on connection
  conditions?: ConnectionCondition[];
}

type ConnectionType = 
  | 'default'     // Standard flow (gray)
  | 'success'     // Success outcome (green)
  | 'failure'     // Failure outcome (red)
  | 'choice';     // Decision branch (purple)

interface ConnectionCondition {
  type: 'flag' | 'item' | 'variable';
  name: string;
  operator: '==' | '!=' | 'exists' | 'not_exists';
  value?: string | number | boolean;
}
```

### Connection Rendering

```typescript
interface ConnectionProps {
  connection: NodeConnection;
  sourceNode: AdventureNode;
  targetNode: AdventureNode;
  isSelected: boolean;
  zoom: number;
}

function Connection({ connection, sourceNode, targetNode, isSelected, zoom }: ConnectionProps) {
  // Calculate port positions
  const sourcePort = getPortPosition(sourceNode, connection.sourcePort);
  const targetPort = getPortPosition(targetNode, 'in');
  
  // Generate bezier curve
  const path = generateBezierPath(sourcePort, targetPort);
  
  const config = CONNECTION_CONFIGS[connection.connectionType];
  
  return (
    <g className={cn('connection', isSelected && 'selected')}>
      {/* Invisible wider path for click target */}
      <path
        d={path}
        stroke="transparent"
        strokeWidth={20}
        fill="none"
        className="connection-hitbox"
      />
      
      {/* Visible connection line */}
      <path
        d={path}
        stroke={config.color}
        strokeWidth={2 / zoom}
        strokeDasharray={config.dashArray}
        fill="none"
        markerEnd={`url(#arrow-${connection.connectionType})`}
      />
      
      {/* Label */}
      {connection.label && (
        <ConnectionLabel
          path={path}
          label={connection.label}
          color={config.color}
        />
      )}
      
      {/* Condition indicator */}
      {connection.conditions?.length > 0 && (
        <ConditionIndicator
          position={getMidpoint(sourcePort, targetPort)}
          conditions={connection.conditions}
        />
      )}
    </g>
  );
}

const CONNECTION_CONFIGS: Record<ConnectionType, ConnectionConfig> = {
  default: {
    color: '#6B7280',
    dashArray: undefined,
    label: 'Next',
  },
  success: {
    color: '#22C55E',
    dashArray: undefined,
    label: 'Success',
  },
  failure: {
    color: '#EF4444',
    dashArray: '5,5',
    label: 'Failure',
  },
  choice: {
    color: '#8B5CF6',
    dashArray: undefined,
    label: undefined,
  },
};
```

### Bezier Curve Generation

```typescript
function generateBezierPath(start: Point, end: Point): string {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  
  // Control point offset based on distance
  const controlOffset = Math.min(Math.abs(dx) * 0.5, 150);
  
  // For horizontal layouts
  const cp1 = {
    x: start.x + controlOffset,
    y: start.y,
  };
  
  const cp2 = {
    x: end.x - controlOffset,
    y: end.y,
  };
  
  return `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`;
}

function getPortPosition(node: AdventureNode, portId: string): Point {
  const nodeRect = {
    x: node.position.x,
    y: node.position.y,
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
  };
  
  if (portId === 'in') {
    // Input port on left side
    return {
      x: nodeRect.x,
      y: nodeRect.y + nodeRect.height / 2,
    };
  }
  
  // Output ports on right side
  const ports = getOutputPorts(node);
  const portIndex = ports.findIndex(p => p.id === portId);
  const portCount = ports.length;
  const spacing = nodeRect.height / (portCount + 1);
  
  return {
    x: nodeRect.x + nodeRect.width,
    y: nodeRect.y + spacing * (portIndex + 1),
  };
}
```

### Connection Creation Flow

```typescript
function useConnectionCreation() {
  const [creatingConnection, setCreatingConnection] = useState<ConnectionCreationState | null>(null);
  
  const startConnection = (nodeId: string, portId: string, portPosition: Point) => {
    setCreatingConnection({
      sourceNodeId: nodeId,
      sourcePort: portId,
      startPoint: portPosition,
      currentPoint: portPosition,
    });
  };
  
  const updateConnection = (point: Point) => {
    if (!creatingConnection) return;
    setCreatingConnection({
      ...creatingConnection,
      currentPoint: point,
    });
  };
  
  const completeConnection = (targetNodeId: string | null) => {
    if (!creatingConnection || !targetNodeId) {
      setCreatingConnection(null);
      return;
    }
    
    // Validate connection
    const validation = validateConnection(
      creatingConnection.sourceNodeId,
      creatingConnection.sourcePort,
      targetNodeId
    );
    
    if (!validation.isValid) {
      toast.error(validation.error);
      setCreatingConnection(null);
      return;
    }
    
    // Create connection
    const connection: NodeConnection = {
      id: generateId(),
      adventureId: adventure.id,
      sourceNodeId: creatingConnection.sourceNodeId,
      sourcePort: creatingConnection.sourcePort,
      targetNodeId,
      connectionType: getConnectionType(creatingConnection.sourcePort),
    };
    
    onConnectionCreate(connection);
    setCreatingConnection(null);
  };
  
  return {
    creatingConnection,
    startConnection,
    updateConnection,
    completeConnection,
  };
}
```

### Connection Preview (During Creation)

```typescript
function ConnectionPreview({ start, end }: { start: Point; end: Point }) {
  const path = generateBezierPath(start, end);
  
  return (
    <path
      d={path}
      stroke="#3B82F6"
      strokeWidth={2}
      strokeDasharray="5,5"
      fill="none"
      opacity={0.5}
      className="connection-preview"
    />
  );
}
```

### Connection Validation

```typescript
interface ConnectionValidation {
  isValid: boolean;
  error?: string;
}

function validateConnection(
  sourceNodeId: string,
  sourcePort: string,
  targetNodeId: string
): ConnectionValidation {
  // Cannot connect to self
  if (sourceNodeId === targetNodeId) {
    return { isValid: false, error: 'Cannot connect node to itself' };
  }
  
  // Check for existing connection from same port
  const existingConnection = connections.find(
    c => c.sourceNodeId === sourceNodeId && c.sourcePort === sourcePort
  );
  if (existingConnection) {
    return { isValid: false, error: 'This port is already connected' };
  }
  
  // Check for circular reference (simple check)
  if (wouldCreateCycle(sourceNodeId, targetNodeId)) {
    return { isValid: false, error: 'This would create a circular reference' };
  }
  
  // Port-specific validation
  const sourceNode = getNode(sourceNodeId);
  const targetNode = getNode(targetNodeId);
  
  // Victory/failure nodes shouldn't have outgoing connections
  if (sourceNode.isVictoryNode || sourceNode.isFailureNode) {
    return { isValid: false, error: 'End nodes cannot have outgoing connections' };
  }
  
  return { isValid: true };
}

function wouldCreateCycle(sourceId: string, targetId: string): boolean {
  // BFS to check if target can reach source
  const visited = new Set<string>();
  const queue = [targetId];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === sourceId) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    
    const outgoing = connections.filter(c => c.sourceNodeId === current);
    queue.push(...outgoing.map(c => c.targetNodeId));
  }
  
  return false;
}
```

### Connection Deletion

```typescript
function deleteConnection(connectionId: string) {
  // Confirm if connection has conditions
  const connection = connections.find(c => c.id === connectionId);
  if (connection?.conditions?.length) {
    const confirmed = await confirm(
      'This connection has conditions attached. Are you sure you want to delete it?'
    );
    if (!confirmed) return;
  }
  
  dispatch({ type: 'DELETE_CONNECTION', connectionId });
}

// Keyboard shortcut for deletion
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedConnectionIds.length > 0) {
      e.preventDefault();
      selectedConnectionIds.forEach(deleteConnection);
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [selectedConnectionIds]);
```

### Arrow Markers (SVG Definitions)

```typescript
function ConnectionArrowDefs() {
  return (
    <defs>
      {Object.entries(CONNECTION_CONFIGS).map(([type, config]) => (
        <marker
          key={type}
          id={`arrow-${type}`}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path
            d="M 0 0 L 10 5 L 0 10 z"
            fill={config.color}
          />
        </marker>
      ))}
    </defs>
  );
}
```

---

## API Reference

### Connection Operations

```typescript
interface ConnectionOperations {
  createConnection: (connection: Omit<NodeConnection, 'id'>) => NodeConnection;
  updateConnection: (id: string, updates: Partial<NodeConnection>) => void;
  deleteConnection: (id: string) => void;
  getConnectionsForNode: (nodeId: string) => NodeConnection[];
  getOutgoingConnections: (nodeId: string) => NodeConnection[];
  getIncomingConnections: (nodeId: string) => NodeConnection[];
}
```

---

## Testing

### Unit Tests

```typescript
describe('Connection Engine', () => {
  describe('generateBezierPath', () => {
    it('should generate valid SVG path', () => {
      const path = generateBezierPath({ x: 0, y: 0 }, { x: 100, y: 50 });
      
      expect(path).toMatch(/^M .* C .*, .*, .* .*$/);
    });
  });
  
  describe('validateConnection', () => {
    it('should reject self-connections', () => {
      const result = validateConnection('node-1', 'next', 'node-1');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('itself');
    });
    
    it('should reject duplicate port connections', () => {
      // Setup: existing connection from port
      setupConnection('node-1', 'next', 'node-2');
      
      const result = validateConnection('node-1', 'next', 'node-3');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('already connected');
    });
    
    it('should detect cycles', () => {
      setupConnection('node-1', 'next', 'node-2');
      setupConnection('node-2', 'next', 'node-3');
      
      const result = validateConnection('node-3', 'next', 'node-1');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('circular');
    });
  });
});
```

---

## Appendix

### Connection Type by Source Port

| Source Port | Connection Type |
|-------------|-----------------|
| `next` | default |
| `success` | success |
| `failure` | failure |
| `victory` | success |
| `defeat` | failure |
| `flee` | default |
| `choice-*` | choice |
