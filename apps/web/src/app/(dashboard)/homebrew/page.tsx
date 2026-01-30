"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  HomebrewLibrary,
  HomebrewBase,
  HomebrewCategory,
  Button,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  useToast,
} from "@sparc/ui";

// Mock data for development
const MOCK_CREATED: HomebrewBase[] = [
  {
    id: "hb_1",
    creatorId: "user_1",
    creatorName: "You",
    name: "Shadow Stalker",
    description: "A creature of pure darkness that hunts from the shadows.",
    tags: ["undead", "shadow", "stealth"],
    category: "monster",
    status: "published",
    visibility: "public",
    currentVersion: "1.2.0",
    versions: [],
    usageCount: 245,
    favoriteCount: 89,
    averageRating: 4.5,
    ratingCount: 32,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
  },
  {
    id: "hb_2",
    creatorId: "user_1",
    creatorName: "You",
    name: "Frostbrand Dagger",
    description: "A blade of eternal ice, forged in the heart of the Northern Wastes.",
    tags: ["ice", "weapon", "rare"],
    category: "item",
    status: "draft",
    visibility: "private",
    currentVersion: "0.1.0",
    versions: [],
    usageCount: 0,
    favoriteCount: 0,
    averageRating: 0,
    ratingCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const MOCK_IMPORTED: (HomebrewBase & { importedAt: string; pinnedVersion?: string })[] = [
  {
    id: "hb_3",
    creatorId: "user_2",
    creatorName: "DragonMaster42",
    name: "Elder Shadow Dragon",
    description: "An ancient dragon corrupted by shadow magic.",
    tags: ["dragon", "boss", "legendary"],
    category: "monster",
    status: "published",
    visibility: "public",
    currentVersion: "2.1.0",
    versions: [],
    usageCount: 1234,
    favoriteCount: 567,
    averageRating: 4.9,
    ratingCount: 234,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    importedAt: new Date().toISOString(),
  },
];

const MOCK_FAVORITES: HomebrewBase[] = [
  {
    id: "hb_4",
    creatorId: "user_3",
    creatorName: "TimeWeaver",
    name: "Chronomancer",
    description: "A time-manipulating mage class.",
    tags: ["time", "wizard", "support"],
    category: "class",
    status: "published",
    visibility: "public",
    currentVersion: "1.0.0",
    versions: [],
    usageCount: 423,
    favoriteCount: 189,
    averageRating: 4.8,
    ratingCount: 67,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
  },
];

export default function HomebrewPage(): JSX.Element | null {
  const router = useRouter();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const handleCreate = (category: HomebrewCategory) => {
    router.push(`/homebrew/create/${category}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/homebrew/edit/${id}`);
  };

  const handleView = (id: string) => {
    router.push(`/homebrew/${id}`);
  };

  const handleDelete = () => {
    if (deleteId) {
      // TODO: Call API to delete
      toast.success("Homebrew deleted", {
        description: "Your homebrew has been moved to trash.",
      });
      setDeleteId(null);
    }
  };

  const handleExport = (_id: string, format: 'json' | 'pdf') => {
    // TODO: Implement export
    toast.info(`Exporting as ${format.toUpperCase()}`, {
      description: "Your download will begin shortly.",
    });
  };

  const handleUnpin = (_id: string) => {
    // TODO: Call API to unpin
    toast.success("Version unpinned", {
      description: "You will now receive updates for this homebrew.",
    });
  };

  const handleRemoveImport = (_id: string) => {
    // TODO: Call API to remove
    toast.success("Import removed", {
      description: "Homebrew removed from your library.",
    });
  };

  return (
    <>
      <HomebrewLibrary
        created={MOCK_CREATED}
        imported={MOCK_IMPORTED}
        favorites={MOCK_FAVORITES}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={(id) => setDeleteId(id)}
        onExport={handleExport}
        onUnpin={handleUnpin}
        onRemoveImport={handleRemoveImport}
      />

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)}>
        <ModalHeader>
          <ModalTitle>Delete Homebrew?</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <p className="text-muted-foreground">
            Are you sure you want to delete this homebrew? If it&apos;s published, 
            it will be archived instead of deleted so existing users can still access it.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
