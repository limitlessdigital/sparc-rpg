"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from "../Modal";
import type { Condition, ConditionType } from "./types";

// Condition definitions
export const CONDITIONS: Record<ConditionType, {
  name: string;
  icon: string;
  description: string;
  color: string;
}> = {
  stunned: {
    name: "Stunned",
    icon: "😵",
    description: "Cannot take actions. Attacks against you have advantage.",
    color: "text-purple-400",
  },
  poisoned: {
    name: "Poisoned",
    icon: "🤢",
    description: "Take 1 damage at the start of each turn. -1 to all rolls.",
    color: "text-green-500",
  },
  blessed: {
    name: "Blessed",
    icon: "✨",
    description: "+1 to all rolls. Radiate light.",
    color: "text-gold",
  },
  shielded: {
    name: "Shielded",
    icon: "🛡️",
    description: "+2 to defense rolls. Negate first hit.",
    color: "text-blue-400",
  },
  burning: {
    name: "Burning",
    icon: "🔥",
    description: "Take 2 damage at the start of each turn. Can spread.",
    color: "text-orange-500",
  },
  frozen: {
    name: "Frozen",
    icon: "❄️",
    description: "Movement halved. -2 to Grace rolls.",
    color: "text-cyan-400",
  },
  weakened: {
    name: "Weakened",
    icon: "📉",
    description: "-2 to damage dealt. Exhausted.",
    color: "text-gray-400",
  },
  strengthened: {
    name: "Strengthened",
    icon: "📈",
    description: "+2 to damage dealt. Feel empowered.",
    color: "text-red-400",
  },
};

export interface ConditionManagerProps {
  /** Current conditions */
  conditions: Condition[];
  /** Whether editing is allowed */
  editable?: boolean;
  /** Callback when condition is added */
  onAddCondition?: (type: ConditionType, duration: number) => void;
  /** Callback when condition is removed */
  onRemoveCondition?: (conditionId: string) => void;
  /** Compact display mode */
  compact?: boolean;
  /** Custom class name */
  className?: string;
}

export function ConditionManager({
  conditions,
  editable = false,
  onAddCondition,
  onRemoveCondition,
  compact = false,
  className,
}: ConditionManagerProps) {
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [selectedType, setSelectedType] = React.useState<ConditionType | null>(null);
  const [duration, setDuration] = React.useState(3);

  const handleAddCondition = () => {
    if (selectedType && onAddCondition) {
      onAddCondition(selectedType, duration);
      setShowAddModal(false);
      setSelectedType(null);
      setDuration(3);
    }
  };

  if (compact) {
    return (
      <div className={cn("flex flex-wrap gap-1", className)}>
        {conditions.map((condition) => {
          const info = CONDITIONS[condition.type];
          return (
            <Badge
              key={condition.id}
              variant="outline"
              size="sm"
              className={cn(info.color, "gap-1")}
              title={`${info.name}: ${info.description} (${condition.duration} rounds)`}
            >
              {info.icon}
              {condition.duration > 0 && (
                <span className="text-xs">{condition.duration}</span>
              )}
            </Badge>
          );
        })}
        {conditions.length === 0 && (
          <span className="text-xs text-muted-foreground">No conditions</span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          ⚠️ Conditions
          {conditions.length > 0 && (
            <Badge variant="outline" size="sm">
              {conditions.length}
            </Badge>
          )}
        </h4>
        {editable && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAddModal(true)}
          >
            + Add
          </Button>
        )}
      </div>

      {/* Conditions list */}
      <div className="space-y-2">
        {conditions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-2">
            No active conditions
          </p>
        ) : (
          conditions.map((condition) => {
            const info = CONDITIONS[condition.type];
            return (
              <div
                key={condition.id}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg border",
                  "bg-surface-elevated border-surface-divider"
                )}
              >
                <span className="text-xl">{info.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("font-medium", info.color)}>
                      {info.name}
                    </span>
                    <Badge variant="outline" size="sm">
                      {condition.duration} {condition.duration === 1 ? "round" : "rounds"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {info.description}
                  </p>
                </div>
                {editable && onRemoveCondition && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveCondition(condition.id)}
                    className="text-error hover:text-error"
                  >
                    ✕
                  </Button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add condition modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <ModalHeader>
          <ModalTitle>Add Condition</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {/* Condition type selector */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Condition Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(CONDITIONS) as ConditionType[]).map((type) => {
                  const info = CONDITIONS[type];
                  const isSelected = selectedType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg border text-left transition-all",
                        isSelected && "border-gold bg-gold/10 ring-1 ring-gold",
                        !isSelected && "border-surface-divider hover:border-surface-active"
                      )}
                    >
                      <span className="text-lg">{info.icon}</span>
                      <span className={cn("font-medium text-sm", info.color)}>
                        {info.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duration selector */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Duration (rounds)
              </label>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDuration(Math.max(1, duration - 1))}
                  disabled={duration <= 1}
                >
                  −
                </Button>
                <span className="w-12 text-center font-bold text-lg">
                  {duration}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDuration(Math.min(10, duration + 1))}
                  disabled={duration >= 10}
                >
                  +
                </Button>
                <span className="text-sm text-muted-foreground ml-2">
                  {duration === 1 ? "round" : "rounds"}
                </span>
              </div>
            </div>

            {/* Selected condition description */}
            {selectedType && (
              <div className="p-3 bg-surface-elevated rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span>{CONDITIONS[selectedType].icon}</span>
                  <span className={cn("font-semibold", CONDITIONS[selectedType].color)}>
                    {CONDITIONS[selectedType].name}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {CONDITIONS[selectedType].description}
                </p>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddCondition}
            disabled={!selectedType}
          >
            Add Condition
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

// Inline condition badges for compact display
export function ConditionBadges({
  conditions,
  onRemove,
  className,
}: {
  conditions: Condition[];
  onRemove?: (id: string) => void;
  className?: string;
}) {
  if (conditions.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {conditions.map((condition) => {
        const info = CONDITIONS[condition.type];
        return (
          <Badge
            key={condition.id}
            variant="outline"
            size="sm"
            className={cn(
              info.color,
              "gap-1",
              onRemove && "cursor-pointer hover:bg-error/10"
            )}
            onClick={onRemove ? () => onRemove(condition.id) : undefined}
          >
            {info.icon}
            <span>{info.name}</span>
            <span className="opacity-70">({condition.duration})</span>
          </Badge>
        );
      })}
    </div>
  );
}
