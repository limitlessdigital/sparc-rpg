import { 
  AdventureNode, 
  NodeConnection, 
  ValidationResult, 
  ValidationError, 
  ValidationWarning
} from './types';
import { AdventureEngine } from './AdventureEngine';

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  severity: 'error' | 'warning';
  category: 'structure' | 'logic' | 'content' | 'accessibility' | 'performance';
  validate: (nodes: AdventureNode[], connections: NodeConnection[], engine: AdventureEngine) => ValidationError[];
}

export class ValidationEngine {
  private rules: ValidationRule[] = [];

  constructor() {
    this.initializeDefaultRules();
  }

  // Main validation entry point
  validateAdventure(nodes: AdventureNode[], connections: NodeConnection[]): ValidationResult {
    const engine = new AdventureEngine(nodes, connections);
    const allErrors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    for (const rule of this.rules) {
      try {
        const ruleErrors = rule.validate(nodes, connections, engine);
        allErrors.push(...ruleErrors);
      } catch (error) {
        allErrors.push({
          id: `rule_error_${rule.id}`,
          message: `Validation rule "${rule.name}" failed: ${error}`,
          severity: 'error'
        });
      }
    }

    // Separate errors and warnings
    const errors = allErrors.filter(e => e.severity === 'error');
    const warningErrors = allErrors.filter(e => e.severity === 'warning') as ValidationWarning[];
    warnings.push(...warningErrors);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Add custom validation rule
  addRule(rule: ValidationRule): void {
    this.rules.push(rule);
  }

  // Remove validation rule
  removeRule(ruleId: string): void {
    this.rules = this.rules.filter(rule => rule.id !== ruleId);
  }

  // Get all rules by category
  getRulesByCategory(category: string): ValidationRule[] {
    return this.rules.filter(rule => rule.category === category);
  }

  private initializeDefaultRules(): void {
    // Structural validation rules
    this.addRule({
      id: 'start_node_exists',
      name: 'Start Node Required',
      description: 'Adventure must have at least one node to serve as the starting point',
      severity: 'error',
      category: 'structure',
      validate: (nodes) => {
        if (nodes.length === 0) {
          return [{
            id: 'no_nodes',
            message: 'Adventure has no nodes. Add at least one Story node to begin.',
            severity: 'error',
            suggestion: 'Add a Story node and mark it as the adventure start point'
          }];
        }
        return [];
      }
    });

    this.addRule({
      id: 'orphaned_nodes',
      name: 'No Orphaned Nodes',
      description: 'All nodes should be reachable from the start node',
      severity: 'warning',
      category: 'structure',
      validate: (nodes, connections) => {
        const errors: ValidationError[] = [];
        
        if (nodes.length === 0) return errors;
        
        // Find all reachable nodes from any starting point
        const reachableNodes = new Set<string>();
        const visited = new Set<string>();
        
        // Find potential start nodes (nodes with no incoming connections)
        const startNodes = nodes.filter(node => 
          !connections.some(conn => conn.targetNodeId === node.id)
        );
        
        if (startNodes.length === 0 && nodes.length > 0) {
          // All nodes have incoming connections - circular reference
          errors.push({
            id: 'circular_start',
            message: 'No clear starting node found. All nodes have incoming connections.',
            severity: 'warning',
            suggestion: 'Designate a clear starting node with no incoming connections'
          });
          return errors;
        }

        const traverse = (nodeId: string) => {
          if (visited.has(nodeId)) return;
          visited.add(nodeId);
          reachableNodes.add(nodeId);
          
          const outgoing = connections.filter(conn => conn.sourceNodeId === nodeId);
          outgoing.forEach(conn => traverse(conn.targetNodeId));
        };

        // Start traversal from all potential start nodes
        startNodes.forEach(node => traverse(node.id));

        // Check for orphaned nodes
        const orphanedNodes = nodes.filter(node => !reachableNodes.has(node.id));
        orphanedNodes.forEach(node => {
          errors.push({
            id: `orphaned_${node.id}`,
            nodeId: node.id,
            message: `Node "${node.properties.title || node.id}" is not reachable from any start node`,
            severity: 'warning',
            suggestion: 'Connect this node to the main adventure flow or remove it'
          });
        });

        return errors;
      }
    });

    this.addRule({
      id: 'victory_paths_exist',
      name: 'Victory Paths Required',
      description: 'Adventure should have at least one path to victory',
      severity: 'error',
      category: 'logic',
      validate: (nodes, connections, engine) => {
        const errors: ValidationError[] = [];
        
        // Find nodes with victory conditions
        const victoryNodes = nodes.filter(node => {
          const props = node.properties as any;
          return props.endConditions?.victory || 
                 (node.type === 'story' && props.endConditions?.victory);
        });

        if (victoryNodes.length === 0) {
          errors.push({
            id: 'no_victory_paths',
            message: 'Adventure has no victory conditions. Add at least one Story node with victory end condition.',
            severity: 'error',
            suggestion: 'Create a Story node and enable "Victory condition" in its properties'
          });
          return errors;
        }

        // Check if victory nodes are reachable
        const startNodes = nodes.filter(node => 
          !connections.some(conn => conn.targetNodeId === node.id)
        );

        if (startNodes.length === 0) return errors;

        for (const victoryNode of victoryNodes) {
          let isReachable = false;
          
          for (const startNode of startNodes) {
            const paths = engine.findAllPaths(startNode.id, [victoryNode.id]);
            if (paths.length > 0) {
              isReachable = true;
              break;
            }
          }

          if (!isReachable) {
            errors.push({
              id: `unreachable_victory_${victoryNode.id}`,
              nodeId: victoryNode.id,
              message: `Victory node "${victoryNode.properties.title || victoryNode.id}" is not reachable from start`,
              severity: 'warning',
              suggestion: 'Ensure there is a valid path from the start to this victory condition'
            });
          }
        }

        return errors;
      }
    });

    this.addRule({
      id: 'dead_ends_check',
      name: 'Dead End Detection',
      description: 'Nodes without outgoing connections should have end conditions',
      severity: 'warning',
      category: 'logic',
      validate: (nodes, connections) => {
        const errors: ValidationError[] = [];

        const deadEndNodes = nodes.filter(node => {
          const hasOutgoing = connections.some(conn => conn.sourceNodeId === node.id);
          return !hasOutgoing;
        });

        deadEndNodes.forEach(node => {
          const props = node.properties as any;
          const hasEndCondition = props.endConditions?.victory || props.endConditions?.failure;

          if (!hasEndCondition) {
            errors.push({
              id: `dead_end_${node.id}`,
              nodeId: node.id,
              message: `Node "${node.properties.title || node.id}" has no outgoing connections or end conditions`,
              severity: 'warning',
              suggestion: 'Add connections to other nodes or set victory/failure end conditions'
            });
          }
        });

        return errors;
      }
    });

    // Content validation rules
    this.addRule({
      id: 'required_content',
      name: 'Required Content Check',
      description: 'All nodes must have required content filled',
      severity: 'error',
      category: 'content',
      validate: (nodes) => {
        const errors: ValidationError[] = [];

        nodes.forEach(node => {
          const props = node.properties as any;

          // Check title
          if (!props.title || props.title.trim() === '') {
            errors.push({
              id: `missing_title_${node.id}`,
              nodeId: node.id,
              message: `Node is missing a title`,
              severity: 'error',
              suggestion: 'Add a descriptive title to this node'
            });
          }

          // Node-specific content checks
          switch (node.type) {
            case 'story':
              if (!props.content?.text || props.content.text.trim() === '') {
                errors.push({
                  id: `missing_content_${node.id}`,
                  nodeId: node.id,
                  message: `Story node "${props.title || node.id}" is missing content`,
                  severity: 'error',
                  suggestion: 'Add story content to describe what happens in this scene'
                });
              }
              break;

            case 'decision':
              if (!props.decisions || props.decisions.length === 0) {
                errors.push({
                  id: `missing_options_${node.id}`,
                  nodeId: node.id,
                  message: `Decision node "${props.title || node.id}" has no decision options`,
                  severity: 'error',
                  suggestion: 'Add at least two decision options for players to choose from'
                });
              }
              break;

            case 'challenge':
              if (!props.stat) {
                errors.push({
                  id: `missing_stat_${node.id}`,
                  nodeId: node.id,
                  message: `Challenge node "${props.title || node.id}" has no stat specified`,
                  severity: 'error',
                  suggestion: 'Specify which stat (STR/DEX/INT/CHA) this challenge tests'
                });
              }
              break;

            case 'combat':
              if (!props.creatures || props.creatures.length === 0) {
                errors.push({
                  id: `missing_creatures_${node.id}`,
                  nodeId: node.id,
                  message: `Combat node "${props.title || node.id}" has no creatures defined`,
                  severity: 'error',
                  suggestion: 'Add creatures to fight in this combat encounter'
                });
              }
              break;
          }
        });

        return errors;
      }
    });

    this.addRule({
      id: 'connection_validation',
      name: 'Connection Validation',
      description: 'All connections must be valid and properly configured',
      severity: 'error',
      category: 'logic',
      validate: (nodes, connections, engine) => {
        const errors: ValidationError[] = [];

        connections.forEach(connection => {
          const sourceNode = nodes.find(n => n.id === connection.sourceNodeId);
          const targetNode = nodes.find(n => n.id === connection.targetNodeId);

          if (!sourceNode) {
            errors.push({
              id: `missing_source_${connection.id}`,
              message: `Connection "${connection.id}" references missing source node`,
              severity: 'error',
              suggestion: 'Remove this connection or fix the node reference'
            });
            return;
          }

          if (!targetNode) {
            errors.push({
              id: `missing_target_${connection.id}`,
              message: `Connection "${connection.id}" references missing target node`,
              severity: 'error',
              suggestion: 'Remove this connection or fix the node reference'
            });
            return;
          }

          // Use the connection system to validate
          const validation = engine.validateConnection(
            sourceNode,
            targetNode,
            connection.sourcePort,
            connection.targetPort
          );

          validation.errors.forEach(error => {
            errors.push({
              id: `connection_error_${connection.id}`,
              message: `Connection from "${sourceNode.properties.title}" to "${targetNode.properties.title}": ${error}`,
              severity: 'error',
              suggestion: 'Fix the connection configuration or remove the connection'
            });
          });

          validation.warnings.forEach(warning => {
            errors.push({
              id: `connection_warning_${connection.id}`,
              message: `Connection from "${sourceNode.properties.title}" to "${targetNode.properties.title}": ${warning}`,
              severity: 'warning',
              suggestion: 'Review the connection configuration for optimal design'
            });
          });
        });

        return errors;
      }
    });

    // Performance validation rules
    this.addRule({
      id: 'node_count_performance',
      name: 'Node Count Performance',
      description: 'Large adventures may have performance implications',
      severity: 'warning',
      category: 'performance',
      validate: (nodes) => {
        const errors: ValidationError[] = [];

        if (nodes.length > 100) {
          errors.push({
            id: 'high_node_count',
            message: `Adventure has ${nodes.length} nodes. This may impact performance on some devices.`,
            severity: 'warning',
            suggestion: 'Consider breaking large adventures into smaller chapters or optimizing node structure'
          });
        }

        return errors;
      }
    });

    this.addRule({
      id: 'complexity_analysis',
      name: 'Adventure Complexity',
      description: 'Analyze adventure complexity for player experience',
      severity: 'warning',
      category: 'accessibility',
      validate: (nodes, connections) => {
        const errors: ValidationError[] = [];

        // Calculate complexity metrics
        const avgConnectionsPerNode = connections.length / Math.max(nodes.length, 1);
        const maxDepth = this.calculateMaxDepth(nodes, connections);
        const decisionNodes = nodes.filter(n => n.type === 'decision').length;
        const challengeNodes = nodes.filter(n => n.type === 'challenge' || n.type === 'combat').length;

        // Complexity warnings
        if (avgConnectionsPerNode > 5) {
          errors.push({
            id: 'high_branching',
            message: `High branching factor detected (${avgConnectionsPerNode.toFixed(1)} connections per node). This may overwhelm players.`,
            severity: 'warning',
            suggestion: 'Consider simplifying some decision points or breaking complex nodes into smaller scenes'
          });
        }

        if (maxDepth > 20) {
          errors.push({
            id: 'deep_adventure',
            message: `Adventure has very deep paths (${maxDepth} levels). This may create very long play sessions.`,
            severity: 'warning',
            suggestion: 'Add intermediate save points or break the adventure into chapters'
          });
        }

        if (challengeNodes / nodes.length > 0.5) {
          errors.push({
            id: 'challenge_heavy',
            message: `Adventure is challenge-heavy (${Math.round(challengeNodes / nodes.length * 100)}% challenge/combat nodes).`,
            severity: 'warning',
            suggestion: 'Balance with more story nodes to provide narrative breathing room'
          });
        }

        return errors;
      }
    });
  }

  private calculateMaxDepth(nodes: AdventureNode[], connections: NodeConnection[]): number {
    const startNodes = nodes.filter(node => 
      !connections.some(conn => conn.targetNodeId === node.id)
    );

    if (startNodes.length === 0) return 0;

    let maxDepth = 0;

    const calculateDepth = (nodeId: string, currentDepth: number, visited: Set<string>): void => {
      if (visited.has(nodeId)) return; // Avoid cycles
      visited.add(nodeId);

      maxDepth = Math.max(maxDepth, currentDepth);

      const outgoing = connections.filter(conn => conn.sourceNodeId === nodeId);
      outgoing.forEach(conn => {
        calculateDepth(conn.targetNodeId, currentDepth + 1, new Set(visited));
      });
    };

    startNodes.forEach(node => {
      calculateDepth(node.id, 1, new Set());
    });

    return maxDepth;
  }

  // Real-time validation for individual nodes
  validateNode(node: AdventureNode, allNodes: AdventureNode[], connections: NodeConnection[]): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // Run all rules but only return errors for this specific node
    const fullValidation = this.validateAdventure(allNodes, connections);
    
    return fullValidation.errors
      .concat(fullValidation.warnings)
      .filter(error => error.nodeId === node.id);
  }

