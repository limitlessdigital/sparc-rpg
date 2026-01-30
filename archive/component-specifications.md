# SPARC Adventure Forge Component Specifications

## Overview

This document provides detailed specifications for all UI components required to implement the SPARC Adventure Forge system. Each component includes implementation details, props interfaces, styling requirements, and integration guidelines.

## Design System Foundation

### Core Design Tokens

```typescript
// SPARC Theme Configuration
export const SparcTheme = {
  colors: {
    primary: {
      orange: '#CC7A00',
      bronze: '#8B4513',
      lightOrange: '#FFB347'
    },
    semantic: {
      success: '#4CAF50',
      warning: '#FF9800', 
      error: '#F44336',
      info: '#2196F3'
    },
    neutral: {
      dark: '#2C2C2C',
      medium: '#404040',
      light: '#757575',
      lighter: '#BDBDBD',
      white: '#FFFFFF'
    },
    node: {
      story: '#2196F3',      // Blue
      decision: '#9C27B0',   // Purple
      challenge: '#FF9800',  // Orange/Yellow
      combat: '#F44336',     // Red
      check: '#4CAF50'       // Green
    }
  },
  
  typography: {
    fontFamily: {
      primary: '"Friz Quadrata", serif',
      secondary: '"Gotham", "Helvetica", sans-serif',
      mono: '"JetBrains Mono", monospace'
    },
    scale: {
      h1: { size: '48px', weight: 'bold', lineHeight: 1.2 },
      h2: { size: '36px', weight: 'bold', lineHeight: 1.3 },
      h3: { size: '24px', weight: 'medium', lineHeight: 1.4 },
      body: { size: '16px', weight: 'regular', lineHeight: 1.5 },
      small: { size: '14px', weight: 'regular', lineHeight: 1.4 }
    }
  },
  
  spacing: {
    xs: '4px',
    sm: '8px', 
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },
  
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '50%'
  },
  
  elevation: {
    sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    md: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
    lg: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)'
  }
};
```

### Animation System

```typescript
// Animation Configuration
export const SparcAnimations = {
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '400ms'
  },
  
  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)'
  },
  
  // Node-specific animations
  node: {
    hover: 'transform 150ms cubic-bezier(0.4, 0.0, 0.2, 1)',
    selection: 'box-shadow 200ms ease-out',
    drag: 'opacity 100ms ease-out',
    connection: 'stroke-dashoffset 300ms ease-in-out'
  }
};
```

## Core Adventure Forge Components

### 1. AdventureCanvas Component

**Purpose**: Main infinite canvas for node-based adventure editing

```typescript
interface AdventureCanvasProps {
  adventureId: string;
  nodes: AdventureNode[];
  connections: NodeConnection[];
  
  // Canvas state
  viewport: CanvasViewport;
  selectedNodes: string[];
  dragState?: DragState;
  
  // Callbacks
  onNodeCreate: (node: Partial<AdventureNode>) => void;
  onNodeUpdate: (nodeId: string, updates: Partial<AdventureNode>) => void;
  onNodeDelete: (nodeId: string) => void;
  onNodeSelect: (nodeIds: string[]) => void;
  onConnectionCreate: (connection: Partial<NodeConnection>) => void;
  onConnectionDelete: (connectionId: string) => void;
  onViewportChange: (viewport: CanvasViewport) => void;
  
  // Collaboration
  collaborators: CollaborationUser[];
  onCollaborationEvent: (event: CollaborationEvent) => void;
  
  // Configuration
  readonly?: boolean;
  showGrid?: boolean;
  snapToGrid?: boolean;
  gridSize?: number;
}

// Implementation Notes
const AdventureCanvas: React.FC<AdventureCanvasProps> = ({
  adventureId,
  nodes,
  connections,
  viewport,
  selectedNodes,
  onNodeCreate,
  onViewportChange,
  // ... other props
}) => {
  // Canvas ref for direct manipulation
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Touch and mouse event handling
  const { gestures } = useGestures({
    onDrag: handleCanvasDrag,
    onPinch: handleCanvasPinch,
    onTap: handleCanvasTap
  });
  
  // Virtual rendering for performance
  const visibleNodes = useMemo(() => 
    getNodesInViewport(nodes, viewport), [nodes, viewport]
  );
  
  return (
    <div 
      ref={canvasRef}
      className="adventure-canvas"
      {...gestures}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: 'radial-gradient(circle at 20% 20%, #1a1a1a 0%, #0d0d0d 100%)'
      }}
    >
      {/* Grid overlay */}
      {showGrid && <CanvasGrid viewport={viewport} size={gridSize} />}
      
      {/* Nodes */}
      {visibleNodes.map(node => (
        <AdventureNode
          key={node.id}
          node={node}
          selected={selectedNodes.includes(node.id)}
          viewport={viewport}
          onUpdate={onNodeUpdate}
          onSelect={onNodeSelect}
          readonly={readonly}
        />
      ))}
      
      {/* Connections SVG layer */}
      <svg 
        ref={svgRef}
        className="connections-layer"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      >
        {connections.map(connection => (
          <ConnectionLine
            key={connection.id}
            connection={connection}
            viewport={viewport}
            onDelete={onConnectionDelete}
          />
        ))}
        
        {/* Temporary connection during drag */}
        {dragState?.type === 'connection' && (
          <TempConnectionLine
            startPoint={dragState.startPoint}
            currentPoint={dragState.currentPoint}
          />
        )}
      </svg>
      
      {/* Collaboration cursors */}
      {collaborators.map(user => (
        <CollaboratorCursor
          key={user.id}
          user={user}
          viewport={viewport}
        />
      ))}
      
      {/* Selection rectangle for rubber-band selection */}
      {dragState?.type === 'selection' && (
        <SelectionRectangle
          startPoint={dragState.startPoint}
          currentPoint={dragState.currentPoint}
        />
      )}
    </div>
  );
};
```

