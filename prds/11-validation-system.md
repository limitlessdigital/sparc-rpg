# PRD 11: Validation System

> **Status**: ✅ Implemented  
> **Priority**: P0 - Critical Path  
> **Estimated Effort**: 2 days (completed)  
> **Dependencies**: 09-node-system, 10-connection-engine

---

## Overview

The Validation System ensures adventures are complete and playable before publishing. It performs real-time validation during editing and comprehensive validation before publishing, checking for required paths, orphaned nodes, and content completeness.

### Implemented Features
- ✅ Real-time validation during editing
- ✅ Victory path validation
- ✅ Failure path validation
- ✅ Orphan node detection
- ✅ Required field validation
- ✅ Visual error indicators

---

## Validation Rules

### Critical Errors (Block Publishing)

```typescript
enum ValidationErrorCode {
  // Structure
  NO_START_NODE = 'E001',
  NO_VICTORY_PATH = 'E002',
  NO_FAILURE_PATH = 'E003',
  ORPHAN_NODE = 'E004',
  UNREACHABLE_VICTORY = 'E005',
  
  // Node content
  EMPTY_TITLE = 'E101',
  EMPTY_CONTENT = 'E102',
  NO_CHOICES = 'E103',
  NO_ENEMIES = 'E104',
  INVALID_DIFFICULTY = 'E105',
  MISSING_CHECK_VALUE = 'E106',
  
  // Connections
  UNCONNECTED_PORT = 'E201',
  DEAD_END_NODE = 'E202',
  CIRCULAR_ONLY_PATH = 'E203',
}

interface ValidationError {
  code: ValidationErrorCode;
  message: string;
  nodeId?: string;
  field?: string;
  severity: 'error';
}
```

### Warnings (Allow Publishing)

```typescript
enum ValidationWarningCode {
  // Structure
  SINGLE_PATH_ONLY = 'W001',
  SHORT_ADVENTURE = 'W002',
  VERY_LONG_PATH = 'W003',
  
  // Content
  NO_IMAGE = 'W101',
  SHORT_CONTENT = 'W102',
  NO_READ_ALOUD = 'W103',
  
  // Balance
  HIGH_DIFFICULTY = 'W201',
  LOW_DIFFICULTY = 'W202',
  UNBALANCED_COMBAT = 'W203',
}

interface ValidationWarning {
  code: ValidationWarningCode;
  message: string;
  nodeId?: string;
  suggestion?: string;
  severity: 'warning';
}
```

---

## Validation Engine

```typescript
interface ValidationResult {
  isValid: boolean;
  canPublish: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  stats: AdventureStats;
}

interface AdventureStats {
  nodeCount: number;
  connectionCount: number;
  averagePathLength: number;
  shortestPath: number;
  longestPath: number;
  combatEncounters: number;
  challengeCount: number;
  decisionPoints: number;
  estimatedDurationMinutes: number;
}

async function validateAdventure(adventure: Adventure): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // === CRITICAL CHECKS ===
  
  // Check for start node
  if (!adventure.startNodeId) {
    errors.push({
      code: ValidationErrorCode.NO_START_NODE,
      message: 'Adventure must have a start node',
      severity: 'error',
    });
  }
  
  // Check for victory path
  const victoryNodes = adventure.nodes.filter(n => n.isVictoryNode);
  if (victoryNodes.length === 0) {
    errors.push({
      code: ValidationErrorCode.NO_VICTORY_PATH,
      message: 'Adventure must have at least one victory ending',
      severity: 'error',
    });
  }
  
  // Check for failure path
  const failureNodes = adventure.nodes.filter(n => n.isFailureNode);
  if (failureNodes.length === 0) {
    errors.push({
      code: ValidationErrorCode.NO_FAILURE_PATH,
      message: 'Adventure must have at least one failure ending',
      severity: 'error',
    });
  }
  
  // Check all victory nodes are reachable
  const reachableNodes = findReachableNodes(adventure.startNodeId, adventure);
  for (const victory of victoryNodes) {
    if (!reachableNodes.has(victory.id)) {
      errors.push({
        code: ValidationErrorCode.UNREACHABLE_VICTORY,
        message: `Victory node "${victory.title}" is not reachable from start`,
        nodeId: victory.id,
        severity: 'error',
      });
    }
  }
  
  // Check for orphan nodes
  const connectedNodes = new Set<string>();
  adventure.connections.forEach(c => {
    connectedNodes.add(c.sourceNodeId);
    connectedNodes.add(c.targetNodeId);
  });
  connectedNodes.add(adventure.startNodeId);
  
  for (const node of adventure.nodes) {
    if (!connectedNodes.has(node.id) && node.id !== adventure.startNodeId) {
      errors.push({
        code: ValidationErrorCode.ORPHAN_NODE,
        message: `Node "${node.title || 'Untitled'}" is not connected to the adventure`,
        nodeId: node.id,
        severity: 'error',
      });
    }
  }
  
  // === NODE-SPECIFIC VALIDATION ===
  
  for (const node of adventure.nodes) {
    const nodeErrors = validateNode(node, adventure.connections);
    errors.push(...nodeErrors.errors);
    warnings.push(...nodeErrors.warnings);
  }
  
  // === WARNINGS ===
  
  // Check for single-path adventures
  const pathCount = countDistinctPaths(adventure);
  if (pathCount === 1) {
    warnings.push({
      code: ValidationWarningCode.SINGLE_PATH_ONLY,
      message: 'Adventure has only one possible path',
      suggestion: 'Consider adding decision points or alternate routes',
      severity: 'warning',
    });
  }
  
  // Check adventure length
  const stats = calculateStats(adventure);
  if (stats.shortestPath < 3) {
    warnings.push({
      code: ValidationWarningCode.SHORT_ADVENTURE,
      message: 'Adventure can be completed in very few steps',
      suggestion: 'Consider adding more content for a richer experience',
      severity: 'warning',
    });
  }
  
  // Check for balance
  const avgDifficulty = calculateAverageDifficulty(adventure);
  if (avgDifficulty > 14) {
    warnings.push({
      code: ValidationWarningCode.HIGH_DIFFICULTY,
      message: 'Average difficulty is quite high',
      suggestion: 'New players may struggle. Consider lowering some challenges.',
      severity: 'warning',
    });
  }
  
  return {
    isValid: errors.length === 0,
    canPublish: errors.length === 0,
    errors,
    warnings,
    stats,
  };
}
```

