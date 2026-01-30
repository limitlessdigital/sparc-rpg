"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card, CardHeader, CardTitle, CardContent,
  Button, Badge, Avatar, Input,
  Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter,
  useToast, SPARC_CLASSES
} from "@sparc/ui";
import { characterService, type CharacterWithAttributes } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

// Attribute styling
const attributeConfig = {
  might: { color: "bg-might", label: "Might", icon: "💪", description: "Physical power and strength" },
  grace: { color: "bg-grace", label: "Grace", icon: "🎯", description: "Agility and precision" },
  wit: { color: "bg-wit", label: "Wit", icon: "🧠", description: "Intelligence and cunning" },
  heart: { color: "bg-heart", label: "Heart", icon: "❤️", description: "Courage and charisma" },
};

/**
 * Character Detail Page
 * PRD 02: View and edit individual character
 */
export default function CharacterDetailPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const characterId = params.id as string;

  // State
  const [character, setCharacter] = React.useState<CharacterWithAttributes | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editName, setEditName] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Load character
  React.useEffect(() => {
    async function loadCharacter() {
      if (!isAuthenticated || !characterId) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await characterService.get(characterId);
        if (data) {
          setCharacter(data);
          setEditName(data.name);
        } else {
          toast.error("Character not found");
          router.push("/characters");
        }
      } catch (error) {
        console.error("Failed to load character:", error);
        toast.error("Failed to load character");
        router.push("/characters");
      } finally {
        setIsLoading(false);
      }
    }

    if (!authLoading) {
      loadCharacter();
    }
  }, [characterId, isAuthenticated, authLoading, router, toast]);

  // Save name edit
  const handleSaveName = async () => {
    if (!character || !editName.trim()) return;

    setIsSaving(true);
    try {
      const updated = await characterService.update(character.id, { name: editName.trim() });
      setCharacter(updated);
      setIsEditing(false);
      toast.success("Name updated!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update name";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete character
  const handleDelete = async () => {
    if (!character) return;

    setIsDeleting(true);
    try {
      await characterService.delete(character.id);
      toast.success("Character deleted");
      router.push("/characters");
    } catch (error) {
      toast.error("Failed to delete character");
      setIsDeleting(false);
    }
  };

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-bronze border-t-transparent rounded-full" />
      </div>
    );
  }

  // No character found
  if (!character) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">Character Not Found</h2>
        <Link href="/characters">
          <Button variant="primary">Back to Characters</Button>
        </Link>
      </div>
    );
  }

  const classInfo = SPARC_CLASSES[character.class];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back link */}
      <Link 
        href="/characters" 
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Back to Characters
      </Link>

      {/* Character Header */}
      <Card>
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <Avatar
              src={undefined}
              alt={character.name}
              fallback={classInfo?.icon || character.name.charAt(0)}
              size="xl"
              className="mx-auto sm:mx-0"
            />

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              {isEditing ? (
                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-xl font-bold"
                    maxLength={50}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="primary" 
                      onClick={handleSaveName}
                      disabled={isSaving || !editName.trim()}
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        setIsEditing(false);
                        setEditName(character.name);
                      }}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                  <h1 className="text-2xl font-bold">{character.name}</h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 rounded hover:bg-surface-elevated transition-colors"
                    title="Edit name"
                  >
                    ✏️
                  </button>
                </div>
              )}

              <div className="flex items-center justify-center sm:justify-start gap-3">
                <span className="text-lg text-muted-foreground">
                  {classInfo?.name || character.class}
                </span>
                <Badge variant="default">Level {character.level}</Badge>
              </div>

              {/* HP Bar */}
              <div className="mt-4 max-w-xs mx-auto sm:mx-0">
                <div className="flex justify-between text-sm mb-1">
                  <span>Hit Points</span>
                  <span>{character.hitPoints.current}/{character.hitPoints.max}</span>
                </div>
                <div className="h-3 bg-surface-divider rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success rounded-full transition-all"
                    style={{
                      width: `${(character.hitPoints.current / character.hitPoints.max) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attributes */}
      <Card>
        <CardHeader>
          <CardTitle>Attributes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(character.attributes).map(([key, value]) => {
              const config = attributeConfig[key as keyof typeof attributeConfig];
              return (
                <div
                  key={key}
                  className={`${config.color} text-white rounded-lg p-4 text-center`}
                >
                  <div className="text-2xl mb-1">{config.icon}</div>
                  <div className="text-3xl font-bold">{value}</div>
                  <div className="text-sm opacity-90">{config.label}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Special Ability */}
      <Card>
        <CardHeader>
          <CardTitle>Special Ability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-surface-elevated rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2">
              ✨ {character.specialAbility.name}
            </h3>
            <p className="text-muted-foreground">
              {character.specialAbility.description}
            </p>
            <p className="text-sm mt-2">
              Uses per encounter: {character.specialAbility.usesPerEncounter}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Equipment */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment</CardTitle>
        </CardHeader>
        <CardContent>
          {character.equipment.length > 0 ? (
            <div className="space-y-2">
              {character.equipment.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-surface-elevated rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {item.type === "weapon" ? "⚔️" : item.type === "armor" ? "🛡️" : "🎒"}
                    </span>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      {item.damage && (
                        <div className="text-sm text-muted-foreground">
                          Damage: +{item.damage}
                        </div>
                      )}
                      {item.defense && (
                        <div className="text-sm text-muted-foreground">
                          Defense: +{item.defense}
                        </div>
                      )}
                    </div>
                  </div>
                  {item.equipped && (
                    <Badge variant="success" className="text-xs">Equipped</Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No equipment yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Metadata & Actions */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground text-center sm:text-left">
              <p>Created: {character.createdAt.toLocaleDateString()}</p>
              {character.lastPlayedAt && (
                <p>Last played: {character.lastPlayedAt.toLocaleDateString()}</p>
              )}
            </div>
            <Button 
              variant="danger" 
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Character
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Modal */}
      <Modal open={showDeleteModal} onClose={() => !isDeleting && setShowDeleteModal(false)}>
        <ModalHeader>
          <ModalTitle>Delete {character.name}?</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <p>
            This will permanently delete <strong>{character.name}</strong> and all their progress.
            This action cannot be undone.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => setShowDeleteModal(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Forever"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
