/**
 * ClassCreator - Create custom class templates for SPARC RPG
 * Based on PRD 25: Homebrew System
 */

import * as React from "react";
import { cn } from "../lib/utils";
import { Button } from "../Button";
import { Input, Textarea } from "../Input";
import { Select, SelectOption } from "../Select";
import { Card, CardHeader, CardTitle, CardContent } from "../Card";
import { Badge } from "../Badge";
import {
  ClassData,
  Attribute,
  BalanceWarning,
  ATTRIBUTES,
  PARTY_ROLES,
} from "./types";
import { validateClassBalance } from "./balance";

// ============================================
// Props & Types
// ============================================

export interface ClassCreatorProps {
  /** Initial class data (for editing) */
  initialData?: Partial<ClassData>;
  /** Called when class is saved */
  onSave: (name: string, description: string, data: ClassData, tags: string[], asDraft?: boolean) => void;
  /** Called when cancelled */
  onCancel?: () => void;
  /** Show preview panel */
  showPreview?: boolean;
  /** Additional class name */
  className?: string;
}

// ============================================
// Default Values
// ============================================

const DEFAULT_CLASS: ClassData = {
  primaryAttribute: 'might',
  attributes: {
    might: 3,
    grace: 2,
    wit: 2,
    heart: 3,
  },
  hitPoints: 20,
  startingEquipment: [],
  classAbility: {
    name: '',
    description: '',
  },
  archetype: '',
  background: '',
  playstyle: '',
  roleInParty: 'DPS',
};

// ============================================
// Sub-Components
// ============================================

function AttributeDistributor({
  attributes,
  onChange,
  primaryAttribute,
  onPrimaryChange,
}: {
  attributes: ClassData['attributes'];
  onChange: (attrs: ClassData['attributes']) => void;
  primaryAttribute: Attribute;
  onPrimaryChange: (attr: Attribute) => void;
}) {
  const total = attributes.might + attributes.grace + attributes.wit + attributes.heart;
  const maxTotal = 12;
  const isOverBudget = total > maxTotal;

  const updateAttribute = (attr: Attribute, value: number) => {
    onChange({
      ...attributes,
      [attr]: Math.max(1, Math.min(5, value)),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Attribute Distribution</span>
        <span className={cn(
          "text-sm font-mono",
          isOverBudget ? "text-red-400" : total === maxTotal ? "text-green-400" : "text-muted-foreground"
        )}>
          {total}/{maxTotal} points
        </span>
      </div>

      {ATTRIBUTES.map(attr => {
        const value = attributes[attr.value as keyof typeof attributes];
        const isPrimary = attr.value === primaryAttribute;
        
        return (
          <div key={attr.value} className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-sm flex items-center gap-2">
                <span>{attr.icon}</span>
                <span className={isPrimary ? 'text-bronze font-medium' : ''}>
                  {attr.label}
                  {isPrimary && <span className="text-xs ml-1">(Primary)</span>}
                </span>
              </label>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateAttribute(attr.value as Attribute, value - 1)}
                  disabled={value <= 1}
                  className="h-6 w-6 p-0"
                >
                  -
                </Button>
                <span className="w-8 text-center font-mono font-bold">{value}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateAttribute(attr.value as Attribute, value + 1)}
                  disabled={value >= 5}
                  className="h-6 w-6 p-0"
                >
                  +
                </Button>
                <Button
                  variant={isPrimary ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => onPrimaryChange(attr.value as Attribute)}
                  className="text-xs ml-2"
                >
                  {isPrimary ? '★' : '☆'}
                </Button>
              </div>
            </div>
            <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all rounded-full",
                  isPrimary ? "bg-bronze" : "bg-muted-foreground"
                )}
                style={{ width: `${(value / 5) * 100}%` }}
              />
            </div>
          </div>
        );
      })}

      {isOverBudget && (
        <p className="text-xs text-red-400">
          ⚠️ Total exceeds {maxTotal} points. Reduce some attributes.
        </p>
      )}
    </div>
  );
}

