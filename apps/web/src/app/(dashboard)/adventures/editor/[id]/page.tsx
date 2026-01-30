"use client";

/**
 * Adventure Editor Page (Forge)
 * 
 * Visual adventure editor with canvas, node palette, property panel,
 * and real-time validation. Based on PRDs 08-11.
 */

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Textarea,
  useToast,
  Tabs,
  TabList,
  Tab,
  // Adventure Forge
  ForgeCanvas,
  NodePalette,
  NodeEditor,
  ValidationPanel,
  createNode,
  duplicateNode,
  validateAdventure,
  createConnection,
  getConnectionType,
  generateId,
  // Publishing
  PublishButton,
  // Types
  type Adventure,
  type AdventureNode,
  type NodeType,
  type Point,
  type ValidationResult,
} from "@sparc/ui";

// Storage key prefix for adventures
const STORAGE_KEY = "sparc-adventure-";

// Create empty adventure
function createEmptyAdventure(id: string): Adventure {
  const startNodeId = generateId();
  return {
    id,
    title: "",
    description: "",
    startNodeId,
    nodes: [
      {
        id: startNodeId,
        adventureId: id,
        type: "story",
        position: { x: 100, y: 200 },
        title: "Beginning",
        content: "Your adventure begins here...",
        imageVisibleToPlayers: true,
        isVictoryNode: false,
        isFailureNode: false,
        experienceReward: 0,
        itemRewards: [],
        data: { objectives: [] },
      },
    ],
    connections: [],
    isPublished: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Load adventure from localStorage
function loadAdventure(id: string): Adventure | null {
  if (typeof window === "undefined") return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY + id);
    if (stored) {
      return JSON.parse(stored) as Adventure;
    }
  } catch (e) {
    console.error("Failed to load adventure:", e);
  }
  
  return null;
}

// Save adventure to localStorage
function saveAdventure(adventure: Adventure): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(STORAGE_KEY + adventure.id, JSON.stringify(adventure));
  } catch (e) {
    console.error("Failed to save adventure:", e);
  }
}

