import { AdventureNode, NodeConnection, AdventureExport, ValidationResult, AdventureState } from './types';
import { ValidationEngine } from './ValidationEngine';

export interface AdventureMetadata {
  id: string;
  title: string;
  author: string;
  description: string;
  version: number;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  estimatedPlaytime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isPublic: boolean;
  thumbnail?: string;
}

export interface AdventureData {
  metadata: AdventureMetadata;
  nodes: AdventureNode[];
  connections: NodeConnection[];
  startNodeId: string;
  validationResult: ValidationResult;
  playerStats?: {
    timesPlayed: number;
    averageRating: number;
    completionRate: number;
  };
}

export interface AdventureVersion {
  id: string;
  adventureId: string;
  version: number;
  data: AdventureData;
  changeLog: string;
  createdAt: number;
  createdBy: string;
}

export class DataManager {
  private validationEngine: ValidationEngine;

  constructor() {
    this.validationEngine = new ValidationEngine();
  }

  // Generate unique adventure ID
  generateAdventureId(): string {
    return `adv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate unique version ID
  generateVersionId(): string {
    return `ver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Create new adventure with metadata
  createAdventure(
    title: string,
    author: string,
    description: string = '',
    options: Partial<AdventureMetadata> = {}
  ): AdventureData {
    const metadata: AdventureMetadata = {
      id: this.generateAdventureId(),
      title,
      author,
      description,
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: [],
      estimatedPlaytime: 30, // minutes
      difficulty: 'beginner',
      isPublic: false,
      ...options
    };

    // Create a basic starting node
    const startNode: AdventureNode = {
      id: `node_${Date.now()}`,
      type: 'story',
      position: { x: 0, y: 0 },
      properties: {
        title: 'Adventure Start',
        content: { text: 'Welcome to your adventure! Edit this node to begin crafting your story.' },
        objectives: [],
        experience: 0
      },
      validationState: 'warning',
      connections: {
        inputs: [{ id: 'input', label: 'Input', position: { x: -1, y: 0 } }],
        outputs: [{ id: 'output', label: 'Continue', position: { x: 1, y: 0 } }]
      }
    };

    const adventure: AdventureData = {
      metadata,
      nodes: [startNode],
      connections: [],
      startNodeId: startNode.id,
      validationResult: this.validationEngine.validateAdventure([startNode], []),
      playerStats: {
        timesPlayed: 0,
        averageRating: 0,
        completionRate: 0
      }
    };

    return adventure;
  }

  // Save adventure to localStorage
  saveAdventure(adventure: AdventureData): void {
    try {
      // Update metadata
      adventure.metadata.updatedAt = Date.now();
      
      // Re-validate before saving
      adventure.validationResult = this.validationEngine.validateAdventure(
        adventure.nodes,
        adventure.connections
      );

      const serialized = JSON.stringify(adventure);
      localStorage.setItem(`adventure_${adventure.metadata.id}`, serialized);
      
      // Update adventure index
      this.updateAdventureIndex(adventure.metadata);
    } catch (error) {
      console.error('Failed to save adventure:', error);
      throw new Error('Could not save adventure. Storage may be full.');
    }
  }

  // Load adventure from localStorage
  loadAdventure(adventureId: string): AdventureData | null {
    try {
      const serialized = localStorage.getItem(`adventure_${adventureId}`);
      if (!serialized) return null;

      const adventure: AdventureData = JSON.parse(serialized);
      
      // Validate loaded data
      if (!this.validateAdventureData(adventure)) {
        console.warn('Loaded adventure data is invalid');
        return null;
      }

      return adventure;
    } catch (error) {
      console.error('Failed to load adventure:', error);
      return null;
    }
  }

  // List all saved adventures
  listAdventures(): AdventureMetadata[] {
    try {
      const indexData = localStorage.getItem('adventure_index');
      if (!indexData) return [];

      const index: AdventureMetadata[] = JSON.parse(indexData);
      return index.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch (error) {
      console.error('Failed to load adventure index:', error);
      return [];
    }
  }

  // Delete adventure
  deleteAdventure(adventureId: string): boolean {
    try {
      localStorage.removeItem(`adventure_${adventureId}`);
      
      // Remove from index
      const index = this.listAdventures();
      const updatedIndex = index.filter(meta => meta.id !== adventureId);
      localStorage.setItem('adventure_index', JSON.stringify(updatedIndex));
      
      // Delete all versions
      this.deleteAllVersions(adventureId);
      
      return true;
    } catch (error) {
      console.error('Failed to delete adventure:', error);
      return false;
    }
  }

  // Duplicate adventure
  duplicateAdventure(sourceAdventureId: string, newTitle: string): AdventureData | null {
    const sourceAdventure = this.loadAdventure(sourceAdventureId);
    if (!sourceAdventure) return null;

    // Create new metadata
    const newMetadata: AdventureMetadata = {
      ...sourceAdventure.metadata,
      id: this.generateAdventureId(),
      title: newTitle,
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // Generate new node IDs to avoid conflicts
    const nodeIdMap = new Map<string, string>();
    const newNodes = sourceAdventure.nodes.map(node => {
      const newId = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      nodeIdMap.set(node.id, newId);
      return {
        ...node,
        id: newId
      };
    });

    // Update connection references
    const newConnections = sourceAdventure.connections.map(conn => ({
      ...conn,
      id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sourceNodeId: nodeIdMap.get(conn.sourceNodeId) || conn.sourceNodeId,
      targetNodeId: nodeIdMap.get(conn.targetNodeId) || conn.targetNodeId
    }));

    const duplicatedAdventure: AdventureData = {
      metadata: newMetadata,
      nodes: newNodes,
      connections: newConnections,
      startNodeId: nodeIdMap.get(sourceAdventure.startNodeId) || sourceAdventure.startNodeId,
      validationResult: this.validationEngine.validateAdventure(newNodes, newConnections),
      playerStats: {
        timesPlayed: 0,
        averageRating: 0,
        completionRate: 0
      }
    };

    this.saveAdventure(duplicatedAdventure);
    return duplicatedAdventure;
  }

  // Export adventure for sharing
  exportAdventure(adventureId: string): AdventureExport | null {
    const adventure = this.loadAdventure(adventureId);
    if (!adventure) return null;

    const exportData: AdventureExport = {
      meta: {
        title: adventure.metadata.title,
        authorId: adventure.metadata.author,
        version: adventure.metadata.version,
        estimatedPlaytime: adventure.metadata.estimatedPlaytime,
        difficulty: adventure.metadata.difficulty
      },
      nodes: adventure.nodes,
      connections: adventure.connections,
      startNodeId: adventure.startNodeId,
      validationState: adventure.validationResult
    };

    return exportData;
  }

  // Import adventure from export data
  importAdventure(exportData: AdventureExport, importOptions: {
    title?: string;
    author: string;
    overwriteExisting?: boolean;
  }): AdventureData | null {
    try {
      const adventure = this.createAdventure(
        importOptions.title || exportData.meta.title,
        importOptions.author,
        `Imported adventure by ${exportData.meta.authorId}`,
        {
          difficulty: exportData.meta.difficulty,
          estimatedPlaytime: exportData.meta.estimatedPlaytime
        }
      );

      // Replace default content with imported data
      adventure.nodes = exportData.nodes;
      adventure.connections = exportData.connections;
      adventure.startNodeId = exportData.startNodeId;

      // Re-validate imported data
      adventure.validationResult = this.validationEngine.validateAdventure(
        adventure.nodes,
        adventure.connections
      );

      this.saveAdventure(adventure);
      return adventure;
    } catch (error) {
      console.error('Failed to import adventure:', error);
      return null;
    }
  }

  // Version management
  createVersion(adventureId: string, changeLog: string = '', createdBy: string = 'user'): AdventureVersion | null {
    const adventure = this.loadAdventure(adventureId);
    if (!adventure) return null;

    const version: AdventureVersion = {
      id: this.generateVersionId(),
      adventureId,
      version: adventure.metadata.version,
      data: JSON.parse(JSON.stringify(adventure)), // Deep clone
      changeLog,
      createdAt: Date.now(),
      createdBy
    };

    // Save version
    try {
      const versions = this.listVersions(adventureId);
      versions.push(version);
      localStorage.setItem(`adventure_versions_${adventureId}`, JSON.stringify(versions));
      
      return version;
    } catch (error) {
      console.error('Failed to create version:', error);
      return null;
    }
  }

  // List versions for an adventure
  listVersions(adventureId: string): AdventureVersion[] {
    try {
      const versionsData = localStorage.getItem(`adventure_versions_${adventureId}`);
      if (!versionsData) return [];

      const versions: AdventureVersion[] = JSON.parse(versionsData);
      return versions.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('Failed to load versions:', error);
      return [];
    }
  }

  // Restore from version
  restoreFromVersion(versionId: string): AdventureData | null {
    try {
      // Find the version across all adventures
      const adventures = this.listAdventures();
      
      for (const meta of adventures) {
        const versions = this.listVersions(meta.id);
        const version = versions.find(v => v.id === versionId);
        
        if (version) {
          // Increment version number
          version.data.metadata.version += 1;
          version.data.metadata.updatedAt = Date.now();
          
          this.saveAdventure(version.data);
          return version.data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Failed to restore from version:', error);
      return null;
    }
  }

  // Delete all versions for an adventure
  private deleteAllVersions(adventureId: string): void {
    try {
      localStorage.removeItem(`adventure_versions_${adventureId}`);
    } catch (error) {
      console.error('Failed to delete versions:', error);
    }
  }

  // Generate adventure file for download
  generateDownloadFile(adventureId: string, format: 'json' | 'md' = 'json'): { filename: string; content: string; mimeType: string } {
    const adventure = this.loadAdventure(adventureId);
    if (!adventure) {
      throw new Error('Adventure not found');
    }

    if (format === 'json') {
      const exportData = this.exportAdventure(adventureId);
      return {
        filename: `${this.sanitizeFilename(adventure.metadata.title)}.adventure.json`,
        content: JSON.stringify(exportData, null, 2),
        mimeType: 'application/json'
      };
    } else {
      // Generate markdown documentation
      const content = this.generateMarkdownDocumentation(adventure);
      return {
        filename: `${this.sanitizeFilename(adventure.metadata.title)}.md`,
        content,
        mimeType: 'text/markdown'
      };
    }
  }

  // Calculate storage usage
  getStorageInfo(): {
    totalAdventures: number;
    totalSize: number;
    availableSpace: number;
    largestAdventure: { id: string; size: number } | null;
  } {
    let totalSize = 0;
    let largestAdventure: { id: string; size: number } | null = null;
    
    const adventures = this.listAdventures();
    
    adventures.forEach(meta => {
      const adventureData = localStorage.getItem(`adventure_${meta.id}`);
      if (adventureData) {
        const size = new Blob([adventureData]).size;
        totalSize += size;
        
        if (!largestAdventure || size > largestAdventure.size) {
          largestAdventure = { id: meta.id, size };
        }
      }
    });

    // Estimate available space (5MB limit for localStorage)
    const maxStorage = 5 * 1024 * 1024; // 5MB
    const availableSpace = Math.max(0, maxStorage - totalSize);

    return {
      totalAdventures: adventures.length,
      totalSize,
      availableSpace,
      largestAdventure
    };
  }

  // Utility methods
  private updateAdventureIndex(metadata: AdventureMetadata): void {
    const index = this.listAdventures();
    const existingIndex = index.findIndex(meta => meta.id === metadata.id);
    
    if (existingIndex >= 0) {
      index[existingIndex] = metadata;
    } else {
      index.push(metadata);
    }
    
    localStorage.setItem('adventure_index', JSON.stringify(index));
  }

  private validateAdventureData(adventure: AdventureData): boolean {
    return !!(
      adventure.metadata &&
      adventure.nodes &&
      adventure.connections &&
      adventure.startNodeId &&
      Array.isArray(adventure.nodes) &&
      Array.isArray(adventure.connections)
    );
  }

  private sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/_+/g, '_');
  }

  private generateMarkdownDocumentation(adventure: AdventureData): string {
    const { metadata, nodes, connections, validationResult } = adventure;
    
    let md = `# ${metadata.title}\n\n`;
    md += `**Author:** ${metadata.author}\n`;
    md += `**Difficulty:** ${metadata.difficulty}\n`;
    md += `**Estimated Playtime:** ${metadata.estimatedPlaytime} minutes\n`;
    md += `**Last Updated:** ${new Date(metadata.updatedAt).toLocaleDateString()}\n\n`;
    
    if (metadata.description) {
      md += `## Description\n${metadata.description}\n\n`;
    }
    
    md += `## Adventure Statistics\n`;
    md += `- **Total Nodes:** ${nodes.length}\n`;
    md += `- **Total Connections:** ${connections.length}\n`;
    md += `- **Story Nodes:** ${nodes.filter(n => n.type === 'story').length}\n`;
    md += `- **Decision Points:** ${nodes.filter(n => n.type === 'decision').length}\n`;
    md += `- **Challenges:** ${nodes.filter(n => n.type === 'challenge').length}\n`;
    md += `- **Combat Encounters:** ${nodes.filter(n => n.type === 'combat').length}\n`;
    md += `- **Skill Checks:** ${nodes.filter(n => n.type === 'check').length}\n\n`;
    
    md += `## Validation Status\n`;
    if (validationResult.isValid) {
      md += `✅ **Valid** - Adventure is ready to play!\n`;
    } else {
      md += `❌ **Invalid** - ${validationResult.errors.length} error(s) need fixing\n`;
    }
    if (validationResult.warnings.length > 0) {
      md += `⚠️ ${validationResult.warnings.length} warning(s)\n`;
    }
    md += '\n';
    
    md += `## Adventure Flow\n`;
    nodes.forEach(node => {
      md += `### ${node.properties.title || `${node.type} Node`}\n`;
      md += `**Type:** ${node.type}\n`;
      
      if (node.type === 'story') {
        const props = node.properties as any;
        if (props.content?.text) {
          md += `**Content:** ${props.content.text.replace(/<[^>]*>/g, '')}\n`;
        }
      }
      
      const outgoing = connections.filter(c => c.sourceNodeId === node.id);
      if (outgoing.length > 0) {
        md += `**Connections:**\n`;
        outgoing.forEach(conn => {
          const target = nodes.find(n => n.id === conn.targetNodeId);
          md += `- ${conn.sourcePort} → ${target?.properties.title || target?.type || 'Unknown'}\n`;
        });
      }
      
      md += '\n';
    });
    
    return md;
  }
}