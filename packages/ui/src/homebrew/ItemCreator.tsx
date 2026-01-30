/**
 * ItemCreator - Create custom items for SPARC RPG
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
  ItemData,
  StatModifier,
  SpecialEffect,
  ItemType,
  ItemRarity,
  WeaponType,
  DamageType,
  Attribute,
  BalanceWarning,
  ITEM_TYPES,
  ITEM_RARITIES,
  WEAPON_TYPES,
  DAMAGE_TYPES,
  ATTRIBUTES,
} from "./types";
import { calculateItemPowerLevel, validateItemBalance } from "./balance";

// ============================================
// Props & Types
// ============================================

export interface ItemCreatorProps {
  /** Initial item data (for editing) */
  initialData?: Partial<ItemData>;
  /** Called when item is saved */
  onSave: (name: string, description: string, data: ItemData, tags: string[], asDraft?: boolean) => void;
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

const DEFAULT_ITEM: ItemData = {
  itemType: 'weapon',
  rarity: 'common',
  statModifiers: [],
  specialEffects: [],
  requirements: [],
};

// ============================================
// Sub-Components
// ============================================

function StatModifierEditor({
  modifier,
  onChange,
  onRemove,
}: {
  modifier: StatModifier;
  onChange: (m: StatModifier) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Select
        value={modifier.attribute}
        onChange={(v) => onChange({ ...modifier, attribute: v as Attribute })}
        className="flex-1"
      >
        {ATTRIBUTES.map(attr => (
          <SelectOption key={attr.value} value={attr.value}>
            {attr.icon} {attr.label}
          </SelectOption>
        ))}
      </Select>
      <Input
        type="number"
        min={-5}
        max={5}
        value={modifier.modifier}
        onChange={(e) => onChange({ ...modifier, modifier: parseInt(e.target.value) || 0 })}
        className="w-20"
      />
      <Button variant="ghost" size="sm" onClick={onRemove} className="text-destructive">✕</Button>
    </div>
  );
}

function SpecialEffectEditor({
  effect,
  onChange,
  onRemove,
}: {
  effect: SpecialEffect;
  onChange: (e: SpecialEffect) => void;
  onRemove: () => void;
}) {
  const triggers = [
    { value: 'always', label: 'Always Active' },
    { value: 'on_hit', label: 'On Hit' },
    { value: 'on_crit', label: 'On Critical Hit' },
    { value: 'on_use', label: 'On Use' },
    { value: 'on_damage', label: 'When Taking Damage' },
  ];

  return (
    <div className="p-4 bg-surface-elevated rounded-lg border border-surface-divider space-y-3">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1 block">Effect Name</label>
          <Input
            value={effect.name}
            onChange={(e) => onChange({ ...effect, name: e.target.value })}
            placeholder="e.g., Frostbite"
          />
        </div>
        <Button variant="ghost" size="sm" onClick={onRemove} className="mt-5 text-destructive">✕</Button>
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Trigger</label>
        <Select
          value={effect.trigger}
          onChange={(v) => onChange({ ...effect, trigger: v as SpecialEffect['trigger'] })}
        >
          {triggers.map(t => (
            <SelectOption key={t.value} value={t.value}>{t.label}</SelectOption>
          ))}
        </Select>
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Description</label>
        <Textarea
          value={effect.description}
          onChange={(e) => onChange({ ...effect, description: e.target.value })}
          placeholder="Describe the effect..."
          rows={2}
        />
      </div>
    </div>
  );
}

