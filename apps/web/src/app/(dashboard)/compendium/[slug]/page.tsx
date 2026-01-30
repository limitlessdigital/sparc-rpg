"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { 
  getEntryBySlug, 
  CompendiumEntryDetail, 
  getEntryById,
  type CompendiumEntry 
} from "@sparc/ui";
import { Button } from "@sparc/ui";

export default function CompendiumEntryPage(): JSX.Element | null {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [entry, setEntry] = useState<CompendiumEntry | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    const foundEntry = getEntryBySlug(slug);
    setEntry(foundEntry || null);
  }, [slug]);

  const handleNavigate = useCallback((entryId: string) => {
    const targetEntry = getEntryById(entryId);
    if (targetEntry) {
      router.push(`/compendium/${targetEntry.slug}`);
    }
  }, [router]);

  const handleBack = useCallback(() => {
    router.push("/compendium");
  }, [router]);

  if (!entry) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-stone-200 mb-2">Entry Not Found</h1>
          <p className="text-stone-400 mb-6">
            The compendium entry "{slug}" could not be found.
          </p>
          <Button onClick={handleBack}>
            ← Back to Compendium
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={handleBack}
        className="text-amber-400 hover:text-amber-300 mb-6 flex items-center gap-1"
      >
        ← Back to Compendium
      </button>

      <CompendiumEntryDetail
        entry={entry}
        onNavigate={handleNavigate}
        isBookmarked={isBookmarked}
        onToggleBookmark={() => setIsBookmarked(!isBookmarked)}
        isPinned={isPinned}
        onTogglePin={() => setIsPinned(!isPinned)}
        className="max-w-4xl mx-auto"
      />
    </div>
  );
}