**Styling Requirements**
```scss
.adventure-canvas {
  // Prevent text selection during drag operations
  user-select: none;
  -webkit-user-select: none;
  
  // Smooth cursor transitions
  cursor: grab;
  
  &.dragging {
    cursor: grabbing;
  }
  
  &.connecting {
    cursor: crosshair;
  }
}

// Grid styling
.canvas-grid {
  opacity: 0.1;
  stroke: var(--sparc-orange);
  stroke-width: 1;
  
  // Animate grid when zooming
  transition: opacity 200ms ease-out;
}
```

### 2. AdventureNode Component

**Purpose**: Individual node representation with type-specific styling and interactions

```typescript
interface AdventureNodeProps {
  node: AdventureNode;
  selected: boolean;
  viewport: CanvasViewport;
  
  // Interactions
  onUpdate: (nodeId: string, updates: Partial<AdventureNode>) => void;
  onSelect: (nodeIds: string[]) => void;
  onDelete: (nodeId: string) => void;
  onDuplicate: (nodeId: string) => void;
  onStartConnection: (nodeId: string, portId: string) => void;
  
  // State
  readonly?: boolean;
  validationState?: 'valid' | 'warning' | 'error';
  collaboratorEditing?: CollaborationUser;
}

const AdventureNode: React.FC<AdventureNodeProps> = ({
  node,
  selected,
  viewport,
  onUpdate,
  onSelect,
  validationState = 'valid',
  collaboratorEditing
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  
  // Calculate screen position from canvas coordinates
  const screenPosition = canvasToScreen(node.position, viewport);
  
  // Node type-specific configuration
  const nodeConfig = NODE_TYPE_CONFIG[node.type];
  
  // Drag handling
  const handleDragStart = (event: React.MouseEvent) => {
    if (readonly) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });
    setIsDragging(true);
    
    // Select node if not already selected
    if (!selected) {
      onSelect([node.id]);
    }
  };
  
  const handleDrag = useCallback((event: MouseEvent) => {
    if (!isDragging) return;
    
    const canvasPosition = screenToCanvas(
      { x: event.clientX - dragOffset.x, y: event.clientY - dragOffset.y },
      viewport
    );
    
    onUpdate(node.id, { position: canvasPosition });
  }, [isDragging, dragOffset, viewport]);
  
  return (
    <div
      className={cn(
        'adventure-node',
        `adventure-node--${node.type}`,
        selected && 'adventure-node--selected',
        isDragging && 'adventure-node--dragging',
        `adventure-node--${validationState}`
      )}
      style={{
        transform: `translate(${screenPosition.x}px, ${screenPosition.y}px)`,
        zIndex: selected ? 1000 : isDragging ? 1100 : 100
      }}
      onMouseDown={handleDragStart}
      data-node-id={node.id}
    >
      {/* Node icon and type indicator */}
      <div className="node-header">
        <div className="node-icon" style={{ color: nodeConfig.color }}>
          {nodeConfig.icon}
        </div>
        <div className="node-type-label">
          {nodeConfig.label}
        </div>
      </div>
      
      {/* Node title */}
      <div className="node-title">
        {node.properties.title || 'Untitled'}
      </div>
      
      {/* Connection ports */}
      <div className="connection-ports">
        {/* Input ports */}
        {nodeConfig.inputs.map(port => (
          <ConnectionPort
            key={port.id}
            port={port}
            type="input"
            nodeId={node.id}
            onConnectionStart={onStartConnection}
          />
        ))}
        
        {/* Output ports */}
        {nodeConfig.outputs.map(port => (
          <ConnectionPort
            key={port.id}
            port={port}
            type="output"
            nodeId={node.id}
            onConnectionStart={onStartConnection}
          />
        ))}
      </div>
      
      {/* Validation indicator */}
      {validationState !== 'valid' && (
        <div className={`validation-indicator validation-indicator--${validationState}`}>
          {validationState === 'error' ? '⚠️' : '⚡'}
        </div>
      )}
      
      {/* Collaboration indicator */}
      {collaboratorEditing && (
        <div 
          className="collaborator-indicator"
          style={{ borderColor: collaboratorEditing.color }}
        >
          <div className="collaborator-avatar">
            {collaboratorEditing.name[0]}
          </div>
        </div>
      )}
      
      {/* Context menu trigger */}
      <button 
        className="node-menu-trigger"
        onClick={(e) => {
          e.stopPropagation();
          // Show context menu
        }}
      >
        ⋯
      </button>
    </div>
  );
};
```

