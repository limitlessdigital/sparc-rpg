"use client";

/**
 * Node Property Editor Component
 * Based on PRD 09: Node System
 * 
 * Edits properties of selected nodes based on their type.
 */

import { cn } from '../lib/utils';
import { Input, Textarea } from '../Input';
import { Select, SelectOption } from '../Select';
import { Button } from '../Button';
import type {
  AdventureNode,
  StoryNode,
  DecisionNode,
  ChallengeNode,
  CombatNode,
  CheckNode,
  Attribute,
  DecisionChoice,
  CombatEnemy,
} from './types';
import { NODE_CONFIGS, generateId } from './node-config';

export interface NodeEditorProps {
  node: AdventureNode;
  onUpdate: (updates: Partial<AdventureNode>) => void;
  onDelete?: () => void;
  onSetAsStart?: () => void;
  isStartNode: boolean;
  className?: string;
}

export function NodeEditor({
  node,
  onUpdate,
  onDelete,
  onSetAsStart,
  isStartNode,
  className,
}: NodeEditorProps) {
  const config = NODE_CONFIGS[node.type];
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Node Type Header */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-elevated">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
          style={{ backgroundColor: config.color + '30' }}
        >
          {config.icon}
        </div>
        <div>
          <p className="font-semibold">{config.label} Node</p>
          <p className="text-xs text-muted-foreground">ID: {node.id.slice(0, 8)}...</p>
        </div>
      </div>
      
      {/* Common Properties */}
      <div className="space-y-3">
        <Input
          label="Title"
          value={node.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Enter node title..."
        />
        
        <Textarea
          label="Content"
          value={node.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          placeholder="Enter content displayed to players..."
          className="min-h-[100px]"
        />
      </div>
      
      {/* Type-Specific Properties */}
      {node.type === 'story' && (
        <StoryNodeEditor node={node as StoryNode} onUpdate={onUpdate} />
      )}
      
      {node.type === 'decision' && (
        <DecisionNodeEditor node={node as DecisionNode} onUpdate={onUpdate} />
      )}
      
      {node.type === 'challenge' && (
        <ChallengeNodeEditor node={node as ChallengeNode} onUpdate={onUpdate} />
      )}
      
      {node.type === 'combat' && (
        <CombatNodeEditor node={node as CombatNode} onUpdate={onUpdate} />
      )}
      
      {node.type === 'check' && (
        <CheckNodeEditor node={node as CheckNode} onUpdate={onUpdate} />
      )}
      
      {/* End Node Toggles */}
      <div className="space-y-2 pt-4 border-t border-surface-divider">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={node.isVictoryNode}
            onChange={(e) => onUpdate({ 
              isVictoryNode: e.target.checked,
              isFailureNode: e.target.checked ? false : node.isFailureNode,
            })}
            className="w-4 h-4 rounded accent-success"
          />
          <span className="text-sm">🏆 Victory Node</span>
        </label>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={node.isFailureNode}
            onChange={(e) => onUpdate({ 
              isFailureNode: e.target.checked,
              isVictoryNode: e.target.checked ? false : node.isVictoryNode,
            })}
            className="w-4 h-4 rounded accent-error"
          />
          <span className="text-sm">💀 Failure Node</span>
        </label>
      </div>
      
      {/* Rewards */}
      <div className="space-y-2 pt-4 border-t border-surface-divider">
        <h4 className="text-sm font-semibold">Rewards</h4>
        <Input
          label="XP Reward"
          type="number"
          min={0}
          value={node.experienceReward}
          onChange={(e) => onUpdate({ experienceReward: parseInt(e.target.value) || 0 })}
        />
      </div>
      
      {/* Actions */}
      <div className="flex flex-col gap-2 pt-4 border-t border-surface-divider">
        {!isStartNode && onSetAsStart && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onSetAsStart}
            className="w-full"
          >
            ⭐ Set as Start Node
          </Button>
        )}
        
        {isStartNode && (
          <div className="px-3 py-2 bg-bronze/20 rounded text-sm text-center">
            This is the start node
          </div>
        )}
        
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="w-full text-error hover:bg-error/10"
          >
            🗑️ Delete Node
          </Button>
        )}
      </div>
    </div>
  );
}

