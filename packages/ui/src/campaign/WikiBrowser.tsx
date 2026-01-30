/**
 * WikiBrowser - Campaign wiki pages browser and editor
 */

import * as React from 'react';
import { cn } from '../lib/utils';
import { Card, CardContent, CardHeader } from '../Card';
import { Button } from '../Button';
import { Input } from '../Input';
import { Badge } from '../Badge';
import type {
  WikiPage,
  WikiCategory,
  WikiRevision,
  WikiBrowserProps,
} from './types';
import {
  getWikiCategoryLabel,
  getWikiCategoryIcon,
  formatRelativeTime,
  ALL_WIKI_CATEGORIES,
} from './utils';

// ============================================
// Wiki Category Pills
// ============================================

interface WikiCategoryPillsProps {
  categories: WikiCategory[];
  activeCategory?: WikiCategory | 'all';
  onCategorySelect?: (category: WikiCategory | 'all') => void;
  className?: string;
}

export function WikiCategoryPills({
  categories = ALL_WIKI_CATEGORIES,
  activeCategory = 'all',
  onCategorySelect,
  className,
}: WikiCategoryPillsProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <Button
        size="sm"
        variant={activeCategory === 'all' ? 'default' : 'outline'}
        onClick={() => onCategorySelect?.('all')}
      >
        All
      </Button>
      {categories.map((category) => (
        <Button
          key={category}
          size="sm"
          variant={activeCategory === category ? 'default' : 'outline'}
          onClick={() => onCategorySelect?.(category)}
        >
          {getWikiCategoryIcon(category)} {getWikiCategoryLabel(category)}
        </Button>
      ))}
    </div>
  );
}

// ============================================
// Wiki Page Card
// ============================================

interface WikiPageCardProps {
  page: WikiPage;
  onClick?: () => void;
  onEdit?: () => void;
  canEdit?: boolean;
  showCategory?: boolean;
  className?: string;
}