**Node Styling System**
```scss
.adventure-node {
  position: absolute;
  min-width: 120px;
  min-height: 80px;
  border-radius: var(--sparc-border-radius-md);
  background: var(--sparc-neutral-dark);
  border: 2px solid transparent;
  box-shadow: var(--sparc-elevation-sm);
  
  // Smooth transforms for dragging
  transition: box-shadow 200ms ease-out;
  
  // Node type colors
  &--story {
    border-color: var(--sparc-node-story);
    .node-header { background: var(--sparc-node-story); }
  }
  
  &--decision {
    border-color: var(--sparc-node-decision);
    .node-header { background: var(--sparc-node-decision); }
  }
  
  &--challenge {
    border-color: var(--sparc-node-challenge);
    .node-header { background: var(--sparc-node-challenge); }
  }
  
  &--combat {
    border-color: var(--sparc-node-combat);
    .node-header { background: var(--sparc-node-combat); }
  }
  
  &--check {
    border-color: var(--sparc-node-check);
    .node-header { background: var(--sparc-node-check); }
  }
  
  // Selection state
  &--selected {
    border-color: var(--sparc-primary-orange);
    box-shadow: 0 0 0 3px rgba(204, 122, 0, 0.3);
  }
  
  // Dragging state
  &--dragging {
    opacity: 0.8;
    box-shadow: var(--sparc-elevation-lg);
    cursor: grabbing;
  }
  
  // Validation states
  &--error {
    border-color: var(--sparc-semantic-error);
    animation: pulse-error 2s infinite;
  }
  
  &--warning {
    border-color: var(--sparc-semantic-warning);
  }
  
  // Hover effects
  &:hover:not(&--dragging) {
    box-shadow: var(--sparc-elevation-md);
    transform: scale(1.02);
  }
}

.node-header {
  padding: var(--sparc-spacing-sm);
  display: flex;
  align-items: center;
  gap: var(--sparc-spacing-xs);
  border-radius: var(--sparc-border-radius-md) var(--sparc-border-radius-md) 0 0;
  color: white;
  font-weight: 600;
  font-size: var(--sparc-typography-small-size);
}

.node-title {
  padding: var(--sparc-spacing-sm);
  font-family: var(--sparc-font-secondary);
  font-size: var(--sparc-typography-body-size);
  color: var(--sparc-neutral-white);
  text-align: center;
}

// Animation for error state
@keyframes pulse-error {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

### 3. NodePropertiesPanel Component

**Purpose**: Context-sensitive properties editor for selected nodes

```typescript
interface NodePropertiesPanelProps {
  selectedNodes: AdventureNode[];
  onNodeUpdate: (nodeId: string, updates: Partial<AdventureNode>) => void;
  onClose: () => void;
  
  // Integration
  availableCreatures?: Creature[];
  availableItems?: Item[];
  
  // State
  readonly?: boolean;
  isCollaborativeEdit?: boolean;
}

