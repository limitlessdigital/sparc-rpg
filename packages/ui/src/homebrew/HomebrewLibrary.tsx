/**
 * HomebrewLibrary - View and manage user's homebrew content
 * Based on PRD 25: Homebrew System
 */

import * as React from "react";
import { cn } from "../lib/utils";
import { Button } from "../Button";
import { Input } from "../Input";
import { Select, SelectOption } from "../Select";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../Card";
import { Badge } from "../Badge";
import { Tabs, TabList, Tab, TabPanel } from "../Tabs";
import {
  HomebrewBase,
  HomebrewCategory,
  HomebrewStatus,
} from "./types";

// ============================================
// Props & Types
// ============================================

export interface HomebrewLibraryProps {
  /** User's created homebrew */
  created: HomebrewBase[];
  /** User's imported homebrew */
  imported: (HomebrewBase & { importedAt: string; pinnedVersion?: string })[];
  /** Favorited homebrew */
  favorites: HomebrewBase[];
  /** Called when editing */
  onEdit?: (id: string) => void;
  /** Called when deleting */
  onDelete?: (id: string) => void;
  /** Called when exporting */
  onExport?: (id: string, format: 'json' | 'pdf') => void;
  /** Called when viewing */
  onView?: (id: string) => void;
  /** Called when unpinning version */
  onUnpin?: (id: string) => void;
  /** Called when removing import */
  onRemoveImport?: (id: string) => void;
  /** Called when creating new */
  onCreate?: (category: HomebrewCategory) => void;
  /** Additional class name */
  className?: string;
}

// ============================================
// Constants
// ============================================

const CATEGORY_ICONS: Record<HomebrewCategory, string> = {
  monster: '🐉',
  item: '🗡️',
  ability: '⚡',
  spell: '✨',
  class: '⚔️',
};

const STATUS_COLORS: Record<HomebrewStatus, string> = {
  draft: 'bg-yellow-500/20 text-yellow-300',
  published: 'bg-green-500/20 text-green-300',
  archived: 'bg-gray-500/20 text-gray-300',
  flagged: 'bg-red-500/20 text-red-300',
};

// ============================================
// Sub-Components
// ============================================