  // Generate validation report
  generateReport(nodes: AdventureNode[], connections: NodeConnection[]): {
    summary: {
      totalNodes: number;
      totalConnections: number;
      errorCount: number;
      warningCount: number;
      isValid: boolean;
    };
    details: ValidationResult;
    recommendations: string[];
  } {
    const validation = this.validateAdventure(nodes, connections);
    
    const recommendations: string[] = [];
    
    // Generate recommendations based on validation results
    if (validation.errors.length > 0) {
      recommendations.push('Fix all errors before publishing your adventure');
    }
    
    if (validation.warnings.length > 5) {
      recommendations.push('Consider addressing warnings to improve player experience');
    }
    
    const storyNodes = nodes.filter(n => n.type === 'story').length;
    const totalNodes = nodes.length;
    
    if (storyNodes / totalNodes < 0.3) {
      recommendations.push('Add more story nodes to provide narrative context');
    }
    
    if (connections.length < nodes.length) {
      recommendations.push('Ensure all nodes are properly connected to create meaningful paths');
    }

    return {
      summary: {
        totalNodes: nodes.length,
        totalConnections: connections.length,
        errorCount: validation.errors.length,
        warningCount: validation.warnings.length,
        isValid: validation.isValid
      },
      details: validation,
      recommendations
    };
  }
}