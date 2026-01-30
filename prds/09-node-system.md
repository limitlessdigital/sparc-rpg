# PRD 09: Node System

> **Status**: ✅ Implemented  
> **Priority**: P0 - Critical Path  
> **Estimated Effort**: 4 days (completed)  
> **Dependencies**: 08-canvas-system

---

## Overview

The Node System defines the five types of adventure content blocks: Story, Decision, Challenge, Combat, and Check nodes. Each node type has specific properties and behaviors that determine how the adventure progresses. This PRD documents the implemented node system for reference.

### Implemented Features
- ✅ All 5 node types with property panels
- ✅ Node creation via toolbar/context menu
- ✅ Node editing via property panel
- ✅ Visual distinction by type (color coding)
- ✅ Node validation
- ✅ Copy/paste support
- ✅ Drag and drop positioning

---

## Node Type Specifications

### Common Properties (All Nodes)

```typescript
interface BaseNode {
  id: string;
  adventureId: string;
  type: NodeType;
  
  // Canvas position
  position: { x: number; y: number };
  
  // Content
  title: string;                  // Max 100 chars
  content: string;                // Rich text/markdown
  imageUrl?: string;
  imageVisibleToPlayers: boolean;
  
  // Outcomes
  isVictoryNode: boolean;
  isFailureNode: boolean;
  experienceReward: number;
  itemRewards: ItemReward[];
  
  // Conditions
  requiredFlags?: string[];
  requiredItems?: string[];
  setFlags?: string[];
  removeFlags?: string[];
  setVariables?: Record<string, unknown>;
}
```

### Story Node (Blue)

Primary narrative content nodes. Used for exposition, dialogue, and scene-setting.

```typescript
interface StoryNode extends BaseNode {
  type: 'story';
  data: {
    objectives?: string[];        // Current objectives to display
    readAloudText?: string;       // Text for Seer to read aloud
    seerNotes?: string;           // Private notes for Seer
    autoAdvance?: boolean;        // Auto-advance after delay
    autoAdvanceDelay?: number;    // Seconds to wait
  };
}
```