export default function AdventureEditorPage(): JSX.Element | null {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const adventureId = params.id as string;
  const isNew = adventureId === "new";
  
  // State
  const [adventure, setAdventure] = React.useState<Adventure | null>(null);
  const [selectedNodeIds, setSelectedNodeIds] = React.useState<string[]>([]);
  const [validation, setValidation] = React.useState<ValidationResult | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [rightPanelTab, setRightPanelTab] = React.useState<"properties" | "validation">("properties");
  const [zoomLevel, setZoomLevel] = React.useState(100);
  
  // Zoom presets
  const ZOOM_PRESETS = [50, 75, 100, 125, 150, 200];
  const ZOOM_MIN = 25;
  const ZOOM_MAX = 300;
  const ZOOM_STEP = 25;
  
  // Load adventure on mount
  React.useEffect(() => {
    if (isNew) {
      const newId = generateId();
      const newAdventure = createEmptyAdventure(newId);
      setAdventure(newAdventure);
      // Update URL without navigation
      window.history.replaceState(null, "", `/adventures/editor/${newId}`);
    } else {
      const loaded = loadAdventure(adventureId);
      if (loaded) {
        setAdventure(loaded);
      } else {
        // Adventure not found, create new
        const newAdventure = createEmptyAdventure(adventureId);
        setAdventure(newAdventure);
      }
    }
  }, [adventureId, isNew]);
  
  // Run validation when adventure changes
  React.useEffect(() => {
    if (adventure) {
      const result = validateAdventure(adventure);
      setValidation(result);
    }
  }, [adventure]);
  
  // Get selected node
  const selectedNode = selectedNodeIds.length === 1
    ? adventure?.nodes.find((n) => n.id === selectedNodeIds[0])
    : null;
  
  // Handlers
  const handleSave = async () => {
    if (!adventure) return;
    
    setIsSaving(true);
    try {
      saveAdventure({
        ...adventure,
        updatedAt: new Date().toISOString(),
      });
      toast.success("Adventure saved!", {
        description: "Your changes have been saved to local storage.",
      });
    } catch {
      toast.error("Save failed", {
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleUpdateAdventure = (updates: Partial<Adventure>) => {
    if (!adventure) return;
    setAdventure({ ...adventure, ...updates });
  };
  
  const handleNodeSelect = (nodeIds: string[]) => {
    setSelectedNodeIds(nodeIds);
    if (nodeIds.length > 0) {
      setRightPanelTab("properties");
    }
  };
  
  const handleNodeMove = (nodeId: string, position: Point) => {
    if (!adventure) return;
    
    setAdventure({
      ...adventure,
      nodes: adventure.nodes.map((node) =>
        node.id === nodeId ? { ...node, position } : node
      ),
    });
  };
  
  const handleNodeUpdate = (updates: Partial<AdventureNode>) => {
    if (!adventure || !selectedNode) return;
    
    setAdventure({
      ...adventure,
      nodes: adventure.nodes.map((node) =>
        node.id === selectedNode.id 
          ? { ...node, ...updates } as AdventureNode 
          : node
      ),
    });
  };
  
  const handleNodeDelete = () => {
    if (!adventure || selectedNodeIds.length === 0) return;
    
    // Don't delete start node
    if (selectedNodeIds.includes(adventure.startNodeId || "")) {
      toast.error("Cannot delete start node", {
        description: "The start node cannot be deleted. Set another node as start first.",
      });
      return;
    }
    
    setAdventure({
      ...adventure,
      nodes: adventure.nodes.filter((n) => !selectedNodeIds.includes(n.id)),
      connections: adventure.connections.filter(
        (c) => !selectedNodeIds.includes(c.sourceNodeId) && !selectedNodeIds.includes(c.targetNodeId)
      ),
    });
    setSelectedNodeIds([]);
  };
  
  const handleSetAsStart = () => {
    if (!adventure || selectedNodeIds.length !== 1) return;
    
    setAdventure({
      ...adventure,
      startNodeId: selectedNodeIds[0],
    });
    
    toast.success("Start node updated");
  };
  
  const handleConnectionCreate = (sourceNodeId: string, sourcePort: string, targetNodeId: string) => {
    if (!adventure) return;
    
    const connection = createConnection(
      adventure.id,
      sourceNodeId,
      sourcePort,
      targetNodeId,
      getConnectionType(sourcePort)
    );
    
    setAdventure({
      ...adventure,
      connections: [...adventure.connections, connection],
    });
  };
  
  const handleConnectionDelete = (connectionId: string) => {
    if (!adventure) return;
    
    setAdventure({
      ...adventure,
      connections: adventure.connections.filter((c) => c.id !== connectionId),
    });
  };
  
  const handleNodeDragStart = (_type: NodeType) => {
    // Drag started - visual feedback handled by browser
  };
  
  const handleNodeDragEnd = (type: NodeType, position: { x: number; y: number } | null) => {
    if (!adventure || !position) return;
    
    // Convert screen position to canvas position (simplified - assumes no pan/zoom)
    // In a full implementation, we'd get the canvas offset and transform
    const canvasElement = document.querySelector(".forge-canvas");
    if (!canvasElement) return;
    
    const rect = canvasElement.getBoundingClientRect();
    const canvasPosition = {
      x: position.x - rect.left,
      y: position.y - rect.top,
    };
    
    const newNode = createNode(type, canvasPosition, adventure.id);
    
    setAdventure({
      ...adventure,
      nodes: [...adventure.nodes, newNode],
    });
    
    // Select the new node
    setSelectedNodeIds([newNode.id]);
    setRightPanelTab("properties");
  };
  
  const handleDuplicateNode = () => {
    if (!adventure || selectedNodeIds.length !== 1) return;
    
    const nodeToDuplicate = adventure.nodes.find((n) => n.id === selectedNodeIds[0]);
    if (!nodeToDuplicate) return;
    
    const newNode = duplicateNode(nodeToDuplicate);
    
    setAdventure({
      ...adventure,
      nodes: [...adventure.nodes, newNode],
    });
    
    setSelectedNodeIds([newNode.id]);
    toast.success("Node duplicated");
  };
  
  const handleValidationNodeClick = (nodeId: string) => {
    setSelectedNodeIds([nodeId]);
    setRightPanelTab("properties");
    // TODO: Center canvas on node
  };
  
  // Canvas drop handler
  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    const nodeType = e.dataTransfer.getData("nodeType") as NodeType;
    if (!nodeType || !adventure) return;
    
    const canvasElement = e.currentTarget as HTMLElement;
    const rect = canvasElement.getBoundingClientRect();
    
    const position = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    
    const newNode = createNode(nodeType, position, adventure.id);
    
    setAdventure({
      ...adventure,
      nodes: [...adventure.nodes, newNode],
    });
    
    setSelectedNodeIds([newNode.id]);
    setRightPanelTab("properties");
  };
  
  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };
  
  // Loading state
  if (!adventure) {
    return (
      <div className="h-[calc(100vh-10rem)] flex items-center justify-center">
        <div className="text-muted-foreground">Loading adventure...</div>
      </div>
    );
  }
  
  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/adventures")}
          >
            ← Back
          </Button>
          <div>
            <h2 className="text-xl font-semibold">Adventure Forge</h2>
            <p className="text-sm text-muted-foreground">
              {adventure.title || "Untitled Adventure"}
              {validation && !validation.isValid && (
                <span className="ml-2 text-error">
                  ({validation.errors.length} error{validation.errors.length !== 1 && "s"})
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleDuplicateNode} disabled={selectedNodeIds.length !== 1}>
            Duplicate
          </Button>
          <Button variant="ghost" size="sm">
            Preview
          </Button>
          <PublishButton
            isPublished={adventure.isPublished}
            validation={validation ? {
              isValid: validation.isValid,
              canPublish: validation.canPublish,
              errors: validation.errors.map(e => e.message),
              warnings: validation.warnings.map(w => w.message),
            } : undefined}
            onClick={() => router.push(`/adventures/${adventure.id}/publish`)}
          />
          <Button variant="primary" size="sm" loading={isSaving} onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-5 gap-4 min-h-0">
        {/* Left Panel - Node Palette */}
        <Card className="col-span-1 overflow-hidden flex flex-col">
          <CardHeader className="py-3 shrink-0">
            <CardTitle className="text-sm">Node Types</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <NodePalette
              onNodeDragStart={handleNodeDragStart}
              onNodeDragEnd={handleNodeDragEnd}
            />
          </CardContent>
        </Card>

        {/* Center - Canvas */}
        <Card className="col-span-3 overflow-hidden flex flex-col">
          <CardHeader className="py-3 flex-row items-center justify-between shrink-0">
            <CardTitle className="text-sm">Canvas</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{adventure.nodes.length} nodes</span>
              <span>•</span>
              <span>{adventure.connections.length} connections</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden relative">
            <div
              className="w-full h-full"
              onDrop={handleCanvasDrop}
              onDragOver={handleCanvasDragOver}
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left' }}
            >
              <ForgeCanvas
                adventure={adventure}
                onNodeSelect={handleNodeSelect}
                onNodeMove={handleNodeMove}
                onNodeDoubleClick={(nodeId) => {
                  setSelectedNodeIds([nodeId]);
                  setRightPanelTab("properties");
                }}
                onConnectionCreate={handleConnectionCreate}
                onConnectionDelete={handleConnectionDelete}
                className="w-full h-full"
              />
            </div>
            
            {/* Zoom Controls */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-surface-elevated/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-surface-divider">
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => setZoomLevel(Math.max(ZOOM_MIN, zoomLevel - ZOOM_STEP))}
                disabled={zoomLevel <= ZOOM_MIN}
              >
                −
              </Button>
              
              <select
                value={zoomLevel}
                onChange={(e) => setZoomLevel(Number(e.target.value))}
                className="bg-transparent text-sm text-center w-16 cursor-pointer focus:outline-none"
              >
                {ZOOM_PRESETS.map((preset) => (
                  <option key={preset} value={preset} className="bg-surface-elevated">
                    {preset}%
                  </option>
                ))}
              </select>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => setZoomLevel(Math.min(ZOOM_MAX, zoomLevel + ZOOM_STEP))}
                disabled={zoomLevel >= ZOOM_MAX}
              >
                +
              </Button>
              
              <div className="w-px h-6 bg-surface-divider mx-1" />
              
              <Button
                variant="ghost"
                size="sm"
                className="text-xs px-2"
                onClick={() => setZoomLevel(100)}
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Panel - Properties & Validation */}
        <Card className="col-span-1 overflow-hidden flex flex-col">
          <CardHeader className="py-2 shrink-0">
            <Tabs value={rightPanelTab} onChange={(value) => setRightPanelTab(value as "properties" | "validation")}>
              <TabList variant="pills" className="w-full">
                <Tab value="properties" className="flex-1 text-xs">Properties</Tab>
                <Tab value="validation" className="flex-1 text-xs">
                  Validate
                  {validation && validation.errors.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-error text-white text-[10px] rounded-full">
                      {validation.errors.length}
                    </span>
                  )}
                </Tab>
              </TabList>
            </Tabs>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-3">
            {rightPanelTab === "properties" && (
              <>
                {selectedNode ? (
                  <NodeEditor
                    node={selectedNode}
                    onUpdate={handleNodeUpdate}
                    onDelete={handleNodeDelete}
                    onSetAsStart={handleSetAsStart}
                    isStartNode={adventure.startNodeId === selectedNode.id}
                  />
                ) : (
                  <AdventureProperties
                    adventure={adventure}
                    onUpdate={handleUpdateAdventure}
                  />
                )}
              </>
            )}
            
            {rightPanelTab === "validation" && validation && (
              <ValidationPanel
                validation={validation}
                onNodeClick={handleValidationNodeClick}
              />
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Keyboard shortcuts hint */}
      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
        <span><kbd className="px-1 py-0.5 bg-surface-elevated rounded">G</kbd> Toggle grid</span>
        <span><kbd className="px-1 py-0.5 bg-surface-elevated rounded">Del</kbd> Delete selected</span>
        <span><kbd className="px-1 py-0.5 bg-surface-elevated rounded">Esc</kbd> Deselect</span>
        <span><kbd className="px-1 py-0.5 bg-surface-elevated rounded">Scroll</kbd> Zoom</span>
        <span><kbd className="px-1 py-0.5 bg-surface-elevated rounded">Drag</kbd> Pan canvas</span>
      </div>
    </div>
  );
}

