"use client";

/**
 * Validation Panel Component
 * Based on PRD 11: Validation System
 * 
 * Shows real-time validation errors, warnings, and adventure stats.
 */

import * as React from 'react';
import { cn } from '../lib/utils';
import type {
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from './types';
import { Badge } from '../Badge';

export interface ValidationPanelProps {
  validation: ValidationResult;
  onNodeClick?: (nodeId: string) => void;
  className?: string;
}

export function ValidationPanel({
  validation,
  onNodeClick,
  className,
}: ValidationPanelProps) {
  const [expandedSection, setExpandedSection] = React.useState<'errors' | 'warnings' | 'stats' | null>(
    validation.errors.length > 0 ? 'errors' : validation.warnings.length > 0 ? 'warnings' : 'stats'
  );
  
  return (
    <div className={cn("space-y-3", className)}>
      {/* Status Header */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated">
        <div className="flex items-center gap-2">
          <span className="text-lg">
            {validation.isValid ? '✅' : '❌'}
          </span>
          <span className="font-semibold">
            {validation.isValid ? 'Valid' : 'Issues Found'}
          </span>
        </div>
        <Badge variant={validation.canPublish ? 'success' : 'error'}>
          {validation.canPublish ? 'Ready to Publish' : 'Cannot Publish'}
        </Badge>
      </div>
      
      {/* Errors Section */}
      {validation.errors.length > 0 && (
        <CollapsibleSection
          title={`Errors (${validation.errors.length})`}
          icon="🚫"
          isExpanded={expandedSection === 'errors'}
          onToggle={() => setExpandedSection(expandedSection === 'errors' ? null : 'errors')}
          variant="error"
        >
          <div className="space-y-2">
            {validation.errors.map((error, index) => (
              <ValidationItem
                key={`${error.code}-${error.nodeId || index}`}
                item={error}
                onClick={() => error.nodeId && onNodeClick?.(error.nodeId)}
              />
            ))}
          </div>
        </CollapsibleSection>
      )}
      
      {/* Warnings Section */}
      {validation.warnings.length > 0 && (
        <CollapsibleSection
          title={`Warnings (${validation.warnings.length})`}
          icon="⚠️"
          isExpanded={expandedSection === 'warnings'}
          onToggle={() => setExpandedSection(expandedSection === 'warnings' ? null : 'warnings')}
          variant="warning"
        >
          <div className="space-y-2">
            {validation.warnings.map((warning, index) => (
              <ValidationItem
                key={`${warning.code}-${warning.nodeId || index}`}
                item={warning}
                onClick={() => warning.nodeId && onNodeClick?.(warning.nodeId)}
              />
            ))}
          </div>
        </CollapsibleSection>
      )}
      
      {/* Stats Section */}
      <CollapsibleSection
        title="Adventure Stats"
        icon="📊"
        isExpanded={expandedSection === 'stats'}
        onToggle={() => setExpandedSection(expandedSection === 'stats' ? null : 'stats')}
        variant="info"
      >
        <div className="grid grid-cols-2 gap-2 text-sm">
          <StatItem label="Nodes" value={validation.stats.nodeCount} />
          <StatItem label="Connections" value={validation.stats.connectionCount} />
          <StatItem label="Decision Points" value={validation.stats.decisionPoints} />
          <StatItem label="Combat Encounters" value={validation.stats.combatEncounters} />
          <StatItem label="Challenges" value={validation.stats.challengeCount} />
          <StatItem 
            label="Est. Duration" 
            value={`${validation.stats.estimatedDurationMinutes} min`} 
          />
          <StatItem 
            label="Shortest Path" 
            value={validation.stats.shortestPath || '-'} 
          />
          <StatItem 
            label="Longest Path" 
            value={validation.stats.longestPath || '-'} 
          />
        </div>
      </CollapsibleSection>
      
      {/* All Clear Message */}
      {validation.errors.length === 0 && validation.warnings.length === 0 && (
        <div className="p-4 bg-success/10 rounded-lg text-center">
          <span className="text-2xl">🎉</span>
          <p className="text-sm font-medium mt-2">Adventure looks great!</p>
          <p className="text-xs text-muted-foreground mt-1">
            No issues found. Ready to publish.
          </p>
        </div>
      )}
    </div>
  );
}

// Collapsible section component
interface CollapsibleSectionProps {
  title: string;
  icon: string;
  isExpanded: boolean;
  onToggle: () => void;
  variant: 'error' | 'warning' | 'info';
  children: React.ReactNode;
}

function CollapsibleSection({
  title,
  icon,
  isExpanded,
  onToggle,
  variant,
  children,
}: CollapsibleSectionProps) {
  const bgColors = {
    error: 'bg-error/10',
    warning: 'bg-warning/10',
    info: 'bg-surface-elevated',
  };
  
  return (
    <div className="rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between p-3 text-left",
          "hover:opacity-80 transition-opacity",
          bgColors[variant]
        )}
      >
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <span className="font-medium text-sm">{title}</span>
        </div>
        <span className="text-muted-foreground">
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>
      
      {isExpanded && (
        <div className={cn("p-3 border-t border-surface-divider", bgColors[variant])}>
          {children}
        </div>
      )}
    </div>
  );
}

// Validation item component
interface ValidationItemProps {
  item: ValidationError | ValidationWarning;
  onClick?: () => void;
}

function ValidationItem({ item, onClick }: ValidationItemProps) {
  const isError = item.severity === 'error';
  
  return (
    <div
      onClick={onClick}
      className={cn(
        "p-2 rounded text-sm",
        "border border-surface-divider bg-surface-card",
        onClick && "cursor-pointer hover:bg-surface-elevated transition-colors"
      )}
    >
      <div className="flex items-start gap-2">
        <span className={cn(
          "shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs",
          isError ? "bg-error/20 text-error" : "bg-warning/20 text-warning"
        )}>
          {isError ? '!' : '?'}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-medium">{item.message}</p>
          {'suggestion' in item && item.suggestion && (
            <p className="text-xs text-muted-foreground mt-1">
              💡 {item.suggestion}
            </p>
          )}
          {item.nodeId && (
            <p className="text-xs text-muted-foreground mt-1">
              📍 Click to navigate to node
            </p>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground shrink-0">
          {item.code}
        </span>
      </div>
    </div>
  );
}

// Stat item component
function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center p-2 bg-surface-card rounded">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default ValidationPanel;