**Visual Design:**
- Color: Blue (#3B82F6)
- Icon: 📖 Book
- Default size: 200x120px

**Property Panel:**
```
┌─────────────────────────────────┐
│ Story Node                      │
├─────────────────────────────────┤
│ Title: [_______________]        │
│                                 │
│ Content:                        │
│ ┌─────────────────────────────┐ │
│ │ Rich text editor...         │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│                                 │
│ Read Aloud Text (optional):    │
│ ┌─────────────────────────────┐ │
│ │ ...                         │ │
│ └─────────────────────────────┘ │
│                                 │
│ Seer Notes (optional):         │
│ ┌─────────────────────────────┐ │
│ │ Private notes...            │ │
│ └─────────────────────────────┘ │
│                                 │
│ Objectives:                    │
│ [+] Add objective              │
│                                 │
│ ☐ Is Victory Node              │
│ ☐ Is Failure Node              │
│                                 │
│ [Image] [Rewards] [Conditions] │
└─────────────────────────────────┘
```

### Decision Node (Purple)

Player choice points that branch the narrative.

```typescript
interface DecisionNode extends BaseNode {
  type: 'decision';
  data: {
    choices: DecisionChoice[];
    timeLimit?: number;           // Optional countdown (seconds)
    defaultChoiceId?: string;     // Auto-select if time runs out
  };
}

interface DecisionChoice {
  id: string;
  text: string;                   // "Enter the cave"
  tooltip?: string;               // Additional context on hover
  requiredFlags?: string[];       // Only show if flags present
  forbiddenFlags?: string[];      // Hide if flags present
}
```

**Visual Design:**
- Color: Purple (#8B5CF6)
- Icon: 🔀 Branch
- Shows choice count badge

**Property Panel:**
```
┌─────────────────────────────────┐
│ Decision Node                   │
├─────────────────────────────────┤
│ Title: [_______________]        │
│                                 │
│ Description:                   │
│ ┌─────────────────────────────┐ │
│ │ Rich text editor...         │ │
│ └─────────────────────────────┘ │
│                                 │
│ Choices:                       │
│ ┌─────────────────────────────┐ │
│ │ 1. [Enter the cave      ] ✕│ │
│ │    Conditions: [+]          │ │
│ │ 2. [Search the area     ] ✕│ │
│ │    Conditions: [+]          │ │
│ │ 3. [Return to town      ] ✕│ │
│ └─────────────────────────────┘ │
│ [+ Add Choice]                  │
│                                 │
│ Time Limit: [___] seconds       │
│ (0 = no limit)                  │
│                                 │
│ [Image] [Rewards] [Conditions] │
└─────────────────────────────────┘
```

### Challenge Node (Yellow)

Attribute-based skill checks with success/failure paths.

```typescript
interface ChallengeNode extends BaseNode {
  type: 'challenge';
  data: {
    attribute: Attribute;         // might, grace, wit, heart
    difficulty: number;           // 3-18
    description: string;          // "Climb the treacherous cliff"
    successText: string;
    failureText: string;
    partialSuccessThreshold?: number;
    partialSuccessText?: string;
    allowRetry: boolean;
    retryPenalty?: number;        // +difficulty on retry
  };
}
```

**Visual Design:**
- Color: Yellow (#EAB308)
- Icon: 🎯 Target
- Shows attribute badge and difficulty

**Property Panel:**
```
┌─────────────────────────────────┐
│ Challenge Node                  │
├─────────────────────────────────┤
│ Title: [_______________]        │
│                                 │
│ Challenge Description:         │
│ ┌─────────────────────────────┐ │
│ │ Describe the challenge...   │ │
│ └─────────────────────────────┘ │
│                                 │
│ Attribute: [▼ Might      ]      │
│ Difficulty: [__12__]            │
│                                 │
│ Success Text:                  │
│ ┌─────────────────────────────┐ │
│ │ You succeed...              │ │
│ └─────────────────────────────┘ │
│                                 │
│ Failure Text:                  │
│ ┌─────────────────────────────┐ │
│ │ You fail...                 │ │
│ └─────────────────────────────┘ │
│                                 │
│ ☐ Allow Retry                  │
│   Retry penalty: +[__2__]      │
│                                 │
│ [Image] [Rewards] [Conditions] │
└─────────────────────────────────┘
```

### Combat Node (Red)

Enemy encounters with tactical combat resolution.

```typescript
interface CombatNode extends BaseNode {
  type: 'combat';
  data: {
    enemies: CombatEnemy[];
    terrain?: string;             // Narrative terrain description
    ambush: boolean;              // Enemies get surprise round
    canFlee: boolean;
    fleeConditions?: string;      // "After round 3"
    fleeDifficulty?: number;
    victoryText: string;
    defeatText: string;
    fleeText?: string;
  };
}

interface CombatEnemy {
  creatureId: string;
  count: number | 'per_player';
  minCount?: number;
  maxCount?: number;
  customName?: string;            // Override creature name
}
```

**Visual Design:**
- Color: Red (#EF4444)
- Icon: ⚔️ Swords
- Shows enemy count badge

**Property Panel:**
```
┌─────────────────────────────────┐
│ Combat Node                     │
├─────────────────────────────────┤
│ Title: [_______________]        │
│                                 │
│ Scene Description:             │
│ ┌─────────────────────────────┐ │
│ │ Describe the scene...       │ │
│ └─────────────────────────────┘ │
│                                 │
│ Enemies:                       │
│ ┌─────────────────────────────┐ │
│ │ [▼ Goblin    ] × [_3_]    ✕│ │
│ │ [▼ Orc       ] × [per plr]✕│ │
│ └─────────────────────────────┘ │
│ [+ Add Enemy]                   │
│                                 │
│ ☐ Ambush (enemies surprise)    │
│ ☐ Can Flee                     │
│   Flee difficulty: [__10__]    │
│                                 │
│ Victory Text:                  │
│ ┌─────────────────────────────┐ │
│ │ The enemies are defeated... │ │
│ └─────────────────────────────┘ │
│                                 │
│ Defeat Text:                   │
│ ┌─────────────────────────────┐ │
│ │ The party falls...          │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Image] [Rewards] [Conditions] │
└─────────────────────────────────┘
```

### Check Node (Green)

Conditional branching based on game state (flags, items, variables).

```typescript
interface CheckNode extends BaseNode {
  type: 'check';
  data: {
    checkType: 'flag' | 'item' | 'variable' | 'random';
    flag?: string;
    item?: string;
    variable?: {
      name: string;
      operator: '==' | '!=' | '>' | '<' | '>=' | '<=';
      value: string | number;
    };
    randomChance?: number;        // 0-100 percentage
    successText: string;
    failureText: string;
  };
}
```

**Visual Design:**
- Color: Green (#22C55E)
- Icon: ❓ Question
- Shows check type icon

**Property Panel:**
```
┌─────────────────────────────────┐
│ Check Node                      │
├─────────────────────────────────┤
│ Title: [_______________]        │
│                                 │
│ Check Type: [▼ Flag Check   ]   │
│                                 │
│ ── Flag Check ──                │
│ Flag Name: [has_key____]        │
│                                 │
│ ── Item Check ──                │
│ Item Name: [magic_sword__]      │
│                                 │
│ ── Variable Check ──            │
│ Variable: [gold___]             │
│ Operator: [▼ >= ]               │
│ Value: [__100__]                │
│                                 │
│ ── Random Check ──              │
│ Success Chance: [__50__]%       │
│                                 │
│ Success Text:                  │
│ ┌─────────────────────────────┐ │
│ │ The check passes...         │ │
│ └─────────────────────────────┘ │
│                                 │
│ Failure Text:                  │
│ ┌─────────────────────────────┐ │
│ │ The check fails...          │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Image] [Rewards] [Conditions] │
└─────────────────────────────────┘
```

---

## Node Component Implementation

```typescript
interface CanvasNodeProps {
  node: AdventureNode;
  isSelected: boolean;
  onSelect: () => void;
  onDoubleClick: () => void;
  onConnectionStart: (port: string) => void;
}

function CanvasNode({ node, isSelected, onSelect, onDoubleClick, onConnectionStart }: CanvasNodeProps) {
  const config = NODE_CONFIGS[node.type];
  
  return (
    <div
      className={cn(
        'canvas-node',
        `node-${node.type}`,
        isSelected && 'selected'
      )}
      style={{
        left: node.position.x,
        top: node.position.y,
        borderColor: config.color,
      }}
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
    >
      {/* Header */}
      <div className="node-header" style={{ backgroundColor: config.color }}>
        <span className="node-icon">{config.icon}</span>
        <span className="node-title">{node.title || 'Untitled'}</span>
        {getNodeBadge(node)}
      </div>
      
      {/* Preview */}
      <div className="node-preview">
        {truncate(node.content, 100)}
      </div>
      
      {/* Connection ports */}
      <div className="node-ports">
        <div 
          className="port port-in"
          onMouseDown={(e) => { e.stopPropagation(); onConnectionStart('in'); }}
        />
        {getOutputPorts(node).map(port => (
          <div
            key={port.id}
            className={cn('port', 'port-out', port.type)}
            style={{ top: port.position }}
            onMouseDown={(e) => { e.stopPropagation(); onConnectionStart(port.id); }}
          />
        ))}
      </div>
      
      {/* Status indicators */}
      {node.isVictoryNode && <VictoryBadge />}
      {node.isFailureNode && <FailureBadge />}
      {node.imageUrl && <ImageIndicator />}
    </div>
  );
}

const NODE_CONFIGS: Record<NodeType, NodeConfig> = {
  story: {
    color: '#3B82F6',
    icon: '📖',
    label: 'Story',
    outputPorts: [{ id: 'next', type: 'default', label: 'Next' }],
  },
  decision: {
    color: '#8B5CF6',
    icon: '🔀',
    label: 'Decision',
    outputPorts: 'dynamic', // Based on choices
  },
  challenge: {
    color: '#EAB308',
    icon: '🎯',
    label: 'Challenge',
    outputPorts: [
      { id: 'success', type: 'success', label: 'Success' },
      { id: 'failure', type: 'failure', label: 'Failure' },
    ],
  },
  combat: {
    color: '#EF4444',
    icon: '⚔️',
    label: 'Combat',
    outputPorts: [
      { id: 'victory', type: 'success', label: 'Victory' },
      { id: 'defeat', type: 'failure', label: 'Defeat' },
      { id: 'flee', type: 'default', label: 'Fled' },
    ],
  },
  check: {
    color: '#22C55E',
    icon: '❓',
    label: 'Check',
    outputPorts: [
      { id: 'success', type: 'success', label: 'Pass' },
      { id: 'failure', type: 'failure', label: 'Fail' },
    ],
  },
};
```

---

## Node Creation

```typescript
function createNode(type: NodeType, position: Point): AdventureNode {
  const base: BaseNode = {
    id: generateId(),
    adventureId: '', // Set by parent
    type,
    position,
    title: '',
    content: '',
    imageVisibleToPlayers: true,
    isVictoryNode: false,
    isFailureNode: false,
    experienceReward: 0,
    itemRewards: [],
  };
  
  switch (type) {
    case 'story':
      return { ...base, data: { objectives: [] } };
    case 'decision':
      return { ...base, data: { choices: [] } };
    case 'challenge':
      return { ...base, data: { attribute: 'might', difficulty: 10, description: '', successText: '', failureText: '', allowRetry: false } };
    case 'combat':
      return { ...base, data: { enemies: [], ambush: false, canFlee: false, victoryText: '', defeatText: '' } };
    case 'check':
      return { ...base, data: { checkType: 'flag', successText: '', failureText: '' } };
  }
}
```

---

## Node Validation

```typescript
interface NodeValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

function validateNode(node: AdventureNode, connections: NodeConnection[]): NodeValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Common validation
  if (!node.title.trim()) {
    errors.push({ field: 'title', message: 'Title is required' });
  }
  
  // Type-specific validation
  switch (node.type) {
    case 'decision':
      if ((node.data as DecisionNodeData).choices.length === 0) {
        errors.push({ field: 'choices', message: 'At least one choice is required' });
      }
      break;
      
    case 'challenge':
      const challengeData = node.data as ChallengeNodeData;
      if (challengeData.difficulty < 3 || challengeData.difficulty > 18) {
        errors.push({ field: 'difficulty', message: 'Difficulty must be between 3 and 18' });
      }
      break;
      
    case 'combat':
      if ((node.data as CombatNodeData).enemies.length === 0) {
        errors.push({ field: 'enemies', message: 'At least one enemy is required' });
      }
      break;
      
    case 'check':
      const checkData = node.data as CheckNodeData;
      if (checkData.checkType === 'flag' && !checkData.flag) {
        errors.push({ field: 'flag', message: 'Flag name is required' });
      }
      if (checkData.checkType === 'random' && (checkData.randomChance! < 0 || checkData.randomChance! > 100)) {
        errors.push({ field: 'randomChance', message: 'Chance must be 0-100' });
      }
      break;
  }
  
  // Connection validation
  const outgoingConnections = connections.filter(c => c.sourceNodeId === node.id);
  const requiredPorts = getRequiredOutputPorts(node);
  
  for (const port of requiredPorts) {
    if (!outgoingConnections.some(c => c.sourcePort === port.id)) {
      warnings.push({ 
        field: 'connections', 
        message: `${port.label} path is not connected` 
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
```

---

## Testing

### Unit Tests

```typescript
describe('Node System', () => {
  describe('createNode', () => {
    it('should create story node with default data', () => {
      const node = createNode('story', { x: 100, y: 100 });
      
      expect(node.type).toBe('story');
      expect(node.data).toEqual({ objectives: [] });
    });
    
    it('should create decision node with empty choices', () => {
      const node = createNode('decision', { x: 0, y: 0 });
      
      expect(node.type).toBe('decision');
      expect((node.data as DecisionNodeData).choices).toEqual([]);
    });
  });
  
  describe('validateNode', () => {
    it('should fail validation for empty title', () => {
      const node = createNode('story', { x: 0, y: 0 });
      node.title = '';
      
      const result = validateNode(node, []);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({ field: 'title', message: 'Title is required' });
    });
    
    it('should fail validation for decision without choices', () => {
      const node = createNode('decision', { x: 0, y: 0 });
      node.title = 'Test';
      
      const result = validateNode(node, []);
      
      expect(result.errors).toContainEqual({ field: 'choices', message: 'At least one choice is required' });
    });
    
    it('should warn about unconnected required paths', () => {
      const node = createNode('challenge', { x: 0, y: 0 });
      node.title = 'Test';
      (node.data as ChallengeNodeData).difficulty = 10;
      
      const result = validateNode(node, []);
      
      expect(result.warnings).toContainEqual({ field: 'connections', message: 'Success path is not connected' });
    });
  });
});
```

---

## Appendix

### Node Color Reference

| Type | Color | Hex | Usage |
|------|-------|-----|-------|
| Story | Blue | #3B82F6 | Narrative, exposition |
| Decision | Purple | #8B5CF6 | Player choices |
| Challenge | Yellow | #EAB308 | Skill checks |
| Combat | Red | #EF4444 | Encounters |
| Check | Green | #22C55E | Conditional logic |

### Default Node Sizes

| Type | Width | Height |
|------|-------|--------|
| Story | 200px | 120px |
| Decision | 200px | 140px |
| Challenge | 180px | 130px |
| Combat | 200px | 150px |
| Check | 180px | 120px |
