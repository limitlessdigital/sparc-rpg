// Test to verify Adventure Forge can handle Naigonn Chapel complexity
import { AdventureNode, NodeConnection } from '../src/components/AdventureForge/types';

// This test data represents a simplified version of Naigonn Chapel adventure
// to verify the Adventure Forge can handle the complexity requirements

export const naigonnChapelNodes: AdventureNode[] = [
  // Start Node
  {
    id: 'start-quest-introduction',
    type: 'story',
    position: { x: 0, y: 0 },
    validationState: 'valid',
    properties: {
      title: 'Quest Introduction',
      content: {
        text: 'Benenthir approaches you with news of the lost Naigonn Chapel beneath the city...'
      },
      experiencePoints: 0,
      endConditions: { victory: false, failure: false }
    },
    connections: {
      inputs: [],
      outputs: [{ id: 'continue', label: 'Continue', position: { x: 30, y: 0 } }]
    }
  },

  // First Decision - Ask Questions or Go
  {
    id: 'initial-decision',
    type: 'decision',
    position: { x: 200, y: 0 },
    validationState: 'valid',
    properties: {
      title: 'Initial Decision',
      objective: 'Learn more or head out?',
      content: {
        text: 'Benenthir waits for your response. You can ask questions or head to the chapel.'
      },
      decisions: [
        {
          id: 'ask-questions',
          description: 'Ask Benenthir Questions',
          targetConnection: { type: 'new' }
        },
        {
          id: 'head-to-chapel',
          description: 'Head to Chapel',
          targetConnection: { type: 'new' }
        }
      ]
    },
    connections: {
      inputs: [{ id: 'input', label: 'Input', position: { x: -30, y: 0 } }],
      outputs: [
        { id: 'ask', label: 'Ask Questions', position: { x: 30, y: -10 } },
        { id: 'go', label: 'Go to Chapel', position: { x: 30, y: 10 } }
      ]
    }
  },

  // Below the City
  {
    id: 'below-the-city',
    type: 'story',
    position: { x: 400, y: 100 },
    validationState: 'valid',
    properties: {
      title: 'Below the City',
      content: {
        text: 'You descend into the ancient tunnels beneath the city. The air grows cold and damp as you approach the legendary Naigonn Chapel.'
      },
      experiencePoints: 10,
      endConditions: { victory: false, failure: false }
    },
    connections: {
      inputs: [{ id: 'input', label: 'Input', position: { x: -30, y: 0 } }],
      outputs: [{ id: 'output', label: 'Continue', position: { x: 30, y: 0 } }]
    }
  },

  // Chapel Approach Decision
  {
    id: 'chapel-approach',
    type: 'decision',
    position: { x: 600, y: 100 },
    validationState: 'valid',
    properties: {
      title: 'Approach Naigonn Chapel',
      objective: 'How do you approach the ancient chapel?',
      content: {
        text: 'The chapel looms before you. Its stone doors are massive, and you notice a glinting emerald embedded in the eye carving above.'
      },
      decisions: [
        {
          id: 'try-door',
          description: 'Try the Door (STR 4+)',
          targetConnection: { type: 'new' }
        },
        {
          id: 'look-around',
          description: 'Look Around',
          targetConnection: { type: 'new' }
        },
        {
          id: 'take-emerald',
          description: 'Take That Emerald',
          targetConnection: { type: 'new' }
        }
      ]
    },
    connections: {
      inputs: [{ id: 'input', label: 'Input', position: { x: -30, y: 0 } }],
      outputs: [
        { id: 'door', label: 'Try Door', position: { x: 30, y: -15 } },
        { id: 'look', label: 'Look Around', position: { x: 30, y: 0 } },
        { id: 'emerald', label: 'Take Emerald', position: { x: 30, y: 15 } }
      ]
    }
  },

  // Door Challenge
  {
    id: 'door-challenge',
    type: 'challenge',
    position: { x: 800, y: 50 },
    validationState: 'valid',
    properties: {
      title: 'Force the Door',
      objective: 'Use strength to open the heavy stone door',
      stat: 'STR',
      content: {
        text: 'The massive stone door resists your efforts. You need to use all your strength.'
      },
      outcomes: [
        {
          type: 'simple',
          rollRange: { min: 4, max: 6 },
          description: 'Success: The door opens with a grinding sound',
          targetConnection: { type: 'new' }
        },
        {
          type: 'simple',
          rollRange: { min: 1, max: 3 },
          description: 'Failure: The door remains sealed, alerting nearby creatures',
          targetConnection: { type: 'new' }
        }
      ]
    },
    connections: {
      inputs: [{ id: 'input', label: 'Input', position: { x: -30, y: 0 } }],
      outputs: [
        { id: 'success', label: 'Success', position: { x: 30, y: -10 } },
        { id: 'failure', label: 'Failure', position: { x: 30, y: 10 } }
      ]
    }
  },

  // Troglodyte Encounter
  {
    id: 'troglodyte-encounter',
    type: 'combat',
    position: { x: 800, y: 200 },
    validationState: 'valid',
    properties: {
      title: 'Troglodyte Encounter',
      objective: 'Defeat or negotiate with the troglodytes',
      content: {
        text: 'A group of troglodytes emerge from the shadows, brandishing primitive spears!'
      },
      creatures: [
        {
          creatureId: 'troglodyte-warrior',
          quantity: { type: 'dynamic', value: 1, perPlayerModifier: 1 }
        }
      ],
      outcomes: [
        {
          condition: 'victory',
          description: 'The troglodytes are defeated',
          targetConnection: { type: 'new' }
        },
        {
          condition: 'defeat',
          description: 'You are overwhelmed',
          targetConnection: { type: 'new' }
        }
      ]
    },
    connections: {
      inputs: [{ id: 'input', label: 'Input', position: { x: -30, y: 0 } }],
      outputs: [
        { id: 'victory', label: 'Victory', position: { x: 30, y: -10 } },
        { id: 'defeat', label: 'Defeat', position: { x: 30, y: 10 } }
      ]
    }
  },

  // Chapel Interior - Path Choice
  {
    id: 'chapel-entrance',
    type: 'decision',
    position: { x: 1000, y: 100 },
    validationState: 'valid',
    properties: {
      title: 'Naigonn Chapel Entrance',
      objective: 'Choose your path through the chapel',
      content: {
        text: 'Inside the chapel, you see two ornate doors: one decorated with lions (left), another with serpents (right).'
      },
      decisions: [
        {
          id: 'lion-door',
          description: 'Go through Lion Door (Left)',
          targetConnection: { type: 'new' }
        },
        {
          id: 'snake-door',
          description: 'Go through Snake Door (Right)',
          targetConnection: { type: 'new' }
        },
        {
          id: 'exit',
          description: 'Exit the Dungeon',
          targetConnection: { type: 'new' }
        }
      ]
    },
    connections: {
      inputs: [{ id: 'input', label: 'Input', position: { x: -30, y: 0 } }],
      outputs: [
        { id: 'lion', label: 'Lion Path', position: { x: 30, y: -15 } },
        { id: 'snake', label: 'Snake Path', position: { x: 30, y: 0 } },
        { id: 'exit', label: 'Exit', position: { x: 30, y: 15 } }
      ]
    }
  },

  // Manticore Combat (Lion Path)
  {
    id: 'manticore-lair',
    type: 'combat',
    position: { x: 1200, y: 0 },
    validationState: 'valid',
    properties: {
      title: 'Manticore Lair',
      objective: 'Defeat the manticore to claim the key',
      content: {
        text: 'A fearsome manticore blocks your path, a golden key gleaming on its collar!'
      },
      creatures: [
        {
          creatureId: 'manticore',
          quantity: { type: 'static', value: 1 }
        }
      ],
      outcomes: [
        {
          condition: 'victory',
          description: 'You claim the key from the manticore\'s collar',
          targetConnection: { type: 'new' }
        },
        {
          condition: 'flee',
          description: 'You retreat back to the narthex',
          targetConnection: { type: 'existing', targetNodeId: 'chapel-entrance' }
        }
      ]
    },
    connections: {
      inputs: [{ id: 'input', label: 'Input', position: { x: -30, y: 0 } }],
      outputs: [
        { id: 'victory', label: 'Victory', position: { x: 30, y: -10 } },
        { id: 'flee', label: 'Flee', position: { x: 30, y: 10 } }
      ]
    }
  },

  // Medusa Puzzle (Snake Path)
  {
    id: 'medusa-puzzle',
    type: 'challenge',
    position: { x: 1200, y: 100 },
    validationState: 'valid',
    properties: {
      title: 'Medusa Statue Puzzle',
      objective: 'Solve the statue arrangement puzzle',
      stat: 'INT',
      content: {
        text: 'Four medusa statues surround you. You must rotate them to face each other in an X pattern, but beware their petrifying gaze!'
      },
      outcomes: [
        {
          type: 'complex',
          rollRange: { min: 3, max: 6 },
          description: 'Success: The statues align, revealing a secret passage',
          targetConnection: { type: 'new' }
        },
        {
          type: 'complex',
          rollRange: { min: 1, max: 2 },
          description: 'Failure: You are caught in a medusa\'s gaze!',
          targetConnection: { type: 'new' }
        }
      ]
    },
    connections: {
      inputs: [{ id: 'input', label: 'Input', position: { x: -30, y: 0 } }],
      outputs: [
        { id: 'success', label: 'Success', position: { x: 30, y: -10 } },
        { id: 'failure', label: 'Petrified!', position: { x: 30, y: 10 } }
      ]
    }
  },

  // Final Beholder Chamber (Convergence Point)
  {
    id: 'beholder-chamber',
    type: 'combat',
    position: { x: 1400, y: 50 },
    validationState: 'valid',
    properties: {
      title: 'Beholder Chamber',
      objective: 'Face Sethrix the Beholder',
      content: {
        text: 'Both paths converge here. The mighty beholder Sethrix hovers above a treasure chest, its many eyes glowing with malevolent power!'
      },
      creatures: [
        {
          creatureId: 'sethrix-beholder',
          quantity: { type: 'static', value: 1 }
        },
        {
          creatureId: 'floating-eye',
          quantity: { type: 'dynamic', value: 0, perPlayerModifier: 1 }
        }
      ],
      outcomes: [
        {
          condition: 'victory',
          description: 'Sethrix is defeated! The treasure chest is yours',
          targetConnection: { type: 'new' }
        },
        {
          condition: 'defeat',
          description: 'The beholder\'s rays overwhelm you',
          targetConnection: { type: 'new' }
        }
      ]
    },
    connections: {
      inputs: [{ id: 'input-lion', label: 'From Lion Path', position: { x: -30, y: -10 } },
                { id: 'input-snake', label: 'From Snake Path', position: { x: -30, y: 10 } }],
      outputs: [
        { id: 'victory', label: 'Victory', position: { x: 30, y: -10 } },
        { id: 'defeat', label: 'Defeat', position: { x: 30, y: 10 } }
      ]
    }
  },

  // Victory Node
  {
    id: 'quest-complete',
    type: 'story',
    position: { x: 1600, y: 0 },
    validationState: 'valid',
    properties: {
      title: 'Quest Complete - Silver Sword Hilt',
      content: {
        text: 'You open the treasure chest and find the legendary Silver Sword Hilt! Benenthir will be pleased with your success.'
      },
      experiencePoints: 100,
      endConditions: { victory: true, failure: false }
    },
    connections: {
      inputs: [{ id: 'input', label: 'Input', position: { x: -30, y: 0 } }],
      outputs: []
    }
  },

  // Failure Node
  {
    id: 'quest-failure',
    type: 'story',
    position: { x: 1600, y: 100 },
    validationState: 'valid',
    properties: {
      title: 'Quest Failure',
      content: {
        text: 'Your adventure ends here. Perhaps another party will succeed where you could not...'
      },
      experiencePoints: 0,
      endConditions: { victory: false, failure: true }
    },
    connections: {
      inputs: [{ id: 'input', label: 'Input', position: { x: -30, y: 0 } }],
      outputs: []
    }
  }
];