// Story Node Editor
function StoryNodeEditor({ 
  node, 
  onUpdate 
}: { 
  node: StoryNode; 
  onUpdate: (updates: Partial<AdventureNode>) => void;
}) {
  const updateData = (dataUpdates: Partial<StoryNode['data']>) => {
    onUpdate({ data: { ...node.data, ...dataUpdates } } as Partial<AdventureNode>);
  };
  
  return (
    <div className="space-y-3 pt-4 border-t border-surface-divider">
      <h4 className="text-sm font-semibold">Story Options</h4>
      
      <Textarea
        label="Read-Aloud Text (Optional)"
        value={node.data.readAloudText || ''}
        onChange={(e) => updateData({ readAloudText: e.target.value })}
        placeholder="Text for Seer to read aloud..."
        className="min-h-[80px]"
      />
      
      <Textarea
        label="Seer Notes (Private)"
        value={node.data.seerNotes || ''}
        onChange={(e) => updateData({ seerNotes: e.target.value })}
        placeholder="Private notes only Seer can see..."
        className="min-h-[60px]"
      />
      
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={node.data.autoAdvance || false}
          onChange={(e) => updateData({ autoAdvance: e.target.checked })}
          className="w-4 h-4 rounded"
        />
        <span className="text-sm">Auto-advance after delay</span>
      </label>
      
      {node.data.autoAdvance && (
        <Input
          label="Delay (seconds)"
          type="number"
          min={1}
          value={node.data.autoAdvanceDelay || 5}
          onChange={(e) => updateData({ autoAdvanceDelay: parseInt(e.target.value) || 5 })}
        />
      )}
    </div>
  );
}

// Decision Node Editor
function DecisionNodeEditor({ 
  node, 
  onUpdate 
}: { 
  node: DecisionNode; 
  onUpdate: (updates: Partial<AdventureNode>) => void;
}) {
  const updateData = (dataUpdates: Partial<DecisionNode['data']>) => {
    onUpdate({ data: { ...node.data, ...dataUpdates } } as Partial<AdventureNode>);
  };
  
  const addChoice = () => {
    const newChoice: DecisionChoice = {
      id: generateId(),
      text: `Choice ${node.data.choices.length + 1}`,
    };
    updateData({ choices: [...node.data.choices, newChoice] });
  };
  
  const updateChoice = (index: number, text: string) => {
    const newChoices = [...node.data.choices];
    newChoices[index] = { ...newChoices[index], text };
    updateData({ choices: newChoices });
  };
  
  const removeChoice = (index: number) => {
    const newChoices = node.data.choices.filter((_, i) => i !== index);
    updateData({ choices: newChoices });
  };
  
  return (
    <div className="space-y-3 pt-4 border-t border-surface-divider">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Choices</h4>
        <Button variant="ghost" size="sm" onClick={addChoice}>
          + Add
        </Button>
      </div>
      
      <div className="space-y-2">
        {node.data.choices.map((choice, index) => (
          <div key={choice.id} className="flex gap-2">
            <Input
              value={choice.text}
              onChange={(e) => updateChoice(index, e.target.value)}
              placeholder={`Choice ${index + 1}`}
              className="flex-1"
            />
            {node.data.choices.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeChoice(index)}
                className="text-error px-2"
              >
                ✕
              </Button>
            )}
          </div>
        ))}
      </div>
      
      <Input
        label="Time Limit (seconds, 0 = none)"
        type="number"
        min={0}
        value={node.data.timeLimit || 0}
        onChange={(e) => updateData({ timeLimit: parseInt(e.target.value) || undefined })}
      />
    </div>
  );
}

