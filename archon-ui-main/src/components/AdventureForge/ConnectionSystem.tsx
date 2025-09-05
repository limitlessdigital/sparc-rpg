import { Point, AdventureNode, NodeConnection, ConnectionPoint, BezierPath } from './types';

export class ConnectionSystem {
  private nodes: AdventureNode[] = [];
  private connections: NodeConnection[] = [];
  
  constructor(nodes: AdventureNode[], connections: NodeConnection[]) {
    this.nodes = nodes;
    this.connections = connections;
  }

  // Calculate optimal bezier curve for connection
  calculateBezierPath(sourceNode: AdventureNode, targetNode: AdventureNode, sourcePort: string, targetPort: string): BezierPath {
    const sourcePos = this.getConnectionPointPosition(sourceNode, sourcePort, 'output');
    const targetPos = this.getConnectionPointPosition(targetNode, targetPort, 'input');
    
    // Calculate control points for smooth curves
    const distance = Math.abs(targetPos.x - sourcePos.x);
    const controlOffset = Math.max(50, Math.min(200, distance * 0.4));
    
    const control1: Point = {
      x: sourcePos.x + controlOffset,
      y: sourcePos.y
    };
    
    const control2: Point = {
      x: targetPos.x - controlOffset,
      y: targetPos.y
    };
    
    return {
      start: sourcePos,
      control1,
      control2,
      end: targetPos
    };
  }

  // Get the world position of a connection point
  getConnectionPointPosition(node: AdventureNode, portId: string, type: 'input' | 'output'): Point {
    const nodeRadius = 30;
    const portList = type === 'input' ? node.connections.inputs : node.connections.outputs;
    const port = portList.find(p => p.id === portId);
    
    if (!port) {
      // Default to center-right for outputs, center-left for inputs
      return {
        x: node.position.x + (type === 'output' ? nodeRadius : -nodeRadius),
        y: node.position.y
      };
    }
    
    // Calculate port position relative to node center
    const angle = Math.atan2(port.position.y, port.position.x);
    return {
      x: node.position.x + Math.cos(angle) * nodeRadius,
      y: node.position.y + Math.sin(angle) * nodeRadius
    };
  }

  // Check if two connections would visually intersect
  detectConnectionIntersection(path1: BezierPath, path2: BezierPath): boolean {
    // Simplified intersection detection using bounding boxes
    const bbox1 = this.getBezierBoundingBox(path1);
    const bbox2 = this.getBezierBoundingBox(path2);
    
    return !(bbox1.maxX < bbox2.minX || 
             bbox2.maxX < bbox1.minX || 
             bbox1.maxY < bbox2.minY || 
             bbox2.maxY < bbox1.minY);
  }

  // Get bounding box for a bezier curve
  private getBezierBoundingBox(path: BezierPath): { minX: number; maxX: number; minY: number; maxY: number } {
    const points = [path.start, path.control1, path.control2, path.end];
    
    return {
      minX: Math.min(...points.map(p => p.x)),
      maxX: Math.max(...points.map(p => p.x)),
      minY: Math.min(...points.map(p => p.y)),
      maxY: Math.max(...points.map(p => p.y))
    };
  }

  // Find the closest connection point on a node for a given world position
  findClosestConnectionPoint(node: AdventureNode, worldPos: Point, type: 'input' | 'output'): { port: ConnectionPoint; distance: number } | null {
    const portList = type === 'input' ? node.connections.inputs : node.connections.outputs;
    let closest: { port: ConnectionPoint; distance: number } | null = null;
    
    for (const port of portList) {
      const portWorldPos = this.getConnectionPointPosition(node, port.id, type);
      const distance = Math.sqrt(
        Math.pow(worldPos.x - portWorldPos.x, 2) + 
        Math.pow(worldPos.y - portWorldPos.y, 2)
      );
      
      if (!closest || distance < closest.distance) {
        closest = { port, distance };
      }
    }
    
    return closest;
  }

