import React, { useState, useCallback, useEffect } from 'react';
import { Canvas } from './Canvas';
import { NodePropertyPanel } from './NodePropertyPanel';
import { ValidationPanel } from './ValidationPanel';
import { AdventureManagerPanel } from './AdventureManagerPanel';
import { DataManager, AdventureData, AdventureMetadata } from './DataManager';
import { 
  CanvasState, 
  CanvasViewport, 
  AdventureNode, 
  NodeConnection, 
  Point, 
  NodeType 
} from './types';

interface AdventureForgeProps {
  adventureId?: string;
  initialNodes?: AdventureNode[];
  initialConnections?: NodeConnection[];
  onSave?: (nodes: AdventureNode[], connections: NodeConnection[]) => void;
  className?: string;
}

export const AdventureForge: React.FC<AdventureForgeProps> = ({
  adventureId,
  initialNodes = [],
  initialConnections = [],
  onSave,
  className = ''
}) => {
  // Initialize canvas state
  const [canvasState, setCanvasState] = useState<CanvasState>(() => ({
    viewport: {
      x: 0,
      y: 0,
      scale: 1.0
    },
    nodes: initialNodes,
    connections: initialConnections,
    selectedNodes: [],
    dragState: null,
    mode: 'select'
  }));

  const [showNodePalette, setShowNodePalette] = useState(false);
  const [selectedNodeForEdit, setSelectedNodeForEdit] = useState<AdventureNode | null>(null);
  const [showValidationPanel, setShowValidationPanel] = useState(false);
  const [showManagerPanel, setShowManagerPanel] = useState(false);
  const [dataManager] = useState(() => new DataManager());
  const [currentAdventureMetadata, setCurrentAdventureMetadata] = useState<AdventureMetadata | null>(null);

  // Auto-save functionality
  useEffect(() => {
    if (onSave && canvasState.nodes.length > 0) {
      const saveTimeout = setTimeout(() => {
        onSave(canvasState.nodes, canvasState.connections);
      }, 1000); // Debounce saves

      return () => clearTimeout(saveTimeout);
    }
  }, [canvasState.nodes, canvasState.connections, onSave]);

  // Load from localStorage on mount
  useEffect(() => {
    if (adventureId) {
      const saved = localStorage.getItem(`adventure-${adventureId}`);
      if (saved) {
        try {
          const { nodes, connections, viewport } = JSON.parse(saved);
          setCanvasState(prev => ({
            ...prev,
            nodes: nodes || [],
            connections: connections || [],
            viewport: viewport || prev.viewport
          }));
        } catch (error) {
          console.warn('Failed to load saved adventure:', error);
        }
      }
    }
    
    // Initialize default adventure metadata if none exists
    if (!currentAdventureMetadata && canvasState.nodes.length > 0) {
      setCurrentAdventureMetadata({
        id: adventureId || dataManager.generateAdventureId(),
        title: 'Untitled Adventure',
        author: 'Unknown Author',
        description: '',
        version: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tags: [],
        estimatedPlaytime: 30,
        difficulty: 'beginner',
        isPublic: false
      });
    }
  }, [adventureId, currentAdventureMetadata, canvasState.nodes.length, dataManager]);

  // Save to localStorage when state changes
  useEffect(() => {
    if (adventureId && canvasState.nodes.length > 0) {
      const saveData = {
        nodes: canvasState.nodes,
        connections: canvasState.connections,
        viewport: canvasState.viewport
      };
      localStorage.setItem(`adventure-${adventureId}`, JSON.stringify(saveData));
    }
  }, [adventureId, canvasState.nodes, canvasState.connections, canvasState.viewport]);

  // Generate unique ID
  const generateId = useCallback(() => {
    return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Create new node
  const createNode = useCallback((position: Point, type: NodeType) => {
    const newNode: AdventureNode = {
      id: generateId(),
      type,
      position,
      validationState: 'error', // New nodes start with errors until configured
      properties: getDefaultProperties(type),
      connections: {
        inputs: getDefaultInputs(type),
        outputs: getDefaultOutputs(type)
      }
    };

    setCanvasState(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
      selectedNodes: [newNode.id],
      mode: 'select'
    }));

    setShowNodePalette(false);
  }, [generateId]);

  // Update node
  const updateNode = useCallback((nodeId: string, updates: Partial<AdventureNode>) => {
    setCanvasState(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === nodeId ? { ...node, ...updates } : node
      )
    }));
  }, []);

  // Delete selected nodes
  const deleteSelectedNodes = useCallback(() => {
    setCanvasState(prev => ({
      ...prev,
      nodes: prev.nodes.filter(node => !prev.selectedNodes.includes(node.id)),
      connections: prev.connections.filter(conn => 
        !prev.selectedNodes.includes(conn.sourceNodeId) && 
        !prev.selectedNodes.includes(conn.targetNodeId)
      ),
      selectedNodes: []
    }));
  }, []);

  // Create connection
  const createConnection = useCallback((sourceId: string, targetId: string) => {
    const connectionId = generateId();
    const newConnection: NodeConnection = {
      id: connectionId,
      sourceNodeId: sourceId,
      sourcePort: 'output',
      targetNodeId: targetId,
      targetPort: 'input',
      path: {
        start: { x: 0, y: 0 },
        control1: { x: 0, y: 0 },
        control2: { x: 0, y: 0 },
        end: { x: 0, y: 0 }
      },
      validation: {
        isValid: true,
        errors: [],
        warnings: []
      }
    };

    setCanvasState(prev => ({
      ...prev,
      connections: [...prev.connections, newConnection]
    }));
  }, [generateId]);

  // Zoom controls
  const zoomIn = useCallback(() => {
    setCanvasState(prev => ({
      ...prev,
      viewport: {
        ...prev.viewport,
        scale: Math.min(3.0, prev.viewport.scale * 1.2)
      }
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setCanvasState(prev => ({
      ...prev,
      viewport: {
        ...prev.viewport,
        scale: Math.max(0.1, prev.viewport.scale / 1.2)
      }
    }));
  }, []);

  const resetZoom = useCallback(() => {
    setCanvasState(prev => ({
      ...prev,
      viewport: {
        ...prev.viewport,
        scale: 1.0
      }
    }));
  }, []);

  // Center on nodes
  const centerOnNodes = useCallback(() => {
    if (canvasState.nodes.length === 0) return;

    const bounds = canvasState.nodes.reduce(
      (acc, node) => ({
        minX: Math.min(acc.minX, node.position.x),
        maxX: Math.max(acc.maxX, node.position.x),
        minY: Math.min(acc.minY, node.position.y),
        maxY: Math.max(acc.maxY, node.position.y)
      }),
      { 
        minX: Infinity, 
        maxX: -Infinity, 
        minY: Infinity, 
        maxY: -Infinity 
      }
    );

    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;

    setCanvasState(prev => ({
      ...prev,
      viewport: {
        ...prev.viewport,
        x: -centerX,
        y: -centerY
      }
    }));
  }, [canvasState.nodes]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't handle shortcuts when typing
      }

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          if (canvasState.selectedNodes.length > 0) {
            deleteSelectedNodes();
          }
          break;
        case 'Enter':
          if (canvasState.selectedNodes.length === 1) {
            const node = canvasState.nodes.find(n => n.id === canvasState.selectedNodes[0]);
            if (node) {
              setSelectedNodeForEdit(node);
            }
          }
          break;
        case ' ':
          e.preventDefault();
          setShowNodePalette(true);
          break;
        case 'Escape':
          setShowNodePalette(false);
          setCanvasState(prev => ({ ...prev, selectedNodes: [] }));
          break;
        case '1':
          if (!showNodePalette) {
            setShowNodePalette(true);
          }
          break;
      }

      // Zoom shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '=':
          case '+':
            e.preventDefault();
            zoomIn();
            break;
          case '-':
            e.preventDefault();
            zoomOut();
            break;
          case '0':
            e.preventDefault();
            resetZoom();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canvasState.selectedNodes, canvasState.nodes, showNodePalette, deleteSelectedNodes, zoomIn, zoomOut, resetZoom]);

  // Handle canvas double-click to create nodes
  const handleCanvasDoubleClick = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const screenPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    
    // Convert to canvas coordinates
    const canvasPoint = {
      x: (screenPoint.x / canvasState.viewport.scale) - canvasState.viewport.x,
      y: (screenPoint.y / canvasState.viewport.scale) - canvasState.viewport.y
    };

    setShowNodePalette(true);
    // Store the position for when user selects node type
    (window as any).pendingNodePosition = canvasPoint;
  }, [canvasState.viewport]);

  return (
    <div className={`relative w-full h-full flex flex-col ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">Adventure Forge</h1>
          <div className="text-sm text-gray-500">
            {canvasState.nodes.length} nodes, {canvasState.connections.length} connections
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Zoom controls */}
          <button
            onClick={zoomOut}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
            title="Zoom Out (Ctrl+-)"
          >
            −
          </button>
          
          <span className="px-3 py-1 text-sm bg-gray-100 rounded">
            {(canvasState.viewport.scale * 100).toFixed(0)}%
          </span>
          
          <button
            onClick={zoomIn}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
            title="Zoom In (Ctrl++)"
          >
            +
          </button>
          
          <button
            onClick={resetZoom}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
            title="Reset Zoom (Ctrl+0)"
          >
            100%
          </button>
          
          <button
            onClick={centerOnNodes}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
            title="Center on Nodes"
          >
            Center
          </button>
          
          <button
            onClick={() => setShowValidationPanel(!showValidationPanel)}
            className={`px-4 py-2 rounded ${showValidationPanel ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-green-700`}
            title="Toggle Validation Panel"
          >
            Validate
          </button>
          
          <button
            onClick={() => setShowManagerPanel(!showManagerPanel)}
            className={`px-4 py-2 rounded ${showManagerPanel ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-purple-700`}
            title="Toggle Adventure Manager"
          >
            Manage
          </button>
          
          <button
            onClick={() => setShowNodePalette(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            title="Add Node (Space)"
          >
            Add Node
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Canvas */}
        <div className="flex-1 relative">
          <Canvas
            state={canvasState}
            onStateChange={setCanvasState}
            onNodeCreate={createNode}
            onNodeUpdate={updateNode}
            onConnectionCreate={createConnection}
            onNodeDoubleClick={(nodeId) => {
              const node = canvasState.nodes.find(n => n.id === nodeId);
              if (node) {
                setSelectedNodeForEdit(node);
              }
            }}
          />
        
        {/* Node Palette */}
        {showNodePalette && (
          <NodePalette
            onCreateNode={(type) => {
              const position = (window as any).pendingNodePosition || { x: 0, y: 0 };
              createNode(position, type);
              delete (window as any).pendingNodePosition;
            }}
            onClose={() => setShowNodePalette(false)}
          />
        )}

          {/* Node Property Panel */}
          {selectedNodeForEdit && (
            <NodePropertyPanel
              node={selectedNodeForEdit}
              onUpdateNode={(nodeId, updates) => {
                updateNode(nodeId, updates);
                // Update the selected node reference
                const updatedNode = canvasState.nodes.find(n => n.id === nodeId);
                if (updatedNode) {
                  setSelectedNodeForEdit({ ...updatedNode, ...updates });
                }
              }}
              onClose={() => setSelectedNodeForEdit(null)}
            />
          )}
        </div>

        {/* Sidebar Panels */}
        {(showValidationPanel || showManagerPanel) && (
          <div className="w-96 border-l border-gray-200 bg-white overflow-hidden flex flex-col">
            {showValidationPanel && (
              <ValidationPanel
                nodes={canvasState.nodes}
                connections={canvasState.connections}
                onNodeSelect={(nodeId) => {
                  const node = canvasState.nodes.find(n => n.id === nodeId);
                  if (node) {
                    // Select the node in the canvas
                    setCanvasState(prev => ({
                      ...prev,
                      selectedNodes: [nodeId]
                    }));
                    // Close validation panel and open property panel
                    setSelectedNodeForEdit(node);
                  }
                }}
                className={showManagerPanel ? "flex-1 border-b border-gray-200" : "flex-1"}
              />
            )}
            
            {showManagerPanel && (
              <AdventureManagerPanel
                currentAdventure={currentAdventureMetadata ? {
                  metadata: currentAdventureMetadata,
                  nodes: canvasState.nodes,
                  connections: canvasState.connections
                } : undefined}
                onLoadAdventure={(adventure: AdventureData) => {
                  // Load the adventure into the canvas
                  setCanvasState(prev => ({
                    ...prev,
                    nodes: adventure.nodes,
                    connections: adventure.connections
                  }));
                  setCurrentAdventureMetadata(adventure.metadata);
                  // Close manager panel
                  setShowManagerPanel(false);
                }}
                onNewAdventure={() => {
                  // Create new blank adventure
                  const newAdventure = dataManager.createAdventure('New Adventure', 'Author');
                  setCanvasState(prev => ({
                    ...prev,
                    nodes: newAdventure.nodes,
                    connections: newAdventure.connections
                  }));
                  setCurrentAdventureMetadata(newAdventure.metadata);
                  setShowManagerPanel(false);
                }}
                className={showValidationPanel ? "flex-1" : "flex-1"}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Node Palette Component
interface NodePaletteProps {
  onCreateNode: (type: NodeType) => void;
  onClose: () => void;
}

const NodePalette: React.FC<NodePaletteProps> = ({ onCreateNode, onClose }) => {
  const nodeTypes = [
    { type: 'story' as NodeType, label: 'Story', color: 'bg-blue-500', description: 'Narrative content and world-building' },
    { type: 'decision' as NodeType, label: 'Decision', color: 'bg-purple-500', description: 'Player choices and branching paths' },
    { type: 'challenge' as NodeType, label: 'Challenge', color: 'bg-yellow-500', description: 'Skill checks and stat tests' },
    { type: 'combat' as NodeType, label: 'Combat', color: 'bg-red-500', description: 'Battles and encounters' },
    { type: 'check' as NodeType, label: 'Check', color: 'bg-green-500', description: 'Simple pass/fail tests' },
  ];

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add Node</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {nodeTypes.map(({ type, label, color, description }) => (
            <button
              key={type}
              onClick={() => onCreateNode(type)}
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-left"
            >
              <div className={`w-4 h-4 rounded-full ${color} mr-3`} />
              <div>
                <div className="font-medium text-gray-900">{label}</div>
                <div className="text-sm text-gray-500">{description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper functions for default node properties
function getDefaultProperties(type: NodeType): any {
  const base = { title: `New ${type} node` };
  
  switch (type) {
    case 'story':
      return {
        ...base,
        content: { text: '' },
        experiencePoints: 0,
        endConditions: { victory: false, failure: false }
      };
    case 'decision':
      return {
        ...base,
        objective: '',
        content: { text: '' },
        decisions: []
      };
    case 'challenge':
      return {
        ...base,
        objective: '',
        stat: 'STR',
        outcomes: [],
        content: { text: '' }
      };
    case 'combat':
      return {
        ...base,
        objective: '',
        creatures: [],
        outcomes: [],
        content: { text: '' }
      };
    case 'check':
      return {
        ...base,
        objective: '',
        checkType: 'simple',
        outcomes: {
          success: { description: '', targetConnection: { type: 'new' } },
          failure: { description: '', targetConnection: { type: 'new' } }
        },
        content: { text: '' }
      };
    default:
      return base;
  }
}

function getDefaultInputs(type: NodeType) {
  return [{ id: 'input', label: 'Input', position: { x: -30, y: 0 } }];
}

function getDefaultOutputs(type: NodeType) {
  switch (type) {
    case 'decision':
      return [
        { id: 'option1', label: 'Option 1', position: { x: 30, y: -10 } },
        { id: 'option2', label: 'Option 2', position: { x: 30, y: 10 } }
      ];
    case 'challenge':
      return [
        { id: 'success', label: 'Success', position: { x: 30, y: -10 } },
        { id: 'failure', label: 'Failure', position: { x: 30, y: 10 } }
      ];
    case 'combat':
      return [
        { id: 'victory', label: 'Victory', position: { x: 30, y: -15 } },
        { id: 'defeat', label: 'Defeat', position: { x: 30, y: 0 } },
        { id: 'flee', label: 'Flee', position: { x: 30, y: 15 } }
      ];
    case 'check':
      return [
        { id: 'pass', label: 'Pass', position: { x: 30, y: -10 } },
        { id: 'fail', label: 'Fail', position: { x: 30, y: 10 } }
      ];
    default:
      return [{ id: 'output', label: 'Output', position: { x: 30, y: 0 } }];
  }
}