function CreatedCard({
  item,
  onEdit,
  onDelete,
  onExport,
  onView,
}: {
  item: HomebrewBase;
  onEdit?: () => void;
  onDelete?: () => void;
  onExport?: (format: 'json' | 'pdf') => void;
  onView?: () => void;
}) {
  const icon = CATEGORY_ICONS[item.category];
  const [showMenu, setShowMenu] = React.useState(false);

  return (
    <Card interactive onClick={onView} className="relative">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <div className="text-2xl">{icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base truncate">{item.name}</CardTitle>
              <Badge 
                className={cn("text-xs", STATUS_COLORS[item.status])}
              >
                {item.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground capitalize">
              {item.category} • v{item.currentVersion}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {item.description || 'No description'}
        </p>
        
        {item.status === 'published' && (
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span>👥 {item.usageCount} uses</span>
            <span>⭐ {item.averageRating.toFixed(1)} ({item.ratingCount})</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex gap-2 w-full">
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
          >
            Edit
          </Button>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
            >
              •••
            </Button>
            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }} 
                />
                <div className="absolute right-0 top-full mt-1 bg-surface-elevated border border-surface-divider rounded-lg shadow-lg z-20 py-1 min-w-[120px]">
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-surface-divider"
                    onClick={(e) => {
                      e.stopPropagation();
                      onExport?.('json');
                      setShowMenu(false);
                    }}
                  >
                    Export JSON
                  </button>
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-surface-divider"
                    onClick={(e) => {
                      e.stopPropagation();
                      onExport?.('pdf');
                      setShowMenu(false);
                    }}
                  >
                    Export PDF
                  </button>
                  <div className="border-t border-surface-divider my-1" />
                  <button
                    className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-900/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.();
                      setShowMenu(false);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

function ImportedCard({
  item,
  onView,
  onUnpin,
  onRemove,
}: {
  item: HomebrewBase & { importedAt: string; pinnedVersion?: string };
  onView?: () => void;
  onUnpin?: () => void;
  onRemove?: () => void;
}) {
  const icon = CATEGORY_ICONS[item.category];

  return (
    <Card interactive onClick={onView}>
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <div className="text-2xl">{icon}</div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{item.name}</CardTitle>
            <p className="text-xs text-muted-foreground">
              by {item.creatorName}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {item.description || 'No description'}
        </p>
        
        <div className="flex items-center gap-2 mt-2 text-xs">
          {item.pinnedVersion ? (
            <Badge variant="outline" className="text-xs">
              📌 Pinned to v{item.pinnedVersion}
            </Badge>
          ) : (
            <span className="text-muted-foreground">v{item.currentVersion}</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex gap-2 w-full">
          {item.pinnedVersion && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onUnpin?.();
              }}
            >
              Unpin
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
            className="text-red-400"
          >
            Remove
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

function FavoriteCard({
  item,
  onView,
}: {
  item: HomebrewBase;
  onView?: () => void;
}) {
  const icon = CATEGORY_ICONS[item.category];

  return (
    <Card interactive onClick={onView}>
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <div className="text-2xl">{icon}</div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{item.name}</CardTitle>
            <p className="text-xs text-muted-foreground">
              by {item.creatorName} • ⭐ {item.averageRating.toFixed(1)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {item.description || 'No description'}
        </p>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  type,
  onCreate,
}: {
  type: 'created' | 'imported' | 'favorites';
  onCreate?: (category: HomebrewCategory) => void;
}) {
  const config = {
    created: {
      icon: '✨',
      title: 'No homebrew yet',
      description: 'Create your first custom monster, item, or class!',
      showCreate: true,
    },
    imported: {
      icon: '📥',
      title: 'No imports yet',
      description: 'Browse the community library to find homebrew to import.',
      showCreate: false,
    },
    favorites: {
      icon: '❤️',
      title: 'No favorites yet',
      description: 'Heart homebrew you love to save them here.',
      showCreate: false,
    },
  };

  const { icon, title, description, showCreate } = config[type];

  return (
    <Card>
      <CardContent className="py-12 text-center">
        <p className="text-4xl mb-4">{icon}</p>
        <p className="text-lg font-medium mb-2">{title}</p>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        
        {showCreate && onCreate && (
          <div className="flex flex-wrap justify-center gap-2">
            {(['monster', 'item', 'ability', 'spell', 'class'] as HomebrewCategory[]).map(cat => (
              <Button
                key={cat}
                variant="secondary"
                size="sm"
                onClick={() => onCreate(cat)}
              >
                {CATEGORY_ICONS[cat]} New {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// Main Component
// ============================================

export function HomebrewLibrary({
  created,
  imported,
  favorites,
  onEdit,
  onDelete,
  onExport,
  onView,
  onUnpin,
  onRemoveImport,
  onCreate,
  className,
}: HomebrewLibraryProps) {
  const [filter, setFilter] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState<HomebrewCategory | 'all'>('all');
  const [activeTab, setActiveTab] = React.useState('created');

  const filterItems = <T extends HomebrewBase>(items: T[]): T[] => {
    return items.filter(item => {
      const matchesSearch = !filter || 
        item.name.toLowerCase().includes(filter.toLowerCase()) ||
        item.description.toLowerCase().includes(filter.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  };

  const filteredCreated = filterItems(created);
  const filteredImported = filterItems(imported);
  const filteredFavorites = filterItems(favorites);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">My Homebrew</h2>
          <p className="text-muted-foreground">
            Manage your created and imported homebrew content
          </p>
        </div>
        
        {onCreate && (
          <div className="flex gap-2">
            <Select
              value="create"
              onChange={(v) => {
                if (v !== 'create') {
                  onCreate(v as HomebrewCategory);
                }
              }}
            >
              <SelectOption value="create">+ Create New</SelectOption>
              {(['monster', 'item', 'ability', 'spell', 'class'] as HomebrewCategory[]).map(cat => (
                <SelectOption key={cat} value={cat}>
                  {CATEGORY_ICONS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectOption>
              ))}
            </Select>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Input
          placeholder="Search..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={categoryFilter}
          onChange={(v) => setCategoryFilter(v as HomebrewCategory | 'all')}
        >
          <SelectOption value="all">All Types</SelectOption>
          {(['monster', 'item', 'ability', 'spell', 'class'] as HomebrewCategory[]).map(cat => (
            <SelectOption key={cat} value={cat}>
              {CATEGORY_ICONS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </SelectOption>
          ))}
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <TabList>
          <Tab value="created">
            Created ({filteredCreated.length})
          </Tab>
          <Tab value="imported">
            Imported ({filteredImported.length})
          </Tab>
          <Tab value="favorites">
            Favorites ({filteredFavorites.length})
          </Tab>
        </TabList>

        <TabPanel value="created" className="pt-4">
          {filteredCreated.length === 0 ? (
            <EmptyState type="created" onCreate={onCreate} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCreated.map(item => (
                <CreatedCard
                  key={item.id}
                  item={item}
                  onEdit={() => onEdit?.(item.id)}
                  onDelete={() => onDelete?.(item.id)}
                  onExport={(format) => onExport?.(item.id, format)}
                  onView={() => onView?.(item.id)}
                />
              ))}
            </div>
          )}
        </TabPanel>

        <TabPanel value="imported" className="pt-4">
          {filteredImported.length === 0 ? (
            <EmptyState type="imported" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredImported.map(item => (
                <ImportedCard
                  key={item.id}
                  item={item}
                  onView={() => onView?.(item.id)}
                  onUnpin={() => onUnpin?.(item.id)}
                  onRemove={() => onRemoveImport?.(item.id)}
                />
              ))}
            </div>
          )}
        </TabPanel>

        <TabPanel value="favorites" className="pt-4">
          {filteredFavorites.length === 0 ? (
            <EmptyState type="favorites" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFavorites.map(item => (
                <FavoriteCard
                  key={item.id}
                  item={item}
                  onView={() => onView?.(item.id)}
                />
              ))}
            </div>
          )}
        </TabPanel>
      </Tabs>
    </div>
  );
}

export default HomebrewLibrary;