const NodePropertiesPanel: React.FC<NodePropertiesPanelProps> = ({
  selectedNodes,
  onNodeUpdate,
  availableCreatures = [],
  availableItems = [],
  readonly = false
}) => {
  if (selectedNodes.length === 0) return null;
  
  // Handle multi-node selection
  const isMultiSelect = selectedNodes.length > 1;
  const primaryNode = selectedNodes[0];
  
  // Different forms for different node types
  const renderNodeForm = () => {
    switch (primaryNode.type) {
      case 'story':
        return <StoryNodeForm node={primaryNode} onUpdate={onNodeUpdate} />;
      case 'decision':
        return <DecisionNodeForm node={primaryNode} onUpdate={onNodeUpdate} />;
      case 'challenge':
        return <ChallengeNodeForm node={primaryNode} onUpdate={onNodeUpdate} />;
      case 'combat':
        return <CombatNodeForm 
          node={primaryNode} 
          onUpdate={onNodeUpdate}
          availableCreatures={availableCreatures}
        />;
      case 'check':
        return <CheckNodeForm node={primaryNode} onUpdate={onNodeUpdate} />;
      default:
        return <div>Unknown node type</div>;
    }
  };
  
  return (
    <div className="node-properties-panel">
      <div className="panel-header">
        <h3>Properties</h3>
        {isMultiSelect && (
          <span className="multi-select-indicator">
            {selectedNodes.length} nodes selected
          </span>
        )}
        <button className="panel-close" onClick={onClose}>×</button>
      </div>
      
      <div className="panel-content">
        {isMultiSelect ? (
          <MultiNodeEditor 
            nodes={selectedNodes} 
            onUpdate={onNodeUpdate}
          />
        ) : (
          renderNodeForm()
        )}
      </div>
    </div>
  );
};
```

### 4. StoryNodeForm Component

**Purpose**: Specialized form for story node properties

```typescript
interface StoryNodeFormProps {
  node: AdventureNode & { type: 'story' };
  onUpdate: (nodeId: string, updates: Partial<AdventureNode>) => void;
  readonly?: boolean;
}

const StoryNodeForm: React.FC<StoryNodeFormProps> = ({ node, onUpdate, readonly }) => {
  const [properties, setProperties] = useState(node.properties as StoryProperties);
  
  // Debounced updates to prevent excessive API calls
  const debouncedUpdate = useDebouncedCallback(
    (updates: Partial<AdventureNode>) => {
      onUpdate(node.id, updates);
    },
    300
  );
  
  const updateProperty = (key: keyof StoryProperties, value: any) => {
    const newProperties = { ...properties, [key]: value };
    setProperties(newProperties);
    debouncedUpdate({ properties: newProperties });
  };
  
  return (
    <form className="story-node-form">
      {/* Element Title */}
      <div className="form-group">
        <label htmlFor="title">Element Title</label>
        <input
          id="title"
          type="text"
          value={properties.title}
          onChange={(e) => updateProperty('title', e.target.value)}
          placeholder="Enter element title..."
          disabled={readonly}
          className="form-input"
        />
      </div>
      
      {/* Rich Text Story Content */}
      <div className="form-group">
        <label htmlFor="content">Story and Notes</label>
        <RichTextEditor
          id="content"
          value={properties.content}
          onChange={(content) => updateProperty('content', content)}
          placeholder="Provide notes for yourself and for players for this point in the adventure..."
          readonly={readonly}
          toolbar={['bold', 'italic', 'bulletList', 'numberedList', 'quote']}
        />
      </div>
      
      {/* Image Upload */}
      <div className="form-group">
        <label>Add Image</label>
        <ImageUpload
          currentImage={properties.image}
          onImageChange={(image) => updateProperty('image', image)}
          disabled={readonly}
        />
        {properties.image && (
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={properties.image.hideFromPlayers}
              onChange={(e) => updateProperty('image', {
                ...properties.image,
                hideFromPlayers: e.target.checked
              })}
            />
            Hide image from players
          </label>
        )}
      </div>
      
      {/* Objective */}
      <div className="form-group">
        <label htmlFor="objective">Objective</label>
        <input
          id="objective"
          type="text"
          value={properties.objective || ''}
          onChange={(e) => updateProperty('objective', e.target.value)}
          placeholder="Retrieve silver sword hilt..."
          disabled={readonly}
          className="form-input"
        />
      </div>
      
      {/* Items */}
      <div className="form-group">
        <label>Items</label>
        <ItemSelector
          selectedItems={properties.items || []}
          onItemsChange={(items) => updateProperty('items', items)}
          disabled={readonly}
        />
      </div>
      
      {/* Experience Points */}
      <div className="form-group">
        <label htmlFor="xp">Experience Points</label>
        <input
          id="xp"
          type="number"
          min="0"
          value={properties.experiencePoints}
          onChange={(e) => updateProperty('experiencePoints', parseInt(e.target.value) || 0)}
          disabled={readonly}
          className="form-input"
        />
      </div>
      
      {/* End Conditions */}
      <div className="form-group">
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={properties.endConditions.victory}
              onChange={(e) => updateProperty('endConditions', {
                ...properties.endConditions,
                victory: e.target.checked
              })}
            />
            Send to Victory Screen
          </label>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={properties.endConditions.failure}
              onChange={(e) => updateProperty('endConditions', {
                ...properties.endConditions,
                failure: e.target.checked
              })}
            />
            Send to Fail Screen
          </label>
        </div>
      </div>
    </form>
  );
};
```

### 5. RichTextEditor Component

**Purpose**: WYSIWYG editor for node content with SPARC theming

```typescript
interface RichTextEditorProps {
  id: string;
  value: RichTextContent;
  onChange: (content: RichTextContent) => void;
  placeholder?: string;
  readonly?: boolean;
  toolbar?: ToolbarOption[];
  maxLength?: number;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter text...",
  readonly = false,
  toolbar = ['bold', 'italic', 'bulletList', 'numberedList']
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className={cn(
      'rich-text-editor',
      isFocused && 'rich-text-editor--focused',
      readonly && 'rich-text-editor--readonly'
    )}>
      {/* Toolbar */}
      {!readonly && (
        <div className="rich-text-toolbar">
          {toolbar.map(tool => (
            <ToolbarButton key={tool} tool={tool} />
          ))}
        </div>
      )}
      
