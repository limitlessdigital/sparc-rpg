"use client";

import { useState, useCallback } from "react";
import { CompendiumPage } from "@sparc/ui";

export default function CompendiumPageRoute(): JSX.Element | null {
  // In a real app, these would be fetched from an API or stored in a global state
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  const handleToggleBookmark = useCallback((entryId: string) => {
    setBookmarks((prev) =>
      prev.includes(entryId)
        ? prev.filter((id) => id !== entryId)
        : [...prev, entryId]
    );
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <CompendiumPage
        bookmarks={bookmarks}
        onToggleBookmark={handleToggleBookmark}
      />
    </div>
  );
}
