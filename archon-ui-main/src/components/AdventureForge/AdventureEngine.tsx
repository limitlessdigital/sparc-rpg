import { 
  AdventureState, 
  AdventureNode, 
  NodeConnection, 
  ConditionalExpression, 
  ActionRecord, 
  ActionResult, 
  StateChange, 
  GameplayEngine,
  InventoryItem,
  PartyMember,
  Reward,
  Consequence
} from './types';

export class AdventureEngine implements GameplayEngine {
  private nodes: AdventureNode[] = [];
  private connections: NodeConnection[] = [];

  constructor(nodes: AdventureNode[], connections: NodeConnection[]) {
    this.nodes = nodes;
    this.connections = connections;
  }

  // Evaluate conditional expressions for branching logic
  evaluateCondition(condition: ConditionalExpression, state: AdventureState): boolean {
    if (condition.type === 'simple') {
      return this.evaluateSimpleCondition(condition, state);
    } else if (condition.type === 'compound') {
      return this.evaluateCompoundCondition(condition, state);
    }
    return false;
  }

  private evaluateSimpleCondition(condition: ConditionalExpression, state: AdventureState): boolean {
    if (!condition.variable || !condition.comparison) return false;

    const value = this.getStateValue(condition.variable, state);
    const targetValue = condition.value;

    switch (condition.comparison) {
      case '==':
        return value === targetValue;
      case '!=':
        return value !== targetValue;
      case '>':
        return Number(value) > Number(targetValue);
      case '<':
        return Number(value) < Number(targetValue);
      case '>=':
        return Number(value) >= Number(targetValue);
      case '<=':
        return Number(value) <= Number(targetValue);
      case 'contains':
        return String(value).includes(String(targetValue));
      case 'exists':
        return value !== undefined && value !== null;
      default:
        return false;
    }
  }

  private evaluateCompoundCondition(condition: ConditionalExpression, state: AdventureState): boolean {
    if (!condition.conditions || condition.conditions.length === 0) return false;

    const results = condition.conditions.map(c => this.evaluateCondition(c, state));

    switch (condition.operator) {
      case 'and':
        return results.every(r => r);
      case 'or':
        return results.some(r => r);
      case 'not':
        return !results[0]; // NOT only applies to first condition
      default:
        return false;
    }
  }

  private getStateValue(path: string, state: AdventureState): any {
    const parts = path.split('.');
    let current: any = state;

    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      
      // Handle array access like inventory[0].name
      if (part.includes('[') && part.includes(']')) {
        const [key, indexStr] = part.split('[');
        const index = parseInt(indexStr.replace(']', ''), 10);
        current = current[key]?.[index];
      } else {
        current = current[part];
      }
    }