  // Validate connection compatibility
  validateConnection(sourceNode: AdventureNode, targetNode: AdventureNode, sourcePort: string, targetPort: string): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check for self-connection
    if (sourceNode.id === targetNode.id) {
      errors.push('Cannot connect node to itself');
    }
    
    // Check for existing connection
    const existingConnection = this.connections.find(conn => 
      conn.sourceNodeId === sourceNode.id && 
      conn.targetNodeId === targetNode.id &&
      conn.sourcePort === sourcePort &&
      conn.targetPort === targetPort
    );
    
    if (existingConnection) {
      errors.push('Connection already exists');
    }
    
    // Check port compatibility
    const sourcePortObj = sourceNode.connections.outputs.find(p => p.id === sourcePort);
    const targetPortObj = targetNode.connections.inputs.find(p => p.id === targetPort);
    
    if (!sourcePortObj) {
      errors.push(`Source port '${sourcePort}' not found`);
    }
    
    if (!targetPortObj) {
      errors.push(`Target port '${targetPort}' not found`);
    }
    
    // Check for circular dependencies
    if (this.wouldCreateCircularDependency(sourceNode.id, targetNode.id)) {
      errors.push('Connection would create circular dependency');
    }
    
    // Node type specific validation
    this.validateNodeTypeCompatibility(sourceNode, targetNode, sourcePort, targetPort, errors, warnings);
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Check if adding a connection would create a circular dependency
  private wouldCreateCircularDependency(sourceNodeId: string, targetNodeId: string): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const hasCircle = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) {
        return true; // Found a cycle
      }
      
      if (visited.has(nodeId)) {
        return false; // Already processed
      }
      
      visited.add(nodeId);
      recursionStack.add(nodeId);
      
      // Check all connections from this node
      const outgoingConnections = this.connections.filter(conn => conn.sourceNodeId === nodeId);
      
      for (const connection of outgoingConnections) {
        if (hasCircle(connection.targetNodeId)) {
          return true;
        }
      }
      
      // Add the potential new connection for testing
      if (nodeId === sourceNodeId && hasCircle(targetNodeId)) {
        return true;
      }
      
      recursionStack.delete(nodeId);
      return false;
    };
    
    return hasCircle(sourceNodeId);
  }

  // Validate node type specific connection rules
  private validateNodeTypeCompatibility(
    sourceNode: AdventureNode, 
    targetNode: AdventureNode, 
    sourcePort: string, 
    targetPort: string,
    errors: string[],
    warnings: string[]
  ): void {
    // Decision nodes should have meaningful port names
    if (sourceNode.type === 'decision' && sourcePort === 'output') {
      warnings.push('Decision node connections should use specific option ports');
    }
    
    // Challenge nodes should use success/failure ports
    if (sourceNode.type === 'challenge' && !['success', 'failure'].includes(sourcePort)) {
      warnings.push('Challenge nodes should connect via success/failure ports');
    }
    
    // Combat nodes should use victory/defeat/flee ports
    if (sourceNode.type === 'combat' && !['victory', 'defeat', 'flee'].includes(sourcePort)) {
      warnings.push('Combat nodes should connect via victory/defeat/flee ports');
    }
    
    // Check nodes should use pass/fail ports
    if (sourceNode.type === 'check' && !['pass', 'fail'].includes(sourcePort)) {
      warnings.push('Check nodes should connect via pass/fail ports');
    }
    
    // Story nodes with end conditions shouldn't have outgoing connections
    if (sourceNode.type === 'story') {
      const storyProps = sourceNode.properties as any;
      if (storyProps.endConditions?.victory || storyProps.endConditions?.failure) {
        warnings.push('End condition nodes typically should not have outgoing connections');
      }
    }
  }

  // Get all available output ports for a node
  getAvailableOutputPorts(node: AdventureNode): ConnectionPoint[] {
    return node.connections.outputs.filter(port => {
      // Check if port is already used (optional - allow multiple connections)
      // const isUsed = this.connections.some(conn => 
      //   conn.sourceNodeId === node.id && conn.sourcePort === port.id
      // );
      // return !isUsed;
      return true; // Allow multiple connections from same port for now
    });
  }

  // Get all available input ports for a node
  getAvailableInputPorts(node: AdventureNode): ConnectionPoint[] {
    return node.connections.inputs.filter(port => {
      // Input ports typically allow only one connection
      const isUsed = this.connections.some(conn => 
        conn.targetNodeId === node.id && conn.targetPort === port.id
      );
      return !isUsed;
    });
  }

  // Calculate optimal routing to avoid overlaps
  calculateOptimalPath(sourceNode: AdventureNode, targetNode: AdventureNode, sourcePort: string, targetPort: string): BezierPath {
    const basePath = this.calculateBezierPath(sourceNode, targetNode, sourcePort, targetPort);
    
    // Check for intersections with existing connections
    const intersectingConnections = this.connections.filter(conn => {
      const existingPath = this.getConnectionPath(conn);
      return this.detectConnectionIntersection(basePath, existingPath);
    });
    
    if (intersectingConnections.length === 0) {
      return basePath; // No conflicts
    }
    
    // Apply routing adjustments to avoid intersections
    return this.adjustPathForIntersections(basePath, intersectingConnections);
  }

  // Get the path for an existing connection
  private getConnectionPath(connection: NodeConnection): BezierPath {
    const sourceNode = this.nodes.find(n => n.id === connection.sourceNodeId);
    const targetNode = this.nodes.find(n => n.id === connection.targetNodeId);
    
    if (!sourceNode || !targetNode) {
      return connection.path; // Fallback to stored path
    }
    
    return this.calculateBezierPath(sourceNode, targetNode, connection.sourcePort, connection.targetPort);
  }

  // Adjust path to avoid intersections
  private adjustPathForIntersections(basePath: BezierPath, intersectingConnections: NodeConnection[]): BezierPath {
    const adjustedPath = { ...basePath };
    
    // Simple adjustment: offset the control points vertically
    const offsetY = intersectingConnections.length * 20; // 20px offset per intersection
    
    adjustedPath.control1.y += offsetY;
    adjustedPath.control2.y += offsetY;
    
    return adjustedPath;
  }

  // Generate a smooth curve through multiple waypoints
  generateMultiPointPath(points: Point[]): BezierPath {
    if (points.length < 2) {
      throw new Error('Need at least 2 points for path generation');
    }
    
    const start = points[0];
    const end = points[points.length - 1];
    
    if (points.length === 2) {
      // Simple two-point connection
      const distance = Math.abs(end.x - start.x);
      const controlOffset = Math.max(50, distance * 0.4);
      
      return {
        start,
        control1: { x: start.x + controlOffset, y: start.y },
        control2: { x: end.x - controlOffset, y: end.y },
        end
      };
    }
    
    // For multiple points, create a smooth curve through the middle points
    const midPoint = points[Math.floor(points.length / 2)];
    
    return {
      start,
      control1: { x: start.x + (midPoint.x - start.x) * 0.5, y: start.y + (midPoint.y - start.y) * 0.5 },
      control2: { x: end.x - (end.x - midPoint.x) * 0.5, y: end.y - (end.y - midPoint.y) * 0.5 },
      end
    };
  }

  // Find all paths from a start node to end nodes
  findAllPaths(startNodeId: string, endNodeIds: string[]): string[][] {
    const allPaths: string[][] = [];
    
    const findPaths = (currentNodeId: string, currentPath: string[], visited: Set<string>) => {
      if (endNodeIds.includes(currentNodeId)) {
        allPaths.push([...currentPath, currentNodeId]);
        return;
      }
      
      if (visited.has(currentNodeId)) {
        return; // Avoid cycles
      }
      
      visited.add(currentNodeId);
      
      const outgoingConnections = this.connections.filter(conn => conn.sourceNodeId === currentNodeId);
      
      for (const connection of outgoingConnections) {
        findPaths(connection.targetNodeId, [...currentPath, currentNodeId], new Set(visited));
      }
      
      visited.delete(currentNodeId);
    };
    
    findPaths(startNodeId, [], new Set());
    return allPaths;
  }
}