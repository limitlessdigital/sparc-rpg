import { createClient } from "@/lib/supabase/client";

export interface AdventureMetadata {
  id?: string;
  title: string;
  description: string;
  author: string;
  authorId: string;
  version: string;
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  playerCount: { min: number; max: number };
  estimatedDuration: string;
  coverImage?: string;
  isPublic: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdventureNode {
  id: string;
  type: "scene" | "combat" | "dialogue" | "choice" | "skill_check" | "item";
  title: string;
  content: string;
  connections: Array<{
    targetNodeId: string;
    condition?: string;
    label?: string;
  }>;
  metadata?: Record<string, unknown>;
}

export interface AdventureBundle {
  metadata: AdventureMetadata;
  nodes: AdventureNode[];
  assets: Array<{
    id: string;
    type: "image" | "audio" | "map";
    url: string;
    name: string;
  }>;
  npcs: Array<{
    id: string;
    name: string;
    description: string;
    stats?: Record<string, number>;
  }>;
}

export interface PublishResult {
  success: boolean;
  adventureId?: string;
  publicUrl?: string;
  error?: string;
}

export async function publishAdventure(
  bundle: AdventureBundle
): Promise<PublishResult> {
  const supabase = createClient();

  try {
    // Validate bundle
    if (!bundle.metadata.title || !bundle.nodes.length) {
      return { success: false, error: "Adventure must have a title and at least one node" };
    }

    // Upload adventure metadata
    const { data: adventure, error: metaError } = await supabase
      .from("adventures")
      .upsert({
        id: bundle.metadata.id,
        title: bundle.metadata.title,
        description: bundle.metadata.description,
        author: bundle.metadata.author,
        author_id: bundle.metadata.authorId,
        version: bundle.metadata.version,
        tags: bundle.metadata.tags,
        difficulty: bundle.metadata.difficulty,
        player_count_min: bundle.metadata.playerCount.min,
        player_count_max: bundle.metadata.playerCount.max,
        estimated_duration: bundle.metadata.estimatedDuration,
        cover_image: bundle.metadata.coverImage,
        is_public: bundle.metadata.isPublic,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (metaError) {
      return { success: false, error: `Failed to save metadata: ${metaError.message}` };
    }

    const adventureId = adventure.id;

    // Upload nodes
    const nodesWithAdventureId = bundle.nodes.map((node) => ({
      ...node,
      adventure_id: adventureId,
      connections: JSON.stringify(node.connections),
      metadata: JSON.stringify(node.metadata || {}),
    }));

    const { error: nodesError } = await supabase
      .from("adventure_nodes")
      .upsert(nodesWithAdventureId);

    if (nodesError) {
      return { success: false, error: `Failed to save nodes: ${nodesError.message}` };
    }

    // Upload NPCs
    if (bundle.npcs.length > 0) {
      const npcsWithAdventureId = bundle.npcs.map((npc) => ({
        ...npc,
        adventure_id: adventureId,
        stats: JSON.stringify(npc.stats || {}),
      }));

      const { error: npcsError } = await supabase
        .from("adventure_npcs")
        .upsert(npcsWithAdventureId);

      if (npcsError) {
        console.warn("Failed to save NPCs:", npcsError.message);
      }
    }

    return {
      success: true,
      adventureId,
      publicUrl: bundle.metadata.isPublic
        ? `/adventures/${adventureId}`
        : undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function unpublishAdventure(adventureId: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("adventures")
    .update({ is_public: false })
    .eq("id", adventureId);

  return !error;
}

export async function getPublishedAdventures(
  filters?: {
    difficulty?: string;
    tags?: string[];
    search?: string;
  }
): Promise<AdventureMetadata[]> {
  const supabase = createClient();

  let query = supabase
    .from("adventures")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (filters?.difficulty) {
    query = query.eq("difficulty", filters.difficulty);
  }

  if (filters?.tags?.length) {
    query = query.overlaps("tags", filters.tags);
  }

  if (filters?.search) {
    query = query.ilike("title", `%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch adventures:", error);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    author: row.author,
    authorId: row.author_id,
    version: row.version,
    tags: row.tags,
    difficulty: row.difficulty,
    playerCount: { min: row.player_count_min, max: row.player_count_max },
    estimatedDuration: row.estimated_duration,
    coverImage: row.cover_image,
    isPublic: row.is_public,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function importAdventure(adventureId: string): Promise<AdventureBundle | null> {
  const supabase = createClient();

  // Fetch metadata
  const { data: adventure, error: metaError } = await supabase
    .from("adventures")
    .select("*")
    .eq("id", adventureId)
    .single();

  if (metaError || !adventure) {
    console.error("Failed to fetch adventure:", metaError);
    return null;
  }

  // Fetch nodes
  const { data: nodes, error: nodesError } = await supabase
    .from("adventure_nodes")
    .select("*")
    .eq("adventure_id", adventureId);

  if (nodesError) {
    console.error("Failed to fetch nodes:", nodesError);
    return null;
  }

  // Fetch NPCs
  const { data: npcs } = await supabase
    .from("adventure_npcs")
    .select("*")
    .eq("adventure_id", adventureId);

  return {
    metadata: {
      id: adventure.id,
      title: adventure.title,
      description: adventure.description,
      author: adventure.author,
      authorId: adventure.author_id,
      version: adventure.version,
      tags: adventure.tags,
      difficulty: adventure.difficulty,
      playerCount: { min: adventure.player_count_min, max: adventure.player_count_max },
      estimatedDuration: adventure.estimated_duration,
      coverImage: adventure.cover_image,
      isPublic: adventure.is_public,
      createdAt: adventure.created_at,
      updatedAt: adventure.updated_at,
    },
    nodes: (nodes || []).map((node) => ({
      id: node.id,
      type: node.type,
      title: node.title,
      content: node.content,
      connections: JSON.parse(node.connections || "[]"),
      metadata: JSON.parse(node.metadata || "{}"),
    })),
    assets: [],
    npcs: (npcs || []).map((npc) => ({
      id: npc.id,
      name: npc.name,
      description: npc.description,
      stats: JSON.parse(npc.stats || "{}"),
    })),
  };
}
