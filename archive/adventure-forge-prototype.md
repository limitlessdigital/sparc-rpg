# Adventure Forge Interactive Prototype Specification

## Overview

This document defines the interactive prototype for SPARC RPG's Adventure Forge - a sophisticated node-based adventure authoring system. The prototype focuses on validating core interactions, node manipulation, and the validation system before full development.

## Prototype Scope & Objectives

### Primary Goals
1. **Validate Node Manipulation UX** - Drag, drop, connect, and configure nodes
2. **Test Validation System** - Real-time error detection and user guidance  
3. **Confirm Touch Interactions** - Mobile-first gesture-based canvas control
4. **Verify Complex Workflows** - Multi-node adventure creation and publishing flow

### Success Metrics
- Users can create a complete 5-node adventure in under 10 minutes
- Mobile users can manipulate nodes effectively with touch gestures
- Validation system prevents 95% of incomplete adventures from publishing
- Zero confusion about node connection requirements

## Core Prototype Features

### 1. Canvas System Architecture

**Infinite Canvas Implementation**
```typescript
interface CanvasState {
  viewport: {
    x: number;
    y: number;
    scale: number;
  };
  nodes: AdventureNode[];
  connections: NodeConnection[];
  selectedNodes: string[];
  dragState: DragState | null;
}

interface AdventureNode {
  id: string;
  type: 'story' | 'decision' | 'challenge' | 'combat' | 'check';
  position: { x: number; y: number };
  properties: NodeProperties;
  validationState: 'valid' | 'warning' | 'error';
  connections: {
    inputs: ConnectionPoint[];
    outputs: ConnectionPoint[];
  };
}
```

**Canvas Interaction Patterns**
- **Pan**: Click-drag on empty space, two-finger drag on touch
- **Zoom**: Mouse wheel, pinch gestures (0.5x to 3x range)  
- **Select**: Click nodes, rubber-band selection for multiple
- **Connect**: Drag from output port to input port with visual feedback

### 2. Node System Implementation

**Node Type Specifications**

**Story Nodes (Blue)**
```typescript
interface StoryNodeProperties {
  title: string;
  content: {
    text: string;
    formatting: RichTextFormat[];
  };
  image?: {
    url: string;
    hideFromPlayers: boolean;
  };
  objectives?: string[];
  items?: ItemReference[];
  experiencePoints: number;
  endConditions: {
    victory: boolean;
    failure: boolean;
  };
}
```

**Decision Nodes (Purple)**  
```typescript
interface DecisionNodeProperties {
  title: string;
  objective: string;
  content: RichTextContent;
  decisions: DecisionOption[];
  items?: ItemReference[];
}

interface DecisionOption {
  id: string;
  description: string;
  targetConnection: {
    type: 'new' | 'existing';
    targetNodeId?: string;
  };
}
```

**Challenge Nodes (Yellow)**
```typescript
interface ChallengeNodeProperties {
  title: string;
  objective: string;
  stat: 'STR' | 'DEX' | 'INT' | 'CHA';
  outcomes: ChallengeOutcome[];
  content: RichTextContent;
}

interface ChallengeOutcome {
  type: 'simple' | 'complex';
  rollRange: {
    min: number;
    max: number;
  };
  description: string;
  targetConnection: ConnectionTarget;
}
```

**Combat Nodes (Red)**
```typescript
interface CombatNodeProperties {
  title: string;
  objective: string;
  creatures: CreatureEncounter[];
  outcomes: CombatOutcome[];
  content: RichTextContent;
}

interface CreatureEncounter {
  creatureId: string;
  quantity: {
    type: 'static' | 'dynamic';
    value: number;
    perPlayerModifier?: number;
  };
}
```

### 3. Connection System Architecture

**Visual Connection Implementation**
```typescript
interface NodeConnection {
  id: string;
  sourceNodeId: string;
  sourcePort: string;
  targetNodeId: string;
  targetPort: string;
  path: BezierPath;
  validation: ConnectionValidation;
}

interface BezierPath {
  start: Point;
  control1: Point;
  control2: Point;
  end: Point;
}
```

**Connection Rules Engine**
- Story → Any node type
- Decision → Multiple outputs based on decision count
- Challenge → Success/Failure outputs  
- Combat → Multiple outcomes based on encounter results
- Check → Simple Pass/Fail outputs

**Smart Routing Algorithm**
1. Calculate optimal control points to avoid node overlaps
2. Adjust curves dynamically when nodes move
3. Highlight compatible connection points during drag
4. Show invalid connections with red indicators

### 4. Real-Time Validation System

