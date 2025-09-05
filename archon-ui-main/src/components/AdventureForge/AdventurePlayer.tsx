import React, { useState, useEffect } from 'react';
import { AdventureEngine } from './AdventureEngine';
import { 
  AdventureState, 
  AdventureNode, 
  NodeConnection, 
  ActionRecord,
  ActionResult
} from './types';

interface AdventurePlayerProps {
  nodes: AdventureNode[];
  connections: NodeConnection[];
  startNodeId: string;
  onStateChange?: (state: AdventureState) => void;
}

export const AdventurePlayer: React.FC<AdventurePlayerProps> = ({
  nodes,
  connections,
  startNodeId,
  onStateChange
}) => {
  const [engine] = useState(() => new AdventureEngine(nodes, connections));
  const [gameState, setGameState] = useState<AdventureState>(() => 
    AdventureEngine.createInitialState(startNodeId)
  );

  const currentNode = nodes.find(n => n.id === gameState.currentNodeId);
  const availableActions = engine.getAvailableActions(gameState.currentNodeId, gameState);

  useEffect(() => {
    if (onStateChange) {
      onStateChange(gameState);
    }
  }, [gameState, onStateChange]);

  const executeAction = async (actionType: string, details: any = {}) => {
    if (!currentNode) return;

    const action: ActionRecord = {
      id: `action_${Date.now()}`,
      timestamp: Date.now(),
      nodeId: currentNode.id,
      actionType: actionType as any,
      details
    };

    // Calculate outcome for the action
    let result: ActionResult | undefined;
    
    if (actionType === 'challenge' || actionType === 'check' || actionType === 'combat' || actionType === 'choice') {
      result = engine.calculateOutcome(currentNode.id, details, gameState);
      action.result = result;
    }

    // Apply the action to the game state
    const newState = engine.executeAction(action, gameState);
    setGameState(newState);

    return result;
  };

  const navigateToNode = (targetNodeId: string) => {
    if (engine.validateTransition(gameState.currentNodeId, targetNodeId, gameState)) {
      setGameState({
        ...gameState,
        currentNodeId: targetNodeId
      });
    }
  };

  const renderStoryNode = () => {
    if (!currentNode || currentNode.type !== 'story') return null;
    
    const props = currentNode.properties as any;
    
    return (
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-xl font-bold text-blue-900 mb-4">{props.title}</h3>
        <div className="text-gray-700 mb-4" dangerouslySetInnerHTML={{ __html: props.content?.text || '' }} />
        
        {props.objectives && props.objectives.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-blue-800 mb-2">Objectives:</h4>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {props.objectives.map((obj: string, index: number) => (
                <li key={index}>{obj}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2">
          {availableActions.map(action => {
            const targetConnection = connections.find(c => 
              c.sourceNodeId === currentNode.id && c.sourcePort === action
            );
            const targetNode = targetConnection ? nodes.find(n => n.id === targetConnection.targetNodeId) : null;
            
            return (
              <button
                key={action}
                onClick={() => targetConnection && navigateToNode(targetConnection.targetNodeId)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Continue{targetNode ? ` to ${targetNode.properties.title || targetNode.type}` : ''}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDecisionNode = () => {
    if (!currentNode || currentNode.type !== 'decision') return null;
    
    const props = currentNode.properties as any;
    
    return (
      <div className="bg-purple-50 p-6 rounded-lg">
        <h3 className="text-xl font-bold text-purple-900 mb-4">{props.title}</h3>
        <div className="text-gray-700 mb-4" dangerouslySetInnerHTML={{ __html: props.content?.text || '' }} />
        
        <div className="space-y-2">
          {(props.decisions || []).map((decision: any, index: number) => {
            const connection = connections.find(c => 
              c.sourceNodeId === currentNode.id && c.sourcePort === decision.id
            );
            
            return (
              <button
                key={index}
                onClick={() => {
                  executeAction('choice', { optionId: decision.id });
                  if (connection) {
                    navigateToNode(connection.targetNodeId);
                  }
                }}
                className="w-full text-left p-3 bg-white border border-purple-300 rounded hover:bg-purple-100"
              >
                {decision.description}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderChallengeNode = () => {
    if (!currentNode || currentNode.type !== 'challenge') return null;
    
    const props = currentNode.properties as any;
    const lastAction = gameState.actionHistory
      .filter(a => a.nodeId === currentNode.id && a.actionType === 'challenge')
      .sort((a, b) => b.timestamp - a.timestamp)[0];
    
    if (lastAction?.result) {
      // Show result
      return (
        <div className="bg-yellow-50 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-yellow-900 mb-4">{props.title}</h3>
          <div className="text-gray-700 mb-4" dangerouslySetInnerHTML={{ __html: props.content?.text || '' }} />
          
          <div className={`p-4 rounded mb-4 ${lastAction.result.success ? 'bg-green-100' : 'bg-red-100'}`}>
            <h4 className="font-semibold mb-2">
              {lastAction.result.success ? 'Success!' : 'Failure!'}
            </h4>
            {lastAction.result.consequences.map(c => (
              <p key={c.id} className="text-sm">{c.description}</p>
            ))}
          </div>

          <div className="flex gap-2">
            {availableActions.map(action => {
              const targetConnection = connections.find(c => 
                c.sourceNodeId === currentNode.id && c.sourcePort === action
              );
              
              return (
                <button
                  key={action}
                  onClick={() => targetConnection && navigateToNode(targetConnection.targetNodeId)}
                  className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  Continue ({action})
                </button>
              );
            })}
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-yellow-50 p-6 rounded-lg">
        <h3 className="text-xl font-bold text-yellow-900 mb-4">{props.title}</h3>
        <div className="text-gray-700 mb-4" dangerouslySetInnerHTML={{ __html: props.content?.text || '' }} />
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            This is a <strong>{props.stat}</strong> challenge.
          </p>
          <p className="text-sm text-gray-600">
            Choose a character to attempt this challenge:
          </p>
        </div>

        <div className="space-y-2">
          {gameState.party.map(character => (
            <button
              key={character.id}
              onClick={() => executeAction('challenge', { characterId: character.id })}
              className="w-full text-left p-3 bg-white border border-yellow-300 rounded hover:bg-yellow-100"
            >
              <div className="flex justify-between">
                <span>{character.name}</span>
                <span className="text-sm text-gray-500">
                  {props.stat}: {character.stats[props.stat?.toLowerCase() as keyof typeof character.stats] || 0}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderCurrentNode = () => {
    if (!currentNode) {
      return (
        <div className="text-center text-gray-500">
          Adventure node not found.
        </div>
      );
    }

    switch (currentNode.type) {
      case 'story':
        return renderStoryNode();
      case 'decision':
        return renderDecisionNode();
      case 'challenge':
        return renderChallengeNode();
      default:
        return (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">{currentNode.properties.title}</h3>
            <p className="text-gray-600">
              Node type "{currentNode.type}" not yet implemented in player.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Game State Debug Info */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h4 className="font-semibold mb-2">Game State</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Current Node:</strong> {currentNode?.properties.title || gameState.currentNodeId}
          </div>
          <div>
            <strong>Visited Nodes:</strong> {gameState.visitedNodes.length}
          </div>
          <div>
            <strong>Variables:</strong> {Object.keys(gameState.variables).length}
          </div>
          <div>
            <strong>Inventory Items:</strong> {gameState.inventory.length}
          </div>
        </div>
        
        {/* Party Status */}
        <div className="mt-4">
          <strong>Party:</strong>
          <div className="ml-4 text-xs">
            {gameState.party.map(member => (
              <div key={member.id} className="flex gap-4">
                <span>{member.name}</span>
                <span>STR:{member.stats.strength} DEX:{member.stats.dexterity} INT:{member.stats.intelligence} CHA:{member.stats.charisma}</span>
                <span>HP:{member.currentHP}/{member.maxHP}</span>
                <span>XP:{member.experience} Lvl:{member.level}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Current Node */}
      {renderCurrentNode()}
    </div>
  );
};