### Node-Specific Validation

```typescript
function validateNode(node: AdventureNode, connections: NodeConnection[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Common checks
  if (!node.title?.trim()) {
    errors.push({
      code: ValidationErrorCode.EMPTY_TITLE,
      message: 'Node title is required',
      nodeId: node.id,
      field: 'title',
      severity: 'error',
    });
  }
  
  // Type-specific checks
  switch (node.type) {
    case 'decision':
      validateDecisionNode(node as DecisionNode, errors, warnings);
      break;
    case 'challenge':
      validateChallengeNode(node as ChallengeNode, connections, errors, warnings);
      break;
    case 'combat':
      validateCombatNode(node as CombatNode, connections, errors, warnings);
      break;
    case 'check':
      validateCheckNode(node as CheckNode, connections, errors, warnings);
      break;
  }
  
  // Connection checks for non-end nodes
  if (!node.isVictoryNode && !node.isFailureNode) {
    const outgoing = connections.filter(c => c.sourceNodeId === node.id);
    const requiredPorts = getRequiredPorts(node);
    
    for (const port of requiredPorts) {
      if (!outgoing.some(c => c.sourcePort === port.id)) {
        errors.push({
          code: ValidationErrorCode.UNCONNECTED_PORT,
          message: `"${port.label}" path is not connected`,
          nodeId: node.id,
          field: `port.${port.id}`,
          severity: 'error',
        });
      }
    }
  }
  
  // Content warnings
  if (!node.content?.trim() || node.content.length < 20) {
    warnings.push({
      code: ValidationWarningCode.SHORT_CONTENT,
      message: 'Node content is very short',
      nodeId: node.id,
      suggestion: 'Add more descriptive content for players',
      severity: 'warning',
    });
  }
  
  return { isValid: errors.length === 0, canPublish: errors.length === 0, errors, warnings, stats: {} as AdventureStats };
}

function validateDecisionNode(node: DecisionNode, errors: ValidationError[], warnings: ValidationWarning[]) {
  const choices = node.data.choices;
  
  if (!choices || choices.length === 0) {
    errors.push({
      code: ValidationErrorCode.NO_CHOICES,
      message: 'Decision node must have at least one choice',
      nodeId: node.id,
      field: 'choices',
      severity: 'error',
    });
  }
  
  // Check for empty choice text
  choices?.forEach((choice, index) => {
    if (!choice.text?.trim()) {
      errors.push({
        code: ValidationErrorCode.EMPTY_CONTENT,
        message: `Choice ${index + 1} has no text`,
        nodeId: node.id,
        field: `choices[${index}].text`,
        severity: 'error',
      });
    }
  });
}

function validateChallengeNode(
  node: ChallengeNode, 
  connections: NodeConnection[],
  errors: ValidationError[], 
  warnings: ValidationWarning[]
) {
  const data = node.data;
  
  if (data.difficulty < 3 || data.difficulty > 18) {
    errors.push({
      code: ValidationErrorCode.INVALID_DIFFICULTY,
      message: 'Difficulty must be between 3 and 18',
      nodeId: node.id,
      field: 'difficulty',
      severity: 'error',
    });
  }
  
  // Warn on extreme difficulties
  if (data.difficulty >= 16) {
    warnings.push({
      code: ValidationWarningCode.HIGH_DIFFICULTY,
      message: 'This challenge is very difficult (16+)',
      nodeId: node.id,
      suggestion: 'Consider if this is intentionally hard',
      severity: 'warning',
    });
  }
}

function validateCombatNode(
  node: CombatNode,
  connections: NodeConnection[],
  errors: ValidationError[],
  warnings: ValidationWarning[]
) {
  const data = node.data;
  
  if (!data.enemies || data.enemies.length === 0) {
    errors.push({
      code: ValidationErrorCode.NO_ENEMIES,
      message: 'Combat node must have at least one enemy',
      nodeId: node.id,
      field: 'enemies',
      severity: 'error',
    });
  }
  
  // Check flee path if canFlee
  if (data.canFlee) {
    const hasFleePath = connections.some(
      c => c.sourceNodeId === node.id && c.sourcePort === 'flee'
    );
    if (!hasFleePath) {
      errors.push({
        code: ValidationErrorCode.UNCONNECTED_PORT,
        message: 'Flee is enabled but no flee path is connected',
        nodeId: node.id,
        field: 'flee',
        severity: 'error',
      });
    }
  }
}

function validateCheckNode(
  node: CheckNode,
  connections: NodeConnection[],
  errors: ValidationError[],
  warnings: ValidationWarning[]
) {
  const data = node.data;
  
  switch (data.checkType) {
    case 'flag':
      if (!data.flag?.trim()) {
        errors.push({
          code: ValidationErrorCode.MISSING_CHECK_VALUE,
          message: 'Flag name is required',
          nodeId: node.id,
          field: 'flag',
          severity: 'error',
        });
      }
      break;
    case 'item':
      if (!data.item?.trim()) {
        errors.push({
          code: ValidationErrorCode.MISSING_CHECK_VALUE,
          message: 'Item name is required',
          nodeId: node.id,
          field: 'item',
          severity: 'error',
        });
      }
      break;
    case 'variable':
      if (!data.variable?.name?.trim()) {
        errors.push({
          code: ValidationErrorCode.MISSING_CHECK_VALUE,
          message: 'Variable name is required',
          nodeId: node.id,
          field: 'variable.name',
          severity: 'error',
        });
      }
      break;
    case 'random':
      if (data.randomChance === undefined || data.randomChance < 0 || data.randomChance > 100) {
        errors.push({
          code: ValidationErrorCode.MISSING_CHECK_VALUE,
          message: 'Random chance must be between 0 and 100',
          nodeId: node.id,
          field: 'randomChance',
          severity: 'error',
        });
      }
      break;
  }
}
```