export const naigonnChapelConnections: NodeConnection[] = [
  {
    id: 'start-to-decision',
    sourceNodeId: 'start-quest-introduction',
    sourcePort: 'continue',
    targetNodeId: 'initial-decision',
    targetPort: 'input',
    path: { start: { x: 0, y: 0 }, control1: { x: 50, y: 0 }, control2: { x: 150, y: 0 }, end: { x: 200, y: 0 } },
    validation: { isValid: true, errors: [], warnings: [] }
  },
  {
    id: 'decision-to-chapel',
    sourceNodeId: 'initial-decision',
    sourcePort: 'go',
    targetNodeId: 'below-the-city',
    targetPort: 'input',
    path: { start: { x: 200, y: 0 }, control1: { x: 250, y: 0 }, control2: { x: 350, y: 50 }, end: { x: 400, y: 100 } },
    validation: { isValid: true, errors: [], warnings: [] }
  },
  {
    id: 'below-to-approach',
    sourceNodeId: 'below-the-city',
    sourcePort: 'output',
    targetNodeId: 'chapel-approach',
    targetPort: 'input',
    path: { start: { x: 400, y: 100 }, control1: { x: 450, y: 100 }, control2: { x: 550, y: 100 }, end: { x: 600, y: 100 } },
    validation: { isValid: true, errors: [], warnings: [] }
  },
  {
    id: 'approach-to-door',
    sourceNodeId: 'chapel-approach',
    sourcePort: 'door',
    targetNodeId: 'door-challenge',
    targetPort: 'input',
    path: { start: { x: 600, y: 85 }, control1: { x: 650, y: 70 }, control2: { x: 750, y: 50 }, end: { x: 800, y: 50 } },
    validation: { isValid: true, errors: [], warnings: [] }
  },
  {
    id: 'door-fail-to-troglodytes',
    sourceNodeId: 'door-challenge',
    sourcePort: 'failure',
    targetNodeId: 'troglodyte-encounter',
    targetPort: 'input',
    path: { start: { x: 800, y: 60 }, control1: { x: 820, y: 100 }, control2: { x: 820, y: 150 }, end: { x: 800, y: 200 } },
    validation: { isValid: true, errors: [], warnings: [] }
  },
  {
    id: 'door-success-to-entrance',
    sourceNodeId: 'door-challenge',
    sourcePort: 'success',
    targetNodeId: 'chapel-entrance',
    targetPort: 'input',
    path: { start: { x: 800, y: 40 }, control1: { x: 850, y: 30 }, control2: { x: 950, y: 70 }, end: { x: 1000, y: 100 } },
    validation: { isValid: true, errors: [], warnings: [] }
  },
  {
    id: 'troglodytes-to-entrance',
    sourceNodeId: 'troglodyte-encounter',
    sourcePort: 'victory',
    targetNodeId: 'chapel-entrance',
    targetPort: 'input',
    path: { start: { x: 800, y: 190 }, control1: { x: 850, y: 170 }, control2: { x: 950, y: 130 }, end: { x: 1000, y: 100 } },
    validation: { isValid: true, errors: [], warnings: [] }
  },
  {
    id: 'entrance-to-manticore',
    sourceNodeId: 'chapel-entrance',
    sourcePort: 'lion',
    targetNodeId: 'manticore-lair',
    targetPort: 'input',
    path: { start: { x: 1000, y: 85 }, control1: { x: 1050, y: 50 }, control2: { x: 1150, y: 20 }, end: { x: 1200, y: 0 } },
    validation: { isValid: true, errors: [], warnings: [] }
  },
  {
    id: 'entrance-to-medusa',
    sourceNodeId: 'chapel-entrance',
    sourcePort: 'snake',
    targetNodeId: 'medusa-puzzle',
    targetPort: 'input',
    path: { start: { x: 1000, y: 100 }, control1: { x: 1050, y: 100 }, control2: { x: 1150, y: 100 }, end: { x: 1200, y: 100 } },
    validation: { isValid: true, errors: [], warnings: [] }
  },
  {
    id: 'manticore-to-beholder',
    sourceNodeId: 'manticore-lair',
    sourcePort: 'victory',
    targetNodeId: 'beholder-chamber',
    targetPort: 'input-lion',
    path: { start: { x: 1200, y: -10 }, control1: { x: 1250, y: 0 }, control2: { x: 1350, y: 20 }, end: { x: 1400, y: 40 } },
    validation: { isValid: true, errors: [], warnings: [] }
  },
  {
    id: 'medusa-to-beholder',
    sourceNodeId: 'medusa-puzzle',
    sourcePort: 'success',
    targetNodeId: 'beholder-chamber',
    targetPort: 'input-snake',
    path: { start: { x: 1200, y: 90 }, control1: { x: 1250, y: 80 }, control2: { x: 1350, y: 70 }, end: { x: 1400, y: 60 } },
    validation: { isValid: true, errors: [], warnings: [] }
  },
  {
    id: 'beholder-victory',
    sourceNodeId: 'beholder-chamber',
    sourcePort: 'victory',
    targetNodeId: 'quest-complete',
    targetPort: 'input',
    path: { start: { x: 1400, y: 40 }, control1: { x: 1450, y: 30 }, control2: { x: 1550, y: 10 }, end: { x: 1600, y: 0 } },
    validation: { isValid: true, errors: [], warnings: [] }
  },
  {
    id: 'beholder-defeat',
    sourceNodeId: 'beholder-chamber',
    sourcePort: 'defeat',
    targetNodeId: 'quest-failure',
    targetPort: 'input',
    path: { start: { x: 1400, y: 60 }, control1: { x: 1450, y: 80 }, control2: { x: 1550, y: 90 }, end: { x: 1600, y: 100 } },
    validation: { isValid: true, errors: [], warnings: [] }
  },
  {
    id: 'troglodytes-defeat',
    sourceNodeId: 'troglodyte-encounter',
    sourcePort: 'defeat',
    targetNodeId: 'quest-failure',
    targetPort: 'input',
    path: { start: { x: 800, y: 210 }, control1: { x: 1000, y: 250 }, control2: { x: 1400, y: 200 }, end: { x: 1600, y: 100 } },
    validation: { isValid: true, errors: [], warnings: [] }
  },
  {
    id: 'medusa-failure',
    sourceNodeId: 'medusa-puzzle',
    sourcePort: 'failure',
    targetNodeId: 'quest-failure',
    targetPort: 'input',
    path: { start: { x: 1200, y: 110 }, control1: { x: 1300, y: 120 }, control2: { x: 1500, y: 110 }, end: { x: 1600, y: 100 } },
    validation: { isValid: true, errors: [], warnings: [] }
  }
];