    return current;
  }

  // Execute actions and calculate results
  executeAction(action: ActionRecord, state: AdventureState): AdventureState {
    const newState = { ...state };
    
    // Add to history
    newState.actionHistory = [...newState.actionHistory, action];
    
    // Mark node as visited
    if (!newState.visitedNodes.includes(action.nodeId)) {
      newState.visitedNodes = [...newState.visitedNodes, action.nodeId];
    }

    // Calculate and apply action result if present
    if (action.result) {
      return this.applyActionResult(action.result, newState);
    }

    return newState;
  }

  private applyActionResult(result: ActionResult, state: AdventureState): AdventureState {
    let newState = { ...state };

    // Apply state changes
    newState = this.applyStateChanges(result.stateChanges, newState);

    // Apply rewards
    if (result.rewards) {
      newState = this.applyRewards(result.rewards, newState);
    }

    return newState;
  }

  // Apply state changes based on action outcomes
  applyStateChanges(changes: StateChange[], state: AdventureState): AdventureState {
    let newState = { ...state };

    for (const change of changes) {
      // Check condition if present
      if (change.condition && !this.evaluateCondition(change.condition, newState)) {
        continue;
      }

      switch (change.type) {
        case 'variable':
          newState = this.applyVariableChange(change, newState);
          break;
        case 'inventory':
          newState = this.applyInventoryChange(change, newState);
          break;
        case 'party':
          newState = this.applyPartyChange(change, newState);
          break;
        case 'flag':
          newState = this.applyFlagChange(change, newState);
          break;
      }
    }

    return newState;
  }

  private applyVariableChange(change: StateChange, state: AdventureState): AdventureState {
    const newState = { ...state, variables: { ...state.variables } };

    switch (change.operation) {
      case 'set':
        newState.variables[change.target] = change.value;
        break;
      case 'add':
        const currentValue = newState.variables[change.target] || 0;
        newState.variables[change.target] = Number(currentValue) + Number(change.value);
        break;
      case 'remove':
        delete newState.variables[change.target];
        break;
      case 'modify':
        if (newState.variables[change.target] !== undefined) {
          newState.variables[change.target] = change.value;
        }
        break;
    }

    return newState;
  }

  private applyInventoryChange(change: StateChange, state: AdventureState): AdventureState {
    const newState = { ...state, inventory: [...state.inventory] };

    switch (change.operation) {
      case 'add':
        const existingItem = newState.inventory.find(item => item.id === change.target);
        if (existingItem) {
          existingItem.quantity += Number(change.value.quantity || 1);
        } else {
          newState.inventory.push(change.value as InventoryItem);
        }
        break;
      case 'remove':
        const itemIndex = newState.inventory.findIndex(item => item.id === change.target);
        if (itemIndex >= 0) {
          const item = newState.inventory[itemIndex];
          const removeQuantity = Number(change.value) || 1;
          
          if (item.quantity <= removeQuantity) {
            newState.inventory.splice(itemIndex, 1);
          } else {
            item.quantity -= removeQuantity;
          }
        }
        break;
      case 'modify':
        const modifyItem = newState.inventory.find(item => item.id === change.target);
        if (modifyItem) {
          Object.assign(modifyItem, change.value);
        }
        break;
    }

    return newState;
  }

  private applyPartyChange(change: StateChange, state: AdventureState): AdventureState {
    const newState = { ...state, party: state.party.map(member => ({ ...member })) };

    const member = newState.party.find(m => m.id === change.target);
    if (!member) return newState;

    switch (change.operation) {
      case 'set':
      case 'modify':
        Object.assign(member, change.value);
        break;
      case 'add':
        if (change.value.experience) {
          member.experience += change.value.experience;
          // Check for level up
          const newLevel = Math.floor(member.experience / 100) + 1;
          if (newLevel > member.level) {
            member.level = newLevel;
            member.maxHP += 5; // Simple level up bonus
            member.currentHP = member.maxHP; // Full heal on level up
          }
        }
        if (change.value.stats) {
          Object.keys(change.value.stats).forEach(stat => {
            if (member.stats[stat as keyof typeof member.stats] !== undefined) {
              member.stats[stat as keyof typeof member.stats] += change.value.stats[stat];
            }
          });
        }
        break;
    }

    return newState;
  }

  private applyFlagChange(change: StateChange, state: AdventureState): AdventureState {
    const newState = { ...state, flags: { ...state.flags } };

    switch (change.operation) {
      case 'set':
        newState.flags[change.target] = Boolean(change.value);
        break;
      case 'remove':
        delete newState.flags[change.target];
        break;
    }

    return newState;
  }

  private applyRewards(rewards: Reward[], state: AdventureState): AdventureState {
    let newState = { ...state };

    for (const reward of rewards) {
      switch (reward.type) {
        case 'experience':
          const changes: StateChange[] = [{
            type: 'party',
            target: reward.target || state.party[0]?.id || 'party',
            operation: 'add',
            value: { experience: reward.value }
          }];
          newState = this.applyStateChanges(changes, newState);
          break;
        case 'item':
          const itemChange: StateChange[] = [{
            type: 'inventory',
            target: reward.value.id,
            operation: 'add',
            value: reward.value
          }];
          newState = this.applyStateChanges(itemChange, newState);
          break;
      }
    }

    return newState;
  }

  // Validate if a transition between nodes is allowed
  validateTransition(fromNodeId: string, toNodeId: string, state: AdventureState): boolean {
    const connection = this.connections.find(conn => 
      conn.sourceNodeId === fromNodeId && conn.targetNodeId === toNodeId
    );

    if (!connection) return false;

    const sourceNode = this.nodes.find(n => n.id === fromNodeId);
    if (!sourceNode) return false;

    // Check node-specific transition rules
    return this.validateNodeTransition(sourceNode, connection.sourcePort, state);
  }

  private validateNodeTransition(node: AdventureNode, outputPort: string, state: AdventureState): boolean {
    switch (node.type) {
      case 'decision':
        // Decision nodes require choice selection
        return outputPort !== 'default';
      case 'challenge':
      case 'check':
        // Challenge/check nodes require resolution
        const lastAction = state.actionHistory
          .filter(a => a.nodeId === node.id)
          .sort((a, b) => b.timestamp - a.timestamp)[0];
        return lastAction?.result !== undefined;
      case 'combat':
        // Combat nodes require resolution
        return ['victory', 'defeat', 'flee'].includes(outputPort);
      case 'story':
        // Story nodes allow free progression unless they have end conditions
        const storyProps = node.properties as any;
        if (storyProps.endConditions?.victory || storyProps.endConditions?.failure) {
          return false; // End nodes shouldn't allow transitions
        }
        return true;
      default:
        return true;
    }
  }

  // Calculate outcome for node interactions
  calculateOutcome(nodeId: string, choice: any, state: AdventureState): ActionResult {
    const node = this.nodes.find(n => n.id === nodeId);
    if (!node) {
      return {
        success: false,
        consequences: [],
        stateChanges: []
      };
    }

    switch (node.type) {
      case 'challenge':
        return this.calculateChallengeOutcome(node, choice, state);
      case 'check':
        return this.calculateCheckOutcome(node, choice, state);
      case 'combat':
        return this.calculateCombatOutcome(node, choice, state);
      case 'decision':
        return this.calculateDecisionOutcome(node, choice, state);
      case 'story':
        return this.calculateStoryOutcome(node, choice, state);
      default:
        return {
          success: true,
          consequences: [],
          stateChanges: []
        };
    }
  }

  private calculateChallengeOutcome(node: AdventureNode, choice: any, state: AdventureState): ActionResult {
    const props = node.properties as any;
    const challenge = props.challenge;
    
    if (!challenge || !choice.characterId) {
      return { success: false, consequences: [], stateChanges: [] };
    }

    const character = state.party.find(p => p.id === choice.characterId);
    if (!character) {
      return { success: false, consequences: [], stateChanges: [] };
    }

    // SPARC RPG uses d6 only
    const roll = Math.floor(Math.random() * 6) + 1;
    const stat = character.stats[challenge.stat as keyof typeof character.stats];
    const total = roll + stat;
    const success = total >= challenge.difficulty;

    const consequences: Consequence[] = [{
      id: `challenge_${Date.now()}`,
      type: 'narrative',
      description: `${character.name} rolled ${roll} + ${stat} = ${total} vs difficulty ${challenge.difficulty}`,
      permanent: false
    }];

    const stateChanges: StateChange[] = [];
    const rewards: Reward[] = [];

    if (success) {
      consequences.push({
        id: `success_${Date.now()}`,
        type: 'narrative', 
        description: challenge.successText || 'Challenge succeeded!',
        permanent: false
      });

      if (challenge.rewards) {
        rewards.push(...challenge.rewards);
      }
    } else {
      consequences.push({
        id: `failure_${Date.now()}`,
        type: 'narrative',
        description: challenge.failureText || 'Challenge failed!',
        permanent: false
      });

      if (challenge.penalties) {
        stateChanges.push(...challenge.penalties);
      }
    }

    return {
      success,
      consequences,
      stateChanges,
      rewards
    };
  }

  private calculateCheckOutcome(node: AdventureNode, choice: any, state: AdventureState): ActionResult {
    const props = node.properties as any;
    const check = props.check;
    
    if (!check) {
      return { success: false, consequences: [], stateChanges: [] };
    }

    // Simple pass/fail based on conditions
    const success = check.condition ? this.evaluateCondition(check.condition, state) : Math.random() > 0.5;

    return {
      success,
      consequences: [{
        id: `check_${Date.now()}`,
        type: 'narrative',
        description: success ? (check.passText || 'Check passed!') : (check.failText || 'Check failed!'),
        permanent: false
      }],
      stateChanges: success ? (check.passEffects || []) : (check.failEffects || [])
    };
  }

  private calculateCombatOutcome(node: AdventureNode, choice: any, state: AdventureState): ActionResult {
    // Simplified combat resolution
    const props = node.properties as any;
    const encounter = props.encounter;
    
    if (!encounter) {
      return { success: false, consequences: [], stateChanges: [] };
    }

    // Basic combat calculation based on party vs creature stats
    const partyPower = state.party.reduce((sum, member) => 
      sum + member.stats.strength + member.stats.dexterity, 0
    );
    
    const creaturePower = encounter.creatures?.reduce((sum: number, creature: any) => 
      sum + (creature.stats?.strength || 5) + (creature.stats?.dexterity || 5), 0
    ) || 10;

    const roll = Math.floor(Math.random() * 6) + 1;
    const success = (partyPower + roll) > creaturePower;

    return {
      success,
      consequences: [{
        id: `combat_${Date.now()}`,
        type: 'narrative',
        description: success ? 'Victory!' : 'Defeat!',
        permanent: false
      }],
      stateChanges: success ? (encounter.victoryEffects || []) : (encounter.defeatEffects || []),
      rewards: success ? (encounter.rewards || []) : undefined
    };
  }

  private calculateDecisionOutcome(node: AdventureNode, choice: any, state: AdventureState): ActionResult {
    const props = node.properties as any;
    const selectedOption = props.options?.find((opt: any) => opt.id === choice.optionId);
    
    if (!selectedOption) {
      return { success: false, consequences: [], stateChanges: [] };
    }

    return {
      success: true,
      consequences: [{
        id: `decision_${Date.now()}`,
        type: 'narrative',
        description: `Chose: ${selectedOption.text}`,
        permanent: true
      }],
      stateChanges: selectedOption.effects || []
    };
  }

  private calculateStoryOutcome(node: AdventureNode, choice: any, state: AdventureState): ActionResult {
    const props = node.properties as any;
    
    return {
      success: true,
      consequences: [],
      stateChanges: props.effects || [],
      rewards: props.rewards || []
    };
  }

  // Get available actions for a node in current state
  getAvailableActions(nodeId: string, state: AdventureState): string[] {
    const node = this.nodes.find(n => n.id === nodeId);
    if (!node) return [];

    const outgoingConnections = this.connections.filter(conn => conn.sourceNodeId === nodeId);
    
    return outgoingConnections
      .filter(conn => this.validateTransition(nodeId, conn.targetNodeId, state))
      .map(conn => conn.sourcePort);
  }

  // Create initial adventure state
  static createInitialState(startNodeId: string): AdventureState {
    return {
      variables: {},
      inventory: [],
      party: [
        {
          id: 'player',
          name: 'Player Character',
          stats: { strength: 3, dexterity: 3, intelligence: 3, charisma: 3 },
          currentHP: 20,
          maxHP: 20,
          experience: 0,
          level: 1,
          conditions: []
        }
      ],
      flags: {},
      currentNodeId: startNodeId,
      visitedNodes: [],
      actionHistory: []
    };
  }
}