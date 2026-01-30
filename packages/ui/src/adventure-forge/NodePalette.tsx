"use client";

/**
 * Node Palette Component
 * Drag-and-drop node creation toolbar
 */

import * as React from 'react';
import { cn } from '../lib/utils';
import type { NodeType } from './types';
import { NODE_CONFIGS } from './node-config';

export interface NodePaletteProps {
  onNodeDragStart: (type: NodeType) => void;
  onNodeDragEnd: (type: NodeType, position: { x: number; y: number } | null) => void;
  className?: string;
}

export function NodePalette({
  onNodeDragStart,
  onNodeDragEnd,
  className,
}: NodePaletteProps) {
  const [draggingType, setDraggingType] = React.useState<NodeType | null>(null);
  
  const handleDragStart = (type: NodeType) => (e: React.DragEvent) => {
    setDraggingType(type);
    e.dataTransfer.setData('nodeType', type);
    e.dataTransfer.effectAllowed = 'copy';
    onNodeDragStart(type);
  };
  
  const handleDragEnd = (type: NodeType) => (e: React.DragEvent) => {
    setDraggingType(null);
    
    // Get drop position from the drag event
    if (e.dataTransfer.dropEffect === 'copy') {
      onNodeDragEnd(type, { x: e.clientX, y: e.clientY });
    } else {
      onNodeDragEnd(type, null);
    }
  };
  
  const nodeTypes: NodeType[] = ['story', 'decision', 'challenge', 'combat', 'check'];
  
  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="text-sm font-semibold text-muted-foreground px-1 mb-3">
        Drag to Canvas
      </h3>
      
      {nodeTypes.map((type) => {
        const config = NODE_CONFIGS[type];
        const isDragging = draggingType === type;
        
        return (
          <div
            key={type}
            draggable
            onDragStart={handleDragStart(type)}
            onDragEnd={handleDragEnd(type)}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg cursor-grab active:cursor-grabbing",
              "bg-surface-elevated hover:bg-surface-divider transition-colors",
              "border border-transparent hover:border-surface-divider",
              isDragging && "opacity-50 border-bronze"
            )}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
              style={{ backgroundColor: config.color + '30' }}
            >
              {config.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{config.label}</p>
              <p className="text-xs text-muted-foreground truncate">
                {getNodeDescription(type)}
              </p>
            </div>
          </div>
        );
      })}
      
      <div className="pt-4 border-t border-surface-divider mt-4">
        <p className="text-xs text-muted-foreground px-1">
          💡 Tip: Double-click a node to edit its properties
        </p>
      </div>
    </div>
  );
}

function getNodeDescription(type: NodeType): string {
  switch (type) {
    case 'story':
      return 'Narrative text and exposition';
    case 'decision':
      return 'Player choices that branch the story';
    case 'challenge':
      return 'Attribute-based skill checks';
    case 'combat':
      return 'Enemy encounters and battles';
    case 'check':
      return 'Conditional logic (flags, items)';
  }
}

export default NodePalette;