      {/* Content area */}
      <div 
        className="rich-text-content"
        contentEditable={!readonly}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      >
        {/* Content rendered here */}
      </div>
    </div>
  );
};
```

## Mobile-Specific Components

### 6. MobileNodeEditor Component

**Purpose**: Mobile-optimized overlay editor for node properties

```typescript
interface MobileNodeEditorProps {
  node: AdventureNode | null;
  isVisible: boolean;
  onClose: () => void;
  onUpdate: (nodeId: string, updates: Partial<AdventureNode>) => void;
}

const MobileNodeEditor: React.FC<MobileNodeEditorProps> = ({
  node,
  isVisible,
  onClose,
  onUpdate
}) => {
  if (!node || !isVisible) return null;
  
  return (
    <div className="mobile-node-editor">
      <div className="mobile-editor-backdrop" onClick={onClose} />
      
      <div className="mobile-editor-sheet">
        {/* Handle bar for dragging */}
        <div className="sheet-handle" />
        
        {/* Header */}
        <div className="mobile-editor-header">
          <h3>{NODE_TYPE_CONFIG[node.type].label}</h3>
          <button onClick={onClose} className="close-button">
            ✕
          </button>
        </div>
        
        {/* Scrollable content */}
        <div className="mobile-editor-content">
          <NodeFormRenderer node={node} onUpdate={onUpdate} />
        </div>
        
        {/* Action buttons */}
        <div className="mobile-editor-actions">
          <button className="action-button secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="action-button primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
```

**Mobile Editor Styling**
```scss
.mobile-node-editor {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  
  // Only visible on mobile
  @media (min-width: 768px) {
    display: none;
  }
}

.mobile-editor-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.mobile-editor-sheet {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 80vh;
  background: var(--sparc-neutral-dark);
  border-radius: 16px 16px 0 0;
  box-shadow: var(--sparc-elevation-lg);
  
  // Smooth slide-up animation
  transform: translateY(100%);
  animation: slideUp 300ms ease-out forwards;
}

@keyframes slideUp {
  to {
    transform: translateY(0);
  }
}

.sheet-handle {
  width: 40px;
  height: 4px;
  background: var(--sparc-neutral-light);
  border-radius: 2px;
  margin: 12px auto 8px;
}
```

## Responsive Breakpoint Components

### 7. ResponsiveLayout Component

**Purpose**: Adaptive layout that changes based on screen size

```typescript
interface ResponsiveLayoutProps {
  children: React.ReactNode;
  sidebarContent?: React.ReactNode;
  panelContent?: React.ReactNode;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  sidebarContent,
  panelContent
}) => {
  const [isMobile] = useMediaQuery('(max-width: 767px)');
  const [isTablet] = useMediaQuery('(max-width: 1023px)');
  
  if (isMobile) {
    return (
      <div className="layout-mobile">
        <main className="mobile-main">
          {children}
        </main>
        
        {/* Bottom sheet for tools */}
        <MobileToolsSheet>
          {sidebarContent}
        </MobileToolsSheet>
        
        {/* Full-screen overlay for properties */}
        <MobilePropertiesOverlay>
          {panelContent}
        </MobilePropertiesOverlay>
      </div>
    );
  }
  
  if (isTablet) {
    return (
      <div className="layout-tablet">
        <aside className="tablet-sidebar">
          {sidebarContent}
        </aside>
        
        <main className="tablet-main">
          {children}
        </main>
        
        <aside className="tablet-panel">
          {panelContent}
        </aside>
      </div>
    );
  }
  
  return (
    <div className="layout-desktop">
      <aside className="desktop-sidebar">
        {sidebarContent}
      </aside>
      
      <main className="desktop-main">
        {children}
      </main>
      
      <aside className="desktop-panel">
        {panelContent}
      </aside>
    </div>
  );
};
```

## Performance Optimization Components

### 8. VirtualizedNodeList Component

**Purpose**: Efficient rendering of large numbers of nodes

```typescript
interface VirtualizedNodeListProps {
  nodes: AdventureNode[];
  viewport: CanvasViewport;
  containerRef: React.RefObject<HTMLDivElement>;
  renderNode: (node: AdventureNode) => React.ReactNode;
}

const VirtualizedNodeList: React.FC<VirtualizedNodeListProps> = ({
  nodes,
  viewport,
  containerRef,
  renderNode
}) => {
  // Calculate which nodes are currently visible
  const visibleNodes = useMemo(() => {
    if (!containerRef.current) return nodes;
    
    const containerBounds = containerRef.current.getBoundingClientRect();
    const viewportBounds = {
      left: viewport.x - 100, // Add padding for smooth scrolling
      top: viewport.y - 100,
      right: viewport.x + containerBounds.width + 100,
      bottom: viewport.y + containerBounds.height + 100
    };
    
    return nodes.filter(node => {
      const nodeScreenPos = canvasToScreen(node.position, viewport);
      return (
        nodeScreenPos.x > viewportBounds.left &&
        nodeScreenPos.x < viewportBounds.right &&
        nodeScreenPos.y > viewportBounds.top &&
        nodeScreenPos.y < viewportBounds.bottom
      );
    });
  }, [nodes, viewport, containerRef]);
  
  return (
    <>
      {visibleNodes.map(node => renderNode(node))}
    </>
  );
};
```

## Integration Guidelines

### Component Usage Patterns

```typescript
// Main Adventure Forge Integration Example
const AdventureForgeEditor: React.FC = () => {
  const [adventure, setAdventure] = useState<Adventure | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [viewport, setViewport] = useState<CanvasViewport>({
    x: 0, y: 0, scale: 1
  });
  
  return (
    <ResponsiveLayout
      sidebarContent={
        <ElementPalette 
          onElementSelect={handleElementCreate}
        />
      }
      panelContent={
        <NodePropertiesPanel
          selectedNodes={selectedNodes.map(id => 
            adventure?.canvas.nodes.find(n => n.id === id)
          ).filter(Boolean) || []}
          onNodeUpdate={handleNodeUpdate}
          onClose={() => setSelectedNodes([])}
        />
      }
    >
      <AdventureCanvas
        adventureId={adventure?.id || ''}
        nodes={adventure?.canvas.nodes || []}
        connections={adventure?.canvas.connections || []}
        viewport={viewport}
        selectedNodes={selectedNodes}
        onNodeCreate={handleNodeCreate}
        onNodeUpdate={handleNodeUpdate}
        onNodeSelect={setSelectedNodes}
        onViewportChange={setViewport}
      />
    </ResponsiveLayout>
  );
};
```

### Testing Requirements

```typescript
// Component Testing Specifications
describe('AdventureNode', () => {
  it('should render correctly for each node type', () => {
    // Test all five node types
  });
  
  it('should handle drag operations without performance issues', () => {
    // Performance test for dragging
  });
  
  it('should show validation states correctly', () => {
    // Test error, warning, and valid states
  });
  
  it('should be accessible via keyboard navigation', () => {
    // Accessibility test
  });
});
```

This comprehensive component specification provides everything needed for developers to implement the Adventure Forge system with consistent styling, proper interactions, and optimal performance across all device types.