// Adventure properties panel (when no node selected)
function AdventureProperties({
  adventure,
  onUpdate,
}: {
  adventure: Adventure;
  onUpdate: (updates: Partial<Adventure>) => void;
}): JSX.Element | null {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground">Adventure Settings</h3>
      
      <Input
        label="Title"
        value={adventure.title}
        onChange={(e) => onUpdate({ title: e.target.value })}
        placeholder="Adventure title..."
      />
      
      <Textarea
        label="Description"
        value={adventure.description}
        onChange={(e) => onUpdate({ description: e.target.value })}
        placeholder="Describe your adventure..."
        className="min-h-[100px]"
      />
      
      <div className="pt-4 border-t border-surface-divider space-y-2">
        <h4 className="text-sm font-semibold text-muted-foreground">Statistics</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="p-2 bg-surface-elevated rounded">
            <span className="text-muted-foreground">Nodes:</span>{" "}
            <span className="font-medium">{adventure.nodes.length}</span>
          </div>
          <div className="p-2 bg-surface-elevated rounded">
            <span className="text-muted-foreground">Connections:</span>{" "}
            <span className="font-medium">{adventure.connections.length}</span>
          </div>
          <div className="p-2 bg-surface-elevated rounded">
            <span className="text-muted-foreground">Story:</span>{" "}
            <span className="font-medium">
              {adventure.nodes.filter((n) => n.type === "story").length}
            </span>
          </div>
          <div className="p-2 bg-surface-elevated rounded">
            <span className="text-muted-foreground">Combat:</span>{" "}
            <span className="font-medium">
              {adventure.nodes.filter((n) => n.type === "combat").length}
            </span>
          </div>
        </div>
      </div>
      
      <div className="pt-4 border-t border-surface-divider">
        <p className="text-xs text-muted-foreground">
          💡 Select a node on the canvas to edit its properties.
        </p>
      </div>
    </div>
  );
}
