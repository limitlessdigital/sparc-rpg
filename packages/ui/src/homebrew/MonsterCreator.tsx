/**
 * MonsterCreator - Create custom monsters for SPARC RPG
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
  MonsterData,
  MonsterAttack,
  MonsterAbility,
  Attribute,
  CreatureType,
  CreatureSize,
  DamageType,
  BalanceWarning,
  CREATURE_TYPES,
  CREATURE_SIZES,
  DAMAGE_TYPES,
  ATTRIBUTES,
} from "./types";
import { calculateMonsterCR, validateMonsterBalance } from "./balance";

// ============================================
// Props & Types
// ============================================

export interface MonsterCreatorProps {
  /** Initial monster data (for editing) */
  initialData?: Partial<MonsterData>;
  /** Called when monster is saved */
  onSave: (data: MonsterData, asDraft?: boolean) => void;
  /** Called when cancelled */
  onCancel?: () => void;
  /** Show preview panel */
  showPreview?: boolean;
  /** Additional class name */
  className?: string;
}

interface AttackEditorProps {
  attack: MonsterAttack;
  onChange: (attack: MonsterAttack) => void;
  onRemove: () => void;
}

interface AbilityEditorProps {
  ability: MonsterAbility;
  onChange: (ability: MonsterAbility) => void;
  onRemove: () => void;
}

// ============================================
// Default Values
// ============================================

const DEFAULT_MONSTER: MonsterData = {
  hitPoints: 20,
  armorClass: 10,
  might: 2,
  grace: 2,
  wit: 2,
  heart: 2,
  attacks: [],
  abilities: [],
  type: 'beast',
  size: 'medium',
  challengeRating: 1,
};

const createDefaultAttack = (): MonsterAttack => ({
  id: `attack_${Date.now()}`,
  name: '',
  attribute: 'might',
  diceCount: 2,
  damageType: 'physical',
});

const createDefaultAbility = (): MonsterAbility => ({
  id: `ability_${Date.now()}`,
  name: '',
  description: '',
});

// ============================================
// Sub-Components
// ============================================

function AttackEditor({ attack, onChange, onRemove }: AttackEditorProps) {
  return (
    <div className="p-4 bg-surface-elevated rounded-lg border border-surface-divider space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1 block">Attack Name</label>
          <Input
            value={attack.name}
            onChange={(e) => onChange({ ...attack, name: e.target.value })}
            placeholder="e.g., Shadow Claw"
          />
        </div>
        <Button variant="ghost" size="sm" onClick={onRemove} className="mt-5 text-destructive">
          ✕
        </Button>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Attribute</label>
          <Select
            value={attack.attribute}
            onChange={(value) => onChange({ ...attack, attribute: value as Attribute })}
          >
            {ATTRIBUTES.map(attr => (
              <SelectOption key={attr.value} value={attr.value}>
                {attr.icon} {attr.label}
              </SelectOption>
            ))}
          </Select>
        </div>
        
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Dice Count</label>
          <Input
            type="number"
            min={1}
            max={10}
            value={attack.diceCount}
            onChange={(e) => onChange({ ...attack, diceCount: parseInt(e.target.value) || 1 })}
          />
        </div>
        
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Damage Type</label>
          <Select
            value={attack.damageType}
            onChange={(value) => onChange({ ...attack, damageType: value as DamageType })}
          >
            {DAMAGE_TYPES.map(type => (
              <SelectOption key={type.value} value={type.value}>
                {type.label}
              </SelectOption>
            ))}
          </Select>
        </div>
      </div>
      
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Description (optional)</label>
        <Input
          value={attack.description || ''}
          onChange={(e) => onChange({ ...attack, description: e.target.value })}
          placeholder="A shadowy claw rakes across the target..."
        />
      </div>
    </div>
  );
}

function AbilityEditor({ ability, onChange, onRemove }: AbilityEditorProps) {
  return (
    <div className="p-4 bg-surface-elevated rounded-lg border border-surface-divider space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1 block">Ability Name</label>
          <Input
            value={ability.name}
            onChange={(e) => onChange({ ...ability, name: e.target.value })}
            placeholder="e.g., Shadow Step"
          />
        </div>
        <div className="w-24">
          <label className="text-xs text-muted-foreground mb-1 block">Cooldown</label>
          <Input
            type="number"
            min={0}
            value={ability.cooldown || 0}
            onChange={(e) => onChange({ ...ability, cooldown: parseInt(e.target.value) || 0 })}
            placeholder="Rounds"
          />
        </div>
        <Button variant="ghost" size="sm" onClick={onRemove} className="mt-5 text-destructive">
          ✕
        </Button>
      </div>
      
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Description</label>
        <Textarea
          value={ability.description}
          onChange={(e) => onChange({ ...ability, description: e.target.value })}
          placeholder="Describe what this ability does..."
          rows={2}
        />
      </div>
    </div>
  );
}

