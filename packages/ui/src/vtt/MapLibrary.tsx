/**
 * @sparc/ui Map Library Components
 * 
 * Map browsing, creation, and management UI.
 */

import React, { useState, useCallback, useRef } from 'react';
import { cn } from '../lib/utils';
import type { VttMap, MapTemplate } from './types';
import { MAP_TEMPLATES } from './types';

// ============================================================================
// Map Library Component
// ============================================================================

export interface MapLibraryProps {
  maps: VttMap[];
  templates?: MapTemplate[];
  selectedMapId?: string;
  onMapSelect: (mapId: string) => void;
  onMapCreate: () => void;
  onMapEdit: (mapId: string) => void;
  onMapDelete: (mapId: string) => void;
  onMapDuplicate: (mapId: string) => void;
  className?: string;
}

export function MapLibrary({
  maps,
  templates = MAP_TEMPLATES,
  selectedMapId,
  onMapSelect,
  onMapCreate,
  onMapEdit,
  onMapDelete,
  onMapDuplicate,
  className,
}: MapLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  const filteredMaps = maps.filter((map) =>
    map.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    map.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">Map Library</h2>
          <button
            onClick={onMapCreate}
            className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-500 transition-colors"
          >
            + New Map
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search maps..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />

        {/* Tabs */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setShowTemplates(false)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm transition-colors',
              !showTemplates
                ? 'bg-amber-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            )}
          >
            My Maps ({maps.length})
          </button>
          <button
            onClick={() => setShowTemplates(true)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm transition-colors',
              showTemplates
                ? 'bg-amber-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            )}
          >
            Templates ({templates.length})
          </button>
        </div>
      </div>

      {/* Map Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {showTemplates ? (
          <div className="grid grid-cols-2 gap-4">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onClick={() => {
                  // TODO: Create map from template
                  onMapCreate();
                }}
              />
            ))}
          </div>
        ) : filteredMaps.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            {searchQuery ? 'No maps found' : 'No maps yet. Create your first map!'}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredMaps.map((map) => (
              <MapCard
                key={map.id}
                map={map}
                isSelected={selectedMapId === map.id}
                onSelect={() => onMapSelect(map.id)}
                onEdit={() => onMapEdit(map.id)}
                onDelete={() => onMapDelete(map.id)}
                onDuplicate={() => onMapDuplicate(map.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Map Card Component
// ============================================================================

interface MapCardProps {
  map: VttMap;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function MapCard({
  map,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
}: MapCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className={cn(
        'relative rounded-lg overflow-hidden border transition-all cursor-pointer group',
        isSelected
          ? 'border-amber-500 ring-2 ring-amber-500/30'
          : 'border-slate-700 hover:border-slate-600'
      )}
      onClick={onSelect}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-slate-800 relative">
        {map.imageUrl ? (
          <img
            src={map.imageUrl}
            alt={map.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl text-slate-600">🗺️</span>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="px-3 py-1.5 bg-amber-600 text-white rounded text-sm hover:bg-amber-500"
          >
            Use
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="px-3 py-1.5 bg-slate-600 text-white rounded text-sm hover:bg-slate-500"
          >
            Edit
          </button>
        </div>

        {/* Menu Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="absolute top-2 right-2 w-6 h-6 bg-slate-900/80 rounded flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          ⋮
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div
            className="absolute top-10 right-2 bg-slate-800 border border-slate-700 rounded-lg py-1 min-w-[120px] shadow-xl z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setShowMenu(false);
                onEdit();
              }}
              className="w-full px-3 py-1.5 text-left text-sm text-slate-300 hover:bg-slate-700"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => {
                setShowMenu(false);
                onDuplicate();
              }}
              className="w-full px-3 py-1.5 text-left text-sm text-slate-300 hover:bg-slate-700"
            >
              📋 Duplicate
            </button>
            <button
              onClick={() => {
                setShowMenu(false);
                if (confirm('Delete this map?')) {
                  onDelete();
                }
              }}
              className="w-full px-3 py-1.5 text-left text-sm text-red-400 hover:bg-slate-700"
            >
              🗑️ Delete
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 bg-slate-800">
        <h3 className="font-medium text-white text-sm truncate">{map.name}</h3>
        <p className="text-xs text-slate-400 mt-1">
          {map.gridColumns}×{map.gridRows} grid
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Template Card Component
// ============================================================================

interface TemplateCardProps {
  template: MapTemplate;
  onClick: () => void;
}

function TemplateCard({ template, onClick }: TemplateCardProps) {
  return (
    <div
      className="rounded-lg overflow-hidden border border-slate-700 hover:border-amber-500 transition-colors cursor-pointer"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-slate-800 relative">
        {template.imageUrl ? (
          <img
            src={template.imageUrl}
            alt={template.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
            <span className="text-4xl">
              {template.category === 'interior' && '🏠'}
              {template.category === 'exterior' && '🌲'}
              {template.category === 'dungeon' && '⚔️'}
              {template.category === 'special' && '✨'}
            </span>
          </div>
        )}

        {/* Category Badge */}
        <span className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900/80 text-slate-300 text-xs rounded capitalize">
          {template.category}
        </span>
      </div>

      {/* Info */}
      <div className="p-3 bg-slate-800">
        <h3 className="font-medium text-white text-sm">{template.name}</h3>
        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
          {template.description}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          {template.gridColumns}×{template.gridRows} grid
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Map Creator Modal
// ============================================================================

export interface MapCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (map: Omit<VttMap, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => void;
  existingMap?: VttMap;
}

export function MapCreator({
  isOpen,
  onClose,
  onSave,
  existingMap,
}: MapCreatorProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(existingMap?.name || '');
  const [description, setDescription] = useState(existingMap?.description || '');
  const [imageUrl, setImageUrl] = useState(existingMap?.imageUrl || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(existingMap?.imageUrl || null);
  const [gridColumns, setGridColumns] = useState(existingMap?.gridColumns || 10);
  const [gridRows, setGridRows] = useState(existingMap?.gridRows || 10);
  const [gridOffsetX, setGridOffsetX] = useState(existingMap?.gridOffsetX || 0);
  const [gridOffsetY, setGridOffsetY] = useState(existingMap?.gridOffsetY || 0);
  const [gridColor, setGridColor] = useState(existingMap?.gridColor || '#ffffff');
  const [gridOpacity, setGridOpacity] = useState(existingMap?.gridOpacity || 0.3);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSave = useCallback(() => {
    // TODO: Upload image to storage and get URL
    const finalImageUrl = imagePreview || imageUrl;

    onSave({
      name,
      description,
      imageUrl: finalImageUrl,
      imageWidth: 800,
      imageHeight: 600,
      gridColumns,
      gridRows,
      gridOffsetX,
      gridOffsetY,
      gridColor,
      gridOpacity,
      isTemplate: false,
      tags: [],
    });

    onClose();
  }, [
    name,
    description,
    imageUrl,
    imagePreview,
    gridColumns,
    gridRows,
    gridOffsetX,
    gridOffsetY,
    gridColor,
    gridOpacity,
    onSave,
    onClose,
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">
            {existingMap ? 'Edit Map' : 'Create New Map'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {step === 1 && (
            <div className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Map Image
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                    imagePreview
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'
                  )}
                >
                  {imagePreview ? (
                    <div className="space-y-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded"
                      />
                      <p className="text-sm text-slate-400">Click to change</p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-4xl block mb-2">📁</span>
                      <p className="text-slate-300">Drop image here or click to browse</p>
                      <p className="text-sm text-slate-500 mt-1">
                        PNG, JPG, WebP (max 10MB)
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Or URL */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Or enter image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImagePreview(e.target.value);
                  }}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Quick Templates */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Or start from template
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {MAP_TEMPLATES.slice(0, 4).map((template) => (
                    <button
                      key={template.id}
                      onClick={() => {
                        setName(template.name);
                        setDescription(template.description);
                        setGridColumns(template.gridColumns);
                        setGridRows(template.gridRows);
                        if (template.imageUrl) {
                          setImagePreview(template.imageUrl);
                        }
                      }}
                      className="p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors text-center"
                    >
                      <span className="text-2xl block">
                        {template.category === 'interior' && '🏠'}
                        {template.category === 'exterior' && '🌲'}
                        {template.category === 'dungeon' && '⚔️'}
                        {template.category === 'special' && '✨'}
                      </span>
                      <span className="text-xs text-slate-300 mt-1 block">
                        {template.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!name && !imagePreview}
                className="w-full py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next: Configure Grid →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {/* Map Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Map Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="The Ancient Crypt"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A dark underground tomb..."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              {/* Grid Preview */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Grid Preview
                </label>
                <div className="relative bg-slate-900 rounded-lg overflow-hidden aspect-video">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Map"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  <svg className="absolute inset-0 w-full h-full">
                    {/* Vertical lines */}
                    {Array.from({ length: gridColumns + 1 }).map((_, i) => (
                      <line
                        key={`v-${i}`}
                        x1={`${(i / gridColumns) * 100}%`}
                        y1="0"
                        x2={`${(i / gridColumns) * 100}%`}
                        y2="100%"
                        stroke={gridColor}
                        strokeOpacity={gridOpacity}
                        strokeWidth={1}
                      />
                    ))}
                    {/* Horizontal lines */}
                    {Array.from({ length: gridRows + 1 }).map((_, i) => (
                      <line
                        key={`h-${i}`}
                        x1="0"
                        y1={`${(i / gridRows) * 100}%`}
                        x2="100%"
                        y2={`${(i / gridRows) * 100}%`}
                        stroke={gridColor}
                        strokeOpacity={gridOpacity}
                        strokeWidth={1}
                      />
                    ))}
                  </svg>
                </div>
              </div>

              {/* Grid Size */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Columns
                  </label>
                  <input
                    type="number"
                    min={4}
                    max={50}
                    value={gridColumns}
                    onChange={(e) => setGridColumns(parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Rows
                  </label>
                  <input
                    type="number"
                    min={4}
                    max={50}
                    value={gridRows}
                    onChange={(e) => setGridRows(parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Grid Appearance */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Grid Color
                  </label>
                  <div className="flex gap-2">
                    {['#ffffff', '#000000', '#f59e0b', '#3b82f6'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setGridColor(color)}
                        className={cn(
                          'w-8 h-8 rounded border-2 transition-all',
                          gridColor === color
                            ? 'border-amber-500 scale-110'
                            : 'border-transparent hover:border-slate-500'
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Grid Opacity: {Math.round(gridOpacity * 100)}%
                  </label>
                  <input
                    type="range"
                    min={0.1}
                    max={1}
                    step={0.1}
                    value={gridOpacity}
                    onChange={(e) => setGridOpacity(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSave}
                  disabled={!name}
                  className="flex-1 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {existingMap ? 'Save Changes' : 'Create Map'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
