/**
 * @sparc/ui Compendium System
 * 
 * Based on PRD 21: Compendium & Rules Reference
 * Provides searchable access to all game rules, classes, items, monsters, and more.
 */

// Types
export * from "./types";

// Data & Search
export {
  ALL_ENTRIES,
  getEntryById,
  getEntriesByType,
  searchEntries,
  getEntryBySlug,
  getEntriesByCategory,
  getEntriesBySubcategory,
  getRelatedEntries,
  getCategoryStats,
  getSearchSuggestions,
  getRecentlyUpdated,
} from "./data/search";

export { CLASSES } from "./data/classes";
export { ITEMS } from "./data/items";
export { MONSTERS } from "./data/monsters";
export { ABILITIES } from "./data/abilities";
export { CONDITIONS } from "./data/conditions";
export { RULES } from "./data/rules";

// Components
export { CompendiumSearch } from "./CompendiumSearch";
export type { CompendiumSearchProps } from "./CompendiumSearch";

export { CompendiumCategories, CompendiumSubcategories } from "./CompendiumCategories";
export type { CompendiumCategoriesProps, CompendiumSubcategoriesProps } from "./CompendiumCategories";

export { CompendiumEntryCard } from "./CompendiumEntryCard";
export type { CompendiumEntryCardProps } from "./CompendiumEntryCard";

export { CompendiumEntryDetail } from "./CompendiumEntryDetail";
export type { CompendiumEntryDetailProps } from "./CompendiumEntryDetail";

export { CompendiumTooltip, processCompendiumLinks } from "./CompendiumTooltip";
export type { CompendiumTooltipProps } from "./CompendiumTooltip";

export { QuickReferenceCard, PinnedCardsContainer } from "./QuickReferenceCard";
export type { QuickReferenceCardProps, PinnedCardsContainerProps } from "./QuickReferenceCard";

export { CompendiumPage } from "./CompendiumPage";
export type { CompendiumPageProps } from "./CompendiumPage";