### Path Analysis

```typescript
function findReachableNodes(startId: string, adventure: Adventure): Set<string> {
  const reachable = new Set<string>();
  const queue = [startId];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (reachable.has(current)) continue;
    reachable.add(current);
    
    const outgoing = adventure.connections.filter(c => c.sourceNodeId === current);
    queue.push(...outgoing.map(c => c.targetNodeId));
  }
  
  return reachable;
}

function countDistinctPaths(adventure: Adventure): number {
  // Count unique paths from start to any end node
  const endNodes = adventure.nodes.filter(n => n.isVictoryNode || n.isFailureNode);
  let pathCount = 0;
  
  function traverse(nodeId: string, visited: Set<string>): number {
    if (visited.has(nodeId)) return 0;
    
    const node = adventure.nodes.find(n => n.id === nodeId);
    if (!node) return 0;
    
    if (node.isVictoryNode || node.isFailureNode) {
      return 1;
    }
    
    const newVisited = new Set(visited);
    newVisited.add(nodeId);
    
    const outgoing = adventure.connections.filter(c => c.sourceNodeId === nodeId);
    return outgoing.reduce((sum, conn) => sum + traverse(conn.targetNodeId, newVisited), 0);
  }
  
  return traverse(adventure.startNodeId, new Set());
}

function calculateStats(adventure: Adventure): AdventureStats {
  const paths = findAllPaths(adventure);
  
  return {
    nodeCount: adventure.nodes.length,
    connectionCount: adventure.connections.length,
    averagePathLength: paths.reduce((sum, p) => sum + p.length, 0) / paths.length,
    shortestPath: Math.min(...paths.map(p => p.length)),
    longestPath: Math.max(...paths.map(p => p.length)),
    combatEncounters: adventure.nodes.filter(n => n.type === 'combat').length,
    challengeCount: adventure.nodes.filter(n => n.type === 'challenge').length,
    decisionPoints: adventure.nodes.filter(n => n.type === 'decision').length,
    estimatedDurationMinutes: estimateDuration(adventure),
  };
}

function estimateDuration(adventure: Adventure): number {
  // Base time per node type (minutes)
  const timePerNode: Record<NodeType, number> = {
    story: 2,
    decision: 1,
    challenge: 3,
    combat: 8,
    check: 0.5,
  };
  
  const avgPath = calculateStats(adventure).averagePathLength;
  let totalTime = 0;
  
  adventure.nodes.forEach(node => {
    totalTime += timePerNode[node.type];
  });
  
  // Normalize by average path vs total nodes
  return Math.round((totalTime / adventure.nodes.length) * avgPath);
}
```

