"use client";

import Link from "next/link";
import { Card, CardContent, Button, Badge, Tabs, TabList, Tab, TabPanel } from "@sparc/ui";
import * as React from "react";

// Placeholder adventure data
const myAdventures = [
  {
    id: "adv-1",
    title: "The Dragon's Lair",
    description: "A classic dungeon crawl with a fearsome dragon boss.",
    status: "published" as const,
    nodes: 24,
    plays: 156,
    rating: 4.5,
    updatedAt: "2 days ago",
  },
  {
    id: "adv-2",
    title: "Curse of the Moonstone",
    description: "A dark mystery in a haunted village.",
    status: "draft" as const,
    nodes: 12,
    plays: 0,
    rating: null,
    updatedAt: "1 week ago",
  },
];

const communityAdventures = [
  {
    id: "adv-3",
    title: "Secrets of the Ancients",
    author: "AncientLore",
    description: "Explore ancient ruins and uncover forgotten treasures.",
    nodes: 42,
    plays: 892,
    rating: 4.8,
    tags: ["Exploration", "Puzzle", "Mystery"],
  },
  {
    id: "adv-4",
    title: "The Siege of Ironhold",
    author: "WarMaster",
    description: "Defend a fortress against an overwhelming horde.",
    nodes: 18,
    plays: 445,
    rating: 4.3,
    tags: ["Combat", "Strategy", "Intense"],
  },
  {
    id: "adv-5",
    title: "A Thief's Gambit",
    author: "ShadowScribe",
    description: "Pull off the heist of the century in the royal palace.",
    nodes: 31,
    plays: 678,
    rating: 4.6,
    tags: ["Stealth", "Heist", "Urban"],
  },
];

const statusConfig = {
  published: { label: "Published", variant: "success" as const },
  draft: { label: "Draft", variant: "default" as const },
  archived: { label: "Archived", variant: "default" as const },
};

function StarRating({ rating }: { rating: number }): JSX.Element | null {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span 
          key={star} 
          className={star <= rating ? "text-gold" : "text-surface-divider"}
        >
          ★
        </span>
      ))}
      <span className="text-sm text-muted-foreground ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

function MyAdventureCard({ adventure }: { adventure: typeof myAdventures[0] }): JSX.Element | null {
  const status = statusConfig[adventure.status];
  
  return (
    <Card interactive>
      <CardContent className="py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold truncate">{adventure.title}</h3>
              <Badge variant={status.variant} className="text-xs">
                {status.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {adventure.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>📊 {adventure.nodes} nodes</span>
              <span>🎮 {adventure.plays} plays</span>
              {adventure.rating && <StarRating rating={adventure.rating} />}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Updated {adventure.updatedAt}
            </p>
          </div>
          
          <Link href={`/adventures/editor/${adventure.id}`}>
            <Button variant="secondary" size="sm">Edit</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function CommunityAdventureCard({ adventure }: { adventure: typeof communityAdventures[0] }): JSX.Element | null {
  return (
    <Card interactive>
      <CardContent className="py-5">
        <h3 className="font-semibold mb-1">{adventure.title}</h3>
        <p className="text-sm text-muted-foreground mb-2">by {adventure.author}</p>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {adventure.description}
        </p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {adventure.tags.map((tag) => (
            <Badge key={tag} variant="default" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>🎮 {adventure.plays}</span>
            <StarRating rating={adventure.rating} />
          </div>
          <Button variant="secondary" size="sm">View</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdventuresPage(): JSX.Element | null {
  const [activeTab, setActiveTab] = React.useState("my");
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Adventures</h2>
          <p className="text-sm text-muted-foreground">
            Create and manage your adventures
          </p>
        </div>
        <Link href="/adventures/editor/new">
          <Button variant="primary">Create Adventure</Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <TabList>
          <Tab value="my">My Adventures</Tab>
          <Tab value="community">Community</Tab>
        </TabList>
        
        <TabPanel value="my" className="mt-6">
          {myAdventures.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {myAdventures.map((adventure) => (
                <MyAdventureCard key={adventure.id} adventure={adventure} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-4xl mb-4">🗺️</div>
                <h3 className="text-lg font-semibold mb-2">No Adventures Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first adventure with the Adventure Forge!
                </p>
                <Link href="/adventures/editor/new">
                  <Button variant="primary">Create Adventure</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabPanel>
        
        <TabPanel value="community" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {communityAdventures.map((adventure) => (
              <CommunityAdventureCard key={adventure.id} adventure={adventure} />
            ))}
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}
