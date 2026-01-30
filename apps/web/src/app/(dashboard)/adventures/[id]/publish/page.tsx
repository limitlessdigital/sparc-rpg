"use client";

/**
 * Adventure Publish Page
 * 
 * Publish flow for adventures. Allows setting metadata,
 * preview, and managing published versions.
 * Based on PRD 12: Publishing System
 */

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  Button,
  useToast,
  PublishFlow,
  validateAdventure,
  type Adventure,
  type PublishMetadata,
  type PublishValidation,
  type VersionHistoryItem,
} from "@sparc/ui";

// Storage key prefix for adventures
const STORAGE_KEY = "sparc-adventure-";
const PUBLISH_KEY = "sparc-published-";

// Load adventure from localStorage
function loadAdventure(id: string): Adventure | null {
  if (typeof window === "undefined") return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY + id);
    if (stored) {
      return JSON.parse(stored) as Adventure;
    }
  } catch (e) {
    console.error("Failed to load adventure:", e);
  }
  
  return null;
}

// Load published data from localStorage
function loadPublishedData(id: string): PublishedData | null {
  if (typeof window === "undefined") return null;
  
  try {
    const stored = localStorage.getItem(PUBLISH_KEY + id);
    if (stored) {
      return JSON.parse(stored) as PublishedData;
    }
  } catch (e) {
    console.error("Failed to load published data:", e);
  }
  
  return null;
}

// Save published data to localStorage
function savePublishedData(id: string, data: PublishedData): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(PUBLISH_KEY + id, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save published data:", e);
  }
}

interface PublishedData {
  isPublished: boolean;
  metadata: PublishMetadata;
  currentVersion: string;
  versions: VersionHistoryItem[];
  publishedAt: string;
}

// Create default metadata from adventure
function createDefaultMetadata(adventure: Adventure): PublishMetadata {
  return {
    title: adventure.title || "Untitled Adventure",
    description: adventure.description || "",
    coverImageUrl: undefined,
    tags: [],
    difficulty: "intermediate",
    visibility: "private",
    recommendedPlayers: {
      min: 1,
      max: 6,
    },
  };
}

// Convert validation result to PublishValidation
function toPublishValidation(result: ReturnType<typeof validateAdventure>): PublishValidation {
  return {
    isValid: result.isValid,
    canPublish: result.canPublish,
    errors: result.errors.map((e) => e.message),
    warnings: result.warnings.map((w) => w.message),
  };
}

