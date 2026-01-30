/**
 * AbilityCreator - Create custom abilities and spells for SPARC RPG
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
  AbilityData,
  AbilityEffect,
  AbilityType,
  TargetType,
  EffectType,
  Attribute,
  BalanceWarning,
  ABILITY_TYPES,
  TARGET_TYPES,
  EFFECT_TYPES,
  ATTRIBUTES,
} from "./types";
import { calculateAbilityPowerLevel, validateAbilityBalance } from "./balance";

// ============================================
// Props & Types
// ============================================

export interface AbilityCreatorProps {
  /** Initial ability data (for editing) */
  initialData?: Partial<AbilityData>;
  /** Whether this is a spell (true) or ability (false) */
  isSpell?: boolean;
  /** Called when ability is saved */
  onSave: (name: string, description: string, data: AbilityData, tags: string[], asDraft?: boolean) => void;
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

const DEFAULT_ABILITY: AbilityData = {
  abilityType: 'attack',
  targetType: 'enemy',
  effects: [],
  description: '',
};

// ============================================
// Sub-Components
// ============================================

function EffectEditor({
  effect,
  onChange,
  onRemove,
}: {
  effect: AbilityEffect;
  onChange: (e: AbilityEffect) => void;
  onRemove: () => void;
}) {
  const showValue = ['damage', 'heal', 'shield'].includes(effect.type);
  const showDuration = ['buff_attribute', 'debuff_attribute', 'stun', 'poison', 'burn', 'freeze', 'blind', 'regeneration', 'haste', 'slow'].includes(effect.type);

  return (
    <div className="p-4 bg-surface-elevated rounded-lg border border-surface-divider space-y-3">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1 block">Effect Type</label>
          <Select
            value={effect.type}
            onChange={(v) => onChange({ ...effect, type: v as EffectType })}
          >
            {EFFECT_TYPES.map(type => (
              <SelectOption key={type.value} value={type.value}>
                {type.label}
              </SelectOption>
            ))}
          </Select>
        </div>
        <Button variant="ghost" size="sm" onClick={onRemove} className="mt-5 text-destructive">✕</Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {showValue && (
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Value</label>
            <Input
              type="number"
              min={1}
              value={effect.value || 0}
              onChange={(e) => onChange({ ...effect, value: parseInt(e.target.value) || 0 })}
              placeholder="Amount"
            />
          </div>
        )}

        {showDuration && (
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Duration (rounds)</label>
            <Input
              type="number"
              min={1}
              value={effect.duration || 1}
              onChange={(e) => onChange({ ...effect, duration: parseInt(e.target.value) || 1 })}
            />
          </div>
        )}
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Condition (optional)</label>
        <Input
          value={effect.condition || ''}
          onChange={(e) => onChange({ ...effect, condition: e.target.value })}
          placeholder="e.g., If target is undead, On hit only"
        />
      </div>
    </div>
  );
}