function AttributeSlider({ 
  attribute, 
  value, 
  onChange, 
  icon 
}: { 
  attribute: string; 
  value: number; 
  onChange: (v: number) => void;
  icon: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-sm">
        {icon} {attribute}
      </span>
      <input
        type="range"
        min={1}
        max={6}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="flex-1 accent-bronze"
      />
      <span className="w-8 text-center font-mono font-bold text-bronze">{value}</span>
    </div>
  );
}

function MonsterStatBlock({ data, name }: { data: MonsterData; name: string }) {
  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{name || 'Unnamed Monster'}</CardTitle>
        <p className="text-sm text-muted-foreground capitalize">
          {data.size} {data.type} • CR {data.challengeRating}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* HP & AC */}
        <div className="flex gap-6">
          <div>
            <span className="text-xs text-muted-foreground">HP</span>
            <p className="text-2xl font-bold text-destructive">{data.hitPoints}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">AC</span>
            <p className="text-2xl font-bold text-blue-400">{data.armorClass}</p>
          </div>
        </div>
        
        {/* Attributes */}
        <div className="grid grid-cols-4 gap-2 text-center">
          {ATTRIBUTES.map(attr => (
            <div key={attr.value} className="p-2 bg-surface-elevated rounded">
              <span className="text-xs text-muted-foreground">{attr.icon}</span>
              <p className="font-bold">{data[attr.value as keyof typeof data] as number}</p>
            </div>
          ))}
        </div>
        
        <div className="border-t border-surface-divider pt-4" />
        
        {/* Attacks */}
        {data.attacks.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2">ATTACKS</h4>
            {data.attacks.map(attack => (
              <p key={attack.id} className="text-sm mb-1">
                <span className="font-medium">• {attack.name || 'Unnamed'}</span>
                <span className="text-muted-foreground">
                  {' '}({attack.attribute}) {attack.diceCount}d6 {attack.damageType}
                </span>
              </p>
            ))}
          </div>
        )}
        
        {/* Abilities */}
        {data.abilities.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2">ABILITIES</h4>
            {data.abilities.map(ability => (
              <div key={ability.id} className="mb-2">
                <p className="text-sm font-medium">
                  • {ability.name || 'Unnamed'}
                  {ability.cooldown ? (
                    <span className="text-muted-foreground"> ({ability.cooldown} round cooldown)</span>
                  ) : null}
                </p>
                {ability.description && (
                  <p className="text-xs text-muted-foreground ml-3">{ability.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Tactics */}
        {data.tactics && (
          <div>
            <h4 className="font-semibold text-sm mb-1">TACTICS</h4>
            <p className="text-sm text-muted-foreground">{data.tactics}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BalancePanel({ warnings, cr }: { warnings: BalanceWarning[]; cr: number }) {
  if (warnings.length === 0) {
    return (
      <div className="p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
        <p className="text-green-400 text-sm">✅ Stats look balanced for CR {cr}</p>
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

export function MonsterCreator({
  initialData,
  onSave,
  onCancel,
  showPreview = true,
  className,
}: MonsterCreatorProps) {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [tags, setTags] = React.useState<string[]>([]);
  const [tagInput, setTagInput] = React.useState('');
  const [data, setData] = React.useState<MonsterData>({
    ...DEFAULT_MONSTER,
    ...initialData,
  });

  // Calculate CR and balance warnings
  const cr = React.useMemo(() => calculateMonsterCR(data), [data]);
  const warnings = React.useMemo(() => validateMonsterBalance(data), [data]);

  // Update CR when stats change
  React.useEffect(() => {
    setData(d => ({ ...d, challengeRating: cr }));
  }, [cr]);

  const updateData = (updates: Partial<MonsterData>) => {
    setData(d => ({ ...d, ...updates }));
  };

  const addAttack = () => {
    setData(d => ({
      ...d,
      attacks: [...d.attacks, createDefaultAttack()],
    }));
  };

  const updateAttack = (id: string, attack: MonsterAttack) => {
    setData(d => ({
      ...d,
      attacks: d.attacks.map(a => a.id === id ? attack : a),
    }));
  };

  const removeAttack = (id: string) => {
    setData(d => ({
      ...d,
      attacks: d.attacks.filter(a => a.id !== id),
    }));
  };

  const addAbility = () => {
    setData(d => ({
      ...d,
      abilities: [...d.abilities, createDefaultAbility()],
    }));
  };

  const updateAbility = (id: string, ability: MonsterAbility) => {
    setData(d => ({
      ...d,
      abilities: d.abilities.map(a => a.id === id ? ability : a),
    }));
  };

  const removeAbility = (id: string) => {
    setData(d => ({
      ...d,
      abilities: d.abilities.filter(a => a.id !== id),
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
    onSave(data, asDraft);
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
              <label className="text-sm font-medium mb-1 block">Monster Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Shadow Stalker"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Type</label>
                <Select
                  value={data.type}
                  onChange={(value) => updateData({ type: value as CreatureType })}
                >
                  {CREATURE_TYPES.map(type => (
                    <SelectOption key={type.value} value={type.value}>
                      {type.label}
                    </SelectOption>
                  ))}
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Size</label>
                <Select
                  value={data.size}
                  onChange={(value) => updateData({ size: value as CreatureSize })}
                >
                  {CREATURE_SIZES.map(size => (
                    <SelectOption key={size.value} value={size.value}>
                      {size.label}
                    </SelectOption>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A creature of pure darkness..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Hit Points</label>
                <Input
                  type="number"
                  min={1}
                  max={500}
                  value={data.hitPoints}
                  onChange={(e) => updateData({ hitPoints: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Armor Class</label>
                <Input
                  type="number"
                  min={1}
                  max={25}
                  value={data.armorClass}
                  onChange={(e) => updateData({ armorClass: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-sm font-medium">Attributes</label>
              <AttributeSlider
                attribute="Might"
                icon="💪"
                value={data.might}
                onChange={(v) => updateData({ might: v })}
              />
              <AttributeSlider
                attribute="Grace"
                icon="🎯"
                value={data.grace}
                onChange={(v) => updateData({ grace: v })}
              />
              <AttributeSlider
                attribute="Wit"
                icon="🧠"
                value={data.wit}
                onChange={(v) => updateData({ wit: v })}
              />
              <AttributeSlider
                attribute="Heart"
                icon="❤️"
                value={data.heart}
                onChange={(v) => updateData({ heart: v })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Attacks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Attacks</CardTitle>
            <Button variant="secondary" size="sm" onClick={addAttack}>
              + Add Attack
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.attacks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No attacks yet. Add one to give your monster some bite!
              </p>
            ) : (
              data.attacks.map(attack => (
                <AttackEditor
                  key={attack.id}
                  attack={attack}
                  onChange={(a) => updateAttack(attack.id, a)}
                  onRemove={() => removeAttack(attack.id)}
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* Abilities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Abilities</CardTitle>
            <Button variant="secondary" size="sm" onClick={addAbility}>
              + Add Ability
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.abilities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No special abilities yet. Add one to make your monster unique!
              </p>
            ) : (
              data.abilities.map(ability => (
                <AbilityEditor
                  key={ability.id}
                  ability={ability}
                  onChange={(a) => updateAbility(ability.id, a)}
                  onRemove={() => removeAbility(ability.id)}
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* Lore & Tactics */}
        <Card>
          <CardHeader>
            <CardTitle>Lore & Tactics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Tactics</label>
              <Textarea
                value={data.tactics || ''}
                onChange={(e) => updateData({ tactics: e.target.value })}
                placeholder="How does this creature fight?"
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Lore</label>
              <Textarea
                value={data.lore || ''}
                onChange={(e) => updateData({ lore: e.target.value })}
                placeholder="The origin and nature of this creature..."
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Habitat</label>
              <Input
                value={data.habitat || ''}
                onChange={(e) => updateData({ habitat: e.target.value })}
                placeholder="Dark caves, abandoned ruins..."
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Weaknesses</label>
              <Input
                value={data.weaknesses || ''}
                onChange={(e) => updateData({ weaknesses: e.target.value })}
                placeholder="Light, fire, silver..."
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
          <MonsterStatBlock data={data} name={name} />
          <BalancePanel warnings={warnings} cr={cr} />
        </div>
      )}
    </div>
  );
}

export default MonsterCreator;
