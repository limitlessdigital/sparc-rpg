"use client";

import { cn } from "../lib/utils";
import { Badge } from "../Badge";
import { Avatar } from "../Avatar";
import type { 
  EnemyCombatant, 
  PlayerCombatant, 
  Combatant,
} from "./types";
import { isAlive, getCombatantHP, getCombatantName, isPlayerCombatant } from "./types";

// Get initials from name
function getInitials(name: string): string {
  const parts = name.split(" ");
  if (parts.length === 1) return name.charAt(0).toUpperCase();
  return parts.map(p => p.charAt(0).toUpperCase()).slice(0, 2).join("");
}

export interface TargetSelectorProps {
  /** Available enemies to target */
  enemies: EnemyCombatant[];
  /** Available allies to target (for healing/buffs) */
  allies?: PlayerCombatant[];
  /** Currently selected target ID */
  selectedTargetId?: string;
  /** Whether targeting allies is allowed */
  allowAllyTarget?: boolean;
  /** Callback when target is selected */
  onSelectTarget: (targetId: string) => void;
  /** Whether selection is disabled */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
}

function TargetCard({
  combatant,
  isSelected,
  isEnemy,
  onClick,
  disabled,
}: {
  combatant: Combatant;
  isSelected: boolean;
  isEnemy: boolean;
  onClick: () => void;
  disabled: boolean;
}) {
  const alive = isAlive(combatant);
  const hp = getCombatantHP(combatant);
  const name = getCombatantName(combatant);
  const hpPercent = Math.max(0, (hp.current / hp.max) * 100);

  // Get creature image if enemy
  const imageUrl = !isPlayerCombatant(combatant) ? combatant.creature.imageUrl : undefined;

  return (
    <button
      onClick={onClick}
      disabled={disabled || !alive}
      className={cn(
        "relative p-4 rounded-lg border-2 transition-all text-left w-full",
        "hover:scale-[1.02] active:scale-[0.98]",
        isSelected && "ring-2 ring-gold border-gold bg-gold/10",
        !isSelected && alive && isEnemy && "border-error/50 bg-error/5 hover:border-error",
        !isSelected && alive && !isEnemy && "border-success/50 bg-success/5 hover:border-success",
        !alive && "opacity-40 cursor-not-allowed border-surface-divider",
        disabled && alive && "cursor-not-allowed opacity-60"
      )}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gold rounded-full flex items-center justify-center text-white text-sm">
          ✓
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* Avatar/Image */}
        <div className="relative">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className={cn(
                "w-12 h-12 rounded-lg object-cover",
                !alive && "grayscale"
              )}
            />
          ) : (
            <Avatar
              fallback={getInitials(name)}
              size="md"
              className={cn(!alive && "grayscale")}
            />
          )}
          {!alive && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
              <span className="text-lg">💀</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn(
              "font-semibold truncate",
              !alive && "line-through text-muted-foreground"
            )}>
              {name}
            </span>
            <Badge
              variant={isEnemy ? "error" : "success"}
              size="sm"
            >
              {isEnemy ? "Enemy" : "Ally"}
            </Badge>
          </div>

          {/* HP Bar */}
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">HP</span>
              <span className={cn(
                "font-medium tabular-nums",
                hpPercent > 50 ? "text-success" : hpPercent > 25 ? "text-warning" : "text-error"
              )}>
                {hp.current}/{hp.max}
              </span>
            </div>
            <div className="h-2 bg-surface-divider rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-300 rounded-full",
                  hpPercent > 50 ? "bg-success" : hpPercent > 25 ? "bg-warning" : "bg-error"
                )}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>

          {/* Conditions */}
          {combatant.conditions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {combatant.conditions.slice(0, 3).map((condition) => (
                <Badge key={condition.id} variant="outline" size="sm">
                  {getConditionIcon(condition.type)}
                </Badge>
              ))}
              {combatant.conditions.length > 3 && (
                <Badge variant="outline" size="sm">
                  +{combatant.conditions.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Target reticle for selected */}
        {isSelected && alive && (
          <div className="text-2xl animate-pulse">
            🎯
          </div>
        )}
      </div>
    </button>
  );
}

function getConditionIcon(type: string): string {
  const icons: Record<string, string> = {
    stunned: "😵",
    poisoned: "🤢",
    blessed: "✨",
    shielded: "🛡️",
    burning: "🔥",
    frozen: "❄️",
    weakened: "📉",
    strengthened: "📈",
  };
  return icons[type] || "⚠️";
}

export function TargetSelector({
  enemies,
  allies = [],
  selectedTargetId,
  allowAllyTarget = false,
  onSelectTarget,
  disabled = false,
  className,
}: TargetSelectorProps) {
  const aliveEnemies = enemies.filter(isAlive);
  const aliveAllies = allies.filter(isAlive);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Enemies section */}
      <div>
        <h4 className="text-sm font-semibold text-error mb-2 flex items-center gap-2">
          👹 Enemies
          <Badge variant="error" size="sm">
            {aliveEnemies.length} alive
          </Badge>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {enemies.map((enemy) => (
            <TargetCard
              key={enemy.id}
              combatant={enemy}
              isSelected={selectedTargetId === enemy.id}
              isEnemy={true}
              onClick={() => onSelectTarget(enemy.id)}
              disabled={disabled}
            />
          ))}
        </div>
        {enemies.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No enemies in combat
          </p>
        )}
      </div>

      {/* Allies section (if enabled) */}
      {allowAllyTarget && allies.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-success mb-2 flex items-center gap-2">
            👥 Allies
            <Badge variant="success" size="sm">
              {aliveAllies.length} alive
            </Badge>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allies.map((ally) => (
              <TargetCard
                key={ally.id}
                combatant={ally}
                isSelected={selectedTargetId === ally.id}
                isEnemy={false}
                onClick={() => onSelectTarget(ally.id)}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Compact inline target selector for quick selection
export function InlineTargetSelector({
  enemies,
  selectedTargetId,
  onSelectTarget,
  className,
}: {
  enemies: EnemyCombatant[];
  selectedTargetId?: string;
  onSelectTarget: (targetId: string) => void;
  className?: string;
}) {
  const aliveEnemies = enemies.filter(isAlive);

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {aliveEnemies.map((enemy) => {
        const name = getCombatantName(enemy);
        const isSelected = selectedTargetId === enemy.id;
        const hp = getCombatantHP(enemy);
        const hpPercent = (hp.current / hp.max) * 100;

        return (
          <button
            key={enemy.id}
            onClick={() => onSelectTarget(enemy.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
              isSelected && "border-gold bg-gold/10 ring-1 ring-gold",
              !isSelected && "border-surface-divider bg-surface-elevated hover:border-error"
            )}
          >
            <Avatar fallback={getInitials(name)} size="sm" />
            <div className="text-left">
              <div className="font-medium text-sm">{name}</div>
              <div className={cn(
                "text-xs tabular-nums",
                hpPercent > 50 ? "text-success" : hpPercent > 25 ? "text-warning" : "text-error"
              )}>
                {hp.current}/{hp.max} HP
              </div>
            </div>
            {isSelected && <span>🎯</span>}
          </button>
        );
      })}
    </div>
  );
}
