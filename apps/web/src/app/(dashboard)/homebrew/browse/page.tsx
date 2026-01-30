"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  HomebrewBrowser,
  HomebrewSummary,
  HomebrewBrowseFilters,
  HomebrewBrowseFacets,
  useToast,
} from "@sparc/ui";

// Mock data for development
const MOCK_ITEMS: HomebrewSummary[] = [
  {
    id: "hb_pub_1",
    name: "Elder Shadow Dragon",
    description: "An ancient dragon corrupted by shadow magic, serving as a deadly boss encounter.",
    category: "monster",
    creatorName: "DragonMaster42",
    creatorId: "user_dm42",
    averageRating: 4.9,
    ratingCount: 234,
    usageCount: 1234,
    tags: ["dragon", "boss", "epic"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "hb_pub_2",
    name: "Blade of the Phoenix",
    description: "A legendary sword that bursts into flames when drawn, dealing bonus fire damage.",
    category: "item",
    creatorName: "ForgeKnight",
    creatorId: "user_fk",
    averageRating: 4.2,
    ratingCount: 89,
    usageCount: 890,
    tags: ["fire", "sword", "legendary"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "hb_pub_3",
    name: "Time Stop",
    description: "Freeze time for all enemies, allowing free actions for 1 round.",
    category: "spell",
    creatorName: "WizardSupreme",
    creatorId: "user_ws",
    averageRating: 4.4,
    ratingCount: 56,
    usageCount: 567,
    tags: ["time", "utility", "powerful"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "hb_pub_4",
    name: "Chronomancer",
    description: "A time-manipulating mage who can rewind mistakes and fast-forward allies.",
    category: "class",
    creatorName: "TimeWeaver",
    creatorId: "user_tw",
    averageRating: 4.8,
    ratingCount: 67,
    usageCount: 423,
    tags: ["time", "wizard", "support"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "hb_pub_5",
    name: "Plague Zombie Horde",
    description: "A swarm of undead that spreads disease and overwhelms with numbers.",
    category: "monster",
    creatorName: "UndeadArmy",
    creatorId: "user_ua",
    averageRating: 3.5,
    ratingCount: 45,
    usageCount: 2100,
    tags: ["undead", "swarm", "minion"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "hb_pub_6",
    name: "Aegis of the Fallen",
    description: "A shield that absorbs damage and converts it to healing for nearby allies.",
    category: "item",
    creatorName: "ShieldMaiden",
    creatorId: "user_sm",
    averageRating: 4.1,
    ratingCount: 34,
    usageCount: 334,
    tags: ["shield", "protection", "tank"],
    updatedAt: new Date().toISOString(),
  },
];

const MOCK_FACETS: HomebrewBrowseFacets = {
  categories: [
    { category: "monster", count: 1234 },
    { category: "item", count: 876 },
    { category: "spell", count: 543 },
    { category: "ability", count: 321 },
    { category: "class", count: 234 },
  ],
  tags: [
    { tag: "undead", count: 234 },
    { tag: "dragon", count: 189 },
    { tag: "fire", count: 167 },
    { tag: "boss", count: 145 },
    { tag: "legendary", count: 123 },
    { tag: "magic", count: 112 },
    { tag: "support", count: 98 },
    { tag: "tank", count: 87 },
  ],
};

export default function BrowseHomebrewPage(): JSX.Element | null {
  const router = useRouter();
  const { toast } = useToast();
  
  const [filters, setFilters] = React.useState<HomebrewBrowseFilters>({
    sortBy: "popular",
  });
  const [favorites, setFavorites] = React.useState<Set<string>>(new Set());
  const [imported, setImported] = React.useState<Set<string>>(new Set());
  const [loading] = React.useState(false);

  // Filter items based on current filters
  const filteredItems = React.useMemo(() => {
    let items = [...MOCK_ITEMS];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(search) ||
          item.description.toLowerCase().includes(search)
      );
    }

    if (filters.category) {
      items = items.filter((item) => item.category === filters.category);
    }

    if (filters.tags && filters.tags.length > 0) {
      items = items.filter((item) =>
        filters.tags!.some((tag) => item.tags.includes(tag))
      );
    }

    if (filters.minRating) {
      items = items.filter((item) => item.averageRating >= filters.minRating!);
    }

    // Sort
    switch (filters.sortBy) {
      case "rating":
        items.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case "newest":
        items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case "updated":
        items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case "popular":
      default:
        items.sort((a, b) => b.usageCount - a.usageCount);
        break;
    }

    return items;
  }, [filters]);

  const handleImport = (id: string) => {
    // TODO: Call API to import
    setImported((prev) => new Set([...prev, id]));
    toast.success("Homebrew imported!", {
      description: "Added to your library.",
    });
  };

  const handleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleView = (id: string) => {
    router.push(`/homebrew/${id}`);
  };

  return (
    <HomebrewBrowser
      items={filteredItems}
      loading={loading}
      total={filteredItems.length}
      facets={MOCK_FACETS}
      filters={filters}
      onFilterChange={setFilters}
      onImport={handleImport}
      onFavorite={handleFavorite}
      onView={handleView}
      favorites={favorites}
      imported={imported}
      hasMore={false}
    />
  );
}