// Challenge Node Editor
function ChallengeNodeEditor({ 
  node, 
  onUpdate 
}: { 
  node: ChallengeNode; 
  onUpdate: (updates: Partial<AdventureNode>) => void;
}) {
  const updateData = (dataUpdates: Partial<ChallengeNode['data']>) => {
    onUpdate({ data: { ...node.data, ...dataUpdates } } as Partial<AdventureNode>);
  };
  
  const attributes: Attribute[] = ['might', 'grace', 'wit', 'heart'];
  
  return (
    <div className="space-y-3 pt-4 border-t border-surface-divider">
      <h4 className="text-sm font-semibold">Challenge Settings</h4>
      
      <Select
        label="Attribute"
        value={node.data.attribute}
        onChange={(value) => updateData({ attribute: value as Attribute })}
      >
        {attributes.map(attr => (
          <SelectOption key={attr} value={attr}>
            {attr.charAt(0).toUpperCase() + attr.slice(1)}
          </SelectOption>
        ))}
      </Select>
      
      <Input
        label="Difficulty (3-18)"
        type="number"
        min={3}
        max={18}
        value={node.data.difficulty}
        onChange={(e) => updateData({ difficulty: parseInt(e.target.value) || 10 })}
      />
      
      <Textarea
        label="Challenge Description"
        value={node.data.description}
        onChange={(e) => updateData({ description: e.target.value })}
        placeholder="Describe the challenge..."
      />
      
      <Textarea
        label="Success Text"
        value={node.data.successText}
        onChange={(e) => updateData({ successText: e.target.value })}
        placeholder="Text shown on success..."
      />
      
      <Textarea
        label="Failure Text"
        value={node.data.failureText}
        onChange={(e) => updateData({ failureText: e.target.value })}
        placeholder="Text shown on failure..."
      />
      
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={node.data.allowRetry}
          onChange={(e) => updateData({ allowRetry: e.target.checked })}
          className="w-4 h-4 rounded"
        />
        <span className="text-sm">Allow Retry</span>
      </label>
      
      {node.data.allowRetry && (
        <Input
          label="Retry Penalty (+difficulty)"
          type="number"
          min={0}
          value={node.data.retryPenalty || 0}
          onChange={(e) => updateData({ retryPenalty: parseInt(e.target.value) || 0 })}
        />
      )}
    </div>
  );
}

// Combat Node Editor
function CombatNodeEditor({ 
  node, 
  onUpdate 
}: { 
  node: CombatNode; 
  onUpdate: (updates: Partial<AdventureNode>) => void;
}) {
  const updateData = (dataUpdates: Partial<CombatNode['data']>) => {
    onUpdate({ data: { ...node.data, ...dataUpdates } } as Partial<AdventureNode>);
  };
  
  const addEnemy = () => {
    const newEnemy: CombatEnemy = {
      creatureId: '',
      count: 1,
      customName: `Enemy ${node.data.enemies.length + 1}`,
    };
    updateData({ enemies: [...node.data.enemies, newEnemy] });
  };
  
  const updateEnemy = (index: number, updates: Partial<CombatEnemy>) => {
    const newEnemies = [...node.data.enemies];
    newEnemies[index] = { ...newEnemies[index], ...updates };
    updateData({ enemies: newEnemies });
  };
  
  const removeEnemy = (index: number) => {
    const newEnemies = node.data.enemies.filter((_, i) => i !== index);
    updateData({ enemies: newEnemies });
  };
  
  return (
    <div className="space-y-3 pt-4 border-t border-surface-divider">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Enemies</h4>
        <Button variant="ghost" size="sm" onClick={addEnemy}>
          + Add
        </Button>
      </div>
      
      <div className="space-y-2">
        {node.data.enemies.map((enemy, index) => (
          <div key={index} className="p-2 bg-surface-elevated rounded space-y-2">
            <div className="flex gap-2">
              <Input
                value={enemy.customName || ''}
                onChange={(e) => updateEnemy(index, { customName: e.target.value })}
                placeholder="Enemy name"
                className="flex-1"
              />
              <Input
                type="number"
                min={1}
                value={typeof enemy.count === 'number' ? enemy.count : 1}
                onChange={(e) => updateEnemy(index, { count: parseInt(e.target.value) || 1 })}
                className="w-16"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeEnemy(index)}
                className="text-error px-2"
              >
                ✕
              </Button>
            </div>
          </div>
        ))}
        
        {node.data.enemies.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No enemies added yet
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={node.data.ambush}
            onChange={(e) => updateData({ ambush: e.target.checked })}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm">Ambush (enemies surprise)</span>
        </label>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={node.data.canFlee}
            onChange={(e) => updateData({ canFlee: e.target.checked })}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm">Can Flee</span>
        </label>
      </div>
      
      {node.data.canFlee && (
        <Input
          label="Flee Difficulty"
          type="number"
          min={3}
          max={18}
          value={node.data.fleeDifficulty || 10}
          onChange={(e) => updateData({ fleeDifficulty: parseInt(e.target.value) || 10 })}
        />
      )}
      
      <Textarea
        label="Victory Text"
        value={node.data.victoryText}
        onChange={(e) => updateData({ victoryText: e.target.value })}
        placeholder="Text shown on victory..."
      />
      
      <Textarea
        label="Defeat Text"
        value={node.data.defeatText}
        onChange={(e) => updateData({ defeatText: e.target.value })}
        placeholder="Text shown on defeat..."
      />
    </div>
  );
}

