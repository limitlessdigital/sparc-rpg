/**
 * @sparc/ui Token Component
 * 
 * Individual token rendered on the map canvas.
 * Supports drag-and-drop movement, selection, and status indicators.
 */

import React, { useState, useCallback, useRef } from 'react';
import { cn } from '../lib/utils';
import type { MapToken, TokenCondition, TokenProps } from './types';
import { TOKEN_CONDITIONS } from './types';

// ============================================================================
// Token Component
// ============================================================================

export function Token({
  token,
  cellSize,
  isSelected,
  canControl,
  isSeer,
  onSelect,
  onMove,
  onEdit,
}: TokenProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const tokenRef = useRef<HTMLDivElement>(null);

  // Calculate pixel position
  const pixelX = token.x * cellSize;
  const pixelY = token.y * cellSize;
  const width = token.width * cellSize;
  const height = token.height * cellSize;

  // Hidden tokens only visible to Seer
  if (token.isHidden && !isSeer) {
    return null;
  }

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      
      if (!canControl) {
        onSelect();
        return;
      }

      onSelect();

      const rect = tokenRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
      setIsDragging(true);
    },
    [canControl, onSelect]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !canControl) return;

      const canvas = tokenRef.current?.parentElement;
      if (!canvas) return;

      const canvasRect = canvas.getBoundingClientRect();
      const newPixelX = e.clientX - canvasRect.left - dragOffset.x;
      const newPixelY = e.clientY - canvasRect.top - dragOffset.y;

      // Snap to grid
      const newGridX = Math.round(newPixelX / cellSize);
      const newGridY = Math.round(newPixelY / cellSize);

      // Clamp to canvas bounds (would need map dimensions)
      onMove(Math.max(0, newGridX), Math.max(0, newGridY));
    },
    [isDragging, canControl, cellSize, dragOffset, onMove]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (canControl || isSeer) {
        onEdit();
      }
    },
    [canControl, isSeer, onEdit]
  );

  // Get condition icons
  const conditionIcons = token.conditions
    .map((c) => TOKEN_CONDITIONS.find((tc) => tc.value === c))
    .filter(Boolean)
    .slice(0, 3); // Show max 3

  return (
    <div
      ref={tokenRef}
      className={cn(
        'absolute cursor-pointer transition-shadow',
        'rounded-lg overflow-hidden',
        isSelected && 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900',
        isDragging && 'z-50 shadow-xl scale-105',
        token.isHidden && 'opacity-50',
        !canControl && 'cursor-default'
      )}
      style={{
        left: pixelX,
        top: pixelY,
        width,
        height,
        backgroundColor: token.color,
        borderWidth: 3,
        borderColor: token.borderColor,
        borderStyle: 'solid',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
    >
      {/* Token Image */}
      {token.imageUrl ? (
        <img
          src={token.imageUrl}
          alt={token.name}
          className="w-full h-full object-cover pointer-events-none"
          draggable={false}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-xl font-bold text-white drop-shadow-md">
            {token.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      {/* HP Bar */}
      {token.showHpBar && token.hp !== undefined && token.maxHp !== undefined && (
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-900/80">
          <div
            className={cn(
              'h-full transition-all',
              token.hp / token.maxHp > 0.5
                ? 'bg-green-500'
                : token.hp / token.maxHp > 0.25
                ? 'bg-amber-500'
                : 'bg-red-500'
            )}
            style={{ width: `${Math.min(100, (token.hp / token.maxHp) * 100)}%` }}
          />
        </div>
      )}

      {/* Name Label */}
      {token.showName && (
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="px-1.5 py-0.5 text-xs font-medium bg-slate-900/90 text-white rounded">
            {token.name}
          </span>
        </div>
      )}

      {/* Condition Icons */}
      {conditionIcons.length > 0 && (
        <div className="absolute -top-1 -right-1 flex gap-0.5">
          {conditionIcons.map((condition) => (
            <span
              key={condition!.value}
              className="w-4 h-4 text-xs bg-slate-900/90 rounded-full flex items-center justify-center"
              title={condition!.label}
            >
              {condition!.icon}
            </span>
          ))}
        </div>
      )}

      {/* Hidden Indicator */}
      {token.isHidden && isSeer && (
        <div className="absolute top-0 left-0 w-4 h-4 bg-purple-600 rounded-br flex items-center justify-center">
          <span className="text-xs">👁</span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Token Palette Component
// ============================================================================

export interface TokenPaletteProps {
  onTokenSelect: (token: { name: string; color: string; imageUrl?: string }) => void;
}

export function TokenPalette({ onTokenSelect }: TokenPaletteProps) {
  const defaultTokens = [
    { name: 'Player', color: '#22c55e', icon: '👤' },
    { name: 'NPC', color: '#3b82f6', icon: '👥' },
    { name: 'Enemy', color: '#ef4444', icon: '👹' },
    { name: 'Monster', color: '#8b5cf6', icon: '🐉' },
    { name: 'Beast', color: '#f59e0b', icon: '🐺' },
    { name: 'Undead', color: '#6b7280', icon: '💀' },
    { name: 'Object', color: '#ca8a04', icon: '📦' },
    { name: 'Marker', color: '#ffffff', icon: '📍' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {defaultTokens.map((token) => (
        <button
          key={token.name}
          onClick={() => onTokenSelect(token)}
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            'border-2 border-slate-600 hover:border-amber-500',
            'bg-slate-800 hover:bg-slate-700 transition-colors',
            'cursor-grab active:cursor-grabbing'
          )}
          style={{ backgroundColor: token.color + '40' }}
          title={token.name}
        >
          <span className="text-lg">{token.icon}</span>
        </button>
      ))}
      <button
        onClick={() => onTokenSelect({ name: 'Custom', color: '#ffffff' })}
        className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center',
          'border-2 border-dashed border-slate-600 hover:border-amber-500',
          'bg-slate-800 hover:bg-slate-700 transition-colors'
        )}
        title="Custom Token"
      >
        <span className="text-lg">➕</span>
      </button>
    </div>
  );
}

// ============================================================================
// Token Properties Modal
// ============================================================================

export interface TokenPropertiesModalProps {
  token: MapToken | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (token: MapToken) => void;
  onDelete: (tokenId: string) => void;
  linkedCharacters?: Array<{ id: string; name: string }>;
}

export function TokenPropertiesModal({
  token,
  isOpen,
  onClose,
  onSave,
  onDelete,
  linkedCharacters = [],
}: TokenPropertiesModalProps) {
  const [editedToken, setEditedToken] = useState<MapToken | null>(null);

  React.useEffect(() => {
    if (token && isOpen) {
      setEditedToken({ ...token });
    }
  }, [token, isOpen]);

  if (!isOpen || !editedToken) return null;

  const handleSave = () => {
    if (editedToken) {
      onSave(editedToken);
      onClose();
    }
  };

  const handleDelete = () => {
    if (editedToken && confirm('Delete this token?')) {
      onDelete(editedToken.id);
      onClose();
    }
  };

  const toggleCondition = (condition: TokenCondition) => {
    setEditedToken((prev) => {
      if (!prev) return prev;
      const has = prev.conditions.includes(condition);
      return {
        ...prev,
        conditions: has
          ? prev.conditions.filter((c) => c !== condition)
          : [...prev.conditions, condition],
      };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Token Properties</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Name
            </label>
            <input
              type="text"
              value={editedToken.name}
              onChange={(e) =>
                setEditedToken((prev) => prev && { ...prev, name: e.target.value })
              }
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Size */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Size
            </label>
            <div className="flex gap-2">
              {[1, 2, 3].map((size) => (
                <button
                  key={size}
                  onClick={() =>
                    setEditedToken((prev) =>
                      prev && { ...prev, width: size, height: size }
                    )
                  }
                  className={cn(
                    'px-3 py-1.5 rounded-lg border transition-colors',
                    editedToken.width === size
                      ? 'bg-amber-600 border-amber-500 text-white'
                      : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
                  )}
                >
                  {size}×{size}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {['#22c55e', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#6b7280', '#ffffff'].map(
                (color) => (
                  <button
                    key={color}
                    onClick={() =>
                      setEditedToken((prev) => prev && { ...prev, color })
                    }
                    className={cn(
                      'w-8 h-8 rounded-lg border-2 transition-all',
                      editedToken.color === color
                        ? 'border-white scale-110'
                        : 'border-transparent hover:border-slate-500'
                    )}
                    style={{ backgroundColor: color }}
                  />
                )
              )}
            </div>
          </div>

          {/* HP */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Current HP
              </label>
              <input
                type="number"
                value={editedToken.hp ?? ''}
                onChange={(e) =>
                  setEditedToken((prev) =>
                    prev && { ...prev, hp: parseInt(e.target.value) || undefined }
                  )
                }
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Max HP
              </label>
              <input
                type="number"
                value={editedToken.maxHp ?? ''}
                onChange={(e) =>
                  setEditedToken((prev) =>
                    prev && { ...prev, maxHp: parseInt(e.target.value) || undefined }
                  )
                }
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editedToken.showName}
                onChange={(e) =>
                  setEditedToken((prev) =>
                    prev && { ...prev, showName: e.target.checked }
                  )
                }
                className="rounded border-slate-500 bg-slate-700 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-sm text-slate-300">Show Name</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editedToken.showHpBar}
                onChange={(e) =>
                  setEditedToken((prev) =>
                    prev && { ...prev, showHpBar: e.target.checked }
                  )
                }
                className="rounded border-slate-500 bg-slate-700 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-sm text-slate-300">Show HP Bar</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editedToken.isHidden}
                onChange={(e) =>
                  setEditedToken((prev) =>
                    prev && { ...prev, isHidden: e.target.checked }
                  )
                }
                className="rounded border-slate-500 bg-slate-700 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-sm text-slate-300">Hidden (Seer only)</span>
            </label>
          </div>

          {/* Conditions */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Conditions
            </label>
            <div className="flex flex-wrap gap-1">
              {TOKEN_CONDITIONS.slice(0, 8).map((condition) => (
                <button
                  key={condition.value}
                  onClick={() => toggleCondition(condition.value)}
                  className={cn(
                    'px-2 py-1 text-xs rounded-full border transition-colors',
                    editedToken.conditions.includes(condition.value)
                      ? 'bg-amber-600/30 border-amber-500 text-amber-300'
                      : 'bg-slate-700 border-slate-600 text-slate-400 hover:border-slate-500'
                  )}
                >
                  {condition.icon} {condition.label}
                </button>
              ))}
            </div>
          </div>

          {/* Link to Character */}
          {linkedCharacters.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Link to Character
              </label>
              <select
                value={editedToken.characterId || ''}
                onChange={(e) =>
                  setEditedToken((prev) =>
                    prev && { ...prev, characterId: e.target.value || undefined }
                  )
                }
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">No link</option>
                {linkedCharacters.map((char) => (
                  <option key={char.id} value={char.id}>
                    {char.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-red-400 hover:text-red-300 transition-colors"
          >
            Delete Token
          </button>
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