**Validation Engine Architecture**
```typescript
interface ValidationEngine {
  rules: ValidationRule[];
  validateAdventure(nodes: AdventureNode[], connections: NodeConnection[]): ValidationResult;
  validateNode(node: AdventureNode): NodeValidation;
  suggestFixes(errors: ValidationError[]): ValidationSuggestion[];
}

interface ValidationRule {
  id: string;
  severity: 'error' | 'warning';
  check: (adventure: Adventure) => ValidationResult;
  message: string;
  suggestion?: string;
}
```

**Critical Validation Rules**
1. **Victory Path Required**: At least one path must lead to victory screen
2. **Failure Path Required**: At least one path must lead to failure screen
3. **No Orphaned Nodes**: All nodes must be reachable from start
4. **Complete Node Properties**: All required fields must be filled
5. **Valid Connections**: All connections must follow type compatibility rules

**Validation UI Patterns**
- **Node Border Colors**: Green (valid), Yellow (warning), Red (error)
- **Error Dialog**: Comprehensive list with one-click fixes where possible
- **Inline Warnings**: Tooltips on problematic nodes with specific guidance
- **Publish Blocking**: Cannot publish until all errors resolved

### 5. Mobile Touch Optimization

**Gesture Recognition System**
```typescript
interface TouchGestureHandler {
  panThreshold: 10; // pixels
  tapTimeout: 200; // ms
  longPressTimeout: 500; // ms
  
  handleTouchStart(event: TouchEvent): void;
  handleTouchMove(event: TouchEvent): void;
  handleTouchEnd(event: TouchEvent): void;
  
  recognizeGesture(touches: TouchHistory[]): GestureType;
}

enum GestureType {
  TAP = 'tap',
  LONG_PRESS = 'longPress',
  PAN = 'pan',
  PINCH = 'pinch',
  TWO_FINGER_PAN = 'twoFingerPan'
}
```

**Touch-Optimized UI Elements**
- **Node Size**: Minimum 60px diameter for touch targets
- **Connection Points**: 20px touch areas with visual 8px indicators
- **Floating Actions**: Context-sensitive buttons that appear on selection
- **Gesture Feedback**: Visual indicators for active gestures

## Prototype Implementation Plan

### Phase 1: Core Canvas (Week 1-2)
- [ ] Implement infinite canvas with pan/zoom
- [ ] Basic node rendering system
- [ ] Node selection and movement
- [ ] Touch gesture recognition

### Phase 2: Node System (Week 3-4)
- [ ] All five node types with properties panels
- [ ] Rich text editing for content areas
- [ ] Image upload and management
- [ ] Node connection visualization

### Phase 3: Connection Engine (Week 5-6)
- [ ] Drag-and-drop connection creation
- [ ] Smart bezier curve routing
- [ ] Connection validation rules
- [ ] Visual feedback system

### Phase 4: Validation System (Week 7-8)
- [ ] Real-time error detection
- [ ] Validation rule engine
- [ ] Error dialog and suggestion system
- [ ] Publishing workflow with validation gates

### Phase 5: Mobile Optimization (Week 9-10)
- [ ] Touch gesture refinement
- [ ] Mobile-specific UI adaptations
- [ ] Performance optimization for mobile devices
- [ ] Cross-device testing and validation

## Technical Implementation Notes

### Recommended Tech Stack
- **Framework**: React with TypeScript for type safety
- **Canvas Library**: Fabric.js or custom WebGL for performance
- **State Management**: Redux Toolkit for complex state
- **Gesture Handling**: React-use-gesture for touch optimization
- **Validation**: Joi or Yup for schema validation
- **Testing**: Cypress for end-to-end prototype testing

### Performance Considerations
- **Virtual Rendering**: Only render nodes in viewport
- **Debounced Validation**: Avoid excessive validation calls during editing
- **Optimized Connections**: Use path memoization for connection rendering
- **Touch Response**: Maintain 60fps during gesture interactions

### Accessibility Requirements
- **Keyboard Navigation**: Full keyboard control for node manipulation
- **Screen Reader Support**: ARIA labels for all interactive elements
- **High Contrast**: Support for high contrast display modes
- **Focus Management**: Clear focus indicators throughout interface

## User Testing Protocol

### Testing Scenarios
1. **New User Flow**: Create first adventure from blank canvas
2. **Complex Adventure**: Build 10+ node adventure with multiple paths
3. **Mobile Creation**: Complete adventure creation on mobile device
4. **Error Recovery**: Handle validation errors and fix issues
5. **Publishing Flow**: Complete adventure and publish to library

### Success Criteria
- [ ] 90% of users complete basic adventure creation
- [ ] Mobile users report positive touch interaction experience  
- [ ] Validation system prevents invalid adventures from publishing
- [ ] Users understand node connection requirements without training
- [ ] Performance maintains 60fps on target devices

This prototype will validate the core Adventure Forge concept before full implementation, ensuring the complex node-based interface works effectively for both casual players and power users.