// Validation test function
export function validateNaigonnChapelAdventure(): {
  isValid: boolean;
  nodeCount: number;
  connectionCount: number;
  pathsToVictory: number;
  pathsToFailure: number;
  nodeTypes: Record<string, number>;
} {
  const nodeTypes = naigonnChapelNodes.reduce((acc, node) => {
    acc[node.type] = (acc[node.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const victoryNodes = naigonnChapelNodes.filter(node => 
    node.type === 'story' && node.properties.endConditions?.victory
  );
  
  const failureNodes = naigonnChapelNodes.filter(node => 
    node.type === 'story' && node.properties.endConditions?.failure
  );

  const allNodesHaveValidProperties = naigonnChapelNodes.every(node => {
    switch (node.type) {
      case 'story':
        return node.properties.title && node.properties.content?.text;
      case 'decision':
        return node.properties.title && node.properties.objective && node.properties.decisions?.length > 0;
      case 'challenge':
        return node.properties.title && node.properties.stat && node.properties.outcomes?.length > 0;
      case 'combat':
        return node.properties.title && node.properties.creatures?.length > 0;
      case 'check':
        return node.properties.title && node.properties.outcomes;
      default:
        return false;
    }
  });

  return {
    isValid: victoryNodes.length > 0 && failureNodes.length > 0 && allNodesHaveValidProperties,
    nodeCount: naigonnChapelNodes.length,
    connectionCount: naigonnChapelConnections.length,
    pathsToVictory: victoryNodes.length,
    pathsToFailure: failureNodes.length,
    nodeTypes
  };
}