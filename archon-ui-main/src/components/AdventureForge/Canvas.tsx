import React, { useRef, useEffect, useCallback, useState } from 'react';
import { CanvasState, CanvasViewport, Point, AdventureNode, NodeConnection, DragState, GestureType, NodeType } from './types';
import { ConnectionSystem } from './ConnectionSystem';

interface CanvasProps {
  state: CanvasState;
  onStateChange: (state: CanvasState) => void;
  onNodeCreate?: (position: Point, type: NodeType) => void;
  onNodeUpdate?: (nodeId: string, updates: Partial<AdventureNode>) => void;
  onConnectionCreate?: (sourceId: string, targetId: string) => void;
  onNodeDoubleClick?: (nodeId: string) => void;
  className?: string;
}

export const Canvas: React.FC<CanvasProps> = ({
  state,
  onStateChange,
  onNodeCreate,
  onNodeUpdate,
  onConnectionCreate,
  onNodeDoubleClick,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Touch gesture state
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);
  const [touchStartTime, setTouchStartTime] = useState<number>(0);
  const [gestureActive, setGestureActive] = useState<GestureType | null>(null);
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  const [lastClickedNodeId, setLastClickedNodeId] = useState<string | null>(null);
  const [connectionDrag, setConnectionDrag] = useState<{
    sourceNodeId: string;
    sourcePort: string;
    currentPosition: Point;
  } | null>(null);
  const [hoveredPort, setHoveredPort] = useState<{
    nodeId: string;
    portId: string;
    type: 'input' | 'output';
  } | null>(null);

  // Canvas constants
  const GRID_SIZE = 20;
  const MIN_SCALE = 0.1;
  const MAX_SCALE = 3.0;
  const PAN_SENSITIVITY = 1.0;
  const ZOOM_SENSITIVITY = 0.001;
  const TAP_TIMEOUT = 200;
  const LONG_PRESS_TIMEOUT = 500;
  const PORT_RADIUS = 8;
  const PORT_HIT_RADIUS = 15;

  // Utility functions
  const screenToCanvas = useCallback((screenPoint: Point): Point => {
    const { viewport } = state;
    return {
      x: (screenPoint.x / viewport.scale) - viewport.x,
      y: (screenPoint.y / viewport.scale) - viewport.y
    };
  }, [state.viewport]);

  const canvasToScreen = useCallback((canvasPoint: Point): Point => {
    const { viewport } = state;
    return {
      x: (canvasPoint.x + viewport.x) * viewport.scale,
      y: (canvasPoint.y + viewport.y) * viewport.scale
    };
  }, [state.viewport]);

  // Initialize connection system
  const connectionSystem = new ConnectionSystem(state.nodes, state.connections);

  // Check if point is over a connection port
  const getPortAtPoint = useCallback((point: Point): { nodeId: string; portId: string; type: 'input' | 'output' } | null => {
    const canvasPoint = screenToCanvas(point);
    
    for (const node of state.nodes) {
      // Check output ports
      for (const port of node.connections.outputs) {
        const portPos = connectionSystem.getConnectionPointPosition(node, port.id, 'output');
        const distance = Math.sqrt(
          Math.pow(canvasPoint.x - portPos.x, 2) + 
          Math.pow(canvasPoint.y - portPos.y, 2)
        );
        
        if (distance <= PORT_HIT_RADIUS / state.viewport.scale) {
          return { nodeId: node.id, portId: port.id, type: 'output' };
        }
      }
      
      // Check input ports
      for (const port of node.connections.inputs) {
        const portPos = connectionSystem.getConnectionPointPosition(node, port.id, 'input');
        const distance = Math.sqrt(
          Math.pow(canvasPoint.x - portPos.x, 2) + 
          Math.pow(canvasPoint.y - portPos.y, 2)
        );
        
        if (distance <= PORT_HIT_RADIUS / state.viewport.scale) {
          return { nodeId: node.id, portId: port.id, type: 'input' };
        }
      }
    }
    
    return null;
  }, [state.nodes, state.viewport.scale, screenToCanvas, connectionSystem]);

  const getTouchDistance = (touches: React.TouchList): number => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const getTouchCenter = (touches: React.TouchList): Point => {
    if (touches.length === 1) {
      return { x: touches[0].clientX, y: touches[0].clientY };
    }
    let centerX = 0;
    let centerY = 0;
    for (let i = 0; i < touches.length; i++) {
      centerX += touches[i].clientX;
      centerY += touches[i].clientY;
    }
    return {
      x: centerX / touches.length,
      y: centerY / touches.length
    };
  };

  // Pan viewport
  const panViewport = useCallback((deltaX: number, deltaY: number) => {
    const newViewport: CanvasViewport = {
      ...state.viewport,
      x: state.viewport.x + (deltaX / state.viewport.scale) * PAN_SENSITIVITY,
      y: state.viewport.y + (deltaY / state.viewport.scale) * PAN_SENSITIVITY
    };

    onStateChange({
      ...state,
      viewport: newViewport
    });
  }, [state, onStateChange]);

  // Zoom viewport
  const zoomViewport = useCallback((delta: number, center: Point) => {
    const scaleFactor = 1 + delta * ZOOM_SENSITIVITY;
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, state.viewport.scale * scaleFactor));
    
    if (newScale === state.viewport.scale) return;

    // Zoom towards the center point
    const canvasCenter = screenToCanvas(center);
    const newViewport: CanvasViewport = {
      scale: newScale,
      x: state.viewport.x + (canvasCenter.x * (state.viewport.scale - newScale) / newScale),
      y: state.viewport.y + (canvasCenter.y * (state.viewport.scale - newScale) / newScale)
    };

    onStateChange({
      ...state,
      viewport: newViewport
    });
  }, [state, onStateChange, screenToCanvas]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const point = { x: e.clientX, y: e.clientY };
    const canvasPoint = screenToCanvas(point);
    
    // Check if clicking on a connection port
    const portHit = getPortAtPoint(point);
    if (portHit && portHit.type === 'output') {
      // Start connection drag from output port
      setConnectionDrag({
        sourceNodeId: portHit.nodeId,
        sourcePort: portHit.portId,
        currentPosition: canvasPoint
      });
      setIsDrawing(true);
      return;
    }
    
    // Check if clicking on a node
    const clickedNode = state.nodes.find(node => {
      const nodeScreenPos = canvasToScreen(node.position);
      const distance = Math.sqrt(
        Math.pow(point.x - nodeScreenPos.x, 2) + 
        Math.pow(point.y - nodeScreenPos.y, 2)
      );
      return distance <= 30; // 30px hit radius
    });

    if (clickedNode) {
      // Check for double-click
      const currentTime = Date.now();
      if (lastClickedNodeId === clickedNode.id && currentTime - lastClickTime < 300) {
        // Double-click detected
        if (onNodeDoubleClick) {
          onNodeDoubleClick(clickedNode.id);
        }
        setLastClickTime(0);
        setLastClickedNodeId(null);
        return;
      }
      
      setLastClickTime(currentTime);
      setLastClickedNodeId(clickedNode.id);

      // Start node drag
      const dragState: DragState = {
        type: 'node',
        startPosition: point,
        currentPosition: point,
        targetId: clickedNode.id,
        offset: {
          x: point.x - canvasToScreen(clickedNode.position).x,
          y: point.y - canvasToScreen(clickedNode.position).y
        }
      };
      
      onStateChange({
        ...state,
        dragState,
        selectedNodes: [clickedNode.id]
      });
    } else {
      // Start viewport pan
      const dragState: DragState = {
        type: 'viewport',
        startPosition: point,
        currentPosition: point
      };
      
      onStateChange({
        ...state,
        dragState,
        selectedNodes: []
      });
    }
    
    setIsDrawing(true);
  }, [state, onStateChange, screenToCanvas, canvasToScreen, getPortAtPoint]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const point = { x: e.clientX, y: e.clientY };
    const canvasPoint = screenToCanvas(point);
    
    // Update hovered port for visual feedback
    const portHit = getPortAtPoint(point);
    setHoveredPort(portHit);
    
    // Handle connection dragging
    if (connectionDrag) {
      setConnectionDrag({
        ...connectionDrag,
        currentPosition: canvasPoint
      });
      return;
    }
    
    if (!isDrawing || !state.dragState) return;

    const deltaX = point.x - state.dragState.currentPosition.x;
    const deltaY = point.y - state.dragState.currentPosition.y;

    if (state.dragState.type === 'node' && state.dragState.targetId) {
      // Update node position
      const nodeId = state.dragState.targetId;
      const offset = state.dragState.offset || { x: 0, y: 0 };
      
      const updatedNodes = state.nodes.map(node =>
        node.id === nodeId
          ? { ...node, position: { x: canvasPoint.x - offset.x / state.viewport.scale, y: canvasPoint.y - offset.y / state.viewport.scale } }
          : node
      );

      onStateChange({
        ...state,
        nodes: updatedNodes,
        dragState: { ...state.dragState, currentPosition: point }
      });
    } else if (state.dragState.type === 'viewport') {
      // Pan viewport
      panViewport(deltaX, deltaY);
      onStateChange({
        ...state,
        dragState: { ...state.dragState, currentPosition: point }
      });
    }
  }, [isDrawing, state, onStateChange, panViewport, screenToCanvas, connectionDrag]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    const point = { x: e.clientX, y: e.clientY };
    
    // Handle connection completion
    if (connectionDrag) {
      const portHit = getPortAtPoint(point);
      
      if (portHit && portHit.type === 'input' && portHit.nodeId !== connectionDrag.sourceNodeId) {
        // Validate and create connection
        const sourceNode = state.nodes.find(n => n.id === connectionDrag.sourceNodeId);
        const targetNode = state.nodes.find(n => n.id === portHit.nodeId);
        
        if (sourceNode && targetNode) {
          const connectionSystem = new ConnectionSystem(state.nodes, state.connections);
          const validation = connectionSystem.validateConnection(
            sourceNode,
            targetNode,
            connectionDrag.sourcePort,
            portHit.portId
          );
          
          if (validation.isValid) {
            // Create new connection
            const newConnection: NodeConnection = {
              id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              sourceNodeId: connectionDrag.sourceNodeId,
              targetNodeId: portHit.nodeId,
              sourcePort: connectionDrag.sourcePort,
              targetPort: portHit.portId,
              path: connectionSystem.calculateBezierPath(sourceNode, targetNode, connectionDrag.sourcePort, portHit.portId)
            };
            
            onStateChange({
              ...state,
              connections: [...state.connections, newConnection]
            });
          } else {
            // Show validation errors
            console.warn('Connection validation failed:', validation.errors);
          }
        }
      }
      
      setConnectionDrag(null);
      setIsDrawing(false);
      return;
    }
    
    setIsDrawing(false);
    onStateChange({
      ...state,
      dragState: null
    });
  }, [state, onStateChange, connectionDrag, getPortAtPoint]);

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setTouchStartTime(Date.now());
    
    if (e.touches.length === 1) {
      // Single touch - potential tap or pan
      const touch = e.touches[0];
      const point = { x: touch.clientX, y: touch.clientY };
      
      setTimeout(() => {
        if (gestureActive === null && Date.now() - touchStartTime >= LONG_PRESS_TIMEOUT) {
          setGestureActive('longPress');
          // Handle long press - could open context menu
        }
      }, LONG_PRESS_TIMEOUT);

      // Check for node interaction
      const canvasPoint = screenToCanvas(point);
      const clickedNode = state.nodes.find(node => {
        const distance = Math.sqrt(
          Math.pow(canvasPoint.x - node.position.x, 2) + 
          Math.pow(canvasPoint.y - node.position.y, 2)
        );
        return distance <= 30 / state.viewport.scale;
      });

      if (clickedNode) {
        setGestureActive('pan');
        const dragState: DragState = {
          type: 'node',
          startPosition: point,
          currentPosition: point,
          targetId: clickedNode.id
        };
        
        onStateChange({
          ...state,
          dragState,
          selectedNodes: [clickedNode.id]
        });
      } else {
        setGestureActive('pan');
        const dragState: DragState = {
          type: 'viewport',
          startPosition: point,
          currentPosition: point
        };
        
        onStateChange({
          ...state,
          dragState,
          selectedNodes: []
        });
      }
    } else if (e.touches.length === 2) {
      // Two finger touch - pinch to zoom
      setGestureActive('pinch');
      setLastTouchDistance(getTouchDistance(e.touches));
      
      // Cancel any existing drag
      onStateChange({
        ...state,
        dragState: null
      });
    }
  }, [state, onStateChange, screenToCanvas, gestureActive, touchStartTime]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 1 && gestureActive === 'pan' && state.dragState) {
      // Single finger pan
      const touch = e.touches[0];
      const point = { x: touch.clientX, y: touch.clientY };
      const deltaX = point.x - state.dragState.currentPosition.x;
      const deltaY = point.y - state.dragState.currentPosition.y;

      if (state.dragState.type === 'node' && state.dragState.targetId) {
        // Move node
        const nodeId = state.dragState.targetId;
        const canvasPoint = screenToCanvas(point);
        
        const updatedNodes = state.nodes.map(node =>
          node.id === nodeId
            ? { ...node, position: canvasPoint }
            : node
        );

        onStateChange({
          ...state,
          nodes: updatedNodes,
          dragState: { ...state.dragState, currentPosition: point }
        });
      } else if (state.dragState.type === 'viewport') {
        // Pan viewport
        panViewport(deltaX, deltaY);
        onStateChange({
          ...state,
          dragState: { ...state.dragState, currentPosition: point }
        });
      }
    } else if (e.touches.length === 2 && gestureActive === 'pinch' && lastTouchDistance) {
      // Pinch to zoom
      const currentDistance = getTouchDistance(e.touches);
      const deltaDistance = currentDistance - lastTouchDistance;
      const center = getTouchCenter(e.touches);
      
      zoomViewport(deltaDistance * 10, center);
      setLastTouchDistance(currentDistance);
    }
  }, [state, onStateChange, gestureActive, lastTouchDistance, panViewport, zoomViewport, screenToCanvas]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 0) {
      // All touches ended
      const touchDuration = Date.now() - touchStartTime;
      
      if (gestureActive === 'pan' && touchDuration < TAP_TIMEOUT && !state.dragState) {
        // Quick tap - could be selection or creation
        setGestureActive('tap');
      }
      
      setGestureActive(null);
      setLastTouchDistance(null);
      onStateChange({
        ...state,
        dragState: null
      });
    } else if (e.touches.length === 1 && gestureActive === 'pinch') {
      // End pinch, start single touch
      setGestureActive('pan');
      setLastTouchDistance(null);
    }
  }, [state, onStateChange, gestureActive, touchStartTime]);

  // Wheel zoom handler
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const center = { x: e.clientX, y: e.clientY };
    zoomViewport(-e.deltaY, center);
  }, [zoomViewport]);

  // Drawing functions
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    const { viewport } = state;
    const { width, height } = ctx.canvas;
    
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;

    const gridSize = GRID_SIZE * viewport.scale;
    const offsetX = (viewport.x * viewport.scale) % gridSize;
    const offsetY = (viewport.y * viewport.scale) % gridSize;

    // Vertical lines
    for (let x = offsetX; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = offsetY; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }, [state.viewport]);

  const drawNodes = useCallback((ctx: CanvasRenderingContext2D) => {
    state.nodes.forEach(node => {
      const screenPos = canvasToScreen(node.position);
      
      // Skip if node is outside viewport
      const { width, height } = ctx.canvas;
      if (screenPos.x < -50 || screenPos.x > width + 50 || 
          screenPos.y < -50 || screenPos.y > height + 50) {
        return;
      }

      // Node colors based on type
      const colors = {
        story: '#3b82f6',      // Blue
        decision: '#8b5cf6',   // Purple  
        challenge: '#eab308',  // Yellow
        combat: '#ef4444',     // Red
        check: '#22c55e'       // Green
      };

      // Draw node circle
      const radius = 30;
      const isSelected = state.selectedNodes.includes(node.id);
      
      ctx.fillStyle = colors[node.type];
      ctx.strokeStyle = isSelected ? '#000' : '#374151';
      ctx.lineWidth = isSelected ? 3 : 2;
      
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Draw node label
      ctx.fillStyle = '#fff';
      ctx.font = '12px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const label = node.properties.title || node.type;
      const maxWidth = radius * 1.5;
      let displayText = label;
      
      if (ctx.measureText(label).width > maxWidth) {
        displayText = label.substring(0, 8) + '...';
      }
      
      ctx.fillText(displayText, screenPos.x, screenPos.y);

      // Draw validation state indicator
      if (node.validationState !== 'valid') {
        const indicatorSize = 8;
        const indicatorX = screenPos.x + radius - indicatorSize;
        const indicatorY = screenPos.y - radius + indicatorSize;
        
        ctx.fillStyle = node.validationState === 'error' ? '#ef4444' : '#f59e0b';
        ctx.beginPath();
        ctx.arc(indicatorX, indicatorY, indicatorSize, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      // Draw connection ports when hovering or dragging
      if (isSelected || connectionDrag) {
        const connectionSystem = new ConnectionSystem(state.nodes, state.connections);
        const portRadius = 6;
        
        // Draw output ports (right side)
        node.connections.outputs.forEach((port, index) => {
          const portPos = connectionSystem.getConnectionPointPosition(node, port.id, 'output');
          const portScreen = canvasToScreen(portPos);
          const isHovered = hoveredPort?.nodeId === node.id && hoveredPort?.portId === port.id;
          
          ctx.fillStyle = '#10b981'; // Green for outputs
          ctx.strokeStyle = isHovered ? '#ffffff' : '#059669';
          ctx.lineWidth = isHovered ? 3 : 2;
          
          ctx.beginPath();
          ctx.arc(portScreen.x, portScreen.y, isHovered ? portRadius + 2 : portRadius, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
        });
        
        // Draw input ports (left side)
        node.connections.inputs.forEach((port, index) => {
          const portPos = connectionSystem.getConnectionPointPosition(node, port.id, 'input');
          const portScreen = canvasToScreen(portPos);
          
          // Check if this input is available
          const availableInputs = connectionSystem.getAvailableInputPorts(node);
          const isAvailable = availableInputs.some(p => p.id === port.id);
          const isHovered = hoveredPort?.nodeId === node.id && hoveredPort?.portId === port.id;
          
          // Check if this would be a valid connection target
          let isValidTarget = false;
          if (connectionDrag) {
            const sourceNode = state.nodes.find(n => n.id === connectionDrag.sourceNodeId);
            if (sourceNode) {
              const validation = connectionSystem.validateConnection(
                sourceNode, node, connectionDrag.sourcePort, port.id
              );
              isValidTarget = validation.isValid;
            }
          }
          
          // Color based on state
          let fillColor = '#6b7280'; // Default gray
          let strokeColor = '#4b5563';
          
          if (connectionDrag && isValidTarget) {
            fillColor = '#10b981'; // Green for valid target
            strokeColor = '#059669';
          } else if (connectionDrag && !isValidTarget) {
            fillColor = '#ef4444'; // Red for invalid target
            strokeColor = '#dc2626';
          } else if (isAvailable) {
            fillColor = '#3b82f6'; // Blue for available
            strokeColor = '#1d4ed8';
          }
          
          if (isHovered) {
            strokeColor = '#ffffff'; // White stroke on hover
          }
          
          ctx.fillStyle = fillColor;
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = isHovered ? 3 : 2;
          
          ctx.beginPath();
          ctx.arc(portScreen.x, portScreen.y, isHovered ? portRadius + 2 : portRadius, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
        });
      }
    });
  }, [state.nodes, state.selectedNodes, state.connections, canvasToScreen, connectionDrag, hoveredPort]);

  const drawConnections = useCallback((ctx: CanvasRenderingContext2D) => {
    const connectionSystem = new ConnectionSystem(state.nodes, state.connections);
    
    // Draw existing connections
    state.connections.forEach(connection => {
      const sourceNode = state.nodes.find(n => n.id === connection.sourceNodeId);
      const targetNode = state.nodes.find(n => n.id === connection.targetNodeId);
      
      if (!sourceNode || !targetNode) return;

      // Use the stored path or calculate it
      const path = connection.path || connectionSystem.calculateBezierPath(
        sourceNode, 
        targetNode, 
        connection.sourcePort, 
        connection.targetPort
      );

      // Convert canvas coordinates to screen coordinates
      const startScreen = canvasToScreen(path.start);
      const control1Screen = canvasToScreen(path.control1);
      const control2Screen = canvasToScreen(path.control2);
      const endScreen = canvasToScreen(path.end);

      // Draw bezier curve
      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.moveTo(startScreen.x, startScreen.y);
      ctx.bezierCurveTo(
        control1Screen.x, control1Screen.y, 
        control2Screen.x, control2Screen.y, 
        endScreen.x, endScreen.y
      );
      ctx.stroke();

      // Draw arrow head
      const angle = Math.atan2(endScreen.y - control2Screen.y, endScreen.x - control2Screen.x);
      const arrowSize = 8;
      const arrowAngle = 0.5;
      
      ctx.fillStyle = ctx.strokeStyle;
      ctx.beginPath();
      ctx.moveTo(endScreen.x, endScreen.y);
      ctx.lineTo(
        endScreen.x - arrowSize * Math.cos(angle - arrowAngle),
        endScreen.y - arrowSize * Math.sin(angle - arrowAngle)
      );
      ctx.lineTo(
        endScreen.x - arrowSize * Math.cos(angle + arrowAngle),
        endScreen.y - arrowSize * Math.sin(angle + arrowAngle)
      );
      ctx.closePath();
      ctx.fill();
    });
    
    // Draw connection being dragged
    if (connectionDrag) {
      const sourceNode = state.nodes.find(n => n.id === connectionDrag.sourceNodeId);
      if (sourceNode) {
        const sourcePos = connectionSystem.getConnectionPointPosition(
          sourceNode, 
          connectionDrag.sourcePort, 
          'output'
        );
        const sourceScreen = canvasToScreen(sourcePos);
        const targetScreen = canvasToScreen(connectionDrag.currentPosition);
        
        // Draw dashed line for preview
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        const controlOffset = 100;
        ctx.beginPath();
        ctx.moveTo(sourceScreen.x, sourceScreen.y);
        ctx.bezierCurveTo(
          sourceScreen.x + controlOffset, sourceScreen.y,
          targetScreen.x - controlOffset, targetScreen.y,
          targetScreen.x, targetScreen.y
        );
        ctx.stroke();
        
        ctx.setLineDash([]); // Reset dash pattern
      }
    }
  }, [state.connections, state.nodes, canvasToScreen, connectionDrag]);

  // Main render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Update canvas size
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw components
    drawGrid(ctx);
    drawConnections(ctx);
    drawNodes(ctx);
  }, [drawGrid, drawConnections, drawNodes]);

  // Render on state change
  useEffect(() => {
    render();
  }, [render, state]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => render();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [render]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-gray-50 ${className}`}
      style={{ touchAction: 'none' }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      />
      
      {/* Canvas info overlay */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded text-sm">
        <div>Zoom: {(state.viewport.scale * 100).toFixed(0)}%</div>
        <div>Nodes: {state.nodes.length}</div>
        <div>Mode: {state.mode}</div>
      </div>
    </div>
  );
};