function ItemPreview({ name, data }: { name: string; data: ItemData }) {
  const rarityConfig = ITEM_RARITIES.find(r => r.value === data.rarity);
  const powerLevel = calculateItemPowerLevel(data);

  return (
    <Card className="sticky top-4">
      <CardHeader className="text-center pb-2">
        <div className="text-4xl mb-2">
          {data.itemType === 'weapon' ? '🗡️' : 
           data.itemType === 'armor' ? '🛡️' : 
           data.itemType === 'consumable' ? '🧪' :
           data.itemType === 'accessory' ? '💍' :
           data.itemType === 'artifact' ? '✨' : '🔧'}
        </div>
        <CardTitle className={cn("text-xl", rarityConfig?.color)}>
          {name || 'Unnamed Item'}
        </CardTitle>
        <p className="text-sm text-muted-foreground capitalize">
          {data.rarity} {data.weaponType || data.itemType}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        {(data.diceBonus || data.armorBonus || (data.statModifiers && data.statModifiers.length > 0)) && (
          <div className="space-y-1">
            {data.diceBonus && (
              <p className="text-sm">
                <span className="text-bronze font-medium">+{data.diceBonus}</span> attack dice
              </p>
            )}
            {data.armorBonus && (
              <p className="text-sm">
                <span className="text-blue-400 font-medium">+{data.armorBonus}</span> armor
              </p>
            )}
            {data.statModifiers?.map((mod, i) => (
              <p key={i} className="text-sm">
                <span className={mod.modifier > 0 ? 'text-green-400' : 'text-red-400'}>
                  {mod.modifier > 0 ? '+' : ''}{mod.modifier}
                </span> {mod.attribute}
              </p>
            ))}
          </div>
        )}

        {/* Special Effects */}
        {data.specialEffects && data.specialEffects.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2">SPECIAL EFFECTS</h4>
            {data.specialEffects.map((effect, i) => (
              <div key={i} className="mb-2">
                <p className="text-sm font-medium text-purple-400">
                  • {effect.name}
                  <span className="text-muted-foreground font-normal">
                    {' '}({effect.trigger.replace('_', ' ')})
                  </span>
                </p>
                <p className="text-xs text-muted-foreground ml-3">{effect.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Flavor */}
        {data.flavorText && (
          <p className="text-sm italic text-muted-foreground border-l-2 border-bronze/50 pl-3">
            "{data.flavorText}"
          </p>
        )}

        {/* Requirements */}
        {data.requirements && data.requirements.length > 0 && (
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Requires: </span>
            {data.requirements.map((req, i) => (
              <span key={i}>
                {req.type === 'attribute' ? `${req.attribute} ${req.minValue}+` : req.class}
                {i < data.requirements!.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        )}

        {/* Value */}
        {data.value && (
          <p className="text-sm text-amber-400">💰 {data.value} gold</p>
        )}

        {/* Power Level */}
        <div className="pt-2 border-t border-surface-divider">
          <p className="text-xs text-muted-foreground">
            Power Level: <span className="text-bronze font-medium">{powerLevel}/5</span>
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
        <p className="text-green-400 text-sm">✅ Item looks balanced for its rarity</p>
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

export function ItemCreator({
  initialData,
  onSave,
  onCancel,
  showPreview = true,
  className,
}: ItemCreatorProps) {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [tags, setTags] = React.useState<string[]>([]);
  const [tagInput, setTagInput] = React.useState('');
  const [data, setData] = React.useState<ItemData>({
    ...DEFAULT_ITEM,
    ...initialData,
  });

  const warnings = React.useMemo(() => validateItemBalance(data), [data]);

  const updateData = (updates: Partial<ItemData>) => {
    setData(d => ({ ...d, ...updates }));
  };

  const addStatModifier = () => {
    updateData({
      statModifiers: [
        ...(data.statModifiers || []),
        { attribute: 'might', modifier: 1 },
      ],
    });
  };

  const updateStatModifier = (index: number, mod: StatModifier) => {
    const mods = [...(data.statModifiers || [])];
    mods[index] = mod;
    updateData({ statModifiers: mods });
  };

  const removeStatModifier = (index: number) => {
    updateData({
      statModifiers: (data.statModifiers || []).filter((_, i) => i !== index),
    });
  };

  const addSpecialEffect = () => {
    updateData({
      specialEffects: [
        ...(data.specialEffects || []),
        { id: `effect_${Date.now()}`, name: '', description: '', trigger: 'on_hit' },
      ],
    });
  };

  const updateSpecialEffect = (index: number, effect: SpecialEffect) => {
    const effects = [...(data.specialEffects || [])];
    effects[index] = effect;
    updateData({ specialEffects: effects });
  };

  const removeSpecialEffect = (index: number) => {
    updateData({
      specialEffects: (data.specialEffects || []).filter((_, i) => i !== index),
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
    onSave(name, description, data, tags, asDraft);
  };

  const isWeapon = data.itemType === 'weapon';
  const isArmor = data.itemType === 'armor' || data.itemType === 'shield';

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
              <label className="text-sm font-medium mb-1 block">Item Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Frostbrand Dagger"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Type</label>
                <Select
                  value={data.itemType}
                  onChange={(v) => updateData({ itemType: v as ItemType })}
                >
                  {ITEM_TYPES.map(type => (
                    <SelectOption key={type.value} value={type.value}>
                      {type.label}
                    </SelectOption>
                  ))}
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Rarity</label>
                <Select
                  value={data.rarity}
                  onChange={(v) => updateData({ rarity: v as ItemRarity })}
                >
                  {ITEM_RARITIES.map(rarity => (
                    <SelectOption key={rarity.value} value={rarity.value}>
                      {rarity.label}
                    </SelectOption>
                  ))}
                </Select>
              </div>
            </div>

            {/* Weapon-specific options */}
            {isWeapon && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Weapon Type</label>
                  <Select
                    value={data.weaponType || 'sword'}
                    onChange={(v) => updateData({ weaponType: v as WeaponType })}
                  >
                    {WEAPON_TYPES.map(type => (
                      <SelectOption key={type.value} value={type.value}>
                        {type.label}
                      </SelectOption>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Damage Type</label>
                  <Select
                    value={data.damageType || 'physical'}
                    onChange={(v) => updateData({ damageType: v as DamageType })}
                  >
                    {DAMAGE_TYPES.map(type => (
                      <SelectOption key={type.value} value={type.value}>
                        {type.label}
                      </SelectOption>
                    ))}
                  </Select>
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A blade of eternal ice..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Stats & Bonuses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isWeapon && (
              <div>
                <label className="text-sm font-medium mb-1 block">Dice Bonus</label>
                <Input
                  type="number"
                  min={0}
                  max={5}
                  value={data.diceBonus || 0}
                  onChange={(e) => updateData({ diceBonus: parseInt(e.target.value) || 0 })}
                  placeholder="Extra dice on attacks"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Added to attack rolls when using this weapon
                </p>
              </div>
            )}

            {isArmor && (
              <div>
                <label className="text-sm font-medium mb-1 block">Armor Bonus</label>
                <Input
                  type="number"
                  min={0}
                  max={10}
                  value={data.armorBonus || 0}
                  onChange={(e) => updateData({ armorBonus: parseInt(e.target.value) || 0 })}
                  placeholder="AC bonus"
                />
              </div>
            )}

            {/* Stat Modifiers */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Stat Modifiers</label>
                <Button variant="secondary" size="sm" onClick={addStatModifier}>
                  + Add
                </Button>
              </div>
              <div className="space-y-2">
                {(data.statModifiers || []).map((mod, i) => (
                  <StatModifierEditor
                    key={i}
                    modifier={mod}
                    onChange={(m) => updateStatModifier(i, m)}
                    onRemove={() => removeStatModifier(i)}
                  />
                ))}
                {(!data.statModifiers || data.statModifiers.length === 0) && (
                  <p className="text-sm text-muted-foreground">No stat modifiers</p>
                )}
              </div>
            </div>

            {/* Consumable options */}
            {data.itemType === 'consumable' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Uses</label>
                  <Input
                    type="number"
                    min={1}
                    value={data.uses || 1}
                    onChange={(e) => updateData({ uses: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="consumable"
                    checked={data.consumable ?? true}
                    onChange={(e) => updateData({ consumable: e.target.checked })}
                    className="accent-bronze"
                  />
                  <label htmlFor="consumable" className="text-sm">Consumed on use</label>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Special Effects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Special Effects</CardTitle>
            <Button variant="secondary" size="sm" onClick={addSpecialEffect}>
              + Add Effect
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {(!data.specialEffects || data.specialEffects.length === 0) ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No special effects. Add one to make your item unique!
              </p>
            ) : (
              data.specialEffects.map((effect, i) => (
                <SpecialEffectEditor
                  key={effect.id}
                  effect={effect}
                  onChange={(e) => updateSpecialEffect(i, e)}
                  onRemove={() => removeSpecialEffect(i)}
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* Flavor & Lore */}
        <Card>
          <CardHeader>
            <CardTitle>Flavor & Lore</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Flavor Text</label>
              <Textarea
                value={data.flavorText || ''}
                onChange={(e) => updateData({ flavorText: e.target.value })}
                placeholder="A short, evocative description..."
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Lore</label>
              <Textarea
                value={data.lore || ''}
                onChange={(e) => updateData({ lore: e.target.value })}
                placeholder="The history and origin of this item..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Value (gold)</label>
                <Input
                  type="number"
                  min={0}
                  value={data.value || 0}
                  onChange={(e) => updateData({ value: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Weight (lbs)</label>
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={data.weight || 0}
                  onChange={(e) => updateData({ weight: parseFloat(e.target.value) || 0 })}
                />
              </div>
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
          <ItemPreview name={name} data={data} />
          <BalancePanel warnings={warnings} />
        </div>
      )}
    </div>
  );
}

export default ItemCreator;