// Check Node Editor
function CheckNodeEditor({ 
  node, 
  onUpdate 
}: { 
  node: CheckNode; 
  onUpdate: (updates: Partial<AdventureNode>) => void;
}) {
  const updateData = (dataUpdates: Partial<CheckNode['data']>) => {
    onUpdate({ data: { ...node.data, ...dataUpdates } } as Partial<AdventureNode>);
  };
  
  return (
    <div className="space-y-3 pt-4 border-t border-surface-divider">
      <h4 className="text-sm font-semibold">Check Settings</h4>
      
      <Select
        label="Check Type"
        value={node.data.checkType}
        onChange={(value) => updateData({ checkType: value as CheckNode['data']['checkType'] })}
      >
        <SelectOption value="flag">Flag Check</SelectOption>
        <SelectOption value="item">Item Check</SelectOption>
        <SelectOption value="variable">Variable Check</SelectOption>
        <SelectOption value="random">Random Chance</SelectOption>
      </Select>
      
      {node.data.checkType === 'flag' && (
        <Input
          label="Flag Name"
          value={node.data.flag || ''}
          onChange={(e) => updateData({ flag: e.target.value })}
          placeholder="e.g., has_key, visited_cave"
        />
      )}
      
      {node.data.checkType === 'item' && (
        <Input
          label="Item Name"
          value={node.data.item || ''}
          onChange={(e) => updateData({ item: e.target.value })}
          placeholder="e.g., magic_sword, gold_key"
        />
      )}
      
      {node.data.checkType === 'variable' && (
        <div className="space-y-2">
          <Input
            label="Variable Name"
            value={node.data.variable?.name || ''}
            onChange={(e) => updateData({ 
              variable: { 
                ...node.data.variable, 
                name: e.target.value,
                operator: node.data.variable?.operator || '>=',
                value: node.data.variable?.value || 0,
              } 
            })}
            placeholder="e.g., gold, reputation"
          />
          <div className="flex gap-2">
            <Select
              label="Operator"
              value={node.data.variable?.operator || '>='}
              onChange={(value) => updateData({ 
                variable: { 
                  ...node.data.variable!,
                  operator: value as '==' | '!=' | '>' | '<' | '>=' | '<=',
                } 
              })}
              className="w-24"
            >
              <SelectOption value="==">=</SelectOption>
              <SelectOption value="!=">≠</SelectOption>
              <SelectOption value=">">&gt;</SelectOption>
              <SelectOption value="<">&lt;</SelectOption>
              <SelectOption value=">=">&ge;</SelectOption>
              <SelectOption value="<=">&le;</SelectOption>
            </Select>
            <Input
              label="Value"
              type="number"
              value={node.data.variable?.value || 0}
              onChange={(e) => updateData({ 
                variable: { 
                  ...node.data.variable!,
                  value: parseInt(e.target.value) || 0,
                } 
              })}
              className="flex-1"
            />
          </div>
        </div>
      )}
      
      {node.data.checkType === 'random' && (
        <Input
          label="Success Chance (%)"
          type="number"
          min={0}
          max={100}
          value={node.data.randomChance || 50}
          onChange={(e) => updateData({ randomChance: parseInt(e.target.value) || 50 })}
        />
      )}
      
      <Textarea
        label="Success Text"
        value={node.data.successText}
        onChange={(e) => updateData({ successText: e.target.value })}
        placeholder="Text shown when check passes..."
      />
      
      <Textarea
        label="Failure Text"
        value={node.data.failureText}
        onChange={(e) => updateData({ failureText: e.target.value })}
        placeholder="Text shown when check fails..."
      />
    </div>
  );
}

export default NodeEditor;