export function WikiPageCard({
  page,
  onClick,
  onEdit,
  canEdit,
  showCategory = true,
  className,
}: WikiPageCardProps) {
  // Extract first paragraph or first 150 chars for preview
  const preview = page.content
    .split('\n')
    .find((line) => line.trim() && !line.startsWith('#'))
    ?.slice(0, 150);

  return (
    <div
      className={cn(
        'p-4 rounded-lg bg-surface-elevated border border-surface-divider transition-all',
        onClick && 'cursor-pointer hover:border-primary/50',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {showCategory && (
              <span className="text-lg">{getWikiCategoryIcon(page.category)}</span>
            )}
            <h4 className="font-medium truncate">{page.title}</h4>
            {page.visibility === 'seer_only' && (
              <Badge variant="secondary" className="text-xs">
                🔒 Seer Only
              </Badge>
            )}
          </div>
          {preview && (
            <p className="text-sm text-muted-foreground line-clamp-2">{preview}...</p>
          )}
        </div>
        {canEdit && onEdit && (
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            Edit
          </Button>
        )}
      </div>
      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
        <span>Updated {formatRelativeTime(page.updatedAt)}</span>
        {page.updatedByName && <span>by {page.updatedByName}</span>}
        <span>v{page.version}</span>
      </div>
    </div>
  );
}

// ============================================
// Wiki Page List
// ============================================

interface WikiPageListProps {
  pages: WikiPage[];
  onPageSelect?: (pageId: string) => void;
  onPageEdit?: (pageId: string) => void;
  canEdit?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function WikiPageList({
  pages,
  onPageSelect,
  onPageEdit,
  canEdit,
  loading,
  emptyMessage = 'No wiki pages found',
  className,
}: WikiPageListProps) {
  if (loading) {
    return (
      <div className={cn('space-y-3', className)}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-4 rounded-lg bg-surface-elevated border border-surface-divider animate-pulse"
          >
            <div className="h-5 bg-surface-divider rounded w-1/3 mb-2" />
            <div className="h-4 bg-surface-divider rounded w-full" />
            <div className="h-4 bg-surface-divider rounded w-2/3 mt-1" />
          </div>
        ))}
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {pages.map((page) => (
        <WikiPageCard
          key={page.id}
          page={page}
          onClick={() => onPageSelect?.(page.id)}
          onEdit={() => onPageEdit?.(page.id)}
          canEdit={canEdit}
        />
      ))}
    </div>
  );
}

// ============================================
// Wiki Page View
// ============================================

interface WikiPageViewProps {
  page: WikiPage;
  onEdit?: () => void;
  onBack?: () => void;
  onViewHistory?: () => void;
  canEdit?: boolean;
  className?: string;
}

export function WikiPageView({
  page,
  onEdit,
  onBack,
  onViewHistory,
  canEdit,
  className,
}: WikiPageViewProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              ← Back
            </Button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getWikiCategoryIcon(page.category)}</span>
              <h1 className="text-2xl font-bold">{page.title}</h1>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{getWikiCategoryLabel(page.category)}</Badge>
              {page.visibility === 'seer_only' && (
                <Badge variant="secondary">🔒 Seer Only</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {onViewHistory && (
            <Button variant="ghost" size="sm" onClick={onViewHistory}>
              History
            </Button>
          )}
          {canEdit && onEdit && (
            <Button size="sm" onClick={onEdit}>
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardContent className="p-6">
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
            {page.content}
          </div>
        </CardContent>
      </Card>

      {/* Meta */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Created {formatRelativeTime(page.createdAt)}
          {page.createdByName && ` by ${page.createdByName}`}
        </span>
        <span>
          Last updated {formatRelativeTime(page.updatedAt)}
          {page.updatedByName && ` by ${page.updatedByName}`} • v{page.version}
        </span>
      </div>
    </div>
  );
}

// ============================================
// Wiki Revision History
// ============================================

interface WikiRevisionListProps {
  revisions: WikiRevision[];
  currentVersion: number;
  onRevert?: (version: number) => void;
  onViewVersion?: (version: number) => void;
  className?: string;
}

export function WikiRevisionList({
  revisions,
  currentVersion,
  onRevert,
  onViewVersion,
  className,
}: WikiRevisionListProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {revisions.map((revision) => (
        <div
          key={revision.id}
          className={cn(
            'flex items-center justify-between p-3 rounded border',
            revision.version === currentVersion
              ? 'border-primary bg-primary/5'
              : 'border-surface-divider bg-surface-elevated'
          )}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Version {revision.version}</span>
              {revision.version === currentVersion && (
                <Badge variant="outline" className="text-xs">
                  Current
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatRelativeTime(revision.editedAt)}
              {revision.editedByName && ` by ${revision.editedByName}`}
            </div>
          </div>
          <div className="flex gap-2">
            {onViewVersion && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onViewVersion(revision.version)}
              >
                View
              </Button>
            )}
            {onRevert && revision.version !== currentVersion && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRevert(revision.version)}
              >
                Revert
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// Wiki Browser Component
// ============================================

export function WikiBrowser({
  pages,
  categories = ALL_WIKI_CATEGORIES,
  onPageSelect,
  onCreatePage,
  canEdit,
}: WikiBrowserProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState<WikiCategory | 'all'>('all');

  const filteredPages = React.useMemo(() => {
    let result = pages;

    // Filter by category
    if (activeCategory !== 'all') {
      result = result.filter((p) => p.category === activeCategory);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.content.toLowerCase().includes(query)
      );
    }

    // Sort by title
    return result.sort((a, b) => a.title.localeCompare(b.title));
  }, [pages, activeCategory, searchQuery]);

  // Group by category for display
  const groupedPages = React.useMemo(() => {
    if (activeCategory !== 'all') {
      return { [activeCategory]: filteredPages };
    }

    return filteredPages.reduce<Record<WikiCategory, WikiPage[]>>(
      (acc, page) => {
        if (!acc[page.category]) {
          acc[page.category] = [];
        }
        acc[page.category].push(page);
        return acc;
      },
      {} as Record<WikiCategory, WikiPage[]>
    );
  }, [filteredPages, activeCategory]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Campaign Wiki</h2>
        {canEdit && onCreatePage && (
          <Button onClick={onCreatePage}>
            + New Page
          </Button>
        )}
      </div>

      {/* Search */}
      <Input
        placeholder="Search wiki pages..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-md"
      />

      {/* Categories */}
      <WikiCategoryPills
        categories={categories}
        activeCategory={activeCategory}
        onCategorySelect={setActiveCategory}
      />

      {/* Pages */}
      {filteredPages.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchQuery ? (
            <p>No pages match &ldquo;{searchQuery}&rdquo;</p>
          ) : (
            <p>No wiki pages yet. Create the first one!</p>
          )}
        </div>
      ) : activeCategory === 'all' ? (
        // Grouped view
        <div className="space-y-6">
          {Object.entries(groupedPages).map(([category, categoryPages]) => (
            <div key={category}>
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                {getWikiCategoryIcon(category as WikiCategory)}
                {getWikiCategoryLabel(category as WikiCategory)}
                <span className="text-sm text-muted-foreground">
                  ({categoryPages.length})
                </span>
              </h3>
              <WikiPageList
                pages={categoryPages}
                onPageSelect={onPageSelect}
                canEdit={canEdit}
              />
            </div>
          ))}
        </div>
      ) : (
        // Flat list
        <WikiPageList
          pages={filteredPages}
          onPageSelect={onPageSelect}
          canEdit={canEdit}
        />
      )}
    </div>
  );
}

// ============================================
// Wiki Sidebar (for page navigation)
// ============================================

interface WikiSidebarProps {
  pages: WikiPage[];
  activePageId?: string;
  onPageSelect?: (pageId: string) => void;
  className?: string;
}

export function WikiSidebar({
  pages,
  activePageId,
  onPageSelect,
  className,
}: WikiSidebarProps) {
  // Group by category
  const groupedPages = React.useMemo(() => {
    return pages.reduce<Record<WikiCategory, WikiPage[]>>(
      (acc, page) => {
        if (!acc[page.category]) {
          acc[page.category] = [];
        }
        acc[page.category].push(page);
        return acc;
      },
      {} as Record<WikiCategory, WikiPage[]>
    );
  }, [pages]);

  return (
    <div className={cn('space-y-4', className)}>
      {ALL_WIKI_CATEGORIES.map((category) => {
        const categoryPages = groupedPages[category] || [];
        if (categoryPages.length === 0) return null;

        return (
          <div key={category}>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              {getWikiCategoryIcon(category)} {getWikiCategoryLabel(category)}
            </h4>
            <div className="space-y-0.5">
              {categoryPages.map((page) => (
                <button
                  key={page.id}
                  className={cn(
                    'w-full text-left px-2 py-1.5 rounded text-sm transition-colors',
                    page.id === activePageId
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-surface-elevated text-foreground'
                  )}
                  onClick={() => onPageSelect?.(page.id)}
                >
                  {page.title}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