export default function PublishPage(): JSX.Element | null {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const adventureId = params.id as string;
  
  // State
  const [adventure, setAdventure] = React.useState<Adventure | null>(null);
  const [publishedData, setPublishedData] = React.useState<PublishedData | null>(null);
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);
  
  // Load adventure and published data on mount
  React.useEffect(() => {
    const loaded = loadAdventure(adventureId);
    const published = loadPublishedData(adventureId);
    
    if (loaded) {
      setAdventure(loaded);
    }
    if (published) {
      setPublishedData(published);
    }
    setIsLoaded(true);
  }, [adventureId]);
  
  // Validation result
  const validationResult = adventure ? validateAdventure(adventure) : null;
  const validation = validationResult ? toPublishValidation(validationResult) : {
    isValid: false,
    canPublish: false,
    errors: ["Adventure not found"],
    warnings: [],
  };
  
  // Initial metadata
  const initialMetadata: PublishMetadata = publishedData?.metadata || 
    (adventure ? createDefaultMetadata(adventure) : {
      title: "",
      description: "",
      tags: [],
      difficulty: "intermediate",
      visibility: "private",
      recommendedPlayers: { min: 1, max: 6 },
    });
  
  // Handlers
  const handlePublish = async (metadata: PublishMetadata) => {
    if (!adventure) return;
    
    setIsPublishing(true);
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const isFirstPublish = !publishedData?.isPublished;
      const newVersion = isFirstPublish 
        ? "1.0.0" 
        : incrementVersion(publishedData?.currentVersion || "1.0.0");
      
      const newPublishedData: PublishedData = {
        isPublished: true,
        metadata,
        currentVersion: newVersion,
        versions: [
          ...(publishedData?.versions || []).map(v => ({ ...v, isCurrent: false })),
          {
            version: newVersion,
            publishedAt: new Date().toISOString(),
            changelog: isFirstPublish ? "Initial release" : "Update",
            isCurrent: true,
          },
        ],
        publishedAt: publishedData?.publishedAt || new Date().toISOString(),
      };
      
      // Save to localStorage
      savePublishedData(adventureId, newPublishedData);
      setPublishedData(newPublishedData);
      
      toast.success(
        isFirstPublish ? "Adventure published!" : "Adventure updated!",
        {
          description: isFirstPublish
            ? "Your adventure is now live."
            : `Updated to version ${newVersion}`,
        }
      );
    } catch (error) {
      toast.error("Failed to publish", {
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsPublishing(false);
    }
  };
  
  const handleUnpublish = async () => {
    setIsPublishing(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      if (publishedData) {
        const updatedData = {
          ...publishedData,
          isPublished: false,
          metadata: {
            ...publishedData.metadata,
            visibility: "private" as const,
          },
        };
        savePublishedData(adventureId, updatedData);
        setPublishedData(updatedData);
      }
      
      toast.success("Adventure unpublished", {
        description: "Your adventure is now private.",
      });
    } catch (error) {
      toast.error("Failed to unpublish");
    } finally {
      setIsPublishing(false);
    }
  };
  
  const handleUpdateVersion = async (changelog: string) => {
    if (!publishedData) return;
    
    setIsPublishing(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const newVersion = incrementVersion(publishedData.currentVersion);
      const updatedData: PublishedData = {
        ...publishedData,
        currentVersion: newVersion,
        versions: [
          ...publishedData.versions.map(v => ({ ...v, isCurrent: false })),
          {
            version: newVersion,
            publishedAt: new Date().toISOString(),
            changelog,
            isCurrent: true,
          },
        ],
      };
      
      savePublishedData(adventureId, updatedData);
      setPublishedData(updatedData);
      
      toast.success(`Published v${newVersion}`, {
        description: changelog || "New version is now live.",
      });
    } catch (error) {
      toast.error("Failed to publish update");
    } finally {
      setIsPublishing(false);
    }
  };
  
  const handleRollback = async (version: string) => {
    toast.info("Rollback", {
      description: `Rollback to v${version} would be implemented with backend.`,
    });
  };
  
  const handleCancel = () => {
    router.push(`/adventures/editor/${adventureId}`);
  };
  
  // Loading state
  if (!isLoaded) {
    return (
      <div className="h-[calc(100vh-10rem)] flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }
  
  // Adventure not found
  if (!adventure) {
    return (
      <div className="h-[calc(100vh-10rem)] flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold mb-2">Adventure Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The adventure you&apos;re trying to publish doesn&apos;t exist or hasn&apos;t been saved.
            </p>
            <Button onClick={() => router.push("/adventures")}>
              Back to Adventures
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="h-[calc(100vh-10rem)] p-4">
      <Card className="h-full">
        <CardContent className="h-full p-6">
          <PublishFlow
            adventureId={adventureId}
            initialMetadata={initialMetadata}
            isPublished={publishedData?.isPublished || false}
            currentVersion={publishedData?.currentVersion || "1.0.0"}
            versions={publishedData?.versions || []}
            stats={validationResult?.stats}
            authorName="You"
            validation={validation}
            onPublish={handlePublish}
            onUnpublish={handleUnpublish}
            onUpdateVersion={handleUpdateVersion}
            onRollback={handleRollback}
            onCancel={handleCancel}
            isPublishing={isPublishing}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Helper: Increment semantic version patch number
function incrementVersion(version: string): string {
  const parts = version.split(".").map(Number);
  if (parts.length === 3) {
    parts[2]++;
    return parts.join(".");
  }
  return `${version}.1`;
}