function AbilityPreview({ name, data, isSpell }: { name: string; data: AbilityData; isSpell: boolean }) {
  const powerLevel = calculateAbilityPowerLevel(data);

  const getEffectDescription = (effect: AbilityEffect): string => {
    switch (effect.type) {
      case 'damage':
        return `Deal ${effect.value || 0} damage`;
      case 'heal':
        return `Heal ${effect.value || 0} HP`;
      case 'shield':
        return `Grant ${effect.value || 0} temporary HP`;
      case 'buff_attribute':
        return `Buff attribute for ${effect.duration || 1} rounds`;
      case 'debuff_attribute':
        return `Debuff attribute for ${effect.duration || 1} rounds`;
      case 'stun':
        return `Stun for ${effect.duration || 1} rounds`;
      case 'poison':
        return `Poison for ${effect.duration || 1} rounds`;
      case 'burn':
        return `Burn for ${effect.duration || 1} rounds`;
      case 'freeze':
        return `Freeze for ${effect.duration || 1} rounds`;
      case 'blind':
        return `Blind for ${effect.duration || 1} rounds`;
      case 'regeneration':
        return `Regenerate for ${effect.duration || 1} rounds`;
      case 'haste':
        return `Haste for ${effect.duration || 1} rounds`;
      case 'slow':
        return `Slow for ${effect.duration || 1} rounds`;
      default:
        return effect.type;
    }
  };

  return (
    <Card className="sticky top-4">
      <CardHeader className="text-center pb-2">
        <div className="text-4xl mb-2">{isSpell ? '✨' : '⚡'}</div>
        <CardTitle className="text-xl text-bronze">
          {name || (isSpell ? 'Unnamed Spell' : 'Unnamed Ability')}
        </CardTitle>
        <p className="text-sm text-muted-foreground capitalize">
          {data.abilityType} • {data.targetType.replace('_', ' ')}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mechanics */}
        <div className="space-y-2">
          {data.attribute && (
            <p className="text-sm">
              <span className="text-muted-foreground">Roll:</span>{' '}
              <span className="font-medium capitalize">{data.attribute}</span>
              {data.difficulty && <span className="text-muted-foreground"> vs {data.difficulty}</span>}
            </p>
          )}
          {data.range && data.range !== 'self' && (
            <p className="text-sm">
              <span className="text-muted-foreground">Range:</span>{' '}
              <span className="capitalize">{data.range}</span>
            </p>
          )}
          {data.areaOfEffect && data.areaOfEffect !== 'single' && (
            <p className="text-sm">
              <span className="text-muted-foreground">Area:</span>{' '}
              <span className="capitalize">{data.areaOfEffect}</span>
            </p>
          )}
        </div>

        {/* Effects */}
        {data.effects.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2">EFFECTS</h4>
            {data.effects.map((effect, i) => (
              <p key={i} className="text-sm mb-1">
                • {getEffectDescription(effect)}
                {effect.condition && (
                  <span className="text-muted-foreground"> ({effect.condition})</span>
                )}
              </p>
            ))}
          </div>
        )}

        {/* Cooldown & Limits */}
        {(data.cooldown || data.usesPerEncounter || data.usesPerDay) && (
          <div className="text-sm space-y-1">
            {data.cooldown && (
              <p className="text-amber-400">⏱️ {data.cooldown} round cooldown</p>
            )}
            {data.usesPerEncounter && (
              <p className="text-blue-400">🔄 {data.usesPerEncounter}x per encounter</p>
            )}
            {data.usesPerDay && (
              <p className="text-purple-400">☀️ {data.usesPerDay}x per day</p>
            )}
          </div>
        )}

        {/* Description */}
        {data.description && (
          <p className="text-sm text-muted-foreground">{data.description}</p>
        )}

        {/* Casting Description */}
        {data.castingDescription && (
          <p className="text-sm italic text-muted-foreground border-l-2 border-bronze/50 pl-3">
            {data.castingDescription}
          </p>
        )}

        {/* Power Level */}
        <div className="pt-2 border-t border-surface-divider">
          <p className="text-xs text-muted-foreground">
            Power Level: <span className="text-bronze font-medium">{powerLevel}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function BalancePanel({ warnings }: { warnings: BalanceWarning[] }) {
  if (warnings.length === 0) {
    return (
      <div className="p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
        <p className="text-green-400 text-sm">✅ Ability looks balanced</p>
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

export function AbilityCreator({
  initialData,
  isSpell = false,
  onSave,
  onCancel,
  showPreview = true,
  className,
}: AbilityCreatorProps) {
  const [name, setName] = React.useState('');
  const [tags, setTags] = React.useState<string[]>([]);
  const [tagInput, setTagInput] = React.useState('');
  const [data, setData] = React.useState<AbilityData>({
    ...DEFAULT_ABILITY,
    ...initialData,
  });

  const warnings = React.useMemo(() => validateAbilityBalance(data), [data]);

  const updateData = (updates: Partial<AbilityData>) => {
    setData(d => ({ ...d, ...updates }));
  };

  const addEffect = () => {
    updateData({
      effects: [
        ...data.effects,
        { id: `effect_${Date.now()}`, type: 'damage', value: 10 },
      ],
    });
  };

  const updateEffect = (index: number, effect: AbilityEffect) => {
    const effects = [...data.effects];
    effects[index] = effect;
    updateData({ effects });
  };

  const removeEffect = (index: number) => {
    updateData({
      effects: data.effects.filter((_, i) => i !== index),
    });
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
    onSave(name, data.description, data, tags, asDraft);
  };

  const typeLabel = isSpell ? 'Spell' : 'Ability';

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
              <label className="text-sm font-medium mb-1 block">{typeLabel} Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isSpell ? "e.g., Fireball" : "e.g., Whirlwind Strike"}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Type</label>
                <Select
                  value={data.abilityType}
                  onChange={(v) => updateData({ abilityType: v as AbilityType })}
                >
                  {ABILITY_TYPES.map(type => (
                    <SelectOption key={type.value} value={type.value}>
                      {type.label}
                    </SelectOption>
                  ))}
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Target</label>
                <Select
                  value={data.targetType}
                  onChange={(v) => updateData({ targetType: v as TargetType })}
                >
                  {TARGET_TYPES.map(type => (
                    <SelectOption key={type.value} value={type.value}>
                      {type.label}
                    </SelectOption>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Textarea
                value={data.description}
                onChange={(e) => updateData({ description: e.target.value })}
                placeholder={`What does this ${typeLabel.toLowerCase()} do?`}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Mechanics */}
        <Card>
          <CardHeader>
            <CardTitle>Mechanics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Roll Attribute</label>
                <Select
                  value={data.attribute || ''}
                  onChange={(v) => updateData({ attribute: v as Attribute || undefined })}
                >
                  <SelectOption value="">No roll required</SelectOption>
                  {ATTRIBUTES.map(attr => (
                    <SelectOption key={attr.value} value={attr.value}>
                      {attr.icon} {attr.label}
                    </SelectOption>
                  ))}
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Difficulty</label>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={data.difficulty || ''}
                  onChange={(e) => updateData({ difficulty: parseInt(e.target.value) || undefined })}
                  placeholder="Target number"
                  disabled={!data.attribute}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Range</label>
                <Select
                  value={data.range || 'self'}
                  onChange={(v) => updateData({ range: v as AbilityData['range'] })}
                >
                  <SelectOption value="self">Self</SelectOption>
                  <SelectOption value="touch">Touch</SelectOption>
                  <SelectOption value="ranged">Ranged</SelectOption>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Area of Effect</label>
                <Select
                  value={data.areaOfEffect || 'single'}
                  onChange={(v) => updateData({ areaOfEffect: v as AbilityData['areaOfEffect'] })}
                >
                  <SelectOption value="single">Single Target</SelectOption>
                  <SelectOption value="line">Line</SelectOption>
                  <SelectOption value="cone">Cone</SelectOption>
                  <SelectOption value="circle">Circle</SelectOption>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Effects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Effects</CardTitle>
            <Button variant="secondary" size="sm" onClick={addEffect}>
              + Add Effect
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.effects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No effects yet. Add one to define what this {typeLabel.toLowerCase()} does!
              </p>
            ) : (
              data.effects.map((effect, i) => (
                <EffectEditor
                  key={effect.id}
                  effect={effect}
                  onChange={(e) => updateEffect(i, e)}
                  onRemove={() => removeEffect(i)}
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* Limits */}
        <Card>
          <CardHeader>
            <CardTitle>Cooldown & Limits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Cooldown (rounds)</label>
              <Input
                type="number"
                min={0}
                value={data.cooldown || 0}
                onChange={(e) => updateData({ cooldown: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                0 = no cooldown, can use every round
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Uses per Encounter</label>
                <Input
                  type="number"
                  min={0}
                  value={data.usesPerEncounter || ''}
                  onChange={(e) => updateData({ usesPerEncounter: parseInt(e.target.value) || undefined })}
                  placeholder="Unlimited"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Uses per Day</label>
                <Input
                  type="number"
                  min={0}
                  value={data.usesPerDay || ''}
                  onChange={(e) => updateData({ usesPerDay: parseInt(e.target.value) || undefined })}
                  placeholder="Unlimited"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flavor */}
        <Card>
          <CardHeader>
            <CardTitle>Flavor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Casting Description</label>
              <Textarea
                value={data.castingDescription || ''}
                onChange={(e) => updateData({ castingDescription: e.target.value })}
                placeholder="You raise your hands and..."
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Visual Effect</label>
              <Input
                value={data.visualEffect || ''}
                onChange={(e) => updateData({ visualEffect: e.target.value })}
                placeholder="A burst of flames erupts..."
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
          <AbilityPreview name={name} data={data} isSpell={isSpell} />
          <BalancePanel warnings={warnings} />
        </div>
      )}
    </div>
  );
}

export default AbilityCreator;
