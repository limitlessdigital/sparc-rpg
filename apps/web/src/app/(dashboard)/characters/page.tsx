"use client";

import * as React from "react";
import Link from "next/link";
import { 
  Card, CardContent, Button, Avatar, Badge, 
  Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter,
  useToast, SPARC_CLASSES
} from "@sparc/ui";
import { characterService, type CharacterWithAttributes } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

// Attribute color mapping
const attributeColors = {
  might: "bg-might text-white",
  grace: "bg-grace text-white",
  wit: "bg-wit text-white",
  heart: "bg-heart text-white",
};

/**
 * Characters list page - now with Supabase persistence
 * PRD 02: Character management with real database storage
 */
export default function CharactersPage(): JSX.Element | null {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [characters, setCharacters] = React.useState<CharacterWithAttributes[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [deleteTarget, setDeleteTarget] = React.useState<CharacterWithAttributes | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Load characters from Supabase
  React.useEffect(() => {
    async function loadCharacters() {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await characterService.list();
        setCharacters(data);
      } catch (error) {
        console.error("Failed to load characters:", error);
        toast.error("Failed to load characters", {
          description: "Please try refreshing the page.",
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (!authLoading) {
      loadCharacters();
    }
  }, [isAuthenticated, authLoading, toast]);

  // Delete character
  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    setIsDeleting(true);
    try {
      await characterService.delete(deleteTarget.id);
      setCharacters((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      
      toast.success("Character Deleted", {
        description: `${deleteTarget.name} has been removed.`,
      });
    } catch (error) {
      console.error("Failed to delete character:", error);
      toast.error("Failed to delete character", {
        description: "Please try again.",
      });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  // Check character limit
  const canCreate = characters.length < 10;

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-bronze border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Your Characters</h1>
          <p className="text-sm text-muted-foreground">
            Manage your heroes and adventurers
            {characters.length > 0 && (
              <span className="ml-2">
                ({characters.length}/10)
              </span>
            )}
          </p>
        </div>
        <Link href="/characters/new">
          <Button variant="primary" disabled={!canCreate}>
            {canCreate ? "Create Character" : "Character Limit Reached"}
          </Button>
        </Link>
      </div>

      {/* Characters grid */}
      {characters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map((character) => (
            <CharacterCard 
              key={character.id} 
              character={character}
              onDelete={() => setDeleteTarget(character)}
            />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}

      {/* Delete confirmation modal */}
      <Modal 
        open={!!deleteTarget} 
        onClose={() => !isDeleting && setDeleteTarget(null)}
      >
        <ModalHeader>
          <ModalTitle>Delete Character?</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <p>
            Are you sure you want to delete{" "}
            <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button 
            variant="ghost" 
            onClick={() => setDeleteTarget(null)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Character"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

interface CharacterCardProps {
  character: CharacterWithAttributes;
  onDelete: () => void;
}

function CharacterCard({ character, onDelete }: CharacterCardProps) {
  const classInfo = SPARC_CLASSES[character.class];

  return (
    <Link href={`/characters/${character.id}`}>
      <Card interactive className="h-full group relative">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <Avatar 
              src={undefined}
              alt={character.name}
              fallback={classInfo?.icon || character.name.charAt(0)}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold truncate">{character.name}</h3>
                <Badge variant="default" className="text-xs">
                  Lvl {character.level}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {classInfo?.name || character.class}
              </p>
              
              {/* Attributes */}
              <div className="flex gap-2 mt-3">
                {Object.entries(character.attributes).map(([attr, value]) => (
                  <span 
                    key={attr}
                    className={`px-2 py-0.5 rounded text-xs font-medium ${attributeColors[attr as keyof typeof attributeColors]}`}
                    title={attr.charAt(0).toUpperCase() + attr.slice(1)}
                  >
                    {attr.charAt(0).toUpperCase()}{value}
                  </span>
                ))}
              </div>

              {/* HP */}
              <div className="mt-3 flex items-center gap-2 text-sm">
                <span>❤️</span>
                <div className="flex-1 h-2 bg-surface-divider rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-success rounded-full transition-all"
                    style={{ 
                      width: `${(character.hitPoints.current / character.hitPoints.max) * 100}%` 
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {character.hitPoints.current}/{character.hitPoints.max}
                </span>
              </div>

              {/* Last played */}
              {character.lastPlayedAt && (
                <p className="text-xs text-muted-foreground mt-2">
                  Last played: {new Date(character.lastPlayedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Delete button (visible on hover) */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }}
            className="absolute top-2 right-2 p-2 rounded-lg bg-surface-elevated opacity-0 group-hover:opacity-100 hover:bg-error/10 hover:text-error transition-all"
            aria-label={`Delete ${character.name}`}
          >
            🗑️
          </button>
        </CardContent>
      </Card>
    </Link>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <div className="text-6xl mb-4">⚔️</div>
        <h2 className="text-xl font-semibold mb-2">No Characters Yet</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Create your first character to begin your adventure in the world of SPARC!
        </p>
        <Link href="/characters/new">
          <Button variant="primary" size="lg">
            Create Your First Character
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
