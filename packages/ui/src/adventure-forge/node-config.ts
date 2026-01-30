/**
 * Node Configuration and Factory Functions
 * Based on PRD 09: Node System
 */

import type {
  NodeType,
  NodeConfig,
  PortConfig,
  AdventureNode,
  StoryNode,
  DecisionNode,
  ChallengeNode,
  CombatNode,
  CheckNode,
  Point,
  ConnectionType,
} from './types';

// Node visual configurations
export const NODE_CONFIGS: Record<NodeType, NodeConfig> = {
  story: {
    type: 'story',
    color: '#3B82F6', // Blue
    icon: '📖',
    label: 'Story',
    outputPorts: [{ id: 'next', type: 'default', label: 'Next' }],
  },
  decision: {
    type: 'decision',
    color: '#8B5CF6', // Purple
    icon: '🔀',
    label: 'Decision',
    outputPorts: 'dynamic', // Based on choices
  },
  challenge: {
    type: 'challenge',
    color: '#EAB308', // Yellow
    icon: '🎯',
    label: 'Challenge',
    outputPorts: [
      { id: 'success', type: 'success', label: 'Success' },
      { id: 'failure', type: 'failure', label: 'Failure' },
    ],
  },
  combat: {
    type: 'combat',
    color: '#EF4444', // Red
    icon: '⚔️',
    label: 'Combat',
    outputPorts: [
      { id: 'victory', type: 'success', label: 'Victory' },
      { id: 'defeat', type: 'failure', label: 'Defeat' },
      { id: 'flee', type: 'default', label: 'Fled' },
    ],
  },
  check: {
    type: 'check',
    color: '#22C55E', // Green
    icon: '❓',
    label: 'Check',
    outputPorts: [
      { id: 'success', type: 'success', label: 'Pass' },
      { id: 'failure', type: 'failure', label: 'Fail' },
    ],
  },
};

// Node dimensions
export const NODE_WIDTH = 200;
export const NODE_HEIGHT = 120;

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get output ports for a node
export function getOutputPorts(node: AdventureNode): PortConfig[] {
  const config = NODE_CONFIGS[node.type];
  
  if (config.outputPorts === 'dynamic') {
    // Decision nodes have dynamic ports based on choices
    if (node.type === 'decision') {
      const decisionNode = node as DecisionNode;
      return decisionNode.data.choices.map((choice, index) => ({
        id: `choice-${choice.id}`,
        type: 'choice' as ConnectionType,
        label: choice.text || `Choice ${index + 1}`,
        position: index,
      }));
    }
    return [];
  }
  
  // Combat nodes may or may not have flee port
  if (node.type === 'combat') {
    const combatNode = node as CombatNode;
    const ports = config.outputPorts as PortConfig[];
    if (!combatNode.data.canFlee) {
      return ports.filter(p => p.id !== 'flee');
    }
    return ports;
  }
  
  return config.outputPorts as PortConfig[];
}

// Get required output ports (must be connected)
export function getRequiredPorts(node: AdventureNode): PortConfig[] {
  const ports = getOutputPorts(node);
  
  // Victory/failure nodes don't need output connections
  if (node.isVictoryNode || node.isFailureNode) {
    return [];
  }
  
  return ports;
}

// Get connection type from port ID
export function getConnectionType(portId: string): ConnectionType {
  if (portId === 'success' || portId === 'victory') return 'success';
  if (portId === 'failure' || portId === 'defeat') return 'failure';
  if (portId.startsWith('choice-')) return 'choice';
  return 'default';
}

// Create a new node with default values
export function createNode(type: NodeType, position: Point, adventureId: string): AdventureNode {
  const base = {
    id: generateId(),
    adventureId,
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
      return {
        ...base,
        type: 'story',
        data: { objectives: [] },
      } as StoryNode;
      
    case 'decision':
      return {
        ...base,
        type: 'decision',
        data: { 
          choices: [
            { id: generateId(), text: 'Choice 1' },
            { id: generateId(), text: 'Choice 2' },
          ] 
        },
      } as DecisionNode;
      
    case 'challenge':
      return {
        ...base,
        type: 'challenge',
        data: {
          attribute: 'might',
          difficulty: 10,
          description: '',
          successText: '',
          failureText: '',
          allowRetry: false,
        },
      } as ChallengeNode;
      
    case 'combat':
      return {
        ...base,
        type: 'combat',
        data: {
          enemies: [],
          ambush: false,
          canFlee: false,
          victoryText: '',
          defeatText: '',
        },
      } as CombatNode;
      
    case 'check':
      return {
        ...base,
        type: 'check',
        data: {
          checkType: 'flag',
          successText: '',
          failureText: '',
        },
      } as CheckNode;
  }
}

// Duplicate a node at a new position
export function duplicateNode(node: AdventureNode, offset: Point = { x: 50, y: 50 }): AdventureNode {
  const newNode = {
    ...node,
    id: generateId(),
    position: {
      x: node.position.x + offset.x,
      y: node.position.y + offset.y,
    },
    title: `${node.title} (copy)`,
    isVictoryNode: false,
    isFailureNode: false,
    data: JSON.parse(JSON.stringify(node.data)), // Deep clone data
  };
  
  // Regenerate choice IDs for decision nodes
  if (newNode.type === 'decision') {
    const decisionNode = newNode as DecisionNode;
    decisionNode.data.choices = decisionNode.data.choices.map(choice => ({
      ...choice,
      id: generateId(),
    }));
  }
  
  return newNode as AdventureNode;
}