---

## Real-Time Validation UI

```typescript
function ValidationPanel({ adventure }: { adventure: Adventure }) {
  const validation = useValidation(adventure);
  
  return (
    <div className="validation-panel">
      <div className="validation-header">
        <h3>Validation</h3>
        <StatusBadge status={validation.isValid ? 'valid' : 'invalid'} />
      </div>
      
      {validation.errors.length > 0 && (
        <div className="validation-errors">
          <h4>Errors ({validation.errors.length})</h4>
          {validation.errors.map(error => (
            <ValidationItem 
              key={`${error.code}-${error.nodeId}`}
              item={error}
              onClick={() => focusNode(error.nodeId)}
            />
          ))}
        </div>
      )}
      
      {validation.warnings.length > 0 && (
        <div className="validation-warnings">
          <h4>Warnings ({validation.warnings.length})</h4>
          {validation.warnings.map(warning => (
            <ValidationItem 
              key={`${warning.code}-${warning.nodeId}`}
              item={warning}
              onClick={() => focusNode(warning.nodeId)}
            />
          ))}
        </div>
      )}
      
      <div className="validation-stats">
        <h4>Adventure Stats</h4>
        <dl>
          <dt>Nodes</dt>
          <dd>{validation.stats.nodeCount}</dd>
          <dt>Decision Points</dt>
          <dd>{validation.stats.decisionPoints}</dd>
          <dt>Combat Encounters</dt>
          <dd>{validation.stats.combatEncounters}</dd>
          <dt>Est. Duration</dt>
          <dd>{validation.stats.estimatedDurationMinutes} min</dd>
        </dl>
      </div>
    </div>
  );
}
```

---

## Testing

```typescript
describe('Validation System', () => {
  it('should require start node', async () => {
    const adventure = createAdventure({ startNodeId: null });
    const result = await validateAdventure(adventure);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: ValidationErrorCode.NO_START_NODE })
    );
  });
  
  it('should require victory path', async () => {
    const adventure = createAdventure({ nodes: [createNode({ isVictoryNode: false })] });
    const result = await validateAdventure(adventure);
    
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: ValidationErrorCode.NO_VICTORY_PATH })
    );
  });
  
  it('should detect orphan nodes', async () => {
    const adventure = createAdventure({
      nodes: [
        createNode({ id: 'start' }),
        createNode({ id: 'connected' }),
        createNode({ id: 'orphan' }),
      ],
      connections: [
        { sourceNodeId: 'start', targetNodeId: 'connected' },
      ],
      startNodeId: 'start',
    });
    
    const result = await validateAdventure(adventure);
    
    expect(result.errors).toContainEqual(
      expect.objectContaining({ 
        code: ValidationErrorCode.ORPHAN_NODE,
        nodeId: 'orphan',
      })
    );
  });
  
  it('should validate decision nodes have choices', async () => {
    const adventure = createAdventure({
      nodes: [createDecisionNode({ choices: [] })],
    });
    
    const result = await validateAdventure(adventure);
    
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: ValidationErrorCode.NO_CHOICES })
    );
  });
});
```
