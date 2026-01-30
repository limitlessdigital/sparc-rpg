/**
 * LfgBrowser - Looking For Group browser and creation
 */

import * as React from 'react';
import { cn } from '../lib/utils';
import { Avatar } from '../Avatar';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Input, Textarea } from '../Input';
import { Select } from '../Select';
import { Card, CardContent } from '../Card';
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../Modal';
import type {
  LfgPost,
  LfgType,
  ExperienceLevel,
  PlayStyleTag,
} from './types';
import {
  formatRelativeTime,
  formatDuration,
  getExperienceLevelLabel,
  getExperienceLevelIcon,
  getPlayStyleLabel,
  getPlayStyleIcon,
  getReputationColor,
  getReputationIcon,
  ALL_PLAY_STYLE_TAGS,
} from './utils';

// ============================================
// LFG Post Card
// ============================================

interface LfgPostCardProps {
  post: LfgPost;
  onRespond?: (postId: string) => void;
  onViewDetails?: (postId: string) => void;
}

export function LfgPostCard({ post, onRespond, onViewDetails }: LfgPostCardProps) {
  const isExpiringSoon = new Date(post.expiresAt).getTime() - Date.now() < 24 * 60 * 60 * 1000;
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar
              src={post.authorAvatar}
              alt={post.authorName}
              fallback={post.authorName.charAt(0).toUpperCase()}
              size="sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{post.authorName}</span>
                <span className={cn('text-xs', getReputationColor(post.authorReputation))}>
                  {getReputationIcon(post.authorReputation)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatRelativeTime(post.createdAt)}
              </p>
            </div>
          </div>
          
          <Badge variant={post.type === 'lfp' ? 'info' : 'success'}>
            {post.type === 'lfp' ? '🔍 Looking for Players' : '🎭 Looking for Seer'}
          </Badge>
        </div>
        
        {/* Adventure info */}
        {post.adventureName && (
          <div className="mb-3">
            <span className="font-medium">{post.adventureName}</span>
          </div>
        )}
        
        {/* Schedule and duration */}
        <div className="flex flex-wrap gap-3 mb-3 text-sm">
          {post.scheduledFor ? (
            <span className="flex items-center gap-1">
              📅 {new Date(post.scheduledFor).toLocaleDateString()} at{' '}
              {new Date(post.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-muted-foreground">
              📅 Flexible
            </span>
          )}
          <span className="flex items-center gap-1">
            ⏱️ {formatDuration(post.duration)}
          </span>
          <span className="flex items-center gap-1">
            👥 {post.playersNeeded} player{post.playersNeeded > 1 ? 's' : ''} needed
          </span>
        </div>
        
        {/* Description */}
        {post.description && (
          <p className="text-sm text-muted-foreground mb-3">
            "{post.description}"
          </p>
        )}
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-elevated rounded-full text-xs">
            {getExperienceLevelIcon(post.experienceLevel)}
            {getExperienceLevelLabel(post.experienceLevel)}
          </span>
          {post.playStyleTags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-elevated rounded-full text-xs"
            >
              {getPlayStyleIcon(tag)}
              {getPlayStyleLabel(tag)}
            </span>
          ))}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-surface-divider">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{post.responseCount} response{post.responseCount !== 1 ? 's' : ''}</span>
            {isExpiringSoon && (
              <span className="text-warning">• Expires soon</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => onViewDetails?.(post.id)}>
              Details
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onRespond?.(post.id)}
              disabled={post.status !== 'open'}
            >
              Respond
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// LFG Filters
// ============================================

interface LfgFiltersProps {
  type?: LfgType | 'all';
  experienceLevel?: ExperienceLevel | 'all';
  timeFrame?: 'any' | 'today' | 'week';
  onTypeChange?: (type: LfgType | 'all') => void;
  onExperienceChange?: (level: ExperienceLevel | 'all') => void;
  onTimeFrameChange?: (frame: 'any' | 'today' | 'week') => void;
}

export function LfgFilters({
  type = 'all',
  experienceLevel = 'all',
  timeFrame = 'any',
  onTypeChange,
  onExperienceChange,
  onTimeFrameChange,
}: LfgFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Select
        value={type}
        onChange={(value) => onTypeChange?.(value as LfgType | 'all')}
        options={[
          { value: 'all', label: 'Any Type' },
          { value: 'lfp', label: 'Looking for Players' },
          { value: 'lfs', label: 'Looking for Seer' },
        ]}
        className="w-40"
      />
      
      <Select
        value={experienceLevel}
        onChange={(value) => onExperienceChange?.(value as ExperienceLevel | 'all')}
        options={[
          { value: 'all', label: 'Any Experience' },
          { value: 'newbie', label: 'Newbie Friendly' },
          { value: 'experienced', label: 'Experienced' },
        ]}
        className="w-40"
      />
      
      <Select
        value={timeFrame}
        onChange={(value) => onTimeFrameChange?.(value as 'any' | 'today' | 'week')}
        options={[
          { value: 'any', label: 'Any Time' },
          { value: 'today', label: 'Today' },
          { value: 'week', label: 'This Week' },
        ]}
        className="w-36"
      />
    </div>
  );
}

