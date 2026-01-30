/**
 * Connection Engine Utilities
 * Based on PRD 10: Connection Engine
 */

import type {
  Point,
  AdventureNode,
  NodeConnection,
  ConnectionType,
  Adventure,
} from './types';
import { NODE_WIDTH, NODE_HEIGHT, getOutputPorts } from './node-config';

// Connection visual configurations
export const CONNECTION_CONFIGS: Record<ConnectionType, {
  color: string;
  dashArray?: string;
  label?: string;
}> = {
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

// Generate Bezier curve SVG path
export function generateBezierPath(start: Point, end: Point): string {
  const dx = end.x - start.x;
  
  // Control point offset based on distance
  const controlOffset = Math.min(Math.abs(dx) * 0.5, 150);
  
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

// Get port position on a node
export function getPortPosition(node: AdventureNode, portId: string): Point {
  const nodeRect = {
    x: node.position.x,
    y: node.position.y,
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
  };
  
  // Input port on left side
  if (portId === 'in') {
    return {
      x: nodeRect.x,
      y: nodeRect.y + nodeRect.height / 2,
    };
  }
  
  // Output ports on right side
  const ports = getOutputPorts(node);
  const portIndex = ports.findIndex(p => p.id === portId || `choice-${p.id}` === portId);
  const portCount = Math.max(ports.length, 1);
  const spacing = nodeRect.height / (portCount + 1);
  
  return {
    x: nodeRect.x + nodeRect.width,
    y: nodeRect.y + spacing * (portIndex + 1),
  };
}

// Get midpoint of connection for labels/indicators
export function getMidpoint(start: Point, end: Point): Point {
  return {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2,
  };
}

// Connection validation
export interface ConnectionValidation {
  isValid: boolean;
  error?: string;
}

export function validateConnection(
  sourceNodeId: string,
  sourcePort: string,
  targetNodeId: string,
  adventure: Adventure
): ConnectionValidation {
  // Cannot connect to self
  if (sourceNodeId === targetNodeId) {
    return { isValid: false, error: 'Cannot connect node to itself' };
  }
  
  // Check for existing connection from same port
  const existingConnection = adventure.connections.find(
    c => c.sourceNodeId === sourceNodeId && c.sourcePort === sourcePort
  );
  if (existingConnection) {
    return { isValid: false, error: 'This port is already connected' };
  }
  
  // Check for circular reference
  if (wouldCreateCycle(sourceNodeId, targetNodeId, adventure)) {
    return { isValid: false, error: 'This would create a circular reference' };
  }
  
  // Victory/failure nodes shouldn't have outgoing connections
  const sourceNode = adventure.nodes.find(n => n.id === sourceNodeId);
  if (sourceNode && (sourceNode.isVictoryNode || sourceNode.isFailureNode)) {
    return { isValid: false, error: 'End nodes cannot have outgoing connections' };
  }
  
  return { isValid: true };
}

// Check if adding a connection would create a cycle
function wouldCreateCycle(
  sourceId: string,
  targetId: string,
  adventure: Adventure
): boolean {
  // BFS to check if target can reach source
  const visited = new Set<string>();
  const queue = [targetId];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === sourceId) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    
    const outgoing = adventure.connections.filter(c => c.sourceNodeId === current);
    queue.push(...outgoing.map(c => c.targetNodeId));
  }
  
  return false;
}

// Generate unique connection ID
export function generateConnectionId(): string {
  return `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Create a new connection
export function createConnection(
  adventureId: string,
  sourceNodeId: string,
  sourcePort: string,
  targetNodeId: string,
  connectionType: ConnectionType
): NodeConnection {
  return {
    id: generateConnectionId(),
    adventureId,
    sourceNodeId,
    sourcePort,
    targetNodeId,
    connectionType,
  };
}