function EquipmentEditor({
  equipment,
  onChange,
}: {
  equipment: string[];
  onChange: (equip: string[]) => void;
}) {
  const [newItem, setNewItem] = React.useState('');

  const addItem = () => {
    if (newItem.trim() && equipment.length < 6) {
      onChange([...equipment, newItem.trim()]);
      setNewItem('');
    }
  };

  const removeItem = (index: number) => {
    onChange(equipment.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem())}
          placeholder="Add starting item..."
          className="flex-1"
        />
        <Button 
          variant="secondary" 
          onClick={addItem}
          disabled={equipment.length >= 6}
        >
          Add
        </Button>
      </div>
      
      <div className="space-y-2">
        {equipment.map((item, i) => (
          <div key={i} className="flex items-center gap-2 p-2 bg-surface-elevated rounded">
            <span className="text-sm flex-1">{item}</span>
            <Button variant="ghost" size="sm" onClick={() => removeItem(i)} className="text-destructive h-6 w-6 p-0">
              ✕
            </Button>
          </div>
        ))}
        {equipment.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">No starting equipment</p>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground">
        {equipment.length}/6 items • Typical: weapon, armor, 2-3 misc items
      </p>
    </div>
  );
}

function ClassPreview({ name, data }: { name: string; data: ClassData }) {
  const primaryAttr = ATTRIBUTES.find(a => a.value === data.primaryAttribute);

  return (
    <Card className="sticky top-4">
      <CardHeader className="text-center pb-2">
        <div className="text-4xl mb-2">⚔️</div>
        <CardTitle className="text-xl text-bronze">
          {name || 'Unnamed Class'}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {data.roleInParty} • {primaryAttr?.icon} {primaryAttr?.label}-focused
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="flex gap-6 justify-center">
          <div className="text-center">
            <span className="text-xs text-muted-foreground">HP</span>
            <p className="text-2xl font-bold text-destructive">{data.hitPoints}</p>
          </div>
        </div>

        {/* Attributes */}
        <div className="grid grid-cols-4 gap-2 text-center">
          {ATTRIBUTES.map(attr => {
            const value = data.attributes[attr.value as keyof typeof data.attributes];
            const isPrimary = attr.value === data.primaryAttribute;
            return (
              <div 
                key={attr.value} 
                className={cn(
                  "p-2 rounded",
                  isPrimary ? "bg-bronze/20 border border-bronze/50" : "bg-surface-elevated"
                )}
              >
                <span className="text-xs">{attr.icon}</span>
                <p className={cn("font-bold", isPrimary && "text-bronze")}>{value}</p>
              </div>
            );
          })}
        </div>

        {/* Class Ability */}
        {data.classAbility.name && (
          <div>
            <h4 className="font-semibold text-sm mb-1">CLASS ABILITY</h4>
            <p className="text-sm font-medium text-purple-400">{data.classAbility.name}</p>
            <p className="text-xs text-muted-foreground">{data.classAbility.description}</p>
            {data.classAbility.cooldown && (
              <p className="text-xs text-amber-400 mt-1">⏱️ {data.classAbility.cooldown}</p>
            )}
          </div>
        )}

        {/* Starting Equipment */}
        {data.startingEquipment.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-1">STARTING GEAR</h4>
            <div className="flex flex-wrap gap-1">
              {data.startingEquipment.map((item, i) => (
                <Badge key={i} variant="outline" className="text-xs">{item}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Archetype */}
        {data.archetype && (
          <p className="text-sm italic text-muted-foreground border-l-2 border-bronze/50 pl-3">
            "{data.archetype}"
          </p>
        )}

        {/* Playstyle */}
        {data.playstyle && (
          <div>
            <h4 className="font-semibold text-sm mb-1">PLAYSTYLE</h4>
            <p className="text-xs text-muted-foreground">{data.playstyle}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BalancePanel({ warnings }: { warnings: BalanceWarning[] }) {
  if (warnings.length === 0) {
    return (
      <div className="p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
        <p className="text-green-400 text-sm">✅ Class looks balanced</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">⚠️ Balance Check</h4>
      {warnings.map((warning, i) => (
        <div
          key={i}
          className={cn(
            "p-3 rounded-lg text-sm",
            warning.severity === 'error' && "bg-red-900/20 border border-red-700/50 text-red-300",
            warning.severity === 'warning' && "bg-yellow-900/20 border border-yellow-700/50 text-yellow-300",
            warning.severity === 'info' && "bg-blue-900/20 border border-blue-700/50 text-blue-300"
          )}
        >
          <p className="font-medium">{warning.message}</p>
          {warning.suggestion && (
            <p className="text-xs mt-1 opacity-80">{warning.suggestion}</p>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function ClassCreator({
  initialData,
  onSave,
  onCancel,
  showPreview = true,
  className,
}: ClassCreatorProps) {
  const [name, setName] = React.useState('');
  const [tags, setTags] = React.useState<string[]>([]);
  const [tagInput, setTagInput] = React.useState('');
  const [data, setData] = React.useState<ClassData>({
    ...DEFAULT_CLASS,
    ...initialData,
  });

  const warnings = React.useMemo(() => validateClassBalance(data), [data]);

  const updateData = (updates: Partial<ClassData>) => {
    setData(d => ({ ...d, ...updates }));
  };

  const updateClassAbility = (updates: Partial<ClassData['classAbility']>) => {
    setData(d => ({
      ...d,
      classAbility: { ...d.classAbility, ...updates },
    }));
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSave = (asDraft = false) => {
    onSave(name, data.background, data, tags, asDraft);
  };

  return (
    <div className={cn("grid gap-6", showPreview ? "lg:grid-cols-2" : "", className)}>
      {/* Editor Panel */}
      <div className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Class Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Chronomancer"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Role in Party</label>
              <Select
                value={data.roleInParty}
                onChange={(v) => updateData({ roleInParty: v })}
              >
                {PARTY_ROLES.map(role => (
                  <SelectOption key={role} value={role}>{role}</SelectOption>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Archetype</label>
              <Input
                value={data.archetype}
                onChange={(e) => updateData({ archetype: e.target.value })}
                placeholder="The mysterious wanderer who..."
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Background</label>
              <Textarea
                value={data.background}
                onChange={(e) => updateData({ background: e.target.value })}
                placeholder="The lore and origin of this class..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Attributes */}
        <Card>
          <CardHeader>
            <CardTitle>Attributes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AttributeDistributor
              attributes={data.attributes}
              onChange={(attrs) => updateData({ attributes: attrs })}
              primaryAttribute={data.primaryAttribute}
              onPrimaryChange={(attr) => updateData({ primaryAttribute: attr })}
            />

            <div>
              <label className="text-sm font-medium mb-1 block">Starting Hit Points</label>
              <Input
                type="number"
                min={10}
                max={30}
                value={data.hitPoints}
                onChange={(e) => updateData({ hitPoints: parseInt(e.target.value) || 15 })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Typical: 15-20 for balanced, 10-15 for squishy, 20-25 for tanks
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Class Ability */}
        <Card>
          <CardHeader>
            <CardTitle>Class Ability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Ability Name</label>
              <Input
                value={data.classAbility.name}
                onChange={(e) => updateClassAbility({ name: e.target.value })}
                placeholder="e.g., Time Warp"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Textarea
                value={data.classAbility.description}
                onChange={(e) => updateClassAbility({ description: e.target.value })}
                placeholder="What does this ability do?"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Cooldown (optional)</label>
              <Input
                value={data.classAbility.cooldown || ''}
                onChange={(e) => updateClassAbility({ cooldown: e.target.value })}
                placeholder="e.g., Once per encounter, 3 rounds"
              />
            </div>
          </CardContent>
        </Card>

        {/* Starting Equipment */}
        <Card>
          <CardHeader>
            <CardTitle>Starting Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            <EquipmentEditor
              equipment={data.startingEquipment}
              onChange={(equip) => updateData({ startingEquipment: equip })}
            />
          </CardContent>
        </Card>

        {/* Playstyle & Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Playstyle & Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Playstyle</label>
              <Textarea
                value={data.playstyle}
                onChange={(e) => updateData({ playstyle: e.target.value })}
                placeholder="Tips for playing this class effectively..."
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Suggested Appearance</label>
              <Textarea
                value={data.suggestedAppearance || ''}
                onChange={(e) => updateData({ suggestedAppearance: e.target.value })}
                placeholder="Visual guidelines for this class..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-3">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag..."
                className="flex-1"
              />
              <Button variant="secondary" onClick={addTag}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <Badge key={tag} variant="outline" className="cursor-pointer" onClick={() => removeTag(tag)}>
                  {tag} ✕
                </Badge>
              ))}
              {tags.length === 0 && (
                <span className="text-sm text-muted-foreground">No tags yet</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          )}
          <Button variant="secondary" onClick={() => handleSave(true)}>
            Save Draft
          </Button>
          <Button variant="primary" onClick={() => handleSave(false)}>
            Publish
          </Button>
        </div>
      </div>

      {/* Preview Panel */}
      {showPreview && (
        <div className="space-y-4">
          <ClassPreview name={name} data={data} />
          <BalancePanel warnings={warnings} />
        </div>
      )}
    </div>
  );
}

export default ClassCreator;