// ============================================
// LFG Browser Component
// ============================================

export interface LfgBrowserProps {
  posts: LfgPost[];
  onRespond?: (postId: string) => void;
  onViewDetails?: (postId: string) => void;
  onCreatePost?: () => void;
  onFilterChange?: (filters: {
    type?: LfgType | 'all';
    experienceLevel?: ExperienceLevel | 'all';
    timeFrame?: 'any' | 'today' | 'week';
  }) => void;
  loading?: boolean;
  className?: string;
}

export function LfgBrowser({
  posts,
  onRespond,
  onViewDetails,
  onCreatePost,
  onFilterChange,
  loading,
  className,
}: LfgBrowserProps) {
  const [filters, setFilters] = React.useState({
    type: 'all' as LfgType | 'all',
    experienceLevel: 'all' as ExperienceLevel | 'all',
    timeFrame: 'any' as 'any' | 'today' | 'week',
  });
  
  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };
  
  // Filter posts client-side
  const filteredPosts = React.useMemo(() => {
    return posts.filter((post) => {
      if (filters.type !== 'all' && post.type !== filters.type) return false;
      if (filters.experienceLevel !== 'all' && post.experienceLevel !== filters.experienceLevel) return false;
      
      if (filters.timeFrame !== 'any' && post.scheduledFor) {
        const scheduled = new Date(post.scheduledFor);
        const now = new Date();
        
        if (filters.timeFrame === 'today') {
          if (scheduled.toDateString() !== now.toDateString()) return false;
        } else if (filters.timeFrame === 'week') {
          const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          if (scheduled > weekFromNow) return false;
        }
      }
      
      return true;
    });
  }, [posts, filters]);
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Looking For Group</h2>
        <Button variant="primary" onClick={onCreatePost}>
          + Create Post
        </Button>
      </div>
      
      {/* Filters */}
      <LfgFilters
        type={filters.type}
        experienceLevel={filters.experienceLevel}
        timeFrame={filters.timeFrame}
        onTypeChange={(v) => handleFilterChange('type', v)}
        onExperienceChange={(v) => handleFilterChange('experienceLevel', v)}
        onTimeFrameChange={(v) => handleFilterChange('timeFrame', v)}
      />
      
      {/* Posts list */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading...
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="space-y-3">
          {filteredPosts.map((post) => (
            <LfgPostCard
              key={post.id}
              post={post}
              onRespond={onRespond}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            No LFG posts match your filters
          </p>
          <Button variant="primary" onClick={onCreatePost}>
            Create the First Post
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================
// Create LFG Post Modal
// ============================================

export interface CreateLfgPostModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: LfgType;
    adventureId?: string;
    scheduledFor?: string;
    duration: number;
    playersNeeded: number;
    experienceLevel: ExperienceLevel;
    playStyleTags: PlayStyleTag[];
    description?: string;
  }) => void;
  adventures?: Array<{ id: string; name: string }>;
  loading?: boolean;
}

export function CreateLfgPostModal({
  open,
  onClose,
  onSubmit,
  adventures = [],
  loading,
}: CreateLfgPostModalProps) {
  const [formData, setFormData] = React.useState({
    type: 'lfp' as LfgType,
    adventureId: '',
    scheduledFor: '',
    scheduledTime: '',
    duration: 90,
    playersNeeded: 3,
    experienceLevel: 'any' as ExperienceLevel,
    playStyleTags: [] as PlayStyleTag[],
    description: '',
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const scheduledFor = formData.scheduledFor && formData.scheduledTime
      ? new Date(`${formData.scheduledFor}T${formData.scheduledTime}`).toISOString()
      : undefined;
    
    onSubmit({
      type: formData.type,
      adventureId: formData.adventureId || undefined,
      scheduledFor,
      duration: formData.duration,
      playersNeeded: formData.playersNeeded,
      experienceLevel: formData.experienceLevel,
      playStyleTags: formData.playStyleTags,
      description: formData.description || undefined,
    });
  };
  
  const toggleTag = (tag: PlayStyleTag) => {
    setFormData((prev) => ({
      ...prev,
      playStyleTags: prev.playStyleTags.includes(tag)
        ? prev.playStyleTags.filter((t) => t !== tag)
        : [...prev.playStyleTags, tag],
    }));
  };
  
  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>Create LFG Post</ModalTitle>
      </ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4">
          {/* Post type */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, type: 'lfp' }))}
              className={cn(
                'p-3 rounded-lg border-2 transition-colors text-left',
                formData.type === 'lfp'
                  ? 'border-bronze bg-bronze/10'
                  : 'border-surface-divider hover:border-bronze/50'
              )}
            >
              <div className="font-medium">🔍 Looking for Players</div>
              <div className="text-xs text-muted-foreground">I'm a Seer seeking players</div>
            </button>
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, type: 'lfs' }))}
              className={cn(
                'p-3 rounded-lg border-2 transition-colors text-left',
                formData.type === 'lfs'
                  ? 'border-bronze bg-bronze/10'
                  : 'border-surface-divider hover:border-bronze/50'
              )}
            >
              <div className="font-medium">🎭 Looking for Seer</div>
              <div className="text-xs text-muted-foreground">We need a Seer for our group</div>
            </button>
          </div>
          
          {/* Adventure selection */}
          {formData.type === 'lfp' && adventures.length > 0 && (
            <Select
              label="Adventure"
              value={formData.adventureId}
              onChange={(value) => setFormData((p) => ({ ...p, adventureId: value }))}
              options={[
                { value: '', label: 'Any Adventure' },
                ...adventures.map((a) => ({ value: a.id, label: a.name })),
              ]}
            />
          )}
          
          {/* Schedule */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date (optional)"
              type="date"
              value={formData.scheduledFor}
              onChange={(e) => setFormData((p) => ({ ...p, scheduledFor: e.target.value }))}
            />
            <Input
              label="Time"
              type="time"
              value={formData.scheduledTime}
              onChange={(e) => setFormData((p) => ({ ...p, scheduledTime: e.target.value }))}
              disabled={!formData.scheduledFor}
            />
          </div>
          
          {/* Duration and players */}
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Session Duration"
              value={String(formData.duration)}
              onChange={(value) => setFormData((p) => ({ ...p, duration: Number(value) }))}
              options={[
                { value: '30', label: '30 minutes' },
                { value: '60', label: '1 hour' },
                { value: '90', label: '1.5 hours' },
                { value: '120', label: '2 hours' },
                { value: '180', label: '3 hours' },
              ]}
            />
            <Select
              label={formData.type === 'lfp' ? 'Players Needed' : 'Group Size'}
              value={String(formData.playersNeeded)}
              onChange={(value) => setFormData((p) => ({ ...p, playersNeeded: Number(value) }))}
              options={[1, 2, 3, 4, 5].map((n) => ({
                value: String(n),
                label: `${n} player${n > 1 ? 's' : ''}`,
              }))}
            />
          </div>
          
          {/* Experience level */}
          <Select
            label="Experience Level"
            value={formData.experienceLevel}
            onChange={(value) => setFormData((p) => ({ ...p, experienceLevel: value as ExperienceLevel }))}
            options={[
              { value: 'any', label: 'All Welcome' },
              { value: 'newbie', label: 'Newbie Friendly' },
              { value: 'experienced', label: 'Experienced Players' },
            ]}
          />
          
          {/* Play style tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Play Style Tags</label>
            <div className="flex flex-wrap gap-2">
              {ALL_PLAY_STYLE_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm transition-colors',
                    formData.playStyleTags.includes(tag)
                      ? 'bg-bronze text-white'
                      : 'bg-surface-elevated text-muted-foreground hover:text-foreground'
                  )}
                >
                  {getPlayStyleIcon(tag)} {getPlayStyleLabel(tag)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Description */}
          <Textarea
            label="Description (optional)"
            placeholder="Tell potential groupmates about your session..."
            value={formData.description}
            onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
            maxLength={300}
          />
          <p className="text-xs text-muted-foreground text-right">
            {formData.description.length}/300
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            Create Post
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

// ============================================
// LFG Response Modal
// ============================================

export interface LfgResponseModalProps {
  open: boolean;
  onClose: () => void;
  post?: LfgPost;
  onSubmit: (postId: string, message?: string) => void;
  loading?: boolean;
}

export function LfgResponseModal({
  open,
  onClose,
  post,
  onSubmit,
  loading,
}: LfgResponseModalProps) {
  const [message, setMessage] = React.useState('');
  
  if (!post) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(post.id, message || undefined);
    setMessage('');
  };
  
  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>Respond to LFG Post</ModalTitle>
      </ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4">
          {/* Post summary */}
          <div className="p-3 rounded-lg bg-surface-elevated">
            <div className="flex items-center gap-2 mb-2">
              <Avatar
                src={post.authorAvatar}
                alt={post.authorName}
                fallback={post.authorName.charAt(0).toUpperCase()}
                size="sm"
              />
              <span className="font-medium">{post.authorName}</span>
            </div>
            <p className="text-sm">
              {post.type === 'lfp' ? 'Looking for Players' : 'Looking for Seer'}
              {post.adventureName && ` • ${post.adventureName}`}
            </p>
            <p className="text-xs text-muted-foreground">
              {post.playersNeeded} player{post.playersNeeded > 1 ? 's' : ''} needed
              {post.scheduledFor && ` • ${new Date(post.scheduledFor).toLocaleDateString()}`}
            </p>
          </div>
          
          {/* Message */}
          <Textarea
            label="Message (optional)"
            placeholder="Introduce yourself or ask questions..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={300}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            Send Response
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
