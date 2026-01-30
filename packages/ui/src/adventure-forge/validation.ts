/**
 * Adventure Validation System
 * Based on PRD 11: Validation System
 */

import type {
  Adventure,
  AdventureNode,
  NodeConnection,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  AdventureStats,
  DecisionNode,
  ChallengeNode,
  CombatNode,
  CheckNode,
} from './types';
import { ValidationErrorCode, ValidationWarningCode } from './types';
import { getRequiredPorts } from './node-config';

// Validate entire adventure
export function validateAdventure(adventure: Adventure): ValidationResult {
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
  } else {
    const startNode = adventure.nodes.find(n => n.id === adventure.startNodeId);
    if (!startNode) {
      errors.push({
        code: ValidationErrorCode.NO_START_NODE,
        message: 'Start node not found in adventure',
        severity: 'error',
      });
    }
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
  if (adventure.startNodeId) {
    const reachableNodes = findReachableNodes(adventure.startNodeId, adventure);
    
    for (const victory of victoryNodes) {
      if (!reachableNodes.has(victory.id)) {
        errors.push({
          code: ValidationErrorCode.UNREACHABLE_VICTORY,
          message: `Victory node "${victory.title || 'Untitled'}" is not reachable from start`,
          nodeId: victory.id,
          severity: 'error',
        });
      }
    }
  }
  
  // Check for orphan nodes
  const connectedNodes = new Set<string>();
  adventure.connections.forEach(c => {
    connectedNodes.add(c.sourceNodeId);
    connectedNodes.add(c.targetNodeId);
  });
  if (adventure.startNodeId) {
    connectedNodes.add(adventure.startNodeId);
  }
  
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
    const nodeValidation = validateNode(node, adventure.connections);
    errors.push(...nodeValidation.errors);
    warnings.push(...nodeValidation.warnings);
  }
  
  // === WARNINGS ===
  
  // Check for short adventures
  const stats = calculateStats(adventure);
  if (stats.shortestPath < 3 && stats.shortestPath > 0) {
    warnings.push({
      code: ValidationWarningCode.SHORT_ADVENTURE,
      message: 'Adventure can be completed in very few steps',
      suggestion: 'Consider adding more content for a richer experience',
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

// Validate individual node
export function validateNode(
  node: AdventureNode,
  connections: NodeConnection[]
): { errors: ValidationError[]; warnings: ValidationWarning[] } {
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
      validateChallengeNode(node as ChallengeNode, errors, warnings);
      break;
    case 'combat':
      validateCombatNode(node as CombatNode, connections, errors, warnings);
      break;
    case 'check':
      validateCheckNode(node as CheckNode, errors, warnings);
      break;
  }
  
  // Connection checks for non-end nodes
  if (!node.isVictoryNode && !node.isFailureNode) {
    const outgoing = connections.filter(c => c.sourceNodeId === node.id);
    const requiredPorts = getRequiredPorts(node);
    
    for (const port of requiredPorts) {
      const portConnected = outgoing.some(c => 
        c.sourcePort === port.id || c.sourcePort === `choice-${port.id}`
      );
      if (!portConnected) {
        warnings.push({
          code: ValidationWarningCode.SHORT_CONTENT,
          message: `"${port.label}" path is not connected`,
          nodeId: node.id,
          severity: 'warning',
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
  
  return { errors, warnings };
}

function validateDecisionNode(
  node: DecisionNode,
  errors: ValidationError[],
  _warnings: ValidationWarning[]
) {
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
      warnings.push({
        code: ValidationWarningCode.SHORT_CONTENT,
        message: 'Flee is enabled but no flee path is connected',
        nodeId: node.id,
        severity: 'warning',
      });
    }
  }
}

function validateCheckNode(
  node: CheckNode,
  errors: ValidationError[],
  _warnings: ValidationWarning[]
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

// Find all reachable nodes from start
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

// Calculate adventure statistics
function calculateStats(adventure: Adventure): AdventureStats {
  const paths = findAllPaths(adventure);
  const pathLengths = paths.map(p => p.length);
  
  return {
    nodeCount: adventure.nodes.length,
    connectionCount: adventure.connections.length,
    averagePathLength: pathLengths.length > 0 
      ? pathLengths.reduce((sum, l) => sum + l, 0) / pathLengths.length 
      : 0,
    shortestPath: pathLengths.length > 0 ? Math.min(...pathLengths) : 0,
    longestPath: pathLengths.length > 0 ? Math.max(...pathLengths) : 0,
    combatEncounters: adventure.nodes.filter(n => n.type === 'combat').length,
    challengeCount: adventure.nodes.filter(n => n.type === 'challenge').length,
    decisionPoints: adventure.nodes.filter(n => n.type === 'decision').length,
    estimatedDurationMinutes: estimateDuration(adventure),
  };
}

// Find all paths from start to end nodes
function findAllPaths(adventure: Adventure): string[][] {
  if (!adventure.startNodeId) return [];
  
  const paths: string[][] = [];
  const maxDepth = 100; // Prevent infinite loops
  
  function traverse(nodeId: string, currentPath: string[], depth: number) {
    if (depth > maxDepth) return;
    
    const newPath = [...currentPath, nodeId];
    const node = adventure.nodes.find(n => n.id === nodeId);
    
    if (!node) return;
    
    // End node found
    if (node.isVictoryNode || node.isFailureNode) {
      paths.push(newPath);
      return;
    }
    
    // Continue traversing
    const outgoing = adventure.connections.filter(c => c.sourceNodeId === nodeId);
    
    if (outgoing.length === 0) {
      // Dead end
      paths.push(newPath);
      return;
    }
    
    for (const conn of outgoing) {
      if (!currentPath.includes(conn.targetNodeId)) {
        traverse(conn.targetNodeId, newPath, depth + 1);
      }
    }
  }
  
  traverse(adventure.startNodeId, [], 0);
  return paths;
}

// Estimate adventure duration in minutes
function estimateDuration(adventure: Adventure): number {
  const timePerNode: Record<string, number> = {
    story: 2,
    decision: 1,
    challenge: 3,
    combat: 8,
    check: 0.5,
  };
  
  let totalTime = 0;
  adventure.nodes.forEach(node => {
    totalTime += timePerNode[node.type] || 1;
  });
  
  // Normalize by average path
  const stats = {
    averagePathLength: adventure.nodes.length > 0 
      ? adventure.connections.length / adventure.nodes.length * 2 
      : 1
  };
  
  return Math.round((totalTime / Math.max(adventure.nodes.length, 1)) * stats.averagePathLength);
}
