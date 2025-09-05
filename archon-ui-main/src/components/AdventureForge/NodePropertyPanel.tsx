import React, { useState, useCallback } from 'react';
import { AdventureNode, NodeType, StoryProperties, DecisionProperties, ChallengeProperties, CombatProperties, CheckProperties, StateChange, ConditionalExpression } from './types';
import { ConditionalBuilder, StateChangeBuilder } from './ConditionalBuilder';

interface NodePropertyPanelProps {
  node: AdventureNode | null;
  onUpdateNode: (nodeId: string, updates: Partial<AdventureNode>) => void;
  onClose: () => void;
}

export const NodePropertyPanel: React.FC<NodePropertyPanelProps> = ({
  node,
  onUpdateNode,
  onClose
}) => {
  const [localProperties, setLocalProperties] = useState(node?.properties || {});
  const [hasChanges, setHasChanges] = useState(false);

  const updateProperty = useCallback((path: string, value: any) => {
    const keys = path.split('.');
    const updated = { ...localProperties };
    let current: any = updated;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setLocalProperties(updated);
    setHasChanges(true);
  }, [localProperties]);

  const saveChanges = useCallback(() => {
    if (node && hasChanges) {
      onUpdateNode(node.id, { 
        properties: localProperties,
        validationState: validateNode(node.type, localProperties) ? 'valid' : 'error'
      });
      setHasChanges(false);
    }
  }, [node, hasChanges, localProperties, onUpdateNode]);

  const handleClose = useCallback(() => {
    if (hasChanges) {
      saveChanges();
    }
    onClose();
  }, [hasChanges, saveChanges, onClose]);

  if (!node) {
    return null;
  }

  const renderNodeTypePanel = () => {
    switch (node.type) {
      case 'story':
        return <StoryNodePanel properties={localProperties as StoryProperties} updateProperty={updateProperty} />;
      case 'decision':
        return <DecisionNodePanel properties={localProperties as DecisionProperties} updateProperty={updateProperty} />;
      case 'challenge':
        return <ChallengeNodePanel properties={localProperties as ChallengeProperties} updateProperty={updateProperty} />;
      case 'combat':
        return <CombatNodePanel properties={localProperties as CombatProperties} updateProperty={updateProperty} />;
      case 'check':
        return <CheckNodePanel properties={localProperties as CheckProperties} updateProperty={updateProperty} />;
      default:
        return <div>Unknown node type: {node.type}</div>;
    }
  };

  const nodeTypeColors = {
    story: 'bg-blue-500',
    decision: 'bg-purple-500',
    challenge: 'bg-yellow-500',
    combat: 'bg-red-500',
    check: 'bg-green-500'
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 w-96 bg-white border-l border-gray-300 shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full ${nodeTypeColors[node.type]} mr-2`} />
            <h3 className="text-lg font-semibold capitalize">{node.type} Node</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        <div className="text-sm text-gray-500">
          ID: {node.id}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderNodeTypePanel()}
      </div>

      {/* Footer */}
      {hasChanges && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setLocalProperties(node.properties);
                setHasChanges(false);
              }}
              className="px-3 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={saveChanges}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Story Node Panel Component
interface StoryNodePanelProps {
  properties: StoryProperties;
  updateProperty: (path: string, value: any) => void;
}

const StoryNodePanel: React.FC<StoryNodePanelProps> = ({ properties, updateProperty }) => {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title *
        </label>
        <input
          type="text"
          value={properties.title || ''}
          onChange={(e) => updateProperty('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter story title..."
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Story Content *
        </label>
        <RichTextEditor
          value={properties.content?.text || ''}
          onChange={(text) => updateProperty('content.text', text)}
          placeholder="Write your story content here..."
        />
      </div>

      {/* Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image (Optional)
        </label>
        <input
          type="text"
          value={properties.image?.url || ''}
          onChange={(e) => updateProperty('image.url', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
          placeholder="Enter image URL..."
        />
        <label className="flex items-center text-sm text-gray-600">
          <input
            type="checkbox"
            checked={properties.image?.hideFromPlayers || false}
            onChange={(e) => updateProperty('image.hideFromPlayers', e.target.checked)}
            className="mr-2"
          />
          Hide from players (GM only)
        </label>
      </div>

      {/* Experience Points */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Experience Points
        </label>
        <input
          type="number"
          value={properties.experiencePoints || 0}
          onChange={(e) => updateProperty('experiencePoints', parseInt(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="0"
        />
      </div>

      {/* End Conditions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          End Conditions
        </label>
        <div className="space-y-2">
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={properties.endConditions?.victory || false}
              onChange={(e) => updateProperty('endConditions.victory', e.target.checked)}
              className="mr-2"
            />
            Victory condition (ends adventure successfully)
          </label>
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={properties.endConditions?.failure || false}
              onChange={(e) => updateProperty('endConditions.failure', e.target.checked)}
              className="mr-2"
            />
            Failure condition (ends adventure unsuccessfully)
          </label>
        </div>
      </div>

      {/* Objectives */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Objectives (Optional)
        </label>
        <ListEditor
          items={properties.objectives || []}
          onChange={(objectives) => updateProperty('objectives', objectives)}
          placeholder="Add objective..."
        />
      </div>

      {/* State Effects */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          State Effects (Advanced)
        </label>
        <StateChangeBuilder
          changes={(properties as any).effects || []}
          onChange={(effects) => updateProperty('effects', effects)}
          className="mb-4"
        />
      </div>

      {/* Entry Conditions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Entry Conditions (Advanced)
        </label>
        <div className="text-sm text-gray-600 mb-2">
          Define conditions that must be met for players to access this story node.
        </div>
        <ConditionalBuilder
          condition={(properties as any).entryCondition || { type: 'simple', variable: '', comparison: '==', value: '' }}
          onChange={(condition) => updateProperty('entryCondition', condition)}
        />
      </div>
    </div>
  );
};

// Decision Node Panel Component
const DecisionNodePanel: React.FC<{
  properties: DecisionProperties;
  updateProperty: (path: string, value: any) => void;
}> = ({ properties, updateProperty }) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title *
        </label>
        <input
          type="text"
          value={properties.title || ''}
          onChange={(e) => updateProperty('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Enter decision title..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Objective *
        </label>
        <input
          type="text"
          value={properties.objective || ''}
          onChange={(e) => updateProperty('objective', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="What must the player decide?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <RichTextEditor
          value={properties.content?.text || ''}
          onChange={(text) => updateProperty('content.text', text)}
          placeholder="Describe the situation requiring a decision..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Decision Options *
        </label>
        <DecisionOptionsEditor
          decisions={properties.decisions || []}
          onChange={(decisions) => updateProperty('decisions', decisions)}
        />
      </div>

      {/* Entry Conditions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Entry Conditions (Advanced)
        </label>
        <div className="text-sm text-gray-600 mb-2">
          Conditions that must be met to access this decision point.
        </div>
        <ConditionalBuilder
          condition={(properties as any).entryCondition || { type: 'simple', variable: '', comparison: '==', value: '' }}
          onChange={(condition) => updateProperty('entryCondition', condition)}
        />
      </div>
    </div>
  );
};

// Challenge Node Panel Component
const ChallengeNodePanel: React.FC<{
  properties: ChallengeProperties;
  updateProperty: (path: string, value: any) => void;
}> = ({ properties, updateProperty }) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title *
        </label>
        <input
          type="text"
          value={properties.title || ''}
          onChange={(e) => updateProperty('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          placeholder="Enter challenge title..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Stat to Test *
        </label>
        <select
          value={properties.stat || 'STR'}
          onChange={(e) => updateProperty('stat', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          <option value="STR">Strength (STR)</option>
          <option value="DEX">Dexterity (DEX)</option>
          <option value="INT">Intelligence (INT)</option>
          <option value="CHA">Charisma (CHA)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <RichTextEditor
          value={properties.content?.text || ''}
          onChange={(text) => updateProperty('content.text', text)}
          placeholder="Describe the challenge..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Challenge Outcomes *
        </label>
        <ChallengeOutcomesEditor
          outcomes={properties.outcomes || []}
          onChange={(outcomes) => updateProperty('outcomes', outcomes)}
        />
      </div>

      {/* Success Rewards */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Success Effects (Advanced)
        </label>
        <div className="text-sm text-gray-600 mb-2">
          State changes and rewards when the challenge succeeds.
        </div>
        <StateChangeBuilder
          changes={(properties as any).successEffects || []}
          onChange={(effects) => updateProperty('successEffects', effects)}
        />
      </div>

      {/* Failure Penalties */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Failure Effects (Advanced)
        </label>
        <div className="text-sm text-gray-600 mb-2">
          State changes and penalties when the challenge fails.
        </div>
        <StateChangeBuilder
          changes={(properties as any).failureEffects || []}
          onChange={(effects) => updateProperty('failureEffects', effects)}
        />
      </div>
    </div>
  );
};

// Combat Node Panel Component
const CombatNodePanel: React.FC<{
  properties: CombatProperties;
  updateProperty: (path: string, value: any) => void;
}> = ({ properties, updateProperty }) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title *
        </label>
        <input
          type="text"
          value={properties.title || ''}
          onChange={(e) => updateProperty('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Enter combat encounter title..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <RichTextEditor
          value={properties.content?.text || ''}
          onChange={(text) => updateProperty('content.text', text)}
          placeholder="Describe the combat encounter..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Creatures *
        </label>
        <CreatureEditor
          creatures={properties.creatures || []}
          onChange={(creatures) => updateProperty('creatures', creatures)}
        />
      </div>
    </div>
  );
};

// Check Node Panel Component
const CheckNodePanel: React.FC<{
  properties: CheckProperties;
  updateProperty: (path: string, value: any) => void;
}> = ({ properties, updateProperty }) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title *
        </label>
        <input
          type="text"
          value={properties.title || ''}
          onChange={(e) => updateProperty('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter check title..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <RichTextEditor
          value={properties.content?.text || ''}
          onChange={(text) => updateProperty('content.text', text)}
          placeholder="Describe what needs to be checked..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Success Outcome
        </label>
        <textarea
          value={properties.outcomes?.success?.description || ''}
          onChange={(e) => updateProperty('outcomes.success.description', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          rows={3}
          placeholder="What happens on success..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Failure Outcome
        </label>
        <textarea
          value={properties.outcomes?.failure?.description || ''}
          onChange={(e) => updateProperty('outcomes.failure.description', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          rows={3}
          placeholder="What happens on failure..."
        />
      </div>
    </div>
  );
};

// Rich Text Editor Component (Simple implementation)
interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  return (
    <div className="border border-gray-300 rounded-md">
      <div className="border-b border-gray-200 p-2 bg-gray-50">
        <div className="flex space-x-2">
          <button className="px-2 py-1 text-sm border rounded hover:bg-gray-100" title="Bold">
            B
          </button>
          <button className="px-2 py-1 text-sm border rounded hover:bg-gray-100 italic" title="Italic">
            I
          </button>
          <button className="px-2 py-1 text-sm border rounded hover:bg-gray-100 underline" title="Underline">
            U
          </button>
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border-0 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={6}
        placeholder={placeholder}
      />
    </div>
  );
};

// List Editor Component
interface ListEditorProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}

const ListEditor: React.FC<ListEditorProps> = ({ items, onChange, placeholder }) => {
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    if (newItem.trim()) {
      onChange([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <span className="flex-1 px-2 py-1 bg-gray-100 rounded">{item}</span>
          <button
            onClick={() => removeItem(index)}
            className="text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      ))}
      <div className="flex space-x-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addItem()}
          className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={placeholder}
        />
        <button
          onClick={addItem}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add
        </button>
      </div>
    </div>
  );
};

// Decision Options Editor (simplified)
const DecisionOptionsEditor: React.FC<{
  decisions: any[];
  onChange: (decisions: any[]) => void;
}> = ({ decisions, onChange }) => {
  const addDecision = () => {
    onChange([...decisions, { id: `decision-${Date.now()}`, description: '', targetConnection: { type: 'new' } }]);
  };

  const updateDecision = (index: number, field: string, value: any) => {
    const updated = [...decisions];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeDecision = (index: number) => {
    onChange(decisions.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {decisions.map((decision, index) => (
        <div key={decision.id || index} className="p-3 border border-gray-200 rounded">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium">Option {index + 1}</span>
            <button
              onClick={() => removeDecision(index)}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
          <textarea
            value={decision.description || ''}
            onChange={(e) => updateDecision(index, 'description', e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={2}
            placeholder="Enter decision option text..."
          />
        </div>
      ))}
      <button
        onClick={addDecision}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-purple-500 hover:text-purple-500"
      >
        + Add Decision Option
      </button>
    </div>
  );
};

// Challenge Outcomes Editor (simplified)
const ChallengeOutcomesEditor: React.FC<{
  outcomes: any[];
  onChange: (outcomes: any[]) => void;
}> = ({ outcomes, onChange }) => {
  const addOutcome = () => {
    onChange([...outcomes, { 
      type: 'simple', 
      rollRange: { min: 1, max: 6 }, 
      description: '', 
      targetConnection: { type: 'new' } 
    }]);
  };

  return (
    <div className="space-y-3">
      {outcomes.map((outcome, index) => (
        <div key={index} className="p-3 border border-gray-200 rounded">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input
              type="number"
              value={outcome.rollRange?.min || 1}
              onChange={(e) => {
                const updated = [...outcomes];
                updated[index].rollRange.min = parseInt(e.target.value) || 1;
                onChange(updated);
              }}
              className="px-2 py-1 border border-gray-300 rounded"
              placeholder="Min roll"
            />
            <input
              type="number"
              value={outcome.rollRange?.max || 6}
              onChange={(e) => {
                const updated = [...outcomes];
                updated[index].rollRange.max = parseInt(e.target.value) || 6;
                onChange(updated);
              }}
              className="px-2 py-1 border border-gray-300 rounded"
              placeholder="Max roll"
            />
          </div>
          <textarea
            value={outcome.description || ''}
            onChange={(e) => {
              const updated = [...outcomes];
              updated[index].description = e.target.value;
              onChange(updated);
            }}
            className="w-full px-2 py-1 border border-gray-300 rounded"
            rows={2}
            placeholder="Outcome description..."
          />
        </div>
      ))}
      <button
        onClick={addOutcome}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-yellow-500 hover:text-yellow-500"
      >
        + Add Outcome
      </button>
    </div>
  );
};

// Creature Editor (simplified)
const CreatureEditor: React.FC<{
  creatures: any[];
  onChange: (creatures: any[]) => void;
}> = ({ creatures, onChange }) => {
  const addCreature = () => {
    onChange([...creatures, { 
      creatureId: '', 
      quantity: { type: 'static', value: 1 } 
    }]);
  };

  return (
    <div className="space-y-3">
      {creatures.map((creature, index) => (
        <div key={index} className="p-3 border border-gray-200 rounded">
          <input
            type="text"
            value={creature.creatureId || ''}
            onChange={(e) => {
              const updated = [...creatures];
              updated[index].creatureId = e.target.value;
              onChange(updated);
            }}
            className="w-full px-2 py-1 border border-gray-300 rounded mb-2"
            placeholder="Creature name/ID..."
          />
          <input
            type="number"
            value={creature.quantity?.value || 1}
            onChange={(e) => {
              const updated = [...creatures];
              updated[index].quantity.value = parseInt(e.target.value) || 1;
              onChange(updated);
            }}
            className="w-full px-2 py-1 border border-gray-300 rounded"
            placeholder="Quantity..."
            min="1"
          />
        </div>
      ))}
      <button
        onClick={addCreature}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-red-500 hover:text-red-500"
      >
        + Add Creature
      </button>
    </div>
  );
};

// Validation function
function validateNode(type: NodeType, properties: any): boolean {
  const hasTitle = properties.title && properties.title.trim().length > 0;
  const hasContent = properties.content?.text && properties.content.text.trim().length > 0;
  
  switch (type) {
    case 'story':
      return hasTitle && hasContent;
    case 'decision':
      return hasTitle && hasContent && properties.decisions?.length > 0;
    case 'challenge':
      return hasTitle && hasContent && properties.stat && properties.outcomes?.length > 0;
    case 'combat':
      return hasTitle && hasContent && properties.creatures?.length > 0;
    case 'check':
      return hasTitle && hasContent;
    default:
      return false;
  }
}