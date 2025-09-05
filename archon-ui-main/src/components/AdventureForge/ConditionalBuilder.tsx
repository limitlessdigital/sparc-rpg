import React, { useState, useCallback } from 'react';
import { ConditionalExpression, StateChange } from './types';
import { Plus, Minus, ChevronDown, ChevronRight } from 'lucide-react';

interface ConditionalBuilderProps {
  condition: ConditionalExpression;
  onChange: (condition: ConditionalExpression) => void;
  className?: string;
}

export const ConditionalBuilder: React.FC<ConditionalBuilderProps> = ({
  condition,
  onChange,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateCondition = useCallback((updates: Partial<ConditionalExpression>) => {
    onChange({ ...condition, ...updates });
  }, [condition, onChange]);

  const addCondition = useCallback(() => {
    const newConditions = [...(condition.conditions || []), {
      type: 'simple' as const,
      variable: '',
      comparison: '==' as const,
      value: ''
    }];
    updateCondition({ conditions: newConditions });
  }, [condition.conditions, updateCondition]);

  const removeCondition = useCallback((index: number) => {
    const newConditions = condition.conditions?.filter((_, i) => i !== index) || [];
    updateCondition({ conditions: newConditions });
  }, [condition.conditions, updateCondition]);

  const updateSubCondition = useCallback((index: number, subCondition: ConditionalExpression) => {
    const newConditions = [...(condition.conditions || [])];
    newConditions[index] = subCondition;
    updateCondition({ conditions: newConditions });
  }, [condition.conditions, updateCondition]);

  if (condition.type === 'simple') {
    return (
      <div className={`border border-gray-300 rounded-lg p-4 bg-gray-50 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Variable</label>
            <input
              type="text"
              value={condition.variable || ''}
              onChange={(e) => updateCondition({ variable: e.target.value })}
              placeholder="e.g., variables.gold or party[0].stats.strength"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comparison</label>
            <select
              value={condition.comparison || '=='}
              onChange={(e) => updateCondition({ comparison: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="==">=</option>
              <option value="!=">≠</option>
              <option value=">">&gt;</option>
              <option value="<">&lt;</option>
              <option value=">=">&gt;=</option>
              <option value="<=">&lt;=</option>
              <option value="contains">contains</option>
              <option value="exists">exists</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
            <input
              type="text"
              value={condition.value || ''}
              onChange={(e) => {
                // Try to parse as number if possible
                let value: any = e.target.value;
                if (!isNaN(Number(value)) && value !== '') {
                  value = Number(value);
                } else if (value === 'true') {
                  value = true;
                } else if (value === 'false') {
                  value = false;
                }
                updateCondition({ value });
              }}
              placeholder="Value to compare"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => updateCondition({ type: 'compound', conditions: [condition], operator: 'and' })}
              className="px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Add Logic
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border border-gray-300 rounded-lg p-4 bg-white ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-sm font-medium text-gray-700"
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            Conditional Logic
          </button>
          
          <select
            value={condition.operator || 'and'}
            onChange={(e) => updateCondition({ operator: e.target.value as any })}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="and">AND</option>
            <option value="or">OR</option>
            <option value="not">NOT</option>
          </select>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={addCondition}
            className="p-2 text-green-600 hover:bg-green-50 rounded"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => updateCondition({ type: 'simple', variable: '', comparison: '==', value: '' })}
            className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Simplify
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="space-y-4">
          {condition.conditions?.map((subCondition, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex-1">
                <ConditionalBuilder
                  condition={subCondition}
                  onChange={(updated) => updateSubCondition(index, updated)}
                />
              </div>
              <button
                onClick={() => removeCondition(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <Minus size={16} />
              </button>
            </div>
          ))}
          
          {(!condition.conditions || condition.conditions.length === 0) && (
            <div className="text-sm text-gray-500 text-center py-4">
              No conditions defined. Click + to add conditions.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface StateChangeBuilderProps {
  changes: StateChange[];
  onChange: (changes: StateChange[]) => void;
  className?: string;
}

export const StateChangeBuilder: React.FC<StateChangeBuilderProps> = ({
  changes,
  onChange,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const addStateChange = useCallback(() => {
    const newChange: StateChange = {
      type: 'variable',
      target: '',
      operation: 'set',
      value: ''
    };
    onChange([...changes, newChange]);
  }, [changes, onChange]);

  const removeStateChange = useCallback((index: number) => {
    const newChanges = changes.filter((_, i) => i !== index);
    onChange(newChanges);
  }, [changes, onChange]);

  const updateStateChange = useCallback((index: number, updates: Partial<StateChange>) => {
    const newChanges = [...changes];
    newChanges[index] = { ...newChanges[index], ...updates };
    onChange(newChanges);
  }, [changes, onChange]);

  return (
    <div className={`border border-gray-300 rounded-lg p-4 bg-white ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center text-sm font-medium text-gray-700"
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          State Changes ({changes.length})
        </button>
        
        <button
          onClick={addStateChange}
          className="p-2 text-green-600 hover:bg-green-50 rounded"
        >
          <Plus size={16} />
        </button>
      </div>
      
      {isExpanded && (
        <div className="space-y-4">
          {changes.map((change, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 p-3 border border-gray-200 rounded">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={change.type}
                    onChange={(e) => updateStateChange(index, { type: e.target.value as any })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="variable">Variable</option>
                    <option value="inventory">Inventory</option>
                    <option value="party">Party</option>
                    <option value="flag">Flag</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Target</label>
                  <input
                    type="text"
                    value={change.target}
                    onChange={(e) => updateStateChange(index, { target: e.target.value })}
                    placeholder="Variable name or target"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Operation</label>
                  <select
                    value={change.operation}
                    onChange={(e) => updateStateChange(index, { operation: e.target.value as any })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="set">Set</option>
                    <option value="add">Add</option>
                    <option value="remove">Remove</option>
                    <option value="modify">Modify</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Value</label>
                  <input
                    type="text"
                    value={typeof change.value === 'object' ? JSON.stringify(change.value) : change.value}
                    onChange={(e) => {
                      let value: any = e.target.value;
                      try {
                        if (value.startsWith('{') || value.startsWith('[')) {
                          value = JSON.parse(value);
                        } else if (!isNaN(Number(value)) && value !== '') {
                          value = Number(value);
                        } else if (value === 'true') {
                          value = true;
                        } else if (value === 'false') {
                          value = false;
                        }
                      } catch {
                        // Keep as string if JSON parse fails
                      }
                      updateStateChange(index, { value });
                    }}
                    placeholder="Value or JSON object"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
              
              <button
                onClick={() => removeStateChange(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <Minus size={16} />
              </button>
            </div>
          ))}
          
          {changes.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-4">
              No state changes defined. Click + to add changes.
            </div>
          )}
        </div>
      )}
    </div>
  );
};